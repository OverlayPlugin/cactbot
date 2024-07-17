import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM4',
  zoneId: ZoneId.AacLightHeavyweightM4,
  timelineFile: 'r4n.txt',
  triggers: [],
};

export default triggerSet;
