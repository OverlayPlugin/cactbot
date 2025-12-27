import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'TheWindwardWildsExtreme',
  zoneId: ZoneId.TheWindwardWildsExtreme,
  timelineFile: 'arkveld-ex.txt',
  triggers: [],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Guardian Arkveld': 'Wächter-Arkveld',
      },
      'replaceText': {
        '\\(aoes\\)': '(AoEs)',
        '\\(dash\\)': '(Ansturm)',
        '\\(raidwide\\)': '(Raidweit)',
        '\\(wing\\)': '(Flügel)',
        'Aetheric Resonance': 'Ätherische Resonanz',
        'Chainblade Blow': 'Klingenpeitsche',
        'Chainblade Charge': 'Klingenschlag',
        'Clamorous Chase': 'Jähzornige Jagd',
        'Dragonspark': 'Drakonischer Funke',
        'Forged Fury': 'Rasselnde Raserei',
        'Greater Resonance': 'Perfekte Resonanz',
        'Guardian Resonance': 'Wächter-Resonanz',
        'Roar': 'Brüllen',
        'Rush': 'Ansturm',
        'Steeltail Thrust': 'Stachel',
        'White Flash': 'Weißes Leuchten',
        'Wild Energy': 'Energie der Wildnis',
        'Wrathful Rattle': 'Zornige Klingen',
        'Wyvern\'s Ouroblade': 'Wyvern-Klingenfeger',
        'Wyvern\'s Rattle': 'Klagende Klingen',
        'Wyvern\'s Weal': 'Wyvernkanone',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Guardian Arkveld': 'Arkveld Gardien',
      },
      'replaceText': {
        'Aetheric Resonance': 'Résonance éthérée',
        'Chainblade Blow': 'Chaîne écrasante',
        'Chainblade Charge': 'Chaîne oppressante',
        'Clamorous Chase': 'Chasse vociférante',
        'Dragonspark': 'Étincelle draconique',
        'Forged Fury': 'Fureur du Gardien',
        'Greater Resonance': 'Grande résonance du Gardien',
        'Guardian Resonance': 'Résonance du Gardien',
        'Roar': 'Rugissement',
        'Rush': 'Ruée',
        'Steeltail Thrust': 'Queue d\'acier',
        'White Flash': 'Éclair blanc',
        'Wild Energy': 'Énergie sauvage',
        'Wrathful Rattle': 'Grondement de la wyverne',
        'Wyvern\'s Ouroblade': 'Tourbillon de la wyverne',
        'Wyvern\'s Rattle': 'Râle de la wyverne',
        'Wyvern\'s Weal': 'Euphorie de la wyverne',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Guardian Arkveld': '護竜アルシュベルド',
      },
      'replaceText': {
        'Aetheric Resonance': '地脈共振',
        'Chainblade Blow': '鎖刃叩きつけ',
        'Chainblade Charge': '鎖刃振り下ろし',
        'Clamorous Chase': '鎖刃躍動',
        'Dragonspark': '龍光',
        'Forged Fury': '護竜乱撃',
        'Greater Resonance': '護竜共振：大',
        'Guardian Resonance': '護竜共振',
        'Roar': '咆哮',
        'Rush': '突進',
        'Steeltail Thrust': '尻尾突き上げ',
        'White Flash': '白光',
        'Wild Energy': '龍光放散',
        'Wrathful Rattle': '鎖哭龍閃・改',
        'Wyvern\'s Ouroblade': '回転鎖刃【龍閃】',
        'Wyvern\'s Rattle': '鎖哭龍閃',
        'Wyvern\'s Weal': '龍閃砲',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Guardian Arkveld': '护锁刃龙',
      },
      'replaceText': {
        '\\(aoes\\)': '(圆形AOE)',
        '\\(dash\\)': '(冲锋)',
        '\\(raidwide\\)': '(全屏)',
        '\\(wing\\)': '(翅膀)',
        'Aetheric Resonance': '地脉共振',
        'Chainblade Blow': '锁刃敲打',
        'Chainblade Charge': '锁刃下挥',
        'Clamorous Chase': '锁刃跃动',
        'Dragonspark': '龙光',
        'Forged Fury': '护龙乱击',
        'Greater Resonance': '护龙大共振',
        'Guardian Resonance': '护龙共振',
        'Roar': '咆哮',
        'Rush': '突进',
        'Siegeflight': '锁刃飞翔突进',
        'Steeltail Thrust': '龙尾突刺',
        'White Flash': '白光',
        'Wild Energy': '龙光扩散',
        'Wrathful Rattle': '锁哭龙闪·改',
        'Wyvern\'s Ouroblade': '回旋锁刃【龙闪】',
        'Wyvern\'s Radiance': '龙闪',
        'Wyvern\'s Rattle': '锁哭龙闪',
        'Wyvern\'s Vengeance': '波状龙闪',
        'Wyvern\'s Weal': '龙闪炮',
      },
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {
        // 'Guardian Arkveld': '', // FIXME '护锁刃龙'
      },
      'replaceText': {
        // '\\(aoes\\)': '', // FIXME '(圆形AOE)'
        // '\\(dash\\)': '', // FIXME '(冲锋)'
        // '\\(raidwide\\)': '', // FIXME '(全屏)'
        // '\\(wing\\)': '', // FIXME '(翅膀)'
        // 'Aetheric Resonance': '', // FIXME '地脉共振'
        // 'Chainblade Blow': '', // FIXME '锁刃敲打'
        // 'Chainblade Charge': '', // FIXME '锁刃下挥'
        // 'Clamorous Chase': '', // FIXME '锁刃跃动'
        // 'Dragonspark': '', // FIXME '龙光'
        // 'Forged Fury': '', // FIXME '护龙乱击'
        // 'Greater Resonance': '', // FIXME '护龙大共振'
        // 'Guardian Resonance': '', // FIXME '护龙共振'
        'Roar': '咆哮',
        'Rush': '突進',
        // 'Siegeflight': '', // FIXME '锁刃飞翔突进'
        // 'Steeltail Thrust': '', // FIXME '龙尾突刺'
        // 'White Flash': '', // FIXME '白光'
        // 'Wild Energy': '', // FIXME '龙光扩散'
        // 'Wrathful Rattle': '', // FIXME '锁哭龙闪·改'
        // 'Wyvern\'s Ouroblade': '', // FIXME '回旋锁刃【龙闪】'
        // 'Wyvern\'s Radiance': '', // FIXME '龙闪'
        // 'Wyvern\'s Rattle': '', // FIXME '锁哭龙闪'
        // 'Wyvern\'s Vengeance': '', // FIXME '波状龙闪'
        // 'Wyvern\'s Weal': '', // FIXME '龙闪炮'
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Guardian Arkveld': '수호룡 알슈베르도',
      },
      'replaceText': {
        '\\(aoes\\)': '(장판)',
        '\\(dash\\)': '(돌진)',
        '\\(raidwide\\)': '(전체공격)',
        '\\(wing\\)': '(날개)',
        'Aetheric Resonance': '지맥 공명',
        'Chainblade Blow': '사슬날 매질',
        'Chainblade Charge': '사슬날 내리찍기',
        'Clamorous Chase': '사슬날 약동',
        'Dragonspark': '용빛',
        'Forged Fury': '수호룡 난격',
        'Greater Resonance': '수호룡 대공명',
        'Guardian Resonance': '수호룡 공명',
        'Roar': '포효',
        'Rush': '돌진',
        'Siegeflight': '사슬날 비상 돌진',
        'Steeltail Thrust': '꼬리 내려치기',
        'White Flash': '백광',
        'Wild Energy': '용빛 발산',
        'Wrathful Rattle': '강화 쇄곡용섬',
        'Wyvern\'s Ouroblade': '회전 사슬날: 용의 섬광',
        'Wyvern\'s Radiance': '용의 섬광',
        'Wyvern\'s Rattle': '쇄곡용섬',
        'Wyvern\'s Vengeance': '파상 용섬',
        'Wyvern\'s Weal': '용섬포',
      },
    },
  ],
};

export default triggerSet;
