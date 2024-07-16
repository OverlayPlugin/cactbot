import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM3',
  zoneId: ZoneId.AacLightHeavyweightM3,
  timelineFile: 'r3n.txt',
  triggers: [],
};

export default triggerSet;
