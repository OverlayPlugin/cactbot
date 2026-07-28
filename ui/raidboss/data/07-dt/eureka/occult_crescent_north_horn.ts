import Conditions from '../../../../../resources/conditions';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  ce?: string;
  phantomJob?: string;
  phantomJobLevel?: number;
}

// List of events:
// https://github.com/xivapi/ffxiv-datamining/blob/master/csv/en/DynamicEvent.csv
//
// These ids are (unfortunately) gathered by hand and don't seem to correlate
// to any particular bits of data.  However, there's a game log message when you
// register for a CE and an 0x21 message with this id when you accept and
// teleport in.  This avoids having to translate all of these names and also
// guarantees that the player is actually in the CE for the purpose of
// filtering triggers.
const ceIds: { [ce: string]: string } = {
};

/*
const headMarkerData = {
} as const;
*/

// Used to filter the GainsEffect
const phantomJobEffectIds = [
  '1092', // Freelancer
  '1106', // Knight
  '1107', // Berserker
  '1108', // Monk
  '1109', // Ranger
  '1110', // Oracle
  '1111', // Thief
  '110A', // Samurai
  '110B', // Bard
  '110C', // Geomancer
  '110D', // Time Mage
  '110E', // Cannonneer
  '110F', // Chemist
  '12C3', // Mystic Knight
  '12C4', // Gladiator
  '12C5', // Dancer
  '14D0', // Ninja
  '14D1', // White Mage
  '14D2', // Black Mage
  '14D3', // Dragoon
  '14D4', // Summoner
  '14D5', // Blue Mage
  '14D6', // Red Mage
  '14D7', // Necromancer
];

// Useful for matching on job name in condition trigger
/*
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
  'ninja' : '14D0',
  'whiteMage': '14D1',
  'blackMage': '14D2',
  'dragoon': '14D3',
  'summoner': '14D4',
  'blueMage': '14D5',
  'redMage': '14D6',
  'necromancer': '14D7',
} as const;
*/

// Return if the player has a phantom job that can dispel
// Phantom Time Mage Lv 4: Dispel
// Phantom Necromance Lv 5: Doomsday (enemies in a line)
/*
const phantomCanDispel = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 4)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 5)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can slow
// Phantom Time Mage Lv 1: Slowga
/*
const phantomCanSlow = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.timeMage && phantomJobLevel >= 1)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can cleanse
// Phantom Oracle Lv 2: Recuperation
/*
const phantomCanCleanse = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 2)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can freeze time
// Phantom Bard Lv 2: Romeo's Ballad (aoe)
// Phantom Dancer Lv 1 may be able to use Dance with Tempting Tango proc (single-target)
// Phantom Necromancer Lv2 Deep Freeze (enemies in a line)
/*
const phantomCanFreeze = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.bard && phantomJobLevel >= 2)
    return true;
  if (phantomJob === phantomJobData.dancer && phantomJobLevel >= 1)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 2)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that can suspend
// Phantom Geomancer Lv 4: Suspend
/*
const phantomCanSuspend = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.geomancer && phantomJobLevel >= 4)
    return true;
  return false;
};
*/

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
/*
const phantomCaresAboutTankbuster = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
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
*/

// Return if the player has a phantom job that can block physical damage
// Phantom Samurai Lv 2: Shirahadori
// Phantom Oracle Lv 6: Invulnerability
// Phantom Ninja Lv 5: Image
// Phantom Necromance Lv 1: Drain Touch, requires target, self only, 6s, HP can't be reduced < 1
/*
const phantomCanBlockPhysical = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
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
*/

// Return if the player has a phantom job that can block magical damage
// Phantom Oracle Lv 6: Invulnerability
// Phantom White Mage Lv 3: Occult Blink
// Phantom Necromance Lv 1: Drain Touch, requires target, self only, 6s, HP can't be reduced < 1
/*
const phantomCanBlockMagical = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
  if (phantomJob === phantomJobData.oracle && phantomJobLevel >= 6)
    return true;
  if (phantomJob === phantomJobData.whiteMage && phantomJobLevel >= 3)
    return true;
  if (phantomJob === phantomJobData.necromancer && phantomJobLevel >= 1)
    return true;
  return false;
};
*/

// Return if the player has a phantom job that helps with enemy aoes
// Phantom Bard Lv 3: Mighty March (+20% MaxHP)
// Phantom Ranger Lv 6: Occult Unicorn (40k AoE Shield)
// Phantom Dancer Lv 4: Mesmerize (Require's target, 4s 40% damage reduction then 100s 10% damage reduction)
// Phantom Geomance Lv 2 may be able to use Weather with Blessed Rain, Misty Mirage, Sunbath, or Cloudy Caress effects
// Phantom White Mage Lv 2: Occult Cure III (30k AoE Cure III)
// Phantom Summoner Lv 3: Earthen Wall (40k AoE Shield)
// Phantom Blue Mage Lv 2: Occult Mighty Guard from Occult Learning II (15s 20% damage reduction)
//   Blue Mage requires learning from a Crescent Bibliotaph, assumes they have it
// Phantom Blue Mage Lv 3: Occult White Wind from Occult Learning III: Self-Benediction and then
//   heals party for current HP. Blue Mage requires learning from a Crescent Flame
/*
const phantomCaresAboutAOE = (
  phantomJob: string,
  phantomJobLevel: number,
): boolean => {
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
*/

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentNorthHorn',
  zoneId: ZoneId.TheOccultCrescentNorthHorn,
  comments: {
    en: 'Occult Crescent North Horn critical encounter triggers/timeline.',
  },
  timelineFile: 'occult_crescent_north_horn.txt',
  initData: () => ({}),
  resetWhenOutOfCombat: false,
  timelineTriggers: [],
  triggers: [
    // ---------------------- Setup --------------------------
    {
      id: 'Occult Crescent Critical Encounter',
      type: 'ActorControl',
      netRegex: { command: '80000014' },
      run: (data, matches) => {
        // This fires when you win, lose, or teleport out.
        if (matches.data0 === '00') {
          if (data.ce !== undefined && data.options.Debug)
            console.log(`Stop CE: ${data.ce}`);
          // Stop any active timelines.
          data.StopCombat();
          // Prevent further triggers for any active CEs from firing.
          delete data.ce;
          return;
        }

        delete data.ce;
        const ceId = matches.data0.toUpperCase();
        for (const key in ceIds) {
          if (ceIds[key] === ceId) {
            if (data.options.Debug)
              console.log(`Start CE: ${key} (${ceId})`);
            data.ce = key;
            return;
          }
        }

        if (data.options.Debug)
          console.log(`Start CE: ??? (${ceId})`);
      },
    },
    {
      id: 'Occult Crescent Phantom Job Tracker',
      // count also contains a Phantom Job id and level, it's supposed to be two bytes but has weird padding in logs
      // Expecting first two characters to be part of Phantom Job id, and the later two to be the level
      // First digit (South Horn jobs) and first two (North Horn jobs) are the job:
      // Introduced in North Horn:
      // Necromancer = 17
      // Red Mage = 16
      // Blue Mage = 15
      // Summoner = 14
      // Dragoon = 13
      // Black Mage = 12
      // White Mage = 11
      // Ninja = 10
      // Introduced in South Horn:
      // Dancer = F
      // Gladiator = E
      // Mystic Knight = D
      // Thief = C
      // Oracle = B
      // Chemist = A
      // Cannoneer = 9
      // Time Mage = 8
      // Geomancer = 7
      // Bard = 6
      // Samurai = 5
      // Ranger = 4
      // Monk = 3
      // Berserker = 2
      // Knight = 1
      // Freelancer = null
      // Freelancer level is accumulation of maxed jobs +1, can also be inferred from stacks of Phantom Mastery (1082)
      type: 'GainsEffect',
      netRegex: { effectId: [...phantomJobEffectIds], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.phantomJob = matches.effectId;
        const jobData = matches.count?.padStart(4, '0');

        // Assuming this isn't possible given the filter on statuses
        if (jobData === undefined)
          return;

        data.phantomJobLevel = parseInt(jobData.slice(2), 16);
      },
    },
/*    {
      id: 'Occult Crescent Forked Tower: Magic Clear Data',
      type: 'SystemLogMessage',
      // "is no longer sealed"
      netRegex: { id: '7DE', capture: false },
      run: (data) => ,
    },
*/
    // ---------------------- CEs --------------------------
    // ------------------- FATEs -----------------------
    // ------------------- Forked Tower: Magic -----------------------
    // -------------- Forked Tower: Magic (Extreme) ------------------
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {},
    },
    {
      'locale': 'de',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'fr',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'ja',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'cn',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'tc',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'ko',
      'replaceSync': {},
      'replaceText': {},
    },
  ],
};

export default triggerSet;
