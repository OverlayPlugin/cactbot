import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'TheWindwardWildsExtreme',
  zoneId: ZoneId.TheWindwardWildsExtreme,
  timelineFile: 'arkveld-ex.txt',
  triggers: [],
  timelineReplace: [
    {
      'locale': 'cn',
      'replaceSync': {
        'Guardian Arkveld': '护锁刃龙',
      },
      'replaceText': {
        '\\(aoes\\)': '(圆形AOE)',
        '\\(dash\\)': '(冲锋)',
        '\\(raidwide\\)': '(全屏)',
        '\\(wing\\)': '(翅膀)',
        'Aetheric Resonance': '地脉共振',
        'Chainblade Blow': '锁刃敲打',
        'Chainblade Charge': '锁刃下挥',
        'Clamorous Chase': '锁刃跃动',
        'Dragonspark': '龙光',
        'Forged Fury': '护龙乱击',
        'Greater Resonance': '护龙大共振',
        'Guardian Resonance': '护龙共振',
        'Roar': '咆哮',
        'Rush': '突进',
        'Siegeflight': '锁刃飞翔突进',
        'Steeltail Thrust': '龙尾突刺',
        'White Flash': '白光',
        'Wild Energy': '龙光扩散',
        'Wrathful Rattle': '锁哭龙闪·改',
        'Wyvern\'s Ouroblade': '回旋锁刃【龙闪】',
        'Wyvern\'s Radiance': '龙闪',
        'Wyvern\'s Rattle': '锁哭龙闪',
        'Wyvern\'s Vengeance': '波状龙闪',
        'Wyvern\'s Weal': '龙闪炮',
      },
    },
  ],
};

export default triggerSet;
