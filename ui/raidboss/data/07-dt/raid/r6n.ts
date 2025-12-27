import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const mapEffectData = {
  // Deathwall dropping
  '00': {
    'location': '00',
    'flags0': '00020001',
  },

  // Desert mural painting
  '01': {
    'location': '01',
    // Desert
    'desert': '00020001',
    // Desert + Sun
    'sun': '00040004',
    // Desert + Sun + Cactus
    'cactus': '00800040',
    // Desert + Sun + Cactus + Sinkhole
    'sink': '02000100',
    // Clear the effect/return to normal
    'clear': '00080004',
    // Reset on clear
    'reset': '00200010',
  },

  // River mural painting
  '02': {
    'location': '02',
    // River
    'flags0': '00020001',
    // Muddy river
    'flags3': '00200010',
    // Thunderclouds
    'clear4': '00800040',
    // Clear the effect/return to normal
    'clear2': '00080004',
    // Reset on clear
    'flags1': '00040004',
  },

  // Arena floor
  '03': {
    'location': '03',
    // Desert
    'flags0': '00020001',
    // Bright Desert (sun DoT)
    'flags4': '02000100',
    // Reset to normal arena floor from desert
    'flags3': '00800001',
    // River arena grassy floor
    'clear1': '00080004',
    // Reset to normal arena floor from river
    'flags2': '00200010',
  },

  // Also arena floor, only for river phase
  '04': {
    'location': '04',
    // River appears
    'flags0': '00020001',
    // River red aoe indicator
    'clear2': '00800040',
    // Muddy river
    'flags1': '00200010',
    // Clear at end of phase
    'flags3': '08000004',
  },

  // no slot 05 in any of my logs???

  // 06 -> 23: Unsure, probably each one of these corresponds to a cactus during the desert cactus aoe spam
  '06': {
    'location': '06',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '07': {
    'location': '07',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '08': {
    'location': '08',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '09': {
    'location': '09',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0A': {
    'location': '0A',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0B': {
    'location': '0B',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0C': {
    'location': '0C',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0D': {
    'location': '0D',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0E': {
    'location': '0E',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0F': {
    'location': '0F',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '10': {
    'location': '10',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '11': {
    'location': '11',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '12': {
    'location': '12',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '13': {
    'location': '13',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '14': {
    'location': '14',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '15': {
    'location': '15',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '16': {
    'location': '16',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '17': {
    'location': '17',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '18': {
    'location': '18',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '19': {
    'location': '19',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1A': {
    'location': '1A',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1B': {
    'location': '1B',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1C': {
    'location': '1C',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1D': {
    'location': '1D',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1E': {
    'location': '1E',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1F': {
    'location': '1F',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00200010',
  },
  '20': {
    'location': '20',
    'flags0': '00040004',
  },
  '21': {
    'location': '21',
    'flags0': '00040004',
  },
  '22': {
    'location': '22',
    'flags0': '00040004',
  },
  '23': {
    'location': '23',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00200010',
  },

  // River phase rain effect
  '24': {
    'location': '24',
    // Rain on
    'flags0': '00020001',
    // Rain off
    'clear1': '00080004',
  },

  // Unknown, something to do with floor changing maybe?
  '25': {
    'location': '25',
    'flags0': '00020004',
  },
} as const;
console.assert(mapEffectData);

// Arrows, bombs, etc get their position set before the animation for the tether starts showing.
// Probably we want a general `ActorSetPos` tracking trigger for this fight.

const headMarkerData = {
  // Spread marker from Mousse Touch-up
  'spreadMarker': '008B',
  // 5-hit stack marker from Pudding Party
  'stack': '0131',
  // Tankbuster circles from Color Riot
  'tankbuster': '0156',
  // Fire stacks on healers
  'fireStack': '024C',
  // Lightning spread marker
  'lightningSpread': '024D',
} as const;

export interface Data extends RaidbossData {
  colorRiotTargets: string[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM2',
  zoneId: ZoneId.AacCruiserweightM2,
  timelineFile: 'r6n.txt',
  initData: () => ({
    colorRiotTargets: [],
  }),
  triggers: [
    {
      id: 'R6N Mousse Mural',
      type: 'StartsUsing',
      netRegex: { id: 'A66F', source: 'Sugar Riot', capture: false },
      response: Responses.aoe(),
    },
    {
      // cast is self-targeted on boss
      id: 'R6N Pudding Party',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.stack, capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      // cast is self-targeted on boss
      id: 'R6N Color Riot',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankbuster, capture: true },
      infoText: (data, matches, output) => {
        data.colorRiotTargets.push(matches.target);
        if (data.colorRiotTargets.length < 2)
          return;

        if (data.colorRiotTargets.includes(data.me))
          return output.cleaveOnYou!();
        return output.avoidCleave!();
      },
      run: (data) => {
        if (data.colorRiotTargets.length >= 2)
          data.colorRiotTargets = [];
      },
      outputStrings: {
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleave: Outputs.avoidTankCleave,
      },
    },
    {
      id: 'R6N Mousse Touch-up',
      type: 'StartsUsing',
      netRegex: { id: 'A675', source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R6N Taste of Fire',
      type: 'StartsUsing',
      netRegex: { id: ['A65B', 'A65C'], source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: {
          en: 'Healer Groups (in water)',
          de: 'Heiler Grußßen (ins Wasser)',
          fr: 'Pack sur les heals (dans l\'eau)',
          cn: '治疗分组分摊 (站在水里)',
          tc: '治療分組分攤 (站在水裡)',
          ko: '물에서 힐러 그룹 쉐어',
        },
      },
    },
    {
      id: 'R6N Taste of Thunder',
      type: 'StartsUsing',
      netRegex: { id: 'A65E', source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.spread!(),
      outputStrings: {
        spread: {
          en: 'Spread (not in water)',
          de: 'Verteilen (nicht ins Wasser)',
          fr: 'Dispersion (hors de l\'eau)',
          cn: '分散 (站在岸上)',
          tc: '分散 (站在岸上)',
          ko: '땅에서 산개',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Heaven Bomb': 'geflügelt(?:e|er|es|en) Bombe',
        'Paint Bomb': 'Graffiti-Bombe',
        'Sugar Riot': 'Zuckerschock',
        'Sweet Shot': 'Zuckerpfeil',
        'Tempest Piece': 'Cumulonimbus-Wolke',
      },
      'replaceText': {
        '\\(cast\\)': '(wirken)',
        '\\(snapshot\\)': '(Speichern)',
        '\\(spread\\)': '(verteilen)',
        'Burst': 'Explosion',
        'Color Riot': 'Farbenschock',
        'Cool Bomb': 'Kalte Farbbombe',
        'Double Style': 'Doppel-Graffiti',
        'Highlightning': 'Frontgewitter',
        'Layer': 'Feinschliff',
        'Lightning Bolt': 'Blitzschlag',
        'Mousse Mural': 'Mousse-Regen',
        'Mousse Touch-up': 'Mini-Mousse-Regen',
        'Pudding Party': 'Pudding-Party',
        'Rush': 'Stürmen',
        'Single Style': 'Einzel-Graffiti',
        'Spray Pain': 'Nadelschuss',
        'Sugarscape': 'Landschaftsmalerei',
        'Taste of Fire': 'Zuckerfeuer',
        'Taste of Thunder': 'Zuckerblitz',
        'Warm Bomb': 'Warme Farbbombe',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Heaven Bomb': 'Bombe ailée',
        'Paint Bomb': 'Bombe de peinture',
        'Sugar Riot': 'Sugar Riot',
        'Sweet Shot': 'Flèche sirupeuse',
        'Tempest Piece': 'Cumulonimbus',
      },
      'replaceText': {
        '\\(cast\\)': '(incante)',
        '\\(snapshot\\)': '(retouche)',
        '\\(spread\\)': '(dispertion)',
        'Burst': 'Explosion',
        'Color Riot': 'Révolte chromatique',
        'Cool Bomb': 'Bombe de couleurs froides',
        'Double Style': 'Double graffiti',
        'Highlightning': 'Décharge céleste',
        'Layer': 'Retouche',
        'Lightning Bolt': 'Fulguration',
        'Mousse Mural': 'Averse de mousse',
        'Mousse Touch-up': 'Mini averse de mousse',
        'Pudding Party': 'Fête du flan',
        'Rush': 'Ruée',
        'Single Style': 'Graffiti simple',
        'Spray Pain': 'Aiguilles foudroyantes',
        'Sugarscape': 'Nature morte',
        'Taste of Fire': 'Feu sirupeux',
        'Taste of Thunder': 'Foudre sucrée',
        'Warm Bomb': 'Bombe de couleurs chaudes',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Heaven Bomb': 'ウィングボム',
        'Paint Bomb': 'グラフィティボム',
        'Sugar Riot': 'シュガーライオット',
        'Sweet Shot': 'シュガーズアロー',
        'Tempest Piece': '積乱雲',
      },
      'replaceText': {
        'Burst': '爆発',
        'Color Riot': 'カラーライオット',
        'Cool Bomb': 'コールドペイントボム',
        'Double Style': 'ダブル・グラフィティ',
        'Highlightning': '界雷',
        'Layer': 'アレンジ',
        'Lightning Bolt': 'いなずま',
        'Mousse Mural': 'ムースシャワー',
        'Mousse Touch-up': 'ミニムースシャワー',
        'Pudding Party': 'プリンパーティー',
        'Rush': '突進',
        'Single Style': 'シングル・グラフィティ',
        'Spray Pain': '針飛ばし',
        'Sugarscape': 'ランドスケープ',
        'Taste of Fire': 'シュガーファイア',
        'Taste of Thunder': 'シュガーサンダー',
        'Warm Bomb': 'ウォームペイントボム',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Heaven Bomb': '翅膀爆弹怪',
        'Paint Bomb': '涂鸦爆弹怪',
        'Sugar Riot': '狂热糖潮',
        'Sweet Shot': '糖糖箭',
        'Tempest Piece': '雷暴云',
      },
      'replaceText': {
        '\\(cast\\)': '(咏唱)',
        '\\(snapshot\\)': '(快照)',
        '\\(spread\\)': '(分散)',
        'Burst': '爆炸',
        'Color Riot': '色彩狂热',
        'Cool Bomb': '冷色爆弹怪',
        'Double Style': '双手涂鸦',
        'Highlightning': '界雷',
        'Layer': '添笔',
        'Lightning Bolt': '落雷',
        'Mousse Mural': '慕斯怪大雨',
        'Mousse Touch-up': '慕斯怪小雨',
        'Pudding Party': '软糊怪派对',
        'Rush': '突进',
        'Single Style': '单手涂鸦',
        'Spray Pain': '飞针',
        'Sugarscape': '糖心绘景',
        'Taste of Fire': '糖糖火炎',
        'Taste of Thunder': '糖糖闪雷',
        'Warm Bomb': '暖色爆弹怪',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Heaven Bomb': '', // FIXME '翅膀爆弹怪'
        // 'Paint Bomb': '', // FIXME '涂鸦爆弹怪'
        'Sugar Riot': 'シュガーライオット',
        'Sweet Shot': 'シュガーズアロー',
        'Tempest Piece': '積乱雲',
      },
      'replaceText': {
        // '\\(cast\\)': '', // FIXME '(咏唱)'
        // '\\(snapshot\\)': '', // FIXME '(快照)'
        // '\\(spread\\)': '', // FIXME '(分散)'
        'Burst': '爆炸',
        'Color Riot': '色彩暴亂',
        // 'Cool Bomb': '', // FIXME '冷色爆弹怪'
        'Double Style': '雙手塗鴉',
        'Highlightning': '界雷',
        'Layer': '添筆',
        'Lightning Bolt': '落雷',
        'Mousse Mural': '慕斯怪之雨',
        'Mousse Touch-up': '慕斯怪小雨',
        'Pudding Party': '布丁聚會',
        'Rush': '突進',
        'Single Style': '單手塗鴉',
        'Spray Pain': '飛針',
        'Sugarscape': '沙地繪景',
        'Taste of Fire': '糖果火焰',
        'Taste of Thunder': '糖果雷電',
        // 'Warm Bomb': '', // FIXME '暖色爆弹怪'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Heaven Bomb': '날개 봄',
        'Paint Bomb': '그래피티 봄',
        'Sugar Riot': '슈거 라이엇',
        'Sweet Shot': '슈거 화살',
        'Tempest Piece': '적란운',
      },
      'replaceText': {
        '\\(cast\\)': '(시전)',
        '\\(snapshot\\)': '(예고)',
        '\\(spread\\)': '(산개)',
        'Burst': '폭발',
        'Color Riot': '폭풍 색칠',
        'Cool Bomb': '한색 물감폭탄',
        'Double Style': '양손 그래피티',
        'Highlightning': '계뢰',
        'Layer': '그림 가필',
        'Lightning Bolt': '낙뢰',
        'Mousse Mural': '무스 세례',
        'Mousse Touch-up': '작은 무스 세례',
        'Pudding Party': '푸딩 파티',
        'Rush': '돌진',
        'Single Style': '한손 그래피티',
        'Spray Pain': '바늘 날리기',
        'Sugarscape': '풍경화',
        'Taste of Fire': '슈거 파이어',
        'Taste of Thunder': '슈거 선더',
        'Warm Bomb': '난색 물감폭탄',
      },
    },
  ],
};

export default triggerSet;
