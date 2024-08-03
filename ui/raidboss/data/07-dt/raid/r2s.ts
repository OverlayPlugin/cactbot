import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  partnersSpreadCounter: number;
  storedPartnersSpread?: 'partners' | 'spread';
}

const headMarkerData = {
  // Vfx Path: lockon6_t0t
  spreadMarker1: '00EA',
  // Vfx Path: m0676trg_tw_d0t1p
  sharedBuster: '0103',
  // Vfx Path: tank_laser_5sec_lockon_c0a1
  tankLaser: '01D7',
  // Vfx Path: m0906_tgae_s701k2
  spreadMarker2: '0203',
  // Vfx Path: m0906_share4_7s0k2
  heartStackMarker: '0205',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM2Savage',
  zoneId: ZoneId.AacLightHeavyweightM2Savage,
  timelineFile: 'r2s.txt',
  initData: () => ({
    partnersSpreadCounter: 0,
  }),
  triggers: [
    {
      id: 'R2S Headmarker Shared Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.sharedBuster, capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R2S Headmarker Cone Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankLaser, capture: true },
      response: Responses.tankCleave(),
    },
    {
      id: 'R2S Headmarker Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spreadMarker2, capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R2S Headmarker Party Stacks',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.heartStackMarker, capture: false },
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: Outputs.stacks,
      },
    },
    {
      id: 'R2S Call Me Honey',
      type: 'StartsUsing',
      netRegex: { id: '9183', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Partners/Spread Counter',
      type: 'StartsUsing',
      netRegex: { id: ['9184', '9185', '9B08', '9B09'], source: 'Honey B. Lovely', capture: false },
      run: (data) => data.partnersSpreadCounter++,
    },
    {
      id: 'R2S Drop of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9185', source: 'Honey B. Lovely', capture: false },
      alarmText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'partners',
      outputStrings: {
        text: {
          en: 'Stored Partners',
          de: 'Gespeichert: Partner',
          ja: 'あとでペア',
          cn: '存储分摊',
        },
      },
    },
    {
      id: 'R2S Splash of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9184', source: 'Honey B. Lovely', capture: false },
      alarmText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'spread',
      outputStrings: {
        text: {
          en: 'Stored Spread',
          de: 'Gespeichert: Verteilen',
          ja: 'あとで散開',
          cn: '存储分散',
        },
      },
    },
    {
      id: 'R2S Drop of Love',
      type: 'StartsUsing',
      netRegex: { id: '9B09', source: 'Honey B. Lovely', capture: false },
      alarmText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'partners',
      outputStrings: {
        text: {
          en: 'Stored Partners',
          de: 'Gespeichert: Partner',
          ja: 'あとでペア',
          cn: '存储分摊',
        },
      },
    },
    {
      id: 'R2S Spread Love',
      type: 'StartsUsing',
      netRegex: { id: '9B08', source: 'Honey B. Lovely', capture: false },
      alarmText: (_data, _matches, output) => output.text!(),
      run: (data) => data.storedPartnersSpread = 'spread',
      outputStrings: {
        text: {
          en: 'Stored Spread',
          de: 'Gespeichert: Verteilen',
          ja: 'あとで散開',
          cn: '存储分散',
        },
      },
    },
    {
      id: 'R2S Delayed Partners/Spread Callout',
      type: 'StartsUsing',
      netRegex: { id: ['9184', '9185', '9B08', '9B09'], source: 'Honey B. Lovely', capture: false },
      delaySeconds: (data) => {
        // TODO: Review these delay timings
        switch (data.partnersSpreadCounter) {
          case 1:
            return 14;
          case 2:
            return 11;
          case 3:
            return 37;
          case 4:
            return 62;
          case 5:
            return 55;
        }
        return 0;
      },
      durationSeconds: 7,
      infoText: (data, _matches, output) => output[data.storedPartnersSpread ?? 'unknown']!(),
      outputStrings: {
        spread: {
          en: 'Spread',
          de: 'Verteilen',
          ja: '散開',
          cn: '分散',
        },
        partners: {
          en: 'Partners',
          de: 'Partner',
          ja: 'ペア',
          cn: '分摊',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R2S Honey Beeline',
      type: 'StartsUsing',
      netRegex: { id: '9186', source: 'Honey B. Lovely', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'R2S Tempting Twist',
      type: 'StartsUsing',
      netRegex: { id: '9187', source: 'Honey B. Lovely', capture: false },
      response: Responses.getUnder(),
    },
    {
      id: 'R2S Honey B. Live: 1st Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C24', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Honey B. Live: 2nd Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C25', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Honey B. Live: 3rd Beat',
      type: 'StartsUsing',
      netRegex: { id: '9C26', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Loveseeker',
      type: 'StartsUsing',
      netRegex: { id: '9B7D', source: 'Honey B. Lovely', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R2S Centerstage Combo',
      type: 'StartsUsing',
      netRegex: { id: '91AC', source: 'Honey B. Lovely', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Under Intercards => Out => Cards',
          de: 'Rein Interkardinal => Raus => Kardinal',
          ja: '斜め内側 => 外側 => 十字',
          cn: '内斜角 => 外斜角 => 外正点',
        },
      },
    },
    {
      id: 'R2S Outerstage Combo',
      type: 'StartsUsing',
      netRegex: { id: '91AD', source: 'Honey B. Lovely', capture: false },
      durationSeconds: 9,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out Cards => Intercards => Under',
          de: 'Raus Kardinal => Interkardinal => Rein',
          ja: '外十字 => 外斜め => 内側',
          cn: '外正点 => 外斜角 => 内斜角',
        },
      },
    },
    {
      id: 'R2S Honey B. Finale',
      type: 'StartsUsing',
      netRegex: { id: '918F', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2S Rotten Heart',
      type: 'StartsUsing',
      netRegex: { id: '91AA', source: 'Honey B. Lovely', capture: false },
      response: Responses.bigAoe(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Honey B. Lovely': 'Suzie Summ Honigsüß',
        'Sweetheart': 'honigsüß(?:e|er|es|en) Herz',
      },
      'replaceText': {
        'Alarm Pheromones': 'Alarmpheromon',
        'Bee Sting': 'Bienenstich',
        'Big Burst': 'Detonation',
        'Blinding Love': 'Blinde Liebe',
        'Call Me Honey': 'Lieblicher Ruf',
        'Centerstage Combo': 'Innere Bühnenkombination',
        'Drop of Love': 'Liebestropfen',
        'Drop of Venom': 'Gifttropfen',
        'Fracture': 'Sprengung',
        'Heart-Struck': 'Herzschock',
        'Heartsick': 'Herzschmerz',
        'Heartsore': 'Herzqual',
        'Honey B. Finale': 'Honigsüßes Finale',
        'Honey B. Live: 1st Beat': 'Suzie Summ Solo: Auftakt',
        'Honey B. Live: 2nd Beat': 'Suzie Summ Solo: Refrain',
        'Honey B. Live: 3rd Beat': 'Suzie Summ Solo: Zugabe',
        'Honey Beeline': 'Honigschuss',
        'Killer Sting': 'Tödlicher Stich',
        'Laceration': 'Zerreißen',
        'Love Me Tender': 'Ein bisschen Liebe',
        'Loveseeker': 'Umwerben',
        'Outerstage Combo': 'Äußere Bühnenkombination',
        'Poison Sting': 'Giftstachel',
        'Rotten Heart': 'Schwarzes Herz',
        'Sheer Heart Attack': 'Herz ist Trumpf',
        'Splash of Venom': 'Giftregen',
        'Splinter': 'Platzen',
        'Spread Love': 'Liebesregen',
        'Stinging Slash': 'Tödlicher Schnitt',
        'Tempting Twist': 'Honigdreher',
        '\\(cast\\)': '(wirken)',
        '\\(damage\\)': '(Schaden)',
        '\\(drop\\)': '(Tropfen)',
        '\\(enrage\\)': '(Finalangriff)',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Honey B. Lovely': 'Honey B. Lovely',
        'Sweetheart': 'cœur chaleureux',
      },
      'replaceText': {
        'Alarm Pheromones': 'Phéromones d\'alerte',
        'Bee Sting': 'Dard d\'abeille',
        'Big Burst': 'Grosse explosion',
        'Blinding Love': 'Amour aveuglant',
        'Call Me Honey': 'Appelez-moi Lovely',
        'Centerstage Combo': 'Combo d\'amour central',
        'Drop of Love': 'Gouttes d\'amour',
        'Drop of Venom': 'Chute de venin',
        'Fracture': 'Fracture',
        'Heart-Struck': 'Choc de cœur',
        'Heartsick': 'Mal de cœur',
        'Heartsore': 'Peine de cœur',
        'Honey B. Finale': 'Honey B. Final',
        'Honey B. Live: 1st Beat': 'Honey B. Live - Ouverture',
        'Honey B. Live: 2nd Beat': 'Honey B. Live - Spectacle',
        'Honey B. Live: 3rd Beat': 'Honey B. Live - Conclusion',
        'Honey Beeline': 'Rayon mielleux',
        'Killer Sting': 'Dard tueur',
        'Laceration': 'Lacération',
        'Love Me Tender': 'Effusion d\'amour',
        'Loveseeker': 'Amour persistant',
        'Outerstage Combo': 'Combo d\'amour extérieur',
        'Poison Sting': 'Dard empoisonné',
        'Rotten Heart': 'Cœur cruel',
        'Sheer Heart Attack': 'Attaque au cœur pur',
        'Splash of Venom': 'Pluie de venin',
        'Splinter': 'Rupture',
        'Spread Love': 'Pluie d\'amour',
        'Stinging Slash': 'Taillade tueuse',
        'Tempting Twist': 'Tourbillon tentateur',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Honey B. Lovely': 'ハニー・B・ラブリー',
        'Sweetheart': 'ラブリーハート',
      },
      'replaceText': {
        'Alarm Pheromones': 'アラームフェロモン',
        'Bee Sting': 'ビースティング',
        'Big Burst': '大爆発',
        'Blinding Love': 'ラブ・イズ・ブラインド',
        'Call Me Honey': 'ラブリーコール',
        'Centerstage Combo': 'リング・ラブコンビネーション',
        'Drop of Love': 'ラブドロップ',
        'Drop of Venom': 'ベノムドロップ',
        'Fracture': '炸裂',
        'Heart-Struck': 'ハートショック',
        'Heartsick': 'ハートシック',
        'Heartsore': 'ハートソゥ',
        'Honey B. Finale': 'ハニー・B・フィナーレ',
        'Honey B. Live: 1st Beat': 'ハニー・B・ライヴ【1st】',
        'Honey B. Live: 2nd Beat': 'ハニー・B・ライヴ【2nd】',
        'Honey B. Live: 3rd Beat': 'ハニー・B・ライヴ【3rd】',
        'Honey Beeline': 'ハニーブラスト',
        'Killer Sting': 'キラースティング',
        'Laceration': '斬撃',
        'Love Me Tender': 'ラブ・ミー・テンダー',
        'Loveseeker': 'ラブシーカー',
        'Outerstage Combo': 'ラウンド・ラブコンビネーション',
        'Poison Sting': 'ポイズンスティング',
        'Rotten Heart': 'ブラックハート',
        'Sheer Heart Attack': 'シアー・ハート・アタック',
        'Splash of Venom': 'ベノムレイン',
        'Splinter': '破裂',
        'Spread Love': 'ラブレイン',
        'Stinging Slash': 'キラースラッシュ',
        'Tempting Twist': 'ハニーツイスター',
      },
    },
  ],
};

export default triggerSet;
