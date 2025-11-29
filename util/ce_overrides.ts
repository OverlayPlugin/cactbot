// This file contains data used in the `gen_ce_info_and_maps.ts` file to
// supplement the data from xivapi. In the future it may also contain proper
// override data in the event that something is removed from the game.
//
// Update this file manually to maintain this data; then re-run the script.

import { LocaleText } from '../types/trigger';

type NameKeyToDirectorUpdateId = {
  [name: string]: string;
};

type CeInfoType = {
  [key: string]: {
    directorId: string;
    name: LocaleText;
  };
};

type ZoneNameToCeInfo = {
  [name: string]: CeInfoType;
};

type ZoneNameToExcludedCEs = {
  [name: string]: [string];
};

type OverrideContainer = {
  directorIds: NameKeyToDirectorUpdateId;
  syntheticCEs: ZoneNameToCeInfo;
  excludedCEs: ZoneNameToExcludedCEs;
};

// List of values appearing in the DirectorUpdate network log events.
//
// Currently, these ids are unfortunately gathered by hand and don't seem to
// correlate to any particular bits of data within xivapi, or other sources.
// There is a game log message with the CE name when you register for a CE,
// as well as a 0x21 DirectorUpdate message with this id when you actually
// teleport into the event. The 0x21 message is used by encounter tools and
// by timelines and triggers to identify the critical engagement or
// encounter.
const _DIRECTOR_UPDATE_VALUES: NameKeyToDirectorUpdateId = {
  // The Bozjan Southern Front
  'TheBattleOfCastrumLacusLitore': '1D7',
  'KillItWithFire': '1D4',
  'TheBayingOfTheHounds': '1CC',
  'VigilForTheLost': '1D0',
  'AcesHigh': '1D2',
  'TheShadowOfDeathsHand': '1CD',
  'TheFinalFurlong': '1D5',
  'TheHuntForRedChoctober': '1CA',
  'BeastOfMan': '1DB',
  'TheFiresOfWar': '1D6',
  'PatriotGames': '1D1',
  'TrampledUnderHoof': '1CE',
  'AndTheFlamesWentHigher': '1D3',
  'MetalFoxChaos': '1CB',
  'RiseOfTheRobots': '1DF',
  'WhereStrodeTheBehemoth': '1DC',
  // Zadnor
  'TheDalriada': '213',
  'OnSerpentsWings': '211',
  'FeelingTheBurn': '20E',
  'TheBrokenBlade': '21F',
  'FromBeyondTheGrave': '21B',
  'WithDiremiteAndMain': '221',
  'HereComesTheCavalry': '21C',
  'HeadOfTheSnake': '21E',
  'ThereWouldBeBlood': '210',
  'NeverCryWolf': '20F',
  'TimeToBurn': '21D',
  'LeanMeanMagitekMachines': '218',
  'WornToAShadow': '222',
  'AFamiliarFace': '212',
  'LooksToDieFor': '207',
  'TakingTheLyonsShare': '220',
  // Occult Crescent: South Horn
  'ScourgeOfTheMind': '320',
  'TheBlackRegiment': '322',
  'TheUnbridled': '348',
  'CrawlingDeath': '330',
  'CalamityBound': '32F',
  'TrialByClaw': '349',
  'FromTimesBygone': '323',
  'CompanyOfStone': '343',
  'SharkAttack': '32E',
  'OnTheHunt': '338',
  'WithExtremePrejudice': '339',
  'NoiseComplaint': '327',
  'CursedConcern': '32B',
  'EternalWatch': '329',
  'FlameOfDusk': '32A',
};

// Forked Tower CEs do not get listed in the XIV API.
const _SYNTHETIC_CE_INFO: ZoneNameToCeInfo = {
  'South Horn': {
    'DemonTablet': {
      'directorId': '33B',
      'name': {
        'en': 'Demon Tablet',
      },
    },
    'CentralGallery': {
      'directorId': '33F',
      'name': {
        'en': 'Central Passages',
      },
    },
    'DeadStars': {
      'directorId': '33C',
      'name': {
        'en': 'Dead Stars: Nereid, Triton, and Phobos',
      },
    },
    'UpperExterior': {
      'directorId': '340',
      'name': {
        'en': 'Pronged Passages',
      },
    },
    'MarbleDragon': {
      'directorId': '33D',
      'name': {
        'en': 'Marble Dragon',
      },
    },
    'BindingLock': {
      'directorId': '341',
      'name': {
        'en': 'The Binding Lock',
      },
    },
    'InfamyOfBloodMagitaur': {
      'directorId': '33E',
      'name': {
        'en': 'Infamy Of Blood: Magitaur',
      },
    },
  },
};

const _EXCLUDED_CE_BY_ZONE_NAME: ZoneNameToExcludedCEs = {
  'South Horn': [
    'TheForkedTowerBlood',
  ],
};

const Overrides: OverrideContainer = {
  directorIds: _DIRECTOR_UPDATE_VALUES,
  syntheticCEs: _SYNTHETIC_CE_INFO,
  excludedCEs: _EXCLUDED_CE_BY_ZONE_NAME,
};

export default Overrides;
