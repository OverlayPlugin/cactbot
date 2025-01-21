// Unit test data mapped to the logdef examples in /util/example_log_lines.ts

import { RepeatingFieldsTypes } from '../../resources/netlog_defs';
import NetRegexes from '../../resources/netregexes';
import Regexes from '../../resources/regexes';
import { NetFields } from '../../types/net_fields';
import { RepeatingFieldsExtract } from '../../types/net_props';
import { CactbotBaseRegExp } from '../../types/net_trigger';
import exampleLogLines, { ExampleLineName, ExampleRegex } from '../../util/example_log_lines';

import { RegexUtilParams } from './regex_util';

type RegexFunc<T extends ExampleLineName> = (params?: RegexUtilParams) => CactbotBaseRegExp<T>;

export type ExampleLineNameWithRepeating = Extract<ExampleLineName, RepeatingFieldsTypes>;

type NetFieldsStrings<T extends ExampleLineName> = { [field in keyof NetFields[T]]?: string };
export type TestFields<T extends ExampleLineName> = T extends ExampleLineNameWithRepeating
  ? NetFieldsStrings<T> & RepeatingFieldsExtract<T>
  : NetFieldsStrings<T>;

export type UnitTest<T extends ExampleLineName> = {
  // the index of the example in 'en' (in /util/example_log_lines.ts) to test
  lineToTest: string;
  // override the regex to use for this test (as a func to support capture test)
  regexOverride?: Partial<ExampleRegex<RegexFunc<T>>>;
  expectedValues: TestFields<T>;
};

type LineTests = {
  [T in ExampleLineName]: UnitTest<T> | UnitTest<T>[];
};

const lineTests: LineTests = {
  GameLog: [
    { // test base GameLog regex
      lineToTest: exampleLogLines['GameLog'].examples.en[4],
      expectedValues: {
        type: '00',
        code: '322A',
        line: 'The attack misses.',
      },
    },
    { // test message()
      lineToTest: exampleLogLines['GameLog'].examples.en[0],
      regexOverride: {
        network: (params?) => NetRegexes.message(params),
        logLine: (params?) => Regexes.message(params),
      },
      expectedValues: {
        type: '00',
        code: '0839',
        line: 'You change to warrior.',
      },
    },
    { // test dialog()
      lineToTest: exampleLogLines['GameLog'].examples.en[5],
      regexOverride: {
        network: (params?) => NetRegexes.dialog(params),
        logLine: (params?) => Regexes.dialog(params),
      },
      expectedValues: {
        type: '00',
        code: '0044',
        name: 'Tsukuyomi',
        line: 'Oh...it\'s going to be a long night.',
      },
    },
    { // test echo()
      lineToTest: exampleLogLines['GameLog'].examples.en[6],
      regexOverride: {
        network: (params?) => NetRegexes.echo(params),
        logLine: (params?) => Regexes.echo(params),
      },
      expectedValues: {
        type: '00',
        code: '0038',
        line: 'cactbot wipe',
      },
    },
    { // test gameNameLog()
      lineToTest: exampleLogLines['GameLog'].examples.en[7],
      regexOverride: {
        network: (params?) => NetRegexes.gameNameLog(params),
        logLine: (params?) => Regexes.gameNameLog(params),
      },
      expectedValues: {
        type: '00',
        code: '001D',
        name: 'Tini Poutini',
        line: 'Tini Poutini straightens her spectacles for you.',
      },
    },
  ],
  ChangeZone: {
    lineToTest: exampleLogLines['ChangeZone'].examples.en[0],
    expectedValues: {
      type: '01',
      id: '326',
      name: 'Kugane Ohashi',
    },
  },
  ChangedPlayer: {
    lineToTest: exampleLogLines['ChangedPlayer'].examples.en[0],
    expectedValues: {
      type: '02',
      id: '10FF0001',
      name: 'Tini Poutini',
    },
  },
  AddedCombatant: [
    {
      lineToTest: exampleLogLines['AddedCombatant'].examples.en[0],
      expectedValues: {
        type: '03',
        id: '10FF0001',
        name: 'Tini Poutini',
        job: '24',
        level: '46',
        ownerId: '0000',
        worldId: '28',
        world: 'Jenova',
        npcNameId: '0',
        npcBaseId: '0',
        currentHp: '30460',
        hp: '30460',
        currentMp: '10000',
        mp: '10000',
        x: '-0.76',
        y: '15.896',
        z: '0',
        heading: '-3.141593',
      },
    },
    { // test non-zero values for npcNameId/npcBaseId
      lineToTest: exampleLogLines['AddedCombatant'].examples.en[1],
      expectedValues: {
        type: '03',
        id: '4000B364',
        name: 'Catastrophe',
        npcNameId: '5631',
        npcBaseId: '6358',
      },
    },
  ],
  RemovedCombatant: {
    lineToTest: exampleLogLines['RemovedCombatant'].examples.en[0],
    expectedValues: {
      type: '04',
      id: '10FF0001',
      name: 'Tini Poutini',
      job: '05',
      level: '1E',
      owner: '0000',
      world: 'Jenova',
      npcNameId: '0',
      npcBaseId: '0',
      currentHp: '816',
      hp: '816',
      currentMp: '10000',
      mp: '10000',
      x: '-66.24337',
      y: '-292.0904',
      z: '20.06466',
      heading: '1.789943',
    },
  },
  PartyList: {
    lineToTest: exampleLogLines['PartyList'].examples.en[0],
    expectedValues: {
      type: '11',
      partyCount: '8',
    },
  },
  PlayerStats: {
    lineToTest: exampleLogLines['PlayerStats'].examples.en[0],
    expectedValues: {
      type: '12',
      job: '21',
      strength: '5456',
      dexterity: '326',
      vitality: '6259',
      intelligence: '135',
      mind: '186',
      piety: '340',
      attackPower: '5456',
      directHit: '380',
      criticalHit: '3863',
      attackMagicPotency: '135',
      healMagicPotency: '186',
      determination: '2628',
      skillSpeed: '1530',
      spellSpeed: '380',
      tenacity: '1260',
      localContentId: '4000174AE14AB6',
    },
  },
  StartsUsing: {
    lineToTest: exampleLogLines['StartsUsing'].examples.en[1],
    expectedValues: {
      type: '20',
      sourceId: '10FF0001',
      source: 'Tini Poutini',
      id: 'DF0',
      ability: 'Stone III',
      targetId: '40024FC4',
      target: 'The Manipulator',
      castTime: '2.35',
      x: '-0.06491255',
      y: '-9.72675',
      z: '10.54466',
      heading: '-3.141591',
    },
  },
  Ability: {
    lineToTest: exampleLogLines['Ability'].examples.en[0],
    regexOverride: {
      network: (params?) => NetRegexes.ability(params),
      logLine: (params?) => Regexes.ability(params),
    },
    expectedValues: {
      type: '21',
      sourceId: '40024FD1',
      source: 'Steam Bit',
      id: 'F67',
      ability: 'Aetherochemical Laser',
      targetId: '10FF0001',
      target: 'Tini Poutini',
      flags: '750003',
      damage: '4620000',
      targetCurrentHp: '36022',
      targetMaxHp: '36022',
      targetCurrentMp: '5200',
      targetMaxMp: '10000',
      targetX: '1.846313',
      targetY: '-12.31409',
      targetZ: '10.60608',
      targetHeading: '-2.264526',
      currentHp: '16000',
      maxHp: '16000',
      currentMp: '8840',
      maxMp: '10000',
      x: '-9.079163',
      y: '-14.02307',
      z: '18.7095',
      heading: '1.416605',
      sequence: '0000DE1F',
      targetIndex: '0',
      targetCount: '1',
    },
  },
  NetworkAOEAbility: {
    lineToTest: exampleLogLines['NetworkAOEAbility'].examples.en[0],
    expectedValues: {
      type: '22',
      sourceId: '4004DA6A',
      source: 'Hulder',
      id: '69C1',
      ability: 'Lay of Mislaid Memory',
      targetId: '10FF0001',
      target: 'Tini Poutini',
      flags: '750003',
      damage: '36C60000',
      targetCurrentHp: '56269',
      targetMaxHp: '56269',
      targetCurrentMp: '10000',
      targetMaxMp: '10000',
      targetX: '412.38',
      targetY: '-642.76',
      targetZ: '168.66',
      targetHeading: '-2.85',
      currentHp: '5642456',
      maxHp: '11048472',
      currentMp: '10000',
      maxMp: '10000',
      x: '410.42',
      y: '-650.11',
      z: '170.72',
      heading: '-0.51',
      sequence: '00346744',
      targetIndex: '5',
      targetCount: '17',
    },
  },
  NetworkCancelAbility: {
    lineToTest: exampleLogLines['NetworkCancelAbility'].examples.en[0],
    expectedValues: {
      type: '23',
      sourceId: '10FF0002',
      source: 'Potato Chippy',
      id: '408D',
      name: 'Veraero II',
      reason: 'Cancelled',
    },
  },
  NetworkDoT: {
    lineToTest: exampleLogLines['NetworkDoT'].examples.en[0],
    expectedValues: {
      id: '10FF0001',
      name: 'Tini Poutini',
      which: 'DoT',
      effectId: '3C0',
      damage: '9920',
      currentHp: '32134',
      maxHp: '63300',
      currentMp: '10000',
      maxMp: '10000',
      x: '90.44',
      y: '87.60',
      z: '0.00',
      heading: '-3.07',
      sourceId: '4000F123',
      source: 'Shikigami of the Pyre',
      damageType: '5',
      sourceCurrentHp: '7328307',
      sourceMaxHp: '7439000',
      sourceCurrentMp: '10000',
      sourceMaxMp: '10000',
      sourceX: '99.78',
      sourceY: '104.81',
      sourceZ: '0.00',
      sourceHeading: '2.95',
    },
  },
  WasDefeated: {
    lineToTest: exampleLogLines['WasDefeated'].examples.en[0],
    expectedValues: {
      type: '25',
      targetId: '10FF0002',
      target: 'Potato Chippy',
      sourceId: '4000016E',
      source: 'Angra Mainyu',
    },
  },
  GainsEffect: [
    {
      lineToTest: exampleLogLines['GainsEffect'].examples.en[0],
      expectedValues: {
        type: '26',
        effectId: '35',
        effect: 'Physical Damage Up',
        duration: '15.00',
        sourceId: '400009D5',
        source: 'Dark General',
        targetId: '400009D5',
        target: 'Dark General',
        count: '00',
        targetMaxHp: '48865',
        sourceMaxHp: '48865',
      },
    },
    { // test non-zero count
      lineToTest: exampleLogLines['GainsEffect'].examples.en[3],
      expectedValues: {
        type: '26',
        effectId: '8D1',
        effect: 'Lightsteeped',
        duration: '39.95',
        sourceId: 'E0000000',
        count: '01',
      },
    },
  ],
  HeadMarker: {
    lineToTest: exampleLogLines['HeadMarker'].examples.en[0],
    expectedValues: {
      type: '27',
      targetId: '10FF0001',
      target: 'Tini Poutini',
      id: '0057',
    },
  },
  NetworkRaidMarker: {
    lineToTest: exampleLogLines['NetworkRaidMarker'].examples.en[1],
    expectedValues: {
      type: '28',
      operation: 'Add',
      waymark: '4',
      id: '10FF0001',
      name: 'Tini Poutini',
      x: '76.073',
      y: '110.588',
      z: '0',
    },
  },
  NetworkTargetMarker: {
    lineToTest: exampleLogLines['NetworkTargetMarker'].examples.en[1],
    expectedValues: {
      type: '29',
      operation: 'Add',
      waymark: '6',
      id: '10FF0001',
      name: 'Tini Poutini',
      targetId: '10FF0002',
      targetName: 'Potato Chippy',
    },
  },
  LosesEffect: [
    {
      lineToTest: exampleLogLines['LosesEffect'].examples.en[0],
      expectedValues: {
        type: '30',
        effectId: '13A',
        effect: 'Inferno',
        sourceId: '400009FF',
        source: 'Ifrit-Egi',
        targetId: '400009FD',
        target: 'Scylla',
        count: '00',
      },
    },
    { // test non-zero count
      lineToTest: exampleLogLines['LosesEffect'].examples.en[1],
      expectedValues: {
        type: '30',
        effectId: '77B',
        effect: 'Summon Order',
        count: '01',
      },
    },
  ],
  NetworkGauge: {
    lineToTest: exampleLogLines['NetworkGauge'].examples.en[0],
    expectedValues: {
      type: '31',
      id: '10FF0001',
      data0: 'FA753019',
      data1: 'FD37',
      data2: 'E9A55201',
      data3: '7F47',
    },
  },
  ActorControl: [
    {
      lineToTest: exampleLogLines['ActorControl'].examples.en[0],
      expectedValues: {
        type: '33',
        instance: '80034E6C',
        command: '4000000F',
        data0: 'B5D',
        data1: '00',
        data2: '00',
        data3: '00',
      },
    },
    {
      lineToTest: exampleLogLines['ActorControl'].examples.en[1],
      expectedValues: {
        type: '33',
        instance: '80034E5B',
        command: '8000000C',
        data0: '16',
        data1: 'FFFFFFFF',
      },
    },
  ],
  NameToggle: {
    lineToTest: exampleLogLines['NameToggle'].examples.en[0],
    expectedValues: {
      type: '34',
      id: '4001C51C',
      name: 'Dragon\'s Head',
      targetId: '4001C51C',
      targetName: 'Dragon\'s Head',
      toggle: '00',
    },
  },
  Tether: {
    lineToTest: exampleLogLines['Tether'].examples.en[0],
    expectedValues: {
      type: '35',
      sourceId: '40003202',
      source: 'Articulated Bit',
      targetId: '10FF0001',
      target: 'Tini Poutini',
      id: '0001',
    },
  },
  LimitBreak: {
    lineToTest: exampleLogLines['LimitBreak'].examples.en[0],
    expectedValues: {
      type: '36',
      valueHex: '6A90',
      bars: '3',
    },
  },
  NetworkEffectResult: {
    lineToTest: exampleLogLines['NetworkEffectResult'].examples.en[0],
    expectedValues: {
      type: '37',
      id: '10FF0001',
      name: 'Tini Poutini',
      sequenceId: '0000003A',
      currentHp: '117941',
      maxHp: '117941',
      currentMp: '10000',
      maxMp: '10000',
      currentShield: '0',
      x: '-660.17',
      y: '-842.23',
      z: '29.75',
      heading: '-1.61',
    },
  },
  StatusEffect: {
    lineToTest: exampleLogLines['StatusEffect'].examples.en[0],
    expectedValues: {
      type: '38',
      targetId: '10FF0001',
      target: 'Tini Poutini',
      jobLevelData: '46504615',
      hp: '75407',
      maxHp: '75407',
      mp: '10000',
      maxMp: '10000',
      currentShield: '24',
      x: '-645.238',
      y: '-802.7854',
      z: '8',
      heading: '1.091302',
      data0: '1500',
      data1: '3C',
      data2: '0',
      // subsquent fields are optional per netlog_defs
    },
  },
  NetworkUpdateHP: {
    lineToTest: exampleLogLines['NetworkUpdateHP'].examples.en[0],
    expectedValues: {
      type: '39',
      id: '10FF0001',
      name: 'Tini Poutini',
      currentHp: '178669',
      maxHp: '191948',
      currentMp: '10000',
      maxMp: '10000',
      x: '-648.3234',
      y: '-804.5252',
      z: '8.570148',
      heading: '1.010669',
    },
  },
  Map: {
    lineToTest: exampleLogLines['Map'].examples.en[0],
    expectedValues: {
      type: '40',
      id: '578',
      regionName: 'Norvrandt',
      placeName: 'The Copied Factory',
      placeNameSub: 'Upper Stratum',
    },
  },
  SystemLogMessage: {
    lineToTest: exampleLogLines['SystemLogMessage'].examples.en[1],
    expectedValues: {
      type: '41',
      instance: '8004001E',
      id: '7DD',
      param0: 'FF5FDA02',
      param1: 'E1B',
      param2: '00',
    },
  },
  StatusList3: {
    lineToTest: exampleLogLines['StatusList3'].examples.en[0],
    expectedValues: {
      type: '42',
      id: '10FF0001',
      name: 'Tini Poutini',
    },
  },
  LineRegistration: {
    lineToTest: exampleLogLines['LineRegistration'].examples.en[0],
    expectedValues: {
      type: '256',
      id: '257',
      source: 'OverlayPlugin',
      name: 'MapEffect',
      version: '1',
    },
  },
  MapEffect: {
    lineToTest: exampleLogLines['MapEffect'].examples.en[0],
    expectedValues: {
      type: '257',
      instance: '800375A9',
      flags: '00020001',
      location: '09',
      data0: 'F3',
      data1: '0000',
    },
  },
  FateDirector: {
    lineToTest: exampleLogLines['FateDirector'].examples.en[0],
    expectedValues: {
      type: '258',
      category: 'Add',
      fateId: '000000DE',
      progress: '00000000',
    },
  },
  CEDirector: {
    lineToTest: exampleLogLines['CEDirector'].examples.en[2],
    expectedValues: {
      type: '259',
      popTime: '63291786',
      timeRemaining: '04AA',
      ceKey: '07',
      numPlayers: '01',
      status: '03',
      progress: '02',
    },
  },
  InCombat: {
    lineToTest: exampleLogLines['InCombat'].examples.en[1],
    expectedValues: {
      type: '260',
      inACTCombat: '1',
      inGameCombat: '0',
      isACTChanged: '0',
      isGameChanged: '1',
    },
  },
  CombatantMemory: {
    lineToTest: exampleLogLines['CombatantMemory'].examples.en[0],
    expectedValues: {
      type: '261',
      change: 'Add',
      id: '40008953',
      pair: [
        { key: 'BNpcID', value: '3F5A' },
        { key: 'BNpcNameID', value: '304E' },
        { key: 'CastTargetID', value: 'E0000000' },
        { key: 'CurrentMP', value: '10000' },
        { key: 'CurrentWorldID', value: '65535' },
        { key: 'Heading', value: '-3.1416' },
        { key: 'Level', value: '90' },
        { key: 'MaxHP', value: '69200' },
        { key: 'MaxMP', value: '10000' },
        { key: 'ModelStatus', value: '18432' },
        { key: 'Name', value: 'Golbez\'s Shadow' },
        { key: 'NPCTargetID', value: 'E0000000' },
        { key: 'PosX', value: '100.0000' },
        { key: 'PosY', value: '100.0000' },
        { key: 'PosZ', value: '0.0300' },
        { key: 'Radius', value: '7.5000' },
        { key: 'Type', value: '2' },
        { key: 'WorldID', value: '65535' },
      ],
    },
  },
  RSVData: {
    lineToTest: exampleLogLines['RSVData'].examples.en[1],
    expectedValues: {
      type: '262',
      locale: 'en',
      key: '_rsv_3448_-1_1_1_0_S74CFC3B0_E74CFC3B0',
      value: 'Burning with dynamis inspired by Omega\'s passion.',
    },
  },
  StartsUsingExtra: {
    lineToTest: exampleLogLines['StartsUsingExtra'].examples.en[0],
    expectedValues: {
      type: '263',
      sourceId: '10001234',
      id: '0005',
      x: '-98.697',
      y: '-102.359',
      z: '10.010',
    },
  },
  AbilityExtra: {
    lineToTest: exampleLogLines['AbilityExtra'].examples.en[2],
    expectedValues: {
      type: '264',
      sourceId: '4000619D',
      id: '8BC0',
      globalEffectCounter: '00000662',
      dataFlag: '1',
      x: '1.000',
      y: '2.000',
      z: '3.000',
      heading: '1.570',
      animationTargetId: '1234ABCD',
    },
  },
  ContentFinderSettings: {
    lineToTest: exampleLogLines['ContentFinderSettings'].examples.en[2],
    expectedValues: {
      type: '265',
      zoneId: '415',
      zoneName: 'the Bowl of Embers',
      inContentFinderContent: 'True',
      unrestrictedParty: '1',
      minimalItemLevel: '1',
      silenceEcho: '1',
      explorerMode: '0',
      levelSync: '1',
    },
  },
  NpcYell: {
    lineToTest: exampleLogLines['NpcYell'].examples.en[0],
    expectedValues: {
      type: '266',
      npcId: '4001F001',
      npcNameId: '02D2',
      npcYellId: '07AF',
    },
  },
  BattleTalk2: {
    lineToTest: exampleLogLines['BattleTalk2'].examples.en[2],
    expectedValues: {
      type: '267',
      npcId: '4001FFC4',
      instance: '80034E2B',
      npcNameId: '02D5',
      instanceContentTextId: '840F',
      displayMs: '3000',
    },
  },
  Countdown: {
    lineToTest: exampleLogLines['Countdown'].examples.en[0],
    expectedValues: {
      type: '268',
      id: '10FF0001',
      worldId: '0036',
      countdownTime: '13',
      result: '00',
      name: 'Tini Poutini',
    },
  },
  CountdownCancel: {
    lineToTest: exampleLogLines['CountdownCancel'].examples.en[0],
    expectedValues: {
      type: '269',
      id: '10FF0001',
      worldId: '0036',
      name: 'Tini Poutini',
    },
  },
  ActorMove: {
    lineToTest: exampleLogLines['ActorMove'].examples.en[0],
    expectedValues: {
      type: '270',
      id: '4000F1D3',
      heading: '-2.2034',
      x: '102.0539',
      y: '118.1982',
      z: '0.2136',
    },
  },
  ActorSetPos: {
    lineToTest: exampleLogLines['ActorSetPos'].examples.en[0],
    expectedValues: {
      type: '271',
      id: '4000F3B7',
      heading: '-2.3563',
      x: '116.2635',
      y: '116.2635',
      z: '0.0000',
    },
  },
  SpawnNpcExtra: {
    lineToTest: exampleLogLines['SpawnNpcExtra'].examples.en[0],
    expectedValues: {
      type: '272',
      id: '4000226B',
      parentId: 'E0000000',
      tetherId: '0000',
      animationState: '01',
    },
  },
  ActorControlExtra: {
    lineToTest: exampleLogLines['ActorControlExtra'].examples.en[0],
    expectedValues: {
      type: '273',
      id: '4000A145',
      category: '003E',
      param1: '1',
      param2: '0',
      param3: '0',
      param4: '0',
    },
  },
  ActorControlSelfExtra: {
    lineToTest: exampleLogLines['ActorControlSelfExtra'].examples.en[0],
    expectedValues: {
      type: '274',
      id: '10001234',
      category: '020F',
      param1: '04D0',
      param2: '0',
      param3: '93E0',
      param4: '0',
      param5: '0',
      param6: '0',
    },
  },
};

export default lineTests;
