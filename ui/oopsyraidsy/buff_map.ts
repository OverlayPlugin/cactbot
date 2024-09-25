// TODO: We could add BRD's songs (Minuet = 8A8, Ballad = 8A9, Paeon = 8AA),
// but effect re-application lines are continuously sent by ACT (as this is a cancellable buff).
// If we use `collectSeconds` for the full duration, the 'missed' message will be very delayed;
// but any shorter, we'll get repeated 'missed' messages for the same buff.
// We probably need to add support for something like a 'suppressSeconds' property.

export type MissableBuffType = 'heal' | 'damage' | 'mitigation';

export type MissableEffect = {
  id: string;
  type: MissableBuffType;
  effectId: string | readonly string[];
  collectSeconds: number;
  ignoreSelf?: boolean;
};

export type MissableAbility = {
  id: string;
  type: MissableBuffType;
  abilityId: string | readonly string[];
  collectSeconds?: number;
  ignoreSelf?: boolean;
};

export type MissableBuff = MissableAbility | MissableEffect;

// missedEffectBuffMap is for buffs that can be detected solely by `GainsEffect` lines,
// where there is no corresponding `Ability` line to indicate the player received the effect.
// These are predominantly bubble-type AoE buffs, like WHM's Asylum.
// If there is an ability line for each affected player, use `missedAbilityBuffMap` instead.
export const missedEffectBuffMap: readonly MissableEffect[] = [
  // ******************** Tanks ******************** //
  {
    // PLD
    id: 'Passage of Arms',
    type: 'mitigation',
    // Arms Up = 498 (others), Passage Of Arms = 497 (you).  Use both in case everybody is missed.
    effectId: ['497', '498'],
    ignoreSelf: true,
    collectSeconds: 15,
  },

  // ******************** Healers ******************** //
  {
    // WHM
    id: 'Asylum',
    type: 'heal',
    // 777 = you (bubble), 778 = you + others (healing).  Use both in case everybody is missed.
    effectId: ['777', '778'],
    collectSeconds: 24,
  },
  {
    // WHM
    id: 'Temperance',
    type: 'mitigation',
    effectId: '751',
    collectSeconds: 2,
  },
  {
    // SCH
    id: 'Seraphism',
    type: 'heal',
    effectId: 'F2D',
    collectSeconds: 2,
  },
  {
    // AST
    id: 'Collective Unconscious',
    type: 'mitigation',
    effectId: '351',
    collectSeconds: 20,
  },

  // ******************** Melee DPS ******************** //
  {
    // RPR heal
    id: 'Crest of Time Returned',
    type: 'heal',
    effectId: 'A26',
    collectSeconds: 2,
  },

  // ******************** Physical Ranged DPS ******************** //
  {
    // DNC channeled heal
    id: 'Improvisation',
    type: 'heal',
    effectId: 'A87',
    collectSeconds: 15,
  },
  // ******************** Magical Ranged DPS ******************** //

  // ******************** Field Operations & Misc. ******************** //
] as const;

// missedAbilityBuffMap is for buffs that have a corresponding Ability line for
// each affected player.  If the effect's application to a particular player can only
// be measured by `GainsEffect` lines, use `missedEffectBuffMap` instead.
export const missedAbilityBuffMap: readonly MissableAbility[] = [
  // ******************** Tanks ******************** //
  {
    // tank LB1
    id: 'Shield Wall',
    type: 'mitigation',
    abilityId: 'C5',
  },
  {
    // tank LB2
    id: 'Stronghold',
    type: 'mitigation',
    abilityId: 'C6',
  },
  // ************ PLD ************ //
  {
    // PLD LB3
    id: 'Last Bastion',
    type: 'mitigation',
    abilityId: 'C7',
  },
  {
    id: 'Divine Veil',
    type: 'mitigation',
    abilityId: 'DD4',
  },
  // ************ WAR ************ //
  {
    // WAR LB3
    id: 'Land Waker',
    type: 'mitigation',
    abilityId: '1090',
  },
  {
    id: 'Shake It Off',
    type: 'mitigation',
    abilityId: '1CDC',
  },
  // ************ DRK ************ //
  {
    // DRK LB3
    id: 'Dark Force',
    type: 'mitigation',
    abilityId: '1091',
  },
  {
    id: 'Dark Missionary',
    type: 'mitigation',
    abilityId: '4057',
  },
  // ************ GNB ************ //
  {
    // GNB LB3
    id: 'Gunmetal Soul',
    type: 'mitigation',
    abilityId: '42D1',
  },
  {
    id: 'Heart Of Light',
    type: 'mitigation',
    abilityId: '3F20',
  },

  // ******************** Healers ******************** //
  {
    // heal LB1
    id: 'Healing Wind',
    type: 'heal',
    abilityId: 'CE',
  },
  {
    // heal LB2
    id: 'Breath of the Earth',
    type: 'heal',
    abilityId: 'CF',
  },
  // ************ WHM ************ //
  {
    // WHM LB3
    id: 'Pulse of Life',
    type: 'heal',
    abilityId: 'D0',
  },
  {
    id: 'Medica',
    type: 'heal',
    abilityId: '7C',
  },
  {
    id: 'Medica II',
    type: 'heal',
    abilityId: '85',
  },
  {
    'id': 'Medica III',
    'type': 'heal',
    'abilityId': '9092',
  },
  {
    id: 'Cure III',
    type: 'heal',
    abilityId: '83',
  },
  {
    // (same ID for damage component)
    id: 'Assize',
    type: 'heal',
    abilityId: 'DF3',
  },
  {
    id: 'Afflatus Rapture',
    type: 'heal',
    abilityId: '4096',
  },
  {
    id: 'Plenary Indulgence',
    type: 'heal',
    abilityId: '1D09',
  },
  {
    // 6507 heal on tick
    // 6508 heal on expire
    id: 'Liturgy of the Bell',
    type: 'heal',
    abilityId: ['6507', '6508'],
  },
  {
    id: 'Divine Caress',
    type: 'mitigation',
    abilityId: '9093',
  },
  // ************ SCH ************ //
  {
    // SCH LB3
    id: 'Angel Feathers',
    type: 'heal',
    abilityId: '1097',
  },
  {
    id: 'Succor',
    type: 'mitigation',
    abilityId: 'BA',
  },
  {
    id: 'Concitation',
    type: 'mitigation',
    abilityId: '9095',
  },
  {
    id: 'Indomitability',
    type: 'heal',
    abilityId: 'DFF',
  },
  {
    id: 'Deployment Tactics',
    type: 'mitigation',
    abilityId: 'E01',
  },
  {
    id: 'Whispering Dawn',
    type: 'heal',
    abilityId: '323',
  },
  {
    id: 'Fey Blessing',
    type: 'heal',
    abilityId: '40A0',
  },
  {
    id: 'Consolation',
    type: 'mitigation',
    abilityId: '40A3',
  },
  {
    id: 'Angel\'s Whisper',
    type: 'heal',
    abilityId: '40A6',
  },
  {
    id: 'Fey Illumination',
    type: 'mitigation',
    abilityId: '325',
  },
  {
    id: 'Seraphic Illumination',
    type: 'mitigation',
    abilityId: '40A7',
  },
  {
    // Technically the mitigation is "Desperate Measures", but it comes from
    // the Expedient ability on each player and "Expedience" is the haste buff.
    id: 'Expedient',
    type: 'mitigation',
    abilityId: '650C',
  },
  {
    id: 'Accession',
    type: 'heal',
    abilityId: '9098',
  },
  // ************ AST ************ //
  {
    // AST LB3
    id: 'Astral Stasis',
    type: 'heal',
    abilityId: '1098',
  },
  {
    id: 'Divination',
    type: 'damage',
    abilityId: '40A8',
  },
  {
    id: 'Helios',
    type: 'heal',
    abilityId: 'E10',
  },
  {
    id: 'Aspected Helios',
    type: 'heal',
    abilityId: 'E11',
  },
  {
    id: 'Helios Conjunction',
    type: 'heal',
    abilityId: '90A6',
  },
  {
    id: 'Celestial Opposition',
    type: 'heal',
    abilityId: '40A9',
  },
  {
    id: 'Stellar Burst',
    type: 'heal',
    abilityId: '1D10',
  },
  {
    id: 'Stellar Explosion',
    type: 'heal',
    abilityId: '1D11',
  },
  {
    // 40AD initial application
    // 40AE cure on manual trigger
    // same IDs for Horoscope Helios
    id: 'Horoscope',
    type: 'heal',
    abilityId: ['40AD', '40AE'],
  },
  {
    id: 'Macrocosmos',
    type: 'heal',
    abilityId: '6512',
  },
  {
    id: 'Microcosmos',
    type: 'heal',
    abilityId: '6513',
  },
  {
    id: 'Lady of Crowns',
    type: 'heal',
    abilityId: '1D15',
  },
  {
    id: 'Sun Sign',
    type: 'mitigation',
    abilityId: '90A7',
  },
  // ************ SGE ************ //
  {
    // SGE LB3
    id: 'Techne Makre',
    type: 'heal',
    abilityId: '611B',
  },
  {
    id: 'Kerachole',
    type: 'mitigation',
    abilityId: '5EEA',
  },
  {
    id: 'Panhaima',
    type: 'mitigation',
    abilityId: '5EF7',
  },
  {
    id: 'Prognosis',
    type: 'heal',
    abilityId: '5EDE',
  },
  {
    id: 'Physis',
    type: 'heal',
    abilityId: '5EE0',
  },
  {
    id: 'Physis II',
    type: 'heal',
    abilityId: '5EEE',
  },
  {
    id: 'Eukrasian Prognosis',
    type: 'mitigation',
    abilityId: '5EE4',
  },
  {
    id: 'Eukrasian Prognosis II',
    type: 'mitigation',
    abilityId: '90AA',
  },
  {
    id: 'Ixochole',
    type: 'heal',
    abilityId: '5EEB',
  },
  {
    id: 'Pepsis',
    type: 'heal',
    abilityId: '5EED',
  },
  {
    id: 'Holos',
    type: 'mitigation',
    abilityId: '5EF6',
  },
  {
    id: 'Pneuma',
    type: 'heal',
    // 5EFE on enemies, and 6CB6 on friendlies.
    abilityId: '6CB6',
  },
  {
    id: 'Philosophia',
    type: 'heal',
    abilityId: '90AB',
  },

  // ******************** Melee DPS ******************** //
  // ************ MNK ************ //
  {
    id: 'Brotherhood',
    type: 'damage',
    abilityId: '1CE4',
  },
  {
    id: 'Mantra',
    type: 'heal',
    abilityId: '41',
  },
  // ************ DRG ************ //
  {
    id: 'Battle Litany',
    type: 'damage',
    abilityId: 'DE5',
  },
  // ************ RPR ************ //
  {
    id: 'Arcane Circle',
    type: 'damage',
    abilityId: '5F55',
  },

  // ******************** Physical Ranged DPS ******************** //
  // ************ BRD ************ //
  {
    id: 'Battle Voice',
    type: 'damage',
    abilityId: '76',
  },
  {
    id: 'Radiant Finale',
    type: 'damage',
    abilityId: '64B9',
  },
  {
    id: 'Nature\'s Minne',
    type: 'heal',
    abilityId: '1CF0',
  },
  {
    id: 'Troubadour',
    type: 'mitigation',
    abilityId: '1CED',
  },
  // ************ MCH ************ //
  {
    id: 'Tactician',
    type: 'mitigation',
    abilityId: '41F9',
  },
  // ************ DNC ************ //
  {
    id: 'Technical Finish',
    type: 'damage',
    // 81C2 is the correct Quadruple Technical Finish, others are Dinky Technical Finish.
    // TODO: pre-6.4, these were the abilityIds, but there's no backwards compat support here
    // See: https://github.com/quisquous/cactbot/issues/5415
    // abilityId: ['3F41', '3F42', '3F43', '3F44'],
    abilityId: ['81BF', '81C0', '81C1', '81C2'],
  },
  {
    // Channeled shield
    id: 'Improvised Finish',
    type: 'mitigation',
    abilityId: '64BD',
  },
  {
    // AoE heal (same ID from DNC and partner)
    id: 'Curing Waltz',
    type: 'heal',
    abilityId: '3E8F',
  },
  {
    id: 'Shield Samba',
    type: 'mitigation',
    abilityId: '3E8C',
  },

  // ******************** Magical Ranged DPS ******************** //
  // ************ SMN ************ //
  {
    id: 'Searing Light',
    type: 'damage',
    abilityId: '64C9',
  },
  {
    // phoenix heal
    id: 'Everlasting Flight',
    type: 'heal',
    abilityId: '4085',
  },
  {
    id: 'Lux Solaris',
    type: 'heal',
    abilityId: '9085',
  },
  // ************ RDM ************ //
  {
    id: 'Embolden',
    type: 'damage',
    abilityId: '1D60',
  },
  {
    id: 'Magick Barrier',
    type: 'mitigation',
    abilityId: '6501',
  },
  // ************ PCT ************ //
  {
    id: 'Tempera Grassa',
    type: 'mitigation',
    abilityId: '877E',
  },
  {
    id: 'Starry Muse',
    type: 'damage',
    abilityId: '8773',
  },
  {
    id: 'Star Prism',
    type: 'heal',
    abilityId: '877A', // 8779 is the damage component
  },
  // ************ BLU ************ //
  {
    id: 'White Wind',
    type: 'heal',
    abilityId: '2C8E',
  },
  {
    id: 'Gobskin',
    type: 'mitigation',
    abilityId: '4780',
  },
  {
    id: 'Exuviation',
    type: 'heal',
    abilityId: '478E',
  },
  {
    // only heals in heal mimic
    id: 'Stotram',
    type: 'heal',
    abilityId: '5B78',
  },
  {
    id: 'Angel\'s Snack',
    type: 'heal',
    abilityId: '5AE8',
  },

  // ******************** Field Operations & Misc. ******************** //
  // ************ Bozja ************ //
  {
    id: 'Lost Aethershield',
    type: 'mitigation',
    abilityId: '5753',
  },
] as const;

export const generateBuffTriggerIds = (): string[] => {
  const buffs: MissableBuff[] = [...missedEffectBuffMap, ...missedAbilityBuffMap];
  buffs.sort((a, b) => a.id.localeCompare(b.id));
  return buffs.map((buff) => `Buff ${buff.id}`);
};
