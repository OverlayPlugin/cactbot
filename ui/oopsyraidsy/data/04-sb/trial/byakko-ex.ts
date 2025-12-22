import NetRegexes from '../../../../../resources/netregexes';
import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';
import { playerDamageFields } from '../../../oopsy_common';

export type Data = OopsyData;

// Byakko Extreme
const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheJadeStoaExtreme,
  damageWarn: {
    // Popping Unrelenting Anguish bubbles
    'ByakkoEx Aratama': '27F6',
    // Stepping in growing orb
    'ByakkoEx Vacuum Claw': '27E9',
    // Lightning Puddles
    'ByakkoEx Hunderfold Havoc 1': '27E5',
    'ByakkoEx Hunderfold Havoc 2': '27E6',
  },
  damageFail: {
    'ByakkoEx Sweep The Leg': '27DB',
    'ByakkoEx Fire and Lightning': '27DE',
    'ByakkoEx Distant Clap': '27DD',
    // Midphase line attack
    'ByakkoEx Imperial Guard': '27F1',
  },
  triggers: [
    {
      // Pink bubble collision
      id: 'ByakkoEx Ominous Wind',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '27EC', ...playerDamageFields }),
      mistake: (_data, matches) => {
        return {
          type: 'warn',
          blame: matches.target,
          reportId: matches.targetId,
          text: {
            en: 'bubble collision',
            de: 'Blasen sind zusammengestoßen',
            fr: 'Collision avec une bulle',
            ja: '衝突',
            cn: '相撞',
            tc: '相撞',
            ko: '장판 겹쳐서 터짐',
          },
        };
      },
    },
  ],
};

export default triggerSet;
