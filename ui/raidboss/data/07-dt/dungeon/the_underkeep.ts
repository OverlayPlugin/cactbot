import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

// Todo:
// Could call the exact safe spot during Aerial Ambush

type MoveAfter = 'moveAfterLaser' | 'moveAfterOrb';

export interface Data extends RaidbossData {
  turretLocations: string[];
  tetherMap: { [id: string]: string };
  lastClone?: PluginCombatantState;
  orbLocations: string[];
  marchMove?: MoveAfter;
}

const soldierLaserLocations: { [loc: string]: string } = {
  '1F': 'W',
  '21': 'E',
  '23': 'N',
  '25': 'S',
};

const coordinateBitMapEffects = [
  '0D',
  '0E',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '1A',
  '1C',
];

type MarchOutputDirs = 'NE' | 'NW' | 'SE' | 'SW';
type MarchOutput = {
  first: MarchOutputDirs;
  second: MarchOutputDirs;
  move: MoveAfter | '';
};
const marchPatterns: { [locs: string]: MarchOutput } = {
  '16,1A': { first: 'SE', second: 'NE', move: '' },
  '0E,17': { first: 'NW', second: 'NE', move: '' },
  '15,16': { first: 'NW', second: 'NE', move: '' },
  '13,15': { first: 'SW', second: 'NW', move: '' },
  '0E,10,19': { first: 'SE', second: 'NE', move: 'moveAfterLaser' },
  '11,16,18': { first: 'NE', second: 'SE', move: 'moveAfterOrb' },
  '12,14,15': { first: 'SE', second: 'NE', move: 'moveAfterOrb' },
  '0D,1A,1C': { first: 'NE', second: 'SE', move: 'moveAfterLaser' },
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheUnderkeep',
  zoneId: ZoneId.TheUnderkeep,
  timelineFile: 'the_underkeep.txt',
  initData: () => {
    return {
      turretLocations: [],
      tetherMap: {},
      lastClone: undefined,
      orbLocations: [],
      marchMove: undefined,
    };
  },
  triggers: [
    // Gargant
    {
      id: 'Underkeep Gargant Chilling Chirp',
      type: 'StartsUsing',
      netRegex: { id: 'A633', source: 'Gargant', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Underkeep Gargant Almighty Racket',
      type: 'StartsUsing',
      netRegex: { id: 'A632', source: 'Gargant', capture: false },
      response: Responses.getBehind(),
    },
    // boss leaves to sneak around before dashing
    {
      id: 'Underkeep Gargant Untargetable',
      type: 'ActorControlExtra',
      netRegex: { category: '003F', param1: '1C', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Watch boss for dash',
          fr: 'Regardez la position du boss pour la ruée',
        },
      },
    },
    {
      id: 'Underkeep Gargant Sedimentary Debris',
      type: 'StartsUsing',
      netRegex: { id: 'A898', source: 'Gargant' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Underkeep Gargant Trap Jaws',
      type: 'StartsUsing',
      netRegex: { id: 'A634', source: 'Gargant' },
      response: Responses.tankBuster(),
    },
    // Soldier S0
    {
      id: 'Underkeep Soldier S0 Field of Scorn',
      type: 'StartsUsing',
      netRegex: { id: 'A653', source: 'Soldier S0', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Underkeep Soldier S0 Thunderous Slash',
      type: 'StartsUsing',
      netRegex: { id: 'A880', source: 'Soldier S0' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Underkeep Soldier S0 Ordered Fire Adds',
      type: 'MapEffect',
      netRegex: { flags: '00020001', location: Object.keys(soldierLaserLocations) },
      run: (data, matches) => data.turretLocations.push(matches.location),
    },
    {
      id: 'Underkeep Soldier S0 Ordered Fire',
      type: 'StartsUsing',
      netRegex: { id: 'A64C', source: 'Soldier S0', capture: false },
      delaySeconds: 0.5,
      alertText: (data, _matches, output) => {
        const lasers = data.turretLocations.map((i) => soldierLaserLocations[i]);
        let quad = output.unknown!();
        if (lasers.includes('N') && lasers.includes('E')) {
          quad = output.dirSW!();
        } else if (lasers.includes('N') && lasers.includes('W')) {
          quad = output.dirSE!();
        } else if (lasers.includes('S') && lasers.includes('E')) {
          quad = output.dirNW!();
        } else if (lasers.includes('S') && lasers.includes('W')) {
          quad = output.dirNE!();
        }
        return output.spread!({ quad: quad });
      },
      run: (data) => data.turretLocations = [],
      outputStrings: {
        spread: {
          en: 'Spread in ${quad} quadrant',
          fr: 'Écartez-vous dans le quandrant ${quad}',
        },
        dirNE: Outputs.dirNE,
        dirSE: Outputs.dirSE,
        dirSW: Outputs.dirSW,
        dirNW: Outputs.dirNW,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Underkeep Soldier S0 Sector Bisector Tether Collect',
      type: 'Tether',
      netRegex: { id: '0147', target: 'Soldier S0' },
      run: (data, matches) => {
        data.tetherMap[matches.sourceId] = matches.targetId;
      },
    },
    // This is the cast the soldier clones cast (to disappear I guess?) during the mechanic.
    // capture the first one and check who it was tethered to, that will be the clone cleaving.
    {
      id: 'Underkeep Soldier S0 Sector Bisector Call',
      type: 'Ability',
      netRegex: { id: ['A89B', 'A89C'], source: 'Soldier S0' },
      suppressSeconds: 8,
      promise: async (data, matches) => {
        const lastClone = data.tetherMap[matches.sourceId];
        if (lastClone === undefined) {
          console.error('Soldier Sector Bisector: could not get last clone');
          return;
        }
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(lastClone, 16)],
        })).combatants;
        if (combatants === null || combatants.length !== 1) {
          return;
        }
        data.lastClone = combatants[0];
      },
      alertText: (data, matches, output) => {
        const clone = data.lastClone;
        if (clone === undefined) {
          return;
        }
        const dirNum = Directions.hdgTo8DirNum(clone.Heading);
        //      0
        //    7   1
        //  6       2
        //    5   3
        //      4
        let safeSpot;
        if (matches.id === 'A89B') {
          // boss is cleaving left
          safeSpot = (dirNum + 2) % 8;
        } else {
          // A89C boss is cleaving right
          safeSpot = (dirNum + 8 - 2) % 8;
        }
        data.tetherMap = {};
        return output.cleave!({ dir: output[Directions.outputFrom8DirNum(safeSpot)]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cleave: {
          en: '${dir} half safe',
          fr: '${dir} moitié sûre',
        },
      },
    },
    // Valia Pira
    {
      id: 'Underkeep Valia Pira Entropic Sphere',
      type: 'StartsUsing',
      netRegex: { id: 'A61D', source: 'Valia Pira', capture: false },
      response: Responses.aoe(),
      run: (data) => {
        data.orbLocations = [];
      },
    },
    {
      id: 'Underkeep Valia Pira Electray',
      type: 'StartsUsing',
      netRegex: { id: 'A87A', source: 'Coordinate Turret', capture: false },
      condition: (data) => data.marchMove === undefined,
      suppressSeconds: 2,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge wall turrets',
          fr: 'Esquivez les tourelles murales',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Electric Field',
      type: 'StartsUsing',
      netRegex: { id: 'A617', source: 'Valia Pira', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread (all cones expand!)',
          fr: 'Écartez-vous (les cônes s\'agrandissent)',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Neutralize Front Lines',
      type: 'StartsUsing',
      netRegex: { id: 'A6F2', source: 'Valia Pira', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get behind + Spread',
          fr: 'Allez derrière + Dispersion',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Deterrent Pulse',
      type: 'StartsUsing',
      netRegex: { id: 'A62C', source: 'Valia Pira', capture: true },
      condition: (data, matches) => matches.target !== data.me,
      infoText: (data, matches, output) =>
        output.lineStackOn!({ player: data.party.member(matches.target) }),
      outputStrings: {
        lineStackOn: {
          en: 'Line stack on ${player}',
          de: 'In einer Linie auf ${player} sammeln',
          fr: 'Packez-vous en ligne sur ${player}',
          ja: '${player}に直線頭割り',
          cn: '${player} 直线分摊',
          ko: '${player} 직선 쉐어',
        },
      },
    },
    {
      id: 'Underkeep Valia Pira Coordinate March Collect',
      type: 'MapEffect',
      netRegex: {
        flags: '00020001',
        location: coordinateBitMapEffects,
      },
      run: (data, matches) => {
        data.orbLocations.push(matches.location);
      },
    },
    {
      id: 'Underkeep Valia Pira Coordinate March',
      type: 'StartsUsing',
      netRegex: { id: 'A611', source: 'Valia Pira', capture: false },
      delaySeconds: 0.5,
      durationSeconds: 9,
      alertText: (data, _matches, output) => {
        // 2 moving bits trigger "+" aoes when it collides with pink orbs.
        // boss spawns 2 or 3, which can sometimes be moved but only the initial spots matter.
        // there are several ways to dodge this but there is always a simple 2-step dodge in the inner squares.
        //        -13.5|-4.5|4.5 |13.5|
        //        |----|----|----|----|
        // -344.5 | 0D | 0E | 0F | 10 |
        //        |----|----|----|----|
        // -335.5 | 11 | 12 | 13 | 14 |
        //        |----|----x----|----|
        // -326.5 | 15 | 16 | 17 | 18 |
        //        |----|----|----|----|
        // -317.5 | 19 | 1A | 1B | 1C |
        //        |----|----|----|----|
        /*
            ((-13.5, -326.5), ( 4.5, -335.5)) ('13', '15') - Inner SW => Inner NW
            (( -4.5, -344.5), ( 4.5, -326.5)) ('0E', '17') - Inner NW => Inner NE
            ((-13.5, -326.5), (-4.5, -326.5)) ('15', '16') - Inner NW => Inner NE
            (( -4.5, -326.5), (-4.5, -317.5)) ('16', '1A') - Inner SE => Inner NE
            ((-13.5, -317.5), (-4.5, -344.5), (13.5, -344.5)) ('0E', '10', '19')
                - Inner SE => Inner NE (move after wall laser)
            ((-13.5, -326.5), (-4.5, -335.5), (13.5, -335.5)) ('12', '14', '15')
                - Inner SE => Inner NE (move after orb explosion)
            ((-13.5, -335.5), (-4.5, -326.5), (13.5, -326.5)) ('11', '16', '18')
                - Inner NE => Inner SE (move after orb explosion)
            ((-13.5, -344.5), (-4.5, -317.5), (13.5, -317.5)) ('0D', '1A', '1C')
                - Inner NE => Inner SE (move after wall laser)
         */
        const bitLocations = data.orbLocations.sort();
        if (!(bitLocations.length === 2 || bitLocations.length === 3)) {
          console.error(
            'Valia Pira CoordinateMarch: unexpected amount of bits found',
            bitLocations,
          );
          return;
        }

        const pattern = marchPatterns[bitLocations.join()];
        if (pattern === undefined) {
          console.error('Valia Pira CoordinateMarch: unknown pattern!', bitLocations);
          return output.unknown!();
        }

        data.marchMove = pattern.move !== '' ? pattern.move : undefined;
        return output.dodge!({
          first: output[pattern.first]!(),
          second: output[pattern.second]!(),
          move: pattern.move !== '' ? output[pattern.move]!() : '',
        });
      },
      run: (data) => {
        data.orbLocations = [];
      },
      outputStrings: {
        NE: Outputs.northeast,
        NW: Outputs.northwest,
        SE: Outputs.southeast,
        SW: Outputs.southwest,
        unknown: Outputs.unknown,
        dodge: {
          en: 'Inner ${first} => Inner ${second} ${move}',
          fr: 'Intérieur ${first} => Intérieur ${second} ${move}',
        },
        moveAfterLaser: {
          en: '(after wall laser)',
          fr: '(après les lasers)',
        },
        moveAfterOrb: {
          en: '(after orb explosion)',
          fr: '(après les explosions des orbes)',
        },
      },
    },
    // wall turret laser
    {
      id: 'Underkeep Valia Pira Electray Move',
      type: 'Ability',
      netRegex: { id: 'A87A', source: 'Coordinate Turret', capture: false },
      condition: (data) => data.marchMove === 'moveAfterLaser',
      response: Responses.moveAway(),
      run: (data) => data.marchMove = undefined,
    },
    // pink orb/bit explosion
    {
      id: 'Underkeep Valia Pira Enforcement Ray Move',
      type: 'Ability',
      netRegex: { id: 'A6F1', source: 'Coordinate Bit', capture: false },
      condition: (data) => data.marchMove === 'moveAfterOrb',
      response: Responses.moveAway(),
      run: (data) => data.marchMove = undefined,
    },
  ],
};

export default triggerSet;
