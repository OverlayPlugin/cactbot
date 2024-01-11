// A basic CLI tool to query XIVAPI and return Typescript-formatted JSON to the console.
// Accepts -e ENDPOINT -c COLUMNS -f FILTER/S, or they can be specified through inquirer.
// Use `npm run query -- -h` for help on wildcard usage and how to format the FILTER param.

import { Namespace, RawTextHelpFormatter, SubParser } from 'argparse';
import inquirer from 'inquirer';

import { UnreachableCode } from '../resources/not_reached';

import { ConsoleLogger, LogLevelKey, logLevels } from './console_logger';
import { XivApi } from './xivapi';

import { ActionChoiceType } from '.';

const _LOGLEVEL_DEFAULT: LogLevelKey = 'info';

// XIVAPI does not require a ?columns=xx param in the URL string,
// but without one, on a primary endpoint (e.g. Status), it will
// simply return a list of sub-nodes available (e.g. Status/1, Status/2) without meaningful data
// But specifying columns=* actually returns full data for each record in the underlying table.
const _COLUMNS_DEFAULT = '*';

type XivApiColumnValue = string | number | Record<string, unknown> | null;
type XivApiQueryRecord = {
  [column: string]: XivApiColumnValue;
};
type XivApiQueryResult = XivApiQueryRecord[];

type QueryXivApiNamespaceInterface = {
  'endpoint': string | null;
  'columns': string | null;
  'filters': string | null;
  'loglevel': LogLevelKey | null;
};

class QueryXivApiNamespace extends Namespace implements QueryXivApiNamespaceInterface {
  'endpoint': string | null;
  'columns': string | null;
  'filters': string | null;
  'loglevel': LogLevelKey | null;
}

type QueryXivApiInquirerType = {
  [name in keyof QueryXivApiNamespaceInterface]: QueryXivApiNamespaceInterface[name];
};

const includeOps = ['=', '~', '>', '<'] as const;
const excludeOps = ['!=', '!~'] as const;
const allOps = [...includeOps, ...excludeOps] as const;
const arrayValueOps = ['~', '!~'] as const;
const arithmeticOps = ['>', '<'] as const;

type AllOp = typeof allOps[number];
type IncludeOp = typeof includeOps[number];
type ExcludeOp = typeof excludeOps[number];
type ArrayValueOp = typeof arrayValueOps[number];
type ArithmeticOp = typeof arithmeticOps[number];
type IncludeStringsOp = Exclude<IncludeOp, ArithmeticOp>;

type IncludeFilter =
  | {
    column: string;
    op: IncludeOp & ArrayValueOp; // ~
    value: string[];
  }
  | {
    column: string;
    op: Exclude<IncludeOp, ArrayValueOp | ArithmeticOp>; // =
    value: string;
  }
  | {
    column: string;
    op: ArithmeticOp; // <, >
    value: number;
  };

type ExcludeFilter =
  | {
    column: string;
    op: ExcludeOp & ArrayValueOp; // !~
    value: string[];
  }
  | {
    column: string;
    op: Exclude<ExcludeOp, ArrayValueOp>; // !=
    value: string;
  };

type FilterSet = {
  includes: IncludeFilter[];
  excludes: ExcludeFilter[];
};

const isOp = (op: string): op is AllOp => {
  return (allOps as readonly string[]).includes(op);
};

const isIncludeOp = (op: string): op is IncludeOp => {
  return (includeOps as readonly string[]).includes(op);
};

const isArrayValueOp = (op: string): op is ArrayValueOp => {
  return (arrayValueOps as readonly string[]).includes(op);
};

const isArithmeticOp = (op: string): op is ArithmeticOp => {
  return (arithmeticOps as readonly string[]).includes(op);
};

const isIncludeStringsOp = (op: string): op is IncludeStringsOp => {
  return (includeOps.filter((o) => !isArithmeticOp(o)) as readonly string[]).includes(op);
};

const stringToNum = (val: string | number): number | undefined => {
  const dataNum = typeof val === 'number' ? val : parseFloat(val);
  return typeof dataNum === 'number' ? dataNum : undefined;
};

const log = new ConsoleLogger();
log.setLogLevel(_LOGLEVEL_DEFAULT);

// called by inquirer
const queryApiFunc = async (args: Namespace): Promise<void> => {
  if (!(args instanceof QueryXivApiNamespace))
    throw new UnreachableCode();
  const questions = [
    {
      type: 'input',
      name: 'endpoint',
      message: 'Specify XIVAPI endpoint to query: ',
      when: () => args.endpoint === null || args.endpoint === undefined,
    },
    {
      type: 'input',
      name: 'columns',
      message: 'Specify columns/parameters to fetch: ',
      default: _COLUMNS_DEFAULT,
      when: () => args.columns === null || args.columns === undefined,
    },
    {
      type: 'input',
      name: 'filters',
      message: 'Specify filter(s) to apply on resulting data: ',
    },
  ] as const;
  const bottomBar = new inquirer.ui.BottomBar();
  bottomBar.log.write('\nRe-run this script with -h for help with these options.');
  return inquirer.prompt<QueryXivApiInquirerType>(questions)
    .then((answers) => {
      const myEndpoint = answers.endpoint ?? args.endpoint?.toString() ?? '';
      const myColumns = answers.columns ?? args.columns?.toString() ?? _COLUMNS_DEFAULT;
      const myFilters = answers.filters ?? args.filters?.toString() ?? '';
      // args.loglevel returns as an object, rather than a string primitive.
      // so force it here to a string and then re-apply the type with an assertion.
      // parsearg already limits user-input values to the respective type literal.
      const myLogLevel: LogLevelKey = args.loglevel ?? _LOGLEVEL_DEFAULT;
      return queryApi(myEndpoint, myColumns, myFilters, myLogLevel.toString() as LogLevelKey);
    }).catch(console.error);
};

// import for the util master tool
export const registerQueryXivApi = (
  actionChoices: ActionChoiceType,
  subparsers: SubParser,
): void => {
  actionChoices.query = {
    name: 'Query XIVAPI',
    callback: queryApiFunc,
    namespace: QueryXivApiNamespace,
  };

  const queryParser = subparsers.addParser('query', {
    description: actionChoices.query.name,
    formatterClass: RawTextHelpFormatter,
    epilog: `
    ENDPOINT: Specify a single XIVAPI endpoint, e.g. Pet or Status/968.

    COLUMNS:  Specify a comma-separated list of columns. Whitespace is ignored. Use * for all (default).

    FILTER:   If the --filter option is used, it should be in the format [column] [operator] [value].
              Multiple filters must be separated by commas.  * in a [value] acts as a wildcard.
              Any [column] used for filtering must be included in the columns returned from the API.
              Valid [operators] are: =, !=, >, <, ~ (in), !~ (not in).
              For ~ or !~, give a comma-separated list of values inside parentheses, e.g. ~ (123, 456).
              Whitespace is ignored unless it's part of an element in an array-like list.

              Example:  ID > 30, Patch != 88, Name ~ (Topaz Titan, Ruby Carb*)
 `,
  });

  queryParser.addArgument(['-e', '--endpoint'], {
    nargs: 1,
    type: 'string',
    help: 'The name of the XIVAPI endpoint to query',
  });

  queryParser.addArgument(['-c', '--columns'], {
    nargs: 1,
    type: 'string',
    help: 'Columns/parameters to obtain from the endpoint',
  });

  queryParser.addArgument(['-f', '--filter'], {
    nargs: '+',
    type: 'string',
    help: 'Filter(s) to apply on returned data',
  });

  queryParser.addArgument(['-ll', '--loglevel'], {
    nargs: 1,
    type: 'string',
    choices: logLevels.map((ll) => ll[0]),
    help: `The level of console output you want to see (default: ${_LOGLEVEL_DEFAULT})`,
  });
};

const queryApi = async (
  endpoint: string,
  columns: string,
  filters: string,
  loglevel: LogLevelKey,
): Promise<void> => {
  const outputToConsole = (result: XivApiQueryResult): void => {
    log.printNoHeader(JSON.stringify(result, null, 2).replace(/"/g, '\''));
  };

  log.setLogLevel(loglevel);

  const _ENDPOINT = endpoint.trim();
  if (endpoint.length < 1) {
    log.fatalError('No endpoint specified.');
    return;
  }

  const _COLUMNS = columns.replace(/\s+/g, '').split(',').filter((c) => c !== '');
  if (_COLUMNS.length < 1 || _COLUMNS[0] === undefined) {
    log.fatalError('No columns specified.');
    return;
  }

  const api = new XivApi(null, log);

  const apiData = await api.queryApi(
    _ENDPOINT,
    _COLUMNS,
  ) as XivApiQueryResult;

  if (filters === '') {
    log.debug('No filters were specified.');
    if (apiData.length === 0)
      log.printNoHeader('No API data matched your query.');
    else
      outputToConsole(apiData);
  } else {
    log.debug('Applying specified filters to data...');
    const filteredData = applyFilters(apiData, parseFilters(filters));
    if (filteredData.length === 0)
      log.printNoHeader('No API data matched your query & filter conditions.');
    else
      outputToConsole(filteredData);
  }
};

const parseFilters = (filters: string): FilterSet => {
  const parsedFilters: FilterSet = {
    includes: [],
    excludes: [],
  };

  // Filters are comma-separated strings in the format of [colum] [operator] [value].
  // E.g.  ID > 30, ID < 40, Name ~ (Ruby Carbuncle, Obsidian Carbuncle)
  // Whitespace is generally ignored unless inside an array-like element (example above).

  // use commas to seperate different filters, ignoring commas inside () or []
  // match:  ID>30,ID<40 -- don't match:  ID~(30,40)
  const regexFilterSeparator = /(?<![\(\[][\w\s*]+),(?![\w\s*]+[\]\)])/;
  const rawFilters = filters.split(regexFilterSeparator).filter((f) => f !== '');

  const regexColumn = /^\s*(\w+)\s*/;
  const regexOp = new RegExp(`(${allOps.join('|')})`);
  // for regexValueArr, match all alphanumeric values/whitespace/literal-* inside () or []
  // requires 2 comma-separated elements, optionally accepts more
  // match: (30,40) or [Topaz, Obs*, *uby] -- don't match: [10,] or (Emerald)
  const regexValueArr = /\s*[\(\[][\w\s*]+,[\w\s*]+[,\w\s*]*[\)\]]\s*/;
  const regexValueStr = /[\w\s*]+/;
  const regexValueEither = new RegExp(`(${regexValueStr.source}$|${regexValueArr.source}$)`);
  const regexFilterParts = new RegExp(
    `${regexColumn.source}${regexOp.source}${regexValueEither.source}`,
  );

  rawFilters.forEach((rf) => {
    const filterParts = rf.match(regexFilterParts);
    if (filterParts !== null && filterParts.length === 4) {
      const [/* full match */, col, op, val] = filterParts;
      if (col === undefined || op === undefined || val === undefined) {
        log.fatalError(`Could not parse filter: ${rf}.`);
        return;
      }
      if (col === '') {
        log.fatalError(`Invalid column name (${col}) in filter (${rf}).`);
        return;
      }
      if (!isOp(op)) {
        log.fatalError(`Invalid operator (${op}) in filter (${rf}).`);
        return;
      }
      if (val.trim() === '') {
        log.fatalError(`Invalid value (${val}) in filter (${rf}).`);
        return;
      }

      let valArr;
      if (isArrayValueOp(op)) { // ~, !~
        if (val.match(new RegExp(`^${regexValueArr.source}$`)) === null) {
          log.fatalError(
            `Invalid filter type (${rf}) specified for operator (${op}). Must be array-like string list (x,y).`,
          );
          return;
        }
        valArr = val.replace(/[\(\)\[\]]/g, '').trim().split(',').map((e) => e.trim().toString());
        if (valArr.length < 2 || valArr[0] === '') {
          log.fatalError(`Could not extract array from array-like string filter (${rf}).`);
          return;
        }
        if (isIncludeOp(op))
          parsedFilters.includes.push({
            column: col,
            op: op,
            value: valArr,
          });
        else
          parsedFilters.excludes.push({
            column: col,
            op: op,
            value: valArr,
          });
      } else if (isArithmeticOp(op)) { // <, >
        const trimNumVal = stringToNum(val.trim());
        if (trimNumVal === undefined) {
          log.fatalError(`Cannot use numerical operator ('${op}') with text filter (${val}).`);
          return;
        }
        parsedFilters.includes.push({
          column: col,
          op: op,
          value: trimNumVal,
        });
      } else { // =, !=
        const trimVal = val.trim().toString();
        if (trimVal.match(new RegExp(`^${regexValueArr.source}$`)) !== null) {
          log.fatalError(`Cannot use array-like filter (${rf}) with operator (${op}).`);
          return;
        }
        if (isIncludeOp(op))
          parsedFilters.includes.push({
            column: col,
            op: op,
            value: trimVal,
          });
        else
          parsedFilters.excludes.push({
            column: col,
            op: op,
            value: trimVal,
          });
      }
    } else {
      log.fatalError(`Could not parse filter (${rf}).`);
      return;
    }
  });
  return parsedFilters;
};

const applyFilters = (
  data: XivApiQueryResult,
  filters: FilterSet,
): XivApiQueryResult => {
  // Type definitions already ensure that the filter value is appropriate for the operator type.
  // But TypeScript doesn't seem to respect op<->value type limits when typeguarding just the op.
  // So, separately typeguard the value based on the given op.
  const isStringsFilter = (
    str: string | string[] | number,
    op: AllOp,
  ): str is string | string[] => {
    return (allOps.filter((op) => !isArithmeticOp(op)) as readonly string[]).includes(op);
  };

  const isValidRecordData = (data?: XivApiColumnValue): data is string | number | null => {
    // return false if undefined or a non-null pure object (null object is okay)
    return data !== undefined &&
      (
        data === null ||
        (
          typeof data !== 'object' &&
          Object.getPrototypeOf(data) !== Object.prototype
        )
      );
  };

  const matchesWildcardRegex = (filterVal: string, recordData: string) => {
    const valToRegex = (val: string) => val.replace(/([.+?^=!:${}|\-\[\]\/\\])/g, '\\$1');
    return new RegExp(`^${filterVal.split('*').map(valToRegex).join('.*')}$`).test(recordData);
  };

  const textValueMatch = (filters: string | string[], recordLoose: string | number): boolean => {
    const record = recordLoose.toString();
    if (Array.isArray(filters)) {
      if (filters.includes(record))
        return true;
      for (const f of filters) {
        if (f.includes('*') && matchesWildcardRegex(f, record))
          return true;
      }
    } else if (filters === record || matchesWildcardRegex(filters, record))
      return true;
    return false;
  };

  const numValueMatch = (op: ArithmeticOp, filter: number, record: number): boolean => {
    return (op === '>' && record > filter) || (op === '<' && record < filter);
  };

  const filteredData: XivApiQueryResult = [];
  // Process include filters first, then exclude filters.
  // If a record matches both types, it is excluded.
  for (const record of data) {
    // Start by assuming we'll include the record (if no include filters, we move on to excludes).
    let includeRecord = true;
    for (const iFilter of filters.includes) {
      // at least 1 include filter, so loop and each time assume no match until there is one.
      includeRecord = false;
      const column = iFilter.column;
      const op = iFilter.op;
      const filterVal = iFilter.value;
      log.debug(`Checking against include filter: ${column} ${op} ${filterVal.toString()}`);

      // since we don't have a schema for the user's query, recordDataToMatch could be:
      // - a string or number
      // - an object (the column may be a link to another endpoint/table,
      //     in which case XIVAPI will reproduce the associated record as a nested object)
      // - null, if there's no data for that column
      //      (unless that's the filter value, that's OK for excludes, but not OK for includes)
      // - undefined, if the user forgot to include the column in their query
      const recordDataToMatch = record[column];
      if (!isValidRecordData(recordDataToMatch)) { // filter out objects & undefined
        log.fatalError(
          `Cannot apply filter(s) on column ${column}: column not in query set or does not contain a filterable value.`,
        );
        break; // Not necessary, but TypeScript doesn't know that
      }

      // Special case for 'null' - if it's a filter value, check the column for a match
      // otherwise, if not a filter value and the column is null, the include filter fails
      if (recordDataToMatch === null) {
        // treat the record data as a string ('null') for matching,
        // as that's how it would be stored in filters{}.
        if (
          isIncludeStringsOp(op) &&
          isStringsFilter(filterVal, op) &&
          textValueMatch(filterVal, 'null')
        ) {
          log.debug(`Matched include filter for ${column}: Filter: null Record: null`);
          includeRecord = true;
          continue;
        } else {
          includeRecord = false;
          break;
        }
      }

      if (
        isIncludeStringsOp(op) &&
        isStringsFilter(filterVal, op) &&
        textValueMatch(filterVal, recordDataToMatch)
      ) {
        log.debug(
          `Matched include filter for ${column}: (Filter: ${op} ${filterVal.toString()} | Record: ${recordDataToMatch})`,
        );
        includeRecord = true;
      } else if (isArithmeticOp(op) && !isStringsFilter(filterVal, op)) {
        const recordDataToMatchAsNum = stringToNum(recordDataToMatch);
        if (recordDataToMatchAsNum === undefined) {
          log.fatalError(
            `Column value (${column}) is non-numerical, and cannot be used with ${op} operator.`,
          );
          break;
        }
        if (numValueMatch(op, filterVal, recordDataToMatchAsNum)) {
          log.debug(
            `Matched include filter for ${column}: (Filter: ${op} ${filterVal.toString()} | Record: ${recordDataToMatch})`,
          );
          includeRecord = true;
        }
      } else
        log.debug(
          `No match: (Filter: ${op} ${filterVal.toString()} | Record: ${recordDataToMatch}).`,
        );

      // if we haven't passed this filter, no need to continue cheking include filters
      if (includeRecord === false) {
        log.debug('Did not match include filter.');
        break;
      }
    }

    // if we failed somewhere during include filtering, skip this record
    if (includeRecord === false) {
      log.debug('Failed to match all include filters.  Record excluded.');
      continue;
    }

    for (const eFilter of filters.excludes) {
      // conversely to includes, assume we match unless specifically excluded
      includeRecord = true;
      const column = eFilter.column;
      const op = eFilter.op;
      const filterVal = eFilter.value;
      log.debug(`Checking against exclude filter: ${column} ${op} ${filterVal.toString()}`);

      const recordDataToMatch = record[column];
      if (!isValidRecordData(recordDataToMatch)) {
        log.fatalError(
          `Cannot apply filter(s) on column ${column}: column not in query set or does not contain a filterable value.`,
        );
        break; // Not necessary, but TypeScript doesn't know that
      }

      // Special case for 'null' - if it's a filter value, check the column;
      // otherwise, if the column is null, exclude filter passes.
      if (recordDataToMatch === null) {
        // treat the record data as a string ('null') for matching,
        // as that's how it would be stored in filters{}.
        if (textValueMatch(filterVal, 'null')) {
          log.debug(`Matched exlcude filter for ${column}.  Filter: null Record: null.`);
          includeRecord = false;
          break;
        } else {
          includeRecord = true;
          continue;
        }
      }

      if (textValueMatch(filterVal, recordDataToMatch)) {
        log.debug(
          `Matched exclude filter for ${column}: (Filter: ${filterVal.toString()} | Record: ${recordDataToMatch})`,
        );
        includeRecord = false;
        break;
      }
    }

    if (includeRecord) {
      log.debug(`Adding record to dataset.`);
      filteredData.push(record);
    }
  }
  return filteredData;
};
