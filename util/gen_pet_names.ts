import path from 'path';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { getCnTable, getKoTable, getTcTable } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';

const _PET_NAMES: OutputFileAttributes = {
  outputFile: 'resources/pet_names.ts',
  type: 'PetData',
  header: `import { Lang } from './languages';

type PetData = {
  [name in Lang]: readonly string[];
};
`,
  asConst: false,
};

const _SHEET = 'Pet';

const _FIELDS = [
  'Name',
  'Name@de',
  'Name@fr',
  'Name@ja',
];

const _LOCALE_TABLE = 'Pet';
const _LOCALE_COLUMNS = ['Name'];

type ResultPet = {
  row_id: number;
  fields: {
    Name?: string;
    'Name@de'?: string;
    'Name@fr'?: string;
    'Name@ja'?: string;
  };
};

type XivApiPet = ResultPet[];

type OutputPetNames = {
  cn: string[];
  de: string[];
  en: string[];
  fr: string[];
  ja: string[];
  tc: string[];
  ko: string[];
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const fetchLocaleCsvTables = async () => {
  log.debug(`Table: ${_LOCALE_TABLE} | Query columns: [${_LOCALE_COLUMNS.toString()}]`);
  log.debug('Fetching \'cn\' table...');
  const cnPet = await getCnTable(_LOCALE_TABLE, _LOCALE_COLUMNS);
  log.debug('Fetching \'tc\' table...');
  const tcPet = await getTcTable(_LOCALE_TABLE, _LOCALE_COLUMNS);
  log.debug('Fetching \'ko\' table...');
  const koPet = await getKoTable(_LOCALE_TABLE, _LOCALE_COLUMNS);
  return {
    cn: cnPet,
    tc: tcPet,
    ko: koPet,
  };
};

const assembleData = async (apiData: XivApiPet): Promise<OutputPetNames> => {
  log.debug('Processing & assembling data...');
  // This isn't really a locale object, and ordering is alpha in the current file, so:
  // eslint-disable-next-line rulesdir/cactbot-locale-order
  const formattedData: OutputPetNames = {
    cn: [],
    de: [],
    en: [],
    fr: [],
    ja: [],
    tc: [],
    ko: [],
  };

  for (const pet of apiData) {
    const nameEn = pet.fields.Name ?? '';
    const nameDe = pet.fields['Name@de'];
    const nameFr = pet.fields['Name@fr'];
    const nameJa = pet.fields['Name@ja'];

    // If no en name (or if duplicate), skip processing
    if (nameEn === '' || formattedData.en.includes(nameEn))
      continue;
    formattedData.en.push(nameEn);

    if (nameDe !== undefined)
      formattedData.de.push(nameDe);
    if (nameFr !== undefined)
      formattedData.fr.push(nameFr);
    if (nameJa !== undefined)
      formattedData.ja.push(nameJa);
    log.debug(`Collected base pet data for ${nameEn} (ID: ${pet.row_id})`);
  }

  log.info('Fetching locale CSV tables...');
  const localeCsvTables = await fetchLocaleCsvTables();
  for (const name of Object.keys(localeCsvTables.cn).filter((k) => k !== '')) {
    formattedData.cn.push(name);
    log.debug(`Collected 'cn' pet data for ${name}`);
  }
  for (const name of Object.keys(localeCsvTables.tc).filter((k) => k !== '')) {
    formattedData.tc.push(name);
    log.debug(`Collected 'tc' pet data for ${name}`);
  }
  for (const name of Object.keys(localeCsvTables.ko).filter((k) => k !== '')) {
    formattedData.ko.push(name);
    log.debug(`Collected 'ko' pet data for ${name}`);
  }
  log.debug('Data assembly/formatting complete.');
  return formattedData;
};

export default async (logLevel: LogLevelKey): Promise<void> => {
  log.setLogLevel(logLevel);
  log.info(`Starting processing for ${_SCRIPT_NAME}`);

  const api = new XivApi(null, log);

  const apiData = await api.queryApi(
    _SHEET,
    _FIELDS,
  ) as XivApiPet;

  const outputData = await assembleData(apiData);

  await api.writeFile(
    _SCRIPT_NAME,
    _PET_NAMES,
    outputData,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
