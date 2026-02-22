import NetRegexes from '../../../../resources/netregexes';
import ZoneId from '../../../../resources/zone_id';
import { OopsyData } from '../../../../types/data';
import { OopsyTriggerSet } from '../../../../types/oopsy';

export interface Data extends OopsyData {
  bootCount?: number;
  pokeCount?: number;
}

// Test mistake triggers.
const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.MiddleLaNoscea,
  triggers: [
    {
      id: 'Test Bow',
      type: 'GameLog',
      netRegex: NetRegexes.gameNameLog({
        line: 'You bow courteously to the striking dummy.*?',
      }),
      mistake: (data) => {
        return {
          type: 'pull',
          blame: data.me,
          text: {
            en: 'Bow',
            de: 'Bogen',
            fr: 'Arc',
            ja: 'お辞儀',
            cn: '鞠躬',
            ko: '인사',
            tc: '鞠躬',
          },
        };
      },
    },
    {
      id: 'Test Wipe',
      type: 'GameLog',
      netRegex: NetRegexes.gameNameLog({
        line: 'You bid farewell to the striking dummy.*?',
      }),
      mistake: (data) => {
        return {
          type: 'wipe',
          blame: data.me,
          text: {
            en: 'Party Wipe',
            de: 'Gruppenwipe',
            fr: 'Party Wipe',
            ja: 'ワイプ',
            cn: '团灭',
            ko: '파티 전멸',
            tc: '團滅',
          },
        };
      },
    },
    {
      id: 'Test Bootshine',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '35' }),
      condition: (data, matches) => {
        if (matches.source !== data.me)
          return false;
        const strikingDummyByLocale = {
          en: 'Striking Dummy',
          de: 'Trainingspuppe',
          fr: 'Mannequin d\'entraînement',
          ja: '木人',
          cn: '木人',
          ko: '나무인형',
          tc: '木人',
        };
        const strikingDummyNames = Object.values(strikingDummyByLocale);
        return strikingDummyNames.includes(matches.target);
      },
      mistake: (data, matches) => {
        data.bootCount ??= 0;
        data.bootCount++;
        const text = `${matches.ability} (${data.bootCount}): ${data.DamageFromMatches(matches)}`;
        return { type: 'warn', blame: data.me, reportId: matches.sourceId, text: text };
      },
    },
    {
      id: 'Test Leaden Fist',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '745' }),
      condition: (data, matches) => matches.source === data.me,
      mistake: (data, matches) => {
        return { type: 'good', blame: data.me, reportId: matches.sourceId, text: matches.effect };
      },
    },
    {
      id: 'Test Oops',
      type: 'GameLog',
      netRegex: NetRegexes.echo({ line: '.*oops.*' }),
      suppressSeconds: 10,
      mistake: (data, matches) => {
        return { type: 'fail', blame: data.me, text: matches.line };
      },
    },
    {
      id: 'Test Poke Collect',
      type: 'GameLog',
      netRegex: NetRegexes.gameNameLog({
        line: 'You poke the striking dummy.*?',
      }),
      run: (data) => {
        data.pokeCount = (data.pokeCount ?? 0) + 1;
      },
    },
    {
      id: 'Test Poke',
      type: 'GameLog',
      netRegex: NetRegexes.gameNameLog({
        line: 'You poke the striking dummy.*?',
      }),
      delaySeconds: 5,
      mistake: (data) => {
        // 1 poke at a time is fine, but more than one in 5 seconds is (OBVIOUSLY) a mistake.
        if (!data.pokeCount || data.pokeCount <= 1)
          return;
        return {
          type: 'fail',
          blame: data.me,
          text: {
            en: `Too many pokes (${data.pokeCount})`,
            de: `Zu viele Piekser (${data.pokeCount})`,
            fr: `Trop de touches (${data.pokeCount})`,
            ja: `いっぱいつついた (${data.pokeCount})`,
            cn: `戳太多下啦 (${data.pokeCount})`,
            ko: `너무 많이 찌름 (${data.pokeCount}번)`,
            tc: `戳太多下啦 (${data.pokeCount})`,
          },
        };
      },
      run: (data) => delete data.pokeCount,
    },
  ],
  timelineReplace: [
    {
      locale: 'de',
      replaceSync: {
        'You bid farewell to the striking dummy': 'Du winkst der Trainingspuppe zum Abschied zu',
        'You bow courteously to the striking dummy':
          'Du verbeugst dich hochachtungsvoll vor der Trainingspuppe',
        'You poke the striking dummy': 'Du stupst die Trainingspuppe an',
      },
    },
    {
      locale: 'fr',
      replaceSync: {
        'You bid farewell to the striking dummy':
          'Vous faites vos adieux au mannequin d\'entraînement',
        'You bow courteously to the striking dummy':
          'Vous vous inclinez devant le mannequin d\'entraînement',
        'You poke the striking dummy':
          'Vous touchez légèrement le mannequin d\'entraînement du doigt',
      },
    },
    {
      locale: 'ja',
      replaceSync: {
        'You bid farewell to the striking dummy': '.*は木人に別れの挨拶をした',
        'You bow courteously to the striking dummy': '.*は木人にお辞儀した',
        'You poke the striking dummy': '.*は木人をつついた',
      },
    },
    {
      locale: 'cn',
      replaceSync: {
        'You bid farewell to the striking dummy': '.*向木人告别',
        'You bow courteously to the striking dummy': '.*恭敬地对木人行礼',
        'You poke the striking dummy': '.*用手指戳向木人',
      },
    },
    {
      locale: 'ko',
      replaceSync: {
        'You bid farewell to the striking dummy': '.*나무인형에게 작별 인사를 합니다',
        'You bow courteously to the striking dummy': '.*나무인형에게 공손하게 인사합니다',
        'You poke the striking dummy': '.*나무인형을 쿡쿡 찌릅니다',
      },
    },
    {
      locale: 'tc',
      replaceSync: {
        'You bid farewell to the striking dummy': '.*向木人告别',
        'You bow courteously to the striking dummy': '.*恭敬地對木人行禮',
        'You poke the striking dummy': '.*用手指戳向木人',
      },
    },
  ],
};

export default triggerSet;
