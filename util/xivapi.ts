// Helper library for fetching game data from xivapi and
// writing to various resources files.
// See https://beta.xivapi.com

// This is now updated to use the xivapi beta API due to the upcoming retirement of the old API.

import fs from 'fs';
import path from 'path';

import { exec } from '@actions/exec';
import eslint from 'eslint';
import fetch from 'node-fetch';

import { ConsoleLogger } from './console_logger';

const _XIVAPI_URL = 'https://v2.xivapi.com/api';

// Max results returned per query
// (Not officially documented for the new beta API, but testing confirms this limit.)
const _XIVAPI_RESULTS_LIMIT = 500;

// We're using some generic typing because the data format
// will depend on the endpoint used by each script.
type XivApiRow = {
  schema?: string; // returned if a specific row is requested
  row_id: number;
  subrow_id?: number;
  fields: { [field: string]: unknown };
};

type XivApiSheet = {
  schema: string;
  rows: XivApiRow[];
};

export type OutputFileAttributes = {
  outputFile: string;
  type: string;
  header: string;
  asConst: boolean;
};

const isObject = (obj: unknown): obj is { [key: string]: unknown } =>
  obj !== null && typeof obj === 'object' && !Array.isArray(obj);

export class XivApi {
  cactbotPath: string;
  log: ConsoleLogger;

  constructor(
    cactbotPath: string | null,
    log?: ConsoleLogger,
  ) {
    this.cactbotPath = cactbotPath ?? '.';
    this.log = log !== undefined ? log : new ConsoleLogger();

    if (!fs.existsSync(this.cactbotPath))
      this.log.fatalError(`Cactbot path does not exist: ${this.cactbotPath}`);

    const cactbotDir = path.resolve(this.cactbotPath).split(path.sep).pop();
    if (cactbotDir !== 'cactbot')
      this.log.fatalError(
        `Invalid cactbot path, or script not run from cacbot dir: ${this.cactbotPath}`,
      );

    this.log.debug(`Using cactbot path: ${this.cactbotPath}`);
  }

  async queryApi(sheet: string, fields: string[]): Promise<XivApiRow[]> {
    if (sheet === '')
      this.log.fatalError('Cannot query API: no sheet specified.');
    if (fields.length === 0)
      this.log.fatalError(`Cannot query API sheet ${sheet}: No fields specified.`);

    this.log.debug(`Quering API enpoint: ${sheet}`);
    this.log.debug(`Fields: ${fields.toString()}`);

    // Because the beta API does not include pagination, loop through the result set,
    // using the 'after' parameter, until we get an empty result set.
    let fetchAgain = true;
    let maxRow = 0;
    let maxSubRow: number | undefined = undefined;
    let currentPage = 0;
    const specificRowRequested = sheet.includes('/');
    const output: XivApiRow[] = [];

    while (fetchAgain) {
      currentPage++;

      let url = `${_XIVAPI_URL}/sheet/${sheet}?limit=${_XIVAPI_RESULTS_LIMIT}&fields=${
        fields.join(',')
      }`;
      if (maxRow > 0) {
        url += `&after=${maxRow}`;
        if (maxSubRow !== undefined)
          url += `:${maxSubRow}`;
      }

      this.log.debug(`Obtaining page ${currentPage} from API: ${sheet}`);

      let jsonResult;

      try {
        const response = await fetch(url);
        jsonResult = (await response.json()) as XivApiSheet | XivApiRow;
        if (!response.ok)
          throw new Error(`Error occurred fetching API results.`);
      } catch (e) {
        this.log.info(JSON.stringify(jsonResult ?? '', null, 2));
        if (e instanceof Error)
          this.log.fatalError(e.message);
        else
          this.log.fatalError('An unknown error occurred fetcing API results.');
      }

      if (jsonResult === undefined) {
        this.log.fatalError('No data returned from API query.');
        process.exit(1); // this is handled by ConsoleLogger, but TypeScript doesn't know that
      }

      if (!specificRowRequested) {
        if (!('rows' in jsonResult)) {
          this.log.fatalError(`Malformed API query result: 'rows' property not present.`);
        } else if (jsonResult.rows.length === 0) {
          // when all rows have been fetched, the API returns a response with an empty `rows` prop
          fetchAgain = false;
        } else {
          const lastRow = jsonResult.rows[jsonResult.rows.length - 1];
          if (lastRow !== undefined) {
            maxRow = lastRow.row_id;
            maxSubRow = lastRow.subrow_id;
            output.push(...jsonResult.rows);
          } else {
            this.log.fatalError('Malformed API query result: last row is undefined.');
          }
        }
      } else { // only a single row is requested
        fetchAgain = false;
        if (!('row_id' in jsonResult))
          this.log.fatalError(`Malformed API query result: Row expected but not returned.`);
        else
          output.push(jsonResult);
      }
    }

    this.log.info(`API query successful - fetched ${output.length} rows from ${sheet}`);
    return output;
  }

  sortObjByKeys(obj: unknown): unknown {
    if (!isObject(obj) || Array.isArray(obj))
      return obj;

    const out = Object
      .keys(obj)
      .sort()
      .reduce((acc: typeof obj, key) => {
        const nested = obj[key];
        if (isObject(nested))
          acc[key] = this.sortObjByKeys(nested);
        else
          acc[key] = nested;

        return acc;
      }, {});
    return out;
  }

  async writeFile(
    scriptName: string,
    file: OutputFileAttributes,
    data: { [s: string]: unknown },
    keysAsStrings?: boolean,
  ): Promise<void> {
    const fullPath = path.join(this.cactbotPath, file.outputFile);
    this.log.debug(`Preparing to write output to ${fullPath}`);

    let str = JSON.stringify(this.sortObjByKeys(data), null, 2);

    // make keys integers, remove leading zeroes.
    if (keysAsStrings === undefined || !keysAsStrings) {
      this.log.debug('Reformatting object key strings to integers.');
      str = str.replace(/['"]0*([0-9]+)['"]: {/g, '$1: {');
    }

    const fileOutput = `// Auto-generated from ${scriptName}
// DO NOT EDIT THIS FILE DIRECTLY
${file.header !== '' ? `\n` : ''}${file.header}
const data${file.type !== '' ? `: ${file.type}` : ' '} = ${str}${file.asConst ? ' as const' : ''};

export default data;`;

    this.log.info('Running eslint on output data...');
    const linter = new eslint.ESLint({ fix: true });
    const results = await linter.lintText(fileOutput, { filePath: fullPath });

    // There's only one result from lintText, as per documentation.
    const lintResult = results[0];
    if (lintResult === undefined) {
      this.log.fatalError(`eslint lint result undefined - file not written.`);
      return; // unnecessary, but Typescript doesn't know that
    }

    if (
      lintResult.errorCount > 0 ||
      lintResult.warningCount > 0
    ) {
      for (const lintMessage of lintResult.messages) {
        this.log.info(`${lintMessage.message}`);
      }
      this.log.fatalError(
        `eslint failed with ${lintResult.errorCount} errors and ${lintResult.warningCount} warnings - automatic fixes not possible, and file not written.`,
      );
      return; // unnecessary, but Typescript doesn't know that
    }

    // Overwrite the file, if it already exists.
    this.log.debug('Creating write stream.');
    const flags = 'w';
    const writer = fs.createWriteStream(fullPath, { flags: flags });
    writer.on('error', (e) => {
      this.log.fatalError(`Could not write ${file.outputFile}: ${e.toString()}`);
    });

    writer.write(lintResult.output);
    this.log.debug('Output file successfully written. Starting dprint...');
    // run through dprint, so we can see a clean diff before merging
    let _stderr = '';
    const dprintOptions = {
      silent: true, // suppress stdout
      listeners: {
        stderr: (data: Buffer) => {
          _stderr += data.toString();
        },
      },
    };

    await exec(`npx dprint fmt ${fullPath}`, [], dprintOptions);

    if (_stderr.length > 0)
      this.log.alert(`Errors during dprint - review file before merging: ${_stderr}`);
    else
      this.log.debug(`Completed dprint successfully.`);

    this.log.info(`Wrote output file: ${file.outputFile}`);
  }
}
