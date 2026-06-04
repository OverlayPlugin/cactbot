import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  pariChains: NetMatches['Tether'][];
  pariFalseFlameSafeHalf?: 'North' | 'South';
}

const pariArenaCenterX = -760.0;

const pariFalseFlameRightFableflight = 'B174';
const pariFalseFlameLeftFableflight = 'B175';

const pariFalseFlameFableflightSafeHalf = (
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
      pariChains: [],
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
      response: Responses.tankCleave(),
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
        centerForChains: {
          en: 'Center for Chains',
          de: 'Mitte für Ketten',
          fr: 'Centre pour les chaînes',
          ja: '鎖は中央へ',
          cn: '中间准备锁链',
          ko: '사슬 중앙',
          tc: '中間準備鎖鏈',
        },
      },
    },
    {
      id: 'Pari Charmed Chains Reset',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B08F', capture: false },
      run: (data) => data.pariChains = [],
    },
    {
      id: 'Pari Charmed Chains Tether',
      type: 'Tether',
      netRegex: { id: '0009' },
      condition: (data, matches) => matches.source === data.me || matches.target === data.me,
      preRun: (data, matches) => {
        data.pariChains.push(matches);
      },
      delaySeconds: 0.3,
      alertText: (data, _matches, output) => {
        const chain = data.pariChains.find((chain) =>
          chain.source === data.me || chain.target === data.me
        );

        if (chain === undefined)
          return;

        const partner = chain.source === data.me ? chain.target : chain.source;
        return output.chainedTo!({ player: data.party.member(partner) });
      },
      run: (data) => data.pariChains = [],
      outputStrings: {
        chainedTo: {
          en: 'Chained to ${player}',
          de: 'Kette mit ${player}',
          fr: 'Enchaîné à ${player}',
          ja: '${player}と鎖',
          cn: '与${player}连线',
          ko: '${player}와 사슬',
          tc: '與${player}連線',
        },
      },
    },
    {
      id: 'Pari Burning Chains On You',
      type: 'GainsEffect',
      netRegex: { effectId: '301' },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 2,
    response: Responses.breakChains(),
    },
    {
      id: 'Pari Sun Circlet',
      type: 'StartsUsing',
      netRegex: { source: 'Pari of Plenty', id: 'B187', capture: false },
      suppressSeconds: 3,
      alarmText: (_data, _matches, output) => output.inBossHitbox!(),
      outputStrings: {
        inBossHitbox: {
          en: 'In Boss Hitbox',
          de: 'In die Boss-Hitbox',
          fr: 'Dans la hitbox du boss',
          ja: 'ボスの足元へ',
          cn: '进Boss脚下',
          ko: '보스 안으로',
          tc: '進Boss腳下',
        },
      },
    },
    {
      id: 'Pari False Flame Fableflight',
      type: 'StartsUsing',
      netRegex: { id: [pariFalseFlameRightFableflight, pariFalseFlameLeftFableflight] },
      durationSeconds: 10,
      alertText: (data, matches, output) => {
        data.pariFalseFlameSafeHalf = pariFalseFlameFableflightSafeHalf(
          matches.id,
          parseFloat(matches.x),
        );

        if (data.pariFalseFlameSafeHalf === 'North')
          return output.northSafe!();

        if (data.pariFalseFlameSafeHalf === 'South')
          return output.southSafe!();
      },
      outputStrings: {
        northSafe: {
          en: 'North Safe',
          de: 'Norden sicher',
          fr: 'Nord sûr',
          ja: '北安置',
          cn: '北安全',
          ko: '북쪽 안전',
          tc: '北安全',
        },
        southSafe: {
          en: 'South Safe',
          de: 'Süden sicher',
          fr: 'Sud sûr',
          ja: '南安置',
          cn: '南安全',
          ko: '남쪽 안전',
          tc: '南安全',
        },
      },
    },
  ],
};

export default triggerSet;
