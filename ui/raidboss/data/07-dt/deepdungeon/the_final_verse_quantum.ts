import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse: The Final Verse (Quantum)

// === Quantum mechanical changes ===
// --- Q15 ---
// 180s Light/Dark Vengeance
// bosses must be within 25% HP difference
// no Light Vengeance required to soak towers, no bleed from towers
// 8x exaflares
// no fire-cross/burns from Burning Chains
// healer Shackles of Sanctity only
// 8s Doom from Sin Bearer
// 4x Flameborn
//
// --- Q20 ---
// 180s Light/Dark Vengeance
// bosses must be within 25% HP difference
// no Light Vengeance required to soak towers, no bleed from towers
// 8x exaflares
// fire-cross/burns from Searing Chains
// healer Shackles of Sanctity only
// 8s Doom from Sin Bearer
// 4x Flameborn
//
// --- Q25 ---
// 120s Light/Dark Vengeance
// bosses must be within 20% HP difference
// no Light Vengeance required to soak towers, no bleed from towers
// 8x exaflares
// fire-cross/burns from Searing Chains
// healer + dps Shackles of Sanctity
// 6s Doom from Sin Bearer
// 4x Flameborn
//
// --- Q30 ---
// 120s Light/Dark Vengeance
// bosses must be within 20% HP difference
// no Light Vengeance required to soak towers, no bleed from towers
// 12x exaflares
// fire-cross/burns from Searing Chains
// healer + dps Shackles of Sanctity
// 6s Doom from Sin Bearer
// 4x Flameborn
//
// --- Q35 ---
// 120s Light/Dark Vengeance
// bosses must be within 15% HP difference
// Light Vengeance required to soak towers, bleed from towers
// 12x exaflares
// fire-cross/burns from Searing Chains
// healer + dps Shackles of Sanctity
// 6s Doom from Sin Bearer
// 4x Flameborn
//
// --- Q40 ---
// 60s Light/Dark Vengeance
// bosses must be within 15% HP difference
// Light Vengeance required to soak towers, bleed from towers
// 12x exaflares
// fire-cross/burns from Searing Chains
// healer + dps Shackles of Sanctity
// 4s Doom from Sin Bearer
// 5x Flameborn

// === Map Effect info ===
// --- Bounds of Sin walls ---
// locations (inward-facing, center not safe):
//       00
//    0B    01
//  0A        02
// 09          03
//  08        04
//    07    05
//       06
//
// locations (outward-facing, center safe):
//       0C
//    17    0D
//  16        0E
// 15          0F
//  14        10
//    13    11
//       12
//
// flags:
// 00020001 - walls appearing
// 00080004 - walls disappearing
//
// --- Abyssal Sun towers ---
// locations:
// 1B | 1C
// ---+---
// 1D | 1E
//
// flags:
// 00020001 - towers appearing
// 00200010 - standing in a tower
// 00080004 - towers disappearing
// 00800040 - tower exploding from failure to soak?
//
// --- Spinelash glass walls ---
// locations:
// 18 | 19 | 1A
//
// flags:
// 00020001 - glass breaking first time
// 00200010 - glass breaking second time

// === Abyssal Blaze (Q15-25 exaflares) ===
// first 4 starting locations (same regardless of front or back safe) [x, y]:
// --- set 1 ---
// [-618.000, -288.003]
// [-612.018, -294.015]
// [-606.006, -299.997]
// [-599.994, -306.009]
//
// --- set 2 ---
// [-599.994, -306.009]
// [-594.012, -299.997]
// [-588.000, -294.015]
// [-582.019, -288.003]

// === Scourging Blaze (Q30-40 exaflares) ===
// first 6 starting locations (same regardless of front or back safe) [x, y]:
// --- set 1 ---
// [-618.000, -288.003]
// [-612.018, -294.015]
// [-606.006, -299.997]
// [-599.994, -306.009]
// [-588.000, -303.018]
// [-582.019, -290.994]
//
// --- set 2 ---
// [-618.000, -290.994]
// [-612.018, -303.018]
// [-599.994, -306.009]
// [-594.012, -299.997]
// [-588.000, -294.015]
// [-582.019, -288.003]

const headMarkerData = {
  // vfx/lockon/eff/lockon5_t0h
  spinelashTarget: '0017',
  // vfx/lockon/eff/m0344trg_a0h
  lightPartnerStack: '004D',
  // vfx/lockon/eff/m0344trg_b0h
  darkPartnerStack: '004E',
  // vfx/lockon/eff/m0376trg_fire3_a0p
  searingChains: '0061',
  // vfx/lockon/eff/share_laser_3sec_0t
  lineStackMarker: '020F', // on boss
} as const;

const tetherData = {
  // chn_fire001f
  hellishEarth: '0005',
  // chn_hfchain1f
  searingChains: '0009',
} as const;

const center = {
  x: -600,
  y: -300,
} as const;

const output12Dir = [
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
] as const;

type DirectionOutput12 = typeof output12Dir[number] | 'unknown';

const outputStrings12Dir: { [key in DirectionOutput12]: OutputStrings[string] } = {
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
} as const;

const xyTo12DirNum = (x: number, y: number, centerX: number, centerY: number): number => {
  // N = 0, NNE = 1, ..., NNW = 12
  x = x - centerX;
  y = y - centerY;
  return Math.round(6 - 6 * Math.atan2(x, y) / Math.PI) % 12;
};

const hdgTo12DirNum = (heading: number): number => {
  // N = 0, NNE = 1, ..., NNW = 12
  return (Math.round(6 - 6 * heading / Math.PI) % 12 + 12) % 12;
};

const outputFrom12DirNum = (dirNum: number): DirectionOutput12 => {
  return output12Dir[dirNum] ?? 'unknown';
};

const boundsOfSinSingleWall = (count: number): boolean => {
  // returns true if this Bounds of Sin cast is single sequential walls
  // or false for double sequential walls
  console.assert(count >= 1 && count <= 5);
  switch (count) {
    case 1:
      return false;
    case 2:
      return true;
    case 3:
      return false;
    case 4:
      return true;
    case 5:
      return true;
    default:
      throw new UnreachableCode();
  }
};

const chainsOfCondemnationOutputStrings = {
  chains: {
    en: 'AoE + Stop Moving!',
    de: 'AoE + Nicht Bewegen!',
    ja: '全体攻撃 + 止まれ!',
    cn: 'AOE + 停止移动!',
    ko: '전체 공격 + 이동 멈추기!',
    tc: 'AOE + 停止移動!',
  },
} as const;

type Offerings = {
  hpBoost: number;
  physicalDamageUp: number;
  fireDamageUp: number;
  darkDamageUp: number;
  lightDamageUp: number;
};

export interface Data extends RaidbossData {
  offerings: Offerings;
  quantumLevel: number;
  myVengeanceExpiration?: number;
  abyssalScourging?: 'abyssal' | 'scourging';
  exaflaresFrontBack: 'front' | 'back' | 'unknown';
  exaflaresLeftRight: 'left' | 'right' | 'unknown';
  exaflares?: number[];
  boundsOfSin: number;
  walls?: number[];
  sidesMiddle?: 'sides' | 'middle';
  ballChains?: 'ball' | 'chains';
  hellishEarth: boolean;
  eruptions: number;
  manifoldLashings?: 'left' | 'right';
  sinBearer: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'TheFinalVerseQuantum',
  zoneId: ZoneId.TheFinalVerseQuantum,
  timelineFile: 'the_final_verse_quantum.txt',
  comments: {
    en: 'Q15-40',
    de: 'Q15-40',
    cn: '15-40 贡品',
  },

  initData: () => ({
    offerings: {
      hpBoost: 0,
      physicalDamageUp: 0,
      fireDamageUp: 0,
      darkDamageUp: 0,
      lightDamageUp: 0,
    },
    quantumLevel: 0,
    exaflaresFrontBack: 'unknown',
    exaflaresLeftRight: 'unknown',
    boundsOfSin: 0,
    hellishEarth: false,
    eruptions: 0,
    sinBearer: false,
  }),

  timelineTriggers: [
    {
      id: 'Final Verse Quantum Abyssal Sun Light Vengeance',
      // instant cast
      regex: /Abyssal Sun/,
      beforeSeconds: 16,
      condition: (data) => data.quantumLevel >= 35,
      infoText: (_data, _matches, output) => output.q40!(),
      outputStrings: {
        q40: {
          en: 'Get Light Vengeance',
          de: 'Nimm Echo des Lichts',
          cn: '踩光',
        },
      },
    },
    {
      id: 'Final Verse Quantum Abyssal Dawn/Sun Towers',
      // instant cast
      regex: /Abyssal Sun/,
      beforeSeconds: 4,
      alertText: (data, _matches, output) => {
        if (data.quantumLevel < 35)
          return output.q15!();
        return output.q40!();
      },
      outputStrings: {
        q15: {
          en: 'Get Towers => AoE',
          de: 'Geh in die Türme => AoE',
          cn: '踩塔 => AOE',
        },
        q40: {
          en: 'Get Towers => AoE + Bleed',
          de: 'Geh in die Türme => AoE + Blutubg',
          cn: '踩塔 => AOE + 流血',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'Final Verse Quantum Offerings Collector',
      type: 'GainsEffect',
      netRegex: {
        effectId: ['24A', '3FA', '11DA', '11DB', '11DC'],
        target: ['Eminent Grief', 'Devoured Eater'],
        capture: true,
      },
      run: (data, matches) => {
        const id = matches.effectId;
        const count = parseInt(matches.count, 16);
        switch (id) {
          case '24A':
            data.offerings.hpBoost = count;
            break;
          case '3FA':
            data.offerings.physicalDamageUp = count;
            break;
          case '11DA':
            data.offerings.fireDamageUp = count;
            break;
          case '11DB':
            data.offerings.darkDamageUp = count;
            break;
          case '11DC':
            data.offerings.lightDamageUp = count;
            break;
        }
        const offerings = data.offerings;
        const sum = Object.values(offerings).reduce((a, b) => a + b, 0);
        data.quantumLevel = sum;
      },
    },
    {
      id: 'Final Verse Quantum HP Difference Warning',
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
          de: 'Prüfe Boss HP Unterschied',
          cn: '检查 BOSS 血量差',
          ko: '보스 체력 차이 확인',
          tc: '檢查 BOSS 血量差',
        },
      },
    },
    {
      id: 'Final Verse Quantum Petrification/Hysteria',
      // 01 = Petrification (from Light Vengeance expiring)
      // 128 = Hysteria (from Dark Vengeance expiring)
      type: 'GainsEffect',
      netRegex: { effectId: ['01', '128'], capture: true },
      infoText: (data, matches, output) => {
        const effect = matches.effect;
        const target = matches.target;
        return output.text!({ effect: effect, player: data.party.member(target) });
      },
      outputStrings: {
        text: {
          en: '${effect} on ${player}',
          de: '${effect} auf ${player}',
          cn: '${effect} 点 ${player}',
          ko: '${player}에게 ${effect}',
          tc: '${effect} 點 ${player}',
        },
      },
    },
    {
      id: 'Final Verse Quantum Light/Dark Vengeance Refresh Warning',
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
          de: 'Echo erneuern',
          cn: '刷新光/暗 Debuff',
          ko: '빛/어둠 디버프 갱신',
          tc: '刷新光/暗 Debuff',
        },
      },
    },
    {
      id: 'Final Verse Quantum Abyssal Blaze Front/Back',
      type: 'StartsUsing',
      netRegex: { id: ['AC4F', 'AC50'], source: 'Eminent Grief', capture: true },
      run: (data, matches) => {
        const id = matches.id;
        id === 'AC4F' ? data.exaflaresFrontBack = 'front' : data.exaflaresFrontBack = 'back';
        data.abyssalScourging = 'abyssal';
      },
    },
    {
      id: 'Final Verse Quantum Abyssal Blaze Left/Right',
      type: 'AbilityExtra',
      netRegex: { id: 'AC53', capture: true },
      condition: (data) => {
        return data.abyssalScourging === 'abyssal' &&
          (data.exaflares === undefined || data.exaflares.length < 4);
      },
      infoText: (data, matches, output) => {
        const x = parseFloat(matches.x);
        (data.exaflares ??= []).push(x);

        if (data.exaflares === undefined || data.exaflares.length < 4)
          return;

        const exas = data.exaflares.sort((a, b) => a - b);
        const [x1, x4] = [exas[0], exas[3]];
        if (x1 === undefined || x4 === undefined)
          throw new UnreachableCode();

        const frontBack = data.exaflaresFrontBack;
        if (frontBack === 'unknown')
          return output.text!({ frontBack: output.unknown!(), leftRight: output.unknown!() });

        if (x1 < -615) {
          data.exaflaresLeftRight = frontBack === 'front' ? 'left' : 'right';
        } else if (x4 > -585) {
          data.exaflaresLeftRight = frontBack === 'front' ? 'right' : 'left';
        }

        const leftRight = data.exaflaresLeftRight;
        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, for later',
          de: '${frontBack}-${leftRight}, für später',
          cn: '稍后去 ${leftRight}-${frontBack}',
          ko: '나중에 ${leftRight}-${frontBack} 으로',
          tc: '稍後去 ${leftRight}-${frontBack}',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Final Verse Quantum Scourging Blaze Front/Back',
      type: 'StartsUsing',
      netRegex: { id: ['AEFD', 'AEFE'], source: 'Eminent Grief', capture: true },
      run: (data, matches) => {
        const id = matches.id;
        id === 'AEFD' ? data.exaflaresFrontBack = 'front' : data.exaflaresFrontBack = 'back';
        data.abyssalScourging = 'scourging';
      },
    },
    {
      id: 'Final Verse Quantum Scourging Blaze Left/Right',
      type: 'AbilityExtra',
      netRegex: { id: 'AC53', capture: true },
      condition: (data) => {
        return data.abyssalScourging === 'scourging' &&
          (data.exaflares === undefined || data.exaflares.length < 6);
      },
      infoText: (data, matches, output) => {
        const x = parseFloat(matches.x);
        (data.exaflares ??= []).push(x);

        if (data.exaflares === undefined || data.exaflares.length < 6)
          return;

        const exas = data.exaflares.sort((a, b) => a - b);
        const [x3, x4] = [exas[2], exas[3]];
        if (x3 === undefined || x4 === undefined)
          throw new UnreachableCode();

        const frontBack = data.exaflaresFrontBack;
        if (frontBack === 'unknown')
          return output.text!({ frontBack: output.unknown!(), leftRight: output.unknown!() });

        if (x3 < -603) {
          data.exaflaresLeftRight = frontBack === 'front' ? 'left' : 'right';
        } else if (x4 > -597) {
          data.exaflaresLeftRight = frontBack === 'front' ? 'right' : 'left';
        }

        const leftRight = data.exaflaresLeftRight;
        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, for later',
          de: '${frontBack}-${leftRight}, für später',
          cn: '稍后去 ${leftRight}-${frontBack}',
          ko: '나중에 ${leftRight}-${frontBack} 으로',
          tc: '稍後去 ${leftRight}-${frontBack}',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Final Verse Quantum Abyssal/Scourging Blaze Exaflares',
      type: 'StartsUsing',
      netRegex: { id: ['AC54', 'AC56'], source: 'Eminent Grief', capture: false },
      durationSeconds: 14,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const frontBack = data.exaflaresFrontBack;
        const leftRight = data.exaflaresLeftRight;

        return output.text!({ frontBack: output[frontBack]!(), leftRight: output[leftRight]!() });
      },
      run: (data) => {
        data.exaflaresFrontBack = 'unknown';
        data.exaflaresLeftRight = 'unknown';
        delete data.abyssalScourging;
        delete data.exaflares;
      },
      outputStrings: {
        text: {
          en: '${frontBack}-${leftRight}, Avoid Exaflares',
          de: '${frontBack}-${leftRight}, vermeide Exaflares',
          cn: '在 ${leftRight}-${frontBack} 躲避地火',
          ko: '${frontBack}-${leftRight}, 엑사플레어 피하기',
          tc: '在 ${leftRight}-${frontBack} 躲避地火',
        },
        front: Outputs.front,
        back: Outputs.back,
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Final Verse Quantum Bounds of Sin Counter',
      type: 'StartsUsing',
      netRegex: { id: 'AC59', source: 'Devoured Eater', capture: false },
      run: (data) => data.boundsOfSin++,
    },
    {
      id: 'Final Verse Quantum Bounds of Sin Walls',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AC5A', capture: true },
      condition: (data) => {
        const walls = data.walls;
        const count = boundsOfSinSingleWall(data.boundsOfSin) ? 2 : 4;
        return (walls === undefined || walls.length < count);
      },
      infoText: (data, matches, output) => {
        const [x, y] = [parseFloat(matches.x), parseFloat(matches.y)];
        const dir = xyTo12DirNum(x, y, center.x, center.y);
        (data.walls ??= []).push(dir);

        const walls = data.walls;
        const singleWall = boundsOfSinSingleWall(data.boundsOfSin);
        const count = singleWall ? 2 : 4;
        if (walls === undefined || walls.length < count)
          return;

        const hdgDir = hdgTo12DirNum(parseFloat(matches.heading));
        const inOut = hdgDir === dir ? 'in' : Math.abs(hdgDir - dir) === 6 ? 'out' : 'unknown';

        // single sequential walls
        if (singleWall) {
          const [wall1, wall2] = [walls[0], walls[1]];
          if (wall1 === undefined || wall2 === undefined)
            throw new UnreachableCode();

          const isCW = wall2 - wall1 === 1 || wall1 - wall2 === 11;
          const isCCW = wall1 - wall2 === 1 || wall2 - wall1 === 11;
          const rotationDir = isCW ? 'cw' : isCCW ? 'ccw' : undefined;

          if (rotationDir === undefined)
            return output.single!({ dir: output.unknown!(), inOut: output[inOut]!() });

          if (rotationDir === 'cw') {
            const dodgeDir = outputFrom12DirNum((wall2 + 10) % 12);
            return output.single!({ dir: output[dodgeDir]!(), inOut: output[inOut]!() });
          }
          const dodgeDir = outputFrom12DirNum((wall1 + 1) % 12);
          return output.single!({ dir: output[dodgeDir]!(), inOut: output[inOut]!() });
        }

        // double sequential walls
        const [wall1, wall3, wall4] = [walls[0], walls[2], walls[3]];
        if (wall1 === undefined || wall3 === undefined || wall4 === undefined)
          throw new UnreachableCode();

        const nextWall = Math.abs(wall1 - wall3) === 1 ? wall3 : wall4;

        const isCW = nextWall - wall1 === 1 || wall1 - nextWall === 11;
        const isCCW = wall1 - nextWall === 1 || nextWall - wall1 === 11;
        const rotationDir = isCW ? 'cw' : isCCW ? 'ccw' : undefined;

        if (rotationDir === undefined)
          return output.double!({
            dir1: output.unknown!(),
            dir2: output.unknown!(),
            inOut: output[inOut]!(),
          });

        if (rotationDir === 'cw') {
          const dodgeDir1 = outputFrom12DirNum((nextWall + 4) % 12);
          const dodgeDir2 = outputFrom12DirNum((nextWall + 10) % 12);
          return output.double!({
            dir1: output[dodgeDir1]!(),
            dir2: output[dodgeDir2]!(),
            inOut: output[inOut]!(),
          });
        }
        const dodgeDir1 = outputFrom12DirNum((wall1 + 1) % 12);
        const dodgeDir2 = outputFrom12DirNum((wall1 + 7) % 12);
        return output.double!({
          dir1: output[dodgeDir1]!(),
          dir2: output[dodgeDir2]!(),
          inOut: output[inOut]!(),
        });
      },
      outputStrings: {
        single: {
          en: '${dir} + ${inOut}',
          de: '${dir} + ${inOut}',
          fr: '${dir} + ${inOut}',
          ja: '${dir} + ${inOut}',
          cn: '${dir} + ${inOut}',
          ko: '${dir} + ${inOut}',
          tc: '${dir} + ${inOut}',
        },
        double: {
          en: '${dir1}/${dir2} + ${inOut}',
          de: '${dir1}/${dir2} + ${inOut}',
          fr: '${dir1}/${dir2} + ${inOut}',
          ja: '${dir1}/${dir2} + ${inOut}',
          cn: '${dir1}/${dir2} + ${inOut}',
          ko: '${dir1}/${dir2} + ${inOut}',
          tc: '${dir1}/${dir2} + ${inOut}',
        },
        in: Outputs.in,
        out: Outputs.out,
        ...outputStrings12Dir,
      },
    },
    {
      id: 'Final Verse Quantum Bounds of Sin Cleanup',
      type: 'Ability',
      netRegex: { id: ['AC5B', 'AC5C'], source: 'Devoured Eater', capture: false },
      run: (data) => delete data.walls,
    },
    {
      id: 'Final Verse Quantum Light/Dark Partner Stack',
      type: 'HeadMarker',
      netRegex: {
        id: [headMarkerData.lightPartnerStack, headMarkerData.darkPartnerStack],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        const id = matches.id;
        const lightDark = id === headMarkerData.lightPartnerStack ? 'dark' : 'light';
        return output.text!({ lightDark: output[lightDark]!() });
      },
      outputStrings: {
        text: {
          en: 'Stack with ${lightDark} Partner',
          de: 'Mit ${lightDark} Partner sammeln',
          cn: '与 ${lightDark} 集合',
        },
        light: {
          en: 'Light',
          de: 'Licht',
          cn: '光',
        },
        dark: {
          en: 'Dark',
          de: 'Dunkelheit',
          cn: '暗',
        },
      },
    },
    {
      id: 'Final Verse Quantum Blade of First Light',
      type: 'StartsUsing',
      netRegex: { id: ['AC46', 'AC47', 'AC4C', 'AC4D'], source: 'Devoured Eater', capture: true },
      preRun: (data, matches) => {
        const id = matches.id;
        if (id === 'AC46' || id === 'AC4C') {
          data.sidesMiddle = 'sides';
        } else {
          data.sidesMiddle = 'middle';
        }
      },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC46' || id === 'AC47')
          return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
        return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          fr: '${mech1} => ${mech2}',
          ja: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
          tc: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'Final Verse Quantum Ball of Fire',
      type: 'StartsUsing',
      netRegex: { id: ['AC41', 'AC49'], source: 'Eminent Grief', capture: true },
      preRun: (data) => data.ballChains = 'ball',
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC41')
          return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
        return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          fr: '${mech1} => ${mech2}',
          ja: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
          tc: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'Final Verse Quantum Ball of Fire Move',
      type: 'Ability',
      netRegex: { id: ['AC41', 'AC49'], source: 'Eminent Grief', capture: false },
      response: Responses.moveAway('alert'),
    },
    {
      id: 'Final Verse Quantum Chains of Condemnation',
      // raidwide + applies 11D2 Chains of Condemnation for 2s; heavy damage if moving
      type: 'StartsUsing',
      netRegex: { id: ['AC44', 'AC4B'], source: 'Eminent Grief', capture: true },
      preRun: (data) => data.ballChains = 'chains',
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const id = matches.id;
        const ballChains = data.ballChains;
        const sidesMiddle = data.sidesMiddle;
        if (ballChains === undefined || sidesMiddle === undefined)
          return;

        if (id === 'AC44')
          return output.text!({ mech1: output[ballChains]!(), mech2: output[sidesMiddle]!() });
        return output.text!({ mech1: output[sidesMiddle]!(), mech2: output[ballChains]!() });
      },
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          fr: '${mech1} => ${mech2}',
          ja: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
          tc: '${mech1} => ${mech2}',
        },
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
        ball: Outputs.baitPuddles,
        ...chainsOfCondemnationOutputStrings,
      },
    },
    {
      id: 'Final Verse Quantum Blade/Ball/Chains Cleanup',
      type: 'Ability',
      netRegex: {
        id: ['AC49', 'AC4B', 'AC4E'],
        source: ['Eminent Grief', 'Devoured Eater'],
        capture: false,
      },
      suppressSeconds: 1,
      run: (data) => {
        delete data.ballChains;
        delete data.sidesMiddle;
      },
    },
    {
      id: 'Final Verse Quantum Searing Chains Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.searingChains, capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack Middle for Chains',
          de: 'In der Mitte sammlen für Ketten',
          cn: '中间集合等待连线',
        },
      },
    },
    {
      id: 'Final Verse Quantum Burning/Searing Chains Break',
      // 301 = Burning Chains (Q15)
      // 11D3 = Searing Chains (Q20-40)
      type: 'GainsEffect',
      netRegex: { effectId: ['301', '11D3'], capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        if (data.quantumLevel < 20)
          return output.q15!();
        return output.q40!();
      },
      outputStrings: {
        q15: Outputs.breakChains,
        q40: {
          en: 'Break Chains => AoE + Bleed',
          de: 'Ketten brechen => AoE + Blutung',
          cn: '拉断连线 => AOE + 流血',
        },
      },
    },
    {
      id: 'Final Verse Quantum Spinelash',
      // wild charge
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spinelashTarget, capture: true },
      alertText: (data, matches, output) => {
        const target = matches.target;
        if (target === undefined)
          return output.stackMarker!();
        if (target === data.me)
          return output.stackOnYou!();
        return output.stackOnTarget!({ player: data.party.member(target) });
      },
      outputStrings: {
        stackOnYou: {
          en: 'Stack on YOU, Tank in Front',
          de: 'Auf DIR sammeln, Tank nach Vorne',
          cn: '分摊点名，坦克在前',
        },
        stackOnTarget: {
          en: 'Stack on ${player}, Tank in Front',
          de: 'Auf ${player} sammeln, Tank nach Vorne',
          cn: '分摊点 ${player}，坦克在前',
        },
        stackMarker: {
          en: 'Stack, Tank in Front',
          de: 'Sammeln, Tank nach Vorne',
          cn: '分摊，坦克在前',
        },
      },
    },
    {
      id: 'Final Verse Quantum Vodoriga Minion Spawn',
      // 14039 = Vodoriga Minion
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14039', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kill Add',
          de: 'Add besiegen',
          cn: '击杀小怪',
        },
      },
    },
    {
      id: 'Final Verse Quantum Shackles of (Greater) Sanctity',
      type: 'StartsUsing',
      netRegex: { id: ['AC72', 'AF01'], source: 'Devoured Eater', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Shackles',
          de: 'Fesseln',
          cn: '光链',
        },
      },
    },
    {
      id: 'Final Verse Quantum Hellish Earth Tether',
      type: 'Tether',
      netRegex: { id: tetherData.hellishEarth, source: 'Eminent Grief', capture: true },
      infoText: (data, matches, output) => {
        const target = matches.target;
        if (data.me === target)
          return output.tetherOnYou!();
        return output.tetherOn!({ player: data.party.member(target) });
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          cn: '连线点名',
        },
        tetherOn: {
          en: 'Tether on ${player}',
          de: 'Verbindung auf ${player}',
          cn: '连线点 ${player}',
        },
      },
    },
    {
      id: 'Final Verse Quantum Hellish Earth AoE',
      type: 'StartsUsing',
      netRegex: { id: 'AC78', source: 'Eminent Grief', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE + Draw-in',
          de: 'AoE + Sog',
          cn: 'AOE + 吸引',
        },
      },
    },
    {
      id: 'Final Verse Quantum Hellish Earth Gain',
      // 11D6 = Hellish Earth
      type: 'GainsEffect',
      netRegex: { effectId: '11D6', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hellishEarth = true,
    },
    {
      id: 'Final Verse Quantum Arcane Font Spawn',
      // 14042 = Arcane Font
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14042', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kill Towers',
          de: 'Türme besiegen',
          cn: '击杀柱子',
        },
      },
    },
    {
      id: 'Final Verse Quantum Eruption',
      type: 'StartsUsing',
      netRegex: { id: 'AC7C', source: 'Eminent Grief', capture: false },
      suppressSeconds: 7,
      infoText: (data, _matches, output) => {
        if (data.hellishEarth && data.eruptions < 2)
          return;
        return output.text!();
      },
      run: (data) => data.eruptions++,
      outputStrings: {
        text: {
          en: 'Bait Puddles x3',
          de: 'Flächen ködern x3',
          cn: '引导圈圈 x3',
        },
      },
    },
    {
      id: 'Final Verse Quantum Manifold Lashings Left/Right',
      type: 'StartsUsing',
      netRegex: { id: ['AC7D', 'AC7E'], source: 'Eminent Grief', capture: true },
      run: (data, matches) => {
        const id = matches.id;
        id === 'AC7D' ? data.manifoldLashings = 'left' : data.manifoldLashings = 'right';
      },
    },
    {
      id: 'Final Verse Quantum Manifold Lashings Tankbuster',
      type: 'StartsUsing',
      netRegex: { id: 'AC7F', source: 'Eminent Grief', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: '3x Tankbuster + Bleed',
          de: '3x Tankbuster + Blutung',
          cn: '三连坦克死刑 + 流血',
        },
      },
    },
    {
      id: 'Final Verse Quantum Manifold Lashings Laser',
      type: 'StartsUsing',
      netRegex: { id: 'AC81', source: 'Eminent Grief', capture: false },
      infoText: (data, _matches, output) => {
        const leftRight = data.manifoldLashings === undefined ? 'unknown' : data.manifoldLashings;
        return output.text!({ leftRight: output[leftRight]!() });
      },
      run: (data) => delete data.manifoldLashings,
      outputStrings: {
        text: {
          en: '${leftRight}, Avoid laser',
          de: '${leftRight}, vermeide Laser',
          cn: '${leftRight}，躲避激光',
        },
        left: {
          en: 'Front-left/Back-right',
          de: 'Vorne links/Hinten rechts',
          cn: '左前/右后',
        },
        right: {
          en: 'Front-right/Back-left',
          de: 'Vorne rechts/Hinten links',
          cn: '右前/左后',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Final Verse Quantum Unholy Darkness',
      type: 'StartsUsing',
      netRegex: { id: ['AC84', 'AC90'], source: 'Devoured Eater', capture: false },
      response: Responses.bleedAoe('alert'),
    },
    {
      id: 'Final Verse Quantum Crime and Punishment',
      type: 'StartsUsing',
      netRegex: { id: 'AC85', source: 'Devoured Eater', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Dark Vengeance',
          de: 'Nimm Echo der Dunkelheit',
          cn: '踩暗',
        },
      },
    },
    {
      id: 'Final Verse Quantum First Sin Bearer',
      // instant cast
      type: 'Ability',
      netRegex: { id: 'AC86', source: 'Devoured Eater', capture: true },
      infoText: (data, matches, output) => {
        const target = matches.target;
        if (target === data.me)
          return output.sinBearerOnYou!();
        return output.sinBearerOnTarget!({ player: data.party.member(target) });
      },
      outputStrings: {
        sinBearerOnYou: {
          en: 'Sin Bearer on YOU',
          de: 'Anhäufen der Schuld auf DIR',
          cn: '罪积蓄点名',
        },
        sinBearerOnTarget: {
          en: 'Sin Bearer on ${player}',
          de: 'Anhäufen der Schuld auf ${player}',
          cn: '罪积蓄点 ${player}',
        },
      },
    },
    {
      id: 'Final Verse Quantum Sin Bearer Gain',
      // 11D7 = Sin Bearer
      type: 'GainsEffect',
      netRegex: { effectId: '11D7', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.sinBearer = true,
    },
    {
      id: 'Final Verse Quantum Sin Bearer Lose',
      // 11D7 = Sin Bearer
      type: 'LosesEffect',
      netRegex: { effectId: '11D7', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.sinBearer = false,
    },
    {
      id: 'Final Verse Quantum Sin Bearer Pass Warning',
      // 11D7 = Sin Bearer
      type: 'GainsEffect',
      netRegex: { effectId: '11D7', capture: true },
      condition: (data, matches) => {
        const target = matches.target;
        const stackCount = parseInt(matches.count, 16);
        return target === data.me && stackCount === 14;
      },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Pass Sin Bearer',
          de: 'Anhäufen der Schuld weitergeben',
          cn: '传递罪积蓄',
        },
      },
    },
    {
      id: 'Final Verse Quantum Doom',
      // 11F2 = Doom
      type: 'GainsEffect',
      netRegex: { effectId: '11F2', capture: true },
      condition: (data) => data.CanCleanse(),
      alertText: (data, matches, output) => {
        return output.text!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        text: {
          en: 'Cleanse ${player}',
          de: 'Reinige ${player}',
          cn: '驱散 ${player}',
        },
      },
    },
    {
      id: 'Final Verse Quantum Eminent Grief Drain Aether',
      type: 'StartsUsing',
      netRegex: { id: ['AC61', 'AC62'], source: 'Eminent Grief', capture: true },
      delaySeconds: (_data, matches) =>
        matches.id === 'AC61' ? 0 : parseFloat(matches.castTime) - 5,
      infoText: (data, _matches, output) => {
        if (data.sinBearer)
          return output.stay!();
        return output.swap!();
      },
      outputStrings: {
        swap: {
          en: 'Get Light Vengeance',
          de: 'Nimm Echo des Lichts',
          cn: '踩光',
        },
        stay: {
          en: 'Stay Dark Vengeance',
          de: 'Bleib bei Echo der Dunkelheit',
          cn: '保持暗',
        },
      },
    },
    {
      id: 'Final Verse Quantum Devoured Eater Drain Aether',
      type: 'StartsUsing',
      netRegex: { id: ['AC63', 'AC65'], source: 'Devoured Eater', capture: true },
      delaySeconds: (_data, matches) =>
        matches.id === 'AC63' ? 0 : parseFloat(matches.castTime) - 4,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Dark Vengeance',
          de: 'Nimm Echo der Dunkelheit',
          cn: '踩暗',
        },
      },
    },
    {
      id: 'Final Verse Quantum Flameborn Spawn',
      // 14041 = Flameborn
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14041', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Flameborn',
          de: 'Sprungfeuer ködern',
          cn: '引导火焰分身',
        },
      },
    },
    {
      id: 'Final Verse Quantum Flameborn Self-Destruct',
      type: 'StartsUsing',
      netRegex: { id: 'AC8B', source: 'Flameborn', capture: false },
      response: Responses.aoe('alert'),
    },
    {
      id: 'Final Verse Quantum Boss Death',
      // 11D1 = Borrowed Time
      type: 'GainsEffect',
      netRegex: { effectId: '11D1', target: ['Eminent Grief', 'Devoured Eater'], capture: true },
      infoText: (_data, matches, output) => {
        const target = matches.target;
        return output.text!({ target: target });
      },
      outputStrings: {
        text: {
          en: '${target} dead, swap!',
          de: '${target} besiegt, wechseln!',
          cn: '${target} 死亡，换目标！',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Abyssal Blaze/Scourging Blaze': 'Abyssal/Scourging Blaze',
        'Abyssal Dawn/Abyssal Sun': 'Abyssal Dawn/Sun',
        'Blade of First Light/Ball of Fire/Chains of Condemnation': 'Blade/Ball/Chains',
        'Burning Chains/Searing Chains': 'Burning/Searing Chains',
        'Shackles of Sanctity/Shackles of Greater Sanctity': 'Shackles of (Greater) Sanctity',
        'Visceral Flame/Fevered Flame': 'Visceral/Fevered Flame',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Devoured Eater': 'erodiert(?:e|er|es|en) Sündenvertilger',
        'Eminent Grief': 'Eminent(?:e|er|es|en) Trauer',
        'Flameborn': 'Sprungfeuer',
      },
      'replaceText': {
        '--add targetable--': '--Add anvisierbar--',
        '--towers targetable--': '--Turm anvisierbar--',
        'chariot': 'Kreis-AoE',
        'draw-in': 'Sog',
        'Abyssal Blaze': 'Flammen der Tiefe',
        'Abyssal Dawn': 'Dunkellicht der Tiefe',
        'Abyssal Sun': 'Blendlicht der Tiefe',
        'Ball of Fire': 'Feuerball',
        'Blade of First Light': 'Strahlendes Schwert',
        'Bounds of Sin': 'Zirkel der Purgation',
        'Burning Chains': 'Brennende Ketten',
        'Chains of Condemnation': 'Joch der Flammen',
        'Crime and Punishment': 'Schuld und Sühne',
        'Eruption': 'Eruption',
        'Fevered Flame': 'Flammenkörper',
        'Hellish Earth': 'Garten der Flammen',
        'Manifold Lashings': 'Mehrfacher Schweifhieb',
        'Searing Chains': 'Flammenkette',
        'Shackles of Greater Sanctity': 'Lichtketten der Wachsamkeit',
        'Shackles of Sanctity': 'Lichtketten der Mahnung',
        'Spinelash': 'Dornenschweif',
        'Unholy Darkness': 'Unheiliges Dunkel',
        'Visceral Flame': 'Feuerkörper',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Devoured Eater': 'purgateur dévoré',
        'Eminent Grief': 'Pontife du Chagrin',
        'Flameborn': 'division de flamme',
      },
      'replaceText': {
        'Abyssal Blaze': 'Feu abyssal',
        'Abyssal Dawn': 'Aurore abyssale',
        'Abyssal Sun': 'Soleil abyssal',
        'Ball of Fire': 'orbe de feu',
        'Blade of First Light': 'Épée des premières lueurs',
        'Bounds of Sin': 'Cercle de purgation',
        'Burning Chains': 'Chaînes brûlantes',
        'Chains of Condemnation': 'Chaînes de flammes',
        'Crime and Punishment': 'Crime et châtiment',
        'Eruption': 'Éruption',
        'Fevered Flame': 'Flamme incarnée',
        'Hellish Earth': 'Jardin de flammes',
        'Manifold Lashings': 'Coups caudaux répétés',
        'Searing Chains': 'Chaînes incandescentes',
        'Shackles of Greater Sanctity': 'Menottes de blâme',
        'Shackles of Sanctity': 'Menottes d\'admonestation',
        'Spinelash': 'Salve d\'épines',
        'Unholy Darkness': 'Miracle ténébreux',
        'Visceral Flame': 'Feu incarné',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Devoured Eater': '侵蝕された罪喰い',
        'Eminent Grief': 'エミネントグリーフ',
        'Flameborn': '焔の分身',
      },
      'replaceText': {
        'Abyssal Blaze': '深淵の焔',
        'Abyssal Dawn': '深淵の黒光',
        'Abyssal Sun': '深淵の極光',
        'Ball of Fire': '火球',
        'Blade of First Light': '光耀の剣',
        'Bounds of Sin': '浄罪の環',
        'Burning Chains': '炎の鎖',
        'Chains of Condemnation': '焔の枷',
        'Crime and Punishment': '罪と罰',
        'Eruption': 'エラプション',
        'Fevered Flame': '焔身具現',
        'Hellish Earth': '焔の園',
        'Manifold Lashings': '尾連撃',
        'Searing Chains': '焔の鎖',
        'Shackles of Greater Sanctity': '厳戒の光鎖',
        'Shackles of Sanctity': '戒めの光鎖',
        'Spinelash': '荊棘の尾',
        'Unholy Darkness': 'ダークホーリー',
        'Visceral Flame': '炎身具現',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Devoured Eater': '被侵蚀的食罪灵',
        'Eminent Grief': '卓异的悲寂',
        'Flameborn': '火焰分身',
      },
      'replaceText': {
        '--add targetable--': '--小怪可选中--',
        '--towers targetable--': '--塔可选中--',
        'Abyssal Blaze': '深渊烈焰',
        'Abyssal Dawn': '深渊黑光',
        'Abyssal Sun': '深渊极光',
        'Ball of Fire': '火球',
        'Blade of First Light': '光耀之剑',
        'Bounds of Sin': '净罪之环',
        'Burning Chains': '火焰链',
        'Chains of Condemnation': '烈焰锢',
        'chariot': '钢铁',
        'Crime and Punishment': '罪与罚',
        'Dark(?!ness)': '暗',
        'Drain Aether': '以太吸取',
        'draw-in': '吸引',
        'dynamo': '月环',
        'Eruption': '地火喷发',
        'exaflares': '地火',
        'Fevered Flame': '烈焰缠身',
        'Hellish Earth': '烈焰领域',
        'laser': '激光',
        '(?<!First )Light': '光',
        'Manifold Lashings': '尾连击',
        'Scourging Blaze': '深渊爆焰',
        'Searing Chains': '烈焰链',
        'Shackles of Greater Sanctity': '戒严的光链',
        'Shackles of Sanctity': '戒律的光链',
        'Spinelash': '棘刺尾',
        'Unholy Darkness': '黑暗神圣',
        'Visceral Flame': '火焰缠身',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Devoured Eater': '잠식된 죄식자',
        'Eminent Grief': '드높은 비애',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {},
    },
  ],
};

export default triggerSet;
