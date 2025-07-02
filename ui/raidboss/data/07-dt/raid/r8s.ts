import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

type Phase = 'one' | 'adds' | 'rage' | 'moonlight' | 'two' | 'twofold' | 'champion';
type PlatformBaitMap = {
  [key: number]: string;
};
type ChampionOrders = {
  [key: number]: string[];
};
type ChampionCounterMap = {
  [key: number]: number[];
};

export interface Data extends RaidbossData {
  phase: Phase;
  // Phase 1
  reignDir?: number;
  decayAddCount: number;
  galeTetherDirNum?: number;
  galeTetherCount: number;
  towerDirs?: 'EW' | 'NS';
  towerfallSafeDirs?: 'NESW' | 'SENW';
  towerfallSafeDir?: 'dirNE' | 'dirSE' | 'dirSW' | 'dirNW' | 'unknown';
  fangedCrossingIds: number[];
  stoneWindCallGroup?: number;
  surgeTracker: number;
  packPredationTracker: number;
  packPredationTargets: string[];
  stoneWindDebuff?: 'stone' | 'wind';
  isFirstRage: boolean;
  hasSpread?: boolean;
  stackOnPlayer?: string;
  moonbeamBites: number[];
  moonbeamBitesTracker: number;
  moonlightQuadrant2?: string;
  // Phase 2
  hasUVRay: boolean;
  uvFangSafeSide?: 'left' | 'right' | 'unknown';
  gleamingBeamIds: number[];
  herosBlowInOut?: 'in' | 'out';
  herosBlowSafeDir?: number;
  purgeTargets: string[];
  hasTwofoldTether: boolean;
  twofoldInitialDir?: string;
  twofoldTracker: number;
  championClock?: 'clockwise' | 'counterclockwise';
  championDonutStart?: number;
  myLastPlatformNum?: number;
  myPlatformNum?: number;
  gleamingBarrageIds: number[];
  championFangSafeSide?: 'left' | 'right' | 'unknown';
  championOrders?: ChampionOrders;
  championTracker: number;
  platforms: number;
}

const centerX = 100;
const centerY = 100;
const eminentReign1 = 'A911'; // N=>S, WSW=>ENE, ESE=>WNW
const eminentReign2 = 'A912'; // S=>N, WNW=>ESE, ENE=>WSW
const revolutionaryReign1 = 'A913'; // N=>S, WSW=>ENE, ESE=>WNW
const revolutionaryReign2 = 'A914'; // S=>N, WNW=>ESE, ENE=>WSW

const phaseMap: { [id: string]: Phase } = {
  'A3C8': 'adds', // Tactical Pack
  'A3CB': 'rage', // Ravenous Saber
  'A3C1': 'moonlight', // Beckon Moonlight
  'A471': 'twofold', // Twofold Tempest
  'A477': 'champion', // Champion's Circuit (clockwise)
  'A478': 'champion', // Chanpion's Circuit (counterclockwise)
};

const headMarkerData = {
  // Shared tankbuster marker
  'tankbuster': '0256',
  // Prowling Gale Tether from Wolf of Wind
  'galeTether': '0039',
  // Adds red headmarker showing you will be targeted by Pack Predation
  // Also used for Elemental Purge in Phase 2
  'predation': '0017',
  // Stony tether from Wolf of Stone
  'stoneTether': '014F',
  // Windy Tether from Wolf of Wind
  'windTether': '0150',
  // Big, pulsing, 4-arrow stack marker
  'eightHitStack': '013C',
  // Spread marker used in Terrestial Rage and Beckon Moonlight
  'spread': '008B',
  // Stack marker used in Terrestial Rage and Beckon Moonlight
  'stack': '005D',
  // Blue circle marker with spikes used for Ultraviolent Ray target in Phase 2
  'ultraviolent': '000E',
  // Passable tether used for Twofold Tempest in Phase 2
  'twofoldTether': '0054',
  // Blue arrows going counterclock on the boss
  'counterclockwise': '01F6',
  // Orange arrows going clockwise on the boss
  'clockwise': '01F5',
  // Blue far tether in Lone Wolf's Lament in Phase 2
  'farTether': '013E',
  // Green close tether in Lone Wolf's Lament in Phase 2
  'closeTether': '013D',
} as const;

const stoneWindOutputStrings = {
  stoneWindNum: {
    en: '${debuff} ${num}',
    de: '${debuff} ${num}',
    ja: '${debuff} ${num}',
    cn: '${debuff} ${num}',
    ko: '${debuff} ${num}',
  },
  stone: {
    en: 'Stone',
    de: 'Erde',
    ja: '土',
    cn: '土',
    ko: '땅',
  },
  wind: {
    en: 'Wind',
    de: 'Wind',
    ja: '風',
    cn: '风',
    ko: '바람',
  },
  unknown: Outputs.unknown,
};

const moonlightOutputStrings = {
  ...Directions.outputStrings8Dir,
  safeQuad: {
    en: '${quad}',
    de: '${quad}',
    ja: '${quad}',
    cn: '${quad}',
    ko: '${quad}',
  },
  safeQuadrants: {
    en: '${quad1} => ${quad2}',
    de: '${quad1} => ${quad2}',
    ja: '${quad1} => ${quad2}',
    cn: '${quad1} => ${quad2}',
    ko: '${quad1} => ${quad2}',
  },
};

const championOutputStrings = {
  clockwise: Outputs.clockwise,
  counterclockwise: Outputs.counterclockwise,
  in: Outputs.in,
  out: Outputs.out,
  donut: {
    en: 'Donut',
    de: 'Donut',
    ja: 'ドーナツ',
    cn: '月环',
    ko: '도넛',
  },
  sides: Outputs.sides,
  mechanics: {
    en: '(${dir}) ${mech1} => ${mech2} => ${mech3} => ${mech4} => ${mech5}',
    de: '(${dir}) ${mech1} => ${mech2} => ${mech3} => ${mech4} => ${mech5}',
    ja: '(${dir}) ${mech1} => ${mech2} => ${mech3} => ${mech4} => ${mech5}',
    cn: '(${dir}) ${mech1} => ${mech2} => ${mech3} => ${mech4} => ${mech5}',
    ko: '(${dir}) ${mech1} => ${mech2} => ${mech3} => ${mech4} => ${mech5}',
  },
  left: Outputs.left,
  right: Outputs.right,
  leftSide: {
    en: 'Left Side',
    de: 'Linke Seite',
    ja: '左側',
    cn: '左侧',
  },
  rightSide: {
    en: 'Right Side',
    de: 'Rechte Seite',
    ja: '右側',
    cn: '右侧',
  },
  unknownSide: {
    en: '??? Side',
    de: '??? Seite',
    ja: '??? 側',
    cn: '??? 侧',
  },
  dirMechanic: {
    en: '${dir} ${mech}',
    de: '${dir} ${mech}',
    ja: '${dir} ${mech}',
    cn: '${dir} ${mech}',
  },
};

// Platform, Mechs
// S = 0, SW = 1, NW = 2, NE = 3, SE = 4
const championClockOrders: ChampionOrders = {
  0: ['donut', 'in', 'out', 'in', 'sides'],
  1: ['sides', 'donut', 'in', 'out', 'in'],
  2: ['in', 'sides', 'donut', 'in', 'out'],
  3: ['out', 'in', 'sides', 'donut', 'in'],
  4: ['in', 'out', 'in', 'sides', 'donut'],
};
const championCounterOrders: ChampionOrders = {
  0: ['donut', 'sides', 'in', 'out', 'in'],
  1: ['in', 'donut', 'sides', 'in', 'out'],
  2: ['out', 'in', 'donut', 'sides', 'in'],
  3: ['in', 'out', 'in', 'donut', 'sides'],
  4: ['sides', 'in', 'out', 'in', 'donut'],
};

// Map donutPlatform to mechIndex for Counterclockwise
const championCounterIndex: ChampionCounterMap = {
  0: [0, 1, 2, 3, 4],
  1: [4, 0, 1, 2, 3],
  2: [3, 4, 0, 1, 2],
  3: [2, 3, 4, 0, 1],
  4: [1, 2, 3, 4, 0],
};

// Twofold Tempest Platform to Bait Mapping
const twofoldPlatformNumToBaitDir: PlatformBaitMap = {
  0: 'unknown',
  1: 'dirNE',
  2: 'dirSE',
  3: 'dirSW',
  4: 'dirNW',
};

// Return the combatant's platform by number
const getPlatformNum = (
  x: number,
  y: number,
): number => {
  // S Platform
  if (x > 90 && x < 108 && y > 107)
    return 0;

  // SW Platform
  if (x <= 92 && y > 95)
    return 1;

  // NW Platform
  if (x <= 100 && y <= 95)
    return 2;

  // NE Platform
  if (x > 100 && y <= 95)
    return 3;

  // SE Platform
  if (x >= 109 && y > 95)
    return 4;

  return -1;
};

const getFangPlatform = (
  combatant: PluginCombatantState,
): number => {
  const x = combatant.PosX;
  const y = combatant.PosY;

  // S Platform
  // (96, 126.5) Left and (104, 126.5) Right
  if (x > 95 && x < 105 && y > 125)
    return 0;

  // SW Platform
  // (73.56, 104.38) Left and (76.03, 111.99) Right
  if (x > 72 && x < 77 && y > 103 && y < 113)
    return 1;

  // NW Platform
  // (87.66, 76.20) Left and (81.19, 80.91) Right
  if (x > 80 && x < 89 && y > 75 && y < 82)
    return 2;

  // NE Platform
  // (118.81, 80.91) Left and (112.34, 76.2) Right
  if (x > 111 && x < 120 && y > 75 && y < 82)
    return 3;

  // SE Platform
  // (123.97, 111.99) Left and (126.44, 104.38) Right
  if (x > 122 && x < 128 && y > 103 && y < 113)
    return 4;

  return -1;
};

// Find the actor on the platform we want
const findFang = (
  actors: PluginCombatantState[],
  platform: number,
): PluginCombatantState | undefined => {
  for (const actor of actors) {
    const actorPlatform = getFangPlatform(actor);

    if (platform === actorPlatform) {
      return actor;
    }
  }

  // Did not find actor on the platform
  return undefined;
};

const getFangSafeSide = (
  x: number,
  platform: number,
): 'left' | 'right' | 'unknown' => {
  if (
    (platform === 0 && x < 100) ||
    (platform === 1 && x < 75) ||
    (platform === 2 && x > 85) ||
    (platform === 3 && x > 115) ||
    (platform === 4 && x < 125)
  )
    return 'right';
  if (
    (platform === 0 && x > 100) ||
    (platform === 1 && x > 75) ||
    (platform === 2 && x < 85) ||
    (platform === 3 && x < 115) ||
    (platform === 4 && x > 125)
  )
    return 'left';

  return 'unknown';
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM4Savage',
  zoneId: ZoneId.AacCruiserweightM4Savage,
  timelineFile: 'r8s.txt',
  initData: () => ({
    phase: 'one',
    // Phase 1
    decayAddCount: 0,
    galeTetherCount: 0,
    fangedCrossingIds: [],
    packPredationTracker: 0,
    packPredationTargets: [],
    surgeTracker: 0,
    isFirstRage: true,
    moonbeamBites: [],
    moonbeamBitesTracker: 0,
    // Phase 2
    hasUVRay: false,
    gleamingBeamIds: [],
    purgeTargets: [],
    hasTwofoldTether: false,
    twofoldTracker: 0,
    gleamingBarrageIds: [],
    championTracker: 0,
    platforms: 5,
  }),
  timelineTriggers: [
    {
      id: 'R8S Light Party Platform',
      regex: /Quake III/,
      beforeSeconds: 7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Light Party Platform',
          de: 'Leichter Trupp Platform',
          ja: '東西の島で 4：4 頭割り',
          cn: '东西岛治疗组分摊站位',
        },
      },
    },
    {
      id: 'R8S Ultraviolent Positions',
      regex: /Ultraviolent Ray [123]/,
      beforeSeconds: 8,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'UV Positions',
          de: 'Ätherlicht Positionen',
          ja: '魔光位置へ',
          cn: '魔光站位',
        },
      },
    },
    {
      id: 'R8S Ultraviolent 4 Positions',
      regex: /Ultraviolent Ray 4/,
      beforeSeconds: 8,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'UV Positions',
          de: 'Ätherlicht Positionen',
          ja: '魔光位置へ',
          cn: '魔光站位',
        },
      },
    },
    {
      id: 'R8S Mooncleaver Bait',
      regex: /Mooncleaver$/,
      beforeSeconds: 7, // 3.7s castTime
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Mooncleaver',
          de: 'Ködere Klingensturz',
          ja: '剛刃一閃を誘導',
          cn: '引导碎地板',
        },
      },
    },
    {
      id: 'R8S Howling Eight Initial Position',
      regex: /Ultraviolent Ray 4/,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Howling Eight Position',
          de: 'Achtfache Lichtkugel Position',
          ja: '八連光弾の位置へ',
          cn: '八连光弹集合',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'R8S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'Howling Blade' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
        data.isFirstRage = true;
      },
    },
    {
      id: 'R8S Phase Two Tracker',
      // unknown_a82d, causes Down for the Count (968)
      type: 'Ability',
      netRegex: { id: 'A82D', source: 'Howling Blade', capture: false },
      suppressSeconds: 1,
      run: (data) => data.phase = 'two',
    },
    {
      id: 'R8S Extraplanar Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A3DA', source: 'Howling Blade', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R8S Windfang/Stonefang',
      type: 'StartsUsing',
      netRegex: { id: ['A39E', 'A39D', 'A3A1', 'A3A2'], source: 'Howling Blade', capture: true },
      infoText: (_data, matches, output) => {
        const windfangCards = 'A39D';
        const windfangInter = 'A39E';
        const stonefangCards = 'A3A1';
        const stonefangInter = 'A3A2';
        // A39F is cast for both A39D (card windfang) and A39E (intercard windfang)
        // A3B0 is cast for both A3A1 (card stonefang) and A3A2 (intercard stonefang)
        switch (matches.id) {
          case windfangCards:
            return output.inInterCardsPartners!();
          case windfangInter:
            return output.inCardsPartners!();
          case stonefangCards:
            return output.outInterCardsProtean!();
          case stonefangInter:
            return output.outCardsProtean!();
        }
      },
      outputStrings: {
        inCardsPartners: {
          en: 'In + Cards + Partners',
          de: 'Rein + Kardinal + Partner',
          ja: '内側 + 十字 + ペア',
          cn: '内侧 + 十字 + 分摊',
          ko: '안 + 십자방향 + 쉐어',
        },
        inInterCardsPartners: {
          en: 'In + Intercards + Partners',
          de: 'Rein + Interkardinal + Partner',
          ja: '内側 + 斜め + ペア',
          cn: '内侧 + 斜角 + 分摊',
          ko: '안 + 대각선 + 쉐어',
        },
        outCardsProtean: {
          en: 'Out + Cards + Protean',
          de: 'Raus + Kardinal + Himmelsrichtungen',
          ja: '外側 + 十字 + 散開',
          cn: '外侧 + 十字 + 分散',
          ko: '밖 + 십자방향 + 산개',
        },
        outInterCardsProtean: {
          en: 'Out + InterCards + Protean',
          de: 'Raus + Interkardinal + Himmelsrichtungen',
          ja: '外側 + 斜め + 散開',
          cn: '外侧 + 斜角 + 分散',
          ko: '밖 + 대각선 + 산개',
        },
      },
    },
    {
      id: 'R8S Eminent/Revolutionary Reign',
      type: 'StartsUsing',
      netRegex: { id: ['A911', 'A912', 'A913', 'A914'], source: 'Howling Blade', capture: true },
      infoText: (_data, matches, output) => {
        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            return output.inLater!();
          case revolutionaryReign1:
          case revolutionaryReign2:
            return output.outLater!();
        }
      },
      outputStrings: {
        inLater: {
          en: '(In Later)',
          de: '(später Rein)',
          ja: '(あとで内側)',
          cn: '(稍后内侧)',
          ko: '(나중에 안)',
        },
        outLater: {
          en: '(Out Later)',
          de: '(später Raus)',
          ja: '(あとで外側)',
          cn: '(稍后外侧)',
          ko: '(나중에 밖)',
        },
      },
    },
    {
      id: 'R8S Eminent/Revolutionary Reign Direction',
      type: 'StartsUsing',
      netRegex: { id: ['A911', 'A912', 'A913', 'A914'], source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 1.2,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Eminent/Revolutionary Reign Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }

        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            data.reignDir = (Directions.hdgTo16DirNum(actor.Heading) + 8) % 16;
            break;
          case revolutionaryReign1:
          case revolutionaryReign2:
            data.reignDir = Directions.hdgTo16DirNum(actor.Heading);
            break;
        }
      },
      infoText: (data, matches, output) => {
        const dir = output[Directions.output16Dir[data.reignDir ?? -1] ?? 'unknown']!();
        switch (matches.id) {
          case eminentReign1:
          case eminentReign2:
            return output.inDir!({ dir: dir });
          case revolutionaryReign1:
          case revolutionaryReign2:
            return output.outDir!({ dir: dir });
        }
      },
      run: (data) => {
        data.reignDir = undefined;
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        inDir: {
          en: 'In ${dir}',
          de: 'Rein ${dir}',
          ja: '内側 ${dir}',
          cn: '内侧 ${dir}',
          ko: '${dir} 안',
        },
        outDir: {
          en: 'Out ${dir}',
          de: 'Raus ${dir}',
          ja: '外側 ${dir}',
          cn: '外侧 ${dir}',
          ko: '${dir} 밖',
        },
      },
    },
    {
      id: 'R8S Millenial Decay',
      type: 'StartsUsing',
      netRegex: { id: 'A3B2', source: 'Howling Blade', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R8S Breath of Decay Rotation',
      type: 'StartsUsing',
      netRegex: { id: 'A3B4', source: 'Wolf of Wind', capture: true },
      durationSeconds: 6,
      infoText: (data, matches, output) => {
        // 1st add always spawns N or S, and 2nd add always spawns intercardinal
        // we only need the position of the 2nd add to determine rotation
        data.decayAddCount++;
        if (data.decayAddCount !== 2)
          return;

        const addX = parseFloat(matches.x);
        const addY = parseFloat(matches.y);
        const addDir = Directions.xyTo8DirNum(addX, addY, centerX, centerY);
        if (addDir === 1 || addDir === 5)
          return output.clockwise!();
        else if (addDir === 3 || addDir === 7)
          return output.counterclockwise!();
      },
      outputStrings: {
        clockwise: {
          en: '<== Clockwise',
          de: '<== Im Uhrzeigersinn',
          ja: '<== 時計回り',
          cn: '<== 顺时针',
          ko: '<== 시계방향',
        },
        counterclockwise: {
          en: 'Counterclockwise ==>',
          de: 'Gegen den Uhrzeigersinn ==>',
          ja: '反時計回り ==>',
          cn: '逆时针 ==>',
          ko: '반시계방향 ==>',
        },
      },
    },
    {
      id: 'R8S Aero III',
      // Happens twice, but Prowling Gale occurs simultaneously on the second one
      type: 'StartsUsing',
      netRegex: { id: 'A3B7', source: 'Howling Blade', capture: false },
      suppressSeconds: 16,
      response: Responses.knockback(),
    },
    {
      id: 'R8S Prowling Gale Tower/Tether',
      // Calls each tether or get towers
      type: 'Tether',
      netRegex: { id: [headMarkerData.galeTether], capture: true },
      preRun: (data, matches) => {
        // Set galeTetherDirNum to avoid triggering tower call
        if (data.me === matches.target)
          data.galeTetherDirNum = -1;
        data.galeTetherCount = data.galeTetherCount + 1;
      },
      promise: async (data, matches) => {
        if (data.me !== matches.target)
          return;
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Prowling Gale Tethers: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.PosX, actor.PosY, centerX, centerY);
        data.galeTetherDirNum = (dirNum + 4) % 8;
      },
      infoText: (data, matches, output) => {
        if (
          data.galeTetherDirNum !== undefined && data.me === matches.target
        ) {
          // This will trigger for each tether a player has
          const dir = output[Directions.outputFrom8DirNum(data.galeTetherDirNum)]!();
          return output.knockbackTetherDir!({ dir: dir });
        }

        if (data.galeTetherDirNum === undefined && data.galeTetherCount === 4)
          return output.knockbackTowers!();
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        knockbackTetherDir: {
          en: 'Tether: Knockback to ${dir}',
          de: 'Verbindung: Rückstoß nach ${dir}',
          ja: '線: ${dir}へノックバック',
          cn: '击退拉线: ${dir}',
          ko: '선: ${dir}로 넉백',
        },
        knockbackTowers: {
          en: 'Knockback Towers',
          de: 'Rückstoß-Türme',
          ja: 'ノックバック塔踏み',
          cn: '击退踩塔',
          ko: '넉백 탑',
        },
      },
    },
    {
      id: 'R8S Terrestrial Titans Towerfall Safe Spots',
      // A3C5 Terrestrial Titans
      // A3C6 Towerfall
      // East/West Towers are (93, 100) and (107, 100)
      // North/South Towers are (100, 93) and (100, 107)
      type: 'StartsUsingExtra',
      netRegex: { id: 'A3C5', capture: true },
      durationSeconds: 15,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const getTowerfallSafeDir = (
          hdg: number,
        ): 'SENW' | 'NESW' | undefined => {
          switch (hdg) {
            case 1:
            case 5:
              return 'SENW';
            case 3:
            case 7:
              return 'NESW';
          }
          return undefined;
        };
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const hdg = Directions.hdgTo8DirNum(parseFloat(matches.heading));

        // towerDirs will be undefined if we receive bad coords
        if ((x >= 92 && x <= 94) || (x >= 106 && x <= 108))
          data.towerDirs = 'EW';
        else if ((y >= 92 && y <= 94) || (y >= 106 && y <= 108))
          data.towerDirs = 'NS';

        data.towerfallSafeDirs = getTowerfallSafeDir(hdg);

        if (data.towerfallSafeDirs === undefined)
          return;

        const safeDir1 = data.towerfallSafeDirs === 'SENW'
          ? output['dirSE']!()
          : output['dirNE']!();
        const safeDir2 = data.towerfallSafeDirs === 'SENW'
          ? output['dirNW']!()
          : output['dirSW']!();

        return output.dirs!({ dir1: safeDir1, dir2: safeDir2 });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        dirs: {
          en: '${dir1} or ${dir2}',
          de: '${dir1} oder ${dir2}',
          ja: '${dir1} か ${dir2}',
          cn: '${dir1} 或 ${dir2}',
          ko: '${dir1} 또는 ${dir2}',
        },
      },
    },
    {
      id: 'R8S Titanic Pursuit',
      type: 'StartsUsing',
      netRegex: { id: 'A3C7', source: 'Howling Blade', capture: false },
      response: Responses.aoe(),
    },
    {
      // Gleaming Fang's cast Fanged Crossing (A3D7) 2.1s after ActorControlExtra
      // This ActorControlExtra is in Terrestrial Titans and Terrestrial Rage
      // Gleaming Fangs in Terrestrial Titans are at:
      // NS Towers: (108, 100) E, (92, 100) W
      // EW Towers: (100, 92) N, (100, 108) S
      // 2 spawn in Terrestrial Titans, 5 in Terrestrial Rage
      id: 'R8S Terrestrial Titans Safe Spot',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: '11D1', capture: true },
      condition: (data, matches) => {
        if (data.phase === 'one') {
          data.fangedCrossingIds.push(parseInt(matches.id, 16));
          if (data.fangedCrossingIds.length === 2)
            return true;
        }
        return false;
      },
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [...data.fangedCrossingIds],
        })).combatants;
        if (actors.length !== 2 || actors[0] === undefined || actors[1] === undefined) {
          console.error(
            `R8S Terrestrial Titans Safe Spot: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const hdg1 = Directions.hdgTo8DirNum(actors[0].Heading);
        const hdg2 = Directions.hdgTo8DirNum(actors[1].Heading);

        // Only trigger on the actor targetting intercards
        const isFang1Plus = (hdg1 === 0 || hdg1 === 2 || hdg1 === 4 || hdg1 === 6);
        const isFang2Plus = (hdg2 === 0 || hdg2 === 2 || hdg2 === 4 || hdg2 === 6);
        if ((isFang1Plus && isFang2Plus) || (!isFang1Plus && !isFang2Plus)) {
          console.error(
            `R8S Terrestrial Titans Safe Spot: Both fangs detected facing same way.`,
          );
          return;
        }
        const actor = isFang1Plus ? actors[1] : actors[0];

        if (data.towerfallSafeDirs === undefined)
          return;

        const x = actor.PosX;
        const y = actor.PosY;
        const towerfallSafeDirs = data.towerfallSafeDirs;

        // Assume towerDirs from Fang if received bad coords for towers
        if (data.towerDirs === undefined) {
          if (y > 99 && y < 100)
            data.towerDirs === 'NS';
          else if (x > 99 && x < 101)
            data.towerDirs === 'EW';
          else
            return;
        }
        const towerDirs = data.towerDirs;

        if (
          towerfallSafeDirs === 'SENW' &&
          ((towerDirs === 'EW' && y < 100) || (towerDirs === 'NS' && x < 100))
        )
          data.towerfallSafeDir = 'dirNW';
        else if (
          towerfallSafeDirs === 'SENW' &&
          ((towerDirs === 'EW' && y > 100) || (towerDirs === 'NS' && x > 100))
        )
          data.towerfallSafeDir = 'dirSE';
        else if (
          towerfallSafeDirs === 'NESW' &&
          ((towerDirs === 'EW' && y < 100) || (towerDirs === 'NS' && x > 100))
        )
          data.towerfallSafeDir = 'dirNE';
        else if (
          towerfallSafeDirs === 'NESW' &&
          ((towerDirs === 'EW' && y > 100) || (towerDirs === 'NS' && x < 100))
        )
          data.towerfallSafeDir = 'dirSW';
        else
          data.towerfallSafeDir = 'unknown';
      },
      infoText: (data, _matches, output) => {
        if (data.towerfallSafeDir === undefined)
          return;

        return output[data.towerfallSafeDir]!();
      },
      outputStrings: Directions.outputStringsIntercardDir,
    },
    {
      id: 'R8S Tracking Tremors',
      type: 'StartsUsing',
      netRegex: { id: 'A3B9', source: 'Howling Blade', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
      },
    },
    {
      id: 'R8S Great Divide',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.tankbuster], capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R8S Howling Havoc',
      // There are two additional casts, but only the Wolf Of Stone cast one (A3DD) does damage
      // A3DC Howling Havoc from Wolf of Stone self-cast
      // A3DB Howling Havoc from Wolf of Wind self-cast
      type: 'StartsUsing',
      netRegex: { id: 'A3DD', source: 'Wolf Of Stone', capture: true },
      // 4.7s castTime
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2,
      response: Responses.aoe(),
    },
    {
      id: 'R8S Tactical Pack Tethers',
      // TODO: Call East/West instead of add?
      type: 'Tether',
      netRegex: { id: [headMarkerData.stoneTether, headMarkerData.windTether], capture: true },
      condition: (data, matches) => data.me === matches.source,
      infoText: (_data, matches, output) => {
        if (matches.id === headMarkerData.stoneTether)
          return output.side!({ wolf: output.wolfOfWind!() });
        return output.side!({ wolf: output.wolfOfStone!() });
      },
      outputStrings: {
        wolfOfWind: {
          en: 'Green',
          de: 'Grün',
          ja: '緑',
          cn: '绿',
          ko: '초록',
        },
        wolfOfStone: {
          en: 'Yellow',
          de: 'Gelb',
          ja: '黄',
          cn: '黄',
          ko: '노랑',
        },
        side: {
          en: '${wolf} Side',
          de: '${wolf} Seite',
          ja: '${wolf} 側',
          cn: '${wolf} 侧',
          ko: '${wolf} 쪽',
        },
      },
    },
    {
      id: 'R8S Tactical Pack Debuffs',
      // Durations could be 21s, 37s, or 54s
      type: 'GainsEffect',
      netRegex: { effectId: ['1127', '1128'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.phase === 'adds';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = stoneWindOutputStrings;

        // 1127 = Earthborne End (Yellow Cube) Debuff
        // 1128 = Windborne End (Green Sphere) Debuff
        const cubeDebuffId = '1127';
        data.stoneWindDebuff = matches.effectId === cubeDebuffId ? 'stone' : 'wind';

        if (parseFloat(matches.duration) < 22) {
          data.stoneWindCallGroup = 1;
        } else if (parseFloat(matches.duration) < 38) {
          data.stoneWindCallGroup = 2;
        } else {
          data.stoneWindCallGroup = 3;
        }

        return {
          infoText: output.stoneWindNum!({
            debuff: output[data.stoneWindDebuff]!(),
            num: data.stoneWindCallGroup,
          }),
        };
      },
    },
    {
      // headmarkers with casts:
      // A3CF (Pack Predation) from Wolf of Wind
      // A3E4 (Pack Predation) from Wolf of Stone
      // Simultaneously highest aggro gets cleaved:
      // A3CD (Alpha Wind) from Wolf of Wind
      // A3E2 (Alpha Wind) from Wolf of Stone
      id: 'R8S Pack Predation',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.predation },
      condition: (data) => data.phase === 'adds',
      infoText: (data, matches, output) => {
        data.packPredationTargets.push(matches.target);
        if (data.packPredationTargets.length < 2)
          return;

        // Increment count for group tracking
        data.packPredationTracker = data.packPredationTracker + 1;

        const name1 = data.party.member(data.packPredationTargets[0]);
        const name2 = data.party.member(data.packPredationTargets[1]);

        return output.predationOnPlayers!({ player1: name1, player2: name2 });
      },
      run: (data) => {
        if (data.packPredationTargets.length >= 2)
          data.packPredationTargets = [];
      },
      outputStrings: {
        predationOnPlayers: {
          en: 'Predation on ${player1} and ${player2}',
          de: 'Lichtwolfszirkel auf ${player1} und ${player2}',
          ja: '${player1} と ${player2} に直線攻撃',
          cn: '${player1} 与 ${player2} 引导直线',
          ko: '${player1} + ${player2} 징 대상자',
        },
      },
    },
    {
      id: 'R8S Tactical Pack First Pop',
      // infoText as we do not know who should pop first
      // TODO: Add config for selecting wind/earth first
      // These will trigger the following spells on cleanse
      // A3EE (Sand Surge) from Font of Earth Aether
      // A3ED (Wind Surge) from Font of Wind Aether
      type: 'GainsEffect',
      netRegex: { effectId: 'B7D', capture: true },
      condition: (data, matches) => data.phase === 'adds' && parseFloat(matches.duration) < 2,
      // Magic Vulnerabilities from Pack Predation and Alpha Wind are 0.96s
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.stoneWindCallGroup === data.packPredationTracker) {
          return output.stoneWindNum!({
            debuff: output[data.stoneWindDebuff ?? 'unknown']!(),
            num: data.stoneWindCallGroup,
          });
        }
      },
      outputStrings: stoneWindOutputStrings,
    },
    {
      id: 'R8S Tactical Pack Cleanup',
      type: 'LosesEffect',
      netRegex: { effectId: ['1127', '1128'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.stoneWindCallGroup = undefined,
    },
    {
      id: 'R8S Tactical Pack Second Pop',
      // Timing based on Tether and Magic Vulnerability (3.96s)
      type: 'GainsEffect',
      netRegex: { effectId: 'B7D', capture: true },
      condition: (data, matches) => {
        return data.phase === 'adds' && parseFloat(matches.duration) > 2;
      },
      preRun: (data) => data.surgeTracker = data.surgeTracker + 1,
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 1,
      alarmText: (data, _matches, output) => {
        const surge = data.surgeTracker;
        if (data.stoneWindCallGroup === data.packPredationTracker) {
          if (surge === 1 || surge === 3 || surge === 5) {
            return output.stoneWindNum!({
              debuff: output[data.stoneWindDebuff ?? 'unknown']!(),
              num: data.stoneWindCallGroup,
            });
          }
        }
      },
      outputStrings: stoneWindOutputStrings,
    },
    {
      id: 'R8S Ravenous Saber',
      type: 'StartsUsing',
      netRegex: { id: 'A749', source: 'Howling Blade', capture: false },
      durationSeconds: 7,
      response: Responses.bigAoe(),
    },
    {
      id: 'R8S Spread/Stack Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread] },
      run: (data, matches) => {
        const id = matches.id;
        const target = matches.target;
        if (headMarkerData.stack === id)
          data.stackOnPlayer = target;
        if (headMarkerData.spread === id && target === data.me)
          data.hasSpread = true;
      },
    },
    {
      id: 'R8S Terrestrial Rage Spread/Stack',
      // For Shadowchase (A3BC), actors available roughly 2.9s after cast
      // Only need one of the 5 actors to determine pattern
      // Ids are sequential, starting 2 less than the boss
      // Two patterns (in order of IDs):
      // S, WSW, NW, NE, ESE
      // N, ENE, SE, SW, WNW
      // TODO: Add call for pattern to aid in determining spread spots and stack spot
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread], capture: false },
      condition: (data) => data.phase === 'rage',
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.hasSpread)
          return data.isFirstRage ? output.spreadThenStack!() : output.spreadBehindClones!();

        if (data.stackOnPlayer === data.me)
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnYou!(),
            })
            : output.stackOnYouBehindClones!();

        if (data.stackOnPlayer !== undefined) {
          const name = data.party.member(data.stackOnPlayer);
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnPlayer!({ player: name }),
            })
            : output.stackOnPlayerBehindClones!({ player: name });
        }
      },
      run: (data) => {
        data.stackOnPlayer = undefined;
        data.hasSpread = undefined;
        data.isFirstRage = false;
      },
      outputStrings: {
        spreadThenStack: Outputs.spreadThenStack,
        stackThenSpread: {
          en: '${stack} => Spread',
          de: '${stack} => Verteilen',
          ja: '${stack} => 散開',
          cn: '${stack} => 散开',
          ko: '${stack} => 산개',
        },
        spreadBehindClones: {
          en: 'Spread (Behind Clones)',
          de: 'Verteilen (hinter Klone)',
          ja: '散開 (分身の後ろ)',
          cn: '分散 (躲在分身后)',
          ko: '산개 (분신 뒤)',
        },
        stackOnPlayer: Outputs.stackOnPlayer,
        stackOnPlayerBehindClones: {
          en: 'Stack on ${player} (Behind Clones)',
          de: 'Sammeln auf ${player} (hinter Klone)',
          ja: '${player} に頭割り (分身の後ろ)',
          cn: '${player} 分摊 (躲在分身后)',
          ko: '${player}에게 모이기 (분신 뒤)',
        },
        stackOnYou: Outputs.stackOnYou,
        stackOnYouBehindClones: {
          en: 'Stack on YOU (Behind Clones)',
          de: 'Sammeln auf DIR (hinter Klone)',
          ja: '自分に頭割り (分身の後ろ)',
          cn: '分摊点名 (躲在分身后)',
          ko: '쉐어징 대상자 (분신 뒤)',
        },
      },
    },
    {
      id: 'R8S Shadowchase Rotate',
      // Call to move behind Dragon Head after clones dash
      type: 'StartsUsing',
      netRegex: { id: 'A3BD', source: 'Howling Blade', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => {
        return output.rotate!();
      },
      outputStrings: {
        rotate: {
          en: 'Rotate',
          de: 'Rotieren',
          ja: '回転',
          cn: '旋转',
          ko: '회전',
        },
      },
    },
    {
      id: 'R8S Weal of Stone',
      // TODO: Add direction such as Avoid lines from ${dir}
      type: 'StartsUsing',
      netRegex: { id: 'A78E', source: 'Wolf of Stone', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => {
        return output.lines!();
      },
      outputStrings: {
        lines: {
          en: 'Avoid Lines',
          de: 'Vermeide Linien',
          ja: '直線攻撃を避ける',
          cn: '躲避直线 AoE',
          ko: '직선장판 피하기',
        },
      },
    },
    {
      id: 'R8S Beckon Moonlight Quadrants',
      type: 'Ability',
      // A3E0 => Right cleave self-cast
      // A3E1 => Left cleave self-cast
      netRegex: { id: ['A3E0', 'A3E1'], source: 'Moonlit Shadow', capture: true },
      delaySeconds: 0.1,
      durationSeconds: 10,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Beckon Moonlight Quadrants: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.PosX, actor.PosY, centerX, centerY);
        // Moonbeam's Bite (A3C2 Left / A3C3 Right) half-room cleaves
        // Defining the cleaved side
        if (matches.id === 'A3E0') {
          const counterclock = dirNum === 0 ? 6 : dirNum - 2;
          data.moonbeamBites.push(counterclock);
        }
        if (matches.id === 'A3E1') {
          const clockwise = (dirNum + 2) % 8;
          data.moonbeamBites.push(clockwise);
        }
      },
      infoText: (data, _matches, output) => {
        if (data.moonbeamBites.length === 1 || data.moonbeamBites.length === 3)
          return;

        const quadrants = [1, 3, 5, 7];
        const moonbeam1 = data.moonbeamBites[0] ?? -1;
        const moonbeam2 = data.moonbeamBites[1] ?? -1;
        let safeQuads1 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam1 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== (moonbeam1 === 0 ? 7 : moonbeam1 - 1);
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== moonbeam2 + 1;
        });
        safeQuads1 = safeQuads1.filter((quadrant) => {
          return quadrant !== (moonbeam2 === 0 ? 7 : moonbeam2 - 1);
        });

        // Early output for first two
        if (data.moonbeamBites.length === 2) {
          if (safeQuads1.length !== 1 || safeQuads1[0] === undefined) {
            console.error(
              `R8S Beckon Moonlight Quadrants: Invalid safeQuads1, length of ${safeQuads1.length}.`,
            );
            return;
          }
          const quad = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
          return output.safeQuad!({ quad: quad });
        }

        const moonbeam3 = data.moonbeamBites[2] ?? -1;
        const moonbeam4 = data.moonbeamBites[3] ?? -1;
        let safeQuads2 = quadrants.filter((quadrant) => {
          return quadrant !== moonbeam3 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== (moonbeam3 === 0 ? 7 : moonbeam3 - 1);
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== moonbeam4 + 1;
        });
        safeQuads2 = safeQuads2.filter((quadrant) => {
          return quadrant !== (moonbeam4 === 0 ? 7 : moonbeam4 - 1);
        });

        if (safeQuads1[0] === undefined || safeQuads2[0] === undefined) {
          console.error(
            `R8S Beckon Moonlight Quadrants: First safeQuads missing`,
          );
          return;
        }
        if (safeQuads1.length !== 1) {
          console.error(
            `R8S Beckon Moonlight Quadrants: Invalid safeQuads1, length of ${safeQuads1.length}`,
          );
          return;
        }
        if (safeQuads2.length !== 1) {
          console.error(
            `R8S Beckon Moonlight Quadrants: Invalid safeQuads2, length of ${safeQuads2.length}`,
          );
          return;
        }

        // Store quadrant for move call
        data.moonlightQuadrant2 = output[Directions.outputFrom8DirNum(safeQuads2[0] ?? -1)]!();

        const quad1 = output[Directions.outputFrom8DirNum(safeQuads1[0] ?? -1)]!();
        return output.safeQuadrants!({ quad1: quad1, quad2: data.moonlightQuadrant2 });
      },
      outputStrings: moonlightOutputStrings,
    },
    {
      id: 'R8S Beckon Moonlight Spread/Stack',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.stack, headMarkerData.spread], capture: false },
      condition: (data) => data.phase === 'moonlight',
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.hasSpread)
          return data.isFirstRage ? output.spreadThenStack!() : output.spread!();

        if (data.stackOnPlayer === data.me)
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnYou!(),
            })
            : output.stackOnYou!();

        if (data.stackOnPlayer !== undefined) {
          const name = data.party.member(data.stackOnPlayer);
          return data.isFirstRage
            ? output.stackThenSpread!({
              stack: output.stackOnPlayer!({ player: name }),
            })
            : output.stackOnPlayer!({ player: name });
        }
      },
      run: (data) => {
        data.stackOnPlayer = undefined;
        data.hasSpread = undefined;
        data.isFirstRage = false;
      },
      outputStrings: {
        spreadThenStack: Outputs.spreadThenStack,
        stackThenSpread: {
          en: '${stack} => Spread',
          de: '${stack} => Verteilen',
          ja: '${stack} => 散開',
          cn: '${stack} => 分散',
          ko: '${stack} => 산개',
        },
        spread: Outputs.spread,
        stackOnPlayer: Outputs.stackOnPlayer,
        stackOnYou: Outputs.stackOnYou,
      },
    },
    {
      id: 'R8S Beckon Moonlight Quadrant Two',
      type: 'StartsUsing',
      // A3C2 => Moonbeam's Bite dash with Left cleave
      // A3C3 => Moonbeam's Bite dash with Right cleave
      netRegex: { id: ['A3C2', 'A3C3'], source: 'Moonlit Shadow', capture: true },
      condition: (data) => {
        data.moonbeamBitesTracker = data.moonbeamBitesTracker + 1;
        if (data.moonbeamBitesTracker === 2)
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      infoText: (data, _matches, output) => {
        return output.safeQuad!({ quad: data.moonlightQuadrant2 });
      },
      outputStrings: moonlightOutputStrings,
    },
    {
      id: 'R8S Weal of Stone Cardinals',
      // There are two casts and cardinals is always safe:
      // A791 Weal of Stone
      // A792 Weal of Stone
      // Due to timing of this impacting Windfang/Stonefang, call earlier
      // Using Moonbeam Bites +1s for spread (A3BF) and stack (A3C0) abilities to complete
      type: 'StartsUsing',
      netRegex: { id: ['A3C2', 'A3C3'], source: 'Moonlit Shadow', capture: true },
      condition: (data) => {
        if (data.moonbeamBitesTracker === 4)
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 1,
      infoText: (_data, _matches, output) => {
        return output.cardinals!();
      },
      outputStrings: {
        cardinals: Outputs.cardinals,
      },
    },
    // Phase 2
    {
      id: 'R8S Quake III',
      type: 'StartsUsing',
      netRegex: { id: 'A45A', source: 'Howling Blade', capture: false },
      alertText: (_data, _matches, output) => output.healerGroups!(),
      outputStrings: {
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      // headmarkers with casts:
      // A45D (Ultraviolent Ray)
      // TODO: Determine platform to move to based on player positions/role?
      id: 'R8S Ultraviolent Ray Target',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.ultraviolent },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => {
        return output.uvRayOnYou!();
      },
      run: (data) => data.hasUVRay = true,
      outputStrings: {
        uvRayOnYou: {
          en: 'UV Ray on YOU',
          de: 'Ätherlicht auf DIR',
          ja: '自分に魔光',
          cn: '魔光点名',
          ko: '파란징 대상자',
        },
      },
    },
    {
      // Gleaming Fang's cast Gleaming Beam (A45E) 2.1s after ActorControlExtra
      // PlayActionTimeline param1 of '11D3' is unique to the Ultraviolent Ray and Champion's Circuit
      // Five spawn for Ultraviolent Ray, 10 spawn for Champion's Circuit
      id: 'R8S Gleaming Beam',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: '11D3', capture: true },
      condition: (data) => {
        if (data.phase !== 'twofold')
          return true;
        return false;
      },
      preRun: (data, matches) => data.gleamingBeamIds.push(parseInt(matches.id, 16)),
      delaySeconds: (data) => {
        // Return later if player has UV Ray to allow for platform change
        if (data.hasUVRay === true)
          return 3; // A45E has 4s castTime, 6.1s - 3s = 3.1s before beam
        return 0;
      },
      promise: async (data) => {
        // Wait for all 5
        if (data.gleamingBeamIds.length !== 5)
          return;

        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R8S Gleaming Beam: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatformNum = getPlatformNum(me.PosX, me.PosY);
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [...data.gleamingBeamIds],
        })).combatants;
        if (
          actors.length !== 5 || actors[0] === undefined ||
          actors[1] === undefined || actors[2] === undefined ||
          actors[3] === undefined || actors[4] === undefined
        ) {
          console.error(
            `R8S Gleaming Beam: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const fang = findFang(actors, data.myPlatformNum);

        if (fang === undefined)
          return;

        data.uvFangSafeSide = getFangSafeSide(fang.PosX, data.myPlatformNum);
      },
      infoText: (data, _matches, output) => {
        if (data.gleamingBeamIds.length !== 5)
          return;
        // Prevent firing again if delay changes
        data.gleamingBeamIds = [];

        const dir = data.uvFangSafeSide;
        return output[dir ?? 'unknown']!();
      },
      run: (data) => {
        if (data.uvFangSafeSide !== undefined) {
          data.myPlatformNum = undefined;
          data.uvFangSafeSide = undefined;
          data.hasUVRay = false;
        }
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R8S Twinbite',
      type: 'StartsUsing',
      netRegex: { id: 'A4CD', source: 'Howling Blade', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R8S Fanged Maw/Perimeter Collect',
      // A463 Fanged Maw (In cleave)
      // A464 Fanged Perimeter (Out cleave)
      type: 'StartsUsing',
      netRegex: { id: ['A463', 'A464'], source: 'Gleaming Fang', capture: true },
      run: (data, matches) => {
        data.herosBlowInOut = matches.id === 'A463' ? 'out' : 'in';
      },
    },
    {
      id: 'R8S Hero\'s Blow',
      // Has two casts
      // A45F for Hero's Blow Left cleave
      // A460 for Hero's Blow Left cleave damage
      // A461 Hero's Blow Right cleave
      // A462 Hero's Blow Right cleave damage
      // Hero's Blow targets a player, the player could be anywhere
      // Call relative to boss facing
      type: 'StartsUsing',
      netRegex: { id: ['A45F', 'A461'], source: 'Howling Blade', capture: true },
      delaySeconds: 0.3,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Hero's Blow: Wrong actor count ${actors.length}`,
          );
          return;
        }

        switch (matches.id) {
          case 'A45F':
            data.herosBlowSafeDir = Math.abs(Directions.hdgTo16DirNum(actor.Heading) - 4) % 16;
            break;
          case 'A461':
            data.herosBlowSafeDir = (Directions.hdgTo16DirNum(actor.Heading) + 4) % 16;
            break;
        }
      },
      infoText: (data, _matches, output) => {
        const inout = output[data.herosBlowInOut ?? 'unknown']!();
        const dir = output[Directions.output16Dir[data.herosBlowSafeDir ?? -1] ?? 'unknown']!();
        return output.text!({ inout: inout, dir: dir });
      },
      run: (data) => {
        data.herosBlowSafeDir = undefined;
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        in: Outputs.in,
        out: Outputs.out,
        left: Outputs.left,
        right: Outputs.right,
        text: {
          en: '${inout} + ${dir}',
          de: '${inout} + ${dir}',
          ja: '${inout} + ${dir}',
          cn: '${inout} + ${dir}',
          ko: '${inout} + ${dir}',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R8S Mooncleaver',
      type: 'StartsUsing',
      netRegex: { id: 'A465', source: 'Howling Blade', capture: false },
      infoText: (_data, _matches, output) => output.changePlatform!(),
      outputStrings: {
        changePlatform: {
          en: 'Change Platform',
          de: 'Platform wechseln',
          ja: '次の島へ',
          cn: '换平台',
          ko: '플랫폼 변경',
        },
      },
    },
    {
      // headmarkers with casts:
      // A467 (Elemental Purge)
      // A468 (Aerotemporal Blast) on one random non-tank
      // A469 (Geotemporal Blast) on one Tank
      id: 'R8S Elemental Purge Targets',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.predation },
      condition: (data) => data.phase === 'two',
      infoText: (data, matches, output) => {
        data.purgeTargets.push(matches.target);
        if (data.purgeTargets.length < 2)
          return;

        const name1 = data.party.member(data.purgeTargets[0]);
        const name2 = data.party.member(data.purgeTargets[1]);

        return output.purgeOnPlayers!({ player1: name1, player2: name2 });
      },
      run: (data) => {
        if (data.purgeTargets.length >= 2)
          data.purgeTargets = [];
      },
      outputStrings: {
        purgeOnPlayers: {
          en: 'Elemental Purge on ${player1} and ${player2}',
          de: 'Siegel des Windes auf ${player1} und ${player2}',
          ja: '魔印: ${player1} と ${player2}',
          cn: '魔印点名: ${player1} 和 ${player2}',
        },
      },
    },
    {
      id: 'R8S Twofold Tempest Tether Tracker',
      type: 'Tether',
      netRegex: { id: [headMarkerData.twofoldTether], capture: true },
      run: (data, matches) => {
        if (matches.target === data.me)
          data.hasTwofoldTether = true;
        else
          data.hasTwofoldTether = false;
      },
    },
    {
      id: 'R8S Twofold Tempest Initial Tether/Bait',
      type: 'Tether',
      netRegex: { id: [headMarkerData.twofoldTether], capture: true },
      suppressSeconds: 50, // Duration of mechanic
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.targetId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R8S Twofold Tempest Initial Tether/Bait: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const northTwoPlatforms = 94;
        const dirNS = actor.PosY < northTwoPlatforms ? 'N' : 'S';
        const dirEW = actor.PosX > centerX ? 'E' : 'W';

        if (dirNS === 'N' && dirEW === 'E')
          data.twofoldInitialDir = 'dirNE';
        else if (dirNS === 'S' && dirEW === 'E')
          data.twofoldInitialDir = 'dirSE';
        else if (dirNS === 'S' && dirEW === 'W')
          data.twofoldInitialDir = 'dirSW';
        else if (dirNS === 'N' && dirEW === 'W')
          data.twofoldInitialDir = 'dirNW';

        // Check player position for bait call
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R8S Twofold Tempest Initial Tether/Bait: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatformNum = getPlatformNum(me.PosX, me.PosY);
      },
      infoText: (data, _matches, output) => {
        // Default starting tether locations
        const startingDir1 = 'dirSE';
        const startingDir2 = 'dirSW';

        const initialDir = data.twofoldInitialDir ?? 'unknown';
        const baitDir = twofoldPlatformNumToBaitDir[data.myPlatformNum ?? 0];

        switch (initialDir) {
          case startingDir1:
          case startingDir2:
            if (data.hasTwofoldTether === true)
              return output.tetherOnYou!();
            if (baitDir === initialDir)
              return output.baitNearTetherDir!({ dir: output[initialDir]!() });
            return output.tetherOnDir!({ dir: output[initialDir]!() });
          case 'dirNE':
            if (data.hasTwofoldTether === true)
              return output.passTetherDir!({ dir: output[startingDir1]!() });
            if (baitDir === startingDir1)
              return output.baitNearTetherDir!({ dir: output[startingDir1]!() });
            return output.tetherOnDir!({ dir: output[startingDir1]!() });
          case 'dirNW':
            if (data.hasTwofoldTether === true)
              return output.passTetherDir!({ dir: output[startingDir2]!() });
            if (baitDir === startingDir2)
              return output.baitNearTetherDir!({ dir: output[startingDir2]!() });
            return output.tetherOnDir!({ dir: output[startingDir2]!() });
          case 'unknown':
            return output.tetherOnDir!({ dir: output['unknown']!() });
        }
      },
      run: (data) => {
        // Set initialDir if pass was needed
        if (data.twofoldInitialDir === 'dirNE')
          data.twofoldInitialDir = 'dirSE';
        if (data.twofoldInitialDir === 'dirNW')
          data.twofoldInitialDir = 'dirSW';
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        passTetherDir: {
          en: 'Pass Tether to ${dir}',
          de: 'Übergebe Verbindung nach ${dir}',
          ja: '${dir} に線を渡す',
          cn: '送线给 ${dir}',
          ko: '${dir}로 선 넘기기',
        },
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          ja: '自分に線',
          cn: '连线点名',
          ko: '선 대상자',
        },
        tetherOnDir: {
          en: 'Tether on ${dir}',
          de: 'Verbindung auf ${dir}',
          ja: '${dir} に線',
          cn: '连线在 ${dir}',
          ko: '${dir}쪽에 선',
        },
        baitNearTetherDir: {
          en: 'Bait Near (Tether on ${dir})',
          cn: '靠近诱导 (连线在 ${dir})',
        },
      },
    },
    {
      id: 'R8S Twofold Tempest Tether Pass/Bait',
      // Call pass after the puddle has been dropped
      type: 'Ability',
      netRegex: { id: 'A472', source: 'Howling Blade', capture: false },
      preRun: (data) => data.twofoldTracker = data.twofoldTracker + 1,
      suppressSeconds: 1,
      promise: async (data) => {
        // Check player position for bait call
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R8S Twofold Tempest Tether Pass/Bait: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatformNum = getPlatformNum(me.PosX, me.PosY);
      },
      infoText: (data, _matches, output) => {
        if (data.hasTwofoldTether) {
          if (data.twofoldInitialDir === 'unknown')
            return output.passTether!();
          if (data.twofoldTracker === 1) {
            const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirNE' : 'dirNW';
            return output.passTetherDir!({ dir: output[passDir]!() });
          }
          if (data.twofoldTracker === 2) {
            const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirNW' : 'dirNE';
            return output.passTetherDir!({ dir: output[passDir]!() });
          }
          if (data.twofoldTracker === 3) {
            const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirSW' : 'dirSE';
            return output.passTetherDir!({ dir: output[passDir]!() });
          }
        }
        if (data.twofoldInitialDir === 'unknown')
          return output.tetherOnDir!({ dir: Outputs.unknown });
        const baitDir = twofoldPlatformNumToBaitDir[data.myPlatformNum ?? 0];
        if (data.twofoldTracker === 1) {
          const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirNE' : 'dirNW';
          if (baitDir === passDir)
            return output.baitNearTetherDir!({ dir: output[passDir]!() });
          return output.tetherOnDir!({ dir: output[passDir]!() });
        }
        if (data.twofoldTracker === 2) {
          const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirNW' : 'dirNE';
          if (baitDir === passDir)
            return output.baitNearTetherDir!({ dir: output[passDir]!() });
          return output.tetherOnDir!({ dir: output[passDir]!() });
        }
        if (data.twofoldTracker === 3) {
          const passDir = data.twofoldInitialDir === 'dirSE' ? 'dirSW' : 'dirSE';
          if (baitDir === passDir)
            return output.baitNearTetherDir!({ dir: output[passDir]!() });
          return output.tetherOnDir!({ dir: output[passDir]!() });
        }
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        passTether: {
          en: 'Pass Tether',
          de: 'Verbindung übergeben',
          ja: '線を渡す',
          cn: '送线',
          ko: '선 넘기기',
        },
        passTetherDir: {
          en: 'Pass Tether ${dir}',
          de: 'Verbindung übergeben ${dir}',
          ja: '${dir} に線を渡す',
          cn: '送线给 ${dir}',
          ko: '${dir}쪽에 선 넘기기',
        },
        tetherOnDir: {
          en: 'Tether on ${dir}',
          de: 'Verbindung auf ${dir}',
          ja: '${dir} に線',
          cn: '连线在 ${dir}',
          ko: '${dir}쪽에 선',
        },
        baitNearTetherDir: {
          en: 'Bait Near (Tether on ${dir})',
          cn: '靠近诱导 (连线在 ${dir})',
        },
      },
    },
    {
      // headmarker on boss with casts:
      // A477 Champion's Circuit (clockwise)
      // A478 Champion's Circuit (counterclockwise)
      // Followed by instant cast turns:
      // A4A1 Champion's Circuit (clockwise)
      // A4A2 Champion's Circuit (counterclockwise)
      id: 'R8S Champion\'s Circuit Direction Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.clockwise, headMarkerData.counterclockwise] },
      run: (data, matches) => {
        if (matches.id === headMarkerData.clockwise)
          data.championClock = 'clockwise';
        else
          data.championClock = 'counterclockwise';
      },
    },
    {
      id: 'R8S Champion\'s Circuit Mechanic Order',
      // First Casts:
      // A479 Champion's Circuit Sides safe (middle cleave)
      // A47A Champion's Circuit Donut
      // A47B Champion's Circuit In safe (halfmoon cleave)
      // A47C Champion's Circuit Out safe (in circle)
      // A47D Champion's Circuit In safe (halfmoon cleave)
      // Subsequent Casts:
      // A47E Champion's Circuit Sides (middle cleave)
      // A47F Champion's Circuit Donut
      // A480 Champion's Circuit In safe (halfmoon cleave)
      // A481 Champion's Circuit Out safe (in circle)
      // A482 Champion's Circuit In safe (halfmoon cleave)
      // Actor casting the donut is trackable to center of its platform
      // 100,    117.5  Center of S platform
      // 83.36,  105.41 Center of SW platform
      // 89.71,  85.84  Center of NW platform
      // 110.29, 85.84  Center of NE platform
      // 116.64, 105.41 Center of SE platform
      type: 'StartsUsingExtra',
      netRegex: { id: 'A47A', capture: true },
      delaySeconds: 0.1, // Necessary for Headmarkerdata to be guaranteed before
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R8S Champion\'s Circuit Mechanic Order: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myLastPlatformNum = getPlatformNum(me.PosX, me.PosY);
      },
      infoText: (data, matches, output) => {
        if (
          data.championClock === undefined ||
          data.myLastPlatformNum === undefined
        )
          return;
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        data.championDonutStart = getPlatformNum(x, y);

        const clock = data.championClock;
        const donutPlatform = data.championDonutStart;
        const myPlatform = data.myLastPlatformNum;

        // Determine which patterns to search for Champion's Circuit
        const orders: ChampionOrders = clock === 'clockwise'
          ? championClockOrders
          : championCounterOrders;

        data.championOrders = orders;

        // Retrieve the mech based on our platform and donut platform
        const getMech = (
          playerPlatform: number,
          donutPlatform: number,
          mechs: ChampionOrders,
          count: number,
        ): string => {
          const mechIndex = clock === 'clockwise'
            ? (donutPlatform + count) % 5
            : championCounterIndex[donutPlatform]?.[count];

          if (mechIndex === undefined)
            return 'unknown';
          return mechs[playerPlatform]?.[mechIndex] ?? 'unknown';
        };

        return output.mechanics!({
          dir: output[clock]!(),
          mech1: output[getMech(myPlatform, donutPlatform, orders, 0)]!(),
          mech2: output[getMech(myPlatform, donutPlatform, orders, 1)]!(),
          mech3: output[getMech(myPlatform, donutPlatform, orders, 2)]!(),
          mech4: output[getMech(myPlatform, donutPlatform, orders, 3)]!(),
          mech5: output[getMech(myPlatform, donutPlatform, orders, 4)]!(),
        });
      },
      outputStrings: championOutputStrings,
    },
    {
      id: 'R8S Champion\'s Circuit Safe Spot',
      // A476 Gleaming Barrage
      type: 'StartsUsing',
      netRegex: { id: 'A476', source: 'Gleaming Fang', capture: true },
      preRun: (data, matches) => data.gleamingBarrageIds.push(parseInt(matches.sourceId, 16)),
      promise: async (data) => {
        // Wait for all 5
        if (data.gleamingBarrageIds.length !== 5)
          return;

        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R8S Champion\'s Circuit Safe Spot: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatformNum = getPlatformNum(me.PosX, me.PosY);
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [...data.gleamingBarrageIds],
        })).combatants;
        if (
          actors.length !== 5 || actors[0] === undefined ||
          actors[1] === undefined || actors[2] === undefined ||
          actors[3] === undefined || actors[4] === undefined
        ) {
          console.error(
            `R8S Champion\'s Circuit Safe Spot: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const fang = findFang(actors, data.myPlatformNum);

        if (fang === undefined)
          return;

        data.championFangSafeSide = getFangSafeSide(fang.PosX, data.myPlatformNum);
      },
      infoText: (data, _matches, output) => {
        if (data.gleamingBarrageIds.length !== 5)
          return;
        // Prevent firing again if delay changes
        data.gleamingBarrageIds = [];

        const donutPlatform = data.championDonutStart;
        const myPlatform = data.myLastPlatformNum;
        const orders = data.championOrders;
        const clock = data.championClock;
        const count = data.championTracker;

        // Calculate next mech index with wrap around
        const mechIndex = donutPlatform === undefined
          ? undefined
          : clock === 'clockwise'
          ? (donutPlatform + count) % 5
          : championCounterIndex[donutPlatform]?.[count];

        // Retrieve the mech based on our platform, donut platform, and mech index
        const mech = (
            myPlatform === undefined ||
            mechIndex === undefined ||
            orders === undefined ||
            clock === undefined
          )
          ? 'unknown'
          : orders[myPlatform]?.[mechIndex] ?? 'unknown';

        const dir = data.championFangSafeSide;

        if (mech === 'sides') {
          if (dir === 'right')
            return output.rightSide!();
          if (dir === 'left')
            return output.leftSide!();
          return output.unknownSide!();
        }

        return output.dirMechanic!({ dir: output[dir ?? 'unknown']!(), mech: output[mech]!() });
      },
      run: (data) => {
        if (data.championFangSafeSide !== undefined) {
          data.championTracker = data.championTracker + 1;
          // Shift platform history
          data.myLastPlatformNum = data.myPlatformNum;
          data.myPlatformNum = undefined;
          data.championFangSafeSide = undefined;
        }
      },
      outputStrings: championOutputStrings,
    },
    {
      id: 'R8S Lone Wolf\'s Lament Tethers',
      type: 'Tether',
      netRegex: { id: [headMarkerData.farTether, headMarkerData.closeTether] },
      condition: (data, matches) => {
        if (data.me === matches.target || data.me === matches.source)
          return true;
        return false;
      },
      infoText: (_data, matches, output) => {
        if (matches.id === headMarkerData.farTether)
          return output.farTetherOnYou!();
        return output.closeTetherOnYou!();
      },
      outputStrings: {
        closeTetherOnYou: {
          en: 'Close Tether on YOU',
          de: 'Nahe Verbindung auf DIR',
          ja: '自分に近づく線',
          cn: '近线点名',
          ko: '가까이 선 대상자',
        },
        farTetherOnYou: {
          en: 'Far Tether on YOU',
          de: 'Entfernte Verbindung auf DIR',
          ja: '自分に離れる線',
          cn: '远线点名',
          ko: '멀리 선 대상자',
        },
      },
    },
    {
      id: 'R8S Howling Eight',
      // AA02 Howling Eight, first cast
      // A494 Howling Eight, subsequent first casts
      // Suggested Party => Tank Immune => Tank Share => Tank Immune => Party
      type: 'StartsUsing',
      netRegex: { id: ['AA02', 'A494'], source: 'Howling Blade', capture: false },
      durationSeconds: 15,
      infoText: (data, _matches, output) => {
        switch (data.platforms) {
          case 5:
            return output.howlingEight1!();
          case 4:
            return output.howlingEight2!();
          case 3:
            return output.howlingEight3!();
          case 2:
            return output.howlingEight4!();
          case 1:
            return output.howlingEight5!();
        }
      },
      outputStrings: {
        howlingEight1: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
        howlingEight2: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
        howlingEight3: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
        howlingEight4: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
        howlingEight5: {
          en: 'Stack x8',
          de: 'Sammeln x8',
          fr: 'Package x8',
          ja: '頭割り x8',
          cn: '8次分摊',
          ko: '쉐어 8번',
        },
      },
    },
    {
      id: 'R8S Mooncleaver (Enrage Sequence)',
      // Mooncleaver (474C) used during enrage targets Howling Eight platform
      // ~0.45s aftet last hit of Howling Eight (AA0A for first set, A49C others)
      type: 'StartsUsing',
      netRegex: { id: ['AA0A', 'A49C'], source: 'Howling Blade', capture: true },
      condition: (data) => {
        // Tracking how many platforms will remain
        data.platforms = data.platforms - 1;
        return data.platforms !== 0;
      },
      // 14.8s on AA0A 11.8s on A49C
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      infoText: (data, _matches, output) => {
        switch (data.platforms) {
          case 4:
            return output.changePlatform1!();
          case 3:
            return output.changePlatform2!();
          case 2:
            return output.changePlatform3!();
          case 1:
            return output.finalPlatform!();
        }
      },
      outputStrings: {
        changePlatform1: {
          en: 'Change Platform 1',
          de: 'Wechsel Platform 1',
          ja: '次の島へ1',
          cn: '换平台 1',
          ko: '플랫폼 변경 1',
        },
        changePlatform2: {
          en: 'Change Platform 2',
          de: 'Wechsel Platform 2',
          ja: '次の島へ2',
          cn: '换平台 2',
          ko: '플랫폼 변경 2',
        },
        changePlatform3: {
          en: 'Change Platform 3',
          de: 'Wechsel Platform 3',
          ja: '次の島へ3',
          cn: '换平台 3',
          ko: '플랫폼 변경 3',
        },
        finalPlatform: {
          en: 'Change Platform (Final)',
          de: 'Wechsel Platform (Finale)',
          ja: '次の島へ (最終)',
          cn: '换平台 (最终平台)',
          ko: '플랫폼 변경 (마지막)',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Eminent Reign/Revolutionary Reign': 'Eminent/Revolutionary Reign',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': 'Lichtreißer',
        'Howling Blade': 'Heulende Klinge',
        'Moonlit Shadow': 'heulend(?:e|er|es|en) Phantom',
        'Wolf Of Stone': 'Wolf der Erde',
        'Wolf of Stone': 'Wolf der Erde',
        'Wolf of Wind': 'Wolf des Windes',
      },
      'replaceText': {
        '--adds-targetable--': '--Adds-anvisierbar--',
        '--shadow ': '--Schatten ',
        '--tank/line aoes--': '--Tank/Linien AoEs--',
        'Aero III': 'Windga',
        'Aerotemporal Blast': 'Temporärer Wind',
        'Alpha Stone': 'Erde des Lichtwolfs',
        'Alpha Wind': 'Wind des Lichtwolfs',
        'Bare Fangs': 'Lichtreißer-Beschwörung',
        'Beckon Moonlight': 'Phantomwolf-Beschwörung',
        'Breath of Decay': 'Milleniumssäuseln',
        'Champion\'s Circuit': 'Himmelsreigen',
        'Elemental Purge': 'Siegel des Windes',
        'Extraplanar Feast': 'Radikaler Raumspalter',
        'Extraplanar Pursuit': 'Raumspalter',
        'Fanged Charge': 'Lichtreißersturm',
        'Forlorn Stone': 'Heulende Erde',
        'Forlorn Wind': 'Heulender Wind',
        'Geotemporal Blast': 'Temporäres Beben',
        'Gleaming Barrage': 'Multiblitzkanone',
        'Gleaming Beam': 'Blitzartillerie',
        'Great Divide': 'Lichtspalter',
        'Gust': 'Böe',
        'Heavensearth': 'Großes Beben',
        'Hero\'s Blow': 'Leichte Beute',
        'Howling Eight': 'Achtfache Lichtkugel',
        'Howling Havoc': 'Ruf des Sturms',
        'Hunter\'s Harvest': 'Gierige Wolfsklinge',
        'Lone Wolf\'s Lament': 'Fluch des Wolfes',
        'Millennial Decay': 'Milleniumsverwitterung',
        'Moonbeam\'s Bite': 'Phantomwolfsklinge',
        'Mooncleaver': 'Klingensturz',
        'Pack Predation': 'Lichtwolfszirkel',
        'Prowling Gale': 'Windwolfszirkel',
        'Quake III': 'Seisga',
        'Ravenous Saber': 'Wirbellichtklinge',
        'Revolutionary Reign': 'Kreisendes Wolfsrudel',
        'Rise of the Howling Wind': 'Dämonenwolf: Himmelsturm',
        'Rise of the Hunter\'s Blade': 'Dämonenwolf: Klingenfluch',
        'Roaring Wind': 'Jaulender Wind',
        'Shadowchase': 'Echoklinge',
        'Stalking Stone': 'Leuchtende Erde',
        'Stalking Wind': 'Leuchtender Wind',
        'Starcleaver': 'Finaler Klingensturz',
        'Stonefang': 'Kunst der Erde',
        'Suspended Stone': 'Felsen',
        'Tactical Pack': 'Lichtwolf-Beschwörung',
        'Terrestrial Rage': 'Gaias Zorn',
        'Terrestrial Titans': 'Ruf der Erde',
        'Titanic Pursuit': 'Himmelschneider',
        'Towerfall': 'Turmsturz',
        'Tracking Tremors': 'Multi-Beben',
        'Twinbite': 'Doppelreißer',
        'Twofold Tempest': 'Orkanreißer',
        'Ultraviolent Ray': 'Ätherlicht',
        'Weal of Stone': 'Erdspalter',
        'Wind Surge': 'Windbombe',
        'Windfang': 'Kunst des Windes',
        'Winds of Decay': 'Milleniumstaifun',
        'Wolves\' Reign': 'Wolfsrudel',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': 'croc de lumière',
        'Howling Blade': 'Howling Blade',
        'Moonlit Shadow': 'double de Howling Blade',
        'Wolf Of Stone': 'loup de la terre',
        'Wolf of Stone': 'loup de la terre',
        'Wolf of Wind': 'loup du vent',
      },
      'replaceText': {
        'Aero III': 'Méga Vent',
        'Aerotemporal Blast': 'Assaut tempétueux à retardement',
        'Alpha Stone': 'Terre du loup radieux',
        'Alpha Wind': 'Souffle du loup radieux',
        'Bare Fangs': 'Invocation des crocs radieux',
        'Beckon Moonlight': 'Invocation du loup spectral',
        'Breath of Decay': 'Souffle millénaire',
        'Champion\'s Circuit': 'Secousse cosmique',
        'Elemental Purge': 'Sceau du vent et de la terre',
        'Extraplanar Feast': 'Tranchage funeste du vide',
        'Extraplanar Pursuit': 'Tranchage du vide',
        'Fanged Charge': 'Assaut des crocs radieux',
        'Forlorn Stone': 'Hurlement de la terre',
        'Forlorn Wind': 'Hurlement du vent',
        'Geotemporal Blast': 'Assaut tellurique à retardement',
        'Gleaming Barrage': 'Rafale d\'artillerie éclair',
        'Gleaming Beam': 'Artillerie éclair',
        'Great Divide': 'Tranchage net',
        'Gust': 'Bourrasque',
        'Heavensearth': 'Secousse ciblée',
        'Hero\'s Blow': 'Frappe du manche',
        'Howling Eight': 'Octorayon',
        'Howling Havoc': 'Hurlement tempétueux',
        'Hunter\'s Harvest': 'Lame du loup vorace',
        'Lone Wolf\'s Lament': 'Malédiction du loup solitaire',
        'Millennial Decay': 'Érosion millénaire',
        'Moonbeam\'s Bite': 'Lame du loup spectral',
        'Mooncleaver': 'Tranchage éclair',
        'Pack Predation': 'Meute du loup radieux',
        'Prowling Gale': 'Meute des loups du vent',
        'Quake III': 'Méga Séisme',
        'Ravenous Saber': 'Rafale du loup radieux',
        'Revolutionary Reign': 'Lame de la meute tourbillonnante',
        'Rise of the Howling Wind': 'Tempête divine du loup mystique',
        'Rise of the Hunter\'s Blade': 'Lame maudite du loup mystique',
        'Roaring Wind': 'Déferlante du loup tempétueux',
        'Shadowchase': 'Tranchage mirage',
        'Stalking Stone': 'Onde du loup radieux',
        'Stalking Wind': 'Autan du loup radieux',
        'Starcleaver': 'Tranchage éclair final',
        'Stonefang': 'Magie tellurique',
        'Suspended Stone': 'Piliers rocheux',
        'Tactical Pack': 'Invocation du loup radieux',
        'Terrestrial Rage': 'Fureur tellurique',
        'Terrestrial Titans': 'Invocation tellurique',
        'Titanic Pursuit': 'Tranchage du loup spectral',
        'Towerfall': 'Écroulement',
        'Tracking Tremors': 'Secousses en cascade',
        'Twinbite': 'Frappe des crocs jumeaux',
        'Twofold Tempest': 'Tempête de crocs',
        'Ultraviolent Ray': 'Rayon mystique',
        'Weal of Stone': 'Fracas terrestre',
        'Wind Surge': 'Déflagration aérienne',
        'Windfang': 'Magie des tempêtes',
        'Winds of Decay': 'Tempête millénaire',
        'Wolves\' Reign': 'Lame de la meute',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Gleaming Fang': '光の牙',
        'Howling Blade': 'ハウリングブレード',
        'Moonlit Shadow': 'ハウリングブレードの幻影',
        'Wolf Of Stone': '土の狼頭',
        'Wolf of Stone': '土の狼頭',
        'Wolf of Wind': '風の狼頭',
      },
      'replaceText': {
        'Aero III': 'エアロガ',
        'Aerotemporal Blast': '時限風撃',
        'Alpha Stone': '光狼の土',
        'Alpha Wind': '光狼の風',
        'Bare Fangs': '光牙招来',
        'Beckon Moonlight': '幻狼招来',
        'Breath of Decay': '千年の風声',
        'Champion\'s Circuit': '廻天動地',
        'Elemental Purge': '風震の魔印',
        'Extraplanar Feast': '空間斬り・滅',
        'Extraplanar Pursuit': '空間斬り',
        'Fanged Charge': '突進光牙',
        'Forlorn Stone': '土の狼吼',
        'Forlorn Wind': '風の狼吼',
        'Geotemporal Blast': '時限震撃',
        'Gleaming Barrage': '連撃閃光砲',
        'Gleaming Beam': '閃光砲',
        'Great Divide': '一刀両断',
        'Gust': '旋風',
        'Heavensearth': '大震撃',
        'Hero\'s Blow': '鎧袖一触',
        'Howling Eight': '八連光弾',
        'Howling Havoc': '風塵の咆哮',
        'Hunter\'s Harvest': '貪狼の剣',
        'Lone Wolf\'s Lament': '孤狼の呪い',
        'Millennial Decay': '千年の風化',
        'Moonbeam\'s Bite': '幻狼剣',
        'Mooncleaver': '剛刃一閃',
        'Pack Predation': '光狼陣',
        'Prowling Gale': '風狼陣',
        'Quake III': 'クエイガ',
        'Ravenous Saber': '風塵光狼斬',
        'Revolutionary Reign': '廻の群狼剣',
        'Rise of the Howling Wind': '魔狼戦型・天嵐の相',
        'Rise of the Hunter\'s Blade': '魔狼戦型・呪刃の相',
        'Roaring Wind': '風狼豪波',
        'Shadowchase': '残影剣',
        'Stalking Stone': '光狼地烈波',
        'Stalking Wind': '光狼風烈波',
        'Starcleaver': '剛刃一閃・終',
        'Stonefang': '土の魔技',
        'Suspended Stone': '大岩石',
        'Tactical Pack': '光狼招来',
        'Terrestrial Rage': '大地の怒り',
        'Terrestrial Titans': '大地の呼び声',
        'Titanic Pursuit': '斬空剣',
        'Towerfall': '倒壊',
        'Tracking Tremors': '連震撃',
        'Twinbite': '双牙撃',
        'Twofold Tempest': '双牙暴風撃',
        'Ultraviolent Ray': '魔光',
        'Weal of Stone': '地烈波',
        'Wind Surge': '風爆',
        'Windfang': '風の魔技',
        'Winds of Decay': '千年の大風',
        'Wolves\' Reign': '群狼剣',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Gleaming Fang': '光牙',
        'Howling Blade': '剑嚎',
        'Moonlit Shadow': '剑嚎的幻影',
        'Wolf Of Stone': '土狼首',
        'Wolf of Stone': '土狼首',
        'Wolf of Wind': '风狼首',
      },
      'replaceText': {
        '--adds-targetable--': '--小怪可选中--',
        '--shadow ': '--幻影 ',
        '--tank/line aoes--': '--坦克/直线 AOE--',
        '\\(circles\\)': '(圆形)',
        '\\(cones\\)': '(扇形)',
        '\\(enrage\\)': '(狂暴)',
        '\\(Platform\\)': '(平台)',
        '\\(Towers\\)': '(塔)',
        'Aero III': '暴风',
        'Aerotemporal Blast': '定时风击',
        'Alpha Stone': '光狼之土',
        'Alpha Wind': '光狼之风',
        'Bare Fangs': '光牙召唤',
        'Beckon Moonlight': '幻狼召唤',
        'Breath of Decay': '千年风啸',
        'Champion\'s Circuit': '回天动地',
        'Elemental Purge': '风震魔印',
        'Eminent Reign': '扫击群狼剑',
        'Extraplanar Feast': '空间灭斩',
        'Extraplanar Pursuit': '空间斩',
        'Fanged Charge': '突进光牙',
        'Forlorn Stone': '土之狼吼',
        'Forlorn Wind': '风之狼吼',
        'Geotemporal Blast': '定时震击',
        'Gleaming Barrage': '连击闪光炮',
        'Gleaming Beam': '闪光炮',
        'Great Divide': '一刀两断',
        'Gust': '狂风',
        'Heavensearth': '大震击',
        'Hero\'s Blow': '铠袖一触',
        'Howling Eight': '八连光弹',
        'Howling Havoc': '风尘咆哮',
        'Hunter\'s Harvest': '贪狼之剑',
        'Lone Wolf\'s Lament': '独狼的诅咒',
        'Millennial Decay': '千年风化',
        'Moonbeam\'s Bite': '幻狼剑',
        'Mooncleaver': '刚刃一闪',
        'Pack Predation': '光狼阵',
        'Prowling Gale': '风狼阵',
        'Quake III': '爆震',
        'Ravenous Saber': '风尘光狼斩',
        'Revolutionary Reign': '旋击群狼剑',
        'Rise of the Howling Wind': '魔狼战形·飓风之相',
        'Rise of the Hunter\'s Blade': '魔狼战形·咒刃之相',
        'Roaring Wind': '风狼豪波',
        'Shadowchase': '残影剑',
        'Stalking Stone': '光狼地烈波',
        'Stalking Wind': '光狼风烈波',
        'Starcleaver': '刚刃一闪・终',
        'Stonefang': '土之魔技',
        'Suspended Stone': '巨岩',
        'Tactical Pack': '光狼召唤',
        'Terrestrial Rage': '大地之怒',
        'Terrestrial Titans': '大地的呼唤',
        'Titanic Pursuit': '斩空剑',
        'Towerfall': '崩塌',
        'Tracking Tremors': '连震击',
        'Twinbite': '双牙击',
        'Twofold Tempest': '双牙暴风击',
        'Ultraviolent Ray': '魔光',
        'Weal of Stone': '地烈波',
        'Wind Surge': '风爆',
        'Windfang': '风之魔技',
        'Winds of Decay': '千年狂风',
        'Wolves\' Reign': '群狼剑',
      },
    },
  ],
};

export default triggerSet;
