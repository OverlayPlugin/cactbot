import path from 'path';

import { cleanName } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';

const _EFFECT_ID: OutputFileAttributes = {
  // Maybe this should be called Status like the table, but everything else
  // says gain/lose effects.
  outputFile: 'resources/effect_id.ts',
  type: '',
  header: '',
  asConst: true,
};

const _ENDPOINT = 'Status';

const _COLUMNS = [
  'ID',
  'Name',
];

type ResultStatus = {
  ID: number;
  Name: string | null;
};

type XivApiStatus = ResultStatus[];

type MappingTable = {
  [name: string]: number;
};

type OutputEffectId = {
  [name: string]: string; // the id is converted to hex, so use string
};

// TODO: add renaming?
// Almagest: 563

// There are a looooot of duplicate effect names in pvp, and it's impossible
// to differentiate other than manually.  There's also older effects that
// did different things that are still around.
//
// This is a map of skill name ro effect id (for smoke testing/documentation).
//
const knownMapping: Readonly<MappingTable> = {
  'Thundercloud': 164,
  'Battle Litany': 786,
  'Right Eye': 1910,
  'Left Eye': 1454,
  'Meditative Brotherhood': 1182,
  'Brotherhood': 1185,
  'Embolden': 1297,
  'Technical Finish': 1822,
  'Sheltron': 1856,
  'Lord of Crowns': 1876,
  'Lady of Crowns': 1877,
  'Divination': 1878,
  'Further Ruin': 2701,
  'The Balance': 1882,
  'The Bole': 1883,
  'The Arrow': 1884,
  'The Spear': 1885,
  'The Ewer': 1886,
  'The Spire': 1887,
  'Sword Oath': 1902,
  'Tactician': 1951,
  // This is for others, 1821 is for self.
  'Standard Finish': 2105,
  'The Wanderer\'s Minuet': 2216,
  'Mage\'s Ballad': 2217,
  'Army\'s Paeon': 2218,
  'Stormbite': 1201,
  'Caustic Bite': 1200,
  'Windbite': 129,
  'Venomous Bite': 124,
  'Higanbana': 1228,
  'Wildfire': 861,
  'Chain Stratagem': 1221,
  'Vulnerability Up': 638,
  'Eukrasian Dosis III': 2616,
  'Radiant Finale': 2964,
  'Requiescat': 1368,
  'Overheated': 2688,
};

// These custom name of effect will not be checked, but you'd better make it clean.
// Use this only when you need to handle different effects with a same name.
const customMapping: Readonly<MappingTable> = {
  'EmboldenSelf': 1239,
};

const printError = (
  header: string,
  what: string,
) => console.error(`${header} ${what}`);

const assembleData = (apiData: XivApiStatus): OutputEffectId => {
  const formattedData: OutputEffectId = {};
  const foundNames = new Set();
  const map = new Map<string, number>();

  for (const effect of apiData) {
    const id = effect.ID;
    const rawName = effect.Name;
    if (rawName === null || id === null)
      continue;
    const name = cleanName(rawName);
    // Skip empty strings.
    if (!name)
      continue;

    // TODO: The below printError() calls generate a ton of noise.  That's to be expected,
    // but we might want to add a flag to suppress these entirely, or filter out
    // existing/known conflicts so we can just see what's changing each patch.
    if (rawName in knownMapping) {
      if (id !== knownMapping[rawName]) {
        printError('skipping', rawName);
        continue;
      }
    }

    if (map.has(name)) {
      printError('collision', name);
      printError('collision', name);
      map.delete(name);
      continue;
    }
    if (foundNames.has(name)) {
      printError('collision', name);
      continue;
    }

    foundNames.add(name);
    map.set(name, id);
  }

  // Make sure everything specified in known_mapping was found in the above loop.
  for (const rawName of Object.keys(knownMapping)) {
    const name = cleanName(rawName);
    if (name && !foundNames.has(name))
      printError('missing known name', rawName);
  }

  // Add custom effect name for necessary duplicates.
  for (const [name, id] of Object.entries(customMapping))
    map.set(name, id);

  // Store ids as hex.
  map.forEach((id, name) => formattedData[name] = id.toString(16).toUpperCase());

  return formattedData;
};

export default async (): Promise<void> => {
  const api = new XivApi(null, true);

  const apiData = await api.queryApi(
    _ENDPOINT,
    _COLUMNS,
  ) as XivApiStatus;

  const outputData = assembleData(apiData);

  await api.writeFile(
    path.basename(import.meta.url),
    _EFFECT_ID,
    outputData,
  );
};
