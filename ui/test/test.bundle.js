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
    // @TODO: Set this back to `undefined` after KR/CN have access to the new fields
    firstOptionalField: 47,
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
    // @TODO: Set this back to `undefined` after KR/CN have access to the new fields
    firstOptionalField: 47,
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
      heading: 9
    },
    blankFields: [6],
    playerIds: {
      2: null
    },
    canAnonymize: true,
    firstOptionalField: undefined
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFdBQVcsRUFBRSxXQUFXO0lBQ3hCQyxNQUFNLEVBQUU7TUFDTkosSUFBSSxFQUFFLENBQUM7TUFDUEssU0FBUyxFQUFFLENBQUM7TUFDWm1DLFVBQVUsRUFBRSxDQUFDO01BQ2JDLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRDdDLFNBQVMsRUFBRTtNQUNULENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElB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ZGVmcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25vdF9yZWFjaGVkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvcmVnZXhlcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGkudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3Rlc3QvdGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbHVnaW5Db21iYXRhbnRTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2V2ZW50JztcclxuaW1wb3J0IHsgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvbjxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIC8vIFRoZSBsb2cgbGluZSBpZCwgYXMgYSBkZWNpbWFsIHN0cmluZywgbWluaW11bSB0d28gY2hhcmFjdGVycy5cclxuICB0eXBlOiBMb2dEZWZpbml0aW9uc1tLXVsndHlwZSddO1xyXG4gIC8vIFRoZSBpbmZvcm1hbCBuYW1lIG9mIHRoaXMgbG9nIGxpbmUgKG11c3QgbWF0Y2ggdGhlIGtleSB0aGF0IHRoZSBMb2dEZWZpbml0aW9uIGlzIGEgdmFsdWUgZm9yKS5cclxuICBuYW1lOiBLO1xyXG4gIC8vIFRoZSBwbHVnaW4gdGhhdCBnZW5lcmF0ZXMgdGhpcyBsb2cgbGluZS5cclxuICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyB8ICdPdmVybGF5UGx1Z2luJztcclxuICAvLyBQYXJzZWQgQUNUIGxvZyBsaW5lIHR5cGUuICBPdmVybGF5UGx1Z2luIGxpbmVzIHVzZSB0aGUgYHR5cGVgIGFzIGEgc3RyaW5nLlxyXG4gIG1lc3NhZ2VUeXBlOiBMb2dEZWZpbml0aW9uc1tLXVsnbWVzc2FnZVR5cGUnXTtcclxuICAvLyBJZiB0cnVlLCBhbHdheXMgaW5jbHVkZSB0aGlzIGxpbmUgd2hlbiBzcGxpdHRpbmcgbG9ncyAoZS5nLiBGRlhJViBwbHVnaW4gdmVyc2lvbikuXHJcbiAgZ2xvYmFsSW5jbHVkZT86IGJvb2xlYW47XHJcbiAgLy8gSWYgdHJ1ZSwgYWx3YXlzIGluY2x1ZGUgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhpcyBsaW5lIHdoZW4gc3BsaXR0aW5nIGxvZ3MgKGUuZy4gQ2hhbmdlWm9uZSkuXHJcbiAgbGFzdEluY2x1ZGU/OiBib29sZWFuO1xyXG4gIC8vIFRydWUgaWYgdGhlIGxpbmUgY2FuIGJlIGFub255bWl6ZWQgKGkuZS4gcmVtb3ZpbmcgcGxheWVyIGlkcyBhbmQgbmFtZXMpLlxyXG4gIGNhbkFub255bWl6ZT86IGJvb2xlYW47XHJcbiAgLy8gSWYgdHJ1ZSwgdGhpcyBsb2cgbGluZSBoYXMgbm90IGJlZW4gc2VlbiBiZWZvcmUgYW5kIG5lZWRzIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgaXNVbmtub3duPzogYm9vbGVhbjtcclxuICAvLyBGaWVsZHMgYXQgdGhpcyBpbmRleCBhbmQgYmV5b25kIGFyZSBjbGVhcmVkLCB3aGVuIGFub255bWl6aW5nLlxyXG4gIGZpcnN0VW5rbm93bkZpZWxkPzogbnVtYmVyO1xyXG4gIC8vIEEgbWFwIG9mIGFsbCBvZiB0aGUgZmllbGRzLCB1bmlxdWUgZmllbGQgbmFtZSB0byBmaWVsZCBpbmRleC5cclxuICBmaWVsZHM6IExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXTtcclxuICAvLyBGaWVsZCBpbmRpY2VzIHRoYXQgKm1heSogY29udGFpbiBSU1YgcGxhY2Vob2xkZXJzIChmb3IgZGVjb2RpbmcpXHJcbiAgcG9zc2libGVSc3ZGaWVsZHM/OiBMb2dEZWZGaWVsZElkeDxLPiB8IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbiAgLy8gRmllbGQgbmFtZXMgYW5kIHZhbHVlcyB0aGF0IGNhbiBvdmVycmlkZSBgY2FuQW5vbnltaXplYC4gU2VlIGBMb2dEZWZTdWJGaWVsZHNgIHR5cGUgYmVsb3cuXHJcbiAgc3ViRmllbGRzPzogTG9nRGVmU3ViRmllbGRzPEs+O1xyXG4gIC8vIE1hcCBvZiBmaWVsZCBpbmRpY2VzIHRvIGFub255bWl6ZSwgaW4gdGhlIGZvcm1hdDogcGxheWVySWQ6IChvcHRpb25hbCkgcGxheWVyTmFtZS5cclxuICBwbGF5ZXJJZHM/OiBQbGF5ZXJJZE1hcDxLPjtcclxuICAvLyBBIGxpc3Qgb2YgZmllbGQgaW5kaWNlcyB0aGF0IG1heSBjb250YWlucyBwbGF5ZXIgaWRzIGFuZCwgaWYgc28sIHdpbGwgYmUgYW5vbnltaXplZC5cclxuICAvLyBJZiBhbiBpbmRleCBpcyBsaXN0ZWQgaGVyZSBhbmQgaW4gYHBsYXllcklkc2AsIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBhIHBvc3NpYmxlIGlkIGZpZWxkLlxyXG4gIHBvc3NpYmxlUGxheWVySWRzPzogcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxuICAvLyBBIGxpc3Qgb2YgZmllbGQgaW5kaWNlcyB0aGF0IGFyZSBvayB0byBiZSBibGFuayAob3IgaGF2ZSBpbnZhbGlkIGlkcykuXHJcbiAgYmxhbmtGaWVsZHM/OiByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG4gIC8vIFRoaXMgZmllbGQgaW5kZXggKGFuZCBhbGwgYWZ0ZXIpIHdpbGwgYmUgdHJlYXRlZCBhcyBvcHRpb25hbCB3aGVuIGNyZWF0aW5nIGNhcHR1cmluZyByZWdleGVzLlxyXG4gIGZpcnN0T3B0aW9uYWxGaWVsZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gIC8vIFRoZXNlIGZpZWxkcyBhcmUgdHJlYXRlZCBhcyByZXBlYXRhYmxlIGZpZWxkc1xyXG4gIHJlcGVhdGluZ0ZpZWxkcz86IHtcclxuICAgIHN0YXJ0aW5nSW5kZXg6IG51bWJlcjtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBuYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgICBwcmltYXJ5S2V5OiBzdHJpbmc7XHJcbiAgICBwb3NzaWJsZUtleXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG4gICAgLy8gUmVwZWF0aW5nIGZpZWxkcyB0aGF0IHdpbGwgYmUgYW5vbnltaXplZCBpZiBwcmVzZW50LiBTYW1lIHN0cnVjdHVyZSBhcyBgcGxheWVySWRzYCxcclxuICAgIC8vIGJ1dCB1c2VzIHJlcGVhdGluZyBmaWVsZCBrZXlzIChuYW1lcykgaW4gcGxhY2Ugb2YgZmllbGQgaW5kaWNlcy4gSG93ZXZlciwgdGhlICdpZCcgZmllbGRcclxuICAgIC8vIG9mIGFuIGlkL25hbWUgcGFpciBjYW4gYmUgYSBmaXhlZCBmaWVsZCBpbmRleC4gU2VlIGBDb21iYXRhbnRNZW1vcnlgIGV4YW1wbGUuXHJcbiAgICBrZXlzVG9Bbm9ueW1pemU/OiBLIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyB7IFtpZEZpZWxkOiBzdHJpbmcgfCBudW1iZXJdOiBzdHJpbmcgfCBudWxsIH1cclxuICAgICAgOiBuZXZlcjtcclxuICB9O1xyXG4gIC8vIFNlZSBgQW5hbHlzaXNPcHRpb25zYCB0eXBlLiBPbWl0dGluZyB0aGlzIHByb3BlcnR5IG1lYW5zIG5vIGxvZyBsaW5lcyB3aWxsIGJlIGluY2x1ZGVkO1xyXG4gIC8vIGhvd2V2ZXIsIGlmIHJhaWRib3NzIHRyaWdnZXJzIGFyZSBmb3VuZCB1c2luZyB0aGlzIGxpbmUgdHlwZSwgYW4gYXV0b21hdGVkIHdvcmtmbG93IHdpbGxcclxuICAvLyBjcmVhdGUgdGhpcyBwcm9wZXJ0eSBhbmQgc2V0IGBpbmNsdWRlOiAnYWxsJ2AuIFRvIHN1cHByZXNzIHRoaXMsIHVzZSBgaW5jbHVkZTogJ25ldmVyYGAuXHJcbiAgYW5hbHlzaXNPcHRpb25zPzogQW5hbHlzaXNPcHRpb25zPEs+O1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmRmllbGRJZHg8XHJcbiAgSyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4+ID0gRXh0cmFjdDxMb2dEZWZpbml0aW9uc1tLXVsnZmllbGRzJ11ba2V5b2YgTG9nRGVmaW5pdGlvbnNbS11bJ2ZpZWxkcyddXSwgbnVtYmVyPjtcclxuXHJcbnR5cGUgUGxheWVySWRNYXA8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBbUCBpbiBMb2dEZWZGaWVsZElkeDxLPiBhcyBudW1iZXJdPzogTG9nRGVmRmllbGRJZHg8Sz4gfCBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmRmllbGROYW1lPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSBFeHRyYWN0PFxyXG4gIGtleW9mIExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXSxcclxuICBzdHJpbmdcclxuPjtcclxuXHJcbi8vIFNwZWNpZmllcyBhIGZpZWxkTmFtZSBrZXkgd2l0aCBvbmUgb3IgbW9yZSBwb3NzaWJsZSB2YWx1ZXMgYW5kIGEgYGNhbkFub255aXplYCBvdmVycmlkZVxyXG4vLyBpZiB0aGF0IGZpZWxkIGFuZCB2YWx1ZSBhcmUgcHJlc2VudCBvbiB0aGUgbG9nIGxpbmUuIFNlZSAnR2FtZUxvZycgZm9yIGFuIGV4YW1wbGUuXHJcbnR5cGUgTG9nRGVmU3ViRmllbGRzPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgW1AgaW4gTG9nRGVmRmllbGROYW1lPEs+XT86IHtcclxuICAgIFtmaWVsZFZhbHVlOiBzdHJpbmddOiB7XHJcbiAgICAgIG5hbWU6IHN0cmluZztcclxuICAgICAgY2FuQW5vbnltaXplOiBib29sZWFuO1xyXG4gICAgfTtcclxuICB9O1xyXG59O1xyXG5cclxuLy8gT3B0aW9ucyBmb3IgaW5jbHVkaW5nIHRoZXNlIGxpbmVzIGluIGEgZmlsdGVyZWQgbG9nIHZpYSB0aGUgbG9nIHNwbGl0dGVyJ3MgYW5hbHlzaXMgb3B0aW9uLlxyXG4vLyBgaW5jbHVkZTpgIHNwZWNpZmllcyB0aGUgbGV2ZWwgb2YgaW5jbHVzaW9uOlxyXG4vLyAgIC0gJ2FsbCcgd2lsbCBpbmNsdWRlIGFsbCBsaW5lcyB3aXRoIG5vIGZpbHRlcmluZy5cclxuLy8gICAtICdmaWx0ZXInIHdpbGwgaW5jbHVkZSBvbmx5IHRob3NlIGxpbmVzIHRoYXQgbWF0Y2ggYXQgbGVhc3Qgb25lIG9mIHRoZSBzcGVjaWZpZWQgYGZpbHRlcnNgLlxyXG4vLyAgIC0gJ25ldmVyJyBpcyBhbiBvdmVycmlkZTsganVzdCBsaWtlIGlmIHRoZSBwcm9wZXJ0eSB3ZXJlIG9taXR0ZWQsIG5vIGxvZyBsaW5lcyB3aWxsIGJlIGluY2x1ZGVkXHJcbi8vICAgICAgaW4gdGhlIGZpbHRlcjsgaG93ZXZlciwgaWYgJ25ldmVyJyBpcyB1c2VkLCB0aGUgYXV0b21hdGVkIHdvcmtmbG93IHdpbGwgbm90IGF0dGVtcHQgdG9cclxuLy8gICAgICBjaGFuZ2UgaXQgdG8gJ2FsbCcgdXBvbiBmaW5kaW5nIGFjdGl2ZSB0cmlnZ2VycyB1c2luZyB0aGlzIGxpbmUgdHlwZS5cclxuLy8gYGZpbHRlcnM6YCBjb250YWlucyBOZXRyZWdleC1zdHlsZSBmaWx0ZXIgY3JpdGVyaWEuIExpbmVzIHNhdGlzZnlpbmcgYXQgbGVhc3Qgb25lIGZpbHRlciB3aWxsIGJlXHJcbi8vICAgaW5jbHVkZWQuIElmIGBpbmNsdWRlOmAgPSAnZmlsdGVyJywgYGZpbHRlcnNgIG11c3QgYmUgcHJlc2VudDsgb3RoZXJ3aXNlLCBpdCBtdXN0IGJlIG9taXR0ZWQuXHJcbi8vIGBjb21iYXRhbnRJZEZpZWxkczpgIGFyZSBmaWVsZCBpbmRpY2VzIGNvbnRhaW5pbmcgY29tYmF0YW50SWRzLiBJZiBzcGVjaWZpZWQsIHRoZXNlIGZpZWxkc1xyXG4vLyAgIHdpbGwgYmUgY2hlY2tlZCBmb3IgaWdub3JlZCBjb21iYXRhbnRzIChlLmcuIHBldHMpIGR1cmluZyBsb2cgZmlsdGVyaW5nLlxyXG5leHBvcnQgdHlwZSBBbmFseXNpc09wdGlvbnM8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBpbmNsdWRlOiAnbmV2ZXInO1xyXG4gIGZpbHRlcnM/OiB1bmRlZmluZWQ7XHJcbiAgY29tYmF0YW50SWRGaWVsZHM/OiB1bmRlZmluZWQ7XHJcbn0gfCB7XHJcbiAgaW5jbHVkZTogJ2ZpbHRlcic7XHJcbiAgZmlsdGVyczogTmV0UGFyYW1zW0tdIHwgcmVhZG9ubHkgTmV0UGFyYW1zW0tdW107XHJcbiAgY29tYmF0YW50SWRGaWVsZHM/OiBMb2dEZWZGaWVsZElkeDxLPiB8IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbn0gfCB7XHJcbiAgaW5jbHVkZTogJ2FsbCc7XHJcbiAgZmlsdGVycz86IHVuZGVmaW5lZDtcclxuICBjb21iYXRhbnRJZEZpZWxkcz86IExvZ0RlZkZpZWxkSWR4PEs+IHwgcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxufTtcclxuXHJcbi8vIFRPRE86IE1heWJlIGJyaW5nIGluIGEgaGVscGVyIGxpYnJhcnkgdGhhdCBjYW4gY29tcGlsZS10aW1lIGV4dHJhY3QgdGhlc2Uga2V5cyBpbnN0ZWFkP1xyXG5jb25zdCBjb21iYXRhbnRNZW1vcnlLZXlzOiByZWFkb25seSAoRXh0cmFjdDxrZXlvZiBQbHVnaW5Db21iYXRhbnRTdGF0ZSwgc3RyaW5nPilbXSA9IFtcclxuICAnQ3VycmVudFdvcmxkSUQnLFxyXG4gICdXb3JsZElEJyxcclxuICAnV29ybGROYW1lJyxcclxuICAnQk5wY0lEJyxcclxuICAnQk5wY05hbWVJRCcsXHJcbiAgJ1BhcnR5VHlwZScsXHJcbiAgJ0lEJyxcclxuICAnT3duZXJJRCcsXHJcbiAgJ1dlYXBvbklkJyxcclxuICAnVHlwZScsXHJcbiAgJ0pvYicsXHJcbiAgJ0xldmVsJyxcclxuICAnTmFtZScsXHJcbiAgJ0N1cnJlbnRIUCcsXHJcbiAgJ01heEhQJyxcclxuICAnQ3VycmVudE1QJyxcclxuICAnTWF4TVAnLFxyXG4gICdQb3NYJyxcclxuICAnUG9zWScsXHJcbiAgJ1Bvc1onLFxyXG4gICdIZWFkaW5nJyxcclxuICAnTW9uc3RlclR5cGUnLFxyXG4gICdTdGF0dXMnLFxyXG4gICdNb2RlbFN0YXR1cycsXHJcbiAgJ0FnZ3Jlc3Npb25TdGF0dXMnLFxyXG4gICdUYXJnZXRJRCcsXHJcbiAgJ0lzVGFyZ2V0YWJsZScsXHJcbiAgJ1JhZGl1cycsXHJcbiAgJ0Rpc3RhbmNlJyxcclxuICAnRWZmZWN0aXZlRGlzdGFuY2UnLFxyXG4gICdOUENUYXJnZXRJRCcsXHJcbiAgJ0N1cnJlbnRHUCcsXHJcbiAgJ01heEdQJyxcclxuICAnQ3VycmVudENQJyxcclxuICAnTWF4Q1AnLFxyXG4gICdQQ1RhcmdldElEJyxcclxuICAnSXNDYXN0aW5nMScsXHJcbiAgJ0lzQ2FzdGluZzInLFxyXG4gICdDYXN0QnVmZklEJyxcclxuICAnQ2FzdFRhcmdldElEJyxcclxuICAnQ2FzdEdyb3VuZFRhcmdldFgnLFxyXG4gICdDYXN0R3JvdW5kVGFyZ2V0WScsXHJcbiAgJ0Nhc3RHcm91bmRUYXJnZXRaJyxcclxuICAnQ2FzdER1cmF0aW9uQ3VycmVudCcsXHJcbiAgJ0Nhc3REdXJhdGlvbk1heCcsXHJcbiAgJ1RyYW5zZm9ybWF0aW9uSWQnLFxyXG5dIGFzIGNvbnN0O1xyXG5cclxuY29uc3QgbGF0ZXN0TG9nRGVmaW5pdGlvbnMgPSB7XHJcbiAgR2FtZUxvZzoge1xyXG4gICAgdHlwZTogJzAwJyxcclxuICAgIG5hbWU6ICdHYW1lTG9nJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGF0TG9nJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGNvZGU6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGxpbmU6IDQsXHJcbiAgICB9LFxyXG4gICAgc3ViRmllbGRzOiB7XHJcbiAgICAgIGNvZGU6IHtcclxuICAgICAgICAnMDAzOSc6IHtcclxuICAgICAgICAgIG5hbWU6ICdtZXNzYWdlJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcwMDM4Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ2VjaG8nLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJzAwNDQnOiB7XHJcbiAgICAgICAgICBuYW1lOiAnZGlhbG9nJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcwODM5Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ21lc3NhZ2UnLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgY29kZTogWycwMDQ0JywgJzA4MzknXSB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENoYW5nZVpvbmU6IHtcclxuICAgIHR5cGU6ICcwMScsXHJcbiAgICBuYW1lOiAnQ2hhbmdlWm9uZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVGVycml0b3J5JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgfSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ2hhbmdlZFBsYXllcjoge1xyXG4gICAgdHlwZTogJzAyJyxcclxuICAgIG5hbWU6ICdDaGFuZ2VkUGxheWVyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGFuZ2VQcmltYXJ5UGxheWVyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBBZGRlZENvbWJhdGFudDoge1xyXG4gICAgdHlwZTogJzAzJyxcclxuICAgIG5hbWU6ICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQWRkQ29tYmF0YW50JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBqb2I6IDQsXHJcbiAgICAgIGxldmVsOiA1LFxyXG4gICAgICBvd25lcklkOiA2LFxyXG4gICAgICB3b3JsZElkOiA3LFxyXG4gICAgICB3b3JsZDogOCxcclxuICAgICAgbnBjTmFtZUlkOiA5LFxyXG4gICAgICBucGNCYXNlSWQ6IDEwLFxyXG4gICAgICBjdXJyZW50SHA6IDExLFxyXG4gICAgICBocDogMTIsXHJcbiAgICAgIGN1cnJlbnRNcDogMTMsXHJcbiAgICAgIG1wOiAxNCxcclxuICAgICAgLy8gbWF4VHA6IDE1LFxyXG4gICAgICAvLyB0cDogMTYsXHJcbiAgICAgIHg6IDE3LFxyXG4gICAgICB5OiAxOCxcclxuICAgICAgejogMTksXHJcbiAgICAgIGhlYWRpbmc6IDIwLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IGlkOiAnNC57N30nIH0sIC8vIE5QQyBjb21iYXRhbnRzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgUmVtb3ZlZENvbWJhdGFudDoge1xyXG4gICAgdHlwZTogJzA0JyxcclxuICAgIG5hbWU6ICdSZW1vdmVkQ29tYmF0YW50JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdSZW1vdmVDb21iYXRhbnQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGpvYjogNCxcclxuICAgICAgbGV2ZWw6IDUsXHJcbiAgICAgIG93bmVyOiA2LFxyXG4gICAgICB3b3JsZDogOCxcclxuICAgICAgbnBjTmFtZUlkOiA5LFxyXG4gICAgICBucGNCYXNlSWQ6IDEwLFxyXG4gICAgICBjdXJyZW50SHA6IDExLFxyXG4gICAgICBocDogMTIsXHJcbiAgICAgIGN1cnJlbnRNcDogMTMsXHJcbiAgICAgIG1wOiAxNCxcclxuICAgICAgLy8gY3VycmVudFRwOiAxNSxcclxuICAgICAgLy8gbWF4VHA6IDE2LFxyXG4gICAgICB4OiAxNyxcclxuICAgICAgeTogMTgsXHJcbiAgICAgIHo6IDE5LFxyXG4gICAgICBoZWFkaW5nOiAyMCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBpZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFBhcnR5TGlzdDoge1xyXG4gICAgdHlwZTogJzExJyxcclxuICAgIG5hbWU6ICdQYXJ0eUxpc3QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1BhcnR5TGlzdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBwYXJ0eUNvdW50OiAyLFxyXG4gICAgICBpZDA6IDMsXHJcbiAgICAgIGlkMTogNCxcclxuICAgICAgaWQyOiA1LFxyXG4gICAgICBpZDM6IDYsXHJcbiAgICAgIGlkNDogNyxcclxuICAgICAgaWQ1OiA4LFxyXG4gICAgICBpZDY6IDksXHJcbiAgICAgIGlkNzogMTAsXHJcbiAgICAgIGlkODogMTEsXHJcbiAgICAgIGlkOTogMTIsXHJcbiAgICAgIGlkMTA6IDEzLFxyXG4gICAgICBpZDExOiAxNCxcclxuICAgICAgaWQxMjogMTUsXHJcbiAgICAgIGlkMTM6IDE2LFxyXG4gICAgICBpZDE0OiAxNyxcclxuICAgICAgaWQxNTogMTgsXHJcbiAgICAgIGlkMTY6IDE5LFxyXG4gICAgICBpZDE3OiAyMCxcclxuICAgICAgaWQxODogMjEsXHJcbiAgICAgIGlkMTk6IDIyLFxyXG4gICAgICBpZDIwOiAyMyxcclxuICAgICAgaWQyMTogMjQsXHJcbiAgICAgIGlkMjI6IDI1LFxyXG4gICAgICBpZDIzOiAyNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMzogbnVsbCxcclxuICAgICAgNDogbnVsbCxcclxuICAgICAgNTogbnVsbCxcclxuICAgICAgNjogbnVsbCxcclxuICAgICAgNzogbnVsbCxcclxuICAgICAgODogbnVsbCxcclxuICAgICAgOTogbnVsbCxcclxuICAgICAgMTA6IG51bGwsXHJcbiAgICAgIDExOiBudWxsLFxyXG4gICAgICAxMjogbnVsbCxcclxuICAgICAgMTM6IG51bGwsXHJcbiAgICAgIDE0OiBudWxsLFxyXG4gICAgICAxNTogbnVsbCxcclxuICAgICAgMTY6IG51bGwsXHJcbiAgICAgIDE3OiBudWxsLFxyXG4gICAgICAxODogbnVsbCxcclxuICAgICAgMTk6IG51bGwsXHJcbiAgICAgIDIwOiBudWxsLFxyXG4gICAgICAyMTogbnVsbCxcclxuICAgICAgMjI6IG51bGwsXHJcbiAgICAgIDIzOiBudWxsLFxyXG4gICAgICAyNDogbnVsbCxcclxuICAgICAgMjU6IG51bGwsXHJcbiAgICAgIDI2OiBudWxsLFxyXG4gICAgfSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogMyxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gIH0sXHJcbiAgUGxheWVyU3RhdHM6IHtcclxuICAgIHR5cGU6ICcxMicsXHJcbiAgICBuYW1lOiAnUGxheWVyU3RhdHMnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1BsYXllclN0YXRzJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGpvYjogMixcclxuICAgICAgc3RyZW5ndGg6IDMsXHJcbiAgICAgIGRleHRlcml0eTogNCxcclxuICAgICAgdml0YWxpdHk6IDUsXHJcbiAgICAgIGludGVsbGlnZW5jZTogNixcclxuICAgICAgbWluZDogNyxcclxuICAgICAgcGlldHk6IDgsXHJcbiAgICAgIGF0dGFja1Bvd2VyOiA5LFxyXG4gICAgICBkaXJlY3RIaXQ6IDEwLFxyXG4gICAgICBjcml0aWNhbEhpdDogMTEsXHJcbiAgICAgIGF0dGFja01hZ2ljUG90ZW5jeTogMTIsXHJcbiAgICAgIGhlYWxNYWdpY1BvdGVuY3k6IDEzLFxyXG4gICAgICBkZXRlcm1pbmF0aW9uOiAxNCxcclxuICAgICAgc2tpbGxTcGVlZDogMTUsXHJcbiAgICAgIHNwZWxsU3BlZWQ6IDE2LFxyXG4gICAgICB0ZW5hY2l0eTogMTgsXHJcbiAgICAgIGxvY2FsQ29udGVudElkOiAxOSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgU3RhcnRzVXNpbmc6IHtcclxuICAgIHR5cGU6ICcyMCcsXHJcbiAgICBuYW1lOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXJ0c0Nhc3RpbmcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIGFiaWxpdHk6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXQ6IDcsXHJcbiAgICAgIGNhc3RUaW1lOiA4LFxyXG4gICAgICB4OiA5LFxyXG4gICAgICB5OiAxMCxcclxuICAgICAgejogMTEsXHJcbiAgICAgIGhlYWRpbmc6IDEyLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2XSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiA3LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBjYXN0cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWJpbGl0eToge1xyXG4gICAgdHlwZTogJzIxJyxcclxuICAgIG5hbWU6ICdBYmlsaXR5JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdBY3Rpb25FZmZlY3QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIGFiaWxpdHk6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXQ6IDcsXHJcbiAgICAgIGZsYWdzOiA4LFxyXG4gICAgICBkYW1hZ2U6IDksXHJcbiAgICAgIHRhcmdldEN1cnJlbnRIcDogMjQsXHJcbiAgICAgIHRhcmdldE1heEhwOiAyNSxcclxuICAgICAgdGFyZ2V0Q3VycmVudE1wOiAyNixcclxuICAgICAgdGFyZ2V0TWF4TXA6IDI3LFxyXG4gICAgICAvLyB0YXJnZXRDdXJyZW50VHA6IDI4LFxyXG4gICAgICAvLyB0YXJnZXRNYXhUcDogMjksXHJcbiAgICAgIHRhcmdldFg6IDMwLFxyXG4gICAgICB0YXJnZXRZOiAzMSxcclxuICAgICAgdGFyZ2V0WjogMzIsXHJcbiAgICAgIHRhcmdldEhlYWRpbmc6IDMzLFxyXG4gICAgICBjdXJyZW50SHA6IDM0LFxyXG4gICAgICBtYXhIcDogMzUsXHJcbiAgICAgIGN1cnJlbnRNcDogMzYsXHJcbiAgICAgIG1heE1wOiAzNyxcclxuICAgICAgLy8gY3VycmVudFRwOiAzODtcclxuICAgICAgLy8gbWF4VHA6IDM5O1xyXG4gICAgICB4OiA0MCxcclxuICAgICAgeTogNDEsXHJcbiAgICAgIHo6IDQyLFxyXG4gICAgICBoZWFkaW5nOiA0MyxcclxuICAgICAgc2VxdWVuY2U6IDQ0LFxyXG4gICAgICB0YXJnZXRJbmRleDogNDUsXHJcbiAgICAgIHRhcmdldENvdW50OiA0NixcclxuICAgICAgb3duZXJJZDogNDcsXHJcbiAgICAgIG93bmVyTmFtZTogNDgsXHJcbiAgICAgIGVmZmVjdERpc3BsYXlUeXBlOiA0OSxcclxuICAgICAgYWN0aW9uSWQ6IDUwLFxyXG4gICAgICBhY3Rpb25BbmltYXRpb25JZDogNTEsXHJcbiAgICAgIGFuaW1hdGlvbkxvY2tUaW1lOiA1MixcclxuICAgICAgcm90YXRpb25IZXg6IDUzLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IDcsXHJcbiAgICAgIDQ3OiA0OCxcclxuICAgIH0sXHJcbiAgICBibGFua0ZpZWxkczogWzYsIDQ3LCA0OF0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAvLyBAVE9ETzogU2V0IHRoaXMgYmFjayB0byBgdW5kZWZpbmVkYCBhZnRlciBLUi9DTiBoYXZlIGFjY2VzcyB0byB0aGUgbmV3IGZpZWxkc1xyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA0NyxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgYWJpbGl0aWVzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCA2XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrQU9FQWJpbGl0eToge1xyXG4gICAgdHlwZTogJzIyJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrQU9FQWJpbGl0eScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQU9FQWN0aW9uRWZmZWN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBhYmlsaXR5OiA1LFxyXG4gICAgICB0YXJnZXRJZDogNixcclxuICAgICAgdGFyZ2V0OiA3LFxyXG4gICAgICBmbGFnczogOCxcclxuICAgICAgZGFtYWdlOiA5LFxyXG4gICAgICB0YXJnZXRDdXJyZW50SHA6IDI0LFxyXG4gICAgICB0YXJnZXRNYXhIcDogMjUsXHJcbiAgICAgIHRhcmdldEN1cnJlbnRNcDogMjYsXHJcbiAgICAgIHRhcmdldE1heE1wOiAyNyxcclxuICAgICAgLy8gdGFyZ2V0Q3VycmVudFRwOiAyOCxcclxuICAgICAgLy8gdGFyZ2V0TWF4VHA6IDI5LFxyXG4gICAgICB0YXJnZXRYOiAzMCxcclxuICAgICAgdGFyZ2V0WTogMzEsXHJcbiAgICAgIHRhcmdldFo6IDMyLFxyXG4gICAgICB0YXJnZXRIZWFkaW5nOiAzMyxcclxuICAgICAgY3VycmVudEhwOiAzNCxcclxuICAgICAgbWF4SHA6IDM1LFxyXG4gICAgICBjdXJyZW50TXA6IDM2LFxyXG4gICAgICBtYXhNcDogMzcsXHJcbiAgICAgIC8vIGN1cnJlbnRUcDogMzg7XHJcbiAgICAgIC8vIG1heFRwOiAzOTtcclxuICAgICAgeDogNDAsXHJcbiAgICAgIHk6IDQxLFxyXG4gICAgICB6OiA0MixcclxuICAgICAgaGVhZGluZzogNDMsXHJcbiAgICAgIHNlcXVlbmNlOiA0NCxcclxuICAgICAgdGFyZ2V0SW5kZXg6IDQ1LFxyXG4gICAgICB0YXJnZXRDb3VudDogNDYsXHJcbiAgICAgIG93bmVySWQ6IDQ3LFxyXG4gICAgICBvd25lck5hbWU6IDQ4LFxyXG4gICAgICBlZmZlY3REaXNwbGF5VHlwZTogNDksXHJcbiAgICAgIGFjdGlvbklkOiA1MCxcclxuICAgICAgYWN0aW9uQW5pbWF0aW9uSWQ6IDUxLFxyXG4gICAgICBhbmltYXRpb25Mb2NrVGltZTogNTIsXHJcbiAgICAgIHJvdGF0aW9uSGV4OiA1MyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogNSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiA3LFxyXG4gICAgICA0NzogNDgsXHJcbiAgICB9LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2LCA0NywgNDhdLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgLy8gQFRPRE86IFNldCB0aGlzIGJhY2sgdG8gYHVuZGVmaW5lZGAgYWZ0ZXIgS1IvQ04gaGF2ZSBhY2Nlc3MgdG8gdGhlIG5ldyBmaWVsZHNcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogNDcsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGFiaWxpdGllcyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya0NhbmNlbEFiaWxpdHk6IHtcclxuICAgIHR5cGU6ICcyMycsXHJcbiAgICBuYW1lOiAnTmV0d29ya0NhbmNlbEFiaWxpdHknLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0NhbmNlbEFjdGlvbicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgbmFtZTogNSxcclxuICAgICAgcmVhc29uOiA2LFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNvbWJhdGFudHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrRG9UOiB7XHJcbiAgICB0eXBlOiAnMjQnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtEb1QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0RvVEhvVCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgd2hpY2g6IDQsXHJcbiAgICAgIGVmZmVjdElkOiA1LFxyXG4gICAgICBkYW1hZ2U6IDYsXHJcbiAgICAgIGN1cnJlbnRIcDogNyxcclxuICAgICAgbWF4SHA6IDgsXHJcbiAgICAgIGN1cnJlbnRNcDogOSxcclxuICAgICAgbWF4TXA6IDEwLFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDExLFxyXG4gICAgICAvLyBtYXhUcDogMTIsXHJcbiAgICAgIHg6IDEzLFxyXG4gICAgICB5OiAxNCxcclxuICAgICAgejogMTUsXHJcbiAgICAgIGhlYWRpbmc6IDE2LFxyXG4gICAgICBzb3VyY2VJZDogMTcsXHJcbiAgICAgIHNvdXJjZTogMTgsXHJcbiAgICAgIC8vIEFuIGlkIG51bWJlciBsb29rdXAgaW50byB0aGUgQXR0YWNrVHlwZSB0YWJsZVxyXG4gICAgICBkYW1hZ2VUeXBlOiAxOSxcclxuICAgICAgc291cmNlQ3VycmVudEhwOiAyMCxcclxuICAgICAgc291cmNlTWF4SHA6IDIxLFxyXG4gICAgICBzb3VyY2VDdXJyZW50TXA6IDIyLFxyXG4gICAgICBzb3VyY2VNYXhNcDogMjMsXHJcbiAgICAgIC8vIHNvdXJjZUN1cnJlbnRUcDogMjQsXHJcbiAgICAgIC8vIHNvdXJjZU1heFRwOiAyNSxcclxuICAgICAgc291cmNlWDogMjYsXHJcbiAgICAgIHNvdXJjZVk6IDI3LFxyXG4gICAgICBzb3VyY2VaOiAyOCxcclxuICAgICAgc291cmNlSGVhZGluZzogMjksXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDE3OiAxOCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyAvLyBEb1Qgb24gcGxheWVyIHdpdGggdmFsaWQgZWZmZWN0SWRcclxuICAgICAgICBpZDogJzEuezd9JyxcclxuICAgICAgICB3aGljaDogJ0RvVCcsXHJcbiAgICAgICAgZWZmZWN0SWQ6ICcwKj9bMS05QS1GXVswLTlBLUZdKicsIC8vIG5vbi16ZXJvLCBub24tZW1wdHksIHBvc3NpYmx5LXBhZGRlZCB2YWx1ZVxyXG4gICAgICB9LFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDE3XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBXYXNEZWZlYXRlZDoge1xyXG4gICAgdHlwZTogJzI1JyxcclxuICAgIG5hbWU6ICdXYXNEZWZlYXRlZCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRGVhdGgnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgdGFyZ2V0SWQ6IDIsXHJcbiAgICAgIHRhcmdldDogMyxcclxuICAgICAgc291cmNlSWQ6IDQsXHJcbiAgICAgIHNvdXJjZTogNSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyB0YXJnZXRJZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLCAvLyBkb24ndCBhcHBseSB0byBzb3VyY2VJZDsgYW4gaWdub3JlZCBjb21iYXRhbnQgaXMgYSB2YWxpZCBzb3VyY2VcclxuICAgIH0sXHJcbiAgfSxcclxuICBHYWluc0VmZmVjdDoge1xyXG4gICAgdHlwZTogJzI2JyxcclxuICAgIG5hbWU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzQWRkJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGVmZmVjdElkOiAyLFxyXG4gICAgICBlZmZlY3Q6IDMsXHJcbiAgICAgIGR1cmF0aW9uOiA0LFxyXG4gICAgICBzb3VyY2VJZDogNSxcclxuICAgICAgc291cmNlOiA2LFxyXG4gICAgICB0YXJnZXRJZDogNyxcclxuICAgICAgdGFyZ2V0OiA4LFxyXG4gICAgICBjb3VudDogOSxcclxuICAgICAgdGFyZ2V0TWF4SHA6IDEwLFxyXG4gICAgICBzb3VyY2VNYXhIcDogMTEsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDMsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgNTogNixcclxuICAgICAgNzogOCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogW1xyXG4gICAgICAgIHsgLy8gZWZmZWN0IGZyb20gZW52aXJvbm1lbnQvTlBDIGFwcGxpZWQgdG8gcGxheWVyXHJcbiAgICAgICAgICBzb3VyY2VJZDogJ1tFNF0uezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnMS57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBlZmZlY3QgZnJvbSBlbnZpcm9ubWVudC9OUEMgYXBwbGllZCB0byBOUEMgKGluY2x1ZGluZyBpdHNlbGYpXHJcbiAgICAgICAgICBzb3VyY2VJZDogJ1tFNF0uezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnNC57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBrbm93biBlZmZlY3RJZHMgb2YgaW50ZXJlc3RcclxuICAgICAgICAgIGVmZmVjdElkOiBbJ0I5QScsICc4MDgnXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzUsIDddLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEhlYWRNYXJrZXI6IHtcclxuICAgIHR5cGU6ICcyNycsXHJcbiAgICBuYW1lOiAnSGVhZE1hcmtlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVGFyZ2V0SWNvbicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB0YXJnZXRJZDogMixcclxuICAgICAgdGFyZ2V0OiAzLFxyXG4gICAgICBpZDogNixcclxuICAgICAgZGF0YTA6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs3XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogNyxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya1JhaWRNYXJrZXI6IHtcclxuICAgIHR5cGU6ICcyOCcsXHJcbiAgICBuYW1lOiAnTmV0d29ya1JhaWRNYXJrZXInLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1dheW1hcmtNYXJrZXInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgb3BlcmF0aW9uOiAyLFxyXG4gICAgICB3YXltYXJrOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgbmFtZTogNSxcclxuICAgICAgeDogNixcclxuICAgICAgeTogNyxcclxuICAgICAgejogOCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgNDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5ldHdvcmtUYXJnZXRNYXJrZXI6IHtcclxuICAgIHR5cGU6ICcyOScsXHJcbiAgICBuYW1lOiAnTmV0d29ya1RhcmdldE1hcmtlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU2lnbk1hcmtlcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBvcGVyYXRpb246IDIsIC8vIEFkZCwgVXBkYXRlLCBEZWxldGVcclxuICAgICAgd2F5bWFyazogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIG5hbWU6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXROYW1lOiA3LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICA0OiA1LFxyXG4gICAgICA2OiA3LFxyXG4gICAgfSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTG9zZXNFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICczMCcsXHJcbiAgICBuYW1lOiAnTG9zZXNFZmZlY3QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXR1c1JlbW92ZScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBlZmZlY3RJZDogMixcclxuICAgICAgZWZmZWN0OiAzLFxyXG4gICAgICBzb3VyY2VJZDogNSxcclxuICAgICAgc291cmNlOiA2LFxyXG4gICAgICB0YXJnZXRJZDogNyxcclxuICAgICAgdGFyZ2V0OiA4LFxyXG4gICAgICBjb3VudDogOSxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogMyxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICA1OiA2LFxyXG4gICAgICA3OiA4LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiBbXHJcbiAgICAgICAgeyAvLyBlZmZlY3QgZnJvbSBlbnZpcm9ubWVudC9OUEMgYXBwbGllZCB0byBwbGF5ZXJcclxuICAgICAgICAgIHNvdXJjZUlkOiAnW0U0XS57N30nLFxyXG4gICAgICAgICAgdGFyZ2V0SWQ6ICcxLns3fScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIGVmZmVjdCBmcm9tIGVudmlyb25tZW50L05QQyBhcHBsaWVkIHRvIE5QQyAoaW5jbHVkaW5nIGl0c2VsZilcclxuICAgICAgICAgIHNvdXJjZUlkOiAnW0U0XS57N30nLFxyXG4gICAgICAgICAgdGFyZ2V0SWQ6ICc0Lns3fScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIGtub3duIGVmZmVjdElkcyBvZiBpbnRlcmVzdFxyXG4gICAgICAgICAgZWZmZWN0SWQ6IFsnQjlBJywgJzgwOCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbNSwgN10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya0dhdWdlOiB7XHJcbiAgICB0eXBlOiAnMzEnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtHYXVnZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnR2F1Z2UnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGRhdGEwOiAzLFxyXG4gICAgICBkYXRhMTogNCxcclxuICAgICAgZGF0YTI6IDUsXHJcbiAgICAgIGRhdGEzOiA2LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIC8vIFNvbWV0aW1lcyB0aGlzIGxhc3QgZmllbGQgbG9va3MgbGlrZSBhIHBsYXllciBpZC5cclxuICAgIC8vIEZvciBzYWZldHksIGFub255bWl6ZSBhbGwgb2YgdGhlIGdhdWdlIGRhdGEuXHJcbiAgICBmaXJzdFVua25vd25GaWVsZDogMyxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTmV0d29ya1dvcmxkOiB7XHJcbiAgICB0eXBlOiAnMzInLFxyXG4gICAgbmFtZTogJ05ldHdvcmtXb3JsZCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnV29ybGQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBpc1Vua25vd246IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIEFjdG9yQ29udHJvbDoge1xyXG4gICAgdHlwZTogJzMzJyxcclxuICAgIG5hbWU6ICdBY3RvckNvbnRyb2wnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0RpcmVjdG9yJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBjb21tYW5kOiAzLFxyXG4gICAgICBkYXRhMDogNCxcclxuICAgICAgZGF0YTE6IDUsXHJcbiAgICAgIGRhdGEyOiA2LFxyXG4gICAgICBkYXRhMzogNyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVBsYXllcklkczogWzQsIDUsIDYsIDddLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBOYW1lVG9nZ2xlOiB7XHJcbiAgICB0eXBlOiAnMzQnLFxyXG4gICAgbmFtZTogJ05hbWVUb2dnbGUnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ05hbWVUb2dnbGUnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIHRhcmdldElkOiA0LFxyXG4gICAgICB0YXJnZXROYW1lOiA1LFxyXG4gICAgICB0b2dnbGU6IDYsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDQ6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBUZXRoZXI6IHtcclxuICAgIHR5cGU6ICczNScsXHJcbiAgICBuYW1lOiAnVGV0aGVyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdUZXRoZXInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgdGFyZ2V0SWQ6IDQsXHJcbiAgICAgIHRhcmdldDogNSxcclxuICAgICAgaWQ6IDgsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDQ6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDksXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCA0XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBMaW1pdEJyZWFrOiB7XHJcbiAgICB0eXBlOiAnMzYnLFxyXG4gICAgbmFtZTogJ0xpbWl0QnJlYWsnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0xpbWl0QnJlYWsnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgdmFsdWVIZXg6IDIsXHJcbiAgICAgIGJhcnM6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBOZXR3b3JrRWZmZWN0UmVzdWx0OiB7XHJcbiAgICB0eXBlOiAnMzcnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtFZmZlY3RSZXN1bHQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0VmZmVjdFJlc3VsdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgc2VxdWVuY2VJZDogNCxcclxuICAgICAgY3VycmVudEhwOiA1LFxyXG4gICAgICBtYXhIcDogNixcclxuICAgICAgY3VycmVudE1wOiA3LFxyXG4gICAgICBtYXhNcDogOCxcclxuICAgICAgY3VycmVudFNoaWVsZDogOSxcclxuICAgICAgLy8gRmllbGQgaW5kZXggMTAgaXMgYWx3YXlzIGAwYFxyXG4gICAgICB4OiAxMSxcclxuICAgICAgeTogMTIsXHJcbiAgICAgIHo6IDEzLFxyXG4gICAgICBoZWFkaW5nOiAxNCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBmaXJzdFVua25vd25GaWVsZDogMjIsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFN0YXR1c0VmZmVjdDoge1xyXG4gICAgdHlwZTogJzM4JyxcclxuICAgIG5hbWU6ICdTdGF0dXNFZmZlY3QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXR1c0xpc3QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgdGFyZ2V0SWQ6IDIsXHJcbiAgICAgIHRhcmdldDogMyxcclxuICAgICAgam9iTGV2ZWxEYXRhOiA0LFxyXG4gICAgICBocDogNSxcclxuICAgICAgbWF4SHA6IDYsXHJcbiAgICAgIG1wOiA3LFxyXG4gICAgICBtYXhNcDogOCxcclxuICAgICAgY3VycmVudFNoaWVsZDogOSxcclxuICAgICAgLy8gRmllbGQgaW5kZXggMTAgaXMgYWx3YXlzIGAwYFxyXG4gICAgICB4OiAxMSxcclxuICAgICAgeTogMTIsXHJcbiAgICAgIHo6IDEzLFxyXG4gICAgICBoZWFkaW5nOiAxNCxcclxuICAgICAgZGF0YTA6IDE1LFxyXG4gICAgICBkYXRhMTogMTYsXHJcbiAgICAgIGRhdGEyOiAxNyxcclxuICAgICAgZGF0YTM6IDE4LFxyXG4gICAgICBkYXRhNDogMTksXHJcbiAgICAgIGRhdGE1OiAyMCxcclxuICAgICAgLy8gVmFyaWFibGUgbnVtYmVyIG9mIHRyaXBsZXRzIGhlcmUsIGJ1dCBhdCBsZWFzdCBvbmUuXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDE4LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiAxOCxcclxuICB9LFxyXG4gIE5ldHdvcmtVcGRhdGVIUDoge1xyXG4gICAgdHlwZTogJzM5JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrVXBkYXRlSFAnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1VwZGF0ZUhwJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBjdXJyZW50SHA6IDQsXHJcbiAgICAgIG1heEhwOiA1LFxyXG4gICAgICBjdXJyZW50TXA6IDYsXHJcbiAgICAgIG1heE1wOiA3LFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDgsXHJcbiAgICAgIC8vIG1heFRwOiA5LFxyXG4gICAgICB4OiAxMCxcclxuICAgICAgeTogMTEsXHJcbiAgICAgIHo6IDEyLFxyXG4gICAgICBoZWFkaW5nOiAxMyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE1hcDoge1xyXG4gICAgdHlwZTogJzQwJyxcclxuICAgIG5hbWU6ICdNYXAnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0NoYW5nZU1hcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgcmVnaW9uTmFtZTogMyxcclxuICAgICAgcGxhY2VOYW1lOiA0LFxyXG4gICAgICBwbGFjZU5hbWVTdWI6IDUsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTeXN0ZW1Mb2dNZXNzYWdlOiB7XHJcbiAgICB0eXBlOiAnNDEnLFxyXG4gICAgbmFtZTogJ1N5c3RlbUxvZ01lc3NhZ2UnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N5c3RlbUxvZ01lc3NhZ2UnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaW5zdGFuY2U6IDIsXHJcbiAgICAgIGlkOiAzLFxyXG4gICAgICBwYXJhbTA6IDQsXHJcbiAgICAgIHBhcmFtMTogNSxcclxuICAgICAgcGFyYW0yOiA2LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFN0YXR1c0xpc3QzOiB7XHJcbiAgICB0eXBlOiAnNDInLFxyXG4gICAgbmFtZTogJ1N0YXR1c0xpc3QzJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGF0dXNMaXN0MycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgLy8gdHJpcGxldHMgb2YgZmllbGRzIGZyb20gaGVyZSAoZWZmZWN0SWQsIGRhdGEsIHBsYXllcklkKT9cclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDQsXHJcbiAgICBmaXJzdFVua25vd25GaWVsZDogNCxcclxuICB9LFxyXG4gIFBhcnNlckluZm86IHtcclxuICAgIHR5cGU6ICcyNDknLFxyXG4gICAgbmFtZTogJ1BhcnNlckluZm8nLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1NldHRpbmdzJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgZ2xvYmFsSW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgUHJvY2Vzc0luZm86IHtcclxuICAgIHR5cGU6ICcyNTAnLFxyXG4gICAgbmFtZTogJ1Byb2Nlc3NJbmZvJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdQcm9jZXNzJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgZ2xvYmFsSW5jbHVkZTogdHJ1ZSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgRGVidWc6IHtcclxuICAgIHR5cGU6ICcyNTEnLFxyXG4gICAgbmFtZTogJ0RlYnVnJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdEZWJ1ZycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IGZhbHNlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBQYWNrZXREdW1wOiB7XHJcbiAgICB0eXBlOiAnMjUyJyxcclxuICAgIG5hbWU6ICdQYWNrZXREdW1wJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdQYWNrZXREdW1wJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiBmYWxzZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgVmVyc2lvbjoge1xyXG4gICAgdHlwZTogJzI1MycsXHJcbiAgICBuYW1lOiAnVmVyc2lvbicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVmVyc2lvbicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIEVycm9yOiB7XHJcbiAgICB0eXBlOiAnMjU0JyxcclxuICAgIG5hbWU6ICdFcnJvcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRXJyb3InLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IGZhbHNlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBOb25lOiB7XHJcbiAgICB0eXBlOiAnWzAtOV0rJyxcclxuICAgIG5hbWU6ICdOb25lJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdOb25lJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgaXNVbmtub3duOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICAvLyBPdmVybGF5UGx1Z2luIGxvZyBsaW5lc1xyXG4gIExpbmVSZWdpc3RyYXRpb246IHtcclxuICAgIHR5cGU6ICcyNTYnLFxyXG4gICAgbmFtZTogJ0xpbmVSZWdpc3RyYXRpb24nLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI1NicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBuYW1lOiA0LFxyXG4gICAgICB2ZXJzaW9uOiA1LFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE1hcEVmZmVjdDoge1xyXG4gICAgdHlwZTogJzI1NycsXHJcbiAgICBuYW1lOiAnTWFwRWZmZWN0JyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNTcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaW5zdGFuY2U6IDIsXHJcbiAgICAgIGZsYWdzOiAzLFxyXG4gICAgICAvLyB2YWx1ZXMgZm9yIHRoZSBsb2NhdGlvbiBmaWVsZCBzZWVtIHRvIHZhcnkgYmV0d2VlbiBpbnN0YW5jZXNcclxuICAgICAgLy8gKGUuZy4gYSBsb2NhdGlvbiBvZiAnMDgnIGluIFA1UyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgdGhlIHNhbWUgbG9jYXRpb24gaW4gUDVTIGFzIGluIFA2UylcclxuICAgICAgLy8gYnV0IHRoaXMgZmllbGQgZG9lcyBhcHBlYXIgdG8gY29uc2lzdGVudGx5IGNvbnRhaW4gcG9zaXRpb24gaW5mbyBmb3IgdGhlIGVmZmVjdCByZW5kZXJpbmdcclxuICAgICAgbG9jYXRpb246IDQsXHJcbiAgICAgIGRhdGEwOiA1LFxyXG4gICAgICBkYXRhMTogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBGYXRlRGlyZWN0b3I6IHtcclxuICAgIHR5cGU6ICcyNTgnLFxyXG4gICAgbmFtZTogJ0ZhdGVEaXJlY3RvcicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU4JyxcclxuICAgIC8vIGZhdGVJZCBhbmQgcHJvZ3Jlc3MgYXJlIGluIGhleC5cclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGNhdGVnb3J5OiAyLFxyXG4gICAgICAvLyBwYWRkaW5nMDogMyxcclxuICAgICAgZmF0ZUlkOiA0LFxyXG4gICAgICBwcm9ncmVzczogNSxcclxuICAgICAgLy8gcGFyYW0zOiA2LFxyXG4gICAgICAvLyBwYXJhbTQ6IDcsXHJcbiAgICAgIC8vIHBhcmFtNTogOCxcclxuICAgICAgLy8gcGFyYW02OiA5LFxyXG4gICAgICAvLyBwYWRkaW5nMTogMTAsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBDRURpcmVjdG9yOiB7XHJcbiAgICB0eXBlOiAnMjU5JyxcclxuICAgIG5hbWU6ICdDRURpcmVjdG9yJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNTknLFxyXG4gICAgLy8gYWxsIGZpZWxkcyBhcmUgaW4gaGV4XHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBwb3BUaW1lOiAyLFxyXG4gICAgICB0aW1lUmVtYWluaW5nOiAzLFxyXG4gICAgICAvLyB1bmtub3duMDogNCxcclxuICAgICAgY2VLZXk6IDUsXHJcbiAgICAgIG51bVBsYXllcnM6IDYsXHJcbiAgICAgIHN0YXR1czogNyxcclxuICAgICAgLy8gdW5rbm93bjE6IDgsXHJcbiAgICAgIHByb2dyZXNzOiA5LFxyXG4gICAgICAvLyB1bmtub3duMjogMTAsXHJcbiAgICAgIC8vIHVua25vd24zOiAxMSxcclxuICAgICAgLy8gdW5rbm93bjQ6IDEyLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgSW5Db21iYXQ6IHtcclxuICAgIHR5cGU6ICcyNjAnLFxyXG4gICAgbmFtZTogJ0luQ29tYmF0JyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaW5BQ1RDb21iYXQ6IDIsXHJcbiAgICAgIGluR2FtZUNvbWJhdDogMyxcclxuICAgICAgaXNBQ1RDaGFuZ2VkOiA0LFxyXG4gICAgICBpc0dhbWVDaGFuZ2VkOiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENvbWJhdGFudE1lbW9yeToge1xyXG4gICAgdHlwZTogJzI2MScsXHJcbiAgICBuYW1lOiAnQ29tYmF0YW50TWVtb3J5JyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjEnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgY2hhbmdlOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgLy8gZnJvbSBoZXJlLCBwYWlycyBvZiBmaWVsZCBuYW1lL3ZhbHVlc1xyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogNSxcclxuICAgIC8vIGRvZXNuJ3QgdXNlIGBwbGF5ZXJJZHNgLCBhcyB0aGUgYGlkYCBmaWVsZCBtdXN0IGJlIGhhbmRsZWQgd2l0aCB0aGUgJ05hbWUnIHJlcGVhdGluZyBmaWVsZFxyXG4gICAgcmVwZWF0aW5nRmllbGRzOiB7XHJcbiAgICAgIHN0YXJ0aW5nSW5kZXg6IDQsXHJcbiAgICAgIGxhYmVsOiAncGFpcicsXHJcbiAgICAgIG5hbWVzOiBbJ2tleScsICd2YWx1ZSddLFxyXG4gICAgICBzb3J0S2V5czogdHJ1ZSxcclxuICAgICAgcHJpbWFyeUtleTogJ2tleScsXHJcbiAgICAgIHBvc3NpYmxlS2V5czogY29tYmF0YW50TWVtb3J5S2V5cyxcclxuICAgICAga2V5c1RvQW5vbnltaXplOiB7XHJcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHF1b3RlLXByb3BzXHJcbiAgICAgICAgMzogJ05hbWUnLCAvLyAnSUQnIHJlcGVhdGluZyBmaWVsZCBub3QgdXNlZD8gbmVlZCB0byB1c2Ugbm9uLXJlcGVhdGluZyBgaWRgICgzKSBmaWVsZFxyXG4gICAgICAgICdPd25lcklEJzogbnVsbCxcclxuICAgICAgICAnVGFyZ2V0SUQnOiBudWxsLFxyXG4gICAgICAgICdQQ1RhcmdldElEJzogbnVsbCxcclxuICAgICAgICAnTlBDVGFyZ2V0SUQnOiBudWxsLFxyXG4gICAgICAgICdDYXN0VGFyZ2V0SUQnOiBudWxsLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgLy8gVE9ETzogVGhpcyBpcyBhbiBpbml0aWFsIGF0dGVtcHQgdG8gY2FwdHVyZSBmaWVsZCBjaGFuZ2VzIHRoYXQgYXJlIHJlbGV2YW50IHRvIGFuYWx5c2lzLFxyXG4gICAgICAvLyBidXQgdGhpcyB3aWxsIGxpa2VseSBuZWVkIHRvIGJlIHJlZmluZWQgb3ZlciB0aW1lXHJcbiAgICAgIGZpbHRlcnM6IFtcclxuICAgICAgICB7IC8vIFRPRE86IE1vZGVsU3RhdHVzIGNhbiBiZSBhIGxpdHRsZSBzcGFtbXkuIFNob3VsZCB0cnkgdG8gcmVmaW5lIHRoaXMgZnVydGhlci5cclxuICAgICAgICAgIGlkOiAnNC57N30nLFxyXG4gICAgICAgICAgY2hhbmdlOiAnQ2hhbmdlJyxcclxuICAgICAgICAgIHBhaXI6IFt7IGtleTogJ01vZGVsU3RhdHVzJywgdmFsdWU6ICcuKicgfV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJzQuezd9JyxcclxuICAgICAgICAgIGNoYW5nZTogJ0NoYW5nZScsXHJcbiAgICAgICAgICBwYWlyOiBbeyBrZXk6ICdXZWFwb25JZCcsIHZhbHVlOiAnLionIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaWQ6ICc0Lns3fScsXHJcbiAgICAgICAgICBjaGFuZ2U6ICdDaGFuZ2UnLFxyXG4gICAgICAgICAgcGFpcjogW3sga2V5OiAnVHJhbnNmb3JtYXRpb25JZCcsIHZhbHVlOiAnLionIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAzLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFJTVkRhdGE6IHtcclxuICAgIHR5cGU6ICcyNjInLFxyXG4gICAgbmFtZTogJ1JTVkRhdGEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2MicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBsb2NhbGU6IDIsXHJcbiAgICAgIC8vIHVua25vd24wOiAzLFxyXG4gICAgICBrZXk6IDQsXHJcbiAgICAgIHZhbHVlOiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIC8vIFJTViBzdWJzdGl0dXRpb25zIGFyZSBwZXJmb3JtZWQgYXV0b21hdGljYWxseSBieSB0aGUgZmlsdGVyXHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3RhcnRzVXNpbmdFeHRyYToge1xyXG4gICAgdHlwZTogJzI2MycsXHJcbiAgICBuYW1lOiAnU3RhcnRzVXNpbmdFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYzJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgeDogNCxcclxuICAgICAgeTogNSxcclxuICAgICAgejogNixcclxuICAgICAgaGVhZGluZzogNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgY2FzdHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBBYmlsaXR5RXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNjQnLFxyXG4gICAgbmFtZTogJ0FiaWxpdHlFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgZ2xvYmFsRWZmZWN0Q291bnRlcjogNCxcclxuICAgICAgZGF0YUZsYWc6IDUsXHJcbiAgICAgIHg6IDYsXHJcbiAgICAgIHk6IDcsXHJcbiAgICAgIHo6IDgsXHJcbiAgICAgIGhlYWRpbmc6IDksXHJcbiAgICB9LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2XSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgQ29udGVudEZpbmRlclNldHRpbmdzOiB7XHJcbiAgICB0eXBlOiAnMjY1JyxcclxuICAgIG5hbWU6ICdDb250ZW50RmluZGVyU2V0dGluZ3MnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICB6b25lSWQ6IDIsXHJcbiAgICAgIHpvbmVOYW1lOiAzLFxyXG4gICAgICBpbkNvbnRlbnRGaW5kZXJDb250ZW50OiA0LFxyXG4gICAgICB1bnJlc3RyaWN0ZWRQYXJ0eTogNSxcclxuICAgICAgbWluaW1hbEl0ZW1MZXZlbDogNixcclxuICAgICAgc2lsZW5jZUVjaG86IDcsXHJcbiAgICAgIGV4cGxvcmVyTW9kZTogOCxcclxuICAgICAgbGV2ZWxTeW5jOiA5LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTnBjWWVsbDoge1xyXG4gICAgdHlwZTogJzI2NicsXHJcbiAgICBuYW1lOiAnTnBjWWVsbCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY2JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG5wY0lkOiAyLFxyXG4gICAgICBucGNOYW1lSWQ6IDMsXHJcbiAgICAgIG5wY1llbGxJZDogNCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQmF0dGxlVGFsazI6IHtcclxuICAgIHR5cGU6ICcyNjcnLFxyXG4gICAgbmFtZTogJ0JhdHRsZVRhbGsyJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgbnBjSWQ6IDIsXHJcbiAgICAgIGluc3RhbmNlOiAzLFxyXG4gICAgICBucGNOYW1lSWQ6IDQsXHJcbiAgICAgIGluc3RhbmNlQ29udGVudFRleHRJZDogNSxcclxuICAgICAgZGlzcGxheU1zOiA2LFxyXG4gICAgICAvLyB1bmtub3duMTogNyxcclxuICAgICAgLy8gdW5rbm93bjI6IDgsXHJcbiAgICAgIC8vIHVua25vd24zOiA5LFxyXG4gICAgICAvLyB1bmtub3duNDogMTAsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENvdW50ZG93bjoge1xyXG4gICAgdHlwZTogJzI2OCcsXHJcbiAgICBuYW1lOiAnQ291bnRkb3duJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjgnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHdvcmxkSWQ6IDMsXHJcbiAgICAgIGNvdW50ZG93blRpbWU6IDQsXHJcbiAgICAgIHJlc3VsdDogNSxcclxuICAgICAgbmFtZTogNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENvdW50ZG93bkNhbmNlbDoge1xyXG4gICAgdHlwZTogJzI2OScsXHJcbiAgICBuYW1lOiAnQ291bnRkb3duQ2FuY2VsJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjknLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHdvcmxkSWQ6IDMsXHJcbiAgICAgIG5hbWU6IDQsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDQsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBBY3Rvck1vdmU6IHtcclxuICAgIHR5cGU6ICcyNzAnLFxyXG4gICAgbmFtZTogJ0FjdG9yTW92ZScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjcwJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBoZWFkaW5nOiAzLCAvLyBPUCBjYWxscyB0aGlzICdyb3RhdGlvbicsIGJ1dCBjYWN0Ym90IGNvbnNpc3RlbnRseSB1c2VzICdoZWFkaW5nJ1xyXG4gICAgICAvLyB1bmtub3duMTogNCxcclxuICAgICAgLy8gdW5rbm93bjI6IDUsXHJcbiAgICAgIHg6IDYsXHJcbiAgICAgIHk6IDcsXHJcbiAgICAgIHo6IDgsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgLy8gbm8gcmVhbCB3YXkgdG8gZmlsdGVyIG5vaXNlLCBldmVuIGlmIChpbmZyZXF1ZW50bHkpIHVzZWQgZm9yIHRyaWdnZXJzXHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JTZXRQb3M6IHtcclxuICAgIHR5cGU6ICcyNzEnLFxyXG4gICAgbmFtZTogJ0FjdG9yU2V0UG9zJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzEnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGhlYWRpbmc6IDMsIC8vIE9QIGNhbGxzIHRoaXMgJ3JvdGF0aW9uJywgYnV0IGNhY3Rib3QgY29uc2lzdGVudGx5IHVzZXMgJ2hlYWRpbmcnXHJcbiAgICAgIC8vIHVua25vd24xOiA0LFxyXG4gICAgICAvLyB1bmtub3duMjogNSxcclxuICAgICAgeDogNixcclxuICAgICAgeTogNyxcclxuICAgICAgejogOCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBpZDogJzQuezd9JyB9LCAvLyBOUENzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3Bhd25OcGNFeHRyYToge1xyXG4gICAgdHlwZTogJzI3MicsXHJcbiAgICBuYW1lOiAnU3Bhd25OcGNFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjcyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBwYXJlbnRJZDogMyxcclxuICAgICAgdGV0aGVySWQ6IDQsXHJcbiAgICAgIGFuaW1hdGlvblN0YXRlOiA1LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAzOiBudWxsLCAvLyBgaWRgIGlzIGFuIG5wYywgYnV0IHBhcmVudElkIGNvdWxkIGJlIGEgdGV0aGVyZWQgcGxheWVyP1xyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDNdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFjdG9yQ29udHJvbEV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjczJyxcclxuICAgIG5hbWU6ICdBY3RvckNvbnRyb2xFeHRyYScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjczJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBjYXRlZ29yeTogMyxcclxuICAgICAgcGFyYW0xOiA0LFxyXG4gICAgICBwYXJhbTI6IDUsXHJcbiAgICAgIHBhcmFtMzogNixcclxuICAgICAgcGFyYW00OiA3LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUGxheWVySWRzOiBbNCwgNSwgNiwgN10sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JDb250cm9sU2VsZkV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjc0JyxcclxuICAgIG5hbWU6ICdBY3RvckNvbnRyb2xTZWxmRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3NCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgY2F0ZWdvcnk6IDMsXHJcbiAgICAgIHBhcmFtMTogNCxcclxuICAgICAgcGFyYW0yOiA1LFxyXG4gICAgICBwYXJhbTM6IDYsXHJcbiAgICAgIHBhcmFtNDogNyxcclxuICAgICAgcGFyYW01OiA4LFxyXG4gICAgICBwYXJhbTY6IDksXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs0LCA1LCA2LCA3LCA4LCA5XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCBjb25zdCBsb2dEZWZpbml0aW9uc1ZlcnNpb25zID0ge1xyXG4gICdsYXRlc3QnOiBsYXRlc3RMb2dEZWZpbml0aW9ucyxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIFZlcmlmeSB0aGF0IHRoaXMgaGFzIHRoZSByaWdodCB0eXBlLCBidXQgZXhwb3J0IGBhcyBjb25zdGAuXHJcbmNvbnN0IGFzc2VydExvZ0RlZmluaXRpb25zOiBMb2dEZWZpbml0aW9uTWFwID0gbGF0ZXN0TG9nRGVmaW5pdGlvbnM7XHJcbmNvbnNvbGUuYXNzZXJ0KGFzc2VydExvZ0RlZmluaXRpb25zKTtcclxuXHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25zID0gdHlwZW9mIGxhdGVzdExvZ0RlZmluaXRpb25zO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uTmFtZSA9IGtleW9mIExvZ0RlZmluaXRpb25zO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uVHlwZSA9IExvZ0RlZmluaXRpb25zW0xvZ0RlZmluaXRpb25OYW1lXVsndHlwZSddO1xyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9uTWFwID0geyBbSyBpbiBMb2dEZWZpbml0aW9uTmFtZV06IExvZ0RlZmluaXRpb248Sz4gfTtcclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvblZlcnNpb25zID0ga2V5b2YgdHlwZW9mIGxvZ0RlZmluaXRpb25zVmVyc2lvbnM7XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc05hcnJvd2luZ1R5cGUgPSB7IHJlYWRvbmx5IHJlcGVhdGluZ0ZpZWxkczogdW5rbm93biB9O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBrZXlvZiB7XHJcbiAgW1xyXG4gICAgdHlwZSBpbiBMb2dEZWZpbml0aW9uTmFtZSBhcyBMb2dEZWZpbml0aW9uc1t0eXBlXSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc05hcnJvd2luZ1R5cGUgPyB0eXBlXHJcbiAgICAgIDogbmV2ZXJcclxuICBdOiBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnMgPSB7XHJcbiAgW3R5cGUgaW4gUmVwZWF0aW5nRmllbGRzVHlwZXNdOiBMb2dEZWZpbml0aW9uc1t0eXBlXSAmIHtcclxuICAgIHJlYWRvbmx5IHJlcGVhdGluZ0ZpZWxkczogRXhjbHVkZTxMb2dEZWZpbml0aW9uc1t0eXBlXVsncmVwZWF0aW5nRmllbGRzJ10sIHVuZGVmaW5lZD47XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFBhcnNlSGVscGVyRmllbGQ8XHJcbiAgVHlwZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEZpZWxkcyBleHRlbmRzIE5ldEZpZWxkc1JldmVyc2VbVHlwZV0sXHJcbiAgRmllbGQgZXh0ZW5kcyBrZXlvZiBGaWVsZHMsXHJcbj4gPSB7XHJcbiAgZmllbGQ6IEZpZWxkc1tGaWVsZF0gZXh0ZW5kcyBzdHJpbmcgPyBGaWVsZHNbRmllbGRdIDogbmV2ZXI7XHJcbiAgdmFsdWU/OiBzdHJpbmc7XHJcbiAgb3B0aW9uYWw/OiBib29sZWFuO1xyXG4gIHJlcGVhdGluZz86IGJvb2xlYW47XHJcbiAgcmVwZWF0aW5nS2V5cz86IHN0cmluZ1tdO1xyXG4gIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICBwcmltYXJ5S2V5Pzogc3RyaW5nO1xyXG4gIHBvc3NpYmxlS2V5cz86IHN0cmluZ1tdO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGFyc2VIZWxwZXJGaWVsZHM8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBbZmllbGQgaW4ga2V5b2YgTmV0RmllbGRzUmV2ZXJzZVtUXV06IFBhcnNlSGVscGVyRmllbGQ8VCwgTmV0RmllbGRzUmV2ZXJzZVtUXSwgZmllbGQ+O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgbG9nRGVmaW5pdGlvbnNWZXJzaW9uc1snbGF0ZXN0J107XHJcbiIsIi8vIEhlbHBlciBFcnJvciBmb3IgVHlwZVNjcmlwdCBzaXR1YXRpb25zIHdoZXJlIHRoZSBwcm9ncmFtbWVyIHRoaW5rcyB0aGV5XHJcbi8vIGtub3cgYmV0dGVyIHRoYW4gVHlwZVNjcmlwdCB0aGF0IHNvbWUgc2l0dWF0aW9uIHdpbGwgbmV2ZXIgb2NjdXIuXHJcblxyXG4vLyBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdGhhdCB0aGUgcHJvZ3JhbW1lciBkb2VzIG5vdCBleHBlY3QgYSBwYXJ0aWN1bGFyXHJcbi8vIGJpdCBvZiBjb2RlIHRvIGhhcHBlbiwgYW5kIHNvIGhhcyBub3Qgd3JpdHRlbiBjYXJlZnVsIGVycm9yIGhhbmRsaW5nLlxyXG4vLyBJZiBpdCBkb2VzIG9jY3VyLCBhdCBsZWFzdCB0aGVyZSB3aWxsIGJlIGFuIGVycm9yIGFuZCB3ZSBjYW4gZmlndXJlIG91dCB3aHkuXHJcbi8vIFRoaXMgaXMgcHJlZmVyYWJsZSB0byBjYXN0aW5nIG9yIGRpc2FibGluZyBUeXBlU2NyaXB0IGFsdG9nZXRoZXIgaW4gb3JkZXIgdG9cclxuLy8gYXZvaWQgc3ludGF4IGVycm9ycy5cclxuXHJcbi8vIE9uZSBjb21tb24gZXhhbXBsZSBpcyBhIHJlZ2V4LCB3aGVyZSBpZiB0aGUgcmVnZXggbWF0Y2hlcyB0aGVuIGFsbCBvZiB0aGVcclxuLy8gKG5vbi1vcHRpb25hbCkgcmVnZXggZ3JvdXBzIHdpbGwgYWxzbyBiZSB2YWxpZCwgYnV0IFR5cGVTY3JpcHQgZG9lc24ndCBrbm93LlxyXG5leHBvcnQgY2xhc3MgVW5yZWFjaGFibGVDb2RlIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoJ1RoaXMgY29kZSBzaG91bGRuXFwndCBiZSByZWFjaGVkJyk7XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5ldEZpZWxkcywgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5pbXBvcnQgeyBDYWN0Ym90QmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL25ldF90cmlnZ2VyJztcclxuXHJcbmltcG9ydCBsb2dEZWZpbml0aW9ucywge1xyXG4gIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIGxvZ0RlZmluaXRpb25zVmVyc2lvbnMsXHJcbiAgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4gIFBhcnNlSGVscGVyRmllbGRzLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc1R5cGVzLFxyXG59IGZyb20gJy4vbmV0bG9nX2RlZnMnO1xyXG5pbXBvcnQgeyBVbnJlYWNoYWJsZUNvZGUgfSBmcm9tICcuL25vdF9yZWFjaGVkJztcclxuXHJcbmNvbnN0IHNlcGFyYXRvciA9ICc6JztcclxuY29uc3QgbWF0Y2hEZWZhdWx0ID0gJ1teOl0qJztcclxuY29uc3QgbWF0Y2hXaXRoQ29sb25zRGVmYXVsdCA9ICcoPzpbXjpdfDogKSo/JztcclxuY29uc3QgZmllbGRzV2l0aFBvdGVudGlhbENvbG9ucyA9IFsnZWZmZWN0JywgJ2FiaWxpdHknXTtcclxuXHJcbmNvbnN0IGRlZmF1bHRQYXJhbXMgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIFYgZXh0ZW5kcyBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbj4odHlwZTogVCwgdmVyc2lvbjogViwgaW5jbHVkZT86IHN0cmluZ1tdKTogUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj4gPT4ge1xyXG4gIGNvbnN0IGxvZ1R5cGUgPSBsb2dEZWZpbml0aW9uc1ZlcnNpb25zW3ZlcnNpb25dW3R5cGVdO1xyXG4gIGlmIChpbmNsdWRlID09PSB1bmRlZmluZWQpIHtcclxuICAgIGluY2x1ZGUgPSBPYmplY3Qua2V5cyhsb2dUeXBlLmZpZWxkcyk7XHJcbiAgICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSkge1xyXG4gICAgICBpbmNsdWRlLnB1c2gobG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFyYW1zOiB7XHJcbiAgICBbaW5kZXg6IG51bWJlcl06IHtcclxuICAgICAgZmllbGQ6IHN0cmluZztcclxuICAgICAgdmFsdWU/OiBzdHJpbmc7XHJcbiAgICAgIG9wdGlvbmFsOiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmc/OiBib29sZWFuO1xyXG4gICAgICByZXBlYXRpbmdLZXlzPzogc3RyaW5nW107XHJcbiAgICAgIHNvcnRLZXlzPzogYm9vbGVhbjtcclxuICAgICAgcHJpbWFyeUtleT86IHN0cmluZztcclxuICAgICAgcG9zc2libGVLZXlzPzogc3RyaW5nW107XHJcbiAgICB9O1xyXG4gIH0gPSB7fTtcclxuICBjb25zdCBmaXJzdE9wdGlvbmFsRmllbGQgPSBsb2dUeXBlLmZpcnN0T3B0aW9uYWxGaWVsZDtcclxuXHJcbiAgZm9yIChjb25zdCBbcHJvcCwgaW5kZXhdIG9mIE9iamVjdC5lbnRyaWVzKGxvZ1R5cGUuZmllbGRzKSkge1xyXG4gICAgaWYgKCFpbmNsdWRlLmluY2x1ZGVzKHByb3ApKVxyXG4gICAgICBjb250aW51ZTtcclxuICAgIGNvbnN0IHBhcmFtOiB7IGZpZWxkOiBzdHJpbmc7IHZhbHVlPzogc3RyaW5nOyBvcHRpb25hbDogYm9vbGVhbjsgcmVwZWF0aW5nPzogYm9vbGVhbiB9ID0ge1xyXG4gICAgICBmaWVsZDogcHJvcCxcclxuICAgICAgb3B0aW9uYWw6IGZpcnN0T3B0aW9uYWxGaWVsZCAhPT0gdW5kZWZpbmVkICYmIGluZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgIH07XHJcbiAgICBpZiAocHJvcCA9PT0gJ3R5cGUnKVxyXG4gICAgICBwYXJhbS52YWx1ZSA9IGxvZ1R5cGUudHlwZTtcclxuXHJcbiAgICBwYXJhbXNbaW5kZXhdID0gcGFyYW07XHJcbiAgfVxyXG5cclxuICBpZiAoJ3JlcGVhdGluZ0ZpZWxkcycgaW4gbG9nVHlwZSAmJiBpbmNsdWRlLmluY2x1ZGVzKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKSkge1xyXG4gICAgcGFyYW1zW2xvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXhdID0ge1xyXG4gICAgICBmaWVsZDogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJlxyXG4gICAgICAgIGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnN0YXJ0aW5nSW5kZXggPj0gZmlyc3RPcHRpb25hbEZpZWxkLFxyXG4gICAgICByZXBlYXRpbmc6IHRydWUsXHJcbiAgICAgIHJlcGVhdGluZ0tleXM6IFsuLi5sb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5uYW1lc10sXHJcbiAgICAgIHNvcnRLZXlzOiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zb3J0S2V5cyxcclxuICAgICAgcHJpbWFyeUtleTogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucHJpbWFyeUtleSxcclxuICAgICAgcG9zc2libGVLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMucG9zc2libGVLZXlzXSxcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyYW1zIGFzIFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+O1xyXG59O1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXA8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IHtcclxuICBbbmFtZSBpbiBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ25hbWVzJ11bbnVtYmVyXV06XHJcbiAgICB8IHN0cmluZ1xyXG4gICAgfCBzdHJpbmdbXTtcclxufVtdO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8XHJcbiAgVEJhc2UgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RCYXNlXSxcclxuICBUS2V5IGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPSBUQmFzZSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gVEJhc2UgOiBuZXZlcixcclxuPiA9IEYgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9uc1tUS2V5XVsncmVwZWF0aW5nRmllbGRzJ11bJ2xhYmVsJ11cclxuICA/IFJlcGVhdGluZ0ZpZWxkc01hcDxUS2V5PiA6XHJcbiAgbmV2ZXI7XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEYgZXh0ZW5kcyBrZXlvZiBOZXRGaWVsZHNbVF0sXHJcbj4gPSBUIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlQ2hlY2s8VCwgRj5cclxuICA6IG5ldmVyO1xyXG5cclxudHlwZSBQYXJzZUhlbHBlclR5cGU8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9XHJcbiAgJiB7XHJcbiAgICBbZmllbGQgaW4ga2V5b2YgTmV0RmllbGRzW1RdXT86IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVwZWF0aW5nRmllbGRzTWFwVHlwZTxULCBmaWVsZD47XHJcbiAgfVxyXG4gICYgeyBjYXB0dXJlPzogYm9vbGVhbiB9O1xyXG5cclxuY29uc3QgaXNSZXBlYXRpbmdGaWVsZCA9IDxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbj4oXHJcbiAgcmVwZWF0aW5nOiBib29sZWFuIHwgdW5kZWZpbmVkLFxyXG4gIHZhbHVlOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcDxUPiB8IHVuZGVmaW5lZCxcclxuKTogdmFsdWUgaXMgUmVwZWF0aW5nRmllbGRzTWFwPFQ+ID0+IHtcclxuICBpZiAocmVwZWF0aW5nICE9PSB0cnVlKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIEFsbG93IGV4Y2x1ZGluZyB0aGUgZmllbGQgdG8gbWF0Y2ggZm9yIGV4dHJhY3Rpb25cclxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgZm9yIChjb25zdCBlIG9mIHZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIGUgIT09ICdvYmplY3QnKVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuY29uc3QgcGFyc2VIZWxwZXIgPSA8VCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPihcclxuICBwYXJhbXM6IFBhcnNlSGVscGVyVHlwZTxUPiB8IHVuZGVmaW5lZCxcclxuICBkZWZLZXk6IFQsXHJcbiAgZmllbGRzOiBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHBhcmFtcyA9IHBhcmFtcyA/PyB7fTtcclxuICBjb25zdCB2YWxpZEZpZWxkczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgZm9yIChjb25zdCBpbmRleCBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IGZpZWxkID0gZmllbGRzW2luZGV4XTtcclxuICAgIGlmIChmaWVsZClcclxuICAgICAgdmFsaWRGaWVsZHMucHVzaChmaWVsZC5maWVsZCk7XHJcbiAgfVxyXG5cclxuICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKHBhcmFtcywgZGVmS2V5LCBbJ2NhcHR1cmUnLCAuLi52YWxpZEZpZWxkc10pO1xyXG5cclxuICAvLyBGaW5kIHRoZSBsYXN0IGtleSB3ZSBjYXJlIGFib3V0LCBzbyB3ZSBjYW4gc2hvcnRlbiB0aGUgcmVnZXggaWYgbmVlZGVkLlxyXG4gIGNvbnN0IGNhcHR1cmUgPSBSZWdleGVzLnRydWVJZlVuZGVmaW5lZChwYXJhbXMuY2FwdHVyZSk7XHJcbiAgY29uc3QgZmllbGRLZXlzID0gT2JqZWN0LmtleXMoZmllbGRzKS5zb3J0KChhLCBiKSA9PiBwYXJzZUludChhKSAtIHBhcnNlSW50KGIpKTtcclxuICBsZXQgbWF4S2V5U3RyOiBzdHJpbmc7XHJcbiAgaWYgKGNhcHR1cmUpIHtcclxuICAgIGNvbnN0IGtleXM6IEV4dHJhY3Q8a2V5b2YgTmV0RmllbGRzUmV2ZXJzZVtUXSwgc3RyaW5nPltdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpXHJcbiAgICAgIGtleXMucHVzaChrZXkpO1xyXG4gICAgbGV0IHRtcEtleSA9IGtleXMucG9wKCk7XHJcbiAgICBpZiAodG1wS2V5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgbWF4S2V5U3RyID0gZmllbGRLZXlzW2ZpZWxkS2V5cy5sZW5ndGggLSAxXSA/PyAnMCc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3aGlsZSAoXHJcbiAgICAgICAgZmllbGRzW3RtcEtleV0/Lm9wdGlvbmFsICYmXHJcbiAgICAgICAgISgoZmllbGRzW3RtcEtleV0/LmZpZWxkID8/ICcnKSBpbiBwYXJhbXMpXHJcbiAgICAgIClcclxuICAgICAgICB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgICBtYXhLZXlTdHIgPSB0bXBLZXkgPz8gJzAnO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBtYXhLZXlTdHIgPSAnMCc7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZHMpIHtcclxuICAgICAgY29uc3QgdmFsdWUgPSBmaWVsZHNba2V5XSA/PyB7fTtcclxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGZpZWxkc1trZXldPy5maWVsZDtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkICYmIGZpZWxkTmFtZSBpbiBwYXJhbXMpXHJcbiAgICAgICAgbWF4S2V5U3RyID0ga2V5O1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBtYXhLZXkgPSBwYXJzZUludChtYXhLZXlTdHIpO1xyXG5cclxuICAvLyBTcGVjaWFsIGNhc2UgZm9yIEFiaWxpdHkgdG8gaGFuZGxlIGFvZSBhbmQgbm9uLWFvZS5cclxuICBjb25zdCBhYmlsaXR5TWVzc2FnZVR5cGUgPVxyXG4gICAgYCg/OiR7bG9nRGVmaW5pdGlvbnMuQWJpbGl0eS5tZXNzYWdlVHlwZX18JHtsb2dEZWZpbml0aW9ucy5OZXR3b3JrQU9FQWJpbGl0eS5tZXNzYWdlVHlwZX0pYDtcclxuICBjb25zdCBhYmlsaXR5SGV4Q29kZSA9ICcoPzoxNXwxNiknO1xyXG5cclxuICAvLyBCdWlsZCB0aGUgcmVnZXggZnJvbSB0aGUgZmllbGRzLlxyXG4gIGNvbnN0IHByZWZpeCA9IGRlZktleSAhPT0gJ0FiaWxpdHknID8gbG9nRGVmaW5pdGlvbnNbZGVmS2V5XS5tZXNzYWdlVHlwZSA6IGFiaWxpdHlNZXNzYWdlVHlwZTtcclxuXHJcbiAgLy8gSGV4IGNvZGVzIGFyZSBhIG1pbmltdW0gb2YgdHdvIGNoYXJhY3RlcnMuICBBYmlsaXRpZXMgYXJlIHNwZWNpYWwgYmVjYXVzZVxyXG4gIC8vIHRoZXkgbmVlZCB0byBzdXBwb3J0IGJvdGggMHgxNSBhbmQgMHgxNi5cclxuICBjb25zdCB0eXBlQXNIZXggPSBwYXJzZUludChsb2dEZWZpbml0aW9uc1tkZWZLZXldLnR5cGUpLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpO1xyXG4gIGNvbnN0IGRlZmF1bHRIZXhDb2RlID0gdHlwZUFzSGV4Lmxlbmd0aCA8IDIgPyBgMDAke3R5cGVBc0hleH1gLnNsaWNlKC0yKSA6IHR5cGVBc0hleDtcclxuICBjb25zdCBoZXhDb2RlID0gZGVmS2V5ICE9PSAnQWJpbGl0eScgPyBkZWZhdWx0SGV4Q29kZSA6IGFiaWxpdHlIZXhDb2RlO1xyXG5cclxuICBsZXQgc3RyID0gJyc7XHJcbiAgaWYgKGNhcHR1cmUpXHJcbiAgICBzdHIgKz0gYCg/PHRpbWVzdGFtcD5cXFxceXtUaW1lc3RhbXB9KSAke3ByZWZpeH0gKD88dHlwZT4ke2hleENvZGV9KWA7XHJcbiAgZWxzZVxyXG4gICAgc3RyICs9IGBcXFxceXtUaW1lc3RhbXB9ICR7cHJlZml4fSAke2hleENvZGV9YDtcclxuXHJcbiAgbGV0IGxhc3RLZXkgPSAxO1xyXG4gIGZvciAoY29uc3Qga2V5U3RyIGluIGZpZWxkcykge1xyXG4gICAgY29uc3QgcGFyc2VGaWVsZCA9IGZpZWxkc1trZXlTdHJdO1xyXG4gICAgaWYgKHBhcnNlRmllbGQgPT09IHVuZGVmaW5lZClcclxuICAgICAgY29udGludWU7XHJcbiAgICBjb25zdCBmaWVsZE5hbWUgPSBwYXJzZUZpZWxkLmZpZWxkO1xyXG5cclxuICAgIC8vIFJlZ2V4IGhhbmRsZXMgdGhlc2UgbWFudWFsbHkgYWJvdmUgaW4gdGhlIGBzdHJgIGluaXRpYWxpemF0aW9uLlxyXG4gICAgaWYgKGZpZWxkTmFtZSA9PT0gJ3RpbWVzdGFtcCcgfHwgZmllbGROYW1lID09PSAndHlwZScpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgIGNvbnN0IGtleSA9IHBhcnNlSW50KGtleVN0cik7XHJcbiAgICAvLyBGaWxsIGluIGJsYW5rcy5cclxuICAgIGNvbnN0IG1pc3NpbmdGaWVsZHMgPSBrZXkgLSBsYXN0S2V5IC0gMTtcclxuICAgIGlmIChtaXNzaW5nRmllbGRzID09PSAxKVxyXG4gICAgICBzdHIgKz0gYCR7c2VwYXJhdG9yfSR7bWF0Y2hEZWZhdWx0fWA7XHJcbiAgICBlbHNlIGlmIChtaXNzaW5nRmllbGRzID4gMSlcclxuICAgICAgc3RyICs9IGAoPzoke3NlcGFyYXRvcn0ke21hdGNoRGVmYXVsdH0peyR7bWlzc2luZ0ZpZWxkc319YDtcclxuICAgIGxhc3RLZXkgPSBrZXk7XHJcblxyXG4gICAgc3RyICs9IHNlcGFyYXRvcjtcclxuXHJcbiAgICBpZiAodHlwZW9mIHBhcnNlRmllbGQgIT09ICdvYmplY3QnKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGVmS2V5fTogaW52YWxpZCB2YWx1ZTogJHtKU09OLnN0cmluZ2lmeShwYXJzZUZpZWxkKX1gKTtcclxuXHJcbiAgICBjb25zdCBmaWVsZERlZmF1bHQgPSBmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZHNXaXRoUG90ZW50aWFsQ29sb25zLmluY2x1ZGVzKGZpZWxkTmFtZSlcclxuICAgICAgPyBtYXRjaFdpdGhDb2xvbnNEZWZhdWx0XHJcbiAgICAgIDogbWF0Y2hEZWZhdWx0O1xyXG4gICAgY29uc3QgZGVmYXVsdEZpZWxkVmFsdWUgPSBwYXJzZUZpZWxkLnZhbHVlPy50b1N0cmluZygpID8/IGZpZWxkRGVmYXVsdDtcclxuICAgIGNvbnN0IGZpZWxkVmFsdWUgPSBwYXJhbXNbZmllbGROYW1lXTtcclxuXHJcbiAgICBpZiAoaXNSZXBlYXRpbmdGaWVsZChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nLCBmaWVsZFZhbHVlKSkge1xyXG4gICAgICBjb25zdCByZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3IgPSAnKD86JHw6KSc7XHJcbiAgICAgIGxldCByZXBlYXRpbmdBcnJheTogUmVwZWF0aW5nRmllbGRzTWFwPFQ+IHwgdW5kZWZpbmVkID0gZmllbGRWYWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHNvcnRLZXlzID0gZmllbGRzW2tleVN0cl0/LnNvcnRLZXlzO1xyXG4gICAgICBjb25zdCBwcmltYXJ5S2V5ID0gZmllbGRzW2tleVN0cl0/LnByaW1hcnlLZXk7XHJcbiAgICAgIGNvbnN0IHBvc3NpYmxlS2V5cyA9IGZpZWxkc1trZXlTdHJdPy5wb3NzaWJsZUtleXM7XHJcblxyXG4gICAgICAvLyBwcmltYXJ5S2V5IGlzIHJlcXVpcmVkIGlmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgcGVyIHR5cGVkZWYgaW4gbmV0bG9nX2RlZnMudHNcclxuICAgICAgLy8gU2FtZSB3aXRoIHBvc3NpYmxlS2V5c1xyXG4gICAgICBpZiAocHJpbWFyeUtleSA9PT0gdW5kZWZpbmVkIHx8IHBvc3NpYmxlS2V5cyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuXHJcbiAgICAgIC8vIEFsbG93IHNvcnRpbmcgaWYgbmVlZGVkXHJcbiAgICAgIGlmIChzb3J0S2V5cykge1xyXG4gICAgICAgIC8vIEFsc28gc29ydCBvdXIgdmFsaWQga2V5cyBsaXN0XHJcbiAgICAgICAgcG9zc2libGVLZXlzLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiBsZWZ0LnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShyaWdodC50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgaWYgKHJlcGVhdGluZ0FycmF5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIHJlcGVhdGluZ0FycmF5ID0gWy4uLnJlcGVhdGluZ0FycmF5XS5zb3J0KFxyXG4gICAgICAgICAgICAobGVmdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHJpZ2h0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gV2UgY2hlY2sgdGhlIHZhbGlkaXR5IG9mIGxlZnQvcmlnaHQgYmVjYXVzZSB0aGV5J3JlIHVzZXItc3VwcGxpZWRcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnQgIT09ICdvYmplY3QnIHx8IGxlZnRbcHJpbWFyeUtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IGxlZnRWYWx1ZSA9IGxlZnRbcHJpbWFyeUtleV07XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKGxlZnRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCBsZWZ0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0ICE9PSAnb2JqZWN0JyB8fCByaWdodFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZ2h0VmFsdWUgPSByaWdodFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKHJpZ2h0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBsZWZ0VmFsdWUudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0VmFsdWUudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYW5vblJlcHM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH1bXSB8IHVuZGVmaW5lZCA9IHJlcGVhdGluZ0FycmF5O1xyXG4gICAgICAvLyBMb29wIG92ZXIgb3VyIHBvc3NpYmxlIGtleXNcclxuICAgICAgLy8gQnVpbGQgYSByZWdleCB0aGF0IGNhbiBtYXRjaCBhbnkgcG9zc2libGUga2V5IHdpdGggcmVxdWlyZWQgdmFsdWVzIHN1YnN0aXR1dGVkIGluXHJcbiAgICAgIHBvc3NpYmxlS2V5cy5mb3JFYWNoKChwb3NzaWJsZUtleSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcCA9IGFub25SZXBzPy5maW5kKChyZXApID0+IHByaW1hcnlLZXkgaW4gcmVwICYmIHJlcFtwcmltYXJ5S2V5XSA9PT0gcG9zc2libGVLZXkpO1xyXG5cclxuICAgICAgICBsZXQgZmllbGRSZWdleCA9ICcnO1xyXG4gICAgICAgIC8vIFJhdGhlciB0aGFuIGxvb3Bpbmcgb3ZlciB0aGUga2V5cyBkZWZpbmVkIG9uIHRoZSBvYmplY3QsXHJcbiAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBiYXNlIHR5cGUgZGVmJ3Mga2V5cy4gVGhpcyBlbmZvcmNlcyB0aGUgY29ycmVjdCBvcmRlci5cclxuICAgICAgICBmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nS2V5cz8uZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICBsZXQgdmFsID0gcmVwPy5ba2V5XTtcclxuICAgICAgICAgIGlmIChyZXAgPT09IHVuZGVmaW5lZCB8fCAhKGtleSBpbiByZXApKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWx1ZSBmb3IgdGhpcyBrZXlcclxuICAgICAgICAgICAgLy8gaW5zZXJ0IGEgcGxhY2Vob2xkZXIsIHVubGVzcyBpdCdzIHRoZSBwcmltYXJ5IGtleVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBwcmltYXJ5S2V5KVxyXG4gICAgICAgICAgICAgIHZhbCA9IHBvc3NpYmxlS2V5O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWwpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsLmxlbmd0aCA8IDEpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwuc29tZSgodikgPT4gdHlwZW9mIHYgIT09ICdzdHJpbmcnKSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWVsZFJlZ2V4ICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgICBrZXkgPT09IHByaW1hcnlLZXkgPyBmYWxzZSA6IGNhcHR1cmUsXHJcbiAgICAgICAgICAgIC8vIEFsbCBjYXB0dXJpbmcgZ3JvdXBzIGFyZSBgZmllbGROYW1lYCArIGBwb3NzaWJsZUtleWAsIGUuZy4gYHBhaXJJc0Nhc3RpbmcxYFxyXG4gICAgICAgICAgICBmaWVsZE5hbWUgKyBwb3NzaWJsZUtleSxcclxuICAgICAgICAgICAgdmFsLFxyXG4gICAgICAgICAgICBkZWZhdWx0RmllbGRWYWx1ZSxcclxuICAgICAgICAgICkgK1xyXG4gICAgICAgICAgICByZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3I7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChmaWVsZFJlZ2V4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHN0ciArPSBgKD86JHtmaWVsZFJlZ2V4fSkke3JlcCAhPT0gdW5kZWZpbmVkID8gJycgOiAnPyd9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIGlmIChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nKSB7XHJcbiAgICAgIC8vIElmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgYnV0IHRoZSBhY3R1YWwgdmFsdWUgaXMgZW1wdHkgb3Igb3RoZXJ3aXNlIGludmFsaWQsXHJcbiAgICAgIC8vIGRvbid0IHByb2Nlc3MgZnVydGhlci4gV2UgY2FuJ3QgdXNlIGBjb250aW51ZWAgaW4gdGhlIGFib3ZlIGJsb2NrIGJlY2F1c2UgdGhhdFxyXG4gICAgICAvLyB3b3VsZCBza2lwIHRoZSBlYXJseS1vdXQgYnJlYWsgYXQgdGhlIGVuZCBvZiB0aGUgbG9vcC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShcclxuICAgICAgICAgIC8vIG1vcmUgYWNjdXJhdGUgdHlwZSBpbnN0ZWFkIG9mIGBhc2AgY2FzdFxyXG4gICAgICAgICAgLy8gbWF5YmUgdGhpcyBmdW5jdGlvbiBuZWVkcyBhIHJlZmFjdG9yaW5nXHJcbiAgICAgICAgICBjYXB0dXJlLFxyXG4gICAgICAgICAgZmllbGROYW1lLFxyXG4gICAgICAgICAgZmllbGRWYWx1ZSxcclxuICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gRklYTUU6IGhhbmRsZSBsaW50IGVycm9yIGhlcmVcclxuICAgICAgICAvLyByZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvcHVsbC8yNzQjZGlzY3Vzc2lvbl9yMTY5MjQzOTcyMFxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVzdHJpY3QtcGx1cy1vcGVyYW5kc1xyXG4gICAgICAgIHN0ciArPSBmaWVsZFZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcCBpZiB3ZSdyZSBub3QgY2FwdHVyaW5nIGFuZCBkb24ndCBjYXJlIGFib3V0IGZ1dHVyZSBmaWVsZHMuXHJcbiAgICBpZiAoa2V5ID49IG1heEtleSlcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG5cclxuICBzdHIgKz0gJyg/OiR8OiknO1xyXG5cclxuICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpIGFzIENhY3Rib3RCYXNlUmVnRXhwPFQ+O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVnZXggPSA8VCBleHRlbmRzIGtleW9mIE5ldFBhcmFtcz4oXHJcbiAgdHlwZTogVCxcclxuICBwYXJhbXM/OiBQYXJzZUhlbHBlclR5cGU8VD4sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCB0eXBlLCBkZWZhdWx0UGFyYW1zKHR5cGUsIFJlZ2V4ZXMubG9nVmVyc2lvbikpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnZXhlcyB7XHJcbiAgc3RhdGljIGxvZ1ZlcnNpb246IExvZ0RlZmluaXRpb25WZXJzaW9ucyA9ICdsYXRlc3QnO1xyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjAtMHgxNC1uZXR3b3Jrc3RhcnRzY2FzdGluZ1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXJ0c1VzaW5nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhcnRzVXNpbmcnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmcnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5KHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjEtMHgxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMi0weDE2LW5ldHdvcmthb2VhYmlsaXR5XHJcbiAgICpcclxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGFiaWxpdHlgIGluc3RlYWRcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUZ1bGwocGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eSc+IHtcclxuICAgIHJldHVybiB0aGlzLmFiaWxpdHkocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNy0weDFiLW5ldHdvcmt0YXJnZXRpY29uLWhlYWQtbWFya2VyXHJcbiAgICovXHJcbiAgc3RhdGljIGhlYWRNYXJrZXIocGFyYW1zPzogTmV0UGFyYW1zWydIZWFkTWFya2VyJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnSGVhZE1hcmtlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdIZWFkTWFya2VyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMy0weDAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWRkZWRDb21iYXRhbnQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50RnVsbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gdGhpcy5hZGRlZENvbWJhdGFudChwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTA0LTB4MDQtcmVtb3ZlY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIHJlbW92aW5nQ29tYmF0YW50KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydSZW1vdmVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1JlbW92ZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUmVtb3ZlZENvbWJhdGFudCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYtMHgxYS1uZXR3b3JrYnVmZlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYWluc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhaW5zRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FpbnNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnR2FpbnNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJlZmVyIGdhaW5zRWZmZWN0IG92ZXIgdGhpcyBmdW5jdGlvbiB1bmxlc3MgeW91IHJlYWxseSBuZWVkIGV4dHJhIGRhdGEuXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM4LTB4MjYtbmV0d29ya3N0YXR1c2VmZmVjdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdHVzRWZmZWN0RXhwbGljaXQoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXR1c0VmZmVjdCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGF0dXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhdHVzRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zMC0weDFlLW5ldHdvcmtidWZmcmVtb3ZlXHJcbiAgICovXHJcbiAgc3RhdGljIGxvc2VzRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTG9zZXNFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdMb3Nlc0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdMb3Nlc0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzUtMHgyMy1uZXR3b3JrdGV0aGVyXHJcbiAgICovXHJcbiAgc3RhdGljIHRldGhlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ1RldGhlciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1RldGhlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdUZXRoZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogJ3RhcmdldCcgd2FzIGRlZmVhdGVkIGJ5ICdzb3VyY2UnXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1LTB4MTktbmV0d29ya2RlYXRoXHJcbiAgICovXHJcbiAgc3RhdGljIHdhc0RlZmVhdGVkKHBhcmFtcz86IE5ldFBhcmFtc1snV2FzRGVmZWF0ZWQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdXYXNEZWZlYXRlZCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdXYXNEZWZlYXRlZCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjQtMHgxOC1uZXR3b3JrZG90XHJcbiAgICovXHJcbiAgc3RhdGljIG5ldHdvcmtEb1QocGFyYW1zPzogTmV0UGFyYW1zWydOZXR3b3JrRG9UJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmV0d29ya0RvVCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOZXR3b3JrRG9UJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZWNobyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ2VjaG8nLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcbiAgICBwYXJhbXMuY29kZSA9ICcwMDM4JztcclxuICAgIHJldHVybiBSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZGlhbG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnZGlhbG9nJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDA0NCc7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIG1lc3NhZ2UocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdtZXNzYWdlJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDgzOSc7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIG5hbWUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYW1lTG9nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZU5hbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTEyLTB4MGMtcGxheWVyc3RhdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdENoYW5nZShwYXJhbXM/OiBOZXRQYXJhbXNbJ1BsYXllclN0YXRzJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUGxheWVyU3RhdHMnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUGxheWVyU3RhdHMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAxLTB4MDEtY2hhbmdlem9uZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaGFuZ2Vab25lKHBhcmFtcz86IE5ldFBhcmFtc1snQ2hhbmdlWm9uZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NoYW5nZVpvbmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ2hhbmdlWm9uZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzMtMHgyMS1uZXR3b3JrNmQtYWN0b3ItY29udHJvbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrNmQocGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2wnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2wnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNC0weDIyLW5ldHdvcmtuYW1ldG9nZ2xlXHJcbiAgICovXHJcbiAgc3RhdGljIG5hbWVUb2dnbGUocGFyYW1zPzogTmV0UGFyYW1zWydOYW1lVG9nZ2xlJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmFtZVRvZ2dsZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOYW1lVG9nZ2xlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MC0weDI4LW1hcFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXAocGFyYW1zPzogTmV0UGFyYW1zWydNYXAnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXAnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MS0weDI5LXN5c3RlbWxvZ21lc3NhZ2VcclxuICAgKi9cclxuICBzdGF0aWMgc3lzdGVtTG9nTWVzc2FnZShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3lzdGVtTG9nTWVzc2FnZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTeXN0ZW1Mb2dNZXNzYWdlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N5c3RlbUxvZ01lc3NhZ2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1Ny0weDEwMS1tYXBlZmZlY3RcclxuICAgKi9cclxuICBzdGF0aWMgbWFwRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTWFwRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcEVmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU4LTB4MTAyLWZhdGVkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBmYXRlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydGYXRlRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdGYXRlRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnRmF0ZURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTktMHgxMDMtY2VkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBjZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snQ0VEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NFRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ0VEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYwLTB4MTA0LWluY29tYmF0XHJcbiAgICovXHJcbiAgc3RhdGljIGluQ29tYmF0KHBhcmFtcz86IE5ldFBhcmFtc1snSW5Db21iYXQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdJbkNvbWJhdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdJbkNvbWJhdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYxLTB4MTA1LWNvbWJhdGFudG1lbW9yeVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb21iYXRhbnRNZW1vcnkoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbWJhdGFudE1lbW9yeSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb21iYXRhbnRNZW1vcnknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29tYmF0YW50TWVtb3J5JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjMtMHgxMDctc3RhcnRzdXNpbmdleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZ0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZ0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmdFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY0LTB4MTA4LWFiaWxpdHlleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHlFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5RXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eUV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjUtMHgxMDktY29udGVudGZpbmRlcnNldHRpbmdzXHJcbiAgICovXHJcbiAgc3RhdGljIGNvbnRlbnRGaW5kZXJTZXR0aW5ncyhcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29udGVudEZpbmRlclNldHRpbmdzJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbnRlbnRGaW5kZXJTZXR0aW5ncyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb250ZW50RmluZGVyU2V0dGluZ3MnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Ni0weDEwYS1ucGN5ZWxsXHJcbiAgICovXHJcbiAgc3RhdGljIG5wY1llbGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ05wY1llbGwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTnBjWWVsbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOcGNZZWxsJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjctMHgxMGItYmF0dGxldGFsazJcclxuICAgKi9cclxuICBzdGF0aWMgYmF0dGxlVGFsazIoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0JhdHRsZVRhbGsyJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0JhdHRsZVRhbGsyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0JhdHRsZVRhbGsyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjgtMHgxMGMtY291bnRkb3duXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bihcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2OS0weDEwZC1jb3VudGRvd25jYW5jZWxcclxuICAgKi9cclxuICBzdGF0aWMgY291bnRkb3duQ2FuY2VsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb3VudGRvd25DYW5jZWwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ291bnRkb3duQ2FuY2VsJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvdW50ZG93bkNhbmNlbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcwLTB4MTBlLWFjdG9ybW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3Rvck1vdmUoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yTW92ZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3Rvck1vdmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JNb3ZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzEtMHgxMGYtYWN0b3JzZXRwb3NcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JTZXRQb3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yU2V0UG9zJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yU2V0UG9zJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yU2V0UG9zJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzItMHgxMTAtc3Bhd25ucGNleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzcGF3bk5wY0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTcGF3bk5wY0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1NwYXduTnBjRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3Bhd25OcGNFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjczLTB4MTExLWFjdG9yY29udHJvbGV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yQ29udHJvbEV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2xFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjc0LTB4MTEyLWFjdG9yY29udHJvbHNlbGZleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xTZWxmRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbFNlbGZFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xTZWxmRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sU2VsZkV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhlbHBlciBmdW5jdGlvbiBmb3IgYnVpbGRpbmcgbmFtZWQgY2FwdHVyZSBncm91cFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXliZUNhcHR1cmUoXHJcbiAgICBjYXB0dXJlOiBib29sZWFuLFxyXG4gICAgbmFtZTogc3RyaW5nLFxyXG4gICAgdmFsdWU6IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxyXG4gICAgZGVmYXVsdFZhbHVlPzogc3RyaW5nLFxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZClcclxuICAgICAgdmFsdWUgPSBkZWZhdWx0VmFsdWUgPz8gbWF0Y2hEZWZhdWx0O1xyXG4gICAgdmFsdWUgPSBSZWdleGVzLmFueU9mKHZhbHVlKTtcclxuICAgIHJldHVybiBjYXB0dXJlID8gUmVnZXhlcy5uYW1lZENhcHR1cmUobmFtZSwgdmFsdWUpIDogdmFsdWU7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgb3B0aW9uYWwoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGAoPzoke3N0cn0pP2A7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGVzIGEgbmFtZWQgcmVnZXggY2FwdHVyZSBncm91cCBuYW1lZCB8bmFtZXwgZm9yIHRoZSBtYXRjaCB8dmFsdWV8LlxyXG4gIHN0YXRpYyBuYW1lZENhcHR1cmUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIGlmIChuYW1lLmluY2x1ZGVzKCc+JykpXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFwiJHtuYW1lfVwiIGNvbnRhaW5zIFwiPlwiLmApO1xyXG4gICAgaWYgKG5hbWUuaW5jbHVkZXMoJzwnKSlcclxuICAgICAgY29uc29sZS5lcnJvcihgXCIke25hbWV9XCIgY29udGFpbnMgXCI+XCIuYCk7XHJcblxyXG4gICAgcmV0dXJuIGAoPzwke25hbWV9PiR7dmFsdWV9KWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmb3IgdHVybmluZyBtdWx0aXBsZSBhcmdzIGludG8gYSB1bmlvbmVkIHJlZ3VsYXIgZXhwcmVzc2lvbi5cclxuICAgKiBhbnlPZih4LCB5LCB6KSBvciBhbnlPZihbeCwgeSwgel0pIGRvIHRoZSBzYW1lIHRoaW5nLCBhbmQgcmV0dXJuICg/Onh8eXx6KS5cclxuICAgKiBhbnlPZih4KSBvciBhbnlPZih4KSBvbiBpdHMgb3duIHNpbXBsaWZpZXMgdG8ganVzdCB4LlxyXG4gICAqIGFyZ3MgbWF5IGJlIHN0cmluZ3Mgb3IgUmVnRXhwLCBhbHRob3VnaCBhbnkgYWRkaXRpb25hbCBtYXJrZXJzIHRvIFJlZ0V4cFxyXG4gICAqIGxpa2UgL2luc2Vuc2l0aXZlL2kgYXJlIGRyb3BwZWQuXHJcbiAgICovXHJcbiAgc3RhdGljIGFueU9mKC4uLmFyZ3M6IChzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlZ0V4cClbXSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhbnlPZkFycmF5ID0gKGFycmF5OiByZWFkb25seSAoc3RyaW5nIHwgUmVnRXhwKVtdKTogc3RyaW5nID0+IHtcclxuICAgICAgY29uc3QgW2VsZW1dID0gYXJyYXk7XHJcbiAgICAgIGlmIChlbGVtICE9PSB1bmRlZmluZWQgJiYgYXJyYXkubGVuZ3RoID09PSAxKVxyXG4gICAgICAgIHJldHVybiBgJHtlbGVtIGluc3RhbmNlb2YgUmVnRXhwID8gZWxlbS5zb3VyY2UgOiBlbGVtfWA7XHJcbiAgICAgIHJldHVybiBgKD86JHthcnJheS5tYXAoKGVsZW0pID0+IGVsZW0gaW5zdGFuY2VvZiBSZWdFeHAgPyBlbGVtLnNvdXJjZSA6IGVsZW0pLmpvaW4oJ3wnKX0pYDtcclxuICAgIH07XHJcbiAgICBsZXQgYXJyYXk6IHJlYWRvbmx5IChzdHJpbmcgfCBSZWdFeHApW10gPSBbXTtcclxuICAgIGNvbnN0IFtmaXJzdEFyZ10gPSBhcmdzO1xyXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgZmlyc3RBcmcgPT09ICdzdHJpbmcnIHx8IGZpcnN0QXJnIGluc3RhbmNlb2YgUmVnRXhwKVxyXG4gICAgICAgIGFycmF5ID0gW2ZpcnN0QXJnXTtcclxuICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmaXJzdEFyZykpXHJcbiAgICAgICAgYXJyYXkgPSBmaXJzdEFyZztcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGFycmF5ID0gW107XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBUT0RPOiBtb3JlIGFjY3VyYXRlIHR5cGUgaW5zdGVhZCBvZiBgYXNgIGNhc3RcclxuICAgICAgYXJyYXkgPSBhcmdzIGFzIHJlYWRvbmx5IHN0cmluZ1tdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFueU9mQXJyYXkoYXJyYXkpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHBhcnNlKHJlZ2V4cFN0cmluZzogUmVnRXhwIHwgc3RyaW5nIHwgQ2FjdGJvdEJhc2VSZWdFeHA8J05vbmUnPik6IFJlZ0V4cCB7XHJcbiAgICBjb25zdCBrQ2FjdGJvdENhdGVnb3JpZXMgPSB7XHJcbiAgICAgIFRpbWVzdGFtcDogJ14uezE0fScsXHJcbiAgICAgIE5ldFRpbWVzdGFtcDogJy57MzN9JyxcclxuICAgICAgTmV0RmllbGQ6ICcoPzpbXnxdKlxcXFx8KScsXHJcbiAgICAgIExvZ1R5cGU6ICdbMC05QS1GYS1mXXsyfScsXHJcbiAgICAgIEFiaWxpdHlDb2RlOiAnWzAtOUEtRmEtZl17MSw4fScsXHJcbiAgICAgIE9iamVjdElkOiAnWzAtOUEtRl17OH0nLFxyXG4gICAgICAvLyBNYXRjaGVzIGFueSBjaGFyYWN0ZXIgbmFtZSAoaW5jbHVkaW5nIGVtcHR5IHN0cmluZ3Mgd2hpY2ggdGhlIEZGWElWXHJcbiAgICAgIC8vIEFDVCBwbHVnaW4gY2FuIGdlbmVyYXRlIHdoZW4gdW5rbm93bikuXHJcbiAgICAgIE5hbWU6ICcoPzpbXlxcXFxzOnxdKyg/OiBbXlxcXFxzOnxdKyk/fCknLFxyXG4gICAgICAvLyBGbG9hdHMgY2FuIGhhdmUgY29tbWEgYXMgc2VwYXJhdG9yIGluIEZGWElWIHBsdWdpbiBvdXRwdXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9yYXZhaG4vRkZYSVZfQUNUX1BsdWdpbi9pc3N1ZXMvMTM3XHJcbiAgICAgIEZsb2F0OiAnLT9bMC05XSsoPzpbLixdWzAtOV0rKT8oPzpFLT9bMC05XSspPycsXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFsbCByZWdleGVzIGluIGNhY3Rib3QgYXJlIGNhc2UgaW5zZW5zaXRpdmUuXHJcbiAgICAvLyBUaGlzIGF2b2lkcyBoZWFkYWNoZXMgYXMgdGhpbmdzIGxpa2UgYFZpY2UgYW5kIFZhbml0eWAgdHVybnMgaW50b1xyXG4gICAgLy8gYFZpY2UgQW5kIFZhbml0eWAsIGVzcGVjaWFsbHkgZm9yIEZyZW5jaCBhbmQgR2VybWFuLiAgSXQgYXBwZWFycyB0b1xyXG4gICAgLy8gaGF2ZSBhIH4yMCUgcmVnZXggcGFyc2luZyBvdmVyaGVhZCwgYnV0IGF0IGxlYXN0IHRoZXkgd29yay5cclxuICAgIGxldCBtb2RpZmllcnMgPSAnaSc7XHJcbiAgICBpZiAocmVnZXhwU3RyaW5nIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcbiAgICAgIG1vZGlmaWVycyArPSAocmVnZXhwU3RyaW5nLmdsb2JhbCA/ICdnJyA6ICcnKSArXHJcbiAgICAgICAgKHJlZ2V4cFN0cmluZy5tdWx0aWxpbmUgPyAnbScgOiAnJyk7XHJcbiAgICAgIHJlZ2V4cFN0cmluZyA9IHJlZ2V4cFN0cmluZy5zb3VyY2U7XHJcbiAgICB9XHJcbiAgICByZWdleHBTdHJpbmcgPSByZWdleHBTdHJpbmcucmVwbGFjZSgvXFxcXHlcXHsoLio/KVxcfS9nLCAobWF0Y2gsIGdyb3VwKSA9PiB7XHJcbiAgICAgIHJldHVybiBrQ2FjdGJvdENhdGVnb3JpZXNbZ3JvdXAgYXMga2V5b2YgdHlwZW9mIGtDYWN0Ym90Q2F0ZWdvcmllc10gfHwgbWF0Y2g7XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4cFN0cmluZywgbW9kaWZpZXJzKTtcclxuICB9XHJcblxyXG4gIC8vIExpa2UgUmVnZXguUmVnZXhlcy5wYXJzZSwgYnV0IGZvcmNlIGdsb2JhbCBmbGFnLlxyXG4gIHN0YXRpYyBwYXJzZUdsb2JhbChyZWdleHBTdHJpbmc6IFJlZ0V4cCB8IHN0cmluZyk6IFJlZ0V4cCB7XHJcbiAgICBjb25zdCByZWdleCA9IFJlZ2V4ZXMucGFyc2UocmVnZXhwU3RyaW5nKTtcclxuICAgIGxldCBtb2RpZmllcnMgPSAnZ2knO1xyXG4gICAgaWYgKHJlZ2V4cFN0cmluZyBpbnN0YW5jZW9mIFJlZ0V4cClcclxuICAgICAgbW9kaWZpZXJzICs9IHJlZ2V4cFN0cmluZy5tdWx0aWxpbmUgPyAnbScgOiAnJztcclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LnNvdXJjZSwgbW9kaWZpZXJzKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyB0cnVlSWZVbmRlZmluZWQodmFsdWU/OiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICByZXR1cm4gISF2YWx1ZTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyB2YWxpZGF0ZVBhcmFtcyhcclxuICAgIGY6IFJlYWRvbmx5PHsgW3M6IHN0cmluZ106IHVua25vd24gfT4sXHJcbiAgICBmdW5jTmFtZTogc3RyaW5nLFxyXG4gICAgcGFyYW1zOiBSZWFkb25seTxzdHJpbmdbXT4sXHJcbiAgKTogdm9pZCB7XHJcbiAgICBpZiAoZiA9PT0gbnVsbClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKHR5cGVvZiBmICE9PSAnb2JqZWN0JylcclxuICAgICAgcmV0dXJuO1xyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGYpO1xyXG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xyXG4gICAgICBpZiAoIXBhcmFtcy5pbmNsdWRlcyhrZXkpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgYCR7ZnVuY05hbWV9OiBpbnZhbGlkIHBhcmFtZXRlciAnJHtrZXl9Jy4gIGAgK1xyXG4gICAgICAgICAgICBgVmFsaWQgcGFyYW1zOiAke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9YCxcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IE5ldEZpZWxkcywgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5pbXBvcnQgeyBDYWN0Ym90QmFzZVJlZ0V4cCB9IGZyb20gJy4uL3R5cGVzL25ldF90cmlnZ2VyJztcclxuXHJcbmltcG9ydCB7XHJcbiAgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgbG9nRGVmaW5pdGlvbnNWZXJzaW9ucyxcclxuICBMb2dEZWZpbml0aW9uVmVyc2lvbnMsXHJcbiAgUGFyc2VIZWxwZXJGaWVsZHMsXHJcbiAgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnMsXHJcbiAgUmVwZWF0aW5nRmllbGRzVHlwZXMsXHJcbn0gZnJvbSAnLi9uZXRsb2dfZGVmcyc7XHJcbmltcG9ydCB7IFVucmVhY2hhYmxlQ29kZSB9IGZyb20gJy4vbm90X3JlYWNoZWQnO1xyXG5pbXBvcnQgUmVnZXhlcyBmcm9tICcuL3JlZ2V4ZXMnO1xyXG5cclxuY29uc3Qgc2VwYXJhdG9yID0gJ1xcXFx8JztcclxuY29uc3QgbWF0Y2hEZWZhdWx0ID0gJ1tefF0qJztcclxuXHJcbi8vIElmIE5ldFJlZ2V4ZXMuc2V0RmxhZ1RyYW5zbGF0aW9uc05lZWRlZCBpcyBzZXQgdG8gdHJ1ZSwgdGhlbiBhbnlcclxuLy8gcmVnZXggY3JlYXRlZCB0aGF0IHJlcXVpcmVzIGEgdHJhbnNsYXRpb24gd2lsbCBiZWdpbiB3aXRoIHRoaXMgc3RyaW5nXHJcbi8vIGFuZCBtYXRjaCB0aGUgbWFnaWNTdHJpbmdSZWdleC4gIFRoaXMgaXMgbWF5YmUgYSBiaXQgZ29vZnksIGJ1dCBpc1xyXG4vLyBhIHByZXR0eSBzdHJhaWdodGZvcndhcmQgd2F5IHRvIG1hcmsgcmVnZXhlcyBmb3IgdHJhbnNsYXRpb25zLlxyXG4vLyBJZiBpc3N1ZSAjMTMwNiBpcyBldmVyIHJlc29sdmVkLCB3ZSBjYW4gcmVtb3ZlIHRoaXMuXHJcbmNvbnN0IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgPSBgXl5gO1xyXG5jb25zdCBtYWdpY1N0cmluZ1JlZ2V4ID0gL15cXF5cXF4vO1xyXG5cclxuLy8gY2FuJ3Qgc2ltcGx5IGV4cG9ydCB0aGlzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9wdWxsLzQ5NTcjZGlzY3Vzc2lvbl9yMTAwMjU5MDU4OVxyXG5jb25zdCBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3QgPSBbXHJcbiAgJ2FiaWxpdHknLFxyXG4gICduYW1lJyxcclxuICAnc291cmNlJyxcclxuICAndGFyZ2V0JyxcclxuICAnbGluZScsXHJcbl0gYXMgY29uc3Q7XHJcbmV4cG9ydCBjb25zdCBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbjogcmVhZG9ubHkgc3RyaW5nW10gPSBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3Q7XHJcbmV4cG9ydCB0eXBlIEtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uID0gdHlwZW9mIGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdFtudW1iZXJdO1xyXG5cclxuZXhwb3J0IGNvbnN0IGdhbWVMb2dDb2RlcyA9IHtcclxuICBlY2hvOiAnMDAzOCcsXHJcbiAgZGlhbG9nOiAnMDA0NCcsXHJcbiAgbWVzc2FnZTogJzA4MzknLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLy8gU2VlIGRvY3MvTG9nR3VpZGUubWQgZm9yIG1vcmUgaW5mbyBhYm91dCB0aGVzZSBjYXRlZ29yaWVzXHJcbmV4cG9ydCBjb25zdCBhY3RvckNvbnRyb2xUeXBlID0ge1xyXG4gIHNldEFuaW1TdGF0ZTogJzAwM0UnLFxyXG4gIHB1YmxpY0NvbnRlbnRUZXh0OiAnMDgzNCcsXHJcbiAgbG9nTXNnOiAnMDIwRicsXHJcbiAgbG9nTXNnUGFyYW1zOiAnMDIxMCcsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5jb25zdCBkZWZhdWx0UGFyYW1zID0gPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBWIGV4dGVuZHMgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4+KHR5cGU6IFQsIHZlcnNpb246IFYsIGluY2x1ZGU/OiBzdHJpbmdbXSk6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+ID0+IHtcclxuICBjb25zdCBsb2dUeXBlID0gbG9nRGVmaW5pdGlvbnNWZXJzaW9uc1t2ZXJzaW9uXVt0eXBlXTtcclxuICBpZiAoaW5jbHVkZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpbmNsdWRlID0gT2JqZWN0LmtleXMobG9nVHlwZS5maWVsZHMpO1xyXG4gICAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUpIHtcclxuICAgICAgaW5jbHVkZS5wdXNoKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHBhcmFtczoge1xyXG4gICAgW2luZGV4OiBudW1iZXJdOiB7XHJcbiAgICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICAgIHZhbHVlPzogc3RyaW5nO1xyXG4gICAgICBvcHRpb25hbDogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nPzogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgICAgIHByaW1hcnlLZXk/OiBzdHJpbmc7XHJcbiAgICAgIHBvc3NpYmxlS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICB9ID0ge307XHJcbiAgY29uc3QgZmlyc3RPcHRpb25hbEZpZWxkID0gbG9nVHlwZS5maXJzdE9wdGlvbmFsRmllbGQ7XHJcblxyXG4gIGZvciAoY29uc3QgW3Byb3AsIGluZGV4XSBvZiBPYmplY3QuZW50cmllcyhsb2dUeXBlLmZpZWxkcykpIHtcclxuICAgIGlmICghaW5jbHVkZS5pbmNsdWRlcyhwcm9wKSlcclxuICAgICAgY29udGludWU7XHJcbiAgICBjb25zdCBwYXJhbTogeyBmaWVsZDogc3RyaW5nOyB2YWx1ZT86IHN0cmluZzsgb3B0aW9uYWw6IGJvb2xlYW47IHJlcGVhdGluZz86IGJvb2xlYW4gfSA9IHtcclxuICAgICAgZmllbGQ6IHByb3AsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJiBpbmRleCA+PSBmaXJzdE9wdGlvbmFsRmllbGQsXHJcbiAgICB9O1xyXG4gICAgaWYgKHByb3AgPT09ICd0eXBlJylcclxuICAgICAgcGFyYW0udmFsdWUgPSBsb2dUeXBlLnR5cGU7XHJcblxyXG4gICAgcGFyYW1zW2luZGV4XSA9IHBhcmFtO1xyXG4gIH1cclxuXHJcbiAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUgJiYgaW5jbHVkZS5pbmNsdWRlcyhsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCkpIHtcclxuICAgIHBhcmFtc1tsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4XSA9IHtcclxuICAgICAgZmllbGQ6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsLFxyXG4gICAgICBvcHRpb25hbDogZmlyc3RPcHRpb25hbEZpZWxkICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgICAgcmVwZWF0aW5nOiB0cnVlLFxyXG4gICAgICByZXBlYXRpbmdLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubmFtZXNdLFxyXG4gICAgICBzb3J0S2V5czogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc29ydEtleXMsXHJcbiAgICAgIHByaW1hcnlLZXk6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnByaW1hcnlLZXksXHJcbiAgICAgIHBvc3NpYmxlS2V5czogWy4uLmxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnBvc3NpYmxlS2V5c10sXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBhcmFtcyBhcyBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PjtcclxufTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSB7XHJcbiAgW25hbWUgaW4gUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWyduYW1lcyddW251bWJlcl1dOlxyXG4gICAgfCBzdHJpbmdcclxuICAgIHwgc3RyaW5nW107XHJcbn1bXTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRiBleHRlbmRzIGtleW9mIE5ldEZpZWxkc1tUQmFzZV0sXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSBGIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWydsYWJlbCddXHJcbiAgPyBSZXBlYXRpbmdGaWVsZHNNYXA8VEtleT4gOlxyXG4gIG5ldmVyO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RdLFxyXG4+ID0gVCBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFQsIEY+XHJcbiAgOiBuZXZlcjtcclxuXHJcbnR5cGUgUGFyc2VIZWxwZXJUeXBlPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPVxyXG4gICYge1xyXG4gICAgW2ZpZWxkIGluIGtleW9mIE5ldEZpZWxkc1tUXV0/OiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8VCwgZmllbGQ+O1xyXG4gIH1cclxuICAmIHsgY2FwdHVyZT86IGJvb2xlYW4gfTtcclxuXHJcbmNvbnN0IGlzUmVwZWF0aW5nRmllbGQgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4+KFxyXG4gIHJlcGVhdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCxcclxuICB2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQsXHJcbik6IHZhbHVlIGlzIFJlcGVhdGluZ0ZpZWxkc01hcDxUPiA9PiB7XHJcbiAgaWYgKHJlcGVhdGluZyAhPT0gdHJ1ZSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuICAvLyBBbGxvdyBleGNsdWRpbmcgdGhlIGZpZWxkIHRvIG1hdGNoIGZvciBleHRyYWN0aW9uXHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIGZvciAoY29uc3QgZSBvZiB2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBlICE9PSAnb2JqZWN0JylcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbmNvbnN0IHBhcnNlSGVscGVyID0gPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4oXHJcbiAgcGFyYW1zOiBQYXJzZUhlbHBlclR5cGU8VD4gfCB1bmRlZmluZWQsXHJcbiAgZnVuY05hbWU6IHN0cmluZyxcclxuICBmaWVsZHM6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+LFxyXG4pOiBDYWN0Ym90QmFzZVJlZ0V4cDxUPiA9PiB7XHJcbiAgcGFyYW1zID0gcGFyYW1zID8/IHt9O1xyXG4gIGNvbnN0IHZhbGlkRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuICBmb3IgKGNvbnN0IGluZGV4IGluIGZpZWxkcykge1xyXG4gICAgY29uc3QgZmllbGQgPSBmaWVsZHNbaW5kZXhdO1xyXG4gICAgaWYgKGZpZWxkKVxyXG4gICAgICB2YWxpZEZpZWxkcy5wdXNoKGZpZWxkLmZpZWxkKTtcclxuICB9XHJcblxyXG4gIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMocGFyYW1zLCBmdW5jTmFtZSwgWydjYXB0dXJlJywgLi4udmFsaWRGaWVsZHNdKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbGFzdCBrZXkgd2UgY2FyZSBhYm91dCwgc28gd2UgY2FuIHNob3J0ZW4gdGhlIHJlZ2V4IGlmIG5lZWRlZC5cclxuICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQocGFyYW1zLmNhcHR1cmUpO1xyXG4gIGNvbnN0IGZpZWxkS2V5cyA9IE9iamVjdC5rZXlzKGZpZWxkcykuc29ydCgoYSwgYikgPT4gcGFyc2VJbnQoYSkgLSBwYXJzZUludChiKSk7XHJcbiAgbGV0IG1heEtleVN0cjogc3RyaW5nO1xyXG4gIGlmIChjYXB0dXJlKSB7XHJcbiAgICBjb25zdCBrZXlzOiBFeHRyYWN0PGtleW9mIE5ldEZpZWxkc1JldmVyc2VbVF0sIHN0cmluZz5bXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKVxyXG4gICAgICBrZXlzLnB1c2goa2V5KTtcclxuICAgIGxldCB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgaWYgKHRtcEtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG1heEtleVN0ciA9IGZpZWxkS2V5c1tmaWVsZEtleXMubGVuZ3RoIC0gMV0gPz8gJzAnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUgKFxyXG4gICAgICAgIGZpZWxkc1t0bXBLZXldPy5vcHRpb25hbCAmJlxyXG4gICAgICAgICEoKGZpZWxkc1t0bXBLZXldPy5maWVsZCA/PyAnJykgaW4gcGFyYW1zKVxyXG4gICAgICApXHJcbiAgICAgICAgdG1wS2V5ID0ga2V5cy5wb3AoKTtcclxuICAgICAgbWF4S2V5U3RyID0gdG1wS2V5ID8/ICcwJztcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgbWF4S2V5U3RyID0gJzAnO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZmllbGRzW2tleV0gPz8ge307XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZHNba2V5XT8uZmllbGQ7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZE5hbWUgaW4gcGFyYW1zKVxyXG4gICAgICAgIG1heEtleVN0ciA9IGtleTtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgbWF4S2V5ID0gcGFyc2VJbnQobWF4S2V5U3RyKTtcclxuXHJcbiAgLy8gRm9yIHRlc3RpbmcsIGl0J3MgdXNlZnVsIHRvIGtub3cgaWYgdGhpcyBpcyBhIHJlZ2V4IHRoYXQgcmVxdWlyZXNcclxuICAvLyB0cmFuc2xhdGlvbi4gIFdlIHRlc3QgdGhpcyBieSBzZWVpbmcgaWYgdGhlcmUgYXJlIGFueSBzcGVjaWZpZWRcclxuICAvLyBmaWVsZHMsIGFuZCBpZiBzbywgaW5zZXJ0aW5nIGEgbWFnaWMgc3RyaW5nIHRoYXQgd2UgY2FuIGRldGVjdC5cclxuICAvLyBUaGlzIGxldHMgdXMgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIFwicmVnZXggdGhhdCBzaG91bGQgYmUgdHJhbnNsYXRlZFwiXHJcbiAgLy8gZS5nLiBhIHJlZ2V4IHdpdGggYHRhcmdldGAgc3BlY2lmaWVkLCBhbmQgXCJyZWdleCB0aGF0IHNob3VsZG4ndFwiXHJcbiAgLy8gZS5nLiBhIGdhaW5zIGVmZmVjdCB3aXRoIGp1c3QgZWZmZWN0SWQgc3BlY2lmaWVkLlxyXG4gIGNvbnN0IHRyYW5zUGFyYW1zID0gT2JqZWN0LmtleXMocGFyYW1zKS5maWx0ZXIoKGspID0+IGtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uLmluY2x1ZGVzKGspKTtcclxuICBjb25zdCBuZWVkc1RyYW5zbGF0aW9ucyA9IE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCAmJiB0cmFuc1BhcmFtcy5sZW5ndGggPiAwO1xyXG5cclxuICAvLyBCdWlsZCB0aGUgcmVnZXggZnJvbSB0aGUgZmllbGRzLlxyXG4gIGxldCBzdHIgPSBuZWVkc1RyYW5zbGF0aW9ucyA/IG1hZ2ljVHJhbnNsYXRpb25TdHJpbmcgOiAnXic7XHJcbiAgbGV0IGxhc3RLZXkgPSAtMTtcclxuICBmb3IgKGNvbnN0IGtleVN0ciBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IGtleSA9IHBhcnNlSW50KGtleVN0cik7XHJcbiAgICAvLyBGaWxsIGluIGJsYW5rcy5cclxuICAgIGNvbnN0IG1pc3NpbmdGaWVsZHMgPSBrZXkgLSBsYXN0S2V5IC0gMTtcclxuICAgIGlmIChtaXNzaW5nRmllbGRzID09PSAxKVxyXG4gICAgICBzdHIgKz0gJ1xcXFx5e05ldEZpZWxkfSc7XHJcbiAgICBlbHNlIGlmIChtaXNzaW5nRmllbGRzID4gMSlcclxuICAgICAgc3RyICs9IGBcXFxceXtOZXRGaWVsZH17JHttaXNzaW5nRmllbGRzfX1gO1xyXG4gICAgbGFzdEtleSA9IGtleTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZSA9IGZpZWxkc1trZXlTdHJdO1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtmdW5jTmFtZX06IGludmFsaWQgdmFsdWU6ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xyXG5cclxuICAgIGNvbnN0IGZpZWxkTmFtZSA9IHZhbHVlLmZpZWxkO1xyXG4gICAgY29uc3QgZGVmYXVsdEZpZWxkVmFsdWUgPSB2YWx1ZS52YWx1ZT8udG9TdHJpbmcoKSA/PyBtYXRjaERlZmF1bHQ7XHJcbiAgICBjb25zdCBmaWVsZFZhbHVlID0gcGFyYW1zW2ZpZWxkTmFtZV07XHJcblxyXG4gICAgaWYgKGlzUmVwZWF0aW5nRmllbGQoZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZywgZmllbGRWYWx1ZSkpIHtcclxuICAgICAgbGV0IHJlcGVhdGluZ0FycmF5OiBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQgPSBmaWVsZFZhbHVlO1xyXG5cclxuICAgICAgY29uc3Qgc29ydEtleXMgPSBmaWVsZHNba2V5U3RyXT8uc29ydEtleXM7XHJcbiAgICAgIGNvbnN0IHByaW1hcnlLZXkgPSBmaWVsZHNba2V5U3RyXT8ucHJpbWFyeUtleTtcclxuICAgICAgY29uc3QgcG9zc2libGVLZXlzID0gZmllbGRzW2tleVN0cl0/LnBvc3NpYmxlS2V5cztcclxuXHJcbiAgICAgIC8vIHByaW1hcnlLZXkgaXMgcmVxdWlyZWQgaWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBwZXIgdHlwZWRlZiBpbiBuZXRsb2dfZGVmcy50c1xyXG4gICAgICAvLyBTYW1lIHdpdGggcG9zc2libGVLZXlzXHJcbiAgICAgIGlmIChwcmltYXJ5S2V5ID09PSB1bmRlZmluZWQgfHwgcG9zc2libGVLZXlzID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgdGhyb3cgbmV3IFVucmVhY2hhYmxlQ29kZSgpO1xyXG5cclxuICAgICAgLy8gQWxsb3cgc29ydGluZyBpZiBuZWVkZWRcclxuICAgICAgaWYgKHNvcnRLZXlzKSB7XHJcbiAgICAgICAgLy8gQWxzbyBzb3J0IG91ciB2YWxpZCBrZXlzIGxpc3RcclxuICAgICAgICBwb3NzaWJsZUtleXMuc29ydCgobGVmdCwgcmlnaHQpID0+IGxlZnQudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0LnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICBpZiAocmVwZWF0aW5nQXJyYXkgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgcmVwZWF0aW5nQXJyYXkgPSBbLi4ucmVwZWF0aW5nQXJyYXldLnNvcnQoXHJcbiAgICAgICAgICAgIChsZWZ0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcmlnaHQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogbnVtYmVyID0+IHtcclxuICAgICAgICAgICAgICAvLyBXZSBjaGVjayB0aGUgdmFsaWRpdHkgb2YgbGVmdC9yaWdodCBiZWNhdXNlIHRoZXkncmUgdXNlci1zdXBwbGllZFxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdCAhPT0gJ29iamVjdCcgfHwgbGVmdFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgbGVmdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgbGVmdFZhbHVlID0gbGVmdFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMobGVmdFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHQgIT09ICdvYmplY3QnIHx8IHJpZ2h0W3ByaW1hcnlLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgY29uc3QgcmlnaHRWYWx1ZSA9IHJpZ2h0W3ByaW1hcnlLZXldO1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcmlnaHRWYWx1ZSAhPT0gJ3N0cmluZycgfHwgIXBvc3NpYmxlS2V5cz8uaW5jbHVkZXMocmlnaHRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCByaWdodCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGxlZnRWYWx1ZS50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUocmlnaHRWYWx1ZS50b0xvd2VyQ2FzZSgpKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbm9uUmVwczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIHwgc3RyaW5nW10gfVtdIHwgdW5kZWZpbmVkID0gcmVwZWF0aW5nQXJyYXk7XHJcbiAgICAgIC8vIExvb3Agb3ZlciBvdXIgcG9zc2libGUga2V5c1xyXG4gICAgICAvLyBCdWlsZCBhIHJlZ2V4IHRoYXQgY2FuIG1hdGNoIGFueSBwb3NzaWJsZSBrZXkgd2l0aCByZXF1aXJlZCB2YWx1ZXMgc3Vic3RpdHV0ZWQgaW5cclxuICAgICAgcG9zc2libGVLZXlzLmZvckVhY2goKHBvc3NpYmxlS2V5KSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVwID0gYW5vblJlcHM/LmZpbmQoKHJlcCkgPT4gcHJpbWFyeUtleSBpbiByZXAgJiYgcmVwW3ByaW1hcnlLZXldID09PSBwb3NzaWJsZUtleSk7XHJcblxyXG4gICAgICAgIGxldCBmaWVsZFJlZ2V4ID0gJyc7XHJcbiAgICAgICAgLy8gUmF0aGVyIHRoYW4gbG9vcGluZyBvdmVyIHRoZSBrZXlzIGRlZmluZWQgb24gdGhlIG9iamVjdCxcclxuICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGJhc2UgdHlwZSBkZWYncyBrZXlzLiBUaGlzIGVuZm9yY2VzIHRoZSBjb3JyZWN0IG9yZGVyLlxyXG4gICAgICAgIGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmdLZXlzPy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgICAgIGxldCB2YWwgPSByZXA/LltrZXldO1xyXG4gICAgICAgICAgaWYgKHJlcCA9PT0gdW5kZWZpbmVkIHx8ICEoa2V5IGluIHJlcCkpIHtcclxuICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZhbHVlIGZvciB0aGlzIGtleVxyXG4gICAgICAgICAgICAvLyBpbnNlcnQgYSBwbGFjZWhvbGRlciwgdW5sZXNzIGl0J3MgdGhlIHByaW1hcnkga2V5XHJcbiAgICAgICAgICAgIGlmIChrZXkgPT09IHByaW1hcnlLZXkpXHJcbiAgICAgICAgICAgICAgdmFsID0gcG9zc2libGVLZXk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbCkpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwubGVuZ3RoIDwgMSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbC5zb21lKCh2KSA9PiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpZWxkUmVnZXggKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAgIGtleSA9PT0gcHJpbWFyeUtleSA/IGZhbHNlIDogY2FwdHVyZSxcclxuICAgICAgICAgICAgLy8gQWxsIGNhcHR1cmluZyBncm91cHMgYXJlIGBmaWVsZE5hbWVgICsgYHBvc3NpYmxlS2V5YCwgZS5nLiBgcGFpcklzQ2FzdGluZzFgXHJcbiAgICAgICAgICAgIGZpZWxkTmFtZSArIHBvc3NpYmxlS2V5LFxyXG4gICAgICAgICAgICB2YWwsXHJcbiAgICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICAgKSArXHJcbiAgICAgICAgICAgIHNlcGFyYXRvcjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGZpZWxkUmVnZXgubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgc3RyICs9IGAoPzoke2ZpZWxkUmVnZXh9KSR7cmVwICE9PSB1bmRlZmluZWQgPyAnJyA6ICc/J31gO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmcpIHtcclxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHJlcGVhdGluZyBmaWVsZCBidXQgdGhlIGFjdHVhbCB2YWx1ZSBpcyBlbXB0eSBvciBvdGhlcndpc2UgaW52YWxpZCxcclxuICAgICAgLy8gZG9uJ3QgcHJvY2VzcyBmdXJ0aGVyLiBXZSBjYW4ndCB1c2UgYGNvbnRpbnVlYCBpbiB0aGUgYWJvdmUgYmxvY2sgYmVjYXVzZSB0aGF0XHJcbiAgICAgIC8vIHdvdWxkIHNraXAgdGhlIGVhcmx5LW91dCBicmVhayBhdCB0aGUgZW5kIG9mIHRoZSBsb29wLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKGZpZWxkTmFtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc3RyICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgLy8gbW9yZSBhY2N1cmF0ZSB0eXBlIGluc3RlYWQgb2YgYGFzYCBjYXN0XHJcbiAgICAgICAgICAvLyBtYXliZSB0aGlzIGZ1bmN0aW9uIG5lZWRzIGEgcmVmYWN0b3JpbmdcclxuICAgICAgICAgIGNhcHR1cmUsXHJcbiAgICAgICAgICBmaWVsZE5hbWUsXHJcbiAgICAgICAgICBmaWVsZFZhbHVlLFxyXG4gICAgICAgICAgZGVmYXVsdEZpZWxkVmFsdWUsXHJcbiAgICAgICAgKSArXHJcbiAgICAgICAgICBzZXBhcmF0b3I7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc3RyICs9IGRlZmF1bHRGaWVsZFZhbHVlICsgc2VwYXJhdG9yO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RvcCBpZiB3ZSdyZSBub3QgY2FwdHVyaW5nIGFuZCBkb24ndCBjYXJlIGFib3V0IGZ1dHVyZSBmaWVsZHMuXHJcbiAgICBpZiAoa2V5ID49IG1heEtleSlcclxuICAgICAgYnJlYWs7XHJcbiAgfVxyXG4gIHJldHVybiBSZWdleGVzLnBhcnNlKHN0cikgYXMgQ2FjdGJvdEJhc2VSZWdFeHA8VD47XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgYnVpbGRSZWdleCA9IDxUIGV4dGVuZHMga2V5b2YgTmV0UGFyYW1zPihcclxuICB0eXBlOiBULFxyXG4gIHBhcmFtcz86IFBhcnNlSGVscGVyVHlwZTxUPixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHJldHVybiBwYXJzZUhlbHBlcihwYXJhbXMsIHR5cGUsIGRlZmF1bHRQYXJhbXModHlwZSwgTmV0UmVnZXhlcy5sb2dWZXJzaW9uKSk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOZXRSZWdleGVzIHtcclxuICBzdGF0aWMgbG9nVmVyc2lvbjogTG9nRGVmaW5pdGlvblZlcnNpb25zID0gJ2xhdGVzdCc7XHJcblxyXG4gIHN0YXRpYyBmbGFnVHJhbnNsYXRpb25zTmVlZGVkID0gZmFsc2U7XHJcbiAgc3RhdGljIHNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWQodmFsdWU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIE5ldFJlZ2V4ZXMuZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCA9IHZhbHVlO1xyXG4gIH1cclxuICBzdGF0aWMgZG9lc05ldFJlZ2V4TmVlZFRyYW5zbGF0aW9uKHJlZ2V4OiBSZWdFeHAgfCBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIC8vIE5lZWQgdG8gYHNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWRgIGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXHJcbiAgICBjb25zb2xlLmFzc2VydChOZXRSZWdleGVzLmZsYWdUcmFuc2xhdGlvbnNOZWVkZWQpO1xyXG4gICAgY29uc3Qgc3RyID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IHJlZ2V4IDogcmVnZXguc291cmNlO1xyXG4gICAgcmV0dXJuICEhbWFnaWNTdHJpbmdSZWdleC5leGVjKHN0cik7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjAtMHgxNC1uZXR3b3Jrc3RhcnRzY2FzdGluZ1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ1N0YXJ0c1VzaW5nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhcnRzVXNpbmcnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmcnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5KHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCAnQWJpbGl0eScsIHtcclxuICAgICAgLi4uZGVmYXVsdFBhcmFtcygnQWJpbGl0eScsIE5ldFJlZ2V4ZXMubG9nVmVyc2lvbiksXHJcbiAgICAgIC8vIE92ZXJyaWRlIHR5cGVcclxuICAgICAgMDogeyBmaWVsZDogJ3R5cGUnLCB2YWx1ZTogJzJbMTJdJywgb3B0aW9uYWw6IGZhbHNlIH0sXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMS0weDE1LW5ldHdvcmthYmlsaXR5XHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIyLTB4MTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKlxyXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgYWJpbGl0eWAgaW5zdGVhZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RnVsbChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHknXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5Jz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYWJpbGl0eShwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3LTB4MWItbmV0d29ya3RhcmdldGljb24taGVhZC1tYXJrZXJcclxuICAgKi9cclxuICBzdGF0aWMgaGVhZE1hcmtlcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0hlYWRNYXJrZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdIZWFkTWFya2VyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0hlYWRNYXJrZXInLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICovXHJcbiAgc3RhdGljIGFkZGVkQ29tYmF0YW50KHBhcmFtcz86IE5ldFBhcmFtc1snQWRkZWRDb21iYXRhbnQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBZGRlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBwYXJzZUhlbHBlcihcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnQWRkZWRDb21iYXRhbnQnLFxyXG4gICAgICBkZWZhdWx0UGFyYW1zKCdBZGRlZENvbWJhdGFudCcsIE5ldFJlZ2V4ZXMubG9nVmVyc2lvbiksXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAzLTB4MDMtYWRkY29tYmF0YW50XHJcbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBhZGRlZENvbWJhdGFudGAgaW5zdGVhZFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudEZ1bGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FkZGVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuYWRkZWRDb21iYXRhbnQocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wNC0weDA0LXJlbW92ZWNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmluZ0NvbWJhdGFudChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snUmVtb3ZlZENvbWJhdGFudCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdSZW1vdmVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1JlbW92ZWRDb21iYXRhbnQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2LTB4MWEtbmV0d29ya2J1ZmZcclxuICAgKi9cclxuICBzdGF0aWMgZ2FpbnNFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydHYWluc0VmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhaW5zRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0dhaW5zRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZWZlciBnYWluc0VmZmVjdCBvdmVyIHRoaXMgZnVuY3Rpb24gdW5sZXNzIHlvdSByZWFsbHkgbmVlZCBleHRyYSBkYXRhLlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zOC0weDI2LW5ldHdvcmtzdGF0dXNlZmZlY3RzXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXR1c0VmZmVjdEV4cGxpY2l0KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGF0dXNFZmZlY3QnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhdHVzRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXR1c0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzAtMHgxZS1uZXR3b3JrYnVmZnJlbW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsb3Nlc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0xvc2VzRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTG9zZXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTG9zZXNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM1LTB4MjMtbmV0d29ya3RldGhlclxyXG4gICAqL1xyXG4gIHN0YXRpYyB0ZXRoZXIocGFyYW1zPzogTmV0UGFyYW1zWydUZXRoZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdUZXRoZXInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnVGV0aGVyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICd0YXJnZXQnIHdhcyBkZWZlYXRlZCBieSAnc291cmNlJ1xyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNS0weDE5LW5ldHdvcmtkZWF0aFxyXG4gICAqL1xyXG4gIHN0YXRpYyB3YXNEZWZlYXRlZChwYXJhbXM/OiBOZXRQYXJhbXNbJ1dhc0RlZmVhdGVkJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnV2FzRGVmZWF0ZWQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnV2FzRGVmZWF0ZWQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI0LTB4MTgtbmV0d29ya2RvdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrRG9UKHBhcmFtcz86IE5ldFBhcmFtc1snTmV0d29ya0RvVCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05ldHdvcmtEb1QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTmV0d29ya0RvVCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGVjaG8ocGFyYW1zPzogT21pdDxOZXRQYXJhbXNbJ0dhbWVMb2cnXSwgJ2NvZGUnPik6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ0VjaG8nLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyh7IC4uLnBhcmFtcywgY29kZTogZ2FtZUxvZ0NvZGVzLmVjaG8gfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGRpYWxvZyhwYXJhbXM/OiBPbWl0PE5ldFBhcmFtc1snR2FtZUxvZyddLCAnY29kZSc+KTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnRGlhbG9nJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2coeyAuLi5wYXJhbXMsIGNvZGU6IGdhbWVMb2dDb2Rlcy5kaWFsb2cgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIG1lc3NhZ2UocGFyYW1zPzogT21pdDxOZXRQYXJhbXNbJ0dhbWVMb2cnXSwgJ2NvZGUnPik6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ01lc3NhZ2UnLFxyXG4gICAgICBbJ3R5cGUnLCAndGltZXN0YW1wJywgJ2NvZGUnLCAnbmFtZScsICdsaW5lJywgJ2NhcHR1cmUnXSxcclxuICAgICk7XHJcblxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyh7IC4uLnBhcmFtcywgY29kZTogZ2FtZUxvZ0NvZGVzLm1lc3NhZ2UgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBmaWVsZHM6IGNvZGUsIG5hbWUsIGxpbmUsIGNhcHR1cmVcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYW1lTG9nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMC0weDAwLWxvZ2xpbmVcclxuICAgKi9cclxuICBzdGF0aWMgZ2FtZU5hbWVMb2cocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRhYmlsaXR5LlxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTEyLTB4MGMtcGxheWVyc3RhdHNcclxuICAgKi9cclxuICBzdGF0aWMgc3RhdENoYW5nZShwYXJhbXM/OiBOZXRQYXJhbXNbJ1BsYXllclN0YXRzJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUGxheWVyU3RhdHMnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnUGxheWVyU3RhdHMnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAxLTB4MDEtY2hhbmdlem9uZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjaGFuZ2Vab25lKHBhcmFtcz86IE5ldFBhcmFtc1snQ2hhbmdlWm9uZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NoYW5nZVpvbmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ2hhbmdlWm9uZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzMtMHgyMS1uZXR3b3JrNmQtYWN0b3ItY29udHJvbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrNmQocGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2wnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2wnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNC0weDIyLW5ldHdvcmtuYW1ldG9nZ2xlXHJcbiAgICovXHJcbiAgc3RhdGljIG5hbWVUb2dnbGUocGFyYW1zPzogTmV0UGFyYW1zWydOYW1lVG9nZ2xlJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTmFtZVRvZ2dsZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOYW1lVG9nZ2xlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MC0weDI4LW1hcFxyXG4gICAqL1xyXG4gIHN0YXRpYyBtYXAocGFyYW1zPzogTmV0UGFyYW1zWydNYXAnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdNYXAnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTWFwJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS00MS0weDI5LXN5c3RlbWxvZ21lc3NhZ2VcclxuICAgKi9cclxuICBzdGF0aWMgc3lzdGVtTG9nTWVzc2FnZShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3lzdGVtTG9nTWVzc2FnZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTeXN0ZW1Mb2dNZXNzYWdlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N5c3RlbUxvZ01lc3NhZ2UnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1Ny0weDEwMS1tYXBlZmZlY3RcclxuICAgKi9cclxuICBzdGF0aWMgbWFwRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snTWFwRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcEVmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU4LTB4MTAyLWZhdGVkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBmYXRlRGlyZWN0b3IocGFyYW1zPzogTmV0UGFyYW1zWydGYXRlRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdGYXRlRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnRmF0ZURpcmVjdG9yJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTktMHgxMDMtY2VkaXJlY3RvclxyXG4gICAqL1xyXG4gIHN0YXRpYyBjZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snQ0VEaXJlY3RvciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NFRGlyZWN0b3InPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ0VEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYwLTB4MTA0LWluY29tYmF0XHJcbiAgICovXHJcbiAgc3RhdGljIGluQ29tYmF0KHBhcmFtcz86IE5ldFBhcmFtc1snSW5Db21iYXQnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdJbkNvbWJhdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdJbkNvbWJhdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYxLTB4MTA1LWNvbWJhdGFudG1lbW9yeVxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb21iYXRhbnRNZW1vcnkoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbWJhdGFudE1lbW9yeSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb21iYXRhbnRNZW1vcnknPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29tYmF0YW50TWVtb3J5JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjMtMHgxMDctc3RhcnRzdXNpbmdleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGFydHNVc2luZ0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZ0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3RhcnRzVXNpbmdFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY0LTB4MTA4LWFiaWxpdHlleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhYmlsaXR5RXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHlFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5RXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWJpbGl0eUV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjUtMHgxMDktY29udGVudGZpbmRlcnNldHRpbmdzXHJcbiAgICovXHJcbiAgc3RhdGljIGNvbnRlbnRGaW5kZXJTZXR0aW5ncyhcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ29udGVudEZpbmRlclNldHRpbmdzJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvbnRlbnRGaW5kZXJTZXR0aW5ncyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb250ZW50RmluZGVyU2V0dGluZ3MnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2Ni0weDEwYS1ucGN5ZWxsXHJcbiAgICovXHJcbiAgc3RhdGljIG5wY1llbGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ05wY1llbGwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTnBjWWVsbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdOcGNZZWxsJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjctMHgxMGItYmF0dGxldGFsazJcclxuICAgKi9cclxuICBzdGF0aWMgYmF0dGxlVGFsazIoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0JhdHRsZVRhbGsyJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0JhdHRsZVRhbGsyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0JhdHRsZVRhbGsyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjgtMHgxMGMtY291bnRkb3duXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bihcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd24nLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2OS0weDEwZC1jb3VudGRvd25jYW5jZWxcclxuICAgKi9cclxuICBzdGF0aWMgY291bnRkb3duQ2FuY2VsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb3VudGRvd25DYW5jZWwnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ291bnRkb3duQ2FuY2VsJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvdW50ZG93bkNhbmNlbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcwLTB4MTBlLWFjdG9ybW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3Rvck1vdmUoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yTW92ZSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3Rvck1vdmUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JNb3ZlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzEtMHgxMGYtYWN0b3JzZXRwb3NcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JTZXRQb3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yU2V0UG9zJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FjdG9yU2V0UG9zJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yU2V0UG9zJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNzItMHgxMTAtc3Bhd25ucGNleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBzcGF3bk5wY0V4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTcGF3bk5wY0V4dHJhJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1NwYXduTnBjRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnU3Bhd25OcGNFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjczLTB4MTExLWFjdG9yY29udHJvbGV4dHJhXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yQ29udHJvbEV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xFeHRyYSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvckNvbnRyb2xFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjc0LTB4MTEyLWFjdG9yY29udHJvbHNlbGZleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xTZWxmRXh0cmEoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FjdG9yQ29udHJvbFNlbGZFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvckNvbnRyb2xTZWxmRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sU2VsZkV4dHJhJywgcGFyYW1zKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBjb21tb25OZXRSZWdleCA9IHtcclxuICAvLyBUT0RPKDYuMik6IHJlbW92ZSA0MDAwMDAxMCBhZnRlciBldmVyeWJvZHkgaXMgb24gNi4yLlxyXG4gIC8vIFRPRE86IG9yIG1heWJlIGtlZXAgYXJvdW5kIGZvciBwbGF5aW5nIG9sZCBsb2cgZmlsZXM/P1xyXG4gIHdpcGU6IE5ldFJlZ2V4ZXMubmV0d29yazZkKHsgY29tbWFuZDogWyc0MDAwMDAxMCcsICc0MDAwMDAwRiddIH0pLFxyXG4gIGNhY3Rib3RXaXBlRWNobzogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ2NhY3Rib3Qgd2lwZS4qPycgfSksXHJcbiAgdXNlcldpcGVFY2hvOiBOZXRSZWdleGVzLmVjaG8oeyBsaW5lOiAnZW5kJyB9KSxcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCBjb25zdCBidWlsZE5ldFJlZ2V4Rm9yVHJpZ2dlciA9IDxUIGV4dGVuZHMga2V5b2YgTmV0UGFyYW1zPihcclxuICB0eXBlOiBULFxyXG4gIHBhcmFtcz86IE5ldFBhcmFtc1tUXSxcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIGlmICh0eXBlID09PSAnQWJpbGl0eScpXHJcbiAgICAvLyB0cyBjYW4ndCBuYXJyb3cgVCB0byBgQWJpbGl0eWAgaGVyZSwgbmVlZCBjYXN0aW5nLlxyXG4gICAgcmV0dXJuIE5ldFJlZ2V4ZXMuYWJpbGl0eShwYXJhbXMpIGFzIENhY3Rib3RCYXNlUmVnRXhwPFQ+O1xyXG5cclxuICByZXR1cm4gYnVpbGRSZWdleDxUPih0eXBlLCBwYXJhbXMpO1xyXG59O1xyXG4iLCIvLyBPdmVybGF5UGx1Z2luIEFQSSBzZXR1cFxyXG5cclxuaW1wb3J0IHtcclxuICBFdmVudE1hcCxcclxuICBFdmVudFR5cGUsXHJcbiAgSU92ZXJsYXlIYW5kbGVyLFxyXG4gIE92ZXJsYXlIYW5kbGVyRnVuY3MsXHJcbiAgT3ZlcmxheUhhbmRsZXJUeXBlcyxcclxufSBmcm9tICcuLi90eXBlcy9ldmVudCc7XHJcblxyXG50eXBlIEJhc2VSZXNwb25zZSA9IHsgcnNlcT86IG51bWJlcjsgJyRlcnJvcic/OiBib29sZWFuIH07XHJcblxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XHJcbiAgICBfX092ZXJsYXlDYWxsYmFjazogRXZlbnRNYXBbRXZlbnRUeXBlXTtcclxuICAgIGRpc3BhdGNoT3ZlcmxheUV2ZW50PzogdHlwZW9mIHByb2Nlc3NFdmVudDtcclxuICAgIE92ZXJsYXlQbHVnaW5BcGk6IHtcclxuICAgICAgcmVhZHk6IGJvb2xlYW47XHJcbiAgICAgIGNhbGxIYW5kbGVyOiAobXNnOiBzdHJpbmcsIGNiPzogKHZhbHVlOiBzdHJpbmcpID0+IHVua25vd24pID0+IHZvaWQ7XHJcbiAgICB9O1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEl0IGlzIHJlY29tbWVuZGVkIHRvIGltcG9ydCBmcm9tIHRoaXMgZmlsZTpcclxuICAgICAqXHJcbiAgICAgKiBgaW1wb3J0IHsgYWRkT3ZlcmxheUxpc3RlbmVyIH0gZnJvbSAnL3BhdGgvdG8vb3ZlcmxheV9wbHVnaW5fYXBpJztgXHJcbiAgICAgKi9cclxuICAgIGFkZE92ZXJsYXlMaXN0ZW5lcjogSUFkZE92ZXJsYXlMaXN0ZW5lcjtcclxuICAgIC8qKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBJdCBpcyByZWNvbW1lbmRlZCB0byBpbXBvcnQgZnJvbSB0aGlzIGZpbGU6XHJcbiAgICAgKlxyXG4gICAgICogYGltcG9ydCB7IHJlbW92ZU92ZXJsYXlMaXN0ZW5lciB9IGZyb20gJy9wYXRoL3RvL292ZXJsYXlfcGx1Z2luX2FwaSc7YFxyXG4gICAgICovXHJcbiAgICByZW1vdmVPdmVybGF5TGlzdGVuZXI6IElSZW1vdmVPdmVybGF5TGlzdGVuZXI7XHJcbiAgICAvKipcclxuICAgICAqIEBkZXByZWNhdGVkIFRoaXMgaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgcmVjb21tZW5kZWQgdG8gaW1wb3J0IGZyb20gdGhpcyBmaWxlOlxyXG4gICAgICpcclxuICAgICAqIGBpbXBvcnQgeyBjYWxsT3ZlcmxheUhhbmRsZXIgfSBmcm9tICcvcGF0aC90by9vdmVybGF5X3BsdWdpbl9hcGknO2BcclxuICAgICAqL1xyXG4gICAgY2FsbE92ZXJsYXlIYW5kbGVyOiBJT3ZlcmxheUhhbmRsZXI7XHJcbiAgfVxyXG59XHJcblxyXG50eXBlIElBZGRPdmVybGF5TGlzdGVuZXIgPSA8VCBleHRlbmRzIEV2ZW50VHlwZT4oZXZlbnQ6IFQsIGNiOiBFdmVudE1hcFtUXSkgPT4gdm9pZDtcclxudHlwZSBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KGV2ZW50OiBULCBjYjogRXZlbnRNYXBbVF0pID0+IHZvaWQ7XHJcblxyXG50eXBlIFN1YnNjcmliZXI8VD4gPSB7XHJcbiAgW2tleSBpbiBFdmVudFR5cGVdPzogVFtdO1xyXG59O1xyXG50eXBlIEV2ZW50UGFyYW1ldGVyID0gUGFyYW1ldGVyczxFdmVudE1hcFtFdmVudFR5cGVdPlswXTtcclxudHlwZSBWb2lkRnVuYzxUPiA9ICguLi5hcmdzOiBUW10pID0+IHZvaWQ7XHJcblxyXG5sZXQgaW5pdGVkID0gZmFsc2U7XHJcblxyXG5sZXQgd3NVcmw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5sZXQgd3M6IFdlYlNvY2tldCB8IG51bGwgPSBudWxsO1xyXG5sZXQgcXVldWU6IChcclxuICB8IHsgW3M6IHN0cmluZ106IHVua25vd24gfVxyXG4gIHwgW3sgW3M6IHN0cmluZ106IHVua25vd24gfSwgKCh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdW5rbm93bikgfCB1bmRlZmluZWRdXHJcbilbXSB8IG51bGwgPSBbXTtcclxubGV0IHJzZXFDb3VudGVyID0gMDtcclxudHlwZSBQcm9taXNlRnVuY3MgPSB7XHJcbiAgcmVzb2x2ZTogKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkO1xyXG4gIHJlamVjdDogKHZhbHVlOiB1bmtub3duKSA9PiB2b2lkO1xyXG59O1xyXG5jb25zdCByZXNwb25zZVByb21pc2VzOiB7IFtyc2VxSWR4OiBudW1iZXJdOiBQcm9taXNlRnVuY3MgfSA9IHt9O1xyXG5cclxuY29uc3Qgc3Vic2NyaWJlcnM6IFN1YnNjcmliZXI8Vm9pZEZ1bmM8dW5rbm93bj4+ID0ge307XHJcblxyXG5jb25zdCBzZW5kTWVzc2FnZSA9IChcclxuICBtc2c6IHsgW3M6IHN0cmluZ106IHVua25vd24gfSxcclxuICBjYj86ICh2YWx1ZTogc3RyaW5nIHwgbnVsbCkgPT4gdW5rbm93bixcclxuKTogdm9pZCA9PiB7XHJcbiAgaWYgKHdzKSB7XHJcbiAgICBpZiAocXVldWUpXHJcbiAgICAgIHF1ZXVlLnB1c2gobXNnKTtcclxuICAgIGVsc2VcclxuICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKHF1ZXVlKVxyXG4gICAgICBxdWV1ZS5wdXNoKFttc2csIGNiXSk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHdpbmRvdy5PdmVybGF5UGx1Z2luQXBpLmNhbGxIYW5kbGVyKEpTT04uc3RyaW5naWZ5KG1zZyksIGNiKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBwcm9jZXNzRXZlbnQgPSA8VCBleHRlbmRzIEV2ZW50VHlwZT4obXNnOiBQYXJhbWV0ZXJzPEV2ZW50TWFwW1RdPlswXSk6IHZvaWQgPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgY29uc3Qgc3VicyA9IHN1YnNjcmliZXJzW21zZy50eXBlXTtcclxuICBzdWJzPy5mb3JFYWNoKChzdWIpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN1Yihtc2cpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGRpc3BhdGNoT3ZlcmxheUV2ZW50ID0gcHJvY2Vzc0V2ZW50O1xyXG5cclxuZXhwb3J0IGNvbnN0IGFkZE92ZXJsYXlMaXN0ZW5lcjogSUFkZE92ZXJsYXlMaXN0ZW5lciA9IChldmVudCwgY2IpOiB2b2lkID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGlmICghc3Vic2NyaWJlcnNbZXZlbnRdKSB7XHJcbiAgICBzdWJzY3JpYmVyc1tldmVudF0gPSBbXTtcclxuXHJcbiAgICBpZiAoIXF1ZXVlKSB7XHJcbiAgICAgIHNlbmRNZXNzYWdlKHtcclxuICAgICAgICBjYWxsOiAnc3Vic2NyaWJlJyxcclxuICAgICAgICBldmVudHM6IFtldmVudF0sXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3Vic2NyaWJlcnNbZXZlbnRdPy5wdXNoKGNiIGFzIFZvaWRGdW5jPHVua25vd24+KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCByZW1vdmVPdmVybGF5TGlzdGVuZXI6IElSZW1vdmVPdmVybGF5TGlzdGVuZXIgPSAoZXZlbnQsIGNiKTogdm9pZCA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICBpZiAoc3Vic2NyaWJlcnNbZXZlbnRdKSB7XHJcbiAgICBjb25zdCBsaXN0ID0gc3Vic2NyaWJlcnNbZXZlbnRdO1xyXG4gICAgY29uc3QgcG9zID0gbGlzdD8uaW5kZXhPZihjYiBhcyBWb2lkRnVuYzx1bmtub3duPik7XHJcblxyXG4gICAgaWYgKHBvcyAhPT0gdW5kZWZpbmVkICYmIHBvcyA+IC0xKVxyXG4gICAgICBsaXN0Py5zcGxpY2UocG9zLCAxKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBjYWxsT3ZlcmxheUhhbmRsZXJJbnRlcm5hbDogSU92ZXJsYXlIYW5kbGVyID0gKFxyXG4gIF9tc2c6IHsgW3M6IHN0cmluZ106IHVua25vd24gfSxcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4pOiBQcm9taXNlPGFueT4gPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgY29uc3QgbXNnID0ge1xyXG4gICAgLi4uX21zZyxcclxuICAgIHJzZXE6IDAsXHJcbiAgfTtcclxuICBsZXQgcDogUHJvbWlzZTx1bmtub3duPjtcclxuXHJcbiAgaWYgKHdzKSB7XHJcbiAgICBtc2cucnNlcSA9IHJzZXFDb3VudGVyKys7XHJcbiAgICBwID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICByZXNwb25zZVByb21pc2VzW21zZy5yc2VxXSA9IHsgcmVzb2x2ZTogcmVzb2x2ZSwgcmVqZWN0OiByZWplY3QgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIHNlbmRNZXNzYWdlKG1zZyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHAgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHNlbmRNZXNzYWdlKG1zZywgKGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkYXRhKSBhcyBCYXNlUmVzcG9uc2U7XHJcbiAgICAgICAgaWYgKHBhcnNlZFsnJGVycm9yJ10pXHJcbiAgICAgICAgICByZWplY3QocGFyc2VkKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICByZXNvbHZlKHBhcnNlZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcDtcclxufTtcclxuXHJcbnR5cGUgT3ZlcnJpZGVNYXAgPSB7IFtjYWxsIGluIE92ZXJsYXlIYW5kbGVyVHlwZXNdPzogT3ZlcmxheUhhbmRsZXJGdW5jc1tjYWxsXSB9O1xyXG5jb25zdCBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcDogT3ZlcnJpZGVNYXAgPSB7fTtcclxuXHJcbmV4cG9ydCBjb25zdCBjYWxsT3ZlcmxheUhhbmRsZXI6IElPdmVybGF5SGFuZGxlciA9IChcclxuICBfbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIC8vIElmIHRoaXMgYGFzYCBpcyBpbmNvcnJlY3QsIHRoZW4gaXQgd2lsbCBub3QgZmluZCBhbiBvdmVycmlkZS5cclxuICAvLyBUT0RPOiB3ZSBjb3VsZCBhbHNvIHJlcGxhY2UgdGhpcyB3aXRoIGEgdHlwZSBndWFyZC5cclxuICBjb25zdCB0eXBlID0gX21zZy5jYWxsIGFzIGtleW9mIE92ZXJyaWRlTWFwO1xyXG4gIGNvbnN0IGNhbGxGdW5jID0gY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXBbdHlwZV0gPz8gY2FsbE92ZXJsYXlIYW5kbGVySW50ZXJuYWw7XHJcblxyXG4gIC8vIFRoZSBgSU92ZXJsYXlIYW5kbGVyYCB0eXBlIGd1YXJhbnRlZXMgdGhhdCBwYXJhbWV0ZXJzL3JldHVybiB0eXBlIG1hdGNoXHJcbiAgLy8gb25lIG9mIHRoZSBvdmVybGF5IGhhbmRsZXJzLiAgVGhlIE92ZXJyaWRlTWFwIGFsc28gb25seSBzdG9yZXMgZnVuY3Rpb25zXHJcbiAgLy8gdGhhdCBtYXRjaCBieSB0aGUgZGlzY3JpbWluYXRpbmcgYGNhbGxgIGZpZWxkLCBhbmQgc28gYW55IG92ZXJyaWRlc1xyXG4gIC8vIHNob3VsZCBiZSBjb3JyZWN0IGhlcmUuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG1heC1sZW5cclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSxAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5zYWZlLWFyZ3VtZW50XHJcbiAgcmV0dXJuIGNhbGxGdW5jKF9tc2cgYXMgYW55KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBzZXRPdmVybGF5SGFuZGxlck92ZXJyaWRlID0gPFQgZXh0ZW5kcyBrZXlvZiBPdmVybGF5SGFuZGxlckZ1bmNzPihcclxuICB0eXBlOiBULFxyXG4gIG92ZXJyaWRlPzogT3ZlcmxheUhhbmRsZXJGdW5jc1tUXSxcclxuKTogdm9pZCA9PiB7XHJcbiAgaWYgKCFvdmVycmlkZSkge1xyXG4gICAgZGVsZXRlIGNhbGxPdmVybGF5SGFuZGxlck92ZXJyaWRlTWFwW3R5cGVdO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcFt0eXBlXSA9IG92ZXJyaWRlO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGluaXQgPSAoKTogdm9pZCA9PiB7XHJcbiAgaWYgKGluaXRlZClcclxuICAgIHJldHVybjtcclxuXHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICB3c1VybCA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KCdPVkVSTEFZX1dTJyk7XHJcbiAgICBpZiAod3NVcmwgIT09IG51bGwpIHtcclxuICAgICAgY29uc3QgY29ubmVjdFdzID0gZnVuY3Rpb24od3NVcmw6IHN0cmluZykge1xyXG4gICAgICAgIHdzID0gbmV3IFdlYlNvY2tldCh3c1VybCk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ29ubmVjdGVkIScpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHEgPSBxdWV1ZSA/PyBbXTtcclxuICAgICAgICAgIHF1ZXVlID0gbnVsbDtcclxuXHJcbiAgICAgICAgICBzZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgICAgIGNhbGw6ICdzdWJzY3JpYmUnLFxyXG4gICAgICAgICAgICBldmVudHM6IE9iamVjdC5rZXlzKHN1YnNjcmliZXJzKSxcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGZvciAoY29uc3QgbXNnIG9mIHEpIHtcclxuICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG1zZykpXHJcbiAgICAgICAgICAgICAgc2VuZE1lc3NhZ2UobXNnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3MuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChfbXNnKSA9PiB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9tc2cuZGF0YSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIG1lc3NhZ2UgZGF0YSByZWNlaXZlZDogJywgX21zZyk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG1zZyA9IEpTT04ucGFyc2UoX21zZy5kYXRhKSBhcyBFdmVudFBhcmFtZXRlciAmIEJhc2VSZXNwb25zZTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHByb21pc2VGdW5jcyA9IG1zZz8ucnNlcSAhPT0gdW5kZWZpbmVkID8gcmVzcG9uc2VQcm9taXNlc1ttc2cucnNlcV0gOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmIChtc2cucnNlcSAhPT0gdW5kZWZpbmVkICYmIHByb21pc2VGdW5jcykge1xyXG4gICAgICAgICAgICAgIGlmIChtc2dbJyRlcnJvciddKVxyXG4gICAgICAgICAgICAgICAgcHJvbWlzZUZ1bmNzLnJlamVjdChtc2cpO1xyXG4gICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHByb21pc2VGdW5jcy5yZXNvbHZlKG1zZyk7XHJcbiAgICAgICAgICAgICAgZGVsZXRlIHJlc3BvbnNlUHJvbWlzZXNbbXNnLnJzZXFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHByb2Nlc3NFdmVudChtc2cpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ludmFsaWQgbWVzc2FnZSByZWNlaXZlZDogJywgX21zZyk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgd3MuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB7XHJcbiAgICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coJ1RyeWluZyB0byByZWNvbm5lY3QuLi4nKTtcclxuICAgICAgICAgIC8vIERvbid0IHNwYW0gdGhlIHNlcnZlciB3aXRoIHJldHJpZXMuXHJcbiAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbm5lY3RXcyh3c1VybCk7XHJcbiAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29ubmVjdFdzKHdzVXJsKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHdhaXRGb3JBcGkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXdpbmRvdy5PdmVybGF5UGx1Z2luQXBpPy5yZWFkeSkge1xyXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQod2FpdEZvckFwaSwgMzAwKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHEgPSBxdWV1ZSA/PyBbXTtcclxuICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgIHdpbmRvdy5fX092ZXJsYXlDYWxsYmFjayA9IHByb2Nlc3NFdmVudDtcclxuXHJcbiAgICAgICAgc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgY2FsbDogJ3N1YnNjcmliZScsXHJcbiAgICAgICAgICBldmVudHM6IE9iamVjdC5rZXlzKHN1YnNjcmliZXJzKSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHEpIHtcclxuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKVxyXG4gICAgICAgICAgICBzZW5kTWVzc2FnZShpdGVtWzBdLCBpdGVtWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB3YWl0Rm9yQXBpKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSGVyZSB0aGUgT3ZlcmxheVBsdWdpbiBBUEkgaXMgcmVnaXN0ZXJlZCB0byB0aGUgd2luZG93IG9iamVjdCxcclxuICAgIC8vIGJ1dCB0aGlzIGlzIG1haW5seSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuIEZvciBjYWN0Ym90J3MgYnVpbHQtaW4gZmlsZXMsXHJcbiAgICAvLyBpdCBpcyByZWNvbW1lbmRlZCB0byB1c2UgdGhlIHZhcmlvdXMgZnVuY3Rpb25zIGV4cG9ydGVkIGluIHJlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGkudHMuXHJcblxyXG4gICAgLyogZXNsaW50LWRpc2FibGUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb24gKi9cclxuICAgIHdpbmRvdy5hZGRPdmVybGF5TGlzdGVuZXIgPSBhZGRPdmVybGF5TGlzdGVuZXI7XHJcbiAgICB3aW5kb3cucmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gcmVtb3ZlT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgd2luZG93LmNhbGxPdmVybGF5SGFuZGxlciA9IGNhbGxPdmVybGF5SGFuZGxlcjtcclxuICAgIHdpbmRvdy5kaXNwYXRjaE92ZXJsYXlFdmVudCA9IGRpc3BhdGNoT3ZlcmxheUV2ZW50O1xyXG4gICAgLyogZXNsaW50LWVuYWJsZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvbiAqL1xyXG4gIH1cclxuXHJcbiAgaW5pdGVkID0gdHJ1ZTtcclxufTtcclxuIiwiaW1wb3J0IE5ldFJlZ2V4ZXMgZnJvbSAnLi4vLi4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMnO1xyXG5pbXBvcnQgeyBhZGRPdmVybGF5TGlzdGVuZXIsIGNhbGxPdmVybGF5SGFuZGxlciB9IGZyb20gJy4uLy4uL3Jlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGknO1xyXG5cclxuaW1wb3J0ICcuLi8uLi9yZXNvdXJjZXMvZGVmYXVsdHMuY3NzJztcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignQ2hhbmdlWm9uZScsIChlKSA9PiB7XHJcbiAgY29uc3QgY3VycmVudFpvbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3VycmVudFpvbmUnKTtcclxuICBpZiAoY3VycmVudFpvbmUpXHJcbiAgICBjdXJyZW50Wm9uZS5pbm5lclRleHQgPSBgY3VycmVudFpvbmU6ICR7ZS56b25lTmFtZX0gKCR7ZS56b25lSUR9KWA7XHJcbn0pO1xyXG5cclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdvbkluQ29tYmF0Q2hhbmdlZEV2ZW50JywgKGUpID0+IHtcclxuICBjb25zdCBpbkNvbWJhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbkNvbWJhdCcpO1xyXG4gIGlmIChpbkNvbWJhdCkge1xyXG4gICAgaW5Db21iYXQuaW5uZXJUZXh0ID0gYGluQ29tYmF0OiBhY3Q6ICR7ZS5kZXRhaWwuaW5BQ1RDb21iYXQgPyAneWVzJyA6ICdubyd9IGdhbWU6ICR7XHJcbiAgICAgIGUuZGV0YWlsLmluR2FtZUNvbWJhdCA/ICd5ZXMnIDogJ25vJ1xyXG4gICAgfWA7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25QbGF5ZXJDaGFuZ2VkRXZlbnQnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZScpO1xyXG4gIGlmIChuYW1lKVxyXG4gICAgbmFtZS5pbm5lclRleHQgPSBlLmRldGFpbC5uYW1lO1xyXG4gIGNvbnN0IHBsYXllcklkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BsYXllcklkJyk7XHJcbiAgaWYgKHBsYXllcklkKVxyXG4gICAgcGxheWVySWQuaW5uZXJUZXh0ID0gZS5kZXRhaWwuaWQudG9TdHJpbmcoMTYpO1xyXG4gIGNvbnN0IGhwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2hwJyk7XHJcbiAgaWYgKGhwKVxyXG4gICAgaHAuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudEhQfS8ke2UuZGV0YWlsLm1heEhQfSAoJHtlLmRldGFpbC5jdXJyZW50U2hpZWxkfSlgO1xyXG4gIGNvbnN0IG1wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21wJyk7XHJcbiAgaWYgKG1wKVxyXG4gICAgbXAuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudE1QfS8ke2UuZGV0YWlsLm1heE1QfWA7XHJcbiAgY29uc3QgY3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3AnKTtcclxuICBpZiAoY3ApXHJcbiAgICBjcC5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5jdXJyZW50Q1B9LyR7ZS5kZXRhaWwubWF4Q1B9YDtcclxuICBjb25zdCBncCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdncCcpO1xyXG4gIGlmIChncClcclxuICAgIGdwLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRHUH0vJHtlLmRldGFpbC5tYXhHUH1gO1xyXG4gIGNvbnN0IGpvYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2InKTtcclxuICBpZiAoam9iKVxyXG4gICAgam9iLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmxldmVsfSAke2UuZGV0YWlsLmpvYn1gO1xyXG4gIGNvbnN0IGRlYnVnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlYnVnJyk7XHJcbiAgaWYgKGRlYnVnKVxyXG4gICAgZGVidWcuaW5uZXJUZXh0ID0gZS5kZXRhaWwuZGVidWdKb2I7XHJcblxyXG4gIGNvbnN0IGpvYkluZm8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9iaW5mbycpO1xyXG4gIGlmIChqb2JJbmZvKSB7XHJcbiAgICBjb25zdCBkZXRhaWwgPSBlLmRldGFpbDtcclxuICAgIGlmIChkZXRhaWwuam9iID09PSAnUkRNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLndoaXRlTWFuYX0gfCAke2RldGFpbC5qb2JEZXRhaWwuYmxhY2tNYW5hfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5tYW5hU3RhY2tzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdXQVInICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBkZXRhaWwuam9iRGV0YWlsLmJlYXN0LnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdEUksnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYmxvb2R9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmRhcmtzaWRlTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5kYXJrQXJ0cy50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5saXZpbmdTaGFkb3dNaWxsaXNlY29uZHN9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0dOQicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwuY2FydHJpZGdlc30gfCAke2RldGFpbC5qb2JEZXRhaWwuY29udGludWF0aW9uU3RhdGV9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1BMRCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGRldGFpbC5qb2JEZXRhaWwub2F0aC50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQlJEJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnNvbmdOYW1lfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sYXN0UGxheWVkfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zb25nUHJvY3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvdWxHYXVnZX0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29uZ01pbGxpc2Vjb25kc30gfCBbJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwuY29kYS5qb2luKCcsICcpXHJcbiAgICAgICAgfV1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRE5DJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gYCR7ZGV0YWlsLmpvYkRldGFpbC5mZWF0aGVyc30gfCAke2RldGFpbC5qb2JEZXRhaWwuZXNwcml0fSB8IFske1xyXG4gICAgICAgIGRldGFpbC5qb2JEZXRhaWwuc3RlcHMuam9pbignLCAnKVxyXG4gICAgICB9XSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jdXJyZW50U3RlcH1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTklOJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gYCR7ZGV0YWlsLmpvYkRldGFpbC5uaW5raUFtb3VudH0gfCAke2RldGFpbC5qb2JEZXRhaWwua2F6ZW1hdG9pfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdEUkcnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYmxvb2RNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxpZmVNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmV5ZXNBbW91bnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZpcnN0bWluZHNGb2N1c31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQkxNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnVtYnJhbFN0YWNrc30gKCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxIZWFydHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnBvbHlnbG90fSAke2RldGFpbC5qb2JEZXRhaWwuZW5vY2hpYW4udG9TdHJpbmcoKX0gKCR7ZGV0YWlsLmpvYkRldGFpbC5uZXh0UG9seWdsb3RNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wYXJhZG94LnRvU3RyaW5nKCl9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFzdHJhbFNvdWxTdGFja3N9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1RITScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwudW1icmFsTWlsbGlzZWNvbmRzfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnV0hNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmxpbHlTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwubGlseU1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kbGlseVN0YWNrc31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU01OJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFldGhlcmZsb3dTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnRyYW5jZU1pbGxpc2Vjb25kc30gfCAke2RldGFpbC5qb2JEZXRhaWwuYXR0dW5lbWVudH0gfCAke2RldGFpbC5qb2JEZXRhaWwuYXR0dW5lbWVudE1pbGxpc2Vjb25kc30gfCAke1xyXG4gICAgICAgICAgZGV0YWlsXHJcbiAgICAgICAgICAgIC5qb2JEZXRhaWwuYWN0aXZlUHJpbWFsID8/ICctJ1xyXG4gICAgICAgIH0gfCBbJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwudXNhYmxlQXJjYW51bS5qb2luKCcsICcpXHJcbiAgICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwubmV4dFN1bW1vbmVkfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zdW1tb25TdGF0dXMudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0NIJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFldGhlcmZsb3dTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5R2F1Z2V9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5U3RhdHVzfSAoJHtkZXRhaWwuam9iRGV0YWlsLmZhaXJ5TWlsbGlzZWNvbmRzfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQUNOJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdBU1QnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDF9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQyfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jYXJkM30gfCAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLm5leHRkcmF3fWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdNTksnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuY2hha3JhU3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sdW5hck5hZGkudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29sYXJOYWRpLnRvU3RyaW5nKCl9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmJlYXN0Q2hha3JhLmpvaW4oJywgJylcclxuICAgICAgICB9XSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5vcG9vcG9GdXJ5fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5yYXB0b3JGdXJ5fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jb2V1cmxGdXJ5fWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdNQ0gnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuaGVhdH0gKCR7ZGV0YWlsLmpvYkRldGFpbC5vdmVyaGVhdE1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmJhdHRlcnl9ICgke2RldGFpbC5qb2JEZXRhaWwuYmF0dGVyeU1pbGxpc2Vjb25kc30pIHwgbGFzdDogJHtkZXRhaWwuam9iRGV0YWlsLmxhc3RCYXR0ZXJ5QW1vdW50fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5vdmVyaGVhdEFjdGl2ZS50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5yb2JvdEFjdGl2ZS50b1N0cmluZygpfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdTQU0nICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwua2Vua2l9IHwgJHtkZXRhaWwuam9iRGV0YWlsLm1lZGl0YXRpb25TdGFja3N9KCR7ZGV0YWlsLmpvYkRldGFpbC5zZXRzdS50b1N0cmluZygpfSwke2RldGFpbC5qb2JEZXRhaWwuZ2V0c3UudG9TdHJpbmcoKX0sJHtkZXRhaWwuam9iRGV0YWlsLmthLnRvU3RyaW5nKCl9KWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdTR0UnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzZ2FsbH0gKCR7ZGV0YWlsLmpvYkRldGFpbC5hZGRlcnNnYWxsTWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzdGluZ30gfCAke2RldGFpbC5qb2JEZXRhaWwuZXVrcmFzaWEudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnUlBSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnNvdWx9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNocm91ZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuZW5zaHJvdWRNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxlbXVyZVNocm91ZH0gfCAke2RldGFpbC5qb2JEZXRhaWwudm9pZFNocm91ZH1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnVlBSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnJhdHRsaW5nQ29pbFN0YWNrc30gfCAke2RldGFpbC5qb2JEZXRhaWwuYW5ndWluZVRyaWJ1dGV9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNlcnBlbnRPZmZlcmluZ30gfCAke2RldGFpbC5qb2JEZXRhaWwuYWR2YW5jZWRDb21ib30gfCAke2RldGFpbC5qb2JEZXRhaWwucmVhd2FrZW5lZFRpbWVyfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdQQ1QnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwucGFsZXR0ZUdhdWdlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wYWludH0gfCAoJHtkZXRhaWwuam9iRGV0YWlsLmNyZWF0dXJlTW90aWZ9IHwgJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwud2VhcG9uTW90aWYgPyAnV2VhcG9uJyA6ICdOb25lJ1xyXG4gICAgICAgIH0gfCAke2RldGFpbC5qb2JEZXRhaWwubGFuZHNjYXBlTW90aWYgPyAnTGFuZHNjYXBlJyA6ICdOb25lJ30pIHwgKCR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmRlcGljdGlvbnMuam9pbignKycpIHx8ICdOb25lJ1xyXG4gICAgICAgIH0pIHwgJHtcclxuICAgICAgICAgIGRldGFpbC5qb2JEZXRhaWwubW9vZ2xlUG9ydHJhaXRcclxuICAgICAgICAgICAgPyAnTW9vZ2xlJ1xyXG4gICAgICAgICAgICA6IGRldGFpbC5qb2JEZXRhaWwubWFkZWVuUG9ydHJhaXRcclxuICAgICAgICAgICAgPyAnTWFkZWVuJ1xyXG4gICAgICAgICAgICA6ICdOb25lJ1xyXG4gICAgICAgIH1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSAnJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHBvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwb3MnKTtcclxuICBpZiAocG9zKSB7XHJcbiAgICBwb3MuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwucG9zLngudG9GaXhlZCgyKX0sJHtlLmRldGFpbC5wb3MueS50b0ZpeGVkKDIpfSwke1xyXG4gICAgICBlLmRldGFpbC5wb3Muei50b0ZpeGVkKDIpXHJcbiAgICB9YDtcclxuICB9XHJcbiAgY29uc3Qgcm90YXRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm90YXRpb24nKTtcclxuICBpZiAocm90YXRpb24pXHJcbiAgICByb3RhdGlvbi5pbm5lclRleHQgPSBlLmRldGFpbC5yb3RhdGlvbi50b1N0cmluZygpO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignRW5taXR5VGFyZ2V0RGF0YScsIChlKSA9PiB7XHJcbiAgY29uc3QgdGFyZ2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhcmdldCcpO1xyXG4gIGlmICh0YXJnZXQpXHJcbiAgICB0YXJnZXQuaW5uZXJUZXh0ID0gZS5UYXJnZXQgPyBlLlRhcmdldC5OYW1lIDogJy0tJztcclxuICBjb25zdCB0aWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlkJyk7XHJcbiAgaWYgKHRpZClcclxuICAgIHRpZC5pbm5lclRleHQgPSBlLlRhcmdldCA/IGUuVGFyZ2V0LklELnRvU3RyaW5nKDE2KSA6ICcnO1xyXG4gIGNvbnN0IHRkaXN0YW5jZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0ZGlzdGFuY2UnKTtcclxuICBpZiAodGRpc3RhbmNlKVxyXG4gICAgdGRpc3RhbmNlLmlubmVyVGV4dCA9IGUuVGFyZ2V0ID8gZS5UYXJnZXQuRGlzdGFuY2UudG9TdHJpbmcoKSA6ICcnO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25HYW1lRXhpc3RzRXZlbnQnLCAoX2UpID0+IHtcclxuICAvLyBjb25zb2xlLmxvZyhcIkdhbWUgZXhpc3RzOiBcIiArIGUuZGV0YWlsLmV4aXN0cyk7XHJcbn0pO1xyXG5cclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdvbkdhbWVBY3RpdmVDaGFuZ2VkRXZlbnQnLCAoX2UpID0+IHtcclxuICAvLyBjb25zb2xlLmxvZyhcIkdhbWUgYWN0aXZlOiBcIiArIGUuZGV0YWlsLmFjdGl2ZSk7XHJcbn0pO1xyXG5cclxuY29uc3QgdHRzRWNob1JlZ2V4ID0gTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ3R0czouKj8nIH0pO1xyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0xvZ0xpbmUnLCAoZSkgPT4ge1xyXG4gIC8vIE1hdGNoIFwiL2VjaG8gdHRzOjxzdHVmZj5cIlxyXG4gIGNvbnN0IGxpbmUgPSB0dHNFY2hvUmVnZXguZXhlYyhlLnJhd0xpbmUpPy5ncm91cHM/LmxpbmU7XHJcbiAgaWYgKGxpbmUgPT09IHVuZGVmaW5lZClcclxuICAgIHJldHVybjtcclxuICBjb25zdCBjb2xvbiA9IGxpbmUuaW5kZXhPZignOicpO1xyXG4gIGlmIChjb2xvbiA9PT0gLTEpXHJcbiAgICByZXR1cm47XHJcbiAgY29uc3QgdGV4dCA9IGxpbmUuc2xpY2UoY29sb24pO1xyXG4gIGlmICh0ZXh0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIHZvaWQgY2FsbE92ZXJsYXlIYW5kbGVyKHtcclxuICAgICAgY2FsbDogJ2NhY3Rib3RTYXknLFxyXG4gICAgICB0ZXh0OiB0ZXh0LFxyXG4gICAgfSk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25Vc2VyRmlsZUNoYW5nZWQnLCAoZSkgPT4ge1xyXG4gIGNvbnNvbGUubG9nKGBVc2VyIGZpbGUgJHtlLmZpbGV9IGNoYW5nZWQhYCk7XHJcbn0pO1xyXG5cclxudm9pZCBjYWxsT3ZlcmxheUhhbmRsZXIoeyBjYWxsOiAnY2FjdGJvdFJlcXVlc3RTdGF0ZScgfSk7XHJcbiJdLCJuYW1lcyI6WyJjb21iYXRhbnRNZW1vcnlLZXlzIiwibGF0ZXN0TG9nRGVmaW5pdGlvbnMiLCJHYW1lTG9nIiwidHlwZSIsIm5hbWUiLCJzb3VyY2UiLCJtZXNzYWdlVHlwZSIsImZpZWxkcyIsInRpbWVzdGFtcCIsImNvZGUiLCJsaW5lIiwic3ViRmllbGRzIiwiY2FuQW5vbnltaXplIiwiZmlyc3RPcHRpb25hbEZpZWxkIiwidW5kZWZpbmVkIiwiYW5hbHlzaXNPcHRpb25zIiwiaW5jbHVkZSIsImZpbHRlcnMiLCJDaGFuZ2Vab25lIiwiaWQiLCJsYXN0SW5jbHVkZSIsIkNoYW5nZWRQbGF5ZXIiLCJwbGF5ZXJJZHMiLCJBZGRlZENvbWJhdGFudCIsImpvYiIsImxldmVsIiwib3duZXJJZCIsIndvcmxkSWQiLCJ3b3JsZCIsIm5wY05hbWVJZCIsIm5wY0Jhc2VJZCIsImN1cnJlbnRIcCIsImhwIiwiY3VycmVudE1wIiwibXAiLCJ4IiwieSIsInoiLCJoZWFkaW5nIiwiY29tYmF0YW50SWRGaWVsZHMiLCJSZW1vdmVkQ29tYmF0YW50Iiwib3duZXIiLCJQYXJ0eUxpc3QiLCJwYXJ0eUNvdW50IiwiaWQwIiwiaWQxIiwiaWQyIiwiaWQzIiwiaWQ0IiwiaWQ1IiwiaWQ2IiwiaWQ3IiwiaWQ4IiwiaWQ5IiwiaWQxMCIsImlkMTEiLCJpZDEyIiwiaWQxMyIsImlkMTQiLCJpZDE1IiwiaWQxNiIsImlkMTciLCJpZDE4IiwiaWQxOSIsImlkMjAiLCJpZDIxIiwiaWQyMiIsImlkMjMiLCJQbGF5ZXJTdGF0cyIsInN0cmVuZ3RoIiwiZGV4dGVyaXR5Iiwidml0YWxpdHkiLCJpbnRlbGxpZ2VuY2UiLCJtaW5kIiwicGlldHkiLCJhdHRhY2tQb3dlciIsImRpcmVjdEhpdCIsImNyaXRpY2FsSGl0IiwiYXR0YWNrTWFnaWNQb3RlbmN5IiwiaGVhbE1hZ2ljUG90ZW5jeSIsImRldGVybWluYXRpb24iLCJza2lsbFNwZWVkIiwic3BlbGxTcGVlZCIsInRlbmFjaXR5IiwibG9jYWxDb250ZW50SWQiLCJTdGFydHNVc2luZyIsInNvdXJjZUlkIiwiYWJpbGl0eSIsInRhcmdldElkIiwidGFyZ2V0IiwiY2FzdFRpbWUiLCJwb3NzaWJsZVJzdkZpZWxkcyIsImJsYW5rRmllbGRzIiwiQWJpbGl0eSIsImZsYWdzIiwiZGFtYWdlIiwidGFyZ2V0Q3VycmVudEhwIiwidGFyZ2V0TWF4SHAiLCJ0YXJnZXRDdXJyZW50TXAiLCJ0YXJnZXRNYXhNcCIsInRhcmdldFgiLCJ0YXJnZXRZIiwidGFyZ2V0WiIsInRhcmdldEhlYWRpbmciLCJtYXhIcCIsIm1heE1wIiwic2VxdWVuY2UiLCJ0YXJnZXRJbmRleCIsInRhcmdldENvdW50Iiwib3duZXJOYW1lIiwiZWZmZWN0RGlzcGxheVR5cGUiLCJhY3Rpb25JZCIsImFjdGlvbkFuaW1hdGlvbklkIiwiYW5pbWF0aW9uTG9ja1RpbWUiLCJyb3RhdGlvbkhleCIsIk5ldHdvcmtBT0VBYmlsaXR5IiwiTmV0d29ya0NhbmNlbEFiaWxpdHkiLCJyZWFzb24iLCJOZXR3b3JrRG9UIiwid2hpY2giLCJlZmZlY3RJZCIsImRhbWFnZVR5cGUiLCJzb3VyY2VDdXJyZW50SHAiLCJzb3VyY2VNYXhIcCIsInNvdXJjZUN1cnJlbnRNcCIsInNvdXJjZU1heE1wIiwic291cmNlWCIsInNvdXJjZVkiLCJzb3VyY2VaIiwic291cmNlSGVhZGluZyIsIldhc0RlZmVhdGVkIiwiR2FpbnNFZmZlY3QiLCJlZmZlY3QiLCJkdXJhdGlvbiIsImNvdW50IiwiSGVhZE1hcmtlciIsImRhdGEwIiwicG9zc2libGVQbGF5ZXJJZHMiLCJOZXR3b3JrUmFpZE1hcmtlciIsIm9wZXJhdGlvbiIsIndheW1hcmsiLCJOZXR3b3JrVGFyZ2V0TWFya2VyIiwidGFyZ2V0TmFtZSIsIkxvc2VzRWZmZWN0IiwiTmV0d29ya0dhdWdlIiwiZGF0YTEiLCJkYXRhMiIsImRhdGEzIiwiZmlyc3RVbmtub3duRmllbGQiLCJOZXR3b3JrV29ybGQiLCJpc1Vua25vd24iLCJBY3RvckNvbnRyb2wiLCJpbnN0YW5jZSIsImNvbW1hbmQiLCJOYW1lVG9nZ2xlIiwidG9nZ2xlIiwiVGV0aGVyIiwiTGltaXRCcmVhayIsInZhbHVlSGV4IiwiYmFycyIsIk5ldHdvcmtFZmZlY3RSZXN1bHQiLCJzZXF1ZW5jZUlkIiwiY3VycmVudFNoaWVsZCIsIlN0YXR1c0VmZmVjdCIsImpvYkxldmVsRGF0YSIsImRhdGE0IiwiZGF0YTUiLCJOZXR3b3JrVXBkYXRlSFAiLCJNYXAiLCJyZWdpb25OYW1lIiwicGxhY2VOYW1lIiwicGxhY2VOYW1lU3ViIiwiU3lzdGVtTG9nTWVzc2FnZSIsInBhcmFtMCIsInBhcmFtMSIsInBhcmFtMiIsIlN0YXR1c0xpc3QzIiwiUGFyc2VySW5mbyIsImdsb2JhbEluY2x1ZGUiLCJQcm9jZXNzSW5mbyIsIkRlYnVnIiwiUGFja2V0RHVtcCIsIlZlcnNpb24iLCJFcnJvciIsIk5vbmUiLCJMaW5lUmVnaXN0cmF0aW9uIiwidmVyc2lvbiIsIk1hcEVmZmVjdCIsImxvY2F0aW9uIiwiRmF0ZURpcmVjdG9yIiwiY2F0ZWdvcnkiLCJmYXRlSWQiLCJwcm9ncmVzcyIsIkNFRGlyZWN0b3IiLCJwb3BUaW1lIiwidGltZVJlbWFpbmluZyIsImNlS2V5IiwibnVtUGxheWVycyIsInN0YXR1cyIsIkluQ29tYmF0IiwiaW5BQ1RDb21iYXQiLCJpbkdhbWVDb21iYXQiLCJpc0FDVENoYW5nZWQiLCJpc0dhbWVDaGFuZ2VkIiwiQ29tYmF0YW50TWVtb3J5IiwiY2hhbmdlIiwicmVwZWF0aW5nRmllbGRzIiwic3RhcnRpbmdJbmRleCIsImxhYmVsIiwibmFtZXMiLCJzb3J0S2V5cyIsInByaW1hcnlLZXkiLCJwb3NzaWJsZUtleXMiLCJrZXlzVG9Bbm9ueW1pemUiLCJwYWlyIiwia2V5IiwidmFsdWUiLCJSU1ZEYXRhIiwibG9jYWxlIiwiU3RhcnRzVXNpbmdFeHRyYSIsIkFiaWxpdHlFeHRyYSIsImdsb2JhbEVmZmVjdENvdW50ZXIiLCJkYXRhRmxhZyIsIkNvbnRlbnRGaW5kZXJTZXR0aW5ncyIsInpvbmVJZCIsInpvbmVOYW1lIiwiaW5Db250ZW50RmluZGVyQ29udGVudCIsInVucmVzdHJpY3RlZFBhcnR5IiwibWluaW1hbEl0ZW1MZXZlbCIsInNpbGVuY2VFY2hvIiwiZXhwbG9yZXJNb2RlIiwibGV2ZWxTeW5jIiwiTnBjWWVsbCIsIm5wY0lkIiwibnBjWWVsbElkIiwiQmF0dGxlVGFsazIiLCJpbnN0YW5jZUNvbnRlbnRUZXh0SWQiLCJkaXNwbGF5TXMiLCJDb3VudGRvd24iLCJjb3VudGRvd25UaW1lIiwicmVzdWx0IiwiQ291bnRkb3duQ2FuY2VsIiwiQWN0b3JNb3ZlIiwiQWN0b3JTZXRQb3MiLCJTcGF3bk5wY0V4dHJhIiwicGFyZW50SWQiLCJ0ZXRoZXJJZCIsImFuaW1hdGlvblN0YXRlIiwiQWN0b3JDb250cm9sRXh0cmEiLCJwYXJhbTMiLCJwYXJhbTQiLCJBY3RvckNvbnRyb2xTZWxmRXh0cmEiLCJwYXJhbTUiLCJwYXJhbTYiLCJsb2dEZWZpbml0aW9uc1ZlcnNpb25zIiwiYXNzZXJ0TG9nRGVmaW5pdGlvbnMiLCJjb25zb2xlIiwiYXNzZXJ0IiwiVW5yZWFjaGFibGVDb2RlIiwiY29uc3RydWN0b3IiLCJsb2dEZWZpbml0aW9ucyIsInNlcGFyYXRvciIsIm1hdGNoRGVmYXVsdCIsIm1hdGNoV2l0aENvbG9uc0RlZmF1bHQiLCJmaWVsZHNXaXRoUG90ZW50aWFsQ29sb25zIiwiZGVmYXVsdFBhcmFtcyIsImxvZ1R5cGUiLCJPYmplY3QiLCJrZXlzIiwicHVzaCIsInBhcmFtcyIsInByb3AiLCJpbmRleCIsImVudHJpZXMiLCJpbmNsdWRlcyIsInBhcmFtIiwiZmllbGQiLCJvcHRpb25hbCIsInJlcGVhdGluZyIsInJlcGVhdGluZ0tleXMiLCJpc1JlcGVhdGluZ0ZpZWxkIiwiQXJyYXkiLCJpc0FycmF5IiwiZSIsInBhcnNlSGVscGVyIiwiZGVmS2V5IiwidmFsaWRGaWVsZHMiLCJSZWdleGVzIiwidmFsaWRhdGVQYXJhbXMiLCJjYXB0dXJlIiwidHJ1ZUlmVW5kZWZpbmVkIiwiZmllbGRLZXlzIiwic29ydCIsImEiLCJiIiwicGFyc2VJbnQiLCJtYXhLZXlTdHIiLCJ0bXBLZXkiLCJwb3AiLCJsZW5ndGgiLCJmaWVsZE5hbWUiLCJtYXhLZXkiLCJhYmlsaXR5TWVzc2FnZVR5cGUiLCJhYmlsaXR5SGV4Q29kZSIsInByZWZpeCIsInR5cGVBc0hleCIsInRvU3RyaW5nIiwidG9VcHBlckNhc2UiLCJkZWZhdWx0SGV4Q29kZSIsInNsaWNlIiwiaGV4Q29kZSIsInN0ciIsImxhc3RLZXkiLCJrZXlTdHIiLCJwYXJzZUZpZWxkIiwibWlzc2luZ0ZpZWxkcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJmaWVsZERlZmF1bHQiLCJkZWZhdWx0RmllbGRWYWx1ZSIsImZpZWxkVmFsdWUiLCJyZXBlYXRpbmdGaWVsZHNTZXBhcmF0b3IiLCJyZXBlYXRpbmdBcnJheSIsImxlZnQiLCJyaWdodCIsInRvTG93ZXJDYXNlIiwibG9jYWxlQ29tcGFyZSIsIndhcm4iLCJsZWZ0VmFsdWUiLCJyaWdodFZhbHVlIiwiYW5vblJlcHMiLCJmb3JFYWNoIiwicG9zc2libGVLZXkiLCJyZXAiLCJmaW5kIiwiZmllbGRSZWdleCIsInZhbCIsInNvbWUiLCJ2IiwibWF5YmVDYXB0dXJlIiwicGFyc2UiLCJidWlsZFJlZ2V4IiwibG9nVmVyc2lvbiIsInN0YXJ0c1VzaW5nIiwiYWJpbGl0eUZ1bGwiLCJoZWFkTWFya2VyIiwiYWRkZWRDb21iYXRhbnQiLCJhZGRlZENvbWJhdGFudEZ1bGwiLCJyZW1vdmluZ0NvbWJhdGFudCIsImdhaW5zRWZmZWN0Iiwic3RhdHVzRWZmZWN0RXhwbGljaXQiLCJsb3Nlc0VmZmVjdCIsInRldGhlciIsIndhc0RlZmVhdGVkIiwibmV0d29ya0RvVCIsImVjaG8iLCJnYW1lTG9nIiwiZGlhbG9nIiwibWVzc2FnZSIsImdhbWVOYW1lTG9nIiwic3RhdENoYW5nZSIsImNoYW5nZVpvbmUiLCJuZXR3b3JrNmQiLCJuYW1lVG9nZ2xlIiwibWFwIiwic3lzdGVtTG9nTWVzc2FnZSIsIm1hcEVmZmVjdCIsImZhdGVEaXJlY3RvciIsImNlRGlyZWN0b3IiLCJpbkNvbWJhdCIsImNvbWJhdGFudE1lbW9yeSIsInN0YXJ0c1VzaW5nRXh0cmEiLCJhYmlsaXR5RXh0cmEiLCJjb250ZW50RmluZGVyU2V0dGluZ3MiLCJucGNZZWxsIiwiYmF0dGxlVGFsazIiLCJjb3VudGRvd24iLCJjb3VudGRvd25DYW5jZWwiLCJhY3Rvck1vdmUiLCJhY3RvclNldFBvcyIsInNwYXduTnBjRXh0cmEiLCJhY3RvckNvbnRyb2xFeHRyYSIsImFjdG9yQ29udHJvbFNlbGZFeHRyYSIsImRlZmF1bHRWYWx1ZSIsImFueU9mIiwibmFtZWRDYXB0dXJlIiwiZXJyb3IiLCJhcmdzIiwiYW55T2ZBcnJheSIsImFycmF5IiwiZWxlbSIsIlJlZ0V4cCIsImpvaW4iLCJmaXJzdEFyZyIsInJlZ2V4cFN0cmluZyIsImtDYWN0Ym90Q2F0ZWdvcmllcyIsIlRpbWVzdGFtcCIsIk5ldFRpbWVzdGFtcCIsIk5ldEZpZWxkIiwiTG9nVHlwZSIsIkFiaWxpdHlDb2RlIiwiT2JqZWN0SWQiLCJOYW1lIiwiRmxvYXQiLCJtb2RpZmllcnMiLCJnbG9iYWwiLCJtdWx0aWxpbmUiLCJyZXBsYWNlIiwibWF0Y2giLCJncm91cCIsInBhcnNlR2xvYmFsIiwicmVnZXgiLCJmIiwiZnVuY05hbWUiLCJtYWdpY1RyYW5zbGF0aW9uU3RyaW5nIiwibWFnaWNTdHJpbmdSZWdleCIsImtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uQXNDb25zdCIsImtleXNUaGF0UmVxdWlyZVRyYW5zbGF0aW9uIiwiZ2FtZUxvZ0NvZGVzIiwiYWN0b3JDb250cm9sVHlwZSIsInNldEFuaW1TdGF0ZSIsInB1YmxpY0NvbnRlbnRUZXh0IiwibG9nTXNnIiwibG9nTXNnUGFyYW1zIiwidHJhbnNQYXJhbXMiLCJmaWx0ZXIiLCJrIiwibmVlZHNUcmFuc2xhdGlvbnMiLCJOZXRSZWdleGVzIiwiZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCIsInNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWQiLCJkb2VzTmV0UmVnZXhOZWVkVHJhbnNsYXRpb24iLCJleGVjIiwiY29tbW9uTmV0UmVnZXgiLCJ3aXBlIiwiY2FjdGJvdFdpcGVFY2hvIiwidXNlcldpcGVFY2hvIiwiYnVpbGROZXRSZWdleEZvclRyaWdnZXIiLCJpbml0ZWQiLCJ3c1VybCIsIndzIiwicXVldWUiLCJyc2VxQ291bnRlciIsInJlc3BvbnNlUHJvbWlzZXMiLCJzdWJzY3JpYmVycyIsInNlbmRNZXNzYWdlIiwibXNnIiwiY2IiLCJzZW5kIiwid2luZG93IiwiT3ZlcmxheVBsdWdpbkFwaSIsImNhbGxIYW5kbGVyIiwicHJvY2Vzc0V2ZW50IiwiaW5pdCIsInN1YnMiLCJzdWIiLCJkaXNwYXRjaE92ZXJsYXlFdmVudCIsImFkZE92ZXJsYXlMaXN0ZW5lciIsImV2ZW50IiwiY2FsbCIsImV2ZW50cyIsInJlbW92ZU92ZXJsYXlMaXN0ZW5lciIsImxpc3QiLCJwb3MiLCJpbmRleE9mIiwic3BsaWNlIiwiY2FsbE92ZXJsYXlIYW5kbGVySW50ZXJuYWwiLCJfbXNnIiwicnNlcSIsInAiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRhdGEiLCJwYXJzZWQiLCJjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcCIsImNhbGxPdmVybGF5SGFuZGxlciIsImNhbGxGdW5jIiwic2V0T3ZlcmxheUhhbmRsZXJPdmVycmlkZSIsIm92ZXJyaWRlIiwiVVJMU2VhcmNoUGFyYW1zIiwic2VhcmNoIiwiZ2V0IiwiY29ubmVjdFdzIiwiV2ViU29ja2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImxvZyIsInEiLCJwcm9taXNlRnVuY3MiLCJzZXRUaW1lb3V0Iiwid2FpdEZvckFwaSIsInJlYWR5IiwiX19PdmVybGF5Q2FsbGJhY2siLCJpdGVtIiwiY3VycmVudFpvbmUiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiaW5uZXJUZXh0Iiwiem9uZUlEIiwiZGV0YWlsIiwicGxheWVySWQiLCJjdXJyZW50SFAiLCJtYXhIUCIsImN1cnJlbnRNUCIsIm1heE1QIiwiY3AiLCJjdXJyZW50Q1AiLCJtYXhDUCIsImdwIiwiY3VycmVudEdQIiwibWF4R1AiLCJkZWJ1ZyIsImRlYnVnSm9iIiwiam9iSW5mbyIsImpvYkRldGFpbCIsIndoaXRlTWFuYSIsImJsYWNrTWFuYSIsIm1hbmFTdGFja3MiLCJiZWFzdCIsImJsb29kIiwiZGFya3NpZGVNaWxsaXNlY29uZHMiLCJkYXJrQXJ0cyIsImxpdmluZ1NoYWRvd01pbGxpc2Vjb25kcyIsImNhcnRyaWRnZXMiLCJjb250aW51YXRpb25TdGF0ZSIsIm9hdGgiLCJzb25nTmFtZSIsImxhc3RQbGF5ZWQiLCJzb25nUHJvY3MiLCJzb3VsR2F1Z2UiLCJzb25nTWlsbGlzZWNvbmRzIiwiY29kYSIsImZlYXRoZXJzIiwiZXNwcml0Iiwic3RlcHMiLCJjdXJyZW50U3RlcCIsIm5pbmtpQW1vdW50Iiwia2F6ZW1hdG9pIiwiYmxvb2RNaWxsaXNlY29uZHMiLCJsaWZlTWlsbGlzZWNvbmRzIiwiZXllc0Ftb3VudCIsImZpcnN0bWluZHNGb2N1cyIsInVtYnJhbFN0YWNrcyIsInVtYnJhbE1pbGxpc2Vjb25kcyIsInVtYnJhbEhlYXJ0cyIsInBvbHlnbG90IiwiZW5vY2hpYW4iLCJuZXh0UG9seWdsb3RNaWxsaXNlY29uZHMiLCJwYXJhZG94IiwiYXN0cmFsU291bFN0YWNrcyIsImxpbHlTdGFja3MiLCJsaWx5TWlsbGlzZWNvbmRzIiwiYmxvb2RsaWx5U3RhY2tzIiwiYWV0aGVyZmxvd1N0YWNrcyIsInRyYW5jZU1pbGxpc2Vjb25kcyIsImF0dHVuZW1lbnQiLCJhdHR1bmVtZW50TWlsbGlzZWNvbmRzIiwiYWN0aXZlUHJpbWFsIiwidXNhYmxlQXJjYW51bSIsIm5leHRTdW1tb25lZCIsInN1bW1vblN0YXR1cyIsImZhaXJ5R2F1Z2UiLCJmYWlyeVN0YXR1cyIsImZhaXJ5TWlsbGlzZWNvbmRzIiwiY2FyZDEiLCJjYXJkMiIsImNhcmQzIiwiY2FyZDQiLCJuZXh0ZHJhdyIsImNoYWtyYVN0YWNrcyIsImx1bmFyTmFkaSIsInNvbGFyTmFkaSIsImJlYXN0Q2hha3JhIiwib3Bvb3BvRnVyeSIsInJhcHRvckZ1cnkiLCJjb2V1cmxGdXJ5IiwiaGVhdCIsIm92ZXJoZWF0TWlsbGlzZWNvbmRzIiwiYmF0dGVyeSIsImJhdHRlcnlNaWxsaXNlY29uZHMiLCJsYXN0QmF0dGVyeUFtb3VudCIsIm92ZXJoZWF0QWN0aXZlIiwicm9ib3RBY3RpdmUiLCJrZW5raSIsIm1lZGl0YXRpb25TdGFja3MiLCJzZXRzdSIsImdldHN1Iiwia2EiLCJhZGRlcnNnYWxsIiwiYWRkZXJzZ2FsbE1pbGxpc2Vjb25kcyIsImFkZGVyc3RpbmciLCJldWtyYXNpYSIsInNvdWwiLCJzaHJvdWQiLCJlbnNocm91ZE1pbGxpc2Vjb25kcyIsImxlbXVyZVNocm91ZCIsInZvaWRTaHJvdWQiLCJyYXR0bGluZ0NvaWxTdGFja3MiLCJhbmd1aW5lVHJpYnV0ZSIsInNlcnBlbnRPZmZlcmluZyIsImFkdmFuY2VkQ29tYm8iLCJyZWF3YWtlbmVkVGltZXIiLCJwYWxldHRlR2F1Z2UiLCJwYWludCIsImNyZWF0dXJlTW90aWYiLCJ3ZWFwb25Nb3RpZiIsImxhbmRzY2FwZU1vdGlmIiwiZGVwaWN0aW9ucyIsIm1vb2dsZVBvcnRyYWl0IiwibWFkZWVuUG9ydHJhaXQiLCJ0b0ZpeGVkIiwicm90YXRpb24iLCJUYXJnZXQiLCJ0aWQiLCJJRCIsInRkaXN0YW5jZSIsIkRpc3RhbmNlIiwiX2UiLCJ0dHNFY2hvUmVnZXgiLCJyYXdMaW5lIiwiZ3JvdXBzIiwiY29sb24iLCJ0ZXh0IiwiZmlsZSJdLCJzb3VyY2VSb290IjoiIn0=