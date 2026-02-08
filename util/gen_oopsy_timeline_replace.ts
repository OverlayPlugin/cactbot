import fs from 'fs';
import path from 'path';

import { getCnTable, getKoTable, getTcTable, type Table } from './csv_util';
import { walkDirSync } from './file_utils';
import { XivApi } from './xivapi';

const rootDir = 'ui/oopsyraidsy/data';

const getTargetFiles = (target?: string): string[] => {
  const files: string[] = [];
  const filter = target?.replace(/\.[jt]s$/, '').split(path.sep).join(path.posix.sep);

  walkDirSync(rootDir, (filename) => {
    if (filename.endsWith('.ts') && !filename.includes('00-misc')) {
      if (filter === undefined || filter === '' || filename.endsWith(`${filter}.ts`))
        files.push(filename);
    }
  });

  if (target !== undefined && files.length === 0) {
    console.error(`Could not find oopsy file for ${target}`);
    process.exit(1);
  }
  return files.sort();
};

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

// Parse existing timelineReplace from file content
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

const cleanName = (name: string): string => name.replace(/\[[apt]\]/g, '').trim();

const fetchLocaleData = async (): Promise<LocaleData> => {
  console.error('Fetching BNpcName data...');
  const xivApi = new XivApi(null);

  const [bnpcData, koTable, cnTable, tcTable] = await Promise.all([
    xivApi.queryApi('BNpcName', ['Singular', ...localesFromXivApi.map((l) => `Singular@${l}`)]),
    getKoTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
    getCnTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
    getTcTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']),
  ]);

  const githubTables: { [locale: string]: Table<'#', 'Singular'> } = {
    cn: cnTable,
    ko: koTable,
    tc: tcTable,
  };

  // English Map
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

  // XIVAPI Locales
  for (const locale of localesFromXivApi) {
    const field = `Singular@${locale}` as keyof BNpcNameRow['fields'];
    const map = new Map<number, string>();
    for (const row of bnpcData as BNpcNameRow[]) {
      const val = row.fields[field];
      if (typeof val === 'string' && val.trim() !== '')
        map.set(row.row_id, cleanName(val));
    }
    allLocaleMaps.set(locale, map);
  }

  // GitHub Locales
  localesFromGitHub.forEach((locale) => {
    const table = githubTables[locale];
    if (table === undefined)
      return;
    const map = new Map<number, string>();
    for (const [idStr, row] of Object.entries(table)) {
      const name = row['Singular'];
      if (name !== undefined && name.trim() !== '')
        map.set(parseInt(idStr), cleanName(name));
    }
    allLocaleMaps.set(locale, map);
  });

  return { enBnpcMap, allLocaleMaps };
};

const processFile = (oopsyFile: string, localeData: LocaleData): boolean => {
  let content = fs.readFileSync(oopsyFile, 'utf8');

  // --- Extract replaceSync candidates (source: 'Name') ---
  const sources = new Set<string>();
  const sourceRegex = /(?:source|target):\s*(?:['"]([^'"]+)['"]|\[((?:['"][^'"]+['"],?\s*)+)\])/g;
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

  if (sources.size === 0) {
    return false; // No sources to translate
  }

  const { enBnpcMap, allLocaleMaps } = localeData;

  // Parse existing translations
  const existingTranslations = parseExistingTimelineReplace(content);

  // Generate replaceSync for each source with smart merge logic
  // Logic table:
  // | New Data | Multiple Candidates | Existing Translation | Action |
  // |----------|---------------------|----------------------|--------|
  // | ✓ Found  | ✗ Single            | -        | Use new data       |
  // | ✓ Found  | ✓ Multiple          | ✓ Exists | Keep existing + console.warn() |
  // | ✓ Found  | ✓ Multiple          | ✗ None   | Output 'candidate1 / candidate2' (human review) |
  // | ✗ Not found | -                | -        | Keep existing      |
  const generateReplaceSync = (
    locale: Locale,
    localeMap: Map<number, string>,
    existingLocaleTranslations: Map<string, string> | undefined,
  ): { replaceSync: { [key: string]: string }; allTranslated: boolean } => {
    const replaceSync: { [key: string]: string } = {};
    let translatedCount = 0;

    for (const source of sources) {
      const ids = enBnpcMap.get(source.toLowerCase());
      const existingValue = existingLocaleTranslations?.get(source);

      // Collect candidates if IDs exist
      const candidates = new Set<string>();
      if (ids !== undefined) {
        for (const id of ids) {
          const localeName = localeMap.get(id);
          if (localeName !== undefined) {
            candidates.add(localeName);
          }
        }
      }

      if (candidates.size === 1) {
        // Case: New data Found + Single Candidate
        const [firstCandidate] = Array.from(candidates);
        replaceSync[source] = firstCandidate ?? '';
        translatedCount++;
      } else if (candidates.size > 1) {
        // Case: New data Found + Multiple Candidates
        if (existingValue !== undefined) {
          // Keep existing + warn
          console.warn(
            `[WARNING] ${oopsyFile}: Multiple candidates for '${source}' in ${locale}: ${
              Array.from(candidates).join(', ')
            }`,
          );
          console.warn(`         Using existing translation: '${existingValue}'`);
          replaceSync[source] = existingValue;
          translatedCount++;
        } else {
          // No existing: output all candidates for human review
          console.warn(
            `[WARNING] ${oopsyFile}: Multiple candidates for '${source}' in ${locale}: ${
              Array.from(candidates).join(', ')
            }`,
          );
          console.warn(`         No existing translation found. Manual review required.`);
          replaceSync[source] = Array.from(candidates).sort().join(' / ');
          translatedCount++;
        }
      } else if (existingValue !== undefined) {
        // Case: New data Not Found (or 0 candidates) + Existing Translation exists
        replaceSync[source] = existingValue;
        translatedCount++;
      }
      // Case: New data Not Found + No Existing Translation -> Skip
    }

    const allTranslated = translatedCount === sources.size;
    return { replaceSync: replaceSync, allTranslated: allTranslated };
  };

  // --- Generate timelineReplace array ---
  const replaceBlocks = allLocales.map((locale: Locale): string => {
    const map = allLocaleMaps.get(locale);
    if (!map)
      return '';

    const { replaceSync, allTranslated } = generateReplaceSync(
      locale,
      map,
      existingTranslations.get(locale),
    );
    if (Object.keys(replaceSync).length === 0)
      return '';

    const syncLines = Object.entries(replaceSync).map(([en, loc]) => {
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

  if (replaceBlocks.length === 0)
    return false;

  const newBlock = `\r\n  timelineReplace: [\r\n${replaceBlocks.join('\r\n')}\r\n  ],`;

  // --- Insert into file ---
  const replaceRegex = /(\s*)timelineReplace:\s*\[[\s\S]*?\],/;
  const insertRegex = /(};\s*\n\s*export default triggerSet;)/;

  if (replaceRegex.test(content)) {
    content = content.replace(replaceRegex, newBlock);
  } else if (insertRegex.test(content)) {
    content = content.replace(insertRegex, `${newBlock.slice(2)}\n$1`);
  } else {
    return false;
  }

  fs.writeFileSync(oopsyFile, content, 'utf8');
  return true;
};

const run = async () => {
  try {
    const args = process.argv.slice(2);
    const target = args[0];

    // Determine which files to process
    const filesToProcess = getTargetFiles(target);
    if (filesToProcess.length > 1)
      console.error(`Processing ${filesToProcess.length} oopsy files...`);

    // Fetch locale data once
    const localeData = await fetchLocaleData();

    let updatedCount = 0;
    let skippedCount = 0;

    for (const file of filesToProcess) {
      try {
        const updated = processFile(file, localeData);
        if (updated) {
          console.error(`Updated: ${file}`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`Error processing ${file}:`);
        console.error(err);
      }
    }

    console.error(`\nDone. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
  } catch (err) {
    console.error('Fatal initialization error:');
    if (err instanceof Error) {
      console.error(err.message);
      console.error(err.stack);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
};

run().catch((e: unknown) => {
  console.error('Top-level unhandled rejection:');
  if (e instanceof Error) {
    console.error(e.message);
    console.error(e.stack);
  } else {
    console.error(e);
  }
  process.exit(1);
});
