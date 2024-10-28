import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Map out MapEffect data if needed? Might be useful for prep for savage.
// TODO: Better triggers for Bewitching Flight, collector for the loop to combine trigger with clone
// and better wording for safe spot callout

// TODO: Might be able to use `npcYellData` to detect phase push, I didn't look into it very much

const effectB9AMap = {
  orangeDiamondFront: '2D3',
  blueCircleBack: '2D4',
} as const;

type B9AMapKeys = keyof typeof effectB9AMap;
type B9AMapValues = typeof effectB9AMap[B9AMapKeys];

const directionOutputStrings = {
  ...Directions.outputStrings8Dir,
  unknown: Outputs.unknown,
  goLeft: Outputs.left,
  goRight: Outputs.right,
  stay: {
    en: 'Stay',
  },
  num2: Outputs.num2,
  separator: {
    en: ' => ',
    de: ' => ',
    fr: ' => ',
    ja: ' => ',
    cn: ' => ',
    ko: ' => ',
  },
  intercardStay: {
    en: '${dir} => Stay',
  },
  numHits: {
    en: '${dir} x${num}',
    de: '${dir} x${num}',
    fr: '${dir} x${num}',
    ja: '${dir} x${num}',
    cn: '${dir} x${num}',
    ko: '${dir} x${num}',
  },
  combo: {
    en: '${dirs}',
    de: '${dirs}',
    fr: '${dirs}',
    ja: '${dirs}',
    cn: '${dirs}',
    ko: '${dirs}',
  },
} as const;

type StoredCleave = {
  id: number;
  dir: 'left' | 'right';
};

export interface Data extends RaidbossData {
  expectedBlasts: 0 | 3 | 4 | 5;
  storedBlasts: B9AMapValues[];
  // expectedCleaves is either 1 or 5, due to the amount of time between the first
  // and second clone cleaves at the start of the encounter
  expectedCleaves: 1 | 5;
  storedCleaves: StoredCleave[];
  actors: PluginCombatantState[];
  sidewiseSparkCounter: number;
  storedWitchHuntCast?: NetMatches['StartsUsingExtra'];
}

const b9aValueToNorthSouth = (
  searchValue: B9AMapValues | undefined,
): 'dirN' | 'dirS' | 'unknown' => {
  if (searchValue === effectB9AMap.blueCircleBack) {
    return 'dirN';
  } else if (searchValue === effectB9AMap.orangeDiamondFront) {
    return 'dirS';
  }

  return 'unknown';
};

const isEffectB9AValue = (value: string | undefined): value is B9AMapValues => {
  if (value === undefined)
    return false;
  return Object.values<string>(effectB9AMap).includes(value);
};

const getCleaveDirs = (
  actors: PluginCombatantState[],
  storedCleaves: StoredCleave[],
): DirectionOutput8[] => {
  const dirs: DirectionOutput8[] = storedCleaves.map((entry) => {
    const actor = actors.find((actor) => actor.ID === entry.id);
    if (actor === undefined)
      return 'unknown';
    const actorFacing = Directions.hdgTo4DirNum(actor.Heading);
    const offset = entry.dir === 'left' ? 1 : -1;
    return Directions.outputFromCardinalNum((actorFacing + 4 + offset) % 4);
  });

  if (dirs.length === 1)
    return dirs;

  // Check if all directions lead to the same intercard. If so, there's no
  // reason to call a sequence. We don't need to check the cardinals,
  // because it will only be true either when there is exactly one element,
  // or in the extremely unlikely event that every clone pointed in the same
  // direction.
  if (dirs.every((dir) => ['dirN', 'dirE'].includes(dir)))
    return ['dirNE'];
  if (dirs.every((dir) => ['dirS', 'dirE'].includes(dir)))
    return ['dirSE'];
  if (dirs.every((dir) => ['dirS', 'dirW'].includes(dir)))
    return ['dirSW'];
  if (dirs.every((dir) => ['dirN', 'dirW'].includes(dir)))
    return ['dirNW'];

  return dirs;
};

const npcYellData = {
  // Offsets: 456920,494045,510794
  '43D4': {
    'yellId': '43D4',
    'text': 'M-My body...',
    'npcIds': ['3301'],
  },
  // Offsets: 482233,519355,536125
  '43D5': {
    'yellId': '43D5',
    'text': 'Ugh... How is this possible...?',
    'npcIds': ['3301'],
  },
  // Offsets: 507543,544663,561452,569975,595291
  '43D7': {
    'yellId': '43D7',
    'text': '<pant> <pant>',
    'npcIds': ['3301'],
  },
} as const;
console.assert(npcYellData);

const headMarkerData = {
  // Vfx Path: com_share3t
  stack: '00A1',
  // Vfx Path: com_share5a1
  multiHitStack: '013C',
  // Vfx Path: tag_ae5m_8s_0v
  spread: '0159',
  // Vfx Path: tank_laser_5sec_lockon_c0a1
  tankBusterLine: '01D7',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacLightHeavyweightM4',
  zoneId: ZoneId.AacLightHeavyweightM4,
  timelineFile: 'r4n.txt',
  initData: () => ({
    expectedBlasts: 0,
    storedBlasts: [],
    actors: [],
    expectedCleaves: 1,
    storedCleaves: [],
    sidewiseSparkCounter: 0,
  }),
  triggers: [
    {
      id: 'R4N Actor Collector',
      type: 'StartsUsing',
      netRegex: { id: '92C7', source: 'Wicked Thunder', capture: false },
      promise: async (data) => {
        data.actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
      },
    },
    {
      id: 'R4N ActorSetPos Collector',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-F]{7}', capture: true },
      run: (data, matches) => {
        const actor = data.actors.find((actor) => actor.ID === parseInt(matches.id, 16));
        if (actor === undefined)
          return;

        actor.PosX = parseFloat(matches.x);
        actor.PosY = parseFloat(matches.y);
        actor.PosZ = parseFloat(matches.z);
        actor.Heading = parseFloat(matches.heading);
      },
    },
    {
      id: 'R4N Clone Cleave Collector',
      type: 'CombatantMemory',
      // Filter to only enemy actors for performance
      // TODO: Change this to an ActorControlExtra line if OverlayPlugin adds SetModelState as a valid category
      netRegex: {
        id: '4[0-9A-Fa-f]{7}',
        pair: [{ key: 'WeaponId', value: ['33', '121'] }],
        capture: true,
      },
      condition: (data, matches) => {
        const actorID = parseInt(matches.id, 16);
        const initActorData = data.actors.find((actor) => actor.ID === actorID);
        if (!initActorData)
          return false;

        const weaponId = matches.pairWeaponId;
        if (weaponId === undefined)
          return false;

        const cleaveDir = weaponId === '121' ? 'left' : 'right';

        // Sometimes we get extra lines with weaponId changed. Update an existing actor if it's already in the array.
        const existingCleave = data.storedCleaves.find((cleave) => cleave.id === actorID);
        if (existingCleave !== undefined) {
          existingCleave.dir = cleaveDir;
        } else {
          data.storedCleaves.push({
            dir: cleaveDir,
            id: actorID,
          });
        }

        // If we're only expecting one, or if we're expecting 5 and have two
        return data.expectedCleaves === 1 || data.storedCleaves.length === 2;
      },
      // Delay half a second to allow `ActorSetPos` line to happen as well
      delaySeconds: 0.5,
      durationSeconds: 7.3,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const dirs = getCleaveDirs(data.actors, data.storedCleaves);
        const mappedDirs = dirs.map((dir) => output[dir]!());

        /* if we collapsed the callout to intercard, include x2 */
        if (mappedDirs.length === 1 && data.storedCleaves.length === 2)
          return output.numHits!({ dir: mappedDirs[0], num: output.num2!() });

        return output.combo!({ dirs: mappedDirs.join(output.separator!()) });
      },
      run: (data) => {
        if (data.expectedCleaves === 1)
          data.storedCleaves = [];
      },
      outputStrings: directionOutputStrings,
    },
    {
      id: 'R4N Headmarker Soaring Soulpress Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.stack, capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R4N Headmarker Wicked Bolt Multi Hit Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.multiHitStack, capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R4N Headmarker Thunderstorm Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.spread, capture: false },
      suppressSeconds: 5,
      response: Responses.spread(),
    },
    {
      id: 'R4N Headmarker Wicked Jolt Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData.tankBusterLine, capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'R4N Wrath of Zeus',
      type: 'StartsUsing',
      netRegex: { id: '92C7', source: 'Wicked Thunder', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R4N Sidewise Spark Counter',
      type: 'StartsUsing',
      netRegex: { id: ['92BC', '92BD', '92BE', '92BF'], source: 'Wicked Thunder', capture: false },
      delaySeconds: 1,
      run: (data) => {
        data.sidewiseSparkCounter++;
        if (data.sidewiseSparkCounter > 1) {
          data.expectedCleaves = 5;
        }
      },
    },
    {
      id: 'R4N Sidewise Spark',
      type: 'StartsUsing',
      // IDs for safe spots are C/E = left safe, D/F = right safe
      netRegex: { id: ['92BC', '92BE', '92BD', '92BF'], source: 'Wicked Thunder', capture: true },
      durationSeconds: 7.3,
      infoText: (data, matches, output) => {
        const cleaveDir = ['92BC', '92BE'].includes(matches.id) ? 'right' : 'left';
        const actorID = parseInt(matches.sourceId, 16);

        // If this is the first cleave, it's boss relative because boss isn't fixed north
        if (data.storedCleaves.length === 0)
          return cleaveDir === 'right' ? output.goLeft!() : output.goRight!();

        data.storedCleaves.push({
          dir: cleaveDir,
          id: actorID,
        });

        // If we got 5 hits, the first 2 were already called out while
        // collecting the clone hits. Don't repeat them.
        const remainingHits = data.storedCleaves.length === 5
          ? data.storedCleaves.slice(-3)
          : data.storedCleaves;

        const dirs: DirectionOutput8[] = getCleaveDirs(data.actors, remainingHits);

        if (dirs.length === 1) {
          const dir = dirs[0]!;
          const mappedDir = output[dir]!();
          return output.intercardStay!({ dir: mappedDir });
        }

        const mappedDirs = dirs.map((dir) => output[dir]!());

        return output.combo!({ dirs: mappedDirs.join(output.separator!()) });
      },
      run: (data) => {
        data.storedCleaves = [];
      },
      outputStrings: directionOutputStrings,
    },
    {
      id: 'R4N Left Roll',
      type: 'Ability',
      netRegex: { id: '92AC', source: 'Wicked Thunder', capture: false },
      response: Responses.goWest(),
    },
    {
      id: 'R4N Right Roll',
      type: 'Ability',
      netRegex: { id: '92AB', source: 'Wicked Thunder', capture: false },
      response: Responses.goEast(),
    },
    {
      id: 'R4N Threefold Blast Initializer',
      type: 'StartsUsing',
      netRegex: { id: ['92AD', '92B0'], source: 'Wicked Thunder', capture: false },
      run: (data) => {
        data.expectedBlasts = 3;
        data.storedBlasts = [];
      },
    },
    {
      id: 'R4N Fourfold Blast Initializer',
      type: 'StartsUsing',
      netRegex: { id: ['9B4F', '9B55'], source: 'Wicked Thunder', capture: false },
      run: (data) => {
        data.expectedBlasts = 4;
        data.storedBlasts = [];
      },
    },
    {
      id: 'R4N Fivefold Blast Initializer',
      type: 'StartsUsing',
      netRegex: { id: ['9B56', '9B57'], source: 'Wicked Thunder', capture: false },
      run: (data) => {
        data.expectedBlasts = 5;
        data.storedBlasts = [];
      },
    },
    {
      id: 'R4N XFold Blast Collector',
      type: 'GainsEffect',
      netRegex: { effectId: 'B9A', count: Object.values(effectB9AMap), capture: true },
      condition: (data, matches) => {
        const count = matches.count;
        if (data.expectedBlasts === 0)
          return false;

        if (!isEffectB9AValue(count))
          return false;
        data.storedBlasts.push(count);

        return data.storedBlasts.length >= data.expectedBlasts;
      },
      durationSeconds: (data) => {
        if (data.expectedBlasts === 3)
          return 14.4;
        if (data.expectedBlasts === 4)
          return 18.9;
        return 23.2;
      },
      infoText: (data, _matches, output) => {
        const dirs = data.storedBlasts.map((b9aVal) => output[b9aValueToNorthSouth(b9aVal)]!());
        return output.combo!({ dirs: dirs.join(output.separator!()) });
      },
      run: (data) => {
        data.expectedBlasts = 0;
      },
      outputStrings: directionOutputStrings,
    },
    {
      id: 'R4N Wicked Cannon',
      type: 'Ability',
      netRegex: {
        id: ['4E40', '9BBE', '9A2F', '9BAC', '92AE'],
        source: 'Wicked Thunder',
        capture: false,
      },
      durationSeconds: 2,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = directionOutputStrings;
        const thisBlast = data.storedBlasts.shift();

        if (data.storedBlasts.length === 0)
          return;

        const nextBlast = data.storedBlasts[0];
        const dir = output[b9aValueToNorthSouth(nextBlast)]!();

        if (thisBlast === nextBlast)
          return { infoText: dir };

        return { alertText: dir };
      },
      run: (data) => {
        data.expectedBlasts = 0;
      },
    },
    {
      id: 'R4N Bewitching Flight Right Safe',
      type: 'StartsUsing',
      netRegex: { id: '8DE4', source: 'Wicked Thunder', capture: false },
      // Disabled until we have a better way to phrase this.
      condition: false,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East offset safe',
          de: 'Ost-Offset sicher',
          fr: 'Offset Est sûr',
          ja: '最東端の床へ',
          cn: '右(东)侧 安全',
          ko: '동쪽 끝 안전',
        },
      },
    },
    {
      id: 'R4N Bewitching Flight South Safe',
      type: 'StartsUsing',
      netRegex: { id: '8DE4', source: 'Wicked Replica', capture: false },
      // Disabled until we have a better way to phrase this.
      condition: false,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'South offset safe',
          de: 'Süd-Offset sicher',
          fr: 'Offset Sud sûr',
          ja: '最南端の床へ',
          cn: '下(南)侧 安全',
          ko: '남쪽 끝 안전',
        },
      },
    },
    {
      id: 'R4N Bewitching Flight Left Safe',
      type: 'StartsUsing',
      netRegex: { id: '8DE6', source: 'Wicked Thunder', capture: false },
      // Disabled until we have a better way to phrase this.
      condition: false,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'West offset safe',
          de: 'West-Offset sicher',
          fr: 'Offset Ouest sûr',
          ja: '最西端の床へ',
          cn: '左(西)侧 安全',
          ko: '서쪽 끝 안전',
        },
      },
    },
    {
      id: 'R4N Bewitching Flight North Safe',
      type: 'StartsUsing',
      netRegex: { id: '8DE6', source: 'Wicked Replica', capture: false },
      // Disabled until we have a better way to phrase this.
      condition: false,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'North offset safe',
          de: 'Nord-Offset sicher',
          fr: 'Offset Nord sûr',
          ja: '最北端の床へ',
          cn: '上(北)侧 安全',
          ko: '북쪽 끝 안전',
        },
      },
    },
    {
      id: 'R4N Witch Hunt',
      type: 'StartsUsingExtra',
      netRegex: { id: '92B5', capture: true },
      condition: (data, matches) => {
        const posX = parseFloat(matches.x);
        const posY = parseFloat(matches.y);
        // If this is a dead center blast, ignore it, since we can't tell the spiral direction from it
        if (Math.abs(posX - 100.009) < Number.EPSILON && Math.abs(posY - 100.009) < Number.EPSILON)
          return false;
        if (data.storedWitchHuntCast !== undefined)
          return true;
        data.storedWitchHuntCast = matches;
        return false;
      },
      suppressSeconds: 15,
      infoText: (data, matches, output) => {
        const storedCast = data.storedWitchHuntCast;
        if (storedCast === undefined)
          return output.unknown!();
        const firstCastTargetX = parseFloat(storedCast.x);
        const firstCastTargetY = parseFloat(storedCast.y);
        const secondCastTargetX = parseFloat(matches.x);
        const secondCastTargetY = parseFloat(matches.y);

        // Figure out if we're going out to in, or in to out
        const dist = Math.hypot(
          firstCastTargetX - secondCastTargetX,
          firstCastTargetY - secondCastTargetY,
        );
        const outToIn = dist < 15;

        // Determine our starting quadrant and distance
        const startingWest = firstCastTargetX < 100;
        const startingNorth = firstCastTargetY < 100;

        // Figure out if the puddles are rotating clockwise or counterclockwise
        let clockwise: boolean;
        if (Math.abs(firstCastTargetX - secondCastTargetX) < Number.EPSILON) {
          if (startingWest)
            clockwise = firstCastTargetY < secondCastTargetY;
          else
            clockwise = secondCastTargetY < firstCastTargetY;
        } else {
          if (startingNorth)
            clockwise = firstCastTargetX < secondCastTargetX;
          else
            clockwise = secondCastTargetX < firstCastTargetX;
        }

        let startingDir = Directions.xyTo8DirNum(firstCastTargetX, firstCastTargetY, 100, 100);

        if (clockwise) {
          // example: first hit close nw, second hit close ne
          // dodge is north, out to in
          // add 1 or subtract 2 to direction to get starting point
          startingDir = (startingDir + (outToIn ? 6 : 1)) % 8;
        } else {
          // example: first hit close nw, second hit close sw
          // dodge is west, out to in
          // subtract 1 or add 2 from direction to get starting point
          startingDir = (startingDir + (outToIn ? 2 : 7)) % 8;
        }

        const outputDir = Directions.output8Dir[startingDir] ?? 'unknown';
        if (outToIn) {
          return output.outToIn!({ dir: output[outputDir]!() });
        }

        return output.inToOut!({ dir: output[outputDir]!() });
      },
      outputStrings: {
        outToIn: {
          en: '${dir}, Out => In',
          de: '${dir}, Raus => Rein',
          fr: '${dir}, Extérieur => Intérieur',
          ja: '${dir}, 外側 => 内側',
          cn: '${dir}, 远离 => 靠近',
          ko: '${dir}, 밖 => 안',
        },
        inToOut: {
          en: '${dir}, In => Out',
          de: '${dir}, Rein => Raus',
          fr: '${dir}, Intérieur => Extérieur',
          ja: '${dir}, 内側 => 外側',
          cn: '${dir}, 靠近 => 远离',
          ko: '${dir}, 안 => 밖',
        },
        unknown: Outputs.unknown,
        ...Directions.outputStrings8Dir,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Wicked Replica': 'Tosender Donner-Phantom',
        'Wicked Thunder': 'Tosender Donner',
      },
      'replaceText': {
        'Left Roll': 'Linke Seite',
        'Right Roll': 'Rechte Seite',
        'west--': 'Westen--',
        '--east': '--Osten',
        '\\(cast\\)': '(wirken)',
        '\\(clone\\)': '(klon)',
        '\\(damage\\)': '(schaden)',
        'Bewitching Flight': 'Hexenflug',
        'Burst': 'Explosion',
        'Fivefold Blast': 'Fünffache Kanone',
        'Fourfold Blast': 'Vierfache Kanone',
        'Shadows\' Sabbath': 'Hexensabbat',
        'Sidewise Spark': 'Seitlicher Funken',
        'Soaring Soulpress': 'Fliegende Seelenpresse',
        'Stampeding Thunder': 'Stampfender Kanonenschlag',
        'Threefold Blast': 'Dreifache Kanone',
        'Thunderslam': 'Donnerknall',
        'Thunderstorm': 'Gewitter',
        'Wicked Bolt': 'Tosender Blitz',
        'Wicked Cannon': 'Tosende Kanone',
        'Wicked Hypercannon': 'Tosende Hyperkanone',
        'Wicked Jolt': 'Tosender Stoß',
        'Witch Hunt': 'Hexenjagd',
        'Wrath of Zeus': 'Zorn des Zeus',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Wicked Replica': 'Copie de Wicked Thunder',
        'Wicked Thunder': 'Wicked Thunder',
      },
      'replaceText': {
        'Left Roll': 'Rouleau gauche',
        'Right Roll': 'Rouleau droite',
        'west--': 'Est--',
        '--east': '--Ouest',
        '\\(cast\\)': '(Incantation)',
        '\\(clone\\)': '(Clone)',
        '\\(damage\\)': '(Dommage)',
        'Bewitching Flight': 'Vol enchanteur',
        'Burst': 'Explosion',
        'Fivefold Blast': 'Penta-canon',
        'Fourfold Blast': 'Tétra-canon',
        'Shadows\' Sabbath': 'Diablerie obscure',
        'Sidewise Spark': 'Éclair latéral',
        'Soaring Soulpress': 'Compression céleste',
        'Stampeding Thunder': 'Tonnerre déferlant',
        'Threefold Blast': 'Canon triple',
        'Thunderslam': 'Frappe foudroyante',
        'Thunderstorm': 'Tempête de foudre',
        'Wicked Bolt': 'Fulguration vicieuse',
        'Wicked Cannon': 'Canon vicieux',
        'Wicked Hypercannon': 'Hypercanon vicieux',
        'Wicked Jolt': 'Électrochoc vicieux',
        'Witch Hunt': 'Piqué fulgurant',
        'Wrath of Zeus': 'Colère de Zeus',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Wicked Replica': 'ウィケッドサンダーの幻影',
        'Wicked Thunder': 'ウィケッドサンダー',
      },
      'replaceText': {
        'west--': '西--',
        '--east': '--東',
        '\\(cast\\)': '(詠唱)',
        '\\(clone\\)': '(分身)',
        '\\(damage\\)': '(ダメージ)',
        'Bewitching Flight': 'フライングウィッチ',
        'Burst': '爆発',
        'Fivefold Blast': 'クインティカノン',
        'Fourfold Blast': 'クアドラカノン',
        'Right Roll': 'ライトロール',
        'Left Roll': 'レフトロール',
        'Shadows\' Sabbath': 'ブラックサバト',
        'Sidewise Spark': 'サイドスパーク',
        'Soaring Soulpress': 'フライング・ソウルプレス',
        'Stampeding Thunder': 'カノンスタンピード',
        'Threefold Blast': 'トリプルカノン',
        'Thunderslam': 'サンダースラム',
        'Thunderstorm': 'サンダーストーム',
        'Wicked Bolt': 'ウィケッドボルト',
        'Wicked Cannon': 'ウィケッドカノン',
        'Wicked Hypercannon': 'ウィケッドハイパーカノン',
        'Wicked Jolt': 'ウィケッドジョルト',
        'Witch Hunt': 'ウィッチハント',
        'Wrath of Zeus': 'ラス・オブ・ゼウス',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Wicked Replica': '狡雷的幻影',
        'Wicked Thunder': '狡雷',
      },
      'replaceText': {
        'Left Roll': '左列',
        'Right Roll': '右列',
        'west--': '西--',
        '--east': '--东',
        '\\(cast\\)': '(咏唱)',
        '\\(clone\\)': '(幻影)',
        '\\(damage\\)': '(伤害)',
        'Bewitching Flight': '魔女回翔',
        'Burst': '爆炸',
        'Fivefold Blast': '五重加农炮',
        'Fourfold Blast': '四重加农炮',
        'Shadows\' Sabbath': '黑色安息日',
        'Sidewise Spark': '侧方电火花',
        'Soaring Soulpress': '碎魂跃',
        'Stampeding Thunder': '奔雷炮',
        'Threefold Blast': '三重加农炮',
        'Thunderslam': '雷炸',
        'Thunderstorm': '雷暴',
        'Wicked Bolt': '狡诡落雷',
        'Wicked Cannon': '狡诡加农炮',
        'Wicked Hypercannon': '狡诡聚能加农炮',
        'Wicked Jolt': '狡诡摇荡',
        'Witch Hunt': '猎杀女巫',
        'Wrath of Zeus': '宙斯之怒',
      },
    },
  ],
};

export default triggerSet;
