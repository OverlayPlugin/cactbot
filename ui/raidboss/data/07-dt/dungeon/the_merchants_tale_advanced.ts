import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  pariFalseFlameFableflightCalled: boolean;
  pariFalseFlameSafeHalf?: 'North' | 'South';
}

const pariArenaCenterX = -760.0;

const pariFalseFlameRightFableflight = 'B174';
const pariFalseFlameLeftFableflight = 'B175';

const pariCharmedFableflightSafeHalf = (
  id: string,
  x: number,
): 'North' | 'South' | undefined => {
  const threshold = 5.0;
  const isEast = x > pariArenaCenterX + threshold;
  const isWest = x < pariArenaCenterX - threshold;
  const isLeft = id === pariFalseFlameLeftFableflight;
  const isRight = id === pariFalseFlameRightFableflight;

  if (!isEast && !isWest)
    return undefined;

  if (isEast && isRight)
    return 'South';

  if (isEast && isLeft)
    return 'North';

  if (isWest && isRight)
    return 'North';

  if (isWest && isLeft)
    return 'South';

  return undefined;
};

const triggerSet: TriggerSet<Data> = {
  id: 'TheMerchantsTaleAdvanced',
  zoneId: ZoneId.TheMerchantsTaleAdvanced,
  timelineFile: 'the_merchants_tale_advanced.txt',

  initData: () => {
    return {
      pariFalseFlameFableflightCalled: false,
      pariFalseFlameSafeHalf: undefined,
    };
  },

  triggers: [
    {
      id: 'Pari Heat Burst',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1CC', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Pari Fire Of Victory',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1CE' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Pari Scouring Scorn',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B1B2', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Pari Doubling Center For Chains',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B093', capture: false },
      durationSeconds: 4,
      alertText: (_data, _matches, output) => output.centerForChains!(),
      outputStrings: {
        centerForChains: { en: 'Center for Chains' },
      },
    },
    {
      id: 'Pari Sun Circlet',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B187', capture: false },
      suppressSeconds: 3,
      alarmText: (_data, _matches, output) => output.inBossHitbox!(),
      outputStrings: {
        inBossHitbox: { en: 'In Boss Hitbox' },
      },
    },
    {
      id: 'Pari False Flame Right Fableflight',
      type: 'StartsUsing',
      netRegex: { id: pariFalseFlameRightFableflight },
      durationSeconds: 10,
      alertText: (data, matches, output) => {
        data.pariFalseFlameFableflightCalled = true;
        data.pariFalseFlameSafeHalf = pariCharmedFableflightSafeHalf(
          matches.id,
          parseFloat(matches.x),
        );

        if (data.pariFalseFlameSafeHalf === undefined)
          return;

        return output.safeHalf!({ dir: data.pariFalseFlameSafeHalf });
      },
      outputStrings: {
        safeHalf: { en: '${dir} Safe' },
      },
    },
    {
      id: 'Pari False Flame Left Fableflight',
      type: 'StartsUsing',
      netRegex: { id: pariFalseFlameLeftFableflight },
      durationSeconds: 10,
      alertText: (data, matches, output) => {
        data.pariFalseFlameFableflightCalled = true;
        data.pariFalseFlameSafeHalf = pariCharmedFableflightSafeHalf(
          matches.id,
          parseFloat(matches.x),
        );

        if (data.pariFalseFlameSafeHalf === undefined)
          return;

        return output.safeHalf!({ dir: data.pariFalseFlameSafeHalf });
      },
      outputStrings: {
        safeHalf: { en: '${dir} Safe' },
      },
    },
  ],
};

export default triggerSet;
