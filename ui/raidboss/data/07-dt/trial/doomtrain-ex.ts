import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput16,
  DirectionOutputCardinal,
  Directions,
} from '../../../../../resources/util';
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
  // During add phase, small train firing tank cones is 25y away from center
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
  '6': {
    x: 100,
    y: 350,
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
  psychokinesisCount: number;
  hailLastPos: DirectionOutputCardinal;
  hailActorId: string;
  hailMoveCount: number;
  phase: 'car1' | 'car2' | 'add' | 'car3' | 'car4' | 'car5' | 'car6';
  addTrainSpeed: 'slow' | 'fast';
  addCleaveOnMe: boolean;
  addTrainId: string;
  addTrainDir: DirectionOutput16;
  storedKBMech?: 'pairs' | 'spread';
  turretDir: 'east' | 'west';
  car2MechCount: number;
  car6MechCount: number;
  actorPositions: { [id: string]: { x: number; y: number; heading: number; time: number } };
}

const triggerSet: TriggerSet<Data> = {
  id: 'HellOnRailsExtreme',
  zoneId: ZoneId.HellOnRailsExtreme,
  timelineFile: 'doomtrain-ex.txt',
  initData: () => ({
    actorPositions: {},
    addTrainId: '',
    addCleaveOnMe: false,
    addCleaveDir: -1,
    addTrainSpeed: 'slow',
    phase: 'car1',
    turretDir: 'east',
    car2MechCount: 0,
    car6MechCount: 0,
    hailLastPos: 'dirN',
    hailMoveCount: -1,
    hailActorId: '',
    psychokinesisCount: 0,
    addTrainDir: 'unknown',
    hailNeedMotion: true,
  }),
  timelineTriggers: [
    {
      id: 'DoomtrainEx Third Rail Bait',
      regex: /Third Rail \(bait\)/,
      beforeSeconds: 2,
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait Puddles',
          de: 'Flächen ködern',
          cn: '诱导雷圈',
        },
      },
    },
  ],
  triggers: [
    // General triggers
    {
      id: 'DoomtrainEx Phase Tracker 1',
      type: 'StartsUsing',
      netRegex: { id: 'B237', capture: false },
      run: (data) => {
        if (data.phase === 'car1') {
          data.phase = 'car2';
        } else if (data.phase === 'car2') {
          data.phase = 'car3';
        }
      },
    },
    {
      id: 'DoomtrainEx Phase Tracker Add Phase Start',
      type: 'StartsUsing',
      netRegex: { id: 'B246', capture: false },
      run: (data) => data.phase = 'add',
    },
    {
      id: 'DoomtrainEx Phase Tracker Add Phase End',
      type: 'Ability',
      netRegex: { id: 'B24C', capture: false },
      suppressSeconds: 1,
      run: (data) => data.phase = 'car3',
    },
    {
      id: 'DoomtrainEx Phase Tracker Car4+',
      type: 'StartsUsing',
      netRegex: { id: 'B28F', capture: false },
      run: (data) => {
        if (data.phase === 'car3')
          data.phase = 'car4';
        else if (data.phase === 'car4')
          data.phase = 'car5';
        else
          data.phase = 'car6';
      },
    },
    {
      id: 'DoomtrainEx ActorMove Tracker',
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
      id: 'DoomtrainEx ActorSetPos Tracker',
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
      id: 'DoomtrainEx AddedCombatant Tracker',
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
      id: 'DoomtrainEx Dead Man\'s Overdraught',
      type: 'StartsUsing',
      netRegex: { id: ['B25F', 'B260'], capture: true },
      preRun: (data, matches) => {
        data.storedKBMech = matches.id === 'B260' ? 'pairs' : 'spread';
      },
      infoText: (data, _matches, output) =>
        output.text!({ mech: output[data.storedKBMech ?? 'unknown']!() }),
      outputStrings: {
        text: {
          en: 'Stored ${mech}',
          de: 'Gespeichert ${mech}',
          cn: '已储存 ${mech}',
        },
        pairs: Outputs.stackPartner,
        spread: Outputs.spread,
      },
    },
    {
      id: 'DoomtrainEx Third Rail Bait Move',
      type: 'Ability',
      netRegex: { id: 'B261', capture: false },
      response: Responses.moveAway('alert'),
    },
    // Car 1
    {
      id: 'DoomtrainEx Dead Man\'s Express/Windpipe Car1',
      type: 'StartsUsing',
      netRegex: { id: ['B266', 'B280'], capture: true },
      condition: (data) => data.phase === 'car1',
      durationSeconds: 11.1,
      infoText: (data, matches, output) =>
        output.text!({
          mech1: output[matches.id === 'B266' ? 'knockback' : 'drawIn']!(),
          mech2: output[data.storedKBMech ?? 'unknown']!(),
        }),
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
        },
        unknown: Outputs.unknown,
        knockback: Outputs.knockback,
        drawIn: Outputs.drawIn,
        pairs: Outputs.stackPartner,
        spread: Outputs.spread,
      },
    },
    // Car 2
    {
      id: 'DoomtrainEx Turret Side',
      type: 'StartsUsing',
      netRegex: { id: ['B271', 'B272', 'B273', 'B276'], capture: true },
      suppressSeconds: 1,
      run: (data, matches) =>
        data.turretDir = parseFloat(matches.x) < arenas[2].x ? 'west' : 'east',
    },
    {
      id: 'DoomtrainEx Car2 Tankbuster',
      type: 'StartsUsing',
      netRegex: { id: ['B271', 'B272', 'B273', 'B276'], capture: false },
      condition: (data) => data.phase === 'car2' && data.car2MechCount === 1,
      durationSeconds: 9.2,
      infoText: (data, _matches, output) => output.text!({ turretDir: output[data.turretDir]!() }),
      run: (data) => data.car2MechCount++,
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        text: {
          en: 'LoS ${turretDir} => Tankbusters',
          de: 'LoS ${turretDir} => Tank-Busters',
          cn: '${turretDir} 箱体 => 双T死刑',
        },
      },
    },
    {
      id: 'DoomtrainEx Dead Man\'s Express/Windpipe Car2',
      type: 'StartsUsing',
      netRegex: { id: ['B266', 'B280'], capture: true },
      condition: (data) => data.phase === 'car2',
      durationSeconds: 11.1,
      infoText: (data, matches, output) => {
        let mech1;
        if (matches.id === 'B266') {
          mech1 = output.express!({ knockback: output.knockback!() });
        } else {
          mech1 = output.windpipe!({ drawIn: output.drawIn!() });
        }
        return output.text!({
          turretDir: output[data.turretDir]!(),
          mech1: mech1,
          mech2: output[data.storedKBMech ?? 'unknown']!(),
        });
      },
      run: (data) => data.car2MechCount++,
      outputStrings: {
        text: {
          en: 'LoS ${turretDir} => ${mech1} => ${mech2}',
          de: 'LoS ${turretDir} => ${mech1} => ${mech2}',
          cn: '${turretDir} 箱体 => ${mech1} => ${mech2}',
        },
        express: {
          en: '${knockback} => Dodge Lasers',
          de: '${knockback} => Laser ausweichen',
          cn: '${knockback} => 躲避激光',
        },
        windpipe: {
          en: '${drawIn} => Away from Front',
          de: '${drawIn} => Weg von Vorne',
          cn: '${drawIn} => 远离前方',
        },
        unknown: Outputs.unknown,
        east: Outputs.east,
        west: Outputs.west,
        knockback: Outputs.knockback,
        drawIn: Outputs.drawIn,
        pairs: Outputs.stackPartner,
        spread: Outputs.spread,
      },
    },
    // Add phase
    {
      id: 'DoomtrainEx Add Actor Finder',
      type: 'ActorMove',
      netRegex: { moveType: ['0096', '00FA'] },
      suppressSeconds: 9999,
      run: (data, matches) => {
        data.addTrainId = matches.id;
      },
    },
    {
      id: 'DoomtrainEx Add Train Speed Collector',
      type: 'ActorMove',
      netRegex: { moveType: ['0096', '00FA'] },
      condition: (data, matches) =>
        matches.id === data.addTrainId && data.addTrainDir === 'unknown',
      run: (data, matches) => {
        data.addTrainSpeed = matches.moveType === '0096' ? 'slow' : 'fast';
      },
    },
    {
      id: 'DoomtrainEx Add Train Direction Predictor',
      type: 'HeadMarker',
      netRegex: { id: '027F', capture: true },
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[data.addTrainId];
        if (actor === undefined)
          return;

        let addCleaveDir = Math.atan2(actor.x - arenas.add.x, actor.y - arenas.add.y);

        // Slow rotates 3.122 rads base
        const slowMoveBase = 3.122;
        // Plus 0.0005666 rads per millisecond of delay since ActorMove was last recorded
        const slowMoveDelta = 0.0005666;

        // Same info, but for fast movement
        const fastMoveBase = 4.1697;
        const fastMoveDelta = 0.00061112;

        const deltaMs = new Date(matches.timestamp).getTime() - actor.time;

        if (data.addTrainSpeed === 'slow') {
          addCleaveDir -= slowMoveBase + (slowMoveDelta * deltaMs);
        } else {
          addCleaveDir -= fastMoveBase + (fastMoveDelta * deltaMs);
        }

        if (addCleaveDir < -Math.PI) {
          addCleaveDir += Math.PI * 2;
        }

        const dirNum = Directions.hdgTo16DirNum(addCleaveDir);
        data.addTrainDir = dirNum !== undefined
          ? Directions.output16Dir[dirNum] ?? 'unknown'
          : 'unknown';

        return output.text!({ dir: output[data.addTrainDir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        text: {
          en: 'Train cleaves from ${dir}',
          de: 'Zug Cleave ${dir}',
          cn: '火车从 ${dir} 攻击',
        },
      },
    },
    {
      id: 'DoomtrainEx Add Mechanics',
      type: 'HeadMarker',
      netRegex: { id: ['027D', '027E'], capture: true },
      durationSeconds: 6.5,
      infoText: (data, matches, output) => {
        const addMech = matches.id === '027D' ? 'healerStacks' : 'spread';
        const mech = data.addCleaveOnMe ? output.cleave!() : output[addMech]!();
        const dir = output[data.addTrainDir]!();
        return output.text!({
          dir: dir,
          mech: mech,
        });
      },
      run: (data) => {
        data.addCleaveOnMe = false;
        data.addTrainDir = 'unknown';
      },
      outputStrings: {
        healerStacks: Outputs.healerGroups,
        spread: Outputs.spread,
        cleave: Outputs.tankCleaveOnYou,
        unknown: Outputs.unknown,
        ...Directions.outputStrings16Dir,
        text: {
          en: 'Train ${dir}, ${mech}',
          de: 'Zug ${dir}, ${mech}',
          cn: '火车 ${dir}, ${mech}',
        },
      },
    },
    {
      id: 'DoomtrainEx Add Tank Cleave Headmarker Collector',
      type: 'HeadMarker',
      netRegex: { id: '019C', capture: true },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      run: (data) => {
        data.addCleaveOnMe = true;
      },
    },
    // Car 3
    {
      id: 'DoomtrainEx Car3 Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: '0157', capture: true },
      condition: (data, matches) =>
        data.phase === 'car3' && Conditions.targetIsYou()(data, matches),
      response: Responses.tankBuster(),
    },
    {
      id: 'DoomtrainEx Derailment Siege Car3',
      type: 'StartsUsing',
      netRegex: { id: 'B250', capture: false },
      // Technically platform destroy hits 15.1s after
      // but if you're not in the teleporter by that point you're dead anyways.
      durationSeconds: 15,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x3 => Next Platform',
          de: 'Turm x3 => Nächste Plattform',
          cn: '踩塔 x3 => 下一节车厢',
        },
      },
    },
    // Car 4
    {
      id: 'DoomtrainEx Derailment Siege Car4',
      type: 'StartsUsing',
      netRegex: { id: 'B284', capture: false },
      // Technically 17.2s
      durationSeconds: 17.1,
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.hailActorId = '',
      outputStrings: {
        text: {
          en: 'Tower x4 => Next Platform',
          de: 'Turm x4 => Nächste Plattform',
          cn: '踩塔 x4 => 下一节车厢',
        },
      },
    },
    {
      id: 'DoomtrainEx Headlight',
      type: 'StartsUsing',
      netRegex: { id: 'B27A', capture: false },
      durationSeconds: 9.6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Down => Up',
          de: 'Unten => Oben',
          cn: '先下 => 上',
        },
      },
    },
    {
      id: 'DoomtrainEx Thunderous Breath',
      type: 'StartsUsing',
      netRegex: { id: 'B277', capture: false },
      durationSeconds: 9.6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Up => Down',
          de: 'Oben => Unten',
          cn: '先上 => 下',
        },
      },
    },
    {
      id: 'DoomtrainEx Arcane Revelation',
      type: 'StartsUsing',
      netRegex: { id: 'B9A7', capture: false },
      run: (data) => {
        data.hailActorId = 'need';
        data.hailLastPos = 'dirN';
      },
    },
    // For Hail of Thunder ground AoE, B25[89A] determine 2/3/4 movements.
    {
      id: 'DoomtrainEx Hail of Thunder Move Count Collector',
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
      id: 'DoomtrainEx Hail of Thunder Actor Finder',
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
      id: 'DoomtrainEx Hail of Thunder Stacks',
      type: 'Ability',
      netRegex: { id: 'B292', capture: false },
      run: (data) => data.hailNeedMotion = true,
    },
    {
      id: 'DoomtrainEx Hail of Thunder Motion Detector',
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
          const arena = data.phase === 'car4' ? 4 : 6;

          const oldAngle = Math.PI - (oldIdx / 4) * (Math.PI * 2);
          const newAngle = Math.atan2(actor.x - arenas[arena].x, actor.y - arenas[arena].y);

          const delta = normalizeDelta(newAngle - oldAngle);
          if (delta > 0)
            data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 1) % 4] ?? 'unknown';
          else
            data.hailLastPos = Directions.outputCardinalDir[(oldIdx - 1 + 4) % 4] ?? 'unknown';
        }

        const idx = (Directions.outputCardinalDir.indexOf(data.hailLastPos) + 2) % 4;
        return output.text!({
          dir: output[Directions.outputCardinalDir[idx] ?? 'unknown']!(),
        });
      },
      outputStrings: {
        dirN: Outputs.front,
        dirE: Outputs.right,
        dirS: Outputs.back,
        dirW: Outputs.left,
        unknown: Outputs.unknown,
        text: {
          en: '${dir} Safe + Stacks',
          de: '${dir} Sicher + sammeln',
          cn: '${dir} 安全 + 分摊',
        },
      },
    },
    {
      id: 'DoomtrainEx Car4 Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: '0157', capture: true },
      condition: (data, matches) =>
        data.phase === 'car4' && Conditions.targetIsYou()(data, matches),
      response: Responses.tankBuster(),
    },
    // Car 5
    {
      id: 'DoomtrainEx Derailment Siege Car5',
      type: 'StartsUsing',
      netRegex: { id: 'B285', capture: false },
      // Technically 17.6s
      durationSeconds: 17.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x5 => Next Platform',
          de: 'Turm x5 => Nächste Plattform',
          cn: '踩塔 x5 => 下一节车厢',
        },
      },
    },
    {
      id: 'DoomtrainEx Psychokinesis',
      type: 'StartsUsing',
      netRegex: { id: 'B264', capture: false },
      preRun: (data) => data.psychokinesisCount++,
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        if (data.psychokinesisCount !== 2) {
          return output.spreadIntoBait!();
        }
        return output.spreadIntoBuster!();
      },
      outputStrings: {
        spreadIntoBait: {
          en: 'Spread AoEs => Bait Puddles',
          de: 'AoEs verteilen => Flächen ködern',
          cn: '分散处理黄圈 => 诱导雷圈',
        },
        spreadIntoBuster: {
          en: 'Spread AoEs => Tankbusters',
          de: 'AoEs verteilen => Tank-Busters',
          cn: '分散处理黄圈 => 双T死刑',
        },
      },
    },
    // Car 6
    {
      id: 'DoomtrainEx Derailment Siege Car6',
      type: 'StartsUsing',
      netRegex: { id: 'B286', capture: false },
      durationSeconds: 11,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x6 => Enrage',
          de: 'Turm x6 => Finalangriff',
          cn: '踩塔 x6 => 狂暴',
        },
      },
    },
    {
      id: 'DoomtrainEx Car6 Turret2',
      type: 'StartsUsing',
      netRegex: { id: ['B271', 'B272', 'B273', 'B276'], capture: false },
      condition: (data) => data.phase === 'car6',
      durationSeconds: 6.7,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.car6MechCount >= 1) {
          return data.turretDir === 'east' ? output.up!() : output.down!();
        }
        return output.text!({ turretDir: output[data.turretDir]!() });
      },
      run: (data) => data.car6MechCount++,
      outputStrings: {
        up: {
          en: 'Up (dodge turrets)',
          de: 'Oben (Geschütztürmen ausweichen)',
          cn: '左箱体上',
        },
        down: {
          en: 'Down (dodge turrets)',
          de: 'Unten (Geschütztürmen ausweichen)',
          cn: '左箱体侧',
        },
        east: Outputs.east,
        west: Outputs.west,
        text: {
          en: 'LoS ${turretDir}',
          de: 'LoS ${turretDir}',
          cn: '${turretDir} 箱体',
        },
      },
    },
    {
      id: 'DoomtrainEx Dead Man\'s Express/Windpipe Car6',
      type: 'StartsUsing',
      netRegex: { id: ['B266', 'B280'], capture: true },
      condition: (data) => data.phase === 'car6',
      durationSeconds: 11.1,
      infoText: (data, matches, output) => {
        let mech1;
        if (matches.id === 'B266') {
          mech1 = output.express!({ knockback: output.knockback!() });
        } else {
          mech1 = output.windpipe!({ drawIn: output.drawIn!() });
        }
        const mech3 = data.car6MechCount === 3
          ? output.tbFollowup!({ mech3: output.tankbuster!() })
          : '';
        return output.text!({
          mech1: mech1,
          mech2: output[data.storedKBMech ?? 'unknown']!(),
          mech3: mech3,
        });
      },
      run: (data) => data.car6MechCount++,
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}${mech3}',
          de: '${mech1} => ${mech2}${mech3}',
          cn: '${mech1} => ${mech2}${mech3}',
        },
        express: {
          en: '${knockback} => Dodge Lasers',
          de: '${knockback} => Laser ausweichen',
          cn: '${knockback} => 躲避激光',
        },
        windpipe: {
          en: '${drawIn} => Away from Front',
          de: '${drawIn} => Weg von Vorne',
          cn: '${drawIn} => 远离前方',
        },
        tbFollowup: {
          en: ' => ${mech3}',
          de: ' => ${mech3}',
          cn: ' => ${mech3}',
        },
        unknown: Outputs.unknown,
        knockback: Outputs.knockback,
        drawIn: Outputs.drawIn,
        pairs: Outputs.stackPartner,
        spread: Outputs.spread,
        tankbuster: Outputs.tankBuster,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Aether': 'Äthersphäre',
        'Doomtrain': 'Doomtrain',
        'Kinematic Turret': 'Eskortgeschütz',
      },
      'replaceText': {
        '\\(bait\\)': '(ködern)',
        '\\(detonate\\)': '(explodieren)',
        'Aetherial Ray': 'Ätherstrahl',
        'Aetherochar': 'Ätherreigen',
        'Aetherosote': 'Ätherschlag',
        'Arcane Revelation': 'Ätherausstoß',
        'Dead Man\'s Blastpipe': 'Schneller Ruß',
        'Dead Man\'s Express': 'InterBlitz-Express S',
        'Dead Man\'s Overdraught': 'Toter Übertakt',
        'Dead Man\'s Windpipe': 'Schneller Sog',
        'Derail(?!ment)': 'Entgleisung',
        'Derailment Siege': 'Schienenbruch',
        'Electray': 'Elektroblitz',
        'Hail of Thunder': 'Donnerhagel',
        'Headlight': 'Spitzensignal',
        'Hyperconductive Plasma': 'Supraleitendes Plasma',
        'Hyperexplosive Plasma': 'Dichtes Plasma',
        'Lightning Burst': 'Blitzknall',
        '(?<! )Overdraught': 'Überstrom',
        '(?<! )Plasma(?! )': 'Plasma',
        'Plasma Beam': 'Plasmastrahl',
        'Plummet': 'Abfallen',
        'Psychokinesis': 'Psychokinese',
        'Runaway Train': 'Endlose Irrfahrt',
        'Shockwave': 'Schockwelle',
        'Third Rail': 'Stromschiene',
        'Thunderous Breath': 'Gewitteratem',
        'Turret Crossing': 'Kanonenkreuzung',
        'Unlimited Express': 'Unregional-Express',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'sphère éthérée',
        'Doomtrain': 'Glasya-Labolas',
        'Kinematic Turret': 'tourelle d\'escorte',
      },
      'replaceText': {
        'Aetherial Ray': 'Rayon éthéré',
        'Aetherochar': 'Rayon éthéré',
        'Aetherosote': 'Choc éthéré',
        'Arcane Revelation': 'Déploiement arcanique',
        'Dead Man\'s Blastpipe': 'Émission turbo',
        'Dead Man\'s Express': 'Express turbo',
        'Dead Man\'s Overdraught': 'Surcharge turbo',
        'Dead Man\'s Windpipe': 'Aspirateur turbo',
        'Derail(?!ment)': 'Déraillement',
        'Derailment Siege': 'Déraillement violent',
        'Electray': 'Rayon électrique',
        'Hail of Thunder': 'Déluge électrique',
        'Headlight': 'Regard glacial',
        'Hyperconductive Plasma': 'Plasma hyperconducteur',
        'Hyperexplosive Plasma': 'Plasma destructeur',
        'Lightning Burst': 'Explosion électrique',
        '(?<! )Overdraught': 'Surcharge débordante',
        '(?<! )Plasma(?! )': 'Plasma explosif',
        'Plasma Beam': 'Rayon plasma',
        'Plummet': 'Chute',
        'Psychokinesis': 'Psychokinésie',
        'Runaway Train': 'Train fou',
        'Shockwave': 'Onde de choc',
        'Third Rail': 'Troisième rail',
        'Thunderous Breath': 'Souffle électrique',
        'Turret Crossing': 'Tourelles croisées',
        'Unlimited Express': 'Express illimité',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'エーテルスフィア',
        'Doomtrain': 'グラシャラボラス',
        'Kinematic Turret': 'エスコートタレット',
      },
      'replaceText': {
        'Aetherial Ray': 'エーテルレイ',
        'Aetherochar': 'エーテルバレット',
        'Aetherosote': 'エーテルブラスター',
        'Arcane Revelation': '魔法陣展開',
        'Dead Man\'s Blastpipe': 'ブーステッド・エミッション',
        'Dead Man\'s Express': 'ブーステッド・エクスプレス',
        'Dead Man\'s Overdraught': 'オーバーブースト',
        'Dead Man\'s Windpipe': 'ブーステッド・バキューム',
        'Derail(?!ment)': 'ディレール',
        'Derailment Siege': 'ディレールパウンド',
        'Electray': 'エレクトロレイ',
        'Hail of Thunder': 'サンダーレイン',
        'Headlight': 'ヘッドライト',
        'Hyperconductive Plasma': '重雷',
        'Hyperexplosive Plasma': '重爆雷',
        'Lightning Burst': 'サンダーバースト',
        '(?<! )Overdraught': 'オーバーフロウ',
        '(?<! )Plasma(?! )': '爆雷',
        'Plasma Beam': 'プラズマレイ',
        'Plummet': '落下',
        'Psychokinesis': 'サイコキネシス',
        'Runaway Train': '果てしなき暴走',
        'Shockwave': '衝撃波',
        'Third Rail': 'フラッシュサンダー',
        'Thunderous Breath': 'サンダーブレス',
        'Turret Crossing': '随伴機出撃',
        'Unlimited Express': 'アンリミテッドエクスプレス',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Aether': '以太晶球',
        'Doomtrain': '格莱杨拉波尔',
        'Kinematic Turret': '护卫炮塔',
      },
      'replaceText': {
        '\\(bait\\)': '(诱导)',
        '\\(detonate\\)': '(爆炸)',
        'Aetherial Ray': '以太射线',
        'Aetherochar': '以太炮',
        'Aetherosote': '以太冲击波',
        'Arcane Revelation': '魔法阵展开',
        'Dead Man\'s Blastpipe': '超增压排雾',
        'Dead Man\'s Express': '超增压急行',
        'Dead Man\'s Overdraught': '超增压',
        'Dead Man\'s Windpipe': '超增压抽雾',
        'Derail(?!ment)': '脱轨',
        'Derailment Siege': '脱轨捶打',
        'Electray': '雷转质射线',
        'Hail of Thunder': '雷光雨',
        'Headlight': '前照光',
        'Hyperconductive Plasma': '重雷',
        'Hyperexplosive Plasma': '重爆雷',
        'Lightning Burst': '雷电爆发',
        '(?<! )Overdraught': '溢流',
        '(?<! )Plasma(?! )': '爆雷',
        'Plasma Beam': '等离子射线',
        'Plummet': '掉落',
        'Psychokinesis': '念动反应',
        'Runaway Train': '无尽狂奔',
        'Shockwave': '冲击波',
        'Third Rail': '雷光一闪',
        'Thunderous Breath': '雷鸣吐息',
        'Turret Crossing': '炮塔出击',
        'Unlimited Express': '无控急行',
      },
    },
  ],
};

export default triggerSet;
