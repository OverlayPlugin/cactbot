import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.EverkeepExtreme,
  damageWarn: {
    'ZoraalJaEx Multidirectional Divide Initial Lines': '93A2', // initial cross (+) AoE
    'ZoraalJaEx Multidirectional Divide Safe Squares 1': '93A4', // room-wide AoE with tiny safe squares
    'ZoraalJaEx MultiDirectional Divide Safe Squares 2': '93A3', // ^ same - possibly the original lines?
    'ZoraalJaEx Backward Edge': '9972', // forward-facing room cleave
    'ZoraalJaEx Forward Edge': '937F', // backward-facing room cleave
    'ZoraalJaEx Half Full Right': '9380', // half-room cleave (left safe)
    'ZoraalJaEx Half Full Left': '939E', // half-room cleave (right safe)
    'ZoraalJaEx Chasm of Vollok (Swords)': '939A', // teleporting sword tile
    'ZoraalJaEx Forged Track': '939D', // teleporting sword line cleave
    'ZoraalJaEx Stormy Edge': '9386', // wind/knockback cleave
    // TODO: Figure out if the difference between 9383 vs. 9384 is
    // standing in the telegraphed line vs. one of the splashed lines?
    'ZoraalJaEx Fiery Edge 1': '9383', // fire cleave
    'ZoraalJaEx Fiery Edge 2': '9384', // fire cleave
    'ZoraalJaEx Siege of Vollok': '938B', // moving line with donut AoEs
    'ZoraalJaEx Walls of Vollok': '938C', // moving line with puddle AoEs
    'ZoraalJaEx Half Circuit Side': '939F', // left/right cleave
    'ZoraalJaEx Half Circuit Donut': '93A0', // swords out - inside safe
    'ZoraalJaEx Half Circuit Point-blank': '93A1', // swords in - outside safe
    'ZoraalJaEx Chasm of Vollok (Knockaround)': '9394', // big quadrant swords
    'ZoraalJaEx Aero III': '9391', // standing in/near tornado with wind debuff
  },
  shareWarn: {
    'ZoraalJaEx Regicidal Rage': '993C', // tank tether busters (2x, solo)
    'ZoraalJaEx Chasm of Vollok (Spread)': '9389', // yellow Titan spreads
    'ZoraalJaEx Bitter Whirlwind': '993E', // telegraphed solo tankbuster
    'ZoraalJaEx Bitter Whirlwind Followup': '9940', // untelegraphed follow-up hits
  },
  soloWarn: {
    'ZoraalJaEx Drum of Vollok': '938F', // enumerations
  },
};

export default triggerSet;
