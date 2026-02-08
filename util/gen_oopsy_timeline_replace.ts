import fs from 'fs';
import path from 'path';

import { getCnTable, getKoTable, getTcTable } from './csv_util';
import { walkDirSync } from './file_utils';
import { XivApi } from './xivapi';

const rootDir = 'ui/oopsyraidsy/data';

const findOopsyFile = (shortName: string): string | undefined => {
  shortName = shortName.replace(/\.[jt]s$/, '').split(path.sep).join(path.posix.sep);
  let found = undefined;
  walkDirSync(rootDir, (filename) => {
    if (filename.endsWith(`${shortName}.ts`))
      found = filename;
  });
  return found;
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

const run = async () => {
  const args = process.argv.slice(2);
  const target = args[0];

  if (target === undefined) {
    console.error(
      'Usage: node --loader=ts-node/esm util/gen_oopsy_timeline_replace.ts <target_file>',
    );
    console.error(
      'Example: node --loader=ts-node/esm util/gen_oopsy_timeline_replace.ts sephirot-ex',
    );
    return;
  }

  const oopsyFile = findOopsyFile(target);
  if (oopsyFile === undefined) {
    console.error(`Could not find oopsy file for ${target}`);
    return;
  }

  console.error(`Processing: ${oopsyFile}`);

  const content = fs.readFileSync(oopsyFile, 'utf8');

  // --- Extract replaceSync candidates (source: 'Name') ---
  const sources = new Set<string>();
  const sourceRegex = /source:\s*(?:['"]([^'"]+)['"]|\[((?:['"][^'"]+['"],?\s*)+)\])/g;
  let sourceMatch = sourceRegex.exec(content);
  while (sourceMatch !== null) {
    if (sourceMatch[1] !== undefined) {
      sources.add(sourceMatch[1]);
    } else if (sourceMatch[2] !== undefined) {
      const list = sourceMatch[2].replace(/['"]/g, '').split(',').map((s) => s.trim());
      for (const s of list) {
        if (s !== '')
          sources.add(s);
      }
    }
    sourceMatch = sourceRegex.exec(content);
  }

  // --- Fetch from XIVAPI (includes en, de, fr, ja) ---
  console.error('Fetching BNpcName from XIVAPI...');
  const xivApi = new XivApi(null);
  const bnpcData = await xivApi.queryApi('BNpcName', [
    'Singular',
    'Singular@de',
    'Singular@fr',
    'Singular@ja',
  ]) as BNpcNameRow[];

  // Map Name -> IDs[] (English)
  const enBnpcMap = new Map<string, number[]>();
  for (const row of bnpcData) {
    const id = row.row_id;
    const name = row.fields.Singular;
    if (typeof name === 'string' && name.trim() !== '') {
      const lowerName = name.toLowerCase();
      if (!enBnpcMap.has(lowerName))
        enBnpcMap.set(lowerName, []);
      enBnpcMap.get(lowerName)?.push(id);
    }
  }

  // Build locale maps for XIVAPI locales (de, fr, ja)
  const xivApiLocaleMaps = new Map<string, Map<number, string>>();
  for (const locale of localesFromXivApi) {
    const fieldName = `Singular@${locale}` as keyof BNpcNameRow['fields'];
    const localeMap = new Map<number, string>();
    for (const row of bnpcData) {
      const id = row.row_id;
      const name = row.fields[fieldName];
      if (typeof name === 'string' && name.trim() !== '') {
        localeMap.set(id, name);
      }
    }
    xivApiLocaleMaps.set(locale, localeMap);
  }

  // Fetch GitHub locales (ko, cn, tc)
  console.error('Fetching KO BNpcName from GitHub...');
  const koBnpcTable = await getKoTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']);
  console.error('Fetching CN BNpcName from GitHub...');
  const cnBnpcTable = await getCnTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']);
  console.error('Fetching TC BNpcName from GitHub...');
  const tcBnpcTable = await getTcTable('BNpcName', ['#', 'Singular'], ['#', 'Singular']);

  const buildMapFromTable = (table: typeof koBnpcTable): Map<number, string> => {
    const map = new Map<number, string>();
    for (const [idStr, row] of Object.entries(table)) {
      const id = parseInt(idStr);
      const name = row['Singular'];
      if (!isNaN(id) && name !== undefined && name.trim() !== '') {
        map.set(id, name);
      }
    }
    return map;
  };

  const githubLocaleMaps = new Map<string, Map<number, string>>([
    ['ko', buildMapFromTable(koBnpcTable)],
    ['cn', buildMapFromTable(cnBnpcTable)],
    ['tc', buildMapFromTable(tcBnpcTable)],
  ]);

  // Combine all locale maps
  const allLocaleMaps = new Map<Locale, Map<number, string>>();
  for (const [locale, map] of xivApiLocaleMaps) {
    allLocaleMaps.set(locale as Locale, map);
  }
  for (const [locale, map] of githubLocaleMaps) {
    allLocaleMaps.set(locale as Locale, map);
  }

  // Generate replaceSync for each source
  const generateReplaceSync = (localeMap: Map<number, string>): { [key: string]: string } => {
    const replaceSync: { [key: string]: string } = {};
    for (const source of sources) {
      const ids = enBnpcMap.get(source.toLowerCase());
      if (ids !== undefined) {
        const candidates = new Set<string>();
        for (const id of ids) {
          const localeName = localeMap.get(id);
          if (localeName !== undefined) {
            candidates.add(localeName);
          }
        }
        if (candidates.size > 0) {
          replaceSync[source] = Array.from(candidates).sort().join(' / ');
        }
      }
    }
    return replaceSync;
  };

  // --- Generate Output for ALL locales ---
  const outputLines: string[] = [];
  outputLines.push('[');

  const allLocales: Locale[] = ['de', 'fr', 'ja', 'cn', 'ko', 'tc'];
  for (const locale of allLocales) {
    const localeMap = allLocaleMaps.get(locale);
    if (localeMap === undefined)
      continue;

    const replaceSync = generateReplaceSync(localeMap);
    if (Object.keys(replaceSync).length === 0)
      continue;

    outputLines.push('  {');
    outputLines.push(`    'locale': '${locale}',`);
    outputLines.push(`    'missingTranslations': true,`);
    outputLines.push('    \'replaceSync\': {');
    for (const [en, localized] of Object.entries(replaceSync)) {
      outputLines.push(`      '${en}': '${localized}',`);
    }
    outputLines.push('    },');
    outputLines.push('  },');
  }

  outputLines.push(']');

  console.log(outputLines.join('\n'));
};

run().catch((e) => console.error(e));
