import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const triggerSet: TriggerSet<RaidbossData> = {
  id: 'EverkeepExtreme',
  zoneId: ZoneId.EverkeepExtreme,
  timelineFile: 'zoraal-ja-ex.txt',
  triggers: [
    {
      id: 'Zoraal Ja Ex Forward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937B', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'In front of boss + right side of boss',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Forward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937C', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'In front of boss + left side of boss',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Backward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937D', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'Behind boss + left side of boss',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Backward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937E', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'Behind boss + right side of boss',
        },
      },
    },
  ],
};

export default triggerSet;
