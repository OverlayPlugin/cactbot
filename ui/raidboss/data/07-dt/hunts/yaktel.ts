import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Rrax Triplicate Reflex - add individual side calls (or a swap call when sides change?)

type WingbladeSafe = 'left' | 'right';

export interface Data extends RaidbossData {
  rraxTriplicateSafe: WingbladeSafe[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'YakTel',
  zoneId: ZoneId.YakTel,
  comments: {
    en: 'A Rank Hunts',
    de: 'A Rang Hohe Jagd',
    cn: 'A级狩猎怪',
  },
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
    {
      id: 'Hunt Neyoozoteel Noxious Sap',
      type: 'StartsUsing',
      netRegex: { id: '91BC', source: 'Neyoozoteel', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'Hunt Neyoozoteel Cocopult',
      type: 'StartsUsing',
      netRegex: { id: '91BB', source: 'Neyoozoteel', capture: false },
      infoText: (_data, _matches, output) => output.stackThenBehind!(),
      outputStrings: {
        stackThenBehind: {
          en: 'Stack => Away From Front',
          de: 'Sammeln => Weg von Vorne',
          fr: 'Package => Loin du devant',
          cn: '集合 => 远离正面',
          ko: '쉐어 => 보스 전방 피하기',
        },
      },
    },
    // Whirling Omen applies three directional buffs that are consumed cumulatively in order
    // (e.g. Left -> Rear actually means cleaves will be Left -> Right).
    // There are 4 cast ids, each with a fixed set of debuffs, so we only need the id to determine
    // the overall safe spot. These triggers use a long duration, as some casts will be followed by
    // F64 (Delayed Nerotoxicity), which lock the player in place for the cleave sequence.
    {
      id: 'Hunt Neyoozoteel Whirling Omen Front',
      type: 'Ability',
      // 9200: Left -> Back -> Right
      netRegex: { id: '9200', source: 'Neyoozoteel', capture: false },
      durationSeconds: 19,
      response: Responses.goFront(),
    },
    {
      id: 'Hunt Neyoozoteel Whirling Omen Right',
      type: 'Ability',
      // 9200: Back -> Right -> Right
      netRegex: { id: '9201', source: 'Neyoozoteel', capture: false },
      durationSeconds: 19,
      response: Responses.goRight(),
    },
    {
      id: 'Hunt Neyoozoteel Whirling Omen Left',
      type: 'Ability',
      // 9202: Right -> Left -> Back
      netRegex: { id: '9202', source: 'Neyoozoteel', capture: false },
      durationSeconds: 19,
      response: Responses.goLeft(),
    },
    {
      id: 'Hunt Neyoozoteel Whirling Omen Back',
      type: 'Ability',
      // 9203: Left -> Back -> Left
      netRegex: { id: '9203', source: 'Neyoozoteel', capture: false },
      durationSeconds: 19,
      response: Responses.getBehind(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Starcrier': 'Sternschreier',
        'Rrax Yity\'a': 'Rrax Yity\'a',
        'Neyoozoteel': 'Neyoozoteel',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Starcrier': 'furopluminescent',
        'Rrax Yity\'a': 'Rrax Yity\'a',
        'Neyoozoteel': 'Neyozzoteel',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Starcrier': '幻煌鳥',
        'Rrax Yity\'a': 'ラシュイチャ',
        'Neyoozoteel': 'ネヨーゾテール',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Starcrier': '幻煌鸟',
        'Rrax Yity\'a': '血鸣鼠',
        'Neyoozoteel': '内尤佐缇',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Starcrier': '환황조',
        'Rrax Yity\'a': '라슈이챠',
        'Neyoozoteel': '네요조텔',
      },
    },
  ],
};

export default triggerSet;
