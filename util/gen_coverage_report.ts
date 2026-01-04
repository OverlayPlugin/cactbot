import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { simpleGit } from 'simple-git';

import contentList from '../resources/content_list';
import ContentType from '../resources/content_type';
import { isLang, Lang, languages } from '../resources/languages';
import ZoneId from '../resources/zone_id';
import ZoneInfo from '../resources/zone_info';
import { LooseOopsyTriggerSet } from '../types/oopsy';
import { LooseTriggerSet } from '../types/trigger';
import { oopsyTriggerSetFields } from '../ui/oopsyraidsy/oopsy_fields';
import { TimelineParser } from '../ui/raidboss/timeline_parser';

import {
  Coverage,
  CoverageEntry,
  CoverageTotals,
  Pulls,
  Tag,
  Tags,
  TranslationTotals,
} from './coverage/coverage.d';
import { findMissingTranslations, MissingTranslationErrorType } from './find_missing_translations';
import findManifestFiles from './manifest';

type MissingTranslations = {
  file: string;
  line?: number;
  type: MissingTranslationErrorType;
  message: string;
};

type MissingTranslationsDict = {
  [lang in Lang]?: MissingTranslations[];
};

type SimpleGit = ReturnType<typeof simpleGit>;

// This hash is the default "initial commit" hash for git, all repos have it
// If for some reason the entire git tree is re-imported into a newer version of git,
// the default commit hash will be an SHA-256 hash as follows instead:
// 6ef19b41225c5369f1c104d45d8d85efa9b057b53b14b4b9b939dd74decc5321
// This can be derived as needed via `git hash-object -t tree /dev/null`
const DEFAULT_COMMIT_HASH = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

const notUndefined = <T>(v: T | undefined): v is T => v !== undefined;

// Paths are relative to current file.
// We can't import the manifest directly from util/ because that's webpack magic,
// so need to do the same processing its loader would do.
const raidbossManifest = '../ui/raidboss/data/raidboss_manifest.txt';
const oopsyManifest = '../ui/oopsyraidsy/data/oopsy_manifest.txt';
const outputFileName = 'coverage/coverage_report.ts';

const missingOutputFileNames = {
  de: 'coverage/missing_translations_de.html',
  fr: 'coverage/missing_translations_fr.html',
  ja: 'coverage/missing_translations_ja.html',
  cn: 'coverage/missing_translations_cn.html',
  ko: 'coverage/missing_translations_ko.html',
  tc: 'coverage/missing_translations_tc.html',
};

const basePath = () => path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const baseUrl = 'https://github.com/OverlayPlugin/cactbot/blob/main';

const emptyCoverage = (): CoverageEntry => {
  return {
    triggers: {
      num: 0,
    },
    timeline: {},
    files: [],
    lastModified: 0,
    allTags: [],
    openPRs: [],
    comments: [],
  };
};

const processRaidbossFile = (
  triggerFileName: string,
  zoneId: number,
  triggerSet: LooseTriggerSet,
  timelineFileName: string | undefined,
  timelineContents: string | undefined,
  coverage: Coverage,
  missingTranslations: MissingTranslationsDict,
  isSingle: boolean,
) => {
  let numTriggers = 0;
  if (triggerSet.triggers)
    numTriggers += triggerSet.triggers.length;
  if (triggerSet.timelineTriggers)
    numTriggers += triggerSet.timelineTriggers.length;

  const thisCoverage = coverage[zoneId] ??= emptyCoverage();

  thisCoverage.files?.push({ name: triggerFileName });
  if (timelineFileName !== undefined)
    thisCoverage.files?.push({ name: timelineFileName });

  const timelineEntry: Coverage[string]['timeline'] = thisCoverage.timeline ?? {};
  if (timelineContents !== undefined) {
    const timelineParser = new TimelineParser(timelineContents, [], []);
    timelineEntry.entries = timelineParser.events.length;
    const firstEvent = timelineParser.events.sort((l, r) => l.time - r.time)[0]?.time ?? 0;
    const lastEvent = timelineParser.events.sort((l, r) => r.time - l.time)[0]?.time ?? 0;
    timelineEntry.duration = lastEvent - firstEvent;

    // TODO: Consider if this covers all edge cases.
    timelineEntry.hasFile = timelineEntry.duration > 5;
  }

  if (triggerSet.hasNoTimeline)
    timelineEntry.hasNoTimeline = true;
  else if (triggerSet.timelineNeedsFixing)
    timelineEntry.timelineNeedsFixing = true;

  thisCoverage.timeline = timelineEntry;
  thisCoverage.triggers.num = numTriggers;

  if (triggerSet.comments) {
    thisCoverage.comments?.push(triggerSet.comments);
  }

  if (isSingle)
    thisCoverage.label = triggerSet.zoneLabel;

  for (const [lang, missing] of Object.entries(missingTranslations)) {
    if (!isLang(lang))
      continue;
    if (lang === 'en')
      continue;
    for (const translation of missing) {
      if (translation.file !== triggerFileName && translation.file !== timelineFileName)
        continue;
      const langEntry = (thisCoverage.translations ??= {})[lang] ??= {};
      const translationCountEntry = (thisCoverage.translationCount ??= {});
      translationCountEntry[translation.type] = (translationCountEntry[translation.type] ?? 0) + 1;
      langEntry[translation.type] = (langEntry[translation.type] ?? 0) + 1;
    }
  }
};

const processRaidbossCoverage = async (
  manifest: string,
  coverage: Coverage,
  missingTranslations: MissingTranslationsDict,
) => {
  const manifestLines = findManifestFiles(manifest);
  const dataDir = path.dirname(manifest);
  for (const line of manifestLines) {
    if (!line.endsWith('.js') && !line.endsWith('.ts'))
      continue;
    const triggerFileName = path.join(dataDir, line).replace(/\\/g, '/');

    // Dynamic imports don't have a type, so add type assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const triggerSet = (await import(triggerFileName)).default as LooseTriggerSet;

    let timelineContents: string | undefined = undefined;
    const timelineFileName = triggerSet.timelineFile !== undefined
      ? path.join(path.dirname(triggerFileName), triggerSet.timelineFile).replace(/\\/g, '/')
      : undefined;
    if (timelineFileName !== undefined) {
      try {
        timelineContents = fs.readFileSync(timelineFileName).toString();
        if (!timelineContents)
          continue;
      } catch (e) {
        console.error(e);
      }
    }

    const zoneId = triggerSet.zoneId;
    if (zoneId === undefined) {
      console.error(`${line}: Missing ZoneId`);
      continue;
    }

    // Only process real zones.
    if (zoneId === ZoneId.MatchAll)
      continue;
    if (!Array.isArray(zoneId) && !ZoneInfo[zoneId])
      continue;

    // TODO: this is kind of a hack, and maybe we should do this better.
    // We're importing from util/, so remove the ../ on the path names
    const triggerRelPath = triggerFileName.replace(/^\.\.\//, '');
    const timelineRelPath = timelineFileName?.replace(/^\.\.\//, '');

    if (Array.isArray(zoneId)) {
      for (const id of zoneId)
        processRaidbossFile(
          triggerRelPath,
          id,
          triggerSet,
          timelineRelPath,
          timelineContents,
          coverage,
          missingTranslations,
          false,
        );
    } else {
      processRaidbossFile(
        triggerRelPath,
        zoneId,
        triggerSet,
        timelineRelPath,
        timelineContents,
        coverage,
        missingTranslations,
        true,
      );
    }
  }
};

const processOopsyFile = (
  triggerFileName: string,
  _triggerFile: string,
  zoneId: number,
  triggerSet: LooseOopsyTriggerSet,
  coverage: Coverage,
) => {
  let numTriggers = 0;

  for (const field of oopsyTriggerSetFields) {
    const obj = triggerSet[field];
    if (obj === undefined || obj === null)
      continue;
    if (typeof obj !== 'object')
      continue;
    // These can be either arrays or objects.
    numTriggers += Object.keys(obj).length;
  }

  // TODO: have find_missing_timeline_translations.js return a set of
  // translations that are missing so that we can include percentage translated
  // here as well.

  const thisCoverage = coverage[zoneId] ??= emptyCoverage();
  thisCoverage.oopsy = { num: numTriggers };
  thisCoverage.files?.push({
    name: triggerFileName.replace(/^\.\.\//, ''),
  });
};

const processOopsyCoverage = async (manifest: string, coverage: Coverage) => {
  const manifestLines = findManifestFiles(manifest);
  const dataDir = path.dirname(manifest);
  for (const line of manifestLines) {
    if (!line.endsWith('.js') && !line.endsWith('.ts'))
      continue;
    const triggerFileName = path.join(dataDir, line).replace(/\\/g, '/');

    // Dynamic imports don't have a type, so add type assertion.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const triggerSet = (await import(triggerFileName)).default as LooseOopsyTriggerSet;

    const zoneId = triggerSet.zoneId;
    if (zoneId === undefined) {
      console.error(`${line}: Missing ZoneId`);
      continue;
    }

    // Only process real zones.
    if (zoneId === ZoneId.MatchAll)
      continue;
    if (!Array.isArray(zoneId) && !ZoneInfo[zoneId])
      continue;

    if (Array.isArray(zoneId)) {
      for (const id of zoneId) {
        if (id !== ZoneId.MatchAll)
          processOopsyFile(triggerFileName, line, id, triggerSet, coverage);
      }
    } else {
      processOopsyFile(triggerFileName, line, zoneId, triggerSet, coverage);
    }
  }
};

const buildTotals = (coverage: Coverage, missingTranslations: MissingTranslationsDict) => {
  // Find the set of content types and versions that appear.
  const contentTypeSet = new Set<number>();
  const versionSet = new Set<number>();
  for (const zoneId of contentList) {
    if (zoneId === ZoneId.MatchAll)
      continue;
    const zoneInfo = ZoneInfo[zoneId];
    if (!zoneInfo)
      continue;
    if (zoneInfo.contentType)
      contentTypeSet.add(zoneInfo.contentType);
    versionSet.add(zoneInfo.exVersion);
  }
  const contentTypes = Array.from(contentTypeSet);
  const versions = Array.from(versionSet);

  const defaultTotal = { raidboss: 0, oopsy: 0, total: 0 };

  const defaultTranslationTotal = { totalFiles: 0, translatedFiles: 0, missingFiles: 0, errors: 0 };
  const translationTotals: TranslationTotals = {
    de: { ...defaultTranslationTotal },
    fr: { ...defaultTranslationTotal },
    ja: { ...defaultTranslationTotal },
    cn: { ...defaultTranslationTotal },
    ko: { ...defaultTranslationTotal },
    tc: { ...defaultTranslationTotal },
  };

  // Initialize return object.
  const totals: CoverageTotals = {
    byExpansion: {},
    byContentType: {},
    overall: { ...defaultTotal },
  };
  for (const contentType of contentTypes)
    totals.byContentType[contentType] = { ...defaultTotal };
  for (const exVersion of versions) {
    const versionInfo: CoverageTotals['byExpansion'][string] = {
      byContentType: {},
      overall: { ...defaultTotal },
    };
    for (const contentType of contentTypes)
      versionInfo.byContentType[contentType] = { ...defaultTotal };
    totals.byExpansion[exVersion] = versionInfo;
  }

  for (const zoneId of contentList) {
    if (zoneId === ZoneId.MatchAll)
      continue;
    const zoneInfo = ZoneInfo[zoneId];
    if (!zoneInfo)
      continue;

    const emptyTotal = {
      raidboss: 0,
      oopsy: 0,
      total: 0,
    };

    const versionInfo = totals.byExpansion[zoneInfo.exVersion] ?? {
      byContentType: {},
      overall: { ...emptyTotal },
    };
    const origContentType = zoneInfo.contentType;
    if (origContentType === undefined)
      continue;

    const contentTypeRemap: { [type: number]: number } = {
      // Until we get more V&C dungeons (if ever), lump them in with "dungeons".
      [ContentType.VCDungeonFinder]: ContentType.Dungeons,
      // lump chaotic alliance raids with raids for now.
      [ContentType.ChaoticAllianceRaid]: ContentType.Raids,
      // lump Deep Dungeon bonus fights (e.g., The Final Verse) with Deep Dungeons.
      [ContentType.DeepDungeonExtras]: ContentType.DeepDungeons,
    };
    const contentType = contentTypeRemap[origContentType] ?? origContentType;

    const accum = versionInfo.byContentType[contentType] ?? { ...emptyTotal };

    accum.total++;
    versionInfo.overall.total++;
    const totalsByContentType = totals.byContentType[contentType] ??= { ...emptyTotal };
    totalsByContentType.total++;
    totals.overall.total++;

    const thisCoverage = coverage[zoneId];
    if (!thisCoverage)
      continue;

    const hasTriggers = thisCoverage.triggers?.num > 0;
    const hasTimeline = thisCoverage.timeline?.hasFile;
    if (hasTriggers || hasTimeline) {
      accum.raidboss++;
      versionInfo.overall.raidboss++;
      totalsByContentType.raidboss++;
      totals.overall.raidboss++;
    }
    if ((thisCoverage?.oopsy?.num ?? 0) > 0) {
      accum.oopsy++;
      versionInfo.overall.oopsy++;
      totalsByContentType.oopsy++;
      totals.overall.oopsy++;
    }

    for (const lang in translationTotals) {
      if (!isLang(lang) || lang === 'en')
        continue;

      const translations = thisCoverage.translations?.[lang] ?? {};
      let totalMistakes = 0;

      // Chinese and Korean are unable to get translation sections until the content
      // is released, so if there is a missing translations section, we'll treat that
      // as the fight not existing for that language.
      const isMissingSection = (translations.replaceSection ?? 0) > 0;
      if (isMissingSection) {
        translationTotals[lang].missingFiles++;
        continue;
      }

      for (const value of Object.values(translations))
        totalMistakes += value;
      translationTotals[lang].totalFiles++;
      if (totalMistakes === 0)
        translationTotals[lang].translatedFiles++;
    }
  }

  for (const [lang, translations] of Object.entries(missingTranslations)) {
    if (!isLang(lang) || lang === 'en')
      continue;
    // Separate out missing file errors here.
    const errors = translations.filter((x) => x.type !== 'replaceSection');
    translationTotals[lang].errors += errors.length;
  }

  return {
    totals,
    translationTotals,
  };
};

const writeCoverageReport = (
  currentFileName: string,
  outputFileName: string,
  coverage: Coverage,
  totals: CoverageTotals,
  translationTotals: TranslationTotals,
  tags: Tags,
  pulls: Pulls,
) => {
  const str = `// Auto-generated from ${currentFileName}\n` +
    `// DO NOT EDIT THIS FILE DIRECTLY\n\n` +
    `// Disable eslint for auto-generated file\n` +
    `/* eslint-disable */\n` +
    `import { Coverage, CoverageTotals, TranslationTotals, Tags, Pulls } from './coverage.d';\n\n` +
    `export const coverage: Coverage = ${JSON.stringify(coverage, undefined, 2)};\n\n` +
    `export const coverageTotals: CoverageTotals = ${JSON.stringify(totals, undefined, 2)};\n` +
    `export const translationTotals: TranslationTotals = ${
      JSON.stringify(translationTotals, undefined, 2)
    };\n` +
    `export const tags: Tags = ${JSON.stringify(tags, undefined, 2)};\n` +
    `export const pulls: Pulls = ${JSON.stringify(pulls, undefined, 2)};\n`;

  // Overwrite the file, if it already exists.
  const flags = 'w';
  const writer = fs.createWriteStream(outputFileName, { flags: flags });
  writer.on('error', (err) => {
    console.error(err);
    process.exit(-1);
  });

  writer.write(str);
};

const processMissingTranslations = async (): Promise<MissingTranslationsDict> => {
  const missing: MissingTranslationsDict = {};
  const basePathCached = basePath();

  await findMissingTranslations(undefined, languages, (file, line, type, langOrLangs, message) => {
    const langs = Array.isArray(langOrLangs) ? langOrLangs : [langOrLangs];
    for (const lang of langs) {
      const entry = missing[lang] ??= [];
      const relPath = path.relative(basePathCached, file).replaceAll('\\', '/');
      entry.push({
        file: relPath,
        line: line,
        type: type,
        message: message,
      });
    }
  });

  return missing;
};

const writeMissingTranslations = (missing: MissingTranslations[], outputFileName: string) => {
  const flags = 'w';
  const writer = fs.createWriteStream(outputFileName, { flags: flags });
  writer.on('error', (err) => {
    console.error(err);
    process.exit(-1);
  });

  for (const trans of missing) {
    const lineHash = trans.line === undefined ? '' : `#L${trans.line}`;
    const lineText = trans.line === undefined ? '' : `:${trans.line}`;
    const url = `${baseUrl}/${trans.file}${lineHash}`;
    const link = `<a href="${url}">${trans.file}${lineText}</a>`;
    writer.write(`<div>${link} [${trans.type}] ${trans.message}</div>\n`);
  }
};

const mapCoverageTags = async (coverage: Coverage, git: SimpleGit, tags: Tags) => {
  const reverseOrderTags = Object.keys(tags).reverse();

  for (const coverageEntry of Object.values(coverage)) {
    for (const file of coverageEntry.files ?? []) {
      const logData = await git.log({
        file: file.name,
        maxCount: 1,
      });

      if (logData === undefined)
        continue;

      const latest = logData.latest;
      if (latest !== null) {
        coverageEntry.lastModified = Math.max(
          coverageEntry.lastModified,
          (new Date(latest.date)).getTime(),
        );
        file.commit = latest.hash;
      }

      if (file.commit !== undefined) {
        for (const tag of reverseOrderTags) {
          const tagFile = tags[tag]?.files?.find((tagFile) => tagFile.name === file.name);
          if (tagFile) {
            file.tag = tag;
            file.tagHash = tagFile.hash;
            break;
          }
        }
      }
    }
  }
};

const postProcessCoverage = (coverage: Coverage, pulls: Pulls, tags: Tags) => {
  for (const [zoneId, zoneCoverage] of Object.entries(coverage)) {
    const openPRs = pulls
      .filter((pr) =>
        (pr.files?.find((file) => zoneCoverage.files?.find((file2) => file === file2.name)) !==
          undefined) ||
        pr.zones.includes(parseInt(zoneId))
      );

    const allTags = zoneCoverage.files?.map((file) => {
      const fileTag = file.tag;
      if (fileTag === undefined)
        return undefined;
      const tag = tags[fileTag];
      if (tag === undefined)
        return undefined;
      return {
        tag: file.tag,
        ...tag,
      };
    })
      .filter(notUndefined)
      .filter((value, index, array) => array.findIndex((v2) => v2.tag === value.tag) === index)
      .sort((left, right) => right?.tagDate - left?.tagDate);
    zoneCoverage.allTags = (allTags ?? []).map((tag) => tag.tagName);
    zoneCoverage.openPRs = openPRs.map((pr) => pr.number);
    // Remove file info to reduce the size of the generated file for performance
    delete zoneCoverage.files;
  }

  // Remove file info to reduce the size of the generated file for performance
  for (const pr of pulls) {
    delete pr.files;
  }
  for (const tag of Object.values(tags)) {
    delete tag.files;
  }
};

const extractTagsAndPulls = async (git: SimpleGit) => {
  const tagData = await git.tags({
    '--format': '%(objectname)|%(refname:strip=2)|%(authordate)|%(*authordate)',
  });

  const unsortedTags: Tag[] = [];

  for (const tag of tagData?.all ?? []) {
    const [tagHash, tagName, tagDate, commitDate] = tag.split('|', 4);
    if (
      tagHash === undefined || tagName === undefined ||
      tagDate === undefined || commitDate === undefined
    )
      continue;
    let tagDateObj = new Date(tagDate);
    if (isNaN(tagDateObj.getTime())) {
      tagDateObj = new Date(commitDate);
    }
    unsortedTags.push({
      tagName: tagName,
      tagDate: tagDateObj.getTime(),
      tagHash: tagHash,
      files: [],
    });
  }

  const tags: Tags = {};

  let lastVersion = DEFAULT_COMMIT_HASH;

  for (const tag of unsortedTags.sort((l, r) => l.tagDate - r.tagDate)) {
    const result = await git.raw(['diff-tree', '-r', lastVersion, tag.tagName]);
    lastVersion = tag.tagName;

    tags[tag.tagName] = {
      tagName: tag.tagName,
      tagDate: tag.tagDate,
      tagHash: tag.tagHash,
      files: result.split('\n').map((line) => {
        const matches =
          /^:(?<oldMode>[^\s]+) (?<newMode>[^\s]+) (?<oldHash>[^\s]+) (?<newHash>[^\s]+) (?<action>[^\s]+)\s*(?<name>[^\s].*?)$/
            .exec(line);

        return {
          hash: matches?.groups?.['newHash'] ?? '',
          name: matches?.groups?.['name'] ?? '',
        };
      }),
    };
  }

  const octokit = new (Octokit.plugin(paginateRest))({ auth: process.env.GITHUB_TOKEN });

  const releases = await octokit.paginate('GET /repos/{owner}/{repo}/releases', {
    owner: 'OverlayPlugin',
    repo: 'cactbot',
  });

  for (const release of releases) {
    const tag = tags[release.tag_name];

    if (tag === undefined)
      continue;

    tag.tagTitle = release.name ?? undefined;
  }

  const pulls: Pulls = [];

  const openPulls = await octokit.paginate('GET /repos/{owner}/{repo}/pulls', {
    owner: 'OverlayPlugin',
    repo: 'cactbot',
    state: 'open',
  });

  for (const openPull of openPulls) {
    const pullFiles = await octokit.paginate(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}/files',
      {
        owner: 'OverlayPlugin',
        repo: 'cactbot',
        // eslint-disable-next-line camelcase
        pull_number: openPull.number,
      },
    );

    const files = pullFiles.map((f) => f.filename);

    const zones = pullFiles
      .filter((f) =>
        (f.filename.startsWith('ui/raidboss/data') ||
          f.filename.startsWith('ui/oopsyraidsy/data')) && f.filename.endsWith('.ts')
      )
      .map((f) => /ZoneId\.([a-zA-Z0-9]+)/.exec(f.patch ?? '')?.[1])
      .filter(notUndefined)
      .map((zoneId) =>
        zoneId in ZoneId ? ZoneId[zoneId as keyof typeof ZoneId] as number : undefined
      )
      .filter(notUndefined);

    pulls.push({
      number: openPull.number,
      title: openPull.title,
      url: openPull.html_url,
      files: files,
      zones: zones,
    });
  }
  return { tags, pulls };
};

(async () => {
  const git = simpleGit();

  const { tags, pulls }: { tags: Tags; pulls: Pulls } = await extractTagsAndPulls(git);

  // Do this prior to chdir which conflicts with find_missing_timeline_translations.ts.
  // FIXME: make that script more robust to cwd.
  const missingTranslations = await processMissingTranslations();
  for (const lang of languages) {
    if (lang === 'en')
      continue;
    const missing = missingTranslations[lang];
    if (missing === undefined)
      continue;
    writeMissingTranslations(missing, missingOutputFileNames[lang]);
  }

  const currentPathAndFile = process.argv?.[1] ?? '';
  const currentFileName = path.basename(currentPathAndFile);
  process.chdir(path.dirname(currentPathAndFile));
  const coverage: Coverage = {};
  await processRaidbossCoverage(raidbossManifest, coverage, missingTranslations);
  await processOopsyCoverage(oopsyManifest, coverage);

  await mapCoverageTags(coverage, git, tags);

  postProcessCoverage(coverage, pulls, tags);

  const { totals, translationTotals } = buildTotals(coverage, missingTranslations);
  writeCoverageReport(
    currentFileName,
    outputFileName,
    coverage,
    totals,
    translationTotals,
    tags,
    pulls,
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
