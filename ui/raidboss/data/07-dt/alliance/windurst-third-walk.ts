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
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// TODO: Math out the locations + safespots for Promathia intermission
// TODO: Math out the patterns for Hollow King's Atomic Ray

const headMarkerData = {
  // Common to Shantotto and Hollow King
  // VFX: com_share4a1
  'finalExamSuperNova': '0131', // 3-hit stack

  // SHANTOTTO
  // VFX: m0926trg_t0a1
  'vidohunir': '023A', // Shared buster
  // VFX: target_ae_5m_s5_0k2
  'thunderAndError': '022E', // Spread circles
  // VFX: com_share3_6s0p
  'stardustSpecimen': '013E', // Single-hit stack

  // TRASH: LAMIA AND FRIENDS
  // VFX: tank_lockonae_13m_7s_01w
  'pinningShot': '01F2', // Giant circle buster, Lamia No.2 trash

  // ALEXANDER RESURRECTED
  // VFX: target_ae_shine_s5x
  'banishga': '00D7', // Spread circles
  // VFX: tank_laser_5sec_lockon_c0a1
  'divineBolt': '01D7', // Laser buster
  // VFX: com_share6m7s_1v
  'megaHoly': '024E', // 3-hit stack

  // MINI-BOSS: AW'ERN & THE AW'ZDEI
  // VFX: target_ae_s5f
  'auroralWind': '008B',

  // PROMATHIA
  // VFX: loc06sp_05ak1
  'meteor': '01D2', // Standard spread circles

  // Common to Promathia and Shinryu
  // VFX: tank_lockonae_6m_5s_01t
  'cometDarkNova': '0158', // Circle buster, on 3 tanks, or top threat if one is dead

  // SHINRYU PARADOX/HOLLOW KING
  // VFX: z6r3_b4_lock_no_lk_7s_c0k2
  'lookAway': '02A8', // Slashed-circle eye icon
  // VFX: z6r3_b4_lock_lk_7s_c0k2
  'lookTowards': '02A9', // Question mark circle eye icon
  // VFX: z6r3_b4_lock_no_mv_7s_c0k2
  'stillness': '02AA', // Pause button icon
  // VFX: z6r3_b4_lock_mv_7s_c0k2
  'motion': '02AB', // Play button icon
} as const;

const alexCWHeadMarkerData = [
  '02B3', // VFX: m1002_north01_c0g
  '02B4', // VFX: m1002_south01_c0g
  '02B5', // VFX: m1002_east01_c0g
  '02B6', // VFX: m1002_west01_c0g
] as const;

const alexCCWHeadMarkerData = [
  '02B7', // VFX: m1002_north02_c0g
  '02B8', // VFX: m1002_south02_c0g
  '02B9', // VFX: m1002_east02_c0g
  '02BA', // VFX: m1002_west02_c0g
] as const;

// Superior Stone always has a 1-2-1-3 pattern
// on the north or south side of the arena,
// while the other can variously be 3-2-2-1 or 1-2-3-1.

// Four 257 MapEffect flags are used for the mechanic.
// 00020001 telegraphs visuals for the shapes.
// 00200010 generates the actual structures.
// 00800040 telegraph visuals for the upcoming "slam shut".
// 00080004 arena returns to normal.

// Four 257 MapEffect locations have been observed.
// Each seems to correspond to a specific 1-2-1-3 pattern north or south.
// 3F and 41 seem to be used for the first and subsequent sets
// of Superior Stone uses, or 40 and 42 seem to.

// Pattern 1
// |00020001|3F|
// |00200010|3F|
// |00800040|3F|
// |00080004|3F|

// |    ___|
// |  _|
// |_|
//        _
//    _  | |
//  _| |_| |
// |       |

// Pattern 2
// |00020001|41|
// |00200010|41|
// |00800040|41|
// |00080004|41|

// |_   _  |
//   |_| | |
//       |_|
//      _
//    _| |
//  _|   |_
// |       |

// Pattern 3
// |00020001|40|
// |00200010|40|
// |00800040|40|
// |00080004|40|

// |  _   _|
// | | |_|
// |_|    _
//      _| |
//  ___|   |
// |       |

// Pattern 4
// |00020001|42|
// |00200010|42|
// |00800040|42|
// |00080004|42|

// |_     _|
//   |  _|
//   |_|
//  _
// | |  _
// | |_| |_
// |       |

const shantottoStoneSafe: Record<string, { prox: 'close' | 'far'; dir: DirectionOutputCardinal }> =
  {
    '3E': { prox: 'close', dir: 'dirE' },
    '40': { prox: 'close', dir: 'dirW' },
    '41': { prox: 'far', dir: 'dirW' },
    '42': { prox: 'far', dir: 'dirE' },
  } as const;

// const alexanderCenter = {
//   x: 0,
//   y: 360,
// } as const;

// The arena for Alexander Resurrected is a square subdivided
// into four smaller squares. Divine Spear creates a right-angle isoceles
// triangle that denies one half of the square it spawns on.
// The actors that cast each triangle are located at the right angle,
// and there will always be either two at the center and two at the edges,
// or zero at the center and four at the edges.
// The actors face toward the area they are denying.

type nonCombatEntity = {
  x: number;
  y: number;
  heading: number;
};

// Radiant Sacrament MapEffect tile map:
// 14 19 1E 23 28
// 15 1A 1F 24 29
// 16 1B 20 25 2A
// 17 1C 21 26 2B
// 18 1D 22 27 2C

// This list is non-exhaustive.
// Sacrament is always a 3-2 or 2-3 pattern of propagating lines,
// so by checking an odd and an even tile on each side,
// we know how the entire mechanic will resolve.
// const sacramentEffectMap = {
//   '19': {
//     'location': '19',
//     'direction': 'NNW',
//   },
//   '1E': {
//     'location': '1E',
//     'direction': 'N',
//   },
//   '29': {
//     'location': '29',
//     'direction': 'ENE',
//   },
//   '2A': {
//     'location': '2A',
//     'direction': 'E',
//   },
//   '27': {
//     'location': '27',
//     'direction': 'SSE',
//   },
//   '22': {
//     'location': '22',
//     'direction': 'S',
//   },
//   '17': {
//     'location': '17',
//     'direction': 'WSW',
//   },
//   '16': {
//     'location': '16',
//     'direction': 'W',
//   },
// } as const;

const cardDirToOutputStrings = {
  dirN: Outputs.north,
  dirE: Outputs.east,
  dirS: Outputs.south,
  dirW: Outputs.west,
} as const;

// These values are rounded, not exact.
const promathiaPuddleMap = [
  { loc: 'dirS', x: -820, y: -805 },
  { loc: 'dirSW', x: -833, y: -813 },
  { loc: 'dirSE', x: -807, y: -813 },
  { loc: 'dirNW', x: -833, y: -828 },
  { loc: 'dirNE', x: -807, y: -828 },
  { loc: 'dirN', x: -820, y: -835 },
] as const;

const promathiaExplosionOutputStrings: OutputStrings = {
  combo: {
    en: '${dir1} / ${dir2}',
    de: '${dir1} / ${dir2}',
    fr: '${dir1} / ${dir2}',
    ja: '${dir1} / ${dir2}',
    cn: '${dir1} / ${dir2}',
    ko: '${dir1} / ${dir2}',
    tc: '${dir1} / ${dir2}',
  },

  // For situations where we will call a single direction,
  // or a pair of cardinals, call the full names,
  // as "Northeast" or "North/South".
  // For pairs of intercardinals, call shortened names,
  // as "NE/SW".
  ...cardDirToOutputStrings,
  ...Directions.outputStringsIntercardDir,
  northeast: Outputs.northeast,
  southeast: Outputs.southeast,
  avoidExplosions: {
    en: ' Avoid Puddle Explosions',
    cn: ' 躲避爆炸圈圈',
  },
} as const;

// Return combatant's platform by number.
// Using raw values here to attempt to minimize sign mistakes.
const getPlatform = (x: number, y: number): number => {
  // South platform, center (-820, -807)
  if (y > -818)
    return 0;
  // NW platform, center (-831.26, -826.5)
  if (x < -820 && y < -818)
    return 1;
  // NE platform, center (-808.74, -826.5)
  if (x > -820 && y < -818)
    return 2;
  return -1;
};

const getEvenExplosionSafe = (
  explosionDirs: DirectionOutput8[],
): DirectionOutput8[] => {
  if (explosionDirs?.includes('unknown'))
    return ['unknown'];

  if (explosionDirs.length === 4) {
    const allDirs: DirectionOutput8[] = ['dirN', 'dirNE', 'dirSE', 'dirS', 'dirSW', 'dirNW'];
    return allDirs.filter((dir) => !explosionDirs.includes(dir));
  }

  if (explosionDirs.includes('dirN') || explosionDirs.includes('dirS'))
    return ['dirE', 'dirW'];
  if (explosionDirs.includes('dirE') || explosionDirs.includes('dirW'))
    return ['dirN', 'dirS'];
  if (explosionDirs.includes('dirNE') || explosionDirs.includes('dirSW'))
    return ['dirNW', 'dirSE'];
  if (explosionDirs.includes('dirSE') || explosionDirs.includes('dirNW'))
    return ['dirSW', 'dirNE'];
  return ['unknown'];
};

export interface Data extends RaidbossData {
  leyCollectionActive: boolean;
  seenFirstBlizzard: boolean;
  fireCount: number;
  leyLocations: { [id: string]: nonCombatEntity };
  fireLocations: DirectionOutputCardinal[];
  spearEntities: nonCombatEntity[];
  penanceActive: boolean;
  cometTargets: string[];
  wheelBastionActive: boolean;
  seenPromathiaIntermission: boolean;
  myPlatformNum: number;
  thinkerPlatformNum?: number;
  wandererPlatformNum?: number;
  weeperPlatformNum?: number;
  earthboundHeavenActive: boolean;
  explosionLocs: DirectionOutput8[];
  multiExplosionCounter: number;
  blessingSafe: 'inactive' | 'left' | 'right';
  fourthBossActive: boolean;
  myAspect?: 'light' | 'dark';
  tookTrailTower: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Windurst: The Third Walk',
  zoneId: ZoneId.WindurstTheThirdWalk,
  timelineFile: 'windurst-third-walk.txt',
  initData: () => {
    return {
      leyCollectionActive: false,
      seenFirstBlizzard: false,
      fireCount: 0,
      leyLocations: {},
      fireLocations: [],
      spearEntities: [],
      penanceActive: false,
      cometTargets: [],
      wheelBastionActive: false,
      seenPromathiaIntermission: false,
      myPlatformNum: -1,
      earthboundHeavenActive: false,
      explosionLocs: [],
      multiExplosionCounter: 0,
      blessingSafe: 'inactive',
      fourthBossActive: false,
      tookTrailTower: false,
    };
  },
  triggers: [
    // ------------------------------------------------------------------------
    // Shantotto the Demon
    // ------------------------------------------------------------------------
    {
      id: 'Windurst Third Walk Shantotto Flare Play',
      type: 'StartsUsing',
      netRegex: { id: 'C427', source: 'Shantotto The Demon', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Shantotto Vidohunir',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['vidohunir'], capture: true },
      response: Responses.tankCleave(),
    },
    {
      id: 'Windurst Third Walk Shantotto Empirical Research',
      type: 'StartsUsing',
      netRegex: { id: 'C41E', source: 'Shantotto The Demon', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Windurst Third Walk Shantotto Superior Stone AOE',
      type: 'StartsUsing',
      netRegex: { id: 'C411', source: 'Shantotto The Demon', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Shantotto Superior Stone Crusher',
      type: 'MapEffect',
      netRegex: { flags: '00800040', location: Object.keys(shantottoStoneSafe), capture: true },
      durationSeconds: 7, // It's a long cast, so ensure it stays up a little longer.
      alertText: (_data, matches, output) => {
        const prox = shantottoStoneSafe[matches.location]?.prox;
        const dir = shantottoStoneSafe[matches.location]?.dir;
        if (prox === undefined || dir === undefined || dir === 'unknown')
          return output.unknown!();
        return output.combo!({ dir: output[dir]!(), prox: output[prox]!() });
      },
      outputStrings: {
        combo: {
          en: '${dir} + ${prox}',
          cn: '${dir} + ${prox}',
        },
        ...cardDirToOutputStrings,
        close: {
          en: 'Get close',
          cn: '靠近',
        },
        far: {
          en: 'Get far',
          cn: '远离',
        },
        unknown: {
          en: 'Avoid rock crusher',
          cn: '躲避岩石挤压',
        },
      },
    },
    {
      // Collecting data based on 271 ActorSetPos lines
      // could be intensive.
      // Only collect during Diagrammatic Doorway windows.
      id: 'Windurst Third Walk Shantotto Entity Collection Activate',
      type: 'StartsUsing',
      netRegex: { id: 'C418', source: 'Shantotto The Demon', capture: false },
      run: (data) => data.leyCollectionActive = true,
    },
    {
      id: 'Windurst Third Walk Shantotto Ley Line Entity Collect',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      condition: (data) => data.leyCollectionActive,
      run: (data, matches) =>
        data.leyLocations[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      // Shantotto will move to one of the two center Ley Lines,
      // or to one of the corners, then telegraph
      // a series of purple 0180 tethers between puddles
      // where she will use Circumscribed Fire.
      id: 'Windurst Third Walk Shantotto Ley Line Store',
      type: 'Tether',
      netRegex: { id: ['017F', '0180'], capture: true },
      run: (data, matches) => {
        const sEntity = data.leyLocations[matches.sourceId];
        const tEntity = data.leyLocations[matches.targetId];
        if (sEntity === undefined || tEntity === undefined) {
          console.error('Unable to find ley line entities');
          return;
        }
        const sourceX = sEntity.x;
        const sourceY = sEntity.y;
        const destX = tEntity.x;
        const destY = tEntity.y;

        // Use the source location as the center for finding the destination.
        const fireDir = Directions.xyToCardinalDirOutput(destX, destY, sourceX, sourceY);
        data.fireLocations.push(fireDir);
      },
    },
    {
      id: 'Windurst Third Walk Shantotto Circumscribed Fire Counter',
      type: 'StartsUsing',
      netRegex: { id: ['C419', 'C41A'], source: 'Shantotto The Demon', capture: false },
      run: (data) => data.fireCount += 1,
    },
    {
      id: 'Windurst Third Walk Shantotto Circumscribed Fire Initial Call',
      type: 'StartsUsing',
      netRegex: { id: 'C419', source: 'Shantotto The Demon', capture: false },
      response: Responses.getUnder(),
    },
    {
      id: 'Windurst Third Walk Shantotto Circumscribed Fire Subsequent Call',
      type: 'Ability',
      netRegex: { id: ['C419', 'C41A'], source: 'Shantotto The Demon', capture: false },
      condition: (data) => {
        if (data.seenFirstBlizzard)
          return data.fireCount < 6;
        return data.fireCount < 4;
      },
      suppressSeconds: 1, // This can hit multiple people.
      infoText: (data, _matches, output) => {
        const nextDir = data.fireLocations.shift();
        if (nextDir === undefined)
          return output.unknown!();
        return output.combo!({ dir: output[nextDir]!(), under: output.under!() });
      },
      outputStrings: {
        combo: {
          en: 'Move ${dir} + ${under}',
          cn: '去${dir} + ${under}',
        },
        under: Outputs.getUnder,
        unknown: {
          en: 'Move to next circle',
          cn: '去下一个圈圈',
        },
        ...cardDirToOutputStrings,
      },
    },
    {
      // The actual castbar for Localized Blizzard C41B is too short for trigger usage.
      // Instead, count Circumscribed Fire uses.
      // Shantotto casts Fire 3x before the first Blizzard,
      // and 5x before all others.
      id: 'Windurst Third Walk Shantotto Localized Blizzard',
      type: 'Ability',
      netRegex: { id: 'C41A', source: 'Shantotto The Demon', capture: false },
      condition: (data) => {
        if (data.seenFirstBlizzard)
          return data.fireCount === 6;
        return data.fireCount === 4;
      },
      delaySeconds: 0.5,
      suppressSeconds: 1, // This can hit multiple people
      response: Responses.getOut(),
      run: (data) => {
        data.leyCollectionActive = false;
        data.seenFirstBlizzard = true;
        data.fireCount = 0;
        data.leyLocations = {};
      },
    },
    {
      id: 'Windurst Third Walk Shantotto Thunder And Error',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['thunderAndError'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Windurst Third Walk Shantotto Large Specimen',
      type: 'StartsUsing',
      netRegex: { id: 'C40A', source: 'Shantotto The Demon', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.proxAOE!(),
      outputStrings: {
        proxAOE: {
          en: 'Avoid Proximity AoEs',
          cn: '远离距离衰减 AOE',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shantotto Stardust Specimen',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['stardustSpecimen'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Windurst Third Walk Shantotto Shockwave',
      type: 'StartsUsing',
      netRegex: { id: 'C40B', source: 'Shantotto The Demon', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Shantotto Hollow King Final Exam Super Nova',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['finalExamSuperNova'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Windurst Third Walk Shantotto Easterly Winds',
      type: 'GainsEffect',
      netRegex: { effectId: '1516', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.knockWest!(),
      outputStrings: {
        knockWest: {
          en: 'Knockback west into wall',
          cn: '向左击退至墙',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shantotto Westerly Winds',
      type: 'GainsEffect',
      netRegex: { effectId: '1517', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.knockEast!(),
      outputStrings: {
        knockEast: {
          en: 'Knockback east into wall',
          cn: '向右击退至墙',
        },
      },
    },

    // ------------------------------------------------------------------------
    // Trash, boss 1 -> boss 2
    // ------------------------------------------------------------------------

    {
      id: 'Windurst Third Walk Lamia No.2 Pinning Shot',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['pinningShot'], capture: true },
      response: Responses.tankCleave(),
    },
    {
      id: 'Windurst Third Walk Nemean Lion Fulmination Khalkeos',
      type: 'StartsUsing',
      netRegex: { id: 'C3AC', source: 'Nemean Lion', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Medusa Swarmsinger Left Shadow Slash',
      type: 'StartsUsing',
      netRegex: { id: 'C3B3', source: 'Medusa Swarmsinger', capture: false },
      response: Responses.goRight(),
    },
    {
      id: 'Windurst Third Walk Medusa Swarmsinger Right Shadow Slash',
      type: 'StartsUsing',
      netRegex: { id: 'C3B2', source: 'Medusa Swarmsinger', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'Windurst Third Walk Medusa Swarmsinger Bellowing Grunt',
      type: 'StartsUsing',
      netRegex: { id: 'C3B7', source: 'Medusa Swarmsinger', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Medusa Swarmsinger Disregard',
      type: 'StartsUsing',
      netRegex: { id: 'C3B4', source: 'Medusa Swarmsinger', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Medusa Swarmsinger Petrifaction',
      type: 'StartsUsing',
      netRegex: { id: 'C3B6', source: 'Medusa Swarmsinger', capture: true },
      response: Responses.lookAwayFromSource(),
    },

    // ------------------------------------------------------------------------
    // Alexander Resurrected
    // ------------------------------------------------------------------------

    {
      id: 'Windurst Third Walk Alexander Banishga Raidwide',
      type: 'StartsUsing',
      netRegex: { id: 'C427', source: 'Alexander Resurrected', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Alexander Banishga Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['banishga'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Windurst Third Walk Alexander Divine Arrow Clockwise',
      type: 'HeadMarker',
      netRegex: { id: alexCWHeadMarkerData, capture: false },
      delaySeconds: 6, // No headmarker cast times, call about 4s before mech starts
      infoText: (_data, _matches, output) => {
        return output.combo!({ behind: output.getBehind!(), dir: output.clockwise!() });
      },
      outputStrings: {
        combo: {
          en: '${behind} => ${dir}',
          de: '${behind} => ${dir}',
          fr: '${behind} => ${dir}',
          ja: '${behind} => ${dir}',
          cn: '${behind} => ${dir}',
          ko: '${behind} => ${dir}',
          tc: '${behind} => ${dir}',
        },
        getBehind: Outputs.getBehind,
        clockwise: Outputs.clockwise,
      },
    },
    {
      id: 'Windurst Third Walk Alexander Divine Arrow Counterclockwise',
      type: 'HeadMarker',
      netRegex: { id: alexCCWHeadMarkerData, capture: false },
      delaySeconds: 6, // No headmarker cast times, call about 4s before mech starts
      infoText: (_data, _matches, output) => {
        return output.combo!({ behind: output.getBehind!(), dir: output.counterclockwise!() });
      },
      outputStrings: {
        combo: {
          en: '${behind} => ${dir}',
          de: '${behind} => ${dir}',
          fr: '${behind} => ${dir}',
          ja: '${behind} => ${dir}',
          cn: '${behind} => ${dir}',
          ko: '${behind} => ${dir}',
          tc: '${behind} => ${dir}',
        },
        getBehind: Outputs.getBehind,
        counterclockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'Windurst Third Walk Alexander Divine Spear Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C3DF', capture: true },
      run: (data, matches) => {
        const entity: nonCombatEntity = {
          x: Math.round(parseFloat(matches.x)),
          y: Math.round(parseFloat(matches.y)),
          heading: parseFloat(matches.heading),
        };
        data.spearEntities.push(entity);
      },
    },
    {
      id: 'Windurst Third Walk Alexander Divine Spear Call',
      type: 'StartsUsing',
      netRegex: { id: 'C3DF', source: 'Alexander Resurrected', capture: false },
      delaySeconds: 0.5,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.spearEntities.length < 4)
          return output.unknownSpear!();

        // There will always be 0 or 2 entities in the center,
        // forming either a "pinwheel" or an "arrow".
        // First check which pattern we have.
        const centerEntities = data.spearEntities.filter((entity) => {
          return (entity.x === 0 && entity.y === 360);
        });

        // Throughout this function, we do not compare non-zero values directly.
        // Always compare relatively, just in case a value
        // that's not close to zero rounds in an unexpected direction.

        // If none are centered, it's a pinwheel. Check the facing on the north
        // one to determine whether it's clockwise or counterclockwise.
        if (centerEntities.length === 0) {
          const northEntity = data.spearEntities.find((entity) => {
            return entity.x === 0 && entity.y < 345;
          });
          if (northEntity === undefined)
            return output.unknownSpear!();
          // The north entity's heading will be one of 0.785 or -0.785,
          // indicating SE or SW respectively.
          // If positive, players should "lean" counterclockwise
          // relative to the cardinals.
          const leanRotation = northEntity.heading > 0 ? 'cw' : 'ccw';
          return output.pinwheel!({ rot: output[leanRotation]!() });
        }

        // The other possibility is two entities at the edge and two centered.
        // In this case, it will be an arrow shape with one cardinal safe
        // close on the boss.
        // Check undefined here rather than length, bypassing an additional
        // inline check that would otherwise be necessary.
        if (centerEntities[0] !== undefined && centerEntities[1] !== undefined) {
          const cHeading1 = centerEntities[0].heading;
          const cHeading2 = centerEntities[1].heading;
          const headingSum = Math.round(cHeading1 + cHeading2);

          // North intercardinal and south intercardinal
          // headings have the same value with opposite signs,
          // negative west and positive east:
          // NE: 2.356
          // SE: 0.785
          // SW: -0.785
          // NW: -2.356

          // North/South safe
          // North: Headings 0.785 and -0.785
          if (headingSum === 0 && Math.abs(cHeading1) < 1.5)
            return output.cardSafe!({ dir: output.dirN!() });
          // South: Headings 2.356 and -2.356
          if (headingSum === 0 && Math.abs(cHeading1) > 1.5)
            return output.cardSafe!({ dir: output.dirS!() });

          // East/West safe.
          // Summed intercardinal headings will be positive if
          // the entities are both east, or negative if both are west.
          // Call opposite that value.
          const safeDir = headingSum < 0 ? 'dirE' : 'dirW';
          return output.cardSafe!({ dir: output[safeDir]!() });
        }
      },
      outputStrings: {
        pinwheel: {
          en: 'Pinwheel: Lean ${rot} close',
          cn: '旋转焰火：向${rot}侧靠近',
        },
        cardSafe: {
          en: 'Go ${dir} close',
          cn: '去${dir}靠近',
        },
        ...cardDirToOutputStrings,
        cw: Outputs.clockwise,
        ccw: Outputs.counterclockwise,
        unknownSpear: {
          en: 'Avoid spear triangles',
          cn: '躲避旋转扇形',
        },
      },
    },
    {
      // Separate this out because we can't safely use an explicit condition
      // for the call trigger due to it also requiring a delay.
      id: 'Windurst Third Walk Alexander Divine Spear Cleanup',
      type: 'StartsUsing',
      netRegex: { id: 'C3DF', source: 'Alexander Resurrected', capture: false },
      delaySeconds: 10,
      run: (data) => data.spearEntities = [],
    },
    {
      id: 'Windurst Third Walk Alexander Impartial Ruling Left',
      type: 'StartsUsing',
      netRegex: { id: 'C3E0', source: 'Alexander Resurrected', capture: false },
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'Windurst Third Walk Alexander Impartial Ruling Right',
      type: 'StartsUsing',
      netRegex: { id: 'C3E1', source: 'Alexander Resurrected', capture: false },
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'Windurst Third Walk Alexander Karmic Shielding',
      type: 'StartsUsing',
      netRegex: { id: 'C5FE', source: 'Gordius System', capture: false },
      suppressSeconds: 1,
      alarmText: (_data, _matches, output) => output.noShields!(),
      outputStrings: {
        noShields: {
          en: 'Attack only unshielded Gordius',
          cn: '只攻击无护盾的戈耳狄系统',
        },
      },
    },
    {
      id: 'Windurst Third Walk Alexander Divine Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'C3E9', source: 'Alexander Resurrected', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Windurst Third Walk Alexander Divine Bolt',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['divineBolt'], capture: true },
      response: Responses.tankCleave(),
    },

    // ------------------------------------------------------------------------
    // Mini-boss: Aw'aern & the Aw'zdei
    // ------------------------------------------------------------------------

    {
      id: 'Windurst Third Walk Aw\'aern Auroral Wind',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['auroralWind'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Windurst Third Walk Aw\'aern Impact Stream',
      type: 'StartsUsing',
      netRegex: { id: 'C535', source: 'Aw\'aern', capture: false },
      response: Responses.aoe(),
    },

    // ------------------------------------------------------------------------
    // Promathia
    // ------------------------------------------------------------------------

    {
      id: 'Windurst Third Walk Promathia Empty Salvation',
      type: 'StartsUsing',
      netRegex: { id: 'C48D', source: 'Promathia', capture: false },
      response: Responses.aoe(),
    },
    {
      // Malevolent Blessing is sometimes used alongside Bastion and Wheel.
      // We need to track whether they are active
      // because if they are, we do not want to call
      // Malevolent Blessing separately.
      // C491: Wheel of Impregnability castbar
      // C492: Bastion of Twilight castbar
      id: 'Windurst Third Walk Promathia Wheel Bastion Activate',
      type: 'StartsUsing',
      netRegex: { id: ['C491', 'C492'], source: 'Promathia', capture: false },
      run: (data) => data.wheelBastionActive = true,
    },
    {
      // C493: Wheel of Impregnability
      // C494: Bastion of Twilight
      id: 'Windurst Third Walk Promathia Wheel Bastion Deactivate',
      type: 'Ability',
      netRegex: { id: ['C493', 'C494'], source: 'Promathia', capture: false },
      run: (data) => data.wheelBastionActive = false,
    },
    {
      id: 'Windurst Third Walk Promathia Pestilent Penance Activate',
      type: 'StartsUsing',
      netRegex: { id: 'C49C', source: 'Link Of Promathia', capture: false },
      suppressSeconds: 5,
      run: (data) => data.penanceActive = true,
    },
    {
      id: 'Windurst Third Walk Promathia Pestilent Penance Deactivate',
      type: 'Ability',
      netRegex: { id: 'C49C', source: 'Link Of Promathia', capture: false },
      delaySeconds: 5,
      suppressSeconds: 5,
      run: (data) => data.penanceActive = false,
    },
    {
      id: 'Windurst Third Walk Promathia Wheel Of Impregnability',
      type: 'Ability',
      netRegex: { id: 'C491', source: 'Promathia', capture: false },
      delaySeconds: 6, // Used about 11 seconds prior, warn at 5s.
      alertText: (data, _matches, output) => {
        if (data.penanceActive)
          return output.wheelLasers!({ out: output.outOfMelee!(), behind: output.behind!() });
        if (data.blessingSafe !== 'inactive') {
          const leftRight = data.blessingSafe;
          return output.wheelBlessing!({ out: output.outOfMelee!(), dir: output[leftRight]!() });
        }
        return output.outOfMelee!();
      },
      outputStrings: {
        wheelLasers: {
          en: '${out} + ${behind} => avoid lasers',
          cn: '${out} + ${behind} => 躲避激光',
        },
        wheelBlessing: {
          en: '${out} + ${dir}',
          cn: '${out} + ${dir}',
        },
        behind: Outputs.getBehind,
        left: Outputs.left,
        right: Outputs.right,
        outOfMelee: Outputs.outOfMelee,
      },
    },
    {
      id: 'Windurst Third Walk Promathia Bastion Of Twilight',
      type: 'Ability',
      netRegex: { id: 'C492', source: 'Promathia', capture: false },
      delaySeconds: 6, // Used about 11 seconds prior, warn at 5s.
      alertText: (data, _matches, output) => {
        if (data.penanceActive)
          return output.bastionLasers!({ behind: output.behind!(), under: output.under!() });
        if (data.blessingSafe !== 'inactive') {
          const leftRight = data.blessingSafe;
          return output.bastionBlessing!({ under: output.under!(), dir: output[leftRight]!() });
        }
        return output.basicBastion!({ behind: output.behind!(), under: output.under!() });
      },
      outputStrings: {
        // The first Bastion is always in combination with
        // Promathia's Penance ability.
        // Thereafter, any Penance uses from Promathia
        // are accompanied by Link Of Promathia lasers.
        basicBastion: {
          en: '${behind} + ${under}',
          de: '${behind} + ${under}',
          fr: '${behind} + ${under}',
          ja: '${behind} + ${under}',
          cn: '${behind} + ${under}',
          ko: '${behind} + ${under}',
          tc: '${behind} + ${under}',
        },
        bastionLasers: {
          en: '${behind} + ${under} => avoid lasers',
          cn: '${behind} + ${under} => 躲避激光',
        },
        bastionBlessing: {
          en: '${under} + ${dir}',
          de: '${under} + ${dir}',
          fr: '${under} + ${dir}',
          ja: '${under} + ${dir}',
          cn: '${under} + ${dir}',
          ko: '${under} + ${dir}',
          tc: '${under} + ${dir}',
        },
        behind: Outputs.getBehind,
        under: Outputs.getUnder,
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'Windurst Third Walk Promathia Shinryu Hollow King Comet Dark Nova Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['cometDarkNova'], capture: true },
      run: (data, matches) => data.cometTargets.push(matches.target),
    },
    {
      id: 'Windurst Third Walk Promathia Comet Call',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['cometDarkNova'], capture: false },
      delaySeconds: 0.5,
      suppressSeconds: 5,
      alertText: (data, _matches, output) => {
        if (data.cometTargets.includes(data.me))
          return output.cleaveOnYou!();
        return output.avoidCleave!();
      },
      run: (data) => data.cometTargets = [],
      outputStrings: {
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleave: Outputs.avoidTankCleaves,
      },
    },
    {
      id: 'Windurst Third Walk Promathia Meteor',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['meteor'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Windurst Third Walk Promathia Infernal Deliverance Towers',
      type: 'StartsUsing',
      netRegex: { id: 'C49E', source: 'Promathia', capture: false },
      suppressSeconds: 1,
      response: Responses.getTowers(),
    },
    {
      id: 'Windurst Third Walk Promathia Infernal Deliverance Puddles',
      type: 'Ability',
      netRegex: { id: 'C49F', source: 'Promathia', capture: false },
      suppressSeconds: 5,
      response: Responses.moveAway(),
    },
    {
      // Cue off False Genesis resolving.
      // Update the player's platform if they die or move thereafter.
      id: 'Windurst Third Walk Promathia Intermission First Platform',
      type: 'Ability',
      netRegex: { id: 'C4A7', source: 'Promathia', capture: false },
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Windurst First Platform Data Error: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        data.myPlatformNum = getPlatform(me.PosX, me.PosY);
      },
    },
    {
      // Update the player's platform if they move platforms.
      id: 'Windurst Third Walk Promathia Intermission Later Platforms',
      type: 'GainsEffect',
      netRegex: { effectId: 'A12', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.5, // Avoid any risk of race conditions with player movement.
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Windurst Later Platforms Data Error: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        data.myPlatformNum = getPlatform(me.PosX, me.PosY);
      },
    },
    {
      id: 'Windurst Third Walk Empty Thinker Winds Of Promyvion',
      type: 'StartsUsing',
      netRegex: { id: ['C4B0', 'C4B1'], source: 'Empty Thinker', capture: true },
      condition: (data, matches) => {
        const thinkerPlatformNum = getPlatform(parseFloat(matches.x), parseFloat(matches.y));
        return data.myPlatformNum === thinkerPlatformNum;
      },
      suppressSeconds: 5,
      infoText: (_data, matches, output) => {
        if (matches.id === 'C4B0')
          return output.clockwise!();
        return output.counterclockwise!();
      },
      outputStrings: {
        clockwise: Outputs.clockwise,
        counterclockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'Windurst Third Walk Empty Weeper Auroral Drape',
      type: 'StartsUsing',
      netRegex: { id: 'C4B3', source: 'Empty Weeper', capture: true },
      condition: (data, matches) => {
        const weeperPlatformNum = getPlatform(parseFloat(matches.x), parseFloat(matches.y));
        return data.myPlatformNum === weeperPlatformNum;
      },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.avoidAuroral!(),
      outputStrings: {
        avoidAuroral: {
          en: 'Go To Safe Corner',
          cn: '前往安全角落',
        },
      },
    },
    {
      id: 'Windurst Third Walk Empty Wanderer Empty Beleaguer',
      type: 'StartsUsing',
      netRegex: { id: 'C4AF', source: 'Empty Wanderer', capture: true },
      condition: (data, matches) => {
        const wandererPlatformNum = getPlatform(parseFloat(matches.x), parseFloat(matches.y));
        return data.myPlatformNum === wandererPlatformNum;
      },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.avoidBeleaguer!(),
      outputStrings: {
        avoidBeleaguer: {
          en: 'Dodge 2-1',
          cn: '躲避 2-1',
        },
      },
    },
    {
      id: 'Windurst Third Walk Promathia Deadly Rebirth',
      type: 'StartsUsing',
      netRegex: { id: 'C4AB', source: 'Promathia', capture: false },
      alertText: (_data, _matches, output) => output.aoePlusStun!(),
      run: (data) => data.seenPromathiaIntermission = true,
      outputStrings: {
        aoePlusStun: {
          en: 'AoE + stun',
          cn: 'AoE + 眩晕',
        },
      },
    },
    {
      id: 'Windurst Third Walk Promathia Malevolent Blessing Left',
      type: 'StartsUsing',
      netRegex: { id: 'C497', source: 'Promathia', capture: false },
      alertText: (data, _matches, output) => {
        if (!data.wheelBastionActive)
          return output.right!();
      },
      run: (data) => data.blessingSafe = 'right',
      outputStrings: {
        right: Outputs.right,
      },
    },
    {
      id: 'Windurst Third Walk Promathia Malevolent Blessing Right',
      type: 'StartsUsing',
      netRegex: { id: 'C496', source: 'Promathia', capture: false },
      alertText: (data, _matches, output) => {
        if (!data.wheelBastionActive)
          return output.left!();
      },
      run: (data) => data.blessingSafe = 'left',
      outputStrings: {
        left: Outputs.left,
      },
    },
    {
      id: 'Windurst Third Walk Promathia Malevolent Blessing Deactivate',
      type: 'Ability',
      netRegex: { id: ['C496', 'C497'], source: 'Promathia', capture: false },
      delaySeconds: 5,
      run: (data) => data.blessingSafe = 'inactive',
    },
    // Empty Salvation signals the start of an Explosion segment.
    // During these segments, there will either be an even number of explosions,
    // preceded by a Fleeting Eternity cast, or there will be an odd number,
    // preceded by an Earthbound Heaven cast.
    // Track which one is active here.
    {
      id: 'Windurst Third Walk Promathia Fleeting Eternity Tracker',
      type: 'StartsUsing',
      netRegex: { id: 'C48E', source: 'Promathia', capture: false },
      run: (data) => data.earthboundHeavenActive = false,
    },
    {
      id: 'Windurst Third Walk Promathia Earthbound Heaven Tracker',
      type: 'StartsUsing',
      netRegex: { id: 'C49D', source: 'Promathia', capture: false },
      run: (data) => data.earthboundHeavenActive = true,
    },
    {
      // Store off the textual representation
      // of each puddle, then use that to call a safe direction.
      id: 'Windurst Third Walk Promathia Explosion Collector',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C490', capture: true },
      run: (data, matches) => {
        const x = Math.round(parseFloat(matches.x));
        const y = Math.round(parseFloat(matches.y));
        const puddle = promathiaPuddleMap.find((puddle) => puddle.x === x && puddle.y === y);
        if (puddle === undefined)
          data.explosionLocs.push('unknown');
        else {
          data.explosionLocs.push(puddle.loc);
        }
      },
    },
    {
      // Explosions prior to the intermission are single sets
      // of two or four.
      id: 'Windurst Third Walk Promathia Eternity Explosion Pre Intermission',
      type: 'StartsUsing',
      netRegex: { id: 'C490', source: 'Promathia', capture: false },
      condition: (data) => !data.seenPromathiaIntermission,
      delaySeconds: 0.5,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const safeDirs = getEvenExplosionSafe(data.explosionLocs);
        // In practice both elements will be defined, but the compiler doesn't know that.
        if (safeDirs.includes('unknown') || safeDirs[0] === undefined || safeDirs[1] === undefined)
          return output.avoidExplosions!();
        return output.combo!({
          dir1: output[safeDirs[0]]!(),
          dir2: output[safeDirs[1]]!(),
        });
      },
      run: (data) => data.explosionLocs = [],
      outputStrings: promathiaExplosionOutputStrings,
    },
    {
      // Post-intermission Eternity Explosions are in
      // three sequential groups of two, opposite each other.

      // All six points explode once each during this sequence.
      // Each Explosion set is separated by 3 seconds.
      // Delay calling sets 2/3 by 1.6 seconds to
      // avoid overlap with 1/2.
      id: 'Windurst Third Walk Promathia Eternity Explosion Post Intermission',
      type: 'StartsUsing',
      netRegex: { id: 'C490', source: 'Promathia', capture: false },
      condition: (data) => data.seenPromathiaIntermission && !data.earthboundHeavenActive,
      delaySeconds: (data) => data.multiExplosionCounter === 0 ? 0.5 : 1.6,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const safeDirs = getEvenExplosionSafe(data.explosionLocs);
        // In practice both elements will be defined, but the compiler doesn't know that.
        if (safeDirs.includes('unknown') || safeDirs[0] === undefined || safeDirs[1] === undefined)
          return output.avoidExplosions!();
        return output.combo!({
          dir1: output[safeDirs[0]]!(),
          dir2: output[safeDirs[1]]!(),
        });
      },
      run: (data) => {
        data.explosionLocs = [];
        data.multiExplosionCounter = (data.multiExplosionCounter + 1) % 3;
      },
      outputStrings: promathiaExplosionOutputStrings,
    },
    {
      // Earthbound Heaven explosions spawn on three of the six hexagon points.
      // This pattern always looks like this, with one open side west
      // and two open sides NW and SW:

      //    O
      //   /
      //  /
      // O       O
      //         |
      //         |
      // O       O
      //  \
      //   \
      //    O

      // Two explosions will always start close to each other.
      // (There will never be a situation where all three
      // start clockwise or counterclockwise on their puddle lines.)

      // Find the two close to each other and call that direction.
      id: 'Windurst Third Walk Promathia Earthbound Explosion',
      type: 'StartsUsing',
      netRegex: { id: 'C490', source: 'Promathia', capture: false },
      condition: (data) => data.earthboundHeavenActive,
      delaySeconds: 0.5,
      suppressSeconds: 2,
      infoText: (data, _matches, output) => {
        // If north and south puddles are exploding,
        // the third puddle is east. Call west.
        if (data.explosionLocs.includes('dirN') && data.explosionLocs.includes('dirS'))
          return output.dirW!();
        // If northeast and southwest are exploding,
        // the third puddle is northwest. Call southeast.
        if (data.explosionLocs.includes('dirNE') && data.explosionLocs.includes('dirSW'))
          return output.southeast!();
        // If northwest and southeast are exploding,
        // the third puddle is southwest. Call northeast.
        if (data.explosionLocs.includes('dirNW') && data.explosionLocs.includes('dirSE'))
          return output.northeast!();
        // If we fall through to here, something is wrong. Call generically.
        return output.avoidExplosions!();
      },
      run: (data) => data.explosionLocs = [],
      outputStrings: promathiaExplosionOutputStrings,
    },

    // ------------------------------------------------------------------------
    // Shinryu Paradox / Hollow King
    // ------------------------------------------------------------------------

    {
      id: 'Windurst Third Walk Shinryu Cosmic Breath',
      type: 'StartsUsing',
      netRegex: { id: 'BFD1', source: 'Shinryu Paradox', capture: false },
      infoText: (_data, _matches, output) => output.goDown!(),
      outputStrings: {
        goDown: {
          en: 'Go lower platform',
          cn: '去下平台',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shinryu Cosmic Tail',
      type: 'StartsUsing',
      netRegex: { id: 'BFD4', source: 'Shinryu Paradox', capture: false },
      infoText: (_data, _matches, output) => output.goUp!(),
      outputStrings: {
        goUp: {
          en: 'Go upper platform',
          cn: '去上平台',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shinryu Waning Light Gain',
      type: 'GainsEffect',
      netRegex: { effectId: '14E8', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.lightLater!(),
      run: (data) => data.myAspect = 'light',
      outputStrings: {
        lightLater: {
          en: 'Light safe later',
          cn: '稍后光安全',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shinryu Waxing Dark Gain',
      type: 'GainsEffect',
      netRegex: { effectId: '14E9', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.darkLater!(),
      run: (data) => data.myAspect = 'dark',
      outputStrings: {
        darkLater: {
          en: 'Dark safe later',
          cn: '稍后暗安全',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shinryu Twilight Nebula',
      type: 'StartsUsing',
      netRegex: { id: 'BFD9', source: 'Shinryu Paradox', capture: false },
      alertText: (data, _matches, output) => {
        if (data.myAspect === 'light')
          return output.upLightSafe!();
        if (data.myAspect === 'dark')
          return output.downDarkSafe!();
        return output.unknownSafe!();
      },
      outputStrings: {
        upLightSafe: {
          en: 'Up on light platform',
          cn: '去上光平台',
        },
        downDarkSafe: {
          en: 'Down on dark platform',
          cn: '去下暗平台',
        },
        unknownSafe: {
          en: 'Match platform + debuff color',
          cn: '去 debuff 同色平台',
        },
      },
    },
    {
      id: 'Windurst Third Walk Shinryu Cataclysmic Vortex Look Away',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['lookAway'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.lookAway(),
    },
    {
      id: 'Windurst Third Walk Shinryu Cataclysmic Vortex Look Towards',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['lookTowards'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.lookTowards(),
    },
    {
      id: 'Windurst Third Walk Shinryu Cataclysmic Vortex Stillness',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['stillness'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.stopEverything('alert'),
    },
    {
      id: 'Windurst Third Walk Shinryu Cataclysmic Vortex Motion',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['motion'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.moveAround(),
    },
    {
      id: 'Windurst Third Walk Shinryu Atomic Tail',
      type: 'StartsUsing',
      netRegex: { id: 'BFEA', source: 'Shinryu Paradox', capture: false },
      alertText: (_data, _matches, output) => output.goUp!(),
      outputStrings: {
        goUp: {
          en: 'Go upper platform',
          cn: '去上平台',
        },
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Clashing',
      type: 'GainsEffect',
      netRegex: { effectId: '4F7', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.tookTrailTower = true,
    },
    {
      id: 'Windurst Third Walk Hollow King Celestial Trail',
      type: 'StartsUsing',
      netRegex: { id: 'BFF4', source: 'Hollow King', capture: false },
      condition: (data) => !data.tookTrailTower,
      suppressSeconds: 1,
      response: Responses.getTowers(),
    },
    {
      id: 'Windurst Third Walk Hollow King Empty Proclamation',
      type: 'StartsUsing',
      netRegex: { id: 'C01B', source: 'Hollow King', capture: false },
      response: Responses.aoe(),
    },
    {
      // Both Swordscross abilities have a diagonal component.
      // Call northwest or northeast specifically.
      id: 'Windurst Third Walk Hollow King Left Swordscross',
      type: 'StartsUsing',
      netRegex: { id: 'C000', source: 'Hollow King', capture: false },
      infoText: (_data, _matches, output) => output.northwest!(),
      outputStrings: {
        northwest: Outputs.northwest,
      },
    },
    {
      // Both Swordscross abilities have a diagonal component.
      // Call northwest or northeast specifically.
      id: 'Windurst Third Walk Hollow King Right Swordscross',
      type: 'StartsUsing',
      netRegex: { id: 'BFFF', source: 'Hollow King', capture: false },
      infoText: (_data, _matches, output) => output.northeast!(),
      outputStrings: {
        northeast: Outputs.northeast,
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Twin Blaze Left',
      type: 'StartsUsing',
      netRegex: { id: 'C005', source: 'Hollow King', capture: false },
      infoText: (_data, _matches, output) => {
        return output.getInAndLeft!({ in: output.in!(), left: output.left!() });
      },
      outputStrings: {
        getInAndLeft: {
          en: '${in} + ${left}',
          de: '${in} + ${left}',
          fr: '${in} + ${left}',
          ja: '${in} + ${left}',
          cn: '${in} + ${left}',
          ko: '${in} + ${left}',
          tc: '${in} + ${left}',
        },
        in: Outputs.in,
        left: Outputs.left,
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Twin Blaze Right',
      type: 'StartsUsing',
      netRegex: { id: 'C006', source: 'Hollow King', capture: false },
      infoText: (_data, _matches, output) => {
        return output.getInAndRight!({ in: output.in!(), right: output.right!() });
      },
      outputStrings: {
        getInAndRight: {
          en: '${in} + ${right}',
          de: '${in} + ${right}',
          fr: '${in} + ${right}',
          ja: '${in} + ${right}',
          cn: '${in} + ${right}',
          ko: '${in} + ${right}',
          tc: '${in} + ${right}',
        },
        in: Outputs.in,
        right: Outputs.right,
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Cataclysmic Blade',
      type: 'StartsUsing',
      netRegex: { id: 'C009', source: 'Hollow King', capture: false },
      alertText: (_data, _matches, output) => output.avoidSwords!(),
      outputStrings: {
        avoidSwords: {
          en: 'Avoid sword cones',
          cn: '躲避扇形剑击',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Alexander Resurrected': 'Alexander (?:der|die|das) Wiedererweckt(?:e|er|es|en)',
        'Arcane Sphere': 'arkan(?:e|er|es|en) Sphäre',
        'Empty Thinker': 'leer(?:e|er|es|en) Denker',
        'Empty Wanderer': 'leer(?:e|er|es|en) Wanderer',
        'Empty Weeper': 'leer(?:e|er|es|en) Weeper',
        'Gordius System': 'Gordeus-System',
        'Hollow King': 'Hülle des Königs',
        'Memory Receptacle': 'Speichermedium',
        'Promathia': 'Promathia',
        'Shantotto the Demon': 'Shantotto (?:der|die|das) Schwarz(?:e|er|es|en) Teufel',
        'Shinryu Paradox': 'Shinryu',
      },
      'replaceText': {
        'Activate': 'Aktivierung',
        'Aero Dynamics': 'Aerodynamik',
        'Atomic Ray': 'Atomstrahlung',
        'Atomic Tail': 'Atomschweif',
        'Auroral Drape': 'Dämmervorhang',
        'Banishga IV': 'Verbannen IV',
        'Bastion of Twilight': 'Bastion der Dämmerung',
        'Burst': 'Explosion',
        'Canonize Coordinates': 'Kanonische Koordinaten',
        'Cataclysmic Blade': 'Kataklystische Klinge',
        'Cataclysmic Vortex': 'Kataklystischer Vortex',
        'Celestial Trail': 'Himmlischer Pfad',
        'Circumscribed Fire': 'Ringfeuer',
        'Cloak of Twilight': 'Mantel der Dämmerung',
        'Comet': 'Komet',
        'Cosmic Breath': 'Kosmischer Odem',
        'Cosmic Flame': 'Kosmische Flamme',
        'Cosmic Tail': 'Kosmischer Schweif',
        'Dark Nova': 'Dunkle Nova',
        'Deadly Rebirth': 'Tödliche Wiedergeburt',
        'Diagrammatic Doorway': 'Arkaner Schritt',
        'Divine Arrow': 'Heiliger Pfeil',
        'Divine Bolt': 'Heiliger Schlag',
        'Divine Judgment': 'Göttliches Urteil',
        'Divine Spear': 'Heiliger Speer',
        'Earthbound Heaven': 'Regentropfen',
        'Electrify': 'Elektrisieren',
        'Empirical Research': 'Empirische Forschung',
        'Empty Beleaguer': 'Leerer Belagerer',
        'Empty Proclamation': 'Leere Proklamation',
        'Empty Salvation': 'Leere Erlösung',
        'Empty Seed': 'Leere Saat',
        'Explosion(?!s)': 'Explosion',
        'Falling Rubble': 'Schuttlawine',
        'False Genesis': 'Welt des Nichts',
        'Final Exam': 'Abschlussprüfung',
        'Flare Play': 'Flaresturm',
        'Fleeting Eternity': 'Flüchtige Ewigkeit',
        'Groundbreaking Quake': 'Verheerendes Beben',
        'Gyre Charge': 'Wirbel-Aufladung',
        'Holy Flame': 'Heiliges Feuer',
        'Impartial Ruling': 'Gerechtes Urteil',
        'Infernal Deliverance': 'Höllische Befreiung',
        'Karmic Shielding': 'Reflektierender Schutzschild',
        'Large Specimen': 'Großer Meteorit',
        'Left Swordscross': 'Linke Kreuzklinge',
        'Localized Blizzard': 'Gebündeltes Eis',
        'Malevolent Blessing': 'Böser Segen',
        'Mega Holy': 'Super-Sanctus',
        '(?<! )Meteor(?!i)': 'Meteo',
        'Meteoric Rhyme': 'Unkontrollierbarer Meteor',
        'Painful Pressure': 'Unerbittlicher Druck',
        'Perfect Defense': 'Perfekte Abwehr',
        'Pestilent Penance': 'Pestbuße',
        'Radiant Sacrament': 'Brennendes Sakrament',
        'Reinforcements': 'Unterstützungsbefehl',
        'Right Swordscross': 'Rechte Kreuzklinge',
        'Sacred Assembly': 'Heilige Versammlung',
        'Shock(?!wave)': 'Entladung',
        'Shockwave': 'Schockwelle',
        'Small Specimen': 'Kleiner Meteorit',
        'Stardust Specimen': 'Meteorit',
        'Starflare': 'Sternenflare',
        'Super Nova': 'Supernova',
        'Superior Stone II': 'Höheres Steinra',
        'Thunder and Error': 'Zielgenauer Blitz',
        'Twilight Nebula': 'Nebula der Dämmerung',
        'Twin Blaze': 'Doppelflamme',
        'Vidohunir': 'Vidohunir',
        'Wheel of Impregnability': 'Rad der Uneinnehmbarkeit',
        'Winds of Promyvion': 'Promyvion-Winde',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Alexander Resurrected': 'Alexander Resurrected',
        'Arcane Sphere': 'Arcane Sphere',
        'Empty Thinker': 'Empty Thinker',
        'Empty Wanderer': 'Empty Wanderer',
        'Empty Weeper': 'Empty Weeper',
        'Gordius System': 'Gordeus System',
        'Hollow King': 'Hollow King',
        'Memory Receptacle': 'Memory Receptacle',
        'Promathia': 'Promathia',
        'Shantotto the Demon': 'Shantotto the Demon',
        'Shinryu Paradox': 'Shinryu',
      },
      'replaceText': {
        'Activate': 'Activation',
        'Aero Dynamics': 'Vent ébourrifant',
        'Atomic Ray': 'Rayon atomique',
        'Atomic Tail': 'Queue atomique',
        'Auroral Drape': 'Drapé auroral',
        'Banishga IV': 'Bannissement IV',
        'Bastion of Twilight': 'Bastion de la pénombre',
        'Burst': 'Explosion',
        'Canonize Coordinates': 'Coordonnées canoniques',
        'Cataclysmic Blade': 'Lame cataclysmique',
        'Cataclysmic Vortex': 'Vortex cataclysmique',
        'Celestial Trail': 'Trace céleste',
        'Circumscribed Fire': 'Feu rotatif',
        'Cloak of Twilight': 'Cape du crépuscule',
        'Comet': 'Comète',
        'Cosmic Breath': 'Souffle cosmique',
        'Cosmic Flame': 'Flamme cosmique',
        'Cosmic Tail': 'Queue cosmique',
        'Dark Nova': 'Nova noire',
        'Deadly Rebirth': 'Aratama',
        'Diagrammatic Doorway': 'Pas arcanique',
        'Divine Arrow': 'Flèche divine',
        'Divine Bolt': 'Lance divine',
        'Divine Judgment': 'Verdict divin',
        'Divine Spear': 'Flèche sacrée',
        'Earthbound Heaven': 'Goutte de pluie',
        'Electrify': 'Électrisation',
        'Empirical Research': 'Recherches empiriques',
        'Empty Beleaguer': 'Viduité',
        'Empty Proclamation': 'Proclamation vide',
        'Empty Salvation': 'Néant salvateur',
        'Empty Seed': 'Graine du Néant',
        'Explosion(?!s)': 'Explosion',
        'Falling Rubble': 'Éboulement',
        'False Genesis': 'Monde de Néant',
        'Final Exam': 'Examen final',
        'Flare Play': 'Brasier exaspéré',
        'Fleeting Eternity': 'Fugacité',
        'Groundbreaking Quake': 'Séisme ravageur',
        'Gyre Charge': 'Gyrocharge',
        'Holy Flame': 'Flamme sacrée',
        'Impartial Ruling': 'Jugement impartial',
        'Infernal Deliverance': 'Libération infernale',
        'Karmic Shielding': 'Barrière réflectrice',
        'Large Specimen': 'Grand astéroïde',
        'Left Swordscross': 'Croix d\'acier gauche',
        'Localized Blizzard': 'Glace débordante',
        'Malevolent Blessing': 'Grâce malveillante',
        'Mega Holy': 'Méga Miracle',
        'Meteor(?!ic)': 'Météore',
        'Meteoric Rhyme': 'Météore exaspéré',
        'Painful Pressure': 'Pression impitoyable',
        'Perfect Defense': 'Défense absolue',
        'Pestilent Penance': 'Pénitence pestilentielle',
        'Radiant Sacrament': 'Sacrement radiant',
        'Reinforcements': 'Ordonnance de renforts',
        'Right Swordscross': 'Croix d\'acier droite',
        'Sacred Assembly': 'Assemblage sacré',
        'Shock(?!wave)': 'Décharge électrostatique',
        'Shockwave': 'Onde de choc',
        'Small Specimen': 'Petit astéroïde',
        'Stardust Specimen': 'Astéroïde',
        'Starflare': 'Brasier stellaire',
        'Super Nova': 'Supernova',
        'Superior Stone II': 'MultiPierre volante',
        'Thunder and Error': 'Foudre à tête chercheuse',
        'Twilight Nebula': 'Nébuleuse du crépuscule',
        'Twin Blaze': 'Embrasements jumeaux',
        'Vidohunir': 'Vidohunir',
        'Wheel of Impregnability': 'Roue de l\'illusion',
        'Winds of Promyvion': 'Vents de Promyvion',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Alexander Resurrected': 'Alexander Resurrected',
        'Arcane Sphere': 'Arcane Sphere',
        'Empty Thinker': 'Empty Thinker',
        'Empty Wanderer': 'Empty Wanderer',
        'Empty Weeper': 'Empty Weeper',
        'Gordius System': 'Gordius System',
        'Hollow King': 'Hollow King',
        'Memory Receptacle': 'Memory Receptacle',
        'Promathia': 'Promathia',
        'Shantotto the Demon': 'Shantotto the Demon',
        'Shinryu Paradox': 'Shinryu',
      },
      'replaceText': {
        'Activate': '起動',
        'Aero Dynamics': 'ブッ飛ばしエアロ',
        'Atomic Ray': 'アトミックレイ',
        'Atomic Tail': 'アトミックテイル',
        'Auroral Drape': 'オーロラルドレープ',
        'Banishga IV': 'バニシュIV',
        'Bastion of Twilight': 'たそがれのまほら',
        'Burst': '爆発',
        'Canonize Coordinates': '座標計測',
        'Cataclysmic Blade': 'カタクリスムブレイド',
        'Cataclysmic Vortex': 'カタクリスムヴォルテクス',
        'Celestial Trail': 'セレスティア・トレイル',
        'Circumscribed Fire': '輪くぐりファイア',
        'Cloak of Twilight': 'トワイライトクローク',
        'Comet': 'コメット',
        'Cosmic Breath': 'コズミックブレス',
        'Cosmic Flame': 'コズミックフレイム',
        'Cosmic Tail': 'コズミックテイル',
        'Dark Nova': 'ダークノヴァ',
        'Deadly Rebirth': 'あらたま',
        'Diagrammatic Doorway': 'ステップ陣展開',
        'Divine Arrow': '聖なる矢',
        'Divine Bolt': '聖なる光槍',
        'Divine Judgment': '聖なる審判',
        'Divine Spear': '聖なる炎',
        'Earthbound Heaven': 'あめのしずく',
        'Electrify': '大放電',
        'Empirical Research': 'エンピリカルリサーチ',
        'Empty Beleaguer': 'エンプティベリーガー',
        'Empty Proclamation': 'エンプティ・プロクラメーション',
        'Empty Salvation': 'かむうた',
        'Empty Seed': 'エンプティシード',
        'Explosion(?!s)': '爆発',
        'Falling Rubble': '瓦礫落下',
        'False Genesis': 'うつろなるせかい',
        'Final Exam': 'ファイナルエクザム',
        'Flare Play': 'ブチ切れフレア',
        'Fleeting Eternity': 'たまゆら',
        'Groundbreaking Quake': 'すり潰しクエイク',
        'Gyre Charge': 'ジャイヤチャージ',
        'Holy Flame': '聖火',
        'Impartial Ruling': '審理の光',
        'Infernal Deliverance': 'いざない',
        'Karmic Shielding': '反射防壁',
        'Large Specimen': '大隕石',
        'Left Swordscross': 'レフト・ソードクロス',
        'Localized Blizzard': '寄らばブリザド',
        'Malevolent Blessing': 'あまのさかて',
        'Mega Holy': 'メガホーリー',
        'Meteor(?!ic)': 'メテオ',
        'Meteoric Rhyme': 'ブチ切れメテオ',
        'Painful Pressure': '圧殺',
        'Perfect Defense': '絶対防御',
        'Pestilent Penance': 'よもつへぐい',
        'Radiant Sacrament': '拝火の秘蹟',
        'Reinforcements': '支援命令',
        'Right Swordscross': 'ライト・ソードクロス',
        'Sacred Assembly': '補助機関起動',
        'Shock(?!wave)': '放電',
        'Shockwave': '衝撃波',
        'Small Specimen': '小隕石',
        'Stardust Specimen': '隕石',
        'Starflare': 'スターフレア',
        'Super Nova': 'スーパーノヴァ',
        'Superior Stone II': '持ち上げストンラ',
        'Thunder and Error': '狙いつけサンダー',
        'Twilight Nebula': 'トワイライトネビュラ',
        'Twin Blaze': 'ツインブレイズ',
        'Vidohunir': 'ヴィゾフニル',
        'Wheel of Impregnability': 'まぼろしのわ',
        'Winds of Promyvion': '虚無の風',
      },
    },
    {
      locale: 'cn',
      replaceSync: {
        'Alexander Resurrected': '巨神重现 亚历山大',
        'Arcane Sphere': '立体魔法阵',
        'Aw\'aern': '阿瓦·艾恩',
        'Empty Thinker': '空虚思考之物',
        'Empty Wanderer': '空虚彷徨之物',
        'Empty Weeper': '空虚叹息之物',
        'Gordius System': '戈耳狄系统',
        'Hollow King': '虚无之王',
        'Medusa Swarmsinger': '军团歌者 美杜莎',
        'Memory Receptacle': '记忆容器',
        'Nemean Lion': '尼米亚猛狮',
        'Promathia': '普罗玛西亚',
        'Shantotto the Demon': '恶魔香托托',
        'Shinryu Paradox': '神龙',
        'The Dais Of Ascension': '斗舞台',
        'The Empyreal Paradox': '天象之锁',
        'The Ruin Of Light Divine': '白神之间',
      },
      replaceText: {
        '--east/west--': '--东/西--',
        '\\(buster\\)': '(死刑)',
        '\\(castbar\\)': '(咏唱栏)',
        '\\(cone\\)': '(扇形)',
        '\\(damage\\)': '(伤害)',
        '\\(explosions\\)': '(爆炸)',
        '\\(grid\\)': '(网格)',
        '\\(in/out ring\\)': '(内/外环)',
        '\\(knockback\\)': '(击退)',
        '\\(large\\)': '(大)',
        '\\(left/right\\)': '(左/右)',
        '\\(lines\\)': '(直线)',
        '\\(mid ring\\)': '(中环)',
        '\\(medium\\)': '(中)',
        '\\(out/in ring\\)': '(外/内环)',
        '\\(puddles\\)': '(圈)',
        '\\(raidwide\\)': '(全场)',
        '\\(right/left\\)': '(右/左)',
        '\\(small\\)': '(小)',
        '\\(spread\\)': '(分散)',
        '\\(spreads\\)': '(分散)',
        '\\(towers\\)': '(塔)',
        'Activate': '启动',
        'Aero Dynamics': '吹飞一切的疾风',
        'Atomic Ray': '原子射线',
        'Atomic Tail': '原子甩尾',
        'Auroral Drape': '极光帷幕',
        'Banishga IV': '强放逐IV',
        'Bastion of Twilight': '黄昏乐土',
        'Burst': '磁暴',
        'Canonize Coordinates': '坐标测算',
        'Cataclysmic Blade': '灾变之刃',
        'Cataclysmic Vortex': '灾变涡旋',
        'Celestial Trail': '天空轨迹',
        'Circuit Shock': '环状放电',
        'Circumscribed Fire': '钻环跳圈的火炎',
        'Cloak of Twilight': '黄昏披风',
        'Comet': '彗星',
        'Cosmic Breath': '宇宙吐息',
        'Cosmic Flame': '宇宙烈焰',
        'Cosmic Tail': '宇宙甩尾',
        'Dark Nova': '黑暗新星',
        'Deadly Rebirth': '魂生',
        'Diagrammatic Doorway': '展开步法阵',
        'Divine Arrow': '圣箭',
        'Divine Bolt': '圣光枪',
        'Divine Judgment': '神圣审判',
        'Divine Spear': '圣炎',
        'Earthbound Heaven': '天降露滴',
        'Electrify': '大放电',
        'Empirical Research': '实证研究',
        'Empty Beleaguer': '空围',
        'Empty Proclamation': '空虚的宣言',
        'Empty Salvation': '神歌',
        'Empty Seed': '空虚之种',
        'Explosion(?!s)': '爆炸',
        'False Genesis': '虚无世界',
        'Falling Rubble': '瓦砾掉落',
        'Final Exam': '期末考试',
        'Flare Play': '怒不可遏的核爆',
        'Fleeting Eternity': '转瞬',
        'Groundbreaking Quake': '粉身碎骨的地震',
        'Gyre Charge': '螺旋冲锋',
        'Holy Flame': '圣火',
        'Impartial Ruling': '审理之光',
        'Infernal Deliverance': '诱引',
        'Karmic Shielding': '反射防壁',
        'Large Specimen': '大陨石',
        'Left Swordscross': '左侧交错剑',
        'Localized Blizzard': '靠近乘凉的冰结',
        'Malevolent Blessing': '回天挽日',
        'Mega Holy': '百万神圣',
        'Meteor(?!ic)': '陨石',
        'Meteoric Rhyme': '怒不可遏的陨石',
        'Painful Pressure': '灭顶',
        'Perfect Defense': '绝对防御',
        'Pestilent Penance': '黄泉灶食',
        'Radiant Sacrament': '拜火圣礼',
        'Reinforcements': '支援命令',
        'Right Swordscross': '右侧交错剑',
        'Sacred Assembly': '辅助机关启动',
        'Shock(?!wave)': '放电',
        'Shockwave': '冲击波',
        'Small Specimen': '小陨石',
        'Stardust Specimen': '陨星',
        'Starflare': '星体核爆',
        'Superior Stone II': '抬升大地的坚石',
        'Super Nova': '超新星',
        'Thunder and Error': '随后紧追的闪雷',
        'Twin Blaze': '双重吐息',
        'Twilight Nebula': '黄昏星云',
        'Vidohunir': '维多夫尼尔',
        'Wheel of Impregnability': '虚幻之环',
        'Winds of Promyvion': '虚无之风',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Alexander Resurrected': '부활한 알렉산더',
        'Arcane Sphere': '신비로운 구체',
        'Empty Thinker': '허무의 사색가',
        'Empty Wanderer': '허무의 방랑자',
        'Empty Weeper': '허무의 통곡자',
        'Gordius System': '고르디우스 시스템',
        'Hollow King': '공허의 왕',
        'Memory Receptacle': '기억의 그릇',
        'Promathia': '프로마시아',
        'Shantotto the Demon': '악마 샨토토',
        'Shinryu Paradox': '신룡',
      },
      'replaceText': {
        '--east/west--': '--동/서--',
        '\\(buster\\)': '(피해)',
        '\\(castbar\\)': '(시전바)',
        '\\(cone\\)': '(부채꼴)',
        '\\(damage\\)': '(피해)',
        '\\(explosions\\)': '(폭발)',
        '\\(grid\\)': '(격자)',
        '\\(in/out ring\\)': '(안/바깥 고리)',
        '\\(knockback\\)': '(넉백)',
        '\\(large\\)': '(큼)',
        '\\(left/right\\)': '(좌/우)',
        '\\(lines\\)': '(직선)',
        '\\(mid ring\\)': '(중앙 고리)',
        '\\(medium\\)': '(중간)',
        '\\(out/in ring\\)': '(바깥/안 고리)',
        '\\(puddles\\)': '(장판)',
        '\\(raidwide\\)': '(전체공격)',
        '\\(right/left\\)': '(우/좌)',
        '\\(small\\)': '(작음)',
        '\\(spreads?\\)': '(산개)',
        '\\(towers\\)': '(탑)',
        'Activate': '기동',
        'Aero Dynamics': '날려버려 에어로',
        'Atomic Ray': '원자 파동',
        'Atomic Tail': '원자 꼬리',
        'Auroral Drape': '오로라 장막',
        'Banishga IV': '배니시 IV',
        'Bastion of Twilight': '황혼의 낙원',
        'Burst': '폭발',
        'Canonize Coordinates': '좌표 측정',
        'Cataclysmic Blade': '파멸의 칼날',
        'Cataclysmic Vortex': '파멸의 소용돌이',
        'Celestial Trail': '천계의 궤적',
        'Circumscribed Fire': '멀어지면 파이어',
        'Cloak of Twilight': '황혼 망토',
        'Comet': '혜성',
        'Cosmic Breath': '우주의 숨결',
        'Cosmic Flame': '우주 불꽃',
        'Cosmic Tail': '우주 꼬리',
        'Dark Nova': '암흑 신성',
        'Deadly Rebirth': '광포한 신령',
        'Diagrammatic Doorway': '이동 마법진 전개',
        'Divine Arrow': '성스러운 화살',
        'Divine Bolt': '성스러운 빛의 창',
        'Divine Judgment': '신성한 심판',
        'Divine Spear': '신성한 불꽃',
        'Earthbound Heaven': '하늘물방울',
        'Electrify': '대방전',
        'Empirical Research': '실증 연구',
        'Empty Beleaguer': '공허한 포위',
        'Empty Proclamation': '공허 선포',
        'Empty Salvation': '신의 노랫소리',
        'Empty Seed': '공허한 씨앗',
        'Explosion(?!s)': '폭발',
        'Falling Rubble': '파편 낙하',
        'False Genesis': '허무한 세계',
        'Final Exam': '최종 심사',
        'Flare Play': '열 받아서 플레어',
        'Fleeting Eternity': '덧없는 순간',
        'Groundbreaking Quake': '뭉개버려 퀘이크',
        'Gyre Charge': '회전 돌진',
        'Holy Flame': '성화',
        'Impartial Ruling': '판결의 빛',
        'Infernal Deliverance': '초청',
        'Karmic Shielding': '반사 방벽',
        'Large Specimen': '대운석 투하',
        'Left Swordscross': '왼쪽 사선검',
        'Localized Blizzard': '다가오면 블리자드',
        'Malevolent Blessing': '저주의 손길',
        'Mega Holy': '메가 홀리',
        'Meteor(?!ic)': '메테오',
        'Meteoric Rhyme': '열 받아서 메테오',
        'Painful Pressure': '압살',
        'Perfect Defense': '절대 방어',
        'Pestilent Penance': '불귀객',
        'Radiant Sacrament': '원형 성례',
        'Reinforcements': '지원 명령',
        'Right Swordscross': '오른쪽 사선검',
        'Sacred Assembly': '보조 기관 기동',
        'Shock(?!wave)': '방전',
        'Shockwave': '충격파',
        'Small Specimen': '소운석 투하',
        'Stardust Specimen': '운석 투하',
        'Starflare': '별의 불길',
        'Super Nova': '초신성',
        'Superior Stone II': '높이 올라 스톤라',
        'Thunder and Error': '콕 찍어 선더',
        'Twilight Nebula': '황혼 성운',
        'Twin Blaze': '이중 화염',
        'Vidohunir': '비도프니르',
        'Wheel of Impregnability': '환상의 고리',
        'Winds of Promyvion': '허무한 바람',
      },
    },
  ],
};

export default triggerSet;
