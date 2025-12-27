import { Responses } from '../../../../resources/responses';
import ZoneId from '../../../../resources/zone_id';
import { RaidbossData } from '../../../../types/data';
import { TriggerSet } from '../../../../types/trigger';

export type Data = RaidbossData;

const caresAboutTankStuff = (data: RaidbossData) => {
  return data.role === 'tank' || data.role === 'healer' || data.job === 'BLU';
};

// Triggers for all occasions and zones.
const triggerSet: TriggerSet<Data> = {
  id: 'CactbotGeneral',
  zoneId: ZoneId.MatchAll,
  comments: {
    en: 'General triggers for all occasions and zones',
    de: 'Allgemeine Trigger für alle Anlässe und Zonen',
    fr: 'Triggers généraux pour toutes les occasions et zones',
    ja: '全ての状況、全てのエリアに共通するトリガー',
    cn: '适用于所有场合和区域的通用触发器',
    tc: '適用於所有場合和區域的通用觸發器',
    ko: '모든 상황과 지역을 위한 범용 트리거',
  },
  triggers: [
    {
      id: 'General Provoke',
      comment: {
        cn: '仅在自身或团队成员释放“挑衅”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“挑釁”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 도발을 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '1D6D' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) => {
        return output.text!({ player: data.party.member(matches.source) });
      },
      outputStrings: {
        text: {
          en: 'Provoke: ${player}',
          de: 'Herausforderung: ${player}',
          fr: 'Provocation : ${player}',
          ja: '挑発: ${player}',
          cn: '挑衅: ${player}',
          tc: '挑釁: ${player}',
          ko: '도발: ${player}',
        },
      },
    },
    {
      id: 'General Frog Legs',
      comment: {
        cn: '仅在自身或团队成员释放“蛙腿”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“蛙腿”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 개구리 다리를 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '4783' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      suppressSeconds: 0.5,
      infoText: (data, matches, output) => {
        if (matches.targetId === 'E0000000')
          return output.noTarget!({ player: data.party.member(matches.source) });
        return output.text!({ player: data.party.member(matches.source) });
      },
      outputStrings: {
        text: {
          en: 'Provoke: ${player}',
          de: 'Herausforderung: ${player}',
          fr: 'Provocation : ${player}',
          ja: '挑発: ${player}',
          cn: '挑衅: ${player}',
          tc: '挑釁: ${player}',
          ko: '도발: ${player}',
        },
        noTarget: {
          en: 'Provoke: ${player} (missed)',
          de: 'Herausforderung: ${player} (verfehlt)',
          fr: 'Provocation : ${player} (manquée)',
          ja: '挑発: ${player} (タゲなし)',
          cn: '挑衅: ${player} (无目标)',
          tc: '挑釁: ${player} (無目標)',
          ko: '도발: ${player} (빗나감)',
        },
      },
    },
    {
      id: 'General Shirk',
      comment: {
        cn: '仅在自身或团队成员释放“退避”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“退避”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 기피를 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '1D71' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Shirk: ${player}',
          de: 'Geteiltes Leid: ${player}',
          fr: 'Dérobade : ${player}',
          ja: 'シャーク: ${player}',
          cn: '退避: ${player}',
          tc: '退避: ${player}',
          ko: '기피: ${player}',
        },
      },
    },
    {
      id: 'General Holmgang',
      comment: {
        cn: '仅在自身或团队成员释放“死斗”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“死鬥”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 일대일 결투를 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '2B' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Holmgang: ${player}',
          de: 'Holmgang: ${player}',
          fr: 'Holmgang : ${player}',
          ja: 'ホルムギャング: ${player}',
          cn: '死斗: ${player}',
          tc: '死鬥: ${player}',
          ko: '일대일 결투: ${player}',
        },
      },
    },
    {
      id: 'General Hallowed',
      comment: {
        cn: '仅在自身或团队成员释放“神圣领域”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“神聖領域”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 천하무적을 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '1E' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Hallowed: ${player}',
          de: 'Heiliger Boden: ${player}',
          fr: 'Invincible : ${player}',
          ja: 'インビンシブル: ${player}',
          cn: '神圣领域: ${player}',
          tc: '神聖領域: ${player}',
          ko: '천하무적: ${player}',
        },
      },
    },
    {
      id: 'General Superbolide',
      comment: {
        cn: '仅在自身或团队成员释放“超火流星”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“超火流星”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 폭발 유성을 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: '3F18' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Bolide: ${player}',
          de: 'Meteoritenfall: ${player}',
          fr: 'Bolide : ${player}',
          ja: 'ボーライド: ${player}',
          cn: '超火流星: ${player}',
          tc: '超火流星: ${player}',
          ko: '폭발 유성: ${player}',
        },
      },
    },
    {
      id: 'General Living',
      comment: {
        cn: '仅在自身或团队成员释放“行尸走肉”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員釋放“行屍走肉”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 산송장을 사용하였고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'Ability',
      netRegex: { id: 'E36' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Living: ${player}',
          de: 'Totenerweckung: ${player}',
          fr: 'Mort-vivant : ${player}',
          ja: 'リビングデッド: ${player}',
          cn: '行尸走肉: ${player}',
          tc: '行屍走肉: ${player}',
          ko: '산송장: ${player}',
        },
      },
    },
    {
      id: 'General Walking',
      comment: {
        cn: '仅在自身或团队成员获得“死而不僵”且自身为坦克/治疗/青魔法师时触发。',
        tc: '僅在自身或團隊成員獲得“死而不僵”且自身為坦克/治療/青魔法師時觸發。',
        ko: '본인 또는 파티원이 움직이는 시체 상태가 되었고, 자신의 직업이 탱커/힐러/청마도사일 때 작동합니다.',
      },
      type: 'GainsEffect',
      netRegex: { effectId: '32B' },
      condition: (data, matches) => {
        if (matches.source !== data.me && !data.party.inAlliance(matches.source))
          return false;
        return caresAboutTankStuff(data);
      },
      infoText: (data, matches, output) =>
        output.text!({ player: data.party.member(matches.source) }),
      outputStrings: {
        text: {
          en: 'Walking: ${player}',
          de: 'Erweckter: ${player}',
          fr: 'Marcheur des limbes : ${player}',
          ja: 'ウォーキングデッド: ${player}',
          cn: '死而不僵: ${player}',
          tc: '死而不僵: ${player}',
          ko: '움직이는 시체: ${player}',
        },
      },
    },
    {
      // 0039 is the system message channel, when the current player commences a ready check,
      // the message is sent to this channel; when a ready check is invoked by others, then it
      // would be sent to the 0239 channel.  (Sometimes this is also sent to 0139, unknown why?)
      id: 'General Ready Check',
      comment: {
        cn: '在队友发起准备确认时，播放D.Va的“Game on”音效(^-^)V',
        tc: '在隊友發起準備確認時，播放D.Va的“Game on”音效(^-^)V',
        ko: '파티원이 준비 확인을 사용하면, D.Va의 "Game on" 사운드를 재생합니다.',
      },
      type: 'GameLog',
      netRegex: {
        line: '(?:You have commenced a ready check|\\y{Name} has initiated a ready check).*?',
        code: ['0039', '0139', '0239'],
        capture: false,
      },
      sound: '../../resources/sounds/Overwatch/D.Va_-_Game_on.webm',
      soundVolume: 0.6,
    },
    {
      // https://xivapi.com/LogMessage/916
      // en: 7 minutes have elapsed since your last activity. [...]
      // There is no network packet for these log lines; so have to use GameLog.
      id: 'General Falling Asleep',
      type: 'GameLog',
      netRegex: { line: '7 minutes have elapsed since your last activity..*?', capture: false },
      response: Responses.wakeUp(),
    },
  ],
  timelineReplace: [
    {
      locale: 'de',
      replaceSync: {
        'has initiated a ready check': 'eine Bereitschaftsanfrage gestellt',
        'You have commenced a ready check': 'Du hast eine Bereitschaftsanfrage gestellt',
        'You poke the striking dummy': 'Du stupst die Trainingspuppe an',
        'You psych yourself up alongside the striking dummy':
          'Du willst wahren Kampfgeist in der Trainingspuppe entfachen',
        'You burst out laughing at the striking dummy': 'Du lachst herzlich mit der Trainingspuppe',
        'You clap for the striking dummy': 'Du klatschst begeistert Beifall für die Trainingspuppe',
        '7 minutes have elapsed since your last activity..*?':
          'Seit deiner letzten Aktivität sind 7 Minuten vergangen.',
      },
    },
    {
      locale: 'fr',
      replaceSync: {
        ' has initiated a ready check': '',
        'You have commenced a ready check\\|': 'Un appel de préparation a été lancé par ',
        'You poke the striking dummy':
          'Vous touchez légèrement le mannequin d\'entraînement du doigt',
        'You psych yourself up alongside the striking dummy':
          'Vous vous motivez devant le mannequin d\'entraînement',
        'You burst out laughing at the striking dummy':
          'Vous vous esclaffez devant le mannequin d\'entraînement',
        'You clap for the striking dummy': 'Vous applaudissez le mannequin d\'entraînement',
        '7 minutes have elapsed since your last activity.':
          'Votre personnage est inactif depuis 7 minutes',
      },
    },
    {
      locale: 'ja',
      replaceSync: {
        ' has initiated a ready check': 'がレディチェックを開始しました',
        'You have commenced a ready check': 'レディチェックを開始しました',
        'You poke the striking dummy': '.*は木人をつついた',
        'You psych yourself up alongside the striking dummy': '.*は木人に活を入れた',
        'You burst out laughing at the striking dummy': '.*は木人のことを大笑いした',
        'You clap for the striking dummy': '.*は木人に拍手した',
        '7 minutes have elapsed since your last activity.': '操作がない状態になってから7分が経過しました。',
      },
    },
    {
      locale: 'cn',
      replaceSync: {
        ' has initiated a ready check': '发起了准备确认',
        'You have commenced a ready check': '发起了准备确认',
        'You poke the striking dummy': '.*用手指戳向木',
        'You psych yourself up alongside the striking dummy': '.*激励木人',
        'You burst out laughing at the striking dummy': '.*看着木人高声大笑',
        'You clap for the striking dummy': '.*向木人送上掌声',
        '7 minutes have elapsed since your last activity.': '已经7分钟没有进行任何操作',
      },
    },
    {
      locale: 'tc',
      replaceSync: {
        ' has initiated a ready check': '發起了準備確認。',
        'You have commenced a ready check': '發起了準備確認。',
        'You poke the striking dummy': '.*用手指戳向木人',
        'You psych yourself up alongside the striking dummy': '.*激勵木人',
        'You burst out laughing at the striking dummy': '.*看著木人高聲大笑',
        'You clap for the striking dummy': '.*向木人送上掌聲',
        '7 minutes have elapsed since your last activity.': '已經7分鐘沒有進行任何操作',
      },
    },
    {
      locale: 'ko',
      replaceSync: {
        'has initiated a ready check': '님이 준비 확인을 시작했습니다',
        'You have commenced a ready check': '준비 확인을 시작합니다',
        'You poke the striking dummy': '.*나무인형을 쿡쿡 찌릅니다',
        'You psych yourself up alongside the striking dummy': '.*나무인형에게 힘을 불어넣습니다',
        'You burst out laughing at the striking dummy': '.*나무인형을 보고 폭소를 터뜨립니다',
        'You clap for the striking dummy': '.*나무인형에게 박수를 보냅니다',
        '7 minutes have elapsed since your last activity..*?': '7분 동안 아무 조작을 하지 않았습니다',
      },
    },
  ],
};

export default triggerSet;
