import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  seenIntermission?: boolean;
  bombs?: { north: boolean; east: boolean }[];
  stacks?: string[];
  tethers?: string[];
}

// EDEN'S PROMISE: ETERNITY
// E12 NORMAL

// TODO: Handle the EarthShaker bait --> beam intercept mechanic during the intermission.
// TODO: Math the spawn position of the Titanic Bomb Boulders to call the safe direction like E4s.

// Each tether ID corresponds to a primal:
// 008E -- Leviathan
// 008F -- Ifrit
// 0090 -- Ramuh
// 0091 -- Garuda
// We can collect + store these for later use on Stock/Release.

const tetherIds = ['008E', '008F', '0090', '0091'];

// Keys here indicate SAFE directions!
const bombOutputStrings = {
  'north': {
    en: 'Between north bombs',
    de: 'Zwichen den Bomben im Norden',
    fr: 'Entre les bombes au Nord',
    ja: '北の岩へ',
    cn: '去正上岩石中间',
    ko: '북쪽 폭탄 사이',
  },
  'south': {
    en: 'Between south bombs',
    de: 'Zwichen den Bomben im Süden',
    fr: 'Entre les bombes au Sud',
    ja: '南の岩へ',
    cn: '去正下岩石中间',
    ko: '남쪽 폭탄 사이',
  },
  'east': {
    en: 'Between east bombs',
    de: 'Zwichen den Bomben im Osten',
    fr: 'Entre les bombes à l\'Est',
    ja: '東の岩へ',
    cn: '去右边岩石中间',
    ko: '동쪽 폭탄 사이',
  },
  'west': {
    en: 'Between west bombs',
    de: 'Zwichen den Bomben im Westen',
    fr: 'Entre les bombes à l\'Ouest',
    ja: '西の岩へ',
    cn: '去左边岩石中间',
    ko: '서쪽 폭탄 사이',
  },
};

const primalOutputStrings = {
  'combined': {
    en: '${safespot1} + ${safespot2}',
    de: '${safespot1} + ${safespot2}',
    fr: '${safespot1} + ${safespot2}',
    ja: '${safespot1} + ${safespot2}',
    cn: '${safespot1} + ${safespot2}',
    ko: '${safespot1} + ${safespot2}',
  },
  '008E': Outputs.middle,
  '008F': Outputs.sides,
  '0090': Outputs.out,
  '0091': {
    en: 'Intercards',
    de: 'Interkardinale Himmelsrichtungen',
    fr: 'Intercardinal',
    ja: '斜め',
    cn: '四角',
    ko: '대각',
  },
  '008E008F': {
    en: 'Under + Sides',
    de: 'Unter Ihm + Seiten',
    fr: 'En dessous + Côtés',
    ja: '真ん中 + 横へ',
    cn: '正中间两侧',
    ko: '보스 아래 + 양옆',
  },
  '008E0090': {
    en: 'North/South + Out',
    de: 'Norden/Süden + Raus',
    fr: 'Nord/Sud + Extérieur',
    ja: '北/南 + 外へ',
    cn: '上/下远离',
    ko: '북/남 + 바깥',
  },
  '008E0091': {
    en: 'Under + Intercards',
    de: 'Unter Ihm + Interkardinale Himmelsrichtungen',
    fr: 'En dessous + Intercardinal',
    ja: '真ん中 + 斜め',
    cn: '正中间四角',
    ko: '보스 아래 + 대각',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'EdensPromiseEternity',
  zoneId: ZoneId.EdensPromiseEternity,
  timelineFile: 'e12n.txt',
  triggers: [
    {
      id: 'E12N Intermission Completion',
      type: 'Ability',
      netRegex: { id: '4B48', source: 'Eden\'s Promise', capture: false },
      run: (data) => data.seenIntermission = true,
    },
    {
      id: 'E12N Maleficium',
      type: 'StartsUsing',
      netRegex: { id: '5872', source: 'Eden\'s Promise', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'E12N Formless Judgment',
      type: 'StartsUsing',
      netRegex: { id: '5873', source: 'Eden\'s Promise' },
      response: Responses.tankCleave(),
    },
    {
      // Titanic Bombs spawn at two of four points:
      // SW X: -11.31371 Y: -63.68629
      // NW X: -11.31371 Y: -86.3137
      // SE X: 11.31371 Y: -63.68629
      // NE X: 11.31371 Y: -86.3137
      id: 'E12N Bomb Collect',
      type: 'AddedCombatant',
      netRegex: { npcNameId: '9816' },
      run: (data, matches) => {
        const bomb = {
          north: parseFloat(matches.y) + 70 < 0,
          east: parseFloat(matches.x) > 0,
        };
        data.bombs ??= [];
        data.bombs.push(bomb);
      },
    },
    {
      id: 'E12N Boulders Impact',
      type: 'Ability',
      netRegex: { id: '586E', source: 'Titanic Bomb Boulder', capture: false },
      suppressSeconds: 5,
      infoText: (data, _matches, output) => {
        // Whichever direction has two  Titanic Bombs, the safe spot is opposite.
        const [firstBomb, secondBomb] = data.bombs ?? [];
        if (!firstBomb || !secondBomb)
          return;

        let safe;
        if (firstBomb.north === secondBomb.north)
          safe = firstBomb.north ? 'south' : 'north';
        else
          safe = firstBomb.east ? 'west' : 'east';
        return output[safe]!();
      },
      run: (data) => delete data.bombs,
      outputStrings: bombOutputStrings,
    },
    {
      id: 'E12N Boulders Explosion',
      type: 'Ability',
      netRegex: { id: '586F', source: 'Titanic Bomb Boulder', capture: false },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Move to last explosions',
          de: 'Zur letzten Explosion bewegen',
          fr: 'Allez sur la dernière explosion',
          ja: 'ついさっき爆発した岩へ',
          cn: '去刚才爆炸的区域',
          ko: '마지막 폭발 위치로',
        },
      },
    },
    {
      id: 'E12N Rapturous Reach Double',
      type: 'HeadMarker',
      netRegex: { id: '003E' },
      condition: (data) => !data.seenIntermission,
      preRun: (data, matches) => {
        data.stacks ??= [];
        data.stacks.push(matches.target);
      },
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.stackOnYou!();
      },
      infoText: (data, _matches, output) => {
        if (!data.stacks || data.stacks.length === 1)
          return;
        const names = data.stacks.map((x) => data.party.member(x)).sort();
        return output.stacks!({ players: names });
      },
      outputStrings: {
        stacks: {
          en: 'Stack (${players})',
          de: 'Sammeln (${players})',
          fr: 'Package sur (${players})',
          ja: '頭割り (${players})',
          cn: '分摊 (${players})',
          ko: '모이기 (${players})',
        },
        stackOnYou: Outputs.stackOnYou,
      },
    },
    {
      id: 'E12N Rapturous Reach Cleanup',
      type: 'HeadMarker',
      netRegex: { id: '003E', capture: false },
      delaySeconds: 10,
      run: (data) => delete data.stacks,
    },
    {
      id: 'E12N Rapturous Reach Single',
      type: 'HeadMarker',
      netRegex: { id: '003E' },
      condition: (data) => data.seenIntermission,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'E12N Diamond Dust Mitigate',
      type: 'StartsUsing',
      netRegex: { id: '5864', source: 'Eden\'s Promise', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'E12N Diamond Dust Stop',
      type: 'StartsUsing',
      netRegex: { id: '5864', source: 'Eden\'s Promise', capture: false },
      delaySeconds: 1, // Avoiding collision with the spread call
      response: Responses.stopMoving('alert'),
    },
    {
      id: 'E12N Frigid Stone',
      type: 'HeadMarker',
      netRegex: { id: '0060' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'E12N Tether Collect',
      type: 'Tether',
      netRegex: { id: tetherIds },
      run: (data, matches) => {
        data.tethers ??= [];
        data.tethers.push(matches.id);
      },
    },
    {
      id: 'E12N Cast Release',
      type: 'StartsUsing',
      netRegex: { id: ['4E2C', '585B', '5861'], capture: false },
      preRun: (data) => data.tethers = data.tethers?.sort(),
      delaySeconds: 0.5, // Tethers should be first in the log, but let's be SURE
      alertText: (data, _matches, output) => {
        const [firstTether, secondTether] = data.tethers ?? [];
        if (firstTether === undefined || secondTether === undefined)
          return;
        // Leviathan's mechanics aren't easily described in a single word,
        // so we special-case them.

        const comboStr = firstTether + secondTether;
        if (comboStr in primalOutputStrings)
          return output[comboStr]!();
        return output.combined!({
          safespot1: output[firstTether]!(),
          safespot2: output[secondTether]!(),
        });
      },
      infoText: (data, _matches, output) => {
        const onlyTether = data.tethers?.[0];
        if (onlyTether === undefined || data.tethers?.length === 2)
          return;
        return output[onlyTether]!();
      },
      outputStrings: primalOutputStrings,
    },
    {
      id: 'E12N Tether Cleanup',
      type: 'StartsUsing',
      netRegex: { id: ['4E2C', '585B', '5861'], capture: false },
      delaySeconds: 5,
      run: (data) => delete data.tethers,
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        '(?<!Titanic )Bomb Boulder': 'Bomber-Brocken',
        'Chiseled Sculpture': 'Abbild eines Mannes',
        'Eden\'s Promise': 'Edens Verheißung',
        'Titanic Bomb Boulder': 'Mega-Bomber-Brocken',
      },
      'replaceText': {
        'Cast': 'Auswerfen',
        'Classical Sculpture': 'Klassische Skulptur',
        'Conflag Strike': 'Feuersbrunst',
        'Diamond Dust': 'Diamantenstaub',
        'Earth Shaker': 'Erdstoß',
        'Earthen Fury': 'Gaias Zorn',
        'Eternal Oblivion': 'Ewiges Vergessen',
        'Explosion': 'Explosion',
        'Ferostorm': 'Angststurm',
        'Formless Judgment': 'Formloses Urteil',
        'Frigid Stone': 'Eisstein',
        'Ice Floe': 'Eisfluss',
        'Impact': 'Impakt',
        'Initialize Recall': 'Rückholung initialisieren',
        'Judgment Jolt': 'Blitz des Urteils',
        'Junction Shiva': 'Verbindung: Shiva',
        'Junction Titan': 'Verbindung: Titan',
        'Laser Eye': 'Laserauge',
        'Maleficium': 'Maleficium',
        'Obliteration': 'Auslöschung',
        'Palm Of Temperance': 'Hand der Mäßigung',
        'Paradise Lost': 'Verlorenes Paradies',
        'Rapturous Reach': 'Stürmischer Griff',
        'Release': 'Freilassen',
        'Stock': 'Sammeln',
        'Temporary Current': 'Unstete Gezeiten',
        'Under The Weight': 'Wucht der Erde',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        '(?<!Titanic )Bomb Boulder': 'bombo rocher',
        'Chiseled Sculpture': 'création masculine',
        'Eden\'s Promise': 'Promesse d\'Éden',
        'Titanic Bomb Boulder': 'méga bombo rocher',
      },
      'replaceText': {
        '\\?': ' ?',
        'Cast': 'Lancer',
        'Classical Sculpture': 'Serviteur colossal',
        'Conflag Strike': 'Ekpurosis',
        'Diamond Dust': 'Poussière de diamant',
        'Earth Shaker': 'Secousse',
        'Earthen Fury': 'Fureur tellurique',
        'Eternal Oblivion': 'Oubli éternel',
        'Explosion': 'Explosion',
        'Ferostorm': 'Tempête déchaînée',
        'Formless Judgment': 'Onde du châtiment',
        'Frigid Stone': 'Rocher de glace',
        'Ice Floe': 'Flux glacé',
        'Impact': 'Impact',
        'Initialize Recall': 'Remembrances',
        'Judgment Jolt': 'Front orageux du jugement',
        'Junction Shiva': 'Associer : Shiva',
        'Junction Titan': 'Associer : Titan',
        'Laser Eye': 'Faisceau maser',
        'Maleficium': 'Maleficium',
        'Obliteration': 'Oblitération',
        'Palm Of Temperance': 'Paume de tempérance',
        'Paradise Lost': 'Paradis perdu',
        'Rapturous Reach': 'Main voluptueuse',
        'Release': 'Relâcher',
        'Stock': 'Stocker',
        'Temporary Current': 'Courant évanescent',
        'Under The Weight': 'Pression tellurique',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        '(?<!Titanic )Bomb Boulder': 'ボムボルダー',
        'Chiseled Sculpture': '創られた男',
        'Eden\'s Promise': 'プロミス・オブ・エデン',
        'Titanic Bomb Boulder': 'メガ・ボムボルダー',
      },
      'replaceText': {
        'Cast': 'はなつ',
        'Classical Sculpture': '巨兵創出',
        'Conflag Strike': 'コンフラグレーションストライク',
        'Diamond Dust': 'ダイアモンドダスト',
        'Earth Shaker': 'アースシェイカー',
        'Earthen Fury': '大地の怒り',
        'Eternal Oblivion': '永遠の忘却',
        'Explosion': '爆発',
        'Ferostorm': 'フィアスストーム',
        'Formless Judgment': '天罰の波動',
        'Frigid Stone': 'アイスストーン',
        'Ice Floe': 'アイスフロー',
        'Impact': 'インパクト',
        'Initialize Recall': '記憶想起',
        'Judgment Jolt': '裁きの界雷',
        'Junction Shiva': 'ジャンクション：シヴァ',
        'Junction Titan': 'ジャンクション：タイタン',
        'Laser Eye': 'メーザーアイ',
        'Maleficium': 'マレフィキウム',
        'Obliteration': 'オブリタレーション',
        'Palm Of Temperance': '拒絶の手',
        'Paradise Lost': 'パラダイスロスト',
        'Rapturous Reach': '悦楽の手',
        'Release': 'リリース',
        'Stock': 'ストック',
        'Temporary Current': 'テンポラリーカレント',
        'Under The Weight': '大地の重圧',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        '(?<!Titanic )Bomb Boulder': '爆破岩石',
        'Chiseled Sculpture': '被创造的男性',
        'Eden\'s Promise': '伊甸之约',
        'Titanic Bomb Boulder': '巨型爆破岩石',
      },
      'replaceText': {
        'Cast': '释放',
        'Classical Sculpture': '创造巨兵',
        'Conflag Strike': '瞬燃强袭',
        'Diamond Dust': '钻石星尘',
        'Earth Shaker': '大地摇动',
        'Earthen Fury': '大地之怒',
        'Eternal Oblivion': '永恒忘却',
        'Explosion': '爆炸',
        'Ferostorm': '凶猛风暴',
        'Formless Judgment': '天罚波动',
        'Frigid Stone': '冰石',
        'Ice Floe': '浮冰',
        'Impact': '冲击',
        'Initialize Recall': '回想记忆',
        'Judgment Jolt': '制裁之界雷',
        'Junction Shiva': '融合：希瓦',
        'Junction Titan': '融合：泰坦',
        'Laser Eye': '激射眼',
        'Maleficium': '邪法',
        'Obliteration': '灭迹',
        'Palm Of Temperance': '拒绝之手',
        'Paradise Lost': '失乐园',
        'Rapturous Reach': '愉悦之手',
        'Release': '施放',
        'Stock': '储存',
        'Temporary Current': '临时洋流',
        'Under The Weight': '大地的重压',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        '(?<!Titanic )Bomb Boulder': '바위폭탄',
        'Chiseled Sculpture': '창조된 남자',
        'Eden\'s Promise': '에덴의 약속',
        'Titanic Bomb Boulder': '거대 바위폭탄',
      },
      'replaceText': {
        'Cast': '발현',
        'Classical Sculpture': '거병 창조',
        'Conflag Strike': '대화재',
        'Diamond Dust': '다이아몬드 더스트',
        'Earth Shaker': '요동치는 대지',
        'Earthen Fury': '대지의 분노',
        'Eternal Oblivion': '영원한 망각',
        'Explosion': '폭산',
        'Ferostorm': '사나운 폭풍',
        'Formless Judgment': '천벌 파동',
        'Frigid Stone': '얼음돌',
        'Ice Floe': '유빙',
        'Impact': '충격',
        'Initialize Recall': '기억 상기',
        'Judgment Jolt': '심판의 계뢰',
        'Junction Shiva': '접속: 시바',
        'Junction Titan': '접속: 타이탄',
        'Laser Eye': '광선안',
        'Maleficium': '마녀의 사술',
        'Obliteration': '말소',
        'Palm Of Temperance': '거절의 손',
        'Paradise Lost': '실낙원',
        'Rapturous Reach': '열락의 손',
        'Release': '기억 방출',
        'Stock': '기억 보존',
        'Temporary Current': '순간 해류',
        'Under The Weight': '대지의 중압',
      },
    },
  ],
};

export default triggerSet;
