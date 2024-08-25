// import { UnreachableCode } from '../../../../../resources/not_reached';
// import Outputs from '../../../../../resources/outputs';
// import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Sansheya (S-Rank)

export interface Data extends RaidbossData {
}

const triggerSet: TriggerSet<Data> = {
  id: 'Shaaloani',
  zoneId: ZoneId.Shaaloani,
  initData: () => ({
  }),
  triggers: [
    // ****** A-RANK:  ****** //

    // ****** A-RANK:  ****** //

    // ****** S-RANK: Sansheya ****** //
  ],
  timelineReplace: [],
};

export default triggerSet;
