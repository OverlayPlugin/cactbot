import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import * as core from '@actions/core';

import logDefinitions, { LogDefinitionName } from '../resources/netlog_defs';
import { LooseOopsyTriggerSet } from '../types/oopsy';
import { LooseTriggerSet } from '../types/trigger';
import { TimelineParser } from '../ui/raidboss/timeline_parser';

import { walkDirSync } from './file_utils';

// This script parses all raidboss/oopsy triggers and timelines, finds log line types used in them,
// and compares against `netlog_defs.ts` to find any types that are not presently being included
// in the log splitter's analysis filter (based on the `analysisOptions.include` property).
// If the property is absent, this script will create it and set it to 'all'.

// If the type should be ignored by this script (despite being used), `include` can instead be set
// to 'never'. Alternatively, set the type to 'filter' if only certain lines of that type should be
// included in the analysis filter. See `netlog_defs.ts` for more information.

// This script can be run via CLI as `npm run update-logdefs`.  If run via GitHub Actions (after a
// triggering merge commit), the workflow will automatically create a PR to merge any changes.

const isGithubRunner = process.env.GITHUB_ACTIONS === 'true';
const sha = process.env.GITHUB_SHA ?? 'main';
const repo = process.env.GITHUB_REPOSITORY ?? 'OverlayPlugin/cactbot';
const baseUrl = `https://github.com/${repo}/blob`;
const raidbossRelDir = 'ui/raidboss/data';
const oopsyRelDir = 'ui/oopsyraidsy/data';
const netLogDefsFile = 'resources/netlog_defs.ts';

type FileList = {
  timelines: string[];
  triggers: string[];
  oopsy: string[];
};

type FileMatch = {
  filename: string;
  excerptStartLine: number;
  excerptStopLine?: number;
};

type FileMatches = Partial<Record<LogDefinitionName, FileMatch[]>>;

class TimelineTypeExtractor extends TimelineParser {
  public entries: Partial<Record<LogDefinitionName, number[]>> = {};

  constructor(contents: string) {
    // construct parent with waitForParse = true, because `entries` is initialized
    // after parent construction, but is populated by parse() method in parent
    super(contents, [], [], undefined, undefined, undefined, true);
    // we've initialized entries now, so call parse()
    this.parse(contents, [], [], 0);
  }

  public override parseType(type: LogDefinitionName, lineNumber: number) {
    (this.entries[type] ??= []).push(lineNumber);
  }
}

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
  private matches: FileMatches = {};
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

  buildRefUrl(file: string, sha: string, startLine: number, stopLine?: number): string {
    return stopLine
      ? `${baseUrl}/${sha}/${file}#L${startLine}-L${stopLine}`
      : `${baseUrl}/${sha}/${file}#L${startLine}`;
  }

  buildPullRequestBodyContent(): string {
    let output = '';
    for (const type of this.logDefsNoInclude) {
      const matches = this.matches[type] ?? [];
      if (matches.length === 0)
        continue;
      output += `\n## \`${type}\`\n`;
      matches.forEach((m) => {
        output += `${this.buildRefUrl(m.filename, sha, m.excerptStartLine, m.excerptStopLine)}\n`;
      });
    }
    return output;
  }

  processAndLogResults(): void {
    // log results to the console for both CLI & GH workflow execution
    for (const type of this.logDefsNoInclude) {
      const matches = this.matches[type];
      if (matches === undefined || matches.length === 0)
        continue;

      console.log(`** ${type} **`);
      console.log(`Found non-included log line type in active use:`);

      matches.forEach((m) => {
        console.log(`  - ${m.filename}:${m.excerptStartLine}`);
      });

      console.log(`LOG DEFS UPDATED: ${type} is being added to the analysis filter.\n`);
      this.logDefsToUpdate.push(type);
    }

    // Log a notice for 'never' log line types, just so we're aware of the usage count for each.
    // In theory, these are set to 'never' because we really don't care about them for analysis,
    // but a periodic reminder to re-evaluate never hurts.
    for (const type of this.logDefsNeverInclude) {
      const numMatches = (this.matches[type]?.length ?? 0);
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
      oopsy: [],
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

    walkDirSync(path.posix.join(this.projectRoot, oopsyRelDir), (filepath) => {
      if (/\/oopsy_manifest.txt/.test(filepath)) {
        return;
      }
      if (/\/oopsyraidsy\/data\/.*\.[jt]s/.test(filepath)) {
        fileList.oopsy.push(filepath);
        return;
      }
    });

    return fileList;
  }

  async parseTriggerFile(file: string): Promise<void> {
    // Normalize path
    const importPath = `../${path.relative(process.cwd(), file).replace('.ts', '.js')}`;

    // Dynamic imports don't have a type, so add type assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const triggerSet = (await import(importPath)).default as LooseTriggerSet;
    const triggerSetArr = triggerSet.triggers?.entries();
    if (triggerSetArr === undefined)
      console.error(`ERROR: Could not find triggers in ${file}`);

    const contents = fs.readFileSync(file).toString();
    const lines = contents.split(/\r*\n/);

    for (const [index, trigger] of triggerSet.triggers?.entries() ?? []) {
      const id = trigger.id;
      const type: string | undefined = trigger.type; // override literal type from LooseTrigger
      let lineNum = 0;
      let idLine = 0;
      let regexLine = 0;

      if (id === undefined) {
        console.error(`ERROR: Missing trigger id property in ${file} (trigger index: ${index})`);
        continue;
      } else if (type === undefined) {
        console.error(`ERROR: Missing trigger type property for trigger '${id}' in ${file}`);
        continue;
      }

      const escapedId = id.replace(/'/g, '\\\'');
      for (const line of lines) {
        ++lineNum;
        if (line.includes(`id: '${escapedId}',`)) {
          // if we match an id line with one already set, we never found a regex line;
          // in that case exit the loop & report the error
          if (idLine === 0)
            idLine = lineNum;
          else
            break;
        } else if (idLine > 0 && line.includes('netRegex: {')) {
          regexLine = lineNum;
          break;
        }
      }

      if (idLine === 0) {
        console.error(`ERROR: Could not find trigger '${id}' in ${file}`);
        continue;
      } else if (regexLine === 0) {
        console.error(`ERROR: Could not find netRegex for trigger '${id}' in ${file}`);
        continue;
      }

      if (!this.isLogDefinitionName(type)) {
        console.error(`ERROR: Missing log def for ${type} in ${file} (line: ${idLine})`);
        continue;
      } else if (
        this.logDefsNoInclude.includes(type) ||
        this.logDefsNeverInclude.includes(type)
      )
        (this.matches[type] ??= []).push({
          filename: file.replace(`${this.projectRoot}/`, ''),
          excerptStartLine: idLine,
          excerptStopLine: regexLine,
        });
    }
  }

  async parseOopsyFile(file: string): Promise<void> {
    // Oopsy files do not need to have triggers, and their triggers do not need to have types.
    // So this method is a lot more permissive than parseTriggerFile().

    // Normalize path
    const importPath = `../${path.relative(process.cwd(), file).replace('.ts', '.js')}`;

    // Dynamic imports don't have a type, so add type assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const triggerSet = (await import(importPath)).default as LooseOopsyTriggerSet;
    const contents = fs.readFileSync(file).toString();
    const lines = contents.split(/\r*\n/);

    for (const trigger of triggerSet.triggers ?? []) {
      const id = trigger.id;
      const type: string | undefined = trigger.type; // override literal type from LooseTrigger
      let lineNum = 0;
      let idLine = 0;
      let regexLine: number | undefined = 0;

      if (id === undefined || type === undefined)
        continue;

      const escapedId = id.replace(/'/g, '\\\'');
      for (const line of lines) {
        ++lineNum;
        if (line.includes(`id: '${escapedId}',`)) {
          // if we match an id line with one already set, we never found a regex line;
          // in that case exit the loop & move on
          if (idLine === 0)
            idLine = lineNum;
          else
            break;
        } else if (idLine > 0 && line.includes('netRegex: {')) {
          regexLine = lineNum;
          break;
        }
      }

      if (idLine === 0) {
        // Might not have been able to find an id: line because the trigger may be
        // generated dynamically - see aloalo_island.  In that case, just string-search
        // for the naked id by itself (it has to be there somewhere).
        lineNum = 0;
        for (const line of lines) {
          ++lineNum;
          if (line.includes(`'${escapedId}'`)) {
            idLine = lineNum;
            break;
          }
        }
        if (idLine === 0) {
          console.error(`ERROR: Could not find trigger '${id}' in ${file}`);
          continue;
        } else
          regexLine = undefined; // don't try to add lines to the excerpt
      }

      // if we found the id but not the regex, just capture the two lines after the id line
      regexLine = regexLine === 0 ? idLine + 2 : regexLine;

      if (!this.isLogDefinitionName(type)) {
        console.error(`ERROR: Missing log def for ${type} in ${file} (line: ${idLine})`);
        continue;
      } else if (
        this.logDefsNoInclude.includes(type) ||
        this.logDefsNeverInclude.includes(type)
      )
        (this.matches[type] ??= []).push({
          filename: file.replace(`${this.projectRoot}/`, ''),
          excerptStartLine: idLine,
          excerptStopLine: regexLine,
        });
    }
  }

  parseTimelineFile(file: string): void {
    const contents = fs.readFileSync(file).toString();
    const entries = new TimelineTypeExtractor(contents).entries;

    if (entries === undefined) {
      console.error(`ERROR: Could not find timeline sync entries in ${file}`);
      return;
    }

    for (const [type, lineNums] of Object.entries(entries)) {
      if (!this.isLogDefinitionName(type))
        console.error(
          `ERROR: Missing log def for ${type} in ${file} (line: ${lineNums[0] ?? '?'})`,
        );
      else if (
        this.logDefsNoInclude.includes(type) ||
        this.logDefsNeverInclude.includes(type)
      ) {
        for (const lineNum of lineNums) {
          (this.matches[type] ??= []).push({
            filename: file.replace(`${this.projectRoot}/`, ''),
            excerptStartLine: lineNum,
          });
        }
      }
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

  async doUpdate(): Promise<void> {
    console.log('Processing trigger files...');
    for (const f of this.fileList.triggers) {
      await this.parseTriggerFile(f);
    }

    console.log('Processing oopsy files...');
    for (const f of this.fileList.oopsy) {
      await this.parseOopsyFile(f);
    }

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
await updater.doUpdate();
