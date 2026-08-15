// Phantom Job data and helper functions used in Occult Crescent's South Horn and North Horn
// Map for matching on job name in condition trigger
const phantomJobData = {
  'freelancer': '1092',
  'knight': '1106',
  'berserker': '1107',
  'monk': '1108',
  'ranger': '1109',
  'oracle': '1110',
  'thief': '1111',
  'samurai': '110A',
  'bard': '110B',
  'geomancer': '110C',
  'timeMage': '110D',
  'cannoneer': '110E',
  'chemist': '110F',
  'mysticKnight': '12C3',
  'gladiator': '12C4',
  'dancer': '12C5',
  'ninja': '14D0',
  'whiteMage': '14D1',
  'blackMage': '14D2',
  'dragoon': '14D3',
  'summoner': '14D4',
  'blueMage': '14D5',
  'redMage': '14D6',
  'necromancer': '14D7',
} as const;

// Return if the player has a phantom job that can dispel
// Phantom Time Mage Lv 4: Dispel
// Phantom Necromance Lv 5: Doomsday (enemies in a line)
const canDispel = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 4)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 5)
    return true;
  return false;
};

// Return if the player has a phantom job that can slow
// Phantom Time Mage Lv 1: Slowga
const canSlow = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 1)
    return true;
  return false;
};

// Return if the player has a phantom job that can cleanse
// Phantom Oracle Lv 2: Recuperation
const canCleanse = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 2)
    return true;
  return false;
};

// Return if the player has a phantom job that can freeze time
// Phantom Bard Lv 2: Romeo's Ballad (aoe)
// Phantom Dancer Lv 1 may be able to use Dance with Tempting Tango proc (single-target)
// Phantom Necromancer Lv2: Deep Freeze (enemies in a line)
const canFreeze = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.bard && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 1)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 2)
    return true;
  return false;
};

// Return if the player has a phantom job that can suspend
// Phantom Geomancer Lv 4: Suspend
const canSuspend = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.geomancer && phantomJobLevel >= 4)
    return true;
  return false;
};

// Return if the player has a phantom job that can reduce tankbuster
// Phantom Knight Lv 4: Phantom Guard + Enhanced Phantom Guard (90%)
// Phantom Knight Lv 6: Pledge
// Phantom Oracle Lv 6: Invulnerability
// Phantom Dancer Lv 3: Steadfast Dance (10% MaxHP Barrier)
// Phantom Dancer Lv 4: Mesmerize (40%)
// Phantom Mystic Knight Lv 2: Magic Shell (20% MaxHP Barrier of caster)
// Phantom Gladiator Lv 2: Defend (50%)
// Phantom Blue Mage Lv 2: Occult Mighty Guard from Occult Learning II (15s 20% damage reduction)
//   Blue Mage requires learning from a Crescent Bibliotaph, assumes they have it
// These may work using targetIsYou or specific encounter, but excluded from general use:
// Phantom Black Mage Lv 4: Occult Toad (99% reduction on target and stops all non-autos)
// Phantom Dragoon Lv 1: Occult Jump (60%), requires target, self only, 2s
// Phantom Dragoon Lv 4: Enhanced Occult Jump (90%)
// Phantom Necromance Lv 1: Drain Touch, requires target, self only, 6s, HP can't be reduced < 1
const caresAboutTankbuster = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.knight && phantomJobLevel >= 4)
    return true;
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.mysticKnight && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.gladiator && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.blueMage && phantomJobLevel >= 2)
    return true;
  return false;
};

// Return if the player has a phantom job that can block physical damage
// Phantom Samurai Lv 2: Shirahadori
// Phantom Oracle Lv 6: Invulnerability
// Phantom Ninja Lv 5: Image
// Phantom Necromance Lv 1: Drain Touch, requires target, self only, 6s, HP can't be reduced < 1
const canBlockPhysical = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.samurai && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.ninja && phantomJobLevel >= 5)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 1)
    return true;
  return false;
};

// Return if the player has a phantom job that can block magical damage
// Phantom Oracle Lv 6: Invulnerability
// Phantom White Mage Lv 3: Occult Blink
// Phantom Necromance Lv 1: Drain Touch, requires target, self only, 6s, HP can't be reduced < 1
const canBlockMagical = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.whiteMage && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 1)
    return true;
  return false;
};

// Return if the player has a phantom job that helps with enemy aoes
// Phantom Bard Lv 3: Mighty March (+20% MaxHP)
// Phantom Ranger Lv 6: Occult Unicorn (40k AoE Shield)
// Phantom Dancer Lv 4: Mesmerize (Requires target, 4s 40% damage reduction then 100s 10% damage
//   reduction)
// Phantom Geomance Lv 2 may be able to use Weather with Blessed Rain, Misty Mirage, Sunbath, or
//   Cloudy Caress effects
// Phantom White Mage Lv 2: Occult Cure III (30k AoE Cure III)
// Phantom Summoner Lv 3: Earthen Wall (40k AoE Shield)
// Phantom Blue Mage Lv 2: Occult Mighty Guard from Occult Learning II (15s 20% damage reduction)
//   Blue Mage requires learning from a Crescent Bibliotaph, assumes they have it
// Phantom Blue Mage Lv 3: Occult White Wind from Occult Learning III: Self-Benediction and then
//   heals party for current HP. Blue Mage requires learning from a Crescent Flame
const caresAboutAOE = (phantomJob: string, phantomJobLevel: number): boolean => {
  if (phantomJob === phantomJobData.bard && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.ranger && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 4)
    return true;
  if (phantomJob === phantomJobData.whiteMage && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.summoner && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.blueMage && phantomJobLevel >= 2)
    return true;
  return false;
};

const PhantomJobUtils = {
  canDispel: canDispel,
  canSlow: canSlow,
  canCleanse: canCleanse,
  canFreeze: canFreeze,
  canSuspend: canSuspend,
  caresAboutTankbuster: caresAboutTankbuster,
  canBlockPhysical: canBlockPhysical,
  canBlockMagical: canBlockMagical,
  caresAboutAOE: caresAboutAOE,
} as const;

export default PhantomJobUtils;
