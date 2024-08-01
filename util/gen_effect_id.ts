import path from 'path';

import { ConsoleLogger, LogLevelKey } from './console_logger';
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
  [name: string]: string; // the id is converted to hex, so use string
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const assembleData = (apiData: XivApiStatus): OutputEffectId => {
  const formattedData: OutputEffectId = {};
  const map = new Map<string, number>();
  const collisionNames = new Set<string>();

  log.debug('Processing & assembling data...');
  for (const effect of apiData) {
    const id = effect.row_id;
    const rawName = effect.fields.Name;
    if (rawName === undefined)
      continue;
    let name = cleanName(rawName);
    // Skip empty strings.
    if (name === '')
      continue;

    // Add ID to the collision names.
    if (map.has(name)) {
      log.info(
        `Collision detected: ${name} (IDs: ${id}, ${map.get(name) ?? ''}).  Renaming...`,
      );
      const oid = map.get(name) ?? 0;
      if (oid) {
        map.set(`${name}_${oid.toString(16).toUpperCase()}`, oid);
      }
      collisionNames.add(name);
      name = `${name}_${id.toString(16).toUpperCase()}`;
    }
    map.set(name, id);
    log.debug(`Adding ${name} (ID: ${id}) to data output.`);
  }
  log.debug('Completed initial pass. Starting post-processing...');

  for (const name of collisionNames) {
    map.delete(name);
  }
  log.debug('Collisions names removed.');

  // Store ids as hex.
  map.forEach((id, name) => formattedData[name] = id.toString(16).toUpperCase());
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
    _EFFECT_ID,
    outputData,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
