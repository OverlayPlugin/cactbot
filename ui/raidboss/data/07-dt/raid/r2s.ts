import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM2Savage',
  zoneId: ZoneId.AacLightHeavyweightM2Savage,
  timelineFile: 'r2s.txt',
  triggers: [],
};

export default triggerSet;
