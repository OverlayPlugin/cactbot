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
  timelineReplace: [],
};

export default triggerSet;
