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
type RoleBait = 'tank' | 'healer' | 'melee' | 'ranged';
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
    tc: '月環',
  },
  out: {
    en: 'Out',
    de: 'Raus',
    fr: 'Extérieur',
    ja: '外へ',
    cn: '钢铁',
    ko: '밖',
    tc: '鋼鐵',
  },
  near: {
    en: 'Baits Close (Party Far)',
    de: 'Nah ködern (Gruppe fern)',
    fr: 'Déposez près (Groupe au loin)',
    ja: '近づいて誘導 (他は離れる)',
    cn: '引导近 (小队远)',
    ko: '가까이 유도 (본대 멀리)',
    tc: '引導近 (小隊遠)',
  },
  far: {
    en: 'Baits Far (Party Close)',
    de: 'Fern ködern (Gruppe nah)',
    fr: 'Déposez au loin (Groupe près)',
    ja: '離れて誘導 (他は近づく)',
    cn: '引导远 (小队近)',
    ko: '멀리 유도 (본대 가까이)',
    tc: '引導遠 (小隊近)',
  },
  tanksNear: {
    en: 'Tanks Close (Party Far)',
    de: 'Tanks nahe (Gruppe weit weg)',
    fr: 'Tanks près (Groupe au loin)',
    cn: '坦克近 (小队远)',
    ko: '탱커 가까이 (본대 멀리)',
    tc: '坦克近 (小隊遠)',
  },
  healersFar: {
    en: 'Healers Far (Party Close)',
    de: 'Heiler weit weg (Gruppe nahe)',
    fr: 'Healers loin (Groupe près)',
    cn: '治疗远 (小队近)',
    ko: '힐러 멀리 (본대 가까이)',
    tc: '治療遠 (小隊近)',
  },
  meleeNear: {
    en: 'Melee Close (Party Far)',
    de: 'Nahkämpfer nahe (Gruppe weit weg)',
    fr: 'DPS Mêlée près (Groupe au loin)',
    cn: '近战近 (小队远)',
    ko: '근딜 가까이 (본대 멀리)',
    tc: '近戰近 (小隊遠)',
  },
  rangedFar: {
    en: 'Ranged Far (Party Close)',
    de: 'Fernkämpfer weit weg (Gruppe nahe)',
    fr: 'DPS Distance loin (Groupe près)',
    cn: '远程远 (小队近)',
    ko: '원딜 멀리 (본대 가까이)',
    tc: '遠程遠 (小隊近)',
  },
  combo: {
    en: '${inOut} => ${bait}',
    de: '${inOut} => ${bait}',
    fr: '${inOut} => ${bait}',
    ja: '${inOut} => ${bait}',
    cn: '${inOut} => ${bait}',
    ko: '${inOut} => ${bait}',
    tc: '${inOut} => ${bait}',
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
    tc: '<== (左邊開始) 兩次擊退',
  },
  iceRight: {
    en: '(Start on Right) Double Knockback ==>',
    de: '(Starte Rechts) Doppel-Rückstoß ==>',
    fr: '(Démarrez à droite) Double poussée ==>',
    ja: '(右から開始) 2連続ノックバック ==>',
    cn: '(右边开始) 两次击退 ==>',
    ko: '(오른쪽에서 시작) 넉백 2번 ==>',
    tc: '(右邊開始) 兩次擊退 ==>',
  },
  fireLeft: {
    en: 'Fire - Start Front + Right ==>',
    de: 'Feuer - Starte Vorne + Rechts ==>',
    fr: 'Feu - Démarrez Devant + Droite ==>',
    ja: '火 - 最前列 + 右側へ ==>',
    cn: '火 - 右右右 ==>',
    ko: '불 - 오른쪽 앞에서 시작 ==>',
    tc: '火 - 右右右 ==>',
  },
  fireRight: {
    en: '<== Fire - Start Front + Left',
    de: '<== Feuer - Starte Vorne + Links',
    fr: '<== Feu - Démarrez Devant + Gauche',
    ja: '<== 火 - 最前列 + 左側へ',
    cn: '<== 火 - 左左左',
    ko: '<== 불 - 왼쪽 앞에서 시작',
    tc: '<== 火 - 左左左',
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
    tc: '去前 / 側邊',
  },
  frontAndBack: {
    en: 'Go Front / Back',
    de: 'Geh nach Vorne / Hinten',
    fr: 'Allez Devant / Derrière',
    ja: '前方 / 後方 へ',
    cn: '去前 / 后边',
    ko: '앞 / 뒤로',
    tc: '去前 / 後面',
  },
  sidesAndBack: {
    en: 'Go Sides / Back',
    de: 'Geh Seitlich / Hinten',
    fr: 'Allez Côtés / Derrière',
    ja: '横 / 後方 へ',
    cn: '去侧 / 后边',
    ko: '양옆 / 뒤로',
    tc: '去側 / 後面',
  },
} as const;

const conductorCurrentStringsNoStrat = {
  remoteCurrent: {
    en: 'Far Cone on You',
    de: 'Fern-Kegel auf DIR',
    fr: 'Cône éloigné sur Vous',
    ja: '自分から遠い人に扇範囲',
    cn: '远雷点名',
    ko: '멀리 화살표 대상자',
    tc: '遠雷點名',
  },
  proximateCurrent: {
    en: 'Near Cone on You',
    de: 'Nah-Kegel auf DIR',
    fr: 'Cône proche sur Vous',
    ja: '自分から近い人に扇範囲',
    cn: '近雷点名',
    ko: '가까이 화살표 대상자',
    tc: '近雷點名',
  },
  spinningConductorSupport: {
    en: 'Small AoE on You',
    de: 'Kleine AoE auf DIR',
    fr: 'Petite AoE sur Vous',
    ja: '自分に小さい円範囲',
    cn: '小钢铁点名',
    ko: '작은 원형징 대상자',
    tc: '小鋼鐵點名',
  },
  spinningConductorDPS: {
    en: 'Small AoE on You',
    de: 'Kleine AoE auf DIR',
    fr: 'Petite AoE sur Vous',
    ja: '自分に小さい円範囲',
    cn: '小钢铁点名',
    ko: '작은 원형징 대상자',
    tc: '小鋼鐵點名',
  },
  roundhouseConductorSupport: {
    en: 'Donut AoE on You',
    de: 'Donut AoE auf DIR',
    fr: 'Donut sur Vous',
    ja: '自分にドーナツ範囲',
    cn: '月环点名',
    ko: '도넛징 대상자',
    tc: '月環點名',
  },
  roundhouseConductorDPS: {
    en: 'Donut AoE on You',
    de: 'Donut AoE auf DIR',
    fr: 'Donut sur Vous',
    ja: '自分にドーナツ範囲',
    cn: '月环点名',
    ko: '도넛징 대상자',
    tc: '月環點名',
  },
  colliderConductor: {
    en: 'Get Hit by Cone',
    de: 'Werde vom Kegel getroffen',
    fr: 'Encaissez un cône',
    ja: '扇範囲に当たって',
    cn: '吃雷',
    ko: '화살표 장판 맞기',
    tc: '吃雷',
  },
} as const;

const conductorCurrentStringsDNStrat = {
  remoteCurrent: {
    en: 'Front of Middle (Far Cone)',
    de: 'Vorne mittig (Fern-Kegel)',
    fr: 'Devant au milieu (loin du cône)',
    cn: '中前 (远扇形)',
    ko: '앞 가운데 (멀리 화살표)',
    tc: '中前 (遠扇形)',
  },
  proximateCurrent: {
    en: 'Front of Middle (Near Cone)',
    de: 'Vorne mittig (Nah-Kegel)',
    fr: 'Devant au milieu (près du cône)',
    cn: '中前 (近扇形)',
    ko: '앞 가운데 (가까이 화살표)',
    tc: '中前 (近扇形)',
  },
  spinningConductorSupport: {
    en: 'Front Left (Small AoE)',
    de: 'Vorne links (kleine AoE)',
    fr: 'Devant à gauche (petite AoE)',
    cn: '左前 (小圈)',
    ko: '앞 왼쪽 (작은 원형징)',
    tc: '左前 (小圈)',
  },
  spinningConductorDPS: {
    en: 'Front Right (Small AoE)',
    de: 'Vorne rechts (kleine AoE)',
    fr: 'Devant à droite (petite AoE)',
    cn: '右前 (小圈)',
    ko: '앞 오른쪽 (작은 원형징)',
    tc: '右前 (小圈)',
  },
  roundhouseConductorSupport: {
    en: 'Front Left (Donut AoE)',
    de: 'Vorne links (Donut AoE)',
    fr: 'Devant à gauche (AoE en donut)',
    cn: '左前 (月环)',
    ko: '앞 왼쪽 (도넛징)',
    tc: '左前 (月環)',
  },
  roundhouseConductorDPS: {
    en: 'Front Right (Donut AoE)',
    de: 'Vorne rechts (Donut AoE)',
    fr: 'Devant à droite (AoE en donut)',
    cn: '右前 (月环)',
    ko: '앞 오른쪽 (도넛징)',
    tc: '右前 (月環)',
  },
  colliderConductor: {
    en: 'Middle, Behind Current (Get Hit by Cone)',
    de: 'Mitte, hinter Leitstrom (Lass dich vom Kegel treffen)',
    fr: 'Milieu à l\'arrière (prenez le cône)',
    cn: '中间, 扇形后 (吃扇形)',
    ko: '가운데, 화살표 뒤 (화살표 장판 맞기)',
    tc: '中間, 扇形後 (吃扇形)',
  },
} as const;

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    ionCluster: 'none' | 'DN';
    witchHunt: 'none' | 'DN';
    sunrise: 'none' | 'snakePrio';
    sunriseUptime: true | false;
  };
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
  config: [
    {
      id: 'ionCluster',
      name: {
        en: 'Ion Cluster Debuff Strategy',
        de: 'Ionen-Ansammlung Debuff Strategie',
        fr: 'Mécanique pour Accumulation d\'ions',
        cn: '离子簇 Debuff 策略',
        ko: '이온 클러스터 디버프 전략',
        tc: '離子簇 Debuff 策略',
      },
      comment: {
        en: `Strategy for resolving debuffs during Ion Cluster.

             None: Call the debuff only, no strategy.
             DN: use rivet positions based on the <a href="https://pastebin.com/teF90QGm" target="_blank">shabin pastebin</a>.`,
        de: `Strategie zur Auflösung von Debuffs während Ionen-Ansammlung.

            None: Nenn den Debuff, keine Strategie.
            DN: Besnutze die Nieten-Positionen, basierend auf <a href="https://pastebin.com/teF90QGm" target="_blank">shabin pastebin</a>.`,
        fr: `Mécanique pour résoudre Accumulation d\'ions.

             Aucune : Affiche seulement le debuff, aucune stratégie.
             DN : utilise les positions du <a href="https://pastebin.com/teF90QGm" target="_blank">pastebin de shabin</a>.`,
        cn: `在 离子簇 机制中处理 debuff 的策略。

             无: 只播报 Debuff, 不使用策略。
             DN: 使用基于 <a href="https://pastebin.com/teF90QGm" target="_blank">shabin pastebin</a> 的固定站位。`,
        ko: `이온 클러스터 중 디버프를 해결하는 방법.

             없음: 디버프만 알림, 전략 없음.
             DN: <a href="https://pastebin.com/teF90QGm" target="_blank">shabin pastebin</a>기반의 고정 위치 사용.`,
        tc: `在 離子簇 機制中處理 debuff 的策略。

             無: 只播報 Debuff, 不使用策略。
             DN: 使用基於 <a href="https://pastebin.com/teF90QGm" target="_blank">shabin pastebin</a> 的固定站位。`,
      },
      type: 'select',
      options: {
        en: {
          'None': 'none',
          'DN': 'DN',
        },
        de: {
          'None': 'none',
          'DN': 'DN',
        },
        fr: {
          'Aucune': 'none',
          'DN': 'DN',
        },
        cn: {
          '无': 'none',
          'DN': 'DN',
        },
        ko: {
          '없음': 'none',
          'DN': 'DN',
        },
        tc: {
          '無': 'none',
          'DN': 'DN',
        },
      },
      default: 'none',
    },
    {
      id: 'witchHunt',
      name: {
        en: 'Witch Hunt Bait Strategy',
        de: 'Hexenjagd Köder Strategie',
        fr: 'Mécanique pour Piqué fulgurant',
        cn: '魔女狩猎诱导策略',
        ko: '마녀사냥 유도 전략',
        tc: '魔女狩獵誘導策略',
      },
      comment: {
        en: `Strategy for baiting Witch Hunt AoEs.<br>
             None: Call both party and bait positions with no specific strategy.<br>
             DN: DN uptime strategy, with flexible priority where Tanks take the first near bait,
             Healers take the first far bait, Melee DPS take the second near bait, and finally
             Ranged DPS take the second far bait.`,
        de: `Strategie zum ködern der Hexenjagd.<br>
             None: Zeige beides, Party und Köder Positionen, ohne specifische Strategie.<br>
             DN: DN uptime Strategie, mit flexibler Priorität, bei der Tanks den ersten Nah-Köder,
             Heiler die ersten entfernten Köder, Nahkämpfer die weiten Nah-Köder und schlussendlich
             Fernkämpfer die zweiten entfernten Köder nehmen.`,
        fr: `Stratégie pour résoudre Piqué fulgurant.<br>
             Aucune : Affiche les positions du groupe de bait sans stratégie spécifique.<br>
             DN : Stratégie DN Uptime, avec une priorité ajustée ou les tanks prennent le bait le plus proche,
             les healers prennent le 1er bait éloigné, les DPS Mêlée prennent le second bait proche et enfin,
             les DPS Distant prennent le second bait éloigné.`,
        cn: `诱导魔女狩猎 AOE 的策略。<br>
             无: 同时播报小队和诱导位置，无特定策略。<br>
             DN: DN uptime 策略, 优先级灵活, 坦克负责第一个近诱导,
             治疗负责第一个远诱导, 近战 DPS 负责第二个近诱导,
             最后远程 DPS 负责第二个远诱导。`,
        ko: `마녀사냥 장판 유도 전략.<br>
             없음: 파티 위치와 유도 위치를 모두 알림, 특별한 전략 없음.<br>
             DN: DN 업타임 전략. 탱커가 첫 번째 근접 유도를, 힐러가 첫 번째 원거리 유도를,
             근거리 딜러가 두 번째 근접 유도를, 마지막으로 원거리 딜러가 두 번째 원거리 유도를 합니다.`,
        tc: `誘導魔女狩獵 AOE 的策略。<br>
             無: 同時播報小隊和誘導位置，無特定策略。<br>
             DN: DN uptime 策略, 優先級靈活, 坦克負責第一個近誘導,
             治療負責第一個遠誘導, 近戰 DPS 負責第二個近誘導,
             最後遠程 DPS 負責第二個遠誘導。`,
      },
      type: 'select',
      options: {
        en: {
          'None': 'none',
          'DN': 'DN',
        },
        de: {
          'None': 'none',
          'DN': 'DN',
        },
        fr: {
          'Aucune': 'none',
          'DN': 'DN',
        },
        cn: {
          '无': 'none',
          'DN': 'DN',
        },
        ko: {
          '없음': 'none',
          'DN': 'DN',
        },
        tc: {
          '無': 'none',
          'DN': 'DN',
        },
      },
      default: 'none',
    },
    {
      id: 'sunrise',
      name: {
        en: 'Sunrise Sabbath Strategy',
        de: 'Morgensonnensabbat Strategie',
        fr: 'Mécanique pour Diablerie obscure - Aurore',
        cn: '黑色安息日的日出策略',
        ko: '검은 안식일: 일출 전략',
        tc: '黑色安息日的日出策略',
      },
      comment: {
        en: `Strategy for resolving Sunrise Sabbath.<br>
             None: Call debuffs, both tower spawns, and matching towers.<br>
             Snakes Prio: Popular priority system used in NA PF. Support players
             start looking for tower or cannon from the northwest going counter clockwise.
             DPS players look for tower or cannon from the north going clockwise.`,
        de: `Strategie zum lösen von Morgensonnensabbat.<br>
             None: Nenne den Debuff, beide Orte der Türme und passende Türme.<br>
             Snakes Prio: Populäres prioritäten System des NA PFs. Support Spieler
             starten Nord-Westen und suchen ihre Kanone gegen den Uhrzeigersinn.
             DPS Spieler schauen Norden im Uhrzeigersinn nach ihrer Kanone.`,
        fr: `Stratégie pour résoudre Diablerie obscure - Aurore<br>
             Aucune : Affiche les debuffs pour l\'apparition des tours et également les tours à prendre.<br>
             Snakes Prio: Mécanique populaire sur les centres de données NA en PF. Les supports
             regardent les tours ou canon à prendre depuis le Nord-ouest dans le sens anti-horaire.
             Les DPS regardent les tours ou les cannons à prendre depuis le Nord dans le sens horaire.`,
        cn: `处理黑色安息日的日出的策略。<br>
             无: 播报 Debuff, 双塔生成, 和匹配的塔。<br>
             Snakes Prio: 流行于北美招募版的优先级系统。
             T 奶玩家从西北方开始逆时针寻找塔或炮。
             DPS 玩家从正北方开始顺时针寻找塔或炮。`,
        ko: `검은 안식일: 일출 해결 전략.<br>
             없음: 디버프, 기둥 생성 및 일치하는 기둥만 알림.<br>
             Snakes Prio: 북미에서 널리 사용되는 우선순위 시스템.
             탱/힐은 북서부터 반시계 방향으로 기둥이나 대포를 찾습니다.
             딜러는 북쪽부터 시계 방향으로 기둥이나 대포를 찾습니다.
        `,
        tc: `處理黑色安息日的日出的策略。<br>
             無: 播報 Debuff, 雙塔生成, 和匹配的塔。<br>
             Snakes Prio: 流行於北美招募版的優先級系統。
             T 奶玩家從西北方開始逆時針尋找塔或炮。
             DPS 玩家從正北方開始順時針尋找塔或炮。`,
      },
      type: 'select',
      options: {
        en: {
          'None': 'none',
          'Snakes Prio': 'snakePrio',
        },
        de: {
          'None': 'none',
          'Snakes Prio': 'snakePrio',
        },
        fr: {
          'Aucune': 'none',
          'Snakes Prio': 'snakePrio',
        },
        cn: {
          '无': 'none',
          'Snakes Prio': 'snakePrio',
        },
        ko: {
          '없음': 'none',
          'Snakes Prio': 'snakePrio',
        },
        tc: {
          '無': 'none',
          'Snakes Prio': 'snakePrio',
        },
      },
      default: 'none',
    },
    {
      id: 'sunriseUptime',
      name: {
        en: 'Sunrise Sabbath Uptime Cannon Baits',
        de: 'Morgensonnensabbat - Uptime - Kanonen ködern',
        fr: 'Diablerie obscure - Aurore Uptime - Bait des canons',
        cn: '黑色安息日的日出 使用 uptime 炮诱导打法',
        ko: '검은 안식일: 일출 업타임 대포 유도',
        tc: '黑色安息日的日出 使用 uptime 炮誘導打法',
      },
      comment: {
        en: 'Call cannon baits assuming the AutoCAD waymark uptime cannon bait spots.',
        de: 'Nenne Kanonen-Köder bei verwendung der AutoCAD-Wegmarkierungen',
        fr: 'Affiche les bait des canons selon les marqueurs AutoCAD.',
        cn: '基于 AutoCAD 标点的 uptime 炮诱导打法播报炮诱导。',
        ko: 'AutoCAD 지면 표식을 기반으로 대포 유도를 알립니다.',
        tc: '基於 AutoCAD 標點的 uptime 炮誘導打法播報炮誘導。',
      },
      type: 'checkbox',
      default: false,
    },
  ],
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
          tc: '躲避前方雷射 + 場邊直線AoE',
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
          tc: '內場',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '外场',
          ko: '밖',
          tc: '外場',
        },
        spreadAvoid: {
          en: 'Spread (Avoid Side Cleaves)',
          de: 'Verteilen (Vermeide Seiten-Angriff)',
          fr: 'Dispersion (Évitez les cleaves de côtés)',
          ja: '散開 (横の範囲を避けて)',
          cn: '分散 (注意场边直线AoE)',
          ko: '산개 (양옆 레이저 피하기)',
          tc: '分散 (注意場邊直線AoE)',
        },
        combo: {
          en: '${inOut} + ${spread}',
          de: '${inOut} + ${spread}',
          fr: '${inOut} + ${spread}',
          ja: '${inOut} + ${spread}',
          cn: '${inOut} + ${spread}',
          ko: '${inOut} + ${spread}',
          tc: '${inOut} + ${spread}',
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
          tc: '內場',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '外场',
          ko: '밖',
          tc: '外場',
        },
        near: {
          en: 'Spread (Be Closer)',
          de: 'Verteilen (Sei näher dran)',
          fr: 'Dispersion (Près)',
          ja: '散開(近づく)',
          cn: '靠近分散',
          ko: '산개 (가까이)',
          tc: '靠近分散',
        },
        far: {
          en: 'Spread (Be Further)',
          de: 'Verteilen (Sei weiter weg)',
          fr: 'Dispersion (Loin)',
          ja: '散開(離れる)',
          cn: '远离分散',
          ko: '산개 (멀리)',
          tc: '遠離分散',
        },
        combo: {
          en: '${inOut} + ${spread}',
          de: '${inOut} + ${spread}',
          fr: '${inOut} + ${spread}',
          ja: '${inOut} + ${spread}',
          cn: '${inOut} + ${spread}',
          ko: '${inOut} + ${spread}',
          tc: '${inOut} + ${spread}',
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
        let baitOrder: (NearFar | RoleBait)[];

        if (data.witchHuntBait === 'near') {
          if (data.triggerSetConfig.witchHunt === 'DN')
            baitOrder = ['tank', 'healer', 'melee', 'ranged'];
          else
            baitOrder = ['near', 'far', 'near', 'far'];
        } else if (data.witchHuntBait === 'far') {
          if (data.triggerSetConfig.witchHunt === 'DN')
            baitOrder = ['healer', 'tank', 'ranged', 'melee'];
          else
            baitOrder = ['far', 'near', 'far', 'near'];
        } else {
          baitOrder = [];
        }

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
          tc: '月環',
        },
        out: {
          en: 'Out',
          de: 'Raus',
          fr: 'Extérieur',
          ja: '外へ',
          cn: '钢铁',
          ko: '밖',
          tc: '鋼鐵',
        },
        near: {
          en: 'Close',
          de: 'Nah',
          fr: 'Près',
          ja: '近づく',
          cn: '近',
          ko: '가까이',
          tc: '近',
        },
        far: {
          en: 'Far',
          de: 'Fern',
          fr: 'Loin',
          ja: '離れる',
          cn: '远',
          ko: '멀리',
          tc: '遠',
        },
        tank: {
          en: 'Tanks',
          de: 'Tanks',
          fr: 'Tanks',
          cn: '坦克',
          ko: '탱커',
          tc: '坦克',
        },
        healer: {
          en: 'Healers',
          de: 'Heiler',
          fr: 'Healers',
          cn: '治疗',
          ko: '힐러',
          tc: '治療',
        },
        melee: {
          en: 'Melee',
          de: 'Nahkämpfer',
          fr: 'Melée',
          cn: '近战',
          ko: '근딜',
          tc: '近戰',
        },
        ranged: {
          en: 'Ranged',
          de: 'Fernkämpfer',
          fr: 'Distant',
          cn: '远程',
          ko: '원딜',
          tc: '遠程',
        },
        separator: {
          en: ' => ',
          de: ' => ',
          fr: ' => ',
          ja: ' => ',
          cn: ' => ',
          ko: ' => ',
          tc: '=>',
        },
        baitStep: {
          en: '${inOut} (${bait})',
          de: '${inOut} (${bait})',
          fr: '${inOut} (${bait})',
          ja: '${inOut} (${bait})',
          cn: '${inOut} (${bait})',
          ko: '${inOut} (${bait})',
          tc: '${inOut} (${bait})',
        },
        baitCombo: {
          en: 'Baits: ${allBaits}',
          de: 'Ködern: ${allBaits}',
          fr: 'Dépose : ${allBaits}',
          ja: '誘導: ${allBaits}',
          cn: '引导: ${allBaits}',
          ko: '유도: ${allBaits}',
          tc: '引導: ${allBaits}',
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

        const spot = () => {
          if (data.triggerSetConfig.witchHunt === 'none')
            return bait;

          // DN Strat: Tanks take the first near bait
          if (bait === 'near')
            return 'tanksNear';

          // DN Strat: Healers take the first far bait
          if (bait === 'far')
            return 'healersFar';

          return bait;
        };

        return output.combo!({ inOut: output[inOut]!(), bait: output[spot()]!() });
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

        const spot = () => {
          if (data.triggerSetConfig.witchHunt === 'none')
            return bait;

          // DN Strat: Tanks take the first near bait
          if (bait === 'near')
            return 'tanksNear';

          // DN Strat: Healers take the first far bait
          if (bait === 'far')
            return 'healersFar';

          return bait;
        };

        return output.combo!({ inOut: output[inOut]!(), bait: output[spot()]!() });
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

        const spot = () => {
          if (data.triggerSetConfig.witchHunt === 'none')
            return bait;

          // DN Strat: Melee take the second near bait
          if (bait === 'near')
            return 'meleeNear';

          // DN Strat: Ranged take the second far bait
          if (bait === 'far')
            return 'rangedFar';

          return bait;
        };

        return output.combo!({ inOut: output[inOut]!(), bait: output[spot()]!() });
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

        const spot = () => {
          if (data.triggerSetConfig.witchHunt === 'none')
            return bait;

          // DN Strat: Melee take the second near bait
          if (bait === 'near')
            return 'meleeNear';

          // DN Strat: Ranged take the second far bait
          if (bait === 'far')
            return 'rangedFar';

          return bait;
        };

        return output.combo!({ inOut: output[inOut]!(), bait: output[spot()]!() });
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
          tc: '${dir} => ${mech}',
        },
      },
    },
    {
      id: 'R4S Electrical Condenser Debuff Collect',
      type: 'GainsEffect',
      netRegex: { effectId: 'F9F', capture: true },
      condition: Conditions.targetIsNotYou(),
      run: (data, matches) => {
        const condenserTimer = parseFloat(matches.duration) > 30 ? 'long' : 'short';
        data.condenserMap[condenserTimer].push(matches.target);
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
        const same = data.condenserMap[data.condenserTimer]
          .map((p) => data.party.member(p))
          .join(', ');

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
          tc: '短 Debuff (和 ${same})',
        },
        long: {
          en: 'Long Debuff (w/ ${same})',
          de: 'Langer Debuff (mit ${same})',
          fr: 'Debuff long (avec ${same})',
          ja: '長いデバフ (同じく/ ${same})',
          cn: '长 Debuff (和 ${same})',
          ko: '긴 디버프 (+ ${same})',
          tc: '長 Debuff (和 ${same})',
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
          tc: '(稍後 ${times} 層)',
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
          tc: '分散 (${stacks} 層)',
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
          tc: '(${stacks} 層雷)',
        },
        combo: {
          en: '${dir} => ${mech} ${remind}',
          de: '${dir} => ${mech} ${remind}',
          fr: '${dir} => ${mech} ${remind}',
          ja: '${dir} => ${mech} ${remind}',
          cn: '${dir} => ${mech} ${remind}',
          ko: '${dir} => ${mech} ${remind}',
          tc: '${dir} => ${mech} ${remind}',
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
          tc: '${dir} - 站在最前面',
        },
        nonTank: {
          en: '${dir} - Behind Tank',
          de: '${dir} - Hinter dem Tank',
          fr: '${dir} - Derrière le tank',
          ja: '${dir} - タンクの後ろへ',
          cn: '${dir} - 站坦克后面',
          ko: '${dir} - 탱커 뒤로',
          tc: '${dir} - 站坦克後面',
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
            tc: '穿',
          },
          stay: {
            en: 'Stay',
            de: 'Stehen bleiben',
            fr: 'Restez',
            ja: 'そのまま',
            cn: '停',
            ko: '그대로',
            tc: '停',
          },
          unknown: Outputs.unknown,
          tank: {
            en: '${dir} - Be in Front',
            de: '${dir} - Sei Vorne',
            fr: '${dir} - Devant le groupe',
            ja: '${dir} - ボス近くで受けて',
            cn: '${dir} - 站在最前面',
            ko: '${dir} - 맨 앞으로',
            tc: '${dir} - 站在最前面',
          },
          nonTank: {
            en: '${dir} - Behind Tank',
            de: '${dir} - Hinter dem Tank',
            fr: '${dir} - Derrière le tank',
            ja: '${dir} - タンクの後ろへ',
            cn: '${dir} - 站坦克后面',
            ko: '${dir} - 탱커 뒤로',
            tc: '${dir} - 站坦克後面',
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
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = data.triggerSetConfig.ionCluster === 'DN'
          ? conductorCurrentStringsDNStrat
          : conductorCurrentStringsNoStrat;
        switch (matches.effectId) {
          case 'FA2':
            return { alertText: output.remoteCurrent!() };
          case 'FA3':
            return { alertText: output.proximateCurrent!() };
          case 'FA4':
            if (data.role === 'tank' || data.role === 'healer')
              return { alertText: output.spinningConductorSupport!() };
            return { alertText: output.spinningConductorDPS!() };
          case 'FA5':
            if (data.role === 'tank' || data.role === 'healer')
              return { alertText: output.roundhouseConductorSupport!() };
            return { alertText: output.roundhouseConductorDPS!() };
          case 'FA6':
            return { alertText: output.colliderConductor!() };
        }
      },
      run: (data) => data.seenConductorDebuffs = true,
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
          tc: '與搭檔躲避 7 次扇形',
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
          tc: '站在搭檔前面 (擋槍)',
        },
        far: {
          en: 'Behind Partner',
          de: 'Sei hinter deinem Partner',
          fr: 'Derrière votre partenaire',
          ja: '相方の後ろへ',
          cn: '站在搭档后面',
          ko: '파트너 뒤로',
          tc: '站在搭檔後面',
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
          const toStr = safePlayers.map((m) => data.party.member(m)).join(', ');

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
          tc: '傳火 (${to})',
        },
        getDebuff: {
          en: 'Get Debuff',
          de: 'Debuff nehmen',
          fr: 'Prenez le debuff',
          ja: 'デバフを取って',
          cn: '接火',
          ko: '디버프 받기',
          tc: '接火',
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
          tc: '儲存: ${effect}',
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
            tc: '坦克 LB!',
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
      response: Responses.healerGroups(),
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
          tc: '${bait} => ${dir1} => ${dir2}',
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
          tc: '${dir} => ${middleSides}',
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
          tc: '${dir} + ${type} + ${mech}',
        },
        guns: {
          en: 'Avoid Line',
          de: 'Weiche den Linien aus',
          fr: 'Évitez la ligne',
          ja: 'ビームを避けて',
          cn: '躲避直线',
          ko: '직선 장판 피하기',
          tc: '躲避直線',
        },
        wings: {
          en: 'Donut',
          de: 'Donut',
          fr: 'Donut',
          ja: 'ドーナツ',
          cn: '月环',
          ko: '도넛 장판',
          tc: '月環',
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
          tc: '${dir} + ${type} + ${mech}',
        },
        guns: {
          en: 'Avoid Line',
          de: 'Weiche den Linien aus',
          fr: 'Évitez la ligne',
          ja: 'ビームを避けて',
          cn: '躲避直线',
          ko: '직선 장판 피하기',
          tc: '躲避直線',
        },
        wings: {
          en: 'Donut',
          de: 'Donut',
          fr: 'Donut',
          ja: 'ドーナツ',
          cn: '月环',
          ko: '도넛 장판',
          tc: '月環',
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
          tc: '八人塔站位',
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
          tc: '${side}: 從 ${first} 開始',
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
          tc: '=>',
        },
        safe: {
          en: '${side} Side: ${order}',
          de: '${side} Seite: ${order}',
          fr: 'Côté ${side} : ${order}',
          ja: '${side} : ${order}',
          cn: '${side} 侧: ${order}',
          ko: '${side}: ${order}',
          tc: '${side} 側: ${order}',
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
          tc: '長黃 (先踩塔)',
        },
        blueLong: {
          en: 'Long Blue Debuff (Towers First)',
          de: 'Langer Blauer Debuff (Turm zuerst)',
          fr: 'Debuff bleu long (Tour en 1er)',
          ja: '長い青色デバフ (塔から)',
          cn: '长蓝 (先踩塔)',
          ko: '긴 파란색 디버프 (기둥 먼저)',
          tc: '長藍 (先踩塔)',
        },
        yellowShort: {
          en: 'Short Yellow Debuff (Cannons First)',
          de: 'Kurzer Gelber Debuff (Kanone zuerst)',
          fr: 'Debuff jaune court (Canons en 1er)',
          ja: '短い黄色デバフ (ビーム誘導から)',
          cn: '短黄 (先引导)',
          ko: '짧은 노란색 디버프 (대포 먼저)',
          tc: '短黃 (先引導)',
        },
        blueShort: {
          en: 'Short Blue Debuff (Cannons First)',
          de: 'Kurzer Blauer Debuff (Kanone zuerst)',
          fr: 'Debuff bleu court (Canons en 1er)',
          ja: '短い青色デバフ (ビーム誘導から)',
          cn: '短蓝 (先引导)',
          ko: '짧은 파란색 디버프 (대포 먼저)',
          tc: '短藍 (先引導)',
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
        let cannonBaitSpots = undefined;

        if (data.sunriseTowerSpots !== undefined) {
          if (data.triggerSetConfig.sunrise === 'snakePrio') {
            if (data.sunriseTowerSpots === 'northSouth') {
              towerSoakStr = data.role === 'dps'
                ? output['dirN']!()
                : output['dirS']!();
            } else {
              towerSoakStr = data.role === 'dps'
                ? output['dirE']!()
                : output['dirW']!();
            }
          } else {
            towerSoakStr = output[data.sunriseTowerSpots]!();
          }
          if (data.triggerSetConfig.sunriseUptime) {
            cannonBaitSpots = data.sunriseTowerSpots;
            cannonBaitStr = data.sunriseTowerSpots === 'northSouth'
              ? output.northSouth!()
              : output.eastWest!();
          } else {
            cannonBaitSpots = data.sunriseTowerSpots === 'northSouth'
              ? 'eastWest'
              : 'northSouth';
            cannonBaitStr = data.sunriseTowerSpots === 'northSouth'
              ? output.eastWest!()
              : output.northSouth!();
          }
        }

        if (task === 'yellowShort' || task === 'blueShort') {
          const cannonLocs = task === 'yellowShort' ? blueCannons : yellowCannons;
          let locStr = output['unknown']!();

          if (data.triggerSetConfig.sunrise === 'snakePrio') {
            const dpsPrio: DirectionOutputIntercard[] = ['dirNE', 'dirSE', 'dirSW'];
            const supPrio: DirectionOutputIntercard[] = ['dirNW', 'dirSW', 'dirSE'];
            const cannonPrio = data.role === 'dps' ? dpsPrio : supPrio;
            const cannon = cannonPrio.find((loc) => cannonLocs.includes(loc));
            locStr = cannon ? output[cannon]!() : output['unknown']!();
            if (cannonBaitSpots === 'northSouth') {
              cannonBaitStr = cannon === 'dirNE' || cannon === 'dirNW'
                ? output['dirN']!()
                : output['dirS']!();
            } else if (cannonBaitSpots === 'eastWest') {
              cannonBaitStr = cannon === 'dirNE' || cannon === 'dirSE'
                ? output['dirE']!()
                : output['dirW']!();
            }
          } else {
            locStr = cannonLocs.map((loc) => output[loc]!()).join('/');
          }

          const finalBaitStr = data.triggerSetConfig.sunriseUptime
            ? output.baitUptime!({ bait: cannonBaitStr })
            : output.baitNormal!({ bait: cannonBaitStr });

          return output[task]!({ loc: locStr, bait: finalBaitStr });
        }

        return output[task]!({ bait: towerSoakStr });
      },
      run: (data) => {
        data.sunriseCannons = [];
        data.seenFirstSunrise = true;
        delete data.sunriseTowerSpots;
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        northSouth: {
          en: 'N/S',
          de: 'N/S',
          fr: 'N/S',
          ja: '南/北',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        eastWest: {
          en: 'E/W',
          de: 'O/W',
          fr: 'E/O',
          ja: '東/西',
          cn: '左/右',
          ko: '동/서',
          tc: '左/右',
        },
        yellowLong: {
          en: 'Soak Tower (${bait})',
          de: 'Turm nehmen (${bait})',
          fr: 'Prenez une tour (${bait})',
          ja: '塔を踏んで (${bait})',
          cn: '踩塔 (${bait})',
          ko: '기둥 밟기 (${bait})',
          tc: '踩塔 (${bait})',
        },
        blueLong: {
          en: 'Soak Tower (${bait})',
          de: 'Turm nehmen (${bait})',
          fr: 'Prenez une tour (${bait})',
          ja: '塔を踏んで (${bait})',
          cn: '踩塔 (${bait})',
          ko: '기둥 밟기 (${bait})',
          tc: '踩塔 (${bait})',
        },
        baitNormal: {
          en: 'Point ${bait}',
          de: 'Zeige ${bait}',
          fr: 'Pointez ${bait}',
          cn: '指向 (${bait})',
          ko: '${bait}쪽으로',
          tc: '指向 (${bait})',
        },
        baitUptime: {
          en: 'Stand ${bait} side',
          de: 'Stehe ${bait} Seite',
          fr: 'Restez côté ${bait}',
          cn: '站 ${bait} 侧',
          ko: '${bait}쪽 면에 서기',
          tc: '站 ${bait} 側',
        },
        yellowShort: {
          en: 'Blue Cannon (${loc}) - ${bait}',
          de: 'Blaue Kanone (${loc}) - ${bait}',
          fr: 'Canon bleu ${loc}) - ${bait}',
          ja: '青いビーム誘導 (${loc}) - ${bait}',
          cn: '蓝激光 (${loc}) - ${bait}',
          ko: '파란 대포 (${loc}) - ${bait}',
          tc: '藍雷射 (${loc}) - ${bait}',
        },
        blueShort: {
          en: 'Yellow Cannon (${loc}) - Point ${bait}',
          de: 'Gelbe Kanone (${loc}) - ${bait}',
          fr: 'Canon jaune ${loc}) - ${bait}',
          ja: '黄色いビーム誘導 (${loc}) - ${bait}',
          cn: '黄激光 (${loc}) - ${bait}',
          ko: '노란 대포 (${loc}) - ${bait}',
          tc: '黃雷射 (${loc}) - ${bait}',
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
    {
      'locale': 'cn',
      'replaceSync': {
        'Electromine': '雷转质矿组',
        'Wicked Replica': '狡雷的幻影',
        'Wicked Thunder': '狡雷',
      },
      'replaceText': {
        '(?<! )Spark': '电火花',
        '(?<! )Witch Hunt': '魔女狩猎',
        'Azure Thunder': '青雷',
        'Bewitching Flight': '魔女回翔',
        'Burst': '爆炸',
        'Cannonbolt': '聚雷加农炮',
        'Chain Lightning': '雷光链',
        'Conduction Point': '指向雷',
        'Cross Tail Switch': '交叉乱尾击',
        'Eight Star': '八雷星',
        'Electrifying Witch Hunt': '惊电魔女狩猎',
        'Electron Stream': '电子流',
        'Electrope Edge': '雷转质展开',
        'Electrope Transplant': '雷转质移植',
        'Flame Slash': '火焰斩',
        'Forked Fissures': '惊电裂隙',
        'Forked Lightning': '叉形闪电',
        'Four Star': '四雷星',
        'Fulminous Field': '雷电力场',
        'Impact': '冲击',
        'Ion Cluster': '离子簇',
        'Laceration': '斩击',
        'Left Roll': '左转',
        'Lightning Cage': '电牢笼',
        'Lightning Vortex': '电闪圆',
        'Midnight Sabbath': '黑色安息日的午夜',
        'Mustard Bomb': '芥末爆弹',
        'Narrowing Witch Hunt': '环圆式魔女狩猎',
        'Raining Swords': '剑雨',
        'Right Roll': '右转',
        'Sidewise Spark': '侧方电火花',
        'Soulshock': '灵魂震荡',
        'Stampeding Thunder': '奔雷炮',
        'Sunrise Sabbath': '黑色安息日的日出',
        'Switch of Tides': '尖尾溅',
        'Sword Quiver': '剑舞',
        'Tail Thrust': '尖尾刺',
        'Thundering': '电闪环',
        'Twilight Sabbath': '黑色安息日的日落',
        'Wicked Blaze': '狡诡炽焰',
        'Wicked Bolt': '狡诡落雷',
        'Wicked Fire': '狡诡火炎',
        'Wicked Flare': '狡诡核爆',
        'Wicked Jolt': '狡诡摇荡',
        'Wicked Spark': '狡诡电火花',
        'Wicked Special': '狡诡特技',
        'Wicked Thunder': '狡雷',
        'Widening Witch Hunt': '圆环式魔女狩猎',
        'Witchgleam': '辉光电火花',
        'Wrath of Zeus': '宙斯之怒',
        '\\(debuffs resolve\\)': '(处理 Debuff)',
        '\\(debuffs\\)': '(Debuff)',
        '\\(enrage\\)': '(狂暴)',
        '\\(first mines hit\\)': '(第一轮魔方充能)',
        '\\(first set\\)': '(第一轮充能)',
        '\\(first sparks detonate\\)': '(第一轮火花引爆)',
        '\\(first towers/cannons resolve\\)': '(第一轮塔/炮)',
        '\\(floor no more\\)': '(地板消失)',
        '\\(fourth set\\)': '(第四轮充能)',
        '\\(mines\\)': '(魔方)',
        '\\(players\\)': '(玩家)',
        '\\(puddles drop\\)': '(放圈)',
        '\\(second hit\\)': '(第二击)',
        '\\(second mines hit\\)': '(第二轮魔方充能)',
        '\\(second set\\)': '(第二轮充能)',
        '\\(second sparks detonate\\)': '(第二轮火花引爆)',
        '\\(second towers/cannons resolve\\)': '(第二轮塔/炮)',
        '\\(spread \\+ tethers\\)': '(分散 + 连线)',
        '\\(third mines hit\\)': '(第三轮魔方充能)',
        '\\(third set\\)': '(第三轮充能)',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Electromine': '', // FIXME '雷转质矿组'
        // 'Wicked Replica': '', // FIXME '狡雷的幻影'
        // 'Wicked Thunder': '', // FIXME '狡雷'
      },
      'replaceText': {
        '(?<! )Spark': '電火花',
        // '(?<! )Witch Hunt': '', // FIXME '魔女狩猎'
        // 'Azure Thunder': '', // FIXME '青雷'
        // 'Bewitching Flight': '', // FIXME '魔女回翔'
        'Burst': '爆炸',
        // 'Cannonbolt': '', // FIXME '聚雷加农炮'
        'Chain Lightning': '雷光鏈',
        'Conduction Point': '指向雷',
        // 'Cross Tail Switch': '', // FIXME '交叉乱尾击'
        // 'Eight Star': '', // FIXME '八雷星'
        // 'Electrifying Witch Hunt': '', // FIXME '惊电魔女狩猎'
        // 'Electron Stream': '', // FIXME '电子流'
        // 'Electrope Edge': '', // FIXME '雷转质展开'
        // 'Electrope Transplant': '', // FIXME '雷转质移植'
        // 'Flame Slash': '', // FIXME '火焰斩'
        'Forked Fissures': '驚電裂隙',
        'Forked Lightning': '叉形閃電',
        // 'Four Star': '', // FIXME '四雷星'
        // 'Fulminous Field': '', // FIXME '雷电力场'
        'Impact': '衝擊',
        // 'Ion Cluster': '', // FIXME '离子簇'
        'Laceration': '斬擊',
        // 'Left Roll': '', // FIXME '左转'
        // 'Lightning Cage': '', // FIXME '电牢笼'
        // 'Lightning Vortex': '', // FIXME '电闪圆'
        // 'Midnight Sabbath': '', // FIXME '黑色安息日的午夜'
        'Mustard Bomb': '芥末炸彈',
        // 'Narrowing Witch Hunt': '', // FIXME '环圆式魔女狩猎'
        // 'Raining Swords': '', // FIXME '剑雨'
        // 'Right Roll': '', // FIXME '右转'
        // 'Sidewise Spark': '', // FIXME '侧方电火花'
        // 'Soulshock': '', // FIXME '灵魂震荡'
        // 'Stampeding Thunder': '', // FIXME '奔雷炮'
        // 'Sunrise Sabbath': '', // FIXME '黑色安息日的日出'
        // 'Switch of Tides': '', // FIXME '尖尾溅'
        // 'Sword Quiver': '', // FIXME '剑舞'
        // 'Tail Thrust': '', // FIXME '尖尾刺'
        // 'Thundering': '', // FIXME '电闪环'
        // 'Twilight Sabbath': '', // FIXME '黑色安息日的日落'
        // 'Wicked Blaze': '', // FIXME '狡诡炽焰'
        // 'Wicked Bolt': '', // FIXME '狡诡落雷'
        // 'Wicked Fire': '', // FIXME '狡诡火炎'
        // 'Wicked Flare': '', // FIXME '狡诡核爆'
        // 'Wicked Jolt': '', // FIXME '狡诡摇荡'
        // 'Wicked Spark': '', // FIXME '狡诡电火花'
        // 'Wicked Special': '', // FIXME '狡诡特技'
        // 'Wicked Thunder': '', // FIXME '狡雷'
        // 'Widening Witch Hunt': '', // FIXME '圆环式魔女狩猎'
        // 'Witchgleam': '', // FIXME '辉光电火花'
        'Wrath of Zeus': '宙斯之怒',
        // '\\(debuffs resolve\\)': '', // FIXME '(处理 Debuff)'
        // '\\(debuffs\\)': '', // FIXME '(Debuff)'
        // '\\(enrage\\)': '', // FIXME '(狂暴)'
        // '\\(first mines hit\\)': '', // FIXME '(第一轮魔方充能)'
        // '\\(first set\\)': '', // FIXME '(第一轮充能)'
        // '\\(first sparks detonate\\)': '', // FIXME '(第一轮火花引爆)'
        // '\\(first towers/cannons resolve\\)': '', // FIXME '(第一轮塔/炮)'
        // '\\(floor no more\\)': '', // FIXME '(地板消失)'
        // '\\(fourth set\\)': '', // FIXME '(第四轮充能)'
        // '\\(mines\\)': '', // FIXME '(魔方)'
        // '\\(players\\)': '', // FIXME '(玩家)'
        // '\\(puddles drop\\)': '', // FIXME '(放圈)'
        // '\\(second hit\\)': '', // FIXME '(第二击)'
        // '\\(second mines hit\\)': '', // FIXME '(第二轮魔方充能)'
        // '\\(second set\\)': '', // FIXME '(第二轮充能)'
        // '\\(second sparks detonate\\)': '', // FIXME '(第二轮火花引爆)'
        // '\\(second towers/cannons resolve\\)': '', // FIXME '(第二轮塔/炮)'
        // '\\(spread \\+ tethers\\)': '', // FIXME '(分散 + 连线)'
        // '\\(third mines hit\\)': '', // FIXME '(第三轮魔方充能)'
        // '\\(third set\\)': '', // FIXME '(第三轮充能)'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Electromine': '전기 지뢰',
        'Wicked Replica': '위키드 선더의 환영',
        'Wicked Thunder': '위키드 선더',
      },
      'replaceText': {
        '(?<! )Spark': '번갯불',
        '(?<! )Witch Hunt': '마녀사냥',
        'Azure Thunder': '청색 번개',
        'Bewitching Flight': '마녀의 비행',
        'Burst': '대폭발',
        'Cannonbolt': '낙뢰 대포',
        'Chain Lightning': '번개 사슬',
        'Conduction Point': '국지 번개',
        'Cross Tail Switch': '교차 꼬리 난격',
        'Eight Star': '여덟 개의 별',
        'Electrifying Witch Hunt': '마녀사냥: 뇌격',
        'Electron Stream': '전자류',
        'Electrope Edge': '일렉트로프 전개',
        'Electrope Transplant': '일렉트로프 이식',
        'Flame Slash': '화염 베기',
        'Forked Fissures': '번개 전류',
        'Forked Lightning': '갈래 번개',
        'Four Star': '네 개의 별',
        'Fulminous Field': '번개 필드',
        'Impact': '충격',
        'Ion Cluster': '이온 클러스터',
        'Laceration': '참격',
        'Left Roll': '좌회전',
        'Lightning Cage': '번개 감옥',
        'Lightning Vortex': '원형 번개',
        'Midnight Sabbath': '검은 안식일: 심야',
        'Mustard Bomb': '겨자 폭탄',
        'Narrowing Witch Hunt': '마녀사냥: 외내측',
        'Raining Swords': '검의 비',
        'Right Roll': '우회전',
        'Sidewise Spark': '측면 번갯불',
        'Soulshock': '영혼 충격',
        'Stampeding Thunder': '대포 집중 연사',
        'Sunrise Sabbath': '검은 안식일: 일출',
        'Switch of Tides': '물보라 꼬리',
        'Sword Quiver': '춤추는 검',
        'Tail Thrust': '꼬리 찌르기',
        'Thundering': '고리형 번개',
        'Twilight Sabbath': '검은 안식일: 일몰',
        'Wicked Blaze': '위키드 불꽃',
        'Wicked Bolt': '위키드 볼트',
        'Wicked Fire': '위키드 파이어',
        'Wicked Flare': '위키드 플레어',
        'Wicked Jolt': '위키드 졸트',
        'Wicked Spark': '위키드 번갯불',
        'Wicked Special': '위키드 스페셜',
        'Wicked Thunder': '위키드 선더',
        'Widening Witch Hunt': '마녀사냥: 내외측',
        'Witchgleam': '번갯불 광선',
        'Wrath of Zeus': '제우스의 분노',
        '\\(debuffs resolve\\)': '(디버프 처리)',
        '\\(debuffs\\)': '(디버프)',
        '\\(enrage\\)': '(전멸기)',
        '\\(first mines hit\\)': '(지뢰 1타)',
        '\\(first set\\)': '(1타)',
        '\\(first sparks detonate\\)': '(1번째 폭발)',
        '\\(first towers/cannons resolve\\)': '(1번째 기둥/대포 처리)',
        '\\(floor no more\\)': '(바닥 사라짐)',
        '\\(fourth set\\)': '(4타)',
        '\\(mines\\)': '(지뢰)',
        '\\(players\\)': '(플레이어)',
        '\\(puddles drop\\)': '(장판 생성)',
        '\\(second hit\\)': '(2타)',
        '\\(second mines hit\\)': '(지뢰 2타)',
        '\\(second set\\)': '(2타)',
        '\\(second sparks detonate\\)': '(2번째 폭발)',
        '\\(second towers/cannons resolve\\)': '(2번째 기둥/대포 처리)',
        '\\(spread \\+ tethers\\)': '(산개 + 선)',
        '\\(third mines hit\\)': '(지뢰 3타)',
        '\\(third set\\)': '(3타)',
      },
    },
  ],
};

export default triggerSet;
