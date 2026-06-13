import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const limitCutMap: { [id: string]: number } = {
  ['0194']: 1,
  ['0195']: 2,
  ['0196']: 3,
  ['0197']: 4,
  ['0198']: 5,
  ['0199']: 6,
  ['019A']: 7,
  ['019B']: 8,
} as const;

const limitCutIds: readonly string[] = Object.keys(limitCutMap);

export interface Data extends RaidbossData {
  limitCutNumber?: number;
}

// TODO: baits + towers

const triggerSet: TriggerSet<Data> = {
  id: 'TheWindwardWildsExtreme',
  zoneId: ZoneId.TheWindwardWildsExtreme,
  timelineFile: 'arkveld-ex.txt',
  triggers: [
    {
      id: 'Arkveld Ex Roar',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: 'ABA[EF]', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Arkveld Ex Chainblade Blow Left',
      type: 'StartsUsing',
      // This is relative to the front of the boss, even when he's not on
      // the edge.
      netRegex: { source: 'Guardian Arkveld', id: ['AB6F', 'B019'], capture: false },
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'Arkveld Ex Chainblade Blow Right',
      type: 'StartsUsing',
      // This is relative to the front of the boss, even when he's not on
      // the edge.
      netRegex: { source: 'Guardian Arkveld', id: ['AB70', 'B01A'], capture: false },
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'Arkveld Ex Guardian Siegeflight',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: ['AB7B', 'B029'], capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow Dash => Out + Healer Stacks',
        },
      },
    },
    {
      id: 'Arkveld Ex Wyvern Siegeflight',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: ['AB7E', 'B02A'], capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow Dash => In + Healer Stacks',
        },
      },
    },
    {
      id: 'Arkveld Ex Wyverns Ouroblade Left',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: ['AB8B', 'B031'], capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) => {
        const bossDirNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        // Safe area is 90* clockwise of heading
        const safeDirNum = (bossDirNum + 2) % 8;
        const safeDir = Directions.outputFrom8DirNum(safeDirNum);

        return output.text!({ dir: output[safeDir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        text: {
          en: '${dir} (Right) + Spread',
        },
      },
    },
    {
      id: 'Arkveld Ex Wyverns Ouroblade Right',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: ['AB8D', 'B032'], capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) => {
        const bossDirNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        // Safe area is 270* clockwise of heading (90* ccw)
        const safeDirNum = (bossDirNum + 6) % 8;
        const safeDir = Directions.outputFrom8DirNum(safeDirNum);

        return output.text!({ dir: output[safeDir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        text: {
          en: '${dir} (Left) + Spread',
        },
      },
    },
    {
      id: 'Arkveld Ex Spread Marker',
      type: 'HeadMarker',
      netRegex: { id: '0065', capture: false },
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'Arkveld Ex Steeltail Thrust',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: ['ABAD', 'B035'], capture: false },
      response: Responses.goFrontOrSides(),
    },
    {
      id: 'Arkveld Ex Forged Fury',
      type: 'StartsUsing',
      // Appears alongside AB9E, AEF9, and AB9F
      netRegex: { source: 'Guardian Arkveld', id: 'AEF8', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Arkveld Ex Limit Cut',
      type: 'HeadMarker',
      netRegex: { id: limitCutIds, capture: true },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      run: (data, matches) => {
        if (!limitCutIds.includes(matches.id))
          return;
        const num = limitCutMap[matches.id];
        data.limitCutNumber = num;
      },
    },
    {
      id: 'Arkveld Ex Roar 2',
      type: 'StartsUsing',
      netRegex: { source: 'Guardian Arkveld', id: 'B092', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Arkveld Ex Clamorous Chase',
      type: 'StartsUsing',
      // This assumes the popular Diamond Cut strategy
      netRegex: { source: 'Guardian Arkveld', id: ['ABB3', 'ABB6'], capture: true },
      delaySeconds: 0.1,
      durationSeconds: 20,
      alertText: (data, matches, output) => {
        const startEast: { [id: number]: DirectionOutputCardinal } = {
          [1]: 'dirE',
          [2]: 'dirS',
          [3]: 'dirW',
          [4]: 'dirN',
          [5]: 'dirE',
          [6]: 'dirS',
          [7]: 'dirW',
          [8]: 'dirN',
        } as const;
        const startWest: { [id: number]: DirectionOutputCardinal } = {
          [1]: 'dirW',
          [2]: 'dirS',
          [3]: 'dirE',
          [4]: 'dirN',
          [5]: 'dirW',
          [6]: 'dirS',
          [7]: 'dirE',
          [8]: 'dirN',
        } as const;

        const directions = matches.id === 'ABB3' ? startEast : startWest;
        const num = data.limitCutNumber;
        const dir = num === undefined ? directions[1] : directions[num];
        if (dir === undefined) {
          if (num !== undefined) {
            return output.number!({ num: num });
          }
          return output.unknown!();
        }

        const dirStr = output[dir]!();

        if (num === undefined) {
          return output.first!({ dir: dirStr });
        }

        return output.text!({ dir: dirStr, num: num });
      },
      outputStrings: {
        ...Directions.outputStringsCardinalDir,
        text: {
          en: '${dir} (${num})',
        },
        number: {
          en: '${num}',
        },
        first: {
          en: '1 starts ${dir}',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Arkveld Ex Laser Target',
      type: 'HeadMarker',
      netRegex: { id: '01D6', capture: true },
      suppressSeconds: 1,
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.laserOnYou!();

        return output.laserOnPlayer!({ player: data.party.member(matches.target) });
      },
      outputStrings: {
        laserOnYou: {
          en: 'Laser on you',
        },
        laserOnPlayer: {
          en: 'Laser on ${player}',
        },
      },
    },
  ],
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
