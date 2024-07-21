import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

// MapEffect lines only control arena appearance

// Head Marker data for future reference
const headMarkerData = {
  // Vfx Path: tank_laser_lockon01p
  tankLines: 'E6',
  // Vfx Path: com_share3_7s0p
  stack: '13D',
  // Vfx Path: target_ae_s7k1
  spread: '177',
  // Vfx Path: m0906_tgae_s701k2
  spreadHearts: '203',
  // Vfx Path: m0906_share4_7s0k2
  lightPartyStacks: '205',
} as const;

console.assert(headMarkerData);

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM2',
  zoneId: ZoneId.AacLightHeavyweightM2,
  timelineFile: 'r2n.txt',
  triggers: [
    {
      id: 'R2N Call Me Honey',
      type: 'StartsUsing',
      netRegex: { id: '9164', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2N Honey Beeline',
      type: 'StartsUsing',
      netRegex: { id: ['9B39', '9B3B'], source: 'Honey B. Lovely', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'R2N Tempting Twist',
      type: 'StartsUsing',
      netRegex: { id: ['9B3A', '9B3C'], source: 'Honey B. Lovely', capture: false },
      response: Responses.getUnder(),
    },
    {
      id: 'R2N Honeyed Breeze',
      type: 'StartsUsing',
      netRegex: { id: '9167', source: 'Honey B. Lovely', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R2N Drop of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9170', source: 'Honey B. Lovely', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R2N Blow Kiss',
      type: 'StartsUsing',
      netRegex: { id: '9173', source: 'Honey B. Lovely', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'R2N Heartsore',
      type: 'StartsUsing',
      netRegex: { id: '917A', source: 'Honey B. Lovely', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R2N Loveseeker',
      type: 'StartsUsing',
      netRegex: { id: '9AC1', source: 'Honey B. Lovely', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R2N Honey B. Finale',
      type: 'StartsUsing',
      netRegex: { id: '917B', source: 'Honey B. Lovely', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R2N Heartsick',
      type: 'StartsUsing',
      netRegex: { id: '9B8D', source: 'Honey B. Lovely', capture: false },
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: {
          en: 'Stacks',
          de: 'Sammeln',
          fr: 'Package',
          cn: '分组分摊',
          ko: '쉐어',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Honey B. Lovely': 'Suzie Summ Honigsüß',
      },
      'replaceText': {
        'Alarm Pheromones': 'Alarmpheromon',
        'Blinding Love': 'Blinde Liebe',
        'Blow Kiss': 'Kusshand',
        'Call Me Honey': 'Lieblicher Ruf',
        'Drop of Venom': 'Gifttropfen',
        'Fracture': 'Sprengung',
        'Heart-struck': 'Herzschock',
        'Heartsick': 'Lieblicher Schock',
        'Heartsore': 'Herzsaat',
        'Honey B. Finale': 'Honigsüßes Finale',
        'Honey B. Live': 'Suzie Summ Solo',
        'Honey Beeline': 'Honigschuss',
        'Honeyed Breeze': 'Süßer Wind',
        'Love Me Tender': 'Ein bisschen Liebe',
        'Loveseeker': 'Umwerben',
        'Splash of Venom': 'Giftregen',
        'Tempting Twist': 'Honigdreher',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Honey B. Lovely': 'Honey B. Lovely',
      },
      'replaceText': {
        'Alarm Pheromones': 'Phéromones d\'alerte',
        'Blinding Love': 'Amour aveuglant',
        'Blow Kiss': 'Baiser renversant',
        'Call Me Honey': 'Appelez-moi Lovely',
        'Drop of Venom': 'Chute de venin',
        'Fracture': 'Fracture',
        'Heart-struck': 'Choc de cœur',
        'Heartsick': 'Mal de cœur',
        'Heartsore': 'Peine de cœur',
        'Honey B. Finale': 'Honey B. Final',
        'Honey B. Live': 'Honey B. Live',
        'Honey Beeline': 'Rayon mielleux',
        'Honeyed Breeze': 'Brise mielleuse',
        'Love Me Tender': 'Effusion d\'amour',
        'Loveseeker': 'Amour persistant',
        'Splash of Venom': 'Pluie de venin',
        'Tempting Twist': 'Tourbillon tentateur',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Honey B. Lovely': 'ハニー・B・ラブリー',
      },
      'replaceText': {
        'Alarm Pheromones': 'アラームフェロモン',
        'Blinding Love': 'ラブ・イズ・ブラインド',
        'Blow Kiss': 'キッスブロー',
        'Call Me Honey': 'ラブリーコール',
        'Drop of Venom': 'ベノムドロップ',
        'Fracture': '炸裂',
        'Heart-struck': 'ハートショック',
        'Heartsick': 'ハートシック',
        'Heartsore': 'ハートソゥ',
        'Honey B. Finale': 'ハニー・B・フィナーレ',
        'Honey B. Live': 'ハニー・B・ライヴ',
        'Honey Beeline': 'ハニーブラスト',
        'Honeyed Breeze': 'ハニーガスト',
        'Love Me Tender': 'ラブ・ミー・テンダー',
        'Loveseeker': 'ラブシーカー',
        'Splash of Venom': 'ベノムレイン',
        'Tempting Twist': 'ハニーツイスター',
      },
    },
  ],
};

export default triggerSet;
