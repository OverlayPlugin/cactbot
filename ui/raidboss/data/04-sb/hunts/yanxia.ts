import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'Yanxia',
  zoneId: ZoneId.Yanxia,
  comments: {
    en: 'A Rank Hunts: Angada only',
    de: 'A Rang Hohe Jagd: Nur Angada',
    fr: 'Chasse Rang A : Angada uniquement',
    cn: '只有A级狩猎怪: 安迦达',
    ko: 'A급 마물: 앙가다만',
  },
  triggers: [
    {
      id: 'Angada Scythe Tail',
      type: 'StartsUsing',
      netRegex: { id: '1FFE', source: 'Angada', capture: false },
      condition: (data) => data.inCombat,
      response: Responses.getOut(),
    },
    {
      id: 'Angada Butcher',
      type: 'StartsUsing',
      netRegex: { id: '1FFF', source: 'Angada', capture: false },
      condition: (data) => data.inCombat,
      response: Responses.getBehind(),
    },
  ],
};

export default triggerSet;
