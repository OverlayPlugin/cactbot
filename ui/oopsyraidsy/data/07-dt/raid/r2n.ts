import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO:
//  - Trigger for Drop of Venom (missed stack)
//  - Trigger for Heartsick (missed light party stack)

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacLightHeavyweightM2,
  damageWarn: {
    'R2N Honey Beeline Normal': '9B39', // line cleave
    'R2N Tempting Twist Normal': '9B3A', // donut
    'R2N Honey Beeline Poison': '9B3B', // line cleave
    'R2N Tempting Twist Poison': '9B3C', // donut
    'R2N Poison Cloud Splinter': '916E', // follow-up circle AoEs

    'R2N Blow Kiss': '9173', // frontal cleave
    'R2N Loveseeker': '9AC1', // large point-blank circle
    'R2N Heartstruck Small': '9175', // small circle AoE
    'R2N Heartstruck Medium': '9176', // medium circle AoE
    'R2N Heartstruck Large': '9177', // large circle AoE
    'R2N Sweetheart Splinter': '917C', // getting hit by heart

    'R2N Blinding Love Rotating': '9A65', // rotating line cleaves
    'R2N Blinding Love Fixed': '9A66', // fixed hour-glass line cleaves
  },
  gainsEffectWarn: {
    'R2N Fatal Attraction': 'F50', // 3 hearts
  },
  shareWarn: {
    'R2N Heartsore': '917A', // spreads
    'R2N Honeyed Breeze': '9168', // buster cleaves
    'R2N Splash of Venom': '916F', // spreads during poison phase
  },
};

export default triggerSet;
