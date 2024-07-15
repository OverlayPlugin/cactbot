import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.Ihuykatumu,
  damageWarn: {
    // ** Adds, pre-boss 1 ** //
    'Ihuykatumu Bird of Ihuykatumu Filoplumes': '9645', // line cleave AoE
    'Ihuykatumu Ihuykatumu Wivre Brow Horn': '9646', // line cleave AoE

    // ** Prime Punutiy ** //
    'Ihuykatumu Prime Punutiy Hydrowave': '8E8D', // conal AoE
    'Ihuykatumu Prime Punutiy Inhale': '8E90', // conal AoE
    'Ihuykatumu Prime Punutiy Bury 1': '8E91', // initial circle AoE
    // more AoEs of varying shapes (not individually mapped, sorry)
    'Ihuykatumu Prime Punutiy Bury 2': '8E92',
    'Ihuykatumu Prime Punutiy Bury 3': '8E93',
    'Ihuykatumu Prime Punutiy Bury 4': '8E94',
    'Ihuykatumu Prime Punutiy Bury 5': '8E95',
    'Ihuykatumu Prime Punutiy Bury 6': '8E96',
    'Ihuykatumu Prime Punutiy Bury 7': '8E97',
    'Ihuykatumu Prime Punutiy Bury 8': '8E98',
    'Ihuykatumu Ihuykatumu Flytrap Decay': '8E99', // get under
    'Ihuykatumu Prime Punutiy Shore Shaker 1': '8EA3', // inner puddle AoE
    'Ihuykatumu Prime Punutiy Shore Shaker 2': '8EA4', // inner ring AoE
    'Ihuykatumu Prime Punutiy Shore Shaker 3': '8EA5', // outer ring AoE

    // ** Adds, pre-boss 2 ** //
    'Ihuykatumu Ihuykatumu Treant Arboreal Storm': '9B52', // circle AoE
    'Ihuykatumu Mimiclot Flagrant Spread': '9702', // circle AoE

    // ** Drowsie ** //
    'Ihuykatumu Ihuykatumu Ivy Arise': '8E7E', // circle AoEs (ivy drops)
    'Ihuykatumu Ihuykatumu Ivy Wallop Small': '8E7F', // ivy line cleave AoE
    'Ihuykatumu Ihuykatumu Ivy Wallop Large': '8E82', // ivy line cleave AoE
    'Ihuykatumu Drowsie Sneeze': '8E7B', // big conal AoE

    // ** Adds, pre-boss 3 ** //
    'Ihuykatumu Ihuykatumu Puma Megablaster': '9649', // conal AoE
    'Ihuykatumu Ihuykatumu Maip Ripper Claw': '964A', // conal AoE

    // ** Apollyon ** //
    'Ihuykatumu Apollyon Razor Zephyr': '8DF4', // line cleave AoE
    'Ihuykatumu Apollyon Blades of Famine': '8DFA', // line cleave AoEs after jumps
    'Ihuykatumu Apollyon Levinsickle': '8DFE', // puddle AoEs that drop levin orbs
    'Ihuykatumu Apollyon Levinsickle Spark': '8DFD', // puddle AoEs that drop levin orbs
    'Ihuykatumu Apollyon Wing of Lightning': '8DFF', // conal AoEs from levin orbs
    'Ihuykatumu Apollyon Wind Sickle': '8E06', // get under
    'Ihuykatumu Apollyon Razor Storm': '8E03', // room-wide (behind jump is safe) AoE
    'Ihuykatumu Apollyon Biting Wind': '8F99', // line cleave AoE from Whirlwind
  },
  gainsEffectWarn: {
    // ** Prime Punutiy ** //
    'Ihuykatumu Prime Punutiy Resurface': '957', // Heavy - getting hit by initial conal AoE
  },
  shareWarn: {
    // ** Prime Punutiy ** //
    'Ihuykatumu Prodigious Punutiy Punutiy Flop': '8E9C', // tethered add - large circle AoE
    'Ihuykatumu Petit Punutiy Punutiy Flop': '8EA1', // tethered add - small circle AoE
    'Ihuykatumu Punutiy Hydrowave': '8E9D', // tethered add - conal AoE

    // ** Drowsie ** //
    'Ihuykatumu Drowsie Flagrant Spread': '8EAA', // spread markers

    // ** Apollyon ** //
    'Ihuykatumu Apollyon Thunnder III': '8E01', // levin spread puddle AoEs
  },
};

export default triggerSet;
