import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 81-90
// TODO: Malacoda Arcane Beacon safespots

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones81_90',
  zoneId: ZoneId.PilgrimsTraverseStones81_90,

  triggers: [
    // ---------------- Stone 81-89 Mobs ----------------
    {
      id: 'PT 81-90 Traverse Cubus Dark II',
      type: 'StartsUsing',
      netRegex: { id: 'AEE7', source: 'Traverse Cubus', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 81-90 Traverse Gnoll Nox Blast',
      type: 'StartsUsing',
      netRegex: { id: 'AEE6', source: 'Traverse Gnoll', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 81-90 Traverse Gnoll Maul',
      // enrage on targeted player, goes through walls
      type: 'StartsUsing',
      netRegex: { id: 'AEE5', source: 'Traverse Gnoll', capture: true },
      alertText: (data, matches, output) => {
        const target = matches.target;
        if (target === undefined)
          return output.maul!();
        if (target === data.me)
          return output.maulOnYou!();
        return output.maulOnPlayer!({ player: data.party.member(target) });
      },
      outputStrings: {
        maul: {
          en: 'Maul',
        },
        maulOnYou: {
          en: 'Maul on YOU',
        },
        maulOnPlayer: {
          en: 'Maul on ${player}',
        },
      },
    },
    {
      id: 'PT 81-90 Invoked Gremlin Claw',
      type: 'StartsUsing',
      netRegex: { id: 'AEE2', source: 'Invoked Gremlin', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 81-90 Traverse Rider Valfodr',
      type: 'StartsUsing',
      netRegex: { id: 'A937', source: 'Traverse Rider', capture: true },
      response: Responses.knockbackOn(),
    },
    {
      id: 'PT 81-90 Traverse Rider Storm Slash',
      type: 'StartsUsing',
      netRegex: { id: 'A939', source: 'Traverse Rider', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 81-90 Invoked Arch Demon Abyssal Swing',
      type: 'StartsUsing',
      netRegex: { id: 'AEEC', source: 'Invoked Arch Demon', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 81-90 Invoked Satana Blizzard Trap',
      type: 'StartsUsing',
      netRegex: { id: 'AEEB', source: 'Invoked Satana', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 81-90 Invoked Succubus Passions\' Heat',
      // applies 3C0 Pyretic in an AoE for 3s, lethal damage if doing anything
      type: 'StartsUsing',
      netRegex: { id: 'A93A', source: 'Invoked Succubus', capture: true },
      alarmText: (data, matches, output) => {
        const target = matches.target;
        if (target === undefined)
          return output.heat!();
        if (target === data.me)
          return output.heatOnYou!();
        return output.heatOnPlayer!({ player: data.party.member(target) });
      },
      outputStrings: {
        heat: {
          en: 'Pyretic, Avoid AoE',
        },
        heatOnYou: {
          en: 'Pyretic on YOU, Away from Group => Stop Everything!',
        },
        heatOnPlayer: {
          en: 'Pyretic on ${player}, Avoid AoE',
        },
      },
    },
    {
      id: 'PT 81-90 Invoked Succubus Passions\' Heat Pyretic',
      // 3C0 = Pyretic, lethal damage if doing anything
      type: 'GainsEffect',
      netRegex: { effectId: '3C0', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: (_data, matches) => parseFloat(matches.duration),
      countdownSeconds: (_data, matches) => parseFloat(matches.duration),
      response: Responses.stopEverything(),
    },
    {
      id: 'PT 81-90 Invoked Troubadour Dark II',
      type: 'StartsUsing',
      netRegex: { id: 'AEF3', source: 'Invoked Troubadour', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 81-90 Invoked Troubadour Inner Demons',
      type: 'StartsUsing',
      netRegex: { id: 'AEF4', source: 'Invoked Troubadour', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 81-90 Invoked Cerberus Lightning Bolt',
      // medium-sized AoE, locks-on to a player ground position at start of cast
      type: 'StartsUsing',
      netRegex: { id: 'AEF0', source: 'Invoked Cerberus', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid AoE',
        },
      },
    },
    {
      id: 'PT 81-90 Invoked Cerberus Hellclaw',
      type: 'StartsUsing',
      netRegex: { id: 'AEF1', source: 'Invoked Cerberus', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 81-90 Invoked Cerberus Tail Blow',
      type: 'StartsUsing',
      netRegex: { id: 'AEF2', source: 'Invoked Cerberus', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'PT 81-90 Invoked Humbaba Triple/Quadruple Blow',
      type: 'StartsUsing',
      netRegex: { id: ['A93B', 'A93C'], source: 'Invoked Humbaba', capture: true },
      infoText: (_data, matches, output) => {
        const blows = matches.id === 'A93B' ? 3 : 4;
        return output.text!({ count: blows });
      },
      outputStrings: {
        text: {
          en: '${count}x attacks => Get Behind',
        },
      },
    },
    {
      id: 'PT 81-90 Invoked Humbaba Bellows',
      type: 'StartsUsing',
      netRegex: { id: 'AD05', source: 'Invoked Humbaba', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 81-90 Invoked Caym Double Hex Eye',
      type: 'StartsUsing',
      netRegex: { id: 'AEEE', source: 'Invoked Caym', capture: true },
      response: Responses.lookAwayFromSource(),
    },
    {
      id: 'PT 81-90 Invoked Baal Incinerating Lahar',
      type: 'StartsUsing',
      netRegex: { id: 'A87D', source: 'Invoked Baal', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      alertText: (_data, matches, output) => output.breakLOS!({ name: matches.source }),
      outputStrings: {
        breakLOS: {
          en: 'Break line-of-sight to ${name}',
          de: 'Unterbreche Sichtlinie zu ${name}',
          fr: 'Masquez le champ de vision vers ${name}',
          ja: '${name}の視線から隠れる',
          cn: '利用掩体卡 ${name} 的视线',
          ko: '${name}의 시야 밖으로 숨기',
        },
      },
    },
    {
      id: 'PT 81-90 Invoked Baal Abyssal Ray',
      // goes through walls
      type: 'StartsUsing',
      netRegex: { id: 'A87E', source: 'Invoked Baal', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 81-90 Traverse Cama Claw and Tail',
      type: 'StartsUsing',
      netRegex: { id: 'A87C', source: 'Traverse Cama', capture: false },
      response: Responses.goSides(),
    },
    // ---------------- Stone 90 Boss: Malacoda ----------------
    {
      id: 'PT 81-90 Malacoda Backhand Right',
      type: 'StartsUsing',
      netRegex: { id: 'ACDA', source: 'Malacoda', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Behind + Left',
        },
      },
    },
    {
      id: 'PT 81-90 Malacoda Backhand Left',
      type: 'StartsUsing',
      netRegex: { id: 'ACDB', source: 'Malacoda', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Behind + Right',
        },
      },
    },
    {
      id: 'PT 81-90 Malacoda Fore-hind Folly',
      type: 'StartsUsing',
      netRegex: { id: 'ACE2', source: 'Malacoda', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'PT 81-90 Malacoda Twin-winged Treachery',
      type: 'StartsUsing',
      netRegex: { id: 'ACE3', source: 'Malacoda', capture: false },
      response: Responses.goFrontBack(),
    },
    {
      id: 'PT 81-90 Malacoda Skinflayer',
      type: 'StartsUsing',
      netRegex: { id: 'ACEA', source: 'Malacoda', capture: false },
      response: Responses.knockback(),
    },
  ],
};

export default triggerSet;
