import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Neyoozoteel (S-Rank)
// TODO: Rrax Triplicate Reflex - add individual side calls (or a swap call when sides change?)

type WingbladeSafe = 'left' | 'right';

export interface Data extends RaidbossData {
  rraxTriplicateSafe: WingbladeSafe[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'YakTel',
  zoneId: ZoneId.YakTel,
  initData: () => ({
    rraxTriplicateSafe: [],
  }),
  triggers: [
    // ****** A-RANK: Starcrier ****** //
    {
      id: 'Hunt Starcrier Wingsbreadth Winds',
      type: 'StartsUsing',
      netRegex: { id: '90AE', source: 'Starcrier', capture: false },
      response: Responses.outOfMelee('alert'),
    },
    {
      id: 'Hunt Starcrier Stormwall Winds',
      type: 'StartsUsing',
      netRegex: { id: '90AF', source: 'Starcrier', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Hunt Starcrier Aero IV',
      type: 'StartsUsing',
      netRegex: { id: '912B', source: 'Starcrier', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Starcrier Swiftwind Serenade',
      type: 'StartsUsing',
      netRegex: { id: '91B9', source: 'Starcrier', capture: false },
      response: Responses.awayFromFront(),
    },

    // ****** A-RANK: Rrax Yity'a ****** //
    {
      id: 'Hunt Rrax Laughing Leap',
      type: 'StartsUsing',
      netRegex: { id: '91FC', source: 'Rrax Yity\'a', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Hunt Rrax Right Wingblade',
      type: 'StartsUsing',
      netRegex: { id: ['912C', '912E'], source: 'Rrax Yity\'a', capture: false },
      alertText: (_data, _matches, output) => output.left!(),
      run: (data) => data.rraxTriplicateSafe.push('left'),
      outputStrings: {
        left: Outputs.left,
      },
    },
    {
      id: 'Hunt Rrax Left Wingblade',
      type: 'StartsUsing',
      netRegex: { id: ['912D', '912F'], source: 'Rrax Yity\'a', capture: false },
      alertText: (_data, _matches, output) => output.right!(),
      run: (data) => data.rraxTriplicateSafe.push('right'),
      outputStrings: {
        right: Outputs.right,
      },
    },
    {
      id: 'Hunt Rrax Triplicate Reflex',
      type: 'StartsUsing',
      netRegex: { id: '9132', source: 'Rrax Yity\'a', capture: false },
      durationSeconds: 11.5,
      alertText: (data, _matches, output) => {
        const safe = data.rraxTriplicateSafe;
        if (safe.length !== 3)
          return output.unknown!();
        return safe.map((spot) => output[spot]!()).join(output.next!());
      },
      run: (data) => data.rraxTriplicateSafe = [],
      outputStrings: {
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
        next: Outputs.next,
      },
    },
    // ****** S-RANK: Neyoozoteel ****** //
  ],
  timelineReplace: [],
};

export default triggerSet;
