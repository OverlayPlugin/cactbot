import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputIntercard,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  actorSetPosTracker: { [id: string]: NetMatches['ActorSetPos'] };
  lastDoubleStyle?: DoubleStyleEntry;
  tetherTracker: { [id: string]: NetMatches['Tether'] };
}

type DoubleStyleActors = 'bomb' | 'wing' | 'succ' | 'marl';
type DoubleStyleEntry = {
  red: DoubleStyleActors;
  blue: DoubleStyleActors;
  count: number;
};
const doubleStyleMap: { [id: string]: DoubleStyleEntry } = {
  '93CA': { red: 'marl', blue: 'succ', count: 2 },
  '9408': { red: 'succ', blue: 'marl', count: 2 },
  'A67D': { red: 'marl', blue: 'marl', count: 2 },
  'A67E': { red: 'succ', blue: 'succ', count: 2 },
  'A67F': { red: 'bomb', blue: 'succ', count: 4 },
  'A680': { red: 'wing', blue: 'succ', count: 4 },
  'A681': { red: 'bomb', blue: 'marl', count: 4 },
  'A682': { red: 'wing', blue: 'marl', count: 4 },
};

const dirToSameCorners = (dir: DirectionOutput8): DirectionOutput8[] => {
  switch (dir) {
    case 'dirN':
      return ['dirNE', 'dirNW'];
    case 'dirE':
      return ['dirSE', 'dirNE'];
    case 'dirS':
      return ['dirSE', 'dirSW'];
    case 'dirW':
      return ['dirNW', 'dirSW'];
  }
  return [];
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacCruiserweightM2Savage',
  zoneId: ZoneId.AacCruiserweightM2Savage,
  timelineFile: 'r6s.txt',
  initData: () => ({
    actorSetPosTracker: {},
    tetherTracker: {},
  }),
  triggers: [
    {
      id: 'R6S Mousse Mural',
      type: 'StartsUsing',
      netRegex: { id: 'A6BC', source: 'Sugar Riot', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R6S ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) => data.actorSetPosTracker[matches.id] = matches,
    },
    {
      id: 'R6S Sticky Mousse',
      type: 'StartsUsing',
      netRegex: { id: 'A695', source: 'Sugar Riot', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'R6S Color Riot',
      type: 'StartsUsing',
      netRegex: { id: ['A691', 'A692'], source: 'Sugar Riot' },
      response: Responses.tankCleave(),
    },
    {
      id: 'R6S Color Clash',
      type: 'StartsUsing',
      netRegex: { id: ['A68B', 'A68D'], source: 'Sugar Riot', capture: true },
      infoText: (_data, matches, output) => {
        const mech = matches.id === 'A68B' ? 'healerStacks' : 'partners';
        return output.stored!({ mech: output[mech]!() });
      },
      outputStrings: {
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
        stored: {
          en: 'Stored ${mech} for later',
          cn: '稍后 ${mech}',
        },
      },
    },
    {
      id: 'R6S Color Clash Followup',
      type: 'StartsUsing',
      netRegex: { id: ['A68B', 'A68D'], source: 'Sugar Riot', capture: true },
      delaySeconds: 18,
      infoText: (_data, matches, output) => {
        const mech = matches.id === 'A68B' ? 'healerStacks' : 'partners';
        return output[mech]!();
      },
      outputStrings: {
        healerStacks: Outputs.healerGroups,
        partners: Outputs.stackPartner,
      },
    },
    {
      id: 'R6S Double Style Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(doubleStyleMap), source: 'Sugar Riot', capture: true },
      run: (data, matches) => data.lastDoubleStyle = doubleStyleMap[matches.id],
    },
    {
      id: 'R6S Double Style Tether Tracker',
      type: 'Tether',
      netRegex: { targetId: '4[0-9A-Fa-f]{7}', id: ['013F', '0140'], capture: true },
      condition: (data) => data.lastDoubleStyle !== undefined,
      preRun: (data, matches) => data.tetherTracker[matches.sourceId] = matches,
      infoText: (data, _matches, output) => {
        const doubleStyle = data.lastDoubleStyle;
        if (doubleStyle === undefined)
          return;

        if (Object.keys(data.tetherTracker).length < doubleStyle.count)
          return;

        let safeDirs: DirectionOutputIntercard[] = [
          'dirNE',
          'dirNW',
          'dirSE',
          'dirSW',
        ];

        const startDirMap = {
          'dirNE': 'dirSW',
          'dirNW': 'dirSE',
          'dirSE': 'dirNW',
          'dirSW': 'dirNE',
          'unknown': 'unknown',
        } as const;

        const tethers = Object.entries(data.tetherTracker);
        data.tetherTracker = {};

        for (const [id, tether] of tethers) {
          const actorSetPosData = data.actorSetPosTracker[id];
          if (actorSetPosData === undefined)
            return;

          const actorType = doubleStyle[tether.id === '013F' ? 'red' : 'blue'];
          const x = parseFloat(actorSetPosData.x);
          const y = parseFloat(actorSetPosData.y);
          const mirroredX = ((x - 100) * -1) + 100;
          const actorDir = Directions.xyTo8DirOutput(x, y, 100, 100);
          const mirroredXDir = Directions.xyTo8DirOutput(mirroredX, y, 100, 100);
          const sameDirCorners = dirToSameCorners(actorDir);

          switch (actorType) {
            case 'bomb':
              safeDirs = safeDirs.filter((dir) => dir !== actorDir);
              break;
            case 'wing':
              safeDirs = safeDirs.filter((dir) => dir !== mirroredXDir);
              break;
            case 'succ':
              safeDirs = safeDirs.filter((dir) => !sameDirCorners.includes(dir));
              break;
            case 'marl':
              safeDirs = safeDirs.filter((dir) => sameDirCorners.includes(dir));
              break;
          }
        }

        const [dir] = safeDirs;

        if (safeDirs.length !== 1 || dir === undefined) {
          console.log(`R6S Double Style Tether Tracker - Invalid data!`);
          return;
        }

        const startDir = startDirMap[dir] ?? 'unknown';

        return output.text!({
          dir1: output[startDir]!(),
          dir2: output[dir]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        text: {
          en: 'Start ${dir1}, launch towards ${dir2}',
          cn: '从 ${dir1} 飞向 ${dir2}',
        },
      },
    },
  ],
};

export default triggerSet;
