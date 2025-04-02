import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const mapEffectData = {
  // Deathwall dropping
  '00': {
    'location': '00',
    'flags0': '00020001',
  },

  // Desert mural painting
  '01': {
    'location': '01',
    // Desert
    'desert': '00020001',
    // Desert + Sun
    'sun': '00040004',
    // Desert + Sun + Cactus
    'cactus': '00800040',
    // Desert + Sun + Cactus + Sinkhole
    'sink': '02000100',
    // Clear the effect/return to normal
    'clear': '00080004',
    // Reset on clear
    'reset': '00200010',
  },

  // River mural painting
  '02': {
    'location': '02',
    // River
    'flags0': '00020001',
    // Muddy river
    'flags3': '00200010',
    // Thunderclouds
    'clear4': '00800040',
    // Clear the effect/return to normal
    'clear2': '00080004',
    // Reset on clear
    'flags1': '00040004',
  },

  // Arena floor
  '03': {
    'location': '03',
    // Desert
    'flags0': '00020001',
    // Bright Desert (sun DoT)
    'flags4': '02000100',
    // Reset to normal arena floor from desert
    'flags3': '00800001',
    // River arena grassy floor
    'clear1': '00080004',
    // Reset to normal arena floor from river
    'flags2': '00200010',
  },

  // Also arena floor, only for river phase
  '04': {
    'location': '04',
    // River appears
    'flags0': '00020001',
    // River red aoe indicator
    'clear2': '00800040',
    // Muddy river
    'flags1': '00200010',
    // Clear at end of phase
    'flags3': '08000004',
  },

  // no slot 05 in any of my logs???

  // 06 -> 23: Unsure, probably each one of these corresponds to a cactus during the desert cactus aoe spam
  '06': {
    'location': '06',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '07': {
    'location': '07',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '08': {
    'location': '08',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '09': {
    'location': '09',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0A': {
    'location': '0A',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0B': {
    'location': '0B',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0C': {
    'location': '0C',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0D': {
    'location': '0D',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0E': {
    'location': '0E',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '0F': {
    'location': '0F',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '10': {
    'location': '10',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '11': {
    'location': '11',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '12': {
    'location': '12',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '13': {
    'location': '13',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '14': {
    'location': '14',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '15': {
    'location': '15',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '16': {
    'location': '16',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '17': {
    'location': '17',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '18': {
    'location': '18',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '19': {
    'location': '19',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1A': {
    'location': '1A',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1B': {
    'location': '1B',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1C': {
    'location': '1C',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1D': {
    'location': '1D',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1E': {
    'location': '1E',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
  },
  '1F': {
    'location': '1F',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00200010',
  },
  '20': {
    'location': '20',
    'flags0': '00040004',
  },
  '21': {
    'location': '21',
    'flags0': '00040004',
  },
  '22': {
    'location': '22',
    'flags0': '00040004',
  },
  '23': {
    'location': '23',
    'flags0': '00020001',
    'flags1': '00040004',
    'clear2': '00080004',
    'flags3': '00200010',
  },

  // River phase rain effect
  '24': {
    'location': '24',
    // Rain on
    'flags0': '00020001',
    // Rain off
    'clear1': '00080004',
  },

  // Unknown, something to do with floor changing maybe?
  '25': {
    'location': '25',
    'flags0': '00020004',
  },
} as const;
console.assert(mapEffectData);

// Arrows, bombs, etc get their position set before the animation for the tether starts showing.
// Probably we want a general `ActorSetPos` tracking trigger for this fight.

const headMarkerData = {
  // Spread marker from Mousse Touch-up
  'spreadMarker': '008B',
  // 5-hit stack marker from Pudding Party
  'stack': '0131',
  // Tankbuster circles from Color Riot
  'tankbuster': '0156',
  // Fire stacks on healers
  'fireStack': '024C',
  // Lightning spread marker
  'lightningSpread': '024D',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM2',
  zoneId: ZoneId.AacCruiserweightM2,
  timelineFile: 'r6n.txt',
  triggers: [
    {
      id: 'R6N Mousse Mural',
      type: 'StartsUsing',
      netRegex: { id: 'A66F', source: 'Sugar Riot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R6N Pudding Party',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.stack, capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R6N Color Riot',
      type: 'StartsUsing',
      netRegex: { id: 'A670', source: 'Sugar Riot', capture: true },
      response: Responses.tankCleave(),
    },
    {
      id: 'R6N Mousse Touch-up',
      type: 'StartsUsing',
      netRegex: { id: 'A675', source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R6N Taste of Fire',
      type: 'StartsUsing',
      netRegex: { id: ['A65B', 'A65C'], source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.stacks!(),
      outputStrings: {
        stacks: {
          en: 'Healer Groups (in water)',
        },
      },
    },
    {
      id: 'R6N Taste of Thunder',
      type: 'StartsUsing',
      netRegex: { id: 'A65E', source: 'Sugar Riot', capture: false },
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.spread!(),
      outputStrings: {
        spread: {
          en: 'Spread (not in water)',
        },
      },
    },
  ],
};

export default triggerSet;
