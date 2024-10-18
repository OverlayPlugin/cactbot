import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputCardinal,
  DirectionOutputIntercard,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

/*
  TO DO LIST
    - Electrope Edge 2 - call safe tile for non-Spark players?
    - Raining Swords - possibly add `alertText` calls for each safe spot in sequence?
*/

type Phase = 'door' | 'crosstail' | 'twilight' | 'midnight' | 'sunrise';

type NearFar = 'near' | 'far'; // wherever you are...
type InOut = 'in' | 'out';
type NorthSouth = 'north' | 'south';
type LeftRight = 'left' | 'right';
type CondenserMap = {
  long: string[];
  short: string[];
};
type AetherialId = keyof typeof aetherialAbility;
type AetherialEffect = 'iceRight' | 'iceLeft' | 'fireRight' | 'fireLeft';
type MidnightState = 'gun' | 'wings';
type IonClusterDebuff = 'yellowShort' | 'yellowLong' | 'blueShort' | 'blueLong';
type SunriseCardinalPair = 'northSouth' | 'eastWest';

type DirectionCardinal = Exclude<DirectionOutputCardinal, 'unknown'>;
type DirectionIntercard = Exclude<DirectionOutputIntercard, 'unknown'>;
type ReplicaCleaveMap = {
  [K in DirectionCardinal]: {
    [D in LeftRight]: DirectionOutputIntercard[];
  };
};

type ReplicaData = {
  [id: string]: {
    location?: DirectionOutput8;
    cardinalFacing?: 'opposite' | 'adjacent';
    cannonColor?: 'yellow' | 'blue';
  };
};

const centerX = 100;
const p1CenterY = 100;
const p2CenterY = 165; // wall-boss platform is south

const phaseMap: { [id: string]: Phase } = {
  '95F2': 'crosstail', // Cross Tail Switch
  '9623': 'twilight', // Twilight Sabbath
  '9AB9': 'midnight', // Midnight Sabbath
  '9622': 'sunrise', // Ion Cluster (because debuffs pre-date the Sunrise Sabbath cast)
};

const actorControlCategoryMap = {
  'setModelState': '003F',
  'playActionTimeline': '0197',
} as const;

const aetherialAbility = {
  '9602': 'fireLeft',
  '9603': 'iceLeft',
  '9604': 'fireRight',
  '9605': 'iceRight',
} as const;

const isAetherialId = (id: string): id is AetherialId => {
  return id in aetherialAbility;
};

// Replicas face center, so the half they cleave will render all those intercards unsafe.
const replicaCleaveUnsafeMap: ReplicaCleaveMap = {
  'dirN': {
    'left': ['dirNE', 'dirSE'],
    'right': ['dirNW', 'dirSW'],
  },
  'dirE': {
    'left': ['dirSE', 'dirSW'],
    'right': ['dirNW', 'dirNE'],
  },
  'dirS': {
    'left': ['dirSW', 'dirNW'],
    'right': ['dirNE', 'dirSE'],
  },
  'dirW': {
    'left': ['dirNW', 'dirNE'],
    'right': ['dirSE', 'dirSW'],
  },
};

const isCardinalDir = (dir: DirectionOutput8): dir is DirectionCardinal => {
  return (Directions.outputCardinalDir as string[]).includes(dir);
};

const isIntercardDir = (dir: DirectionOutput8): dir is DirectionIntercard => {
  return (Directions.outputIntercardDir as string[]).includes(dir);
};

const getStartingSwords = (): number[][] => Array(4).fill(0).map(() => [0, 1, 2, 3]);

const swordQuiverSafeMap = {
  '95F9': 'sidesAndBack', // front cleave
  '95FA': 'frontAndBack', // middle cleave
  '95FB': 'frontAndSides', // back cleave
} as const;

const isSwordQuiverId = (id: string): id is keyof typeof swordQuiverSafeMap => {
  return Object.keys(swordQuiverSafeMap).includes(id);
};

// For now, call the in/out, the party safe spot, and the bait spot; users can customize.
// If/once standard strats develop, this would be a good thing to revisit.
const witchHuntAlertOutputStrings = {
  in: {
    en: 'In',
    de: 'Rein',
    fr: 'Intérieur',
    ja: '中へ',
    cn: '月环',
    ko: '안',
  },
  out: {
    en: 'Out',
    de: 'Raus',
    fr: 'Extérieur',
    ja: '外へ',
    cn: '钢铁',
    ko: '밖',
  },
  near: {
    en: 'Baits Close (Party Far)',
    de: 'Nah ködern (Gruppe fern)',
    fr: 'Déposez près (Groupe au loin)',
    ja: '近づいて誘導 (他は離れる)',
    cn: '引导近 (小队远)',
    ko: '가까이 유도 (본대 멀리)',
  },
  far: {
    en: 'Baits Far (Party Close)',
    de: 'Fern ködern (Gruppe nah)',
    fr: 'Déposez au loin (Groupe près)',
    ja: '離れて誘導 (他は近づく)',
    cn: '引导远 (小队近)',
    ko: '멀리 유도 (본대 가까이)',
  },
  combo: {
    en: '${inOut} => ${bait}',
    de: '${inOut} => ${bait}',
    fr: '${inOut} => ${bait}',
    ja: '${inOut} => ${bait}',
    cn: '${inOut} => ${bait}',
    ko: '${inOut} => ${bait}',
  },
  unknown: Outputs.unknown,
} as const;

const tailThrustOutputStrings = {
  iceLeft: {
    en: '<== (Start on Left) Double Knockback',
    de: '<== (Starte Links) Doppel-Rückstoß',
    fr: '<== (Démarrez à gauche) Double poussée',
    ja: '<== (左から開始) 2連続ノックバック',
    cn: '<== (左边开始) 两次击退',
    ko: '<== (왼쪽에서 시작) 넉백 2번',
  },
  iceRight: {
    en: '(Start on Right) Double Knockback ==>',
    de: '(Starte Rechts) Doppel-Rückstoß ==>',
    fr: '(Démarrez à droite) Double poussée ==>',
    ja: '(右から開始) 2連続ノックバック ==>',
    cn: '(右边开始) 两次击退 ==>',
    ko: '(오른쪽에서 시작) 넉백 2번 ==>',
  },
  fireLeft: {
    en: 'Fire - Start Front + Right ==>',
    de: 'Feuer - Starte Vorne + Rechts ==>',
    fr: 'Feu - Démarrez Devant + Droite ==>',
    ja: '火 - 最前列 + 右側へ ==>',
    cn: '火 - 右右右 ==>',
    ko: '불 - 오른쪽 앞에서 시작 ==>',
  },
  fireRight: {
    en: '<== Fire - Start Front + Left',
    de: '<== Feuer - Starte Vorne + Links',
    fr: '<== Feu - Démarrez Devant + Gauche',
    ja: '<== 火 - 最前列 + 左側へ',
    cn: '<== 火 - 左左左',
    ko: '<== 불 - 왼쪽 앞에서 시작',
  },
  unknown: Outputs.unknown,
} as const;

const swordQuiverOutputStrings = {
  frontAndSides: {
    en: 'Go Front / Sides',
    de: 'Geh nach Vorne / Seiten',
    fr: 'Allez Devant / Côtés',
    ja: '前方 / 横側 へ',
    cn: '去前 / 侧边',
    ko: '앞 / 양옆으로',
  },
  frontAndBack: {
    en: 'Go Front / Back',
    de: 'Geh nach Vorne / Hinten',
    fr: 'Allez Devant / Derrière',
    ja: '前方 / 後方 へ',
    cn: '去前 / 后边',
    ko: '앞 / 뒤로',
  },
  sidesAndBack: {
    en: 'Go Sides / Back',
    de: 'Geh Seitlich / Hinten',
    fr: 'Allez Côtés / Derrière',
    ja: '横 / 後方 へ',
    cn: '去侧 / 后边',
    ko: '양옆 / 뒤로',
  },
} as const;

export interface Data extends RaidbossData {
  phase: Phase;
  // Phase 1
  bewitchingBurstSafe?: InOut;
  hasForkedLightning: boolean;
  seenBasicWitchHunt: boolean;
  witchHuntBait?: NearFar;
  witchHuntAoESafe?: InOut;
  witchGleamCount: number;
  electromines: { [id: string]: DirectionOutputIntercard };
  electrominesSafe: DirectionOutputIntercard[];
  starEffect?: 'partners' | 'spread';
  witchgleamSelfCount: number;
  condenserTimer?: 'short' | 'long';
  condenserMap: CondenserMap;
  electronStreamSafe?: 'yellow' | 'blue';
  electronStreamSide?: NorthSouth;
  seenConductorDebuffs: boolean;
  fulminousFieldCount: number;
  conductionPointTargets: string[];
  // Phase 2
  replicas: ReplicaData;
  mustardBombTargets: string[];
  kindlingCauldronTargets: string[];
  aetherialEffect?: AetherialEffect;
  twilightSafeFirst: DirectionOutputIntercard[];
  twilightSafeSecond: DirectionOutputIntercard[];
  replicaCleaveCount: number;
  secondTwilightCleaveSafe?: DirectionOutputIntercard;
  midnightCardFirst?: boolean;
  midnightFirstAdds?: MidnightState;
  midnightSecondAdds?: MidnightState;
  ionClusterDebuff?: IonClusterDebuff;
  sunriseCannons: string[];
  sunriseCloneToWatch?: string;
  sunriseTowerSpots?: SunriseCardinalPair;
  seenFirstSunrise: boolean;
  rainingSwords: {
    mySide?: LeftRight;
    tetherCount: number;
    firstActorId: number;
    left: number[][];
    right: number[][];
  };
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM4Savage',
  zoneId: ZoneId.AacLightHeavyweightM4Savage,
  timelineFile: 'r4s.txt',
  initData: () => {
    return {
      phase: 'door',
      // Phase 1
      hasForkedLightning: false,
      seenBasicWitchHunt: false,
      witchGleamCount: 0,
      electromines: {},
      electrominesSafe: [],
      witchgleamSelfCount: 0,
      condenserMap: {
        long: [],
        short: [],
      },
      seenConductorDebuffs: false,
      fulminousFieldCount: 0,
      conductionPointTargets: [],
      // Phase 2
      replicas: {},
      mustardBombTargets: [],
      kindlingCauldronTargets: [],
      twilightSafeFirst: Directions.outputIntercardDir,
      twilightSafeSecond: Directions.outputIntercardDir,
      replicaCleaveCount: 0,
      sunriseCannons: [],
      seenFirstSunrise: false,
      rainingSwords: {
        tetherCount: 0,
        firstActorId: 0,
        left: getStartingSwords(),
        right: getStartingSwords(),
      },
    };
  },
  timelineTriggers: [
    // Order: Soulshock => Impact x2 => Cannonbolt (entire sequence is ~9s).
    // None of these have StartsUsing lines or other lines that could be used for pre-warn triggers;
    // they seem to be entirely timeline based.  To avoid spam, use a single alert.
    {
      id: 'R4S Soulshock',
      regex: /Soulshock/,
      beforeSeconds: 4,
      durationSeconds: 13,
      response: Responses.bigAoe(),
    },
  ],
  triggers: [
    {
      id: 'R4S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'Wicked Thunder' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
      },
    },

    // ***************** PHASE 1 ***************** //
    // General
    {
      id: 'R4S Wrath of Zeus',
      type: 'StartsUsing',
      netRegex: { id: '95EF', source: 'Wicked Thunder', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R4S Wicked Bolt',
      type: 'HeadMarker',
      netRegex: { id: '013C' },
      condition: (data) => data.phase === 'door',
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R4S Wicked Jolt',
      type: 'StartsUsing',
      netRegex: { id: '95F0' },
      response: Responses.tankBusterSwap(),
    },

    // Witch Hunts
    {
      id: 'R4S Bewitching Flight',
      type: 'StartsUsing',
      netRegex: { id: ['9671', '8DEF'], source: 'Wicked Thunder', capture: false },
      infoText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid Front + Side Cleaves',
          de: 'Vermeide Frontal + Seiten-Angriff',
          fr: 'Évitez les cleaves Avant + Côtés',
          ja: '縦と横の範囲を避けて',
          cn: '躲避前方激光 + 场边直线AoE',
          ko: '전방 + 양옆 레이저 피하기',
        },
      },
    },
    {
      // We don't need to collect; we can deduce in/out based on any bursting line's x-pos.
      id: 'R4S Betwitching Flight Burst',
      type: 'StartsUsingExtra',
      netRegex: { id: '95EA' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        data.bewitchingBurstSafe = (x > 110 || x < 90) ? 'in' : 'out';
      },
    },
    {
      id: 'R4S Electrifying Witch Hunt',
      type: 'StartsUsing',
      netRegex: { id: '95E5', source: 'Wicked Thunder', capture: false },
      alertText: (data, _matches, output) => {
        if (data.bewitchingBurstSafe === undefined)
          return output.spreadAvoid!();
        const inOut = output[data.bewitchingBurstSafe]!();
        return output.combo!({ inOut: inOut, spread: output.spreadAvoid!() });
      },
      run: (data) => delete data.bewitchingBurstSafe,
      outputStrings: {
        in: {
          en: 'In',
          de: 'Rein',
          fr: 'Intérieur',
          ja: '中へ',
          cn: '内场',
          ko: '안',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '外场',
          ko: '밖',
        },
        spreadAvoid: {
          en: 'Spread (Avoid Side Cleaves)',
          de: 'Verteilen (Vermeide Seiten-Angriff)',
          fr: 'Dispersion (Évitez les cleaves de côtés)',
          ja: '散開 (横の範囲を避けて)',
          cn: '分散 (注意场边直线AoE)',
          ko: '산개 (양옆 레이저 피하기)',
        },
        combo: {
          en: '${inOut} + ${spread}',
          de: '${inOut} + ${spread}',
          fr: '${inOut} + ${spread}',
          ja: '${inOut} + ${spread}',
          cn: '${inOut} + ${spread}',
          ko: '${inOut} + ${spread}',
        },
      },
    },
    {
      id: 'R4S Witch Hunt Close/Far Collect',
      type: 'GainsEffect',
      // count: 2F6 = near, 2F7 = far
      netRegex: { effectId: 'B9A', count: ['2F6', '2F7'] },
      condition: (data) => !data.seenBasicWitchHunt,
      run: (data, matches) => data.witchHuntBait = matches.count === '2F6' ? 'near' : 'far',
    },
    {
      id: 'R4S Forked Lightning Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '24B' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hasForkedLightning = true,
    },
    {
      id: 'R4S Witch Hunt',
      type: 'StartsUsing',
      netRegex: { id: '95DE', source: 'Wicked Thunder', capture: false },
      delaySeconds: 0.2,
      alertText: (data, _matches, output) => {
        if (data.witchHuntBait === undefined || data.bewitchingBurstSafe === undefined)
          return;

        const inOut = output[data.bewitchingBurstSafe]!();
        const spread = data.witchHuntBait === 'near'
          ? (data.hasForkedLightning ? output.far!() : output.near!())
          : (data.hasForkedLightning ? output.near!() : output.far!());
        return output.combo!({ inOut: inOut, spread: spread });
      },
      run: (data) => data.seenBasicWitchHunt = true,
      outputStrings: {
        in: {
          en: 'In',
          de: 'Rein',
          fr: 'Intérieur',
          ja: '中へ',
          cn: '内场',
          ko: '안',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '外场',
          ko: '밖',
        },
        near: {
          en: 'Spread (Be Closer)',
          de: 'Verteilen (Sei näher dran)',
          fr: 'Dispersion (Près)',
          ja: '散開(近づく)',
          cn: '靠近分散',
          ko: '산개 (가까이)',
        },
        far: {
          en: 'Spread (Be Further)',
          de: 'Verteilen (Sei weiter weg)',
          fr: 'Dispersion (Loin)',
          ja: '散開(離れる)',
          cn: '远离分散',
          ko: '산개 (멀리)',
        },
        combo: {
          en: '${inOut} + ${spread}',
          de: '${inOut} + ${spread}',
          fr: '${inOut} + ${spread}',
          ja: '${inOut} + ${spread}',
          cn: '${inOut} + ${spread}',
          ko: '${inOut} + ${spread}',
        },
      },
    },
    // For Narrowing/Widening Witch Hunt, the cast determines the first in/out safe, and it swaps each time.
    // The B9A status effect count determines the first near/far bait, and it swaps each time.
    // To simplify this, we can collect the first ones of each, call them out, and then flip them for subsequent calls.
    {
      id: 'R4S Narrowing/Widening Witch Hunt Bait Collect',
      type: 'GainsEffect',
      // count: 2F6 = near, 2F7 = far
      netRegex: { effectId: 'B9A', count: ['2F6', '2F7'] },
      condition: (data) => data.seenBasicWitchHunt,
      suppressSeconds: 15, // don't re-collect, as the effects occur 3 more times
      run: (data, matches) => data.witchHuntBait = matches.count === '2F6' ? 'near' : 'far',
    },
    {
      // Keep an infoText up during the entire mechanic with the order
      // 95E0 = Widening, 95E1 = Narrowing
      id: 'R4S Narrowing/Widening Witch Hunt General',
      type: 'StartsUsing',
      netRegex: { id: ['95E0', '95E1'], source: 'Wicked Thunder' },
      // Cast time is almost the same as the GainsEffect
      // so slight delay just in case there's a race condition issue
      delaySeconds: 0.2,
      durationSeconds: 24,
      infoText: (data, matches, output) => {
        // assumes Narrowing; if Widening, just reverse
        let aoeOrder: InOut[] = ['in', 'out', 'in', 'out'];

        if (matches.id === '95E0')
          aoeOrder = aoeOrder.reverse();
        data.witchHuntAoESafe = aoeOrder[0];

        // assumes Near first; if Far first, just reverse
        let baitOrder: NearFar[] = ['near', 'far', 'near', 'far'];
        if (data.witchHuntBait === undefined)
          baitOrder = [];
        else if (data.witchHuntBait === 'far')
          baitOrder = baitOrder.reverse();

        const baits: string[] = [];
        for (let i = 0; i < aoeOrder.length; ++i) {
          const inOut = aoeOrder[i]!;
          const bait = baitOrder[i] ?? output.unknown!();
          baits.push(output.baitStep!({ inOut: output[inOut]!(), bait: output[bait]!() }));
        }
        return output.baitCombo!({ allBaits: baits.join(output.separator!()) });
      },
      outputStrings: {
        in: {
          en: 'In',
          de: 'Rein',
          fr: 'Intérieur',
          ja: '中へ',
          cn: '月环',
          ko: '안',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '钢铁',
          ko: '밖',
        },
        near: {
          en: 'Close',
          de: 'Nah',
          fr: 'Près',
          ja: '近づく',
          cn: '近',
          ko: '가까이',
        },
        far: {
          en: 'Far',
          de: 'Fern',
          fr: 'Loin',
          ja: '離れる',
          cn: '远',
          ko: '멀리',
        },
        separator: {
          en: ' => ',
          de: ' => ',
          fr: ' => ',
          ja: ' => ',
          cn: ' => ',
          ko: ' => ',
        },
        baitStep: {
          en: '${inOut} (${bait})',
          de: '${inOut} (${bait})',
          fr: '${inOut} (${bait})',
          ja: '${inOut} (${bait})',
          cn: '${inOut} (${bait})',
          ko: '${inOut} (${bait})',
        },
        baitCombo: {
          en: 'Baits: ${allBaits}',
          de: 'Ködern: ${allBaits}',
          fr: 'Dépose : ${allBaits}',
          ja: '誘導: ${allBaits}',
          cn: '引导: ${allBaits}',
          ko: '유도: ${allBaits}',
        },
        unknown: Outputs.unknown,
      },
    },
    // In lieu of a standardized strat, use separate triggers for each callout.
    // This allows players to customize text if they will be baiting in fixed role order.
    {
      id: 'R4S Narrowing/Widening Witch Hunt First',
      type: 'StartsUsing',
      netRegex: { id: ['95E0', '95E1'], source: 'Wicked Thunder', capture: false },
      delaySeconds: 7,
      durationSeconds: 7,
      alertText: (data, _matches, output) => {
        const inOut = data.witchHuntAoESafe ?? output.unknown!();
        const bait = data.witchHuntBait ?? output.unknown!();

        // flip things for the next call
        if (data.witchHuntAoESafe !== undefined)
          data.witchHuntAoESafe = data.witchHuntAoESafe === 'in' ? 'out' : 'in';
        if (data.witchHuntBait !== undefined)
          data.witchHuntBait = data.witchHuntBait === 'near' ? 'far' : 'near';

        return output.combo!({ inOut: output[inOut]!(), bait: output[bait]!() });
      },
      outputStrings: witchHuntAlertOutputStrings,
    },
    {
      id: 'R4S Narrowing/Widening Witch Hunt Second',
      type: 'StartsUsing',
      netRegex: { id: ['95E0', '95E1'], source: 'Wicked Thunder', capture: false },
      delaySeconds: 14,
      durationSeconds: 3.2,
      alertText: (data, _matches, output) => {
        const inOut = data.witchHuntAoESafe ?? output.unknown!();
        const bait = data.witchHuntBait ?? output.unknown!();

        // flip things for the next call
        if (data.witchHuntAoESafe !== undefined)
          data.witchHuntAoESafe = data.witchHuntAoESafe === 'in' ? 'out' : 'in';
        if (data.witchHuntBait !== undefined)
          data.witchHuntBait = data.witchHuntBait === 'near' ? 'far' : 'near';

        return output.combo!({ inOut: output[inOut]!(), bait: output[bait]!() });
      },
      outputStrings: witchHuntAlertOutputStrings,
    },
    {
      id: 'R4S Narrowing/Widening Witch Hunt Third',
      type: 'StartsUsing',
      netRegex: { id: ['95E0', '95E1'], source: 'Wicked Thunder', capture: false },
      delaySeconds: 17.4,
      durationSeconds: 3.2,
      alertText: (data, _matches, output) => {
        const inOut = data.witchHuntAoESafe ?? output.unknown!();
        const bait = data.witchHuntBait ?? output.unknown!();

        // flip things for the next call
        if (data.witchHuntAoESafe !== undefined)
          data.witchHuntAoESafe = data.witchHuntAoESafe === 'in' ? 'out' : 'in';
        if (data.witchHuntBait !== undefined)
          data.witchHuntBait = data.witchHuntBait === 'near' ? 'far' : 'near';

        return output.combo!({ inOut: output[inOut]!(), bait: output[bait]!() });
      },
      outputStrings: witchHuntAlertOutputStrings,
    },
    {
      id: 'R4S Narrowing/Widening Witch Hunt Fourth',
      type: 'StartsUsing',
      netRegex: { id: ['95E0', '95E1'], source: 'Wicked Thunder', capture: false },
      delaySeconds: 20.8,
      durationSeconds: 3.2,
      alertText: (data, _matches, output) => {
        const inOut = data.witchHuntAoESafe ?? output.unknown!();
        const bait = data.witchHuntBait ?? output.unknown!();
        return output.combo!({ inOut: output[inOut]!(), bait: output[bait]!() });
      },
      outputStrings: witchHuntAlertOutputStrings,
    },

    // Electrope Edge 1 & 2
    {
      id: 'R4S Electrope Edge Positions',
      type: 'StartsUsing',
      netRegex: { id: '95C5', source: 'Wicked Thunder', capture: false },
      alertText: (data, _matches, output) => {
        // On the first cast, it will spawn intercardinal mines that are hit by Witchgleams.
        // On the second cast, players will be hit by Witchgleams.
        if (Object.keys(data.electromines).length === 0)
          return output.cardinals!();
        return output.protean!();
      },
      outputStrings: {
        cardinals: Outputs.cardinals,
        protean: Outputs.protean,
      },
    },
    {
      id: 'R4S Witchgleam Electromine Collect',
      type: 'AddedCombatant',
      netRegex: { name: 'Electromine' },
      condition: (data) => data.witchGleamCount === 0,
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const intercard = Directions.xyToIntercardDirOutput(x, y, centerX, p1CenterY);
        data.electromines[matches.id] = intercard;
      },
    },
    {
      id: 'R4S Witchgleam Electromine Counter',
      type: 'Ability',
      netRegex: { id: '95C7', source: 'Wicked Thunder', target: 'Electromine', capture: false },
      suppressSeconds: 1,
      run: (data) => ++data.witchGleamCount,
    },
    {
      id: 'R4S Witchgleam Electromine Hit Collect',
      type: 'Ability',
      netRegex: { id: '95C7', source: 'Wicked Thunder', target: 'Electromine' },
      run: (data, matches) => {
        const mineId = matches.targetId;
        const mineDir = data.electromines[mineId];
        // Two mines get hit once, two get hit twice.  On the second hit, remove it as a safe spot.
        if (mineDir !== undefined) {
          if (data.electrominesSafe.includes(mineDir))
            data.electrominesSafe = data.electrominesSafe.filter((mine) => mine !== mineDir);
          else
            data.electrominesSafe.push(mineDir);
        }
      },
    },
    {
      id: 'R4S Four/Eight Star Effect Collect',
      type: 'GainsEffect',
      netRegex: { effectId: 'B9A', count: ['2F0', '2F1'] },
      run: (data, matches) => data.starEffect = matches.count === '2F0' ? 'partners' : 'spread',
    },
    {
      id: 'R4S Electrope Edge 1 Sidewise Spark',
      type: 'StartsUsing',
      // Base this on the Sidewise Spark cast, since it narrows us down to a single safe quadrant
      // Boss always faces north; 95EC = east cleave, 95ED = west cleave
      netRegex: { id: ['95EC', '95ED'], source: 'Wicked Thunder' },
      condition: (data) => data.witchGleamCount === 3,
      // Cast time is almost the same as the GainsEffect
      // so slight delay just in case there's a race condition issue
      delaySeconds: 0.2,
      alertText: (data, matches, output) => {
        const unsafeMap: { [id: string]: DirectionOutputIntercard[] } = {
          '95EC': ['dirNE', 'dirSE'],
          '95ED': ['dirNW', 'dirSW'],
        };

        const unsafeDirs = unsafeMap[matches.id] ?? [];
        data.electrominesSafe = data.electrominesSafe.filter((d) => !unsafeDirs.includes(d));
        const safeDir = data.electrominesSafe.length !== 1
          ? 'unknown'
          : data.electrominesSafe[0]!;
        const safeDirStr = output[safeDir]!();

        const starEffect = data.starEffect ?? 'unknown';
        const starEffectStr = output[starEffect]!();

        return output.combo!({ dir: safeDirStr, mech: starEffectStr });
      },
      run: (data) => {
        data.witchGleamCount = 0;
        delete data.starEffect;
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
        combo: {
          en: '${dir} => ${mech}',
          de: '${dir} => ${mech}',
          fr: '${dir} => ${mech}',
          ja: '${dir} => ${mech}',
          cn: '${dir} => ${mech}',
          ko: '${dir} => ${mech}',
        },
      },
    },
    {
      id: 'R4S Electrical Condenser Debuff Collect',
      type: 'GainsEffect',
      netRegex: { effectId: 'F9F', capture: true },
      condition: Conditions.targetIsNotYou(),
      run: (data, matches) => {
        data.condenserTimer = parseFloat(matches.duration) > 30 ? 'long' : 'short';
        const shortName = data.party.member(matches.target).nick;
        if (data.condenserTimer === 'long')
          data.condenserMap.long.push(shortName);
        else
          data.condenserMap.short.push(shortName);
      },
    },
    {
      id: 'R4S Electrical Condenser Debuff Initial',
      type: 'GainsEffect',
      netRegex: { effectId: 'F9F', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.5,
      infoText: (data, matches, output) => {
        data.condenserTimer = parseFloat(matches.duration) > 30 ? 'long' : 'short';
        // Long debuff players will pick up an extra stack later.
        // Just handle it here to cut down on trigger counts.
        if (data.condenserTimer === 'long')
          data.witchgleamSelfCount++;

        // Some strats use long/short debuff assignments to do position swaps for EE2.
        const same = data.condenserMap[data.condenserTimer].join(', ');

        // Note: Taking unexpected lightning damage from Four/Eight Star, Sparks, or Sidewise Spark
        // will cause the stack count to increase. We could try to try to track that, but it makes
        // the final mechanic resolvable only under certain conditions (which still cause deaths),
        // so don't bother for now.  PRs welcome? :)
        return output[data.condenserTimer]!({ same: same });
      },
      outputStrings: {
        short: {
          en: 'Short Debuff (w/ ${same})',
          de: 'Kurzer Debuff (mit ${same})',
          fr: 'Debuff court (avec ${same})',
          ja: '短いデバフ (同じく/ ${same})',
          cn: '短 Debuff (和 ${same})',
          ko: '짧은 디버프 (+ ${same})',
        },
        long: {
          en: 'Long Debuff (w/ ${same})',
          de: 'Langer Debuff (mit ${same})',
          fr: 'Debuff long (avec ${same})',
          ja: '長いデバフ (同じく/ ${same})',
          cn: '长 Debuff (和 ${same})',
          ko: '긴 디버프 (+ ${same})',
        },
      },
    },
    {
      id: 'R4S Witchgleam Self Tracker',
      type: 'Ability',
      netRegex: { id: '9786' },
      condition: Conditions.targetIsYou(),
      run: (data) => data.witchgleamSelfCount++,
    },
    {
      id: 'R4S Witchgleam Self Reminder',
      type: 'StartsUsing',
      netRegex: { id: '95CE', source: 'Wicked Thunder', capture: false },
      condition: (data) => data.condenserTimer === 'long',
      delaySeconds: 3,
      infoText: (data, _matches, output) =>
        output.witchgleamTimes!({ times: data.witchgleamSelfCount }),
      outputStrings: {
        witchgleamTimes: {
          en: '${times} stacks (later)',
          de: '${times} Treffer (später)',
          fr: '${times} packages (après)',
          ja: '${times} 回のほう (後)',
          cn: '(稍后 ${times} 层)',
          ko: '(${times} 스택)',
        },
      },
    },
    {
      id: 'R4S Electrical Condenser Debuff Expiring',
      type: 'GainsEffect',
      netRegex: { effectId: 'F9F', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 7,
      alertText: (data, _matches, output) => {
        return output.spread!({ stacks: data.witchgleamSelfCount });
      },
      outputStrings: {
        spread: {
          en: 'Spread (${stacks} stacks)',
          de: 'Verteilen (${stacks} Ladungen)',
          fr: 'Dispersion (${stacks} package)',
          ja: '散開 (${stacks} 回のほう)',
          cn: '分散 (${stacks} 层)',
          ko: '산개 (${stacks} 스택)',
        },
      },
    },
    {
      id: 'R4S Electrope Edge 2 Sidewise Spark',
      type: 'StartsUsing',
      // Boss always faces north; 95EC = east cleave, 95ED = west cleave
      netRegex: { id: ['95EC', '95ED'], source: 'Wicked Thunder' },
      condition: (data) => data.witchgleamSelfCount > 0,
      // Cast time is almost the same as the GainsEffect
      // so slight delay just in case there's a race condition issue
      delaySeconds: 0.2,
      alertText: (data, matches, output) => {
        const starEffect = data.starEffect ?? 'unknown';

        // Some strats have stack/spread positions based on Witchgleam stack count,
        // so for the long debuffs, add that info (both for positioning and as a reminder).
        const reminder = data.condenserTimer === 'long'
          ? output.stacks!({ stacks: data.witchgleamSelfCount })
          : '';

        if (matches.id === '95EC')
          return output.combo!({
            dir: output.west!(),
            mech: output[starEffect]!(),
            remind: reminder,
          });
        return output.combo!({
          dir: output.east!(),
          mech: output[starEffect]!(),
          remind: reminder,
        });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
        unknown: Outputs.unknown,
        stacks: {
          en: '(${stacks} stacks after)',
          de: '(danach ${stacks} Ladungen)',
          fr: '(${stacks} packages après)',
          ja: '(${stacks} 回のほう)',
          cn: '(${stacks} 层雷)',
          ko: '(나중에 ${stacks} 스택)',
        },
        combo: {
          en: '${dir} => ${mech} ${remind}',
          de: '${dir} => ${mech} ${remind}',
          fr: '${dir} => ${mech} ${remind}',
          ja: '${dir} => ${mech} ${remind}',
          cn: '${dir} => ${mech} ${remind}',
          ko: '${dir} => ${mech} ${remind}',
        },
      },
    },

    // Electron Streams
    {
      id: 'R4S Left Roll',
      type: 'Ability',
      netRegex: { id: '95D3', source: 'Wicked Thunder', capture: false },
      response: Responses.goWest(),
    },
    {
      id: 'R4S Right Roll',
      type: 'Ability',
      netRegex: { id: '95D2', source: 'Wicked Thunder', capture: false },
      response: Responses.goEast(),
    },
    {
      id: 'R4S Electron Stream Debuff',
      type: 'GainsEffect',
      // FA0 - Positron (Yellow), blue safe
      // FA1 - Negatron (Blue), yellow safe
      netRegex: { effectId: ['FA0', 'FA1'] },
      condition: (data, matches) => data.me === matches.target && data.phase === 'door',
      run: (data, matches) =>
        data.electronStreamSafe = matches.effectId === 'FA0' ? 'blue' : 'yellow',
    },
    {
      id: 'R4S Electron Stream Initial',
      type: 'StartsUsing',
      // 95D6 - Yellow cannon north, Blue cannnon south
      // 95D7 - Blue cannon north, Yellow cannon south
      netRegex: { id: ['95D6', '95D7'], source: 'Wicked Thunder' },
      condition: (data) => !data.seenConductorDebuffs,
      alertText: (data, matches, output) => {
        if (data.electronStreamSafe === 'yellow')
          data.electronStreamSide = matches.id === '95D6' ? 'north' : 'south';
        else if (data.electronStreamSafe === 'blue')
          data.electronStreamSide = matches.id === '95D6' ? 'south' : 'north';

        const safeDir = data.electronStreamSide ?? 'unknown';
        if (data.role === 'tank')
          return output.tank!({ dir: output[safeDir]!() });
        return output.nonTank!({ dir: output[safeDir]!() });
      },
      outputStrings: {
        north: Outputs.north,
        south: Outputs.south,
        unknown: Outputs.unknown,
        tank: {
          en: '${dir} - Be in Front',
          de: '${dir} - Sei Vorne',
          fr: '${dir} - Devant le groupe',
          ja: '${dir} - ボス近くで受けて',
          cn: '${dir} - 站在最前面',
          ko: '${dir} - 맨 앞으로',
        },
        nonTank: {
          en: '${dir} - Behind Tank',
          de: '${dir} - Hinter dem Tank',
          fr: '${dir} - Derrière le tank',
          ja: '${dir} - タンクの後ろへ',
          cn: '${dir} - 站坦克后面',
          ko: '${dir} - 탱커 뒤로',
        },
      },
    },
    {
      id: 'R4S Electron Stream Subsequent',
      type: 'StartsUsing',
      // 95D6 - Yellow cannon north, Blue cannnon south
      // 95D7 - Blue cannon north, Yellow cannon south
      netRegex: { id: ['95D6', '95D7'], source: 'Wicked Thunder' },
      condition: (data) => data.seenConductorDebuffs,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          swap: {
            en: 'Swap Sides',
            de: 'Seiten wechseln',
            fr: 'Changez de côté',
            ja: '場所を交代',
            cn: '穿',
            ko: '교체',
          },
          stay: {
            en: 'Stay',
            de: 'Stehen bleiben',
            fr: 'Restez',
            ja: 'そのまま',
            cn: '停',
            ko: '그대로',
          },
          unknown: Outputs.unknown,
          tank: {
            en: '${dir} - Be in Front',
            de: '${dir} - Sei Vorne',
            fr: '${dir} - Devant le groupe',
            ja: '${dir} - ボス近くで受けて',
            cn: '${dir} - 站在最前面',
            ko: '${dir} - 맨 앞으로',
          },
          nonTank: {
            en: '${dir} - Behind Tank',
            de: '${dir} - Hinter dem Tank',
            fr: '${dir} - Derrière le tank',
            ja: '${dir} - タンクの後ろへ',
            cn: '${dir} - 站坦克后面',
            ko: '${dir} - 탱커 뒤로',
          },
        };

        let safeSide: NorthSouth | 'unknown' = 'unknown';
        let dir: 'stay' | 'swap' | 'unknown' = 'unknown';

        if (data.electronStreamSafe === 'yellow')
          safeSide = matches.id === '95D6' ? 'north' : 'south';
        else if (data.electronStreamSafe === 'blue')
          safeSide = matches.id === '95D6' ? 'south' : 'north';

        if (safeSide !== 'unknown') {
          dir = safeSide === data.electronStreamSide ? 'stay' : 'swap';
          data.electronStreamSide = safeSide; // for the next comparison
        }

        const text = data.role === 'tank'
          ? output.tank!({ dir: output[dir]!() })
          : output.nonTank!({ dir: output[dir]!() });

        if (dir === 'stay')
          return { infoText: text };
        return { alertText: text };
      },
    },
    // For now, just call the debuff effect; likely to be updated when
    // strats are solidified?
    {
      id: 'R4S Conductor/Current Debuffs',
      type: 'GainsEffect',
      netRegex: { effectId: ['FA2', 'FA3', 'FA4', 'FA5', 'FA6'] },
      condition: Conditions.targetIsYou(),
      durationSeconds: 5,
      alertText: (_data, matches, output) => {
        switch (matches.effectId) {
          case 'FA2':
            return output.remoteCurrent!();
          case 'FA3':
            return output.proximateCurrent!();
          case 'FA4':
            return output.spinningConductor!();
          case 'FA5':
            return output.roundhouseConductor!();
          case 'FA6':
            return output.colliderConductor!();
        }
      },
      run: (data) => data.seenConductorDebuffs = true,
      outputStrings: {
        remoteCurrent: {
          en: 'Far Cone on You',
          de: 'Fern-Kegel auf DIR',
          fr: 'Cône éloigné sur Vous',
          ja: '自分から遠い人に扇範囲',
          cn: '远雷点名',
          ko: '원거리 화살표 대상자',
        },
        proximateCurrent: {
          en: 'Near Cone on You',
          de: 'Nah-Kegel auf DIR',
          fr: 'Cône proche sur Vous',
          ja: '自分から近い人に扇範囲',
          cn: '近雷点名',
          ko: '근거리 화살표 대상자',
        },
        spinningConductor: {
          en: 'Small AoE on You',
          de: 'Kleine AoE auf DIR',
          fr: 'Petite AoE sur Vous',
          ja: '自分に小さい円範囲',
          cn: '小钢铁点名',
          ko: '작은 원형징 대상자',
        },
        roundhouseConductor: {
          en: 'Donut AoE on You',
          de: 'Donut AoE auf DIR',
          fr: 'Donut sur Vous',
          ja: '自分にドーナツ範囲',
          cn: '月环点名',
          ko: '도넛징 대상자',
        },
        colliderConductor: {
          en: 'Get Hit by Cone',
          de: 'Werde vom Kegel getroffen',
          fr: 'Encaissez un cône',
          ja: '扇範囲に当たって',
          cn: '吃雷',
          ko: '화살표 장판 맞기',
        },
      },
    },

    // Fulminous Field
    {
      id: 'R4S Fulminous Field',
      type: 'Ability', // use the preceding ability (Electrope Translplant) for timing
      netRegex: { id: '98D3', source: 'Wicked Thunder', capture: false },
      infoText: (_data, _matches, output) => output.dodge!(),
      outputStrings: {
        dodge: {
          en: 'Dodge w/Partner x7',
          de: 'mit Partner ausweichen x7',
          fr: 'Esquivez avec votre partenaire x7',
          ja: '相方と避ける x7',
          cn: '与搭档躲避 7 次扇形',
          ko: '파트너와 함께 피하기 x7',
        },
      },
    },
    {
      id: 'R4S Fulminous Field Spread',
      type: 'Ability',
      // 90FE = initial hit, 98CD = followup hits (x6)
      netRegex: { id: ['90FE', '98CD'], source: 'Wicked Thunder' },
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        if (matches.id === '90FE')
          data.fulminousFieldCount = 1;
        else
          data.fulminousFieldCount++;

        if (data.fulminousFieldCount === 3)
          return output.spread!();
      },
      outputStrings: {
        spread: Outputs.spread,
      },
    },
    {
      id: 'R4S Conduction Point Collect',
      type: 'Ability',
      netRegex: { id: '98CE', source: 'Wicked Thunder' },
      run: (data, matches) => data.conductionPointTargets.push(matches.target),
    },
    {
      id: 'R4S Forked Fissures',
      type: 'Ability',
      netRegex: { id: '98CE', source: 'Wicked Thunder', capture: false },
      delaySeconds: 0.2,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.conductionPointTargets.includes(data.me))
          return output.far!();
        return output.near!();
      },
      run: (data) => data.conductionPointTargets = [],
      outputStrings: {
        near: {
          en: 'In Front of Partner',
          de: 'Sei vor deinem Partner',
          fr: 'Devant votre partenaire',
          ja: '相方の前へ',
          cn: '站在搭档前面 (挡枪)',
          ko: '파트너 앞으로',
        },
        far: {
          en: 'Behind Partner',
          de: 'Sei hinter deinem Partner',
          fr: 'Derrière votre partenaire',
          ja: '相方の後ろへ',
          cn: '站在搭档后面',
          ko: '파트너 뒤로',
        },
      },
    },

    // ***************** PHASE 2 ***************** //
    // General
    {
      id: 'R4S Replica ActorSetPos Data Collect',
      type: 'ActorSetPos',
      netRegex: { id: '4.{7}' },
      condition: (data) => data.phase !== 'door',
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const hdg = parseFloat(matches.heading);

        const locDir = Directions.xyTo8DirOutput(x, y, centerX, p2CenterY);
        (data.replicas[matches.id] ??= {}).location = locDir;

        // Determining the facing for clones on cardinals using 4Dir could get a little messy -
        // e.g., a NW-facing clone could result in a value of N or W depending on pixels/rounding.
        // To be safe, use the full 8-dir compass, and then adjust based on the clone's position
        // Note: We only care about heading for clones on cardinals during Sunrise Sabbath
        const hdgDir = Directions.outputFrom8DirNum(Directions.hdgTo8DirNum(hdg));
        if (isCardinalDir(locDir))
          (data.replicas[matches.id] ??= {}).cardinalFacing = isCardinalDir(hdgDir)
            ? 'opposite'
            : 'adjacent';
      },
    },
    {
      id: 'R4S Azure Thunder',
      type: 'StartsUsing',
      netRegex: { id: '962F', source: 'Wicked Thunder', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R4S Wicked Thunder',
      type: 'StartsUsing',
      netRegex: { id: '949B', source: 'Wicked Thunder', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R4S Mustard Bomb Initial',
      type: 'StartsUsing',
      netRegex: { id: '961E', source: 'Wicked Thunder', capture: false },
      infoText: (data, _matches, output) =>
        data.role === 'tank' ? output.tank!() : output.nonTank!(),
      outputStrings: {
        tank: Outputs.tetherBusters,
        nonTank: Outputs.spread,
      },
    },
    {
      id: 'R4S Mustard Bomb Collect',
      type: 'Ability',
      // 961F - Mustard Bomb (tank tethers, x2)
      // 9620 - Kindling Cauldron (spread explosions, x4)
      netRegex: { id: ['961F', '9620'], source: 'Wicked Thunder' },
      run: (data, matches) => {
        if (matches.id === '961F')
          data.mustardBombTargets.push(matches.target);
        else
          data.kindlingCauldronTargets.push(matches.target);
      },
    },
    {
      id: 'R4S Mustard Bomb Followup',
      type: 'Ability',
      netRegex: { id: '961F', source: 'Wicked Thunder', capture: false },
      delaySeconds: 0.2,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.mustardBombTargets.includes(data.me)) {
          const safePlayers = data.party.partyNames.filter((m) =>
            !data.kindlingCauldronTargets.includes(m) &&
            !data.mustardBombTargets.includes(m)
          );
          const toStr = safePlayers.map((m) => data.party.member(m).nick).join(', ');

          return output.passDebuff!({ to: toStr });
        } else if (!data.kindlingCauldronTargets.includes(data.me)) {
          return output.getDebuff!();
        }
      },
      run: (data) => {
        data.mustardBombTargets = [];
        data.kindlingCauldronTargets = [];
      },
      outputStrings: {
        passDebuff: {
          en: 'Pass Debuff (${to})',
          de: 'Debuff übergeben (${to})',
          fr: 'Donner le debuff (${to})',
          ja: 'デバフを渡して (${to})',
          cn: '传火 (${to})',
          ko: '디버프 전달 (${to})',
        },
        getDebuff: {
          en: 'Get Debuff',
          de: 'Debuff nehmen',
          fr: 'Prenez le debuff',
          ja: 'デバフを取って',
          cn: '接火',
          ko: '디버프 받기',
        },
      },
    },
    {
      id: 'R4S Wicked Special Sides',
      type: 'StartsUsing',
      netRegex: { id: '9610', source: 'Wicked Thunder', capture: false },
      condition: (data) => data.secondTwilightCleaveSafe === undefined,
      response: Responses.goSides(),
    },
    {
      id: 'R4S Wicked Special Middle',
      type: 'StartsUsing',
      netRegex: { id: '9612', source: 'Wicked Thunder', capture: false },
      condition: (data) => data.secondTwilightCleaveSafe === undefined,
      response: Responses.goMiddle(),
    },
    {
      id: 'R4S Aetherial Conversion',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(aetherialAbility), source: 'Wicked Thunder' },
      durationSeconds: 7,
      infoText: (data, matches, output) => {
        if (!isAetherialId(matches.id))
          throw new UnreachableCode();
        // First time - no stored call (since the mech happens next), just save the effect
        const firstTime = data.aetherialEffect === undefined;
        data.aetherialEffect = aetherialAbility[matches.id];
        if (!firstTime)
          return output.stored!({ effect: output[data.aetherialEffect]!() });
      },
      outputStrings: {
        ...tailThrustOutputStrings,
        stored: {
          en: 'Stored: ${effect}',
          de: 'Gespeichert: ${effect}',
          fr: 'Enregistré : ${effect}',
          ja: 'あとで: ${effect}',
          cn: '存储: ${effect}',
          ko: '저장: ${effect}',
        },
      },
    },
    {
      id: 'R4S Tail Thrust',
      type: 'StartsUsing',
      // 9606-9609 correspond to the id casts for the triggering Aetherial Conversion,
      // but we don't care which is which at this point because we've already stored the effect
      netRegex: { id: ['9606', '9607', '9608', '9609'], source: 'Wicked Thunder', capture: false },
      alertText: (data, _matches, output) => output[data.aetherialEffect ?? 'unknown']!(),
      outputStrings: tailThrustOutputStrings,
    },

    // Pre-Sabbaths
    {
      id: 'R4S Cross Tail Switch',
      type: 'StartsUsing',
      netRegex: { id: '95F2', source: 'Wicked Thunder', capture: false },
      delaySeconds: (data) => data.role === 'tank' ? 3 : 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          lb3: {
            en: 'LB3!',
            de: 'LB3!',
            fr: 'Transcendance !',
            ja: 'タンク LB3!',
            cn: '坦克 LB!',
            ko: '탱 3단 리밋!',
          },
        };

        if (data.role === 'tank')
          return { alarmText: output.lb3!() };
        return Responses.bigAoe();
      },
    },
    {
      id: 'R4S Wicked Blaze',
      type: 'HeadMarker',
      netRegex: { id: '013C', capture: false },
      condition: (data) => data.phase === 'crosstail',
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.healerGroups,
      },
    },

    // Twilight Sabbath
    {
      id: 'R4S Twilight Sabbath Sidewise Spark',
      type: 'ActorControlExtra',
      // category: 0197 - PlayActionTimeline
      // param1: 11D6 - first,  right cleave
      // param1: 11D7 - second, right cleave
      // param1: 11D8 - first,  left cleave
      // param1: 11D9 - second, left cleave
      netRegex: { category: '0197', param1: ['11D6', '11D7', '11D8', '11D9'] },
      condition: (data) => data.phase === 'twilight',
      // delay 0.1s to prevent out-of-order line issues
      delaySeconds: 0.1,
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        data.replicaCleaveCount++;
        const dir = data.replicas[matches.id]?.location;
        if (dir === undefined || !isCardinalDir(dir))
          return;

        const cleaveDir = ['11D6', '11D7'].includes(matches.param1) ? 'right' : 'left';
        const unsafeDirs = replicaCleaveUnsafeMap[dir][cleaveDir];

        const firstSet = ['11D6', '11D8'].includes(matches.param1);

        if (firstSet) {
          data.twilightSafeFirst = data.twilightSafeFirst.filter((d) => !unsafeDirs.includes(d));
        } else {
          data.twilightSafeSecond = data.twilightSafeSecond.filter((d) => !unsafeDirs.includes(d));
        }

        // Once we have all four accounted for, set our second spot for use in Wicked Special combo,
        // and then return our first safe spot
        if (data.replicaCleaveCount !== 4)
          return;

        const [safeSecond] = data.twilightSafeSecond;

        data.secondTwilightCleaveSafe = safeSecond;

        if (data.secondTwilightCleaveSafe === undefined) {
          data.secondTwilightCleaveSafe = 'unknown';
        }

        const [safeFirst] = data.twilightSafeFirst;

        // If we couldn't find the first safe spot, at least remind players to bait puddles
        if (safeFirst === undefined)
          return output.bait!();

        return output.combo!({
          bait: output.bait!(),
          dir1: output[safeFirst]!(),
          dir2: output[data.secondTwilightCleaveSafe]!(),
        });
      },
      run: (data) => {
        if (data.replicaCleaveCount !== 4)
          return;
        data.replicaCleaveCount = 0;
        data.twilightSafeFirst = Directions.outputIntercardDir;
        data.twilightSafeSecond = Directions.outputIntercardDir;
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        bait: Outputs.baitPuddles,
        combo: {
          en: '${bait} => ${dir1} => ${dir2}',
          de: '${bait} => ${dir1} => ${dir2}',
          fr: '${bait} => ${dir1} => ${dir2}',
          ja: '${bait} => ${dir1} => ${dir2}',
          cn: '${bait} => ${dir1} => ${dir2}',
          ko: '${bait} => ${dir1} => ${dir2}',
        },
      },
    },
    {
      id: 'R4S Twilight Sabbath + Wicked Special',
      type: 'StartsUsing',
      netRegex: { id: ['9610', '9612'], source: 'Wicked Thunder' },
      condition: (data) => data.secondTwilightCleaveSafe !== undefined,
      alertText: (data, matches, output) => {
        const dir = data.secondTwilightCleaveSafe;
        if (dir === undefined)
          throw new UnreachableCode();

        return matches.id === '9610'
          ? output.combo!({ dir: output[dir]!(), middleSides: output.sides!() })
          : output.combo!({ dir: output[dir]!(), middleSides: output.middle!() });
      },
      run: (data) => delete data.secondTwilightCleaveSafe,
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        middle: Outputs.middle,
        sides: Outputs.sides,
        combo: {
          en: '${dir} => ${middleSides}',
          de: '${dir} => ${middleSides}',
          fr: '${dir} => ${middleSides}',
          ja: '${dir} => ${middleSides}',
          cn: '${dir} => ${middleSides}',
          ko: '${dir} => ${middleSides}',
        },
      },
    },

    // Midnight Sabbath
    {
      // ActorControl (category 0x0197) determines the firing order of the adds.
      // All cardinal adds get one value, and all intercardinal adds get a different value.
      // The 4 adds to fire first will always get either 11D1 (guns) or 11D3 (wings)
      // The 4 adds to fire second will always get either 11D2 (guns) or 11D4 (wings)
      id: 'R4S Midnight Sabbath First Adds',
      type: 'ActorControlExtra',
      netRegex: {
        id: '4.{7}',
        category: actorControlCategoryMap.playActionTimeline,
        param1: ['11D1', '11D3'],
      },
      condition: (data) => data.phase === 'midnight',
      delaySeconds: 0.5, // let the position collector finish
      suppressSeconds: 1, // we only need one
      run: (data, matches) => {
        const id = matches.id;
        const loc = data.replicas[id]?.location;
        if (loc === undefined)
          return;

        data.midnightCardFirst = isCardinalDir(loc);
        data.midnightFirstAdds = matches.param1 === '11D3' ? 'wings' : 'gun';
      },
    },
    {
      id: 'R4S Midnight Sabbath Second Adds',
      type: 'ActorControlExtra',
      netRegex: {
        id: '4.{7}',
        category: actorControlCategoryMap.playActionTimeline,
        param1: ['11D2', '11D4'],
      },
      condition: (data) => data.phase === 'midnight',
      delaySeconds: 0.5, // let the position collector finish
      suppressSeconds: 1, // we only need one
      run: (data, matches) => data.midnightSecondAdds = matches.param1 === '11D4' ? 'wings' : 'gun',
    },
    {
      id: 'R4S Concentrated/Scattered Burst 1',
      type: 'StartsUsing',
      // 962B - Concentrated Burst (Partners => Spread)
      // 962C - Scattered Burst (Spread => Partners)
      netRegex: { id: ['962B', '962C'], source: 'Wicked Thunder' },
      delaySeconds: 0.2, // cast starts ~1s after the ActorControl collectors, so just in case
      alertText: (data, matches, output) => {
        const firstMech = matches.id === '962B' ? 'partners' : 'spread';
        const firstMechStr = output[firstMech]!();

        if (data.midnightCardFirst === undefined || data.midnightFirstAdds === undefined)
          return firstMechStr;

        // If the first add is doing wings, that add is safe; if guns, the opposite is safe.
        const dirStr = data.midnightFirstAdds === 'wings'
          ? (data.midnightCardFirst ? output.cardinals!() : output.intercards!())
          : (data.midnightCardFirst ? output.intercards!() : output.cardinals!());

        const typeStr = data.midnightFirstAdds === 'wings' ? output.wings!() : output.guns!();

        return output.combo!({ dir: dirStr, type: typeStr, mech: firstMechStr });
      },
      outputStrings: {
        combo: {
          en: '${dir} + ${type} + ${mech}',
          de: '${dir} + ${type} + ${mech}',
          fr: '${dir} + ${type} + ${mech}',
          ja: '${dir} + ${type} + ${mech}',
          cn: '${dir} + ${type} + ${mech}',
          ko: '${dir} + ${type} + ${mech}',
        },
        guns: {
          en: 'Avoid Line',
          de: 'Weiche den Linien aus',
          fr: 'Évitez la ligne',
          ja: 'ビームを避けて',
          cn: '躲避直线',
          ko: '직선 장판 피하기',
        },
        wings: {
          en: 'Donut',
          de: 'Donut',
          fr: 'Donut',
          ja: 'ドーナツ',
          cn: '月环',
          ko: '도넛 장판',
        },
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R4S Concentrated/Scattered Burst 2',
      type: 'Ability', // use the ability line to trigger the second call for optimal timing
      netRegex: { id: ['962B', '962C'], source: 'Wicked Thunder' },
      alertText: (data, matches, output) => {
        const secondMech = matches.id === '962B' ? 'spread' : 'partners';
        const secondMechStr = output[secondMech]!();

        if (data.midnightCardFirst === undefined || data.midnightSecondAdds === undefined)
          return secondMechStr;

        const secondAddsOnCards = !data.midnightCardFirst;

        // If the 2nd add is doing wings, that add is safe; if guns, the opposite is safe.
        const dirStr = data.midnightSecondAdds === 'wings'
          ? (secondAddsOnCards ? output.cardinals!() : output.intercards!())
          : (secondAddsOnCards ? output.intercards!() : output.cardinals!());

        const typeStr = data.midnightSecondAdds === 'wings' ? output.wings!() : output.guns!();

        return output.combo!({ dir: dirStr, type: typeStr, mech: secondMechStr });
      },
      outputStrings: {
        combo: {
          en: '${dir} + ${type} + ${mech}',
          de: '${dir} + ${type} + ${mech}',
          fr: '${dir} + ${type} + ${mech}',
          ja: '${dir} + ${type} + ${mech}',
          cn: '${dir} + ${type} + ${mech}',
          ko: '${dir} + ${type} + ${mech}',
        },
        guns: {
          en: 'Avoid Line',
          de: 'Weiche den Linien aus',
          fr: 'Évitez la ligne',
          ja: 'ビームを避けて',
          cn: '躲避直线',
          ko: '직선 장판 피하기',
        },
        wings: {
          en: 'Donut',
          de: 'Donut',
          fr: 'Donut',
          ja: 'ドーナツ',
          cn: '月环',
          ko: '도넛 장판',
        },
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        partners: Outputs.stackPartner,
        spread: Outputs.spread,
        unknown: Outputs.unknown,
      },
    },
    // Chain Lightning
    {
      id: 'R4S Flame Slash',
      type: 'StartsUsing',
      netRegex: { id: '9614', source: 'Wicked Thunder', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'R4S Raining Swords Tower',
      type: 'Ability',
      // use the ability line of the preceding Flame Slash cast, as the cast time
      // for Raining Swords is very short.
      netRegex: { id: '9614', source: 'Wicked Thunder', capture: false },
      alertText: (_data, _matches, output) => output.towers!(),
      outputStrings: {
        towers: {
          en: 'Tower Positions',
          de: 'Turm Positionen',
          fr: 'Position tour',
          ja: '塔の位置へ',
          cn: '八人塔站位',
          ko: '기둥 자리잡기',
        },
      },
    },
    {
      id: 'R4S Raining Swords Collector',
      type: 'StartsUsing',
      netRegex: { id: '9616', source: 'Wicked Thunder', capture: false },
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;

        const swordActorIds = actors
          .filter((actor) => actor.BNpcID === 17327)
          .sort((left, right) => left.ID! - right.ID!)
          .map((actor) => actor.ID!);

        if (swordActorIds.length !== 8) {
          console.error(
            `R4S Raining Swords Collector: Missing swords, count ${swordActorIds.length}`,
          );
        }

        data.rainingSwords.firstActorId = swordActorIds[0] ?? 0;
      },
    },
    {
      id: 'R4S Raining Swords My Side Detector',
      type: 'Ability',
      // No source for this as the names aren't always correct for some reason
      netRegex: { id: '9617', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) =>
        data.rainingSwords.mySide = parseFloat(matches.x) < centerX ? 'left' : 'right',
    },
    {
      id: 'R4S Raining Swords Collect + Initial',
      type: 'Tether',
      netRegex: { id: ['0117', '0118'], capture: true },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        // 24 tethers total, in sets of 3, 8 sets total. Sets 1 and 2 correspond to first safe spots, etc.
        const swordId = matches.sourceId;
        let swordIndex = parseInt(swordId, 16) - data.rainingSwords.firstActorId;
        const swordSet = swordIndex > 3 ? data.rainingSwords.right : data.rainingSwords.left;
        // Swords are actually ordered south to north, invert them so it makes more sense
        swordIndex = 3 - (swordIndex % 4);
        const tetherSet = Math.floor(data.rainingSwords.tetherCount / 6);
        data.rainingSwords.tetherCount++;
        swordSet[tetherSet] = swordSet[tetherSet]?.filter((spot) => spot !== swordIndex) ?? [];

        if (data.rainingSwords.tetherCount === 6) {
          const leftSafe = data.rainingSwords.left[0]?.[0] ?? 0;
          const rightSafe = data.rainingSwords.right[0]?.[0] ?? 0;

          const mySide = data.rainingSwords.mySide;

          // Here (and below) if side couldn't be detected because player was dead
          // we could print out both sides instead of an unknown output?
          // And yes, it's possible to miss a tower in week one gear and survive.
          if (mySide === undefined)
            return output.unknown!();

          return output.safe!({
            side: output[mySide]!(),
            first: mySide === 'left' ? leftSafe + 1 : rightSafe + 1,
          });
        }
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        safe: {
          en: '${side}: Start at ${first}',
          de: '${side}: Starte ${first}',
          fr: '${side} : Démarrez ${first}',
          ja: '${side}: まずは ${first} から',
          cn: '${side}: 从 ${first} 开始',
          ko: '${side}: ${first}에서 시작',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R4S Raining Swords Safe List',
      type: 'Tether',
      netRegex: { id: ['0117', '0118'], capture: false },
      condition: (data) => data.rainingSwords.tetherCount >= 18,
      durationSeconds: 24,
      suppressSeconds: 10,
      infoText: (data, _matches, output) => {
        const mySide = data.rainingSwords.mySide;
        if (mySide === undefined)
          return output.unknown!();

        const calloutSideSet = data.rainingSwords[mySide];

        const safeSpots = [
          calloutSideSet[0]?.[0] ?? 0,
          calloutSideSet[1]?.[0] ?? 0,
          calloutSideSet[2]?.[0] ?? 0,
        ];

        // Trim our last possible spot based on existing three safe spots
        safeSpots.push([0, 1, 2, 3].filter((spot) => !safeSpots.includes(spot))[0] ?? 0);

        return output.safe!({
          side: output[mySide]!(),
          order: safeSpots.map((i) => i + 1).join(output.separator!()),
        });
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        separator: {
          en: ' => ',
          de: ' => ',
          fr: ' => ',
          ja: ' => ',
          cn: ' => ',
          ko: ' => ',
        },
        safe: {
          en: '${side} Side: ${order}',
          de: '${side} Seite: ${order}',
          fr: 'Côté ${side} : ${order}',
          ja: '${side} : ${order}',
          cn: '${side} 侧: ${order}',
          ko: '${side}: ${order}',
        },
        unknown: Outputs.unknown,
      },
    },

    // Sunrise Sabbath
    {
      id: 'R4S Ion Cluster Debuff Initial',
      type: 'GainsEffect',
      // FA0 - Positron (Yellow) (blue cannon)
      // FA1 - Negatron (Blue) (yellow cannon)
      // Long = 38s, Short = 23s
      netRegex: { effectId: ['FA0', 'FA1'] },
      condition: (data, matches) => {
        return data.me === matches.target &&
          data.phase === 'sunrise' &&
          data.ionClusterDebuff === undefined; // debuffs can get swapped/reapplied if you oopsie, so no spam
      },
      infoText: (data, matches, output) => {
        data.ionClusterDebuff = matches.effectId === 'FA0'
          ? (parseFloat(matches.duration) > 30 ? 'yellowLong' : 'yellowShort')
          : (parseFloat(matches.duration) > 30 ? 'blueLong' : 'blueShort');
        return output[data.ionClusterDebuff]!();
      },
      outputStrings: {
        yellowLong: {
          en: 'Long Yellow Debuff (Towers First)',
          de: 'Langer Gelber Debuff (Turm zuerst)',
          fr: 'Debuff jaune long (Tour en 1er)',
          ja: '長い黄色デバフ (塔から)',
          cn: '长黄 (先踩塔)',
          ko: '긴 노란색 디버프 (기둥 먼저)',
        },
        blueLong: {
          en: 'Long Blue Debuff (Towers First)',
          de: 'Langer Blauer Debuff (Turm zuerst)',
          fr: 'Debuff bleu long (Tour en 1er)',
          ja: '長い青色デバフ (塔から)',
          cn: '长蓝 (先踩塔)',
          ko: '긴 파란색 디버프 (기둥 먼저)',
        },
        yellowShort: {
          en: 'Short Yellow Debuff (Cannons First)',
          de: 'Kurzer Gelber Debuff (Kanone zuerst)',
          fr: 'Debuff jaune court (Canons en 1er)',
          ja: '短い黄色デバフ (ビーム誘導から)',
          cn: '短黄 (先引导)',
          ko: '짧은 노란색 디버프 (레이저 먼저)',
        },
        blueShort: {
          en: 'Short Blue Debuff (Cannons First)',
          de: 'Kurzer Blauer Debuff (Kanone zuerst)',
          fr: 'Debuff bleu court (Canons en 1er)',
          ja: '短い青色デバフ (ビーム誘導から)',
          cn: '短蓝 (先引导)',
          ko: '짧은 파란색 디버프 (레이저 먼저)',
        },
      },
    },
    {
      id: 'R4S Sunrise Sabbath Jumping Clone Collect 1',
      type: 'ActorControlExtra',
      // '1C' = jumping clone
      netRegex: { id: '4.{7}', category: actorControlCategoryMap.setModelState, param1: '1C' },
      condition: (data) => data.phase === 'sunrise' && !data.seenFirstSunrise,
      // they both face opposite or adjacent, so we only need one to resolve the mechanic
      delaySeconds: 0.2,
      suppressSeconds: 1,
      run: (data, matches) => {
        const id = matches.id;
        const loc = data.replicas[id]?.location;
        const facing = data.replicas[id]?.cardinalFacing;

        if (loc === undefined || facing === undefined)
          return;

        data.sunriseCloneToWatch = id;
        if (loc === 'dirN' || loc === 'dirS')
          data.sunriseTowerSpots = facing === 'opposite' ? 'northSouth' : 'eastWest';
        else if (loc === 'dirE' || loc === 'dirW')
          data.sunriseTowerSpots = facing === 'opposite' ? 'eastWest' : 'northSouth';
      },
    },
    // After clones jump for 1st towers, their model state does not change, but an ActorMove packet
    // is sent to change their location/heading. There's really no need to continually track
    // actor/position heading and update data.replicas because we can set the data props we need
    // directly from a single ActorMove packet for the 2nd set of towers.
    {
      id: 'R4S Replica Jumping Clone Collect 2',
      type: 'ActorMove',
      netRegex: { id: '4.{7}' },
      condition: (data, matches) =>
        data.phase === 'sunrise' && data.seenFirstSunrise &&
        data.sunriseCloneToWatch === matches.id,
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const hdg = parseFloat(matches.heading);

        const locDir = Directions.xyTo4DirNum(x, y, centerX, p2CenterY) % 2; // 0 = N/S, 1 = E/W
        const hdgDir = Directions.outputFrom8DirNum(Directions.hdgTo8DirNum(hdg));
        data.sunriseTowerSpots = isCardinalDir(hdgDir)
          ? (locDir === 0 ? 'northSouth' : 'eastWest') // opposite-facing
          : (locDir === 0 ? 'eastWest' : 'northSouth'); // adjacent-facing
      },
    },
    {
      id: 'R4S Sunrise Sabbath Cannon Color Collect',
      type: 'GainsEffect',
      // 2F4 = yellow cannnon, 2F5 = blue cannon
      netRegex: { effectId: 'B9A', count: ['2F4', '2F5'] },
      condition: (data) => data.phase === 'sunrise',
      run: (data, matches) => {
        const id = matches.targetId;
        const color = matches.count === '2F4' ? 'yellow' : 'blue';
        data.sunriseCannons.push(id);
        (data.replicas[id] ??= {}).cannonColor = color;
      },
    },
    {
      id: 'R4S Sunrise Sabbath Cannnons + Towers',
      type: 'GainsEffect',
      netRegex: { effectId: 'B9A', count: ['2F4', '2F5'], capture: false },
      condition: (data) => data.phase === 'sunrise',
      delaySeconds: 0.2,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.ionClusterDebuff === undefined || data.sunriseCannons.length !== 4)
          return;

        const blueCannons: DirectionOutputIntercard[] = [];
        const yellowCannons: DirectionOutputIntercard[] = [];
        data.sunriseCannons.forEach((id) => {
          const loc = data.replicas[id]?.location;
          const color = data.replicas[id]?.cannonColor;
          if (loc === undefined || color === undefined || !isIntercardDir(loc))
            return;
          (color === 'blue' ? blueCannons : yellowCannons).push(loc);
        });

        // Second time through, shorts and longs swap responsibilities
        const swapMap: Record<IonClusterDebuff, IonClusterDebuff> = {
          'yellowShort': 'yellowLong',
          'yellowLong': 'yellowShort',
          'blueShort': 'blueLong',
          'blueLong': 'blueShort',
        };
        const task = data.seenFirstSunrise ? swapMap[data.ionClusterDebuff] : data.ionClusterDebuff;

        // use bracket notation because cactbot eslint doesn't handle spread operators
        // in outputStrings; see #266 for more info
        let towerSoakStr = output['unknown']!();
        let cannonBaitStr = output['unknown']!();

        if (data.sunriseTowerSpots !== undefined) {
          towerSoakStr = output[data.sunriseTowerSpots]!();
          cannonBaitStr = data.sunriseTowerSpots === 'northSouth'
            ? output.eastWest!()
            : output.northSouth!();
        }

        if (task === 'yellowShort' || task === 'blueShort') {
          const cannonLocs = task === 'yellowShort' ? blueCannons : yellowCannons;
          const locStr = cannonLocs.map((loc) => output[loc]!()).join('/');
          return output[task]!({ loc: locStr, bait: cannonBaitStr });
        }
        return output[task]!({ bait: towerSoakStr });
      },
      run: (data) => {
        data.sunriseCannons = [];
        data.seenFirstSunrise = true;
        delete data.sunriseTowerSpots;
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        northSouth: {
          en: 'N/S',
          de: 'N/S',
          fr: 'N/S',
          ja: '南/北',
          cn: '上(北)/下(南)',
          ko: '남/북',
        },
        eastWest: {
          en: 'E/W',
          de: 'O/W',
          fr: 'E/O',
          ja: '東/西',
          cn: '左(西)/右(东)',
          ko: '동/서',
        },
        yellowLong: {
          en: 'Soak Tower (${bait})',
          de: 'Turm nehmen (${bait})',
          fr: 'Prenez une tour (${bait})',
          ja: '塔を踏んで (${bait})',
          cn: '踩塔 (${bait})',
          ko: '기둥 밟기 (${bait})',
        },
        blueLong: {
          en: 'Soak Tower (${bait})',
          de: 'Turm nehmen (${bait})',
          fr: 'Prenez une tour (${bait})',
          ja: '塔を踏んで (${bait})',
          cn: '踩塔 (${bait})',
          ko: '기둥 밟기 (${bait})',
        },
        yellowShort: {
          en: 'Blue Cannon (${loc}) - Point ${bait}',
          de: 'Blaue Kanone (${loc}) - Richte nach ${bait}',
          fr: 'Canon bleu ${loc}) - Pointez ${bait}',
          ja: '青いビーム誘導 (${loc}) - ${bait}',
          cn: '蓝激光 (${loc}) - 打向 ${bait}',
          ko: '파란 레이저 (${loc}) - ${bait}쪽으로',
        },
        blueShort: {
          en: 'Yellow Cannon (${loc}) - Point ${bait}',
          de: 'Gelbe Kanone (${loc}) - Richte nach ${bait}',
          fr: 'Canon jaune ${loc}) - Pointez ${bait}',
          ja: '黄色いビーム誘導 (${loc}) - ${bait}',
          cn: '黄激光 (${loc}) - 打向 ${bait}',
          ko: '노란 레이저 (${loc}) - ${bait}쪽으로',
        },
      },
    },

    // Finale
    {
      id: 'R4S Sword Quiver AoE',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(swordQuiverSafeMap), source: 'Wicked Thunder', capture: false },
      response: Responses.bigAoe(),
    },
    // Use Ability lines for these triggers so they don't collide with the AoE call,
    // and also because the cast starts ~14s before the mechanic resolves, and FFXIV
    // players have goldfish memories.
    {
      id: 'R4S Sword Quiver Safe',
      type: 'Ability',
      netRegex: { id: Object.keys(swordQuiverSafeMap), source: 'Wicked Thunder' },
      alertText: (_data, matches, output) => {
        const id = matches.id;
        if (!isSwordQuiverId(id))
          throw new UnreachableCode();

        return output[swordQuiverSafeMap[id]]!();
      },
      outputStrings: swordQuiverOutputStrings,
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Electromine': 'Elektromine',
        'Wicked Replica': 'Tosender Donner-Phantom',
        'Wicked Thunder': 'Tosender Donner',
      },
      'replaceText': {
        '(?<! )Spark': 'Funken',
        '(?<! )Witch Hunt': 'Hexenjagd',
        'Azure Thunder': 'Azurblauer Donner',
        'Bewitching Flight': 'Hexenflug',
        'Burst': 'Explosion',
        'Cannonbolt': 'Kanonenblitz',
        'Chain Lightning': 'Kettenblitz',
        'Conduction Point': 'Blitzpunkt',
        'Cross Tail Switch': 'Elektroschwanz-Wirbel',
        'Eight Star': 'Acht Sterne',
        'Electrifying Witch Hunt': 'Elektrisierende Hexenjagd',
        'Electron Stream': 'Elektronen-Strom',
        'Electrope Edge': 'Elektrob-Aufreihung',
        'Electrope Transplant': 'Elektrob-Umsetzung',
        'Flame Slash': 'Feuerschnitt',
        'Forked Fissures': 'Blitzstrom',
        'Forked Lightning': 'Gabelblitz',
        'Four Star': 'Vier Sterne',
        'Fulminous Field': 'Blitzfeld',
        'Impact': 'Impakt',
        'Ion Cluster': 'Ionen-Ansammlung',
        'Laceration': 'Zerreißen',
        'Left Roll': 'Linke Walze',
        'Lightning Cage': 'Blitzkäfig',
        'Lightning Vortex': 'Donnerkugel',
        'Midnight Sabbath': 'Mitternachtssabbat',
        'Mustard Bomb': 'Senfbombe',
        'Narrowing Witch Hunt': 'Ringförmige Hexenjagd',
        'Raining Swords': 'Klingenregen',
        'Right Roll': 'Rechte Walze',
        'Sidewise Spark': 'Seitlicher Funken',
        'Soulshock': 'Seelenschock',
        'Stampeding Thunder': 'Stampfender Kanonenschlag',
        'Sunrise Sabbath': 'Morgensonnensabbat',
        'Switch of Tides': 'Schwanzplatscher',
        'Sword Quiver': 'Klingentanz',
        'Tail Thrust': 'Schwanzstoß',
        'Thundering': 'Donnerring',
        'Twilight Sabbath': 'Zwielichtssabbat',
        'Wicked Blaze': 'Tosende Flammen',
        'Wicked Bolt': 'Tosender Blitz',
        'Wicked Fire': 'Tosendes Feuer',
        'Wicked Flare': 'Tosende Flare',
        'Wicked Jolt': 'Tosender Stoß',
        'Wicked Spark': 'Tosender Funken',
        'Wicked Special': 'Donnerknall',
        'Wicked Thunder': 'Tosender Donner',
        'Widening Witch Hunt': 'Runde Hexenjagd',
        'Witchgleam': 'Knisternder Funken',
        'Wrath of Zeus': 'Zorn des Zeus',
        '\\(debuffs resolve\\)': '(Debuffs spielen)',
        '\\(debuffs\\)': '(Debuffs)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(first mines hit\\)': '(erster Minen Treffer)',
        '\\(first set\\)': '(erstes Set)',
        '\\(first sparks detonate\\)': '(erste Funken explodiert)',
        '\\(first towers/cannons resolve\\)': '(ersten Turm/Kanone spielen)',
        '\\(floor no more\\)': '(Boden verschwindet)',
        '\\(fourth set\\)': '(viertes Set)',
        '\\(mines\\)': '(Minen)',
        '\\(players\\)': '(Spieler)',
        '\\(puddles drop\\)': '(Flächen kommen)',
        '\\(second hit\\)': '(zweiter Treffer)',
        '\\(second mines hit\\)': '(zweiter Minen Treffer)',
        '\\(second set\\)': '(zweites Set)',
        '\\(second sparks detonate\\)': '(zweiter Funken explodiert)',
        '\\(second towers/cannons resolve\\)': '(zweiten Turm/Kanone spielen)',
        '\\(spread \\+ tethers\\)': '(verteilen + Verbindungen)',
        '\\(third mines hit\\)': '(dritte Minen Treffer)',
        '\\(third set\\)': '(drittes Set)',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Electromine': 'Électromine',
        'Wicked Replica': 'Copie de Wicked Thunder',
        'Wicked Thunder': 'Wicked Thunder',
      },
      'replaceText': {
        '(?<! )Spark': 'Étincelle',
        '(?<! )Witch Hunt': 'Piqué fulgurant',
        'Azure Thunder': 'Foudre azur',
        'Bewitching Flight': 'Vol enchanteur',
        'Burst': 'Explosion',
        'Cannonbolt': 'Canon-éclair',
        'Chain Lightning': 'Chaîne d\'éclairs',
        'Conduction Point': 'Pointe foudroyante',
        'Cross Tail Switch': 'Empalement tentaculaire',
        'Eight Star': 'Huit étoiles',
        'Electrifying Witch Hunt': 'Piqué supra-fulgurant',
        'Electron Stream': 'Courant d\'électrons',
        'Electrope Edge': 'Élévation d\'électrope',
        'Electrope Transplant': 'Transplantation d\'électrope',
        'Flame Slash': 'Tranchant enflammé',
        'Forked Fissures': 'Flux foudroyant',
        'Forked Lightning': 'Éclair divergent',
        'Four Star': 'Quatre étoiles',
        'Fulminous Field': 'Champ d\'éclairs',
        'Impact': 'Impact',
        'Ion Cluster': 'Accumulation d\'ions',
        'Laceration': 'Lacération',
        'Left Roll': 'Rouleau gauche',
        'Lightning Cage': 'Cage d\'éclairs',
        'Lightning Vortex': 'Vortex foudroyant',
        'Midnight Sabbath': 'Diablerie obscure - Minuit',
        'Mustard Bomb': 'Bombe sulfurée',
        'Narrowing Witch Hunt': 'Piqué fulgurant condensé',
        'Raining Swords': 'Pluie d\'épées',
        'Right Roll': 'Rouleau droite',
        'Sidewise Spark': 'Éclair latéral',
        'Soulshock': 'Choc d\'âme',
        'Stampeding Thunder': 'Tonnerre déferlant',
        'Sunrise Sabbath': 'Diablerie obscure - Aurore',
        'Switch of Tides': 'Changement de marées',
        'Sword Quiver': 'Épée dansante',
        'Tail Thrust': 'Percée tentaculaire',
        'Thundering': 'Anneau foudroyant',
        'Twilight Sabbath': 'Diablerie obscure - Crépuscule',
        'Wicked Blaze': 'Embrasement vicieux',
        'Wicked Bolt': 'Fulguration vicieuse',
        'Wicked Fire': 'Feu vicieux',
        'Wicked Flare': 'Brasier vicieux',
        'Wicked Jolt': 'Électrochoc vicieux',
        'Wicked Spark': 'Étincelle vicieuse',
        'Wicked Special': 'Spéciale vicieuse',
        'Wicked Thunder': 'Wicked Thunder',
        'Widening Witch Hunt': 'Piqué fulgurant élargi',
        'Witchgleam': 'Rayon éclatant',
        'Wrath of Zeus': 'Colère de Zeus',
        '\\(debuffs resolve\\)': '(Résolution des debuffs)',
        '\\(debuffs\\)': '(Debuffs)',
        '\\(enrage\\)': '(Enrage)',
        '\\(first mines hit\\)': '(Premier coup des mines)',
        '\\(first set\\)': '(Premier Set)',
        '\\(first sparks detonate\\)': '(Premiere explostion des étincelles)',
        '\\(first towers/cannons resolve\\)': '(Première résolution tours/canons)',
        '\\(floor no more\\)': '(Plus de sol)',
        '\\(fourth set\\)': '(Quatrième set)',
        '\\(mines\\)': '(Mines)',
        '\\(players\\)': '(Joueurs)',
        '\\(puddles drop\\)': '(Arrivée des puddles)',
        '\\(second hit\\)': '(Second coup)',
        '\\(second mines hit\\)': '(Second coup des mines)',
        '\\(second set\\)': '(Second Set)',
        '\\(second sparks detonate\\)': '(Seconde explostion des étincelles)',
        '\\(second towers/cannons resolve\\)': '(Seconde résolution tours/canons)',
        '\\(spread \\+ tethers\\)': '(Dispersion + Liens)',
        '\\(third mines hit\\)': '(Troisième coup des mines)',
        '\\(third set\\)': '(Troisième Set)',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Electromine': 'エレクトリックマイン',
        'Wicked Replica': 'ウィケッドサンダーの幻影',
        'Wicked Thunder': 'ウィケッドサンダー',
      },
      'replaceText': {
        '(?<! )Spark': 'スパーク',
        '(?<! )Witch Hunt': 'ウィッチハント',
        'Azure Thunder': 'アズールサンダー',
        'Bewitching Flight': 'フライングウィッチ',
        'Burst': '爆発',
        'Cannonbolt': 'キャノンボルト',
        'Chain Lightning': 'チェインライトニング',
        'Conduction Point': 'ライトニングポイント',
        'Cross Tail Switch': 'クロステイル・スペシャル',
        'Eight Star': 'エイトスターズ',
        'Electrifying Witch Hunt': 'ライトニング・ウィッチハント',
        'Electron Stream': 'エレクトロンストリーム',
        'Electrope Edge': 'エレクトロープ展開',
        'Electrope Transplant': 'エレクトロープ移植',
        'Flame Slash': '火炎斬り',
        'Forked Fissures': 'ライトニングカレント',
        'Forked Lightning': 'フォークライトニング',
        'Four Star': 'フォースターズ',
        'Fulminous Field': 'ライトニングフィールド',
        'Impact': '衝撃',
        'Ion Cluster': 'イオンクラスター',
        'Laceration': '斬撃',
        'Lightning Cage': 'ライトニングケージ',
        'Lightning Vortex': 'サークルサンダー',
        'Midnight Sabbath': 'ブラックサバト【夜半】',
        'Mustard Bomb': 'マスタードボム',
        'Narrowing Witch Hunt': '輪円式ウィッチハント',
        'Raining Swords': '剣の雨',
        'Sidewise Spark': 'サイドスパーク',
        'Soulshock': 'ソウルショック',
        'Stampeding Thunder': 'カノンスタンピード',
        'Sunrise Sabbath': 'ブラックサバト【日出】',
        'Switch of Tides': 'テイルスプラッシュ',
        'Sword Quiver': '剣の舞',
        'Tail Thrust': 'テイルスラスト',
        'Thundering': 'リングサンダー',
        'Twilight Sabbath': 'ブラックサバト【日没】',
        'Wicked Blaze': 'ウィケッドブレイズ',
        'Wicked Bolt': 'ウィケッドボルト',
        'Wicked Fire': 'ウィケッドファイア',
        'Wicked Flare': 'ウィケッドフレア',
        'Wicked Jolt': 'ウィケッドジョルト',
        'Wicked Spark': 'ウィケッドスパーク',
        'Wicked Special': 'ウィケッドスペシャル',
        'Wicked Thunder': 'ウィケッドサンダー',
        'Widening Witch Hunt': '円輪式ウィッチハント',
        'Witchgleam': 'シャインスパーク',
        'Wrath of Zeus': 'ラス・オブ・ゼウス',
      },
    },
  ],
};

export default triggerSet;
