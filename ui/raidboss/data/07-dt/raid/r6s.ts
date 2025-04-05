import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM2Savage',
  zoneId: ZoneId.AacCruiserweightM2Savage,
  timelineFile: 'r6s.txt',
  triggers: [
    {
      id: 'R6S Mousse Mural',
      type: 'StartsUsing',
      netRegex: { id: 'A6BC', source: 'Sugar Riot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R6S Color Clash',
      type: 'StartsUsing',
      netRegex: { id: ['A68D', 'A68B'], source: 'Sugar Riot' },
      alertText: (_data, matches, output) => {
        if (matches.id === 'A68D')
          return output.stackPartner!();
        return output.healerGroups!();
      },
      outputStrings: {
        stackPartner: Outputs.stackPartner,
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      id: 'R6S Sticky Mousse',
      type: 'StartsUsing',
      netRegex: { id: 'A695', source: 'Sugar Riot', capture: false },
      response: Responses.protean(),
    },
  ],
};

export default triggerSet;
