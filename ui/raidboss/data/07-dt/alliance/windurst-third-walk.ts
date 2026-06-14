import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const triggerSet: TriggerSet<RaidbossData> = {
  id: 'Windurst: The Third Walk',
  zoneId: ZoneId.WindurstTheThirdWalk,
  timelineFile: 'windurst-third-walk.txt',
  triggers: [],
  timelineReplace: [],
};

export default triggerSet;
