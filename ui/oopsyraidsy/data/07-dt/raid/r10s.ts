import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { GetShareMistakeText, playerDamageFields } from '../../../oopsy_common';

export interface Data extends OopsyData {
  hasWateryGrave: { [name: string]: boolean };
}

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacHeavyweightM2Savage,
  damageWarn: {
    'R10S Alley-oop Double-dip Follow-up': 'B5DF',
    'R10S Reverse Alley-oop Follow-up': 'B5E2',
    'R10S Sickest Take-off': 'B5CE',
    'R10S Deep Varial': 'B5D3',
    'R10S Steam Burst': 'B5FB', // Orb explosion
    'R10S Flame Floater Split': 'B5BF',
  },
  gainsEffectWarn: {
    'R10S Burns': 'BFA', // standing in the fire, 15s
  },
  shareWarn: {
    'R10S Flame Floater 1': 'B5BA',
    'R10S Flame Floater 2': 'B5BB',
    'R10S Flame Floater 3': 'B5BC',
    'R10S Flame Floater 4': 'B5BD',
    'R10S Flame Floater 5': 'B5BE',
    'R10S Alley-oop Inferno': 'B5C1', // Red Hot spread
    'R10S Awesome Splash 1': 'B5CF', // Deep Blue spread
    'R10S Awesome Splash 2': 'B5D7', // Deep Blue spread after Fire/Watersnaking
    'R10S Alley-oop Double-dip First Hit': 'B5DE',
    'R10S Reverse Alley-oop First Hit': 'B5E1',
    'R10S Blasting Snap': 'B5F1', // Red Hot spread during Insane Air
    'R10S Plunging Snap': 'B5F2', // Deep Blue spread during Insane Air
    'R10S Hot Aerial 1': 'B91D',
    'R10S Hot Aerial 2': 'B91E',
    'R10S Hot Aerial 3': 'B91F',
    'R10S Hot Aerial 4': 'B920',
    'R10S Hot Aerial 5': 'B921',
    'R10S Xtreme Wave Deep Blue': 'B5D2', // Deep Blue's Xtreme Wave
  },
  shareFail: {
    'R10S Deep Impact': 'ADC6', // Deep Blue tankbuster
    'R10S Vertical Blast': 'B5F9', // Red Hot tankbuster during Insane Air
    'R10S Vertical Plunge': 'B5FA', // Deep Blue tankbuster during Insane Air
  },
  initData: () => {
    return {
      hasWateryGrave: {},
    };
  },
  triggers: [
    {
      id: 'R10S Watery Grave Gain',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '12DD' }),
      run: (data, matches) => {
        data.hasWateryGrave[matches.target] = true;
      },
    },
    {
      id: 'R10S Watery Grave Lose',
      type: 'LosesEffect',
      netRegex: NetRegexes.losesEffect({ effectId: '12DD' }),
      run: (data, matches) => {
        data.hasWateryGrave[matches.target] = false;
      },
    },
    {
      // Share warn for Red Hot's Xtreme Wave, except players affected by Watery Grave.
      id: 'R10S Xtreme Wave Red Hot',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: 'B5D1', ...playerDamageFields }),
      condition: (data, matches) => !data.hasWateryGrave[matches.target],
      mistake: (data, matches) => {
        const numTargets = parseInt(matches.targetCount);
        const numWateryGrave = Object.values(data.hasWateryGrave).filter(Boolean).length;
        if (isNaN(numTargets) || numTargets <= numWateryGrave + 1)
          return;
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: GetShareMistakeText(matches.ability, numTargets - numWateryGrave),
        };
      },
    },
    {
      id: 'R10S Watery Grave Gains Vulnerability Down',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '3A1', target: 'watery grave' }),
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: matches.effect,
        };
      },
    },
  ],
  timelineReplace: [
    {
      locale: 'de',
      replaceSync: {
        'watery grave': 'Wasserkerker',
      },
    },
    {
      locale: 'fr',
      replaceSync: {
        'watery grave': 'prison aquatique',
      },
    },
    {
      locale: 'ja',
      replaceSync: {
        'watery grave': '水牢',
      },
    },
    {
      locale: 'cn',
      replaceSync: {
        'watery grave': '水牢',
      },
    },
    {
      locale: 'ko',
      replaceSync: {
        'watery grave': '수중 감옥',
      },
    },
  ],
};

export default triggerSet;
