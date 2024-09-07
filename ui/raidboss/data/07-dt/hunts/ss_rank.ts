// import Outputs from '../../../../../resources/outputs';
// import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'HuntDTSS',
  zoneId: [
    ZoneId.Urqopacha,
    ZoneId.Kozamauka,
    ZoneId.YakTel,
    ZoneId.Shaaloani,
    ZoneId.HeritageFound,
    ZoneId.LivingMemory,
  ],
  zoneLabel: {
    en: 'SS Rank Hunts',
    de: 'SS Jagdziele',
    fr: 'Objectifs de chasse SS',
    ja: 'SSモブ',
    cn: 'SS 级狩猎怪',
    ko: 'SS급 마물',
  },
  triggers: [],
};

export default triggerSet;
