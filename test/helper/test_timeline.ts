import fs from 'fs';
import path from 'path';

import { assert } from 'chai';

import { keysThatRequireTranslation } from '../../resources/netregexes';
import { UnreachableCode } from '../../resources/not_reached';
import Regexes from '../../resources/regexes';
import { translateWithReplacements } from '../../resources/translations';
import { LooseTimelineTrigger, LooseTriggerSet, TimelineReplacement } from '../../types/trigger';
import { CommonReplacement, commonReplacement } from '../../ui/raidboss/common_replacement';
import { Error, regexes, TimelineParser } from '../../ui/raidboss/timeline_parser';

const parseTimelineFileFromTriggerFile = (filepath: string) => {
  const fileContents = fs.readFileSync(filepath, 'utf8');
  const match = / {2}timelineFile: '(?<timelineFile>.*)',/.exec(fileContents);
  const timelineFile = match?.groups?.timelineFile;
  if (timelineFile === undefined || timelineFile.length === 0)
    throw new Error(`Error: Trigger file ${filepath} has no timelineFile attribute defined`);
  return timelineFile;
};

// syncKeywords must appear on a sync line in the order specified
const syncKewordsOrder = [
  'duration',
  'window',
  'jump',
  'forcejump',
];

// Make all props required
type LintError = Error & {
  lineNumber: number;
  line: string;
};

class TimelineParserLint extends TimelineParser {
  // Track the last sync time during linting to ensure proper order
  private lastSyncTime = 0;
  // Override to stop checking sync order during linting
  private ignoreSyncOrder = false;
  // Capture lint errors separately from TimelineParser's errors so we can do a separate unit test
  public lintErrors: LintError[] = [];

  constructor(
    text: string,
    triggers: LooseTimelineTrigger[],
  ) {
    super(text, [], triggers); // calls TimelineParser's parse() method
    this.lintTimelineFile(text);
  }

  private lintTimelineFile(text: string): void {
    const lines = text.split('\n');
    let lineNumber = 0;
    for (const line of lines) {
      ++lineNumber;

      if (line.includes('#cactbot-timeline-lint-disable-sync-order'))
        this.ignoreSyncOrder = true;
      else if (line.includes('#cactbot-timeline-lint-enable-sync-order'))
        this.ignoreSyncOrder = false;

      if (!line || regexes.comment.test(line))
        continue;

      this.lintLine(line, lineNumber);
    }
  }

  private lintLine(
    line: string,
    lineNumber: number,
  ): void {
    const origLine = line;
    // First, reduce all double-quoted strings to just "".  We don't check/lint string contents,
    // and this avoids various problems like inadvertently matching double-spaces inside a string,
    // or the use of a {} regex occurence modifier causing errors in identifying line groups.
    line = line.replace(/"[^"]*?"/g, '""');

    line = line.replace(/\r/g, ''); // remove \r before checking for extraneous whitespace
    if (line.trim() !== line) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Line has leading or trailing whitespace',
      });
    }
    line = line.trim();

    // Remove in-line comments from further lint checks
    line = line.replace(/#.*$/, '').trim();
    if (line.length === 0)
      return;

    // There should be no remaining allowable double-spacing within the line
    if (line.match(/ {2}.+/)) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Line has double spaces not enclosed by quotes',
      });
      // don't return; continue processing the line
    }

    // Capture each part of the line (separated by spaces).
    // Anything encapsulated by double-quotes or braces will be treated as a single element.
    const lineParts = line.match(/"[^"]*"|\{.*\}|[^ ]+/g);
    if (lineParts === null || lineParts[0] === undefined) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Bad format - cannot parse line into parts for further linting',
      });
      return;
    }

    const first = lineParts[0];
    if (first === 'hideall') {
      // parse() throws errors if a hideall line has an invalid format
      return;
    }

    // At this point, if `first` is not a time, it's not a valid timeline entry
    const time = parseFloat(first);
    if (isNaN(time)) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Line does not begin with a config keyword, comment, or sync time.',
      });
      return;
    }

    // Ensure that the time is either an integer or has a single digit after the decimal
    if (!Number.isInteger(time) && !/^\d+\.\d$/.test(time.toString())) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Sync time must be an integer or a float with a single decimal place',
      });
      // don't return; continue processing the line
    }

    // Enforce chronological order of sync lines
    if (!this.ignoreSyncOrder) {
      if (time < this.lastSyncTime)
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error:
            `Sync time of "${time.toString()}" predates prior entry of "${this.lastSyncTime.toString()}"`,
        });
      else
        this.lastSyncTime = time;
      // don't return; continue processing the line
    }

    const second = lineParts[1];
    if (second === undefined) {
      this.lintErrors.push({
        lineNumber: lineNumber,
        line: origLine,
        error: 'Sync time specified with no other parameters',
      });
      return;
    }
    // parse() throws errors if the label line is invalidly formatted.
    if (second === 'label')
      return;

    // This is a normal timeline entry

    // Some entries may only have a time and name with nothing else.
    // They may also have a duration keyword (and only that keyword).
    // parse() throws errors if a no-sync line has invalid args
    if (lineParts.length === 2)
      return;
    else if (lineParts[2] === 'duration' && lineParts.length === 4)
      return;

    // From this point, we should expect [time] [name] [type] [NetRegex]
    // So just check keyword ordering & values (everything after).
    const keywords = lineParts.slice(4);
    if (keywords.length === 0)
      return;

    // Assume that every keyword comes in a [keyword] [param] format
    // If we ever implement a keyword with no (or multiple) parameters, update this logic
    for (let i = 0; i < keywords.length; i += 2) {
      const thisKeyword = keywords[i];
      if (thisKeyword === undefined)
        throw new UnreachableCode();

      if (!syncKewordsOrder.includes(thisKeyword)) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Keyword "${thisKeyword}" is not valid`,
        });
        return;
      }

      const keywordParam = keywords[i + 1];
      if (keywordParam === undefined) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Missing parameter for "${thisKeyword}" keyword`,
        });
        return;
      }

      if (
        !isNaN(parseFloat(keywordParam)) &&
        keywordParam.endsWith('.0')
      ) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Unnecessary float "${keywordParam}" - use an integer instead.`,
        });
        // don't return; continue processing the line
      }

      // check that `window` is in a [number],[number] format
      if (
        thisKeyword === 'window' &&
        !/^\d+(\.\d)?,\d+(\.\d)?$/.test(keywordParam)
      ) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Invalid 'window' parameter "${keywordParam}": must be in [#],[#] format.`,
        });
        // don't return; continue processing the line
      }

      const nextKeyword = keywords[i + 2];
      if (nextKeyword === undefined)
        break;

      if (!syncKewordsOrder.includes(nextKeyword)) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Cannot validate keyword order - invalid next keyword "${nextKeyword}"`,
        });
        return;
      }

      if (syncKewordsOrder.indexOf(thisKeyword) > syncKewordsOrder.indexOf(nextKeyword)) {
        this.lintErrors.push({
          lineNumber: lineNumber,
          line: origLine,
          error: `Keyword "${thisKeyword}" cannot precede "${nextKeyword}"`,
        });
        return;
      }
    }
    return;
  }
}

type TestFile = {
  timelineFile: string;
  triggersFile: string;
};

const testFiles: TestFile[] = [];

const setup = (timelineFiles: string[]) => {
  timelineFiles.forEach((timelineFile) => {
    // For each timeline file, ensure that its corresponding trigger file is pointing to it.
    const filename = timelineFile.split('/').slice(-1)[0] ?? '';
    const triggerFilenameJS = timelineFile.replace('.txt', '.js');
    const triggerFilenameTS = timelineFile.replace('.txt', '.ts');

    let triggerFile;
    if (fs.existsSync(triggerFilenameJS))
      triggerFile = triggerFilenameJS;
    else if (fs.existsSync(triggerFilenameTS))
      triggerFile = triggerFilenameTS;
    else
      throw new Error(`Error: Timeline file ${timelineFile} found without matching trigger file`);

    const timelineFileFromFile = parseTimelineFileFromTriggerFile(triggerFile);
    if (filename !== timelineFileFromFile) {
      throw new Error(
        `Error: Trigger file ${triggerFile} has \`triggerFile: '${timelineFileFromFile}'\`, but was expecting \`triggerFile: '${filename}'\``,
      );
    }

    testFiles.push({
      timelineFile: timelineFile,
      triggersFile: triggerFile,
    });
  });
};

type ReplaceMap = Map<RegExp, string>;

type TestCase = {
  type: keyof CommonReplacement;
  items: Set<string>;
  replace: ReplaceMap;
  replaceWithoutCommon: ReplaceMap;
};

const getTestCases = (
  triggersFile: string,
  timeline: TimelineParser,
  trans: TimelineReplacement,
) => {
  const syncMap: ReplaceMap = new Map();
  for (const [key, replaceSync] of Object.entries(trans.replaceSync ?? {}))
    syncMap.set(Regexes.parse(key), replaceSync);
  const textMap: ReplaceMap = new Map();
  for (const [key, replaceText] of Object.entries(trans.replaceText ?? {}))
    textMap.set(Regexes.parse(key), replaceText);

  // Add all original regexes to the set of things to do replacement on
  // and add all translatable parameters as well.
  const syncStrings: Set<string> = new Set<string>();
  for (const sync of timeline.syncStarts) {
    if (typeof sync.origInput === 'string') {
      syncStrings.add(sync.origInput);
      continue;
    }
    for (const [key, value] of Object.entries(sync.origInput)) {
      if (!keysThatRequireTranslation.includes(key))
        continue;
      if (typeof value === 'boolean')
        continue;
      if (typeof value === 'object') {
        for (const innerValue of value) {
          if (typeof innerValue === 'boolean')
            continue;
          if (typeof innerValue === 'object') {
            for (const [innerInnerValueKey, innerInnerValueValue] of Object.entries(innerValue)) {
              if (!keysThatRequireTranslation.includes(innerInnerValueKey))
                continue;
              if (Array.isArray(innerInnerValueValue)) {
                for (const innerInnerValueValueEntry of innerInnerValueValue)
                  syncStrings.add(innerInnerValueValueEntry);
              } else {
                syncStrings.add(innerInnerValueValue);
              }
            }
          } else {
            syncStrings.add(innerValue);
          }
        }
      } else {
        syncStrings.add(value);
      }
    }
  }

  const testCases: TestCase[] = [
    {
      type: 'replaceSync',
      items: syncStrings,
      replace: new Map(syncMap),
      replaceWithoutCommon: new Map(syncMap),
    },
    {
      type: 'replaceText',
      items: new Set(timeline.events.map((x) => x.text)),
      replace: new Map(textMap),
      replaceWithoutCommon: new Map(textMap),
    },
  ];

  // Add all common replacements, so they can be checked for collisions as well.
  for (const testCase of testCases) {
    const common = commonReplacement[testCase.type];
    for (const [key, localeText] of Object.entries(common)) {
      const regexKey = Regexes.parse(key);
      const transText = localeText[trans.locale];
      if (transText === undefined) {
        // To avoid throwing a "missing translation" error for
        // every single common translation, automatically add noops.
        testCase.replace.set(regexKey, key);
        continue;
      }
      if (testCase.replace.has(regexKey)) {
        assert.fail(
          `${triggersFile}:locale ${trans.locale}:common replacement '${key}' found in ${testCase.type}`,
        );
      }
      testCase.replace.set(regexKey, transText);
    }
  }

  return testCases;
};

const testTimelineFiles = (timelineFiles: string[]): void => {
  describe('timeline test', () => {
    setup(timelineFiles);

    for (const testFile of testFiles) {
      describe(`${testFile.timelineFile}`, () => {
        // Capture the test file params in scoped variables so that they are not changed
        // by the testFiles loop during the async `before` function below.
        const timelineFile = testFile.timelineFile;
        const triggersFile = testFile.triggersFile;
        let timelineText;
        let triggerSet: LooseTriggerSet;
        let timeline: TimelineParserLint;

        before(async () => {
          // Normalize path
          const importPath = `../../${
            path.relative(process.cwd(), triggersFile).replace('.ts', '.js')
          }`;
          timelineText = String(fs.readFileSync(timelineFile));

          // Dynamic imports don't have a type, so add type assertion.
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          triggerSet = (await import(importPath)).default as LooseTriggerSet;
          timeline = new TimelineParserLint(
            timelineText,
            triggerSet.timelineTriggers ?? [],
          );
        });
        // This test loads an individual raidboss timeline and makes sure
        // that timeline.js can parse it without errors.
        it('should load without errors', () => {
          for (const e of timeline.errors) {
            if (e.line !== undefined && e.lineNumber !== undefined)
              assert.isNull(e, `${timelineFile}:${e.lineNumber}:${e.error}:${e.line}`);
            else
              assert.isNull(e, `${timelineFile}:${e.error}`);
          }
        });
        it('should use netregex parameter style', () => {
          // Incorrect: 8.0 "Crackle Hiss" sync / 1[56]:[^:]*:Imdugud:B55:/
          //   Correct: 8.0 "Crackle Hiss" Ability { id: "B55", source: "Imdugud" }
          for (const sync of timeline.syncStarts) {
            assert.strictEqual(sync.regexType, 'net');
          }
        });
        it('should not have translation conflicts', () => {
          const translations = triggerSet.timelineReplace;
          if (!translations)
            return;

          for (const trans of translations) {
            const locale = trans.locale;
            // TODO: maybe this needs to be in the triggers test instead
            assert.isDefined(locale, `${triggersFile}: missing locale in translation block`);

            // Note: even if translations are missing, they should not have conflicts.
            const testCases = getTestCases(triggersFile, timeline, trans);

            // For both texts and syncs...
            for (const testCase of testCases) {
              // For every unique replaceable text or sync the timeline knows about...
              for (const orig of testCase.items) {
                // For every translation for that timeline...

                // Do a first pass to find which regexes, if any will apply to orig.
                type TranslateMatch = [RegExp, string, string];
                const translateMatches: TranslateMatch[] = [];
                for (const [regex, replaceText] of testCase.replace) {
                  const replaced = orig.replace(regex, replaceText);
                  if (orig === replaced)
                    continue;
                  translateMatches.push([regex, replaceText, replaced]);
                }

                // Now do a second O(n^2) pass, only against regexes which apply.
                for (const [regex, replaceText, replaced] of translateMatches) {
                  // If we get here, then |regex| is a valid replacement in |orig|.
                  // The goal is to ensure via testing that there are no ordering
                  // constraints in the timeline translations.  To fix these issues,
                  // add negative lookahead/lookbehind assertions to make the regexes unique.

                  // (1) Verify that there is no pre-replacement collision,.
                  // i.e. two regexes that apply to the same text or sync.
                  // e.g. "Holy IV" is affected by both /Holy IV/ and /Holy/.
                  for (const [otherRegex, otherReplaceText, otherReplaced] of translateMatches) {
                    if (regex === otherRegex)
                      continue;

                    // If we get here, then there is a pre-replacement collision.
                    // Verify if these two regexes can be applied in either order
                    // to get the same result, if so, then this collision can be
                    // safely ignored.
                    // e.g. "Magnetism/Repel" is affected by both /Magnetism/ and /Repel/,
                    // however these are independent and could be applied in either order.

                    const otherFirst = otherReplaced.replace(regex, replaceText);
                    const otherSecond = replaced.replace(otherRegex, otherReplaceText);

                    assert.equal(
                      otherFirst,
                      otherSecond,
                      `${triggersFile}:locale ${locale}: pre-translation collision on ${testCase.type} '${orig}' for '${regex.source}' and '${otherRegex.source}'`,
                    );
                  }

                  // (2) Verify that there is no post-replacement collision with this text,
                  // i.e. a regex that applies to the replaced text that another regex
                  // has already modified.  We need to look through everything here
                  // and not just through translateMatches, unfortunately.
                  for (const [otherRegex, otherReplaceText] of testCase.replace) {
                    if (regex === otherRegex)
                      continue;
                    const otherSecond = replaced.replace(otherRegex, otherReplaceText);
                    if (replaced === otherSecond)
                      continue;

                    // If we get here, then there is a post-replacement collision.
                    // Verify if these two regexes can be applied in either order
                    // to get the same result, if so, then this collision can be
                    // safely ignored.
                    let otherFirst = orig.replace(otherRegex, otherReplaceText);
                    otherFirst = otherFirst.replace(regex, replaceText);

                    assert.equal(
                      otherFirst,
                      otherSecond,
                      `${triggersFile}:locale ${locale}: post-translation collision on ${testCase.type} '${orig}' for '${regex.source}' => '${replaced}', then '${otherRegex.source}'`,
                    );
                  }
                }
              }
            }
          }
        });
        it('should not be missing timeline translations', () => {
          const translations = triggerSet.timelineReplace;
          if (!translations)
            return;

          for (const trans of translations) {
            const locale = trans.locale;
            if (!locale)
              continue;
            // English cannot be missing translations and is always a "partial" translation.
            if (locale === 'en')
              continue;

            if (trans.missingTranslations)
              continue;

            const testCases = getTestCases(triggersFile, timeline, trans);

            const ignore = timeline.GetMissingTranslationsToIgnore();
            const isIgnored = (x: string) => {
              for (const ig of ignore) {
                if (ig.test(x))
                  return true;
              }
              return false;
            };

            for (const testCase of testCases) {
              for (const item of testCase.items) {
                if (isIgnored(item))
                  continue;
                assert.isTrue(
                  translateWithReplacements(item, testCase.type, locale, translations)
                    .wasTranslated,
                  `${triggersFile}:locale ${locale}:no translation for ${testCase.type} '${item}'`,
                );
              }
            }
          }
        });
        it('should not have bad characters', () => {
          const translations = triggerSet.timelineReplace;
          if (!translations)
            return;

          for (const trans of translations) {
            const locale = trans.locale;
            if (!locale)
              continue;

            const testCases = getTestCases(triggersFile, timeline, trans);

            // Text should not include ^ or $, unless preceded by \ or [
            const badRegex = [
              /(?<![\\[])[\^\$]/,
            ].map((x) => Regexes.parse(x));

            for (const testCase of testCases) {
              // Don't test the common translations here, as some may include these characters.
              // It's only regexes inside of `timelineReplace` in a trigger file that are
              // the ones that need to be checked.
              for (const regex of testCase.replaceWithoutCommon.keys()) {
                for (const bad of badRegex) {
                  assert.isNull(
                    bad.exec(regex.source),
                    `${triggersFile}:locale ${locale}:invalid character in ${testCase.type} '${regex.source}'`,
                  );
                }
              }
            }
          }
        });
        it('should not have lint errors', () => {
          let errorStr = '';
          for (const err of timeline.lintErrors) {
            errorStr += `\n${err.lineNumber}:${err.error}:${err.line}`;
          }
          assert.isEmpty(errorStr, `${errorStr}\n`);
        });
      });
    }
  });
};

export default testTimelineFiles;
