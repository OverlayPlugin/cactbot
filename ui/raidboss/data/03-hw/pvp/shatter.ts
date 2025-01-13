import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

type Location = 'center' | 'north' | 'southeast' | 'southwest';

const bNpcNameIdToLocation: { [bNpcNameId: string]: Location } = {
  '12D6': 'center', // Icebound Tomelith A1
  '12D7': 'southwest', // Icebound Tomelith A2
  '12D8': 'southeast', // Icebound Tomelith A3
  '12D9': 'north', // Icebound Tomelith A4
};

const bNpcNameIds = Object.keys(bNpcNameIdToLocation);

// Frontlines: Shatter
const triggerSet: TriggerSet<Data> = {
  id: 'TheFieldsOfGloryShatter',
  zoneId: ZoneId.TheFieldsOfGloryShatter,
  comments: {
    en: 'pre-6.4 rework',
  },
  triggers: [
    // https://xivapi.com/LogMessage/2652
    // en: <Clickable(<SheetEn(BNpcName,2,IntegerParameter(1),1,1)/>)/> activates and begins to emit heat.
    {
      id: 'Shatter Big Ice',
      type: 'SystemLogMessage',
      netRegex: { id: 'A5C', param1: bNpcNameIds },
      alertText: (_data, matches, output) => {
        const location = bNpcNameIdToLocation[matches.param1];
        if (location !== undefined)
          return output[location]!();
      },
      outputStrings: {
        center: {
          en: 'Big Ice: Center',
          de: 'Grosses Eis: Mitte',
          fr: 'Grosse Glace : Centre',
          ja: '氷: 中央',
          cn: '大冰: 中央',
          ko: '큰 얼음: 중앙',
        },
        north: {
          en: 'Big Ice: North',
          de: 'Grosses Eis: Norden',
          fr: 'Grosse Glace : Nord',
          ja: '氷: 北',
          cn: '大冰: 上方',
          ko: '큰 얼음: 북쪽',
        },
        southeast: {
          en: 'Big Ice: Southeast',
          de: 'Grosses Eis: Süden',
          fr: 'Grosse Glace : Sud-Est',
          ja: '氷: 南東',
          cn: '大冰: 右下',
          ko: '큰 얼음: 남동쪽',
        },
        southwest: {
          en: 'Big Ice: Southwest',
          de: 'Grosses Eis: Südwesten',
          fr: 'Grosse Glace : Sud-Ouest',
          ja: '氷: 西南',
          cn: '大冰: 左下',
          ko: '큰 얼음: 남서쪽',
        },
      },
    },
  ],
};

export default triggerSet;
