import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheUnderkeep,
  damageWarn: {
    // ---- adds, before boss 1 ---- //
    'Underkeep Sandcake Sandstorm': 'A798',
    'Underkeep Underkeep Hornfly Ultravibration': 'A79B',
    'Underkeep Sandcake Sand Crusher': 'A799',
    'Underkeep Underkeep Sandworm Earthquake': 'A79F',

    // ---- Gargant ---- //
    'Underkeep Gargant Almighty Racket': 'A632',
    'Underkeep Gargant Aerial Ambush': 'A62F', // dash
    'Underkeep Gargant Foundational Debris': 'A899',
    'Underkeep Gargant Sphere Shatter 1': 'A631',
    'Underkeep Gargant Sphere Shatter 2': 'A87F',

    // ---- adds, before boss 2 ---- //
    'Underkeep Underkeep Cingulata Hammer Throw': 'A7A1',
    'Underkeep Underkeep Cingulata Flailing Tail': 'A7A0',
    'Underkeep Bygone Subrunner Stone-faced Slaughter': 'A7A4', // donut
    'Underkeep Bygone Alpha Sentry Thunderlance': 'A7A6', // line
    'Underkeep Bygone Subrunner Dead-eyed Glare': 'A7A3', // line
    'Underkeep Bygone Alpha Sentry Piercing Joust': 'A7A5',

    // ---- Soldier S0 ---- //
    'Underkeep Soldier S0 Sector Bisector 1': 'A646',
    'Underkeep Soldier S0 Sector Bisector 2': 'A647',
    'Underkeep Soldier S0 Ordered Fire': 'A64D',

    // ---- adds, before boss 3 ---- //
    'Underkeep Bygone Laser Cannon Electray': 'A7A8',
    'Underkeep Bygone Terror Knight Blazing Torch': 'A7A9',
    'Underkeep Bygone Roadripper Run Amok': 'A7AC',
    'Underkeep Bygone Roadripper Wheeling Shot': 'A79E',
    'Underkeep Bygone Roadripper Electrostrike': 'A7AE',

    // ---- Valia Pira ---- //
    'Underkeep Valia Pira Enforcement Ray': 'A6F1',
    'Underkeep Valia Pira Electray': 'A87A',
    'Underkeep Valia Pira Concurrent Field': 'A619',
    'Underkeep Valia Pira Neutralize Front Lines': 'A6F2',
  },
  shareWarn: {
    'Underkeep Gargant Sedimentary Debris': 'A898',

    'Underkeep Soldier S0 Static Force': 'A64F',
    'Underkeep Soldier S0 Electric Excess': 'A883',

    'Underkeep Valia Pira Electric Field': 'A8FD',
    'Underkeep Valia Pira Hypercharged Light': 'A61C',
  },
  soloWarn: {
    'Underkeep Valia Pira Deterrent Pulse': 'A62C',
  },
};

export default triggerSet;
