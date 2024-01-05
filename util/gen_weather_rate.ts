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

const _ENDPOINT = 'WeatherRate';

const _COLUMNS = [
  'ID',
  'Weather0.Name',
  'Rate0',
  'Weather1.Name',
  'Rate1',
  'Weather2.Name',
  'Rate2',
  'Weather3.Name',
  'Rate3',
  'Weather4.Name',
  'Rate4',
  'Weather5.Name',
  'Rate5',
  'Weather6.Name',
  'Rate6',
  'Weather7.Name',
  'Rate7',
];

type ResultWeatherName = {
  Name: string | null;
};

type RateField =
  | 'Rate0'
  | 'Rate1'
  | 'Rate2'
  | 'Rate3'
  | 'Rate4'
  | 'Rate5'
  | 'Rate6'
  | 'Rate7';

type WeatherField =
  | 'Weather0'
  | 'Weather1'
  | 'Weather2'
  | 'Weather3'
  | 'Weather4'
  | 'Weather5'
  | 'Weather6'
  | 'Weather7';

type ResultWeatherRate =
  & {
    ID: string | number;
  }
  & {
    [K in WeatherField]: ResultWeatherName;
  }
  & {
    [K in RateField]: string | number | null;
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
    const id = typeof record.ID !== 'number' ? parseInt(record.ID) : record.ID;
    const rates: number[] = [];
    const weathers: string[] = [];
    let sumRate = 0;

    for (let v = 0; v <= 7; v++) {
      const rateField = `Rate${v}` as RateField;
      const weatherField = `Weather${v}` as WeatherField;

      let rate = record[rateField];
      if (rate !== null) {
        rate = typeof rate === 'number' ? rate : parseInt(rate);
        sumRate += rate;
      }

      const weatherName = record[weatherField].Name;

      // stop processing for this ID on the first empty/null weather string
      if (weatherName === null || weatherName === '')
        break;

      rates.push(sumRate);
      weathers.push(weatherName);
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
    _ENDPOINT,
    _COLUMNS,
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
