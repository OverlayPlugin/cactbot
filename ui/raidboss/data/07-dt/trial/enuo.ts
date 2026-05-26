import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  gazeDir: 'CW' | 'CCW';
  naughtGrowsPositions: (DirectionOutput8 | 'middle')[];
  flareTargets: string[];
}

const center = {
  x: 100,
  y: 100,
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'TheUnmaking',
  zoneId: ZoneId.TheUnmaking,
  timelineFile: 'enuo.txt',
  initData: () => ({
    naughtGrowsPositions: [],
    gazeDir: 'CW',
    flareTargets: [],
  }),
  triggers: [
    {
      id: 'Enuo Meteorain',
      type: 'StartsUsing',
      netRegex: { id: 'C333', source: 'Enuo', capture: false },
      durationSeconds: 4.7,
      response: Responses.aoe(),
    },
    {
      id: 'Enuo Almagest',
      type: 'StartsUsing',
      netRegex: { id: 'C308', source: 'Enuo', capture: false },
      durationSeconds: 5,
      response: Responses.aoe(),
    },
    {
      id: 'Enuo Lightless World',
      type: 'StartsUsing',
      netRegex: { id: 'C327', source: 'Enuo', capture: false },
      durationSeconds: 8.3,
      response: Responses.bigAoe(),
    },

    {
      id: 'Enuo Naught Grows',
      type: 'StartsUsingExtra',
      netRegex: { id: ['C30D', 'C30E'], capture: true },
      preRun: (data, matches) => {
        let dir: DirectionOutput8 | 'middle';

        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        if (Math.abs(x - center.x) < 1 && Math.abs(y - center.y) < 1) {
          dir = 'middle';
        } else {
          dir = Directions.xyTo8DirOutput(x, y, center.x, center.y);
        }
        data.naughtGrowsPositions.push(dir);
      },
      delaySeconds: 0.5,
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        if (data.naughtGrowsPositions.length === 0)
          return;

        const [pos1, pos2] = data.naughtGrowsPositions;
        // Clear data here instead of in run due to variable count of entries
        data.naughtGrowsPositions = [];

        if (pos1 === undefined)
          return;

        // Four possible patterns: Single, Double with one under boss, Double at opposite sides, Double with overlap
        // Single
        if (pos2 === undefined)
          return output.awayFrom!({ dir: output[pos1]!() });

        // Double with one under boss
        if (pos1 === 'middle' || pos2 === 'middle') {
          const awayFromDir = pos1 === 'middle' ? pos2 : pos1;
          const dirOutput = output[awayFromDir]!();
          return output.awayFromAndOut!({ dir: dirOutput });
        }

        // Double and opposite
        const dir1Num = Directions.output8Dir.indexOf(pos1);
        const dir2Num = Directions.output8Dir.indexOf(pos2);

        if ((dir1Num % 4) === (dir2Num % 4)) {
          const safe1Dir = Directions.output8Dir[(dir1Num + 2) % 8];
          const safe2Dir = Directions.output8Dir[(dir2Num + 2) % 8];
          if (safe1Dir === undefined || safe2Dir === undefined)
            return;
          const dir1Output = output[safe1Dir]!();
          const dir2Output = output[safe2Dir]!();
          return output.goDirections!({ dir1: dir1Output, dir2: dir2Output });
        }

        // Double with overlap
        const safeDir8Num = ((dir1Num + 3) % 8) === dir2Num ? dir2Num + 2 : dir1Num + 2;
        // Convert to 16, add 1
        const safeDir16Num = ((safeDir8Num * 2) + 1) % 16;
        return output.goDir!({
          dir: output[Directions.output16Dir[safeDir16Num] ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        ...Directions.outputStrings16Dir,
        middle: Outputs.middle,
        awayFrom: {
          en: 'Away from ${dir}',
          cn: '远离 ${dir}',
          ko: '${dir} 멀어지기',
        },
        awayFromAndOut: {
          en: 'Away from ${dir} + Out',
          cn: '远离 ${dir} + 出去',
          ko: '${dir} 멀어지기 + 밖으로',
        },
        goDirections: {
          en: 'Go ${dir1}/${dir2} + Max Melee',
          cn: '前往 ${dir1}/${dir2} + 最大近战距离',
          ko: '${dir1}/${dir2} + 칼끝딜',
        },
        goDir: {
          en: 'Go ${dir} + Max Melee',
          cn: '前往 ${dir} + 最大近战距离',
          ko: '${dir} + 칼끝딜',
        },
      },
    },
    {
      id: 'Enuo Gaze of the Void CW',
      type: 'StartsUsing',
      netRegex: { id: 'C31F', source: 'Enuo', capture: false },
      run: (data) => data.gazeDir = 'CW',
    },
    {
      id: 'Enuo Gaze of the Void CCW',
      type: 'StartsUsing',
      netRegex: { id: 'C320', source: 'Enuo', capture: false },
      run: (data) => data.gazeDir = 'CCW',
    },
    {
      id: 'Enuo Gaze of the Void',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C321', capture: true },
      delaySeconds: 0.2,
      durationSeconds: 11.3,
      suppressSeconds: 30,
      infoText: (data, matches, output) => {
        const coneDir = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        let startDir;
        let endDir;
        if (data.gazeDir === 'CW') {
          startDir = ((coneDir + 8) - 1) % 8;
          endDir = (coneDir + 2) % 8;
        } else {
          startDir = (coneDir + 1) % 8;
          endDir = ((coneDir + 8) - 2) % 8;
        }
        return output.text!({
          rotation: output[data.gazeDir]!(),
          dir1: output[Directions.output8Dir[startDir] ?? 'unknown']!(),
          dir2: output[Directions.output8Dir[endDir] ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        CW: Outputs.clockwise,
        CCW: Outputs.counterclockwise,
        text: {
          en: '${dir1} ${rotation} => ${dir2}',
          cn: '${dir1} ${rotation} => ${dir2}',
          ko: '${dir1} ${rotation} => ${dir2}',
        },
      },
    },
    {
      id: 'Enuo Deep Freeze',
      type: 'StartsUsing',
      netRegex: { id: 'C32E', source: 'Enuo', capture: true },
      preRun: (data, matches) => {
        data.flareTargets.push(matches.target);
      },
      delaySeconds: 0.1,
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        if (data.flareTargets.length < 2)
          return;
        if (data.flareTargets.includes(data.me))
          return output.tankFlareOnYou!();
        return output.awayFromFlares!();
      },
      run: (data) => {
        data.flareTargets = [];
      },
      outputStrings: {
        tankFlareOnYou: {
          en: 'Tank Flare on YOU',
          cn: '坦克核爆点名',
          ko: '탱커 플레어 대상자',
        },
        awayFromFlares: {
          en: 'Away from tank flares',
          cn: '远离坦克核爆',
          ko: '탱커 플레어에서 멀어지기',
        },
      },
    },
    {
      id: 'Enuo Shrouded Holy',
      type: 'StartsUsing',
      netRegex: { id: 'C32F', source: 'Enuo', capture: true },
      durationSeconds: 5,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Enuo Dimension Zero Headmarker',
      type: 'HeadMarker',
      netRegex: { id: '02CF', data0: '1[0-9A-F]{7}', capture: true },
      durationSeconds: 7.7,
      infoText: (data, matches, output) => {
        const member = data.party.nameFromId(matches.data0);

        return output.stackMarkerOn!({ player: data.party.member(member) });
      },
      outputStrings: {
        stackMarkerOn: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'Enuo Naught Hunts Tether',
      type: 'Tether',
      netRegex: { id: '0194', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 13.8,
      countdownSeconds: 13.8,
      infoText: (_data, _matches, output) => output.chasingPuddle!(),
      outputStrings: {
        chasingPuddle: {
          en: 'Chasing puddle on you',
          cn: '追踪地火点名',
          ko: '추적 장판 대상자',
        },
      },
    },
    {
      id: 'Enuo Naught Hunts Another Tether',
      type: 'Tether',
      netRegex: { id: '0195', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 13.3,
      countdownSeconds: 13.3,
      infoText: (_data, _matches, output) => output.chasingPuddle!(),
      outputStrings: {
        chasingPuddle: {
          en: 'Chasing puddle on you',
          cn: '追踪地火点名',
          ko: '추적 장판 대상자',
        },
      },
    },
    {
      id: 'Enuo Meltdown',
      type: 'StartsUsing',
      netRegex: { id: 'C32A', source: 'Enuo', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait puddles => spread',
          cn: '诱导黄圈 => 分散',
          ko: '장판 유도 => 산개',
        },
      },
    },
    {
      id: 'Enuo Silent Torrent',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C317', capture: false },
      alertText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid Line Ends',
          de: 'Weiche den Enden der Linien aus',
          fr: 'Évitez les fins de lignes',
          ja: '線の端から離れる',
          cn: '远离线末端',
          ko: '선의 끝부분 피하기',
          tc: '遠離線末端',
        },
      },
    },
    {
      id: 'Enuo Looming Emptiness',
      type: 'StartsUsing',
      netRegex: { id: 'C33D', source: 'Looming Shadow', capture: false },
      infoText: (_data, _matches, output) => output.away!(),
      outputStrings: {
        away: {
          en: 'Away from proximity marker',
          cn: '远离距离衰减标记',
          ko: '거리감쇠 징에서 멀어지기',
        },
      },
    },
    {
      id: 'Enuo Add Spawn',
      type: 'NameToggle',
      netRegex: { name: 'Looming Shadow', toggle: '01', capture: false },
      suppressSeconds: 9999,
      response: Responses.killAdds(),
    },
    {
      id: 'Enuo Beacon Spawn',
      type: 'MapEffect',
      netRegex: { flags: '00020001', location: '03', capture: false },
      suppressSeconds: 9999,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kill light beacon',
          cn: '击杀光之征兆',
          ko: '빛의 징조 부수기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {
        'Enuo': 'Enuo',
        'Looming Shadow': 'groß(?:e|er|es|en) Nichts-Silhouette',
        'Uncast Shadow': 'Nichts-Silhouette',
        '(?<! )Void': 'Nichtswirbel',
        'Yawning Void': 'groß(?:e|er|es|en) Nichtswirbel',
      },
      'replaceText': {
        'All for Naught': 'Nichts-Territorium',
        'Almagest': 'Almagest',
        'Deep Freeze': 'Tiefenfrost',
        'Dimension Zero': 'Dimension Null',
        'Empty Shadow': 'Last der Leere',
        'Endless Chase': 'Suchende Welle',
        'Gaze of the Void': 'Chaotischer Strom',
        'Lightless World': 'Lichtlose Welt',
        'Looming Emptiness': 'Schwere Last der Leere',
        'Meltdown': 'Komplettschmelze',
        'Meteorain': 'Meteorregen',
        'Naught Grows': 'Anschwellen des Nichts',
        'Naught Hunts(?! )': 'Verfolgung des Nichts',
        'Naught Hunts Another': 'Erneute Verfolgung des Nichts',
        'Naught Wakes': 'Auftreten des Nichts',
        'Nothingness': 'Welle der Leere',
        'Shrouded Holy': 'Schattenheiligtum',
        'Silent Torrent': 'Reißender Strom',
        'Vacuum': 'Nichtswirbel',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Enuo': 'Énuo',
        'Looming Shadow': 'grande ombre insondable',
        'Uncast Shadow': 'ombre insondable',
        '(?<! )Void': 'vortex de néant',
        'Yawning Void': 'grand vortex de néant',
      },
      'replaceText': {
        'All for Naught': 'Domaine du néant',
        'Almagest': 'Almageste',
        'Deep Freeze': 'Congélation ancestrale',
        'Dimension Zero': 'Dimension zéro',
        'Empty Shadow': 'Impact de vacuité',
        'Endless Chase': 'Néant traqueur',
        'Gaze of the Void': 'Torrents chaotiques',
        'Lightless World': 'Monde sans Lumière',
        'Looming Emptiness': 'Grand impact de vacuité',
        'Meltdown': 'Fusion ancestrale',
        'Meteorain': 'Pluie de météorites',
        'Naught Grows': 'Abcès du néant',
        'Naught Hunts(?! )': 'Poursuite du néant',
        'Naught Hunts Another': 'Poursuite renouvelée du néant',
        'Naught Wakes': 'Vitalisation du néant',
        'Nothingness': 'Rayon du néant',
        'Shrouded Holy': 'Miracle d\'ombre',
        'Silent Torrent': 'Flot d\'énergie',
        'Vacuum': 'Vortex du néant',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Enuo': 'エヌオー',
        'Looming Shadow': '虚ろなる巨影',
        'Uncast Shadow': '虚ろなる影',
        '(?<! )Void': '無の渦',
        'Yawning Void': '無の大渦',
      },
      'replaceText': {
        'All for Naught': '無の領域',
        'Almagest': 'アルマゲスト',
        'Deep Freeze': 'ディープフリーズ',
        'Dimension Zero': 'ディメンションゼロ',
        'Empty Shadow': '虚ろなる衝撃',
        'Endless Chase': '追尾波動',
        'Gaze of the Void': '混沌の激流',
        'Lightless World': 'ライトレス・ワールド',
        'Looming Emptiness': '虚ろなる大衝撃',
        'Meltdown': 'メルトダウン',
        'Meteorain': 'メテオレイン',
        'Naught Grows': '無の肥大',
        'Naught Hunts(?! )': '無の追跡',
        'Naught Hunts Another': '無の再追跡',
        'Naught Wakes': '無の活性',
        'Nothingness': '無の波動',
        'Shrouded Holy': 'シャドウホーリー',
        'Silent Torrent': '奔流',
        'Vacuum': '無の渦',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Enuo': '恩欧',
        'Looming Shadow': '虚无巨影',
        'Uncast Shadow': '虚无之影',
        '(?<! )Void': '无之漩涡',
        'Yawning Void': '无之巨漩涡',
      },
      'replaceText': {
        '--beacon targetable--': '--光之征兆可选中--',
        '\\(active\\)': '(激活)',
        '\\(big\\)': '(大)',
        '\\(castbar\\)': '(咏唱栏)',
        '\\(lines\\)': '(直线)',
        '\\(puddles\\)': '(黄圈)',
        '\\(puddle baits\\)': '(诱导黄圈)',
        '\\(spreads\\)': '(分散)',
        '\\(Tether\\)': '(连线)',
        'All for Naught': '无之领域',
        'Almagest': '至高无上',
        'Deep Freeze': '深度冻结',
        'Dimension Zero': '零次元',
        'Empty Shadow': '虚无冲击',
        'Endless Chase': '追尾波动',
        'Gaze of the Void': '混沌激流',
        'Lightless World': '无光的世界',
        'Looming Emptiness': '虚无大冲击',
        'Meltdown': '核心熔毁',
        'Meteorain': '流星雨',
        'Naught Grows': '无之膨胀',
        'Naught Hunts(?! )': '无之追踪',
        'Naught Hunts Another': '无之再追踪',
        'Naught Wakes': '无之活性',
        'Nothingness': '无之波动',
        'Shrouded Holy': '暗影神圣',
        'Silent Torrent': '奔流',
        'Vacuum': '无之漩涡',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Enuo': '에누오',
        'Looming Shadow': '공허한 큰 그림자',
        'Uncast Shadow': '공허한 그림자',
        '(?<! )Void': '무의 소용돌이',
        'Yawning Void': '무의 큰 소용돌이',
      },
      'replaceText': {
        '--beacon targetable--': '--징조 타겟가능--',
        '\\(Tether\\)': '(선)',
        '\\(AoE\\)': '(장판)',
        '\\(active\\)': '(활성)',
        '\\(puddle baits\\)': '(장판 유도)',
        '\\(puddles\\)': '(장판)',
        '\\(spreads\\)': '(산개)',
        '\\(lines\\)': '(선)',
        '\\(castbar\\)': '(시전바)',
        '\\(big\\)': '(강력)',
        'All for Naught': '무의 영역',
        'Almagest': '알마게스트',
        'Deep Freeze': '극한 동결',
        'Dimension Zero': '0차원',
        'Empty Shadow': '공허한 충격',
        'Endless Chase': '추적 파동',
        'Gaze of the Void': '혼돈의 격류',
        'Lightless World': '빛이 없는 세계',
        'Looming Emptiness': '공허한 대충격',
        'Meltdown': '용융',
        'Meteorain': '메테오 레인',
        'Naught Grows': '무의 비대',
        'Naught Hunts(?! )': '무의 추적',
        'Naught Hunts Another': '무의 재추적',
        'Naught Wakes': '무의 활성',
        'Nothingness': '무의 파동',
        'Shrouded Holy': '섀도우 홀리',
        'Silent Torrent': '급류',
        'Vacuum': '무의 소용돌이',
      },
    },
  ],
};

export default triggerSet;
