import path from 'path';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { OutputFileAttributes, XivApi } from './xivapi';

const _WORLD_ID: OutputFileAttributes = {
  outputFile: 'resources/world_id.ts',
  type: 'Worlds',
  header: `// NOTE: This data is filtered to public worlds only (i.e. isPublic: true)

  export type DataCenter = {
    id: number;
    name: string;
  };

export type World = {
  id: number;
  internalName: string;
  name: string;
  region: number;
  userType: number;
  dataCenter?: DataCenter;
  isPublic?: boolean;
};

export type Worlds = {
  [id: string]: World
};

export const worldNameToWorld = (name: string): World | undefined => {
  return Object.values(data).find((world: World) => {
    if (world.name === name) {
      return true;
    }
  });
};
`,
  asConst: true,
};

const _SHEET = 'World';

const _FIELDS = [
  'InternalName',
  'Name',
  'Region',
  'UserType',
  'DataCenter.Name',
  'IsPublic',
];

type ResultDataCenter = {
  row_id: number;
  fields: {
    Name?: string;
  };
};

type ResultWorld = {
  row_id: number;
  fields: {
    InternalName?: string;
    Name?: string;
    Region?: number;
    UserType?: number;
    DataCenter?: ResultDataCenter;
    IsPublic?: boolean;
  };
};

type XivApiWorld = ResultWorld[];

type OutputDataCenter = {
  id: number;
  name: string;
};

type OutputWorld = {
  id: number;
  internalName: string;
  name: string;
  region: number;
  userType: number;
  dataCenter?: OutputDataCenter;
  isPublic?: boolean;
};

type OutputWorldIds = {
  [id: string]: OutputWorld;
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const scrubDataCenter = (dc: ResultDataCenter): OutputDataCenter | undefined => {
  const dcName = dc.fields.Name ?? '';
  if (dcName === '')
    return;
  const idNum = dc.row_id;
  return {
    id: idNum,
    name: dcName,
  };
};

const assembleData = (apiData: XivApiWorld): OutputWorldIds => {
  log.debug('Processing & assembling data...');
  const formattedData: OutputWorldIds = {};

  for (const data of apiData) {
    const dcResult = data.fields.DataCenter;
    if (dcResult === undefined)
      continue;
    const dc = scrubDataCenter(dcResult);

    const intName = data.fields.InternalName;
    const name = data.fields.Name ?? ''; // filter out empty strings or we get a ton of trash
    const region = data.fields.Region;
    const userType = data.fields.UserType;
    const isPublic = data.fields.IsPublic;

    // there are many hundreds of dev/test/whatever entries in
    // the World table that substantially clutter the data
    // for our use cases, we only care about public worlds
    if (!isPublic) {
      log.debug(`Found non-public world (ID: ${data.row_id} | Name: ${name}). Ignoring.`);
      continue;
    }

    if (intName === undefined || name === '' || region === undefined || userType === undefined) {
      log.debug(`Data missing for ID: ${data.row_id} (Name: ${name}). Ignoring.`);
      continue;
    }
    log.debug(`Collected world data for ${dc?.name ?? 'no_dc'}:${name} (ID: ${data.row_id})`);

    formattedData[data.row_id.toString()] = {
      id: data.row_id,
      internalName: intName,
      name: name,
      region: region,
      userType: userType,
      dataCenter: dc,
      // isPublic: isPublic, - value is always 'true' given the filter above
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
    _SHEET,
    _FIELDS,
  ) as XivApiWorld;

  const outputData = assembleData(apiData);

  await api.writeFile(
    _SCRIPT_NAME,
    _WORLD_ID,
    outputData,
    true, // require keys to be returned as strings (because that's the existing format)
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
