import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stone 99/The Final Verse
// TODO: Abysal Blaze left/right safe spots
// TODO: timeline

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'TheFinalVerse',
  zoneId: [
    ZoneId.PilgrimsTraverseStones91_100,
    ZoneId.TheFinalVerse,
  ],
  zoneLabel: {
    en: 'Pilgrim\'s Traverse Stone 99/The Final Verse',
  },

  triggers: [
    // ---------------- Stone 99/The Final Verse Boss: Eminent Grief/Devoured Eater ----------------
    {
      id: 'PT 99 Devoured Eater Blade of First Light',
      type: 'StartsUsing',
      netRegex: { id: 'AC2[1278]', source: 'Devoured Eater', capture: true },
      alertText: (_data, matches, outputs) => {
        const id = matches.id;
        if (id === 'AC21' || id === 'AC27')
          return outputs.sides!();
        return outputs.middle!();
      },
      outputStrings: {
        sides: Outputs.sides,
        middle: Outputs.goIntoMiddle,
      },
    },
    {
      id: 'PT 99 Eminent Grief Ball of Fire',
      type: 'Ability',
      netRegex: { id: ['AC1D', 'AC24'], source: 'Eminent Grief', capture: false },
      response: Responses.moveAway('alert'),
    },
    {
      id: 'PT 99 Eminent Grief Chains of Condemnation',
      // raidwide + applies 11D2 Chains of Condemnation for 3s; heavy damage if moving
      type: 'StartsUsing',
      netRegex: { id: 'AC2[06]', source: 'Eminent Grief', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      durationSeconds: 6,
      alarmText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'AoE + Stop Moving!',
        },
      },
    },
    {
      id: 'PT 99 Devoured Eater Bounds of Sin',
      // applies 119E Bind for 3s
      type: 'Ability',
      netRegex: { id: 'AC32', source: 'Devoured Eater', capture: false },
      delaySeconds: 3,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'PT 99 Eminent Grief Spinelash Bait',
      // laser will break glass + summon add if it hits a window
      type: 'HeadMarker',
      netRegex: { id: '00EA', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'Laser on YOU',
        },
      },
    },
    {
      id: 'PT 99 Eminent Grief Spinelash',
      type: 'StartsUsing',
      netRegex: { id: 'B03E', source: 'Eminent Grief', capture: false },
      infoText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'Avoid laser',
        },
      },
    },
    {
      id: 'PT 99 Vodoriga Minion Spawn',
      // 14039 = Vodoriga Minion
      type: 'AddedCombatant',
      netRegex: { npcNameId: '14039', capture: false },
      response: Responses.killExtraAdd(),
    },
    {
      id: 'PT 99 Eminent Grief Drain Aether',
      // AC3[BD] = failstate casts?
      type: 'StartsUsing',
      netRegex: { id: 'AC3[89]', source: 'Eminent Grief', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      alertText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'Get Light debuff',
        },
      },
    },
    {
      id: 'PT 99 Devoured Eater Drain Aether',
      type: 'StartsUsing',
      netRegex: { id: 'AC3[AC]', source: 'Devoured Eater', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 3,
      alertText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'Get Dark debuff',
        },
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze Safe Spots',
      // AC2A = first cast, horizontal exaflares, front safe
      // AC2B = first cast, vertical exaflares, left or right safe
      // AC2C = second instant cast, horizontal exaflares, back safe
      // AC2D = second instant cast, vertical exaflares, left or right safe
      // AC2F = diamonds glow, exaflares start at end of cast
      // AC30 = instant, exaflare explosion/damage
      type: 'Ability',
      netRegex: { id: 'AC2[A-D]', source: 'Eminent Grief', capture: true },
      durationSeconds: 10,
      infoText: (_data, matches, outputs) => {
        const id = matches.id;
        switch (id) {
          case 'AC2A':
            return outputs.text!({ safe: 'Front safe' });
          case 'AC2B':
            return outputs.text!({ safe: 'Check safe side' });
          case 'AC2C':
            return outputs.text!({ safe: 'Back safe' });
          case 'AC2D':
            return outputs.text!({ safe: 'Check safe side' });
        }
      },
      outputStrings: {
        text: {
          en: '${safe}, for later',
        },
      },
    },
    {
      id: 'PT 99 Eminent Grief Abyssal Blaze',
      type: 'StartsUsing',
      netRegex: { id: 'AC2F', source: 'Eminent Grief', capture: false },
      suppressSeconds: 1,
      alarmText: (_data, _matches, outputs) => outputs.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Exaflares',
        },
      },
    },
  ],
};

export default triggerSet;
