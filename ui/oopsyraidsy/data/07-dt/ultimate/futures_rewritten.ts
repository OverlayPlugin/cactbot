import ZoneId from '../../../../../resources/zone_id';
import { OopsyData } from '../../../../../types/data';
import { OopsyTriggerSet } from '../../../../../types/oopsy';

export type Data = OopsyData;

const triggerSet: OopsyTriggerSet<Data> = {
  zoneId: ZoneId.FuturesRewrittenUltimate,
  damageWarn: {},
  damageFail: {},
  gainsEffectFail: {},
  shareWarn: {},
  shareFail: {},
  soloWarn: {},
  triggers: [],
};

export default triggerSet;
