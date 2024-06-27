import path from 'path';

import { LocaleObject } from '../types/trigger';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { getCnTable, getKoTable } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';

const _HUNT: OutputFileAttributes = {
  outputFile: 'resources/hunt.ts',
  type: 'HuntMap',
  header: `import { LocaleObject } from '../types/trigger';

type LocaleTextOrArray = LocaleObject<string | string[]>;

export type Rank = 'S' | 'SS+' | 'SS-' | 'A' | 'B';

// Optional values are supported in \`Options.CustomMonsters\`.
export type HuntEntry = {
  id: string;
  name: LocaleTextOrArray | string | string[];
  rank?: Rank;
  regex?: RegExp;
  hp?: number;
};

export type HuntMap = {
  [huntName: string]: HuntEntry;
};
`,
  asConst: false,
};

const _ENDPOINT = 'NotoriousMonster';

const _COLUMNS = [
  'ID',
  'Rank',
  'BNpcBase.ID',
  'BNpcName.ID',
  'BNpcName.Name_de',
  'BNpcName.Name_en',
  'BNpcName.Name_fr',
  'BNpcName.Name_ja',
];

type LocaleOutputColumns = [key: string, ...indices: string[]];
const _LOCALE_TABLE = 'BNpcName';
const _LOCALE_INPUT_COLS = ['#', 'Singular'];
const _LOCALE_OUTPUT_COLS: LocaleOutputColumns = ['BNpcNameId', 'LocaleName'];

// SS- (minions) and SS+ (boss) mobs are rank 1 & 3 respectively
// so we can only differentiate them with known BNpcBaseIds
// This requires manual additions for future expansions.
// TODO: These could be automatically detected from `NotoriousMonsterTerritory`?
const minionsBNpcBaseIds = [
  '10755', // Forgiven Gossip (ShB) - BNpcNameId: 8916
  '13938', // Ker Shroud (EW) - BNpcNameId: 10616
  '17777', // Crystal Incarnation (DT) - BNpcNameId: 13407
];
const ssRankBNpcBaseIds = [
  '10422', // Forgiven Rebellion (EW) - BNpcNameId: 8915
  '13775', // Ker (EW) - BNpcNameId: 10615
  '17732', // Arch Aethereater (DT) - BNpcNameId: 13406
];

type LocaleTextOrArray = LocaleObject<string | string[]>;

type Rank = 'S' | 'SS+' | 'SS-' | 'A' | 'B';

type ResultMonsterBNpcName = {
  ID: string | number;
  Name_de: string | null;
  Name_en: string | null;
  Name_fr: string | null;
  Name_ja: string | null;
};

type ResultMonsterBNpcBase = {
  ID: string | number;
};

type ResultMonster = {
  ID: string | number;
  Rank: string | number | null;
  BNpcBase: ResultMonsterBNpcBase;
  BNpcName: ResultMonsterBNpcName;
};

type XivApiNotoriousMonster = ResultMonster[];

type OutputHuntMap = {
  [name: string]: {
    id: string;
    name: LocaleTextOrArray | string | string[];
    rank?: Rank;
  };
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const deLocaleSubstitutions = (replaceString: string): string | string[] => {
  const substitutionMap: { [param: string]: string[] } = {
    '[t]': ['der', 'die', 'das'],
    '[a]': ['e', 'er', 'es'],
    '[A]': ['e', 'er', 'es'],
  };
  log.debug(`Doing 'de' locale substitutions on: ${replaceString}`);
  replaceString = replaceString.replace('[p]', '');
  let results: string[] = [replaceString];

  Object.keys(substitutionMap).forEach((match: string) => {
    const newArray: string[] = [];
    for (const name of results) {
      if (name.includes(match))
        substitutionMap[match]?.forEach((value: string) => {
          newArray.push(name.replace(match, value));
        });
      results = newArray.length > 0 ? newArray : results;
    }
  });

  if (results.length === 1)
    return replaceString;
  return results;
};

const fetchLocaleCsvTables = async () => {
  log.debug(
    `Table: ${_LOCALE_TABLE} | Query columns: [${_LOCALE_INPUT_COLS.toString()}] | Output: [${_LOCALE_OUTPUT_COLS.toString()}]`,
  );
  log.debug('Fetching \'cn\' table...');
  const cnBNpcNames = await getCnTable(_LOCALE_TABLE, _LOCALE_INPUT_COLS, _LOCALE_OUTPUT_COLS);
  log.debug('Fetching \'ko\' table...');
  const koBNpcNames = await getKoTable(_LOCALE_TABLE, _LOCALE_INPUT_COLS, _LOCALE_OUTPUT_COLS);
  return {
    cn: cnBNpcNames,
    ko: koBNpcNames,
  };
};

const assembleData = async (apiData: XivApiNotoriousMonster): Promise<OutputHuntMap> => {
  log.debug('Processing & assembling data...');
  const formattedData: OutputHuntMap = {};
  log.info('Fetching locale CSV tables...');
  const localeCsvTables = await fetchLocaleCsvTables();

  for (const record of apiData) {
    const baseId = typeof record.BNpcBase.ID === 'number'
      ? record.BNpcBase.ID.toString()
      : record.BNpcBase.ID;
    const nameId = typeof record.BNpcName.ID === 'number'
      ? record.BNpcName.ID.toString()
      : record.BNpcName.ID;
    const rankId = typeof record.Rank === 'number'
      ? record.Rank.toString()
      : record.Rank;
    let rank: Rank;

    if (!nameId || !baseId)
      continue;

    const name = record.BNpcName.Name_en ?? '';
    if (name === '')
      continue;

    if (ssRankBNpcBaseIds.includes(baseId))
      rank = 'SS+';
    else if (minionsBNpcBaseIds.includes(baseId))
      rank = 'SS-';
    else if (rankId === '3')
      rank = 'S';
    else if (rankId === '2')
      rank = 'A';
    else
      rank = 'B';

    if (
      record.BNpcName.Name_de === null ||
      record.BNpcName.Name_en === null ||
      record.BNpcName.Name_fr === null ||
      record.BNpcName.Name_ja === null
    )
      continue;

    const localeNames: LocaleTextOrArray = {
      'de': deLocaleSubstitutions(record.BNpcName.Name_de),
      'en': record.BNpcName.Name_en,
      'fr': record.BNpcName.Name_fr,
      'ja': record.BNpcName.Name_ja,
    };

    const cnLocaleEntry = localeCsvTables.cn[nameId];
    let cnLocaleName;
    if (cnLocaleEntry)
      cnLocaleName = cnLocaleEntry['LocaleName'];
    if (typeof cnLocaleName === 'string' && cnLocaleName !== '')
      localeNames['cn'] = cnLocaleName;

    const koLocaleEntry = localeCsvTables.ko[nameId];
    let koLocaleName;
    if (koLocaleEntry)
      koLocaleName = koLocaleEntry['LocaleName'];
    if (typeof koLocaleName === 'string' && koLocaleName !== '')
      localeNames['ko'] = koLocaleName;

    log.debug(`Collected hunt data for ${record.BNpcName.Name_en} (ID: ${nameId})`);
    formattedData[name] = {
      id: nameId,
      name: localeNames,
      rank: rank,
    };
  }
  log.debug('Data assembly/formatting complete.');
  return formattedData;
};

export default async (logLevel: LogLevelKey): Promise<void> => {
  log.setLogLevel(logLevel);
  log.info(`Starting processing for ${_SCRIPT_NAME}`);

  const api = new XivApi(null, log);

  const apiData = await api.queryApi(
    _ENDPOINT,
    _COLUMNS,
  ) as XivApiNotoriousMonster;

  const outputData = await assembleData(apiData);

  await api.writeFile(
    _SCRIPT_NAME,
    _HUNT,
    outputData,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
