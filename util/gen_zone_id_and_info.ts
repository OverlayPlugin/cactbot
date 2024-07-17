import path from 'path';

import { LocaleText } from '../types/trigger';

import { ConsoleLogger, LogLevelKey } from './console_logger';
import { cleanName, getCnTable, getKoTable } from './csv_util';
import { OutputFileAttributes, XivApi } from './xivapi';
import Overrides from './zone_overrides';

// cactbot calls this "zone" largely because the id used is relative to the
// zone change event. The ID corresponds to the TerritoryType.ID directly;
// however, the name in zone_id and the info in zone_info contain information
// from other tables like PlaceName and TerritoryType, so it's not strictly
// about Territory. Hence, "zone" as a short-to-type catch-all.

const _ZONE_ID: OutputFileAttributes = {
  outputFile: 'resources/zone_id.ts',
  type: '',
  header: '',
  asConst: true,
};

const _ZONE_INFO: OutputFileAttributes = {
  outputFile: 'resources/zone_info.ts',
  type: 'ZoneInfoType',
  header: `import { LocaleText } from '../types/trigger';

type ZoneInfoType = {
    [zoneId: number]: {
      readonly exVersion: number;
    readonly contentType?: number;
    readonly name: LocaleText;
    readonly offsetX: number;
    readonly offsetY: number;
    readonly sizeFactor: number;
    readonly weatherRate: number;
  };
};
`,
  asConst: true,
};

const _CONTENT_TYPE: OutputFileAttributes = {
  outputFile: 'resources/content_type.ts',
  type: '',
  header: '',
  asConst: true,
};

const _TT_SHEET = 'TerritoryType';

const _TT_FIELDS = [
  'ContentFinderCondition.Name',
  'ContentFinderCondition.Name@de',
  'ContentFinderCondition.Name@fr',
  'ContentFinderCondition.Name@ja',
  // must specify CFC.* to get row_ids, but no fields needed
  'ContentFinderCondition.ContentType.fake_prop',
  'ContentFinderCondition.TerritoryType.fake_prop',
  'PlaceName.Name',
  'PlaceName.Name@de',
  'PlaceName.Name@fr',
  'PlaceName.Name@ja',
  'WeatherRate',
  'Map.SizeFactor',
  'Map.OffsetX',
  'Map.OffsetY',
  'TerritoryIntendedUse.fake_prop', // must specify TIU to get row_id, but no fields needed
  'ExVersion.fake_prop', // must specify ExVersion to get row_id, but no fields needed
];

const _CFC_SHEET = 'ContentFinderCondition';

const _CFC_FIELDS = [
  'Name',
  'Name@de',
  'Name@fr',
  'Name@ja',
  'ContentType.Name',
  'TerritoryType.fake_prop', // must specify TT to get row_id, but no fields needed
];

const _CT_SHEET = 'ContentType';

const _CT_FIELDS = [
  'Name',
];

type LocaleOutputColumns = [key: string, ...indices: string[]];
const _LOCALE_PN_TABLE = 'PlaceName';
const _LOCALE_PN_INPUT_COLS = ['#', 'Name'];
const _LOCALE_PN_OUTPUT_COLS: LocaleOutputColumns = ['placeId', 'placeName'];
const _LOCALE_CFC_TABLE = 'ContentFinderCondition';
const _LOCALE_CFC_INPUT_COLS = ['#', 'TerritoryType', 'Name'];
const _LOCALE_CFC_OUTPUT_COLS: LocaleOutputColumns = ['cfcId', 'ttId', 'cfcName'];

type TTToCFCIDMap = {
  [id: number]: 'None' | number;
};

type LocaleCsvNames = {
  cn?: string | undefined;
  ko?: string | undefined;
};

type RowIdOnly = {
  row_id: number;
};

type ResultTerritoryType = {
  row_id: number;
  fields: {
    ContentFinderCondition?: ResultContentFinderCondition;
    ExVersion?: RowIdOnly;
    Map?: {
      row_id: number;
      fields: {
        OffsetX?: number;
        OffsetY?: number;
        SizeFactor?: number;
      };
    };
    PlaceName?: {
      row_id: number;
      fields: {
        Name?: string;
        'Name@de'?: string;
        'Name@fr'?: string;
        'Name@ja'?: string;
      };
    };
    TerritoryIntendedUse?: RowIdOnly;
    WeatherRate?: number;
  };
};

type ResultContentFinderCondition = {
  row_id: number;
  fields: {
    Name?: string;
    'Name@de'?: string;
    'Name@fr'?: string;
    'Name@ja'?: string;
    ContentType?: ResultContentType;
    TerritoryType?: RowIdOnly;
  };
};

type ResultContentType = {
  row_id: number;
  fields: {
    Name?: string;
  };
};

type IndexedTerritoryType = {
  [key: number]: ResultTerritoryType;
};

type IndexedContentFinderCondition = {
  [key: number]: ResultContentFinderCondition;
};

type ZoneIDOutput = {
  [zone: string]: number | null;
};

type ZoneInfoData = {
  exVersion: number;
  contentType?: number;
  name: LocaleText;
  offsetX: number;
  offsetY: number;
  sizeFactor: number;
  weatherRate: number;
};

type ZoneInfoOutput = {
  [zoneId: number]: ZoneInfoData;
};

type ContentTypeOutput = { [zone: string]: number };

type OutputContainer = {
  zoneId: ZoneIDOutput;
  zoneInfo: ZoneInfoOutput;
  contentType: ContentTypeOutput;
};

const _SCRIPT_NAME = path.basename(import.meta.url);
const log = new ConsoleLogger();
log.setLogLevel('alert');

const indexTtData = (data: ResultTerritoryType[]): IndexedTerritoryType => {
  const ttData: IndexedTerritoryType = {};
  for (const row of data) {
    ttData[row.row_id] = row;
  }
  return ttData;
};

const indexCfcData = (data: ResultContentFinderCondition[]): IndexedContentFinderCondition => {
  const cfcData: IndexedContentFinderCondition = {};
  for (const row of data) {
    cfcData[row.row_id] = row;
  }
  return cfcData;
};

const fetchLocaleCsvTables = async () => {
  log.debug(
    `Table: ${_LOCALE_PN_TABLE} | Query columns: [${_LOCALE_PN_INPUT_COLS.toString()}] | Output: [${_LOCALE_PN_OUTPUT_COLS.toString()}]`,
  );
  log.debug(`Fetching 'cn' ${_LOCALE_PN_TABLE} table...`);
  const cnPlaceName = await getCnTable(
    _LOCALE_PN_TABLE,
    _LOCALE_PN_INPUT_COLS,
    _LOCALE_PN_OUTPUT_COLS,
  );
  log.debug(`Fetching 'ko' ${_LOCALE_PN_TABLE} table...`);
  const koPlaceName = await getKoTable(
    _LOCALE_PN_TABLE,
    _LOCALE_PN_INPUT_COLS,
    _LOCALE_PN_OUTPUT_COLS,
  );
  log.debug(
    `Table: ${_LOCALE_CFC_TABLE} | Query columns: [${_LOCALE_CFC_INPUT_COLS.toString()}] | Output: [${_LOCALE_CFC_OUTPUT_COLS.toString()}]`,
  );
  log.debug(`Fetching 'cn' ${_LOCALE_CFC_TABLE} table...`);
  const cnCfc = await getCnTable(
    _LOCALE_CFC_TABLE,
    _LOCALE_CFC_INPUT_COLS,
    _LOCALE_CFC_OUTPUT_COLS,
  );
  log.debug(`Fetching 'ko' ${_LOCALE_CFC_TABLE} table...`);
  const koCfc = await getKoTable(
    _LOCALE_CFC_TABLE,
    _LOCALE_CFC_INPUT_COLS,
    _LOCALE_CFC_OUTPUT_COLS,
  );
  return {
    cnPlaceName: cnPlaceName,
    koPlaceName: koPlaceName,
    cnCfc: cnCfc,
    koCfc: koCfc,
  };
};

const generateZoneIdMap = (
  ttData: IndexedTerritoryType,
  cfcData: IndexedContentFinderCondition,
): {
  zoneMap: ZoneIDOutput;
  idMap: TTToCFCIDMap;
} => {
  log.debug('Generating zone_id data...');
  // To determine zone name for each Territory:
  //  1. If we have an override (synthetic name), use that
  //  2. If the TT entry has TT.CFC.Name, use that
  //  3. If any CFC entry has a matching TT.ID, and all matching
  //     CFC entries have the same name, use that name
  //  4. Use TT.PlaceName

  // Start with some lookup & mapping objects.

  // Get a list of TT entries that have a CFC.Name
  // These take precedence over later collisions.
  const ttDerivedCfcNames: { [id: number]: string } = {};

  for (const [id, territory] of Object.entries(ttData)) {
    const ttId = parseInt(id);
    const ttCfcName = territory.fields.ContentFinderCondition?.fields.Name ?? '';
    if (ttCfcName === '')
      continue;
    ttDerivedCfcNames[ttId] = cleanName(ttCfcName);
  }

  // We want all territoryIds referenced by CFC entries, so
  // long as the CFC entries all have the same name.
  // If multiple CFC entries reference the same territoryId with
  // different names, we have a collision and cannot reliably use
  // CFC data. (But we trust Overrides.forceTtToCfcMap!)
  const cfcDerivedTtToCfcMap: { [id: number]: number } = {};
  const cfcTtIdCollisions: number[] = [];

  // We also want a map of CFC.ID to CFC.Name based on the CFC endpoint
  // since not every TT record includes CFC data.
  const cfcIdToName: { [id: number]: string } = {};

  for (const [id, cfcEntry] of Object.entries(cfcData)) {
    const cfcId = parseInt(id);
    const cfcName = cfcEntry.fields.Name ?? '';

    if (cfcName !== '')
      cfcIdToName[cfcId] = cfcName;

    const cfcTtId = cfcEntry.fields.TerritoryType?.row_id;
    if (cfcTtId === undefined)
      continue;

    if (
      cfcDerivedTtToCfcMap[cfcTtId] === undefined &&
      !cfcTtIdCollisions.includes(cfcTtId)
    )
      // first time wwe've seen this ttId, so OK
      cfcDerivedTtToCfcMap[cfcTtId] = cfcId;
    else if (cfcTtIdCollisions.includes(cfcTtId))
      // already identified as a collision, so move on
      continue;
    else {
      // we might have a collision. check this CFC name against the one we
      // previously stored. if it matches, OK; if it doesn't, it's a collison
      const earlierCfcId = cfcDerivedTtToCfcMap[cfcTtId];
      if (earlierCfcId !== undefined && cfcData[earlierCfcId]?.fields.Name === cfcName)
        continue;
      delete cfcDerivedTtToCfcMap[cfcTtId];
      cfcTtIdCollisions.push(cfcTtId);
    }
  }

  // Add in the overrides; they shouldn't be in the map, but if they are, overwrite.
  for (const [ttKey, cfcId] of Object.entries(Overrides.forceTtToCfcMap)) {
    const ttId = parseInt(ttKey); // Object.entries... :eyes:
    cfcDerivedTtToCfcMap[ttId] = cfcId;
    log.debug(`Force-mapping territory ID ${ttId} to ${cleanName(cfcIdToName[cfcId] ?? '')}`);
  }

  // Now build the main object for export.
  const collisionNames: string[] = [];
  const nameMap: ZoneIDOutput = {
    MatchAll: null, // this is a cactbot fake value; add manually.
  };
  const finalTtIdToCfcId: TTToCFCIDMap = {}; // we'll need this for zone_info

  const syntheticIdsToNames: { [id: number]: string } = Object.fromEntries(
    Object.entries(Overrides.syntheticIds)
      .map(([k, v]) => [v, k]),
  );

  const isKnownCollision = (name: string, id: number): boolean => {
    return Overrides.knownCollisions[name]?.includes(id) ?? false;
  };

  log.debug('Beginning main processing loop...');
  for (const [id, territory] of Object.entries(ttData)) {
    const ttId = parseInt(id);
    const ttPlaceName = territory.fields.PlaceName?.fields.Name ?? '';
    const ttCfcId = territory.fields.ContentFinderCondition?.row_id;
    const ttCfcName = territory.fields.ContentFinderCondition?.fields.Name;
    const ttUse = territory.fields.TerritoryIntendedUse?.row_id;
    const isTownZone = ttUse === 0 || ttUse === undefined;
    const isOverworldZone = ttUse === 1;
    const cfcDerivedCfcId = cfcDerivedTtToCfcMap[ttId];
    const syntheticName = syntheticIdsToNames[ttId];

    // we expplicitly allow 'None' for cfcIdForName
    // this is used for town/overworld territories that we still
    // want to export in zone_info
    let cfcIdForName: 'None' | number | undefined;
    let zoneName: string | undefined;

    // Start by finding the name for this territory
    if (syntheticName !== undefined) {
      // Step 1 - synthetic zone
      // Grab a cfcId for this name if possible just in case, since not all
      // synthetic ids have synthetic zone_info, so we may need it later.
      log.debug(`Using synthetic zone override info for ${syntheticName} (ID: ${ttId})`);
      cfcIdForName = ttCfcId;
      zoneName = syntheticName;
    } else if (ttCfcId !== undefined && ttCfcId !== 0 && ttCfcName !== undefined) {
      // Step 2 - we have a CFC.Name present in TT
      cfcIdForName = ttCfcId;
      zoneName = cleanName(ttCfcName);
      if (zoneName === undefined || zoneName === '') {
        log.debug(
          `Found linked CFC record for territory ID ${ttId}, but no CFC name.  Skipping...`,
        );
        continue;
      } else
        log.debug(`Using linked CFC name for ${zoneName} (ID: ${ttId})`);
    } else if (
      cfcDerivedCfcId !== undefined &&
      cfcDerivedCfcId !== 0
    ) {
      // Step 3 - we're deriving the name from CFC, not from TT
      cfcIdForName = cfcDerivedCfcId;
      const cfcDerivedCfcName = cfcIdToName[cfcDerivedCfcId];
      if (cfcDerivedCfcName === undefined) {
        // this should never happen based on the way the lookup tables are built
        log.alert(
          `Could not process territory ID ${ttId}} - found reverse CFC lookup ID (${cfcIdForName}), but no name. This should be investigated.`,
        );
        continue;
      }
      zoneName = cleanName(cfcDerivedCfcName);
      log.debug(`Using reverse-lookup CFC name for ${zoneName} (ID: ${ttId})`);
    } else if (isTownZone || isOverworldZone) {
      // Step 4 - we can't determine name from any CFC data, so use PlaceName
      // World zones like Middle La Noscea are not in CFC.
      // If we don't have a PlaceName, bail out.
      if (ttPlaceName === '') {
        log.info(
          `No name data could be matched for town/overworld zone with ID ${ttId}. Skipping...`,
        );
        continue;
      } else {
        cfcIdForName = 'None';
        zoneName = cleanName(ttPlaceName);
        // Names found in CFC take precedence over PlaceName, so if a CFC
        // name exists for this zone and we've gotten here, bail out.
        // There are some duplicate names that will trigger this
        // (e.g. The Copied Factory version you can walk around in)
        if (Object.values(cfcIdToName).includes(zoneName)) {
          log.info(
            `Found town/overworld zone ${zoneName} (ID: ${ttId}), but name matches existing CFC/territory pair. Skipping...`,
          );
          continue;
        }
        log.debug(`Using town/overworld place name for ${zoneName} (ID: ${ttId})`);
      }
    } else {
      log.debug(`Could not determine name for territory ID ${ttId}.  Skipping...`);
      continue;
    }

    if (
      zoneName === undefined ||
      zoneName === ''
    ) {
      log.alert(`Reached end of loop with no zone name for ID ${ttId}. This is unexpected.`);
      continue;
    }

    // Now handle potential collisions
    // (e.g. the zone name is already in use by another id)
    const knownId = Overrides.knownIds[zoneName];

    if (collisionNames.includes(zoneName)) {
      // We've already seen a collision for this name before, so bail out.
      if (!isKnownCollision(zoneName, ttId)) {
        log.info(`Found additional collision for ${zoneName} (ID: ${ttId})`);
      } else {
        log.debug(`Found expected/known collision for ${zoneName} (ID: $[ttId})`);
      }
      continue;
    } else if (knownId !== undefined && knownId !== ttId) {
      // We have a known id for this zone name, so bail out.
      log.info(
        `Territory ID ${ttId} resolves to ${zoneName}, but known ID exists for this zone in overrides (ID: ${knownId}). Skipping...`,
      );
      continue;
    } else if (Object.keys(nameMap).includes(zoneName)) {
      // First-time collision for this name. This usually happens when a patch
      // includes a rework of prior content (e.g. SE will add new CFC/territory data,
      // but the old territory is not removed. Remove the collided entry from nameMap.
      collisionNames.push(zoneName);
      if (!isKnownCollision(zoneName, ttId)) {
        log.alert(
          `New or unexpected collision in resolving ${zoneName}: (IDs: ${ttId}, ${
            nameMap[zoneName] ?? ''
          }). Please investigate.`,
        );
        // remove any ttid->cfcid mapping previously stored, as it's now an unknown collision
        const firstTtId = nameMap[zoneName];
        if (typeof firstTtId === 'number')
          delete finalTtIdToCfcId[firstTtId];
      } else {
        log.debug(`Found expected/known collision for ${zoneName} (ID: $[ttId})`);
      }
      delete nameMap[zoneName];
      continue;
    }

    // Good name data for this territory, and no collisions.  We can keep it.
    if (cfcIdForName !== undefined && cfcIdForName !== 0)
      finalTtIdToCfcId[ttId] = cfcIdForName;

    nameMap[zoneName] = ttId;
    log.debug(`Added ${zoneName} (ID: ${ttId}) to zone_id map.`);
  }

  // Now that our export is built, do a little basic error checking.
  // All known ids should be in our export data.
  for (const [knownName] of Object.entries(Overrides.knownIds)) {
    if (nameMap[knownName] === undefined)
      log.alert(
        `Known zone (Name: ${knownName}) not found in zone_id map. This requires resolution before merge.`,
      );
  }

  // Make sure we have the correct id for all synthethic entries
  // If a matching-named entry snuck in with a different id, we need to resovle that.
  for (const [syntheticName, syntheticId] of Object.entries(Overrides.syntheticIds)) {
    if (
      nameMap[syntheticName] !== undefined &&
      nameMap[syntheticName] !== syntheticId
    )
      log.alert(
        `Synthetic zone ${syntheticName} present, but with wrong ID ${
          nameMap[syntheticName] ?? ''
        } (shuold be ID ${syntheticId}).  This requires resolution before merge.`,
      );
  }

  log.debug('Finished assembling zone_id data.');
  return {
    zoneMap: nameMap,
    idMap: finalTtIdToCfcId,
  };
};

const generateZoneInfoMap = async (
  ttData: IndexedTerritoryType,
  cfcData: IndexedContentFinderCondition,
  ttToCfcIdMap: TTToCFCIDMap,
): Promise<ZoneInfoOutput> => {
  log.debug('Generating zone_info data...');

  const capitalize = (str: string | undefined): string | undefined => {
    if (str === undefined || str === '')
      return;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const zoneInfoMap: ZoneInfoOutput = {};
  const localeCsvTables = await fetchLocaleCsvTables();

  // Populate the export data with synthetic zone info first
  for (const [key, zoneInfo] of Object.entries(Overrides.syntheticZoneInfo)) {
    const ttId = parseInt(key);
    zoneInfoMap[ttId] = zoneInfo;
    log.debug(`Adding synthetic zone info for ${zoneInfo.name.en} (ID: ${ttId})`);
  }

  // Process the mapping object we created during zone_id stuff.
  // This should have a cfc id for every territory (or 'None'
  // if it's a town/overworld zone)
  for (const [key] of Object.entries(ttToCfcIdMap)) {
    const ttId = parseInt(key);
    const ttZoneData = ttData[ttId];

    // If already populated by synthetic data, skip it.
    if (ttId in zoneInfoMap)
      continue;

    if (ttZoneData === undefined) {
      log.alert(
        `Unexpectedly could not find zone info for territory ID ${ttId}. Resolve before merge.`,
      );
      continue;
    }

    const zoneExVersion = ttZoneData.fields.ExVersion?.row_id;
    if (zoneExVersion === undefined) {
      log.alert(`No exVersion data found for territory ID ${ttId}. Resolve before merge.`);
      continue;
    }

    const offsetX = ttZoneData.fields.Map?.fields.OffsetX;
    const offsetY = ttZoneData.fields.Map?.fields.OffsetY;
    const sizeFactor = ttZoneData.fields.Map?.fields.SizeFactor;
    if (offsetX === undefined || offsetY === undefined || sizeFactor === undefined) {
      log.alert(`No map data found for territory ID ${ttId}. Resolve before merge.`);
      continue;
    }

    const weatherRate = ttZoneData.fields.WeatherRate;
    if (weatherRate === undefined) {
      log.alert(`No weather rate data found for territory ID ${ttId}. Resolve before merge.`);
      continue;
    }

    const cfcId = ttToCfcIdMap[ttId] ?? 0;
    let zoneName: LocaleText;
    let contentType: number | undefined;

    if (cfcId === 'None' || cfcId === 0) {
      // town/overworld zone with no CFC data; use PlaceName
      const placeId = ttZoneData.fields.PlaceName?.row_id;
      const enName = capitalize(ttZoneData.fields.PlaceName?.fields.Name);
      if (placeId === undefined || enName === undefined) {
        log.alert(`No PlaceName data available for ${ttId}. Resolve before merge.`);
        continue;
      }

      const ttNames = {
        // cactbot-ignore-missing-translations
        en: enName,
        de: capitalize(ttZoneData.fields.PlaceName?.fields['Name@de']),
        fr: capitalize(ttZoneData.fields.PlaceName?.fields['Name@fr']),
        ja: capitalize(ttZoneData.fields.PlaceName?.fields['Name@ja']),
      };

      // PlaceName data from the cn/ko csvs could be undefined or empty string.
      // In either case, we'll ignore it.
      const cnPlaceName = localeCsvTables.cnPlaceName[placeId]?.placeName ?? '';
      const koPlaceName = localeCsvTables.koPlaceName[placeId]?.placeName ?? '';
      const localePlaceNames: LocaleCsvNames = {};
      if (cnPlaceName !== '')
        localePlaceNames['cn'] = cnPlaceName;
      else
        log.debug(`No 'cn' name data available for ${enName}`);

      if (koPlaceName !== '')
        localePlaceNames['ko'] = koPlaceName;
      else
        log.debug(`No 'ko' name data available for ${enName}`);

      zoneName = Object.assign({}, ttNames, localePlaceNames);
    } else {
      // we have CFC data, so get the zone names (& content type) from there
      const cfcZoneData = cfcData[cfcId];
      if (cfcZoneData === undefined) {
        log.alert(
          `No CFC data available for territory ID ${ttId} (paired with CFC ID: ${cfcId}). Resolve before merge.`,
        );
        continue;
      }
      const enName = capitalize(cfcZoneData.fields.Name);
      if (enName === undefined) {
        log.alert(
          `No CFC name available for territory ID ${ttId} (paired with CFC ID: ${cfcId}). Resolve before merge.`,
        );
        continue;
      }

      const cfcNames = {
        // cactbot-ignore-missing-translations
        en: enName,
        de: capitalize(cfcZoneData.fields['Name@de']),
        fr: capitalize(cfcZoneData.fields['Name@fr']),
        ja: capitalize(cfcZoneData.fields['Name@ja']),
      };

      // CFC data from the cn/ko csvs could be undefined or empty string.
      // In either case, we'll ignore it.
      const cnCfcName = localeCsvTables.cnCfc[cfcId]?.cfcName ?? '';
      const koCfcName = localeCsvTables.koCfc[cfcId]?.cfcName ?? '';
      const localeCfcNames: LocaleCsvNames = {};
      if (cnCfcName !== '')
        localeCfcNames['cn'] = cnCfcName;
      else
        log.debug(`No 'cn' name data available for ${enName}`);
      if (koCfcName !== '')
        localeCfcNames['ko'] = koCfcName;
      else
        log.debug(`No 'ko' name data available for ${enName}`);

      zoneName = Object.assign({}, cfcNames, localeCfcNames);

      const ttCfcCtId = ttZoneData.fields.ContentFinderCondition?.fields.ContentType?.row_id;
      const cfcCtId = cfcData[cfcId]?.fields.ContentType?.row_id;
      contentType = (ttCfcCtId ?? 0) === 0 ? cfcCtId : ttCfcCtId;

      if (contentType === undefined || contentType === 0) {
        log.alert(
          `No content type data available for territory ID ${ttId} (paired with CFC ID: ${cfcId}). Resolve before merge.`,
        );
        continue;
      }
    }

    const zoneInfo: ZoneInfoData = {
      exVersion: zoneExVersion,
      contentType: contentType,
      name: zoneName,
      offsetX: offsetX,
      offsetY: offsetY,
      sizeFactor: sizeFactor,
      weatherRate: weatherRate,
    };

    zoneInfoMap[ttId] = zoneInfo;
    log.debug(`Added ${zoneName.en} (ID: ${ttId}) to zone_info map.`);
  }

  log.debug('Finished assembling zone_info data.');
  return zoneInfoMap;
};

const generateContentTypeMap = (
  ctData: ResultContentType[],
): ContentTypeOutput => {
  log.debug('Generating content_type data...');
  const contentTypeMap: ContentTypeOutput = {};

  for (const ct of ctData) {
    const name = ct.fields.Name ?? '';
    if (name === '')
      continue;
    contentTypeMap[cleanName(name)] = ct.row_id;
    log.debug(`Collected content_type data for ID: ${ct.row_id} (${name}).`);
  }

  // Add sythetic content types
  for (const [name, id] of Object.entries(Overrides.syntheticContentType)) {
    contentTypeMap[name] = id;
    log.debug(`Inserted synthetic content_type data for ID: ${id} (${name}).`);
  }
  log.debug('Finished assembling content_type data.');
  return contentTypeMap;
};

const assembleData = async (
  ttRawData: ResultTerritoryType[],
  cfcRawData: ResultContentFinderCondition[],
  ctData: ResultContentType[],
): Promise<OutputContainer> => {
  const ttData = indexTtData(ttRawData);
  const cfcData = indexCfcData(cfcRawData);

  const zoneIdData = generateZoneIdMap(ttData, cfcData);

  const formattedData: OutputContainer = {
    zoneId: zoneIdData.zoneMap,
    zoneInfo: await generateZoneInfoMap(ttData, cfcData, zoneIdData.idMap),
    contentType: generateContentTypeMap(ctData),
  };

  log.debug('Data assembly/formatting complete.');
  return formattedData;
};

export default async (logLevel: LogLevelKey): Promise<void> => {
  log.setLogLevel(logLevel);
  log.info(`Starting processing for ${_SCRIPT_NAME}`);

  const api = new XivApi(null, log);

  const ttRawData = await api.queryApi(
    _TT_SHEET,
    _TT_FIELDS,
  ) as ResultTerritoryType[];

  const cfcRawData = await api.queryApi(
    _CFC_SHEET,
    _CFC_FIELDS,
  ) as ResultContentFinderCondition[];

  const ctRawData = await api.queryApi(
    _CT_SHEET,
    _CT_FIELDS,
  ) as ResultContentType[];

  const outputData = await assembleData(ttRawData, cfcRawData, ctRawData);

  await api.writeFile(
    path.basename(import.meta.url),
    _ZONE_ID,
    outputData.zoneId,
  );

  await api.writeFile(
    path.basename(import.meta.url),
    _ZONE_INFO,
    outputData.zoneInfo,
  );

  await api.writeFile(
    _SCRIPT_NAME,
    _CONTENT_TYPE,
    outputData.contentType,
  );

  log.successDone(`Completed processing for ${_SCRIPT_NAME}`);
};
