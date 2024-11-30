import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  p1FallOfFaithTethers: ('fire' | 'lightning')[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'FuturesRewrittenUltimate',
  zoneId: ZoneId.FuturesRewrittenUltimate,
  timelineFile: 'futures_rewritten.txt',
  initData: () => {
    return {
      p1FallOfFaithTethers: [],
    };
  },
  timelineTriggers: [],
  triggers: [
    {
      id: 'FRU P1 Cyclonic Break Fire',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD0', '9D89'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockPairs!(),
      outputStrings: {
        clockPairs: {
          en: 'Clock spots => Pairs',
        },
      },
    },
    {
      id: 'FRU P1 Cyclonic Break Lightning',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CD4', '9D8A'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: false,
      },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.clockSpread!(),
      outputStrings: {
        clockSpread: {
          en: 'Clock spots => Spread',
        },
      },
    },
    {
      id: 'FRU P1 Powder Mark Trail',
      type: 'StartsUsing',
      netRegex: { id: '9CE8', source: 'Fatebreaker', capture: true },
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'FRU P1 Utopian Sky',
      type: 'Ability',
      netRegex: {
        id: ['9CDA', '9CDB'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: true,
      },
      delaySeconds: 6,
      durationSeconds: 10,
      alertText: (_data, matches, output) => {
        if (matches.id === '9CDA')
          return output.utopianFire!();
        if (matches.id === '9CDB')
          return output.utopianThunder!();
        return output.unknownUtopian!();
      },
      outputStrings: {
        utopianFire: Outputs.stacks,
        utopianThunder: Outputs.spread,
        unknownUtopian: Outputs.unknown,
      },
    },
    {
      id: 'FRU P1 Burnt Strike Fire',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC1', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave -> Knockback',
          de: 'Linien AoE -> Rückstoß',
          fr: 'AoE en ligne -> Poussée',
          ja: '直線範囲 -> ノックバック',
          cn: '直线 -> 击退',
          ko: '직선 장판 -> 넉백',
        },
      },
    },
    {
      id: 'FRU P1 Burnt Strike Lightning',
      type: 'StartsUsing',
      netRegex: { source: 'Fatebreaker', id: '9CC5', capture: false },
      durationSeconds: 8,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Line Cleave -> Out',
          de: 'Linien AoE -> Raus',
          fr: 'AoE en ligne -> Extérieur',
          ja: '直線範囲 -> 離れる',
          cn: '直线 -> 去外侧',
          ko: '직선 장판 -> 바깥으로',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Fire',
      type: 'StartsUsing',
      netRegex: { id: '9CD6', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.lightningSafe!(),
      outputStrings: {
        lightningSafe: {
          en: 'Lightning Safe',
        },
      },
    },
    {
      id: 'FRU P1 Turn of the Heavens Lightning',
      type: 'StartsUsing',
      netRegex: { id: '9CD7', source: 'Fatebreaker\'s Image', capture: false },
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.fireSafe!(),
      outputStrings: {
        fireSafe: {
          en: 'Fire Safe',
        },
      },
    },
    {
      id: 'FRU P1 Fall of Faith Collector',
      type: 'StartsUsing',
      netRegex: {
        id: ['9CC9', '9CCC'],
        source: ['Fatebreaker', 'Fatebreaker\'s Image'],
        capture: true,
      },
      durationSeconds: (data) => data.p1FallOfFaithTethers.length >= 3 ? 8.7 : 3,
      infoText: (data, matches, output) => {
        const curTether = matches.id === '9CC9' ? 'fire' : 'lightning';
        data.p1FallOfFaithTethers.push(curTether);

        if (data.p1FallOfFaithTethers.length < 4) {
          const num = data.p1FallOfFaithTethers.length === 1
            ? 'one'
            : (data.p1FallOfFaithTethers.length === 2 ? 'two' : 'three');
          return output.tether!({
            num: output[num]!(),
            elem: output[curTether]!(),
          });
        }

        const [e1, e2, e3, e4] = data.p1FallOfFaithTethers;

        if (e1 === undefined || e2 === undefined || e3 === undefined || e4 === undefined)
          return;

        return output.all!({
          e1: output[e1]!(),
          e2: output[e2]!(),
          e3: output[e3]!(),
          e4: output[e4]!(),
        });
      },
      outputStrings: {
        fire: {
          en: 'Fire',
        },
        lightning: {
          en: 'Lightning',
        },
        one: {
          en: '1',
        },
        two: {
          en: '2',
        },
        three: {
          en: '3',
        },
        tether: {
          en: '${num}: ${elem}',
        },
        all: {
          en: '${e1} => ${e2} => ${e3} => ${e4}',
        },
      },
    },
  ],
  timelineReplace: [
    {
      locale: 'en',
      replaceText: {
        'Sinbound Fire III/Sinbound Thunder III': 'Sinbound Fire/Thunder',
      },
    },
  ],
};

export default triggerSet;
