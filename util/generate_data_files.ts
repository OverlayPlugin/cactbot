import { Namespace, SubParser } from 'argparse';
import inquirer from 'inquirer';

import { UnreachableCode } from '../resources/not_reached';

import { ConsoleLogger, LogLevelKey, LogLevelLabel, logLevels } from './console_logger';
import { default as generateCeInfoAndMaps } from './gen_ce_info_and_maps';
import { default as generateEffectIds } from './gen_effect_id';
import { default as generateHunt } from './gen_hunt_data';
import { default as generatePetNames } from './gen_pet_names';
import { default as generateWeatherRate } from './gen_weather_rate';
import { default as generateWorldIds } from './gen_world_ids';
import { default as generateZoneIdandZoneInfo } from './gen_zone_id_and_info';

import { ActionChoiceType } from '.';

const fileKeys = [
  'ce_info_and_maps',
  'effect_id',
  'hunt_data',
  'pet_names',
  'weather_rate',
  'world_id',
  'zone_id_and_info',
] as const;

const allKey = 'all';
const allLabel = '* Generate All Data Files';

type FileKey = typeof fileKeys[number];

const fileKeyToFunc: { [K in FileKey]: (logLevel: LogLevelKey) => Promise<void> } = {
  'ce_info_and_maps': generateCeInfoAndMaps,
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

const fileDefault: FileKeyAll = 'all';

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
      when: () => args.file === null || args.file === undefined,
    },
    {
      type: 'list',
      name: 'loglevel',
      message: 'What level of console logging do you want?',
      choices: logLevelChoices,
      default: args.loglevel,
      when: () => args.loglevel === null || args.loglevel === undefined,
    },
  ] as const;
  return inquirer.prompt<GenerateDataFilesInquirerType>(questions)
    .then((answers) => {
      // args.file and args.loglevel return as objects, rather than string primitives. /shrug
      // when myLogLevel is passed to the gen_data function, it cannot recognize the log level,
      // so force it here to a string and then re-apply the type with an assertion.
      // parsearg already limits user-input values to the respective type literal.
      const myFile: FileKeyAll = answers.file ?? args.file ?? fileDefault;
      const myLogLevel: LogLevelKey = answers.loglevel ??
        args.loglevel ??
        ConsoleLogger.logLevelDefault;
      return fileKeyToFuncAll[myFile](myLogLevel.toString() as LogLevelKey);
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

  generateParser.addArgument(['-f', '--file'], {
    nargs: 1,
    type: 'string',
    choices: Object.keys(fileKeyToFuncAll),
    help: 'The data file to be generated (or \'all\')',
  });

  generateParser.addArgument(['-ll', '--loglevel'], {
    nargs: 1,
    type: 'string',
    choices: logLevels.map((ll) => ll[0]),
    help: 'The level of console output you want to see',
  });
};
