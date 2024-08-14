import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// MapEffect tile map:
// 00 01 02 03
// 04 05 06 07
// 08 09 0A 0B
// 0C 0D 0E 0F
// +0x10 is a duplicate used for E&E knockback display

const mapEffectTileState = {
  'cracked': '00020001',
  'clear': '00040004',
  'broken': '00200010',
  'refreshing': '00800004', // refreshing from cracked
  'rebuilding': '01000004', // rebuilding from broken
} as const;

const mapEffectData = {
  '09': {
    'location': '09',
    'centerX': 95,
    'centerY': 105,
    ...mapEffectTileState,
  },
  '0A': {
    'location': '0A',
    'centerX': 105,
    'centerY': 105,
    ...mapEffectTileState,
  },
} as const;

const headMarkerData = {
  // Vfx Path: com_share1f
  stack: '5D',
  // Vfx Path: tank_lockon02k1
  tankBuster: 'DA',
  // Vfx Path: loc05sp_05a_se_p
  lineStack: '178',
} as const;
console.assert(headMarkerData);

export interface Data extends RaidbossData {
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  mouserMatchedTile?: (typeof mapEffectData)[keyof typeof mapEffectData]['location'];
}

// TODO:
// Predaceous Pounce
// Leaping Black Cat Crossing

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM1',
  zoneId: ZoneId.AacLightHeavyweightM1,
  timelineFile: 'r1n.txt',
  initData: () => ({
    actorSetPosTracker: {},
  }),
  triggers: [
    {
      id: 'R1N ActorSetPos Collector',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      run: (data, matches) => {
        data.actorSetPosTracker[matches.id] = matches;
      },
    },
    {
      id: 'R1N Mouser',
      type: 'StartsUsing',
      netRegex: { id: '996B', capture: true },
      condition: (data, matches) => {
        const actorSetPosLine = data.actorSetPosTracker[matches.sourceId];
        if (actorSetPosLine === undefined)
          return false;
        const x = parseFloat(actorSetPosLine.x);
        const y = parseFloat(actorSetPosLine.y);
        /*
        Exmaple lines:
        ActorSetPos to middle of danger square
        271|2024-07-16T21:52:30.1570000-04:00|40011591|-0.0001|00|00|85.0000|115.0000|0.0000|568c67125874f71f
        StartsUsing, 9315 = first hit, 996B = second hit
        20|2024-07-16T21:52:30.2340000-04:00|40011591|Black Cat|9315|unknown_9315|40011591|Black Cat|0.700|85.00|115.00|0.00|0.00|64ce76ea56417e29
        Rest of lines not relevant for trigger, but show cast target is north middle edge of square, facing south
        263|2024-07-16T21:52:30.2340000-04:00|40011591|9315|84.994|109.989|0.000|0.000|dc062eb396f50364
        21|2024-07-16T21:52:31.2130000-04:00|40011591|Black Cat|9315|unknown_9315|40011591|Black Cat|1B|93158000|0|0|0|0|0|0|0|0|0|0|0|0|0|0|44|44|0|10000|||85.00|115.00|0.00|0.00|44|44|0|10000|||85.00|115.00|0.00|0.00|00008530|0|1|00||01|9315|9315|0.200|7FFF|9ed19cd6e527be66
        264|2024-07-16T21:52:31.2130000-04:00|40011591|9315|00008530|0|||||9177fd99528a2344
         */
        const loc = Object.values(mapEffectData)
          .find((tile) =>
            tile.location.startsWith('0') && Math.abs(tile.centerX - x) < 1 &&
            Math.abs(tile.centerY - y) < 1
          );
        if (loc === undefined)
          return false;

        const tile = loc.location;

        if (tile !== '09' && tile !== '0A')
          return false;

        data.mouserMatchedTile = tile;
        return true;
      },
      // We don't need a suppressSeconds since only one of the SW/SE tiles will get hit twice
      durationSeconds: 11,
      infoText: (data, _matches, output) => {
        const dangerTile = data.mouserMatchedTile;
        if (dangerTile === undefined)
          return false;

        // Danger tile is SW, so safe movement is SW => SE (Stay)
        if (dangerTile === '09') {
          return output.swSeStay!({
            dir1: output['dirSW']!(),
            sep: output.separator!(),
            dir2: output['dirSE']!(),
          });
        }

        const dirs = ['dirSW', 'dirSE', 'dirSW'].map((e) => output[e]!());

        return output.combo!({ dirs: dirs.join(output.separator!()) });
      },
      run: (data) => delete data.mouserMatchedTile,
      outputStrings: {
        ...Directions.outputStrings8Dir,
        swSeStay: {
          en: '${dir1} ${sep} ${dir2} (Stay)',
          de: '${dir1} ${sep} ${dir2} (bleib Stehen)',
          ko: '${dir1} ${sep} ${dir2} (그대로)',
        },
        separator: {
          en: ' => ',
          de: ' => ',
          ja: ' => ',
          cn: ' => ',
          ko: ' => ',
        },
        combo: {
          en: '${dirs}',
          de: '${dirs}',
          ja: '${dirs}',
          cn: '${dirs}',
          ko: '${dirs}',
        },
      },
    },
    {
      id: 'R1N One-two Paw Right Left',
      type: 'StartsUsing',
      netRegex: { id: '9309', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'R1N One-two Paw Left Right',
      type: 'StartsUsing',
      netRegex: { id: '930C', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'R1N Black Cat Crossing',
      type: 'StartsUsingExtra',
      netRegex: { id: '9311', capture: true },
      suppressSeconds: 5,
      infoText: (_data, matches, output) => {
        const heading = parseFloat(matches.heading);
        const dir = Directions.hdgTo8DirNum(heading);
        if (dir % 2 === 0)
          // `dir % 2 === 0` = this is aimed at a cardinal, so intercards safe first
          return output.intercardsCards!();
        return output.cardsIntercards!();
      },
      outputStrings: {
        cardsIntercards: {
          en: 'Cards => Intercards',
          de: 'Karten => Interkardinal',
          fr: 'Cardinal => Intercardinal',
          ja: '十字 => 斜め',
          cn: '十字 => 斜角',
          ko: '십자 => 대각',
        },
        intercardsCards: {
          en: 'Intercards => Cards',
          de: 'Interkardinal => Karten',
          fr: 'Intercardinal => Cardinal',
          ja: '斜め => 十字',
          cn: '斜角 => 十字',
          ko: '대각 => 십자',
        },
      },
    },
    {
      id: 'R1N Elevate and Eviscerate',
      type: 'StartsUsing',
      netRegex: { id: '9317', source: ['Black Cat', 'Copy Cat'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Aim for uncracked tile',
          de: 'Ziehle auf nich gerissene Fläche',
          fr: 'Visez une tuile non-brisée',
          ja: '割れていない床を狙う',
          cn: '瞄准完好的平台',
          ko: '부서지지 않은 칸으로 유도',
        },
      },
    },
    {
      id: 'R1N Bloody Scratch',
      type: 'StartsUsing',
      netRegex: { id: '9340', source: 'Black Cat', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R1N Biscuit Maker',
      type: 'StartsUsing',
      netRegex: { id: '934A', source: 'Black Cat', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R1N Clawful',
      type: 'StartsUsing',
      netRegex: { id: '933C', source: 'Black Cat', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1N Overshadow',
      type: 'StartsUsing',
      netRegex: { id: '9319', source: 'Black Cat', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1N Leaping One-two Paw West West East',
      type: 'StartsUsing',
      netRegex: { id: '931F', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'West => East at marker',
          de: 'Westen => Osten bei der Markierung',
          fr: 'Ouest => Est depuis le marqueur',
          ja: 'マーカーの西 => マーカーの東',
          cn: '标记左(西) => 标记右(东)侧',
          ko: '징 기준 서쪽 => 동쪽',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw West East West',
      type: 'StartsUsing',
      netRegex: { id: '9320', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East => West at marker',
          de: 'Osten => Westen bei der Markierung',
          fr: 'Est => Ouest depuis le marqueur',
          ja: 'マーカーの東 => マーカーの西',
          cn: '标记右(东) => 标记左(西)侧',
          ko: '징 기준 동쪽 => 서쪽',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw East West East',
      type: 'StartsUsing',
      netRegex: { id: '9321', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'West => East at marker',
          de: 'Westen => Osten bei der Markierung',
          fr: 'Ouest => Est depuis le marqueur',
          ja: 'マーカーの西 => マーカーの東',
          cn: '标记左(西) => 标记右(东)侧',
          ko: '징 기준 서쪽 => 동쪽',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw East East West',
      type: 'StartsUsing',
      netRegex: { id: '9322', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East => West at marker',
          de: 'Osten => Westen bei der Markierung',
          fr: 'Est => Ouest depuis le marqueur',
          ja: 'マーカーの東 => マーカーの西',
          cn: '标记右(东) => 标记左(西)侧',
          ko: '징 기준 동쪽 => 서쪽',
        },
      },
    },
    {
      id: 'R1N Shockwave 931D',
      type: 'StartsUsing',
      netRegex: { id: '931D', source: 'Black Cat', capture: false },
      response: Responses.knockback(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Black Cat': 'Schwarze Katze',
        'Copy Cat': 'felin(?:e|er|es|en) Nachahmung',
      },
      'replaceText': {
        '(?<! )Black Cat Crossing': 'Kreuzklaue',
        '(?<! )One-two Paw': 'Doppelklaue',
        'Biscuit Maker': 'Milchtritt',
        'Bloody Scratch': 'Blutiger Rundumkratzer',
        'Clawful': 'Volle Kralle',
        'Copycat': 'Feline Nachahmung',
        'Elevate and Eviscerate': 'Präziser Höhenflug',
        'Grimalkin Gale': 'Katerstrophaler Wind',
        'Impact': 'Impakt',
        'Leaping Black Cat Crossing': 'Kreuzklauensprung',
        'Leaping One-two Paw': 'Doppelklauensprung',
        'Mouser': 'Mäusejagd',
        'Overshadow': 'Überschattung',
        'Predaceous Pounce': 'Feliner Beutezug',
        'Shockwave': 'Schockwelle',
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(Schaden)',
        '\\(hits\\)': '(Treffer)',
        '\\(jump\\)': '(Sprung)',
        '\\(telegraphs\\)': '(angezeigt)',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Black Cat': 'Black Cat',
        'Copy Cat': 'double félin',
      },
      'replaceText': {
        '(?<! )Black Cat Crossing': 'Griffade croisée',
        '(?<! )One-two Paw': 'Griffade un-deux',
        'Biscuit Maker': 'Coup de tatane',
        'Bloody Scratch': 'Griffure sanglante',
        'Clawful': 'Lacération lourde',
        'Copycat': 'Double félin',
        'Elevate and Eviscerate': 'Élévation éviscérante',
        'Grimalkin Gale': 'Rafale féline',
        'Impact': 'Impact',
        'Leaping Black Cat Crossing': 'Griffade croisée bondissante',
        'Leaping One-two Paw': 'Griffade un-deux bondissante',
        'Mouser': 'Carnage dératiseur',
        'Overshadow': 'Ombragement',
        'Predaceous Pounce': 'Prédation preste',
        'Shockwave': 'Onde de choc',
        '\\(cast\\)': '(Incantation)',
        '\\(damage\\)': '(Dommage)',
        '\\(hits\\)': '(Coup)',
        '\\(jump\\)': '(Saut)',
        '\\(telegraphs\\)': '(Télégraphes)',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Black Cat': 'ブラックキャット',
        'Copy Cat': 'コピーキャット',
      },
      'replaceText': {
        '(?<! )Black Cat Crossing': 'クロスネイル',
        '(?<! )One-two Paw': 'デュアルネイル',
        'Biscuit Maker': 'ビスケットメーカー',
        'Bloody Scratch': 'ブラッディースクラッチ',
        'Clawful': 'マッシブ・クロウフル',
        'Copycat': 'コピーキャット',
        'Elevate and Eviscerate': 'エレベート・エビセレート',
        'Grimalkin Gale': 'キャッタクリスム・ゲイル',
        'Impact': '衝撃',
        'Leaping Black Cat Crossing': 'リーピング・クロスネイル',
        'Leaping One-two Paw': 'リーピング・デュアルネイル',
        'Mouser': 'マウサーラッシュ',
        'Overshadow': 'オーバーシャドウ',
        'Predaceous Pounce': 'キャッツレイド',
        'Shockwave': '衝撃波',
      },
    },
  ],
};

export default triggerSet;
