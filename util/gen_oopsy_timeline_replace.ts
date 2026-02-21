import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { getCnTable, getKoTable, getTcTable, type Table } from './csv_util';
import { walkDirSync } from './file_utils';
import { XivApi } from './xivapi';

const rootDir = 'ui/oopsyraidsy/data';
const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();

// --- Types ---

type BNpcNameRow = {
  row_id: number;
  fields: {
    Singular?: string;
    'Singular@de'?: string;
    'Singular@fr'?: string;
    'Singular@ja'?: string;
  };
};

const localesFromXivApi = ['de', 'fr', 'ja'] as const;
const localesFromGitHub = ['cn', 'ko', 'tc'] as const;
type Locale = typeof localesFromXivApi[number] | typeof localesFromGitHub[number];
const allLocales: Locale[] = [...localesFromXivApi, ...localesFromGitHub];

interface LocaleData {
  enBnpcMap: Map<string, number[]>;
  allLocaleMaps: Map<Locale, Map<number, string>>;
}

type ReplaceSyncResult = {
  replaceSync: { [key: string]: string };
  allTranslated: boolean;
};

type RawApiData = {
  bnpcData: unknown;
  koTable: Table<'#', 'Singular'>;
  cnTable: Table<'#', 'Singular'>;
  tcTable: Table<'#', 'Singular'>;
};

// --- File & String Utilities ---

const getTargetFiles = (target?: string): string[] => {
  const files: string[] = [];
  const filter = target?.replace(/\.[jt]s$/, '').split(path.sep).join(path.posix.sep);

  walkDirSync(rootDir, (filename) => {
    if (filename.endsWith('.ts') && !filename.includes('00-misc')) {
      if (filter === undefined || filter === '' || filename.endsWith(`${filter}.ts`))
        files.push(filename);
    }
  });

  if (target !== undefined && files.length === 0)
    log.fatalError(`Could not find oopsy file for ${target}`);
  return files.sort();
};

const replaceGermanGrammarTags = (name: string): string => {
  return name.replace(/\[t\]/g, '(?:der|die|das)')
    .replace(/\[a\]/g, '(?:e|er|es|en)')
    .replace(/\[A\]/g, '(?:e|er|es|en)')
    .replace(/\[p\]/g, '')
    .trim();
};

const parseExistingTimelineReplace = (
  content: string,
): Map<Locale, Map<string, string>> => {
  const result = new Map<Locale, Map<string, string>>();
  const match = /timelineReplace:\s*\[([\s\S]*?)\],/.exec(content);
  if (!match)
    return result;

  const arrayContent = match[1] ?? '';
  const blockRegex = /{\s*'locale':\s*'(\w+)'[\s\S]*?'replaceSync':\s*{([\s\S]*?)}\s*,?\s*}/g;

  for (const block of arrayContent.matchAll(blockRegex)) {
    const locale = block[1] as Locale;
    const syncContent = block[2] ?? '';
    const translations = new Map<string, string>();
    const kvRegex = /'([^'\\]*(?:\\.[^'\\]*)*)':\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g;

    for (const kv of syncContent.matchAll(kvRegex)) {
      translations.set((kv[1] ?? '').replace(/\\'/g, `'`), (kv[2] ?? '').replace(/\\'/g, `'`));
    }

    if (translations.size > 0)
      result.set(locale, translations);
  }
  return result;
};

const extractEnglishSources = (content: string): Set<string> => {
  const sources = new Set<string>();
  const syncFieldNames = ['source', 'target'];
  const sourceRegex = new RegExp(
    `(?:${syncFieldNames.join('|')}):\\s*(?:['"]([^'"]+)['"]|\\[((?:['"][^'"]+['"],?\\s*)+)\\])`,
    'g',
  );

  for (const match of content.matchAll(sourceRegex)) {
    const single = match[1];
    const list = match[2];
    if (single !== undefined) {
      sources.add(single);
    } else if (list !== undefined) {
      list.replace(/['"]/g, '').split(',').forEach((s) => {
        const trimmed = s.trim();
        if (trimmed !== '')
          sources.add(trimmed);
      });
    }
  }

  // Deduplicate sources by case-insensitive comparison (keep first alphabetically)
  const seenSources = new Map<string, string>();
  for (const s of sources) {
    const lower = s.toLowerCase();
    if (!seenSources.has(lower) || s < (seenSources.get(lower) ?? '')) {
      seenSources.set(lower, s);
    }
  }
  return new Set(seenSources.values());
};

// --- Data Fetching & Processing ---

const fetchRawData = async (): Promise<RawApiData> => {
  log.info('Fetching BNpcName data...');
  const xivApi = new XivApi(null, log);

  const [bnpcData, koTable, cnTable, tcTable] = await Promise.all([
    xivApi.queryApi('BNpcName', ['Singular', ...localesFromXivApi.map((l) => `Singular@${l}`)]),
    getKoTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
    getCnTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
    getTcTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
  ]);

  return { bnpcData, koTable, cnTable, tcTable };
};

const buildLocaleMaps = (rawData: RawApiData): LocaleData => {
  const { bnpcData, koTable, cnTable, tcTable } = rawData;
  const githubTables: { [locale: string]: Table<'#', 'Singular'> } = {
    cn: cnTable,
    ko: koTable,
    tc: tcTable,
  };

  const enBnpcMap = new Map<string, number[]>();
  for (const row of bnpcData as BNpcNameRow[]) {
    const name = row.fields.Singular?.toLowerCase();
    if (name !== undefined && name !== '') {
      const ids = enBnpcMap.get(name) ?? [];
      ids.push(row.row_id);
      enBnpcMap.set(name, ids);
    }
  }

  const allLocaleMaps = new Map<Locale, Map<number, string>>();

  for (const locale of localesFromXivApi) {
    const field = `Singular@${locale}` as keyof BNpcNameRow['fields'];
    const map = new Map<number, string>();
    for (const row of bnpcData as BNpcNameRow[]) {
      const val = row.fields[field];
      if (typeof val === 'string' && val.trim() !== '') {
        const name = locale === 'de' ? replaceGermanGrammarTags(val) : val.trim();
        map.set(row.row_id, name);
      }
    }
    allLocaleMaps.set(locale, map);
  }

  localesFromGitHub.forEach((locale) => {
    const table = githubTables[locale];
    if (table === undefined)
      return;
    const map = new Map<number, string>();
    for (const [idStr, row] of Object.entries(table)) {
      const name = row['Singular'];
      if (name !== undefined && name.trim() !== '')
        map.set(parseInt(idStr), name.trim());
    }
    allLocaleMaps.set(locale, map);
  });

  return { enBnpcMap, allLocaleMaps };
};

const fetchLocaleData = async (): Promise<LocaleData> => {
  const rawData = await fetchRawData();
  return buildLocaleMaps(rawData);
};

// --- Generation Logic ---

const getCandidates = (
  source: string,
  enBnpcMap: Map<string, number[]>,
  localeMap: Map<number, string>,
): Set<string> => {
  const candidates = new Set<string>();
  const ids = enBnpcMap.get(source.toLowerCase());

  if (ids !== undefined) {
    for (const id of ids) {
      const localeName = localeMap.get(id);
      if (localeName !== undefined) {
        candidates.add(localeName);
      }
    }
  }
  return candidates;
};

const resolveTranslation = (
  source: string,
  locale: Locale,
  candidates: Set<string>,
  existingValue: string | undefined,
  oopsyFile: string,
): string | undefined => {
  if (candidates.size === 1) {
    const [firstCandidate] = Array.from(candidates);
    return firstCandidate ?? '';
  }

  if (candidates.size > 1) {
    log.alert(
      `${oopsyFile}: Multiple candidates for '${source}' in ${locale}: ${
        Array.from(candidates).join(', ')
      }`,
    );
    if (existingValue !== undefined) {
      log.alert(`         Using existing translation: '${existingValue}'`);
      return existingValue;
    }
    log.alert(`         No existing translation found. Manual review required.`);
    return `(?:${Array.from(candidates).sort().join('|')})`;
  }

  if (existingValue !== undefined) {
    return existingValue;
  }

  log.alert(`${oopsyFile}: Missing translation for '${source}' in ${locale}`);
  return undefined;
};

const generateReplaceSync = (
  locale: Locale,
  uniqueSources: Set<string>,
  localeData: LocaleData,
  existingLocaleTranslations: Map<string, string> | undefined,
  oopsyFile: string,
): ReplaceSyncResult => {
  const replaceSync: { [key: string]: string } = {};
  let translatedCount = 0;

  const { enBnpcMap, allLocaleMaps } = localeData;
  const localeMap = allLocaleMaps.get(locale);
  if (!localeMap)
    return { replaceSync: replaceSync, allTranslated: false };

  for (const source of uniqueSources) {
    const existingValue = existingLocaleTranslations?.get(source);
    const candidates = getCandidates(source, enBnpcMap, localeMap);
    const resolvedValue = resolveTranslation(source, locale, candidates, existingValue, oopsyFile);

    if (resolvedValue !== undefined) {
      replaceSync[source] = resolvedValue;
      translatedCount++;
    }
  }

  const allTranslated = translatedCount === uniqueSources.size;
  return { replaceSync, allTranslated };
};

const generateReplaceBlocks = (
  uniqueSources: Set<string>,
  localeData: LocaleData,
  existingTranslations: Map<Locale, Map<string, string>>,
  oopsyFile: string,
): string[] => {
  return allLocales.map((locale: Locale): string => {
    const { replaceSync, allTranslated } = generateReplaceSync(
      locale,
      uniqueSources,
      localeData,
      existingTranslations.get(locale),
      oopsyFile,
    );

    if (Object.keys(replaceSync).length === 0)
      return '';

    const syncLines = Object.entries(replaceSync).map(([en, loc]: [string, string]) => {
      const escapedEn = en.replace(/'/g, '\\\'');
      const escapedLoc = loc.replace(/'/g, '\\\'');
      return `        '${escapedEn}': '${escapedLoc}',`;
    }).join('\r\n');

    const lines = [
      `    {`,
      `      'locale': '${locale}',`,
      ...(allTranslated ? [] : [`      'missingTranslations': true,`]),
      `      'replaceSync': {`,
      syncLines,
      `      },`,
      `    },`,
    ];
    return lines.join('\r\n');
  }).filter((b) => b !== '');
};

const insertNewBlocks = (content: string, replaceBlocks: string[]): string | false => {
  if (replaceBlocks.length === 0)
    return false;

  const newBlock = `\r\n  timelineReplace: [\r\n${replaceBlocks.join('\r\n')}\r\n  ],`;
  const replaceRegex = /(\s*)timelineReplace:\s*\[[\s\S]*?\],/;
  const insertRegex = /(};\s*\n\s*export default triggerSet;)/;

  if (replaceRegex.test(content)) {
    return content.replace(replaceRegex, newBlock);
  } else if (insertRegex.test(content)) {
    return content.replace(insertRegex, `${newBlock.slice(2)}\n$1`);
  }
  return false;
};

// --- Main Processing ---

const processFile = (oopsyFile: string, localeData: LocaleData): boolean => {
  const content = fs.readFileSync(oopsyFile, 'utf8');

  const uniqueSources = extractEnglishSources(content);
  if (uniqueSources.size === 0)
    return false;

  const existingTranslations = parseExistingTimelineReplace(content);

  const replaceBlocks = generateReplaceBlocks(
    uniqueSources,
    localeData,
    existingTranslations,
    oopsyFile,
  );

  const updatedContent = insertNewBlocks(content, replaceBlocks);
  if (updatedContent === false)
    return false;

  fs.writeFileSync(oopsyFile, updatedContent, 'utf8');
  return true;
};

const genOopsyTimelineReplace = async (logLevel: LogLevelKey, target?: string): Promise<void> => {
  log.setLogLevel(logLevel);
  log.info(`Starting processing for ${_SCRIPT_NAME}`);

  try {
    const filesToProcess = getTargetFiles(target);
    if (filesToProcess.length > 1)
      log.info(`Processing ${filesToProcess.length} oopsy files...`);

    const localeData = await fetchLocaleData();

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of filesToProcess) {
      try {
        const updated = processFile(file, localeData);
        if (updated) {
          log.info(`Updated: ${file}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        log.nonFatalError(`Error processing ${file}:`);
        if (err instanceof Error) {
          log.printNoHeader(err.message);
          log.debug(err.stack ?? '');
        } else {
          log.printNoHeader(String(err));
        }
      }
    }

    log.successDone(`Updated: ${updatedCount}, Skipped: ${skippedCount}`);
  } catch (err) {
    if (err instanceof Error) {
      log.fatalError(`Fatal initialization error: ${err.message}\n${err.stack ?? ''}`);
    } else {
      log.fatalError(`Fatal initialization error: ${String(err)}`);
    }
  }
};

export default genOopsyTimelineReplace;

if (
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2);
  void genOopsyTimelineReplace('alert', args[0]);
}
