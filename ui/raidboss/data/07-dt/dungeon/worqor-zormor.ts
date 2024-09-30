// import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, DirectionOutputIntercard, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  fluffleUpCount: number;
  ryoqorAddCleaveDir: { [combatantId: string]: DirectionOutputIntercard };
  ryoqorAddTether: string[];
  ryoqorFollowupSafeDirs: DirectionOutput8[];
  seenCrystallineStorm: boolean;
}

const ryoqorCenter = { x: -108, y: 119 };

const getFacingDir = (pos: number, hdg: number): DirectionOutputIntercard => {
  let facing: DirectionOutputIntercard = 'unknown';
  if (!(pos >= 0 && pos <= 3) || !(hdg >= 0 && hdg <= 3))
    return facing;

  if (pos + hdg === 1)
    facing = 'dirNE';
  else if (pos + hdg === 5)
    facing = 'dirSW';
  else if (pos + hdg === 3) {
    if (pos === 1 || pos === 2)
      facing = 'dirSE';
    else if (pos === 0 || pos === 3)
      facing = 'dirNW';
  }
  return facing;
};

const coldFeatOutputStrings = {
  start: {
    en: 'Start ${dir}'
  },
  followup: {
    en: 'Go ${dir}'
  },
  avoidStart: {
    en: 'Avoid cleaves from untethered adds',
  },
  avoidFollowup: {
    en: 'Avoid cleaves from remaining adds',
  },
  or: Outputs.or,
  ...Directions.outputStrings8Dir,
};

const triggerSet: TriggerSet<Data> = {
  id: 'Worqor Zormor',
  zoneId: ZoneId.WorqorZormor,
  timelineFile: 'worqor-zormor.txt',
  initData: () => ({
    fluffleUpCount: 0,
    ryoqorAddCleaveDir: {},
    ryoqorAddTether: [],
    ryoqorFollowupSafeDirs: [],
    seenCrystallineStorm: false,
  }),
  triggers: [
    // ** Ryoqor Terteh ** //
    {
      id: 'WorqorZormor Ryoqor Frosting Fracas',
      type: 'StartsUsing',
      netRegex: { id: '8DB8', source: 'Ryoqor Terteh', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'WorqorZormor Ryoqor Fluffle Up Counter',
      type: 'StartsUsing',
      netRegex: { id: '8DA9', source: 'Ryoqor Terteh', capture: false },
      run: (data) => data.fluffleUpCount++,
    },
    {
      // small adds with quarter-arena cleaves
      id: 'WorqorZormor Ryoqor Ice Scream Collect',
      type: 'StartsUsing',
      netRegex: { id: '8DAE', source: 'Rorrloh Teh' },
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const pos = Directions.xyTo4DirNum(x, y, ryoqorCenter.x, ryoqorCenter.y);
        const hdg = Directions.hdgTo4DirNum(parseFloat(matches.heading));

        const facingDir = getFacingDir(pos, hdg);
        data.ryoqorAddCleaveDir[matches.sourceId] = facingDir;
      }
    },
    {
      // large intercard adds with circle aoe cleaves
      id: 'WorqorZormor Ryoqor Frozen Swirl Collect',
      type: 'StartsUsing',
      netRegex: { id: '8DAF', source: 'Qorrloh Teh' },
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const pos = Directions.xyToIntercardDirOutput(x, y, ryoqorCenter.x, ryoqorCenter.y);
        data.ryoqorAddCleaveDir[matches.sourceId] = pos;
      },
    },
    {
      // add tethers to indicate delayed resolution
      id: 'WorqorZormor Cold Feat Tether Collect',
      type: 'Tether',
      netRegex: { id: '0110', target: 'Ryoqor Terteh' },
      run: (data, matches) => data.ryoqorAddTether.push(matches.sourceId),
    },
    {
      id: 'WorqorZormor Ryoqor Cold Feat Initial',
      type: 'StartsUsing',
      netRegex: { id: '8DAA', source: 'Ryoqor Terteh', capture: false },
      durationSeconds: 9.5,
      alertText: (data, _matches, output) => {
        // always at least 2 tethered adds
        const coldAddsIds = data.ryoqorAddTether;
        if (coldAddsIds === undefined || coldAddsIds.length < 2 === undefined)
          return output.avoidStart!();

        const coldDirs = coldAddsIds.map((id) => data.ryoqorAddCleaveDir[id] ?? 'unknown');

        let firstDirs: DirectionOutput8[] = [];
        let secondDirs: DirectionOutput8[] = [];

        if (data.fluffleUpCount === 1) {
          // 2 intercards will be safe first, then the other two
          firstDirs = [...Directions.outputIntercardDir].filter((d) => coldDirs.includes(d));
          secondDirs = [...Directions.outputIntercardDir].filter((d) => !coldDirs.includes(d));
          if (firstDirs.length !== 2 || secondDirs.length !== 2)
            return output.avoidStart!();

          data.ryoqorFollowupSafeDirs = secondDirs;
          const dirStr = firstDirs.map((d) => output[d]!()).join(output.or!());

          return output.start!({ dir: dirStr });
        } else if (data.fluffleUpCount === 2) {
          // the 2 safe intercards will alwayss be either N or S, so we can simplify
          firstDirs = [...Directions.outputIntercardDir].filter((d) => coldDirs.includes(d));
          const north: DirectionOutput8[] = ['dirNE', 'dirNW'];
          const south: DirectionOutput8[] = ['dirSE', 'dirSW'];

          if (north.every((d) => firstDirs.includes(d))) {
            data.ryoqorFollowupSafeDirs = ['dirS'];
            const dirStr = output['dirN']!();
            return output.start!({ dir: dirStr });
          } else if (south.every((d) => firstDirs.includes(d))) {
            data.ryoqorFollowupSafeDirs = ['dirN'];
            const dirStr = output['dirS']!();
            return output.start!({ dir: dirStr });
          }

          return output.avoidStart!();
        } else if (data.fluffleUpCount > 2) {
          // from this point on (loop), there are both types of adds,
          // so safe spots will always be 1 intercard => 1 intercard.
          // we can't just rely on the tethered add intercards as safe because of overlap
          const firstUnsafeDirs = [...new Set(
            Object.keys(data.ryoqorAddCleaveDir)
              .filter((id) => !coldAddsIds.includes(id))
              .map((id) => data.ryoqorAddCleaveDir[id])
              .filter((dir): dir is DirectionOutputIntercard => dir !== undefined)
          )];
          const firstSafeDirs = [...Directions.outputIntercardDir].filter((d) => !firstUnsafeDirs.includes(d));

          if (firstSafeDirs.length !== 1)
            return output.avoidStart!();

          const secondUnsafeDirs = [...new Set(
              Object.keys(data.ryoqorAddCleaveDir)
                .filter((id) => coldAddsIds.includes(id))
                .map((id) => data.ryoqorAddCleaveDir[id])
                .filter((dir): dir is DirectionOutputIntercard => dir !== undefined)
          )];
          const secondSafeDirs = [...Directions.outputIntercardDir].filter((d) => !secondUnsafeDirs.includes(d));
          if (secondSafeDirs.length === 1)
            data.ryoqorFollowupSafeDirs = secondSafeDirs;

          return output.start!({ dir: output[firstSafeDirs[0] ?? 'unknown']!() });
        }
        return output.avoidStart!();
      },
      outputStrings: coldFeatOutputStrings,
    },
    {
      id: 'WorqorZormor Ryoqor Cold Feat Followup',
      type: 'StartsUsing',
      netRegex: { id: '8DAA', source: 'Ryoqor Terteh', capture: false },
      delaySeconds: 9.5,
      alertText: (data, _matches, output) => {
        if (data.ryoqorFollowupSafeDirs.length === 0)
          return output.avoidFollowup!();

        const dirStr = data.ryoqorFollowupSafeDirs.map((d) => output[d]!()).join(output.or!());
        return output.followup!({ dir: dirStr });
      },
      run: (data) => {
        data.ryoqorAddCleaveDir = {};
        data.ryoqorAddTether = [];
        data.ryoqorFollowupSafeDirs = [];
      },
      outputStrings: coldFeatOutputStrings,
    },
    {
      id: 'WorqorZormor Ryoqor Sparkling Sprinkling',
      type: 'StartsUsing',
      netRegex: { id: '8F69', source: 'Ryoqor Terteh', capture: false },
      durationSeconds: 8,
      infoText: (_data, _matches, output) => output.avoidAndSpread!(),
      outputStrings: {
        avoidAndSpread: {
          en: 'Avoid lines => Spread after',
        },
      },
    },

    // ** Kahderyor ** //
    {
      id: 'WorqorZormor Kahderyor Wind Unbound',
      type: 'StartsUsing',
      netRegex: { id: '8DBA', source: 'Kahderyor', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'WorqorZormor Kahderyor Crystalline Storm',
      type: 'StartsUsing',
      netRegex: { id: '8DBE', source: 'Kahderyor', capture: false },
      run: (data) => data.seenCrystallineStorm = true,
    },
    {
      id: 'WorqorZormor Kahderyor Wind Shot',
      type: 'StartsUsing',
      netRegex: { id: '8DBC', source: 'Kahderyor', capture: false },
      infoText: (data, _matches, output) => {
        if (data.seenCrystallineStorm)
          return output.stackInLines!();
        return output.stackInHole!();
      },
      outputStrings: {
        stackInHole: {
          en: 'Stack donuts in hole',
        },
        stackInLines: {
          en: 'Stack donuts in safe lines',
        },
      },
    },
    {
      id: 'WorqorZormor Kahderyor Earthen Shot',
      type: 'StartsUsing',
      netRegex: { id: '8DBB', source: 'Kahderyor', capture: false },
      infoText: (data, _matches, output) => {
        if (data.seenCrystallineStorm)
          return output.spreadFromLines!();
        return output.spreadFromHole!();
      },
      outputStrings: {
        spreadFromHole: {
          en: 'Spread + Away from hole',
        },
        spreadFromLines: {
          en: 'Spread + Away from lines',
        },
      },
    },
    {
      id: 'WorqorZormor Kahderyor Eye of the Fierce',
      type: 'StartsUsing',
      netRegex: { id: '8DC9', source: 'Kahderyor', capture: false },
      response: Responses.lookAway('alert'),
    },

    // ** Gurfurlur ** //

  ],
  timelineReplace: [],
};

export default triggerSet;
