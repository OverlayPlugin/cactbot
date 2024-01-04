import path from 'path';

import { LocaleObject } from '../types/trigger';

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

// SS- (minions) and SS+ (boss) mobs are rank 1 & 3 respectively
// so we can only differentiate them with known BNpcBaseIds
// This requires manual additions for future expansions.
const minionsBNpcBaseIds = [
  '10755', // Forgiven Gossip (ShB) - BNpcNameId: 8916
  '13938', // Ker Shroud (EW) - BNpcNameId: 10616
];
const ssRankBNpcBaseIds = [
  '10422', // Forgiven Rebellion (EW) - BNpcNameId: 8915
  '13775', // Ker (EW) - BNpcNameId: 10615
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

const deLocaleSubstitutions = (replaceString: string): string | string[] => {
  const substitutionMap: { [param: string]: string[] } = {
    '[t]': ['der', 'die', 'das'],
    '[a]': ['e', 'er', 'es'],
    '[A]': ['e', 'er', 'es'],
  };

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
  const cnBNpcNames = await getCnTable('BNpcName', ['#', 'Singular'], ['BNpcNameId', 'LocaleName']);
  const koBNpcNames = await getKoTable('BNpcName', ['#', 'Singular'], ['BNpcNameId', 'LocaleName']);
  return {
    cn: cnBNpcNames,
    ko: koBNpcNames,
  };
};

const assembleData = async (apiData: XivApiNotoriousMonster): Promise<OutputHuntMap> => {
  const formattedData: OutputHuntMap = {};
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

    formattedData[name] = {
      id: nameId,
      name: localeNames,
      rank: rank,
    };
  }

  return formattedData;
};

const api = new XivApi(null, true);

const apiData = await api.queryApi(
  _ENDPOINT,
  _COLUMNS,
) as XivApiNotoriousMonster;

const outputData = await assembleData(apiData);

await api.writeFile(
  path.basename(import.meta.url),
  _HUNT,
  outputData,
);
