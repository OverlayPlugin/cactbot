import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { playerDamageFields } from '../../../oopsy_common';

export interface Data extends OopsyData {
  hasDoom?: { [name: string]: boolean };
}

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheMesoTerminal,
  damageWarn: {
    // ** Adds Pre-Boss 1 ** //
    'Meso Terminal Terminal Watchman Electric Shock': 'AC08', // Targeted circle AoE
    'Meso Terminal Preserved Medic Alexandrian Gravity': 'AC09', // Targeted large circle AoE

    // ** Chirurgeon General ** //
    'Meso Terminal Chirurgeon General Biochemical Front': 'AB1A', // Frontal half-room cleave
    'Meso Terminal Chirurgeon General Sterile Sphere Large': 'AB1D', // Large circle AoEs with timer
    'Meso Terminal Chirurgeon General Sterile Sphere Small': 'AB1C', // Small circle AoEs with timer

    // ** Adds Pre-Boss 2 ** //
    'Meso Terminal Terminal Claw Pressure Wave': 'AC0C', // Frontal cone AoE
    'Meso Terminal Preserved Prisoner Rusted Knives': 'AC0D', // Chariot AoE
    'Meso Terminal Preserved Prisoner Overpower': 'AC0E', // Chariot AoE

    // ** Executioners ** //
    'Meso Terminal Headsman Shackles Of Fate Error': 'AA3F', // Leaving the chain circle
    'Meso Terminal Headsman Dismemberment': 'AA43', // Line AoE
    'Meso Terminal Headsman Flaying Flail': 'AA48', // Triple circle AoE
    'Meso Terminal Headsman Peal Of Judgment': 'AA4A', // Pathing lightning AoEs
    'Meso Terminal Headsman Chopping Block': 'AA4B', // Chariot AoE
    'Meso Terminal Headsman Execution Wheel': 'AA4C', // Dynamo AoE
    'Meso Terminal Pale Headsman Will Breaker': 'AF38', // Interruptible tank vuln

    // ** Adds Pre-Boss 3 ** //
    'Meso Terminal Terminal Dataguarder Electray': 'AC10', // Frontal line AoE
    'Meso Terminal Preserved Soldier Steelforged Belief': 'AFF2', // Chariot AoE

    // ** Immortal Remains ** //
    'Meso Terminal Bygone Aerostat Electray': 'AB22', // Crossing line AoEs
    'Meso Terminal Immortal Remains Bombardment Small': 'AB23', // Small red circle AoE
    'Meso Terminal Immortal Remains Bombardment Large': 'AB24', // Large red circle AoE
    'Meso Terminal Immortal Remains Turmoil': 'AB28', // Half-arena cleave (used for both sides)
    'Meso Terminal Immortal Remains Keraunography': 'B078', // Wide purple laser AoEs
  },
  damageFail: {
    'Meso Terminal Immortal Remains Impression Circle': 'AB2A', // Blue knockback circle inside
  },
  gainsEffectWarn: {
    'Meso Terminal Chirurgeon General Bleeding': 'C06', // Death wall contact
  },
  soloWarn: {
    'Meso Terminal Immortal Remains Memory Of The Storm': 'AB2E', // Stack laser
  },

  triggers: [
    {
      id: 'Meso Terminal Immortal Remains Impression Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'AB2B', ...playerDamageFields }),
      deathReason: (_data, matches) => {
        return {
          id: matches.targetId,
          name: matches.target,
          text: {
            en: 'Knocked off',
            de: 'Runtergefallen',
            fr: 'Renversé(e)',
            ja: 'ノックバック',
            cn: '击退坠落',
            tc: '擊退墜落',
            ko: '넉백',
          },
        };
      },
    },
    {
      id: 'Meso Terminal Executioners Doom Gain',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '11F2' }),
      run: (data, matches) => {
        data.hasDoom ??= {};
        data.hasDoom[matches.target] = true;
      },
    },
    {
      id: 'Meso Terminal Executioners Doom Lose',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: '11F2' }),
      run: (data, matches) => {
        data.hasDoom ??= {};
        data.hasDoom[matches.target] = false;
      },
    },
    {
      id: 'Meso Terminal Executioners Doom',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '11F2' }),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 0.5,
      deathReason: (data, matches) => {
        if (!data.hasDoom)
          return;
        if (!data.hasDoom[matches.target])
          return;
        return {
          id: matches.targetId,
          name: matches.target,
          text: matches.effect,
        };
      },
    },
  ],
};

export default triggerSet;
