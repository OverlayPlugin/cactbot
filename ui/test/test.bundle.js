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
      data3: 18,
      data4: 19,
      data5: 20
      // Variable number of triplets here, but at least one.
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
      name: 3
      // triplets of fields from here (effectId, data, playerId)?
    },

    playerIds: {
      2: 3
    },
    canAnonymize: true,
    firstOptionalField: 4,
    firstUnknownField: 4
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFdBQVcsRUFBRSxXQUFXO0lBQ3hCQyxNQUFNLEVBQUU7TUFDTkosSUFBSSxFQUFFLENBQUM7TUFDUEssU0FBUyxFQUFFLENBQUM7TUFDWm1DLFVBQVUsRUFBRSxDQUFDO01BQ2JDLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRDdDLFNBQVMsRUFBRTtNQUNULENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElB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QixDQUFDO01BQ3RCakIsSUFBSSxFQUFFLFlBQVk7TUFDbEJtSyxJQUFJLEVBQUVBO0lBQ1IsQ0FBQyxDQUFDO0VBQ0o7QUFDRixDQUFDLENBQUM7QUFFRnJLLGtCQUFrQixDQUFDLG1CQUFtQixFQUFHL0ssQ0FBQyxJQUFLO0VBQzdDM0IsT0FBTyxDQUFDdU8sR0FBRyxDQUFFLGFBQVk1TSxDQUFDLENBQUNxVixJQUFLLFdBQVUsQ0FBQztBQUM3QyxDQUFDLENBQUM7QUFFRixLQUFLbkosa0JBQWtCLENBQUM7RUFBRWpCLElBQUksRUFBRTtBQUFzQixDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvbmV0bG9nX2RlZnMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9ub3RfcmVhY2hlZC50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL3JlZ2V4ZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9uZXRyZWdleGVzLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvb3ZlcmxheV9wbHVnaW5fYXBpLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi91aS90ZXN0L3Rlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGx1Z2luQ29tYmF0YW50U3RhdGUgfSBmcm9tICcuLi90eXBlcy9ldmVudCc7XHJcbmltcG9ydCB7IE5ldEZpZWxkc1JldmVyc2UgfSBmcm9tICcuLi90eXBlcy9uZXRfZmllbGRzJztcclxuaW1wb3J0IHsgTmV0UGFyYW1zIH0gZnJvbSAnLi4vdHlwZXMvbmV0X3Byb3BzJztcclxuXHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb248SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICAvLyBUaGUgbG9nIGxpbmUgaWQsIGFzIGEgZGVjaW1hbCBzdHJpbmcsIG1pbmltdW0gdHdvIGNoYXJhY3RlcnMuXHJcbiAgdHlwZTogTG9nRGVmaW5pdGlvbnNbS11bJ3R5cGUnXTtcclxuICAvLyBUaGUgaW5mb3JtYWwgbmFtZSBvZiB0aGlzIGxvZyBsaW5lIChtdXN0IG1hdGNoIHRoZSBrZXkgdGhhdCB0aGUgTG9nRGVmaW5pdGlvbiBpcyBhIHZhbHVlIGZvcikuXHJcbiAgbmFtZTogSztcclxuICAvLyBUaGUgcGx1Z2luIHRoYXQgZ2VuZXJhdGVzIHRoaXMgbG9nIGxpbmUuXHJcbiAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicgfCAnT3ZlcmxheVBsdWdpbic7XHJcbiAgLy8gUGFyc2VkIEFDVCBsb2cgbGluZSB0eXBlLiAgT3ZlcmxheVBsdWdpbiBsaW5lcyB1c2UgdGhlIGB0eXBlYCBhcyBhIHN0cmluZy5cclxuICBtZXNzYWdlVHlwZTogTG9nRGVmaW5pdGlvbnNbS11bJ21lc3NhZ2VUeXBlJ107XHJcbiAgLy8gSWYgdHJ1ZSwgYWx3YXlzIGluY2x1ZGUgdGhpcyBsaW5lIHdoZW4gc3BsaXR0aW5nIGxvZ3MgKGUuZy4gRkZYSVYgcGx1Z2luIHZlcnNpb24pLlxyXG4gIGdsb2JhbEluY2x1ZGU/OiBib29sZWFuO1xyXG4gIC8vIElmIHRydWUsIGFsd2F5cyBpbmNsdWRlIHRoZSBsYXN0IGluc3RhbmNlIG9mIHRoaXMgbGluZSB3aGVuIHNwbGl0dGluZyBsb2dzIChlLmcuIENoYW5nZVpvbmUpLlxyXG4gIGxhc3RJbmNsdWRlPzogYm9vbGVhbjtcclxuICAvLyBUcnVlIGlmIHRoZSBsaW5lIGNhbiBiZSBhbm9ueW1pemVkIChpLmUuIHJlbW92aW5nIHBsYXllciBpZHMgYW5kIG5hbWVzKS5cclxuICBjYW5Bbm9ueW1pemU/OiBib29sZWFuO1xyXG4gIC8vIElmIHRydWUsIHRoaXMgbG9nIGxpbmUgaGFzIG5vdCBiZWVuIHNlZW4gYmVmb3JlIGFuZCBuZWVkcyBtb3JlIGluZm9ybWF0aW9uLlxyXG4gIGlzVW5rbm93bj86IGJvb2xlYW47XHJcbiAgLy8gRmllbGRzIGF0IHRoaXMgaW5kZXggYW5kIGJleW9uZCBhcmUgY2xlYXJlZCwgd2hlbiBhbm9ueW1pemluZy5cclxuICBmaXJzdFVua25vd25GaWVsZD86IG51bWJlcjtcclxuICAvLyBBIG1hcCBvZiBhbGwgb2YgdGhlIGZpZWxkcywgdW5pcXVlIGZpZWxkIG5hbWUgdG8gZmllbGQgaW5kZXguXHJcbiAgZmllbGRzOiBMb2dEZWZpbml0aW9uc1tLXVsnZmllbGRzJ107XHJcbiAgLy8gRmllbGQgaW5kaWNlcyB0aGF0ICptYXkqIGNvbnRhaW4gUlNWIHBsYWNlaG9sZGVycyAoZm9yIGRlY29kaW5nKVxyXG4gIHBvc3NpYmxlUnN2RmllbGRzPzogTG9nRGVmRmllbGRJZHg8Sz4gfCByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG4gIC8vIEZpZWxkIG5hbWVzIGFuZCB2YWx1ZXMgdGhhdCBjYW4gb3ZlcnJpZGUgYGNhbkFub255bWl6ZWAuIFNlZSBgTG9nRGVmU3ViRmllbGRzYCB0eXBlIGJlbG93LlxyXG4gIHN1YkZpZWxkcz86IExvZ0RlZlN1YkZpZWxkczxLPjtcclxuICAvLyBNYXAgb2YgZmllbGQgaW5kaWNlcyB0byBhbm9ueW1pemUsIGluIHRoZSBmb3JtYXQ6IHBsYXllcklkOiAob3B0aW9uYWwpIHBsYXllck5hbWUuXHJcbiAgcGxheWVySWRzPzogUGxheWVySWRNYXA8Sz47XHJcbiAgLy8gQSBsaXN0IG9mIGZpZWxkIGluZGljZXMgdGhhdCBtYXkgY29udGFpbnMgcGxheWVyIGlkcyBhbmQsIGlmIHNvLCB3aWxsIGJlIGFub255bWl6ZWQuXHJcbiAgLy8gSWYgYW4gaW5kZXggaXMgbGlzdGVkIGhlcmUgYW5kIGluIGBwbGF5ZXJJZHNgLCBpdCB3aWxsIGJlIHRyZWF0ZWQgYXMgYSBwb3NzaWJsZSBpZCBmaWVsZC5cclxuICBwb3NzaWJsZVBsYXllcklkcz86IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbiAgLy8gQSBsaXN0IG9mIGZpZWxkIGluZGljZXMgdGhhdCBhcmUgb2sgdG8gYmUgYmxhbmsgKG9yIGhhdmUgaW52YWxpZCBpZHMpLlxyXG4gIGJsYW5rRmllbGRzPzogcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxuICAvLyBUaGlzIGZpZWxkIGluZGV4IChhbmQgYWxsIGFmdGVyKSB3aWxsIGJlIHRyZWF0ZWQgYXMgb3B0aW9uYWwgd2hlbiBjcmVhdGluZyBjYXB0dXJpbmcgcmVnZXhlcy5cclxuICBmaXJzdE9wdGlvbmFsRmllbGQ6IG51bWJlciB8IHVuZGVmaW5lZDtcclxuICAvLyBUaGVzZSBmaWVsZHMgYXJlIHRyZWF0ZWQgYXMgcmVwZWF0YWJsZSBmaWVsZHNcclxuICByZXBlYXRpbmdGaWVsZHM/OiB7XHJcbiAgICBzdGFydGluZ0luZGV4OiBudW1iZXI7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgbmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG4gICAgc29ydEtleXM/OiBib29sZWFuO1xyXG4gICAgcHJpbWFyeUtleTogc3RyaW5nO1xyXG4gICAgcG9zc2libGVLZXlzOiByZWFkb25seSBzdHJpbmdbXTtcclxuICAgIC8vIFJlcGVhdGluZyBmaWVsZHMgdGhhdCB3aWxsIGJlIGFub255bWl6ZWQgaWYgcHJlc2VudC4gU2FtZSBzdHJ1Y3R1cmUgYXMgYHBsYXllcklkc2AsXHJcbiAgICAvLyBidXQgdXNlcyByZXBlYXRpbmcgZmllbGQga2V5cyAobmFtZXMpIGluIHBsYWNlIG9mIGZpZWxkIGluZGljZXMuIEhvd2V2ZXIsIHRoZSAnaWQnIGZpZWxkXHJcbiAgICAvLyBvZiBhbiBpZC9uYW1lIHBhaXIgY2FuIGJlIGEgZml4ZWQgZmllbGQgaW5kZXguIFNlZSBgQ29tYmF0YW50TWVtb3J5YCBleGFtcGxlLlxyXG4gICAga2V5c1RvQW5vbnltaXplPzogSyBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8geyBbaWRGaWVsZDogc3RyaW5nIHwgbnVtYmVyXTogc3RyaW5nIHwgbnVsbCB9XHJcbiAgICAgIDogbmV2ZXI7XHJcbiAgfTtcclxuICAvLyBTZWUgYEFuYWx5c2lzT3B0aW9uc2AgdHlwZS4gT21pdHRpbmcgdGhpcyBwcm9wZXJ0eSBtZWFucyBubyBsb2cgbGluZXMgd2lsbCBiZSBpbmNsdWRlZDtcclxuICAvLyBob3dldmVyLCBpZiByYWlkYm9zcyB0cmlnZ2VycyBhcmUgZm91bmQgdXNpbmcgdGhpcyBsaW5lIHR5cGUsIGFuIGF1dG9tYXRlZCB3b3JrZmxvdyB3aWxsXHJcbiAgLy8gY3JlYXRlIHRoaXMgcHJvcGVydHkgYW5kIHNldCBgaW5jbHVkZTogJ2FsbCdgLiBUbyBzdXBwcmVzcyB0aGlzLCB1c2UgYGluY2x1ZGU6ICduZXZlcmBgLlxyXG4gIGFuYWx5c2lzT3B0aW9ucz86IEFuYWx5c2lzT3B0aW9uczxLPjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExvZ0RlZkZpZWxkSWR4PFxyXG4gIEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuPiA9IEV4dHJhY3Q8TG9nRGVmaW5pdGlvbnNbS11bJ2ZpZWxkcyddW2tleW9mIExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXV0sIG51bWJlcj47XHJcblxyXG50eXBlIFBsYXllcklkTWFwPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgW1AgaW4gTG9nRGVmRmllbGRJZHg8Sz4gYXMgbnVtYmVyXT86IExvZ0RlZkZpZWxkSWR4PEs+IHwgbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIExvZ0RlZkZpZWxkTmFtZTxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0gRXh0cmFjdDxcclxuICBrZXlvZiBMb2dEZWZpbml0aW9uc1tLXVsnZmllbGRzJ10sXHJcbiAgc3RyaW5nXHJcbj47XHJcblxyXG4vLyBTcGVjaWZpZXMgYSBmaWVsZE5hbWUga2V5IHdpdGggb25lIG9yIG1vcmUgcG9zc2libGUgdmFsdWVzIGFuZCBhIGBjYW5Bbm9ueWl6ZWAgb3ZlcnJpZGVcclxuLy8gaWYgdGhhdCBmaWVsZCBhbmQgdmFsdWUgYXJlIHByZXNlbnQgb24gdGhlIGxvZyBsaW5lLiBTZWUgJ0dhbWVMb2cnIGZvciBhbiBleGFtcGxlLlxyXG50eXBlIExvZ0RlZlN1YkZpZWxkczxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIFtQIGluIExvZ0RlZkZpZWxkTmFtZTxLPl0/OiB7XHJcbiAgICBbZmllbGRWYWx1ZTogc3RyaW5nXToge1xyXG4gICAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICAgIGNhbkFub255bWl6ZTogYm9vbGVhbjtcclxuICAgIH07XHJcbiAgfTtcclxufTtcclxuXHJcbi8vIE9wdGlvbnMgZm9yIGluY2x1ZGluZyB0aGVzZSBsaW5lcyBpbiBhIGZpbHRlcmVkIGxvZyB2aWEgdGhlIGxvZyBzcGxpdHRlcidzIGFuYWx5c2lzIG9wdGlvbi5cclxuLy8gYGluY2x1ZGU6YCBzcGVjaWZpZXMgdGhlIGxldmVsIG9mIGluY2x1c2lvbjpcclxuLy8gICAtICdhbGwnIHdpbGwgaW5jbHVkZSBhbGwgbGluZXMgd2l0aCBubyBmaWx0ZXJpbmcuXHJcbi8vICAgLSAnZmlsdGVyJyB3aWxsIGluY2x1ZGUgb25seSB0aG9zZSBsaW5lcyB0aGF0IG1hdGNoIGF0IGxlYXN0IG9uZSBvZiB0aGUgc3BlY2lmaWVkIGBmaWx0ZXJzYC5cclxuLy8gICAtICduZXZlcicgaXMgYW4gb3ZlcnJpZGU7IGp1c3QgbGlrZSBpZiB0aGUgcHJvcGVydHkgd2VyZSBvbWl0dGVkLCBubyBsb2cgbGluZXMgd2lsbCBiZSBpbmNsdWRlZFxyXG4vLyAgICAgIGluIHRoZSBmaWx0ZXI7IGhvd2V2ZXIsIGlmICduZXZlcicgaXMgdXNlZCwgdGhlIGF1dG9tYXRlZCB3b3JrZmxvdyB3aWxsIG5vdCBhdHRlbXB0IHRvXHJcbi8vICAgICAgY2hhbmdlIGl0IHRvICdhbGwnIHVwb24gZmluZGluZyBhY3RpdmUgdHJpZ2dlcnMgdXNpbmcgdGhpcyBsaW5lIHR5cGUuXHJcbi8vIGBmaWx0ZXJzOmAgY29udGFpbnMgTmV0cmVnZXgtc3R5bGUgZmlsdGVyIGNyaXRlcmlhLiBMaW5lcyBzYXRpc2Z5aW5nIGF0IGxlYXN0IG9uZSBmaWx0ZXIgd2lsbCBiZVxyXG4vLyAgIGluY2x1ZGVkLiBJZiBgaW5jbHVkZTpgID0gJ2ZpbHRlcicsIGBmaWx0ZXJzYCBtdXN0IGJlIHByZXNlbnQ7IG90aGVyd2lzZSwgaXQgbXVzdCBiZSBvbWl0dGVkLlxyXG4vLyBgY29tYmF0YW50SWRGaWVsZHM6YCBhcmUgZmllbGQgaW5kaWNlcyBjb250YWluaW5nIGNvbWJhdGFudElkcy4gSWYgc3BlY2lmaWVkLCB0aGVzZSBmaWVsZHNcclxuLy8gICB3aWxsIGJlIGNoZWNrZWQgZm9yIGlnbm9yZWQgY29tYmF0YW50cyAoZS5nLiBwZXRzKSBkdXJpbmcgbG9nIGZpbHRlcmluZy5cclxuZXhwb3J0IHR5cGUgQW5hbHlzaXNPcHRpb25zPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgaW5jbHVkZTogJ25ldmVyJztcclxuICBmaWx0ZXJzPzogdW5kZWZpbmVkO1xyXG4gIGNvbWJhdGFudElkRmllbGRzPzogdW5kZWZpbmVkO1xyXG59IHwge1xyXG4gIGluY2x1ZGU6ICdmaWx0ZXInO1xyXG4gIGZpbHRlcnM6IE5ldFBhcmFtc1tLXSB8IHJlYWRvbmx5IE5ldFBhcmFtc1tLXVtdO1xyXG4gIGNvbWJhdGFudElkRmllbGRzPzogTG9nRGVmRmllbGRJZHg8Sz4gfCByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG59IHwge1xyXG4gIGluY2x1ZGU6ICdhbGwnO1xyXG4gIGZpbHRlcnM/OiB1bmRlZmluZWQ7XHJcbiAgY29tYmF0YW50SWRGaWVsZHM/OiBMb2dEZWZGaWVsZElkeDxLPiB8IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbn07XHJcblxyXG4vLyBUT0RPOiBNYXliZSBicmluZyBpbiBhIGhlbHBlciBsaWJyYXJ5IHRoYXQgY2FuIGNvbXBpbGUtdGltZSBleHRyYWN0IHRoZXNlIGtleXMgaW5zdGVhZD9cclxuY29uc3QgY29tYmF0YW50TWVtb3J5S2V5czogcmVhZG9ubHkgKEV4dHJhY3Q8a2V5b2YgUGx1Z2luQ29tYmF0YW50U3RhdGUsIHN0cmluZz4pW10gPSBbXHJcbiAgJ0N1cnJlbnRXb3JsZElEJyxcclxuICAnV29ybGRJRCcsXHJcbiAgJ1dvcmxkTmFtZScsXHJcbiAgJ0JOcGNJRCcsXHJcbiAgJ0JOcGNOYW1lSUQnLFxyXG4gICdQYXJ0eVR5cGUnLFxyXG4gICdJRCcsXHJcbiAgJ093bmVySUQnLFxyXG4gICdXZWFwb25JZCcsXHJcbiAgJ1R5cGUnLFxyXG4gICdKb2InLFxyXG4gICdMZXZlbCcsXHJcbiAgJ05hbWUnLFxyXG4gICdDdXJyZW50SFAnLFxyXG4gICdNYXhIUCcsXHJcbiAgJ0N1cnJlbnRNUCcsXHJcbiAgJ01heE1QJyxcclxuICAnUG9zWCcsXHJcbiAgJ1Bvc1knLFxyXG4gICdQb3NaJyxcclxuICAnSGVhZGluZycsXHJcbiAgJ01vbnN0ZXJUeXBlJyxcclxuICAnU3RhdHVzJyxcclxuICAnTW9kZWxTdGF0dXMnLFxyXG4gICdBZ2dyZXNzaW9uU3RhdHVzJyxcclxuICAnVGFyZ2V0SUQnLFxyXG4gICdJc1RhcmdldGFibGUnLFxyXG4gICdSYWRpdXMnLFxyXG4gICdEaXN0YW5jZScsXHJcbiAgJ0VmZmVjdGl2ZURpc3RhbmNlJyxcclxuICAnTlBDVGFyZ2V0SUQnLFxyXG4gICdDdXJyZW50R1AnLFxyXG4gICdNYXhHUCcsXHJcbiAgJ0N1cnJlbnRDUCcsXHJcbiAgJ01heENQJyxcclxuICAnUENUYXJnZXRJRCcsXHJcbiAgJ0lzQ2FzdGluZzEnLFxyXG4gICdJc0Nhc3RpbmcyJyxcclxuICAnQ2FzdEJ1ZmZJRCcsXHJcbiAgJ0Nhc3RUYXJnZXRJRCcsXHJcbiAgJ0Nhc3RHcm91bmRUYXJnZXRYJyxcclxuICAnQ2FzdEdyb3VuZFRhcmdldFknLFxyXG4gICdDYXN0R3JvdW5kVGFyZ2V0WicsXHJcbiAgJ0Nhc3REdXJhdGlvbkN1cnJlbnQnLFxyXG4gICdDYXN0RHVyYXRpb25NYXgnLFxyXG4gICdUcmFuc2Zvcm1hdGlvbklkJyxcclxuXSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IGxhdGVzdExvZ0RlZmluaXRpb25zID0ge1xyXG4gIEdhbWVMb2c6IHtcclxuICAgIHR5cGU6ICcwMCcsXHJcbiAgICBuYW1lOiAnR2FtZUxvZycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQ2hhdExvZycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBjb2RlOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBsaW5lOiA0LFxyXG4gICAgfSxcclxuICAgIHN1YkZpZWxkczoge1xyXG4gICAgICBjb2RlOiB7XHJcbiAgICAgICAgJzAwMzknOiB7XHJcbiAgICAgICAgICBuYW1lOiAnbWVzc2FnZScsXHJcbiAgICAgICAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnMDAzOCc6IHtcclxuICAgICAgICAgIG5hbWU6ICdlY2hvJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcwMDQ0Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ2RpYWxvZycsXHJcbiAgICAgICAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgICAnMDgzOSc6IHtcclxuICAgICAgICAgIG5hbWU6ICdtZXNzYWdlJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IGNvZGU6IFsnMDA0NCcsICcwODM5J10gfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDaGFuZ2Vab25lOiB7XHJcbiAgICB0eXBlOiAnMDEnLFxyXG4gICAgbmFtZTogJ0NoYW5nZVpvbmUnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1RlcnJpdG9yeScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgIH0sXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENoYW5nZWRQbGF5ZXI6IHtcclxuICAgIHR5cGU6ICcwMicsXHJcbiAgICBuYW1lOiAnQ2hhbmdlZFBsYXllcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQ2hhbmdlUHJpbWFyeVBsYXllcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgQWRkZWRDb21iYXRhbnQ6IHtcclxuICAgIHR5cGU6ICcwMycsXHJcbiAgICBuYW1lOiAnQWRkZWRDb21iYXRhbnQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0FkZENvbWJhdGFudCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgam9iOiA0LFxyXG4gICAgICBsZXZlbDogNSxcclxuICAgICAgb3duZXJJZDogNixcclxuICAgICAgd29ybGRJZDogNyxcclxuICAgICAgd29ybGQ6IDgsXHJcbiAgICAgIG5wY05hbWVJZDogOSxcclxuICAgICAgbnBjQmFzZUlkOiAxMCxcclxuICAgICAgY3VycmVudEhwOiAxMSxcclxuICAgICAgaHA6IDEyLFxyXG4gICAgICBjdXJyZW50TXA6IDEzLFxyXG4gICAgICBtcDogMTQsXHJcbiAgICAgIC8vIG1heFRwOiAxNSxcclxuICAgICAgLy8gdHA6IDE2LFxyXG4gICAgICB4OiAxNyxcclxuICAgICAgeTogMTgsXHJcbiAgICAgIHo6IDE5LFxyXG4gICAgICBoZWFkaW5nOiAyMCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBpZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFJlbW92ZWRDb21iYXRhbnQ6IHtcclxuICAgIHR5cGU6ICcwNCcsXHJcbiAgICBuYW1lOiAnUmVtb3ZlZENvbWJhdGFudCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUmVtb3ZlQ29tYmF0YW50JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBqb2I6IDQsXHJcbiAgICAgIGxldmVsOiA1LFxyXG4gICAgICBvd25lcjogNixcclxuICAgICAgd29ybGQ6IDgsXHJcbiAgICAgIG5wY05hbWVJZDogOSxcclxuICAgICAgbnBjQmFzZUlkOiAxMCxcclxuICAgICAgY3VycmVudEhwOiAxMSxcclxuICAgICAgaHA6IDEyLFxyXG4gICAgICBjdXJyZW50TXA6IDEzLFxyXG4gICAgICBtcDogMTQsXHJcbiAgICAgIC8vIGN1cnJlbnRUcDogMTUsXHJcbiAgICAgIC8vIG1heFRwOiAxNixcclxuICAgICAgeDogMTcsXHJcbiAgICAgIHk6IDE4LFxyXG4gICAgICB6OiAxOSxcclxuICAgICAgaGVhZGluZzogMjAsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgaWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNvbWJhdGFudHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBQYXJ0eUxpc3Q6IHtcclxuICAgIHR5cGU6ICcxMScsXHJcbiAgICBuYW1lOiAnUGFydHlMaXN0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdQYXJ0eUxpc3QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgcGFydHlDb3VudDogMixcclxuICAgICAgaWQwOiAzLFxyXG4gICAgICBpZDE6IDQsXHJcbiAgICAgIGlkMjogNSxcclxuICAgICAgaWQzOiA2LFxyXG4gICAgICBpZDQ6IDcsXHJcbiAgICAgIGlkNTogOCxcclxuICAgICAgaWQ2OiA5LFxyXG4gICAgICBpZDc6IDEwLFxyXG4gICAgICBpZDg6IDExLFxyXG4gICAgICBpZDk6IDEyLFxyXG4gICAgICBpZDEwOiAxMyxcclxuICAgICAgaWQxMTogMTQsXHJcbiAgICAgIGlkMTI6IDE1LFxyXG4gICAgICBpZDEzOiAxNixcclxuICAgICAgaWQxNDogMTcsXHJcbiAgICAgIGlkMTU6IDE4LFxyXG4gICAgICBpZDE2OiAxOSxcclxuICAgICAgaWQxNzogMjAsXHJcbiAgICAgIGlkMTg6IDIxLFxyXG4gICAgICBpZDE5OiAyMixcclxuICAgICAgaWQyMDogMjMsXHJcbiAgICAgIGlkMjE6IDI0LFxyXG4gICAgICBpZDIyOiAyNSxcclxuICAgICAgaWQyMzogMjYsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDM6IG51bGwsXHJcbiAgICAgIDQ6IG51bGwsXHJcbiAgICAgIDU6IG51bGwsXHJcbiAgICAgIDY6IG51bGwsXHJcbiAgICAgIDc6IG51bGwsXHJcbiAgICAgIDg6IG51bGwsXHJcbiAgICAgIDk6IG51bGwsXHJcbiAgICAgIDEwOiBudWxsLFxyXG4gICAgICAxMTogbnVsbCxcclxuICAgICAgMTI6IG51bGwsXHJcbiAgICAgIDEzOiBudWxsLFxyXG4gICAgICAxNDogbnVsbCxcclxuICAgICAgMTU6IG51bGwsXHJcbiAgICAgIDE2OiBudWxsLFxyXG4gICAgICAxNzogbnVsbCxcclxuICAgICAgMTg6IG51bGwsXHJcbiAgICAgIDE5OiBudWxsLFxyXG4gICAgICAyMDogbnVsbCxcclxuICAgICAgMjE6IG51bGwsXHJcbiAgICAgIDIyOiBudWxsLFxyXG4gICAgICAyMzogbnVsbCxcclxuICAgICAgMjQ6IG51bGwsXHJcbiAgICAgIDI1OiBudWxsLFxyXG4gICAgICAyNjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDMsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICB9LFxyXG4gIFBsYXllclN0YXRzOiB7XHJcbiAgICB0eXBlOiAnMTInLFxyXG4gICAgbmFtZTogJ1BsYXllclN0YXRzJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdQbGF5ZXJTdGF0cycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBqb2I6IDIsXHJcbiAgICAgIHN0cmVuZ3RoOiAzLFxyXG4gICAgICBkZXh0ZXJpdHk6IDQsXHJcbiAgICAgIHZpdGFsaXR5OiA1LFxyXG4gICAgICBpbnRlbGxpZ2VuY2U6IDYsXHJcbiAgICAgIG1pbmQ6IDcsXHJcbiAgICAgIHBpZXR5OiA4LFxyXG4gICAgICBhdHRhY2tQb3dlcjogOSxcclxuICAgICAgZGlyZWN0SGl0OiAxMCxcclxuICAgICAgY3JpdGljYWxIaXQ6IDExLFxyXG4gICAgICBhdHRhY2tNYWdpY1BvdGVuY3k6IDEyLFxyXG4gICAgICBoZWFsTWFnaWNQb3RlbmN5OiAxMyxcclxuICAgICAgZGV0ZXJtaW5hdGlvbjogMTQsXHJcbiAgICAgIHNraWxsU3BlZWQ6IDE1LFxyXG4gICAgICBzcGVsbFNwZWVkOiAxNixcclxuICAgICAgdGVuYWNpdHk6IDE4LFxyXG4gICAgICBsb2NhbENvbnRlbnRJZDogMTksXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFN0YXJ0c1VzaW5nOiB7XHJcbiAgICB0eXBlOiAnMjAnLFxyXG4gICAgbmFtZTogJ1N0YXJ0c1VzaW5nJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGFydHNDYXN0aW5nJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBhYmlsaXR5OiA1LFxyXG4gICAgICB0YXJnZXRJZDogNixcclxuICAgICAgdGFyZ2V0OiA3LFxyXG4gICAgICBjYXN0VGltZTogOCxcclxuICAgICAgeDogOSxcclxuICAgICAgeTogMTAsXHJcbiAgICAgIHo6IDExLFxyXG4gICAgICBoZWFkaW5nOiAxMixcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogNSxcclxuICAgIGJsYW5rRmllbGRzOiBbNl0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogNyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgY2FzdHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDZdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFiaWxpdHk6IHtcclxuICAgIHR5cGU6ICcyMScsXHJcbiAgICBuYW1lOiAnQWJpbGl0eScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQWN0aW9uRWZmZWN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBhYmlsaXR5OiA1LFxyXG4gICAgICB0YXJnZXRJZDogNixcclxuICAgICAgdGFyZ2V0OiA3LFxyXG4gICAgICBmbGFnczogOCxcclxuICAgICAgZGFtYWdlOiA5LFxyXG4gICAgICB0YXJnZXRDdXJyZW50SHA6IDI0LFxyXG4gICAgICB0YXJnZXRNYXhIcDogMjUsXHJcbiAgICAgIHRhcmdldEN1cnJlbnRNcDogMjYsXHJcbiAgICAgIHRhcmdldE1heE1wOiAyNyxcclxuICAgICAgLy8gdGFyZ2V0Q3VycmVudFRwOiAyOCxcclxuICAgICAgLy8gdGFyZ2V0TWF4VHA6IDI5LFxyXG4gICAgICB0YXJnZXRYOiAzMCxcclxuICAgICAgdGFyZ2V0WTogMzEsXHJcbiAgICAgIHRhcmdldFo6IDMyLFxyXG4gICAgICB0YXJnZXRIZWFkaW5nOiAzMyxcclxuICAgICAgY3VycmVudEhwOiAzNCxcclxuICAgICAgbWF4SHA6IDM1LFxyXG4gICAgICBjdXJyZW50TXA6IDM2LFxyXG4gICAgICBtYXhNcDogMzcsXHJcbiAgICAgIC8vIGN1cnJlbnRUcDogMzg7XHJcbiAgICAgIC8vIG1heFRwOiAzOTtcclxuICAgICAgeDogNDAsXHJcbiAgICAgIHk6IDQxLFxyXG4gICAgICB6OiA0MixcclxuICAgICAgaGVhZGluZzogNDMsXHJcbiAgICAgIHNlcXVlbmNlOiA0NCxcclxuICAgICAgdGFyZ2V0SW5kZXg6IDQ1LFxyXG4gICAgICB0YXJnZXRDb3VudDogNDYsXHJcbiAgICAgIG93bmVySWQ6IDQ3LFxyXG4gICAgICBvd25lck5hbWU6IDQ4LFxyXG4gICAgICBlZmZlY3REaXNwbGF5VHlwZTogNDksXHJcbiAgICAgIGFjdGlvbklkOiA1MCxcclxuICAgICAgYWN0aW9uQW5pbWF0aW9uSWQ6IDUxLFxyXG4gICAgICBhbmltYXRpb25Mb2NrVGltZTogNTIsXHJcbiAgICAgIHJvdGF0aW9uSGV4OiA1MyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogNSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiA3LFxyXG4gICAgICA0NzogNDgsXHJcbiAgICB9LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2LCA0NywgNDhdLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGFiaWxpdGllcyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya0FPRUFiaWxpdHk6IHtcclxuICAgIHR5cGU6ICcyMicsXHJcbiAgICBuYW1lOiAnTmV0d29ya0FPRUFiaWxpdHknLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0FPRUFjdGlvbkVmZmVjdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgYWJpbGl0eTogNSxcclxuICAgICAgdGFyZ2V0SWQ6IDYsXHJcbiAgICAgIHRhcmdldDogNyxcclxuICAgICAgZmxhZ3M6IDgsXHJcbiAgICAgIGRhbWFnZTogOSxcclxuICAgICAgdGFyZ2V0Q3VycmVudEhwOiAyNCxcclxuICAgICAgdGFyZ2V0TWF4SHA6IDI1LFxyXG4gICAgICB0YXJnZXRDdXJyZW50TXA6IDI2LFxyXG4gICAgICB0YXJnZXRNYXhNcDogMjcsXHJcbiAgICAgIC8vIHRhcmdldEN1cnJlbnRUcDogMjgsXHJcbiAgICAgIC8vIHRhcmdldE1heFRwOiAyOSxcclxuICAgICAgdGFyZ2V0WDogMzAsXHJcbiAgICAgIHRhcmdldFk6IDMxLFxyXG4gICAgICB0YXJnZXRaOiAzMixcclxuICAgICAgdGFyZ2V0SGVhZGluZzogMzMsXHJcbiAgICAgIGN1cnJlbnRIcDogMzQsXHJcbiAgICAgIG1heEhwOiAzNSxcclxuICAgICAgY3VycmVudE1wOiAzNixcclxuICAgICAgbWF4TXA6IDM3LFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDM4O1xyXG4gICAgICAvLyBtYXhUcDogMzk7XHJcbiAgICAgIHg6IDQwLFxyXG4gICAgICB5OiA0MSxcclxuICAgICAgejogNDIsXHJcbiAgICAgIGhlYWRpbmc6IDQzLFxyXG4gICAgICBzZXF1ZW5jZTogNDQsXHJcbiAgICAgIHRhcmdldEluZGV4OiA0NSxcclxuICAgICAgdGFyZ2V0Q291bnQ6IDQ2LFxyXG4gICAgICBvd25lcklkOiA0NyxcclxuICAgICAgb3duZXJOYW1lOiA0OCxcclxuICAgICAgZWZmZWN0RGlzcGxheVR5cGU6IDQ5LFxyXG4gICAgICBhY3Rpb25JZDogNTAsXHJcbiAgICAgIGFjdGlvbkFuaW1hdGlvbklkOiA1MSxcclxuICAgICAgYW5pbWF0aW9uTG9ja1RpbWU6IDUyLFxyXG4gICAgICByb3RhdGlvbkhleDogNTMsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDUsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogNyxcclxuICAgICAgNDc6IDQ4LFxyXG4gICAgfSxcclxuICAgIGJsYW5rRmllbGRzOiBbNiwgNDcsIDQ4XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBhYmlsaXRpZXMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDZdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtDYW5jZWxBYmlsaXR5OiB7XHJcbiAgICB0eXBlOiAnMjMnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtDYW5jZWxBYmlsaXR5JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDYW5jZWxBY3Rpb24nLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIG5hbWU6IDUsXHJcbiAgICAgIHJlYXNvbjogNixcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogNSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBjb21iYXRhbnRzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya0RvVDoge1xyXG4gICAgdHlwZTogJzI0JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrRG9UJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdEb1RIb1QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIHdoaWNoOiA0LFxyXG4gICAgICBlZmZlY3RJZDogNSxcclxuICAgICAgZGFtYWdlOiA2LFxyXG4gICAgICBjdXJyZW50SHA6IDcsXHJcbiAgICAgIG1heEhwOiA4LFxyXG4gICAgICBjdXJyZW50TXA6IDksXHJcbiAgICAgIG1heE1wOiAxMCxcclxuICAgICAgLy8gY3VycmVudFRwOiAxMSxcclxuICAgICAgLy8gbWF4VHA6IDEyLFxyXG4gICAgICB4OiAxMyxcclxuICAgICAgeTogMTQsXHJcbiAgICAgIHo6IDE1LFxyXG4gICAgICBoZWFkaW5nOiAxNixcclxuICAgICAgc291cmNlSWQ6IDE3LFxyXG4gICAgICBzb3VyY2U6IDE4LFxyXG4gICAgICAvLyBBbiBpZCBudW1iZXIgbG9va3VwIGludG8gdGhlIEF0dGFja1R5cGUgdGFibGVcclxuICAgICAgZGFtYWdlVHlwZTogMTksXHJcbiAgICAgIHNvdXJjZUN1cnJlbnRIcDogMjAsXHJcbiAgICAgIHNvdXJjZU1heEhwOiAyMSxcclxuICAgICAgc291cmNlQ3VycmVudE1wOiAyMixcclxuICAgICAgc291cmNlTWF4TXA6IDIzLFxyXG4gICAgICAvLyBzb3VyY2VDdXJyZW50VHA6IDI0LFxyXG4gICAgICAvLyBzb3VyY2VNYXhUcDogMjUsXHJcbiAgICAgIHNvdXJjZVg6IDI2LFxyXG4gICAgICBzb3VyY2VZOiAyNyxcclxuICAgICAgc291cmNlWjogMjgsXHJcbiAgICAgIHNvdXJjZUhlYWRpbmc6IDI5LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICAxNzogMTgsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgLy8gRG9UIG9uIHBsYXllciB3aXRoIHZhbGlkIGVmZmVjdElkXHJcbiAgICAgICAgaWQ6ICcxLns3fScsXHJcbiAgICAgICAgd2hpY2g6ICdEb1QnLFxyXG4gICAgICAgIGVmZmVjdElkOiAnMCo/WzEtOUEtRl1bMC05QS1GXSonLCAvLyBub24temVybywgbm9uLWVtcHR5LCBwb3NzaWJseS1wYWRkZWQgdmFsdWVcclxuICAgICAgfSxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCAxN10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgV2FzRGVmZWF0ZWQ6IHtcclxuICAgIHR5cGU6ICcyNScsXHJcbiAgICBuYW1lOiAnV2FzRGVmZWF0ZWQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0RlYXRoJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHRhcmdldElkOiAyLFxyXG4gICAgICB0YXJnZXQ6IDMsXHJcbiAgICAgIHNvdXJjZUlkOiA0LFxyXG4gICAgICBzb3VyY2U6IDUsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDQ6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgdGFyZ2V0SWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNvbWJhdGFudHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMiwgLy8gZG9uJ3QgYXBwbHkgdG8gc291cmNlSWQ7IGFuIGlnbm9yZWQgY29tYmF0YW50IGlzIGEgdmFsaWQgc291cmNlXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgR2FpbnNFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICcyNicsXHJcbiAgICBuYW1lOiAnR2FpbnNFZmZlY3QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXR1c0FkZCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBlZmZlY3RJZDogMixcclxuICAgICAgZWZmZWN0OiAzLFxyXG4gICAgICBkdXJhdGlvbjogNCxcclxuICAgICAgc291cmNlSWQ6IDUsXHJcbiAgICAgIHNvdXJjZTogNixcclxuICAgICAgdGFyZ2V0SWQ6IDcsXHJcbiAgICAgIHRhcmdldDogOCxcclxuICAgICAgY291bnQ6IDksXHJcbiAgICAgIHRhcmdldE1heEhwOiAxMCxcclxuICAgICAgc291cmNlTWF4SHA6IDExLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiAzLFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDU6IDYsXHJcbiAgICAgIDc6IDgsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IFtcclxuICAgICAgICB7IC8vIGVmZmVjdCBmcm9tIGVudmlyb25tZW50L05QQyBhcHBsaWVkIHRvIHBsYXllclxyXG4gICAgICAgICAgc291cmNlSWQ6ICdbRTRdLns3fScsXHJcbiAgICAgICAgICB0YXJnZXRJZDogJzEuezd9JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gZWZmZWN0IGZyb20gZW52aXJvbm1lbnQvTlBDIGFwcGxpZWQgdG8gTlBDIChpbmNsdWRpbmcgaXRzZWxmKVxyXG4gICAgICAgICAgc291cmNlSWQ6ICdbRTRdLns3fScsXHJcbiAgICAgICAgICB0YXJnZXRJZDogJzQuezd9JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8ga25vd24gZWZmZWN0SWRzIG9mIGludGVyZXN0XHJcbiAgICAgICAgICBlZmZlY3RJZDogWydCOUEnLCAnODA4J10sXHJcbiAgICAgICAgfSxcclxuICAgICAgXSxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFs1LCA3XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBIZWFkTWFya2VyOiB7XHJcbiAgICB0eXBlOiAnMjcnLFxyXG4gICAgbmFtZTogJ0hlYWRNYXJrZXInLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1RhcmdldEljb24nLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgdGFyZ2V0SWQ6IDIsXHJcbiAgICAgIHRhcmdldDogMyxcclxuICAgICAgaWQ6IDYsXHJcbiAgICAgIGRhdGEwOiA3LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUGxheWVySWRzOiBbN10sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDcsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtSYWlkTWFya2VyOiB7XHJcbiAgICB0eXBlOiAnMjgnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtSYWlkTWFya2VyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdXYXltYXJrTWFya2VyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG9wZXJhdGlvbjogMixcclxuICAgICAgd2F5bWFyazogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIG5hbWU6IDUsXHJcbiAgICAgIHg6IDYsXHJcbiAgICAgIHk6IDcsXHJcbiAgICAgIHo6IDgsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDQ6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBOZXR3b3JrVGFyZ2V0TWFya2VyOiB7XHJcbiAgICB0eXBlOiAnMjknLFxyXG4gICAgbmFtZTogJ05ldHdvcmtUYXJnZXRNYXJrZXInLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1NpZ25NYXJrZXInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgb3BlcmF0aW9uOiAyLCAvLyBBZGQsIFVwZGF0ZSwgRGVsZXRlXHJcbiAgICAgIHdheW1hcms6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBuYW1lOiA1LFxyXG4gICAgICB0YXJnZXRJZDogNixcclxuICAgICAgdGFyZ2V0TmFtZTogNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgNDogNSxcclxuICAgICAgNjogNyxcclxuICAgIH0sXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIExvc2VzRWZmZWN0OiB7XHJcbiAgICB0eXBlOiAnMzAnLFxyXG4gICAgbmFtZTogJ0xvc2VzRWZmZWN0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGF0dXNSZW1vdmUnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgZWZmZWN0SWQ6IDIsXHJcbiAgICAgIGVmZmVjdDogMyxcclxuICAgICAgc291cmNlSWQ6IDUsXHJcbiAgICAgIHNvdXJjZTogNixcclxuICAgICAgdGFyZ2V0SWQ6IDcsXHJcbiAgICAgIHRhcmdldDogOCxcclxuICAgICAgY291bnQ6IDksXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDMsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgNTogNixcclxuICAgICAgNzogOCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogW1xyXG4gICAgICAgIHsgLy8gZWZmZWN0IGZyb20gZW52aXJvbm1lbnQvTlBDIGFwcGxpZWQgdG8gcGxheWVyXHJcbiAgICAgICAgICBzb3VyY2VJZDogJ1tFNF0uezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnMS57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBlZmZlY3QgZnJvbSBlbnZpcm9ubWVudC9OUEMgYXBwbGllZCB0byBOUEMgKGluY2x1ZGluZyBpdHNlbGYpXHJcbiAgICAgICAgICBzb3VyY2VJZDogJ1tFNF0uezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnNC57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBrbm93biBlZmZlY3RJZHMgb2YgaW50ZXJlc3RcclxuICAgICAgICAgIGVmZmVjdElkOiBbJ0I5QScsICc4MDgnXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzUsIDddLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtHYXVnZToge1xyXG4gICAgdHlwZTogJzMxJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrR2F1Z2UnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0dhdWdlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBkYXRhMDogMyxcclxuICAgICAgZGF0YTE6IDQsXHJcbiAgICAgIGRhdGEyOiA1LFxyXG4gICAgICBkYXRhMzogNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICAvLyBTb21ldGltZXMgdGhpcyBsYXN0IGZpZWxkIGxvb2tzIGxpa2UgYSBwbGF5ZXIgaWQuXHJcbiAgICAvLyBGb3Igc2FmZXR5LCBhbm9ueW1pemUgYWxsIG9mIHRoZSBnYXVnZSBkYXRhLlxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDMsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5ldHdvcmtXb3JsZDoge1xyXG4gICAgdHlwZTogJzMyJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrV29ybGQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1dvcmxkJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgaXNVbmtub3duOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBBY3RvckNvbnRyb2w6IHtcclxuICAgIHR5cGU6ICczMycsXHJcbiAgICBuYW1lOiAnQWN0b3JDb250cm9sJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdEaXJlY3RvcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpbnN0YW5jZTogMixcclxuICAgICAgY29tbWFuZDogMyxcclxuICAgICAgZGF0YTA6IDQsXHJcbiAgICAgIGRhdGExOiA1LFxyXG4gICAgICBkYXRhMjogNixcclxuICAgICAgZGF0YTM6IDcsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs0LCA1LCA2LCA3XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmFtZVRvZ2dsZToge1xyXG4gICAgdHlwZTogJzM0JyxcclxuICAgIG5hbWU6ICdOYW1lVG9nZ2xlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdOYW1lVG9nZ2xlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICB0YXJnZXRJZDogNCxcclxuICAgICAgdGFyZ2V0TmFtZTogNSxcclxuICAgICAgdG9nZ2xlOiA2LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgVGV0aGVyOiB7XHJcbiAgICB0eXBlOiAnMzUnLFxyXG4gICAgbmFtZTogJ1RldGhlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVGV0aGVyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIHRhcmdldElkOiA0LFxyXG4gICAgICB0YXJnZXQ6IDUsXHJcbiAgICAgIGlkOiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiA5LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTGltaXRCcmVhazoge1xyXG4gICAgdHlwZTogJzM2JyxcclxuICAgIG5hbWU6ICdMaW1pdEJyZWFrJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdMaW1pdEJyZWFrJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHZhbHVlSGV4OiAyLFxyXG4gICAgICBiYXJzOiAzLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTmV0d29ya0VmZmVjdFJlc3VsdDoge1xyXG4gICAgdHlwZTogJzM3JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrRWZmZWN0UmVzdWx0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdFZmZlY3RSZXN1bHQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIHNlcXVlbmNlSWQ6IDQsXHJcbiAgICAgIGN1cnJlbnRIcDogNSxcclxuICAgICAgbWF4SHA6IDYsXHJcbiAgICAgIGN1cnJlbnRNcDogNyxcclxuICAgICAgbWF4TXA6IDgsXHJcbiAgICAgIGN1cnJlbnRTaGllbGQ6IDksXHJcbiAgICAgIC8vIEZpZWxkIGluZGV4IDEwIGlzIGFsd2F5cyBgMGBcclxuICAgICAgeDogMTEsXHJcbiAgICAgIHk6IDEyLFxyXG4gICAgICB6OiAxMyxcclxuICAgICAgaGVhZGluZzogMTQsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDIyLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGF0dXNFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICczOCcsXHJcbiAgICBuYW1lOiAnU3RhdHVzRWZmZWN0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGF0dXNMaXN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHRhcmdldElkOiAyLFxyXG4gICAgICB0YXJnZXQ6IDMsXHJcbiAgICAgIGpvYkxldmVsRGF0YTogNCxcclxuICAgICAgaHA6IDUsXHJcbiAgICAgIG1heEhwOiA2LFxyXG4gICAgICBtcDogNyxcclxuICAgICAgbWF4TXA6IDgsXHJcbiAgICAgIGN1cnJlbnRTaGllbGQ6IDksXHJcbiAgICAgIC8vIEZpZWxkIGluZGV4IDEwIGlzIGFsd2F5cyBgMGBcclxuICAgICAgeDogMTEsXHJcbiAgICAgIHk6IDEyLFxyXG4gICAgICB6OiAxMyxcclxuICAgICAgaGVhZGluZzogMTQsXHJcbiAgICAgIGRhdGEwOiAxNSxcclxuICAgICAgZGF0YTE6IDE2LFxyXG4gICAgICBkYXRhMjogMTcsXHJcbiAgICAgIGRhdGEzOiAxOCxcclxuICAgICAgZGF0YTQ6IDE5LFxyXG4gICAgICBkYXRhNTogMjAsXHJcbiAgICAgIC8vIFZhcmlhYmxlIG51bWJlciBvZiB0cmlwbGV0cyBoZXJlLCBidXQgYXQgbGVhc3Qgb25lLlxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiAxOCxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogMTgsXHJcbiAgfSxcclxuICBOZXR3b3JrVXBkYXRlSFA6IHtcclxuICAgIHR5cGU6ICczOScsXHJcbiAgICBuYW1lOiAnTmV0d29ya1VwZGF0ZUhQJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdVcGRhdGVIcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgY3VycmVudEhwOiA0LFxyXG4gICAgICBtYXhIcDogNSxcclxuICAgICAgY3VycmVudE1wOiA2LFxyXG4gICAgICBtYXhNcDogNyxcclxuICAgICAgLy8gY3VycmVudFRwOiA4LFxyXG4gICAgICAvLyBtYXhUcDogOSxcclxuICAgICAgeDogMTAsXHJcbiAgICAgIHk6IDExLFxyXG4gICAgICB6OiAxMixcclxuICAgICAgaGVhZGluZzogMTMsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBNYXA6IHtcclxuICAgIHR5cGU6ICc0MCcsXHJcbiAgICBuYW1lOiAnTWFwJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGFuZ2VNYXAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHJlZ2lvbk5hbWU6IDMsXHJcbiAgICAgIHBsYWNlTmFtZTogNCxcclxuICAgICAgcGxhY2VOYW1lU3ViOiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3lzdGVtTG9nTWVzc2FnZToge1xyXG4gICAgdHlwZTogJzQxJyxcclxuICAgIG5hbWU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgcGFyYW0wOiA0LFxyXG4gICAgICBwYXJhbTE6IDUsXHJcbiAgICAgIHBhcmFtMjogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGF0dXNMaXN0Mzoge1xyXG4gICAgdHlwZTogJzQyJyxcclxuICAgIG5hbWU6ICdTdGF0dXNMaXN0MycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzTGlzdDMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIC8vIHRyaXBsZXRzIG9mIGZpZWxkcyBmcm9tIGhlcmUgKGVmZmVjdElkLCBkYXRhLCBwbGF5ZXJJZCk/XHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA0LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDQsXHJcbiAgfSxcclxuICBQYXJzZXJJbmZvOiB7XHJcbiAgICB0eXBlOiAnMjQ5JyxcclxuICAgIG5hbWU6ICdQYXJzZXJJbmZvJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTZXR0aW5ncycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFByb2Nlc3NJbmZvOiB7XHJcbiAgICB0eXBlOiAnMjUwJyxcclxuICAgIG5hbWU6ICdQcm9jZXNzSW5mbycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUHJvY2VzcycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIERlYnVnOiB7XHJcbiAgICB0eXBlOiAnMjUxJyxcclxuICAgIG5hbWU6ICdEZWJ1ZycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRGVidWcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiBmYWxzZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgUGFja2V0RHVtcDoge1xyXG4gICAgdHlwZTogJzI1MicsXHJcbiAgICBuYW1lOiAnUGFja2V0RHVtcCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUGFja2V0RHVtcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogZmFsc2UsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFZlcnNpb246IHtcclxuICAgIHR5cGU6ICcyNTMnLFxyXG4gICAgbmFtZTogJ1ZlcnNpb24nLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1ZlcnNpb24nLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBFcnJvcjoge1xyXG4gICAgdHlwZTogJzI1NCcsXHJcbiAgICBuYW1lOiAnRXJyb3InLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0Vycm9yJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiBmYWxzZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTm9uZToge1xyXG4gICAgdHlwZTogJ1swLTldKycsXHJcbiAgICBuYW1lOiAnTm9uZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnTm9uZScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGlzVW5rbm93bjogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLy8gT3ZlcmxheVBsdWdpbiBsb2cgbGluZXNcclxuICBMaW5lUmVnaXN0cmF0aW9uOiB7XHJcbiAgICB0eXBlOiAnMjU2JyxcclxuICAgIG5hbWU6ICdMaW5lUmVnaXN0cmF0aW9uJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNTYnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgbmFtZTogNCxcclxuICAgICAgdmVyc2lvbjogNSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBNYXBFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICcyNTcnLFxyXG4gICAgbmFtZTogJ01hcEVmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU3JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBmbGFnczogMyxcclxuICAgICAgLy8gdmFsdWVzIGZvciB0aGUgbG9jYXRpb24gZmllbGQgc2VlbSB0byB2YXJ5IGJldHdlZW4gaW5zdGFuY2VzXHJcbiAgICAgIC8vIChlLmcuIGEgbG9jYXRpb24gb2YgJzA4JyBpbiBQNVMgZG9lcyBub3QgYXBwZWFyIHRvIGJlIHRoZSBzYW1lIGxvY2F0aW9uIGluIFA1UyBhcyBpbiBQNlMpXHJcbiAgICAgIC8vIGJ1dCB0aGlzIGZpZWxkIGRvZXMgYXBwZWFyIHRvIGNvbnNpc3RlbnRseSBjb250YWluIHBvc2l0aW9uIGluZm8gZm9yIHRoZSBlZmZlY3QgcmVuZGVyaW5nXHJcbiAgICAgIGxvY2F0aW9uOiA0LFxyXG4gICAgICBkYXRhMDogNSxcclxuICAgICAgZGF0YTE6IDYsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgRmF0ZURpcmVjdG9yOiB7XHJcbiAgICB0eXBlOiAnMjU4JyxcclxuICAgIG5hbWU6ICdGYXRlRGlyZWN0b3InLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI1OCcsXHJcbiAgICAvLyBmYXRlSWQgYW5kIHByb2dyZXNzIGFyZSBpbiBoZXguXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBjYXRlZ29yeTogMixcclxuICAgICAgLy8gcGFkZGluZzA6IDMsXHJcbiAgICAgIGZhdGVJZDogNCxcclxuICAgICAgcHJvZ3Jlc3M6IDUsXHJcbiAgICAgIC8vIHBhcmFtMzogNixcclxuICAgICAgLy8gcGFyYW00OiA3LFxyXG4gICAgICAvLyBwYXJhbTU6IDgsXHJcbiAgICAgIC8vIHBhcmFtNjogOSxcclxuICAgICAgLy8gcGFkZGluZzE6IDEwLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgQ0VEaXJlY3Rvcjoge1xyXG4gICAgdHlwZTogJzI1OScsXHJcbiAgICBuYW1lOiAnQ0VEaXJlY3RvcicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU5JyxcclxuICAgIC8vIGFsbCBmaWVsZHMgYXJlIGluIGhleFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgcG9wVGltZTogMixcclxuICAgICAgdGltZVJlbWFpbmluZzogMyxcclxuICAgICAgLy8gdW5rbm93bjA6IDQsXHJcbiAgICAgIGNlS2V5OiA1LFxyXG4gICAgICBudW1QbGF5ZXJzOiA2LFxyXG4gICAgICBzdGF0dXM6IDcsXHJcbiAgICAgIC8vIHVua25vd24xOiA4LFxyXG4gICAgICBwcm9ncmVzczogOSxcclxuICAgICAgLy8gdW5rbm93bjI6IDEwLFxyXG4gICAgICAvLyB1bmtub3duMzogMTEsXHJcbiAgICAgIC8vIHVua25vd240OiAxMixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIEluQ29tYmF0OiB7XHJcbiAgICB0eXBlOiAnMjYwJyxcclxuICAgIG5hbWU6ICdJbkNvbWJhdCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYwJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluQUNUQ29tYmF0OiAyLFxyXG4gICAgICBpbkdhbWVDb21iYXQ6IDMsXHJcbiAgICAgIGlzQUNUQ2hhbmdlZDogNCxcclxuICAgICAgaXNHYW1lQ2hhbmdlZDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDb21iYXRhbnRNZW1vcnk6IHtcclxuICAgIHR5cGU6ICcyNjEnLFxyXG4gICAgbmFtZTogJ0NvbWJhdGFudE1lbW9yeScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYxJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGNoYW5nZTogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIC8vIGZyb20gaGVyZSwgcGFpcnMgb2YgZmllbGQgbmFtZS92YWx1ZXNcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDUsXHJcbiAgICAvLyBkb2Vzbid0IHVzZSBgcGxheWVySWRzYCwgYXMgdGhlIGBpZGAgZmllbGQgbXVzdCBiZSBoYW5kbGVkIHdpdGggdGhlICdOYW1lJyByZXBlYXRpbmcgZmllbGRcclxuICAgIHJlcGVhdGluZ0ZpZWxkczoge1xyXG4gICAgICBzdGFydGluZ0luZGV4OiA0LFxyXG4gICAgICBsYWJlbDogJ3BhaXInLFxyXG4gICAgICBuYW1lczogWydrZXknLCAndmFsdWUnXSxcclxuICAgICAgc29ydEtleXM6IHRydWUsXHJcbiAgICAgIHByaW1hcnlLZXk6ICdrZXknLFxyXG4gICAgICBwb3NzaWJsZUtleXM6IGNvbWJhdGFudE1lbW9yeUtleXMsXHJcbiAgICAgIGtleXNUb0Fub255bWl6ZToge1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBxdW90ZS1wcm9wc1xyXG4gICAgICAgIDM6ICdOYW1lJywgLy8gJ0lEJyByZXBlYXRpbmcgZmllbGQgbm90IHVzZWQ/IG5lZWQgdG8gdXNlIG5vbi1yZXBlYXRpbmcgYGlkYCAoMykgZmllbGRcclxuICAgICAgICAnT3duZXJJRCc6IG51bGwsXHJcbiAgICAgICAgJ1RhcmdldElEJzogbnVsbCxcclxuICAgICAgICAnUENUYXJnZXRJRCc6IG51bGwsXHJcbiAgICAgICAgJ05QQ1RhcmdldElEJzogbnVsbCxcclxuICAgICAgICAnQ2FzdFRhcmdldElEJzogbnVsbCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIC8vIFRPRE86IFRoaXMgaXMgYW4gaW5pdGlhbCBhdHRlbXB0IHRvIGNhcHR1cmUgZmllbGQgY2hhbmdlcyB0aGF0IGFyZSByZWxldmFudCB0byBhbmFseXNpcyxcclxuICAgICAgLy8gYnV0IHRoaXMgd2lsbCBsaWtlbHkgbmVlZCB0byBiZSByZWZpbmVkIG92ZXIgdGltZVxyXG4gICAgICBmaWx0ZXJzOiBbXHJcbiAgICAgICAgeyAvLyBUT0RPOiBNb2RlbFN0YXR1cyBjYW4gYmUgYSBsaXR0bGUgc3BhbW15LiBTaG91bGQgdHJ5IHRvIHJlZmluZSB0aGlzIGZ1cnRoZXIuXHJcbiAgICAgICAgICBpZDogJzQuezd9JyxcclxuICAgICAgICAgIGNoYW5nZTogJ0NoYW5nZScsXHJcbiAgICAgICAgICBwYWlyOiBbeyBrZXk6ICdNb2RlbFN0YXR1cycsIHZhbHVlOiAnLionIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaWQ6ICc0Lns3fScsXHJcbiAgICAgICAgICBjaGFuZ2U6ICdDaGFuZ2UnLFxyXG4gICAgICAgICAgcGFpcjogW3sga2V5OiAnV2VhcG9uSWQnLCB2YWx1ZTogJy4qJyB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnNC57N30nLFxyXG4gICAgICAgICAgY2hhbmdlOiAnQ2hhbmdlJyxcclxuICAgICAgICAgIHBhaXI6IFt7IGtleTogJ1RyYW5zZm9ybWF0aW9uSWQnLCB2YWx1ZTogJy4qJyB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBSU1ZEYXRhOiB7XHJcbiAgICB0eXBlOiAnMjYyJyxcclxuICAgIG5hbWU6ICdSU1ZEYXRhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgbG9jYWxlOiAyLFxyXG4gICAgICAvLyB1bmtub3duMDogMyxcclxuICAgICAga2V5OiA0LFxyXG4gICAgICB2YWx1ZTogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICAvLyBSU1Ygc3Vic3RpdHV0aW9ucyBhcmUgcGVyZm9ybWVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGZpbHRlclxyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFN0YXJ0c1VzaW5nRXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNjMnLFxyXG4gICAgbmFtZTogJ1N0YXJ0c1VzaW5nRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2MycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIHg6IDQsXHJcbiAgICAgIHk6IDUsXHJcbiAgICAgIHo6IDYsXHJcbiAgICAgIGhlYWRpbmc6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNhc3RzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWJpbGl0eUV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjY0JyxcclxuICAgIG5hbWU6ICdBYmlsaXR5RXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIGdsb2JhbEVmZmVjdENvdW50ZXI6IDQsXHJcbiAgICAgIGRhdGFGbGFnOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgICBoZWFkaW5nOiA5LFxyXG4gICAgICBhbmltYXRpb25UYXJnZXRJZDogMTAsXHJcbiAgICB9LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2LCA3LCA4XSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgICAxMDogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgY2FzdHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDEwXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDb250ZW50RmluZGVyU2V0dGluZ3M6IHtcclxuICAgIHR5cGU6ICcyNjUnLFxyXG4gICAgbmFtZTogJ0NvbnRlbnRGaW5kZXJTZXR0aW5ncycsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY1JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHpvbmVJZDogMixcclxuICAgICAgem9uZU5hbWU6IDMsXHJcbiAgICAgIGluQ29udGVudEZpbmRlckNvbnRlbnQ6IDQsXHJcbiAgICAgIHVucmVzdHJpY3RlZFBhcnR5OiA1LFxyXG4gICAgICBtaW5pbWFsSXRlbUxldmVsOiA2LFxyXG4gICAgICBzaWxlbmNlRWNobzogNyxcclxuICAgICAgZXhwbG9yZXJNb2RlOiA4LFxyXG4gICAgICBsZXZlbFN5bmM6IDksXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBOcGNZZWxsOiB7XHJcbiAgICB0eXBlOiAnMjY2JyxcclxuICAgIG5hbWU6ICdOcGNZZWxsJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjYnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgbnBjSWQ6IDIsXHJcbiAgICAgIG5wY05hbWVJZDogMyxcclxuICAgICAgbnBjWWVsbElkOiA0LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBCYXR0bGVUYWxrMjoge1xyXG4gICAgdHlwZTogJzI2NycsXHJcbiAgICBuYW1lOiAnQmF0dGxlVGFsazInLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBucGNJZDogMixcclxuICAgICAgaW5zdGFuY2U6IDMsXHJcbiAgICAgIG5wY05hbWVJZDogNCxcclxuICAgICAgaW5zdGFuY2VDb250ZW50VGV4dElkOiA1LFxyXG4gICAgICBkaXNwbGF5TXM6IDYsXHJcbiAgICAgIC8vIHVua25vd24xOiA3LFxyXG4gICAgICAvLyB1bmtub3duMjogOCxcclxuICAgICAgLy8gdW5rbm93bjM6IDksXHJcbiAgICAgIC8vIHVua25vd240OiAxMCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ291bnRkb3duOiB7XHJcbiAgICB0eXBlOiAnMjY4JyxcclxuICAgIG5hbWU6ICdDb3VudGRvd24nLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2OCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgd29ybGRJZDogMyxcclxuICAgICAgY291bnRkb3duVGltZTogNCxcclxuICAgICAgcmVzdWx0OiA1LFxyXG4gICAgICBuYW1lOiA2LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiA2LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ291bnRkb3duQ2FuY2VsOiB7XHJcbiAgICB0eXBlOiAnMjY5JyxcclxuICAgIG5hbWU6ICdDb3VudGRvd25DYW5jZWwnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2OScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgd29ybGRJZDogMyxcclxuICAgICAgbmFtZTogNCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogNCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFjdG9yTW92ZToge1xyXG4gICAgdHlwZTogJzI3MCcsXHJcbiAgICBuYW1lOiAnQWN0b3JNb3ZlJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGhlYWRpbmc6IDMsIC8vIE9QIGNhbGxzIHRoaXMgJ3JvdGF0aW9uJywgYnV0IGNhY3Rib3QgY29uc2lzdGVudGx5IHVzZXMgJ2hlYWRpbmcnXHJcbiAgICAgIC8vIHVua25vd24xOiA0LFxyXG4gICAgICBtb3ZlVHlwZTogNSxcclxuICAgICAgeDogNixcclxuICAgICAgeTogNyxcclxuICAgICAgejogOCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICAvLyBubyByZWFsIHdheSB0byBmaWx0ZXIgbm9pc2UsIGV2ZW4gaWYgKGluZnJlcXVlbnRseSkgdXNlZCBmb3IgdHJpZ2dlcnNcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBBY3RvclNldFBvczoge1xyXG4gICAgdHlwZTogJzI3MScsXHJcbiAgICBuYW1lOiAnQWN0b3JTZXRQb3MnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3MScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgaGVhZGluZzogMywgLy8gT1AgY2FsbHMgdGhpcyAncm90YXRpb24nLCBidXQgY2FjdGJvdCBjb25zaXN0ZW50bHkgdXNlcyAnaGVhZGluZydcclxuICAgICAgLy8gdW5rbm93bjE6IDQsXHJcbiAgICAgIC8vIHVua25vd24yOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IGlkOiAnNC57N30nIH0sIC8vIE5QQ3Mgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBTcGF3bk5wY0V4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjcyJyxcclxuICAgIG5hbWU6ICdTcGF3bk5wY0V4dHJhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHBhcmVudElkOiAzLFxyXG4gICAgICB0ZXRoZXJJZDogNCxcclxuICAgICAgYW5pbWF0aW9uU3RhdGU6IDUsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDM6IG51bGwsIC8vIGBpZGAgaXMgYW4gbnBjLCBidXQgcGFyZW50SWQgY291bGQgYmUgYSB0ZXRoZXJlZCBwbGF5ZXI/XHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgM10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JDb250cm9sRXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNzMnLFxyXG4gICAgbmFtZTogJ0FjdG9yQ29udHJvbEV4dHJhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGNhdGVnb3J5OiAzLFxyXG4gICAgICBwYXJhbTE6IDQsXHJcbiAgICAgIHBhcmFtMjogNSxcclxuICAgICAgcGFyYW0zOiA2LFxyXG4gICAgICBwYXJhbTQ6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs0LCA1LCA2LCA3XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBBY3RvckNvbnRyb2xTZWxmRXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNzQnLFxyXG4gICAgbmFtZTogJ0FjdG9yQ29udHJvbFNlbGZFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjc0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBjYXRlZ29yeTogMyxcclxuICAgICAgcGFyYW0xOiA0LFxyXG4gICAgICBwYXJhbTI6IDUsXHJcbiAgICAgIHBhcmFtMzogNixcclxuICAgICAgcGFyYW00OiA3LFxyXG4gICAgICBwYXJhbTU6IDgsXHJcbiAgICAgIHBhcmFtNjogOSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVBsYXllcklkczogWzQsIDUsIDYsIDcsIDgsIDldLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvZ0RlZmluaXRpb25zVmVyc2lvbnMgPSB7XHJcbiAgJ2xhdGVzdCc6IGxhdGVzdExvZ0RlZmluaXRpb25zLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gVmVyaWZ5IHRoYXQgdGhpcyBoYXMgdGhlIHJpZ2h0IHR5cGUsIGJ1dCBleHBvcnQgYGFzIGNvbnN0YC5cclxuY29uc3QgYXNzZXJ0TG9nRGVmaW5pdGlvbnM6IExvZ0RlZmluaXRpb25NYXAgPSBsYXRlc3RMb2dEZWZpbml0aW9ucztcclxuY29uc29sZS5hc3NlcnQoYXNzZXJ0TG9nRGVmaW5pdGlvbnMpO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvbnMgPSB0eXBlb2YgbGF0ZXN0TG9nRGVmaW5pdGlvbnM7XHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25OYW1lID0ga2V5b2YgTG9nRGVmaW5pdGlvbnM7XHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25UeXBlID0gTG9nRGVmaW5pdGlvbnNbTG9nRGVmaW5pdGlvbk5hbWVdWyd0eXBlJ107XHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25NYXAgPSB7IFtLIGluIExvZ0RlZmluaXRpb25OYW1lXTogTG9nRGVmaW5pdGlvbjxLPiB9O1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uVmVyc2lvbnMgPSBrZXlvZiB0eXBlb2YgbG9nRGVmaW5pdGlvbnNWZXJzaW9ucztcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTmFycm93aW5nVHlwZSA9IHsgcmVhZG9ubHkgcmVwZWF0aW5nRmllbGRzOiB1bmtub3duIH07XHJcblxyXG5leHBvcnQgdHlwZSBSZXBlYXRpbmdGaWVsZHNUeXBlcyA9IGtleW9mIHtcclxuICBbXHJcbiAgICB0eXBlIGluIExvZ0RlZmluaXRpb25OYW1lIGFzIExvZ0RlZmluaXRpb25zW3R5cGVdIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzTmFycm93aW5nVHlwZSA/IHR5cGVcclxuICAgICAgOiBuZXZlclxyXG4gIF06IG51bGw7XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9ucyA9IHtcclxuICBbdHlwZSBpbiBSZXBlYXRpbmdGaWVsZHNUeXBlc106IExvZ0RlZmluaXRpb25zW3R5cGVdICYge1xyXG4gICAgcmVhZG9ubHkgcmVwZWF0aW5nRmllbGRzOiBFeGNsdWRlPExvZ0RlZmluaXRpb25zW3R5cGVdWydyZXBlYXRpbmdGaWVsZHMnXSwgdW5kZWZpbmVkPjtcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGFyc2VIZWxwZXJGaWVsZDxcclxuICBUeXBlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRmllbGRzIGV4dGVuZHMgTmV0RmllbGRzUmV2ZXJzZVtUeXBlXSxcclxuICBGaWVsZCBleHRlbmRzIGtleW9mIEZpZWxkcyxcclxuPiA9IHtcclxuICBmaWVsZDogRmllbGRzW0ZpZWxkXSBleHRlbmRzIHN0cmluZyA/IEZpZWxkc1tGaWVsZF0gOiBuZXZlcjtcclxuICB2YWx1ZT86IHN0cmluZztcclxuICBvcHRpb25hbD86IGJvb2xlYW47XHJcbiAgcmVwZWF0aW5nPzogYm9vbGVhbjtcclxuICByZXBlYXRpbmdLZXlzPzogc3RyaW5nW107XHJcbiAgc29ydEtleXM/OiBib29sZWFuO1xyXG4gIHByaW1hcnlLZXk/OiBzdHJpbmc7XHJcbiAgcG9zc2libGVLZXlzPzogc3RyaW5nW107XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQYXJzZUhlbHBlckZpZWxkczxUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIFtmaWVsZCBpbiBrZXlvZiBOZXRGaWVsZHNSZXZlcnNlW1RdXTogUGFyc2VIZWxwZXJGaWVsZDxULCBOZXRGaWVsZHNSZXZlcnNlW1RdLCBmaWVsZD47XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBsb2dEZWZpbml0aW9uc1ZlcnNpb25zWydsYXRlc3QnXTtcclxuIiwiLy8gSGVscGVyIEVycm9yIGZvciBUeXBlU2NyaXB0IHNpdHVhdGlvbnMgd2hlcmUgdGhlIHByb2dyYW1tZXIgdGhpbmtzIHRoZXlcclxuLy8ga25vdyBiZXR0ZXIgdGhhbiBUeXBlU2NyaXB0IHRoYXQgc29tZSBzaXR1YXRpb24gd2lsbCBuZXZlciBvY2N1ci5cclxuXHJcbi8vIFRoZSBpbnRlbnRpb24gaGVyZSBpcyB0aGF0IHRoZSBwcm9ncmFtbWVyIGRvZXMgbm90IGV4cGVjdCBhIHBhcnRpY3VsYXJcclxuLy8gYml0IG9mIGNvZGUgdG8gaGFwcGVuLCBhbmQgc28gaGFzIG5vdCB3cml0dGVuIGNhcmVmdWwgZXJyb3IgaGFuZGxpbmcuXHJcbi8vIElmIGl0IGRvZXMgb2NjdXIsIGF0IGxlYXN0IHRoZXJlIHdpbGwgYmUgYW4gZXJyb3IgYW5kIHdlIGNhbiBmaWd1cmUgb3V0IHdoeS5cclxuLy8gVGhpcyBpcyBwcmVmZXJhYmxlIHRvIGNhc3Rpbmcgb3IgZGlzYWJsaW5nIFR5cGVTY3JpcHQgYWx0b2dldGhlciBpbiBvcmRlciB0b1xyXG4vLyBhdm9pZCBzeW50YXggZXJyb3JzLlxyXG5cclxuLy8gT25lIGNvbW1vbiBleGFtcGxlIGlzIGEgcmVnZXgsIHdoZXJlIGlmIHRoZSByZWdleCBtYXRjaGVzIHRoZW4gYWxsIG9mIHRoZVxyXG4vLyAobm9uLW9wdGlvbmFsKSByZWdleCBncm91cHMgd2lsbCBhbHNvIGJlIHZhbGlkLCBidXQgVHlwZVNjcmlwdCBkb2Vzbid0IGtub3cuXHJcbmV4cG9ydCBjbGFzcyBVbnJlYWNoYWJsZUNvZGUgZXh0ZW5kcyBFcnJvciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcignVGhpcyBjb2RlIHNob3VsZG5cXCd0IGJlIHJlYWNoZWQnKTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmV0RmllbGRzLCBOZXRGaWVsZHNSZXZlcnNlIH0gZnJvbSAnLi4vdHlwZXMvbmV0X2ZpZWxkcyc7XHJcbmltcG9ydCB7IE5ldFBhcmFtcyB9IGZyb20gJy4uL3R5cGVzL25ldF9wcm9wcyc7XHJcbmltcG9ydCB7IENhY3Rib3RCYXNlUmVnRXhwIH0gZnJvbSAnLi4vdHlwZXMvbmV0X3RyaWdnZXInO1xyXG5cclxuaW1wb3J0IGxvZ0RlZmluaXRpb25zLCB7XHJcbiAgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgbG9nRGVmaW5pdGlvbnNWZXJzaW9ucyxcclxuICBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbiAgUGFyc2VIZWxwZXJGaWVsZHMsXHJcbiAgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnMsXHJcbiAgUmVwZWF0aW5nRmllbGRzVHlwZXMsXHJcbn0gZnJvbSAnLi9uZXRsb2dfZGVmcyc7XHJcbmltcG9ydCB7IFVucmVhY2hhYmxlQ29kZSB9IGZyb20gJy4vbm90X3JlYWNoZWQnO1xyXG5cclxuY29uc3Qgc2VwYXJhdG9yID0gJzonO1xyXG5jb25zdCBtYXRjaERlZmF1bHQgPSAnW146XSonO1xyXG5jb25zdCBtYXRjaFdpdGhDb2xvbnNEZWZhdWx0ID0gJyg/OlteOl18OiApKj8nO1xyXG5jb25zdCBmaWVsZHNXaXRoUG90ZW50aWFsQ29sb25zID0gWydlZmZlY3QnLCAnYWJpbGl0eSddO1xyXG5cclxuY29uc3QgZGVmYXVsdFBhcmFtcyA9IDxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgViBleHRlbmRzIExvZ0RlZmluaXRpb25WZXJzaW9ucyxcclxuPih0eXBlOiBULCB2ZXJzaW9uOiBWLCBpbmNsdWRlPzogc3RyaW5nW10pOiBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PiA9PiB7XHJcbiAgY29uc3QgbG9nVHlwZSA9IGxvZ0RlZmluaXRpb25zVmVyc2lvbnNbdmVyc2lvbl1bdHlwZV07XHJcbiAgaWYgKGluY2x1ZGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgaW5jbHVkZSA9IE9iamVjdC5rZXlzKGxvZ1R5cGUuZmllbGRzKTtcclxuICAgIGlmICgncmVwZWF0aW5nRmllbGRzJyBpbiBsb2dUeXBlKSB7XHJcbiAgICAgIGluY2x1ZGUucHVzaChsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXJhbXM6IHtcclxuICAgIFtpbmRleDogbnVtYmVyXToge1xyXG4gICAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgICB2YWx1ZT86IHN0cmluZztcclxuICAgICAgb3B0aW9uYWw6IGJvb2xlYW47XHJcbiAgICAgIHJlcGVhdGluZz86IGJvb2xlYW47XHJcbiAgICAgIHJlcGVhdGluZ0tleXM/OiBzdHJpbmdbXTtcclxuICAgICAgc29ydEtleXM/OiBib29sZWFuO1xyXG4gICAgICBwcmltYXJ5S2V5Pzogc3RyaW5nO1xyXG4gICAgICBwb3NzaWJsZUtleXM/OiBzdHJpbmdbXTtcclxuICAgIH07XHJcbiAgfSA9IHt9O1xyXG4gIGNvbnN0IGZpcnN0T3B0aW9uYWxGaWVsZCA9IGxvZ1R5cGUuZmlyc3RPcHRpb25hbEZpZWxkO1xyXG5cclxuICBmb3IgKGNvbnN0IFtwcm9wLCBpbmRleF0gb2YgT2JqZWN0LmVudHJpZXMobG9nVHlwZS5maWVsZHMpKSB7XHJcbiAgICBpZiAoIWluY2x1ZGUuaW5jbHVkZXMocHJvcCkpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgcGFyYW06IHsgZmllbGQ6IHN0cmluZzsgdmFsdWU/OiBzdHJpbmc7IG9wdGlvbmFsOiBib29sZWFuOyByZXBlYXRpbmc/OiBib29sZWFuIH0gPSB7XHJcbiAgICAgIGZpZWxkOiBwcm9wLFxyXG4gICAgICBvcHRpb25hbDogZmlyc3RPcHRpb25hbEZpZWxkICE9PSB1bmRlZmluZWQgJiYgaW5kZXggPj0gZmlyc3RPcHRpb25hbEZpZWxkLFxyXG4gICAgfTtcclxuICAgIGlmIChwcm9wID09PSAndHlwZScpXHJcbiAgICAgIHBhcmFtLnZhbHVlID0gbG9nVHlwZS50eXBlO1xyXG5cclxuICAgIHBhcmFtc1tpbmRleF0gPSBwYXJhbTtcclxuICB9XHJcblxyXG4gIGlmICgncmVwZWF0aW5nRmllbGRzJyBpbiBsb2dUeXBlICYmIGluY2x1ZGUuaW5jbHVkZXMobG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwpKSB7XHJcbiAgICBwYXJhbXNbbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc3RhcnRpbmdJbmRleF0gPSB7XHJcbiAgICAgIGZpZWxkOiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCxcclxuICAgICAgb3B0aW9uYWw6IGZpcnN0T3B0aW9uYWxGaWVsZCAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc3RhcnRpbmdJbmRleCA+PSBmaXJzdE9wdGlvbmFsRmllbGQsXHJcbiAgICAgIHJlcGVhdGluZzogdHJ1ZSxcclxuICAgICAgcmVwZWF0aW5nS2V5czogWy4uLmxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLm5hbWVzXSxcclxuICAgICAgc29ydEtleXM6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnNvcnRLZXlzLFxyXG4gICAgICBwcmltYXJ5S2V5OiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5wcmltYXJ5S2V5LFxyXG4gICAgICBwb3NzaWJsZUtleXM6IFsuLi5sb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5wb3NzaWJsZUtleXNdLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiBwYXJhbXMgYXMgUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj47XHJcbn07XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcDxcclxuICBUQmFzZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIFRLZXkgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA9IFRCYXNlIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBUQmFzZSA6IG5ldmVyLFxyXG4+ID0ge1xyXG4gIFtuYW1lIGluIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zW1RLZXldWydyZXBlYXRpbmdGaWVsZHMnXVsnbmFtZXMnXVtudW1iZXJdXTpcclxuICAgIHwgc3RyaW5nXHJcbiAgICB8IHN0cmluZ1tdO1xyXG59W107XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcFR5cGVDaGVjazxcclxuICBUQmFzZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEYgZXh0ZW5kcyBrZXlvZiBOZXRGaWVsZHNbVEJhc2VdLFxyXG4gIFRLZXkgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA9IFRCYXNlIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBUQmFzZSA6IG5ldmVyLFxyXG4+ID0gRiBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zW1RLZXldWydyZXBlYXRpbmdGaWVsZHMnXVsnbGFiZWwnXVxyXG4gID8gUmVwZWF0aW5nRmllbGRzTWFwPFRLZXk+IDpcclxuICBuZXZlcjtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwVHlwZTxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRiBleHRlbmRzIGtleW9mIE5ldEZpZWxkc1tUXSxcclxuPiA9IFQgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFJlcGVhdGluZ0ZpZWxkc01hcFR5cGVDaGVjazxULCBGPlxyXG4gIDogbmV2ZXI7XHJcblxyXG50eXBlIFBhcnNlSGVscGVyVHlwZTxUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID1cclxuICAmIHtcclxuICAgIFtmaWVsZCBpbiBrZXlvZiBOZXRGaWVsZHNbVF1dPzogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlPFQsIGZpZWxkPjtcclxuICB9XHJcbiAgJiB7IGNhcHR1cmU/OiBib29sZWFuIH07XHJcblxyXG5jb25zdCBpc1JlcGVhdGluZ0ZpZWxkID0gPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuPihcclxuICByZXBlYXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQsXHJcbiAgdmFsdWU6IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVwZWF0aW5nRmllbGRzTWFwPFQ+IHwgdW5kZWZpbmVkLFxyXG4pOiB2YWx1ZSBpcyBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gPT4ge1xyXG4gIGlmIChyZXBlYXRpbmcgIT09IHRydWUpXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgLy8gQWxsb3cgZXhjbHVkaW5nIHRoZSBmaWVsZCB0byBtYXRjaCBmb3IgZXh0cmFjdGlvblxyXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuICBmb3IgKGNvbnN0IGUgb2YgdmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5jb25zdCBwYXJzZUhlbHBlciA9IDxUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+KFxyXG4gIHBhcmFtczogUGFyc2VIZWxwZXJUeXBlPFQ+IHwgdW5kZWZpbmVkLFxyXG4gIGRlZktleTogVCxcclxuICBmaWVsZHM6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+LFxyXG4pOiBDYWN0Ym90QmFzZVJlZ0V4cDxUPiA9PiB7XHJcbiAgcGFyYW1zID0gcGFyYW1zID8/IHt9O1xyXG4gIGNvbnN0IHZhbGlkRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICBmb3IgKGNvbnN0IGluZGV4IGluIGZpZWxkcykge1xyXG4gICAgY29uc3QgZmllbGQgPSBmaWVsZHNbaW5kZXhdO1xyXG4gICAgaWYgKGZpZWxkKVxyXG4gICAgICB2YWxpZEZpZWxkcy5wdXNoKGZpZWxkLmZpZWxkKTtcclxuICB9XHJcblxyXG4gIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMocGFyYW1zLCBkZWZLZXksIFsnY2FwdHVyZScsIC4uLnZhbGlkRmllbGRzXSk7XHJcblxyXG4gIC8vIEZpbmQgdGhlIGxhc3Qga2V5IHdlIGNhcmUgYWJvdXQsIHNvIHdlIGNhbiBzaG9ydGVuIHRoZSByZWdleCBpZiBuZWVkZWQuXHJcbiAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKHBhcmFtcy5jYXB0dXJlKTtcclxuICBjb25zdCBmaWVsZEtleXMgPSBPYmplY3Qua2V5cyhmaWVsZHMpLnNvcnQoKGEsIGIpID0+IHBhcnNlSW50KGEpIC0gcGFyc2VJbnQoYikpO1xyXG4gIGxldCBtYXhLZXlTdHI6IHN0cmluZztcclxuICBpZiAoY2FwdHVyZSkge1xyXG4gICAgY29uc3Qga2V5czogRXh0cmFjdDxrZXlvZiBOZXRGaWVsZHNSZXZlcnNlW1RdLCBzdHJpbmc+W10gPSBbXTtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkcylcclxuICAgICAga2V5cy5wdXNoKGtleSk7XHJcbiAgICBsZXQgdG1wS2V5ID0ga2V5cy5wb3AoKTtcclxuICAgIGlmICh0bXBLZXkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBtYXhLZXlTdHIgPSBmaWVsZEtleXNbZmllbGRLZXlzLmxlbmd0aCAtIDFdID8/ICcwJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdoaWxlIChcclxuICAgICAgICBmaWVsZHNbdG1wS2V5XT8ub3B0aW9uYWwgJiZcclxuICAgICAgICAhKChmaWVsZHNbdG1wS2V5XT8uZmllbGQgPz8gJycpIGluIHBhcmFtcylcclxuICAgICAgKVxyXG4gICAgICAgIHRtcEtleSA9IGtleXMucG9wKCk7XHJcbiAgICAgIG1heEtleVN0ciA9IHRtcEtleSA/PyAnMCc7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIG1heEtleVN0ciA9ICcwJztcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkcykge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IGZpZWxkc1trZXldID8/IHt9O1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JylcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgY29uc3QgZmllbGROYW1lID0gZmllbGRzW2tleV0/LmZpZWxkO1xyXG4gICAgICBpZiAoZmllbGROYW1lICE9PSB1bmRlZmluZWQgJiYgZmllbGROYW1lIGluIHBhcmFtcylcclxuICAgICAgICBtYXhLZXlTdHIgPSBrZXk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IG1heEtleSA9IHBhcnNlSW50KG1heEtleVN0cik7XHJcblxyXG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgQWJpbGl0eSB0byBoYW5kbGUgYW9lIGFuZCBub24tYW9lLlxyXG4gIGNvbnN0IGFiaWxpdHlNZXNzYWdlVHlwZSA9XHJcbiAgICBgKD86JHtsb2dEZWZpbml0aW9ucy5BYmlsaXR5Lm1lc3NhZ2VUeXBlfXwke2xvZ0RlZmluaXRpb25zLk5ldHdvcmtBT0VBYmlsaXR5Lm1lc3NhZ2VUeXBlfSlgO1xyXG4gIGNvbnN0IGFiaWxpdHlIZXhDb2RlID0gJyg/OjE1fDE2KSc7XHJcblxyXG4gIC8vIEJ1aWxkIHRoZSByZWdleCBmcm9tIHRoZSBmaWVsZHMuXHJcbiAgY29uc3QgcHJlZml4ID0gZGVmS2V5ICE9PSAnQWJpbGl0eScgPyBsb2dEZWZpbml0aW9uc1tkZWZLZXldLm1lc3NhZ2VUeXBlIDogYWJpbGl0eU1lc3NhZ2VUeXBlO1xyXG5cclxuICAvLyBIZXggY29kZXMgYXJlIGEgbWluaW11bSBvZiB0d28gY2hhcmFjdGVycy4gIEFiaWxpdGllcyBhcmUgc3BlY2lhbCBiZWNhdXNlXHJcbiAgLy8gdGhleSBuZWVkIHRvIHN1cHBvcnQgYm90aCAweDE1IGFuZCAweDE2LlxyXG4gIGNvbnN0IHR5cGVBc0hleCA9IHBhcnNlSW50KGxvZ0RlZmluaXRpb25zW2RlZktleV0udHlwZSkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7XHJcbiAgY29uc3QgZGVmYXVsdEhleENvZGUgPSB0eXBlQXNIZXgubGVuZ3RoIDwgMiA/IGAwMCR7dHlwZUFzSGV4fWAuc2xpY2UoLTIpIDogdHlwZUFzSGV4O1xyXG4gIGNvbnN0IGhleENvZGUgPSBkZWZLZXkgIT09ICdBYmlsaXR5JyA/IGRlZmF1bHRIZXhDb2RlIDogYWJpbGl0eUhleENvZGU7XHJcblxyXG4gIGxldCBzdHIgPSAnJztcclxuICBpZiAoY2FwdHVyZSlcclxuICAgIHN0ciArPSBgKD88dGltZXN0YW1wPlxcXFx5e1RpbWVzdGFtcH0pICR7cHJlZml4fSAoPzx0eXBlPiR7aGV4Q29kZX0pYDtcclxuICBlbHNlXHJcbiAgICBzdHIgKz0gYFxcXFx5e1RpbWVzdGFtcH0gJHtwcmVmaXh9ICR7aGV4Q29kZX1gO1xyXG5cclxuICBsZXQgbGFzdEtleSA9IDE7XHJcbiAgZm9yIChjb25zdCBrZXlTdHIgaW4gZmllbGRzKSB7XHJcbiAgICBjb25zdCBwYXJzZUZpZWxkID0gZmllbGRzW2tleVN0cl07XHJcbiAgICBpZiAocGFyc2VGaWVsZCA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICBjb250aW51ZTtcclxuICAgIGNvbnN0IGZpZWxkTmFtZSA9IHBhcnNlRmllbGQuZmllbGQ7XHJcblxyXG4gICAgLy8gUmVnZXggaGFuZGxlcyB0aGVzZSBtYW51YWxseSBhYm92ZSBpbiB0aGUgYHN0cmAgaW5pdGlhbGl6YXRpb24uXHJcbiAgICBpZiAoZmllbGROYW1lID09PSAndGltZXN0YW1wJyB8fCBmaWVsZE5hbWUgPT09ICd0eXBlJylcclxuICAgICAgY29udGludWU7XHJcblxyXG4gICAgY29uc3Qga2V5ID0gcGFyc2VJbnQoa2V5U3RyKTtcclxuICAgIC8vIEZpbGwgaW4gYmxhbmtzLlxyXG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IGtleSAtIGxhc3RLZXkgLSAxO1xyXG4gICAgaWYgKG1pc3NpbmdGaWVsZHMgPT09IDEpXHJcbiAgICAgIHN0ciArPSBgJHtzZXBhcmF0b3J9JHttYXRjaERlZmF1bHR9YDtcclxuICAgIGVsc2UgaWYgKG1pc3NpbmdGaWVsZHMgPiAxKVxyXG4gICAgICBzdHIgKz0gYCg/OiR7c2VwYXJhdG9yfSR7bWF0Y2hEZWZhdWx0fSl7JHttaXNzaW5nRmllbGRzfX1gO1xyXG4gICAgbGFzdEtleSA9IGtleTtcclxuXHJcbiAgICBzdHIgKz0gc2VwYXJhdG9yO1xyXG5cclxuICAgIGlmICh0eXBlb2YgcGFyc2VGaWVsZCAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkZWZLZXl9OiBpbnZhbGlkIHZhbHVlOiAke0pTT04uc3RyaW5naWZ5KHBhcnNlRmllbGQpfWApO1xyXG5cclxuICAgIGNvbnN0IGZpZWxkRGVmYXVsdCA9IGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkc1dpdGhQb3RlbnRpYWxDb2xvbnMuaW5jbHVkZXMoZmllbGROYW1lKVxyXG4gICAgICA/IG1hdGNoV2l0aENvbG9uc0RlZmF1bHRcclxuICAgICAgOiBtYXRjaERlZmF1bHQ7XHJcbiAgICBjb25zdCBkZWZhdWx0RmllbGRWYWx1ZSA9IHBhcnNlRmllbGQudmFsdWU/LnRvU3RyaW5nKCkgPz8gZmllbGREZWZhdWx0O1xyXG4gICAgY29uc3QgZmllbGRWYWx1ZSA9IHBhcmFtc1tmaWVsZE5hbWVdO1xyXG5cclxuICAgIGlmIChpc1JlcGVhdGluZ0ZpZWxkKGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmcsIGZpZWxkVmFsdWUpKSB7XHJcbiAgICAgIGNvbnN0IHJlcGVhdGluZ0ZpZWxkc1NlcGFyYXRvciA9ICcoPzokfDopJztcclxuICAgICAgbGV0IHJlcGVhdGluZ0FycmF5OiBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQgPSBmaWVsZFZhbHVlO1xyXG5cclxuICAgICAgY29uc3Qgc29ydEtleXMgPSBmaWVsZHNba2V5U3RyXT8uc29ydEtleXM7XHJcbiAgICAgIGNvbnN0IHByaW1hcnlLZXkgPSBmaWVsZHNba2V5U3RyXT8ucHJpbWFyeUtleTtcclxuICAgICAgY29uc3QgcG9zc2libGVLZXlzID0gZmllbGRzW2tleVN0cl0/LnBvc3NpYmxlS2V5cztcclxuXHJcbiAgICAgIC8vIHByaW1hcnlLZXkgaXMgcmVxdWlyZWQgaWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBwZXIgdHlwZWRlZiBpbiBuZXRsb2dfZGVmcy50c1xyXG4gICAgICAvLyBTYW1lIHdpdGggcG9zc2libGVLZXlzXHJcbiAgICAgIGlmIChwcmltYXJ5S2V5ID09PSB1bmRlZmluZWQgfHwgcG9zc2libGVLZXlzID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG5cclxuICAgICAgLy8gQWxsb3cgc29ydGluZyBpZiBuZWVkZWRcclxuICAgICAgaWYgKHNvcnRLZXlzKSB7XHJcbiAgICAgICAgLy8gQWxzbyBzb3J0IG91ciB2YWxpZCBrZXlzIGxpc3RcclxuICAgICAgICBwb3NzaWJsZUtleXMuc29ydCgobGVmdCwgcmlnaHQpID0+IGxlZnQudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0LnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICBpZiAocmVwZWF0aW5nQXJyYXkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgcmVwZWF0aW5nQXJyYXkgPSBbLi4ucmVwZWF0aW5nQXJyYXldLnNvcnQoXHJcbiAgICAgICAgICAgIChsZWZ0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcmlnaHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogbnVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAvLyBXZSBjaGVjayB0aGUgdmFsaWRpdHkgb2YgbGVmdC9yaWdodCBiZWNhdXNlIHRoZXkncmUgdXNlci1zdXBwbGllZFxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdCAhPT0gJ29iamVjdCcgfHwgbGVmdFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgbGVmdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgbGVmdFZhbHVlID0gbGVmdFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMobGVmdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHQgIT09ICdvYmplY3QnIHx8IHJpZ2h0W3ByaW1hcnlLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgcmlnaHRWYWx1ZSA9IHJpZ2h0W3ByaW1hcnlLZXldO1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMocmlnaHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxlZnRWYWx1ZS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUocmlnaHRWYWx1ZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbm9uUmVwczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfVtdIHwgdW5kZWZpbmVkID0gcmVwZWF0aW5nQXJyYXk7XHJcbiAgICAgIC8vIExvb3Agb3ZlciBvdXIgcG9zc2libGUga2V5c1xyXG4gICAgICAvLyBCdWlsZCBhIHJlZ2V4IHRoYXQgY2FuIG1hdGNoIGFueSBwb3NzaWJsZSBrZXkgd2l0aCByZXF1aXJlZCB2YWx1ZXMgc3Vic3RpdHV0ZWQgaW5cclxuICAgICAgcG9zc2libGVLZXlzLmZvckVhY2goKHBvc3NpYmxlS2V5KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVwID0gYW5vblJlcHM/LmZpbmQoKHJlcCkgPT4gcHJpbWFyeUtleSBpbiByZXAgJiYgcmVwW3ByaW1hcnlLZXldID09PSBwb3NzaWJsZUtleSk7XHJcblxyXG4gICAgICAgIGxldCBmaWVsZFJlZ2V4ID0gJyc7XHJcbiAgICAgICAgLy8gUmF0aGVyIHRoYW4gbG9vcGluZyBvdmVyIHRoZSBrZXlzIGRlZmluZWQgb24gdGhlIG9iamVjdCxcclxuICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGJhc2UgdHlwZSBkZWYncyBrZXlzLiBUaGlzIGVuZm9yY2VzIHRoZSBjb3JyZWN0IG9yZGVyLlxyXG4gICAgICAgIGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmdLZXlzPy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgIGxldCB2YWwgPSByZXA/LltrZXldO1xyXG4gICAgICAgICAgaWYgKHJlcCA9PT0gdW5kZWZpbmVkIHx8ICEoa2V5IGluIHJlcCkpIHtcclxuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbHVlIGZvciB0aGlzIGtleVxyXG4gICAgICAgICAgICAvLyBpbnNlcnQgYSBwbGFjZWhvbGRlciwgdW5sZXNzIGl0J3MgdGhlIHByaW1hcnkga2V5XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHByaW1hcnlLZXkpXHJcbiAgICAgICAgICAgICAgdmFsID0gcG9zc2libGVLZXk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbCkpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwubGVuZ3RoIDwgMSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbC5zb21lKCh2KSA9PiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpZWxkUmVnZXggKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAgIGtleSA9PT0gcHJpbWFyeUtleSA/IGZhbHNlIDogY2FwdHVyZSxcclxuICAgICAgICAgICAgLy8gQWxsIGNhcHR1cmluZyBncm91cHMgYXJlIGBmaWVsZE5hbWVgICsgYHBvc3NpYmxlS2V5YCwgZS5nLiBgcGFpcklzQ2FzdGluZzFgXHJcbiAgICAgICAgICAgIGZpZWxkTmFtZSArIHBvc3NpYmxlS2V5LFxyXG4gICAgICAgICAgICB2YWwsXHJcbiAgICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICAgKSArXHJcbiAgICAgICAgICAgIHJlcGVhdGluZ0ZpZWxkc1NlcGFyYXRvcjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGZpZWxkUmVnZXgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgc3RyICs9IGAoPzoke2ZpZWxkUmVnZXh9KSR7cmVwICE9PSB1bmRlZmluZWQgPyAnJyA6ICc/J31gO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmcpIHtcclxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBidXQgdGhlIGFjdHVhbCB2YWx1ZSBpcyBlbXB0eSBvciBvdGhlcndpc2UgaW52YWxpZCxcclxuICAgICAgLy8gZG9uJ3QgcHJvY2VzcyBmdXJ0aGVyLiBXZSBjYW4ndCB1c2UgYGNvbnRpbnVlYCBpbiB0aGUgYWJvdmUgYmxvY2sgYmVjYXVzZSB0aGF0XHJcbiAgICAgIC8vIHdvdWxkIHNraXAgdGhlIGVhcmx5LW91dCBicmVhayBhdCB0aGUgZW5kIG9mIHRoZSBsb29wLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc3RyICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgLy8gbW9yZSBhY2N1cmF0ZSB0eXBlIGluc3RlYWQgb2YgYGFzYCBjYXN0XHJcbiAgICAgICAgICAvLyBtYXliZSB0aGlzIGZ1bmN0aW9uIG5lZWRzIGEgcmVmYWN0b3JpbmdcclxuICAgICAgICAgIGNhcHR1cmUsXHJcbiAgICAgICAgICBmaWVsZE5hbWUsXHJcbiAgICAgICAgICBmaWVsZFZhbHVlLFxyXG4gICAgICAgICAgZGVmYXVsdEZpZWxkVmFsdWUsXHJcbiAgICAgICAgKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBGSVhNRTogaGFuZGxlIGxpbnQgZXJyb3IgaGVyZVxyXG4gICAgICAgIC8vIHJlZjogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9wdWxsLzI3NCNkaXNjdXNzaW9uX3IxNjkyNDM5NzIwXHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9yZXN0cmljdC1wbHVzLW9wZXJhbmRzXHJcbiAgICAgICAgc3RyICs9IGZpZWxkVmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTdG9wIGlmIHdlJ3JlIG5vdCBjYXB0dXJpbmcgYW5kIGRvbid0IGNhcmUgYWJvdXQgZnV0dXJlIGZpZWxkcy5cclxuICAgIGlmIChrZXkgPj0gbWF4S2V5KVxyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIHN0ciArPSAnKD86JHw6KSc7XHJcblxyXG4gIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cikgYXMgQ2FjdGJvdEJhc2VSZWdFeHA8VD47XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgYnVpbGRSZWdleCA9IDxUIGV4dGVuZHMga2V5b2YgTmV0UGFyYW1zPihcclxuICB0eXBlOiBULFxyXG4gIHBhcmFtcz86IFBhcnNlSGVscGVyVHlwZTxUPixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsIHR5cGUsIGRlZmF1bHRQYXJhbXModHlwZSwgUmVnZXhlcy5sb2dWZXJzaW9uKSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWdleGVzIHtcclxuICBzdGF0aWMgbG9nVmVyc2lvbjogTG9nRGVmaW5pdGlvblZlcnNpb25zID0gJ2xhdGVzdCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMC0weDE0LW5ldHdvcmtzdGFydHNjYXN0aW5nXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXJ0c1VzaW5nKHBhcmFtcz86IE5ldFBhcmFtc1snU3RhcnRzVXNpbmcnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGFydHNVc2luZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTdGFydHNVc2luZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjEtMHgxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMi0weDE2LW5ldHdvcmthb2VhYmlsaXR5XHJcbiAgICovXHJcbiAgc3RhdGljIGFiaWxpdHkocGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBYmlsaXR5JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMS0weDE1LW5ldHdvcmthYmlsaXR5XHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIyLTB4MTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKlxyXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgYWJpbGl0eWAgaW5zdGVhZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RnVsbChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHknXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5Jz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYWJpbGl0eShwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3LTB4MWItbmV0d29ya3RhcmdldGljb24taGVhZC1tYXJrZXJcclxuICAgKi9cclxuICBzdGF0aWMgaGVhZE1hcmtlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0hlYWRNYXJrZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdIZWFkTWFya2VyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0hlYWRNYXJrZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50KHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBZGRlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBZGRlZENvbWJhdGFudCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDMtMHgwMy1hZGRjb21iYXRhbnRcclxuICAgKi9cclxuICBzdGF0aWMgYWRkZWRDb21iYXRhbnRGdWxsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBZGRlZENvbWJhdGFudCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBZGRlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiB0aGlzLmFkZGVkQ29tYmF0YW50KHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDQtMHgwNC1yZW1vdmVjb21iYXRhbnRcclxuICAgKi9cclxuICBzdGF0aWMgcmVtb3ZpbmdDb21iYXRhbnQoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1JlbW92ZWRDb21iYXRhbnQnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUmVtb3ZlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdSZW1vdmVkQ29tYmF0YW50JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNi0weDFhLW5ldHdvcmtidWZmXHJcbiAgICovXHJcbiAgc3RhdGljIGdhaW5zRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snR2FpbnNFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYWluc0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYWluc0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmVmZXIgZ2FpbnNFZmZlY3Qgb3ZlciB0aGlzIGZ1bmN0aW9uIHVubGVzcyB5b3UgcmVhbGx5IG5lZWQgZXh0cmEgZGF0YS5cclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzgtMHgyNi1uZXR3b3Jrc3RhdHVzZWZmZWN0c1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGF0dXNFZmZlY3RFeHBsaWNpdChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3RhdHVzRWZmZWN0J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXR1c0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTdGF0dXNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTMwLTB4MWUtbmV0d29ya2J1ZmZyZW1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgbG9zZXNFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydMb3Nlc0VmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0xvc2VzRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0xvc2VzRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNS0weDIzLW5ldHdvcmt0ZXRoZXJcclxuICAgKi9cclxuICBzdGF0aWMgdGV0aGVyKHBhcmFtcz86IE5ldFBhcmFtc1snVGV0aGVyJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnVGV0aGVyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1RldGhlcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAndGFyZ2V0JyB3YXMgZGVmZWF0ZWQgYnkgJ3NvdXJjZSdcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjUtMHgxOS1uZXR3b3JrZGVhdGhcclxuICAgKi9cclxuICBzdGF0aWMgd2FzRGVmZWF0ZWQocGFyYW1zPzogTmV0UGFyYW1zWydXYXNEZWZlYXRlZCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1dhc0RlZmVhdGVkJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1dhc0RlZmVhdGVkJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNC0weDE4LW5ldHdvcmtkb3RcclxuICAgKi9cclxuICBzdGF0aWMgbmV0d29ya0RvVChwYXJhbXM/OiBOZXRQYXJhbXNbJ05ldHdvcmtEb1QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdOZXR3b3JrRG9UJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ05ldHdvcmtEb1QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBlY2hvKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnZWNobycsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuICAgIHBhcmFtcy5jb2RlID0gJzAwMzgnO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkaWFsb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdkaWFsb2cnLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwMDQ0JztcclxuICAgIHJldHVybiBSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgbWVzc2FnZShwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ21lc3NhZ2UnLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwODM5JztcclxuICAgIHJldHVybiBSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogY29kZSwgbmFtZSwgbGluZSwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZUxvZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0dhbWVMb2cnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTmFtZUxvZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMTItMHgwYy1wbGF5ZXJzdGF0c1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGF0Q2hhbmdlKHBhcmFtcz86IE5ldFBhcmFtc1snUGxheWVyU3RhdHMnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdQbGF5ZXJTdGF0cyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdQbGF5ZXJTdGF0cycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDEtMHgwMS1jaGFuZ2V6b25lXHJcbiAgICovXHJcbiAgc3RhdGljIGNoYW5nZVpvbmUocGFyYW1zPzogTmV0UGFyYW1zWydDaGFuZ2Vab25lJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ2hhbmdlWm9uZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDaGFuZ2Vab25lJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zMy0weDIxLW5ldHdvcms2ZC1hY3Rvci1jb250cm9sXHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcms2ZChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yQ29udHJvbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2wnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM0LTB4MjItbmV0d29ya25hbWV0b2dnbGVcclxuICAgKi9cclxuICBzdGF0aWMgbmFtZVRvZ2dsZShwYXJhbXM/OiBOZXRQYXJhbXNbJ05hbWVUb2dnbGUnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdOYW1lVG9nZ2xlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ05hbWVUb2dnbGUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTQwLTB4MjgtbWFwXHJcbiAgICovXHJcbiAgc3RhdGljIG1hcChwYXJhbXM/OiBOZXRQYXJhbXNbJ01hcCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J01hcCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdNYXAnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTQxLTB4Mjktc3lzdGVtbG9nbWVzc2FnZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzeXN0ZW1Mb2dNZXNzYWdlKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTeXN0ZW1Mb2dNZXNzYWdlJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N5c3RlbUxvZ01lc3NhZ2UnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3lzdGVtTG9nTWVzc2FnZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU3LTB4MTAxLW1hcGVmZmVjdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXBFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydNYXBFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXBFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTgtMHgxMDItZmF0ZWRpcmVjdG9yXHJcbiAgICovXHJcbiAgc3RhdGljIGZhdGVEaXJlY3RvcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0ZhdGVEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0ZhdGVEaXJlY3Rvcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdGYXRlRGlyZWN0b3InLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1OS0weDEwMy1jZWRpcmVjdG9yXHJcbiAgICovXHJcbiAgc3RhdGljIGNlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydDRURpcmVjdG9yJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ0VEaXJlY3Rvcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDRURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjAtMHgxMDQtaW5jb21iYXRcclxuICAgKi9cclxuICBzdGF0aWMgaW5Db21iYXQocGFyYW1zPzogTmV0UGFyYW1zWydJbkNvbWJhdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0luQ29tYmF0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0luQ29tYmF0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjEtMHgxMDUtY29tYmF0YW50bWVtb3J5XHJcbiAgICovXHJcbiAgc3RhdGljIGNvbWJhdGFudE1lbW9yeShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29tYmF0YW50TWVtb3J5J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbWJhdGFudE1lbW9yeSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb21iYXRhbnRNZW1vcnknLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2My0weDEwNy1zdGFydHN1c2luZ2V4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXJ0c1VzaW5nRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXJ0c1VzaW5nRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhcnRzVXNpbmdFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTdGFydHNVc2luZ0V4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjQtMHgxMDgtYWJpbGl0eWV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFiaWxpdHlFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eUV4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHlFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBYmlsaXR5RXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2NS0weDEwOS1jb250ZW50ZmluZGVyc2V0dGluZ3NcclxuICAgKi9cclxuICBzdGF0aWMgY29udGVudEZpbmRlclNldHRpbmdzKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb250ZW50RmluZGVyU2V0dGluZ3MnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ29udGVudEZpbmRlclNldHRpbmdzJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvbnRlbnRGaW5kZXJTZXR0aW5ncycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY2LTB4MTBhLW5wY3llbGxcclxuICAgKi9cclxuICBzdGF0aWMgbnBjWWVsbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snTnBjWWVsbCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdOcGNZZWxsJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ05wY1llbGwnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Ny0weDEwYi1iYXR0bGV0YWxrMlxyXG4gICAqL1xyXG4gIHN0YXRpYyBiYXR0bGVUYWxrMihcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQmF0dGxlVGFsazInXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQmF0dGxlVGFsazInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQmF0dGxlVGFsazInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2OC0weDEwYy1jb3VudGRvd25cclxuICAgKi9cclxuICBzdGF0aWMgY291bnRkb3duKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb3VudGRvd24nXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ291bnRkb3duJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvdW50ZG93bicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY5LTB4MTBkLWNvdW50ZG93bmNhbmNlbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb3VudGRvd25DYW5jZWwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvdW50ZG93bkNhbmNlbCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb3VudGRvd25DYW5jZWwnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ291bnRkb3duQ2FuY2VsJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzAtMHgxMGUtYWN0b3Jtb3ZlXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yTW92ZShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JNb3ZlJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yTW92ZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3Rvck1vdmUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3MS0weDEwZi1hY3RvcnNldHBvc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvclNldFBvcyhcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JTZXRQb3MnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JTZXRQb3MnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JTZXRQb3MnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3Mi0weDExMC1zcGF3bm5wY2V4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIHNwYXduTnBjRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1NwYXduTnBjRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3Bhd25OcGNFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTcGF3bk5wY0V4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzMtMHgxMTEtYWN0b3Jjb250cm9sZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JDb250cm9sRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbEV4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yQ29udHJvbEV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbEV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzQtMHgxMTItYWN0b3Jjb250cm9sc2VsZmV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yQ29udHJvbFNlbGZFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sU2VsZkV4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yQ29udHJvbFNlbGZFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2xTZWxmRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSGVscGVyIGZ1bmN0aW9uIGZvciBidWlsZGluZyBuYW1lZCBjYXB0dXJlIGdyb3VwXHJcbiAgICovXHJcbiAgc3RhdGljIG1heWJlQ2FwdHVyZShcclxuICAgIGNhcHR1cmU6IGJvb2xlYW4sXHJcbiAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICB2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCB1bmRlZmluZWQsXHJcbiAgICBkZWZhdWx0VmFsdWU/OiBzdHJpbmcsXHJcbiAgKTogc3RyaW5nIHtcclxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICB2YWx1ZSA9IGRlZmF1bHRWYWx1ZSA/PyBtYXRjaERlZmF1bHQ7XHJcbiAgICB2YWx1ZSA9IFJlZ2V4ZXMuYW55T2YodmFsdWUpO1xyXG4gICAgcmV0dXJuIGNhcHR1cmUgPyBSZWdleGVzLm5hbWVkQ2FwdHVyZShuYW1lLCB2YWx1ZSkgOiB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBvcHRpb25hbChzdHI6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gYCg/OiR7c3RyfSk/YDtcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZXMgYSBuYW1lZCByZWdleCBjYXB0dXJlIGdyb3VwIG5hbWVkIHxuYW1lfCBmb3IgdGhlIG1hdGNoIHx2YWx1ZXwuXHJcbiAgc3RhdGljIG5hbWVkQ2FwdHVyZShuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgaWYgKG5hbWUuaW5jbHVkZXMoJz4nKSlcclxuICAgICAgY29uc29sZS5lcnJvcihgXCIke25hbWV9XCIgY29udGFpbnMgXCI+XCIuYCk7XHJcbiAgICBpZiAobmFtZS5pbmNsdWRlcygnPCcpKVxyXG4gICAgICBjb25zb2xlLmVycm9yKGBcIiR7bmFtZX1cIiBjb250YWlucyBcIj5cIi5gKTtcclxuXHJcbiAgICByZXR1cm4gYCg/PCR7bmFtZX0+JHt2YWx1ZX0pYDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlbmllbmNlIGZvciB0dXJuaW5nIG11bHRpcGxlIGFyZ3MgaW50byBhIHVuaW9uZWQgcmVndWxhciBleHByZXNzaW9uLlxyXG4gICAqIGFueU9mKHgsIHksIHopIG9yIGFueU9mKFt4LCB5LCB6XSkgZG8gdGhlIHNhbWUgdGhpbmcsIGFuZCByZXR1cm4gKD86eHx5fHopLlxyXG4gICAqIGFueU9mKHgpIG9yIGFueU9mKHgpIG9uIGl0cyBvd24gc2ltcGxpZmllcyB0byBqdXN0IHguXHJcbiAgICogYXJncyBtYXkgYmUgc3RyaW5ncyBvciBSZWdFeHAsIGFsdGhvdWdoIGFueSBhZGRpdGlvbmFsIG1hcmtlcnMgdG8gUmVnRXhwXHJcbiAgICogbGlrZSAvaW5zZW5zaXRpdmUvaSBhcmUgZHJvcHBlZC5cclxuICAgKi9cclxuICBzdGF0aWMgYW55T2YoLi4uYXJnczogKHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVnRXhwKVtdKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGFueU9mQXJyYXkgPSAoYXJyYXk6IHJlYWRvbmx5IChzdHJpbmcgfCBSZWdFeHApW10pOiBzdHJpbmcgPT4ge1xyXG4gICAgICBjb25zdCBbZWxlbV0gPSBhcnJheTtcclxuICAgICAgaWYgKGVsZW0gIT09IHVuZGVmaW5lZCAmJiBhcnJheS5sZW5ndGggPT09IDEpXHJcbiAgICAgICAgcmV0dXJuIGAke2VsZW0gaW5zdGFuY2VvZiBSZWdFeHAgPyBlbGVtLnNvdXJjZSA6IGVsZW19YDtcclxuICAgICAgcmV0dXJuIGAoPzoke2FycmF5Lm1hcCgoZWxlbSkgPT4gZWxlbSBpbnN0YW5jZW9mIFJlZ0V4cCA/IGVsZW0uc291cmNlIDogZWxlbSkuam9pbignfCcpfSlgO1xyXG4gICAgfTtcclxuICAgIGxldCBhcnJheTogcmVhZG9ubHkgKHN0cmluZyB8IFJlZ0V4cClbXSA9IFtdO1xyXG4gICAgY29uc3QgW2ZpcnN0QXJnXSA9IGFyZ3M7XHJcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgaWYgKHR5cGVvZiBmaXJzdEFyZyA9PT0gJ3N0cmluZycgfHwgZmlyc3RBcmcgaW5zdGFuY2VvZiBSZWdFeHApXHJcbiAgICAgICAgYXJyYXkgPSBbZmlyc3RBcmddO1xyXG4gICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZpcnN0QXJnKSlcclxuICAgICAgICBhcnJheSA9IGZpcnN0QXJnO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgYXJyYXkgPSBbXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFRPRE86IG1vcmUgYWNjdXJhdGUgdHlwZSBpbnN0ZWFkIG9mIGBhc2AgY2FzdFxyXG4gICAgICBhcnJheSA9IGFyZ3MgYXMgcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYW55T2ZBcnJheShhcnJheSk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgcGFyc2UocmVnZXhwU3RyaW5nOiBSZWdFeHAgfCBzdHJpbmcgfCBDYWN0Ym90QmFzZVJlZ0V4cDwnTm9uZSc+KTogUmVnRXhwIHtcclxuICAgIGNvbnN0IGtDYWN0Ym90Q2F0ZWdvcmllcyA9IHtcclxuICAgICAgVGltZXN0YW1wOiAnXi57MTR9JyxcclxuICAgICAgTmV0VGltZXN0YW1wOiAnLnszM30nLFxyXG4gICAgICBOZXRGaWVsZDogJyg/OltefF0qXFxcXHwpJyxcclxuICAgICAgTG9nVHlwZTogJ1swLTlBLUZhLWZdezJ9JyxcclxuICAgICAgQWJpbGl0eUNvZGU6ICdbMC05QS1GYS1mXXsxLDh9JyxcclxuICAgICAgT2JqZWN0SWQ6ICdbMC05QS1GXXs4fScsXHJcbiAgICAgIC8vIE1hdGNoZXMgYW55IGNoYXJhY3RlciBuYW1lIChpbmNsdWRpbmcgZW1wdHkgc3RyaW5ncyB3aGljaCB0aGUgRkZYSVZcclxuICAgICAgLy8gQUNUIHBsdWdpbiBjYW4gZ2VuZXJhdGUgd2hlbiB1bmtub3duKS5cclxuICAgICAgTmFtZTogJyg/OlteXFxcXHM6fF0rKD86IFteXFxcXHM6fF0rKT98KScsXHJcbiAgICAgIC8vIEZsb2F0cyBjYW4gaGF2ZSBjb21tYSBhcyBzZXBhcmF0b3IgaW4gRkZYSVYgcGx1Z2luIG91dHB1dDogaHR0cHM6Ly9naXRodWIuY29tL3JhdmFobi9GRlhJVl9BQ1RfUGx1Z2luL2lzc3Vlcy8xMzdcclxuICAgICAgRmxvYXQ6ICctP1swLTldKyg/OlsuLF1bMC05XSspPyg/OkUtP1swLTldKyk/JyxcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWxsIHJlZ2V4ZXMgaW4gY2FjdGJvdCBhcmUgY2FzZSBpbnNlbnNpdGl2ZS5cclxuICAgIC8vIFRoaXMgYXZvaWRzIGhlYWRhY2hlcyBhcyB0aGluZ3MgbGlrZSBgVmljZSBhbmQgVmFuaXR5YCB0dXJucyBpbnRvXHJcbiAgICAvLyBgVmljZSBBbmQgVmFuaXR5YCwgZXNwZWNpYWxseSBmb3IgRnJlbmNoIGFuZCBHZXJtYW4uICBJdCBhcHBlYXJzIHRvXHJcbiAgICAvLyBoYXZlIGEgfjIwJSByZWdleCBwYXJzaW5nIG92ZXJoZWFkLCBidXQgYXQgbGVhc3QgdGhleSB3b3JrLlxyXG4gICAgbGV0IG1vZGlmaWVycyA9ICdpJztcclxuICAgIGlmIChyZWdleHBTdHJpbmcgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgbW9kaWZpZXJzICs9IChyZWdleHBTdHJpbmcuZ2xvYmFsID8gJ2cnIDogJycpICtcclxuICAgICAgICAocmVnZXhwU3RyaW5nLm11bHRpbGluZSA/ICdtJyA6ICcnKTtcclxuICAgICAgcmVnZXhwU3RyaW5nID0gcmVnZXhwU3RyaW5nLnNvdXJjZTtcclxuICAgIH1cclxuICAgIHJlZ2V4cFN0cmluZyA9IHJlZ2V4cFN0cmluZy5yZXBsYWNlKC9cXFxceVxceyguKj8pXFx9L2csIChtYXRjaCwgZ3JvdXApID0+IHtcclxuICAgICAgcmV0dXJuIGtDYWN0Ym90Q2F0ZWdvcmllc1tncm91cCBhcyBrZXlvZiB0eXBlb2Yga0NhY3Rib3RDYXRlZ29yaWVzXSB8fCBtYXRjaDtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwU3RyaW5nLCBtb2RpZmllcnMpO1xyXG4gIH1cclxuXHJcbiAgLy8gTGlrZSBSZWdleC5SZWdleGVzLnBhcnNlLCBidXQgZm9yY2UgZ2xvYmFsIGZsYWcuXHJcbiAgc3RhdGljIHBhcnNlR2xvYmFsKHJlZ2V4cFN0cmluZzogUmVnRXhwIHwgc3RyaW5nKTogUmVnRXhwIHtcclxuICAgIGNvbnN0IHJlZ2V4ID0gUmVnZXhlcy5wYXJzZShyZWdleHBTdHJpbmcpO1xyXG4gICAgbGV0IG1vZGlmaWVycyA9ICdnaSc7XHJcbiAgICBpZiAocmVnZXhwU3RyaW5nIGluc3RhbmNlb2YgUmVnRXhwKVxyXG4gICAgICBtb2RpZmllcnMgKz0gcmVnZXhwU3RyaW5nLm11bHRpbGluZSA/ICdtJyA6ICcnO1xyXG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXguc291cmNlLCBtb2RpZmllcnMpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHRydWVJZlVuZGVmaW5lZCh2YWx1ZT86IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIHJldHVybiAhIXZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHZhbGlkYXRlUGFyYW1zKFxyXG4gICAgZjogUmVhZG9ubHk8eyBbczogc3RyaW5nXTogdW5rbm93biB9PixcclxuICAgIGZ1bmNOYW1lOiBzdHJpbmcsXHJcbiAgICBwYXJhbXM6IFJlYWRvbmx5PHN0cmluZ1tdPixcclxuICApOiB2b2lkIHtcclxuICAgIGlmIChmID09PSBudWxsKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBpZiAodHlwZW9mIGYgIT09ICdvYmplY3QnKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZik7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XHJcbiAgICAgIGlmICghcGFyYW1zLmluY2x1ZGVzKGtleSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBgJHtmdW5jTmFtZX06IGludmFsaWQgcGFyYW1ldGVyICcke2tleX0nLiAgYCArXHJcbiAgICAgICAgICAgIGBWYWxpZCBwYXJhbXM6ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX1gLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgTmV0RmllbGRzLCBOZXRGaWVsZHNSZXZlcnNlIH0gZnJvbSAnLi4vdHlwZXMvbmV0X2ZpZWxkcyc7XHJcbmltcG9ydCB7IE5ldFBhcmFtcyB9IGZyb20gJy4uL3R5cGVzL25ldF9wcm9wcyc7XHJcbmltcG9ydCB7IENhY3Rib3RCYXNlUmVnRXhwIH0gZnJvbSAnLi4vdHlwZXMvbmV0X3RyaWdnZXInO1xyXG5cclxuaW1wb3J0IHtcclxuICBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBsb2dEZWZpbml0aW9uc1ZlcnNpb25zLFxyXG4gIExvZ0RlZmluaXRpb25WZXJzaW9ucyxcclxuICBQYXJzZUhlbHBlckZpZWxkcyxcclxuICBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9ucyxcclxuICBSZXBlYXRpbmdGaWVsZHNUeXBlcyxcclxufSBmcm9tICcuL25ldGxvZ19kZWZzJztcclxuaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi9ub3RfcmVhY2hlZCc7XHJcbmltcG9ydCBSZWdleGVzIGZyb20gJy4vcmVnZXhlcyc7XHJcblxyXG5jb25zdCBzZXBhcmF0b3IgPSAnXFxcXHwnO1xyXG5jb25zdCBtYXRjaERlZmF1bHQgPSAnW158XSonO1xyXG5cclxuLy8gSWYgTmV0UmVnZXhlcy5zZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkIGlzIHNldCB0byB0cnVlLCB0aGVuIGFueVxyXG4vLyByZWdleCBjcmVhdGVkIHRoYXQgcmVxdWlyZXMgYSB0cmFuc2xhdGlvbiB3aWxsIGJlZ2luIHdpdGggdGhpcyBzdHJpbmdcclxuLy8gYW5kIG1hdGNoIHRoZSBtYWdpY1N0cmluZ1JlZ2V4LiAgVGhpcyBpcyBtYXliZSBhIGJpdCBnb29meSwgYnV0IGlzXHJcbi8vIGEgcHJldHR5IHN0cmFpZ2h0Zm9yd2FyZCB3YXkgdG8gbWFyayByZWdleGVzIGZvciB0cmFuc2xhdGlvbnMuXHJcbi8vIElmIGlzc3VlICMxMzA2IGlzIGV2ZXIgcmVzb2x2ZWQsIHdlIGNhbiByZW1vdmUgdGhpcy5cclxuY29uc3QgbWFnaWNUcmFuc2xhdGlvblN0cmluZyA9IGBeXmA7XHJcbmNvbnN0IG1hZ2ljU3RyaW5nUmVnZXggPSAvXlxcXlxcXi87XHJcblxyXG4vLyBjYW4ndCBzaW1wbHkgZXhwb3J0IHRoaXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L3B1bGwvNDk1NyNkaXNjdXNzaW9uX3IxMDAyNTkwNTg5XHJcbmNvbnN0IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdCA9IFtcclxuICAnYWJpbGl0eScsXHJcbiAgJ25hbWUnLFxyXG4gICdzb3VyY2UnLFxyXG4gICd0YXJnZXQnLFxyXG4gICdsaW5lJyxcclxuXSBhcyBjb25zdDtcclxuZXhwb3J0IGNvbnN0IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uOiByZWFkb25seSBzdHJpbmdbXSA9IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdDtcclxuZXhwb3J0IHR5cGUgS2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb24gPSB0eXBlb2Yga2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb25Bc0NvbnN0W251bWJlcl07XHJcblxyXG5leHBvcnQgY29uc3QgZ2FtZUxvZ0NvZGVzID0ge1xyXG4gIGVjaG86ICcwMDM4JyxcclxuICBkaWFsb2c6ICcwMDQ0JyxcclxuICBtZXNzYWdlOiAnMDgzOScsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBTZWUgZG9jcy9Mb2dHdWlkZS5tZCBmb3IgbW9yZSBpbmZvIGFib3V0IHRoZXNlIGNhdGVnb3JpZXNcclxuZXhwb3J0IGNvbnN0IGFjdG9yQ29udHJvbFR5cGUgPSB7XHJcbiAgc2V0QW5pbVN0YXRlOiAnMDAzRScsXHJcbiAgcHVibGljQ29udGVudFRleHQ6ICcwODM0JyxcclxuICBsb2dNc2c6ICcwMjBGJyxcclxuICBsb2dNc2dQYXJhbXM6ICcwMjEwJyxcclxufSBhcyBjb25zdDtcclxuXHJcbmNvbnN0IGRlZmF1bHRQYXJhbXMgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIFYgZXh0ZW5kcyBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbj4odHlwZTogVCwgdmVyc2lvbjogViwgaW5jbHVkZT86IHN0cmluZ1tdKTogUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj4gPT4ge1xyXG4gIGNvbnN0IGxvZ1R5cGUgPSBsb2dEZWZpbml0aW9uc1ZlcnNpb25zW3ZlcnNpb25dW3R5cGVdO1xyXG4gIGlmIChpbmNsdWRlID09PSB1bmRlZmluZWQpIHtcclxuICAgIGluY2x1ZGUgPSBPYmplY3Qua2V5cyhsb2dUeXBlLmZpZWxkcyk7XHJcbiAgICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSkge1xyXG4gICAgICBpbmNsdWRlLnB1c2gobG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFyYW1zOiB7XHJcbiAgICBbaW5kZXg6IG51bWJlcl06IHtcclxuICAgICAgZmllbGQ6IHN0cmluZztcclxuICAgICAgdmFsdWU/OiBzdHJpbmc7XHJcbiAgICAgIG9wdGlvbmFsOiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmc/OiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmdLZXlzPzogc3RyaW5nW107XHJcbiAgICAgIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICAgICAgcHJpbWFyeUtleT86IHN0cmluZztcclxuICAgICAgcG9zc2libGVLZXlzPzogc3RyaW5nW107XHJcbiAgICB9O1xyXG4gIH0gPSB7fTtcclxuICBjb25zdCBmaXJzdE9wdGlvbmFsRmllbGQgPSBsb2dUeXBlLmZpcnN0T3B0aW9uYWxGaWVsZDtcclxuXHJcbiAgZm9yIChjb25zdCBbcHJvcCwgaW5kZXhdIG9mIE9iamVjdC5lbnRyaWVzKGxvZ1R5cGUuZmllbGRzKSkge1xyXG4gICAgaWYgKCFpbmNsdWRlLmluY2x1ZGVzKHByb3ApKVxyXG4gICAgICBjb250aW51ZTtcclxuICAgIGNvbnN0IHBhcmFtOiB7IGZpZWxkOiBzdHJpbmc7IHZhbHVlPzogc3RyaW5nOyBvcHRpb25hbDogYm9vbGVhbjsgcmVwZWF0aW5nPzogYm9vbGVhbiB9ID0ge1xyXG4gICAgICBmaWVsZDogcHJvcCxcclxuICAgICAgb3B0aW9uYWw6IGZpcnN0T3B0aW9uYWxGaWVsZCAhPT0gdW5kZWZpbmVkICYmIGluZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgIH07XHJcbiAgICBpZiAocHJvcCA9PT0gJ3R5cGUnKVxyXG4gICAgICBwYXJhbS52YWx1ZSA9IGxvZ1R5cGUudHlwZTtcclxuXHJcbiAgICBwYXJhbXNbaW5kZXhdID0gcGFyYW07XHJcbiAgfVxyXG5cclxuICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSAmJiBpbmNsdWRlLmluY2x1ZGVzKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKSkge1xyXG4gICAgcGFyYW1zW2xvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXhdID0ge1xyXG4gICAgICBmaWVsZDogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgIGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXggPj0gZmlyc3RPcHRpb25hbEZpZWxkLFxyXG4gICAgICByZXBlYXRpbmc6IHRydWUsXHJcbiAgICAgIHJlcGVhdGluZ0tleXM6IFsuLi5sb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5uYW1lc10sXHJcbiAgICAgIHNvcnRLZXlzOiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zb3J0S2V5cyxcclxuICAgICAgcHJpbWFyeUtleTogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucHJpbWFyeUtleSxcclxuICAgICAgcG9zc2libGVLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucG9zc2libGVLZXlzXSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyYW1zIGFzIFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+O1xyXG59O1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXA8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IHtcclxuICBbbmFtZSBpbiBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ25hbWVzJ11bbnVtYmVyXV06XHJcbiAgICB8IHN0cmluZ1xyXG4gICAgfCBzdHJpbmdbXTtcclxufVtdO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RCYXNlXSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IEYgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ2xhYmVsJ11cclxuICA/IFJlcGVhdGluZ0ZpZWxkc01hcDxUS2V5PiA6XHJcbiAgbmV2ZXI7XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEYgZXh0ZW5kcyBrZXlvZiBOZXRGaWVsZHNbVF0sXHJcbj4gPSBUIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8VCwgRj5cclxuICA6IG5ldmVyO1xyXG5cclxudHlwZSBQYXJzZUhlbHBlclR5cGU8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9XHJcbiAgJiB7XHJcbiAgICBbZmllbGQgaW4ga2V5b2YgTmV0RmllbGRzW1RdXT86IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVwZWF0aW5nRmllbGRzTWFwVHlwZTxULCBmaWVsZD47XHJcbiAgfVxyXG4gICYgeyBjYXB0dXJlPzogYm9vbGVhbiB9O1xyXG5cclxuY29uc3QgaXNSZXBlYXRpbmdGaWVsZCA9IDxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbj4oXHJcbiAgcmVwZWF0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkLFxyXG4gIHZhbHVlOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcDxUPiB8IHVuZGVmaW5lZCxcclxuKTogdmFsdWUgaXMgUmVwZWF0aW5nRmllbGRzTWFwPFQ+ID0+IHtcclxuICBpZiAocmVwZWF0aW5nICE9PSB0cnVlKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIEFsbG93IGV4Y2x1ZGluZyB0aGUgZmllbGQgdG8gbWF0Y2ggZm9yIGV4dHJhY3Rpb25cclxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgZm9yIChjb25zdCBlIG9mIHZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIGUgIT09ICdvYmplY3QnKVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VIZWxwZXIgPSA8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPihcclxuICBwYXJhbXM6IFBhcnNlSGVscGVyVHlwZTxUPiB8IHVuZGVmaW5lZCxcclxuICBmdW5jTmFtZTogc3RyaW5nLFxyXG4gIGZpZWxkczogUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj4sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICBwYXJhbXMgPSBwYXJhbXMgPz8ge307XHJcbiAgY29uc3QgdmFsaWRGaWVsZHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gIGZvciAoY29uc3QgaW5kZXggaW4gZmllbGRzKSB7XHJcbiAgICBjb25zdCBmaWVsZCA9IGZpZWxkc1tpbmRleF07XHJcbiAgICBpZiAoZmllbGQpXHJcbiAgICAgIHZhbGlkRmllbGRzLnB1c2goZmllbGQuZmllbGQpO1xyXG4gIH1cclxuXHJcbiAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhwYXJhbXMsIGZ1bmNOYW1lLCBbJ2NhcHR1cmUnLCAuLi52YWxpZEZpZWxkc10pO1xyXG5cclxuICAvLyBGaW5kIHRoZSBsYXN0IGtleSB3ZSBjYXJlIGFib3V0LCBzbyB3ZSBjYW4gc2hvcnRlbiB0aGUgcmVnZXggaWYgbmVlZGVkLlxyXG4gIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChwYXJhbXMuY2FwdHVyZSk7XHJcbiAgY29uc3QgZmllbGRLZXlzID0gT2JqZWN0LmtleXMoZmllbGRzKS5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKTtcclxuICBsZXQgbWF4S2V5U3RyOiBzdHJpbmc7XHJcbiAgaWYgKGNhcHR1cmUpIHtcclxuICAgIGNvbnN0IGtleXM6IEV4dHJhY3Q8a2V5b2YgTmV0RmllbGRzUmV2ZXJzZVtUXSwgc3RyaW5nPltdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpXHJcbiAgICAgIGtleXMucHVzaChrZXkpO1xyXG4gICAgbGV0IHRtcEtleSA9IGtleXMucG9wKCk7XHJcbiAgICBpZiAodG1wS2V5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgbWF4S2V5U3RyID0gZmllbGRLZXlzW2ZpZWxkS2V5cy5sZW5ndGggLSAxXSA/PyAnMCc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aGlsZSAoXHJcbiAgICAgICAgZmllbGRzW3RtcEtleV0/Lm9wdGlvbmFsICYmXHJcbiAgICAgICAgISgoZmllbGRzW3RtcEtleV0/LmZpZWxkID8/ICcnKSBpbiBwYXJhbXMpXHJcbiAgICAgIClcclxuICAgICAgICB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgICBtYXhLZXlTdHIgPSB0bXBLZXkgPz8gJzAnO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtYXhLZXlTdHIgPSAnMCc7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBmaWVsZHNba2V5XSA/PyB7fTtcclxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGZpZWxkc1trZXldPy5maWVsZDtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZSBpbiBwYXJhbXMpXHJcbiAgICAgICAgbWF4S2V5U3RyID0ga2V5O1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBtYXhLZXkgPSBwYXJzZUludChtYXhLZXlTdHIpO1xyXG5cclxuICAvLyBGb3IgdGVzdGluZywgaXQncyB1c2VmdWwgdG8ga25vdyBpZiB0aGlzIGlzIGEgcmVnZXggdGhhdCByZXF1aXJlc1xyXG4gIC8vIHRyYW5zbGF0aW9uLiAgV2UgdGVzdCB0aGlzIGJ5IHNlZWluZyBpZiB0aGVyZSBhcmUgYW55IHNwZWNpZmllZFxyXG4gIC8vIGZpZWxkcywgYW5kIGlmIHNvLCBpbnNlcnRpbmcgYSBtYWdpYyBzdHJpbmcgdGhhdCB3ZSBjYW4gZGV0ZWN0LlxyXG4gIC8vIFRoaXMgbGV0cyB1cyBkaWZmZXJlbnRpYXRlIGJldHdlZW4gXCJyZWdleCB0aGF0IHNob3VsZCBiZSB0cmFuc2xhdGVkXCJcclxuICAvLyBlLmcuIGEgcmVnZXggd2l0aCBgdGFyZ2V0YCBzcGVjaWZpZWQsIGFuZCBcInJlZ2V4IHRoYXQgc2hvdWxkbid0XCJcclxuICAvLyBlLmcuIGEgZ2FpbnMgZWZmZWN0IHdpdGgganVzdCBlZmZlY3RJZCBzcGVjaWZpZWQuXHJcbiAgY29uc3QgdHJhbnNQYXJhbXMgPSBPYmplY3Qua2V5cyhwYXJhbXMpLmZpbHRlcigoaykgPT4ga2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb24uaW5jbHVkZXMoaykpO1xyXG4gIGNvbnN0IG5lZWRzVHJhbnNsYXRpb25zID0gTmV0UmVnZXhlcy5mbGFnVHJhbnNsYXRpb25zTmVlZGVkICYmIHRyYW5zUGFyYW1zLmxlbmd0aCA+IDA7XHJcblxyXG4gIC8vIEJ1aWxkIHRoZSByZWdleCBmcm9tIHRoZSBmaWVsZHMuXHJcbiAgbGV0IHN0ciA9IG5lZWRzVHJhbnNsYXRpb25zID8gbWFnaWNUcmFuc2xhdGlvblN0cmluZyA6ICdeJztcclxuICBsZXQgbGFzdEtleSA9IC0xO1xyXG4gIGZvciAoY29uc3Qga2V5U3RyIGluIGZpZWxkcykge1xyXG4gICAgY29uc3Qga2V5ID0gcGFyc2VJbnQoa2V5U3RyKTtcclxuICAgIC8vIEZpbGwgaW4gYmxhbmtzLlxyXG4gICAgY29uc3QgbWlzc2luZ0ZpZWxkcyA9IGtleSAtIGxhc3RLZXkgLSAxO1xyXG4gICAgaWYgKG1pc3NpbmdGaWVsZHMgPT09IDEpXHJcbiAgICAgIHN0ciArPSAnXFxcXHl7TmV0RmllbGR9JztcclxuICAgIGVsc2UgaWYgKG1pc3NpbmdGaWVsZHMgPiAxKVxyXG4gICAgICBzdHIgKz0gYFxcXFx5e05ldEZpZWxkfXske21pc3NpbmdGaWVsZHN9fWA7XHJcbiAgICBsYXN0S2V5ID0ga2V5O1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gZmllbGRzW2tleVN0cl07XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JylcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2Z1bmNOYW1lfTogaW52YWxpZCB2YWx1ZTogJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCk7XHJcblxyXG4gICAgY29uc3QgZmllbGROYW1lID0gdmFsdWUuZmllbGQ7XHJcbiAgICBjb25zdCBkZWZhdWx0RmllbGRWYWx1ZSA9IHZhbHVlLnZhbHVlPy50b1N0cmluZygpID8/IG1hdGNoRGVmYXVsdDtcclxuICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBwYXJhbXNbZmllbGROYW1lXTtcclxuXHJcbiAgICBpZiAoaXNSZXBlYXRpbmdGaWVsZChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nLCBmaWVsZFZhbHVlKSkge1xyXG4gICAgICBsZXQgcmVwZWF0aW5nQXJyYXk6IFJlcGVhdGluZ0ZpZWxkc01hcDxUPiB8IHVuZGVmaW5lZCA9IGZpZWxkVmFsdWU7XHJcblxyXG4gICAgICBjb25zdCBzb3J0S2V5cyA9IGZpZWxkc1trZXlTdHJdPy5zb3J0S2V5cztcclxuICAgICAgY29uc3QgcHJpbWFyeUtleSA9IGZpZWxkc1trZXlTdHJdPy5wcmltYXJ5S2V5O1xyXG4gICAgICBjb25zdCBwb3NzaWJsZUtleXMgPSBmaWVsZHNba2V5U3RyXT8ucG9zc2libGVLZXlzO1xyXG5cclxuICAgICAgLy8gcHJpbWFyeUtleSBpcyByZXF1aXJlZCBpZiB0aGlzIGlzIGEgcmVwZWF0aW5nIGZpZWxkIHBlciB0eXBlZGVmIGluIG5ldGxvZ19kZWZzLnRzXHJcbiAgICAgIC8vIFNhbWUgd2l0aCBwb3NzaWJsZUtleXNcclxuICAgICAgaWYgKHByaW1hcnlLZXkgPT09IHVuZGVmaW5lZCB8fCBwb3NzaWJsZUtleXMgPT09IHVuZGVmaW5lZClcclxuICAgICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcblxyXG4gICAgICAvLyBBbGxvdyBzb3J0aW5nIGlmIG5lZWRlZFxyXG4gICAgICBpZiAoc29ydEtleXMpIHtcclxuICAgICAgICAvLyBBbHNvIHNvcnQgb3VyIHZhbGlkIGtleXMgbGlzdFxyXG4gICAgICAgIHBvc3NpYmxlS2V5cy5zb3J0KChsZWZ0LCByaWdodCkgPT4gbGVmdC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUocmlnaHQudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIGlmIChyZXBlYXRpbmdBcnJheSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXBlYXRpbmdBcnJheSA9IFsuLi5yZXBlYXRpbmdBcnJheV0uc29ydChcclxuICAgICAgICAgICAgKGxlZnQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCByaWdodDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBudW1iZXIgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIFdlIGNoZWNrIHRoZSB2YWxpZGl0eSBvZiBsZWZ0L3JpZ2h0IGJlY2F1c2UgdGhleSdyZSB1c2VyLXN1cHBsaWVkXHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0ICE9PSAnb2JqZWN0JyB8fCBsZWZ0W3ByaW1hcnlLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCBsZWZ0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zdCBsZWZ0VmFsdWUgPSBsZWZ0W3ByaW1hcnlLZXldO1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdFZhbHVlICE9PSAnc3RyaW5nJyB8fCAhcG9zc2libGVLZXlzPy5pbmNsdWRlcyhsZWZ0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgbGVmdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiByaWdodCAhPT0gJ29iamVjdCcgfHwgcmlnaHRbcHJpbWFyeUtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIHJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zdCByaWdodFZhbHVlID0gcmlnaHRbcHJpbWFyeUtleV07XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiByaWdodFZhbHVlICE9PSAnc3RyaW5nJyB8fCAhcG9zc2libGVLZXlzPy5pbmNsdWRlcyhyaWdodFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIHJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gbGVmdFZhbHVlLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShyaWdodFZhbHVlLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFub25SZXBzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB9W10gfCB1bmRlZmluZWQgPSByZXBlYXRpbmdBcnJheTtcclxuICAgICAgLy8gTG9vcCBvdmVyIG91ciBwb3NzaWJsZSBrZXlzXHJcbiAgICAgIC8vIEJ1aWxkIGEgcmVnZXggdGhhdCBjYW4gbWF0Y2ggYW55IHBvc3NpYmxlIGtleSB3aXRoIHJlcXVpcmVkIHZhbHVlcyBzdWJzdGl0dXRlZCBpblxyXG4gICAgICBwb3NzaWJsZUtleXMuZm9yRWFjaCgocG9zc2libGVLZXkpID0+IHtcclxuICAgICAgICBjb25zdCByZXAgPSBhbm9uUmVwcz8uZmluZCgocmVwKSA9PiBwcmltYXJ5S2V5IGluIHJlcCAmJiByZXBbcHJpbWFyeUtleV0gPT09IHBvc3NpYmxlS2V5KTtcclxuXHJcbiAgICAgICAgbGV0IGZpZWxkUmVnZXggPSAnJztcclxuICAgICAgICAvLyBSYXRoZXIgdGhhbiBsb29waW5nIG92ZXIgdGhlIGtleXMgZGVmaW5lZCBvbiB0aGUgb2JqZWN0LFxyXG4gICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgYmFzZSB0eXBlIGRlZidzIGtleXMuIFRoaXMgZW5mb3JjZXMgdGhlIGNvcnJlY3Qgb3JkZXIuXHJcbiAgICAgICAgZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZ0tleXM/LmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHZhbCA9IHJlcD8uW2tleV07XHJcbiAgICAgICAgICBpZiAocmVwID09PSB1bmRlZmluZWQgfHwgIShrZXkgaW4gcmVwKSkge1xyXG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsdWUgZm9yIHRoaXMga2V5XHJcbiAgICAgICAgICAgIC8vIGluc2VydCBhIHBsYWNlaG9sZGVyLCB1bmxlc3MgaXQncyB0aGUgcHJpbWFyeSBrZXlcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gcHJpbWFyeUtleSlcclxuICAgICAgICAgICAgICB2YWwgPSBwb3NzaWJsZUtleTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsKSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbC5sZW5ndGggPCAxKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsLnNvbWUoKHYpID0+IHR5cGVvZiB2ICE9PSAnc3RyaW5nJykpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmllbGRSZWdleCArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShcclxuICAgICAgICAgICAga2V5ID09PSBwcmltYXJ5S2V5ID8gZmFsc2UgOiBjYXB0dXJlLFxyXG4gICAgICAgICAgICAvLyBBbGwgY2FwdHVyaW5nIGdyb3VwcyBhcmUgYGZpZWxkTmFtZWAgKyBgcG9zc2libGVLZXlgLCBlLmcuIGBwYWlySXNDYXN0aW5nMWBcclxuICAgICAgICAgICAgZmllbGROYW1lICsgcG9zc2libGVLZXksXHJcbiAgICAgICAgICAgIHZhbCxcclxuICAgICAgICAgICAgZGVmYXVsdEZpZWxkVmFsdWUsXHJcbiAgICAgICAgICApICtcclxuICAgICAgICAgICAgc2VwYXJhdG9yO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZmllbGRSZWdleC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBzdHIgKz0gYCg/OiR7ZmllbGRSZWdleH0pJHtyZXAgIT09IHVuZGVmaW5lZCA/ICcnIDogJz8nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZykge1xyXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcmVwZWF0aW5nIGZpZWxkIGJ1dCB0aGUgYWN0dWFsIHZhbHVlIGlzIGVtcHR5IG9yIG90aGVyd2lzZSBpbnZhbGlkLFxyXG4gICAgICAvLyBkb24ndCBwcm9jZXNzIGZ1cnRoZXIuIFdlIGNhbid0IHVzZSBgY29udGludWVgIGluIHRoZSBhYm92ZSBibG9jayBiZWNhdXNlIHRoYXRcclxuICAgICAgLy8gd291bGQgc2tpcCB0aGUgZWFybHktb3V0IGJyZWFrIGF0IHRoZSBlbmQgb2YgdGhlIGxvb3AuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZmllbGROYW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBzdHIgKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAvLyBtb3JlIGFjY3VyYXRlIHR5cGUgaW5zdGVhZCBvZiBgYXNgIGNhc3RcclxuICAgICAgICAgIC8vIG1heWJlIHRoaXMgZnVuY3Rpb24gbmVlZHMgYSByZWZhY3RvcmluZ1xyXG4gICAgICAgICAgY2FwdHVyZSxcclxuICAgICAgICAgIGZpZWxkTmFtZSxcclxuICAgICAgICAgIGZpZWxkVmFsdWUsXHJcbiAgICAgICAgICBkZWZhdWx0RmllbGRWYWx1ZSxcclxuICAgICAgICApICtcclxuICAgICAgICAgIHNlcGFyYXRvcjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzdHIgKz0gZGVmYXVsdEZpZWxkVmFsdWUgKyBzZXBhcmF0b3I7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTdG9wIGlmIHdlJ3JlIG5vdCBjYXB0dXJpbmcgYW5kIGRvbid0IGNhcmUgYWJvdXQgZnV0dXJlIGZpZWxkcy5cclxuICAgIGlmIChrZXkgPj0gbWF4S2V5KVxyXG4gICAgICBicmVhaztcclxuICB9XHJcbiAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKSBhcyBDYWN0Ym90QmFzZVJlZ0V4cDxUPjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBidWlsZFJlZ2V4ID0gPFQgZXh0ZW5kcyBrZXlvZiBOZXRQYXJhbXM+KFxyXG4gIHR5cGU6IFQsXHJcbiAgcGFyYW1zPzogUGFyc2VIZWxwZXJUeXBlPFQ+LFxyXG4pOiBDYWN0Ym90QmFzZVJlZ0V4cDxUPiA9PiB7XHJcbiAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgdHlwZSwgZGVmYXVsdFBhcmFtcyh0eXBlLCBOZXRSZWdleGVzLmxvZ1ZlcnNpb24pKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5ldFJlZ2V4ZXMge1xyXG4gIHN0YXRpYyBsb2dWZXJzaW9uOiBMb2dEZWZpbml0aW9uVmVyc2lvbnMgPSAnbGF0ZXN0JztcclxuXHJcbiAgc3RhdGljIGZsYWdUcmFuc2xhdGlvbnNOZWVkZWQgPSBmYWxzZTtcclxuICBzdGF0aWMgc2V0RmxhZ1RyYW5zbGF0aW9uc05lZWRlZCh2YWx1ZTogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgTmV0UmVnZXhlcy5mbGFnVHJhbnNsYXRpb25zTmVlZGVkID0gdmFsdWU7XHJcbiAgfVxyXG4gIHN0YXRpYyBkb2VzTmV0UmVnZXhOZWVkVHJhbnNsYXRpb24ocmVnZXg6IFJlZ0V4cCB8IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgLy8gTmVlZCB0byBgc2V0RmxhZ1RyYW5zbGF0aW9uc05lZWRlZGAgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvbi5cclxuICAgIGNvbnNvbGUuYXNzZXJ0KE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCk7XHJcbiAgICBjb25zdCBzdHIgPSB0eXBlb2YgcmVnZXggPT09ICdzdHJpbmcnID8gcmVnZXggOiByZWdleC5zb3VyY2U7XHJcbiAgICByZXR1cm4gISFtYWdpY1N0cmluZ1JlZ2V4LmV4ZWMoc3RyKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMC0weDE0LW5ldHdvcmtzdGFydHNjYXN0aW5nXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXJ0c1VzaW5nKHBhcmFtcz86IE5ldFBhcmFtc1snU3RhcnRzVXNpbmcnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGFydHNVc2luZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTdGFydHNVc2luZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjEtMHgxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMi0weDE2LW5ldHdvcmthb2VhYmlsaXR5XHJcbiAgICovXHJcbiAgc3RhdGljIGFiaWxpdHkocGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eSc+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsICdBYmlsaXR5Jywge1xyXG4gICAgICAuLi5kZWZhdWx0UGFyYW1zKCdBYmlsaXR5JywgTmV0UmVnZXhlcy5sb2dWZXJzaW9uKSxcclxuICAgICAgLy8gT3ZlcnJpZGUgdHlwZVxyXG4gICAgICAwOiB7IGZpZWxkOiAndHlwZScsIHZhbHVlOiAnMlsxMl0nLCBvcHRpb25hbDogZmFsc2UgfSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqXHJcbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBhYmlsaXR5YCBpbnN0ZWFkXHJcbiAgICovXHJcbiAgc3RhdGljIGFiaWxpdHlGdWxsKHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gdGhpcy5hYmlsaXR5KHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjctMHgxYi1uZXR3b3JrdGFyZ2V0aWNvbi1oZWFkLW1hcmtlclxyXG4gICAqL1xyXG4gIHN0YXRpYyBoZWFkTWFya2VyKHBhcmFtcz86IE5ldFBhcmFtc1snSGVhZE1hcmtlciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0hlYWRNYXJrZXInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnSGVhZE1hcmtlcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDMtMHgwMy1hZGRjb21iYXRhbnRcclxuICAgKi9cclxuICBzdGF0aWMgYWRkZWRDb21iYXRhbnQocGFyYW1zPzogTmV0UGFyYW1zWydBZGRlZENvbWJhdGFudCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FkZGVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICAgIGRlZmF1bHRQYXJhbXMoJ0FkZGVkQ29tYmF0YW50JywgTmV0UmVnZXhlcy5sb2dWZXJzaW9uKSxcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDMtMHgwMy1hZGRjb21iYXRhbnRcclxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGFkZGVkQ29tYmF0YW50YCBpbnN0ZWFkXHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50RnVsbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5hZGRlZENvbWJhdGFudChwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTA0LTB4MDQtcmVtb3ZlY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIHJlbW92aW5nQ29tYmF0YW50KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydSZW1vdmVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1JlbW92ZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUmVtb3ZlZENvbWJhdGFudCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYtMHgxYS1uZXR3b3JrYnVmZlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYWluc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhaW5zRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FpbnNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnR2FpbnNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJlZmVyIGdhaW5zRWZmZWN0IG92ZXIgdGhpcyBmdW5jdGlvbiB1bmxlc3MgeW91IHJlYWxseSBuZWVkIGV4dHJhIGRhdGEuXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM4LTB4MjYtbmV0d29ya3N0YXR1c2VmZmVjdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdHVzRWZmZWN0RXhwbGljaXQoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXR1c0VmZmVjdCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGF0dXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhdHVzRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zMC0weDFlLW5ldHdvcmtidWZmcmVtb3ZlXHJcbiAgICovXHJcbiAgc3RhdGljIGxvc2VzRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTG9zZXNFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdMb3Nlc0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdMb3Nlc0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzUtMHgyMy1uZXR3b3JrdGV0aGVyXHJcbiAgICovXHJcbiAgc3RhdGljIHRldGhlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ1RldGhlciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1RldGhlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdUZXRoZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogJ3RhcmdldCcgd2FzIGRlZmVhdGVkIGJ5ICdzb3VyY2UnXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1LTB4MTktbmV0d29ya2RlYXRoXHJcbiAgICovXHJcbiAgc3RhdGljIHdhc0RlZmVhdGVkKHBhcmFtcz86IE5ldFBhcmFtc1snV2FzRGVmZWF0ZWQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdXYXNEZWZlYXRlZCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdXYXNEZWZlYXRlZCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjQtMHgxOC1uZXR3b3JrZG90XHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcmtEb1QocGFyYW1zPzogTmV0UGFyYW1zWydOZXR3b3JrRG9UJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmV0d29ya0RvVCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOZXR3b3JrRG9UJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZWNobyhwYXJhbXM/OiBPbWl0PE5ldFBhcmFtc1snR2FtZUxvZyddLCAnY29kZSc+KTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnRWNobycsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5nYW1lTG9nKHsgLi4ucGFyYW1zLCBjb2RlOiBnYW1lTG9nQ29kZXMuZWNobyB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZGlhbG9nKHBhcmFtcz86IE9taXQ8TmV0UGFyYW1zWydHYW1lTG9nJ10sICdjb2RlJz4pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdEaWFsb2cnLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyh7IC4uLnBhcmFtcywgY29kZTogZ2FtZUxvZ0NvZGVzLmRpYWxvZyB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgbWVzc2FnZShwYXJhbXM/OiBPbWl0PE5ldFBhcmFtc1snR2FtZUxvZyddLCAnY29kZSc+KTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnTWVzc2FnZScsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5nYW1lTG9nKHsgLi4ucGFyYW1zLCBjb2RlOiBnYW1lTG9nQ29kZXMubWVzc2FnZSB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGZpZWxkczogY29kZSwgbmFtZSwgbGluZSwgY2FwdHVyZVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZUxvZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0dhbWVMb2cnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTmFtZUxvZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGFiaWxpdHkuXHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMTItMHgwYy1wbGF5ZXJzdGF0c1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGF0Q2hhbmdlKHBhcmFtcz86IE5ldFBhcmFtc1snUGxheWVyU3RhdHMnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdQbGF5ZXJTdGF0cyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdQbGF5ZXJTdGF0cycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDEtMHgwMS1jaGFuZ2V6b25lXHJcbiAgICovXHJcbiAgc3RhdGljIGNoYW5nZVpvbmUocGFyYW1zPzogTmV0UGFyYW1zWydDaGFuZ2Vab25lJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ2hhbmdlWm9uZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDaGFuZ2Vab25lJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zMy0weDIxLW5ldHdvcms2ZC1hY3Rvci1jb250cm9sXHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcms2ZChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yQ29udHJvbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2wnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM0LTB4MjItbmV0d29ya25hbWV0b2dnbGVcclxuICAgKi9cclxuICBzdGF0aWMgbmFtZVRvZ2dsZShwYXJhbXM/OiBOZXRQYXJhbXNbJ05hbWVUb2dnbGUnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdOYW1lVG9nZ2xlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ05hbWVUb2dnbGUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTQwLTB4MjgtbWFwXHJcbiAgICovXHJcbiAgc3RhdGljIG1hcChwYXJhbXM/OiBOZXRQYXJhbXNbJ01hcCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J01hcCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdNYXAnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTQxLTB4Mjktc3lzdGVtbG9nbWVzc2FnZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzeXN0ZW1Mb2dNZXNzYWdlKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTeXN0ZW1Mb2dNZXNzYWdlJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N5c3RlbUxvZ01lc3NhZ2UnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3lzdGVtTG9nTWVzc2FnZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU3LTB4MTAxLW1hcGVmZmVjdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXBFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydNYXBFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXBFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTgtMHgxMDItZmF0ZWRpcmVjdG9yXHJcbiAgICovXHJcbiAgc3RhdGljIGZhdGVEaXJlY3RvcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0ZhdGVEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0ZhdGVEaXJlY3Rvcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdGYXRlRGlyZWN0b3InLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1OS0weDEwMy1jZWRpcmVjdG9yXHJcbiAgICovXHJcbiAgc3RhdGljIGNlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydDRURpcmVjdG9yJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ0VEaXJlY3Rvcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDRURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjAtMHgxMDQtaW5jb21iYXRcclxuICAgKi9cclxuICBzdGF0aWMgaW5Db21iYXQocGFyYW1zPzogTmV0UGFyYW1zWydJbkNvbWJhdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0luQ29tYmF0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0luQ29tYmF0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjEtMHgxMDUtY29tYmF0YW50bWVtb3J5XHJcbiAgICovXHJcbiAgc3RhdGljIGNvbWJhdGFudE1lbW9yeShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29tYmF0YW50TWVtb3J5J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbWJhdGFudE1lbW9yeSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb21iYXRhbnRNZW1vcnknLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Mi0weDEwNi1yc3ZkYXRhXHJcbiAgICovXHJcbiAgc3RhdGljIHJzdkRhdGEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1JTVkRhdGEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUlNWRGF0YSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdSU1ZEYXRhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjMtMHgxMDctc3RhcnRzdXNpbmdleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZ0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZ0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmdFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY0LTB4MTA4LWFiaWxpdHlleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHlFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5RXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eUV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjUtMHgxMDktY29udGVudGZpbmRlcnNldHRpbmdzXHJcbiAgICovXHJcbiAgc3RhdGljIGNvbnRlbnRGaW5kZXJTZXR0aW5ncyhcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29udGVudEZpbmRlclNldHRpbmdzJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbnRlbnRGaW5kZXJTZXR0aW5ncyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb250ZW50RmluZGVyU2V0dGluZ3MnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Ni0weDEwYS1ucGN5ZWxsXHJcbiAgICovXHJcbiAgc3RhdGljIG5wY1llbGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ05wY1llbGwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTnBjWWVsbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOcGNZZWxsJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjctMHgxMGItYmF0dGxldGFsazJcclxuICAgKi9cclxuICBzdGF0aWMgYmF0dGxlVGFsazIoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0JhdHRsZVRhbGsyJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0JhdHRsZVRhbGsyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0JhdHRsZVRhbGsyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjgtMHgxMGMtY291bnRkb3duXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bihcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2OS0weDEwZC1jb3VudGRvd25jYW5jZWxcclxuICAgKi9cclxuICBzdGF0aWMgY291bnRkb3duQ2FuY2VsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb3VudGRvd25DYW5jZWwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ291bnRkb3duQ2FuY2VsJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvdW50ZG93bkNhbmNlbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcwLTB4MTBlLWFjdG9ybW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3Rvck1vdmUoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yTW92ZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3Rvck1vdmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JNb3ZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzEtMHgxMGYtYWN0b3JzZXRwb3NcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JTZXRQb3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yU2V0UG9zJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yU2V0UG9zJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yU2V0UG9zJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzItMHgxMTAtc3Bhd25ucGNleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzcGF3bk5wY0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTcGF3bk5wY0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1NwYXduTnBjRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3Bhd25OcGNFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjczLTB4MTExLWFjdG9yY29udHJvbGV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yQ29udHJvbEV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2xFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjc0LTB4MTEyLWFjdG9yY29udHJvbHNlbGZleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xTZWxmRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbFNlbGZFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xTZWxmRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sU2VsZkV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb21tb25OZXRSZWdleCA9IHtcclxuICAvLyBUT0RPKDYuMik6IHJlbW92ZSA0MDAwMDAxMCBhZnRlciBldmVyeWJvZHkgaXMgb24gNi4yLlxyXG4gIC8vIFRPRE86IG9yIG1heWJlIGtlZXAgYXJvdW5kIGZvciBwbGF5aW5nIG9sZCBsb2cgZmlsZXM/P1xyXG4gIHdpcGU6IE5ldFJlZ2V4ZXMubmV0d29yazZkKHsgY29tbWFuZDogWyc0MDAwMDAxMCcsICc0MDAwMDAwRiddIH0pLFxyXG4gIGNhY3Rib3RXaXBlRWNobzogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ2NhY3Rib3Qgd2lwZS4qPycgfSksXHJcbiAgdXNlcldpcGVFY2hvOiBOZXRSZWdleGVzLmVjaG8oeyBsaW5lOiAnZW5kJyB9KSxcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCBjb25zdCBidWlsZE5ldFJlZ2V4Rm9yVHJpZ2dlciA9IDxUIGV4dGVuZHMga2V5b2YgTmV0UGFyYW1zPihcclxuICB0eXBlOiBULFxyXG4gIHBhcmFtcz86IE5ldFBhcmFtc1tUXSxcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIGlmICh0eXBlID09PSAnQWJpbGl0eScpXHJcbiAgICAvLyB0cyBjYW4ndCBuYXJyb3cgVCB0byBgQWJpbGl0eWAgaGVyZSwgbmVlZCBjYXN0aW5nLlxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuYWJpbGl0eShwYXJhbXMpIGFzIENhY3Rib3RCYXNlUmVnRXhwPFQ+O1xyXG5cclxuICByZXR1cm4gYnVpbGRSZWdleDxUPih0eXBlLCBwYXJhbXMpO1xyXG59O1xyXG4iLCIvLyBPdmVybGF5UGx1Z2luIEFQSSBzZXR1cFxyXG5cclxuaW1wb3J0IHtcclxuICBFdmVudE1hcCxcclxuICBFdmVudFR5cGUsXHJcbiAgSU92ZXJsYXlIYW5kbGVyLFxyXG4gIE92ZXJsYXlIYW5kbGVyRnVuY3MsXHJcbiAgT3ZlcmxheUhhbmRsZXJUeXBlcyxcclxufSBmcm9tICcuLi90eXBlcy9ldmVudCc7XHJcblxyXG50eXBlIEJhc2VSZXNwb25zZSA9IHsgcnNlcT86IG51bWJlcjsgJyRlcnJvcic/OiBib29sZWFuIH07XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICBfX092ZXJsYXlDYWxsYmFjazogRXZlbnRNYXBbRXZlbnRUeXBlXTtcclxuICAgIGRpc3BhdGNoT3ZlcmxheUV2ZW50PzogdHlwZW9mIHByb2Nlc3NFdmVudDtcclxuICAgIE92ZXJsYXlQbHVnaW5BcGk6IHtcclxuICAgICAgcmVhZHk6IGJvb2xlYW47XHJcbiAgICAgIGNhbGxIYW5kbGVyOiAobXNnOiBzdHJpbmcsIGNiPzogKHZhbHVlOiBzdHJpbmcpID0+IHVua25vd24pID0+IHZvaWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEl0IGlzIHJlY29tbWVuZGVkIHRvIGltcG9ydCBmcm9tIHRoaXMgZmlsZTpcclxuICAgICAqXHJcbiAgICAgKiBgaW1wb3J0IHsgYWRkT3ZlcmxheUxpc3RlbmVyIH0gZnJvbSAnL3BhdGgvdG8vb3ZlcmxheV9wbHVnaW5fYXBpJztgXHJcbiAgICAgKi9cclxuICAgIGFkZE92ZXJsYXlMaXN0ZW5lcjogSUFkZE92ZXJsYXlMaXN0ZW5lcjtcclxuICAgIC8qKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBJdCBpcyByZWNvbW1lbmRlZCB0byBpbXBvcnQgZnJvbSB0aGlzIGZpbGU6XHJcbiAgICAgKlxyXG4gICAgICogYGltcG9ydCB7IHJlbW92ZU92ZXJsYXlMaXN0ZW5lciB9IGZyb20gJy9wYXRoL3RvL292ZXJsYXlfcGx1Z2luX2FwaSc7YFxyXG4gICAgICovXHJcbiAgICByZW1vdmVPdmVybGF5TGlzdGVuZXI6IElSZW1vdmVPdmVybGF5TGlzdGVuZXI7XHJcbiAgICAvKipcclxuICAgICAqIEBkZXByZWNhdGVkIFRoaXMgaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgcmVjb21tZW5kZWQgdG8gaW1wb3J0IGZyb20gdGhpcyBmaWxlOlxyXG4gICAgICpcclxuICAgICAqIGBpbXBvcnQgeyBjYWxsT3ZlcmxheUhhbmRsZXIgfSBmcm9tICcvcGF0aC90by9vdmVybGF5X3BsdWdpbl9hcGknO2BcclxuICAgICAqL1xyXG4gICAgY2FsbE92ZXJsYXlIYW5kbGVyOiBJT3ZlcmxheUhhbmRsZXI7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIElBZGRPdmVybGF5TGlzdGVuZXIgPSA8VCBleHRlbmRzIEV2ZW50VHlwZT4oZXZlbnQ6IFQsIGNiOiBFdmVudE1hcFtUXSkgPT4gdm9pZDtcclxudHlwZSBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KGV2ZW50OiBULCBjYjogRXZlbnRNYXBbVF0pID0+IHZvaWQ7XHJcblxyXG50eXBlIFN1YnNjcmliZXI8VD4gPSB7XHJcbiAgW2tleSBpbiBFdmVudFR5cGVdPzogVFtdO1xyXG59O1xyXG50eXBlIEV2ZW50UGFyYW1ldGVyID0gUGFyYW1ldGVyczxFdmVudE1hcFtFdmVudFR5cGVdPlswXTtcclxudHlwZSBWb2lkRnVuYzxUPiA9ICguLi5hcmdzOiBUW10pID0+IHZvaWQ7XHJcblxyXG5sZXQgaW5pdGVkID0gZmFsc2U7XHJcblxyXG5sZXQgd3NVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5sZXQgd3M6IFdlYlNvY2tldCB8IG51bGwgPSBudWxsO1xyXG5sZXQgcXVldWU6IChcclxuICB8IHsgW3M6IHN0cmluZ106IHVua25vd24gfVxyXG4gIHwgW3sgW3M6IHN0cmluZ106IHVua25vd24gfSwgKCh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdW5rbm93bikgfCB1bmRlZmluZWRdXHJcbilbXSB8IG51bGwgPSBbXTtcclxubGV0IHJzZXFDb3VudGVyID0gMDtcclxudHlwZSBQcm9taXNlRnVuY3MgPSB7XHJcbiAgcmVzb2x2ZTogKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkO1xyXG4gIHJlamVjdDogKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkO1xyXG59O1xyXG5jb25zdCByZXNwb25zZVByb21pc2VzOiB7IFtyc2VxSWR4OiBudW1iZXJdOiBQcm9taXNlRnVuY3MgfSA9IHt9O1xyXG5cclxuY29uc3Qgc3Vic2NyaWJlcnM6IFN1YnNjcmliZXI8Vm9pZEZ1bmM8dW5rbm93bj4+ID0ge307XHJcblxyXG5jb25zdCBzZW5kTWVzc2FnZSA9IChcclxuICBtc2c6IHsgW3M6IHN0cmluZ106IHVua25vd24gfSxcclxuICBjYj86ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdW5rbm93bixcclxuKTogdm9pZCA9PiB7XHJcbiAgaWYgKHdzKSB7XHJcbiAgICBpZiAocXVldWUpXHJcbiAgICAgIHF1ZXVlLnB1c2gobXNnKTtcclxuICAgIGVsc2VcclxuICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKHF1ZXVlKVxyXG4gICAgICBxdWV1ZS5wdXNoKFttc2csIGNiXSk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHdpbmRvdy5PdmVybGF5UGx1Z2luQXBpLmNhbGxIYW5kbGVyKEpTT04uc3RyaW5naWZ5KG1zZyksIGNiKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzRXZlbnQgPSA8VCBleHRlbmRzIEV2ZW50VHlwZT4obXNnOiBQYXJhbWV0ZXJzPEV2ZW50TWFwW1RdPlswXSk6IHZvaWQgPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgY29uc3Qgc3VicyA9IHN1YnNjcmliZXJzW21zZy50eXBlXTtcclxuICBzdWJzPy5mb3JFYWNoKChzdWIpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN1Yihtc2cpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGRpc3BhdGNoT3ZlcmxheUV2ZW50ID0gcHJvY2Vzc0V2ZW50O1xyXG5cclxuZXhwb3J0IGNvbnN0IGFkZE92ZXJsYXlMaXN0ZW5lcjogSUFkZE92ZXJsYXlMaXN0ZW5lciA9IChldmVudCwgY2IpOiB2b2lkID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGlmICghc3Vic2NyaWJlcnNbZXZlbnRdKSB7XHJcbiAgICBzdWJzY3JpYmVyc1tldmVudF0gPSBbXTtcclxuXHJcbiAgICBpZiAoIXF1ZXVlKSB7XHJcbiAgICAgIHNlbmRNZXNzYWdlKHtcclxuICAgICAgICBjYWxsOiAnc3Vic2NyaWJlJyxcclxuICAgICAgICBldmVudHM6IFtldmVudF0sXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3Vic2NyaWJlcnNbZXZlbnRdPy5wdXNoKGNiIGFzIFZvaWRGdW5jPHVua25vd24+KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZW1vdmVPdmVybGF5TGlzdGVuZXI6IElSZW1vdmVPdmVybGF5TGlzdGVuZXIgPSAoZXZlbnQsIGNiKTogdm9pZCA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICBpZiAoc3Vic2NyaWJlcnNbZXZlbnRdKSB7XHJcbiAgICBjb25zdCBsaXN0ID0gc3Vic2NyaWJlcnNbZXZlbnRdO1xyXG4gICAgY29uc3QgcG9zID0gbGlzdD8uaW5kZXhPZihjYiBhcyBWb2lkRnVuYzx1bmtub3duPik7XHJcblxyXG4gICAgaWYgKHBvcyAhPT0gdW5kZWZpbmVkICYmIHBvcyA+IC0xKVxyXG4gICAgICBsaXN0Py5zcGxpY2UocG9zLCAxKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBjYWxsT3ZlcmxheUhhbmRsZXJJbnRlcm5hbDogSU92ZXJsYXlIYW5kbGVyID0gKFxyXG4gIF9tc2c6IHsgW3M6IHN0cmluZ106IHVua25vd24gfSxcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4pOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgY29uc3QgbXNnID0ge1xyXG4gICAgLi4uX21zZyxcclxuICAgIHJzZXE6IDAsXHJcbiAgfTtcclxuICBsZXQgcDogUHJvbWlzZTx1bmtub3duPjtcclxuXHJcbiAgaWYgKHdzKSB7XHJcbiAgICBtc2cucnNlcSA9IHJzZXFDb3VudGVyKys7XHJcbiAgICBwID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICByZXNwb25zZVByb21pc2VzW21zZy5yc2VxXSA9IHsgcmVzb2x2ZTogcmVzb2x2ZSwgcmVqZWN0OiByZWplY3QgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlbmRNZXNzYWdlKG1zZyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHNlbmRNZXNzYWdlKG1zZywgKGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhKSBhcyBCYXNlUmVzcG9uc2U7XHJcbiAgICAgICAgaWYgKHBhcnNlZFsnJGVycm9yJ10pXHJcbiAgICAgICAgICByZWplY3QocGFyc2VkKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZXNvbHZlKHBhcnNlZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcDtcclxufTtcclxuXHJcbnR5cGUgT3ZlcnJpZGVNYXAgPSB7IFtjYWxsIGluIE92ZXJsYXlIYW5kbGVyVHlwZXNdPzogT3ZlcmxheUhhbmRsZXJGdW5jc1tjYWxsXSB9O1xyXG5jb25zdCBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcDogT3ZlcnJpZGVNYXAgPSB7fTtcclxuXHJcbmV4cG9ydCBjb25zdCBjYWxsT3ZlcmxheUhhbmRsZXI6IElPdmVybGF5SGFuZGxlciA9IChcclxuICBfbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIC8vIElmIHRoaXMgYGFzYCBpcyBpbmNvcnJlY3QsIHRoZW4gaXQgd2lsbCBub3QgZmluZCBhbiBvdmVycmlkZS5cclxuICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIHJlcGxhY2UgdGhpcyB3aXRoIGEgdHlwZSBndWFyZC5cclxuICBjb25zdCB0eXBlID0gX21zZy5jYWxsIGFzIGtleW9mIE92ZXJyaWRlTWFwO1xyXG4gIGNvbnN0IGNhbGxGdW5jID0gY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXBbdHlwZV0gPz8gY2FsbE92ZXJsYXlIYW5kbGVySW50ZXJuYWw7XHJcblxyXG4gIC8vIFRoZSBgSU92ZXJsYXlIYW5kbGVyYCB0eXBlIGd1YXJhbnRlZXMgdGhhdCBwYXJhbWV0ZXJzL3JldHVybiB0eXBlIG1hdGNoXHJcbiAgLy8gb25lIG9mIHRoZSBvdmVybGF5IGhhbmRsZXJzLiAgVGhlIE92ZXJyaWRlTWFwIGFsc28gb25seSBzdG9yZXMgZnVuY3Rpb25zXHJcbiAgLy8gdGhhdCBtYXRjaCBieSB0aGUgZGlzY3JpbWluYXRpbmcgYGNhbGxgIGZpZWxkLCBhbmQgc28gYW55IG92ZXJyaWRlc1xyXG4gIC8vIHNob3VsZCBiZSBjb3JyZWN0IGhlcmUuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSxAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XHJcbiAgcmV0dXJuIGNhbGxGdW5jKF9tc2cgYXMgYW55KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzZXRPdmVybGF5SGFuZGxlck92ZXJyaWRlID0gPFQgZXh0ZW5kcyBrZXlvZiBPdmVybGF5SGFuZGxlckZ1bmNzPihcclxuICB0eXBlOiBULFxyXG4gIG92ZXJyaWRlPzogT3ZlcmxheUhhbmRsZXJGdW5jc1tUXSxcclxuKTogdm9pZCA9PiB7XHJcbiAgaWYgKCFvdmVycmlkZSkge1xyXG4gICAgZGVsZXRlIGNhbGxPdmVybGF5SGFuZGxlck92ZXJyaWRlTWFwW3R5cGVdO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcFt0eXBlXSA9IG92ZXJyaWRlO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGluaXQgPSAoKTogdm9pZCA9PiB7XHJcbiAgaWYgKGluaXRlZClcclxuICAgIHJldHVybjtcclxuXHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICB3c1VybCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdPVkVSTEFZX1dTJyk7XHJcbiAgICBpZiAod3NVcmwgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgY29ubmVjdFdzID0gZnVuY3Rpb24od3NVcmw6IHN0cmluZykge1xyXG4gICAgICAgIHdzID0gbmV3IFdlYlNvY2tldCh3c1VybCk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIScpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHEgPSBxdWV1ZSA/PyBbXTtcclxuICAgICAgICAgIHF1ZXVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBzZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICAgIGNhbGw6ICdzdWJzY3JpYmUnLFxyXG4gICAgICAgICAgICBldmVudHM6IE9iamVjdC5rZXlzKHN1YnNjcmliZXJzKSxcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGZvciAoY29uc3QgbXNnIG9mIHEpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG1zZykpXHJcbiAgICAgICAgICAgICAgc2VuZE1lc3NhZ2UobXNnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3MuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChfbXNnKSA9PiB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9tc2cuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIG1lc3NhZ2UgZGF0YSByZWNlaXZlZDogJywgX21zZyk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IEpTT04ucGFyc2UoX21zZy5kYXRhKSBhcyBFdmVudFBhcmFtZXRlciAmIEJhc2VSZXNwb25zZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VGdW5jcyA9IG1zZz8ucnNlcSAhPT0gdW5kZWZpbmVkID8gcmVzcG9uc2VQcm9taXNlc1ttc2cucnNlcV0gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChtc2cucnNlcSAhPT0gdW5kZWZpbmVkICYmIHByb21pc2VGdW5jcykge1xyXG4gICAgICAgICAgICAgIGlmIChtc2dbJyRlcnJvciddKVxyXG4gICAgICAgICAgICAgICAgcHJvbWlzZUZ1bmNzLnJlamVjdChtc2cpO1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHByb21pc2VGdW5jcy5yZXNvbHZlKG1zZyk7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlUHJvbWlzZXNbbXNnLnJzZXFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHByb2Nlc3NFdmVudChtc2cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ludmFsaWQgbWVzc2FnZSByZWNlaXZlZDogJywgX21zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3MuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1RyeWluZyB0byByZWNvbm5lY3QuLi4nKTtcclxuICAgICAgICAgIC8vIERvbid0IHNwYW0gdGhlIHNlcnZlciB3aXRoIHJldHJpZXMuXHJcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbm5lY3RXcyh3c1VybCk7XHJcbiAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29ubmVjdFdzKHdzVXJsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHdhaXRGb3JBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXdpbmRvdy5PdmVybGF5UGx1Z2luQXBpPy5yZWFkeSkge1xyXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQod2FpdEZvckFwaSwgMzAwKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHEgPSBxdWV1ZSA/PyBbXTtcclxuICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgIHdpbmRvdy5fX092ZXJsYXlDYWxsYmFjayA9IHByb2Nlc3NFdmVudDtcclxuXHJcbiAgICAgICAgc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgY2FsbDogJ3N1YnNjcmliZScsXHJcbiAgICAgICAgICBldmVudHM6IE9iamVjdC5rZXlzKHN1YnNjcmliZXJzKSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHEpIHtcclxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKVxyXG4gICAgICAgICAgICBzZW5kTWVzc2FnZShpdGVtWzBdLCBpdGVtWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB3YWl0Rm9yQXBpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGVyZSB0aGUgT3ZlcmxheVBsdWdpbiBBUEkgaXMgcmVnaXN0ZXJlZCB0byB0aGUgd2luZG93IG9iamVjdCxcclxuICAgIC8vIGJ1dCB0aGlzIGlzIG1haW5seSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIEZvciBjYWN0Ym90J3MgYnVpbHQtaW4gZmlsZXMsXHJcbiAgICAvLyBpdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgdGhlIHZhcmlvdXMgZnVuY3Rpb25zIGV4cG9ydGVkIGluIHJlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGkudHMuXHJcblxyXG4gICAgLyogZXNsaW50LWRpc2FibGUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb24gKi9cclxuICAgIHdpbmRvdy5hZGRPdmVybGF5TGlzdGVuZXIgPSBhZGRPdmVybGF5TGlzdGVuZXI7XHJcbiAgICB3aW5kb3cucmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gcmVtb3ZlT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgd2luZG93LmNhbGxPdmVybGF5SGFuZGxlciA9IGNhbGxPdmVybGF5SGFuZGxlcjtcclxuICAgIHdpbmRvdy5kaXNwYXRjaE92ZXJsYXlFdmVudCA9IGRpc3BhdGNoT3ZlcmxheUV2ZW50O1xyXG4gICAgLyogZXNsaW50LWVuYWJsZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvbiAqL1xyXG4gIH1cclxuXHJcbiAgaW5pdGVkID0gdHJ1ZTtcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgeyBhZGRPdmVybGF5TGlzdGVuZXIsIGNhbGxPdmVybGF5SGFuZGxlciB9IGZyb20gJy4uLy4uL3Jlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGknO1xyXG5cclxuaW1wb3J0ICcuLi8uLi9yZXNvdXJjZXMvZGVmYXVsdHMuY3NzJztcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignQ2hhbmdlWm9uZScsIChlKSA9PiB7XHJcbiAgY29uc3QgY3VycmVudFpvbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudFpvbmUnKTtcclxuICBpZiAoY3VycmVudFpvbmUpXHJcbiAgICBjdXJyZW50Wm9uZS5pbm5lclRleHQgPSBgY3VycmVudFpvbmU6ICR7ZS56b25lTmFtZX0gKCR7ZS56b25lSUR9KWA7XHJcbn0pO1xyXG5cclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdvbkluQ29tYmF0Q2hhbmdlZEV2ZW50JywgKGUpID0+IHtcclxuICBjb25zdCBpbkNvbWJhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbkNvbWJhdCcpO1xyXG4gIGlmIChpbkNvbWJhdCkge1xyXG4gICAgaW5Db21iYXQuaW5uZXJUZXh0ID0gYGluQ29tYmF0OiBhY3Q6ICR7ZS5kZXRhaWwuaW5BQ1RDb21iYXQgPyAneWVzJyA6ICdubyd9IGdhbWU6ICR7XHJcbiAgICAgIGUuZGV0YWlsLmluR2FtZUNvbWJhdCA/ICd5ZXMnIDogJ25vJ1xyXG4gICAgfWA7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25QbGF5ZXJDaGFuZ2VkRXZlbnQnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZScpO1xyXG4gIGlmIChuYW1lKVxyXG4gICAgbmFtZS5pbm5lclRleHQgPSBlLmRldGFpbC5uYW1lO1xyXG4gIGNvbnN0IHBsYXllcklkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcklkJyk7XHJcbiAgaWYgKHBsYXllcklkKVxyXG4gICAgcGxheWVySWQuaW5uZXJUZXh0ID0gZS5kZXRhaWwuaWQudG9TdHJpbmcoMTYpO1xyXG4gIGNvbnN0IGhwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hwJyk7XHJcbiAgaWYgKGhwKVxyXG4gICAgaHAuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudEhQfS8ke2UuZGV0YWlsLm1heEhQfSAoJHtlLmRldGFpbC5jdXJyZW50U2hpZWxkfSlgO1xyXG4gIGNvbnN0IG1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wJyk7XHJcbiAgaWYgKG1wKVxyXG4gICAgbXAuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudE1QfS8ke2UuZGV0YWlsLm1heE1QfWA7XHJcbiAgY29uc3QgY3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3AnKTtcclxuICBpZiAoY3ApXHJcbiAgICBjcC5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5jdXJyZW50Q1B9LyR7ZS5kZXRhaWwubWF4Q1B9YDtcclxuICBjb25zdCBncCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncCcpO1xyXG4gIGlmIChncClcclxuICAgIGdwLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRHUH0vJHtlLmRldGFpbC5tYXhHUH1gO1xyXG4gIGNvbnN0IGpvYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2InKTtcclxuICBpZiAoam9iKVxyXG4gICAgam9iLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmxldmVsfSAke2UuZGV0YWlsLmpvYn1gO1xyXG4gIGNvbnN0IGRlYnVnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlYnVnJyk7XHJcbiAgaWYgKGRlYnVnKVxyXG4gICAgZGVidWcuaW5uZXJUZXh0ID0gZS5kZXRhaWwuZGVidWdKb2I7XHJcblxyXG4gIGNvbnN0IGpvYkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9iaW5mbycpO1xyXG4gIGlmIChqb2JJbmZvKSB7XHJcbiAgICBjb25zdCBkZXRhaWwgPSBlLmRldGFpbDtcclxuICAgIGlmIChkZXRhaWwuam9iID09PSAnUkRNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLndoaXRlTWFuYX0gfCAke2RldGFpbC5qb2JEZXRhaWwuYmxhY2tNYW5hfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5tYW5hU3RhY2tzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdXQVInICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBkZXRhaWwuam9iRGV0YWlsLmJlYXN0LnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdEUksnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYmxvb2R9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmRhcmtzaWRlTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5kYXJrQXJ0cy50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5saXZpbmdTaGFkb3dNaWxsaXNlY29uZHN9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0dOQicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwuY2FydHJpZGdlc30gfCAke2RldGFpbC5qb2JEZXRhaWwuY29udGludWF0aW9uU3RhdGV9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1BMRCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGRldGFpbC5qb2JEZXRhaWwub2F0aC50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQlJEJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnNvbmdOYW1lfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sYXN0UGxheWVkfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zb25nUHJvY3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvdWxHYXVnZX0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29uZ01pbGxpc2Vjb25kc30gfCBbJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwuY29kYS5qb2luKCcsICcpXHJcbiAgICAgICAgfV1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRE5DJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gYCR7ZGV0YWlsLmpvYkRldGFpbC5mZWF0aGVyc30gfCAke2RldGFpbC5qb2JEZXRhaWwuZXNwcml0fSB8IFske1xyXG4gICAgICAgIGRldGFpbC5qb2JEZXRhaWwuc3RlcHMuam9pbignLCAnKVxyXG4gICAgICB9XSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jdXJyZW50U3RlcH1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTklOJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gYCR7ZGV0YWlsLmpvYkRldGFpbC5uaW5raUFtb3VudH0gfCAke2RldGFpbC5qb2JEZXRhaWwua2F6ZW1hdG9pfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdEUkcnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYmxvb2RNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxpZmVNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmV5ZXNBbW91bnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZpcnN0bWluZHNGb2N1c31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQkxNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnVtYnJhbFN0YWNrc30gKCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxIZWFydHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnBvbHlnbG90fSAke2RldGFpbC5qb2JEZXRhaWwuZW5vY2hpYW4udG9TdHJpbmcoKX0gKCR7ZGV0YWlsLmpvYkRldGFpbC5uZXh0UG9seWdsb3RNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wYXJhZG94LnRvU3RyaW5nKCl9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFzdHJhbFNvdWxTdGFja3N9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1RITScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwudW1icmFsTWlsbGlzZWNvbmRzfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnV0hNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmxpbHlTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwubGlseU1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kbGlseVN0YWNrc31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU01OJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFldGhlcmZsb3dTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnRyYW5jZU1pbGxpc2Vjb25kc30gfCAke2RldGFpbC5qb2JEZXRhaWwuYXR0dW5lbWVudH0gfCAke2RldGFpbC5qb2JEZXRhaWwuYXR0dW5lbWVudE1pbGxpc2Vjb25kc30gfCAke1xyXG4gICAgICAgICAgZGV0YWlsXHJcbiAgICAgICAgICAgIC5qb2JEZXRhaWwuYWN0aXZlUHJpbWFsID8/ICctJ1xyXG4gICAgICAgIH0gfCBbJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwudXNhYmxlQXJjYW51bS5qb2luKCcsICcpXHJcbiAgICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwubmV4dFN1bW1vbmVkfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zdW1tb25TdGF0dXMudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0NIJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFldGhlcmZsb3dTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5R2F1Z2V9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5U3RhdHVzfSAoJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5TWlsbGlzZWNvbmRzfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQUNOJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdBU1QnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDF9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQyfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jYXJkM30gfCAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLm5leHRkcmF3fWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdNTksnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuY2hha3JhU3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sdW5hck5hZGkudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29sYXJOYWRpLnRvU3RyaW5nKCl9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmJlYXN0Q2hha3JhLmpvaW4oJywgJylcclxuICAgICAgICB9XSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5vcG9vcG9GdXJ5fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5yYXB0b3JGdXJ5fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jb2V1cmxGdXJ5fWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdNQ0gnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuaGVhdH0gKCR7ZGV0YWlsLmpvYkRldGFpbC5vdmVyaGVhdE1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmJhdHRlcnl9ICgke2RldGFpbC5qb2JEZXRhaWwuYmF0dGVyeU1pbGxpc2Vjb25kc30pIHwgbGFzdDogJHtkZXRhaWwuam9iRGV0YWlsLmxhc3RCYXR0ZXJ5QW1vdW50fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5vdmVyaGVhdEFjdGl2ZS50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5yb2JvdEFjdGl2ZS50b1N0cmluZygpfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdTQU0nICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwua2Vua2l9IHwgJHtkZXRhaWwuam9iRGV0YWlsLm1lZGl0YXRpb25TdGFja3N9KCR7ZGV0YWlsLmpvYkRldGFpbC5zZXRzdS50b1N0cmluZygpfSwke2RldGFpbC5qb2JEZXRhaWwuZ2V0c3UudG9TdHJpbmcoKX0sJHtkZXRhaWwuam9iRGV0YWlsLmthLnRvU3RyaW5nKCl9KWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdTR0UnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzZ2FsbH0gKCR7ZGV0YWlsLmpvYkRldGFpbC5hZGRlcnNnYWxsTWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzdGluZ30gfCAke2RldGFpbC5qb2JEZXRhaWwuZXVrcmFzaWEudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnUlBSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnNvdWx9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNocm91ZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuZW5zaHJvdWRNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxlbXVyZVNocm91ZH0gfCAke2RldGFpbC5qb2JEZXRhaWwudm9pZFNocm91ZH1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnVlBSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnJhdHRsaW5nQ29pbFN0YWNrc30gfCAke2RldGFpbC5qb2JEZXRhaWwuYW5ndWluZVRyaWJ1dGV9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNlcnBlbnRPZmZlcmluZ30gfCAke2RldGFpbC5qb2JEZXRhaWwuYWR2YW5jZWRDb21ib30gfCAke2RldGFpbC5qb2JEZXRhaWwucmVhd2FrZW5lZFRpbWVyfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdQQ1QnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwucGFsZXR0ZUdhdWdlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wYWludH0gfCAoJHtkZXRhaWwuam9iRGV0YWlsLmNyZWF0dXJlTW90aWZ9IHwgJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwud2VhcG9uTW90aWYgPyAnV2VhcG9uJyA6ICdOb25lJ1xyXG4gICAgICAgIH0gfCAke2RldGFpbC5qb2JEZXRhaWwubGFuZHNjYXBlTW90aWYgPyAnTGFuZHNjYXBlJyA6ICdOb25lJ30pIHwgKCR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmRlcGljdGlvbnMuam9pbignKycpIHx8ICdOb25lJ1xyXG4gICAgICAgIH0pIHwgJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwubW9vZ2xlUG9ydHJhaXRcclxuICAgICAgICAgICAgPyAnTW9vZ2xlJ1xyXG4gICAgICAgICAgICA6IGRldGFpbC5qb2JEZXRhaWwubWFkZWVuUG9ydHJhaXRcclxuICAgICAgICAgICAgPyAnTWFkZWVuJ1xyXG4gICAgICAgICAgICA6ICdOb25lJ1xyXG4gICAgICAgIH1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSAnJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3MnKTtcclxuICBpZiAocG9zKSB7XHJcbiAgICBwb3MuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwucG9zLngudG9GaXhlZCgyKX0sJHtlLmRldGFpbC5wb3MueS50b0ZpeGVkKDIpfSwke1xyXG4gICAgICBlLmRldGFpbC5wb3Muei50b0ZpeGVkKDIpXHJcbiAgICB9YDtcclxuICB9XHJcbiAgY29uc3Qgcm90YXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm90YXRpb24nKTtcclxuICBpZiAocm90YXRpb24pXHJcbiAgICByb3RhdGlvbi5pbm5lclRleHQgPSBlLmRldGFpbC5yb3RhdGlvbi50b1N0cmluZygpO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignRW5taXR5VGFyZ2V0RGF0YScsIChlKSA9PiB7XHJcbiAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhcmdldCcpO1xyXG4gIGlmICh0YXJnZXQpXHJcbiAgICB0YXJnZXQuaW5uZXJUZXh0ID0gZS5UYXJnZXQgPyBlLlRhcmdldC5OYW1lIDogJy0tJztcclxuICBjb25zdCB0aWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlkJyk7XHJcbiAgaWYgKHRpZClcclxuICAgIHRpZC5pbm5lclRleHQgPSBlLlRhcmdldCA/IGUuVGFyZ2V0LklELnRvU3RyaW5nKDE2KSA6ICcnO1xyXG4gIGNvbnN0IHRkaXN0YW5jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZGlzdGFuY2UnKTtcclxuICBpZiAodGRpc3RhbmNlKVxyXG4gICAgdGRpc3RhbmNlLmlubmVyVGV4dCA9IGUuVGFyZ2V0ID8gZS5UYXJnZXQuRGlzdGFuY2UudG9TdHJpbmcoKSA6ICcnO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25HYW1lRXhpc3RzRXZlbnQnLCAoX2UpID0+IHtcclxuICAvLyBjb25zb2xlLmxvZyhcIkdhbWUgZXhpc3RzOiBcIiArIGUuZGV0YWlsLmV4aXN0cyk7XHJcbn0pO1xyXG5cclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdvbkdhbWVBY3RpdmVDaGFuZ2VkRXZlbnQnLCAoX2UpID0+IHtcclxuICAvLyBjb25zb2xlLmxvZyhcIkdhbWUgYWN0aXZlOiBcIiArIGUuZGV0YWlsLmFjdGl2ZSk7XHJcbn0pO1xyXG5cclxuY29uc3QgdHRzRWNob1JlZ2V4ID0gTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ3R0czouKj8nIH0pO1xyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0xvZ0xpbmUnLCAoZSkgPT4ge1xyXG4gIC8vIE1hdGNoIFwiL2VjaG8gdHRzOjxzdHVmZj5cIlxyXG4gIGNvbnN0IGxpbmUgPSB0dHNFY2hvUmVnZXguZXhlYyhlLnJhd0xpbmUpPy5ncm91cHM/LmxpbmU7XHJcbiAgaWYgKGxpbmUgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybjtcclxuICBjb25zdCBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicpO1xyXG4gIGlmIChjb2xvbiA9PT0gLTEpXHJcbiAgICByZXR1cm47XHJcbiAgY29uc3QgdGV4dCA9IGxpbmUuc2xpY2UoY29sb24pO1xyXG4gIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHZvaWQgY2FsbE92ZXJsYXlIYW5kbGVyKHtcclxuICAgICAgY2FsbDogJ2NhY3Rib3RTYXknLFxyXG4gICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25Vc2VyRmlsZUNoYW5nZWQnLCAoZSkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKGBVc2VyIGZpbGUgJHtlLmZpbGV9IGNoYW5nZWQhYCk7XHJcbn0pO1xyXG5cclxudm9pZCBjYWxsT3ZlcmxheUhhbmRsZXIoeyBjYWxsOiAnY2FjdGJvdFJlcXVlc3RTdGF0ZScgfSk7XHJcbiJdLCJuYW1lcyI6WyJjb21iYXRhbnRNZW1vcnlLZXlzIiwibGF0ZXN0TG9nRGVmaW5pdGlvbnMiLCJHYW1lTG9nIiwidHlwZSIsIm5hbWUiLCJzb3VyY2UiLCJtZXNzYWdlVHlwZSIsImZpZWxkcyIsInRpbWVzdGFtcCIsImNvZGUiLCJsaW5lIiwic3ViRmllbGRzIiwiY2FuQW5vbnltaXplIiwiZmlyc3RPcHRpb25hbEZpZWxkIiwidW5kZWZpbmVkIiwiYW5hbHlzaXNPcHRpb25zIiwiaW5jbHVkZSIsImZpbHRlcnMiLCJDaGFuZ2Vab25lIiwiaWQiLCJsYXN0SW5jbHVkZSIsIkNoYW5nZWRQbGF5ZXIiLCJwbGF5ZXJJZHMiLCJBZGRlZENvbWJhdGFudCIsImpvYiIsImxldmVsIiwib3duZXJJZCIsIndvcmxkSWQiLCJ3b3JsZCIsIm5wY05hbWVJZCIsIm5wY0Jhc2VJZCIsImN1cnJlbnRIcCIsImhwIiwiY3VycmVudE1wIiwibXAiLCJ4IiwieSIsInoiLCJoZWFkaW5nIiwiY29tYmF0YW50SWRGaWVsZHMiLCJSZW1vdmVkQ29tYmF0YW50Iiwib3duZXIiLCJQYXJ0eUxpc3QiLCJwYXJ0eUNvdW50IiwiaWQwIiwiaWQxIiwiaWQyIiwiaWQzIiwiaWQ0IiwiaWQ1IiwiaWQ2IiwiaWQ3IiwiaWQ4IiwiaWQ5IiwiaWQxMCIsImlkMTEiLCJpZDEyIiwiaWQxMyIsImlkMTQiLCJpZDE1IiwiaWQxNiIsImlkMTciLCJpZDE4IiwiaWQxOSIsImlkMjAiLCJpZDIxIiwiaWQyMiIsImlkMjMiLCJQbGF5ZXJTdGF0cyIsInN0cmVuZ3RoIiwiZGV4dGVyaXR5Iiwidml0YWxpdHkiLCJpbnRlbGxpZ2VuY2UiLCJtaW5kIiwicGlldHkiLCJhdHRhY2tQb3dlciIsImRpcmVjdEhpdCIsImNyaXRpY2FsSGl0IiwiYXR0YWNrTWFnaWNQb3RlbmN5IiwiaGVhbE1hZ2ljUG90ZW5jeSIsImRldGVybWluYXRpb24iLCJza2lsbFNwZWVkIiwic3BlbGxTcGVlZCIsInRlbmFjaXR5IiwibG9jYWxDb250ZW50SWQiLCJTdGFydHNVc2luZyIsInNvdXJjZUlkIiwiYWJpbGl0eSIsInRhcmdldElkIiwidGFyZ2V0IiwiY2FzdFRpbWUiLCJwb3NzaWJsZVJzdkZpZWxkcyIsImJsYW5rRmllbGRzIiwiQWJpbGl0eSIsImZsYWdzIiwiZGFtYWdlIiwidGFyZ2V0Q3VycmVudEhwIiwidGFyZ2V0TWF4SHAiLCJ0YXJnZXRDdXJyZW50TXAiLCJ0YXJnZXRNYXhNcCIsInRhcmdldFgiLCJ0YXJnZXRZIiwidGFyZ2V0WiIsInRhcmdldEhlYWRpbmciLCJtYXhIcCIsIm1heE1wIiwic2VxdWVuY2UiLCJ0YXJnZXRJbmRleCIsInRhcmdldENvdW50Iiwib3duZXJOYW1lIiwiZWZmZWN0RGlzcGxheVR5cGUiLCJhY3Rpb25JZCIsImFjdGlvbkFuaW1hdGlvbklkIiwiYW5pbWF0aW9uTG9ja1RpbWUiLCJyb3RhdGlvbkhleCIsIk5ldHdvcmtBT0VBYmlsaXR5IiwiTmV0d29ya0NhbmNlbEFiaWxpdHkiLCJyZWFzb24iLCJOZXR3b3JrRG9UIiwid2hpY2giLCJlZmZlY3RJZCIsImRhbWFnZVR5cGUiLCJzb3VyY2VDdXJyZW50SHAiLCJzb3VyY2VNYXhIcCIsInNvdXJjZUN1cnJlbnRNcCIsInNvdXJjZU1heE1wIiwic291cmNlWCIsInNvdXJjZVkiLCJzb3VyY2VaIiwic291cmNlSGVhZGluZyIsIldhc0RlZmVhdGVkIiwiR2FpbnNFZmZlY3QiLCJlZmZlY3QiLCJkdXJhdGlvbiIsImNvdW50IiwiSGVhZE1hcmtlciIsImRhdGEwIiwicG9zc2libGVQbGF5ZXJJZHMiLCJOZXR3b3JrUmFpZE1hcmtlciIsIm9wZXJhdGlvbiIsIndheW1hcmsiLCJOZXR3b3JrVGFyZ2V0TWFya2VyIiwidGFyZ2V0TmFtZSIsIkxvc2VzRWZmZWN0IiwiTmV0d29ya0dhdWdlIiwiZGF0YTEiLCJkYXRhMiIsImRhdGEzIiwiZmlyc3RVbmtub3duRmllbGQiLCJOZXR3b3JrV29ybGQiLCJpc1Vua25vd24iLCJBY3RvckNvbnRyb2wiLCJpbnN0YW5jZSIsImNvbW1hbmQiLCJOYW1lVG9nZ2xlIiwidG9nZ2xlIiwiVGV0aGVyIiwiTGltaXRCcmVhayIsInZhbHVlSGV4IiwiYmFycyIsIk5ldHdvcmtFZmZlY3RSZXN1bHQiLCJzZXF1ZW5jZUlkIiwiY3VycmVudFNoaWVsZCIsIlN0YXR1c0VmZmVjdCIsImpvYkxldmVsRGF0YSIsImRhdGE0IiwiZGF0YTUiLCJOZXR3b3JrVXBkYXRlSFAiLCJNYXAiLCJyZWdpb25OYW1lIiwicGxhY2VOYW1lIiwicGxhY2VOYW1lU3ViIiwiU3lzdGVtTG9nTWVzc2FnZSIsInBhcmFtMCIsInBhcmFtMSIsInBhcmFtMiIsIlN0YXR1c0xpc3QzIiwiUGFyc2VySW5mbyIsImdsb2JhbEluY2x1ZGUiLCJQcm9jZXNzSW5mbyIsIkRlYnVnIiwiUGFja2V0RHVtcCIsIlZlcnNpb24iLCJFcnJvciIsIk5vbmUiLCJMaW5lUmVnaXN0cmF0aW9uIiwidmVyc2lvbiIsIk1hcEVmZmVjdCIsImxvY2F0aW9uIiwiRmF0ZURpcmVjdG9yIiwiY2F0ZWdvcnkiLCJmYXRlSWQiLCJwcm9ncmVzcyIsIkNFRGlyZWN0b3IiLCJwb3BUaW1lIiwidGltZVJlbWFpbmluZyIsImNlS2V5IiwibnVtUGxheWVycyIsInN0YXR1cyIsIkluQ29tYmF0IiwiaW5BQ1RDb21iYXQiLCJpbkdhbWVDb21iYXQiLCJpc0FDVENoYW5nZWQiLCJpc0dhbWVDaGFuZ2VkIiwiQ29tYmF0YW50TWVtb3J5IiwiY2hhbmdlIiwicmVwZWF0aW5nRmllbGRzIiwic3RhcnRpbmdJbmRleCIsImxhYmVsIiwibmFtZXMiLCJzb3J0S2V5cyIsInByaW1hcnlLZXkiLCJwb3NzaWJsZUtleXMiLCJrZXlzVG9Bbm9ueW1pemUiLCJwYWlyIiwia2V5IiwidmFsdWUiLCJSU1ZEYXRhIiwibG9jYWxlIiwiU3RhcnRzVXNpbmdFeHRyYSIsIkFiaWxpdHlFeHRyYSIsImdsb2JhbEVmZmVjdENvdW50ZXIiLCJkYXRhRmxhZyIsImFuaW1hdGlvblRhcmdldElkIiwiQ29udGVudEZpbmRlclNldHRpbmdzIiwiem9uZUlkIiwiem9uZU5hbWUiLCJpbkNvbnRlbnRGaW5kZXJDb250ZW50IiwidW5yZXN0cmljdGVkUGFydHkiLCJtaW5pbWFsSXRlbUxldmVsIiwic2lsZW5jZUVjaG8iLCJleHBsb3Jlck1vZGUiLCJsZXZlbFN5bmMiLCJOcGNZZWxsIiwibnBjSWQiLCJucGNZZWxsSWQiLCJCYXR0bGVUYWxrMiIsImluc3RhbmNlQ29udGVudFRleHRJZCIsImRpc3BsYXlNcyIsIkNvdW50ZG93biIsImNvdW50ZG93blRpbWUiLCJyZXN1bHQiLCJDb3VudGRvd25DYW5jZWwiLCJBY3Rvck1vdmUiLCJtb3ZlVHlwZSIsIkFjdG9yU2V0UG9zIiwiU3Bhd25OcGNFeHRyYSIsInBhcmVudElkIiwidGV0aGVySWQiLCJhbmltYXRpb25TdGF0ZSIsIkFjdG9yQ29udHJvbEV4dHJhIiwicGFyYW0zIiwicGFyYW00IiwiQWN0b3JDb250cm9sU2VsZkV4dHJhIiwicGFyYW01IiwicGFyYW02IiwibG9nRGVmaW5pdGlvbnNWZXJzaW9ucyIsImFzc2VydExvZ0RlZmluaXRpb25zIiwiY29uc29sZSIsImFzc2VydCIsIlVucmVhY2hhYmxlQ29kZSIsImNvbnN0cnVjdG9yIiwibG9nRGVmaW5pdGlvbnMiLCJzZXBhcmF0b3IiLCJtYXRjaERlZmF1bHQiLCJtYXRjaFdpdGhDb2xvbnNEZWZhdWx0IiwiZmllbGRzV2l0aFBvdGVudGlhbENvbG9ucyIsImRlZmF1bHRQYXJhbXMiLCJsb2dUeXBlIiwiT2JqZWN0Iiwia2V5cyIsInB1c2giLCJwYXJhbXMiLCJwcm9wIiwiaW5kZXgiLCJlbnRyaWVzIiwiaW5jbHVkZXMiLCJwYXJhbSIsImZpZWxkIiwib3B0aW9uYWwiLCJyZXBlYXRpbmciLCJyZXBlYXRpbmdLZXlzIiwiaXNSZXBlYXRpbmdGaWVsZCIsIkFycmF5IiwiaXNBcnJheSIsImUiLCJwYXJzZUhlbHBlciIsImRlZktleSIsInZhbGlkRmllbGRzIiwiUmVnZXhlcyIsInZhbGlkYXRlUGFyYW1zIiwiY2FwdHVyZSIsInRydWVJZlVuZGVmaW5lZCIsImZpZWxkS2V5cyIsInNvcnQiLCJhIiwiYiIsInBhcnNlSW50IiwibWF4S2V5U3RyIiwidG1wS2V5IiwicG9wIiwibGVuZ3RoIiwiZmllbGROYW1lIiwibWF4S2V5IiwiYWJpbGl0eU1lc3NhZ2VUeXBlIiwiYWJpbGl0eUhleENvZGUiLCJwcmVmaXgiLCJ0eXBlQXNIZXgiLCJ0b1N0cmluZyIsInRvVXBwZXJDYXNlIiwiZGVmYXVsdEhleENvZGUiLCJzbGljZSIsImhleENvZGUiLCJzdHIiLCJsYXN0S2V5Iiwia2V5U3RyIiwicGFyc2VGaWVsZCIsIm1pc3NpbmdGaWVsZHMiLCJKU09OIiwic3RyaW5naWZ5IiwiZmllbGREZWZhdWx0IiwiZGVmYXVsdEZpZWxkVmFsdWUiLCJmaWVsZFZhbHVlIiwicmVwZWF0aW5nRmllbGRzU2VwYXJhdG9yIiwicmVwZWF0aW5nQXJyYXkiLCJsZWZ0IiwicmlnaHQiLCJ0b0xvd2VyQ2FzZSIsImxvY2FsZUNvbXBhcmUiLCJ3YXJuIiwibGVmdFZhbHVlIiwicmlnaHRWYWx1ZSIsImFub25SZXBzIiwiZm9yRWFjaCIsInBvc3NpYmxlS2V5IiwicmVwIiwiZmluZCIsImZpZWxkUmVnZXgiLCJ2YWwiLCJzb21lIiwidiIsIm1heWJlQ2FwdHVyZSIsInBhcnNlIiwiYnVpbGRSZWdleCIsImxvZ1ZlcnNpb24iLCJzdGFydHNVc2luZyIsImFiaWxpdHlGdWxsIiwiaGVhZE1hcmtlciIsImFkZGVkQ29tYmF0YW50IiwiYWRkZWRDb21iYXRhbnRGdWxsIiwicmVtb3ZpbmdDb21iYXRhbnQiLCJnYWluc0VmZmVjdCIsInN0YXR1c0VmZmVjdEV4cGxpY2l0IiwibG9zZXNFZmZlY3QiLCJ0ZXRoZXIiLCJ3YXNEZWZlYXRlZCIsIm5ldHdvcmtEb1QiLCJlY2hvIiwiZ2FtZUxvZyIsImRpYWxvZyIsIm1lc3NhZ2UiLCJnYW1lTmFtZUxvZyIsInN0YXRDaGFuZ2UiLCJjaGFuZ2Vab25lIiwibmV0d29yazZkIiwibmFtZVRvZ2dsZSIsIm1hcCIsInN5c3RlbUxvZ01lc3NhZ2UiLCJtYXBFZmZlY3QiLCJmYXRlRGlyZWN0b3IiLCJjZURpcmVjdG9yIiwiaW5Db21iYXQiLCJjb21iYXRhbnRNZW1vcnkiLCJzdGFydHNVc2luZ0V4dHJhIiwiYWJpbGl0eUV4dHJhIiwiY29udGVudEZpbmRlclNldHRpbmdzIiwibnBjWWVsbCIsImJhdHRsZVRhbGsyIiwiY291bnRkb3duIiwiY291bnRkb3duQ2FuY2VsIiwiYWN0b3JNb3ZlIiwiYWN0b3JTZXRQb3MiLCJzcGF3bk5wY0V4dHJhIiwiYWN0b3JDb250cm9sRXh0cmEiLCJhY3RvckNvbnRyb2xTZWxmRXh0cmEiLCJkZWZhdWx0VmFsdWUiLCJhbnlPZiIsIm5hbWVkQ2FwdHVyZSIsImVycm9yIiwiYXJncyIsImFueU9mQXJyYXkiLCJhcnJheSIsImVsZW0iLCJSZWdFeHAiLCJqb2luIiwiZmlyc3RBcmciLCJyZWdleHBTdHJpbmciLCJrQ2FjdGJvdENhdGVnb3JpZXMiLCJUaW1lc3RhbXAiLCJOZXRUaW1lc3RhbXAiLCJOZXRGaWVsZCIsIkxvZ1R5cGUiLCJBYmlsaXR5Q29kZSIsIk9iamVjdElkIiwiTmFtZSIsIkZsb2F0IiwibW9kaWZpZXJzIiwiZ2xvYmFsIiwibXVsdGlsaW5lIiwicmVwbGFjZSIsIm1hdGNoIiwiZ3JvdXAiLCJwYXJzZUdsb2JhbCIsInJlZ2V4IiwiZiIsImZ1bmNOYW1lIiwibWFnaWNUcmFuc2xhdGlvblN0cmluZyIsIm1hZ2ljU3RyaW5nUmVnZXgiLCJrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3QiLCJrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbiIsImdhbWVMb2dDb2RlcyIsImFjdG9yQ29udHJvbFR5cGUiLCJzZXRBbmltU3RhdGUiLCJwdWJsaWNDb250ZW50VGV4dCIsImxvZ01zZyIsImxvZ01zZ1BhcmFtcyIsInRyYW5zUGFyYW1zIiwiZmlsdGVyIiwiayIsIm5lZWRzVHJhbnNsYXRpb25zIiwiTmV0UmVnZXhlcyIsImZsYWdUcmFuc2xhdGlvbnNOZWVkZWQiLCJzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkIiwiZG9lc05ldFJlZ2V4TmVlZFRyYW5zbGF0aW9uIiwiZXhlYyIsInJzdkRhdGEiLCJjb21tb25OZXRSZWdleCIsIndpcGUiLCJjYWN0Ym90V2lwZUVjaG8iLCJ1c2VyV2lwZUVjaG8iLCJidWlsZE5ldFJlZ2V4Rm9yVHJpZ2dlciIsImluaXRlZCIsIndzVXJsIiwid3MiLCJxdWV1ZSIsInJzZXFDb3VudGVyIiwicmVzcG9uc2VQcm9taXNlcyIsInN1YnNjcmliZXJzIiwic2VuZE1lc3NhZ2UiLCJtc2ciLCJjYiIsInNlbmQiLCJ3aW5kb3ciLCJPdmVybGF5UGx1Z2luQXBpIiwiY2FsbEhhbmRsZXIiLCJwcm9jZXNzRXZlbnQiLCJpbml0Iiwic3VicyIsInN1YiIsImRpc3BhdGNoT3ZlcmxheUV2ZW50IiwiYWRkT3ZlcmxheUxpc3RlbmVyIiwiZXZlbnQiLCJjYWxsIiwiZXZlbnRzIiwicmVtb3ZlT3ZlcmxheUxpc3RlbmVyIiwibGlzdCIsInBvcyIsImluZGV4T2YiLCJzcGxpY2UiLCJjYWxsT3ZlcmxheUhhbmRsZXJJbnRlcm5hbCIsIl9tc2ciLCJyc2VxIiwicCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGF0YSIsInBhcnNlZCIsImNhbGxPdmVybGF5SGFuZGxlck92ZXJyaWRlTWFwIiwiY2FsbE92ZXJsYXlIYW5kbGVyIiwiY2FsbEZ1bmMiLCJzZXRPdmVybGF5SGFuZGxlck92ZXJyaWRlIiwib3ZlcnJpZGUiLCJVUkxTZWFyY2hQYXJhbXMiLCJzZWFyY2giLCJnZXQiLCJjb25uZWN0V3MiLCJXZWJTb2NrZXQiLCJhZGRFdmVudExpc3RlbmVyIiwibG9nIiwicSIsInByb21pc2VGdW5jcyIsInNldFRpbWVvdXQiLCJ3YWl0Rm9yQXBpIiwicmVhZHkiLCJfX092ZXJsYXlDYWxsYmFjayIsIml0ZW0iLCJjdXJyZW50Wm9uZSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lclRleHQiLCJ6b25lSUQiLCJkZXRhaWwiLCJwbGF5ZXJJZCIsImN1cnJlbnRIUCIsIm1heEhQIiwiY3VycmVudE1QIiwibWF4TVAiLCJjcCIsImN1cnJlbnRDUCIsIm1heENQIiwiZ3AiLCJjdXJyZW50R1AiLCJtYXhHUCIsImRlYnVnIiwiZGVidWdKb2IiLCJqb2JJbmZvIiwiam9iRGV0YWlsIiwid2hpdGVNYW5hIiwiYmxhY2tNYW5hIiwibWFuYVN0YWNrcyIsImJlYXN0IiwiYmxvb2QiLCJkYXJrc2lkZU1pbGxpc2Vjb25kcyIsImRhcmtBcnRzIiwibGl2aW5nU2hhZG93TWlsbGlzZWNvbmRzIiwiY2FydHJpZGdlcyIsImNvbnRpbnVhdGlvblN0YXRlIiwib2F0aCIsInNvbmdOYW1lIiwibGFzdFBsYXllZCIsInNvbmdQcm9jcyIsInNvdWxHYXVnZSIsInNvbmdNaWxsaXNlY29uZHMiLCJjb2RhIiwiZmVhdGhlcnMiLCJlc3ByaXQiLCJzdGVwcyIsImN1cnJlbnRTdGVwIiwibmlua2lBbW91bnQiLCJrYXplbWF0b2kiLCJibG9vZE1pbGxpc2Vjb25kcyIsImxpZmVNaWxsaXNlY29uZHMiLCJleWVzQW1vdW50IiwiZmlyc3RtaW5kc0ZvY3VzIiwidW1icmFsU3RhY2tzIiwidW1icmFsTWlsbGlzZWNvbmRzIiwidW1icmFsSGVhcnRzIiwicG9seWdsb3QiLCJlbm9jaGlhbiIsIm5leHRQb2x5Z2xvdE1pbGxpc2Vjb25kcyIsInBhcmFkb3giLCJhc3RyYWxTb3VsU3RhY2tzIiwibGlseVN0YWNrcyIsImxpbHlNaWxsaXNlY29uZHMiLCJibG9vZGxpbHlTdGFja3MiLCJhZXRoZXJmbG93U3RhY2tzIiwidHJhbmNlTWlsbGlzZWNvbmRzIiwiYXR0dW5lbWVudCIsImF0dHVuZW1lbnRNaWxsaXNlY29uZHMiLCJhY3RpdmVQcmltYWwiLCJ1c2FibGVBcmNhbnVtIiwibmV4dFN1bW1vbmVkIiwic3VtbW9uU3RhdHVzIiwiZmFpcnlHYXVnZSIsImZhaXJ5U3RhdHVzIiwiZmFpcnlNaWxsaXNlY29uZHMiLCJjYXJkMSIsImNhcmQyIiwiY2FyZDMiLCJjYXJkNCIsIm5leHRkcmF3IiwiY2hha3JhU3RhY2tzIiwibHVuYXJOYWRpIiwic29sYXJOYWRpIiwiYmVhc3RDaGFrcmEiLCJvcG9vcG9GdXJ5IiwicmFwdG9yRnVyeSIsImNvZXVybEZ1cnkiLCJoZWF0Iiwib3ZlcmhlYXRNaWxsaXNlY29uZHMiLCJiYXR0ZXJ5IiwiYmF0dGVyeU1pbGxpc2Vjb25kcyIsImxhc3RCYXR0ZXJ5QW1vdW50Iiwib3ZlcmhlYXRBY3RpdmUiLCJyb2JvdEFjdGl2ZSIsImtlbmtpIiwibWVkaXRhdGlvblN0YWNrcyIsInNldHN1IiwiZ2V0c3UiLCJrYSIsImFkZGVyc2dhbGwiLCJhZGRlcnNnYWxsTWlsbGlzZWNvbmRzIiwiYWRkZXJzdGluZyIsImV1a3Jhc2lhIiwic291bCIsInNocm91ZCIsImVuc2hyb3VkTWlsbGlzZWNvbmRzIiwibGVtdXJlU2hyb3VkIiwidm9pZFNocm91ZCIsInJhdHRsaW5nQ29pbFN0YWNrcyIsImFuZ3VpbmVUcmlidXRlIiwic2VycGVudE9mZmVyaW5nIiwiYWR2YW5jZWRDb21ibyIsInJlYXdha2VuZWRUaW1lciIsInBhbGV0dGVHYXVnZSIsInBhaW50IiwiY3JlYXR1cmVNb3RpZiIsIndlYXBvbk1vdGlmIiwibGFuZHNjYXBlTW90aWYiLCJkZXBpY3Rpb25zIiwibW9vZ2xlUG9ydHJhaXQiLCJtYWRlZW5Qb3J0cmFpdCIsInRvRml4ZWQiLCJyb3RhdGlvbiIsIlRhcmdldCIsInRpZCIsIklEIiwidGRpc3RhbmNlIiwiRGlzdGFuY2UiLCJfZSIsInR0c0VjaG9SZWdleCIsInJhd0xpbmUiLCJncm91cHMiLCJjb2xvbiIsInRleHQiLCJmaWxlIl0sInNvdXJjZVJvb3QiOiIifQ==