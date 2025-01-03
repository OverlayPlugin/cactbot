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
        // effects applied by NPCs to other NPCs (including themselves)
        sourceId: '4.{7}',
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
        // effects applied by NPCs to other NPCs (including themselves)
        sourceId: '4.{7}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFdBQVcsRUFBRSxXQUFXO0lBQ3hCQyxNQUFNLEVBQUU7TUFDTkosSUFBSSxFQUFFLENBQUM7TUFDUEssU0FBUyxFQUFFLENBQUM7TUFDWm1DLFVBQVUsRUFBRSxDQUFDO01BQ2JDLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxDQUFDO01BQ05DLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLEdBQUcsRUFBRSxFQUFFO01BQ1BDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRSxFQUFFO01BQ1JDLElBQUksRUFBRTtJQUNSLENBQUM7SUFDRDdDLFNBQVMsRUFBRTtNQUNULENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsQ0FBQyxFQUFFLElBQUk7TUFDUCxDQUFDLEVBQUUsSUFBSTtNQUNQLENBQUMsRUFBRSxJQUFJO01BQ1AsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElBQUk7TUFDUixFQUFFLEVBQUUsSUFBSTtNQUNSLEVBQUUsRUFBRSxJQUFJO01BQ1IsRUFBRSxFQUFFLElB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ZGVmcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25vdF9yZWFjaGVkLnRzIiwid2VicGFjazovL2NhY3Rib3QvLi9yZXNvdXJjZXMvcmVnZXhlcy50cyIsIndlYnBhY2s6Ly9jYWN0Ym90Ly4vcmVzb3VyY2VzL25ldHJlZ2V4ZXMudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3Jlc291cmNlcy9vdmVybGF5X3BsdWdpbl9hcGkudHMiLCJ3ZWJwYWNrOi8vY2FjdGJvdC8uL3VpL3Rlc3QvdGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbHVnaW5Db21iYXRhbnRTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL2V2ZW50JztcclxuaW1wb3J0IHsgTmV0RmllbGRzUmV2ZXJzZSB9IGZyb20gJy4uL3R5cGVzL25ldF9maWVsZHMnO1xyXG5pbXBvcnQgeyBOZXRQYXJhbXMgfSBmcm9tICcuLi90eXBlcy9uZXRfcHJvcHMnO1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvbjxLIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID0ge1xyXG4gIC8vIFRoZSBsb2cgbGluZSBpZCwgYXMgYSBkZWNpbWFsIHN0cmluZywgbWluaW11bSB0d28gY2hhcmFjdGVycy5cclxuICB0eXBlOiBMb2dEZWZpbml0aW9uc1tLXVsndHlwZSddO1xyXG4gIC8vIFRoZSBpbmZvcm1hbCBuYW1lIG9mIHRoaXMgbG9nIGxpbmUgKG11c3QgbWF0Y2ggdGhlIGtleSB0aGF0IHRoZSBMb2dEZWZpbml0aW9uIGlzIGEgdmFsdWUgZm9yKS5cclxuICBuYW1lOiBLO1xyXG4gIC8vIFRoZSBwbHVnaW4gdGhhdCBnZW5lcmF0ZXMgdGhpcyBsb2cgbGluZS5cclxuICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyB8ICdPdmVybGF5UGx1Z2luJztcclxuICAvLyBQYXJzZWQgQUNUIGxvZyBsaW5lIHR5cGUuICBPdmVybGF5UGx1Z2luIGxpbmVzIHVzZSB0aGUgYHR5cGVgIGFzIGEgc3RyaW5nLlxyXG4gIG1lc3NhZ2VUeXBlOiBMb2dEZWZpbml0aW9uc1tLXVsnbWVzc2FnZVR5cGUnXTtcclxuICAvLyBJZiB0cnVlLCBhbHdheXMgaW5jbHVkZSB0aGlzIGxpbmUgd2hlbiBzcGxpdHRpbmcgbG9ncyAoZS5nLiBGRlhJViBwbHVnaW4gdmVyc2lvbikuXHJcbiAgZ2xvYmFsSW5jbHVkZT86IGJvb2xlYW47XHJcbiAgLy8gSWYgdHJ1ZSwgYWx3YXlzIGluY2x1ZGUgdGhlIGxhc3QgaW5zdGFuY2Ugb2YgdGhpcyBsaW5lIHdoZW4gc3BsaXR0aW5nIGxvZ3MgKGUuZy4gQ2hhbmdlWm9uZSkuXHJcbiAgbGFzdEluY2x1ZGU/OiBib29sZWFuO1xyXG4gIC8vIFRydWUgaWYgdGhlIGxpbmUgY2FuIGJlIGFub255bWl6ZWQgKGkuZS4gcmVtb3ZpbmcgcGxheWVyIGlkcyBhbmQgbmFtZXMpLlxyXG4gIGNhbkFub255bWl6ZT86IGJvb2xlYW47XHJcbiAgLy8gSWYgdHJ1ZSwgdGhpcyBsb2cgbGluZSBoYXMgbm90IGJlZW4gc2VlbiBiZWZvcmUgYW5kIG5lZWRzIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgaXNVbmtub3duPzogYm9vbGVhbjtcclxuICAvLyBGaWVsZHMgYXQgdGhpcyBpbmRleCBhbmQgYmV5b25kIGFyZSBjbGVhcmVkLCB3aGVuIGFub255bWl6aW5nLlxyXG4gIGZpcnN0VW5rbm93bkZpZWxkPzogbnVtYmVyO1xyXG4gIC8vIEEgbWFwIG9mIGFsbCBvZiB0aGUgZmllbGRzLCB1bmlxdWUgZmllbGQgbmFtZSB0byBmaWVsZCBpbmRleC5cclxuICBmaWVsZHM6IExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXTtcclxuICAvLyBGaWVsZCBpbmRpY2VzIHRoYXQgKm1heSogY29udGFpbiBSU1YgcGxhY2Vob2xkZXJzIChmb3IgZGVjb2RpbmcpXHJcbiAgcG9zc2libGVSc3ZGaWVsZHM/OiBMb2dEZWZGaWVsZElkeDxLPiB8IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbiAgLy8gRmllbGQgbmFtZXMgYW5kIHZhbHVlcyB0aGF0IGNhbiBvdmVycmlkZSBgY2FuQW5vbnltaXplYC4gU2VlIGBMb2dEZWZTdWJGaWVsZHNgIHR5cGUgYmVsb3cuXHJcbiAgc3ViRmllbGRzPzogTG9nRGVmU3ViRmllbGRzPEs+O1xyXG4gIC8vIE1hcCBvZiBmaWVsZCBpbmRpY2VzIHRvIGFub255bWl6ZSwgaW4gdGhlIGZvcm1hdDogcGxheWVySWQ6IChvcHRpb25hbCkgcGxheWVyTmFtZS5cclxuICBwbGF5ZXJJZHM/OiBQbGF5ZXJJZE1hcDxLPjtcclxuICAvLyBBIGxpc3Qgb2YgZmllbGQgaW5kaWNlcyB0aGF0IG1heSBjb250YWlucyBwbGF5ZXIgaWRzIGFuZCwgaWYgc28sIHdpbGwgYmUgYW5vbnltaXplZC5cclxuICAvLyBJZiBhbiBpbmRleCBpcyBsaXN0ZWQgaGVyZSBhbmQgaW4gYHBsYXllcklkc2AsIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBhIHBvc3NpYmxlIGlkIGZpZWxkLlxyXG4gIHBvc3NpYmxlUGxheWVySWRzPzogcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxuICAvLyBBIGxpc3Qgb2YgZmllbGQgaW5kaWNlcyB0aGF0IGFyZSBvayB0byBiZSBibGFuayAob3IgaGF2ZSBpbnZhbGlkIGlkcykuXHJcbiAgYmxhbmtGaWVsZHM/OiByZWFkb25seSBMb2dEZWZGaWVsZElkeDxLPltdO1xyXG4gIC8vIFRoaXMgZmllbGQgaW5kZXggKGFuZCBhbGwgYWZ0ZXIpIHdpbGwgYmUgdHJlYXRlZCBhcyBvcHRpb25hbCB3aGVuIGNyZWF0aW5nIGNhcHR1cmluZyByZWdleGVzLlxyXG4gIGZpcnN0T3B0aW9uYWxGaWVsZDogbnVtYmVyIHwgdW5kZWZpbmVkO1xyXG4gIC8vIFRoZXNlIGZpZWxkcyBhcmUgdHJlYXRlZCBhcyByZXBlYXRhYmxlIGZpZWxkc1xyXG4gIHJlcGVhdGluZ0ZpZWxkcz86IHtcclxuICAgIHN0YXJ0aW5nSW5kZXg6IG51bWJlcjtcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbiAgICBuYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgICBwcmltYXJ5S2V5OiBzdHJpbmc7XHJcbiAgICBwb3NzaWJsZUtleXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG4gICAgLy8gUmVwZWF0aW5nIGZpZWxkcyB0aGF0IHdpbGwgYmUgYW5vbnltaXplZCBpZiBwcmVzZW50LiBTYW1lIHN0cnVjdHVyZSBhcyBgcGxheWVySWRzYCxcclxuICAgIC8vIGJ1dCB1c2VzIHJlcGVhdGluZyBmaWVsZCBrZXlzIChuYW1lcykgaW4gcGxhY2Ugb2YgZmllbGQgaW5kaWNlcy4gSG93ZXZlciwgdGhlICdpZCcgZmllbGRcclxuICAgIC8vIG9mIGFuIGlkL25hbWUgcGFpciBjYW4gYmUgYSBmaXhlZCBmaWVsZCBpbmRleC4gU2VlIGBDb21iYXRhbnRNZW1vcnlgIGV4YW1wbGUuXHJcbiAgICBrZXlzVG9Bbm9ueW1pemU/OiBLIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyB7IFtpZEZpZWxkOiBzdHJpbmcgfCBudW1iZXJdOiBzdHJpbmcgfCBudWxsIH1cclxuICAgICAgOiBuZXZlcjtcclxuICB9O1xyXG4gIC8vIFNlZSBgQW5hbHlzaXNPcHRpb25zYCB0eXBlLiBPbWl0dGluZyB0aGlzIHByb3BlcnR5IG1lYW5zIG5vIGxvZyBsaW5lcyB3aWxsIGJlIGluY2x1ZGVkO1xyXG4gIC8vIGhvd2V2ZXIsIGlmIHJhaWRib3NzIHRyaWdnZXJzIGFyZSBmb3VuZCB1c2luZyB0aGlzIGxpbmUgdHlwZSwgYW4gYXV0b21hdGVkIHdvcmtmbG93IHdpbGxcclxuICAvLyBjcmVhdGUgdGhpcyBwcm9wZXJ0eSBhbmQgc2V0IGBpbmNsdWRlOiAnYWxsJ2AuIFRvIHN1cHByZXNzIHRoaXMsIHVzZSBgaW5jbHVkZTogJ25ldmVyYGAuXHJcbiAgYW5hbHlzaXNPcHRpb25zPzogQW5hbHlzaXNPcHRpb25zPEs+O1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmRmllbGRJZHg8XHJcbiAgSyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4+ID0gRXh0cmFjdDxMb2dEZWZpbml0aW9uc1tLXVsnZmllbGRzJ11ba2V5b2YgTG9nRGVmaW5pdGlvbnNbS11bJ2ZpZWxkcyddXSwgbnVtYmVyPjtcclxuXHJcbnR5cGUgUGxheWVySWRNYXA8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBbUCBpbiBMb2dEZWZGaWVsZElkeDxLPiBhcyBudW1iZXJdPzogTG9nRGVmRmllbGRJZHg8Sz4gfCBudWxsO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTG9nRGVmRmllbGROYW1lPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSBFeHRyYWN0PFxyXG4gIGtleW9mIExvZ0RlZmluaXRpb25zW0tdWydmaWVsZHMnXSxcclxuICBzdHJpbmdcclxuPjtcclxuXHJcbi8vIFNwZWNpZmllcyBhIGZpZWxkTmFtZSBrZXkgd2l0aCBvbmUgb3IgbW9yZSBwb3NzaWJsZSB2YWx1ZXMgYW5kIGEgYGNhbkFub255aXplYCBvdmVycmlkZVxyXG4vLyBpZiB0aGF0IGZpZWxkIGFuZCB2YWx1ZSBhcmUgcHJlc2VudCBvbiB0aGUgbG9nIGxpbmUuIFNlZSAnR2FtZUxvZycgZm9yIGFuIGV4YW1wbGUuXHJcbnR5cGUgTG9nRGVmU3ViRmllbGRzPEsgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgW1AgaW4gTG9nRGVmRmllbGROYW1lPEs+XT86IHtcclxuICAgIFtmaWVsZFZhbHVlOiBzdHJpbmddOiB7XHJcbiAgICAgIG5hbWU6IHN0cmluZztcclxuICAgICAgY2FuQW5vbnltaXplOiBib29sZWFuO1xyXG4gICAgfTtcclxuICB9O1xyXG59O1xyXG5cclxuLy8gT3B0aW9ucyBmb3IgaW5jbHVkaW5nIHRoZXNlIGxpbmVzIGluIGEgZmlsdGVyZWQgbG9nIHZpYSB0aGUgbG9nIHNwbGl0dGVyJ3MgYW5hbHlzaXMgb3B0aW9uLlxyXG4vLyBgaW5jbHVkZTpgIHNwZWNpZmllcyB0aGUgbGV2ZWwgb2YgaW5jbHVzaW9uOlxyXG4vLyAgIC0gJ2FsbCcgd2lsbCBpbmNsdWRlIGFsbCBsaW5lcyB3aXRoIG5vIGZpbHRlcmluZy5cclxuLy8gICAtICdmaWx0ZXInIHdpbGwgaW5jbHVkZSBvbmx5IHRob3NlIGxpbmVzIHRoYXQgbWF0Y2ggYXQgbGVhc3Qgb25lIG9mIHRoZSBzcGVjaWZpZWQgYGZpbHRlcnNgLlxyXG4vLyAgIC0gJ25ldmVyJyBpcyBhbiBvdmVycmlkZTsganVzdCBsaWtlIGlmIHRoZSBwcm9wZXJ0eSB3ZXJlIG9taXR0ZWQsIG5vIGxvZyBsaW5lcyB3aWxsIGJlIGluY2x1ZGVkXHJcbi8vICAgICAgaW4gdGhlIGZpbHRlcjsgaG93ZXZlciwgaWYgJ25ldmVyJyBpcyB1c2VkLCB0aGUgYXV0b21hdGVkIHdvcmtmbG93IHdpbGwgbm90IGF0dGVtcHQgdG9cclxuLy8gICAgICBjaGFuZ2UgaXQgdG8gJ2FsbCcgdXBvbiBmaW5kaW5nIGFjdGl2ZSB0cmlnZ2VycyB1c2luZyB0aGlzIGxpbmUgdHlwZS5cclxuLy8gYGZpbHRlcnM6YCBjb250YWlucyBOZXRyZWdleC1zdHlsZSBmaWx0ZXIgY3JpdGVyaWEuIExpbmVzIHNhdGlzZnlpbmcgYXQgbGVhc3Qgb25lIGZpbHRlciB3aWxsIGJlXHJcbi8vICAgaW5jbHVkZWQuIElmIGBpbmNsdWRlOmAgPSAnZmlsdGVyJywgYGZpbHRlcnNgIG11c3QgYmUgcHJlc2VudDsgb3RoZXJ3aXNlLCBpdCBtdXN0IGJlIG9taXR0ZWQuXHJcbi8vIGBjb21iYXRhbnRJZEZpZWxkczpgIGFyZSBmaWVsZCBpbmRpY2VzIGNvbnRhaW5pbmcgY29tYmF0YW50SWRzLiBJZiBzcGVjaWZpZWQsIHRoZXNlIGZpZWxkc1xyXG4vLyAgIHdpbGwgYmUgY2hlY2tlZCBmb3IgaWdub3JlZCBjb21iYXRhbnRzIChlLmcuIHBldHMpIGR1cmluZyBsb2cgZmlsdGVyaW5nLlxyXG5leHBvcnQgdHlwZSBBbmFseXNpc09wdGlvbnM8SyBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lPiA9IHtcclxuICBpbmNsdWRlOiAnbmV2ZXInO1xyXG4gIGZpbHRlcnM/OiB1bmRlZmluZWQ7XHJcbiAgY29tYmF0YW50SWRGaWVsZHM/OiB1bmRlZmluZWQ7XHJcbn0gfCB7XHJcbiAgaW5jbHVkZTogJ2ZpbHRlcic7XHJcbiAgZmlsdGVyczogTmV0UGFyYW1zW0tdIHwgcmVhZG9ubHkgTmV0UGFyYW1zW0tdW107XHJcbiAgY29tYmF0YW50SWRGaWVsZHM/OiBMb2dEZWZGaWVsZElkeDxLPiB8IHJlYWRvbmx5IExvZ0RlZkZpZWxkSWR4PEs+W107XHJcbn0gfCB7XHJcbiAgaW5jbHVkZTogJ2FsbCc7XHJcbiAgZmlsdGVycz86IHVuZGVmaW5lZDtcclxuICBjb21iYXRhbnRJZEZpZWxkcz86IExvZ0RlZkZpZWxkSWR4PEs+IHwgcmVhZG9ubHkgTG9nRGVmRmllbGRJZHg8Sz5bXTtcclxufTtcclxuXHJcbi8vIFRPRE86IE1heWJlIGJyaW5nIGluIGEgaGVscGVyIGxpYnJhcnkgdGhhdCBjYW4gY29tcGlsZS10aW1lIGV4dHJhY3QgdGhlc2Uga2V5cyBpbnN0ZWFkP1xyXG5jb25zdCBjb21iYXRhbnRNZW1vcnlLZXlzOiByZWFkb25seSAoRXh0cmFjdDxrZXlvZiBQbHVnaW5Db21iYXRhbnRTdGF0ZSwgc3RyaW5nPilbXSA9IFtcclxuICAnQ3VycmVudFdvcmxkSUQnLFxyXG4gICdXb3JsZElEJyxcclxuICAnV29ybGROYW1lJyxcclxuICAnQk5wY0lEJyxcclxuICAnQk5wY05hbWVJRCcsXHJcbiAgJ1BhcnR5VHlwZScsXHJcbiAgJ0lEJyxcclxuICAnT3duZXJJRCcsXHJcbiAgJ1dlYXBvbklkJyxcclxuICAnVHlwZScsXHJcbiAgJ0pvYicsXHJcbiAgJ0xldmVsJyxcclxuICAnTmFtZScsXHJcbiAgJ0N1cnJlbnRIUCcsXHJcbiAgJ01heEhQJyxcclxuICAnQ3VycmVudE1QJyxcclxuICAnTWF4TVAnLFxyXG4gICdQb3NYJyxcclxuICAnUG9zWScsXHJcbiAgJ1Bvc1onLFxyXG4gICdIZWFkaW5nJyxcclxuICAnTW9uc3RlclR5cGUnLFxyXG4gICdTdGF0dXMnLFxyXG4gICdNb2RlbFN0YXR1cycsXHJcbiAgJ0FnZ3Jlc3Npb25TdGF0dXMnLFxyXG4gICdUYXJnZXRJRCcsXHJcbiAgJ0lzVGFyZ2V0YWJsZScsXHJcbiAgJ1JhZGl1cycsXHJcbiAgJ0Rpc3RhbmNlJyxcclxuICAnRWZmZWN0aXZlRGlzdGFuY2UnLFxyXG4gICdOUENUYXJnZXRJRCcsXHJcbiAgJ0N1cnJlbnRHUCcsXHJcbiAgJ01heEdQJyxcclxuICAnQ3VycmVudENQJyxcclxuICAnTWF4Q1AnLFxyXG4gICdQQ1RhcmdldElEJyxcclxuICAnSXNDYXN0aW5nMScsXHJcbiAgJ0lzQ2FzdGluZzInLFxyXG4gICdDYXN0QnVmZklEJyxcclxuICAnQ2FzdFRhcmdldElEJyxcclxuICAnQ2FzdEdyb3VuZFRhcmdldFgnLFxyXG4gICdDYXN0R3JvdW5kVGFyZ2V0WScsXHJcbiAgJ0Nhc3RHcm91bmRUYXJnZXRaJyxcclxuICAnQ2FzdER1cmF0aW9uQ3VycmVudCcsXHJcbiAgJ0Nhc3REdXJhdGlvbk1heCcsXHJcbiAgJ1RyYW5zZm9ybWF0aW9uSWQnLFxyXG5dIGFzIGNvbnN0O1xyXG5cclxuY29uc3QgbGF0ZXN0TG9nRGVmaW5pdGlvbnMgPSB7XHJcbiAgR2FtZUxvZzoge1xyXG4gICAgdHlwZTogJzAwJyxcclxuICAgIG5hbWU6ICdHYW1lTG9nJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGF0TG9nJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGNvZGU6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGxpbmU6IDQsXHJcbiAgICB9LFxyXG4gICAgc3ViRmllbGRzOiB7XHJcbiAgICAgIGNvZGU6IHtcclxuICAgICAgICAnMDAzOSc6IHtcclxuICAgICAgICAgIG5hbWU6ICdtZXNzYWdlJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcwMDM4Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ2VjaG8nLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJzAwNDQnOiB7XHJcbiAgICAgICAgICBuYW1lOiAnZGlhbG9nJyxcclxuICAgICAgICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICcwODM5Jzoge1xyXG4gICAgICAgICAgbmFtZTogJ21lc3NhZ2UnLFxyXG4gICAgICAgICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgY29kZTogWycwMDQ0JywgJzA4MzknXSB9LFxyXG4gICAgfSxcclxuICB9LFxyXG4gIENoYW5nZVpvbmU6IHtcclxuICAgIHR5cGU6ICcwMScsXHJcbiAgICBuYW1lOiAnQ2hhbmdlWm9uZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVGVycml0b3J5JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgfSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQ2hhbmdlZFBsYXllcjoge1xyXG4gICAgdHlwZTogJzAyJyxcclxuICAgIG5hbWU6ICdDaGFuZ2VkUGxheWVyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGFuZ2VQcmltYXJ5UGxheWVyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBBZGRlZENvbWJhdGFudDoge1xyXG4gICAgdHlwZTogJzAzJyxcclxuICAgIG5hbWU6ICdBZGRlZENvbWJhdGFudCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQWRkQ29tYmF0YW50JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICBqb2I6IDQsXHJcbiAgICAgIGxldmVsOiA1LFxyXG4gICAgICBvd25lcklkOiA2LFxyXG4gICAgICB3b3JsZElkOiA3LFxyXG4gICAgICB3b3JsZDogOCxcclxuICAgICAgbnBjTmFtZUlkOiA5LFxyXG4gICAgICBucGNCYXNlSWQ6IDEwLFxyXG4gICAgICBjdXJyZW50SHA6IDExLFxyXG4gICAgICBocDogMTIsXHJcbiAgICAgIGN1cnJlbnRNcDogMTMsXHJcbiAgICAgIG1wOiAxNCxcclxuICAgICAgLy8gbWF4VHA6IDE1LFxyXG4gICAgICAvLyB0cDogMTYsXHJcbiAgICAgIHg6IDE3LFxyXG4gICAgICB5OiAxOCxcclxuICAgICAgejogMTksXHJcbiAgICAgIGhlYWRpbmc6IDIwLFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IGlkOiAnNC57N30nIH0sIC8vIE5QQyBjb21iYXRhbnRzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgUmVtb3ZlZENvbWJhdGFudDoge1xyXG4gICAgdHlwZTogJzA0JyxcclxuICAgIG5hbWU6ICdSZW1vdmVkQ29tYmF0YW50JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdSZW1vdmVDb21iYXRhbnQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIGpvYjogNCxcclxuICAgICAgbGV2ZWw6IDUsXHJcbiAgICAgIG93bmVyOiA2LFxyXG4gICAgICB3b3JsZDogOCxcclxuICAgICAgbnBjTmFtZUlkOiA5LFxyXG4gICAgICBucGNCYXNlSWQ6IDEwLFxyXG4gICAgICBjdXJyZW50SHA6IDExLFxyXG4gICAgICBocDogMTIsXHJcbiAgICAgIGN1cnJlbnRNcDogMTMsXHJcbiAgICAgIG1wOiAxNCxcclxuICAgICAgLy8gY3VycmVudFRwOiAxNSxcclxuICAgICAgLy8gbWF4VHA6IDE2LFxyXG4gICAgICB4OiAxNyxcclxuICAgICAgeTogMTgsXHJcbiAgICAgIHo6IDE5LFxyXG4gICAgICBoZWFkaW5nOiAyMCxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBpZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFBhcnR5TGlzdDoge1xyXG4gICAgdHlwZTogJzExJyxcclxuICAgIG5hbWU6ICdQYXJ0eUxpc3QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1BhcnR5TGlzdCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBwYXJ0eUNvdW50OiAyLFxyXG4gICAgICBpZDA6IDMsXHJcbiAgICAgIGlkMTogNCxcclxuICAgICAgaWQyOiA1LFxyXG4gICAgICBpZDM6IDYsXHJcbiAgICAgIGlkNDogNyxcclxuICAgICAgaWQ1OiA4LFxyXG4gICAgICBpZDY6IDksXHJcbiAgICAgIGlkNzogMTAsXHJcbiAgICAgIGlkODogMTEsXHJcbiAgICAgIGlkOTogMTIsXHJcbiAgICAgIGlkMTA6IDEzLFxyXG4gICAgICBpZDExOiAxNCxcclxuICAgICAgaWQxMjogMTUsXHJcbiAgICAgIGlkMTM6IDE2LFxyXG4gICAgICBpZDE0OiAxNyxcclxuICAgICAgaWQxNTogMTgsXHJcbiAgICAgIGlkMTY6IDE5LFxyXG4gICAgICBpZDE3OiAyMCxcclxuICAgICAgaWQxODogMjEsXHJcbiAgICAgIGlkMTk6IDIyLFxyXG4gICAgICBpZDIwOiAyMyxcclxuICAgICAgaWQyMTogMjQsXHJcbiAgICAgIGlkMjI6IDI1LFxyXG4gICAgICBpZDIzOiAyNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMzogbnVsbCxcclxuICAgICAgNDogbnVsbCxcclxuICAgICAgNTogbnVsbCxcclxuICAgICAgNjogbnVsbCxcclxuICAgICAgNzogbnVsbCxcclxuICAgICAgODogbnVsbCxcclxuICAgICAgOTogbnVsbCxcclxuICAgICAgMTA6IG51bGwsXHJcbiAgICAgIDExOiBudWxsLFxyXG4gICAgICAxMjogbnVsbCxcclxuICAgICAgMTM6IG51bGwsXHJcbiAgICAgIDE0OiBudWxsLFxyXG4gICAgICAxNTogbnVsbCxcclxuICAgICAgMTY6IG51bGwsXHJcbiAgICAgIDE3OiBudWxsLFxyXG4gICAgICAxODogbnVsbCxcclxuICAgICAgMTk6IG51bGwsXHJcbiAgICAgIDIwOiBudWxsLFxyXG4gICAgICAyMTogbnVsbCxcclxuICAgICAgMjI6IG51bGwsXHJcbiAgICAgIDIzOiBudWxsLFxyXG4gICAgICAyNDogbnVsbCxcclxuICAgICAgMjU6IG51bGwsXHJcbiAgICAgIDI2OiBudWxsLFxyXG4gICAgfSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogMyxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGxhc3RJbmNsdWRlOiB0cnVlLFxyXG4gIH0sXHJcbiAgUGxheWVyU3RhdHM6IHtcclxuICAgIHR5cGU6ICcxMicsXHJcbiAgICBuYW1lOiAnUGxheWVyU3RhdHMnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1BsYXllclN0YXRzJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGpvYjogMixcclxuICAgICAgc3RyZW5ndGg6IDMsXHJcbiAgICAgIGRleHRlcml0eTogNCxcclxuICAgICAgdml0YWxpdHk6IDUsXHJcbiAgICAgIGludGVsbGlnZW5jZTogNixcclxuICAgICAgbWluZDogNyxcclxuICAgICAgcGlldHk6IDgsXHJcbiAgICAgIGF0dGFja1Bvd2VyOiA5LFxyXG4gICAgICBkaXJlY3RIaXQ6IDEwLFxyXG4gICAgICBjcml0aWNhbEhpdDogMTEsXHJcbiAgICAgIGF0dGFja01hZ2ljUG90ZW5jeTogMTIsXHJcbiAgICAgIGhlYWxNYWdpY1BvdGVuY3k6IDEzLFxyXG4gICAgICBkZXRlcm1pbmF0aW9uOiAxNCxcclxuICAgICAgc2tpbGxTcGVlZDogMTUsXHJcbiAgICAgIHNwZWxsU3BlZWQ6IDE2LFxyXG4gICAgICB0ZW5hY2l0eTogMTgsXHJcbiAgICAgIGxvY2FsQ29udGVudElkOiAxOSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBsYXN0SW5jbHVkZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgU3RhcnRzVXNpbmc6IHtcclxuICAgIHR5cGU6ICcyMCcsXHJcbiAgICBuYW1lOiAnU3RhcnRzVXNpbmcnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1N0YXJ0c0Nhc3RpbmcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIGFiaWxpdHk6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXQ6IDcsXHJcbiAgICAgIGNhc3RUaW1lOiA4LFxyXG4gICAgICB4OiA5LFxyXG4gICAgICB5OiAxMCxcclxuICAgICAgejogMTEsXHJcbiAgICAgIGhlYWRpbmc6IDEyLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2XSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiA3LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdmaWx0ZXInLFxyXG4gICAgICBmaWx0ZXJzOiB7IHNvdXJjZUlkOiAnNC57N30nIH0sIC8vIE5QQyBjYXN0cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWJpbGl0eToge1xyXG4gICAgdHlwZTogJzIxJyxcclxuICAgIG5hbWU6ICdBYmlsaXR5JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdBY3Rpb25FZmZlY3QnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgc291cmNlSWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgaWQ6IDQsXHJcbiAgICAgIGFiaWxpdHk6IDUsXHJcbiAgICAgIHRhcmdldElkOiA2LFxyXG4gICAgICB0YXJnZXQ6IDcsXHJcbiAgICAgIGZsYWdzOiA4LFxyXG4gICAgICBkYW1hZ2U6IDksXHJcbiAgICAgIHRhcmdldEN1cnJlbnRIcDogMjQsXHJcbiAgICAgIHRhcmdldE1heEhwOiAyNSxcclxuICAgICAgdGFyZ2V0Q3VycmVudE1wOiAyNixcclxuICAgICAgdGFyZ2V0TWF4TXA6IDI3LFxyXG4gICAgICAvLyB0YXJnZXRDdXJyZW50VHA6IDI4LFxyXG4gICAgICAvLyB0YXJnZXRNYXhUcDogMjksXHJcbiAgICAgIHRhcmdldFg6IDMwLFxyXG4gICAgICB0YXJnZXRZOiAzMSxcclxuICAgICAgdGFyZ2V0WjogMzIsXHJcbiAgICAgIHRhcmdldEhlYWRpbmc6IDMzLFxyXG4gICAgICBjdXJyZW50SHA6IDM0LFxyXG4gICAgICBtYXhIcDogMzUsXHJcbiAgICAgIGN1cnJlbnRNcDogMzYsXHJcbiAgICAgIG1heE1wOiAzNyxcclxuICAgICAgLy8gY3VycmVudFRwOiAzODtcclxuICAgICAgLy8gbWF4VHA6IDM5O1xyXG4gICAgICB4OiA0MCxcclxuICAgICAgeTogNDEsXHJcbiAgICAgIHo6IDQyLFxyXG4gICAgICBoZWFkaW5nOiA0MyxcclxuICAgICAgc2VxdWVuY2U6IDQ0LFxyXG4gICAgICB0YXJnZXRJbmRleDogNDUsXHJcbiAgICAgIHRhcmdldENvdW50OiA0NixcclxuICAgICAgb3duZXJJZDogNDcsXHJcbiAgICAgIG93bmVyTmFtZTogNDgsXHJcbiAgICAgIGVmZmVjdERpc3BsYXlUeXBlOiA0OSxcclxuICAgICAgYWN0aW9uSWQ6IDUwLFxyXG4gICAgICBhY3Rpb25BbmltYXRpb25JZDogNTEsXHJcbiAgICAgIGFuaW1hdGlvbkxvY2tUaW1lOiA1MixcclxuICAgICAgcm90YXRpb25IZXg6IDUzLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDY6IDcsXHJcbiAgICAgIDQ3OiA0OCxcclxuICAgIH0sXHJcbiAgICBibGFua0ZpZWxkczogWzYsIDQ3LCA0OF0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICAvLyBAVE9ETzogU2V0IHRoaXMgYmFjayB0byBgdW5kZWZpbmVkYCBhZnRlciBLUi9DTiBoYXZlIGFjY2VzcyB0byB0aGUgbmV3IGZpZWxkc1xyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA0NyxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyBzb3VyY2VJZDogJzQuezd9JyB9LCAvLyBOUEMgYWJpbGl0aWVzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCA2XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrQU9FQWJpbGl0eToge1xyXG4gICAgdHlwZTogJzIyJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrQU9FQWJpbGl0eScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnQU9FQWN0aW9uRWZmZWN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBhYmlsaXR5OiA1LFxyXG4gICAgICB0YXJnZXRJZDogNixcclxuICAgICAgdGFyZ2V0OiA3LFxyXG4gICAgICBmbGFnczogOCxcclxuICAgICAgZGFtYWdlOiA5LFxyXG4gICAgICB0YXJnZXRDdXJyZW50SHA6IDI0LFxyXG4gICAgICB0YXJnZXRNYXhIcDogMjUsXHJcbiAgICAgIHRhcmdldEN1cnJlbnRNcDogMjYsXHJcbiAgICAgIHRhcmdldE1heE1wOiAyNyxcclxuICAgICAgLy8gdGFyZ2V0Q3VycmVudFRwOiAyOCxcclxuICAgICAgLy8gdGFyZ2V0TWF4VHA6IDI5LFxyXG4gICAgICB0YXJnZXRYOiAzMCxcclxuICAgICAgdGFyZ2V0WTogMzEsXHJcbiAgICAgIHRhcmdldFo6IDMyLFxyXG4gICAgICB0YXJnZXRIZWFkaW5nOiAzMyxcclxuICAgICAgY3VycmVudEhwOiAzNCxcclxuICAgICAgbWF4SHA6IDM1LFxyXG4gICAgICBjdXJyZW50TXA6IDM2LFxyXG4gICAgICBtYXhNcDogMzcsXHJcbiAgICAgIC8vIGN1cnJlbnRUcDogMzg7XHJcbiAgICAgIC8vIG1heFRwOiAzOTtcclxuICAgICAgeDogNDAsXHJcbiAgICAgIHk6IDQxLFxyXG4gICAgICB6OiA0MixcclxuICAgICAgaGVhZGluZzogNDMsXHJcbiAgICAgIHNlcXVlbmNlOiA0NCxcclxuICAgICAgdGFyZ2V0SW5kZXg6IDQ1LFxyXG4gICAgICB0YXJnZXRDb3VudDogNDYsXHJcbiAgICAgIG93bmVySWQ6IDQ3LFxyXG4gICAgICBvd25lck5hbWU6IDQ4LFxyXG4gICAgICBlZmZlY3REaXNwbGF5VHlwZTogNDksXHJcbiAgICAgIGFjdGlvbklkOiA1MCxcclxuICAgICAgYWN0aW9uQW5pbWF0aW9uSWQ6IDUxLFxyXG4gICAgICBhbmltYXRpb25Mb2NrVGltZTogNTIsXHJcbiAgICAgIHJvdGF0aW9uSGV4OiA1MyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVJzdkZpZWxkczogNSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA2OiA3LFxyXG4gICAgICA0NzogNDgsXHJcbiAgICB9LFxyXG4gICAgYmxhbmtGaWVsZHM6IFs2LCA0NywgNDhdLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgLy8gQFRPRE86IFNldCB0aGlzIGJhY2sgdG8gYHVuZGVmaW5lZGAgYWZ0ZXIgS1IvQ04gaGF2ZSBhY2Nlc3MgdG8gdGhlIG5ldyBmaWVsZHNcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogNDcsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGFiaWxpdGllcyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNl0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmV0d29ya0NhbmNlbEFiaWxpdHk6IHtcclxuICAgIHR5cGU6ICcyMycsXHJcbiAgICBuYW1lOiAnTmV0d29ya0NhbmNlbEFiaWxpdHknLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0NhbmNlbEFjdGlvbicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgc291cmNlOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgbmFtZTogNSxcclxuICAgICAgcmVhc29uOiA2LFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiA1LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNvbWJhdGFudHMgb25seVxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrRG9UOiB7XHJcbiAgICB0eXBlOiAnMjQnLFxyXG4gICAgbmFtZTogJ05ldHdvcmtEb1QnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0RvVEhvVCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgd2hpY2g6IDQsXHJcbiAgICAgIGVmZmVjdElkOiA1LFxyXG4gICAgICBkYW1hZ2U6IDYsXHJcbiAgICAgIGN1cnJlbnRIcDogNyxcclxuICAgICAgbWF4SHA6IDgsXHJcbiAgICAgIGN1cnJlbnRNcDogOSxcclxuICAgICAgbWF4TXA6IDEwLFxyXG4gICAgICAvLyBjdXJyZW50VHA6IDExLFxyXG4gICAgICAvLyBtYXhUcDogMTIsXHJcbiAgICAgIHg6IDEzLFxyXG4gICAgICB5OiAxNCxcclxuICAgICAgejogMTUsXHJcbiAgICAgIGhlYWRpbmc6IDE2LFxyXG4gICAgICBzb3VyY2VJZDogMTcsXHJcbiAgICAgIHNvdXJjZTogMTgsXHJcbiAgICAgIC8vIEFuIGlkIG51bWJlciBsb29rdXAgaW50byB0aGUgQXR0YWNrVHlwZSB0YWJsZVxyXG4gICAgICBkYW1hZ2VUeXBlOiAxOSxcclxuICAgICAgc291cmNlQ3VycmVudEhwOiAyMCxcclxuICAgICAgc291cmNlTWF4SHA6IDIxLFxyXG4gICAgICBzb3VyY2VDdXJyZW50TXA6IDIyLFxyXG4gICAgICBzb3VyY2VNYXhNcDogMjMsXHJcbiAgICAgIC8vIHNvdXJjZUN1cnJlbnRUcDogMjQsXHJcbiAgICAgIC8vIHNvdXJjZU1heFRwOiAyNSxcclxuICAgICAgc291cmNlWDogMjYsXHJcbiAgICAgIHNvdXJjZVk6IDI3LFxyXG4gICAgICBzb3VyY2VaOiAyOCxcclxuICAgICAgc291cmNlSGVhZGluZzogMjksXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICAgIDE3OiAxOCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyAvLyBEb1Qgb24gcGxheWVyIHdpdGggdmFsaWQgZWZmZWN0SWRcclxuICAgICAgICBpZDogJzEuezd9JyxcclxuICAgICAgICB3aGljaDogJ0RvVCcsXHJcbiAgICAgICAgZWZmZWN0SWQ6ICcwKj9bMS05QS1GXVswLTlBLUZdKicsIC8vIG5vbi16ZXJvLCBub24tZW1wdHksIHBvc3NpYmx5LXBhZGRlZCB2YWx1ZVxyXG4gICAgICB9LFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzIsIDE3XSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBXYXNEZWZlYXRlZDoge1xyXG4gICAgdHlwZTogJzI1JyxcclxuICAgIG5hbWU6ICdXYXNEZWZlYXRlZCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRGVhdGgnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgdGFyZ2V0SWQ6IDIsXHJcbiAgICAgIHRhcmdldDogMyxcclxuICAgICAgc291cmNlSWQ6IDQsXHJcbiAgICAgIHNvdXJjZTogNSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgICAgNDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogeyB0YXJnZXRJZDogJzQuezd9JyB9LCAvLyBOUEMgY29tYmF0YW50cyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLCAvLyBkb24ndCBhcHBseSB0byBzb3VyY2VJZDsgYW4gaWdub3JlZCBjb21iYXRhbnQgaXMgYSB2YWxpZCBzb3VyY2VcclxuICAgIH0sXHJcbiAgfSxcclxuICBHYWluc0VmZmVjdDoge1xyXG4gICAgdHlwZTogJzI2JyxcclxuICAgIG5hbWU6ICdHYWluc0VmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzQWRkJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGVmZmVjdElkOiAyLFxyXG4gICAgICBlZmZlY3Q6IDMsXHJcbiAgICAgIGR1cmF0aW9uOiA0LFxyXG4gICAgICBzb3VyY2VJZDogNSxcclxuICAgICAgc291cmNlOiA2LFxyXG4gICAgICB0YXJnZXRJZDogNyxcclxuICAgICAgdGFyZ2V0OiA4LFxyXG4gICAgICBjb3VudDogOSxcclxuICAgICAgdGFyZ2V0TWF4SHA6IDEwLFxyXG4gICAgICBzb3VyY2VNYXhIcDogMTEsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVSc3ZGaWVsZHM6IDMsXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgNTogNixcclxuICAgICAgNzogOCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnZmlsdGVyJyxcclxuICAgICAgZmlsdGVyczogW1xyXG4gICAgICAgIHsgLy8gZWZmZWN0IGZyb20gZW52aXJvbm1lbnQvTlBDIGFwcGxpZWQgdG8gcGxheWVyXHJcbiAgICAgICAgICBzb3VyY2VJZDogJ1tFNF0uezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnMS57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBlZmZlY3RzIGFwcGxpZWQgYnkgTlBDcyB0byBvdGhlciBOUENzIChpbmNsdWRpbmcgdGhlbXNlbHZlcylcclxuICAgICAgICAgIHNvdXJjZUlkOiAnNC57N30nLFxyXG4gICAgICAgICAgdGFyZ2V0SWQ6ICc0Lns3fScsXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IC8vIGtub3duIGVmZmVjdElkcyBvZiBpbnRlcmVzdFxyXG4gICAgICAgICAgZWZmZWN0SWQ6IFsnQjlBJywgJzgwOCddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbNSwgN10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgSGVhZE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI3JyxcclxuICAgIG5hbWU6ICdIZWFkTWFya2VyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdUYXJnZXRJY29uJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHRhcmdldElkOiAyLFxyXG4gICAgICB0YXJnZXQ6IDMsXHJcbiAgICAgIGlkOiA2LFxyXG4gICAgICBkYXRhMDogNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogMyxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVBsYXllcklkczogWzddLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA3LFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBOZXR3b3JrUmFpZE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI4JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrUmFpZE1hcmtlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnV2F5bWFya01hcmtlcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBvcGVyYXRpb246IDIsXHJcbiAgICAgIHdheW1hcms6IDMsXHJcbiAgICAgIGlkOiA0LFxyXG4gICAgICBuYW1lOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTmV0d29ya1RhcmdldE1hcmtlcjoge1xyXG4gICAgdHlwZTogJzI5JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrVGFyZ2V0TWFya2VyJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTaWduTWFya2VyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG9wZXJhdGlvbjogMiwgLy8gQWRkLCBVcGRhdGUsIERlbGV0ZVxyXG4gICAgICB3YXltYXJrOiAzLFxyXG4gICAgICBpZDogNCxcclxuICAgICAgbmFtZTogNSxcclxuICAgICAgdGFyZ2V0SWQ6IDYsXHJcbiAgICAgIHRhcmdldE5hbWU6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDQ6IDUsXHJcbiAgICAgIDY6IDcsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBMb3Nlc0VmZmVjdDoge1xyXG4gICAgdHlwZTogJzMwJyxcclxuICAgIG5hbWU6ICdMb3Nlc0VmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzUmVtb3ZlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGVmZmVjdElkOiAyLFxyXG4gICAgICBlZmZlY3Q6IDMsXHJcbiAgICAgIHNvdXJjZUlkOiA1LFxyXG4gICAgICBzb3VyY2U6IDYsXHJcbiAgICAgIHRhcmdldElkOiA3LFxyXG4gICAgICB0YXJnZXQ6IDgsXHJcbiAgICAgIGNvdW50OiA5LFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUnN2RmllbGRzOiAzLFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDU6IDYsXHJcbiAgICAgIDc6IDgsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IFtcclxuICAgICAgICB7IC8vIGVmZmVjdCBmcm9tIGVudmlyb25tZW50L05QQyBhcHBsaWVkIHRvIHBsYXllclxyXG4gICAgICAgICAgc291cmNlSWQ6ICdbRTRdLns3fScsXHJcbiAgICAgICAgICB0YXJnZXRJZDogJzEuezd9JyxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHsgLy8gZWZmZWN0cyBhcHBsaWVkIGJ5IE5QQ3MgdG8gb3RoZXIgTlBDcyAoaW5jbHVkaW5nIHRoZW1zZWx2ZXMpXHJcbiAgICAgICAgICBzb3VyY2VJZDogJzQuezd9JyxcclxuICAgICAgICAgIHRhcmdldElkOiAnNC57N30nLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyAvLyBrbm93biBlZmZlY3RJZHMgb2YgaW50ZXJlc3RcclxuICAgICAgICAgIGVmZmVjdElkOiBbJ0I5QScsICc4MDgnXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogWzUsIDddLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIE5ldHdvcmtHYXVnZToge1xyXG4gICAgdHlwZTogJzMxJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrR2F1Z2UnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0dhdWdlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBkYXRhMDogMyxcclxuICAgICAgZGF0YTE6IDQsXHJcbiAgICAgIGRhdGEyOiA1LFxyXG4gICAgICBkYXRhMzogNixcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICAvLyBTb21ldGltZXMgdGhpcyBsYXN0IGZpZWxkIGxvb2tzIGxpa2UgYSBwbGF5ZXIgaWQuXHJcbiAgICAvLyBGb3Igc2FmZXR5LCBhbm9ueW1pemUgYWxsIG9mIHRoZSBnYXVnZSBkYXRhLlxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDMsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5ldHdvcmtXb3JsZDoge1xyXG4gICAgdHlwZTogJzMyJyxcclxuICAgIG5hbWU6ICdOZXR3b3JrV29ybGQnLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1dvcmxkJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgaXNVbmtub3duOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBBY3RvckNvbnRyb2w6IHtcclxuICAgIHR5cGU6ICczMycsXHJcbiAgICBuYW1lOiAnQWN0b3JDb250cm9sJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdEaXJlY3RvcicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpbnN0YW5jZTogMixcclxuICAgICAgY29tbWFuZDogMyxcclxuICAgICAgZGF0YTA6IDQsXHJcbiAgICAgIGRhdGExOiA1LFxyXG4gICAgICBkYXRhMjogNixcclxuICAgICAgZGF0YTM6IDcsXHJcbiAgICB9LFxyXG4gICAgcG9zc2libGVQbGF5ZXJJZHM6IFs0LCA1LCA2LCA3XSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTmFtZVRvZ2dsZToge1xyXG4gICAgdHlwZTogJzM0JyxcclxuICAgIG5hbWU6ICdOYW1lVG9nZ2xlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdOYW1lVG9nZ2xlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBuYW1lOiAzLFxyXG4gICAgICB0YXJnZXRJZDogNCxcclxuICAgICAgdGFyZ2V0TmFtZTogNSxcclxuICAgICAgdG9nZ2xlOiA2LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgVGV0aGVyOiB7XHJcbiAgICB0eXBlOiAnMzUnLFxyXG4gICAgbmFtZTogJ1RldGhlcicsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnVGV0aGVyJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHNvdXJjZUlkOiAyLFxyXG4gICAgICBzb3VyY2U6IDMsXHJcbiAgICAgIHRhcmdldElkOiA0LFxyXG4gICAgICB0YXJnZXQ6IDUsXHJcbiAgICAgIGlkOiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgICA0OiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiA5LFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiBbMiwgNF0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgTGltaXRCcmVhazoge1xyXG4gICAgdHlwZTogJzM2JyxcclxuICAgIG5hbWU6ICdMaW1pdEJyZWFrJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdMaW1pdEJyZWFrJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHZhbHVlSGV4OiAyLFxyXG4gICAgICBiYXJzOiAzLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTmV0d29ya0VmZmVjdFJlc3VsdDoge1xyXG4gICAgdHlwZTogJzM3JyxcclxuICAgIG5hbWU6ICdOZXR3b3JrRWZmZWN0UmVzdWx0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdFZmZlY3RSZXN1bHQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIHNlcXVlbmNlSWQ6IDQsXHJcbiAgICAgIGN1cnJlbnRIcDogNSxcclxuICAgICAgbWF4SHA6IDYsXHJcbiAgICAgIGN1cnJlbnRNcDogNyxcclxuICAgICAgbWF4TXA6IDgsXHJcbiAgICAgIGN1cnJlbnRTaGllbGQ6IDksXHJcbiAgICAgIC8vIEZpZWxkIGluZGV4IDEwIGlzIGFsd2F5cyBgMGBcclxuICAgICAgeDogMTEsXHJcbiAgICAgIHk6IDEyLFxyXG4gICAgICB6OiAxMyxcclxuICAgICAgaGVhZGluZzogMTQsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDIyLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGF0dXNFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICczOCcsXHJcbiAgICBuYW1lOiAnU3RhdHVzRWZmZWN0JyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTdGF0dXNMaXN0JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIHRhcmdldElkOiAyLFxyXG4gICAgICB0YXJnZXQ6IDMsXHJcbiAgICAgIGpvYkxldmVsRGF0YTogNCxcclxuICAgICAgaHA6IDUsXHJcbiAgICAgIG1heEhwOiA2LFxyXG4gICAgICBtcDogNyxcclxuICAgICAgbWF4TXA6IDgsXHJcbiAgICAgIGN1cnJlbnRTaGllbGQ6IDksXHJcbiAgICAgIC8vIEZpZWxkIGluZGV4IDEwIGlzIGFsd2F5cyBgMGBcclxuICAgICAgeDogMTEsXHJcbiAgICAgIHk6IDEyLFxyXG4gICAgICB6OiAxMyxcclxuICAgICAgaGVhZGluZzogMTQsXHJcbiAgICAgIGRhdGEwOiAxNSxcclxuICAgICAgZGF0YTE6IDE2LFxyXG4gICAgICBkYXRhMjogMTcsXHJcbiAgICAgIGRhdGEzOiAxOCxcclxuICAgICAgZGF0YTQ6IDE5LFxyXG4gICAgICBkYXRhNTogMjAsXHJcbiAgICAgIC8vIFZhcmlhYmxlIG51bWJlciBvZiB0cmlwbGV0cyBoZXJlLCBidXQgYXQgbGVhc3Qgb25lLlxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiAzLFxyXG4gICAgfSxcclxuICAgIGZpcnN0VW5rbm93bkZpZWxkOiAxOCxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogMTgsXHJcbiAgfSxcclxuICBOZXR3b3JrVXBkYXRlSFA6IHtcclxuICAgIHR5cGU6ICczOScsXHJcbiAgICBuYW1lOiAnTmV0d29ya1VwZGF0ZUhQJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdVcGRhdGVIcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgbmFtZTogMyxcclxuICAgICAgY3VycmVudEhwOiA0LFxyXG4gICAgICBtYXhIcDogNSxcclxuICAgICAgY3VycmVudE1wOiA2LFxyXG4gICAgICBtYXhNcDogNyxcclxuICAgICAgLy8gY3VycmVudFRwOiA4LFxyXG4gICAgICAvLyBtYXhUcDogOSxcclxuICAgICAgeDogMTAsXHJcbiAgICAgIHk6IDExLFxyXG4gICAgICB6OiAxMixcclxuICAgICAgaGVhZGluZzogMTMsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBNYXA6IHtcclxuICAgIHR5cGU6ICc0MCcsXHJcbiAgICBuYW1lOiAnTWFwJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdDaGFuZ2VNYXAnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHJlZ2lvbk5hbWU6IDMsXHJcbiAgICAgIHBsYWNlTmFtZTogNCxcclxuICAgICAgcGxhY2VOYW1lU3ViOiA1LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgbGFzdEluY2x1ZGU6IHRydWUsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgU3lzdGVtTG9nTWVzc2FnZToge1xyXG4gICAgdHlwZTogJzQxJyxcclxuICAgIG5hbWU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTeXN0ZW1Mb2dNZXNzYWdlJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBpZDogMyxcclxuICAgICAgcGFyYW0wOiA0LFxyXG4gICAgICBwYXJhbTE6IDUsXHJcbiAgICAgIHBhcmFtMjogNixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBTdGF0dXNMaXN0Mzoge1xyXG4gICAgdHlwZTogJzQyJyxcclxuICAgIG5hbWU6ICdTdGF0dXNMaXN0MycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnU3RhdHVzTGlzdDMnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIG5hbWU6IDMsXHJcbiAgICAgIC8vIHRyaXBsZXRzIG9mIGZpZWxkcyBmcm9tIGhlcmUgKGVmZmVjdElkLCBkYXRhLCBwbGF5ZXJJZCk/XHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDMsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiA0LFxyXG4gICAgZmlyc3RVbmtub3duRmllbGQ6IDQsXHJcbiAgfSxcclxuICBQYXJzZXJJbmZvOiB7XHJcbiAgICB0eXBlOiAnMjQ5JyxcclxuICAgIG5hbWU6ICdQYXJzZXJJbmZvJyxcclxuICAgIHNvdXJjZTogJ0ZGWElWX0FDVF9QbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICdTZXR0aW5ncycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFByb2Nlc3NJbmZvOiB7XHJcbiAgICB0eXBlOiAnMjUwJyxcclxuICAgIG5hbWU6ICdQcm9jZXNzSW5mbycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUHJvY2VzcycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGdsb2JhbEluY2x1ZGU6IHRydWUsXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIERlYnVnOiB7XHJcbiAgICB0eXBlOiAnMjUxJyxcclxuICAgIG5hbWU6ICdEZWJ1ZycsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnRGVidWcnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiBmYWxzZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgUGFja2V0RHVtcDoge1xyXG4gICAgdHlwZTogJzI1MicsXHJcbiAgICBuYW1lOiAnUGFja2V0RHVtcCcsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnUGFja2V0RHVtcCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogZmFsc2UsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIFZlcnNpb246IHtcclxuICAgIHR5cGU6ICcyNTMnLFxyXG4gICAgbmFtZTogJ1ZlcnNpb24nLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ1ZlcnNpb24nLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBFcnJvcjoge1xyXG4gICAgdHlwZTogJzI1NCcsXHJcbiAgICBuYW1lOiAnRXJyb3InLFxyXG4gICAgc291cmNlOiAnRkZYSVZfQUNUX1BsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJ0Vycm9yJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiBmYWxzZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgTm9uZToge1xyXG4gICAgdHlwZTogJ1swLTldKycsXHJcbiAgICBuYW1lOiAnTm9uZScsXHJcbiAgICBzb3VyY2U6ICdGRlhJVl9BQ1RfUGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnTm9uZScsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgfSxcclxuICAgIGlzVW5rbm93bjogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgLy8gT3ZlcmxheVBsdWdpbiBsb2cgbGluZXNcclxuICBMaW5lUmVnaXN0cmF0aW9uOiB7XHJcbiAgICB0eXBlOiAnMjU2JyxcclxuICAgIG5hbWU6ICdMaW5lUmVnaXN0cmF0aW9uJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNTYnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIHNvdXJjZTogMyxcclxuICAgICAgbmFtZTogNCxcclxuICAgICAgdmVyc2lvbjogNSxcclxuICAgIH0sXHJcbiAgICBnbG9iYWxJbmNsdWRlOiB0cnVlLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgfSxcclxuICBNYXBFZmZlY3Q6IHtcclxuICAgIHR5cGU6ICcyNTcnLFxyXG4gICAgbmFtZTogJ01hcEVmZmVjdCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU3JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluc3RhbmNlOiAyLFxyXG4gICAgICBmbGFnczogMyxcclxuICAgICAgLy8gdmFsdWVzIGZvciB0aGUgbG9jYXRpb24gZmllbGQgc2VlbSB0byB2YXJ5IGJldHdlZW4gaW5zdGFuY2VzXHJcbiAgICAgIC8vIChlLmcuIGEgbG9jYXRpb24gb2YgJzA4JyBpbiBQNVMgZG9lcyBub3QgYXBwZWFyIHRvIGJlIHRoZSBzYW1lIGxvY2F0aW9uIGluIFA1UyBhcyBpbiBQNlMpXHJcbiAgICAgIC8vIGJ1dCB0aGlzIGZpZWxkIGRvZXMgYXBwZWFyIHRvIGNvbnNpc3RlbnRseSBjb250YWluIHBvc2l0aW9uIGluZm8gZm9yIHRoZSBlZmZlY3QgcmVuZGVyaW5nXHJcbiAgICAgIGxvY2F0aW9uOiA0LFxyXG4gICAgICBkYXRhMDogNSxcclxuICAgICAgZGF0YTE6IDYsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgRmF0ZURpcmVjdG9yOiB7XHJcbiAgICB0eXBlOiAnMjU4JyxcclxuICAgIG5hbWU6ICdGYXRlRGlyZWN0b3InLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI1OCcsXHJcbiAgICAvLyBmYXRlSWQgYW5kIHByb2dyZXNzIGFyZSBpbiBoZXguXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBjYXRlZ29yeTogMixcclxuICAgICAgLy8gcGFkZGluZzA6IDMsXHJcbiAgICAgIGZhdGVJZDogNCxcclxuICAgICAgcHJvZ3Jlc3M6IDUsXHJcbiAgICAgIC8vIHBhcmFtMzogNixcclxuICAgICAgLy8gcGFyYW00OiA3LFxyXG4gICAgICAvLyBwYXJhbTU6IDgsXHJcbiAgICAgIC8vIHBhcmFtNjogOSxcclxuICAgICAgLy8gcGFkZGluZzE6IDEwLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gIH0sXHJcbiAgQ0VEaXJlY3Rvcjoge1xyXG4gICAgdHlwZTogJzI1OScsXHJcbiAgICBuYW1lOiAnQ0VEaXJlY3RvcicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjU5JyxcclxuICAgIC8vIGFsbCBmaWVsZHMgYXJlIGluIGhleFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgcG9wVGltZTogMixcclxuICAgICAgdGltZVJlbWFpbmluZzogMyxcclxuICAgICAgLy8gdW5rbm93bjA6IDQsXHJcbiAgICAgIGNlS2V5OiA1LFxyXG4gICAgICBudW1QbGF5ZXJzOiA2LFxyXG4gICAgICBzdGF0dXM6IDcsXHJcbiAgICAgIC8vIHVua25vd24xOiA4LFxyXG4gICAgICBwcm9ncmVzczogOSxcclxuICAgICAgLy8gdW5rbm93bjI6IDEwLFxyXG4gICAgICAvLyB1bmtub3duMzogMTEsXHJcbiAgICAgIC8vIHVua25vd240OiAxMixcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIEluQ29tYmF0OiB7XHJcbiAgICB0eXBlOiAnMjYwJyxcclxuICAgIG5hbWU6ICdJbkNvbWJhdCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYwJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGluQUNUQ29tYmF0OiAyLFxyXG4gICAgICBpbkdhbWVDb21iYXQ6IDMsXHJcbiAgICAgIGlzQUNUQ2hhbmdlZDogNCxcclxuICAgICAgaXNHYW1lQ2hhbmdlZDogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDb21iYXRhbnRNZW1vcnk6IHtcclxuICAgIHR5cGU6ICcyNjEnLFxyXG4gICAgbmFtZTogJ0NvbWJhdGFudE1lbW9yeScsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjYxJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGNoYW5nZTogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIC8vIGZyb20gaGVyZSwgcGFpcnMgb2YgZmllbGQgbmFtZS92YWx1ZXNcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IDUsXHJcbiAgICAvLyBkb2Vzbid0IHVzZSBgcGxheWVySWRzYCwgYXMgdGhlIGBpZGAgZmllbGQgbXVzdCBiZSBoYW5kbGVkIHdpdGggdGhlICdOYW1lJyByZXBlYXRpbmcgZmllbGRcclxuICAgIHJlcGVhdGluZ0ZpZWxkczoge1xyXG4gICAgICBzdGFydGluZ0luZGV4OiA0LFxyXG4gICAgICBsYWJlbDogJ3BhaXInLFxyXG4gICAgICBuYW1lczogWydrZXknLCAndmFsdWUnXSxcclxuICAgICAgc29ydEtleXM6IHRydWUsXHJcbiAgICAgIHByaW1hcnlLZXk6ICdrZXknLFxyXG4gICAgICBwb3NzaWJsZUtleXM6IGNvbWJhdGFudE1lbW9yeUtleXMsXHJcbiAgICAgIGtleXNUb0Fub255bWl6ZToge1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBxdW90ZS1wcm9wc1xyXG4gICAgICAgIDM6ICdOYW1lJywgLy8gJ0lEJyByZXBlYXRpbmcgZmllbGQgbm90IHVzZWQ/IG5lZWQgdG8gdXNlIG5vbi1yZXBlYXRpbmcgYGlkYCAoMykgZmllbGRcclxuICAgICAgICAnT3duZXJJRCc6IG51bGwsXHJcbiAgICAgICAgJ1RhcmdldElEJzogbnVsbCxcclxuICAgICAgICAnUENUYXJnZXRJRCc6IG51bGwsXHJcbiAgICAgICAgJ05QQ1RhcmdldElEJzogbnVsbCxcclxuICAgICAgICAnQ2FzdFRhcmdldElEJzogbnVsbCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIC8vIFRPRE86IFRoaXMgaXMgYW4gaW5pdGlhbCBhdHRlbXB0IHRvIGNhcHR1cmUgZmllbGQgY2hhbmdlcyB0aGF0IGFyZSByZWxldmFudCB0byBhbmFseXNpcyxcclxuICAgICAgLy8gYnV0IHRoaXMgd2lsbCBsaWtlbHkgbmVlZCB0byBiZSByZWZpbmVkIG92ZXIgdGltZVxyXG4gICAgICBmaWx0ZXJzOiBbXHJcbiAgICAgICAgeyAvLyBUT0RPOiBNb2RlbFN0YXR1cyBjYW4gYmUgYSBsaXR0bGUgc3BhbW15LiBTaG91bGQgdHJ5IHRvIHJlZmluZSB0aGlzIGZ1cnRoZXIuXHJcbiAgICAgICAgICBpZDogJzQuezd9JyxcclxuICAgICAgICAgIGNoYW5nZTogJ0NoYW5nZScsXHJcbiAgICAgICAgICBwYWlyOiBbeyBrZXk6ICdNb2RlbFN0YXR1cycsIHZhbHVlOiAnLionIH1dLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaWQ6ICc0Lns3fScsXHJcbiAgICAgICAgICBjaGFuZ2U6ICdDaGFuZ2UnLFxyXG4gICAgICAgICAgcGFpcjogW3sga2V5OiAnV2VhcG9uSWQnLCB2YWx1ZTogJy4qJyB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnNC57N30nLFxyXG4gICAgICAgICAgY2hhbmdlOiAnQ2hhbmdlJyxcclxuICAgICAgICAgIHBhaXI6IFt7IGtleTogJ1RyYW5zZm9ybWF0aW9uSWQnLCB2YWx1ZTogJy4qJyB9XSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBSU1ZEYXRhOiB7XHJcbiAgICB0eXBlOiAnMjYyJyxcclxuICAgIG5hbWU6ICdSU1ZEYXRhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjInLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgbG9jYWxlOiAyLFxyXG4gICAgICAvLyB1bmtub3duMDogMyxcclxuICAgICAga2V5OiA0LFxyXG4gICAgICB2YWx1ZTogNSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICAvLyBSU1Ygc3Vic3RpdHV0aW9ucyBhcmUgcGVyZm9ybWVkIGF1dG9tYXRpY2FsbHkgYnkgdGhlIGZpbHRlclxyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFN0YXJ0c1VzaW5nRXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNjMnLFxyXG4gICAgbmFtZTogJ1N0YXJ0c1VzaW5nRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2MycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIHg6IDQsXHJcbiAgICAgIHk6IDUsXHJcbiAgICAgIHo6IDYsXHJcbiAgICAgIGhlYWRpbmc6IDcsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgc291cmNlSWQ6ICc0Lns3fScgfSwgLy8gTlBDIGNhc3RzIG9ubHlcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWJpbGl0eUV4dHJhOiB7XHJcbiAgICB0eXBlOiAnMjY0JyxcclxuICAgIG5hbWU6ICdBYmlsaXR5RXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBzb3VyY2VJZDogMixcclxuICAgICAgaWQ6IDMsXHJcbiAgICAgIGdsb2JhbEVmZmVjdENvdW50ZXI6IDQsXHJcbiAgICAgIGRhdGFGbGFnOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgICBoZWFkaW5nOiA5LFxyXG4gICAgfSxcclxuICAgIGJsYW5rRmllbGRzOiBbNl0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIENvbnRlbnRGaW5kZXJTZXR0aW5nczoge1xyXG4gICAgdHlwZTogJzI2NScsXHJcbiAgICBuYW1lOiAnQ29udGVudEZpbmRlclNldHRpbmdzJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNjUnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgem9uZUlkOiAyLFxyXG4gICAgICB6b25lTmFtZTogMyxcclxuICAgICAgaW5Db250ZW50RmluZGVyQ29udGVudDogNCxcclxuICAgICAgdW5yZXN0cmljdGVkUGFydHk6IDUsXHJcbiAgICAgIG1pbmltYWxJdGVtTGV2ZWw6IDYsXHJcbiAgICAgIHNpbGVuY2VFY2hvOiA3LFxyXG4gICAgICBleHBsb3Jlck1vZGU6IDgsXHJcbiAgICAgIGxldmVsU3luYzogOSxcclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICB9LFxyXG4gIE5wY1llbGw6IHtcclxuICAgIHR5cGU6ICcyNjYnLFxyXG4gICAgbmFtZTogJ05wY1llbGwnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI2NicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBucGNJZDogMixcclxuICAgICAgbnBjTmFtZUlkOiAzLFxyXG4gICAgICBucGNZZWxsSWQ6IDQsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEJhdHRsZVRhbGsyOiB7XHJcbiAgICB0eXBlOiAnMjY3JyxcclxuICAgIG5hbWU6ICdCYXR0bGVUYWxrMicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY3JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIG5wY0lkOiAyLFxyXG4gICAgICBpbnN0YW5jZTogMyxcclxuICAgICAgbnBjTmFtZUlkOiA0LFxyXG4gICAgICBpbnN0YW5jZUNvbnRlbnRUZXh0SWQ6IDUsXHJcbiAgICAgIGRpc3BsYXlNczogNixcclxuICAgICAgLy8gdW5rbm93bjE6IDcsXHJcbiAgICAgIC8vIHVua25vd24yOiA4LFxyXG4gICAgICAvLyB1bmtub3duMzogOSxcclxuICAgICAgLy8gdW5rbm93bjQ6IDEwLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICdhbGwnLFxyXG4gICAgICBjb21iYXRhbnRJZEZpZWxkczogMixcclxuICAgIH0sXHJcbiAgfSxcclxuICBDb3VudGRvd246IHtcclxuICAgIHR5cGU6ICcyNjgnLFxyXG4gICAgbmFtZTogJ0NvdW50ZG93bicsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY4JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICB3b3JsZElkOiAzLFxyXG4gICAgICBjb3VudGRvd25UaW1lOiA0LFxyXG4gICAgICByZXN1bHQ6IDUsXHJcbiAgICAgIG5hbWU6IDYsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IDYsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ25ldmVyJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBDb3VudGRvd25DYW5jZWw6IHtcclxuICAgIHR5cGU6ICcyNjknLFxyXG4gICAgbmFtZTogJ0NvdW50ZG93bkNhbmNlbCcsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjY5JyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICB3b3JsZElkOiAzLFxyXG4gICAgICBuYW1lOiA0LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiA0LFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIGluY2x1ZGU6ICduZXZlcicsXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgQWN0b3JNb3ZlOiB7XHJcbiAgICB0eXBlOiAnMjcwJyxcclxuICAgIG5hbWU6ICdBY3Rvck1vdmUnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3MCcsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgaGVhZGluZzogMywgLy8gT1AgY2FsbHMgdGhpcyAncm90YXRpb24nLCBidXQgY2FjdGJvdCBjb25zaXN0ZW50bHkgdXNlcyAnaGVhZGluZydcclxuICAgICAgLy8gdW5rbm93bjE6IDQsXHJcbiAgICAgIC8vIHVua25vd24yOiA1LFxyXG4gICAgICB4OiA2LFxyXG4gICAgICB5OiA3LFxyXG4gICAgICB6OiA4LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIGNhbkFub255bWl6ZTogdHJ1ZSxcclxuICAgIGZpcnN0T3B0aW9uYWxGaWVsZDogdW5kZWZpbmVkLFxyXG4gICAgYW5hbHlzaXNPcHRpb25zOiB7XHJcbiAgICAgIC8vIG5vIHJlYWwgd2F5IHRvIGZpbHRlciBub2lzZSwgZXZlbiBpZiAoaW5mcmVxdWVudGx5KSB1c2VkIGZvciB0cmlnZ2Vyc1xyXG4gICAgICBpbmNsdWRlOiAnbmV2ZXInLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFjdG9yU2V0UG9zOiB7XHJcbiAgICB0eXBlOiAnMjcxJyxcclxuICAgIG5hbWU6ICdBY3RvclNldFBvcycsXHJcbiAgICBzb3VyY2U6ICdPdmVybGF5UGx1Z2luJyxcclxuICAgIG1lc3NhZ2VUeXBlOiAnMjcxJyxcclxuICAgIGZpZWxkczoge1xyXG4gICAgICB0eXBlOiAwLFxyXG4gICAgICB0aW1lc3RhbXA6IDEsXHJcbiAgICAgIGlkOiAyLFxyXG4gICAgICBoZWFkaW5nOiAzLCAvLyBPUCBjYWxscyB0aGlzICdyb3RhdGlvbicsIGJ1dCBjYWN0Ym90IGNvbnNpc3RlbnRseSB1c2VzICdoZWFkaW5nJ1xyXG4gICAgICAvLyB1bmtub3duMTogNCxcclxuICAgICAgLy8gdW5rbm93bjI6IDUsXHJcbiAgICAgIHg6IDYsXHJcbiAgICAgIHk6IDcsXHJcbiAgICAgIHo6IDgsXHJcbiAgICB9LFxyXG4gICAgcGxheWVySWRzOiB7XHJcbiAgICAgIDI6IG51bGwsXHJcbiAgICB9LFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2ZpbHRlcicsXHJcbiAgICAgIGZpbHRlcnM6IHsgaWQ6ICc0Lns3fScgfSwgLy8gTlBDcyBvbmx5XHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIFNwYXduTnBjRXh0cmE6IHtcclxuICAgIHR5cGU6ICcyNzInLFxyXG4gICAgbmFtZTogJ1NwYXduTnBjRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3MicsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgcGFyZW50SWQ6IDMsXHJcbiAgICAgIHRldGhlcklkOiA0LFxyXG4gICAgICBhbmltYXRpb25TdGF0ZTogNSxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMzogbnVsbCwgLy8gYGlkYCBpcyBhbiBucGMsIGJ1dCBwYXJlbnRJZCBjb3VsZCBiZSBhIHRldGhlcmVkIHBsYXllcj9cclxuICAgIH0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IFsyLCAzXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBBY3RvckNvbnRyb2xFeHRyYToge1xyXG4gICAgdHlwZTogJzI3MycsXHJcbiAgICBuYW1lOiAnQWN0b3JDb250cm9sRXh0cmEnLFxyXG4gICAgc291cmNlOiAnT3ZlcmxheVBsdWdpbicsXHJcbiAgICBtZXNzYWdlVHlwZTogJzI3MycsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgdHlwZTogMCxcclxuICAgICAgdGltZXN0YW1wOiAxLFxyXG4gICAgICBpZDogMixcclxuICAgICAgY2F0ZWdvcnk6IDMsXHJcbiAgICAgIHBhcmFtMTogNCxcclxuICAgICAgcGFyYW0yOiA1LFxyXG4gICAgICBwYXJhbTM6IDYsXHJcbiAgICAgIHBhcmFtNDogNyxcclxuICAgIH0sXHJcbiAgICBwbGF5ZXJJZHM6IHtcclxuICAgICAgMjogbnVsbCxcclxuICAgIH0sXHJcbiAgICBwb3NzaWJsZVBsYXllcklkczogWzQsIDUsIDYsIDddLFxyXG4gICAgY2FuQW5vbnltaXplOiB0cnVlLFxyXG4gICAgZmlyc3RPcHRpb25hbEZpZWxkOiB1bmRlZmluZWQsXHJcbiAgICBhbmFseXNpc09wdGlvbnM6IHtcclxuICAgICAgaW5jbHVkZTogJ2FsbCcsXHJcbiAgICAgIGNvbWJhdGFudElkRmllbGRzOiAyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIEFjdG9yQ29udHJvbFNlbGZFeHRyYToge1xyXG4gICAgdHlwZTogJzI3NCcsXHJcbiAgICBuYW1lOiAnQWN0b3JDb250cm9sU2VsZkV4dHJhJyxcclxuICAgIHNvdXJjZTogJ092ZXJsYXlQbHVnaW4nLFxyXG4gICAgbWVzc2FnZVR5cGU6ICcyNzQnLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgIHR5cGU6IDAsXHJcbiAgICAgIHRpbWVzdGFtcDogMSxcclxuICAgICAgaWQ6IDIsXHJcbiAgICAgIGNhdGVnb3J5OiAzLFxyXG4gICAgICBwYXJhbTE6IDQsXHJcbiAgICAgIHBhcmFtMjogNSxcclxuICAgICAgcGFyYW0zOiA2LFxyXG4gICAgICBwYXJhbTQ6IDcsXHJcbiAgICAgIHBhcmFtNTogOCxcclxuICAgICAgcGFyYW02OiA5LFxyXG4gICAgfSxcclxuICAgIHBsYXllcklkczoge1xyXG4gICAgICAyOiBudWxsLFxyXG4gICAgfSxcclxuICAgIHBvc3NpYmxlUGxheWVySWRzOiBbNCwgNSwgNiwgNywgOCwgOV0sXHJcbiAgICBjYW5Bbm9ueW1pemU6IHRydWUsXHJcbiAgICBmaXJzdE9wdGlvbmFsRmllbGQ6IHVuZGVmaW5lZCxcclxuICAgIGFuYWx5c2lzT3B0aW9uczoge1xyXG4gICAgICBpbmNsdWRlOiAnYWxsJyxcclxuICAgICAgY29tYmF0YW50SWRGaWVsZHM6IDIsXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgY29uc3QgbG9nRGVmaW5pdGlvbnNWZXJzaW9ucyA9IHtcclxuICAnbGF0ZXN0JzogbGF0ZXN0TG9nRGVmaW5pdGlvbnMsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vLyBWZXJpZnkgdGhhdCB0aGlzIGhhcyB0aGUgcmlnaHQgdHlwZSwgYnV0IGV4cG9ydCBgYXMgY29uc3RgLlxyXG5jb25zdCBhc3NlcnRMb2dEZWZpbml0aW9uczogTG9nRGVmaW5pdGlvbk1hcCA9IGxhdGVzdExvZ0RlZmluaXRpb25zO1xyXG5jb25zb2xlLmFzc2VydChhc3NlcnRMb2dEZWZpbml0aW9ucyk7XHJcblxyXG5leHBvcnQgdHlwZSBMb2dEZWZpbml0aW9ucyA9IHR5cGVvZiBsYXRlc3RMb2dEZWZpbml0aW9ucztcclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvbk5hbWUgPSBrZXlvZiBMb2dEZWZpbml0aW9ucztcclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvblR5cGUgPSBMb2dEZWZpbml0aW9uc1tMb2dEZWZpbml0aW9uTmFtZV1bJ3R5cGUnXTtcclxuZXhwb3J0IHR5cGUgTG9nRGVmaW5pdGlvbk1hcCA9IHsgW0sgaW4gTG9nRGVmaW5pdGlvbk5hbWVdOiBMb2dEZWZpbml0aW9uPEs+IH07XHJcbmV4cG9ydCB0eXBlIExvZ0RlZmluaXRpb25WZXJzaW9ucyA9IGtleW9mIHR5cGVvZiBsb2dEZWZpbml0aW9uc1ZlcnNpb25zO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNOYXJyb3dpbmdUeXBlID0geyByZWFkb25seSByZXBlYXRpbmdGaWVsZHM6IHVua25vd24gfTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0ga2V5b2Yge1xyXG4gIFtcclxuICAgIHR5cGUgaW4gTG9nRGVmaW5pdGlvbk5hbWUgYXMgTG9nRGVmaW5pdGlvbnNbdHlwZV0gZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNOYXJyb3dpbmdUeXBlID8gdHlwZVxyXG4gICAgICA6IG5ldmVyXHJcbiAgXTogbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zID0ge1xyXG4gIFt0eXBlIGluIFJlcGVhdGluZ0ZpZWxkc1R5cGVzXTogTG9nRGVmaW5pdGlvbnNbdHlwZV0gJiB7XHJcbiAgICByZWFkb25seSByZXBlYXRpbmdGaWVsZHM6IEV4Y2x1ZGU8TG9nRGVmaW5pdGlvbnNbdHlwZV1bJ3JlcGVhdGluZ0ZpZWxkcyddLCB1bmRlZmluZWQ+O1xyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBQYXJzZUhlbHBlckZpZWxkPFxyXG4gIFR5cGUgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGaWVsZHMgZXh0ZW5kcyBOZXRGaWVsZHNSZXZlcnNlW1R5cGVdLFxyXG4gIEZpZWxkIGV4dGVuZHMga2V5b2YgRmllbGRzLFxyXG4+ID0ge1xyXG4gIGZpZWxkOiBGaWVsZHNbRmllbGRdIGV4dGVuZHMgc3RyaW5nID8gRmllbGRzW0ZpZWxkXSA6IG5ldmVyO1xyXG4gIHZhbHVlPzogc3RyaW5nO1xyXG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcclxuICByZXBlYXRpbmc/OiBib29sZWFuO1xyXG4gIHJlcGVhdGluZ0tleXM/OiBzdHJpbmdbXTtcclxuICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgcHJpbWFyeUtleT86IHN0cmluZztcclxuICBwb3NzaWJsZUtleXM/OiBzdHJpbmdbXTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFBhcnNlSGVscGVyRmllbGRzPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPSB7XHJcbiAgW2ZpZWxkIGluIGtleW9mIE5ldEZpZWxkc1JldmVyc2VbVF1dOiBQYXJzZUhlbHBlckZpZWxkPFQsIE5ldEZpZWxkc1JldmVyc2VbVF0sIGZpZWxkPjtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGxvZ0RlZmluaXRpb25zVmVyc2lvbnNbJ2xhdGVzdCddO1xyXG4iLCIvLyBIZWxwZXIgRXJyb3IgZm9yIFR5cGVTY3JpcHQgc2l0dWF0aW9ucyB3aGVyZSB0aGUgcHJvZ3JhbW1lciB0aGlua3MgdGhleVxyXG4vLyBrbm93IGJldHRlciB0aGFuIFR5cGVTY3JpcHQgdGhhdCBzb21lIHNpdHVhdGlvbiB3aWxsIG5ldmVyIG9jY3VyLlxyXG5cclxuLy8gVGhlIGludGVudGlvbiBoZXJlIGlzIHRoYXQgdGhlIHByb2dyYW1tZXIgZG9lcyBub3QgZXhwZWN0IGEgcGFydGljdWxhclxyXG4vLyBiaXQgb2YgY29kZSB0byBoYXBwZW4sIGFuZCBzbyBoYXMgbm90IHdyaXR0ZW4gY2FyZWZ1bCBlcnJvciBoYW5kbGluZy5cclxuLy8gSWYgaXQgZG9lcyBvY2N1ciwgYXQgbGVhc3QgdGhlcmUgd2lsbCBiZSBhbiBlcnJvciBhbmQgd2UgY2FuIGZpZ3VyZSBvdXQgd2h5LlxyXG4vLyBUaGlzIGlzIHByZWZlcmFibGUgdG8gY2FzdGluZyBvciBkaXNhYmxpbmcgVHlwZVNjcmlwdCBhbHRvZ2V0aGVyIGluIG9yZGVyIHRvXHJcbi8vIGF2b2lkIHN5bnRheCBlcnJvcnMuXHJcblxyXG4vLyBPbmUgY29tbW9uIGV4YW1wbGUgaXMgYSByZWdleCwgd2hlcmUgaWYgdGhlIHJlZ2V4IG1hdGNoZXMgdGhlbiBhbGwgb2YgdGhlXHJcbi8vIChub24tb3B0aW9uYWwpIHJlZ2V4IGdyb3VwcyB3aWxsIGFsc28gYmUgdmFsaWQsIGJ1dCBUeXBlU2NyaXB0IGRvZXNuJ3Qga25vdy5cclxuZXhwb3J0IGNsYXNzIFVucmVhY2hhYmxlQ29kZSBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCdUaGlzIGNvZGUgc2hvdWxkblxcJ3QgYmUgcmVhY2hlZCcpO1xyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOZXRGaWVsZHMsIE5ldEZpZWxkc1JldmVyc2UgfSBmcm9tICcuLi90eXBlcy9uZXRfZmllbGRzJztcclxuaW1wb3J0IHsgTmV0UGFyYW1zIH0gZnJvbSAnLi4vdHlwZXMvbmV0X3Byb3BzJztcclxuaW1wb3J0IHsgQ2FjdGJvdEJhc2VSZWdFeHAgfSBmcm9tICcuLi90eXBlcy9uZXRfdHJpZ2dlcic7XHJcblxyXG5pbXBvcnQgbG9nRGVmaW5pdGlvbnMsIHtcclxuICBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBsb2dEZWZpbml0aW9uc1ZlcnNpb25zLFxyXG4gIExvZ0RlZmluaXRpb25WZXJzaW9ucyxcclxuICBQYXJzZUhlbHBlckZpZWxkcyxcclxuICBSZXBlYXRpbmdGaWVsZHNEZWZpbml0aW9ucyxcclxuICBSZXBlYXRpbmdGaWVsZHNUeXBlcyxcclxufSBmcm9tICcuL25ldGxvZ19kZWZzJztcclxuaW1wb3J0IHsgVW5yZWFjaGFibGVDb2RlIH0gZnJvbSAnLi9ub3RfcmVhY2hlZCc7XHJcblxyXG5jb25zdCBzZXBhcmF0b3IgPSAnOic7XHJcbmNvbnN0IG1hdGNoRGVmYXVsdCA9ICdbXjpdKic7XHJcbmNvbnN0IG1hdGNoV2l0aENvbG9uc0RlZmF1bHQgPSAnKD86W146XXw6ICkqPyc7XHJcbmNvbnN0IGZpZWxkc1dpdGhQb3RlbnRpYWxDb2xvbnMgPSBbJ2VmZmVjdCcsICdhYmlsaXR5J107XHJcblxyXG5jb25zdCBkZWZhdWx0UGFyYW1zID0gPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBWIGV4dGVuZHMgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4+KHR5cGU6IFQsIHZlcnNpb246IFYsIGluY2x1ZGU/OiBzdHJpbmdbXSk6IFBhcnRpYWw8UGFyc2VIZWxwZXJGaWVsZHM8VD4+ID0+IHtcclxuICBjb25zdCBsb2dUeXBlID0gbG9nRGVmaW5pdGlvbnNWZXJzaW9uc1t2ZXJzaW9uXVt0eXBlXTtcclxuICBpZiAoaW5jbHVkZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBpbmNsdWRlID0gT2JqZWN0LmtleXMobG9nVHlwZS5maWVsZHMpO1xyXG4gICAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUpIHtcclxuICAgICAgaW5jbHVkZS5wdXNoKGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNvbnN0IHBhcmFtczoge1xyXG4gICAgW2luZGV4OiBudW1iZXJdOiB7XHJcbiAgICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICAgIHZhbHVlPzogc3RyaW5nO1xyXG4gICAgICBvcHRpb25hbDogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nPzogYm9vbGVhbjtcclxuICAgICAgcmVwZWF0aW5nS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgICBzb3J0S2V5cz86IGJvb2xlYW47XHJcbiAgICAgIHByaW1hcnlLZXk/OiBzdHJpbmc7XHJcbiAgICAgIHBvc3NpYmxlS2V5cz86IHN0cmluZ1tdO1xyXG4gICAgfTtcclxuICB9ID0ge307XHJcbiAgY29uc3QgZmlyc3RPcHRpb25hbEZpZWxkID0gbG9nVHlwZS5maXJzdE9wdGlvbmFsRmllbGQ7XHJcblxyXG4gIGZvciAoY29uc3QgW3Byb3AsIGluZGV4XSBvZiBPYmplY3QuZW50cmllcyhsb2dUeXBlLmZpZWxkcykpIHtcclxuICAgIGlmICghaW5jbHVkZS5pbmNsdWRlcyhwcm9wKSlcclxuICAgICAgY29udGludWU7XHJcbiAgICBjb25zdCBwYXJhbTogeyBmaWVsZDogc3RyaW5nOyB2YWx1ZT86IHN0cmluZzsgb3B0aW9uYWw6IGJvb2xlYW47IHJlcGVhdGluZz86IGJvb2xlYW4gfSA9IHtcclxuICAgICAgZmllbGQ6IHByb3AsXHJcbiAgICAgIG9wdGlvbmFsOiBmaXJzdE9wdGlvbmFsRmllbGQgIT09IHVuZGVmaW5lZCAmJiBpbmRleCA+PSBmaXJzdE9wdGlvbmFsRmllbGQsXHJcbiAgICB9O1xyXG4gICAgaWYgKHByb3AgPT09ICd0eXBlJylcclxuICAgICAgcGFyYW0udmFsdWUgPSBsb2dUeXBlLnR5cGU7XHJcblxyXG4gICAgcGFyYW1zW2luZGV4XSA9IHBhcmFtO1xyXG4gIH1cclxuXHJcbiAgaWYgKCdyZXBlYXRpbmdGaWVsZHMnIGluIGxvZ1R5cGUgJiYgaW5jbHVkZS5pbmNsdWRlcyhsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCkpIHtcclxuICAgIHBhcmFtc1tsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4XSA9IHtcclxuICAgICAgZmllbGQ6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLmxhYmVsLFxyXG4gICAgICBvcHRpb25hbDogZmlyc3RPcHRpb25hbEZpZWxkICE9PSB1bmRlZmluZWQgJiZcclxuICAgICAgICBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5zdGFydGluZ0luZGV4ID49IGZpcnN0T3B0aW9uYWxGaWVsZCxcclxuICAgICAgcmVwZWF0aW5nOiB0cnVlLFxyXG4gICAgICByZXBlYXRpbmdLZXlzOiBbLi4ubG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubmFtZXNdLFxyXG4gICAgICBzb3J0S2V5czogbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc29ydEtleXMsXHJcbiAgICAgIHByaW1hcnlLZXk6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnByaW1hcnlLZXksXHJcbiAgICAgIHBvc3NpYmxlS2V5czogWy4uLmxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnBvc3NpYmxlS2V5c10sXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHBhcmFtcyBhcyBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PjtcclxufTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSB7XHJcbiAgW25hbWUgaW4gUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWyduYW1lcyddW251bWJlcl1dOlxyXG4gICAgfCBzdHJpbmdcclxuICAgIHwgc3RyaW5nW107XHJcbn1bXTtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFxyXG4gIFRCYXNlIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRiBleHRlbmRzIGtleW9mIE5ldEZpZWxkc1tUQmFzZV0sXHJcbiAgVEtleSBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID0gVEJhc2UgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFRCYXNlIDogbmV2ZXIsXHJcbj4gPSBGIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzRGVmaW5pdGlvbnNbVEtleV1bJ3JlcGVhdGluZ0ZpZWxkcyddWydsYWJlbCddXHJcbiAgPyBSZXBlYXRpbmdGaWVsZHNNYXA8VEtleT4gOlxyXG4gIG5ldmVyO1xyXG5cclxudHlwZSBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuICBGIGV4dGVuZHMga2V5b2YgTmV0RmllbGRzW1RdLFxyXG4+ID0gVCBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc1R5cGVzID8gUmVwZWF0aW5nRmllbGRzTWFwVHlwZUNoZWNrPFQsIEY+XHJcbiAgOiBuZXZlcjtcclxuXHJcbnR5cGUgUGFyc2VIZWxwZXJUeXBlPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4gPVxyXG4gICYge1xyXG4gICAgW2ZpZWxkIGluIGtleW9mIE5ldEZpZWxkc1tUXV0/OiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IFJlcGVhdGluZ0ZpZWxkc01hcFR5cGU8VCwgZmllbGQ+O1xyXG4gIH1cclxuICAmIHsgY2FwdHVyZT86IGJvb2xlYW4gfTtcclxuXHJcbmNvbnN0IGlzUmVwZWF0aW5nRmllbGQgPSA8XHJcbiAgVCBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4+KFxyXG4gIHJlcGVhdGluZzogYm9vbGVhbiB8IHVuZGVmaW5lZCxcclxuICB2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gfCB1bmRlZmluZWQsXHJcbik6IHZhbHVlIGlzIFJlcGVhdGluZ0ZpZWxkc01hcDxUPiA9PiB7XHJcbiAgaWYgKHJlcGVhdGluZyAhPT0gdHJ1ZSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuICAvLyBBbGxvdyBleGNsdWRpbmcgdGhlIGZpZWxkIHRvIG1hdGNoIGZvciBleHRyYWN0aW9uXHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIGZvciAoY29uc3QgZSBvZiB2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZiBlICE9PSAnb2JqZWN0JylcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufTtcclxuXHJcbmNvbnN0IHBhcnNlSGVscGVyID0gPFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZT4oXHJcbiAgcGFyYW1zOiBQYXJzZUhlbHBlclR5cGU8VD4gfCB1bmRlZmluZWQsXHJcbiAgZGVmS2V5OiBULFxyXG4gIGZpZWxkczogUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj4sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICBwYXJhbXMgPSBwYXJhbXMgPz8ge307XHJcbiAgY29uc3QgdmFsaWRGaWVsZHM6IHN0cmluZ1tdID0gW107XHJcblxyXG4gIGZvciAoY29uc3QgaW5kZXggaW4gZmllbGRzKSB7XHJcbiAgICBjb25zdCBmaWVsZCA9IGZpZWxkc1tpbmRleF07XHJcbiAgICBpZiAoZmllbGQpXHJcbiAgICAgIHZhbGlkRmllbGRzLnB1c2goZmllbGQuZmllbGQpO1xyXG4gIH1cclxuXHJcbiAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhwYXJhbXMsIGRlZktleSwgWydjYXB0dXJlJywgLi4udmFsaWRGaWVsZHNdKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbGFzdCBrZXkgd2UgY2FyZSBhYm91dCwgc28gd2UgY2FuIHNob3J0ZW4gdGhlIHJlZ2V4IGlmIG5lZWRlZC5cclxuICBjb25zdCBjYXB0dXJlID0gUmVnZXhlcy50cnVlSWZVbmRlZmluZWQocGFyYW1zLmNhcHR1cmUpO1xyXG4gIGNvbnN0IGZpZWxkS2V5cyA9IE9iamVjdC5rZXlzKGZpZWxkcykuc29ydCgoYSwgYikgPT4gcGFyc2VJbnQoYSkgLSBwYXJzZUludChiKSk7XHJcbiAgbGV0IG1heEtleVN0cjogc3RyaW5nO1xyXG4gIGlmIChjYXB0dXJlKSB7XHJcbiAgICBjb25zdCBrZXlzOiBFeHRyYWN0PGtleW9mIE5ldEZpZWxkc1JldmVyc2VbVF0sIHN0cmluZz5bXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKVxyXG4gICAgICBrZXlzLnB1c2goa2V5KTtcclxuICAgIGxldCB0bXBLZXkgPSBrZXlzLnBvcCgpO1xyXG4gICAgaWYgKHRtcEtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG1heEtleVN0ciA9IGZpZWxkS2V5c1tmaWVsZEtleXMubGVuZ3RoIC0gMV0gPz8gJzAnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd2hpbGUgKFxyXG4gICAgICAgIGZpZWxkc1t0bXBLZXldPy5vcHRpb25hbCAmJlxyXG4gICAgICAgICEoKGZpZWxkc1t0bXBLZXldPy5maWVsZCA/PyAnJykgaW4gcGFyYW1zKVxyXG4gICAgICApXHJcbiAgICAgICAgdG1wS2V5ID0ga2V5cy5wb3AoKTtcclxuICAgICAgbWF4S2V5U3RyID0gdG1wS2V5ID8/ICcwJztcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgbWF4S2V5U3RyID0gJzAnO1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGRzKSB7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gZmllbGRzW2tleV0gPz8ge307XHJcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKVxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWVsZHNba2V5XT8uZmllbGQ7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCAmJiBmaWVsZE5hbWUgaW4gcGFyYW1zKVxyXG4gICAgICAgIG1heEtleVN0ciA9IGtleTtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgbWF4S2V5ID0gcGFyc2VJbnQobWF4S2V5U3RyKTtcclxuXHJcbiAgLy8gU3BlY2lhbCBjYXNlIGZvciBBYmlsaXR5IHRvIGhhbmRsZSBhb2UgYW5kIG5vbi1hb2UuXHJcbiAgY29uc3QgYWJpbGl0eU1lc3NhZ2VUeXBlID1cclxuICAgIGAoPzoke2xvZ0RlZmluaXRpb25zLkFiaWxpdHkubWVzc2FnZVR5cGV9fCR7bG9nRGVmaW5pdGlvbnMuTmV0d29ya0FPRUFiaWxpdHkubWVzc2FnZVR5cGV9KWA7XHJcbiAgY29uc3QgYWJpbGl0eUhleENvZGUgPSAnKD86MTV8MTYpJztcclxuXHJcbiAgLy8gQnVpbGQgdGhlIHJlZ2V4IGZyb20gdGhlIGZpZWxkcy5cclxuICBjb25zdCBwcmVmaXggPSBkZWZLZXkgIT09ICdBYmlsaXR5JyA/IGxvZ0RlZmluaXRpb25zW2RlZktleV0ubWVzc2FnZVR5cGUgOiBhYmlsaXR5TWVzc2FnZVR5cGU7XHJcblxyXG4gIC8vIEhleCBjb2RlcyBhcmUgYSBtaW5pbXVtIG9mIHR3byBjaGFyYWN0ZXJzLiAgQWJpbGl0aWVzIGFyZSBzcGVjaWFsIGJlY2F1c2VcclxuICAvLyB0aGV5IG5lZWQgdG8gc3VwcG9ydCBib3RoIDB4MTUgYW5kIDB4MTYuXHJcbiAgY29uc3QgdHlwZUFzSGV4ID0gcGFyc2VJbnQobG9nRGVmaW5pdGlvbnNbZGVmS2V5XS50eXBlKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcclxuICBjb25zdCBkZWZhdWx0SGV4Q29kZSA9IHR5cGVBc0hleC5sZW5ndGggPCAyID8gYDAwJHt0eXBlQXNIZXh9YC5zbGljZSgtMikgOiB0eXBlQXNIZXg7XHJcbiAgY29uc3QgaGV4Q29kZSA9IGRlZktleSAhPT0gJ0FiaWxpdHknID8gZGVmYXVsdEhleENvZGUgOiBhYmlsaXR5SGV4Q29kZTtcclxuXHJcbiAgbGV0IHN0ciA9ICcnO1xyXG4gIGlmIChjYXB0dXJlKVxyXG4gICAgc3RyICs9IGAoPzx0aW1lc3RhbXA+XFxcXHl7VGltZXN0YW1wfSkgJHtwcmVmaXh9ICg/PHR5cGU+JHtoZXhDb2RlfSlgO1xyXG4gIGVsc2VcclxuICAgIHN0ciArPSBgXFxcXHl7VGltZXN0YW1wfSAke3ByZWZpeH0gJHtoZXhDb2RlfWA7XHJcblxyXG4gIGxldCBsYXN0S2V5ID0gMTtcclxuICBmb3IgKGNvbnN0IGtleVN0ciBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IHBhcnNlRmllbGQgPSBmaWVsZHNba2V5U3RyXTtcclxuICAgIGlmIChwYXJzZUZpZWxkID09PSB1bmRlZmluZWQpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgZmllbGROYW1lID0gcGFyc2VGaWVsZC5maWVsZDtcclxuXHJcbiAgICAvLyBSZWdleCBoYW5kbGVzIHRoZXNlIG1hbnVhbGx5IGFib3ZlIGluIHRoZSBgc3RyYCBpbml0aWFsaXphdGlvbi5cclxuICAgIGlmIChmaWVsZE5hbWUgPT09ICd0aW1lc3RhbXAnIHx8IGZpZWxkTmFtZSA9PT0gJ3R5cGUnKVxyXG4gICAgICBjb250aW51ZTtcclxuXHJcbiAgICBjb25zdCBrZXkgPSBwYXJzZUludChrZXlTdHIpO1xyXG4gICAgLy8gRmlsbCBpbiBibGFua3MuXHJcbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0ga2V5IC0gbGFzdEtleSAtIDE7XHJcbiAgICBpZiAobWlzc2luZ0ZpZWxkcyA9PT0gMSlcclxuICAgICAgc3RyICs9IGAke3NlcGFyYXRvcn0ke21hdGNoRGVmYXVsdH1gO1xyXG4gICAgZWxzZSBpZiAobWlzc2luZ0ZpZWxkcyA+IDEpXHJcbiAgICAgIHN0ciArPSBgKD86JHtzZXBhcmF0b3J9JHttYXRjaERlZmF1bHR9KXske21pc3NpbmdGaWVsZHN9fWA7XHJcbiAgICBsYXN0S2V5ID0ga2V5O1xyXG5cclxuICAgIHN0ciArPSBzZXBhcmF0b3I7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBwYXJzZUZpZWxkICE9PSAnb2JqZWN0JylcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2RlZktleX06IGludmFsaWQgdmFsdWU6ICR7SlNPTi5zdHJpbmdpZnkocGFyc2VGaWVsZCl9YCk7XHJcblxyXG4gICAgY29uc3QgZmllbGREZWZhdWx0ID0gZmllbGROYW1lICE9PSB1bmRlZmluZWQgJiYgZmllbGRzV2l0aFBvdGVudGlhbENvbG9ucy5pbmNsdWRlcyhmaWVsZE5hbWUpXHJcbiAgICAgID8gbWF0Y2hXaXRoQ29sb25zRGVmYXVsdFxyXG4gICAgICA6IG1hdGNoRGVmYXVsdDtcclxuICAgIGNvbnN0IGRlZmF1bHRGaWVsZFZhbHVlID0gcGFyc2VGaWVsZC52YWx1ZT8udG9TdHJpbmcoKSA/PyBmaWVsZERlZmF1bHQ7XHJcbiAgICBjb25zdCBmaWVsZFZhbHVlID0gcGFyYW1zW2ZpZWxkTmFtZV07XHJcblxyXG4gICAgaWYgKGlzUmVwZWF0aW5nRmllbGQoZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZywgZmllbGRWYWx1ZSkpIHtcclxuICAgICAgY29uc3QgcmVwZWF0aW5nRmllbGRzU2VwYXJhdG9yID0gJyg/OiR8OiknO1xyXG4gICAgICBsZXQgcmVwZWF0aW5nQXJyYXk6IFJlcGVhdGluZ0ZpZWxkc01hcDxUPiB8IHVuZGVmaW5lZCA9IGZpZWxkVmFsdWU7XHJcblxyXG4gICAgICBjb25zdCBzb3J0S2V5cyA9IGZpZWxkc1trZXlTdHJdPy5zb3J0S2V5cztcclxuICAgICAgY29uc3QgcHJpbWFyeUtleSA9IGZpZWxkc1trZXlTdHJdPy5wcmltYXJ5S2V5O1xyXG4gICAgICBjb25zdCBwb3NzaWJsZUtleXMgPSBmaWVsZHNba2V5U3RyXT8ucG9zc2libGVLZXlzO1xyXG5cclxuICAgICAgLy8gcHJpbWFyeUtleSBpcyByZXF1aXJlZCBpZiB0aGlzIGlzIGEgcmVwZWF0aW5nIGZpZWxkIHBlciB0eXBlZGVmIGluIG5ldGxvZ19kZWZzLnRzXHJcbiAgICAgIC8vIFNhbWUgd2l0aCBwb3NzaWJsZUtleXNcclxuICAgICAgaWYgKHByaW1hcnlLZXkgPT09IHVuZGVmaW5lZCB8fCBwb3NzaWJsZUtleXMgPT09IHVuZGVmaW5lZClcclxuICAgICAgICB0aHJvdyBuZXcgVW5yZWFjaGFibGVDb2RlKCk7XHJcblxyXG4gICAgICAvLyBBbGxvdyBzb3J0aW5nIGlmIG5lZWRlZFxyXG4gICAgICBpZiAoc29ydEtleXMpIHtcclxuICAgICAgICAvLyBBbHNvIHNvcnQgb3VyIHZhbGlkIGtleXMgbGlzdFxyXG4gICAgICAgIHBvc3NpYmxlS2V5cy5zb3J0KChsZWZ0LCByaWdodCkgPT4gbGVmdC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUocmlnaHQudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIGlmIChyZXBlYXRpbmdBcnJheSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXBlYXRpbmdBcnJheSA9IFsuLi5yZXBlYXRpbmdBcnJheV0uc29ydChcclxuICAgICAgICAgICAgKGxlZnQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCByaWdodDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiBudW1iZXIgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIFdlIGNoZWNrIHRoZSB2YWxpZGl0eSBvZiBsZWZ0L3JpZ2h0IGJlY2F1c2UgdGhleSdyZSB1c2VyLXN1cHBsaWVkXHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0ICE9PSAnb2JqZWN0JyB8fCBsZWZ0W3ByaW1hcnlLZXldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCBsZWZ0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zdCBsZWZ0VmFsdWUgPSBsZWZ0W3ByaW1hcnlLZXldO1xyXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgbGVmdFZhbHVlICE9PSAnc3RyaW5nJyB8fCAhcG9zc2libGVLZXlzPy5pbmNsdWRlcyhsZWZ0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgbGVmdCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiByaWdodCAhPT0gJ29iamVjdCcgfHwgcmlnaHRbcHJpbWFyeUtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIHJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zdCByaWdodFZhbHVlID0gcmlnaHRbcHJpbWFyeUtleV07XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiByaWdodFZhbHVlICE9PSAnc3RyaW5nJyB8fCAhcG9zc2libGVLZXlzPy5pbmNsdWRlcyhyaWdodFZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIHJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICByZXR1cm4gbGVmdFZhbHVlLnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShyaWdodFZhbHVlLnRvTG93ZXJDYXNlKCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGFub25SZXBzOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBzdHJpbmdbXSB9W10gfCB1bmRlZmluZWQgPSByZXBlYXRpbmdBcnJheTtcclxuICAgICAgLy8gTG9vcCBvdmVyIG91ciBwb3NzaWJsZSBrZXlzXHJcbiAgICAgIC8vIEJ1aWxkIGEgcmVnZXggdGhhdCBjYW4gbWF0Y2ggYW55IHBvc3NpYmxlIGtleSB3aXRoIHJlcXVpcmVkIHZhbHVlcyBzdWJzdGl0dXRlZCBpblxyXG4gICAgICBwb3NzaWJsZUtleXMuZm9yRWFjaCgocG9zc2libGVLZXkpID0+IHtcclxuICAgICAgICBjb25zdCByZXAgPSBhbm9uUmVwcz8uZmluZCgocmVwKSA9PiBwcmltYXJ5S2V5IGluIHJlcCAmJiByZXBbcHJpbWFyeUtleV0gPT09IHBvc3NpYmxlS2V5KTtcclxuXHJcbiAgICAgICAgbGV0IGZpZWxkUmVnZXggPSAnJztcclxuICAgICAgICAvLyBSYXRoZXIgdGhhbiBsb29waW5nIG92ZXIgdGhlIGtleXMgZGVmaW5lZCBvbiB0aGUgb2JqZWN0LFxyXG4gICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgYmFzZSB0eXBlIGRlZidzIGtleXMuIFRoaXMgZW5mb3JjZXMgdGhlIGNvcnJlY3Qgb3JkZXIuXHJcbiAgICAgICAgZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZ0tleXM/LmZvckVhY2goKGtleSkgPT4ge1xyXG4gICAgICAgICAgbGV0IHZhbCA9IHJlcD8uW2tleV07XHJcbiAgICAgICAgICBpZiAocmVwID09PSB1bmRlZmluZWQgfHwgIShrZXkgaW4gcmVwKSkge1xyXG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgdmFsdWUgZm9yIHRoaXMga2V5XHJcbiAgICAgICAgICAgIC8vIGluc2VydCBhIHBsYWNlaG9sZGVyLCB1bmxlc3MgaXQncyB0aGUgcHJpbWFyeSBrZXlcclxuICAgICAgICAgICAgaWYgKGtleSA9PT0gcHJpbWFyeUtleSlcclxuICAgICAgICAgICAgICB2YWwgPSBwb3NzaWJsZUtleTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodmFsKSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbC5sZW5ndGggPCAxKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsLnNvbWUoKHYpID0+IHR5cGVvZiB2ICE9PSAnc3RyaW5nJykpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmllbGRSZWdleCArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShcclxuICAgICAgICAgICAga2V5ID09PSBwcmltYXJ5S2V5ID8gZmFsc2UgOiBjYXB0dXJlLFxyXG4gICAgICAgICAgICAvLyBBbGwgY2FwdHVyaW5nIGdyb3VwcyBhcmUgYGZpZWxkTmFtZWAgKyBgcG9zc2libGVLZXlgLCBlLmcuIGBwYWlySXNDYXN0aW5nMWBcclxuICAgICAgICAgICAgZmllbGROYW1lICsgcG9zc2libGVLZXksXHJcbiAgICAgICAgICAgIHZhbCxcclxuICAgICAgICAgICAgZGVmYXVsdEZpZWxkVmFsdWUsXHJcbiAgICAgICAgICApICtcclxuICAgICAgICAgICAgcmVwZWF0aW5nRmllbGRzU2VwYXJhdG9yO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoZmllbGRSZWdleC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBzdHIgKz0gYCg/OiR7ZmllbGRSZWdleH0pJHtyZXAgIT09IHVuZGVmaW5lZCA/ICcnIDogJz8nfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoZmllbGRzW2tleVN0cl0/LnJlcGVhdGluZykge1xyXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcmVwZWF0aW5nIGZpZWxkIGJ1dCB0aGUgYWN0dWFsIHZhbHVlIGlzIGVtcHR5IG9yIG90aGVyd2lzZSBpbnZhbGlkLFxyXG4gICAgICAvLyBkb24ndCBwcm9jZXNzIGZ1cnRoZXIuIFdlIGNhbid0IHVzZSBgY29udGludWVgIGluIHRoZSBhYm92ZSBibG9jayBiZWNhdXNlIHRoYXRcclxuICAgICAgLy8gd291bGQgc2tpcCB0aGUgZWFybHktb3V0IGJyZWFrIGF0IHRoZSBlbmQgb2YgdGhlIGxvb3AuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZmllbGROYW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBzdHIgKz0gUmVnZXhlcy5tYXliZUNhcHR1cmUoXHJcbiAgICAgICAgICAvLyBtb3JlIGFjY3VyYXRlIHR5cGUgaW5zdGVhZCBvZiBgYXNgIGNhc3RcclxuICAgICAgICAgIC8vIG1heWJlIHRoaXMgZnVuY3Rpb24gbmVlZHMgYSByZWZhY3RvcmluZ1xyXG4gICAgICAgICAgY2FwdHVyZSxcclxuICAgICAgICAgIGZpZWxkTmFtZSxcclxuICAgICAgICAgIGZpZWxkVmFsdWUsXHJcbiAgICAgICAgICBkZWZhdWx0RmllbGRWYWx1ZSxcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEZJWE1FOiBoYW5kbGUgbGludCBlcnJvciBoZXJlXHJcbiAgICAgICAgLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L3B1bGwvMjc0I2Rpc2N1c3Npb25fcjE2OTI0Mzk3MjBcclxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcclxuICAgICAgICBzdHIgKz0gZmllbGRWYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0b3AgaWYgd2UncmUgbm90IGNhcHR1cmluZyBhbmQgZG9uJ3QgY2FyZSBhYm91dCBmdXR1cmUgZmllbGRzLlxyXG4gICAgaWYgKGtleSA+PSBtYXhLZXkpXHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgc3RyICs9ICcoPzokfDopJztcclxuXHJcbiAgcmV0dXJuIFJlZ2V4ZXMucGFyc2Uoc3RyKSBhcyBDYWN0Ym90QmFzZVJlZ0V4cDxUPjtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBidWlsZFJlZ2V4ID0gPFQgZXh0ZW5kcyBrZXlvZiBOZXRQYXJhbXM+KFxyXG4gIHR5cGU6IFQsXHJcbiAgcGFyYW1zPzogUGFyc2VIZWxwZXJUeXBlPFQ+LFxyXG4pOiBDYWN0Ym90QmFzZVJlZ0V4cDxUPiA9PiB7XHJcbiAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgdHlwZSwgZGVmYXVsdFBhcmFtcyh0eXBlLCBSZWdleGVzLmxvZ1ZlcnNpb24pKTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZ2V4ZXMge1xyXG4gIHN0YXRpYyBsb2dWZXJzaW9uOiBMb2dEZWZpbml0aW9uVmVyc2lvbnMgPSAnbGF0ZXN0JztcclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIwLTB4MTQtbmV0d29ya3N0YXJ0c2Nhc3RpbmdcclxuICAgKi9cclxuICBzdGF0aWMgc3RhcnRzVXNpbmcocGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXJ0c1VzaW5nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMS0weDE1LW5ldHdvcmthYmlsaXR5XHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIyLTB4MTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eShwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHknXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FiaWxpdHknLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIxLTB4MTUtbmV0d29ya2FiaWxpdHlcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjItMHgxNi1uZXR3b3JrYW9lYWJpbGl0eVxyXG4gICAqXHJcbiAgICogQGRlcHJlY2F0ZWQgVXNlIGBhYmlsaXR5YCBpbnN0ZWFkXHJcbiAgICovXHJcbiAgc3RhdGljIGFiaWxpdHlGdWxsKHBhcmFtcz86IE5ldFBhcmFtc1snQWJpbGl0eSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FiaWxpdHknPiB7XHJcbiAgICByZXR1cm4gdGhpcy5hYmlsaXR5KHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjctMHgxYi1uZXR3b3JrdGFyZ2V0aWNvbi1oZWFkLW1hcmtlclxyXG4gICAqL1xyXG4gIHN0YXRpYyBoZWFkTWFya2VyKHBhcmFtcz86IE5ldFBhcmFtc1snSGVhZE1hcmtlciddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0hlYWRNYXJrZXInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnSGVhZE1hcmtlcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDMtMHgwMy1hZGRjb21iYXRhbnRcclxuICAgKi9cclxuICBzdGF0aWMgYWRkZWRDb21iYXRhbnQocGFyYW1zPzogTmV0UGFyYW1zWydBZGRlZENvbWJhdGFudCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FkZGVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FkZGVkQ29tYmF0YW50JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMy0weDAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudEZ1bGwoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0FkZGVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYWRkZWRDb21iYXRhbnQocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wNC0weDA0LXJlbW92ZWNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyByZW1vdmluZ0NvbWJhdGFudChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snUmVtb3ZlZENvbWJhdGFudCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdSZW1vdmVkQ29tYmF0YW50Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1JlbW92ZWRDb21iYXRhbnQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2LTB4MWEtbmV0d29ya2J1ZmZcclxuICAgKi9cclxuICBzdGF0aWMgZ2FpbnNFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydHYWluc0VmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhaW5zRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0dhaW5zRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZWZlciBnYWluc0VmZmVjdCBvdmVyIHRoaXMgZnVuY3Rpb24gdW5sZXNzIHlvdSByZWFsbHkgbmVlZCBleHRyYSBkYXRhLlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zOC0weDI2LW5ldHdvcmtzdGF0dXNlZmZlY3RzXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXR1c0VmZmVjdEV4cGxpY2l0KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydTdGF0dXNFZmZlY3QnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3RhdHVzRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXR1c0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzAtMHgxZS1uZXR3b3JrYnVmZnJlbW92ZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBsb3Nlc0VmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0xvc2VzRWZmZWN0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTG9zZXNFZmZlY3QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTG9zZXNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTM1LTB4MjMtbmV0d29ya3RldGhlclxyXG4gICAqL1xyXG4gIHN0YXRpYyB0ZXRoZXIocGFyYW1zPzogTmV0UGFyYW1zWydUZXRoZXInXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdUZXRoZXInPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnVGV0aGVyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqICd0YXJnZXQnIHdhcyBkZWZlYXRlZCBieSAnc291cmNlJ1xyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNS0weDE5LW5ldHdvcmtkZWF0aFxyXG4gICAqL1xyXG4gIHN0YXRpYyB3YXNEZWZlYXRlZChwYXJhbXM/OiBOZXRQYXJhbXNbJ1dhc0RlZmVhdGVkJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnV2FzRGVmZWF0ZWQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnV2FzRGVmZWF0ZWQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI0LTB4MTgtbmV0d29ya2RvdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBuZXR3b3JrRG9UKHBhcmFtcz86IE5ldFBhcmFtc1snTmV0d29ya0RvVCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05ldHdvcmtEb1QnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTmV0d29ya0RvVCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGVjaG8ocGFyYW1zPzogTmV0UGFyYW1zWydHYW1lTG9nJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdlY2hvJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG4gICAgcGFyYW1zLmNvZGUgPSAnMDAzOCc7XHJcbiAgICByZXR1cm4gUmVnZXhlcy5nYW1lTG9nKHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGRpYWxvZyhwYXJhbXM/OiBOZXRQYXJhbXNbJ0dhbWVMb2cnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ2RpYWxvZycsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuICAgIHBhcmFtcy5jb2RlID0gJzAwNDQnO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBtZXNzYWdlKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICBpZiAodHlwZW9mIHBhcmFtcyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHBhcmFtcyA9IHt9O1xyXG4gICAgUmVnZXhlcy52YWxpZGF0ZVBhcmFtcyhcclxuICAgICAgcGFyYW1zLFxyXG4gICAgICAnbWVzc2FnZScsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuICAgIHBhcmFtcy5jb2RlID0gJzA4MzknO1xyXG4gICAgcmV0dXJuIFJlZ2V4ZXMuZ2FtZUxvZyhwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBjb2RlLCBuYW1lLCBsaW5lLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnR2FtZUxvZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVOYW1lTG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICAvLyBCYWNrd2FyZHMgY29tcGF0YWJpbGl0eS5cclxuICAgIHJldHVybiBSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0xMi0weDBjLXBsYXllcnN0YXRzXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXRDaGFuZ2UocGFyYW1zPzogTmV0UGFyYW1zWydQbGF5ZXJTdGF0cyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1BsYXllclN0YXRzJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1BsYXllclN0YXRzJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMS0weDAxLWNoYW5nZXpvbmVcclxuICAgKi9cclxuICBzdGF0aWMgY2hhbmdlWm9uZShwYXJhbXM/OiBOZXRQYXJhbXNbJ0NoYW5nZVpvbmUnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdDaGFuZ2Vab25lJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NoYW5nZVpvbmUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTMzLTB4MjEtbmV0d29yazZkLWFjdG9yLWNvbnRyb2xcclxuICAgKi9cclxuICBzdGF0aWMgbmV0d29yazZkKHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzQtMHgyMi1uZXR3b3JrbmFtZXRvZ2dsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBuYW1lVG9nZ2xlKHBhcmFtcz86IE5ldFBhcmFtc1snTmFtZVRvZ2dsZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05hbWVUb2dnbGUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTmFtZVRvZ2dsZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtNDAtMHgyOC1tYXBcclxuICAgKi9cclxuICBzdGF0aWMgbWFwKHBhcmFtcz86IE5ldFBhcmFtc1snTWFwJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtNDEtMHgyOS1zeXN0ZW1sb2dtZXNzYWdlXHJcbiAgICovXHJcbiAgc3RhdGljIHN5c3RlbUxvZ01lc3NhZ2UoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N5c3RlbUxvZ01lc3NhZ2UnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3lzdGVtTG9nTWVzc2FnZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTeXN0ZW1Mb2dNZXNzYWdlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTctMHgxMDEtbWFwZWZmZWN0XHJcbiAgICovXHJcbiAgc3RhdGljIG1hcEVmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ01hcEVmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J01hcEVmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdNYXBFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1OC0weDEwMi1mYXRlZGlyZWN0b3JcclxuICAgKi9cclxuICBzdGF0aWMgZmF0ZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snRmF0ZURpcmVjdG9yJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnRmF0ZURpcmVjdG9yJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0ZhdGVEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU5LTB4MTAzLWNlZGlyZWN0b3JcclxuICAgKi9cclxuICBzdGF0aWMgY2VEaXJlY3RvcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0NFRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdDRURpcmVjdG9yJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NFRGlyZWN0b3InLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2MC0weDEwNC1pbmNvbWJhdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBpbkNvbWJhdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0luQ29tYmF0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnSW5Db21iYXQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnSW5Db21iYXQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2MS0weDEwNS1jb21iYXRhbnRtZW1vcnlcclxuICAgKi9cclxuICBzdGF0aWMgY29tYmF0YW50TWVtb3J5KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb21iYXRhbnRNZW1vcnknXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ29tYmF0YW50TWVtb3J5Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvbWJhdGFudE1lbW9yeScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYzLTB4MTA3LXN0YXJ0c3VzaW5nZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3RhcnRzVXNpbmdFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3RhcnRzVXNpbmdFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGFydHNVc2luZ0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXJ0c1VzaW5nRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2NC0weDEwOC1hYmlsaXR5ZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5RXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eUV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FiaWxpdHlFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY1LTB4MTA5LWNvbnRlbnRmaW5kZXJzZXR0aW5nc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBjb250ZW50RmluZGVyU2V0dGluZ3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbnRlbnRGaW5kZXJTZXR0aW5ncyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb250ZW50RmluZGVyU2V0dGluZ3MnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29udGVudEZpbmRlclNldHRpbmdzJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjYtMHgxMGEtbnBjeWVsbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBucGNZZWxsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydOcGNZZWxsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05wY1llbGwnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTnBjWWVsbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY3LTB4MTBiLWJhdHRsZXRhbGsyXHJcbiAgICovXHJcbiAgc3RhdGljIGJhdHRsZVRhbGsyKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydCYXR0bGVUYWxrMiddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdCYXR0bGVUYWxrMic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdCYXR0bGVUYWxrMicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY4LTB4MTBjLWNvdW50ZG93blxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb3VudGRvd24oXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvdW50ZG93biddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb3VudGRvd24nPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ291bnRkb3duJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjktMHgxMGQtY291bnRkb3duY2FuY2VsXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bkNhbmNlbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duQ2FuY2VsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bkNhbmNlbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd25DYW5jZWwnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3MC0weDEwZS1hY3Rvcm1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JNb3ZlKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3Rvck1vdmUnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JNb3ZlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yTW92ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcxLTB4MTBmLWFjdG9yc2V0cG9zXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yU2V0UG9zKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvclNldFBvcyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvclNldFBvcyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvclNldFBvcycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcyLTB4MTEwLXNwYXdubnBjZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3Bhd25OcGNFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3Bhd25OcGNFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTcGF3bk5wY0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1NwYXduTnBjRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3My0weDExMS1hY3RvcmNvbnRyb2xleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3NC0weDExMi1hY3RvcmNvbnRyb2xzZWxmZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JDb250cm9sU2VsZkV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xTZWxmRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sU2VsZkV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbFNlbGZFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIGJ1aWxkaW5nIG5hbWVkIGNhcHR1cmUgZ3JvdXBcclxuICAgKi9cclxuICBzdGF0aWMgbWF5YmVDYXB0dXJlKFxyXG4gICAgY2FwdHVyZTogYm9vbGVhbixcclxuICAgIG5hbWU6IHN0cmluZyxcclxuICAgIHZhbHVlOiBzdHJpbmcgfCByZWFkb25seSBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcclxuICAgIGRlZmF1bHRWYWx1ZT86IHN0cmluZyxcclxuICApOiBzdHJpbmcge1xyXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpXHJcbiAgICAgIHZhbHVlID0gZGVmYXVsdFZhbHVlID8/IG1hdGNoRGVmYXVsdDtcclxuICAgIHZhbHVlID0gUmVnZXhlcy5hbnlPZih2YWx1ZSk7XHJcbiAgICByZXR1cm4gY2FwdHVyZSA/IFJlZ2V4ZXMubmFtZWRDYXB0dXJlKG5hbWUsIHZhbHVlKSA6IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG9wdGlvbmFsKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgKD86JHtzdHJ9KT9gO1xyXG4gIH1cclxuXHJcbiAgLy8gQ3JlYXRlcyBhIG5hbWVkIHJlZ2V4IGNhcHR1cmUgZ3JvdXAgbmFtZWQgfG5hbWV8IGZvciB0aGUgbWF0Y2ggfHZhbHVlfC5cclxuICBzdGF0aWMgbmFtZWRDYXB0dXJlKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBpZiAobmFtZS5pbmNsdWRlcygnPicpKVxyXG4gICAgICBjb25zb2xlLmVycm9yKGBcIiR7bmFtZX1cIiBjb250YWlucyBcIj5cIi5gKTtcclxuICAgIGlmIChuYW1lLmluY2x1ZGVzKCc8JykpXHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYFwiJHtuYW1lfVwiIGNvbnRhaW5zIFwiPlwiLmApO1xyXG5cclxuICAgIHJldHVybiBgKD88JHtuYW1lfT4ke3ZhbHVlfSlgO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVuaWVuY2UgZm9yIHR1cm5pbmcgbXVsdGlwbGUgYXJncyBpbnRvIGEgdW5pb25lZCByZWd1bGFyIGV4cHJlc3Npb24uXHJcbiAgICogYW55T2YoeCwgeSwgeikgb3IgYW55T2YoW3gsIHksIHpdKSBkbyB0aGUgc2FtZSB0aGluZywgYW5kIHJldHVybiAoPzp4fHl8eikuXHJcbiAgICogYW55T2YoeCkgb3IgYW55T2YoeCkgb24gaXRzIG93biBzaW1wbGlmaWVzIHRvIGp1c3QgeC5cclxuICAgKiBhcmdzIG1heSBiZSBzdHJpbmdzIG9yIFJlZ0V4cCwgYWx0aG91Z2ggYW55IGFkZGl0aW9uYWwgbWFya2VycyB0byBSZWdFeHBcclxuICAgKiBsaWtlIC9pbnNlbnNpdGl2ZS9pIGFyZSBkcm9wcGVkLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBhbnlPZiguLi5hcmdzOiAoc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZWdFeHApW10pOiBzdHJpbmcge1xyXG4gICAgY29uc3QgYW55T2ZBcnJheSA9IChhcnJheTogcmVhZG9ubHkgKHN0cmluZyB8IFJlZ0V4cClbXSk6IHN0cmluZyA9PiB7XHJcbiAgICAgIGNvbnN0IFtlbGVtXSA9IGFycmF5O1xyXG4gICAgICBpZiAoZWxlbSAhPT0gdW5kZWZpbmVkICYmIGFycmF5Lmxlbmd0aCA9PT0gMSlcclxuICAgICAgICByZXR1cm4gYCR7ZWxlbSBpbnN0YW5jZW9mIFJlZ0V4cCA/IGVsZW0uc291cmNlIDogZWxlbX1gO1xyXG4gICAgICByZXR1cm4gYCg/OiR7YXJyYXkubWFwKChlbGVtKSA9PiBlbGVtIGluc3RhbmNlb2YgUmVnRXhwID8gZWxlbS5zb3VyY2UgOiBlbGVtKS5qb2luKCd8Jyl9KWA7XHJcbiAgICB9O1xyXG4gICAgbGV0IGFycmF5OiByZWFkb25seSAoc3RyaW5nIHwgUmVnRXhwKVtdID0gW107XHJcbiAgICBjb25zdCBbZmlyc3RBcmddID0gYXJncztcclxuICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICBpZiAodHlwZW9mIGZpcnN0QXJnID09PSAnc3RyaW5nJyB8fCBmaXJzdEFyZyBpbnN0YW5jZW9mIFJlZ0V4cClcclxuICAgICAgICBhcnJheSA9IFtmaXJzdEFyZ107XHJcbiAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZmlyc3RBcmcpKVxyXG4gICAgICAgIGFycmF5ID0gZmlyc3RBcmc7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICBhcnJheSA9IFtdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gVE9ETzogbW9yZSBhY2N1cmF0ZSB0eXBlIGluc3RlYWQgb2YgYGFzYCBjYXN0XHJcbiAgICAgIGFycmF5ID0gYXJncyBhcyByZWFkb25seSBzdHJpbmdbXTtcclxuICAgIH1cclxuICAgIHJldHVybiBhbnlPZkFycmF5KGFycmF5KTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBwYXJzZShyZWdleHBTdHJpbmc6IFJlZ0V4cCB8IHN0cmluZyB8IENhY3Rib3RCYXNlUmVnRXhwPCdOb25lJz4pOiBSZWdFeHAge1xyXG4gICAgY29uc3Qga0NhY3Rib3RDYXRlZ29yaWVzID0ge1xyXG4gICAgICBUaW1lc3RhbXA6ICdeLnsxNH0nLFxyXG4gICAgICBOZXRUaW1lc3RhbXA6ICcuezMzfScsXHJcbiAgICAgIE5ldEZpZWxkOiAnKD86W158XSpcXFxcfCknLFxyXG4gICAgICBMb2dUeXBlOiAnWzAtOUEtRmEtZl17Mn0nLFxyXG4gICAgICBBYmlsaXR5Q29kZTogJ1swLTlBLUZhLWZdezEsOH0nLFxyXG4gICAgICBPYmplY3RJZDogJ1swLTlBLUZdezh9JyxcclxuICAgICAgLy8gTWF0Y2hlcyBhbnkgY2hhcmFjdGVyIG5hbWUgKGluY2x1ZGluZyBlbXB0eSBzdHJpbmdzIHdoaWNoIHRoZSBGRlhJVlxyXG4gICAgICAvLyBBQ1QgcGx1Z2luIGNhbiBnZW5lcmF0ZSB3aGVuIHVua25vd24pLlxyXG4gICAgICBOYW1lOiAnKD86W15cXFxcczp8XSsoPzogW15cXFxcczp8XSspP3wpJyxcclxuICAgICAgLy8gRmxvYXRzIGNhbiBoYXZlIGNvbW1hIGFzIHNlcGFyYXRvciBpbiBGRlhJViBwbHVnaW4gb3V0cHV0OiBodHRwczovL2dpdGh1Yi5jb20vcmF2YWhuL0ZGWElWX0FDVF9QbHVnaW4vaXNzdWVzLzEzN1xyXG4gICAgICBGbG9hdDogJy0/WzAtOV0rKD86Wy4sXVswLTldKyk/KD86RS0/WzAtOV0rKT8nLFxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBbGwgcmVnZXhlcyBpbiBjYWN0Ym90IGFyZSBjYXNlIGluc2Vuc2l0aXZlLlxyXG4gICAgLy8gVGhpcyBhdm9pZHMgaGVhZGFjaGVzIGFzIHRoaW5ncyBsaWtlIGBWaWNlIGFuZCBWYW5pdHlgIHR1cm5zIGludG9cclxuICAgIC8vIGBWaWNlIEFuZCBWYW5pdHlgLCBlc3BlY2lhbGx5IGZvciBGcmVuY2ggYW5kIEdlcm1hbi4gIEl0IGFwcGVhcnMgdG9cclxuICAgIC8vIGhhdmUgYSB+MjAlIHJlZ2V4IHBhcnNpbmcgb3ZlcmhlYWQsIGJ1dCBhdCBsZWFzdCB0aGV5IHdvcmsuXHJcbiAgICBsZXQgbW9kaWZpZXJzID0gJ2knO1xyXG4gICAgaWYgKHJlZ2V4cFN0cmluZyBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG4gICAgICBtb2RpZmllcnMgKz0gKHJlZ2V4cFN0cmluZy5nbG9iYWwgPyAnZycgOiAnJykgK1xyXG4gICAgICAgIChyZWdleHBTdHJpbmcubXVsdGlsaW5lID8gJ20nIDogJycpO1xyXG4gICAgICByZWdleHBTdHJpbmcgPSByZWdleHBTdHJpbmcuc291cmNlO1xyXG4gICAgfVxyXG4gICAgcmVnZXhwU3RyaW5nID0gcmVnZXhwU3RyaW5nLnJlcGxhY2UoL1xcXFx5XFx7KC4qPylcXH0vZywgKG1hdGNoLCBncm91cCkgPT4ge1xyXG4gICAgICByZXR1cm4ga0NhY3Rib3RDYXRlZ29yaWVzW2dyb3VwIGFzIGtleW9mIHR5cGVvZiBrQ2FjdGJvdENhdGVnb3JpZXNdIHx8IG1hdGNoO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleHBTdHJpbmcsIG1vZGlmaWVycyk7XHJcbiAgfVxyXG5cclxuICAvLyBMaWtlIFJlZ2V4LlJlZ2V4ZXMucGFyc2UsIGJ1dCBmb3JjZSBnbG9iYWwgZmxhZy5cclxuICBzdGF0aWMgcGFyc2VHbG9iYWwocmVnZXhwU3RyaW5nOiBSZWdFeHAgfCBzdHJpbmcpOiBSZWdFeHAge1xyXG4gICAgY29uc3QgcmVnZXggPSBSZWdleGVzLnBhcnNlKHJlZ2V4cFN0cmluZyk7XHJcbiAgICBsZXQgbW9kaWZpZXJzID0gJ2dpJztcclxuICAgIGlmIChyZWdleHBTdHJpbmcgaW5zdGFuY2VvZiBSZWdFeHApXHJcbiAgICAgIG1vZGlmaWVycyArPSByZWdleHBTdHJpbmcubXVsdGlsaW5lID8gJ20nIDogJyc7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleC5zb3VyY2UsIG1vZGlmaWVycyk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgdHJ1ZUlmVW5kZWZpbmVkKHZhbHVlPzogYm9vbGVhbik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgcmV0dXJuICEhdmFsdWU7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgdmFsaWRhdGVQYXJhbXMoXHJcbiAgICBmOiBSZWFkb25seTx7IFtzOiBzdHJpbmddOiB1bmtub3duIH0+LFxyXG4gICAgZnVuY05hbWU6IHN0cmluZyxcclxuICAgIHBhcmFtczogUmVhZG9ubHk8c3RyaW5nW10+LFxyXG4gICk6IHZvaWQge1xyXG4gICAgaWYgKGYgPT09IG51bGwpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGlmICh0eXBlb2YgZiAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhmKTtcclxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcclxuICAgICAgaWYgKCFwYXJhbXMuaW5jbHVkZXMoa2V5KSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIGAke2Z1bmNOYW1lfTogaW52YWxpZCBwYXJhbWV0ZXIgJyR7a2V5fScuICBgICtcclxuICAgICAgICAgICAgYFZhbGlkIHBhcmFtczogJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfWAsXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBOZXRGaWVsZHMsIE5ldEZpZWxkc1JldmVyc2UgfSBmcm9tICcuLi90eXBlcy9uZXRfZmllbGRzJztcclxuaW1wb3J0IHsgTmV0UGFyYW1zIH0gZnJvbSAnLi4vdHlwZXMvbmV0X3Byb3BzJztcclxuaW1wb3J0IHsgQ2FjdGJvdEJhc2VSZWdFeHAgfSBmcm9tICcuLi90eXBlcy9uZXRfdHJpZ2dlcic7XHJcblxyXG5pbXBvcnQge1xyXG4gIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIGxvZ0RlZmluaXRpb25zVmVyc2lvbnMsXHJcbiAgTG9nRGVmaW5pdGlvblZlcnNpb25zLFxyXG4gIFBhcnNlSGVscGVyRmllbGRzLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zLFxyXG4gIFJlcGVhdGluZ0ZpZWxkc1R5cGVzLFxyXG59IGZyb20gJy4vbmV0bG9nX2RlZnMnO1xyXG5pbXBvcnQgeyBVbnJlYWNoYWJsZUNvZGUgfSBmcm9tICcuL25vdF9yZWFjaGVkJztcclxuaW1wb3J0IFJlZ2V4ZXMgZnJvbSAnLi9yZWdleGVzJztcclxuXHJcbmNvbnN0IHNlcGFyYXRvciA9ICdcXFxcfCc7XHJcbmNvbnN0IG1hdGNoRGVmYXVsdCA9ICdbXnxdKic7XHJcblxyXG4vLyBJZiBOZXRSZWdleGVzLnNldEZsYWdUcmFuc2xhdGlvbnNOZWVkZWQgaXMgc2V0IHRvIHRydWUsIHRoZW4gYW55XHJcbi8vIHJlZ2V4IGNyZWF0ZWQgdGhhdCByZXF1aXJlcyBhIHRyYW5zbGF0aW9uIHdpbGwgYmVnaW4gd2l0aCB0aGlzIHN0cmluZ1xyXG4vLyBhbmQgbWF0Y2ggdGhlIG1hZ2ljU3RyaW5nUmVnZXguICBUaGlzIGlzIG1heWJlIGEgYml0IGdvb2Z5LCBidXQgaXNcclxuLy8gYSBwcmV0dHkgc3RyYWlnaHRmb3J3YXJkIHdheSB0byBtYXJrIHJlZ2V4ZXMgZm9yIHRyYW5zbGF0aW9ucy5cclxuLy8gSWYgaXNzdWUgIzEzMDYgaXMgZXZlciByZXNvbHZlZCwgd2UgY2FuIHJlbW92ZSB0aGlzLlxyXG5jb25zdCBtYWdpY1RyYW5zbGF0aW9uU3RyaW5nID0gYF5eYDtcclxuY29uc3QgbWFnaWNTdHJpbmdSZWdleCA9IC9eXFxeXFxeLztcclxuXHJcbi8vIGNhbid0IHNpbXBseSBleHBvcnQgdGhpcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvcHVsbC80OTU3I2Rpc2N1c3Npb25fcjEwMDI1OTA1ODlcclxuY29uc3Qga2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb25Bc0NvbnN0ID0gW1xyXG4gICdhYmlsaXR5JyxcclxuICAnbmFtZScsXHJcbiAgJ3NvdXJjZScsXHJcbiAgJ3RhcmdldCcsXHJcbiAgJ2xpbmUnLFxyXG5dIGFzIGNvbnN0O1xyXG5leHBvcnQgY29uc3Qga2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb246IHJlYWRvbmx5IHN0cmluZ1tdID0ga2V5c1RoYXRSZXF1aXJlVHJhbnNsYXRpb25Bc0NvbnN0O1xyXG5leHBvcnQgdHlwZSBLZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbiA9IHR5cGVvZiBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3RbbnVtYmVyXTtcclxuXHJcbmV4cG9ydCBjb25zdCBnYW1lTG9nQ29kZXMgPSB7XHJcbiAgZWNobzogJzAwMzgnLFxyXG4gIGRpYWxvZzogJzAwNDQnLFxyXG4gIG1lc3NhZ2U6ICcwODM5JyxcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIFNlZSBkb2NzL0xvZ0d1aWRlLm1kIGZvciBtb3JlIGluZm8gYWJvdXQgdGhlc2UgY2F0ZWdvcmllc1xyXG5leHBvcnQgY29uc3QgYWN0b3JDb250cm9sVHlwZSA9IHtcclxuICBzZXRBbmltU3RhdGU6ICcwMDNFJyxcclxuICBwdWJsaWNDb250ZW50VGV4dDogJzA4MzQnLFxyXG4gIGxvZ01zZzogJzAyMEYnLFxyXG4gIGxvZ01zZ1BhcmFtczogJzAyMTAnLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuY29uc3QgZGVmYXVsdFBhcmFtcyA9IDxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgViBleHRlbmRzIExvZ0RlZmluaXRpb25WZXJzaW9ucyxcclxuPih0eXBlOiBULCB2ZXJzaW9uOiBWLCBpbmNsdWRlPzogc3RyaW5nW10pOiBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PiA9PiB7XHJcbiAgY29uc3QgbG9nVHlwZSA9IGxvZ0RlZmluaXRpb25zVmVyc2lvbnNbdmVyc2lvbl1bdHlwZV07XHJcbiAgaWYgKGluY2x1ZGUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgaW5jbHVkZSA9IE9iamVjdC5rZXlzKGxvZ1R5cGUuZmllbGRzKTtcclxuICAgIGlmICgncmVwZWF0aW5nRmllbGRzJyBpbiBsb2dUeXBlKSB7XHJcbiAgICAgIGluY2x1ZGUucHVzaChsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBwYXJhbXM6IHtcclxuICAgIFtpbmRleDogbnVtYmVyXToge1xyXG4gICAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgICB2YWx1ZT86IHN0cmluZztcclxuICAgICAgb3B0aW9uYWw6IGJvb2xlYW47XHJcbiAgICAgIHJlcGVhdGluZz86IGJvb2xlYW47XHJcbiAgICAgIHJlcGVhdGluZ0tleXM/OiBzdHJpbmdbXTtcclxuICAgICAgc29ydEtleXM/OiBib29sZWFuO1xyXG4gICAgICBwcmltYXJ5S2V5Pzogc3RyaW5nO1xyXG4gICAgICBwb3NzaWJsZUtleXM/OiBzdHJpbmdbXTtcclxuICAgIH07XHJcbiAgfSA9IHt9O1xyXG4gIGNvbnN0IGZpcnN0T3B0aW9uYWxGaWVsZCA9IGxvZ1R5cGUuZmlyc3RPcHRpb25hbEZpZWxkO1xyXG5cclxuICBmb3IgKGNvbnN0IFtwcm9wLCBpbmRleF0gb2YgT2JqZWN0LmVudHJpZXMobG9nVHlwZS5maWVsZHMpKSB7XHJcbiAgICBpZiAoIWluY2x1ZGUuaW5jbHVkZXMocHJvcCkpXHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgY29uc3QgcGFyYW06IHsgZmllbGQ6IHN0cmluZzsgdmFsdWU/OiBzdHJpbmc7IG9wdGlvbmFsOiBib29sZWFuOyByZXBlYXRpbmc/OiBib29sZWFuIH0gPSB7XHJcbiAgICAgIGZpZWxkOiBwcm9wLFxyXG4gICAgICBvcHRpb25hbDogZmlyc3RPcHRpb25hbEZpZWxkICE9PSB1bmRlZmluZWQgJiYgaW5kZXggPj0gZmlyc3RPcHRpb25hbEZpZWxkLFxyXG4gICAgfTtcclxuICAgIGlmIChwcm9wID09PSAndHlwZScpXHJcbiAgICAgIHBhcmFtLnZhbHVlID0gbG9nVHlwZS50eXBlO1xyXG5cclxuICAgIHBhcmFtc1tpbmRleF0gPSBwYXJhbTtcclxuICB9XHJcblxyXG4gIGlmICgncmVwZWF0aW5nRmllbGRzJyBpbiBsb2dUeXBlICYmIGluY2x1ZGUuaW5jbHVkZXMobG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMubGFiZWwpKSB7XHJcbiAgICBwYXJhbXNbbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc3RhcnRpbmdJbmRleF0gPSB7XHJcbiAgICAgIGZpZWxkOiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5sYWJlbCxcclxuICAgICAgb3B0aW9uYWw6IGZpcnN0T3B0aW9uYWxGaWVsZCAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgICAgbG9nVHlwZS5yZXBlYXRpbmdGaWVsZHMuc3RhcnRpbmdJbmRleCA+PSBmaXJzdE9wdGlvbmFsRmllbGQsXHJcbiAgICAgIHJlcGVhdGluZzogdHJ1ZSxcclxuICAgICAgcmVwZWF0aW5nS2V5czogWy4uLmxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLm5hbWVzXSxcclxuICAgICAgc29ydEtleXM6IGxvZ1R5cGUucmVwZWF0aW5nRmllbGRzLnNvcnRLZXlzLFxyXG4gICAgICBwcmltYXJ5S2V5OiBsb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5wcmltYXJ5S2V5LFxyXG4gICAgICBwb3NzaWJsZUtleXM6IFsuLi5sb2dUeXBlLnJlcGVhdGluZ0ZpZWxkcy5wb3NzaWJsZUtleXNdLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiBwYXJhbXMgYXMgUGFydGlhbDxQYXJzZUhlbHBlckZpZWxkczxUPj47XHJcbn07XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcDxcclxuICBUQmFzZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIFRLZXkgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA9IFRCYXNlIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBUQmFzZSA6IG5ldmVyLFxyXG4+ID0ge1xyXG4gIFtuYW1lIGluIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zW1RLZXldWydyZXBlYXRpbmdGaWVsZHMnXVsnbmFtZXMnXVtudW1iZXJdXTpcclxuICAgIHwgc3RyaW5nXHJcbiAgICB8IHN0cmluZ1tdO1xyXG59W107XHJcblxyXG50eXBlIFJlcGVhdGluZ0ZpZWxkc01hcFR5cGVDaGVjazxcclxuICBUQmFzZSBleHRlbmRzIExvZ0RlZmluaXRpb25OYW1lLFxyXG4gIEYgZXh0ZW5kcyBrZXlvZiBOZXRGaWVsZHNbVEJhc2VdLFxyXG4gIFRLZXkgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA9IFRCYXNlIGV4dGVuZHMgUmVwZWF0aW5nRmllbGRzVHlwZXMgPyBUQmFzZSA6IG5ldmVyLFxyXG4+ID0gRiBleHRlbmRzIFJlcGVhdGluZ0ZpZWxkc0RlZmluaXRpb25zW1RLZXldWydyZXBlYXRpbmdGaWVsZHMnXVsnbGFiZWwnXVxyXG4gID8gUmVwZWF0aW5nRmllbGRzTWFwPFRLZXk+IDpcclxuICBuZXZlcjtcclxuXHJcbnR5cGUgUmVwZWF0aW5nRmllbGRzTWFwVHlwZTxcclxuICBUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWUsXHJcbiAgRiBleHRlbmRzIGtleW9mIE5ldEZpZWxkc1tUXSxcclxuPiA9IFQgZXh0ZW5kcyBSZXBlYXRpbmdGaWVsZHNUeXBlcyA/IFJlcGVhdGluZ0ZpZWxkc01hcFR5cGVDaGVjazxULCBGPlxyXG4gIDogbmV2ZXI7XHJcblxyXG50eXBlIFBhcnNlSGVscGVyVHlwZTxUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+ID1cclxuICAmIHtcclxuICAgIFtmaWVsZCBpbiBrZXlvZiBOZXRGaWVsZHNbVF1dPzogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10gfCBSZXBlYXRpbmdGaWVsZHNNYXBUeXBlPFQsIGZpZWxkPjtcclxuICB9XHJcbiAgJiB7IGNhcHR1cmU/OiBib29sZWFuIH07XHJcblxyXG5jb25zdCBpc1JlcGVhdGluZ0ZpZWxkID0gPFxyXG4gIFQgZXh0ZW5kcyBMb2dEZWZpbml0aW9uTmFtZSxcclxuPihcclxuICByZXBlYXRpbmc6IGJvb2xlYW4gfCB1bmRlZmluZWQsXHJcbiAgdmFsdWU6IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgUmVwZWF0aW5nRmllbGRzTWFwPFQ+IHwgdW5kZWZpbmVkLFxyXG4pOiB2YWx1ZSBpcyBSZXBlYXRpbmdGaWVsZHNNYXA8VD4gPT4ge1xyXG4gIGlmIChyZXBlYXRpbmcgIT09IHRydWUpXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgLy8gQWxsb3cgZXhjbHVkaW5nIHRoZSBmaWVsZCB0byBtYXRjaCBmb3IgZXh0cmFjdGlvblxyXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSlcclxuICAgIHJldHVybiBmYWxzZTtcclxuICBmb3IgKGNvbnN0IGUgb2YgdmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgZSAhPT0gJ29iamVjdCcpXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG5jb25zdCBwYXJzZUhlbHBlciA9IDxUIGV4dGVuZHMgTG9nRGVmaW5pdGlvbk5hbWU+KFxyXG4gIHBhcmFtczogUGFyc2VIZWxwZXJUeXBlPFQ+IHwgdW5kZWZpbmVkLFxyXG4gIGZ1bmNOYW1lOiBzdHJpbmcsXHJcbiAgZmllbGRzOiBQYXJ0aWFsPFBhcnNlSGVscGVyRmllbGRzPFQ+PixcclxuKTogQ2FjdGJvdEJhc2VSZWdFeHA8VD4gPT4ge1xyXG4gIHBhcmFtcyA9IHBhcmFtcyA/PyB7fTtcclxuICBjb25zdCB2YWxpZEZpZWxkczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgZm9yIChjb25zdCBpbmRleCBpbiBmaWVsZHMpIHtcclxuICAgIGNvbnN0IGZpZWxkID0gZmllbGRzW2luZGV4XTtcclxuICAgIGlmIChmaWVsZClcclxuICAgICAgdmFsaWRGaWVsZHMucHVzaChmaWVsZC5maWVsZCk7XHJcbiAgfVxyXG5cclxuICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKHBhcmFtcywgZnVuY05hbWUsIFsnY2FwdHVyZScsIC4uLnZhbGlkRmllbGRzXSk7XHJcblxyXG4gIC8vIEZpbmQgdGhlIGxhc3Qga2V5IHdlIGNhcmUgYWJvdXQsIHNvIHdlIGNhbiBzaG9ydGVuIHRoZSByZWdleCBpZiBuZWVkZWQuXHJcbiAgY29uc3QgY2FwdHVyZSA9IFJlZ2V4ZXMudHJ1ZUlmVW5kZWZpbmVkKHBhcmFtcy5jYXB0dXJlKTtcclxuICBjb25zdCBmaWVsZEtleXMgPSBPYmplY3Qua2V5cyhmaWVsZHMpLnNvcnQoKGEsIGIpID0+IHBhcnNlSW50KGEpIC0gcGFyc2VJbnQoYikpO1xyXG4gIGxldCBtYXhLZXlTdHI6IHN0cmluZztcclxuICBpZiAoY2FwdHVyZSkge1xyXG4gICAgY29uc3Qga2V5czogRXh0cmFjdDxrZXlvZiBOZXRGaWVsZHNSZXZlcnNlW1RdLCBzdHJpbmc+W10gPSBbXTtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkcylcclxuICAgICAga2V5cy5wdXNoKGtleSk7XHJcbiAgICBsZXQgdG1wS2V5ID0ga2V5cy5wb3AoKTtcclxuICAgIGlmICh0bXBLZXkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBtYXhLZXlTdHIgPSBmaWVsZEtleXNbZmllbGRLZXlzLmxlbmd0aCAtIDFdID8/ICcwJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHdoaWxlIChcclxuICAgICAgICBmaWVsZHNbdG1wS2V5XT8ub3B0aW9uYWwgJiZcclxuICAgICAgICAhKChmaWVsZHNbdG1wS2V5XT8uZmllbGQgPz8gJycpIGluIHBhcmFtcylcclxuICAgICAgKVxyXG4gICAgICAgIHRtcEtleSA9IGtleXMucG9wKCk7XHJcbiAgICAgIG1heEtleVN0ciA9IHRtcEtleSA/PyAnMCc7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIG1heEtleVN0ciA9ICcwJztcclxuICAgIGZvciAoY29uc3Qga2V5IGluIGZpZWxkcykge1xyXG4gICAgICBjb25zdCB2YWx1ZSA9IGZpZWxkc1trZXldID8/IHt9O1xyXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JylcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgY29uc3QgZmllbGROYW1lID0gZmllbGRzW2tleV0/LmZpZWxkO1xyXG4gICAgICBpZiAoZmllbGROYW1lICE9PSB1bmRlZmluZWQgJiYgZmllbGROYW1lIGluIHBhcmFtcylcclxuICAgICAgICBtYXhLZXlTdHIgPSBrZXk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IG1heEtleSA9IHBhcnNlSW50KG1heEtleVN0cik7XHJcblxyXG4gIC8vIEZvciB0ZXN0aW5nLCBpdCdzIHVzZWZ1bCB0byBrbm93IGlmIHRoaXMgaXMgYSByZWdleCB0aGF0IHJlcXVpcmVzXHJcbiAgLy8gdHJhbnNsYXRpb24uICBXZSB0ZXN0IHRoaXMgYnkgc2VlaW5nIGlmIHRoZXJlIGFyZSBhbnkgc3BlY2lmaWVkXHJcbiAgLy8gZmllbGRzLCBhbmQgaWYgc28sIGluc2VydGluZyBhIG1hZ2ljIHN0cmluZyB0aGF0IHdlIGNhbiBkZXRlY3QuXHJcbiAgLy8gVGhpcyBsZXRzIHVzIGRpZmZlcmVudGlhdGUgYmV0d2VlbiBcInJlZ2V4IHRoYXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWRcIlxyXG4gIC8vIGUuZy4gYSByZWdleCB3aXRoIGB0YXJnZXRgIHNwZWNpZmllZCwgYW5kIFwicmVnZXggdGhhdCBzaG91bGRuJ3RcIlxyXG4gIC8vIGUuZy4gYSBnYWlucyBlZmZlY3Qgd2l0aCBqdXN0IGVmZmVjdElkIHNwZWNpZmllZC5cclxuICBjb25zdCB0cmFuc1BhcmFtcyA9IE9iamVjdC5rZXlzKHBhcmFtcykuZmlsdGVyKChrKSA9PiBrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbi5pbmNsdWRlcyhrKSk7XHJcbiAgY29uc3QgbmVlZHNUcmFuc2xhdGlvbnMgPSBOZXRSZWdleGVzLmZsYWdUcmFuc2xhdGlvbnNOZWVkZWQgJiYgdHJhbnNQYXJhbXMubGVuZ3RoID4gMDtcclxuXHJcbiAgLy8gQnVpbGQgdGhlIHJlZ2V4IGZyb20gdGhlIGZpZWxkcy5cclxuICBsZXQgc3RyID0gbmVlZHNUcmFuc2xhdGlvbnMgPyBtYWdpY1RyYW5zbGF0aW9uU3RyaW5nIDogJ14nO1xyXG4gIGxldCBsYXN0S2V5ID0gLTE7XHJcbiAgZm9yIChjb25zdCBrZXlTdHIgaW4gZmllbGRzKSB7XHJcbiAgICBjb25zdCBrZXkgPSBwYXJzZUludChrZXlTdHIpO1xyXG4gICAgLy8gRmlsbCBpbiBibGFua3MuXHJcbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0ga2V5IC0gbGFzdEtleSAtIDE7XHJcbiAgICBpZiAobWlzc2luZ0ZpZWxkcyA9PT0gMSlcclxuICAgICAgc3RyICs9ICdcXFxceXtOZXRGaWVsZH0nO1xyXG4gICAgZWxzZSBpZiAobWlzc2luZ0ZpZWxkcyA+IDEpXHJcbiAgICAgIHN0ciArPSBgXFxcXHl7TmV0RmllbGR9eyR7bWlzc2luZ0ZpZWxkc319YDtcclxuICAgIGxhc3RLZXkgPSBrZXk7XHJcblxyXG4gICAgY29uc3QgdmFsdWUgPSBmaWVsZHNba2V5U3RyXTtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZnVuY05hbWV9OiBpbnZhbGlkIHZhbHVlOiAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcclxuXHJcbiAgICBjb25zdCBmaWVsZE5hbWUgPSB2YWx1ZS5maWVsZDtcclxuICAgIGNvbnN0IGRlZmF1bHRGaWVsZFZhbHVlID0gdmFsdWUudmFsdWU/LnRvU3RyaW5nKCkgPz8gbWF0Y2hEZWZhdWx0O1xyXG4gICAgY29uc3QgZmllbGRWYWx1ZSA9IHBhcmFtc1tmaWVsZE5hbWVdO1xyXG5cclxuICAgIGlmIChpc1JlcGVhdGluZ0ZpZWxkKGZpZWxkc1trZXlTdHJdPy5yZXBlYXRpbmcsIGZpZWxkVmFsdWUpKSB7XHJcbiAgICAgIGxldCByZXBlYXRpbmdBcnJheTogUmVwZWF0aW5nRmllbGRzTWFwPFQ+IHwgdW5kZWZpbmVkID0gZmllbGRWYWx1ZTtcclxuXHJcbiAgICAgIGNvbnN0IHNvcnRLZXlzID0gZmllbGRzW2tleVN0cl0/LnNvcnRLZXlzO1xyXG4gICAgICBjb25zdCBwcmltYXJ5S2V5ID0gZmllbGRzW2tleVN0cl0/LnByaW1hcnlLZXk7XHJcbiAgICAgIGNvbnN0IHBvc3NpYmxlS2V5cyA9IGZpZWxkc1trZXlTdHJdPy5wb3NzaWJsZUtleXM7XHJcblxyXG4gICAgICAvLyBwcmltYXJ5S2V5IGlzIHJlcXVpcmVkIGlmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgcGVyIHR5cGVkZWYgaW4gbmV0bG9nX2RlZnMudHNcclxuICAgICAgLy8gU2FtZSB3aXRoIHBvc3NpYmxlS2V5c1xyXG4gICAgICBpZiAocHJpbWFyeUtleSA9PT0gdW5kZWZpbmVkIHx8IHBvc3NpYmxlS2V5cyA9PT0gdW5kZWZpbmVkKVxyXG4gICAgICAgIHRocm93IG5ldyBVbnJlYWNoYWJsZUNvZGUoKTtcclxuXHJcbiAgICAgIC8vIEFsbG93IHNvcnRpbmcgaWYgbmVlZGVkXHJcbiAgICAgIGlmIChzb3J0S2V5cykge1xyXG4gICAgICAgIC8vIEFsc28gc29ydCBvdXIgdmFsaWQga2V5cyBsaXN0XHJcbiAgICAgICAgcG9zc2libGVLZXlzLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiBsZWZ0LnRvTG93ZXJDYXNlKCkubG9jYWxlQ29tcGFyZShyaWdodC50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgaWYgKHJlcGVhdGluZ0FycmF5ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIHJlcGVhdGluZ0FycmF5ID0gWy4uLnJlcGVhdGluZ0FycmF5XS5zb3J0KFxyXG4gICAgICAgICAgICAobGVmdDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHJpZ2h0OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IG51bWJlciA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gV2UgY2hlY2sgdGhlIHZhbGlkaXR5IG9mIGxlZnQvcmlnaHQgYmVjYXVzZSB0aGV5J3JlIHVzZXItc3VwcGxpZWRcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGxlZnQgIT09ICdvYmplY3QnIHx8IGxlZnRbcHJpbWFyeUtleV0gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdJbnZhbGlkIGFyZ3VtZW50IHBhc3NlZCB0byB0cmlnZ2VyOicsIGxlZnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IGxlZnRWYWx1ZSA9IGxlZnRbcHJpbWFyeUtleV07XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsZWZ0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKGxlZnRWYWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignSW52YWxpZCBhcmd1bWVudCBwYXNzZWQgdG8gdHJpZ2dlcjonLCBsZWZ0KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0ICE9PSAnb2JqZWN0JyB8fCByaWdodFtwcmltYXJ5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZ2h0VmFsdWUgPSByaWdodFtwcmltYXJ5S2V5XTtcclxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHJpZ2h0VmFsdWUgIT09ICdzdHJpbmcnIHx8ICFwb3NzaWJsZUtleXM/LmluY2x1ZGVzKHJpZ2h0VmFsdWUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0ludmFsaWQgYXJndW1lbnQgcGFzc2VkIHRvIHRyaWdnZXI6JywgcmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiBsZWZ0VmFsdWUudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKHJpZ2h0VmFsdWUudG9Mb3dlckNhc2UoKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgYW5vblJlcHM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdIH1bXSB8IHVuZGVmaW5lZCA9IHJlcGVhdGluZ0FycmF5O1xyXG4gICAgICAvLyBMb29wIG92ZXIgb3VyIHBvc3NpYmxlIGtleXNcclxuICAgICAgLy8gQnVpbGQgYSByZWdleCB0aGF0IGNhbiBtYXRjaCBhbnkgcG9zc2libGUga2V5IHdpdGggcmVxdWlyZWQgdmFsdWVzIHN1YnN0aXR1dGVkIGluXHJcbiAgICAgIHBvc3NpYmxlS2V5cy5mb3JFYWNoKChwb3NzaWJsZUtleSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHJlcCA9IGFub25SZXBzPy5maW5kKChyZXApID0+IHByaW1hcnlLZXkgaW4gcmVwICYmIHJlcFtwcmltYXJ5S2V5XSA9PT0gcG9zc2libGVLZXkpO1xyXG5cclxuICAgICAgICBsZXQgZmllbGRSZWdleCA9ICcnO1xyXG4gICAgICAgIC8vIFJhdGhlciB0aGFuIGxvb3Bpbmcgb3ZlciB0aGUga2V5cyBkZWZpbmVkIG9uIHRoZSBvYmplY3QsXHJcbiAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBiYXNlIHR5cGUgZGVmJ3Mga2V5cy4gVGhpcyBlbmZvcmNlcyB0aGUgY29ycmVjdCBvcmRlci5cclxuICAgICAgICBmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nS2V5cz8uZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgICBsZXQgdmFsID0gcmVwPy5ba2V5XTtcclxuICAgICAgICAgIGlmIChyZXAgPT09IHVuZGVmaW5lZCB8fCAhKGtleSBpbiByZXApKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYSB2YWx1ZSBmb3IgdGhpcyBrZXlcclxuICAgICAgICAgICAgLy8gaW5zZXJ0IGEgcGxhY2Vob2xkZXIsIHVubGVzcyBpdCdzIHRoZSBwcmltYXJ5IGtleVxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBwcmltYXJ5S2V5KVxyXG4gICAgICAgICAgICAgIHZhbCA9IHBvc3NpYmxlS2V5O1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWwpKVxyXG4gICAgICAgICAgICAgIHZhbCA9IG1hdGNoRGVmYXVsdDtcclxuICAgICAgICAgICAgZWxzZSBpZiAodmFsLmxlbmd0aCA8IDEpXHJcbiAgICAgICAgICAgICAgdmFsID0gbWF0Y2hEZWZhdWx0O1xyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwuc29tZSgodikgPT4gdHlwZW9mIHYgIT09ICdzdHJpbmcnKSlcclxuICAgICAgICAgICAgICB2YWwgPSBtYXRjaERlZmF1bHQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWVsZFJlZ2V4ICs9IFJlZ2V4ZXMubWF5YmVDYXB0dXJlKFxyXG4gICAgICAgICAgICBrZXkgPT09IHByaW1hcnlLZXkgPyBmYWxzZSA6IGNhcHR1cmUsXHJcbiAgICAgICAgICAgIC8vIEFsbCBjYXB0dXJpbmcgZ3JvdXBzIGFyZSBgZmllbGROYW1lYCArIGBwb3NzaWJsZUtleWAsIGUuZy4gYHBhaXJJc0Nhc3RpbmcxYFxyXG4gICAgICAgICAgICBmaWVsZE5hbWUgKyBwb3NzaWJsZUtleSxcclxuICAgICAgICAgICAgdmFsLFxyXG4gICAgICAgICAgICBkZWZhdWx0RmllbGRWYWx1ZSxcclxuICAgICAgICAgICkgK1xyXG4gICAgICAgICAgICBzZXBhcmF0b3I7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChmaWVsZFJlZ2V4Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHN0ciArPSBgKD86JHtmaWVsZFJlZ2V4fSkke3JlcCAhPT0gdW5kZWZpbmVkID8gJycgOiAnPyd9YDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIGlmIChmaWVsZHNba2V5U3RyXT8ucmVwZWF0aW5nKSB7XHJcbiAgICAgIC8vIElmIHRoaXMgaXMgYSByZXBlYXRpbmcgZmllbGQgYnV0IHRoZSBhY3R1YWwgdmFsdWUgaXMgZW1wdHkgb3Igb3RoZXJ3aXNlIGludmFsaWQsXHJcbiAgICAgIC8vIGRvbid0IHByb2Nlc3MgZnVydGhlci4gV2UgY2FuJ3QgdXNlIGBjb250aW51ZWAgaW4gdGhlIGFib3ZlIGJsb2NrIGJlY2F1c2UgdGhhdFxyXG4gICAgICAvLyB3b3VsZCBza2lwIHRoZSBlYXJseS1vdXQgYnJlYWsgYXQgdGhlIGVuZCBvZiB0aGUgbG9vcC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChmaWVsZE5hbWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHN0ciArPSBSZWdleGVzLm1heWJlQ2FwdHVyZShcclxuICAgICAgICAgIC8vIG1vcmUgYWNjdXJhdGUgdHlwZSBpbnN0ZWFkIG9mIGBhc2AgY2FzdFxyXG4gICAgICAgICAgLy8gbWF5YmUgdGhpcyBmdW5jdGlvbiBuZWVkcyBhIHJlZmFjdG9yaW5nXHJcbiAgICAgICAgICBjYXB0dXJlLFxyXG4gICAgICAgICAgZmllbGROYW1lLFxyXG4gICAgICAgICAgZmllbGRWYWx1ZSxcclxuICAgICAgICAgIGRlZmF1bHRGaWVsZFZhbHVlLFxyXG4gICAgICAgICkgK1xyXG4gICAgICAgICAgc2VwYXJhdG9yO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN0ciArPSBkZWZhdWx0RmllbGRWYWx1ZSArIHNlcGFyYXRvcjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0b3AgaWYgd2UncmUgbm90IGNhcHR1cmluZyBhbmQgZG9uJ3QgY2FyZSBhYm91dCBmdXR1cmUgZmllbGRzLlxyXG4gICAgaWYgKGtleSA+PSBtYXhLZXkpXHJcbiAgICAgIGJyZWFrO1xyXG4gIH1cclxuICByZXR1cm4gUmVnZXhlcy5wYXJzZShzdHIpIGFzIENhY3Rib3RCYXNlUmVnRXhwPFQ+O1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGJ1aWxkUmVnZXggPSA8VCBleHRlbmRzIGtleW9mIE5ldFBhcmFtcz4oXHJcbiAgdHlwZTogVCxcclxuICBwYXJhbXM/OiBQYXJzZUhlbHBlclR5cGU8VD4sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICByZXR1cm4gcGFyc2VIZWxwZXIocGFyYW1zLCB0eXBlLCBkZWZhdWx0UGFyYW1zKHR5cGUsIE5ldFJlZ2V4ZXMubG9nVmVyc2lvbikpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTmV0UmVnZXhlcyB7XHJcbiAgc3RhdGljIGxvZ1ZlcnNpb246IExvZ0RlZmluaXRpb25WZXJzaW9ucyA9ICdsYXRlc3QnO1xyXG5cclxuICBzdGF0aWMgZmxhZ1RyYW5zbGF0aW9uc05lZWRlZCA9IGZhbHNlO1xyXG4gIHN0YXRpYyBzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkKHZhbHVlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBOZXRSZWdleGVzLmZsYWdUcmFuc2xhdGlvbnNOZWVkZWQgPSB2YWx1ZTtcclxuICB9XHJcbiAgc3RhdGljIGRvZXNOZXRSZWdleE5lZWRUcmFuc2xhdGlvbihyZWdleDogUmVnRXhwIHwgc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAvLyBOZWVkIHRvIGBzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkYCBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLlxyXG4gICAgY29uc29sZS5hc3NlcnQoTmV0UmVnZXhlcy5mbGFnVHJhbnNsYXRpb25zTmVlZGVkKTtcclxuICAgIGNvbnN0IHN0ciA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcclxuICAgIHJldHVybiAhIW1hZ2ljU3RyaW5nUmVnZXguZXhlYyhzdHIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIwLTB4MTQtbmV0d29ya3N0YXJ0c2Nhc3RpbmdcclxuICAgKi9cclxuICBzdGF0aWMgc3RhcnRzVXNpbmcocGFyYW1zPzogTmV0UGFyYW1zWydTdGFydHNVc2luZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXJ0c1VzaW5nJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXJ0c1VzaW5nJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMS0weDE1LW5ldHdvcmthYmlsaXR5XHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTIyLTB4MTYtbmV0d29ya2FvZWFiaWxpdHlcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eShwYXJhbXM/OiBOZXRQYXJhbXNbJ0FiaWxpdHknXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdBYmlsaXR5Jz4ge1xyXG4gICAgcmV0dXJuIHBhcnNlSGVscGVyKHBhcmFtcywgJ0FiaWxpdHknLCB7XHJcbiAgICAgIC4uLmRlZmF1bHRQYXJhbXMoJ0FiaWxpdHknLCBOZXRSZWdleGVzLmxvZ1ZlcnNpb24pLFxyXG4gICAgICAvLyBPdmVycmlkZSB0eXBlXHJcbiAgICAgIDA6IHsgZmllbGQ6ICd0eXBlJywgdmFsdWU6ICcyWzEyXScsIG9wdGlvbmFsOiBmYWxzZSB9LFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjEtMHgxNS1uZXR3b3JrYWJpbGl0eVxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yMi0weDE2LW5ldHdvcmthb2VhYmlsaXR5XHJcbiAgICpcclxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGFiaWxpdHlgIGluc3RlYWRcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUZ1bGwocGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eSc+IHtcclxuICAgIHJldHVybiB0aGlzLmFiaWxpdHkocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNy0weDFiLW5ldHdvcmt0YXJnZXRpY29uLWhlYWQtbWFya2VyXHJcbiAgICovXHJcbiAgc3RhdGljIGhlYWRNYXJrZXIocGFyYW1zPzogTmV0UGFyYW1zWydIZWFkTWFya2VyJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnSGVhZE1hcmtlcic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdIZWFkTWFya2VyJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMy0weDAzLWFkZGNvbWJhdGFudFxyXG4gICAqL1xyXG4gIHN0YXRpYyBhZGRlZENvbWJhdGFudChwYXJhbXM/OiBOZXRQYXJhbXNbJ0FkZGVkQ29tYmF0YW50J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWRkZWRDb21iYXRhbnQnPiB7XHJcbiAgICByZXR1cm4gcGFyc2VIZWxwZXIoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ0FkZGVkQ29tYmF0YW50JyxcclxuICAgICAgZGVmYXVsdFBhcmFtcygnQWRkZWRDb21iYXRhbnQnLCBOZXRSZWdleGVzLmxvZ1ZlcnNpb24pLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMy0weDAzLWFkZGNvbWJhdGFudFxyXG4gICAqIEBkZXByZWNhdGVkIFVzZSBgYWRkZWRDb21iYXRhbnRgIGluc3RlYWRcclxuICAgKi9cclxuICBzdGF0aWMgYWRkZWRDb21iYXRhbnRGdWxsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBZGRlZENvbWJhdGFudCddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBZGRlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBOZXRSZWdleGVzLmFkZGVkQ29tYmF0YW50KHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDQtMHgwNC1yZW1vdmVjb21iYXRhbnRcclxuICAgKi9cclxuICBzdGF0aWMgcmVtb3ZpbmdDb21iYXRhbnQoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1JlbW92ZWRDb21iYXRhbnQnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnUmVtb3ZlZENvbWJhdGFudCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdSZW1vdmVkQ29tYmF0YW50JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNi0weDFhLW5ldHdvcmtidWZmXHJcbiAgICovXHJcbiAgc3RhdGljIGdhaW5zRWZmZWN0KHBhcmFtcz86IE5ldFBhcmFtc1snR2FpbnNFZmZlY3QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdHYWluc0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdHYWluc0VmZmVjdCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcmVmZXIgZ2FpbnNFZmZlY3Qgb3ZlciB0aGlzIGZ1bmN0aW9uIHVubGVzcyB5b3UgcmVhbGx5IG5lZWQgZXh0cmEgZGF0YS5cclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzgtMHgyNi1uZXR3b3Jrc3RhdHVzZWZmZWN0c1xyXG4gICAqL1xyXG4gIHN0YXRpYyBzdGF0dXNFZmZlY3RFeHBsaWNpdChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3RhdHVzRWZmZWN0J10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1N0YXR1c0VmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTdGF0dXNFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTMwLTB4MWUtbmV0d29ya2J1ZmZyZW1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgbG9zZXNFZmZlY3QocGFyYW1zPzogTmV0UGFyYW1zWydMb3Nlc0VmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0xvc2VzRWZmZWN0Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0xvc2VzRWZmZWN0JywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0zNS0weDIzLW5ldHdvcmt0ZXRoZXJcclxuICAgKi9cclxuICBzdGF0aWMgdGV0aGVyKHBhcmFtcz86IE5ldFBhcmFtc1snVGV0aGVyJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnVGV0aGVyJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1RldGhlcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiAndGFyZ2V0JyB3YXMgZGVmZWF0ZWQgYnkgJ3NvdXJjZSdcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjUtMHgxOS1uZXR3b3JrZGVhdGhcclxuICAgKi9cclxuICBzdGF0aWMgd2FzRGVmZWF0ZWQocGFyYW1zPzogTmV0UGFyYW1zWydXYXNEZWZlYXRlZCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1dhc0RlZmVhdGVkJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1dhc0RlZmVhdGVkJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNC0weDE4LW5ldHdvcmtkb3RcclxuICAgKi9cclxuICBzdGF0aWMgbmV0d29ya0RvVChwYXJhbXM/OiBOZXRQYXJhbXNbJ05ldHdvcmtEb1QnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdOZXR3b3JrRG9UJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ05ldHdvcmtEb1QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBlY2hvKHBhcmFtcz86IE9taXQ8TmV0UGFyYW1zWydHYW1lTG9nJ10sICdjb2RlJz4pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdFY2hvJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2coeyAuLi5wYXJhbXMsIGNvZGU6IGdhbWVMb2dDb2Rlcy5lY2hvIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBkaWFsb2cocGFyYW1zPzogT21pdDxOZXRQYXJhbXNbJ0dhbWVMb2cnXSwgJ2NvZGUnPik6IENhY3Rib3RCYXNlUmVnRXhwPCdHYW1lTG9nJz4ge1xyXG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKVxyXG4gICAgICBwYXJhbXMgPSB7fTtcclxuICAgIFJlZ2V4ZXMudmFsaWRhdGVQYXJhbXMoXHJcbiAgICAgIHBhcmFtcyxcclxuICAgICAgJ0RpYWxvZycsXHJcbiAgICAgIFsndHlwZScsICd0aW1lc3RhbXAnLCAnY29kZScsICduYW1lJywgJ2xpbmUnLCAnY2FwdHVyZSddLFxyXG4gICAgKTtcclxuXHJcbiAgICByZXR1cm4gTmV0UmVnZXhlcy5nYW1lTG9nKHsgLi4ucGFyYW1zLCBjb2RlOiBnYW1lTG9nQ29kZXMuZGlhbG9nIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBtZXNzYWdlKHBhcmFtcz86IE9taXQ8TmV0UGFyYW1zWydHYW1lTG9nJ10sICdjb2RlJz4pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnR2FtZUxvZyc+IHtcclxuICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJylcclxuICAgICAgcGFyYW1zID0ge307XHJcbiAgICBSZWdleGVzLnZhbGlkYXRlUGFyYW1zKFxyXG4gICAgICBwYXJhbXMsXHJcbiAgICAgICdNZXNzYWdlJyxcclxuICAgICAgWyd0eXBlJywgJ3RpbWVzdGFtcCcsICdjb2RlJywgJ25hbWUnLCAnbGluZScsICdjYXB0dXJlJ10sXHJcbiAgICApO1xyXG5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2coeyAuLi5wYXJhbXMsIGNvZGU6IGdhbWVMb2dDb2Rlcy5tZXNzYWdlIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZmllbGRzOiBjb2RlLCBuYW1lLCBsaW5lLCBjYXB0dXJlXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTAwLTB4MDAtbG9nbGluZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnYW1lTG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnR2FtZUxvZycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMDAtMHgwMC1sb2dsaW5lXHJcbiAgICovXHJcbiAgc3RhdGljIGdhbWVOYW1lTG9nKHBhcmFtcz86IE5ldFBhcmFtc1snR2FtZUxvZyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0dhbWVMb2cnPiB7XHJcbiAgICAvLyBCYWNrd2FyZHMgY29tcGF0YWJpbGl0eS5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmdhbWVMb2cocGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0xMi0weDBjLXBsYXllcnN0YXRzXHJcbiAgICovXHJcbiAgc3RhdGljIHN0YXRDaGFuZ2UocGFyYW1zPzogTmV0UGFyYW1zWydQbGF5ZXJTdGF0cyddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J1BsYXllclN0YXRzJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1BsYXllclN0YXRzJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0wMS0weDAxLWNoYW5nZXpvbmVcclxuICAgKi9cclxuICBzdGF0aWMgY2hhbmdlWm9uZShwYXJhbXM/OiBOZXRQYXJhbXNbJ0NoYW5nZVpvbmUnXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdDaGFuZ2Vab25lJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NoYW5nZVpvbmUnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTMzLTB4MjEtbmV0d29yazZkLWFjdG9yLWNvbnRyb2xcclxuICAgKi9cclxuICBzdGF0aWMgbmV0d29yazZkKHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMzQtMHgyMi1uZXR3b3JrbmFtZXRvZ2dsZVxyXG4gICAqL1xyXG4gIHN0YXRpYyBuYW1lVG9nZ2xlKHBhcmFtcz86IE5ldFBhcmFtc1snTmFtZVRvZ2dsZSddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05hbWVUb2dnbGUnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTmFtZVRvZ2dsZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtNDAtMHgyOC1tYXBcclxuICAgKi9cclxuICBzdGF0aWMgbWFwKHBhcmFtcz86IE5ldFBhcmFtc1snTWFwJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnTWFwJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ01hcCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtNDEtMHgyOS1zeXN0ZW1sb2dtZXNzYWdlXHJcbiAgICovXHJcbiAgc3RhdGljIHN5c3RlbUxvZ01lc3NhZ2UoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ1N5c3RlbUxvZ01lc3NhZ2UnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnU3lzdGVtTG9nTWVzc2FnZSc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdTeXN0ZW1Mb2dNZXNzYWdlJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNTctMHgxMDEtbWFwZWZmZWN0XHJcbiAgICovXHJcbiAgc3RhdGljIG1hcEVmZmVjdChwYXJhbXM/OiBOZXRQYXJhbXNbJ01hcEVmZmVjdCddKTogQ2FjdGJvdEJhc2VSZWdFeHA8J01hcEVmZmVjdCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdNYXBFZmZlY3QnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI1OC0weDEwMi1mYXRlZGlyZWN0b3JcclxuICAgKi9cclxuICBzdGF0aWMgZmF0ZURpcmVjdG9yKHBhcmFtcz86IE5ldFBhcmFtc1snRmF0ZURpcmVjdG9yJ10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnRmF0ZURpcmVjdG9yJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0ZhdGVEaXJlY3RvcicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjU5LTB4MTAzLWNlZGlyZWN0b3JcclxuICAgKi9cclxuICBzdGF0aWMgY2VEaXJlY3RvcihwYXJhbXM/OiBOZXRQYXJhbXNbJ0NFRGlyZWN0b3InXSk6IENhY3Rib3RCYXNlUmVnRXhwPCdDRURpcmVjdG9yJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NFRGlyZWN0b3InLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2MC0weDEwNC1pbmNvbWJhdFxyXG4gICAqL1xyXG4gIHN0YXRpYyBpbkNvbWJhdChwYXJhbXM/OiBOZXRQYXJhbXNbJ0luQ29tYmF0J10pOiBDYWN0Ym90QmFzZVJlZ0V4cDwnSW5Db21iYXQnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnSW5Db21iYXQnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2MS0weDEwNS1jb21iYXRhbnRtZW1vcnlcclxuICAgKi9cclxuICBzdGF0aWMgY29tYmF0YW50TWVtb3J5KFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydDb21iYXRhbnRNZW1vcnknXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQ29tYmF0YW50TWVtb3J5Jz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0NvbWJhdGFudE1lbW9yeScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjYzLTB4MTA3LXN0YXJ0c3VzaW5nZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3RhcnRzVXNpbmdFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3RhcnRzVXNpbmdFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTdGFydHNVc2luZ0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1N0YXJ0c1VzaW5nRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI2NC0weDEwOC1hYmlsaXR5ZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWJpbGl0eUV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBYmlsaXR5RXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWJpbGl0eUV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FiaWxpdHlFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY1LTB4MTA5LWNvbnRlbnRmaW5kZXJzZXR0aW5nc1xyXG4gICAqL1xyXG4gIHN0YXRpYyBjb250ZW50RmluZGVyU2V0dGluZ3MoXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvbnRlbnRGaW5kZXJTZXR0aW5ncyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb250ZW50RmluZGVyU2V0dGluZ3MnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ29udGVudEZpbmRlclNldHRpbmdzJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjYtMHgxMGEtbnBjeWVsbFxyXG4gICAqL1xyXG4gIHN0YXRpYyBucGNZZWxsKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydOcGNZZWxsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J05wY1llbGwnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnTnBjWWVsbCcsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY3LTB4MTBiLWJhdHRsZXRhbGsyXHJcbiAgICovXHJcbiAgc3RhdGljIGJhdHRsZVRhbGsyKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydCYXR0bGVUYWxrMiddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdCYXR0bGVUYWxrMic+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdCYXR0bGVUYWxrMicsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjY4LTB4MTBjLWNvdW50ZG93blxyXG4gICAqL1xyXG4gIHN0YXRpYyBjb3VudGRvd24oXHJcbiAgICBwYXJhbXM/OiBOZXRQYXJhbXNbJ0NvdW50ZG93biddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdDb3VudGRvd24nPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQ291bnRkb3duJywgcGFyYW1zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIG1hdGNoZXM6IGh0dHBzOi8vZ2l0aHViLmNvbS9PdmVybGF5UGx1Z2luL2NhY3Rib3QvYmxvYi9tYWluL2RvY3MvTG9nR3VpZGUubWQjbGluZS0yNjktMHgxMGQtY291bnRkb3duY2FuY2VsXHJcbiAgICovXHJcbiAgc3RhdGljIGNvdW50ZG93bkNhbmNlbChcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQ291bnRkb3duQ2FuY2VsJ10sXHJcbiAgKTogQ2FjdGJvdEJhc2VSZWdFeHA8J0NvdW50ZG93bkNhbmNlbCc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdDb3VudGRvd25DYW5jZWwnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3MC0weDEwZS1hY3Rvcm1vdmVcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JNb3ZlKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3Rvck1vdmUnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JNb3ZlJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yTW92ZScsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcxLTB4MTBmLWFjdG9yc2V0cG9zXHJcbiAgICovXHJcbiAgc3RhdGljIGFjdG9yU2V0UG9zKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvclNldFBvcyddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdBY3RvclNldFBvcyc+IHtcclxuICAgIHJldHVybiBidWlsZFJlZ2V4KCdBY3RvclNldFBvcycsIHBhcmFtcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBtYXRjaGVzOiBodHRwczovL2dpdGh1Yi5jb20vT3ZlcmxheVBsdWdpbi9jYWN0Ym90L2Jsb2IvbWFpbi9kb2NzL0xvZ0d1aWRlLm1kI2xpbmUtMjcyLTB4MTEwLXNwYXdubnBjZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgc3Bhd25OcGNFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snU3Bhd25OcGNFeHRyYSddLFxyXG4gICk6IENhY3Rib3RCYXNlUmVnRXhwPCdTcGF3bk5wY0V4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ1NwYXduTnBjRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3My0weDExMS1hY3RvcmNvbnRyb2xleHRyYVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhY3RvckNvbnRyb2xFeHRyYShcclxuICAgIHBhcmFtcz86IE5ldFBhcmFtc1snQWN0b3JDb250cm9sRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sRXh0cmEnPiB7XHJcbiAgICByZXR1cm4gYnVpbGRSZWdleCgnQWN0b3JDb250cm9sRXh0cmEnLCBwYXJhbXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogbWF0Y2hlczogaHR0cHM6Ly9naXRodWIuY29tL092ZXJsYXlQbHVnaW4vY2FjdGJvdC9ibG9iL21haW4vZG9jcy9Mb2dHdWlkZS5tZCNsaW5lLTI3NC0weDExMi1hY3RvcmNvbnRyb2xzZWxmZXh0cmFcclxuICAgKi9cclxuICBzdGF0aWMgYWN0b3JDb250cm9sU2VsZkV4dHJhKFxyXG4gICAgcGFyYW1zPzogTmV0UGFyYW1zWydBY3RvckNvbnRyb2xTZWxmRXh0cmEnXSxcclxuICApOiBDYWN0Ym90QmFzZVJlZ0V4cDwnQWN0b3JDb250cm9sU2VsZkV4dHJhJz4ge1xyXG4gICAgcmV0dXJuIGJ1aWxkUmVnZXgoJ0FjdG9yQ29udHJvbFNlbGZFeHRyYScsIHBhcmFtcyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29tbW9uTmV0UmVnZXggPSB7XHJcbiAgLy8gVE9ETyg2LjIpOiByZW1vdmUgNDAwMDAwMTAgYWZ0ZXIgZXZlcnlib2R5IGlzIG9uIDYuMi5cclxuICAvLyBUT0RPOiBvciBtYXliZSBrZWVwIGFyb3VuZCBmb3IgcGxheWluZyBvbGQgbG9nIGZpbGVzPz9cclxuICB3aXBlOiBOZXRSZWdleGVzLm5ldHdvcms2ZCh7IGNvbW1hbmQ6IFsnNDAwMDAwMTAnLCAnNDAwMDAwMEYnXSB9KSxcclxuICBjYWN0Ym90V2lwZUVjaG86IE5ldFJlZ2V4ZXMuZWNobyh7IGxpbmU6ICdjYWN0Ym90IHdpcGUuKj8nIH0pLFxyXG4gIHVzZXJXaXBlRWNobzogTmV0UmVnZXhlcy5lY2hvKHsgbGluZTogJ2VuZCcgfSksXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgY29uc3QgYnVpbGROZXRSZWdleEZvclRyaWdnZXIgPSA8VCBleHRlbmRzIGtleW9mIE5ldFBhcmFtcz4oXHJcbiAgdHlwZTogVCxcclxuICBwYXJhbXM/OiBOZXRQYXJhbXNbVF0sXHJcbik6IENhY3Rib3RCYXNlUmVnRXhwPFQ+ID0+IHtcclxuICBpZiAodHlwZSA9PT0gJ0FiaWxpdHknKVxyXG4gICAgLy8gdHMgY2FuJ3QgbmFycm93IFQgdG8gYEFiaWxpdHlgIGhlcmUsIG5lZWQgY2FzdGluZy5cclxuICAgIHJldHVybiBOZXRSZWdleGVzLmFiaWxpdHkocGFyYW1zKSBhcyBDYWN0Ym90QmFzZVJlZ0V4cDxUPjtcclxuXHJcbiAgcmV0dXJuIGJ1aWxkUmVnZXg8VD4odHlwZSwgcGFyYW1zKTtcclxufTtcclxuIiwiLy8gT3ZlcmxheVBsdWdpbiBBUEkgc2V0dXBcclxuXHJcbmltcG9ydCB7XHJcbiAgRXZlbnRNYXAsXHJcbiAgRXZlbnRUeXBlLFxyXG4gIElPdmVybGF5SGFuZGxlcixcclxuICBPdmVybGF5SGFuZGxlckZ1bmNzLFxyXG4gIE92ZXJsYXlIYW5kbGVyVHlwZXMsXHJcbn0gZnJvbSAnLi4vdHlwZXMvZXZlbnQnO1xyXG5cclxudHlwZSBCYXNlUmVzcG9uc2UgPSB7IHJzZXE/OiBudW1iZXI7ICckZXJyb3InPzogYm9vbGVhbiB9O1xyXG5cclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgX19PdmVybGF5Q2FsbGJhY2s6IEV2ZW50TWFwW0V2ZW50VHlwZV07XHJcbiAgICBkaXNwYXRjaE92ZXJsYXlFdmVudD86IHR5cGVvZiBwcm9jZXNzRXZlbnQ7XHJcbiAgICBPdmVybGF5UGx1Z2luQXBpOiB7XHJcbiAgICAgIHJlYWR5OiBib29sZWFuO1xyXG4gICAgICBjYWxsSGFuZGxlcjogKG1zZzogc3RyaW5nLCBjYj86ICh2YWx1ZTogc3RyaW5nKSA9PiB1bmtub3duKSA9PiB2b2lkO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVGhpcyBpcyBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBJdCBpcyByZWNvbW1lbmRlZCB0byBpbXBvcnQgZnJvbSB0aGlzIGZpbGU6XHJcbiAgICAgKlxyXG4gICAgICogYGltcG9ydCB7IGFkZE92ZXJsYXlMaXN0ZW5lciB9IGZyb20gJy9wYXRoL3RvL292ZXJsYXlfcGx1Z2luX2FwaSc7YFxyXG4gICAgICovXHJcbiAgICBhZGRPdmVybGF5TGlzdGVuZXI6IElBZGRPdmVybGF5TGlzdGVuZXI7XHJcbiAgICAvKipcclxuICAgICAqIEBkZXByZWNhdGVkIFRoaXMgaXMgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogSXQgaXMgcmVjb21tZW5kZWQgdG8gaW1wb3J0IGZyb20gdGhpcyBmaWxlOlxyXG4gICAgICpcclxuICAgICAqIGBpbXBvcnQgeyByZW1vdmVPdmVybGF5TGlzdGVuZXIgfSBmcm9tICcvcGF0aC90by9vdmVybGF5X3BsdWdpbl9hcGknO2BcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlT3ZlcmxheUxpc3RlbmVyOiBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBAZGVwcmVjYXRlZCBUaGlzIGlzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEl0IGlzIHJlY29tbWVuZGVkIHRvIGltcG9ydCBmcm9tIHRoaXMgZmlsZTpcclxuICAgICAqXHJcbiAgICAgKiBgaW1wb3J0IHsgY2FsbE92ZXJsYXlIYW5kbGVyIH0gZnJvbSAnL3BhdGgvdG8vb3ZlcmxheV9wbHVnaW5fYXBpJztgXHJcbiAgICAgKi9cclxuICAgIGNhbGxPdmVybGF5SGFuZGxlcjogSU92ZXJsYXlIYW5kbGVyO1xyXG4gIH1cclxufVxyXG5cclxudHlwZSBJQWRkT3ZlcmxheUxpc3RlbmVyID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KGV2ZW50OiBULCBjYjogRXZlbnRNYXBbVF0pID0+IHZvaWQ7XHJcbnR5cGUgSVJlbW92ZU92ZXJsYXlMaXN0ZW5lciA9IDxUIGV4dGVuZHMgRXZlbnRUeXBlPihldmVudDogVCwgY2I6IEV2ZW50TWFwW1RdKSA9PiB2b2lkO1xyXG5cclxudHlwZSBTdWJzY3JpYmVyPFQ+ID0ge1xyXG4gIFtrZXkgaW4gRXZlbnRUeXBlXT86IFRbXTtcclxufTtcclxudHlwZSBFdmVudFBhcmFtZXRlciA9IFBhcmFtZXRlcnM8RXZlbnRNYXBbRXZlbnRUeXBlXT5bMF07XHJcbnR5cGUgVm9pZEZ1bmM8VD4gPSAoLi4uYXJnczogVFtdKSA9PiB2b2lkO1xyXG5cclxubGV0IGluaXRlZCA9IGZhbHNlO1xyXG5cclxubGV0IHdzVXJsOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcclxubGV0IHdzOiBXZWJTb2NrZXQgfCBudWxsID0gbnVsbDtcclxubGV0IHF1ZXVlOiAoXHJcbiAgfCB7IFtzOiBzdHJpbmddOiB1bmtub3duIH1cclxuICB8IFt7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sICgodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHVua25vd24pIHwgdW5kZWZpbmVkXVxyXG4pW10gfCBudWxsID0gW107XHJcbmxldCByc2VxQ291bnRlciA9IDA7XHJcbnR5cGUgUHJvbWlzZUZ1bmNzID0ge1xyXG4gIHJlc29sdmU6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZDtcclxuICByZWplY3Q6ICh2YWx1ZTogdW5rbm93bikgPT4gdm9pZDtcclxufTtcclxuY29uc3QgcmVzcG9uc2VQcm9taXNlczogeyBbcnNlcUlkeDogbnVtYmVyXTogUHJvbWlzZUZ1bmNzIH0gPSB7fTtcclxuXHJcbmNvbnN0IHN1YnNjcmliZXJzOiBTdWJzY3JpYmVyPFZvaWRGdW5jPHVua25vd24+PiA9IHt9O1xyXG5cclxuY29uc3Qgc2VuZE1lc3NhZ2UgPSAoXHJcbiAgbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgY2I/OiAodmFsdWU6IHN0cmluZyB8IG51bGwpID0+IHVua25vd24sXHJcbik6IHZvaWQgPT4ge1xyXG4gIGlmICh3cykge1xyXG4gICAgaWYgKHF1ZXVlKVxyXG4gICAgICBxdWV1ZS5wdXNoKG1zZyk7XHJcbiAgICBlbHNlXHJcbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkobXNnKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChxdWV1ZSlcclxuICAgICAgcXVldWUucHVzaChbbXNnLCBjYl0pO1xyXG4gICAgZWxzZVxyXG4gICAgICB3aW5kb3cuT3ZlcmxheVBsdWdpbkFwaS5jYWxsSGFuZGxlcihKU09OLnN0cmluZ2lmeShtc2cpLCBjYik7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgcHJvY2Vzc0V2ZW50ID0gPFQgZXh0ZW5kcyBFdmVudFR5cGU+KG1zZzogUGFyYW1ldGVyczxFdmVudE1hcFtUXT5bMF0pOiB2b2lkID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGNvbnN0IHN1YnMgPSBzdWJzY3JpYmVyc1ttc2cudHlwZV07XHJcbiAgc3Vicz8uZm9yRWFjaCgoc3ViKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzdWIobXNnKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihlKTtcclxuICAgIH1cclxuICB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkaXNwYXRjaE92ZXJsYXlFdmVudCA9IHByb2Nlc3NFdmVudDtcclxuXHJcbmV4cG9ydCBjb25zdCBhZGRPdmVybGF5TGlzdGVuZXI6IElBZGRPdmVybGF5TGlzdGVuZXIgPSAoZXZlbnQsIGNiKTogdm9pZCA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICBpZiAoIXN1YnNjcmliZXJzW2V2ZW50XSkge1xyXG4gICAgc3Vic2NyaWJlcnNbZXZlbnRdID0gW107XHJcblxyXG4gICAgaWYgKCFxdWV1ZSkge1xyXG4gICAgICBzZW5kTWVzc2FnZSh7XHJcbiAgICAgICAgY2FsbDogJ3N1YnNjcmliZScsXHJcbiAgICAgICAgZXZlbnRzOiBbZXZlbnRdLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN1YnNjcmliZXJzW2V2ZW50XT8ucHVzaChjYiBhcyBWb2lkRnVuYzx1bmtub3duPik7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcmVtb3ZlT3ZlcmxheUxpc3RlbmVyOiBJUmVtb3ZlT3ZlcmxheUxpc3RlbmVyID0gKGV2ZW50LCBjYik6IHZvaWQgPT4ge1xyXG4gIGluaXQoKTtcclxuXHJcbiAgaWYgKHN1YnNjcmliZXJzW2V2ZW50XSkge1xyXG4gICAgY29uc3QgbGlzdCA9IHN1YnNjcmliZXJzW2V2ZW50XTtcclxuICAgIGNvbnN0IHBvcyA9IGxpc3Q/LmluZGV4T2YoY2IgYXMgVm9pZEZ1bmM8dW5rbm93bj4pO1xyXG5cclxuICAgIGlmIChwb3MgIT09IHVuZGVmaW5lZCAmJiBwb3MgPiAtMSlcclxuICAgICAgbGlzdD8uc3BsaWNlKHBvcywgMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVySW50ZXJuYWw6IElPdmVybGF5SGFuZGxlciA9IChcclxuICBfbXNnOiB7IFtzOiBzdHJpbmddOiB1bmtub3duIH0sXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuKTogUHJvbWlzZTxhbnk+ID0+IHtcclxuICBpbml0KCk7XHJcblxyXG4gIGNvbnN0IG1zZyA9IHtcclxuICAgIC4uLl9tc2csXHJcbiAgICByc2VxOiAwLFxyXG4gIH07XHJcbiAgbGV0IHA6IFByb21pc2U8dW5rbm93bj47XHJcblxyXG4gIGlmICh3cykge1xyXG4gICAgbXNnLnJzZXEgPSByc2VxQ291bnRlcisrO1xyXG4gICAgcCA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgcmVzcG9uc2VQcm9taXNlc1ttc2cucnNlcV0gPSB7IHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0IH07XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZW5kTWVzc2FnZShtc2cpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBwID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBzZW5kTWVzc2FnZShtc2csIChkYXRhKSA9PiB7XHJcbiAgICAgICAgaWYgKGRhdGEgPT09IG51bGwpIHtcclxuICAgICAgICAgIHJlc29sdmUoZGF0YSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGF0YSkgYXMgQmFzZVJlc3BvbnNlO1xyXG4gICAgICAgIGlmIChwYXJzZWRbJyRlcnJvciddKVxyXG4gICAgICAgICAgcmVqZWN0KHBhcnNlZCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgcmVzb2x2ZShwYXJzZWQpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHA7XHJcbn07XHJcblxyXG50eXBlIE92ZXJyaWRlTWFwID0geyBbY2FsbCBpbiBPdmVybGF5SGFuZGxlclR5cGVzXT86IE92ZXJsYXlIYW5kbGVyRnVuY3NbY2FsbF0gfTtcclxuY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXA6IE92ZXJyaWRlTWFwID0ge307XHJcblxyXG5leHBvcnQgY29uc3QgY2FsbE92ZXJsYXlIYW5kbGVyOiBJT3ZlcmxheUhhbmRsZXIgPSAoXHJcbiAgX21zZzogeyBbczogc3RyaW5nXTogdW5rbm93biB9LFxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbik6IFByb21pc2U8YW55PiA9PiB7XHJcbiAgaW5pdCgpO1xyXG5cclxuICAvLyBJZiB0aGlzIGBhc2AgaXMgaW5jb3JyZWN0LCB0aGVuIGl0IHdpbGwgbm90IGZpbmQgYW4gb3ZlcnJpZGUuXHJcbiAgLy8gVE9ETzogd2UgY291bGQgYWxzbyByZXBsYWNlIHRoaXMgd2l0aCBhIHR5cGUgZ3VhcmQuXHJcbiAgY29uc3QgdHlwZSA9IF9tc2cuY2FsbCBhcyBrZXlvZiBPdmVycmlkZU1hcDtcclxuICBjb25zdCBjYWxsRnVuYyA9IGNhbGxPdmVybGF5SGFuZGxlck92ZXJyaWRlTWFwW3R5cGVdID8/IGNhbGxPdmVybGF5SGFuZGxlckludGVybmFsO1xyXG5cclxuICAvLyBUaGUgYElPdmVybGF5SGFuZGxlcmAgdHlwZSBndWFyYW50ZWVzIHRoYXQgcGFyYW1ldGVycy9yZXR1cm4gdHlwZSBtYXRjaFxyXG4gIC8vIG9uZSBvZiB0aGUgb3ZlcmxheSBoYW5kbGVycy4gIFRoZSBPdmVycmlkZU1hcCBhbHNvIG9ubHkgc3RvcmVzIGZ1bmN0aW9uc1xyXG4gIC8vIHRoYXQgbWF0Y2ggYnkgdGhlIGRpc2NyaW1pbmF0aW5nIGBjYWxsYCBmaWVsZCwgYW5kIHNvIGFueSBvdmVycmlkZXNcclxuICAvLyBzaG91bGQgYmUgY29ycmVjdCBoZXJlLlxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnksQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1hcmd1bWVudFxyXG4gIHJldHVybiBjYWxsRnVuYyhfbXNnIGFzIGFueSk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3Qgc2V0T3ZlcmxheUhhbmRsZXJPdmVycmlkZSA9IDxUIGV4dGVuZHMga2V5b2YgT3ZlcmxheUhhbmRsZXJGdW5jcz4oXHJcbiAgdHlwZTogVCxcclxuICBvdmVycmlkZT86IE92ZXJsYXlIYW5kbGVyRnVuY3NbVF0sXHJcbik6IHZvaWQgPT4ge1xyXG4gIGlmICghb3ZlcnJpZGUpIHtcclxuICAgIGRlbGV0ZSBjYWxsT3ZlcmxheUhhbmRsZXJPdmVycmlkZU1hcFt0eXBlXTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXBbdHlwZV0gPSBvdmVycmlkZTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBpbml0ID0gKCk6IHZvaWQgPT4ge1xyXG4gIGlmIChpbml0ZWQpXHJcbiAgICByZXR1cm47XHJcblxyXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgd3NVcmwgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldCgnT1ZFUkxBWV9XUycpO1xyXG4gICAgaWYgKHdzVXJsICE9PSBudWxsKSB7XHJcbiAgICAgIGNvbnN0IGNvbm5lY3RXcyA9IGZ1bmN0aW9uKHdzVXJsOiBzdHJpbmcpIHtcclxuICAgICAgICB3cyA9IG5ldyBXZWJTb2NrZXQod3NVcmwpO1xyXG5cclxuICAgICAgICB3cy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB3cy5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgKCkgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCEnKTtcclxuXHJcbiAgICAgICAgICBjb25zdCBxID0gcXVldWUgPz8gW107XHJcbiAgICAgICAgICBxdWV1ZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgc2VuZE1lc3NhZ2Uoe1xyXG4gICAgICAgICAgICBjYWxsOiAnc3Vic2NyaWJlJyxcclxuICAgICAgICAgICAgZXZlbnRzOiBPYmplY3Qua2V5cyhzdWJzY3JpYmVycyksXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IG1zZyBvZiBxKSB7XHJcbiAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShtc2cpKVxyXG4gICAgICAgICAgICAgIHNlbmRNZXNzYWdlKG1zZyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoX21zZykgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBfbXNnLmRhdGEgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignSW52YWxpZCBtZXNzYWdlIGRhdGEgcmVjZWl2ZWQ6ICcsIF9tc2cpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBtc2cgPSBKU09OLnBhcnNlKF9tc2cuZGF0YSkgYXMgRXZlbnRQYXJhbWV0ZXIgJiBCYXNlUmVzcG9uc2U7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBwcm9taXNlRnVuY3MgPSBtc2c/LnJzZXEgIT09IHVuZGVmaW5lZCA/IHJlc3BvbnNlUHJvbWlzZXNbbXNnLnJzZXFdIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAobXNnLnJzZXEgIT09IHVuZGVmaW5lZCAmJiBwcm9taXNlRnVuY3MpIHtcclxuICAgICAgICAgICAgICBpZiAobXNnWyckZXJyb3InXSlcclxuICAgICAgICAgICAgICAgIHByb21pc2VGdW5jcy5yZWplY3QobXNnKTtcclxuICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBwcm9taXNlRnVuY3MucmVzb2x2ZShtc2cpO1xyXG4gICAgICAgICAgICAgIGRlbGV0ZSByZXNwb25zZVByb21pc2VzW21zZy5yc2VxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBwcm9jZXNzRXZlbnQobXNnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdJbnZhbGlkIG1lc3NhZ2UgcmVjZWl2ZWQ6ICcsIF9tc2cpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHdzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKCkgPT4ge1xyXG4gICAgICAgICAgcXVldWUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdUcnlpbmcgdG8gcmVjb25uZWN0Li4uJyk7XHJcbiAgICAgICAgICAvLyBEb24ndCBzcGFtIHRoZSBzZXJ2ZXIgd2l0aCByZXRyaWVzLlxyXG4gICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25uZWN0V3Mod3NVcmwpO1xyXG4gICAgICAgICAgfSwgMzAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbm5lY3RXcyh3c1VybCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCB3YWl0Rm9yQXBpID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cuT3ZlcmxheVBsdWdpbkFwaT8ucmVhZHkpIHtcclxuICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHdhaXRGb3JBcGksIDMwMCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBxID0gcXVldWUgPz8gW107XHJcbiAgICAgICAgcXVldWUgPSBudWxsO1xyXG5cclxuICAgICAgICB3aW5kb3cuX19PdmVybGF5Q2FsbGJhY2sgPSBwcm9jZXNzRXZlbnQ7XHJcblxyXG4gICAgICAgIHNlbmRNZXNzYWdlKHtcclxuICAgICAgICAgIGNhbGw6ICdzdWJzY3JpYmUnLFxyXG4gICAgICAgICAgZXZlbnRzOiBPYmplY3Qua2V5cyhzdWJzY3JpYmVycyksXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBxKSB7XHJcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpdGVtKSlcclxuICAgICAgICAgICAgc2VuZE1lc3NhZ2UoaXRlbVswXSwgaXRlbVsxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgd2FpdEZvckFwaSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhlcmUgdGhlIE92ZXJsYXlQbHVnaW4gQVBJIGlzIHJlZ2lzdGVyZWQgdG8gdGhlIHdpbmRvdyBvYmplY3QsXHJcbiAgICAvLyBidXQgdGhpcyBpcyBtYWlubHkgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LiBGb3IgY2FjdGJvdCdzIGJ1aWx0LWluIGZpbGVzLFxyXG4gICAgLy8gaXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIHRoZSB2YXJpb3VzIGZ1bmN0aW9ucyBleHBvcnRlZCBpbiByZXNvdXJjZXMvb3ZlcmxheV9wbHVnaW5fYXBpLnRzLlxyXG5cclxuICAgIC8qIGVzbGludC1kaXNhYmxlIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uICovXHJcbiAgICB3aW5kb3cuYWRkT3ZlcmxheUxpc3RlbmVyID0gYWRkT3ZlcmxheUxpc3RlbmVyO1xyXG4gICAgd2luZG93LnJlbW92ZU92ZXJsYXlMaXN0ZW5lciA9IHJlbW92ZU92ZXJsYXlMaXN0ZW5lcjtcclxuICAgIHdpbmRvdy5jYWxsT3ZlcmxheUhhbmRsZXIgPSBjYWxsT3ZlcmxheUhhbmRsZXI7XHJcbiAgICB3aW5kb3cuZGlzcGF0Y2hPdmVybGF5RXZlbnQgPSBkaXNwYXRjaE92ZXJsYXlFdmVudDtcclxuICAgIC8qIGVzbGludC1lbmFibGUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb24gKi9cclxuICB9XHJcblxyXG4gIGluaXRlZCA9IHRydWU7XHJcbn07XHJcbiIsImltcG9ydCBOZXRSZWdleGVzIGZyb20gJy4uLy4uL3Jlc291cmNlcy9uZXRyZWdleGVzJztcclxuaW1wb3J0IHsgYWRkT3ZlcmxheUxpc3RlbmVyLCBjYWxsT3ZlcmxheUhhbmRsZXIgfSBmcm9tICcuLi8uLi9yZXNvdXJjZXMvb3ZlcmxheV9wbHVnaW5fYXBpJztcclxuXHJcbmltcG9ydCAnLi4vLi4vcmVzb3VyY2VzL2RlZmF1bHRzLmNzcyc7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0NoYW5nZVpvbmUnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IGN1cnJlbnRab25lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N1cnJlbnRab25lJyk7XHJcbiAgaWYgKGN1cnJlbnRab25lKVxyXG4gICAgY3VycmVudFpvbmUuaW5uZXJUZXh0ID0gYGN1cnJlbnRab25lOiAke2Uuem9uZU5hbWV9ICgke2Uuem9uZUlEfSlgO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25JbkNvbWJhdENoYW5nZWRFdmVudCcsIChlKSA9PiB7XHJcbiAgY29uc3QgaW5Db21iYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5Db21iYXQnKTtcclxuICBpZiAoaW5Db21iYXQpIHtcclxuICAgIGluQ29tYmF0LmlubmVyVGV4dCA9IGBpbkNvbWJhdDogYWN0OiAke2UuZGV0YWlsLmluQUNUQ29tYmF0ID8gJ3llcycgOiAnbm8nfSBnYW1lOiAke1xyXG4gICAgICBlLmRldGFpbC5pbkdhbWVDb21iYXQgPyAneWVzJyA6ICdubydcclxuICAgIH1gO1xyXG4gIH1cclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uUGxheWVyQ2hhbmdlZEV2ZW50JywgKGUpID0+IHtcclxuICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWUnKTtcclxuICBpZiAobmFtZSlcclxuICAgIG5hbWUuaW5uZXJUZXh0ID0gZS5kZXRhaWwubmFtZTtcclxuICBjb25zdCBwbGF5ZXJJZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwbGF5ZXJJZCcpO1xyXG4gIGlmIChwbGF5ZXJJZClcclxuICAgIHBsYXllcklkLmlubmVyVGV4dCA9IGUuZGV0YWlsLmlkLnRvU3RyaW5nKDE2KTtcclxuICBjb25zdCBocCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdocCcpO1xyXG4gIGlmIChocClcclxuICAgIGhwLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRIUH0vJHtlLmRldGFpbC5tYXhIUH0gKCR7ZS5kZXRhaWwuY3VycmVudFNoaWVsZH0pYDtcclxuICBjb25zdCBtcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtcCcpO1xyXG4gIGlmIChtcClcclxuICAgIG1wLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLmN1cnJlbnRNUH0vJHtlLmRldGFpbC5tYXhNUH1gO1xyXG4gIGNvbnN0IGNwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NwJyk7XHJcbiAgaWYgKGNwKVxyXG4gICAgY3AuaW5uZXJUZXh0ID0gYCR7ZS5kZXRhaWwuY3VycmVudENQfS8ke2UuZGV0YWlsLm1heENQfWA7XHJcbiAgY29uc3QgZ3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ3AnKTtcclxuICBpZiAoZ3ApXHJcbiAgICBncC5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5jdXJyZW50R1B9LyR7ZS5kZXRhaWwubWF4R1B9YDtcclxuICBjb25zdCBqb2IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9iJyk7XHJcbiAgaWYgKGpvYilcclxuICAgIGpvYi5pbm5lclRleHQgPSBgJHtlLmRldGFpbC5sZXZlbH0gJHtlLmRldGFpbC5qb2J9YDtcclxuICBjb25zdCBkZWJ1ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1ZycpO1xyXG4gIGlmIChkZWJ1ZylcclxuICAgIGRlYnVnLmlubmVyVGV4dCA9IGUuZGV0YWlsLmRlYnVnSm9iO1xyXG5cclxuICBjb25zdCBqb2JJbmZvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pvYmluZm8nKTtcclxuICBpZiAoam9iSW5mbykge1xyXG4gICAgY29uc3QgZGV0YWlsID0gZS5kZXRhaWw7XHJcbiAgICBpZiAoZGV0YWlsLmpvYiA9PT0gJ1JETScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC53aGl0ZU1hbmF9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmJsYWNrTWFuYX0gfCAke2RldGFpbC5qb2JEZXRhaWwubWFuYVN0YWNrc31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnV0FSJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gZGV0YWlsLmpvYkRldGFpbC5iZWFzdC50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRFJLJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5kYXJrc2lkZU1pbGxpc2Vjb25kc30gfCAke2RldGFpbC5qb2JEZXRhaWwuZGFya0FydHMudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwubGl2aW5nU2hhZG93TWlsbGlzZWNvbmRzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdHTkInICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBgJHtkZXRhaWwuam9iRGV0YWlsLmNhcnRyaWRnZXN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNvbnRpbnVhdGlvblN0YXRlfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdQTEQnICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPSBkZXRhaWwuam9iRGV0YWlsLm9hdGgudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0JSRCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5zb25nTmFtZX0gfCAke2RldGFpbC5qb2JEZXRhaWwubGFzdFBsYXllZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuc29uZ1Byb2NzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zb3VsR2F1Z2V9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvbmdNaWxsaXNlY29uZHN9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLmNvZGEuam9pbignLCAnKVxyXG4gICAgICAgIH1dYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0ROQycgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwuZmVhdGhlcnN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmVzcHJpdH0gfCBbJHtcclxuICAgICAgICBkZXRhaWwuam9iRGV0YWlsLnN0ZXBzLmpvaW4oJywgJylcclxuICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwuY3VycmVudFN0ZXB9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ05JTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGAke2RldGFpbC5qb2JEZXRhaWwubmlua2lBbW91bnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmthemVtYXRvaX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnRFJHJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmJsb29kTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5saWZlTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5leWVzQW1vdW50fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5maXJzdG1pbmRzRm9jdXN9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0JMTScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC51bWJyYWxTdGFja3N9ICgke2RldGFpbC5qb2JEZXRhaWwudW1icmFsTWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwudW1icmFsSGVhcnRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5wb2x5Z2xvdH0gJHtkZXRhaWwuam9iRGV0YWlsLmVub2NoaWFuLnRvU3RyaW5nKCl9ICgke2RldGFpbC5qb2JEZXRhaWwubmV4dFBvbHlnbG90TWlsbGlzZWNvbmRzfSkgfCAke2RldGFpbC5qb2JEZXRhaWwucGFyYWRveC50b1N0cmluZygpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5hc3RyYWxTb3VsU3RhY2tzfWA7XHJcbiAgICB9IGVsc2UgaWYgKGRldGFpbC5qb2IgPT09ICdUSE0nICYmIGRldGFpbC5qb2JEZXRhaWwpIHtcclxuICAgICAgam9iSW5mby5pbm5lclRleHQgPVxyXG4gICAgICAgIGAke2RldGFpbC5qb2JEZXRhaWwudW1icmFsU3RhY2tzfSAoJHtkZXRhaWwuam9iRGV0YWlsLnVtYnJhbE1pbGxpc2Vjb25kc30pYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1dITScgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5saWx5U3RhY2tzfSAoJHtkZXRhaWwuam9iRGV0YWlsLmxpbHlNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5ibG9vZGxpbHlTdGFja3N9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1NNTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC50cmFuY2VNaWxsaXNlY29uZHN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmF0dHVuZW1lbnR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmF0dHVuZW1lbnRNaWxsaXNlY29uZHN9IHwgJHtcclxuICAgICAgICAgIGRldGFpbFxyXG4gICAgICAgICAgICAuam9iRGV0YWlsLmFjdGl2ZVByaW1hbCA/PyAnLSdcclxuICAgICAgICB9IHwgWyR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLnVzYWJsZUFyY2FudW0uam9pbignLCAnKVxyXG4gICAgICAgIH1dIHwgJHtkZXRhaWwuam9iRGV0YWlsLm5leHRTdW1tb25lZH0gfCAke2RldGFpbC5qb2JEZXRhaWwuc3VtbW9uU3RhdHVzLnRvU3RyaW5nKCl9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1NDSCcgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5hZXRoZXJmbG93U3RhY2tzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeUdhdWdlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeVN0YXR1c30gKCR7ZGV0YWlsLmpvYkRldGFpbC5mYWlyeU1pbGxpc2Vjb25kc30pYDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ0FDTicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9IGRldGFpbC5qb2JEZXRhaWwuYWV0aGVyZmxvd1N0YWNrcy50b1N0cmluZygpO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnQVNUJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQxfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5jYXJkMn0gfCAke2RldGFpbC5qb2JEZXRhaWwuY2FyZDN9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmNhcmQ0fSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5uZXh0ZHJhd31gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTU5LJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmNoYWtyYVN0YWNrc30gfCAke2RldGFpbC5qb2JEZXRhaWwubHVuYXJOYWRpLnRvU3RyaW5nKCl9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnNvbGFyTmFkaS50b1N0cmluZygpfSB8IFske1xyXG4gICAgICAgICAgZGV0YWlsLmpvYkRldGFpbC5iZWFzdENoYWtyYS5qb2luKCcsICcpXHJcbiAgICAgICAgfV0gfCAke2RldGFpbC5qb2JEZXRhaWwub3Bvb3BvRnVyeX0gfCAke2RldGFpbC5qb2JEZXRhaWwucmFwdG9yRnVyeX0gfCAke2RldGFpbC5qb2JEZXRhaWwuY29ldXJsRnVyeX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnTUNIJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmhlYXR9ICgke2RldGFpbC5qb2JEZXRhaWwub3ZlcmhlYXRNaWxsaXNlY29uZHN9KSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5iYXR0ZXJ5fSAoJHtkZXRhaWwuam9iRGV0YWlsLmJhdHRlcnlNaWxsaXNlY29uZHN9KSB8IGxhc3Q6ICR7ZGV0YWlsLmpvYkRldGFpbC5sYXN0QmF0dGVyeUFtb3VudH0gfCAke2RldGFpbC5qb2JEZXRhaWwub3ZlcmhlYXRBY3RpdmUudG9TdHJpbmcoKX0gfCAke2RldGFpbC5qb2JEZXRhaWwucm9ib3RBY3RpdmUudG9TdHJpbmcoKX1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0FNJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmtlbmtpfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5tZWRpdGF0aW9uU3RhY2tzfSgke2RldGFpbC5qb2JEZXRhaWwuc2V0c3UudG9TdHJpbmcoKX0sJHtkZXRhaWwuam9iRGV0YWlsLmdldHN1LnRvU3RyaW5nKCl9LCR7ZGV0YWlsLmpvYkRldGFpbC5rYS50b1N0cmluZygpfSlgO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnU0dFJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLmFkZGVyc2dhbGx9ICgke2RldGFpbC5qb2JEZXRhaWwuYWRkZXJzZ2FsbE1pbGxpc2Vjb25kc30pIHwgJHtkZXRhaWwuam9iRGV0YWlsLmFkZGVyc3Rpbmd9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmV1a3Jhc2lhLnRvU3RyaW5nKCl9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1JQUicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5zb3VsfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zaHJvdWR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmVuc2hyb3VkTWlsbGlzZWNvbmRzfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5sZW11cmVTaHJvdWR9IHwgJHtkZXRhaWwuam9iRGV0YWlsLnZvaWRTaHJvdWR9YDtcclxuICAgIH0gZWxzZSBpZiAoZGV0YWlsLmpvYiA9PT0gJ1ZQUicgJiYgZGV0YWlsLmpvYkRldGFpbCkge1xyXG4gICAgICBqb2JJbmZvLmlubmVyVGV4dCA9XHJcbiAgICAgICAgYCR7ZGV0YWlsLmpvYkRldGFpbC5yYXR0bGluZ0NvaWxTdGFja3N9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFuZ3VpbmVUcmlidXRlfSB8ICR7ZGV0YWlsLmpvYkRldGFpbC5zZXJwZW50T2ZmZXJpbmd9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmFkdmFuY2VkQ29tYm99IHwgJHtkZXRhaWwuam9iRGV0YWlsLnJlYXdha2VuZWRUaW1lcn1gO1xyXG4gICAgfSBlbHNlIGlmIChkZXRhaWwuam9iID09PSAnUENUJyAmJiBkZXRhaWwuam9iRGV0YWlsKSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID1cclxuICAgICAgICBgJHtkZXRhaWwuam9iRGV0YWlsLnBhbGV0dGVHYXVnZX0gfCAke2RldGFpbC5qb2JEZXRhaWwucGFpbnR9IHwgKCR7ZGV0YWlsLmpvYkRldGFpbC5jcmVhdHVyZU1vdGlmfSB8ICR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLndlYXBvbk1vdGlmID8gJ1dlYXBvbicgOiAnTm9uZSdcclxuICAgICAgICB9IHwgJHtkZXRhaWwuam9iRGV0YWlsLmxhbmRzY2FwZU1vdGlmID8gJ0xhbmRzY2FwZScgOiAnTm9uZSd9KSB8ICgke1xyXG4gICAgICAgICAgZGV0YWlsLmpvYkRldGFpbC5kZXBpY3Rpb25zLmpvaW4oJysnKSB8fCAnTm9uZSdcclxuICAgICAgICB9KSB8ICR7XHJcbiAgICAgICAgICBkZXRhaWwuam9iRGV0YWlsLm1vb2dsZVBvcnRyYWl0XHJcbiAgICAgICAgICAgID8gJ01vb2dsZSdcclxuICAgICAgICAgICAgOiBkZXRhaWwuam9iRGV0YWlsLm1hZGVlblBvcnRyYWl0XHJcbiAgICAgICAgICAgID8gJ01hZGVlbidcclxuICAgICAgICAgICAgOiAnTm9uZSdcclxuICAgICAgICB9YDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGpvYkluZm8uaW5uZXJUZXh0ID0gJyc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb25zdCBwb3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9zJyk7XHJcbiAgaWYgKHBvcykge1xyXG4gICAgcG9zLmlubmVyVGV4dCA9IGAke2UuZGV0YWlsLnBvcy54LnRvRml4ZWQoMil9LCR7ZS5kZXRhaWwucG9zLnkudG9GaXhlZCgyKX0sJHtcclxuICAgICAgZS5kZXRhaWwucG9zLnoudG9GaXhlZCgyKVxyXG4gICAgfWA7XHJcbiAgfVxyXG4gIGNvbnN0IHJvdGF0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JvdGF0aW9uJyk7XHJcbiAgaWYgKHJvdGF0aW9uKVxyXG4gICAgcm90YXRpb24uaW5uZXJUZXh0ID0gZS5kZXRhaWwucm90YXRpb24udG9TdHJpbmcoKTtcclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ0VubWl0eVRhcmdldERhdGEnLCAoZSkgPT4ge1xyXG4gIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YXJnZXQnKTtcclxuICBpZiAodGFyZ2V0KVxyXG4gICAgdGFyZ2V0LmlubmVyVGV4dCA9IGUuVGFyZ2V0ID8gZS5UYXJnZXQuTmFtZSA6ICctLSc7XHJcbiAgY29uc3QgdGlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpZCcpO1xyXG4gIGlmICh0aWQpXHJcbiAgICB0aWQuaW5uZXJUZXh0ID0gZS5UYXJnZXQgPyBlLlRhcmdldC5JRC50b1N0cmluZygxNikgOiAnJztcclxuICBjb25zdCB0ZGlzdGFuY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGRpc3RhbmNlJyk7XHJcbiAgaWYgKHRkaXN0YW5jZSlcclxuICAgIHRkaXN0YW5jZS5pbm5lclRleHQgPSBlLlRhcmdldCA/IGUuVGFyZ2V0LkRpc3RhbmNlLnRvU3RyaW5nKCkgOiAnJztcclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uR2FtZUV4aXN0c0V2ZW50JywgKF9lKSA9PiB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJHYW1lIGV4aXN0czogXCIgKyBlLmRldGFpbC5leGlzdHMpO1xyXG59KTtcclxuXHJcbmFkZE92ZXJsYXlMaXN0ZW5lcignb25HYW1lQWN0aXZlQ2hhbmdlZEV2ZW50JywgKF9lKSA9PiB7XHJcbiAgLy8gY29uc29sZS5sb2coXCJHYW1lIGFjdGl2ZTogXCIgKyBlLmRldGFpbC5hY3RpdmUpO1xyXG59KTtcclxuXHJcbmNvbnN0IHR0c0VjaG9SZWdleCA9IE5ldFJlZ2V4ZXMuZWNobyh7IGxpbmU6ICd0dHM6Lio/JyB9KTtcclxuYWRkT3ZlcmxheUxpc3RlbmVyKCdMb2dMaW5lJywgKGUpID0+IHtcclxuICAvLyBNYXRjaCBcIi9lY2hvIHR0czo8c3R1ZmY+XCJcclxuICBjb25zdCBsaW5lID0gdHRzRWNob1JlZ2V4LmV4ZWMoZS5yYXdMaW5lKT8uZ3JvdXBzPy5saW5lO1xyXG4gIGlmIChsaW5lID09PSB1bmRlZmluZWQpXHJcbiAgICByZXR1cm47XHJcbiAgY29uc3QgY29sb24gPSBsaW5lLmluZGV4T2YoJzonKTtcclxuICBpZiAoY29sb24gPT09IC0xKVxyXG4gICAgcmV0dXJuO1xyXG4gIGNvbnN0IHRleHQgPSBsaW5lLnNsaWNlKGNvbG9uKTtcclxuICBpZiAodGV4dCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICB2b2lkIGNhbGxPdmVybGF5SGFuZGxlcih7XHJcbiAgICAgIGNhbGw6ICdjYWN0Ym90U2F5JyxcclxuICAgICAgdGV4dDogdGV4dCxcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcblxyXG5hZGRPdmVybGF5TGlzdGVuZXIoJ29uVXNlckZpbGVDaGFuZ2VkJywgKGUpID0+IHtcclxuICBjb25zb2xlLmxvZyhgVXNlciBmaWxlICR7ZS5maWxlfSBjaGFuZ2VkIWApO1xyXG59KTtcclxuXHJcbnZvaWQgY2FsbE92ZXJsYXlIYW5kbGVyKHsgY2FsbDogJ2NhY3Rib3RSZXF1ZXN0U3RhdGUnIH0pO1xyXG4iXSwibmFtZXMiOlsiY29tYmF0YW50TWVtb3J5S2V5cyIsImxhdGVzdExvZ0RlZmluaXRpb25zIiwiR2FtZUxvZyIsInR5cGUiLCJuYW1lIiwic291cmNlIiwibWVzc2FnZVR5cGUiLCJmaWVsZHMiLCJ0aW1lc3RhbXAiLCJjb2RlIiwibGluZSIsInN1YkZpZWxkcyIsImNhbkFub255bWl6ZSIsImZpcnN0T3B0aW9uYWxGaWVsZCIsInVuZGVmaW5lZCIsImFuYWx5c2lzT3B0aW9ucyIsImluY2x1ZGUiLCJmaWx0ZXJzIiwiQ2hhbmdlWm9uZSIsImlkIiwibGFzdEluY2x1ZGUiLCJDaGFuZ2VkUGxheWVyIiwicGxheWVySWRzIiwiQWRkZWRDb21iYXRhbnQiLCJqb2IiLCJsZXZlbCIsIm93bmVySWQiLCJ3b3JsZElkIiwid29ybGQiLCJucGNOYW1lSWQiLCJucGNCYXNlSWQiLCJjdXJyZW50SHAiLCJocCIsImN1cnJlbnRNcCIsIm1wIiwieCIsInkiLCJ6IiwiaGVhZGluZyIsImNvbWJhdGFudElkRmllbGRzIiwiUmVtb3ZlZENvbWJhdGFudCIsIm93bmVyIiwiUGFydHlMaXN0IiwicGFydHlDb3VudCIsImlkMCIsImlkMSIsImlkMiIsImlkMyIsImlkNCIsImlkNSIsImlkNiIsImlkNyIsImlkOCIsImlkOSIsImlkMTAiLCJpZDExIiwiaWQxMiIsImlkMTMiLCJpZDE0IiwiaWQxNSIsImlkMTYiLCJpZDE3IiwiaWQxOCIsImlkMTkiLCJpZDIwIiwiaWQyMSIsImlkMjIiLCJpZDIzIiwiUGxheWVyU3RhdHMiLCJzdHJlbmd0aCIsImRleHRlcml0eSIsInZpdGFsaXR5IiwiaW50ZWxsaWdlbmNlIiwibWluZCIsInBpZXR5IiwiYXR0YWNrUG93ZXIiLCJkaXJlY3RIaXQiLCJjcml0aWNhbEhpdCIsImF0dGFja01hZ2ljUG90ZW5jeSIsImhlYWxNYWdpY1BvdGVuY3kiLCJkZXRlcm1pbmF0aW9uIiwic2tpbGxTcGVlZCIsInNwZWxsU3BlZWQiLCJ0ZW5hY2l0eSIsImxvY2FsQ29udGVudElkIiwiU3RhcnRzVXNpbmciLCJzb3VyY2VJZCIsImFiaWxpdHkiLCJ0YXJnZXRJZCIsInRhcmdldCIsImNhc3RUaW1lIiwicG9zc2libGVSc3ZGaWVsZHMiLCJibGFua0ZpZWxkcyIsIkFiaWxpdHkiLCJmbGFncyIsImRhbWFnZSIsInRhcmdldEN1cnJlbnRIcCIsInRhcmdldE1heEhwIiwidGFyZ2V0Q3VycmVudE1wIiwidGFyZ2V0TWF4TXAiLCJ0YXJnZXRYIiwidGFyZ2V0WSIsInRhcmdldFoiLCJ0YXJnZXRIZWFkaW5nIiwibWF4SHAiLCJtYXhNcCIsInNlcXVlbmNlIiwidGFyZ2V0SW5kZXgiLCJ0YXJnZXRDb3VudCIsIm93bmVyTmFtZSIsImVmZmVjdERpc3BsYXlUeXBlIiwiYWN0aW9uSWQiLCJhY3Rpb25BbmltYXRpb25JZCIsImFuaW1hdGlvbkxvY2tUaW1lIiwicm90YXRpb25IZXgiLCJOZXR3b3JrQU9FQWJpbGl0eSIsIk5ldHdvcmtDYW5jZWxBYmlsaXR5IiwicmVhc29uIiwiTmV0d29ya0RvVCIsIndoaWNoIiwiZWZmZWN0SWQiLCJkYW1hZ2VUeXBlIiwic291cmNlQ3VycmVudEhwIiwic291cmNlTWF4SHAiLCJzb3VyY2VDdXJyZW50TXAiLCJzb3VyY2VNYXhNcCIsInNvdXJjZVgiLCJzb3VyY2VZIiwic291cmNlWiIsInNvdXJjZUhlYWRpbmciLCJXYXNEZWZlYXRlZCIsIkdhaW5zRWZmZWN0IiwiZWZmZWN0IiwiZHVyYXRpb24iLCJjb3VudCIsIkhlYWRNYXJrZXIiLCJkYXRhMCIsInBvc3NpYmxlUGxheWVySWRzIiwiTmV0d29ya1JhaWRNYXJrZXIiLCJvcGVyYXRpb24iLCJ3YXltYXJrIiwiTmV0d29ya1RhcmdldE1hcmtlciIsInRhcmdldE5hbWUiLCJMb3Nlc0VmZmVjdCIsIk5ldHdvcmtHYXVnZSIsImRhdGExIiwiZGF0YTIiLCJkYXRhMyIsImZpcnN0VW5rbm93bkZpZWxkIiwiTmV0d29ya1dvcmxkIiwiaXNVbmtub3duIiwiQWN0b3JDb250cm9sIiwiaW5zdGFuY2UiLCJjb21tYW5kIiwiTmFtZVRvZ2dsZSIsInRvZ2dsZSIsIlRldGhlciIsIkxpbWl0QnJlYWsiLCJ2YWx1ZUhleCIsImJhcnMiLCJOZXR3b3JrRWZmZWN0UmVzdWx0Iiwic2VxdWVuY2VJZCIsImN1cnJlbnRTaGllbGQiLCJTdGF0dXNFZmZlY3QiLCJqb2JMZXZlbERhdGEiLCJkYXRhNCIsImRhdGE1IiwiTmV0d29ya1VwZGF0ZUhQIiwiTWFwIiwicmVnaW9uTmFtZSIsInBsYWNlTmFtZSIsInBsYWNlTmFtZVN1YiIsIlN5c3RlbUxvZ01lc3NhZ2UiLCJwYXJhbTAiLCJwYXJhbTEiLCJwYXJhbTIiLCJTdGF0dXNMaXN0MyIsIlBhcnNlckluZm8iLCJnbG9iYWxJbmNsdWRlIiwiUHJvY2Vzc0luZm8iLCJEZWJ1ZyIsIlBhY2tldER1bXAiLCJWZXJzaW9uIiwiRXJyb3IiLCJOb25lIiwiTGluZVJlZ2lzdHJhdGlvbiIsInZlcnNpb24iLCJNYXBFZmZlY3QiLCJsb2NhdGlvbiIsIkZhdGVEaXJlY3RvciIsImNhdGVnb3J5IiwiZmF0ZUlkIiwicHJvZ3Jlc3MiLCJDRURpcmVjdG9yIiwicG9wVGltZSIsInRpbWVSZW1haW5pbmciLCJjZUtleSIsIm51bVBsYXllcnMiLCJzdGF0dXMiLCJJbkNvbWJhdCIsImluQUNUQ29tYmF0IiwiaW5HYW1lQ29tYmF0IiwiaXNBQ1RDaGFuZ2VkIiwiaXNHYW1lQ2hhbmdlZCIsIkNvbWJhdGFudE1lbW9yeSIsImNoYW5nZSIsInJlcGVhdGluZ0ZpZWxkcyIsInN0YXJ0aW5nSW5kZXgiLCJsYWJlbCIsIm5hbWVzIiwic29ydEtleXMiLCJwcmltYXJ5S2V5IiwicG9zc2libGVLZXlzIiwia2V5c1RvQW5vbnltaXplIiwicGFpciIsImtleSIsInZhbHVlIiwiUlNWRGF0YSIsImxvY2FsZSIsIlN0YXJ0c1VzaW5nRXh0cmEiLCJBYmlsaXR5RXh0cmEiLCJnbG9iYWxFZmZlY3RDb3VudGVyIiwiZGF0YUZsYWciLCJDb250ZW50RmluZGVyU2V0dGluZ3MiLCJ6b25lSWQiLCJ6b25lTmFtZSIsImluQ29udGVudEZpbmRlckNvbnRlbnQiLCJ1bnJlc3RyaWN0ZWRQYXJ0eSIsIm1pbmltYWxJdGVtTGV2ZWwiLCJzaWxlbmNlRWNobyIsImV4cGxvcmVyTW9kZSIsImxldmVsU3luYyIsIk5wY1llbGwiLCJucGNJZCIsIm5wY1llbGxJZCIsIkJhdHRsZVRhbGsyIiwiaW5zdGFuY2VDb250ZW50VGV4dElkIiwiZGlzcGxheU1zIiwiQ291bnRkb3duIiwiY291bnRkb3duVGltZSIsInJlc3VsdCIsIkNvdW50ZG93bkNhbmNlbCIsIkFjdG9yTW92ZSIsIkFjdG9yU2V0UG9zIiwiU3Bhd25OcGNFeHRyYSIsInBhcmVudElkIiwidGV0aGVySWQiLCJhbmltYXRpb25TdGF0ZSIsIkFjdG9yQ29udHJvbEV4dHJhIiwicGFyYW0zIiwicGFyYW00IiwiQWN0b3JDb250cm9sU2VsZkV4dHJhIiwicGFyYW01IiwicGFyYW02IiwibG9nRGVmaW5pdGlvbnNWZXJzaW9ucyIsImFzc2VydExvZ0RlZmluaXRpb25zIiwiY29uc29sZSIsImFzc2VydCIsIlVucmVhY2hhYmxlQ29kZSIsImNvbnN0cnVjdG9yIiwibG9nRGVmaW5pdGlvbnMiLCJzZXBhcmF0b3IiLCJtYXRjaERlZmF1bHQiLCJtYXRjaFdpdGhDb2xvbnNEZWZhdWx0IiwiZmllbGRzV2l0aFBvdGVudGlhbENvbG9ucyIsImRlZmF1bHRQYXJhbXMiLCJsb2dUeXBlIiwiT2JqZWN0Iiwia2V5cyIsInB1c2giLCJwYXJhbXMiLCJwcm9wIiwiaW5kZXgiLCJlbnRyaWVzIiwiaW5jbHVkZXMiLCJwYXJhbSIsImZpZWxkIiwib3B0aW9uYWwiLCJyZXBlYXRpbmciLCJyZXBlYXRpbmdLZXlzIiwiaXNSZXBlYXRpbmdGaWVsZCIsIkFycmF5IiwiaXNBcnJheSIsImUiLCJwYXJzZUhlbHBlciIsImRlZktleSIsInZhbGlkRmllbGRzIiwiUmVnZXhlcyIsInZhbGlkYXRlUGFyYW1zIiwiY2FwdHVyZSIsInRydWVJZlVuZGVmaW5lZCIsImZpZWxkS2V5cyIsInNvcnQiLCJhIiwiYiIsInBhcnNlSW50IiwibWF4S2V5U3RyIiwidG1wS2V5IiwicG9wIiwibGVuZ3RoIiwiZmllbGROYW1lIiwibWF4S2V5IiwiYWJpbGl0eU1lc3NhZ2VUeXBlIiwiYWJpbGl0eUhleENvZGUiLCJwcmVmaXgiLCJ0eXBlQXNIZXgiLCJ0b1N0cmluZyIsInRvVXBwZXJDYXNlIiwiZGVmYXVsdEhleENvZGUiLCJzbGljZSIsImhleENvZGUiLCJzdHIiLCJsYXN0S2V5Iiwia2V5U3RyIiwicGFyc2VGaWVsZCIsIm1pc3NpbmdGaWVsZHMiLCJKU09OIiwic3RyaW5naWZ5IiwiZmllbGREZWZhdWx0IiwiZGVmYXVsdEZpZWxkVmFsdWUiLCJmaWVsZFZhbHVlIiwicmVwZWF0aW5nRmllbGRzU2VwYXJhdG9yIiwicmVwZWF0aW5nQXJyYXkiLCJsZWZ0IiwicmlnaHQiLCJ0b0xvd2VyQ2FzZSIsImxvY2FsZUNvbXBhcmUiLCJ3YXJuIiwibGVmdFZhbHVlIiwicmlnaHRWYWx1ZSIsImFub25SZXBzIiwiZm9yRWFjaCIsInBvc3NpYmxlS2V5IiwicmVwIiwiZmluZCIsImZpZWxkUmVnZXgiLCJ2YWwiLCJzb21lIiwidiIsIm1heWJlQ2FwdHVyZSIsInBhcnNlIiwiYnVpbGRSZWdleCIsImxvZ1ZlcnNpb24iLCJzdGFydHNVc2luZyIsImFiaWxpdHlGdWxsIiwiaGVhZE1hcmtlciIsImFkZGVkQ29tYmF0YW50IiwiYWRkZWRDb21iYXRhbnRGdWxsIiwicmVtb3ZpbmdDb21iYXRhbnQiLCJnYWluc0VmZmVjdCIsInN0YXR1c0VmZmVjdEV4cGxpY2l0IiwibG9zZXNFZmZlY3QiLCJ0ZXRoZXIiLCJ3YXNEZWZlYXRlZCIsIm5ldHdvcmtEb1QiLCJlY2hvIiwiZ2FtZUxvZyIsImRpYWxvZyIsIm1lc3NhZ2UiLCJnYW1lTmFtZUxvZyIsInN0YXRDaGFuZ2UiLCJjaGFuZ2Vab25lIiwibmV0d29yazZkIiwibmFtZVRvZ2dsZSIsIm1hcCIsInN5c3RlbUxvZ01lc3NhZ2UiLCJtYXBFZmZlY3QiLCJmYXRlRGlyZWN0b3IiLCJjZURpcmVjdG9yIiwiaW5Db21iYXQiLCJjb21iYXRhbnRNZW1vcnkiLCJzdGFydHNVc2luZ0V4dHJhIiwiYWJpbGl0eUV4dHJhIiwiY29udGVudEZpbmRlclNldHRpbmdzIiwibnBjWWVsbCIsImJhdHRsZVRhbGsyIiwiY291bnRkb3duIiwiY291bnRkb3duQ2FuY2VsIiwiYWN0b3JNb3ZlIiwiYWN0b3JTZXRQb3MiLCJzcGF3bk5wY0V4dHJhIiwiYWN0b3JDb250cm9sRXh0cmEiLCJhY3RvckNvbnRyb2xTZWxmRXh0cmEiLCJkZWZhdWx0VmFsdWUiLCJhbnlPZiIsIm5hbWVkQ2FwdHVyZSIsImVycm9yIiwiYXJncyIsImFueU9mQXJyYXkiLCJhcnJheSIsImVsZW0iLCJSZWdFeHAiLCJqb2luIiwiZmlyc3RBcmciLCJyZWdleHBTdHJpbmciLCJrQ2FjdGJvdENhdGVnb3JpZXMiLCJUaW1lc3RhbXAiLCJOZXRUaW1lc3RhbXAiLCJOZXRGaWVsZCIsIkxvZ1R5cGUiLCJBYmlsaXR5Q29kZSIsIk9iamVjdElkIiwiTmFtZSIsIkZsb2F0IiwibW9kaWZpZXJzIiwiZ2xvYmFsIiwibXVsdGlsaW5lIiwicmVwbGFjZSIsIm1hdGNoIiwiZ3JvdXAiLCJwYXJzZUdsb2JhbCIsInJlZ2V4IiwiZiIsImZ1bmNOYW1lIiwibWFnaWNUcmFuc2xhdGlvblN0cmluZyIsIm1hZ2ljU3RyaW5nUmVnZXgiLCJrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbkFzQ29uc3QiLCJrZXlzVGhhdFJlcXVpcmVUcmFuc2xhdGlvbiIsImdhbWVMb2dDb2RlcyIsImFjdG9yQ29udHJvbFR5cGUiLCJzZXRBbmltU3RhdGUiLCJwdWJsaWNDb250ZW50VGV4dCIsImxvZ01zZyIsImxvZ01zZ1BhcmFtcyIsInRyYW5zUGFyYW1zIiwiZmlsdGVyIiwiayIsIm5lZWRzVHJhbnNsYXRpb25zIiwiTmV0UmVnZXhlcyIsImZsYWdUcmFuc2xhdGlvbnNOZWVkZWQiLCJzZXRGbGFnVHJhbnNsYXRpb25zTmVlZGVkIiwiZG9lc05ldFJlZ2V4TmVlZFRyYW5zbGF0aW9uIiwiZXhlYyIsImNvbW1vbk5ldFJlZ2V4Iiwid2lwZSIsImNhY3Rib3RXaXBlRWNobyIsInVzZXJXaXBlRWNobyIsImJ1aWxkTmV0UmVnZXhGb3JUcmlnZ2VyIiwiaW5pdGVkIiwid3NVcmwiLCJ3cyIsInF1ZXVlIiwicnNlcUNvdW50ZXIiLCJyZXNwb25zZVByb21pc2VzIiwic3Vic2NyaWJlcnMiLCJzZW5kTWVzc2FnZSIsIm1zZyIsImNiIiwic2VuZCIsIndpbmRvdyIsIk92ZXJsYXlQbHVnaW5BcGkiLCJjYWxsSGFuZGxlciIsInByb2Nlc3NFdmVudCIsImluaXQiLCJzdWJzIiwic3ViIiwiZGlzcGF0Y2hPdmVybGF5RXZlbnQiLCJhZGRPdmVybGF5TGlzdGVuZXIiLCJldmVudCIsImNhbGwiLCJldmVudHMiLCJyZW1vdmVPdmVybGF5TGlzdGVuZXIiLCJsaXN0IiwicG9zIiwiaW5kZXhPZiIsInNwbGljZSIsImNhbGxPdmVybGF5SGFuZGxlckludGVybmFsIiwiX21zZyIsInJzZXEiLCJwIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkYXRhIiwicGFyc2VkIiwiY2FsbE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGVNYXAiLCJjYWxsT3ZlcmxheUhhbmRsZXIiLCJjYWxsRnVuYyIsInNldE92ZXJsYXlIYW5kbGVyT3ZlcnJpZGUiLCJvdmVycmlkZSIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsImdldCIsImNvbm5lY3RXcyIsIldlYlNvY2tldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJsb2ciLCJxIiwicHJvbWlzZUZ1bmNzIiwic2V0VGltZW91dCIsIndhaXRGb3JBcGkiLCJyZWFkeSIsIl9fT3ZlcmxheUNhbGxiYWNrIiwiaXRlbSIsImN1cnJlbnRab25lIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImlubmVyVGV4dCIsInpvbmVJRCIsImRldGFpbCIsInBsYXllcklkIiwiY3VycmVudEhQIiwibWF4SFAiLCJjdXJyZW50TVAiLCJtYXhNUCIsImNwIiwiY3VycmVudENQIiwibWF4Q1AiLCJncCIsImN1cnJlbnRHUCIsIm1heEdQIiwiZGVidWciLCJkZWJ1Z0pvYiIsImpvYkluZm8iLCJqb2JEZXRhaWwiLCJ3aGl0ZU1hbmEiLCJibGFja01hbmEiLCJtYW5hU3RhY2tzIiwiYmVhc3QiLCJibG9vZCIsImRhcmtzaWRlTWlsbGlzZWNvbmRzIiwiZGFya0FydHMiLCJsaXZpbmdTaGFkb3dNaWxsaXNlY29uZHMiLCJjYXJ0cmlkZ2VzIiwiY29udGludWF0aW9uU3RhdGUiLCJvYXRoIiwic29uZ05hbWUiLCJsYXN0UGxheWVkIiwic29uZ1Byb2NzIiwic291bEdhdWdlIiwic29uZ01pbGxpc2Vjb25kcyIsImNvZGEiLCJmZWF0aGVycyIsImVzcHJpdCIsInN0ZXBzIiwiY3VycmVudFN0ZXAiLCJuaW5raUFtb3VudCIsImthemVtYXRvaSIsImJsb29kTWlsbGlzZWNvbmRzIiwibGlmZU1pbGxpc2Vjb25kcyIsImV5ZXNBbW91bnQiLCJmaXJzdG1pbmRzRm9jdXMiLCJ1bWJyYWxTdGFja3MiLCJ1bWJyYWxNaWxsaXNlY29uZHMiLCJ1bWJyYWxIZWFydHMiLCJwb2x5Z2xvdCIsImVub2NoaWFuIiwibmV4dFBvbHlnbG90TWlsbGlzZWNvbmRzIiwicGFyYWRveCIsImFzdHJhbFNvdWxTdGFja3MiLCJsaWx5U3RhY2tzIiwibGlseU1pbGxpc2Vjb25kcyIsImJsb29kbGlseVN0YWNrcyIsImFldGhlcmZsb3dTdGFja3MiLCJ0cmFuY2VNaWxsaXNlY29uZHMiLCJhdHR1bmVtZW50IiwiYXR0dW5lbWVudE1pbGxpc2Vjb25kcyIsImFjdGl2ZVByaW1hbCIsInVzYWJsZUFyY2FudW0iLCJuZXh0U3VtbW9uZWQiLCJzdW1tb25TdGF0dXMiLCJmYWlyeUdhdWdlIiwiZmFpcnlTdGF0dXMiLCJmYWlyeU1pbGxpc2Vjb25kcyIsImNhcmQxIiwiY2FyZDIiLCJjYXJkMyIsImNhcmQ0IiwibmV4dGRyYXciLCJjaGFrcmFTdGFja3MiLCJsdW5hck5hZGkiLCJzb2xhck5hZGkiLCJiZWFzdENoYWtyYSIsIm9wb29wb0Z1cnkiLCJyYXB0b3JGdXJ5IiwiY29ldXJsRnVyeSIsImhlYXQiLCJvdmVyaGVhdE1pbGxpc2Vjb25kcyIsImJhdHRlcnkiLCJiYXR0ZXJ5TWlsbGlzZWNvbmRzIiwibGFzdEJhdHRlcnlBbW91bnQiLCJvdmVyaGVhdEFjdGl2ZSIsInJvYm90QWN0aXZlIiwia2Vua2kiLCJtZWRpdGF0aW9uU3RhY2tzIiwic2V0c3UiLCJnZXRzdSIsImthIiwiYWRkZXJzZ2FsbCIsImFkZGVyc2dhbGxNaWxsaXNlY29uZHMiLCJhZGRlcnN0aW5nIiwiZXVrcmFzaWEiLCJzb3VsIiwic2hyb3VkIiwiZW5zaHJvdWRNaWxsaXNlY29uZHMiLCJsZW11cmVTaHJvdWQiLCJ2b2lkU2hyb3VkIiwicmF0dGxpbmdDb2lsU3RhY2tzIiwiYW5ndWluZVRyaWJ1dGUiLCJzZXJwZW50T2ZmZXJpbmciLCJhZHZhbmNlZENvbWJvIiwicmVhd2FrZW5lZFRpbWVyIiwicGFsZXR0ZUdhdWdlIiwicGFpbnQiLCJjcmVhdHVyZU1vdGlmIiwid2VhcG9uTW90aWYiLCJsYW5kc2NhcGVNb3RpZiIsImRlcGljdGlvbnMiLCJtb29nbGVQb3J0cmFpdCIsIm1hZGVlblBvcnRyYWl0IiwidG9GaXhlZCIsInJvdGF0aW9uIiwiVGFyZ2V0IiwidGlkIiwiSUQiLCJ0ZGlzdGFuY2UiLCJEaXN0YW5jZSIsIl9lIiwidHRzRWNob1JlZ2V4IiwicmF3TGluZSIsImdyb3VwcyIsImNvbG9uIiwidGV4dCIsImZpbGUiXSwic291cmNlUm9vdCI6IiJ9