import path from 'path';

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

const _ENDPOINT = 'World';

const _COLUMNS = [
  'ID',
  'InternalName',
  'Name',
  'Region',
  'UserType',
  'DataCenter.ID',
  'DataCenter.Name',
  'IsPublic',
];

type ResultDataCenter = {
  ID: string | number | null;
  Name: string | null;
};

type ResultWorld = {
  ID: number;
  InternalName: string | null;
  Name: string | null;
  Region: number | null;
  UserType: number | null;
  DataCenter: ResultDataCenter;
  IsPublic: string | number | null;
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

const scrubDataCenter = (dc: ResultDataCenter): OutputDataCenter | undefined => {
  if (dc.ID === null || dc.ID === '')
    return;
  if (dc.Name === null || dc.Name === '')
    return;
  const idNum = typeof dc.ID === 'string' ? parseInt(dc.ID) : dc.ID;
  return {
    id: idNum,
    name: dc.Name,
  };
};

const scrubIsPublic = (pub: string | number | null): boolean | undefined => {
  if (pub === null || pub === '')
    return;
  const pubNum = typeof pub === 'string' ? parseInt(pub) : pub;
  if (pubNum === 0)
    return false;
  if (pubNum === 1)
    return true;
  return;
};

const assembleData = (apiData: XivApiWorld): OutputWorldIds => {
  const formattedData: OutputWorldIds = {};

  for (const data of apiData) {
    const dc = scrubDataCenter(data.DataCenter);
    const isPublic = scrubIsPublic(data.IsPublic);

    // there are many hundreds of dev/test/whatever entries in
    // the World table that substantially clutter the data
    // for our use cases, we only care about public worlds
    if (!isPublic)
      continue;

    if (
      data.InternalName === null ||
      data.Name === null ||
      data.Name === '' || // filter out empty strings or we get a ton of trash
      data.Region === null ||
      data.UserType === null
    )
      continue;

    formattedData[data.ID.toString()] = {
      id: data.ID,
      internalName: data.InternalName,
      name: data.Name,
      region: data.Region,
      userType: data.UserType,
      dataCenter: dc,
      // isPublic: isPublic, // value is always implicitly 'true' given the filter above
    };
  }
  return formattedData;
};

export default async (): Promise<void> => {
  const api = new XivApi(null, true);

  const apiData = await api.queryApi(
    _ENDPOINT,
    _COLUMNS,
  ) as XivApiWorld;

  const outputData = assembleData(apiData);

  await api.writeFile(
    path.basename(import.meta.url),
    _WORLD_ID,
    outputData,
    true, // require keys to be returned as strings (because that's the existing format)
  );
};
