import path from 'path';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { OutputFileAttributes, XivApi } from './xivapi';

const _WEATHER_RATE: OutputFileAttributes = {
  outputFile: 'resources/weather_rate.ts',
  type: 'WeatherRateType',
  header: `type WeatherRateType = {
  [zoneId: number]: {
    readonly rates: number[];
    readonly weathers: string[];
  };
};
`,
  asConst: false,
};

const _SHEET = 'WeatherRate';

const _FIELDS = [
  'Rate',
  'Weather',
];

type ResultWeatherType = {
  row_id: number;
  fields: {
    Name?: string;
  };
};

type ResultWeatherRate = {
  row_id: number;
  fields: {
    Rate?: number[];
    Weather?: ResultWeatherType[];
  };
};

type XivApiWeatherRate = ResultWeatherRate[];

type OutputWeatherRate = {
  [id: number]: {
    rates: number[];
    weathers: string[];
  };
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const assembleData = (apiData: XivApiWeatherRate): OutputWeatherRate => {
  log.debug('Processing & assembling data...');
  const formattedData: OutputWeatherRate = {};

  for (const record of apiData) {
    const id = record.row_id;
    const rateArr = record.fields.Rate;
    const weatherArr = record.fields.Weather;

    if (rateArr === undefined || weatherArr === undefined)
      continue;

    const entries = rateArr.length;
    const rates: number[] = [];
    const weathers: string[] = [];
    let sumRate = 0;

    for (let v = 0; v < entries; v++) {
      const rate = rateArr[v] ?? 0;
      const weather = weatherArr[v]?.fields?.Name ?? '';

      // stop processing for this ID if no more actual values
      if (rate === 0 || weather === '')
        break;

      sumRate += rate;
      rates.push(sumRate);
      weathers.push(weather);
    }
    log.debug(`Collected weather rate data for ID: ${id}`);
    formattedData[id] = {
      rates: rates,
      weathers: weathers,
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
  ) as XivApiWeatherRate;

  const outputData = assembleData(apiData);

  // The WeatherRate endpoint does not return data associated with ID:0
  // We could fetch it separately from WeatherRate/0, but the data struc is slightly
  // different, and a second API call seems unnecessary since this row is very unlikely
  // to change.  So just add the data manually.
  log.debug('Manually inserting WeatherRate data for ID: 0.');
  outputData[0] = {
    rates: [100],
    weathers: ['Fair Skies'],
  };

  await api.writeFile(
    _SCRIPT_NAME,
    _WEATHER_RATE,
    outputData,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
