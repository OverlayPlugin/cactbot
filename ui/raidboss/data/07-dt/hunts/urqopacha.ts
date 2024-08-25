import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Kirlirger the Abhorrent (S-Rank)

type ForcedMarch = 'forward' | 'backward' | 'left' | 'right';
const effectIdToForcedMarchDir: { [id: string]: ForcedMarch } = {
  871: 'forward', // Forward March
  872: 'backward', // About Face
  873: 'left', // Left Face
  874: 'right', // Right Face
};

export interface Data extends RaidbossData {
  nechuWhisperStart?: 'behind' | 'right' | 'front';
}

const triggerSet: TriggerSet<Data> = {
  id: 'Urqopacha',
  zoneId: ZoneId.Urqopacha,
  triggers: [
    // ****** A-RANK: Nechuciho ****** //
    {
      id: 'Hunt Nechuciho Word of the Wood Single',
      type: 'StartsUsing',
      netRegex: { id: '9BC0', source: 'Nechuciho', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Nechuciho Whisper of the Wood',
      type: 'StartsUsing',
      netRegex: { id: ['9A45', '9A46', '9A47'], source: 'Nechuciho' },
      run: (data, matches) => {
        // There are three possible cast ids, each of which correspond to a fixed cleave order.
        // We can differentiate using the first safe side for each cast id.
        if (matches.id === '9A45')
          data.nechuWhisperStart = 'behind';
        else if (matches.id === '9A46')
          data.nechuWhisperStart = 'right';
        else if (matches.id === '9A47')
          data.nechuWhisperStart = 'front';
      },
    },
    {
      id: 'Hunt Nechuciho Whisper of the Wood Combo',
      type: 'StartsUsing',
      netRegex: { id: '9A48', source: 'Nechuciho', capture: false },
      durationSeconds: 14,
      infoText: (data, _matches, output) => {
        if (data.nechuWhisperStart !== undefined)
          return output[data.nechuWhisperStart]!();
        return output.dodge!();
      },
      outputStrings: {
        dodge: {
          en: 'Dodge cleaves x4',
        },
        behind: {
          en: 'Behind + Left (for 3) => Go Front',
        },
        right: {
          en: 'Right (for 2) => Left => Front',
        },
        front: {
          en: 'Front + Left (stay)',
        },
      },
    },
    {
      id: 'Hunt Nechuciho Whisper of the Wood Behind Reminder',
      type: 'Ability',
      netRegex: { id: '9A48', source: 'Nechuciho', capture: false },
      condition: (data) => data.nechuWhisperStart === 'behind',
      delaySeconds: 4.1, // timed to appear right as the 3rd cleave is finishing
      alertText: (_data, _matches, output) => output.front!(),
      outputStrings: {
        front: Outputs.front,
      },
    },
    {
      id: 'Hunt Nechuciho Whisper of the Wood Right Reminder',
      type: 'Ability',
      netRegex: { id: '9A48', source: 'Nechuciho', capture: false },
      condition: (data) => data.nechuWhisperStart === 'right',
      delaySeconds: 2.1, // timed to appear right as the 2nd cleave is finishing
      alertText: (_data, _matches, output) => output.leftFront!(),
      outputStrings: {
        leftFront: {
          en: 'Left => Front',
        },
      },
    },
    {
      id: 'Hunt Nechuciho Level 5 Death Sentence',
      type: 'StartsUsing',
      netRegex: { id: '9A44', source: 'Nechuciho' },
      condition: (data) => data.CanSilence(),
      response: Responses.interrupt(),
    },
    {
      id: 'Hunt Nechuciho Sentinel Roar',
      type: 'StartsUsing',
      netRegex: { id: '9A43', source: 'Nechuciho', capture: false },
      response: Responses.aoe(),
    },

    // ****** A-RANK: Queen Hawk ****** //
    {
      id: 'Hunt Queen Hawk Bee Be Gone',
      type: 'StartsUsing',
      netRegex: { id: '9A3A', source: 'Queen Hawk', capture: false },
      durationSeconds: 13,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out + Stay Out',
        },
      },
    },
    {
      id: 'Hunt Queen Hawk Bee Be Here',
      type: 'StartsUsing',
      netRegex: { id: '9A3B', source: 'Queen Hawk', capture: false },
      durationSeconds: 13,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In + Stay In',
        },
      },
    },
    {
      id: 'Hunt Queen Hawk Resonant Buzz',
      type: 'StartsUsing',
      netRegex: { id: '9A3E', source: 'Queen Hawk', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Queen Hawk Forced March',
      type: 'GainsEffect',
      netRegex: { effectId: ['871', '872', '873', '874'], source: 'Queen Hawk' },
      condition: Conditions.targetIsYou(),
      durationSeconds: 8,
      infoText: (_data, matches, output) => {
        const dir = effectIdToForcedMarchDir[matches.effectId];
        if (dir !== undefined)
          return output[dir]!();
      },
      outputStrings: {
        forward: {
          en: 'Forced March: Forward',
        },
        backward: {
          en: 'Forced March: Backward',
        },
        left: {
          en: 'Forced March: Left',
        },
        right: {
          en: 'Forced March: Right',
        },
      },
    },
    {
      id: 'Hunt Queen Hawk Straight Spindle',
      type: 'StartsUsing',
      netRegex: { id: '9A42', source: 'Queen Hawk', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Hunt Queen Hawk Frenzied Sting',
      type: 'StartsUsing',
      netRegex: { id: '9A41', source: 'Queen Hawk' },
      response: Responses.tankBuster(),
    },
    // ****** S-RANK: Kirlirger the Abhorrent ****** //
  ],
  timelineReplace: [],
};

export default triggerSet;
