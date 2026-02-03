import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Train cars are 20y x 30y
// Boss is 10y north of edge
const arenas = {
  '1': {
    x: 100,
    y: 100,
  },
  '2': {
    x: 100,
    y: 150,
  },
  // car 3 happens both before and after add phase
  '3': {
    x: 100,
    y: 200,
  },
  // During add phase, small train firing tank cone is 25y away from center
  // Arena is ~30y circle
  'add': {
    x: -400,
    y: -400,
  },
  '4': {
    x: 100,
    y: 250,
  },
  '5': {
    x: 100,
    y: 300,
  },
} as const;

const normalizeDelta = (a: number): number => {
  const TAU = Math.PI * 2;
  a = (a + Math.PI) % TAU;
  if (a < 0)
    a += TAU;
  return a - Math.PI;
};

export interface Data extends RaidbossData {
  hailNeedMotion: boolean;
  hailLastPos: DirectionOutputCardinal;
  hailActorId: string;
  hailMoveCount: number;
  phase: 'car1' | 'car2' | 'add' | 'car3' | 'car4' | 'car5';
  addTrainId: string;
  storedKBMech?: 'pairs' | 'spread';
  actorPositions: { [id: string]: { x: number; y: number; heading: number; time: number } };
}

const triggerSet: TriggerSet<Data> = {
  id: 'HellOnRails',
  zoneId: ZoneId.HellOnRails,
  timelineFile: 'doomtrain.txt',
  initData: () => ({
    actorPositions: {},
    addTrainId: '',
    phase: 'car1',
    hailLastPos: 'dirN',
    hailMoveCount: -1,
    hailActorId: '',
    hailNeedMotion: true,
  }),
  triggers: [
    // General triggers
    {
      id: 'Doomtrain Phase Tracker 1',
      type: 'StartsUsing',
      netRegex: { id: 'B237', capture: false },
      run: (data) => {
        if (data.phase === 'car1') {
          data.phase = 'car2';
        } else if (data.phase === 'car2') {
          data.phase = 'car3';
        } else if (data.phase === 'car3') {
          data.phase = 'car4';
        }
      },
    },
    {
      id: 'Doomtrain Phase Tracker Add Phase Start',
      type: 'StartsUsing',
      netRegex: { id: 'B246', capture: false },
      run: (data) => data.phase = 'add',
    },
    {
      id: 'Doomtrain Phase Tracker Add Phase End',
      type: 'Ability',
      netRegex: { id: 'B24C', capture: false },
      suppressSeconds: 1,
      run: (data) => data.phase = 'car4',
    },
    {
      id: 'Doomtrain Phase Tracker Car5',
      type: 'StartsUsing',
      netRegex: { id: 'B253', capture: false },
      run: (data) => data.phase = 'car5',
    },
    {
      id: 'Doomtrain ActorMove Tracker',
      type: 'ActorMove',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
          time: new Date(matches.timestamp).getTime(),
        },
    },
    {
      id: 'Doomtrain ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
          time: new Date(matches.timestamp).getTime(),
        },
    },
    {
      id: 'Doomtrain AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
          time: new Date(matches.timestamp).getTime(),
        },
    },
    {
      id: 'Doomtrain Lightning Express',
      type: 'StartsUsing',
      netRegex: { id: 'B232', capture: false },
      durationSeconds: 6.7,
      infoText: (_data, _matches, output) =>
        output.text!({
          mech: output.knockback!(),
        }),
      outputStrings: {
        text: {
          en: '${mech} + Avoid Lasers',
          de: '${mech} + vermeide Laser',
          fr: '${mech} + éviter lasers',
          cn: '${mech} + 躲避激光',
          ko: '${mech} + 레이저 피하기',
        },
        knockback: Outputs.knockback,
      },
    },
    {
      id: 'Doomtrain Windpipe',
      type: 'StartsUsing',
      netRegex: { id: 'B239', capture: false },
      durationSeconds: 6.7,
      infoText: (_data, _matches, output) =>
        output.text!({
          mech: output.drawIn!(),
          away: output.away!(),
        }),
      outputStrings: {
        text: {
          en: '${mech} => ${away}',
          de: '${mech} => ${away}',
          fr: '${mech} => ${away}',
          cn: '${mech} => ${away}',
          ko: '${mech} => ${away}',
        },
        drawIn: Outputs.drawIn,
        away: Outputs.awayFromFront,
      },
    },
    {
      id: 'Doomtrain Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: '0157', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.tankCleave(),
    },
    {
      id: 'Doomtrain Turret Side',
      type: 'StartsUsing',
      netRegex: { id: ['B23D'], capture: true },
      suppressSeconds: 1,
      infoText: (_data, matches, output) =>
        output.avoid!({
          dir: output[parseFloat(matches.x) < arenas[1].x ? 'west' : 'east']!(),
        }),
      outputStrings: {
        avoid: {
          en: 'Avoid ${dir} turrets',
          de: 'Vermeide ${dir} Geschütztürme',
          fr: 'Évitez les tourelles ${dir}',
          cn: '躲避 ${dir} 炮塔',
          ko: '${dir} 포탑 피하기',
        },
        east: Outputs.east,
        west: Outputs.west,
      },
    },
    {
      id: 'Doomtrain Add Actor Finder',
      type: 'ActorMove',
      netRegex: { moveType: '0096' },
      suppressSeconds: 9999,
      run: (data, matches) => {
        data.addTrainId = matches.id;
      },
    },
    {
      id: 'Doomtrain Add Train Direction Predictor',
      type: 'HeadMarker',
      netRegex: { id: '0282', data0: '1[0-9A-F]{7}', capture: true },
      condition: (data, matches) => data.me === data.party?.idToName_?.[matches.data0],
      durationSeconds: 7.6,
      countdownSeconds: 7.6,
      alertText: (data, matches, output) => {
        const actor = data.actorPositions[data.addTrainId];
        if (actor === undefined)
          return;

        let addCleaveDir = Math.atan2(actor.x - arenas.add.x, actor.y - arenas.add.y);

        // Rough estimates, as I don't have a 0ms difference case to use to get exact numbers
        // like I did for extreme
        const slowMoveBase = 2.022;
        const slowMoveDelta = 0.000367;

        const deltaMs = new Date(matches.timestamp).getTime() - actor.time;

        addCleaveDir -= slowMoveBase + (slowMoveDelta * deltaMs);

        if (addCleaveDir < -Math.PI) {
          addCleaveDir += Math.PI * 2;
        }

        const dirNum = Directions.hdgTo16DirNum(addCleaveDir);
        const addTrainDir = dirNum !== undefined
          ? Directions.output16Dir[dirNum] ?? 'unknown'
          : 'unknown';

        return output.text!({
          dir: output[addTrainDir]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        text: {
          en: 'Tank cleave on YOU from ${dir}',
          de: 'Tank Cleave auf DIR von ${dir}',
          fr: 'Tank cleave sur vous depuis ${dir}',
          cn: '${dir} 坦克死刑',
          ko: '광역 탱버 대상자 ${dir} 방향',
        },
      },
    },
    {
      id: 'Doomtrain Derailment Siege',
      type: 'StartsUsing',
      netRegex: { id: 'B250', capture: false },
      durationSeconds: 19.7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x3 => Next Platform',
          de: 'Turm x3 => Nächste Plattform',
          fr: 'Tour x3 => Prochain wagon',
          cn: '踩塔 x3 => 下一节车厢',
          ko: '탑 x3 => 다음 플랫폼',
        },
      },
    },
    {
      id: 'Doomtrain Headlight',
      type: 'StartsUsing',
      netRegex: { id: 'B244', capture: false },
      durationSeconds: 6.7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Down',
          de: 'Unten',
          fr: 'Bas',
          cn: '下',
          ko: '아래',
        },
      },
    },
    {
      id: 'Doomtrain Thunderous Breath',
      type: 'StartsUsing',
      netRegex: { id: 'B242', capture: false },
      durationSeconds: 6.7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Up',
          de: 'Oben',
          fr: 'Haut',
          cn: '上',
          ko: '위',
        },
      },
    },
    {
      id: 'Doomtrain Arcane Revelation',
      type: 'StartsUsing',
      netRegex: { id: 'B9A7', capture: false },
      run: (data) => {
        data.hailActorId = 'need';
        data.hailLastPos = 'dirN';
        data.hailMoveCount = 4;
      },
    },
    {
      id: 'Doomtrain Hail of Thunder First',
      type: 'Ability',
      netRegex: { id: 'B258', capture: false },
      durationSeconds: 8,
      suppressSeconds: 9999,
      countdownSeconds: 8,
      infoText: (_data, _matches, output) => output.south!(),
      outputStrings: {
        south: Outputs.south,
      },
    },
    // For Hail of Thunder ground AoE, B25[89A] determine 2/3/4 movements.
    {
      id: 'Doomtrain Hail of Thunder Move Count Collector',
      type: 'Ability',
      netRegex: { id: ['B258', 'B259', 'B25A'], capture: true },
      run: (data, matches) => {
        let moveCount = 2;
        if (matches.id === 'B259')
          moveCount = 3;
        else if (matches.id === 'B25A')
          moveCount = 4;
        data.hailMoveCount = moveCount;
      },
    },
    {
      id: 'Doomtrain Hail of Thunder Actor Finder',
      type: 'CombatantMemory',
      netRegex: {
        change: 'Add',
        id: '4[0-9A-F]{7}',
        pair: [{ key: 'BNpcID', value: '4A36' }],
        capture: true,
      },
      condition: (data) => data.hailActorId === 'need',
      run: (data, matches) => data.hailActorId = matches.id,
    },
    {
      id: 'Doomtrain Hail of Thunder Reset',
      type: 'StartsUsing',
      netRegex: { id: 'B25B', capture: false },
      delaySeconds: 1,
      run: (data) => data.hailNeedMotion = true,
    },
    {
      id: 'Doomtrain Hail of Thunder Motion Detector',
      type: 'ActorMove',
      netRegex: { capture: true },
      condition: (data, matches) => data.hailActorId === matches.id && data.hailNeedMotion,
      preRun: (data) => data.hailNeedMotion = false,
      durationSeconds: (data) => {
        if (data.hailMoveCount === 2)
          return 7.5;
        if (data.hailMoveCount === 3)
          return 10.5;
        return 13.5;
      },
      suppressSeconds: (data) => {
        if (data.hailMoveCount === 2)
          return 7.5;
        if (data.hailMoveCount === 3)
          return 10.5;
        return 13.5;
      },
      countdownSeconds: (data) => {
        if (data.hailMoveCount === 2)
          return 7.5;
        if (data.hailMoveCount === 3)
          return 10.5;
        return 13.5;
      },
      infoText: (data, _matches, output) => {
        // Easy cases first
        // data.hailMoveCount === 4, no-op
        const oldIdx = Directions.outputCardinalDir.indexOf(data.hailLastPos);

        if (data.hailMoveCount === 2) {
          data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 2) % 4] ?? 'unknown';
        } else if (data.hailMoveCount === 3) {
          // Now we determine CW or CCW
          const actor = data.actorPositions[data.hailActorId];
          if (actor === undefined) {
            console.error('No actor position for hail of thunder calc');
            return;
          }
          const arena = data.phase === 'car4' ? 4 : 5;

          const oldAngle = Math.PI - (oldIdx / 4) * (Math.PI * 2);
          const newAngle = Math.atan2(actor.x - arenas[arena].x, actor.y - arenas[arena].y);

          const delta = normalizeDelta(newAngle - oldAngle);
          if (delta > 0)
            data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 1) % 4] ?? 'unknown';
          else
            data.hailLastPos = Directions.outputCardinalDir[(oldIdx - 1 + 4) % 4] ?? 'unknown';
        }

        const idx = (Directions.outputCardinalDir.indexOf(data.hailLastPos) + 2) % 4;
        return output[Directions.outputCardinalDir[idx] ?? 'unknown']!();
      },
      outputStrings: {
        dirN: Outputs.front,
        dirE: Outputs.right,
        dirS: Outputs.back,
        dirW: Outputs.left,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Doomtrain Shockwave',
      type: 'Ability',
      netRegex: { id: 'B24E', capture: false },
      delaySeconds: 2.7,
      response: Responses.aoe(),
    },
    {
      id: 'Doomtrain Unlimited Express',
      type: 'StartsUsing',
      netRegex: { id: 'B237', capture: false },
      delaySeconds: 2.7,
      response: Responses.aoe(),
    },
    {
      id: 'Doomtrain Battering Arms',
      type: 'StartsUsing',
      netRegex: { id: 'B9A9', capture: false },
      durationSeconds: 9.1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x3',
          de: 'Turm x3',
          fr: 'Tour x3',
          cn: '踩塔 x3',
          ko: '탑 x3',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'Äthersphäre',
        'Doomtrain': 'Doomtrain',
        'Ghost Train': 'Doomtrain-Schemen',
        'Kinematic Turret': 'Eskortgeschütz',
        'Levin Signal': 'Donnerhalo',
      },
      'replaceText': {
        'Aether Surge': 'Ätherschwall',
        'Aetherial Ray': 'Ätherstrahl',
        'Arcane Revelation': 'Ätherausstoß',
        'Battering Arms': 'Schmetterarm',
        'Blastpipe': 'Nebelruß',
        'Derail(?!ment)': 'Entgleisung',
        'Derailment Siege': 'Schienenbruch',
        'Electray': 'Elektroblitz',
        'Hail of Thunder': 'Donnerhagel',
        'Head-on Emission': 'Frontalannihilation',
        'Headlight': 'Spitzensignal',
        'Lightning Burst': 'Blitzknall',
        'Lightning Express': 'InterBlitz-Express',
        'Overdraught(?<! )': 'Überstrom',
        'Plasma Beam': 'Plasmastrahl',
        'Runaway Train': 'Endlose Irrfahrt',
        'Shockwave': 'Schockwelle',
        'Thunderous Breath': 'Gewitteratem',
        'Turret Crossing': 'Kanonenkreuzung',
        'Unlimited Express': 'Unregional-Express',
        'Windpipe': 'Nebelsog',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'sphère éthérée',
        'Doomtrain': 'Glasya-Labolas',
        'Ghost Train': 'double de Glasya-Labolas',
        'Kinematic Turret': 'tourelle d\'escorte',
        'Levin Signal': 'halo électrique',
      },
      'replaceText': {
        'Aether Surge': 'Déferlante éthérée',
        'Aetherial Ray': 'Rayon éthéré',
        'Arcane Revelation': 'Déploiement arcanique',
        'Battering Arms': 'Raclée de bras',
        'Blastpipe': 'Émission de brume',
        'Derail(?!ment)': 'Déraillement',
        'Derailment Siege': 'Déraillement violent',
        'Electray': 'Rayon électrique',
        'Hail of Thunder': 'Déluge électrique',
        'Head-on Emission': 'Charge annihilante',
        'Headlight': 'Regard glacial',
        'Lightning Burst': 'Explosion électrique',
        'Lightning Express': 'Express éclair',
        'Overdraught(?<! )': 'Surcharge débordante',
        'Plasma Beam': 'Rayon plasma',
        'Runaway Train': 'Train fou',
        'Shockwave': 'Onde de choc',
        'Thunderous Breath': 'Souffle électrique',
        'Turret Crossing': 'Tourelles croisées',
        'Unlimited Express': 'Express illimité',
        'Windpipe': 'Aspirateur de brume',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'エーテルスフィア',
        'Doomtrain': 'グラシャラボラス',
        'Ghost Train': 'グラシャラボラスの分体',
        'Kinematic Turret': 'エスコートタレット',
        'Levin Signal': '雷光輪',
      },
      'replaceText': {
        'Aether Surge': 'エーテルサージ',
        'Aetherial Ray': 'エーテルレイ',
        'Arcane Revelation': '魔法陣展開',
        'Battering Arms': 'バテリングアーム',
        'Blastpipe': 'ミストエミッション',
        'Derail(?!ment)': 'ディレール',
        'Derailment Siege': 'ディレールパウンド',
        'Electray': 'エレクトロレイ',
        'Hail of Thunder': 'サンダーレイン',
        'Head-on Emission': 'ヘッドオン・エリミネーション',
        'Headlight': 'ヘッドライト',
        'Lightning Burst': 'サンダーバースト',
        'Lightning Express': 'ライトニングエクスプレス',
        'Overdraught(?<! )': 'オーバーフロウ',
        'Plasma Beam': 'プラズマレイ',
        'Runaway Train': '果てしなき暴走',
        'Shockwave': '衝撃波',
        'Thunderous Breath': 'サンダーブレス',
        'Turret Crossing': '随伴機出撃',
        'Unlimited Express': 'アンリミテッドエクスプレス',
        'Windpipe': 'ミストバキューム',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Aether': '以太晶球',
        'Doomtrain': '格莱杨拉波尔',
        'Ghost Train': '格莱杨拉波尔的分身',
        'Kinematic Turret': '护卫炮塔',
        'Levin Signal': '雷光环',
      },
      'replaceText': {
        'Aetherial Ray': '以太射线',
        'Aether Surge': '以太电涌',
        'Arcane Revelation': '魔法阵展开',
        'Battering Arms': '冲击臂锤',
        'Blastpipe': '排雾',
        'Derail(?!ment)': '脱轨',
        'Derailment Siege': '脱轨捶打',
        'Electray': '雷转质射线',
        'Hail of Thunder': '雷光雨',
        'Headlight': '前照光',
        'Lightning Burst': '雷电爆发',
        'Lightning Express': '雷光急行',
        '(?<! )Overdraught': '溢流',
        'Plasma Beam': '等离子射线',
        'Runaway Train': '无尽狂奔',
        'Shockwave': '冲击波',
        'Thunderous Breath': '雷鸣吐息',
        'Turret Crossing': '炮塔出击',
        'Unlimited Express': '无控急行',
        'Windpipe': '抽雾',
        'Head-on Emission': '前方排障',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Aether': '에테르 구체',
        'Doomtrain': '글라시아 라볼라스',
        'Ghost Train': '글라시아 라볼라스의 분신',
        'Kinematic Turret': '경호 포탑',
        'Levin Signal': '뇌광륜',
      },
      'replaceText': {
        'Aetherial Ray': '에테르 광선',
        'Aether Surge': '에테르 쇄도',
        'Arcane Revelation': '마법진 전개',
        'Battering Arms': '팔 난타',
        'Blastpipe': '안개 배출',
        'Derail(?!ment)': '탈선',
        'Derailment Siege': '탈선 난동',
        'Electray': '일렉트로레이',
        'Hail of Thunder': '번개 비',
        'Headlight': '전조등',
        'Lightning Burst': '번개 작렬',
        'Lightning Express': '번개 폭주열차',
        '(?<! )Overdraught': '에테르 범람',
        'Plasma Beam': '플라스마 광선',
        'Runaway Train': '끝없는 폭주',
        'Shockwave': '충격파',
        'Thunderous Breath': '번개 숨결',
        'Turret Crossing': '추종기 출격',
        'Unlimited Express': '무한 폭주열차',
        'Windpipe': '안개 흡입',
        'Head-on Emission': '전방 제거',
      },
    },
  ],
};

export default triggerSet;
