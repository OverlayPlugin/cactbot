// import PhantomJobUtils from '../../../../../resources/occult_crescent_common';
// List of events:
// https://github.com/xivapi/ffxiv-datamining/blob/master/csv/en/DynamicEvent.csv
//
// These ids are (unfortunately) gathered by hand and don't seem to correlate
// to any particular bits of data.  However, there's a game log message when you
// register for a CE and an 0x21 message with this id when you accept and
// teleport in.  This avoids having to translate all of these names and also
// guarantees that the player is actually in the CE for the purpose of
// filtering triggers.
const ceIds = {};
/*
const headMarkerData = {
} as const;
*/
// Used to filter the GainsEffect for Phantom Job Tracker
const phantomJobEffectIds = [
  '1092',
  '1106',
  '1107',
  '1108',
  '1109',
  '1110',
  '1111',
  '110A',
  '110B',
  '110C',
  '110D',
  '110E',
  '110F',
  '12C3',
  '12C4',
  '12C5',
  '14D0',
  '14D1',
  '14D2',
  '14D3',
  '14D4',
  '14D5',
  '14D6',
  '14D7', // Necromancer
];
Options.Triggers.push({
  id: 'TheOccultCrescentNorthHorn',
  zoneId: ZoneId.TheOccultCrescentNorthHorn,
  comments: {
    en: 'Occult Crescent North Horn critical encounter triggers/timeline.',
    cn: '蜃景幻界新月岛 北征之章 紧急遭遇战 触发器/时间轴。',
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
});
