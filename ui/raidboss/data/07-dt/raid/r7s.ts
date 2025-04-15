import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// @TODO:
// - Sinister Seeds - puddles
// - Impact - healer stacks
// - add interrupt calls?
// - Hurricane Force - add enrage

const headMarkerData = {
  // Sinster Seeds marker, phase 1
  'seedMarker1': '0177',
  // Sinster Seeds marker, phase 2
  'seedMarker2': '01D2',
  // Pulp Smash stack marker
  'stackMarker': '00A1',
  // Abominable Blink flare marker
  'flareMarker': '0147',
} as const;

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
      infoText: (data, _matches, output) => output.text!({ count: data.brutalImpactCount }),
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
        const inOut = matches.id === 'A560' ? output.in!() : output.out!();
        return output.avoidBuster!({ inOut: inOut });
      },
      outputStrings: {
        sharedBuster: {
          en: 'Tanks ${inOut} => Shared tankbuster',
        },
        avoidBuster: {
          en: 'Party ${inOut} => Avoid tankbuster',
        },
        in: Outputs.in,
        out: Outputs.out,
      },
    },
    {
      id: 'R7S Sinister Seeds',
      type: 'StartsUsing',
      netRegex: { id: ['A56E', 'A598'], source: 'Brute Abombinator', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Drop seed',
        },
      },
    },
    // {
    //   instant, not casted
    //   id: 'R7S Impact',
    //   type: 'StartsUsing',
    //   netRegex: { id: 'A574', source: 'Brute Abombinator', capture: false },
    //   alertText: (_data, _matches, output) => output.text!(),
    //   outputStrings: {
    //     text: Outputs.healerGroups,
    //   },
    // },
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
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.stackMarker, capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Stack on ${target} => Out + Protean',
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
            return output.in!();
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
      type: 'Tether',
      netRegex: { id: '0152', capture: true },
      infoText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Tank tether on ${target}',
        },
      },
    },
    {
      id: 'R7S Abominable Blink',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.flareMarker, capture: true },
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.flare!();
        return output.avoidFlare!();
      },
      outputStrings: {
        avoidFlare: {
          en: 'Away from Flare',
        },
        flare: {
          en: 'Flare on YOU',
        },
      },
    },
    {
      id: 'R7S Demolition Deathmatch',
      type: 'StartsUsing',
      netRegex: { id: 'A596', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get tethers',
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
