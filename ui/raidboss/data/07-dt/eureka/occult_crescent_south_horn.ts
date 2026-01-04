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
  phantomJob?: string;
  phantomJobLevel?: number;
  sisyphusResoundingMemoryWedge?: 'intercards' | 'cardinals' | 'unknown';
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
    de: 'In Linien sammeln auf ${player1}, ${player2}, ${player3}',
    cn: '直线分摊点 ${player1}, ${player2}, ${player3}',
    ko: '직선 쉐어 대상자 ${player1}, ${player2}, ${player3}',
    tc: '直線分攤點 ${player1}, ${player2}, ${player3}',
  },
  lineStackOnYouTankCleave: {
    en: 'Line Stack on YOU, Avoid Tank Cleave',
    de: 'In einer Linie sammeln auf DIR, Vermeide Tank-Cleave',
    cn: '直线分摊点名，躲避坦克顺劈',
    ko: '직선 쉐어 대상자, 광역 탱버 피하기',
    tc: '直線分攤點名，躲避坦克順劈',
  },
  lineStackOnYou: {
    en: 'Line Stack on YOU',
    de: 'Linien Stack auf DIR',
    fr: 'Package en ligne sur VOUS',
    ja: '直線頭割り',
    cn: '直线分摊点名',
    ko: '직선 쉐어 대상자',
    tc: '直線分攤點名',
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
    de: 'Große AoE auf DIR, Geh zur Wand bei einem lilanen Kreis',
    cn: '大圈点名, 去紫圈墙边',
    ko: '큰 징 대상자, 보라색 원이 있는 벽 쪽으로 이동',
    tc: '大圈點名, 去紫圈牆邊',
  },
  rune1SmallAoeOnYou: {
    en: 'Small aoe on YOU, Stay Square => Between Squares',
    de: 'Kleine AoE auf DIR, Steh im Viereck => Zwichen den Vierecken',
    cn: '小圈点名, 留在方块内 => 方块间',
    ko: '작은 징 대상자, 네모 칸 안에 있기 => 네모 칸 사이로 이동',
    tc: '小圈點名, 留在方塊內 => 方塊間',
  },
  rune1BigAoeOnPlayer: {
    en: 'Big AOE on ${player}, Be on Square',
    de: 'Große AoE auf ${player}, Steh im Viereck',
    cn: '大圈点 ${player}, 去方块内',
    ko: '${player} 큰 징 대상자, 네모 칸 안에 있기',
    tc: '大圈點 ${player}, 去方塊內',
  },
  rune1SmallAoesOnPlayers: {
    en: 'Small aoes on ${player1}, ${player2}, ${player3}',
    de: 'Kleine AoEs auf ${player1}, ${player2}, ${player3}',
    cn: '小圈点 ${player1}, ${player2}, ${player3}',
    ko: '${player1}, ${player2}, ${player3} 작은 징 대상자',
    tc: '小圈點 ${player1}, ${player2}, ${player3}',
  },
  rune1SmallAoEStayThenIn: {
    en: 'Stay for AOE => In, Between Squares',
    de: 'Stehenbleiben für AOE => Rein, Zwichen den Vierecken',
    cn: '留在方块外 => 内, 方块间',
    ko: '징 대기 => 네모 칸 사이로 이동',
    tc: '留在方塊外 => 內, 方塊間',
  },
  rune2BigAoeOnYouLater: {
    en: 'Big AOE on YOU (Later)',
    de: 'Große AOE auf DIR (Später)',
    cn: '大圈点名 (稍后)',
    ko: '큰 징 대상자 (나중에)',
    tc: '大圈點名 (稍後)',
  },
  rune2SmallAoeOnYouLater: {
    en: 'Small aoe on YOU (Later)',
    de: 'Kleine AOE auf DIR (Später)',
    cn: '小圈点名 (稍后)',
    ko: '작은 징 대상자 (나중에)',
    tc: '小圈點名 (稍後)',
  },
  rune2InBigAoeOnYou: {
    en: 'In, Between Squares => To Wall',
    de: 'Rein, Zwichen den Vierecken => Zur Wand',
    cn: '内, 方块间 => 去墙边',
    ko: '안, 네모 칸 사이 => 벽 쪽으로',
    tc: '內, 方塊間 => 去牆邊',
  },
  rune2InSmallAoeOnYou: {
    en: 'In, Between Squares => Solo Square',
    de: 'Rein, Zwichen den Vierecken => Einzelnes Viereck',
    cn: '内, 方块间 => 单人方块',
    ko: '안, 네모 칸 사이 => 혼자 네모 칸 안에',
    tc: '內, 方塊間 => 單人方塊',
  },
  rune2AoesOnPlayers: {
    en: 'AOEs on ${player1}, ${player2}, ${player3}',
    de: 'AOEs auf ${player1}, ${player2}, ${player3}',
    cn: '圈点 ${player1}, ${player2}, ${player3}',
    ko: '${player1}, ${player2}, ${player3} 징 대상자',
    tc: '圈點 ${player1}, ${player2}, ${player3}',
  },
  rune2AvoidPlayers: {
    en: 'On Square, Avoid ${player1} & ${player2}',
    de: 'Aufs Viereck, Vermeide ${player1} & ${player2}',
    cn: '方块内, 远离 ${player1} 和 ${player2}',
    ko: '네모 칸 안에 있기, ${player1} & ${player2} 피하기',
    tc: '方塊內, 遠離 ${player1} 和 ${player2}',
  },
  rune2SmallAoeOnYouReminder: {
    en: 'Small aoe on YOU, Be on Square (Solo)',
    de: 'Kleine AoE auf DIR, Sei auf einem Viereck (Alleine)',
    cn: '小圈点名, 去方块内 (单人)',
    ko: '작은 징 대상자, 네모 칸 안에 있기 (혼자)',
    tc: '小圈點名, 去方塊內 (單人)',
  },
  rune2BigAoeOnYouReminder: {
    en: 'Big AOE on YOU, Go to Wall by Purple Circle',
    de: 'Große AoE auf DIR, Geh zur Wand bei einem lilanen Kreis',
    cn: '大圈点名, 去紫圈墙边',
    ko: '큰 징 대상자, 보라색 원이 있는 벽 쪽으로 이동',
    tc: '大圈點名, 去紫圈牆邊',
  },
  inThenOnSquare: {
    en: 'In, between Squares => On Square',
    de: 'Rein, Zwichen den Vierecken => Auf ein Viereck',
    cn: '内, 方块间 => 方块内',
    ko: '안, 네모 칸 사이 => 네모 칸 안으로',
    tc: '內, 方塊間 => 方塊內',
  },
  northeastOff: {
    en: 'Northeast Off',
    de: 'Nordosten aus',
    cn: '右上外',
    ko: '북동쪽 밖',
    tc: '右上外',
  },
  northeastOn: {
    en: 'Northeast On',
    de: 'Nordosten an',
    cn: '右上内',
    ko: '북동쪽 안',
    tc: '右上內',
  },
  southOff: {
    en: 'South Off',
    de: 'Süden aus',
    cn: '下方外',
    ko: '남쪽 밖',
    tc: '下方外',
  },
  southOn: {
    en: 'South On',
    de: 'Süden an',
    cn: '下方内',
    ko: '남쪽 안',
    tc: '下方內',
  },
  northwestOff: {
    en: 'Northwest Off',
    de: 'Nordwesten aus',
    cn: '左上外',
    ko: '북서쪽 밖',
    tc: '左上外',
  },
  out: {
    en: 'Out, Square Corner',
    de: 'Raus, Ecke des Vierecks',
    cn: '外, 方块角落',
    ko: '밖, 네모 칸 모서리',
    tc: '外, 方塊角落',
  },
  in: {
    en: 'In, between Squares',
    de: 'Rein, Zwichen den Vierecken',
    cn: '内, 方块间',
    ko: '안, 네모 칸 사이',
    tc: '內, 方塊間',
  },
};

// Used to filter the GainsEffect
const phantomJobEffectIds = [
  '1092', // Freelancer
  '1106', // Knight
  '1107', // Berserker
  '1108', // Monk
  '1109', // Ranger
  '1110', // Oracle
  '1111', // Thief
  '110A', // Samurai
  '110B', // Bard
  '110C', // Geomancer
  '110D', // Time Mage
  '110E', // Cannonneer
  '110F', // Chemist
  '12C3', // Mystic Knight
  '12C4', // Gladiator
  '12C5', // Dancer
];

// Useful for matching on job name in condition trigger
const phantomJobData = {
  'freelancer': '1092',
  'knight': '1106',
  'berserker': '1107',
  'monk': '1108',
  'ranger': '1109',
  'oracle': '1110',
  'thief': '1111',
  'samurai': '110A',
  'bard': '110B',
  'geomancer': '110C',
  'timeMage': '110D',
  'cannoneer': '110E',
  'chemist': '110F',
  'mysticKnight': '12C3',
  'gladiator': '12C4',
  'dancer': '12C5',
} as const;

// Return if the player has a phantom job that can dispel
// Phantom Time Mage Lv 4: Dispel
const phantomCanDispel = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 4)
    return true;
  return false;
};

// Return if the player has a phantom job that can slow
// Phantom Time Mage Lv 1: Slowga
/*
const phantomCanSlow = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 1)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can cleanse
// Phantom Oracle Lv 2: Recuperation
const phantomCanCleanse = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 2)
    return true;
  return false;
};

// Return if the player has a phantom job that can freeze time
// Phantom Bard Lv 2: Romeo's Ballad (aoe)
// Phantom Dancer Lv 1 may be able to use Dance with Tempting Tango proc (single-target)
const phantomCanFreeze = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.bard && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 1)
    return true;
  return false;
};

// Return if the player has a phantom job that can suspend
// Phantom Geomancer Lv 4: Suspend
/*
const phantomCanSuspend = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.geomancer && phantomJobLevel >= 4)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can reduce tankbuster
// Phantom Knight Lv 4: Phantom Guard + Enhanced Phantom Guard (90%)
// Phantom Knight Lv 6: Pledge
// Phantom Oracle Lv 6: Invulnerability
// Phantom Dancer Lv 3: Steadfast Dance (10% MaxHP Barrier)
// Phantom Dancer Lv 4: Mesmerize (40%)
// Phantom Mystic Knight Lv 2: Magic Shell (20% MaxHP Barrier of caster)
// Phantom Gladiator Lv 2: Defend (50%)
/*
const phantomCaresAboutTankbuster = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.knight && phantomJobLevel >= 4)
    return true;
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.mysticKnight && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.gladiator && phantomJobLevel >= 2)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can block physical damage
// Phantom Samurai Lv 2: Shirahadori
// Phantom Oracle Lv 6: Invulnerability
/*
const phantomCanBlockPhysical = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.samurai && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that helps with enemy aoes
// Phantom Bard Lv 3: Mighty March (+20% MaxHP)
// Phantom Ranger Lv 6: Occult Unicorn (40k AoE Shield)
// Phantom Dancer Lv 4: Mesmerize (Require's target, 4s 40% damage reduction then 100s 10% damage reduction)
// Phantom Geomance Lv 2 may be able to use Weather with Blessed Rain, Misty Mirage, Sunbath, or Cloudy Caress effects
/*
const phantomCaresAboutAOE = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.bard && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.ranger && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 4)
    return true;
  return false;
};
*/

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentSouthHorn',
  zoneId: ZoneId.TheOccultCrescentSouthHorn,
  comments: {
    en: 'Occult Crescent South Horn critical encounter triggers/timeline.',
    de: 'Kreszentia Südexpedition kritische Begegnungen Triggers/Timeline.',
    cn: '蜃景幻界新月岛 南征之章 紧急遭遇战 触发器/时间轴。',
    ko: '초승달 섬: 남부편 비상 조우 트리거/타임라인',
    tc: '蜃景幻界新月島 南征之章 緊急遭遇戰 觸發器/時間軸。',
  },
  config: [
    {
      id: 'demonTabletRotation',
      name: {
        en: 'Forked Tower: Blood Demon Tablet Rotation Strategy',
        de: 'Fork-Turm: Blut Dämonentafel Rotationsstrategie',
        cn: '两歧塔力之塔 恶魔板 旋转策略',
        ko: '포크타워: 악마의 석판 회전 전략',
        tc: '兩歧塔力之塔 惡魔板 旋轉策略',
      },
      type: 'select',
      options: {
        en: {
          'Less movement by calling direction to go around instead of get behind.': 'optimization',
          'Early movement with get behind calls.': 'none',
        },
        de: {
          'Weniger Bewegung, indem man die Richtung zum Umrunden anweist, anstatt sich hinter den Gegner zu begeben.':
            'optimization',
          'Frühe Bewegung mit „Geh Hinter“-Rufen.': 'none',
        },
        cn: {
          '提示绕行方向(非绕后)，减少移动量': 'optimization',
          '提前提示绕后，方便提早移动': 'none',
        },
        ko: {
          '뒤로 가라고 지시하는 대신 계속 돌라고 지시함으로써 움직임을 줄입니다.': 'optimization',
          '빠른 이동을 위해 뒤로 가라는 지시를 호출합니다.': 'none',
        },
        tc: {
          '提示繞行方向(非繞後)，減少移動量': 'optimization',
          '提前提示繞後，方便提早移動': 'none',
        },
      },
      default: 'none',
    },
    {
      id: 'marbleDragonImitationRainStrategy',
      name: {
        en: 'Forked Tower: Blood Marble Dragon Imitation Rain 1 and 5 Strategy',
        de: 'Fork-Turm: Blut Marmordrache Falscher Regen 1 und 5 Strategie',
        cn: '两歧塔力之塔 大理石龙 仿效雨 1和5 策略',
        ko: '포크타워: 대리석 드래곤 모방된 비 1, 5 전략',
        tc: '兩歧塔力之塔 大理石龍 仿效雨 1和5 策略',
      },
      type: 'select',
      options: {
        en: {
          'Cross-based: Calls based on southern cross puddle.': 'cross',
          'Ice-based: Calls based on Ice Puddle nearest to wall.': 'ice',
        },
        de: {
          'Kreuzbasiert: Ansagen basieren auf der südlichen Kreuzpfütze.': 'cross',
          'Eisbasiert: Ansagen basieren auf der Eispfütze, die der Wand am nächsten liegt.': 'ice',
        },
        cn: {
          '十字基准: 根据十字冰圈位置提示': 'cross',
          '冰基准: 根据离墙最近的冰圈提示': 'ice',
        },
        ko: {
          '십자 기준: 남쪽 십자 장판에 따라 호출': 'cross',
          '얼음 기준: 벽에 가장 가까운 얼음 장판에 따라 호출': 'ice',
        },
        tc: {
          '十字基準: 根據十字冰圈位置提示': 'cross',
          '冰基準: 根據離牆最近的冰圈提示': 'ice',
        },
      },
      default: 'cross',
    },
    {
      id: 'magitaurDaggers',
      name: {
        en: 'Forked Tower: Blood Magitaur Dagger Strategy',
        de: 'Fork-Turm: Blut Magitaurus Dolchstrategie',
        cn: '两歧塔力之塔 魔陶洛斯 暗杀短剑 策略',
        ko: '포크타워: 마기타우로스 단검 전략',
        tc: '兩歧塔力之塔 魔陶洛斯 暗殺短劍 策略',
      },
      type: 'select',
      options: {
        en: {
          'BAP Daggers (Number and Letter Floor Markers)': 'bap',
          'No strategy (Y-Pattern and ⅄-Pattern)': 'none',
        },
        de: {
          'BAP Dolche (Zahlen und Buchstaben Bodenmarkierungen)': 'bap',
          'Keine Strategie (Y-Muster und ⅄-Muster)': 'none',
        },
        cn: {
          'BAP短剑标记(数字和字母场景标记)': 'bap',
          '无特定策略(Y型与⅄型)': 'none',
        },
        ko: {
          'BAP 단검 (숫자 및 알파벳 바닥 징)': 'bap',
          '전략 없음 (Y-패턴 및 ⅄-패턴)': 'none',
        },
        tc: {
          'BAP短劍標記(數字和字母場景標記)': 'bap',
          '無特定策略(Y型與⅄型)': 'none',
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
          de: 'Osten/Westen',
          cn: '东/西',
          ko: '동/서',
          tc: '東/西',
        },
        northSouth: {
          en: 'North/South',
          de: 'Norden/Süden',
          cn: '南/北',
          ko: '남/북',
          tc: '南/北',
        },
        baitCleave: {
          en: 'Bait Cleave',
          de: 'Cleave ködern',
          cn: '诱导顺劈',
          ko: '휩쓸기 유도',
          tc: '誘導順劈',
        },
        baitCleaveThenDir: {
          en: 'Bait Cleave => ${dir}',
          de: 'Cleave ködern => ${dir}',
          cn: '诱导顺劈 => ${dir}',
          ko: '휩쓸기 유도 => ${dir}',
          tc: '誘導順劈 => ${dir}',
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
          de: 'Runenaxt Viereck Position',
          cn: '符文之斧方块站位',
          ko: '룬 도끼 플랫폼 위치로',
          tc: '符文之斧方塊站位',
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
          de: 'Heiligenspeer Viereck Position',
          cn: '圣枪方块站位',
          ko: '신성한 창 플랫폼 위치로',
          tc: '聖槍方塊站位',
        },
      },
    },
  ],
  triggers: [
    // ---------------------- Setup --------------------------
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
      id: 'Occult Crescent Phantom Job Tracker',
      // count also contains a Phantom Job id and level, it's supposed to be two bytes but has weird padding in logs
      // Expecting first two characters to be part of Phantom Job id, and the later two to be the level
      // First digit is the job:
      // Dancer = F
      // Gladiator = E
      // Mystic Knight = D
      // Thief = C
      // Oracle = B
      // Chemist = A
      // Cannoneer = 9
      // Time Mage = 8
      // Geomancer = 7
      // Bard = 6
      // Samurai = 5
      // Ranger = 4
      // Monk = 3
      // Berserker = 2
      // Knight = 1
      // Freelancer = null
      // Freelancer level is accumulation of maxed jobs +1, can also be inferred from stacks of Phantom Mastery (1082)
      type: 'GainsEffect',
      netRegex: { effectId: [...phantomJobEffectIds], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.phantomJob = matches.effectId;
        const jobData = matches.count?.padStart(4, '0');

        // Assuming this isn't possible given the filter on statuses
        if (jobData === undefined)
          return;

        data.phantomJobLevel = parseInt(jobData.slice(2), 16);
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
    // ---------------------- CEs --------------------------
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
      id: 'Occult Crescent Crescent Berserker Damage Up',
      // Crescent Berserker gains Damage Up (20s) from Channeled Rage (7846)
      // Crescent Berserker gains Damage Up (40s) from Heightened Rage (93B1)
      type: 'GainsEffect',
      netRegex: { effectId: '3D', target: 'Crescent Berserker', capture: true },
      condition: (data) => {
        if (data.phantomJob === undefined || data.phantomJobLevel === undefined)
          return false;
        return phantomCanDispel(data.phantomJob, data.phantomJobLevel);
      },
      infoText: (_data, matches, output) => output.dispel!({ name: matches.target }),
      outputStrings: {
        dispel: {
          en: 'Dispel ${name}',
          de: 'Entferne ${name}',
          fr: 'Dissipez ${name}',
          ja: '${name}にバフ解除',
          cn: '驱散 ${name} 的BUFF',
          ko: '${name} 버프 해제',
        },
      },
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
      id: 'Occult Crescent Neo Garula Damage Up',
      // Neo Garula gains Damage Up (60s) after casting Agitated Groan
      type: 'GainsEffect',
      netRegex: { effectId: '489', target: 'Neo Garula', capture: true },
      condition: (data) => {
        if (data.phantomJob === undefined || data.phantomJobLevel === undefined)
          return false;
        return phantomCanDispel(data.phantomJob, data.phantomJobLevel);
      },
      infoText: (_data, matches, output) => output.dispel!({ name: matches.target }),
      outputStrings: {
        dispel: {
          en: 'Dispel ${name}',
          de: 'Entferne ${name}',
          fr: 'Dissipez ${name}',
          ja: '${name}にバフ解除',
          cn: '驱散 ${name} 的BUFF',
          ko: '${name} 버프 해제',
        },
      },
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
    // ------------------- FATEs -----------------------
    {
      id: 'Occult Crescent Giant Bird Gale Cannon',
      type: 'StartsUsing',
      netRegex: { source: 'Giant Bird', id: 'A13A', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Sisyphus Trounce',
      type: 'StartsUsing',
      netRegex: { source: 'Sisyphus', id: 'A3F4', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Sisyphus Thunder IV',
      type: 'StartsUsing',
      // Casts both A407 and A408 nearby, but A407 comes first
      netRegex: { source: 'Sisyphus', id: 'A407', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Sisyphus Thunderous Memory Wedge',
      type: 'StartsUsing',
      // A3FA signifies the wedges, and appears 4 at a time.
      netRegex: { source: 'Sisyphus', id: 'A3FA', capture: true },
      suppressSeconds: 1,
      infoText: (_data, matches, output) => {
        const intercardSafe = ['dirN', 'dirE', 'dirS', 'dirW'];
        const cardinalSafe = ['dirNE', 'dirSE', 'dirSW', 'dirNW'];
        const heading = parseFloat(matches.heading);
        const dirNum = Directions.hdgTo8DirNum(heading);
        const dir = Directions.output8Dir[dirNum];
        if (dir === undefined)
          return output.unknown!();
        if (cardinalSafe.includes(dir))
          return output.cardinals!();
        if (intercardSafe.includes(dir))
          return output.intercards!();
        console.log('ID: ', matches.id, ' heading: ', matches.heading, ' unknown dir???');
        return output.unknown!();
      },
      outputStrings: {
        intercards: Outputs.intercards,
        cardinals: Outputs.cardinals,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Occult Crescent Sisyphus Thunderous Memory In',
      type: 'StartsUsing',
      // A3F7 and A3F8 are both cast at the same time. Likely one signifies
      // the immediate attack and one signifies storing the future
      // follow-up.
      netRegex: { source: 'Sisyphus', id: 'A3F[78]', capture: false },
      suppressSeconds: 1,
      response: Responses.getIn(),
    },
    {
      id: 'Occult Crescent Sisyphus Thunderous Memory Out',
      type: 'StartsUsing',
      // A3F5 and A3F6 are both cast at the same time. Likely one signifies
      // the immediate attack and one signifies storing the future
      // follow-up.
      netRegex: { source: 'Sisyphus', id: 'A3F[56]', capture: false },
      suppressSeconds: 1,
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Sisyphus Resounding Memory Collector',
      type: 'StartsUsing',
      // A3FA signifies the wedges, and appears 4 times at once. Check the
      // first one to see if its hitting intercards or cardinals, then save
      // the opposite.
      netRegex: { source: 'Sisyphus', id: 'A3FA', capture: true },
      suppressSeconds: 1,
      run: (data, matches) => {
        const intercardSafe = ['dirN', 'dirE', 'dirS', 'dirW'];
        const cardinalSafe = ['dirNE', 'dirSE', 'dirSW', 'dirNW'];
        const heading = parseFloat(matches.heading);
        const dirNum = Directions.hdgTo8DirNum(heading);
        const dir = Directions.output8Dir[dirNum];
        if (dir === undefined) {
          data.sisyphusResoundingMemoryWedge = 'unknown';
        } else if (cardinalSafe.includes(dir)) {
          data.sisyphusResoundingMemoryWedge = 'cardinals';
        } else if (intercardSafe.includes(dir)) {
          data.sisyphusResoundingMemoryWedge = 'intercards';
        } else {
          console.log('ID: ', matches.id, ' heading: ', matches.heading, ' unknown dir???');
          delete data.sisyphusResoundingMemoryWedge;
        }
      },
    },
    {
      id: 'Occult Crescent Sisyphus Resounding Memory',
      type: 'StartsUsing',
      // A3FB, and A3FE are cast at every Resounding memory. A3FC appears to
      // only be cast for out safe, and A3FD appears to only be cast for in
      // safe. We determine the safe spot of cardinals vs intercards by
      // checking the heading of the A3FA attack.
      netRegex: { source: 'Sisyphus', id: 'A3F[CD]', capture: true },
      delaySeconds: 0.3,
      infoText: (data, matches, output) => {
        const dir = matches.id === 'A3FC' ? 'out' : 'in';
        const wedge = data.sisyphusResoundingMemoryWedge ?? 'unknown';
        return output.combined!({
          dir: output[dir]!(),
          wedge: output[wedge]!(),
        });
      },
      run: (data) => delete data.sisyphusResoundingMemoryWedge,
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        unknown: Outputs.unknown,
        combined: {
          en: '${dir} + ${wedge}',
          de: '${dir} + ${wedge}',
          cn: '${dir} + ${wedge}',
          ko: '${dir} + ${wedge}',
        },
      },
    },
    {
      id: 'Occult Crescent Sisyphus Thrice Come Thunder',
      type: 'StartsUsing',
      netRegex: { source: 'Sisyphus', id: 'A3FF', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge expanding rings',
          de: 'Weiche größer werdende Ringe aus',
          cn: '躲避扩散环',
          ko: '퍼지는 고리 장판 피하기',
        },
      },
    },
    {
      id: 'Occult Crescent Dehumidifier Fluid Swing',
      type: 'StartsUsing',
      netRegex: { source: 'Dehumidifier', id: '768F', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Advanced Aevis Zombie Breath',
      type: 'StartsUsing',
      netRegex: { source: 'Advanced Aevis', id: 'A414', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Advanced Aevis Triple Flight',
      type: 'StartsUsing',
      // Other IDs might do different things
      netRegex: { source: 'Advanced Aevis', id: 'A41C', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In => Out => Sides',
          de: 'Rein => Raus => Seiten',
          cn: '靠近 => 远离 => 两侧',
          ko: '안 => 밖 => 양 옆',
        },
      },
    },
    {
      id: 'Occult Crescent Advanced Aevis Quarry Lake',
      type: 'StartsUsing',
      netRegex: { source: 'Advanced Aevis', id: 'A41[23]', capture: false },
      suppressSeconds: 1,
      response: Responses.lookAway(),
    },
    {
      id: 'Occult Crescent Advanced Aevis Breath Wing',
      type: 'StartsUsing',
      // Other IDs might do different things
      netRegex: { source: 'Advanced Aevis', id: 'A418', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => In => Sides',
          de: 'Raus => Rein => Seiten',
          cn: '远离 => 靠近 => 两侧',
          ko: '밖 => 안 => 양 옆',
        },
      },
    },
    {
      id: 'Occult Crescent Ropross Biting Scratch',
      type: 'StartsUsing',
      netRegex: { source: 'Ropross', id: 'A1AC', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Ropross Aero IV',
      type: 'StartsUsing',
      netRegex: { source: 'Ropross', id: 'A1AF', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Lifereaper Soul Sweep',
      type: 'StartsUsing',
      netRegex: { source: 'Lifereaper', id: ['A4C1', 'A4C5'], capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Occult Crescent Lifereaper Menace',
      type: 'StartsUsing',
      netRegex: { source: 'Lifereaper', id: ['A4BF', 'A4C4'], capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Lifereaper Dismal Roar',
      type: 'StartsUsing',
      // Also comes at same time as A4C8
      netRegex: { source: 'Lifereaper', id: 'A4C9', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Lifereaper Sweeping Charge',
      type: 'StartsUsing',
      netRegex: { source: 'Lifereaper', id: 'A4C2', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow Dash => Get Behind',
          de: 'Ansturm folgen => Geh hinter den Boss',
          cn: '跟随冲锋 => 去背后',
          ko: '돌진 따라가기 => 보스 뒤로',
        },
      },
    },
    {
      id: 'Occult Crescent Lifereaper Menacing Charge',
      type: 'StartsUsing',
      netRegex: { source: 'Lifereaper', id: 'A4C3', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away After Dash',
          de: 'Nach dem Ansturm weggehen',
          cn: '冲锋后远离',
          ko: '돌진 후 멀어지기',
        },
      },
    },
    {
      id: 'Occult Crescent Gilded Headstone Flaring Epigraph',
      type: 'StartsUsing',
      // Appears along side A351
      netRegex: { source: 'Gilded Headstone', id: 'A350', capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    {
      id: 'Occult Crescent Gilded Headstone Epigraph',
      type: 'StartsUsing',
      netRegex: { source: 'Gilded Headstone', id: 'A33E', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Gilded Headstone Erosive Eye Look Away',
      type: 'StartsUsing',
      // TODO: Tune delaySeconds and/or collect multiple incoming tells and
      // generate a combined callout?
      netRegex: { source: 'Gilded Headstone', id: 'A34[01]', capture: false },
      response: Responses.lookAway(),
    },
    {
      id: 'Occult Crescent Gilded Headstone Erosive Eye Look Towards',
      type: 'StartsUsing',
      // TODO: Tune delaySeconds and/or collect multiple incoming tells and
      // generate a combined callout?
      netRegex: { source: 'Gilded Headstone', id: 'A34[23]', capture: false },
      response: Responses.lookTowards(),
    },
    {
      id: 'Occult Crescent Execrator Mini',
      type: 'StartsUsing',
      netRegex: { source: 'Execrator', id: 'A826', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Execrator Dark Mist',
      type: 'StartsUsing',
      netRegex: { source: 'Execrator', id: 'A828', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Occult Crescent Observer Stare',
      type: 'StartsUsing',
      netRegex: { source: 'Observer', id: 'A904', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Occult Crescent Observer Oogle',
      type: 'StartsUsing',
      netRegex: { source: 'Observer', id: 'A823', capture: false },
      response: Responses.lookAway(),
    },
    {
      id: 'Occult Nammu Receding Twin Tides',
      type: 'StartsUsing',
      netRegex: { source: 'Nammu', id: 'A32D', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'Occult Nammu Encroaching Twin Tides',
      type: 'StartsUsing',
      netRegex: { source: 'Nammu', id: 'A330', capture: false },
      response: Responses.getInThenOut(),
    },
    {
      id: 'Occult Nammu Left Twin Tentacle',
      type: 'StartsUsing',
      netRegex: { source: 'Nammu', id: 'A333', capture: false },
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'Occult Nammu Right Twin Tentacle',
      type: 'StartsUsing',
      netRegex: { source: 'Nammu', id: 'A335', capture: false },
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'Occult Nammu Void Water IV',
      type: 'StartsUsing',
      netRegex: { source: 'Nammu', id: 'A33[9A]', capture: false },
      suppressSeconds: 1,
      response: Responses.aoe(),
    },
    // ------------------- Forked Tower: Blood -----------------------
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
          de: 'Rein => Rückstoß',
          cn: '内 => 击退',
          ko: '안 => 넉백',
          tc: '內 => 擊退',
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
            de: 'Tankbusters auf ${player1}, ${player2}, ${player3}',
            cn: '坦克死刑点 ${player1}, ${player2}, ${player3}',
            ko: '탱버 대상자 ${player1}, ${player2}, ${player3}',
            tc: '坦剋死刑點 ${player1}, ${player2}, ${player3}',
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
          de: 'Rein => Rückstoß',
          cn: '内 => 击退',
          ko: '안 => 넉백',
          tc: '內 => 擊退',
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
          de: 'Links (Hinter den Boss)',
          cn: '左侧 (Boss后方)',
          ko: '왼쪽 (보스 뒤)',
          tc: '左側 (Boss後方)',
        },
        rightBehind: {
          en: 'Right (Behind Boss)',
          de: 'Rechts (Hinter den Boss)',
          cn: '右侧 (Boss后方)',
          ko: '오른쪽 (보스 뒤)',
          tc: '右側 (Boss後方)',
        },
        leftThenGetBehind: {
          en: 'Left => Get Behind',
          de: 'Links => Hinter den Boss',
          cn: '左侧 => 去Boss后方',
          ko: '왼쪽 => 보스 뒤로',
          tc: '左側 => 去Boss後方',
        },
        rightThenGetBehind: {
          en: 'Right => Get Behind',
          de: 'Rechts => Hinter den Boss',
          cn: '右侧 => 去Boss后方',
          ko: '오른쪽 => 보스 뒤로',
          tc: '右側 => 去Boss後方',
        },
        goRightAround: {
          en: 'Go Right and Around',
          de: 'Geh nach Rechts und drumherum',
          cn: '右侧绕行',
          ko: '오른쪽으로 돌아가기',
          tc: '右側繞行',
        },
        goLeftAround: {
          en: 'Go Left and Around',
          de: 'Geh nach Links und drumherum',
          cn: '左侧绕行',
          ko: '왼쪽으로 돌아가기',
          tc: '左側繞行',
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
          de: 'Rein => Rückstoß',
          cn: '内 => 击退',
          ko: '안 => 넉백',
          tc: '內 => 擊退',
        },
        dirMech: {
          en: '${dir} & ${mech}',
          de: '${dir} & ${mech}',
          cn: '${dir} 和 ${mech}',
          ko: '${dir} & ${mech}',
          tc: '${dir} 和 ${mech}',
        },
        hasMeteorMech: {
          en: 'Meteor on YOU, ${mech}',
          de: 'Meteor auf DIR, ${mech}',
          cn: '陨石点名, ${mech}',
          ko: '메테오 대상자, ${mech}',
          tc: '隕石點名, ${mech}',
        },
        hasMeteorDirMech: {
          en: 'Meteor on YOU, Go ${dir} & ${mech}',
          de: 'Meteor auf DIR, Geh nach ${dir} & ${mech}',
          cn: '陨石点名, 去${dir} 并 ${mech}',
          ko: '메테오 대상자, ${dir}으로 & ${mech}',
          tc: '隕石點名, 去${dir} 並 ${mech}',
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
            de: 'Sammeln, Fliege zum Boss',
            cn: '集合, 向Boss方向击飞',
            ko: '쉐어, 보스를 향해 발사',
            tc: '集合, 向Boss方向擊飛',
          },
          stackLaunchOverBoss: {
            en: 'Stack, Launch over Boss',
            de: 'Sammeln, Fliege über den Boss',
            cn: '集合, 越过Boss击飞',
            ko: '쉐어, 보스를 넘어 발사',
            tc: '集合, 越過Boss擊飛',
          },
          goNorthOutStackOnYou: {
            en: 'Go North Out => Stack Launch Marker on You',
            de: 'Geh nördlich raus => Sammel-Flug Marker auf DIR',
            cn: '去上方外侧 => 集合击飞点名',
            ko: '북쪽 바깥으로 => 쉐어 발사 대상자',
            tc: '去上方外側 => 集合擊飛點名',
          },
          goNorthInStackOnYou: {
            en: 'Go North In (Knockback) => Stack Launch Marker on You',
            de: 'Geh nördlich rein (Rückstoß) => Sammel-Flug Marker auf DIR',
            cn: '去上方内侧 (击退) => 集合击飞点名',
            ko: '북쪽 안쪽으로 (넉백) => 쉐어 발사 대상자',
            tc: '去上方內側 (擊退) => 集合擊飛點名',
          },
          goSouthOutStackOnYou: {
            en: 'Go South Out => Stack Launch Marker on You',
            de: 'Geh südlich raus => Sammel-Flug Marker auf DIR',
            cn: '去下方外侧 => 集合击飞点名',
            ko: '남쪽 바깥으로 => 쉐어 발사 대상자',
            tc: '去下方外側 => 集合擊飛點名',
          },
          goSouthInStackOnYou: {
            en: 'Go South In (Knockback) => Stack Launch Marker on You',
            de: 'Geh südlich rein (Rückstoß) => Sammel-Flug Marker auf DIR',
            cn: '去下方内侧 (击退) => 集合击飞点名',
            ko: '남쪽 안쪽으로 (넉백) => 쉐어 발사 대상자',
            tc: '去下方內側 (擊退) => 集合擊飛點名',
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
          de: 'Positioniere Add und Raus',
          cn: '小怪站位并远离',
          ko: '쫄 위치 및 밖으로',
          tc: '小怪站位並遠離',
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
          de: '${dir} Raus => Türme',
          cn: '${dir} 外侧 => 塔',
          ko: '${dir} 밖으로 => 탑',
          tc: '${dir} 外側 => 塔',
        },
        goTowerSideOut: {
          en: 'Go Towers Side and Out',
          de: 'Geh zu den Turm-Seiten und Raus',
          cn: '去塔侧并远离',
          ko: '탑 쪽 밖으로',
          tc: '去塔側並遠離',
        },
        dirInThenTowers: {
          en: '${dir} In => Knockback => Towers',
          de: '${dir} Rein => Rückstoß => Türme',
          cn: '${dir} 内侧 => 击退 => 塔',
          ko: '${dir} 안 => 넉백 => 탑',
          tc: '${dir} 內側 => 擊退 => 塔',
        },
        goTowerSideIn: {
          en: 'Go Towers Side and In => Knockback',
          de: 'Geh zu den Turm-Seiten und Rein => Rückstoß',
          cn: '去塔侧并内侧 => 击退',
          ko: '탑 쪽 안으로 => 넉백',
          tc: '去塔側並內側 => 擊退',
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
          de: 'Vorne Rechts (Später)',
          cn: '右前 (稍后)',
          ko: '앞 오른쪽 (나중에)',
          tc: '右前 (稍後)',
        },
        backLeftLater: {
          en: 'Back Left (Later)',
          de: 'Hinten Links (Später)',
          cn: '左后 (稍后)',
          ko: '뒤 왼쪽 (나중에)',
          tc: '左後 (稍後)',
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
          de: '${towers} => ${corner}',
          cn: '${towers} => ${corner}',
          ko: '${towers} => ${corner}',
          tc: '${towers} => ${corner}',
        },
        getTowers: Outputs.getTowers,
        frontRight: {
          en: 'Front Right',
          de: 'Vorne Rechts',
          fr: 'Avant Droit',
          ja: '前右',
          cn: '右前',
          ko: '앞 오른쪽',
          tc: '右前',
        },
        backLeft: {
          en: 'Back Left',
          de: 'Hinten Links',
          fr: 'Arrière Gauche',
          ja: '後左',
          cn: '左后',
          ko: '뒤 왼쪽',
          tc: '左後',
        },
        safeCorner: {
          en: 'Safe Corner',
          de: 'Sichere Ecken',
          cn: '安全角落',
          ko: '안전한 구석',
          tc: '安全形落',
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
          de: 'Vermeide fallende Statuen',
          cn: '躲避下落雕像',
          ko: '떨어지는 석상 피하기',
          tc: '躲避下落雕像',
        },
        frontRight: {
          en: 'Front Right',
          de: 'Vorne Rechts',
          fr: 'Avant Droit',
          ja: '前右',
          cn: '右前',
          ko: '앞 오른쪽',
          tc: '右前',
        },
        backLeft: {
          en: 'Back Left',
          de: 'Hinten Links',
          fr: 'Arrière Gauche',
          ja: '後左',
          cn: '左后',
          ko: '뒤 왼쪽',
          tc: '左後',
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
          de: 'Verbunden zum ${boss}',
          cn: '连线 ${boss}',
          ko: '${boss} 연결됨',
          tc: '連線 ${boss}',
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
            de: 'Tank-Cleaves auf ${player1}, ${player2}, ${player3}',
            cn: '坦克顺劈点 ${player1}, ${player2}, ${player3}',
            ko: '광역 탱버 대상자 ${player1}, ${player2}, ${player3}',
            tc: '坦克順劈點 ${player1}, ${player2}, ${player3}',
          },
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaveOnYouLineStack: {
            en: 'Tank Cleave on YOU, Avoid Line Stack',
            de: 'Tank Cleave auf DIR, Vermeide Linien-sammeln',
            cn: '坦克顺劈点名, 避开直线分摊',
            ko: '광역 탱버 대상자, 직선 쉐어 피하기',
            tc: '坦克順劈點名, 避開直線分攤',
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
          de: '+1 Blau',
          cn: '+1 蓝',
          ko: '+1 파랑',
          tc: '+1 藍',
        },
        blueTwo: {
          en: '+2 Blue',
          de: '+2 Blau',
          cn: '+2 蓝',
          ko: '+2 파랑',
          tc: '+2 藍',
        },
        blueThree: {
          en: '+3 Blue',
          de: '+3 Blau',
          cn: '+3 蓝',
          ko: '+3 파랑',
          tc: '+3 藍',
        },
        red: {
          en: '+1 Red',
          de: '+1 Rot',
          cn: '+1 红',
          ko: '+1 빨강',
          tc: '+1 紅',
        },
        redTwo: {
          en: '+2 Red',
          de: '+2 Rot',
          cn: '+2 红',
          ko: '+2 빨강',
          tc: '+2 紅',
        },
        redThree: {
          en: '+3 Red',
          de: '+3 Rot',
          cn: '+3 红',
          ko: '+3 빨강',
          tc: '+3 紅',
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
          de: 'Rot: ${dirs}',
          cn: '红: ${dirs}',
          ko: '빨강: ${dirs}',
          tc: '紅: ${dirs}',
        },
        blue: {
          en: 'Blue: ${dirs}',
          de: 'Blau: ${dirs}',
          cn: '蓝: ${dirs}',
          ko: '파랑: ${dirs}',
          tc: '藍: ${dirs}',
        },
        red1: {
          en: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          de: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          cn: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          ko: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          tc: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
        },
        blue1: {
          en: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          de: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          cn: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          ko: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
          tc: '${hit1} => ${safe1} => ${safe2} => ${safe3}',
        },
        red2: {
          en: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          de: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          cn: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          ko: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          tc: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
        },
        blue2: {
          en: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          de: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          cn: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          ko: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
          tc: '${hit1} => ${hit2} => ${safe1} => ${safe2}',
        },
        red3: {
          en: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          de: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          cn: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          ko: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          tc: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
        },
        blue3: {
          en: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          de: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          cn: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          ko: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
          tc: '${hit1} => ${hit2} => ${hit3} => ${safe1}',
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
          de: '${hit} für Schleim',
          cn: '${hit} 吃软泥',
          ko: '${hit} 슬라임 맞기',
          tc: '${hit} 吃軟泥',
        },
        getHitBlueOoze: {
          en: '${hit} for Ooze',
          de: '${hit} für Schleim',
          cn: '${hit} 吃软泥',
          ko: '${hit} 슬라임 맞기',
          tc: '${hit} 吃軟泥',
        },
        getHitBothOoze: {
          en: 'Red: ${red}, Blue: ${blue}',
          de: 'Rot: ${red}, Blau: ${blue}',
          cn: '红: ${red}, 蓝: ${blue}',
          ko: '빨강: ${red}, 파랑: ${blue}',
          tc: '紅: ${red}, 藍: ${blue}',
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
          de: '${dir} für Schleim',
          cn: '去${dir}吃软泥',
          ko: '${dir} 슬라임 맞기',
          tc: '去${dir}吃軟泥',
        },
        safeSpot: {
          en: '${dir} Safe Spot',
          de: 'Sichere Stelle ${dir}',
          fr: '${dir} Zone safe',
          ja: '${dir}に安置',
          cn: '去${dir}方安全点',
          ko: '${dir} 안전 지대',
          tc: '去${dir}方安全點',
        },
        safeSpots: {
          en: '${dir1} / ${dir2} Safe Spots',
          de: '${dir1} / ${dir2} Sichere Zonen',
          cn: '${dir1} / ${dir2} 安全点',
          ko: '${dir1} / ${dir2} 안전 지대',
          tc: '${dir1} / ${dir2} 安全點',
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
          de: '${dir} für Schleim',
          cn: '去${dir}吃软泥',
          ko: '${dir} 슬라임 맞기',
          tc: '去${dir}吃軟泥',
        },
        safeSpot: {
          en: '${dir} Safe Spot',
          de: 'Sichere Stelle ${dir}',
          fr: '${dir} Zone safe',
          ja: '${dir}に安置',
          cn: '去${dir}方安全点',
          ko: '${dir} 안전 지대',
          tc: '去${dir}方安全點',
        },
        safeSpots: {
          en: '${dir1} / ${dir2} Safe Spots',
          de: '${dir1} / ${dir2} Sichere Zonen',
          cn: '${dir1} / ${dir2} 安全点',
          ko: '${dir1} / ${dir2} 안전 지대',
          tc: '${dir1} / ${dir2} 安全點',
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
          de: 'Wilde Rage Positionen',
          cn: '狂野冲锋站位',
          ko: '직선 쉐어 위치로',
          tc: '狂野衝鋒站位',
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
            de: 'Verbindung: Rückstoß nach ${dir} => An der Wand sammeln',
            cn: '连线: 击退到${dir} => 靠墙分摊',
            ko: '선: ${dir}쪽으로 넉백 => 벽에서 쉐어',
            tc: '連線: 擊退到${dir} => 靠牆分攤',
          },
          knockbackToSnowball: {
            en: 'Knockback to Snowball => Stack at Wall',
            de: 'Rückstoß zum Schneeball => An der Wand sammeln',
            cn: '击退到雪球 => 靠墙分摊',
            ko: '눈덩이 쪽으로 넉백 => 벽에서 쉐어',
            tc: '擊退到雪球 => 靠牆分攤',
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
          de: 'Raus aus der Mitte, Gruppen Positionen',
          cn: '远离中间, 分组站位',
          ko: '중앙 피하기, 그룹별 위치',
          tc: '遠離中間, 分組站位',
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
          de: 'Weiche 2 Angriffen aus => Verteilen',
          cn: '躲避两次X波 => 分散',
          ko: '독파 두 번 피하기 => 산개',
          tc: '躲避兩次X波 => 分散',
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
            de: 'Bhut unterbrechen',
            cn: '打断浮灵',
            ko: '브후트 차단',
            tc: '打斷浮靈',
          },
          northInterrupt: {
            en: 'North: Interrupt Bhoot',
            de: 'Norden: Bhut unterbrechen',
            cn: '左桥: 打断浮灵',
            ko: '왼쪽 다리: 브후트 차단',
            tc: '左橋: 打斷浮靈',
          },
          southInterrupt: {
            en: 'South: Interrupt Bhoot',
            de: 'Süden: Bhut unterbrechen',
            cn: '右桥: 打断浮灵',
            ko: '오른쪽 다리: 브후트 차단',
            tc: '右橋: 打斷浮靈',
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
          de: 'Ansturm (Osten), In einer Reihe sammeln',
          cn: '狂野冲锋(右), 在同一行集合',
          ko: '직선 쉐어 (동쪽), 한 줄로 서기',
          tc: '狂野衝鋒(右), 在同一行集合',
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
          de: 'Norden: AoE (Kreszenter Bann wenn möglich)',
          cn: '左桥: AOE (能驱散就驱散)',
          ko: '왼쪽 다리: 전체공격 (가능하면 디스펠)',
          tc: '左橋: AOE (能驅散就驅散)',
        },
        southAoEDispel: {
          en: 'South: AoE (Dispel if Possible)',
          de: 'Süden: AoE (Entfernen wenn möglich)',
          cn: '右桥: AOE (能驱散就驱散)',
          ko: '오른쪽 다리: 전체공격 (가능하면 디스펠)',
          tc: '右橋: AOE (能驅散就驅散)',
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
      condition: (data) => {
        if (
          data.phantomJob === undefined ||
          data.phantomJobLevel === undefined ||
          phantomCanFreeze(data.phantomJob, data.phantomJobLevel)
        )
          return true;
        return false;
      },
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
          de: 'Liebliche Klänge (wenn möglich)',
          cn: '爱之歌 (能用就用)',
          ko: '사랑의 노래 (가능하면)',
          tc: '愛之歌 (能用就用)',
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
            de: 'Obere Reihe (Bosse auseinander)',
            cn: '上排 (BOSS远离)',
            ko: '위쪽 줄 (보스 멀리)',
            tc: '上排 (BOSS遠離)',
          },
          bottomApart: {
            en: 'Bottom row (bosses apart)',
            de: 'Untere Reihe (Bosse auseinander)',
            cn: '下排 (BOSS远离)',
            ko: '아래쪽 줄 (보스 멀리)',
            tc: '下排 (BOSS遠離)',
          },
          bossesApart: {
            en: 'Move bosses apart',
            de: 'Bewege Bosse auseinander',
            cn: '让BOSS远离',
            ko: '보스 멀리 떨어뜨리기',
            tc: '讓BOSS遠離',
          },
          topTogether: {
            en: 'Top row (bosses together)',
            de: 'Obere Reihe (Bosse zusammen)',
            cn: '上排 (BOSS靠近)',
            ko: '위쪽 줄 (보스 가까이)',
            tc: '上排 (BOSS靠近)',
          },
          bottomTogether: {
            en: 'Bottom row (bosses together)',
            de: 'Untere Reihe (Bosse zusammen)',
            cn: '下排 (BOSS靠近)',
            ko: '아래쪽 줄 (보스 가까이)',
            tc: '下排 (BOSS靠近)',
          },
          bossesTogether: {
            en: 'Move bosses together',
            de: 'Bewege Bosse zusammen',
            cn: '让BOSS靠近',
            ko: '보스 가까이 모으기',
            tc: '讓BOSS靠近',
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
          de: 'Ansturm (Osten), In einer Reihe sammeln',
          cn: '狂野冲锋(右), 在同一行集合',
          ko: '직선 쉐어 (동쪽), 한 줄로 서기',
          tc: '狂野衝鋒(右), 在同一行集合',
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
          de: 'Zieh Boss weg von den Bomben',
          cn: '将BOSS拉离炸弹',
          ko: '보스를 폭탄에서 멀리 떨어뜨리기',
          tc: '將BOSS拉離炸彈',
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
          de: 'Osten/Westen',
          cn: '左/右',
          ko: '동/서',
          tc: '左/右',
        },
        northSouth: {
          en: 'North/South',
          de: 'Norden/Süden',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
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
          de: '(${dir} Später)',
          cn: '(稍后 ${dir})',
          ko: '(나중에 ${dir})',
          tc: '(稍後 ${dir})',
        },
        westLater: {
          en: '(${dir} Later)',
          de: '(${dir} Später)',
          cn: '(稍后 ${dir})',
          ko: '(나중에 ${dir})',
          tc: '(稍後 ${dir})',
        },
        eastThenWickedWater: {
          en: '(${dir1} Later => ${dir2})',
          de: '(${dir1} Später => ${dir2})',
          cn: '(稍后 ${dir1} => ${dir2})',
          ko: '(나중에 ${dir1} => ${dir2})',
          tc: '(稍後 ${dir1} => ${dir2})',
        },
        westThenWickedWater: {
          en: '(${dir1} Later => ${dir2})',
          de: '(${dir1} Später => ${dir2})',
          cn: '(稍后 ${dir1} => ${dir2})',
          ko: '(나중에 ${dir1} => ${dir2})',
          tc: '(稍後 ${dir1} => ${dir2})',
        },
        wickedWater: {
          en: 'Get Hit ${dir}',
          de: 'Werde ${dir} getroffen',
          cn: '站在${dir}吃圈',
          ko: '${dir} 맞기',
          tc: '站在${dir}吃圈',
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
            de: 'Tankbuster Blutung',
            cn: '坦克流血死刑',
            ko: '출혈 탱버',
            tc: '坦克流血死刑',
          },
          tankBusterBleedOnYou: {
            en: 'Tankbuster bleed on YOU',
            de: 'Tankbuster Blutung auf DIR',
            cn: '坦克流血死刑点名',
            ko: '출혈 탱버 대상자',
            tc: '坦克流血死刑點名',
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
          de: '(Osten Später)',
          cn: '(稍后左)',
          ko: '(나중에 동쪽)',
          tc: '(稍後左)',
        },
        west: {
          en: '(West Later)',
          de: '(Westen Später)',
          cn: '(稍后右)',
          ko: '(나중에 서쪽)',
          tc: '(稍後右)',
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
          de: 'Kreuze zuerst + ${clock}',
          cn: '先十字 + ${clock}',
          ko: '십자 먼저 + ${clock}',
          tc: '先十字 + ${clock}',
        },
        circlesFirst: {
          en: 'Circles First + ${clock}',
          de: 'Kreise zuerst + ${clock}',
          cn: '先圆圈 + ${clock}',
          ko: '원 먼저 + ${clock}',
          tc: '先圓圈 + ${clock}',
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
            de: '${dir}',
            cn: '${dir}',
            ko: '${dir}',
            tc: '${dir}',
          },
          circles1Dodge: {
            en: '${dir}',
            de: '${dir}',
            cn: '${dir}',
            ko: '${dir}',
            tc: '${dir}',
          },
        };
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const loc = getPuddleLocation(x, y);
        if (loc === undefined)
          return;

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
          de: '${dir1}/${dir2}',
          cn: '${dir1}/${dir2}',
          ko: '${dir1}/${dir2}',
          tc: '${dir1}/${dir2}',
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
          de: 'Vermeide Wirbelsturm',
          cn: '远离龙卷风',
          ko: '회오리 피하기',
          tc: '遠離龍捲風',
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
          de: '${dir1}/${dir2} Sturz => Türme',
          cn: '${dir1}/${dir2} 俯冲 => 塔',
          ko: '${dir1}/${dir2} 강하 => 탑',
          tc: '${dir1}/${dir2} 俯衝 => 塔',
        },
        bossDiveThenTowers: {
          en: 'Boss Dive => Towers',
          de: 'Boss Sturz => Türme',
          cn: 'BOSS俯冲 => 塔',
          ko: '보스 강하 => 탑',
          tc: 'BOSS俯衝 => 塔',
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
          de: 'Türme => Kardinale/Interkardinale Türme',
          cn: '塔 => 正点/斜点塔',
          ko: '탑 => 십자/대각선 탑',
          tc: '塔 => 正點/斜點塔',
        },
        towerDirsThenCardinalTowers: {
          en: '${dir1}/${dir2} Towers => Cardinal Towers',
          de: '${dir1}/${dir2} Türme => Kardinale Türme',
          cn: '${dir1}/${dir2} 塔 => 正点塔',
          ko: '${dir1}/${dir2} 탑 => 십자 탑',
          tc: '${dir1}/${dir2} 塔 => 正點塔',
        },
        towerDirsThenIntercardTowers: {
          en: '${dir1}/${dir2} Towers => Intercard Towers',
          de: '${dir1}/${dir2} Türme => Interkardinale Türme',
          cn: '${dir1}/${dir2} 塔 => 斜点塔',
          ko: '${dir1}/${dir2} 탑 => 대각선 탑',
          tc: '${dir1}/${dir2} 塔 => 斜點塔',
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
          de: 'Kardinale/Interkardinale Türme',
          cn: '正点/斜点塔',
          ko: '십자/대각선 탑',
          tc: '正點/斜點塔',
        },
        cardinalTowers: {
          en: 'Cardinal Towers',
          de: 'Kardinale Türme',
          cn: '正点塔',
          ko: '십자 탑',
          tc: '正點塔',
        },
        intercardTowers: {
          en: 'Intercardinal Towers',
          de: 'Interkardinale Türme',
          cn: '斜点塔',
          ko: '대각선 탑',
          tc: '斜點塔',
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
          de: 'Verfluchtes Wasser auf DIR',
          cn: '水圈点名',
          ko: '저주받은 물 대상자',
          tc: '水圈點名',
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
          de: 'Werde von der Eis-Explosion getroffen',
          cn: '吃冰圈爆炸',
          ko: '얼음 폭발 맞기',
          tc: '吃冰圈爆炸',
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
          de: 'Gefängnis zerstören',
          cn: '打破冰牢',
          ko: '감옥 부수기',
          tc: '打破冰牢',
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
          de: 'Kreise zuerst',
          cn: '先圆圈',
          ko: '원 먼저',
          tc: '先圓圈',
        },
        crossesFirst: {
          en: 'Crosses First',
          de: 'Kreuze zuerst',
          cn: '先十字',
          ko: '십자 먼저',
          tc: '先十字',
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
          de: 'Osten/Westen',
          cn: '左/右',
          ko: '동/서',
          tc: '左/右',
        },
        northSouth: {
          en: 'North/South',
          de: 'Norden/Süden',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        dirCrossesFirst: {
          en: '${dir}: Crosses First + ${clock}',
          de: '${dir}: Kreuze zuerst + ${clock}',
          cn: '${dir}: 先十字 + ${clock}',
          ko: '${dir}: 십자 먼저 + ${clock}',
          tc: '${dir}: 先十字 + ${clock}',
        },
        dirCirclesFirst: {
          en: '${dir}: Circles First + ${clock}',
          de: '${dir}: Kreise zuerst + ${clock}',
          cn: '${dir}: 先圆圈 + ${clock}',
          ko: '${dir}: 원 먼저 + ${clock}',
          tc: '${dir}: 先圓圈 + ${clock}',
        },
        dirClock: {
          en: '${dir}: ${clock}',
          de: '${dir}: ${clock}',
          cn: '${dir}: ${clock}',
          ko: '${dir}: ${clock}',
          tc: '${dir}: ${clock}',
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
          de: 'Osten/Westen',
          cn: '左/右',
          ko: '동/서',
          tc: '左/右',
        },
        northSouth: {
          en: 'North/South',
          de: 'Norden/Süden',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        getTowers: Outputs.getTowers,
        getVerticalTowers: {
          en: 'Get Vertical Towers',
          de: 'Nimm vertikale Türme',
          cn: '去竖排塔',
          ko: '수직 탑 밟기',
          tc: '去豎排塔',
        },
        getHorizontalTowers: {
          en: 'Get Horizontal Towers',
          de: 'Nimm horizontale Türme',
          cn: '去横排塔',
          ko: '수평 탑 밟기',
          tc: '去橫排塔',
        },
        getTowersDir: {
          en: '${text} => ${dir}',
          de: '${text} => ${dir}',
          cn: '${text} => ${dir}',
          ko: '${text} => ${dir}',
          tc: '${text} => ${dir}',
        },
        getVerticalTowersDir: {
          en: 'Get Vertical Towers => ${dir}',
          de: 'Nimm vertikale Türme => ${dir}',
          cn: '去竖排塔 => ${dir}',
          ko: '수직 탑 밟기 => ${dir}',
          tc: '去豎排塔 => ${dir}',
        },
        getHorizontalTowersDir: {
          en: 'Get Horizontal Towers => ${dir}',
          de: 'Nimm horizontale Türme => ${dir}',
          cn: '去横排塔 => ${dir}',
          ko: '수평 탑 밟기 => ${dir}',
          tc: '去橫排塔 => ${dir}',
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
          de: 'Osten/Westen',
          cn: '左/右',
          ko: '동/서',
          tc: '左/右',
        },
        northSouth: {
          en: 'North/South',
          de: 'Norden/Süden',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
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
      condition: (data, matches) => {
        if (
          (data.me === matches.target) &&
          (data.phantomJob === undefined ||
            data.phantomJobLevel === undefined ||
            phantomCanCleanse(data.phantomJob, data.phantomJobLevel))
        )
          return true;
        return false;
      },
      // 25s - 20s, plus some delay for buff/debuff propagation
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 20 + 0.5,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.recuperation!(),
      outputStrings: {
        recuperation: {
          en: 'Recuperation (if possible)',
          de: 'Gesundung (wenn möglich)',
          cn: '痊愈宣告 (能用就用)',
          ko: '치유 선고 (가능하면)',
          tc: '痊癒宣告 (能用就用)',
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
          de: 'Alpha-Schlosswächter ist erschienen',
          cn: '首领看锁人出现',
          ko: '대장 자물쇠지기 등장',
          tc: '首領看鎖人出現',
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
          de: 'Tanks entfernt (Gruppe nahe) x3',
          cn: '坦克远离 (人群靠近) x3',
          ko: '탱커 멀리 (본대 가까이) x3',
          tc: '坦克遠離 (人群靠近) x3',
        },
        tanksNear: {
          en: 'Tanks Close (Party Far) x3',
          de: 'Tanks nahe (Gruppe entfernt) x3',
          cn: '坦克靠近 (人群远离) x3',
          ko: '탱커 가까이 (본대 멀리) x3',
          tc: '坦克靠近 (人群遠離) x3',
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
          de: 'Starte auf Buchstaben',
          cn: '字母点开始',
          ko: '알파벳에서 시작',
          tc: '字母點開始',
        },
        startOnNumbers: {
          en: 'Start on Numbers',
          de: 'Starte auf Zahlen',
          cn: '数字点开始',
          ko: '숫자에서 시작',
          tc: '數字點開始',
        },
        pattern1: {
          en: '⅄ Daggers',
          // Displays an upside down Y
          de: '⅄ Dolche',
          cn: '⅄ 形短剑',
          ko: '⅄ 단검',
          tc: '⅄ 形短劍',
        },
        pattern1TtsText: {
          en: 'Flipped Y Daggers',
          de: 'Umgedrehte Y Dolche',
          cn: '倒 Y 形短剑',
          ko: '역 Y 단검',
          tc: '倒 Y 形短劍',
        },
        pattern2: {
          en: 'Y Daggers',
          de: 'Y Dolche',
          cn: 'Y 形短剑',
          ko: 'Y 단검',
          tc: 'Y 形短劍',
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
          tc: '站在目標圈上 (遠離坦剋死刑)',
        },
        nearFarTankCleave: {
          en: 'Near and far tank cleave => 2 tank autos',
          de: 'Nah und entfernte Tank-Cleaves => 2 Tank Autoangriffe',
          cn: '近远坦克死刑 => 2次坦克普攻',
          ko: '근거리/원거리 광역탱버 => 탱커 평타 2회',
          tc: '近遠坦剋死刑 => 2次坦克普攻',
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
          de: 'Greife blaue Kanister an (Lanze)',
          cn: '攻击蓝色罐子 (枪)',
          ko: '파란색 통 공격 (창)',
          tc: '攻擊藍色罐子 (槍)',
        },
        yellowCanisters: {
          en: 'Attack Yellow Canisters (Axe)',
          de: 'Greife gelbe Kanister an (Axt)',
          cn: '攻击黄色罐子 (斧)',
          ko: '노란색 통 공격 (도끼)',
          tc: '攻擊黃色罐子 (斧)',
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
          de: 'In eine rLinie sammeln beim Stab',
          cn: '直线分摊法杖伤害',
          ko: '지팡이 직선 쉐어',
          tc: '直線分攤法杖傷害',
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
          de: 'Kurzer Sammel-Debuff auf DIR (17)',
          cn: '短分摊点名 (17秒)',
          ko: '짧은 쉐어징 (17초)',
          tc: '短分攤點名 (17秒)',
        },
        mediumStackOnYou: {
          en: 'Medium Stack on YOU (25)',
          de: 'Mittlerer Sammel-Debuff auf DIR (25)',
          cn: '中分摊点名 (25秒)',
          ko: '중간 쉐어징 (25초)',
          tc: '中分攤點名 (25秒)',
        },
        longStackOnYou: {
          en: 'Long Stack on YOU (33)',
          de: 'Langer Sammel-Debuff auf DIR (33)',
          cn: '长分摊点名 (33秒)',
          ko: '긴 쉐어징 (33초)',
          tc: '長分攤點名 (33秒)',
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
        'Close Call to Detonate / Far Cry to Detonate': 'Close/Far to Detonate',
        'Cometeor of Dangers Near / Cometeor of Expulsion Afar': 'Cometeor Near/Far',
        'Critical Axeblow / Critical Lanceblow': 'Critical Axe/Lanceblow',
        'Critical Lanceblow / Critical Axeblow': 'CriticalLanceblow/Axeblow',
        'Demonograph of Dangers Near / Demonograph of Expulsion Afar': 'Deomograph Near/Far',
        'Gravity of Dangers Near / Gravity of Expulsion Afar': 'Gravity Near/Far',
        'Ray of Dangers Near / Ray of Expulsion Afar': 'Ray Near/Far',
        'Rotate Right / Rotate Left': 'Rotate Left/Right',
        'Shades\' Crossing/Shades\' Nest': 'Shades\' Crossing/Nest',
        'Shades\' Nest/Shade\'s Crossing': 'Shades\' Nest/Crossing',
        'Twopenny Inflation / Onepenny Inflation / Fourpenny Inflation':
          'Penny Inflation (knockback)',
        'Vertical Crosshatch/Horizontal Crosshatch': 'Vertical/Horizontal Crosshatch',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Advanced Aevis': 'entwickelt(?:e|er|es|en) Avis',
        'Assassin\'s Dagger': 'Assassinendolch',
        'Axe Empowerment Conduit': 'magisch(?:e|er|es|en) Axtverstärker',
        'Ball of Fire': 'Feuerball',
        'Black Chocobo': 'schwarz(?:e|er|es|en) Chocobo',
        'Black Star': 'Schwarz(?:e|er|es|en) Stern',
        'Chatterbird': 'Schnatterer',
        'Clawmarks': 'Nagelmal',
        'Cloister Demon': 'Klosterdämon',
        'Command Urn': 'Kommandopott',
        'Crescent Berserker': 'kreszent(?:e|er|es|en) Berserker',
        'Crystal Dragon': 'Kristalldrache',
        'Dead Stars': 'astronomisch(?:e|er|es|en) Trio',
        'Death Claw': 'Todesklaue',
        'Dehumidifier': 'Entfeuchter',
        'Demon Tablet': 'Dämonentafel',
        'Draconic Double': 'Kristalldrachenphantom',
        'Execrator': 'Exekutor',
        'Frozen Phobos': 'tiefgekühlt(?:e|er|es|en) Phobos',
        'Frozen Triton': 'tiefgekühlt(?:e|er|es|en) Triton',
        'Gaseous Nereid': 'brennend(?:e|er|es|en) Nereid',
        'Gaseous Phobos': 'brennend(?:e|er|es|en) Phobos',
        'Giant Bird': 'Roch',
        'Gilded Headstone': 'Golden(?:e|er|es|en) Grabstein',
        'Guardian Berserker': 'Wächter-Berserker',
        'Guardian Knight': 'Wächter-Ritter',
        'Guardian Weapon': 'Wächter-Waffe',
        'Guardian Wraith': 'Wächter-Geist',
        'Hinkypunk': 'Irrwisch',
        'Holy Sphere': 'Lichtsphäre',
        'Ice Golem': 'Eisgolem',
        'Icewind': 'Eiswind',
        'Jesting Jackanapes': 'Garkimasera',
        'Lance Empowerment Conduit': 'magisch(?:e|er|es|en) Lanzenverstärker',
        'Lifereaper': 'Seelensammler',
        'Lion Rampant': 'ungezügelt(?:e|er|es|en) Löwe',
        'Liquified Triton': 'geschmolzen(?:e|er|es|en) Triton',
        'Luminous Lance': 'Lichtspeer',
        'Magitaur': 'Magitaurus',
        'Marble Dragon': 'Marmordrache',
        'Master Lockward': 'Alpha-Schlosswächter',
        'Megaloknight': 'Megalo-Ritter',
        'Mysterious Mindflayer': 'Gedankenschinder',
        'Mythic Idol': 'mystisch(?:e|er|es|en) Idol',
        'Mythic Mirror': 'mystisch(?:e|er|es|en) Idolphantom',
        'Nammu': 'Nammu',
        'Neo Garula': 'Neo Garula',
        '(?<! )Nereid': 'Nereid',
        'Nymian Petalodus': 'nymeisch(?:e|er|es|en) Petalodus',
        'Observer': 'Inselbeobachter',
        'Occult Knight': 'kreszent(?:e|er|es|en) Ritter',
        'Ochre Stone': 'Felsen',
        'Petalodus Progeny': 'Petalodus-Nachwuchs',
        'Phantom Claw': 'Illusions-Todesklaue',
        '(?<! )Phobos': 'Phobos',
        'Repaired Lion': 'restauriert(?:e|er|es|en) Löwe',
        'Ropross': 'Loploth',
        'Sage\'s Staff': 'Stab des Weisen',
        'Sisyphus': 'Sisyphos',
        'Tentacle': 'Tentakel',
        'Tower Abyss': 'Blut-Abyssus',
        'Tower Bhoot': 'Turm-Bhut',
        'Tower Idol': 'Blut-Götze',
        'Tower Manticore': 'Blut-Manticore',
        'Tower Progenitor': 'Blut-Progenitor',
        'Tower Progenitrix': 'Blut-Progenitrix',
        'Trade Tortoise': 'Münzkröte',
        'Trap': 'Falle',
        '(?<! )Triton(?!\\w)': 'Triton',
        'Universal Empowerment Conduit': 'Verstärkungskontrolle',
        'Vassal Vessel': 'Vasallenpuppe',
      },
      'replaceText': {
        'Zwei-Groschen-Fluch / Ein-Groschen-Fluch / Vier-Groschen-Fluch':
          'Zwei-/Ein-/Vier- Groschen-Fluch',
        'Vertikale Doppelnägel/Horizontale Doppelnägel': 'Vertikale/Horizontale Doppelnägel',
        '\\(circles': '(Kreise',
        '\\+ cross': '+ Kreuz',
        '/cross': '/Kreuz',
        '--adds': '--Adds',
        '--Bomb Mirror--': '--Bomben-Spiegel--',
        '--Burns': '--Verbrennen',
        '--Demon Mirror--': '--Dämonen-Spiegel--',
        '--forced move--': '--erzwungene Bewegung--',
        '--golems': '--Golems',
        '--holy spheres': '--Sanctus Spheren',
        '--ice golems--': '--Eisgolems--',
        '--ice sprites--': '--Eis-Exergon--',
        '--Icicle Puddles--': '--Eiszapfen Flächen--',
        '--Mythic Mirror': '--mystisches Idolphantom',
        '--reseal\\?--': '--versiegeln?--',
        '--sand spheres': '--Sand Spheren',
        '--Swords Mirror--': '--Schwert-Spiegel--',
        '--tentacles': '--Tentakeln',
        '--towers': '--Türme',
        '--twisters start--': '--Wirbelsturm startet--',
        '--twisters end--': '--Wirbelsturm endet--',
        '--wind spheres': '--Wind Spheren',
        'spot--': 'Stelle--',
        '(?<!un)targetable--': 'anvisierbar--',
        '(?<!--)untargetable--': 'nicht anvisierbar--',
        '/ Holy': '/ Sanctus',
        '\\(1\\)': '(1)',
        '\\(2\\)': '(2)',
        '\\(3\\)': '(3)',
        '\\(across land\\)': '(übers Land)',
        '\\(Blue\\)': '(Blau)',
        '\\(cast\\)': '(wirken)',
        '\\(castbar\\)': '(Zauberleiste)',
        '\\(Cards': '(Kardinal)',
        'Intercards': 'Interkardinal',
        '\\(circle\\)': '(Kreise)',
        '\\(circles\\)': '(Kreise)',
        '\\(Clear\\)': '(Geschafft)',
        '\\(cross\\)': '(Kreuz)',
        '\\(crosses\\)': '(Kreuze)',
        '\\(Crystal\\)': '(Kristall)',
        '\\(Final\\)': '(Finale)',
        '\\(Green\\)': '(Grün)',
        '\\(H Pattern\\)': '(H Muster)',
        '\\(jump\\)': '(Sprung)',
        '\\(knockback\\)': '(Rückstoß)',
        '\\(Lightning\\)': '(Blitz)',
        '\\(marker\\)': '(Markierung)',
        '\\(Move\\)': '(Bewegen)',
        '\\(No Crystal\\)': '(Kein Kristall)',
        '\\(Red\\)': '(Rot)',
        '\\(resurface\\)': '(auftauchen)',
        '\\(Section': '(Abschnitt',
        '\\(side': '(Seite',
        '\\(spreads\\)': '(verteilen)',
        '\\(Stop\\)': '(Stopp)',
        '\\(submerge\\)': '(untertauchen)',
        '\\(tankbusters\\)': '(TankBuster)',
        '\\(towers\\)': '(Türme)',
        '\\(Wind\\)': '(Wind)',
        'Aetherial Exchange': 'Ätherwechsel',
        'Aetherial Ray': 'Ätherstrahl',
        'Aetheric Burst': 'Ätherschub',
        'Agitated Groan': 'Zornesbrüllen',
        'Ancient Aero III': 'Antikes Windga',
        'Ancient Holy': 'Sanctus Antiquus',
        'Ancient Stone III': 'Antikes Steinga',
        'Arcane Blast': 'Magischer Schlag',
        'Arcane Design': 'Arkaner Entwurf',
        'Arcane Light': 'Arkanes Licht',
        'Arcane Orb Spiral': 'Arkaner Orb Spirale',
        'Arcane Reaction': 'Abwehrstrahl',
        'Arcane Recoil': 'Abwehrfeuer',
        'Arcane Spear': 'Kreszenter Speer',
        'Assail': 'Anstürmen',
        'Assassin\'s Dagger': 'Assassinendolch',
        'Augmentation of Beacons': 'Spektrale Anrufung',
        'Augmentation of Roundels': 'Glühende Anrufung',
        'Augmentation of Stones': 'Steinerne Anrufung',
        'Aura Burst': 'Auraknall',
        'Avalaunch': 'Durchschlagendes Firngeschoss',
        'Axeglow': 'Glanz der Axt',
        'Ball of Ice': 'Kontakteis',
        'Barefisted Death': 'Mit bloßen Händen',
        'Bedrock Uplift': 'Bodenhebung',
        'Big(?! Burst)': 'Groß',
        'Big Burst': 'Detonation',
        'Birdserk Rush': 'Sturmklatsche',
        'Blast Knuckles': 'Knöchelsprenger',
        'Blazing Belligerent': 'Dickes Feuermännchen',
        'Blazing Flare': 'Loderndes Flare',
        'Blizzard Trap': 'Eisfalle',
        'Blowout': 'Verwehung',
        'Boil Over': 'Rasender Schlag',
        'Bombshell Drop': 'Kanonenfutter',
        'Bright Pulse': 'Glühen',
        'Cage of Fire': 'Kerkerschuss',
        'Carving Rune': 'Schneidende Runen',
        'Channeled Rage': 'Tobsucht',
        'Chilling Collision': 'Eisiger Einschlag',
        'Choco Aero II': 'Chocobo-Windga',
        'Choco Beak': 'Chocobo-Schnabel',
        'Choco Blades': 'Chocobo-Klinge',
        'Choco Cyclone': 'Chocobo-Zyklon',
        'Choco Doublades': 'Doppelte Chocobo-Klinge',
        'Choco Maelfeather': 'Schwanzfeder',
        'Choco Slaughter': 'Chocobo-Schlachter',
        'Choco Windstorm': 'Chocobo-Sturm',
        'Clawing Shadow': 'Schattenklauen',
        'Clawmarks': 'Nagelmal',
        'Close Call to Detonate': 'Nahexplosive Deklaration',
        'Collateral Balls': 'Kollateral Schüsse',
        'Collateral Damage': 'Kollateralschaden',
        'Collateral Jets': 'Kollateral Wellen',
        'Cometeor of Dangers Near': 'Schmetternder Dämonen-Cometeor',
        'Cometeor of Expulsion Afar': 'Ächtender Dämonen-Cometeor',
        'Cost of Living': 'Altgroschen-Fluch',
        'Critical Axeblow': 'Kritischer Axttreffer',
        'Critical Lanceblow': 'Kritischer Speertreffer',
        'Crystal Call': 'Kristallisierung',
        'Crystal Mirror': 'Kristallene Transposition',
        'Crystallized Energy': 'Kristallene Woge',
        '(?<! )Dark II': 'Negra',
        'Death Ray': 'Todesstrahl',
        'Decisive Battle': 'Entscheidungsschlacht',
        'Decompress': 'Druckexplosion',
        'Deep Freeze': 'Tiefkühlung',
        'Delta Attack': 'Delta-Attacke',
        'Demonic Dark II': 'Dämonen-Negra',
        'Demonograph of Dangers Near': 'Schmetternde Dämonenglyphe',
        'Demonograph of Expulsion Afar': 'Ächtende Dämonenglyphe',
        'Demonography': 'Dämonenglyphe',
        '(?<!-)Destruct': 'Selbstzerstörungsbefehl',
        'Dirty Nails': 'Dreckige Klauen',
        '(?<! )Dive': 'Tauchen',
        'Double Cast': 'Zweifacher Zauber',
        'Draconiform Motion': 'Geschick der Drachen',
        'Dread Deluge': 'Schreckensflut',
        'Dread Dive': 'Furchtabtaucher',
        'Dualfist Flurry': 'Knöchelgeflock',
        'Earthquake': 'Erdbeben',
        'Elemental Impact': 'Einschlag',
        'End of History': 'Kreszente Apokalypse',
        'Epicenter Shock': 'Epizentrischer Schock',
        'Erase Gravity': 'Mikro-Schwerkraft',
        'Excruciating Equilibrium': 'Schmerzhaftes Unentschieden',
        '(?<![\\w|\\s])Explosion(?! )': 'Explosion',
        'Falling Rock': 'Steinschlag',
        'Far Cry to Detonate': 'Fernexplosive Deklaration',
        'Fearsome Facet': 'Phantomkristalle',
        'Fearsome Glint': 'Schauriges Schimmern',
        'Fire Spread': 'Brandstiftung',
        'Fire Trap': 'Feuerfalle',
        'Firestrike': 'Schweres Steinschloss',
        'Flame Thrower': 'Flammensturm',
        'Flatten': 'Einstampfen',
        'Flock of Souls': 'Gegabelter Blitz',
        'Forked Fury': 'Fork-Zorn',
        'Fourpenny Inflation': 'Vier-Groschen-Fluch',
        'Frigid Dive': 'Froststurz',
        'Frigid Twister': 'Eistornado',
        'Frozen Fallout': 'Giftmännchenflug',
        'Frozen Heart': 'Herz aus Eis',
        'Fusion Burst': 'Fusionsknall',
        'Geothermal Rupture': 'Geothermale Explosion',
        'Gigaflare': 'Gigaflare',
        'Gravity of Dangers Near': 'Schmetternde Mikro-Schwerkraft',
        'Gravity of Expulsion Afar': 'Ächtende Mikro-Schwerkraft',
        'Great Ball of Fire': 'Feuerball',
        'Heated Outburst': 'Jähzorn',
        'Heave': 'Vogelklatsche',
        'Heightened Rage': 'Wilder Furor',
        'Hoard Wealth': 'Preissturzflut',
        '(?<! )Holy(?! )': 'Sanctus',
        'Holy Blaze': 'Heiliger Glanz',
        'Holy IV': 'Giga-Sanctus',
        'Holy Lance': 'Heiligenspeer',
        'Hopping Mad': 'Tobender Stoß',
        'Horizontal Crosshatch': 'Horizontale Doppelnägel',
        'Hydrocleave': 'Wasserpein',
        'Icebound Buffoon': 'Dickes Schneemännchen',
        'Ill-gotten Goods': 'Verwunschenes Pfand',
        'Imitation Blizzard': 'Falscher Schneesturm',
        'Imitation Icicle': 'Falscher Eiszapfen',
        'Imitation Rain': 'Falscher Regen',
        'Imitation Star': 'Falscher Stern',
        'Karmic Drain': 'Karmischer Entzug',
        'Knuckle Crusher': 'Knöchelknacker',
        'Knuckle Down': 'Knöcheltreffer',
        'Lacunate Stream': 'Glyphenfluss',
        'Lamplight': 'Schauerlichter',
        '(?<! )Lance': 'Lanze',
        'Lancelight': 'Glanz des Speeres',
        'Landing': '落着',
        'Lethal Nails': 'Todesnägel',
        'Lifeless Legacy': 'Lebloses Erbe',
        'Light Surge': 'Lichtbombe',
        'Lightning Charge': 'Geladener Blitz',
        'Lightning Crossing': 'Fächerblitz',
        'Line of Fire': 'Schussbahn',
        'Lots Cast': 'Magieexplosion',
        'Made Magic': 'Magiefeuer',
        'Mammoth Bolt': 'Plasmaregen',
        'Mana Expulsion': 'Manaplosion',
        'Manifold Marks': 'Multimal',
        'Marine Mayhem': 'Meereschaos',
        'Material World': 'Verwünscherei',
        'Mind Blast': 'Geiststoß',
        'Moatmaker': 'Knöchelwelle',
        'Molt': 'Obsession',
        'Mystic Heat': 'Mystische Hitze',
        'Noisome Nuisance': 'Dickes Giftmännchen',
        'Noxious Nova': 'Giftige Explosion',
        'Occult Chisel': 'Magia-Glyphen',
        'Onepenny Inflation': 'Ein-Groschen-Fluch',
        'Open Water': 'Freiwasser',
        'Pelagic Cleaver': 'Pelagische Pein',
        'Portentous Comet(?!eor)': 'Dämonen-Cometeor',
        'Portentous Cometeor': 'Dämonen-Cometeor',
        'Primal Roar': 'Lautes Gebrüll',
        'Primordial Chaos': 'Giftgalliges Paradies',
        'Prismatic Wing': 'Kristallene Schwingen',
        'Punishing Pounce': 'Verbrannter Hopser',
        'Radiant Wave': 'Strahlende Welle',
        'Raking Scratch': 'Harkenkratzer',
        'Ray of Dangers Near': 'Schmetternder Dunkelstrahl',
        'Ray of Expulsion Afar': 'Ächtender Dunkelstrahl',
        'Ray of Ignorance': 'Dunkelstrahl',
        'Recharge': 'Aufladen',
        'Recommended for You': 'Wärmste Empfehlung',
        'Restore Gravity': 'Erdung',
        'Return(?!\\w)': 'Rückführung',
        'Returns': 'Rückführung',
        'Rockslide': 'Erdrutsch',
        'Rotate Left': 'Linksdrehung',
        'Rotate Right': 'Rechtsdrehung',
        'Rotation': 'Drehung',
        'Ruby Blaze': 'Rubinfäule',
        'Ruinous Rune': 'Ruinöse Runen',
        '(?<! )Rumble': 'Grollen',
        'Rune Axe': 'Runenaxt',
        '(?<![\\w|\\s])Rush(?!\\w)': 'Stürmen',
        'Rushing Rumble': 'Grollendes Stürmen',
        'Sage\'s Staff': 'Stab des Weisen',
        'Sand Surge': 'Erdbombe',
        'Scathing Sweep': 'Seitenhieb',
        '(?<! )Scratch': 'Schramme',
        'Seal Asunder': 'Siegelbruch',
        'Self-destruct': 'Selbstzerstörung',
        'Shades\' Crossing': 'Schattenkreuz',
        'Shades\' Nest': 'Nest der Schatten',
        'Shifting Shape': 'Bauchschnitt',
        'Shockwave': 'Schockwelle',
        'Six-Handed Fistfight': 'Handgemenge',
        'Skulking Orders': 'Strafbefehl',
        'Slice \'n\' Dice': 'Aufschlitzer',
        'Slice \'n\' Strike': 'Schweres Steinschlitzschloss',
        'Small': 'Klein',
        'Snow Boulder': 'Firngeschoss',
        'Snowball Flight': 'Amok-Schneemann',
        'Spinning Siege': 'Wirbelschuss',
        'Spirit Sling': 'Geistgeschoss',
        'Squash': 'Trampeltier',
        'Steelstrike': 'Stahlstreich',
        'Stone Swell': 'Steinflut',
        'Summon': 'Beschwörung',
        'Sunderseal Roar': 'Berstendes Gebrüll',
        'Surprise Attack': 'Überraschungsangriff',
        '(?<!S)Tell': 'Zeichen',
        'The Grip of Poison': 'Tückische Resonanz',
        'Three-Body Problem': 'Mond-Manöver',
        'Three-Body Probl─': 'Mond-Manöver?',
        'Threefold Marks': 'Tripelmal',
        'Tidal Breath': 'Hauch der Gezeiten',
        'To the Winds': 'Explosive Verstreuung',
        'Twopenny Inflation': 'Zwei-Groschen-Fluch',
        'Unseal(?!ed)': 'Entsiegelung',
        'Unsealed Aura': 'Entsiegelte Aura',
        'Vengeful Bio III': 'Rache-Bioga',
        'Vengeful Blizzard III': 'Rache-Eisga',
        'Vengeful Fire III': 'Rache-Feuga',
        'Vertical Crosshatch': 'Vertikale Doppelnägel',
        'Void Death IV': 'Nichts-Todka',
        'Void Thunder III': 'Nichts-Blitzga',
        'Wallop': 'Eindreschen',
        'Waterspout': 'Wasserhose',
        'What\'re You Buying?': 'Kauf was!',
        'White-hot Rage': 'Jähzorniger Schub',
        'Wicked Water': 'Verfluchtes Wasser',
        'Wind Surge': 'Windbombe',
        'Withering Eternity': 'Welkendes Zeitalter',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Advanced Aevis': 'eibis évolué',
        'Assassin\'s Dagger': 'dague d\'assassin',
        'Axe Empowerment Conduit': 'décupleur magique de hache',
        'Ball of Fire': 'orbe de feu',
        'Black Chocobo': 'chocobo noir',
        'Black Star': 'Étoile noire',
        'Chatterbird': 'papoteur',
        'Clawmarks': 'griffure',
        'Cloister Demon': 'démon du Cloître',
        'Command Urn': 'urne de commande',
        'Crescent Berserker': 'berserker de Lunule',
        'Crystal Dragon': 'dragon cristallin',
        'Dead Stars': 'trio de la Fosse',
        'Death Claw': 'Griffe de mort',
        'Dehumidifier': 'déshumidificateur',
        'Demon Tablet': 'muraille démonique',
        'Draconic Double': 'double de dragon cristallin',
        'Execrator': 'bourrelle',
        'Frozen Phobos': 'Phobos gelé',
        'Frozen Triton': 'Tritonien gelé',
        'Gaseous Nereid': 'Néregat enflammé',
        'Gaseous Phobos': 'Phobos enflammé',
        'Giant Bird': 'oiseau géant',
        'Gilded Headstone': 'pierre tombale dorée',
        'Guardian Berserker': 'berserker gardien',
        'Guardian Knight': 'chevalier gardien',
        'Guardian Weapon': 'arme gardienne',
        'Guardian Wraith': 'spectre gardien',
        'Hinkypunk': 'follet folâtre',
        'Holy Sphere': 'orbe de lumière',
        'Ice Golem': 'golem de glace',
        'Icewind': 'vent glacé',
        'Jesting Jackanapes': 'galkimasera',
        'Lance Empowerment Conduit': 'décupleur magique de lance',
        'Lifereaper': 'collecteur de vies',
        'Lion Rampant': 'lion rampant',
        'Liquified Triton': 'Tritonien fondu',
        'Luminous Lance': 'lance de lumière',
        'Magitaur': 'magitaure',
        'Marble Dragon': 'dragon marmoréen',
        'Master Lockward': 'maître des serrures',
        'Megaloknight': 'mégalochevalier',
        'Mysterious Mindflayer': 'ensorceleur',
        'Mythic Idol': 'idole mythique',
        'Mythic Mirror': 'double d\'idole mythique',
        'Nammu': 'Nammu',
        'Neo Garula': 'néo-garula',
        '(?<! )Nereid': 'Néregat',
        'Nymian Petalodus': 'petalodus de Nym',
        'Observer': 'insulobservateur',
        'Occult Knight': 'chevalier de Lunule',
        'Ochre Stone': 'rocher instable massif',
        'Petalodus Progeny': 'rejeton de petalodus',
        'Phantom Claw': 'mirage de Griffe de mort',
        '(?<! )Phobos': 'Phobos',
        'Repaired Lion': 'lion réparé',
        'Ropross': 'Ropross',
        'Sage\'s Staff': 'bâton de sage',
        'Sisyphus': 'Sisyphos',
        'Tentacle': 'tentacule',
        'Tower Abyss': 'arabesque de la Tour',
        'Tower Bhoot': 'bhut de la Tour',
        'Tower Idol': 'idole de la Tour',
        'Tower Manticore': 'manticore de la Tour',
        'Tower Progenitor': 'papa bombo de la Tour',
        'Tower Progenitrix': 'maman bombo de la Tour',
        'Trade Tortoise': 'tortue à pièces',
        'Trap': 'piège',
        '(?<! )Triton(?!\\w)': 'Tritonien',
        'Universal Empowerment Conduit': 'unité de contrôle général',
        'Vassal Vessel': 'poupée vassale',
      },
      'replaceText': {
        'Aetherial Exchange': 'Changement éthéréen',
        'Aetherial Ray': 'Rayon éthéré',
        'Aetheric Burst': 'Explosion éthérée',
        'Agitated Groan': 'Rugissement rageur',
        'Ancient Aero III': 'Méga Vent ancien',
        'Ancient Holy': 'Miracle ancien',
        'Ancient Stone III': 'Méga Terre ancienne',
        'Arcane Blast': 'Explosion arcanique',
        'Arcane Design': 'Dessein arcanique',
        'Arcane Light': 'Éclat arcanique',
        'Arcane Reaction': 'Rayon de riposte',
        'Arcane Recoil': 'Canon de riposte',
        'Arcane Spear': 'Magi Lance',
        'Assail': 'Ordre de couverture',
        'Assassin\'s Dagger': 'dague d\'assassin',
        'Augmentation of Beacons': 'Invocation spectrale',
        'Augmentation of Roundels': 'Invocation lumineuse',
        'Augmentation of Stones': 'Invocation rocheuse',
        'Aura Burst': 'Déflagration d\'aura',
        'Avalaunch': 'Boule de neige bondissante',
        'Axeglow': 'Hache chatoyante',
        'Ball of Ice': 'Boule de glace',
        'Barefisted Death': 'Poing de la mort',
        'Bedrock Uplift': 'Surrection',
        'Big Burst': 'Grosse explosion',
        'Birdserk Rush': 'Ruée soulevante',
        'Blast Knuckles': 'Poing explosif',
        'Blazing Belligerent': 'Boubou-boule de feu',
        'Blazing Flare': 'Brasier ardent',
        'Blizzard Trap': 'Piège de glace',
        'Blowout': 'Expulsion',
        'Boil Over': 'Poussée de colère',
        'Bombshell Drop': 'Bombordement',
        'Bright Pulse': 'Éclat',
        'Cage of Fire': 'Canon encageant',
        'Carving Rune': 'Rune découpante',
        'Channeled Rage': 'Accès de fureur',
        'Chilling Collision': 'Impact glacé',
        'Choco Aero II': 'Choco-Extra Vent',
        'Choco Beak': 'Choco-bec',
        'Choco Blades': 'Choco-lame',
        'Choco Cyclone': 'Choco-cyclone',
        'Choco Doublades': 'Double choco-lame',
        'Choco Maelfeather': 'Penne',
        'Choco Slaughter': 'Choco-massacre',
        'Choco Windstorm': 'Choco-tempête',
        'Clawing Shadow': 'Serres brumeuses',
        'Clawmarks': 'griffure',
        'Close Call to Detonate': 'Annonce d\'explosion proche',
        'Collateral Damage': 'Dégâts collatéraux',
        'Cometeor of Dangers Near': 'Cométéore démoniaque écrasant',
        'Cometeor of Expulsion Afar': 'Cométéore démoniaque balayant',
        'Cost of Living': 'Rafale de pièces anciennes',
        'Critical Axeblow': 'Fendoir critique',
        'Critical Lanceblow': 'Pique critique',
        'Crystal Call': 'Cristallisation',
        'Crystal Mirror': 'Transfert cristallin',
        'Crystallized Energy': 'Onde cristalline',
        '(?<! )Dark II': 'Extra Ténèbres',
        'Death Ray': 'Rayon de la mort',
        'Decisive Battle': 'Combat décisif',
        'Decompress': 'Explosion écrasante',
        'Deep Freeze': 'Congélation',
        'Delta Attack': 'Attaque Delta',
        'Demonic Dark II': 'Extra Ténèbres démoniaques',
        'Demonograph of Dangers Near': 'Glyphe démoniaque écrasant',
        'Demonograph of Expulsion Afar': 'Glyphe démoniaque balayant',
        'Demonography': 'Glyphe démoniaque',
        '(?<!(-|Descellement ))Destruct': 'Ordre de sacrifice',
        'Dirty Nails': 'Serres putrides',
        '(?<! )Dive': 'Plongeon océanique',
        'Double Cast': 'Double incantation',
        'Draconiform Motion': 'Motion draconique',
        'Dread Deluge': 'Déluge effroyable',
        'Dread Dive': 'Plongeon d\'effroi',
        'Dualfist Flurry': 'Avalanche de poings',
        'Earthquake': 'Tremblement de terre',
        'Elemental Impact': 'Impact de canon',
        'End of History': 'Magi Apocalypse',
        'Epicenter Shock': 'Épicentre électrique',
        'Erase Gravity': 'Microgravité',
        'Excruciating Equilibrium': 'Douleur partagée',
        '(?<![\\w|\\s])Explosion(?! )': 'Explosion',
        'Falling Rock': 'Chute de pierre',
        'Far Cry to Detonate': 'Annonce d\'explosion distante',
        'Fearsome Facet': 'Cristaux spectraux',
        'Fearsome Glint': 'Éclair effrayant',
        'Fire Spread': 'Nappe de feu',
        'Fire Trap': 'Piège de feu',
        'Firestrike': 'Artillerie lourde',
        'Flame Thrower': 'Crache-flammes',
        'Flatten': 'Aplatissement',
        'Flock of Souls': 'Envolée d\'âmes',
        'Forked Fury': 'Furie fourchue',
        'Fourpenny Inflation': 'Rafale maudite à quatre sous',
        'Frigid Dive': 'Piqué glacé',
        'Frigid Twister': 'Tornades de glace',
        'Frozen Fallout': 'Lancer de boule de poison',
        'Frozen Heart': 'Cœur glacé',
        'Fusion Burst': 'Fusion explosive',
        'Geothermal Rupture': 'Explosion géothermique',
        'Gigaflare': 'GigaBrasier',
        'Gravity of Dangers Near': 'Microgravité écrasante',
        'Gravity of Expulsion Afar': 'Microgravité balayante',
        'Great Ball of Fire': 'Orbes de feu',
        'Heated Outburst': 'Courroux ardent',
        'Heave': 'Soulèvement',
        'Heightened Rage': 'Déchaînement de rage',
        'Hoard Wealth': 'Vague de prix cassés',
        '(?<! )Holy(?! )': 'Miracle',
        'Holy Blaze': 'Embrasement sacré',
        'Holy IV': 'Giga Miracle',
        'Holy Lance': 'Lance sacrée',
        'Hopping Mad': 'Impulsion frénétique',
        'Horizontal Crosshatch': 'Intersection horizontale',
        'Hydrocleave': 'Fendoir fluide',
        'Icebound Buffoon': 'Boubou-boule de neige',
        'Ill-gotten Goods': 'Prêt punitif',
        'Imitation Blizzard': 'Réplique de blizzard',
        'Imitation Icicle': 'Réplique de stalactite',
        'Imitation Rain': 'Réplique de pluie',
        'Imitation Star': 'Réplique d\'étoile',
        'Karmic Drain': 'Érosion d\'existence',
        'Knuckle Crusher': 'Poing écrasant',
        'Knuckle Down': 'Impact du poing',
        'Lacunate Stream': 'Flux glyphique',
        'Lamplight': 'Lueur fantôme',
        'Lancelight': 'Lance lumineuse',
        'Landing': '落着',
        'Lethal Nails': 'Griffes mortelles',
        'Lifeless Legacy': 'Morne héritage',
        'Light Surge': 'Explosion sacrée',
        'Lightning Charge': 'Surcharge survoltée',
        'Lightning Crossing': 'Vague voltaïque',
        'Line of Fire': 'Canon linéaire',
        'Lots Cast': 'Bombe ensorcelée',
        'Made Magic': 'Déferlante magique',
        'Mammoth Bolt': 'Chute de plasma',
        'Mana Expulsion': 'Explosion de mana',
        'Manifold Marks': 'Marques multiples',
        'Marine Mayhem': 'Mutilation marine',
        'Material World': 'Marchandises maudites',
        'Mind Blast': 'Explosion mentale',
        'Moatmaker': 'Vague de poings',
        'Molt': 'Possession',
        'Mystic Heat': 'Rayon mystique',
        'Noisome Nuisance': 'Boubou-boule de poison',
        'Noxious Nova': 'Explosion toxique',
        'Occult Chisel': 'Glyphe Magia',
        'Onepenny Inflation': 'Rafale maudite à un sou',
        'Open Water': 'Eaux libres',
        'Pelagic Cleaver': 'Fendoir pélagique',
        'Portentous Comet(?!eor)': 'Comète démoniaque',
        'Portentous Cometeor': 'Cométéore démoniaque',
        'Primal Roar': 'Rugissement furieux',
        'Primordial Chaos': 'Paradis empoisonné',
        'Prismatic Wing': 'Aile cristalline',
        'Punishing Pounce': 'Bond belliqueux',
        'Radiant Wave': 'Onde radiante',
        'Raking Scratch': 'Griffes ratisseuses',
        'Ray of Dangers Near': 'Rayon ténébreux écrasant',
        'Ray of Expulsion Afar': 'Rayon ténébreux balayant',
        'Ray of Ignorance': 'Rayon ténébreux',
        'Recharge': 'Recharge',
        'Recommended for You': 'Produit désigné',
        'Restore Gravity': 'Réinitialisation de gravité',
        'Return': 'Rapatriement',
        'Rockslide': 'Éboulement',
        'Rotate Left': 'Pivot à gauche',
        'Rotate Right': 'Pivot à droite',
        'Rotation': 'Pivot',
        'Ruby Blaze': 'Malédiction incandescente',
        'Ruinous Rune': 'Rune ruineuse',
        '(?<! )Rumble': 'Ébranlement',
        'Rune Axe': 'Hache runique',
        '(?<![\\w|\\s])Rush(?!\\w)': 'Ruée',
        'Rushing Rumble': 'Ruée ébranlante',
        'Sage\'s Staff': 'bâton de sage',
        'Sand Surge': 'Explosion tellurique',
        'Scathing Sweep': 'Fauche latérale',
        '(?<! )Scratch': 'Griffade',
        'Seal Asunder': 'Descellement destructeur',
        'Self-destruct': 'Auto-destruction',
        'Shades\' Crossing': 'Croix ombrale',
        'Shades\' Nest': 'Cercle ombral',
        'Shifting Shape': 'Incision ventrale',
        'Shockwave': 'Onde de choc',
        'Six-Handed Fistfight': 'Empoignade effrénée',
        'Skulking Orders': 'Ordre d\'élimination',
        'Slice \'n\' Dice': 'Éventrement',
        'Slice \'n\' Strike': 'Éventrement et artillerie lourde',
        'Snow Boulder': 'Bloc de neige',
        'Snowball Flight': 'Branle-bas de boule de neige',
        'Spinning Siege': 'Canon tournoyant',
        'Spirit Sling': 'Canon à mana',
        'Squash': 'Piétinement implacable',
        'Steelstrike': 'Frappe d\'épée',
        'Stone Swell': 'Houle rocheuse',
        'Summon': 'Invocation',
        'Sunderseal Roar': 'Rugissement libérateur',
        'Surprise Attack': 'Attaque surprise',
        'The Grip of Poison': 'Résonnance de la malfaisance',
        'Three-Body Problem': 'Satellites combinés',
        'Three-Body Probl─': 'Satellites combinés ?',
        'Threefold Marks': 'Triple marque',
        'Tidal Breath': 'Souffle supratidal',
        'To the Winds': 'Éparpillement venteux',
        'Twopenny Inflation': 'Rafale maudite à deux sous',
        'Unseal(?!ed)': 'Descellage',
        'Unsealed Aura': 'Libération d\'aura',
        'Vengeful Bio III': 'Méga Bactérie vengeresse',
        'Vengeful Blizzard III': 'Méga Glace vengeresse',
        'Vengeful Fire III': 'Méga Feu vengeur',
        'Vertical Crosshatch': 'Intersection verticale',
        'Void Death IV': 'Giga Mort du néant',
        'Void Thunder III': 'Méga Foudre du néant',
        'Wallop': 'Rossée',
        'Waterspout': 'Inondation',
        'What\'re You Buying?': 'Obligation d\'achat',
        'White-hot Rage': 'Rage incandescente',
        'Wicked Water': 'Eau abjecte',
        'Wind Surge': 'Explosion aérienne',
        'Withering Eternity': 'Ère d\'extinction',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Advanced Aevis': 'アドバンスドエイビス',
        'Assassin\'s Dagger': 'アサシンダガー',
        'Axe Empowerment Conduit': '魔道増幅器【アクス】',
        'Ball of Fire': '火球',
        'Black Chocobo': '黒チョコボ',
        'Black Star': 'ブラックスター',
        'Chatterbird': 'チャッター',
        'Clawmarks': 'ネイルマーク',
        'Cloister Demon': 'クロイスターデーモン',
        'Command Urn': 'コマンドポット',
        'Crescent Berserker': 'クレセント・バーサーカー',
        'Crystal Dragon': '水晶竜',
        'Dead Stars': '星頭の三人組',
        'Death Claw': 'デスクロー',
        'Dehumidifier': 'ディヒューミディファイア',
        'Demon Tablet': 'デモンズ・タブレット',
        'Draconic Double': '水晶竜の幻影',
        'Execrator': 'イグゼクレーター',
        'Frozen Phobos': '凍ったフォーボス',
        'Frozen Triton': '凍ったトライトン',
        'Gaseous Nereid': '燃えたネレゲイド',
        'Gaseous Phobos': '燃えたフォーボス',
        'Giant Bird': '巨大鳥',
        'Gilded Headstone': 'ゴールデンブロックス',
        'Guardian Berserker': 'ガード・バーサーカー',
        'Guardian Knight': 'ガード・ナイト',
        'Guardian Weapon': 'ガード・ウェポン',
        'Guardian Wraith': 'ガード・レイス',
        'Hinkypunk': 'ヒンキーパンク',
        'Holy Sphere': '光球',
        'Ice Golem': 'アイスゴーレム',
        'Icewind': '氷風',
        'Jesting Jackanapes': 'ガルキマセラ',
        'Lance Empowerment Conduit': '魔道増幅器【ランス】',
        'Lifereaper': 'ライフギャザラー',
        'Lion Rampant': 'ランパントライオン',
        'Liquified Triton': '溶けたトライトン',
        'Luminous Lance': '光の槍',
        'Magitaur': 'マギタウロス',
        'Marble Dragon': 'マーブルドラゴン',
        'Master Lockward': 'アルファ・ロックワード',
        'Megaloknight': 'メガロナイト',
        'Mysterious Mindflayer': 'マインドフレイア',
        'Mythic Idol': 'ミシカルアイドル',
        'Mythic Mirror': 'ミシカルアイドルの幻影',
        'Nammu': 'ナンム',
        'Neo Garula': 'ネオガルラ',
        '(?<! )Nereid': 'ネレゲイド',
        'Nymian Petalodus': 'ニーム・ペタロドゥス',
        'Observer': 'アイルオブザーバー',
        'Occult Knight': 'クレセントナイト',
        'Ochre Stone': '大岩石',
        'Petalodus Progeny': 'ペタロドゥス・プロジェニー',
        'Phantom Claw': 'ミラージュ・デスクロー',
        '(?<! )Phobos': 'フォーボス',
        'Repaired Lion': 'リペアドライオン',
        'Ropross': 'ロプロス',
        'Sage\'s Staff': '賢者の杖',
        'Sisyphus': 'シジフォス',
        'Tentacle': '触手',
        'Tower Abyss': 'タワー・アビス',
        'Tower Bhoot': 'タワー・ブフート',
        'Tower Idol': 'タワー・アイドル',
        'Tower Manticore': 'タワー・マンティコア',
        'Tower Progenitor': 'タワー・ファザーボム',
        'Tower Progenitrix': 'タワー・マザーボム',
        'Trade Tortoise': 'コイントートス',
        'Trap': 'トラップ',
        '(?<! )Triton(?!\\w)': 'トライトン',
        'Universal Empowerment Conduit': '増幅統括器',
        'Vassal Vessel': 'ヴァッサルドール',
      },
      'replaceText': {
        'Aetherial Exchange': 'エーテルチェンジ',
        'Aetherial Ray': 'エーテルレイ',
        'Aetheric Burst': 'エーテルバースト',
        'Agitated Groan': '怒りの咆哮',
        'Ancient Aero III': 'エンシェントエアロガ',
        'Ancient Holy': 'エンシェントホーリー',
        'Ancient Stone III': 'エンシェントストンガ',
        'Arcane Blast': 'マジックブラスト',
        'Arcane Design': '魔連弾',
        'Arcane Light': '魔閃光',
        'Arcane Reaction': '反応魔光',
        'Arcane Recoil': '反応砲撃',
        'Arcane Spear': 'マギスピア',
        'Assail': '攻撃指示',
        'Assassin\'s Dagger': 'アサシンダガー',
        'Augmentation of Beacons': '魔砲召喚',
        'Augmentation of Roundels': '光球召喚',
        'Augmentation of Stones': '岩石召喚',
        'Aura Burst': 'オーラバースト',
        'Avalaunch': '跳ね飛び豪雪球',
        'Axeglow': 'アクスオーラ',
        'Ball of Ice': '氷結',
        'Barefisted Death': 'ナックル・オブ・デス',
        'Bedrock Uplift': '地盤隆起',
        'Big Burst': '大爆発',
        'Birdserk Rush': '突進しゃくり上げ',
        'Blast Knuckles': 'ブラストナックル',
        'Blazing Belligerent': 'やりすぎ火だるま',
        'Blazing Flare': 'ブレイジングフレア',
        'Blizzard Trap': 'ブリザドトラップ',
        'Blowout': 'ブロウアウト',
        'Boil Over': '怒発',
        'Bombshell Drop': 'ボムボム',
        'Bright Pulse': '閃光',
        'Cage of Fire': 'ケージキャノン',
        'Carving Rune': 'カーヴィングルーン',
        'Channeled Rage': '激怒',
        'Chilling Collision': 'アイスインパクト',
        'Choco Aero II': 'チョコエアロラ',
        'Choco Beak': 'チョコビーク',
        'Choco Blades': 'チョコブレード',
        'Choco Cyclone': 'チョコサイクロン',
        'Choco Doublades': 'ダブルチョコブレード',
        'Choco Maelfeather': 'テイルフェザー',
        'Choco Slaughter': 'チョコスローター',
        'Choco Windstorm': 'チョコストーム',
        'Clawing Shadow': 'ヘイズクロー',
        'Clawmarks': 'ネイルマーク',
        'Close Call to Detonate': '爆発宣言：近',
        'Collateral Damage': 'とばっちり',
        'Cometeor of Dangers Near': '圧潰式デモンズコメテオ',
        'Cometeor of Expulsion Afar': '排斥式デモンズコメテオ',
        'Cost of Living': '古銭爆風',
        'Critical Axeblow': 'クリティカルアクス',
        'Critical Lanceblow': 'クリティカルランス',
        'Crystal Call': '晶石生成',
        'Crystal Mirror': '晶石転移',
        'Crystallized Energy': '水晶波動',
        '(?<! )Dark II': 'ダーラ',
        'Death Ray': 'デスレイ',
        'Decisive Battle': '決戦',
        'Decompress': '圧縮爆発',
        'Deep Freeze': '氷結',
        'Delta Attack': 'デルタアタック',
        'Demonic Dark II': 'デモンズダーラ',
        'Demonograph of Dangers Near': '圧潰式デモンズグリフ',
        'Demonograph of Expulsion Afar': '排斥式デモンズグリフ',
        'Demonography': 'デモンズグリフ',
        '(?<!-)Destruct': '自爆指示',
        'Dirty Nails': 'ダーティクロー',
        '(?<! )Dive': '飛び込み',
        'Double Cast': 'ダブルキャスト',
        'Draconiform Motion': 'ドラゴニックムーブ',
        'Dread Deluge': 'ドレッドデリージュ',
        'Dread Dive': 'ドレッドダイヴ',
        'Dualfist Flurry': 'ナックルアバランチ',
        'Earthquake': '地震',
        'Elemental Impact': '着弾',
        'End of History': 'マギ・アポカリプス',
        'Epicenter Shock': '円状放雷',
        'Erase Gravity': 'マイクログラビティ',
        'Excruciating Equilibrium': '痛み分け',
        'Explosion(?! )': '爆発',
        'Falling Rock': '落石',
        'Far Cry to Detonate': '爆発宣言：遠',
        'Fearsome Facet': '幻影晶石',
        'Fearsome Glint': 'フィアーサムグリント',
        'Fire Spread': '放火',
        'Fire Trap': 'ファイアトラップ',
        'Firestrike': '重火砲',
        'Flame Thrower': '火炎放射',
        'Flatten': '押しつぶす',
        'Flock of Souls': '分霊',
        'Forked Fury': 'フォークフューリー',
        'Fourpenny Inflation': '四銭の呪爆風',
        'Frigid Dive': 'フロストダイブ',
        'Frigid Twister': 'アイストルネード',
        'Frozen Fallout': '毒だるま飛ばし',
        'Frozen Heart': 'フローズンハート',
        'Fusion Burst': '融合爆発',
        'Geothermal Rupture': '地熱爆破',
        'Gigaflare': 'ギガフレア',
        'Gravity of Dangers Near': '圧潰式マイクログラビティ',
        'Gravity of Expulsion Afar': '排斥式マイクログラビティ',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '気炎',
        'Heave': 'しゃくり上げ',
        'Heightened Rage': '大激怒',
        'Hoard Wealth': '価値暴落の波動',
        '(?<! )Holy(?! )': 'ホーリー',
        'Holy Blaze': 'ホーリーブレイズ',
        'Holy IV': 'ホーリジャ',
        'Holy Lance': 'ホーリーランス',
        'Hopping Mad': '震撃怒涛',
        'Horizontal Crosshatch': 'ホリゾンタル・ダブルネイル',
        'Hydrocleave': 'ウォータークリーヴ',
        'Icebound Buffoon': 'やりすぎ雪だるま',
        'Ill-gotten Goods': '呪物貸与',
        'Imitation Blizzard': 'イミテイトブリザード',
        'Imitation Icicle': 'イミテイトアイシクル',
        'Imitation Rain': 'イミテイトレイン',
        'Imitation Star': 'イミテイトスター',
        'Karmic Drain': 'ライフエロージョン',
        'Knuckle Crusher': 'クラッシュナックル',
        'Knuckle Down': 'ナックルインパクト',
        'Lacunate Stream': 'グリフストリーム',
        'Lamplight': 'スプークライツ',
        'Lancelight': 'ランスオーラ',
        'Landing': '落着',
        'Lethal Nails': 'デスネイル',
        'Lifeless Legacy': 'ライフレス・レガシー',
        'Light Surge': '光爆',
        'Lightning Charge': '過雷流',
        'Lightning Crossing': '扇状放雷',
        'Line of Fire': 'ラインキャノン',
        'Lots Cast': '魔爆発',
        'Made Magic': '魔力放出',
        'Mammoth Bolt': '大落雷',
        'Mana Expulsion': 'マナプロ―ジョン',
        'Manifold Marks': 'マルチプルマーク',
        'Marine Mayhem': 'マリーンメイヘム',
        'Material World': '呪物発動',
        'Mind Blast': 'マインドブラスト',
        'Moatmaker': 'ナックルウェーブ',
        'Molt': '憑依',
        'Mystic Heat': '魔熱線',
        'Noisome Nuisance': 'やりすぎ毒だるま',
        'Noxious Nova': '毒素爆散',
        'Occult Chisel': 'グリフマギア',
        'Onepenny Inflation': '一銭の呪爆風',
        'Open Water': 'オープン・ウォーター',
        'Pelagic Cleaver': 'ペラジッククリーヴ',
        'Portentous Comet(?!eor)': 'デモンズコメット',
        'Portentous Cometeor': 'デモンズコメテオ',
        'Primal Roar': '大咆哮',
        'Primordial Chaos': '毒々パラダイス',
        'Prismatic Wing': '水晶の翼',
        'Punishing Pounce': 'ペンペンリープ',
        'Radiant Wave': 'ブライトノイズ',
        'Raking Scratch': 'ネイルストリーク',
        'Ray of Dangers Near': '圧潰式ダークレイ',
        'Ray of Expulsion Afar': '排斥式ダークレイ',
        'Ray of Ignorance': 'ダークレイ',
        'Recharge': '魔力供給',
        'Recommended for You': '商品指定',
        'Restore Gravity': 'グラビティリセット',
        'Return': 'デジョン',
        'Rockslide': 'ロックスライド',
        'Rotate Left': 'レフトターン',
        'Rotate Right': 'ライトターン',
        'Rotation': 'ターン',
        'Ruby Blaze': '赤熱の呪い',
        'Ruinous Rune': 'ルイナスルーン',
        '(?<! )Rumble': '地揺らし',
        'Rune Axe': 'ルーンアクス',
        '(?<![\\w|\\s])Rush(?!\\w)': '突進',
        'Rushing Rumble': '突進地揺らし',
        'Sage\'s Staff': '賢者の杖',
        'Sand Surge': '土爆',
        'Scathing Sweep': '横薙ぎ',
        '(?<! )Scratch': 'スクラッチ',
        'Seal Asunder': '封印破壊',
        'Self-destruct': '自爆',
        'Shades\' Crossing': 'クロスシェイド',
        'Shades\' Nest': 'シェイドフープ',
        'Shifting Shape': '開腹',
        'Shockwave': '衝撃波',
        'Six-Handed Fistfight': '取っ組み合い',
        'Skulking Orders': 'パニッシングオーダー',
        'Slice \'n\' Dice': '切り裂き',
        'Slice \'n\' Strike': '切り裂いて重火砲',
        'Snow Boulder': '豪雪球',
        'Snowball Flight': '爆走雪だるま',
        'Spinning Siege': 'スピニングキャノン',
        'Spirit Sling': 'マナキャノン',
        'Squash': '踏み潰し',
        'Steelstrike': 'ソードストライク',
        'Stone Swell': 'ロックスウェル',
        'Summon': '召喚',
        'Sunderseal Roar': '壊封の咆哮',
        'Surprise Attack': 'ハイドアタック',
        'The Grip of Poison': '邪気の共振',
        'Three-Body Problem': 'サテライトコンビネーション',
        'Three-Body Probl─': 'サテライトコンビネーション？',
        'Threefold Marks': 'トリプルマーク',
        'Tidal Breath': 'タイダルブレス',
        'To the Winds': '爆発四散',
        'Twopenny Inflation': '二銭の呪爆風',
        'Unseal(?!ed)': '封印解放',
        'Unsealed Aura': 'アンシール・オーラ',
        'Vengeful Bio III': 'リベンジバイオガ',
        'Vengeful Blizzard III': 'リベンジブリザガ',
        'Vengeful Fire III': 'リベンジファイガ',
        'Vertical Crosshatch': 'バーチカル・ダブルネイル',
        'Void Death IV': 'ヴォイド・デスジャ',
        'Void Thunder III': 'ヴォイド・サンダガ',
        'Wallop': '叩きつけ',
        'Waterspout': 'オーバーフラッド',
        'What\'re You Buying?': '購買命令',
        'White-hot Rage': '気炎怒涛',
        'Wicked Water': 'カースドウォーター',
        'Wind Surge': '風爆',
        'Withering Eternity': 'ウィザリング・エイジ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Advanced Aevis': '高等魔鸟',
        'Assassin\'s Dagger': '暗杀短剑',
        'Ball of Fire': '火球',
        'Black Chocobo': '黑陆行鸟',
        'Black Star': '黑色天星',
        'Chatterbird': '叽喳鸟',
        'Clawmarks': '抓痕',
        'Cloister Demon': '回廊恶魔',
        'Command Urn': '指令罐',
        'Crescent Berserker': '新月狂战士',
        'Crystal Dragon': '水晶龙',
        'Dead Stars': '星头三兄弟',
        'Death Claw': '死亡爪',
        'Dehumidifier': '除湿之火',
        'Demon Tablet': '恶魔板',
        'Draconic Double': '水晶龙的幻影',
        'Execrator': '执行者',
        'Frozen Phobos': '冰冻的福博斯',
        'Gaseous Nereid': '燃烧的涅瑞伊得',
        'Gaseous Phobos': '燃烧的福博斯',
        'Giant Bird': '巨大鸟',
        'Gilded Headstone': '金色石碑',
        'Guardian Berserker': '狂战士守卫',
        'Guardian Knight': '骑士守卫',
        'Guardian Weapon': '兵装守卫',
        'Guardian Wraith': '幽灵守卫',
        'Hinkypunk': '鬼火苗',
        'Holy Sphere': '光球',
        'Ice Golem': '寒冰巨像',
        'Icewind': '冰风',
        'Jesting Jackanapes': '小妖魔',
        'Lifereaper': '生命收割者',
        'Lion Rampant': '跃立狮',
        'Liquified Triton': '融化的特里同',
        'Luminous Lance': '光枪',
        'Magitaur': '魔陶洛斯',
        'Nammu': '纳木',
        'Marble Dragon': '大理石龙',
        'Master Lockward': '首领看锁人',
        'Megaloknight': '巨型骑士',
        'Mysterious Mindflayer': '夺心魔',
        'Mythic Idol': '神秘土偶',
        'Mythic Mirror': '神秘土偶的幻影',
        'Neo Garula': '进化加鲁拉',
        'Nereid': '涅瑞伊得',
        'Nymian Petalodus': '尼姆瓣齿鲨',
        'Observer': '岛屿监视者',
        'Occult Knight': '新月骑士',
        'Ochre Stone': '巨岩',
        'Petalodus Progeny': '子代瓣齿鲨',
        'Phantom Claw': '死亡爪的幻影',
        '(?<! )Phobos': '福博斯',
        'Repaired Lion': '复原狮像',
        'Ropross': '罗普罗斯',
        'Sage\'s Staff': '贤者之杖',
        'Sisyphus': '西西弗斯',
        'Tentacle': '触手',
        'Tower Abyss': '两歧塔深渊',
        'Tower Bhoot': '两歧塔浮灵',
        'Tower Idol': '两歧塔石偶',
        'Tower Manticore': '两歧塔曼提克',
        'Tower Progenitor': '两歧塔爆弹之父',
        'Tower Progenitrix': '两歧塔爆弹之母',
        'Trade Tortoise': '金钱龟',
        'Trap': '陷阱',
        '(?<! )Triton': '特里同',
        'Vassal Vessel': '下属人偶',
      },
      'replaceText': {
        '--adds--': '--小怪--',
        '--adds-targetable--': '--小怪可选中--',
        '--Big Rune Marker': '--大圈点名',
        '--Bomb Mirror--': '--爆弹怪幻影--',
        '--Bosses untargetable--': '--BOSS 不可选中--',
        '--Burns': '--雷区',
        '--Dead Stars targetable--': '--星头三兄弟可选中--',
        '--Demon Mirror--': '--64页幻影--',
        '--dive spot--': '--俯冲--',
        '--Fireballs targetable--': '--火球可选中--',
        '--forced move--': '--强制移动--',
        '--golems ': '--巨像',
        '--holy spheres': '--光球',
        '--ice golems--': '--寒冰巨像--',
        '--ice sprites--': '--冰元精--',
        '--Icicle Puddles--': '--水圈--',
        '--knockback': '--击退',
        '--Mythic Mirror': '--神秘幻影',
        '--Nereid targetable--': '--涅瑞伊得可选中--',
        '--Nereid untargetable--': '--涅瑞伊得不可选中--',
        '--Phobos targetable--': '--福博斯可选中--',
        '--Phobos untargetable--': '--福博斯得不可选中--',
        '--reseal': '--重封印',
        '--sand spheres': '--土球',
        '--Small Rune Markers': '--小圈点名',
        '--Snowballs targetable--': '--雪球可选中--',
        '--Snowballs untargetable--': '--雪球不可选中--',
        '--Swords Mirror--': '--飞剑幻影--',
        '--tentacles': '--触手',
        '--towers': '--塔',
        '--Triton targetable--': '--特里同可选中--',
        '--Triton untargetable--': '--特里同不可选中--',
        '--twisters end--': '--龙卷结束--',
        '--twisters start--': '--龙卷开始--',
        '--wind spheres': '--风球',
        '\\(across land\\)': '(横穿场地)',
        '\\(Big\\)': '(大)',
        '\\(Blowout\\)': '(轰飞)',
        '\\(Blue\\)': '(蓝)',
        '\\(Cards': '(正点',
        '\\(cast\\)': '(读条)',
        '\\(castbar\\)': '(读条)',
        '\\(circle(s)?': '(圆圈',
        '\\(Clear\\)': '(清场)',
        'cross(es)?\\)': '十字)',
        'cross(es)?\\?\\)': '十字?)',
        '\\(Crystal\\)': '(有光元精)',
        '\\(Final\\)': '(最终)',
        '\\(Green\\)': '(绿)',
        '\\(H Pattern\\)': '(H 型)',
        '\\(in\\)': '(内)',
        'Intercards\\)': '斜点)',
        'Intercards\\?\\)': '斜点?)',
        '\\(jump\\)': '(跳)',
        '\\(knockback\\)': '(击退)',
        '\\(Lightning\\)': '(雷)',
        '\\(marker\\)': '(点名)',
        '\\(Move\\)': '(动)',
        '\\(No Crystal\\)': '(无光元精)',
        '\\(out\\)': '(外)',
        '\\(Red\\)': '(红)',
        '\\(resurface\\)': '(上浮)',
        '\\(Section': '(区域',
        '\\(Shades\' Crossing\\)': '(暗影交错)',
        '\\(Shades\' Nest\\)': '(暗影环)',
        '\\(side': '(侧',
        '\\(Small\\)': '(小)',
        '\\(spreads\\)': '(分散)',
        '\\(Stop\\)': '(停)',
        '\\(submerge\\)': '(下潜)',
        '\\(tankbusters\\)': '(死刑)',
        '\\(towers': '(塔',
        '\\(Wind\\)': '(风)',
        'Aetherial Exchange': '以太交换',
        'Aetherial Ray': '以太射线',
        'Aetheric Burst': '以太爆发',
        'Agitated Groan': '盛怒咆哮',
        'Ancient Aero III': '古代暴风',
        'Arcane Blast': '魔力冲击',
        'Ancient Holy': '古代神圣',
        'Ancient Stone III': '古代垒石',
        'Arcane Design': '魔连弹',
        'Arcane Light': '魔闪光',
        'Arcane Orb Spiral': '魔光弹',
        'Arcane Spear': '魔枪',
        'Assail': '攻击指示',
        'Assassin\'s Dagger': '暗杀短剑',
        'Augmentation of Beacons': '召唤魔炮',
        'Augmentation of Roundels': '召唤光球',
        'Augmentation of Stones': '召唤岩石',
        'Aura Burst': '灵气爆',
        'Avalaunch': '冲天大雪球',
        'Axeglow': '斧灵气',
        'Ball of Ice': '冻结',
        'Barefisted Death': '一拳毙命',
        'Bedrock Uplift': '地面隆起',
        'Big Burst': '大爆炸',
        'Big Ruinous Rune': '破灭符文 (大)',
        'Birdserk Rush': '突进掀地',
        'Blast Knuckles': '冲击拳',
        'Blazing Belligerent': '过热火球',
        'Blazing Flare': '炽热核爆',
        'Blizzard Trap': '冰结陷阱',
        'Blowout': '轰飞',
        'Boil Over': '发怒',
        'Bombshell Drop': '爆爆爆弹',
        'Bright Pulse': '闪光',
        'Cage of Fire': '牢笼炮',
        'Carving Rune': '符文镌刻',
        'Channeled Rage': '燥怒',
        'Chilling Collision': '凝冰冲击',
        'Choco Aero II': '陆行鸟烈风',
        'Choco Beak': '陆行鸟攻击',
        'Choco Blades': '陆行鸟风刃',
        'Choco Cyclone': '陆行鸟旋风',
        'Choco Doublades': '双重陆行鸟风刃',
        'Choco Maelfeather': '尾羽',
        'Choco Slaughter': '陆行鸟杀戮',
        'Choco Windstorm': '陆行鸟风暴',
        'Clawing Shadow': '雾霾爪',
        'Clawmarks': '抓痕',
        'Close Call to Detonate': '爆炸声明：近',
        'Collateral Balls': '飞来X弹',
        'Collateral Damage': '飞来横祸',
        'Collateral Jets': '飞来X波',
        'Cometeor of Dangers Near': '压溃式恶魔微型陨石',
        'Cometeor of Expulsion Afar': '排斥式恶魔微型陨石',
        'Cost of Living': '古币爆风',
        'Critical Axeblow': '致命斧',
        'Critical Lanceblow': '致命枪',
        'Crystal Call': '生成晶石',
        'Crystal Mirror': '转移晶石',
        'Crystallized Chaos': '水晶乱流',
        'Crystallized Energy': '水晶波动',
        '(?<! )Dark II': '昏暗',
        'Death Ray': '死亡射线',
        'Decisive Battle': '决战',
        'Decompress': '压缩爆炸',
        'Deep Freeze': '冻结',
        'Delta Attack': '三角攻击',
        'Demonic Dark II': '恶魔昏暗',
        'Demonograph of Dangers Near': '压溃式恶魔录',
        'Demonograph of Expulsion Afar': '排斥式恶魔录',
        'Demonography': '恶魔录',
        '(?<!-)Destruct': '自爆指令',
        'Dirty Nails': '腐坏爪',
        '(?<! )Dive(?! )': '跳入',
        'Double Cast': '双重咏唱',
        'Dread Deluge': '恐慌泛滥',
        'Dread Dive': '落喙俯冲',
        'Draconiform Motion': '龙态行动',
        'Dualfist Flurry': '重拳崩',
        'Earthquake': '地震',
        'Elemental Impact': '轰击',
        'End of History': '魔启示',
        'Epicenter Shock': '圆状放雷',
        'Erase Gravity': '微重力',
        'Excruciating Equilibrium': '要死一起死',
        'Exodus': '众生离绝',
        'Explosion': '爆炸',
        'Falling Rock': '落石',
        'Far Cry to Detonate': '爆炸声明：远',
        'Fearsome Facet': '幻影晶石',
        'Fearsome Glint': '裂魄惊芒爪',
        'Flame Thrower': '火炎放射',
        'Flatten': '跺脚',
        'Flock of Souls': '附魂',
        'Fire Spread': '喷火',
        'Fire Trap': '火炎陷阱',
        'Firestrike': '重火炮',
        'Forked Fury': '两歧之怒',
        'Fourpenny Inflation': '四币咒爆风',
        'Frigid Dive': '寒霜俯冲',
        'Frigid Twister': '寒冰龙卷',
        'Frozen Fallout': '毒液块飞跃',
        'Frozen Heart': '霜冻之心',
        'Fusion Burst': '融合爆炸',
        'Geothermal Rupture': '地热爆破',
        'Gigaflare': '十亿核爆',
        'Gravity of Dangers Near': '压溃式微重力',
        'Gravity of Expulsion Afar': '排斥式微重力',
        'Great Ball of Fire': '火球',
        'Heated Outburst': '气焰',
        'Heave': '掀地',
        'Heightened Rage': '狂怒',
        'Hoard Wealth': '价格暴跌的波动',
        '(?<!t )Holy(?! )': '神圣',
        'Holy Blaze': '圣焰',
        'Holy IV': '极圣',
        'Holy Lance': '圣枪',
        'Hopping Mad': '震击怒涛',
        'Horizontal Crosshatch': '横向双重抓',
        'Hydrocleave': '深水切割者',
        'Icebound Buffoon': '过冷雪球',
        'Ill-gotten Goods': '咒物赊卖',
        'Imitation Blizzard': '仿效冰结',
        'Imitation Icicle': '仿效冰柱',
        'Imitation Rain': '仿效雨',
        'Imitation Star': '仿效星',
        'Karmic Drain': '生命侵蚀',
        'Knuckle Crusher': '碎地拳',
        'Knuckle Down': '重拳冲击',
        'Lacunate Stream': '魔录奔流',
        'Lamplight': '幽魂光',
        '(?<! )Lance(?<! )': '光枪',
        'Landing': '落地',
        'Lethal Nails': '死亡甲',
        'Lifeless Legacy': '无命遗产',
        'Light Surge': '光爆',
        'Lightning Charge': '过雷流',
        'Lightning Crossing': '扇状放雷',
        'Line of Fire': '直线炮',
        'Lots Cast': '魔爆炸',
        'Made Magic': '释放魔力',
        'Mammoth Bolt': '大落雷',
        'Mana Expulsion': '魔力冲动',
        'Manifold Marks': '多重抓痕',
        'Marine Mayhem': '海之骚动',
        'Material World': '咒物起效',
        'Mind Blast': '精神冲击',
        'Moatmaker': '重拳波',
        'Molt': '附身',
        'Mystic Heat': '魔射线',
        'Noisome Nuisance': '过激毒球',
        'Noxious Nova': '毒素爆散',
        'Occult Chisel': '魔录凿刻',
        'Onepenny Inflation': '一币咒爆风',
        'Open Water': '开放水域',
        'Pelagic Cleaver': '深海切割者',
        'Portentous Comet(?!eor)': '恶魔彗星',
        'Portentous Cometeor': '恶魔微型陨石',
        'Primal Roar': '大咆哮',
        'Primordial Chaos': '毒液乐园',
        'Prismatic Wing': '水晶之翼',
        'Punishing Pounce': '怒骂猛扑',
        'Radiant Wave': '光明噪声',
        'Raking Scratch': '尖甲疾袭',
        'Ray of Dangers Near': '压溃式暗黑射线',
        'Ray of Expulsion Afar': '排斥式暗黑射线',
        'Ray of Ignorance': '暗黑射线',
        'Recharge': '魔力供给',
        'Recommended for You': '商品指定',
        'Recuperation': '痊愈宣告',
        'Restore Gravity': '重力重置',
        'Return(?!s)': '返回',
        'Returns': '回返',
        'Rockslide': '岩石崩溃',
        'Rotate Right': '右转向',
        'Rotate Left': '左转向',
        'Rotation': '转向',
        'Ruby Blaze': '炽热诅咒',
        '(?<! )Ruinous Rune': '破灭符文',
        '(?<! )Rumble': '跺地',
        'Rune Axe': '符文之斧',
        '(?<! |C)Rush(?!ing|er)': '突进',
        'Rushing Rumble(?! )': '突进跺地',
        'Rushing Rumble Rampage': '连续突进跺地',
        'Sage\'s Staff': '贤者之杖',
        'Sand Surge': '土爆',
        'Scathing Sweep': '横砍',
        '(?<! )Scratch': '抓击',
        'Seal Asunder': '封印破坏',
        'Self-destruct': '自爆',
        'Shades\' Crossing': '暗影交错',
        'Shades\' Nest': '暗影环',
        'Shifting Shape': '开腹',
        'Shockwave': '冲击波',
        'Six-Handed Fistfight': '窝里斗',
        'Slice \'n\' Dice': '斩切',
        'Slice \'n\' Strike': '斩切再开炮',
        'Skulking Orders': '处刑令',
        'Small Ruinous Rune': '破灭符文 (小)',
        'Snow Boulder': '大雪球',
        'Snowball Flight': '雪球狂奔',
        'Spinning Siege': '回旋炮',
        'Spirit Sling': '魔力炮',
        'Squash': '踩扁',
        'Steelstrike': '飞剑强袭',
        'Stone Swell': '岩石隆起',
        'Sunderseal Roar': '破封的咆哮',
        'Summon': '召唤',
        'Surprise Attack': '暗袭',
        'Tell': '显现',
        'The Grip of Poison': '邪气的共振',
        'Three-Body Probl─': '三体问题？',
        'Three-Body Problem': '三体问题',
        'Threefold Marks': '三重抓痕',
        'Tidal Breath': '怒潮吐息',
        'Tidal Guillotine': '怒潮断头台',
        'To the Winds': '爆炸四散',
        'Twopenny Inflation': '二币咒爆风',
        'Unseal(?!ed)': '封印解除',
        'Unsealed Aura': '灵气释放',
        'Vertical Crosshatch': '纵向双重抓',
        'Vengeful Bio III': '复仇剧毒菌',
        'Vengeful Blizzard III': '复仇冰封',
        'Vengeful Fire III': '复仇爆炎',
        'Void Death IV': '虚空极死',
        'Void Thunder III': '虚空暴雷',
        'Wallop': '敲击',
        'Waterspout': '海龙卷',
        'What\'re You Buying\\?': '强买强卖',
        'Wind Surge': '风爆',
        'Withering Eternity': '无终的枯朽',
        'White-hot Rage': '气焰怒涛',
        'Wild Charge': '狂野冲锋',
        'Wicked Water': '诅咒之水',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Advanced Aevis': '', // FIXME '高等魔鸟'
        // 'Assassin\'s Dagger': '', // FIXME '暗杀短剑'
        'Ball of Fire': '火球',
        'Black Chocobo': '黑陸行鳥',
        // 'Black Star': '', // FIXME '黑色天星'
        // 'Chatterbird': '', // FIXME '叽喳鸟'
        // 'Clawmarks': '', // FIXME '抓痕'
        // 'Cloister Demon': '', // FIXME '回廊恶魔'
        // 'Command Urn': '', // FIXME '指令罐'
        // 'Crescent Berserker': '', // FIXME '新月狂战士'
        // 'Crystal Dragon': '', // FIXME '水晶龙'
        // 'Dead Stars': '', // FIXME '星头三兄弟'
        // 'Death Claw': '', // FIXME '死亡爪'
        // 'Dehumidifier': '', // FIXME '除湿之火'
        // 'Demon Tablet': '', // FIXME '恶魔板'
        // 'Draconic Double': '', // FIXME '水晶龙的幻影'
        // 'Execrator': '', // FIXME '执行者'
        // 'Frozen Phobos': '', // FIXME '冰冻的福博斯'
        // 'Gaseous Nereid': '', // FIXME '燃烧的涅瑞伊得'
        // 'Gaseous Phobos': '', // FIXME '燃烧的福博斯'
        // 'Giant Bird': '', // FIXME '巨大鸟'
        // 'Gilded Headstone': '', // FIXME '金色石碑'
        // 'Guardian Berserker': '', // FIXME '狂战士守卫'
        // 'Guardian Knight': '', // FIXME '骑士守卫'
        // 'Guardian Weapon': '', // FIXME '兵装守卫'
        // 'Guardian Wraith': '', // FIXME '幽灵守卫'
        // 'Hinkypunk': '', // FIXME '鬼火苗'
        // 'Holy Sphere': '', // FIXME '光球'
        // 'Ice Golem': '', // FIXME '寒冰巨像'
        // 'Icewind': '', // FIXME '冰风'
        // 'Jesting Jackanapes': '', // FIXME '小妖魔'
        // 'Lifereaper': '', // FIXME '生命收割者'
        // 'Lion Rampant': '', // FIXME '跃立狮'
        // 'Liquified Triton': '', // FIXME '融化的特里同'
        // 'Luminous Lance': '', // FIXME '光枪'
        // 'Magitaur': '', // FIXME '魔陶洛斯'
        // 'Nammu': '', // FIXME '纳木'
        // 'Marble Dragon': '', // FIXME '大理石龙'
        // 'Master Lockward': '', // FIXME '首领看锁人'
        // 'Megaloknight': '', // FIXME '巨型骑士'
        // 'Mysterious Mindflayer': '', // FIXME '夺心魔'
        // 'Mythic Idol': '', // FIXME '神秘土偶'
        // 'Mythic Mirror': '', // FIXME '神秘土偶的幻影'
        // 'Neo Garula': '', // FIXME '进化加鲁拉'
        // 'Nereid': '', // FIXME '涅瑞伊得'
        // 'Nymian Petalodus': '', // FIXME '尼姆瓣齿鲨'
        // 'Observer': '', // FIXME '岛屿监视者'
        // 'Occult Knight': '', // FIXME '新月骑士'
        // 'Ochre Stone': '', // FIXME '巨岩'
        // 'Petalodus Progeny': '', // FIXME '子代瓣齿鲨'
        // 'Phantom Claw': '', // FIXME '死亡爪的幻影'
        // '(?<! )Phobos': '', // FIXME '福博斯'
        // 'Repaired Lion': '', // FIXME '复原狮像'
        // 'Ropross': '', // FIXME '罗普罗斯'
        // 'Sage\'s Staff': '', // FIXME '贤者之杖'
        'Sisyphus': '西西弗斯',
        'Tentacle': '觸手',
        // 'Tower Abyss': '', // FIXME '两歧塔深渊'
        // 'Tower Bhoot': '', // FIXME '两歧塔浮灵'
        // 'Tower Idol': '', // FIXME '两歧塔石偶'
        // 'Tower Manticore': '', // FIXME '两歧塔曼提克'
        // 'Tower Progenitor': '', // FIXME '两歧塔爆弹之父'
        // 'Tower Progenitrix': '', // FIXME '两歧塔爆弹之母'
        // 'Trade Tortoise': '', // FIXME '金钱龟'
        'Trap': '陷阱',
        // '(?<! )Triton': '', // FIXME '特里同'
        // 'Vassal Vessel': '', // FIXME '下属人偶'
      },
      'replaceText': {
        // '--adds--': '', // FIXME '--小怪--'
        // '--adds-targetable--': '', // FIXME '--小怪可选中--'
        // '--Big Rune Marker': '', // FIXME '--大圈点名'
        // '--Bomb Mirror--': '', // FIXME '--爆弹怪幻影--'
        // '--Bosses untargetable--': '', // FIXME '--BOSS 不可选中--'
        // '--Burns': '', // FIXME '--雷区'
        // '--Dead Stars targetable--': '', // FIXME '--星头三兄弟可选中--'
        // '--Demon Mirror--': '', // FIXME '--64页幻影--'
        // '--dive spot--': '', // FIXME '--俯冲--'
        // '--Fireballs targetable--': '', // FIXME '--火球可选中--'
        // '--forced move--': '', // FIXME '--强制移动--'
        // '--golems ': '', // FIXME '--巨像'
        // '--holy spheres': '', // FIXME '--光球'
        // '--ice golems--': '', // FIXME '--寒冰巨像--'
        // '--ice sprites--': '', // FIXME '--冰元精--'
        // '--Icicle Puddles--': '', // FIXME '--水圈--'
        // '--knockback': '', // FIXME '--击退'
        // '--Mythic Mirror': '', // FIXME '--神秘幻影'
        // '--Nereid targetable--': '', // FIXME '--涅瑞伊得可选中--'
        // '--Nereid untargetable--': '', // FIXME '--涅瑞伊得不可选中--'
        // '--Phobos targetable--': '', // FIXME '--福博斯可选中--'
        // '--Phobos untargetable--': '', // FIXME '--福博斯得不可选中--'
        // '--reseal': '', // FIXME '--重封印'
        // '--sand spheres': '', // FIXME '--土球'
        // '--Small Rune Markers': '', // FIXME '--小圈点名'
        // '--Snowballs targetable--': '', // FIXME '--雪球可选中--'
        // '--Snowballs untargetable--': '', // FIXME '--雪球不可选中--'
        // '--Swords Mirror--': '', // FIXME '--飞剑幻影--'
        // '--tentacles': '', // FIXME '--触手'
        // '--towers': '', // FIXME '--塔'
        // '--Triton targetable--': '', // FIXME '--特里同可选中--'
        // '--Triton untargetable--': '', // FIXME '--特里同不可选中--'
        // '--twisters end--': '', // FIXME '--龙卷结束--'
        // '--twisters start--': '', // FIXME '--龙卷开始--'
        // '--wind spheres': '', // FIXME '--风球'
        // '\\(across land\\)': '', // FIXME '(横穿场地)'
        // '\\(Big\\)': '', // FIXME '(大)'
        // '\\(Blowout\\)': '', // FIXME '(轰飞)'
        // '\\(Blue\\)': '', // FIXME '(蓝)'
        // '\\(Cards': '', // FIXME '(正点'
        // '\\(cast\\)': '', // FIXME '(读条)'
        // '\\(castbar\\)': '', // FIXME '(读条)'
        // '\\(circle(s)?': '', // FIXME '(圆圈'
        // '\\(Clear\\)': '', // FIXME '(清场)'
        // 'cross(es)?\\)': '', // FIXME '十字)'
        // 'cross(es)?\\?\\)': '', // FIXME '十字?)'
        // '\\(Crystal\\)': '', // FIXME '(有光元精)'
        // '\\(Final\\)': '', // FIXME '(最终)'
        // '\\(Green\\)': '', // FIXME '(绿)'
        // '\\(H Pattern\\)': '', // FIXME '(H 型)'
        // '\\(in\\)': '', // FIXME '(内)'
        // 'Intercards\\)': '', // FIXME '斜点)'
        // 'Intercards\\?\\)': '', // FIXME '斜点?)'
        // '\\(jump\\)': '', // FIXME '(跳)'
        // '\\(knockback\\)': '', // FIXME '(击退)'
        // '\\(Lightning\\)': '', // FIXME '(雷)'
        // '\\(marker\\)': '', // FIXME '(点名)'
        // '\\(Move\\)': '', // FIXME '(动)'
        // '\\(No Crystal\\)': '', // FIXME '(无光元精)'
        // '\\(out\\)': '', // FIXME '(外)'
        // '\\(Red\\)': '', // FIXME '(红)'
        // '\\(resurface\\)': '', // FIXME '(上浮)'
        // '\\(Section': '', // FIXME '(区域'
        // '\\(Shades\' Crossing\\)': '', // FIXME '(暗影交错)'
        // '\\(Shades\' Nest\\)': '', // FIXME '(暗影环)'
        // '\\(side': '', // FIXME '(侧'
        // '\\(Small\\)': '', // FIXME '(小)'
        // '\\(spreads\\)': '', // FIXME '(分散)'
        // '\\(Stop\\)': '', // FIXME '(停)'
        // '\\(submerge\\)': '', // FIXME '(下潜)'
        // '\\(tankbusters\\)': '', // FIXME '(死刑)'
        // '\\(towers': '', // FIXME '(塔'
        // '\\(Wind\\)': '', // FIXME '(风)'
        'Aetherial Exchange': '乙太交換',
        'Aetherial Ray': '乙太射線',
        'Aetheric Burst': '乙太爆發',
        // 'Agitated Groan': '', // FIXME '盛怒咆哮'
        'Ancient Aero III': '古代大勁風',
        // 'Arcane Blast': '', // FIXME '魔力冲击'
        'Ancient Holy': '古代神聖',
        // 'Ancient Stone III': '', // FIXME '古代垒石'
        // 'Arcane Design': '', // FIXME '魔连弹'
        // 'Arcane Light': '', // FIXME '魔闪光'
        // 'Arcane Orb Spiral': '', // FIXME '魔光弹'
        // 'Arcane Spear': '', // FIXME '魔枪'
        'Assail': '攻擊指示',
        // 'Assassin\'s Dagger': '', // FIXME '暗杀短剑'
        // 'Augmentation of Beacons': '', // FIXME '召唤魔炮'
        // 'Augmentation of Roundels': '', // FIXME '召唤光球'
        // 'Augmentation of Stones': '', // FIXME '召唤岩石'
        'Aura Burst': '鬥氣爆裂',
        // 'Avalaunch': '', // FIXME '冲天大雪球'
        // 'Axeglow': '', // FIXME '斧灵气'
        'Ball of Ice': '凍結',
        // 'Barefisted Death': '', // FIXME '一拳毙命'
        'Bedrock Uplift': '地面隆起',
        'Big Burst': '大爆炸',
        // 'Big Ruinous Rune': '', // FIXME '破灭符文 (大)'
        // 'Birdserk Rush': '', // FIXME '突进掀地'
        // 'Blast Knuckles': '', // FIXME '冲击拳'
        // 'Blazing Belligerent': '', // FIXME '过热火球'
        // 'Blazing Flare': '', // FIXME '炽热核爆'
        // 'Blizzard Trap': '', // FIXME '冰结陷阱'
        // 'Blowout': '', // FIXME '轰飞'
        // 'Boil Over': '', // FIXME '发怒'
        'Bombshell Drop': '爆爆爆彈',
        'Bright Pulse': '閃光',
        // 'Cage of Fire': '', // FIXME '牢笼炮'
        // 'Carving Rune': '', // FIXME '符文镌刻'
        // 'Channeled Rage': '', // FIXME '燥怒'
        // 'Chilling Collision': '', // FIXME '凝冰冲击'
        // 'Choco Aero II': '', // FIXME '陆行鸟烈风'
        'Choco Beak': '陸行鳥攻擊',
        // 'Choco Blades': '', // FIXME '陆行鸟风刃'
        // 'Choco Cyclone': '', // FIXME '陆行鸟旋风'
        // 'Choco Doublades': '', // FIXME '双重陆行鸟风刃'
        // 'Choco Maelfeather': '', // FIXME '尾羽'
        // 'Choco Slaughter': '', // FIXME '陆行鸟杀戮'
        // 'Choco Windstorm': '', // FIXME '陆行鸟风暴'
        // 'Clawing Shadow': '', // FIXME '雾霾爪'
        // 'Clawmarks': '', // FIXME '抓痕'
        // 'Close Call to Detonate': '', // FIXME '爆炸声明：近'
        // 'Collateral Balls': '', // FIXME '飞来X弹'
        // 'Collateral Damage': '', // FIXME '飞来横祸'
        // 'Collateral Jets': '', // FIXME '飞来X波'
        // 'Cometeor of Dangers Near': '', // FIXME '压溃式恶魔微型陨石'
        // 'Cometeor of Expulsion Afar': '', // FIXME '排斥式恶魔微型陨石'
        // 'Cost of Living': '', // FIXME '古币爆风'
        // 'Critical Axeblow': '', // FIXME '致命斧'
        // 'Critical Lanceblow': '', // FIXME '致命枪'
        // 'Crystal Call': '', // FIXME '生成晶石'
        // 'Crystal Mirror': '', // FIXME '转移晶石'
        // 'Crystallized Chaos': '', // FIXME '水晶乱流'
        // 'Crystallized Energy': '', // FIXME '水晶波动'
        '(?<! )Dark II': '昏暗',
        'Death Ray': '死亡射線',
        // 'Decisive Battle': '', // FIXME '决战'
        // 'Decompress': '', // FIXME '压缩爆炸'
        'Deep Freeze': '凍結',
        'Delta Attack': '三角攻擊',
        // 'Demonic Dark II': '', // FIXME '恶魔昏暗'
        // 'Demonograph of Dangers Near': '', // FIXME '压溃式恶魔录'
        // 'Demonograph of Expulsion Afar': '', // FIXME '排斥式恶魔录'
        // 'Demonography': '', // FIXME '恶魔录'
        // '(?<!-)Destruct': '', // FIXME '自爆指令'
        // 'Dirty Nails': '', // FIXME '腐坏爪'
        // '(?<! )Dive(?! )': '', // FIXME '跳入'
        'Double Cast': '雙重詠唱',
        // 'Dread Deluge': '', // FIXME '恐慌泛滥'
        'Dread Dive': '落喙俯衝',
        // 'Draconiform Motion': '', // FIXME '龙态行动'
        // 'Dualfist Flurry': '', // FIXME '重拳崩'
        'Earthquake': '地震',
        'Elemental Impact': '轟擊',
        // 'End of History': '', // FIXME '魔启示'
        // 'Epicenter Shock': '', // FIXME '圆状放雷'
        // 'Erase Gravity': '', // FIXME '微重力'
        // 'Excruciating Equilibrium': '', // FIXME '要死一起死'
        'Exodus': '眾生離絕',
        'Explosion': '爆炸',
        'Falling Rock': '落石',
        // 'Far Cry to Detonate': '', // FIXME '爆炸声明：远'
        // 'Fearsome Facet': '', // FIXME '幻影晶石'
        // 'Fearsome Glint': '', // FIXME '裂魄惊芒爪'
        'Flame Thrower': '火炎放射',
        'Flatten': '壓潰',
        // 'Flock of Souls': '', // FIXME '附魂'
        'Fire Spread': '噴火',
        // 'Fire Trap': '', // FIXME '火炎陷阱'
        // 'Firestrike': '', // FIXME '重火炮'
        // 'Forked Fury': '', // FIXME '两歧之怒'
        // 'Fourpenny Inflation': '', // FIXME '四币咒爆风'
        'Frigid Dive': '寒霜俯衝',
        // 'Frigid Twister': '', // FIXME '寒冰龙卷'
        // 'Frozen Fallout': '', // FIXME '毒液块飞跃'
        // 'Frozen Heart': '', // FIXME '霜冻之心'
        'Fusion Burst': '融合爆炸',
        // 'Geothermal Rupture': '', // FIXME '地热爆破'
        'Gigaflare': '十億火光',
        // 'Gravity of Dangers Near': '', // FIXME '压溃式微重力'
        // 'Gravity of Expulsion Afar': '', // FIXME '排斥式微重力'
        'Great Ball of Fire': '火球',
        // 'Heated Outburst': '', // FIXME '气焰'
        'Heave': '掀地',
        // 'Heightened Rage': '', // FIXME '狂怒'
        // 'Hoard Wealth': '', // FIXME '价格暴跌的波动'
        '(?<!t )Holy(?! )': '神聖',
        // 'Holy Blaze': '', // FIXME '圣焰'
        'Holy IV': '極聖',
        // 'Holy Lance': '', // FIXME '圣枪'
        // 'Hopping Mad': '', // FIXME '震击怒涛'
        // 'Horizontal Crosshatch': '', // FIXME '横向双重抓'
        // 'Hydrocleave': '', // FIXME '深水切割者'
        // 'Icebound Buffoon': '', // FIXME '过冷雪球'
        // 'Ill-gotten Goods': '', // FIXME '咒物赊卖'
        // 'Imitation Blizzard': '', // FIXME '仿效冰结'
        // 'Imitation Icicle': '', // FIXME '仿效冰柱'
        // 'Imitation Rain': '', // FIXME '仿效雨'
        // 'Imitation Star': '', // FIXME '仿效星'
        // 'Karmic Drain': '', // FIXME '生命侵蚀'
        // 'Knuckle Crusher': '', // FIXME '碎地拳'
        // 'Knuckle Down': '', // FIXME '重拳冲击'
        // 'Lacunate Stream': '', // FIXME '魔录奔流'
        // 'Lamplight': '', // FIXME '幽魂光'
        // '(?<! )Lance(?<! )': '', // FIXME '光枪'
        'Landing': '落地',
        // 'Lethal Nails': '', // FIXME '死亡甲'
        // 'Lifeless Legacy': '', // FIXME '无命遗产'
        // 'Light Surge': '', // FIXME '光爆'
        // 'Lightning Charge': '', // FIXME '过雷流'
        // 'Lightning Crossing': '', // FIXME '扇状放雷'
        // 'Line of Fire': '', // FIXME '直线炮'
        'Lots Cast': '魔爆炸',
        'Made Magic': '釋放魔力',
        // 'Mammoth Bolt': '', // FIXME '大落雷'
        // 'Mana Expulsion': '', // FIXME '魔力冲动'
        // 'Manifold Marks': '', // FIXME '多重抓痕'
        'Marine Mayhem': '海之騷動',
        // 'Material World': '', // FIXME '咒物起效'
        'Mind Blast': '精神衝擊',
        // 'Moatmaker': '', // FIXME '重拳波'
        // 'Molt': '', // FIXME '附身'
        'Mystic Heat': '魔射線',
        // 'Noisome Nuisance': '', // FIXME '过激毒球'
        // 'Noxious Nova': '', // FIXME '毒素爆散'
        // 'Occult Chisel': '', // FIXME '魔录凿刻'
        // 'Onepenny Inflation': '', // FIXME '一币咒爆风'
        // 'Open Water': '', // FIXME '开放水域'
        'Pelagic Cleaver': '深海切割者',
        // 'Portentous Comet(?!eor)': '', // FIXME '恶魔彗星'
        // 'Portentous Cometeor': '', // FIXME '恶魔微型陨石'
        'Primal Roar': '大咆哮',
        // 'Primordial Chaos': '', // FIXME '毒液乐园'
        // 'Prismatic Wing': '', // FIXME '水晶之翼'
        // 'Punishing Pounce': '', // FIXME '怒骂猛扑'
        // 'Radiant Wave': '', // FIXME '光明噪声'
        // 'Raking Scratch': '', // FIXME '尖甲疾袭'
        // 'Ray of Dangers Near': '', // FIXME '压溃式暗黑射线'
        // 'Ray of Expulsion Afar': '', // FIXME '排斥式暗黑射线'
        // 'Ray of Ignorance': '', // FIXME '暗黑射线'
        'Recharge': '魔力供給',
        // 'Recommended for You': '', // FIXME '商品指定'
        // 'Recuperation': '', // FIXME '痊愈宣告'
        // 'Restore Gravity': '', // FIXME '重力重置'
        'Return(?!s)': '返回',
        // 'Returns': '', // FIXME '回返'
        'Rockslide': '岩石崩潰',
        // 'Rotate Right': '', // FIXME '右转向'
        // 'Rotate Left': '', // FIXME '左转向'
        // 'Rotation': '', // FIXME '转向'
        // 'Ruby Blaze': '', // FIXME '炽热诅咒'
        // '(?<! )Ruinous Rune': '', // FIXME '破灭符文'
        // '(?<! )Rumble': '', // FIXME '跺地'
        // 'Rune Axe': '', // FIXME '符文之斧'
        '(?<! |C)Rush(?!ing|er)': '突進',
        // 'Rushing Rumble(?! )': '', // FIXME '突进跺地'
        // 'Rushing Rumble Rampage': '', // FIXME '连续突进跺地'
        // 'Sage\'s Staff': '', // FIXME '贤者之杖'
        // 'Sand Surge': '', // FIXME '土爆'
        // 'Scathing Sweep': '', // FIXME '横砍'
        '(?<! )Scratch': '抓擊',
        // 'Seal Asunder': '', // FIXME '封印破坏'
        'Self-destruct': '自爆',
        // 'Shades\' Crossing': '', // FIXME '暗影交错'
        // 'Shades\' Nest': '', // FIXME '暗影环'
        // 'Shifting Shape': '', // FIXME '开腹'
        'Shockwave': '衝擊波',
        // 'Six-Handed Fistfight': '', // FIXME '窝里斗'
        // 'Slice \'n\' Dice': '', // FIXME '斩切'
        // 'Slice \'n\' Strike': '', // FIXME '斩切再开炮'
        // 'Skulking Orders': '', // FIXME '处刑令'
        // 'Small Ruinous Rune': '', // FIXME '破灭符文 (小)'
        'Snow Boulder': '大雪球',
        // 'Snowball Flight': '', // FIXME '雪球狂奔'
        // 'Spinning Siege': '', // FIXME '回旋炮'
        // 'Spirit Sling': '', // FIXME '魔力炮'
        // 'Squash': '', // FIXME '踩扁'
        'Steelstrike': '飛劍強襲',
        // 'Stone Swell': '', // FIXME '岩石隆起'
        // 'Sunderseal Roar': '', // FIXME '破封的咆哮'
        'Summon': '召喚',
        // 'Surprise Attack': '', // FIXME '暗袭'
        // 'Tell': '', // FIXME '显现'
        'The Grip of Poison': '邪氣的共振',
        // 'Three-Body Probl─': '', // FIXME '三体问题？'
        // 'Three-Body Problem': '', // FIXME '三体问题'
        // 'Threefold Marks': '', // FIXME '三重抓痕'
        'Tidal Breath': '怒潮吐息',
        'Tidal Guillotine': '怒潮斷頭臺',
        'To the Winds': '爆炸四散',
        // 'Twopenny Inflation': '', // FIXME '二币咒爆风'
        // 'Unseal(?!ed)': '', // FIXME '封印解除'
        // 'Unsealed Aura': '', // FIXME '灵气释放'
        // 'Vertical Crosshatch': '', // FIXME '纵向双重抓'
        // 'Vengeful Bio III': '', // FIXME '复仇剧毒菌'
        // 'Vengeful Blizzard III': '', // FIXME '复仇冰封'
        // 'Vengeful Fire III': '', // FIXME '复仇爆炎'
        'Void Death IV': '虛空極死',
        'Void Thunder III': '虛空大雷電',
        'Wallop': '打擊',
        'Waterspout': '海龍捲',
        // 'What\'re You Buying\\?': '', // FIXME '强买强卖'
        'Wind Surge': '風爆',
        // 'Withering Eternity': '', // FIXME '无终的枯朽'
        // 'White-hot Rage': '', // FIXME '气焰怒涛'
        'Wild Charge': '狂野蓄力',
        // 'Wicked Water': '', // FIXME '诅咒之水'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Advanced Aevis': '진화한 에이비스',
        'Assassin\'s Dagger': '암살자의 단검',
        'Ball of Fire': '화염 구체',
        'Black Chocobo': '검은 초코보',
        'Black Star': '검은 죽음의 운성',
        'Chatterbird': '재잘이',
        'Clawmarks': '손톱자국',
        'Cloister Demon': '회랑 악마',
        'Command Urn': '지휘관 항아리',
        'Crescent Berserker': '초승달 광전사',
        'Crystal Dragon': '수정룡',
        'Dead Stars': '별머리 삼인조',
        'Death Claw': '죽음손아귀',
        'Dehumidifier': '제습마',
        'Demon Tablet': '악마의 석판',
        'Draconic Double': '수정룡의 환영',
        'Execrator': '주술마녀',
        'Frozen Phobos': '얼어붙은 포보스',
        'Frozen Triton': '얼어붙은 트리톤',
        'Gaseous Nereid': '불타는 네레게이드',
        'Gaseous Phobos': '불타는 포보스',
        'Giant Bird': '거대 새',
        'Gilded Headstone': '금빛 묘비',
        'Guardian Berserker': '경비 광전사',
        'Guardian Knight': '경비 기사',
        'Guardian Weapon': '경비 무기마',
        'Guardian Wraith': '경비 망령',
        'Hinkypunk': '힝키펑크',
        'Holy Sphere': '빛구슬',
        'Ice Golem': '얼음 골렘',
        'Icewind': '얼음 바람',
        'Jesting Jackanapes': '가르키마세라',
        'Lifereaper': '생명 수확자',
        'Lion Rampant': '직립 사자',
        'Liquified Triton': '녹은 트리톤',
        'Luminous Lance': '빛나는 창',
        'Magitaur': '마기타우로스',
        'Marble Dragon': '대리석 드래곤',
        'Master Lockward': '대장 자물쇠지기',
        'Megaloknight': '거대 기사',
        'Mysterious Mindflayer': '정신탈취자',
        'Mythic Idol': '신비로운 우상',
        'Mythic Mirror': '신비로운 우상의 환영',
        'Nammu': '남무',
        'Neo Garula': '네오 가루라',
        'Nereid': '네레게이드',
        'Nymian Petalodus': '니므 페탈로두스',
        'Observer': '섬 감시자',
        'Occult Knight': '초승달 기사',
        'Ochre Stone': '거대한 암석',
        'Petalodus Progeny': '어린 니므 페탈로두스',
        'Phantom Claw': '죽음손아귀의 환영',
        '(?<! )Phobos': '포보스',
        'Repaired Lion': '복원된 사자',
        'Ropross': '로프로스',
        'Sage\'s Staff': '현자의 지팡이',
        'Sisyphus': '시시포스',
        'Tentacle': '문어발',
        'Tower Abyss': '타워 나락영혼',
        'Tower Bhoot': '타워 브후트',
        'Tower Idol': '타워 토우',
        'Tower Manticore': '타워 만티코어',
        'Tower Progenitor': '타워 아빠 봄',
        'Tower Progenitrix': '타워 엄마 봄',
        'Trade Tortoise': '동전거북',
        'Trap': '함정 기동',
        '(?<! )Triton': '트리톤',
        'Vassal Vessel': '병졸 인형',
      },
      'replaceText': {
        '--reseal\\?--': '--재봉인?--',
        '--adds-targetable--': '--쫄 타겟 가능--',
        '--forced move--': '--강제 이동--',
        '--wind spheres x(\\d)--': '--바람 구슬 x$1--',
        '--sand spheres x(\\d)--': '--땅 구슬 x$1--',
        '--holy spheres x(\\d)--': '--빛 구슬 x$1--',
        '--Bomb Mirror--': '--폭탄 환영--',
        '--Demon Mirror--': '--악마 환영--',
        '--Swords Mirror--': '--검 환영--',
        '--Mythic Mirror x2--': '--신비로운 우상의 환영 x2--',
        '--tentacles x6--': '--문어발 x6--',
        '--Tell (\\d)': '--예고 $1',
        '--knockback\\?--': '--넉백?--',
        '--Nereid untargetable--': '--네레게이드 타겟 불가--',
        '--Triton untargetable--': '--트리톤 타겟 불가--',
        '--Nereid targetable--': '--네레게이드 타겟 가능--',
        '--Triton targetable--': '--트리톤 타겟 가능--',
        '--Phobos untargetable--': '--포보스 타겟 불가--',
        '--Phobos targetable--': '--포보스 타겟 가능--',
        '--Snowballs untargetable--': '--눈덩이 타겟 불가--',
        '--Snowballs targetable--': '--눈덩이 타겟 가능--',
        '--Fireballs targetable--': '--불구슬 타겟 가능--',
        '--Bosses untargetable--': '--보스 타겟 불가--',
        '--Dead Stars targetable--': '--별머리 삼인조 타겟 가능--',
        '--Burns': '--화염',
        '--adds--': '--쫄--',
        '--Icicle Puddles--': '--고드름 장판--',
        '--twisters start--': '--회오리 출발--',
        '--twisters end--': '--회오리 도착--',
        '--ice golems--': '--얼음 골렘--',
        '--dive spot--': '--강하 위치 지정--',
        '--towers x(\\d)--': '--타워 x$1--',
        '--golems': '--골렘',
        '--ice sprites--': '--얼음 정령--',
        '--Big Rune Marker--': '--큰 룬 징--',
        '--Small Rune Markers x(\\d)--': '--작은 룬 징 x$1--',
        '\\(in\\)': '(안)',
        '\\(jump\\)': '(점프)',
        '\\(Lightning\\)': '(번개)',
        '\\(out\\)': '(밖)',
        '\\(Wind\\)': '(바람)',
        '\\(H Pattern\\)': '(H자형 패턴)',
        '\\(Red\\)': '(빨강)',
        '\\(Stop\\)': '(멈추기)',
        '\\(Blue\\)': '(파랑)',
        '\\(Move\\)': '(움직이기)',
        '\\(Green\\)': '(초록)',
        '\\(tankbusters\\)': '(탱버)',
        '\\(spreads\\)': '(산개)',
        '\\(Cards/Intercards\\?\\)': '(십자/대각선?)',
        '\\(Cards\\)': '(십자)',
        '\\(Intercards\\)': '(대각선)',
        '\\(cast\\)': '(시전)',
        '\\(No Crystal\\)': '(수정 없음)',
        '\\(Crystal\\)': '(수정)',
        '\\(Big\\)': '(큰)',
        '\\(Small\\)': '(작은)',
        '\\(resurface\\)': '(떠오름)',
        '\\(across land\\)': '(가로지름)',
        '\\(submerge\\)': '(잠수)',
        '\\(marker\\)': '(징)',
        '\\(knockback\\)': '(넉백)',
        '\\(Clear\\)': '(클리어)',
        '\\(side (\\d)\\)': '($1측)',
        '\\(Section (\\d)\\)': '($1구역)',
        '\\(Final\\)': '(마지막)',
        '\\(circles \\+ cross(?:\\?)?\\)': '(원 + 십자?)',
        '\\(circles?\\)': '(원)',
        '\\(castbar\\)': '(시전바)',
        '\\(circles/cross(?:es)?\\?\\)': '(원/십자?)',
        '\\(cross(?:es)?\\)': '(십자)',
        '\\(towers \\+ cross\\)': '(탑 + 십자)',
        '\\(towers\\)': '(탑)',
        'Aetherial Exchange': '에테르 변환',
        'Aetheric Burst': '에테르 분출',
        'Aetherial Ray': '에테르 광선',
        'Agitated Groan': '노여운 포효',
        'Ancient Aero III': '에인션트 에어로가',
        'Ancient Holy': '에인션트 홀리',
        'Ancient Stone III': '에인션트 스톤가',
        'Arcane Blast': '마법 폭발',
        'Arcane Design': '마연탄',
        'Arcane Light': '마섬광',
        'Arcane Spear': '마기 창',
        'Arcane Orb Spiral': '나선형 마광탄',
        'Assail': '공격 지시',
        'Assassin\'s Dagger': '암살자의 단검',
        'Augmentation of Beacons': '마법포 소환',
        'Augmentation of Roundels': '빛구슬 소환',
        'Augmentation of Stones': '암석 소환',
        'Aura Burst': '오라 폭발',
        'Avalaunch': '펄쩍펄쩍 눈덩이',
        'Axeglow': '도끼 오라',
        'Ball of Ice': '빙결',
        'Barefisted Death': '죽음의 주먹',
        'Bedrock Uplift': '지반 융기',
        'Big Burst': '대폭발',
        'Big Ruinous Rune': '큰 파멸의 룬',
        'Birdserk Rush': '돌진 흐느낌',
        'Blast Knuckles': '주먹 작렬',
        'Blazing Belligerent': '너무한 불덩이',
        'Blazing Flare': '플레어 작열',
        'Blizzard Trap': '블리자드 함정',
        'Blowout': '밀어내기',
        'Boil Over': '노발',
        'Bombshell Drop': '봄봄',
        'Bright Pulse': '섬광',
        'Cage of Fire': '감옥 기공포',
        'Carving Rune': '절단의 룬',
        'Channeled Rage': '진노',
        'Chilling Collision': '얼음 충격',
        'Choco Aero II': '초코 에어로라',
        'Choco Beak': '초코 공격',
        'Choco Blades': '초코 칼날',
        'Choco Cyclone': '초코 태풍',
        'Choco Doublades': '초코 연속 칼날',
        'Choco Maelfeather': '꼬리 깃털',
        'Choco Slaughter': '초코 살육',
        'Choco Windstorm': '초코 폭풍',
        'Clawing Shadow': '안개 발톱',
        'Clawmarks': '손톱자국',
        'Close Call to Detonate / Far Cry to Detonate': '폭발 선언: 근거리/원거리',
        'Collateral Balls': '후림불 화/빙/독탄',
        'Collateral Damage': '후림불',
        'Collateral Jets': '후림불 열/한/독파',
        'Cometeor of Dangers Near / Cometeor of Expulsion Afar': '압축식/배척식 악마의 코메테오',
        'Cost of Living': '동전 폭풍',
        'Critical Lanceblow': '창 치명타',
        'Critical Axeblow': '도끼 치명타',
        'Crystal Call': '수정석 생성',
        'Crystal Mirror': '수정석 이동',
        'Crystallized Energy': '수정 파동',
        '(?<! )Dark II': '다라',
        'Death Ray': '죽음의 광선',
        'Decisive Battle': '결전',
        'Decompress': '압축 폭발',
        'Deep Freeze': '빙결',
        'Delta Attack': '델타 공격',
        'Demonic Dark II': '악마의 다라',
        'Demonograph of Dangers Near / Demonograph of Expulsion Afar': '압축식/배척식 악마의 상형문자',
        'Demonography': '악마의 상형문자',
        '(?<!-)Destruct': '자폭 지시',
        'Dirty Nails': '더러운 발톱',
        '(?<![ -])Dive': '뛰어들기',
        'Double Cast': '이중 마술',
        'Draconiform Motion': '용의 몸짓',
        'Dread Deluge': '공포 엄습',
        'Dread Dive': '공포의 강하',
        'Dualfist Flurry': '주먹질 쇄도',
        'Earthquake': '지진',
        'Elemental Impact': '착탄',
        'End of History': '마기 대재앙',
        'Epicenter Shock': '원형 번갯불',
        'Erase Gravity': '미세 중력',
        'Excruciating Equilibrium': '고통 분담',
        'Explosion': '폭발',
        'Falling Rock': '낙석',
        'Fearsome Facet': '환영 수정석',
        'Fearsome Glint': '무시무시한 빛',
        'Fire Spread': '방화',
        'Fire Trap': '파이어 함정',
        'Firestrike': '중화포',
        'Flame Thrower': '화염방사',
        'Flatten': '짓이기기',
        'Flock of Souls': '영체 분열',
        'Forked Fury': '포크 분노',
        'Frigid Dive': '서리 강하',
        'Frigid Twister': '얼음 회오리',
        'Frozen Fallout': '독덩이 날리기',
        'Frozen Heart': '얼음 심장',
        'Fusion Burst': '융합 폭발',
        'Geothermal Rupture': '지열 폭발',
        'Gigaflare': '기가플레어',
        'Gravity of Dangers Near / Gravity of Expulsion Afar': '압축식/배척식 미세 중력',
        'Great Ball of Fire': '불덩이',
        'Heated Outburst': '기염',
        'Heave': '흐느낌',
        'Heightened Rage': '대진노',
        'Hoard Wealth': '가치 폭락 파동',
        '(?<! )Holy(?! )': '홀리',
        'Holy Blaze': '신성한 빛줄기',
        'Holy IV': '홀리쟈',
        'Holy Lance': '신성한 창',
        'Hopping Mad': '노도의 도끼질',
        'Hydrocleave': '물의 도끼날',
        'Icebound Buffoon': '너무한 눈덩이',
        'Ill-gotten Goods': '저주 물건 대여',
        'Imitation Blizzard': '모방된 블리자드',
        'Imitation Icicle': '모방된 고드름',
        'Imitation Rain': '모방된 비',
        'Imitation Star': '모방된 별',
        'Karmic Drain': '생명 부식',
        'Knuckle Crusher': '바닥 주먹질',
        'Knuckle Down': '주먹 충격파',
        'Lacunate Stream': '상형문자 급류',
        'Lamplight': '영체의 빛',
        'Lance (\\d+)': '창 $1',
        'Landing': '착륙',
        'Lethal Nails': '죽음의 손톱',
        'Line of Fire': '직선 기공포',
        'Lifeless Legacy': '죽음의 산물',
        'Light Surge': '빛의 폭발',
        'Lightning Charge': '과잉 뇌류',
        'Lightning Crossing': '부채꼴 번갯불',
        'Lots Cast': '마폭발',
        'Made Magic': '마력 방출',
        'Mammoth Bolt': '대낙뢰',
        'Mana Expulsion': '마나 파열',
        'Manifold Marks': '다중 손톱자국',
        'Marine Mayhem': '바다의 파괴력',
        'Material World': '저주 물건 발동',
        'Mind Blast': '정신파괴',
        'Moatmaker': '주먹질 파도',
        'Molt': '빙의',
        'Mystic Heat': '마열선',
        'Noisome Nuisance': '너무한 독덩이',
        'Noxious Nova': '독소 폭산',
        'Occult Chisel': '상형문자 새김',
        'Open Water': '개방 수역',
        'Pelagic Cleaver': '대양의 도끼날',
        'Portentous Comet(?!eor)': '악마의 혜성',
        'Portentous Cometeor': '악마의 코메테오',
        'Primal Roar': '대포효',
        'Primordial Chaos': '독극락',
        'Prismatic Wing': '수정 날개',
        'Punishing Pounce': '회초리 도약',
        'Radiant Wave': '밝은 소음',
        'Raking Scratch': '연속 손톱',
        'Ray of Dangers Near / Ray of Expulsion Afar': '압축식/배척식 암흑 광선',
        'Ray of Ignorance': '암흑 광선',
        'Recharge': '마력 공급',
        'Recommended for You': '상품 지정',
        'Restore Gravity': '중력 초기화',
        'Return(?!s)': '데존',
        'Returns': '리턴', // Assassin's Dagger 1 Returns
        'Rockslide': '낙석',
        'Rotate Right / Rotate Left': '왼쪽/오른쪽 회전',
        'Rotation': '회전',
        'Ruby Blaze': '적열 저주',
        '(?<! )Rumble(?! )': '땅 흔들기',
        'Rune Axe': '룬 도끼',
        '(?<![C ])Rush(?!ing)': '돌진',
        'Rushing Rumble(?! )': '돌진 땅 흔들기',
        'Rushing Rumble Rampage': '연속 돌진 땅 흔들기',
        'Sage\'s Staff': '현자의 지팡이',
        'Sand Surge': '땅 폭발',
        'Scathing Sweep': '가로 후리기',
        '(?<! )Scratch': '생채기',
        'Seal Asunder': '봉인 파괴',
        'Self-destruct': '자폭',
        'Shades\' Crossing': '십자 그림자',
        'Shades\' Nest': '외곽 그림자',
        'Shifting Shape': '개복',
        'Shockwave': '충격파',
        'Six-Handed Fistfight': '치고받기',
        'Skulking Orders': '처벌 지시',
        'Slice \'n\' Dice': '조각내기',
        'Slice \'n\' Strike': '조각내고 중화포',
        'Small Ruinous Rune': '작은 파멸의 룬',
        'Snow Boulder': '거대 눈덩이',
        'Snowball Flight': '폭주 눈사람',
        'Spinning Siege': '회전 기공포',
        'Spirit Sling': '마나포',
        'Squash': '밟아 뭉개기',
        'Steelstrike': '검 돌격',
        'Stone Swell': '암석 융기',
        'Summon': '소환',
        'Sunderseal Roar': '해방의 포효',
        'Surprise Attack': '불시 공격',
        'The Grip of Poison': '사악한 공명',
        'Three-Body Problem': '위성 연계 공격',
        'Three-Body Probl─': '위성 연계 공격?',
        'Threefold Marks': '삼중 손톱자국',
        'Tidal Breath': '해일 숨결',
        'Tidal Guillotine': '해일 단두대',
        'To the Winds': '폭발 분산',
        'Twopenny Inflation / Onepenny Inflation / Fourpenny Inflation': '한/두/네 닢 저주 폭풍 (넉백)',
        'Unseal(?!ed)': '봉인 해방',
        'Unsealed Aura': '오라 해방',
        'Vengeful Bio III': '복수의 바이오가',
        'Vengeful Blizzard III': '복수의 블리자가',
        'Vengeful Fire III': '복수의 파이가',
        'Vertical Crosshatch/Horizontal Crosshatch': '세로/가로 이중 손톱',
        'Void Death IV': '보이드 데스쟈',
        'Void Thunder III': '보이드 선더가',
        'Wallop': '매질',
        'Waterspout': '물폭풍',
        'What\'re You Buying\\?': '구매 명령',
        'White-hot Rage': '노도의 기염',
        'Wicked Water': '저주받은 물',
        'Wind Surge': '바람 폭발',
        'Withering Eternity': '쇠퇴의 시대',
      },
    },
  ],
};

export default triggerSet;
