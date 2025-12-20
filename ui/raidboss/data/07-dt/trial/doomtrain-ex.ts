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

// @TODO:

// Could get a slightly more accurate prediction for add phase train stop location
// by adding additional rotation based on delta time between the mechanic headmarker
// and the tank headmarkers

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
      infoText: (data, matches, output) =>
        output.text!({
          mech1: output[matches.id === 'B266' ? 'knockback' : 'drawIn']!(),
          mech2: output[data.storedKBMech ?? 'unknown']!(),
        }),
      outputStrings: {
        text: {
          en: '${mech1} => ${mech2}',
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
      infoText: (data, _matches, output) => output.text!({ turretDir: output[data.turretDir]!() }),
      run: (data) => data.car2MechCount++,
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        text: {
          en: 'LoS ${turretDir} => Tankbusters',
        },
      },
    },
    {
      id: 'DoomtrainEx Dead Man\'s Express/Windpipe Car2',
      type: 'StartsUsing',
      netRegex: { id: ['B266', 'B280'], capture: true },
      condition: (data) => data.phase === 'car2',
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
        },
        express: {
          en: '${knockback} => Dodge Lasers',
        },
        windpipe: {
          en: '${drawIn} => Away from Front',
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
        },
      },
    },
    {
      id: 'DoomtrainEx Add Mechanics',
      type: 'HeadMarker',
      netRegex: { id: ['027D', '027E'], capture: true },
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
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x3 => Next Platform',
        },
      },
    },
    // Car 4
    {
      id: 'DoomtrainEx Derailment Siege Car4',
      type: 'StartsUsing',
      netRegex: { id: 'B284', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      run: (data) => data.hailActorId = '',
      outputStrings: {
        text: {
          en: 'Tower x4 => Next Platform',
        },
      },
    },
    {
      id: 'DoomtrainEx Headlight',
      type: 'StartsUsing',
      netRegex: { id: 'B27A', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Down => Up',
        },
      },
    },
    {
      id: 'DoomtrainEx Thunderous Breath',
      type: 'StartsUsing',
      netRegex: { id: 'B277', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Up => Down',
        },
      },
    },
    {
      id: 'DoomtrainEx Arcane Revelation',
      type: 'StartsUsing',
      netRegex: { id: 'B9A7', capture: false },
      run: (data) => data.hailActorId = 'need',
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
      infoText: (data, _matches, output) => {
        // Easy cases first
        // data.hailMoveCount === 4, no-op
        const oldIdx = Directions.outputCardinalDir.indexOf(data.hailLastPos);
        if (data.hailMoveCount === 2) {
          data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 2) % 4] ?? 'unknown';
        } else if (data.hailMoveCount === 3) {
          // Now we determine CW or CCW
          const actor = data.actorPositions[data.addTrainId];
          if (actor === undefined)
            return;

          const arena = data.phase === 'car4' ? 4 : 6;

          const oldAngle = (Math.PI * 2) + (Math.PI - ((oldIdx / 4) * (Math.PI * 2)));
          const newAngle = (Math.PI * 2) +
            (Math.atan2(actor.x - arenas[arena].x, actor.y - arenas[arena].y));

          if (oldAngle < newAngle) {
            // Probably CCW, but check for wrap around
            if ((newAngle - oldAngle) > Math.PI) {
              // CW instead
              data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 3) % 4] ?? 'unknown';
            } else {
              data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 1) % 4] ?? 'unknown';
            }
          } else {
            // Probably CW, but check for wrap around
            if ((oldAngle - newAngle) > Math.PI) {
              // CCW instead
              data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 1) % 4] ?? 'unknown';
            } else {
              data.hailLastPos = Directions.outputCardinalDir[(oldIdx + 3) % 4] ?? 'unknown';
            }
          }
        }

        const idx = (Directions.outputCardinalDir.indexOf(data.hailLastPos) + 2) % 4;
        return output.text!({
          dir: output[Directions.outputCardinalDir[idx] ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        text: {
          en: '${dir} => Stacks',
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
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x5 => Next Platform',
        },
      },
    },
    {
      id: 'DoomtrainEx Psychokinesis',
      type: 'StartsUsing',
      netRegex: { id: 'B264', capture: false },
      preRun: (data) => data.psychokinesisCount++,
      infoText: (data, _matches, output) => {
        if (data.psychokinesisCount !== 2) {
          return output.spreadIntoBait!();
        }
        return output.spreadIntoBuster!();
      },
      outputStrings: {
        spreadIntoBait: {
          en: 'Spread AoEs => Bait Puddles',
        },
        spreadIntoBuster: {
          en: 'Spread AoEs => Tankbusters',
        },
      },
    },
    // Car 6
    {
      id: 'DoomtrainEx Derailment Siege Car6',
      type: 'StartsUsing',
      netRegex: { id: 'B286', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tower x6 => Enrage',
        },
      },
    },
    {
      id: 'DoomtrainEx Car6 Turret2',
      type: 'StartsUsing',
      netRegex: { id: ['B271', 'B272', 'B273', 'B276'], capture: false },
      condition: (data) => data.phase === 'car6',
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
        },
        down: {
          en: 'Down (dodge turrets)',
        },
        east: Outputs.east,
        west: Outputs.west,
        text: {
          en: 'LoS ${turretDir}',
        },
      },
    },
    {
      id: 'DoomtrainEx Dead Man\'s Express/Windpipe Car6',
      type: 'StartsUsing',
      netRegex: { id: ['B266', 'B280'], capture: true },
      condition: (data) => data.phase === 'car6',
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
        },
        express: {
          en: '${knockback} => Dodge Lasers',
        },
        windpipe: {
          en: '${drawIn} => Away from Front',
        },
        tbFollowup: {
          en: ' => ${mech3}',
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
      'missingTranslations': true,
      'replaceSync': {
        'Aether': 'Äthersphäre',
        'Doomtrain': 'Doomtrain',
        'Kinematic Turret': 'Eskortgeschütz',
      },
      'replaceText': {
        '\\(bait\\)': '(ködern)',
        '\\(detonate\\)': '(explodieren)',
        'Arcane Revelation': 'Ätherausstoß',
        'Dead Man\'s Express': 'InterBlitz-Express S',
        'Dead Man\'s Overdraught': 'Toter Übertakt',
        'Dead Man\'s Windpipe': 'Schneller Sog',
        'Derail': 'Entgleisung',
        'Derailment Siege': 'Schienenbruch',
        'Electray': 'Elektroblitz',
        'Hail of Thunder': 'Donnerhagel',
        'Headlight': 'Spitzensignal',
        'Hyperconductive Plasma': 'Supraleitendes Plasma',
        'Lightning Burst': 'Blitzknall',
        'Overdraught': 'Überstrom',
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
        'Arcane Revelation': 'Déploiement arcanique',
        'Dead Man\'s Express': 'Express turbo',
        'Dead Man\'s Overdraught': 'Surcharge turbo',
        'Dead Man\'s Windpipe': 'Aspirateur turbo',
        'Derail': 'Déraillement',
        'Derailment Siege': 'Déraillement violent',
        'Electray': 'Rayon électrique',
        'Hail of Thunder': 'Déluge électrique',
        'Headlight': 'Regard glacial',
        'Hyperconductive Plasma': 'Plasma hyperconducteur',
        'Lightning Burst': 'Explosion électrique',
        'Overdraught': 'Surcharge débordante',
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
        'Arcane Revelation': '魔法陣展開',
        'Dead Man\'s Express': 'ブーステッド・エクスプレス',
        'Dead Man\'s Overdraught': 'オーバーブースト',
        'Dead Man\'s Windpipe': 'ブーステッド・バキューム',
        'Derail': 'ディレール',
        'Derailment Siege': 'ディレールパウンド',
        'Electray': 'エレクトロレイ',
        'Hail of Thunder': 'サンダーレイン',
        'Headlight': 'ヘッドライト',
        'Hyperconductive Plasma': '重雷',
        'Lightning Burst': 'サンダーバースト',
        'Overdraught': 'オーバーフロウ',
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
  ],
};

export default triggerSet;
