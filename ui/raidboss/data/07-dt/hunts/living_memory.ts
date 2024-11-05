import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Sally - Code Execution/Reverse Code: possibly add individual step callouts?

type ExecutionSafe = 'out' | 'in' | 'cardinals';
const executionIdToSafeMap: { [id: string]: ExecutionSafe } = {
  '9636': 'out',
  '9637': 'in',
  '9638': 'cardinals',
};

const executionOutputStrings = {
  out: Outputs.out,
  in: Outputs.in,
  cardinals: Outputs.cardinals,
  next: Outputs.next,
} as const;

type ForecastSafe = 'under' | 'out' | 'behind' | 'intercards';
const forecastNpcYellMap: { [id: string]: ForecastSafe[] } = {
  '425E': ['under', 'out', 'intercards'], // "Reacquiring data... Searing sunshine will give way to electric storms, followed by the coldest of cold snaps!"
  '425F': ['out', 'behind', 'under'], // "Reacquiring data... Thunderclouds will give way to ferocious gales then sizzling heat!"
  '4260': ['intercards', 'out', 'behind'], // "Reacquiring data... Blinding blizzards will turn to lightning storms, followed by tremendous gales!"
  '4261': ['behind', 'under', 'out'], // "Reacquiring data... A howling tempest will stoke raging wildfires, followed by an almighty thunderstorm!"
};
const forecastNpcYellIds = Object.keys(forecastNpcYellMap);

const climateChangeNpcYellMap: { [id: string]: Partial<Record<ForecastSafe, ForecastSafe>> } = {
  // id: { replacedEffect: newEffect }
  '428A': { 'intercards': 'under' }, // "<bleep> ErRoR! Revising forecast... Expect wildfire conditions, not wintry woe!"
  '428B': { 'behind': 'intercards' }, // "<bloop> eRrOr! Revising forecast... Expect blizzard conditions, not violent zephyrs!"
  '428C': { 'under': 'out' }, // "<bleep> erRoR! Revising forecast... Expect hyperelectricity, not searing sunshine!"
  '428D': { 'out': 'behind' }, // "<bloop> ErROr! Revising forecast... Expect gale-force winds, not shocking storms!"
};
const climateChangeNpcYellIds = Object.keys(climateChangeNpcYellMap);
const weatherChannelCastIds = ['967C', '967E', '9680', '9682'];

type CardNumber = 1 | 2 | 3 | 4 | 5 | 6;
type CardSafeDirection = 'SE' | 'S' | 'SW' | 'NE' | 'N' | 'NW';
const CardSafeDirectionCol: CardSafeDirection[] = [
  'NW',
  'N',
  'NE',
  'SE',
  'S',
  'SW',
];

const muCardFirstDrawMap: { [id: string]: CardNumber } = {
  '970A': 1,
  '970B': 2,
  '970C': 3,
  '970D': 4,
  '970E': 5,
  '970F': 6,
};
const muCardDrawMap: { [id: string]: CardNumber } = {
  '9710': 1,
  '9711': 2,
  '9712': 3,
  '9713': 4,
  '9714': 5,
  '9715': 6,
};
const muCardNpcIdMap: { [id: string]: number } = {
  '43EE': 1,
  '43EF': 2,
  '43F0': 3,
  '43F1': 4,
  '43F2': 5,
  '43F3': 6,
};

const muThreeCardPatternMap: {
  [id: string]: [CardSafeDirection, CardSafeDirection, CardSafeDirection];
} = {
  '970A': ['SE', 'SW', 'N'], // ('970A', '9715', '9714') [1, 6, 5]
  '970B': ['N', 'SE', 'SW'], // ('970B', '9713', '9710') [2, 4, 1]
  '970C': ['NW', 'NE', 'S'], // ('970C', '9711', '9713') [3, 2, 4]
  '970D': ['NE', 'S', 'NW'], // ('970D', '9710', '9715') [4, 1, 6]
  '970E': ['SW', 'N', 'SE'], // ('970E', '9712', '9711') [5, 3, 2]
  '970F': ['S', 'NW', 'NE'], // ('970F', '9714', '9712') [6, 5, 3]
};
//     south
//  777 791 805
// -------------
// | 4 | 5 | 6 | 603
// -------------
// | 1 | 2 | 3 | 583
// -------------
// (numbers for 2 card pattern)
const cardPositionToDirection = (x: number, y: number): number => {
  x = x - 791.0; // arena center
  y = y - 593.0;
  const dirNum = Math.round(6 - 4 * Math.atan2(x, y) / Math.PI) % 8;
  // shifts over the resulting direction number for no gaps, and to keep each row together.
  // returns [NW, N, NE, SE, S, SW]
  return dirNum >= 4 ? dirNum - 2 : dirNum - 1;
};

const cardOutputStrings = {
  N: Outputs.dirN,
  S: Outputs.dirS,
  NW: Outputs.dirNW,
  NE: Outputs.dirNE,
  SE: Outputs.dirSE,
  SW: Outputs.dirSW,
  next: Outputs.next,
  unknown: Outputs.unknown,
  start: {
    en: 'Start ${dir}',
  },
};

export interface Data extends RaidbossData {
  executionSafe: ExecutionSafe[];
  forecastSafe: ForecastSafe[];
  muCardSpots: number[];
  muDrawnCardIds: string[];
  muOnCard: number;
  muSafeDirections: CardSafeDirection[];
  muCardPattern: 'two' | 'three' | null;
}

const triggerSet: TriggerSet<Data> = {
  id: 'LivingMemory',
  zoneId: ZoneId.LivingMemory,
  initData: () => ({
    executionSafe: [],
    forecastSafe: [],
    muCardSpots: [],
    muDrawnCardIds: [],
    muOnCard: 0,
    muSafeDirections: [],
    muCardPattern: null,
  }),
  triggers: [
    // ****** A-RANK: Cat's Eye ****** //
    {
      id: 'Hunt Cat\'s Eye Gravitational Wave',
      type: 'StartsUsing',
      netRegex: { id: '9BCF', source: 'Cat\'s Eye', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Cat\'s Eye Jump + Look Away',
      type: 'StartsUsing',
      netRegex: { id: '966E', source: 'Cat\'s Eye', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Face away from landing marker',
          de: 'Schau weg von der Ziel-Markierung',
          fr: 'Orientez-vous ailleurs du marqueur d\'arrivée',
          cn: '背对落地点',
          ko: '바닥징 뒤돌기',
        },
      },
    },
    {
      id: 'Hunt Cat\'s Eye Jump + Look Toward',
      type: 'StartsUsing',
      // Only used when Wandering Eyes buff is active.
      netRegex: { id: '966F', source: 'Cat\'s Eye', capture: false },
      durationSeconds: 7.5,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Face toward landing marker',
          de: 'Schau zur Ziel-Markierung',
          fr: 'Orientez-vous vers le marqueur d\'arrivée',
          cn: '面向落地点',
          ko: '바닥징 쳐다보기',
        },
      },
    },
    {
      id: 'Hunt Cat\'s Eye Bloodshot Gaze + Look Away',
      type: 'StartsUsing',
      netRegex: { id: '9673', source: 'Cat\'s Eye', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack (face away from target)',
          de: 'Sammeln (Schau weg vom Ziel)',
          fr: 'Pack (ne regardez pas la cible)',
          cn: '分摊 (背对目标)',
          ko: '쉐어 (대상에게서 뒤돌기)',
        },
      },
    },
    {
      id: 'Hunt Cat\'s Eye Bloodshot Gaze + Look Toward',
      type: 'StartsUsing',
      netRegex: { id: '9AF4', source: 'Cat\'s Eye', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack (face toward target)',
          fr: 'Pack (regardez la cible)',
          cn: '分摊 (面向目标)',
          ko: '쉐어 (대상 바라보기)',
        },
      },
    },

    // ****** A-RANK: Sally the Sweeper ****** //
    {
      id: 'Hunt Sally Execution Model Collect',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(executionIdToSafeMap), source: 'Sally the Sweeper' },
      run: (data, matches) => {
        const safe = executionIdToSafeMap[matches.id];
        if (safe === undefined)
          throw new UnreachableCode();
        data.executionSafe.push(safe);
      },
    },
    {
      id: 'Hunt Sally Code Execution',
      type: 'StartsUsing',
      // Not clear why there are two ids, but both get used.
      netRegex: { id: ['9639', '963A'], source: 'Sally the Sweeper', capture: false },
      durationSeconds: 12,
      infoText: (data, _matches, output) => {
        const safe = data.executionSafe;
        if (safe.length !== 3)
          return;
        return safe.map((spot) => output[spot]!()).join(output.next!());
      },
      run: (data) => data.executionSafe = [],
      outputStrings: executionOutputStrings,
    },
    {
      id: 'Hunt Sally Reverse Code',
      type: 'StartsUsing',
      // Not clear why there are two ids, but both get used.
      netRegex: { id: ['963B', '963C'], source: 'Sally the Sweeper', capture: false },
      durationSeconds: 12,
      infoText: (data, _matches, output) => {
        const safe = data.executionSafe.reverse();
        if (safe.length !== 3)
          return;
        return safe.map((spot) => output[spot]!()).join(output.next!());
      },
      run: (data) => data.executionSafe = [],
      outputStrings: executionOutputStrings,
    },

    // ****** S-RANK: The Forecaster ****** //
    {
      id: 'Hunt The Forecaster Wildfire Conditions',
      type: 'StartsUsing',
      netRegex: { id: '9684', source: 'The Forecaster', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'Hunt The Forecaster Hyperelectricity',
      type: 'StartsUsing',
      netRegex: { id: '9685', source: 'The Forecaster', capture: false },
      response: Responses.outOfMelee('alert'),
    },
    {
      id: 'Hunt The Forecaster Gale-force Winds',
      type: 'StartsUsing',
      netRegex: { id: '9686', source: 'The Forecaster', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt The Forecaster Blizzard Conditions',
      type: 'StartsUsing',
      netRegex: { id: '9687', source: 'The Forecaster', capture: false },
      alertText: (_data, _matches, output) => output.intercards!(),
      outputStrings: {
        intercards: Outputs.intercards,
      },
    },
    // Forecaster announces three weather effects via `NpcYell`, and then applies 3 buffs
    // with 'Forecast'. (There are only 4 possible sequences based on `NpcYell` entries.)
    // Forecaster may also follow with an `NpcYell` message indicating one of the 3 buffs
    // will be swapped to a different effect, and will use 'Climate Change' to apply a new
    // buff indicating the new effect (although the old buff remains active).
    // Again, based on NpcYell entries, however, there are only 4 possible substitutions.
    // So we can get all we need from the initial (and, if present, subsequent) NpcYell message.
    {
      id: 'Hunt The Forecaster Forecast Collect',
      type: 'NpcYell',
      netRegex: { npcNameId: '347D', npcYellId: forecastNpcYellIds },
      run: (data, matches) => {
        const safe = forecastNpcYellMap[matches.npcYellId];
        if (safe === undefined)
          throw new UnreachableCode();
        data.forecastSafe = safe;
      },
    },
    {
      id: 'Hunt The Forecaster Climate Change Collect',
      type: 'NpcYell',
      netRegex: { npcNameId: '347D', npcYellId: climateChangeNpcYellIds },
      run: (data, matches) => {
        const swapMap = climateChangeNpcYellMap[matches.npcYellId];
        if (swapMap === undefined)
          throw new UnreachableCode();
        data.forecastSafe = data.forecastSafe.map((effect) => swapMap[effect] || effect);
      },
    },
    {
      id: 'Hunt The Forecaster Weather Channel',
      type: 'StartsUsing',
      // There are 4 possible cast ids for Weather Channel, and each corresponds to
      // the first attack in the sequence. But due to Climate Change, we can't reliably
      // use the cast id to predict the final sequence, so just trigger on all of them.
      netRegex: { id: weatherChannelCastIds, source: 'The Forecaster', capture: false },
      durationSeconds: 11,
      alertText: (data, _matches, output) => {
        const safe = data.forecastSafe;
        if (safe.length !== 3)
          return;
        return safe.map((spot) => output[spot]!()).join(output.next!());
      },
      run: (data) => data.forecastSafe = [],
      outputStrings: {
        under: Outputs.getUnder,
        out: Outputs.out,
        behind: Outputs.getBehind,
        intercards: Outputs.intercards,
        next: Outputs.next,
      },
    },

    // ****** Boss Fate: Mica the Magical Mu ****** //
    // Aoe (9733 is cast shortly later as the actual aoe)
    {
      id: 'Hunt Mica the Magical Mu Spark of Imagination',
      type: 'StartsUsing',
      netRegex: { id: '9732', source: 'Mica the Magical Mu', capture: false },
      response: Responses.aoe(),
    },
    // tank buster cleave (part of 9730 Shimmerstrike)
    {
      id: 'Hunt Mica the Magical Mu Shimmerstorm Tankbuster',
      type: 'StartsUsing',
      netRegex: { id: '9731', source: 'Mica the Magical Mu', capture: true },
      suppressSeconds: 1,
      response: Responses.tankCleave(),
    },
    // random puddles under people. Shimmerstorm (972F) or Shimmerstrike (9730) spawn them.
    {
      id: 'Hunt Mica the Magical Mu Shimmerstorm',
      type: 'StartsUsing',
      netRegex: { id: '972F', source: 'Mica the Magical Mu', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => {
        return output.avoid!();
      },
      outputStrings: {
        avoid: {
          en: 'Dodge puddles',
        },
      },
    },
    // donut followed by point-blank aoe (972D Twinkling Ring -> 9729 Twinkling Flourish)
    {
      id: 'Hunt Mica the Magical Mu Round of Applause',
      type: 'StartsUsing',
      netRegex: { id: '972B', source: 'Mica the Magical Mu', capture: false },
      response: Responses.getInThenOut(),
    },
    {
      id: 'Hunt Mica the Magical Mu Twinkling Ring',
      type: 'Ability',
      netRegex: { id: '972D', source: 'Mica the Magical Mu', capture: false },
      suppressSeconds: 1,
      response: Responses.getOut(),
    },
    // point-blank aoe followed by donut (972A Twinkling Flourish -> 972C Twinkling Ring)
    {
      id: 'Hunt Mica the Magical Mu Flourishing Bow',
      type: 'StartsUsing',
      netRegex: { id: '9728', source: 'Mica the Magical Mu', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'Hunt Mica the Magical Mu Twinkling Flourish',
      type: 'Ability',
      netRegex: { id: '972A', source: 'Mica the Magical Mu', capture: false },
      suppressSeconds: 1,
      response: Responses.getIn(),
    },
    // protein pizza slices, echo after (9726 6.7s, 9727 4.7s)
    {
      id: 'Hunt Mica the Magical Mu Double Misdirect',
      type: 'StartsUsing',
      netRegex: { id: '9725', source: 'Mica the Magical Mu', capture: false },
      infoText: (_data, _matches, output) => {
        return output.protean!();
      },
      outputStrings: {
        protean: 'Protean x2 (avoid => move into first cleaves)',
      },
    },
    {
      id: 'Hunt Mica the Magical Mu Double Misdirect Move',
      type: 'Ability',
      netRegex: { id: '9727', source: 'Mica the Magical Mu', capture: false },
      suppressSeconds: 1,
      response: Responses.moveAway('alert'),
    },
    // Spawns a formation of 6 cards in various patterns.
    {
      id: 'Hunt Mica the Magical Mu Deal',
      type: 'StartsUsing',
      netRegex: { id: '9709', source: 'Mica the Magical Mu', capture: false },
      run: (data) => {
        data.muDrawnCardIds = [];
        data.muSafeDirections = [];
        data.muCardSpots = [];
        data.muOnCard = 0;
      },
    },
    {
      id: 'Hunt Mica the Magical Mu Card Spawn Collect',
      type: 'CombatantMemory',
      netRegex: {
        id: '4[0-9A-Fa-f]{7}',
        pair: [{ key: 'BNpcID', value: Object.keys(muCardNpcIdMap) }],
        capture: true,
      },
      run: (data, matches) => {
        if (
          matches.pairBNpcID !== undefined &&
          matches.pairPosX !== undefined &&
          matches.pairPosY !== undefined
        ) {
          const x = parseFloat(matches.pairPosX);
          const y = parseFloat(matches.pairPosY);
          const positionIndex = cardPositionToDirection(x, y);
          const number = muCardNpcIdMap[matches.pairBNpcID];
          if (number === undefined)
            throw new UnreachableCode();
          data.muCardSpots[positionIndex] = number;
        }
      },
    },
    // Draws a card for you to memorize for later.
    // Can show 2 or 3 cards. If 2 cards, the card pattern on the floor is [1, 2, 3, 6, 5, 4].
    // If 3 cards, there only 6 draw patterns and can be determined based only on the first cast. There are
    // several floor card patterns, but we do not care.
    {
      id: 'Hunt Mica the Magical Mu Draw (first)',
      type: 'StartsUsing',
      netRegex: {
        id: Object.keys(muCardFirstDrawMap),
        source: 'Mica the Magical Mu',
        capture: true,
      },
      condition: (data) => data.muDrawnCardIds.length === 0,
      preRun: (data) => {
        if (data.muCardSpots.length === 6) {
          const [card1, card2, card3] = data.muCardSpots;
          data.muCardPattern = (card1 === 1 && card2 === 2 && card3 === 3) ? 'two' : 'three';
        } else {
          data.muCardPattern = null;
        }
      },
      durationSeconds: (data) => data.muCardPattern ? 21 : 24,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = cardOutputStrings;
        data.muDrawnCardIds.push(matches.id);

        if (data.muCardPattern === 'two') {
          const cardValue = muCardFirstDrawMap[matches.id];
          if (cardValue !== undefined) {
            const cardPosIndex = data.muCardSpots.indexOf(cardValue);
            const twoCardSafeSpot = CardSafeDirectionCol[cardPosIndex];

            if (twoCardSafeSpot !== undefined) {
              data.muSafeDirections.push(twoCardSafeSpot);
              return {
                alertText: output.start!({ dir: output[twoCardSafeSpot]!() }),
              };
            }
          }
        } else if (data.muCardPattern === 'three') {
          // three card pattern
          const safeSpots = muThreeCardPatternMap[matches.id];
          if (safeSpots === undefined)
            throw new UnreachableCode();
          data.muSafeDirections = safeSpots;
          return {
            alertText: output.start!({ dir: output[safeSpots[0]]!() }),
            infoText: safeSpots.map((dir) => output[dir]!()).join(output.next!()),
          };
        }
      },
    },
    {
      id: 'Hunt Mica the Magical Mu Draw',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(muCardDrawMap), source: 'Mica the Magical Mu', capture: true },
      durationSeconds: 12,
      infoText: (data, matches, output) => {
        if (data.muDrawnCardIds.length === 0)
          return;
        data.muDrawnCardIds.push(matches.id);
        const cardValue = muCardDrawMap[matches.id];
        if (cardValue === undefined)
          throw new UnreachableCode();
        const cardPosIndex = data.muCardSpots.indexOf(cardValue);
        const twoCardSafeSpot = CardSafeDirectionCol[cardPosIndex];

        if (data.muCardPattern === 'two') {
          if (twoCardSafeSpot !== undefined)
            data.muSafeDirections.push(twoCardSafeSpot);
          if (data.muDrawnCardIds.length === 2)
            return data.muSafeDirections.map((dir) => output[dir]!()).join(output.next!());
        }
      },
      outputStrings: cardOutputStrings,
    },
    // Detonates all but the correct card, need to be in the right spot by cast end. (9717 to do the damage)
    {
      id: 'Hunt Mica the Magical Mu Card Trick',
      type: 'Ability',
      netRegex: { id: '9716', source: 'Mica the Magical Mu', capture: false },
      durationSeconds: 7,
      alertText: (data, _matches, output) => {
        const step = data.muSafeDirections[++data.muOnCard];
        if (step !== undefined) {
          return output[step]!();
        }
      },
      outputStrings: cardOutputStrings,
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Cat\'s Eye': 'Katzenauge',
        'Sally the Sweeper': 'Sally (?:der|die|das) Fegerin',
        'The Forecaster': 'Wetterreporter',
        // 'Mica the Magical Mu': 'Mica (?:der|die|das) Magisch[rs] Mu',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Cat\'s Eye': 'Œil-de-chat',
        'Sally the Sweeper': 'Sally la balayeuse',
        'The Forecaster': 'Monsieur météo',
        'Mica the Magical Mu': 'Mica le mu',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Cat\'s Eye': 'キャッツアイ',
        'Sally the Sweeper': 'サリー・ザ・スイーパー',
        'The Forecaster': 'ウェザーリポーター',
        'Mica the Magical Mu': 'マイカ・ザ・ムー',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Cat\'s Eye': '猫眼',
        'Sally the Sweeper': '清除者萨利',
        'The Forecaster': '天气预报机器人',
        'Mica the Magical Mu': '亩鼠米卡',
      },
    },
  ],
};

export default triggerSet;
