import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.TheGildedAraya,
  damageWarn: {
    'Asura Chakra Ring 1': '8C9B', // ring AOE
    'Asura Chakra Ring 2': '8C9C', // ring AOE
    'Asura Chakra Ring 3': '8C9D', // ring AOE
    'Asura Chakra Ring 4': '8C9E', // ring AOE
    'Asura Chakra Ring 5': '8C9F', // ring AOE
    'Asura Laceration': '8C97', // clone puddle AOEs
    'Asura Pedestal Purge': '8C81', // circle AOE under boss
    'Asura Wheel of Deincarnation': '8C83', // donut AOE under boss
    'Asura Bladewise': '8C85', // line cleave from boss
    'Asura Image - Pedestal Purge': '8C82', // big circle AOE under image
    'Asura Image - Wheel of Deincarnation': '8C84', // big donut AOE under image
    'Asura Image - Bladewise': '8C86', // big line cleave from image
    'Asura Khadga 1': '8C89', // half-room cleave
    'Asura Khadga 2': '8C8A', // half-room cleave
    'Asura Khadga 3': '8C8B', // half-room cleave
    'Asura Khadga 4': '8C8C', // half-room cleave
    'Asura Khadga 5': '8C8D', // half-room cleave
    'Asura Khadga 6': '8C8E', // half-room cleave
    'Asura Face of Wrath': '8CA6', // red/blue mechanic (red unsafe)
    'Asura Face of Delight': '8CA7', // red/blue mechanic (blue unsafe)
    'Asura Myriad Aspects 1': '8CB4', // fan dodge (first hit)
    'Asura Myriad Aspects 2': '8CB5', // fan dodge (second hit)
    'Asura Scattering': '8C99', // rotating line cleaves
  },
  shareWarn: {
    'Asura Ordered Chaos': '8CA3', // spread AOEs during Chakra
  },
  shareFail: {
    'Asura Cutting Jewel': '8CA0', // tankbuster
  },
};

export default triggerSet;
