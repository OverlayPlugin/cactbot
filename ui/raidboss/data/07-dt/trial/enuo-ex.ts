import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Positions8 = DirectionOutput8 | 'middle';

export interface Data extends RaidbossData {
  gazeDir: 'CW' | 'CCW';
  gazeOrbs: {
    tankOrb: boolean;
    color: 'light' | 'dark';
  }[];
  returnToNothingType: 'unknown' | 'healerStacks' | 'stack';
  naughtGrowsPositions: {
    pos: Positions8;
    type: 'aoe' | 'donut';
  }[];
  passageOfNaughtPositions: {
    x: number;
    y: number;
    heading: number;
    type: 'small' | 'big';
  }[];
  passageOfNaughtCounter: number;
  flareTargets: string[];
  actorPositions: { [id: string]: { x: number; y: number } };
  addPhasePositions: ('tower' | 'empty')[];
  addPhaseConeTargets: string[];
}

const center = {
  x: 100,
  y: 100,
} as const;

// Get a sparsely populated array indicating the 16-dir positions for each mechanic in add phase
const getEmptyAddPhaseData = () => {
  const ret: Data['addPhasePositions'] = [];

  for (let i = 0; i < 8; ++i) {
    ret[i] = 'empty';
  }

  return ret;
};

const adjustDirNum = (pos: number, by: number, max: number) => {
  return (pos + max + by) % max;
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheUnmakingExtreme',
  zoneId: ZoneId.TheUnmakingExtreme,
  config: [
    {
      id: 'gazeOrbStrat',
      name: {
        en: 'Gaze of the Void Strategy',
      },
      comment: {
        en: `Strategy for resolving Gaze of the Void orbs.

             Tank: Call the tank direction only.
             <number>: Call the specified number's priority, treating tank orb as north clockwise`,
      },
      type: 'select',
      options: {
        en: {
          'Tank': 'tank',
          // Originally I wrote code for "Role" as well, but given that it's possible to do triple ranged,
          // that made determining which role partners to group together impossible.
          '1 (tank)': '1',
          '2 (healer)': '2',
          '3 (melee)': '3',
          '4 (ranged)': '4',
        },
      },
      default: 'tank',
    },
    {
      id: 'addPhaseStrat',
      name: {
        en: 'Add Phase Strategy',
      },
      comment: {
        en: `Strategy for resolving towers and spreads in add phase.

             None: Call tower or spread only.
             <number>: Call the specified partner number's position. For example:
             If following the "modified" raidplan (kgH6GJydOCbUs1L_), H1 should select "3" for S CW priority, T1 should select "4" for N CCW priority.
             If following the "original" raidplan (z6hesq84t7ewujw9), H1 should select "2" as they are 2nd fill clockwise from N, T1 should select "1" as they are 1st fill clockwise from N.`,
      },
      type: 'select',
      options: {
        en: {
          'None': 'none',
          '1 (NE)': '1',
          '2 (SE)': '2',
          '3 (SW)': '3',
          '4 (NW)': '4',
        },
      },
      default: 'none',
    },
  ],
  timelineFile: 'enuo-ex.txt',
  initData: () => ({
    gazeDir: 'CW',
    gazeOrbs: [],
    returnToNothingType: 'unknown',
    naughtGrowsPositions: [],
    passageOfNaughtPositions: [],
    passageOfNaughtCounter: 0,
    flareTargets: [],
    actorPositions: {},
    addPhasePositions: getEmptyAddPhaseData(),
    addPhaseConeTargets: [],
  }),
  triggers: [
    {
      id: 'EnuoEx AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
        },
    },
    {
      id: 'EnuoEx Meteorain',
      type: 'StartsUsing',
      netRegex: { id: 'C381', source: 'Enuo', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'EnuoEx Almagest',
      type: 'StartsUsing',
      netRegex: { id: 'C334', source: 'Enuo', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'EnuoEx Lightless World',
      type: 'StartsUsing',
      netRegex: { id: 'C36D', source: 'Enuo', capture: false },
      response: Responses.bigAoe(),
    },

    {
      id: 'EnuoEx Naught Grows Collector',
      type: 'StartsUsingExtra',
      netRegex: { id: ['C339', 'C33A', 'C33B', 'C33C'], capture: true },
      preRun: (data, matches) => {
        let dir: Positions8;

        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);

        const type = ['C339', 'C33B'].includes(matches.id) ? 'aoe' : 'donut';

        if (Math.abs(x - center.x) < 1 && Math.abs(y - center.y) < 1) {
          dir = 'middle';
        } else {
          dir = Directions.xyTo8DirOutput(x, y, center.x, center.y);
        }
        data.naughtGrowsPositions.push({
          pos: dir,
          type: type,
        });
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

        const mech = output[data.returnToNothingType]!();

        // Two possible patterns: Single, Under Boss, Under Void
        // Single
        if (pos2 === undefined) {
          if (pos1.type === 'aoe')
            return output.awayFrom!({ dir: output[pos1.pos]!(), mech: mech });
          return output.under!({ dir: output[pos1.pos]!(), mech: mech });
        }

        const middleDir = pos2.pos === 'middle' ? pos2 : pos1;
        const voidDir = pos1.pos === 'middle' ? pos2 : pos1;
        // Under Boss
        if (middleDir.type === 'donut') {
          return output.underBossAndAway!({
            dir: output[voidDir.pos]!(),
            mech: mech,
          });
        }
        return output.underPortalAndAway!({
          dir: output[voidDir.pos]!(),
          mech: mech,
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        middle: Outputs.middle,
        healerStacks: Outputs.healerGroups,
        stack: Outputs.stackMarker,
        awayFrom: {
          en: 'Away from ${dir} + ${mech}',
        },
        under: {
          en: '${dir} + ${mech}',
        },
        underBossAndAway: {
          en: 'Under Boss + Away from ${dir} + ${mech}',
        },
        underPortalAndAway: {
          en: '${dir} + Away from Boss + ${mech}',
        },
      },
    },
    {
      id: 'EnuoEx Return to Nothing Headmarker',
      type: 'HeadMarker',
      netRegex: { id: '02BD', capture: false },
      run: (data) => data.returnToNothingType = 'healerStacks',
    },
    {
      id: 'EnuoEx Greater Return to Nothing Headmarker',
      type: 'HeadMarker',
      netRegex: { id: '02BE', capture: false },
      run: (data) => data.returnToNothingType = 'stack',
    },
    {
      id: 'EnuoEx Meltdown',
      type: 'StartsUsing',
      netRegex: { id: 'C378', source: 'Enuo', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Puddles => Stop Moving => Spread',
        },
      },
    },
    {
      id: 'EnuoEx Meltdown Chains of Condemnation',
      type: 'Ability',
      netRegex: { id: 'C378', source: 'Enuo', capture: false },
      durationSeconds: 5,
      suppressSeconds: 5,
      // 2 second debuff, then spread
      countdownSeconds: 2,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stop Moving => Spread',
        },
      },
    },
    {
      id: 'EnuoEx Airy Emptiness',
      type: 'StartsUsing',
      netRegex: { id: 'C370', source: 'Enuo', capture: false },
      response: Responses.stackPartner(),
    },
    {
      id: 'EnuoEx Dense Emptiness',
      type: 'StartsUsing',
      netRegex: { id: 'C371', source: 'Enuo', capture: false },
      // Not sure if this targets healers or tanks, but this accomplishes the same thing
      response: Responses.healerGroups(),
    },

    {
      id: 'EnuoEx Gaze of the Void CW',
      type: 'StartsUsing',
      netRegex: { id: 'C353', source: 'Enuo', capture: false },
      run: (data) => data.gazeDir = 'CW',
    },
    {
      id: 'EnuoEx Gaze of the Void CCW',
      type: 'StartsUsing',
      netRegex: { id: 'C354', source: 'Enuo', capture: false },
      run: (data) => data.gazeDir = 'CCW',
    },
    {
      id: 'EnuoEx Gaze of the Void',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C355', capture: true },
      delaySeconds: 0.2,
      durationSeconds: 11.3,
      suppressSeconds: 30,
      infoText: (data, matches, output) => {
        const coneDir = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        let startDir;
        let endDir;
        data.gazeOrbs = [];
        for (let i = 0; i < 8; ++i)
          data.gazeOrbs.push({ color: 'light', tankOrb: i === coneDir });
        if (data.gazeDir === 'CW') {
          startDir = ((coneDir + 8) - 1) % 8;
          endDir = (coneDir + 2) % 8;
          const orb = data.gazeOrbs[(coneDir + 1) % 8];
          if (orb === undefined)
            return;
          orb.tankOrb = true;
        } else {
          startDir = (coneDir + 1) % 8;
          endDir = ((coneDir + 8) - 2) % 8;
          const orb = data.gazeOrbs[((coneDir + 8) - 1) % 8];
          if (orb === undefined)
            return;
          orb.tankOrb = true;
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
        },
      },
    },
    {
      id: 'EnuoEx Gaze Orb Tether Collector',
      type: 'Tether',
      netRegex: { id: '0196', capture: true },
      preRun: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return;

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const orb = data.gazeOrbs[dirNum];

        if (orb === undefined)
          return;

        orb.color = 'dark';
      },
      infoText: (data, _matches, output) => {
        // Wait until we have all 4 tethers
        if (data.gazeOrbs.filter((orb) => orb.color === 'dark').length < 4) {
          return;
        }

        const strategy = data.triggerSetConfig.gazeOrbStrat;

        const orbs = [...data.gazeOrbs, ...data.gazeOrbs];

        let firstTankOrb = 0;

        for (let i = 0; i < orbs.length; ++i) {
          if (orbs[i]?.tankOrb === true && orbs[i + 1]?.tankOrb === true) {
            firstTankOrb = i;
            break;
          }
        }

        if (strategy === 'tank') {
          return output.tankOrbsDir!({
            dir: output[Directions.output16Dir[(firstTankOrb * 2) + 1] ?? 'unknown']!(),
          });
        }

        let trimmedOrbs = orbs.slice(firstTankOrb, firstTankOrb + 8);

        const orb1Light = trimmedOrbs.findIndex((orb) => orb.color === 'light');
        const orb1Dark = trimmedOrbs.findIndex((orb) => orb.color === 'dark');

        trimmedOrbs = trimmedOrbs.filter((_orb, index) =>
          index !== orb1Light && index !== orb1Dark
        );

        const orb2Light = trimmedOrbs.findIndex((orb) => orb.color === 'light');
        const orb2Dark = trimmedOrbs.findIndex((orb) => orb.color === 'dark');

        trimmedOrbs = trimmedOrbs.filter((_orb, index) =>
          index !== orb2Light && index !== orb2Dark
        );

        const orb3Light = trimmedOrbs.findIndex((orb) => orb.color === 'light');
        const orb3Dark = trimmedOrbs.findIndex((orb) => orb.color === 'dark');

        trimmedOrbs = trimmedOrbs.filter((_orb, index) =>
          index !== orb3Light && index !== orb3Dark
        );

        const orb4Light = trimmedOrbs.findIndex((orb) => orb.color === 'light');
        const orb4Dark = trimmedOrbs.findIndex((orb) => orb.color === 'dark');

        switch (strategy) {
          case '1':
            return output.orbSoaks!({
              dir1: output[Directions.output8Dir[(firstTankOrb + orb1Light) % 8] ?? 'unknown']!(),
              dir2: output[Directions.output8Dir[(firstTankOrb + orb1Dark) % 8] ?? 'unknown']!(),
            });
          case '2':
            return output.orbSoaks!({
              dir1:
                output[Directions.output8Dir[(firstTankOrb + orb2Light + 2) % 8] ?? 'unknown']!(),
              dir2:
                output[Directions.output8Dir[(firstTankOrb + orb2Dark + 2) % 8] ?? 'unknown']!(),
            });
          case '3':
            return output.orbSoaks!({
              dir1:
                output[Directions.output8Dir[(firstTankOrb + orb3Light + 4) % 8] ?? 'unknown']!(),
              dir2:
                output[Directions.output8Dir[(firstTankOrb + orb3Dark + 4) % 8] ?? 'unknown']!(),
            });
          case '4':
            return output.orbSoaks!({
              dir1:
                output[Directions.output8Dir[(firstTankOrb + orb4Light + 6) % 8] ?? 'unknown']!(),
              dir2:
                output[Directions.output8Dir[(firstTankOrb + orb4Dark + 6) % 8] ?? 'unknown']!(),
            });
          default:
            return output.unknown!();
        }
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        unknown: Outputs.unknown,
        tankOrbsDir: {
          en: 'Tank orbs ${dir}',
        },
        orbSoaks: {
          en: '${dir1} => ${dir2}',
        },
      },
    },
    {
      id: 'EnuoEx Silent Torrent',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C34B', capture: true },
      infoText: (_data, matches, output) => {
        // C34B is the short line. Safe spots are (clockwise):
        // +6 far
        // +7 medium
        // +8 short
        // +9 short
        // +10 short
        // +11 medium
        // +12 far

        // Due to needing to bait Meltdown puddles later, just call the close safe position
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dangerDirNum = Directions.xyTo16DirNum(x, y, center.x, center.y);
        const closeDirNum = Directions.output16Dir[(dangerDirNum + 9) % 16] ?? 'unknown';

        return output.text!({
          dir3: output[closeDirNum]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        ...Directions.outputStrings16Dir,
        text: {
          en: '${dir3} Close',
        },
      },
    },
    {
      id: 'EnuoEx Deep Freeze',
      type: 'StartsUsing',
      netRegex: { id: 'C37C', source: 'Enuo', capture: true },
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
          en: 'Tank Flare on YOU => Keep Moving',
        },
        awayFromFlares: {
          en: 'Away from tank flares => Keep Moving',
        },
      },
    },
    {
      id: 'EnuoEx Deep Freeze Move Reminder',
      type: 'StartsUsing',
      netRegex: { id: 'C37B', source: 'Enuo', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      durationSeconds: 3,
    },
    {
      id: 'EnuoEx Looming Emptiness',
      type: 'StartsUsing',
      netRegex: { id: 'C33E', source: 'Looming Shadow', capture: false },
      response: Responses.knockback(),
    },
    // Empty Shadow = towers
    // Voidal Turblence C374 = self cast for cones. Actual cone hits are instant cast C376
    // Use headmarker 02D1 to ID targets instead. C374 is after last headmarker goes out,
    // but add 0.1s delay to allow for potential lag
    {
      id: 'EnuoEx Empty Shadow Collector',
      type: 'StartsUsingExtra',
      netRegex: { id: 'C35D', capture: true },
      run: (data, matches) => {
        const dirNum = Directions.xyTo16DirNum(
          parseFloat(matches.x),
          parseFloat(matches.y),
          center.x,
          center.y,
        );
        data.addPhasePositions[Math.floor(dirNum / 2)] = 'tower';
      },
    },
    {
      id: 'EnuoEx Voidal Turbulence Headmarker Collector',
      type: 'HeadMarker',
      netRegex: { id: '02D1', capture: true },
      run: (data, matches) => {
        data.addPhaseConeTargets.push(matches.target);
      },
    },
    {
      id: 'EnuoEx Voidal Turbulence',
      type: 'StartsUsing',
      netRegex: { id: 'C374', source: 'Looming Shadow', capture: false },
      delaySeconds: 0.1,
      infoText: (data, _matches, output) => {
        const strategy = data.triggerSetConfig.addPhaseStrat;
        const cone = data.addPhaseConeTargets.includes(data.me);

        if (strategy === 'none') {
          if (cone)
            return output.cone!();
          return output.tower!();
        }

        const used: number[] = [];

        const pos1Tower = data.addPhasePositions.findIndex((pos) => pos === 'tower');
        const pos1Cone = data.addPhasePositions.findIndex((pos) => pos === 'empty');

        used.push(pos1Tower, pos1Cone);

        const pos2Tower = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'tower' && !used.includes(index)
        );
        const pos2Cone = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'empty' && !used.includes(index)
        );

        used.push(pos2Tower, pos2Cone);

        const pos3Tower = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'tower' && !used.includes(index)
        );
        const pos3Cone = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'empty' && !used.includes(index)
        );

        used.push(pos3Tower, pos3Cone);

        const pos4Tower = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'tower' && !used.includes(index)
        );
        const pos4Cone = data.addPhasePositions.findIndex((pos, index) =>
          pos === 'empty' && !used.includes(index)
        );

        switch (strategy) {
          case '1':
            if (cone)
              return output.conePos!({
                dir: output[Directions.output16Dir[pos1Cone * 2 + 1] ?? 'unknown']!(),
              });
            return output.towerPos!({
              dir: output[Directions.output16Dir[pos1Tower * 2 + 1] ?? 'unknown']!(),
            });
          case '2':
            if (cone)
              return output.conePos!({
                dir: output[Directions.output16Dir[pos2Cone * 2 + 1] ?? 'unknown']!(),
              });
            return output.towerPos!({
              dir: output[Directions.output16Dir[pos2Tower * 2 + 1] ?? 'unknown']!(),
            });
          case '3':
            if (cone)
              return output.conePos!({
                dir: output[Directions.output16Dir[pos3Cone * 2 + 1] ?? 'unknown']!(),
              });
            return output.towerPos!({
              dir: output[Directions.output16Dir[pos3Tower * 2 + 1] ?? 'unknown']!(),
            });
          case '4':
            if (cone)
              return output.conePos!({
                dir: output[Directions.output16Dir[pos4Cone * 2 + 1] ?? 'unknown']!(),
              });
            return output.towerPos!({
              dir: output[Directions.output16Dir[pos4Tower * 2 + 1] ?? 'unknown']!(),
            });
          default:
            return output.unknown!();
        }
      },
      run: (data) => {
        data.addPhaseConeTargets = [];
        data.addPhasePositions = getEmptyAddPhaseData();
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        unknown: Outputs.unknown,
        cone: {
          en: 'Cone on YOU',
        },
        tower: {
          en: 'Soak Tower',
        },
        conePos: {
          en: 'Aim Cone ${dir}',
        },
        towerPos: {
          en: 'Soak Tower ${dir}',
        },
      },
    },
    {
      id: 'EnuoEx Curse of the Flesh',
      type: 'Ability',
      netRegex: { id: 'C369', source: 'Soothing Shadow', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.cleanse!(),
      outputStrings: {
        cleanse: {
          en: 'Cleanse Debuff',
        },
      },
    },
    {
      id: 'EnuoEx Drain Touch',
      type: 'StartsUsing',
      netRegex: { id: 'C362', source: 'Protective Shadow', capture: true },
      condition: (data) => data.role === 'tank',
      suppressSeconds: 1,
      response: Responses.interrupt(),
    },
    {
      id: 'EnuoEx Weight of Nothing',
      type: 'StartsUsing',
      netRegex: { id: 'C365', source: 'Protective Shadow', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.tankCleave(),
    },
    {
      id: 'EnuoEx Demon Eye',
      type: 'StartsUsing',
      netRegex: { id: 'C366', source: 'Aggressive Shadow', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.lookMiddle!(),
      outputStrings: {
        lookMiddle: {
          en: 'Look Middle',
        },
      },
    },

    {
      id: 'EnuoEx Passage of Naught',
      type: 'StartsUsingExtra',
      netRegex: { id: ['C341', 'C342', 'C343'], capture: true },
      preRun: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const heading = parseFloat(matches.heading);
        const size = matches.id === 'C341' ? 'big' : 'small';
        data.passageOfNaughtPositions.push({ x: x, y: y, heading: heading, type: size });
        data.passageOfNaughtCounter += size === 'big' ? 2 : 1;
      },
      infoText: (data, _matches, output) => {
        if (data.passageOfNaughtCounter < 4)
          return;

        const [line1, line2, line3, line4] = data.passageOfNaughtPositions;

        // Reset here due to variable amount of entries
        data.passageOfNaughtPositions = [];
        data.passageOfNaughtCounter = 0;

        if (line1 === undefined || line2 === undefined)
          return;

        // Two "big" lines
        if (line3 === undefined) {
          // On cardinals
          if (Directions.hdgTo8DirNum(line1.heading) % 2 === 0) {
            return output.intercards!();
          }
          return output.cardinals!();
        }

        // Four "small" lines
        if (line4 !== undefined)
          return output.under!();

        // We're only concerned with the "big" line, as max melee perpindicular to that line will be safe
        const big = line1.type === 'big' ? line1 : (line2.type === 'big' ? line2 : line3);

        const bigDirNum = Directions.xyTo8DirNum(big.x, big.y, center.x, center.y);

        const safe1 = adjustDirNum(bigDirNum, 2, 8);
        const safe2 = adjustDirNum(bigDirNum, 6, 8);

        // Sort directions N CW

        const safe1Sorted = safe1 > safe2 ? safe2 : safe1;
        const safe2Sorted = safe1 === safe1Sorted ? safe2 : safe1;

        return output.go!({
          dir1: output[Directions.output8Dir[safe1Sorted] ?? 'unknown']!(),
          dir2: output[Directions.output8Dir[safe2Sorted] ?? 'unknown']!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        intercards: Outputs.intercards,
        cardinals: Outputs.cardinals,
        under: Outputs.getUnder,
        go: {
          en: 'Go ${dir1}/${dir2} Max Melee',
        },
      },
    },
    {
      id: 'EnuoEx Shrouded Holy',
      type: 'StartsUsing',
      netRegex: { id: 'C37D', source: 'Enuo', capture: false },
      response: Responses.healerGroups(),
    },
    {
      id: 'EnuoEx Dimension Zero',
      type: 'StartsUsing',
      netRegex: { id: 'C37F', source: 'Enuo', capture: false },
      response: Responses.stackMarker(),
    },
    {
      id: 'EnuoEx Naught Hunts Tether',
      type: 'Tether',
      netRegex: { id: ['0194', '0195'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 13.8,
      suppressSeconds: 8,
      countdownSeconds: 13.8,
      infoText: (_data, _matches, output) => output.chasingPuddle!(),
      outputStrings: {
        chasingPuddle: {
          en: 'Chasing puddle on you',
        },
      },
    },
  ],
};

export default triggerSet;
