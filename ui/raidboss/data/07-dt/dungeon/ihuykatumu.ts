import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add better (directional?) callout for Drowsie's Wallop (ivy cleaves)

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'Ihuykatumu',
  zoneId: ZoneId.Ihuykatumu,
  timelineFile: 'ihuykatumu.txt',
  triggers: [
    // ** Prime Punutiy ** //
    {
      id: 'Ihuykatumu Prime Punutiy Punutiy Press',
      type: 'StartsUsing',
      netRegex: { id: '8E8C', source: 'Prime Punutiy', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Ihuykatumu Prime Punutiy Decay',
      type: 'StartsUsing',
      netRegex: { id: '8E99', source: 'Ihuykatumu Flytrap', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get under Flytrap',
        },
      },
    },
    {
      id: 'Ihuykatumu Prime Punutiy Inhale',
      type: 'StartsUsing',
      netRegex: { id: '8E8E', source: 'Prime Punutiy', capture: false },
      durationSeconds: 10, // prolonged ground damage
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stay out of inhale',
        },
      },
    },
    {
      id: 'Ihuykatumu Prime Punutiy Shore Shaker',
      type: 'StartsUsing',
      netRegex: { id: '8EA2', source: 'Prime Punutiy', capture: false },
      durationSeconds: 6,
      response: Responses.getOutThenIn(),
    },

    // ** Drowsie ** //
    {
      id: 'Ihuykatumu Drowsie Uppercut',
      type: 'StartsUsing',
      netRegex: { id: '98DC', source: 'Drowsie' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Ihuykatumu Drowsie Wallop Small',
      type: 'StartsUsing',
      netRegex: { id: '8E7F', source: 'Ihuykatumu Ivy', capture: false },
      delaySeconds: 2,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge Ivy cleaves (small)',
        },
      },
    },
    {
      id: 'Ihuykatumu Drowsie Wallop Large',
      type: 'StartsUsing',
      netRegex: { id: '8E82', source: 'Ihuykatumu Ivy', capture: false },
      delaySeconds: 2,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge Ivy cleaves (big)',
        },
      },
    },
    {
      id: 'Ihuykatumu Drowsie Sneeze',
      type: 'StartsUsing',
      netRegex: { id: '8E7B', source: 'Drowsie', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Ihuykatumu Drowsie Flagrant Spread',
      type: 'HeadMarker',
      netRegex: { id: '008B' },
      condition: Conditions.targetIsYou(),
      response: Responses.moveAway(),
    },

    // ** Apollyon ** //
    {
      id: 'Ihuykatumu Apollyon Blade',
      type: 'StartsUsing',
      netRegex: { id: ['8DFB', '8E04'], source: 'Apollyon' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Ihuykatumu Apollyon High Wind',
      type: 'StartsUsing',
      netRegex: { id: '8DF5', source: 'Apollyon', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Ihuykatumu Apollyon Swarming Locust First Cleaves',
      type: 'Ability',
      netRegex: { id: '8DF7', source: 'Apollyon', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away on 3rd jump',
        },
      },
    },
    {
      id: 'Ihuykatumu Apollyon Swarming Locust Second Cleaves',
      type: 'Ability',
      netRegex: { id: '8DF7', source: 'Apollyon', capture: false },
      delaySeconds: 7.5,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away on 3rd jump',
        },
      },
    },
    {
      id: 'Ihuykatumu Apollyon Thunder III',
      type: 'HeadMarker',
      netRegex: { id: '006C' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Ihuykatumu Apollyon Wind Sickle',
      type: 'Ability',
      netRegex: { id: '8E05', source: 'Apollyon', capture: false },
      durationSeconds: 8,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In, then follow jump',
        },
      },
    },
    {
      id: 'Ihuykatumu Apollyon Windwhistle 1',
      type: 'Ability',
      netRegex: { id: '8E07', source: 'Apollyon', capture: false },
      delaySeconds: 7,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Whirlwind star lines',
        },
      },
    },
    {
      id: 'Ihuykatumu Apollyon Windwhistle 2',
      type: 'Ability',
      netRegex: { id: '8E07', source: 'Apollyon', capture: false },
      delaySeconds: 15,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Whirlwind star lines',
        },
      },
    },
    {
      id: 'Ihuykatumu Apollyon Windwhistle 3',
      type: 'Ability',
      netRegex: { id: '8E07', source: 'Apollyon', capture: false },
      delaySeconds: 23,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Whirlwind star lines',
        },
      },
    },
  ],
};

export default triggerSet;
