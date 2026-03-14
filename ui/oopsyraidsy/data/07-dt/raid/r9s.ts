import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacHeavyweightM1Savage,
  damageWarn: {
    'R9S Half Moon 1': 'B377',
    'R9S Half Moon 2': 'B378',
    'R9S Half Moon 3': 'B379',
    'R9S Half Moon 4': 'B37A',
    'R9S Half Moon 5': 'B37B',
    'R9S Half Moon 6': 'B37C',
    'R9S Half Moon 7': 'B37D',
    'R9S Half Moon 8': 'B37E',
    'R9S Vamp Stomp': 'B374',
    'R9S Blast Beat AoE': 'B375',
    'R9S Coffinfiller 1': 'B368',
    'R9S Coffinfiller 2': 'B369',
    'R9S Coffinfiller 3': 'B36A',
    'R9S Aetherletting Cone 1': 'B38F',
    'R9S Aetherletting Cone 2': 'B390',
    'R9S Aetherletting Cone 3': 'B391',
    'R9S Aetherletting Cross AoE': 'B393',
    'R9S Pulping Pulse': 'B373',
    'R9S Sanguine Scratch 1': 'B3A4',
    'R9S Sanguine Scratch 2': 'B3A5',
    'R9S Sanguine Scratch 3': 'B3A6',
    'R9S Sanguine Scratch 4': 'B3A7',
    'R9S Breakdown Drop 1': 'B3A8',
    'R9S Breakdown Drop 2': 'B3AA',
    'R9S Breakwing Beat 1': 'B3A9',
    'R9S Breakwing Beat 2': 'B3AB',
  },
  damageFail: {
    'R9S Dead Wake': 'B367', // Coffinmaker advance
  },
  gainsEffectWarn: {
    'R9S Flesh Wound': 'B7E', // chakrams, saws
    'R9S Electrocution': 'C02', // Deadly Doornail
  },
  shareWarn: {
    'R9S Blast Beat Player': 'B376',
    'R9S Plummet': 'B38B', // Fatal Flail tower
  },
  shareFail: {
    'R9S Hardcore Small': 'B37F', // Tankbuster
    'R9S Hardcore Big': 'B380', // Tankbuster
    'R9S Aetherletting Marker': 'B392',
    'R9S Bloody Bondage': 'B396', // Hell in a Cell tower
  },
};

export default triggerSet;
