// import Conditions from '../../../../../resources/conditions';
// import Outputs from '../../../../../resources/outputs';
// import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for The Forecaster (S-Rank)

export interface Data extends RaidbossData {
}

const triggerSet: TriggerSet<Data> = {
  id: 'LivingMemory',
  zoneId: ZoneId.LivingMemory,
  initData: () => ({
  }),
  triggers: [
    // ****** A-RANK: Cat's Eye ****** //

    // ****** A-RANK: Sally the Sweeper ****** //

    // ****** S-RANK: The Forecaster ****** //
  ],
  timelineReplace: [],
};

export default triggerSet;
