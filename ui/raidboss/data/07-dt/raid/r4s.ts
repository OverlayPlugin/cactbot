import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM4Savage',
  zoneId: ZoneId.AacLightHeavyweightM4Savage,
  timelineFile: 'r4s.txt',
  triggers: [],
};

export default triggerSet;
