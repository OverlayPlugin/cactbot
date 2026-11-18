/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./resources/netlog_defs.ts
// Specifies a fieldName key with one or more possible values and a `canAnonyize` override
// if that field and value are present on the log line. See 'GameLog' for an example.
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
// TODO: Maybe bring in a helper library that can compile-time extract these keys instead?
const combatantMemoryKeys = ['CurrentWorldID', 'WorldID', 'WorldName', 'BNpcID', 'BNpcNameID', 'PartyType', 'ID', 'OwnerID', 'WeaponId', 'Type', 'Job', 'Level', 'Name', 'CurrentHP', 'MaxHP', 'CurrentMP', 'MaxMP', 'PosX', 'PosY', 'PosZ', 'Heading', 'MonsterType', 'Status', 'ModelStatus', 'AggressionStatus', 'TargetID', 'IsTargetable', 'Radius', 'Distance', 'EffectiveDistance', 'NPCTargetID', 'CurrentGP', 'MaxGP', 'CurrentCP', 'MaxCP', 'PCTargetID', 'IsCasting1', 'IsCasting2', 'CastBuffID', 'CastTargetID', 'CastGroundTargetX', 'CastGroundTargetY', 'CastGroundTargetZ', 'CastDurationCurrent', 'CastDurationMax', 'TransformationId'];
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
      line: 4
    },
    subFields: {
      code: {
        '0039': {
          name: 'message',
          canAnonymize: true
        },
        '0038': {
          name: 'echo',
          canAnonymize: true
        },
        '0044': {
          name: 'dialog',
          canAnonymize: true
        },
        '0839': {
          name: 'message',
          canAnonymize: true
        }
      }
    },
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        code: ['0044', '0839']
      }
    }
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
      name: 3
    },
    lastInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all'
    }
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
      name: 3
    },
    playerIds: {
      2: 3
    },
    lastInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined
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
      heading: 20
    },
    playerIds: {
      2: 3,
      6: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        id: '4.{7}'
      },
      // NPC combatants only
      combatantIdFields: 2
    }
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
      heading: 20
    },
    playerIds: {
      2: 3,
      6: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        id: '4.{7}'
      },
      // NPC combatants only
      combatantIdFields: 2
    }
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
      id23: 26
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
      26: null
    },
    firstOptionalField: 3,
    canAnonymize: true,
    lastInclude: true
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
      localContentId: 19
    },
    canAnonymize: true,
    lastInclude: true,
    firstOptionalField: undefined
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
      heading: 12
    },
    possibleRsvFields: 5,
    blankFields: [6],
    playerIds: {
      2: 3,
      6: 7
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC casts only
      combatantIdFields: [2, 6]
    }
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
      rotationHex: 53
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3,
      6: 7,
      47: 48
    },
    blankFields: [6, 47, 48],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC abilities only
      combatantIdFields: [2, 6]
    }
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
      rotationHex: 53
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3,
      6: 7,
      47: 48
    },
    blankFields: [6, 47, 48],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC abilities only
      combatantIdFields: [2, 6]
    }
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
      reason: 6
    },
    possibleRsvFields: 5,
    playerIds: {
      2: 3
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC combatants only
      combatantIdFields: 2
    }
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
      sourceHeading: 29
    },
    playerIds: {
      2: 3,
      17: 18
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        // DoT on player with valid effectId
        id: '1.{7}',
        which: 'DoT',
        effectId: '0*?[1-9A-F][0-9A-F]*' // non-zero, non-empty, possibly-padded value
      },

      combatantIdFields: [2, 17]
    }
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
      source: 5
    },
    playerIds: {
      2: 3,
      4: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        targetId: '4.{7}'
      },
      // NPC combatants only
      combatantIdFields: 2 // don't apply to sourceId; an ignored combatant is a valid source
    }
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
      sourceMaxHp: 11
    },
    possibleRsvFields: 3,
    playerIds: {
      5: 6,
      7: 8
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: [{
        // effect from environment/NPC applied to player
        sourceId: '[E4].{7}',
        targetId: '1.{7}'
      }, {
        // effect from environment/NPC applied to NPC (including itself)
        sourceId: '[E4].{7}',
        targetId: '4.{7}'
      }, {
        // known effectIds of interest
        effectId: ['B9A', '808']
      }],
      combatantIdFields: [5, 7]
    }
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
      data0: 7
    },
    playerIds: {
      2: 3
    },
    possiblePlayerIds: [7],
    canAnonymize: true,
    firstOptionalField: 7,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2
    }
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
      z: 8
    },
    playerIds: {
      4: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined
  },
  NetworkTargetMarker: {
    type: '29',
    name: 'NetworkTargetMarker',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'SignMarker',
    fields: {
      type: 0,
      timestamp: 1,
      operation: 2,
      // Add, Update, Delete
      waymark: 3,
      id: 4,
      name: 5,
      targetId: 6,
      targetName: 7
    },
    playerIds: {
      4: 5,
      6: 7
    },
    firstOptionalField: undefined
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
      count: 9
    },
    possibleRsvFields: 3,
    playerIds: {
      5: 6,
      7: 8
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: [{
        // effect from environment/NPC applied to player
        sourceId: '[E4].{7}',
        targetId: '1.{7}'
      }, {
        // effect from environment/NPC applied to NPC (including itself)
        sourceId: '[E4].{7}',
        targetId: '4.{7}'
      }, {
        // known effectIds of interest
        effectId: ['B9A', '808']
      }],
      combatantIdFields: [5, 7]
    }
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
      data3: 6
    },
    playerIds: {
      2: null
    },
    // Sometimes this last field looks like a player id.
    // For safety, anonymize all of the gauge data.
    firstUnknownField: 3,
    canAnonymize: true,
    firstOptionalField: undefined
  },
  NetworkWorld: {
    type: '32',
    name: 'NetworkWorld',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'World',
    fields: {
      type: 0,
      timestamp: 1
    },
    isUnknown: true,
    firstOptionalField: undefined
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
      data3: 7
    },
    possiblePlayerIds: [4, 5, 6, 7],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      toggle: 6
    },
    playerIds: {
      2: 3,
      4: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      id: 8
    },
    playerIds: {
      2: 3,
      4: 5
    },
    canAnonymize: true,
    firstUnknownField: 9,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: [2, 4]
    }
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
      bars: 3
    },
    canAnonymize: true,
    firstOptionalField: undefined
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
      heading: 14
    },
    playerIds: {
      2: 3
    },
    firstUnknownField: 22,
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      // triplets of fields from here (effectId + otherInfo, duration, sourceId)
      data3: 18,
      data4: 19,
      data5: 20
    },
    playerIds: {
      2: 3
    },
    firstUnknownField: 18,
    canAnonymize: true,
    firstOptionalField: 18
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
      heading: 13
    },
    playerIds: {
      2: 3
    },
    canAnonymize: true,
    firstOptionalField: undefined
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
      placeNameSub: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    lastInclude: true,
    analysisOptions: {
      include: 'all'
    }
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
      param2: 6
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all'
    }
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
      // triplets of fields from here (effectId + otherInfo, duration, sourceId)
      data0: 4,
      data1: 5,
      data2: 6
    },
    playerIds: {
      2: 3
    },
    canAnonymize: true,
    firstOptionalField: 4,
    firstUnknownField: 4
  },
  StatusEffectListForay3: {
    type: '43',
    name: 'StatusEffectListForay3',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'StatusEffectListForay3',
    fields: {
      type: 0,
      timestamp: 1,
      id: 2,
      name: 3,
      jobLevelData: 4,
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
      // triplets of fields from here (effectId + otherInfo, duration, sourceId)
      data0: 15,
      data1: 16,
      data2: 17
    },
    playerIds: {
      2: 3
    },
    canAnonymize: true,
    firstOptionalField: 15,
    firstUnknownField: 15
  },
  ParserInfo: {
    type: '249',
    name: 'ParserInfo',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Settings',
    fields: {
      type: 0,
      timestamp: 1
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined
  },
  ProcessInfo: {
    type: '250',
    name: 'ProcessInfo',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Process',
    fields: {
      type: 0,
      timestamp: 1
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined
  },
  Debug: {
    type: '251',
    name: 'Debug',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Debug',
    fields: {
      type: 0,
      timestamp: 1
    },
    globalInclude: true,
    canAnonymize: false,
    firstOptionalField: undefined
  },
  PacketDump: {
    type: '252',
    name: 'PacketDump',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'PacketDump',
    fields: {
      type: 0,
      timestamp: 1
    },
    canAnonymize: false,
    firstOptionalField: undefined
  },
  Version: {
    type: '253',
    name: 'Version',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Version',
    fields: {
      type: 0,
      timestamp: 1
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined
  },
  Error: {
    type: '254',
    name: 'Error',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'Error',
    fields: {
      type: 0,
      timestamp: 1
    },
    canAnonymize: false,
    firstOptionalField: undefined
  },
  None: {
    type: '[0-9]+',
    name: 'None',
    source: 'FFXIV_ACT_Plugin',
    messageType: 'None',
    fields: {
      type: 0,
      timestamp: 1
    },
    isUnknown: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      version: 5
    },
    globalInclude: true,
    canAnonymize: true,
    firstOptionalField: undefined
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
      data1: 6
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all'
    }
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
      progress: 5
      // param3: 6,
      // param4: 7,
      // param5: 8,
      // param6: 9,
      // padding1: 10,
    },

    canAnonymize: true,
    firstOptionalField: undefined
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
      progress: 9
      // unknown2: 10,
      // unknown3: 11,
      // unknown4: 12,
    },

    canAnonymize: true,
    firstOptionalField: undefined
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
      isGameChanged: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all'
    }
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
      id: 3
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
        3: 'Name',
        // 'ID' repeating field not used? need to use non-repeating `id` (3) field
        'OwnerID': null,
        'TargetID': null,
        'PCTargetID': null,
        'NPCTargetID': null,
        'CastTargetID': null
      }
    },
    analysisOptions: {
      include: 'filter',
      // TODO: This is an initial attempt to capture field changes that are relevant to analysis,
      // but this will likely need to be refined over time
      filters: [{
        // TODO: ModelStatus can be a little spammy. Should try to refine this further.
        id: '4.{7}',
        change: 'Change',
        pair: [{
          key: 'ModelStatus',
          value: '.*'
        }]
      }, {
        id: '4.{7}',
        change: 'Change',
        pair: [{
          key: 'WeaponId',
          value: '.*'
        }]
      }, {
        id: '4.{7}',
        change: 'Change',
        pair: [{
          key: 'TransformationId',
          value: '.*'
        }]
      }],
      combatantIdFields: 3
    }
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
      value: 5
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      // RSV substitutions are performed automatically by the filter
      include: 'never'
    }
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
      heading: 7
    },
    playerIds: {
      2: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC casts only
      combatantIdFields: 2
    }
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
      animationTargetId: 10
    },
    blankFields: [6, 7, 8],
    playerIds: {
      2: null,
      10: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        sourceId: '4.{7}'
      },
      // NPC casts only
      combatantIdFields: [2, 10]
    }
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
      levelSync: 9
    },
    canAnonymize: true,
    firstOptionalField: undefined
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
      npcYellId: 4
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2
    }
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
      displayMs: 6
      // unknown1: 7,
      // unknown2: 8,
      // unknown3: 9,
      // unknown4: 10,
    },

    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2
    }
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
      name: 6
    },
    playerIds: {
      2: 6
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      name: 4
    },
    playerIds: {
      2: 4
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'never'
    }
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
      heading: 3,
      // OP calls this 'rotation', but cactbot consistently uses 'heading'
      // unknown1: 4,
      moveType: 5,
      x: 6,
      y: 7,
      z: 8
    },
    playerIds: {
      2: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      // no real way to filter noise, even if (infrequently) used for triggers
      include: 'never'
    }
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
      heading: 3,
      // OP calls this 'rotation', but cactbot consistently uses 'heading'
      // unknown1: 4,
      // unknown2: 5,
      x: 6,
      y: 7,
      z: 8
    },
    playerIds: {
      2: null
    },
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'filter',
      filters: {
        id: '4.{7}'
      },
      // NPCs only
      combatantIdFields: 2
    }
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
      animationState: 5
    },
    playerIds: {
      3: null // `id` is an npc, but parentId could be a tethered player?
    },

    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: [2, 3]
    }
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
      param4: 7
    },
    playerIds: {
      2: null
    },
    possiblePlayerIds: [4, 5, 6, 7],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2
    }
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
      param6: 9
    },
    playerIds: {
      2: null
    },
    possiblePlayerIds: [4, 5, 6, 7, 8, 9],
    canAnonymize: true,
    firstOptionalField: undefined,
    analysisOptions: {
      include: 'all',
      combatantIdFields: 2
    }
  }
};
const logDefinitionsVersions = {
  'latest': latestLogDefinitions
};

// Verify that this has the right type, but export `as const`.
const assertLogDefinitions = latestLogDefinitions;
console.assert(assertLogDefinitions);
/* harmony default export */ const netlog_defs = (logDefinitionsVersions['latest']);
;// CONCATENATED MODULE: ./resources/not_reached.ts
// Helper Error for TypeScript situations where the programmer thinks they
// know better than TypeScript that some situation will never occur.

// The intention here is that the programmer does not expect a particular
// bit of code to happen, and so has not written careful error handling.
// If it does occur, at least there will be an error and we can figure out why.
// This is preferable to casting or disabling TypeScript altogether in order to
// avoid syntax errors.

// One common example is a regex, where if the regex matches then all of the
// (non-optional) regex groups will also be valid, but TypeScript doesn't know.
class UnreachableCode extends Error {
  constructor() {
    super('This code shouldn\'t be reached');
  }
}
;// CONCATENATED MODULE: ./resources/regexes.ts


const separator = ':';
const matchDefault = '[^:]*';
const matchWithColonsDefault = '(?:[^:]|: )*?';
const fieldsWithPotentialColons = ['effect', 'ability'];
const defaultParams = (type, version, include) => {
  const logType = logDefinitionsVersions[version][type];
  if (include === undefined) {
    include = Object.keys(logType.fields);
    if ('repeatingFields' in logType) {
      include.push(logType.repeatingFields.label);
    }
  }
  const params = {};
  const firstOptionalField = logType.firstOptionalField;
  for (const [prop, index] of Object.entries(logType.fields)) {
    if (!include.includes(prop)) continue;
    const param = {
      field: prop,
      optional: firstOptionalField !== undefined && index >= firstOptionalField
    };
    if (prop === 'type') param.value = logType.type;
    params[index] = param;
  }
  if ('repeatingFields' in logType && include.includes(logType.repeatingFields.label)) {
    params[logType.repeatingFields.startingIndex] = {
      field: logType.repeatingFields.label,
      optional: firstOptionalField !== undefined && logType.repeatingFields.startingIndex >= firstOptionalField,
      repeating: true,
      repeatingKeys: [...logType.repeatingFields.names],
      sortKeys: logType.repeatingFields.sortKeys,
      primaryKey: logType.repeatingFields.primaryKey,
      possibleKeys: [...logType.repeatingFields.possibleKeys]
    };
  }
  return params;
};
const isRepeatingField = (repeating, value) => {
  if (repeating !== true) return false;
  // Allow excluding the field to match for extraction
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  for (const e of value) {
    if (typeof e !== 'object') return false;
  }
  return true;
};
const parseHelper = (params, defKey, fields) => {
  params = params ?? {};
  const validFields = [];
  for (const index in fields) {
    const field = fields[index];
    if (field) validFields.push(field.field);
  }
  Regexes.validateParams(params, defKey, ['capture', ...validFields]);

  // Find the last key we care about, so we can shorten the regex if needed.
  const capture = Regexes.trueIfUndefined(params.capture);
  const fieldKeys = Object.keys(fields).sort((a, b) => parseInt(a) - parseInt(b));
  let maxKeyStr;
  if (capture) {
    const keys = [];
    for (const key in fields) keys.push(key);
    let tmpKey = keys.pop();
    if (tmpKey === undefined) {
      maxKeyStr = fieldKeys[fieldKeys.length - 1] ?? '0';
    } else {
      while (fields[tmpKey]?.optional && !((fields[tmpKey]?.field ?? '') in params)) tmpKey = keys.pop();
      maxKeyStr = tmpKey ?? '0';
    }
  } else {
    maxKeyStr = '0';
    for (const key in fields) {
      const value = fields[key] ?? {};
      if (typeof value !== 'object') continue;
      const fieldName = fields[key]?.field;
      if (fieldName !== undefined && fieldName in params) maxKeyStr = key;
    }
  }
  const maxKey = parseInt(maxKeyStr);

  // Special case for Ability to handle aoe and non-aoe.
  const abilityMessageType = `(?:${netlog_defs.Ability.messageType}|${netlog_defs.NetworkAOEAbility.messageType})`;
  const abilityHexCode = '(?:15|16)';

  // Build the regex from the fields.
  const prefix = defKey !== 'Ability' ? netlog_defs[defKey].messageType : abilityMessageType;

  // Hex codes are a minimum of two characters.  Abilities are special because
  // they need to support both 0x15 and 0x16.
  const typeAsHex = parseInt(netlog_defs[defKey].type).toString(16).toUpperCase();
  const defaultHexCode = typeAsHex.length < 2 ? `00${typeAsHex}`.slice(-2) : typeAsHex;
  const hexCode = defKey !== 'Ability' ? defaultHexCode : abilityHexCode;
  let str = '';
  if (capture) str += `(?<timestamp>\\y{Timestamp}) ${prefix} (?<type>${hexCode})`;else str += `\\y{Timestamp} ${prefix} ${hexCode}`;
  let lastKey = 1;
  for (const keyStr in fields) {
    const parseField = fields[keyStr];
    if (parseField === undefined) continue;
    const fieldName = parseField.field;

    // Regex handles these manually above in the `str` initialization.
    if (fieldName === 'timestamp' || fieldName === 'type') continue;
    const key = parseInt(keyStr);
    // Fill in blanks.
    const missingFields = key - lastKey - 1;
    if (missingFields === 1) str += `${separator}${matchDefault}`;else if (missingFields > 1) str += `(?:${separator}${matchDefault}){${missingFields}}`;
    lastKey = key;
    str += separator;
    if (typeof parseField !== 'object') throw new Error(`${defKey}: invalid value: ${JSON.stringify(parseField)}`);
    const fieldDefault = fieldName !== undefined && fieldsWithPotentialColons.includes(fieldName) ? matchWithColonsDefault : matchDefault;
    const defaultFieldValue = parseField.value?.toString() ?? fieldDefault;
    const fieldValue = params[fieldName];
    if (isRepeatingField(fields[keyStr]?.repeating, fieldValue)) {
      const repeatingFieldsSeparator = '(?:$|:)';
      let repeatingArray = fieldValue;
      const sortKeys = fields[keyStr]?.sortKeys;
      const primaryKey = fields[keyStr]?.primaryKey;
      const possibleKeys = fields[keyStr]?.possibleKeys;

      // primaryKey is required if this is a repeating field per typedef in netlog_defs.ts
      // Same with possibleKeys
      if (primaryKey === undefined || possibleKeys === undefined) throw new UnreachableCode();

      // Allow sorting if needed
      if (sortKeys) {
        // Also sort our valid keys list
        possibleKeys.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));
        if (repeatingArray !== undefined) {
          repeatingArray = [...repeatingArray].sort((left, right) => {
            // We check the validity of left/right because they're user-supplied
            if (typeof left !== 'object' || left[primaryKey] === undefined) {
              console.warn('Invalid argument passed to trigger:', left);
              return 0;
            }
            const leftValue = left[primaryKey];
            if (typeof leftValue !== 'string' || !possibleKeys?.includes(leftValue)) {
              console.warn('Invalid argument passed to trigger:', left);
              return 0;
            }
            if (typeof right !== 'object' || right[primaryKey] === undefined) {
              console.warn('Invalid argument passed to trigger:', right);
              return 0;
            }
            const rightValue = right[primaryKey];
            if (typeof rightValue !== 'string' || !possibleKeys?.includes(rightValue)) {
              console.warn('Invalid argument passed to trigger:', right);
              return 0;
            }
            return leftValue.toLowerCase().localeCompare(rightValue.toLowerCase());
          });
        }
      }
      const anonReps = repeatingArray;
      // Loop over our possible keys
      // Build a regex that can match any possible key with required values substituted in
      possibleKeys.forEach(possibleKey => {
        const rep = anonReps?.find(rep => primaryKey in rep && rep[primaryKey] === possibleKey);
        let fieldRegex = '';
        // Rather than looping over the keys defined on the object,
        // loop over the base type def's keys. This enforces the correct order.
        fields[keyStr]?.repeatingKeys?.forEach(key => {
          let val = rep?.[key];
          if (rep === undefined || !(key in rep)) {
            // If we don't have a value for this key
            // insert a placeholder, unless it's the primary key
            if (key === primaryKey) val = possibleKey;else val = matchDefault;
          }
          if (typeof val !== 'string') {
            if (!Array.isArray(val)) val = matchDefault;else if (val.length < 1) val = matchDefault;else if (val.some(v => typeof v !== 'string')) val = matchDefault;
          }
          fieldRegex += Regexes.maybeCapture(key === primaryKey ? false : capture,
          // All capturing groups are `fieldName` + `possibleKey`, e.g. `pairIsCasting1`
          fieldName + possibleKey, val, defaultFieldValue) + repeatingFieldsSeparator;
        });
        if (fieldRegex.length > 0) {
          str += `(?:${fieldRegex})${rep !== undefined ? '' : '?'}`;
        }
      });
    } else if (fields[keyStr]?.repeating) {
      // If this is a repeating field but the actual value is empty or otherwise invalid,
      // don't process further. We can't use `continue` in the above block because that
      // would skip the early-out break at the end of the loop.
    } else {
      if (fieldName !== undefined) {
        str += Regexes.maybeCapture(
        // more accurate type instead of `as` cast
        // maybe this function needs a refactoring
        capture, fieldName, fieldValue, defaultFieldValue);
      } else {
        // FIXME: handle lint error here
        // ref: https://github.com/OverlayPlugin/cactbot/pull/274#discussion_r1692439720
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        str += fieldValue;
      }
    }

    // Stop if we're not capturing and don't care about future fields.
    if (key >= maxKey) break;
  }
  str += '(?:$|:)';
  return Regexes.parse(str);
};
const buildRegex = (type, params) => {
  return parseHelper(params, type, defaultParams(type, Regexes.logVersion));
};
class Regexes {
  static logVersion = 'latest';

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-20-0x14-networkstartscasting
   */
  static startsUsing(params) {
    return buildRegex('StartsUsing', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-21-0x15-networkability
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-22-0x16-networkaoeability
   */
  static ability(params) {
    return buildRegex('Ability', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-21-0x15-networkability
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-22-0x16-networkaoeability
   *
   * @deprecated Use `ability` instead
   */
  static abilityFull(params) {
    return this.ability(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-27-0x1b-networktargeticon-head-marker
   */
  static headMarker(params) {
    return buildRegex('HeadMarker', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-03-0x03-addcombatant
   */
  static addedCombatant(params) {
    return buildRegex('AddedCombatant', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-03-0x03-addcombatant
   */
  static addedCombatantFull(params) {
    return this.addedCombatant(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-04-0x04-removecombatant
   */
  static removingCombatant(params) {
    return buildRegex('RemovedCombatant', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-26-0x1a-networkbuff
   */
  static gainsEffect(params) {
    return buildRegex('GainsEffect', params);
  }

  /**
   * Prefer gainsEffect over this function unless you really need extra data.
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-38-0x26-networkstatuseffects
   */
  static statusEffectExplicit(params) {
    return buildRegex('StatusEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-30-0x1e-networkbuffremove
   */
  static losesEffect(params) {
    return buildRegex('LosesEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-35-0x23-networktether
   */
  static tether(params) {
    return buildRegex('Tether', params);
  }

  /**
   * 'target' was defeated by 'source'
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-25-0x19-networkdeath
   */
  static wasDefeated(params) {
    return buildRegex('WasDefeated', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-24-0x18-networkdot
   */
  static networkDoT(params) {
    return buildRegex('NetworkDoT', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static echo(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'echo', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    params.code = '0038';
    return Regexes.gameLog(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static dialog(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'dialog', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    params.code = '0044';
    return Regexes.gameLog(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static message(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'message', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    params.code = '0839';
    return Regexes.gameLog(params);
  }

  /**
   * fields: code, name, line, capture
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static gameLog(params) {
    return buildRegex('GameLog', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static gameNameLog(params) {
    // Backwards compatability.
    return Regexes.gameLog(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-12-0x0c-playerstats
   */
  static statChange(params) {
    return buildRegex('PlayerStats', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-01-0x01-changezone
   */
  static changeZone(params) {
    return buildRegex('ChangeZone', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-33-0x21-network6d-actor-control
   */
  static network6d(params) {
    return buildRegex('ActorControl', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-34-0x22-networknametoggle
   */
  static nameToggle(params) {
    return buildRegex('NameToggle', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-40-0x28-map
   */
  static map(params) {
    return buildRegex('Map', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-41-0x29-systemlogmessage
   */
  static systemLogMessage(params) {
    return buildRegex('SystemLogMessage', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-257-0x101-mapeffect
   */
  static mapEffect(params) {
    return buildRegex('MapEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-258-0x102-fatedirector
   */
  static fateDirector(params) {
    return buildRegex('FateDirector', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-259-0x103-cedirector
   */
  static ceDirector(params) {
    return buildRegex('CEDirector', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-260-0x104-incombat
   */
  static inCombat(params) {
    return buildRegex('InCombat', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-261-0x105-combatantmemory
   */
  static combatantMemory(params) {
    return buildRegex('CombatantMemory', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-263-0x107-startsusingextra
   */
  static startsUsingExtra(params) {
    return buildRegex('StartsUsingExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-264-0x108-abilityextra
   */
  static abilityExtra(params) {
    return buildRegex('AbilityExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-265-0x109-contentfindersettings
   */
  static contentFinderSettings(params) {
    return buildRegex('ContentFinderSettings', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-266-0x10a-npcyell
   */
  static npcYell(params) {
    return buildRegex('NpcYell', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-267-0x10b-battletalk2
   */
  static battleTalk2(params) {
    return buildRegex('BattleTalk2', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-268-0x10c-countdown
   */
  static countdown(params) {
    return buildRegex('Countdown', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-269-0x10d-countdowncancel
   */
  static countdownCancel(params) {
    return buildRegex('CountdownCancel', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-270-0x10e-actormove
   */
  static actorMove(params) {
    return buildRegex('ActorMove', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-271-0x10f-actorsetpos
   */
  static actorSetPos(params) {
    return buildRegex('ActorSetPos', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-272-0x110-spawnnpcextra
   */
  static spawnNpcExtra(params) {
    return buildRegex('SpawnNpcExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-273-0x111-actorcontrolextra
   */
  static actorControlExtra(params) {
    return buildRegex('ActorControlExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-274-0x112-actorcontrolselfextra
   */
  static actorControlSelfExtra(params) {
    return buildRegex('ActorControlSelfExtra', params);
  }

  /**
   * Helper function for building named capture group
   */
  static maybeCapture(capture, name, value, defaultValue) {
    if (value === undefined) value = defaultValue ?? matchDefault;
    value = Regexes.anyOf(value);
    return capture ? Regexes.namedCapture(name, value) : value;
  }
  static optional(str) {
    return `(?:${str})?`;
  }

  // Creates a named regex capture group named |name| for the match |value|.
  static namedCapture(name, value) {
    if (name.includes('>')) console.error(`"${name}" contains ">".`);
    if (name.includes('<')) console.error(`"${name}" contains ">".`);
    return `(?<${name}>${value})`;
  }

  /**
   * Convenience for turning multiple args into a unioned regular expression.
   * anyOf(x, y, z) or anyOf([x, y, z]) do the same thing, and return (?:x|y|z).
   * anyOf(x) or anyOf(x) on its own simplifies to just x.
   * args may be strings or RegExp, although any additional markers to RegExp
   * like /insensitive/i are dropped.
   */
  static anyOf(...args) {
    const anyOfArray = array => {
      const [elem] = array;
      if (elem !== undefined && array.length === 1) return `${elem instanceof RegExp ? elem.source : elem}`;
      return `(?:${array.map(elem => elem instanceof RegExp ? elem.source : elem).join('|')})`;
    };
    let array = [];
    const [firstArg] = args;
    if (args.length === 1) {
      if (typeof firstArg === 'string' || firstArg instanceof RegExp) array = [firstArg];else if (Array.isArray(firstArg)) array = firstArg;else array = [];
    } else {
      // TODO: more accurate type instead of `as` cast
      array = args;
    }
    return anyOfArray(array);
  }
  static parse(regexpString) {
    const kCactbotCategories = {
      Timestamp: '^.{14}',
      NetTimestamp: '.{33}',
      NetField: '(?:[^|]*\\|)',
      LogType: '[0-9A-Fa-f]{2}',
      AbilityCode: '[0-9A-Fa-f]{1,8}',
      ObjectId: '[0-9A-F]{8}',
      // Matches any character name (including empty strings which the FFXIV
      // ACT plugin can generate when unknown).
      Name: '(?:[^\\s:|]+(?: [^\\s:|]+)?|)',
      // Floats can have comma as separator in FFXIV plugin output: https://github.com/ravahn/FFXIV_ACT_Plugin/issues/137
      Float: '-?[0-9]+(?:[.,][0-9]+)?(?:E-?[0-9]+)?'
    };

    // All regexes in cactbot are case insensitive.
    // This avoids headaches as things like `Vice and Vanity` turns into
    // `Vice And Vanity`, especially for French and German.  It appears to
    // have a ~20% regex parsing overhead, but at least they work.
    let modifiers = 'i';
    if (regexpString instanceof RegExp) {
      modifiers += (regexpString.global ? 'g' : '') + (regexpString.multiline ? 'm' : '');
      regexpString = regexpString.source;
    }
    regexpString = regexpString.replace(/\\y\{(.*?)\}/g, (match, group) => {
      return kCactbotCategories[group] || match;
    });
    return new RegExp(regexpString, modifiers);
  }

  // Like Regex.Regexes.parse, but force global flag.
  static parseGlobal(regexpString) {
    const regex = Regexes.parse(regexpString);
    let modifiers = 'gi';
    if (regexpString instanceof RegExp) modifiers += regexpString.multiline ? 'm' : '';
    return new RegExp(regex.source, modifiers);
  }
  static trueIfUndefined(value) {
    if (typeof value === 'undefined') return true;
    return !!value;
  }
  static validateParams(f, funcName, params) {
    if (f === null) return;
    if (typeof f !== 'object') return;
    const keys = Object.keys(f);
    for (const key of keys) {
      if (!params.includes(key)) {
        throw new Error(`${funcName}: invalid parameter '${key}'.  ` + `Valid params: ${JSON.stringify(params)}`);
      }
    }
  }
}
;// CONCATENATED MODULE: ./resources/netregexes.ts



const netregexes_separator = '\\|';
const netregexes_matchDefault = '[^|]*';

// If NetRegexes.setFlagTranslationsNeeded is set to true, then any
// regex created that requires a translation will begin with this string
// and match the magicStringRegex.  This is maybe a bit goofy, but is
// a pretty straightforward way to mark regexes for translations.
// If issue #1306 is ever resolved, we can remove this.
const magicTranslationString = `^^`;
const magicStringRegex = /^\^\^/;

// can't simply export this, see https://github.com/OverlayPlugin/cactbot/pull/4957#discussion_r1002590589
const keysThatRequireTranslationAsConst = ['ability', 'name', 'source', 'target', 'line'];
const keysThatRequireTranslation = keysThatRequireTranslationAsConst;
const gameLogCodes = {
  echo: '0038',
  dialog: '0044',
  message: '0839'
};

// See docs/LogGuide.md for more info about these categories
const actorControlType = {
  setAnimState: '003E',
  publicContentText: '0834',
  logMsg: '020F',
  logMsgParams: '0210'
};
const netregexes_defaultParams = (type, version, include) => {
  const logType = logDefinitionsVersions[version][type];
  if (include === undefined) {
    include = Object.keys(logType.fields);
    if ('repeatingFields' in logType) {
      include.push(logType.repeatingFields.label);
    }
  }
  const params = {};
  const firstOptionalField = logType.firstOptionalField;
  for (const [prop, index] of Object.entries(logType.fields)) {
    if (!include.includes(prop)) continue;
    const param = {
      field: prop,
      optional: firstOptionalField !== undefined && index >= firstOptionalField
    };
    if (prop === 'type') param.value = logType.type;
    params[index] = param;
  }
  if ('repeatingFields' in logType && include.includes(logType.repeatingFields.label)) {
    params[logType.repeatingFields.startingIndex] = {
      field: logType.repeatingFields.label,
      optional: firstOptionalField !== undefined && logType.repeatingFields.startingIndex >= firstOptionalField,
      repeating: true,
      repeatingKeys: [...logType.repeatingFields.names],
      sortKeys: logType.repeatingFields.sortKeys,
      primaryKey: logType.repeatingFields.primaryKey,
      possibleKeys: [...logType.repeatingFields.possibleKeys]
    };
  }
  return params;
};
const netregexes_isRepeatingField = (repeating, value) => {
  if (repeating !== true) return false;
  // Allow excluding the field to match for extraction
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  for (const e of value) {
    if (typeof e !== 'object') return false;
  }
  return true;
};
const netregexes_parseHelper = (params, funcName, fields) => {
  params = params ?? {};
  const validFields = [];
  for (const index in fields) {
    const field = fields[index];
    if (field) validFields.push(field.field);
  }
  Regexes.validateParams(params, funcName, ['capture', ...validFields]);

  // Find the last key we care about, so we can shorten the regex if needed.
  const capture = Regexes.trueIfUndefined(params.capture);
  const fieldKeys = Object.keys(fields).sort((a, b) => parseInt(a) - parseInt(b));
  let maxKeyStr;
  if (capture) {
    const keys = [];
    for (const key in fields) keys.push(key);
    let tmpKey = keys.pop();
    if (tmpKey === undefined) {
      maxKeyStr = fieldKeys[fieldKeys.length - 1] ?? '0';
    } else {
      while (fields[tmpKey]?.optional && !((fields[tmpKey]?.field ?? '') in params)) tmpKey = keys.pop();
      maxKeyStr = tmpKey ?? '0';
    }
  } else {
    maxKeyStr = '0';
    for (const key in fields) {
      const value = fields[key] ?? {};
      if (typeof value !== 'object') continue;
      const fieldName = fields[key]?.field;
      if (fieldName !== undefined && fieldName in params) maxKeyStr = key;
    }
  }
  const maxKey = parseInt(maxKeyStr);

  // For testing, it's useful to know if this is a regex that requires
  // translation.  We test this by seeing if there are any specified
  // fields, and if so, inserting a magic string that we can detect.
  // This lets us differentiate between "regex that should be translated"
  // e.g. a regex with `target` specified, and "regex that shouldn't"
  // e.g. a gains effect with just effectId specified.
  const transParams = Object.keys(params).filter(k => keysThatRequireTranslation.includes(k));
  const needsTranslations = NetRegexes.flagTranslationsNeeded && transParams.length > 0;

  // Build the regex from the fields.
  let str = needsTranslations ? magicTranslationString : '^';
  let lastKey = -1;
  for (const keyStr in fields) {
    const key = parseInt(keyStr);
    // Fill in blanks.
    const missingFields = key - lastKey - 1;
    if (missingFields === 1) str += '\\y{NetField}';else if (missingFields > 1) str += `\\y{NetField}{${missingFields}}`;
    lastKey = key;
    const value = fields[keyStr];
    if (typeof value !== 'object') throw new Error(`${funcName}: invalid value: ${JSON.stringify(value)}`);
    const fieldName = value.field;
    const defaultFieldValue = value.value?.toString() ?? netregexes_matchDefault;
    const fieldValue = params[fieldName];
    if (netregexes_isRepeatingField(fields[keyStr]?.repeating, fieldValue)) {
      let repeatingArray = fieldValue;
      const sortKeys = fields[keyStr]?.sortKeys;
      const primaryKey = fields[keyStr]?.primaryKey;
      const possibleKeys = fields[keyStr]?.possibleKeys;

      // primaryKey is required if this is a repeating field per typedef in netlog_defs.ts
      // Same with possibleKeys
      if (primaryKey === undefined || possibleKeys === undefined) throw new UnreachableCode();

      // Allow sorting if needed
      if (sortKeys) {
        // Also sort our valid keys list
        possibleKeys.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));
        if (repeatingArray !== undefined) {
          repeatingArray = [...repeatingArray].sort((left, right) => {
            // We check the validity of left/right because they're user-supplied
            if (typeof left !== 'object' || left[primaryKey] === undefined) {
              console.warn('Invalid argument passed to trigger:', left);
              return 0;
            }
            const leftValue = left[primaryKey];
            if (typeof leftValue !== 'string' || !possibleKeys?.includes(leftValue)) {
              console.warn('Invalid argument passed to trigger:', left);
              return 0;
            }
            if (typeof right !== 'object' || right[primaryKey] === undefined) {
              console.warn('Invalid argument passed to trigger:', right);
              return 0;
            }
            const rightValue = right[primaryKey];
            if (typeof rightValue !== 'string' || !possibleKeys?.includes(rightValue)) {
              console.warn('Invalid argument passed to trigger:', right);
              return 0;
            }
            return leftValue.toLowerCase().localeCompare(rightValue.toLowerCase());
          });
        }
      }
      const anonReps = repeatingArray;
      // Loop over our possible keys
      // Build a regex that can match any possible key with required values substituted in
      possibleKeys.forEach(possibleKey => {
        const rep = anonReps?.find(rep => primaryKey in rep && rep[primaryKey] === possibleKey);
        let fieldRegex = '';
        // Rather than looping over the keys defined on the object,
        // loop over the base type def's keys. This enforces the correct order.
        fields[keyStr]?.repeatingKeys?.forEach(key => {
          let val = rep?.[key];
          if (rep === undefined || !(key in rep)) {
            // If we don't have a value for this key
            // insert a placeholder, unless it's the primary key
            if (key === primaryKey) val = possibleKey;else val = netregexes_matchDefault;
          }
          if (typeof val !== 'string') {
            if (!Array.isArray(val)) val = netregexes_matchDefault;else if (val.length < 1) val = netregexes_matchDefault;else if (val.some(v => typeof v !== 'string')) val = netregexes_matchDefault;
          }
          fieldRegex += Regexes.maybeCapture(key === primaryKey ? false : capture,
          // All capturing groups are `fieldName` + `possibleKey`, e.g. `pairIsCasting1`
          fieldName + possibleKey, val, defaultFieldValue) + netregexes_separator;
        });
        if (fieldRegex.length > 0) {
          str += `(?:${fieldRegex})${rep !== undefined ? '' : '?'}`;
        }
      });
    } else if (fields[keyStr]?.repeating) {
      // If this is a repeating field but the actual value is empty or otherwise invalid,
      // don't process further. We can't use `continue` in the above block because that
      // would skip the early-out break at the end of the loop.
    } else {
      if (fieldName !== undefined) {
        str += Regexes.maybeCapture(
        // more accurate type instead of `as` cast
        // maybe this function needs a refactoring
        capture, fieldName, fieldValue, defaultFieldValue) + netregexes_separator;
      } else {
        str += defaultFieldValue + netregexes_separator;
      }
    }

    // Stop if we're not capturing and don't care about future fields.
    if (key >= maxKey) break;
  }
  return Regexes.parse(str);
};
const netregexes_buildRegex = (type, params) => {
  return netregexes_parseHelper(params, type, netregexes_defaultParams(type, NetRegexes.logVersion));
};
class NetRegexes {
  static logVersion = 'latest';
  static flagTranslationsNeeded = false;
  static setFlagTranslationsNeeded(value) {
    NetRegexes.flagTranslationsNeeded = value;
  }
  static doesNetRegexNeedTranslation(regex) {
    // Need to `setFlagTranslationsNeeded` before calling this function.
    console.assert(NetRegexes.flagTranslationsNeeded);
    const str = typeof regex === 'string' ? regex : regex.source;
    return !!magicStringRegex.exec(str);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-20-0x14-networkstartscasting
   */
  static startsUsing(params) {
    return netregexes_buildRegex('StartsUsing', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-21-0x15-networkability
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-22-0x16-networkaoeability
   */
  static ability(params) {
    return netregexes_parseHelper(params, 'Ability', {
      ...netregexes_defaultParams('Ability', NetRegexes.logVersion),
      // Override type
      0: {
        field: 'type',
        value: '2[12]',
        optional: false
      }
    });
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-21-0x15-networkability
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-22-0x16-networkaoeability
   *
   * @deprecated Use `ability` instead
   */
  static abilityFull(params) {
    return this.ability(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-27-0x1b-networktargeticon-head-marker
   */
  static headMarker(params) {
    return netregexes_buildRegex('HeadMarker', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-03-0x03-addcombatant
   */
  static addedCombatant(params) {
    return netregexes_parseHelper(params, 'AddedCombatant', netregexes_defaultParams('AddedCombatant', NetRegexes.logVersion));
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-03-0x03-addcombatant
   * @deprecated Use `addedCombatant` instead
   */
  static addedCombatantFull(params) {
    return NetRegexes.addedCombatant(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-04-0x04-removecombatant
   */
  static removingCombatant(params) {
    return netregexes_buildRegex('RemovedCombatant', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-26-0x1a-networkbuff
   */
  static gainsEffect(params) {
    return netregexes_buildRegex('GainsEffect', params);
  }

  /**
   * Prefer gainsEffect over this function unless you really need extra data.
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-38-0x26-networkstatuseffects
   */
  static statusEffectExplicit(params) {
    return netregexes_buildRegex('StatusEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-30-0x1e-networkbuffremove
   */
  static losesEffect(params) {
    return netregexes_buildRegex('LosesEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-35-0x23-networktether
   */
  static tether(params) {
    return netregexes_buildRegex('Tether', params);
  }

  /**
   * 'target' was defeated by 'source'
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-25-0x19-networkdeath
   */
  static wasDefeated(params) {
    return netregexes_buildRegex('WasDefeated', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-24-0x18-networkdot
   */
  static networkDoT(params) {
    return netregexes_buildRegex('NetworkDoT', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static echo(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'Echo', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    return NetRegexes.gameLog({
      ...params,
      code: gameLogCodes.echo
    });
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static dialog(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'Dialog', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    return NetRegexes.gameLog({
      ...params,
      code: gameLogCodes.dialog
    });
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static message(params) {
    if (typeof params === 'undefined') params = {};
    Regexes.validateParams(params, 'Message', ['type', 'timestamp', 'code', 'name', 'line', 'capture']);
    return NetRegexes.gameLog({
      ...params,
      code: gameLogCodes.message
    });
  }

  /**
   * fields: code, name, line, capture
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static gameLog(params) {
    return netregexes_buildRegex('GameLog', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-00-0x00-logline
   */
  static gameNameLog(params) {
    // Backwards compatability.
    return NetRegexes.gameLog(params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-12-0x0c-playerstats
   */
  static statChange(params) {
    return netregexes_buildRegex('PlayerStats', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-01-0x01-changezone
   */
  static changeZone(params) {
    return netregexes_buildRegex('ChangeZone', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-33-0x21-network6d-actor-control
   */
  static network6d(params) {
    return netregexes_buildRegex('ActorControl', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-34-0x22-networknametoggle
   */
  static nameToggle(params) {
    return netregexes_buildRegex('NameToggle', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-40-0x28-map
   */
  static map(params) {
    return netregexes_buildRegex('Map', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-41-0x29-systemlogmessage
   */
  static systemLogMessage(params) {
    return netregexes_buildRegex('SystemLogMessage', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-257-0x101-mapeffect
   */
  static mapEffect(params) {
    return netregexes_buildRegex('MapEffect', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-258-0x102-fatedirector
   */
  static fateDirector(params) {
    return netregexes_buildRegex('FateDirector', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-259-0x103-cedirector
   */
  static ceDirector(params) {
    return netregexes_buildRegex('CEDirector', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-260-0x104-incombat
   */
  static inCombat(params) {
    return netregexes_buildRegex('InCombat', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-261-0x105-combatantmemory
   */
  static combatantMemory(params) {
    return netregexes_buildRegex('CombatantMemory', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-262-0x106-rsvdata
   */
  static rsvData(params) {
    return netregexes_buildRegex('RSVData', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-263-0x107-startsusingextra
   */
  static startsUsingExtra(params) {
    return netregexes_buildRegex('StartsUsingExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-264-0x108-abilityextra
   */
  static abilityExtra(params) {
    return netregexes_buildRegex('AbilityExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-265-0x109-contentfindersettings
   */
  static contentFinderSettings(params) {
    return netregexes_buildRegex('ContentFinderSettings', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-266-0x10a-npcyell
   */
  static npcYell(params) {
    return netregexes_buildRegex('NpcYell', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-267-0x10b-battletalk2
   */
  static battleTalk2(params) {
    return netregexes_buildRegex('BattleTalk2', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-268-0x10c-countdown
   */
  static countdown(params) {
    return netregexes_buildRegex('Countdown', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-269-0x10d-countdowncancel
   */
  static countdownCancel(params) {
    return netregexes_buildRegex('CountdownCancel', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-270-0x10e-actormove
   */
  static actorMove(params) {
    return netregexes_buildRegex('ActorMove', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-271-0x10f-actorsetpos
   */
  static actorSetPos(params) {
    return netregexes_buildRegex('ActorSetPos', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-272-0x110-spawnnpcextra
   */
  static spawnNpcExtra(params) {
    return netregexes_buildRegex('SpawnNpcExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-273-0x111-actorcontrolextra
   */
  static actorControlExtra(params) {
    return netregexes_buildRegex('ActorControlExtra', params);
  }

  /**
   * matches: https://github.com/OverlayPlugin/cactbot/blob/main/docs/LogGuide.md#line-274-0x112-actorcontrolselfextra
   */
  static actorControlSelfExtra(params) {
    return netregexes_buildRegex('ActorControlSelfExtra', params);
  }
}
const commonNetRegex = {
  // TODO(6.2): remove 40000010 after everybody is on 6.2.
  // TODO: or maybe keep around for playing old log files??
  wipe: NetRegexes.network6d({
    command: ['40000010', '4000000F']
  }),
  cactbotWipeEcho: NetRegexes.echo({
    line: 'cactbot wipe.*?'
  }),
  userWipeEcho: NetRegexes.echo({
    line: 'end'
  })
};
const buildNetRegexForTrigger = (type, params) => {
  if (type === 'Ability')
    // ts can't narrow T to `Ability` here, need casting.
    return NetRegexes.ability(params);
  return netregexes_buildRegex(type, params);
};
;// CONCATENATED MODULE: ./resources/overlay_plugin_api.ts
// OverlayPlugin API setup

let inited = false;
let wsUrl = null;
let ws = null;
let queue = [];
let rseqCounter = 0;
const responsePromises = {};
const subscribers = {};
const sendMessage = (msg, cb) => {
  if (ws) {
    if (queue) queue.push(msg);else ws.send(JSON.stringify(msg));
  } else {
    if (queue) queue.push([msg, cb]);else window.OverlayPluginApi.callHandler(JSON.stringify(msg), cb);
  }
};
const processEvent = msg => {
  init();
  const subs = subscribers[msg.type];
  subs?.forEach(sub => {
    try {
      sub(msg);
    } catch (e) {
      console.error(e);
    }
  });
};
const dispatchOverlayEvent = processEvent;
const addOverlayListener = (event, cb) => {
  init();
  if (!subscribers[event]) {
    subscribers[event] = [];
    if (!queue) {
      sendMessage({
        call: 'subscribe',
        events: [event]
      });
    }
  }
  subscribers[event]?.push(cb);
};
const removeOverlayListener = (event, cb) => {
  init();
  if (subscribers[event]) {
    const list = subscribers[event];
    const pos = list?.indexOf(cb);
    if (pos !== undefined && pos > -1) list?.splice(pos, 1);
  }
};
const callOverlayHandlerInternal = (_msg
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  init();
  const msg = {
    ..._msg,
    rseq: 0
  };
  let p;
  if (ws) {
    msg.rseq = rseqCounter++;
    p = new Promise((resolve, reject) => {
      responsePromises[msg.rseq] = {
        resolve: resolve,
        reject: reject
      };
    });
    sendMessage(msg);
  } else {
    p = new Promise((resolve, reject) => {
      sendMessage(msg, data => {
        if (data === null) {
          resolve(data);
          return;
        }
        const parsed = JSON.parse(data);
        if (parsed['$error']) reject(parsed);else resolve(parsed);
      });
    });
  }
  return p;
};
const callOverlayHandlerOverrideMap = {};
const callOverlayHandler = (_msg
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  init();

  // If this `as` is incorrect, then it will not find an override.
  // TODO: we could also replace this with a type guard.
  const type = _msg.call;
  const callFunc = callOverlayHandlerOverrideMap[type] ?? callOverlayHandlerInternal;

  // The `IOverlayHandler` type guarantees that parameters/return type match
  // one of the overlay handlers.  The OverrideMap also only stores functions
  // that match by the discriminating `call` field, and so any overrides
  // should be correct here.
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument
  return callFunc(_msg);
};
const setOverlayHandlerOverride = (type, override) => {
  if (!override) {
    delete callOverlayHandlerOverrideMap[type];
    return;
  }
  callOverlayHandlerOverrideMap[type] = override;
};
const init = () => {
  if (inited) return;
  if (typeof window !== 'undefined') {
    wsUrl = new URLSearchParams(window.location.search).get('OVERLAY_WS');
    if (wsUrl !== null) {
      const connectWs = function (wsUrl) {
        ws = new WebSocket(wsUrl);
        ws.addEventListener('error', e => {
          console.error(e);
        });
        ws.addEventListener('open', () => {
          console.log('Connected!');
          const q = queue ?? [];
          queue = null;
          sendMessage({
            call: 'subscribe',
            events: Object.keys(subscribers)
          });
          for (const msg of q) {
            if (!Array.isArray(msg)) sendMessage(msg);
          }
        });
        ws.addEventListener('message', _msg => {
          try {
            if (typeof _msg.data !== 'string') {
              console.error('Invalid message data received: ', _msg);
              return;
            }
            const msg = JSON.parse(_msg.data);
            const promiseFuncs = msg?.rseq !== undefined ? responsePromises[msg.rseq] : undefined;
            if (msg.rseq !== undefined && promiseFuncs) {
              if (msg['$error']) promiseFuncs.reject(msg);else promiseFuncs.resolve(msg);
              delete responsePromises[msg.rseq];
            } else {
              processEvent(msg);
            }
          } catch (e) {
            console.error('Invalid message received: ', _msg);
            return;
          }
        });
        ws.addEventListener('close', () => {
          queue = null;
          console.log('Trying to reconnect...');
          // Don't spam the server with retries.
          window.setTimeout(() => {
            connectWs(wsUrl);
          }, 300);
        });
      };
      connectWs(wsUrl);
    } else {
      const waitForApi = function () {
        if (!window.OverlayPluginApi?.ready) {
          window.setTimeout(waitForApi, 300);
          return;
        }
        const q = queue ?? [];
        queue = null;
        window.__OverlayCallback = processEvent;
        sendMessage({
          call: 'subscribe',
          events: Object.keys(subscribers)
        });
        for (const item of q) {
          if (Array.isArray(item)) sendMessage(item[0], item[1]);
        }
      };
      waitForApi();
    }

    // Here the OverlayPlugin API is registered to the window object,
    // but this is mainly for backwards compatibility. For cactbot's built-in files,
    // it is recommended to use the various functions exported in resources/overlay_plugin_api.ts.

    /* eslint-disable deprecation/deprecation */
    window.addOverlayListener = addOverlayListener;
    window.removeOverlayListener = removeOverlayListener;
    window.callOverlayHandler = callOverlayHandler;
    window.dispatchOverlayEvent = dispatchOverlayEvent;
    /* eslint-enable deprecation/deprecation */
  }

  inited = true;
};
;// CONCATENATED MODULE: ./ui/test/test.ts



addOverlayListener('ChangeZone', e => {
  const currentZone = document.getElementById('currentZone');
  if (currentZone) currentZone.innerText = `currentZone: ${e.zoneName} (${e.zoneID})`;
});
addOverlayListener('onInCombatChangedEvent', e => {
  const inCombat = document.getElementById('inCombat');
  if (inCombat) {
    inCombat.innerText = `inCombat: act: ${e.detail.inACTCombat ? 'yes' : 'no'} game: ${e.detail.inGameCombat ? 'yes' : 'no'}`;
  }
});
addOverlayListener('onPlayerChangedEvent', e => {
  const name = document.getElementById('name');
  if (name) name.innerText = e.detail.name;
  const playerId = document.getElementById('playerId');
  if (playerId) playerId.innerText = e.detail.id.toString(16);
  const hp = document.getElementById('hp');
  if (hp) hp.innerText = `${e.detail.currentHP}/${e.detail.maxHP} (${e.detail.currentShield})`;
  const mp = document.getElementById('mp');
  if (mp) mp.innerText = `${e.detail.currentMP}/${e.detail.maxMP}`;
  const cp = document.getElementById('cp');
  if (cp) cp.innerText = `${e.detail.currentCP}/${e.detail.maxCP}`;
  const gp = document.getElementById('gp');
  if (gp) gp.innerText = `${e.detail.currentGP}/${e.detail.maxGP}`;
  const job = document.getElementById('job');
  if (job) job.innerText = `${e.detail.level} ${e.detail.job}`;
  const debug = document.getElementById('debug');
  if (debug) debug.innerText = e.detail.debugJob;
  const jobInfo = document.getElementById('jobinfo');
  if (jobInfo) {
    const detail = e.detail;
    if (detail.job === 'RDM' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.whiteMana} | ${detail.jobDetail.blackMana} | ${detail.jobDetail.manaStacks}`;
    } else if (detail.job === 'WAR' && detail.jobDetail) {
      jobInfo.innerText = detail.jobDetail.beast.toString();
    } else if (detail.job === 'DRK' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.blood} | ${detail.jobDetail.darksideMilliseconds} | ${detail.jobDetail.darkArts.toString()} | ${detail.jobDetail.livingShadowMilliseconds}`;
    } else if (detail.job === 'GNB' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.cartridges} | ${detail.jobDetail.continuationState}`;
    } else if (detail.job === 'PLD' && detail.jobDetail) {
      jobInfo.innerText = detail.jobDetail.oath.toString();
    } else if (detail.job === 'BRD' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.songName} | ${detail.jobDetail.lastPlayed} | ${detail.jobDetail.songProcs} | ${detail.jobDetail.soulGauge} | ${detail.jobDetail.songMilliseconds} | [${detail.jobDetail.coda.join(', ')}]`;
    } else if (detail.job === 'DNC' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.feathers} | ${detail.jobDetail.esprit} | [${detail.jobDetail.steps.join(', ')}] | ${detail.jobDetail.currentStep}`;
    } else if (detail.job === 'NIN' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.ninkiAmount} | ${detail.jobDetail.kazematoi}`;
    } else if (detail.job === 'DRG' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.bloodMilliseconds} | ${detail.jobDetail.lifeMilliseconds} | ${detail.jobDetail.eyesAmount} | ${detail.jobDetail.firstmindsFocus}`;
    } else if (detail.job === 'BLM' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.umbralStacks} (${detail.jobDetail.umbralMilliseconds}) | ${detail.jobDetail.umbralHearts} | ${detail.jobDetail.polyglot} ${detail.jobDetail.enochian.toString()} (${detail.jobDetail.nextPolyglotMilliseconds}) | ${detail.jobDetail.paradox.toString()} | ${detail.jobDetail.astralSoulStacks}`;
    } else if (detail.job === 'THM' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.umbralStacks} (${detail.jobDetail.umbralMilliseconds})`;
    } else if (detail.job === 'WHM' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.lilyStacks} (${detail.jobDetail.lilyMilliseconds}) | ${detail.jobDetail.bloodlilyStacks}`;
    } else if (detail.job === 'SMN' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.aetherflowStacks} | ${detail.jobDetail.tranceMilliseconds} | ${detail.jobDetail.attunement} | ${detail.jobDetail.attunementMilliseconds} | ${detail.jobDetail.activePrimal ?? '-'} | [${detail.jobDetail.usableArcanum.join(', ')}] | ${detail.jobDetail.nextSummoned} | ${detail.jobDetail.summonStatus.toString()}`;
    } else if (detail.job === 'SCH' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.aetherflowStacks} | ${detail.jobDetail.fairyGauge} | ${detail.jobDetail.fairyStatus} (${detail.jobDetail.fairyMilliseconds})`;
    } else if (detail.job === 'ACN' && detail.jobDetail) {
      jobInfo.innerText = detail.jobDetail.aetherflowStacks.toString();
    } else if (detail.job === 'AST' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.card1} | ${detail.jobDetail.card2} | ${detail.jobDetail.card3} | ${detail.jobDetail.card4} | ${detail.jobDetail.nextdraw}`;
    } else if (detail.job === 'MNK' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.chakraStacks} | ${detail.jobDetail.lunarNadi.toString()} | ${detail.jobDetail.solarNadi.toString()} | [${detail.jobDetail.beastChakra.join(', ')}] | ${detail.jobDetail.opoopoFury} | ${detail.jobDetail.raptorFury} | ${detail.jobDetail.coeurlFury}`;
    } else if (detail.job === 'MCH' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.heat} (${detail.jobDetail.overheatMilliseconds}) | ${detail.jobDetail.battery} (${detail.jobDetail.batteryMilliseconds}) | last: ${detail.jobDetail.lastBatteryAmount} | ${detail.jobDetail.overheatActive.toString()} | ${detail.jobDetail.robotActive.toString()}`;
    } else if (detail.job === 'SAM' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.kenki} | ${detail.jobDetail.meditationStacks}(${detail.jobDetail.setsu.toString()},${detail.jobDetail.getsu.toString()},${detail.jobDetail.ka.toString()})`;
    } else if (detail.job === 'SGE' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.addersgall} (${detail.jobDetail.addersgallMilliseconds}) | ${detail.jobDetail.addersting} | ${detail.jobDetail.eukrasia.toString()}`;
    } else if (detail.job === 'RPR' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.soul} | ${detail.jobDetail.shroud} | ${detail.jobDetail.enshroudMilliseconds} | ${detail.jobDetail.lemureShroud} | ${detail.jobDetail.voidShroud}`;
    } else if (detail.job === 'VPR' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.rattlingCoilStacks} | ${detail.jobDetail.anguineTribute} | ${detail.jobDetail.serpentOffering} | ${detail.jobDetail.advancedCombo} | ${detail.jobDetail.reawakenedTimer}`;
    } else if (detail.job === 'PCT' && detail.jobDetail) {
      jobInfo.innerText = `${detail.jobDetail.paletteGauge} | ${detail.jobDetail.paint} | (${detail.jobDetail.creatureMotif} | ${detail.jobDetail.weaponMotif ? 'Weapon' : 'None'} | ${detail.jobDetail.landscapeMotif ? 'Landscape' : 'None'}) | (${detail.jobDetail.depictions.join('+') || 'None'}) | ${detail.jobDetail.mooglePortrait ? 'Moogle' : detail.jobDetail.madeenPortrait ? 'Madeen' : 'None'}`;
    } else {
      jobInfo.innerText = '';
    }
  }
  const pos = document.getElementById('pos');
  if (pos) {
    pos.innerText = `${e.detail.pos.x.toFixed(2)},${e.detail.pos.y.toFixed(2)},${e.detail.pos.z.toFixed(2)}`;
  }
  const rotation = document.getElementById('rotation');
  if (rotation) rotation.innerText = e.detail.rotation.toString();
});
addOverlayListener('EnmityTargetData', e => {
  const target = document.getElementById('target');
  if (target) target.innerText = e.Target ? e.Target.Name : '--';
  const tid = document.getElementById('tid');
  if (tid) tid.innerText = e.Target ? e.Target.ID.toString(16) : '';
  const tdistance = document.getElementById('tdistance');
  if (tdistance) tdistance.innerText = e.Target ? e.Target.Distance.toString() : '';
});
addOverlayListener('onGameExistsEvent', _e => {
  // console.log("Game exists: " + e.detail.exists);
});
addOverlayListener('onGameActiveChangedEvent', _e => {
  // console.log("Game active: " + e.detail.active);
});
const ttsEchoRegex = NetRegexes.echo({
  line: 'tts:.*?'
});
addOverlayListener('LogLine', e => {
  // Match "/echo tts:<stuff>"
  const line = ttsEchoRegex.exec(e.rawLine)?.groups?.line;
  if (line === undefined) return;
  const colon = line.indexOf(':');
  if (colon === -1) return;
  const text = line.slice(colon);
  if (text !== undefined) {
    void callOverlayHandler({
      call: 'cactbotSay',
      text: text
    });
  }
});
addOverlayListener('onUserFileChanged', e => {
  console.log(`User file ${e.file} changed!`);
});
void callOverlayHandler({
  call: 'cactbotRequestState'
});
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFdBQVcsRUFBRSxXQUFXO0lBQ3hCQyxNQUFNLEVBQUU7TUFDTkosSUFBSSxFQUFFLENBQUM7TUFDUEssU0FBUyxFQUFFLENBQUM7TUFDWm1DLFVBQVUsRUFBRSxDQUFDO01BQ2JDLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRDdDLFNBQVMsRUFBRTtNQUNULENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElB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RUYsS0FBS25KLGtCQUFrQixDQUFDO0VBQUVqQixJQUFJLEVBQUU7QUFBc0IsQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25ldGxvZ19kZWZzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvbm90X3JlYWNoZWQudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9yZWdleGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvbmV0cmVnZXhlcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL292ZXJsYXlfcGx1Z2luX2FwaS50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vdWkvdGVzdC90ZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsdWdpbkNvbWJhdGFudFN0YXRlIH0gZnJvbSAnLi4vdHlwZXMvZXZlbnQnO1xyXG5pbXBvcnQgeyBOZXRGaWVsZHNSZXZlcnNlIH0gZnJvbSAnLi4vdHlwZXMvbmV0X2ZpZWxkcyc7XHJcbmltcG9ydCB7IE5ldFBhcmFtcyB9IGZyb20gJy4uL3R5cGVzL25ldF9wcm9wcyc7XHJcblxyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgLy8gVGhlIGxvZyBsaW5lIGlkLCBhcyBhIGRlY2ltYWwgc3RyaW5nLCBtaW5pbXVtIHR3byBjaGFyYWN0ZXJzLlxyXG4gIHR5cGU6IExvZ0RlZmluaXRpb25zW0tdWyd0eXBlJ107XHJcbiAgLy8gVGhlIGluZm9ybWFsIG5hbWUgb2YgdGhpcyBsb2cgbGluZSAobXVzdCBtYXRjaCB0aGUga2V5IHRoYXQgdGhlIExvZ0RlZmluaXRpb24gaXMgYSB2YWx1ZSBmb3IpLlxyXG4gIG5hbWU6IEs7XHJcbiAgLy8gVGhlIHBsdWdpbiB0aGF0IGdlbmVyYXRlcyB0aGlzIGxvZyBsaW5lLlxyXG4gIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nIHwgJ092ZXJsYXlQbHVnaW4nO1xyXG4gIC8vIFBhcnNlZCBBQ1QgbG9nIGxpbmUgdHlwZS4gIE92ZXJsYXlQbHVnaW4gbGluZXMgdXNlIHRoZSBgdHlwZWAgYXMgYSBzdHJpbmcuXHJcbiAgbWVzc2FnZVR5cGU6IExvZ0RlZmluaXRpb25zW0tdWydtZXNzYWdlVHlwZSddO1xyXG4gIC8vIElmIHRydWUsIGFsd2F5cyBpbmNsdWRlIHRoaXMgbGluZSB3aGVuIHNwbGl0dGluZyBsb2dzIChlLmcuIEZGWElWIHBsdWdpbiB2ZXJzaW9uKS5cclxuICBnbG9iYWxJbmNsdWRlPzogYm9vbGVhbjtcclxuICAvLyBJZiB0cnVlLCBhbHdheXMgaW5jbHVkZSB0aGUgbGFzdCBpbnN0YW5jZSBvZiB0aGlzIGxpbmUgd2hlbiBzcGxpdHRpbmcgbG9ncyAoZS5nLiBDaGFuZ2Vab25lKS5cclxuICBsYXN0SW5jbHVkZT86IGJvb2xlYW47XHJcbiAgLy8gVHJ1ZSBpZiB0aGUgbGluZSBjYW4gYmUgYW5vbnltaXplZCAoaS5lLiByZW1vdmluZyBwbGF5ZXIgaWRzIGFuZCBuYW1lcykuXHJcbiAgY2FuQW5vbnltaXplPzogYm9vbGVhbjtcclxuICAvLyBJZiB0cnVlLCB0aGlzIGxvZyBsaW5lIGhhcyBub3QgYmVlbiBzZWVuIGJlZm9yZSBhbmQgbmVlZHMgbW9yZSBpbmZvcm1hdGlvbi5cclxuICBpc1Vua25vd24/OiBib29sZWFuO1xyXG4gIC8vIEZpZWxkcyBhdCB0aGlzIGluZGV4IGFuZCBiZXlvbmQgYXJlIGNsZWFyZWQsIHdoZW4gYW5vbnltaXppbmcuXHJcbiAgZmlyc3RVbmtub3duRmllbGQ/OiBudW1iZXI7XHJcbiAgLy8gQSBtYXAgb2YgYWxsIG9mIHRoZSBmaWVsZHMsIHVuaXF1ZSBmaWVsZCBuYW1lIHRvIGZpZWxkIGluZGV4LlxyXG4gIGZpZWxkczogTG9nRGVmaW5pdGlvbnNbS11bJ2ZpZWxkcyddO1xyXG4gIC8vIEZpZWxkIGluZGljZXMgdGhhdCAqbWF5KiBjb250YWluIFJTViBwbGFjZWhvbGRlcnMgKGZvciBkZWNvZGluZylcclxuICBwb3NzaWJsZVJzdkZpZWxkcz86IExvZ0RlZkZpZWxkSWR4PEs+IHwgcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxuICAvLyBGaWVsZCBuYW1lcyBhbmQgdmFsdWVzIHRoYXQgY2FuIG92ZXJyaWRlIGBjYW5Bbm9ueW1pemVgLiBTZWUgYExvZ0RlZlN1YkZpZWxkc2AgdHlwZSBiZWxvdy5cclxuICBzdWJGaWVsZHM/OiBMb2dEZWZTdWJGaWVsZHM8Sz47XHJcbiAgLy8gTWFwIG9mIGZpZWxkIGluZGljZXMgdG8gYW5vbnltaXplLCBpbiB0aGUgZm9ybWF0OiBwbGF5ZXJJZDogKG9wdGlvbmFsKSBwbGF5ZXJOYW1lLlxyXG4gIHBsYXllcklkcz86IFBsYXllcklkTWFwPEs+O1xyXG4gIC8vIEEgbGlzdCBvZiBmaWVsZCBpbmRpY2VzIHRoYXQgbWF5IGNvbnRhaW5zIHBsYXllciBpZHMgYW5kLCBpZiBzbywgd2lsbCBiZSBhbm9ueW1pemVkLlxyXG4gIC8vIElmIGFuIGluZGV4IGlzIGxpc3RlZCBoZXJlIGFuZCBpbiBgcGxheWVySWRzYCwgaXQgd2lsbCBiZSB0cmVhdGVkIGFzIGEgcG9zc2libGUgaWQgZmllbGQuXHJcbiAgcG9zc2libGVQbGF5ZXJJZHM/OiByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG4gIC8vIEEgbGlzdCBvZiBmaWVsZCBpbmRpY2VzIHRoYXQgYXJlIG9rIHRvIGJlIGJsYW5rIChvciBoYXZlIGludmFsaWQgaWRzKS5cclxuICBibGFua0ZpZWxkcz86IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbiAgLy8gVGhpcyBmaWVsZCBpbmRleCAoYW5kIGFsbCBhZnRlcikgd2lsbCBiZSB0cmVhdGVkIGFzIG9wdGlvbmFsIHdoZW4gY3JlYXRpbmcgY2FwdHVyaW5nIHJlZ2V4ZXMuXHJcbiAgZmlyc3RPcHRpb25hbEZpZWxkOiBudW1iZXIgfCB1bmRlZmluZWQ7XHJcbiAgLy8gVGhlc2UgZmllbGRzIGFyZSB0cmVhdGVkIGFzIHJlcGVhdGFibGUgZmllbGRzXHJcbiAgcmVwZWF0aW5nRmllbGRzPzoge1xyXG4gICAgc3RhcnRpbmdJbmRleDogbnVtYmVyO1xyXG4gICAgbGFiZWw6IHN0cmluZztcclxuICAgIG5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcclxuICAgIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICAgIHByaW1hcnlLZXk6IHN0cmluZztcclxuICAgIHBvc3NpYmxlS2V5czogcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgICAvLyBSZXBlYXRpbmcgZmllbGRzIHRoYXQgd2lsbCBiZSBhbm9ueW1pemVkIGlmIHByZXNlbnQuIFNhbWUgc3RydWN0dXJlIGFzIGBwbGF5ZXJJZHNgLFxyXG4gICAgLy8gYnV0IHVzZXMgcmVwZWF0aW5nIGZpZWxkIGtleXMgKG5hbWVzKSBpbiBwbGFjZSBvZiBmaWVsZCBpbmRpY2VzLiBIb3dldmVyLCB0aGUgJ2lkJyBmaWVsZFxyXG4gICAgLy8gb2YgYW4gaWQvbmFtZSBwYWlyIGNhbiBiZSBhIGZpeGVkIGZpZWxkIGluZGV4LiBTZWUgYENvbWJhdGFudE1lbW9yeWAgZXhhbXBsZS5cclxuICAgIGtleXNUb0Fub255bWl6ZT86IEsgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IHsgW2lkRmllbGQ6IHN0cmluZyB8IG51bWJlcl06IHN0cmluZyB8IG51bGwgfVxyXG4gICAgICA6IG5ldmVyO1xyXG4gIH07XHJcbiAgLy8gU2VlIGBBbmFseXNpc09wdGlvbnNgIHR5cGUuIE9taXR0aW5nIHRoaXMgcHJvcGVydHkgbWVhbnMgbm8gbG9nIGxpbmVzIHdpbGwgYmUgaW5jbHVkZWQ7XHJcbiAgLy8gaG93ZXZlciwgaWYgcmFpZGJvc3MgdHJpZ2dlcnMgYXJlIGZvdW5kIHVzaW5nIHRoaXMgbGluZSB0eXBlLCBhbiBhdXRvbWF0ZWQgd29ya2Zsb3cgd2lsbFxyXG4gIC8vIGNyZWF0ZSB0aGlzIHByb3BlcnR5IGFuZCBzZXQgYGluY2x1ZGU6ICdhbGwnYC4gVG8gc3VwcHJlc3MgdGhpcywgdXNlIGBpbmNsdWRlOiAnbmV2ZXJgYC5cclxuICBhbmFseXNpc09wdGlvbnM/OiBBbmFseXNpc09wdGlvbnM8Sz47XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBMb2dEZWZGaWVsZElkeDxcclxuICBLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbj4gPSBFeHRyYWN0PExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXVtrZXlvZiBMb2dEZWZpbml0aW9uc1tLXVsnZmllbGRzJ11dLCBudW1iZXI+O1xyXG5cclxudHlwZSBQbGF5ZXJJZE1hcDxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIFtQIGluIExvZ0RlZkZpZWxkSWR4PEs+IGFzIG51bWJlcl0/OiBMb2dEZWZGaWVsZElkeDxLPiB8IG51bGw7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBMb2dEZWZGaWVsZE5hbWU8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IEV4dHJhY3Q8XHJcbiAga2V5b2YgTG9nRGVmaW5pdGlvbnNbS11bJ2ZpZWxkcyddLFxyXG4gIHN0cmluZ1xyXG4+O1xyXG5cclxuLy8gU3BlY2lmaWVzIGEgZmllbGROYW1lIGtleSB3aXRoIG9uZSBvciBtb3JlIHBvc3NpYmxlIHZhbHVlcyBhbmQgYSBgY2FuQW5vbnlpemVgIG92ZXJyaWRlXHJcbi8vIGlmIHRoYXQgZmllbGQgYW5kIHZhbHVlIGFyZSBwcmVzZW50IG9uIHRoZSBsb2cgbGluZS4gU2VlICdHYW1lTG9nJyBmb3IgYW4gZXhhbXBsZS5cclxudHlwZSBMb2dEZWZTdWJGaWVsZHM8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBbUCBpbiBMb2dEZWZGaWVsZE5hbWU8Sz5dPzoge1xyXG4gICAgW2ZpZWxkVmFsdWU6IHN0cmluZ106IHtcclxuICAgICAgbmFtZTogc3RyaW5nO1xyXG4gICAgICBjYW5Bbm9ueW1pemU6IGJvb2xlYW47XHJcbiAgICB9O1xyXG4gIH07XHJcbn07XHJcblxyXG4vLyBPcHRpb25zIGZvciBpbmNsdWRpbmcgdGhlc2UgbGluZXMgaW4gYSBmaWx0ZXJlZCBsb2cgdmlhIHRoZSBsb2cgc3BsaXR0ZXIncyBhbmFseXNpcyBvcHRpb24uXHJcbi8vIGBpbmNsdWRlOmAgc3BlY2lmaWVzIHRoZSBsZXZlbCBvZiBpbmNsdXNpb246XHJcbi8vICAgLSAnYWxsJyB3aWxsIGluY2x1ZGUgYWxsIGxpbmVzIHdpdGggbm8gZmlsdGVyaW5nLlxyXG4vLyAgIC0gJ2ZpbHRlcicgd2lsbCBpbmNsdWRlIG9ubHkgdGhvc2UgbGluZXMgdGhhdCBtYXRjaCBhdCBsZWFzdCBvbmUgb2YgdGhlIHNwZWNpZmllZCBgZmlsdGVyc2AuXHJcbi8vICAgLSAnbmV2ZXInIGlzIGFuIG92ZXJyaWRlOyBqdXN0IGxpa2UgaWYgdGhlIHByb3BlcnR5IHdlcmUgb21pdHRlZCwgbm8gbG9nIGxpbmVzIHdpbGwgYmUgaW5jbHVkZWRcclxuLy8gICAgICBpbiB0aGUgZmlsdGVyOyBob3dldmVyLCBpZiAnbmV2ZXInIGlzIHVzZWQsIHRoZSBhdXRvbWF0ZWQgd29ya2Zsb3cgd2lsbCBub3QgYXR0ZW1wdCB0b1xyXG4vLyAgICAgIGNoYW5nZSBpdCB0byAnYWxsJyB1cG9uIGZpbmRpbmcgYWN0aXZlIHRyaWdnZXJzIHVzaW5nIHRoaXMgbGluZSB0eXBlLlxyXG4vLyBgZmlsdGVyczpgIGNvbnRhaW5zIE5ldHJlZ2V4LXN0eWxlIGZpbHRlciBjcml0ZXJpYS4gTGluZXMgc2F0aXNmeWluZyBhdCBsZWFzdCBvbmUgZmlsdGVyIHdpbGwgYmVcclxuLy8gICBpbmNsdWRlZC4gSWYgYGluY2x1ZGU6YCA9ICdmaWx0ZXInLCBgZmlsdGVyc2AgbXVzdCBiZSBwcmVzZW50OyBvdGhlcndpc2UsIGl0IG11c3QgYmUgb21pdHRlZC5cclxuLy8gYGNvbWJhdGFudElkRmllbGRzOmAgYXJlIGZpZWxkIGluZGljZXMgY29udGFpbmluZyBjb21iYXRhbnRJZHMuIElmIHNwZWNpZmllZCwgdGhlc2UgZmllbGRzXHJcbi8vICAgd2lsbCBiZSBjaGVja2VkIGZvciBpZ25vcmVkIGNvbWJhdGFudHMgKGUuZy4gcGV0cykgZHVyaW5nIGxvZyBmaWx0ZXJpbmcuXHJcbmV4cG9ydCB0eXBlIEFuYWx5c2lzT3B0aW9uczxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIGluY2x1ZGU6ICduZXZlcic7XHJcbiAgZmlsdGVycz86IHVuZGVmaW5lZDtcclxuICBjb21iYXRhbnRJZEZpZWxkcz86IHVuZGVmaW5lZDtcclxufSB8IHtcclxuICBpbmNsdWRlOiAnZmlsdGVyJztcclxuICBmaWx0ZXJzOiBOZXRQYXJhbXNbS10gfCByZWFkb25seSBOZXRQYXJhbXNbS11bXTtcclxuICBjb21iYXRhbnRJZEZpZWxkcz86IExvZ0RlZkZpZWxkSWR4PEs+IHwgcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxufSB8IHtcclxuICBpbmNsdWRlOiAnYWxsJztcclxuICBmaWx0ZXJzPzogdW5kZWZpbmVkO1xyXG4gIGNvbWJhdGFudElkRmllbGRzPzogTG9nRGVmRmllbGRJZHg8Sz4gfCByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG59O1xyXG5cclxuLy8gVE9ETzogTWF5YmUgYnJpbmcgaW4gYSBoZWxwZXIgbGlicmFyeSB0aGF0IGNhbiBjb21waWxlLXRpbWUgZXh0cmFjdCB0aGVzZSBrZXlzIGluc3RlYWQ/XHJcbmNvbnN0IGNvbWJhdGFudE1lbW9yeUtleXM6IHJlYWRvbmx5IChFeHRyYWN0PGtleW9mIFBsdWdpbkNvbWJhdGFudFN0YXRlLCBzdHJpbmc+KVtdID0gW1xyXG4gICdDdXJyZW50V29ybGRJRCcsXHJcbiAgJ1dvcmxkSUQnLFxyXG4gICdXb3JsZE5hbWUnLFxyXG4gICdCTnBjSUQnLFxyXG4gICdCTnBjTmFtZUlEJyxcclxuICAnUGFydHlUeXBlJyxcclxuICAnSUQnLFxyXG4gICdPd25lcklEJyxcclxuICAnV2VhcG9uSWQnLFxyXG4gICdUeXBlJyxcclxuICAnSm9iJyxcclxuICAnTGV2ZWwnLFxyXG4gICdOYW1lJyxcclxuICAnQ3VycmVudEhQJyxcclxuICAnTWF4SFAnLFxyXG4gICdDdXJyZW50TVAnLFxyXG4gICdNYXhNUCcsXHJcbiAgJ1Bvc1gnLFxyXG4gICdQb3NZJyxcclxuICAnUG9zWicsXHJcbiAgJ0hlYWRpbmcnLFxyXG4gICdNb25zdGVyVHlwZScsXHJcbiAgJ1N0YXR1cycsXHJcbiAgJ01vZGVsU3RhdHVzJyxcclxuICAnQWdncmVzc2lvblN0YXR1cycsXHJcbiAgJ1RhcmdldElEJyxcclxuICAnSXNUYXJnZXRhYmxlJyxcclxuICAnUmFkaXVzJyxcclxuICAnRGlzdGFuY2UnLFxyXG4gICdFZmZlY3RpdmVEaXN0YW5jZScsXHJcbiAgJ05QQ1RhcmdldElEJyxcclxuICAnQ3VycmVudEdQJyxcclxuICAnTWF4R1AnLFxyXG4gICdDdXJyZW50Q1AnLFxyXG4gICdNYXhDUCcsXHJcbiAgJ1BDVGFyZ2V0SUQnLFxyXG4gICdJc0Nhc3RpbmcxJyxcclxuICAnSXNDYXN0aW5nMicsXHJcbiAgJ0Nhc3RCdWZmSUQnLFxyXG4gICdDYXN0VGFyZ2V0SUQnLFxyXG4gICdDYXN0R3JvdW5kVGFyZ2V0WCcsXHJcbiAgJ0Nhc3RHcm91bmRUYXJnZXRZJyxcclxuICAnQ2FzdEdyb3VuZFRhcmdldFonLFxyXG4gICdDYXN0RHVyYXRpb25DdXJyZW50JyxcclxuICAnQ2FzdER1cmF0aW9uTWF4JyxcclxuICAnVHJhbnNmb3JtYXRpb25JZCcsXHJcbl0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBsYXRlc3RMb2dEZWZpbml0aW9ucyA9IHtcclxuICBHYW1lTG9nOiB7XHJcbiAgICB0eXBlOiAnMDAnLFxyXG4gICAgbmFtZTogJ0dhbWVMb2cnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0NoYXRMb2cnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgY29kZTogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgbGluZTogNCxcclxuICAgIH0sXHJcbiAgICBzdWJGaWVsZHM6IHtcclxuICAgICAgY29kZToge1xyXG4gICAgICAgICcwMDM5Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ21lc3NhZ2UnLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJzAwMzgnOiB7XHJcbiAgICAgICAgICBuYW1lOiAnZWNobycsXHJcbiAgICAgICAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnMDA0NCc6IHtcclxuICAgICAgICAgIG5hbWU6ICdkaWFsb2cnLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJzA4MzknOiB7XHJcbiAgICAgICAgICBuYW1lOiAnbWVzc2FnZScsXHJcbiAgICAgICAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBjb2RlOiBbJzAwNDQnLCAnMDgzOSddIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ2hhbmdlWm9uZToge1xyXG4gICAgdHlwZTogJzAxJyxcclxuICAgIG5hbWU6ICdDaGFuZ2Vab25lJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdUZXJyaXRvcnknLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICB9LFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDaGFuZ2VkUGxheWVyOiB7XHJcbiAgICB0eXBlOiAnMDInLFxyXG4gICAgbmFtZTogJ0NoYW5nZWRQbGF5ZXInLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0NoYW5nZVByaW1hcnlQbGF5ZXInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIEFkZGVkQ29tYmF0YW50OiB7XHJcbiAgICB0eXBlOiAnMDMnLFxyXG4gICAgbmFtZTogJ0FkZGVkQ29tYmF0YW50JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdBZGRDb21iYXRhbnQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGpvYjogNCxcclxuICAgICAgbGV2ZWw6IDUsXHJcbiAgICAgIG93bmVySWQ6IDYsXHJcbiAgICAgIHdvcmxkSWQ6IDcsXHJcbiAgICAgIHdvcmxkOiA4LFxyXG4gICAgICBucGNOYW1lSWQ6IDksXHJcbiAgICAgIG5wY0Jhc2VJZDogMTAsXHJcbiAgICAgIGN1cnJlbnRIcDogMTEsXHJcbiAgICAgIGhwOiAxMixcclxuICAgICAgY3VycmVudE1wOiAxMyxcclxuICAgICAgbXA6IDE0LFxyXG4gICAgICAvLyBtYXhUcDogMTUsXHJcbiAgICAgIC8vIHRwOiAxNixcclxuICAgICAgeDogMTcsXHJcbiAgICAgIHk6IDE4LFxyXG4gICAgICB6OiAxOSxcclxuICAgICAgaGVhZGluZzogMjAsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgaWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNvbWJhdGFudHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBSZW1vdmVkQ29tYmF0YW50OiB7XHJcbiAgICB0eXBlOiAnMDQnLFxyXG4gICAgbmFtZTogJ1JlbW92ZWRDb21iYXRhbnQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1JlbW92ZUNvbWJhdGFudCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgam9iOiA0LFxyXG4gICAgICBsZXZlbDogNSxcclxuICAgICAgb3duZXI6IDYsXHJcbiAgICAgIHdvcmxkOiA4LFxyXG4gICAgICBucGNOYW1lSWQ6IDksXHJcbiAgICAgIG5wY0Jhc2VJZDogMTAsXHJcbiAgICAgIGN1cnJlbnRIcDogMTEsXHJcbiAgICAgIGhwOiAxMixcclxuICAgICAgY3VycmVudE1wOiAxMyxcclxuICAgICAgbXA6IDE0LFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDE1LFxyXG4gICAgICAvLyBtYXhUcDogMTYsXHJcbiAgICAgIHg6IDE3LFxyXG4gICAgICB5OiAxOCxcclxuICAgICAgejogMTksXHJcbiAgICAgIGhlYWRpbmc6IDIwLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IGlkOiAnNC57N30nIH0sIC8vIE5QQyBjb21iYXRhbnRzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgUGFydHlMaXN0OiB7XHJcbiAgICB0eXBlOiAnMTEnLFxyXG4gICAgbmFtZTogJ1BhcnR5TGlzdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUGFydHlMaXN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHBhcnR5Q291bnQ6IDIsXHJcbiAgICAgIGlkMDogMyxcclxuICAgICAgaWQxOiA0LFxyXG4gICAgICBpZDI6IDUsXHJcbiAgICAgIGlkMzogNixcclxuICAgICAgaWQ0OiA3LFxyXG4gICAgICBpZDU6IDgsXHJcbiAgICAgIGlkNjogOSxcclxuICAgICAgaWQ3OiAxMCxcclxuICAgICAgaWQ4OiAxMSxcclxuICAgICAgaWQ5OiAxMixcclxuICAgICAgaWQxMDogMTMsXHJcbiAgICAgIGlkMTE6IDE0LFxyXG4gICAgICBpZDEyOiAxNSxcclxuICAgICAgaWQxMzogMTYsXHJcbiAgICAgIGlkMTQ6IDE3LFxyXG4gICAgICBpZDE1OiAxOCxcclxuICAgICAgaWQxNjogMTksXHJcbiAgICAgIGlkMTc6IDIwLFxyXG4gICAgICBpZDE4OiAyMSxcclxuICAgICAgaWQxOTogMjIsXHJcbiAgICAgIGlkMjA6IDIzLFxyXG4gICAgICBpZDIxOiAyNCxcclxuICAgICAgaWQyMjogMjUsXHJcbiAgICAgIGlkMjM6IDI2LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAzOiBudWxsLFxyXG4gICAgICA0OiBudWxsLFxyXG4gICAgICA1OiBudWxsLFxyXG4gICAgICA2OiBudWxsLFxyXG4gICAgICA3OiBudWxsLFxyXG4gICAgICA4OiBudWxsLFxyXG4gICAgICA5OiBudWxsLFxyXG4gICAgICAxMDogbnVsbCxcclxuICAgICAgMTE6IG51bGwsXHJcbiAgICAgIDEyOiBudWxsLFxyXG4gICAgICAxMzogbnVsbCxcclxuICAgICAgMTQ6IG51bGwsXHJcbiAgICAgIDE1OiBudWxsLFxyXG4gICAgICAxNjogbnVsbCxcclxuICAgICAgMTc6IG51bGwsXHJcbiAgICAgIDE4OiBudWxsLFxyXG4gICAgICAxOTogbnVsbCxcclxuICAgICAgMjA6IG51bGwsXHJcbiAgICAgIDIxOiBudWxsLFxyXG4gICAgICAyMjogbnVsbCxcclxuICAgICAgMjM6IG51bGwsXHJcbiAgICAgIDI0OiBudWxsLFxyXG4gICAgICAyNTogbnVsbCxcclxuICAgICAgMjY6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiAzLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgfSxcclxuICBQbGF5ZXJTdGF0czoge1xyXG4gICAgdHlwZTogJzEyJyxcclxuICAgIG5hbWU6ICdQbGF5ZXJTdGF0cycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUGxheWVyU3RhdHMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgam9iOiAyLFxyXG4gICAgICBzdHJlbmd0aDogMyxcclxuICAgICAgZGV4dGVyaXR5OiA0LFxyXG4gICAgICB2aXRhbGl0eTogNSxcclxuICAgICAgaW50ZWxsaWdlbmNlOiA2LFxyXG4gICAgICBtaW5kOiA3LFxyXG4gICAgICBwaWV0eTogOCxcclxuICAgICAgYXR0YWNrUG93ZXI6IDksXHJcbiAgICAgIGRpcmVjdEhpdDogMTAsXHJcbiAgICAgIGNyaXRpY2FsSGl0OiAxMSxcclxuICAgICAgYXR0YWNrTWFnaWNQb3RlbmN5OiAxMixcclxuICAgICAgaGVhbE1hZ2ljUG90ZW5jeTogMTMsXHJcbiAgICAgIGRldGVybWluYXRpb246IDE0LFxyXG4gICAgICBza2lsbFNwZWVkOiAxNSxcclxuICAgICAgc3BlbGxTcGVlZDogMTYsXHJcbiAgICAgIHRlbmFjaXR5OiAxOCxcclxuICAgICAgbG9jYWxDb250ZW50SWQ6IDE5LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBTdGFydHNVc2luZzoge1xyXG4gICAgdHlwZTogJzIwJyxcclxuICAgIG5hbWU6ICdTdGFydHNVc2luZycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhcnRzQ2FzdGluZycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgYWJpbGl0eTogNSxcclxuICAgICAgdGFyZ2V0SWQ6IDYsXHJcbiAgICAgIHRhcmdldDogNyxcclxuICAgICAgY2FzdFRpbWU6IDgsXHJcbiAgICAgIHg6IDksXHJcbiAgICAgIHk6IDEwLFxyXG4gICAgICB6OiAxMSxcclxuICAgICAgaGVhZGluZzogMTIsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDUsXHJcbiAgICBibGFua0ZpZWxkczogWzZdLFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IDcsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNhc3RzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCA2XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBBYmlsaXR5OiB7XHJcbiAgICB0eXBlOiAnMjEnLFxyXG4gICAgbmFtZTogJ0FiaWxpdHknLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0FjdGlvbkVmZmVjdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgYWJpbGl0eTogNSxcclxuICAgICAgdGFyZ2V0SWQ6IDYsXHJcbiAgICAgIHRhcmdldDogNyxcclxuICAgICAgZmxhZ3M6IDgsXHJcbiAgICAgIGRhbWFnZTogOSxcclxuICAgICAgdGFyZ2V0Q3VycmVudEhwOiAyNCxcclxuICAgICAgdGFyZ2V0TWF4SHA6IDI1LFxyXG4gICAgICB0YXJnZXRDdXJyZW50TXA6IDI2LFxyXG4gICAgICB0YXJnZXRNYXhNcDogMjcsXHJcbiAgICAgIC8vIHRhcmdldEN1cnJlbnRUcDogMjgsXHJcbiAgICAgIC8vIHRhcmdldE1heFRwOiAyOSxcclxuICAgICAgdGFyZ2V0WDogMzAsXHJcbiAgICAgIHRhcmdldFk6IDMxLFxyXG4gICAgICB0YXJnZXRaOiAzMixcclxuICAgICAgdGFyZ2V0SGVhZGluZzogMzMsXHJcbiAgICAgIGN1cnJlbnRIcDogMzQsXHJcbiAgICAgIG1heEhwOiAzNSxcclxuICAgICAgY3VycmVudE1wOiAzNixcclxuICAgICAgbWF4TXA6IDM3LFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDM4O1xyXG4gICAgICAvLyBtYXhUcDogMzk7XHJcbiAgICAgIHg6IDQwLFxyXG4gICAgICB5OiA0MSxcclxuICAgICAgejogNDIsXHJcbiAgICAgIGhlYWRpbmc6IDQzLFxyXG4gICAgICBzZXF1ZW5jZTogNDQsXHJcbiAgICAgIHRhcmdldEluZGV4OiA0NSxcclxuICAgICAgdGFyZ2V0Q291bnQ6IDQ2LFxyXG4gICAgICBvd25lcklkOiA0NyxcclxuICAgICAgb3duZXJOYW1lOiA0OCxcclxuICAgICAgZWZmZWN0RGlzcGxheVR5cGU6IDQ5LFxyXG4gICAgICBhY3Rpb25JZDogNTAsXHJcbiAgICAgIGFjdGlvbkFuaW1hdGlvbklkOiA1MSxcclxuICAgICAgYW5pbWF0aW9uTG9ja1RpbWU6IDUyLFxyXG4gICAgICByb3RhdGlvbkhleDogNTMsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDUsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogNyxcclxuICAgICAgNDc6IDQ4LFxyXG4gICAgfSxcclxuICAgIGJsYW5rRmllbGRzOiBbNiwgNDcsIDQ4XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBhYmlsaXRpZXMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDZdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtBT0VBYmlsaXR5OiB7XHJcbiAgICB0eXBlOiAnMjInLFxyXG4gICAgbmFtZTogJ05ldHdvcmtBT0VBYmlsaXR5JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdBT0VBY3Rpb25FZmZlY3QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIGFiaWxpdHk6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXQ6IDcsXHJcbiAgICAgIGZsYWdzOiA4LFxyXG4gICAgICBkYW1hZ2U6IDksXHJcbiAgICAgIHRhcmdldEN1cnJlbnRIcDogMjQsXHJcbiAgICAgIHRhcmdldE1heEhwOiAyNSxcclxuICAgICAgdGFyZ2V0Q3VycmVudE1wOiAyNixcclxuICAgICAgdGFyZ2V0TWF4TXA6IDI3LFxyXG4gICAgICAvLyB0YXJnZXRDdXJyZW50VHA6IDI4LFxyXG4gICAgICAvLyB0YXJnZXRNYXhUcDogMjksXHJcbiAgICAgIHRhcmdldFg6IDMwLFxyXG4gICAgICB0YXJnZXRZOiAzMSxcclxuICAgICAgdGFyZ2V0WjogMzIsXHJcbiAgICAgIHRhcmdldEhlYWRpbmc6IDMzLFxyXG4gICAgICBjdXJyZW50SHA6IDM0LFxyXG4gICAgICBtYXhIcDogMzUsXHJcbiAgICAgIGN1cnJlbnRNcDogMzYsXHJcbiAgICAgIG1heE1wOiAzNyxcclxuICAgICAgLy8gY3VycmVudFRwOiAzODtcclxuICAgICAgLy8gbWF4VHA6IDM5O1xyXG4gICAgICB4OiA0MCxcclxuICAgICAgeTogNDEsXHJcbiAgICAgIHo6IDQyLFxyXG4gICAgICBoZWFkaW5nOiA0MyxcclxuICAgICAgc2VxdWVuY2U6IDQ0LFxyXG4gICAgICB0YXJnZXRJbmRleDogNDUsXHJcbiAgICAgIHRhcmdldENvdW50OiA0NixcclxuICAgICAgb3duZXJJZDogNDcsXHJcbiAgICAgIG93bmVyTmFtZTogNDgsXHJcbiAgICAgIGVmZmVjdERpc3BsYXlUeXBlOiA0OSxcclxuICAgICAgYWN0aW9uSWQ6IDUwLFxyXG4gICAgICBhY3Rpb25BbmltYXRpb25JZDogNTEsXHJcbiAgICAgIGFuaW1hdGlvbkxvY2tUaW1lOiA1MixcclxuICAgICAgcm90YXRpb25IZXg6IDUzLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IDcsXHJcbiAgICAgIDQ3OiA0OCxcclxuICAgIH0sXHJcbiAgICBibGFua0ZpZWxkczogWzYsIDQ3LCA0OF0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgYWJpbGl0aWVzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCA2XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrQ2FuY2VsQWJpbGl0eToge1xyXG4gICAgdHlwZTogJzIzJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrQ2FuY2VsQWJpbGl0eScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQ2FuY2VsQWN0aW9uJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBuYW1lOiA1LFxyXG4gICAgICByZWFzb246IDYsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDUsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtEb1Q6IHtcclxuICAgIHR5cGU6ICcyNCcsXHJcbiAgICBuYW1lOiAnTmV0d29ya0RvVCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRG9USG9UJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICB3aGljaDogNCxcclxuICAgICAgZWZmZWN0SWQ6IDUsXHJcbiAgICAgIGRhbWFnZTogNixcclxuICAgICAgY3VycmVudEhwOiA3LFxyXG4gICAgICBtYXhIcDogOCxcclxuICAgICAgY3VycmVudE1wOiA5LFxyXG4gICAgICBtYXhNcDogMTAsXHJcbiAgICAgIC8vIGN1cnJlbnRUcDogMTEsXHJcbiAgICAgIC8vIG1heFRwOiAxMixcclxuICAgICAgeDogMTMsXHJcbiAgICAgIHk6IDE0LFxyXG4gICAgICB6OiAxNSxcclxuICAgICAgaGVhZGluZzogMTYsXHJcbiAgICAgIHNvdXJjZUlkOiAxNyxcclxuICAgICAgc291cmNlOiAxOCxcclxuICAgICAgLy8gQW4gaWQgbnVtYmVyIGxvb2t1cCBpbnRvIHRoZSBBdHRhY2tUeXBlIHRhYmxlXHJcbiAgICAgIGRhbWFnZVR5cGU6IDE5LFxyXG4gICAgICBzb3VyY2VDdXJyZW50SHA6IDIwLFxyXG4gICAgICBzb3VyY2VNYXhIcDogMjEsXHJcbiAgICAgIHNvdXJjZUN1cnJlbnRNcDogMjIsXHJcbiAgICAgIHNvdXJjZU1heE1wOiAyMyxcclxuICAgICAgLy8gc291cmNlQ3VycmVudFRwOiAyNCxcclxuICAgICAgLy8gc291cmNlTWF4VHA6IDI1LFxyXG4gICAgICBzb3VyY2VYOiAyNixcclxuICAgICAgc291cmNlWTogMjcsXHJcbiAgICAgIHNvdXJjZVo6IDI4LFxyXG4gICAgICBzb3VyY2VIZWFkaW5nOiAyOSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgMTc6IDE4LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IC8vIERvVCBvbiBwbGF5ZXIgd2l0aCB2YWxpZCBlZmZlY3RJZFxyXG4gICAgICAgIGlkOiAnMS57N30nLFxyXG4gICAgICAgIHdoaWNoOiAnRG9UJyxcclxuICAgICAgICBlZmZlY3RJZDogJzAqP1sxLTlBLUZdWzAtOUEtRl0qJywgLy8gbm9uLXplcm8sIG5vbi1lbXB0eSwgcG9zc2libHktcGFkZGVkIHZhbHVlXHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgMTddLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFdhc0RlZmVhdGVkOiB7XHJcbiAgICB0eXBlOiAnMjUnLFxyXG4gICAgbmFtZTogJ1dhc0RlZmVhdGVkJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdEZWF0aCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB0YXJnZXRJZDogMixcclxuICAgICAgdGFyZ2V0OiAzLFxyXG4gICAgICBzb3VyY2VJZDogNCxcclxuICAgICAgc291cmNlOiA1LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHRhcmdldElkOiAnNC57N30nIH0sIC8vIE5QQyBjb21iYXRhbnRzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsIC8vIGRvbid0IGFwcGx5IHRvIHNvdXJjZUlkOyBhbiBpZ25vcmVkIGNvbWJhdGFudCBpcyBhIHZhbGlkIHNvdXJjZVxyXG4gICAgfSxcclxuICB9LFxyXG4gIEdhaW5zRWZmZWN0OiB7XHJcbiAgICB0eXBlOiAnMjYnLFxyXG4gICAgbmFtZTogJ0dhaW5zRWZmZWN0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGF0dXNBZGQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgZWZmZWN0SWQ6IDIsXHJcbiAgICAgIGVmZmVjdDogMyxcclxuICAgICAgZHVyYXRpb246IDQsXHJcbiAgICAgIHNvdXJjZUlkOiA1LFxyXG4gICAgICBzb3VyY2U6IDYsXHJcbiAgICAgIHRhcmdldElkOiA3LFxyXG4gICAgICB0YXJnZXQ6IDgsXHJcbiAgICAgIGNvdW50OiA5LFxyXG4gICAgICB0YXJnZXRNYXhIcDogMTAsXHJcbiAgICAgIHNvdXJjZU1heEhwOiAxMSxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogMyxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICA1OiA2LFxyXG4gICAgICA3OiA4LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiBbXHJcbiAgICAgICAgeyAvLyBlZmZlY3QgZnJvbSBlbnZpcm9ubWVudC9OUEMgYXBwbGllZCB0byBwbGF5ZXJcclxuICAgICAgICAgIHNvdXJjZUlkOiAnW0U0XS57N30nLFxyXG4gICAgICAgICAgdGFyZ2V0SWQ6ICcxLns3fScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIGVmZmVjdCBmcm9tIGVudmlyb25tZW50L05QQyBhcHBsaWVkIHRvIE5QQyAoaW5jbHVkaW5nIGl0c2VsZilcclxuICAgICAgICAgIHNvdXJjZUlkOiAnW0U0XS57N30nLFxyXG4gICAgICAgICAgdGFyZ2V0SWQ6ICc0Lns3fScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIGtub3duIGVmZmVjdElkcyBvZiBpbnRlcmVzdFxyXG4gICAgICAgICAgZWZmZWN0SWQ6IFsnQjlBJywgJzgwOCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbNSwgN10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgSGVhZE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI3JyxcclxuICAgIG5hbWU6ICdIZWFkTWFya2VyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdUYXJnZXRJY29uJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHRhcmdldElkOiAyLFxyXG4gICAgICB0YXJnZXQ6IDMsXHJcbiAgICAgIGlkOiA2LFxyXG4gICAgICBkYXRhMDogNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVBsYXllcklkczogWzddLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA3LFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrUmFpZE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI4JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrUmFpZE1hcmtlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnV2F5bWFya01hcmtlcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBvcGVyYXRpb246IDIsXHJcbiAgICAgIHdheW1hcms6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBuYW1lOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTmV0d29ya1RhcmdldE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI5JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrVGFyZ2V0TWFya2VyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTaWduTWFya2VyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG9wZXJhdGlvbjogMiwgLy8gQWRkLCBVcGRhdGUsIERlbGV0ZVxyXG4gICAgICB3YXltYXJrOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgbmFtZTogNSxcclxuICAgICAgdGFyZ2V0SWQ6IDYsXHJcbiAgICAgIHRhcmdldE5hbWU6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDQ6IDUsXHJcbiAgICAgIDY6IDcsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBMb3Nlc0VmZmVjdDoge1xyXG4gICAgdHlwZTogJzMwJyxcclxuICAgIG5hbWU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzUmVtb3ZlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGVmZmVjdElkOiAyLFxyXG4gICAgICBlZmZlY3Q6IDMsXHJcbiAgICAgIHNvdXJjZUlkOiA1LFxyXG4gICAgICBzb3VyY2U6IDYsXHJcbiAgICAgIHRhcmdldElkOiA3LFxyXG4gICAgICB0YXJnZXQ6IDgsXHJcbiAgICAgIGNvdW50OiA5LFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiAzLFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDU6IDYsXHJcbiAgICAgIDc6IDgsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IFtcclxuICAgICAgICB7IC8vIGVmZmVjdCBmcm9tIGVudmlyb25tZW50L05QQyBhcHBsaWVkIHRvIHBsYXllclxyXG4gICAgICAgICAgc291cmNlSWQ6ICdbRTRdLns3fScsXHJcbiAgICAgICAgICB0YXJnZXRJZDogJzEuezd9JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gZWZmZWN0IGZyb20gZW52aXJvbm1lbnQvTlBDIGFwcGxpZWQgdG8gTlBDIChpbmNsdWRpbmcgaXRzZWxmKVxyXG4gICAgICAgICAgc291cmNlSWQ6ICdbRTRdLns3fScsXHJcbiAgICAgICAgICB0YXJnZXRJZDogJzQuezd9JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8ga25vd24gZWZmZWN0SWRzIG9mIGludGVyZXN0XHJcbiAgICAgICAgICBlZmZlY3RJZDogWydCOUEnLCAnODA4J10sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFs1LCA3XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrR2F1Z2U6IHtcclxuICAgIHR5cGU6ICczMScsXHJcbiAgICBuYW1lOiAnTmV0d29ya0dhdWdlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdHYXVnZScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgZGF0YTA6IDMsXHJcbiAgICAgIGRhdGExOiA0LFxyXG4gICAgICBkYXRhMjogNSxcclxuICAgICAgZGF0YTM6IDYsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgLy8gU29tZXRpbWVzIHRoaXMgbGFzdCBmaWVsZCBsb29rcyBsaWtlIGEgcGxheWVyIGlkLlxyXG4gICAgLy8gRm9yIHNhZmV0eSwgYW5vbnltaXplIGFsbCBvZiB0aGUgZ2F1Z2UgZGF0YS5cclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiAzLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBOZXR3b3JrV29ybGQ6IHtcclxuICAgIHR5cGU6ICczMicsXHJcbiAgICBuYW1lOiAnTmV0d29ya1dvcmxkJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdXb3JsZCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGlzVW5rbm93bjogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgQWN0b3JDb250cm9sOiB7XHJcbiAgICB0eXBlOiAnMzMnLFxyXG4gICAgbmFtZTogJ0FjdG9yQ29udHJvbCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRGlyZWN0b3InLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaW5zdGFuY2U6IDIsXHJcbiAgICAgIGNvbW1hbmQ6IDMsXHJcbiAgICAgIGRhdGEwOiA0LFxyXG4gICAgICBkYXRhMTogNSxcclxuICAgICAgZGF0YTI6IDYsXHJcbiAgICAgIGRhdGEzOiA3LFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUGxheWVySWRzOiBbNCwgNSwgNiwgN10sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5hbWVUb2dnbGU6IHtcclxuICAgIHR5cGU6ICczNCcsXHJcbiAgICBuYW1lOiAnTmFtZVRvZ2dsZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnTmFtZVRvZ2dsZScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgdGFyZ2V0SWQ6IDQsXHJcbiAgICAgIHRhcmdldE5hbWU6IDUsXHJcbiAgICAgIHRvZ2dsZTogNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFRldGhlcjoge1xyXG4gICAgdHlwZTogJzM1JyxcclxuICAgIG5hbWU6ICdUZXRoZXInLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1RldGhlcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICB0YXJnZXRJZDogNCxcclxuICAgICAgdGFyZ2V0OiA1LFxyXG4gICAgICBpZDogOCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdFVua25vd25GaWVsZDogOSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDRdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIExpbWl0QnJlYWs6IHtcclxuICAgIHR5cGU6ICczNicsXHJcbiAgICBuYW1lOiAnTGltaXRCcmVhaycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnTGltaXRCcmVhaycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB2YWx1ZUhleDogMixcclxuICAgICAgYmFyczogMyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5ldHdvcmtFZmZlY3RSZXN1bHQ6IHtcclxuICAgIHR5cGU6ICczNycsXHJcbiAgICBuYW1lOiAnTmV0d29ya0VmZmVjdFJlc3VsdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRWZmZWN0UmVzdWx0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBzZXF1ZW5jZUlkOiA0LFxyXG4gICAgICBjdXJyZW50SHA6IDUsXHJcbiAgICAgIG1heEhwOiA2LFxyXG4gICAgICBjdXJyZW50TXA6IDcsXHJcbiAgICAgIG1heE1wOiA4LFxyXG4gICAgICBjdXJyZW50U2hpZWxkOiA5LFxyXG4gICAgICAvLyBGaWVsZCBpbmRleCAxMCBpcyBhbHdheXMgYDBgXHJcbiAgICAgIHg6IDExLFxyXG4gICAgICB5OiAxMixcclxuICAgICAgejogMTMsXHJcbiAgICAgIGhlYWRpbmc6IDE0LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiAyMixcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3RhdHVzRWZmZWN0OiB7XHJcbiAgICB0eXBlOiAnMzgnLFxyXG4gICAgbmFtZTogJ1N0YXR1c0VmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzTGlzdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB0YXJnZXRJZDogMixcclxuICAgICAgdGFyZ2V0OiAzLFxyXG4gICAgICBqb2JMZXZlbERhdGE6IDQsXHJcbiAgICAgIGhwOiA1LFxyXG4gICAgICBtYXhIcDogNixcclxuICAgICAgbXA6IDcsXHJcbiAgICAgIG1heE1wOiA4LFxyXG4gICAgICBjdXJyZW50U2hpZWxkOiA5LFxyXG4gICAgICAvLyBGaWVsZCBpbmRleCAxMCBpcyBhbHdheXMgYDBgXHJcbiAgICAgIHg6IDExLFxyXG4gICAgICB5OiAxMixcclxuICAgICAgejogMTMsXHJcbiAgICAgIGhlYWRpbmc6IDE0LFxyXG4gICAgICBkYXRhMDogMTUsXHJcbiAgICAgIGRhdGExOiAxNixcclxuICAgICAgZGF0YTI6IDE3LFxyXG4gICAgICAvLyB0cmlwbGV0cyBvZiBmaWVsZHMgZnJvbSBoZXJlIChlZmZlY3RJZCArIG90aGVySW5mbywgZHVyYXRpb24sIHNvdXJjZUlkKVxyXG4gICAgICBkYXRhMzogMTgsXHJcbiAgICAgIGRhdGE0OiAxOSxcclxuICAgICAgZGF0YTU6IDIwLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiAxOCxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogMTgsXHJcbiAgfSxcclxuICBOZXR3b3JrVXBkYXRlSFA6IHtcclxuICAgIHR5cGU6ICczOScsXHJcbiAgICBuYW1lOiAnTmV0d29ya1VwZGF0ZUhQJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdVcGRhdGVIcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgY3VycmVudEhwOiA0LFxyXG4gICAgICBtYXhIcDogNSxcclxuICAgICAgY3VycmVudE1wOiA2LFxyXG4gICAgICBtYXhNcDogNyxcclxuICAgICAgLy8gY3VycmVudFRwOiA4LFxyXG4gICAgICAvLyBtYXhUcDogOSxcclxuICAgICAgeDogMTAsXHJcbiAgICAgIHk6IDExLFxyXG4gICAgICB6OiAxMixcclxuICAgICAgaGVhZGluZzogMTMsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBNYXA6IHtcclxuICAgIHR5cGU6ICc0MCcsXHJcbiAgICBuYW1lOiAnTWFwJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGFuZ2VNYXAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHJlZ2lvbk5hbWU6IDMsXHJcbiAgICAgIHBsYWNlTmFtZTogNCxcclxuICAgICAgcGxhY2VOYW1lU3ViOiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3lzdGVtTG9nTWVzc2FnZToge1xyXG4gICAgdHlwZTogJzQxJyxcclxuICAgIG5hbWU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgcGFyYW0wOiA0LFxyXG4gICAgICBwYXJhbTE6IDUsXHJcbiAgICAgIHBhcmFtMjogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGF0dXNMaXN0Mzoge1xyXG4gICAgdHlwZTogJzQyJyxcclxuICAgIG5hbWU6ICdTdGF0dXNMaXN0MycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzTGlzdDMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIC8vIHRyaXBsZXRzIG9mIGZpZWxkcyBmcm9tIGhlcmUgKGVmZmVjdElkICsgb3RoZXJJbmZvLCBkdXJhdGlvbiwgc291cmNlSWQpXHJcbiAgICAgIGRhdGEwOiA0LFxyXG4gICAgICBkYXRhMTogNSxcclxuICAgICAgZGF0YTI6IDYsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA0LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDQsXHJcbiAgfSxcclxuICBTdGF0dXNFZmZlY3RMaXN0Rm9yYXkzOiB7XHJcbiAgICB0eXBlOiAnNDMnLFxyXG4gICAgbmFtZTogJ1N0YXR1c0VmZmVjdExpc3RGb3JheTMnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXR1c0VmZmVjdExpc3RGb3JheTMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGpvYkxldmVsRGF0YTogNCxcclxuICAgICAgY3VycmVudEhwOiA1LFxyXG4gICAgICBtYXhIcDogNixcclxuICAgICAgY3VycmVudE1wOiA3LFxyXG4gICAgICBtYXhNcDogOCxcclxuICAgICAgY3VycmVudFNoaWVsZDogOSxcclxuICAgICAgLy8gRmllbGQgaW5kZXggMTAgaXMgYWx3YXlzIGAwYFxyXG4gICAgICB4OiAxMSxcclxuICAgICAgeTogMTIsXHJcbiAgICAgIHo6IDEzLFxyXG4gICAgICBoZWFkaW5nOiAxNCxcclxuICAgICAgLy8gdHJpcGxldHMgb2YgZmllbGRzIGZyb20gaGVyZSAoZWZmZWN0SWQgKyBvdGhlckluZm8sIGR1cmF0aW9uLCBzb3VyY2VJZClcclxuICAgICAgZGF0YTA6IDE1LFxyXG4gICAgICBkYXRhMTogMTYsXHJcbiAgICAgIGRhdGEyOiAxNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDE1LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDE1LFxyXG4gIH0sXHJcbiAgUGFyc2VySW5mbzoge1xyXG4gICAgdHlwZTogJzI0OScsXHJcbiAgICBuYW1lOiAnUGFyc2VySW5mbycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU2V0dGluZ3MnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBQcm9jZXNzSW5mbzoge1xyXG4gICAgdHlwZTogJzI1MCcsXHJcbiAgICBuYW1lOiAnUHJvY2Vzc0luZm8nLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1Byb2Nlc3MnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBEZWJ1Zzoge1xyXG4gICAgdHlwZTogJzI1MScsXHJcbiAgICBuYW1lOiAnRGVidWcnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0RlYnVnJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgZ2xvYmFsSW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogZmFsc2UsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFBhY2tldER1bXA6IHtcclxuICAgIHR5cGU6ICcyNTInLFxyXG4gICAgbmFtZTogJ1BhY2tldER1bXAnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1BhY2tldER1bXAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IGZhbHNlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBWZXJzaW9uOiB7XHJcbiAgICB0eXBlOiAnMjUzJyxcclxuICAgIG5hbWU6ICdWZXJzaW9uJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdWZXJzaW9uJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgZ2xvYmFsSW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgRXJyb3I6IHtcclxuICAgIHR5cGU6ICcyNTQnLFxyXG4gICAgbmFtZTogJ0Vycm9yJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdFcnJvcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogZmFsc2UsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5vbmU6IHtcclxuICAgIHR5cGU6ICdbMC05XSsnLFxyXG4gICAgbmFtZTogJ05vbmUnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ05vbmUnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBpc1Vua25vd246IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIC8vIE92ZXJsYXlQbHVnaW4gbG9nIGxpbmVzXHJcbiAgTGluZVJlZ2lzdHJhdGlvbjoge1xyXG4gICAgdHlwZTogJzI1NicsXHJcbiAgICBuYW1lOiAnTGluZVJlZ2lzdHJhdGlvbicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU2JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIG5hbWU6IDQsXHJcbiAgICAgIHZlcnNpb246IDUsXHJcbiAgICB9LFxyXG4gICAgZ2xvYmFsSW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTWFwRWZmZWN0OiB7XHJcbiAgICB0eXBlOiAnMjU3JyxcclxuICAgIG5hbWU6ICdNYXBFZmZlY3QnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI1NycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpbnN0YW5jZTogMixcclxuICAgICAgZmxhZ3M6IDMsXHJcbiAgICAgIC8vIHZhbHVlcyBmb3IgdGhlIGxvY2F0aW9uIGZpZWxkIHNlZW0gdG8gdmFyeSBiZXR3ZWVuIGluc3RhbmNlc1xyXG4gICAgICAvLyAoZS5nLiBhIGxvY2F0aW9uIG9mICcwOCcgaW4gUDVTIGRvZXMgbm90IGFwcGVhciB0byBiZSB0aGUgc2FtZSBsb2NhdGlvbiBpbiBQNVMgYXMgaW4gUDZTKVxyXG4gICAgICAvLyBidXQgdGhpcyBmaWVsZCBkb2VzIGFwcGVhciB0byBjb25zaXN0ZW50bHkgY29udGFpbiBwb3NpdGlvbiBpbmZvIGZvciB0aGUgZWZmZWN0IHJlbmRlcmluZ1xyXG4gICAgICBsb2NhdGlvbjogNCxcclxuICAgICAgZGF0YTA6IDUsXHJcbiAgICAgIGRhdGExOiA2LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEZhdGVEaXJlY3Rvcjoge1xyXG4gICAgdHlwZTogJzI1OCcsXHJcbiAgICBuYW1lOiAnRmF0ZURpcmVjdG9yJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNTgnLFxyXG4gICAgLy8gZmF0ZUlkIGFuZCBwcm9ncmVzcyBhcmUgaW4gaGV4LlxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgY2F0ZWdvcnk6IDIsXHJcbiAgICAgIC8vIHBhZGRpbmcwOiAzLFxyXG4gICAgICBmYXRlSWQ6IDQsXHJcbiAgICAgIHByb2dyZXNzOiA1LFxyXG4gICAgICAvLyBwYXJhbTM6IDYsXHJcbiAgICAgIC8vIHBhcmFtNDogNyxcclxuICAgICAgLy8gcGFyYW01OiA4LFxyXG4gICAgICAvLyBwYXJhbTY6IDksXHJcbiAgICAgIC8vIHBhZGRpbmcxOiAxMCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIENFRGlyZWN0b3I6IHtcclxuICAgIHR5cGU6ICcyNTknLFxyXG4gICAgbmFtZTogJ0NFRGlyZWN0b3InLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI1OScsXHJcbiAgICAvLyBhbGwgZmllbGRzIGFyZSBpbiBoZXhcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHBvcFRpbWU6IDIsXHJcbiAgICAgIHRpbWVSZW1haW5pbmc6IDMsXHJcbiAgICAgIC8vIHVua25vd24wOiA0LFxyXG4gICAgICBjZUtleTogNSxcclxuICAgICAgbnVtUGxheWVyczogNixcclxuICAgICAgc3RhdHVzOiA3LFxyXG4gICAgICAvLyB1bmtub3duMTogOCxcclxuICAgICAgcHJvZ3Jlc3M6IDksXHJcbiAgICAgIC8vIHVua25vd24yOiAxMCxcclxuICAgICAgLy8gdW5rbm93bjM6IDExLFxyXG4gICAgICAvLyB1bmtub3duNDogMTIsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBJbkNvbWJhdDoge1xyXG4gICAgdHlwZTogJzI2MCcsXHJcbiAgICBuYW1lOiAnSW5Db21iYXQnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2MCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpbkFDVENvbWJhdDogMixcclxuICAgICAgaW5HYW1lQ29tYmF0OiAzLFxyXG4gICAgICBpc0FDVENoYW5nZWQ6IDQsXHJcbiAgICAgIGlzR2FtZUNoYW5nZWQ6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ29tYmF0YW50TWVtb3J5OiB7XHJcbiAgICB0eXBlOiAnMjYxJyxcclxuICAgIG5hbWU6ICdDb21iYXRhbnRNZW1vcnknLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2MScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBjaGFuZ2U6IDIsXHJcbiAgICAgIGlkOiAzLFxyXG4gICAgICAvLyBmcm9tIGhlcmUsIHBhaXJzIG9mIGZpZWxkIG5hbWUvdmFsdWVzXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA1LFxyXG4gICAgLy8gZG9lc24ndCB1c2UgYHBsYXllcklkc2AsIGFzIHRoZSBgaWRgIGZpZWxkIG11c3QgYmUgaGFuZGxlZCB3aXRoIHRoZSAnTmFtZScgcmVwZWF0aW5nIGZpZWxkXHJcbiAgICByZXBlYXRpbmdGaWVsZHM6IHtcclxuICAgICAgc3RhcnRpbmdJbmRleDogNCxcclxuICAgICAgbGFiZWw6ICdwYWlyJyxcclxuICAgICAgbmFtZXM6IFsna2V5JywgJ3ZhbHVlJ10sXHJcbiAgICAgIHNvcnRLZXlzOiB0cnVlLFxyXG4gICAgICBwcmltYXJ5S2V5OiAna2V5JyxcclxuICAgICAgcG9zc2libGVLZXlzOiBjb21iYXRhbnRNZW1vcnlLZXlzLFxyXG4gICAgICBrZXlzVG9Bbm9ueW1pemU6IHtcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcXVvdGUtcHJvcHNcclxuICAgICAgICAzOiAnTmFtZScsIC8vICdJRCcgcmVwZWF0aW5nIGZpZWxkIG5vdCB1c2VkPyBuZWVkIHRvIHVzZSBub24tcmVwZWF0aW5nIGBpZGAgKDMpIGZpZWxkXHJcbiAgICAgICAgJ093bmVySUQnOiBudWxsLFxyXG4gICAgICAgICdUYXJnZXRJRCc6IG51bGwsXHJcbiAgICAgICAgJ1BDVGFyZ2V0SUQnOiBudWxsLFxyXG4gICAgICAgICdOUENUYXJnZXRJRCc6IG51bGwsXHJcbiAgICAgICAgJ0Nhc3RUYXJnZXRJRCc6IG51bGwsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICAvLyBUT0RPOiBUaGlzIGlzIGFuIGluaXRpYWwgYXR0ZW1wdCB0byBjYXB0dXJlIGZpZWxkIGNoYW5nZXMgdGhhdCBhcmUgcmVsZXZhbnQgdG8gYW5hbHlzaXMsXHJcbiAgICAgIC8vIGJ1dCB0aGlzIHdpbGwgbGlrZWx5IG5lZWQgdG8gYmUgcmVmaW5lZCBvdmVyIHRpbWVcclxuICAgICAgZmlsdGVyczogW1xyXG4gICAgICAgIHsgLy8gVE9ETzogTW9kZWxTdGF0dXMgY2FuIGJlIGEgbGl0dGxlIHNwYW1teS4gU2hvdWxkIHRyeSB0byByZWZpbmUgdGhpcyBmdXJ0aGVyLlxyXG4gICAgICAgICAgaWQ6ICc0Lns3fScsXHJcbiAgICAgICAgICBjaGFuZ2U6ICdDaGFuZ2UnLFxyXG4gICAgICAgICAgcGFpcjogW3sga2V5OiAnTW9kZWxTdGF0dXMnLCB2YWx1ZTogJy4qJyB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnNC57N30nLFxyXG4gICAgICAgICAgY2hhbmdlOiAnQ2hhbmdlJyxcclxuICAgICAgICAgIHBhaXI6IFt7IGtleTogJ1dlYXBvbklkJywgdmFsdWU6ICcuKicgfV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJzQuezd9JyxcclxuICAgICAgICAgIGNoYW5nZTogJ0NoYW5nZScsXHJcbiAgICAgICAgICBwYWlyOiBbeyBrZXk6ICdUcmFuc2Zvcm1hdGlvbklkJywgdmFsdWU6ICcuKicgfV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDMsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgUlNWRGF0YToge1xyXG4gICAgdHlwZTogJzI2MicsXHJcbiAgICBuYW1lOiAnUlNWRGF0YScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGxvY2FsZTogMixcclxuICAgICAgLy8gdW5rbm93bjA6IDMsXHJcbiAgICAgIGtleTogNCxcclxuICAgICAgdmFsdWU6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgLy8gUlNWIHN1YnN0aXR1dGlvbnMgYXJlIHBlcmZvcm1lZCBhdXRvbWF0aWNhbGx5IGJ5IHRoZSBmaWx0ZXJcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGFydHNVc2luZ0V4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjYzJyxcclxuICAgIG5hbWU6ICdTdGFydHNVc2luZ0V4dHJhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIGlkOiAzLFxyXG4gICAgICB4OiA0LFxyXG4gICAgICB5OiA1LFxyXG4gICAgICB6OiA2LFxyXG4gICAgICBoZWFkaW5nOiA3LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBjYXN0cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFiaWxpdHlFeHRyYToge1xyXG4gICAgdHlwZTogJzI2NCcsXHJcbiAgICBuYW1lOiAnQWJpbGl0eUV4dHJhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIGlkOiAzLFxyXG4gICAgICBnbG9iYWxFZmZlY3RDb3VudGVyOiA0LFxyXG4gICAgICBkYXRhRmxhZzogNSxcclxuICAgICAgeDogNixcclxuICAgICAgeTogNyxcclxuICAgICAgejogOCxcclxuICAgICAgaGVhZGluZzogOSxcclxuICAgICAgYW5pbWF0aW9uVGFyZ2V0SWQ6IDEwLFxyXG4gICAgfSxcclxuICAgIGJsYW5rRmllbGRzOiBbNiwgNywgOF0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgICAgMTA6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNhc3RzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCAxMF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ29udGVudEZpbmRlclNldHRpbmdzOiB7XHJcbiAgICB0eXBlOiAnMjY1JyxcclxuICAgIG5hbWU6ICdDb250ZW50RmluZGVyU2V0dGluZ3MnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB6b25lSWQ6IDIsXHJcbiAgICAgIHpvbmVOYW1lOiAzLFxyXG4gICAgICBpbkNvbnRlbnRGaW5kZXJDb250ZW50OiA0LFxyXG4gICAgICB1bnJlc3RyaWN0ZWRQYXJ0eTogNSxcclxuICAgICAgbWluaW1hbEl0ZW1MZXZlbDogNixcclxuICAgICAgc2lsZW5jZUVjaG86IDcsXHJcbiAgICAgIGV4cGxvcmVyTW9kZTogOCxcclxuICAgICAgbGV2ZWxTeW5jOiA5LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTnBjWWVsbDoge1xyXG4gICAgdHlwZTogJzI2NicsXHJcbiAgICBuYW1lOiAnTnBjWWVsbCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY2JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG5wY0lkOiAyLFxyXG4gICAgICBucGNOYW1lSWQ6IDMsXHJcbiAgICAgIG5wY1llbGxJZDogNCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQmF0dGxlVGFsazI6IHtcclxuICAgIHR5cGU6ICcyNjcnLFxyXG4gICAgbmFtZTogJ0JhdHRsZVRhbGsyJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgbnBjSWQ6IDIsXHJcbiAgICAgIGluc3RhbmNlOiAzLFxyXG4gICAgICBucGNOYW1lSWQ6IDQsXHJcbiAgICAgIGluc3RhbmNlQ29udGVudFRleHRJZDogNSxcclxuICAgICAgZGlzcGxheU1zOiA2LFxyXG4gICAgICAvLyB1bmtub3duMTogNyxcclxuICAgICAgLy8gdW5rbm93bjI6IDgsXHJcbiAgICAgIC8vIHVua25vd24zOiA5LFxyXG4gICAgICAvLyB1bmtub3duNDogMTAsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENvdW50ZG93bjoge1xyXG4gICAgdHlwZTogJzI2OCcsXHJcbiAgICBuYW1lOiAnQ291bnRkb3duJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjgnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHdvcmxkSWQ6IDMsXHJcbiAgICAgIGNvdW50ZG93blRpbWU6IDQsXHJcbiAgICAgIHJlc3VsdDogNSxcclxuICAgICAgbmFtZTogNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENvdW50ZG93bkNhbmNlbDoge1xyXG4gICAgdHlwZTogJzI2OScsXHJcbiAgICBuYW1lOiAnQ291bnRkb3duQ2FuY2VsJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjknLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHdvcmxkSWQ6IDMsXHJcbiAgICAgIG5hbWU6IDQsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDQsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBBY3Rvck1vdmU6IHtcclxuICAgIHR5cGU6ICcyNzAnLFxyXG4gICAgbmFtZTogJ0FjdG9yTW92ZScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjcwJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBoZWFkaW5nOiAzLCAvLyBPUCBjYWxscyB0aGlzICdyb3RhdGlvbicsIGJ1dCBjYWN0Ym90IGNvbnNpc3RlbnRseSB1c2VzICdoZWFkaW5nJ1xyXG4gICAgICAvLyB1bmtub3duMTogNCxcclxuICAgICAgbW92ZVR5cGU6IDUsXHJcbiAgICAgIHg6IDYsXHJcbiAgICAgIHk6IDcsXHJcbiAgICAgIHo6IDgsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgLy8gbm8gcmVhbCB3YXkgdG8gZmlsdGVyIG5vaXNlLCBldmVuIGlmIChpbmZyZXF1ZW50bHkpIHVzZWQgZm9yIHRyaWdnZXJzXHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JTZXRQb3M6IHtcclxuICAgIHR5cGU6ICcyNzEnLFxyXG4gICAgbmFtZTogJ0FjdG9yU2V0UG9zJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzEnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGhlYWRpbmc6IDMsIC8vIE9QIGNhbGxzIHRoaXMgJ3JvdGF0aW9uJywgYnV0IGNhY3Rib3QgY29uc2lzdGVudGx5IHVzZXMgJ2hlYWRpbmcnXHJcbiAgICAgIC8vIHVua25vd24xOiA0LFxyXG4gICAgICAvLyB1bmtub3duMjogNSxcclxuICAgICAgeDogNixcclxuICAgICAgeTogNyxcclxuICAgICAgejogOCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBpZDogJzQuezd9JyB9LCAvLyBOUENzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3Bhd25OcGNFeHRyYToge1xyXG4gICAgdHlwZTogJzI3MicsXHJcbiAgICBuYW1lOiAnU3Bhd25OcGNFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjcyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBwYXJlbnRJZDogMyxcclxuICAgICAgdGV0aGVySWQ6IDQsXHJcbiAgICAgIGFuaW1hdGlvblN0YXRlOiA1LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAzOiBudWxsLCAvLyBgaWRgIGlzIGFuIG5wYywgYnV0IHBhcmVudElkIGNvdWxkIGJlIGEgdGV0aGVyZWQgcGxheWVyP1xyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDNdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFjdG9yQ29udHJvbEV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjczJyxcclxuICAgIG5hbWU6ICdBY3RvckNvbnRyb2xFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjczJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBjYXRlZ29yeTogMyxcclxuICAgICAgcGFyYW0xOiA0LFxyXG4gICAgICBwYXJhbTI6IDUsXHJcbiAgICAgIHBhcmFtMzogNixcclxuICAgICAgcGFyYW00OiA3LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUGxheWVySWRzOiBbNCwgNSwgNiwgN10sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JDb250cm9sU2VsZkV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjc0JyxcclxuICAgIG5hbWU6ICdBY3RvckNvbnRyb2xTZWxmRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3NCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgY2F0ZWdvcnk6IDMsXHJcbiAgICAgIHBhcmFtMTogNCxcclxuICAgICAgcGFyYW0yOiA1LFxyXG4gICAgICBwYXJhbTM6IDYsXHJcbiAgICAgIHBhcmFtNDogNyxcclxuICAgICAgcGFyYW01OiA4LFxyXG4gICAgICBwYXJhbTY6IDksXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs0LCA1LCA2LCA3LCA4LCA5XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCBjb25zdCBsb2dEZWZpbml0aW9uc1ZlcnNpb25zID0ge1xyXG4gICdsYXRlc3QnOiBsYXRlc3RMb2dEZWZpbml0aW9ucyxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIFZlcmlmeSB0aGF0IHRoaXMgaGFzIHRoZSByaWdodCB0eXBlLCBidXQgZXhwb3J0IGBhcyBjb25zdGAuXHJcbmNvbnN0IGFzc2VydExvZ0RlZmluaXRpb25zOiBMb2dEZWZpbml0aW9uTWFwID0gbGF0ZXN0TG9nRGVmaW5pdGlvbnM7XHJcbmNvbnNvbGUuYXNzZXJ0KGFzc2VydExvZ0RlZmluaXRpb25zKTtcclxuXHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25zID0gdHlwZW9mIGxhdGVzdExvZ0RlZmluaXRpb25zO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uTmFtZSA9IGtleW9mIExvZ0RlZmluaXRpb25zO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uVHlwZSA9IExvZ0RlZmluaXRpb25zW0xvZ0RlZmluaXRpb25OYW1lXVsndHlwZSddO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uTWFwID0geyBbSyBpbiBMb2dEZWZpbml0aW9uTmFtZV06IExvZ0RlZmluaXRpb248Sz4gfTtcclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvblZlcnNpb25zID0ga2V5b2YgdHlwZW9mIGxvZ0RlZmluaXRpb25zVmVyc2lvbnM7XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc05hcnJvd2luZ1R5cGUgPSB7IHJlYWRvbmx5IHJlcGVhdGluZ0ZpZWxkczogdW5rbm93biB9O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBrZXlvZiB7XHJcbiAgW1xyXG4gICAgdHlwZSBpbiBMb2dEZWZpbml0aW9uTmFtZSBhcyBMb2dEZWZpbml0aW9uc1t0eXBlXSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc05hcnJvd2luZ1R5cGUgPyB0eXBlXHJcbiAgICAgIDogbmV2ZXJcclxuICBdOiBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnMgPSB7XHJcbiAgW3R5cGUgaW4gUmVwZWF0aW5nRmllbGRzVHlwZXNdOiBMb2dEZWZpbml0aW9uc1t0eXBlXSAmIHtcclxuICAgIHJlYWRvbmx5IHJlcGVhdGluZ0ZpZWxkczogRXhjbHVkZTxMb2dEZWZpbml0aW9uc1t0eXBlXVsncmVwZWF0aW5nRmllbGRzJ10sIHVuZGVmaW5lZD47XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFBhcnNlSGVscGVyRmllbGQ8XHJcbiAgVHlwZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEZpZWxkcyBleHRlbmRzIE5ldEZpZWxkc1JldmVyc2VbVHlwZV0sXHJcbiAgRmllbGQgZXh0ZW5kcyBrZXlvZiBGaWVsZHMsXHJcbj4gPSB7XHJcbiAgZmllbGQ6IEZpZWxkc1tGaWVsZF0gZXh0ZW5kcyBzdHJpbmcgPyBGaWVsZHNbRmllbGRdIDogbmV2ZXI7XHJcbiAgdmFsdWU/OiBzdHJpbmc7XHJcbiAgb3B0aW9uYWw/OiBib29sZWFuO1xyXG4gIHJlcGVhdGluZz86IGJvb2xlYW47XHJcbiAgcmVwZWF0aW5nS2V5cz86IHN0cmluZ1tdO1xyXG4gIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICBwcmltYXJ5S2V5Pzogc3RyaW5nO1xyXG4gIHBvc3NpYmxlS2V5cz86IHN0cmluZ1tdO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGFyc2VIZWxwZXJGaWVsZHM8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBbZmllbGQgaW4ga2V5b2YgTmV0RmllbGRzUmV2ZXJzZVtUXV06IFBhcnNlSGVscGVyRmllbGQ8VCwgTmV0RmllbGRzUmV2ZXJzZVtUXSwgZmllbGQ+O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbG9nRGVmaW5pdGlvbnNWZXJzaW9uc1snbGF0ZXN0J107XHJcbiIsIi8vIEhlbHBlciBFcnJvciBmb3IgVHlwZVNjcmlwdCBzaXR1YXRpb25zIHdoZXJlIHRoZSBwcm9ncmFtbWVyIHRoaW5rcyB0aGV5XHJcbi8vIGtub3cgYmV0dGVyIHRoYW4gVHlwZVNjcmlwdCB0aGF0IHNvbWUgc2l0dWF0aW9uIHdpbGwgbmV2ZXIgb2NjdXIuXHJcblxyXG4vLyBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdGhhdCB0aGUgcHJvZ3JhbW1lciBkb2VzIG5vdCBleHBlY3QgYSBwYXJ0aWN1bGFyXHJcbi8vIGJpdCBvZiBjb2RlIHRvIGhhcHBlbiwgYW5kIHNvIGhhcyBub3Qgd3JpdHRlbiBjYXJlZnVsIGVycm9yIGhhbmRsaW5nLlxyXG4vLyBJZiBpdCBkb2VzIG9jY3VyLCBhdCBsZWFzdCB0aGVyZSB3aWxsIGJlIGFuIGVycm9yIGFuZCB3ZSBjYW4gZmlndXJlIG91dCB3aHkuXHJcbi8vIFRoaXMgaXMgcHJlZmVyYWJsZSB0byBjYXN0aW5nIG9yIGRpc2FibGluZyBUeXBlU2NyaXB0IGFsdG9nZXRoZXIgaW4gb3JkZXIgdG9cclxuLy8gYXZvaWQgc3ludGF4IGVycm9ycy5cclxuXHJcbi8vIE9uZSBjb21tb24gZXhhbXBsZSBpcyBhIHJlZ2V4LCB3aGVyZSBpZiB0aGUgcmVnZXggbWF0Y2hlcyB0aGVuIGFsbCBvZiB0aGVcclxuLy8gKG5vbi1vcHRpb25hbCkgcmVnZXggZ3JvdXBzIHdpbGwgYWxzbyBiZSB2YWxpZCwgYnV0IFR5cGVTY3JpcHQgZG9lc24ndCBrbm93LlxyXG5leHBvcnQgY2xhc3MgVW5yZWFjaGFibGVDb2RlIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoJ1RoaXMgY29kZSBzaG91bGRuXFwndCBiZSByZWFjaGVkJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5ldEZpZWxkcywgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5pbXBvcnQgeyBDYWN0Ym90QmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL25ldF90cmlnZ2VyJztcclxuXHJcbmltcG9ydCBsb2dEZWZpbml0aW9ucywge1xyXG4gIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIGxvZ0RlZmluaXRpb25zVmVyc2lvbnMsXHJcbiAgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4gIFBhcnNlSGVscGVyRmllbGRzLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc1R5cGVzLFxyXG59IGZyb20gJy4vbmV0bG9nX2RlZnMnO1xyXG5pbXBvcnQgeyBVbnJlYWNoYWJsZUNvZGUgfSBmcm9tICcuL25vdF9yZWFjaGVkJztcclxuXHJcbmNvbnN0IHNlcGFyYXRvciA9ICc6JztcclxuY29uc3QgbWF0Y2hEZWZhdWx0ID0gJ1teOl0qJztcclxuY29uc3QgbWF0Y2hXaXRoQ29sb25zRGVmYXVsdCA9ICcoPzpbXjpdfDogKSo/JztcclxuY29uc3QgZmllbGRzV2l0aFBvdGVudGlhbENvbG9ucyA9IFsnZWZmZWN0JywgJ2FiaWxpdHknXTtcclxuXHJcbmNvbnN0IGRlZmF1bHRQYXJhbXMgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIFYgZXh0ZW5kcyBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbj4odHlwZTogVCwgdmVyc2lvbjogViwgaW5jbHVkZT86IHN0cmluZ1tdKTogUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj4gPT4ge1xyXG4gIGNvbnN0IGxvZ1R5cGUgPSBsb2dEZWZpbml0aW9uc1ZlcnNpb25zW3ZlcnNpb25dW3R5cGVdO1xyXG4gIGlmIChpbmNsdWRlID09PSB1bmRlZmluZWQpIHtcclxuICAgIGluY2x1ZGUgPSBPYmplY3Qua2V5cyhsb2dUeXBlLmZpZWxkcyk7XHJcbiAgICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSkge1xyXG4gICAgICBpbmNsdWRlLnB1c2gobG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFyYW1zOiB7XHJcbiAgICBbaW5kZXg6IG51bWJlcl06IHtcclxuICAgICAgZmllbGQ6IHN0cmluZztcclxuICAgICAgdmFsdWU/OiBzdHJpbmc7XHJcbiAgICAgIG9wdGlvbmFsOiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmc/OiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmdLZXlzPzogc3RyaW5nW107XHJcbiAgICAgIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICAgICAgcHJpbWFyeUtleT86IHN0cmluZztcclxuICAgICAgcG9zc2libGVLZXlzPzogc3RyaW5nW107XHJcbiAgICB9O1xyXG4gIH0gPSB7fTtcclxuICBjb25zdCBmaXJzdE9wdGlvbmFsRmllbGQgPSBsb2dUeXBlLmZpcnN0T3B0aW9uYWxGaWVsZDtcclxuXHJcbiAgZm9yIChjb25zdCBbcHJvcCwgaW5kZXhdIG9mIE9iamVjdC5lbnRyaWVzKGxvZ1R5cGUuZmllbGRzKSkge1xyXG4gICAgaWYgKCFpbmNsdWRlLmluY2x1ZGVzKHByb3ApKVxyXG4gICAgICBjb250aW51ZTtcclxuICAgIGNvbnN0IHBhcmFtOiB7IGZpZWxkOiBzdHJpbmc7IHZhbHVlPzogc3RyaW5nOyBvcHRpb25hbDogYm9vbGVhbjsgcmVwZWF0aW5nPzogYm9vbGVhbiB9ID0ge1xyXG4gICAgICBmaWVsZDogcHJvcCxcclxuICAgICAgb3B0aW9uYWw6IGZpcnN0T3B0aW9uYWxGaWVsZCAhPT0gdW5kZWZpbmVkICYmIGluZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgIH07XHJcbiAgICBpZiAocHJvcCA9PT0gJ3R5cGUnKVxyXG4gICAgICBwYXJhbS52YWx1ZSA9IGxvZ1R5cGUudHlwZTtcclxuXHJcbiAgICBwYXJhbXNbaW5kZXhdID0gcGFyYW07XHJcbiAgfVxyXG5cclxuICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSAmJiBpbmNsdWRlLmluY2x1ZGVzKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKSkge1xyXG4gICAgcGFyYW1zW2xvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXhdID0ge1xyXG4gICAgICBmaWVsZDogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgIGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXggPj0gZmlyc3RPcHRpb25hbEZpZWxkLFxyXG4gICAgICByZXBlYXRpbmc6IHRydWUsXHJcbiAgICAgIHJlcGVhdGluZ0tleXM6IFsuLi5sb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5uYW1lc10sXHJcbiAgICAgIHNvcnRLZXlzOiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zb3J0S2V5cyxcclxuICAgICAgcHJpbWFyeUtleTogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucHJpbWFyeUtleSxcclxuICAgICAgcG9zc2libGVLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucG9zc2libGVLZXlzXSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyYW1zIGFzIFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+O1xyXG59O1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXA8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IHtcclxuICBbbmFtZSBpbiBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ25hbWVzJ11bbnVtYmVyXV06XHJcbiAgICB8IHN0cmluZ1xyXG4gICAgfCBzdHJpbmdbXTtcclxufVtdO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RCYXNlXSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IEYgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ2xhYmVsJ11cclxuICA/IFJlcGVhdGluZ0ZpZWxkc01hcDxUS2V5PiA6XHJcbiAgbmV2ZXI7XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEYgZXh0ZW5kcyBrZXlvZiBOZXRGaWVsZHNbVF0sXHJcbj4gPSBUIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8VCwgRj5cclxuICA6IG5ldmVyO1xyXG5cclxudHlwZSBQYXJzZUhlbHBlclR5cGU8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9XHJcbiAgJiB7XHJcbiAgICBbZmllbGQgaW4ga2V5b2YgTmV0RmllbGRzW1RdXT86IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVwZWF0aW5nRmllbGRzTWFwVHlwZTxULCBmaWVsZD47XHJcbiAgfVxyXG4gICYgeyBjYXB0dXJlPzogYm9vbGVhbiB9O1xyXG5cclxuY29uc3QgaXNSZXBlYXRpbmdGaWVsZCA9IDxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbj4oXHJcbiAgcmVwZWF0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkLFxyXG4gIHZhbHVlOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcDxUPiB8IHVuZGVmaW5lZCxcclxuKTogdmFsdWUgaXMgUmVwZWF0aW5nRmllbGRzTWFwPFQ+ID0+IHtcclxuICBpZiAocmVwZWF0aW5nICE9PSB0cnVlKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIEFsbG93IGV4Y2x1ZGluZyB0aGUgZmllbGQgdG8gbWF0Y2ggZm9yIGV4dHJhY3Rpb25cclxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgZm9yIChjb25zdCBlIG9mIHZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIGUgIT09ICdvYmplY3QnKVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VIZWxwZXIgPSA8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPihcclxuICBwYXJhbXM6IFBhcnNlSGVscGVyVHlwZTxUPiB8IHVuZGVmaW5lZCxcclxuICBkZWZLZXk6IFQsXHJcbiAgZmllbGRzOiBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHBhcmFtcyA9IHBhcmFtcyA/PyB7fTtcclxuICBjb25zdCB2YWxpZEZpZWxkczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgZm9yIChjb25zdCBpbmRleCBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IGZpZWxkID0gZmllbGRzW2luZGV4XTtcclxuICAgIGlmIChmaWVsZClcclxuICAgICAgdmFsaWRGaWVsZHMucHVzaChmaWVsZC5maWVsZCk7XHJcbiAgfVxyXG5cclxuICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKHBhcmFtcywgZGVmS2V5LCBbJ2NhcHR1cmUnLCAuLi52YWxpZEZpZWxkc10pO1xyXG5cclxuICAvLyBGaW5kIHRoZSBsYXN0IGtleSB3ZSBjYXJlIGFib3V0LCBzbyB3ZSBjYW4gc2hvcnRlbiB0aGUgcmVnZXggaWYgbmVlZGVkLlxyXG4gIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChwYXJhbXMuY2FwdHVyZSk7XHJcbiAgY29uc3QgZmllbGRLZXlzID0gT2JqZWN0LmtleXMoZmllbGRzKS5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKTtcclxuICBsZXQgbWF4S2V5U3RyOiBzdHJpbmc7XHJcbiAgaWYgKGNhcHR1cmUpIHtcclxuICAgIGNvbnN0IGtleXM6IEV4dHJhY3Q8a2V5b2YgTmV0RmllbGRzUmV2ZXJzZVtUXSwgc3RyaW5nPltdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpXHJcbiAgICAgIGtleXMucHVzaChrZXkpO1xyXG4gICAgbGV0IHRtcEtleSA9IGtleXMucG9wKCk7XHJcbiAgICBpZiAodG1wS2V5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgbWF4S2V5U3RyID0gZmllbGRLZXlzW2ZpZWxkS2V5cy5sZW5ndGggLSAxXSA/PyAnMCc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aGlsZSAoXHJcbiAgICAgICAgZmllbGRzW3RtcEtleV0/Lm9wdGlvbmFsICYmXHJcbiAgICAgICAgISgoZmllbGRzW3RtcEtleV0/LmZpZWxkID8/ICcnKSBpbiBwYXJhbXMpXHJcbiAgICAgIClcclxuICAgICAgICB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgICBtYXhLZXlTdHIgPSB0bXBLZXkgPz8gJzAnO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtYXhLZXlTdHIgPSAnMCc7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBmaWVsZHNba2V5XSA/PyB7fTtcclxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGZpZWxkc1trZXldPy5maWVsZDtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZSBpbiBwYXJhbXMpXHJcbiAgICAgICAgbWF4S2V5U3RyID0ga2V5O1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBtYXhLZXkgPSBwYXJzZUludChtYXhLZXlTdHIpO1xyXG5cclxuICAvLyBTcGVjaWFsIGNhc2UgZm9yIEFiaWxpdHkgdG8gaGFuZGxlIGFvZSBhbmQgbm9uLWFvZS5cclxuICBjb25zdCBhYmlsaXR5TWVzc2FnZVR5cGUgPVxyXG4gICAgYCg/OiR7bG9nRGVmaW5pdGlvbnMuQWJpbGl0eS5tZXNzYWdlVHlwZX18JHtsb2dEZWZpbml0aW9ucy5OZXR3b3JrQU9FQWJpbGl0eS5tZXNzYWdlVHlwZX0pYDtcclxuICBjb25zdCBhYmlsaXR5SGV4Q29kZSA9ICcoPzoxNXwxNiknO1xyXG5cclxuICAvLyBCdWlsZCB0aGUgcmVnZXggZnJvbSB0aGUgZmllbGRzLlxyXG4gIGNvbnN0IHByZWZpeCA9IGRlZktleSAhPT0gJ0FiaWxpdHknID8gbG9nRGVmaW5pdGlvbnNbZGVmS2V5XS5tZXNzYWdlVHlwZSA6IGFiaWxpdHlNZXNzYWdlVHlwZTtcclxuXHJcbiAgLy8gSGV4IGNvZGVzIGFyZSBhIG1pbmltdW0gb2YgdHdvIGNoYXJhY3RlcnMuICBBYmlsaXRpZXMgYXJlIHNwZWNpYWwgYmVjYXVzZVxyXG4gIC8vIHRoZXkgbmVlZCB0byBzdXBwb3J0IGJvdGggMHgxNSBhbmQgMHgxNi5cclxuICBjb25zdCB0eXBlQXNIZXggPSBwYXJzZUludChsb2dEZWZpbml0aW9uc1tkZWZLZXldLnR5cGUpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gIGNvbnN0IGRlZmF1bHRIZXhDb2RlID0gdHlwZUFzSGV4Lmxlbmd0aCA8IDIgPyBgMDAke3R5cGVBc0hleH1gLnNsaWNlKC0yKSA6IHR5cGVBc0hleDtcclxuICBjb25zdCBoZXhDb2RlID0gZGVmS2V5ICE9PSAnQWJpbGl0eScgPyBkZWZhdWx0SGV4Q29kZSA6IGFiaWxpdHlIZXhDb2RlO1xyXG5cclxuICBsZXQgc3RyID0gJyc7XHJcbiAgaWYgKGNhcHR1cmUpXHJcbiAgICBzdHIgKz0gYCg/PHRpbWVzdGFtcD5cXFxceXtUaW1lc3RhbXB9KSAke3ByZWZpeH0gKD88dHlwZT4ke2hleENvZGV9KWA7XHJcbiAgZWxzZVxyXG4gICAgc3RyICs9IGBcXFxceXtUaW1lc3RhbXB9ICR7cHJlZml4fSAke2hleENvZGV9YDtcclxuXHJcbiAgbGV0IGxhc3RLZXkgPSAxO1xyXG4gIGZvciAoY29uc3Qga2V5U3RyIGluIGZpZWxkcykge1xyXG4gICAgY29uc3QgcGFyc2VGaWVsZCA9IGZpZWxkc1trZXlTdHJdO1xyXG4gICAgaWYgKHBhcnNlRmllbGQgPT09IHVuZGVmaW5lZClcclxuICAgICAgY29udGludWU7XHJcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBwYXJzZUZpZWxkLmZpZWxkO1xyXG5cclxuICAgIC8vIFJlZ2V4IGhhbmRsZXMgdGhlc2UgbWFudWFsbHkgYWJvdmUgaW4gdGhlIGBzdHJgIGluaXRpYWxpemF0aW9uLlxyXG4gICAgaWYgKGZpZWxkTmFtZSA9PT0gJ3RpbWVzdGFtcCcgfHwgZmllbGROYW1lID09PSAndHlwZScpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgIGNvbnN0IGtleSA9IHBhcnNlSW50KGtleVN0cik7XHJcbiAgICAvLyBGaWxsIGluIGJsYW5rcy5cclxuICAgIGNvbnN0IG1pc3NpbmdGaWVsZHMgPSBrZXkgLSBsYXN0S2V5IC0gMTtcclxuICAgIGlmIChtaXNzaW5nRmllbGRzID09PSAxKVxyXG4gICAgICBzdHIgKz0gYCR7c2VwYXJhdG9yfSR7bWF0Y2hEZWZhdWx0fWA7XHJcbiAgICBlbHNlIGlmIChtaXNzaW5nRmllbGRzID4gMSlcclxuICAgICAgc3RyICs9IGAoPzoke3NlcGFyYXRvcn0ke21hdGNoRGVmYXVsdH0peyR7bWlzc2luZ0ZpZWxkc319YDtcclxuICAgIGxhc3RLZXkgPSBrZXk7XHJcblxyXG4gICAgc3RyICs9IHNlcGFyYXRvcjtcclxuXHJcbiAgICBpZiAodHlwZW9mIHBhcnNlRmllbGQgIT09ICdvYmplY3QnKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVmS2V5fTogaW52YWxpZCB2YWx1ZTogJHtKU09OLnN0cmluZ2lmeShwYXJzZUZpZWxkKX1gKTtcclxuXHJcbiAgICBjb25zdCBmaWVsZERlZmF1bHQgPSBmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZHNXaXRoUG90ZW50aWFsQ29sb25zLmluY2x1ZGVzKGZpZWxkTmFtZSlcclxuICAgICAgPyBtYXRjaFdpdGhDb2xvbnNEZWZhdWx0XHJcbiAgICAgIDogbWF0Y2hEZWZhdWx0O1xyXG4gICAgY29uc3QgZGVmYXVsdEZpZWxkVmFsdWUgPSBwYXJzZUZpZWxkLnZhbHVlPy50b1N0cmluZygpID8/IGZpZWxkRGVmYXVsdDtcclxuICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBwYXJhbXNbZmllbGROYW1lXTtcclxuXHJcbiAgICBpZiAoaXNSZXBlYXRpbmdGaWVsZChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nLCBmaWVsZFZhbHVlKSkge1xyXG4gICAgICBjb25zdCByZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3IgPSAnKD86JHw6KSc7XHJcbiAgICAgIGxldCByZXBlYXRpbmdBcnJheTogUmVwZWF0aW5nRmllbGRzTWFwPFQ+IHwgdW5kZWZpbmVkID0gZmllbGRWYWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHNvcnRLZXlzID0gZmllbGRzW2tleVN0cl0/LnNvcnRLZXlzO1xyXG4gICAgICBjb25zdCBwcmltYXJ5S2V5ID0gZmllbGRzW2tleVN0cl0/LnByaW1hcnlLZXk7XHJcbiAgICAgIGNvbnN0IHBvc3NpYmxlS2V5cyA9IGZpZWxkc1trZXlTdHJdPy5wb3NzaWJsZUtleXM7XHJcblxyXG4gICAgICAvLyBwcmltYXJ5S2V5IGlzIHJlcXVpcmVkIGlmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgcGVyIHR5cGVkZWYgaW4gbmV0bG9nX2RlZnMudHNcclxuICAgICAgLy8gU2FtZSB3aXRoIHBvc3NpYmxlS2V5c1xyXG4gICAgICBpZiAocHJpbWFyeUtleSA9PT0gdW5kZWZpbmVkIHx8IHBvc3NpYmxlS2V5cyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuXHJcbiAgICAgIC8vIEFsbG93IHNvcnRpbmcgaWYgbmVlZGVkXHJcbiAgICAgIGlmIChzb3J0S2V5cykge1xyXG4gICAgICAgIC8vIEFsc28gc29ydCBvdXIgdmFsaWQga2V5cyBsaXN0XHJcbiAgICAgICAgcG9zc2libGVLZXlzLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiBsZWZ0LnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShyaWdodC50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgaWYgKHJlcGVhdGluZ0FycmF5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIHJlcGVhdGluZ0FycmF5ID0gWy4uLnJlcGVhdGluZ0FycmF5XS5zb3J0KFxyXG4gICAgICAgICAgICAobGVmdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHJpZ2h0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gV2UgY2hlY2sgdGhlIHZhbGlkaXR5IG9mIGxlZnQvcmlnaHQgYmVjYXVzZSB0aGV5J3JlIHVzZXItc3VwcGxpZWRcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnQgIT09ICdvYmplY3QnIHx8IGxlZnRbcHJpbWFyeUtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IGxlZnRWYWx1ZSA9IGxlZnRbcHJpbWFyeUtleV07XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKGxlZnRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCBsZWZ0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0ICE9PSAnb2JqZWN0JyB8fCByaWdodFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZ2h0VmFsdWUgPSByaWdodFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKHJpZ2h0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBsZWZ0VmFsdWUudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0VmFsdWUudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYW5vblJlcHM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH1bXSB8IHVuZGVmaW5lZCA9IHJlcGVhdGluZ0FycmF5O1xyXG4gICAgICAvLyBMb29wIG92ZXIgb3VyIHBvc3NpYmxlIGtleXNcclxuICAgICAgLy8gQnVpbGQgYSByZWdleCB0aGF0IGNhbiBtYXRjaCBhbnkgcG9zc2libGUga2V5IHdpdGggcmVxdWlyZWQgdmFsdWVzIHN1YnN0aXR1dGVkIGluXHJcbiAgICAgIHBvc3NpYmxlS2V5cy5mb3JFYWNoKChwb3NzaWJsZUtleSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcCA9IGFub25SZXBzPy5maW5kKChyZXApID0+IHByaW1hcnlLZXkgaW4gcmVwICYmIHJlcFtwcmltYXJ5S2V5XSA9PT0gcG9zc2libGVLZXkpO1xyXG5cclxuICAgICAgICBsZXQgZmllbGRSZWdleCA9ICcnO1xyXG4gICAgICAgIC8vIFJhdGhlciB0aGFuIGxvb3Bpbmcgb3ZlciB0aGUga2V5cyBkZWZpbmVkIG9uIHRoZSBvYmplY3QsXHJcbiAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBiYXNlIHR5cGUgZGVmJ3Mga2V5cy4gVGhpcyBlbmZvcmNlcyB0aGUgY29ycmVjdCBvcmRlci5cclxuICAgICAgICBmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nS2V5cz8uZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICBsZXQgdmFsID0gcmVwPy5ba2V5XTtcclxuICAgICAgICAgIGlmIChyZXAgPT09IHVuZGVmaW5lZCB8fCAhKGtleSBpbiByZXApKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWx1ZSBmb3IgdGhpcyBrZXlcclxuICAgICAgICAgICAgLy8gaW5zZXJ0IGEgcGxhY2Vob2xkZXIsIHVubGVzcyBpdCdzIHRoZSBwcmltYXJ5IGtleVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBwcmltYXJ5S2V5KVxyXG4gICAgICAgICAgICAgIHZhbCA9IHBvc3NpYmxlS2V5O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWwpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsLmxlbmd0aCA8IDEpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwuc29tZSgodikgPT4gdHlwZW9mIHYgIT09ICdzdHJpbmcnKSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWVsZFJlZ2V4ICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgICBrZXkgPT09IHByaW1hcnlLZXkgPyBmYWxzZSA6IGNhcHR1cmUsXHJcbiAgICAgICAgICAgIC8vIEFsbCBjYXB0dXJpbmcgZ3JvdXBzIGFyZSBgZmllbGROYW1lYCArIGBwb3NzaWJsZUtleWAsIGUuZy4gYHBhaXJJc0Nhc3RpbmcxYFxyXG4gICAgICAgICAgICBmaWVsZE5hbWUgKyBwb3NzaWJsZUtleSxcclxuICAgICAgICAgICAgdmFsLFxyXG4gICAgICAgICAgICBkZWZhdWx0RmllbGRWYWx1ZSxcclxuICAgICAgICAgICkgK1xyXG4gICAgICAgICAgICByZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3I7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChmaWVsZFJlZ2V4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHN0ciArPSBgKD86JHtmaWVsZFJlZ2V4fSkke3JlcCAhPT0gdW5kZWZpbmVkID8gJycgOiAnPyd9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIGlmIChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nKSB7XHJcbiAgICAgIC8vIElmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgYnV0IHRoZSBhY3R1YWwgdmFsdWUgaXMgZW1wdHkgb3Igb3RoZXJ3aXNlIGludmFsaWQsXHJcbiAgICAgIC8vIGRvbid0IHByb2Nlc3MgZnVydGhlci4gV2UgY2FuJ3QgdXNlIGBjb250aW51ZWAgaW4gdGhlIGFib3ZlIGJsb2NrIGJlY2F1c2UgdGhhdFxyXG4gICAgICAvLyB3b3VsZCBza2lwIHRoZSBlYXJseS1vdXQgYnJlYWsgYXQgdGhlIGVuZCBvZiB0aGUgbG9vcC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShcclxuICAgICAgICAgIC8vIG1vcmUgYWNjdXJhdGUgdHlwZSBpbnN0ZWFkIG9mIGBhc2AgY2FzdFxyXG4gICAgICAgICAgLy8gbWF5YmUgdGhpcyBmdW5jdGlvbiBuZWVkcyBhIHJlZmFjdG9yaW5nXHJcbiAgICAgICAgICBjYXB0dXJlLFxyXG4gICAgICAgICAgZmllbGROYW1lLFxyXG4gICAgICAgICAgZmllbGRWYWx1ZSxcclxuICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRklYTUU6IGhhbmRsZSBsaW50IGVycm9yIGhlcmVcclxuICAgICAgICAvLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvcHVsbC8yNzQjZGlzY3Vzc2lvbl9yMTY5MjQzOTcyMFxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVzdHJpY3QtcGx1cy1vcGVyYW5kc1xyXG4gICAgICAgIHN0ciArPSBmaWVsZFZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcCBpZiB3ZSdyZSBub3QgY2FwdHVyaW5nIGFuZCBkb24ndCBjYXJlIGFib3V0IGZ1dHVyZSBmaWVsZHMuXHJcbiAgICBpZiAoa2V5ID49IG1heEtleSlcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICBzdHIgKz0gJyg/OiR8OiknO1xyXG5cclxuICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpIGFzIENhY3Rib3RCYXNlUmVnRXhwPFQ+O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVnZXggPSA8VCBleHRlbmRzIGtleW9mIE5ldFBhcmFtcz4oXHJcbiAgdHlwZTogVCxcclxuICBwYXJhbXM/OiBQYXJzZUhlbHBlclR5cGU8VD4sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCB0eXBlLCBkZWZhdWx0UGFyYW1zKHR5cGUsIFJlZ2V4ZXMubG9nVmVyc2lvbikpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnZXhlcyB7XHJcbiAgc3RhdGljIGxvZ1ZlcnNpb246IExvZ0RlZmluaXRpb25WZXJzaW9ucyA9ICdsYXRlc3QnO1xyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjAtMHgxNC1uZXR3b3Jrc3RhcnRzY2FzdGluZ1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXJ0c1VzaW5nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhcnRzVXNpbmcnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmcnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5KHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjEtMHgxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMi0weDE2LW5ldHdvcmthb2VhYmlsaXR5XHJcbiAgICpcclxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGFiaWxpdHlgIGluc3RlYWRcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUZ1bGwocGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eSc+IHtcclxuICAgIHJldHVybiB0aGlzLmFiaWxpdHkocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNy0weDFiLW5ldHdvcmt0YXJnZXRpY29uLWhlYWQtbWFya2VyXHJcbiAgICovXHJcbiAgc3RhdGljIGhlYWRNYXJrZXIocGFyYW1zPzogTmV0UGFyYW1zWydIZWFkTWFya2VyJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnSGVhZE1hcmtlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdIZWFkTWFya2VyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMy0weDAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWRkZWRDb21iYXRhbnQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50RnVsbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gdGhpcy5hZGRlZENvbWJhdGFudChwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTA0LTB4MDQtcmVtb3ZlY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIHJlbW92aW5nQ29tYmF0YW50KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydSZW1vdmVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1JlbW92ZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUmVtb3ZlZENvbWJhdGFudCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYtMHgxYS1uZXR3b3JrYnVmZlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYWluc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhaW5zRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FpbnNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnR2FpbnNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJlZmVyIGdhaW5zRWZmZWN0IG92ZXIgdGhpcyBmdW5jdGlvbiB1bmxlc3MgeW91IHJlYWxseSBuZWVkIGV4dHJhIGRhdGEuXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM4LTB4MjYtbmV0d29ya3N0YXR1c2VmZmVjdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdHVzRWZmZWN0RXhwbGljaXQoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXR1c0VmZmVjdCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGF0dXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhdHVzRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zMC0weDFlLW5ldHdvcmtidWZmcmVtb3ZlXHJcbiAgICovXHJcbiAgc3RhdGljIGxvc2VzRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTG9zZXNFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdMb3Nlc0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdMb3Nlc0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzUtMHgyMy1uZXR3b3JrdGV0aGVyXHJcbiAgICovXHJcbiAgc3RhdGljIHRldGhlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ1RldGhlciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1RldGhlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdUZXRoZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogJ3RhcmdldCcgd2FzIGRlZmVhdGVkIGJ5ICdzb3VyY2UnXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1LTB4MTktbmV0d29ya2RlYXRoXHJcbiAgICovXHJcbiAgc3RhdGljIHdhc0RlZmVhdGVkKHBhcmFtcz86IE5ldFBhcmFtc1snV2FzRGVmZWF0ZWQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdXYXNEZWZlYXRlZCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdXYXNEZWZlYXRlZCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjQtMHgxOC1uZXR3b3JrZG90XHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcmtEb1QocGFyYW1zPzogTmV0UGFyYW1zWydOZXR3b3JrRG9UJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmV0d29ya0RvVCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOZXR3b3JrRG9UJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZWNobyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ2VjaG8nLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwMDM4JztcclxuICAgIHJldHVybiBSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZGlhbG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnZGlhbG9nJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDA0NCc7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIG1lc3NhZ2UocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdtZXNzYWdlJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDgzOSc7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIG5hbWUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYW1lTG9nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZU5hbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTEyLTB4MGMtcGxheWVyc3RhdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdENoYW5nZShwYXJhbXM/OiBOZXRQYXJhbXNbJ1BsYXllclN0YXRzJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUGxheWVyU3RhdHMnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUGxheWVyU3RhdHMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAxLTB4MDEtY2hhbmdlem9uZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaGFuZ2Vab25lKHBhcmFtcz86IE5ldFBhcmFtc1snQ2hhbmdlWm9uZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NoYW5nZVpvbmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ2hhbmdlWm9uZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzMtMHgyMS1uZXR3b3JrNmQtYWN0b3ItY29udHJvbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrNmQocGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2wnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2wnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNC0weDIyLW5ldHdvcmtuYW1ldG9nZ2xlXHJcbiAgICovXHJcbiAgc3RhdGljIG5hbWVUb2dnbGUocGFyYW1zPzogTmV0UGFyYW1zWydOYW1lVG9nZ2xlJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmFtZVRvZ2dsZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOYW1lVG9nZ2xlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MC0weDI4LW1hcFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXAocGFyYW1zPzogTmV0UGFyYW1zWydNYXAnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXAnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MS0weDI5LXN5c3RlbWxvZ21lc3NhZ2VcclxuICAgKi9cclxuICBzdGF0aWMgc3lzdGVtTG9nTWVzc2FnZShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3lzdGVtTG9nTWVzc2FnZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTeXN0ZW1Mb2dNZXNzYWdlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N5c3RlbUxvZ01lc3NhZ2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1Ny0weDEwMS1tYXBlZmZlY3RcclxuICAgKi9cclxuICBzdGF0aWMgbWFwRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTWFwRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcEVmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU4LTB4MTAyLWZhdGVkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBmYXRlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydGYXRlRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdGYXRlRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnRmF0ZURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTktMHgxMDMtY2VkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBjZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snQ0VEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NFRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ0VEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYwLTB4MTA0LWluY29tYmF0XHJcbiAgICovXHJcbiAgc3RhdGljIGluQ29tYmF0KHBhcmFtcz86IE5ldFBhcmFtc1snSW5Db21iYXQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdJbkNvbWJhdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdJbkNvbWJhdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYxLTB4MTA1LWNvbWJhdGFudG1lbW9yeVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb21iYXRhbnRNZW1vcnkoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbWJhdGFudE1lbW9yeSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb21iYXRhbnRNZW1vcnknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29tYmF0YW50TWVtb3J5JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjMtMHgxMDctc3RhcnRzdXNpbmdleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZ0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZ0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmdFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY0LTB4MTA4LWFiaWxpdHlleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHlFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5RXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eUV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjUtMHgxMDktY29udGVudGZpbmRlcnNldHRpbmdzXHJcbiAgICovXHJcbiAgc3RhdGljIGNvbnRlbnRGaW5kZXJTZXR0aW5ncyhcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29udGVudEZpbmRlclNldHRpbmdzJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbnRlbnRGaW5kZXJTZXR0aW5ncyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb250ZW50RmluZGVyU2V0dGluZ3MnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Ni0weDEwYS1ucGN5ZWxsXHJcbiAgICovXHJcbiAgc3RhdGljIG5wY1llbGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ05wY1llbGwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTnBjWWVsbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOcGNZZWxsJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjctMHgxMGItYmF0dGxldGFsazJcclxuICAgKi9cclxuICBzdGF0aWMgYmF0dGxlVGFsazIoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0JhdHRsZVRhbGsyJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0JhdHRsZVRhbGsyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0JhdHRsZVRhbGsyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjgtMHgxMGMtY291bnRkb3duXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bihcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2OS0weDEwZC1jb3VudGRvd25jYW5jZWxcclxuICAgKi9cclxuICBzdGF0aWMgY291bnRkb3duQ2FuY2VsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb3VudGRvd25DYW5jZWwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ291bnRkb3duQ2FuY2VsJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvdW50ZG93bkNhbmNlbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcwLTB4MTBlLWFjdG9ybW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3Rvck1vdmUoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yTW92ZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3Rvck1vdmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JNb3ZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzEtMHgxMGYtYWN0b3JzZXRwb3NcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JTZXRQb3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yU2V0UG9zJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yU2V0UG9zJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yU2V0UG9zJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzItMHgxMTAtc3Bhd25ucGNleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzcGF3bk5wY0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTcGF3bk5wY0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1NwYXduTnBjRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3Bhd25OcGNFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjczLTB4MTExLWFjdG9yY29udHJvbGV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yQ29udHJvbEV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2xFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjc0LTB4MTEyLWFjdG9yY29udHJvbHNlbGZleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xTZWxmRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbFNlbGZFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xTZWxmRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sU2VsZkV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgYnVpbGRpbmcgbmFtZWQgY2FwdHVyZSBncm91cFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXliZUNhcHR1cmUoXHJcbiAgICBjYXB0dXJlOiBib29sZWFuLFxyXG4gICAgbmFtZTogc3RyaW5nLFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxyXG4gICAgZGVmYXVsdFZhbHVlPzogc3RyaW5nLFxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcclxuICAgICAgdmFsdWUgPSBkZWZhdWx0VmFsdWUgPz8gbWF0Y2hEZWZhdWx0O1xyXG4gICAgdmFsdWUgPSBSZWdleGVzLmFueU9mKHZhbHVlKTtcclxuICAgIHJldHVybiBjYXB0dXJlID8gUmVnZXhlcy5uYW1lZENhcHR1cmUobmFtZSwgdmFsdWUpIDogdmFsdWU7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgb3B0aW9uYWwoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAoPzoke3N0cn0pP2A7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGVzIGEgbmFtZWQgcmVnZXggY2FwdHVyZSBncm91cCBuYW1lZCB8bmFtZXwgZm9yIHRoZSBtYXRjaCB8dmFsdWV8LlxyXG4gIHN0YXRpYyBuYW1lZENhcHR1cmUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmIChuYW1lLmluY2x1ZGVzKCc+JykpXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFwiJHtuYW1lfVwiIGNvbnRhaW5zIFwiPlwiLmApO1xyXG4gICAgaWYgKG5hbWUuaW5jbHVkZXMoJzwnKSlcclxuICAgICAgY29uc29sZS5lcnJvcihgXCIke25hbWV9XCIgY29udGFpbnMgXCI+XCIuYCk7XHJcblxyXG4gICAgcmV0dXJuIGAoPzwke25hbWV9PiR7dmFsdWV9KWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmb3IgdHVybmluZyBtdWx0aXBsZSBhcmdzIGludG8gYSB1bmlvbmVkIHJlZ3VsYXIgZXhwcmVzc2lvbi5cclxuICAgKiBhbnlPZih4LCB5LCB6KSBvciBhbnlPZihbeCwgeSwgel0pIGRvIHRoZSBzYW1lIHRoaW5nLCBhbmQgcmV0dXJuICg/Onh8eXx6KS5cclxuICAgKiBhbnlPZih4KSBvciBhbnlPZih4KSBvbiBpdHMgb3duIHNpbXBsaWZpZXMgdG8ganVzdCB4LlxyXG4gICAqIGFyZ3MgbWF5IGJlIHN0cmluZ3Mgb3IgUmVnRXhwLCBhbHRob3VnaCBhbnkgYWRkaXRpb25hbCBtYXJrZXJzIHRvIFJlZ0V4cFxyXG4gICAqIGxpa2UgL2luc2Vuc2l0aXZlL2kgYXJlIGRyb3BwZWQuXHJcbiAgICovXHJcbiAgc3RhdGljIGFueU9mKC4uLmFyZ3M6IChzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlZ0V4cClbXSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhbnlPZkFycmF5ID0gKGFycmF5OiByZWFkb25seSAoc3RyaW5nIHwgUmVnRXhwKVtdKTogc3RyaW5nID0+IHtcclxuICAgICAgY29uc3QgW2VsZW1dID0gYXJyYXk7XHJcbiAgICAgIGlmIChlbGVtICE9PSB1bmRlZmluZWQgJiYgYXJyYXkubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHJldHVybiBgJHtlbGVtIGluc3RhbmNlb2YgUmVnRXhwID8gZWxlbS5zb3VyY2UgOiBlbGVtfWA7XHJcbiAgICAgIHJldHVybiBgKD86JHthcnJheS5tYXAoKGVsZW0pID0+IGVsZW0gaW5zdGFuY2VvZiBSZWdFeHAgPyBlbGVtLnNvdXJjZSA6IGVsZW0pLmpvaW4oJ3wnKX0pYDtcclxuICAgIH07XHJcbiAgICBsZXQgYXJyYXk6IHJlYWRvbmx5IChzdHJpbmcgfCBSZWdFeHApW10gPSBbXTtcclxuICAgIGNvbnN0IFtmaXJzdEFyZ10gPSBhcmdzO1xyXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdzdHJpbmcnIHx8IGZpcnN0QXJnIGluc3RhbmNlb2YgUmVnRXhwKVxyXG4gICAgICAgIGFycmF5ID0gW2ZpcnN0QXJnXTtcclxuICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmaXJzdEFyZykpXHJcbiAgICAgICAgYXJyYXkgPSBmaXJzdEFyZztcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGFycmF5ID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUT0RPOiBtb3JlIGFjY3VyYXRlIHR5cGUgaW5zdGVhZCBvZiBgYXNgIGNhc3RcclxuICAgICAgYXJyYXkgPSBhcmdzIGFzIHJlYWRvbmx5IHN0cmluZ1tdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFueU9mQXJyYXkoYXJyYXkpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHBhcnNlKHJlZ2V4cFN0cmluZzogUmVnRXhwIHwgc3RyaW5nIHwgQ2FjdGJvdEJhc2VSZWdFeHA8J05vbmUnPik6IFJlZ0V4cCB7XHJcbiAgICBjb25zdCBrQ2FjdGJvdENhdGVnb3JpZXMgPSB7XHJcbiAgICAgIFRpbWVzdGFtcDogJ14uezE0fScsXHJcbiAgICAgIE5ldFRpbWVzdGFtcDogJy57MzN9JyxcclxuICAgICAgTmV0RmllbGQ6ICcoPzpbXnxdKlxcXFx8KScsXHJcbiAgICAgIExvZ1R5cGU6ICdbMC05QS1GYS1mXXsyfScsXHJcbiAgICAgIEFiaWxpdHlDb2RlOiAnWzAtOUEtRmEtZl17MSw4fScsXHJcbiAgICAgIE9iamVjdElkOiAnWzAtOUEtRl17OH0nLFxyXG4gICAgICAvLyBNYXRjaGVzIGFueSBjaGFyYWN0ZXIgbmFtZSAoaW5jbHVkaW5nIGVtcHR5IHN0cmluZ3Mgd2hpY2ggdGhlIEZGWElWXHJcbiAgICAgIC8vIEFDVCBwbHVnaW4gY2FuIGdlbmVyYXRlIHdoZW4gdW5rbm93bikuXHJcbiAgICAgIE5hbWU6ICcoPzpbXlxcXFxzOnxdKyg/OiBbXlxcXFxzOnxdKyk/fCknLFxyXG4gICAgICAvLyBGbG9hdHMgY2FuIGhhdmUgY29tbWEgYXMgc2VwYXJhdG9yIGluIEZGWElWIHBsdWdpbiBvdXRwdXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9yYXZhaG4vRkZYSVZfQUNUX1BsdWdpbi9pc3N1ZXMvMTM3XHJcbiAgICAgIEZsb2F0OiAnLT9bMC05XSsoPzpbLixdWzAtOV0rKT8oPzpFLT9bMC05XSspPycsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFsbCByZWdleGVzIGluIGNhY3Rib3QgYXJlIGNhc2UgaW5zZW5zaXRpdmUuXHJcbiAgICAvLyBUaGlzIGF2b2lkcyBoZWFkYWNoZXMgYXMgdGhpbmdzIGxpa2UgYFZpY2UgYW5kIFZhbml0eWAgdHVybnMgaW50b1xyXG4gICAgLy8gYFZpY2UgQW5kIFZhbml0eWAsIGVzcGVjaWFsbHkgZm9yIEZyZW5jaCBhbmQgR2VybWFuLiAgSXQgYXBwZWFycyB0b1xyXG4gICAgLy8gaGF2ZSBhIH4yMCUgcmVnZXggcGFyc2luZyBvdmVyaGVhZCwgYnV0IGF0IGxlYXN0IHRoZXkgd29yay5cclxuICAgIGxldCBtb2RpZmllcnMgPSAnaSc7XHJcbiAgICBpZiAocmVnZXhwU3RyaW5nIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcbiAgICAgIG1vZGlmaWVycyArPSAocmVnZXhwU3RyaW5nLmdsb2JhbCA/ICdnJyA6ICcnKSArXHJcbiAgICAgICAgKHJlZ2V4cFN0cmluZy5tdWx0aWxpbmUgPyAnbScgOiAnJyk7XHJcbiAgICAgIHJlZ2V4cFN0cmluZyA9IHJlZ2V4cFN0cmluZy5zb3VyY2U7XHJcbiAgICB9XHJcbiAgICByZWdleHBTdHJpbmcgPSByZWdleHBTdHJpbmcucmVwbGFjZSgvXFxcXHlcXHsoLio/KVxcfS9nLCAobWF0Y2gsIGdyb3VwKSA9PiB7XHJcbiAgICAgIHJldHVybiBrQ2FjdGJvdENhdGVnb3JpZXNbZ3JvdXAgYXMga2V5b2YgdHlwZW9mIGtDYWN0Ym90Q2F0ZWdvcmllc10gfHwgbWF0Y2g7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cFN0cmluZywgbW9kaWZpZXJzKTtcclxuICB9XHJcblxyXG4gIC8vIExpa2UgUmVnZXguUmVnZXhlcy5wYXJzZSwgYnV0IGZvcmNlIGdsb2JhbCBmbGFnLlxyXG4gIHN0YXRpYyBwYXJzZUdsb2JhbChyZWdleHBTdHJpbmc6IFJlZ0V4cCB8IHN0cmluZyk6IFJlZ0V4cCB7XHJcbiAgICBjb25zdCByZWdleCA9IFJlZ2V4ZXMucGFyc2UocmVnZXhwU3RyaW5nKTtcclxuICAgIGxldCBtb2RpZmllcnMgPSAnZ2knO1xyXG4gICAgaWYgKHJlZ2V4cFN0cmluZyBpbnN0YW5jZW9mIFJlZ0V4cClcclxuICAgICAgbW9kaWZpZXJzICs9IHJlZ2V4cFN0cmluZy5tdWx0aWxpbmUgPyAnbScgOiAnJztcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LnNvdXJjZSwgbW9kaWZpZXJzKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyB0cnVlSWZVbmRlZmluZWQodmFsdWU/OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICByZXR1cm4gISF2YWx1ZTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyB2YWxpZGF0ZVBhcmFtcyhcclxuICAgIGY6IFJlYWRvbmx5PHsgW3M6IHN0cmluZ106IHVua25vd24gfT4sXHJcbiAgICBmdW5jTmFtZTogc3RyaW5nLFxyXG4gICAgcGFyYW1zOiBSZWFkb25seTxzdHJpbmdbXT4sXHJcbiAgKTogdm9pZCB7XHJcbiAgICBpZiAoZiA9PT0gbnVsbClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKHR5cGVvZiBmICE9PSAnb2JqZWN0JylcclxuICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGYpO1xyXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xyXG4gICAgICBpZiAoIXBhcmFtcy5pbmNsdWRlcyhrZXkpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgYCR7ZnVuY05hbWV9OiBpbnZhbGlkIHBhcmFtZXRlciAnJHtrZXl9Jy4gIGAgK1xyXG4gICAgICAgICAgICBgVmFsaWQgcGFyYW1zOiAke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9YCxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5ldEZpZWxkcywgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5pbXBvcnQgeyBDYWN0Ym90QmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL25ldF90cmlnZ2VyJztcclxuXHJcbmltcG9ydCB7XHJcbiAgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgbG9nRGVmaW5pdGlvbnNWZXJzaW9ucyxcclxuICBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbiAgUGFyc2VIZWxwZXJGaWVsZHMsXHJcbiAgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnMsXHJcbiAgUmVwZWF0aW5nRmllbGRzVHlwZXMsXHJcbn0gZnJvbSAnLi9uZXRsb2dfZGVmcyc7XHJcbmltcG9ydCB7IFVucmVhY2hhYmxlQ29kZSB9IGZyb20gJy4vbm90X3JlYWNoZWQnO1xyXG5pbXBvcnQgUmVnZXhlcyBmcm9tICcuL3JlZ2V4ZXMnO1xyXG5cclxuY29uc3Qgc2VwYXJhdG9yID0gJ1xcXFx8JztcclxuY29uc3QgbWF0Y2hEZWZhdWx0ID0gJ1tefF0qJztcclxuXHJcbi8vIElmIE5ldFJlZ2V4ZXMuc2V0RmxhZ1RyYW5zbGF0aW9uc05lZWRlZCBpcyBzZXQgdG8gdHJ1ZSwgdGhlbiBhbnlcclxuLy8gcmVnZXggY3JlYXRlZCB0aGF0IHJlcXVpcmVzIGEgdHJhbnNsYXRpb24gd2lsbCBiZWdpbiB3aXRoIHRoaXMgc3RyaW5nXHJcbi8vIGFuZCBtYXRjaCB0aGUgbWFnaWNTdHJpbmdSZWdleC4gIFRoaXMgaXMgbWF5YmUgYSBiaXQgZ29vZnksIGJ1dCBpc1xyXG4vLyBhIHByZXR0eSBzdHJhaWdodGZvcndhcmQgd2F5IHRvIG1hcmsgcmVnZXhlcyBmb3IgdHJhbnNsYXRpb25zLlxyXG4vLyBJZiBpc3N1ZSAjMTMwNiBpcyBldmVyIHJlc29sdmVkLCB3ZSBjYW4gcmVtb3ZlIHRoaXMuXHJcbmNvbnN0IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgPSBgXl5gO1xyXG5jb25zdCBtYWdpY1N0cmluZ1JlZ2V4ID0gL15cXF5cXF4vO1xyXG5cclxuLy8gY2FuJ3Qgc2ltcGx5IGV4cG9ydCB0aGlzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9wdWxsLzQ5NTcjZGlzY3Vzc2lvbl9yMTAwMjU5MDU4OVxyXG5jb25zdCBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3QgPSBbXHJcbiAgJ2FiaWxpdHknLFxyXG4gICduYW1lJyxcclxuICAnc291cmNlJyxcclxuICAndGFyZ2V0JyxcclxuICAnbGluZScsXHJcbl0gYXMgY29uc3Q7XHJcbmV4cG9ydCBjb25zdCBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbjogcmVhZG9ubHkgc3RyaW5nW10gPSBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3Q7XHJcbmV4cG9ydCB0eXBlIEtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uID0gdHlwZW9mIGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdFtudW1iZXJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdhbWVMb2dDb2RlcyA9IHtcclxuICBlY2hvOiAnMDAzOCcsXHJcbiAgZGlhbG9nOiAnMDA0NCcsXHJcbiAgbWVzc2FnZTogJzA4MzknLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gU2VlIGRvY3MvTG9nR3VpZGUubWQgZm9yIG1vcmUgaW5mbyBhYm91dCB0aGVzZSBjYXRlZ29yaWVzXHJcbmV4cG9ydCBjb25zdCBhY3RvckNvbnRyb2xUeXBlID0ge1xyXG4gIHNldEFuaW1TdGF0ZTogJzAwM0UnLFxyXG4gIHB1YmxpY0NvbnRlbnRUZXh0OiAnMDgzNCcsXHJcbiAgbG9nTXNnOiAnMDIwRicsXHJcbiAgbG9nTXNnUGFyYW1zOiAnMDIxMCcsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBkZWZhdWx0UGFyYW1zID0gPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBWIGV4dGVuZHMgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4+KHR5cGU6IFQsIHZlcnNpb246IFYsIGluY2x1ZGU/OiBzdHJpbmdbXSk6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+ID0+IHtcclxuICBjb25zdCBsb2dUeXBlID0gbG9nRGVmaW5pdGlvbnNWZXJzaW9uc1t2ZXJzaW9uXVt0eXBlXTtcclxuICBpZiAoaW5jbHVkZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpbmNsdWRlID0gT2JqZWN0LmtleXMobG9nVHlwZS5maWVsZHMpO1xyXG4gICAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUpIHtcclxuICAgICAgaW5jbHVkZS5wdXNoKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHBhcmFtczoge1xyXG4gICAgW2luZGV4OiBudW1iZXJdOiB7XHJcbiAgICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICAgIHZhbHVlPzogc3RyaW5nO1xyXG4gICAgICBvcHRpb25hbDogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nPzogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgICAgIHByaW1hcnlLZXk/OiBzdHJpbmc7XHJcbiAgICAgIHBvc3NpYmxlS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICB9ID0ge307XHJcbiAgY29uc3QgZmlyc3RPcHRpb25hbEZpZWxkID0gbG9nVHlwZS5maXJzdE9wdGlvbmFsRmllbGQ7XHJcblxyXG4gIGZvciAoY29uc3QgW3Byb3AsIGluZGV4XSBvZiBPYmplY3QuZW50cmllcyhsb2dUeXBlLmZpZWxkcykpIHtcclxuICAgIGlmICghaW5jbHVkZS5pbmNsdWRlcyhwcm9wKSlcclxuICAgICAgY29udGludWU7XHJcbiAgICBjb25zdCBwYXJhbTogeyBmaWVsZDogc3RyaW5nOyB2YWx1ZT86IHN0cmluZzsgb3B0aW9uYWw6IGJvb2xlYW47IHJlcGVhdGluZz86IGJvb2xlYW4gfSA9IHtcclxuICAgICAgZmllbGQ6IHByb3AsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJiBpbmRleCA+PSBmaXJzdE9wdGlvbmFsRmllbGQsXHJcbiAgICB9O1xyXG4gICAgaWYgKHByb3AgPT09ICd0eXBlJylcclxuICAgICAgcGFyYW0udmFsdWUgPSBsb2dUeXBlLnR5cGU7XHJcblxyXG4gICAgcGFyYW1zW2luZGV4XSA9IHBhcmFtO1xyXG4gIH1cclxuXHJcbiAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUgJiYgaW5jbHVkZS5pbmNsdWRlcyhsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCkpIHtcclxuICAgIHBhcmFtc1tsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4XSA9IHtcclxuICAgICAgZmllbGQ6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsLFxyXG4gICAgICBvcHRpb25hbDogZmlyc3RPcHRpb25hbEZpZWxkICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgICAgcmVwZWF0aW5nOiB0cnVlLFxyXG4gICAgICByZXBlYXRpbmdLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubmFtZXNdLFxyXG4gICAgICBzb3J0S2V5czogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc29ydEtleXMsXHJcbiAgICAgIHByaW1hcnlLZXk6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnByaW1hcnlLZXksXHJcbiAgICAgIHBvc3NpYmxlS2V5czogWy4uLmxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnBvc3NpYmxlS2V5c10sXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBhcmFtcyBhcyBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PjtcclxufTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSB7XHJcbiAgW25hbWUgaW4gUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWyduYW1lcyddW251bWJlcl1dOlxyXG4gICAgfCBzdHJpbmdcclxuICAgIHwgc3RyaW5nW107XHJcbn1bXTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRiBleHRlbmRzIGtleW9mIE5ldEZpZWxkc1tUQmFzZV0sXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSBGIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWydsYWJlbCddXHJcbiAgPyBSZXBlYXRpbmdGaWVsZHNNYXA8VEtleT4gOlxyXG4gIG5ldmVyO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RdLFxyXG4+ID0gVCBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFQsIEY+XHJcbiAgOiBuZXZlcjtcclxuXHJcbnR5cGUgUGFyc2VIZWxwZXJUeXBlPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPVxyXG4gICYge1xyXG4gICAgW2ZpZWxkIGluIGtleW9mIE5ldEZpZWxkc1tUXV0/OiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8VCwgZmllbGQ+O1xyXG4gIH1cclxuICAmIHsgY2FwdHVyZT86IGJvb2xlYW4gfTtcclxuXHJcbmNvbnN0IGlzUmVwZWF0aW5nRmllbGQgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4+KFxyXG4gIHJlcGVhdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCxcclxuICB2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQsXHJcbik6IHZhbHVlIGlzIFJlcGVhdGluZ0ZpZWxkc01hcDxUPiA9PiB7XHJcbiAgaWYgKHJlcGVhdGluZyAhPT0gdHJ1ZSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuICAvLyBBbGxvdyBleGNsdWRpbmcgdGhlIGZpZWxkIHRvIG1hdGNoIGZvciBleHRyYWN0aW9uXHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIGZvciAoY29uc3QgZSBvZiB2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBlICE9PSAnb2JqZWN0JylcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbmNvbnN0IHBhcnNlSGVscGVyID0gPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4oXHJcbiAgcGFyYW1zOiBQYXJzZUhlbHBlclR5cGU8VD4gfCB1bmRlZmluZWQsXHJcbiAgZnVuY05hbWU6IHN0cmluZyxcclxuICBmaWVsZHM6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+LFxyXG4pOiBDYWN0Ym90QmFzZVJlZ0V4cDxUPiA9PiB7XHJcbiAgcGFyYW1zID0gcGFyYW1zID8/IHt9O1xyXG4gIGNvbnN0IHZhbGlkRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICBmb3IgKGNvbnN0IGluZGV4IGluIGZpZWxkcykge1xyXG4gICAgY29uc3QgZmllbGQgPSBmaWVsZHNbaW5kZXhdO1xyXG4gICAgaWYgKGZpZWxkKVxyXG4gICAgICB2YWxpZEZpZWxkcy5wdXNoKGZpZWxkLmZpZWxkKTtcclxuICB9XHJcblxyXG4gIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMocGFyYW1zLCBmdW5jTmFtZSwgWydjYXB0dXJlJywgLi4udmFsaWRGaWVsZHNdKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbGFzdCBrZXkgd2UgY2FyZSBhYm91dCwgc28gd2UgY2FuIHNob3J0ZW4gdGhlIHJlZ2V4IGlmIG5lZWRlZC5cclxuICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQocGFyYW1zLmNhcHR1cmUpO1xyXG4gIGNvbnN0IGZpZWxkS2V5cyA9IE9iamVjdC5rZXlzKGZpZWxkcykuc29ydCgoYSwgYikgPT4gcGFyc2VJbnQoYSkgLSBwYXJzZUludChiKSk7XHJcbiAgbGV0IG1heEtleVN0cjogc3RyaW5nO1xyXG4gIGlmIChjYXB0dXJlKSB7XHJcbiAgICBjb25zdCBrZXlzOiBFeHRyYWN0PGtleW9mIE5ldEZpZWxkc1JldmVyc2VbVF0sIHN0cmluZz5bXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKVxyXG4gICAgICBrZXlzLnB1c2goa2V5KTtcclxuICAgIGxldCB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgaWYgKHRtcEtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG1heEtleVN0ciA9IGZpZWxkS2V5c1tmaWVsZEtleXMubGVuZ3RoIC0gMV0gPz8gJzAnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUgKFxyXG4gICAgICAgIGZpZWxkc1t0bXBLZXldPy5vcHRpb25hbCAmJlxyXG4gICAgICAgICEoKGZpZWxkc1t0bXBLZXldPy5maWVsZCA/PyAnJykgaW4gcGFyYW1zKVxyXG4gICAgICApXHJcbiAgICAgICAgdG1wS2V5ID0ga2V5cy5wb3AoKTtcclxuICAgICAgbWF4S2V5U3RyID0gdG1wS2V5ID8/ICcwJztcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgbWF4S2V5U3RyID0gJzAnO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZmllbGRzW2tleV0gPz8ge307XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZHNba2V5XT8uZmllbGQ7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZE5hbWUgaW4gcGFyYW1zKVxyXG4gICAgICAgIG1heEtleVN0ciA9IGtleTtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgbWF4S2V5ID0gcGFyc2VJbnQobWF4S2V5U3RyKTtcclxuXHJcbiAgLy8gRm9yIHRlc3RpbmcsIGl0J3MgdXNlZnVsIHRvIGtub3cgaWYgdGhpcyBpcyBhIHJlZ2V4IHRoYXQgcmVxdWlyZXNcclxuICAvLyB0cmFuc2xhdGlvbi4gIFdlIHRlc3QgdGhpcyBieSBzZWVpbmcgaWYgdGhlcmUgYXJlIGFueSBzcGVjaWZpZWRcclxuICAvLyBmaWVsZHMsIGFuZCBpZiBzbywgaW5zZXJ0aW5nIGEgbWFnaWMgc3RyaW5nIHRoYXQgd2UgY2FuIGRldGVjdC5cclxuICAvLyBUaGlzIGxldHMgdXMgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIFwicmVnZXggdGhhdCBzaG91bGQgYmUgdHJhbnNsYXRlZFwiXHJcbiAgLy8gZS5nLiBhIHJlZ2V4IHdpdGggYHRhcmdldGAgc3BlY2lmaWVkLCBhbmQgXCJyZWdleCB0aGF0IHNob3VsZG4ndFwiXHJcbiAgLy8gZS5nLiBhIGdhaW5zIGVmZmVjdCB3aXRoIGp1c3QgZWZmZWN0SWQgc3BlY2lmaWVkLlxyXG4gIGNvbnN0IHRyYW5zUGFyYW1zID0gT2JqZWN0LmtleXMocGFyYW1zKS5maWx0ZXIoKGspID0+IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uLmluY2x1ZGVzKGspKTtcclxuICBjb25zdCBuZWVkc1RyYW5zbGF0aW9ucyA9IE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCAmJiB0cmFuc1BhcmFtcy5sZW5ndGggPiAwO1xyXG5cclxuICAvLyBCdWlsZCB0aGUgcmVnZXggZnJvbSB0aGUgZmllbGRzLlxyXG4gIGxldCBzdHIgPSBuZWVkc1RyYW5zbGF0aW9ucyA/IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgOiAnXic7XHJcbiAgbGV0IGxhc3RLZXkgPSAtMTtcclxuICBmb3IgKGNvbnN0IGtleVN0ciBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IGtleSA9IHBhcnNlSW50KGtleVN0cik7XHJcbiAgICAvLyBGaWxsIGluIGJsYW5rcy5cclxuICAgIGNvbnN0IG1pc3NpbmdGaWVsZHMgPSBrZXkgLSBsYXN0S2V5IC0gMTtcclxuICAgIGlmIChtaXNzaW5nRmllbGRzID09PSAxKVxyXG4gICAgICBzdHIgKz0gJ1xcXFx5e05ldEZpZWxkfSc7XHJcbiAgICBlbHNlIGlmIChtaXNzaW5nRmllbGRzID4gMSlcclxuICAgICAgc3RyICs9IGBcXFxceXtOZXRGaWVsZH17JHttaXNzaW5nRmllbGRzfX1gO1xyXG4gICAgbGFzdEtleSA9IGtleTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGZpZWxkc1trZXlTdHJdO1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtmdW5jTmFtZX06IGludmFsaWQgdmFsdWU6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xyXG5cclxuICAgIGNvbnN0IGZpZWxkTmFtZSA9IHZhbHVlLmZpZWxkO1xyXG4gICAgY29uc3QgZGVmYXVsdEZpZWxkVmFsdWUgPSB2YWx1ZS52YWx1ZT8udG9TdHJpbmcoKSA/PyBtYXRjaERlZmF1bHQ7XHJcbiAgICBjb25zdCBmaWVsZFZhbHVlID0gcGFyYW1zW2ZpZWxkTmFtZV07XHJcblxyXG4gICAgaWYgKGlzUmVwZWF0aW5nRmllbGQoZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZywgZmllbGRWYWx1ZSkpIHtcclxuICAgICAgbGV0IHJlcGVhdGluZ0FycmF5OiBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQgPSBmaWVsZFZhbHVlO1xyXG5cclxuICAgICAgY29uc3Qgc29ydEtleXMgPSBmaWVsZHNba2V5U3RyXT8uc29ydEtleXM7XHJcbiAgICAgIGNvbnN0IHByaW1hcnlLZXkgPSBmaWVsZHNba2V5U3RyXT8ucHJpbWFyeUtleTtcclxuICAgICAgY29uc3QgcG9zc2libGVLZXlzID0gZmllbGRzW2tleVN0cl0/LnBvc3NpYmxlS2V5cztcclxuXHJcbiAgICAgIC8vIHByaW1hcnlLZXkgaXMgcmVxdWlyZWQgaWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBwZXIgdHlwZWRlZiBpbiBuZXRsb2dfZGVmcy50c1xyXG4gICAgICAvLyBTYW1lIHdpdGggcG9zc2libGVLZXlzXHJcbiAgICAgIGlmIChwcmltYXJ5S2V5ID09PSB1bmRlZmluZWQgfHwgcG9zc2libGVLZXlzID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG5cclxuICAgICAgLy8gQWxsb3cgc29ydGluZyBpZiBuZWVkZWRcclxuICAgICAgaWYgKHNvcnRLZXlzKSB7XHJcbiAgICAgICAgLy8gQWxzbyBzb3J0IG91ciB2YWxpZCBrZXlzIGxpc3RcclxuICAgICAgICBwb3NzaWJsZUtleXMuc29ydCgobGVmdCwgcmlnaHQpID0+IGxlZnQudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0LnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICBpZiAocmVwZWF0aW5nQXJyYXkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgcmVwZWF0aW5nQXJyYXkgPSBbLi4ucmVwZWF0aW5nQXJyYXldLnNvcnQoXHJcbiAgICAgICAgICAgIChsZWZ0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcmlnaHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogbnVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAvLyBXZSBjaGVjayB0aGUgdmFsaWRpdHkgb2YgbGVmdC9yaWdodCBiZWNhdXNlIHRoZXkncmUgdXNlci1zdXBwbGllZFxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdCAhPT0gJ29iamVjdCcgfHwgbGVmdFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgbGVmdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgbGVmdFZhbHVlID0gbGVmdFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMobGVmdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHQgIT09ICdvYmplY3QnIHx8IHJpZ2h0W3ByaW1hcnlLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgcmlnaHRWYWx1ZSA9IHJpZ2h0W3ByaW1hcnlLZXldO1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMocmlnaHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxlZnRWYWx1ZS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUocmlnaHRWYWx1ZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbm9uUmVwczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfVtdIHwgdW5kZWZpbmVkID0gcmVwZWF0aW5nQXJyYXk7XHJcbiAgICAgIC8vIExvb3Agb3ZlciBvdXIgcG9zc2libGUga2V5c1xyXG4gICAgICAvLyBCdWlsZCBhIHJlZ2V4IHRoYXQgY2FuIG1hdGNoIGFueSBwb3NzaWJsZSBrZXkgd2l0aCByZXF1aXJlZCB2YWx1ZXMgc3Vic3RpdHV0ZWQgaW5cclxuICAgICAgcG9zc2libGVLZXlzLmZvckVhY2goKHBvc3NpYmxlS2V5KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVwID0gYW5vblJlcHM/LmZpbmQoKHJlcCkgPT4gcHJpbWFyeUtleSBpbiByZXAgJiYgcmVwW3ByaW1hcnlLZXldID09PSBwb3NzaWJsZUtleSk7XHJcblxyXG4gICAgICAgIGxldCBmaWVsZFJlZ2V4ID0gJyc7XHJcbiAgICAgICAgLy8gUmF0aGVyIHRoYW4gbG9vcGluZyBvdmVyIHRoZSBrZXlzIGRlZmluZWQgb24gdGhlIG9iamVjdCxcclxuICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGJhc2UgdHlwZSBkZWYncyBrZXlzLiBUaGlzIGVuZm9yY2VzIHRoZSBjb3JyZWN0IG9yZGVyLlxyXG4gICAgICAgIGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmdLZXlzPy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgIGxldCB2YWwgPSByZXA/LltrZXldO1xyXG4gICAgICAgICAgaWYgKHJlcCA9PT0gdW5kZWZpbmVkIHx8ICEoa2V5IGluIHJlcCkpIHtcclxuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbHVlIGZvciB0aGlzIGtleVxyXG4gICAgICAgICAgICAvLyBpbnNlcnQgYSBwbGFjZWhvbGRlciwgdW5sZXNzIGl0J3MgdGhlIHByaW1hcnkga2V5XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHByaW1hcnlLZXkpXHJcbiAgICAgICAgICAgICAgdmFsID0gcG9zc2libGVLZXk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbCkpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwubGVuZ3RoIDwgMSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbC5zb21lKCh2KSA9PiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpZWxkUmVnZXggKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAgIGtleSA9PT0gcHJpbWFyeUtleSA/IGZhbHNlIDogY2FwdHVyZSxcclxuICAgICAgICAgICAgLy8gQWxsIGNhcHR1cmluZyBncm91cHMgYXJlIGBmaWVsZE5hbWVgICsgYHBvc3NpYmxlS2V5YCwgZS5nLiBgcGFpcklzQ2FzdGluZzFgXHJcbiAgICAgICAgICAgIGZpZWxkTmFtZSArIHBvc3NpYmxlS2V5LFxyXG4gICAgICAgICAgICB2YWwsXHJcbiAgICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICAgKSArXHJcbiAgICAgICAgICAgIHNlcGFyYXRvcjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGZpZWxkUmVnZXgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgc3RyICs9IGAoPzoke2ZpZWxkUmVnZXh9KSR7cmVwICE9PSB1bmRlZmluZWQgPyAnJyA6ICc/J31gO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmcpIHtcclxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBidXQgdGhlIGFjdHVhbCB2YWx1ZSBpcyBlbXB0eSBvciBvdGhlcndpc2UgaW52YWxpZCxcclxuICAgICAgLy8gZG9uJ3QgcHJvY2VzcyBmdXJ0aGVyLiBXZSBjYW4ndCB1c2UgYGNvbnRpbnVlYCBpbiB0aGUgYWJvdmUgYmxvY2sgYmVjYXVzZSB0aGF0XHJcbiAgICAgIC8vIHdvdWxkIHNraXAgdGhlIGVhcmx5LW91dCBicmVhayBhdCB0aGUgZW5kIG9mIHRoZSBsb29wLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc3RyICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgLy8gbW9yZSBhY2N1cmF0ZSB0eXBlIGluc3RlYWQgb2YgYGFzYCBjYXN0XHJcbiAgICAgICAgICAvLyBtYXliZSB0aGlzIGZ1bmN0aW9uIG5lZWRzIGEgcmVmYWN0b3JpbmdcclxuICAgICAgICAgIGNhcHR1cmUsXHJcbiAgICAgICAgICBmaWVsZE5hbWUsXHJcbiAgICAgICAgICBmaWVsZFZhbHVlLFxyXG4gICAgICAgICAgZGVmYXVsdEZpZWxkVmFsdWUsXHJcbiAgICAgICAgKSArXHJcbiAgICAgICAgICBzZXBhcmF0b3I7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RyICs9IGRlZmF1bHRGaWVsZFZhbHVlICsgc2VwYXJhdG9yO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcCBpZiB3ZSdyZSBub3QgY2FwdHVyaW5nIGFuZCBkb24ndCBjYXJlIGFib3V0IGZ1dHVyZSBmaWVsZHMuXHJcbiAgICBpZiAoa2V5ID49IG1heEtleSlcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cikgYXMgQ2FjdGJvdEJhc2VSZWdFeHA8VD47XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgYnVpbGRSZWdleCA9IDxUIGV4dGVuZHMga2V5b2YgTmV0UGFyYW1zPihcclxuICB0eXBlOiBULFxyXG4gIHBhcmFtcz86IFBhcnNlSGVscGVyVHlwZTxUPixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsIHR5cGUsIGRlZmF1bHRQYXJhbXModHlwZSwgTmV0UmVnZXhlcy5sb2dWZXJzaW9uKSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXRSZWdleGVzIHtcclxuICBzdGF0aWMgbG9nVmVyc2lvbjogTG9nRGVmaW5pdGlvblZlcnNpb25zID0gJ2xhdGVzdCc7XHJcblxyXG4gIHN0YXRpYyBmbGFnVHJhbnNsYXRpb25zTmVlZGVkID0gZmFsc2U7XHJcbiAgc3RhdGljIHNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWQodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCA9IHZhbHVlO1xyXG4gIH1cclxuICBzdGF0aWMgZG9lc05ldFJlZ2V4TmVlZFRyYW5zbGF0aW9uKHJlZ2V4OiBSZWdFeHAgfCBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIC8vIE5lZWQgdG8gYHNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWRgIGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICBjb25zb2xlLmFzc2VydChOZXRSZWdleGVzLmZsYWdUcmFuc2xhdGlvbnNOZWVkZWQpO1xyXG4gICAgY29uc3Qgc3RyID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IHJlZ2V4IDogcmVnZXguc291cmNlO1xyXG4gICAgcmV0dXJuICEhbWFnaWNTdHJpbmdSZWdleC5leGVjKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjAtMHgxNC1uZXR3b3Jrc3RhcnRzY2FzdGluZ1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXJ0c1VzaW5nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhcnRzVXNpbmcnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmcnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5KHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnQWJpbGl0eScsIHtcclxuICAgICAgLi4uZGVmYXVsdFBhcmFtcygnQWJpbGl0eScsIE5ldFJlZ2V4ZXMubG9nVmVyc2lvbiksXHJcbiAgICAgIC8vIE92ZXJyaWRlIHR5cGVcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzJbMTJdJywgb3B0aW9uYWw6IGZhbHNlIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMS0weDE1LW5ldHdvcmthYmlsaXR5XHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIyLTB4MTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKlxyXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgYWJpbGl0eWAgaW5zdGVhZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RnVsbChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHknXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5Jz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYWJpbGl0eShwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3LTB4MWItbmV0d29ya3RhcmdldGljb24taGVhZC1tYXJrZXJcclxuICAgKi9cclxuICBzdGF0aWMgaGVhZE1hcmtlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0hlYWRNYXJrZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdIZWFkTWFya2VyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0hlYWRNYXJrZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50KHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBZGRlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnQWRkZWRDb21iYXRhbnQnLFxyXG4gICAgICBkZWZhdWx0UGFyYW1zKCdBZGRlZENvbWJhdGFudCcsIE5ldFJlZ2V4ZXMubG9nVmVyc2lvbiksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBhZGRlZENvbWJhdGFudGAgaW5zdGVhZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudEZ1bGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FkZGVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnQocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wNC0weDA0LXJlbW92ZWNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmluZ0NvbWJhdGFudChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snUmVtb3ZlZENvbWJhdGFudCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdSZW1vdmVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1JlbW92ZWRDb21iYXRhbnQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2LTB4MWEtbmV0d29ya2J1ZmZcclxuICAgKi9cclxuICBzdGF0aWMgZ2FpbnNFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydHYWluc0VmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhaW5zRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0dhaW5zRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZWZlciBnYWluc0VmZmVjdCBvdmVyIHRoaXMgZnVuY3Rpb24gdW5sZXNzIHlvdSByZWFsbHkgbmVlZCBleHRyYSBkYXRhLlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zOC0weDI2LW5ldHdvcmtzdGF0dXNlZmZlY3RzXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXR1c0VmZmVjdEV4cGxpY2l0KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGF0dXNFZmZlY3QnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhdHVzRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXR1c0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzAtMHgxZS1uZXR3b3JrYnVmZnJlbW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsb3Nlc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0xvc2VzRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTG9zZXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTG9zZXNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM1LTB4MjMtbmV0d29ya3RldGhlclxyXG4gICAqL1xyXG4gIHN0YXRpYyB0ZXRoZXIocGFyYW1zPzogTmV0UGFyYW1zWydUZXRoZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdUZXRoZXInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnVGV0aGVyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICd0YXJnZXQnIHdhcyBkZWZlYXRlZCBieSAnc291cmNlJ1xyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNS0weDE5LW5ldHdvcmtkZWF0aFxyXG4gICAqL1xyXG4gIHN0YXRpYyB3YXNEZWZlYXRlZChwYXJhbXM/OiBOZXRQYXJhbXNbJ1dhc0RlZmVhdGVkJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnV2FzRGVmZWF0ZWQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnV2FzRGVmZWF0ZWQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI0LTB4MTgtbmV0d29ya2RvdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrRG9UKHBhcmFtcz86IE5ldFBhcmFtc1snTmV0d29ya0RvVCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05ldHdvcmtEb1QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTmV0d29ya0RvVCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGVjaG8ocGFyYW1zPzogT21pdDxOZXRQYXJhbXNbJ0dhbWVMb2cnXSwgJ2NvZGUnPik6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ0VjaG8nLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyh7IC4uLnBhcmFtcywgY29kZTogZ2FtZUxvZ0NvZGVzLmVjaG8gfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGRpYWxvZyhwYXJhbXM/OiBPbWl0PE5ldFBhcmFtc1snR2FtZUxvZyddLCAnY29kZSc+KTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnRGlhbG9nJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2coeyAuLi5wYXJhbXMsIGNvZGU6IGdhbWVMb2dDb2Rlcy5kaWFsb2cgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIG1lc3NhZ2UocGFyYW1zPzogT21pdDxOZXRQYXJhbXNbJ0dhbWVMb2cnXSwgJ2NvZGUnPik6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ01lc3NhZ2UnLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyh7IC4uLnBhcmFtcywgY29kZTogZ2FtZUxvZ0NvZGVzLm1lc3NhZ2UgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIG5hbWUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYW1lTG9nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZU5hbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTEyLTB4MGMtcGxheWVyc3RhdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdENoYW5nZShwYXJhbXM/OiBOZXRQYXJhbXNbJ1BsYXllclN0YXRzJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUGxheWVyU3RhdHMnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUGxheWVyU3RhdHMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAxLTB4MDEtY2hhbmdlem9uZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaGFuZ2Vab25lKHBhcmFtcz86IE5ldFBhcmFtc1snQ2hhbmdlWm9uZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NoYW5nZVpvbmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ2hhbmdlWm9uZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzMtMHgyMS1uZXR3b3JrNmQtYWN0b3ItY29udHJvbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrNmQocGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2wnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2wnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNC0weDIyLW5ldHdvcmtuYW1ldG9nZ2xlXHJcbiAgICovXHJcbiAgc3RhdGljIG5hbWVUb2dnbGUocGFyYW1zPzogTmV0UGFyYW1zWydOYW1lVG9nZ2xlJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmFtZVRvZ2dsZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOYW1lVG9nZ2xlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MC0weDI4LW1hcFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXAocGFyYW1zPzogTmV0UGFyYW1zWydNYXAnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXAnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MS0weDI5LXN5c3RlbWxvZ21lc3NhZ2VcclxuICAgKi9cclxuICBzdGF0aWMgc3lzdGVtTG9nTWVzc2FnZShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3lzdGVtTG9nTWVzc2FnZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTeXN0ZW1Mb2dNZXNzYWdlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N5c3RlbUxvZ01lc3NhZ2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1Ny0weDEwMS1tYXBlZmZlY3RcclxuICAgKi9cclxuICBzdGF0aWMgbWFwRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTWFwRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcEVmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU4LTB4MTAyLWZhdGVkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBmYXRlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydGYXRlRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdGYXRlRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnRmF0ZURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTktMHgxMDMtY2VkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBjZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snQ0VEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NFRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ0VEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYwLTB4MTA0LWluY29tYmF0XHJcbiAgICovXHJcbiAgc3RhdGljIGluQ29tYmF0KHBhcmFtcz86IE5ldFBhcmFtc1snSW5Db21iYXQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdJbkNvbWJhdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdJbkNvbWJhdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYxLTB4MTA1LWNvbWJhdGFudG1lbW9yeVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb21iYXRhbnRNZW1vcnkoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbWJhdGFudE1lbW9yeSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb21iYXRhbnRNZW1vcnknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29tYmF0YW50TWVtb3J5JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjItMHgxMDYtcnN2ZGF0YVxyXG4gICAqL1xyXG4gIHN0YXRpYyByc3ZEYXRhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydSU1ZEYXRhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1JTVkRhdGEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUlNWRGF0YScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYzLTB4MTA3LXN0YXJ0c3VzaW5nZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3RhcnRzVXNpbmdFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3RhcnRzVXNpbmdFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGFydHNVc2luZ0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXJ0c1VzaW5nRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2NC0weDEwOC1hYmlsaXR5ZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5RXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eUV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FiaWxpdHlFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY1LTB4MTA5LWNvbnRlbnRmaW5kZXJzZXR0aW5nc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBjb250ZW50RmluZGVyU2V0dGluZ3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbnRlbnRGaW5kZXJTZXR0aW5ncyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb250ZW50RmluZGVyU2V0dGluZ3MnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29udGVudEZpbmRlclNldHRpbmdzJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjYtMHgxMGEtbnBjeWVsbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBucGNZZWxsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydOcGNZZWxsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05wY1llbGwnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTnBjWWVsbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY3LTB4MTBiLWJhdHRsZXRhbGsyXHJcbiAgICovXHJcbiAgc3RhdGljIGJhdHRsZVRhbGsyKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydCYXR0bGVUYWxrMiddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdCYXR0bGVUYWxrMic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdCYXR0bGVUYWxrMicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY4LTB4MTBjLWNvdW50ZG93blxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb3VudGRvd24oXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvdW50ZG93biddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb3VudGRvd24nPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ291bnRkb3duJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjktMHgxMGQtY291bnRkb3duY2FuY2VsXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bkNhbmNlbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duQ2FuY2VsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bkNhbmNlbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd25DYW5jZWwnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3MC0weDEwZS1hY3Rvcm1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JNb3ZlKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3Rvck1vdmUnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JNb3ZlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yTW92ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcxLTB4MTBmLWFjdG9yc2V0cG9zXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yU2V0UG9zKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvclNldFBvcyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvclNldFBvcyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvclNldFBvcycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcyLTB4MTEwLXNwYXdubnBjZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3Bhd25OcGNFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3Bhd25OcGNFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTcGF3bk5wY0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1NwYXduTnBjRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3My0weDExMS1hY3RvcmNvbnRyb2xleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3NC0weDExMi1hY3RvcmNvbnRyb2xzZWxmZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JDb250cm9sU2VsZkV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xTZWxmRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sU2VsZkV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbFNlbGZFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29tbW9uTmV0UmVnZXggPSB7XHJcbiAgLy8gVE9ETyg2LjIpOiByZW1vdmUgNDAwMDAwMTAgYWZ0ZXIgZXZlcnlib2R5IGlzIG9uIDYuMi5cclxuICAvLyBUT0RPOiBvciBtYXliZSBrZWVwIGFyb3VuZCBmb3IgcGxheWluZyBvbGQgbG9nIGZpbGVzPz9cclxuICB3aXBlOiBOZXRSZWdleGVzLm5ldHdvcms2ZCh7IGNvbW1hbmQ6IFsnNDAwMDAwMTAnLCAnNDAwMDAwMEYnXSB9KSxcclxuICBjYWN0Ym90V2lwZUVjaG86IE5ldFJlZ2V4ZXMuZWNobyh7IGxpbmU6ICdjYWN0Ym90IHdpcGUuKj8nIH0pLFxyXG4gIHVzZXJXaXBlRWNobzogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ2VuZCcgfSksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgY29uc3QgYnVpbGROZXRSZWdleEZvclRyaWdnZXIgPSA8VCBleHRlbmRzIGtleW9mIE5ldFBhcmFtcz4oXHJcbiAgdHlwZTogVCxcclxuICBwYXJhbXM/OiBOZXRQYXJhbXNbVF0sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICBpZiAodHlwZSA9PT0gJ0FiaWxpdHknKVxyXG4gICAgLy8gdHMgY2FuJ3QgbmFycm93IFQgdG8gYEFiaWxpdHlgIGhlcmUsIG5lZWQgY2FzdGluZy5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmFiaWxpdHkocGFyYW1zKSBhcyBDYWN0Ym90QmFzZVJlZ0V4cDxUPjtcclxuXHJcbiAgcmV0dXJuIGJ1aWxkUmVnZXg8VD4odHlwZSwgcGFyYW1zKTtcclxufTtcclxuIiwiLy8gT3ZlcmxheVBsdWdpbiBBUEkgc2V0dXBcclxuXHJcbmltcG9ydCB7XHJcbiAgRXZlbnRNYXAsXHJcbiAgRXZlbnRUeXBlLFxyXG4gIElPdmVybGF5SGFuZGxlcixcclxuICBPdmVybGF5SGFuZGxlckZ1bmNzLFxyXG4gIE92ZXJsYXlIYW5kbGVyVHlwZXMsXHJcbn0gZnJvbSAnLi4vdHlwZXMvZXZlbnQnO1xyXG5cclxudHlwZSBCYXNlUmVzcG9uc2UgPSB7IHJzZXE/OiBudW1iZXI7ICckZXJyb3InPzogYm9vbGVhbiB9O1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgX19PdmVybGF5Q2FsbGJhY2s6IEV2ZW50TWFwW0V2ZW50VHlwZV07XHJcbiAgICBkaXNwYXRjaE92ZXJsYXlFdmVudD86IHR5cGVvZiBwcm9jZXNzRXZlbnQ7XHJcbiAgICBPdmVybGF5UGx1Z2luQXBpOiB7XHJcbiAgICAgIHJlYWR5OiBib29sZWFuO1xyXG4gICAgICBjYWxsSGFuZGxlcjogKG1zZzogc3RyaW5nLCBjYj86ICh2YWx1ZTogc3RyaW5nKSA9PiB1bmtub3duKSA9PiB2b2lkO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBJdCBpcyByZWNvbW1lbmRlZCB0byBpbXBvcnQgZnJvbSB0aGlzIGZpbGU6XHJcbiAgICAgKlxyXG4gICAgICogYGltcG9ydCB7IGFkZE92ZXJsYXlMaXN0ZW5lciB9IGZyb20gJy9wYXRoL3RvL292ZXJsYXlfcGx1Z2luX2FwaSc7YFxyXG4gICAgICovXHJcbiAgICBhZGRPdmVybGF5TGlzdGVuZXI6IElBZGRPdmVybGF5TGlzdGVuZXI7XHJcbiAgICAvKipcclxuICAgICAqIEBkZXByZWNhdGVkIFRoaXMgaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgcmVjb21tZW5kZWQgdG8gaW1wb3J0IGZyb20gdGhpcyBmaWxlOlxyXG4gICAgICpcclxuICAgICAqIGBpbXBvcnQgeyByZW1vdmVPdmVybGF5TGlzdGVuZXIgfSBmcm9tICcvcGF0aC90by9vdmVybGF5X3BsdWdpbl9hcGknO2BcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlT3ZlcmxheUxpc3RlbmVyOiBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEl0IGlzIHJlY29tbWVuZGVkIHRvIGltcG9ydCBmcm9tIHRoaXMgZmlsZTpcclxuICAgICAqXHJcbiAgICAgKiBgaW1wb3J0IHsgY2FsbE92ZXJsYXlIYW5kbGVyIH0gZnJvbSAnL3BhdGgvdG8vb3ZlcmxheV9wbHVnaW5fYXBpJztgXHJcbiAgICAgKi9cclxuICAgIGNhbGxPdmVybGF5SGFuZGxlcjogSU92ZXJsYXlIYW5kbGVyO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBJQWRkT3ZlcmxheUxpc3RlbmVyID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KGV2ZW50OiBULCBjYjogRXZlbnRNYXBbVF0pID0+IHZvaWQ7XHJcbnR5cGUgSVJlbW92ZU92ZXJsYXlMaXN0ZW5lciA9IDxUIGV4dGVuZHMgRXZlbnRUeXBlPihldmVudDogVCwgY2I6IEV2ZW50TWFwW1RdKSA9PiB2b2lkO1xyXG5cclxudHlwZSBTdWJzY3JpYmVyPFQ+ID0ge1xyXG4gIFtrZXkgaW4gRXZlbnRUeXBlXT86IFRbXTtcclxufTtcclxudHlwZSBFdmVudFBhcmFtZXRlciA9IFBhcmFtZXRlcnM8RXZlbnRNYXBbRXZlbnRUeXBlXT5bMF07XHJcbnR5cGUgVm9pZEZ1bmM8VD4gPSAoLi4uYXJnczogVFtdKSA9PiB2b2lkO1xyXG5cclxubGV0IGluaXRlZCA9IGZhbHNlO1xyXG5cclxubGV0IHdzVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IHdzOiBXZWJTb2NrZXQgfCBudWxsID0gbnVsbDtcclxubGV0IHF1ZXVlOiAoXHJcbiAgfCB7IFtzOiBzdHJpbmddOiB1bmtub3duIH1cclxuICB8IFt7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sICgodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHVua25vd24pIHwgdW5kZWZpbmVkXVxyXG4pW10gfCBudWxsID0gW107XHJcbmxldCByc2VxQ291bnRlciA9IDA7XHJcbnR5cGUgUHJvbWlzZUZ1bmNzID0ge1xyXG4gIHJlc29sdmU6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZDtcclxuICByZWplY3Q6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZDtcclxufTtcclxuY29uc3QgcmVzcG9uc2VQcm9taXNlczogeyBbcnNlcUlkeDogbnVtYmVyXTogUHJvbWlzZUZ1bmNzIH0gPSB7fTtcclxuXHJcbmNvbnN0IHN1YnNjcmliZXJzOiBTdWJzY3JpYmVyPFZvaWRGdW5jPHVua25vd24+PiA9IHt9O1xyXG5cclxuY29uc3Qgc2VuZE1lc3NhZ2UgPSAoXHJcbiAgbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgY2I/OiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHVua25vd24sXHJcbik6IHZvaWQgPT4ge1xyXG4gIGlmICh3cykge1xyXG4gICAgaWYgKHF1ZXVlKVxyXG4gICAgICBxdWV1ZS5wdXNoKG1zZyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChxdWV1ZSlcclxuICAgICAgcXVldWUucHVzaChbbXNnLCBjYl0pO1xyXG4gICAgZWxzZVxyXG4gICAgICB3aW5kb3cuT3ZlcmxheVBsdWdpbkFwaS5jYWxsSGFuZGxlcihKU09OLnN0cmluZ2lmeShtc2cpLCBjYik7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0V2ZW50ID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KG1zZzogUGFyYW1ldGVyczxFdmVudE1hcFtUXT5bMF0pOiB2b2lkID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGNvbnN0IHN1YnMgPSBzdWJzY3JpYmVyc1ttc2cudHlwZV07XHJcbiAgc3Vicz8uZm9yRWFjaCgoc3ViKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzdWIobXNnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkaXNwYXRjaE92ZXJsYXlFdmVudCA9IHByb2Nlc3NFdmVudDtcclxuXHJcbmV4cG9ydCBjb25zdCBhZGRPdmVybGF5TGlzdGVuZXI6IElBZGRPdmVybGF5TGlzdGVuZXIgPSAoZXZlbnQsIGNiKTogdm9pZCA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICBpZiAoIXN1YnNjcmliZXJzW2V2ZW50XSkge1xyXG4gICAgc3Vic2NyaWJlcnNbZXZlbnRdID0gW107XHJcblxyXG4gICAgaWYgKCFxdWV1ZSkge1xyXG4gICAgICBzZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgY2FsbDogJ3N1YnNjcmliZScsXHJcbiAgICAgICAgZXZlbnRzOiBbZXZlbnRdLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN1YnNjcmliZXJzW2V2ZW50XT8ucHVzaChjYiBhcyBWb2lkRnVuYzx1bmtub3duPik7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcmVtb3ZlT3ZlcmxheUxpc3RlbmVyOiBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gKGV2ZW50LCBjYik6IHZvaWQgPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgaWYgKHN1YnNjcmliZXJzW2V2ZW50XSkge1xyXG4gICAgY29uc3QgbGlzdCA9IHN1YnNjcmliZXJzW2V2ZW50XTtcclxuICAgIGNvbnN0IHBvcyA9IGxpc3Q/LmluZGV4T2YoY2IgYXMgVm9pZEZ1bmM8dW5rbm93bj4pO1xyXG5cclxuICAgIGlmIChwb3MgIT09IHVuZGVmaW5lZCAmJiBwb3MgPiAtMSlcclxuICAgICAgbGlzdD8uc3BsaWNlKHBvcywgMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVySW50ZXJuYWw6IElPdmVybGF5SGFuZGxlciA9IChcclxuICBfbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGNvbnN0IG1zZyA9IHtcclxuICAgIC4uLl9tc2csXHJcbiAgICByc2VxOiAwLFxyXG4gIH07XHJcbiAgbGV0IHA6IFByb21pc2U8dW5rbm93bj47XHJcblxyXG4gIGlmICh3cykge1xyXG4gICAgbXNnLnJzZXEgPSByc2VxQ291bnRlcisrO1xyXG4gICAgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgcmVzcG9uc2VQcm9taXNlc1ttc2cucnNlcV0gPSB7IHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0IH07XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZW5kTWVzc2FnZShtc2cpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBwID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBzZW5kTWVzc2FnZShtc2csIChkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSkgYXMgQmFzZVJlc3BvbnNlO1xyXG4gICAgICAgIGlmIChwYXJzZWRbJyRlcnJvciddKVxyXG4gICAgICAgICAgcmVqZWN0KHBhcnNlZCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmVzb2x2ZShwYXJzZWQpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHA7XHJcbn07XHJcblxyXG50eXBlIE92ZXJyaWRlTWFwID0geyBbY2FsbCBpbiBPdmVybGF5SGFuZGxlclR5cGVzXT86IE92ZXJsYXlIYW5kbGVyRnVuY3NbY2FsbF0gfTtcclxuY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXA6IE92ZXJyaWRlTWFwID0ge307XHJcblxyXG5leHBvcnQgY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVyOiBJT3ZlcmxheUhhbmRsZXIgPSAoXHJcbiAgX21zZzogeyBbczogc3RyaW5nXTogdW5rbm93biB9LFxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbik6IFByb21pc2U8YW55PiA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICAvLyBJZiB0aGlzIGBhc2AgaXMgaW5jb3JyZWN0LCB0aGVuIGl0IHdpbGwgbm90IGZpbmQgYW4gb3ZlcnJpZGUuXHJcbiAgLy8gVE9ETzogd2UgY291bGQgYWxzbyByZXBsYWNlIHRoaXMgd2l0aCBhIHR5cGUgZ3VhcmQuXHJcbiAgY29uc3QgdHlwZSA9IF9tc2cuY2FsbCBhcyBrZXlvZiBPdmVycmlkZU1hcDtcclxuICBjb25zdCBjYWxsRnVuYyA9IGNhbGxPdmVybGF5SGFuZGxlck92ZXJyaWRlTWFwW3R5cGVdID8/IGNhbGxPdmVybGF5SGFuZGxlckludGVybmFsO1xyXG5cclxuICAvLyBUaGUgYElPdmVybGF5SGFuZGxlcmAgdHlwZSBndWFyYW50ZWVzIHRoYXQgcGFyYW1ldGVycy9yZXR1cm4gdHlwZSBtYXRjaFxyXG4gIC8vIG9uZSBvZiB0aGUgb3ZlcmxheSBoYW5kbGVycy4gIFRoZSBPdmVycmlkZU1hcCBhbHNvIG9ubHkgc3RvcmVzIGZ1bmN0aW9uc1xyXG4gIC8vIHRoYXQgbWF0Y2ggYnkgdGhlIGRpc2NyaW1pbmF0aW5nIGBjYWxsYCBmaWVsZCwgYW5kIHNvIGFueSBvdmVycmlkZXNcclxuICAvLyBzaG91bGQgYmUgY29ycmVjdCBoZXJlLlxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnksQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hcmd1bWVudFxyXG4gIHJldHVybiBjYWxsRnVuYyhfbXNnIGFzIGFueSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0T3ZlcmxheUhhbmRsZXJPdmVycmlkZSA9IDxUIGV4dGVuZHMga2V5b2YgT3ZlcmxheUhhbmRsZXJGdW5jcz4oXHJcbiAgdHlwZTogVCxcclxuICBvdmVycmlkZT86IE92ZXJsYXlIYW5kbGVyRnVuY3NbVF0sXHJcbik6IHZvaWQgPT4ge1xyXG4gIGlmICghb3ZlcnJpZGUpIHtcclxuICAgIGRlbGV0ZSBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcFt0eXBlXTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXBbdHlwZV0gPSBvdmVycmlkZTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBpbml0ID0gKCk6IHZvaWQgPT4ge1xyXG4gIGlmIChpbml0ZWQpXHJcbiAgICByZXR1cm47XHJcblxyXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd3NVcmwgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldCgnT1ZFUkxBWV9XUycpO1xyXG4gICAgaWYgKHdzVXJsICE9PSBudWxsKSB7XHJcbiAgICAgIGNvbnN0IGNvbm5lY3RXcyA9IGZ1bmN0aW9uKHdzVXJsOiBzdHJpbmcpIHtcclxuICAgICAgICB3cyA9IG5ldyBXZWJTb2NrZXQod3NVcmwpO1xyXG5cclxuICAgICAgICB3cy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB3cy5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgKCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCEnKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBxID0gcXVldWUgPz8gW107XHJcbiAgICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBjYWxsOiAnc3Vic2NyaWJlJyxcclxuICAgICAgICAgICAgZXZlbnRzOiBPYmplY3Qua2V5cyhzdWJzY3JpYmVycyksXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IG1zZyBvZiBxKSB7XHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShtc2cpKVxyXG4gICAgICAgICAgICAgIHNlbmRNZXNzYWdlKG1zZyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoX21zZykgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfbXNnLmRhdGEgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBtZXNzYWdlIGRhdGEgcmVjZWl2ZWQ6ICcsIF9tc2cpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBtc2cgPSBKU09OLnBhcnNlKF9tc2cuZGF0YSkgYXMgRXZlbnRQYXJhbWV0ZXIgJiBCYXNlUmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwcm9taXNlRnVuY3MgPSBtc2c/LnJzZXEgIT09IHVuZGVmaW5lZCA/IHJlc3BvbnNlUHJvbWlzZXNbbXNnLnJzZXFdIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAobXNnLnJzZXEgIT09IHVuZGVmaW5lZCAmJiBwcm9taXNlRnVuY3MpIHtcclxuICAgICAgICAgICAgICBpZiAobXNnWyckZXJyb3InXSlcclxuICAgICAgICAgICAgICAgIHByb21pc2VGdW5jcy5yZWplY3QobXNnKTtcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBwcm9taXNlRnVuY3MucmVzb2x2ZShtc2cpO1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVByb21pc2VzW21zZy5yc2VxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwcm9jZXNzRXZlbnQobXNnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIG1lc3NhZ2UgcmVjZWl2ZWQ6ICcsIF9tc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgcXVldWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdUcnlpbmcgdG8gcmVjb25uZWN0Li4uJyk7XHJcbiAgICAgICAgICAvLyBEb24ndCBzcGFtIHRoZSBzZXJ2ZXIgd2l0aCByZXRyaWVzLlxyXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25uZWN0V3Mod3NVcmwpO1xyXG4gICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbm5lY3RXcyh3c1VybCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCB3YWl0Rm9yQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cuT3ZlcmxheVBsdWdpbkFwaT8ucmVhZHkpIHtcclxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHdhaXRGb3JBcGksIDMwMCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBxID0gcXVldWUgPz8gW107XHJcbiAgICAgICAgcXVldWUgPSBudWxsO1xyXG5cclxuICAgICAgICB3aW5kb3cuX19PdmVybGF5Q2FsbGJhY2sgPSBwcm9jZXNzRXZlbnQ7XHJcblxyXG4gICAgICAgIHNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIGNhbGw6ICdzdWJzY3JpYmUnLFxyXG4gICAgICAgICAgZXZlbnRzOiBPYmplY3Qua2V5cyhzdWJzY3JpYmVycyksXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBxKSB7XHJcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSlcclxuICAgICAgICAgICAgc2VuZE1lc3NhZ2UoaXRlbVswXSwgaXRlbVsxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgd2FpdEZvckFwaSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhlcmUgdGhlIE92ZXJsYXlQbHVnaW4gQVBJIGlzIHJlZ2lzdGVyZWQgdG8gdGhlIHdpbmRvdyBvYmplY3QsXHJcbiAgICAvLyBidXQgdGhpcyBpcyBtYWlubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBGb3IgY2FjdGJvdCdzIGJ1aWx0LWluIGZpbGVzLFxyXG4gICAgLy8gaXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIHRoZSB2YXJpb3VzIGZ1bmN0aW9ucyBleHBvcnRlZCBpbiByZXNvdXJjZXMvb3ZlcmxheV9wbHVnaW5fYXBpLnRzLlxyXG5cclxuICAgIC8qIGVzbGludC1kaXNhYmxlIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uICovXHJcbiAgICB3aW5kb3cuYWRkT3ZlcmxheUxpc3RlbmVyID0gYWRkT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgd2luZG93LnJlbW92ZU92ZXJsYXlMaXN0ZW5lciA9IHJlbW92ZU92ZXJsYXlMaXN0ZW5lcjtcclxuICAgIHdpbmRvdy5jYWxsT3ZlcmxheUhhbmRsZXIgPSBjYWxsT3ZlcmxheUhhbmRsZXI7XHJcbiAgICB3aW5kb3cuZGlzcGF0Y2hPdmVybGF5RXZlbnQgPSBkaXNwYXRjaE92ZXJsYXlFdmVudDtcclxuICAgIC8qIGVzbGludC1lbmFibGUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb24gKi9cclxuICB9XHJcblxyXG4gIGluaXRlZCA9IHRydWU7XHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IHsgYWRkT3ZlcmxheUxpc3RlbmVyLCBjYWxsT3ZlcmxheUhhbmRsZXIgfSBmcm9tICcuLi8uLi9yZXNvdXJjZXMvb3ZlcmxheV9wbHVnaW5fYXBpJztcclxuXHJcbmltcG9ydCAnLi4vLi4vcmVzb3VyY2VzL2RlZmF1bHRzLmNzcyc7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0NoYW5nZVpvbmUnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IGN1cnJlbnRab25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnRab25lJyk7XHJcbiAgaWYgKGN1cnJlbnRab25lKVxyXG4gICAgY3VycmVudFpvbmUuaW5uZXJUZXh0ID0gYGN1cnJlbnRab25lOiAke2Uuem9uZU5hbWV9ICgke2Uuem9uZUlEfSlgO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25JbkNvbWJhdENoYW5nZWRFdmVudCcsIChlKSA9PiB7XHJcbiAgY29uc3QgaW5Db21iYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5Db21iYXQnKTtcclxuICBpZiAoaW5Db21iYXQpIHtcclxuICAgIGluQ29tYmF0LmlubmVyVGV4dCA9IGBpbkNvbWJhdDogYWN0OiAke2UuZGV0YWlsLmluQUNUQ29tYmF0ID8gJ3llcycgOiAnbm8nfSBnYW1lOiAke1xyXG4gICAgICBlLmRldGFpbC5pbkdhbWVDb21iYXQgPyAneWVzJyA6ICdubydcclxuICAgIH1gO1xyXG4gIH1cclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uUGxheWVyQ2hhbmdlZEV2ZW50JywgKGUpID0+IHtcclxuICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWUnKTtcclxuICBpZiAobmFtZSlcclxuICAgIG5hbWUuaW5uZXJUZXh0ID0gZS5kZXRhaWwubmFtZTtcclxuICBjb25zdCBwbGF5ZXJJZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJJZCcpO1xyXG4gIGlmIChwbGF5ZXJJZClcclxuICAgIHBsYXllcklkLmlubmVyVGV4dCA9IGUuZGV0YWlsLmlkLnRvU3RyaW5nKDE2KTtcclxuICBjb25zdCBocCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdocCcpO1xyXG4gIGlmIChocClcclxuICAgIGhwLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRIUH0vJHtlLmRldGFpbC5tYXhIUH0gKCR7ZS5kZXRhaWwuY3VycmVudFNoaWVsZH0pYDtcclxuICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcCcpO1xyXG4gIGlmIChtcClcclxuICAgIG1wLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRNUH0vJHtlLmRldGFpbC5tYXhNUH1gO1xyXG4gIGNvbnN0IGNwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NwJyk7XHJcbiAgaWYgKGNwKVxyXG4gICAgY3AuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudENQfS8ke2UuZGV0YWlsLm1heENQfWA7XHJcbiAgY29uc3QgZ3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3AnKTtcclxuICBpZiAoZ3ApXHJcbiAgICBncC5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5jdXJyZW50R1B9LyR7ZS5kZXRhaWwubWF4R1B9YDtcclxuICBjb25zdCBqb2IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9iJyk7XHJcbiAgaWYgKGpvYilcclxuICAgIGpvYi5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5sZXZlbH0gJHtlLmRldGFpbC5qb2J9YDtcclxuICBjb25zdCBkZWJ1ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1ZycpO1xyXG4gIGlmIChkZWJ1ZylcclxuICAgIGRlYnVnLmlubmVyVGV4dCA9IGUuZGV0YWlsLmRlYnVnSm9iO1xyXG5cclxuICBjb25zdCBqb2JJbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pvYmluZm8nKTtcclxuICBpZiAoam9iSW5mbykge1xyXG4gICAgY29uc3QgZGV0YWlsID0gZS5kZXRhaWw7XHJcbiAgICBpZiAoZGV0YWlsLmpvYiA9PT0gJ1JETScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC53aGl0ZU1hbmF9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmJsYWNrTWFuYX0gfCAke2RldGFpbC5qb2JEZXRhaWwubWFuYVN0YWNrc31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnV0FSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gZGV0YWlsLmpvYkRldGFpbC5iZWFzdC50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRFJLJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5kYXJrc2lkZU1pbGxpc2Vjb25kc30gfCAke2RldGFpbC5qb2JEZXRhaWwuZGFya0FydHMudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwubGl2aW5nU2hhZG93TWlsbGlzZWNvbmRzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdHTkInICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBgJHtkZXRhaWwuam9iRGV0YWlsLmNhcnRyaWRnZXN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNvbnRpbnVhdGlvblN0YXRlfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdQTEQnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBkZXRhaWwuam9iRGV0YWlsLm9hdGgudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0JSRCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5zb25nTmFtZX0gfCAke2RldGFpbC5qb2JEZXRhaWwubGFzdFBsYXllZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29uZ1Byb2NzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zb3VsR2F1Z2V9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvbmdNaWxsaXNlY29uZHN9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmNvZGEuam9pbignLCAnKVxyXG4gICAgICAgIH1dYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0ROQycgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwuZmVhdGhlcnN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmVzcHJpdH0gfCBbJHtcclxuICAgICAgICBkZXRhaWwuam9iRGV0YWlsLnN0ZXBzLmpvaW4oJywgJylcclxuICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwuY3VycmVudFN0ZXB9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ05JTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwubmlua2lBbW91bnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmthemVtYXRvaX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRFJHJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5saWZlTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5leWVzQW1vdW50fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5maXJzdG1pbmRzRm9jdXN9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0JMTScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwudW1icmFsTWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwudW1icmFsSGVhcnRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wb2x5Z2xvdH0gJHtkZXRhaWwuam9iRGV0YWlsLmVub2NoaWFuLnRvU3RyaW5nKCl9ICgke2RldGFpbC5qb2JEZXRhaWwubmV4dFBvbHlnbG90TWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwucGFyYWRveC50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5hc3RyYWxTb3VsU3RhY2tzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdUSE0nICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwudW1icmFsU3RhY2tzfSAoJHtkZXRhaWwuam9iRGV0YWlsLnVtYnJhbE1pbGxpc2Vjb25kc30pYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1dITScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5saWx5U3RhY2tzfSAoJHtkZXRhaWwuam9iRGV0YWlsLmxpbHlNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5ibG9vZGxpbHlTdGFja3N9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1NNTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC50cmFuY2VNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmF0dHVuZW1lbnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmF0dHVuZW1lbnRNaWxsaXNlY29uZHN9IHwgJHtcclxuICAgICAgICAgIGRldGFpbFxyXG4gICAgICAgICAgICAuam9iRGV0YWlsLmFjdGl2ZVByaW1hbCA/PyAnLSdcclxuICAgICAgICB9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLnVzYWJsZUFyY2FudW0uam9pbignLCAnKVxyXG4gICAgICAgIH1dIHwgJHtkZXRhaWwuam9iRGV0YWlsLm5leHRTdW1tb25lZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuc3VtbW9uU3RhdHVzLnRvU3RyaW5nKCl9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1NDSCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeUdhdWdlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeVN0YXR1c30gKCR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeU1pbGxpc2Vjb25kc30pYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0FDTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGRldGFpbC5qb2JEZXRhaWwuYWV0aGVyZmxvd1N0YWNrcy50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQVNUJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQxfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jYXJkMn0gfCAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQ0fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5uZXh0ZHJhd31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTU5LJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmNoYWtyYVN0YWNrc30gfCAke2RldGFpbC5qb2JEZXRhaWwubHVuYXJOYWRpLnRvU3RyaW5nKCl9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvbGFyTmFkaS50b1N0cmluZygpfSB8IFske1xyXG4gICAgICAgICAgZGV0YWlsLmpvYkRldGFpbC5iZWFzdENoYWtyYS5qb2luKCcsICcpXHJcbiAgICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwub3Bvb3BvRnVyeX0gfCAke2RldGFpbC5qb2JEZXRhaWwucmFwdG9yRnVyeX0gfCAke2RldGFpbC5qb2JEZXRhaWwuY29ldXJsRnVyeX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTUNIJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmhlYXR9ICgke2RldGFpbC5qb2JEZXRhaWwub3ZlcmhlYXRNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5iYXR0ZXJ5fSAoJHtkZXRhaWwuam9iRGV0YWlsLmJhdHRlcnlNaWxsaXNlY29uZHN9KSB8IGxhc3Q6ICR7ZGV0YWlsLmpvYkRldGFpbC5sYXN0QmF0dGVyeUFtb3VudH0gfCAke2RldGFpbC5qb2JEZXRhaWwub3ZlcmhlYXRBY3RpdmUudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwucm9ib3RBY3RpdmUudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0FNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmtlbmtpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5tZWRpdGF0aW9uU3RhY2tzfSgke2RldGFpbC5qb2JEZXRhaWwuc2V0c3UudG9TdHJpbmcoKX0sJHtkZXRhaWwuam9iRGV0YWlsLmdldHN1LnRvU3RyaW5nKCl9LCR7ZGV0YWlsLmpvYkRldGFpbC5rYS50b1N0cmluZygpfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0dFJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFkZGVyc2dhbGx9ICgke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzZ2FsbE1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmFkZGVyc3Rpbmd9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmV1a3Jhc2lhLnRvU3RyaW5nKCl9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1JQUicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5zb3VsfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zaHJvdWR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmVuc2hyb3VkTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sZW11cmVTaHJvdWR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnZvaWRTaHJvdWR9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1ZQUicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5yYXR0bGluZ0NvaWxTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFuZ3VpbmVUcmlidXRlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zZXJwZW50T2ZmZXJpbmd9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFkdmFuY2VkQ29tYm99IHwgJHtkZXRhaWwuam9iRGV0YWlsLnJlYXdha2VuZWRUaW1lcn1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnUENUJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnBhbGV0dGVHYXVnZX0gfCAke2RldGFpbC5qb2JEZXRhaWwucGFpbnR9IHwgKCR7ZGV0YWlsLmpvYkRldGFpbC5jcmVhdHVyZU1vdGlmfSB8ICR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLndlYXBvbk1vdGlmID8gJ1dlYXBvbicgOiAnTm9uZSdcclxuICAgICAgICB9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxhbmRzY2FwZU1vdGlmID8gJ0xhbmRzY2FwZScgOiAnTm9uZSd9KSB8ICgke1xyXG4gICAgICAgICAgZGV0YWlsLmpvYkRldGFpbC5kZXBpY3Rpb25zLmpvaW4oJysnKSB8fCAnTm9uZSdcclxuICAgICAgICB9KSB8ICR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLm1vb2dsZVBvcnRyYWl0XHJcbiAgICAgICAgICAgID8gJ01vb2dsZSdcclxuICAgICAgICAgICAgOiBkZXRhaWwuam9iRGV0YWlsLm1hZGVlblBvcnRyYWl0XHJcbiAgICAgICAgICAgID8gJ01hZGVlbidcclxuICAgICAgICAgICAgOiAnTm9uZSdcclxuICAgICAgICB9YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gJyc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBwb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zJyk7XHJcbiAgaWYgKHBvcykge1xyXG4gICAgcG9zLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLnBvcy54LnRvRml4ZWQoMil9LCR7ZS5kZXRhaWwucG9zLnkudG9GaXhlZCgyKX0sJHtcclxuICAgICAgZS5kZXRhaWwucG9zLnoudG9GaXhlZCgyKVxyXG4gICAgfWA7XHJcbiAgfVxyXG4gIGNvbnN0IHJvdGF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JvdGF0aW9uJyk7XHJcbiAgaWYgKHJvdGF0aW9uKVxyXG4gICAgcm90YXRpb24uaW5uZXJUZXh0ID0gZS5kZXRhaWwucm90YXRpb24udG9TdHJpbmcoKTtcclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0VubWl0eVRhcmdldERhdGEnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YXJnZXQnKTtcclxuICBpZiAodGFyZ2V0KVxyXG4gICAgdGFyZ2V0LmlubmVyVGV4dCA9IGUuVGFyZ2V0ID8gZS5UYXJnZXQuTmFtZSA6ICctLSc7XHJcbiAgY29uc3QgdGlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpZCcpO1xyXG4gIGlmICh0aWQpXHJcbiAgICB0aWQuaW5uZXJUZXh0ID0gZS5UYXJnZXQgPyBlLlRhcmdldC5JRC50b1N0cmluZygxNikgOiAnJztcclxuICBjb25zdCB0ZGlzdGFuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGRpc3RhbmNlJyk7XHJcbiAgaWYgKHRkaXN0YW5jZSlcclxuICAgIHRkaXN0YW5jZS5pbm5lclRleHQgPSBlLlRhcmdldCA/IGUuVGFyZ2V0LkRpc3RhbmNlLnRvU3RyaW5nKCkgOiAnJztcclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uR2FtZUV4aXN0c0V2ZW50JywgKF9lKSA9PiB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJHYW1lIGV4aXN0czogXCIgKyBlLmRldGFpbC5leGlzdHMpO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25HYW1lQWN0aXZlQ2hhbmdlZEV2ZW50JywgKF9lKSA9PiB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJHYW1lIGFjdGl2ZTogXCIgKyBlLmRldGFpbC5hY3RpdmUpO1xyXG59KTtcclxuXHJcbmNvbnN0IHR0c0VjaG9SZWdleCA9IE5ldFJlZ2V4ZXMuZWNobyh7IGxpbmU6ICd0dHM6Lio/JyB9KTtcclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdMb2dMaW5lJywgKGUpID0+IHtcclxuICAvLyBNYXRjaCBcIi9lY2hvIHR0czo8c3R1ZmY+XCJcclxuICBjb25zdCBsaW5lID0gdHRzRWNob1JlZ2V4LmV4ZWMoZS5yYXdMaW5lKT8uZ3JvdXBzPy5saW5lO1xyXG4gIGlmIChsaW5lID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm47XHJcbiAgY29uc3QgY29sb24gPSBsaW5lLmluZGV4T2YoJzonKTtcclxuICBpZiAoY29sb24gPT09IC0xKVxyXG4gICAgcmV0dXJuO1xyXG4gIGNvbnN0IHRleHQgPSBsaW5lLnNsaWNlKGNvbG9uKTtcclxuICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB2b2lkIGNhbGxPdmVybGF5SGFuZGxlcih7XHJcbiAgICAgIGNhbGw6ICdjYWN0Ym90U2F5JyxcclxuICAgICAgdGV4dDogdGV4dCxcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uVXNlckZpbGVDaGFuZ2VkJywgKGUpID0+IHtcclxuICBjb25zb2xlLmxvZyhgVXNlciBmaWxlICR7ZS5maWxlfSBjaGFuZ2VkIWApO1xyXG59KTtcclxuXHJcbnZvaWQgY2FsbE92ZXJsYXlIYW5kbGVyKHsgY2FsbDogJ2NhY3Rib3RSZXF1ZXN0U3RhdGUnIH0pO1xyXG4iXSwibmFtZXMiOlsiY29tYmF0YW50TWVtb3J5S2V5cyIsImxhdGVzdExvZ0RlZmluaXRpb25zIiwiR2FtZUxvZyIsInR5cGUiLCJuYW1lIiwic291cmNlIiwibWVzc2FnZVR5cGUiLCJmaWVsZHMiLCJ0aW1lc3RhbXAiLCJjb2RlIiwibGluZSIsInN1YkZpZWxkcyIsImNhbkFub255bWl6ZSIsImZpcnN0T3B0aW9uYWxGaWVsZCIsInVuZGVmaW5lZCIsImFuYWx5c2lzT3B0aW9ucyIsImluY2x1ZGUiLCJmaWx0ZXJzIiwiQ2hhbmdlWm9uZSIsImlkIiwibGFzdEluY2x1ZGUiLCJDaGFuZ2VkUGxheWVyIiwicGxheWVySWRzIiwiQWRkZWRDb21iYXRhbnQiLCJqb2IiLCJsZXZlbCIsIm93bmVySWQiLCJ3b3JsZElkIiwid29ybGQiLCJucGNOYW1lSWQiLCJucGNCYXNlSWQiLCJjdXJyZW50SHAiLCJocCIsImN1cnJlbnRNcCIsIm1wIiwieCIsInkiLCJ6IiwiaGVhZGluZyIsImNvbWJhdGFudElkRmllbGRzIiwiUmVtb3ZlZENvbWJhdGFudCIsIm93bmVyIiwiUGFydHlMaXN0IiwicGFydHlDb3VudCIsImlkMCIsImlkMSIsImlkMiIsImlkMyIsImlkNCIsImlkNSIsImlkNiIsImlkNyIsImlkOCIsImlkOSIsImlkMTAiLCJpZDExIiwiaWQxMiIsImlkMTMiLCJpZDE0IiwiaWQxNSIsImlkMTYiLCJpZDE3IiwiaWQxOCIsImlkMTkiLCJpZDIwIiwiaWQyMSIsImlkMjIiLCJpZDIzIiwiUGxheWVyU3RhdHMiLCJzdHJlbmd0aCIsImRleHRlcml0eSIsInZpdGFsaXR5IiwiaW50ZWxsaWdlbmNlIiwibWluZCIsInBpZXR5IiwiYXR0YWNrUG93ZXIiLCJkaXJlY3RIaXQiLCJjcml0aWNhbEhpdCIsImF0dGFja01hZ2ljUG90ZW5jeSIsImhlYWxNYWdpY1BvdGVuY3kiLCJkZXRlcm1pbmF0aW9uIiwic2tpbGxTcGVlZCIsInNwZWxsU3BlZWQiLCJ0ZW5hY2l0eSIsImxvY2FsQ29udGVudElkIiwiU3RhcnRzVXNpbmciLCJzb3VyY2VJZCIsImFiaWxpdHkiLCJ0YXJnZXRJZCIsInRhcmdldCIsImNhc3RUaW1lIiwicG9zc2libGVSc3ZGaWVsZHMiLCJibGFua0ZpZWxkcyIsIkFiaWxpdHkiLCJmbGFncyIsImRhbWFnZSIsInRhcmdldEN1cnJlbnRIcCIsInRhcmdldE1heEhwIiwidGFyZ2V0Q3VycmVudE1wIiwidGFyZ2V0TWF4TXAiLCJ0YXJnZXRYIiwidGFyZ2V0WSIsInRhcmdldFoiLCJ0YXJnZXRIZWFkaW5nIiwibWF4SHAiLCJtYXhNcCIsInNlcXVlbmNlIiwidGFyZ2V0SW5kZXgiLCJ0YXJnZXRDb3VudCIsIm93bmVyTmFtZSIsImVmZmVjdERpc3BsYXlUeXBlIiwiYWN0aW9uSWQiLCJhY3Rpb25BbmltYXRpb25JZCIsImFuaW1hdGlvbkxvY2tUaW1lIiwicm90YXRpb25IZXgiLCJOZXR3b3JrQU9FQWJpbGl0eSIsIk5ldHdvcmtDYW5jZWxBYmlsaXR5IiwicmVhc29uIiwiTmV0d29ya0RvVCIsIndoaWNoIiwiZWZmZWN0SWQiLCJkYW1hZ2VUeXBlIiwic291cmNlQ3VycmVudEhwIiwic291cmNlTWF4SHAiLCJzb3VyY2VDdXJyZW50TXAiLCJzb3VyY2VNYXhNcCIsInNvdXJjZVgiLCJzb3VyY2VZIiwic291cmNlWiIsInNvdXJjZUhlYWRpbmciLCJXYXNEZWZlYXRlZCIsIkdhaW5zRWZmZWN0IiwiZWZmZWN0IiwiZHVyYXRpb24iLCJjb3VudCIsIkhlYWRNYXJrZXIiLCJkYXRhMCIsInBvc3NpYmxlUGxheWVySWRzIiwiTmV0d29ya1JhaWRNYXJrZXIiLCJvcGVyYXRpb24iLCJ3YXltYXJrIiwiTmV0d29ya1RhcmdldE1hcmtlciIsInRhcmdldE5hbWUiLCJMb3Nlc0VmZmVjdCIsIk5ldHdvcmtHYXVnZSIsImRhdGExIiwiZGF0YTIiLCJkYXRhMyIsImZpcnN0VW5rbm93bkZpZWxkIiwiTmV0d29ya1dvcmxkIiwiaXNVbmtub3duIiwiQWN0b3JDb250cm9sIiwiaW5zdGFuY2UiLCJjb21tYW5kIiwiTmFtZVRvZ2dsZSIsInRvZ2dsZSIsIlRldGhlciIsIkxpbWl0QnJlYWsiLCJ2YWx1ZUhleCIsImJhcnMiLCJOZXR3b3JrRWZmZWN0UmVzdWx0Iiwic2VxdWVuY2VJZCIsImN1cnJlbnRTaGllbGQiLCJTdGF0dXNFZmZlY3QiLCJqb2JMZXZlbERhdGEiLCJkYXRhNCIsImRhdGE1IiwiTmV0d29ya1VwZGF0ZUhQIiwiTWFwIiwicmVnaW9uTmFtZSIsInBsYWNlTmFtZSIsInBsYWNlTmFtZVN1YiIsIlN5c3RlbUxvZ01lc3NhZ2UiLCJwYXJhbTAiLCJwYXJhbTEiLCJwYXJhbTIiLCJTdGF0dXNMaXN0MyIsIlN0YXR1c0VmZmVjdExpc3RGb3JheTMiLCJQYXJzZXJJbmZvIiwiZ2xvYmFsSW5jbHVkZSIsIlByb2Nlc3NJbmZvIiwiRGVidWciLCJQYWNrZXREdW1wIiwiVmVyc2lvbiIsIkVycm9yIiwiTm9uZSIsIkxpbmVSZWdpc3RyYXRpb24iLCJ2ZXJzaW9uIiwiTWFwRWZmZWN0IiwibG9jYXRpb24iLCJGYXRlRGlyZWN0b3IiLCJjYXRlZ29yeSIsImZhdGVJZCIsInByb2dyZXNzIiwiQ0VEaXJlY3RvciIsInBvcFRpbWUiLCJ0aW1lUmVtYWluaW5nIiwiY2VLZXkiLCJudW1QbGF5ZXJzIiwic3RhdHVzIiwiSW5Db21iYXQiLCJpbkFDVENvbWJhdCIsImluR2FtZUNvbWJhdCIsImlzQUNUQ2hhbmdlZCIsImlzR2FtZUNoYW5nZWQiLCJDb21iYXRhbnRNZW1vcnkiLCJjaGFuZ2UiLCJyZXBlYXRpbmdGaWVsZHMiLCJzdGFydGluZ0luZGV4IiwibGFiZWwiLCJuYW1lcyIsInNvcnRLZXlzIiwicHJpbWFyeUtleSIsInBvc3NpYmxlS2V5cyIsImtleXNUb0Fub255bWl6ZSIsInBhaXIiLCJrZXkiLCJ2YWx1ZSIsIlJTVkRhdGEiLCJsb2NhbGUiLCJTdGFydHNVc2luZ0V4dHJhIiwiQWJpbGl0eUV4dHJhIiwiZ2xvYmFsRWZmZWN0Q291bnRlciIsImRhdGFGbGFnIiwiYW5pbWF0aW9uVGFyZ2V0SWQiLCJDb250ZW50RmluZGVyU2V0dGluZ3MiLCJ6b25lSWQiLCJ6b25lTmFtZSIsImluQ29udGVudEZpbmRlckNvbnRlbnQiLCJ1bnJlc3RyaWN0ZWRQYXJ0eSIsIm1pbmltYWxJdGVtTGV2ZWwiLCJzaWxlbmNlRWNobyIsImV4cGxvcmVyTW9kZSIsImxldmVsU3luYyIsIk5wY1llbGwiLCJucGNJZCIsIm5wY1llbGxJZCIsIkJhdHRsZVRhbGsyIiwiaW5zdGFuY2VDb250ZW50VGV4dElkIiwiZGlzcGxheU1zIiwiQ291bnRkb3duIiwiY291bnRkb3duVGltZSIsInJlc3VsdCIsIkNvdW50ZG93bkNhbmNlbCIsIkFjdG9yTW92ZSIsIm1vdmVUeXBlIiwiQWN0b3JTZXRQb3MiLCJTcGF3bk5wY0V4dHJhIiwicGFyZW50SWQiLCJ0ZXRoZXJJZCIsImFuaW1hdGlvblN0YXRlIiwiQWN0b3JDb250cm9sRXh0cmEiLCJwYXJhbTMiLCJwYXJhbTQiLCJBY3RvckNvbnRyb2xTZWxmRXh0cmEiLCJwYXJhbTUiLCJwYXJhbTYiLCJsb2dEZWZpbml0aW9uc1ZlcnNpb25zIiwiYXNzZXJ0TG9nRGVmaW5pdGlvbnMiLCJjb25zb2xlIiwiYXNzZXJ0IiwiVW5yZWFjaGFibGVDb2RlIiwiY29uc3RydWN0b3IiLCJsb2dEZWZpbml0aW9ucyIsInNlcGFyYXRvciIsIm1hdGNoRGVmYXVsdCIsIm1hdGNoV2l0aENvbG9uc0RlZmF1bHQiLCJmaWVsZHNXaXRoUG90ZW50aWFsQ29sb25zIiwiZGVmYXVsdFBhcmFtcyIsImxvZ1R5cGUiLCJPYmplY3QiLCJrZXlzIiwicHVzaCIsInBhcmFtcyIsInByb3AiLCJpbmRleCIsImVudHJpZXMiLCJpbmNsdWRlcyIsInBhcmFtIiwiZmllbGQiLCJvcHRpb25hbCIsInJlcGVhdGluZyIsInJlcGVhdGluZ0tleXMiLCJpc1JlcGVhdGluZ0ZpZWxkIiwiQXJyYXkiLCJpc0FycmF5IiwiZSIsInBhcnNlSGVscGVyIiwiZGVmS2V5IiwidmFsaWRGaWVsZHMiLCJSZWdleGVzIiwidmFsaWRhdGVQYXJhbXMiLCJjYXB0dXJlIiwidHJ1ZUlmVW5kZWZpbmVkIiwiZmllbGRLZXlzIiwic29ydCIsImEiLCJiIiwicGFyc2VJbnQiLCJtYXhLZXlTdHIiLCJ0bXBLZXkiLCJwb3AiLCJsZW5ndGgiLCJmaWVsZE5hbWUiLCJtYXhLZXkiLCJhYmlsaXR5TWVzc2FnZVR5cGUiLCJhYmlsaXR5SGV4Q29kZSIsInByZWZpeCIsInR5cGVBc0hleCIsInRvU3RyaW5nIiwidG9VcHBlckNhc2UiLCJkZWZhdWx0SGV4Q29kZSIsInNsaWNlIiwiaGV4Q29kZSIsInN0ciIsImxhc3RLZXkiLCJrZXlTdHIiLCJwYXJzZUZpZWxkIiwibWlzc2luZ0ZpZWxkcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJmaWVsZERlZmF1bHQiLCJkZWZhdWx0RmllbGRWYWx1ZSIsImZpZWxkVmFsdWUiLCJyZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3IiLCJyZXBlYXRpbmdBcnJheSIsImxlZnQiLCJyaWdodCIsInRvTG93ZXJDYXNlIiwibG9jYWxlQ29tcGFyZSIsIndhcm4iLCJsZWZ0VmFsdWUiLCJyaWdodFZhbHVlIiwiYW5vblJlcHMiLCJmb3JFYWNoIiwicG9zc2libGVLZXkiLCJyZXAiLCJmaW5kIiwiZmllbGRSZWdleCIsInZhbCIsInNvbWUiLCJ2IiwibWF5YmVDYXB0dXJlIiwicGFyc2UiLCJidWlsZFJlZ2V4IiwibG9nVmVyc2lvbiIsInN0YXJ0c1VzaW5nIiwiYWJpbGl0eUZ1bGwiLCJoZWFkTWFya2VyIiwiYWRkZWRDb21iYXRhbnQiLCJhZGRlZENvbWJhdGFudEZ1bGwiLCJyZW1vdmluZ0NvbWJhdGFudCIsImdhaW5zRWZmZWN0Iiwic3RhdHVzRWZmZWN0RXhwbGljaXQiLCJsb3Nlc0VmZmVjdCIsInRldGhlciIsIndhc0RlZmVhdGVkIiwibmV0d29ya0RvVCIsImVjaG8iLCJnYW1lTG9nIiwiZGlhbG9nIiwibWVzc2FnZSIsImdhbWVOYW1lTG9nIiwic3RhdENoYW5nZSIsImNoYW5nZVpvbmUiLCJuZXR3b3JrNmQiLCJuYW1lVG9nZ2xlIiwibWFwIiwic3lzdGVtTG9nTWVzc2FnZSIsIm1hcEVmZmVjdCIsImZhdGVEaXJlY3RvciIsImNlRGlyZWN0b3IiLCJpbkNvbWJhdCIsImNvbWJhdGFudE1lbW9yeSIsInN0YXJ0c1VzaW5nRXh0cmEiLCJhYmlsaXR5RXh0cmEiLCJjb250ZW50RmluZGVyU2V0dGluZ3MiLCJucGNZZWxsIiwiYmF0dGxlVGFsazIiLCJjb3VudGRvd24iLCJjb3VudGRvd25DYW5jZWwiLCJhY3Rvck1vdmUiLCJhY3RvclNldFBvcyIsInNwYXduTnBjRXh0cmEiLCJhY3RvckNvbnRyb2xFeHRyYSIsImFjdG9yQ29udHJvbFNlbGZFeHRyYSIsImRlZmF1bHRWYWx1ZSIsImFueU9mIiwibmFtZWRDYXB0dXJlIiwiZXJyb3IiLCJhcmdzIiwiYW55T2ZBcnJheSIsImFycmF5IiwiZWxlbSIsIlJlZ0V4cCIsImpvaW4iLCJmaXJzdEFyZyIsInJlZ2V4cFN0cmluZyIsImtDYWN0Ym90Q2F0ZWdvcmllcyIsIlRpbWVzdGFtcCIsIk5ldFRpbWVzdGFtcCIsIk5ldEZpZWxkIiwiTG9nVHlwZSIsIkFiaWxpdHlDb2RlIiwiT2JqZWN0SWQiLCJOYW1lIiwiRmxvYXQiLCJtb2RpZmllcnMiLCJnbG9iYWwiLCJtdWx0aWxpbmUiLCJyZXBsYWNlIiwibWF0Y2giLCJncm91cCIsInBhcnNlR2xvYmFsIiwicmVnZXgiLCJmIiwiZnVuY05hbWUiLCJtYWdpY1RyYW5zbGF0aW9uU3RyaW5nIiwibWFnaWNTdHJpbmdSZWdleCIsImtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdCIsImtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uIiwiZ2FtZUxvZ0NvZGVzIiwiYWN0b3JDb250cm9sVHlwZSIsInNldEFuaW1TdGF0ZSIsInB1YmxpY0NvbnRlbnRUZXh0IiwibG9nTXNnIiwibG9nTXNnUGFyYW1zIiwidHJhbnNQYXJhbXMiLCJmaWx0ZXIiLCJrIiwibmVlZHNUcmFuc2xhdGlvbnMiLCJOZXRSZWdleGVzIiwiZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCIsInNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWQiLCJkb2VzTmV0UmVnZXhOZWVkVHJhbnNsYXRpb24iLCJleGVjIiwicnN2RGF0YSIsImNvbW1vbk5ldFJlZ2V4Iiwid2lwZSIsImNhY3Rib3RXaXBlRWNobyIsInVzZXJXaXBlRWNobyIsImJ1aWxkTmV0UmVnZXhGb3JUcmlnZ2VyIiwiaW5pdGVkIiwid3NVcmwiLCJ3cyIsInF1ZXVlIiwicnNlcUNvdW50ZXIiLCJyZXNwb25zZVByb21pc2VzIiwic3Vic2NyaWJlcnMiLCJzZW5kTWVzc2FnZSIsIm1zZyIsImNiIiwic2VuZCIsIndpbmRvdyIsIk92ZXJsYXlQbHVnaW5BcGkiLCJjYWxsSGFuZGxlciIsInByb2Nlc3NFdmVudCIsImluaXQiLCJzdWJzIiwic3ViIiwiZGlzcGF0Y2hPdmVybGF5RXZlbnQiLCJhZGRPdmVybGF5TGlzdGVuZXIiLCJldmVudCIsImNhbGwiLCJldmVudHMiLCJyZW1vdmVPdmVybGF5TGlzdGVuZXIiLCJsaXN0IiwicG9zIiwiaW5kZXhPZiIsInNwbGljZSIsImNhbGxPdmVybGF5SGFuZGxlckludGVybmFsIiwiX21zZyIsInJzZXEiLCJwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkYXRhIiwicGFyc2VkIiwiY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXAiLCJjYWxsT3ZlcmxheUhhbmRsZXIiLCJjYWxsRnVuYyIsInNldE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGUiLCJvdmVycmlkZSIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsImdldCIsImNvbm5lY3RXcyIsIldlYlNvY2tldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJsb2ciLCJxIiwicHJvbWlzZUZ1bmNzIiwic2V0VGltZW91dCIsIndhaXRGb3JBcGkiLCJyZWFkeSIsIl9fT3ZlcmxheUNhbGxiYWNrIiwiaXRlbSIsImN1cnJlbnRab25lIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImlubmVyVGV4dCIsInpvbmVJRCIsImRldGFpbCIsInBsYXllcklkIiwiY3VycmVudEhQIiwibWF4SFAiLCJjdXJyZW50TVAiLCJtYXhNUCIsImNwIiwiY3VycmVudENQIiwibWF4Q1AiLCJncCIsImN1cnJlbnRHUCIsIm1heEdQIiwiZGVidWciLCJkZWJ1Z0pvYiIsImpvYkluZm8iLCJqb2JEZXRhaWwiLCJ3aGl0ZU1hbmEiLCJibGFja01hbmEiLCJtYW5hU3RhY2tzIiwiYmVhc3QiLCJibG9vZCIsImRhcmtzaWRlTWlsbGlzZWNvbmRzIiwiZGFya0FydHMiLCJsaXZpbmdTaGFkb3dNaWxsaXNlY29uZHMiLCJjYXJ0cmlkZ2VzIiwiY29udGludWF0aW9uU3RhdGUiLCJvYXRoIiwic29uZ05hbWUiLCJsYXN0UGxheWVkIiwic29uZ1Byb2NzIiwic291bEdhdWdlIiwic29uZ01pbGxpc2Vjb25kcyIsImNvZGEiLCJmZWF0aGVycyIsImVzcHJpdCIsInN0ZXBzIiwiY3VycmVudFN0ZXAiLCJuaW5raUFtb3VudCIsImthemVtYXRvaSIsImJsb29kTWlsbGlzZWNvbmRzIiwibGlmZU1pbGxpc2Vjb25kcyIsImV5ZXNBbW91bnQiLCJmaXJzdG1pbmRzRm9jdXMiLCJ1bWJyYWxTdGFja3MiLCJ1bWJyYWxNaWxsaXNlY29uZHMiLCJ1bWJyYWxIZWFydHMiLCJwb2x5Z2xvdCIsImVub2NoaWFuIiwibmV4dFBvbHlnbG90TWlsbGlzZWNvbmRzIiwicGFyYWRveCIsImFzdHJhbFNvdWxTdGFja3MiLCJsaWx5U3RhY2tzIiwibGlseU1pbGxpc2Vjb25kcyIsImJsb29kbGlseVN0YWNrcyIsImFldGhlcmZsb3dTdGFja3MiLCJ0cmFuY2VNaWxsaXNlY29uZHMiLCJhdHR1bmVtZW50IiwiYXR0dW5lbWVudE1pbGxpc2Vjb25kcyIsImFjdGl2ZVByaW1hbCIsInVzYWJsZUFyY2FudW0iLCJuZXh0U3VtbW9uZWQiLCJzdW1tb25TdGF0dXMiLCJmYWlyeUdhdWdlIiwiZmFpcnlTdGF0dXMiLCJmYWlyeU1pbGxpc2Vjb25kcyIsImNhcmQxIiwiY2FyZDIiLCJjYXJkMyIsImNhcmQ0IiwibmV4dGRyYXciLCJjaGFrcmFTdGFja3MiLCJsdW5hck5hZGkiLCJzb2xhck5hZGkiLCJiZWFzdENoYWtyYSIsIm9wb29wb0Z1cnkiLCJyYXB0b3JGdXJ5IiwiY29ldXJsRnVyeSIsImhlYXQiLCJvdmVyaGVhdE1pbGxpc2Vjb25kcyIsImJhdHRlcnkiLCJiYXR0ZXJ5TWlsbGlzZWNvbmRzIiwibGFzdEJhdHRlcnlBbW91bnQiLCJvdmVyaGVhdEFjdGl2ZSIsInJvYm90QWN0aXZlIiwia2Vua2kiLCJtZWRpdGF0aW9uU3RhY2tzIiwic2V0c3UiLCJnZXRzdSIsImthIiwiYWRkZXJzZ2FsbCIsImFkZGVyc2dhbGxNaWxsaXNlY29uZHMiLCJhZGRlcnN0aW5nIiwiZXVrcmFzaWEiLCJzb3VsIiwic2hyb3VkIiwiZW5zaHJvdWRNaWxsaXNlY29uZHMiLCJsZW11cmVTaHJvdWQiLCJ2b2lkU2hyb3VkIiwicmF0dGxpbmdDb2lsU3RhY2tzIiwiYW5ndWluZVRyaWJ1dGUiLCJzZXJwZW50T2ZmZXJpbmciLCJhZHZhbmNlZENvbWJvIiwicmVhd2FrZW5lZFRpbWVyIiwicGFsZXR0ZUdhdWdlIiwicGFpbnQiLCJjcmVhdHVyZU1vdGlmIiwid2VhcG9uTW90aWYiLCJsYW5kc2NhcGVNb3RpZiIsImRlcGljdGlvbnMiLCJtb29nbGVQb3J0cmFpdCIsIm1hZGVlblBvcnRyYWl0IiwidG9GaXhlZCIsInJvdGF0aW9uIiwiVGFyZ2V0IiwidGlkIiwiSUQiLCJ0ZGlzdGFuY2UiLCJEaXN0YW5jZSIsIl9lIiwidHRzRWNob1JlZ2V4IiwicmF3TGluZSIsImdyb3VwcyIsImNvbG9uIiwidGV4dCIsImZpbGUiXSwic291cmNlUm9vdCI6IiJ9