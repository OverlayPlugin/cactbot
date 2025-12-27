import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputCardinal,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
//  - P4: Somber Dance (busters), Edge of Oblivion aoes?
//  - P5: All

type Phase = 'p1' | 'p2-dd' | 'p2-mm' | 'p2-lr' | 'p3-ur' | 'p3-apoc' | 'p4-dld' | 'p4-ct' | 'p5';
const phases: { [id: string]: Phase } = {
  '9CFF': 'p2-dd', // Quadruple Slap (pre-Diamond Dust)
  '9CF3': 'p2-mm', // Mirror, Mirror
  '9D14': 'p2-lr', // Light Rampant
  '9D49': 'p3-ur', // Hell's Judgment (pre-Ultimate Relativity)
  '9D4D': 'p3-apoc', // Spell-in-Waiting: Refrain (pre-Apocalypse)
  '9D36': 'p4-dld', // Materialization (pre-Darklit Dragonsong)
  '9D6A': 'p4-ct', // Crystallize Time
  '9D72': 'p5', // Fulgent Blade
};

const centerX = 100;
const centerY = 100;

const isCardinalDir = (dir: DirectionOutput8): boolean => {
  return Directions.outputCardinalDir.includes(dir as DirectionOutputCardinal);
};

type RelativeClockPos = 'same' | 'opposite' | 'clockwise' | 'counterclockwise' | 'unknown';
const getRelativeClockPos = (
  start: DirectionOutput8,
  compare: DirectionOutput8,
): RelativeClockPos => {
  if (start === 'unknown' || compare === 'unknown')
    return 'unknown';

  const startIdx = Directions.output8Dir.indexOf(start);
  const compareIdx = Directions.output8Dir.indexOf(compare);
  const delta = (compareIdx - startIdx + 8) % 8;

  if (delta === 0)
    return 'same';
  else if (delta < 4)
    return 'clockwise';
  else if (delta === 4)
    return 'opposite';
  return 'counterclockwise';
};

// Ordering here matters - the "G1" directions are first, followed by "G2" directions.
// Maybe add a config for this? But for now, assume that N->CCW is G1 and NE->CW is G2.
const p2KnockbackDirs: DirectionOutput8[] = [
  'dirN',
  'dirNW',
  'dirW',
  'dirSW',
  'dirS',
  'dirSE',
  'dirE',
  'dirNE',
];

type RelativityDebuff = 'longFire' | 'mediumFire' | 'shortFire' | 'ice';
const newRoleMap = () => ({
  support: {
    hasIce: false,
    shortFire: '',
    mediumFire: '',
    longFire: [] as string[],
  },
  dps: {
    hasIce: false,
    shortFire: [] as string[],
    mediumFire: '',
    longFire: '',
  },
  ice: '',
});

// Helper for Ultimate Relativity that finds relative North based on the yellow-tethered lights
// It takes an array of dir nums (e.g. 0-8), finds the two dir nums that have a single gap
// between them (e.g. 1 and 3) -- the apex of the "Y" -- and returns the dir num of the gap.
const findURNorthDirNum = (dirs: number[]): number => {
  for (let i = 0; i < dirs.length; i++) {
    for (let j = i + 1; j < dirs.length; j++) {
      const [dir1, dir2] = [dirs[i], dirs[j]];
      if (dir1 === undefined || dir2 === undefined)
        return -1;
      const diff = Math.abs(dir1 - dir2);
      if (diff === 2)
        return Math.min(dir1, dir2) + 1;
      else if (diff === 6) // wrap around
        return (Math.max(dir1, dir2) + 1) % 8;
    }
  }
  return -1;
};

type ApocDebuffLength = 'short' | 'medium' | 'long' | 'none';
type ApocDebuffMap = Record<ApocDebuffLength, string[]>;

type CTRole = 'redIce' | 'redWind' | 'blueIce' | 'blueWater' | 'blueUnholy' | 'blueEruption';
const ctCollectDebuffs = ['red', 'blue', 'ice', 'wind'] as const;
type CTCollectDebuff = typeof ctCollectDebuffs[number];
type CTCollectDebuffsMap = Record<CTCollectDebuff, string[]>;

type CTAllDebuff = CTCollectDebuff | 'water' | 'unholy' | 'eruption';

const isCTCollectDebuff = (debuff: CTAllDebuff): debuff is CTCollectDebuff => {
  return ctCollectDebuffs.includes(debuff as CTCollectDebuff);
};
const ctDebuffMap: { [effectId: string]: CTAllDebuff } = {
  'CBF': 'red', // Wyrmclaw
  'CC0': 'blue', // Wyrmfang
  '99E': 'ice', // Spell-in-Waiting: Dark Blizzard III
  '99F': 'wind', // Spell-in-Waiting: Dark Aero III
  '99D': 'water', // Spell-in-Waiting: Dark Water III
  '996': 'unholy', // Spell-in-Waiting: Unholy Darkness
  '99C': 'eruption', // Spell-in-Waiting: Dark Eruption
};

const p3UROutputStrings = {
  yNorthStrat: {
    en: '${debuff} (${dir})',
    de: '${debuff} (${dir})',
    cn: '${debuff} (${dir})',
    tc: '${debuff} (${dir})',
    ko: '${debuff} (${dir})',
  },
  dirCombo: {
    en: '${inOut} + ${dir}',
    de: '${inOut} + ${dir}',
    cn: '${inOut} + ${dir}',
    tc: '${inOut} + ${dir}',
    ko: '${inOut} + ${dir}',
  },
  fireSpread: {
    en: 'Fire - Spread',
    de: 'Feuer - verteilen',
    cn: '火分散',
    tc: '火分散',
    ko: '불 - 산개',
  },
  dropRewind: {
    en: 'Drop Rewind',
    de: 'Lege Rückführung ab',
    cn: '放置回返',
    tc: '放置回返',
    ko: '리턴 설치',
  },
  baitStoplight: {
    en: 'Bait Stoplight',
    de: 'Köder Sanduhr',
    cn: '引导激光',
    tc: '引導雷射',
    ko: '모래시계 유도',
  },
  avoidStoplights: {
    en: 'Avoid stoplights',
    de: 'Vermeide Sanduhren',
    cn: '远离激光',
    tc: '遠離雷射',
    ko: '모래시계 피하기',
  },
  stack: Outputs.stackMarker,
  middle: Outputs.middle,
  out: Outputs.out,
};

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    sinboundRotate: 'aacc' | 'addposonly'; // aacc = always away, cursed clockwise
    ultimateRel: 'yNorthDPSEast' | 'none';
    apoc: 'dpsNE-CW' | 'none';
    darklit: 'healerPlantNW' | 'none';
    ct: 'earlyPopSouth' | 'none';
  };
  // General
  phase: Phase | 'unknown';
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  // P1 -- Fatebreaker
  p1ConcealSafeDirs: DirectionOutput8[];
  p1StackSpread?: 'stack' | 'spread';
  p1SeenBurnishedGlory: boolean;
  p1FallOfFaithTethers: ('fire' | 'lightning')[];
  // P2 -- Usurper Of Frost
  p2QuadrupleFirstTarget: string;
  p2QuadrupleDebuffApplied: boolean;
  p2IcicleImpactStart: DirectionOutput8[];
  p2AxeScytheSafe?: 'in' | 'out';
  p2FrigidStoneTargets: string[];
  p2KBShivaDir?: DirectionOutput8;
  p2LightsteepedCount: number;
  p2LightRampantPuddles: string[];
  p2SeenFirstHolyLight: boolean;
  // P3 -- Oracle of Darkness
  p3RelativityRoleCount: number;
  p3RelativityDebuff?: RelativityDebuff;
  p3RelativityRoleMap: ReturnType<typeof newRoleMap>;
  p3RelativityStoplights: { [id: string]: NetMatches['AddedCombatant'] };
  p3RelativityYellowDirNums: number[];
  p3RelativityMyDirStr: string;
  p3ApocDebuffCount: number;
  p3ApocDebuffs: ApocDebuffMap;
  p3ApocMyDebuff?: ApocDebuffLength;
  p3ApocInitialSide?: 'east' | 'west';
  p3ApocGroupSwap?: boolean;
  p3ApocFirstDirNum?: number;
  p3ApocRotationDir?: 1 | -1; // 1 = clockwise, -1 = counterclockwise
  // P4 -- Duo
  p4DarklitTetherCount: number;
  p4DarklitTethers: { [player: string]: string[] };
  p4DarklitCleaves: string[];
  p4DarklitStacks: string[];
  p4DarklitTowerStackLoc?: 'north' | 'south';
  p4CTMyRole?: CTRole;
  p4CTDebuffs: CTCollectDebuffsMap;
  p4CTPartnerRole?: string;
  p4CTStoplights: { [id: string]: NetMatches['AddedCombatant'] };
  p4CTTidalDirs: number[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'FuturesRewrittenUltimate',
  zoneId: ZoneId.FuturesRewrittenUltimate,
  comments: {
    en: 'Triggers: P1-4 / Timeline: P1-5',
    de: 'Triggers: P1-4 / Timeline: P1-5',
    cn: '触发器: P1-4 / 时间轴: P1-5',
    tc: '觸發器: P1-4 / 時間軸: P1-5',
    ko: '트리거: P1-4 / 타임라인: P1-5',
  },
  config: [
    {
      id: 'sinboundRotate',
      comment: {
        en:
          `Always Away, Cursed Clockwise: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        de:
          `Immer Weg, Verflucht im Uhrzeigersinn: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        cn: `总是远离,·180°·顺时针:·<a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        tc: `總是遠離, 180° 順時針: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        ko: `항상 멀리, 180도 시계방향: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
      },
      name: {
        en: 'P2 Diamond Dust / Sinbound Holy',
        de: 'P2 Diamantenstaub / Sünden-Sanctus',
        cn: 'P2 钻石星尘 / 罪神圣',
        tc: 'P2 鑽石星塵 / 罪神聖',
        ko: 'P2 다이아몬드 더스트 / 죄의 홀리',
      },
      type: 'select',
      options: {
        en: {
          'Always Away, Cursed Clockwise': 'aacc',
          'Call Add Position Only': 'addposonly',
        },
        de: {
          'Immer Weg, Verflucht im Uhrzeigersinn': 'aacc',
          'Nenne nur die Add Positionen': 'addposonly',
        },
        cn: {
          '总是远离, 180° 顺时针': 'aacc',
          '仅播报分身位置': 'addposonly',
        },
        ko: {
          '항상 멀리, 180도 시계방향': 'aacc',
          '분신 위치만 호출': 'addposonly',
        },
      },
      default: 'aacc', // `addposonly` is not super helpful, and 'aacc' seems to be predominant
    },
    {
      id: 'ultimateRel',
      comment: {
        en:
          `Y North, DPS E-SW, Supp W-NE: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>.
          Directional output is true north (i.e., "east" means actual east,
          not wherever is east of the "Y" north spot).`,
        de:
          `Y Norden, DPS O-SW, Supp W-NO: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>.
          Die Richtungsansage ist wahrer Norden (d. h., "Osten" bedeutet tatsächlich Osten,
          nicht an der Stelle, die östlich des nördlichen "Y" liegt).`,
        cn:
          `Y 北, DPS 东-西南, T奶 西-东北: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>.
          方向输出为真北 (即 “东”表示实际的东, 而不是相对于 “Y” 北的东)。`,
        ko:
          `Y가 북쪽, 딜러 동-남서쪽, 탱힐 서-북동쪽: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>.
          방향 알림은 실제 북쪽입니다. (즉, "동쪽"은 실제 동쪽을 의미하며, "Y" 모양의 동쪽이 아닙니다.)`,
      },
      name: {
        en: 'P3 Ultimate Relativity',
        de: 'P3 Fatale Relativität',
        cn: 'P3 时间压缩·绝',
        tc: 'P3 時間壓縮·絕',
        ko: 'P3 시간 압축: 절',
      },
      type: 'select',
      options: {
        en: {
          'Y North, DPS E-SW, Supp W-NE': 'yNorthDPSEast',
          'Call Debuffs w/ No Positions': 'none',
        },
        de: {
          'Y Norden, DPS O-SW, Supp W-NO': 'yNorthDPSEast',
          'Debuff ohne Positionen nennen': 'none',
        },
        cn: {
          'Y 北, DPS 东-西南, T奶 西-东北': 'yNorthDPSEast',
          '仅播报 Debuff, 不播报方位': 'none',
        },
        ko: {
          'Y가 북쪽, 딜러 동-남서쪽, 탱힐 서-북동쪽': 'yNorthDPSEast',
          '디버프만 호출': 'none',
        },
      },
      default: 'yNorthDPSEast',
    },
    {
      id: 'apoc',
      comment: {
        en:
          `DPS NE->S, Support SW->N: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        de:
          `DPS NO->S, Support SW->N: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        cn:
          `DPS 东北->南, T奶 西南->北: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        ko:
          `딜러 북동->남, 탱힐 남서->북: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
      },
      name: {
        en: 'P3 Apocalypse',
        de: 'P3 Apokalypse',
        cn: 'P3 启示',
        tc: 'P3 啟示',
        ko: 'P3 대재앙',
      },
      type: 'select',
      options: {
        en: {
          'DPS NE->S, Support SW->N': 'dpsNE-CW',
          'Call All Safe': 'none',
        },
        de: {
          'DPS NO->S, Support SW->N': 'dpsNE-CW',
          'Sage alle sicheren an': 'none',
        },
        cn: {
          'DPS 东北->南, T奶 西南->北': 'dpsNE-CW',
          '播报所有安全区': 'none',
        },
        ko: {
          '딜러 북동->남, 탱힐 남서->북': 'dpsNE-CW',
          '모든 안전지대 알림': 'none',
        },
      },
      default: 'dpsNE-CW',
    },
    {
      id: 'darklit',
      comment: {
        en:
          `Role Quadrants, Healer Plant NW: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        de:
          `Rollenquadranten, Heiler plazieren im NW: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        cn: `按职能四分组,·奶妈在西北:·<a·href="https://pastebin.com/ue7w9jJH"·target="_blank">LesBin</a>`,
        tc: `按職能四分組, 補師在西北: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        ko: `역할군별 사분면, 힐러는 북서쪽: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
      },
      name: {
        en: 'P4 Darklit Dragonsong',
        de: 'P4 Drachenlied Von Licht Und Schatten',
        cn: 'P4 光与暗的龙诗',
        tc: 'P4 光與暗的龍詩',
        ko: 'P4 빛과 어둠의 용시',
      },
      type: 'select',
      options: {
        en: {
          'Role Quads, Healer Plant NW': 'healerPlantNW',
          'Call Tower/Cone Only': 'none',
        },
        de: {
          'Rollenquadranten, Heiler plazieren im NW': 'healerPlantNW',
          'Sage nur Turm/Kegel-AoE an': 'none',
        },
        cn: {
          '按职能四分组, 奶妈在西北': 'healerPlantNW',
          '仅播报塔/扇形': 'none',
        },
        ko: {
          '역할군별 사분면, 힐러는 북서쪽': 'healerPlantNW',
          '탑/부채꼴만 알림': 'none',
        },
      },
      default: 'healerPlantNW',
    },
    {
      id: 'ct',
      comment: {
        en:
          `Early Pop, Winds South: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        de:
          `Frühes explodieren, Winde Süden: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        cn: `龙头早撞, 风南: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        tc: `龍頭早撞, 風南: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
        ko: `빨리 터뜨리기, 바람은 남쪽: <a href="https://pastebin.com/ue7w9jJH" target="_blank">LesBin</a>`,
      },
      name: {
        en: 'P4 Crystallize Time',
        de: 'P4 Chronokristall',
        cn: 'P4 时间结晶',
        tc: 'P4 時間結晶',
        ko: 'P4 시간의 결정체',
      },
      type: 'select',
      options: {
        en: {
          'Early Pop, Winds South': 'earlyPopSouth',
          'Call Initial Debuffs Only': 'none',
        },
        de: {
          'Frühes explodieren, Winde Süden': 'earlyPopSouth',
          'Nenne nur Initial Debuff': 'none',
        },
        cn: {
          '龙头早撞, 风南': 'earlyPopSouth',
          '仅播报初始 Debuff': 'none',
        },
        ko: {
          '빨리 터뜨리기, 바람은 남쪽': 'earlyPopSouth',
          '초기 디버프만 알림': 'none',
        },
      },
      default: 'earlyPopSouth',
    },
  ],
  timelineFile: 'futures_rewritten.txt',
  initData: () => {
    return {
      phase: 'p1',
      actorSetPosTracker: {},
      p1ConcealSafeDirs: [...Directions.output8Dir],
      p1SeenBurnishedGlory: false,
      p1FallOfFaithTethers: [],
      p2QuadrupleFirstTarget: '',
      p2QuadrupleDebuffApplied: false,
      p2IcicleImpactStart: [],
      p2FrigidStoneTargets: [],
      p2LightsteepedCount: 0,
      p2LightRampantPuddles: [],
      p2SeenFirstHolyLight: false,
      p3RelativityRoleCount: 0,
      p3RelativityRoleMap: newRoleMap(),
      p3RelativityStoplights: {},
      p3RelativityYellowDirNums: [],
      p3RelativityMyDirStr: '',
      p3ApocDebuffCount: 0,
      p3ApocDebuffs: {
        short: [],
        medium: [],
        long: [],
        none: [],
      },
      p4DarklitTetherCount: 0,
      p4DarklitTethers: {},
      p4DarklitCleaves: [],
      p4DarklitStacks: [],
      p4CTDebuffs: {
        blue: [],
        red: [],
        ice: [],
        wind: [],
      },
      p4CTStoplights: {},
      p4CTTidalDirs: [],
    };
  },
  timelineTriggers: [],
  triggers: [
    // ************************
    // General triggers
    // ************************
    {
      id: 'FRU Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phases) },
      run: (data, matches) => data.phase = phases[matches.id] ?? 'unknown',
    },
    // ************************
    // P1-- Fatebreaker
    // ************************
    {
      id: 'FRU ActorSetPos Collector',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      condition: (data) => data.phase === 'p1',
      run: (data, matches) => {
        data.actorSetPosTracker[matches.id] = matches;
      },
    },
    {
      id: 'FRU P1 Cyclonic Break Fire',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD0', '9D89'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockPairs!(),
      outputStrings: {
        clockPairs: {
          en: 'Clock spots => Pairs',
          de: 'Himmelsrichtungen => Paare',
          ja: '八方向 => ペア',
          cn: '八方 => 两人分摊',
          tc: '八方 => 兩人分攤',
          ko: '8방향 => 쉐어',
        },
      },
    },
    {
      id: 'FRU P1 Cyclonic Break Lightning',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD4', '9D8A'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockSpread!(),
      outputStrings: {
        clockSpread: {
          en: 'Clock spots => Spread',
          de: 'Himmelsrichtungen => Verteilen',
          ja: '八方向 => 散開',
          cn: '八方 => 分散',
          tc: '八方 => 分散',
          ko: '8방향 => 산개',
        },
      },
    },
    {
      id: 'FRU P1 Powder Mark Trail',
      type: 'StartsUsing',
      netRegex: { id: '9CE8', source: 'Fatebreaker', capture: true },
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'FRU P1 Utopian Sky Collector',
      type: 'StartsUsing',
      netRegex: { id: ['9CDA', '9CDB'], capture: true },
      run: (data, matches) => {
        data.p1StackSpread = matches.id === '9CDA' ? 'stack' : 'spread';
      },
    },
    {
      id: 'FRU Conceal Safe',
      type: 'ActorControlExtra',
      netRegex: {
        category: '003F',
        param1: '4',
        capture: true,
      },
      condition: (data) => data.p1StackSpread !== undefined,
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const clone = data.actorSetPosTracker[matches.id];
        if (clone === undefined)
          return;
        const dir1 = Directions.hdgTo8DirNum(parseFloat(clone.heading));
        const dir2 = (dir1 + 4) % 8;
        data.p1ConcealSafeDirs = data.p1ConcealSafeDirs.filter((dir) =>
          dir !== Directions.outputFrom8DirNum(dir1) && dir !== Directions.outputFrom8DirNum(dir2)
        );

        if (data.p1ConcealSafeDirs.length !== 2)
          return;

        const [dir1Out, dir2Out] = data.p1ConcealSafeDirs;

        if (dir1Out === undefined || dir2Out === undefined)
          return;

        return output.combo!({
          dir1: output[dir1Out]!(),
          dir2: output[dir2Out]!(),
          mech: output[data.p1StackSpread ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        combo: {
          en: '${dir1} / ${dir2} => ${mech}',
          de: '${dir1} / ${dir2} => ${mech}',
          ja: '${dir1} / ${dir2} => ${mech}',
          cn: '${dir1} / ${dir2} => ${mech}',
          tc: '${dir1} / ${dir2} => ${mech}',
          ko: '${dir1} / ${dir2} => ${mech}',
        },
        stack: Outputs.stacks,
        spread: Outputs.spread,
      },
    },
    {
      id: 'FRU P1 Burnished Glory',
      type: 'StartsUsing',
      netRegex: { id: '9CEA', source: 'Fatebreaker', capture: false },
      response: Responses.bleedAoe(),
      run: (data) => data.p1SeenBurnishedGlory = true,
    },
    {
      id: 'FRU P1 Burnt Strike Fire',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC1', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave => Knockback',
          de: 'Linien AoE => Rückstoß',
          fr: 'AoE en ligne => Poussée',
          ja: '直線範囲 => ノックバック',
          cn: '直线 => 击退',
          tc: '直線 => 擊退',
          ko: '직선 장판 => 넉백',
        },
      },
    },
    {
      id: 'FRU P1 Burnt Strike Lightning',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC5', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave => Out',
          de: 'Linien AoE => Raus',
          fr: 'AoE en ligne => Extérieur',
          ja: '直線範囲 => 離れる',
          cn: '直线 => 去外侧',
          tc: '直線 => 去外側',
          ko: '직선 장판 => 바깥으로',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Fire',
      type: 'StartsUsing',
      netRegex: { id: '9CD6', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.lightningSafe!(),
      outputStrings: {
        lightningSafe: {
          en: 'Lightning Safe',
          de: 'Blitz Sicher',
          ja: '雷安置',
          cn: '雷安全',
          tc: '雷安全',
          ko: '번개 안전',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Lightning',
      type: 'StartsUsing',
      netRegex: { id: '9CD7', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.fireSafe!(),
      outputStrings: {
        fireSafe: {
          en: 'Fire Safe',
          de: 'Feuer Sicher',
          ja: '炎安置',
          cn: '火安全',
          tc: '火安全',
          ko: '불 안전',
        },
      },
    },
    {
      id: 'FRU P1 Fall of Faith Collector',
      type: 'Tether',
      netRegex: {
        id: ['00F9', '011F'], // 00F9 = fire; 011F = lightning
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: true,
      },
      // Only collect after Burnished Glory, since '00F9' tethers are used during TotH.
      condition: (data) => data.phase === 'p1' && data.p1SeenBurnishedGlory,
      durationSeconds: (data) => data.p1FallOfFaithTethers.length >= 3 ? 12.2 : 3,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          fire: {
            en: 'Fire',
            de: 'Feuer',
            ja: '炎',
            cn: '火',
            tc: '火',
            ko: '불',
          },
          lightning: {
            en: 'Lightning',
            de: 'Blitz',
            ja: '雷',
            cn: '雷',
            tc: '雷',
            ko: '번개',
          },
          one: {
            en: '1',
            de: '1',
            ja: '1',
            cn: '1',
            tc: '1',
            ko: '1',
          },
          two: {
            en: '2',
            de: '2',
            ja: '2',
            cn: '2',
            tc: '2',
            ko: '2',
          },
          three: {
            en: '3',
            de: '3',
            ja: '3',
            cn: '3',
            tc: '3',
            ko: '3',
          },
          onYou: {
            en: 'On YOU',
            de: 'Auf DIR',
            cn: '点名',
            tc: '點名',
            ko: '대상자',
          },
          tether: {
            en: '${num}: ${elem} (${target})',
            de: '${num}: ${elem} (${target})',
            ja: '${num}: ${elem} (${target})',
            cn: '${num}: ${elem} (${target})',
            tc: '${num}: ${elem} (${target})',
            ko: '${num}: ${elem} (${target})',
          },
          all: {
            en: '${e1} => ${e2} => ${e3} => ${e4}',
            de: '${e1} => ${e2} => ${e3} => ${e4}',
            ja: '${e1} => ${e2} => ${e3} => ${e4}',
            cn: '${e1} => ${e2} => ${e3} => ${e4}',
            tc: '${e1} => ${e2} => ${e3} => ${e4}',
            ko: '${e1} => ${e2} => ${e3} => ${e4}',
          },
        };

        const curTether = matches.id === '00F9' ? 'fire' : 'lightning';
        data.p1FallOfFaithTethers.push(curTether);

        if (data.p1FallOfFaithTethers.length < 4) {
          const num = data.p1FallOfFaithTethers.length === 1
            ? 'one'
            : (data.p1FallOfFaithTethers.length === 2 ? 'two' : 'three');
          if (data.me === matches.target)
            return {
              alertText: output.tether!({
                num: output[num]!(),
                elem: output[curTether]!(),
                target: output.onYou!(),
              }),
            };
          return {
            infoText: output.tether!({
              num: output[num]!(),
              elem: output[curTether]!(),
              target: data.party.member(matches.target),
            }),
          };
        }

        const [e1, e2, e3, e4] = data.p1FallOfFaithTethers;

        if (e1 === undefined || e2 === undefined || e3 === undefined || e4 === undefined)
          return;

        return {
          infoText: output.all!({
            e1: output[e1]!(),
            e2: output[e2]!(),
            e3: output[e3]!(),
            e4: output[e4]!(),
          }),
        };
      },
    },
    // ************************
    // P2 -- Usurper Of Frost
    // ************************
    {
      id: 'FRU P2 Quadruple Slap First',
      type: 'StartsUsing',
      netRegex: { id: '9CFF', source: 'Usurper of Frost' },
      response: Responses.tankBuster(),
      run: (data, matches) => data.p2QuadrupleFirstTarget = matches.target,
    },
    {
      // Cleansable debuff may be applied with first cast (9CFF)
      // although there are ways to avoid appplication (e.g. Warden's Paean)
      id: 'FRU P2 Quadruple Slap Debuff Gain',
      type: 'GainsEffect',
      netRegex: { effectId: '1042', source: 'Usurper of Frost', capture: false },
      run: (data) => data.p2QuadrupleDebuffApplied = true,
    },
    {
      id: 'FRU P2 Quadruple Slap Debuff Loss',
      type: 'LosesEffect',
      netRegex: { effectId: '1042', source: 'Usurper of Frost', capture: false },
      run: (data) => data.p2QuadrupleDebuffApplied = false,
    },
    {
      id: 'FRU P2 Quadruple Slap Second',
      type: 'StartsUsing',
      // short (2.2s) cast time
      netRegex: { id: '9D00', source: 'Usurper of Frost' },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          onYou: Outputs.tankBusterOnYou,
          onTarget: Outputs.tankBusterOnPlayer,
          busterCleanse: {
            en: '${buster} (Cleanse?)',
            de: '${buster} (Reinigen?)',
            cn: '${buster} (驱散?)',
            tc: '${buster} (驅散?)',
            ko: '${buster} (에스나?)',
          },
        };

        const onTarget = output.onTarget!({ player: data.party.member(matches.target) });
        let busterStr: string;

        if (data.me === matches.target)
          busterStr = output.onYou!();
        else if (
          data.p2QuadrupleFirstTarget === matches.target &&
          data.p2QuadrupleDebuffApplied &&
          data.CanCleanse()
        ) {
          busterStr = output.busterCleanse!({ buster: onTarget });
        } else
          busterStr = onTarget;

        if (data.me === matches.target || data.role === 'healer')
          return { alertText: busterStr };
        return { infoText: busterStr };
      },
    },
    // ***** Diamond Dust *****
    {
      id: 'FRU P2 Diamond Dust',
      type: 'StartsUsing',
      netRegex: { id: '9D05', source: 'Usurper of Frost', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'FRU P2 Axe/Scythe Kick Collect',
      type: 'StartsUsing',
      // 9D0A - Axe Kick (be out), 9D0B - Scythe Kick (be in)
      netRegex: { id: ['9D0A', '9D0B'], source: 'Oracle\'s Reflection' },
      // Only fire during Diamond Dust (same ids used during Mirror Mirror)
      condition: (data) => data.phase === 'p2-dd',
      run: (data, matches) => data.p2AxeScytheSafe = matches.id === '9D0A' ? 'out' : 'in',
    },
    {
      id: 'FRU P2 Icicle Impact Initial Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: '9D06' },
      condition: (data) => data.p2IcicleImpactStart.length < 2,
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dir = Directions.xyTo8DirOutput(x, y, centerX, centerY);
        data.p2IcicleImpactStart.push(dir);

        // Once we have both, reorder the array and make sure the two dirs are opposites
        if (data.p2IcicleImpactStart.length === 2) {
          data.p2IcicleImpactStart.sort((a, b) =>
            p2KnockbackDirs.indexOf(a) - p2KnockbackDirs.indexOf(b)
          );
          const [dir1 = 'unknown', dir2 = 'unknown'] = data.p2IcicleImpactStart;
          if (getRelativeClockPos(dir1, dir2) !== 'opposite') {
            console.error(`Unexpected Icicle Impact initial dirs: ${dir1}, ${dir2}`);
            data.p2IcicleImpactStart = ['unknown', 'unknown'];
          }
        }
      },
    },
    {
      id: 'FRU P2 House of Light/Frigid Stone',
      type: 'HeadMarker',
      netRegex: { id: '0159' }, // source name can vary due to actor re-use
      alertText: (data, matches, output) => {
        data.p2FrigidStoneTargets.push(matches.target);
        if (data.p2FrigidStoneTargets.length !== 4)
          return;

        const inOut = data.p2AxeScytheSafe ? output[data.p2AxeScytheSafe]!() : output.unknown!();
        const mech = data.p2FrigidStoneTargets.includes(data.me) ? 'dropPuddle' : 'baitCleave';
        const firstIcicle = data.p2IcicleImpactStart[0] ?? 'unknown';

        if (firstIcicle === 'unknown')
          return output.combo!({ inOut: inOut, dir: output.unknown!(), mech: output[mech]!() });

        // Assumes that if first Icicle Impacts spawn on cardinals, House of Light baits will also be
        // cardinals and Frigid Stone puddle drops will be intercards, and vice versa.
        const dir = mech === 'baitCleave'
          ? (isCardinalDir(firstIcicle) ? output.cardinals!() : output.intercards!())
          : (isCardinalDir(firstIcicle) ? output.intercards!() : output.cardinals!());

        return output.combo!({ inOut: inOut, dir: dir, mech: output[mech]!() });
      },
      outputStrings: {
        combo: {
          en: '${inOut} + ${dir} => ${mech}',
          de: '${inOut} + ${dir} => ${mech}',
          cn: '${inOut} + ${dir} => ${mech}',
          tc: '${inOut} + ${dir} => ${mech}',
          ko: '${inOut} + ${dir} => ${mech}',
        },
        dropPuddle: {
          en: 'Drop Puddle',
          de: 'Fläche ablegen',
          cn: '放置冰花',
          tc: '放置冰花',
          ko: '장판 놓기',
        },
        baitCleave: {
          en: 'Bait',
          de: 'Ködern',
          cn: '引导水波',
          tc: '引導水波',
          ko: '유도',
        },
        in: Outputs.in,
        out: Outputs.out,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'FRU P2 Heavenly Strike',
      type: 'Ability',
      // use the 'star' (Frigid Stone) drops to fire this alert, as Heavenly Strike has no cast time.
      netRegex: { id: '9D07', capture: false }, // source name can vary due to actor re-use
      durationSeconds: 3.5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const [dir1 = 'unknown', dir2 = 'unknown'] = data.p2IcicleImpactStart;
        return output.kbDir!({ kb: output.kb!(), dir1: output[dir1]!(), dir2: output[dir2]!() });
      },
      outputStrings: {
        kbDir: {
          en: '${kb} (${dir1}/${dir2})',
          de: '${kb} (${dir1}/${dir2})',
          cn: '${kb} (${dir1}/${dir2})',
          tc: '${kb} (${dir1}/${dir2})',
          ko: '${kb} (${dir1}/${dir2})',
        },
        kb: Outputs.knockback,
        ...Directions.outputStrings8Dir,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'FRU P2 Shiva Cleave Add Collect',
      type: 'StartsUsing',
      // The Shiva that will cast Twin Silence/Twin Stillness is the same actor
      // that casts Sinbound Holy (9D10).
      netRegex: { id: '9D10' },
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        data.p2KBShivaDir = Directions.xyTo8DirOutput(x, y, centerX, centerY);
      },
    },
    {
      id: 'FRU P2 Sinbound Holy Rotation',
      type: 'Ability',
      // We can determine the player's knockbac dir from Heavenly Strike (9D0F).
      // It occurs after Shiva is already casting Sinbound Holy.
      netRegex: { id: '9D0F' },
      condition: Conditions.targetIsYou(),
      delaySeconds: 1,
      durationSeconds: 5,
      infoText: (data, matches, output) => {
        const x = parseFloat(matches.targetX);
        const y = parseFloat(matches.targetY);
        const playerDir = Directions.xyTo8DirOutput(x, y, centerX, centerY);
        const addDir = data.p2KBShivaDir ?? 'unknown';
        if (playerDir === 'unknown' || addDir === 'unknown')
          return;

        const relPos = getRelativeClockPos(playerDir, addDir);
        if (data.triggerSetConfig.sinboundRotate === 'aacc')
          switch (relPos) {
            case 'same':
            case 'opposite':
              return output.aaccCursed!();
            case 'clockwise':
              return output.aaccRotateCCW!();
            case 'counterclockwise':
              return output.aaccRotateCW!();
            default:
              break;
          }
        return output[relPos]!();
      },
      outputStrings: {
        aaccCursed: {
          en: 'Cursed - Fast Clockwise',
          de: 'Verflucht - Schnell im Uhrzeigersinn',
          cn: '180° - 快速顺时针',
          tc: '180° - 快速順時針',
          ko: '180도 - 빠른 시계방향',
        },
        aaccRotateCCW: Outputs.counterclockwise,
        aaccRotateCW: Outputs.clockwise,
        same: {
          en: 'Cursed - Add on knockback',
          de: 'Verflucht - Add beim Rückstoß',
          cn: '180° - 分身在脚下',
          tc: '180° - 分身在腳下',
          ko: '180도 - 넉백된 곳에 분신',
        },
        opposite: {
          en: 'Cursed - Add opposite you',
          de: 'Verflucht - Add gegenüber von DIR',
          cn: '180° - 分身在对面',
          tc: '180° - 分身在對面',
          ko: '180도 - 반대편에 분신',
        },
        clockwise: {
          en: 'Add is clockwise',
          de: 'Add ist im Uhrzeigersinn',
          cn: '分身在顺时针',
          tc: '分身在順時針',
          ko: '분신 시계방향',
        },
        counterclockwise: {
          en: 'Add is counterclockwise',
          de: 'Add ist gegen den Uhrzeigersinn',
          cn: '分身在逆时针',
          tc: '分身在逆時針',
          ko: '분신 반시계방향',
        },
      },
    },
    {
      id: 'FRU P2 Shining Armor',
      type: 'GainsEffect',
      netRegex: { effectId: '8E1', capture: false },
      condition: (data) => data.phase === 'p2-dd',
      suppressSeconds: 1,
      countdownSeconds: 4.9,
      response: Responses.lookAway('alarm'),
    },
    {
      id: 'FRU P2 Twin Silence/Stillness First',
      type: 'StartsUsing',
      // 9D01 - Twin Stillness (back safe -> front safe)
      // 9D02 - Twin Silence (front safe -> back safe)
      netRegex: { id: ['9D01', '9D02'] },
      durationSeconds: 2.8,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          aaccSilence: {
            en: '(stay in front)',
            de: '(steh vorne)',
            cn: '(待在正面)',
            tc: '(待在正面)',
            ko: '(보스 앞 그대로)',
          },
          silence: Outputs.front,
          stillness: Outputs.back,
        };

        if (data.triggerSetConfig.sinboundRotate === 'aacc')
          return matches.id === '9D01'
            ? { alertText: output.stillness!() }
            : { infoText: output.aaccSilence!() };
        return matches.id === '9D01'
          ? { alertText: output.stillness!() }
          : { alertText: output.silence!() };
      },
    },
    {
      id: 'FRU P2 Twin Silence/Stillness Second',
      type: 'StartsUsing',
      // 9D01 - Twin Stillness (back safe -> front safe)
      // 9D02 - Twin Silence (front safe -> back safe)
      netRegex: { id: ['9D01', '9D02'] },
      delaySeconds: 2.9, // waiting until the Ability line fires is too late, so delay off the 0x14 line.
      alertText: (_data, matches, output) =>
        matches.id === '9D01' ? output.stillness!() : output.silence!(),
      outputStrings: {
        silence: Outputs.back,
        stillness: Outputs.front,
      },
    },
    // ***** Mirror Mirror *****
    {
      id: 'FRU P2 Mirror Mirror Initial Cleaves',
      type: 'StartsUsing',
      netRegex: { id: '9D0B', source: 'Usurper of Frost', capture: false },
      // Only fire during Mirror Mirror (same ids used during Diamond Dust)
      condition: (data) => data.phase === 'p2-mm',
      delaySeconds: 1,
      alertText: (_data, _matches, output) => output.baitCleave!(),
      outputStrings: {
        baitCleave: {
          en: 'Bait cleave',
          de: 'Cleve ködern',
          cn: '引导水波',
          tc: '引導水波',
          ko: '부채꼴 유도',
        },
      },
    },
    {
      id: 'FRU P2 Mirror Mirror Reflected Cleaves',
      type: 'StartsUsing',
      // 9D0D = Reflected Scythe Kick (from Frozen Mirrors)
      netRegex: { id: '9D0D', capture: false },
      delaySeconds: 5, // cast time is 9.7s
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.baitCleave!(),
      outputStrings: {
        baitCleave: {
          en: 'Bait cleave',
          de: 'Cleve ködern',
          cn: '引导水波',
          tc: '引導水波',
          ko: '부채꼴 유도',
        },
      },
    },
    {
      id: 'FRU P2 Mirror Mirror Banish III',
      type: 'StartsUsing',
      // 9D1C - Banish III (partners)
      // 9D1D - Banish III (spread)
      netRegex: { id: ['9D1C', '9D1D'] },
      // Only fire during Mirror Mirror (same ids used during Light Rampant)
      condition: (data) => data.phase === 'p2-mm',
      infoText: (_data, matches, output) =>
        matches.id === '9D1C' ? output.partners!() : output.spread!(),
      outputStrings: {
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
      },
    },
    // ***** Light Rampant *****
    {
      id: 'FRU P2 Lightsteeped Counter',
      type: 'GainsEffect',
      netRegex: { effectId: '8D1' },
      condition: Conditions.targetIsYou(),
      // can't just increment, since one puddle player gets 2 stacks on initial application
      run: (data, matches) => data.p2LightsteepedCount = parseInt(matches.count),
    },
    {
      id: 'FRU P2 Light Rampant Setup',
      type: 'HeadMarker',
      netRegex: { id: '0177' },
      alertText: (data, matches, output) => {
        data.p2LightRampantPuddles.push(matches.target);
        if (data.p2LightRampantPuddles.length < 2)
          return;

        const p1 = data.party.member(data.p2LightRampantPuddles[0]);
        const p2 = data.party.member(data.p2LightRampantPuddles[1]);
        if (data.me === matches.target)
          return output.puddle!({ other: p1 });
        else if (data.p2LightRampantPuddles[0] === data.me)
          return output.puddle!({ other: p2 });
        return output.tether!({ p1: p1, p2: p2 });
      },
      outputStrings: {
        puddle: {
          en: 'Puddles on you (w/ ${other})',
          de: 'Flächen auf DIR (mit ${other})',
          cn: '放置大圈 (和 ${other})',
          tc: '放置大圈 (和 ${other})',
          ko: '장판 대상자 (+ ${other})',
        },
        tether: {
          en: 'Tether on you (Puddles: ${p1}, ${p2})',
          de: 'Verbindung auf DIR (Flächen: ${p1}, ${p2})',
          cn: '拉线踩塔 (大圈: ${p1}, ${p2})',
          tc: '拉線踩塔 (大圈: ${p1}, ${p2})',
          ko: '사슬 대상자 (장판: ${p1}, ${p2})',
        },
      },
    },
    {
      id: 'FRU P2 Light Rampant Tower',
      type: 'Ability',
      // fire when the first set of Holy Light orbs explode
      netRegex: { id: '9D1B', source: 'Holy Light', capture: false },
      condition: (data) => !data.p2SeenFirstHolyLight,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          towerSoak: {
            en: 'Soak middle tower',
            de: 'Mittleren Turm nehmen',
            cn: '踩塔',
            tc: '踩塔',
            ko: '중앙 탑 밟기',
          },
          towerAvoid: {
            en: 'Avoid middle tower',
            de: 'Vermeide mittleren Turm',
            cn: '不去踩塔',
            tc: '不去踩塔',
            ko: '중앙 탑 피하기',
          },
        };

        return data.p2LightsteepedCount === 2
          ? { alertText: output.towerSoak!() }
          : { infoText: output.towerAvoid!() };
      },
      run: (data) => data.p2SeenFirstHolyLight = true,
    },
    {
      id: 'FRU P2 Light Rampant Banish III',
      type: 'StartsUsing',
      // 9D1C - Banish III (partners)
      // 9D1D - Banish III (spread)
      netRegex: { id: ['9D1C', '9D1D'], source: 'Usurper of Frost' },
      // Only fire during Light Rampant (same ids used during Mirror Mirror)
      condition: (data) => data.phase === 'p2-lr',
      delaySeconds: 0.5, // avoid excessive collision with tower callout
      alertText: (data, matches, output) => {
        const partnerSpread = matches.id === '9D1C' ? output.partners!() : output.spread!();
        if (data.p2LightsteepedCount === 2)
          return output.afterTower!({ partnerSpread: partnerSpread });
        return partnerSpread;
      },
      outputStrings: {
        afterTower: {
          en: '${partnerSpread} (after tower)',
          de: '${partnerSpread} (nach Turm)',
          cn: '踩塔后 + ${partnerSpread}',
          tc: '踩塔後 + ${partnerSpread}',
          ko: '${partnerSpread} (탑 이후)',
        },
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
      },
    },
    {
      id: 'FRU P2 The House of Light',
      type: 'StartsUsing',
      netRegex: { id: '9CFD', source: 'Usurper of Frost', capture: false },
      response: Responses.protean(),
    },
    {
      id: 'FRU P2 Absolute Zero',
      type: 'StartsUsing',
      netRegex: { id: '9D20', source: 'Usurper of Frost', capture: false },
      delaySeconds: 4,
      response: Responses.bigAoe(),
    },
    // ************************
    // Intermission / Crystals
    // ************************
    {
      id: 'FRU Intermission Target Veil',
      type: 'LosesEffect',
      // 307 - Invincibility
      netRegex: { effectId: '307', target: 'Ice Veil', capture: false },
      infoText: (_data, _matches, output) => output.targetVeil!(),
      outputStrings: {
        targetVeil: {
          en: 'Target Ice Veil',
          de: 'Ziele auf Immerfrost-Kristall',
          cn: '集火永久冰晶',
          tc: '集火永久冰晶',
          ko: '영구빙정 공격',
        },
      },
    },
    {
      id: 'FRU Intermission Junction',
      type: 'WasDefeated',
      netRegex: { target: 'Ice Veil', capture: false },
      delaySeconds: 5,
      response: Responses.bigAoe(),
    },
    // ************************
    // P3 -- Oracle Of Darkness
    // ************************
    // ***** Ultimate Relativity *****
    {
      id: 'FRU P3 Ultimate Relativity AoE',
      type: 'StartsUsing',
      netRegex: { id: '9D4A', source: 'Oracle of Darkness', capture: false },
      delaySeconds: 4, // cast time is 9.7s
      response: Responses.bigAoe(),
    },
    {
      id: 'FRU P3 Ultimate Relativity Debuff Collect',
      type: 'GainsEffect',
      // 997 = Spell-in-Waiting: Dark Fire III (11s, 21s, or 31s)
      // 99E = Spell-in-Waiting: Dark Blizzard III (21s)
      netRegex: { effectId: ['997', '99E'] },
      condition: (data) => data.phase === 'p3-ur',
      run: (data, matches) => {
        data.p3RelativityRoleCount++;

        const dur = parseFloat(matches.duration);
        let debuff: RelativityDebuff;
        if (matches.effectId === '99E')
          debuff = 'ice';
        else if (dur < 12)
          debuff = 'shortFire';
        else if (dur < 22)
          debuff = 'mediumFire';
        else
          debuff = 'longFire';

        const rawRole = data.party.nameToRole_[matches.target];
        let role: 'dps' | 'support';
        if (rawRole === 'tank' || rawRole === 'healer')
          role = 'support';
        else if (rawRole === 'dps')
          role = 'dps';
        else
          return;

        if (debuff === 'ice') {
          data.p3RelativityRoleMap[role].hasIce = true;
          data.p3RelativityRoleMap.ice = matches.target;
        } else if (role === 'dps' && debuff === 'shortFire')
          data.p3RelativityRoleMap.dps.shortFire.push(matches.target);
        else if (role === 'support' && debuff === 'longFire')
          data.p3RelativityRoleMap.support.longFire.push(matches.target);
        else
          data.p3RelativityRoleMap[role][debuff] = matches.target;

        if (data.me === matches.target)
          data.p3RelativityDebuff = debuff;
      },
    },
    {
      id: 'FRU P3 Ultimate Relativity Initial Debuff',
      type: 'GainsEffect',
      netRegex: { effectId: ['997', '99E'], capture: false },
      condition: (data) => data.phase === 'p3-ur' && data.p3RelativityRoleCount === 8,
      durationSeconds: 8,
      infoText: (data, _matches, output) => {
        const role = data.role === 'dps' ? 'dps' : 'support';
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (debuff === 'ice')
          return output.debuffSolo!({ debuff: output.ice!() });
        else if (debuff === 'mediumFire')
          return output.debuffSolo!({ debuff: output.mediumFire!() });
        else if (debuff === 'longFire') {
          if (role === 'dps')
            return output.debuffSolo!({ debuff: output.longFire!() });
          const other = data.p3RelativityRoleMap.support.longFire.find((e) => e !== data.me);
          return output.debuffShared!({
            debuff: output.longFire!(),
            other: data.party.member(other),
          });
        }
        if (role === 'support')
          return output.debuffSolo!({ debuff: output.shortFire!() });
        const other = data.p3RelativityRoleMap.dps.shortFire.find((e) => e !== data.me);
        return output.debuffShared!({
          debuff: output.shortFire!(),
          other: data.party.member(other),
        });
      },
      outputStrings: {
        debuffSolo: {
          en: '${debuff}',
          de: '${debuff}',
          cn: '${debuff}',
          tc: '${debuff}',
          ko: '${debuff}',
        },
        debuffShared: {
          en: '${debuff} (w/ ${other})',
          de: '${debuff} (mit ${other})',
          cn: '${debuff} (和 ${other})',
          tc: '${debuff} (和 ${other})',
          ko: '${debuff} (+ ${other})',
        },
        shortFire: {
          en: 'Short Fire',
          de: 'Kurzes Feuer',
          cn: '短火',
          tc: '短火',
          ko: '짧은 불',
        },
        mediumFire: {
          en: 'Medium Fire',
          de: 'Mittleres Feuer',
          cn: '中火',
          tc: '中火',
          ko: '중간 불',
        },
        longFire: {
          en: 'Long Fire',
          de: 'Langes Feuer',
          cn: '长火',
          tc: '長火',
          ko: '긴 불',
        },
        ice: {
          en: 'Ice',
          de: 'Eis',
          cn: '冰点名',
          tc: '冰點名',
          ko: '얼음',
        },
      },
    },
    {
      id: 'FRU P3 Ultimate Relativity Stoplight Collect',
      type: 'AddedCombatant',
      netRegex: { npcBaseId: '17832' },
      condition: (data) => data.phase === 'p3-ur',
      run: (data, matches) => data.p3RelativityStoplights[matches.id] = matches,
    },
    {
      id: 'FRU P3 Ultimate Relativity Y North Spot',
      type: 'Tether',
      // boss tethers to 5 stoplights - 0085 are purple tethers, 0086 are yellow
      netRegex: { id: '0086' },
      condition: (data) => data.phase === 'p3-ur',
      run: (data, matches, output) => {
        const id = matches.sourceId;
        const stoplight = data.p3RelativityStoplights[id];
        if (stoplight === undefined)
          return;

        const x = parseFloat(stoplight.x);
        const y = parseFloat(stoplight.y);
        data.p3RelativityYellowDirNums.push(Directions.xyTo8DirNum(x, y, centerX, centerY));

        if (data.p3RelativityYellowDirNums.length !== 3)
          return;

        const northDirNum = findURNorthDirNum(data.p3RelativityYellowDirNums);
        if (northDirNum === -1 || data.p3RelativityDebuff === undefined) {
          data.p3RelativityMyDirStr = output.unknown!();
          return;
        }

        const role = data.role === 'dps' ? 'dps' : 'support';
        const debuff = data.p3RelativityDebuff;

        if (role === 'dps') {
          if (debuff === 'longFire' || debuff === 'ice') {
            const myDirNum = (northDirNum + 4) % 8; // relative South
            data.p3RelativityMyDirStr = output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
          } else if (debuff === 'mediumFire') {
            const myDirNum = (northDirNum + 2) % 8; // relative East
            data.p3RelativityMyDirStr = output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
          } else if (debuff === 'shortFire') {
            const dirs = [ // relative SE/SW
              Directions.output8Dir[(northDirNum + 3) % 8] ?? 'unknown',
              Directions.output8Dir[(northDirNum + 5) % 8] ?? 'unknown',
            ];
            data.p3RelativityMyDirStr = dirs.map((dir) => output[dir]!()).join(output.or!());
          }
        } else { // supports
          if (debuff === 'shortFire' || debuff === 'ice') {
            const myDirNum = northDirNum; // relative North
            data.p3RelativityMyDirStr = output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
          } else if (debuff === 'mediumFire') {
            const myDirNum = (northDirNum + 6) % 8; // relative West
            data.p3RelativityMyDirStr = output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
          } else if (debuff === 'longFire') {
            const dirs = [ // relative NE/NW
              Directions.output8Dir[(northDirNum + 1) % 8] ?? 'unknown',
              Directions.output8Dir[(northDirNum + 7) % 8] ?? 'unknown',
            ];
            data.p3RelativityMyDirStr = dirs.map((dir) => output[dir]!()).join(output.or!());
          }
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        or: Outputs.or,
        unknown: Outputs.unknown,
      },
    },
    // There are six steps to the mechanic. A player's action at each step is determined by their
    // debuff combo (which is deterministic based on the initial fire/ice debuff).
    // Since every player receives a 9A0 debuff ('Spell-in-Waiting: Return) of varying lengths,
    // fire each of these triggers based on a delay from when 9A0 is applied at the start of UR.
    {
      id: 'FRU P3 Ultimate Rel 1st Fire/Stack',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' }, // Spell-in-Waiting: Return
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 4,
      durationSeconds: 7,
      alertText: (data, _matches, output) => {
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast')
          return output[debuff]!();

        const dirStr = data.p3RelativityMyDirStr;
        if (debuff !== 'shortFire')
          return output.yNorthStrat!({ debuff: output[debuff]!(), dir: output.middle!() });
        return output.yNorthStrat!({ debuff: output.shortFire!(), dir: dirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        shortFire: p3UROutputStrings.fireSpread,
        mediumFire: p3UROutputStrings.stack,
        longFire: p3UROutputStrings.stack,
        ice: p3UROutputStrings.stack,
        middle: p3UROutputStrings.middle,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel 1st Bait/Rewind',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' },
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 11,
      alertText: (data, _matches, output) => {
        const role = data.role === 'dps' ? 'dps' : 'support';
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast') {
          if (debuff === 'ice')
            return role === 'dps' ? output.iceDps!() : output.iceSupport!();
          return output[debuff]!();
        }

        const dirStr = data.p3RelativityMyDirStr;

        if (debuff === 'longFire')
          return output.yNorthStrat!({ debuff: output.longFire!(), dir: dirStr });
        else if (debuff === 'ice') {
          // dps ice bait stoplights; support ice drops rewind (eruption - out)
          const comboDirStr = role === 'dps'
            ? dirStr
            : output.dirCombo!({ inOut: output.out!(), dir: dirStr });
          return role === 'dps'
            ? output.yNorthStrat!({ debuff: output.iceDps!(), dir: comboDirStr })
            : output.yNorthStrat!({ debuff: output.iceSupport!(), dir: comboDirStr });
        } else if (debuff === 'mediumFire') {
          // dps mediumFire drops rewind (dark water - stack mid); support mediumFire drops rewind (eruption - out)
          const comboDirStr = role === 'dps'
            ? output.dirCombo!({ inOut: output.middle!(), dir: dirStr })
            : output.dirCombo!({ inOut: output.out!(), dir: dirStr });
          return output.yNorthStrat!({ debuff: output.mediumFire!(), dir: comboDirStr });
        }
        // shortFires all drop rewinds (eruption - out)
        const comboDirStr = output.dirCombo!({ inOut: output.out!(), dir: dirStr });
        return output.yNorthStrat!({ debuff: output.shortFire!(), dir: comboDirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        dirCombo: p3UROutputStrings.dirCombo,
        shortFire: p3UROutputStrings.dropRewind,
        mediumFire: p3UROutputStrings.dropRewind,
        longFire: p3UROutputStrings.baitStoplight,
        iceDps: p3UROutputStrings.baitStoplight,
        iceSupport: p3UROutputStrings.dropRewind,
        middle: p3UROutputStrings.middle,
        out: p3UROutputStrings.out,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel 2nd Fire/Stack + Ice',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' },
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 16,
      alertText: (data, _matches, output) => {
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast')
          return output[debuff]!();

        const dirStr = data.p3RelativityMyDirStr;
        if (debuff !== 'mediumFire')
          return output.yNorthStrat!({ debuff: output[debuff]!(), dir: output.middle!() });
        return output.yNorthStrat!({ debuff: output.mediumFire!(), dir: dirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        shortFire: p3UROutputStrings.stack,
        mediumFire: p3UROutputStrings.fireSpread,
        longFire: p3UROutputStrings.stack,
        ice: p3UROutputStrings.stack,
        middle: p3UROutputStrings.middle,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel 2nd Bait/Rewind',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' },
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 21,
      alertText: (data, _matches, output) => {
        const role = data.role === 'dps' ? 'dps' : 'support';
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast') {
          if (debuff === 'ice')
            return role === 'dps' ? output.iceDps!() : output.iceSupport!();
          return output[debuff]!();
        }

        const dirStr = data.p3RelativityMyDirStr;

        if (debuff === 'shortFire')
          return output.yNorthStrat!({ debuff: output.shortFire!(), dir: dirStr });
        else if (debuff === 'ice') {
          // dps ice baits drops rewind (gaze - in); support ice baits stoplight
          const comboDirStr = role === 'support'
            ? dirStr
            : output.dirCombo!({ inOut: output.middle!(), dir: data.p3RelativityMyDirStr });
          return role === 'dps'
            ? output.yNorthStrat!({ debuff: output.iceDps!(), dir: comboDirStr })
            : output.yNorthStrat!({ debuff: output.iceSupport!(), dir: comboDirStr });
        } else if (debuff === 'mediumFire') {
          // mediumFires have nothing to do, but they'll be stacking mid next
          return output.yNorthStrat!({ debuff: output.mediumFire!(), dir: output.middle!() });
        }
        // longFires all drop rewinds (gaze - in)
        const comboDirStr = output.dirCombo!({ inOut: output.middle!(), dir: dirStr });
        return output.yNorthStrat!({ debuff: output.longFire!(), dir: comboDirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        dirCombo: p3UROutputStrings.dirCombo,
        shortFire: p3UROutputStrings.baitStoplight,
        mediumFire: p3UROutputStrings.avoidStoplights,
        longFire: p3UROutputStrings.dropRewind,
        iceDps: p3UROutputStrings.dropRewind,
        iceSupport: p3UROutputStrings.baitStoplight,
        middle: p3UROutputStrings.middle,
        out: p3UROutputStrings.out,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel 3rd Fire/Stack',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' },
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 26,
      alertText: (data, _matches, output) => {
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast')
          return output[debuff]!();

        const dirStr = data.p3RelativityMyDirStr;
        if (debuff !== 'longFire')
          return output.yNorthStrat!({ debuff: output[debuff]!(), dir: output.middle!() });
        return output.yNorthStrat!({ debuff: output.longFire!(), dir: dirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        shortFire: p3UROutputStrings.stack,
        mediumFire: p3UROutputStrings.stack,
        longFire: p3UROutputStrings.fireSpread,
        ice: p3UROutputStrings.stack,
        middle: p3UROutputStrings.middle,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel 3nd Bait',
      type: 'GainsEffect',
      netRegex: { effectId: '9A0' },
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: 31,
      alertText: (data, _matches, output) => {
        const debuff = data.p3RelativityDebuff;
        if (debuff === undefined)
          return;

        if (data.triggerSetConfig.ultimateRel !== 'yNorthDPSEast')
          return output[debuff]!();

        const dirStr = data.p3RelativityMyDirStr;

        if (debuff !== 'mediumFire')
          return output.yNorthStrat!({ debuff: output[debuff]!(), dir: output.middle!() });
        return output.yNorthStrat!({ debuff: output.mediumFire!(), dir: dirStr });
      },
      outputStrings: {
        yNorthStrat: p3UROutputStrings.yNorthStrat,
        shortFire: p3UROutputStrings.avoidStoplights,
        mediumFire: p3UROutputStrings.baitStoplight,
        longFire: p3UROutputStrings.avoidStoplights,
        ice: p3UROutputStrings.avoidStoplights,
        middle: p3UROutputStrings.middle,
        out: p3UROutputStrings.out,
      },
    },
    {
      id: 'FRU P3 Ultimate Rel Rewind',
      type: 'GainsEffect',
      netRegex: { effectId: '994' }, // 994 - Return
      condition: (data, matches) => data.phase === 'p3-ur' && data.me === matches.target,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 4,
      countdownSeconds: 4,
      response: Responses.lookAway('alarm'),
    },
    {
      id: 'FRU P3 Shockwave Pulsar',
      type: 'StartsUsing',
      netRegex: { id: '9D5A', source: 'Oracle of Darkness', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'FRU P3 Black Halo',
      type: 'StartsUsing',
      netRegex: { id: '9D62', source: 'Oracle of Darkness' },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          onYou: {
            en: 'Shared tank cleave on YOU',
            de: 'Geteilter Tank-Cleave auf DIR',
            cn: '坦克分摊点名',
            tc: '坦克分攤點名',
            ko: '쉐어 탱버 대상자',
          },
          share: {
            en: 'Shared tank cleave on ${target}',
            de: 'Geteilter Tank-Cleave auf ${target}',
            cn: '坦克分摊 (和 ${target})',
            tc: '坦克分攤 (和 ${target})',
            ko: '쉐어 탱버 (${target})',
          },
          avoid: {
            en: 'Avoid tank cleave',
            de: 'Tank-Cleave vermeiden',
            cn: '远离分摊顺劈',
            tc: '遠離分攤順劈',
            ko: '탱버 피하기',
          },
        };
        if (data.me === matches.target)
          return { alertText: output.onYou!() };
        else if (data.role === 'tank')
          return { alertText: output.share!({ target: data.party.member(matches.target) }) };
        return { infoText: output.avoid!() };
      },
    },
    // ***** Apocalypse *****
    // Get the player's cardinal dir relative to the boss when the Dark Water debuffs are applied
    // If the player takes the dark water stack on a different cardinal dir, they swapped groups
    // and will need to stay swapped throughout the mechanic.
    {
      id: 'FRU P3 Apoc Dark Water Side Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '99D', capture: false }, // Spell-in-Waiting: Dark Water III
      condition: (data) => data.phase === 'p3-apoc',
      suppressSeconds: 1,
      promise: async (data) => {
        const combatantData = await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        });
        const me = combatantData.combatants[0];
        if (!me)
          return;

        data.p3ApocInitialSide = me.PosX > centerX ? 'east' : 'west';
      },
    },
    {
      id: 'FRU P3 Apoc Dark Water Swap Check',
      type: 'Ability',
      netRegex: { id: '9D4F' },
      condition: (data, matches) => data.phase === 'p3-apoc' && data.me === matches.target,
      run: (data, matches) => {
        // this is set for the first dark water stack; don't overwrite it
        if (data.p3ApocGroupSwap !== undefined)
          return;

        const x = parseFloat(matches.targetX);
        const stackSide = x > centerX ? 'east' : 'west';
        // if p3ApocInitialSide isn't set for whatever reason, assume no swap (for safety)
        data.p3ApocGroupSwap = (data.p3ApocInitialSide ?? stackSide) !== stackSide;
      },
    },
    {
      id: 'FRU P3 Apoc Dark Water Debuff',
      type: 'GainsEffect',
      netRegex: { effectId: '99D' }, // Spell-in-Waiting: Dark Water III
      condition: (data) => data.phase === 'p3-apoc',
      durationSeconds: 6,
      infoText: (data, matches, output) => {
        data.p3ApocDebuffCount++;
        const dur = parseFloat(matches.duration);
        const debuffLength = dur < 11 ? 'short' : (dur < 30 ? 'medium' : 'long');
        data.p3ApocDebuffs[debuffLength].push(matches.target);
        if (data.me === matches.target)
          data.p3ApocMyDebuff = debuffLength;

        if (data.p3ApocDebuffCount < 6)
          return;

        data.p3ApocMyDebuff ??= 'none';

        // Add the two players who didn't get a debuff
        const noDebuffs = data.party.partyNames.filter((name) =>
          !data.p3ApocDebuffs.short.includes(name) &&
          !data.p3ApocDebuffs.medium.includes(name) &&
          !data.p3ApocDebuffs.long.includes(name)
        );

        data.p3ApocDebuffs.none = [...noDebuffs];
        const [same] = data.p3ApocDebuffs[data.p3ApocMyDebuff].filter((p) => p !== data.me);
        const player = data.party.member(same);
        return output.combo!({ debuff: output[data.p3ApocMyDebuff]!(), same: player });
      },
      outputStrings: {
        combo: {
          en: 'Stack: ${debuff} (w/ ${same})',
          de: 'Sammeln: ${debuff} (mit ${same})',
          cn: '${debuff} 分摊 (和 ${same})',
          tc: '${debuff} 分攤 (和 ${same})',
          ko: '쉐어: ${debuff} (+ ${same})',
        },
        short: {
          en: 'Short',
          de: 'Kurz',
          cn: '短',
          tc: '短',
          ko: '짧은',
        },
        medium: {
          en: 'Medium',
          de: 'Mittel',
          cn: '中',
          tc: '中',
          ko: '중간',
        },
        long: {
          en: 'Long',
          de: 'Lang',
          cn: '长',
          tc: '長',
          ko: '긴',
        },
        none: {
          en: 'No Debuff',
          de: 'Kein Debuff',
          cn: '无点名',
          tc: '無點名',
          ko: '디버프 없음',
        },
        unknown: Outputs.unknown,
      },
    },
    // There are 8 combatants (one at each cardinal+intercard) that spawn with a heading indicative
    // of the mechanic rotation (i.e., all will be facing clockwise or counterclockwise).
    // There are two combatants that spawn at center with headings indicative of where the first
    // two outer combatants will explode.  These are always directly opposite, so we only need one.
    {
      id: 'FRU P3 Apoc Collect',
      type: 'CombatantMemory',
      netRegex: { change: 'Add', pair: [{ key: 'BNpcID', value: '1EB0FF' }] },
      condition: (data) => data.phase === 'p3-apoc',
      run: (data, matches) => {
        const x = parseFloat(matches.pairPosX ?? '0');
        const y = parseFloat(matches.pairPosY ?? '0');
        const isCenterActor = Math.round(x) === 100 && Math.round(y) === 100;
        const hdg = parseFloat(matches.pairHeading ?? '0');

        if (data.p3ApocFirstDirNum === undefined && isCenterActor)
          data.p3ApocFirstDirNum = Directions.hdgTo8DirNum(hdg);
        else if (data.p3ApocRotationDir === undefined && !isCenterActor) {
          const pos = Directions.xyTo8DirOutput(x, y, centerX, centerY);
          const facing = Directions.outputFrom8DirNum(Directions.hdgTo8DirNum(hdg));
          const relative = getRelativeClockPos(pos, facing);
          data.p3ApocRotationDir = relative === 'clockwise'
            ? 1
            : (relative === 'counterclockwise' ? -1 : undefined);
        }
      },
    },
    {
      // Silent early infoText with safe dirs
      id: 'FRU P3 Apoc Safe Early',
      type: 'CombatantMemory',
      netRegex: { change: 'Add', pair: [{ key: 'BNpcID', value: '1EB0FF' }], capture: false },
      condition: (data) => data.phase === 'p3-apoc',
      delaySeconds: 0.9, // collect + short delay to avoid collision with Dark Water Debuff
      durationSeconds: 8.2,
      suppressSeconds: 1,
      soundVolume: 0,
      infoText: (data, _matches, output) => {
        const startNum = data.p3ApocFirstDirNum;
        const rotationDir = data.p3ApocRotationDir;
        if (startNum === undefined || rotationDir === undefined)
          return;

        // Safe spot(s) are 1 behind the starting dir and it's opposite (+4)
        const safe = [
          (startNum - rotationDir + 8) % 8,
          (startNum + 4 - rotationDir + 8) % 8,
        ];
        safe.sort((a, b) => a - b);

        const safeStr = safe
          .map((dir) => output[Directions.output8Dir[dir] ?? 'unknown']!())
          .join(output.or!());
        return output.safe!({ dir1: safeStr });
      },
      tts: null,
      outputStrings: {
        safe: {
          en: '(Apoc safe later: ${dir1})',
          de: '(Apoc später sicher: ${dir1})',
          cn: '${dir1} 稍后安全',
          tc: '${dir1} 稍後安全',
          ko: '(대재앙 안전지대: ${dir1})',
        },
        ...Directions.outputStrings8Dir,
        or: Outputs.or,
      },
    },
    {
      // Displays during Spirit Taker
      id: 'FRU P3 Apoc Safe',
      type: 'CombatantMemory',
      netRegex: { change: 'Add', pair: [{ key: 'BNpcID', value: '1EB0FF' }], capture: false },
      condition: (data) => data.phase === 'p3-apoc',
      delaySeconds: 9.2,
      durationSeconds: 11,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const startNum = data.p3ApocFirstDirNum;
        const rotationDir = data.p3ApocRotationDir;
        if (startNum === undefined || rotationDir === undefined)
          return;

        // Safe spot(s) are 1 behind the starting dir and it's opposite (+4)
        // Melees lean one additional dir away from the rotation direction
        const safe = [
          (startNum - rotationDir + 8) % 8,
          (startNum + 4 - rotationDir + 8) % 8,
        ];

        const toward = [
          (safe[0]! - rotationDir + 8) % 8,
          (safe[1]! - rotationDir + 8) % 8,
        ];

        // We shouldn't just sort safe[], and toward[], since the elements are paired
        // and sorting might impact order of just one and not both.
        if (safe[0]! > safe[1]!) {
          safe.reverse();
          toward.reverse();
        }

        let safeStr = output['unknown']!();
        let towardStr = output['unknown']!();

        if (data.triggerSetConfig.apoc === 'dpsNE-CW') {
          const dpsDirs = [1, 2, 3, 4];
          const suppDirs = [5, 6, 7, 0];
          const myDirs = data.role === 'dps' ? dpsDirs : suppDirs;

          // use the index from safe, so we can make sure we're giving the correct 'toward'.
          const idx = safe.findIndex((idx) => myDirs.includes(idx));
          if (idx === -1)
            return output.safe!({ dir1: safeStr, dir2: towardStr });

          const safeDir = safe[idx];
          const towardDir = toward[idx];
          if (safeDir === undefined || towardDir === undefined)
            return output.safe!({ dir1: safeStr, dir2: towardStr });

          safeStr = output[Directions.output8Dir[safeDir] ?? 'unknown']!();
          towardStr = output[Directions.output8Dir[towardDir] ?? 'unknown']!();
          return output.safe!({ dir1: safeStr, dir2: towardStr });
        }

        safeStr = safe
          .map((dir) => output[Directions.output8Dir[dir] ?? 'unknown']!())
          .join(output.or!());
        towardStr = toward
          .map((dir) => output[Directions.output8Dir[dir] ?? 'unknown']!())
          .join(output.or!());
        return output.safe!({ dir1: safeStr, dir2: towardStr });
      },
      outputStrings: {
        safe: {
          en: 'Safe: ${dir1} (lean ${dir2})',
          de: 'Sicher: ${dir1} (halte dich ${dir2})',
          cn: '${dir1} 偏 ${dir2} 安全',
          tc: '${dir1} 偏 ${dir2} 安全',
          ko: '안전: ${dir1} (${dir2} 쪽으로 한칸)',
        },
        ...Directions.outputStrings8Dir,
        or: Outputs.or,
      },
    },
    {
      id: 'FRU P3 Apoc First Stacks',
      type: 'GainsEffect',
      netRegex: { effectId: '99D', capture: false }, // Spell-in-Waiting: Dark Water III
      // first debuff has 10.0s duration
      condition: (data) => data.phase === 'p3-apoc',
      delaySeconds: 6,
      durationSeconds: 3.5,
      suppressSeconds: 1,
      response: Responses.stackThenSpread(),
    },
    {
      // Fire this just before the first Dark Water debuffs expire (10.0s).
      // A tiny bit early (0.2s) won't cause people to leave the stack, but the reaction
      // time on Spirit Taker is very short so the little extra helps.
      id: 'FRU P3 Apoc Spirit Taker',
      type: 'GainsEffect',
      netRegex: { effectId: '99D', capture: false },
      condition: (data) => data.phase === 'p3-apoc',
      delaySeconds: 9.8, // first Dark Water Debuffs expire at 10.0s
      durationSeconds: 2,
      suppressSeconds: 1,
      response: Responses.spread('alert'),
    },
    {
      id: 'FRU P3 Apoc Second Stacks',
      type: 'Ability',
      netRegex: { id: '9D52', source: 'Oracle of Darkness', capture: false }, // Dark Eruption (spread aoes)
      condition: (data) => data.phase === 'p3-apoc',
      delaySeconds: 1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          stacks: Outputs.stacks,
          stacksSwap: {
            en: '${stacks} (Swapped)',
            de: '${stacks} (Getauscht)',
            cn: '${stacks} (换位后)',
            tc: '${stacks} (換位後)',
            ko: '${stacks} (교대)',
          },
        };
        const stacksStr = output.stacks!();
        return data.p3ApocGroupSwap
          ? { alertText: output.stacksSwap!({ stacks: stacksStr }) }
          : { infoText: stacksStr };
      },
    },
    {
      id: 'FRU P3 Apoc Darkest Dance Jump Bait',
      type: 'StartsUsing',
      netRegex: { id: '9CF5', source: 'Oracle of Darkness', capture: false },
      condition: (data) => data.phase === 'p3-apoc' && data.role === 'tank',
      delaySeconds: 3, // delay until the Dark Water stack debuff is just about to expire
      durationSeconds: 2,
      infoText: (data, _matches, output) => {
        const startNum = data.p3ApocFirstDirNum;
        const rotationDir = data.p3ApocRotationDir;
        if (startNum === undefined || rotationDir === undefined)
          return;

        // Safe spot(s) are 2 behind the starting dir and it's opposite (+4)
        const baitDirs = [
          (startNum - (rotationDir * 2) + 8) % 8,
          (startNum + 4 - (rotationDir * 2) + 8) % 8,
        ];
        baitDirs.sort((a, b) => a - b);

        const baitStr = baitDirs
          .map((dir) => output[Directions.output8Dir[dir] ?? 'unknown']!())
          .join(output.or!());
        return output.bait!({ dirs: baitStr });
      },
      outputStrings: {
        bait: {
          en: 'Bait Jump (${dirs})?',
          de: 'Sprung ködern (${dirs})?',
          cn: '${dirs} 引导超级跳',
          tc: '${dirs} 引導超級跳',
          ko: '${dirs} 점프 유도?',
        },
        ...Directions.outputStrings8Dir,
        or: Outputs.or,
      },
    },
    {
      id: 'FRU P3 Darkest Dance KB + Third Stacks',
      type: 'Ability',
      netRegex: { id: '9CF5', source: 'Oracle of Darkness', capture: false }, // Darkest Dance (self-targeted)
      durationSeconds: 7,
      alertText: (data, _matches, output) => {
        const kbStacks = output.kbStacks!();
        return data.p3ApocGroupSwap ? output.kbStacksSwap!({ kbStacks: kbStacks }) : kbStacks;
      },
      outputStrings: {
        kbStacks: {
          en: 'Knockback => Stacks',
          de: 'Rückstoß => Sammeln',
          cn: '击退 => 四四分摊',
          tc: '擊退 => 四四分攤',
          ko: '넉백 => 쉐어',
        },
        kbStacksSwap: {
          en: '${kbStacks} (Swapped)',
          de: '${kbStacks} (Getauscht)',
          cn: '${kbStacks} (换位后)',
          tc: '${kbStacks} (換位後)',
          ko: '${kbStacks} (교대)',
        },
      },
    },
    {
      id: 'FRU P3 Memory\'s End',
      type: 'StartsUsing',
      netRegex: { id: '9D6C', source: 'Oracle of Darkness', capture: false },
      delaySeconds: 5, // 9.7s cast time
      response: Responses.bigAoe(),
    },
    // ************************
    // P4 -- Duo
    // ************************
    {
      id: 'FRU P4 Akh Rhai',
      // positions snapshot when hidden combatants are added, but they have unreliable names
      // we can safely base this on the timing of the vfx effect that precedes the snapshot
      type: 'GainsEffect',
      netRegex: { effectId: '8E1', capture: false },
      condition: (data) => data.phase === 'p4-dld',
      delaySeconds: 4.7,
      suppressSeconds: 1,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'FRU P4 Akh Morn',
      type: 'StartsUsing',
      netRegex: { id: '9D6E', source: 'Oracle of Darkness', capture: false },
      alertText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.stacks,
      },
    },
    {
      id: 'FRU P4 Morn Afah',
      type: 'StartsUsing',
      netRegex: { id: '9D70', source: 'Oracle of Darkness', capture: false },
      durationSeconds: 6,
      alertText: (_data, _matches, output) => output.stack!(),
      outputStrings: {
        stack: Outputs.getTogether,
      },
    },
    // ***** Darklit Dragonsong *****
    {
      id: 'FRU P4 Darklit Dragonsong',
      type: 'StartsUsing',
      netRegex: { id: '9D6D', source: 'Oracle of Darkness', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'FRU P4 Darklit Stacks Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '99D' }, // Spell-in-Waiting: Dark Water III
      condition: (data) => data.phase === 'p4-dld',
      run: (data, matches) => data.p4DarklitStacks.push(matches.target),
    },
    {
      id: 'FRU P4 Darklit Tether + Cleave Collect',
      type: 'Tether',
      netRegex: { id: '006E' }, // Refulgent Chain
      condition: (data) => data.phase === 'p4-dld',
      run: (data, matches) => {
        data.p4DarklitTetherCount++;
        (data.p4DarklitTethers[matches.source] ??= []).push(matches.target);
        (data.p4DarklitTethers[matches.target] ??= []).push(matches.source);

        if (data.p4DarklitTetherCount === 4)
          data.p4DarklitCleaves = data.party.partyNames.filter(
            (name) => !(Object.keys(data.p4DarklitTethers).includes(name)),
          );
      },
    },
    // The logic for tether swaps, bait swaps, and possible stack swaps is fairly concise.
    // It's not comprehensive (specifically, we can't determine which DPS need to flex
    // and when for the cone baits), but otherwise it's accurate.  See inline comments.
    {
      id: 'FRU P4 Darklit Tower / Bait',
      type: 'Tether',
      netRegex: { id: '006E', capture: false }, // Refulgent Chain
      condition: (data) => data.phase === 'p4-dld' && data.p4DarklitTetherCount === 4,
      durationSeconds: 9,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          towerNoSwap: {
            en: 'Tower (no swaps)',
            de: 'Turm (kein wechsel)',
            cn: '塔 (无换位)',
            tc: '塔 (無換位)',
            ko: '탑 (교대 없음)',
          },
          towerOtherSwap: {
            en: 'Tower (${p1} + ${p2} swap)',
            de: 'Turm (${p1} + ${p2} wechseln)',
            cn: '塔 (${p1} + ${p2} 换位)',
            tc: '塔 (${p1} + ${p2} 換位)',
            ko: '탑 (${p1} + ${p2} 교대)',
          },
          towerYouSwap: {
            en: 'Tower (swap w/${player})',
            de: 'Turm (wechsel mit ${player})',
            cn: '塔 (与 ${player} 换位)',
            tc: '塔 (與 ${player} 換位)',
            ko: '탑 (${player}와 교대)',
          },
          tower: { // if no strat set, or cannot determine
            en: 'Tower',
            de: 'Turm',
            cn: '塔',
            tc: '塔',
            ko: '탑',
          },
          bait: { // for supports in healerPlantNW, or no strat
            en: 'Bait Cone',
            de: 'Köder Kegel-AoE',
            cn: '诱导扇形',
            tc: '誘導扇形',
            ko: '부채꼴 유도',
          },
          baitDPS: { // for DPS in healerPlantNW
            en: 'Bait Cone (w/ ${otherDps})',
            de: 'Köder Kegel-AoE (mit ${otherDps})',
            cn: '诱导扇形 (与 ${otherDps})',
            tc: '誘導扇形 (與 ${otherDps})',
            ko: '부채꼴 유도 (+ ${otherDps})',
          },
        };

        const isHealerPlantNW = data.triggerSetConfig.darklit === 'healerPlantNW';

        const baitPlayers = data.p4DarklitCleaves;
        const towerPlayers = Object.keys(data.p4DarklitTethers);
        const myMech = baitPlayers.includes(data.me)
          ? 'bait'
          : (towerPlayers.includes(data.me) ? 'tower' : 'none');

        if (myMech === 'none')
          return;
        else if (baitPlayers.length !== 4 || towerPlayers.length !== 4)
          return { alertText: output[myMech]!() };
        else if (!isHealerPlantNW)
          return { alertText: output[myMech]!() };

        // Identify the tethered player with the stack marker.
        const towerStackPlayer = data.p4DarklitStacks.filter((p) => towerPlayers.includes(p))[0];

        const defaultOutput = { alertText: output[myMech]!() };

        // Map out roles and sanity check that we have 1 tank, 1 healer, and 2 dps in each group
        // (for the inevitable TankFRU, SoloHealerFRU, etc.)
        let towerTank = '';
        let towerHealer = '';
        const towerDps: string[] = [];
        for (const player of towerPlayers) {
          const role = data.party.nameToRole_[player];
          if (role === 'tank')
            towerTank = player;
          else if (role === 'healer')
            towerHealer = player;
          else if (role === 'dps')
            towerDps.push(player);
          else
            return defaultOutput;
        }
        if (towerTank === '' || towerHealer === '' || towerDps.length !== 2)
          return defaultOutput;

        let baitTank = '';
        let baitHealer = '';
        const baitDps: string[] = [];
        for (const player of baitPlayers) {
          const role = data.party.nameToRole_[player];
          if (role === 'tank')
            baitTank = player;
          else if (role === 'healer')
            baitHealer = player;
          else if (role === 'dps')
            baitDps.push(player);
          else
            return defaultOutput;
        }
        if (baitTank === '' || baitHealer === '' || baitDps.length !== 2)
          return defaultOutput;

        // Handle tower stuff first.
        // Figuring out the pattern (bowtie, box, hourglass) to determine who should swap would
        // (a) require knowing which DPS is which role (M1, M2, R1, R2), or (b) trying to infer
        // roles + swaps based on player positions when tethers go out. Both options are messy.
        // But we can make this simple, because tethers always connect 1 tank, 1 healer, and 2 DPS:
        //   - If a dps is tethered to both a tank & healer, it's bowtie - no swaps.
        //   - If not, the dps tethered to the tank swaps with the tank (true for hourglass + box).
        // Once we know this, we also now know whether the tower player with the stack marker
        // will be in the north or south group (for healerPlantNW).

        // Check if a dps has tank + healer tethers; if so, bowtie. Done.
        const towerDps1 = towerDps[0] ?? '';
        const towerDps1Tethers = data.p4DarklitTethers[towerDps1];
        if (towerDps1Tethers?.includes(towerTank) && towerDps1Tethers?.includes(towerHealer)) {
          if (isHealerPlantNW && [towerTank, towerHealer].includes(towerStackPlayer ?? ''))
            data.p4DarklitTowerStackLoc = 'north';
          else if (isHealerPlantNW)
            data.p4DarklitTowerStackLoc = 'south';

          if (myMech === 'tower')
            return { infoText: output.towerNoSwap!() };
        } else {
          // Not bowtie, so find the DPS that's tethered to the tank.
          const dpsWithTank = towerDps.find((dps) =>
            data.p4DarklitTethers[dps]?.includes(towerTank)
          );
          if (dpsWithTank === undefined)
            return defaultOutput;

          if (isHealerPlantNW && [towerHealer, dpsWithTank].includes(towerStackPlayer ?? ''))
            data.p4DarklitTowerStackLoc = 'north';
          else if (isHealerPlantNW)
            data.p4DarklitTowerStackLoc = 'south';

          if (myMech === 'tower') {
            if (dpsWithTank === data.me)
              return {
                alertText: output.towerYouSwap!({
                  player: data.party.member(towerTank),
                }),
              };
            else if (towerTank === data.me)
              return {
                alertText: output.towerYouSwap!({
                  player: data.party.member(dpsWithTank),
                }),
              };
            return {
              infoText: output.towerOtherSwap!({
                p1: data.party.member(dpsWithTank),
                p2: data.party.member(towerTank),
              }),
            };
          }
        }

        // Bait players last.
        // To properly figure out side-flexing (e.g. M1 and M2 are both baiting), again, we'd need
        // to know who was in what role or infer it from positions, and no clean solution.
        // So, instead, we can tell the tank and healer to bait, and we can tell the DPS
        // who the other DPS baiter is, and let them figure out if that requires a swap. /shrug
        if ([baitTank, baitHealer].includes(data.me))
          return { infoText: output.bait!() };
        else if (baitDps.includes(data.me)) {
          const otherDps = baitDps.find((dps) => dps !== data.me);
          if (otherDps === undefined)
            return defaultOutput;
          return {
            alertText: output.baitDPS!({
              otherDps: data.party.member(otherDps),
            }),
          };
        }

        return defaultOutput;
      },
    },
    {
      id: 'FRU P4 Darklit Cleave Stack',
      type: 'Tether',
      netRegex: { id: '006E', capture: false }, // Refulgent Chain
      condition: (data) => data.phase === 'p4-dld' && data.p4DarklitTetherCount === 4,
      delaySeconds: 2, // a little breathing room to process the tower/bait call
      durationSeconds: 7,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          stackOnYou: { // default/fallthrough
            en: '(stack on you later)',
            de: '(später sammeln auf dir)',
            cn: '(稍后分摊点名)',
            tc: '(稍後分攤點名)',
            ko: '(쉐어 대상자)',
          },
          // stack is on you
          stackOnYouNoSwap: {
            en: '(stack on you later - no swap)',
            de: '(später sammeln auf dir - kein wechsel)',
            cn: '(稍后分摊点名 - 不换位)',
            tc: '(稍後分攤點名 - 不換位)',
            ko: '(쉐어 대상자 - 교대 없음)',
          },
          dpsStackOnYouSwap: {
            en: 'Stacks: You swap w/ Support',
            de: 'Sammeln: Du wechselst mit Support',
            cn: '分摊: 与T/奶换位',
            tc: '分攤: 與T/奶換位',
            ko: '쉐어: 탱힐과 교대',
          },
          healerStackOnYouSwap: {
            en: 'Stacks: You swap w/ Ranged/Flex',
            de: 'Sammeln: Du wechselst mit Fernkämpfer/Flex',
            cn: '分摊: 与远程/灵活位换位',
            tc: '分攤: 與遠程/靈活位換位',
            ko: '쉐어: 원딜과 교대/상황 판단',
          },
          tankStackOnYouSwap: {
            en: 'Stacks: You swap w/ Melee/Flex',
            de: 'Sammeln: Du wechselst mit Nahkämpfer/Flex',
            cn: '分摊: 与近战/灵活位换位',
            tc: '分攤: 與近戰/靈活位換位',
            ko: '쉐어: 근딜과 교대/상황 판단',
          },
          // stack on someone else (not your role), so you may be required to swap
          dpsStackOnHealerSwap: {
            en: 'Stacks: ${healer} swap w/ Ranged/Flex',
            de: 'Sammeln: ${healer} wechselt mit Fernkämpfer/Flex',
            cn: '分摊: ${healer} 与远程/灵活位换位',
            tc: '分攤: ${healer} 與遠程/靈活位換位',
            ko: '쉐어: ${healer} 원딜과 교대/상황 판단',
          },
          dpsStackOnTankSwap: {
            en: 'Stacks: ${tank} swap w/ Melee/Flex',
            de: 'Sammeln: ${tank} wechselt mit Nahkämpfer/Flex',
            cn: '分摊: ${tank} 与近战/灵活位换位',
            tc: '分攤: ${tank} 與近戰/靈活位換位',
            ko: '쉐어: ${tank} 근딜과 교대/상황 판단',
          },
          supportStackOnDpsSwap: {
            en: 'Stacks: ${dps} swap w/ Support',
            de: 'Sammeln: ${dps} wechselt mit Support',
            cn: '分摊: ${dps} 与T/奶换位',
            tc: '分攤: ${dps} 與T/奶換位',
            ko: '쉐어: ${dps} 탱힐과 교대',
          },
        };
        const isHealerPlantNW = data.triggerSetConfig.darklit === 'healerPlantNW';

        // Only bother with output if the player is baiting, and if we can tell which baiter has the stack
        const baitPlayers = data.p4DarklitCleaves;
        const baitStackPlayer = data.p4DarklitStacks.find((p) => baitPlayers.includes(p));
        if (baitStackPlayer === undefined || !baitPlayers.includes(data.me))
          return {};
        const stackName = data.party.member(baitStackPlayer);

        const isStackOnMe = data.me === baitStackPlayer;
        const defaultOutput = isStackOnMe ? { infoText: output.stackOnYou!() } : {};
        const myRole = data.role;
        const stackRole = data.party.nameToRole_[baitStackPlayer];
        if (stackRole === undefined)
          return defaultOutput;

        // Sanity check for non-standard party comp, or this trigger won't work
        const tankCount = baitPlayers.filter((p) => data.party.nameToRole_[p] === 'tank').length;
        const healerCount =
          baitPlayers.filter((p) => data.party.nameToRole_[p] === 'healer').length;
        const dpsCount = baitPlayers.filter((p) => data.party.nameToRole_[p] === 'dps').length;
        if (tankCount !== 1 || healerCount !== 1 || dpsCount !== 2)
          return defaultOutput;

        const baitStackLoc = stackRole === 'dps' ? 'south' : 'north';
        if (data.p4DarklitTowerStackLoc === undefined || !isHealerPlantNW)
          return defaultOutput;
        const towerStackLoc = data.p4DarklitTowerStackLoc;

        // if stacks are already split N/S, no swaps required
        // TODO: Could return an infoText indicating the baiter with the stack doesn't need to swap?
        if (baitStackLoc !== towerStackLoc)
          return isStackOnMe
            ? { infoText: output.stackOnYouNoSwap!() }
            : defaultOutput; // could return a infoText indicating no swaps are needed?

        // stacks are together, so we need to call for a swap
        if (isStackOnMe)
          switch (myRole) {
            case 'dps':
              return { alertText: output.dpsStackOnYouSwap!() };
            case 'healer':
              return { alertText: output.healerStackOnYouSwap!() };
            case 'tank':
              return { alertText: output.tankStackOnYouSwap!() };
            default:
              return defaultOutput;
          }

        // if the stack is on the other dps/support, player doesn't have to do anything
        // TODO: Could return an infoTexts indicating the bait with the stack needs to swap?
        if (
          (myRole === 'dps' && stackRole === 'dps') ||
          (myRole === 'healer' && stackRole === 'tank') ||
          (myRole === 'tank' && stackRole === 'healer')
        )
          return defaultOutput;

        // if the stack is on the other role, the player may have to swap
        // but we don't know which DPS is the melee (for tank swap) or ranged (for healer swap)
        // so we have to leave it up to the player to figure out
        if (myRole === 'healer' || myRole === 'tank')
          return { alertText: output.supportStackOnDpsSwap!({ dps: stackName }) };
        else if (myRole === 'dps' && stackRole === 'healer')
          return { alertText: output.dpsStackOnHealerSwap!({ healer: stackName }) };
        else if (myRole === 'dps' && stackRole === 'tank')
          return { alertText: output.dpsStackOnTankSwap!({ tank: stackName }) };

        return defaultOutput;
      },
    },
    {
      id: 'FRU P4 Darklit Spirit Taker',
      type: 'StartsUsing',
      netRegex: { id: '9D60', source: 'Oracle of Darkness', capture: false },
      condition: (data) => data.phase === 'p4-dld',
      delaySeconds: 0.5, // delay until after Path of Light snapshots
      durationSeconds: 2,
      response: Responses.spread('alert'),
    },
    {
      id: 'FRU P4 Hallowed Wings',
      type: 'StartsUsing',
      netRegex: { id: ['9D23', '9D24'], source: 'Usurper of Frost' },
      condition: (data) => data.phase === 'p4-dld',
      delaySeconds: 1, // avoid collision with Spirit Taker
      infoText: (_data, matches, output) => {
        const dir = matches.id === '9D23' ? 'east' : 'west';
        return output.combo!({ dir: output[dir]!(), stacks: output.stacks!() });
      },
      outputStrings: {
        combo: {
          en: '${dir} => ${stacks}',
          de: '${dir} => ${stacks}',
          cn: '${dir} => ${stacks}',
          tc: '${dir} => ${stacks}',
          ko: '${dir} => ${stacks}',
        },
        east: Outputs.east,
        west: Outputs.west,
        stacks: Outputs.stacks,
      },
    },
    // ***** Crystallize Time *****
    {
      id: 'FRU P4 Crystallize Time',
      type: 'StartsUsing',
      netRegex: { id: '9D6A', source: 'Oracle of Darkness', capture: false },
      delaySeconds: 3,
      durationSeconds: 7,
      response: Responses.bigAoe(),
    },
    // For Crystallize Time, we can determine redWind (x2), blueWater, blueUnholy, and
    // blueEruption from a single debuff. But determining redIce (x2) and blueIce requires multiple
    // debuffs. We need to collect both redIces and redWinds to name the other player.
    {
      id: 'FRU P4 Crystallize Time Debuff Collect',
      type: 'GainsEffect',
      netRegex: { effectId: Object.keys(ctDebuffMap) },
      condition: (data) => data.phase === 'p4-ct',
      run: (data, matches) => {
        const debuff = ctDebuffMap[matches.effectId];
        if (!debuff)
          return;

        if (isCTCollectDebuff(debuff))
          data.p4CTDebuffs[debuff].push(matches.target);

        // we're done collecting, so we only care about personal debuffs now
        if (data.me !== matches.target)
          return;

        if (debuff === 'wind')
          data.p4CTMyRole = 'redWind';
        else if (debuff === 'water')
          data.p4CTMyRole = 'blueWater';
        else if (debuff === 'unholy')
          data.p4CTMyRole = 'blueUnholy';
        else if (debuff === 'eruption')
          data.p4CTMyRole = 'blueEruption';
        // if redIce/blueIce, data.p4CTMyRole gets set in the Debuff trigger below.
      },
    },
    // Run once after collects are done; determine redIce/blueIce.
    {
      id: 'FRU P4 Crystallize Time Debuff',
      type: 'GainsEffect',
      netRegex: { effectId: Object.keys(ctDebuffMap), capture: false },
      condition: (data) => data.phase === 'p4-ct',
      delaySeconds: 0.4,
      durationSeconds: 8,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const debuff = data.p4CTMyRole;

        if (debuff === 'redWind') {
          const partner = data.p4CTDebuffs.wind.find((p) => p !== data.me)!;
          data.p4CTPartnerRole = data.party.nameToRole_[partner];
          return output.comboText!({
            debuff: output.redWind!(),
            player: data.party.member(partner),
          });
        }

        // if debuff is undefined, player has redIce or blueIce, and we need to determine which.
        if (debuff === undefined) {
          if (!data.p4CTDebuffs.ice.includes(data.me))
            return output.text!({ debuff: output.unknown!() });

          if (data.p4CTDebuffs.blue.includes(data.me)) {
            data.p4CTMyRole = 'blueIce';
            return output.text!({ debuff: output.blueIce!() });
          }

          if (data.p4CTDebuffs.red.includes(data.me)) {
            data.p4CTMyRole = 'redIce';
            const partner = data.p4CTDebuffs.ice.find((p) =>
              p !== data.me && data.p4CTDebuffs.red.includes(p)
            )!;
            data.p4CTPartnerRole = data.party.nameToRole_[partner]!;
            return output.comboText!({
              debuff: output.redIce!(),
              player: data.party.member(partner),
            });
          }

          // Fallthrough, should never happen.
          return output.text!({ debuff: output.unknown!() });
        }

        return output.text!({ debuff: output[debuff]!() });
      },
      outputStrings: {
        text: {
          en: '${debuff} on You',
          de: '${debuff} auf DIR',
          cn: '${debuff} 点名',
          tc: '${debuff} 點名',
          ko: '${debuff} 대상자',
        },
        comboText: {
          en: '${debuff} (w/ ${player})',
          de: '${debuff} (mit ${player})',
          cn: '${debuff} (与 ${player})',
          tc: '${debuff} (與 ${player})',
          ko: '${debuff} (+ ${player})',
        },
        redIce: {
          en: 'Red Ice',
          de: 'Rotes Eis',
          cn: '短红',
          tc: '短紅',
          ko: '빨간색 얼음',
        },
        redWind: {
          en: 'Wind/Aero',
          de: 'Wind/Aero',
          cn: '长红',
          tc: '長紅',
          ko: '바람',
        },
        blueIce: {
          en: 'Blue Ice',
          de: 'Blaues Eis',
          cn: '蓝冰',
          tc: '藍冰',
          ko: '파란색 얼음',
        },
        blueWater: {
          en: 'Water (stack)',
          de: 'Wasser (sammeln)',
          cn: '水 (分摊)',
          tc: '水 (分攤)',
          ko: '물 (쉐어)',
        },
        blueUnholy: {
          en: 'Unholy (stack)',
          de: 'Unheiliges (sammeln)',
          cn: '圣 (分摊)',
          tc: '聖 (分攤)',
          ko: '다크 홀리 (쉐어)',
        },
        blueEruption: {
          en: 'Eruption (spread)',
          de: 'Eruption (verteilen)',
          cn: '暗 (分散)',
          tc: '暗 (分散)',
          ko: '어둠의 불기둥 (산개)',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'FRU P4 Crystallize Time Stoplight Collect',
      type: 'AddedCombatant',
      netRegex: { npcBaseId: '17837' },
      condition: (data) => data.phase === 'p4-ct',
      run: (data, matches) => data.p4CTStoplights[matches.id] = matches,
    },
    {
      id: 'FRU P4 Crystallize Time Initial Position',
      type: 'Tether',
      // Boss always tethers the N/S stoplights yellow (fast), and then either
      // the NE/SW or NW/SE pair are purple (slow).  We only need the northern purple stoplight.
      netRegex: { id: '0085' },
      condition: (data) => data.phase === 'p4-ct' && data.triggerSetConfig.ct === 'earlyPopSouth',
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        const id = matches.sourceId;
        const stoplight = data.p4CTStoplights[id];
        if (stoplight === undefined)
          return;

        const x = parseFloat(stoplight.x);
        const y = parseFloat(stoplight.y);
        const spreadDirNum = Directions.xyTo8DirNum(x, y, centerX, centerY);

        if (spreadDirNum !== 1 && spreadDirNum !== 7)
          return;

        const spreadDir = Directions.output8Dir[spreadDirNum] ?? 'unknown';
        const stackDir = Directions.output8Dir[(spreadDirNum + 4) % 8] ?? 'unknown';
        const debuff = data.p4CTMyRole;
        const role = data.role;

        if (!debuff)
          return;

        if (debuff.startsWith('blue')) {
          const dirStr = debuff === 'blueEruption' ? output[spreadDir]!() : output[stackDir]!();
          const mechStr = debuff === 'blueEruption' ? output.spread!() : output.stack!();
          return output.blue!({ mech: mechStr, dir: dirStr });
        }

        // For redIce and redWind, we can't determine same-role swap priorities, so we can only give a
        // single directional output if we *know* no swap is required.  Otherwise, call both dirs.
        if (debuff === 'redIce') {
          const comboDirStr = `${output['dirE']!()} / ${output['dirW']!()}`;
          const sameDebuffRole = data.p4CTPartnerRole;
          const partyStackDirStr = output.partyStack!({ dir: output[stackDir]!() });

          if (sameDebuffRole === undefined || role === sameDebuffRole)
            return output.redIce!({ dir: comboDirStr, followup: partyStackDirStr });

          let myDirNum: number;
          if (role === 'dps') // always east if T/H has other redIce
            myDirNum = 2;
          else if (role === 'healer') // always west if T/D has other redIce
            myDirNum = 6;
          else if (sameDebuffRole === 'dps') // tank stays west
            myDirNum = 6;
          // tank + healer, tank flexes east
          else
            myDirNum = 2;

          const myDirStr = output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
          // if the redIce player is adjacent to the eruption player, they move north after
          const followupStr = Math.abs(myDirNum - spreadDirNum) === 1
            ? output.stackNorth!()
            : output.dodgeSouth!();
          return output.redIce!({ dir: myDirStr, followup: followupStr });
        }

        if (debuff === 'redWind') {
          const comboDirStr = `${output['dirSE']!()} / ${output['dirSW']!()}`;
          const sameDebuffRole = data.p4CTPartnerRole;

          if (sameDebuffRole === undefined || role === sameDebuffRole)
            return comboDirStr;

          let myDirNum: number;
          if (role === 'dps') // always SE if T/H has other redWind
            myDirNum = 3;
          else if (role === 'healer') // always SW if T/D has other redWind
            myDirNum = 5;
          else if (sameDebuffRole === 'dps') // tank stays SW
            myDirNum = 5;
          // tank + healer, tank flexes SE
          else
            myDirNum = 3;

          return output[Directions.output8Dir[myDirNum] ?? 'unknown']!();
        }

        return output.unknown!();
      },
      outputStrings: {
        blue: {
          en: '${mech} (${dir})',
          de: '${mech} (${dir})',
          cn: '${mech} (${dir})',
          tc: '${mech} (${dir})',
          ko: '${mech} (${dir})',
        },
        redIce: {
          en: '${dir} ${followup}',
          de: '${dir} ${followup}',
          cn: '${dir} ${followup}',
          tc: '${dir} ${followup}',
          ko: '${dir} ${followup}',
        },
        dodgeSouth: {
          en: '(dodge S after)',
          de: '(weiche nach Süden aus)',
          cn: '(稍后避开下)',
          tc: '(稍後避開下)',
          ko: '(이후 남쪽으로 회피)',
        },
        stackNorth: {
          en: '(stack N after)',
          de: '(sammeln im Norden danach)',
          cn: '(稍后去上分摊)',
          tc: '(稍後去上分攤)',
          ko: '(이후 북쪽으로 쉐어)',
        },
        // used if there is a role-flex and we don't know whether they are E or W.
        partyStack: {
          en: '(party stack is ${dir})',
          de: '(Party sammeln im ${dir})',
          cn: '(在 ${dir} 全员分摊)',
          tc: '(在 ${dir} 全員分攤)',
          ko: '(본대 쉐어 ${dir})',
        },
        spread: Outputs.spread,
        stack: Outputs.getTogether,
        unknown: Outputs.unknown,
        ...Directions.outputStrings8Dir,
      },
    },
    {
      id: 'FRU P4 Crystallize Time Blue Cleanse',
      type: 'Ability',
      netRegex: { id: '9D55', capture: false }, // Unholy Darkness
      condition: (data) => data.phase === 'p4-ct',
      delaySeconds: 2,
      durationSeconds: 8,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const debuff = data.p4CTMyRole;
        if (!debuff)
          return;

        const isEarlyPopS = data.triggerSetConfig.ct === 'earlyPopSouth';
        if (debuff.startsWith('blue'))
          return isEarlyPopS ? output.cleanseSpot!({ spot: output[debuff]!() }) : output.cleanse!();
        return output.avoidCleanse!();
      },
      outputStrings: {
        cleanseSpot: {
          en: 'Cleanse: ${spot}',
          de: 'Reinige: ${spot}',
          cn: '净化: ${spot}',
          tc: '淨化: ${spot}',
          ko: '정화: ${spot}',
        },
        cleanse: { // if no strat
          en: 'Cleanse',
          de: 'Reinigen',
          cn: '净化',
          tc: '淨化',
          ko: '정화',
        },
        avoidCleanse: {
          en: 'Avoid cleanse puddles',
          de: 'Vermeide Reinungs-Fläche',
          cn: '避开净化圈',
          tc: '避開淨化圈',
          ko: '정화 장판 피하기',
        },
        blueWater: Directions.outputStrings8Dir.dirSE!,
        blueUnholy: Directions.outputStrings8Dir.dirE!,
        blueEruption: Directions.outputStrings8Dir.dirW!,
        blueIce: Directions.outputStrings8Dir.dirSW!,
      },
    },
    {
      id: 'FRU P4 Crystallize Time Tidal Light Collect',
      type: 'StartsUsing',
      netRegex: { id: '9D3B' }, // Tidal Light
      condition: (data) => data.phase === 'p4-ct',
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dirNum = Directions.xyTo8DirNum(x, y, centerX, centerY);
        data.p4CTTidalDirs.push(dirNum);
      },
    },
    {
      id: 'FRU P4 Crystallize Time Drop Rewind',
      type: 'GainsEffect',
      netRegex: { effectId: '1070' }, // Spell-in-Waiting: Return
      condition: (data, matches) => data.phase === 'p4-ct' && data.me === matches.target,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 8,
      countdownSeconds: 8,
      alertText: (data, _matches, output) => {
        const unknownStr = output.rewind!({ spot: output.unknown!() });
        if (data.p4CTTidalDirs.length !== 2)
          return unknownStr;

        // re-use findURNorthDirNum() to find the intercard between the two starting Tidal spots
        const intersectDirNum = findURNorthDirNum(data.p4CTTidalDirs);
        if (intersectDirNum === -1)
          return unknownStr;

        const dir = Directions.output8Dir[intersectDirNum];
        if (dir === undefined)
          return unknownStr;

        return output.rewind!({ spot: output[dir]!() });
      },
      outputStrings: {
        rewind: {
          en: 'Drop Rewind: ${spot}',
          de: 'Rückführung ablegen: ${spot}',
          cn: '放置回返: ${spot}',
          tc: '放置回返: ${spot}',
          ko: '리턴 설치: ${spot}',
        },
        unknown: Outputs.unknown,
        ...Directions.outputStringsIntercardDir,
      },
    },
    {
      id: 'FRU P4 Crystallize Time Spirit Taker',
      type: 'GainsEffect',
      netRegex: { effectId: '994' }, // Return
      condition: (data, matches) => data.phase === 'p4-ct' && data.me === matches.target,
      alertText: (_data, _matches, output) => output.spreadAvoid!(),
      outputStrings: {
        spreadAvoid: {
          en: 'Spread -- Avoid crystal',
          de: 'Verteilen -- Vermeide Kristall',
          cn: '分摊 -- 避开水晶',
          tc: '分攤 -- 避開水晶',
          ko: '산개 -- 크리스탈 피하기',
        },
      },
    },
    // ************************
    // P5 -- Pandora
    // ************************
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Axe Kick/Scythe Kick': 'Axe/Scythe Kick',
        'Cruel Path of Darkness + Cruel Path of Light': 'Polarizing Paths',
        'Dark Blizzard III + Dark Eruption + Dark Aero III': '(donut + spread + KBs)',
        'Dark Fire III/Dark Blizzard III/Unholy Darkness': '(spreads/donut/stack)',
        'Dark Fire III/Unholy Darkness': '(spreads/stack)',
        'Dark Water III + Hallowed Wings': '(cleave + stacks)',
        'Shadoweye/Dark Water III/Dark Eruption': '(gazes/stack/spreads)',
        'Shining Armor + Frost Armor': 'Shining + Frost Armor',
        'Sinbound Fire III/Sinbound Thunder III': 'Sinbound Fire/Thunder',
        'The Path of Darkness + The Path of Light': '(exa-lines)',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Crystal of Darkness': 'Kristall der Dunkelheit',
        'Crystal of Light': 'Kristall des Lichts',
        'Delight\'s Hourglass': 'Sanduhr der Freude',
        'Drachen Wanderer': 'Seele des heiligen Drachen',
        'Fatebreaker\'s Image': 'Abbild des Banns der Hoffnung',
        'Fatebreaker(?!\')': 'Bann der Hoffnung',
        'Fragment of Fate': 'Splitter des Schicksals',
        'Frozen Mirror': 'Eisspiegel',
        'Holy Light': 'heilig(?:e|er|es|en) Licht',
        'Ice Veil': 'Immerfrost-Kristall',
        'Oracle of Darkness': 'Orakel der Dunkelheit',
        'Oracle\'s Reflection': 'Spiegelbild des Orakels',
        'Pandora': 'Pandora-Mitron',
        'Sorrow\'s Hourglass': 'Sanduhr der Sorge',
        'Usurper of Frost': 'Shiva-Mitron',
      },
      'replaceText': {
        ' drop\\)': ' abgelegt)',
        '--Oracle center--': '--Orakel mitte--',
        '--Oracle targetable--': '--Orakel anvisierbar--',
        '--Oracle untargetable--': '--Orakel nicht anvisierbar--',
        '--Usurper untargetable--': '--Usurper nicht anvisierbar--',
        '--jump south--': '--Sprung Süden--',
        '--reposition--': '--Repositionierung--',
        'Absolute Zero': 'Absoluter Nullpunkt',
        'Akh Morn': 'Akh Morn',
        'Akh Rhai': 'Akh Rhai',
        'Apocalypse': 'Apokalypse',
        'Axe Kick': 'Axttritt',
        'Banish III': 'Verbannga',
        'Black Halo': 'Geschwärzter Schein',
        'Blastburn': 'Brandstoß',
        'Blasting Zone': 'Erda-Detonation',
        'Bright Hunger': 'Erosionslicht',
        'Burn Mark': 'Brandmal',
        'Burnished Glory': 'Leuchtende Aureole',
        'Burnout': 'Brandentladung',
        'Burnt Strike': 'Brandschlag',
        'Burst': 'Explosion',
        'Cruel Path of Darkness': 'Umbrales Prisma',
        'Cruel Path of Light': 'Lichtprisma',
        'Crystallize Time': 'Chronokristall',
        'Cyclonic Break': 'Zyklon-Brecher',
        'Dark Aero III': 'Dunkel-Windga',
        'Dark Blizzard III': 'Dunkel-Eisga',
        'Dark Eruption': 'Dunkle Eruption',
        'Dark Fire III': 'Dunkel-Feuga',
        'Dark Water III': 'Dunkel-Aquaga',
        'Darkest Dance': 'Finsterer Tanz',
        'Darklit Dragonsong': 'Drachenlied von Licht und Schatten',
        'Diamond Dust': 'Diamantenstaub',
        'Drachen Armor': 'Drachenrüstung',
        'Edge of Oblivion': 'Nahendes Vergessen',
        'Endless Ice Age': 'Lichtflut',
        'Explosion': 'Explosion',
        'Fall Of Faith': 'Sünden-Erdspaltung',
        'Floating Fetters': 'Schwebende Fesseln',
        'Frigid Needle': 'Eisnadel',
        'Frigid Stone': 'Eisstein',
        'Frost Armor': 'Frostrüstung',
        'Fulgent Blade': 'Staublichtschwert',
        'Hallowed Ray': 'Heiliger Strahl',
        'Hallowed Wings': 'Heilige Schwingen',
        'Heavenly Strike': 'Himmelszorn',
        'Hell\'s Judgment': 'Höllenurteil',
        'Hiemal Storm': 'Hiemaler Sturm',
        'Icicle Impact': 'Eiszapfen-Schlag',
        'Junction': 'Kopplung',
        'Light Rampant': 'Überflutendes Licht',
        'Longing of the Lost': 'Heiliger Drache',
        'Luminous Hammer': 'Gleißende Erosion',
        'Maelstrom': 'Mahlstrom',
        'Materialization': 'Konkretion',
        'Memory\'s End': 'Ende der Erinnerungen',
        'Mirror Image': 'Spiegelbild',
        'Mirror, Mirror': 'Spiegelland',
        'Morn Afah': 'Morn Afah',
        'Pandora\'s Box': 'Pandoras Saat',
        'Paradise Lost': 'Verlorenes Paradies',
        'Paradise Regained': 'Wiedergewonnenes Paradies',
        'Polarizing Paths': 'Sternschattenschwert',
        'Polarizing Strikes': 'Sternschattenschwert',
        'Powder Mark Trail': 'Stetes Pulvermal',
        'Powerful Light': 'Entladenes Licht',
        'Quadruple Slap': 'Vierfachschlag',
        'Quicken': 'Schnell',
        'Quietus': 'Quietus',
        'Reflected Scythe Kick': 'Spiegelung: Abwehrtritt',
        'Rewind': 'Zurückspringen',
        '(?<! )Scythe Kick': 'Abwehrtritt',
        'Shadoweye': 'Schattenauge',
        'Shell Crusher': 'Hüllenbrecher',
        'Shining Armor': 'Funkelnde Rüstung',
        'Shockwave Pulsar': 'Schockwellenpulsar',
        'Sinblaze': 'Sündenglut',
        'Sinbound Blizzard III': 'Sünden-Eisga',
        'Sinbound Fire III': 'Sünden-Feuga',
        'Sinbound Holy': 'Sünden-Sanctus',
        'Sinbound Meltdown': 'Sündenschmelze',
        'Sinbound Thunder III': 'Sünden-Blitzga',
        'Sinsmite': 'Sündenblitz',
        'Sinsmoke': 'Sündenflamme',
        '(?<! \\()Slow': 'Gemach',
        'Somber Dance': 'Düsterer Tanz',
        'Speed': 'Geschwindigkeit',
        'Spell-in-Waiting Refrain': 'Inkantatische Verzögerung',
        'Spirit Taker': 'Geistesdieb',
        'Stun(?!\\w)': 'Betäubung',
        'Swelling Frost': 'Frostwoge',
        'The House of Light': 'Tsunami des Lichts',
        'The Path of Darkness': 'Pfad der Dunkelheit',
        'The Path of Light': 'Pfad des Lichts',
        'Tidal Light': 'Welle des Lichts',
        'Turn Of The Heavens': 'Kreislauf der Wiedergeburt',
        'Twin Silence': 'Zwillingsschwerter der Ruhe',
        'Twin Stillness': 'Zwillingsschwerter der Stille',
        'Ultimate Relativity': 'Fatale Relativität',
        'Unholy Darkness': 'Unheiliges Dunkel',
        'Utopian Sky': 'Paradiestrennung',
        'Wings Dark and Light': 'Schwinge von Licht und Schatten',
        '\\(cast\\)': '(wirken)',
        '\\(close\\)': '(nah)',
        '\\(damage\\)': '(Schaden)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(far\\)': '(fern)',
        '\\(fast\\)': '(schnell)',
        '\\(fire\\)': '(Feuer)',
        '\\(follow-up\\)': '(folgend)',
        '\\(group tower\\)': '(Gruppen-Türme)',
        '\\(jump\\)': '(Sprung)',
        '\\(knockback\\)': '(Rückstoß)',
        '\\(lightning\\)': '(Blitz)',
        '\\(normal\\)': '(normal)',
        '\\(puddles\\)': '(Flächen)',
        '\\(slow\\)': '(langsam)',
        '\\(solo towers\\)': '(Solo-Turm)',
        '\\(targeted\\)': '(anvisiert)',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Crystal of Darkness': 'cristal de Ténèbres',
        'Crystal of Light': 'cristal de Lumière',
        'Delight\'s Hourglass': 'sablier de plaisir',
        'Drachen Wanderer': 'esprit du Dragon divin',
        'Fatebreaker\'s Image': 'double du Sabreur de destins',
        'Fatebreaker(?!\')': 'Sabreur de destins',
        'Fragment of Fate': 'fragment du futur',
        'Frozen Mirror': 'miroir de glace',
        'Holy Light': 'lumière sacrée',
        'Ice Veil': 'bloc de glaces éternelles',
        'Oracle of Darkness': 'prêtresse des Ténèbres',
        'Oracle\'s Reflection': 'reflet de la prêtresse',
        'Pandora': 'Pandora-Mitron',
        'Sorrow\'s Hourglass': 'sablier de chagrin',
        'Usurper of Frost': 'Shiva-Mitron',
      },
      'replaceText': {
        'Absolute Zero': 'Zéro absolu',
        'Akh Morn': 'Akh Morn',
        'Akh Rhai': 'Akh Rhai',
        'Apocalypse': 'Apocalypse',
        'Axe Kick': 'Jambe pourfendeuse',
        'Banish III': 'Méga Bannissement',
        'Black Halo': 'Halo de noirceur',
        'Blastburn': 'Explosion brûlante',
        'Blasting Zone': 'Zone de destruction',
        'Bright Hunger': 'Lumière dévorante',
        'Burn Mark': 'Marque explosive',
        'Burnished Glory': 'Halo luminescent',
        'Burnout': 'Combustion totale',
        'Burnt Strike': 'Frappe brûlante',
        'Burst': 'Explosion',
        'Cruel Path of Darkness': 'Voie intense de Ténèbres',
        'Cruel Path of Light': 'Voie intense de Lumière',
        'Crystallize Time': 'Cristallisation temporelle',
        'Cyclonic Break': 'Brisement cyclonique',
        'Dark Aero III': 'Méga Vent ténébreux',
        'Dark Blizzard III': 'Méga Glace ténébreuse',
        'Dark Eruption': 'Éruption ténébreuse',
        'Dark Fire III': 'Méga Feu ténébreux',
        'Dark Water III': 'Méga Eau ténébreuse',
        'Darkest Dance': 'Danse de la nuit profonde',
        'Darklit Dragonsong': 'Chant de Lumière et de Ténèbres',
        'Diamond Dust': 'Poussière de diamant',
        'Drachen Armor': 'Armure des dragons',
        'Edge of Oblivion': 'Oubli proche',
        'Endless Ice Age': 'Déluge de Lumière',
        'Explosion': 'Explosion',
        'Fall Of Faith': 'Section illuminée',
        'Floating Fetters': 'Entraves flottantes',
        'Frigid Needle': 'Dards de glace',
        'Frigid Stone': 'Rocher de glace',
        'Frost Armor': 'Armure de givre',
        'Fulgent Blade': 'Épées rémanentes',
        'Hallowed Ray': 'Rayon Miracle',
        'Hallowed Wings': 'Aile sacrée',
        'Heavenly Strike': 'Frappe céleste',
        'Hell\'s Judgment': 'Jugement dernier',
        'Hiemal Storm': 'Tempête hiémale',
        'Icicle Impact': 'Impact de stalactite',
        'Junction': 'Jonction',
        'Light Rampant': 'Débordement de Lumière',
        'Longing of the Lost': 'Esprit du Dragon divin',
        'Luminous Hammer': 'Érosion lumineuse',
        'Maelstrom': 'Maelström',
        'Materialization': 'Concrétisation',
        'Memory\'s End': 'Mort des souvenirs',
        'Mirror Image': 'Double dans le miroir',
        'Mirror, Mirror': 'Monde des miroirs',
        'Morn Afah': 'Morn Afah',
        'Pandora\'s Box': 'Boîte de Pandore',
        'Paradise Lost': 'Paradis perdu',
        'Paradise Regained': 'Paradis retrouvé',
        'Polarizing Paths': 'Épée astro-ombrale',
        'Polarizing Strikes': 'Épée astro-ombrale',
        'Powder Mark Trail': 'Marquage fatal enchaîné',
        'Powerful Light': 'Explosion sacrée',
        'Quadruple Slap': 'Quadruple gifle',
        'Quicken': 'Accélération',
        'Quietus': 'Quietus',
        'Reflected Scythe Kick': 'Réverbération : Jambe faucheuse',
        '(?<! )Scythe Kick': 'Jambe faucheuse',
        'Shadoweye': 'Œil de l\'ombre',
        'Shell Crusher': 'Broyeur de carapace',
        'Shining Armor': 'Armure scintillante',
        'Shockwave Pulsar': 'Pulsar à onde de choc',
        'Sinblaze': 'Embrasement authentique',
        'Sinbound Blizzard III': 'Méga Glace authentique',
        'Sinbound Fire III': 'Méga Feu authentique',
        'Sinbound Holy': 'Miracle authentique',
        'Sinbound Meltdown': 'Fusion authentique',
        'Sinbound Thunder III': 'Méga Foudre authentique',
        'Sinsmite': 'Éclair du péché',
        'Sinsmoke': 'Flammes du péché',
        '(?<! \\()Slow': 'Lenteur',
        'Somber Dance': 'Danse du crépuscule',
        'Speed': 'Vitesse',
        'Spell-in-Waiting Refrain': 'Déphasage incantatoire',
        'Spirit Taker': 'Arracheur d\'esprit',
        'Stun(?!\\w)': 'Étourdissement',
        'Swelling Frost': 'Vague de glace',
        'The House of Light': 'Raz-de-lumière',
        'The Path of Darkness': 'Voie de Ténèbres',
        'The Path of Light': 'Voie de Lumière',
        'Tidal Light': 'Grand torrent de Lumière',
        'Turn Of The Heavens': 'Cercles rituels',
        'Twin Silence': 'Entaille de la tranquilité',
        'Twin Stillness': 'Entaille de la quiétude',
        'Ultimate Relativity': 'Compression temporelle fatale',
        'Unholy Darkness': 'Miracle ténébreux',
        'Utopian Sky': 'Ultime paradis',
        'Wings Dark and Light': 'Ailes de Lumière et de Ténèbres',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Crystal of Darkness': '闇水晶',
        'Crystal of Light': '光水晶',
        'Delight\'s Hourglass': '楽しみの砂時計',
        'Drachen Wanderer': '聖竜気',
        'Fatebreaker\'s Image': 'フェイトブレイカーの幻影',
        'Fatebreaker(?!\')': 'フェイトブレイカー',
        'Fragment of Fate': '未来の欠片',
        'Frozen Mirror': '氷面鏡',
        'Holy Light': '聖なる光',
        'Ice Veil': '永久氷晶',
        'Oracle of Darkness': '闇の巫女',
        'Oracle\'s Reflection': '巫女の鏡像',
        'Pandora': 'パンドラ・ミトロン',
        'Sorrow\'s Hourglass': '悲しみの砂時計',
        'Usurper of Frost': 'シヴァ・ミトロン',
      },
      'replaceText': {
        'Absolute Zero': '絶対零度',
        'Akh Morn': 'アク・モーン',
        'Akh Rhai': 'アク・ラーイ',
        'Apocalypse': 'アポカリプス',
        'Axe Kick': 'アクスキック',
        'Banish III': 'バニシュガ',
        'Black Halo': 'ブラックヘイロー',
        'Blastburn': 'バーンブラスト',
        'Blasting Zone': 'ブラスティングゾーン',
        'Bright Hunger': '浸食光',
        'Burn Mark': '爆印',
        'Burnished Glory': '光焔光背',
        'Burnout': 'バーンアウト',
        'Burnt Strike': 'バーンストライク',
        'Burst': '爆発',
        'Cruel Path of Darkness': '闇の重波動',
        'Cruel Path of Light': '光の重波動',
        'Crystallize Time': '時間結晶',
        'Cyclonic Break': 'サイクロニックブレイク',
        'Dark Aero III': 'ダークエアロガ',
        'Dark Blizzard III': 'ダークブリザガ',
        'Dark Eruption': 'ダークエラプション',
        'Dark Fire III': 'ダークファイガ',
        'Dark Water III': 'ダークウォタガ',
        'Darkest Dance': '暗夜の舞踏技',
        'Darklit Dragonsong': '光と闇の竜詩',
        'Diamond Dust': 'ダイアモンドダスト',
        'Drachen Armor': 'ドラゴンアーマー',
        'Edge of Oblivion': '忘却の此方',
        'Endless Ice Age': '光の氾濫',
        'Explosion': '爆発',
        'Fall Of Faith': 'シンソイルセヴァー',
        'Floating Fetters': '浮遊拘束',
        'Frigid Needle': 'アイスニードル',
        'Frigid Stone': 'アイスストーン',
        'Frost Armor': 'フロストアーマー',
        'Fulgent Blade': '光塵の剣',
        'Hallowed Ray': 'ホーリーレイ',
        'Hallowed Wings': 'ホーリーウィング',
        'Heavenly Strike': 'ヘヴンリーストライク',
        'Hell\'s Judgment': 'ヘル・ジャッジメント',
        'Hiemal Storm': 'ハイマルストーム',
        'Icicle Impact': 'アイシクルインパクト',
        'Junction': 'ジャンクション',
        'Light Rampant': '光の暴走',
        'Longing of the Lost': '聖竜気',
        'Luminous Hammer': 'ルミナスイロード',
        'Maelstrom': 'メイルシュトローム',
        'Materialization': '具象化',
        'Memory\'s End': 'エンド・オブ・メモリーズ',
        'Mirror Image': '鏡写し',
        'Mirror, Mirror': '鏡の国',
        'Morn Afah': 'モーン・アファー',
        'Pandora\'s Box': 'パンドラの櫃',
        'Paradise Lost': 'パラダイスロスト',
        'Paradise Regained': 'パラダイスリゲイン',
        'Polarizing Paths': '星霊の剣',
        'Polarizing Strikes': '星霊の剣',
        'Powder Mark Trail': '連鎖爆印刻',
        'Powerful Light': '光爆',
        'Quadruple Slap': 'クアドラスラップ',
        'Quicken': 'クイック',
        'Quietus': 'クワイタス',
        'Reflected Scythe Kick': 'ミラーリング・サイスキック',
        '(?<! )Scythe Kick': 'サイスキック',
        'Shadoweye': 'シャドウアイ',
        'Shell Crusher': 'シェルクラッシャー',
        'Shining Armor': 'ブライトアーマー',
        'Shockwave Pulsar': 'ショックウェーブ・パルサー',
        'Sinblaze': 'シンブレイズ',
        'Sinbound Blizzard III': 'シンブリザガ',
        'Sinbound Fire III': 'シンファイガ',
        'Sinbound Holy': 'シンホーリー',
        'Sinbound Meltdown': 'シンメルトン',
        'Sinbound Thunder III': 'シンサンダガ',
        'Sinsmite': 'シンボルト',
        'Sinsmoke': 'シンフレイム',
        '(?<! \\()Slow': 'スロウ',
        'Somber Dance': '宵闇の舞踏技',
        'Speed': 'スピード',
        'Spell-in-Waiting Refrain': 'ディレイスペル・リフレイン',
        'Spirit Taker': 'スピリットテイカー',
        'Stun(?!\\w)': 'スタン',
        'Swelling Frost': '凍波',
        'The House of Light': '光の津波',
        'The Path of Darkness': '闇の波動',
        'The Path of Light': '光の波動',
        'Tidal Light': '光の大波',
        'Turn Of The Heavens': '転輪召',
        'Twin Silence': '閑寂の双剣技',
        'Twin Stillness': '静寂の双剣技',
        'Ultimate Relativity': '時間圧縮・絶',
        'Unholy Darkness': 'ダークホーリー',
        'Utopian Sky': '楽園絶技',
        'Wings Dark and Light': '光と闇の片翼',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Crystal of Darkness': '暗水晶',
        'Crystal of Light': '光水晶',
        'Delight\'s Hourglass': '愉快的沙漏',
        'Drachen Wanderer': '圣龙气息',
        'Fatebreaker\'s Image': '绝命战士的幻影',
        'Fatebreaker(?!\')': '绝命战士',
        'Fragment of Fate': '未来的碎片',
        'Frozen Mirror': '冰面镜',
        'Holy Light': '圣光',
        'Ice Veil': '永久冰晶',
        'Oracle of Darkness': '暗之巫女',
        'Oracle\'s Reflection': '巫女的镜像',
        'Pandora': '潘多拉·米特隆',
        'Sorrow\'s Hourglass': '悲伤的沙漏',
        'Usurper of Frost': '希瓦·米特隆',
      },
      'replaceText': {
        '\\(cast\\)': '(咏唱)',
        '\\(close\\)': '(近)',
        '\\(damage\\)': '(伤害)',
        '\\(far\\)': '(远)',
        '\\(fast\\)': '(快)',
        '\\(fire\\)': '(火)',
        '\\(follow-up\\)': '(后续)',
        '\\(group tower\\)': '(小队塔)',
        '\\(jump\\)': '(跳)',
        '\\(knockback\\)': '(击退)',
        '\\(lightning\\)': '(雷)',
        '\\(normal\\)': '(正常)',
        '\\(puddles\\)': '(圈)',
        '\\(rewind drop\\)': '(放置回返)',
        '\\(slow\\)': '(慢)',
        '\\(solo towers\\)': '(单人塔)',
        '\\(stun \\+ cutscene\\)': '(眩晕 + 动画)',
        '\\(stun \\+ rewind\\)': '(眩晕 + 回返)',
        '\\(targeted\\)': '(定向)',
        '--jump south--': '--跳南--',
        '--Oracle center--': '--巫女中央--',
        '--Oracle targetable--': '--巫女可选中--',
        '--Oracle untargetable--': '--巫女不可选中--',
        '--reposition--': '--归位--',
        '--Usurper untargetable--': '--希瓦·米特隆不可选中--',
        'Absolute Zero': '绝对零度',
        'Akh Morn': '死亡轮回',
        'Akh Rhai': '天光轮回',
        'Apocalypse': '启示',
        'Axe Kick': '阔斧回旋踢',
        'Banish III Divided': '分裂强放逐',
        'Banish III(?! )': '强放逐',
        'Black Halo': '黑色光环',
        'Blastburn': '火燃爆',
        'Blasting Zone': '爆破领域',
        'Bound of Faith': '罪壤刺',
        'Bow Shock': '弓形冲波',
        'Bright Hunger': '侵蚀光',
        'Brightfire': '光炎',
        'Burn Mark': '爆印',
        'Burnished Glory': '光焰圆光',
        'Burnout': '雷燃爆',
        'Burnt Strike': '燃烧击',
        'Burst': '爆炸',
        'Cruel Path of Darkness': '暗之波涛',
        'Cruel Path of Light': '光之波涛',
        'Crystallize Time': '时间结晶',
        'Cyckonic Break': '暴风破',
        'Cyclonic Break': '暴风破',
        'Dark Aero III': '黑暗暴风',
        'Dark Blizzard III': '黑暗冰封',
        'Dark Eruption': '暗炎喷发',
        'Dark Fire III': '黑暗爆炎',
        'Dark Water III': '黑暗狂水',
        'Darkest Dance': '暗夜舞蹈',
        'Darklit Dragonsong': '光与暗的龙诗',
        'Depths of Oblivion': '忘却的彼岸',
        'Diamond Dust': '钻石星尘',
        'Drachen Armor': '圣龙护甲',
        'Edge of Oblivion': '忘却的此岸',
        'Endless Ice Age': '光之泛滥',
        'Explosion': '爆炸',
        'Fall Of Faith': '罪壤断',
        'Fated Burn Mark': '死爆印',
        'Floating Fetters': '浮游拘束',
        'Frigid Needle': '冰针',
        'Frigid Stone': '冰石',
        'Frost Armor': '冰霜护甲',
        'Fulgent Blade': '光尘之剑',
        'Hallowed Ray': '神圣射线',
        'Hallowed Wings': '神圣之翼',
        'Hell\'s Judgment': '地狱审判',
        'Heavenly Strike': '天降一击',
        'Hiemal Ray': '严冬射线',
        'Hiemal Storm': '严冬风暴',
        'Icecrusher': '碎冰击',
        'Icicle Impact': '冰柱冲击',
        'Inescapable Illumination': '曝露光',
        'Junction': '融合',
        'Joyless Dragonsong': '绝望龙诗',
        'Light Rampant': '光之失控',
        'Lightsteep': '过量光',
        'Longing of the Lost': '圣龙气息',
        'Luminous Hammer': '光流侵蚀',
        'Maelstrom': '巨漩涡',
        'Materialization': '赋形',
        'Memory Paradox': '记忆悖论',
        'Memory\'s End': '记忆终结',
        'Mirror Image': '镜中显影',
        'Mirror, Mirror': '镜中奇遇',
        'Morn Afah': '无尽顿悟',
        'Pandora\'s Box': '潘多拉魔盒',
        'Paradise Lost': '失乐园',
        'Paradise Regained': '复乐园',
        'Polarizing Paths': '星灵之剑',
        'Polarizing Strikes': '星灵之剑',
        'Powder Mark Trail': '连锁爆印铭刻',
        'Powerful Light': '光爆',
        'Quadruple Slap': '四剑斩',
        'Quicken': '神速',
        'Quietus': '寂灭',
        'Reflected Scythe Kick': '连锁反射：镰形回旋踢',
        '(?<!Reflected )Scythe Kick': '镰形回旋踢',
        'Refulgent Fate': '光之束缚',
        'Return IV': '强回返',
        'Return': '回返',
        'Shadoweye': '暗影之眼',
        'Shell Crusher': '破盾一击',
        'Shining Armor': '闪光护甲',
        'Shockwave Pulsar': '脉冲星震波',
        'Sinblaze': '罪冰焰',
        'Sinbound Blizzard III': '罪冰封',
        'Sinbound Fire III': '罪爆炎',
        'Sinbound Fire(?! )': '罪火炎',
        'Sinbound Holy': '罪神圣',
        'Sinbound Meltdown': '罪熔毁',
        'Sinbound Thunder III': '罪暴雷',
        'Sinsmite': '罪雷',
        'Sinsmoke': '罪炎',
        '(?<!\\()Slow(?<!\\))': '减速',
        'Solemn Charge': '急冲刺',
        'Somber Dance': '真夜舞蹈',
        'Speed': '限速',
        'Spell-in-Waiting Refrain': '延迟咏唱·递进',
        'Spirit Taker': '碎灵一击',
        'Swelling Frost': '寒波',
        'The House of Light': '光之海啸',
        'The Path of Darkness': '暗之波动',
        'The Path of Light': '光之波动',
        'Tidal Light': '光之巨浪',
        'Turn Of The Heavens': '光轮召唤',
        'Twin Poles': '光与暗的双剑技',
        'Twin Silence': '闲寂的双剑技',
        'Twin Stillness': '静寂的双剑技',
        'Ultimate Relativity': '时间压缩·绝',
        'Unholy Darkness': '黑暗神圣',
        'Unmitigated Explosion': '大爆炸',
        'Utopian Sky': '乐园绝技',
        'Wings Dark and Light': '光与暗的孤翼',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Crystal of Darkness': '', // FIXME '暗水晶'
        // 'Crystal of Light': '', // FIXME '光水晶'
        'Delight\'s Hourglass': '愉快的沙漏',
        'Drachen Wanderer': '聖龍氣息',
        'Fatebreaker\'s Image': '絕命戰士的幻影',
        'Fatebreaker(?!\')': '絕命戰士',
        // 'Fragment of Fate': '', // FIXME '未来的碎片'
        'Frozen Mirror': '冰面鏡',
        'Holy Light': '聖光',
        'Ice Veil': '永久冰晶',
        'Oracle of Darkness': '暗之巫女',
        // 'Oracle\'s Reflection': '', // FIXME '巫女的镜像'
        // 'Pandora': '', // FIXME '潘多拉·米特隆'
        'Sorrow\'s Hourglass': '悲傷的沙漏',
        // 'Usurper of Frost': '', // FIXME '希瓦·米特隆'
      },
      'replaceText': {
        // '\\(cast\\)': '', // FIXME '(咏唱)'
        // '\\(close\\)': '', // FIXME '(近)'
        // '\\(damage\\)': '', // FIXME '(伤害)'
        // '\\(far\\)': '', // FIXME '(远)'
        // '\\(fast\\)': '', // FIXME '(快)'
        // '\\(fire\\)': '', // FIXME '(火)'
        // '\\(follow-up\\)': '', // FIXME '(后续)'
        // '\\(group tower\\)': '', // FIXME '(小队塔)'
        // '\\(jump\\)': '', // FIXME '(跳)'
        // '\\(knockback\\)': '', // FIXME '(击退)'
        // '\\(lightning\\)': '', // FIXME '(雷)'
        // '\\(normal\\)': '', // FIXME '(正常)'
        // '\\(puddles\\)': '', // FIXME '(圈)'
        // '\\(rewind drop\\)': '', // FIXME '(放置回返)'
        // '\\(slow\\)': '', // FIXME '(慢)'
        // '\\(solo towers\\)': '', // FIXME '(单人塔)'
        // '\\(stun \\+ cutscene\\)': '', // FIXME '(眩晕 + 动画)'
        // '\\(stun \\+ rewind\\)': '', // FIXME '(眩晕 + 回返)'
        // '\\(targeted\\)': '', // FIXME '(定向)'
        // '--jump south--': '', // FIXME '--跳南--'
        // '--Oracle center--': '', // FIXME '--巫女中央--'
        // '--Oracle targetable--': '', // FIXME '--巫女可选中--'
        // '--Oracle untargetable--': '', // FIXME '--巫女不可选中--'
        // '--reposition--': '', // FIXME '--归位--'
        // '--Usurper untargetable--': '', // FIXME '--希瓦·米特隆不可选中--'
        'Absolute Zero': '絕對零度',
        'Akh Morn': '死亡輪迴',
        'Akh Rhai': '天光輪迴',
        'Apocalypse': '啟示',
        'Axe Kick': '闊斧迴旋踢',
        'Banish III Divided': '分裂強放逐',
        'Banish III(?! )': '強放逐',
        'Black Halo': '黑色光環',
        'Blastburn': '火燃爆',
        'Blasting Zone': '爆破領域',
        'Bound of Faith': '罪壤刺',
        'Bow Shock': '弓形衝波',
        'Bright Hunger': '侵蝕光',
        'Brightfire': '光炎',
        'Burn Mark': '爆印',
        'Burnished Glory': '光焰圓光',
        'Burnout': '雷燃爆',
        'Burnt Strike': '燃燒擊',
        'Burst': '爆炸',
        // 'Cruel Path of Darkness': '', // FIXME '暗之波涛'
        // 'Cruel Path of Light': '', // FIXME '光之波涛'
        // 'Crystallize Time': '', // FIXME '时间结晶'
        // 'Cyckonic Break': '', // FIXME '暴风破'
        // 'Cyclonic Break': '', // FIXME '暴风破'
        'Dark Aero III': '黑暗大勁風',
        'Dark Blizzard III': '黑暗大暴雪',
        'Dark Eruption': '暗炎噴發',
        'Dark Fire III': '黑暗大火焰',
        'Dark Water III': '黑暗大水花',
        'Darkest Dance': '暗夜舞蹈',
        // 'Darklit Dragonsong': '', // FIXME '光与暗的龙诗'
        // 'Depths of Oblivion': '', // FIXME '忘却的彼岸'
        'Diamond Dust': '鑽石星塵',
        'Drachen Armor': '聖龍護甲',
        // 'Edge of Oblivion': '', // FIXME '忘却的此岸'
        'Endless Ice Age': '光之氾濫',
        'Explosion': '爆炸',
        // 'Fall Of Faith': '', // FIXME '罪壤断'
        // 'Fated Burn Mark': '', // FIXME '死爆印'
        'Floating Fetters': '浮游拘束',
        'Frigid Needle': '冰針',
        'Frigid Stone': '冰石',
        'Frost Armor': '冰霜護甲',
        // 'Fulgent Blade': '', // FIXME '光尘之剑'
        // 'Hallowed Ray': '', // FIXME '神圣射线'
        'Hallowed Wings': '神聖之翼',
        'Hell\'s Judgment': '地獄審判',
        'Heavenly Strike': '極樂冰柱',
        // 'Hiemal Ray': '', // FIXME '严冬射线'
        'Hiemal Storm': '嚴冬風暴',
        // 'Icecrusher': '', // FIXME '碎冰击'
        'Icicle Impact': '冰柱衝擊',
        'Inescapable Illumination': '曝露光',
        // 'Junction': '', // FIXME '融合'
        'Joyless Dragonsong': '絕望龍詩',
        'Light Rampant': '光之失控',
        'Lightsteep': '過量光',
        'Longing of the Lost': '聖龍氣息',
        // 'Luminous Hammer': '', // FIXME '光流侵蚀'
        'Maelstrom': '巨漩渦',
        // 'Materialization': '', // FIXME '赋形'
        // 'Memory Paradox': '', // FIXME '记忆悖论'
        'Memory\'s End': '記憶終結',
        // 'Mirror Image': '', // FIXME '镜中显影'
        'Mirror, Mirror': '鏡中奇遇',
        'Morn Afah': '無盡頓悟',
        // 'Pandora\'s Box': '', // FIXME '潘多拉魔盒'
        'Paradise Lost': '失樂園',
        'Paradise Regained': '複樂園',
        // 'Polarizing Paths': '', // FIXME '星灵之剑'
        // 'Polarizing Strikes': '', // FIXME '星灵之剑'
        // 'Powder Mark Trail': '', // FIXME '连锁爆印铭刻'
        'Powerful Light': '光爆',
        // 'Quadruple Slap': '', // FIXME '四剑斩'
        'Quicken': '神速',
        'Quietus': '寂滅',
        'Reflected Scythe Kick': '連鎖反射：鐮形迴旋踢',
        '(?<!Reflected )Scythe Kick': '鐮形迴旋踢',
        'Refulgent Fate': '光之束縛',
        'Return IV': '強回返',
        'Return': '回返',
        'Shadoweye': '暗影之眼',
        'Shell Crusher': '破盾一擊',
        'Shining Armor': '閃光護甲',
        'Shockwave Pulsar': '脈衝星震波',
        // 'Sinblaze': '', // FIXME '罪冰焰'
        // 'Sinbound Blizzard III': '', // FIXME '罪冰封'
        // 'Sinbound Fire III': '', // FIXME '罪爆炎'
        // 'Sinbound Fire(?! )': '', // FIXME '罪火炎'
        // 'Sinbound Holy': '', // FIXME '罪神圣'
        // 'Sinbound Meltdown': '', // FIXME '罪熔毁'
        // 'Sinbound Thunder III': '', // FIXME '罪暴雷'
        'Sinsmite': '罪雷',
        'Sinsmoke': '罪炎',
        // '(?<!\\()Slow(?<!\\))': '', // FIXME '减速'
        'Solemn Charge': '急衝刺',
        'Somber Dance': '真夜舞蹈',
        'Speed': '限速',
        // 'Spell-in-Waiting Refrain': '', // FIXME '延迟咏唱·递进'
        'Spirit Taker': '碎靈一擊',
        // 'Swelling Frost': '', // FIXME '寒波'
        'The House of Light': '光之海嘯',
        // 'The Path of Darkness': '', // FIXME '暗之波动'
        'The Path of Light': '光之波動',
        // 'Tidal Light': '', // FIXME '光之巨浪'
        'Turn Of The Heavens': '光輪召喚',
        // 'Twin Poles': '', // FIXME '光与暗的双剑技'
        'Twin Silence': '閒寂的雙劍技',
        'Twin Stillness': '寂靜的雙劍技',
        // 'Ultimate Relativity': '', // FIXME '时间压缩·绝'
        'Unholy Darkness': '黑暗神聖',
        'Unmitigated Explosion': '大爆炸',
        // 'Utopian Sky': '', // FIXME '乐园绝技'
        // 'Wings Dark and Light': '', // FIXME '光与暗的孤翼'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Fatebreaker(?!\')': '페이트브레이커',
        'Fatebreaker\'s Image': '페이트브레이커의 환영',
        'Usurper of Frost': '시바 미트론',
        'Oracle\'s Reflection': '무녀의 거울상',
        'Ice Veil': '영구빙정',
        'Frozen Mirror': '얼음 거울',
        'Holy Light': '성스러운 빛',
        'Crystal of Darkness': '어둠의 수정',
        'Crystal of Light': '빛의 수정',
        'Oracle of Darkness': '어둠의 무녀',
        'Fragment of Fate': '미래의 조각',
        'Sorrow\'s Hourglass': '슬픔의 모래시계',
        'Drachen Wanderer': '성룡의 기운',
        'Pandora': '판도라 미트론',
      },
      'replaceText': {
        '\\(cast\\)': '(시전)',
        '\\(close\\)': '(가까이)',
        '\\(damage\\)': '(피해)',
        '\\(far\\)': '(멀리)',
        '\\(fast\\)': '(빠른)',
        '\\(fire\\)': '(불)',
        '\\(follow-up\\)': '(후속타)',
        '\\(group tower\\)': '(4인 탑)',
        '\\(jump\\)': '(점프)',
        '\\(knockback\\)': '(넉백)',
        '\\(lightning\\)': '(번개)',
        '\\(normal\\)': '(중간)',
        '\\(puddles\\)': '(장판)',
        '\\(rewind drop\\)': '(리턴 설치)',
        '\\(slow\\)': '(느린)',
        '\\(solo towers\\)': '(1인 탑)',
        '\\(stun \\+ cutscene\\)': '(기절 + 컷신)',
        '\\(stun \\+ rewind\\)': '(기절 + 리턴)',
        '\\(targeted\\)': '(대상지정)',
        '--jump south--': '--남쪽으로 점프--',
        '--Oracle center--': '--가이아 중앙--',
        '--Oracle targetable--': '--가이아 타겟가능--',
        '--Oracle untargetable--': '--가이아 타겟불가능--',
        '--reposition--': '--재배치--',
        '--Usurper untargetable--': '--시바 타겟불가능--',
        'Blastburn': '연소 폭발',
        'Blasting Zone': '발파 지대',
        'Burn Mark': '폭인',
        'Burnished Glory': '광염광배',
        'Burnout': '완전 연소',
        'Burnt Strike': '연소 공격',
        'Cyclonic Break': '풍속 파괴',
        'Explosion': '폭발',
        'Fall Of Faith': '죄의 소일 참격',
        'Floating Fetters': '부유 구속',
        'Powder Mark Trail': '연쇄 폭인각',
        'Sinblaze': '죄의 불꽃',
        'Sinbound Fire III': '죄의 파이가',
        'Sinbound Thunder III': '죄의 선더가',
        'Sinsmite': '죄의 번개',
        'Sinsmoke': '죄의 화염',
        'Turn Of The Heavens': '빛무리 소환',
        'Utopian Sky': '낙원절기',
        'the Path of Darkness': '어둠의 파동',
        'Cruel Path of Light': '빛의 겹파동',
        'Cruel Path of Darkness': '어둠의 겹파동',
        'Icecrusher': '쇄빙격',
        'Unmitigated Explosion': '대폭발',
        'Solemn Charge': '돌진격',
        'Bow Shock': '원형충격파',
        'Brightfire': '광염',
        'Bound of Faith': '죄의 소일 일격',
        'Edge of Oblivion': '망각의 이편',
        'Mirror, Mirror': '거울 나라',
        'Mirror Image': '거울 비추기',
        'Darkest Dance': '암야의 무도기',
        'Frost Armor': '서리 갑옷',
        'Shining Armor': '빛의 갑옷',
        'Drachen Armor': '용의 갑옷',
        'the Path of Light': '빛의 파동',
        'the House of Light': '빛의 해일',
        'Quadruple Slap': '사중 타격',
        'Twin Stillness': '정적의 쌍검기',
        'Twin Silence': '고요의 쌍검기',
        'Diamond Dust': '다이아몬드 더스트',
        'Icicle Impact': '고드름 낙하',
        'Frigid Stone': '얼음돌',
        'Frigid Needle': '얼음바늘',
        'Axe Kick': '도끼차기',
        '(?<!Reflected )Scythe Kick': '낫차기',
        'Reflected Scythe Kick': '반사된 낫차기',
        'Heavenly Strike': '천상의 일격',
        'Sinbound Holy': '죄의 홀리',
        'Hallowed Ray': '신성한 광선',
        'Light Rampant': '빛의 폭주',
        'Bright Hunger': '침식광',
        'Inescapable Illumination': '폭로광',
        'Refulgent Fate': '빛의 저주',
        'Lightsteep': '과잉광',
        'Powerful Light': '빛의 폭발',
        'Luminous Hammer': '빛의 마멸',
        'Burst': '폭발',
        'Banish III(?! )': '배니시가',
        'Banish III Divided': '분열된 배니시가',
        'Absolute Zero': '절대영도',
        'Swelling Frost': '서리 파동',
        'Junction': '접속',
        'Hallowed Wings': '신성한 날개',
        'Wings Dark and Light': '빛과 어둠의 날개',
        'Polarizing Paths': '극성의 검',
        'Sinbound Meltdown': '죄의 멜튼',
        'Sinbound Fire(?! )': '죄의 파이어',
        'Akh Rhai': '아크 라이',
        'Darklit Dragonsong': '빛과 어둠의 용시',
        'Crystallize Time': '시간의 결정체',
        'Longing of the Lost': '성룡의 기운',
        'Joyless Dragonsong': '절망의 용시',
        'Materialization': '형상화',
        'Akh Morn': '아크 몬',
        'Morn Afah': '몬 아파',
        'Tidal Light': '빛의 너울',
        'Hiemal Storm': '동장군 폭풍',
        'Hiemal Ray': '동장군 광선',
        'Sinbound Blizzard III': '죄의 블리자가',
        'Endless Ice Age': '빛의 범람',
        'Depths of Oblivion': '망각의 저편',
        'Memory Paradox': '기억의 역설',
        'Paradise Lost': '실낙원',
        'Hell\'s Judgment': '황천의 심판',
        'Ultimate Relativity': '시간 압축: 절',
        'Return': '리턴',
        'Return IV': '리턴쟈',
        'Spell-in-Waiting Refrain': '단계적 지연술',
        'Dark Water III': '다크 워터가',
        'Dark Eruption': '어둠의 불기둥',
        'Dark Fire III': '다크 파이가',
        'Unholy Darkness': '다크 홀리',
        'Shadoweye': '그림자 시선',
        'Dark Blizzard III': '다크 블리자가',
        'Dark Aero III': '다크 에어로가',
        'Quietus': '종지부',
        'Shockwave Pulsar': '맥동 충격파',
        'Somber Dance': '어스름 무도기',
        'Shell Crusher': '외피 파쇄',
        'Spirit Taker': '영혼 탈취',
        'Black Halo': '검은 빛무리',
        'Speed': '속도 조절',
        'Quicken': '가속',
        '(?<!\\()Slow(?<!\\))': '감속',
        'Apocalypse': '대재앙',
        'Maelstrom': '대격동',
        'Memory\'s End': '기억의 끝',
        'Fulgent Blade': '빛먼지 검',
        'Polarizing Strikes': '극성의 검',
        'Paradise Regained': '복낙원',
        'Twin Poles': '빛과 어둠의 쌍검기',
        'Pandora\'s Box': '판도라의 상자',
        'Fated Burn Mark': '사폭인',
      },
    },
  ],
};

export default triggerSet;
