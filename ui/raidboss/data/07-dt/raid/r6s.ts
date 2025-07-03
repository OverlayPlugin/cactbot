import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputIntercard,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// TODOs:
// - clean up timeline
// - Crowd Brûlée - party stack (non-defamations)?
// - safe corners for quicksand? (Latte / party fill strats?)
// - Live Painting - add wave # spawn call?
// - Ore-rigato - Mu enrage
// - Hangry Hiss - Gimme Cat enrage
// - Mousse Drip - ranged baits into 4x pair stacks/puddle drops
// - Moussacre - melee bait proteans

export interface Data extends RaidbossData {
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  lastDoubleStyle?: DoubleStyleEntry;
  tetherTracker: { [id: string]: NetMatches['Tether'] };
  colorRiotTint?: 'warm' | 'cool';
  cloudId?: string;
  cloudPos?: 'dirNE' | 'dirNW' | 'dirS';
  cloudLastAngle?: number;
  cloudNewAngle?: number;
  cloudExplosionCount: number;
  firstTowersGone: boolean;
  secondTowers: { [dir in DirectionOutput8]?: number };
}

// I lack the footage to confirm these, but they should be correct.
// There are second set of 24 locations immediately before this which correspond to
// the "meteor falling" animation
const towerMapEffectMapping: { [loc: string]: DirectionOutput8 } = {
  '49': 'dirNW',
  '4A': 'dirNW',
  '4B': 'dirNW',
  '4C': 'dirNW',
  '4D': 'dirNW',
  '4E': 'dirNW',
  '4F': 'dirNW',
  '50': 'dirNW',
  '51': 'dirNE',
  '52': 'dirNE',
  '53': 'dirNE',
  '54': 'dirNE',
  '55': 'dirNE',
  '56': 'dirNE',
  '57': 'dirNE',
  '58': 'dirNE',
  '59': 'dirS',
  '5A': 'dirS',
  '5B': 'dirS',
  '5C': 'dirS',
  '5D': 'dirS',
  '5E': 'dirS',
  '5F': 'dirS',
  '60': 'dirS',
};

const towerFlags = {
  show: '00020001',
  hide: '00080004',
} as const;

type DoubleStyleActors = 'bomb' | 'wing' | 'succ' | 'marl';
type DoubleStyleEntry = {
  red: DoubleStyleActors;
  blue: DoubleStyleActors;
  count: number;
};
const doubleStyleMap: { [id: string]: DoubleStyleEntry } = {
  '93CA': { red: 'marl', blue: 'succ', count: 2 },
  '9408': { red: 'succ', blue: 'marl', count: 2 },
  'A67D': { red: 'marl', blue: 'marl', count: 2 },
  'A67E': { red: 'succ', blue: 'succ', count: 2 },
  'A67F': { red: 'bomb', blue: 'succ', count: 4 },
  'A680': { red: 'wing', blue: 'succ', count: 4 },
  'A681': { red: 'bomb', blue: 'marl', count: 4 },
  'A682': { red: 'wing', blue: 'marl', count: 4 },
};

const dirToSameCorners = (dir: DirectionOutput8): DirectionOutput8[] => {
  switch (dir) {
    case 'dirN':
      return ['dirNE', 'dirNW'];
    case 'dirE':
      return ['dirSE', 'dirNE'];
    case 'dirS':
      return ['dirSE', 'dirSW'];
    case 'dirW':
      return ['dirNW', 'dirSW'];
  }
  return [];
};

const headMarkerData = {
  // Jabberwock bind/death target
  'bindMarker': '0017',
  // Lightning Storm target
  'lightningStormMarker': '025A',
  // Pudding Party x5 stack
  'puddingPartyMarker': '0131',
} as const;

type CactusPattern = {
  readonly id: string;
  readonly x: number;
  readonly y: number;
};

// Unique positions for cacti in first set for each pattern
const cactusSpamPatterns: CactusPattern[] = [
  { id: '1', x: 100.009, y: 89.999 },
  { id: '2', x: 116.001, y: 116.001 },
  { id: '3', x: 100.009, y: 100.009 },
  { id: '4', x: 110.996, y: 116.001 },
];

// Positions for cacti corresponding to danger corner
const cactusQuicksandPatterns: CactusPattern[] = [
  { id: 'dirNE', x: 116.001, y: 83.987 },
  { id: 'dirSE', x: 116.001, y: 116.001 },
  { id: 'dirSW', x: 83.987, y: 116.001 },
  { id: 'dirNW', x: 83.987, y: 83.987 },
];

const findCactus = <T extends CactusPattern>(
  patterns: T[],
  x: number,
  y: number,
): T | undefined => {
  return patterns.find((coords) => {
    return Math.abs(coords.x - x) < 0.005 && Math.abs(coords.y - y) < 0.005;
  });
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM2Savage',
  zoneId: ZoneId.AacCruiserweightM2Savage,
  timelineFile: 'r6s.txt',
  initData: () => ({
    actorSetPosTracker: {},
    tetherTracker: {},
    cloudExplosionCount: 0,
    firstTowersGone: false,
    secondTowers: {},
  }),
  triggers: [
    {
      id: 'R6S Mousse Mural',
      type: 'StartsUsing',
      netRegex: { id: 'A6BC', source: 'Sugar Riot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R6S ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) => data.actorSetPosTracker[matches.id] = matches,
    },
    {
      id: 'R6S Sticky Mousse',
      type: 'StartsUsing',
      netRegex: { id: 'A695', source: 'Sugar Riot', capture: false },
      response: Responses.spreadThenStack(),
    },
    {
      id: 'R6S Color Riot Debuff Tracker',
      type: 'GainsEffect',
      netRegex: { effectId: ['1163', '1164'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => data.colorRiotTint = matches.effectId === '1163' ? 'warm' : 'cool',
    },
    {
      id: 'R6S Color Riot',
      type: 'StartsUsing',
      netRegex: { id: ['A691', 'A692'], source: 'Sugar Riot', capture: true },
      alertText: (data, matches, output) => {
        if (data.role !== 'tank')
          return output.avoidCleave!();

        const coolInOut = matches.id === 'A691' ? output.in!() : output.out!();
        const warmInOut = matches.id === 'A692' ? output.in!() : output.out!();

        switch (data.colorRiotTint) {
          case 'warm':
            return output.coolCleave!({ dir: coolInOut });
          case 'cool':
            return output.warmCleave!({ dir: warmInOut });
          default:
            return output.tankCleave!();
        }
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
        warmCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Red)',
          de: 'Tank Cleave auf DIR (${dir} => von Rot treffen lassen)',
          fr: 'Tank cleave sur VOUS (${dir} => prenez le Rouge)',
          ja: 'タンク攻撃 (${dir} => 赤に当たる)',
          cn: '坦克死刑 (${dir} => 吃红色)',
          ko: '광역 탱버 대상자 (${dir} => 빨간색 맞기)',
        },
        coolCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Blue)',
          de: 'Tank Cleave auf DIR (${dir} => von Blau treffen lassen)',
          fr: 'Tank cleave sur VOUS (${dir} => prenez le Bleu)',
          ja: 'タンク攻撃 (${dir} => 青に当たる)',
          cn: '坦克死刑 (${dir} => 吃蓝色)',
          ko: '광역 탱버 대상자 (${dir} => 파란색 맞기)',
        },
        tankCleave: Outputs.tankCleaveOnYou,
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R6S Color Clash',
      type: 'StartsUsing',
      netRegex: { id: ['A68B', 'A68D'], source: 'Sugar Riot', capture: true },
      infoText: (_data, matches, output) => {
        const mech = matches.id === 'A68B' ? 'healerStacks' : 'partners';
        return output.stored!({ mech: output[mech]!() });
      },
      outputStrings: {
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
        stored: {
          en: 'Stored ${mech} for later',
          de: '${mech} gespeichert für später',
          fr: '${mech} sauvegardé pour après',
          ja: 'あとで ${mech}',
          cn: '稍后 ${mech}',
          ko: '나중에 ${mech}',
        },
      },
    },
    {
      id: 'R6S Color Clash Followup',
      type: 'StartsUsing',
      netRegex: { id: ['A68B', 'A68D'], source: 'Sugar Riot', capture: true },
      delaySeconds: 18,
      alertText: (_data, matches, output) => {
        const mech = matches.id === 'A68B' ? 'healerStacks' : 'partners';
        return output[mech]!();
      },
      outputStrings: {
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
      },
    },
    {
      id: 'R6S Double Style Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(doubleStyleMap), source: 'Sugar Riot', capture: true },
      run: (data, matches) => data.lastDoubleStyle = doubleStyleMap[matches.id],
    },
    {
      // tether source is from the actor to the boss
      id: 'R6S Double Style Tether Tracker',
      type: 'Tether',
      netRegex: { sourceId: '4[0-9A-Fa-f]{7}', id: ['013F', '0140'], capture: true },
      condition: (data) => data.lastDoubleStyle !== undefined,
      preRun: (data, matches) => data.tetherTracker[matches.sourceId] = matches,
      infoText: (data, _matches, output) => {
        const doubleStyle = data.lastDoubleStyle;
        if (doubleStyle === undefined)
          return;

        if (Object.keys(data.tetherTracker).length < doubleStyle.count)
          return;

        let safeDirs: DirectionOutputIntercard[] = [
          'dirNE',
          'dirNW',
          'dirSE',
          'dirSW',
        ];

        const startDirMap = {
          'dirNE': 'dirSW',
          'dirNW': 'dirSE',
          'dirSE': 'dirNW',
          'dirSW': 'dirNE',
          'unknown': 'unknown',
        } as const;

        // clean-up so we don't trigger on other tether mechanics
        delete data.lastDoubleStyle;

        const tethers = Object.entries(data.tetherTracker);
        data.tetherTracker = {};

        for (const [id, tether] of tethers) {
          const actorSetPosData = data.actorSetPosTracker[id];
          if (actorSetPosData === undefined) {
            console.log(`R6S Double Style Tether Tracker - Missing actor position data!`);
            return;
          }

          const actorType = doubleStyle[tether.id === '013F' ? 'red' : 'blue'];
          const x = parseFloat(actorSetPosData.x);
          const y = parseFloat(actorSetPosData.y);
          const mirroredX = ((x - 100) * -1) + 100;
          const actorDir = Directions.xyTo8DirOutput(x, y, 100, 100);
          const mirroredXDir = Directions.xyTo8DirOutput(mirroredX, y, 100, 100);
          const sameDirCorners = dirToSameCorners(actorDir);

          switch (actorType) {
            case 'bomb':
              safeDirs = safeDirs.filter((dir) => dir !== actorDir);
              break;
            case 'wing':
              safeDirs = safeDirs.filter((dir) => dir !== mirroredXDir);
              break;
            case 'succ':
              safeDirs = safeDirs.filter((dir) => !sameDirCorners.includes(dir));
              break;
            case 'marl':
              safeDirs = safeDirs.filter((dir) => sameDirCorners.includes(dir));
              break;
          }
        }

        const [dir] = safeDirs;

        if (safeDirs.length !== 1 || dir === undefined) {
          console.log(`R6S Double Style Tether Tracker - Missing direction data!`);
          return;
        }

        const startDir = startDirMap[dir] ?? 'unknown';

        return output.text!({
          dir1: output[startDir]!(),
          dir2: output[dir]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        text: {
          en: 'Start ${dir1}, launch towards ${dir2}',
          de: 'Start ${dir1}, Rückstoß nach ${dir2}',
          fr: 'Commencez ${dir1}, poussée vers ${dir2}',
          ja: '${dir1} から ${dir2} に飛ぶ',
          cn: '从 ${dir1} 飞向 ${dir2}',
          ko: '${dir1}에서 ${dir2}으로 발사되기',
        },
      },
    },
    {
      id: 'R6S Heating Up Early Warning',
      type: 'GainsEffect',
      netRegex: { effectId: '1166', capture: true },
      condition: (data, matches) => data.me === matches.target && data.role !== 'healer',
      infoText: (_data, _matches, output) => output.defamationLater!(),
      outputStrings: {
        defamationLater: {
          en: 'Defamation on YOU (for later)',
          de: 'Große AoE auf DIR (für später)',
          fr: 'Diffamation sur VOUS (pour après)',
          ja: 'あとで巨大な爆発',
          cn: '稍后放大圈',
          ko: '광역징 대상자 (나중에)',
        },
      },
    },
    {
      id: 'R6S Heating Up',
      type: 'GainsEffect',
      netRegex: { effectId: '1166', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      countdownSeconds: 5,
      alertText: (_data, _matches, output) => output.defamation!(),
      outputStrings: {
        defamation: Outputs.defamationOnYou,
      },
    },
    {
      // tether source is from the player to the boss
      id: 'R6S Pudding Graf',
      type: 'Tether',
      netRegex: { id: ['013F', '0140'], capture: true },
      condition: (data, matches) => data.me === matches.source,
      infoText: (_data, matches, output) => {
        if (matches.id === '013F')
          return output.wingedBomb!();
        return output.bomb!();
      },
      outputStrings: {
        bomb: {
          en: 'Drop bomb in quicksand',
          de: 'Lege Bombe im Treibsand',
          fr: 'Déposez la bombe dans le sable mouvant',
          ja: '爆弾を流砂に捨てる',
          cn: '流沙里放置炸弹',
          ko: '늪에 폭탄 놓기',
        },
        wingedBomb: {
          en: 'Aim bomb towards quicksand',
          de: 'Ziele mit der Bombe auf den Treibsand',
          fr: 'Dirigez la bombe vers le sable mouvant',
          ja: '爆弾を流砂に向ける',
          cn: '面向流沙放置飞弹',
          ko: '늪 쪽을 향해 폭탄 놓기',
        },
      },
    },
    {
      id: 'R6S Jabberwock Bind Marker',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.bindMarker, capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Jabberwock on YOU',
          de: 'Brabbelback auf DIR',
          fr: 'Jabberwocky sur VOUS',
          ja: 'ジャバウォック処理',
          cn: '马止步点名',
          ko: '재버워크 대상자',
        },
      },
    },
    {
      id: 'R6S Ready Ore Not',
      type: 'StartsUsing',
      netRegex: { id: 'A6AA', source: 'Sugar Riot', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R6S Single Style',
      type: 'StartsUsing',
      netRegex: { id: '9A3D', source: 'Sugar Riot', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid arrow lines',
          de: 'Vermeide Pfeil-Linien',
          fr: 'Évitez les lignes de flèches',
          ja: '矢印線を避ける',
          cn: '躲避场边箭直线',
          ko: '화살 직선 장판 피하기',
        },
      },
    },
    {
      id: 'R6S Double Style Taste of Fire/Thunder',
      type: 'StartsUsing',
      netRegex: { id: ['A687', 'A689'], source: 'Sugar Riot', capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) =>
        matches.id === 'A687' ? output.fire!() : output.thunder!(),
      outputStrings: {
        fire: {
          en: 'Healer groups in water, avoid arrow lines',
          de: 'Heiler Gruppen im Wasser, vermeide Pfeil-Linien',
          fr: 'Groupes sur les heals dans l\'eau, évitez les lignes de flèches',
          ja: 'ヒラ組で水へ、矢印線を避ける',
          cn: '水中双奶分组分摊 + 躲避场边箭直线',
          ko: '물에서 힐러 그룹, 화살 직선 장판 피하기',
        },
        thunder: {
          en: 'Spread out of water, avoid arrow lines',
          de: 'Außerhalb des Wassers verteilen, vermeide Pfeil-Linien',
          fr: 'Dipersion hors de l\'eau, évitez les lignes de flèches',
          ja: '水を避けて散開、矢印線を避ける',
          cn: '陆地分散 + 躲避场边箭直线',
          ko: '물 밖에서 산개, 화살 직선 장판 피하기',
        },
      },
    },
    {
      id: 'R6S Taste of Thunder (Twister/Stepped Leader)',
      type: 'StartsUsing',
      netRegex: { id: 'A69D', source: 'Sugar Riot', capture: false },
      suppressSeconds: 1,
      response: Responses.moveAway(),
    },
    {
      id: 'R6S Lightning Storm',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.lightningStormMarker, capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread('alert'),
    },
    {
      id: 'R6S Pudding Party',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.puddingPartyMarker, capture: true },
      infoText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.stackOnYou!();
        return output.stackOn!({ target: matches.target });
      },
      outputStrings: {
        stackOnYou: {
          en: 'Stack on YOU x5',
          de: 'Sammeln auf DIR x5',
          fr: 'Package sur VOUS x5',
          ja: '5回連続頭割り',
          cn: '分摊五连点名',
          ko: '쉐어 x5 대상자',
        },
        stackOn: {
          en: 'Stack on ${target} x5',
          de: 'Sammeln auf ${target} x5',
          fr: 'Package sur ${target} x5',
          ja: '${target} に 5回 連続頭割り',
          cn: '分摊五连点 ${target} ',
          ko: '쉐어 x5 ${target}',
        },
      },
    },
    {
      id: 'R6S Cactus Spam Pattern Identifier',
      type: 'StartsUsingExtra',
      netRegex: { id: 'A6A1' },
      condition: (_data, matches) => {
        const matchX = parseFloat(matches.x);
        const matchY = parseFloat(matches.y);
        const cactus = findCactus(cactusSpamPatterns, matchX, matchY);
        return cactus !== undefined;
      },
      suppressSeconds: 9999,
      infoText: (_data, matches, output) => {
        const matchX = parseFloat(matches.x);
        const matchY = parseFloat(matches.y);
        const cactus = findCactus(cactusSpamPatterns, matchX, matchY);
        if (cactus === undefined)
          return;

        switch (cactus.id) {
          case '1':
            return output.pattern1!();
          case '2':
            return output.pattern2!();
          case '3':
            return output.pattern3!();
          case '4':
            return output.pattern4!();
        }

        return output.unknown!();
      },
      outputStrings: {
        unknown: Outputs.unknown,
        pattern1: {
          en: 'Cactus Pattern 1',
          de: 'Kaktus-Muster 1',
          fr: 'Cactus Pattern 1',
          cn: '仙人掌类型 1',
          ko: '선인장 패턴 1',
        },
        pattern2: {
          en: 'Cactus Pattern 2 (bad)',
          de: 'Kaktus-Muster 2 (schlecht)',
          fr: 'Cactus Pattern 2 (mauvais)',
          cn: '仙人掌类型 2 (差)',
          ko: '선인장 패턴 2 (어려움)',
        },
        pattern3: {
          en: 'Cactus Pattern 3',
          de: 'Kaktus-Muster 3',
          fr: 'Cactus Pattern 3',
          cn: '仙人掌类型 3',
          ko: '선인장 패턴 3',
        },
        pattern4: {
          en: 'Cactus Pattern 4',
          de: 'Kaktus-Muster 4',
          fr: 'Cactus Pattern 4',
          cn: '仙人掌类型 4',
          ko: '선인장 패턴 4',
        },
      },
    },
    {
      id: 'R6S Cactus Quicksand Pattern Identifier',
      type: 'StartsUsingExtra',
      netRegex: { id: '9A2C' },
      condition: (_data, matches) => {
        const matchX = parseFloat(matches.x);
        const matchY = parseFloat(matches.y);
        const cactus = findCactus(cactusQuicksandPatterns, matchX, matchY);
        return cactus !== undefined;
      },
      suppressSeconds: 9999,
      infoText: (_data, matches, output) => {
        const matchX = parseFloat(matches.x);
        const matchY = parseFloat(matches.y);
        const cactus = findCactus(cactusQuicksandPatterns, matchX, matchY);
        if (cactus === undefined)
          return;

        switch (cactus.id) {
          case 'dirNE':
          case 'dirSE':
          case 'dirSW':
          case 'dirNW':
            return output.cactus!({ dir: output[cactus.id]!() });
        }

        return output.unknown!();
      },
      outputStrings: {
        unknown: Outputs.unknown,
        ...Directions.outputStrings8Dir,
        cactus: {
          en: 'Danger Cactus ${dir}',
          de: 'Gefährlicher Kaktus ${dir}',
          fr: 'Cactus dangereux ${dir}',
          cn: '危险仙人掌 ${dir}',
          ko: '위험한 선인장 ${dir}',
        },
      },
    },
    {
      id: 'R6S Tempest Piece Spawn Collector',
      type: 'AddedCombatant',
      netRegex: { npcNameId: '13827', capture: true },
      condition: (data) => data.cloudId === undefined,
      preRun: (data, matches) => {
        data.cloudId = matches.id;
        const cloudDir =
          Directions.output8Dir[Directions.addedCombatantPosTo8Dir(matches, 100, 100)];
        switch (cloudDir) {
          case 'dirNE':
          case 'dirNW':
          case 'dirS':
            data.cloudPos = cloudDir;
            break;
          default:
            console.log(
              `R6S Tempest Piece Spawn Collector - Invalid cloud spawn direction ${cloudDir}`,
            );
            return;
        }
        const cloudX = parseFloat(matches.x);
        const cloudY = parseFloat(matches.y);
        data.cloudLastAngle = Math.atan2(cloudX - 100, cloudY - 100);
        // For the initial spawn, the actor moves in place which causes a false positive firing
        // of the detection trigger. Avoid it by setting new angle to last angle
        data.cloudNewAngle = data.cloudLastAngle;
      },
      infoText: (data, _matches, output) =>
        output.spawn!({ dir: output[data.cloudPos ?? 'unknown']!() }),
      outputStrings: {
        ...Directions.outputStrings8Dir,
        spawn: {
          en: 'Cloud spawning ${dir}',
          de: 'Wolke erscheint ${dir}',
          fr: 'Apparition du nuage ${dir}',
          cn: '雷云生成在 ${dir}',
          ko: '${dir}에 구름 소환',
        },
      },
    },
    {
      id: 'R6S Tempest Piece Rotation Detector',
      type: 'ActorMove',
      netRegex: { capture: true },
      condition: (data, matches) => {
        if (matches.id !== data.cloudId)
          return false;
        return data.cloudId !== undefined && data.cloudLastAngle !== undefined &&
          data.cloudNewAngle === undefined && data.cloudExplosionCount < 5;
      },
      preRun: (data, matches) => {
        const cloudX = parseFloat(matches.x);
        const cloudY = parseFloat(matches.y);
        data.cloudNewAngle = Math.atan2(cloudX - 100, cloudY - 100);
      },
      infoText: (data, _matches, output) => {
        const lastAngle = data.cloudLastAngle;
        const newAngle = data.cloudNewAngle;
        if (lastAngle === undefined || newAngle === undefined)
          throw new UnreachableCode();
        const cwRotation = (Math.PI + newAngle) < (Math.PI + lastAngle);
        if (data.cloudPos === 'dirNE') {
          data.cloudPos = cwRotation ? 'dirS' : 'dirNW';
        } else if (data.cloudPos === 'dirNW') {
          data.cloudPos = cwRotation ? 'dirNE' : 'dirS';
        } else {
          data.cloudPos = cwRotation ? 'dirNW' : 'dirNE';
        }
        return output.text!({
          rot: output[cwRotation ? 'cw' : 'ccw']!(),
          dir: output[data.cloudPos ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cw: Outputs.clockwise,
        ccw: Outputs.counterclockwise,
        text: {
          en: 'Cloud rotating ${rot} towards ${dir}',
          de: 'Wolke rotiert ${rot} Richtung ${dir}',
          fr: 'Rotation du nuage ${rot} vers ${dir}',
          cn: '雷云旋转 ${rot} 朝 ${dir}',
          ko: '구름이 ${dir}쪽으로 ${rot} 회전',
        },
      },
    },
    {
      id: 'R6S Tempest Piece Cleanup 1',
      type: 'StartsUsing',
      netRegex: { id: 'A69B', capture: true },
      condition: (data) => {
        return data.cloudId !== undefined && data.cloudLastAngle !== undefined &&
          data.cloudNewAngle !== undefined;
      },
      run: (data, matches) => {
        const cloudX = parseFloat(matches.x);
        const cloudY = parseFloat(matches.y);
        data.cloudLastAngle = Math.atan2(cloudX - 100, cloudY - 100);
        delete data.cloudNewAngle;
        data.cloudExplosionCount++;
      },
    },
    {
      id: 'R6S Tempest Piece Cleanup 2',
      type: 'RemovedCombatant',
      netRegex: { npcNameId: '13827', capture: true },
      condition: (data, matches) => {
        if (data.cloudId === undefined)
          return false;
        if (data.cloudId !== matches.id)
          return false;

        return true;
      },
      run: (data) => {
        delete data.cloudId;
        delete data.cloudPos;
        delete data.cloudLastAngle;
        delete data.cloudNewAngle;
      },
    },
    {
      id: 'R6S First Towers Detector',
      type: 'MapEffect',
      netRegex: {
        location: Object.keys(towerMapEffectMapping),
        flags: towerFlags.hide,
        capture: false,
      },
      condition: (data) => data.firstTowersGone === false,
      run: (data) => data.firstTowersGone = true,
    },
    {
      id: 'R6S Second Towers Collector',
      type: 'MapEffect',
      netRegex: {
        location: Object.keys(towerMapEffectMapping),
        flags: towerFlags.show,
        capture: true,
      },
      condition: (data) => data.firstTowersGone === true,
      preRun: (data, matches) => {
        const dir = towerMapEffectMapping[matches.location];
        if (dir === undefined) {
          console.log(
            `R6S Second Towers Collector - Invalid location somehow, ${matches.location}`,
          );
          return;
        }
        if (dir !== 'dirNW' && dir !== 'dirNE' && dir !== 'dirS') {
          console.log(
            `R6S Second Towers Collector - Invalid location mapping somehow, ${matches.location}`,
          );
          return;
        }
        data.secondTowers[dir] = (data.secondTowers[dir] ?? 0) + 1;
      },
      infoText: (data, _matches, output) => {
        const nwCount = data.secondTowers.dirNW ?? 0;
        const neCount = data.secondTowers.dirNE ?? 0;
        const sCount = data.secondTowers.dirS ?? 0;
        if (nwCount + neCount + sCount < 8)
          return;

        if (sCount === 8)
          return output.eightSouth!();
        if (nwCount === 4)
          return output.fourNW!();
        if (neCount === 4)
          return output.fourNE!();
        return output.unknown!();
      },
      outputStrings: {
        unknown: Outputs.unknown,
        // These outputStrings values are written this way to allow users to replace them
        // with "all south", "clockwise", "counterclockwise" to match the common strat
        eightSouth: {
          en: '8 Towers S',
          de: '8 Türme S',
          fr: '8 Tours S',
          cn: '南方八塔',
          ko: '남쪽 탑 8개',
        },
        fourNW: {
          en: '4 Towers NW',
          de: '4 Türme NW',
          fr: '4 Tours NO',
          cn: '西北四塔',
          ko: '북서쪽 탑 4개',
        },
        fourNE: {
          en: '4 Towers NE',
          de: '4 Türme NO',
          fr: '4 Tours NE',
          cn: '东北四塔',
          ko: '북동쪽 탑 4개',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Mouthwatering Morbol': 'Zucker-Morbol',
        'Sugar Riot': 'Zuckerschock',
        'Sweet Shot': 'Zuckerpfeil',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(snapshot\\)': '(Speichern)',
        '--2x Feather Ray targetable--': '--2x Federrochen anvisierbar--',
        '--2x Mu targetable--': '--2x Mu anvisierbar--',
        '--Gimme Cat targetable--': '--Bettelcat anvisierbar--',
        '--Jabberwock targetable--': '--Brabbelback anvisierbar--',
        '--Yan targetable--': '--Putschi anvisierbar--',
        '--jump\\?--': '--Sprung?--',
        'Artistic Anarchy': 'Artistische Anarchie',
        'Bad Breath': 'Schlechter Atem',
        'Brûlée': 'Wärmeentladung',
        'Burst': 'Explosion',
        'Color Clash': 'Farbbruch',
        'Color Riot': 'Farbenschock',
        'Cool Bomb': 'Kalte Farbbombe',
        'Crowd Brûlée': 'Hitzeentladung',
        'Dark Mist': 'Schattenhauch',
        'Double Style': 'Doppel-Graffiti',
        'Explosion': 'Explosion',
        'Layer': 'Feinschliff',
        'Levin Drop': 'Stromfluss',
        'Lightning Bolt': 'Blitzschlag',
        'Lightning Storm': 'Blitzsturm',
        'Live Painting': 'Sofortkunst',
        'Moussacre': 'Mousse-Marsch',
        'Mousse Drip': 'Mousse-Spritzer',
        'Mousse Mural': 'Mousse-Regen',
        'Pudding Graf': 'Pudding-Platzer',
        'Pudding Party': 'Pudding-Party',
        'Ready Ore Not': 'Edelstein-Regen',
        'Rush': 'Stürmen',
        'Single Style': 'Einzel-Graffiti',
        'Soul Sugar': 'Zuckerseele',
        'Spray Pain': 'Nadelschuss',
        'Sticky Mousse': 'Klebriges Mousse',
        'Sugarscape': 'Landschaftsmalerei',
        'Taste of Fire': 'Zuckerfeuer',
        'Taste of Thunder': 'Zuckerblitz',
        'Warm Bomb': 'Warme Farbbombe',
        'Wingmark': 'Flügelzeichen',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Mouthwatering Morbol': 'Morbol mielleux',
        'Sugar Riot': 'Sugar Riot',
        'Sweet Shot': 'Flèche sirupeuse',
      },
      'replaceText': {
        '\\(cast\\)': '(Incantation)',
        '\\(snapshot\\)': '(Enregistré)',
        '--2x Feather Ray targetable--': '-- 2x Manta ciblable--',
        '--2x Mu targetable--': '-- 2x Mu ciblable --',
        '--Gimme Cat targetable--': '-- Chat-pardeur ciblable --',
        '--Jabberwock targetable--': '-- Jabberwocky ciblable --',
        '--Yan targetable--': '-- Belhamel ciblable --',
        '--jump\\?--': '-- Saut --',
        'Artistic Anarchy': 'Anarchie artistique',
        'Bad Breath': 'Mauvaise haleine',
        'Brûlée': 'Dissipation thermique',
        'Burst': 'Explosion',
        'Color Clash': 'Impact chromatique',
        'Color Riot': 'Révolte chromatique',
        'Cool Bomb': 'Bombe de couleurs froides',
        'Crowd Brûlée': 'Dissipation enflammée',
        'Dark Mist': 'Brume funèbre',
        'Double Style': 'Double graffiti',
        'Explosion': 'Explosion',
        'Layer': 'Retouche',
        'Levin Drop': 'Courant électrique',
        'Lightning Bolt': 'Fulguration',
        'Lightning Storm': 'Pluie d\'éclairs',
        'Live Painting': 'Peinture vivante',
        'Moussacre': 'Défilé de mousse',
        'Mousse Drip': 'Mousse éclaboussante',
        'Mousse Mural': 'Averse de mousse',
        'Pudding Graf': 'Pudding pétulent',
        'Pudding Party': 'Fête du flan',
        'Ready Ore Not': 'Gemmes la pluie !',
        'Rush': 'Ruée',
        'Single Style': 'Graffiti simple',
        'Soul Sugar': 'Âme en sucre',
        'Spray Pain': 'Aiguilles foudroyantes',
        'Sticky Mousse': 'Mousse collante',
        'Sugarscape': 'Nature morte',
        'Taste of Fire': 'Feu sirupeux',
        'Taste of Thunder': 'Foudre sucrée',
        'Warm Bomb': 'Bombe de couleurs chaudes',
        'Wingmark': 'Emblème ailé',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Mouthwatering Morbol': 'シュガーズモルボル',
        'Sugar Riot': 'シュガーライオット',
        'Sweet Shot': 'シュガーズアロー',
      },
      'replaceText': {
        'Artistic Anarchy': 'アーティスティック・アナーキー',
        'Bad Breath': '臭い息',
        'Brûlée': '熱放散',
        'Burst': '爆発',
        'Color Clash': 'カラークラッシュ',
        'Color Riot': 'カラーライオット',
        'Cool Bomb': 'コールドペイントボム',
        'Crowd Brûlée': '重熱放散',
        'Dark Mist': 'ダークミスト',
        'Double Style': 'ダブル・グラフィティ',
        'Layer': 'アレンジ',
        'Levin Drop': '雷流',
        'Lightning Bolt': 'いなずま',
        'Lightning Storm': '百雷',
        'Live Painting': 'ライブペインティング',
        'Moussacre': 'ムース大行進',
        'Mousse Drip': 'びちゃっとムース',
        'Mousse Mural': 'ムースシャワー',
        'Pudding Graf': 'ぼっかんプリン',
        'Pudding Party': 'プリンパーティー',
        'Ready Ore Not': '原石あげる',
        'Rush': '突進',
        'Single Style': 'シングル・グラフィティ',
        'Soul Sugar': 'シュガーソウル',
        'Spray Pain': '針飛ばし',
        'Sticky Mousse': 'ねばねばムース',
        'Sugarscape': 'ランドスケープ',
        'Taste of Fire': 'シュガーファイア',
        'Taste of Thunder': 'シュガーサンダー',
        'Warm Bomb': 'ウォームペイントボム',
        'Wingmark': 'ウイングマーク',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Mouthwatering Morbol': '糖糖魔界花',
        'Sugar Riot': '狂热糖潮',
        'Sweet Shot': '糖糖箭',
      },
      'replaceText': {
        '\\(cast\\)': '(咏唱)',
        '\\(snapshot\\)': '(快照)',
        '--2x Feather Ray targetable--': '--2x 羽环鳐 可选中--',
        '--2x Mu targetable--': '--2x 亩鼠 可选中--',
        '--Gimme Cat targetable--': '--索取猫 可选中--',
        '--Jabberwock targetable--': '--炸脖龙 可选中--',
        '--Yan targetable--': '--羊 可选中--',
        '--jump\\?--': '--跳?--',
        'Artistic Anarchy': '艺术大乱斗',
        'Bad Breath': '臭气',
        'Brûlée': '热扩散',
        'Burst': '爆炸',
        'Color Clash': '色彩冲击',
        'Color Riot': '色彩狂热',
        'Cool Bomb': '冷色爆弹怪',
        'Crowd Brûlée': '重热扩散',
        'Dark Mist': '暗黑雾',
        'Double Style': '双手涂鸦',
        'Explosion': '爆炸',
        'Layer': '添笔',
        'Levin Drop': '雷流',
        'Lightning Bolt': '落雷',
        'Lightning Storm': '百雷',
        'Live Painting': '即兴绘画',
        'Moussacre': '慕斯慕斯冲',
        'Mousse Drip': '啪叽慕斯怪',
        'Mousse Mural': '慕斯怪大雨',
        'Pudding Graf': '咣当软糊怪',
        'Pudding Party': '软糊怪派对',
        'Ready Ore Not': '给你原石',
        'Rush': '突进',
        'Single Style': '单手涂鸦',
        'Soul Sugar': '糖糖之魂',
        'Spray Pain': '飞针',
        'Sticky Mousse': '黏黏慕斯怪',
        'Sugarscape': '糖心绘景',
        'Taste of Fire': '糖糖火炎',
        'Taste of Thunder': '糖糖闪雷',
        'Warm Bomb': '暖色爆弹怪',
        'Wingmark': '翅膀标记',
      },
    },
  ],
};

export default triggerSet;
