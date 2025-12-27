import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'CuttersCry',
  zoneId: ZoneId.CuttersCry,
  comments: {
    en: 'pre-7.3 rework',
    de: 'Vor der 7.3 Überarbeitung',
    fr: 'Avant le remaniement 7.3',
    cn: '7.3改版前',
    tc: '7.3改版前',
    ko: '7.3 개편 전',
  },
  triggers: [
    {
      id: 'Cutters Chimera Ram Voice',
      type: 'StartsUsing',
      netRegex: { id: '450', source: 'Chimera', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'Cutters Chimera Dragon Voice',
      type: 'StartsUsing',
      netRegex: { id: '5A2', source: 'Chimera', capture: false },
      response: Responses.getIn(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Chimera': 'Chimära',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Chimera': 'Chimère',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Chimera': 'キマイラ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Chimera': '奇美拉',
      },
    },
    {
      'locale': 'tc',
      'replaceSync': {
        'Chimera': '奇美拉',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Chimera': '키마이라',
      },
    },
  ],
};

export default triggerSet;
