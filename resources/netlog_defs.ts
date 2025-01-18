import { PluginCombatantState } from '../types/event';
import { NetFieldsReverse } from '../types/net_fields';
import { NetParams } from '../types/net_props';

export type LogDefinition<K extends LogDefinitionName> = {
  // The log line id, as a decimal string, minimum two characters.
  type: LogDefinitions[K]['type'];
  // The informal name of this log line (must match the key that the LogDefinition is a value for).
  name: K;
  // The plugin that generates this log line.
  source: 'FFXIV_ACT_Plugin' | 'OverlayPlugin';
  // Parsed ACT log line type.  OverlayPlugin lines use the `type` as a string.
  messageType: LogDefinitions[K]['messageType'];
  // If true, always include this line when splitting logs (e.g. FFXIV plugin version).
  globalInclude?: boolean;
  // If true, always include the last instance of this line when splitting logs (e.g. ChangeZone).
  lastInclude?: boolean;
  // True if the line can be anonymized (i.e. removing player ids and names).
  canAnonymize?: boolean;
  // If true, this log line has not been seen before and needs more information.
  isUnknown?: boolean;
  // Fields at this index and beyond are cleared, when anonymizing.
  firstUnknownField?: number;
  // A map of all of the fields, unique field name to field index.
  fields: LogDefinitions[K]['fields'];
  // Field indices that *may* contain RSV placeholders (for decoding)
  possibleRsvFields?: LogDefFieldIdx<K> | readonly LogDefFieldIdx<K>[];
  // Field names and values that can override `canAnonymize`. See `LogDefSubFields` type below.
  subFields?: LogDefSubFields<K>;
  // Map of field indices to anonymize, in the format: playerId: (optional) playerName.
  playerIds?: PlayerIdMap<K>;
  // A list of field indices that may contains player ids and, if so, will be anonymized.
  // If an index is listed here and in `playerIds`, it will be treated as a possible id field.
  possiblePlayerIds?: readonly LogDefFieldIdx<K>[];
  // A list of field indices that are ok to be blank (or have invalid ids).
  blankFields?: readonly LogDefFieldIdx<K>[];
  // This field index (and all after) will be treated as optional when creating capturing regexes.
  firstOptionalField: number | undefined;
  // These fields are treated as repeatable fields
  repeatingFields?: {
    startingIndex: number;
    label: string;
    names: readonly string[];
    sortKeys?: boolean;
    primaryKey: string;
    possibleKeys: readonly string[];
    // Repeating fields that will be anonymized if present. Same structure as `playerIds`,
    // but uses repeating field keys (names) in place of field indices. However, the 'id' field
    // of an id/name pair can be a fixed field index. See `CombatantMemory` example.
    keysToAnonymize?: K extends RepeatingFieldsTypes ? { [idField: string | number]: string | null }
      : never;
  };
  // See `AnalysisOptions` type. Omitting this property means no log lines will be included;
  // however, if raidboss triggers are found using this line type, an automated workflow will
  // create this property and set `include: 'all'`. To suppress this, use `include: 'never``.
  analysisOptions?: AnalysisOptions<K>;
};

export type LogDefFieldIdx<
  K extends LogDefinitionName,
> = Extract<LogDefinitions[K]['fields'][keyof LogDefinitions[K]['fields']], number>;

type PlayerIdMap<K extends LogDefinitionName> = {
  [P in LogDefFieldIdx<K> as number]?: LogDefFieldIdx<K> | null;
};

export type LogDefFieldName<K extends LogDefinitionName> = Extract<
  keyof LogDefinitions[K]['fields'],
  string
>;

// Specifies a fieldName key with one or more possible values and a `canAnonyize` override
// if that field and value are present on the log line. See 'GameLog' for an example.
type LogDefSubFields<K extends LogDefinitionName> = {
  [P in LogDefFieldName<K>]?: {
    [fieldValue: string]: {
      name: string;
      canAnonymize: boolean;
    };
  };
};

// Options for including these lines in a filtered log via the log splitter's analysis option.
// `include:` specifies the level of inclusion:
//   - 'all' will include all lines with no filtering.
//   - 'filter' will include only those lines that match at least one of the specified `filters`.
//   - 'never' is an override; just like if the property were omitted, no log lines will be included
//      in the filter; however, if 'never' is used, the automated workflow will not attempt to
//      change it to 'all' upon finding active triggers using this line type.
// `filters:` contains Netregex-style filter criteria. Lines satisfying at least one filter will be
//   included. If `include:` = 'filter', `filters` must be present; otherwise, it must be omitted.
// `combatantIdFields:` are field indices containing combatantIds. If specified, these fields
//   will be checked for ignored combatants (e.g. pets) during log filtering.
export type AnalysisOptions<K extends LogDefinitionName> = {
  include: 'never';
  filters?: undefined;
  combatantIdFields?: undefined;
} | {
  include: 'filter';
  filters: NetParams[K] | readonly NetParams[K][];
  combatantIdFields?: LogDefFieldIdx<K> | readonly LogDefFieldIdx<K>[];
} | {
  include: 'all';
  filters?: undefined;
  combatantIdFields?: LogDefFieldIdx<K> | readonly LogDefFieldIdx<K>[];
};

// TODO: Maybe bring in a helper library that can compile-time extract these keys instead?
const combatantMemoryKeys: readonly (Extract<keyof PluginCombatantState, string>)[] = [
  'CurrentWorldID',
  'WorldID',
  'WorldName',
  'BNpcID',
  'BNpcNameID',
  'PartyType',
  'ID',
  'OwnerID',
  'WeaponId',
  'Type',
  'Job',
  'Level',
  'Name',
  'CurrentHP',
  'MaxHP',
  'CurrentMP',
  'MaxMP',
  'PosX',
  'PosY',
  'PosZ',
  'Heading',
  'MonsterType',
  'Status',
  'ModelStatus',
  'AggressionStatus',
  'TargetID',
  'IsTargetable',
  'Radius',
  'Distance',
  'EffectiveDistance',
  'NPCTargetID',
  'CurrentGP',
  'MaxGP',
  'CurrentCP',
  'MaxCP',
  'PCTargetID',
  'IsCasting1',
  'IsCasting2',
  'CastBuffID',
  'CastTargetID',
  'CastGroundTargetX',
  'CastGroundTargetY',
  'CastGroundTargetZ',
  'CastDurationCurrent',
  'CastDurationMax',
  'TransformationId',
] as const;

const latestLogDefinitions = {
  GameLog: {
    type: '00',
    name: 'GameLog',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'ChatLog',
    fields: {
      type: 0,
      timestamp: 1,
      code: 2,
      name: 3,
      line: 4,
    },
    subFields: {
      code: {
        '0039': {
          name: 'message',
          canAnonymize: true,
        },
        '0038': {
          name: 'echo',
          canAnonymize: true,
        },
        '0044': {
          name: 'dialog',
          canAnonymize: true,
        },
        '0839': {
          name: 'message',
          canAnonymize: true,
        },
      },
    },
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { code: ['0044', '0839'] },
    },
  },
  ChangeZone: {
    type: '01',
    name: 'ChangeZone',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Territory',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
    },
    lastInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
    },
  },
  ChangedPlayer: {
    type: '02',
    name: 'ChangedPlayer',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'ChangePrimaryPlayer',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
    },
    playerIds: {
      2: 3,
    },
    lastInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  AddedCombatant: {
    type: '03',
    name: 'AddedCombatant',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'AddCombatant',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      job: 4,
      level: 5,
      ownerId: 6,
      worldId: 7,
      world: 8,
      npcNameId: 9,
      npcBaseId: 10,
      currentHp: 11,
      hp: 12,
      currentMp: 13,
      mp: 14,
      // maxTp: 15,
      // tp: 16,
      x: 17,
      y: 18,
      z: 19,
      heading: 20,
    },
    playerIds: {
      2: 3,
      6: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { id: '4.{7}' }, // NPC combatants only
      combatantIdFields: 2,
    },
  },
  RemovedCombatant: {
    type: '04',
    name: 'RemovedCombatant',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'RemoveCombatant',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      job: 4,
      level: 5,
      owner: 6,
      world: 8,
      npcNameId: 9,
      npcBaseId: 10,
      currentHp: 11,
      hp: 12,
      currentMp: 13,
      mp: 14,
      // currentTp: 15,
      // maxTp: 16,
      x: 17,
      y: 18,
      z: 19,
      heading: 20,
    },
    playerIds: {
      2: 3,
      6: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { id: '4.{7}' }, // NPC combatants only
      combatantIdFields: 2,
    },
  },
  PartyList: {
    type: '11',
    name: 'PartyList',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'PartyList',
    fields: {
      type: 0,
      timestamp: 1,
      partyCount: 2,
      id0: 3,
      id1: 4,
      id2: 5,
      id3: 6,
      id4: 7,
      id5: 8,
      id6: 9,
      id7: 10,
      id8: 11,
      id9: 12,
      id10: 13,
      id11: 14,
      id12: 15,
      id13: 16,
      id14: 17,
      id15: 18,
      id16: 19,
      id17: 20,
      id18: 21,
      id19: 22,
      id20: 23,
      id21: 24,
      id22: 25,
      id23: 26,
    },
    playerIds: {
      3: null,
      4: null,
      5: null,
      6: null,
      7: null,
      8: null,
      9: null,
      10: null,
      11: null,
      12: null,
      13: null,
      14: null,
      15: null,
      16: null,
      17: null,
      18: null,
      19: null,
      20: null,
      21: null,
      22: null,
      23: null,
      24: null,
      25: null,
      26: null,
    },
    firstOptionalField: 3,
    canAnonymize: true,
    lastInclude: true,
  },
  PlayerStats: {
    type: '12',
    name: 'PlayerStats',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'PlayerStats',
    fields: {
      type: 0,
      timestamp: 1,
      job: 2,
      strength: 3,
      dexterity: 4,
      vitality: 5,
      intelligence: 6,
      mind: 7,
      piety: 8,
      attackPower: 9,
      directHit: 10,
      criticalHit: 11,
      attackMagicPotency: 12,
      healMagicPotency: 13,
      determination: 14,
      skillSpeed: 15,
      spellSpeed: 16,
      tenacity: 18,
      localContentId: 19,
    },
    canAnonymize: true,
    lastInclude: true,
    firstOptionalField: undefined,
  },
  StartsUsing: {
    type: '20',
    name: 'StartsUsing',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StartsCasting',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      source: 3,
      id: 4,
      ability: 5,
      targetId: 6,
      target: 7,
      castTime: 8,
      x: 9,
      y: 10,
      z: 11,
      heading: 12,
    },
    possibleRsvFields: 5,
    blankFields: [6],
    playerIds: {
      2: 3,
      6: 7,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { sourceId: '4.{7}' }, // NPC casts only
      combatantIdFields: [2, 6],
    },
  },
  Ability: {
    type: '21',
    name: 'Ability',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'ActionEffect',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      source: 3,
      id: 4,
      ability: 5,
      targetId: 6,
      target: 7,
      flags: 8,
      damage: 9,
      targetCurrentHp: 24,
      targetMaxHp: 25,
      targetCurrentMp: 26,
      targetMaxMp: 27,
      // targetCurrentTp: 28,
      // targetMaxTp: 29,
      targetX: 30,
      targetY: 31,
      targetZ: 32,
      targetHeading: 33,
      currentHp: 34,
      maxHp: 35,
      currentMp: 36,
      maxMp: 37,
      // currentTp: 38;
      // maxTp: 39;
      x: 40,
      y: 41,
      z: 42,
      heading: 43,
      sequence: 44,
      targetIndex: 45,
      targetCount: 46,
      ownerId: 47,
      ownerName: 48,
      effectDisplayType: 49,
      actionId: 50,
      actionAnimationId: 51,
      animationLockTime: 52,
      rotationHex: 53,
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3,
      6: 7,
      47: 48,
    },
    blankFields: [6, 47, 48],
    canAnonymize: true,
    // @TODO: Set this back to `undefined` after KR/CN have access to the new fields
    firstOptionalField: 47,
    analysisOptions: {
      include: 'filter',
      filters: { sourceId: '4.{7}' }, // NPC abilities only
      combatantIdFields: [2, 6],
    },
  },
  NetworkAOEAbility: {
    type: '22',
    name: 'NetworkAOEAbility',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'AOEActionEffect',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      source: 3,
      id: 4,
      ability: 5,
      targetId: 6,
      target: 7,
      flags: 8,
      damage: 9,
      targetCurrentHp: 24,
      targetMaxHp: 25,
      targetCurrentMp: 26,
      targetMaxMp: 27,
      // targetCurrentTp: 28,
      // targetMaxTp: 29,
      targetX: 30,
      targetY: 31,
      targetZ: 32,
      targetHeading: 33,
      currentHp: 34,
      maxHp: 35,
      currentMp: 36,
      maxMp: 37,
      // currentTp: 38;
      // maxTp: 39;
      x: 40,
      y: 41,
      z: 42,
      heading: 43,
      sequence: 44,
      targetIndex: 45,
      targetCount: 46,
      ownerId: 47,
      ownerName: 48,
      effectDisplayType: 49,
      actionId: 50,
      actionAnimationId: 51,
      animationLockTime: 52,
      rotationHex: 53,
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3,
      6: 7,
      47: 48,
    },
    blankFields: [6, 47, 48],
    canAnonymize: true,
    // @TODO: Set this back to `undefined` after KR/CN have access to the new fields
    firstOptionalField: 47,
    analysisOptions: {
      include: 'filter',
      filters: { sourceId: '4.{7}' }, // NPC abilities only
      combatantIdFields: [2, 6],
    },
  },
  NetworkCancelAbility: {
    type: '23',
    name: 'NetworkCancelAbility',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'CancelAction',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      source: 3,
      id: 4,
      name: 5,
      reason: 6,
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { sourceId: '4.{7}' }, // NPC combatants only
      combatantIdFields: 2,
    },
  },
  NetworkDoT: {
    type: '24',
    name: 'NetworkDoT',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'DoTHoT',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      which: 4,
      effectId: 5,
      damage: 6,
      currentHp: 7,
      maxHp: 8,
      currentMp: 9,
      maxMp: 10,
      // currentTp: 11,
      // maxTp: 12,
      x: 13,
      y: 14,
      z: 15,
      heading: 16,
      sourceId: 17,
      source: 18,
      // An id number lookup into the AttackType table
      damageType: 19,
      sourceCurrentHp: 20,
      sourceMaxHp: 21,
      sourceCurrentMp: 22,
      sourceMaxMp: 23,
      // sourceCurrentTp: 24,
      // sourceMaxTp: 25,
      sourceX: 26,
      sourceY: 27,
      sourceZ: 28,
      sourceHeading: 29,
    },
    playerIds: {
      2: 3,
      17: 18,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { // DoT on player with valid effectId
        id: '1.{7}',
        which: 'DoT',
        effectId: '0*?[1-9A-F][0-9A-F]*', // non-zero, non-empty, possibly-padded value
      },
      combatantIdFields: [2, 17],
    },
  },
  WasDefeated: {
    type: '25',
    name: 'WasDefeated',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Death',
    fields: {
      type: 0,
      timestamp: 1,
      targetId: 2,
      target: 3,
      sourceId: 4,
      source: 5,
    },
    playerIds: {
      2: 3,
      4: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { targetId: '4.{7}' }, // NPC combatants only
      combatantIdFields: 2, // don't apply to sourceId; an ignored combatant is a valid source
    },
  },
  GainsEffect: {
    type: '26',
    name: 'GainsEffect',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StatusAdd',
    fields: {
      type: 0,
      timestamp: 1,
      effectId: 2,
      effect: 3,
      duration: 4,
      sourceId: 5,
      source: 6,
      targetId: 7,
      target: 8,
      count: 9,
      targetMaxHp: 10,
      sourceMaxHp: 11,
    },
    possibleRsvFields: 3,
    playerIds: {
      5: 6,
      7: 8,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: [
        { // effect from environment/NPC applied to player
          sourceId: '[E4].{7}',
          targetId: '1.{7}',
        },
        { // effect from environment/NPC applied to NPC (including itself)
          sourceId: '[E4].{7}',
          targetId: '4.{7}',
        },
        { // known effectIds of interest
          effectId: ['B9A', '808'],
        },
      ],
      combatantIdFields: [5, 7],
    },
  },
  HeadMarker: {
    type: '27',
    name: 'HeadMarker',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'TargetIcon',
    fields: {
      type: 0,
      timestamp: 1,
      targetId: 2,
      target: 3,
      id: 6,
      data0: 7,
    },
    playerIds: {
      2: 3,
    },
    possiblePlayerIds: [7],
    canAnonymize: true,
    firstOptionalField: 7,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2,
    },
  },
  NetworkRaidMarker: {
    type: '28',
    name: 'NetworkRaidMarker',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'WaymarkMarker',
    fields: {
      type: 0,
      timestamp: 1,
      operation: 2,
      waymark: 3,
      id: 4,
      name: 5,
      x: 6,
      y: 7,
      z: 8,
    },
    playerIds: {
      4: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  NetworkTargetMarker: {
    type: '29',
    name: 'NetworkTargetMarker',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'SignMarker',
    fields: {
      type: 0,
      timestamp: 1,
      operation: 2, // Add, Update, Delete
      waymark: 3,
      id: 4,
      name: 5,
      targetId: 6,
      targetName: 7,
    },
    playerIds: {
      4: 5,
      6: 7,
    },
    firstOptionalField: undefined,
  },
  LosesEffect: {
    type: '30',
    name: 'LosesEffect',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StatusRemove',
    fields: {
      type: 0,
      timestamp: 1,
      effectId: 2,
      effect: 3,
      sourceId: 5,
      source: 6,
      targetId: 7,
      target: 8,
      count: 9,
    },
    possibleRsvFields: 3,
    playerIds: {
      5: 6,
      7: 8,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: [
        { // effect from environment/NPC applied to player
          sourceId: '[E4].{7}',
          targetId: '1.{7}',
        },
        { // effect from environment/NPC applied to NPC (including itself)
          sourceId: '[E4].{7}',
          targetId: '4.{7}',
        },
        { // known effectIds of interest
          effectId: ['B9A', '808'],
        },
      ],
      combatantIdFields: [5, 7],
    },
  },
  NetworkGauge: {
    type: '31',
    name: 'NetworkGauge',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Gauge',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      data0: 3,
      data1: 4,
      data2: 5,
      data3: 6,
    },
    playerIds: {
      2: null,
    },
    // Sometimes this last field looks like a player id.
    // For safety, anonymize all of the gauge data.
    firstUnknownField: 3,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  NetworkWorld: {
    type: '32',
    name: 'NetworkWorld',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'World',
    fields: {
      type: 0,
      timestamp: 1,
    },
    isUnknown: true,
    firstOptionalField: undefined,
  },
  ActorControl: {
    type: '33',
    name: 'ActorControl',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Director',
    fields: {
      type: 0,
      timestamp: 1,
      instance: 2,
      command: 3,
      data0: 4,
      data1: 5,
      data2: 6,
      data3: 7,
    },
    possiblePlayerIds: [4, 5, 6, 7],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  NameToggle: {
    type: '34',
    name: 'NameToggle',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'NameToggle',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      targetId: 4,
      targetName: 5,
      toggle: 6,
    },
    playerIds: {
      2: 3,
      4: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  Tether: {
    type: '35',
    name: 'Tether',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Tether',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      source: 3,
      targetId: 4,
      target: 5,
      id: 8,
    },
    playerIds: {
      2: 3,
      4: 5,
    },
    canAnonymize: true,
    firstUnknownField: 9,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: [2, 4],
    },
  },
  LimitBreak: {
    type: '36',
    name: 'LimitBreak',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'LimitBreak',
    fields: {
      type: 0,
      timestamp: 1,
      valueHex: 2,
      bars: 3,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  NetworkEffectResult: {
    type: '37',
    name: 'NetworkEffectResult',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'EffectResult',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      sequenceId: 4,
      currentHp: 5,
      maxHp: 6,
      currentMp: 7,
      maxMp: 8,
      currentShield: 9,
      // Field index 10 is always `0`
      x: 11,
      y: 12,
      z: 13,
      heading: 14,
    },
    playerIds: {
      2: 3,
    },
    firstUnknownField: 22,
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  StatusEffect: {
    type: '38',
    name: 'StatusEffect',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StatusList',
    fields: {
      type: 0,
      timestamp: 1,
      targetId: 2,
      target: 3,
      jobLevelData: 4,
      hp: 5,
      maxHp: 6,
      mp: 7,
      maxMp: 8,
      currentShield: 9,
      // Field index 10 is always `0`
      x: 11,
      y: 12,
      z: 13,
      heading: 14,
      data0: 15,
      data1: 16,
      data2: 17,
      data3: 18,
      data4: 19,
      data5: 20,
      // Variable number of triplets here, but at least one.
    },
    playerIds: {
      2: 3,
    },
    firstUnknownField: 18,
    canAnonymize: true,
    firstOptionalField: 18,
  },
  NetworkUpdateHP: {
    type: '39',
    name: 'NetworkUpdateHP',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'UpdateHp',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      currentHp: 4,
      maxHp: 5,
      currentMp: 6,
      maxMp: 7,
      // currentTp: 8,
      // maxTp: 9,
      x: 10,
      y: 11,
      z: 12,
      heading: 13,
    },
    playerIds: {
      2: 3,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  Map: {
    type: '40',
    name: 'Map',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'ChangeMap',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      regionName: 3,
      placeName: 4,
      placeNameSub: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    lastInclude: true,
    analysisOptions: {
      include: 'all',
    },
  },
  SystemLogMessage: {
    type: '41',
    name: 'SystemLogMessage',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'SystemLogMessage',
    fields: {
      type: 0,
      timestamp: 1,
      instance: 2,
      id: 3,
      param0: 4,
      param1: 5,
      param2: 6,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
    },
  },
  StatusList3: {
    type: '42',
    name: 'StatusList3',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StatusList3',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      // triplets of fields from here (effectId, data, playerId)?
    },
    playerIds: {
      2: 3,
    },
    canAnonymize: true,
    firstOptionalField: 4,
    firstUnknownField: 4,
  },
  ParserInfo: {
    type: '249',
    name: 'ParserInfo',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Settings',
    fields: {
      type: 0,
      timestamp: 1,
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  ProcessInfo: {
    type: '250',
    name: 'ProcessInfo',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Process',
    fields: {
      type: 0,
      timestamp: 1,
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  Debug: {
    type: '251',
    name: 'Debug',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Debug',
    fields: {
      type: 0,
      timestamp: 1,
    },
    globalInclude: true,
    canAnonymize: false,
    firstOptionalField: undefined,
  },
  PacketDump: {
    type: '252',
    name: 'PacketDump',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'PacketDump',
    fields: {
      type: 0,
      timestamp: 1,
    },
    canAnonymize: false,
    firstOptionalField: undefined,
  },
  Version: {
    type: '253',
    name: 'Version',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Version',
    fields: {
      type: 0,
      timestamp: 1,
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  Error: {
    type: '254',
    name: 'Error',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Error',
    fields: {
      type: 0,
      timestamp: 1,
    },
    canAnonymize: false,
    firstOptionalField: undefined,
  },
  None: {
    type: '[0-9]+',
    name: 'None',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'None',
    fields: {
      type: 0,
      timestamp: 1,
    },
    isUnknown: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  // OverlayPlugin log lines
  LineRegistration: {
    type: '256',
    name: 'LineRegistration',
    source: 'OverlayPlugin',
    messageType: '256',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      source: 3,
      name: 4,
      version: 5,
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  MapEffect: {
    type: '257',
    name: 'MapEffect',
    source: 'OverlayPlugin',
    messageType: '257',
    fields: {
      type: 0,
      timestamp: 1,
      instance: 2,
      flags: 3,
      // values for the location field seem to vary between instances
      // (e.g. a location of '08' in P5S does not appear to be the same location in P5S as in P6S)
      // but this field does appear to consistently contain position info for the effect rendering
      location: 4,
      data0: 5,
      data1: 6,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
    },
  },
  FateDirector: {
    type: '258',
    name: 'FateDirector',
    source: 'OverlayPlugin',
    messageType: '258',
    // fateId and progress are in hex.
    fields: {
      type: 0,
      timestamp: 1,
      category: 2,
      // padding0: 3,
      fateId: 4,
      progress: 5,
      // param3: 6,
      // param4: 7,
      // param5: 8,
      // param6: 9,
      // padding1: 10,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  CEDirector: {
    type: '259',
    name: 'CEDirector',
    source: 'OverlayPlugin',
    messageType: '259',
    // all fields are in hex
    fields: {
      type: 0,
      timestamp: 1,
      popTime: 2,
      timeRemaining: 3,
      // unknown0: 4,
      ceKey: 5,
      numPlayers: 6,
      status: 7,
      // unknown1: 8,
      progress: 9,
      // unknown2: 10,
      // unknown3: 11,
      // unknown4: 12,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  InCombat: {
    type: '260',
    name: 'InCombat',
    source: 'OverlayPlugin',
    messageType: '260',
    fields: {
      type: 0,
      timestamp: 1,
      inACTCombat: 2,
      inGameCombat: 3,
      isACTChanged: 4,
      isGameChanged: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
    },
  },
  CombatantMemory: {
    type: '261',
    name: 'CombatantMemory',
    source: 'OverlayPlugin',
    messageType: '261',
    fields: {
      type: 0,
      timestamp: 1,
      change: 2,
      id: 3,
      // from here, pairs of field name/values
    },
    canAnonymize: true,
    firstOptionalField: 5,
    // doesn't use `playerIds`, as the `id` field must be handled with the 'Name' repeating field
    repeatingFields: {
      startingIndex: 4,
      label: 'pair',
      names: ['key', 'value'],
      sortKeys: true,
      primaryKey: 'key',
      possibleKeys: combatantMemoryKeys,
      keysToAnonymize: {
        // eslint-disable-next-line quote-props
        3: 'Name', // 'ID' repeating field not used? need to use non-repeating `id` (3) field
        'OwnerID': null,
        'TargetID': null,
        'PCTargetID': null,
        'NPCTargetID': null,
        'CastTargetID': null,
      },
    },
    analysisOptions: {
      include: 'filter',
      // TODO: This is an initial attempt to capture field changes that are relevant to analysis,
      // but this will likely need to be refined over time
      filters: [
        { // TODO: ModelStatus can be a little spammy. Should try to refine this further.
          id: '4.{7}',
          change: 'Change',
          pair: [{ key: 'ModelStatus', value: '.*' }],
        },
        {
          id: '4.{7}',
          change: 'Change',
          pair: [{ key: 'WeaponId', value: '.*' }],
        },
        {
          id: '4.{7}',
          change: 'Change',
          pair: [{ key: 'TransformationId', value: '.*' }],
        },
      ],
      combatantIdFields: 3,
    },
  },
  RSVData: {
    type: '262',
    name: 'RSVData',
    source: 'OverlayPlugin',
    messageType: '262',
    fields: {
      type: 0,
      timestamp: 1,
      locale: 2,
      // unknown0: 3,
      key: 4,
      value: 5,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      // RSV substitutions are performed automatically by the filter
      include: 'never',
    },
  },
  StartsUsingExtra: {
    type: '263',
    name: 'StartsUsingExtra',
    source: 'OverlayPlugin',
    messageType: '263',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      id: 3,
      x: 4,
      y: 5,
      z: 6,
      heading: 7,
    },
    playerIds: {
      2: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { sourceId: '4.{7}' }, // NPC casts only
      combatantIdFields: 2,
    },
  },
  AbilityExtra: {
    type: '264',
    name: 'AbilityExtra',
    source: 'OverlayPlugin',
    messageType: '264',
    fields: {
      type: 0,
      timestamp: 1,
      sourceId: 2,
      id: 3,
      globalEffectCounter: 4,
      dataFlag: 5,
      x: 6,
      y: 7,
      z: 8,
      heading: 9,
    },
    blankFields: [6],
    playerIds: {
      2: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  ContentFinderSettings: {
    type: '265',
    name: 'ContentFinderSettings',
    source: 'OverlayPlugin',
    messageType: '265',
    fields: {
      type: 0,
      timestamp: 1,
      zoneId: 2,
      zoneName: 3,
      inContentFinderContent: 4,
      unrestrictedParty: 5,
      minimalItemLevel: 6,
      silenceEcho: 7,
      explorerMode: 8,
      levelSync: 9,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
  },
  NpcYell: {
    type: '266',
    name: 'NpcYell',
    source: 'OverlayPlugin',
    messageType: '266',
    fields: {
      type: 0,
      timestamp: 1,
      npcId: 2,
      npcNameId: 3,
      npcYellId: 4,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2,
    },
  },
  BattleTalk2: {
    type: '267',
    name: 'BattleTalk2',
    source: 'OverlayPlugin',
    messageType: '267',
    fields: {
      type: 0,
      timestamp: 1,
      npcId: 2,
      instance: 3,
      npcNameId: 4,
      instanceContentTextId: 5,
      displayMs: 6,
      // unknown1: 7,
      // unknown2: 8,
      // unknown3: 9,
      // unknown4: 10,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2,
    },
  },
  Countdown: {
    type: '268',
    name: 'Countdown',
    source: 'OverlayPlugin',
    messageType: '268',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      worldId: 3,
      countdownTime: 4,
      result: 5,
      name: 6,
    },
    playerIds: {
      2: 6,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  CountdownCancel: {
    type: '269',
    name: 'CountdownCancel',
    source: 'OverlayPlugin',
    messageType: '269',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      worldId: 3,
      name: 4,
    },
    playerIds: {
      2: 4,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never',
    },
  },
  ActorMove: {
    type: '270',
    name: 'ActorMove',
    source: 'OverlayPlugin',
    messageType: '270',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      heading: 3, // OP calls this 'rotation', but cactbot consistently uses 'heading'
      // unknown1: 4,
      // unknown2: 5,
      x: 6,
      y: 7,
      z: 8,
    },
    playerIds: {
      2: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      // no real way to filter noise, even if (infrequently) used for triggers
      include: 'never',
    },
  },
  ActorSetPos: {
    type: '271',
    name: 'ActorSetPos',
    source: 'OverlayPlugin',
    messageType: '271',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      heading: 3, // OP calls this 'rotation', but cactbot consistently uses 'heading'
      // unknown1: 4,
      // unknown2: 5,
      x: 6,
      y: 7,
      z: 8,
    },
    playerIds: {
      2: null,
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: { id: '4.{7}' }, // NPCs only
      combatantIdFields: 2,
    },
  },
  SpawnNpcExtra: {
    type: '272',
    name: 'SpawnNpcExtra',
    source: 'OverlayPlugin',
    messageType: '272',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      parentId: 3,
      tetherId: 4,
      animationState: 5,
    },
    playerIds: {
      3: null, // `id` is an npc, but parentId could be a tethered player?
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: [2, 3],
    },
  },
  ActorControlExtra: {
    type: '273',
    name: 'ActorControlExtra',
    source: 'OverlayPlugin',
    messageType: '273',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      category: 3,
      param1: 4,
      param2: 5,
      param3: 6,
      param4: 7,
    },
    playerIds: {
      2: null,
    },
    possiblePlayerIds: [4, 5, 6, 7],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2,
    },
  },
  ActorControlSelfExtra: {
    type: '274',
    name: 'ActorControlSelfExtra',
    source: 'OverlayPlugin',
    messageType: '274',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      category: 3,
      param1: 4,
      param2: 5,
      param3: 6,
      param4: 7,
      param5: 8,
      param6: 9,
    },
    playerIds: {
      2: null,
    },
    possiblePlayerIds: [4, 5, 6, 7, 8, 9],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2,
    },
  },
} as const;

export const logDefinitionsVersions = {
  'latest': latestLogDefinitions,
} as const;

// Verify that this has the right type, but export `as const`.
const assertLogDefinitions: LogDefinitionMap = latestLogDefinitions;
console.assert(assertLogDefinitions);

export type LogDefinitions = typeof latestLogDefinitions;
export type LogDefinitionName = keyof LogDefinitions;
export type LogDefinitionType = LogDefinitions[LogDefinitionName]['type'];
export type LogDefinitionMap = { [K in LogDefinitionName]: LogDefinition<K> };
export type LogDefinitionVersions = keyof typeof logDefinitionsVersions;

type RepeatingFieldsNarrowingType = { readonly repeatingFields: unknown };

export type RepeatingFieldsTypes = keyof {
  [
    type in LogDefinitionName as LogDefinitions[type] extends RepeatingFieldsNarrowingType ? type
      : never
  ]: null;
};

export type RepeatingFieldsDefinitions = {
  [type in RepeatingFieldsTypes]: LogDefinitions[type] & {
    readonly repeatingFields: Exclude<LogDefinitions[type]['repeatingFields'], undefined>;
  };
};

export type ParseHelperField<
  Type extends LogDefinitionName,
  Fields extends NetFieldsReverse[Type],
  Field extends keyof Fields,
> = {
  field: Fields[Field] extends string ? Fields[Field] : never;
  value?: string;
  optional?: boolean;
  repeating?: boolean;
  repeatingKeys?: string[];
  sortKeys?: boolean;
  primaryKey?: string;
  possibleKeys?: string[];
};

export type ParseHelperFields<T extends LogDefinitionName> = {
  [field in keyof NetFieldsReverse[T]]: ParseHelperField<T, NetFieldsReverse[T], field>;
};

export default logDefinitionsVersions['latest'];
