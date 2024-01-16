// This file contains mappings of zone ids and names that are used in
// `gen_zone_id_and_name.ts` to supplement/override  data from xivapi.
//
// Update this file manually to maintain this data; then re-run the script.

import { LocaleText } from '../types/trigger';

type NameKeyToTerritoryId = {
  [name: string]: number;
};

type NameKeyToTerritoryIds = {
  [name: string]: number[];
};

type TerritoryIdToCfcId = {
  [id: number]: number;
};

type ZoneInfoType = {
  [zoneId: number]: {
    exVersion: number;
    contentType?: number;
    name: LocaleText;
    offsetX: number;
    offsetY: number;
    sizeFactor: number;
    weatherRate: number;
  };
};

type OverrideContainer = {
  knownIds: NameKeyToTerritoryId;
  syntheticIds: NameKeyToTerritoryId;
  knownCollisions: NameKeyToTerritoryIds;
  syntheticContentType: NameKeyToTerritoryId;
  forceTtToCfcMap: TerritoryIdToCfcId;
  syntheticZoneInfo: ZoneInfoType;
};

// name to territory id mappings for locations with conflicts
// these will only be added if the name is correct, and will throw
// errors if not found.
const _KNOWN_IDS: NameKeyToTerritoryId = {
  'TheDiadem': 929,
  'TheGildedAraya': 1136, // TT 509 is a duplicate conflict, possibly due to separate entry for FanFest trial
};

// name to territory id mappings for locations that no longer exist
// (for things removed from the game), or where we intentionally want
// to override the name with our own (e.g. 'TheMaskedCarnivale').
const _SYNTHETIC_IDS: NameKeyToTerritoryId = {
  // old unreals
  'TheAkhAfahAmphitheatreUnreal': 930,
  'TheNavelUnreal': 953,
  'TheWhorleaterUnreal': 972,
  'UltimasBaneUnreal': 1035,
  'ContainmentBayS1T7Unreal': 1090,
  'ContainmentBayP1T6Unreal': 1121,
  'ContainmentBayZ1T9Unreal': 1157,
  // rename to something friendly/useful
  'TheMaskedCarnivale': 796,
  // 6.2 revamp
  'Snowcloak61': 371,
  'SohmAl61': 441,
  'TheAery61': 435,
  'TheKeeperOfTheLake61': 150,
  'TheStepsOfFaith61': 143,
  'TheVault61': 421,
  'ThornmarchHard61': 207,
  // 6.3 revamp
  'BaelsarsWall62': 615,
  'SohrKhai62': 555,
  'TheAetherochemicalResearchFacility62': 438,
  'TheAntitower62': 516,
  'TheGreatGubalLibrary62': 416,
  'Xelphatol62': 572,
  // 6.4 revamp
  'AlaMhigo63': 689,
  'BardamsMettle63': 623,
  'CastrumAbania63': 661,
  'DomaCastle63': 660,
  'TheSirensongSea63': 626,
  // 6.5 revamp
  'TheBurn64': 789,
  'TheGhimlytDark64': 793,
};

// This will override the data-soourced ContentType with our own value.
const _SYNTHETIC_CONTENT_TYPE: NameKeyToTerritoryId = {
  'MaskedCarnivale': 27,
};

// Certain collisions will always happen and we don't care because we're not
// importing any of the zones. Rather than just logging them to the console on
// every run, we can actively ignore them to make our console less cluttered.
const _KNOWN_COLLISIONS: NameKeyToTerritoryIds = {
  'AvoidEngagedTargets': [540, 551],
  'EngageEnemyReinforcements': [543, 547],
  'LeapOfFaith': [792, 899, 1098],
  'OceanFishing': [900, 1163],
  'SleepNowInSapphire': [925, 926],
};

// In theory, we shouldn't include zones in our output when we cannot determine
// the name using the existing algo. That includes zones where we have no cfc id
// in the TT table, and there are multiple entries in CFC that reference the same
// territory id and have different CFC names.
// Due to a bug in the old python script, however, a handful of zones were imported
// by just using the highest cfc id to determine zone name. To avoid breaking changes,
// we'll force these territory ids to reference a single cfc id, preserving existing data.
const _FORCE_TT_TO_CFC_MAP: TerritoryIdToCfcId = {
  // territory id: cfc id
  389: 534, // ChocoboRaceCostaDelSol
  390: 533, // ChocoboRaceSagoliiRoad
  391: 535, // ChocoboRaceTranquilPaths
  831: 769, // FourPlayerMahjongQuickMatchKuitanDisabled
  506: 579, // LovmMasterTournament
};

// For the given TT.ID, use this zone info instead and override the values in game.
// This is for content that has been removed from the game.
const _SYNTHETIC_ZONE_INFO: ZoneInfoType = {
  // Older unreal fights, no longer accessible
  930: {
    'contentType': 4,
    'exVersion': 3,
    'name': {
      'cn': '希瓦幻巧战',
      'de': 'Traumprüfung - Shiva',
      'en': 'The Akh Afah Amphitheatre (Unreal)',
      'fr': 'L\'Amphithéâtre d\'Akh Afah (irréel)',
      'ja': '幻シヴァ討滅戦',
      'ko': '환 시바 토벌전',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 46,
  },
  953: {
    'contentType': 4,
    'exVersion': 3,
    'name': {
      'cn': '泰坦幻巧战',
      'de': 'Traumprüfung - Titan',
      'en': 'The Navel (Unreal)',
      'fr': 'Le Nombril (irréel)',
      'ja': '幻タイタン討滅戦',
      'ko': '환 타이탄 토벌전',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 23,
  },
  972: {
    'contentType': 4,
    'exVersion': 3,
    'name': {
      'cn': '利维亚桑幻巧战',
      'de': 'Traumprüfung - Leviathan',
      'en': 'The <Emphasis>Whorleater</Emphasis> (Unreal)',
      'fr': 'Le Briseur de marées (irréel)',
      'ja': '幻リヴァイアサン討滅戦',
      'ko': '환 리바이어선 토벌전',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 38,
  },
  1035: {
    'contentType': 4,
    'exVersion': 4,
    'name': {
      'cn': '究极神兵幻巧战',
      'de': 'Traumprüfung - Ultima',
      'en': 'Ultima\'s Bane (Unreal)',
      'fr': 'Le fléau d\'Ultima (irréel)',
      'ja': '幻アルテマウェポン破壊作戦',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 31,
  },
  1090: {
    'contentType': 4,
    'exVersion': 4,
    'name': {
      'cn': '萨菲洛特幻巧战',
      'de': 'Traumprüfung - Sephirot',
      'en': 'Containment Bay S1T7 (Unreal)',
      'fr': 'Unité de contention S1P7 (irréel)',
      'ja': '幻魔神セフィロト討滅戦',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 66,
  },
  1121: {
    'contentType': 4,
    'exVersion': 4,
    'name': {
      'cn': '索菲娅幻巧战',
      'de': 'Traumprüfung - Sophia',
      'en': 'Containment Bay P1T6 (Unreal)',
      'fr': 'Unité de contention P1P6 (irréel)',
      'ja': '幻女神ソフィア討滅戦',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 69,
  },
  1157: {
    'contentType': 4,
    'exVersion': 4,
    'name': {
      'cn': '祖尔宛幻巧战',
      'de': 'Traumprüfung - Zurvan',
      'en': 'Containment Bay Z1T9 (Unreal)',
      'fr': 'Unité de contention Z1P9 (irréel)',
      'ja': '幻鬼神ズルワーン討滅戦',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 75,
  },

  // 6.2 updates - content removed/reworked
  143: {
    'contentType': 4,
    'exVersion': 0,
    'name': {
      'cn': '(6.1)皇都伊修加德保卫战',
      'de': '(6.1)Der Schicksalsweg',
      'en': '(6.1)The Steps of Faith',
      'fr': '(6.1)Le Siège de la sainte Cité d\'Ishgard',
      'ja': '(6.1)皇都イシュガルド防衛戦',
      'ko': '(6.1)성도 이슈가르드 방어전',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 28,
  },
  150: {
    'contentType': 2,
    'exVersion': 0,
    'name': {
      'cn': '(6.1)幻龙残骸密约之塔',
      'de': '(6.1)Hüter des Sees',
      'en': '(6.1)The Keeper of the Lake',
      'fr': '(6.1)Le Gardien du lac',
      'ja': '(6.1)幻龍残骸 黙約の塔',
      'ko': '(6.1)묵약의 탑',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 74,
  },
  207: {
    'contentType': 4,
    'exVersion': 0,
    'name': {
      'cn': '(6.1)莫古力贤王歼灭战',
      'de': '(6.1)Königliche Konfrontation (schwer)',
      'en': '(6.1)Thornmarch (Hard)',
      'fr': '(6.1)La Lisière de ronces (brutal)',
      'ja': '(6.1)善王モグル・モグXII世討滅戦',
      'ko': '(6.1)선왕 모그루 모그 XII세 토벌전',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 400,
    'weatherRate': 30,
  },
  371: {
    'contentType': 2,
    'exVersion': 0,
    'name': {
      'cn': '(6.1)凛冽洞天披雪大冰壁',
      'de': '(6.1)Das Schneekleid',
      'en': '(6.1)Snowcloak',
      'fr': '(6.1)Manteneige',
      'ja': '(6.1)氷結潜窟 スノークローク大氷壁',
      'ko': '(6.1)얼음외투 대빙벽',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 42,
  },
  421: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.1)圣教中枢伊修加德教皇厅',
      'de': '(6.1)Erzbasilika',
      'en': '(6.1)The Vault',
      'fr': '(6.1)La Voûte',
      'ja': '(6.1)強硬突入 イシュガルド教皇庁',
      'ko': '(6.1)이슈가르드 교황청',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  435: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.1)邪龙王座龙巢神殿',
      'de': '(6.1)Nest des Drachen',
      'en': '(6.1)The Aery',
      'fr': '(6.1)L\'Aire',
      'ja': '(6.1)邪竜血戦 ドラゴンズエアリー',
      'ko': '(6.1)용의 둥지',
    },
    'offsetX': -40,
    'offsetY': 55,
    'sizeFactor': 200,
    'weatherRate': 28,
  },
  441: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.1)天山绝顶索姆阿尔灵峰',
      'de': '(6.1)Sohm Al',
      'en': '(6.1)Sohm Al',
      'fr': '(6.1)Sohm Al',
      'ja': '(6.1)霊峰踏破 ソーム・アル',
      'ko': '(6.1)솜 알',
    },
    'offsetX': 185,
    'offsetY': 51,
    'sizeFactor': 200,
    'weatherRate': 0,
  },

  // 6.3 updates - content removed/reworked
  416: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)学识宝库迦巴勒幻想图书馆',
      'de': '(6.2)Große Gubal-Bibliothek',
      'en': '(6.2)The Great Gubal Library',
      'fr': '(6.2)La Grande bibliothèque de Gubal',
      'ja': '(6.2)禁書回収 グブラ幻想図書館',
      'ko': '(6.2)구브라 환상도서관',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  438: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)血战苍穹魔科学研究所',
      'de': '(6.2)Ätherochemisches For<SoftHyphen/>schungs<SoftHyphen/>labor',
      'en': '(6.2)The Aetherochemical Research Facility',
      'fr': '(6.2)Le Laboratoire de magismologie',
      'ja': '(6.2)蒼天聖戦 魔科学研究所',
      'ko': '(6.2)마과학 연구소',
    },
    'offsetX': -18,
    'offsetY': 149,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  516: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)星海空间颠倒塔',
      'de': '(6.2)Antiturm',
      'en': '(6.2)The Antitower',
      'fr': '(6.2)L\'Antitour',
      'ja': '(6.2)星海観測 逆さの塔',
      'ko': '(6.2)거꾸로 선 탑',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  555: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)天龙宫殿忆罪宫',
      'de': '(6.2)Sohr Khai',
      'en': '(6.2)Sohr Khai',
      'fr': '(6.2)Sohr Khai',
      'ja': '(6.2)天竜宮殿 ソール・カイ',
      'ko': '(6.2)소르 카이',
    },
    'offsetX': 370,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  572: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)险峻峡谷塞尔法特尔溪谷',
      'de': '(6.2)Xelphatol',
      'en': '(6.2)Xelphatol',
      'fr': '(6.2)Xelphatol',
      'ja': '(6.2)峻厳渓谷 ゼルファトル',
      'ko': '(6.2)젤파톨',
    },
    'offsetX': -148,
    'offsetY': 35,
    'sizeFactor': 200,
    'weatherRate': 40,
  },
  615: {
    'contentType': 2,
    'exVersion': 1,
    'name': {
      'cn': '(6.2)坚牢铁壁巴埃萨长城',
      'de': '(6.2)Baelsar-Wall',
      'en': '(6.2)Baelsar\'s Wall',
      'fr': '(6.2)La Muraille de Baelsar',
      'ja': '(6.2)巨大防壁 バエサルの長城',
      'ko': '(6.2)바일사르 장성',
    },
    'offsetX': 182,
    'offsetY': 32,
    'sizeFactor': 200,
    'weatherRate': 40,
  },

  // 6.4 updates - content removed/reworked
  623: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.3)试炼行路巴儿达木霸道',
      'de': '(6.3)Bardams Probe',
      'en': '(6.3)Bardam\'s Mettle',
      'fr': '(6.3)La Force de Bardam',
      'ja': '(6.3)伝統試練 バルダム覇道',
      'ko': '(6.3)바르담 패도',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  626: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.3)漂流海域妖歌海',
      'de': '(6.3)Sirenen-See',
      'en': '(6.3)The Sirensong Sea',
      'fr': '(6.3)La Mer du Chant des sirènes',
      'ja': '(6.3)漂流海域 セイレーン海',
      'ko': '(6.3)세이렌 해',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 36,
  },
  660: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.3)解放决战多玛王城',
      'de': '(6.3)Burg Doma',
      'en': '(6.3)Doma Castle',
      'fr': '(6.3)Le Château de Doma',
      'ja': '(6.3)解放決戦 ドマ城',
      'ko': '(6.3)도마 성',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  661: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.3)巨炮要塞帝国白山堡',
      'de': '(6.3)Castrum Abania',
      'en': '(6.3)Castrum Abania',
      'fr': '(6.3)Castrum Abania',
      'ja': '(6.3)巨砲要塞 カストルム・アバニア',
      'ko': '(6.3)카스트룸 아바니아',
    },
    'offsetX': 72,
    'offsetY': -186,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
  689: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '(6.3)鏖战红莲阿拉米格',
      'de': '(6.3)Ala Mhigo',
      'en': '(6.3)Ala Mhigo',
      'fr': '(6.3)Ala Mhigo',
      'ja': '(6.3)紅蓮決戦 アラミゴ',
      'ko': '(6.3)알라미고',
    },
    'offsetX': 292,
    'offsetY': -163,
    'sizeFactor': 200,
    'weatherRate': 0,
  },

  // 6.5 updates - content removed/reworked
  789: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '死亡大地终末焦土',
      'de': 'Das Kargland',
      'en': 'The Burn',
      'fr': 'L\'Escarre',
      'ja': '永久焦土 ザ・バーン',
      'ko': '영구 초토지대',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 97,
  },
  793: {
    'contentType': 2,
    'exVersion': 2,
    'name': {
      'cn': '国境防线基姆利特暗区',
      'de': 'Die Ghimlyt-Finsternis',
      'en': 'The Ghimlyt Dark',
      'fr': 'Les Ténèbres de Ghimlyt',
      'ja': '境界戦線 ギムリトダーク',
      'ko': '김리트 황야',
    },
    'offsetX': 0,
    'offsetY': 0,
    'sizeFactor': 200,
    'weatherRate': 0,
  },
};

const Overrides: OverrideContainer = {
  knownIds: _KNOWN_IDS,
  syntheticIds: _SYNTHETIC_IDS,
  knownCollisions: _KNOWN_COLLISIONS,
  syntheticContentType: _SYNTHETIC_CONTENT_TYPE,
  forceTtToCfcMap: _FORCE_TT_TO_CFC_MAP,
  syntheticZoneInfo: _SYNTHETIC_ZONE_INFO,
};

export default Overrides;
