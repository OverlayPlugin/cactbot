import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Possibly add combo outputs for Vorpal/Double-Edged & Burst/Double-Edged?

const syncPlatforms = ['northwest', 'northeast', 'southwest', 'southeast'] as const;
type Platform = typeof syncPlatforms[number] | 'none';

const tileNames = [
  'northCorner',
  'northwestNorth',
  'northeastNorth',
  'northwestWest',
  'insideNorth',
  'northeastEast',
  'westCorner',
  'insideWest',
  'insideEast',
  'eastCorner',
  'southwestWest',
  'insideSouth',
  'southeastEast',
  'southwestSouth',
  'southeastSouth',
  'southCorner',
] as const;

type TileName = typeof tileNames[number] | 'unknown';
type TileMap = { [y: number]: { [x: number]: TileName } };

const syncTilesMap: TileMap = {
  // y1: { x1: tileName, x2: tileName, etc. }
  // Use rounded ints for all positions to avoid fuzzy floating point values on StartsUsing lines
  89: { 100: 'northCorner' },
  93: {
    96: 'northwestNorth',
    104: 'northeastNorth',
  },
  96: {
    93: 'northwestWest',
    100: 'insideNorth',
    107: 'northeastEast',
  },
  100: {
    89: 'westCorner',
    96: 'insideWest',
    104: 'insideEast',
    111: 'eastCorner',
  },
  104: {
    93: 'southwestWest',
    100: 'insideSouth',
    107: 'southeastEast',
  },
  107: {
    96: 'southwestSouth',
    104: 'southeastSouth',
  },
  111: { 100: 'southCorner' },
};

type MappedTile = {
  tile: TileName;
  from: Platform;
};
const findClosestTile: (
  x: number,
  y: number,
  isMirror: boolean,
  isForgedTrack: boolean,
) => MappedTile = (x, y, isMirror, isForgedTrack) => {
  const ret: MappedTile = {
    tile: 'unknown',
    from: 'none',
  };

  // Tiles are 5x5; mirror plat tiles are offset by 3 tiles from their main platform counterpart
  // During Forged Track, Fang actors are positioned at the back edge, so we need a slightly
  // larger adjustment value.
  const adjustValue = isForgedTrack
    ? 22.98 // sqrt(5^2 + 5^2) * 3.25
    : 21.21; // sqrt(5^2 + 5^2) * 3

  if (isMirror) {
    if (x < 100 && y < 100) { // NW mirror platform
      x += adjustValue;
      y += adjustValue;
      ret.from = 'northwest';
    } else if (x < 100) { // SW mirror platform
      x += adjustValue;
      y -= adjustValue;
      ret.from = 'southwest';
    } else if (y < 100) { // NE mirror platform
      x -= adjustValue;
      y += adjustValue;
      ret.from = 'northeast';
    } else { // SE mirror platform
      x -= adjustValue;
      y -= adjustValue;
      ret.from = 'southeast';
    }
  }

  const tileValues = Object.keys(syncTilesMap).map(Number);
  const closestX = tileValues.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
  const closestY = tileValues.reduce((a, b) => Math.abs(b - y) < Math.abs(a - y) ? b : a);

  const possibleTiles = syncTilesMap[closestY];
  if (possibleTiles === undefined) {
    return ret;
  }
  const closestTile = possibleTiles[closestX];
  if (closestTile === undefined) {
    return ret;
  }
  ret.tile = closestTile;
  return ret;
};

// Forged Track:
// * In normal mode, the forged tracks always have the same pattern.
//     - The NW/SE platforms have "wide XX" tethers (row 1->3, row 2->4, row 3->1, row 4->2)
//     - The NE/SW platforms have "small XX" tethers (row 1->2, row 2->1, row 3->4, row 4->3)
// * Forged Track initially fires from one platform, but later instances fire from multiple
//   platforms simultaneously.
// * There are multiple safe tiles each time, but calling multiple tiles will be confusing
//   to the player, as we have to use directions + modifiers to properly identify each tile.
//   To simplify this, because at least one of the inner four cardinal tiles is always safe,
//   just call that. (PRs/user config options welcome!)

// To determine the safe inner tile(s), given the fixed track patterns, we only care about swords
// on corner tiles of mirror platforms (as they are the only ones that can cleave the inner 4 tiles).
// If we know the sword platform and the corner the sword is placed in, we can map that through the
// track patterns to specific inner tiles that are no longer safe.
const cornerTiles = ['northCorner', 'eastCorner', 'southCorner', 'westCorner'] as const;
type CornerTile = typeof cornerTiles[number];
const isCornerTile = (t: TileName): t is CornerTile => cornerTiles.includes(t as CornerTile);

// insideTiles: array order matters - lower idx values will be called first if safe
const insideTiles = ['insideNorth', 'insideSouth', 'insideEast', 'insideWest'] as const;
type InsideTile = typeof insideTiles[number];

const forgedTrackCleaveMap: {
  [K in Exclude<Platform, 'none'>]: Partial<Record<CornerTile, InsideTile[]>>;
} = {
  'northeast': { // small XX
    'northCorner': ['insideNorth', 'insideWest'],
    'eastCorner': ['insideEast', 'insideSouth'],
  },
  'southeast': { // wide XX
    'eastCorner': ['insideSouth', 'insideWest'],
    'southCorner': ['insideNorth', 'insideEast'],
  },
  'southwest': { // small XX
    'southCorner': ['insideSouth', 'insideEast'],
    'westCorner': ['insideWest', 'insideNorth'],
  },
  'northwest': { // wide XX
    'westCorner': ['insideNorth', 'insideEast'],
    'northCorner': ['insideWest', 'insideSouth'],
  },
};

export interface Data extends RaidbossData {
  bitterReapingTargets: string[];
  seenFirstSync: boolean; // all future Chasm of Vollok swords are on mirror platforms
  unsafeTiles: MappedTile[];
  halfCircuitSafeSide?: 'left' | 'right';
}

const triggerSet: TriggerSet<Data> = {
  id: 'Everkeep',
  zoneId: ZoneId.Everkeep,
  timelineFile: 'zoraal-ja.txt',
  initData: () => ({
    bitterReapingTargets: [],
    seenFirstSync: false,
    chasmOfVollokCount: 0,
    unsafeTiles: [],
  }),
  triggers: [
    // ********** PHASE 1 ********** //
    {
      id: 'ZoraalJa Soul Overflow',
      type: 'StartsUsing',
      netRegex: { id: '934B', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'ZoraalJa Calamity\'s Edge',
      type: 'StartsUsing',
      netRegex: { id: '934C', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'ZoraalJa Patricidal Pique',
      type: 'StartsUsing',
      netRegex: { id: '9353', source: 'Zoraal Ja' },
      response: Responses.tankBuster(),
    },
    {
      // Two invisible actors both use same cast id; we can determine order
      // based on heading of the first actor to cast.
      id: 'ZoraalJa Double-Edged Swords',
      type: 'StartsUsingExtra',
      netRegex: { id: '9352' },
      durationSeconds: 7.3,
      suppressSeconds: 4,
      alertText: (_data, matches, output) => {
        const hdgNum = Directions.hdgTo4DirNum(parseFloat(matches.heading));
        return hdgNum === 0 ? output.backThenFront!() : output.frontThenBack!();
      },
      outputStrings: {
        frontThenBack: Outputs.frontThenBack,
        backThenFront: Outputs.backThenFront,
      },
    },
    {
      id: 'ZoraalJa Shadow Burst',
      type: 'StartsUsing',
      netRegex: { id: '934D', source: 'Shadow of Tural', capture: false },
      delaySeconds: 3,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.away!(),
      outputStrings: {
        away: {
          en: 'Away from adds',
          fr: 'Éloignez-vous des adds',
          cn: '远离小怪',
        },
      },
    },
    {
      id: 'ZoraalJa Vorpal Trail First',
      type: 'StartsUsing',
      netRegex: { id: '934E', source: 'Zoraal Ja', capture: false },
      durationSeconds: 9.5,
      infoText: (_data, _matches, output) => output.dodgeCombo!(),
      outputStrings: {
        dodgeCombo: {
          en: 'Dodge contracting swords (front/back combo after)',
          fr: 'Esquivez les épées combattantes (combo avant/arrière ensuite)',
          cn: '躲避向内步进 AOE (然后前后刀)',
        },
      },
    },
    {
      id: 'ZoraalJa Vorpal Trail Subsequent',
      type: 'StartsUsing',
      netRegex: { id: '934E', source: 'Zoraal Ja', capture: false },
      delaySeconds: 11.5, // use the original cast + delay
      durationSeconds: 9.5,
      infoText: (_data, _matches, output) => output.dodge!(),
      outputStrings: {
        dodge: {
          en: 'Dodge expanding swords',
          fr: 'Évitez les épées en expansion',
          cn: '躲避向外步进 AOE',
        },
      },
    },

    // ********** PHASE 2 ********** //
    {
      id: 'ZoraalJa Soul Overflow Phase Transition',
      type: 'StartsUsing',
      netRegex: { id: '9370', source: 'Zoraal Ja', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'ZoraalJa Dawn of an Age',
      type: 'StartsUsing',
      netRegex: { id: '9354', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'ZoraalJa Actualize',
      type: 'StartsUsing',
      netRegex: { id: '9356', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'ZoraalJa Smiting Circuit Outside',
      type: 'StartsUsing',
      netRegex: { id: '9366', source: 'Zoraal Ja', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'ZoraalJa Smiting Circuit Inside',
      type: 'StartsUsing',
      netRegex: { id: '9367', source: 'Zoraal Ja', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'ZoraalJa Bitter Reaping Collect',
      type: 'StartsUsing',
      netRegex: { id: '937A', source: 'Zoraal Ja' },
      run: (data, matches) => data.bitterReapingTargets.push(matches.target),
    },
    {
      id: 'ZoraalJa Bitter Reaping',
      type: 'StartsUsing',
      netRegex: { id: '937A', source: 'Zoraal Ja', capture: false },
      delaySeconds: 0.2,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.bitterReapingTargets.includes(data.me))
          return output.busterOnYou!();
        const players = data.bitterReapingTargets.map((x) => data.party.member(x).nick).join(
          output.and!(),
        );
        return output.busters!({ player: players });
      },
      run: (data) => data.bitterReapingTargets = [],
      outputStrings: {
        busterOnYou: Outputs.tankBusterOnYou,
        busters: Outputs.tankBusterOnPlayer,
        and: Outputs.and,
      },
    },
    {
      id: 'ZoraalJa Sync Tracker',
      type: 'StartsUsing',
      netRegex: { id: '9359', source: 'Zoraal Ja', capture: false },
      run: (data) => data.seenFirstSync = true,
    },
    {
      id: 'ZoraalJa Chasm of Vollok Sword Collect',
      type: 'StartsUsing',
      netRegex: { id: '9358', source: 'Fang' },
      run: (data, matches) => {
        const swordX = parseFloat(matches.x);
        const swordY = parseFloat(matches.y);
        const mappedTile = findClosestTile(swordX, swordY, data.seenFirstSync, false);
        if (mappedTile.tile === 'unknown')
          return;
        data.unsafeTiles.push(mappedTile);
      },
    },
    {
      id: 'ZoraalJa Chasm of Vollok',
      type: 'StartsUsing',
      netRegex: { id: '9358', source: 'Fang', capture: false },
      delaySeconds: 0.2,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const unsafeTiles = data.unsafeTiles.map((t) => t.tile);
        const safeCorner = cornerTiles.filter((tile) => !unsafeTiles.includes(tile));
        if (safeCorner.length !== 1)
          return;

        const safe0 = safeCorner[0] ?? 'unknown';
        return output[safe0]!();
      },
      run: (data) => data.unsafeTiles = [],
      outputStrings: {
        northCorner: Outputs.north,
        eastCorner: Outputs.east,
        southCorner: Outputs.south,
        westCorner: Outputs.west,
        unknown: {
          en: 'Avoid swords',
          fr: 'Évitez les épées',
          cn: '躲避剑',
        },
      },
    },
    {
      id: 'ZoraalJa Forged Track Sword Collect',
      type: 'StartsUsing',
      netRegex: { id: '9361', source: 'Fang' },
      run: (data, matches) => {
        const swordX = parseFloat(matches.x);
        const swordY = parseFloat(matches.y);
        const mappedTile = findClosestTile(swordX, swordY, true, true);
        if (mappedTile.tile === 'unknown')
          return;
        data.unsafeTiles.push(mappedTile);
      },
    },
    {
      id: 'ZoraalJa Forged Track',
      type: 'StartsUsing',
      netRegex: { id: '9361', source: 'Fang', capture: false },
      delaySeconds: 2, // small delay to prevent overlapping calls when these happen in seq
      durationSeconds: 10.5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        let possibleSafeTiles = [...insideTiles];
        data.unsafeTiles.forEach((t) => {
          const platform = t.from;
          const tile = t.tile;
          if (platform === 'none' || !isCornerTile(tile))
            return;

          const unsafeTiles = forgedTrackCleaveMap[platform][tile] ?? [];
          possibleSafeTiles = possibleSafeTiles.filter((t) => !unsafeTiles.includes(t));
        });

        if (possibleSafeTiles.length > 2) {
          console.error(`Unexpected excess safe tiles: ${possibleSafeTiles.join(',')}`);
          return output.unknown!();
        }
        // There are 2 safe tiles when only 1 platform is firing; when 2 platforms are firing,
        // only 1 inside tile is safe.  In either case, call the first safe tile in the array
        // (using array order to prioritize).
        const safe0 = possibleSafeTiles[0] ?? 'unknown';
        if (safe0 === 'unknown')
          console.error(`Could not determine safe tile - no remaining safe tiles found`);

        return output[safe0]!();
      },
      run: (data) => data.unsafeTiles = [],
      outputStrings: {
        insideNorth: {
          en: 'Inner North Diamond',
          fr: 'Diamand nord intérieur',
          cn: '上北内侧方格',
        },
        insideEast: {
          en: 'Inner East Diamond',
          fr: 'Diamand est intérieur',
          cn: '右东内侧方格',
        },
        insideSouth: {
          en: 'Inner South Diamond',
          fr: 'Diamand sud intérieur',
          cn: '下南内侧方格',
        },
        insideWest: {
          en: 'Inner West Diamond',
          fr: 'Diamand est intérieur',
          cn: '左西内侧方格',
        },
        unknown: {
          en: 'Avoid Line Cleaves',
          fr: 'Évitez les cleaves en ligne',
          cn: '躲避直线剑击',
        },
      },
    },
    {
      id: 'ZoraalJa Duty\'s Edge',
      type: 'Ability',
      // 9374 is the self-targeted ability; 8A#F is the player-targeeted stack marker (no 0x14 line though)
      netRegex: { id: '8AEF', source: 'Zoraal Ja' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'ZoraalJa Half Full Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '9368', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.left!(),
      outputStrings: {
        left: Outputs.left,
      },
    },
    {
      id: 'ZoraalJa Half Full Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '9369', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.right!(),
      outputStrings: {
        right: Outputs.right,
      },
    },
    {
      id: 'ZoraalJa Half Circuit Left/Right Collect',
      type: 'StartsUsing',
      // 936B - Right Sword (left safe)
      // 936C - Left Sword (right safe)
      netRegex: { id: ['936B', '936C'], source: 'Zoraal Ja' },
      run: (data, matches) => data.halfCircuitSafeSide = matches.id === '936B' ? 'left' : 'right',
    },
    {
      id: 'ZoraalJa Half Circuit',
      type: 'StartsUsing',
      // 936E - Swords Out (in safe)
      // 936F - Swords In (out safe)
      netRegex: { id: ['936E', '936F'], source: 'Zoraal Ja' },
      delaySeconds: 0.3, // let Left/Right Collect run first
      alertText: (data, matches, output) => {
        const inOut = matches.id === '936E' ? output.in!() : output.out!();
        if (data.halfCircuitSafeSide === undefined)
          return inOut;
        return output.combo!({ inOut: inOut, side: output[data.halfCircuitSafeSide]!() });
      },
      outputStrings: {
        left: {
          en: 'Boss\'s Left',
          de: 'Links vom Boss',
          fr: 'À gauche du boss',
          ja: 'ボスの左側',
          cn: 'BOSS左侧',
          ko: '보스 왼쪽',
        },
        right: {
          en: 'Boss\'s Right',
          de: 'Rechts vom Boss',
          fr: 'À droite du boss',
          ja: 'ボスの右側',
          cn: 'BOSS右侧',
          ko: '보스 오른쪽',
        },
        in: Outputs.getUnder,
        out: Outputs.out,
        combo: {
          en: '${inOut} + ${side}',
          de: '${inOut} + ${side}',
          fr: '${inOut} + ${side}',
          ja: '${inOut} + ${side}',
          cn: '${inOut} + ${side}',
          ko: '${inOut} + ${side}',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Fang': 'Reißzahn',
        'Zoraal Ja': 'Zoraal Ja',
      },
      'replaceText': {
        'Actualize': 'Verwirklichung',
        'Blade Warp': 'Klingensprung',
        'Chasm of Vollok': 'Klippe von Vollok',
        'Dawn of an Age': 'Dämmerung eines Zeitalters',
        'Duty\'s Edge': 'Pflichtes Schneide',
        'Forged Track': 'Unbestimmter Pfad',
        'Half Circuit': 'Halbe Runde',
        'Half Full': 'Halbes Ganzes',
        'Sync(?![-h])': 'Synchro',
        '(?<! )Vollok': 'Vollok',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Fang': 'crochet',
        'Zoraal Ja': 'Zoraal Ja',
      },
      'replaceText': {
        'Actualize': 'Actualisation',
        'Blade Warp': 'Invocation incisive',
        'Chasm of Vollok': 'Trappe de Vollok',
        'Dawn of an Age': 'Âge de l\'aurore',
        'Duty\'s Edge': 'Devoir d\'acier',
        'Forged Track': 'Traque incisive',
        'Half Circuit': 'Demi-circuit',
        'Half Full': 'Demi-plénitude',
        'Sync(?![-h])': 'Synchronisation',
        '(?<! )Vollok': 'Vollok',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Fang': '双牙剣',
        'Zoraal Ja': 'ゾラージャ',
      },
      'replaceText': {
        'Actualize': 'アクチュアライズ',
        'Blade Warp': 'サモンエッジ',
        'Chasm of Vollok': 'ピット・オブ・ヴォロク',
        'Dawn of an Age': 'ドーン・エイジ',
        'Duty\'s Edge': 'デューティエッジ',
        'Forged Track': 'エッジトラック',
        'Half Circuit': 'ルーズハーフ・サーキット',
        'Half Full': 'ルーズハーフ',
        'Sync(?![-h])': 'シンクロナス',
        '(?<! )Vollok': 'エッジ・ザ・ヴォロク',
      },
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {
        'Fang': '双牙剑',
        'Zoraal Ja': '佐拉加',
      },
      'replaceText': {
        'Actualize': '自我实现',
        'Blade Warp': '利刃召唤',
        'Chasm of Vollok': '无敌裂斩',
        'Dawn of an Age': '新曦世纪',
        'Duty\'s Edge': '责任之刃',
        'Forged Track': '利刃冲',
        'Half Circuit': '回旋半身残',
        'Half Full': '半身残',
        'Sync(?![-h])': '同步',
        '(?<! )Vollok': '无敌刃',
      },
    },
  ],
};

export default triggerSet;
