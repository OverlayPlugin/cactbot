import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'FuturesRewrittenUltimate',
  zoneId: ZoneId.FuturesRewrittenUltimate,
  timelineFile: 'futures_rewritten.txt',
  timelineTriggers: [],
  triggers: [],
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
