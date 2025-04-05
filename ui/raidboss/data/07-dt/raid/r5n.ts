import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const mapEffectData = {
  // Deathwall turning off after clear?
  '00': {
    'location': '00',
    'clear0': '00080004',
  },

  // Maybe the disco balls?
  '01': {
    'location': '01',
    'flags0': '00020001',
    'flags1': '00200010',
    'clear2': '00800040',
    'flags3': '01000004',
    'flags4': '02000004',
  },

  // Something to do with floor tiles darkening/lines glowing?
  '02': {
    'location': '02',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Checkerboard tiles
  '03': {
    'location': '03',
    // NW active/dangerous
    'flags0': '00020001',
    // NW exploding
    'clear1': '00080004',
    // NE active/dangerous
    'flags2': '00200010',
    // NE exploding
    'flags3': '00800004',
  },

  // exasquares row 1 danger indicator
  '04': {
    'location': '04',
    'flags0': '00020002',
    // clear/reset
    'clear1': '00080004',
    // 4th column "safe"
    'flags2': '00100010',
    'flags3': '00200020',
    'flags4': '20002000',
    // 6th column "safe"
    'flags5': '40004000',
    'flags6': '80008000',
  },

  // First row explosions
  '05': {
    'location': '05',
    'flags0': '00020004',
    // 4th column not exploding
    'flags1': '00100004',
    'flags2': '00200004',
    // 6th column not exploding
    'flags3': '00400004',
    'flags4': '00800004',
  },

  // 06 -> 0C are rows 2 -> 8
  '06': {
    'location': '06',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '07': {
    'location': '07',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '08': {
    'location': '08',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '09': {
    'location': '09',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '0A': {
    'location': '0A',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '0B': {
    'location': '0B',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  '0C': {
    'location': '0C',
    'flags0': '00020004',
    'flags1': '00100004',
    'flags2': '00200004',
    'flags3': '00400004',
    'flags4': '00800004',
  },

  // 0D -> 14 are stage spotlights, west to east
  '0D': {
    'location': '0D',
    // Spotlight on
    'flags0': '00200010',
    // Spotlight off
    'flags1': '00800004',
  },

  '0E': {
    'location': '0E',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '0F': {
    'location': '0F',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '10': {
    'location': '10',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '11': {
    'location': '11',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '12': {
    'location': '12',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '13': {
    'location': '13',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  '14': {
    'location': '14',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  // Frogtourage spotlight, N edge between 3rd and 4th tile
  '15': {
    'location': '15',
    // On
    'flags0': '00020001',
    // Off
    'clear1': '00080004',
  },

  // Frogtourage spotlight, N edge between 5th and 6th tile
  '16': {
    'location': '16',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, S edge between 3rd and 4th tile
  '17': {
    'location': '17',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, S edge between 5th and 6th tile
  '18': {
    'location': '18',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, W edge between 3rd and 4th tile
  '19': {
    'location': '19',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, W edge between 5th and 6th tile
  '1A': {
    'location': '1A',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, E edge between 3rd and 4th tile
  '1B': {
    'location': '1B',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Frogtourage spotlight, E edge between 5th and 6th tile
  '1C': {
    'location': '1C',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Something with Frogtourage lines/boxes, indicators
  '1D': {
    'location': '1D',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Something with Frogtourage lines/boxes, indicators
  '1E': {
    'location': '1E',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  // Something with Frogtourage lines/boxes, indicators
  '1F': {
    'location': '1F',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
    'flags3': '00800004',
  },

  // Something with Frogtourage lines/boxes, indicators
  '20': {
    'location': '20',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  // Something with Frogtourage lines/boxes, explosions
  '21': {
    'location': '21',
    'flags0': '00200010',
    'flags1': '00800004',
  },

  // Something with Frogtourage lines/boxes, explosions
  '22': {
    'location': '22',
    'flags0': '00020001',
    'clear1': '00080004',
  },

  // Something with Frogtourage lines/boxes, explosions
  '23': {
    'location': '23',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
    'flags3': '00800004',
  },

  // Something with Frogtourage lines/boxes, explosions
  '24': {
    'location': '24',
    'flags0': '00020001',
    'clear1': '00080004',
    'flags2': '00200010',
    'flags3': '00800004',
  },

  // In the Spotlight/Burn Baby Burn spotlights becoming active?
  '26': {
    'location': '26',
    'flags0': '00020004',
  },
} as const;
console.assert(mapEffectData);

const headMarkerData = {
  'stackMarker': '013D',
  'spread': '0178',
  'tankLaser': '01D7',
  'danceCountdown': '0259',
} as const;
console.assert(headMarkerData);

export interface Data extends RaidbossData {
  deepCutTargets: string[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM1',
  zoneId: ZoneId.AacCruiserweightM1,
  timelineFile: 'r5n.txt',
  initData: () => ({
    deepCutTargets: [],
  }),
  triggers: [
    {
      id: 'R5N Do the Hustle West Safe',
      type: 'StartsUsing',
      netRegex: { id: 'A6C9', source: 'Dancing Green', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.west,
      },
    },
    {
      id: 'R5N Do the Hustle East Safe',
      type: 'StartsUsing',
      netRegex: { id: 'A6CA', source: 'Dancing Green', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: Outputs.east,
      },
    },
    {
      // cast is self-targeted on boss
      id: 'R5N Deep Cut',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankLaser, capture: true },
      infoText: (data, matches, output) => {
        data.deepCutTargets.push(matches.target);
        if (data.deepCutTargets.length < 2)
          return;

        if (data.deepCutTargets.includes(data.me))
          return output.cleaveOnYou!();
        return output.avoidCleave!();
      },
      run: (data) => {
        if (data.deepCutTargets.length >= 2)
          data.deepCutTargets = [];
      },
      outputStrings: {
        cleaveOnYou: Outputs.tankCleaveOnYou,
        avoidCleave: Outputs.avoidTankCleave,
      },
    },
    {
      id: 'R5N Full Beat',
      type: 'StartsUsing',
      netRegex: { id: 'A6FF', source: 'Dancing Green', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R5N Disco Infernal',
      type: 'StartsUsing',
      netRegex: { id: 'A6F9', source: 'Dancing Green', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R5N Celebrate Good Times',
      type: 'StartsUsing',
      netRegex: { id: 'A6C8', source: 'Dancing Green', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R5N Eighth Beats',
      type: 'StartsUsing',
      netRegex: { id: ['A702', 'A703'], source: 'Dancing Green', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
  ],
};

export default triggerSet;
