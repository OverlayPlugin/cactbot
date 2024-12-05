import fs from 'fs';
import readline from 'readline';

import argparse, { Namespace } from 'argparse';
import inquirer from 'inquirer';

import NetRegexes from '../../resources/netregexes';
import ZoneId from '../../resources/zone_id';
import { CactbotRegExpExecArray } from '../../types/net_trigger';
import CombatantTracker from '../../ui/raidboss/emulator/data/CombatantTracker';
import LogRepository from '../../ui/raidboss/emulator/data/network_log_converter/LogRepository';
import NetworkLogConverter from '../../ui/raidboss/emulator/data/NetworkLogConverter';

import { EncounterCollector, ignoredCombatants } from './encounter_tools';

const numberSort = (left: string | number, right: string | number) => {
  const leftNum = typeof left === 'number' ? left : parseInt(left);
  const rightNum = typeof right === 'number' ? right : parseInt(right);
  return leftNum - rightNum;
};

const hexSort = (left: string | number, right: string | number) => {
  const leftNum = typeof left === 'number' ? left : parseInt(left, 16);
  const rightNum = typeof right === 'number' ? right : parseInt(right, 16);
  return leftNum - rightNum;
};

// How long (in ms) for a line to be offset based on encounter start
// to be considered the same instance across encounters
const timeOffsetAllowance = 2000;

// How much distance is considered for position comparison
const positionDistanceAllowance = 0.05;

// How much of an angle in radians is considered for position comparison
const positionHeadingAllowance = 4.5 * (Math.PI / 180);

const triggerSuggestOptions = [
  'AoE',
  'Donut (in)',
  'Plus (out intercards)',
  'Circle (out)',
  'Away from Front (cone)',
  'Tankbuster',
  'Stack',
  'Party Stacks',
  'Spread',
  'Knockback',
  'Custom Separate',
  'Custom Joined',
  'Skip',
] as const;

const headmarkerTriggerSuggestOptions = [
  'Tankbuster',
  'Stack',
  'Party Stacks',
  'Spread',
  'Knockback',
  'Custom',
  'Skip',
] as const;

type HeadmarkerTriggerSuggestTypes = typeof headmarkerTriggerSuggestOptions[number];

type XIVAPIAbilityResponse = {
  schema: string;
  rows: {
    row_id: number;
    fields: {
      CastType: number;
      EffectRange: number;
      Omen: {
        row_id: number;
        fields: {
          LargeScale: boolean;
          Path: string;
          PathAlly: string;
          RestrictYScale: boolean;
          Type: number;
        };
      };
      XAxisModifier: number;
    };
  }[];
};

type XIVAPILockonResponse = {
  schema: string;
  rows: {
    row_id: number;
    fields: {
      Unknown0: string;
    };
  }[];
};

type XIVAPINpcYellResponse = {
  schema: string;
  rows: {
    row_id: number;
    fields: {
      Text: string;
    };
  }[];
};

// These return types are identical
type XIVAPIBattleTalk2Response = XIVAPINpcYellResponse;

type TriggerSuggestTypes = typeof triggerSuggestOptions[number];
type TriggerSuggestTypesFull =
  | TriggerSuggestTypes
  | `AoE (circle, range = ${number})`
  | `Rectangle AoE, CastType = ${number}`
  | 'Plus AoE';

type GenerateTriggersArgs = {
  'files': string[] | null;
  'zone_id': string | null;
  'trigger_id_prefix': string | null;
  'ignore_id': string[] | null;
  'only_combatants': string[] | null;
  'track_mapeffect': boolean | null;
  'track_battletalk2': boolean | null;
  'track_npcyell': boolean | null;
  'track_actorsetpos': boolean | null;
  'first_headmarker_id': string | null;
  'output_file': string | null;
};

class ExtendedArgsRequired extends Namespace implements GenerateTriggersArgs {
  'files': string[] | null;
  'zone_id': string | null;
  'trigger_id_prefix': string | null;
  'ignore_id': string[] | null;
  'only_combatants': string[] | null;
  'track_mapeffect': boolean | null;
  'track_battletalk2': boolean | null;
  'track_npcyell': boolean | null;
  'track_actorsetpos': boolean | null;
  'first_headmarker_id': string | null;
  'output_file': string | null;
}

// TODO: Should we track 'NetworkEffectResult' here as well? There's no `NetRegexes` matcher for it,
// but it could be useful for snapshot vs visual effect difference information.
type AbilityInfo = CactbotRegExpExecArray<
  'StartsUsing' | 'Ability' | 'NetworkAOEAbility' | 'StartsUsingExtra' | 'AbilityExtra'
>;

type HeadMarkerInfo = CactbotRegExpExecArray<'HeadMarker'>;

type MapEffectInfo = CactbotRegExpExecArray<'MapEffect'>;

type BattleTalk2Info = CactbotRegExpExecArray<'BattleTalk2'>;

type NpcYellInfo = CactbotRegExpExecArray<'NpcYell'>;

type ActorSetPosInfo = CactbotRegExpExecArray<'ActorSetPos'>;

type TriggerInfo = {
  start: string;
  duration: number;
  combatantTracker: CombatantTracker;
  abilities: { [id: string]: AbilityInfo[] };
  headMarkers: { [id: string]: HeadMarkerInfo[] };
  mapEffects?: { [location: string]: MapEffectInfo[] };
  battleTalk2s?: { [id: string]: BattleTalk2Info[] };
  npcYells?: { [id: string]: NpcYellInfo[] };
  actorSetPoses?: { [id: string]: ActorSetPosInfo[] };
};

type AbilityNameMapInfo = {
  name: string;
  ids: string[];
  offsets: number[];
  fights: {
    start: string;
    instances: AbilityInfo[];
  }[];
};

type MapEffectMapInfo = {
  byOffset: {
    offset: number;
    entries: {
      location: string;
      flags: string;
    }[];
  }[];
};

type NpcYellMapInfo = {
  byOffset: {
    offset: number;
    entries: {
      yellId: string;
      npcNameId: string;
    }[];
  }[];
};

type BattleTalk2MapInfo = {
  byOffset: {
    offset: number;
    entries: {
      textId: string;
      npcNameId: string;
    }[];
  }[];
};

class Position {
  public x: number;
  public y: number;
  public z: number;
  public heading: number;
  constructor(x?: string, y?: string, z?: string, heading?: string) {
    this.x = parseFloat(x ?? '');
    this.y = parseFloat(y ?? '');
    this.z = parseFloat(z ?? '');
    this.heading = parseFloat(heading ?? '');
  }
  public equals(other: Position, considerHeading = true) {
    if (Math.abs(this.x - other.x) > positionDistanceAllowance)
      return false;
    if (Math.abs(this.y - other.y) > positionDistanceAllowance)
      return false;
    if (Math.abs(this.z - other.z) > positionDistanceAllowance)
      return false;
    if (considerHeading && Math.abs(this.heading - other.heading) > positionHeadingAllowance)
      return false;
    return true;
  }
}

type ActorSetPosMapInfo = {
  byOffset: {
    offset: number;
    actorNames: string[];
    positions: Position[];
  }[];
  byPosition: {
    pos: Position;
    actorNames: string[];
    offsets: number[];
  }[];
};

type HeadMarkerMapInfo = {
  byOffset: {
    offset: number;
    vfx: string[];
  }[];
};

type ExtendedArgs = Partial<ExtendedArgsRequired>;

class GenerateTriggersArgParse {
  parser = new argparse.ArgumentParser({
    addHelp: true,
  });
  requiredGroup = this.parser.addMutuallyExclusiveGroup();
}

const generateTriggersParse = new GenerateTriggersArgParse();

generateTriggersParse.parser.addArgument(['--files', '-f'], {
  nargs: '+',
  help: 'Files to scan for zones and encounters.',
});

generateTriggersParse.parser.addArgument(['--zone_id', '-z'], {
  nargs: '?',
  help: 'The zone ID, by name, that should be used. e.g. "ContainmentBayS1T7"',
});

generateTriggersParse.parser.addArgument(['--trigger_id_prefix', '-tp'], {
  nargs: '?',
  help: 'The prefix to use for auto-generated triggers, e.g. "Sephirot"',
});

generateTriggersParse.parser.addArgument(['--ignore_id', '-ii'], {
  nargs: '+',
  help: 'Ability IDs to ignore, e.g. 27EF',
});

generateTriggersParse.parser.addArgument(['--only_combatants', '-o'], {
  nargs: '+',
  help: 'Only include actions from combatants from this list, e.g. "Sephirot"',
});

generateTriggersParse.parser.addArgument(['--track_mapeffect', '-tm'], {
  nargs: '?',
  help: 'Track "MapEffect" lines and generate a mapping table',
});

generateTriggersParse.parser.addArgument(['--track_battletalk2', '-tb'], {
  nargs: '?',
  help: 'Track "BattleTalk2" lines and generate a mapping table',
});

generateTriggersParse.parser.addArgument(['--track_npcyell', '-tn'], {
  nargs: '?',
  help: 'Track "NpcYell" lines and generate a mapping table',
});

generateTriggersParse.parser.addArgument(['--track_actorsetpos', '-ta'], {
  nargs: '?',
  help: 'Track "ActorSetPos" lines and generate a mapping table',
});

generateTriggersParse.parser.addArgument(['--first_headmarker_id', '-hm'], {
  nargs: '?',
  help: 'Specify the first headmarker\'s VFX for randomized headmarkers',
});

generateTriggersParse.parser.addArgument(['--output_file', '-of'], {
  nargs: '?',
  help: 'Specify an output file, instead of outputing to console',
});

const printHelpAndExit = (errString: string): void => {
  console.error(errString);
  generateTriggersParse.parser.printHelp();
  process.exit(-1);
};

const validateArgs = (args: ExtendedArgs): void => {
  const hasFile = Array.isArray(args.files) && args.files.length > 0 && args.files[0] !== '';
  const hasZoneId = typeof args.zone_id === 'string' && args?.zone_id !== '';

  if (!hasFile)
    printHelpAndExit('Error: specify at least one file\n');

  if (!hasZoneId)
    printHelpAndExit('Error: Must specify a zone ID to use\n');

  if (!((args.zone_id ?? '') in ZoneId))
    printHelpAndExit('Error: Zone ID specified must exist in "resources/zone_id.ts"\n');

  if (hasFile) {
    for (const file of args.files ?? []) {
      if (!file.includes('.log'))
        printHelpAndExit('Error: Must specify an FFXIV ACT log file, as log.log\n');
    }
  }

  if (typeof args.trigger_id_prefix !== 'string' || args.trigger_id_prefix === '') {
    args['trigger_id_prefix'] = args.zone_id;
  }

  if (args.track_mapeffect === null)
    args['track_mapeffect'] = true;
  if (args.track_battletalk2 === null)
    args['track_battletalk2'] = true;
  if (args.track_npcyell === null)
    args['track_npcyell'] = true;
  if (args.track_actorsetpos === null)
    args['track_actorsetpos'] = true;
};

const makeCollectorFromFiles = async (
  files: string[],
  zoneId: string,
) => {
  const collector = new EncounterCollector();
  const zoneIdHex = ZoneId[zoneId as keyof typeof ZoneId]?.toString(16).toUpperCase() ?? '';

  for (const fileName of files) {
    const file = readline.createInterface({
      input: fs.createReadStream(fileName),
    });
    let inZone = false;
    for await (const line of file) {
      if (line.startsWith('01|')) {
        const parts = line.split('|');
        inZone = parts[2] === zoneIdHex;
      }
      if (inZone)
        collector.process(line, true);
    }
    file.close();
  }
  return collector;
};

const ignoreAbilityEntry = (
  matches: CactbotRegExpExecArray<
    'StartsUsing' | 'Ability' | 'NetworkAOEAbility' | 'StartsUsingExtra' | 'AbilityExtra'
  >,
  args: ExtendedArgs,
): boolean => {
  const abilityId = matches.groups?.id ?? '';
  const abilityName = matches.groups?.ability ?? '';
  const combatant = matches.groups?.source ?? '';
  const combatantId = matches.groups?.sourceId ?? '';
  // Ignore auto-attacks named "attack"
  if (
    abilityName?.toLowerCase() === 'attack' || abilityName === '攻撃' ||
    abilityName?.startsWith('unknown_')
  )
    return true;

  // Ignore abilities from players
  if (combatantId.startsWith('1'))
    return true;

  // Ignore abilities from NPC allies.
  // If a no-name combatant, we will ignore only if its also an unnamed ability, as
  // a named ability has more potential for being relevant to trigger creation.
  if (ignoredCombatants.includes(combatant) && combatant !== '')
    return true;
  if (combatant === '') {
    if (
      abilityName === undefined ||
      abilityName === ''
    )
      return true;
  }

  // Ignore abilities by ID
  if (abilityId !== undefined && args.ignore_id?.includes(abilityId))
    return true;

  // If only-combatants was specified, ignore all combatants not in the list.
  if (args.only_combatants && !args.only_combatants?.includes(combatant))
    return true;
  return false;
};

const makeTriggerInfoFromCollector = (collector: EncounterCollector, args: ExtendedArgs) => {
  const triggerInfo: TriggerInfo[] = [];

  const startsUsingMatcher = NetRegexes.startsUsing({ capture: true });
  const networkAOEAbilityMatcher = NetRegexes.ability({ capture: true });
  const startsUsingExtraMatcher = NetRegexes.startsUsingExtra({ capture: true });
  const abilityExtraMatcher = NetRegexes.abilityExtra({ capture: true });
  const headMarkerMatcher = NetRegexes.headMarker({ capture: true });
  const mapEffectMatcher = NetRegexes.mapEffect({ capture: true });
  const battleTalk2Matcher = NetRegexes.battleTalk2({ capture: true });
  const npcYellMatcher = NetRegexes.npcYell({ capture: true });
  const actorSetPosMatcher = NetRegexes.actorSetPos({ capture: true });

  for (const fight of collector.fights) {
    // No log lines means we skip the fight
    if (!((fight.logLines?.length ?? 0) > 0))
      continue;

    const startTimestamp = fight.startLine?.split('|')[1] ?? '';
    const endTimestamp = fight.logLines?.slice(-1)[0] ?? '';

    const repo = new LogRepository();
    const logConverter = new NetworkLogConverter();
    const lineEvents = logConverter.convertLines(fight.logLines ?? [], repo);
    const combatantTracker = new CombatantTracker(lineEvents, 'en');

    const fightInfo: TriggerInfo = {
      start: fight.startLine?.split('|')[1] ?? '',
      duration: new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime(),
      combatantTracker: combatantTracker,
      abilities: {},
      headMarkers: {},
    };

    if (args.track_mapeffect)
      fightInfo.mapEffects = {};

    if (args.track_battletalk2)
      fightInfo.battleTalk2s = {};

    if (args.track_npcyell)
      fightInfo.npcYells = {};

    if (args.track_actorsetpos)
      fightInfo.actorSetPoses = {};

    let haveLineMatch = false;
    for (const line of fight.logLines ?? []) {
      // Check for ability-related lines

      // For `StartsUsing` lines, we'll initialize the entry if needed
      // Other ability lines will skip if there's not a `StartsUsing` line
      // This pre-filters out abilities that don't have a castbar
      const startsUsing = startsUsingMatcher.exec(line);
      if (startsUsing !== null) {
        const id = startsUsing.groups?.id ?? '';
        if (ignoreAbilityEntry(startsUsing, args))
          continue;

        haveLineMatch = true;
        (fightInfo.abilities[id] ??= []).push(startsUsing);
        continue;
      }
      const networkAOEAbility = networkAOEAbilityMatcher.exec(line);
      if (networkAOEAbility !== null) {
        const id = networkAOEAbility.groups?.id ?? '';
        if (fightInfo.abilities[id] === undefined)
          continue;
        if (ignoreAbilityEntry(networkAOEAbility, args))
          continue;

        haveLineMatch = true;
        fightInfo.abilities[id]?.push(networkAOEAbility);
        continue;
      }
      const startsUsingExtra = startsUsingExtraMatcher.exec(line);
      if (startsUsingExtra !== null) {
        const id = startsUsingExtra.groups?.id ?? '';
        if (fightInfo.abilities[id] === undefined)
          continue;
        if (ignoreAbilityEntry(startsUsingExtra, args))
          continue;

        haveLineMatch = true;
        fightInfo.abilities[id]?.push(startsUsingExtra);
        continue;
      }
      const abilityExtra = abilityExtraMatcher.exec(line);
      if (abilityExtra !== null) {
        const id = abilityExtra.groups?.id ?? '';
        if (fightInfo.abilities[id] === undefined)
          continue;
        if (ignoreAbilityEntry(abilityExtra, args))
          continue;

        haveLineMatch = true;
        fightInfo.abilities[id]?.push(abilityExtra);
        continue;
      }

      const headMarker = headMarkerMatcher.exec(line);
      if (headMarker !== null) {
        const id = headMarker.groups?.id ?? '';

        haveLineMatch = true;
        (fightInfo.headMarkers[id] ??= []).push(headMarker);
        continue;
      }

      // For the rest, only check if we're looking for them

      if (args.track_mapeffect) {
        const mapEffect = mapEffectMatcher.exec(line);
        if (mapEffect !== null) {
          haveLineMatch = true;
          const location = mapEffect.groups?.location ?? '';
          if (fightInfo.mapEffects === undefined)
            continue;
          (fightInfo.mapEffects[location] ??= []).push(mapEffect);
          continue;
        }
      }

      if (args.track_battletalk2) {
        const battleTalk2 = battleTalk2Matcher.exec(line);
        if (battleTalk2 !== null) {
          haveLineMatch = true;
          const id = battleTalk2.groups?.instanceContentTextId ?? '';
          if (fightInfo.battleTalk2s === undefined)
            continue;
          (fightInfo.battleTalk2s[id] ??= []).push(battleTalk2);
          continue;
        }
      }

      if (args.track_npcyell) {
        const npcYell = npcYellMatcher.exec(line);
        if (npcYell !== null) {
          haveLineMatch = true;
          const id = npcYell.groups?.npcYellId ?? '';
          if (fightInfo.npcYells === undefined)
            continue;
          (fightInfo.npcYells[id] ??= []).push(npcYell);
          continue;
        }
      }

      if (args.track_actorsetpos) {
        const actorSetPos = actorSetPosMatcher.exec(line);
        if (actorSetPos !== null) {
          haveLineMatch = true;
          const id = actorSetPos.groups?.id ?? '';
          if (fightInfo.actorSetPoses === undefined)
            continue;
          if (id.startsWith('1'))
            continue;
          const combatant = combatantTracker.combatants[id];
          if (combatant === undefined)
            continue;
          const combatantName = combatant.firstState.Name ?? '!!!';
          // `ignoredCombatants` includes `''`, but we don't want to skip blank names for this.
          if (ignoredCombatants.includes(combatantName))
            continue;
          if (args.only_combatants && !args.only_combatants?.includes(combatantName))
            continue;
          (fightInfo.actorSetPoses[id] ??= []).push(actorSetPos);
          continue;
        }
      }
    }

    if (haveLineMatch)
      triggerInfo.push(fightInfo);
  }

  return triggerInfo;
};

const generateMapEffectTableFromTriggerInfo = (triggerInfo: TriggerInfo[]) => {
  let mapEffectTable = '';
  // Calculate instances
  const mapEffectMap: MapEffectMapInfo = {
    byOffset: [],
  };

  for (const fight of triggerInfo) {
    for (const [location, instances] of Object.entries(fight.mapEffects ?? [])) {
      for (const instance of instances) {
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        let byOffsetEntry = mapEffectMap.byOffset
          .find((entry) => Math.abs(entry.offset - instanceOffset) < timeOffsetAllowance);
        if (byOffsetEntry === undefined) {
          byOffsetEntry = {
            entries: [],
            offset: instanceOffset,
          };
          mapEffectMap.byOffset.push(byOffsetEntry);
        }

        byOffsetEntry.entries.push({ flags: instance.groups?.flags ?? '', location: location });
      }
    }
  }

  if (mapEffectMap.byOffset.length > 0) {
    mapEffectTable += `

const mapEffectData = {`;

    const allLocations = [
      ...new Set(
        mapEffectMap.byOffset.flatMap((entry) =>
          entry.entries.map((subEntry) => subEntry.location)
        ),
      ),
    ].sort(hexSort);

    for (const location of allLocations) {
      const allOffsets = [
        ...new Set(
          mapEffectMap.byOffset
            .filter((entry) => entry.entries.find((subEntry) => subEntry.location === location))
            .map((entry) => entry.offset),
        ),
      ].sort(numberSort);
      const allFlags = [
        ...new Set(
          mapEffectMap.byOffset
            .flatMap((entry) => entry.entries.filter((subEntry) => subEntry.location === location))
            .map((entry) => entry.flags),
        ),
      ].sort(hexSort);
      mapEffectTable += `
  // Offsets: ${allOffsets.join()}
  '${location}': {
    'location': '${location}',`;

      for (let i = 0; i < allFlags.length; ++i) {
        const flags = allFlags[i] ?? '';
        const flagOffsets = [
          ...new Set(
            mapEffectMap.byOffset
              .filter((entry) => entry.entries.find((subEntry) => subEntry.flags === flags))
              .map((entry) => entry.offset),
          ),
        ].sort(numberSort);
        const flagsKey = flags.match(/^0*?800040*?$/) ? `'clear${i}'` : `'flags${i}'`;
        mapEffectTable += `
    // Offsets: ${flagOffsets.join()}
    ${flagsKey}: '${flags}',`;
      }

      mapEffectTable += `
  },
`;
    }

    mapEffectTable += `} as const;
`;
  }
  return mapEffectTable;
};

const generateNpcYellTableFromTriggerInfo = async (triggerInfo: TriggerInfo[]) => {
  let npcYellTable = '';
  // Calculate instances
  const npcYellMap: NpcYellMapInfo = {
    byOffset: [],
  };

  for (const fight of triggerInfo) {
    for (const [yellId, instances] of Object.entries(fight.npcYells ?? [])) {
      for (const instance of instances) {
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        let byOffsetEntry = npcYellMap.byOffset
          .find((entry) => Math.abs(entry.offset - instanceOffset) < timeOffsetAllowance);
        if (byOffsetEntry === undefined) {
          byOffsetEntry = {
            entries: [],
            offset: instanceOffset,
          };
          npcYellMap.byOffset.push(byOffsetEntry);
        }

        byOffsetEntry.entries.push({
          yellId: yellId ?? '',
          npcNameId: instance.groups?.npcNameId ?? 'MISSING NPC NAME ID',
        });
      }
    }
  }

  if (npcYellMap.byOffset.length > 0) {
    npcYellTable += `

const npcYellData = {`;

    const allYellIds = [
      ...new Set(
        npcYellMap.byOffset.flatMap((offset) => offset.entries.map((entry) => entry.yellId)),
      ),
    ].sort(hexSort);

    const xivapiNpcYells: XIVAPINpcYellResponse | undefined = await (await fetch(
      `https://beta.xivapi.com/api/1/sheet/NpcYell?rows=${
        allYellIds.map((yell) => parseInt(yell, 16).toString()).join(',')
      }&fields=Text`,
    )).json() as XIVAPINpcYellResponse;

    for (const yellId of allYellIds) {
      const allOffsets = [
        ...new Set(
          npcYellMap.byOffset
            .filter((entry) => entry.entries.find((subEntry) => subEntry.yellId === yellId))
            .map((entry) => entry.offset),
        ),
      ].sort(numberSort);
      const allNpcIds = [
        ...new Set(
          npcYellMap.byOffset
            .flatMap((entry) => entry.entries.filter((subEntry) => subEntry.yellId === yellId))
            .map((entry) => entry.npcNameId),
        ),
      ].sort(hexSort);
      npcYellTable += `
  // Offsets: ${allOffsets.join()}
  '${yellId}': {
    'yellId': '${yellId}',
    'text': ${
        JSON.stringify(
          xivapiNpcYells.rows.find((row) => row.row_id === parseInt(yellId, 16))?.fields.Text ??
            'MISSING TEXT',
        )
      },
    'npcIds': ${JSON.stringify(allNpcIds)},
  },`;
    }

    npcYellTable += `
} as const;
`;
  }
  return npcYellTable;
};

const generateBattleTalk2TableFromTriggerInfo = async (triggerInfo: TriggerInfo[]) => {
  let battleTalk2Table = '';
  // Calculate instances
  const battleTalk2Map: BattleTalk2MapInfo = {
    byOffset: [],
  };

  for (const fight of triggerInfo) {
    for (const [textId, instances] of Object.entries(fight.battleTalk2s ?? [])) {
      for (const instance of instances) {
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        let byOffsetEntry = battleTalk2Map.byOffset
          .find((entry) => Math.abs(entry.offset - instanceOffset) < timeOffsetAllowance);
        if (byOffsetEntry === undefined) {
          byOffsetEntry = {
            entries: [],
            offset: instanceOffset,
          };
          battleTalk2Map.byOffset.push(byOffsetEntry);
        }

        byOffsetEntry.entries.push({
          textId: textId ?? '',
          npcNameId: instance.groups?.npcNameId ?? 'MISSING NPC NAME ID',
        });
      }
    }
  }

  if (battleTalk2Map.byOffset.length > 0) {
    battleTalk2Table += `

const battleTalk2Data = {`;

    const allTextIds = [
      ...new Set(
        battleTalk2Map.byOffset.flatMap((offset) => offset.entries.map((entry) => entry.textId)),
      ),
    ].sort(hexSort);

    const xivapiBattleTalk2s: XIVAPIBattleTalk2Response | undefined = await (await fetch(
      `https://beta.xivapi.com/api/1/sheet/InstanceContentTextData?rows=${
        allTextIds.map((textId) => parseInt(textId, 16).toString()).join(',')
      }&fields=Text`,
    )).json() as XIVAPIBattleTalk2Response;

    for (const textId of allTextIds) {
      const allOffsets = [
        ...new Set(
          battleTalk2Map.byOffset
            .filter((entry) => entry.entries.find((subEntry) => subEntry.textId === textId))
            .map((entry) => entry.offset),
        ),
      ].sort(numberSort);
      const allNpcIds = [
        ...new Set(
          battleTalk2Map.byOffset
            .flatMap((entry) => entry.entries.filter((subEntry) => subEntry.textId === textId))
            .map((entry) => entry.npcNameId),
        ),
      ].sort(hexSort);
      battleTalk2Table += `
  // Offsets: ${allOffsets.join()}
  '${textId}': {
    'textId': '${textId}',
    'text': ${
        JSON.stringify(
          xivapiBattleTalk2s.rows.find((row) => row.row_id === parseInt(textId, 16))?.fields.Text ??
            'MISSING TEXT',
        )
      },
    'npcIds': ${JSON.stringify(allNpcIds)},
  },`;
    }

    battleTalk2Table += `
} as const;
`;
  }
  return battleTalk2Table;
};

const generateActorSetPosTableFromTriggerInfo = (triggerInfo: TriggerInfo[]) => {
  let actorSetPosTable = '';

  const abilitiesUsedAt: Position[] = [];
  for (const fight of triggerInfo) {
    for (const [, instances] of Object.entries(fight.abilities)) {
      for (const instance of instances) {
        const position = new Position(
          instance.groups?.x,
          instance.groups?.y,
          instance.groups?.z,
          instance.groups?.heading,
        );
        if (abilitiesUsedAt.find((entry) => entry.equals(position)) === undefined)
          abilitiesUsedAt.push(position);
      }
    }
  }

  // Calculate instances
  const actorSetPosMap: ActorSetPosMapInfo = {
    byOffset: [],
    byPosition: [],
  };

  for (const fight of triggerInfo) {
    for (const [, instances] of Object.entries(fight.actorSetPoses ?? [])) {
      for (const instance of instances) {
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        const instancePosition = new Position(
          instance.groups?.x,
          instance.groups?.y,
          instance.groups?.z,
          instance.groups?.heading,
        );

        // If there's never an ability used here, skip this ActorSetPos entry
        if (abilitiesUsedAt.find((entry) => entry.equals(instancePosition, false)) === undefined)
          continue;

        let byOffsetEntry = actorSetPosMap.byOffset
          .find((entry) => Math.abs(entry.offset - instanceOffset) < timeOffsetAllowance);
        if (byOffsetEntry === undefined) {
          byOffsetEntry = {
            actorNames: [],
            positions: [],
            offset: instanceOffset,
          };
          actorSetPosMap.byOffset.push(byOffsetEntry);
        }
        let byPositionEntry = actorSetPosMap.byPosition
          .find((entry) => entry.pos.equals(instancePosition));
        if (byPositionEntry === undefined) {
          byPositionEntry = {
            pos: instancePosition,
            actorNames: [],
            offsets: [],
          };
          actorSetPosMap.byPosition.push(byPositionEntry);
        }

        const actorIdz = instance.groups?.id ?? 'MISSING ID';
        const actorName = fight.combatantTracker.combatants[actorIdz]?.firstState.Name ??
          'MISSING NAME';

        if (!byOffsetEntry.actorNames.includes(actorName))
          byOffsetEntry.actorNames.push(actorName);

        if (byOffsetEntry.positions.find((entry) => entry.equals(instancePosition)) === undefined)
          byOffsetEntry.positions.push(instancePosition);

        if (!byPositionEntry.actorNames.includes(actorName))
          byPositionEntry.actorNames.push(actorName);

        if (
          !byPositionEntry.offsets.find((entry) =>
            Math.abs(entry - instanceOffset) < timeOffsetAllowance
          )
        )
          byPositionEntry.offsets.push(instanceOffset);
      }
    }
  }

  // TODO: `actorSetPosMap` is still a little too big.
  // We can probably filter more instances out, or compress the data somehow.
  if (actorSetPosMap.byPosition.length > 0) {
    actorSetPosTable += `

const actorSetPosPositionMap = ${JSON.stringify(actorSetPosMap.byPosition, undefined, 2)} as const;
`;
  }
  return actorSetPosTable;
};

const generateHeadMarkerTableFromTriggerInfo = async (
  triggerInfo: TriggerInfo[],
  args: ExtendedArgs,
): Promise<[string, string]> => {
  let headMarkerTable = '';
  let headMarkerTriggers = '';
  const headMarkerMap: HeadMarkerMapInfo = {
    byOffset: [],
  };

  for (const fight of triggerInfo) {
    const firstHeadmarker = Object.values(fight.headMarkers)
      .flatMap((instances) => instances)
      .sort((left, right) =>
        left.groups?.timestamp.localeCompare(right.groups?.timestamp ?? '') ?? 0
      )[0];

    if (firstHeadmarker === undefined)
      continue;

    const headmarkerOffset = parseInt(firstHeadmarker.groups?.id ?? '0', 16) -
      parseInt(args.first_headmarker_id ?? firstHeadmarker.groups?.id ?? '0', 16);
    for (const [id, instances] of Object.entries(fight.headMarkers)) {
      for (const instance of instances) {
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        let byOffsetEntry = headMarkerMap.byOffset
          .find((entry) => Math.abs(entry.offset - instanceOffset) < timeOffsetAllowance);
        if (byOffsetEntry === undefined) {
          byOffsetEntry = {
            vfx: [],
            offset: instanceOffset,
          };
          headMarkerMap.byOffset.push(byOffsetEntry);
        }

        byOffsetEntry.vfx.push(
          (parseInt(id, 16) - headmarkerOffset).toString(16).toUpperCase().padStart(4, '0'),
        );
      }
    }
  }

  if (headMarkerMap.byOffset.length > 0) {
    headMarkerTable += `

const headMarkerData = {
`;

    const allHeadmarkers = [
      ...new Set(
        headMarkerMap.byOffset.flatMap((entry) => entry.vfx),
      ),
    ].sort(hexSort);

    const xivapiHeadMarkerInfo: XIVAPILockonResponse | undefined = await (await fetch(
      `https://beta.xivapi.com/api/1/sheet/Lockon?rows=${
        allHeadmarkers.map((hm) => parseInt(hm, 16).toString()).join(',')
      }&fields=Unknown0`,
    )).json() as XIVAPILockonResponse;

    // https://beta.xivapi.com/api/1/sheet/Lockon?rows=79&fields=Unknown0
    for (const headmarker of allHeadmarkers) {
      const allOffsets = [
        ...new Set(
          headMarkerMap.byOffset
            .filter((entry) => entry.vfx.find((subEntry) => subEntry === headmarker))
            .map((entry) => entry.offset),
        ),
      ].sort(numberSort);
      const vfxPath = xivapiHeadMarkerInfo?.rows.find((row) =>
        row.row_id === parseInt(headmarker, 16)
      )?.fields
        .Unknown0 ?? 'Unknown';
      headMarkerTable += `  // Offsets: ${allOffsets.join()}
  // Vfx Path: ${vfxPath}
  '${headmarker}': '${headmarker}',
`;

      let suggestedOperation: HeadmarkerTriggerSuggestTypes = 'Skip';

      const instances = triggerInfo.flatMap((fight) => fight.headMarkers[headmarker] ?? []);

      const onAPlayer = instances.find((instance) =>
        (instance.groups?.targetId ?? '').startsWith('1')
      ) !== undefined;

      switch (vfxPath) {
        case 'com_share1f':
        case 'com_share3t':
        case 'com_share3_7s0p':
        case 'loc05sp_05a_se_p':
        case 'com_share5a1':
          suggestedOperation = 'Stack';
          break;
        case 'tank_lockon02k1':
        case 'm0676trg_tw_d0t1p':
        case 'tank_laser_lockon01p':
        case 'tank_laser_5sec_lockon_c0a1':
          suggestedOperation = 'Tankbuster';
          break;
        case 'target_ae_s7k1':
        case 'm0906_tgae_s701k2':
        case 'tag_ae5m_8s_0v':
          suggestedOperation = 'Spread';
          break;
        case 'm0906_share4_7s0k2':
          suggestedOperation = 'Party Stacks';
          break;
      }

      const result = await inquirer.prompt<{ action: HeadmarkerTriggerSuggestTypes | null }>([
        {
          type: 'list',
          name: 'action',
          message: `Headmarker Information:
ID: ${headmarker},
VFX: ${vfxPath},
On Player: ${onAPlayer ? 'Yes' : 'No'},
Line Count: ${instances.length},
Offsets: ${allOffsets.sort(numberSort).join(', ')}
`,
          choices: triggerSuggestOptions.map((e) => {
            return {
              name: e,
              value: e,
            };
          }),
          default: suggestedOperation,
        },
      ]);

      switch (result.action) {
        case 'Tankbuster':
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Tankbuster ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: true },
      response: Responses.tankBuster(),
    },`;
          break;
        case 'Stack':
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Stack ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: true },
      response: Responses.stackMarkerOn(),
    },`;
          break;
        case 'Party Stacks':
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Party Stacks ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: false },
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.stacks,
      },
    },`;
          break;
        case 'Spread':
          // TODO: Maybe we want a condition here for target is you?
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Spread ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: true },
      suppressSeconds: 5,
      response: Responses.spread(),
    },`;
          break;
        case 'Knockback':
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Knockback ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: false },
      response: Responses.knockback(),
    },`;
          break;
        case 'Custom':
          headMarkerTriggers += `
    {
      id: '${args.trigger_id_prefix ?? ''} Headmarker Custom ${headmarker}',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['${headmarker}'], capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Custom Text',
          de: 'Benutzerdefinierter Text',
          fr: 'Texte personnalisé',
          cn: '自定义文本',
        },
      },
    },`;
          break;
      }
    }

    headMarkerTable += `} as const;
`;
  }
  return [headMarkerTable, headMarkerTriggers];
};

const generateTriggersTextFromTriggerInfo = async (
  triggerInfo: TriggerInfo[],
  args: ExtendedArgs,
) => {
  let triggersText = '';

  const longestFight = triggerInfo.sort((left, right) => left.duration - right.duration)[0];

  if (longestFight === undefined)
    return '';

  const abilitiesByName: AbilityNameMapInfo[] = [];

  for (const fight of triggerInfo) {
    for (const [id, instances] of Object.entries(fight.abilities)) {
      const abilityName = instances[0]?.groups?.ability ?? '';
      // Collect by name
      let mapInfo = abilitiesByName.find((info) => info.name === abilityName);

      if (mapInfo === undefined) {
        mapInfo = {
          name: abilityName,
          fights: [],
          ids: [],
          offsets: [],
        };
        abilitiesByName.push(mapInfo);
      }

      mapInfo.ids = [...new Set([...mapInfo.ids, id])]
        .sort((left, right) => parseInt(left, 16) - parseInt(right, 16));

      let mapInfoFight = mapInfo.fights.find((mFight) => mFight.start === fight.start);

      if (mapInfoFight === undefined) {
        mapInfoFight = {
          start: fight.start,
          instances: [],
        };
        mapInfo.fights.push(mapInfoFight);
      }

      mapInfoFight.instances = [...new Set([...mapInfoFight.instances, ...instances])]
        .sort((left, right) =>
          left.groups?.timestamp.localeCompare(right.groups?.timestamp ?? '') ?? 0
        );

      // Calculate instances
      for (const instance of instances) {
        // Only consider StartsUsing lines
        if (instance.groups?.type !== '20')
          continue;
        const instanceOffset = new Date(instance.groups?.timestamp ?? '').getTime() -
          new Date(fight.start).getTime();
        let newOffset = true;
        for (const pfOffset of mapInfo.offsets) {
          if (Math.abs(instanceOffset - pfOffset) < timeOffsetAllowance) {
            newOffset = false;
            break;
          }
        }
        if (newOffset) {
          mapInfo.offsets.push(instanceOffset);
        }
      }
    }
  }

  const xivapiAbilityInfo: XIVAPIAbilityResponse | undefined = await (await fetch(
    `https://beta.xivapi.com/api/1/sheet/Action?rows=${
      [...new Set(abilitiesByName.flatMap((entry) => entry.ids))].sort().map((id) =>
        parseInt(id, 16).toString()
      ).join(',')
    }&fields=CastType,EffectRange,Omen,XAxisModifier`,
  )).json() as XIVAPIAbilityResponse;

  for (const mapInfo of abilitiesByName) {
    const abilityName = mapInfo.name;
    const instances = mapInfo.fights.flatMap((fight) => fight.instances);
    const abilityLineTypes = [...new Set(instances.map((instance) => instance.groups?.type ?? ''))];

    let suggestedOperation: TriggerSuggestTypes = 'Skip';

    const hitAPlayer = mapInfo.fights
      .find((fight) =>
        fight.instances.find((instance) => (instance.groups?.targetId ?? '').startsWith('1'))
      );

    // TODO: More default suggestions. Figure out how things work for square (CastType=12)
    // vs left/right/etc positioning
    const castTypeSuggestions = new Set<TriggerSuggestTypes>();
    const castTypeFullSuggestions = new Set<TriggerSuggestTypesFull>();
    if (xivapiAbilityInfo !== undefined) {
      const xivApiAbilities = mapInfo.fights
        .flatMap((fight) => fight.instances.filter((instance) => instance.groups?.type === '20'))
        .map((instance) =>
          xivapiAbilityInfo.rows
            .find((row) => row.row_id === parseInt(instance.groups?.id ?? '0', 16))
        );

      // Loop through the abilities we have info for, apply a suggested operation.
      for (const abilityInfo of xivApiAbilities) {
        if (abilityInfo === undefined)
          continue;
        switch (abilityInfo.fields.CastType) {
          case 2: // Circle
          case 5: // Circle, size modified by hitbox
            // If the effect range is massive (greater than 35y), and it's a circle
            // then it's actually a raidwide
            if (abilityInfo.fields.EffectRange >= 35) {
              castTypeSuggestions.add('AoE');
              castTypeFullSuggestions.add(
                `AoE (circle, range = ${abilityInfo.fields.EffectRange})`,
              );
            }
            castTypeSuggestions.add('Circle (out)');
            castTypeFullSuggestions.add('Circle (out)');
            break;
          case 3: // Cone, size modified by hitbox
          case 13: // Cone
            castTypeSuggestions.add('Away from Front (cone)');
            castTypeFullSuggestions.add('Away from Front (cone)');
            break;
          case 4: // Rectangle, size modified by hitbox
          case 12: // Rectangle
          case 8: // Charging rectangle
            castTypeSuggestions.add('Custom Separate');
            castTypeFullSuggestions.add(`Rectangle AoE, CastType = ${abilityInfo.fields.CastType}`);
            break;
          case 10: // Donut
            castTypeSuggestions.add('Donut (in)');
            castTypeFullSuggestions.add('Donut (in)');
            break;
          case 11: // Plus
            castTypeSuggestions.add('Custom Joined');
            castTypeFullSuggestions.add(`Plus AoE`);
            break;
        }
      }
    }

    if (castTypeSuggestions.size !== 0) {
      // Just apply the first entry in the set
      suggestedOperation = [...castTypeSuggestions][0] ?? 'Skip';
    } else {
      if (abilityLineTypes.includes('22') && abilityLineTypes.includes('21')) {
        // Sometimes hits, sometimes doesn't, this is probably a dodgeable mechanic
        suggestedOperation = 'Custom Joined';
      } else if (abilityLineTypes.includes('21') && hitAPlayer) {
        // Never hits more than 1 person, but has hit a person
        // Also has a cast bar, this is probably a dodgeable mechanic
        suggestedOperation = 'Custom Joined';
      } else if (abilityLineTypes.includes('21')) {
        // Has a cast bar, finished casting, never hit a player.
        suggestedOperation = 'Skip';
      } else {
        // Cast, and always hits multiple
        suggestedOperation = 'AoE';
      }
    }

    const result = await inquirer.prompt<{ action: TriggerSuggestTypes | null }>([
      {
        type: 'list',
        name: 'action',
        message: `Ability Information:
Name: ${abilityName},
IDs: ${mapInfo.ids.join(', ')},
Sources: ${
          [
            ...new Set(mapInfo.fights.flatMap((fight) =>
              fight.instances.map((instance) => instance.groups?.source ?? '')
            )),
          ].sort().join(', ')
        },
Line Types: ${abilityLineTypes.sort(numberSort).join(', ')},
Line Count: ${instances.length},
Offsets: ${mapInfo.offsets.sort(numberSort).join(', ')},
CastInfo Hints: ${[...castTypeFullSuggestions].join(', ')}
`,
        choices: triggerSuggestOptions.map((e) => {
          return {
            name: e,
            value: e,
          };
        }),
        default: suggestedOperation,
      },
    ]);

    const allIdsString = mapInfo.ids.length > 1
      ? `['${mapInfo.ids.join('\', \'').toUpperCase()}']`
      : `'${mapInfo.ids[0]?.toUpperCase() ?? ''}'`;

    switch (result.action) {
      case 'AoE':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.aoe(),
    },`;
        break;
      case 'Donut (in)':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.getUnder(),
    },`;
        break;
      case 'Plus (out intercards)':
        // TODO: We should probably have this as a `Responses` option,
        // but that's beyond the scope of this PR
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      infoText: (_data, _matches, output) => output.intercards!(),
      outputStrings: {
        intercards: {
          en: 'Intercards',
          de: 'Interkardinal',
          fr: 'Intercardinal',
          ja: '斜めへ',
          cn: '四角',
          ko: '대각선 쪽으로',
        },
      },
    },`;
        break;
      case 'Circle (out)':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.getOut(),
    },`;
        break;
      case 'Away from Front (cone)':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.awayFromFront(),
    },`;
        break;
      case 'Tankbuster':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.tankBuster(),
    },`;
        break;
      case 'Stack':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: true },
      response: Responses.stackMarkerOn(),
    },`;
        break;
      case 'Party Stacks':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: {
          en: 'Stacks',
          de: 'Sammeln',
          fr: 'Package',
          cn: '分摊',
          ko: '쉐어',
        },
      },
    },`;
        break;
      case 'Spread':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },`;
        break;
      case 'Knockback':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      response: Responses.knockback(),
    },`;
        break;
      case 'Custom Joined':
        triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName}',
      type: 'StartsUsing',
      netRegex: { id: ${allIdsString}, source: '${
          mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
        }', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Custom Text',
          de: 'Benutzerdefinierter Text',
          fr: 'Texte personnalisé',
          cn: '自定义文本',
        },
      },
    },`;
        break;
      case 'Custom Separate':
        for (const id of mapInfo.ids) {
          triggersText += `
    {
      id: '${args.trigger_id_prefix ?? ''} ${abilityName} ${id}',
      type: 'StartsUsing',
      netRegex: { id: '${id.toUpperCase()}', source: '${
            mapInfo.fights[0]?.instances[0]?.groups?.source ?? 'MISSING SOURCE'
          }', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Custom Text',
          de: 'Benutzerdefinierter Text',
          fr: 'Texte personnalisé',
          cn: '自定义文本',
        },
      },
    },`;
        }
        break;
    }
  }
  return triggersText;
};

const generateFileFromTriggerInfo = async (triggerInfo: TriggerInfo[], args: ExtendedArgs) => {
  let preText = '';

  // Handle pre-TriggerSet text

  if (args.track_mapeffect) {
    preText += generateMapEffectTableFromTriggerInfo(triggerInfo);
  }

  if (args.track_npcyell) {
    preText += await generateNpcYellTableFromTriggerInfo(triggerInfo);
  }

  if (args.track_battletalk2) {
    preText += await generateBattleTalk2TableFromTriggerInfo(triggerInfo);
  }

  if (args.track_actorsetpos) {
    preText += generateActorSetPosTableFromTriggerInfo(triggerInfo);
  }

  const [headmarkerMapText, headmarkerTriggersText] = await generateHeadMarkerTableFromTriggerInfo(
    triggerInfo,
    args,
  );

  preText += headmarkerMapText;

  const triggersText = await generateTriggersTextFromTriggerInfo(triggerInfo, args);

  const processArgs = process.argv.map((arg) => arg.includes(' ') ? JSON.stringify(arg) : arg).join(
    ' ',
  );

  return `// Auto-generated with:
// ${processArgs}
import { Responses } from '../../../../../resources/responses';
import { Outputs } from '../../../../../resources/outputs';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;${preText}
const triggerSet: TriggerSet<RaidbossData> = {
  id: '${args.zone_id ?? ''}',
  zoneId: ZoneId.${args.zone_id ?? ''},
  timelineFile: '???.txt',
  triggers: [${headmarkerTriggersText}${triggersText}
  ]
};

export default triggerSet;
`;
};

const generateTriggers = async () => {
  const args: ExtendedArgs = new ExtendedArgsRequired({});
  generateTriggersParse.parser.parseArgs(undefined, args);
  validateArgs(args);

  let triggersFile = '';

  if (Array.isArray(args.files) && args.files.length > 0) {
    const collector = await makeCollectorFromFiles(args.files ?? [], args.zone_id ?? '');
    const triggerInfo = makeTriggerInfoFromCollector(collector, args);
    triggersFile = await generateFileFromTriggerInfo(triggerInfo, args);
  }

  if (typeof args.output_file === 'string') {
    fs.writeFileSync(args.output_file, triggersFile, { flag: 'wx' });
  } else {
    // Use process.stdout.write to avoid truncation from console.log
    process.stdout.write(triggersFile);
  }

  process.exit(0);
};

void generateTriggers();
