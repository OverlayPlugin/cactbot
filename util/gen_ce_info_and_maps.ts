import path from 'path';

import { LocaleText } from '../types/trigger';

import Overrides from './ce_overrides';
import { ConsoleLogger, LogLevelKey } from './console_logger';
import { cleanName } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';

// Generate data relating to the Critical Engagements of the Bozjan Southern
// Front and Zadnor, and the Critical Encounters of the Occult Crescent:
// South Horn. The API calls these "Dynamic Events", but most players will
// refer to these simply as CEs, and I opted to use the CE shorthand.

const _BOZJA_ENCOUNTERS: OutputFileAttributes = {
  outputFile: 'resources/bozja_encounters.ts',
  type: 'CeInfoType',
  header: `import { CeInfoType } from '../types/ce';
`,
  asConst: true,
};

const _BOZJA_MAP: OutputFileAttributes = {
  outputFile: 'resources/bozja_ce_map.ts',
  type: 'CEMap<typeof BozjaCEs>',
  header: `import { CEMap } from '../types/ce';
import BozjaCEs from './bozja_encounters';
`,
  asConst: true,
};

const _ZADNOR_ENCOUNTERS: OutputFileAttributes = {
  outputFile: 'resources/zadnor_encounters.ts',
  type: 'CeInfoType',
  header: `import { CeInfoType } from '../types/ce';
`,
  asConst: true,
};

const _ZADNOR_MAP: OutputFileAttributes = {
  outputFile: 'resources/zadnor_ce_map.ts',
  type: 'CEMap<typeof ZadnorCEs>',
  header: `import { CEMap } from '../types/ce';
import ZadnorCEs from './zadnor_encounters';
`,
  asConst: true,
};

const _SOUTH_HORN_ENCOUNTERS: OutputFileAttributes = {
  outputFile: 'resources/south_horn_encounters.ts',
  type: 'CeInfoType',
  header: `import { CeInfoType } from '../types/ce';
`,
  asConst: true,
};

const _SOUTH_HORN_MAP: OutputFileAttributes = {
  outputFile: 'resources/south_horn_ce_map.ts',
  type: 'CEMap<typeof SouthHornCEs>',
  header: `import { CEMap } from '../types/ce';
import SouthHornCEs from './south_horn_encounters';
`,
  asConst: true,
};

const _DES_SHEET = 'DynamicEventSet';

const _DES_FIELDS = [
  'Unknown0',
];

const _DE_SHEET = 'DynamicEvent';

const _DE_FIELDS = [
  'Name',
  'Name@de',
  'Name@fr',
  'Name@ja',
];

type ResultDynamicEventSetType = {
  row_id: number;
  subrow_id: number;
  fields: {
    Unknown0: number;
  };
};

type IndexedDynamicEventType = {
  [key: string]: ResultDynamicEventType;
};

type ResultDynamicEventType = {
  row_id: number;
  fields: {
    Name?: string;
    'Name@de'?: string;
    'Name@fr'?: string;
    'Name@ja'?: string;
  };
};

type IndexedDynamicEventSetSubrow = {
  [subrow: number]: ResultDynamicEventSetType;
};

type IndexedDynamicEventSetRow = {
  [row: number]: IndexedDynamicEventSetSubrow;
};

type CeInfoData = {
  directorId: string;
  name: LocaleText;
};

type CeInfoOutput = {
  [key: string]: CeInfoData;
};

type CeDirectorMap = {
  [directorId: string]: string;
};

type OutputContainer = {
  bozjaCEs: CeInfoOutput;
  zadnorCEs: CeInfoOutput;
  southHornCEs: CeInfoOutput;
  bozjaMap: CeDirectorMap;
  zadnorMap: CeDirectorMap;
  southHornMap: CeDirectorMap;
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const indexDeSetData = (data: ResultDynamicEventSetType[]): IndexedDynamicEventSetRow => {
  const deSetData: IndexedDynamicEventSetRow = {};
  for (const row of data) {
    let deSetSubrowData = deSetData[row.row_id];
    if (deSetSubrowData === undefined) {
      deSetSubrowData = {};
      deSetData[row.row_id] = deSetSubrowData;
    }
    deSetSubrowData[row.subrow_id] = row;
  }
  return deSetData;
};

const indexDeData = (data: ResultDynamicEventType[]): IndexedDynamicEventType => {
  const deData: IndexedDynamicEventType = {};
  for (const row of data) {
    deData[row.row_id] = row;
  }
  return deData;
};

const generateCEList = (
  deSetData: IndexedDynamicEventSetSubrow,
  deData: IndexedDynamicEventType,
  zone: string,
): CeInfoOutput => {
  if (Object.keys(deSetData).length === 0) {
    log.alert(`No CE set data for ${zone}. Resolve before merge.`);
    return {};
  }

  log.debug(`Generating CE info for ${zone}`);

  const capitalize = (str: string | undefined): string | undefined => {
    if (str === undefined || str === '')
      return;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const ceInfoOutput: CeInfoOutput = {};

  for (const [id] of Object.entries(deSetData)) {
    const idx = parseInt(id);
    const setData = deSetData[idx];

    if (setData === undefined) {
      log.alert(
        `Unexpectedly could not find set info for CE ${idx} for ${zone}. Resolve before merge.`,
      );
      continue;
    }

    const deId = setData.fields.Unknown0;
    const data = deData[deId];

    if (data === undefined) {
      log.alert(
        `Unexpectedly could not find info for CE ${idx} (row ${deId}) for ${zone}. Resolve before merge.`,
      );
      continue;
    }

    const enName = capitalize(data.fields.Name);
    if (enName === undefined) {
      log.alert(
        `No Name data available for CE ${idx} (row ${deId}) for ${zone}. Resolve before merge.`,
      );
      continue;
    }

    const deNames = {
      // cactbot-ignore-missing-translations
      en: enName,
      de: capitalize(data.fields['Name@de']),
      fr: capitalize(data.fields['Name@fr']),
      ja: capitalize(data.fields['Name@ja']),
    };

    const ceName: LocaleText = Object.assign({}, deNames);

    const keyName = cleanName(enName);
    if (keyName === undefined) {
      log.alert(
        `Failed to generate a key name for CE ${idx} (row ${deId}) for ${zone}. Resolve before merge.`,
      );
      continue;
    }

    const excludedCEs = Overrides.excludedCEs[zone];
    if ((excludedCEs !== undefined) && excludedCEs.includes(keyName)) {
      log.debug(`Skipping excluded CE ${keyName}`);
      continue;
    }

    const directorId = Overrides.directorIds[keyName] ?? '';
    if (directorId === '') {
      log.alert(
        `Missing DirectorUpdate Id value for CE ${keyName} (index ${idx}, row ${deId}) for ${zone}. Resolve before merge.`,
      );
    }

    const ceInfo: CeInfoData = {
      name: ceName,
      directorId: directorId,
    };

    ceInfoOutput[keyName] = ceInfo;
    log.debug(`Added CE ${keyName} (index ${idx}, row ${deId}) to CE list for ${zone}`);
  }

  const syntheticCEs = Overrides.syntheticCEs[zone];
  if (syntheticCEs !== undefined) {
    log.debug(`Adding synthetic CE data for ${zone}.`);

    for (const [name, info] of Object.entries(syntheticCEs)) {
      ceInfoOutput[name] = info;
    }
  }

  log.debug(`Finished assembling CE data for ${zone}.`);
  return ceInfoOutput;
};

const generateCEMap = (
  ceInfoOutput: CeInfoOutput,
  zone: string,
): CeDirectorMap => {
  if (Object.keys(ceInfoOutput).length === 0) {
    log.alert(`No CE data for ${zone}. Resolve before merge.`);
    return {};
  }

  log.debug(`Generating Director ID to CE map for ${zone}`);

  const ceInfoMap: CeDirectorMap = {};

  for (const [key] of Object.entries(ceInfoOutput)) {
    const ceInfo = ceInfoOutput[key];

    if (ceInfo === undefined) {
      log.alert(
        `Unexpectedly could not find info for CE ${key} for ${zone}. Resolve before merge.`,
      );
      continue;
    }

    ceInfoMap[ceInfo.directorId] = key;
    log.debug(`Added entry mapping Director ID ${ceInfo.directorId} to CE ${key} for ${zone}`);
  }

  log.debug(`Finished assembling CE map for ${zone}.`);
  return ceInfoMap;
};

const assembleData = (
  deSetRawData: ResultDynamicEventSetType[],
  deRawData: ResultDynamicEventType[],
): OutputContainer => {
  const deSetData = indexDeSetData(deSetRawData);
  const deData = indexDeData(deRawData);

  const bozjaSetData = deSetData[1] ?? {};
  const zadnorSetData = deSetData[2] ?? {};
  const southHornSetData = deSetData[3] ?? {};

  const bozjaCEData = generateCEList(bozjaSetData, deData, 'Bozja');
  const zadnorCEData = generateCEList(zadnorSetData, deData, 'Zadnor');
  const southHornCEData = generateCEList(southHornSetData, deData, 'South Horn');

  const bozjaCEMap = generateCEMap(bozjaCEData, 'Bozja');
  const zadnorCEMap = generateCEMap(zadnorCEData, 'Zadnor');
  const southHornCEMap = generateCEMap(southHornCEData, 'South Horn');

  const formattedData: OutputContainer = {
    bozjaCEs: bozjaCEData,
    zadnorCEs: zadnorCEData,
    southHornCEs: southHornCEData,
    bozjaMap: bozjaCEMap,
    zadnorMap: zadnorCEMap,
    southHornMap: southHornCEMap,
  };

  log.debug('Data assembly/formatting complete.');
  return formattedData;
};

export default async (logLevel: LogLevelKey): Promise<void> => {
  log.setLogLevel(logLevel);
  log.info(`Starting processing for ${_SCRIPT_NAME}`);

  const api = new XivApi(null, log);

  const deSetRawData = await api.queryApi(
    _DES_SHEET,
    _DES_FIELDS,
  ) as ResultDynamicEventSetType[];

  const deRawData = await api.queryApi(
    _DE_SHEET,
    _DE_FIELDS,
  ) as ResultDynamicEventType[];

  const outputData = assembleData(deSetRawData, deRawData);

  await api.writeFile(
    path.basename(import.meta.url),
    _BOZJA_ENCOUNTERS,
    outputData.bozjaCEs,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _ZADNOR_ENCOUNTERS,
    outputData.zadnorCEs,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _SOUTH_HORN_ENCOUNTERS,
    outputData.southHornCEs,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _BOZJA_MAP,
    outputData.bozjaMap,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _ZADNOR_MAP,
    outputData.zadnorMap,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _SOUTH_HORN_MAP,
    outputData.southHornMap,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
