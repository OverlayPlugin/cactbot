import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import * as core from '@actions/core';

import logDefinitions, { LogDefinitionName } from '../resources/netlog_defs';

import { walkDirSync } from './file_utils';

// This script parses all raidboss triggers and timelines, finds log line types used in them,
// and compares against `netlog_defs.ts` to find any types that are not presently being included
// in the log splitter's analysis filter (based on the `analysisOptions.include` property).
// If the property is absent, this script will create it and set it to 'all'.

// If the type should be ignored by this script (despite being used), `include` can instead be set
// to 'never' -- which is identical to 'none' but suppresses this script's functionality.
// Alternatively, the type can be set to 'filter' if only certain lines of that type should be
// included in the analysis filter. See `netlog_defs.ts` for more information.

// This script can be run via CLI as `npm run update-logdefs`.  If run via GitHub Actions (after a
// triggering merge commit), the workflow will automatically create a PR to merge any changes.

// TODO: This could be expanded to check for oopsy triggers as well, but those are complex to parse
// and there is low likelihood of a type being used in oopsy while not being used in any trigger or
// timeline; and an even lower likelihood of that type being useful for future log analysis.

const isGithubRunner = process.env.GITHUB_ACTIONS === 'true';
const sha = process.env.GITHUB_SHA ?? 'main';
const repo = process.env.GITHUB_REPOSITORY ?? 'OverlayPlugin/cactbot';
const baseUrl = `https://github.com/${repo}/blob`;
const raidbossRelDir = 'ui/raidboss/data';
const netLogDefsFile = 'resources/netlog_defs.ts';

// TODO: Perhaps these keywords should be imported? (Also used in mocha tests.)
const timelineKeywords = [
  'duration',
  'window',
  'jump',
  'forcejump',
];

type FileList = {
  timelines: string[];
  triggers: string[];
};

type FileMatch = {
  filename: string;
  line: number;
};

type FileMatches = Partial<Record<LogDefinitionName, FileMatch[]>>;

class LogDefUpdater {
  private scriptFile = '';
  private projectRoot = '';
  private fileList: FileList;
  // List of log line names that do not have any analysisOptions in netlog_defs
  private logDefsNoInclude: LogDefinitionName[] = [];
  // List of log line names that have analysisOptions.include = 'never'
  // We don't update these, but collect usage so we can console.log() a notice about it
  private logDefsNeverInclude: LogDefinitionName[] = [];
  // Matches of non-included log line types found in triggers & timelines
  // Keep them separate so we can slightly tweak the PR body output for each
  private triggerMatches: FileMatches = {};
  private timelineMatches: FileMatches = {};
  // List of log line names that are being added to the analysis filter
  private logDefsToUpdate: LogDefinitionName[] = [];

  constructor() {
    this.scriptFile = fileURLToPath(import.meta.url);
    this.projectRoot = path.resolve(path.dirname(this.scriptFile), '..');

    this.logDefsNoInclude = Object.values(logDefinitions).filter((def) =>
      !('analysisOptions' in def)
    ).map((def) => def.name);

    this.logDefsNeverInclude = Object.values(logDefinitions).filter((def) =>
      ('analysisOptions' in def) && def.analysisOptions.include === 'never'
    ).map((def) => def.name);

    this.fileList = this.getFileList();
  }

  isLogDefinitionName(type: string | undefined): type is LogDefinitionName {
    return type !== undefined && type in logDefinitions;
  }

  buildRefUrl(file: string, line: number, sha: string, addExtraLine: boolean): string {
    return addExtraLine
      // for triggers, return an extra line in the URL to also display the trigger's netregex
      ? `${baseUrl}/${sha}/${file}#L${line}-L${line + 1}`
      // for timelines, the netregex is on the same line, so no need to include the extra line
      : `${baseUrl}/${sha}/${file}#L${line}`;
  }

  buildPullRequestBodyContent(): string {
    let output = '';
    for (const type of this.logDefsNoInclude) {
      const triggerMatches = this.triggerMatches[type] ?? [];
      const timelineMatches = this.timelineMatches[type] ?? [];
      if (triggerMatches.length === 0 && timelineMatches.length === 0)
        continue;
      output += `\n## \`${type}\`\n`;
      triggerMatches.forEach((m) => {
        output += `${this.buildRefUrl(m.filename, m.line, sha, true)}\n`;
      });
      timelineMatches.forEach((m) => {
        output += `${this.buildRefUrl(m.filename, m.line, sha, false)}\n`;
      });
    }
    return output;
  }

  processAndLogResults(): void {
    // log results to the console for both CLI & GH workflow execution
    for (const type of this.logDefsNoInclude) {
      const matches = [
        ...this.triggerMatches[type] ?? [],
        ...this.timelineMatches[type] ?? [],
      ];
      if (matches.length === 0)
        continue;

      console.log(`** ${type} **`);
      console.log(`Found non-included log line type in active use:`);

      matches.forEach((m) => {
        console.log(`  - ${m.filename}:${m.line}`);
      });

      console.log(`LOG DEFS UPDATED: ${type} is being added to the analysis filter.\n`);
      this.logDefsToUpdate.push(type);
    }

    // Log a notice for 'never' log line types, just so we're aware of the usage count for each.
    // In theory, these are set to 'never' because we really don't care about them for analysis,
    // but a periodic reminder to re-evaluate never hurts.
    for (const type of this.logDefsNeverInclude) {
      const numMatches = (this.triggerMatches[type]?.length ?? 0) +
        (this.timelineMatches[type]?.length ?? 0);
      if (numMatches > 0) {
        console.log(`** ${type} **`);
        console.log(
          `Found ${numMatches} active use(s) of suppressed ('never') log line type.`,
        );
        console.log(
          `${type} will not be added to the analysis filter, but please consider whether updates are needed.\n`,
        );
      }
    }
  }

  getFileList(): FileList {
    const fileList: FileList = {
      timelines: [],
      triggers: [],
    };

    walkDirSync(path.posix.join(this.projectRoot, raidbossRelDir), (filepath) => {
      if (/\/raidboss_manifest.txt/.test(filepath)) {
        return;
      }
      if (/\/raidboss\/data\/.*\.txt/.test(filepath)) {
        fileList.timelines.push(filepath);
        return;
      }
      if (/\/raidboss\/data\/.*\.[jt]s/.test(filepath)) {
        fileList.triggers.push(filepath);
        return;
      }
    });

    return fileList;
  }

  parseTriggerFile(file: string): void {
    // We could dynamically import each trigger file and get the type from triggerSet,
    // but we would lose the line number, which we need to pass the URL to the PR body,
    // so just use regex to parse the file instead.

    const contents = fs.readFileSync(file).toString();
    const lines = contents.split(/\r*\n/);
    const fileRegex = {
      inTrSet: /^const triggerSet: TriggerSet<Data> = {/,
      inTrArr: /^ {2}triggers: \[/,
      inTrObj: /^ {4}\{/,
      trType: /^ {6}type: '(?<type>[^']+)',$/,
      outTrObj: /^ {4}\},/,
      outTrArr: /^ {2}\],/,
    };

    let lineNum = 0;
    let foundTriggerSet = false;
    let foundTriggerArr = false;
    let foundTrigger = false;
    let insideTriggerObj = false;
    let foundType = false;

    for (const line of lines) {
      ++lineNum;

      if (line.match(fileRegex.inTrSet))
        foundTriggerSet = true;
      else if (foundTriggerSet && line.match(fileRegex.inTrArr)) {
        foundTriggerArr = true;
      } else if (foundTriggerArr && line.match(fileRegex.inTrObj)) {
        insideTriggerObj = true;
        foundTrigger = true;
      } else if (insideTriggerObj && !foundType) {
        const match = fileRegex.trType.exec(line);
        const type = match?.groups?.type;
        if (type !== undefined) {
          foundType = true;
          if (!this.isLogDefinitionName(type)) {
            console.error(`ERROR: Missing log def for ${type} in ${file} (line: ${lineNum})`);
            continue;
          } else if (
            this.logDefsNoInclude.includes(type) ||
            this.logDefsNeverInclude.includes(type)
          )
            (this.triggerMatches[type] ??= []).push({
              filename: file.replace(`${this.projectRoot}/`, ''),
              line: lineNum,
            });
        }
      } else if (foundType && line.match(fileRegex.outTrObj)) {
        insideTriggerObj = false;
        foundType = false;
      } else if (foundTriggerArr && line.match(fileRegex.outTrArr))
        break;
    }

    if (!foundTriggerSet || !foundTriggerArr || !foundTrigger)
      console.error(`ERROR: Could not find triggers in ${file}`);
  }

  parseTimelineFile(file: string): void {
    // TimelineParser doesn't have a convenient method for extracting an entry's type,
    // so just process the file with regex.

    const contents = fs.readFileSync(file).toString();
    const lines = contents.split(/\r*\n/);
    const fileRegex = {
      ignoreLine: /^(#|hideall).*$/,
      entrySeparator: /"[^"]*"|\{[^}]*\}|[^ ]+/g,
    };
    // TODO: Should this live somewhere else as an export?
    const noSyncKeywords = ['label'];

    let lineNum = 0;
    for (const line of lines) {
      ++lineNum;
      if (
        line.match(fileRegex.ignoreLine) ||
        line.length === 0
      ) {
        continue;
      }

      // Capture each part of the line (separated by spaces).
      // Anything encapsulated by double-quotes or braces will be treated as a single element.
      const bareLine = line.replace(/"[^"]*?"/g, '""').replace(/#.*$/, '').trim();
      const lineParts = bareLine.match(fileRegex.entrySeparator);
      if (lineParts === null) {
        continue;
      }

      const [time, name, type] = lineParts;
      if (time === undefined || isNaN(parseFloat(time)))
        console.error(`ERROR: Could not parse timeline in ${file} at line ${lineNum}`);
      else if (
        // We only care about sync entries with a netregex param
        // So if this is a no-sync entry or a sync with keywords only, skip it
        name === undefined ||
        noSyncKeywords.includes(name) ||
        type === undefined ||
        timelineKeywords.includes(type)
      )
        continue;
      else if (!this.isLogDefinitionName(type))
        console.error(`ERROR: Missing log def for ${type} in ${file} (line: ${lineNum})`);
      else if (
        this.logDefsNoInclude.includes(type) ||
        this.logDefsNeverInclude.includes(type)
      )
        (this.timelineMatches[type] ??= []).push({
          filename: file.replace(`${this.projectRoot}/`, ''),
          line: lineNum,
        });
    }
  }

  updateNetLogDefsFile(): void {
    if (this.logDefsNoInclude.length === 0)
      return;

    const contents = fs.readFileSync(path.posix.join(this.projectRoot, netLogDefsFile)).toString();
    const lines = contents.split(/\r*\n/);
    const fileRegex = {
      inConst: /^const latestLogDefinitions = {/,
      inLogDef: /^ {2}(\w+): \{/,
      outLogDef: /^ {2}\},/,
      outConst: /^} as const;/,
    };

    const output: string[] = [];
    let foundConst = false;
    let insideConst = false;
    let insideLogDef = false;
    let updateThisLogDef = false;

    for (const line of lines) {
      // initial processing - haven't found the logdefs yet
      if (!foundConst) {
        if (line.match(fileRegex.inConst)) {
          foundConst = true;
          insideConst = true;
        }
        output.push(line);
        continue;
      }

      // we're done updating, so just write the rest of the file
      if (!insideConst) {
        output.push(line);
        continue;
      }

      // looking for the next logdef
      if (!insideLogDef) {
        const logDefName = line.match(fileRegex.inLogDef)?.[1];
        if (logDefName !== undefined && this.isLogDefinitionName(logDefName)) {
          insideLogDef = true;
          if (this.logDefsToUpdate.includes(logDefName))
            updateThisLogDef = true;
        }
      } else if (line.match(fileRegex.outLogDef)) {
        // at the end of the logdef; update it now if needed
        insideLogDef = false;
        if (updateThisLogDef) {
          const objToAdd = `    analysisOptions: {\r\n      include: 'all',\r\n    },`;
          output.push(objToAdd);
          updateThisLogDef = false;
        }
      } else if (insideConst && line.match(fileRegex.outConst))
        insideConst = false;

      output.push(line);
    }

    fs.writeFileSync(path.posix.join(this.projectRoot, netLogDefsFile), output.join('\r\n'));
  }

  doUpdate(): void {
    console.log('Processing trigger files...');
    this.fileList.triggers.forEach((f) => this.parseTriggerFile(f));

    console.log('Processing timeline files...');
    this.fileList.timelines.forEach((f) => this.parseTimelineFile(f));

    console.log('File processing complete.\r\n');

    this.processAndLogResults();
    this.updateNetLogDefsFile();

    if (isGithubRunner)
      core.setOutput('changelist', this.buildPullRequestBodyContent());
  }
}

const updater = new LogDefUpdater();
updater.doUpdate();
