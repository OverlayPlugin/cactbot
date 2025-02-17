import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'YuweyawataFieldStation',
  zoneId: ZoneId.YuweyawataFieldStation,
  timelineFile: 'yuweyawata.txt',
  triggers: [
    // ---------------- Lindblum Zaghnal ---------------- //
    {
      id: 'Yuweyawata Lindblum Zaghnal Electrical Overload',
      type: 'StartsUsing',
      netRegex: { id: '9EBB', source: 'Lindblum Zaghnal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Caber Toss',
      type: 'StartsUsing',
      netRegex: { id: '9EB0', source: 'Lindblum Zaghnal', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      durationSeconds: 5,
      infoText: (_data, _matches, output) => {
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Away from falling pillar',
          cn: '远离柱子落点',
        },
      },
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Lightning Storm',
      type: 'StartsUsing',
      netRegex: { id: '9EBD', source: 'Lindblum Zaghnal', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Sparking Fissure (small)',
      type: 'StartsUsing',
      netRegex: { id: ['9EB7', 'A133'], source: 'Lindblum Zaghnal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Raw Electrope Spawn',
      type: 'AddedCombatant',
      // 13622 = Raw Electrope
      netRegex: { npcNameId: '13622', capture: false },
      suppressSeconds: 1,
      response: Responses.killAdds(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Sparking Fissure (big)',
      type: 'StartsUsing',
      netRegex: { id: 'A12A', source: 'Lindblum Zaghnal', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      durationSeconds: 5,
      response: Responses.bigAoe('alert'),
    },

    // ---------------- Overseer Kanilokka ---------------- //
    {
      id: 'Yuweyawata Overseer Kanilokka Dark Souls',
      type: 'StartsUsing',
      netRegex: { id: '9ED2', source: 'Overseer Kanilokka', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Free Spirits',
      type: 'StartsUsing',
      netRegex: { id: '9EC0', source: 'Overseer Kanilokka', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Phantom Flood',
      type: 'StartsUsing',
      netRegex: { id: '9EC4', source: 'Overseer Kanilokka', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Telltale Tears',
      type: 'StartsUsing',
      netRegex: { id: '9EC9', source: 'Overseer Kanilokka', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Lost Hope',
      type: 'Ability',
      netRegex: { id: '9EC5', source: 'Overseer Kanilokka', capture: false },
      durationSeconds: 17,
      suppressSeconds: 1,
      response: Responses.getOut(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Necrohazard',
      type: 'StartsUsing',
      netRegex: { id: '9EC6', source: 'Overseer Kanilokka', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      response: Responses.bigAoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Bloodburst',
      type: 'StartsUsing',
      netRegex: { id: '9EC7', source: 'Overseer Kanilokka', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Soul Douse',
      type: 'StartsUsing',
      netRegex: { id: '9ECB', source: 'Overseer Kanilokka', capture: true },
      response: Responses.stackMarkerOn(),
    },

    // ---------------- Lunipyati ---------------- //
    {
      id: 'Yuweyawata Lunipyati Raging Claw',
      type: 'StartsUsing',
      netRegex: { id: '9EA4', source: 'Lunipyati', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Yuweyawata Lunipyati Leporine Loaf',
      type: 'StartsUsing',
      netRegex: { id: '9E9B', source: 'Lunipyati', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lunipyati Jagged Edge',
      type: 'StartsUsing',
      netRegex: { id: '9EA7', source: 'Lunipyati', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Lunipyati Crater Carve',
      type: 'StartsUsing',
      netRegex: { id: '9E9D', source: 'Lunipyati', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      response: Responses.getOut(),
    },
    {
      id: 'Yuweyawata Lunipyati Beastly Roar',
      type: 'StartsUsing',
      netRegex: { id: '9EA2', source: 'Lunipyati', capture: false },
      alertText: (_data, _matches, output) => {
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Away from boss',
          cn: '远离 BOSS',
        },
      },
    },
    {
      id: 'Yuweyawata Lunipyati Turali Stone IV',
      type: 'StartsUsing',
      netRegex: { id: '9EA8', source: 'Lunipyati', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Yuweyawata Lunipyati Sonic Howl',
      type: 'StartsUsing',
      netRegex: { id: '9EAA', source: 'Lunipyati', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lunipyati Slabber',
      type: 'StartsUsing',
      netRegex: { id: '9EAB', source: 'Lunipyati', capture: true },
      response: Responses.tankBuster(),
    },
  ],
};

export default triggerSet;
