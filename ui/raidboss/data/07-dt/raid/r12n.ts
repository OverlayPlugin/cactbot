import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  tilePhaseHeadIds: string[];
  burstBlobs: { id: string; x: number; y: number }[];
}

const mapEffectType = {
  cruelCoil: {
    open: '00010001',
    closed: '00040004',
  },
  floorSnake: {
    show: '00010001',
    hide: '00040004',
  },
} as const;

const mapEffectData = {
  // Tile/Floor status. This one's speculation.
  // With tiles described as:
  // nwOuter | nwInner | neInner | neOuter
  // -------------------------------------
  // swOuter | swInner | seInner | seOuter
  '00': {
    'location': '00',
    // nwOuter/swInner/neInner/seOuter fully missing
    'nwOuterMissingFull': '00020001',
    // Respawning missing platform segments
    'nwOuterRestoring': '00080004',
    // nwOuter/swInner/neInner/seOuter partially missing
    'nwOuterMissingPartial': '00200010',
    // swOuter/nwInner/seInner/neOuter fully missing
    'swOuterMissingFull': '02000100',
    // swOuter/nwInner/seInner/neOuter partially missing
    'swOuterMissingPartial': '08000400',
    // Respawning missing platform segments
    'swOuterRestoring': '10000004',
    // Also respawning platform from nwOuter pattern? Only happened once
    'flags6': '80000004',
  },

  // 02-0A: Something to do with Cruel Coil vfx or maybe collision blockers
  // 0A seems to be general VFX
  // 00010001|07, others 00040004 = SW open
  // 00010001|05, others 00040004 = SE open
  // 00010001|03, others 00040004 = NE open
  // 00010001|09, others 00040004 = NW open
  // Default state for 02-09 is 00010001, so initial open spot does not recieve a line
  // Savage might have open spot at any card/intercard, probably 02 = north, increase clockwise?
  '02': mapEffectType.cruelCoil,
  '03': mapEffectType.cruelCoil,
  '04': mapEffectType.cruelCoil,
  '05': mapEffectType.cruelCoil,
  '06': mapEffectType.cruelCoil,
  '07': mapEffectType.cruelCoil,
  '08': mapEffectType.cruelCoil,
  '09': mapEffectType.cruelCoil,
  '0A': {
    'location': '0A',
    'flags0': '00010001',
    'flags1': '00040004',
  },

  // 0B-2A: Floor/snake animations during Bring Down the House cast
  // 0B 0C | 0D 0E | 0F 10 | 11 12
  // 1B 1C | 1D 1E | 1F 20 | 21 22
  // -----------------------------
  // 13 14 | 15 16 | 17 18 | 19 1A
  // 23 24 | 25 26 | 27 28 | 29 2A
  '0B': mapEffectType.floorSnake,
  '0C': mapEffectType.floorSnake,
  '0D': mapEffectType.floorSnake,
  '0E': mapEffectType.floorSnake,
  '0F': mapEffectType.floorSnake,
  '10': mapEffectType.floorSnake,
  '11': mapEffectType.floorSnake,
  '12': mapEffectType.floorSnake,
  '13': mapEffectType.floorSnake,
  '14': mapEffectType.floorSnake,
  '15': mapEffectType.floorSnake,
  '16': mapEffectType.floorSnake,
  '17': mapEffectType.floorSnake,
  '18': mapEffectType.floorSnake,
  '19': mapEffectType.floorSnake,
  '1A': mapEffectType.floorSnake,
  '1B': mapEffectType.floorSnake,
  '1C': mapEffectType.floorSnake,
  '1D': mapEffectType.floorSnake,
  '1E': mapEffectType.floorSnake,
  '1F': mapEffectType.floorSnake,
  '20': mapEffectType.floorSnake,
  '21': mapEffectType.floorSnake,
  '22': mapEffectType.floorSnake,
  '23': mapEffectType.floorSnake,
  '24': mapEffectType.floorSnake,
  '25': mapEffectType.floorSnake,
  '26': mapEffectType.floorSnake,
  '27': mapEffectType.floorSnake,
  '28': mapEffectType.floorSnake,
  '29': mapEffectType.floorSnake,
  '2A': mapEffectType.floorSnake,
} as const;
console.assert(mapEffectData);

const headMarkerData = {
  'feralFissionStack': '005D',
  'dramaticLysisSpread': '008B',
  'tankbuster': '0158',
  // Visible to all players
  'visibleFiveSecondCountdown': '0162',
  'feralFissionSpread': '0178',
  // Visible only to self, but still get packet for other players
  'selfFiveSecondCountdown': '028E',
} as const;

const center = {
  x: 100,
  y: 100,
} as const;

const tileHeadPositions = ['outW', 'inW', 'inE', 'outE'] as const;

type TileHeadPos = (typeof tileHeadPositions)[number];

const getTileHeadPos = (actor: Data['actorPositions'][0]): TileHeadPos => {
  const xOffset = actor.x - center.x;
  if (xOffset < -10)
    return 'outW';
  if (xOffset < 0)
    return 'inW';
  if (xOffset < 10)
    return 'inE';
  return 'outE';
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM4',
  zoneId: ZoneId.AacHeavyweightM4,
  timelineFile: 'r12n.txt',
  initData: () => ({
    actorPositions: {},
    tilePhaseHeadIds: [],
    burstBlobs: [],
  }),
  triggers: [
    {
      id: 'R12N CombatantMemory Add Tracker',
      type: 'CombatantMemory',
      netRegex: { id: '4[0-9A-Fa-f]{7}', change: 'Add', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x ?? '0'),
          y: parseFloat(matches.y ?? '0'),
          heading: parseFloat(matches.heading ?? '0'),
        },
    },
    {
      id: 'R12N ActorMove Tracker',
      type: 'ActorMove',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R12N ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R12N Feral Fission Party Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['feralFissionStack'], capture: true },
      durationSeconds: 5.1,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R12N Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 5.1,
      response: Responses.tankBuster(),
    },
    {
      id: 'R12N Feral Fission Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['feralFissionSpread'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 5,
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'R12N Dramatic Lysis Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['dramaticLysisSpread'], capture: true },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'R12N The Fixer',
      type: 'StartsUsing',
      netRegex: { id: 'B494', source: 'Lindwurm', capture: false },
      durationSeconds: 4.7,
      response: Responses.aoe(),
    },
    {
      id: 'R12N Bloodshed Cleaving West',
      type: 'StartsUsing',
      netRegex: { id: 'B465', source: 'Lindwurm', capture: false },
      durationSeconds: 7.6,
      response: Responses.goEast(),
    },
    {
      id: 'R12N Bloodshed Cleaving East',
      type: 'StartsUsing',
      netRegex: { id: 'B466', source: 'Lindwurm', capture: false },
      durationSeconds: 7.6,
      response: Responses.goWest(),
    },
    {
      id: 'R12N Ravenous Reach',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B46D', capture: true },
      durationSeconds: 10.3,
      alertText: (_data, matches, output) => {
        if (parseFloat(matches.x) < center.x)
          return output.west!();
        return output.east!();
      },
      outputStrings: {
        west: Outputs.getLeftAndWest,
        east: Outputs.getRightAndEast,
      },
    },
    // Burst blob spawns an EObj (type 7) at each location super early, but BNpcId is not unique to this mechanic
    // The objects are spawned directly in place, so there's no ActorSetPos to move them
    // After Ravenous Reach, an ActorControl EObjAnimation is fired off to display the circle and growing animation
    // Two blobs are created for the KB/launch mechanic, three blobs otherwise
    // Collect in one trigger, then determine what output to use in a second trigger, since amount of blobs varies
    {
      id: 'R12N Burst Blob Collector',
      type: 'ActorControlExtra',
      netRegex: { id: '4[0-9A-F]{7}', category: '019D', param1: '10', param2: '20', capture: true },
      run: (data, matches) => {
        data.burstBlobs.push({
          id: matches.id,
          x: parseFloat(matches.pairPosX ?? '0'),
          y: parseFloat(matches.pairPosY ?? '0'),
        });
      },
    },
    {
      id: 'R12N Burst Blob Output',
      type: 'ActorControlExtra',
      netRegex: {
        id: '4[0-9A-F]{7}',
        category: '019D',
        param1: '10',
        param2: '20',
        capture: false,
      },
      delaySeconds: 0.3,
      durationSeconds: 6.6,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        // @TODO: Better text/logic for safe spots maybe? Don't have enough data to determine if there are
        // patterns to call out or something
        if (data.burstBlobs.length < 3)
          return output.launchAway!();

        return output.moveAway!();
      },
      run: (data) => {
        if (data.burstBlobs.length < 3)
          return;
        data.burstBlobs = [];
      },
      outputStrings: {
        moveAway: {
          en: 'Away from expanding blobs',
          cn: '远离扩散粘液',
          ko: '커지는 점액에서 멀어지기',
        },
        launchAway: {
          en: 'Launch away from expanding blobs',
          cn: '向扩散粘液外击退',
          ko: '커지는 점액에서 멀어지는 쪽으로 밀쳐지기',
        },
      },
    },
    {
      id: 'R12N Flesh Launch Collector',
      type: 'GainsEffect',
      netRegex: { effectId: ['128B', '128C'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (_data, matches, output) => {
        return output[matches.effectId === '128B' ? 'forward' : 'back']!();
      },
      outputStrings: {
        forward: {
          en: 'Launching forward',
          cn: '向前击退',
          ko: '앞으로 밀쳐지기',
        },
        back: {
          en: 'Launching backward',
          cn: '向后击退',
          ko: '뒤로 밀쳐지기',
        },
      },
    },
    // More actions exist, but probably are savage related?
    // ref: https://v2.xivapi.com/api/search?sheets=Action&fields=Name&query=Name=%22Cruel%20Coil%22
    {
      id: 'R12N Cruel Coil Collector',
      type: 'Ability',
      netRegex: { id: ['B11B', 'B11C'], source: 'Lindwurm', capture: true },
      // Delay 3s to let bind happen
      delaySeconds: 3,
      // Display for 3s after the first rotation
      durationSeconds: 6.1,
      alertText: (_data, matches, output) =>
        output.text!({
          dir: output[matches.id === 'B11B' ? 'dirNW' : 'dirSE']!(),
        }),
      outputStrings: {
        text: {
          en: 'Escape (${dir} CW)',
          cn: '逃离 (${dir} 顺时针)',
          ko: '탈출 (${dir} 시계방향)',
        },
        ...Directions.outputStringsIntercardDir,
      },
    },
    {
      id: 'R12N Hemorrhagic Projection',
      type: 'GainsEffect',
      netRegex: { effectId: '808', count: ['408', '409', '40A', '40B'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (_data, matches, output) => {
        let dir: 'front' | 'right' | 'back' | 'left';
        if (matches.count === '408')
          dir = 'front';
        else if (matches.count === '409')
          dir = 'right';
        else if (matches.count === '40A')
          dir = 'back';
        else
          dir = 'left';
        return output.text!({ dir: output[dir]!() });
      },
      outputStrings: {
        front: Outputs.front,
        right: Outputs.right,
        back: Outputs.back,
        left: Outputs.left,
        text: {
          en: 'Cleaving ${dir}, point out',
          cn: '面向场外，${dir}扇形',
          ko: '${dir} 부채꼴, 바깥쪽으로 향하기',
        },
      },
    },
    {
      id: 'R12N Splattershed',
      type: 'StartsUsing',
      // B9BD, B9C0 are P1, animation varies slightly
      // BBE0 is P2, and is technically just VFX. BBE1 is the actual P2 damage ability
      // used to give a 2s delay to dmg hit
      netRegex: { id: ['B9BD', 'B9C0', 'BBE0'], source: 'Lindwurm', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R12N Feral Fission',
      type: 'Ability',
      netRegex: { id: 'B478', source: 'Lindwurm', capture: false },
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from snakes, platform breaking',
          cn: '远离蛇，平台破坏',
          ko: '뱀에서 멀어지기, 바닥 부서짐',
        },
      },
    },
    {
      id: 'R12N Tiles Phase Wyrm Head Cleaves',
      type: 'ActorControlExtra',
      // PlayActionTimeline, shows the "head rises from the void" animation
      netRegex: { category: '0197', param1: '11D3', capture: true },
      preRun: (data, matches) => {
        data.tilePhaseHeadIds.push(matches.id);
      },
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        if (data.tilePhaseHeadIds.length < 2)
          return;
        const [actor1Id, actor2Id] = data.tilePhaseHeadIds;

        if (actor1Id === undefined || actor2Id === undefined)
          return;

        const [actor1, actor2] = [data.actorPositions[actor1Id], data.actorPositions[actor2Id]];

        if (actor1 === undefined || actor2 === undefined)
          return;

        const head1Pos = getTileHeadPos(actor1);
        const head2Pos = getTileHeadPos(actor2);

        if (head1Pos.startsWith('out') && head2Pos.startsWith('out'))
          return output.middle!();

        if (head1Pos.endsWith('E') && head2Pos.endsWith('E'))
          return output.west!();

        if (head1Pos.endsWith('W') && head2Pos.endsWith('W'))
          return output.east!();

        const positions: TileHeadPos[] = [...tileHeadPositions].filter((pos) =>
          pos !== head1Pos && pos !== head2Pos
        );

        const [safePos1, safePos2] = positions;

        return output.text!({
          dir1: output[safePos1 ?? 'unknown']!(),
          dir2: output[safePos2 ?? 'unknown']!(),
        });
      },
      run: (data) => {
        if (data.tilePhaseHeadIds.length < 2)
          return;
        data.tilePhaseHeadIds = [];
      },
      outputStrings: {
        middle: Outputs.middle,
        east: Outputs.getRightAndEast,
        west: Outputs.getLeftAndWest,
        outW: {
          en: 'Out West',
          cn: '左外',
          ko: '서쪽 바깥',
        },
        inW: {
          en: 'In West',
          cn: '左内',
          ko: '서쪽 안',
        },
        inE: {
          en: 'In East',
          cn: '右内',
          ko: '동쪽 안',
        },
        outE: {
          en: 'Out East',
          cn: '右外',
          ko: '동쪽 바깥',
        },
        text: {
          en: '${dir1}/${dir2}',
          cn: '${dir1}/${dir2}',
          ko: '${dir1}/${dir2}',
        },
      },
    },
    {
      id: 'R12N Mindless Flesh',
      type: 'StartsUsing',
      netRegex: {
        id: ['BBD8', 'BBD9', 'BBDA', 'BBDB', 'BBDC', 'BBDD', 'BBDE'],
        source: 'Lindwurm',
        capture: false,
      },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge lines',
          cn: '躲避直线',
          ko: '직선장판 피하기',
        },
      },
    },
    {
      id: 'R12N Mindless Flesh Huge',
      type: 'StartsUsingExtra',
      netRegex: { id: 'BBDF', capture: true },
      delaySeconds: 9,
      durationSeconds: 6.8,
      infoText: (_data, matches, output) => {
        if (parseFloat(matches.x) < center.x)
          return output.east!();
        return output.west!();
      },
      outputStrings: {
        west: Outputs.getLeftAndWest,
        east: Outputs.getRightAndEast,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'cn',
      'replaceSync': {
        'Lindwurm': '林德布鲁姆',
      },
      'replaceText': {
        '\\(huge\\)': '(大)',
        'Bloodshed': '流血',
        'Bring Down the House': '震场',
        '(?<! )Burst': '大爆炸',
        'Constrictor': '巨蟒绞缠',
        'Cruel Coil': '残暴拘束',
        'Dramatic Lysis': '细胞爆炸',
        'Feral Fission': '野性分裂',
        'Fourth-Wall Fusion': '细胞轰炸',
        'Grand Entrance': '盛大登场',
        'Grotesquerie': '细胞附身',
        'Hemorrhagic Projection': '指向性冲击波',
        'Mindless Flesh': '细胞失控',
        'Ravenous Reach': '极饿伸展',
        'Serpentine Scourge': '灾变吐息',
        'Shockwave': '冲击波',
        'Skinsplitter': '蜕鳞',
        'Splattershed': '溅血',
        'Split Scourge': '分裂灾变',
        'The Fixer': '补天之手',
        'Venomous Scourge': '滴液灾变',
        'Visceral Burst': '脏腑爆裂',
      },
    },
  ],
};

export default triggerSet;
