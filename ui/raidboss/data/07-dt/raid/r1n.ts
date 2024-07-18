import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

// MapEffect tile map:
// 00 01 02 03
// 04 05 06 07
// 08 09 0A 0B
// 0C 0D 0E 0F
// +0x10 is a duplicate used for E&E knockback display

const mapEffectTileState = {
  'cracked': '00020001',
  'clear': '00040004',
  'broken': '00200010',
  'refreshing': '00800004', // refreshing from cracked
  'rebuilding': '01000004', // rebuilding from broken
} as const;

const mapEffectTileOverlay = {
  'clear': '00040004',
  'willBreak': '00080010',
  'willCrack': '00200004',
} as const;

const mapEffectData = {
  '00': {
    'location': '00',
    ...mapEffectTileState,
  },
  '01': {
    'location': '01',
    ...mapEffectTileState,
  },
  '02': {
    'location': '02',
    ...mapEffectTileState,
  },
  '03': {
    'location': '03',
    ...mapEffectTileState,
  },
  '04': {
    'location': '04',
    ...mapEffectTileState,
  },
  '05': {
    'location': '05',
    ...mapEffectTileState,
  },
  '06': {
    'location': '06',
    ...mapEffectTileState,
  },
  '07': {
    'location': '07',
    ...mapEffectTileState,
  },
  '08': {
    'location': '08',
    ...mapEffectTileState,
  },
  '09': {
    'location': '09',
    ...mapEffectTileState,
  },
  '0A': {
    'location': '0A',
    ...mapEffectTileState,
  },
  '0B': {
    'location': '0B',
    ...mapEffectTileState,
  },
  '0C': {
    'location': '0C',
    ...mapEffectTileState,
  },
  '0D': {
    'location': '0D',
    ...mapEffectTileState,
  },
  '0E': {
    'location': '0E',
    ...mapEffectTileState,
  },
  '0F': {
    'location': '0F',
    ...mapEffectTileState,
  },
  '10': {
    'location': '10',
    ...mapEffectTileOverlay,
  },
  '11': {
    'location': '11',
    ...mapEffectTileOverlay,
  },
  '12': {
    'location': '12',
    ...mapEffectTileOverlay,
  },
  '13': {
    'location': '13',
    ...mapEffectTileOverlay,
  },
  '14': {
    'location': '14',
    ...mapEffectTileOverlay,
  },
  '15': {
    'location': '15',
    ...mapEffectTileOverlay,
  },
  '16': {
    'location': '16',
    ...mapEffectTileOverlay,
  },
  '17': {
    'location': '17',
    ...mapEffectTileOverlay,
  },
  '18': {
    'location': '18',
    ...mapEffectTileOverlay,
  },
  '19': {
    'location': '19',
    ...mapEffectTileOverlay,
  },
  '1A': {
    'location': '1A',
    ...mapEffectTileOverlay,
  },
  '1B': {
    'location': '1B',
    ...mapEffectTileOverlay,
  },
  '1C': {
    'location': '1C',
    ...mapEffectTileOverlay,
  },
  '1D': {
    'location': '1D',
    ...mapEffectTileOverlay,
  },
  '1E': {
    'location': '1E',
    ...mapEffectTileOverlay,
  },
  '1F': {
    'location': '1F',
    ...mapEffectTileOverlay,
  },
} as const;
console.assert(mapEffectData);

const headMarkerData = {
  // Vfx Path: com_share1f
  stack: '5D',
  // Vfx Path: tank_lockon02k1
  tankBuster: 'DA',
  // Vfx Path: loc05sp_05a_se_p
  lineStack: '178',
} as const;
console.assert(headMarkerData);

// TODO:
// Mouser
// Predaceous Pounce
// Leaping Black Cat Crossing

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM1',
  zoneId: ZoneId.AacLightHeavyweightM1,
  timelineFile: 'r1n.txt',
  triggers: [
    {
      id: 'R1N One-two Paw Right Left',
      type: 'StartsUsing',
      netRegex: { id: '9309', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'R1N One-two Paw Left Right',
      type: 'StartsUsing',
      netRegex: { id: '930C', source: 'Black Cat', capture: false },
      durationSeconds: 9.5,
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'R1N Black Cat Crossing',
      type: 'StartsUsingExtra',
      netRegex: { id: '9311', capture: true },
      suppressSeconds: 5,
      infoText: (_data, matches, output) => {
        const heading = parseFloat(matches.heading);
        const dir = Directions.hdgTo8DirNum(heading);
        if (dir % 2 === 0) {
          // `dir % 2 === 0` = this is aimed at a cardinal, so intercards safe first
          return output.cardsIntercards!();
        }
        return output.intercardsCards!();
      },
      outputStrings: {
        cardsIntercards: {
          en: 'Cards => Intercards',
        },
        intercardsCards: {
          en: 'Intercards => Cards',
        },
      },
    },
    {
      id: 'R1N Elevate and Eviscerate',
      type: 'StartsUsing',
      netRegex: { id: '9317', source: ['Black Cat', 'Copy Cat'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Aim for uncracked tile',
        },
      },
    },
    {
      id: 'R1N Bloody Scratch',
      type: 'StartsUsing',
      netRegex: { id: '9340', source: 'Black Cat', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R1N Biscuit Maker',
      type: 'StartsUsing',
      netRegex: { id: '934A', source: 'Black Cat', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R1N Clawful',
      type: 'StartsUsing',
      netRegex: { id: '933C', source: 'Black Cat', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1N Overshadow',
      type: 'StartsUsing',
      netRegex: { id: '9319', source: 'Black Cat', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R1N Leaping One-two Paw West West East',
      type: 'StartsUsing',
      netRegex: { id: '931F', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'West => East at marker',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw West East West',
      type: 'StartsUsing',
      netRegex: { id: '9320', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East => West at marker',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw East West East',
      type: 'StartsUsing',
      netRegex: { id: '9321', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'West => East at marker',
        },
      },
    },
    {
      id: 'R1N Leaping One-two Paw East East West',
      type: 'StartsUsing',
      netRegex: { id: '9322', source: 'Black Cat', capture: false },
      durationSeconds: 10.5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East => West at marker',
        },
      },
    },
    {
      id: 'R1N Shockwave 931D',
      type: 'StartsUsing',
      netRegex: { id: '931D', source: 'Black Cat', capture: false },
      response: Responses.knockback(),
    },
  ],
};

export default triggerSet;
