import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  brutalImpactCount: number;
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM3Savage',
  zoneId: ZoneId.AacCruiserweightM3Savage,
  timelineFile: 'r7s.txt',
  initData: () => ({
    brutalImpactCount: 6,
  }),
  triggers: [
    {
      id: 'R7S Brutal Impact',
      type: 'StartsUsing',
      netRegex: { id: 'A55B', source: 'Brute Abombinator', capture: false },
      alertText: (data, _matches, output) => output.text!({ count: data.brutalImpactCount }),
      run: (data) => data.brutalImpactCount = Math.min(data.brutalImpactCount + 1, 8),
      outputStrings: {
        text: {
          en: 'AoE x${count}',
        },
      },
    },
    {
      id: 'R7S Stoneringer',
      type: 'StartsUsing',
      netRegex: { id: ['A55D', 'A55E'], source: 'Brute Abombinator', capture: true },
      infoText: (_data, matches, output) => matches.id === 'A55D' ? output.out!() : output.in!(),
      outputStrings: {
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R7S Smash Here/There',
      type: 'StartsUsing',
      netRegex: { id: ['A55F', 'A560'], source: 'Brute Abombinator', capture: true },
      alertText: (data, matches, output) => {
        if (data.role !== 'tank') {
          const inOut = matches.id === 'A55F' ? output.in!() : output.out!();
          return output.sharedBuster!({ inOut: inOut });
        }
        const inOut = matches.id === 'A55F' ? output.out!() : output.in!();
        return output.avoidBuster!({ inOut: inOut });
      },
      outputStrings: {
        sharedBuster: {
          en: '${inOut} => Shared tankbuster',
        },
        avoidBuster: {
          en: '${inOut} => Avoid tankbuster',
        },
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R7S Impact',
      type: 'StartsUsing',
      netRegex: { id: 'A574', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.healerGroups,
      },
    },
    {
      id: 'R7S Quarry Swamp',
      type: 'StartsUsing',
      netRegex: { id: 'A575', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line of Sight boss with adds',
        },
      },
    },
    {
      id: 'R7S Explosion',
      type: 'StartsUsing',
      netRegex: { id: 'A576', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotate away from proximity marker',
        },
      },
    },
    {
      id: 'R7S Pulp Smash',
      type: 'StartsUsing',
      netRegex: { id: 'A577', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack => Protean',
        },
      },
    },
    {
      id: 'R7S Neo Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: 'A57C', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go North, big AoE + Launch',
        },
      },
    },
    {
      id: 'R7S Brutish Swing',
      type: 'StartsUsing',
      netRegex: {
        id: ['A58D', 'A58F', 'A591', 'A5A2', 'A5AB'],
        source: 'Brute Abombinator',
        capture: true,
      },
      infoText: (_data, matches, output) => {
        const id = matches.id;
        switch (id) {
          case 'A58D':
            return output.out!();
          case 'A58F':
            return output.out!();
          case 'A591':
            return output.in!();
          case 'A5A2':
            return output.inAoe!();
          case 'A5AB':
            return output.outSpread!();
          default:
            return output.unknown!();
        }
      },
      outputStrings: {
        in: {
          en: 'In at tethered wall',
        },
        out: {
          en: 'Out from tethered wall',
        },
        inAoe: {
          en: 'In at tethered wall + AoE',
        },
        outSpread: {
          en: 'Out from tethered wall + Spread, Away from front',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R7S Glower Power',
      type: 'StartsUsing',
      netRegex: { id: 'A585', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread, Away from front',
        },
      },
    },
    {
      id: 'R7S Revenge of the Vines',
      type: 'StartsUsing',
      netRegex: { id: 'A587', source: 'Brute Abombinator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R7S Thorny Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A588', source: 'Brute Abombinator', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R7S Abominable Blink',
      type: 'StartsUsing',
      netRegex: { id: 'A589', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Flare',
        },
      },
    },
    {
      id: 'R7S Killer Seeds',
      type: 'StartsUsing',
      netRegex: { id: 'A59B', source: 'Brute Abombinator', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.stackPartner,
      },
    },
    {
      id: 'R7S Powerslam',
      type: 'StartsUsing',
      netRegex: { id: 'A59E', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R7S Lashing Lariat',
      type: 'StartsUsing',
      netRegex: { id: 'A5A7', source: 'Brute Abombinator', capture: false },
      response: Responses.goRight(),
    },
    {
      id: 'R7S Slaminator',
      type: 'StartsUsing',
      netRegex: { id: 'A5AD', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Tower',
        },
      },
    },
    {
      id: 'R7S Debris Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A5B0', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get tethers',
        },
      },
    },
  ],
};

export default triggerSet;
