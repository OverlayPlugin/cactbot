import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO: Add trash mistakes

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.JeunoTheFirstWalk,
  damageWarn: {
    // Initial trash
    'Jeuno First Walk Goblin Replica Seismostomp': 'A2B4', // Circle puddle AoE
    'Jeuno First Walk Vanguard Pathfinder Toss': 'A2B7', // Circle puddle AoE

    // Prishe
    'Jeuno First Walk Prishe Knuckle Sandwich Small': '9FEB',
    'Jeuno First Walk Prishe Knuckle Sandwich Mid': '9FEC',
    'Jeuno First Walk Prishe Knuckle Sandwich Big': '9FED',
    'Jeuno First Walk Prishe Brittle Impact Small': '9FEE', // Knuckle Sandwich follow-up
    'Jeuno First Walk Prishe Brittle Impact Mid': '9FEF',
    'Jeuno First Walk Prishe Brittle Impact Big': '9FF0',
    'Jeuno First Walk Prishe Banish': '9FF3', // Pathing circles
    'Jeuno First Walk Prishe Explosion': '9FFB', // Banishga IV orb explosions

    // Pre-Fafnir trash
    'Jeuno First Walk Skimmer Cursed Sphere': 'A2B8', // Small circle puddle AoE
    'Jeuno First Walk Bark Spider Spider Web': 'A2BB', // Circle puddle AoE
    'Jeuno First Walk Death Cap Agaricus': 'A2BD', // Circle puddle AoE
    'Jeuno First Walk Elder Goobhue Scoop': 'A2BF', // 90-degree conal AoE

    // Fafnir
    'Jeuno First Walk Ravaging Wind Great Whirlwind Initial': '9BC1', // Initial puddle, large roving AoE circles
    'Jeuno First Walk Biting Wind Great Whirlwind': '9BC2', // Initial puddle, small roving AoE circles
    'Jeuno First Walk Fafnir Dragon Breath': '9F6F', // Fire donut application
    'Jeuno First Walk Fafnir Hurricane Wing Outer Initial 1': '9F78', // Giant ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Initial 2': '9F79', // Large ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Initial 3': '9F7A', // Mid ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Initial 4': '9F7B', // Small circle AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Subsequent 1': '9F82', // Giant ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Subsequent 2': '9F83', // Large ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Subsequent 3': '9F84', // Mid ring AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Outer Subsequent 4': '9F85', // Small circle AoE, out to in
    'Jeuno First Walk Fafnir Hurricane Wing Inner Initial 1': '9F7D', // Small circle AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Initial 2': '9F7E', // Mid ring AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Initial 3': '9F7F', // Large ring AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Initial 4': '9F80', // Giant ring AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Subsequent 1': '9F87', // Small circle AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Subsequent 2': '9F88', // Mid ring AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Subsequent 3': '9F89', // Large ring AoE, in to out
    'Jeuno First Walk Fafnir Hurricane Wing Inner Subsequent 4': '9F8A', // Giant ring AoE, in to out
    'Jeuno First Walk Ravaging Wind Great Whirlwind Pathing': '9F8B', // Large roving AoE circles
    'Jeuno First Walk Biting Wind Great Whirlwind Pathing': '9F8C', // Small roving AoE circles
    'Jeuno First Walk Fafnir Absolute Terror': '9F8E', // Hot Tail
    'Jeuno First Walk Fafnir Winged Terror': '9F90', // Hot Wing
    'Jeuno First Walk Fafnir Spike Flail': 'A09A', // Tail cleave cone AoE
    'Jeuno First Walk Fafnir Touchdown': 'A09C', // Giant chariot AoE

    // Post-Fafnir trash
    'Jeuno First Walk Groundskeeper Isle Drop': 'A2C6', // Circle puddle AoE
    'Jeuno First Walk Flamingo Wing Cutter': 'A2C8', // 90-degree conal AoE, small

    'Jeuno First Walk Despot Scrapline': 'A1B1', // Chariot AoE
    'Jeuno First Walk Despot Isle Drop': 'A2E3', // Circle puddle AoE
    'Jeuno First Walk Despot Typhoon': 'A3AE', // Dynamo AoE

    // Ark Angels
    'Jeuno First Walk Angels TT Guillotine Initial': 'A068', // 270-degree frontal cleave, initial hits
    'Jeuno First Walk Angels TT Guillotine Final': 'A069', // 270-degree frontal cleave, final hit
    'Jeuno First Walk Angels MR Havoc Spiral': 'A06F', // Cone cyclone AoEs
    'Jeuno First Walk Angels MR Rampage Line': 'A073', // Line AoE
    'Jeuno First Walk Angels MR Rampage Circle': 'A075', // Giant circle AoE
    'Jeuno First Walk Ark Angels GK Yukikaze': 'A079', // Grid AoE
    'Jeuno First Walk Ark Angels GK Kasha': 'A07B', // Giant circle AoE
    'Jeuno First Walk Ark Angels GK Concerted Dissolution': 'A07C', // Pizza slice AoE
    'Jeuno First Walk Ark Angels GK Lights Chain': 'A07D', // Donut AoE
    'Jeuno First Walk Ark Angels HM Mighty Strikes': 'A081', // Repeated small circle AoEs
    'Jeuno First Walk Ark Angels HM Cross Reaver': 'A084', // Crossed line AoEs

    // Shadow Lord
    'Jeuno First Walk Shadow Lord Right Giga Slash Wide': '9F40',
    'Jeuno First Walk Shadow Lord Left Giga Slash Narrow': '9F41',
    'Jeuno First Walk Shadow Lord Implosion Left Chariot': '9F46',
    'Jeuno First Walk Shadow Lord Implosion Left Cleave': '9F47', // Half-room left cleave
    'Jeuno First Walk Shadow Lord Implosion Right Chariot': '9F48',
    'Jeuno First Walk Shadow Lord Implosion Right Cleave': '9F49', // Half-room right cleave
    'Jeuno First Walk Shadow Lord Burning Court': '9F4C', // Corner circle AoEs, intermission
    'Jeuno First Walk Shadow Lord Burning Moat': '9F4D', // Side rectangle AoEs, intermission
    'Jeuno First Walk Shadow Lord Burning Keep': '9F4E', // Outer square safe AoE, intermission
    'Jeuno First Walk Shadow Lord Burning Battlements': '9F4F', // Inner square safe AoE, intermission
    'Jeuno First Walk Shadow Lord Umbra Smash Exalines': '9F54',
    'Jeuno First Walk Shadow Lord Umbra Smash 1': '9F5D', // Initial line AoE 1
    'Jeuno First Walk Shadow Lord Umbra Smash 2': '9F5E', // Initial line AoE 2
    'Jeuno First Walk Shadow Lord Umbra Smash 3': '9F5F', // Initial line AoE 3
    'Jeuno First Walk Shadow Lord Umbra Smash 4': '9F60', // Initial line AoE 4
    'Jeuno First Walk Shadow Lord Umbra Wave': '9F61', // Repeated follow-up line AoEs
    'Jeuno First Walk Shadow Lord Soul Binding': 'A22A', // Exatrine circles
    'Jeuno First Walk Shadow Lord Front Giga Slash Nightfall': 'A428',
    'Jeuno First Walk Shadow Lord Rear Giga Slash Nightfall': 'A429',
    'Jeuno First Walk Shadow Lord Left Giga Slash Nightfall Wide': 'A42B',
    'Jeuno First Walk Shadow Lord Right Giga Slash Nightfall Narrow': 'A42C',
    'Jeuno First Walk Shadow Lord Right Giga Slash Nightfall Wide': 'A42D',
    'Jeuno First Walk Shadow Lord Left Giga Slash Nightfall Narrow': 'A42E',
  },
  damageFail: {
    // Fafnir
    'Jeuno First Walk Fafnir Horrid Roar Puddles': '9F92', // Black + red ground puddles, instant kill

    // Ark Angels
    'Jeuno First Walk TT Meteor': 'A08B', // Missed interrupt on TT
    'Jeuno First Walk HM Critical Reaver': 'A13B', // Missed interrupt on HM
  },
  gainsEffectWarn: {
    // Prishe
    'Jeuno First Walk Prishe Thornbite': 'DBD', // Touching thorns during Auroral Uppercut

    // Fafnir
    'Jeuno First Walk Fafnir Burns': 'BF9', // Standing in dragon breath

    // Post-Fafnir trash
    'Jeuno First Walk Sprinkler Blind': 'DA6', // Gaze attack, Mysterious Light

    // Ark Angels
    'Jeuno First Walk Ark Angels GK Petrification': '5E7', // Gaze attack, Gekko
  },
  shareWarn: {
    // Prishe
    'Jeuno First Walk Prishe Holy': 'A003', // Light spread circles

    // Fafnir
    'Jeuno First Walk Fafnir Horrid Roar Spread': '9F93',
    'Jeuno First Walk Fafnir Sharp Spike': '9F98', // Splashing tank busters

    // Ark Angels
    'Jeuno First Walk Angels MR Cloudsplitter': 'A077', // Splashing tank busters

    // Shadow Lord
    'Jeuno First Walk Shadow Lord Unbridled Rage': '9F68', // Tank lasers, non-shared
    'Jeuno First Walk Shadow Lord Dark Nova': 'A177', // Dark spread circles
  },
  soloWarn: {
    // Prishe
    'Jeuno First Walk Prishe Nullifying Dropkick': '9FFD', // Shared tank buster. Also 9FF1, but we need only one for the mistake.
    'Jeuno First Walk Asuran Fists 1': '9FFE',
    'Jeuno First Walk Asuran Fists 2': '9FFF',
    'Jeuno First Walk Asuran Fists Final': 'A000',

    // Fafnir
    'Jeuno First Walk Fafnir Baleful Breath Final': '9B76', // Stack laser, final hit
    'Jeuno First Walk Fafnir Baleful Breath Initial': '9F94', // Stack laser, first hit
    'Jeuno First Walk Fafnir Baleful Breath Interstitial': '9F95', // Stack laser, hits 2-4

    // Ark Angels
    'Jeuno First Walk Ark Angels GK Dragonfall': 'A07F', // Party stacks
    'Jeuno First Walk Ark Angels EV Arrogance Incarnate': 'A088', // Multi-hit stack marker

    // Shadow Lord
    'Jeuno First Walk Shadow Lord Impact 1': '9F58', // Damning Strikes tower 1
    'Jeuno First Walk Shadow Lord Impact 2': 'A096', // Damning Strikes tower 2
    'Jeuno First Walk Shadow Lord Impact 3': 'A097', // Damning Strikes tower 3
    'Jeuno First Walk Shadow Lord Echoes Of Agony': 'A3AC', // Multi-hit stack marker
  },
  triggers: [
    {
      id: 'Jeuno First Walk Prishe Auroral Uppercut Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '9FF9', capture: true }),
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
            ko: '넉백',
            tc: '擊退墜落',
          },
        };
      },
    },
  ],
};

export default triggerSet;
