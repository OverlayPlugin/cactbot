import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
}

const triggerSet: TriggerSet<Data> = {
  id: 'mistwake',
  zoneId: ZoneId.Mistwake,
  timelineFile: 'mistwake.txt',
  initData: () => {
    return {};
  },
  triggers: [
    // ----------------------- Treno Catoblepas -----------------------
    {
      id: 'Mistwake Treno Catoblepas Earthquake',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A93F', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Catoblepas Thunder II',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A943', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread (away from rocks)',
          fr: 'Dispersez-vous (loin des rochers)',
          cn: '分散 (避开石头)',
          ko: '산개 (바위 근처에서 떨어지기)',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Bedeviling Light',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A942', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Hide behind rock',
          fr: 'Derrière un rocher',
          cn: '躲在石头后',
          ko: '바위 뒤에 숨기',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Thunder III',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A941' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Mistwake Treno Catoblepas Ray of Lightning On You',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'AF19' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Point laser away from rocks',
          fr: 'Pointez le laser loin des rochers',
          cn: '将激光指向避开石头',
          ko: '레이저가 바위를 향하지 않게 하기',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Ray of Lightning',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'AF19' },
      condition: Conditions.targetIsNotYou(),
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Mistwake Treno Catoblepas Petribreath',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A947', capture: false },
      response: Responses.awayFromFront(),
    },
    // -------------------------- Amdusias --------------------------
    {
      id: 'Mistwake Treno Amdusias Thunderclap Concerto Behind',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B118', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunderclap Concerto Front',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B11D', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunder IV',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B126', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Amdusias Bio II',
      type: 'StartsUsing',
      // Paired with B121, which is the actual damage hit, but no cast bar
      netRegex: { source: 'Amdusias', id: 'B120', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Amdusias Shockbolt',
      type: 'StartsUsing',
      // Paired with B12B, which happens first, but does not target
      netRegex: { source: 'Amdusias', id: 'B12C' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunder III',
      type: 'StartsUsing',
      // Paired with B128, which happens first, but does not target
      netRegex: { source: 'Amdusias', id: 'B129' },
      response: Responses.stackMarkerOn(),
    },
    // ---------------------- Thundergust Griffin ----------------------
    {
      id: 'Mistwake Thundergust Griffin Thunderspark',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0EB', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Thundergust Griffin High Volts',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0EC', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'Mistwake Thundergust Griffin Golden Talons',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0F9' },
      response: Responses.tankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'cn',
      'replaceSync': {
        'Amdusias': '安度西亚斯',
        'Shock Storm': '雷风',
        'Thundergust Griffin': '雷狮鹫',
        'Treno Catoblepas': '特雷诺卡托布莱帕斯',
      },
      'replaceText': {
        'Bedeviling Light': '恶魔之光',
        'Bio II': '猛毒菌',
        'Earthquake': '地震',
        'Electrifying Flight': '雷风',
        'Electrogenetic Force': '雷击',
        'Fulgurous Fall': '雷光坠击',
        'Galloping Thunder': '雷电飞驰',
        'Golden Talons': '黄金爪',
        'High Volts': '高压电',
        'Lightning Bolt': '落雷',
        'Petribreath': '石化吐息',
        'Ray of Lightning': '雷光射线',
        'Rush': '突进',
        'Shockbolt': '雷电震击',
        'Storm Surge': '电暴',
        '(?<! )Thunder(?! |clap|ing|spark)': '闪雷',
        'Thunder II(?!I)': '震雷',
        'Thunder III': '暴雷',
        'Thunder IV': '霹雷',
        'Thunderclap Concerto': '惊雷协奏曲',
        'Thundering Roar': '雷霆咆哮',
        'Thunderspark': '电光',
      },
    },
  ],
};

export default triggerSet;
