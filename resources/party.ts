import { Party } from '../types/event';
import { Job, Role } from '../types/job';
import { PartyMemberParamObject, PartyTrackerOptions } from '../types/party';
import { LocaleText } from '../types/trigger';

import Util from './util';

const emptyRoleToPartyNames = () => {
  return {
    tank: [],
    healer: [],
    dps: [],
    crafter: [],
    gatherer: [],
    none: [],
  };
};

const roleLocalized: Record<Role, LocaleText> = {
  tank: {
    en: 'tank',
    de: 'Verteidiger',
    fr: 'Tank',
    ja: 'タンク',
    cn: '坦克',
    tc: '坦克',
    ko: '탱커',
  },
  healer: {
    en: 'healer',
    de: 'Heiler',
    fr: 'Soigneur',
    ja: 'ヒーラー',
    cn: '治疗',
    tc: '補師',
    ko: '힐러',
  },
  dps: {
    en: 'dps',
    de: 'DPS',
    fr: 'DPS',
    ja: 'DPS',
    cn: '输出',
    tc: '打手',
    ko: '딜러',
  },
  crafter: {
    en: 'crafter',
    de: 'Handwerker',
    fr: 'Artisan',
    ja: 'クラフター',
    cn: '能工巧匠',
    tc: '能工巧匠',
    ko: '제작가',
  },
  gatherer: {
    en: 'gatherer',
    de: 'Sammler',
    fr: 'Récolteur',
    ja: 'ギャザラー',
    cn: '大地使者',
    tc: '大地使者',
    ko: '채집가',
  },
  none: {
    en: 'none',
    de: 'Keine',
    fr: 'Aucun',
    ja: '冒険者',
    cn: '冒险者',
    tc: '冒險者',
    ko: '모험가',
  },
};

const jobLocalizedAbbr: Record<Job, LocaleText> = {
  NONE: {
    en: 'NONE',
    de: 'Keine',
    fr: 'Aucun',
    ja: '冒険者',
    cn: '冒险',
    tc: '冒險',
    ko: '모험가',
  },
  GLA: {
    en: 'GLA',
    de: 'GLA',
    fr: 'GLA',
    ja: '剣術士',
    cn: '剑术',
    tc: '劍術',
    ko: '검술',
  },
  PGL: {
    en: 'PGL',
    de: 'FST',
    fr: 'PGL',
    ja: '格闘士',
    cn: '格斗',
    tc: '格鬥',
    ko: '격투',
  },
  MRD: {
    en: 'MRD',
    de: 'MAR',
    fr: 'MRD',
    ja: '斧術士',
    cn: '斧术',
    tc: '斧術',
    ko: '도끼술',
  },
  LNC: {
    en: 'LNC',
    de: 'PIK',
    fr: 'HAS',
    ja: '槍術士',
    cn: '枪术',
    tc: '槍術',
    ko: '창술',
  },
  ARC: {
    en: 'ARC',
    de: 'WDL',
    fr: 'ARC',
    ja: '弓術士',
    cn: '弓箭',
    tc: '弓術',
    ko: '궁술',
  },
  CNJ: {
    en: 'CNJ',
    de: 'DRU',
    fr: 'ÉLM',
    ja: '幻術士',
    cn: '幻术',
    tc: '幻術',
    ko: '환술',
  },
  THM: {
    en: 'THM',
    de: 'THM',
    fr: 'OCC',
    ja: '呪術士',
    cn: '咒术',
    tc: '咒術',
    ko: '주술',
  },
  CRP: {
    en: 'CRP',
    de: 'ZMR',
    fr: 'MEN',
    ja: '木工',
    cn: '刻木',
    tc: '木工',
    ko: '목수',
  },
  BSM: {
    en: 'BSM',
    de: 'GRS',
    fr: 'FRG',
    ja: '鍛冶',
    cn: '锻铁',
    tc: '鍛造',
    ko: '대장',
  },
  ARM: {
    en: 'ARM',
    de: 'PLA',
    fr: 'ARM',
    ja: '甲冑',
    cn: '铸甲',
    tc: '甲冑',
    ko: '갑주',
  },
  GSM: {
    en: 'GSM',
    de: 'GLD',
    fr: 'ORF',
    ja: '彫金',
    cn: '雕金',
    tc: '金工',
    ko: '보석',
  },
  LTW: {
    en: 'LTW',
    de: 'GER',
    fr: 'TAN',
    ja: '革細',
    cn: '制革',
    tc: '皮革',
    ko: '가죽',
  },
  WVR: {
    en: 'WVR',
    de: 'WEB',
    fr: 'COU',
    ja: '裁縫',
    cn: '裁衣',
    tc: '裁縫',
    ko: '재봉',
  },
  ALC: {
    en: 'ALC',
    de: 'ALC',
    fr: 'ALC',
    ja: '錬金',
    cn: '炼金',
    tc: '鍊金',
    ko: '연금',
  },
  CUL: {
    en: 'CUL',
    de: 'GRM',
    fr: 'CUI',
    ja: '調理',
    cn: '烹调',
    tc: '烹調',
    ko: '요리',
  },
  MIN: {
    en: 'MIN',
    de: 'MIN',
    fr: 'MIN',
    ja: '採掘',
    cn: '采矿',
    tc: '採掘',
    ko: '광부',
  },
  BTN: {
    en: 'BTN',
    de: 'GÄR',
    fr: 'BOT',
    ja: '園芸',
    cn: '园艺',
    tc: '園藝',
    ko: '원예',
  },
  FSH: {
    en: 'FSH',
    de: 'FIS',
    fr: 'PEC',
    ja: '漁師',
    cn: '捕鱼',
    tc: '漁師',
    ko: '어부',
  },
  PLD: {
    en: 'PLD',
    de: 'PLD',
    fr: 'PLD',
    ja: 'ナイト',
    cn: '骑士',
    tc: '騎士',
    ko: '나이트',
  },
  MNK: {
    en: 'MNK',
    de: 'MÖN',
    fr: 'MOI',
    ja: 'モンク',
    cn: '武僧',
    tc: '武僧',
    ko: '몽크',
  },
  WAR: {
    en: 'WAR',
    de: 'KRG',
    fr: 'GUE',
    ja: '戦士',
    cn: '战士',
    tc: '戰士',
    ko: '전사',
  },
  DRG: {
    en: 'DRG',
    de: 'DRG',
    fr: 'DRG',
    ja: '竜騎士',
    cn: '龙骑',
    tc: '龍騎',
    ko: '용기사',
  },
  BRD: {
    en: 'BRD',
    de: 'BRD',
    fr: 'BRD',
    ja: '詩人',
    cn: '诗人',
    tc: '詩人',
    ko: '음유',
  },
  WHM: {
    en: 'WHM',
    de: 'WMA',
    fr: 'MBL',
    ja: '白魔',
    cn: '白魔',
    tc: '白魔',
    ko: '백마',
  },
  BLM: {
    en: 'BLM',
    de: 'SMA',
    fr: 'MNO',
    ja: '黒魔',
    cn: '黑魔',
    tc: '黑魔',
    ko: '흑마',
  },
  ACN: {
    en: 'ACN',
    de: 'HRT',
    fr: 'ACN',
    ja: '巴術士',
    cn: '秘术',
    tc: '巴術',
    ko: '비술',
  },
  SMN: {
    en: 'SMN',
    de: 'BSW',
    fr: 'INV',
    ja: '召喚',
    cn: '召唤',
    tc: '召喚',
    ko: '소환',
  },
  SCH: {
    en: 'SCH',
    de: 'GLT',
    fr: 'ERU',
    ja: '学者',
    cn: '学者',
    tc: '學者',
    ko: '학자',
  },
  ROG: {
    en: 'ROG',
    de: 'SCH',
    fr: 'SUR',
    ja: '双剣士',
    cn: '双剑',
    tc: '雙劍',
    ko: '쌍검',
  },
  NIN: {
    en: 'NIN',
    de: 'NIN',
    fr: 'NIN',
    ja: '忍者',
    cn: '忍者',
    tc: '忍者',
    ko: '닌자',
  },
  MCH: {
    en: 'MCH',
    de: 'MCH',
    fr: 'MCH',
    ja: '機工',
    cn: '机工',
    tc: '機工',
    ko: '기공',
  },
  DRK: {
    en: 'DRK',
    de: 'DKR',
    fr: 'CHN',
    ja: '暗黒',
    cn: '暗骑',
    tc: '暗騎',
    ko: '암기',
  },
  AST: {
    en: 'AST',
    de: 'AST',
    fr: 'AST',
    ja: '占星',
    cn: '占星',
    tc: '占星',
    ko: '점성',
  },
  SAM: {
    en: 'SAM',
    de: 'SAM',
    fr: 'SAM',
    ja: '侍',
    cn: '武士',
    tc: '武士',
    ko: '사무',
  },
  RDM: {
    en: 'RDM',
    de: 'RMA',
    fr: 'MRG',
    ja: '赤魔',
    cn: '赤魔',
    tc: '赤魔',
    ko: '적마',
  },
  BLU: {
    en: 'BLU',
    de: 'BMA',
    fr: 'MBU',
    ja: '青魔',
    cn: '青魔',
    tc: '青魔',
    ko: '청마',
  },
  GNB: {
    en: 'GNB',
    de: 'REV',
    fr: 'PSB',
    ja: 'ガンブレ',
    cn: '绝枪',
    tc: '絕槍',
    ko: '건브',
  },
  DNC: {
    en: 'DNC',
    de: 'TÄN',
    fr: 'DNS',
    ja: '踊り子',
    cn: '舞者',
    tc: '舞者',
    ko: '무도',
  },
  RPR: {
    en: 'RPR',
    de: 'SNT',
    fr: 'FCH',
    ja: 'リーパー',
    cn: '钐镰',
    tc: '奪魂',
    ko: '리퍼',
  },
  SGE: {
    en: 'SGE',
    de: 'WEI',
    fr: 'SAG',
    ja: '賢者',
    cn: '贤者',
    tc: '賢者',
    ko: '현자',
  },
  VPR: {
    en: 'VPR',
    de: 'VPR',
    fr: 'VPR',
    ja: 'ヴァイパー',
    cn: '蝰蛇',
    tc: '毒蛇',
    ko: '바이퍼',
  },
  PCT: {
    en: 'PCT',
    de: 'PKT',
    fr: 'PIC',
    ja: 'ピクトマンサー',
    cn: '画家',
    tc: '繪靈',
    ko: '픽토',
  },
};

const jobLocalizedFull: Record<Job, LocaleText> = {
  NONE: {
    en: 'Adventurer',
    de: 'Abenteurer',
    fr: 'Aventurier',
    ja: '冒険者',
    cn: '冒险者',
    tc: '冒險者',
    ko: '모험가',
  },
  GLA: {
    en: 'Gladiator',
    de: 'Gladiator',
    fr: 'Gladiateur',
    ja: '剣術士',
    cn: '剑术师',
    tc: '劍術士',
    ko: '검술사',
  },
  PGL: {
    en: 'Pugilist',
    de: 'Faustkämpfer',
    fr: 'Pugiliste',
    ja: '格闘士',
    cn: '格斗家',
    tc: '格鬥士',
    ko: '격투가',
  },
  MRD: {
    en: 'Marauder',
    de: 'Marodeur',
    fr: 'Maraudeur',
    ja: '斧術士',
    cn: '斧术师',
    tc: '斧術士',
    ko: '도끼술사',
  },
  LNC: {
    en: 'Lancer',
    de: 'Pikenier',
    fr: 'Maître d\'Hast',
    ja: '槍術士',
    cn: '枪术师',
    tc: '槍術士',
    ko: '창술사',
  },
  ARC: {
    en: 'Archer',
    de: 'Waldläufer',
    fr: 'Archer',
    ja: '弓術士',
    cn: '弓箭手',
    tc: '弓術士',
    ko: '궁술사',
  },
  CNJ: {
    en: 'Conjurer',
    de: 'Druide',
    fr: 'Élémentaliste',
    ja: '幻術士',
    cn: '幻术师',
    tc: '幻術士',
    ko: '환술사',
  },
  THM: {
    en: 'Thaumaturge',
    de: 'Thaumaturg',
    fr: 'Occultiste',
    ja: '呪術士',
    cn: '咒术师',
    tc: '咒術士',
    ko: '주술사',
  },
  CRP: {
    en: 'Carpenter',
    de: 'Zimmerer',
    fr: 'Charpentier',
    ja: '木工師',
    cn: '刻木匠',
    tc: '木工師',
    ko: '목수',
  },
  BSM: {
    en: 'Blacksmith',
    de: 'Grobschmied',
    fr: 'Forgeron',
    ja: '鍛冶師',
    cn: '锻铁匠',
    tc: '鍛造師',
    ko: '대장장이',
  },
  ARM: {
    en: 'Armorer',
    de: 'Plattner',
    fr: 'Armurier',
    ja: '甲冑師',
    cn: '铸甲匠',
    tc: '甲冑師',
    ko: '갑주제작사',
  },
  GSM: {
    en: 'Goldsmith',
    de: 'Goldschmied',
    fr: 'Orfèvre',
    ja: '彫金師',
    cn: '雕金匠',
    tc: '金工師',
    ko: '보석공예가',
  },
  LTW: {
    en: 'Leatherworker',
    de: 'Gerber',
    fr: 'Tanneur',
    ja: '革細工師',
    cn: '制革匠',
    tc: '皮革師',
    ko: '가죽공예가',
  },
  WVR: {
    en: 'Weaver',
    de: 'Weber',
    fr: 'Couturier',
    ja: '裁縫師',
    cn: '裁衣匠',
    tc: '裁縫師',
    ko: '재봉사',
  },
  ALC: {
    en: 'Alchemist',
    de: 'Alchemist',
    fr: 'Alchimiste',
    ja: '錬金術師',
    cn: '炼金术士',
    tc: '鍊金術師',
    ko: '연금술사',
  },
  CUL: {
    en: 'Culinarian',
    de: 'Gourmet',
    fr: 'Cuisinier',
    ja: '調理師',
    cn: '烹调师',
    tc: '烹調師',
    ko: '요리사',
  },
  MIN: {
    en: 'Miner',
    de: 'Minenarbeiter',
    fr: 'Mineur',
    ja: '採掘師',
    cn: '采矿工',
    tc: '採掘師',
    ko: '광부',
  },
  BTN: {
    en: 'Botanist',
    de: 'Gärtner',
    fr: 'Botaniste',
    ja: '園芸師',
    cn: '园艺工',
    tc: '園藝師',
    ko: '원예가',
  },
  FSH: {
    en: 'Fisher',
    de: 'Fischer',
    fr: 'Pêcheur',
    ja: '漁師',
    cn: '捕鱼人',
    tc: '漁師',
    ko: '어부',
  },
  PLD: {
    en: 'Paladin',
    de: 'Paladin',
    fr: 'Paladin',
    ja: 'ナイト',
    cn: '骑士',
    tc: '騎士',
    ko: '나이트',
  },
  MNK: {
    en: 'Monk',
    de: 'Mönch',
    fr: 'Moine',
    ja: 'モンク',
    cn: '武僧',
    tc: '武僧',
    ko: '몽크',
  },
  WAR: {
    en: 'Warrior',
    de: 'Krieger',
    fr: 'Guerrier',
    ja: '戦士',
    cn: '战士',
    tc: '戰士',
    ko: '전사',
  },
  DRG: {
    en: 'Dragoon',
    de: 'Dragoon',
    fr: 'Chevalier dragon',
    ja: '竜騎士',
    cn: '龙骑士',
    tc: '龍騎士',
    ko: '용기사',
  },
  BRD: {
    en: 'Bard',
    de: 'Barde',
    fr: 'Barde',
    ja: '吟遊詩人',
    cn: '吟游诗人',
    tc: '吟遊詩人',
    ko: '음유시인',
  },
  WHM: {
    en: 'White Mage',
    de: 'Weißmagier',
    fr: 'Mage blanc',
    ja: '白魔道士',
    cn: '白魔法师',
    tc: '白魔道士',
    ko: '백마도사',
  },
  BLM: {
    en: 'Black Mage',
    de: 'Schwarzmagier',
    fr: 'Mage noir',
    ja: '黒魔道士',
    cn: '黑魔法师',
    tc: '黑魔道士',
    ko: '흑마도사',
  },
  ACN: {
    en: 'Arcanist',
    de: 'Hermetiker',
    fr: 'Arcaniste',
    ja: '巴術士',
    cn: '秘术师',
    tc: '巴術士',
    ko: '비슬사',
  },
  SMN: {
    en: 'Summoner',
    de: 'Beschwörer',
    fr: 'Invocateur',
    ja: '召喚士',
    cn: '召唤师',
    tc: '召喚士',
    ko: '소환사',
  },
  SCH: {
    en: 'Scholar',
    de: 'Gelehrter',
    fr: 'Érudit',
    ja: '学者',
    cn: '学者',
    tc: '學者',
    ko: '학자',
  },
  ROG: {
    en: 'Rogue',
    de: 'Schurke',
    fr: 'Surineur',
    ja: '双剣士',
    cn: '双剑师',
    tc: '雙劍士',
    ko: '쌍검사',
  },
  NIN: {
    en: 'Ninja',
    de: 'Ninja',
    fr: 'Ninja',
    ja: '忍者',
    cn: '忍者',
    tc: '忍者',
    ko: '닌자',
  },
  MCH: {
    en: 'Machinist',
    de: 'Maschinist',
    fr: 'Machiniste',
    ja: '機工士',
    cn: '机工士',
    tc: '機工士',
    ko: '기공사',
  },
  DRK: {
    en: 'Dark Knight',
    de: 'Dunkelritter',
    fr: 'Chevalier noir',
    ja: '暗黒騎士',
    cn: '暗黑骑士',
    tc: '暗黑騎士',
    ko: '암흑기사',
  },
  AST: {
    en: 'Astrologian',
    de: 'Astrologe',
    fr: 'Astromancien',
    ja: '占星術師',
    cn: '占星术士',
    tc: '占星術師',
    ko: '점성술사',
  },
  SAM: {
    en: 'Samurai',
    de: 'Samurai',
    fr: 'Samuraï',
    ja: '侍',
    cn: '武士',
    tc: '武士',
    ko: '사무라이',
  },
  RDM: {
    en: 'Red Mage',
    de: 'Rotmagier',
    fr: 'Mage rouge',
    ja: '赤魔道士',
    cn: '赤魔法师',
    tc: '赤魔道士',
    ko: '적마도사',
  },
  BLU: {
    en: 'Blue Mage',
    de: 'Blaumagier',
    fr: 'Mage bleu',
    ja: '青魔道士',
    cn: '青魔法师',
    tc: '青魔道士',
    ko: '청마도사',
  },
  GNB: {
    en: 'Gunbreaker',
    de: 'Revolverklinge',
    fr: 'Pistosabreur',
    ja: 'ガンブレイカー',
    cn: '绝枪战士',
    tc: '絕槍戰士',
    ko: '건브레이커',
  },
  DNC: {
    en: 'Dancer',
    de: 'Tänzer',
    fr: 'Danseur',
    ja: '踊り子',
    cn: '舞者',
    tc: '舞者',
    ko: '무도가',
  },
  RPR: {
    en: 'Reaper',
    de: 'Schnitter',
    fr: 'Faucheur',
    ja: 'リーパー',
    cn: '钐镰客',
    tc: '奪魂者',
    ko: '리퍼',
  },
  SGE: {
    en: 'Sage',
    de: 'Weiser',
    fr: 'Sage',
    ja: '賢者',
    cn: '贤者',
    tc: '賢者',
    ko: '현자',
  },
  VPR: {
    en: 'Viper',
    de: 'Viper',
    fr: 'Rôdeur vipère',
    ja: 'ヴァイパー',
    cn: '蝰蛇剑士',
    tc: '毒蛇劍士',
    ko: '바이퍼',
  },
  PCT: {
    en: 'Pictomancer',
    de: 'Piktomant',
    fr: 'Pictomancien',
    ja: 'ピクトマンサー',
    cn: '绘灵法师',
    tc: '繪靈法師',
    ko: '픽토맨서',
  },
};

export default class PartyTracker {
  details: Party[] = [];
  partyNames_: string[] = [];
  partyIds_: string[] = [];
  allianceNames_: string[] = [];
  allianceIds_: string[] = [];
  nameToRole_: { [name: string]: Role } = {};
  idToName_: { [id: string]: string } = {};
  roleToPartyNames_: Record<Role, string[]> = emptyRoleToPartyNames();

  constructor(private options: PartyTrackerOptions) {}

  // Bind this to PartyChanged events.
  onPartyChanged(e: { party: Party[] }): void {
    this.reset();
    this.details = e.party;

    for (const p of e.party) {
      this.allianceIds_.push(p.id);
      this.allianceNames_.push(p.name);
      const jobName = Util.jobEnumToJob(p.job);
      const role = Util.jobToRole(jobName);
      this.idToName_[p.id] = p.name;
      this.nameToRole_[p.name] = role;
      if (p.inParty) {
        this.partyIds_.push(p.id);
        this.partyNames_.push(p.name);
        this.roleToPartyNames_[role].push(p.name);
      }
    }
  }

  reset(): void {
    // original event data
    this.details = [];
    this.partyNames_ = [];
    this.partyIds_ = [];
    this.allianceNames_ = [];
    this.allianceIds_ = [];
    this.nameToRole_ = {};
    this.idToName_ = {};

    // role -> [names] but only for party
    this.roleToPartyNames_ = emptyRoleToPartyNames();
  }

  // returns an array of the names of players in your immediate party
  get partyNames(): readonly string[] {
    return this.partyNames_;
  }

  get partyIds(): readonly string[] {
    return this.partyIds_;
  }

  // returns an array of the names of players in your alliance
  get allianceNames(): readonly string[] {
    return this.allianceNames_;
  }

  // returns an array of the names of tanks in your immediate party
  get tankNames(): readonly string[] {
    return this.roleToPartyNames_['tank'];
  }

  // returns an array of the names of healers in your immediate party
  get healerNames(): readonly string[] {
    return this.roleToPartyNames_['healer'];
  }

  // returns an array of the names of dps players in your immediate party
  get dpsNames(): readonly string[] {
    return this.roleToPartyNames_['dps'];
  }

  // returns true if the named player in your alliance is a particular role
  isRole(name: string, role: string): boolean {
    return this.nameToRole_[name] === role;
  }

  // returns true if the named player in your alliance is a tank
  isTank(name: string): boolean {
    return this.isRole(name, 'tank');
  }

  // returns true if the named player in your alliance is a healer
  isHealer(name: string): boolean {
    return this.isRole(name, 'healer');
  }

  // returns true if the named player in your alliance is a dps
  isDPS(name: string): boolean {
    return this.isRole(name, 'dps');
  }

  // returns true if the named player is in your immediate party
  inParty(name: string): boolean {
    return this.partyNames.includes(name);
  }

  // returns true if the named player is in your alliance
  inAlliance(name: string): boolean {
    return this.allianceNames.includes(name);
  }

  // for a named player, returns the other tank in your immediate party
  // if named player is not a tank, or there's not exactly two tanks
  // in your immediate party, returns null.
  otherTank(name: string): string | undefined {
    const names = this.tankNames;
    if (names.length !== 2)
      return;
    if (names[0] === name)
      return names[1];
    if (names[1] === name)
      return names[0];
  }

  // see: otherTank, but for healers.
  otherHealer(name: string): string | undefined {
    const names = this.healerNames;
    if (names.length !== 2)
      return;
    if (names[0] === name)
      return names[1];
    if (names[1] === name)
      return names[0];
  }

  // returns the job name of the specified party member
  jobName(name: string): Job | undefined {
    const partyIndex = this.partyNames.indexOf(name);
    if (partyIndex < 0)
      return;
    const job = this.details[partyIndex]?.job;
    if (job === undefined)
      return;
    return Util.jobEnumToJob(job);
  }

  nameFromId(id: string): string | undefined {
    return this.idToName_[id];
  }

  member(name?: string): PartyMemberParamObject {
    // For boilerplate convenience in triggers, handle undefined names.
    if (name === undefined) {
      const unknown = '???';
      return {
        name: unknown,
        nick: unknown,
        toString: () => unknown,
      };
    }

    const partyMember = this.details.find((member) => member.name === name);
    let ret: PartyMemberParamObject;
    const nick = Util.shortName(name, this.options.PlayerNicks);

    if (!partyMember) {
      // If we can't find this party member for some reason, use some sort of default.
      ret = {
        name: name,
        nick: nick,
      };
    } else {
      const lang = this.options.DisplayLanguage;
      const job = Util.jobEnumToJob(partyMember.job);
      const jobAbbr = jobLocalizedAbbr[job]?.[lang] ?? job;
      const jobFull = jobLocalizedFull[job]?.[lang] ?? job;
      const role = Util.jobToRole(job);
      const roleName = roleLocalized[role]?.[lang] ?? role;
      ret = {
        id: partyMember.id,
        job: jobAbbr,
        jobFull: jobFull,
        role: roleName,
        name: name,
        nick: nick,
      };
    }

    // Need to assign this afterwards so it can reference `ret`.
    ret.toString = () => {
      const retVal = ret[this.options.DefaultPlayerLabel];
      if (typeof retVal === 'string')
        return retVal;
      return ret.nick;
    };

    return ret;
  }
}
