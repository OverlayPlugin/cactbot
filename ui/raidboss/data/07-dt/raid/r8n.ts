import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM4',
  zoneId: ZoneId.AacCruiserweightM4,
  timelineFile: 'r8n.txt',
  triggers: [],
};

export default triggerSet;
