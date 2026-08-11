import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export interface Data extends OopsyData {
  hasHPDebuff: { [playerID: string]: boolean };
}

// TODO: Check whether C3D2 Divine Arrow is used for both directions, or whether C3D1 is also used.
// TODO: Add Hollow King tower failure

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.WindurstTheThirdWalk,
  initData: () => {
    return {
      hasHPDebuff: {},
    };
  },
  damageWarn: {
    // Shantotto
    'Windurst Third Walk Shantotto Empirical Research': 'C420', // Frontal line AoE
    'Windurst Third Walk Shantotto Superior Stone Spawn': 'C412', // Irregular stone shape summon
    'Windurst Third Walk Shantotto Groundbreaking Quake Shove': 'C414', // Stone wall crush, if player is aligned with the safespot
    'Windurst Third Walk Shantotto Circumscribed Fire Initial': 'C419', // First dynamo AoE
    'Windurst Third Walk Shantotto Circumscribed Fire Subsequent': 'C41A', // Follow-up dynamo AoEs
    'Windurst Third Walk Shantotto Localized Blizzard': 'C41B', // Chariot AoE
    'Windurst Third Walk Shantotto Small Specimen': 'C408', // Tethered circle AoEs
    'Windurst Third Walk Shantotto Falling Rubble Small Circle': 'C40C', // Random circle AoEs after intermission, 8y diameter
    'Windurst Third Walk Shantotto Falling Rubble Large Circle': 'C40D', // Random circle AoEs after intermission, 12y diameter
    'Windurst Third Walk Shantotto Falling Rubble Small Rectangle': 'C40E', // Random line AoEs after intermission, 6y x 25y
    'Windurst Third Walk Shantotto Falling Rubble Large Rectangle': 'C40F', // Random line AoEs after intermission, 10y x 35y

    // Pre-Alexander trash
    'Windurst Third Walk Acrolith Earthshatter': 'C3A5', // Chariot AoE
    'Windurst Third Walk Lamia Jaeger Transcendent Shot': 'C3A6', // Line AoEs, 2 -> 1 pattern
    'Windurst Third Walk Qutrub Forayer Feral Lunge': 'C532', // Large circle AoEs
    'Windurst Third Walk Pining Abazohn Whirling Slash': 'C5E3', // Chariot AoE
    'Windurst Third Walk Assault Bhoot Perdition': 'C3AE', // Circle AoEs, checkerboard pattern
    'Windurst Third Walk Nemean Lion Tourbillion': 'C3AB', // Frontal half-arena cleave
    'Windurst Third Walk Medusa Swarmsinger Dance To Dust Cardinal': 'C3B0', // Cardinal exaflares
    'Windurst Third Walk Medusa Swarmsinger Dance To Dust Intercardinal': 'C3B1', // Intercardinal exaflares
    'Windurst Third Walk Medusa Swarmsinger Right Shadow Slash': 'C3B2', // Half-arena cleave
    'Windurst Third Walk Medusa Swarmsinger Left Shadow Slash': 'C3B3', // Half-arena cleave
    'Windurst Third Walk Medusa Swarmsinger Disregard': 'C3B5', // Crossed line AoEs, 2 -> 1 pattern

    // Alexander
    'Windurst Third Walk Alexander Divine Arrow Cone': 'C52E', // Spinning cone AoE
    'Windurst Third Walk Alexander Divine Arrow Counterclockwise Initial': 'C3D2', // Initial cone, counterclockwise
    'Windurst Third Walk Alexander Divine Arrow Radial 1': 'C3D3', // Central circle AoE, in-to-out pattern
    'Windurst Third Walk Alexander Divine Arrow Radial 2': 'C3D4', // Small ring AoE, in-to-out pattern
    'Windurst Third Walk Alexander Divine Arrow Radial 3': 'C3D5', // Large ring AoE, in-to-out pattern
    'Windurst Third Walk Alexander Divine Arrow Radial 4': 'C3D6', // Large ring AoE, out-to-in pattern
    'Windurst Third Walk Alexander Divine Arrow Radial 5': 'C3D7', // Small ring AoE, out-to-in pattern
    'Windurst Third Walk Alexander Divine Arrow Radial 6': 'C3D8', // Central circle AoE, out-to-in pattern
    'Windurst Third Walk Alexander Impartial Ruling 1': 'C3E2', // Half-arena cleave, first hit (independent of direction)
    'Windurst Third Walk Alexander Impartial Ruling 2': 'C3E3', // Half-arena cleave, second hit (independent of direction)
    'Windurst Third Walk Alexander Radiant Sacrament': 'C3DD', // Exploding square AoEs
    'Windurst Third Walk Alexander Divine Spear': 'C3DF', // Triangle line drawn AoEs
    'Windurst Third Walk Alexander Activate': 'C42B', // Gordius unit spawn AoEs
    'Windurst Third Walk Alexander Holy Flame': 'C3E6', // Puddles during Gordius intermission
    'Windurst Third Walk Gordius System Shock': 'C3E8', // Chariot AoE
    'Windurst Third Walk Gordius System Circuit Shock': 'C3F9', // Dynamo AoE
    'Windurst Third Walk Gordius System Repay': 'C3F6', // Karmic Shielding retaliation
    'Windurst Third Walk Gordius System Electrify': 'C3EC', // Large chariot AoEs after tethering
    'Windurst Third Walk Alexander Divine Arrow Crosshatch Vertical': 'C3D9', // 3 vertical + 2 horizontal crosshatch lines
    'Windurst Third Walk Alexander Divine Arrow Crosshatch Horizontal': 'C3DA', // 2 vertical + 3 horizontal crosshatch lines

    // Aw'aern and the Aw'zdei
    'Windurst Third Walk Aw\'aern Glacier Splitter': 'C3B9', // Frontal radial cone AoEs
    'Windurst Third Walk Aw\'zdei Optical Induration': 'C3BA', // Frontal cone AoE
    'Windurst Third Walk Aw\'zdei Static Filament': 'C537', // Circle AoEs

    // Promathia
    'Windurst Third Walk Promathia Explosion': 'C490', // Large circle AoEs (from floor-marked puddle lines)
    'Windurst Third Walk Promathia Wheel Of Impregnability': 'C493', // Chariot AoE
    'Windurst Third Walk Promathia Bastion Of Twilight': 'C494', // Dynamo AoE
    'Windurst Third Walk Promathia Pestilent Penance': 'C49B', // Frontal rectangle AoE

    'Windurst Third Walk Empty Thinker Winds Of Promyvion Clockwise': 'C4B1', // Spinny laser, intermission
    'Windurst Third Walk Empty Thinker Winds Of Promyvion Counterclockwise': 'C4B2', // Spinny laser, intermission
    'Windurst Third Walk Empty Wanderer Empty Beleaguer': 'C4AF', // Circle AoEs, 2 -> 1 pattern, intermission
    'Windurst Third Walk Empty Weeper Auroral Drape': 'C4B3', // Square AoEs, intermission

    'Windurst Third Walk Promathia Malevolent Blessing Cone': 'C498', // Radial cone AoEs
    'Windurst Third Walk Promathia Malevolent Blessing Half Arena': 'C499', // Half arena cleave (independent of direction)
    'Windurst Third Walk Link Of Promathia Pestilent Penance': 'C49C', // Frontal line AoEs
    'Windurst Third Walk Promathia Unmitigated Explosion': 'C4A0', // Missed tower
    'Windurst Third Walk Promathia Infernal Deliverance Puddles': 'C585', // Puddle follow-up after towers

    // Shinryu Paradox
    'Windurst Third Walk Shinryu Cosmic Breath': 'BFD3', // Upper platform denial
    'Windurst Third Walk Shinryu Cosmic Tail': 'BFD6', // Lower platform denial
    'Windurst Third Walk Shinryu Starflare 1': 'BFE6', // Crosshatch line AoEs hit 1
    'Windurst Third Walk Shinryu Starflare 2': 'BFE7', // Crosshatch line AoEs hit 2
    'Windurst Third Walk Shinryu Cataclysmic Vortex': 'BFE3', // Simon Says failure

    // Hollow King
    'Windurst Third Walk Hollow King Right Swordscross Orthogonal': 'C001',
    'Windurst Third Walk Hollow King Left Swordscross Orthogonal': 'C002',
    'Windurst Third Walk Hollow King Right Swordscross Diagonal': 'C003',
    'Windurst Third Walk Hollow King Left Swordscross Diagonal': 'C004',
    'Windurst Third Walk Hollow King Twin Blaze Circle': 'C007', // Twin circle area denial
    'Windurst Third Walk Hollow King Twin Blaze Donut': 'C008', // Twin circle area denial
    'Windurst Third Walk Hollow King Cataclysmic Blade Cones': 'C00A', // Blue cone AoEs during headmarker debuffs
    'Windurst Third Walk Hollow King Cataclysmic Blade Debuffs': 'C00B', // Simon Says failure
    'Windurst Third Walk Hollow King Atomic Ray': 'C00D', // Timer line AoEs
    'Windurst Third Walk Hollow King Burst Circle': 'C013', // First concentric circle AoE
    'Windurst Third Walk Hollow King Burst Small Donut': 'C014', // Second concentric circle AoE
    'Windurst Third Walk Hollow King Burst Large Donut': 'C015', // Third concentric circle AoE
    'Windurst Third Walk Hollow King Burst Cosmic Flame Initial': 'C010', // Exaflare first hit
    'Windurst Third Walk Hollow King Burst Cosmic Flame Subsequent': 'C011', // Exaflare tracking hits
    'Windurst Third Walk Hollow King Starflare 1': 'C017', // Crosshatch line AoEs hit 1
    'Windurst Third Walk Hollow King Starflare 2': 'C018', // Crosshatch line AoEs hit 2
  },
  damageFail: {
    // Shantotto
    'Windurst Third Walk Shantotto Painful Pressure': 'C415', // Stone wall crush

    // Shinryu
    'Windurst Third Walk Shinryu Atomic Tail': 'BFEA', // Lower platform destruction
  },
  gainsEffectWarn: {
    // Pre-Alexander Trash
    'Windurst Third Walk Medusa Swarmsinger Petrificaction': '5E7', // Failed gaze attack
  },
  shareWarn: {
    // Shantotto
    'Windurst Third Walk Thunder And Error': 'C41C', // Purple spread circles

    // Pre-Alexander trash
    'Windurst Third Walk Lamia No. 2 Pinning Shot': 'C3AA', // Giant circular tank cleave

    // Alexander
    'Windurst Third Walk Alexander Banishga IV Spreads': 'C3F3', // White spread circles

    // Aw'aern and the Aw'zdei
    'Windurst Third Walk Aw\'aern Auroral Wind': 'C546', // Purple spread circles

    // Promathia
    'Windurst Third Walk Promathia Comet': 'C4A2', // Standard circular tank cleave (3 instances at a time)
    'Windurst Third Walk Promathia Meteor Buster': 'C4A4', // Standard circular tank cleave (3 instances at a time)
    'Windurst Third Walk Promathia Meteor Spread': 'C4A5', // Orange spread circles

    // Shinryu
    'Windurst Third Walk Shinryu Dark Nova': 'BFF0', // Standard circular tank cleave (3 instances at a time)

    // Hollow King
    'Windurst Third Walk Hollow King Dark Nova': 'C01A', // Standard circular tank cleave (3 instances at a time)
  },
  soloWarn: {
    // Shantotto
    'Windurst Third Walk Shantotto Vidohunir': 'C426', // 3-player tank buster
    'Windurst Third Walk Shantotto Startdust Specimen': 'C409', // Single-hit stack marker
    'Windurst Third Walk Shantotto Final Exam Initial': 'C423', // 3-hit stack marker, first hit
    'Windurst Third Walk Shantotto Final Exam Subsequent': 'C424', // 3-hit stack marker, follow-up hits

    // Alexander
    'Windurst Third Walk Alexander Mega Holy Initial': 'C3EE', // 3-hit stack marker, first hit
    'Windurst Third Walk Alexander Mega Holy Subsequent': 'C3EF', // 3-hit stack marker, follow-up hit

    // Hollow King
    'Windurst Third Walk Hollow King Super Nova': 'C01F', // 3-hit stack marker, all hits
  },
  triggers: [
    {
      id: 'Windurst Third Walk Shantotto Aero Dynamics Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'C417', capture: true }),
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
    { // Promathia
      id: 'Windurst Third Walk Memory Receptacle Empty Seed Ring Out',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'C4AD', capture: true }),
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
    { // Hit by light with dark debuff
      id: 'Windurst Third Walk Shinryu Twilight Radiance',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'BFDB', capture: true }),
      condition: (_data, matches) => parseInt(matches.flags) !== 1,
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: {
            en: `${matches.target}: Wrong buff`,
            cn: `${matches.target}: buff 错误`,
            ko: `${matches.target}: 디버프 틀림`,
          },
        };
      },
    },
    { // Hit by dark with light debuff
      id: 'Windurst Third Walk Shinryu Twilight Shadow',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'BFDC', capture: true }),
      condition: (_data, matches) => parseInt(matches.flags) !== 1,
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: {
            en: `${matches.target}: Wrong buff`,
            cn: `${matches.target}: buff 错误`,
            ko: `${matches.target}: 디버프 틀림`,
          },
        };
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Recovery Down Gain',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '8BE' }),
      run: (data, matches) => {
        data.hasHPDebuff[matches.targetId] = true;
      },
    },
    {
      id: 'Windurst Third Walk Hollow King Recovery Down Lose',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: '8BE' }),
      run: (data, matches) => {
        data.hasHPDebuff[matches.targetId] = false;
      },
    },
    { // Taking a second tower with first debuff active
      id: 'Windurst Third Walk Hollow King Celestial Trail',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'BFF4', capture: true }),
      condition: (data, matches) => data.hasHPDebuff[matches.targetId],
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: {
            en: 'Tower with heal debuff',
            cn: '带着治疗 debuff 踩塔',
            ko: '회복 디버프 상태에서 탑 밟음',
          },
        };
      },
    },
  ],
};

export default triggerSet;
