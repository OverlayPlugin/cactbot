import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 41-50

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones41_50',
  zoneId: ZoneId.PilgrimsTraverseStones41_50,

  triggers: [
    // ---------------- Stone 41-49 Mobs ----------------
    {
      id: 'PT 41-50 Traverse Weapon Smite of Rage',
      type: 'StartsUsing',
      netRegex: { id: 'AEAA', source: 'Traverse Weapon', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 41-50 Traverse Weapon Whirl of Rage',
      type: 'StartsUsing',
      netRegex: { id: 'AEAB', source: 'Traverse Weapon', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 41-50 Traverse Tolba Tortoise Stomp',
      type: 'StartsUsing',
      netRegex: { id: 'A2FC', source: 'Traverse Tolba', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 41-50 Traverse Triffid Creeping Combination',
      type: 'StartsUsing',
      netRegex: { id: 'A37E', source: 'Traverse Triffid', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'PT 41-50 Traverse Petreffigy Magnetic Shock',
      type: 'StartsUsing',
      netRegex: { id: 'A1D3', source: 'Traverse Petreffigy', capture: false },
      response: Responses.drawIn(),
    },
    {
      id: 'PT 41-50 Traverse Petreffigy Plaincracker',
      type: 'StartsUsing',
      netRegex: { id: 'A228', source: 'Traverse Petreffigy', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      response: Responses.getOut(),
    },
    {
      id: 'PT 41-50 Traverse Anaconda Dripping Fang',
      type: 'StartsUsing',
      netRegex: { id: 'A37A', source: 'Traverse Anaconda', capture: true },
      response: Responses.stunOrInterruptIfPossible(),
    },
    {
      id: 'PT 41-50 Traverse Pincerbeak Tail Smash',
      type: 'StartsUsing',
      netRegex: { id: 'AEA7', source: 'Traverse Pincerbeak', capture: false },
      response: Responses.getOut(),
    },
    // ---------------- Stone 50 Boss: Ogbunabali ----------------
    {
      id: 'PT 41-50 Ogbunabali Liquefaction',
      type: 'StartsUsing',
      netRegex: { id: 'AA0B', source: 'Ogbunabali', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stand on a rock',
          de: 'Steh auf einem Stein',
          cn: '站在一块岩石上',
          ko: '돌 위에 서있기',
          tc: '站在一塊岩石上',
        },
      },
    },
    {
      id: 'PT 41-50 Ogbunabali Sandpit',
      type: 'HeadMarker',
      netRegex: { id: '0280', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: '4x Chasing AoE on YOU',
          de: '4x verfolgende AoE auf DIR',
          fr: '4x AoE sur VOUS',
          cn: '四连追踪 AOE 点名',
          ko: '따라오는 장판 4번',
          tc: '四連追蹤 AOE 點名',
        },
      },
    },
    {
      id: 'PT 41-50 Ogbunabali Biting Wind',
      type: 'StartsUsing',
      netRegex: { id: 'AA12', source: 'Ogbunabali', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      countdownSeconds: 3,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stand in quicksand',
          de: 'Im Treibsand stehen',
          cn: '站在流沙里',
          ko: '모래늪에 서있기',
          tc: '站在流沙裡',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Ogbunabali': 'Ogbunabali',
        'Traverse Anaconda': 'Wallfahrt-Anakonda',
        'Traverse Petreffigy': 'Wallfahrt-Bildnis',
        'Traverse Pincerbeak': 'Wallfahrt-Zwicker',
        'Traverse Tolba': 'Wallfahrt-Tolba',
        'Traverse Triffid': 'Wallfahrt-Triffid',
        'Traverse Weapon': 'Wallfahrt-Waffe',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Ogbunabali': 'Ogbunabali',
        'Traverse Anaconda': 'anaconda du pèlerinage',
        'Traverse Petreffigy': 'effigie du pèlerinage',
        'Traverse Pincerbeak': 'bec-pinceur du pèlerinage',
        'Traverse Tolba': 'tolba du pèlerinage',
        'Traverse Triffid': 'triffide du pèlerinage',
        'Traverse Weapon': 'arme du pèlerinage',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Ogbunabali': 'オグブナバリ',
        'Traverse Anaconda': 'トラバース・アナコンダ',
        'Traverse Petreffigy': 'トラバース・エフィジィ',
        'Traverse Pincerbeak': 'トラバース・ピンサービーク',
        'Traverse Tolba': 'トラバース・トルバ',
        'Traverse Triffid': 'トラバース・トリフィド',
        'Traverse Weapon': 'トラバース・ウェポン',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Ogbunabali': '오그부나발리',
        'Traverse Anaconda': '순례길 아나콘다',
        'Traverse Petreffigy': '순례길 돌인형',
        'Traverse Pincerbeak': '순례길 집게부리',
        'Traverse Tolba': '순례길 톨바',
        'Traverse Triffid': '순례길 트리피드',
        'Traverse Weapon': '순례길 무기마',
      },
    },
  ],
};

export default triggerSet;
