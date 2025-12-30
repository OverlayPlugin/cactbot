import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'Snowcloak',
  zoneId: ZoneId.Snowcloak,
  comments: {
    en: 'pre-6.2 rework',
    de: 'Vor der 6.2 Überarbeitung',
    fr: 'Avant le remaniement 6.2',
    cn: '6.2 改版前',
    ko: '6.2 개편 전',
    tc: '6.2 改版前',
  },
  triggers: [
    {
      id: 'Snowcloak Lunar Cry',
      type: 'StartsUsing',
      netRegex: { id: 'C1F', source: 'Fenrir', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Hide behind Ice',
          de: 'Hinter dem Eis verstecken',
          fr: 'Cachez vous derrière un pilier de glace',
          ja: '氷柱の後ろに',
          cn: '躲在冰柱后',
          ko: '얼음 뒤에 숨기',
          tc: '躲在冰柱後',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Fenrir': 'Fenrir',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Fenrir': 'Fenrir',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Fenrir': 'フェンリル',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Fenrir': '芬里尔',
      },
    },
    {
      'locale': 'tc',
      'replaceSync': {
        'Fenrir': '芬里爾',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Fenrir': '펜리르',
      },
    },
  ],
};

export default triggerSet;
