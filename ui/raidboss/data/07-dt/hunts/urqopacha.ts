import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

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
          de: 'Weiche Cleaves aus x4',
          cn: '躲避顺劈 x4',
          ko: '장판 피하기 x4',
        },
        behind: {
          en: 'Behind + Left (for 3) => Go Front',
          de: 'Hinten + Links (für 3) => Geh nach Vorne',
          cn: '后 + 左(3次) => 前',
          ko: '뒤 + 왼쪽 (3번) => 앞으로',
        },
        right: {
          en: 'Right (for 2) => Left => Front',
          de: 'Rechts (für 2) => Links => Vorne',
          cn: '右(2次) => 左 => 前',
          ko: '오른쪽 (2번) => 왼쪽 => 앞으로',
        },
        front: {
          en: 'Front + Left (stay)',
          de: 'Vorne + Links (bleib stehen)',
          cn: '前 + 左 (不动)',
          ko: '앞으로 + 왼쪽 (그대로)',
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
          de: 'Links => Vorne',
          cn: '左 => 前',
          ko: '왼쪽 => 앞',
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
          de: 'Raus + Bleib drausen',
          cn: '远离 + 保持远离',
          ko: '밖으로 + 계속 밖에 있기',
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
          de: 'Rein + Bleib drinnen',
          cn: '靠近 + 保持靠近',
          ko: '안으로 + 계속 안에 있기',
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
          de: 'Geistlenkung: vorwärts',
          cn: '强制移动: 前',
          ko: '강제이동: 앞',
        },
        backward: {
          en: 'Forced March: Backward',
          de: 'Geistlenkung: rückwärts',
          cn: '强制移动: 后',
          ko: '강제이동: 뒤',
        },
        left: {
          en: 'Forced March: Left',
          de: 'Geistlenkung: links',
          cn: '强制移动: 左',
          ko: '강제이동: 왼쪽',
        },
        right: {
          en: 'Forced March: Right',
          de: 'Geistlenkung: rechts',
          cn: '强制移动: 右',
          ko: '강제이동: 오른쪽',
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
    {
      id: 'Hunt Kirlirger Fullmoon Fury',
      type: 'StartsUsing',
      netRegex: { id: '9A28', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Kirlirger Discordant Moon',
      type: 'StartsUsing',
      netRegex: { id: '9A29', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'Hunt Kirlirger Fighter\'s Flourish',
      type: 'StartsUsing',
      netRegex: { id: '9A2A', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Kirlirger Discordant Flourish',
      type: 'StartsUsing',
      netRegex: { id: '9A2B', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.goFront('alert'),
    },
    {
      id: 'Hunt Kirlirger Enervating Gloom',
      type: 'StartsUsing',
      netRegex: { id: '9A38', source: 'Kirlirger the Abhorrent' },
      response: Responses.stackMarkerOn('info'),
    },
    {
      id: 'Hunt Kirlirger Flying Fist',
      type: 'StartsUsing',
      netRegex: { id: '9A64', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Hunt Kirlirger Odious Uproar',
      type: 'StartsUsing',
      netRegex: { id: '9A39', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.aoe(),
    },
    // After the opening trio, Kirlirger will do 3 casts of Honor's Accord or Dishonor's Accord.
    // They each apply the same Honor's Accord buff, but the original cast order determines
    // whether his next three casts will do the correct attack or the opposite attack (Kefka style).
    // We don't need to track the casts or buffs -- we can just use cast ids.
    {
      id: 'Hunt Kirlirger Fullmoon Fury Honor',
      type: 'StartsUsing',
      netRegex: { id: '9A23', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Kirlirger Fullmoon Fury Dishonor',
      type: 'StartsUsing',
      netRegex: { id: '9A27', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'Hunt Kirlirger Discordant Moon Honor',
      type: 'StartsUsing',
      netRegex: { id: '9BC3', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'Hunt Kirlirger Discordant Moon Dishonor',
      type: 'StartsUsing',
      netRegex: { id: '9A3C', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Kirlirger Fighter\'s Flourish Honor',
      type: 'StartsUsing',
      netRegex: { id: '9A31', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Kirlirger Fighter\'s Flourish Dishonor',
      type: 'StartsUsing',
      netRegex: { id: '9A35', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.goFront('alert'),
    },
    {
      id: 'Hunt Kirlirger Discordant Flourish Honor',
      type: 'StartsUsing',
      netRegex: { id: '9BC5', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.goFront('alert'),
    },
    {
      id: 'Hunt Kirlirger Discordant Flourish Dishonor',
      type: 'StartsUsing',
      netRegex: { id: '9A72', source: 'Kirlirger the Abhorrent', capture: false },
      response: Responses.getBehind(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Nechuciho': 'Nechuciho',
        'Queen Hawk': 'Falkenkönigin',
        'Kirlirger the Abhorrent': 'Kirlirger (?:der|die|das) Abscheuliche[rs]?',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Nechuciho': 'Nechukiho',
        'Queen Hawk': 'reine des guêpes',
        'Kirlirger the Abhorrent': 'Kirlirger l\'abominable',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Nechuciho': 'ネチュキホ',
        'Queen Hawk': 'クイーンホーク',
        'Kirlirger the Abhorrent': '厭忌のキーリーゲー',
      },
    },
  ],
};

export default triggerSet;
