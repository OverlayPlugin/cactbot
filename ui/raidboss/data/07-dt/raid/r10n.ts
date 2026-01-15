import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputCardinal,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  waveDir: DirectionOutputCardinal;
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  snakingCount: number;
  snakeMid?: 'fire' | 'water';
}

const mapEffectData = {
  '00': {
    'location': '00',
    'flags0': '00200010',
    'clear1': '00800040',
    'flags2': '02000100',
  },
  '03': {
    'location': '03',
    'flags0': '00020001',
    'clear1': '00080004',
  },
  '04': {
    'location': '04',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // 06 -> 09 appear to be VFX related to snaking
  '06': {
    'location': '06',
    'flags0': '00020001',
    'flags1': '00200010',
    'clear2': '00800040',
    'flags3': '02000100',
    'flags4': '04000004',
  },
  '07': {
    'location': '07',
    'flags0': '00020001',
    'flags1': '00200010',
    'clear2': '00800040',
    'flags3': '02000100',
    'flags4': '04000004',
  },
  '08': {
    'location': '08',
    'flags0': '00020001',
    'flags1': '00200010',
    'clear2': '00800040',
    'flags3': '02000100',
    'flags4': '04000004',
  },
  '09': {
    'location': '09',
    'flags0': '00020001',
    'flags1': '00200010',
    'clear2': '00800040',
    'flags3': '02000100',
    'flags4': '04000004',
  },

  // 0E -> 16 also related to snaking
  '0E': {
    'location': '0E',
    'clear0': '00080004',
    'flags1': '02000100',
  },
  '0F': {
    'location': '0F',
    'flags0': '00020001',
    'clear1': '00080004',
  },
  '10': {
    'location': '10',
    'flags0': '00020001',
    'clear1': '00080004',
  },
  '11': {
    'location': '11',
    'clear0': '00080004',
    'flags1': '02000100',
  },
  '12': {
    'location': '12',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '02000100',
  },
  '13': {
    'location': '13',
    'flags0': '00020001',
    'clear1': '00080004',
  },
  '14': {
    'location': '14',
    'clear0': '00080004',
    'flags1': '02000100',
  },
  '15': {
    'location': '15',
    'clear0': '00080004',
    'flags1': '02000100',
  },
  '16': {
    'location': '16',
    'flags0': '00020001',
    'clear1': '00080004',
  },
} as const;
console.assert(mapEffectData);

// For snaking, two patterns for MapEffect have been observed.
// Only MapEffect and StartsUsingExtra for the `Insane Air` cast seem to be relevant here.
// Fire ends at middle:
/*
water starting nw, facing south, moving to north (90 ccw) | fire starting se, facing east, moving to south (180 ccw)
00020001|06
00020001|07
00020001|0F
02000100|15

water starting n, facing west, moving to ne (180 ccw) | fire starting s, facing w, moving to sw (0)
00200010|06
00200010|07
00080004|0F
00020001|10
02000100|14
00080004|15

water starting ne, facing north, moving to east (180 ccw) | fire starting sw, facing east, moving to west (90 ccw)
00800040|06
00800040|07
00080004|10
02000100|11
00020001|13
00080004|14

water starting east, facing south, moving to southeast (0) | fire starting west, facing south, moving to middle (90 ccw)
02000100|06
02000100|07
00080004|11
02000100|12
00080004|13
00020001|16

clear all
04000004|06
04000004|07
00080004|16
00080004|12
*/
// Water ends middle:
/*
water starting nw, facing west, moving to north (180 ccw) | fire starting se, facing north, moving to south (90 ccw)
00020001|08
00020001|09
00020001|0F
02000100|15

water starting north, facing east, moving to ne (0) | fire starting south, facing east, moving to sw (180 ccw)
00200010|08
00200010|09
00080004|0F
00020001|10
02000100|14
00080004|15

water starting ne, facing w, moving to e (90 ccw) | fire starting sw, facing s, moving w (180 ccw)
00800040|08
00800040|09
00080004|10
02000100|11
00020001|13
00080004|14

water starting e, facing n, moving to middle (90 ccw) | fire starting w, facing n, moving nw (0)
02000100|08
02000100|09
02000100|0E
00080004|11
00020001|12
00080004|13

clear
04000004|08
04000004|09
00080004|0E
00080004|12
*/

const headMarkerData = {
  // Vfx Path: m0676trg_tw_d0t1p
  'sharedBusterRed': '0103',
  // Vfx Path: tank_lockonae_6m_5s_01t
  'tankbusterBlue': '0158',
  // Vfx Path: m0982trg_c0c
  'waterSnakingIndicatorSecond': '027B',
  // Vfx Path: m0982trg_c1c
  'fireSnakingIndicatorSecond': '027C',
  // Vfx Path: m0982trg_d0c
  'waterSnakingLateCone': '028B',
  // Vfx Path: com_share_fire01s5_0c
  'partyStackFire': '0293',
  // Vfx Path: target_ae_5m_s5_fire0c
  'spreadFirePuddleRed': '0294',
  // Vfx Path: m0982trg_c2c
  'waterSnakingIndicatorFirst': '0295',
  // Vfx Path: m0982trg_c3c
  'fireSnakingIndicatorFirst': '0296',
  // Vfx Path: m0982trg_e0c
  'spreadConeCutbackBlaze': '0298',
  // Vfx Path: m0982trg_f0c
  'fireSnakingLateCone': '0299',
} as const;

const snakingHMs: {
  water: readonly string[];
  fire: readonly string[];
  both: readonly string[];
} = {
  water: [headMarkerData.waterSnakingIndicatorFirst, headMarkerData.waterSnakingIndicatorSecond],
  fire: [headMarkerData.fireSnakingIndicatorFirst, headMarkerData.fireSnakingIndicatorSecond],
  both: [
    headMarkerData.waterSnakingIndicatorFirst,
    headMarkerData.waterSnakingIndicatorSecond,
    headMarkerData.fireSnakingIndicatorFirst,
    headMarkerData.fireSnakingIndicatorSecond,
  ],
} as const;

const center = {
  x: 100,
  y: 100,
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM2',
  zoneId: ZoneId.AacHeavyweightM2,
  timelineFile: 'r10n.txt',
  initData: () => ({
    actorPositions: {},
    waveDir: 'unknown',
    snakingCount: -1,
  }),
  triggers: [
    {
      id: 'R10N ActorSetPos Tracker',
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
      id: 'R10N AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R10N Hot Impact Buster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['sharedBusterRed'], capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R10N Deep Impact Buster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbusterBlue'], capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R10N Pyrotation Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['partyStackFire'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R10N Alley-oop Inferno Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['spreadFirePuddleRed'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'R10N Cutback Blaze Spread',
      type: 'HeadMarker',
      netRegex: {
        id: headMarkerData['spreadConeCutbackBlaze'],
        data0: '1[0-9A-F]{7}',
        capture: true,
      },
      condition: (data, matches) => data.me === data.party?.idToName_?.[matches.data0],
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread Fire Cone',
          de: 'Verteilen für Feuer-Kegel',
          cn: '火焰扇形分散',
        },
      },
    },
    {
      id: 'R10N Divers\' Dare',
      type: 'StartsUsing',
      netRegex: { id: 'B582', source: 'Red Hot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R10N Sick Swell Wave Collector',
      type: 'Tether',
      netRegex: { source: 'Deep Blue', id: '0174', capture: true },
      // Slight delay as this line/packet arrives at the same time as ActorSetPos
      delaySeconds: 0.1,
      run: (data, matches) => {
        const actor = data.actorPositions[matches.targetId];
        if (actor === undefined)
          return;

        data.waveDir = Directions.xyToCardinalDirOutput(actor.x, actor.y, center.x, center.y);
      },
    },
    {
      id: 'R10N Sick Swell',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B593', capture: true },
      infoText: (data, matches, output) => {
        const castX = parseFloat(matches.x);
        const castY = parseFloat(matches.y);

        const kbDir = data.waveDir;

        if (kbDir === 'dirE' || kbDir === 'dirW') {
          if (castY < 95)
            return output.text!({ dir1: output[kbDir]!(), dir2: output['dirN']!() });
          else if (castY > 105)
            return output.text!({ dir1: output[kbDir]!(), dir2: output['dirS']!() });
          return output.text!({ dir1: output[kbDir]!(), dir2: output.middle!() });
        }

        if (castX < 95)
          return output.text!({ dir1: output[kbDir]!(), dir2: output['dirW']!() });
        else if (castX > 105)
          return output.text!({ dir1: output[kbDir]!(), dir2: output['dirE']!() });
        return output.text!({ dir1: output[kbDir]!(), dir2: output.middle!() });
      },
      outputStrings: {
        middle: Outputs.middle,
        text: {
          en: 'KB from ${dir1} + away from ${dir2}',
          de: 'Rückstoß von ${dir1} + weg von ${dir2}',
          cn: '从${dir1}击退 + 远离${dir2}',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    {
      id: 'R10N Deep Varial',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B598', capture: true },
      infoText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dir = Directions.xyToCardinalDirOutput(x, y, center.x, center.y);

        return output[dir]!();
      },
      outputStrings: {
        dirN: {
          en: 'Go North Edge',
          de: 'Geh zur nördlichen Kante',
          fr: 'Allez au bord nord',
          ja: '北側へ',
          cn: '去上半场边缘',
          ko: '북쪽 구석으로',
          tc: '去上半場邊緣',
        },
        dirE: {
          en: 'Go East Edge',
          de: 'Geh zur östlichen Kante',
          fr: 'Allez au bord est',
          ja: '東側へ',
          cn: '去右侧边缘',
          ko: '동쪽 구석으로',
          tc: '去右側邊緣',
        },
        dirS: {
          en: 'Go South Edge',
          de: 'Geh zur südlichen Kante',
          fr: 'Allez au bord sud',
          ja: '南側へ',
          cn: '去下半场边缘',
          ko: '남쪽 구석으로',
          tc: '去下半場邊緣',
        },
        dirW: {
          en: 'Go West Edge',
          de: 'Geh zur westlichen Kante',
          fr: 'Allez au bord ouest',
          ja: '西側へ',
          cn: '去左侧边缘',
          ko: '서쪽 구석으로',
          tc: '去左側邊緣',
        },
        unknown: {
          en: 'Cone cleave from ???',
          de: 'Kegel-AoE von ???',
          cn: '扇形攻击未知来向',
        },
      },
    },
    {
      id: 'R10N Xtreme Spectacular',
      type: 'StartsUsing',
      netRegex: { id: 'B5A1', source: 'Red Hot', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go N/S + Big AoE',
          de: 'Geh N/S + Große AoE',
          cn: '去上/下 + 高伤害 AOE',
        },
      },
    },
    {
      id: 'R10N Hot Aerial',
      type: 'StartsUsing',
      netRegex: { id: 'B58A', source: 'Red Hot', capture: false },
      durationSeconds: 12,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Soak Towers',
          de: 'Türme nehmen',
          cn: '踩塔',
        },
      },
    },
    {
      id: 'R10N Steam Burst',
      type: 'ActorControlExtra',
      // AC category = PlayActionTimeline
      netRegex: { id: '4[0-9A-F]{7}', category: '0197', param1: '11D4', capture: false },
      // This might be spammy during the Firesnaking/Watersnaking mechanic if people overlap
      // cones a lot. We might need an additional condition to disable this trigger during
      // the snaking mechanic
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from exploding orbs',
          de: 'Weg von explodierenden Orbs',
          cn: '远离爆炸球',
        },
      },
    },
    {
      id: 'R10N Alley-oop Maelstrom',
      type: 'StartsUsing',
      // Name here was inconsistent one pull, so excluded
      netRegex: { id: 'B59E', capture: false },
      suppressSeconds: 10,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge Cones x2',
          de: 'Kegel-AoEs ausweichen x2',
          cn: '躲避两轮扇形攻击',
        },
      },
    },
    {
      id: 'R10N Firesnaking/Watersnaking AoE',
      type: 'StartsUsing',
      netRegex: { id: 'B57E', source: 'Red Hot', capture: false },
      response: Responses.aoe(),
    },
    {
      // Could also detect this with GainsEffect a bit later, effect ID `136E`
      id: 'R10N Firesnaking Tether',
      type: 'Tether',
      netRegex: { id: '017D', capture: true },
      condition: (data, matches) => matches.name === data.me,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Baiting fire cones',
          de: 'ködere Feuer-Kegel',
          cn: '诱导火扇形',
        },
      },
    },
    {
      // Could also detect this with GainsEffect a bit later, effect ID `136F`
      id: 'R10N Watersnaking Tether',
      type: 'Tether',
      netRegex: { id: '017C', capture: true },
      condition: (data, matches) => matches.name === data.me,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Baiting water cones',
          de: 'ködere Wasser-Kegel',
          cn: '诱导水扇形',
        },
      },
    },
    {
      id: 'R10N Snaking Counter',
      type: 'HeadMarker',
      netRegex: { id: snakingHMs.both, capture: false },
      suppressSeconds: 3,
      run: (data) => data.snakingCount++,
    },
    {
      id: 'R10N Snaking Pattern Collector',
      type: 'MapEffect',
      netRegex: { location: ['06', '08'], flags: '00020001', capture: true },
      suppressSeconds: 9999,
      run: (data, matches) => {
        data.snakeMid = matches.location === '06' ? 'fire' : 'water';
      },
    },
    {
      id: 'R10N Snaking Bait',
      type: 'HeadMarker',
      netRegex: { id: snakingHMs.both, capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (data, matches, output) => {
        const elem = snakingHMs.fire.includes(matches.id) ? 'fire' : 'water';
        // Starts as -1, but increases by one before this trigger is fired
        // Water is N CW => SE, fire is S CW => NW
        let dirNum = data.snakingCount;

        if (elem === 'fire')
          dirNum += 4;

        let dir: DirectionOutput8 | 'middle' = Directions.output8Dir[dirNum] ?? 'unknown';

        if (elem === data.snakeMid && data.snakingCount === 3)
          dir = 'middle';

        return output.text!({
          elem: output[elem]!(),
          dir: output[dir]!(),
        });
      },
      outputStrings: {
        text: {
          en: 'Bait ${elem} cone from ${dir}',
          de: 'ködere ${elem}-Kedel von ${dir}',
          cn: '诱导${elem}扇形来自${dir}',
        },
        ...Directions.outputStrings8Dir,
        water: {
          en: 'Water',
          de: 'Wasser',
          cn: '水',
        },
        fire: {
          en: 'Fire',
          de: 'Feuer',
          cn: '火',
        },
        middle: {
          en: 'Middle',
          de: 'Mitte',
          cn: '中间',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Deep Blue': 'Indigowelle',
        'Red Hot': 'Scharlachflamme',
        'The Xtremes': 'Team Extrem',
        'Xtreme Aether': 'extrem(?:e|er|es|en) Äthersphäre',
      },
      'replaceText': {
        '--Blue middle--': '--Blau mitte--',
        '--Red middle--': '--Rot mitte--',
        '\\(cone\\)': '(Kegel-Aoe)',
        '\\(line\\)': '(Linie)',
        '\\(jump\\)': '(Sprung)',
        'Alley-Oop Inferno': 'Flammen-Alley-Oop',
        'Alley-oop Inferno': 'Flammen-Alley-Oop',
        'Alley-Oop Maelstrom': 'Hydro-Alley-Oop',
        'Alley-oop Maelstrom': 'Hydro-Alley-Oop',
        'Blasting Snap': 'Flammenruck',
        'Cutback Blaze': 'Flammen-Rückschnitt',
        'Deep Impact': 'Hydroklopper',
        'Deep Varial': 'Hydro-Halbdreher',
        'Divers\' Dare': 'Brodelnder Kampfgeist',
        'Epic Brotherhood': 'Brüderbund',
        'Firesnaking': 'Flammen-Schlängeln',
        'Hot Aerial': 'Flammensprung',
        'Hot Impact': 'Flammenklopper',
        'Insane Air': 'Wahnsinnsritt',
        'Plunging Snap': 'Hydroruck',
        'Pyrotation': 'Flammendreher',
        'Sick Swell': 'Riesenwelle',
        'Sickest Take-off': 'Fetter Absprung',
        'Steam Burst': 'Mischknall',
        'Watersnaking': 'Hydro-Schlängeln',
        'Xtreme Spectacular': 'Ultimatives Extremmanöver',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Deep Blue': 'Deep Blue',
        'Red Hot': 'Red Hot',
        'The Xtremes': 'Les Xtrêmes',
        'Xtreme Aether': 'éther Xtrême',
      },
      'replaceText': {
        'Alley-Oop Inferno': 'Alley-oop enflammé',
        'Alley-oop Inferno': 'Alley-oop enflammé',
        'Alley-Oop Maelstrom': 'Alley-oop hydrique',
        'Alley-oop Maelstrom': 'Alley-oop hydrique',
        'Blasting Snap': 'Claquement enflammé',
        'Cutback Blaze': 'Riposte enflammée',
        'Deep Impact': 'Impact puissant',
        'Deep Varial': 'Barrière hydrique',
        'Divers\' Dare': 'Esprit combatif',
        'Epic Brotherhood': 'Fraternité',
        'Firesnaking': 'Ondulation enflammée',
        'Hot Aerial': 'Flamme aérienne',
        'Hot Impact': 'Impact brûlant',
        'Insane Air': 'Figure démentielle',
        'Plunging Snap': 'Claquement hydrique',
        'Pyrotation': 'Rotation enflammée',
        'Sick Swell': 'lame de fond',
        'Sickest Take-off': 'Ascension déchaînée',
        'Steam Burst': 'Déflagration combinée',
        'Watersnaking': 'Ondulation hydrique',
        'Xtreme Spectacular': 'Spectacle Xtrême',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Deep Blue': 'ディープブルー',
        'Red Hot': 'レッドホット',
        'The Xtremes': 'エクストリームズ',
        'Xtreme Aether': 'エクストリームズ・エーテル',
      },
      'replaceText': {
        'Alley-Oop Inferno': 'フレイムアリウープ',
        'Alley-oop Inferno': 'フレイムアリウープ',
        'Alley-Oop Maelstrom': 'ハイドロアリウープ',
        'Alley-oop Maelstrom': 'ハイドロアリウープ',
        'Blasting Snap': 'フレイムスナップ',
        'Cutback Blaze': 'フレイムカットバック',
        'Deep Impact': 'ディープインパクト',
        'Deep Varial': 'ハイドロバリエル',
        'Divers\' Dare': 'ファイティングスピリット',
        'Epic Brotherhood': 'ブラザーフッド',
        'Firesnaking': 'フレイムスネーキング',
        'Hot Aerial': 'フレイムエアリアル',
        'Hot Impact': 'ホットインパクト',
        'Insane Air': 'インセインエアー',
        'Plunging Snap': 'ハイドロスナップ',
        'Pyrotation': 'フレイムローテーション',
        'Sick Swell': '高波',
        'Sickest Take-off': 'シック・テイクオフ',
        'Steam Burst': 'ミックスバースト',
        'Watersnaking': 'ハイドロスネーキング',
        'Xtreme Spectacular': 'エクストリーム・スペクタクル',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Deep Blue': '深蓝',
        'Red Hot': '炽红',
        'The Xtremes': '极限兄弟',
        'Xtreme Aether': '极限以太',
      },
      'replaceText': {
        '--Blue middle--': '--深蓝场中--',
        '--Red middle--': '--炽红场中--',
        '\\(cone\\)': '(扇形)',
        '\\(line\\)': '(直线)',
        '\\(jump\\)': '(跳)',
        'Alley-oop Inferno': '空中旋火',
        'Alley-oop Maelstrom': '空中旋水',
        'Alley-Oop Inferno': '空中旋火',
        'Alley-Oop Maelstrom': '空中旋水',
        'Blasting Snap': '火浪急转',
        'Cutback Blaze': '火浪回切',
        'Deep Impact': '深海冲击',
        'Deep Varial': '浪尖转体',
        'Divers\' Dare': '斗志昂扬',
        'Epic Brotherhood': '兄弟同心',
        'Firesnaking': '火蛇夺浪',
        'Hot Aerial': '腾火踏浪',
        'Hot Impact': '炽焰冲击',
        'Insane Air': '狂浪腾空',
        'Plunging Snap': '水浪急转',
        'Pyrotation': '旋绕烈火',
        'Sick Swell': '惊涛骇浪',
        'Sickest Take-off': '破势乘浪',
        'Steam Burst': '混合爆炸',
        'Watersnaking': '水蛇夺浪',
        'Xtreme Spectacular': '极限炫技',
      },
    },
  ],
};

export default triggerSet;
