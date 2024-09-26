import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO:
//   - Add trigger for missing Brutal Burn (stack)
//   - Add trigger for Knuckle Sandwich (shared buster)

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacLightHeavyweightM3,
  damageWarn: {
    'R3N Brutal Lariat East': '9AD7', // half-room+ cleave
    'R3N Brutal Lariat West': '9AD6', // half-room+ cleave
    'R3N Murderous Mist': '93B5', // 270 frontal cleave
    'R3N Fire Spin Initial': '9B58', // rotating cleave
    'R3N Fire Spin Subsequent': '9B59', // rotating cleave
    'R3N Self-Destruct Short': '93B8', // bomb circle AoEs
    'R3N Self-Destruct Long': '93B9', // bomb circle AoEs

    'R3N Lariat Combo West First': '9AE4', // half-room+ cleave
    'R3N Lariat Combo East First': '9AE5', // half-room+ cleave
    'R3N Lariat Combo East Subsequent': '9AE6', // half-room+ cleave
    'R3N Lariat Combo West Subsequent': '9AE7', // half-room+ cleave

    'R3N Infernal Spin Initial': '9B5A', // rotating cleave
    'R3N Infernal Spin Subsequent': '9B5B', // rotating cleave
    'R3N Explosive Rain Inner': '93CD', // inner ring (circle AoE)
    'R3N Explosive Rain Middle': '93CE', // middle ring (donut AoE)
    'R3N Explosive Rain Outer': '93CF', // outer ring (donut AoE)
    'R3N Explosive Rain Baited': '968D', // baited circle AoEs
  },
  gainsEffectWarn: {
    'R3N Burns': 'BF9', // walking into wall
  },
};

export default triggerSet;
