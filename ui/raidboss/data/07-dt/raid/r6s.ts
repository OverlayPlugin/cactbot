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
// - safe corners for quicksand?
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
        },
        warmCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Red)',
        },
        coolCleave: {
          en: 'Tank cleave on YOU (${dir} => get hit by Blue)',
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
      id: 'R6S Double Style Tether Tracker',
      type: 'Tether',
      netRegex: { targetId: '4[0-9A-Fa-f]{7}', id: ['013F', '0140'], capture: true },
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

        const tethers = Object.entries(data.tetherTracker);
        data.tetherTracker = {};

        for (const [id, tether] of tethers) {
          const actorSetPosData = data.actorSetPosTracker[id];
          if (actorSetPosData === undefined)
            return;

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
          console.log(`R6S Double Style Tether Tracker - Invalid data!`);
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
        },
        wingedBomb: {
          en: 'Aim bomb towards quicksand',
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
        },
      },
    },
    {
      id: 'R6S Double Style Taste of Fire/Thunder',
      type: 'StartsUsing',
      netRegex: { id: ['A687', 'A689'], source: 'Sugar Riot', capture: true },
      suppressSeconds: 1,
      infoText: (_data, matches, output) =>
        matches.id === 'A687' ? output.fire!() : output.thunder!(),
      outputStrings: {
        fire: Outputs.healerGroups,
        thunder: Outputs.spread,
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
        },
        stackOn: {
          en: 'Stack on ${target} x5',
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
        'Mouthwatering Morbol': 'morbol mielleux',
        'Sugar Riot': 'Sugar Riot',
        'Sweet Shot': 'flèche sirupeuse',
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
