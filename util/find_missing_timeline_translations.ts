import fs from 'fs';
import path from 'path';

import { Lang } from '../resources/languages';
import NetRegexes from '../resources/netregexes';
import { UnreachableCode } from '../resources/not_reached';
import Regexes from '../resources/regexes';
import { AnonNetRegexParams, translateRegexBuildParamAnon } from '../resources/translations';
import { LooseTriggerSet } from '../types/trigger';
import {
  commonReplacement,
  partialCommonTimelineReplacementKeys,
} from '../ui/raidboss/common_replacement';
import { TimelineParser, TimelineReplacement } from '../ui/raidboss/timeline_parser';

import { ErrorFuncType } from './find_missing_translations';

const isKeyOf = <T>(key: unknown, obj: T): key is keyof T => {
  if (typeof obj !== 'object' || obj === null)
    return false;
  if (Array.isArray(obj))
    return false;
  if (typeof key !== 'string')
    return false;
  if (obj === null)
    return false;
  return (key in obj);
};

const asKeyOf = <T>(key: unknown, obj: T): keyof T | undefined => {
  if (!isKeyOf(key, obj))
    return undefined;
  return key;
};

// Set a global flag to mark regexes for NetRegexes.doesNetRegexNeedTranslation.
// See details in that function for more information.
NetRegexes.setFlagTranslationsNeeded(true);

export const findMissing = async (
  triggersFile: string,
  locale: Lang,
  errorFunc: ErrorFuncType,
): Promise<void> => {
  // Hackily assume that any file with a txt file of the same name is a trigger/timeline.
  const timelineFile = triggersFile.replace(/\.[jt]s$/, '.txt');
  if (!fs.existsSync(timelineFile))
    return;

  const timelineText = fs.readFileSync(timelineFile).toString();
  const timeline = new TimelineParser(timelineText, [], [], []);

  const importPath = `../${path.relative(process.cwd(), triggersFile).replace(/\\/g, '/')}`;

  // Dynamic imports don't have a type, so add type assertion.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const triggerSet = (await import(importPath)).default as LooseTriggerSet;
  const translations = triggerSet.timelineReplace;

  let trans: TimelineReplacement = {
    replaceSync: {},
    replaceText: {},
    locale: locale,
  };
  let transBlockFound = false;

  for (const transBlock of translations ?? []) {
    if (!transBlock.locale || transBlock.locale !== locale)
      continue;
    trans = transBlock;
    transBlockFound = true;
    break;
  }

  if (translations === undefined) {
    errorFunc(
      triggersFile,
      undefined,
      'replaceSection',
      locale,
      `missing timelineReplace section`,
    );
    return;
  } else if (!transBlockFound) {
    errorFunc(
      triggersFile,
      undefined,
      'replaceSection',
      locale,
      `missing locale entry in timelineReplace section`,
    );
    return;
  }

  const missingTimeline = findMissingTimeline(
    timelineFile,
    triggersFile,
    triggerSet,
    timeline,
    trans,
    locale,
    errorFunc,
  );
  const missingTrigger = findMissingTriggers(
    triggersFile,
    triggerSet,
    translations ?? [],
    locale,
    errorFunc,
  );

  const missingAnything = missingTimeline || missingTrigger;
  if (!missingAnything && trans.missingTranslations) {
    errorFunc(
      triggersFile,
      undefined,
      'other',
      locale,
      `missingTranslations set true when not needed`,
    );
  }
};

const findMissingTimeline = (
  timelineFile: string,
  triggersFile: string,
  triggerSet: LooseTriggerSet,
  timeline: TimelineParser,
  trans: TimelineReplacement,
  locale: Lang,
  errorFunc: ErrorFuncType,
): boolean => {
  // Don't bother translating timelines that are old.
  if (triggerSet.timelineNeedsFixing)
    return false;

  // TODO: merge this with test_timeline.js??
  const testCases = [
    {
      type: 'replaceSync',
      items: new Set(
        timeline.syncStarts.map((x) => ({ text: x.origInput, line: x.lineNumber })),
      ),
      replace: trans.replaceSync || {},
      label: 'sync',
    },
    {
      type: 'replaceText',
      items: new Set(timeline.events.map((x) => ({ text: x.text, line: x.lineNumber }))),
      replace: trans.replaceText || {},
      label: 'text',
    },
  ] as const;

  const skipPartialCommon = true;

  // Add all common replacements, so they can be checked for collisions as well.
  for (const testCase of testCases) {
    const common = commonReplacement[testCase.type];
    for (const [key, value] of Object.entries(common)) {
      if (skipPartialCommon && partialCommonTimelineReplacementKeys.includes(key))
        continue;
      const transValue = value[trans.locale];
      if (transValue === undefined) {
        // To avoid throwing a "missing translation" error for
        // every single common translation, automatically add noops.
        testCase.replace[key] = key;
        continue;
      }

      if (key in testCase.replace) {
        errorFunc(
          triggersFile,
          undefined,
          'other',
          locale,
          `duplicated common translation of '${key}`,
        );
        continue;
      }

      testCase.replace[key] = transValue;
    }
  }

  const ignore = timeline.GetMissingTranslationsToIgnore();
  const isIgnored = (x: string) => {
    for (const ig of ignore) {
      if (x.match(ig))
        return true;
    }
    return false;
  };

  const output: {
    [key: string]: [
      string,
      number | undefined,
      'sync' | 'text',
      Lang,
      string,
    ];
  } = {};

  for (const testCase of testCases) {
    for (const item of testCase.items) {
      const origInput = item.text;
      let errorStr: string | undefined;
      if (typeof origInput === 'string') {
        let matched = false;
        if (isIgnored(origInput))
          continue;
        for (const regex in testCase.replace) {
          if (!origInput.match(Regexes.parse(regex))) {
            matched = true;
            break;
          }
        }
        if (!matched)
          errorStr = `"${origInput}"`;
      } else {
        const result = translateRegexBuildParamAnon(origInput, locale, [trans]);
        const missingFields = result.missingFields;
        if (!result.wasTranslated && missingFields !== undefined) {
          const outputObj: { [key: string]: AnonNetRegexParams['string'] } = {};
          for (const field of missingFields) {
            const fieldAsKey = asKeyOf(field, origInput);
            if (fieldAsKey === undefined)
              throw new UnreachableCode();
            outputObj[fieldAsKey] = origInput[fieldAsKey];
          }
          errorStr = JSON.stringify(outputObj);
        }
      }

      if (errorStr !== undefined) {
        // Because we handle syncs separately from texts, in order to
        // sort them all properly together, create a key to be used with sort().
        const sortKey = String(item.line).padStart(8, '0') + testCase.label;
        output[sortKey] = [
          timelineFile,
          item.line,
          testCase.label,
          locale,
          errorStr,
        ];
      }
    }
  }

  const keys = Object.keys(output).sort();
  for (const key of keys) {
    const value = output[key];
    if (value)
      errorFunc(...value);
  }

  return keys.length !== 0;
};

const findMissingTriggers = (
  triggersFile: string,
  triggerSet: LooseTriggerSet,
  translations: TimelineReplacement[],
  locale: Lang,
  errorFunc: ErrorFuncType,
): boolean => {
  let missing = false;
  for (const trigger of triggerSet.triggers ?? []) {
    if (trigger.type === undefined || trigger.disabled === true)
      continue;
    if (trigger.netRegex instanceof RegExp || typeof trigger.netRegex !== 'object')
      continue;

    const result = translateRegexBuildParamAnon(trigger.netRegex ?? {}, locale, translations);
    if (result.wasTranslated)
      continue;

    const anonParams: AnonNetRegexParams = trigger.netRegex;

    for (const field of result.missingFields ?? []) {
      missing = true;
      const triggerIdStr = trigger.id ?? '???';
      const fieldValueStr = JSON.stringify(anonParams[field]);
      errorFunc(
        triggersFile,
        // Hard to find the line number, sorry.
        // TODO: we could borrow the logic from raidboss_config.ts here
        // and do a text fragment with the uri encoded trigger id.
        // We could also just search for the line number in yet another
        // parsing TypeScript with regex sort of way.
        undefined,
        'sync',
        locale,
        `trigger id "${triggerIdStr}" missing timelineReplace replaceSync for field "${field}" with value ${fieldValueStr}`,
      );
    }
  }

  return missing;
};
