import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputIntercard, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  chirurgeonSpots: chirurgeonCoords[];
  playerExecutionerId?: string;
  seenFirstStorm: boolean;
  seenFirstBombardment: boolean;
  safeTerror?: PluginCombatantState;
  orthoKerauNorth?: boolean;
  orthoKerauSouth?: boolean;
  kerauDiagSafe: DirectionOutputIntercard[];
}

type chirurgeonCoords = {
  x: number;
  y: number;
};

// List out the safe spots for diagonals.
const diagPositiveSafe: DirectionOutputIntercard[] = ['dirNW', 'dirSE'];
const diagNegativeSafe: DirectionOutputIntercard[] = ['dirSW', 'dirNE'];

const findNorthTerror = (terrors: PluginCombatantState[]): PluginCombatantState | undefined => {
  return terrors.filter((terror) => {
    // For all Bombardments, one of the north corners will have a single add present,
    // at one of (-10, -13) (10, -13) (-17, -12) (17, -12).
    // The corresponding -X point will have five adds surrounding it.
    // We can consistently identify a north safespot by finding this single add.

    // Only X gets run through abs(), since we are only calling north safe.
    const terX = Math.round(Math.abs(terror.PosX));
    const terY = Math.round(terror.PosY);
    const x1 = 10;
    const y1 = -13;
    const x2 = 17;
    const y2 = -12;
    return (terX === x1 && terY === y1) || (terX === x2 && terY === y2);
  })[0];
};

const triggerSet: TriggerSet<Data> = {
  id: 'themesoterminal',
  zoneId: ZoneId.TheMesoTerminal,
  timelineFile: 'meso-terminal.txt',
  initData: () => {
    return {
      chirurgeonSpots: [],
      playerExecutionerId: undefined,
      seenFirstStorm: false,
      seenFirstBombardment: false,
      impressionActive: false,
      safeTerror: undefined,
      orthoKerauNorth: undefined,
      orthoKerauSouth: undefined,
      kerauDiagSafe: [],
    };
  },
  triggers: [
    {
      id: 'Meso Terminal Chirurgeon Medicine Field',
      type: 'StartsUsing',
      netRegex: { id: 'AB16', source: 'Chirurgeon General', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Chirurgeon Biochemical Front',
      type: 'StartsUsing',
      netRegex: { id: 'AB1A', source: 'Chirurgeon General', capture: false },
      response: Responses.getBehind(),
    },
    {
      // The origin for the Chirurgeon is (270,12).
      // Aerosol can be cast at four cardinal points,
      // each ten units along an axis from the origin.
      // (270,22), (280,12), (270,2),(260,12)
      id: 'Meso Terminal Chirurgeon Pungent Aerosol',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB1F', capture: true },
      infoText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const kbNum = Directions.xyTo4DirNum(x, y, 270, 12);
        const safeDir = Directions.outputFromCardinalNum(kbNum);
        return output.knockbackFrom!({ dir: output[safeDir]!() });
      },
      outputStrings: {
        knockbackFrom: {
          en: 'Knockback from ${dir}',
        },
        dirN: Outputs.north,
        dirE: Outputs.east,
        dirS: Outputs.south,
        dirW: Outputs.west,
        unknown: Outputs.unknown,
      },
    },
    {
      // AB1E is the big Sterile Sphere
      // AB1D is small
      id: 'Meso Terminal Chirurgeon Sterile Sphere Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB1D', capture: true },
      run: (data, matches) => {
        const location = {
          x: Math.round(parseFloat(matches.x)),
          y: Math.round(parseFloat(matches.y)),
        };
        data.chirurgeonSpots.push(location);
      },
    },
    {
      id: 'Meso Terminal Chirurgeon Sterile Sphere Call',
      type: 'StartsUsing',
      netRegex: { id: 'AB1D', source: 'Chirurgeon General', capture: false },
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (!data.chirurgeonSpots[0] || !data.chirurgeonSpots[1])
          return;
        const spot1 = data.chirurgeonSpots[0];
        const spot2 = data.chirurgeonSpots[1];
        // Both spheres east or both west.
        // X value under 270 means east safe.
        if (spot1.x === spot2.x) {
          if (spot1.x < 270)
            return output.goEast!();
          return output.goWest!();
        }
        // Both spheres north or south.
        // Y values increase from north to south.
        // Y value over 12 means north safe.
        if (spot1.y === spot2.y) {
          if (spot1.y > 12)
            return output.goNorth!();
          return output.goSouth!();
        }
        return output.unknown!();
      },
      run: (data) => data.chirurgeonSpots = [],
      outputStrings: {
        goNorth: Outputs.north,
        goEast: Outputs.east,
        goSouth: Outputs.south,
        goWest: Outputs.west,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Meso Terminal Chirurgeon Concentrated Dose',
      type: 'StartsUsing',
      netRegex: { id: 'AB17', source: 'Chirurgeon General', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Chirurgeon Poison',
      type: 'GainsEffect',
      netRegex: { effectId: '838', source: 'Chirurgeon General', capture: true },
      condition: (data) => data.CanCleanse(),
      infoText: (_data, matches, output) => output.cleanse!({ target: matches.target }),
      outputStrings: {
        cleanse: {
          en: 'Cleanse ${target}',
        },
      },
    },
    {
      id: 'Meso Terminal Executioners Shackles Of Fate Tracking',
      type: 'StartsUsing',
      netRegex: { id: 'AA3D', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => data.playerExecutionerId = matches.sourceId,
    },
    {
      id: 'Meso Terminal Executioners Head-Splitting Roar',
      type: 'StartsUsing',
      netRegex: { id: 'AA3B', source: 'Hooded Headsman', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Executioners Chopping Block',
      type: 'StartsUsing',
      netRegex: { id: 'AA4B', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.getOut(),
    },
    {
      id: 'Meso Terminal Executioners Execution Wheel',
      type: 'StartsUsing',
      netRegex: { id: 'AA4C', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.getIn(),
    },
    {
      id: 'Meso Terminal Executioners Flaying Flail',
      type: 'Ability',
      netRegex: { id: 'AA47', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      delaySeconds: 1, // Wait for visuals
      infoText: (_data, _matches, output) => output.avoidFlails!(),
      outputStrings: {
        avoidFlails: {
          en: 'Away from flails',
        },
      },
    },
    {
      id: 'Meso Terminal Executioners Hellmaker Adds',
      type: 'AddedCombatant',
      netRegex: { npcBaseId: '48D2', capture: false },
      condition: (data) => data.role === 'dps',
      suppressSeconds: 1,
      response: Responses.killAdds(),
    },
    {
      id: 'Meso Terminal Executioners Will Breaker',
      type: 'StartsUsing',
      netRegex: { id: 'AF38', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.interruptIfPossible(),
    },
    {
      id: 'Meso Terminal Executioners Relentless Torment',
      type: 'StartsUsing',
      netRegex: { id: 'AA45', capture: true },
      condition: (data, matches) => data.playerExecutionerId === matches.sourceId,
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Executioners Death Penalty',
      type: 'GainsEffect',
      netRegex: { effectId: '11F2', capture: true },
      condition: (data) => data.CanCleanse(),
      alarmText: (_data, matches, output) => output.cleanseDoom!({ target: matches.target }),
      outputStrings: {
        cleanseDoom: {
          en: 'Cleanse ${target}',
        },
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Recollection',
      type: 'StartsUsing',
      netRegex: { id: 'AB31', source: 'Immortal Remains', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Meso Terminal Immortal Remains Memory Of The Storm',
      type: 'StartsUsing',
      netRegex: { id: 'AB2D', source: 'Immortal Remains', capture: false },
      response: Responses.stackMarker(),
      run: (data) => data.seenFirstStorm = true,
    },
    {
      id: 'Meso Terminal Immortal Remains Memory Of The Pyre',
      type: 'StartsUsing',
      netRegex: { id: 'AB30', source: 'Immortal Remains', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Meso Terminal Immortal Remains Turmoil Left',
      type: 'Ability',
      netRegex: { id: 'AB26', source: 'Immortal Remains', capture: false },
      response: Responses.goEast(),
    },
    {
      id: 'Meso Terminal Immortal Remains Turmoil Right',
      type: 'Ability',
      netRegex: { id: 'AB27', source: 'Immortal Remains', capture: false },
      response: Responses.goWest(),
    },

    // There aren't a lot of good indications where the Bombardments will go.
    // The mechanic places the Preserved Terror adds where the tethers are,
    // then does a very short Bombardment cast on the add locations.
    // If there is one add, it's a small circle, AB23.
    // If there are five adds, it's a large circle, AB24,
    // centered equidistant from its five adds.
    // On the second and later Bombardments,
    // we can trigger off the AB29 Impression cast, but we have nothing like that for the first.
    // The best case for finding the locations is to find all the Preserved Terrors,
    // then filter down which one is in a safe position in front.
    {
      id: 'Meso Terminal Immortal Remains First Bombardment Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '9F8', capture: false },
      // The Preserved Terror adds are used for more mechanics than just Bombardment.
      // Unfortunately, we don't have any good way to separate out
      // which ones are used for which mechanics.
      // The tethers for Bombardment are also used on Electray
      // and Keraunography, so we have to be very careful how we find the adds.
      condition: (data) => {
        // The first Memory of the Storm cast immediately precedes Bombardment.
        return data.seenFirstStorm && !data.seenFirstBombardment;
      },
      suppressSeconds: 1,
      promise: async (data) => {
        const callData = await callOverlayHandler({
          call: 'getCombatants',
        });
        if (!callData.combatants.length)
          return;
        const terrors = callData.combatants.filter((actor) => actor.BNpcID === 18624);
        data.safeTerror = findNorthTerror(terrors);
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Bombardment No Knockback',
      type: 'GainsEffect',
      netRegex: { effectId: '9F8', capture: false },
      condition: (data) => data.seenFirstStorm && !data.seenFirstBombardment,
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.safeTerror === undefined)
          return output.unknown!();
        const safeDir = data.safeTerror.PosX < 0 ? 'west' : 'east';
        return output.staticBombardment!({ safe: output[safeDir]!() });
      },
      run: (data) => {
        data.seenFirstBombardment = true;
        data.safeTerror = undefined;
      },
      outputStrings: {
        staticBombardment: {
          en: 'Go ${safe}; Avoid small AoE',
        },
        west: Outputs.west,
        east: Outputs.east,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Bombardment Knockback',
      type: 'Ability',
      netRegex: { id: 'AB29', source: 'Immortal Remains', capture: false }, // Impression
      condition: (data) => data.seenFirstBombardment,
      delaySeconds: 1,
      suppressSeconds: 1,
      promise: async (data) => {
        const callData = await callOverlayHandler({
          call: 'getCombatants',
        });
        if (!callData.combatants.length)
          return;
        const terrors = callData.combatants.filter((actor) => actor.BNpcID === 18624);
        data.safeTerror = findNorthTerror(terrors);
      },
      alertText: (data, _matches, output) => {
        if (data.safeTerror === undefined)
          return output.unknown!();
        const safeDir = data.safeTerror.PosX < 0 ? 'northwest' : 'northeast';
        return output.knockbackBombardment!({ safe: output[safeDir]!() });
      },
      run: (data) => {
        data.safeTerror = undefined;
      },
      outputStrings: {
        knockbackBombardment: {
          en: 'Knockback to ${safe}; Avoid AoE',
        },
        northwest: Outputs.northwest,
        northeast: Outputs.northeast,
        unknown: Outputs.unknown,
      },
    },
    {
      // One Keraunography laser is always diagonal,
      // one is always orthogonal.
      // In all cases but front horizontal,
      // orthogonal lasers leave at least a small uptime safespot.
      id: 'Meso Terminal Immortal Remains Keraunography Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'AB25', capture: true },
      run: (data, matches) => {
        const headingNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        // Odd heading numbers are diagonal.
        if (headingNum % 2 === 1) {
          // Check which diagonal we're working with.
          // 1 and 5 are equivalent, as are 3 and 7.
          // In practice, only 5 and 3 will ever be seen,
          // since the diagonals always originate from the north end of the arena.
          const diagIsPositive = (headingNum + 4) % 4 === 1;
          const safeDiagonalSpots = diagIsPositive ? diagPositiveSafe : diagNegativeSafe;
          data.kerauDiagSafe = safeDiagonalSpots;
        } else if (headingNum % 4 === 0) { // Vertical
          // As with the diagonals, in practice we will only ever see a 0 heading number.
          data.orthoKerauNorth = false;
          data.orthoKerauSouth = false;
        } else { // Horizontal
          // It is possible to see both 2 and 6 in practice,
          // but it doesn't matter much.
          const isNorth = parseFloat(matches.y) < 0;
          data.orthoKerauNorth = isNorth;
          data.orthoKerauSouth = !isNorth;
        }
      },
    },
    {
      id: 'Meso Terminal Immortal Remains Keraunography Call',
      type: 'StartsUsing',
      netRegex: { id: 'AB25', source: 'Immortal Remains', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.orthoKerauNorth === undefined || data.orthoKerauSouth === undefined)
          return;
        if (data.orthoKerauNorth) {
          // If the orthogonal laser is horizontal north,
          // the only safespots are outside the hitbox,
          // but still close enough to be handled with a GCD roll.
          const safeDir = data.kerauDiagSafe.filter((dir) => dir === 'dirSW' || dir === 'dirSE')[0];
          if (safeDir !== undefined)
            return output[safeDir]!();
          return output.unknown!();
        } else if (data.orthoKerauSouth) {
          // If the orthogonal laser is horizontal south,
          // the safespot is completely free in front.
          const safeDir = data.kerauDiagSafe.filter((dir) => dir === 'dirNW' || dir === 'dirNE')[0];
          if (safeDir !== undefined)
            return output[safeDir]!();
          return output.unknown!();
        }

        // If the orthogonal laser is vertical,
        // there is a tiny safespot in front,
        // as well as a large one on the same side south of the diagonal,
        // just outside melee range.
        const safeNW = data.kerauDiagSafe.includes('dirSW');
        if (safeNW)
          return output.leanLeft!();
        return output.leanRight!();
      },
      run: (data) => {
        data.kerauDiagSafe = [];
        data.orthoKerauNorth = undefined;
        data.orthoKerauSouth = undefined;
      },
      outputStrings: {
        leanLeft: {
          en: 'Front + Lean Left; or Southwest',
        },
        leanRight: {
          en: 'Front + Lean Right; or Southeast',
        },
        dirNW: Outputs.northwest,
        dirNE: Outputs.northeast,
        dirSW: Outputs.southwest,
        dirSE: Outputs.southeast,
        unknown: Outputs.unknown,
      },
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
