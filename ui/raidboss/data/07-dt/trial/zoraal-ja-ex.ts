import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TO DO:
// - Regicidal Rage - add appropriate tank call
// - Vollok/Sync - add safe tile(s) callout?
// - Sync/Half Full - call safe boss half
// - Half Circuit - call safe side

const triggerSet: TriggerSet<RaidbossData> = {
  id: 'EverkeepExtreme',
  zoneId: ZoneId.EverkeepExtreme,
  timelineFile: 'zoraal-ja-ex.txt',
  triggers: [
    {
      id: 'Zoraal Ja Ex Forward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937B', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'Front + Boss\'s Right',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Forward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937C', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.frontLeft!(),
      outputStrings: {
        frontLeft: {
          en: 'Front + Boss\'s Left',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Backward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937D', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.backRight!(),
      outputStrings: {
        backRight: {
          en: 'Behind + Boss\'s Left',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Backward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937E', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.backLeft!(),
      outputStrings: {
        backLeft: {
          en: 'Behind + Boss\'s Right',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Actualize',
      type: 'StartsUsing',
      netRegex: { id: '9398', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      // FIX ME
      id: 'Zoraal Ja Ex Regicidal Rage',
      type: 'StartsUsing',
      netRegex: { id: '993C', source: 'Zoraal Ja', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Buster tethers (fix me)',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Dawn of an Age',
      type: 'StartsUsing',
      netRegex: { id: '9397', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Zoraal Ja Ex Sync',
      type: 'StartsUsing',
      netRegex: { id: '9359', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Swords (+Halfroom cleave?)',
        },
      },
    },
    // FIX ME
    {
      id: 'Zoraal Ja Ex Half Circuit',
      type: 'StartsUsing',
      netRegex: { id: ['936B', '936C'], source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge half-room cleave + in/out',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Forward Edge/Backward Edge': 'Forward/Backward Edge',
      },
    },
  ],
};

export default triggerSet;
