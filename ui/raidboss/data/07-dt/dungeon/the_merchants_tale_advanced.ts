import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {}

const triggerSet: TriggerSet<Data> = {
  id: 'TheMerchantsTaleAdvanced',
  zoneId: ZoneId.TheMerchantsTaleAdvanced,
  timelineFile: 'the_merchants_tale_advanced.txt',

  triggers: [
    {
      id: 'Pari Heat Burst',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1CC', capture: false },
      response: Responses.aoe(),
    },
  ],
};

export default triggerSet;
