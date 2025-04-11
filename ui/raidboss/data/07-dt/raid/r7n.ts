import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type SwipeMech = 'in' | 'out';

export interface Data extends RaidbossData {
  swipeMechanics: SwipeMech[];
}

const mapEffectData = {
  // Starting platform shattering
  '00': {
    'location': '00',
    'flags0': '00020001',
  },

  // Second platform shattering
  '01': {
    'location': '01',
    'flags0': '00020001',
  },

  // Vines spawning on 2nd platform walls
  '02': {
    'location': '02',
    'flags0': '00020001',
  },

  // Vines spawning on 3rd platform walls
  '03': {
    'location': '03',
    'flags0': '00020001',
  },

  // Something with end of phase 2 platform, gets cleared at end of fight
  '04': {
    'location': '04',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // 05 -> 10 don't show up in my logs

  // Platform 1 vines/spores, 11 -> 14
  // There are two patterns for each set of vines, so flags might vary?
  '11': {
    'location': '11',
    // spawn
    'flags0': '00020001',
    // expand
    'flags2': '00200010',
    // clear
    'clear1': '00080004',
  },
  '12': {
    'location': '12',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '13': {
    'location': '13',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '14': {
    'location': '14',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },

  // Platform 2 vines/spores, 15 -> 18
  '15': {
    'location': '15',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '16': {
    'location': '16',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '17': {
    'location': '17',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '18': {
    'location': '18',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },

  // Platform 3 vines/spores, 19 -> 1C
  '19': {
    'location': '19',
    'flags0': '00020001',
    'flags1': '00200010',
  },
  '1A': {
    'location': '1A',
    'flags0': '00020001',
    'flags1': '00200010',
  },
  '1B': {
    'location': '1B',
    'flags0': '00020001',
    'flags1': '00200010',
  },
  '1C': {
    'location': '1C',
    'flags0': '00020001',
    'flags1': '00200010',
  },

  // 1D -> 20 not present in my log files

  // Platform 3 vines/spores, 21 -> 24
  '21': {
    'location': '21',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '22': {
    'location': '22',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '23': {
    'location': '23',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },
  '24': {
    'location': '24',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
  },

  // Stone effect during petrifaction gaze
  '25': {
    'location': '25',
    'flags0': '00020001',
  },

  // 3rd platform boss landing animation maybe?
  '26': {
    'location': '26',
    'flags0': '00020001',
  },
} as const;

console.assert(mapEffectData);

const headMarkerData = {
  // Lightning spread marker, part of Glower Power
  'spreadMarker': '006C',
  // Stack marker, part of Pulp Smash
  'stackMarker': '00A1',
  // Flare marker, part of Abominable Blink
  'flareMarker': '0147',
  // Shared tankbuster, part of Brutal Swing
  'sharedBuster': '0258',
} as const;
console.assert(headMarkerData);

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM3',
  zoneId: ZoneId.AacCruiserweightM3,
  timelineFile: 'r7n.txt',
  initData: () => ({
    swipeMechanics: [],
  }),
  triggers: [
    {
      id: 'R7N Brutal Impact',
      type: 'StartsUsing',
      netRegex: { id: 'A518', source: 'Brute Abombinator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R7N Brutal Swing Out TB',
      type: 'StartsUsing',
      netRegex: { id: 'A51C', source: 'Brute Abombinator', capture: false },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.outBuster!();

        return output.out!();
      },
      outputStrings: {
        out: Outputs.out,
        outBuster: {
          en: 'Out => Shared Tankbuster',
        },
      },
    },
    {
      id: 'R7N Brutal Swing In TB',
      type: 'StartsUsing',
      netRegex: { id: 'A51D', source: 'Brute Abombinator', capture: false },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.inBuster!();

        return output.in!();
      },
      outputStrings: {
        in: Outputs.in,
        inBuster: {
          en: 'In => Shared Tankbuster',
        },
      },
    },
    {
      id: 'R7N Pulp Smash',
      type: 'StartsUsing',
      netRegex: { id: 'A524', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.stackThenOut!(),
      outputStrings: {
        stackThenOut: {
          en: 'Stack => Out',
        },
      },
    },
    {
      id: 'R7N Quarry Swamp',
      type: 'StartsUsing',
      netRegex: { id: 'A52D', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line of Sight Boss With Corpse',
        },
      },
    },
    {
      id: 'R7N Explosion',
      type: 'StartsUsing',
      netRegex: { id: 'A52E', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotate away from proximity markers',
        },
      },
    },
    {
      id: 'R7N Neo Bombarian Special',
      type: 'StartsUsing',
      netRegex: { id: 'A52F', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go North, Damage + Launch',
        },
      },
    },
    {
      id: 'R7N Glower Power',
      type: 'StartsUsing',
      netRegex: { id: 'A546', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread, away from front',
        },
      },
    },
    {
      id: 'R7N Abominable Blink',
      type: 'StartsUsing',
      netRegex: { id: 'A542', source: 'Brute Abombinator', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Flare Marker on YOU',
        },
      },
    },
    {
      id: 'R7N Revenge of the Vines',
      type: 'StartsUsing',
      netRegex: { id: 'A543', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R7N Powerslam',
      type: 'StartsUsing',
      netRegex: { id: 'A548', source: 'Brute Abombinator', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R7N Slaminator',
      type: 'StartsUsing',
      netRegex: { id: 'A557', source: 'Brute Abombinator', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack Marker in Middle',
        },
      },
    },
  ],
};

export default triggerSet;
