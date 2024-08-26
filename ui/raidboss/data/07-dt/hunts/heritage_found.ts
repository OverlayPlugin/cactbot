import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Atticus the Primogenitor (S-Rank)

export interface Data extends RaidbossData {
}

const triggerSet: TriggerSet<Data> = {
  id: 'HeritageFound',
  zoneId: ZoneId.HeritageFound,
  initData: () => ({
  }),
  triggers: [
    // ****** A-RANK: Heshuala ****** //

    // ****** A-RANK: Urna Variabilis ****** //

    // ****** S-RANK: Atticus the Primogenitor ****** //
  ],
  timelineReplace: [],
};

export default triggerSet;
