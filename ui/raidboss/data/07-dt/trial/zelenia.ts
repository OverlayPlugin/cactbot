import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'Recollection',
  zoneId: ZoneId.Recollection,
  timelineFile: 'zelenia.txt',
  triggers: [],
  timelineReplace: [
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
      'locale': 'ko',
      'replaceSync': {},
      'replaceText': {},
    },
    {
      'locale': 'tc',
      'replaceSync': {},
      'replaceText': {},
    },
  ],
};

export default triggerSet;
