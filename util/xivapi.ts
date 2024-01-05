// Helper library for fetching game data from xivapi and
// writing to various resources files.
// See https://xivapi.com

import fs from 'fs';
import path from 'path';

import { exec } from '@actions/exec';
import eslint from 'eslint';
import fetch from 'node-fetch';

import { ConsoleLogger } from './console_logger';

const _XIVAPI_URL = 'https://xivapi.com/';

// Max results returned per query
// see https://xivapi.com/docs/Game-Data
const _XIVAPI_RESULTS_LIMIT = 3000;

// We're using some generic typing because the data format
// will depend on the endpoint used by each script.
type XivApiRecord = {
  [column: string]: unknown;
};

type XivApiOutput = XivApiRecord[];

type XivApiResultData = {
  [key: number]: XivApiRecord;
};

type XivApiResult = {
  Pagination: {
    Page: string | number;
    PageTotal: string | number;
  };
  Results: XivApiResultData;
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

  async queryApi(endpoint: string, columns: string[]): Promise<XivApiResultData> {
    if (endpoint === '')
      this.log.fatalError('Cannot query API: no endpoint specified.');
    if (columns.length === 0)
      this.log.fatalError(`Cannot query API endpoint ${endpoint}: No columns specified.`);

    this.log.debug(`Quering API enpoint: ${endpoint}`);
    this.log.debug(`Columns: ${columns.toString()}`);
    let currentPage = 0;
    let maxPage = 1;
    const output: XivApiOutput = [];
    while (currentPage < maxPage) {
      currentPage++;
      let url = `${_XIVAPI_URL}${endpoint}?limit=${_XIVAPI_RESULTS_LIMIT}&columns=${
        columns.join(',')
      }`;

      if (currentPage !== 1)
        url += `&page=${currentPage}`;

      this.log.debug(`Obtaining page ${currentPage} from API: ${url}`);
      let jsonResult;
      try {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Network error occurred fetching API results.`);
        jsonResult = (await response.json()) as XivApiResult;
        const pageNum = jsonResult.Pagination.Page;
        if (pageNum === null || pageNum === undefined)
          throw new Error(`Invalid data returned from API query.`);
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

      if (currentPage === 1) {
        maxPage = typeof jsonResult.Pagination.PageTotal === 'string'
          ? parseInt(jsonResult.Pagination.PageTotal)
          : jsonResult.Pagination.PageTotal;
        this.log.debug(`API endpoint ${endpoint} has ${maxPage} page(s).`);
      }

      output.push(...Object.values(jsonResult.Results));
    }

    this.log.info(`API query successful for endpoint: ${endpoint}`);

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
    if (
      lintResult === undefined ||
      lintResult.errorCount > 0 ||
      lintResult.warningCount > 0
    ) {
      this.log.fatalError(`eslint failed - automatic fixes not possible, and file not written.`);
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
