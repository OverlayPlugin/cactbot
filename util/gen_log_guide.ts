import path from 'path';

import markdownMagic from 'markdown-magic';

import { Lang, NonEnLang } from '../resources/languages';
import logDefinitions from '../resources/netlog_defs';
import { buildRegex as buildNetRegex } from '../resources/netregexes';
import { UnreachableCode } from '../resources/not_reached';
import { buildRegex } from '../resources/regexes';
import LogRepository from '../ui/raidboss/emulator/data/network_log_converter/LogRepository';
import ParseLine from '../ui/raidboss/emulator/data/network_log_converter/ParseLine';

import lineDocs, { ExampleLineDef, ExampleLineName } from './example_log_lines';

const curPath = path.resolve();

// For compatibility with the path of the LogGuide.md file
// TODO: Some of this could be moved to ../resources/languages, but that file
// uses 'locale' inconsistently, so it would require more comprehensive changes.
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

const translateToLocale = <T>(locale: Locale, obj: LocaleObject<T>): T => {
  return obj[locale] ?? obj['en-US'];
};

type LocaleText = LocaleObject<string>;

type LangStrings =
  & {
    // cactbot-ignore-missing-translations
    en: readonly string[];
  }
  & {
    [lang in NonEnLang]?: readonly string[];
  };

const translateToLang = (lang: Lang, obj: LangStrings) => {
  return obj[lang] ?? obj['en'];
};

const localeToLangMap: Record<Locale, Lang> = {
  'en-US': 'en',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'zh-CN': 'cn',
  'zh-TW': 'cn',
};

const localeToLang = (locale: Locale): Lang => {
  return localeToLangMap[locale];
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
    'zh-CN': '解析日志行结构：',
    'zh-TW': '解析日誌行結構：',
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
    'zh-CN': '解析日志行正则表达式：',
    'zh-TW': '解析日誌行正規表示式：',
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
    'zh-CN': '解析日志行示例：',
    'zh-TW': '解析日誌行示例：',
  },
};

type LogGuideOptions = {
  lang?: string;
  type?: string;
};

const isLineType = (type?: string): type is ExampleLineName => {
  return type !== undefined && type in lineDocs;
};

const mappedLogLines: LocaleObject<ExampleLineName[]> = {
  'en-US': [],
};

const config: markdownMagic.Configuration = {
  transforms: {
    logLines(_content, options: LogGuideOptions): string {
      // TODO: Each localized 'LogGuide.md' file passes the locale string as a 'lang' param,
      // At some point, this should be changed to 'locale' for internal consistency.
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
      const examplesLang = localeToLang(locale);

      const lineDoc: ExampleLineDef = lineDocs[lineType];

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

      const examples = translateToLang(examplesLang, lineDoc.examples);

      const examplesNetwork = examples.join('\n') ?? '';
      const examplesLogLine = examples.map((e) => {
        const line = ParseLine.parse(logRepo, e);
        if (!line)
          throw new UnreachableCode();
        return line?.convertedLine;
      }).join('\n') ?? '';

      const regexes = {
        network: lineDoc.regexes?.network ?? buildNetRegex(lineType, { capture: true }).source,
        logLine: lineDoc.regexes?.logLine ?? buildRegex(lineType, { capture: true }).source,
      };

      ret += `
#### ${translateToLocale(locale, titles.structure)}

\`\`\`log
${translateToLocale(locale, titles.networkLogLineStructure)}
${structureNetwork}

${translateToLocale(locale, titles.actLogLineStructure)}
${structureLog}
\`\`\`
`;

      ret += `
#### ${translateToLocale(locale, titles.regexes)}

\`\`\`log
${translateToLocale(locale, titles.networkLogLineRegexes)}
${regexes.network}
`;

      ret += `
${translateToLocale(locale, titles.actLogLineRegexes)}
${regexes.logLine}
`;
      ret += '```\n';

      ret += `
#### ${translateToLocale(locale, titles.examples)}

\`\`\`log
${translateToLocale(locale, titles.networkLogLineExamples)}
${examplesNetwork}

${translateToLocale(locale, titles.actLogLineExamples)}
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
