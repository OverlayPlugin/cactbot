import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import Util, { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// TODO: P2 Old AAAABBBB plan was found at https://raidplan.io/plan/kj2d734d36es2ugs, would like to find replacement
// TODO: Earlier phase tracking for P5 (counting the jumps to middle?)

type Phase = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';
const phases: { [id: string]: Phase } = {
  'C24C': 'p2', // Ultimate Embrace, God Kefka
  'C3F7': 'p3', // Aero III Assault (from Kefka), Chaos and Exdeath
  'C2DC': 'p4', // Kefka Says, Kefka with Chaos and Neo Exdeath
  'BB40': 'p5', // Ultima Repeater, Ultima Kefka
};

const centerX = 100;
const centerY = 100;

type forsakenHeadmarker = 'cone' | 'spread' | 'stack' | 'unknown';
type forsakenHeadmarkerMap = { [key: string]: forsakenHeadmarker };
const forsakenHeadmarkerIdToName: forsakenHeadmarkerMap = {
  '02CB': 'stack',
  '02CD': 'cone',
  '02CC': 'spread',
} as const;

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    teleportent: 'clockwise' | 'filipino' | 'none';
    forsaken: 'kroxy-rinon' | 'abba' | 'bowtie' | 'none';
  };
  // General
  phase: Phase | 'unknown';
  // Phase 1
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  gravenImageCount: number;
  blueTowerIds: string[];
  purpleTowerIds: string[];
  yellowTowerIds: string[];
  eyeTowerIds: string[];
  fakeEyeTowerIds: string[];
  gravenImageTether?:
    | 'pulse'
    | 'gravitas'
    | 'vitrophyre'
    | 'indulgent'
    | 'idyllic'
    | 'unknown';
  fireMarker?: string;
  isFireTrue?: boolean;
  isIceTrue?: boolean;
  isThunderTrue?: boolean;
  waveCannonTargets: string[];
  doubleTroubleTrapTargets: string[];
  myTelePortent1?: 'up' | 'down' | 'right' | 'left';
  myTelePortent2?: 'up' | 'down' | 'right' | 'left';
  isTowerLookAway?: boolean;
  // Phase 2
  pathOfLightCounter: number;
  pathOfLightStackPlayers: string[]; // Quick lookup/listing of players with stacks
  forsakenPlayerHeadmarkers: { [id: string]: forsakenHeadmarker }; // Quickly check player's headmarker
  isForsakenGroupA: boolean; // Quick lookup for group check
  forsakenGroupA: string[]; // List of players in Group A
  forsakenGroupB: string[]; // List of players in Group B
  trineDirNums: number[];
  middleTrineFacing?: 'east' | 'west';
  // Phase 4
  grandCrossCount: number;
  shortShriekPlayers: string[];
  longShriekPlayers: string[];
  shortForkedPlayers: string[];
  longForkedPlayers: string[];
  shortCompressedPlayers: string[];
  longCompressedPlayers: string[];
  shortBombPlayers: string[];
  longBombPlayers: string[];
  areFirstDebuffsTrue?: boolean;
  isEntropyTrue?: boolean;
  areSecondDebuffsTrue?: boolean;
  isDynamicFluidTrue?: boolean;
  deathOrField?: 'death' | 'field';
  wound?: 'white' | 'black';
  isThunderChargedTrue?: boolean;
  isBlizzardChargedTrue?: boolean;
}

const headMarkerData = {
  // Phase 1 Boss
  'fakeFire': '02A1',
  'trueFire': '02A2',
  'fakeIce': '02A3',
  'trueIce': '02A4',
  'fakeThunder': '02A5',
  'trueThunder': '02A6',
  // Phase 1 Players
  'tankbuster': '00DA', // Revolting Ruin III tankbuster
  'dorito': '007F', // spread (real) or stack (fake)
  'stack': '0080', // spread (fake) or stack (real)
  // Phase 1 Tethers
  'imageTether': '002D',
  // Phase 2
  'sharedBuster': '0103', // Ultimate Embrace shared tankbuster
  'stackPath': '02CB', // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
  'conePath': '02CD', // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
  'spreadPath': '02CC', // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
} as const;

const mysteryMagicOutputStrings: OutputStrings = {
  puddle: {
    en: 'Bait Puddle',
    de: 'Fläche ködern',
    fr: 'Déposez',
    ja: 'AOE誘導',
    cn: '诱导AOE',
    ko: '장판 유도',
    tc: '誘導AOE',
  },
  spread: Outputs.spread,
  middle: Outputs.goIntoMiddle,
  stack: {
    en: 'Stack',
    de: 'Stacken',
    fr: 'Packez-vous',
    ja: 'スタック',
    cn: '分摊',
    ko: '쉐어',
    tc: '集合',
  },
  trueThunder: {
    en: 'Avoid Tell',
    cn: '躲避直线',
    ko: '예고 피하기',
  },
  fakeThunder: {
    en: 'In Line',
    cn: '进入直线',
    ko: '직선 안으로',
  },
  trueIce: {
    en: 'Avoid Tell',
    cn: '躲避扇形',
    ko: '예고 피하기',
  },
  fakeIce: {
    en: 'In Cone',
    cn: '进入扇形',
    ko: '부채꼴 안으로',
  },
  trueIcePuddle: {
    en: '${mech1} + ${mech2} => ${mech3}',
    cn: '${mech1} + ${mech2} => ${mech3}',
    ko: '${mech1} + ${mech2} => ${mech3}',
  },
  fakeIcePuddle: {
    en: '${mech1} + ${mech2} => ${mech3}',
    cn: '${mech1} + ${mech2} => ${mech3}',
    ko: '${mech1} + ${mech2} => ${mech3}',
  },
  stackTrueIce: {
    en: '${mech} + ${ice}',
    cn: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  stackFakeIce: {
    en: '${mech} + ${ice}',
    cn: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  spreadTrueIce: {
    en: '${mech} + ${ice}',
    cn: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  spreadFakeIce: {
    en: '${mech} + ${ice}',
    cn: '${mech} + ${ice}',
    ko: '${mech} + ${ice}',
  },
  trueIceTrueThunder: {
    en: 'Avoid Tells',
    cn: '躲避扇形+直线',
    ko: '예고 다 피하기',
  },
  fakeIceTrueThunder: {
    en: 'Cone (only)',
    cn: '仅扇形',
    ko: '부채꼴만',
  },
  trueIceFakeThunder: {
    en: 'Line (only)',
    cn: '仅直线',
    ko: '직선만',
  },
  fakeIceFakeThunder: {
    en: 'Cone + Line',
    cn: '扇形+直线',
    ko: '부채꼴 + 직선',
  },
  stackTrueThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    cn: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  stackFakeThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    cn: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  spreadTrueThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    cn: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  spreadFakeThunderLook: {
    en: '${mech} + ${thunder} + ${look}',
    cn: '${mech} + ${thunder} + ${look}',
    ko: '${mech} + ${thunder} + ${look}',
  },
  stackTrueThunder: {
    en: '${mech} + ${thunder}',
    cn: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  stackFakeThunder: {
    en: '${mech} + ${thunder}',
    cn: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  spreadTrueThunder: {
    en: '${mech} + ${thunder}',
    cn: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  spreadFakeThunder: {
    en: '${mech} + ${thunder}',
    cn: '${mech} + ${thunder}',
    ko: '${mech} + ${thunder}',
  },
  lookAway: {
    en: 'Look Away From Statue',
    de: 'Von Statue wegschauen',
    fr: 'Ne regardez pas la statue',
    ja: '塔を見ない！',
    cn: '背对神像',
    ko: '시선 피하기',
    tc: '背對神像',
  },
  lookAt: {
    en: 'Look At Statue',
    de: 'Statue anschauen',
    fr: 'Regardez la statue',
    ja: '像を見る！',
    cn: '面对神像',
    ko: '시선 바라보기',
    tc: '面對神像',
  },
};

const trapOutputStrings: OutputStrings = {
  you: {
    en: 'YOU',
    cn: '你',
    ko: '나',
  },
  knockbackFrom1: {
    en: 'Knockback from ${players}',
    cn: '被${players}击退',
    ko: '${players}에서 넉백',
  },
  knockbackFrom2: {
    en: 'Knockback from ${players}',
    cn: '被${players}击退',
    ko: '${players}에서 넉백',
  },
  knockbackFrom3: {
    en: 'Knockback from ${players} => Debuffs',
    cn: '被${players}击退 => Debuff',
    ko: '${players}에서 넉백 => 디버프',
  },
  knockbackFrom3Sleep: {
    en: 'Knockback from ${players} => Sleep',
    cn: '被${players}击退 => 睡眠',
    ko: '${players}에서 넉백 => 수면',
  },
  knockbackFrom3Confuse: {
    en: 'Knockback from ${players} => Confuse',
    cn: '被${players}击退 => 混乱',
    ko: '${players}에서 넉백 => 혼란',
  },
  knockbackFromLater: {
    en: 'Knockback from ${players} (later)',
    cn: '被${players}击退 (稍后)',
    ko: '${players}에서 넉백 (나중에)',
  },
};

// Get Partner's HeadMarker following HTMR Priority
// Requires data and Forsaken Group
// Will return the forsaken headmarker of partner:
// Tanks + Healers are partners
// Melee DPS + Range/Caster are Partners
// Tanks look for healer as they are left unless healer has it
// Melee DPS look for the Range/Caster as they are left if ranged has it
// Range/Caster looks for existence of a Melee DPS in case there is fake melee
const getHTMRPartnerMarker = (
  data: Data,
  group: string[],
): forsakenHeadmarker => {
  // Healer role should not be parsed with this function
  // as they have highest priority left
  if (data.role === 'healer')
    return 'unknown';

  // Functions for determining party member DPS subroles
  const isRangedDPS = (
    x: string,
  ): boolean => {
    const jobName = data.party.jobName(x);
    if (jobName === undefined)
      return false;
    return Util.isRangedDpsJob(jobName) || Util.isCasterDpsJob(jobName);
  };
  const isMeleeDPS = (
    x: string,
  ): boolean => {
    const jobName = data.party.jobName(x);
    if (jobName === undefined)
      return false;
    return Util.isMeleeDpsJob(jobName);
  };
  // Function to dynamically determine which role to check
  const getRoleFunction = (
    role: string,
  ): (name: string) => boolean => {
    // Only a healer will supercede the tank
    if (role === 'tank')
      return data.party.isHealer.bind(data.party);
    if (Util.isMeleeDpsJob(data.job))
      return isRangedDPS;
    // If we find a melee in our group we are the ranged priority
    // Partner should be a melee dps, for optimal comp
    return isMeleeDPS;
  };
  const playerHeadmarkers = data.forsakenPlayerHeadmarkers;

  // Check each player in the group if they are our partner
  const isMyPartner = getRoleFunction(data.role);
  const member1 = group[0] ?? '';
  const member2 = group[1] ?? '';
  const member3 = group[2] ?? '';
  const partner = isMyPartner(member1)
    ? member1
    : isMyPartner(member2)
    ? member2
    : isMyPartner(member3)
    ? member3
    : 'unknown';

  // Return partner's marker
  return playerHeadmarkers[partner ?? 0] ?? 'unknown';
};

const forsakenOutputStrings: OutputStrings = {
  spreadBowtie: Outputs.spread,
  tower: Outputs.getTowers,
  leftTower: {
    en: 'Left Tower',
    cn: '踩左塔',
    ko: '왼쪽 탑',
  },
  rightTower: {
    en: 'Right Tower',
    cn: '踩右塔',
    ko: '오른쪽 탑',
  },
  towerOrBeNear: { // Used in even towers with no strategy
    en: '${tower} / ${near}',
    cn: '${tower} / ${near}',
    ko: '${tower} / ${near}',
  },
  avoid: {
    en: 'Avoid towers',
    de: 'Türme vermeiden',
    fr: 'Évitez les tours',
    ja: '塔回避',
    cn: '远离塔',
    ko: '탑 피하기',
    tc: '遠離塔',
  },
  outOfHitbox: Outputs.outOfHitbox,
  innerHitbox: {
    en: 'Inner Hitbox',
    cn: '目标圈内环',
    ko: '안쪽 히트박스',
  },
  outerHitbox: {
    en: 'Outer Hitbox',
    cn: '目标圈外环',
    ko: '바깥쪽 히트박스',
  },
  cone: {
    en: 'Cone on YOU',
    cn: '扇形点名',
    ko: '나에게 부채꼴',
  },
  spread: {
    en: 'Spread on YOU',
    cn: '分散点名',
    ko: '나에게 산개징',
  },
  stack: Outputs.stackOnYou,
  num: {
    en: '${num}: ',
    de: '${num}: ',
    fr: '${num}: ',
    ja: '${num}: ',
    cn: '${num}: ',
    ko: '${num}: ',
    tc: '${num}: ',
  },
  you: {
    en: 'YOU',
    cn: '你',
    ko: '나',
  },
  beNear: {
    en: 'Be Near',
    de: 'Sei Nahe',
    cn: '站近',
    ko: '가까이 있기',
  },
  beFar: {
    en: 'Be Far',
    de: 'Sei Fern',
    cn: '站远',
    ko: '멀리 있기',
  },
  stackOnYou: Outputs.stackOnYou,
  stackOnYouLocation: { // Used only in first tower
    en: '${stack} ${location}',
    cn: '${stack} ${location}',
    ko: '${stack} ${location}',
  },
  stackOnPlayer: { // Used only in first tower (role-based)
    en: 'Stack is on ${player}',
    cn: '分摊点${player}',
    ko: '${player}에게 쉐어',
  },
  stacksOnPlayers: {
    en: 'Stacks on ${players}',
    cn: '分摊点${players}',
    ko: '${players}에게 쉐어',
  },
  stacksOnPlayersTower: { // Used after first tower for when partner couldn't be found or none config
    en: '${num}${stack} + ${tower}',
    cn: '${num}${stack} + ${tower}',
    ko: '${num}${stack} + ${tower}',
  },
  stackOnYouTower: { // Used in first tower only
    en: '${num}${tower} + ${marker}',
    cn: '${num}${tower} + ${marker}',
    ko: '${num}${tower} + ${marker}',
  },
  markerOnYouStacksOnPlayers: { // Used only for first tower
    en: '${num}${marker} + ${stacks}',
    cn: '${num}${marker} + ${stacks}',
    ko: '${num}${marker} + ${stacks}',
  },
  markerOnYouTowerOdds: { // Used for Odd Towers (excluding first set)
    en: '${num}${marker} + ${tower} + ${nearfar}',
    cn: '${num}${marker} + ${tower} + ${nearfar}',
    ko: '${num}${marker} + ${tower} + ${nearfar}',
  },
  markerOnYouTowerEvens: { // Used for Cones + Spreads (no stacks taking the towers)
    en: '${num}${marker} + ${tower} + ${nearfar}',
    cn: '${num}${marker} + ${tower} + ${nearfar}',
    ko: '${num}${marker} + ${tower} + ${nearfar}',
  },
  baitLeftConeOutOdds: {
    en: '${num}Bait Left Cone Out',
    cn: '${num}左扇形向外引导',
    ko: '${num}왼쪽 부채꼴 바깥으로 유도',
  },
  baitLeftConeLeftEvens: {
    en: '${num}Bait Left Cone Left',
    cn: '${num}左扇形向左引导',
    ko: '${num}왼쪽 부채꼴 왼쪽으로 유도',
  },
  leftStack: {
    en: '${num}Left Stack',
    cn: '${num}左分摊',
    ko: '${num}왼쪽 쉐어',
  },
  rightStack: {
    en: '${num}Right Stack',
    cn: '${num}右分摊',
    ko: '${num}오른쪽 쉐어',
  },
  bait: {
    en: '${num}Bait Cone Right or Clone Near',
    cn: '${num}向右引导扇形或靠近分身',
    ko: '${num}오른쪽 부채꼴 유도 또는 분신 유도',
  },
  baitConeFromPlayer: {
    en: 'Bait Cone from ${player}',
    cn: '引导${player}的扇形',
    ko: '${player}의 부채꼴 유도',
  },
  spreadWithPlayer: {
    en: 'Spread with ${player}',
    cn: '与${player}分散',
    ko: '${player}와 산개',
  },
  baitCloneOppositeTowers: {
    en: '${num}Bait Clone Opposite Towers Near',
    cn: '${num}靠近引导塔对面分身',
    ko: '${num}탑 반대쪽에서 분신 가까이 유도',
  },
  mechsBowtie: {
    en: '${num}${mech1} + ${mech2}',
    cn: '${num}${mech1} + ${mech2}',
    ko: '${num}${mech1} + ${mech2}',
  },
  mechs3Bowtie: {
    en: '${num}${mech1} + ${mech2} + ${mech3}',
    cn: '${num}${mech1} + ${mech2} + ${mech3}',
    ko: '${num}${mech1} + ${mech2} + ${mech3}',
  },
  numBeNearSpreadBowtie: {
    en: '${num}${near} + ${spread}',
    cn: '${num}${near} + ${spread}',
    ko: '${num}${near} + ${spread}',
  },
  baitLeftConeOutBowtie: {
    en: '${num}Bait Left Cone Out',
    cn: '${num}左扇形向外引导',
    ko: '${num}왼쪽 부채꼴 바깥으로 유도',
  },
  baitLeftConeLeftBowtie: {
    en: '${num}Bait Left Cone Left',
    cn: '${num}左扇形向左引导',
    ko: '${num}왼쪽 부채꼴 왼쪽으로 유도',
  },
  getHitBySpreadRightBowtie: { // Used only in 5th tower for AAAABBBB
    en: '${num}Get Right + Hit by Spread',
    cn: '${num}向右+吃分散',
    ko: '${num}오른쪽으로 + 산개징 맞기',
  },
  spreadTowersBowtie: { // Used only in last tower for AAAABBBB
    en: '${num}${tower} + ${spread}',
    cn: '${num}${tower} + ${spread}',
    ko: '${num}${tower} + ${spread}',
  },
  markerOnYouNoStrategy: { // Odd Towers
    en: '${num}${marker}',
    cn: '${num}${marker}',
    ko: '${num}${marker}',
  },
  mechsNoStrategy: {
    en: '${num}${marker} + ${mechs}',
    cn: '${num}${marker} + ${mechs}',
    ko: '${num}${marker} + ${mechs}',
  },
  baitNoStrategy: { // No marker and no strategy was selected
    en: '${num}Bait Cone or Clone Near',
    cn: '${num}引导扇形或靠近分身',
    ko: '${num}부채꼴 유도 또는 분신 유도',
  },
  baitConeOrStackNoStrategy: {
    en: '${num}Bait Cone or Stack',
    cn: '${num}引导扇形或分摊',
    ko: '${num}부채꼴 유도 또는 쉐어',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  config: [
    {
      id: 'teleportent',
      comment: {
        en:
          `Outputs up to 12 locations to drop first arrow. Second call will be relative to first<br />
          Clockwise: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Filipino Box: <a href="https://raidplan.io/plan/5rf2uhud5ztsbud5" target="_blank">Raidplan</a><br />`,
        cn: `输出最多12个首个箭头放置的位置。第二次将相对于首个位置播报<br />
          顺时针: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Filipino Box: <a href="https://raidplan.io/plan/5rf2uhud5ztsbud5" target="_blank">Raidplan</a><br />`,
        ko: `최대 12곳의 후보 장소 중에서 첫 번째 화살표를 설치할 위치를 알립니다. 두 번째 호출은 첫 번째 위치를 기준으로 합니다.<br />
          시계 방향: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Filipino Box: <a href="https://raidplan.io/plan/5rf2uhud5ztsbud5" target="_blank">Raidplan</a><br />`,
      },
      name: {
        en: 'P1 Graven Image 3 Tele-Portent Strategy',
        cn: 'P1众神之像3传送策略',
        ko: '1페이즈 신들의 상 3 텔레포 전략',
      },
      type: 'select',
      options: {
        en: {
          'Clockwise Big Box': 'clockwise',
          'Filipino Box (Intercardinals)': 'filipino',
          'Call Debuffs only': 'none',
        },
        cn: {
          '顺时针大圈': 'clockwise',
          'Filipino Box (对角)': 'filipino',
          '仅报Debuff': 'none',
        },
        ko: {
          '시계 방향 큰 네모': 'clockwise',
          'Filipino Box (대각선)': 'filipino',
          '디버프만 알림': 'none',
        },
      },
      default: 'none',
    },
    {
      id: 'forsaken',
      comment: {
        en: `There should be two groups of four players, choose tower soak order<br />
          Kroxy-Rinon 3/4/1: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          Modified ABBA: <a href="https://raidplan.io/plan/b5tgewax4kb746sf" target="_blank">Raidplan</a><br />
          Bowtie AAAABBBB 4/4: Using same priority as the kroxy-rinon. (Will require Tank LB3)<br />
          Default will be Cones + Support Stack Left and Spread + DPS Stack Right, relative towers to facing in`,
        cn: `玩家分为两个四人小组，选择踩塔顺序<br />
          Kroxy-Rinon 3/4/1: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          改良 ABBA: <a href="https://raidplan.io/plan/b5tgewax4kb746sf" target="_blank">Raidplan</a><br />
          Bowtie AAAABBBB 4/4: 使用与kroxy-rinon相同的优先级(需要坦克 LB3)<br />
          默认设置为:扇形+支援职业分摊左塔,分散+DPS 分摊右塔(相对塔面向内)`,
        ko: `4명씩 두 그룹으로 나눠 순서를 정해 탑을 처리합니다.<br />
          Kroxy-Rinon 3/4/1: <a href="https://pastebin.com/7fs57PyQ" target="_blank">Kefka Bin</a><br />
          변형 ABBA: <a href="https://raidplan.io/plan/b5tgewax4kb746sf" target="_blank">Raidplan</a><br />
          Bowtie AAAABBBB 4/4: kroxy-rinon과 같은 우선순위를 사용합니다. (3단 탱리밋 필요)<br />
          기본값은 바라보는 방향 기준으로 부채꼴 + 탱힐 쉐어 왼쪽, 산개 + 딜러 쉐어 오른쪽입니다.`,
      },
      name: {
        en: 'P2 Forsaken Strategy',
        cn: 'P2遗弃末世策略',
        ko: '2페이즈 행방불명 전략',
      },
      type: 'select',
      options: {
        en: {
          'AAABBBBA (3/4/1), Kroxy-Rinon': 'kroxy-rinon',
          'ABBAABBA (1/2/2/2/1), Modified': 'abba',
          'AAAABBBB (4/4), Bowtie': 'bowtie',
          'Generic Calls': 'none',
        },
        cn: {
          'AAABBBBA (3/4/1), Kroxy-Rinon': 'kroxy-rinon',
          'ABBAABBA (1/2/2/2/1), 改良': 'abba',
          'AAAABBBB (4/4), Bowtie': 'bowtie',
          '通用报点': 'none',
        },
        ko: {
          'AAABBBBA (3/4/1), Kroxy-Rinon': 'kroxy-rinon',
          'ABBAABBA (1/2/2/2/1), 변형': 'abba',
          'AAAABBBB (4/4), Bowtie': 'bowtie',
          '기본값': 'none',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'dancing_mad.txt',
  initData: () => {
    return {
      phase: 'p1',
      // Phase 1
      actorPositions: {},
      gravenImageCount: 0,
      blueTowerIds: [],
      purpleTowerIds: [],
      yellowTowerIds: [],
      eyeTowerIds: [],
      fakeEyeTowerIds: [],
      waveCannonTargets: [],
      doubleTroubleTrapTargets: [],
      // Phase 2
      pathOfLightCounter: 1,
      pathOfLightStackPlayers: [],
      forsakenPlayerHeadmarkers: {},
      isForsakenGroupA: false,
      forsakenGroupA: [],
      forsakenGroupB: [],
      trineDirNums: [],
      // Phase 4
      grandCrossCount: 0,
      shortShriekPlayers: [],
      longShriekPlayers: [],
      shortForkedPlayers: [],
      longForkedPlayers: [],
      shortCompressedPlayers: [],
      longCompressedPlayers: [],
      shortBombPlayers: [],
      longBombPlayers: [],
    };
  },
  triggers: [
    {
      id: 'DMU Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phases) },
      run: (data, matches) => data.phase = phases[matches.id] ?? 'unknown',
    },
    {
      id: 'DMU ActorSetPos Tracker',
      // Only in use for P1 Graven Image tethers
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'DMU P1 Revolting Ruin III',
      // Tankbuster targets highest enmity then second highest enmity
      // A tank swap can happen to have MT take both hits
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      alertText: (data, matches, output) => {
        const target = matches.target;
        if (target === data.me)
          return output.cleaveOnYou!();

        if (data.role === 'tank')
          return output.cleaveSwap!({
            player: data.party.member(target),
          });

        if (data.role === 'healer')
          return output.cleaveOnPlayer!({
            player: data.party.member(target),
          });

        return output.avoidCleaves!();
      },
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleaves: Outputs.avoidTankCleaves,
        cleaveOnPlayer: {
          en: 'Tank Cleave on ${player}',
          cn: '坦克顺劈点${player}',
          ko: '${player}에게 광역 탱버',
        },
        cleaveSwap: { // Defaulting to same output as cleaveOnPlayer
          en: 'Tank Cleave on ${player}',
          cn: '坦克顺劈点${player}',
          ko: '${player}에게 광역 탱버',
        },
      },
    },
    {
      id: 'DMU P1 Graven Image Counter',
      // Used for timing of tether triggers
      type: 'StartsUsing',
      netRegex: { id: 'BCF2', source: 'Kefka', capture: false },
      run: (data) => data.gravenImageCount = data.gravenImageCount + 1,
    },
    {
      id: 'DMU P1 Graven Image Tether Collect',
      // 271 ActorSetPos lines indicate where the tether is coming from
      // 261 CombatantMemory lines may also indicate this
      // Graven Image 1:
      // (100, 56, 18.5) Center Tether, Will be target of BAA9 Pulse Wave (knockback)
      // Graven Image 2:
      // (102.5, 27, 22.5) Center Tether, Will be target of BAAC Gravitas (puddles)
      // (126, 41.5, 7) Right Tether, Will be target of BAB0 Vitrophyre (rocks)
      // Graven Image 3:
      // (95, 25, 27) Left Tether, Will be target of BAB5 Indulgent Will which causes 503 Confused
      // (107, 43, 8.5) Right tether, Will be target of BAB6 Idyllic Will which causes 131E Sleep
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.1, // Actor position data can come after tether in log
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          data.gravenImageTether = 'unknown';
          return;
        }

        const x = actor.x;
        // Graven Image 1: Pulse Wave target
        if (x < 101 && x > 99)
          data.gravenImageTether = 'pulse';
        else if (x < 103 && x > 101) // Graven Image 2: Gravitas target
          data.gravenImageTether = 'gravitas';
        else if (x > 125) // Graven Image 2: Vitrophyre target
          data.gravenImageTether = 'vitrophyre';
        else if (x < 100) // Graven Image 3: Indulgent Will target
          data.gravenImageTether = 'indulgent';
        else if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          data.gravenImageTether = 'idyllic';
        else
          data.gravenImageTether = 'unknown';
      },
    },
    {
      id: 'DMU P1 Pulse Wave Tethers',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 1;
      },
      delaySeconds: 0.1, // Actor position data can come after tether in log
      durationSeconds: 7,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        // Graven Image 1: Pulse Wave target
        if (x < 101 && x > 99)
          return output.pulse!();
        return output.tetherOnYou!();
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        pulse: Outputs.knockback, // Cannot be immuned, happens within 6s of tether
      },
    },
    {
      id: 'DMU P1 Mystery Magic Collect',
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['trueFire'],
          headMarkerData['trueIce'],
          headMarkerData['trueThunder'],
          headMarkerData['fakeFire'],
          headMarkerData['fakeIce'],
          headMarkerData['fakeThunder'],
        ],
        capture: true,
      },
      run: (data, matches) => {
        switch (matches.id) {
          case headMarkerData['trueFire']:
            data.isFireTrue = true;
            return;
          case headMarkerData['fakeFire']:
            data.isFireTrue = false;
            return;
          case headMarkerData['trueIce']:
            data.isIceTrue = true;
            return;
          case headMarkerData['fakeIce']:
            data.isIceTrue = false;
            return;
          case headMarkerData['trueThunder']:
            data.isThunderTrue = true;
            return;
          case headMarkerData['fakeThunder']:
            data.isThunderTrue = false;
            return;
        }
      },
    },
    {
      id: 'DMU P1 Fire Head Marker Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData['dorito'], headMarkerData['stack']], capture: true },
      suppressSeconds: 2,
      run: (data, matches) => data.fireMarker = matches.id,
    },
    {
      id: 'DMU P1 Mystery Magic Ice and Fire',
      // Set 1: Only Ice and Fire should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isFireTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isIceTrue
            ? output.spreadTrueIce!({ mech: output.spread!(), ice: output.trueIce!() })
            : output.spreadFakeIce!({ mech: output.spread!(), ice: output.fakeIce!() });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isIceTrue
            ? output.stackTrueIce!({ mech: output.stack!(), ice: output.trueIce!() })
            : output.stackFakeIce!({ mech: output.stack!(), ice: output.fakeIce!() });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Graven Image Tether Cleanup',
      // Clear on Ability:
      // BAA9 Pulse Wave
      // BAAC Gravitas
      // BAB0 vitrophyre
      // BAB5 Indulgent Will
      // BAB6 Idyllic Will
      type: 'Ability',
      netRegex: {
        id: ['BAA9', 'BAAC', 'BAB0', 'BAB5', 'BAB6'],
        source: 'Graven Image',
        capture: true,
      },
      suppressSeconds: 1,
      run: (data, matches) => {
        // Player could die and this ability then not target them
        // Need intelligent way to remove once related ability has executed
        // Clear data if ability matches our tether
        const abilityMap = {
          'pulse': 'BAAC',
          'gravitas': 'BAA9',
          'vitrophyre': 'BAB0',
          'indulgent': 'BAB5',
          'idyllic': 'BAB6',
          'unknown': 'unknown',
        };
        const tether = data.gravenImageTether ?? 'unknown';
        const tetherAbilityId = abilityMap[tether];
        if (tetherAbilityId === matches.id || tether === 'unknown')
          delete data.gravenImageTether;
      },
    },
    {
      id: 'DMU P1 Graven Image Collect',
      // Tower entity actions
      // The CombatantMemory Add lines are added prior to combat
      // OverlayPlugin can retrieve the matching BNpcID
      // However, these entities seem to always spawn in the same order and the
      // first tower is the highest ID and the towers are in sequential order
      // These are the BNpcID values:
      // 1EBFBB (2015163) => Wave Cannon entity (blue)
      // 1EBFBC (2015164) => Gravitational Wave entity (purple)
      // 1EBFBD (2015165) => Intemperate Will entity (yellow)
      // 1EBFBE (2015166) => Indolent Will entity (eye)
      // 1EBFBF (2015167) => Ave Maria entity (fake eye)
      // There are two of each, they are added at start of fight
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      preRun: (data, matches) => {
        const id = parseInt(matches.id, 16);
        const blueTowers = [id, id - 1]; // First tower is blue and highest ID
        const purpleTowers = [id - 2, id - 4]; // Next are in pair with yellow
        const yellowTowers = [id - 3, id - 5];
        const eyeTowers = [id - 7, id - 9]; // Next are in paire with fake
        const fakeEyeTowers = [id - 6, id - 8];

        const toStringId = (id: number): string => {
          return id.toString(16).toUpperCase();
        };
        data.blueTowerIds = blueTowers.map((id) => toStringId(id));
        data.purpleTowerIds = purpleTowers.map((id) => toStringId(id));
        data.yellowTowerIds = yellowTowers.map((id) => toStringId(id));
        data.eyeTowerIds = eyeTowers.map((id) => toStringId(id));
        data.fakeEyeTowerIds = fakeEyeTowers.map((id) => toStringId(id));
      },
      suppressSeconds: 99999,
    },
    {
      id: 'DMU P1 Wave Cannon',
      // BAA8 Wave Cannon is an instant cast from Graven Image
      // This gives a ~5 second warning to spread
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: false },
      suppressSeconds: 99999, // First instance is a blue tower
      alertText: (_data, _matches, output) => output.waveCannonLine!(),
      outputStrings: {
        waveCannonLine: {
          en: 'E/W Spread',
          cn: '左/右分散',
          ko: '동/서 산개',
        },
      },
    },
    {
      id: 'DMU P1 Wave Cannon Collect',
      // Collect players hit by Wave Cannon to tell who soaks tower followup and who avoids tower
      type: 'Ability',
      netRegex: { id: 'BAA8', source: 'Graven Image', capture: true },
      run: (data, matches) => data.waveCannonTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Double-trouble Trap Collect',
      // Times are 5s, 68s, and 49s
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => data.doubleTroubleTrapTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Wave Cannon Explosion Towers',
      // Wave Cannon gives a vulnerability which causes death to BAAA Explosion soaks
      // Sacraficing a player who clipped to prevent party 90% damage down from
      // BAAB Unmitigated Explosion seems ideal, although different clients may
      // get different order
      // Suprisingly the Unmitigated Explosion doesn't deal damage
      // Players have ~4s to soak the tower
      type: 'Ability',
      netRegex: { id: 'BAA8', source: 'Graven Image', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          getTowers: Outputs.getTowers,
          avoid: {
            en: 'Avoid towers',
            de: 'Türme vermeiden',
            fr: 'Évitez les tours',
            ja: '塔回避',
            cn: '远离塔',
            ko: '탑 피하기',
            tc: '遠離塔',
          },
          extra: {
            en: 'Extra Tower',
            cn: '额外塔',
            ko: '남는 탑',
          },
        };
        const avoidedCannon = data.waveCannonTargets.indexOf(data.me) !== -1;

        // Option for player to soak the tower for p1 prog?
        if (avoidedCannon && data.waveCannonTargets.length > 4)
          return { infoText: output.extra!() };

        // Avoid the tower
        if (avoidedCannon)
          return { alertText: output.avoid!() };

        // Player didn't get hit, they will need to soak a tower
        return { alertText: output.getTowers!() };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Knockback',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3.9, // First one needs 0.1 delay for collect
      durationSeconds: 3.9,
      suppressSeconds: 1,
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

        // If players died before the duration ended
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const severity = data.doubleTroubleTrapTargets.includes(data.me) ? 'alertText' : 'infoText';
        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        const duration = parseFloat(matches.duration);
        if (duration < 6)
          return { [severity]: output.knockbackFrom1!({ players: msg }) };
        if (duration > 67)
          return { [severity]: output.knockbackFrom2!({ players: msg }) };

        if (data.gravenImageTether === 'idyllic')
          return { [severity]: output.knockbackFrom3Sleep!({ players: msg }) };
        if (data.gravenImageTether === 'indulgent')
          return { [severity]: output.knockbackFrom3Confuse!({ players: msg }) };
        return { [severity]: output.knockbackFrom3!({ players: msg }) };
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Cleanup',
      // Players dying will also trigger this
      type: 'LosesEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => {
        data.doubleTroubleTrapTargets = data.doubleTroubleTrapTargets.filter(
          (target) => target !== matches.target,
        );
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 2 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.3, // Time between debuff and dying from the application
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set and third set
        if (parseFloat(matches.duration) < 67)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 and P4 Mystery Magic Ice and Thunder',
      // Set 2: Only Ice and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        if (data.isThunderTrue) {
          return data.isIceTrue
            ? output.trueIceTrueThunder!()
            : output.fakeIceTrueThunder!();
        }
        return data.isIceTrue
          ? output.trueIceFakeThunder!()
          : output.fakeIceFakeThunder!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Light of Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'DMU P1 Hyperdrive',
      // This hits three times
      // Occurs 3.1s after C622 Light of Judgment, which is a 5s cast
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2, // Result in ~5.1s warning
      response: Responses.tankBuster(),
    },
    {
      id: 'DMU P1 Mystery Magic Ice, and Gravitas and Vitrophyre Tethers 1',
      // Occurs between Graven Image Set 2 and Set 3
      // BA95 Blizzard III Blowout cast
      type: 'StartsUsing',
      netRegex: { id: 'BA95', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isIceTrue !== undefined &&
          data.isThunderTrue === undefined &&
          data.isFireTrue === undefined
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const hasVitrophyre = data.gravenImageTether === 'vitrophyre';
        return data.isIceTrue
          ? output.trueIcePuddle!({
            mech1: output.trueIce!(),
            mech2: output.puddle!(),
            mech3: hasVitrophyre ? output.spread!() : output.middle!(),
          })
          : output.fakeIcePuddle!({
            mech1: output.fakeIce!(),
            mech2: output.puddle!(),
            mech3: hasVitrophyre ? output.spread!() : output.middle!(),
          });
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Vitrophyre',
      // Trigger on BAAC Gravitas, ~4s to get away
      type: 'Ability',
      netRegex: { id: 'BAAC', source: 'Graven Image', capture: false },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.gravenImageTether === 'vitrophyre')
          return output.spread!();
        return output.avoidTethers!();
      },
      outputStrings: {
        avoidTethers: {
          en: 'Avoid Tethered Players',
          cn: '避开连线玩家',
          ko: '선 대상자 피하기',
        },
        spread: {
          en: 'Spread (avoid puddles)',
          cn: '分散(避开圈圈)',
          ko: '산개 (장판 피하기)',
        },
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap 3 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.3, // Time between debuff and dying from the application
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        // Only capture 3rd set
        if (duration < 48 || duration > 50)
          return;

        // Check if players died
        if (data.doubleTroubleTrapTargets.length === 0)
          return;

        const players = data.doubleTroubleTrapTargets.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');
        return output.knockbackFromLater!({ players: msg });
      },
      outputStrings: trapOutputStrings,
    },
    {
      id: 'DMU P1 Impertinent Will',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.yellowTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goWest!(),
      outputStrings: {
        goWest: Outputs.getLeftAndWest,
      },
    },
    {
      id: 'DMU P1 Gravitational Wave',
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.purpleTowerIds.includes(matches.id),
      alertText: (_data, _matches, output) => output.goEast!(),
      outputStrings: {
        goEast: Outputs.getRightAndEast,
      },
    },
    {
      id: 'DMU P1 Gravitas and Vitrophyre Tethers 2',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target &&
          data.isIceTrue !== undefined &&
          data.isThunderTrue === undefined &&
          data.isFireTrue === undefined;
      },
      delaySeconds: 2,
      durationSeconds: 6,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        if (x < 103 && x > 101) // Graven Image 2: Gravitas target
          return output.gravitas!({
            mech1: output.puddle!(),
            mech2: output.middle!(),
          });
        if (x > 125) // Graven Image 2: Vitrophyre target
          return output.vitrophyre!({
            mech1: output.puddle!(),
            mech2: output.spread!(),
          });
        return output.tetherOnYou!();
      },
      outputStrings: {
        puddle: {
          en: 'Bait Puddle',
          de: 'Fläche ködern',
          fr: 'Déposez',
          ja: 'AOE誘導',
          cn: '诱导AOE',
          ko: '장판 유도',
          tc: '誘導AOE',
        },
        middle: Outputs.goIntoMiddle,
        spread: Outputs.spread,
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        gravitas: {
          en: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
        vitrophyre: {
          en: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
      },
    },
    {
      id: 'DMU P1 Tele-Portent Collect',
      // Debuffs distributed to 8 players:
      // Players with 2 of the same are always:
      // 130F Left  (7s) + 130F Left  (10s)
      // 130E Right (7s) + 130E Right (10s)
      // 130D Down  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 130C Up    (10s)
      //
      // The remaining players may have differing patterns:
      // Pattern 1:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 13D8 Down  (7s) + 130E Right (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 2:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 13D7 Up    (7s) + 130F Left  (10s)
      //
      // Pattern 3:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 4:
      // 13DA Left  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 13D9 Right (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Possibly More?
      // Varying strategies to resolve
      // Players with the same arrows will get a 6s 503 Confused which causes them to target nearest players
      // Players with different arrows will cause a 6s 131E Sleep aoe
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        const effectMap: { [effectId: string]: typeof data.myTelePortent1 } = {
          '130C': 'up',
          '130D': 'down',
          '130E': 'right',
          '130F': 'left',
          '13D7': 'up',
          '13D8': 'down',
          '13D9': 'right',
          '13DA': 'left',
        };
        const duration = parseFloat(matches.duration);
        if (duration < 8) {
          data.myTelePortent1 = effectMap[matches.effectId];
          return;
        }
        data.myTelePortent2 = effectMap[matches.effectId];
      },
    },
    {
      id: 'DMU P1 Tele-Portents',
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        const tp1 = data.myTelePortent1;
        const tp2 = data.myTelePortent2;
        if (tp1 === undefined || tp2 === undefined)
          return;
        const portents = tp1 + tp2;

        if (data.triggerSetConfig.teleportent === 'clockwise') {
          // Relative to center of arena
          const dir1Map: { [tps: string]: typeof portents } = {
            'upup': 'west',
            'downdown': 'east',
            'rightright': 'north',
            'leftleft': 'south',
            'downleft': 'dirESE',
            'downright': 'northeast',
            'rightup': 'northwest',
            'rightdown': 'dirNNE',
            'leftup': 'dirSSW',
            'leftdown': 'southeast',
            'upright': 'dirWNW',
            'upleft': 'southwest',
          };
          // Relative to where player is
          const dir2Map: { [tps: string]: typeof portents } = {
            'upup': 'south',
            'downdown': 'north',
            'rightright': 'west',
            'leftleft': 'east',
            'downleft': 'south',
            'downright': 'west',
            'rightup': 'south',
            'rightdown': 'east',
            'leftup': 'west',
            'leftdown': 'north',
            'upright': 'north',
            'upleft': 'east',
          };
          const dir1 = dir1Map[portents];
          const dir2 = dir2Map[portents];

          return output.clockwise!({
            dir1: output[dir1 ?? 'unknown']!(),
            dir2: output[dir2 ?? 'unknown']!(),
          });
        }
        if (data.triggerSetConfig.teleportent === 'filipino') {
          const dir1Map: { [tps: string]: typeof portents } = {
            'upup': 'southeastOut',
            'downdown': 'northwestOut',
            'rightright': 'southwestOut',
            'leftleft': 'northeastOut',
            'downleft': 'dirWSW',
            'downright': 'southeastIn',
            'rightup': 'northeastIn',
            'rightdown': 'dirSSE',
            'leftup': 'dirNNW',
            'leftdown': 'southwestIn',
            'upright': 'dirENE',
            'upleft': 'northwestIn',
          };
          const dir2Map: { [tps: string]: typeof portents } = {
            'upup': 'north',
            'downdown': 'south',
            'rightright': 'east',
            'leftleft': 'west',
            'downleft': 'east',
            'downright': 'south',
            'rightup': 'east',
            'rightdown': 'north',
            'leftup': 'south',
            'leftdown': 'west',
            'upright': 'west',
            'upleft': 'north',
          };
          const dir1 = dir1Map[portents];
          const dir2 = dir2Map[portents];

          return output.filipino!({
            dir1: output[dir1 ?? 'unknown']!(),
            dir2: output[dir2 ?? 'unknown']!(),
          });
        }
        return output[portents]!();
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        north: Outputs.north,
        northeast: Outputs.northeast,
        east: Outputs.east,
        southeast: Outputs.southeast,
        south: Outputs.south,
        southwest: Outputs.southwest,
        west: Outputs.west,
        northwest: Outputs.northwest,
        upup: {
          en: 'Up Portents',
          cn: '上箭头',
          ko: '위쪽 화살표',
        },
        downdown: {
          en: 'Down Portents',
          cn: '下箭头',
          ko: '아래쪽 화살표',
        },
        rightright: {
          en: 'Right Portents',
          cn: '右箭头',
          ko: '오른쪽 화살표',
        },
        leftleft: {
          en: 'Left Portents',
          cn: '左箭头',
          ko: '왼쪽 화살표',
        },
        downleft: {
          en: 'Down => Left Portent',
          cn: '下 => 左箭头',
          ko: '아래 => 왼쪽 화살표',
        },
        downright: {
          en: 'Down => Right Portent',
          cn: '下 => 右箭头',
          ko: '아래 => 오른쪽 화살표',
        },
        rightup: {
          en: 'Right => Up Portent',
          cn: '右 => 上箭头',
          ko: '오른쪽 => 위 화살표',
        },
        rightdown: {
          en: 'Right => Down Portent',
          cn: '右 => 下箭头',
          ko: '오른쪽 => 아래 화살표',
        },
        leftup: {
          en: 'Left => Up Portent',
          cn: '左 => 上箭头',
          ko: '왼쪽 => 위 화살표',
        },
        leftdown: {
          en: 'Left => Down Portent',
          cn: '左 => 下箭头',
          ko: '왼쪽 => 아래 화살표',
        },
        upright: {
          en: 'Up => Right Portent',
          cn: '上 => 右箭头',
          ko: '위 => 오른쪽 화살표',
        },
        upleft: {
          en: 'Up => Left Portent',
          cn: '上 => 左箭头',
          ko: '위 => 왼쪽 화살표',
        },
        clockwise: {
          en: '${dir1} => ${dir2}',
          cn: '${dir1} => ${dir2}',
          ko: '${dir1} => ${dir2}',
        },
        filipino: {
          en: '${dir1} => ${dir2}',
          cn: '${dir1} => ${dir2}',
          ko: '${dir1} => ${dir2}',
        },
        southeastOut: { // upup for Filipino
          en: 'Southeast Out',
          cn: '右下外',
          ko: '남동쪽 밖',
        },
        northwestOut: { // downdown for Filipino
          en: 'Northwest Out',
          cn: '左上外',
          ko: '북서쪽 밖',
        },
        southwestOut: { // rightright for Filipino
          en: 'Southwest Out',
          cn: '左下外',
          ko: '남서쪽 밖',
        },
        northeastOut: { // leftleft for Filipino
          en: 'Northeast Out',
          cn: '右上外',
          ko: '북동쪽 밖',
        },
        southeastIn: { // downright for Filipino
          en: 'Southeast In',
          cn: '右下内',
          ko: '남동쪽 안',
        },
        northeastIn: { // rightup for Filipino
          en: 'Northeast In',
          cn: '右上内',
          ko: '북동쪽 안',
        },
        southwestIn: { // leftdown for Filipino
          en: 'Southwest In',
          cn: '左下内',
          ko: '남서쪽 안',
        },
        northwestIn: { // upleft for Filipino
          en: 'Northwest In',
          cn: '左上内',
          ko: '북서쪽 안',
        },
      },
    },
    {
      id: 'DMU P1 Tele-Portent 2',
      // Not enough time to have lengthy TTS, but could configure this to give direction instead of move
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: (data, matches) => {
        if (data.me === matches.target)
          if (data.myTelePortent1 !== undefined)
            return true;
        return false;
      },
      durationSeconds: 3,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'DMU P1 Tele-Portent Cleanup',
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      run: (data) => {
        delete data.myTelePortent1;
        delete data.myTelePortent2;
      },
    },
    {
      id: 'DMU P1 Indulgent Will and Idyllic Will Tethers (Early)',
      // There is 9.6s (not including 0.1s delay) until 503 Confuse or 131E
      // Sleep Applied. Corresponding Abilities are at ~9s (not including 0.1s delay)
      // Double-trouble Trap TTS comes out ~1s prior to the tethers
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 3;
      },
      delaySeconds: 0.1, // Delay for collect of tower type
      durationSeconds: 5.5, // Time until reminder
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        if (x < 100) // Graven Image 3: Indulgent Will target
          return output.indulgent!();
        if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          return output.idyllic!();
        return output.tetherOnYou!();
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        indulgent: {
          en: 'Confuse Tether on YOU',
          cn: '混乱连线点名',
          ko: '혼란 선 대상자',
        },
        idyllic: {
          en: 'Sleep Tether on YOU',
          cn: '睡眠连线点名',
          ko: '수면 선 대상자',
        },
      },
    },
    {
      id: 'DMU P1 Indulgent Will and Idyllic Will Tethers Reminder',
      type: 'Tether',
      netRegex: { id: headMarkerData['imageTether'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.gravenImageCount === 3;
      },
      delaySeconds: 5.6,
      durationSeconds: 4,
      alertText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.tetherOnYou!();

        const x = actor.x;
        if (x < 100) // Graven Image 3: Indulgent Will target
          return output.indulgent!();
        if (x < 108 && x > 106) // Graven Image 3: Idyllic Will target
          return output.idyllic!();
        return output.tetherOnYou!();
      },
      outputStrings: {
        tetherOnYou: {
          en: 'Tether on YOU',
          de: 'Verbindung auf DIR',
          fr: 'Lien sur VOUS',
          ja: '線ついた',
          cn: '连线点名',
          ko: '선 대상자 지정됨',
          tc: '連線點名',
        },
        indulgent: {
          en: 'Confuse Tether on YOU',
          cn: '混乱连线点名',
          ko: '혼란 선 대상자',
        },
        idyllic: {
          en: 'Sleep Tether on YOU',
          cn: '睡眠连线点名',
          ko: '수면 선 대상자',
        },
      },
    },
    {
      id: 'DMU P1 Ave Maria / Indolent Will Collect',
      // Collect for reminder with Mystery Magic
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      run: (data, matches) => {
        const id = matches.id;
        if (data.eyeTowerIds.includes(id) || data.fakeEyeTowerIds.includes(matches.id))
          data.isTowerLookAway = data.eyeTowerIds.includes(id);
      },
    },
    {
      id: 'DMU P1 Ave Maria (Early)',
      // BAB3 Ave Maria
      // The animation is visible ~9.89s before cast goes off, however
      // When animation becomes visible, the players will be asleep or
      // confused for another ~3.4s. Once the debuff ends the players have
      // ~6.4s to turn character
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.fakeEyeTowerIds.includes(matches.id),
      durationSeconds: 4.7, // Time until reminder
      infoText: (_data, _matches, output) => output.lookAtLater!(),
      outputStrings: {
        lookAtLater: {
          en: 'Look At Statue (later)',
          cn: '面对神像(稍后)',
          ko: '시선 바라보기 (나중에)',
        },
      },
    },
    {
      id: 'DMU P1 Indolent Will (Early)',
      // BAB4 Indolent Will
      type: 'ActorControlExtra',
      netRegex: { category: '019D', param1: '40', param2: '80', capture: true },
      condition: (data, matches) => data.eyeTowerIds.includes(matches.id),
      durationSeconds: 4.7, // Time until reminder
      infoText: (_data, _matches, output) => output.lookAwayLater!(),
      outputStrings: {
        lookAwayLater: {
          en: 'Look Away From Statue (later)',
          cn: '背对神像(稍后)',
          ko: '시선 피하기 (나중에)',
        },
      },
    },
    {
      id: 'DMU P1 Mystery Magic Fire and Thunder',
      // Set 3: Only Fire and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isFireTrue !== undefined &&
          data.isThunderTrue !== undefined &&
          data.phase === 'p1'
        )
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        const look = data.isTowerLookAway ? output.lookAway!() : output.lookAt!();
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isThunderTrue
            ? output.spreadTrueThunderLook!({
              mech: output.spread!(),
              thunder: output.trueThunder!(),
              look: look,
            })
            : output.spreadFakeThunderLook!({
              mech: output.spread!(),
              thunder: output.fakeThunder!(),
              look: look,
            });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isThunderTrue
            ? output.stackTrueThunderLook!({
              mech: output.stack!(),
              thunder: output.trueThunder!(),
              look: look,
            })
            : output.stackFakeThunderLook!({
              mech: output.stack!(),
              thunder: output.fakeThunder!(),
              look: look,
            });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 and P4 Mystery Magic Cleanup',
      // C622 Light of Judgment to reset for the Graven Image 2
      // BB14 Grand Cross to reset between Myster Magic casts
      type: 'StartsUsing',
      netRegex: {
        id: ['BA94', 'C622', 'BB14'],
        source: ['Kefka', 'Neo Exdeath'],
        capture: false,
      },
      run: (data) => {
        delete data.isFireTrue;
        delete data.isIceTrue;
        delete data.isThunderTrue;
        delete data.fireMarker;
      },
    },
    {
      id: 'DMU P2 Ultimate Embrace',
      type: 'StartsUsing',
      netRegex: { id: 'C24C', source: 'Kefka', capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'DMU P2 Forsaken',
      // 7s cast
      type: 'StartsUsing',
      netRegex: { id: 'BABC', source: 'Kefka', capture: false },
      durationSeconds: 6.7,
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'DMU P2 Spell\'s Trouble Clear Current Headmarker',
      // Each player gets 4 of these, using this to track when to clear from
      // Track when last one is lost
      type: 'LosesEffect',
      netRegex: { effectId: '13DB', capture: true },
      run: (data, matches) => {
        const target = matches.target;
        data.pathOfLightStackPlayers = data.pathOfLightStackPlayers.filter((t) => t !== target);
        delete data.forsakenPlayerHeadmarkers[target];
      },
    },
    {
      id: 'DMU P2 Path of Light Headmarker Tracker',
      // When standing in Path of Light tower, causes BAC0 Spelldriver (3-person stack)
      // When standing in Path of Light tower, causes BAC2 Spellwave (cone targetting nearest player)
      // When standing in Path of Light tower, causes BAC1 Spellscatter (small aoe on the player)
      // Headmarkers update ~2.5s prior to 13DB Spell's Trouble debuff count decrementing
      //
      // Stacks cannot exist with Even towers, there isn't enough players for near Baits
      // However, it is still possible to do an odd tower without having stacks
      // This seems to be treated as a special case as we find tower 7 give 4 stacks
      //
      // Possible Group solutions:
      // AAABBBBA
      // ABBAABBA
      // AAAABBBB, requires Tank LB3 due to forced 4 stacks from tower 7
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: true,
      },
      run: (data, matches) => {
        const id = matches.id;
        const target = matches.target;

        // Clear previous Headmarker if set
        data.pathOfLightStackPlayers = data.pathOfLightStackPlayers.filter((t) => t !== target);
        data.forsakenPlayerHeadmarkers[matches.target] = forsakenHeadmarkerIdToName[id] ??
          'unknown';

        // On first headmarker, start everyone in same group
        // Excluding self as this reduces number of lookups to find partner
        if (data.pathOfLightCounter === 1 && data.me !== matches.target)
          data.forsakenGroupB.push(matches.target);

        // If the groups are uneven a tower was missed and it's probably a wipe
        if (data.pathOfLightCounter === 2) {
          // Remove from Group B
          data.forsakenGroupB = data.forsakenGroupB.filter((t) => t !== target);
          if (data.me === matches.target)
            data.isForsakenGroupA = true;
          else
            data.forsakenGroupA.push(matches.target);
        }

        if (id === headMarkerData['stackPath'])
          data.pathOfLightStackPlayers.push(target);
      },
    },
    {
      id: 'DMU P2 Path of Light Towers 1',
      // First Tower:
      // 2 Soak markers
      // 3 Cone markers (same role)
      // 3 Spread markers (same role)
      // If not marked for soak, check role of soak marked players, if matches
      // player, add to output. Player will then know if they need to soak
      // Unfortunately we do not know partners until the first tower is taken
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: true,
      },
      condition: (data, matches) => {
        return data.me === matches.target && data.pathOfLightCounter === 1;
      },
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      infoText: (data, matches, output) => {
        const id = matches.id;
        const marker = forsakenHeadmarkerIdToName[id];
        if (marker === undefined)
          return;
        const num = output.num!({ num: data.pathOfLightCounter });
        const config = data.triggerSetConfig.forsaken;

        if (marker === 'stack') {
          // These players must get a tower
          if (config !== 'none') {
            if (data.role === 'healer' || data.role === 'tank')
              return output.stackOnYouTower!({
                num: num,
                tower: output.leftTower!(),
                marker: output.stackOnYouLocation!({
                  stack: output.stackOnYou!(),
                  location: output.outerHitbox!(),
                }),
              });
            return output.stackOnYouTower!({
              num: num,
              tower: output.rightTower!(),
              marker: output.stackOnYouLocation!({
                stack: output.stackOnYou!(),
                location: output.innerHitbox!(),
              }),
            });
          }

          // Assuming no strategy avoids stack soaking tower in first set
          return output.stackOnYouTower!({
            num: num,
            tower: output.tower!(),
            marker: output.stackOnYou!(),
          });
        }

        const stack1 = data.pathOfLightStackPlayers[0] ?? 'unknown';
        const stack2 = data.pathOfLightStackPlayers[1] ?? 'unknown';
        const stack1IsDPS = data.party.isDPS(stack1);
        const stack2IsDPS = data.party.isDPS(stack2);
        const myRoleIsDPS = data.party.isDPS(data.me);

        // If both stack players are the same role, output both players
        // This would be a non-standard composition
        if (myRoleIsDPS === stack1IsDPS && myRoleIsDPS === stack2IsDPS) {
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');
          return output.markerOnYouStacksOnPlayers!({
            num: num,
            marker: output[marker]!(),
            stacks: output.stacksOnPlayers!({ players: msg }),
          });
        }

        // Our partner will be the role that matches us
        // If not, then assuredly the strategy used something like conga line for each role
        const possiblePartner = data.party.member(myRoleIsDPS === stack1IsDPS ? stack1 : stack2);
        return output.markerOnYouStacksOnPlayers!({
          num: num,
          marker: output[marker]!(),
          stacks: output.stackOnPlayer!({ player: possiblePartner }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Counter',
      // Used to track which step of the paths we are own
      // 4 Players soak Odd Towers, 4 Players soak Even Towers
      // Headmarkers get applied to those hit ~0.5s after
      type: 'Ability',
      netRegex: { id: 'BABE', source: 'Kefka', capture: false },
      suppressSeconds: 1,
      run: (data) => data.pathOfLightCounter = data.pathOfLightCounter + 1,
    },
    {
      id: 'DMU P2 Path of Light Towers 2',
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 2,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Modified ABBA and Kroxy-Rinon Baits
        if (
          (!isForsakenGroupA && config === 'kroxy-rinon') ||
          (isForsakenGroupA && config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        // ABBA (unmodified) and AAAABBBB, Baits
        if (config === 'bowtie' && !data.isForsakenGroupA) {
          // Group A Avoids Towers (ABBA)
          // Group B Avoids Towers (AAAABBBB)
          return output.mechsBowtie!({
            num: num,
            mech1: output.beNear!(),
            mech2: output.avoid!(),
          });
        }

        // If someone has stack from beginning
        if (
          (config !== 'none') &&
          (marker === 'stack' || marker === 'unknown')
        )
          return;

        // Modified ABBA and Kroxy-Rinon Tower Soaks
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();

          switch (data.role) {
            case 'healer':
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.leftTower!(),
                nearfar: nearFar,
              });
            default: {
              const group = config === 'kroxy-rinon'
                ? data.forsakenGroupA
                : data.forsakenGroupB;
              const pMarker = getHTMRPartnerMarker(data, group);

              // Could not get priority
              if (pMarker === 'unknown')
                break;
              if (data.role === 'tank')
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.rightTower!()
                    : output.leftTower!(),
                  nearfar: nearFar,
                });

              if (Util.isMeleeDpsJob(data.job))
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.leftTower!()
                    : output.rightTower!(),
                  nearfar: nearFar,
                });

              // Ranged DPS highest priority right
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.rightTower!(),
                nearfar: nearFar,
              });
            }
          }
          // Unable to determine priority
          return output.markerOnYouTowerEvens!({
            num: num,
            marker: output[marker]!(),
            tower: output.tower!(),
            nearfar: nearFar,
          });
        }

        // ABBA (unmodified) and AAAABBBB, Soaks
        if (config === 'bowtie' && isForsakenGroupA) {
          // Tower soakers don't bait ends
          // Group B Soaks Towers (ABBA)
          // Group A Soaks Towers (AAAA)
          const group = data.forsakenGroupA;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Future\'s End/Past\'s End (Early)',
      // There are four end casts
      // This output will need to be short as in 1.4s another trigger will fire
      type: 'StartsUsing',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      infoText: (_data, matches, output) => {
        return matches.id === 'BAD2' ? output.future!() : output.past!();
      },
      outputStrings: {
        future: {
          en: 'Future',
          cn: '未来',
          ko: '미래',
        },
        past: {
          en: 'Past',
          cn: '过去',
          ko: '과거',
        },
      },
    },
    {
      id: 'DMU P2 All Things Ending Baits',
      // Using the following spells for timing:
      // BAD2 Future's End => Need to bait BADC All Things Ending
      // BAD3 Past's End => Need to bait BADD All Things Ending
      // There are four end casts, each 10s apart
      // BAD2 and BAD3 are the castbar, damage doesn't go out until later
      // TODO: Get Tower Locations
      type: 'Ability',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      delaySeconds: 1.7, // Time until headmarker and future/past damage
      alertText: (data, matches, output) => {
        const isFuture = matches.id === 'BAD2';
        const count = data.pathOfLightCounter;
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        const time = isFuture ? output.future!() : output.past!();
        if (count === 3) {
          // Stacks should soak towers
          if (marker === 'stack') {
            if (
              (
                isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
              ) ||
              (!isForsakenGroupA && config === 'abba')
            ) {
              switch (data.role) {
                case 'healer':
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.leftTower!(),
                  });
                default: {
                  const group = config === 'kroxy-rinon'
                    ? data.forsakenGroupA
                    : data.forsakenGroupB;
                  const pMarker = getHTMRPartnerMarker(data, group);

                  // Could not get priority
                  if (pMarker === 'unknown')
                    break; // Fallback to none config
                  if (data.role === 'tank')
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.rightTower!()
                        : output.leftTower!(),
                    });

                  if (Util.isMeleeDpsJob(data.job))
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.leftTower!()
                        : output.rightTower!(),
                    });

                  // Ranged is highest priority right
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.rightTower!(),
                  });
                }
              }
            }
            // None config
            // Need to know for priority
            const players = data.pathOfLightStackPlayers.map(
              (player) => {
                if (player === data.me)
                  return output.you!();
                return data.party.member(player);
              },
            );
            const msg = players?.join(', ');

            // Assuming none config soaks
            return output.baitThenStacks!({
              bait: time,
              stacks: output.stacksOnPlayers!({ players: msg }),
            });
          }

          // Tower soakers, non stack markers
          if (
            (
              isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
            ) ||
            (!isForsakenGroupA && config === 'abba')
          ) {
            return output.baitThenMarkerTower!({
              bait: time,
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }

          // Baits and Stacks
          if (
            (
              !isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
            ) ||
            (isForsakenGroupA && config === 'abba')
          ) {
            // So long as it is standard party composition...
            if (data.role === 'tank')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftStack!(),
              });
            if (data.role === 'healer')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftBaitOut!(),
              });
            // 2 DPS in stack
            return output.baitThenMech!({
              bait: time,
              mech: output.rightStack!(),
            });
          }

          // No config
          return output.baitThenMarker!({
            bait: time,
            marker: output[marker]!(),
          });
        } else if (count === 5) {
          // Baits and Stacks
          if (
            (isForsakenGroupA && config === 'kroxy-rinon') ||
            (!isForsakenGroupA && config === 'abba')
          ) {
            // So long as it is standard party composition...
            if (data.role === 'tank')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftStack!(),
              });
            if (data.role === 'healer')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftBaitOut!(),
              });
            // 2 DPS in stack
            return output.baitThenMech!({
              bait: time,
              mech: output.rightStack!(),
            });
          }

          if (config === 'bowtie') {
            // Bowtie has people bait cones, but cones could bait eachother if they wanted
            if (!isForsakenGroupA) {
              return output.baitThenMarkerTower!({
                bait: time,
                marker: output[marker]!(),
                tower: marker === 'cone'
                  ? output.leftTower!()
                  : output.rightTower!(),
              });
            }
            if (data.role === 'tank')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftBaitLeftBowtie!(),
              });
            if (data.role === 'healer')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftBaitOutBowtie!(),
              });
            // 2 DPS in spread
            return output.baitThenMech!({
              bait: time,
              mech: output.getHitRightSpreadBowtie!(),
            });
          }

          // Tower Soaks
          // In AAAABBBB, there is no stack
          if (marker === 'stack') {
            if (config !== 'none') {
              switch (data.role) {
                case 'healer':
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.leftTower!(),
                  });
                default: {
                  const group = config === 'abba' ? data.forsakenGroupA : data.forsakenGroupB;
                  const pMarker = getHTMRPartnerMarker(data, group);

                  // Could not get priority
                  if (pMarker === 'unknown')
                    break; // Fallback to none config
                  if (data.role === 'tank')
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.rightTower!()
                        : output.leftTower!(),
                    });

                  if (Util.isMeleeDpsJob(data.job))
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.leftTower!()
                        : output.rightTower!(),
                    });

                  // Ranged is highest priority right
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.rightTower!(),
                  });
                }
              }
            }
            // None config
            // Need to know for priority
            const players = data.pathOfLightStackPlayers.map(
              (player) => {
                if (player === data.me)
                  return output.you!();
                return data.party.member(player);
              },
            );
            const msg = players?.join(', ');

            // Assuming none config soaks
            return output.baitThenStacks!({
              bait: time,
              stacks: output.stacksOnPlayers!({ players: msg }),
            });
          }

          // This ends up being Group B || Group A for respective config
          if (config === 'kroxy-rinon' || config === 'abba') {
            return output.baitThenMarkerTower!({
              bait: time,
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          }

          // No config
          return output.baitThenMarker!({
            bait: time,
            marker: output[marker]!(),
          });
        } else if (count === 7) {
          if (isForsakenGroupA && config !== 'none') {
            // So long as it is standard party composition...
            if (data.role === 'tank')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftStack!(),
              });
            if (data.role === 'healer')
              return output.baitThenMech!({
                bait: time,
                mech: output.leftBaitOut!(),
              });
            // 2 DPS in stack
            return output.baitThenMech!({
              bait: time,
              mech: output.rightStack!(),
            });
          }
          if (marker === 'stack') {
            if (config !== 'none') {
              switch (data.role) {
                case 'healer':
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.leftTower!(),
                  });
                default: {
                  const pMarker = getHTMRPartnerMarker(data, data.forsakenGroupB);

                  // Could not get priority
                  if (pMarker === 'unknown')
                    break; // Fallback to none config
                  if (data.role === 'tank')
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.rightTower!()
                        : output.leftTower!(),
                    });

                  if (Util.isMeleeDpsJob(data.job))
                    return output.baitThenMarkerTower!({
                      bait: time,
                      marker: output[marker]!(),
                      tower: pMarker === marker
                        ? output.leftTower!()
                        : output.rightTower!(),
                    });

                  // Ranged is highest priority right
                  return output.baitThenMarkerTower!({
                    bait: time,
                    marker: output[marker]!(),
                    tower: output.rightTower!(),
                  });
                }
              }
            }
            // None config
            // Need to know for priority
            const players = data.pathOfLightStackPlayers.map(
              (player) => {
                if (player === data.me)
                  return output.you!();
                return data.party.member(player);
              },
            );
            const msg = players?.join(', ');

            // Assuming none config soaks
            return output.baitThenStacks!({
              bait: time,
              stacks: output.stacksOnPlayers!({ players: msg }),
            });
          }
          if (config !== 'none')
            return output.baitThenMarkerTower!({
              bait: time,
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
            });
          // No config
          return output.baitThenMarker!({
            bait: time,
            marker: output[marker]!(),
          });
        }
        return isFuture
          ? output.lastFuture!({ action: output.behind!() })
          : output.lastPast!({ action: output.stay!() });
      },
      outputStrings: {
        tower: Outputs.getTowers,
        behind: Outputs.getBehind,
        cone: {
          en: 'Cone on YOU',
          cn: '扇形点名',
          ko: '나에게 부채꼴',
        },
        spread: {
          en: 'Spread on YOU',
          cn: '分散点名',
          ko: '나에게 산개징',
        },
        stack: Outputs.stackOnYou,
        you: {
          en: 'YOU',
          cn: '你',
          ko: '나',
        },
        stacksOnPlayers: {
          en: 'Stacks on ${players}',
          cn: '分摊点${players}',
          ko: '${players}에게 쉐어',
        },
        stay: {
          en: 'Stay',
          de: 'Bleib stehen',
          fr: 'Restez',
          cn: '停',
          ko: '대기',
          tc: '停',
        },
        leftTower: {
          en: 'Left Tower',
          cn: '左塔',
          ko: '왼쪽 탑',
        },
        rightTower: {
          en: 'Right Tower',
          cn: '右塔',
          ko: '오른쪽 탑',
        },
        leftStack: {
          en: 'Left Stack',
          cn: '左分摊',
          ko: '왼쪽 쉐어',
        },
        rightStack: {
          en: 'Right Stack',
          cn: '右分摊',
          ko: '오른쪽 쉐어',
        },
        leftBaitOut: {
          en: 'Left Bait Out',
          cn: '左侧向外引导',
          ko: '왼쪽 유도 바깥으로',
        },
        baitOrStack: {
          en: 'Bait/Stack',
          cn: '引导/分摊',
          ko: '유도/쉐어',
        },
        future: {
          en: 'Bait opposite Towers',
          cn: '向塔的反方向引导',
          ko: '탑 반대쪽으로 유도',
        },
        past: {
          en: 'Bait between Towers',
          cn: '向塔之间引导',
          ko: '탑 사이로 유도',
        },
        baitThenMarker: {
          en: '${bait} => ${marker}',
          cn: '${bait} => ${marker}',
          ko: '${bait} => ${marker}',
        },
        baitThenMech: {
          en: '${bait} => ${mech}',
          cn: '${bait} => ${mech}',
          ko: '${bait} => ${mech}',
        },
        baitThenMarkerTower: {
          en: '${bait} => ${marker} ${tower}',
          cn: '${bait} => ${marker} ${tower}',
          ko: '${bait} => ${marker} ${tower}',
        },
        baitThenTower: {
          en: '${bait} => ${tower}',
          cn: '${bait} => ${tower}',
          ko: '${bait} => ${tower}',
        },
        baitThenStacks: {
          en: '${bait} => ${stacks}',
          cn: '${bait} => ${stacks}',
          ko: '${bait} => ${stacks}',
        },
        lastFuture: {
          en: 'Bait => ${action}',
          cn: '引导 => ${action}',
          ko: '유도 => ${action}',
        },
        lastPast: {
          en: 'Bait => ${action}',
          cn: '引导 => ${action}',
          ko: '유도 => ${action}',
        },
        getHitRightSpreadBowtie: {
          en: 'Hit by Right Spread',
          cn: '吃右侧分散',
          ko: '오른쪽 산개 맞기',
        },
        leftBaitLeftBowtie: {
          en: 'Left Bait Left',
          cn: '左侧向左引导',
          ko: '왼쪽 유도 왼쪽으로',
        },
        leftBaitOutBowtie: {
          en: 'Left Bait Out',
          cn: '左侧向外引导',
          ko: '왼쪽 유도 바깥으로',
        },
      },
    },
    {
      id: 'DMU P2 Path of Light Towers 3',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 3,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Stacks should soak towers
        if (marker === 'stack') {
          if (
            (
              isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
            ) ||
            (!isForsakenGroupA && config === 'abba') ||
            (config === 'none')
          ) {
            switch (data.role) {
              case 'healer':
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.leftTower!(),
                  nearfar: output.outerHitbox!(),
                });
              default: {
                const group = config === 'kroxy-rinon'
                  ? data.forsakenGroupA
                  : data.forsakenGroupB;
                const pMarker = getHTMRPartnerMarker(data, group);

                // Could not get priority
                if (pMarker === 'unknown')
                  break; // Fallback to none config
                if (data.role === 'tank')
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.rightTower!()
                      : output.leftTower!(),
                    nearfar: pMarker === marker
                      ? output.innerHitbox!()
                      : output.outerHitbox!(),
                  });

                if (Util.isMeleeDpsJob(data.job))
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.leftTower!()
                      : output.rightTower!(),
                    nearfar: pMarker === marker
                      ? output.outerHitbox!()
                      : output.innerHitbox!(),
                  });

                // Ranged is highest priority right
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.rightTower!(),
                  nearfar: output.innerHitbox!(),
                });
              }
            }
          }
          // None config
          // Need to know for priority
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              if (player === data.me)
                return output.you!();
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');

          // Assuming none config soaks
          return output.stacksOnPlayersTower!({
            num: num,
            stack: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        // Tower soakers, non stack markers
        if (
          (
            isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
          ) ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          return output.markerOnYouTowerOdds!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
            nearfar: output.beFar!(),
          });
        }

        // Baits and Stacks
        if (
          (
            !isForsakenGroupA && (config === 'kroxy-rinon' || config === 'bowtie')
          ) ||
          (isForsakenGroupA && config === 'abba')
        ) {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          // 2 DPS in stack
          return output.rightStack!({
            num: num,
          });
        }

        // No strategy selected
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 4',
      // This set should not contain stack markers
      // If stacks exist, they came from first set
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 4,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        // AAAABBBB, Baits
        if (config === 'bowtie' && !isForsakenGroupA) {
          // Group B Avoids Towers
          return output.mechsBowtie!({
            num: num,
            mech1: output.beNear!(),
            mech2: output.avoid!(),
          });
        }

        // If someone has stack from beginning
        if (
          (config !== 'none') &&
          (marker === 'stack' || marker === 'unknown')
        )
          return;

        // AAAABBBB, Soaks
        if (config === 'bowtie' && isForsakenGroupA) {
          // Tower soakers don't bait ends
          // Group A Soaks Towers
          const group = data.forsakenGroupA;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // Tower Soaks
        if (config === 'kroxy-rinon' || config === 'abba') {
          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();

          switch (data.role) {
            case 'healer':
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.leftTower!(),
                nearfar: nearFar,
              });
            default: {
              const pMarker = getHTMRPartnerMarker(data, data.forsakenGroupB);

              // Could not get priority
              if (pMarker === 'unknown')
                break;
              if (data.role === 'tank')
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.rightTower!()
                    : output.leftTower!(),
                  nearfar: nearFar,
                });

              if (Util.isMeleeDpsJob(data.job))
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.leftTower!()
                    : output.rightTower!(),
                  nearfar: nearFar,
                });

              // Ranged DPS highest priority right
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.rightTower!(),
                nearfar: nearFar,
              });
            }
          }
          // Unable to determine priority
          return output.markerOnYouTowerEvens!({
            num: num,
            marker: output[marker]!(),
            tower: output.tower!(),
            nearfar: nearFar,
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 5',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      // However, AAAABBBB has 2 Cones and 2 Spreads soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 5,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits and Stacks
        if (
          (isForsakenGroupA && config === 'kroxy-rinon') ||
          (!isForsakenGroupA && config === 'abba')
        ) {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          return output.rightStack!({
            num: num,
          });
        }

        if (config === 'bowtie') {
          // Bowtie has  people bait cones, but cones could bait eachother if they wanted
          if (!isForsakenGroupA) {
            return output.markerOnYouTowerOdds!({
              num: num,
              marker: output[marker]!(),
              tower: marker === 'cone'
                ? output.leftTower!()
                : output.rightTower!(),
              nearfar: output.beFar!(),
            });
          }
          if (data.role === 'tank')
            return output.baitLeftConeLeftBowtie!({
              num: num,
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutBowtie!({
              num: num,
            });
          return output.getHitBySpreadRightBowtie!({
            num: num,
          });
        }

        // Tower Soaks
        // In AAAABBBB, there is no stack
        if (marker === 'stack') {
          if (config !== 'none') {
            switch (data.role) {
              case 'healer':
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.leftTower!(),
                  nearfar: output.outerHitbox!(),
                });
              default: {
                const group = config === 'abba'
                  ? data.forsakenGroupA
                  : data.forsakenGroupB;
                const pMarker = getHTMRPartnerMarker(data, group);

                // Could not get priority
                if (pMarker === 'unknown')
                  break; // Fallback to none config
                if (data.role === 'tank')
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.rightTower!()
                      : output.leftTower!(),
                    nearfar: pMarker === marker
                      ? output.innerHitbox!()
                      : output.outerHitbox!(),
                  });

                if (Util.isMeleeDpsJob(data.job))
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.leftTower!()
                      : output.rightTower!(),
                    nearfar: pMarker === marker
                      ? output.outerHitbox!()
                      : output.innerHitbox!(),
                  });

                // Ranged is highest priority right
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.rightTower!(),
                  nearfar: output.innerHitbox!(),
                });
              }
            }
          }
          // None config
          // Need to know for priority
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              if (player === data.me)
                return output.you!();
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');

          // Assuming none config soaks
          return output.stacksOnPlayersTower!({
            num: num,
            stack: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        // This ends up being Group B || Group A for respective config
        if (config === 'kroxy-rinon' || config === 'abba') {
          return output.markerOnYouTowerOdds!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
            nearfar: output.beFar!(),
          });
        }

        // No strategy
        if (marker === 'unknown')
          return output.baitConeOrStackNoStrategy!({
            num: num,
          });
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 6',
      // Expecting 2 Cones and 2 Spreads soak towers
      //
      // Headmarkers come out ~2s before Future's/Past's End
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['stackPath'],
          headMarkerData['conePath'],
          headMarkerData['spreadPath'],
        ],
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 6,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;
        const isForsakenGroupA = data.isForsakenGroupA;

        // Baits
        if (
          isForsakenGroupA &&
          (config === 'kroxy-rinon' || config === 'abba')
        ) {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          // DPS Unknown party composition
          return output.bait!({
            num: num,
          });
        }

        if (config === 'bowtie') {
          // Group A Baits Ends
          if (isForsakenGroupA)
            return output.numBeNearSpreadBowtie!({
              num: num,
              near: output.beNear!(),
              spread: output.spreadBowtie!(),
            });

          // Tower soakers don't bait ends
          // Group B Soaks Towers
          const group = data.forsakenGroupB;
          // Partner is whoever has the same marker
          const partner = playerHeadmarkers[group[0] ?? 0] === marker
            ? group[0]
            : playerHeadmarkers[group[1] ?? 0] === marker
            ? group[1]
            : group[2]; // Or unknown matched
          const name = data.party.member(partner);
          if (marker === 'spread')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.rightTower!(),
              mech2: output.spreadWithPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
          if (marker === 'cone')
            return output.mechs3Bowtie!({
              num: num,
              mech1: output.leftTower!(),
              mech2: output.baitConeFromPlayer!({ player: name }),
              mech3: output.outOfHitbox!(),
            });
        }

        // Group B
        if (config === 'kroxy-rinon' || config === 'abba') {
          // Spread Players have to be far in the tower, cones need to bait end
          const nearFar = marker === 'spread'
            ? output.beFar!()
            : output.beNear!();

          switch (data.role) {
            case 'healer':
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.leftTower!(),
                nearfar: nearFar,
              });
            default: {
              const pMarker = getHTMRPartnerMarker(data, data.forsakenGroupB);

              // Could not get priority
              if (pMarker === 'unknown')
                break;
              if (data.role === 'tank')
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.rightTower!()
                    : output.leftTower!(),
                  nearfar: nearFar,
                });

              if (Util.isMeleeDpsJob(data.job))
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: pMarker === marker
                    ? output.leftTower!()
                    : output.rightTower!(),
                  nearfar: nearFar,
                });

              // Ranged DPS highest priority right
              return output.markerOnYouTowerEvens!({
                num: num,
                marker: output[marker]!(),
                tower: output.rightTower!(),
                nearfar: nearFar,
              });
            }
          }
          // Unable to determine priority
          return output.markerOnYouTowerEvens!({
            num: num,
            marker: output[marker]!(),
            tower: output.tower!(),
            nearfar: nearFar,
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        if (marker === 'unknown')
          return output.baitNoStrategy!({
            num: num,
          });
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 7',
      // BADC All Things Ending (Future)
      // BADD All Things Ending (Past)
      // Expecting 2 Stacks, 1 Cone, and 1 Spread soak towers
      type: 'StartsUsing',
      netRegex: { id: ['BADC', 'BADD'], source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 7,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;

        // Baits and Stacks
        if (data.isForsakenGroupA && config !== 'none') {
          // So long as it is standard party composition...
          if (data.role === 'tank')
            return output.leftStack!({
              num: num,
            });
          if (data.role === 'healer')
            return output.baitLeftConeOutOdds!({
              num: num,
            });
          return output.rightStack!({
            num: num,
          });
        }

        // Tower soaks
        if (marker === 'stack') {
          if (config !== 'none') {
            switch (data.role) {
              case 'healer':
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.leftTower!(),
                  nearfar: output.outerHitbox!(),
                });
              default: {
                const pMarker = getHTMRPartnerMarker(data, data.forsakenGroupB);

                // Could not get priority
                if (pMarker === 'unknown')
                  break; // Fallback to none config
                if (data.role === 'tank')
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.rightTower!()
                      : output.leftTower!(),
                    nearfar: pMarker === marker
                      ? output.innerHitbox!()
                      : output.outerHitbox!(),
                  });

                if (Util.isMeleeDpsJob(data.job))
                  return output.markerOnYouTowerOdds!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.leftTower!()
                      : output.rightTower!(),
                    nearfar: pMarker === marker
                      ? output.outerHitbox!()
                      : output.innerHitbox!(),
                  });

                // Ranged is highest priority right
                return output.markerOnYouTowerOdds!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.rightTower!(),
                  nearfar: output.innerHitbox!(),
                });
              }
            }
          }
          // None config
          // Need to know for priority
          const players = data.pathOfLightStackPlayers.map(
            (player) => {
              if (player === data.me)
                return output.you!();
              return data.party.member(player);
            },
          );
          const msg = players?.join(', ');

          // Assuming none config soaks
          return output.stacksOnPlayersTower!({
            num: num,
            stack: output.stacksOnPlayers!({ players: msg }),
            tower: output.tower!(),
          });
        }

        // Cone/Stack Tower Soaks
        // Group B
        if (config !== 'none')
          return output.markerOnYouTowerOdds!({
            num: num,
            marker: output[marker]!(),
            tower: marker === 'cone'
              ? output.leftTower!()
              : output.rightTower!(),
            nearfar: output.beFar!(),
          });

        // No strategy
        if (marker === 'unknown')
          return output.baitConeOrStackNoStrategy!({
            num: num,
          });
        return output.markerOnYouNoStrategy!({
          num: num,
          marker: output[marker]!(),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Towers 8',
      // Shouldn't be new headmarkers from previous towers
      // This set should not contain stack markers
      // Expecting 2 Cones and 2 Spreads soak towers
      // However AAAABBBB will have 4 Stacks soak towers
      //
      // Track based on tower soak or fail
      // BABF The River of Light
      // BAC0 Spelldriver
      // BAC1 Spellscatter
      // BAC2 Spellwave
      type: 'Ability',
      netRegex: {
        id: ['BABF', 'BAC0', 'BAC1', 'BAC2'],
        source: 'Kefka',
        capture: false,
      },
      condition: (data) => data.pathOfLightCounter === 8,
      delaySeconds: 0.1, // Delay for party headmarker collect
      durationSeconds: 9,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        const playerHeadmarkers = data.forsakenPlayerHeadmarkers;
        const num = output.num!({ num: data.pathOfLightCounter });
        const marker = playerHeadmarkers[data.me] ?? 'unknown'; // Current headmarker
        const config = data.triggerSetConfig.forsaken;

        if (data.isForsakenGroupA) {
          // Tower Soaks for ABBABBA and AAABBBBA
          if (config === 'kroxy-rinon' || config === 'abba') {
            // This means player from A accidentally took tower previously
            if (marker === 'stack' || marker === 'unknown')
              return;

            // Spread Players have to be far in the tower, cones need to bait end
            const nearFar = marker === 'spread'
              ? output.beFar!()
              : output.beNear!();

            switch (data.role) {
              case 'healer':
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.leftTower!(),
                  nearfar: nearFar,
                });
              default: {
                const pMarker = getHTMRPartnerMarker(data, data.forsakenGroupA);

                // Could not get priority
                if (pMarker === 'unknown')
                  break;
                if (data.role === 'tank')
                  return output.markerOnYouTowerEvens!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.rightTower!()
                      : output.leftTower!(),
                    nearfar: nearFar,
                  });

                if (Util.isMeleeDpsJob(data.job))
                  return output.markerOnYouTowerEvens!({
                    num: num,
                    marker: output[marker]!(),
                    tower: pMarker === marker
                      ? output.leftTower!()
                      : output.rightTower!(),
                    nearfar: nearFar,
                  });

                // Ranged DPS highest priority right
                return output.markerOnYouTowerEvens!({
                  num: num,
                  marker: output[marker]!(),
                  tower: output.rightTower!(),
                  nearfar: nearFar,
                });
              }
            }
            // Unable to determine priority
            return output.markerOnYouTowerEvens!({
              num: num,
              marker: output[marker]!(),
              tower: output.tower!(),
              nearfar: nearFar,
            });
          }

          // End Baits for AAAABBBB
          if (config === 'bowtie')
            return output.numBeNearSpreadBowtie!({
              num: num,
              near: output.beNear!(),
              spread: output.spreadBowtie!(),
            });
        }

        // Baits for ABBAABBA and AAABBBBA
        if (config === 'kroxy-rinon' || config === 'abba') {
          if (data.role === 'healer')
            return output.baitLeftConeLeftEvens!({
              num: num,
            });
          if (data.role === 'tank')
            return output.baitCloneOppositeTowers!({
              num: num,
            });
          return output.bait!({
            num: num,
          });
        }
        if (config === 'bowtie') {
          // Each person in Group B will have a stack marker
          if (data.role === 'healer' || data.role === 'tank')
            return output.spreadTowersBowtie!({
              num: num,
              tower: output.leftTower!(),
              spread: output.spreadBowtie!(),
            });
          return output.spreadTowersBowtie!({
            num: num,
            tower: output.rightTower!(),
            spread: output.spreadBowtie!(),
          });
        }

        // No strategy selected
        // Many options: Tower, Bait Cone, Share Stack?
        if (marker === 'unknown')
          return output.baitNoStrategy!({
            num: num,
          });
        return output.mechsNoStrategy!({
          num: num,
          marker: output[marker]!(),
          mechs: output.towerOrBeNear!({
            tower: output.tower!(),
            near: output.beNear!(),
          }),
        });
      },
      outputStrings: forsakenOutputStrings,
    },
    {
      id: 'DMU P2 Path of Light Tower 8 AAAABBBB Special',
      // BAD2 Future's End or BAD3 Past's End will go off same time as 4 players
      // take a 3-person stack solo
      // For some reason the phase is coded such that the 7th tower will give 4 stacks
      // under this scenario
      type: 'StartsUsing',
      netRegex: { id: ['BAD2', 'BAD3'], source: 'Kefka', capture: true },
      condition: (data) => {
        return data.role === 'tank' && data.pathOfLightCounter === 8 &&
          data.triggerSetConfig.forsaken === 'bowtie';
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3, // 6.4s castTime, this is 4s before damage
      alarmText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'TANK LB!!',
          de: 'TANK LB!!',
          fr: 'LB TANK !!',
          ja: 'タンクLB!!',
          cn: '坦克LB!!',
          ko: '탱리밋!!',
          tc: '坦克LB!!',
        },
      },
    },
    {
      id: 'DMU P2 Last All Things Ending Followup',
      // BADC All Things Ending (Future)
      type: 'StartsUsing',
      netRegex: { id: 'BADC', source: 'Kefka', capture: false },
      condition: (data) => data.pathOfLightCounter === 9,
      suppressSeconds: 1,
      response: Responses.getBehind(),
    },
    {
      id: 'DMU P2 Light of Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'BABD', source: 'Kefka', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'DMU P2 Trine Collector',
      // Kefkabin solution: https://raidplan.io/plan/apkh6ytq72w8pt3v
      // Trines are added ~0.5s after BADF Trine ability
      // They have BNpcID 1EBFB3 and 1EBFB2.
      // Pattern 1:
      // Set 1: Northwest-ish(88.45, 90), South-ish (97.11, 115), North-ish(102.89, 85)
      // Set 2: Southeast-ish (115.55, 110)
      // Set 3: West-ish (85.57, 105), Middle (100,100)*, East-ish(114.43, 95)
      //
      // Pattern 2:
      // Set 1: Southeast-ish(111.55, 110), South-ish (97.11, 115) East-ish (114.43,95)
      // Set 2: North-ish (102.89, 85)
      // Set 3: West-ish (85.57, 105), Northwest-ish(88.45, 90), Middle (100, 100)*
      //
      // Pattern 3:
      // Set 1: South-ish (97.11, 115), Southeast-ish (111.55, 110), East-ish (114.43, 95)
      // Set 2: Northwest-ish (88.45, 90)
      // Set 3: West-ish (85.57, 105), Middle (100, 100)*, North-ish (102.89, 85)
      //
      // Pattern 4:
      // Set 1: Northwest-ish(88.45, 90), South-ish (97.11, 115), North-ish(102.89, 85)
      // Set 2: East-ish (114.43, 95)
      // Set 3: West-ish (85.57, 105), Middle (100,100)*, Southeast-ish (111.55, 110)
      //
      // There's probably more patterns
      // * Guaranteed in set 3, and its heading points West or East
      //
      // 273 ActorControlExtra lines that follow:
      // 019D|10|20 => Falling down animation?
      // 019D|40|80 => Landed animation? (~1.4s after add)
      // 019D|4|8 => Explosion animation?
      //
      // Trines starts with 3 Trines spawning, then 1, then 3 More
      // BACD/BACE Wings of Destruction halfroom cleave happens while 3rd set is landing
      // As Trines 1 detonate, the near/far tankbuster C487 Wings of Destruction begins casting
      // At the 3rd detonation, the tankbuster will snapshot
      type: 'CombatantMemory',
      netRegex: {
        change: 'Add',
        pair: [{ key: 'BNpcID', value: ['1EBFB2', '1EBFB3'] }],
        capture: true,
      },
      run: (data, matches) => {
        // Need heading of middle trine for near tank bait and/or greedy melee
        // Heading is defined by the BNpcID
        // 1EBFB3 => West
        // 1EBFB2 => East
        const x = parseFloat(matches.pairPosX ?? '0');
        const y = parseFloat(matches.pairPosY ?? '0');

        // Exception for center trine
        if (data.trineDirNums.length === 3) {
          if (x > 99 && x < 101) {
            data.middleTrineFacing = matches.pairBNpcID === '1EBFB2' ? 'east' : 'west';
            return;
          }
        }

        // Not storing the last two sets' x,y coords
        if (data.trineDirNums.length !== 3) {
          const dirNum = Directions.xyTo16DirNum(x, y, centerX, centerY);
          data.trineDirNums.push(dirNum);
        }
      },
    },
    {
      id: 'DMU P2 Trines 1 (Early)',
      type: 'CombatantMemory',
      netRegex: {
        change: 'Add',
        pair: [{ key: 'BNpcID', value: ['1EBFB2', '1EBFB3'] }],
        capture: false,
      },
      condition: (data) => data.trineDirNums.length === 3,
      durationSeconds: 12, // Detonation occurs ~12.9s
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const dirNums = data.trineDirNums;
        const sorted = dirNums.sort((a, b) => a - b); // Sorts clockwise
        const trine1 = sorted[0] !== undefined
          ? Directions.output16Dir[sorted[0]] ?? 'unknown'
          : 'unknown';
        const trine2 = sorted[1] !== undefined
          ? Directions.output16Dir[sorted[1]] ?? 'unknown'
          : 'unknown';
        const trine3 = sorted[2] !== undefined
          ? Directions.output16Dir[sorted[2]] ?? 'unknown'
          : 'unknown';

        return output.safeSpots!({
          dir1: output[trine1]!(),
          dir2: output[trine2]!(),
          dir3: output[trine3]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        safeSpots: {
          en: '${dir1}/${dir2}/${dir3} Later',
          cn: '稍后 ${dir1}/${dir2}/${dir3}',
          ko: '${dir1}/${dir2}/${dir3} 나중에',
        },
      },
    },
    {
      id: 'DMU P2 Single Wing of Destruction',
      // BACD Wings of Destruction, Left wing highlight
      // BACE Wingso of Desctruction, Right wing highlight
      // Halfroom cleaves
      type: 'StartsUsing',
      netRegex: { id: ['BACD', 'BACE'], source: 'Kefka', capture: true },
      infoText: (_data, matches, output) => {
        if (matches.id === 'BACD')
          return output.right!();
        return output.left!();
      },
      outputStrings: {
        right: Outputs.right,
        left: Outputs.left,
      },
    },
    {
      id: 'DMU P2 Wings of Destruction',
      // In DMU, players need to move for trines at same time as the tankbuster call
      // Melee most likely won't be able to hit the boss due to trine aoes
      type: 'StartsUsing',
      netRegex: { id: 'C487', source: 'Kefka', capture: false },
      alertText: (data, _matches, output) => {
        const dirNums = data.trineDirNums;
        const sorted = dirNums.sort((a, b) => a - b); // Sorts clockwise
        const trine1 = sorted[0] !== undefined
          ? Directions.output16Dir[sorted[0]] ?? 'unknown'
          : 'unknown';
        const trine2 = sorted[1] !== undefined
          ? Directions.output16Dir[sorted[1]] ?? 'unknown'
          : 'unknown';
        const trine3 = sorted[2] !== undefined
          ? Directions.output16Dir[sorted[2]] ?? 'unknown'
          : 'unknown';

        return output.dirWings!({
          dirs: output.safeSpots!({
            dir1: output[trine1]!(),
            dir2: output[trine2]!(),
            dir3: output[trine3]!(),
          }),
          wings: data.role !== 'tank'
            ? output.wingsParty!()
            : data.middleTrineFacing
            ? output.wingsTrine!({
              wings: output.wingsTank!(),
              trine: output[data.middleTrineFacing]!(),
            })
            : output.wingsTank!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        safeSpots: {
          en: '${dir1}/${dir2}/${dir3}',
          cn: '${dir1}/${dir2}/${dir3}',
          ko: '${dir1}/${dir2}/${dir3}',
        },
        wingsTrine: {
          en: '${wings} + ${trine}',
          cn: '${wings} + ${trine}',
          ko: '${wings} + ${trine}',
        },
        dirWings: {
          en: '${dirs} + ${wings}',
          cn: '${dirs} + ${wings}',
          ko: '${dirs} + ${wings}',
        },
        wingsParty: {
          en: 'Outer 2 Rings',
          cn: '外侧第2环',
          ko: '바깥쪽 2번째 원',
        },
        wingsTank: {
          en: 'Be Near/Far',
          cn: '靠近/远离',
          ko: '가까이/멀리 있기',
        },
        east: {
          en: 'Eastward Trine',
          cn: '右侧异三角',
          ko: '동쪽 트라인',
        },
        west: {
          en: 'Westward Trine',
          cn: '左侧异三角',
          ko: '서쪽 트라인',
        },
      },
    },
    {
      id: 'DMU P2 Aero III Assault',
      // Knockback from boss that can't be resisted
      // Applies 306 Down for the Count
      type: 'StartsUsing',
      netRegex: { id: 'C3F7', source: 'Kefka', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'DMU P3 Epic Hero/Fated Hero Debuffs',
      // Applied to 4 nearest players when Chaos and Exdeath finish casting
      // C2E2/C2E3 The Decisive Battle
      // 1060 Epic Hero: Can only damage Chaos, preferred by Melee DPS
      // 1062 Fated Hero: Can only damage Exdeath, preferred by Ranged DPS
      // These fall off once Exdeath casts BB12 Thunder III
      type: 'GainsEffect',
      netRegex: { effectId: ['1060', '1062'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        return matches.effectId === '1060' ? output.epic!() : output.fated!();
      },
      outputStrings: {
        epic: {
          en: 'Attack Chaos',
          cn: '攻击卡奥斯',
          ko: '카오스 공격',
        },
        fated: {
          en: 'Attack Exdeath',
          cn: '攻击艾克斯迪司',
          ko: '엑스데스 공격',
        },
      },
    },
    {
      id: 'DMU P3 Bowels of Agony',
      type: 'StartsUsing',
      netRegex: { id: 'BAF2', source: 'Chaos', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'DMU P3 Headwind/Tailwind Debuffs',
      // Applied at BAF2 Bowels of Agony
      // Debuffs trigger if hit by certain sources, causing a knockback
      // 642 Headwind: Face away from damage source
      // 643 Tailwind: Face towards damage source
      type: 'GainsEffect',
      netRegex: { effectId: ['642', '643'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        return matches.effectId === '642' ? output.headwind!() : output.tailwind!();
      },
      outputStrings: {
        headwind: {
          en: 'Headwind on YOU',
          cn: '混沌之逆风点名',
          ko: '혼돈의 바람 대상자',
        },
        tailwind: {
          en: 'Tailwind on You',
          cn: '混沌之风点名',
          ko: '혼돈의 역풍 대상자',
        },
      },
    },
    {
      id: 'DMU P3 Longitudinal Implosion',
      type: 'StartsUsing',
      netRegex: { id: 'BAFD', source: 'Chaos', capture: false },
      infoText: (_data, _matches, output) => output.sides!(),
      outputStrings: {
        sides: Outputs.sidesThenFrontBack,
      },
    },
    {
      id: 'DMU P3 Latitudinal Implosion',
      type: 'StartsUsing',
      netRegex: { id: 'BAFE', source: 'Chaos', capture: false },
      infoText: (_data, _matches, output) => output.frontBack!(),
      outputStrings: {
        frontBack: Outputs.frontBackThenSides,
      },
    },
    {
      id: 'DMU P3 Vaccuum Wave',
      type: 'StartsUsing',
      netRegex: { id: 'BB13', source: 'Chaos', capture: true },
      infoText: (_data, matches, output) => {
        return output.knockbackFromBoss!({ chaos: matches.source });
      },
      outputStrings: {
        knockbackFromBoss: {
          en: 'Knockback from ${chaos}',
          cn: '被${chaos}击退',
          ko: '${chaos}에서 넉백',
        },
      },
    },
    {
      id: 'DMU P3 Damning Edict',
      type: 'StartsUsing',
      netRegex: { id: 'BB01', source: 'Chaos', capture: true },
      infoText: (_data, matches, output) => {
        return output.getBehindTarget!({ target: matches.source });
      },
      outputStrings: {
        getBehindTarget: {
          en: 'Get Behind ${target}',
          cn: '到${target}背后',
          ko: '${target} 뒤로',
        },
      },
    },
    {
      id: 'DMU P4 Chaos and Neo Exdeath Debuff Collect',
      // In the count field of Effect 808, the bosses receive these values:
      // Fake Chaos: 45F
      // True Chaos: 460
      // Fake Neo Exdeath: 461
      // True Neo Exdeath: 462
      type: 'GainsEffect',
      netRegex: {
        effectId: '808',
        count: ['45F', '460', '461', '462'],
        capture: true,
      },
      run: (data, matches) => {
        const count = matches.count;
        const isTrue = count === '460' || (count === '462')
          ? true
          : false;
        // These always come out in order
        if (data.areFirstDebuffsTrue === undefined)
          data.areFirstDebuffsTrue = isTrue;
        else if (data.isEntropyTrue === undefined)
          data.isEntropyTrue = isTrue;
        else if (data.areSecondDebuffsTrue === undefined)
          data.areSecondDebuffsTrue = isTrue;
        else if (data.isDynamicFluidTrue === undefined)
          data.isDynamicFluidTrue = isTrue;
        // Last two are not needed as the next is a double negative and last
        // has unique cast ids for true/fake
      },
    },
    {
      id: 'DMU P4 Tsunami/Inferno',
      // BB14 Grand Cross AoE also happens ~4s after this cast starts
      // BB20 Inferno / BB21 Tsunami are 8.7s castTime
      type: 'StartsUsing',
      netRegex: { id: ['BB20', 'BB21'], source: 'Chaos', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'DMU P4 Grand Cross Counter',
      type: 'StartsUsing',
      netRegex: { id: 'BB14', source: 'Neo Exdeath', capture: false },
      run: (data) => data.grandCrossCount = data.grandCrossCount + 1,
    },
    {
      id: 'DMU P4 Grand Cross',
      // 8.7s castTime
      type: 'StartsUsing',
      netRegex: { id: 'BB14', source: 'Neo Exdeath', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'DMU P4 Debuff Collect',
      // Neo Exdeath Debuffs Cast 1: (12:28.672)
      // 15A7 Cursed Shriek x2 60s                        =>          13:28.672
      // 15A8 Forked Lightning x2 76s                     =>                    13:44.672
      // 15A9 Compressed Water x2 76s                     =>                    13:44.672
      // 15AA Acceleration Bomb (2 Long 76s, 2 Short 51s) => 13:19.672          13:44.672
      // Chaos Debuffs 1: (12:34.341)
      // 15AC Dynamic Fluid x8 84s                        => 13:48.672
      // Neo Exdeath Debuffs Cast 2: (12:43.578)
      // 15A8 Forked Lightning x2 36s                     => 13:19.578
      // 15A7 Cursed Shriek x2 69s                        => 13:52.578
      // 15A9 Compressed Water x2 36s                     => 13:19.578
      // 15AA Acceleration Bomb (2 Long 61s, 2 Short 36s) => 13:19.578          13:44.578
      // Chaos Debuffs 2: 12:50.485
      // 15AB Entroy x8 45s                               => 13:35.485
      // Neo Exdeath Debuffs Cast 3: (13:00.002)
      // 15A5 White Wound or 1317 (Fake)
      // 15A6 Black Wound or 1318 (Fake)
      // 1558 Beyond Death (Fake) or 566 x4 15s           => 13:15.002
      // 1C6 Allagan Field x4 15s                         => 13:15.002
      // Neo Exdeath Final: (13:11.383)
      // 1317 White Wound (Fake) or 15A5 White Wound
      // 1318 Black Wound (Fake) or 15A6 Black Wound
      //
      // For Neo Exdeath, after the second Grand Cross cast there will be:
      // 1 Support, 1 DPS with Short 3-Person Stack (Compressed Water and/or Fake Forked Lightning)
      // 1 Support, 1 DPS with Long 3-Person Stack (Compressed Water and/or Fake Forked Lightning)
      // 1 Support, 1 DPS with Short Gaze (Cursed Shriek or Fake Cursed Shriek)
      // 1 Support, 1 DPS with Long Gaze (Cursed Shriek or Fake Cursed Shriek)
      // 2 Support, 2 DPS with Short Stillness (Acceleration Bomb or Fake Acceleration Bomb)
      // 2 Support, 2 DPS with Long Stillness (Acceleration Bomb or Fake Acceleration Bomb)
      // For 3rd set of debuffs we do not need to know real/fake:
      // Allagan Field players swap their color by getting hit with opposite color Angilight
      // Beyond Death field players keep their color by getting hit with same colore Antilight
      // Entropy and Dynamic Fluids will be handled seperately
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '15A5',
          '15A6',
          '15A7',
          '15A8',
          '15A9',
          '15AA',
          '1317',
          '1318',
          '1558',
          '566',
          '1C6',
        ],
        capture: true,
      },
      run: (data, matches) => {
        const target = matches.target;
        const id = matches.effectId;
        const duration = parseFloat(matches.duration);

        // Cursed Shriek
        if (id === '15A7') {
          if (duration < 61)
            data.shortShriekPlayers.push(target);
          else
            data.longShriekPlayers.push(target);
        } else if (id === '15A8') {
          // Forked Lightning
          if (duration < 37)
            data.shortForkedPlayers.push(target);
          else
            data.longForkedPlayers.push(target);
        } else if (id === '15A9') {
          // Compressed Water
          if (duration < 37)
            data.shortCompressedPlayers.push(target);
          else
            data.longCompressedPlayers.push(target);
        } else if (id === '15AA') {
          // Acceleration Bomb
          if (duration < 52)
            data.shortBombPlayers.push(target);
          else
            data.longBombPlayers.push(target);
        } else if (data.me === target) {
          // Cast 5 / 6 Debuffs
          if (id === '1558' || id === '566')
            data.deathOrField = 'death';
          else if (id === '1C6')
            data.deathOrField = 'field';
          else if (id === '1317' || id === '15A5')
            data.wound = 'white';
          else if (id === '1318' || id === '15A6')
            data.wound = 'black';
        }
      },
    },
    {
      id: 'DMU P4 First Debuffs (Early)',
      // Cast 1:
      // 15A7 Cursed Shriek x2 60s
      // 15A8 Forked Lightning x2 76s
      // 15A9 Compressed Water x2 76s
      // 15AA Acceleration Bomb (2 Long 76s, 2 Short 51s)
      type: 'GainsEffect',
      netRegex: { effectId: ['15A7', '15A8', '15A9', '15AA'], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.1,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const hasShreik = data.shortShriekPlayers.includes(data.me);
        const hasFork = data.longForkedPlayers.includes(data.me);
        const hasCompressed = data.longCompressedPlayers.includes(data.me);
        const hasBomb = data.longBombPlayers.includes(data.me);
        const isTrue = data.areFirstDebuffsTrue;

        if (isTrue === undefined)
          return;

        // Shriek players always are short bomb
        // This will be two players
        if (hasShreik)
          return output.firstGazeAndBomb!({
            gaze: isTrue ? output.gaze!() : output.fakeGaze!(),
            bomb: isTrue ? output.bomb!() : output.fakeBomb!(),
          });

        // Remaing 6 players will get one debuff
        if ((hasFork && isTrue) || (hasCompressed && !isTrue))
          return output.spreadSecond!({ mech: output.spread!() });
        if ((hasFork && !isTrue) || (hasCompressed && isTrue))
          return output.stackSecond!({ mech: output.stack!() });
        if (hasBomb)
          return output.bombSecond!({
            mech: isTrue ? output.bomb!() : output.fakeBomb!(),
          });
      },
      outputStrings: {
        firstGazeAndBomb: {
          en: '${gaze} + ${bomb} on YOU First',
        },
        gaze: {
          en: 'Look Away',
        },
        fakeGaze: {
          en: 'Look At',
        },
        spreadSecond: {
          en: '${mech} on YOU Second',
        },
        stackSecond: {
          en: '${mech} on YOU Second',
        },
        bombSecond: {
          en: '${mech} on YOU Second',
        },
        stack: Outputs.stackMarker,
        spread: Outputs.spread,
        bomb: {
          en: 'Stillness',
        },
        fakeBomb: {
          en: 'Motion',
        },
      },
    },
    {
      id: 'DMU P4 Entropy (Early)',
      type: 'GainsEffect',
      netRegex: { effectId: '15AB', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const isEntropyTrue = data.isEntropyTrue;
        if (isEntropyTrue === undefined)
          return;
        return isEntropyTrue
          ? output.puddlesFirst!()
          : output.donutsFirst!();
      },
      outputStrings: {
        puddlesFirst: {
          en: 'Puddles First',
        },
        donutsFirst: {
          en: 'Donuts First',
        },
      },
    },
    {
      id: 'DMU P4 Second Debuffs (Early)',
      // Cast 2:
      // 15A8 Forked Lightning x2 36s
      // 15A7 Cursed Shriek x2 69s
      // 15A9 Compressed Water x2 36s
      // 15AA Acceleration Bomb (2 Long 61s, 2 Short 36s)
      type: 'GainsEffect',
      netRegex: { effectId: ['15A7', '15A8', '15A9', '15AA'], capture: true },
      condition: (data, matches) => {
        return data.me === matches.target && data.grandCrossCount === 2;
      },
      delaySeconds: 0.1,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const hasShreik = data.longShriekPlayers.includes(data.me);
        const hasFork = data.shortForkedPlayers.includes(data.me);
        const hasCompressed = data.shortCompressedPlayers.includes(data.me);
        const hasBomb = data.shortBombPlayers.includes(data.me);
        const isTrue = data.areSecondDebuffsTrue;

        if (isTrue === undefined)
          return;

        // Shriek players always are short bomb
        // This will be two players
        if (hasShreik)
          return output.secondGazeAndBomb!({
            gaze: isTrue ? output.gaze!() : output.fakeGaze!(),
            bomb: isTrue ? output.bomb!() : output.fakeBomb!(),
          });

        // Remaing 6 players will get one debuff
        if ((hasFork && isTrue) || (hasCompressed && !isTrue))
          return output.spreadFirst!({ mech: output.spread!() });
        if ((hasFork && !isTrue) || (hasCompressed && isTrue))
          return output.stackFirst!({ mech: output.stack!() });
        if (hasBomb)
          return output.bombFirst!({
            mech: isTrue ? output.bomb!() : output.fakeBomb!(),
          });
      },
      outputStrings: {
        secondGazeAndBomb: {
          en: '${gaze} + ${bomb} on YOU Second',
        },
        gaze: {
          en: 'Look Away',
        },
        fakeGaze: {
          en: 'Look At',
        },
        spreadFirst: {
          en: '${mech} on YOU First',
        },
        stackFirst: {
          en: '${mech} on YOU First',
        },
        bombFirst: {
          en: '${mech} on YOU First',
        },
        stack: Outputs.stackMarker,
        spread: Outputs.spread,
        bomb: {
          en: 'Stillness',
        },
        fakeBomb: {
          en: 'Motion',
        },
      },
    },
    {
      id: 'DMU P4 Dynamic Fluid (Early)',
      type: 'GainsEffect',
      netRegex: { effectId: '15AC', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const isFluidTrue = data.isDynamicFluidTrue;
        if (isFluidTrue === undefined)
          return;
        return isFluidTrue
          ? output.donutsSecond!()
          : output.puddlesSecond!();
      },
      outputStrings: {
        puddlesSecond: {
          en: 'Puddles Second',
        },
        donutsSecond: {
          en: 'Donuts Second',
        },
      },
    },
    {
      id: 'DMU P4 Third Debuffs',
      // Neo Exdeath Debuffs Cast 3
      // 1317 White Wound (Fake) or 15A5 White Wound
      // 1318 Black Wound (Fake) or 15A6 Black Wound
      // 1558 Beyond Death (Fake) or 566 Beyond Death
      // 1C6 Allagan Field
      type: 'GainsEffect',
      netRegex: {
        effectId: ['1317', '15A5', '1318', '15A6', '566', '1558', '1C6'],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.1,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const wound = data.wound;
        const deathOrField = data.deathOrField;
        if (wound === undefined || deathOrField === undefined)
          return;

        return output.debuffsOnYou!({
          wound: output[wound]!(),
          deathOrField: output[deathOrField]!(),
        });
      },
      outputStrings: {
        death: {
          en: 'Death',
        },
        field: {
          en: 'Field',
        },
        white: {
          en: 'Purple Debuff',
        },
        black: {
          en: 'Blue Debuff',
        },
        debuffsOnYou: {
          en: '${wound} + ${deathOrField} on YOU',
        },
      },
    },
    {
      id: 'DMU P4 Flood of Naught',
      type: 'StartsUsing',
      netRegex: { id: ['C392', 'C393', 'C3A1', 'C3A2'], source: 'Neo Exdeath', capture: true },
      alertText: (data, matches, output) => {
        const wound = data.wound;
        const deathOrField = data.deathOrField;

        if (wound === undefined || deathOrField === undefined)
          return;

        const id = matches.id;
        const isFloodTrue = id === 'C392' || id === 'C393';
        const isBlueLeft = id === 'C3A2' || id === 'C393'; // Our left
        const keep = (deathOrField === 'death' && isFloodTrue) ||
          (deathOrField === 'field' && !isFloodTrue);

        const laser = output[deathOrField]!({
          color: keep
            ? output[wound]!()
            : wound === 'white'
            ? output.black!()
            : output.white!(),
          dir: (keep && wound === 'white' && isBlueLeft) ||
              (keep && wound === 'black' && !isBlueLeft) ||
              (!keep && wound === 'white' && !isBlueLeft) ||
              (!keep && wound === 'black' && isBlueLeft)
            ? output.right!()
            : output.left!(),
        });

        const hasFork = data.shortForkedPlayers.includes(data.me);
        const hasCompressed = data.shortCompressedPlayers.includes(data.me);
        const hasBomb = data.shortBombPlayers.includes(data.me);
        const isTrue = data.areSecondDebuffsTrue;

        if (isTrue === undefined)
          return laser;

        const hasSpread = (hasFork && isTrue) || (hasCompressed && !isTrue);
        const hasStack = (hasFork && !isTrue) || (hasCompressed && isTrue);

        // Handle 2 Mechs
        if (hasSpread && hasBomb)
          return output.laserThenForkBomb!({
            mech1: laser,
            mech2: output.spread!(),
            mech3: isTrue ? output.bomb!() : output.fakeBomb!(),
          });
        if (hasStack && hasBomb)
          return output.laserThenCompressedBomb!({
            mech1: laser,
            mech2: output.stack!(),
            mech3: isTrue ? output.bomb!() : output.fakeBomb!(),
          });
        if (hasSpread)
          return output.laserThenSpread!({
            mech1: laser,
            mech2: output.spread!(),
          });
        if (hasStack)
          return output.laserThenStack!({
            mech1: laser,
            mech2: output.stack!(),
          });
        if (hasBomb)
          return output.laserThenBomb!({
            mech1: laser,
            mech2: isTrue ? output.bomb!() : output.fakeBomb!(),
            mech3: output.stack!(),
          });
        // Has either nothing or long debuffs
        return output.laserThenStack!({
          mech1: laser,
          mech2: output.stack!(),
        });
      },
      outputStrings: {
        death: {
          en: 'Stand in ${color} (${dir})',
        },
        field: {
          en: 'Stand in ${color} (${dir})',
        },
        white: {
          en: 'Purple',
        },
        black: {
          en: 'Blue',
        },
        left: Outputs.left,
        right: Outputs.right,
        laserThenSpread: {
          en: '${mech1} => ${mech2}',
        },
        laserThenStack: {
          en: '${mech1} => ${mech2}',
        },
        laserThenBomb: {
          en: '${mech1} => ${mech2} + ${mech3}',
        },
        laserThenForkBomb: {
          en: '${mech1} => ${mech2} + ${mech3}',
        },
        laserThenCompressedBomb: {
          en: '${mech1} => ${mech2} + ${mech3}',
        },
        stack: Outputs.stackMarker,
        spread: Outputs.spread,
        bomb: {
          en: 'Stillness',
        },
        fakeBomb: {
          en: 'Motion',
        },
      },
    },
    {
      id: 'DMU P4 Short Debuffs',
      // Once hit by C394 White Antilight or C395 Black Antilight, it is safe to move
      type: 'Ability',
      netRegex: { id: ['C394', 'C395'], source: 'Neo Exdeath', capture: false },
      suppressSeconds: 99999,
      alertText: (data, _matches, output) => {
        const hasFork = data.shortForkedPlayers.includes(data.me);
        const hasCompressed = data.shortCompressedPlayers.includes(data.me);
        const hasBomb = data.shortBombPlayers.includes(data.me);
        const is2ndTrue = data.areSecondDebuffsTrue;
        const is1stTrue = data.areFirstDebuffsTrue;

        if (is2ndTrue === undefined || is1stTrue === undefined)
          return;

        const players = data.shortShriekPlayers.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        const gaze = is1stTrue
          ? output.lookAwayFromPlayers!({ players: msg })
          : output.lookAtPlayers!({ players: msg });
        const hasSpread = (hasFork && is2ndTrue) || (hasCompressed && !is2ndTrue);
        const hasStack = (hasFork && !is2ndTrue) || (hasCompressed && is2ndTrue);

        // Handle 2 Mechs
        if (hasSpread && hasBomb)
          return output.forkBombThenGaze!({
            mech1: output.spread!(),
            mech2: is2ndTrue ? output.bomb!() : output.fakeBomb!(),
            mech3: gaze,
          });
        if (hasStack && hasBomb)
          return output.compressedBombThenGaze!({
            mech1: output.stack!(),
            mech2: is2ndTrue ? output.bomb!() : output.fakeBomb!(),
            mech3: gaze,
          });
        if (hasSpread)
          return output.spreadThenGaze!({
            mech1: output.spread!(),
            mech2: gaze,
          });
        if (hasStack)
          return output.stackThenGaze!({
            mech1: output.stack!(),
            mech2: gaze,
          });
        if (hasBomb)
          return output.bombThenGaze!({
            mech1: is2ndTrue ? output.bomb!() : output.fakeBomb!(),
            mech2: output.stack!(),
            mech3: gaze,
          });
        // Has either nothing or long debuffs
        return output.stackThenGaze!({
          mech1: output.stack!(),
          mech2: gaze,
        });
      },
      outputStrings: {
        you: {
          en: 'YOU',
        },
        spreadThenGaze: {
          en: '${mech1} => ${mech2}',
        },
        stackThenGaze: {
          en: '${mech1} => ${mech2}',
        },
        bombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        forkBombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        compressedBombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        stack: Outputs.stackMarker,
        spread: Outputs.spread,
        bomb: {
          en: 'Stillness',
        },
        fakeBomb: {
          en: 'Motion',
        },
        lookAtPlayers: {
          en: 'Face ${players}',
        },
        lookAwayFromPlayers: {
          en: 'Look Away from ${players}',
        },
      },
    },
    {
      id: 'DMU P4 Mana Charge Collect',
      // 5CD Thunder Charged: Store the value of isThunderTrue for later
      // 5CC Blizzard Charged: Store the value of isIceTrue for later
      type: 'GainsEffect',
      netRegex: { effectId: ['5CD', '5CC'], capture: true },
      run: (data, matches) => {
        if (matches.effectId === '5CD')
          data.isThunderChargedTrue = data.isThunderTrue;
        else
          data.isBlizzardChargedTrue = data.isIceTrue;
      },
    },
    {
      id: 'DMU P4 Thrumming Thunder III',
      // BAA4 Mana Charge signifies that the true/fake will be stored for later
      // Indicated with boss buff 5CA Mana Charged and 5CD Thunder Charged
      type: 'StartsUsing',
      netRegex: { id: 'C5DE', source: 'Kefka', capture: false },
      infoText: (data, _matches, output) => {
        return data.isThunderTrue ? output.trueThunder!() : output.fakeThunder!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P4 First Cursed Shriek',
      // TODO: Merge this with Mana Charge (stored fake/real thunder)
      type: 'GainsEffect',
      netRegex: { effectId: '15A7', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) < 61,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const is1stTrue = data.areFirstDebuffsTrue;
        const isEntropyTrue = data.isEntropyTrue;

        if (is1stTrue === undefined || isEntropyTrue === undefined)
          return;

        const players = data.shortShriekPlayers.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        return output.shriekThenEntropy!({
          mech1: is1stTrue
            ? output.lookAwayFromPlayers!({ players: msg })
            : output.lookAtPlayers!({ players: msg }),
          mech2: isEntropyTrue ? output.puddles!() : output.donuts!(),
        });
      },
      outputStrings: {
        you: {
          en: 'YOU',
        },
        shriekThenEntropy: {
          en: '${mech1} => ${mech2}',
        },
        lookAtPlayers: {
          en: 'Face ${players}',
        },
        lookAwayFromPlayers: {
          en: 'Look Away from ${players}',
        },
        donuts: {
          en: 'Stack for Donuts',
          de: 'Für Donuts sammeln',
          fr: 'Packez-vous pour les donuts',
          cn: '集合放月环',
          ko: '모여서 도넛장판 피하기',
          tc: '集合放月環',
        },
        puddles: Outputs.baitPuddles,
      },
    },
    {
      id: 'DMU P4 Entropy',
      // Using the following as possible matches:
      // 15A7 Cursed Shriek x2 60s
      // TODO: Merge this with Mana Charge (stored fake/real thunder)
      type: 'GainsEffect',
      netRegex: { effectId: '15A7', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) < 61,
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 99999,
      alertText: (data, _matches, output) => {
        const isEntropyTrue = data.isEntropyTrue;
        if (isEntropyTrue === undefined)
          return;

        return isEntropyTrue ? output.puddles!() : output.donuts!();
      },
      outputStrings: {
        donuts: {
          en: 'Stack for Donuts',
          de: 'Für Donuts sammeln',
          fr: 'Packez-vous pour les donuts',
          cn: '集合放月环',
          ko: '모여서 도넛장판 피하기',
          tc: '集合放月環',
        },
        puddles: Outputs.baitPuddles,
      },
    },
    {
      id: 'DMU P4/P5 Ultima Upsurge',
      type: 'StartsUsing',
      netRegex: { id: 'C24A', source: 'Kefka', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'DMU P4 Long Debuffs',
      // Using the following as possible matches:
      // 15A8 Forked Lightning x2 76s
      // 15A9 Compressed Water x2 76s
      // 15AA Acceleration Bomb (2 Long 76s)
      type: 'GainsEffect',
      netRegex: { effectId: ['15A8', '15A9', '15AA'], capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) > 75,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      suppressSeconds: 99999,
      alertText: (data, _matches, output) => {
        const hasFork = data.longForkedPlayers.includes(data.me);
        const hasCompressed = data.longCompressedPlayers.includes(data.me);
        const hasBomb = data.longBombPlayers.includes(data.me);
        const is1stTrue = data.areFirstDebuffsTrue;
        const is2ndTrue = data.areSecondDebuffsTrue;

        if (is2ndTrue === undefined || is1stTrue === undefined)
          return;

        const players = data.longShriekPlayers.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        const gaze = is2ndTrue
          ? output.lookAwayFromPlayers!({ players: msg })
          : output.lookAtPlayers!({ players: msg });
        const hasSpread = (hasFork && is1stTrue) || (hasCompressed && !is1stTrue);
        const hasStack = (hasFork && !is1stTrue) || (hasCompressed && is1stTrue);

        // Handle 2 Mechs
        if (hasSpread && hasBomb)
          return output.forkBombThenGaze!({
            mech1: output.spread!(),
            mech2: is1stTrue ? output.bomb!() : output.fakeBomb!(),
            mech3: gaze,
          });
        if (hasStack && hasBomb)
          return output.compressedBombThenGaze!({
            mech1: output.stack!(),
            mech2: is1stTrue ? output.bomb!() : output.fakeBomb!(),
            mech3: gaze,
          });
        if (hasSpread)
          return output.spreadThenGaze!({
            mech1: output.spread!(),
            mech2: gaze,
          });
        if (hasStack)
          return output.stackThenGaze!({
            mech1: output.stack!(),
            mech2: gaze,
          });
        if (hasBomb)
          return output.bombThenGaze!({
            mech1: is1stTrue ? output.bomb!() : output.fakeBomb!(),
            mech2: output.stack!(),
            mech3: gaze,
          });
      },
      outputStrings: {
        you: {
          en: 'YOU',
        },
        spreadThenGaze: {
          en: '${mech1} => ${mech2}',
        },
        stackThenGaze: {
          en: '${mech1} => ${mech2}',
        },
        bombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        forkBombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        compressedBombThenGaze: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        stack: Outputs.stackMarker,
        spread: Outputs.spread,
        bomb: {
          en: 'Stillness',
        },
        fakeBomb: {
          en: 'Motion',
        },
        lookAtPlayers: {
          en: 'Face ${players}',
        },
        lookAwayFromPlayers: {
          en: 'Look Away from ${players}',
        },
      },
    },
    {
      id: 'DMU P4 Blizzard III Blowout',
      // BAA4 Mana Charge signifies that the true/fake will be stored for later
      // Indicated with boss buff 5CA Mana Charged and 5CC Blizzard Charged
      type: 'StartsUsing',
      netRegex: { id: 'BA95', source: 'Kefka', capture: false },
      // Prevent triggering on earlier P1 or P4 triggers
      condition: (data) => data.grandCrossCount === 3,
      infoText: (data, _matches, output) => {
        return data.isIceTrue ? output.trueIce!() : output.fakeIce!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P4 Second Cursed Shriek',
      type: 'GainsEffect',
      netRegex: { effectId: '15A7', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) > 68,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      suppressSeconds: 99999,
      infoText: (data, _matches, output) => {
        const is2ndTrue = data.areSecondDebuffsTrue;
        const isFluidTrue = data.isDynamicFluidTrue;

        if (is2ndTrue === undefined || isFluidTrue === undefined)
          return;

        const players = data.shortShriekPlayers.map(
          (player) => {
            if (player === data.me)
              return output.you!();
            return data.party.member(player);
          },
        );
        const msg = players?.join(', ');

        return output.shriekThenFluid!({
          mech1: is2ndTrue
            ? output.lookAwayFromPlayers!({ players: msg })
            : output.lookAtPlayers!({ players: msg }),
          mech2: isFluidTrue ? output.donuts!() : output.puddles!(),
        });
      },
      outputStrings: {
        you: {
          en: 'YOU',
        },
        shriekThenFluid: {
          en: '${mech1} => ${mech2}',
        },
        lookAtPlayers: {
          en: 'Face ${players}',
        },
        lookAwayFromPlayers: {
          en: 'Look Away from ${players}',
        },
        donuts: {
          en: 'Stack for Donuts',
          de: 'Für Donuts sammeln',
          fr: 'Packez-vous pour les donuts',
          cn: '集合放月环',
          ko: '모여서 도넛장판 피하기',
          tc: '集合放月環',
        },
        puddles: Outputs.baitPuddles,
      },
    },
    {
      id: 'DMU P4 Dynamic Fluid',
      // Using the following as possible matches:
      // 15A7 Cursed Shriek x2 69s
      type: 'GainsEffect',
      netRegex: { effectId: '15A7', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) > 68,
      delaySeconds: (_data, matches) => parseFloat(matches.duration),
      suppressSeconds: 99999,
      alertText: (data, _matches, output) => {
        const isFluidTrue = data.isDynamicFluidTrue;
        if (isFluidTrue === undefined)
          return;

        return isFluidTrue ? output.donuts!() : output.puddles!();
      },
      outputStrings: {
        donuts: {
          en: 'Stack for Donuts',
          de: 'Für Donuts sammeln',
          fr: 'Packez-vous pour les donuts',
          cn: '集合放月环',
          ko: '모여서 도넛장판 피하기',
          tc: '集合放月環',
        },
        puddles: Outputs.baitPuddles,
      },
    },
    {
      id: 'DMU P4 Mana Release',
      // 5CA Mana Charged falls off ~5.4s prior to startsUsing
      // 5CD Thunder Charged and 5CC Blizzard Charged fall off after subsequent
      // Thrumming Thunder III and Blizzard III Blowout startsUsing
      type: 'StartsUsing',
      netRegex: { id: 'BAA5', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const isThunderCharged = data.isThunderChargedTrue;
        const isBlizzardCharged = data.isBlizzardChargedTrue;
        const trueThunder = (isThunderCharged && data.isThunderTrue) ||
          (!isThunderCharged && !data.isThunderTrue);
        const trueIce = (isBlizzardCharged && data.isIceTrue) ||
          (!isBlizzardCharged && !data.isIceTrue);

        if (trueThunder) {
          return trueIce
            ? output.trueIceTrueThunder!()
            : output.fakeIceTrueThunder!();
        }
        return trueIce
          ? output.trueIceFakeThunder!()
          : output.fakeIceFakeThunder!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Future\'s End/Past\'s End': 'Future/Past\'s End',
        'Spelldriver/Spellscatter/Spellwave': 'Spelldriver/scatter/wave',
        'Longitudinal Implosion/Latitudinal Implosion': 'Long/Lat Implosion',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'schwarz(?:e|er|es|en) Loch',
        'Chaos': 'Chaos',
        '(?<! )Exdeath': 'Exdeath',
        'Graven Image': 'heilig(?:e|er|es|en) Statue',
        'Kefka': 'Kefka',
        'Neo Exdeath': 'Neo Exdeath',
      },
      'replaceText': {
        'Aero III Assault': 'Wallendes Windga',
        'Aetherlink': 'Ätherbund',
        'All Things Ending': 'Ende aller Dinge',
        'Ave Maria': 'Ave Maria',
        'Big Bang': 'Quantengravitation',
        'Black Antilight': 'Dunkellicht des Toten',
        'Black Hole': 'Schwarzes Loch',
        'Black Spark': 'Schwarzer Funke',
        'Blizzard III(?! Blowout)': 'Eisga',
        'Blizzard III Blowout': 'Expandierendes Eisga',
        'Bowels of Agony': 'Quälende Eingeweide',
        'Catastrophic Choice': 'Katastrophenwahl',
        'Celestriad': 'Dreigestirn',
        'Chaotic Flare': 'Chaotische Flare',
        'Chaotic Flood': 'Chaotische Flut',
        'Chaotic Holy': 'Chaotisches Sanctus',
        'Cyclone': 'Tornado',
        'Damning Edict': 'Verdammendes Edikt',
        'Death Bolt': 'Todeskeil',
        'Death Bomb': 'Todesbombe',
        'Death Shriek': 'Todesschrei',
        'Death Surge': 'Todeswallung',
        'Death Wave': 'Todeswelle',
        'Definition of Insanity': 'Rekonstruktion',
        'Double-Trouble Trap': 'Fiese Falle',
        '(?<! )Earthquake': 'Erdbeben',
        'Edge of Death': 'Abgrund des Todes',
        'Explosion': 'Explosion',
        'Fell Forces': 'Magieangriff',
        '(?<! )Fire III': 'Feuga',
        'Flagrant Fire III': 'Flammendes Feuga',
        '(?<! )Flare(?! )': 'Flare',
        'Flare Diffusion': 'Flare-Diffusion',
        '(?<! )Flood(?! )': 'Flut',
        'Flood of Naught': 'Flut der Leere',
        'Forsaken(?! [BGN])': 'Verloren',
        'Forsaken Bonds': 'Verlorene Bunde',
        'Forsaken Ground': 'Verlorener Boden',
        'Forsaken Null': 'Verlorenes Sein',
        'Future\'s End': 'Ende der Zukunft',
        'Grand Cross': 'Supernova',
        'Graven Image': 'Göttliche Statue',
        'Gravitas': 'Gravitas',
        'Gravitational Wave': 'Gravitationswelle',
        'Gravity III': 'Graviga',
        '(?<! )Holy': 'Sanctus',
        'Hyperdrive': 'Hyperantrieb',
        'Idyllic Will': 'Idyllischer Wille',
        'Indolent Will': 'Träger Wille',
        'Indulgent Will': 'Nachsichtiger Wille',
        'Inferno': 'Flamme',
        'Intemperate Will': 'Unmäßiger Wille',
        'Kefka Says': 'Schelmische Seele',
        'Knock Down': 'Einschlag',
        'Latitudinal Implosion': 'Horizontale Implosion',
        'Light of Judgment': 'Licht des Urteils',
        'Longitudinal Implosion': 'Vertikale Implosion',
        'Look upon Me and Despair': 'Voller Körpereinsatz',
        'Maddening Orchestra': 'Symphonie des Wahns',
        'Mana Charge': 'Mana-Aufladung',
        'Mana Release': 'Mana-Entladung',
        'Max': 'Riese',
        'Meteor': 'Meteo',
        'Mystery Magic': 'Mysteriöse Magie',
        'Nothingness': 'Welle der Leere',
        'Past\'s End': 'Ende der Vergangenheit',
        'Pulse Wave': 'Pulswelle',
        '(?<![ h])Quake': 'Beben',
        'Revolting Ruin III': 'Revoltierendes Ruinga',
        'Shocking Impact': 'Heftiger Impakt',
        'Shockwave': 'Schockwelle',
        'Slap Happy': 'Kolossale Klatsche',
        'Spelldriver': 'Risikofaktor: Antrieb',
        'Spellscatter': 'Risikofaktor: Streuung',
        'Spellwave': 'Risikofaktor: Welle',
        'Stomp-a-Mole': 'Schallender Stampfer',
        'Stray Apocalypse': 'Chaosende',
        'Stray Entropy': 'Chaoswirbel',
        'Stray Flames': 'Chaosflammen',
        'Stray Spray': 'Chaosspritzer',
        'Tele-trouncing': 'Tückischer Teleport',
        'The Decisive Battle': 'Entscheidungsschlacht',
        'The Path of Light': 'Pfad des Lichts',
        'Thrumming Thunder III': 'Brachiales Blitzga',
        '(?<! )Thunder III': 'Blitzga',
        'Tornado': 'Tornado',
        'Trance': 'Trance',
        'Trine': 'Trine',
        'Tsunami': 'Tsunami',
        'Ultima Blaster': 'Ultima-Kanone',
        'Ultima Repeater': 'Multi-Ultima',
        'Ultima Upsurge': 'Ultima-Wallung',
        'Ultimate Embrace': 'Ultima-Umarmung',
        'Umbra Smash': 'Schattenschlag',
        'Vacuum Wave': 'Vakuumwelle',
        'Vitrophyre': 'Vitrophyr',
        'Wave Cannon': 'Wellenkanone',
        'White Antilight': 'Dunkellicht des Lebenden',
        'White Hole': 'Weißes Loch',
        'Wings of Destruction': 'Vernichtungsschwinge',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'trou noir',
        'Chaos': 'Chaos',
        '(?<! )Exdeath': 'Exdeath',
        'Graven Image': 'statue divine',
        'Kefka': 'Kefka',
        'Neo Exdeath': 'Néo-Exdeath',
      },
      'replaceText': {
        'Aero III Assault': 'Méga Vent véhément',
        'Aetherlink': 'Lien éthéré',
        'All Things Ending': 'Fin de toutes choses',
        'Ave Maria': 'Ave Maria',
        'Big Bang': 'Saillie',
        'Black Antilight': 'Lumière sombre du défunt',
        'Black Hole': 'Trou noir',
        'Black Spark': 'Étincelle noire',
        'Blizzard III(?! Blowout)': 'Méga Glace',
        'Blizzard III Blowout': 'Méga Glace propagatrice',
        'Bowels of Agony': 'Entrailles de l\'agonie',
        'Catastrophic Choice': 'Catastrophe double',
        'Celestriad': 'Tristella',
        'Chaotic Flare': 'Brasier chaotique',
        'Chaotic Flood': 'Déluge chaotique',
        'Chaotic Holy': 'Miracle chaotique',
        'Cyclone': 'Tornade',
        'Damning Edict': 'Décret accablant',
        'Death Bolt': 'Éclair fatal',
        'Death Bomb': 'Bombe fatale',
        'Death Shriek': 'Hurlement fatal',
        'Death Surge': 'Poussée fatale',
        'Death Wave': 'Vague fatale',
        'Definition of Insanity': 'Reconstruction',
        'Double-Trouble Trap': 'Pièges successifs',
        '(?<! )Earthquake': 'Séisme',
        'Edge of Death': 'Lisière de la mort',
        'Explosion': 'Explosion',
        'Fell Forces': 'Frappe maléfique',
        '(?<! )Fire III': 'Méga Feu',
        'Flagrant Fire III': 'Méga Feu faufilant',
        '(?<! )Flare(?! )': 'Brasier',
        'Flare Diffusion': 'Brasier diffuseur',
        '(?<! )Flood(?! )': 'Déluge',
        'Flood of Naught': 'Crue du néant',
        'Forsaken(?! [BGN])': 'Cataclysme',
        'Forsaken Bonds': 'Cataclysme lié',
        'Forsaken Ground': 'Cataclysme tellurique',
        'Forsaken Null': 'Cataclysme initial',
        'Future\'s End': 'Fin du futur',
        'Grand Cross': 'Croix suprême',
        'Graven Image': 'Statue divine',
        'Gravitas': 'Tir gravitationnel',
        'Gravitational Wave': 'Onde gravitationnelle',
        'Gravity III': 'Méga Gravité',
        '(?<! )Holy': 'Miracle',
        'Hyperdrive': 'Colonne de feu',
        'Idyllic Will': 'Volonté idyllique',
        'Indolent Will': 'Volonté indolente',
        'Indulgent Will': 'Volonté indulgente',
        'Inferno': 'Flammes',
        'Intemperate Will': 'Volonté intempérante',
        'Kefka Says': 'Âmes facétieuses',
        'Knock Down': 'Impact de canon',
        'Latitudinal Implosion': 'Implosion horizontale',
        'Light of Judgment': 'Triade guerrière',
        'Longitudinal Implosion': 'Implosion verticale',
        'Look upon Me and Despair': 'Moi, au naturel',
        'Maddening Orchestra': 'Symphonie de la démence',
        'Mana Charge': 'Concentration de mana',
        'Mana Release': 'Décharge de mana',
        'Max': 'Maxi',
        'Meteor': 'Météore',
        'Mystery Magic': 'Magie énigmatique',
        'Nothingness': 'Rayon du néant',
        'Past\'s End': 'Fin du passé',
        'Primordial Crust Quake': '',
        'Pulse Wave': 'Pulsation spirituelle',
        '(?<![ h])Quake': 'Séisme',
        'Revolting Ruin III': 'Méga Ruine ravageuse',
        'Shocking Impact': 'Impact puissant',
        'Shockwave': 'Onde de choc',
        'Slap Happy': 'Gifle cinglante',
        'Spelldriver': 'Péril magique chargé',
        'Spellscatter': 'Peril magique dispersé',
        'Spellwave': 'Peril magique ondulé',
        'Stomp-a-Mole': 'Piétinement frénétique',
        'Stray Apocalypse': 'Crépuscule chaotique',
        'Stray Entropy': 'Tourbillon chaotique',
        'Stray Flames': 'Flammes du chaos',
        'Stray Spray': 'Eaux du chaos',
        'Tele-trouncing': 'Téléportation perfide',
        'The Decisive Battle': 'Combat décisif',
        'The Path of Light': 'Voie de Lumière',
        'Thrumming Thunder III': 'Méga Foudre fourmillante',
        '(?<! )Thunder III': 'Méga Foudre',
        'Tornado': 'Tornade',
        'Trance': 'Transe',
        'Trine': 'Trine',
        'Tsunami': 'Raz-de-marée',
        'Ultima Blaster': 'Ultima fulgurante',
        'Ultima Repeater': 'Ultima en pagaille',
        'Ultima Upsurge': 'Ultima ulcérante',
        'Ultimate Embrace': 'Étreinte fatidique',
        'Umbra Smash': 'Fracas ombral',
        'Vacuum Wave': 'Vague de vide',
        'Vitrophyre': 'Vitrophyre',
        'Wave Cannon': 'Canon plasma',
        'White Antilight': 'Lumière sombre du vivant',
        'White Hole': 'Trou blanc',
        'Wings of Destruction': 'Aile de la destruction',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': 'ブラックホール',
        'Chaos': 'カオス',
        '(?<! )Exdeath': 'エクスデス',
        'Graven Image': '神々の像',
        'Kefka': 'ケフカ',
        'Neo Exdeath': 'ネオエクスデス',
      },
      'replaceText': {
        'Aero III Assault': 'ずんずんエアロガ',
        'Aetherlink': 'エーテルリンク',
        'All Things Ending': '消滅の脚',
        'Ave Maria': 'アヴェ・マリア',
        'Big Bang': '突出',
        'Black Antilight': '死者の暗黒光',
        'Black Hole': 'ブラックホール',
        'Black Spark': 'ブラックスパーク',
        'Blizzard III(?! Blowout)': 'ブリザガ',
        'Blizzard III Blowout': 'ひろげるブリザガ',
        'Bowels of Agony': 'バウル・オブ・アゴニー',
        'Catastrophic Choice': '二択のカタストロフ',
        'Celestriad': 'スリースターズ',
        'Chaotic Flare': 'カオティックフレア',
        'Chaotic Flood': 'カオティックフラッド',
        'Chaotic Holy': 'カオティックホーリー',
        'Cyclone': 'たつまき',
        'Damning Edict': 'ダミングイーディクト',
        'Death Bolt': 'デスボルト',
        'Death Bomb': 'デスボム',
        'Death Shriek': 'デスシュリーク',
        'Death Surge': 'デスサージ',
        'Death Wave': 'デスウェーブ',
        'Definition of Insanity': '再構築',
        'Double-Trouble Trap': 'つぎつぎトラップ',
        '(?<! )Earthquake': 'じしん',
        'Edge of Death': '生死の境界',
        'Explosion': '爆発',
        'Fell Forces': '魔撃',
        '(?<! )Fire III': 'ファイガ',
        'Flagrant Fire III': 'めらめらファイガ',
        '(?<! )Flare(?! )': 'フレア',
        'Flare Diffusion': 'フレアディフュージョン',
        '(?<! )Flood(?! )': 'フラッド',
        'Flood of Naught': '無の氾濫',
        'Forsaken(?! [BGN])': 'ミッシング',
        'Forsaken Bonds': 'ミッシング・ボンド',
        'Forsaken Ground': 'ミッシング・グラウンド',
        'Forsaken Null': 'ミッシング・ゼロ',
        'Future\'s End': '未来の終焉',
        'Grand Cross': 'グランドクロス',
        'Graven Image': '神々の像',
        'Gravitas': '重力弾',
        'Gravitational Wave': '重力波',
        'Gravity III': 'グラビガ',
        '(?<! )Holy': 'ホーリー',
        'Hyperdrive': 'ハイパードライブ',
        'Idyllic Will': '睡魔の神気',
        'Indolent Will': '惰眠の神気',
        'Indulgent Will': '聖母の神気',
        'Inferno': 'ほのお',
        'Intemperate Will': '撲殺の神気',
        'Kefka Says': 'おちょくりソウル',
        'Knock Down': '着弾',
        'Latitudinal Implosion': 'ホリゾンタルインプロージョン',
        'Light of Judgment': '裁きの光',
        'Longitudinal Implosion': 'ヴァーティカルインプロージョン',
        'Look upon Me and Despair': 'ありのままのボクチン',
        'Maddening Orchestra': '狂気のオーケストラ',
        'Mana Charge': 'マジックチャージ',
        'Mana Release': 'マジックアウト',
        'Max': 'マキシマム',
        'Meteor': 'メテオ',
        'Mystery Magic': 'なぞなぞマジック',
        'Nothingness': '無の波動',
        'Past\'s End': '過去の終焉',
        'Pulse Wave': '波動弾',
        '(?<![ h])Quake': 'クエイク',
        'Revolting Ruin III': 'ばりばりルインガ',
        'Shocking Impact': '重衝撃',
        'Shockwave': '衝撃波',
        'Slap Happy': 'びんびんビンタ',
        'Spelldriver': 'スペルハザード・ドライブ',
        'Spellscatter': 'スペルハザード・スキャッター',
        'Spellwave': 'スペルハザード・ウェーブ',
        'Stomp-a-Mole': 'どんどこ地団駄',
        'Stray Apocalypse': '混沌の終末',
        'Stray Entropy': '混沌の渦',
        'Stray Flames': '混沌の炎',
        'Stray Spray': '混沌の水',
        'Tele-trouncing': 'ずびずばテレポ',
        'The Decisive Battle': '決戦',
        'The Path of Light': '光の波動',
        'Thrumming Thunder III': 'もりもりサンダガ',
        '(?<! )Thunder III': 'サンダガ',
        'Tornado': 'トルネド',
        'Trance': 'トランス',
        'Trine': 'トライン',
        'Tsunami': 'つなみ',
        'Ultima Blaster': 'アルテマブラスター',
        'Ultima Repeater': '連続アルテマ',
        'Ultima Upsurge': 'どきどきアルテマ',
        'Ultimate Embrace': '終末の双腕',
        'Umbra Smash': 'アンブラスマッシュ',
        'Vacuum Wave': '真空波',
        'Vitrophyre': '岩石弾',
        'Wave Cannon': '波動砲',
        'White Antilight': '生者の暗黒光',
        'White Hole': 'ホワイトホール',
        'Wings of Destruction': '破壊の翼',
      },
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': '黑洞',
        'Chaos': '卡奥斯',
        '(?<! )Exdeath': '艾克斯迪司',
        'Graven Image': '众神之像',
        'Kefka': '凯夫卡',
        'Neo Exdeath': '新生艾克斯迪司',
      },
      'replaceText': {
        '\\(castbar\\)': '(咏唱栏)',
        '\\(Chaos': '(卡奥斯',
        '\\(Exdeath': '(艾克斯迪司',
        '\\(Pop Window\\)': '(引爆)',
        '--accretion\\?--': '--混沌之泥土?--',
        '--both targetable--': '--都可选中--',
        '--Chaos untargetable\\?--': '--卡奥斯不可选中?--',
        '--Exdeath untargetable\\?--': '--艾克斯迪司不可选中?--',
        '--middle\\?--': '--中间?--',
        '--numbers--': '--麻将--',
        '--single target--': '--单目标--',
        '--untargetable\\?--': '--不可选中?--',
        'Accretion Earthquake': '混沌之泥土 地震',
        'Aero III Assault': '疼飕飕暴风',
        'Aetherlink': '以太连接',
        'All Things Ending': '消灭之脚',
        'Ave Maria': '圣母颂',
        'Big Bang': '顶起',
        'Black Antilight': '死者暗黑光',
        'Black Hole': '黑洞',
        'Black Spark': '暗黑火花',
        'Blackblood': '흑혈',
        'Blizzard III(?! Blowout)': '冰封',
        'Blizzard III Blowout': '扩大大冰封',
        'Bowels of Agony': '深层痛楚',
        'Catastrophic Choice': '二选一的灾祟',
        'Celestriad': '三星',
        'Chaotic Flare': '混沌核爆',
        'Chaotic Flood': '混沌洪水',
        'Chaotic Holy': '混沌神圣',
        'Cyclone': '龙卷风',
        'Damning Edict': '诅咒敕令',
        'Death Bolt': '死亡落雷',
        'Death Bomb': '死亡爆弹',
        'Death Shriek': '死亡尖叫',
        'Death Surge': '死亡波涛',
        'Death Wave': '死亡波纹',
        'Definition of Insanity': '重构',
        'Double-Trouble Trap': '连环环陷阱',
        'Down for the Count': '击倒',
        '(?<! )Earthquake': '地震',
        'Edge of Death': '生死之境',
        'Explosion': '爆炸',
        'Fell Forces': '魔击',
        '(?<! )Fire III': '爆炎',
        'Flagrant Fire III': '呼啦啦爆炎',
        '(?<! )Flare(?! )': '核爆',
        'Flare Diffusion': '核爆扩散',
        '(?<! )Flood(?! )': '洪水',
        'Flood of Naught': '无之泛滥',
        'Forsaken(?! [BGN])': '遗弃末世',
        'Forsaken Bonds': '遗弃末狱',
        'Forsaken Ground': '遗弃末地',
        'Forsaken Null': '遗弃末点',
        'Future\'s End': '未来终结',
        'Grand Cross': '大十字',
        'Graven Image': '众神之像',
        'Gravitas': '重力弹',
        'Gravitational Wave': '重力波',
        'Gravity III': '强重力',
        '(?<! )Holy': '神圣',
        'Hyperdrive': '超驱动',
        'Idyllic Will': '睡魔的神气',
        'Indolent Will': '懒惰的神气',
        'Indulgent Will': '圣母的神气',
        'Inferno': '烈焰',
        'Intemperate Will': '扑杀的神气',
        'Kefka Says': '闹哄哄魂击',
        'Knock Down': '轰击',
        'Latitudinal Implosion': '纬度聚爆',
        'Light of Judgment': '制裁之光',
        'Longitudinal Implosion': '经度聚爆',
        'Look upon Me and Despair': '本色出演的我',
        'Maddening Orchestra': '癫狂交响曲',
        'Mana Charge': '魔法储存',
        'Mana Release': '魔法放出',
        'Max': '放大',
        'Meteor': '陨石',
        'Mystery Magic': '玄乎乎魔法',
        'Nothingness': '无之波动',
        'Past\'s End': '过去终结',
        'Primordial Crust Quake': '混沌之土 地震',
        'Pulse Wave': '波动弹',
        '(?<![ h])Quake': '地震',
        'Revolting Ruin III': '恶狠狠毁荡',
        'Shocking Impact': '重冲击',
        'Shockwave': '冲击波',
        'Slap Happy': '响亮亮耳光',
        'Spelldriver': '咏唱危机·驱动',
        'Spellscatter': '咏唱危机·散碎',
        'Spellwave': '咏唱危机·波动',
        'Stomp-a-Mole': '轰隆隆跺脚',
        'Stray Apocalypse': '混沌末世',
        'Stray Entropy': '混沌涡旋',
        'Stray Flames': '混沌之炎',
        'Stray Spray': '混沌之水',
        'Tele-trouncing': '唰啦啦传送',
        'The Decisive Battle': '决战',
        'The Path of Light': '光之波动',
        'Thrumming Thunder III': '劈啪啪暴雷',
        '(?<! )Thunder III': '暴雷',
        'Tornado': '龙卷',
        'Trance': '幻化',
        'Trine': '异三角',
        'Tsunami': '海啸',
        'Ultima Blaster': '究极冲击波',
        'Ultima Repeater': '连续究极',
        'Ultima Upsurge': '扑腾腾究极',
        'Ultimate Embrace': '终末双腕',
        'Umbra Smash': '本影爆碎',
        'Vacuum Wave': '真空波',
        'Vitrophyre': '岩石弹',
        'Wave Cannon': '波动炮',
        'White Antilight': '生者暗黑光',
        'White Hole': '白洞',
        'Wings of Destruction': '破坏之翼',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Black Hole': '블랙홀',
        'Chaos': '카오스',
        '(?<! )Exdeath': '엑스데스',
        'Graven Image': '신들의 상',
        'Kefka': '케프카',
        'Neo Exdeath': '네오 엑스데스',
      },
      'replaceText': {
        '\\(Pop Window\\)': '(활성화)',
        '\\(castbar\\)': '(시전바)',
        '\\(Chaos': '(카오스',
        '\\(Exdeath': '(엑스데스',
        '--numbers--': '--숫자--',
        '--accretion\\?--': '--혼돈의 진흙?--',
        '--untargetable\\?--': '--타겟 불가능?--',
        '--middle\\?--': '--중앙?--',
        '--Chaos untargetable\\?--': '--카오스 타겟 불가능?--',
        '--Exdeath untargetable\\?--': '--엑스데스 타겟 불가능?--',
        'Accretion Earthquake': '혼돈의 진흙 지진',
        'Aero III Assault': '갈기갈기 에어로가',
        'Aetherlink': '에테르 연결',
        'All Things Ending': '소멸의 발차기',
        'Ave Maria': '아베 마리아',
        'Big Bang': '돌출',
        'Black Antilight': '죽은 자의 암흑광',
        'Black Hole': '블랙홀',
        'Black Spark': '검은 불꽃',
        'Blackblood': '흑혈',
        'Blizzard III(?! Blowout)': '블리자가',
        'Blizzard III Blowout': '널리널리 블리자가',
        'Bowels of Agony': '고통의 심핵',
        'Catastrophic Choice': '두 가지 선택의 참사',
        'Celestriad': '세 개의 별',
        'Chaotic Flare': '혼돈의 플레어',
        'Chaotic Flood': '혼돈의 홍수',
        'Chaotic Holy': '혼돈의 홀리',
        'Cyclone': '회오리',
        'Damning Edict': '파멸 포고',
        'Death Bolt': '죽음의 번개',
        'Death Bomb': '죽음의 폭탄',
        'Death Shriek': '죽음의 비명',
        'Death Surge': '죽음의 격동',
        'Death Wave': '죽음의 파도',
        'Definition of Insanity': '재구성',
        'Double-Trouble Trap': '줄줄이 함정',
        'Down for the Count': '행동 불가',
        '(?<! )Earthquake': '지진',
        'Edge of Death': '생사의 갈림길',
        'Explosion': '폭발',
        'Fell Forces': '마격',
        '(?<! )Fire III': '파이가',
        'Flagrant Fire III': '이글이글 파이가',
        '(?<! )Flare(?! )': '플레어',
        'Flare Diffusion': '확산 플레어',
        '(?<! )Flood(?! )': '플러드',
        'Flood of Naught': '무의 범람',
        'Forsaken(?! [BGN])': '행방불명',
        'Forsaken Bonds': '행방불명: 유대',
        'Forsaken Ground': '행방불명: 지면',
        'Forsaken Null': '행방불명: 소실',
        'Future\'s End/Past\'s End': '과거/미래의 종언',
        'Grand Cross': '그랜드크로스',
        'Graven Image': '신들의 상',
        'Gravitas': '중력탄',
        'Gravitational Wave': '중력파',
        'Gravity III': '그라비가',
        '(?<! )Holy': '홀리',
        'Hyperdrive': '하이퍼드라이브',
        'Idyllic Will': '수마의 신기',
        'Indolent Will': '태만의 신기',
        'Indulgent Will': '성모의 신기',
        'Inferno': '화염',
        'Intemperate Will': '박살의 신기',
        'Kefka Says': '꼭두각시 영혼',
        'Knock Down': '착탄',
        'Light of Judgment': '심판의 빛',
        'Longitudinal Implosion/Latitudinal Implosion': '가로/세로 내파',
        'Look upon Me and Despair': '있는 그대로의 나',
        'Maddening Orchestra': '광기의 오케스트라',
        'Mana Charge': '마력 충전',
        'Mana Release': '마력 방출',
        'Max': '맥시멈',
        'Meteor': '메테오',
        'Mystery Magic': '알쏭달쏭 마법',
        'Nothingness': '무의 파동',
        'Primordial Crust Quake': '혼돈의 흙 퀘이크',
        'Pulse Wave': '파동탄',
        '(?<![ h])Quake': '퀘이크',
        'Revolting Ruin III': '파삭파삭 루인가',
        'Shocking Impact': '겹충격',
        'Shockwave': '충격파',
        'Slap Happy': '철썩철썩 따귀',
        'Spelldriver/Spellscatter/Spellwave': '위험한 주문: 집중/분산/파동',
        'Stomp-a-Mole': '쿵쿵 발 구르기',
        'Stray Apocalypse': '혼돈의 종말',
        'Stray Entropy': '혼돈의 와류',
        'Stray Flames': '혼돈의 불',
        'Stray Spray': '혼돈의 물',
        'Tele-trouncing': '성큼성큼 텔레포',
        'The Decisive Battle': '결전',
        'The Path of Light': '빛의 파동',
        'Thrumming Thunder III': '찌릿찌릿 선더가',
        '(?<! )Thunder III': '선더가',
        'Tornado': '토네이도',
        'Trance': '자아도취',
        'Trine': '트라인',
        'Tsunami': '해일',
        'Ultima Blaster': '알테마 블래스터',
        'Ultima Repeater': '연속 알테마',
        'Ultima Upsurge': '두근두근 알테마',
        'Ultimate Embrace': '종말의 포옹',
        'Umbra Smash': '그림자 타격',
        'Vacuum Wave': '진공파',
        'Vitrophyre': '암석탄',
        'Wave Cannon': '파동포',
        'White Antilight': '산 자의 암흑광',
        'White Hole': '화이트홀',
        'Wings of Destruction': '파괴의 날개 ',
      },
    },
  ],
};

export default triggerSet;
