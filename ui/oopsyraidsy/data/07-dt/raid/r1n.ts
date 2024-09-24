import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

// TODO:
//   - Add trigger for missed Clawful (stack)
//   - Add trigger for missed Oveershadow (stack)

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacLightHeavyweightM1,
  damageWarn: {
    'R1N One-two Paw Right First': '930A', // half-room cleaves (R->L)
    'R1N One-two Paw Left Second': '930B', // half-room cleaves (R->L)
    'R1N One-two Paw Left First': '930E', // half-room cleaves (L->R)
    'R1N One-two Paw Right Second': '930D', // half-room cleaves (L->R)
    'R1N Black Cat Crossing First': '9311', // first set of cone cleaves
    'R1N Black Cat Crossing Second': '9312', // second set of cone cleaves
    'R1N Mouser': '94A5', // Tile hit (but not yet broken)
    'R1N Predaceous Pounce Line': '9964', // line AoE telegraphing next jump
    'R1N Predaceous Pounce Jump': '9931', // circle AoE
    'R1N Leaping One-two Paw East Right': '9324', // jump + arena cleaves
    'R1N Leaping One-two Paw East Left': '9325', // jump + arena cleaves
    'R1N Leaping One-two Paw West Right': '9327', // jump + arena cleaves
    'R1N Leaping One-two Paw West Left': '9328', // jump + arena cleaves
    'R1N Leaping Black Cat Crossing First': '932C', // jump + first set of cone cleaves
    'R1N Leaping Black Cat Crossing Second': '932D', // jump + second set of cone cleaves
  },
  shareWarn: {
    'R1N Grimalkin Gale': '933F', // spread circle AoEs
  },
};

export default triggerSet;
