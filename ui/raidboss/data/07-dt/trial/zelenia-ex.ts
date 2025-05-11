import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
// Bloom 3 - Seems like strats for positioning could vary here, so only calling out roses vs towers for now
// Maybe more with Escelon 2?

const phases = {
  A8B5: 'adds', // Blessed Barricade
  A8CD: 'phase2', // Perfumed Quietus
  A8B9: 'bloom1', // Roseblood Bloom
  AA14: 'bloom2', // Roseblood: 2nd Bloom
  AA15: 'bloom3', // Roseblood: 3rd Bloom
  AA16: 'bloom4', // Roseblood: 4th Bloom
  AA17: 'bloom5', // Roseblood: 5th Bloom
  AA18: 'bloom6', // Roseblood: 6th Bloom
} as const;

type Phase = (typeof phases)[keyof typeof phases] | 'phase1' | 'unknown';

const bloomTileFlags = {
  red: '01000040',
  despawningRed: '00200004',
  spawningGrey: '01000040',
  grey: '00020001',
  greyToRed: '00800040',
  clearOnWipe: '00040004',
  pulseSpread: '10000040',
  pulseStack: '20000040',
  pulseTower: '40000040',
  overlapRoses: '80000040',
} as const;

const tileLocs = ['NNE', 'ENE', 'ESE', 'SSE', 'SSW', 'WSW', 'WNW', 'NNW'] as const;
type TileLocsType = (typeof tileLocs)[number];
const tileInnerOuter = ['Inner', 'Outer'] as const;
type TileInnerOuterType = (typeof tileInnerOuter)[number];

const tileSlots = [
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '0A',
  '0B',
  '0C',
  '0D',
  '0E',
  '0F',
  '10',
  '11',
  '12',
  '13',
] as const;
type TileSlotsType = (typeof tileSlots)[number];

type MapEffectTile = `bloomTile${TileInnerOuterType}${TileLocsType}`;

type MapEffectData = {
  [tile in MapEffectTile]: {
    readonly location: TileSlotsType;
  } & typeof bloomTileFlags;
};

const mapEffectData: MapEffectData = {
  'bloomTileInnerNNE': {
    'location': '04',
    ...bloomTileFlags,
  },

  'bloomTileInnerENE': {
    'location': '05',
    ...bloomTileFlags,
  },

  'bloomTileInnerESE': {
    'location': '06',
    ...bloomTileFlags,
  },

  'bloomTileInnerSSE': {
    'location': '07',
    ...bloomTileFlags,
  },

  'bloomTileInnerSSW': {
    'location': '08',
    ...bloomTileFlags,
  },

  'bloomTileInnerWSW': {
    'location': '09',
    ...bloomTileFlags,
  },

  'bloomTileInnerWNW': {
    'location': '0A',
    ...bloomTileFlags,
  },

  'bloomTileInnerNNW': {
    'location': '0B',
    ...bloomTileFlags,
  },

  'bloomTileOuterNNE': {
    'location': '0C',
    ...bloomTileFlags,
  },

  'bloomTileOuterENE': {
    'location': '0D',
    ...bloomTileFlags,
  },

  'bloomTileOuterESE': {
    'location': '0E',
    ...bloomTileFlags,
  },

  'bloomTileOuterSSE': {
    'location': '0F',
    ...bloomTileFlags,
  },

  'bloomTileOuterSSW': {
    'location': '10',
    ...bloomTileFlags,
  },

  'bloomTileOuterWSW': {
    'location': '11',
    ...bloomTileFlags,
  },

  'bloomTileOuterWNW': {
    'location': '12',
    ...bloomTileFlags,
  },

  'bloomTileOuterNNW': {
    'location': '13',
    ...bloomTileFlags,
  },
} as const;

const mapEffectTiles: MapEffectTile[] = Object.keys(mapEffectData) as MapEffectTile[];

const isTileLoc = (loc: string): loc is TileSlotsType => {
  return tileSlots.includes(loc as TileSlotsType);
};

const getTileNameFromLocation = (loc: string): MapEffectTile => {
  if (!isTileLoc(loc))
    throw new UnreachableCode();

  const entry = Object.entries(mapEffectData).find((entry) => entry[1].location === loc);

  if (entry === undefined)
    throw new UnreachableCode();

  const [key] = entry;

  if (key === undefined)
    throw new UnreachableCode();

  return key as MapEffectTile;
};

const headMarkerData = {
  // Thorns tether purple markers during Bloom 4
  'thorns': '000C',
  // Adds red headmarker showing you're tethered
  'addsTether': '0017',
  // Escelon 2 stack marker
  'fourPlayerStack': '005D',
  // Bloom 1 clockwise rotation indicator
  'clockwise': '00A7',
  // Bloom 1 counterclockwise rotation indicator
  'counterclockwise': '00A8',
  // "Shock" donut marker
  'shockDonut': '0244',
  // "Shock" spread marker
  'shockSpread': '0245',
  // "Stock Break" multi-hit marker
  'fiveHitStack': '024E',
  // Rose/Flower headmarker
  'roseFlower': '0250',
  // Rose spread marker
  'roseSpread': '0254',
  // Stack marker during Bloom 4, for "Alexandrian Banish III"
  'bloom4Stack': '0255',
} as const;

const defaultTileState = () => ({
  bloomTileInnerNNE: 'unknown',
  bloomTileInnerENE: 'unknown',
  bloomTileInnerESE: 'unknown',
  bloomTileInnerSSE: 'unknown',
  bloomTileInnerSSW: 'unknown',
  bloomTileInnerWSW: 'unknown',
  bloomTileInnerWNW: 'unknown',
  bloomTileInnerNNW: 'unknown',
  bloomTileOuterNNE: 'unknown',
  bloomTileOuterENE: 'unknown',
  bloomTileOuterESE: 'unknown',
  bloomTileOuterSSE: 'unknown',
  bloomTileOuterSSW: 'unknown',
  bloomTileOuterWSW: 'unknown',
  bloomTileOuterWNW: 'unknown',
  bloomTileOuterNNW: 'unknown',
} as const);

export interface Data extends RaidbossData {
  phase: Phase;
  tileState: {
    [loc in MapEffectTile]: 'unknown' | 'red' | 'grey';
  };
  escelonFallBaits: ('near' | 'far')[];
  bloom1StartDir?: number;
  bloom4RoseDirNorth: boolean;
  bloom5FirstDirSafe: 'dirNE' | 'dirNW' | 'dirSE' | 'dirSW' | 'unknown';
  bloom5SecondDirSafe: 'dirNE' | 'dirNW' | 'dirSE' | 'dirSW' | 'unknown';
  bloom6Rose: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'RecollectionExtreme',
  zoneId: ZoneId.RecollectionExtreme,
  timelineFile: 'zelenia-ex.txt',
  initData: () => ({
    escelonFallBaits: [],
    phase: 'phase1',
    tileState: { ...defaultTileState() },
    bloom4RoseDirNorth: false,
    bloom5FirstDirSafe: 'unknown',
    bloom5SecondDirSafe: 'unknown',
    bloom6Rose: false,
  }),
  triggers: [
    {
      id: 'ZeleniaEx Tile Tracker',
      type: 'MapEffect',
      netRegex: {
        location: tileSlots,
        flags: [bloomTileFlags.red, bloomTileFlags.grey, bloomTileFlags.greyToRed],
        capture: true,
      },
      run: (data, matches) => {
        let newState: 'unknown' | 'red' | 'grey' = 'unknown';

        switch (matches.flags) {
          case bloomTileFlags.red:
          case bloomTileFlags.greyToRed:
            newState = 'red';
            break;
          case bloomTileFlags.grey:
            newState = 'grey';
            break;
        }
        data.tileState[getTileNameFromLocation(matches.location)] = newState;
      },
    },
    {
      id: 'ZeleniaEx Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phases), capture: true },
      suppressSeconds: 5,
      run: (data, matches) => data.phase = phases[matches.id as keyof typeof phases] ?? 'unknown',
    },
    {
      id: 'ZeleniaEx Escelon Bait Collect',
      type: 'GainsEffect',
      // count: 2F6 = near, 2F7 = far
      netRegex: { effectId: 'B9A', count: ['2F6', '2F7'] },
      preRun: (data, matches) =>
        data.escelonFallBaits.push(matches.count === '2F6' ? 'near' : 'far'),
    },
    {
      id: 'ZeleniaEx Escelon Bait Cleanup',
      type: 'GainsEffect',
      // count: 2F6 = near, 2F7 = far
      netRegex: { effectId: 'B9A', count: ['2F6', '2F7'], capture: false },
      delaySeconds: 30,
      suppressSeconds: 30,
      run: (data) => data.escelonFallBaits = [],
    },
    {
      id: 'ZeleniaEx Escelon Bait',
      type: 'GainsEffect',
      // count: 2F6 = near, 2F7 = far
      netRegex: { effectId: 'B9A', count: ['2F6', '2F7'], capture: false },
      durationSeconds: 19,
      suppressSeconds: (data) => data.escelonFallBaits.length > 1 ? 20 : 0,
      infoText: (data, _matches, output) => {
        if (data.escelonFallBaits.length !== 2)
          return;
        const [bait1, bait2] = data.escelonFallBaits;
        if (bait1 === undefined || bait2 === undefined)
          return;

        if (bait1 === bait2) {
          return output.swapAfterFirst!({
            first: output[bait1]!(),
          });
        }
        return output.swapAfterSecond!({
          first: output[bait1]!(),
        });
      },
      outputStrings: {
        near: {
          en: 'Near',
          de: 'Nah',
          fr: 'proche',
          ja: '近',
          cn: '近',
          ko: '가까이',
        },
        far: {
          en: 'Far',
          de: 'Fern',
          fr: 'loin',
          ja: '遠',
          cn: '远',
          ko: '멀리',
        },
        swapAfterFirst: {
          en: '${first} bait first, Swap after first+third',
          de: '${first} zuerst ködern, wechsel nach dem ersten + dritten',
          fr: 'Bait ${first} d\'abord, échangez après le 1er et 3ème',
          ja: '${first} を先に誘導 → 1・3回目後に交代',
          cn: '先 ${first} 引导, 1、3刀后交换',
          ko: '처음 ${first} 유도, 1, 3번째 교대',
        },
        swapAfterSecond: {
          en: '${first} bait first, Swap after second',
          de: '${first} zuerst ködern, wechsel nach dem zweiten',
          fr: 'Bait ${first} d\'abord, échangez après le 2ème',
          ja: '${first} を先に誘導 → 2回目後に交代',
          cn: '先 ${first} 引导, 2刀后交换',
          ko: '처음 ${first} 유도, 2번째 교대',
        },
      },
    },
    {
      id: 'ZeleniaEx Thorned Catharsis',
      type: 'StartsUsing',
      netRegex: { id: 'A89E', source: 'Zelenia', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'ZeleniaEx Shock P1 Tower',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.shockDonut, capture: true },
      condition: (data, matches) =>
        Conditions.targetIsYou()(data, matches) && data.phase === 'phase1',
      infoText: (_data, _matches, output) => output.tower!(),
      outputStrings: {
        tower: {
          en: 'Donut on you, get tower',
          de: 'Donut auf DIR, steh im Turm',
          fr: 'Donut sur VOUS, prenez une tour',
          ja: 'ドーナツ対象 → 塔踏み',
          cn: '月环点名, 踩塔',
          ko: '도넛 대상자, 기둥 들어가기',
        },
      },
    },
    {
      id: 'ZeleniaEx Shock Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.shockSpread, capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'ZeleniaEx Shock Spread Move Reminder',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.shockSpread, capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 7,
      response: Responses.moveAway(),
    },
    {
      id: 'ZeleniaEx Bloom 4 Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.bloom4Stack, capture: false },
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: {
          en: 'Support/DPS stacks',
          de: 'Support/DPS sammeln',
          fr: 'Support/DPS package',
          ja: 'タンクヒラ/DPS 頭割り',
          cn: '红地板分摊',
          ko: '탱힐/딜러 쉐어',
        },
      },
    },
    {
      id: 'ZeleniaEx Power Break',
      type: 'StartsUsing',
      netRegex: { id: ['A8B0', 'A8B1'], source: 'Zelenia\'s Shade', capture: true },
      infoText: (_data, matches, output) => {
        // A8B0 = cleaving right
        // A8B1 = cleaving left
        const isNorth = Directions.hdgTo4DirNum(parseFloat(matches.heading)) === 2;
        let cleavingEast = matches.id === 'A8B0';
        // flip cleave dir if north
        if (isNorth)
          cleavingEast = !cleavingEast;

        if (cleavingEast)
          return output.west!();
        return output.east!();
      },
      outputStrings: {
        west: Outputs.west,
        east: Outputs.east,
      },
    },
    {
      id: 'ZeleniaEx Specter of the Lost',
      type: 'StartsUsing',
      netRegex: { id: 'A89F', source: 'Zelenia', capture: false },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tetherBuster: Outputs.tetherBusters,
          busterAvoid: Outputs.avoidTetherBusters,
        };

        if (data.role === 'tank')
          return { alertText: output.tetherBuster!() };
        return { infoText: output.busterAvoid!() };
      },
    },
    {
      id: 'ZeleniaEx Stock Break',
      type: 'StartsUsing',
      netRegex: { id: 'A8D5', source: 'Zelenia', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack x5',
          de: 'Sammeln x5',
          fr: 'Package x5',
          ja: '頭割り x5',
          cn: '5次分摊',
          ko: '쉐어 5번',
        },
      },
    },
    {
      id: 'ZeleniaEx Blessed Barricade',
      type: 'StartsUsing',
      netRegex: { id: 'A8B5', source: 'Zelenia', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Supports west, DPS east',
          de: 'Supports Westen, DPS Osten',
          fr: 'Supports Ouest, DPS Est',
          ja: 'タンクヒラ西 / DPS東',
          cn: 'T奶 左, DPS 右',
          ko: '탱힐 왼쪽, 딜러 오른쪽',
        },
      },
    },
    {
      id: 'ZeleniaEx Spearpoint Push',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.addsTether, capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Point sword cleave out',
          de: 'Schwert-Cleves nach draußen zeigen',
          fr: 'Dirigez l\'épée vers l\'extérieur',
          ja: '剣を外に向ける',
          cn: '引导半场刀',
          ko: '바깥으로 유도',
        },
      },
    },
    {
      id: 'ZeleniaEx Perfumed Quietus',
      type: 'StartsUsing',
      netRegex: { id: 'A8CD', source: 'Zelenia', capture: false },
      delaySeconds: 3.9,
      response: Responses.bigAoe(),
    },
    {
      id: 'ZeleniaEx Bloom 1 Rotation Collector',
      type: 'MapEffect',
      netRegex: {
        location: tileSlots,
        flags: [bloomTileFlags.red, bloomTileFlags.grey, bloomTileFlags.greyToRed],
        capture: false,
      },
      condition: (data) => data.phase === 'bloom1',
      delaySeconds: 0.5,
      suppressSeconds: 100,
      run: (data) => {
        let dirIdx = 1;
        let foundGrey = false;

        // Find the 1st inner tile clockwise that's grey
        for (const key of mapEffectTiles) {
          if (!key.includes('Inner'))
            continue;
          if (foundGrey) {
            if (data.tileState[key] === 'red') {
              // Special edge case, NNW is safe
              dirIdx = 15;
            } else {
              dirIdx += 2;
            }
            break;
          }

          if (data.tileState[key] === 'grey') {
            foundGrey = true;
            continue;
          }

          dirIdx += 2;
        }

        data.bloom1StartDir = dirIdx;
      },
    },
    {
      id: 'ZeleniaEx Bloom 1 Rotation',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.clockwise, headMarkerData.counterclockwise], capture: true },
      infoText: (data, matches, output) =>
        output.text!({
          dir: output[Directions.output16Dir[data.bloom1StartDir ?? -1] ?? 'unknown']!(),
          rotate: matches.id === headMarkerData.clockwise
            ? output.clockwise!()
            : output.counterclockwise!(),
        }),
      outputStrings: {
        ...Directions.outputStrings16Dir,
        clockwise: Outputs.clockwise,
        counterclockwise: Outputs.counterclockwise,
        text: {
          en: 'Start ${dir}, rotate ${rotate}',
          de: 'Starte ${dir}, rotiere ${rotate}',
          fr: 'Commencez ${dir}, tournez ${rotate}',
          ja: '${dir} から開始, ${rotate}',
          cn: '从 ${dir} 起跑, ${rotate}',
          ko: '${dir} 시작, ${rotate}으로 회전',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 2',
      type: 'StartsUsing',
      netRegex: { id: ['A9BA', 'A9BB'], capture: true },
      condition: (data) => data.phase === 'bloom2',
      durationSeconds: 11.4,
      suppressSeconds: 30,
      infoText: (data, matches, output) => {
        // Only two possible floor patterns here. Thunder slash pattern is always the same.
        const inSafeFirst = matches.id === 'A9BB';
        const inOneTileSafeWest = data.tileState.bloomTileInnerWNW === 'red';

        if (inSafeFirst) {
          if (inOneTileSafeWest)
            return output.inWest!();
          return output.inEast!();
        }
        if (inOneTileSafeWest)
          return output.outEast!();
        return output.outWest!();
      },
      outputStrings: {
        inWest: {
          en: 'In WSW => Out WNW => Out WSW',
          de: 'Rein WSW => Raus WNW => Raus WSW',
          fr: 'Intérieur OSO => Extérieur ONO => Extérieur OSO',
          ja: '内8時 ⇒ 外10時 ⇒ 外8時',
          cn: '内左偏下 => 外左偏上 => 外左偏下',
          ko: '안 8시 => 바깥 10시 => 바깥 8시',
        },
        inEast: {
          en: 'In ESE => Out ESE => Out ENE',
          de: 'Rein OSO => Raus OSO => Raus ONO',
          fr: 'Intérieur ESE => Extérieur ESE => Intérieur ENE',
          ja: '内4時 ⇒ 外4時 ⇒ 外2時',
          cn: '内右偏下 => 外右偏下 => 外右偏上',
          ko: '안 4시 => 바깥 4시 => 바깥 2시',
        },
        outWest: {
          en: 'Out WSW => In WNW => In WSW',
          de: 'Raus WSW => Rein WNW => Rein WSW',
          fr: 'Extérieur OSO => Intérieur ONO => Intérieur OSO',
          ja: '外8時 ⇒ 内10時 ⇒ 内8時',
          cn: '外左偏下 => 内左偏上 => 内左偏下',
          ko: '바깥 8시 => 안 10시 => 안 8시',
        },
        outEast: {
          en: 'Out ESE => In ESE => In ENE',
          de: 'Raus OSO => Rein OSO => Rein ONO',
          fr: 'Extérieur ESE => Intérieur ESE => Intérieur ENE',
          ja: '外4時 ⇒ 内4時 ⇒ 内2時',
          cn: '外右偏下 => 内右偏下 => 内右偏上',
          ko: '바깥 4시 => 안 4시 => 안 2시',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 3 Rose Headmarker',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.roseFlower, capture: true },
      condition: (data) => data.phase === 'bloom3',
      suppressSeconds: 10,
      infoText: (data, matches, output) => {
        const targetIsDPS = data.party.isDPS(matches.target);
        const youAreDPS = data.party.isDPS(data.me);
        if (targetIsDPS === youAreDPS)
          return output.rose!();

        return output.tower!();
      },
      outputStrings: {
        rose: {
          en: 'Rose Marker on YOU',
          de: 'Rosen-Marker auf DIR',
          fr: 'Marqueur de Rose sur VOUS',
          ja: 'バラ対象',
          cn: '蔷薇点名',
          ko: '장미징 대상자',
        },
        tower: {
          en: 'Soak Tower',
          de: 'Im Turm stehen',
          fr: 'Prenez une tour',
          ja: '塔踏み',
          cn: '踩塔',
          ko: '기둥 들어가기',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 4 Find Roses Dir',
      type: 'MapEffect',
      netRegex: {
        location: tileSlots,
        flags: [bloomTileFlags.red, bloomTileFlags.grey, bloomTileFlags.greyToRed],
        capture: false,
      },
      condition: (data) => data.phase === 'bloom4',
      delaySeconds: 0.5,
      suppressSeconds: 100,
      infoText: (data, _matches, output) => {
        const rosesNorth = data.tileState.bloomTileOuterSSE === 'red' ||
          data.tileState.bloomTileOuterSSW === 'red';
        data.bloom4RoseDirNorth = rosesNorth;

        if (rosesNorth)
          return output.north!();

        return output.south!();
      },
      outputStrings: {
        north: {
          en: 'Roses north, spreads south',
          de: 'Rosen Norden, Verteilen Süden',
          fr: 'Roses au Nord, dispersion au Sud',
          ja: 'バラ北, さんかい南',
          cn: '蔷薇上, 分散下',
          ko: '장미 북쪽, 산개 남쪽',
        },
        south: {
          en: 'Roses south, spreads north',
          de: 'Rosen Süden, Verteilen Norden',
          fr: 'Roses au Sud, dispersion au Nord',
          ja: 'バラ南, さんかい北',
          cn: '蔷薇下, 分散上',
          ko: '장미 남쪽, 산개 북쪽',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 4 Rose Headmarker',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.roseFlower, capture: true },
      condition: (data) => data.phase === 'bloom4',
      suppressSeconds: 10,
      infoText: (data, matches, output) => {
        const targetIsDPS = data.party.isDPS(matches.target);
        const youAreDPS = data.party.isDPS(data.me);
        const youAreRose = targetIsDPS === youAreDPS;

        let north = data.bloom4RoseDirNorth;

        if (!youAreRose)
          north = !north;

        const northSouth = north ? output.north!() : output.south!();

        if (youAreRose)
          return output.rose!({ northSouth: northSouth });

        return output.spread!({ northSouth: northSouth });
      },
      outputStrings: {
        unknown: Outputs.unknown,
        north: Outputs.north,
        south: Outputs.south,
        rose: {
          en: 'Rose Marker on YOU, spread ${northSouth}',
          de: 'Rosen-Marker auf DIR, verteile ${northSouth}',
          fr: 'Marqueur de Rose sur VOUS, dispersion ${northSouth}',
          ja: 'バラ対象, ${northSouth} さんかい',
          cn: '蔷薇点名, ${northSouth} 分散',
          ko: '장미징 대상자, ${northSouth}에서 산개',
        },
        spread: {
          en: 'Spread Marker on YOU, spread ${northSouth}',
          de: 'Verteilen-Marker auf DIR, verteile ${northSouth}',
          fr: 'Marqueur de dispersion sur VOUS, dispersion ${northSouth}',
          ja: 'さんかい対象, ${northSouth} さんかい',
          cn: '分散点名, ${northSouth} 分散',
          ko: '산개징 대상자, ${northSouth}에서 산개',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 4 Thorns',
      type: 'StartsUsing',
      netRegex: { id: 'A8C3', capture: false },
      infoText: (_data, _matches, output) => output.thorns!(),
      outputStrings: {
        thorns: {
          en: 'Stack for thorns => break tethers => stack in red tiles',
          de: 'Sammeln für Dornen => Verbindung brechen => steh auf dem roten Feld',
          fr: 'Packages pour les ronces => Cassez les liens => Packages dans les tuiles rouges',
          ja: '茨集合 => 線切り => 赤床頭割り',
          cn: '集合连线 => 拉断连线 => 红地板分摊',
          ko: '모이기 => 선 끊기 => 장미장판위에 서기',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 5 Chakram Collector',
      type: 'ActorSetPos',
      netRegex: { id: '40[0-9A-F]{6}', capture: true },
      condition: (data, matches) => {
        if (data.phase !== 'bloom5')
          return false;

        if (Math.abs(100 - parseFloat(matches.x)) < 2)
          return false;

        if (Math.abs(100 - parseFloat(matches.y)) < 2)
          return false;

        return true;
      },
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const neSwSafe = data.tileState.bloomTileOuterNNE === 'grey';
        const cleaveDir = Directions.hdgTo4DirNum(parseFloat(matches.heading));
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const isNorth = y < 100;
        const isWest = x < 100;

        // Consider east safe to start, reverse if needed
        const safeDirs: ('dirNE' | 'dirSE' | 'dirSW' | 'dirNW')[] = neSwSafe
          ? ['dirNE', 'dirSW']
          : ['dirSE', 'dirNW'];

        let firstCleave: ('dirNE' | 'dirSE' | 'dirSW' | 'dirNW')[] = ['dirNE', 'dirSE'];

        if ([1, 3].includes(cleaveDir)) {
          if (isNorth) {
            firstCleave = ['dirNE', 'dirNW'];
          } else {
            firstCleave = ['dirSE', 'dirSW'];
          }
        } else if (isWest) {
          firstCleave = ['dirNW', 'dirSW'];
        }

        data.bloom5FirstDirSafe = safeDirs.find((dir) => !firstCleave.includes(dir)) ?? 'unknown';
        data.bloom5SecondDirSafe = safeDirs.find((dir) => firstCleave.includes(dir)) ?? 'unknown';

        return output.start!({
          startDir: output[data.bloom5FirstDirSafe]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        start: {
          en: 'Start ${startDir}',
          de: 'Start ${startDir}',
          fr: 'Commencez ${startDir}',
          ja: '${startDir} 開始',
          cn: '从 ${startDir} 起跑',
          ko: '${startDir} 시작',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 5 Movement',
      type: 'StartsUsing',
      netRegex: { id: ['A9BA', 'A9BB'], capture: true },
      condition: (data) => data.phase === 'bloom5',
      durationSeconds: 11.4,
      suppressSeconds: 30,
      infoText: (data, matches, output) => {
        const inSafeFirst = matches.id === 'A9BB';

        return output.text!({
          inOutFirst: inSafeFirst ? output.in!() : output.out!(),
          inOutSecond: inSafeFirst ? output.out!() : output.in!(),
          dirFirst: output[data.bloom5FirstDirSafe]!(),
          dirSecond: output[data.bloom5SecondDirSafe]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        in: Outputs.in,
        out: Outputs.out,
        text: {
          en: '${inOutFirst} ${dirFirst} Clockwise => ${inOutSecond} ${dirSecond}',
          de: '${inOutFirst} ${dirFirst} Im Uhrzeigersinn => ${inOutSecond} ${dirSecond}',
          fr: '${inOutFirst} ${dirFirst} sens horaire => ${inOutSecond} ${dirSecond}',
          ja: '${inOutFirst} ${dirFirst} 時計回り => ${inOutSecond} ${dirSecond}',
          cn: '${inOutFirst} ${dirFirst} 顺时针 => ${inOutSecond} ${dirSecond}',
          ko: '${dirFirst} ${inOutFirst} => ${dirSecond} ${inOutSecond}',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 6 Rose Headmarker',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.roseFlower, capture: true },
      condition: (data) => data.phase === 'bloom6',
      suppressSeconds: 10,
      infoText: (data, matches, output) => {
        const targetIsDPS = data.party.isDPS(matches.target);
        const youAreDPS = data.party.isDPS(data.me);
        data.bloom6Rose = targetIsDPS === youAreDPS;

        if (data.bloom6Rose)
          return output.rose!();

        return output.tower!();
      },
      outputStrings: {
        rose: {
          en: 'Rose Marker on YOU',
          de: 'Rosen-Marker auf DIR',
          fr: 'Marqueur de Rose sur VOUS',
          ja: 'バラ対象',
          cn: '蔷薇点名',
          ko: '장미징 대상자',
        },
        tower: {
          en: 'Tower Soaks Later',
          de: 'Nehme Turm später',
          fr: 'Prenez une tour après',
          ja: 'あとで塔踏み',
          cn: '稍后踩塔',
          ko: '나중에 기둥 들어가기',
        },
      },
    },
    {
      id: 'ZeleniaEx Bloom 6',
      type: 'StartsUsing',
      netRegex: { id: ['A8DF', 'A8E1'], capture: true },
      condition: (data) => data.phase === 'bloom5',
      durationSeconds: 11.4,
      suppressSeconds: 30,
      infoText: (data, matches, output) => {
        const cleavingENEFirst = matches.id === 'A8E1';
        const towerENEOut = data.tileState.bloomTileOuterENE === 'red';

        const placeIn = cleavingENEFirst ? towerENEOut : !towerENEOut;

        if (data.bloom6Rose) {
          return output.rose!({
            inOut: placeIn ? output.in!() : output.out!(),
          });
        }

        return output.tower!();
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        in: Outputs.in,
        out: Outputs.out,
        rose: {
          en: 'Place rose ${inOut} => dodge cleaves',
          de: 'Plaziere Rose ${inOut} => weiche dem Cleve aus',
          fr: 'Placez la rose ${inOut} => esquivez les cleaves',
          ja: '${inOut} にバラ置き => 扇回避',
          cn: '${inOut} 放置蔷薇 => 躲避扇形',
          ko: '${inOut} 장미 놓기 => 장판 피하기',
        },
        tower: {
          en: 'Dodge cleaves => soak tower',
          de: 'Weiche dem Cleave aus => steh im Turm',
          fr: 'Esquivez les cleaves => prenez une tour',
          ja: '扇回避 => 塔踏み',
          cn: '躲避扇形 => 踩塔',
          ko: '장판 피하기 => 기둥 들어가기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Briar Thorn': 'Atomisator',
        'Zelenia(?!\')': 'Zelenia',
        'Zelenia\'s Shade': 'Phantom-Zelenia',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(chakrams\\)': '(Chakrams)',
        '\\(enrage\\?\\)': '(Finalangriff?)',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(markers\\)': '(Marker)',
        '\\(resolves\\)': '(Auflösen)',
        '\\(snapshot\\)': '(Snapshot)',
        'Alexandrian Banish II(?!I)': 'Ritterliches Verbannra',
        'Alexandrian Banish III': 'Ritterliches Verbannga',
        'Alexandrian Holy': 'Ritterliches Sanctus',
        'Alexandrian Thunder II(?!I)': 'Ritterliches Blitzra',
        'Alexandrian Thunder III': 'Ritterliches Blitzga',
        'Alexandrian Thunder IV': 'Ritterliches Blitzka',
        'Blessed Barricade': 'Heilige Mauer',
        'Bud of Valor': 'Lug und Trug',
        'Emblazon': 'Mahnendes Siegel',
        'Encircling Thorns': 'Rosendorn',
        'Escelons\' Fall': 'Aufsteigendes Kreuz',
        'Explosion': 'Explosion',
        'Holy Hazard': 'Heilige Gefahr',
        'Perfumed Quietus': 'Quietus-Rose',
        'Power Break': 'Schockbolzen',
        'Queen\'s Crusade': 'Heiliges Schlachtfeld',
        'Rose Red': 'Rosenfinale',
        'Roseblood Bloom': 'Arkane Enthüllung',
        'Roseblood Withering': 'Arkane Enthüllung: Nullform',
        'Roseblood: 2nd Bloom': 'Arkane Enthüllung: Zweite Form',
        'Roseblood: 3rd Bloom': 'Arkane Enthüllung: Dritte Form',
        'Roseblood: 4th Bloom': 'Arkane Enthüllung: Vierte Form',
        'Roseblood: 5th Bloom': 'Arkane Enthüllung: Fünfte Form',
        'Roseblood: 6th Bloom': 'Arkane Enthüllung: Sechste Form',
        'Shock': 'Schock',
        'Spearpoint Push': 'Sturzflug',
        'Specter of the Lost': 'Spektralschlag',
        'Stock Break': 'Exekutionsschlag',
        'Thorned Catharsis': 'Rosenkatharsis',
        'Thunder Slash': 'Donnerhieb',
        'Valorous Ascension': 'Atomisator',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Briar Thorn': 'Mortimer',
        'Zelenia(?!\')': 'Zelenia',
        'Zelenia\'s Shade': 'double de Zelenia',
      },
      'replaceText': {
        'Alexandrian Banish II(?!I)': 'Extra Bannissement chevaleresque',
        'Alexandrian Banish III': 'Méga Bannissement chevaleresque',
        'Alexandrian Holy': 'Miracle chevaleresque',
        'Alexandrian Thunder II(?!I)': 'Méga Foudre chevaleresque',
        'Alexandrian Thunder III': 'Méga Foudre chevaleresque',
        'Alexandrian Thunder IV': 'Giga Foudre chevaleresque',
        'Blessed Barricade': 'Mur sacré',
        'Bud of Valor': 'Dupligenèse',
        'Emblazon': 'Cercle d\'exhortation',
        'Encircling Thorns': 'Épine de rose',
        'Escelons\' Fall': 'Péril cruciforme',
        'Explosion': 'Explosion',
        'Holy Hazard': 'Péril miraculeux',
        'Perfumed Quietus': 'Quietus de la rose',
        'Power Break': 'Fente puissante',
        'Queen\'s Crusade': 'Domaine sacré',
        'Rose Red': 'Rose finale',
        'Roseblood Bloom': 'Déploiement arcanique',
        'Roseblood Withering': 'Déploiement arcanique : annihilation',
        'Roseblood: 2nd Bloom': 'Déploiement arcanique : seconde forme',
        'Roseblood: 3rd Bloom': 'Déploiement arcanique : troisième forme',
        'Roseblood: 4th Bloom': 'Déploiement arcanique : quatrième forme',
        'Roseblood: 5th Bloom': 'Déploiement arcanique : cinquième forme',
        'Roseblood: 6th Bloom': 'Déploiement arcanique : sixième forme',
        'Shock': 'Choc',
        'Spearpoint Push': 'Ruée fulgurante',
        'Specter of the Lost': 'Fente spectrale',
        'Stock Break': 'Fente',
        'Thorned Catharsis': 'Roses cathartiques',
        'Thunder Slash': 'Foudrolle',
        'Valorous Ascension': 'Mortimer',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Briar Thorn': 'クライムハザード',
        'Zelenia(?!\')': 'ゼレニア',
        'Zelenia\'s Shade': 'ゼレニアの幻影',
      },
      'replaceText': {
        'Alexandrian Banish II(?!I)': 'キングダム・バニシュラ',
        'Alexandrian Banish III': 'キングダム・バニシュガ',
        'Alexandrian Holy': 'キングダム・ホーリー',
        'Alexandrian Thunder II(?!I)': 'キングダム・サンダラ',
        'Alexandrian Thunder III': 'キングダム・サンダガ',
        'Alexandrian Thunder IV': 'キングダム・サンダジャ',
        'Blessed Barricade': '聖護壁',
        'Bud of Valor': '幻影生成',
        'Emblazon': '活性紋',
        'Encircling Thorns': 'ローズソーン',
        'Escelons\' Fall': 'クライムクロス',
        'Explosion': '爆発',
        'Holy Hazard': 'ホーリーハザード',
        'Perfumed Quietus': 'クワイタスローズ',
        'Power Break': 'パワーブレイク',
        'Queen\'s Crusade': '聖戦領域',
        'Rose Red': 'ローズ・オブ・フィナーレ',
        'Roseblood Bloom': '魔法陣展開',
        'Roseblood Withering': '魔法陣展開・零式',
        'Roseblood: 2nd Bloom': '魔法陣展開・二式',
        'Roseblood: 3rd Bloom': '魔法陣展開・三式',
        'Roseblood: 4th Bloom': '魔法陣展開・四式',
        'Roseblood: 5th Bloom': '魔法陣展開・五式',
        'Roseblood: 6th Bloom': '魔法陣展開・六式',
        'Shock': 'ショック',
        'Spearpoint Push': '突撃',
        'Specter of the Lost': 'スペクトルブレイク',
        'Stock Break': 'ストックブレイク',
        'Thorned Catharsis': 'ローズ・カタルシス',
        'Thunder Slash': '雷鳴剣',
        'Valorous Ascension': 'クライムハザード',
      },
    },
  ],
};

export default triggerSet;
