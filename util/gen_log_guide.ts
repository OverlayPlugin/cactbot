import path from 'path';

import markdownMagic from 'markdown-magic';

import lineDocs from '../resources/example_log_lines';
import logDefinitions, { LogDefinitionName } from '../resources/netlog_defs';
import { buildRegex as buildNetRegex } from '../resources/netregexes';
import { UnreachableCode } from '../resources/not_reached';
import { buildRegex } from '../resources/regexes';
import LogRepository from '../ui/raidboss/emulator/data/network_log_converter/LogRepository';
import ParseLine from '../ui/raidboss/emulator/data/network_log_converter/ParseLine';

const curPath = path.resolve();

// For compatibility with the path of the LogGuide.md file
const locales = ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW'] as const;

type Locale = typeof locales[number];

const isLocale = (locale?: string): locale is Locale => {
  return locales.includes(locale as Locale);
};

type LocaleObject<T> =
  & {
    'en-US': T;
  }
  & {
    [locale in Exclude<Locale, 'en-US'>]?: T;
  };

const translate = <T>(locale: Locale, obj: LocaleObject<T>): T => {
  return obj[locale] ?? obj['en-US'];
};

type LocaleText = LocaleObject<string>;

// Exclude these types since they're not relevant or covered elsewhere
type ExcludedLineDocs =
  | 'None'
  | 'NetworkAOEAbility'
  | 'NetworkWorld'
  | 'ParserInfo'
  | 'ProcessInfo'
  | 'Debug'
  | 'PacketDump'
  | 'Version'
  | 'Error';

type LineDocTypes = Exclude<LogDefinitionName, ExcludedLineDocs>;

type LineDocRegex = {
  network: string;
  logLine: string;
};

type LineDocType = {
  // We can generate `network` type automatically for everything but regex
  regexes?: Partial<LineDocRegex>;
  examples: LocaleObject<readonly string[]>;
};

type LineDocs = {
  [type in LineDocTypes]: LineDocType;
};

type Titles = Record<
  | 'structure'
  | 'networkLogLineStructure'
  | 'actLogLineStructure'
  | 'regexes'
  | 'networkLogLineRegexes'
  | 'actLogLineRegexes'
  | 'examples'
  | 'networkLogLineExamples'
  | 'actLogLineExamples',
  LocaleText
>;

const titles: Titles = {
  structure: {
    'en-US': 'Structure',
    'ja-JP': '構造',
    'zh-CN': '结构',
    'zh-TW': '結構',
  },
  networkLogLineStructure: {
    'en-US': 'Network Log Line Structure:',
    'ja-JP': 'ネットワークログライン構造：',
    'zh-CN': '网络日志行结构：',
    'zh-TW': '網路日誌行結構：',
  },
  actLogLineStructure: {
    'en-US': 'Parsed Log Line Structure:',
    'ja-JP': 'ACTログライン構造：', // FIXME
    'zh-CN': 'ACT日志行结构：', // FIXME
    'zh-TW': 'ACT日誌行結構：', // FIXME
  },
  regexes: {
    'en-US': 'Regexes',
    'ja-JP': '正規表現',
    'zh-CN': '正则表达式',
    'zh-TW': '正規表示式',
  },
  networkLogLineRegexes: {
    'en-US': 'Network Log Line Regex:',
    'ja-JP': 'ネットワークログライン正規表現：',
    'zh-CN': '网络日志行正则表达式：',
    'zh-TW': '網路日誌行正規表示式：',
  },
  actLogLineRegexes: {
    'en-US': 'Parsed Log Line Regex:',
    'ja-JP': 'ACTログライン正規表現：', // FIXME
    'zh-CN': 'ACT日志行正则表达式：', // FIXME
    'zh-TW': 'ACT日誌行正規表示式：', // FIXME
  },
  examples: {
    'en-US': 'Examples',
    'ja-JP': '例',
    'zh-CN': '示例',
    'zh-TW': '示例',
  },
  networkLogLineExamples: {
    'en-US': 'Network Log Line Examples:',
    'ja-JP': 'ネットワークログライン例：',
    'zh-CN': '网络日志行示例：',
    'zh-TW': '網路日誌行示例：',
  },
  actLogLineExamples: {
    'en-US': 'Parsed Log Line Examples:',
    'ja-JP': 'ACTログライン例：', // FIXME
    'zh-CN': 'ACT日志行示例：', // FIXME
    'zh-TW': 'ACT日誌行示例：', // FIXME
  },
};

type LogGuideOptions = {
  lang?: string;
  type?: string;
};

const isLineType = (type?: string): type is LineDocTypes => {
  return type !== undefined && type in lineDocs;
};

const mappedLogLines: LocaleObject<LineDocTypes[]> = {
  'en-US': [],
};

const config: markdownMagic.Configuration = {
  transforms: {
    logLines(_content, options: LogGuideOptions): string {
      const locale = options.lang;
      const lineType = options.type;
      if (!isLocale(locale)) {
        console.error(`Received invalid locale specification: ${locale ?? 'undefined'}`);
        process.exit(-1);
      }
      if (!isLineType(lineType)) {
        console.error(`Received invalid type specification: ${lineType ?? 'undefined'}`);
        process.exit(-2);
      }

      const lineDoc: LineDocs[LineDocTypes] = lineDocs[lineType];

      mappedLogLines[locale] ??= [];
      mappedLogLines[locale]?.push(lineType);

      const logRepo = new LogRepository();
      // Add the default combatants to the repo for name lookup when names are blank
      logRepo.Combatants['10FF0001'] = { spawn: 0, despawn: 0, name: 'Tini Poutini' };
      logRepo.Combatants['10FF0002'] = { spawn: 0, despawn: 0, name: 'Potato Chippy' };

      let ret = '';
      const lineDef = logDefinitions[lineType];
      const structureNetworkArray = [
        lineDef.type,
        '2021-04-26T14:11:35.0000000-04:00',
      ];
      let lastIndex = 0;

      for (const [name, index] of Object.entries(lineDef.fields)) {
        if (['type', 'timestamp'].includes(name))
          continue;
        structureNetworkArray[index] = `[${name}]`;
        lastIndex = Math.max(lastIndex, index);
      }

      for (let index = 2; index <= lastIndex; ++index)
        structureNetworkArray[index] ??= '[?]';

      let structureNetwork = structureNetworkArray.join('|');
      structureNetworkArray.push('placeholder for hash removal');
      const structureLogLine = ParseLine.parse(logRepo, structureNetworkArray.join('|'));
      let structureLog = structureLogLine?.convertedLine;

      if (structureLog === undefined)
        throw new UnreachableCode();

      // Replace default timestamp with `[timestamp]` indicator
      // We have to do this here because LineEvent needs to parse the timestamp to convert
      structureNetwork = structureNetwork.replace(/^(\d+)\|[^|]+\|/, '$1|[timestamp]|');
      structureLog = structureLog.replace(/^\[[^\]]+\]/, '[timestamp]');

      // Correct the structure for the AddedCombatant line not allowing a placeholder for job
      if (lineType === 'AddedCombatant')
        structureLog = structureLog.replace(/Job: NONE/, 'Job: [job]');

      const examples = translate(locale, lineDoc.examples);

      const examplesNetwork = examples.join('\n') ?? '';
      const examplesLogLine = examples.map((e) => {
        const line = ParseLine.parse(logRepo, e);
        if (!line)
          throw new UnreachableCode();
        return line?.convertedLine;
      }).join('\n') ?? '';

      const regexes: LineDocRegex = {
        network: lineDoc.regexes?.network ?? buildNetRegex(lineType, { capture: true }).source,
        logLine: lineDoc.regexes?.logLine ?? buildRegex(lineType, { capture: true }).source,
      };

      ret += `
#### ${translate(locale, titles.structure)}

\`\`\`log
${translate(locale, titles.networkLogLineStructure)}
${structureNetwork}

${translate(locale, titles.actLogLineStructure)}
${structureLog}
\`\`\`
`;

      ret += `
#### ${translate(locale, titles.regexes)}

\`\`\`log
${translate(locale, titles.networkLogLineRegexes)}
${regexes.network}
`;

      ret += `
${translate(locale, titles.actLogLineRegexes)}
${regexes.logLine}
`;
      ret += '```\n';

      ret += `
#### ${translate(locale, titles.examples)}

\`\`\`log
${translate(locale, titles.networkLogLineExamples)}
${examplesNetwork}

${translate(locale, titles.actLogLineExamples)}
${examplesLogLine}
\`\`\`
`;
      return ret;
    },
  },
};

const enLogGuidePath = path.posix.relative(
  curPath,
  path.posix.join(curPath, 'docs', 'LogGuide.md'),
);

markdownMagic(
  [
    enLogGuidePath,
    path.posix.relative(curPath, path.posix.join(curPath, 'docs', '*', 'LogGuide.md')),
  ],
  config,
  (_error, output) => {
    let exitCode = 0;
    for (const file of output) {
      const filePath = file.originalPath;
      // Figure out what language this file is by checking the path, default to 'en'
      const locale = locales.filter((l) =>
        RegExp(`[^\\w]${l}[^\\w]`).exec(filePath.toLowerCase())
      )[0] ?? 'en-US';
      const convertedLines = mappedLogLines[locale];
      for (const type in logDefinitions) {
        if (!isLineType(type))
          continue;
        if (!convertedLines?.includes(type)) {
          console.error(`Locale ${locale} is missing LogGuide doc entry for type ${type}`);
          exitCode = 1;
        }
      }
    }
    process.exit(exitCode);
  },
);
