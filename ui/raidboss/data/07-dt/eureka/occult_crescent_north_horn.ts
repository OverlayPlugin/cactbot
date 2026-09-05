import Conditions from '../../../../../resources/conditions';
// import PhantomJobUtils from '../../../../../resources/occult_crescent_common';
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
  manyMouthsToFeed: '39B',
  doubledTrouble: '398',
  quarriedAway: '397',
  forbiddenFolios: '39A',
  cursedResurgence: '3B9',
  imbalancedDiet: '3BF',
  webOfTerror: '3CA',
  aBeastUnleashed: '3C0',
  darkArtistry: '3A8',
  familiarTactics: '390',
  appallingBehavior: '3BA',
  tinyTerror: '3CC',
  lostOnTheWind: '3A9',
  aheadOfTheCompetition: '3BC',
  acceptNoImitators: '3CB',
  // Forked Tower: Magic and Forked Tower: Magic (Extreme) share CE IDs.
  twoHeadedAevis: '389',
  lowerVestibule: '38D',
  swordDancer: '38A',
  centralMezzanine: '38E',
  necrophobia: '38B',
  upperVeil: '38F',
  theIndex: '38C',
};

/*
const headMarkerData = {
} as const;
*/

// Used to filter the GainsEffect for Phantom Job Tracker
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

const triggerSet: TriggerSet<Data> = {
  id: 'TheOccultCrescentNorthHorn',
  zoneId: ZoneId.TheOccultCrescentNorthHorn,
  comments: {
    en: 'Occult Crescent North Horn critical encounter triggers/timeline.',
    cn: '蜃景幻界新月岛 北征之章 紧急遭遇战 触发器/时间轴。',
    ko: '초승달 섬: 북부편 비상 조우 트리거/타임라인',
  },
  timelineFile: 'occult_crescent_north_horn.txt',
  initData: () => ({}),
  resetWhenOutOfCombat: false,
  timelineTriggers: [],
  triggers: [
    // ---------------------- Setup --------------------------
    {
      id: 'Occult Crescent North Horn Critical Encounter',
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
      id: 'Occult Crescent North Horn Phantom Job Tracker',
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
    /*
    {
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
      'replaceText': {
        'Claw to Tail/Tail to Claw \(Tail/Claw\)': 'Tail/Claw',
        'Claw to Tail \(Tail\)': 'Tail',
        'Tail to Claw \(Claw\)': 'Claw',
        'Nigh-drawn Eruption/Far-flung Eruption': 'Nigh-drawn/Far-flung Eruption',
        'Far-flung Eruption/Nigh-drawn Eruption': 'Far-flung/Nigh-drawn Eruption',
        'Knowledge Level 4 Holy/Knowledge Level 3 Flare/Knowledge Level 5 Death/Prime Knowledge Level Death':
          'Knowledge Level Check',
        'Central Gardening/Side Gardening': 'Central/Side Gardening',
        'Side Gardening/Central Gardening': 'Side/Central Gardening',
        'Regurgitomato/Regurgitonion': 'Regurgitomato/onion',
        'Regurgitonion/Regurgitomato': 'Regurgitonion/tomato',
        'Rotten Tomato/Rotten Onion': 'Rotten Tomato/Onion',
        'Shapeshifting Supercell': 'Supercell',
        'Right-Left Combination/Left-Right Combination': 'Right-Left/Left-Right Combination',
        'Tiny Flare/Tiny Holy': 'Tiny Flare/Holy',
        'Tiny Meteor (castbar)': '--sync--',
      },
    },
    {
      'locale': 'de',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'cn',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'tc',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {},
      'replaceText': {},
    },
  ],
};

export default triggerSet;
