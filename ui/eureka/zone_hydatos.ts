import { EurekaZoneInfo } from './eureka';
import { bunnyLabel } from './eureka_translations';
import hydatosMap from './hydatos.png';

// https://xivapi.com/search?indexes=Fate&filters=ID>=1412,ID<=1425&columns=Description,Name,Url

export const zoneInfoHydatos: EurekaZoneInfo = {
  mapImage: hydatosMap,
  mapWidth: 1500,
  mapHeight: 800,
  shortName: 'hydatos',
  hasTracker: true,
  mapToPixelXScalar: 37.523,
  mapToPixelXConstant: -48.160,
  mapToPixelYScalar: 37.419,
  mapToPixelYConstant: -414.761,
  fairy: {
    en: 'Hydatos Elemental',
    de: 'Hydatos-Elementar',
    fr: 'Élémentaire d\'Hydatos',
    ja: 'ヒュダトス・エレメンタル',
    cn: '丰水元灵',
    ko: '히다토스 정령',
  },
  nms: {
    bunny: {
      label: bunnyLabel,
      x: 14.0,
      y: 21.5,
      fateId: 1425,
      bunny: true,
      respawnMinutes: 10.5,
    },
    khalamari: {
      label: {
        en: 'Khala',
        de: 'Kala',
        fr: 'Khala',
        ja: 'カラマリ',
        cn: '墨鱼',
        ko: '칼라마리',
      },
      trackerName: {
        en: 'Khalamari',
        de: 'Kalamari',
        fr: 'Khalamar',
        ja: 'カラマリ',
        cn: '墨鱼',
        ko: '칼라',
      },
      x: 11.1,
      y: 24.9,
      fateId: 1412,
    },
    stegodon: {
      label: {
        en: 'Stego',
        de: 'Stego',
        fr: 'Stego',
        ja: 'ステゴドン',
        cn: '象',
        ko: '스테고돈',
      },
      trackerName: {
        en: 'Stegodon',
        de: 'Stegodon',
        fr: 'Stegodon',
        ja: 'ステゴドン',
        cn: '象',
        ko: '스테',
      },
      x: 9.3,
      y: 18.2,
      fateId: 1413,
    },
    molech: {
      label: {
        en: 'Molech',
        de: 'Molek',
        fr: 'Molech',
        ja: 'モレク',
        cn: '摩洛',
        ko: '몰레크',
      },
      trackerName: {
        en: 'Molech',
        de: 'Molek',
        fr: 'Molech',
        ja: 'モレク',
        cn: '摩洛',
        ko: '몰레크',
      },
      x: 7.8,
      y: 21.9,
      fateId: 1414,
    },
    piasa: {
      label: {
        en: 'Piasa',
        de: 'Piasa',
        fr: 'Piasa',
        ja: 'ピアサ',
        cn: '皮鸟',
        ko: '피아사',
      },
      trackerName: {
        en: 'Piasa',
        de: 'Piasa',
        fr: 'Piasa',
        ja: 'ピアサ',
        cn: '皮鸟',
        ko: '피아사',
      },
      x: 7.1,
      y: 14.1,
      fateId: 1415,
    },
    frostmane: {
      label: {
        en: 'Frost',
        de: 'Frost',
        fr: 'Crinière',
        ja: 'フロストメーン',
        cn: '老虎',
        ko: '서리갈기',
      },
      trackerName: {
        en: 'Frostmane',
        de: 'Frosti',
        fr: 'Crinière',
        ja: 'フロスト',
        cn: '老虎',
        ko: '서리',
      },
      x: 8.1,
      y: 26.4,
      fateId: 1416,
    },
    daphne: {
      label: {
        en: 'Daphne',
        de: 'Daphne',
        fr: 'Daphné',
        ja: 'ダフネ',
        cn: '达佛涅',
        ko: '다프네',
      },
      trackerName: {
        en: 'Daphne',
        de: 'Daphne',
        fr: 'Daphné',
        ja: 'ダフネ',
        cn: '达佛涅',
        ko: '다프네',
      },
      x: 25.6,
      y: 16.2,
      fateId: 1417,
    },
    goldemar: {
      label: {
        en: 'King',
        de: 'König',
        fr: 'Goldemar',
        ja: 'King',
        cn: '马王',
        ko: '골데마르',
      },
      trackerName: {
        en: 'Golde',
        de: 'König Goldemar',
        fr: 'Golde',
        ja: 'キング・ゴルデマール',
        cn: '马王',
        ko: '골데마르',
      },
      x: 28.9,
      y: 23.9,
      fateId: 1418,
      time: 'Night',
    },
    leuke: {
      label: {
        en: 'Leuke',
        de: 'Leukea',
        fr: 'Leuke',
        ja: 'レウケー',
        cn: '琉刻',
        ko: '레우케',
      },
      trackerName: {
        en: 'Leuke',
        de: 'Leukea',
        fr: 'Leuke',
        ja: 'レウケ',
        cn: '琉刻',
        ko: '레우케',
      },
      x: 37.3,
      y: 27.0,
      fateId: 1419,
    },
    barong: {
      label: {
        en: 'Barong',
        de: 'Baron',
        fr: 'Barong',
        ja: 'バロン',
        cn: '巴龙',
        ko: '바롱',
      },
      trackerName: {
        en: 'Barong',
        de: 'Baron',
        fr: 'Barong',
        ja: 'バロン',
        cn: '巴龙',
        ko: '바롱',
      },
      x: 32.2,
      y: 24.2,
      fateId: 1420,
    },
    ceto: {
      label: {
        en: 'Ceto',
        de: 'Ceto',
        fr: 'Ceto',
        ja: 'ケートー',
        cn: '刻托',
        ko: '케토',
      },
      trackerName: {
        en: 'Ceto',
        de: 'Ceto',
        fr: 'Ceto',
        ja: 'ケート',
        cn: '刻托',
        ko: '케토',
      },
      x: 36.1,
      y: 13.4,
      fateId: 1421,
    },
    watcher: {
      label: {
        en: 'Watcher',
        de: 'Wächter',
        fr: 'Gardien',
        ja: 'Watcher',
        cn: '守望者',
        ko: '수정룡',
      },
      trackerName: {
        en: 'PW',
        de: 'Wächter',
        fr: 'Gardien',
        ja: 'ウォッチャ',
        cn: '守望者',
        ko: '관찰자',
      },
      x: 32.7,
      y: 19.5,
      fateId: 1423,
    },
    ovni: {
      label: {
        en: 'Ovni',
        de: 'Ovni',
        fr: 'Ovni',
        ja: 'オヴニ',
        cn: 'UFO',
        ko: '오브니',
      },
      x: 26.8,
      y: 29.0,
      fateId: 1424,
      respawnMinutes: 20,
    },
    tristitia: {
      label: {
        en: 'Tristitia',
        de: 'Tristitia',
        fr: 'Tristitia',
        ja: 'トリスティシア',
        cn: '光灵鳐',
        ko: '트리스티샤',
      },
      x: 18.7,
      y: 29.7,
      fateId: 1422,
      respawnMinutes: 20,
    },
  },
};