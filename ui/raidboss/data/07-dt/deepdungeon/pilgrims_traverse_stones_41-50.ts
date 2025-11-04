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
      id: 'PT 41-50 Traverse Troubadour Tortoise Stomp',
      type: 'StartsUsing',
      netRegex: { id: 'A2FC', source: 'Traverse Troubadour', capture: true },
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
          cn: '站在一块岩石上',
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
          cn: '站在流沙里',
        },
      },
    },
  ],
};

export default triggerSet;
