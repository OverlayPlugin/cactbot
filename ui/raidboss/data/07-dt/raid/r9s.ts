import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput16, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  bats: {
    inner: DirectionOutput16[];
    middle: DirectionOutput16[];
    outer: DirectionOutput16[];
  };
  satisfiedCount: number;
}

const headMarkerData = {
  // Vfx Path: com_share4a1
  'multiHitStack': '0131',
  // Vfx Path: tank_lockonae_0m_5s_01t
  'tankbuster': '01D4',
  // Vfx Path: lockon5_line_1p
  'aetherletting': '028C',
  // Tethers used in Hell in a Cell and Undead Deathmatch
  'tetherClose': '0161',
  'tetherFar': '0162',
} as const;

const center = {
  x: 100,
  y: 100,
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM1Savage',
  zoneId: ZoneId.AacHeavyweightM1Savage,
  timelineFile: 'r9s.txt',
  initData: () => ({
    actorPositions: {},
    bats: { inner: [], middle: [], outer: [] },
    satisfiedCount: 0,
  }),
  triggers: [
    {
      id: 'R9S ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R9S ActorMove Tracker',
      type: 'ActorMove',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R9S Killer Voice',
      type: 'StartsUsing',
      netRegex: { id: 'B384', source: 'Vamp Fatale', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R9S Satisfied Counter',
      type: 'GainsEffect',
      netRegex: { effectId: '1277', capture: true },
      run: (data, matches) => data.satisfiedCount = parseInt(matches.count),
    },
    {
      id: 'R9S Headmarker Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        if (data.satisfiedCount >= 8)
          return output.bigTankBuster!();
        return output.tankBuster!();
      },
      outputStrings: {
        tankBuster: Outputs.tankBusterOnYou,
        bigTankBuster: {
          en: 'Tank Buster on YOU (Big)',
        },
      },
    },
    {
      id: 'R9S Vamp Stomp',
      type: 'StartsUsing',
      netRegex: { id: 'B34A', source: 'Vamp Fatale', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'R9S Headmarker Party Multi Stack',
      // TODO: Add boss debuff tracker and indicate count
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['multiHitStack'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R9S Bat Tracker',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: true },
      run: (data, matches) => {
        const moveRads = {
          'inner': 1.5128,
          'middle': 1.5513,
          'outer': 1.5608,
        } as const;
        const actor = data.actorPositions[matches.id];
        if (actor === undefined)
          return;
        const dist = Math.hypot(actor.x - center.x, actor.y - center.y);
        const dLen = dist < 16 ? (dist < 8 ? 'inner' : 'middle') : 'outer';

        const angle = Math.atan2(actor.x - center.x, actor.y - center.y);
        let angleCW = angle - (Math.PI / 2);
        if (angleCW < -Math.PI)
          angleCW += Math.PI * 2;
        let angleDiff = Math.abs(angleCW - actor.heading);
        if (angleDiff > Math.PI * 1.75)
          angleDiff = Math.abs(angleDiff - (Math.PI * 2));

        const cw = angleDiff < (Math.PI / 2) ? 'cw' : 'ccw';
        const adjustRads = moveRads[dLen];
        let endAngle = angle + (adjustRads * ((cw === 'cw') ? -1 : 1));
        if (endAngle < -Math.PI)
          endAngle += Math.PI * 2;
        else if (endAngle > Math.PI)
          endAngle -= Math.PI * 2;

        data.bats[dLen].push(
          Directions.output16Dir[Directions.hdgTo16DirNum(endAngle)] ?? 'unknown',
        );
      },
    },
    {
      id: 'R9S Blast Beat Inner',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 4.1,
      durationSeconds: 5.5,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const [dir1, dir2] = data.bats.inner;

        return output.away!({
          dir1: output[dir1 ?? 'unknown']!(),
          dir2: output[dir2 ?? 'unknown']!(),
        });
      },
      run: (data, _matches) => {
        data.bats.inner = [];
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        away: {
          en: 'Away from bats ${dir1}/${dir2}',
          fr: 'Loin des chauves-souris ${dir1}/${dir2}',
          cn: '远离 ${dir1}、${dir2} 蝙蝠',
          ko: '박쥐 피하기 ${dir1}/${dir2}',
        },
      },
    },
    {
      id: 'R9S Blast Beat Middle',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 9.7,
      durationSeconds: 3.4,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const [dir1, dir2, dir3] = data.bats.middle;

        return output.away!({
          dir1: output[dir1 ?? 'unknown']!(),
          dir2: output[dir2 ?? 'unknown']!(),
          dir3: output[dir3 ?? 'unknown']!(),
        });
      },
      run: (data, _matches) => {
        data.bats.middle = [];
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        away: {
          en: 'Away from bats ${dir1}/${dir2}/${dir3}',
          fr: 'Loin des chauves-souris ${dir1}/${dir2}/${dir3}',
          cn: '远离 ${dir1}、${dir2}、${dir3} 蝙蝠',
          ko: '박쥐 피하기 ${dir1}/${dir2}/${dir3}',
        },
      },
    },
    {
      id: 'R9S Blast Beat Outer',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-Fa-f]{7}', category: '0197', param1: '11D1', capture: false },
      delaySeconds: 13.2,
      durationSeconds: 3.4,
      suppressSeconds: 1,
      response: Responses.goMiddle(),
      run: (data, _matches) => {
        data.bats.outer = [];
      },
    },
    {
      id: 'R9S Sadistic Screech',
      type: 'StartsUsing',
      netRegex: { id: 'B333', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Crowd Kill',
      type: 'StartsUsing',
      netRegex: { id: 'B33E', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Insatiable Thirst',
      type: 'StartsUsing',
      netRegex: { id: 'B344', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Finale Fatale (Small)',
      type: 'StartsUsing',
      netRegex: { id: 'B340', source: 'Vamp Fatale', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R9S Finale Fatale (Big)',
      type: 'StartsUsing',
      netRegex: { id: 'B341', source: 'Vamp Fatale', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R9S Headmarker Aetherletting',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['aetherletting'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.aetherlettingOnYou!(),
      outputStrings: {
        aetherlettingOnYou: {
          en: 'Aetherletting on YOU',
        },
      },
    },
    {
      id: 'R9S Ultrasonic Spread',
      // TODO: Debuff tracker, filter for those that were or are in cell
      // TODO: Include orientation relative to big gap?
      type: 'StartsUsing',
      netRegex: { id: 'B39C', source: 'Vamp Fatale', capture: false },
      response: Responses.rolePositions(),
    },
    {
      id: 'R9S Ultrasonic Amp',
      // TODO: Debuff tracker, filter for those that were or are in cell
      // TODO: Get direction of the big gap?
      type: 'StartsUsing',
      netRegex: { id: 'B39D', source: 'Vamp Fatale', capture: false },
      alertText: (_data, _matches, output) => output.stack!(),
      outputStrings: {
        stack: {
          en: 'Stack between big Gap',
        },
      },
    },
    {
      id: 'R9S Undead Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'B3A0', source: 'Vamp Fatale', capture: false },
      alertText: (_data, _matches, output) => output.groupTowers!(),
      outputStrings: {
        groupTowers: {
          en: 'Group Towers',
        },
      },
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
