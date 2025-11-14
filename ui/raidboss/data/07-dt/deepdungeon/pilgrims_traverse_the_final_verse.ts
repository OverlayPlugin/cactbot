import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stone 99/The Final Verse

// TODO: timeline

// === Map Effect info: ===
// --- Bounds of Sin walls ---
// locations:
//       00
//    0B    01
//  0A        02
// 09          03
//  08        04
//    07    05
//       06
//
// flags:
// 00020001 - walls appearing
// 00080004 - walls disappearing
//
// --- Spinelash glass walls ---
// locations:
// 18 | 19 | 1A
//
// flags:
// 00020001 - glass breaking first time
// 00200010 - glass breaking second time

// === Abyssal Blaze (exaflares) ===
// possible exaflare starting locations [x, y]:
// [-582.019, -288.003]
// [-582.019, -311.991]
// [-588.000, -294.015]
// [-588.000, -306.009]
// [-594.012, -299.997]
// [-599.994, -294.015]
// [-599.994, -306.009]
// [-606.006, -299.997]
// [-612.018, -294.015]
// [-612.018, -306.009]
// [-618.000, -288.003]
// [-618.000, -311.991]

const center = {
  'x': -600,
  'y': -300,
} as const;

type DirectionOutput12 =
  | 'dirN'
  | 'dirNNE'
  | 'dirENE'
  | 'dirE'
  | 'dirESE'
  | 'dirSSE'
  | 'dirS'
  | 'dirSSW'
  | 'dirWSW'
  | 'dirW'
  | 'dirWNW'
  | 'dirNNW'
  | 'unknown';

const output12Dir: DirectionOutput12[] = [
  'dirN',
  'dirNNE',
  'dirENE',
  'dirE',
  'dirESE',
  'dirSSE',
  'dirS',
  'dirSSW',
  'dirWSW',
  'dirW',
  'dirWNW',
  'dirNNW',
];

const outputStrings12Dir: OutputStrings = {
  dirN: Outputs.dirN,
  dirNNE: Outputs.dirNNE,
  dirENE: Outputs.dirENE,
  dirE: Outputs.dirE,
  dirESE: Outputs.dirESE,
  dirSSE: Outputs.dirSSE,
  dirS: Outputs.dirS,
  dirSSW: Outputs.dirSSW,
  dirWSW: Outputs.dirWSW,
  dirW: Outputs.dirW,
  dirWNW: Outputs.dirWNW,
  dirNNW: Outputs.dirNNW,
  unknown: Outputs.unknown,
};

const xyTo12DirNum = (x: number, y: number, centerX: number, centerY: number): number => {
  // N = 0, NNE = 1, ..., NNW = 12
  x = x - centerX;
  y = y - centerY;
  return Math.round(6 - 6 * Math.atan2(x, y) / Math.PI) % 12;
};

const outputFrom12DirNum = (dirNum: number): DirectionOutput12 => {
  return output12Dir[dirNum] ?? 'unknown';
};

const chainsOfCondemnationOutputStrings = {
  chains: {
    en: 'AoE + Stop Moving!',
    de: 'AoE + Nicht Bewegen!',
    ja: '全体攻撃 + 止まれ!',
    cn: 'AOE + 停止移动!',
    ko: '전체 공격 + 이동 멈추기!',
  },
} as const;

export interface Data extends RaidbossData {
  myVengeanceExpiration?: number;
  sidesMiddle?: 'sides' | 'middle';
  ballChains?: 'ball' | 'chains';
  walls?: number[];
  abyssalSides: boolean;
  abyssalFrontBack?: 'front' | 'back';
  abyssalLeftRight?: 'left' | 'right';
  exaflares?: number[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheFinalVerse',
  zoneId: [
    ZoneId.PilgrimsTraverseStones91_100,
    ZoneId.TheFinalVerse,
  ],
  zoneLabel: {
    en: 'Pilgrim\'s Traverse Stone 99/The Final Verse',
    de: 'Pilgers Pfad Stein 99/Eminente Trauer',
    cn: '朝圣交错路 第99朝圣路/卓异的悲寂歼灭战',
  },

  initData: () => ({
    abyssalSides: false,
  }),

  triggers: [
    // ---------------- Stone 99/The Final Verse Boss: Eminent Grief/Devoured Eater ----------------
    {
      id: 'PT 99 HP Difference Warning',
      // 9F6 = Damage Up
      // 105F = Rehabilitation
      type: 'GainsEffect',
      netRegex: {
        effectId: ['9F6', '105F'],
        target: ['Eminent Grief', 'Devoured Eater'],
        capture: false,
      },
      suppressSeconds: 1,
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Check Boss HP Difference',
          cn: '检查 BOSS 血量差',
        },
      },
    },
    {
      id: 'PT 99 Petrification/Hysteria',
      // 01 = Petrification (failure from Light Vengeance expiring)
      // 128 = Hysteria (failure from Dark Vengeance expiring)
      type: 'GainsEffect',
      netRegex: { effectId: ['01', '128'], capture: true },
      infoText: (_data, matches, output) => {
        const effect = matches.effect;
        const target = matches.target;
        return output.text!({ effect: effect, target: target });
      },
      outputStrings: {
        text: {
          en: '${effect} on ${target}',
          cn: '${effect} 点 ${target}',
        },
      },
    },
    {
      id: 'PT 99 Light/Dark Vengeance Refresh Warning',
      // 11CF = Dark Vengeance
      // 11D0 = Light Vengeance
      type: 'GainsEffect',
      netRegex: { effectId: ['11CF', '11D0'], capture: true },
      condition: Conditions.targetIsYou(),
      preRun: (data, matches) => {
        const timestamp = Date.parse(matches.timestamp);
        const duration = parseFloat(matches.duration);
        data.myVengeanceExpiration = timestamp + duration * 1000;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 10,
      infoText: (data, matches, output) => {
        const timestamp = Date.parse(matches.timestamp);
        const duration = parseFloat(matches.duration);
        const thisExpiration = timestamp + duration * 1000;
        const myExpiration = data.myVengeanceExpiration;
        if (myExpiration === undefined || myExpiration > thisExpiration)
          return;
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Refresh Vengeance',
          cn: '刷新光/暗 Debuff',
        },
      },
    },
    {
      id: 'PT 99 Devoured Eater Blade of First Light',
      type: 'StartsUsing',
      netRegex: { id: ['AC21', 'AC22', 'AC27', 'AC28'], source: 'Devoured Eater', capture: true },
      preRun: (data, matches) => {
        const id = matches.id;
        if (id === 'AC21' || id === 'AC27') {
          data.sidesMiddle = 'sides';
        } else {
          data.sidesMiddle = 'middle';
        }
      },
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC21' || id === 'AC22')
          return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
        return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'PT 99 Eminent Grief Ball of Fire',
      type: 'StartsUsing',
      netRegex: { id: ['AC1D', 'AC24'], source: 'Eminent Grief', capture: true },
      preRun: (data, _matches) => data.ballChains = 'ball',
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC1D')
          return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
        return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'PT 99 Eminent Grief Ball of Fire Move',
      type: 'Ability',
      netRegex: { id: ['AC1D', 'AC24'], source: 'Eminent Grief', capture: false },
      response: Responses.moveAway('alert'),
    },
    {
      id: 'PT 99 Eminent Grief Chains of Condemnation',
      // raidwide + applies 11D2 Chains of Condemnation for 3s; heavy damage if moving
      type: 'StartsUsing',
      netRegex: { id: ['AC20', 'AC26'], source: 'Eminent Grief', capture: true },
      preRun: (data, _matches) => data.ballChains = 'chains',
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC20')
          return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
        return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'PT 99 Blade/Ball/Chains Cleanup',
      type: 'Ability',
      netRegex: {
        id: ['AC29', 'AC24', 'AC26'],
        source: ['Eminent Grief', 'Devoured Eater'],
        capture: false,
      },
      suppressSeconds: 1,
      run: (data, _matches) => {
        delete data.ballChains;
        delete data.sidesMiddle;
      },
    },
    {
      id: 'PT 99 Devoured Eater Bounds of Sin',
      // applies 119E Bind for 3s
      type: 'Ability',
      netRegex: { id: 'AC32', source: 'Devoured Eater', capture: false },
      delaySeconds: 3,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'PT 99 Eminent Grief Spinelash Bait',
      // laser will break glass + summon add if it hits a window
      type: 'HeadMarker',
      netRegex: { id: '00EA', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Laser on YOU',
          de: 'Laser auf DIR',
          ja: '自分にレーザー',
          cn: '激光点名',
          ko: '레이저 대상자',
        },
      },
    },
    {
      id: 'PT 99 Eminent Grief Spinelash',
      type: 'StartsUsing',
      netRegex: { id: 'B03E', source: 'Eminent Grief', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid laser',
          de: 'Laser vermeiden',
          ja: 'レーザーを避ける',
          cn: '避开激光',
          ko: '레이저 피하기',
        },
      },
    },
    {
      id: 'PT 99 Vodoriga Minion Spawn',
      // 14039 = Vodoriga Minion
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14039', capture: false },
      response: Responses.killExtraAdd(),
    },
    {
      id: 'PT 99 Eminent Grief Drain Aether',
      // AC38 = short cast
      // AC39 = long cast
      // [AC3B, AC3D] = failstate casts?
      type: 'StartsUsing',
      netRegex: { id: ['AC38', 'AC39'], source: 'Eminent Grief', capture: true },
      delaySeconds: (_data, matches) =>
        matches.id === 'AC38' ? 0 : parseFloat(matches.castTime) - 5,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Light debuff',
          de: 'Licht Debuff nehmen',
          ja: '光デバフを受ける',
          cn: '获取光 Debuff',
          ko: '빛 디버프 받기',
        },
      },
    },
    {
      id: 'PT 99 Devoured Eater Drain Aether',
      // AC3A = short cast
      // AC3C = long cast
      type: 'StartsUsing',
      netRegex: { id: ['AC3A', 'AC3C'], source: 'Devoured Eater', capture: true },
      delaySeconds: (_data, matches) =>
        matches.id === 'AC3A' ? 0 : parseFloat(matches.castTime) - 4,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Dark debuff',
          de: 'Dunkel Debuff nehmen',
          ja: '闇デバフを受ける',
          cn: '获取暗 Debuff',
          ko: '어둠 디버프 받기',
        },
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze Front/Back Safe Spot',
      // AC2A = first cast, horizontal exaflares, front safe
      // AC2B = first cast, vertical exaflares, left or right safe
      // AC2C = second instant cast, horizontal exaflares, back safe
      // AC2D = second instant cast, vertical exaflares, left or right safe
      // AC2E = used approximately 7s after each horizontal/vertical indicator, may have good data for starting positions
      // AC2F = diamonds glow, exaflares start at end of cast
      // AC30 = instant, exaflare explosion/damage
      type: 'Ability',
      netRegex: { id: ['AC2A', 'AC2C'], source: 'Eminent Grief', capture: true },
      preRun: (data, matches) => {
        const id = matches.id;
        id === 'AC2A' ? data.abyssalFrontBack = 'front' : data.abyssalFrontBack = 'back';
        data.abyssalSides = false;
      },
      infoText: (data, _matches, output) => {
        const frontBack = data.abyssalFrontBack;
        const leftRight = data.abyssalLeftRight;
        if (frontBack === undefined || leftRight === undefined)
          return;

        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, for later',
          cn: '稍后去 ${leftRight}-${frontBack}',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze Left/Right Collector',
      type: 'Ability',
      netRegex: { id: ['AC2B', 'AC2D'], source: 'Eminent Grief', capture: false },
      run: (data, _matches) => {
        data.abyssalSides = true;
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze Left/Right Safe Spot',
      type: 'AbilityExtra',
      netRegex: { id: 'AC2E', capture: true },
      condition: (data) => data.abyssalSides,
      preRun: (data, matches) => {
        const x = parseFloat(matches.x);
        (data.exaflares ??= []).push(x);

        if (data.exaflares === undefined || data.exaflares.length < 4)
          return;

        const exas = data.exaflares.sort((a, b) => a - b);
        const [x1, x4] = [exas[0], exas[3]];
        if (x1 === undefined || x4 === undefined)
          throw new UnreachableCode();

        if (x1 < -615) {
          data.abyssalLeftRight = 'right';
        } else if (x4 > -585) {
          data.abyssalLeftRight = 'left';
        }
      },
      infoText: (data, _matches, output) => {
        const frontBack = data.abyssalFrontBack;
        const leftRight = data.abyssalLeftRight;
        if (frontBack === undefined || leftRight === undefined)
          return;

        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, for later',
          cn: '稍后去 ${leftRight}-${frontBack}',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze',
      type: 'StartsUsing',
      netRegex: { id: 'AC2F', source: 'Eminent Grief', capture: false },
      durationSeconds: 16,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const frontBack = data.abyssalFrontBack === undefined ? 'unknown' : data.abyssalFrontBack;
        const leftRight = data.abyssalLeftRight === undefined ? 'unknown' : data.abyssalLeftRight;

        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      run: (data) => {
        data.abyssalSides = false;
        delete data.abyssalFrontBack;
        delete data.abyssalLeftRight;
        delete data.exaflares;
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, Avoid Exaflares',
          cn: '在 ${leftRight}-${frontBack} 躲避地火',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'PT 99 Bounds of Sin Dodge Direction',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AC33', capture: true },
      suppressSeconds: (data) => {
        const walls = data.walls;
        if (walls === undefined || walls.length < 1)
          return 0;
        return 6.5;
      },
      infoText: (data, matches, output) => {
        const [x, y] = [parseFloat(matches.x), parseFloat(matches.y)];
        const dir = xyTo12DirNum(x, y, center.x, center.y);
        (data.walls ??= []).push(dir);

        const walls = data.walls;
        if (walls === undefined || walls.length < 2)
          return;

        const [wall1, wall2] = [walls[0], walls[1]];
        if (wall1 === undefined || wall2 === undefined)
          throw new UnreachableCode();

        const isCW = wall2 - wall1 === 1 || wall1 - wall2 === 11;
        const isCCW = wall1 - wall2 === 1 || wall2 - wall1 === 11;
        const rotationDir = isCW ? 'cw' : isCCW ? 'ccw' : undefined;

        if (rotationDir === undefined)
          return output.text!({ dir: output.unknown!() });

        if (rotationDir === 'cw') {
          const dodgeDir = outputFrom12DirNum((wall2 + 10) % 12);
          return output.text!({ dir: output[dodgeDir]!() });
        }
        const dodgeDir = outputFrom12DirNum((wall1 + 1) % 12);
        return output.text!({ dir: output[dodgeDir]!() });
      },
      outputStrings: {
        text: {
          en: 'Go ${dir}',
          cn: '去 ${dir}',
        },
        unknown: Outputs.unknown,
        ...outputStrings12Dir,
      },
    },
    {
      id: 'PT 99 Bounds of Sin Dodge Direction Cleanup',
      type: 'Ability',
      netRegex: { id: 'AC34', source: 'Devoured Eater', capture: false },
      run: (data, _matches, _output) => delete data.walls,
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Devoured Eater': 'erodiert(?:e|er|es|en) Sündenvertilger',
        'Eminent Grief': 'Eminent(?:e|er|es|en) Trauer',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Devoured Eater': 'purgateur dévoré',
        'Eminent Grief': 'Pontife du Chagrin',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Devoured Eater': '侵蝕された罪喰い',
        'Eminent Grief': 'エミネントグリーフ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Devoured Eater': '被侵蚀的食罪灵',
        'Eminent Grief': '卓异的悲寂',
      },
    },
  ],
};

export default triggerSet;
