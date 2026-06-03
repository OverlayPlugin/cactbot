import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {}

const triggerSet: TriggerSet<Data> = {
  id: 'TheMerchantsTaleAdvanced',
  zoneId: ZoneId.TheMerchantsTaleAdvanced,
  timelineFile: 'the_merchants_tale_advanced.txt',

  triggers: [
    {
      id: 'Pari Heat Burst',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1CC', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Pari Fire Of Victory',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1CE' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Pari Scouring Scorn',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1B2', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Pari Doubling Center For Chains',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B093', capture: false },
      durationSeconds: 4,
      alertText: (_data, _matches, output) => output.centerForChains!(),
      outputStrings: {
        centerForChains: { en: 'Center for Chains' },
      },
    },
    {
      id: 'Pari Sun Circlet',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B187', capture: false },
      suppressSeconds: 3,
      alarmText: (_data, _matches, output) => output.inBossHitbox!(),
      outputStrings: {
        inBossHitbox: { en: 'In Boss Hitbox' },
      },
    },
  ],
};

export default triggerSet;
