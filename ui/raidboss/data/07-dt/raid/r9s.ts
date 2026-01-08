import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput16, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  flailPositions: NetMatches['StartsUsingExtra'][];
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  bats: {
    inner: DirectionOutput16[];
    middle: DirectionOutput16[];
    outer: DirectionOutput16[];
  };
  satisfiedCount: number;
  hasHellAwaits: boolean;
}

const mapEffectData = {
  // Makes tiles more purple during small area mechs
  '00': {
    'location': '00',
    // Set at end of Sadistic Screech, when tiles fall
    'flags0': '00020001',
    // Set at end of smaller platform phase
    'clear1': '00080004',
  },

  // Probably a flail
  '01': {
    'location': '01',
    'flags0': '00040004',
  },
  // Unknown, set when flail spawns (02 and 07 set for near SE/NW)
  '02': {
    'location': '02',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00400020',
  },
  // Probably a flail
  '03': {
    'location': '03',
    'flags0': '00040004',
  },
  // Unknown, set when flail spawns (04 and 05 set for far NE/SW)
  '04': {
    'location': '04',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00400020',
  },
  // Unknown, set when flail spawns (04 and 05 set for far NE/SW)
  '05': {
    'location': '05',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00400020',
  },
  // Probably a flail
  '06': {
    'location': '06',
    'flags0': '00040004',
  },
  // Unknown, set when flail spawns (02 and 07 set for near SE/NW)
  '07': {
    'location': '07',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00400020',
  },
  // Probably a flail
  '08': {
    'location': '08',
    'flags0': '00040004',
  },

  // 09-0C:
  // Related to Coffinmaker
  '09': {
    'location': '09',
    'flags0': '00020001',
    'flags1': '00040004',
    'flags2': '00200010',
    'clear3': '00800040',
    'flags4': '02000100',
    'flags5': '04000010',
    'flags6': '08000040',
    'flags7': '10000100',
    'flags8': '80000004',
  },
  '0A': {
    'location': '0A',
    'flags0': '00020001',
    'flags1': '00040004',
    'flags2': '00200010',
    'clear3': '00800040',
    'flags4': '02000100',
    'flags5': '04000010',
    'flags6': '08000040',
    'flags7': '10000100',
    'flags8': '80000004',
  },
  '0B': {
    'location': '0B',
    'flags0': '00020001',
    'flags1': '00040004',
    'flags2': '00200010',
    'clear3': '00800040',
    'flags4': '02000100',
    'flags5': '04000010',
    'flags6': '08000040',
    'flags7': '10000100',
    'flags8': '80000004',
  },
  '0C': {
    'location': '0C',
    'flags0': '00020001',
    'flags1': '00040004',
    'flags2': '00200010',
    'clear3': '00800040',
    'flags4': '02000100',
    'flags5': '04000010',
    'flags6': '08000040',
    'flags7': '10000100',
    'flags8': '80000004',
  },

  // 0D/0E are set during second sadistic screech, maybe the buzzsaws?
  '0D': {
    'location': '0D',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'clear3': '00800040',
    'flags4': '01000020',
    'flags5': '02000001',
    'flags6': '04000800',
  },

  '0E': {
    'location': '0E',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'clear3': '00800040',
    'flags4': '01000020',
    'flags5': '02000001',
    'flags6': '04000800',
  },

  // Tied to arena animations
  '0F': {
    'location': '0F',
    // Set to this at start of Sadistic Screech cast
    'flags0': '00020001',
    // Set to this on kill
    'flags1': '00040004',
    // Set to this at end of Sadistic Screech cast, when floor disappears
    'clear2': '00080004',
  },

  // Aetherletting circle/wall floor visual
  '10': {
    'location': '10',
    // Show
    'flags0': '00020001',
    // End of fight clear?
    'flags1': '00040004',
    // Hide
    'clear2': '00080004',
  },

  // Fiery floor effect for Coffinmaker
  '11': {
    'location': '11',
    // First row
    'flags0': '00020001',
    // Clear at end of fight?
    'flags1': '00040004',
    // Clear after small phase
    'clear2': '00080004',
    // Second row
    'flags3': '00200010',
    // Third row
    'clear4': '00800040',
  },
} as const;
console.assert(mapEffectData);

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
    flailPositions: [],
    actorPositions: {},
    bats: { inner: [], middle: [], outer: [] },
    satisfiedCount: 0,
    hasHellAwaits: false,
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
      id: 'R9S Plummet',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B38B', capture: true },
      preRun: (data, matches) => {
        data.flailPositions.push(matches);
      },
      infoText: (data, _matches, output) => {
        const [flail1Match, flail2Match] = data.flailPositions;

        if (flail1Match === undefined || flail2Match === undefined)
          return;

        const flail1X = parseFloat(flail1Match.x);
        const flail1Y = parseFloat(flail1Match.y);
        const flail2X = parseFloat(flail2Match.x);
        const flail2Y = parseFloat(flail2Match.y);

        const flail1Dir = Directions.xyToIntercardDirOutput(flail1X, flail1Y, center.x, center.y);
        const flail2Dir = Directions.xyToIntercardDirOutput(flail2X, flail2Y, center.x, center.y);

        const flail1Dist = Math.abs(flail1Y - center.y) < 10 ? 'near' : 'far';
        const flail2Dist = Math.abs(flail1Y - center.y) < 10 ? 'near' : 'far';

        return output.text!({
          flail1Dir: output[flail1Dir]!(),
          flail2Dir: output[flail2Dir]!(),
          flail1Dist: output[flail1Dist]!(),
          flail2Dist: output[flail2Dist]!(),
        });
      },
      run: (data) => {
        if (data.flailPositions.length < 2)
          return;
        data.flailPositions = [];
      },
      outputStrings: {
        text: {
          en: 'Flails ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
          fr: 'Fléaux ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
          cn: '刺锤 ${flail1Dist}${flail1Dir}、${flail2Dist}${flail2Dir}',
          ko: '철퇴 ${flail1Dist} ${flail1Dir}/${flail2Dist} ${flail2Dir}',
        },
        near: {
          en: 'Near',
          fr: 'Proche',
          cn: '近',
          ko: '가까이',
        },
        far: {
          en: 'Far',
          fr: 'Loin',
          cn: '远',
          ko: '멀리',
        },
        ...Directions.outputStringsIntercardDir,
      },
    },
    {
      id: 'R9S Hell Awaits Gain Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '127A', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => {
        data.hasHellAwaits = true;
      },
    },
    {
      id: 'R9S Hell Awaits Lose Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: '127A', capture: true },
      condition: Conditions.targetIsYou(),
      // Can't use the actual lose line, since it's after cast for 3rd spread/stack
      delaySeconds: 13,
      run: (data) => {
        data.hasHellAwaits = false;
      },
    },
    {
      id: 'R9S Ultrasonic Spread',
      type: 'StartsUsing',
      netRegex: { id: 'B39C', source: 'Vamp Fatale', capture: false },
      infoText: (data, _matches, outputs) => {
        return outputs.text!({
          avoid: data.hasHellAwaits ? `${outputs.avoid!()} ` : '',
          mech: outputs.rolePositions!(),
        });
      },
      outputStrings: {
        rolePositions: Outputs.rolePositions,
        avoid: {
          en: 'Avoid',
        },
        text: {
          en: '${avoid}${mech}',
        },
      },
    },
    {
      id: 'R9S Ultrasonic Amp',
      type: 'StartsUsing',
      netRegex: { id: 'B39D', source: 'Vamp Fatale', capture: false },
      infoText: (data, _matches, outputs) => {
        return outputs.text!({
          avoid: data.hasHellAwaits ? `${outputs.avoid!()} ` : '',
          mech: outputs.stack!(),
        });
      },
      outputStrings: {
        stack: Outputs.getTogether,
        avoid: {
          en: 'Avoid',
        },
        text: {
          en: '${avoid}${mech}',
        },
      },
    },
    {
      id: 'R9S Undead Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'B3A0', source: 'Vamp Fatale', capture: false },
      response: Responses.getTowers('alert'),
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
