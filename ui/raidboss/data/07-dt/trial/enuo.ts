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
        },
        awayFromAndOut: {
          en: 'Away from ${dir} + Out',
          cn: '远离 ${dir} + 出去',
        },
        goDirections: {
          en: 'Go ${dir1}/${dir2} + Max Melee',
          cn: '前往 ${dir1}/${dir2} + 最大近战距离',
        },
        goDir: {
          en: 'Go ${dir} + Max Melee',
          cn: '前往 ${dir} + 最大近战距离',
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
        },
        awayFromFlares: {
          en: 'Away from tank flares',
          cn: '远离坦克核爆',
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
        },
      },
    },
    {
      id: 'Enuo Add Spawn',
      type: 'NameToggle',
      netRegex: { name: 'Looming Shadow', toggle: '01', capture: false },
      suppressSeconds: 9999,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Kill adds',
          cn: '击杀小怪',
        },
      },
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
        },
      },
    },
  ],
  timelineReplace: [
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
  ],
};

export default triggerSet;
