import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  ce?: string;
  demonTabletChiselTargets: string[];
  demonTabletRotationCounter: number;
  demonTabletIsFrontSide: boolean;
  demonTabletCometeor?: 'near' | 'afar';
  demonTabletCometSouthTargets: string[];
  demonTabletCometNorthTargets: string[];
  demonTabletHasMeteor: boolean;
  demonTabletMeteor?: 'north' | 'south';
  demonTabletIsFrontRight?: boolean;
  demonTabletGravityTowers?: 'north' | 'south';
  deadStarsIsSlice2: boolean;
  deadStarsSliceTargets: string[];
  deadStarsFirestrikeTargets: string[];
  deadStarsIsVengeful: boolean;
  deadStarsVengeful1: number[];
  deadStarsVengeful2: number[];
  deadStarsOozeCount: number;
  deadStarsOoze?: NetMatches['GainsEffect'];
  deadStarsWasHitByOoze: boolean;
  deadStarsWasVennDiagramed: boolean;
  deadStarsLiquifiedNereid: number[];
  deadStarsLiquifiedTriton: number[];
  deadStarsSnowballTetherDirNum?: number;
  deadStarsSnowballTetherCount: number;
  prongedPassageActLoc: { [id: string]: string };
  prongedPassageIdolCastCount: { [id: string]: number };
  marbleDragonImitationRainCount: number;
  marbleDragonImitationBlizzardCount: number;
  marbleDragonImitationRainDir?: 'east' | 'west' | 'north';
  marbleDragonTwisterClock?: 'clockwise' | 'counterclockwise';
  marbleDragonImitationRainCrosses: string[];
  marbleDragonTankbusterFilter: boolean;
  marbleDragonDelugeTargets: string[];
  marbleDragonDiveDirNum?: number;
  marbleDragonIsFrigidDive: boolean;
  marbleDragonHasWickedWater: boolean;
  magitaurCriticalBlowCount: number;
  magitaurRuneAxeDebuff?: 'big1' | 'big2' | 'small1' | 'small2';
  magitaurRuneTargets: string[];
  magitaurRuinousRuneCount: number;
  magitaurRune2Targets: string[];
  magitaurBigRune2Target?: string;
  magitaurLancelightCount: number;
  bossDir?: number;
  playerDir?: number;
}

// List of events:
// https://github.com/xivapi/ffxiv-datamining/blob/master/csv/DynamicEvent.csv
//
// These ids are (unfortunately) gathered by hand and don't seem to correlate
// to any particular bits of data.  However, there's a game log message when you
// register for a CE and an 0x21 message with this id when you accept and
// teleport in.  This avoids having to translate all of these names and also
// guarantees that the player is actually in the CE for the purpose of
// filtering triggers.
const ceIds: { [ce: string]: string } = {
  calamityBound: '32F',
  companyOfStone: '343',
  crawlingDeath: '330',
  cursedConcern: '32B',
  eternalWatch: '329',
  flameOfDusk: '32A',
  fromTimesBygone: '323',
  noiseComplaint: '327',
  onTheHunt: '338',
  scourgeOfTheMind: '320',
  sharkAttack: '32E',
  theBlackRegiment: '322',
  theUnbridled: '348',
  trialByClaw: '349',
  withExtremePredjudice: '339',
  demonTablet: '33B',
  centralGallery: '33F',
  deadStars: '33C',
  upperExterior: '340',
  marbleDragon: '33D',
  bindingLock: '341',
  infamyOfBloodMagitaur: '33E',
};

const headMarkerData = {
  // Demon Tablet Occult Chisel tankbuster aoe marker
  'demonTabletTankbuster': '01F1',
  // Demon Tablet Portentous Comet Stack + Launch North marker
  'demonTabletLaunchNorthStack': '023E',
  // Demon Tablet Portentous Comet Stack + Launch South marker
  'demonTabletLaunchSouthStack': '023F',
  // Dead Stars boss tethers to each other
  'deadStarsTether': '0136',
  // Dead Stars boss tethers
  'deadStarsBossTether': '00F9',
  // Dead Stars Slice 'n' Dice tankbuster cleave
  'deadStarsTankbuster': '01D7',
  // Dead Stars Avalaunch Proximity Stack
  'deadStarsAvalaunchStack': '0064',
  // Dead Stars snowball spike tether
  'deadStarsSnowballTether': '00F6',
  // Dead Stars snowball tether
  'deadStarsSnowballTether2': '0001',
  // Dead Stars Avalaunch Stack
  // Tower Progenitor and Tower Progenitrix Punishing Pounce Stack
  // Magitaur Holy IV Stack
  'prongedPassageStack': '0064',
  // Marble Dragon tankbuster from Dread Deluge
  // Neo Garula tankbuster from Squash in Noise Complaint CE
  // Hinkypunk tankbuster from Dread Dive in Flame of Dusk CE
  // Death Claw tankbuster from Dirty Nails in Crawling Death CE
  // Repaired Lion tankbuster from Scratch in Eternal Watch CE
  // Mysterious Mindflayer tankbuster from Void Thunder III in Scourge of the Mind CE
  // Crescent Inkstain tankbuster from Amorphic Flail
  // Crescent Karlabos tankbuster from Wild Claw
  // Crescent Fan tankbuster from Tight Tornado
  'marbleDragonTankbuster': '00DA',
  // Marble Dragon red pinwheel markers from Wicked Water
  'marbleDragonWickedWater': '0017',
  // Magitaur big red pinwheel marker from Ruinous Rune (A251)
  'magitaurBigRuinousRune': '023D',
  // Magiatur small red pinwheel markers from Ruinous Rune (A250)
  'magitaurSmallRuinousRune': '0159',
} as const;

// Occult Crescent Forked Tower: Blood Demon Tablet consts
// const demonTabletCenterX = 700;
const demonTabletCenterY = 379;

// Function to find safe spot for summoned statues
const demonTabletFindGravityCorner = (
  x: number,
  y: number,
): boolean | undefined => {
  if (x > 687 && x < 689) {
    if ((y > 351 && y < 353) || (y > 394.5 && y < 396.5))
      return true;
    if ((y > 361.5 && y < 363.5) || (y > 387 && y < 389))
      return false;
  } else if (x > 711 && x < 713) {
    if ((y > 361.5 && y < 363.5) || (y > 405 && y < 407))
      return true;
    if ((y > 369 && y < 371) || (y > 394.5 && y < 396.5))
      return false;
  }
  return undefined;
};

// Occult Crescent Forked Tower: Blood Dead Stars consts
const deadStarsCenterX = -800;
const deadStarsCenterY = 360;
const deadStarsRedEffectId = '1159';
const deadStarsBlueEffectId = '115A';
const deadStarsRedHitId = 'A5E3';
const deadStarsBlueHitId = 'A5E4';
const deadStarsOutputStrings = {
  lineStacksOnPlayers: {
    en: 'Line Stacks on ${player1}, ${player2}, ${player3}',
  },
  lineStackOnYouTankCleave: {
    en: 'Line Stack on YOU, Avoid Tank Cleave',
  },
  lineStackOnYou: {
    en: 'Line Stack on YOU',
    de: 'Linien Stack auf DIR',
    fr: 'Package en ligne sur VOUS',
    ja: '直線頭割り',
    cn: '直线分摊点名',
    ko: '직선 쉐어 대상자',
  },
};

// Function to find a safe spot in Primordial Chaos
// Expected inputs are the dirNums of two oozes
const deadStarsFindSafeSpot = (
  ooze1: number,
  ooze2: number,
): number => {
  // Filter from map of valid ooze locations where oozes are
  const safeDirNums = [1, 3, 5, 7].filter(
    (dirNum) => {
      return dirNum !== ooze1 && dirNum !== ooze2;
    },
  );
  const safe1 = safeDirNums[0];
  const safe2 = safeDirNums[1];
  if ((safe1 === 7 && safe2 === 1) || (safe1 === 1 && safe2 === 7))
    return 0; // North
  if ((safe1 === 1 && safe2 === 3) || (safe1 === 3 && safe2 === 1))
    return 2; // East
  if ((safe1 === 3 && safe2 === 5) || (safe1 === 5 && safe2 === 3))
    return 4; // South
  if ((safe1 === 5 && safe2 === 7) || (safe1 === 7 && safe2 === 5))
    return 6; // West
  if ((safe1 === 3 && safe2 === 7) || (safe1 === 7 && safe2 === 3))
    return 3; // Also northwest
  if ((safe1 === 1 && safe2 === 5) || (safe1 === 5 && safe2 === 1))
    return 1; // Also southwest
  return -1;
};
// Used with deadStarsFindSafeSpot to map to longform direction
const deadStarsMapOutput = [
  'north',
  'northeast',
  'east',
  'southeast',
  'south',
  'southwest',
  'west',
  'northwest',
  'unknown',
];

// Occult Crescent Forked Tower: Pronged Passage consts
const prongedPassageCenterY = 315;

// Occult Crescent Forked Tower: Marble Dragon consts
const marbleDragonCenterX = -337;
const marbleDragonCenterY = 157;

// Function to find and validate a puddle location during Imitation Rain 2
const getPuddleLocation = (
  x: number,
  y: number,
): 'NE' | 'SE' | 'SW' | 'NW' | 'center' | undefined => {
  if (x > -338 && x < -336)
    return 'center';
  // East side puddles
  if (x > -322 && x < -319) {
    if (y > 140 && y < 142)
      return 'NE';
    if (y > 172 && y < 174)
      return 'SE';
  }
  // West side puddles
  if (x > -354 && x < -352) {
    if (y > 140 && y < 142)
      return 'NW';
    if (y > 172 && y < 174)
      return 'SW';
  }
  return undefined;
};

// Occult Crescent Forked Tower: Magitaur consts
const magitaurOutputStrings = {
  rune1BigAoeOnYou: {
    en: 'Big AOE on YOU, Go to Wall by Purple Circle',
  },
  rune1SmallAoeOnYou: {
    en: 'Small aoe on YOU, Stay Square => Between Squares',
  },
  rune1BigAoeOnPlayer: {
    en: 'Big AOE on ${player}, Be on Square',
  },
  rune1SmallAoesOnPlayers: {
    en: 'Small aoes on ${player1}, ${player2}, ${player3}',
  },
  rune1SmallAoEStayThenIn: {
    en: 'Stay for AOE => In, Between Squares',
  },
  rune2BigAoeOnYouLater: {
    en: 'Big AOE on YOU (Later)',
  },
  rune2SmallAoeOnYouLater: {
    en: 'Small aoe on YOU (Later)',
  },
  rune2InBigAoeOnYou: {
    en: 'In, Between Squares => To Wall',
  },
  rune2InSmallAoeOnYou: {
    en: 'In, Between Squares => Solo Square',
  },
  rune2AoesOnPlayers: {
    en: 'AOEs on ${player1}, ${player2}, ${player3}',
  },
  rune2AvoidPlayers: {
    en: 'On Square, Avoid ${player1} & ${player2}',
  },
  rune2SmallAoeOnYouReminder: {
    en: 'Small aoe on YOU, Be on Square (Solo)',
  },
  rune2BigAoeOnYouReminder: {
    en: 'Big AOE on YOU, Go to Wall by Purple Circle',
  },
  inThenOnSquare: {
    en: 'In, between Squares => On Square',
  },
  northeastOff: {
    en: 'Northeast Off',
  },
  northeastOn: {
    en: 'Northeast On',
  },
  southOff: {
    en: 'South Off',
  },
  southOn: {
    en: 'South On',
  },
  northwestOff: {
    en: 'Northwest Off',
  },
  out: {
    en: 'Out, Square Corner',
  },
  in: {
    en: 'In, between Squares',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentSouthHorn',
  zoneId: ZoneId.TheOccultCrescentSouthHorn,
  comments: {
    en: 'Occult Crescent South Horn critical encounter triggers/timeline.',
    de: 'Kreszentia Südexpedition kritische Begegnungen Triggers/Timeline.',
    cn: '蜃景幻界新月岛 南征之章 紧急遭遇战 触发器/时间轴。',
    ko: '초승달 섬: 남부편 비상 조우 트리거/타임라인',
  },
  config: [
    {
      id: 'demonTabletRotation',
      name: {
        en: 'Forked Tower: Blood Demon Tablet Rotation Strategy',
      },
      type: 'select',
      options: {
        en: {
          'Less movement by calling direction to go around instead of get behind.': 'optimization',
          'Early movement with get behind calls.': 'none',
        },
      },
      default: 'none',
    },
    {
      id: 'marbleDragonImitationRainStrategy',
      name: {
        en: 'Forked Tower: Blood Marble Dragon Imitation Rain 1 and 5 Strategy',
      },
      type: 'select',
      options: {
        en: {
          'Cross-based: Calls based on southern cross puddle.': 'cross',
          'Ice-based: Calls based on Ice Puddle nearest to wall.': 'ice',
        },
      },
      default: 'cross',
    },
    {
      id: 'magitaurDaggers',
      name: {
        en: 'Forked Tower: Blood Magitaur Dagger Strategy',
      },
      type: 'select',
      options: {
        en: {
          'BAP Daggers (Number and Letter Floor Markers)': 'bap',
          'No strategy (Y-Pattern and ⅄-Pattern)': 'none',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'occult_crescent_south_horn.txt',
  initData: () => ({
    demonTabletChiselTargets: [],
    demonTabletRotationCounter: 0,
    demonTabletIsFrontSide: true,
    demonTabletCometSouthTargets: [],
    demonTabletCometNorthTargets: [],
    demonTabletHasMeteor: false,
    deadStarsIsSlice2: false,
    deadStarsSliceTargets: [],
    deadStarsFirestrikeTargets: [],
    deadStarsIsVengeful: false,
    deadStarsVengeful1: [],
    deadStarsVengeful2: [],
    deadStarsOozeCount: 0,
    deadStarsWasHitByOoze: false,
    deadStarsWasVennDiagramed: false,
    deadStarsLiquifiedNereid: [],
    deadStarsLiquifiedTriton: [],
    deadStarsSnowballTetherCount: 0,
    prongedPassageActLoc: {},
    prongedPassageIdolCastCount: {
      'north': 0,
      'south': 0,
    },
    marbleDragonImitationRainCount: 0,
    marbleDragonImitationBlizzardCount: 0,
    marbleDragonImitationRainCrosses: [],
    marbleDragonTankbusterFilter: false,
    marbleDragonDelugeTargets: [],
    marbleDragonIsFrigidDive: false,
    marbleDragonHasWickedWater: false,
    magitaurCriticalBlowCount: 0,
    magitaurRuneTargets: [],
    magitaurRuinousRuneCount: 0,
    magitaurRune2Targets: [],
    magitaurLancelightCount: 0,
  }),
  resetWhenOutOfCombat: false,
  timelineTriggers: [
    {
      id: 'Occult Crescent Marble Dragon Draconiform Motion Bait',
      // Usually we would use a 7s beforeSeconds value, however 6.3s avoids needing to create a second trigger to delay bait calls for an ice-based strategy
      // and maintains consistency between the Draconiform Motion baits throughout the fight and strategy selection
      regex: /Draconiform Motion/,
      beforeSeconds: 6.3,
      alertText: (data, _matches, output) => {
        if (
          data.marbleDragonImitationRainDir !== undefined &&
          data.marbleDragonImitationRainCount < 6
        )
          return output.baitCleaveThenDir!({
            dir: output[data.marbleDragonImitationRainDir]!(),
          });
        if (data.marbleDragonImitationRainCount >= 6) {
          if (data.marbleDragonTwisterClock === 'clockwise')
            return output.baitCleaveThenDir!({
              dir: output.northSouth!(),
            });
          if (data.marbleDragonTwisterClock === 'counterclockwise')
            return output.baitCleaveThenDir!({
              dir: output.eastWest!(),
            });
        }
        return output.baitCleave!();
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        eastWest: {
          en: 'East/West',
        },
        northSouth: {
          en: 'North/South',
        },
        baitCleave: {
          en: 'Bait Cleave',
        },
        baitCleaveThenDir: {
          en: 'Bait Cleave => ${dir}',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Rune Axe Square Position',
      // Debuffs are based on proximity to squares
      regex: /Rune Axe/,
      beforeSeconds: 7,
      alertText: (_data, _matches, output) => output.squarePosition!(),
      outputStrings: {
        squarePosition: {
          en: 'Rune Axe Square Position',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Holy Lance Square Position',
      // Debuffs are based on proximity to squares
      regex: /Holy Lance/,
      beforeSeconds: 7,
      alertText: (_data, _matches, output) => output.squarePosition!(),
      outputStrings: {
        squarePosition: {
          en: 'Holy Lance Square Position',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'Occult Crescent Critical Encounter',
      type: 'ActorControl',
      netRegex: { command: '80000014' },
      run: (data, matches) => {
        // This fires when you win, lose, or teleport out.
        if (matches.data0 === '00') {
          if (data.ce !== undefined && data.options.Debug)
            console.log(`Stop CE: ${data.ce}`);
          // Stop any active timelines.
          data.StopCombat();
          // Prevent further triggers for any active CEs from firing.
          delete data.ce;
          return;
        }

        delete data.ce;
        const ceId = matches.data0.toUpperCase();
        for (const key in ceIds) {
          if (ceIds[key] === ceId) {
            if (data.options.Debug)
              console.log(`Start CE: ${key} (${ceId})`);
            data.ce = key;
            return;
          }
        }

        if (data.options.Debug)
          console.log(`Start CE: ??? (${ceId})`);
      },
    },
    {
      id: 'Occult Crescent Forked Tower: Blood Clear Data',
      type: 'SystemLogMessage',
      // "is no longer sealed"
      netRegex: { id: '7DE', capture: false },
      run: (data) => {
        delete data.demonTabletIsFrontRight;
        delete data.demonTabletCometeor;
        delete data.demonTabletMeteor;
        delete data.demonTabletGravityTowers;
        delete data.deadStarsOoze;
        delete data.deadStarsSnowballTetherDirNum;
        delete data.marbleDragonImitationRainDir;
        delete data.marbleDragonTwisterClock;
        delete data.marbleDragonDiveDirNum;
        delete data.magitaurRuneAxeDebuff;
        delete data.magitaurBigRune2Target;
        delete data.bossDir;
        delete data.playerDir;
        data.demonTabletChiselTargets = [];
        data.demonTabletRotationCounter = 0;
        data.demonTabletIsFrontSide = true;
        data.demonTabletCometSouthTargets = [];
        data.demonTabletCometNorthTargets = [];
        data.demonTabletHasMeteor = false;
        data.deadStarsIsSlice2 = false;
        data.deadStarsSliceTargets = [];
        data.deadStarsFirestrikeTargets = [];
        data.deadStarsIsVengeful = false;
        data.deadStarsVengeful1 = [];
        data.deadStarsVengeful2 = [];
        data.deadStarsOozeCount = 0;
        data.deadStarsWasHitByOoze = false;
        data.deadStarsWasVennDiagramed = false;
        data.deadStarsLiquifiedNereid = [];
        data.deadStarsLiquifiedTriton = [];
        data.deadStarsSnowballTetherCount = 0;
        data.prongedPassageActLoc = {};
        data.prongedPassageIdolCastCount = {
          'north': 0,
          'south': 0,
        };
        data.marbleDragonImitationRainCount = 0;
        data.marbleDragonImitationBlizzardCount = 0;
        data.marbleDragonImitationRainCrosses = [];
        data.marbleDragonTankbusterFilter = false;
        data.marbleDragonDelugeTargets = [];
        data.marbleDragonIsFrigidDive = false;
        data.marbleDragonHasWickedWater = false;
        data.magitaurCriticalBlowCount = 0;
        data.magitaurRuneTargets = [];
        data.magitaurRuinousRuneCount = 0;
        data.magitaurRune2Targets = [];
        data.magitaurLancelightCount = 0;
      },
    },
    {
      id: 'Occult Crescent Cloister Demon Tidal Breath',
      type: 'StartsUsing',
      netRegex: { source: 'Cloister Demon', id: 'A190', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Berserker Scathing Sweep',
      type: 'StartsUsing',
      netRegex: { source: 'Crescent Berserker', id: 'A6C3', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Hinkypunk Dread Dive',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: 'A1A4', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Nest',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19C', 'A19D', 'A430', 'A431'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIn(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Shades Crossing',
      type: 'StartsUsing',
      // TODO: Some of these are from boss, some are not.
      netRegex: { source: 'Hinkypunk', id: ['A19F', 'A1A0', 'A432', 'A433'], capture: true },
      suppressSeconds: 1,
      response: Responses.getIntercards(),
      run: (_data, matches) => console.log(`Shades Nest: ${matches.id}`),
    },
    {
      id: 'Occult Crescent Hinkypunk Lamplight',
      type: 'StartsUsing',
      netRegex: { source: 'Hinkypunk', id: ['A1A5', 'A310'], capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Black Star Choco Windstorm',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BB', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Black Star Choco Cyclone',
      type: 'StartsUsing',
      netRegex: { source: 'Black Star', id: 'A0BC', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Occult Crescent Neo Garula Squash',
      type: 'StartsUsing',
      netRegex: { source: 'Neo Garula', id: 'A0E5', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Lion Rampant Fearsome Glint',
      type: 'StartsUsing',
      netRegex: { source: 'Lion Rampant', id: 'A1C3', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Death Claw Dirty Nails',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A174', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Death Claw Grip of Poison',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: 'A175', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'Occult Crescent Death Claw Vertical Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16B', 'A172'], capture: false },
      response: Responses.getSidesThenFrontBack('alert'),
    },
    {
      id: 'Occult Crescent Death Claw Horizontal Crosshatch',
      type: 'StartsUsing',
      netRegex: { source: 'Death Claw', id: ['A16C', 'A173'], capture: false },
      response: Responses.getFrontBackThenSides('alert'),
    },
    {
      id: 'Occult Crescent Repaired Lion Holy Blaze',
      type: 'StartsUsing',
      netRegex: { source: 'Repaired Lion', id: 'A151', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Repaired Lion Scratch',
      type: 'StartsUsing',
      netRegex: { source: 'Repaired Lion', id: 'A155', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Occult Crescent Nymian Petalodus Hydrocleave',
      type: 'StartsUsing',
      netRegex: { source: 'Nymian Petalodus', id: 'A88D', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Demon Tablet Demonic Dark II',
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A306', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Demon Tablet Ray of Dangers Near/Expulsion Afar',
      // A2F3 Ray of Dangers Near
      // A2F4 Ray of Expulsion Afar
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2F3', 'A2F4'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A2F3')
          return output.out!();
        return output.inKnockback!();
      },
      outputStrings: {
        out: Outputs.out,
        inKnockback: {
          en: 'In => Knockback',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Ray of Expulsion Afar Knockback',
      // 10s castTime
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A2F4', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Demon Tablet Occult Chisel',
      // Boss' top three targets targeted with A308 Occult Chisel aoe tankbuster
      // A307 Occult Chisel castbar associated
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.demonTabletTankbuster], capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankbustersOnPlayers: {
            en: 'Tankbusters on ${player1}, ${player2}, ${player3}',
          },
          tankBusterOnYou: Outputs.tankBusterOnYou,
        };
        data.demonTabletChiselTargets.push(matches.target);
        if (data.demonTabletChiselTargets.length < 3)
          return;

        const target1 = data.demonTabletChiselTargets[0];
        const target2 = data.demonTabletChiselTargets[1];
        const target3 = data.demonTabletChiselTargets[2];
        if (data.me === target1 || data.me === target2 || data.me === target3)
          return { alertText: output.tankBusterOnYou!() };

        return {
          infoText: output.tankbustersOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        if (data.demonTabletChiselTargets.length === 3)
          data.demonTabletChiselTargets = [];
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Demonograph of Dangears Near/Expulsion Afar',
      // A2F6 Demonograph of Dangers Near
      // A2F7 Demonograph of Expulsion Afar
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2F6', 'A2F7'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A2F6')
          return output.out!();
        return output.inKnockback!();
      },
      outputStrings: {
        out: Outputs.out,
        inKnockback: {
          en: 'In => Knockback',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Demonograph of Expulsion Afar Knockback',
      // 10s castTime
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A2F7', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Demon Tablet Rotate Left/Right',
      // A302 Rotate Left
      // A301 Rotate Right
      // Configurable to use an optimization callout, skipping get behind calls
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A302', 'A301'], capture: true },
      promise: async (data, matches) => {
        // Only check if in front/behind for first rotation
        if (data.demonTabletRotationCounter % 2)
          return;
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Rotate Left/Right: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Rotate Left/Right: Wrong actor count ${actors.length}`,
          );
          return;
        }
        const bossDirNum = Directions.hdgTo4DirNum(actor.Heading);
        const getSide = (
          y: number,
        ): number => {
          // First Rotation is always N or S
          // N Platform
          if (y < demonTabletCenterY)
            return 0;
          // S Platform
          if (y > demonTabletCenterY)
            return 2;

          return -1;
        };
        const playerDirNum = getSide(me.PosY);
        data.demonTabletIsFrontSide = (playerDirNum === bossDirNum)
          ? true
          : false;
      },
      alertText: (data, matches, output) => {
        // First Rotation
        if (!(data.demonTabletRotationCounter % 2)) {
          if (
            data.demonTabletIsFrontSide &&
            data.triggerSetConfig.demonTabletRotation !== 'optimization'
          ) {
            if (matches.id === 'A301')
              return output.leftThenGetBehind!();
            return output.rightThenGetBehind!();
          }
          if (matches.id === 'A301')
            return output.left!();
          return output.right!();
        }

        // Second Rotation
        if (
          data.demonTabletIsFrontSide &&
          data.triggerSetConfig.demonTabletRotation === 'optimization'
        ) {
          // Optimization callout since it is faster to go with boss direction
          if (matches.id === 'A301')
            return output.goRightAround!();
          return output.goLeftAround!();
        }
        // Reminders to be behind
        if (matches.id === 'A301')
          return output.leftBehind!();
        return output.rightBehind!();
      },
      run: (data) => {
        data.demonTabletRotationCounter = data.demonTabletRotationCounter + 1;
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        leftBehind: {
          en: 'Left (Behind Boss)',
        },
        rightBehind: {
          en: 'Right (Behind Boss)',
        },
        leftThenGetBehind: {
          en: 'Left => Get Behind',
        },
        rightThenGetBehind: {
          en: 'Right => Get Behind',
        },
        goRightAround: {
          en: 'Go Right and Around',
        },
        goLeftAround: {
          en: 'Go Left and Around',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Cometeor of Dangers Near/Expulsion Afar',
      // A2E4 Cometeor of Dangers Near
      // A2E5 Cometeor of Expulsion Afar
      // This cast happens about 0.1s before players are marked with comets
      // Around the time of the cast, there is a 261 log line for a combatant added in memory
      // BNpcID 2014582 combatant is responsible for the meteor ground marker
      // Two possible locations:
      // (700, 349) => North
      // (700, 409) => South
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2E4', 'A2E5'], capture: true },
      preRun: (data, matches) => {
        data.demonTabletCometeor = matches.id === 'A2E4' ? 'near' : 'afar';
      },
      delaySeconds: 0.5, // Delayed to retreive comet data and meteor data
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const meteors = actors.filter((c) => c.BNpcID === 2014582);
        const meteor = meteors[0];
        if (meteor === undefined || meteors.length !== 1) {
          console.error(
            `Occult Crescent Demon Tablet Cometeor of Dangers Near/Expulsion Afar: Wrong meteor count ${meteors.length}`,
          );
          return;
        }
        if (meteor.PosY === 349) {
          data.demonTabletMeteor = 'north';
        } else if (meteor.PosY === 409)
          data.demonTabletMeteor = 'south';
      },
      alertText: (data, matches, output) => {
        // Do not call for those with comets
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return;

        const mech = matches.id === 'A2E4' ? 'out' : 'inKnockback';
        const getDir = (
          hasMeteor: boolean,
          meteorDir?: 'north' | 'south',
        ): string => {
          if (meteorDir !== undefined) {
            if (hasMeteor)
              return meteorDir;
            if (meteorDir === 'north')
              return 'south';
            if (meteorDir === 'south')
              return 'north';
          }
          return 'unknown';
        };

        // Flip direction if we don't have meteor
        const dir = getDir(data.demonTabletHasMeteor, data.demonTabletMeteor);

        if (dir === 'unknown') {
          if (data.demonTabletHasMeteor)
            return output.hasMeteorMech!({ mech: output[mech]!() });
          return output[mech]!();
        }

        if (data.demonTabletHasMeteor)
          return output.hasMeteorDirMech!({ dir: output[dir]!(), mech: output[mech]!() });
        return output.dirMech!({ dir: output[dir]!(), mech: output[mech]!() });
      },
      run: (data) => {
        // Clear comet targets for Cometeor 2
        if (
          data.demonTabletCometNorthTargets.length === 2 &&
          data.demonTabletCometSouthTargets.length === 2
        ) {
          data.demonTabletCometNorthTargets = [];
          data.demonTabletCometSouthTargets = [];
        }
      },
      outputStrings: {
        north: Outputs.north,
        south: Outputs.south,
        out: Outputs.out,
        inKnockback: {
          en: 'In => Knockback',
        },
        dirMech: {
          en: '${dir} & ${mech}',
        },
        hasMeteorMech: {
          en: 'Meteor on YOU, ${mech}',
        },
        hasMeteorDirMech: {
          en: 'Meteor on YOU, Go ${dir} & ${mech}',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Cometeor of Dangers Near/Expulsion Afar Knockback',
      // 10s castTime
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A2E5', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Demon Tablet Crater Later Gains Effect',
      // Players targeted by meteor get an unlogged headmarker and Crater Later (1102) 12s debuff
      // These apply about 0.1s after Cometeor cast
      type: 'GainsEffect',
      netRegex: { effectId: '1102', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => {
        data.demonTabletHasMeteor = true;
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Crater Later Loses Effect',
      // Clear state for second set
      type: 'LosesEffect',
      netRegex: { effectId: '1102', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 6, // Time until Portentous Comet (stack launcher) completed
      run: (data) => {
        data.demonTabletHasMeteor = false;
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Portentous Comet',
      // Headmarkers associated with casts A2E8 Portentous Comet
      // TODO: Reminder call for stack markers to move away or towards boss?
      // Note: Reset of target collectors happens in Cometeor trigger
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData.demonTabletLaunchSouthStack,
          headMarkerData.demonTabletLaunchNorthStack,
        ],
        capture: true,
      },
      condition: (data, matches) => {
        // Gather data for four players before continuing
        if (matches.id === headMarkerData.demonTabletLaunchSouthStack)
          data.demonTabletCometSouthTargets.push(matches.target);
        if (matches.id === headMarkerData.demonTabletLaunchNorthStack)
          data.demonTabletCometNorthTargets.push(matches.target);
        if (
          data.demonTabletCometNorthTargets.length === 2 &&
          data.demonTabletCometSouthTargets.length === 2
        )
          return true;
        return false;
      },
      delaySeconds: (data) => {
        // Delay for those without stack markers to avoid conflict with meteor/cross calls
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return 0;

        // castTime of Cometeor of Dangers Near / Expulsion Afar
        // Boss lands at this time, locking in the stack players to their perspective sides
        return 9.7;
      },
      durationSeconds: (data) => {
        // Additional duration for those who received call early
        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (
          data.me === north1 || data.me === north2 ||
          data.me === south1 || data.me === south2
        )
          return 16.7; // castTime of Portentous Comet
        return 7; // Time between Cometeor cast end and Portentous Comet end
      },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          stackLaunchTowardsBoss: {
            en: 'Stack, Launch towards Boss',
          },
          stackLaunchOverBoss: {
            en: 'Stack, Launch over Boss',
          },
          goNorthOutStackOnYou: {
            en: 'Go North Out => Stack Launch Marker on You',
          },
          goNorthInStackOnYou: {
            en: 'Go North In (Knockback) => Stack Launch Marker on You',
          },
          goSouthOutStackOnYou: {
            en: 'Go South Out => Stack Launch Marker on You',
          },
          goSouthInStackOnYou: {
            en: 'Go South In (Knockback) => Stack Launch Marker on You',
          },
        };

        const north1 = data.demonTabletCometNorthTargets[0];
        const north2 = data.demonTabletCometNorthTargets[1];
        const south1 = data.demonTabletCometSouthTargets[0];
        const south2 = data.demonTabletCometSouthTargets[1];
        if (data.me === north1 || data.me === north2) {
          if (data.demonTabletCometeor === 'near')
            return { alertText: output.goSouthOutStackOnYou!() };
          return { alertText: output.goSouthInStackOnYou!() };
        }
        if (data.me === south1 || data.me === south2) {
          if (data.demonTabletCometeor === 'near')
            return { alertText: output.goNorthOutStackOnYou!() };
          return { alertText: output.goNorthInStackOnYou!() };
        }

        if (data.demonTabletHasMeteor)
          return { alertText: output.stackLaunchOverBoss!() };
        return { infoText: output.stackLaunchTowardsBoss!() };
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Summon',
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'A30D', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Add Positions and Out',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity Towers Collect',
      // Only need to collect Explosion A2F1 or A2EF
      type: 'StartsUsingExtra',
      netRegex: { id: 'A2F1', capture: true },
      suppressSeconds: 1,
      run: (data, matches) => {
        const y = parseFloat(matches.y);
        if (y < demonTabletCenterY) {
          data.demonTabletGravityTowers = 'north';
          return;
        }
        data.demonTabletGravityTowers = 'south';
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity of Dangears Near/Expulsion Afar',
      // A2EA Gravity of Dangers Near
      // AA01 Gravity of Expulsion Afar
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2EA', 'AA01'], capture: true },
      alertText: (data, matches, output) => {
        const towers = (data.demonTabletGravityTowers === 'north')
          ? output.north!()
          : (data.demonTabletGravityTowers === 'south')
          ? output.south!()
          : undefined;
        if (matches.id === 'A2EA') {
          if (towers !== undefined)
            return output.dirOutThenTowers!({ dir: towers });
          return output.goTowerSideOut!();
        }
        if (towers !== undefined)
          return output.dirInThenTowers!({ dir: towers });
        return output.goTowerSideOut!();
      },
      outputStrings: {
        north: Outputs.north,
        south: Outputs.south,
        dirOutThenTowers: {
          en: '${dir} Out => Towers',
        },
        goTowerSideOut: {
          en: 'Go Towers Side and Out',
        },
        dirInThenTowers: {
          en: '${dir} In => Knockback => Towers',
        },
        goTowerSideIn: {
          en: 'Go Towers Side and In => Knockback',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity of Dangears Near/Expulsion Afar Knockback',
      // 10s castTime
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: 'AA01', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Demon Tablet Erase Gravity Safe Corner (Early)',
      // The statues are added ~0.1s before Summon (A2E9) cast
      // BNpcID 2014581 combatants are responsible for the statues
      // The combatants are still invisible for ~5s when the data is available
      type: 'StartsUsing',
      netRegex: { id: 'A2E9', capture: false },
      delaySeconds: 0.5, // Need some delay for latency
      durationSeconds: 21, // Time until tower => safe corner call
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const statues = actors.filter((c) => c.BNpcID === 2014581);
        if (statues === undefined || statues.length !== 4) {
          console.error(
            `Occult Crescent Demon Tablet Summon Statue Locations: Wrong statue count ${statues.length}`,
          );
          return;
        }
        if (statues[0] === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Summon Statue Locations: Invalid statue data.`,
          );
          return;
        }
        // Only need to examine one statue
        const statue = statues[0];
        const x = statue.PosX;
        const y = statue.PosY;

        data.demonTabletIsFrontRight = demonTabletFindGravityCorner(x, y);
        if (data.demonTabletIsFrontRight === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Statue Locations: Unrecognized coordinates (${x}, ${y})`,
          );
        }
      },
      infoText: (data, _matches, output) => {
        if (data.demonTabletIsFrontRight === undefined)
          return;
        return data.demonTabletIsFrontRight
          ? output.frontRightLater!()
          : output.backLeftLater!();
      },
      outputStrings: {
        frontRightLater: {
          en: 'Front Right (Later)',
        },
        backLeftLater: {
          en: 'Back Left (Later)',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Erase Gravity Collect',
      // This re-updates the values and is a backup in case the early call fails
      // Statues cast Erase Gravity, which sends them and anyone near up in the air
      // Boss casts Restore Gravity which will cause the statues and players to fall back down
      // Statues falling down trigger aoes
      // Players could be on either side, dependent on where the towers were
      // Pattern 1: (Front right safe)
      // (688, 352)
      //            (712, 362.5)
      //
      // ----- Boss -----
      //
      // (688, 395.5)
      //            (712, 406)
      // Pattern 2: (Back left safe)
      //
      // (688, 362.5)
      //             (712, 370)
      // ----- Boss -----
      // (688, 388)
      //             (712, 395.5)
      //
      // Data from StartsUsing is inaccurate, but the Extra lines are close enough
      type: 'StartsUsingExtra',
      netRegex: { id: 'A2EB', capture: true },
      suppressSeconds: 1,
      run: (data, matches) => {
        // Only need to examine one statue
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        data.demonTabletIsFrontRight = demonTabletFindGravityCorner(x, y);

        // Log error for unrecognized coordinates
        if (data.demonTabletIsFrontRight === undefined) {
          console.error(
            `Occult Crescent Demon Tablet Erase Gravity Collect: Unrecognized coordinates (${x}, ${y})`,
          );
        }
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity/Ground Towers',
      // Some players need to go to statues for levitate at this point
      type: 'StartsUsing',
      netRegex: { source: 'Demon Tablet', id: ['A2EA', 'AA01'], capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      infoText: (data, _matches, output) => {
        const corner = data.demonTabletIsFrontRight === undefined
          ? output.safeCorner!()
          : data.demonTabletIsFrontRight
          ? output.frontRight!()
          : output.backLeft!();

        return output.towersThenSafeSpot!({ towers: output.getTowers!(), corner: corner });
      },
      outputStrings: {
        towersThenSafeSpot: {
          en: '${towers} => ${corner}',
        },
        getTowers: Outputs.getTowers,
        frontRight: {
          en: 'Front Right',
          de: 'Vorne Rechts',
          fr: 'Avant Droit',
          ja: '前右',
          cn: '右前',
          ko: '앞 오른쪽',
        },
        backLeft: {
          en: 'Back Left',
          de: 'Hinten Links',
          fr: 'Arrière Gauche',
          ja: '後左',
          cn: '左后',
          ko: '뒤 왼쪽',
        },
        safeCorner: {
          en: 'Safe Corner',
        },
      },
    },
    {
      id: 'Occult Crescent Demon Tablet Gravity/Ground Tower Explosion',
      // This could also capture the Unmitigated Explosion that happens 2.1s later, however
      // if there aren't any towers resolved it's probably a wipe
      type: 'Ability',
      netRegex: { source: 'Demon Tablet', id: ['A2F1', 'A2EF'], capture: false },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.demonTabletIsFrontRight === undefined)
          return output.avoidFallingStatues!();
        if (data.demonTabletIsFrontRight)
          return output.frontRight!();
        return output.backLeft!();
      },
      outputStrings: {
        avoidFallingStatues: {
          en: 'Avoid Falling Statues',
        },
        frontRight: {
          en: 'Front Right',
          de: 'Vorne Rechts',
          fr: 'Avant Droit',
          ja: '前右',
          cn: '右前',
          ko: '앞 오른쪽',
        },
        backLeft: {
          en: 'Back Left',
          de: 'Hinten Links',
          fr: 'Arrière Gauche',
          ja: '後左',
          cn: '左后',
          ko: '뒤 왼쪽',
        },
      },
    },
    {
      id: 'Occult Crescent Tower Manticore Left/Right Hammer',
      // Needs to be slowed by slowed by Time Mage or it is 4.2s into a 0.7s followup
      // Can be out-ranged as well
      // A7BF Left Hammer (7.8s with Slow)
      // A7C0 Right Hammer (7.8s with Slow)
      // A7E6 Left Hammer (1.5s followup with Slow)
      // A7E7 Right Hammer (1.5s followup with Slow)
      type: 'StartsUsing',
      netRegex: { source: 'Tower Manticore', id: ['A7BF', 'A7C0'], capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'A7BF')
          return output.rightThenLeft!();
        return output.leftThenRight!();
      },
      outputStrings: {
        leftThenRight: Outputs.leftThenRight,
        rightThenLeft: Outputs.rightThenLeft,
      },
    },
    {
      id: 'Occult Crescent Tower Manticore Left/Right Hammer Followup',
      // Cast bar can be interrupted leading to extra calls if using castTime
      type: 'Ability',
      netRegex: { source: 'Tower Manticore', id: ['A7BF', 'A7C0'], capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) => {
        if (matches.id === 'A7BF')
          return output.left!();
        return output.right!();
      },
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Decisive Battle',
      // Each boss targets ground, avoid getting hit by more than one aoe
      // A5FA Decisive Battle from Triton
      // A5FB Decisive Battle from Nereid
      // A5FC Decisive Battle from Phobos
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5FC', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Boss Tether',
      // Status effects on players applied without NetworkBuff log lines
      // 1156 Tritonic Gravity (Purple Beta)
      // 1157 Nereidic Gravity (Red Alpha)
      // 1158 Phobosic Gravity (Green Gamma)
      type: 'Tether',
      netRegex: { id: [headMarkerData.deadStarsBossTether], capture: true },
      condition: (data, matches) => {
        // Tethers come from player
        if (data.me === matches.source)
          return true;
        return false;
      },
      infoText: (_data, matches, output) => {
        return output.boss!({ boss: matches.target });
      },
      outputStrings: {
        boss: {
          en: 'Tethered to ${boss}',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Slice \'n\' Dice',
      // Each boss uses tankbuster cleave on main target deadStarsSliceBuster
      // A601 Slice 'n' Dice castbar
      // A602 Slice 'n' Dice cast that does damage
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.deadStarsTankbuster], capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleavesOnPlayers: {
            en: 'Tank Cleaves on ${player1}, ${player2}, ${player3}',
          },
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaveOnYouLineStack: {
            en: 'Tank Cleave on YOU, Avoid Line Stack',
          },
        };
        data.deadStarsSliceTargets.push(matches.target);
        if (data.deadStarsSliceTargets.length < 3)
          return;

        const target1 = data.deadStarsSliceTargets[0];
        const target2 = data.deadStarsSliceTargets[1];
        const target3 = data.deadStarsSliceTargets[2];
        if (data.me === target1 || data.me === target2 || data.me === target3) {
          if (!data.deadStarsIsSlice2)
            return { alertText: output.tankCleaveOnYou!() };
          return { alertText: output.tankCleaveOnYouLineStack!() };
        }

        // Do not call out with Firestrike 2
        if (data.deadStarsIsSlice2)
          return;

        return {
          infoText: output.tankCleavesOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        // Do not clear data for Firestrike 2 to use
        if (data.deadStarsSliceTargets.length === 3 && !data.deadStarsIsSlice2) {
          data.deadStarsSliceTargets = [];
          data.deadStarsIsSlice2 = true;
        }
      },
    },
    {
      id: 'Occult Crescent Dead Stars Three-Body Problem',
      // Each boss casts this, logs show A5B5 as 'Three-Body Probl─'
      // Only 'Three-Body Problem' text is visible in castbars
      // Primordial Chaos: A5B5 by Phobos into A9BD from Nereid + A5B9 Triton
      // Icebound Buffoon: A5B5 by Nereid into A5B8 from Phobos
      // Blazing Belligerent: A5B5 by Triton into A5B7 from Phobos
      type: 'StartsUsing',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A5B5', capture: false },
      infoText: (_data, _matches, output) => output.outOfHitbox!(),
      outputStrings: {
        outOfHitbox: Outputs.outOfHitbox,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Primordial Chaos',
      // Each boss targets ground, avoid getting hit by more than one aoe
      // A5D9 Primordial Chaos castbar
      // A5DC Primordial Chaos damage cast for each alliance
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5D9', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Gains Effect',
      // Track latest effect on player
      type: 'GainsEffect',
      netRegex: { effectId: [deadStarsRedEffectId, deadStarsBlueEffectId], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.deadStarsOoze = matches;
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Loses Effect',
      // There isn't a debuff at 0 count, track the loses effect log line
      type: 'LosesEffect',
      netRegex: { effectId: [deadStarsRedEffectId, deadStarsBlueEffectId], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => {
        delete data.deadStarsOoze;
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Initial',
      // Applied with Primordial Chaos
      // Comes in stacks of 1, 2, or 3
      // 1159 Nova Ooze (Red)
      // 115A Ice Ooze (Blue)
      // Players need to get hit by opposite color Ooze to decrease count
      // Hits by same color Oooze will increase count
      // Four opportunities to increase/decrease stack, meaning those with lower counts can afford mistakes
      // Any stacks remaining before Noxious Nova (A5E5) result in lethal damage
      type: 'GainsEffect',
      netRegex: { effectId: [deadStarsRedEffectId, deadStarsBlueEffectId], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target && data.deadStarsOozeCount === 0)
          return true;
        return false;
      },
      infoText: (_data, matches, output) => {
        const num = parseInt(matches.count, 16);
        if (matches.effectId === deadStarsBlueEffectId) {
          switch (num) {
            case 1:
              return output.blue!();
            case 2:
              return output.blueTwo!();
            case 3:
              return output.blueThree!();
          }
        }
        switch (num) {
          case 1:
            return output.red!();
          case 2:
            return output.redTwo!();
          case 3:
            return output.redThree!();
        }
      },
      outputStrings: {
        blue: {
          en: '+1 Blue',
        },
        blueTwo: {
          en: '+2 Blue',
        },
        blueThree: {
          en: '+3 Blue',
        },
        red: {
          en: '+1 Red',
        },
        redTwo: {
          en: '+2 Red',
        },
        redThree: {
          en: '+3 Red',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Frozen Fallout Locations',
      // This will output both ooze tells if missing debuff data
      // This calls one of two safespots if intercard is safe
      // Boss casts A45DD (Frozen Fallout) and A5DF + A5E0 tells
      // Liquified Triton (Red) tells are the A5DF casts
      // Liquified Nereid (Blue) tells are the A5E0 casts
      // Invisible entities are centered in the circle aoes that they tell
      // StartsUsing can have inaccurate location, Ability seems to be correct
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Triton'], id: ['A5DF', 'A5E0'], capture: true },
      preRun: (data, matches) => {
        const dirNum = Directions.xyTo8DirNum(
          parseFloat(matches.x),
          parseFloat(matches.y),
          deadStarsCenterX,
          deadStarsCenterY,
        );
        if (matches.id === 'A5DF')
          data.deadStarsLiquifiedTriton.push(dirNum);
        if (matches.id === 'A5E0')
          data.deadStarsLiquifiedNereid.push(dirNum);
      },
      infoText: (data, matches, output) => {
        if (
          data.deadStarsLiquifiedTriton.length !== 4 &&
          data.deadStarsLiquifiedNereid.length !== 4
        )
          return;

        const redOoze = data.deadStarsLiquifiedTriton;
        const blueOoze = data.deadStarsLiquifiedNereid;
        if (redOoze === undefined || blueOoze === undefined)
          return;

        if (data.deadStarsOoze === undefined) {
          const dirNums = matches.id === 'A5DF' ? redOoze : blueOoze;

          if (
            dirNums[0] === undefined || dirNums[1] === undefined ||
            dirNums[2] === undefined || dirNums[3] === undefined
          )
            return;
          const dirs = [
            output[Directions.outputFrom8DirNum(dirNums[0])]!(),
            output[Directions.outputFrom8DirNum(dirNums[1])]!(),
            output[Directions.outputFrom8DirNum(dirNums[2])]!(),
            output[Directions.outputFrom8DirNum(dirNums[3])]!(),
          ];

          // Output both if failed to get deadStarsOooze matches
          if (matches.id === 'A5DF')
            return output.red!({ dirs: dirs });
          if (matches.id === 'A5E0')
            return output.blue!({ dirs: dirs });

          return;
        }

        // Determine which slime locations to use for hits
        const dirNums = data.deadStarsOoze.effectId === deadStarsBlueEffectId
          ? redOoze
          : blueOoze;

        if (
          dirNums[0] === undefined || dirNums[1] === undefined ||
          dirNums[2] === undefined || dirNums[3] === undefined ||
          redOoze[1] === undefined || blueOoze[1] === undefined ||
          redOoze[2] === undefined || blueOoze[2] === undefined ||
          redOoze[3] === undefined || blueOoze[3] === undefined
        )
          return;

        const hitSpots = [
          output[Directions.outputFrom8DirNum(dirNums[0])]!(),
          output[Directions.outputFrom8DirNum(dirNums[1])]!(),
          output[Directions.outputFrom8DirNum(dirNums[2])]!(),
        ];
        // Ignoring initial safe spot
        const safeSpots = [
          output[Directions.outputFrom8DirNum(deadStarsFindSafeSpot(blueOoze[1], redOoze[1]))]!(),
          output[Directions.outputFrom8DirNum(deadStarsFindSafeSpot(blueOoze[2], redOoze[2]))]!(),
          output[Directions.outputFrom8DirNum(deadStarsFindSafeSpot(blueOoze[3], redOoze[3]))]!(),
        ];

        const count = parseInt(data.deadStarsOoze.count, 16);
        if (count === 1) {
          if (data.deadStarsOoze.effectId === deadStarsBlueEffectId)
            return output.red1!({
              hit1: hitSpots[0],
              safe1: safeSpots[0],
              safe2: safeSpots[1],
              safe3: safeSpots[2],
            });
          if (data.deadStarsOoze.effectId === deadStarsRedEffectId)
            return output.blue1!({
              hit1: hitSpots[0],
              safe1: safeSpots[0],
              safe2: safeSpots[1],
              safe3: safeSpots[2],
            });
        }
        if (count === 2) {
          if (data.deadStarsOoze.effectId === deadStarsBlueEffectId)
            return output.red2!({
              hit1: hitSpots[0],
              hit2: hitSpots[1],
              safe1: safeSpots[1],
              safe2: safeSpots[2],
            });
          if (data.deadStarsOoze.effectId === deadStarsRedEffectId)
            return output.blue2!({
              hit1: hitSpots[0],
              hit2: hitSpots[1],
              safe1: safeSpots[1],
              safe2: safeSpots[2],
            });
        }
        if (count === 3) {
          if (data.deadStarsOoze.effectId === deadStarsBlueEffectId)
            return output.blue3!({
              hit1: hitSpots[0],
              hit2: hitSpots[1],
              hit3: hitSpots[2],
              safe1: safeSpots[2],
            });
          if (data.deadStarsOoze.effectId === deadStarsRedEffectId)
            return output.blue3!({
              hit1: hitSpots[0],
              hit2: hitSpots[1],
              hit3: hitSpots[2],
              safe1: safeSpots[2],
            });
        }
      },
      tts: null, // Trigger happens 1 sec before individual call and would overlap
      outputStrings: {
        ...Directions.outputStrings8Dir,
        red: {
          en: 'Red: ${dirs}',
        },
        blue: {
          en: 'Blue: ${dirs}',
        },
        red1: {
          en: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
        },
        blue1: {
          en: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
        },
        red2: {
          en: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
        },
        blue2: {
          en: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
        },
        red3: {
          en: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
        },
        blue3: {
          en: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze 1',
      // This could call safe spot for those without buff
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Triton'], id: ['A5DF', 'A5E0'], capture: false },
      condition: (data) => {
        if (
          data.deadStarsLiquifiedTriton.length === 1 &&
          data.deadStarsLiquifiedNereid.length === 1
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const redOoze = data.deadStarsLiquifiedTriton;
        const blueOoze = data.deadStarsLiquifiedNereid;
        if (
          redOoze === undefined || blueOoze === undefined ||
          redOoze[0] === undefined || blueOoze[0] === undefined
        )
          return;

        const red = output[deadStarsMapOutput[redOoze[0]] ?? 'unknown']!();
        const blue = output[deadStarsMapOutput[blueOoze[0]] ?? 'unknown']!();

        if (data.deadStarsOoze === undefined) {
          return output.getHitBothOoze!({ red: red, blue: blue });
        }

        if (data.deadStarsOoze.effectId === deadStarsBlueEffectId)
          return output.getHitRedOoze!({ hit: red });
        return output.getHitBlueOoze!({ hit: blue });
      },
      outputStrings: {
        northeast: Outputs.northeast,
        southeast: Outputs.southeast,
        southwest: Outputs.southwest,
        northwest: Outputs.northwest,
        unknown: Outputs.unknown,
        getHitRedOoze: {
          en: '${hit} for Ooze',
        },
        getHitBlueOoze: {
          en: '${hit} for Ooze',
        },
        getHitBothOoze: {
          en: 'Red: ${red}, Blue: ${blue}',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Counter',
      // Count number of jumps
      // Source is unreliable, coming from Triton, Phobos, Liquified Triton, Liquified Nereid
      type: 'StartsUsing',
      netRegex: { id: [deadStarsRedHitId, deadStarsBlueHitId], capture: false },
      suppressSeconds: 1,
      run: (data) => {
        data.deadStarsOozeCount = data.deadStarsOozeCount + 1;
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze Hit Tracker',
      // Debuffs update about 0.3s after the hit, predict debuff based on ability id and last known debuff
      // A5E3 => Liquified Triton, decrease blue count, increase red count
      // A5E4 => Liquified Nereid, decrease red count, increase blue count
      // These abilities apply a 2s Magic Vulnerability Up (B7D)
      // Players can be hit by both, so this is separated from hit trigger call
      type: 'Ability',
      netRegex: { id: [deadStarsRedHitId, deadStarsBlueHitId], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => {
        if (data.deadStarsWasHitByOoze)
          data.deadStarsWasVennDiagramed = true;
        data.deadStarsWasHitByOoze = true;
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze 2-4 (Hit by Ooze)',
      type: 'Ability',
      netRegex: { id: [deadStarsRedHitId, deadStarsBlueHitId], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.1, // Only needed to detect player hit by both
      suppressSeconds: 1,
      alertText: (data, matches, output) => {
        // Get list of Ooze jumps based on player's current debuff color
        if (data.deadStarsOoze !== undefined) {
          const dirNums = data.deadStarsOoze.effectId === deadStarsBlueEffectId
            ? data.deadStarsLiquifiedTriton
            : data.deadStarsLiquifiedNereid;
          if (
            dirNums[0] === undefined || dirNums[1] === undefined ||
            dirNums[2] === undefined || dirNums[3] === undefined
          )
            return;

          const count = parseInt(data.deadStarsOoze.count, 16);
          const predict = (
            effectId: string,
            id: string,
          ): number => {
            if (
              (effectId === deadStarsBlueEffectId && id === deadStarsRedHitId) ||
              (effectId === deadStarsRedEffectId && id === deadStarsBlueHitId)
            )
              return -1;
            if (
              (effectId === deadStarsBlueEffectId && id === deadStarsBlueHitId) ||
              (effectId === deadStarsRedEffectId && id === deadStarsRedHitId)
            )
              return 1;
            return 0;
          };

          // Take last known count if hit by both
          const predictedCount = data.deadStarsWasVennDiagramed
            ? count
            : count + predict(data.deadStarsOoze.effectId, matches.id);

          // Check if player will still need to get hit
          if (predictedCount !== 0) {
            if (dirNums[data.deadStarsOozeCount] === 1)
              return output.getHit!({ dir: output.northeast!() });
            if (dirNums[data.deadStarsOozeCount] === 3)
              return output.getHit!({ dir: output.southeast!() });
            if (dirNums[data.deadStarsOozeCount] === 5)
              return output.getHit!({ dir: output.southwest!() });
            if (dirNums[data.deadStarsOozeCount] === 7)
              return output.getHit!({ dir: output.northwest!() });
          }
        } else {
          // If player hit by both, the net effect is they will not have a debuff
          if (!data.deadStarsWasVennDiagramed) {
            // Player either has no debuff, they should be gaining a debuff
            const dirNums = matches.id === deadStarsBlueHitId
              ? data.deadStarsLiquifiedTriton
              : data.deadStarsLiquifiedNereid;
            if (dirNums[data.deadStarsOozeCount] === 1)
              return output.getHit!({ dir: output.northeast!() });
            if (dirNums[data.deadStarsOozeCount] === 3)
              return output.getHit!({ dir: output.southeast!() });
            if (dirNums[data.deadStarsOozeCount] === 5)
              return output.getHit!({ dir: output.southwest!() });
            if (dirNums[data.deadStarsOozeCount] === 7)
              return output.getHit!({ dir: output.northwest!() });
          }
        }

        // Player will have no ooze, calculate where ooze are not jumping to
        const blueOoze = data.deadStarsLiquifiedNereid[data.deadStarsOozeCount];
        const redOoze = data.deadStarsLiquifiedTriton[data.deadStarsOozeCount];
        if (blueOoze === undefined || redOoze === undefined)
          return;

        // Using longer direction call for single/double direction
        const safeSpot = deadStarsFindSafeSpot(blueOoze, redOoze);

        // 1 = Northeast, 3 = Southeast
        if (safeSpot !== 1 && safeSpot !== 3)
          return output[deadStarsMapOutput[safeSpot] ?? 'unknown']!();

        // Call both Intercards
        const dir1 = output[deadStarsMapOutput[safeSpot] ?? 'unknown']!();
        const dir2 = safeSpot === 1 ? output['southwest']!() : output['northwest']!();
        return output.safeSpots!({ dir1: dir1, dir2: dir2 });
      },
      run: (data) => {
        if (data.deadStarsWasVennDiagramed)
          data.deadStarsWasVennDiagramed = false;
      },
      outputStrings: {
        north: Outputs.north,
        northeast: Outputs.northeast,
        east: Outputs.east,
        southeast: Outputs.southeast,
        south: Outputs.south,
        southwest: Outputs.southwest,
        west: Outputs.west,
        northwest: Outputs.northwest,
        unknown: Outputs.unknown,
        getHit: {
          en: '${dir} for Ooze',
        },
        safeSpot: {
          en: '${dir} Safe Spot',
          de: 'Sichere Stelle ${dir}',
          fr: '${dir} Zone safe',
          ja: '${dir}に安置',
          cn: '去${dir}方安全点',
          ko: '${dir} 안전 지대',
        },
        safeSpots: {
          en: '${dir1} / ${dir2} Safe Spots',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Nova/Ice Ooze 2-4 (Dodged Ooze)',
      type: 'Ability',
      netRegex: { id: [deadStarsRedHitId, deadStarsBlueHitId], capture: false },
      delaySeconds: 0.1, // Delay to detect if player was hit
      suppressSeconds: 1, // Suppress as it hits multiple players
      alertText: (data, _matches, output) => {
        if (data.deadStarsWasHitByOoze)
          return;
        // Get list of Ooze jumps based on player's current debuff color
        if (data.deadStarsOoze !== undefined) {
          const dirNums = data.deadStarsOoze.effectId === deadStarsBlueEffectId
            ? data.deadStarsLiquifiedTriton
            : data.deadStarsLiquifiedNereid;

          if (
            dirNums[0] === undefined || dirNums[1] === undefined ||
            dirNums[2] === undefined || dirNums[3] === undefined
          )
            return;

          if (dirNums[data.deadStarsOozeCount] === 1)
            return output.getHit!({ dir: output.northeast!() });
          if (dirNums[data.deadStarsOozeCount] === 3)
            return output.getHit!({ dir: output.southeast!() });
          if (dirNums[data.deadStarsOozeCount] === 5)
            return output.getHit!({ dir: output.southwest!() });
          if (dirNums[data.deadStarsOozeCount] === 7)
            return output.getHit!({ dir: output.northwest!() });
        }

        // Player has no ooze, calculate where ooze are not jumping to
        const blueOoze = data.deadStarsLiquifiedNereid[data.deadStarsOozeCount];
        const redOoze = data.deadStarsLiquifiedTriton[data.deadStarsOozeCount];
        if (blueOoze === undefined || redOoze === undefined)
          return;

        // Using longer direction call for single/double direction
        const safeSpot = deadStarsFindSafeSpot(blueOoze, redOoze);

        // 1 = Northeast, 3 = Southeast
        if (safeSpot !== 1 && safeSpot !== 3)
          return output[deadStarsMapOutput[safeSpot] ?? 'unknown']!();

        // Call both Intercards
        const dir1 = output[deadStarsMapOutput[safeSpot] ?? 'unknown']!();
        const dir2 = safeSpot === 1 ? output['southwest']!() : output['northwest']!();
        return output.safeSpots!({ dir1: dir1, dir2: dir2 });
      },
      run: (data) => {
        // Reset to false for next jump
        data.deadStarsWasHitByOoze = false;
      },
      outputStrings: {
        north: Outputs.north,
        northeast: Outputs.northeast,
        east: Outputs.east,
        southeast: Outputs.southeast,
        south: Outputs.south,
        southwest: Outputs.southwest,
        west: Outputs.west,
        northwest: Outputs.northwest,
        unknown: Outputs.unknown,
        getHit: {
          en: '${dir} for Ooze',
        },
        safeSpot: {
          en: '${dir} Safe Spot',
          de: 'Sichere Stelle ${dir}',
          fr: '${dir} Zone safe',
          ja: '${dir}に安置',
          cn: '去${dir}方安全点',
          ko: '${dir} 안전 지대',
        },
        safeSpots: {
          en: '${dir1} / ${dir2} Safe Spots',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Noxious Nova',
      // Any stack of Nova Ooze (1159), or Ice Ooze (115A) results in lethal damage
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5E5', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Vengeful Tracker',
      // Bosses cast A5BC unique to the vengeful casts, but this doesn't have their location at cast
      // Bosses jump with A5B4 ~2s after A5BC prior to starting Vengeful casts
      // AbilityExtra lines of A5B4 include target location of where they will cast
      // Since A5B4 is cast for many other things, this trigger captures when we want the A5B4 data
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A5BC', capture: false },
      suppressSeconds: 1,
      run: (data) => data.deadStarsIsVengeful = true,
    },
    {
      id: 'Occult Crescent Dead Stars Vengeful Direction',
      // Additional Details on Vengeful Casts:
      // Post A5E6 Noxious Nova (A637 Noisome Nuisance)
      // A5BD Vengeful Fire III (Triton)
      // A5BE Vengeful Blizzard III (Nereid)
      //
      // Post A5D5 To the Winds (A636 Icebound Buffoon)
      // A5BD Vengeful Fire III (Triton)
      // A5BF Vengeful Bio III (Phobos)
      //
      // Post A5C5 To the Winds (A635 Blazing Belligerent)
      // A5BE Vengeful Blizzard III (Nereid)
      // A5BF Vengeful Bio III (Phobos)
      type: 'AbilityExtra',
      netRegex: { id: 'A5B4', capture: true },
      condition: (data) => {
        return data.deadStarsIsVengeful;
      },
      preRun: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        if (data.deadStarsVengeful1.length !== 2)
          data.deadStarsVengeful1 = [x, y];
        else if (data.deadStarsVengeful2.length !== 2)
          data.deadStarsVengeful2 = [x, y];
      },
      durationSeconds: 7.5, // Vengeful casts end ~0.4s after this
      infoText: (data, _matches, output) => {
        const boss1 = data.deadStarsVengeful1;
        const boss2 = data.deadStarsVengeful2;

        // Calculate mid point (safe spot) and output result
        if (
          boss1[0] === undefined || boss1[1] === undefined ||
          boss2[0] === undefined || boss2[1] === undefined
        )
          return;
        const x = (boss1[0] + boss2[0]) / 2;
        const y = (boss1[1] + boss2[1]) / 2;
        const dirNum = Directions.xyTo8DirNum(
          x,
          y,
          deadStarsCenterX,
          deadStarsCenterY,
        );
        return output[Directions.outputFrom8DirNum(dirNum)]!();
      },
      run: (data) => {
        // Reset for next set of casts
        if (
          data.deadStarsVengeful1.length === 2 &&
          data.deadStarsVengeful2.length === 2
        ) {
          data.deadStarsVengeful1 = [];
          data.deadStarsVengeful2 = [];
          data.deadStarsIsVengeful = false;
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
      },
    },
    {
      id: 'Occult Crescent Dead Stars Delta Attack',
      // There are a multitude of spells in this sequence:
      // All three cast A5FD, Triton also casts A5FF and A63E (damage)
      // All three cast A5FE, Triton also casts A600
      // Nereid casts A63F (damage)
      // All three cast A5FE, Triton also casts A600
      // Phobos casts A63F (damage)
      // In total, three hits happen:
      // Triton hits at ~5.5s
      // Nereid hits at ~6.65s
      // Phobos hits at ~7.76s
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5FD', capture: false },
      durationSeconds: 7,
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Firestrike',
      // This has a line stack headmarker, but does not appear in the logs
      // Each boss starts a 4.7s A603 cast on themselves which comes with A604 on a targeted player
      // ~0.13s after A603, each boss casts A606 that does the line aoe damage
      type: 'Ability',
      netRegex: { source: ['Phobos', 'Nereid', 'Triton'], id: 'A604', capture: true },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = deadStarsOutputStrings;
        data.deadStarsFirestrikeTargets.push(matches.target);
        if (data.deadStarsFirestrikeTargets.length < 3)
          return;

        const target1 = data.deadStarsFirestrikeTargets[0];
        const target2 = data.deadStarsFirestrikeTargets[1];
        const target3 = data.deadStarsFirestrikeTargets[2];

        if (data.me === target1 || data.me === target2 || data.me === target3)
          return { alertText: output.lineStackOnYou!() };

        return {
          infoText: output.lineStacksOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
      run: (data) => {
        if (data.deadStarsFirestrikeTargets.length === 3)
          data.deadStarsFirestrikeTargets = [];
      },
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Flight Positions',
      // These are each 6.7s casts, covering 9.6s
      // Snowball Flight (A5CE)
      // Snow Boulder (A5CF) is cast 3 times, 2.5s apart
      // Snow Boulder (A5D0) Wild Charge damage is applied when hit
      // Knockback timing will vary based on charge order
      // Minimum of 4 players needed in each charge, with front person taking major damage
      // 3 pairs of soaks, knockback immune recommended to avoid getting hit more than once
      type: 'StartsUsing',
      netRegex: { source: 'Nereid', id: 'A5CE', capture: false },
      infoText: (_data, _matches, output) => {
        return output.chargePositions!();
      },
      outputStrings: {
        chargePositions: {
          en: 'Wild Charge Positions',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Flight Knockback',
      // CastTime is 6.7s
      // Set 1 Knockback at 7s
      // Set 2 Knocbkack at 9.6s
      // Set 3 Knockback at 12.2s
      // This will call out at 6s, covering all three knockbacks
      // TODO: Add configurator to select knockback timing
      type: 'StartsUsing',
      netRegex: { source: 'Nereid', id: 'A5CE', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 0.7,
      response: Responses.knockback(),
    },
    {
      id: 'Occult Crescent Dead Stars Snowball Tether/Knockback',
      // Three things happen here
      // 1 - Two players get marked with a Proximity Tether + Stack Marker
      // 2 - Knockback from center of room
      // 3 - Players in stack take proximity damage as if they had their own tether
      // Related Spell Ids:
      // - Players tethered are targeted by Avalaunch (A5D1)
      // - Knockback is caused by Chilling Collision (A5D4)
      // - Additional Chilling Collision casts from A5B6 Nereid and A5D3 from Frozen Triton
      // - Proximity stack damage is from Avalaunch (A5D2)
      // - Snowballs jump using Avalaunch (A89A)
      type: 'Tether',
      netRegex: { id: [headMarkerData.deadStarsSnowballTether], capture: true },
      preRun: (data) => {
        data.deadStarsSnowballTetherCount = data.deadStarsSnowballTetherCount + 1;
      },
      promise: async (data, matches) => {
        // Only calculate direction for players that are targetted
        if (data.me !== matches.target)
          return;
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Dead Stars Snowball Tether: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(
          actor.PosX,
          actor.PosY,
          deadStarsCenterX,
          deadStarsCenterY,
        );
        data.deadStarsSnowballTetherDirNum = (dirNum + 4) % 8;
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          ...Directions.outputStrings8Dir,
          knockbackTetherDir: {
            en: 'Tether: Knockback to ${dir} => Stack at Wall',
          },
          knockbackToSnowball: {
            en: 'Knockback to Snowball => Stack at Wall',
          },
        };

        if (
          data.deadStarsSnowballTetherDirNum !== undefined &&
          data.me === matches.target
        ) {
          // This will trigger for each tether a player has
          const dir = output[Directions.outputFrom8DirNum(data.deadStarsSnowballTetherDirNum)]!();
          return { alarmText: output.knockbackTetherDir!({ dir: dir }) };
        }

        // A player who has a tether should have a defined direction, but if they don't they'll get two calls
        if (
          data.deadStarsSnowballTetherDirNum === undefined &&
          data.deadStarsSnowballTetherCount === 2
        )
          return { alertText: output.knockbackToSnowball!() };
      },
    },
    {
      id: 'Occult Crescent Dead Stars Firestrike 2',
      // This has a line stack headmarker, but does not appear in the logs
      // Each boss starts a 4.7s A605 (Slice 'n' Dice) cast on themselves which comes with a607 on a targeted player
      // ~0.13s after A605, each boss casts A606 that does the line aoe damage
      // Meanwhile, boss targets main target with tankbuster cleave A602 Slice 'n' Dice
      type: 'Ability',
      netRegex: {
        source: ['Phobos', 'Nereid', 'Triton', 'Frozen Phobos'],
        id: 'A607',
        capture: true,
      },
      delaySeconds: 0.1, // Delay for Tankbuster target accummulation
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = deadStarsOutputStrings;
        data.deadStarsFirestrikeTargets.push(matches.target);
        if (data.deadStarsFirestrikeTargets.length < 3)
          return;

        const strikeTarget1 = data.deadStarsFirestrikeTargets[0];
        const strikeTarget2 = data.deadStarsFirestrikeTargets[1];
        const strikeTarget3 = data.deadStarsFirestrikeTargets[2];
        if (
          data.me === strikeTarget1 ||
          data.me === strikeTarget2 ||
          data.me === strikeTarget3
        )
          return { alertText: output.lineStackOnYouTankCleave!() };

        // Do not call out to Slice 'n' Dice targets
        const sliceTarget1 = data.deadStarsSliceTargets[0];
        const sliceTarget2 = data.deadStarsSliceTargets[1];
        const sliceTarget3 = data.deadStarsSliceTargets[2];
        if (
          data.me === sliceTarget1 ||
          data.me === sliceTarget2 ||
          data.me === sliceTarget3
        )
          return;

        return {
          infoText: output.lineStacksOnPlayers!({
            player1: data.party.member(strikeTarget1),
            player2: data.party.member(strikeTarget2),
            player3: data.party.member(strikeTarget3),
          }),
        };
      },
      run: (data) => {
        if (data.deadStarsFirestrikeTargets.length === 3) {
          data.deadStarsFirestrikeTargets = [];
          data.deadStarsSliceTargets = [];
        }
      },
    },
    {
      id: 'Occult Crescent Dead Stars Six-handed Fistfight',
      // Start of enrage sequence
      // All three bosses cast a 9.1s Six-handed Fistfight (A5E7)
      // They become "Dead Stars", which also casts the spell under A5E9 (10.2s) and A5E8 (9.7s)
      // Middle will be taken over/blocked by bosses bodying each other (A5EA Bodied)
      type: 'StartsUsing',
      netRegex: { source: 'Phobos', id: 'A5E7', capture: false },
      infoText: (_data, _matches, output) => output.outOfMiddleGroups!(),
      outputStrings: {
        outOfMiddleGroups: {
          en: 'Out of Middle, Group Positions',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Six-handed Fistfight AoE',
      // 10.2s cast, delay until 5s before end
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5E9', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5.2,
      suppressSeconds: 1,
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Dead Stars Collateral Damage',
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5ED', capture: false },
      infoText: (_data, _matches, output) => output.jetsThenSpread!(),
      outputStrings: {
        jetsThenSpread: {
          en: 'Dodge Two Jets => Spread',
        },
      },
    },
    {
      id: 'Occult Crescent Dead Stars Collateral Damage Spread',
      // 5s to spread after last jet happens, 2s after Collateral Damage cast
      type: 'StartsUsing',
      netRegex: { source: 'Dead Stars', id: 'A5ED', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) + 2,
      alertText: (_data, _matches, output) => output.spread!(),
      outputStrings: {
        spread: Outputs.spread,
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Paralyze III',
      // Triggers for both bridges on physical ranged dps
      type: 'StartsUsing',
      netRegex: { source: 'Tower Bhoot', id: 'A903', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Paralyze III: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Paralyze III: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          interruptBhoot: {
            en: 'Interrupt Bhoot',
          },
          northInterrupt: {
            en: 'North: Interrupt Bhoot',
          },
          southInterrupt: {
            en: 'South: Interrupt Bhoot',
          },
        };
        // Tanks have 3y interrupt, only call about actor on their platform
        if (data.CanSilence() && data.role === 'tank') {
          if (data.prongedPassageActLoc[matches.sourceId] === data.prongedPassageActLoc[data.me])
            return { alarmText: output.interruptBhoot!() };
        }

        // Physical Ranged DPS can reach both platforms
        if (data.CanSilence() && data.role !== 'tank') {
          if (data.prongedPassageActLoc[matches.sourceId] === 'north')
            return { infoText: output.northInterrupt!() };
          if (data.prongedPassageActLoc[matches.sourceId] === 'south')
            return { infoText: output.southInterrupt!() };
        }
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Arcane Spear',
      // Floating spears appear and light up 4 rows on each bridge
      // Tanks need to be in front
      // Phantom Samurai with Shirahadori can also block
      // A441 in first two sections, A6F4 in last section
      // A441 affects north/south bridge at different times
      type: 'StartsUsing',
      netRegex: { source: 'Trap', id: 'A441', capture: true },
      suppressSeconds: 1,
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Arcane Spear: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Arcane Spear: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      alertText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.sourceId] === data.prongedPassageActLoc[data.me])
          return output.wildChargeEast!();
      },
      outputStrings: {
        wildChargeEast: {
          en: 'Wild Charge (East), Stack in a Row',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Dense Darkness',
      // TODO: Check for Phantom Time Mage Buff?
      // NOTE: will trigger for both north/south bridge by default
      type: 'StartsUsing',
      netRegex: { source: 'Tower Abyss', id: 'A3A8', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Dense Darkness: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Dense Darkness: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.sourceId] = 'south';
      },
      infoText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.sourceId] === 'north')
          return output.northAoEDispel!();
        if (data.prongedPassageActLoc[matches.sourceId] === 'south')
          return output.southAoEDispel!();
      },
      outputStrings: {
        northAoEDispel: {
          en: 'North: AoE (Dispel if Possible)',
        },
        southAoEDispel: {
          en: 'South: AoE (Dispel if Possible)',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Ancient Aero III',
      // TODO: Check for Phantom Bard Buff?
      // 6 Tower Idols cast Ancient Aero III at different times
      // Must interrupt with Romeo's Ballad all 6 at same time
      // This will count until all 12 have started casting
      type: 'StartsUsing',
      netRegex: { source: 'Tower Idol', id: 'A61F', capture: true },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Ancient Aero III: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Ancient Aero III: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        const bridge = (actor.PosY < prongedPassageCenterY) ? 'north' : 'south';
        // Ignore actors on other bridge as it's not realistic to stop them
        if (data.prongedPassageActLoc[data.me] !== bridge)
          return;
        data.prongedPassageIdolCastCount[bridge] = (data.prongedPassageIdolCastCount[bridge] ?? 0) +
          1;
      },
      infoText: (data, _matches, output) => {
        const myBridge = data.prongedPassageActLoc[data.me];
        if (myBridge !== undefined && data.prongedPassageIdolCastCount[myBridge] === 6) {
          // Clear data to prevent second firing
          data.prongedPassageIdolCastCount = {};
          return output.romeo!();
        }
      },
      outputStrings: {
        romeo: {
          en: 'Romeo\'s Ballad (if possible)',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Close Call to Detonate / Far Cry to Detonate',
      // Tower Progenitrix casts A620 / A622
      // Tower Progenitor casts A621 / A623
      // Both adds also get a tether and a buff describing the ability
      // Only need to capture one as it requires both adds to cast
      type: 'StartsUsing',
      netRegex: { source: 'Tower Progenitrix', id: ['A620', 'A622'], capture: true },
      promise: async (data) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Close Call to Detonate / Far Cry to Detonat: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          topApart: {
            en: 'Top row (bosses apart)',
          },
          bottomApart: {
            en: 'Bottom row (bosses apart)',
          },
          bossesApart: {
            en: 'Move bosses apart',
          },
          topTogether: {
            en: 'Top row (bosses together)',
          },
          bottomTogether: {
            en: 'Bottom row (bosses together)',
          },
          bossesTogether: {
            en: 'Move bosses together',
          },
        };
        const myBridge = data.prongedPassageActLoc[data.me];

        // Close to Detonate => Bosses Apart
        if (matches.id === 'A620') {
          if (myBridge === 'north') {
            if (data.role === 'tank')
              return { alertText: output.topApart!() };
            return { infoText: output.topApart!() };
          }
          if (myBridge === 'south') {
            if (data.role === 'tank')
              return { alertText: output.bottomApart!() };
            return { infoText: output.bottomApart!() };
          }
          return { infoText: output.bossesApart!() };
        }

        // Far to Detonate => Bosses Together
        if (myBridge === 'north') {
          if (data.role === 'tank')
            return { alertText: output.bottomTogether!() };
          return { infoText: output.bottomTogether!() };
        }
        if (myBridge === 'south') {
          if (data.role === 'tank')
            return { alertText: output.topTogether!() };
          return { infoText: output.topTogether!() };
        }
        return { infoText: output.bossesTogether!() };
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Arcane Spear 2',
      // Floating spears appear and light up 4 rows on each bridge
      // Tanks need to be in front
      // Phantom Samurai with Shirahadori can also block
      // A441 in first two sections, A6F4 in last section
      // A6F4 affects north/south bridge at same times
      type: 'StartsUsing',
      netRegex: { source: 'Trap', id: 'A6F4', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.wildChargeEast!(),
      outputStrings: {
        wildChargeEast: {
          en: 'Wild Charge (East), Stack in a Row',
        },
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Bombshell Drop',
      type: 'StartsUsing',
      netRegex: {
        source: ['Tower Progenitrix', 'Tower Progenitor'],
        id: ['A626', 'A627'],
        capture: false,
      },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.pullBossAway!();
        return output.killAdds!();
      },
      outputStrings: {
        pullBossAway: {
          en: 'Pull boss away from bombs',
        },
        killAdds: Outputs.killAdds,
      },
    },
    {
      id: 'Occult Crescent Pronged Passage Punishing Pounce',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.prongedPassageStack], capture: true },
      condition: (data) => {
        // Prevents trigger during Magitaur and Dead Stars
        return data.prongedPassageActLoc[data.me] !== undefined;
      },
      promise: async (data, matches) => {
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Punishing Pounce: Wrong combatants count ${combatants.length}`,
          );
          return;
        }
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          names: [matches.target],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Pronged Passage Punishing Pounce: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.prongedPassageActLoc[data.me] = me.PosY < prongedPassageCenterY
          ? 'north'
          : 'south';
        if (actor.PosY < prongedPassageCenterY)
          data.prongedPassageActLoc[matches.target] = 'north';
        if (actor.PosY > prongedPassageCenterY)
          data.prongedPassageActLoc[matches.target] = 'south';
      },
      infoText: (data, matches, output) => {
        if (data.prongedPassageActLoc[matches.target] === data.prongedPassageActLoc[data.me])
          return output.stackOnPlayer!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        stackOnPlayer: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Tankbuster Filter',
      // Used to tracker encounter for filtering
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '77F1', capture: false },
      run: (data) => data.marbleDragonTankbusterFilter = true,
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Star',
      // 77F1 Imitation Star is a 4.7s cast
      // 9ECC Imitation Star damage casts happen 1.8 to 2.9s after
      // This cast also applies a 15s bleed called Bleeding (828)
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '77F1', capture: false },
      response: Responses.bleedAoe(),
    },
    {
      id: 'Occult Crescent Marble Dragon Draconiform Motion',
      // Boss turns to face random player and casts 77C1 Draconiform Motion
      // This is a 3.7s that coincides with these 4.5s casts:
      // 77E6 Draconiform Motion (knockback cleave fromm tail)
      // 77E5 Draconiform Motion (knockback cleave from head)
      // Getting hit also applies D96 Thrice-come Ruin debuff
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '77C1', capture: false },
      alertText: (data, _matches, output) => {
        if (
          data.marbleDragonImitationRainDir !== undefined &&
          data.marbleDragonImitationRainCount < 6
        )
          return output[data.marbleDragonImitationRainDir]!();
        if (data.marbleDragonImitationRainCount >= 6) {
          if (data.marbleDragonTwisterClock === 'clockwise')
            return output.northSouth!();
          if (data.marbleDragonTwisterClock === 'counterclockwise')
            return output.eastWest!();
        }
        return output.sides!();
      },
      run: (data) => {
        delete data.marbleDragonImitationRainDir;
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        eastWest: {
          en: 'East/West',
        },
        northSouth: {
          en: 'North/South',
        },
        sides: Outputs.sides,
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain Counter',
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7687', capture: false },
      run: (data) => {
        data.marbleDragonImitationRainCount = data.marbleDragonImitationRainCount + 1;
        data.marbleDragonImitationBlizzardCount = 0;
        // Clear clock data for Imitation Rain 6 and 7
        if (data.marbleDragonImitationRainCount === 5)
          delete data.marbleDragonTwisterClock;
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 1 and 5 Direction (Cross-based)',
      // North Puddles
      // (-355, 141) (-343, 141) (-331, 141) (-319, 141)
      // South Puddles
      // (-355, 173) (-343, 173) (-331, 173) (-319, 173)
      // BNpcID 2014547 combatant is responsible for the cross puddles, accessible right before Imitation Rain (7797) NetworkAOEAbility
      // If (-331, 173) or (-343, 141) is cross, then go East.
      // If (-343, 173) or (-331, 141) is cross, then go West.
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7797', capture: false },
      condition: (data) => {
        if (
          (data.marbleDragonImitationRainCount === 1 ||
            data.marbleDragonImitationRainCount === 5) &&
          data.triggerSetConfig.marbleDragonImitationRainStrategy === 'cross'
        )
          return true;
        return false;
      },
      delaySeconds: 0.5, // Need to delay for latency
      suppressSeconds: 1,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const crosses = actors.filter((c) => c.BNpcID === 2014547);
        if (crosses.length !== 2 || crosses[0] === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 1 and 5 Direction (Cross-based): Wrong actor count ${crosses.length}`,
          );
          return;
        }
        // Only need to check one of the two crosses
        const x = crosses[0].PosX;
        const y = crosses[0].PosY;

        if (
          ((x > -332 && x < -330) && (y > 172 && y < 174)) ||
          ((x > -344 && x < -342) && (y > 140 && y < 142))
        ) {
          data.marbleDragonImitationRainDir = 'east';
        } else if (
          ((x > -344 && x < -342) && (y > 172 && y < 174)) ||
          ((x > -332 && x < -330) && (y > 140 && y < 142))
        ) {
          data.marbleDragonImitationRainDir = 'west';
        } else {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 1 and 5 Direction (Cross-based): Unexpected coordinates (${x}, ${y})`,
          );
        }
      },
      infoText: (data, _matches, output) => {
        if (data.marbleDragonImitationRainDir === undefined)
          return;
        const dir = data.marbleDragonImitationRainDir;
        const dir1 = output[dir]!();

        // Second direction is either north or south, but not known yet
        if (data.marbleDragonHasWickedWater) {
          const dir2 = output.wickedWater!({ dir: dir1 });
          return dir === 'east'
            ? output.eastThenWickedWater!({ dir1: dir1, dir2: dir2 })
            : output.westThenWickedWater!({ dir1: dir1, dir2: dir2 });
        }
        return dir === 'east' ? output.eastLater!({ dir: dir1 }) : output.westLater!({ dir: dir1 });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        eastLater: {
          en: '(${dir} Later)',
        },
        westLater: {
          en: '(${dir} Later)',
        },
        eastThenWickedWater: {
          en: '(${dir1} Later => ${dir2})',
        },
        westThenWickedWater: {
          en: '(${dir1} Later => ${dir2})',
        },
        wickedWater: {
          en: 'Get Hit ${dir}',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 1 and 5 Collect (Ice-based)',
      // Alternate Strategy using the Imitation Icicle closest to Wall for inital East/West call
      // Imitation Icicle location data is in the StartsUsingExtra lines of Imitation Icicle (75E4)
      // Four possible locations for Imitation Icicles
      // North Puddle by West wall
      // (-353, 153)
      //            (-331, 161)
      // South Puddle by West wall
      //            (-331, 153)
      // (-355, 161) This seems like a bug?
      // North Puddle by East Wall
      //            (-319, 153)
      // (-343, 161)
      // South Puddle by East Wall
      // (-343, 153)
      //            (-319, 161)
      // This is available ~2.4s before Draconiform Motion (77C1) startsUsing
      // 271 log line slightly earlier could be grabbed with OverlayPlugin, but timing could vary
      // Output conflicts with Draconiform Motion Bait trigger, so this just collects
      type: 'StartsUsingExtra',
      netRegex: { id: '75E4', capture: true },
      condition: (data) => {
        if (
          (data.marbleDragonImitationRainCount === 1 ||
            data.marbleDragonImitationRainCount === 5) &&
          data.triggerSetConfig.marbleDragonImitationRainStrategy === 'ice'
        )
          return true;
        return false;
      },
      suppressSeconds: 1,
      run: (data, matches, _output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        // Could have either north or south puddle in the pattern
        // North Puddle by East Wall
        if (
          ((x > -320 && x < -318) && (y < marbleDragonCenterY)) ||
          ((x > -345 && x < -342) && (y > marbleDragonCenterY))
        ) {
          data.marbleDragonImitationRainDir = 'east';
          // Then north
          return;
        }
        // South Puddle by East Wall
        if (
          ((x > -345 && x < -342) && (y < marbleDragonCenterY)) ||
          ((x > -320 && x < -318) && (y > marbleDragonCenterY))
        ) {
          data.marbleDragonImitationRainDir = 'east';
          // Then south
        }
        // North Puddle by West Wall
        if (
          ((x > -355 && x < -352) && (y < marbleDragonCenterY)) ||
          ((x > -332 && x < -330) && (y > marbleDragonCenterY))
        ) {
          data.marbleDragonImitationRainDir = 'west';
          // Then north
          return;
        }
        // South Puddle by West Wall
        // NOTE: South check expanded to -352 incase it is fixed later
        if (
          ((x > -332 && x < -330) && (y < marbleDragonCenterY)) ||
          ((x > -356 && x < -352) && (y > marbleDragonCenterY))
        ) {
          data.marbleDragonImitationRainDir = 'west';
          // Then south
          return;
        }
        console.error(
          `Occult Crescent Marble Dragon Imitation Rain 1 and 5 Collect (Ice-based): Unexpected coordinates (${x}, ${y})`,
        );
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Blizzard Counter',
      // Imitation Blizzard (Cross) (7614)
      // Imitation Blizzard (Circle) (7602)
      // Not currently tracking the Imitation Blizzard (Tower) (7615)
      // Used to track puddle explosions during Imitation Rains for calls on where to dodge to
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: ['7614', '7602'], capture: false },
      suppressSeconds: 1,
      run: (data) => {
        data.marbleDragonImitationBlizzardCount = data.marbleDragonImitationBlizzardCount + 1;
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Dread Deluge',
      // Tankbuster targets one tank in each alliance party, 6 tanks total
      // Applies a heavy bleed to target
      // TODO: Determine if they are in player's party to call just that name
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonTankbuster], capture: true },
      condition: (data) => {
        // Prevent triggering in CEs such as Noise Complaint and Flame of Dusk
        // This also triggers by certain mobs when out of combat
        return data.marbleDragonTankbusterFilter;
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankBusterBleeds: {
            en: 'Tankbuster Bleeds',
          },
          tankBusterBleedOnYou: {
            en: 'Tankbuster bleed on YOU',
          },
        };
        data.marbleDragonDelugeTargets.push(matches.target);
        if (data.marbleDragonDelugeTargets.length < 6)
          return;

        const target1 = data.marbleDragonDelugeTargets[0];
        const target2 = data.marbleDragonDelugeTargets[1];
        const target3 = data.marbleDragonDelugeTargets[2];
        const target4 = data.marbleDragonDelugeTargets[3];
        const target5 = data.marbleDragonDelugeTargets[4];
        const target6 = data.marbleDragonDelugeTargets[6];
        if (
          data.me === target1 || data.me === target2 || data.me === target3 ||
          data.me === target4 || data.me === target5 || data.me === target6
        )
          return { alertText: output.tankBusterBleedOnYou!() };
        if (data.role === 'tank' || data.role === 'healer')
          return { alertText: output.tankBusterBleeds!() };
        return { infoText: output.tankBusterBleeds!() };
      },
      run: (data) => {
        if (data.marbleDragonDelugeTargets.length === 6)
          data.marbleDragonDelugeTargets = [];
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 2 Direction',
      // Call East/West later for movement after Draconiform Motion and use data collected here for later calls
      // Twisters will rotate CW or CCW
      // The center is always a cross, the other two form a diagonal with the center
      //             (-337, 133)
      // (-353, 141)             (-321, 141)
      //             (-337, 157)
      // (-353, 173)             (-321, 173)
      //             (-337, 181)
      // BNpcID 2014547 combatant is responsible for the cross puddles, accessible around Imitation Rain (7797) NetworkAOEAbility
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7797', capture: false },
      condition: (data) => {
        if (data.marbleDragonImitationRainCount === 2)
          return true;
        return false;
      },
      delaySeconds: 0.5, // NPC Add available before or slightly after the cast
      suppressSeconds: 1,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const crosses = actors.filter((c) => c.BNpcID === 2014547);
        if (crosses.length !== 3 || crosses === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 2 Direction: Wrong actor count ${crosses.length}`,
          );
          return;
        }

        const cross1 = crosses[0];
        const cross2 = crosses[1];
        const cross3 = crosses[2];
        if (cross1 === undefined || cross2 === undefined || cross3 === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 2 Direction: Invalid actors.`,
          );
          return;
        }

        const getCrossLocation = (
          combatant: PluginCombatantState,
        ): 'NE' | 'SE' | 'SW' | 'NW' | 'center' | undefined => {
          const x = combatant.PosX;
          const y = combatant.PosY;
          const result = getPuddleLocation(x, y);
          if (result === undefined) {
            console.error(
              `Occult Crescent Marble Dragon Imitation Rain 2 Direction: Unexpected puddle location (${x}, ${y})`,
            );
          }
          return result;
        };

        // Get Locations of cross puddles
        const cross1Location = getCrossLocation(cross1);
        const cross2Location = getCrossLocation(cross2);
        const cross3Location = getCrossLocation(cross3);

        // Ignoring the center puddle, net result should be length 2
        if (cross1Location !== 'center' && cross1Location !== undefined)
          data.marbleDragonImitationRainCrosses.push(cross1Location);
        if (cross2Location !== 'center' && cross2Location !== undefined)
          data.marbleDragonImitationRainCrosses.push(cross2Location);
        if (cross3Location !== 'center' && cross3Location !== undefined)
          data.marbleDragonImitationRainCrosses.push(cross3Location);

        // East/West call based on south puddle location
        if (data.marbleDragonImitationRainCrosses !== undefined) {
          const dir = data.marbleDragonImitationRainCrosses[0];
          if (dir === 'NE' || dir === 'SW')
            data.marbleDragonImitationRainDir = 'west';
          if (dir === 'NW' || dir === 'SE')
            data.marbleDragonImitationRainDir = 'east';
        }
      },
      infoText: (data, _matches, output) => {
        if (data.marbleDragonImitationRainDir === undefined)
          return;
        return output[data.marbleDragonImitationRainDir]!();
      },
      outputStrings: {
        east: {
          en: '(East Later)',
        },
        west: {
          en: '(West Later)',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 2 Pattern',
      // Twisters will rotate CW or CCW and start moving 1s before end of Draconiform Motion (77C1)
      // They spawn at (-362, 157) and (-312, 157) as combatant "Icewind" about ~1.6s after Frigid Twister (7638)
      // About 3.2s later, they start using Frigid Twister (76CF) abilities
      // At Spawn headings are ~2.00 for left side, ~-2.00 for right
      // They start turning ~0.5s after AddedCombatant, but these turns seem random
      // Heading appears to snap into expected place once they start moving, but timing for each can vary slightly
      type: 'AddedCombatant',
      netRegex: { name: 'Icewind', capture: true },
      condition: (data) => {
        if (data.marbleDragonImitationRainCount === 2)
          return true;
        return false;
      },
      delaySeconds: 5.7, // Before the move, the actor seems to just spin randomly in place
      suppressSeconds: 1, // Only need one of the combatants
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.id, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 2 Pattern: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const x = actor.PosX;
        const facing = Directions.hdgTo16DirNum(actor.Heading);
        const getTwisterSide = (
          x: number,
        ): 'west' | 'east' | undefined => {
          if (x > -363 && x < -361)
            return 'west';
          if (x > -313 && x < -311)
            return 'east';
          return undefined;
        };

        const side = getTwisterSide(x);
        if (
          (side === 'west' && (facing >= 0 && facing <= 3)) || // N to ENE
          (side === 'east' && (facing >= 8 && facing <= 11)) // S to WSW
        )
          data.marbleDragonTwisterClock = 'clockwise';
        else if (
          (side === 'west' && (facing >= 5 && facing <= 8)) || // ESE to S
          (side === 'east' && ((facing >= 13 && facing <= 15) || facing === 0)) // WNW to N
        )
          data.marbleDragonTwisterClock = 'counterclockwise';
      },
      infoText: (data, _matches, output) => {
        if (data.marbleDragonTwisterClock === undefined)
          return;
        const clock = data.marbleDragonTwisterClock;
        const crosses = data.marbleDragonImitationRainCrosses;
        // Only need one cross puddle
        if (crosses === undefined || (crosses[0] === undefined && crosses[1] === undefined))
          return output[clock]!();
        if (
          (clock === 'clockwise' &&
            ((crosses[0] === 'NE' || crosses[0] === 'SW') ||
              (crosses[1] === 'NE' || crosses[1] === 'SW'))) ||
          (clock === 'counterclockwise' &&
            ((crosses[0] === 'NW' || crosses[0] === 'SE') ||
              (crosses[1] === 'NW' || crosses[1] === 'SE')))
        )
          return output.circlesFirst!({ clock: output[clock]!() });
        if (
          (clock === 'clockwise' &&
            ((crosses[0] === 'NW' || crosses[0] === 'SE') ||
              (crosses[1] === 'NW' || crosses[1] === 'SE'))) ||
          (clock === 'counterclockwise' &&
            ((crosses[0] === 'NE' || crosses[0] === 'SW') ||
              (crosses[1] === 'NE' || crosses[1] === 'SW')))
        )
          return output.crossesFirst!({ clock: output[clock]!() });
        return output[clock]!();
      },
      outputStrings: {
        crossesFirst: {
          en: 'Crosses First + ${clock}',
        },
        circlesFirst: {
          en: 'Circles First + ${clock}',
        },
        clockwise: Outputs.clockwise,
        counterclockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 2 Dodge 1',
      // Imitation Blizzard (Cross) (7614)
      // Imitation Blizzard (Circle) (7602)
      // First cast is always 2 circles or 2 crosses
      // Assuming player followed south cross priority call
      // Cross has more time to get to the called direction than circle
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: ['7614', '7602'], capture: true },
      condition: (data) => {
        if (
          data.marbleDragonImitationRainCount === 2 &&
          data.marbleDragonImitationBlizzardCount === 1
        )
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      response: (_data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          dirESE: Outputs.dirESE,
          dirWSW: Outputs.dirWSW,
          cross1Dodge: {
            en: '${dir}',
          },
          circles1Dodge: {
            en: '${dir}',
          },
        };
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const loc = getPuddleLocation(x, y);
        if (loc === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 2 Dodge 1: Unexpected puddle location (${x}, ${y})`,
          );
          return;
        }

        // Crosses
        if (matches.id === '7614') {
          if (loc === 'NW' || loc === 'SE')
            return { infoText: output.cross1Dodge!({ dir: output.dirESE!() }) };
          if (loc === 'NE' || loc === 'SW')
            return { infoText: output.cross1Dodge!({ dir: output.dirWSW!() }) };
        }
        // Circles may be able to stay where they were or move slightly to avoid center Cross
        // South Cross priority = SW, so WSW is the direction to go
        if (loc === 'NW' || loc === 'SE')
          return { alertText: output.circles1Dodge!({ dir: output.dirWSW!() }) };
        // South Cross priority = SE, so ESE is the direction to go
        if (loc === 'NE' || loc === 'SW')
          return { alertText: output.circles1Dodge!({ dir: output.dirESE!() }) };
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 2 Dodge 2',
      // Imitation Blizzard (Cross) (7614)
      // Cross first = player already directed to a safe spot previously
      // Circles pattern has a cross here that is unique to it
      // Assuming player followed south cross priority call
      // Calling East/West as those are the easy spots to get to, center is safe as well
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '7614', capture: true },
      condition: (data) => {
        if (
          data.marbleDragonImitationRainCount === 2 &&
          data.marbleDragonImitationBlizzardCount === 2
        )
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const crosses = data.marbleDragonImitationRainCrosses;
        if (crosses === undefined || crosses[0] === undefined)
          return output.twoDirs!({ dir1: output.east!(), dir2: output.west!() });

        // Check where a cross spawned at earlier
        if (crosses[0] === 'NE' || crosses[0] === 'SW')
          return output.west!();
        if (crosses[0] === 'NW' || crosses[0] === 'SE')
          return output.east!();

        // Invalid data on the cross, output both dirs
        return output.twoDirs!({ dir1: output.east!(), dir2: output.west!() });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        twoDirs: {
          en: '${dir1}/${dir2}',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 2 Frigid Twister Reminder',
      // Frigid Twister continues for ~5s after Imitation Blizzard
      // Call to Avoid Twister
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: ['7614', '7602'], capture: true },
      condition: (data) => {
        if (
          data.marbleDragonImitationRainCount === 2 &&
          data.marbleDragonImitationBlizzardCount === 3
        )
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.avoidTwister!(),
      outputStrings: {
        avoidTwister: {
          en: 'Avoid Twister',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Frigid Dive Direction',
      // Prior to Frigid Dive (7796), boss casts unknown_7795 which is it moving to the dive position
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7795', capture: true },
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Frigid Dive Direction: Wrong actor count ${actors.length}`,
          );
          return;
        }
        data.marbleDragonDiveDirNum = Directions.xyTo8DirNum(
          actor.PosX,
          actor.PosY,
          marbleDragonCenterX,
          marbleDragonCenterY,
        );
      },
      alertText: (data, _matches, output) => {
        if (data.marbleDragonDiveDirNum === undefined) {
          return output.bossDiveThenTowers!();
        }
        const dir1 = output[Directions.outputFrom8DirNum(data.marbleDragonDiveDirNum)]!();
        const dir2 = output[Directions.outputFrom8DirNum((data.marbleDragonDiveDirNum + 4) % 8)]!();
        return output.diveDirsThenTowers!({ dir1: dir1, dir2: dir2 });
      },
      run: (data) => {
        data.marbleDragonIsFrigidDive = true;
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        diveDirsThenTowers: {
          en: '${dir1}/${dir2} Dive => Towers',
        },
        bossDiveThenTowers: {
          en: 'Boss Dive => Towers',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Towers 1 and 3',
      // Frigid Dive (7796) triggers the center cross puddle to go off
      // Using Frigid Dive (93BB) damage 7.7s cast to trigger call
      // Players can modify cardinals/intercards to an assigned tower direction
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '93BB', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      alertText: (data, _matches, output) => {
        if (data.marbleDragonDiveDirNum === undefined) {
          return output.towersUnknownDir!();
        }
        const dir1 = output[Directions.outputFrom8DirNum(data.marbleDragonDiveDirNum)]!();
        const dir2 = output[Directions.outputFrom8DirNum((data.marbleDragonDiveDirNum + 4) % 8)]!();
        // `marbleDragonDiveDirNum % 2 === 0` = this is aimed at a cardinal, so intercard towers are second
        if (data.marbleDragonDiveDirNum % 2 === 0)
          return output.towerDirsThenIntercardTowers!({ dir1: dir1, dir2: dir2 });
        return output.towerDirsThenCardinalTowers!({ dir1: dir1, dir2: dir2 });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        towersUnknownDir: {
          en: 'Towers => Cardinal/Intercard Towers',
        },
        towerDirsThenCardinalTowers: {
          en: '${dir1}/${dir2} Towers => Cardinal Towers',
        },
        towerDirsThenIntercardTowers: {
          en: '${dir1}/${dir2} Towers => Intercard Towers',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Towers 2 and 4',
      // Once Imitation Blizzard 7614, 0.7s and 7615, 3.7s casts have gone off, towers appear in ~0.4s
      // These tower casts occur after Wicked Water as well
      // Using the cross (7614) Imitation Blizzard as it only occurs once per dive versus the 7615 (towers)
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '7614', capture: true },
      condition: (data) => {
        // Only execute during Frigid Dive Towers
        return data.marbleDragonIsFrigidDive;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.marbleDragonDiveDirNum === undefined) {
          return output.unknownTowers!();
        }

        // `marbleDragonDiveDirNum % 2 === 0` = this is aimed at a cardinal, so intercard towers are second
        if (data.marbleDragonDiveDirNum % 2 === 0)
          return output.intercardTowers!();
        return output.cardinalTowers!();
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        unknownTowers: {
          en: 'Cardinal/Intercard Towers',
        },
        cardinalTowers: {
          en: 'Cardinal Towers',
        },
        intercardTowers: {
          en: 'Intercardinal Towers',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Frigid Dive Cleanup',
      // Ability conflicts in timing with towers 2, this trigger fires before in emulator
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7615', capture: false },
      condition: (data) => {
        // Only execute during Frigid Dive Towers
        return data.marbleDragonIsFrigidDive;
      },
      delaySeconds: 1,
      suppressSeconds: 1,
      run: (data) => {
        // Clear data for subsequent Frigid Dive/Towers
        data.marbleDragonIsFrigidDive = false;
        data.marbleDragonDiveDirNum = undefined;
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Lifeless Legacy',
      // castTime is 35s
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '7798', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 7,
      response: Responses.bigAoe(),
    },
    {
      id: 'Occult Crescent Marble Dragon Wicked Water',
      // Boss casts 77E7 Wicked Water, several players get marked
      // After cast end, marked players affected the following:
      // 3AA Throttle (46s)
      // 10EE Wicked Water (46s)
      // An Imitation Blizzard hit changes Wicked Water into 10EF Gelid Gaol
      // Players must be broken out of the gaol to clear the Throttle debuff
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonWickedWater], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 20, // Time until reminder
      infoText: (_data, _matches, output) => output.wickedWaterOnYou!(),
      run: (data) => data.marbleDragonHasWickedWater = true,
      outputStrings: {
        wickedWaterOnYou: {
          en: 'Wicked Water on YOU',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Wicked Water Reminder',
      // Need to avoid getting hit by multiple Imitation Blizzards
      // Cross Imitation Blizzards should be avoided
      // Cross Imitation Blizzards resolve at ~23s remaining on the debuff
      // Needs some delay to not conflict with Draconiform Motion callouts
      // 20s is ~2s after Draconiform Motion and gives ~3s to get hit
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.marbleDragonWickedWater], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 20,
      alertText: (_data, _matches, output) => output.getHitByIceExplosion!(),
      outputStrings: {
        getHitByIceExplosion: {
          en: 'Get hit by ice explosion',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Gelid Gaol',
      // If capture someone in Gaol, trigger break Gaols
      type: 'GainsEffect',
      netRegex: { effectId: '10EF', capture: false },
      condition: (data) => {
        // Only output for those that do not have Wicked Water
        if (data.marbleDragonHasWickedWater)
          return false;
        return true;
      },
      suppressSeconds: 47, // Duration of Wicked Water + 1s
      alertText: (_data, _matches, output) => output.breakGaols!(),
      outputStrings: {
        breakGaols: {
          en: 'Break Gaols',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 6 and 7 Puddles',
      // Call East/West or North/South later for movement after Draconiform Motion and use data collected here for later calls
      // Twisters will rotate CW or CCW
      // Cross puddles are either E/W or N/S
      //             (-337, 135)
      // (-359, 157)             (-315, 157)
      //             (-337, 179)
      // BNpcID 2014547 combatant is responsible for the cross puddles, accessible around Imitation Rain (7797) NetworkAOEAbility
      type: 'Ability',
      netRegex: { source: 'Marble Dragon', id: '7797', capture: false },
      condition: (data) => {
        if (
          data.marbleDragonImitationRainCount === 6 ||
          data.marbleDragonImitationRainCount === 7
        )
          return true;
        return false;
      },
      delaySeconds: 0.5, // NPC Add available before or slightly after the cast
      suppressSeconds: 1,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const crosses = actors.filter((c) => c.BNpcID === 2014547);
        if (crosses.length !== 2 || crosses === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 6 and 7 Puddles: Wrong actor count ${crosses.length}`,
          );
          return;
        }

        const cross1 = crosses[0];
        const cross2 = crosses[1];
        if (cross1 === undefined || cross2 === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 6 and 7 Puddles: Invalid actors.`,
          );
          return;
        }

        // Function to find and validate a puddle location during Imitation Rain 6
        const getPuddleLocation = (
          x: number,
          y: number,
        ): 'N' | 'E' | 'S' | 'W' | undefined => {
          // N/S Puddles
          if (x > -338 && x < -336) {
            if (y > 134 && y < 136)
              return 'N';
            if (y > 178 && y < 180)
              return 'S';
          }
          // E/W Puddles
          if (y > 156 && y < 158) {
            if (x > -316 && x < -314)
              return 'E';
            if (x > -360 && x < -358)
              return 'W';
          }
          return undefined;
        };
        const getCrossLocation = (
          combatant: PluginCombatantState,
        ): 'N' | 'E' | 'S' | 'W' | undefined => {
          const x = combatant.PosX;
          const y = combatant.PosY;
          const result = getPuddleLocation(x, y);
          if (result === undefined) {
            console.error(
              `Occult Crescent Marble Dragon Imitation Rain 6 and 7 Puddles: Unexpected puddle location (${x}, ${y})`,
            );
          }
          return result;
        };

        // Get Locations of cross puddles
        const cross1Location = getCrossLocation(cross1);
        const cross2Location = getCrossLocation(cross2);

        // Clear data from previous Imitation Rains
        data.marbleDragonImitationRainCrosses = [];

        if (cross1Location !== undefined)
          data.marbleDragonImitationRainCrosses.push(cross1Location);
        if (cross2Location !== undefined)
          data.marbleDragonImitationRainCrosses.push(cross2Location);

        // East/West or North/South call based on puddle location
        if (data.marbleDragonImitationRainCrosses !== undefined) {
          const dir = data.marbleDragonImitationRainCrosses[0];
          if (dir === 'N' || dir === 'S')
            data.marbleDragonImitationRainDir = 'east';
          if (dir === 'E' || dir === 'W')
            data.marbleDragonImitationRainDir = 'north';
        }
      },
      infoText: (data, _matches, output) => {
        // Unable to predict on Imitation Rain 6 due to not yet knowing CW or CCW at this time
        if (data.marbleDragonImitationRainCount !== 7)
          return;

        if (
          data.marbleDragonImitationRainDir === undefined ||
          data.marbleDragonTwisterClock === undefined
        )
          return;
        const clock = data.marbleDragonTwisterClock;
        const crosses = data.marbleDragonImitationRainCrosses;

        // Only need one puddle needed
        if (crosses === undefined || crosses[0] === undefined)
          return;
        if (
          (clock === 'clockwise' &&
            (crosses[0] === 'N' || crosses[0] === 'S')) ||
          (clock === 'counterclockwise' &&
            (crosses[0] === 'E' || crosses[0] === 'W'))
        )
          return output.circlesFirst!();
        if (
          (clock === 'clockwise' &&
            (crosses[0] === 'E' || crosses[0] === 'W')) ||
          (clock === 'counterclockwise' &&
            (crosses[0] === 'N' || crosses[0] === 'S'))
        )
          return output.crossesFirst!();
      },
      outputStrings: {
        circlesFirst: {
          en: 'Circles First',
        },
        crossesFirst: {
          en: 'Crosses First',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 6 Pattern',
      // Twisters will rotate CW or CCW and start moving 1s before end of Draconiform Motion (77C1)
      // They spawn at (-354.5, 174.5) and (-319.5, 139.5) as combatant "Icewind" about ~1.7s after Frigid Twister (7638)
      // About 3.2s later, they start using Frigid Twister (76CF) abilities
      // At Spawn headings are ~1.95 for southwest side, ~-0.57 for northeast
      // They start turning ~0.5s after AddedCombatant, but these turns seem random
      // Heading appears to snap into expected place once they start moving, but timing for each can vary slightly
      type: 'AddedCombatant',
      netRegex: { name: 'Icewind', capture: true },
      condition: (data) => {
        if (data.marbleDragonImitationRainCount === 6)
          return true;
        return false;
      },
      delaySeconds: 5.7, // Before the move, the actor seems to just spin randomly in place
      suppressSeconds: 1, // Only need one of the combatants
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.id, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `Occult Crescent Marble Dragon Imitation Rain 6 Pattern: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const x = actor.PosX;
        const facing = Directions.hdgTo16DirNum(actor.Heading);
        const getTwisterSide = (
          x: number,
        ): 'southwest' | 'northeast' | undefined => {
          if (x < marbleDragonCenterX)
            return 'southwest';
          if (x > marbleDragonCenterX)
            return 'northeast';
          return undefined;
        };

        const side = getTwisterSide(x);
        if (
          (side === 'southwest' && (facing >= 13 && facing <= 15)) || // WNW to NNW
          (side === 'northeast' && (facing >= 5 && facing <= 7)) // ESE to SSW
        )
          data.marbleDragonTwisterClock = 'clockwise';
        else if (
          (side === 'southwest' && (facing >= 5 && facing <= 7)) || // ESE to SSW
          (side === 'northeast' && (facing >= 13 && facing <= 15)) // WNW to NNW
        )
          data.marbleDragonTwisterClock = 'counterclockwise';
      },
      infoText: (data, _matches, output) => {
        if (data.marbleDragonTwisterClock === undefined)
          return;
        const clock = data.marbleDragonTwisterClock;
        const crosses = data.marbleDragonImitationRainCrosses;
        const dir = clock === 'clockwise'
          ? output.northSouth!()
          : output.eastWest!();
        // Only need one puddle needed
        if (crosses === undefined || crosses[0] === undefined)
          return output.dirClock!({ dir: dir, clock: output[clock]!() });
        if (
          (clock === 'clockwise' &&
            (crosses[0] === 'N' || crosses[0] === 'S')) ||
          (clock === 'counterclockwise' &&
            (crosses[0] === 'E' || crosses[0] === 'W'))
        )
          return output.dirCirclesFirst!({
            dir: dir,
            clock: output[clock]!(),
          });
        if (
          (clock === 'clockwise' &&
            (crosses[0] === 'E' || crosses[0] === 'W')) ||
          (clock === 'counterclockwise' &&
            (crosses[0] === 'N' || crosses[0] === 'S'))
        )
          return output.dirCrossesFirst!({
            dir: dir,
            clock: output[clock]!(),
          });
        return output.dirClock!({ dir: dir, clock: output[clock]!() });
      },
      outputStrings: {
        eastWest: {
          en: 'East/West',
        },
        northSouth: {
          en: 'North/South',
        },
        dirCrossesFirst: {
          en: '${dir}: Crosses First + ${clock}',
        },
        dirCirclesFirst: {
          en: '${dir}: Circles First + ${clock}',
        },
        dirClock: {
          en: '${dir}: ${clock}',
        },
        clockwise: Outputs.clockwise,
        counterclockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Towers 5 and 6',
      // Ball of Ice A716 spawns the towers
      // Towers are either vertical (2 columns of 3) or horizontal (2 rows of 3)
      // The StartsUsing 20 log lines can be wrong, but the StartsUsingExtra 263 lines seem to be correct
      // There are six Marble Dragon actors that cast Imitation Blizzard 7615 which signifies end of towers
      // If StartsUsingExtra lines are wrong, may need to change to OverlayPlugin
      // Horizontal:
      // (-346.019, 151.006) (-337.016, 151.006) (-328.013, 151.006)
      // (-346.019, 162.999) (-337.016, 162.999) (-328.013, 162.999)
      // Vertical:
      // (-331.004, 148.015) (-342.998, 148.015)
      // (-331.004, 157.018) (-342.998, 157.018)
      // (-331.004, 165.990) (-342.998, 165.990)
      // Since the coords are unique between patterns, only need to check one tower's x or y coord
      // TODO: Additionall call earlier with infoText?
      type: 'StartsUsingExtra',
      netRegex: { id: 'A716', capture: true },
      condition: (data) => {
        // Only execute outside Frigid Dive Towers
        return !data.marbleDragonIsFrigidDive;
      },
      suppressSeconds: 1,
      alertText: (data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        // Check for next safe spots, reverse of the first call
        const clock = data.marbleDragonTwisterClock;
        const dir = clock === 'clockwise'
          ? output.eastWest!()
          : output.northSouth!();

        if ((x > -332 && x < -330) || (x > -344 && x < -342)) {
          if (clock !== undefined)
            return output.getVerticalTowersDir!({ dir: dir });
          return output.getVerticalTowers!();
        }

        if ((y > 150 && y < 152) || (y > 162 && y < 164)) {
          if (clock !== undefined)
            return output.getHorizontalTowersDir!({ dir: dir });
          return output.getHorizontalTowers!();
        }

        // Unrecognized coordinates
        console.error(
          `Occult Crescent Marble Dragon Towers 5 and 6: Unrecognized coordinates (${x}, ${y})`,
        );
        if (clock !== undefined)
          return output.getTowersDir!({ text: output.getTowers!(), dir: dir });
        return output.getTowers!();
      },
      outputStrings: {
        eastWest: {
          en: 'East/West',
        },
        northSouth: {
          en: 'North/South',
        },
        getTowers: Outputs.getTowers,
        getVerticalTowers: {
          en: 'Get Vertical Towers',
        },
        getHorizontalTowers: {
          en: 'Get Horizontal Towers',
        },
        getTowersDir: {
          en: '${text} => ${dir}',
        },
        getVerticalTowersDir: {
          en: 'Get Vertical Towers => ${dir}',
        },
        getHorizontalTowersDir: {
          en: 'Get Horizontal Towers => ${dir}',
        },
      },
    },
    {
      id: 'Occult Crescent Marble Dragon Imitation Rain 6 and 7 Second Safe Spots',
      // Imitation Blizzard 7615 (tower)
      type: 'StartsUsing',
      netRegex: { source: 'Marble Dragon', id: '7615', capture: true },
      condition: (data) => {
        // Only execute outside Frigid Dive Towers
        return !data.marbleDragonIsFrigidDive;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime), // After tower snapshots
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        // Check for next safe spots, reverse of the first call
        const clock = data.marbleDragonTwisterClock;
        if (clock === 'clockwise')
          return output.eastWest!();
        if (clock === 'counterclockwise')
          return output.northSouth!();
      },
      outputStrings: {
        eastWest: {
          en: 'East/West',
        },
        northSouth: {
          en: 'North/South',
        },
      },
    },
    {
      id: 'Occult Crescent Guardian Wraith Scream',
      // 10.5s castTime
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Wraith', id: 'A7CE', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Guardian Golem Toxic Minerals',
      // Guardian Golem casts Toxic Minerals (A352), nearby players get affected by 25s Toxic Minerals (115C)
      // Phantom Oracle must use Recuperation to cleanse subsequent Doom from players
      // A 21s Doom is applied after the 25s Toxic Minerals effect ends
      // Recuperation adds a 20s buff to players and on expiration will cleanse the Doom
      // The Doom can also be cleansed with Esuna
      // TODO: Filter for Phantom Oracle
      // TODO: Cleanse call for Doom, but it is not yet logged, it's probably 11CE?
      type: 'GainsEffect',
      netRegex: { effectId: '115C', capture: true },
      condition: Conditions.targetIsYou(),
      // 25s - 20s, plus some delay for buff/debuff propagation
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 20 + 0.5,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.recuperation!(),
      outputStrings: {
        recuperation: {
          en: 'Recuperation (if possible)',
        },
      },
    },
    {
      id: 'Occult Crescent Guardian Bersker Raging Slice',
      // Untelegraphed long line cleave that goes through walls
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Berserker', id: 'A7CF', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Guardian Knight Buster Knuckles',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Knight', id: 'A7D4', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'Occult Crescent Guardian Knight Earthquake',
      // Using Buster Knuckles (A7D5) delayed until 8.7s castTime as trigger for Earthquake (A7ED)
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Knight', id: 'A7D4', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      response: Responses.getIn(),
    },
    {
      id: 'Occult Crescent Guardian Knight Line of Fire',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Knight', id: 'A7D5', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Guardian Weapon Whirl of Rage',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Weapon', id: 'A708', capture: false },
      infoText: (_data, _matches, output) => output.outOfMelee!(),
      outputStrings: {
        outOfMelee: Outputs.outOfMelee,
      },
    },
    {
      id: 'Occult Crescent Guardian Weapon Smite of Rage',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Weapon', id: 'A707', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Master Lockward',
      // Players must not intertupt Cunning Keywork (A7E4) 5.7s cast from Master Lockward
      type: 'AddedCombatant',
      netRegex: { name: 'Master Lockward', capture: false },
      infoText: (_data, _matches, output) => output.spawned!(),
      outputStrings: {
        spawned: {
          en: 'Master Lockward spawned',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Unsealed Aura',
      // A264 Unsealed Aura cast
      // 9BE7 Unsealed Aura damage
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: 'A264', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Magitaur Unseal Tank Autos Near/Far',
      // A241 Attacks will go to closest players
      // A242 Attacks will go to furthest players
      // Boss also gains an effect and weapon the specific weapon glows
      // Yellow Axe = 2 closest players
      // Blue Lance = 2 furthest players
      // Applies Unsealed to the boss (10F3):
      // A242 applies it with count of '353' => Tanks Far, Party Close
      // A241 applies it with count of '354' => Tanks Close, Party Far
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: ['A241', 'A242'], capture: true },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A241')
          return output.tanksNear!();
        return output.tanksFar!();
      },
      outputStrings: {
        tanksFar: {
          en: 'Tanks Far (Party Close) x3',
        },
        tanksNear: {
          en: 'Tanks Close (Party Far) x3',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Assassin\'s Dagger Pattern',
      // A261 StartsUsingExtra lines contain different y values between patterns
      // Pattern 1 (Letters in BAP Daggers)
      // (672.384, -689.963)
      // (727.622, -689.963)
      // (700.003, -642.110)
      // Pattern 2 (Numbers in BAP Daggers)
      // (672.384, -658.071)
      // (727.622, -658.071)
      // (700.003, -705.435)
      // BAP Daggers:
      // See https://www.youtube.com/playlist?list=PL7RVNORIbhth-I3mFGEqRknCpSlP7EWDc youtube playlist for explainer videos
      // Supposedly created by a group named "BAP", in theory a group formed during Baldesion Arsenal on Primal DC
      // 1. Start on letter or number on their square for 5 hits, then dodge axeblow/lanceblow
      // 2. After dodge, party waits for 1 hit and then waits on D marker until lanceblow/axeblow cast
      type: 'StartsUsingExtra',
      netRegex: { id: 'A261', capture: true },
      suppressSeconds: 1, // There are three daggers, only capture one
      infoText: (data, matches, output) => {
        // Only need to examine one dagger
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        // Pattern 1
        if ((y > -691 && y < -688) || (y > -643 && y < -640)) {
          if (data.triggerSetConfig.magitaurDaggers === 'bap')
            return output.startOnLetters!();
          return output.pattern1!();
        }

        // Pattern 2
        if ((y > -660 && y < -657) || (y > -707 && y < -704)) {
          if (data.triggerSetConfig.magitaurDaggers === 'bap')
            return output.startOnNumbers!();
          return output.pattern2!();
        }

        // Log error for unrecognized coordinates
        console.error(
          `Occult Crescent Magitaur Assassin\'s Dagger Pattern: Unrecognized coordinates (${x}, ${y})`,
        );
      },
      tts: (data, matches, output) => {
        const y = parseFloat(matches.y);

        // Pattern 1
        if ((y > -691 && y < -688) || (y > -643 && y < -640)) {
          if (data.triggerSetConfig.magitaurDaggers === 'none')
            return output.pattern1TtsText!();
        }
      },
      outputStrings: {
        startOnLetters: {
          en: 'Start on Letters',
        },
        startOnNumbers: {
          en: 'Start on Numbers',
        },
        pattern1: {
          en: '⅄ Daggers', // Displays an upside down Y
        },
        pattern1TtsText: {
          en: 'Flipped Y Daggers',
        },
        pattern2: {
          en: 'Y Daggers',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Critical Axeblow/Lanceblow Counter',
      // For tracking which part in the encounter the cast is
      // 1 = Assassin's Dagger Cast
      // 2 = Assassin's Dagger Opposite Cast
      // 3 = Sage's Blow Cast
      // 4 = Sage's Blow Opposite Cast
      // 5 = Rune Axe Lanceblow
      // 6 = Rune Axe Axeblow
      // 7 = Assassin's Dagger Lanceblow
      // 8 = Assassin's Dagger Axeblow
      // 9 = Holy Lance Lanceblow
      // 10 = Holy Lance Axeblow
      // 11 = Assassin's Dagger Lanceblow
      // 12 = Assassin's Dagger Axeblow
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A247', 'A24B'], capture: false },
      run: (data) => {
        data.magitaurCriticalBlowCount = data.magitaurCriticalBlowCount + 1;
      },
    },
    {
      id: 'Occult Crescent Magitaur Critical Axeblow/Lanceblow',
      // Do not trigger for the Lanceblow during Rune Axe or during Holy Lance
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A247', 'A24B'], capture: true },
      condition: (data) => {
        return data.magitaurCriticalBlowCount !== 5 && data.magitaurCriticalBlowCount !== 9;
      },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A247')
          return output.out!();
        return output.in!();
      },
      outputStrings: magitaurOutputStrings,
    },
    {
      id: 'Occult Crescent Magitaur Forked Fury',
      // Hits 3 nearest and 3 furthest players with tankbuster
      // TODO: Determine close/far autos from boss buff?
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: 'A265', capture: false },
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.nearFarTankCleave!();
        return output.avoidCleave!();
      },
      outputStrings: {
        avoidCleave: {
          en: 'Be on boss hitbox (avoid tank cleaves)',
          de: 'Geh auf den Kreis vom Boss (vermeide Tank Cleaves)',
          fr: 'Sur la hitbox (évitez les tanks cleaves)',
          ja: 'ボス背面のサークル上に',
          cn: '站在目标圈上 (远离坦克死刑)',
          ko: '보스 히트박스 경계에 있기 (광역 탱버 피하기)',
        },
        nearFarTankCleave: {
          en: 'Near and far tank cleave => 2 tank autos',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Aura Burst / Holy Canisters',
      // A25A Aura Burst (Yellow) cast or A25B Holy (Blue) cast
      // Tell for which canisters to focus
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A25A', 'A25B'], capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'A25A')
          return output.yellowCanisters!();
        return output.blueCanisters!();
      },
      outputStrings: {
        blueCanisters: {
          en: 'Attack Blue Canisters (Lance)',
        },
        yellowCanisters: {
          en: 'Attack Yellow Canisters (Axe)',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Aura Burst / Holy',
      // This is a long 18.7s cast + 1s damage
      // A25A Aura Burst (Yellow) cast or A25B Holy (Blue) cast
      // 9BE5 Aura Burst damage or 9BE6 Holy damage
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: ['A25A', 'A25B'], capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Magitaur Sage\'s Staff',
      // Boss spawns three staves that will fire an untelegraphed line at nearest target
      // A25F Mana Expulsion is the untelegraphed line stack damage 14.4s after
      // There is an In/Out dodge before Mana Expulsion
      // These can be focused into a single stack, but some parties split into groups
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A25E', capture: false },
      delaySeconds: 8.5,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.lineStackStaff!(),
      outputStrings: {
        lineStackStaff: {
          en: 'Line stack at staff',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Rune Axe Debuffs',
      // Applied 1s after Rune Axe (A24F) cast and 1s before first headmarkers
      // Prey: Greater Axebit (10F1) 9s
      // Prey: Lesser Axebit (10F0) 13s
      // Prey: Greater Axebit (10F1) 21s
      // Prey: Lesser Axebit (10F0) 21s
      // TODO: Fires multiple times for players with more than one debuff
      type: 'GainsEffect',
      netRegex: { effectId: ['10F0', '10F1'], capture: true },
      condition: Conditions.targetIsYou(),
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = magitaurOutputStrings;

        const duration = parseFloat(matches.duration);
        if (duration < 15) {
          if (matches.effectId === '10F1') {
            data.magitaurRuneAxeDebuff = 'big1';
            return { alarmText: output.rune1BigAoeOnYou!() };
          }
          data.magitaurRuneAxeDebuff = 'small1';
          return { infoText: output.rune1SmallAoeOnYou!() };
        }

        if (matches.effectId === '10F1') {
          data.magitaurRuneAxeDebuff = 'big2';
          return { infoText: output.rune2BigAoeOnYouLater!() };
        }
        data.magitaurRuneAxeDebuff = 'small2';
        return { infoText: output.rune2SmallAoeOnYouLater!() };
      },
    },
    {
      id: 'Occult Crescent Magitaur Ruinous Rune Counter',
      // 1: Big Ruinous Rune
      // 2: Small Ruinous Rune x3
      // 3: Big Ruinous Rune, Small Ruinous Rune x2
      // 4: This happens on #2 ability to prevent Lanceblow reminder from retriggering
      // 5: Happens in Ruinous Rune 2 Reminder prevent future Critical Lanceblows from retriggering
      type: 'HeadMarker',
      netRegex: {
        id: [headMarkerData.magitaurBigRuinousRune, headMarkerData.magitaurSmallRuinousRune],
        capture: false,
      },
      suppressSeconds: 1,
      run: (data) => {
        data.magitaurRuinousRuneCount = data.magitaurRuinousRuneCount + 1;
      },
    },
    {
      id: 'Occult Crescent Magitaur Big Ruinous Rune 1 Target',
      // This can be placed N, SE, or SW at the wall by Universal Cylinders (purple circles)
      // Explosion must avoid square tiles
      // Earlier, players were given debuff at end of Rune Axe (A24F) cast
      // Prey: Greater Axebit (10F1) 9s
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.magitaurBigRuinousRune], capture: true },
      condition: (data) => {
        // Don't trigger for players with debuff as they received trigger 1s prior
        if (
          data.magitaurRuinousRuneCount === 1 &&
          data.magitaurRuneAxeDebuff === undefined
        )
          return true;
        return false;
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = magitaurOutputStrings;
        const target = matches.target;

        return {
          infoText: output.rune1BigAoeOnPlayer!({
            player: data.party.member(target),
          }),
        };
      },
    },
    {
      id: 'Occult Crescent Magitaur Small Ruinous Rune 1 Targets',
      // These must be placed on separate squares
      // Players are also given a debuff:
      // Prey: Lesser Axebit (10F0) 13s
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData.magitaurSmallRuinousRune], capture: true },
      condition: (data) => {
        return data.magitaurRuinousRuneCount === 2;
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = magitaurOutputStrings;
        data.magitaurRuneTargets.push(matches.target);
        if (data.magitaurRuneTargets.length < 3)
          return;

        // Don't repeat for small aoe players or call for players with debuffs
        if (data.magitaurRuneAxeDebuff !== undefined)
          return;

        const target1 = data.magitaurRuneTargets[0];
        const target2 = data.magitaurRuneTargets[1];
        const target3 = data.magitaurRuneTargets[2];

        return {
          infoText: output.rune1SmallAoesOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
            player3: data.party.member(target3),
          }),
        };
      },
    },
    {
      id: 'Occult Crescent Magitaur Rune Axe Lanceblow',
      // Trigger once the big Ruinous Rune (A251) has gone off
      // Players with first set of small Ruinous Runes (A250) stay on square
      // Rest of players must get off
      // The A251 aoe occurs with a Lanceblow almost immediately after, so pre-call that
      // NOTE: This is for magitaurCriticalBlowCount === 5
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A251', capture: false },
      condition: (data) => {
        // Only execute on the first Big Ruinous Rune ability
        return data.magitaurRuinousRuneCount === 2;
      },
      suppressSeconds: 1, // In case of aoes hitting other players
      alertText: (data, _matches, output) => {
        const target1 = data.magitaurRuneTargets[0];
        const target2 = data.magitaurRuneTargets[1];
        const target3 = data.magitaurRuneTargets[2];

        if (data.me === target1 || data.me === target2 || data.me === target3)
          return output.rune1SmallAoEStayThenIn!();
        return output.in!();
      },
      outputStrings: magitaurOutputStrings,
    },
    {
      id: 'Occult Crescent Magitaur Ruinous Rune 2 Targets',
      // Second set has a big and two smalls resolve simultaneously
      // These markers come out about 0.1~0.3s before set one smalls expire
      // There is some trigger overlap to handle for unlucky players who get both sets
      // Big resolves like usual
      // Players with small will be on their own square with party on 3rd square
      // Players are also given a debuff:
      // Prey: Greater Axebit (10F1) 21s
      // Prey: Lesser Axebit (10F0) 21s
      type: 'HeadMarker',
      netRegex: {
        id: [headMarkerData.magitaurBigRuinousRune, headMarkerData.magitaurSmallRuinousRune],
        capture: true,
      },
      condition: (data) => {
        // Big Ruinous Rune = 1, 3x Small Ruinous Runes = 2
        return data.magitaurRuinousRuneCount === 3;
      },
      preRun: (data, matches) => {
        if (matches.id === headMarkerData.magitaurBigRuinousRune)
          data.magitaurBigRune2Target = matches.target;
        else if (matches.id === headMarkerData.magitaurSmallRuinousRune)
          data.magitaurRune2Targets.push(matches.target);
      },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = magitaurOutputStrings;
        if (data.magitaurBigRune2Target === undefined || data.magitaurRune2Targets.length < 2)
          return;

        // Lanceblow call happens here for the player with small aoe from round 1
        // Do not output for them to avoid duplicate
        const rune1Small1 = data.magitaurRuneTargets[0];
        const rune1Small2 = data.magitaurRuneTargets[1];
        const rune1Small3 = data.magitaurRuneTargets[2];
        if (
          data.me === rune1Small1 ||
          data.me === rune1Small2 ||
          data.me === rune1Small3
        )
          return;

        const big = data.magitaurBigRune2Target;
        const small1 = data.magitaurRune2Targets[0];
        const small2 = data.magitaurRune2Targets[1];

        // These three players receive alert trigger in ~3s with the info
        if (data.me === big || data.me === small1 || data.me === small2)
          return;

        return {
          infoText: output.rune2AoesOnPlayers!({
            player1: data.party.member(big),
            player2: data.party.member(small1),
            player3: data.party.member(small2),
          }),
        };
      },
    },
    {
      id: 'Occult Crescent Magitaur Small Ruinous Rune Lanceblow Reminder',
      // Trigger on Small Ruinous Rune (A250) aoe
      // Players have ~2.1s to move based on damage cast timing of Critical Lanceblow
      // NOTE: This occurs for magitaurCriticalBlowCount === 5
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A250', capture: true },
      condition: (data, matches) => {
        // This could be altered to not call for players without markers, but
        // calling for player that got hit with the aoe could also save a life
        if (matches.target === data.me && data.magitaurRuinousRuneCount === 3)
          return true;

        // Players that get hit and are not targeted do not get an output
        return false;
      },
      alertText: (data, _matches, output) => {
        // Check if player has a marker again
        const big = data.magitaurBigRune2Target;
        const small1 = data.magitaurRune2Targets[0];
        const small2 = data.magitaurRune2Targets[1];
        if (data.me === big)
          return output.rune2InBigAoeOnYou!();
        if (data.me === small1 || data.me === small2)
          return output.rune2InSmallAoeOnYou!();
        return output.inThenOnSquare!();
      },
      outputStrings: magitaurOutputStrings,
    },
    {
      id: 'Occult Crescent Magitaur Small Ruinous Rune 1 Ability Tracker',
      // Trigger on Small Ruinous Rune (A250) aoe
      // Prevents trigger of Lanceblow Reminder on second set
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: 'A250', capture: false },
      condition: (data) => {
        return data.magitaurRuinousRuneCount === 3;
      },
      delaySeconds: 1, // Delay time for first set of small Ruinous Runes aoes to propogate
      suppressSeconds: 1,
      run: (data) => {
        data.magitaurRuinousRuneCount = 4;
      },
    },
    {
      id: 'Occult Crescent Magitaur Ruinous Rune 2 Reminder',
      // Capture either alliance's Critical Lanceblow damage cast
      // Using castTime of A24B is unreliable since damage cast comes later
      type: 'Ability',
      netRegex: { source: 'Magitaur', id: ['A24E', 'A24D'], capture: false },
      condition: (data) => {
        return data.magitaurRuinousRuneCount === 4;
      },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const big = data.magitaurBigRune2Target;
        const small1 = data.magitaurRune2Targets[0];
        const small2 = data.magitaurRune2Targets[1];

        if (data.me === big)
          return output.rune2BigAoeOnYouReminder!();
        if (data.me === small1 || data.me === small2)
          return output.rune2SmallAoeOnYouReminder!();

        return output.rune2AvoidPlayers!({
          player1: data.party.member(small1),
          player2: data.party.member(small2),
        });
      },
      run: (data) => {
        // Prevent trigger from firing after
        data.magitaurRuinousRuneCount = 5;
      },
      outputStrings: magitaurOutputStrings,
    },
    {
      id: 'Occult Crescent Magitaur Lancepoint Debuffs Initial',
      // Prey: Lancepoint (10F2) is applied ~1s after Holy Lance (A255)
      // Comes up to three players in a set marked with these durations: 33s, 25s, and 17s
      // Presumably these would have gone out 1 of each time to each square if players pre-positioned
      // Can be buggy and have a refresh log
      // This might not be solvable without knowing the player's square as
      // to if they should be told to stand in middle of their square/avoid overlap
      type: 'GainsEffect',
      netRegex: { effectId: '10F2', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 34, // Duration of the debuffs +1s
      infoText: (_data, matches, output) => {
        const duration = parseFloat(matches.duration);
        if (duration < 18)
          return output.shortStackOnYou!();
        if (duration < 26)
          return output.mediumStackOnYou!();
        return output.longStackOnYou!();
      },
      outputStrings: {
        shortStackOnYou: {
          en: 'Short Stack on YOU (17)',
        },
        mediumStackOnYou: {
          en: 'Medium Stack on YOU (25)',
        },
        longStackOnYou: {
          en: 'Long Stack on YOU (33)',
        },
      },
    },
    {
      id: 'Occult Crescent Magitaur Lancelight On/Off Square',
      // Tracking A256 which seems to be related to the Lance aninmations when
      // Lancelight A258 or A259 goes off
      // TODO: Get player position for an alertText and filter?
      // Players can manually blank the outputString for the other squares in configuration
      // Holy IV targets need to avoid overlapping outside square if it isn't their turn to go out
      type: 'Ability',
      netRegex: { source: 'Luminous Lance', id: 'A256', capture: false },
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = magitaurOutputStrings;
        data.magitaurLancelightCount = data.magitaurLancelightCount + 1;
        switch (data.magitaurLancelightCount) {
          case 1: // ~13s after debuffs
            return { infoText: output.northeastOff!() };
          case 4: // ~19s after debuffs (stack 1 goes off ~2s prior)
            return { infoText: output.northeastOn!() };
          case 5: // ~21s after debuffs
            return { infoText: output.southOff!() };
          case 8: // ~27s after debuffs, (stack 2 goes off ~2s prior)
            return { infoText: output.southOn!() };
          case 9: // ~29s after debuffs
            return { infoText: output.northwestOff!() };
          case 12: // ~35s after debuffs (stack 3 goes off ~2s prior)
            return { alertText: output.out!() };
        }
      },
    },
    {
      id: 'Occult Crescent Magitaur Holy Lance Critical Lanceblow',
      // TODO: Merge Lanceblow Stack trigger here?
      // Stack headmarkers come out at this time
      // Related debuff for headmarkers is Prey: Lancepoint (10F2)
      type: 'StartsUsing',
      netRegex: { source: 'Magitaur', id: 'A24B', capture: false },
      condition: (data) => {
        return data.magitaurCriticalBlowCount === 9;
      },
      alertText: (_data, _matches, output) => output.in!(),
      outputStrings: magitaurOutputStrings,
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Vertical Crosshatch/Horizontal Crosshatch': 'Vertical/Horizontal Crosshatch',
        'Ray of Dangers Near / Ray of Expulsion Afar': 'Ray Near/Far',
        'Demonograph of Dangers Near / Demonograph of Expulsion Afar': 'Deomograph Near/Far',
        'Rotate Right / Rotate Left': 'Rotate Left/Right',
        'Cometeor of Dangers Near / Cometeor of Expulsion Afar': 'Cometeor Near/Far',
        'Gravity of Dangers Near / Gravity of Expulsion Afar': 'Gravity Near/Far',
        'Close Call to Detonate / Far Cry to Detonate': 'Close/Far to Detonate',
        'Critical Axeblow / Critical Lanceblow': 'Critical Axe/Lanceblow',
        'Critical Lanceblow / Critical Axeblow': 'CriticalLanceblow/Axeblow',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': 'Feuerball',
        'Black Star': 'Schwarz(?:e|er|es|en) Stern',
        'Clawmarks': 'Nagelmal',
        'Cloister Demon': 'Klosterdämon',
        'Crescent Berserker': 'kreszent(?:e|er|es|en) Berserker',
        'Crystal Dragon': 'Kristalldrache',
        'Death Claw': 'Todesklaue',
        'Draconic Double': 'Kristalldrachenphantom',
        'Hinkypunk': 'Irrwisch',
        'Lion Rampant': 'ungezügelt(?:e|er|es|en) Löwe',
        'Neo Garula': 'Neo Garula',
        'Nymian Petalodus': 'nymeisch(?:e|er|es|en) Petalodus',
        'Phantom Claw': 'Illusions-Todesklaue',
        'Repaired Lion': 'restauriert(?:e|er|es|en) Löwe',
      },
      'replaceText': {
        '\\(1\\)': '(1)',
        '\\(2\\)': '(2)',
        '\\(3\\)': '(3)',
        '\\(Lightning\\)': '(Blitz)',
        '\\(Wind\\)': '(Wind)',
        '\\(jump\\)': '(Sprung)',
        'Bedrock Uplift': 'Bodenhebung',
        'Blazing Flare': 'Loderndes Flare',
        'Boil Over': 'Rasender Schlag',
        'Channeled Rage': 'Tobsucht',
        'Clawing Shadow': 'Schattenklauen',
        'Clawmarks': 'Nagelmal',
        'Crystal Call': 'Kristallisierung',
        'Crystal Mirror': 'Kristallene Transposition',
        'Crystallized Energy': 'Kristallene Woge',
        'Dirty Nails': 'Dreckige Klauen',
        'Explosion': 'Explosion',
        'Fearsome Facet': 'Phantomkristalle',
        'Gigaflare': 'Gigaflare',
        'Great Ball of Fire': 'Feuerball',
        'Heated Outburst': 'Jähzorn',
        'Heightened Rage': 'Wilder Furor',
        'Hopping Mad': 'Tobender Stoß',
        'Horizontal Crosshatch': 'Horizontale Doppelnägel',
        'Karmic Drain': 'Karmischer Entzug',
        'Lethal Nails': 'Todesnägel',
        'Made Magic': 'Magiefeuer',
        'Manifold Marks': 'Multimal',
        'Primal Roar': 'Lautes Gebrüll',
        'Prismatic Wing': 'Kristallene Schwingen',
        'Raking Scratch': 'Harkenkratzer',
        'Scathing Sweep': 'Seitenhieb',
        'Seal Asunder': 'Siegelbruch',
        'Skulking Orders': 'Strafbefehl',
        'Sunderseal Roar': 'Berstendes Gebrüll',
        'The Grip of Poison': 'Tückische Resonanz',
        'Threefold Marks': 'Tripelmal',
        'Tidal Breath': 'Hauch der Gezeiten',
        'Vertical Crosshatch': 'Vertikale Doppelnägel',
        'Void Thunder III': 'Nichts-Blitzga',
        'White-hot Rage': 'Jähzorniger Schub',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': 'orbe de feu',
        'Black Star': 'Étoile noire',
        'Clawmarks': 'griffure',
        'Cloister Demon': 'démon du Cloître',
        'Crescent Berserker': 'berserker de Lunule',
        'Crystal Dragon': 'dragon cristallin',
        'Death Claw': 'Griffe de mort',
        'Draconic Double': 'double de dragon cristallin',
        'Hinkypunk': 'follet folâtre',
        'Lion Rampant': 'lion rampant',
        'Neo Garula': 'néo-garula',
        'Nymian Petalodus': 'petalodus de Nym',
        'Phantom Claw': 'mirage de Griffe de mort',
        'Repaired Lion': 'lion réparé',
      },
      'replaceText': {
        'Bedrock Uplift': 'Surrection',
        'Blazing Flare': 'Brasier ardent',
        'Boil Over': 'Poussée de colère',
        'Channeled Rage': 'Accès de fureur',
        'Clawing Shadow': 'Serres brumeuses',
        'Clawmarks': 'griffure',
        'Crystal Call': 'Cristallisation',
        'Crystal Mirror': 'Transfert cristallin',
        'Crystallized Energy': 'Onde cristalline',
        'Dirty Nails': 'Serres putrides',
        'Explosion': 'Explosion',
        'Fearsome Facet': 'Cristaux spectraux',
        'Gigaflare': 'GigaBrasier',
        'Great Ball of Fire': 'Orbes de feu',
        'Heated Outburst': 'Courroux ardent',
        'Heightened Rage': 'Déchaînement de rage',
        'Hopping Mad': 'Impulsion frénétique',
        'Horizontal Crosshatch': 'Intersection horizontale',
        'Karmic Drain': 'Érosion d\'existence',
        'Lethal Nails': 'Griffes mortelles',
        'Made Magic': 'Déferlante magique',
        'Manifold Marks': 'Marques multiples',
        'Primal Roar': 'Rugissement furieux',
        'Prismatic Wing': 'Aile cristalline',
        'Raking Scratch': 'Griffes ratisseuses',
        'Scathing Sweep': 'Fauche latérale',
        'Seal Asunder': 'Descellement destructeur',
        'Skulking Orders': 'Ordre d\'élimination',
        'Sunderseal Roar': 'Rugissement libérateur',
        'The Grip of Poison': 'Résonnance de la malfaisance',
        'Threefold Marks': 'Triple marque',
        'Tidal Breath': 'Souffle supratidal',
        'Vertical Crosshatch': 'Intersection verticale',
        'Void Thunder III': 'Méga Foudre du néant',
        'White-hot Rage': 'Rage incandescente',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': '火球',
        'Black Star': 'ブラックスター',
        'Clawmarks': 'ネイルマーク',
        'Cloister Demon': 'クロイスターデーモン',
        'Crescent Berserker': 'クレセント・バーサーカー',
        'Crystal Dragon': '水晶竜',
        'Death Claw': 'デスクロー',
        'Draconic Double': '水晶竜の幻影',
        'Hinkypunk': 'ヒンキーパンク',
        'Lion Rampant': 'ランパントライオン',
        'Neo Garula': 'ネオガルラ',
        'Nymian Petalodus': 'ニーム・ペタロドゥス',
        'Phantom Claw': 'ミラージュ・デスクロー',
        'Repaired Lion': 'リペアドライオン',
      },
      'replaceText': {
        'Bedrock Uplift': '地盤隆起',
        'Blazing Flare': 'ブレイジングフレア',
        'Boil Over': '怒発',
        'Channeled Rage': '激怒',
        'Clawing Shadow': 'ヘイズクロー',
        'Clawmarks': 'ネイルマーク',
        'Crystal Call': '晶石生成',
        'Crystal Mirror': '晶石転移',
        'Crystallized Energy': '水晶波動',
        'Dirty Nails': 'ダーティクロー',
        'Explosion': '爆発',
        'Fearsome Facet': '幻影晶石',
        'Gigaflare': 'ギガフレア',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '気炎',
        'Heightened Rage': '大激怒',
        'Hopping Mad': '震撃怒涛',
        'Horizontal Crosshatch': 'ホリゾンタル・ダブルネイル',
        'Karmic Drain': 'ライフエロージョン',
        'Lethal Nails': 'デスネイル',
        'Made Magic': '魔力放出',
        'Manifold Marks': 'マルチプルマーク',
        'Primal Roar': '大咆哮',
        'Prismatic Wing': '水晶の翼',
        'Raking Scratch': 'ネイルストリーク',
        'Scathing Sweep': '横薙ぎ',
        'Seal Asunder': '封印破壊',
        'Skulking Orders': 'パニッシングオーダー',
        'Sunderseal Roar': '壊封の咆哮',
        'The Grip of Poison': '邪気の共振',
        'Threefold Marks': 'トリプルマーク',
        'Tidal Breath': 'タイダルブレス',
        'Vertical Crosshatch': 'バーチカル・ダブルネイル',
        'Void Thunder III': 'ヴォイド・サンダガ',
        'White-hot Rage': '気炎怒涛',
      },
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': '火球',
        'Black Star': '黑色天星',
        'Clawmarks': '抓痕',
        'Cloister Demon': '回廊恶魔',
        'Crescent Berserker': '新月狂战士',
        'Crystal Dragon': '水晶龙',
        'Death Claw': '死亡爪',
        'Draconic Double': '水晶龙的幻影',
        'Hinkypunk': '鬼火苗',
        'Lion Rampant': '跃立狮',
        'Neo Garula': '进化加鲁拉',
        'Nymian Petalodus': '尼姆瓣齿鲨',
        'Phantom Claw': '死亡爪的幻影',
        'Repaired Lion': '复原狮像',
      },
      'replaceText': {
        '\\(in\\)': '(内)',
        '\\(jump\\)': '(跳)',
        '\\(Lightning\\)': '(雷)',
        '\\(out\\)': '(外)',
        '\\(Wind\\)': '(风)',
        'Bedrock Uplift': '地面隆起',
        'Blazing Flare': '炽热核爆',
        'Boil Over': '发怒',
        'Channeled Rage': '燥怒',
        'Clawing Shadow': '雾霾爪',
        'Clawmarks': '抓痕',
        'Crystal Call': '生成晶石',
        'Crystal Mirror': '转移晶石',
        'Crystallized Energy': '水晶波动',
        'Dirty Nails': '腐坏爪',
        'Explosion': '爆炸',
        'Fearsome Facet': '幻影晶石',
        'Gigaflare': '十亿核爆',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '气焰',
        'Heightened Rage': '狂怒',
        'Hopping Mad': '震击怒涛',
        'Horizontal Crosshatch': '横向双重抓',
        'Karmic Drain': '生命侵蚀',
        'Lethal Nails': '死亡甲',
        'Made Magic': '释放魔力',
        'Manifold Marks': '多重抓痕',
        'Primal Roar': '大咆哮',
        'Prismatic Wing': '水晶之翼',
        'Raking Scratch': '尖甲疾袭',
        'Scathing Sweep': '横砍',
        'Seal Asunder': '封印破坏',
        'Skulking Orders': '处刑令',
        'Sunderseal Roar': '破封的咆哮',
        'The Grip of Poison': '邪气的共振',
        'Threefold Marks': '三重抓痕',
        'Tidal Breath': '怒潮吐息',
        'Vertical Crosshatch': '纵向双重抓',
        'Void Thunder III': '虚空暴雷',
        'White-hot Rage': '气焰怒涛',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Ball of Fire': '화염 구체',
        'Black Star': '검은 죽음의 운성',
        'Clawmarks': '손톱자국',
        'Cloister Demon': '회랑 악마',
        'Crescent Berserker': '초승달 광전사',
        'Crystal Dragon': '수정룡',
        'Death Claw': '죽음손아귀',
        'Draconic Double': '수정룡의 환영',
        'Hinkypunk': '힝키펑크',
        'Lion Rampant': '직립 사자',
        'Neo Garula': '네오 가루라',
        'Nymian Petalodus': '니므 페탈로두스',
        'Phantom Claw': '죽음손아귀의 환영',
        'Repaired Lion': '복원된 사자',
      },
      'replaceText': {
        '\\(in\\)': '(안)',
        '\\(jump\\)': '(점프)',
        '\\(Lightning\\)': '(번개)',
        '\\(out\\)': '(밖)',
        '\\(Wind\\)': '(바람)',
        'Bedrock Uplift': '지반 융기',
        'Blazing Flare': '플레어 작열',
        'Boil Over': '노발',
        'Channeled Rage': '진노',
        'Clawing Shadow': '안개 발톱',
        'Clawmarks': '손톱자국',
        'Crystal Call': '수정석 생성',
        'Crystal Mirror': '수정석 이동',
        'Crystallized Energy': '수정 파동',
        'Dirty Nails': '더러운 발톱',
        'Explosion': '폭발',
        'Fearsome Facet': '환영 수정석',
        'Gigaflare': '기가플레어',
        'Great Ball of Fire': '불덩이',
        'Heated Outburst': '기염',
        'Heightened Rage': '대진노',
        'Hopping Mad': '노도의 도끼질',
        'Karmic Drain': '생명 부식',
        'Lethal Nails': '죽음의 손톱',
        'Made Magic': '마력 방출',
        'Manifold Marks': '다중 손톱자국',
        'Primal Roar': '대포효',
        'Prismatic Wing': '수정 날개',
        'Raking Scratch': '연속 손톱',
        'Scathing Sweep': '가로 후리기',
        'Seal Asunder': '봉인 파괴',
        'Skulking Orders': '처벌 지시',
        'Sunderseal Roar': '해방의 포효',
        'The Grip of Poison': '사악한 공명',
        'Threefold Marks': '삼중 손톱자국',
        'Tidal Breath': '해일 숨결',
        'Vertical Crosshatch/Horizontal Crosshatch': '세로/가로 이중 손톱',
        'Void Thunder III': '보이드 선더가',
        'White-hot Rage': '노도의 기염',
      },
    },
  ],
};

export default triggerSet;
