import Conditions from '../../../../../resources/conditions';
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
// - thunderstorm movement for rotate cw/ccw call?
// - Mousse Drip - ranged baits into 4x pair stacks/puddle drops
// - Moussacre - melee bait proteans
// - tower soaks

export interface Data extends RaidbossData {
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  lastDoubleStyle?: DoubleStyleEntry;
  tetherTracker: { [id: string]: NetMatches['Tether'] };
  colorRiotTint?: 'warm' | 'cool';
}

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
          ja: 'ボス背面のサークル上に',
          ko: '보스 히트박스 경계에 있기 (광역 탱버 피하기)',
        },
        warmCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Red)',
          ja: 'タンク攻撃 (${dir} => 赤に当たる)',
          ko: '광역 탱버 대상자 (${dir} => 빨간색 맞기)',
        },
        coolCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Blue)',
          ja: 'タンク攻撃 (${dir} => 青に当たる)',
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
          fr: 'Commencez ${dir1}, lancez vers ${dir2}',
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
          ja: 'あとで巨大な爆発',
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
          ja: '爆弾を流砂に捨てる',
          ko: '늪에 폭탄 놓기',
        },
        wingedBomb: {
          en: 'Aim bomb towards quicksand',
          ja: '爆弾を流砂に向ける',
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
          ja: 'ジャバウォック処理',
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
          ja: '矢印線を避ける',
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
          ja: 'ヒラ組で水へ、矢印線を避ける',
          ko: '물에서 힐러 그룹, 화살 직선 장판 피하기',
        },
        thunder: {
          en: 'Spread out of water, avoid arrow lines',
          ja: '水を避けて散開、矢印線を避ける',
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
          ja: '5回連続頭割り',
          ko: '쉐어 x5 대상자',
        },
        stackOn: {
          en: 'Stack on ${target} x5',
          ja: '${target} に 5回 連続頭割り',
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
        },
        pattern2: {
          en: 'Cactus Pattern 2 (bad)',
        },
        pattern3: {
          en: 'Cactus Pattern 3',
        },
        pattern4: {
          en: 'Cactus Pattern 4',
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
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Mouthwatering Morbol': 'Zucker-Morbol',
        'Sugar Riot': 'Zuckerschock',
        'Sweet Shot': 'Zuckerpfeil',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(snapshot\\)': '(Speichern)',
        '--Yan targetable--': '--Putschi anvisierbar--',
        '--2x Mu targetable--': '--2x Mu anvisierbar--',
        '--Gimme Cat targetable--': '--Bettelcat anvisierbar--',
        '--2x Feather Ray targetable--': '--2x Federrochen anvisierbar--',
        '--Jabberwock targetable--': '--Brabbelback anvisierbar--',
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
      'missingTranslations': true,
      'replaceSync': {
        'Mouthwatering Morbol': 'Morbol mielleux',
        'Sugar Riot': 'Sugar Riot',
        'Sweet Shot': 'Flèche sirupeuse',
      },
      'replaceText': {
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
  ],
};

export default triggerSet;
