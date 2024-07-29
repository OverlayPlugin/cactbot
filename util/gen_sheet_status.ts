import path from 'path';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { OutputFileAttributes, XivApi } from './xivapi';

const _SHEET_STATUS: OutputFileAttributes = {
  outputFile: 'resources/sheet_status.ts',
  type: '',
  header: '',
  asConst: true,
};

const _SHEET = 'Status';

const _FIELDS = [
  'Name',
];

type ResultStatus = {
  row_id: number;
  fields: {
    Name?: string;
  };
};

type XivApiStatus = ResultStatus[];

type OutputEffectId = {
  [id: string]: {
    id: string;
    name: string;
  };
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const assembleData = (apiData: XivApiStatus): OutputEffectId => {
  const formattedData: OutputEffectId = {};

  log.debug('Processing & assembling data...');
  for (const status of apiData) {
    const id = status.row_id;
    const name = status.fields.Name ?? '';
    const hexId = id.toString(16).toUpperCase();

    formattedData[hexId] = {
      id: hexId,
      name: name,
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
  ) as XivApiStatus;

  const outputData = assembleData(apiData);

  await api.writeFile(
    _SCRIPT_NAME,
    _SHEET_STATUS,
    outputData,
    true,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
