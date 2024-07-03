import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.WorqorLarDorExtreme,
  damageWarn: {
    'ValigarmandaEx Spikecicle 1': '8FF5', // curved cleave
    'ValigarmandaEx Spikecicle 2': '8FF6', // curved cleave
    'ValigarmandaEx Spikecicle 3': '8FF7', // curved cleave
    'ValigarmandaEx Spikecicle 4': '8FF8', // curved cleave
    'ValigarmandaEx Spikecicle 5': '8FF9', // curved cleave
    'ValigarmandaEx Sphere Shatter': '995D', // ice boulder aoe
    'ValigarmandaEx Volcanic Drop Big': '8FE6', // half-room lava puddle
    'ValigarmandaEx Volcanic Drop Puddle': '8FE4', // small lava puddle
    'ValigarmandaEx Mountain Fire Cleave': '901A', // all but a small safe wedge
  },
  shareFail: {
    'ValigarmandaEx Mountain Fire Tower': '9019', // tank tower
  },
  soloWarn: {
    'ValigarmandaEx Scourge of Fire': '8FEF', // healer stacks (initial phase)
  },
};

export default triggerSet;
