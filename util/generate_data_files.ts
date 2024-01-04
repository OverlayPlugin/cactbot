import { Namespace, SubParser } from 'argparse';
import inquirer from 'inquirer';

import { UnreachableCode } from '../resources/not_reached';

import { default as generateEffectIds } from './gen_effect_id';
import { default as generateHunt } from './gen_hunt_data';
import { default as generatePetNames } from './gen_pet_names';
import { default as generateWeatherRate } from './gen_weather_rate';
import { default as generateWorldIds } from './gen_world_ids';
import { default as generateZoneIdandZoneInfo } from './gen_zone_id_and_info';

import { ActionChoiceType } from '.';

const fileKeys = [
  'effect_id',
  'hunt_data',
  'pet_names',
  'weather_rate',
  'world_id',
  'zone_id_and_info',
] as const;

const allKey = 'all';
const allLabel = '* Generate All Data Files';

const logLevels = [
  ['alert', 'ALERTS: issues that probably require action (RECOMMENDED)'],
  ['info', 'INFO: more routine/known issues that may not require action'],
  ['debug', 'DEBUG: detailed output for troubleshooting'],
  ['silent', 'RESULTS ONLY: success/errors only (not recommended)'],
] as const;

type FileKey = typeof fileKeys[number];

const fileKeyToFunc: { [K in FileKey]: (logLevel: LogLevelKey) => Promise<void> } = {
  'effect_id': generateEffectIds,
  'hunt_data': generateHunt,
  'pet_names': generatePetNames,
  'weather_rate': generateWeatherRate,
  'world_id': generateWorldIds,
  'zone_id_and_info': generateZoneIdandZoneInfo,
};

const generateAll = async (logLevel: LogLevelKey): Promise<void> => {
  for (const key of fileKeys) {
    await fileKeyToFunc[key](logLevel);
  }
};

// Labels are used in the inquirer UI to be more friendly/descriptive.
// For the choice of files to update, labels = keys with the exception of 'all'.
type FileKeyAll = FileKey | typeof allKey;
type FileLabelAll = FileKey | typeof allLabel;

const fileChoices: { name: FileLabelAll; value: FileKeyAll }[] = [
  { name: allLabel, value: allKey },
  ...fileKeys.map((k) => ({ name: k, value: k })),
];

const fileKeyToFuncAll: { [filename in FileKeyAll]: (logLevel: LogLevelKey) => Promise<void> } =
  ({ [allKey]: generateAll, ...fileKeyToFunc });

export type LogLevelKey = typeof logLevels[number][0];
type LogLevelLabel = typeof logLevels[number][1];

const logLevelChoices: { name: LogLevelLabel; value: LogLevelKey }[] = logLevels.map((ll) => ({
  name: ll[1],
  value: ll[0],
}));

type GenerateDataFilesNamespaceInterface = {
  'file': FileKeyAll | null;
  'loglevel': LogLevelKey | null;
};

class GenerateDataFilesNamespace extends Namespace implements GenerateDataFilesNamespaceInterface {
  'file': FileKeyAll | null;
  'loglevel': LogLevelKey | null;
}

type GenerateDataFilesInquirerType = {
  [name in keyof GenerateDataFilesNamespaceInterface]: GenerateDataFilesNamespaceInterface[name];
};

const logLevelDefault: LogLevelKey = 'alert';
const fileDefault: FileKeyAll = 'all';

// TODO: argparse isn't handling CLI options past the initial 'action'
// need to look into this more
const generateDataFilesFunc = async (args: Namespace): Promise<void> => {
  if (!(args instanceof GenerateDataFilesNamespace))
    throw new UnreachableCode();
  const questions = [
    {
      type: 'list',
      name: 'file',
      message: 'Which data file do you want to generate?',
      choices: fileChoices,
      default: args.file,
      when: () => typeof args.file !== 'string',
    },
    {
      type: 'list',
      name: 'loglevel',
      message: 'What level of console logging do you want?',
      choices: logLevelChoices,
      default: args.loglevel,
      when: () => typeof args.loglevel !== 'string',
    },
  ] as const;
  return inquirer.prompt<GenerateDataFilesInquirerType>(questions)
    .then((answers) => {
      const myChoice: FileKeyAll = answers.file ?? args.file ?? fileDefault;
      const myLogLevel: LogLevelKey = answers.loglevel ?? args.loglevel ?? logLevelDefault;
      return fileKeyToFuncAll[myChoice](myLogLevel);
    }).catch(console.error);
};

export const registerGenerateDataFiles = (
  actionChoices: ActionChoiceType,
  subparsers: SubParser,
): void => {
  actionChoices.generate = {
    name: 'Generate common data files',
    callback: generateDataFilesFunc,
    namespace: GenerateDataFilesNamespace,
  };
  const generateParser = subparsers.addParser('generate', {
    description: actionChoices.generate.name,
  });

  generateParser.addArgument('--file', {
    nargs: 1,
    type: 'string',
    choices: Object.keys(fileKeyToFuncAll),
    help: 'The name of the file to be generated (incl. \'all\')',
  });

  generateParser.addArgument('--loglevel', {
    nargs: 1,
    type: 'string',
    choices: logLevels.map((ll) => ll[0]),
    help: 'The level of console output you want to see',
  });
};

export class ConsoleLogger {
  // assign numerical values to log levels so we can do a quick compare
  // in deciding whether a user wants to see that type of log output
  logLevelMap: { [K in LogLevelKey]: 0 | 1 | 2 | 3 } = {
    silent: 0,
    alert: 1,
    info: 2,
    debug: 3,
  };
  myLogLevel: typeof this.logLevelMap[LogLevelKey];

  setLogLevel(logLevel?: LogLevelKey): void {
    // class is initialized in scripts outside of all constructs,
    // so it doesn't need to be passed to every function
    // this happens before the default function is called
    // with the user's log level choice.
    if (logLevel === undefined)
      return;
    if (!Object.keys(this.logLevelMap).includes(logLevel))
      this.fatalError('Invalid log level is set.');
    this.myLogLevel = this.logLevelMap[logLevel];
    this.debug(`Log level set: ${logLevel}`);
  }

  constructor(userLogLevelKey?: LogLevelKey) {
    this.myLogLevel = this.logLevelMap[logLevelDefault]; // needs to be initialized first
    this.setLogLevel(userLogLevelKey);
  }

  alert(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.alert)
      console.log(`Alert: ${msg}`);
  }

  info(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.info)
      console.log(`Info: ${msg}`);
  }

  debug(msg: string): void {
    if (this.myLogLevel >= this.logLevelMap.debug)
      console.log(`Debug: ${msg}`);
  }

  successDone(msg: string): void {
    console.log(`Success: ${msg}`);
  }

  nonFatalError(msg: string): void {
    console.log(`ERROR: ${msg}`);
  }

  fatalError(msg: string): void {
    console.log(`ERROR: ${msg} Exiting...`);
    process.exit(1);
  }
}
