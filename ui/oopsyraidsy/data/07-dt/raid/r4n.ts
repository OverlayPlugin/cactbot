import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

// TODO:
//  - Add trigger for missing Wicked Bolt (stack)
//  - Add trigger for missing Soaring Soulpress (stack)
//  - Do something more with Stampeding Thunder? 3+ hits?

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.AacLightHeavyweightM4,
  damageWarn: {
    'R4N Sidewise Spark Right 1': '92BC', // half-room cleave
    'R4N Sidewise Spark Left 1': '92BD', // half-room cleave
    'R4N Sidewise Spark East': '92BE', // half-room cleave
    'R4N Sidewise Spark West': '92BF', // half-room cleave
    'R4N Replica Sidewise Spark Left': '9A0F', // half-room cleave
    'R4N Replica Sidewise Spark Right': '9A05', // half-room cleave

    // The Wicked Cannon ids are all over the place... /shrug
    'R4N Wicked Cannon Initial': '4E40', // first cannon, can be N or S
    'R4N Wicked Cannon Subsequent North': '9BAC', // not the first or last cannon, hits N
    'R4N Wicked Cannon Subsequent South': '9BBE', // not the first or last cannon, hits S
    'R4N Wicked Cannon Final South': '92AE', // last cannon, hits S
    'R4N Wicked Cannon Final North': '92AF', // last cannon, hits N

    'R4N Thunderslam': '92C6', // baited circle AoEs
    'R4N Bewitching Flight': '92B8', // line cleaves from wings
    'R4N Burst': '92B9', // exploding lines left behind by wings
    'R4N Witch Hunt': '92B6', // chasing circle AoEs
  },
  damageFail: {
    'R4N Stampeding Thunder Final': '8D36', // final hit that destroys floor
  },
  shareWarn: {
    'R4N Wicked Jolt': '92C8', // buster line cleave
    'R4N Thunderstorm': '92C5', // spread circle AoEs
  },
};

export default triggerSet;
