import Conditions from '../../../../../resources/conditions';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  bangyzoom?: boolean;
}

// TODO: could consider keeping track of the gobbie driver?
// Nothing in the logs for when you get in, other than removing combatanat.
// FDE, FDF, FE0, FE1 are all skills you use when inside.
// 12C0, FE2 are exploding it and getting out.
// There aren't many triggers, so maybe worth just keeping the global callouts
// for bombs and stuns.

const triggerSet: TriggerSet<Data> = {
  id: 'AlexanderTheCuffOfTheFatherSavage',
  zoneId: ZoneId.AlexanderTheCuffOfTheFatherSavage,
  timelineFile: 'a2s.txt',
  timelineTriggers: [
    {
      id: 'A2S Breakblock',
      regex: /(?:Brainhurt|Bodyhurt) Breakblock/,
      beforeSeconds: 10,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stun Soon',
          de: 'Bald unterbrechen',
          fr: 'Étourdissez bientôt',
          ja: 'まもなくスタン',
          cn: '马上眩晕',
          ko: '곧 기절',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'A2S Bomb',
      type: 'AddedCombatant',
      netRegex: { name: 'Bomb', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bomb',
          de: 'Bombe',
          fr: 'Bombe',
          ja: '爆弾',
          cn: '炸弹出现',
          ko: '폭탄',
        },
      },
    },
    {
      id: 'A2S Prey',
      type: 'Ability',
      netRegex: { source: 'Magitek Gobwidow G-IX', id: '1413' },
      condition: (data) => data.role === 'healer' || data.job === 'BLU',
      suppressSeconds: 10,
      infoText: (data, matches, output) => output.text!({ player: data.ShortName(matches.target) }),
      outputStrings: {
        text: {
          en: 'Keep ${player} topped',
          de: 'Halte HP von ${player} oben',
          fr: 'Maintenez ${player} Max PV',
          ja: '${player}のHPを満タンに保つ',
          cn: '保持${player}满血',
          ko: '"${player}" 풀피 유지',
        },
      },
    },
    {
      id: 'A2S Prey You',
      type: 'Ability',
      netRegex: { source: 'Magitek Gobwidow G-IX', id: '1413' },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 10,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Boomcannon on YOU',
          de: 'Großeknall auf DIR',
          fr: 'Double cannon sur VOUS',
          ja: '自分にブームカノン',
          cn: '死刑点名',
          ko: '우레 포격 대상자',
        },
      },
    },
    {
      id: 'A2S Soldier Spawn',
      type: 'AddedCombatant',
      netRegex: { name: 'Gordian Soldier', capture: false },
      run: (data) => delete data.bangyzoom,
    },
    {
      id: 'A2S Bangyzoom',
      type: 'Ability',
      netRegex: { id: 'FD9', target: 'Gordian Soldier', capture: false },
      condition: (data) => !data.bangyzoom,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.bangyzoom = true,
      outputStrings: {
        text: {
          en: 'Stun Soldier',
          de: 'unterbreche Soldat',
          fr: 'Étourdissez le soldat',
          ja: 'スタン：ソルジャー',
          cn: '眩晕士兵',
          ko: '병사 기절시키기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Boomtype Magitek Gobwalker G-VII': 'Gobumm-Stampfer VII',
        'Giant Bomb': 'Trumpfbombe',
        'Gordian Hardhelm': 'Gordios-Harthelm',
        'Gordian Hardmind': 'Gordios-Sturschale',
        'Gordian Sniper': 'Indigohand-Scharfschütze',
        'Gordian Soldier': 'Gordios-Soldat',
        'Hangar 12': 'Lagerhalle 12',
        'Jagd Doll': 'Jagdpuppe',
        'King Gobtank G-IV': 'Königs-Gobmaschine IV',
        'Magitek Gobwidow G-IX': 'Gob-Witwe IX',
        '(?<!Giant )Bomb(?!e)': 'Bombe',
      },
      'replaceText': {
        'Blitzstrahl': 'Blitzstrahl',
        'Bodyhurt Breakblock': 'Dickewand für Großeschmerz',
        'Boomcannon': 'Großeknall',
        'Brainhurt Breakblock': 'Dickewand für Zaubernschmerz',
        'Carpet Bomb': 'Flächenbombardement',
        'Explosion': 'Explosion',
        'Gobwalker': 'Gob-Stampfer',
        'Gobwidow': 'Gob-Witwe',
        'Hardhelm': 'Harthelm',
        'Hardmind': 'Sturschale',
        'Jagd Doll': 'Jagdpuppe',
        'Kaltstrahl': 'Kaltstrahl',
        'Massive Explosion': 'Detonation',
        'Sniper': 'Scharfschütze',
        'Soldier': 'Soldat',
        'Wave': 'Welle',
        'mid': 'Mitte',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        '(?<!Giant )Bomb(?!e)': 'Bombe',
        'Boomtype Magitek Gobwalker G-VII': 'gobblindé magitek G-VII Boumbardier',
        'Giant Bomb': 'Bombe géante',
        'Gordian Hardhelm': 'Casque-dur gordien',
        'Gordian Hardmind': 'Cerveau-dur gordien',
        'Gordian Sniper': 'Sniper gordien',
        'Gordian Soldier': 'Soldat gordien',
        'Hangar 12': 'grand hangar GH-12',
        'Jagd Doll': 'Poupée jagd',
        'King Gobtank G-IV': 'Gobtank G-IV Roi',
        'Magitek Gobwidow G-IX': 'Gobmygale magitek G-IX',
      },
      'replaceText': {
        '\\(NW\\)': '(NO)',
        '\\(mid\\)': '(milieu)',
        '\\(SW\\)': '(SO)',
        'Blitzstrahl': 'Blitzstrahl',
        'Bodyhurt Breakblock': 'Blindage corporel',
        'Boomcannon': 'Double canon',
        'Brainhurt Breakblock': 'Blindage spirituel',
        'Carpet Bomb': 'Tapis de bombes',
        'Explosion': 'Explosion',
        'Gobwalker': 'Gobblindé',
        'Gobwidow': 'Gobmygale',
        'Hardhelm': 'Casque-dur',
        'Hardmind': 'Cerveau-dur',
        'Jagd Doll': 'Poupée jagd',
        'Kaltstrahl': 'Kaltstrahl',
        'Massive Explosion': 'Explosion massive',
        'Sniper': 'Sniper',
        'Soldier': 'Soldat',
        'Wave': 'Vague',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Boomtype Magitek Gobwalker G-VII': 'VII号ゴブリウォーカーB型',
        'Giant Bomb': '切り札',
        'Gordian Hardhelm': 'ゴルディオス・ハードヘルム',
        'Gordian Hardmind': 'ゴルディオス・ハードマインド',
        'Gordian Sniper': 'ゴルディオス・スナイパー',
        'Gordian Soldier': 'ゴルディオス・ソルジャー',
        'Hangar 12': '第12大型格納庫',
        'Jagd Doll': 'ヤークトドール',
        'King Gobtank G-IV': 'IV号キング・ゴブリタンク',
        'Magitek Gobwidow G-IX': 'IX号ゴブリウィドー',
        '(?<!Giant )Bomb(?!e)': '爆弾',
      },
      'replaceText': {
        'Blitzstrahl': 'ブリッツシュトラール',
        'Bodyhurt Breakblock': 'ボディブレイクブロック',
        'Boomcannon': 'ブームカノン',
        'Brainhurt Breakblock': 'ブレインブレイクブロック',
        'Carpet Bomb': '絨毯爆撃',
        '(?<!Massive )Explosion': '爆発',
        'Gobwalker': 'ゴブリウォーカー',
        'Gobwidow': 'ゴブリウィドー',
        'Hardhelm': 'ハードヘルム',
        'Hardmind': 'ハードマインド',
        'Jagd Doll': 'ヤークトドール',
        'Kaltstrahl': 'カルトシュトラール',
        'Massive Explosion': '大爆発',
        'Sniper': 'スナイパー',
        'Soldier': 'ソルジャー',
        'Wave': 'ウェイヴ',
        '\\(mid\\)': '(中央)',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Boomtype Magitek Gobwalker G-VII': '爆破型7号哥布林战车',
        'Giant Bomb': '最终炸弹',
        'Gordian Hardhelm': '戈耳狄硬盔兵',
        'Gordian Hardmind': '戈耳狄铁心兵',
        'Gordian Sniper': '戈耳狄狙击手',
        'Gordian Soldier': '戈耳狄士兵',
        'Hangar 12': '第12大型机库',
        'Jagd Doll': '狩猎人偶',
        'King Gobtank G-IV': '4号哥布林坦克王',
        'Magitek Gobwidow G-IX': '9号哥布林黑寡妇',
        '(?<!Giant )Bomb(?!e)': '炸弹',
      },
      'replaceText': {
        'Blitzstrahl': '迅光',
        'Bodyhurt Breakblock': '躯体防护',
        'Boomcannon': '爆炸加农炮',
        'Brainhurt Breakblock': '精神防护',
        'Carpet Bomb': '地毯式轰炸',
        '(?<!Massive )Explosion': '爆炸',
        'Gobwalker': '哥布林战车',
        'Gobwidow': '哥布林黑寡妇',
        'Hardhelm': '戈耳狄硬盔兵',
        'Hardmind': '戈耳狄铁心兵',
        'Jagd Doll': '狩猎人偶',
        'Kaltstrahl': '寒光',
        'Massive Explosion': '大爆炸',
        'Sniper': '戈耳狄狙击手',
        'Soldier': '戈耳狄士兵',
        'Wave': '波',
        '\\(mid\\)': '(中央)',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        '(?<!Giant )Bomb(?!e)': '폭탄',
        'Boomtype Magitek Gobwalker G-VII': 'VII호 고블린워커 B형',
        'Giant Bomb': '대형 폭탄',
        'Gordian Hardhelm': '고르디우스 강화투구',
        'Gordian Hardmind': '고르디우스 강화두뇌',
        'Gordian Sniper': '고르디우스 저격수',
        'Gordian Soldier': '고르디우스 병사',
        'Hangar 12': '제12 대형 격납고',
        'Jagd Doll': '인형 수렵병',
        'King Gobtank G-IV': 'IV호 대왕 고블린탱크',
        'Magitek Gobwidow G-IX': 'IX호 고블린거미',
      },
      'replaceText': {
        'Blitzstrahl': '벼락',
        'Bodyhurt Breakblock': '육체 타격',
        'Boomcannon': '우레 포격',
        'Brainhurt Breakblock': '정신 타격',
        'Carpet Bomb': '융단폭격',
        '(?<!Massive )Explosion': '폭발',
        'Gobwalker': '고블린워커',
        'Gobwidow': '고블린거미',
        'Hardhelm': '강화투구',
        'Hardmind': '강화두뇌',
        'Jagd Doll': '인형 수렵병',
        'Kaltstrahl': '냉병기 공격',
        'Massive Explosion': '대폭발',
        'Sniper': '저격수',
        'Soldier': '병사',
        'Wave': '웨이브',
        '\\(mid\\)': '(중앙)',
      },
    },
  ],
};

export default triggerSet;