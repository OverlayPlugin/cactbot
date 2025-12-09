import Conditions from '../../../../../resources/conditions';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'TheSunkenTempleOfQarn71',
  zoneId: ZoneId.TheSunkenTempleOfQarn71,
  triggers: [
    {
      id: 'Sunken Quarn71 Doom',
      type: 'GainsEffect',
      netRegex: { effectId: 'D2' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Step on Glowing Plate',
          de: 'Auf der leuchtende Platte stehen',
          fr: 'Marchez sur la plaque qui brille',
          ja: '光る床に乗る',
          cn: '踩发光地板',
          tc: '踩發光地板',
          ko: '빛나는 발판 밟기',
        },
      },
    },
  ],
};

export default triggerSet;
