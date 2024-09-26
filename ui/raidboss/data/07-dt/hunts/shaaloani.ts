import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type ForcedMarch = 'forward' | 'backward' | 'left' | 'right';
const effectIdToForcedMarchDir: { [id: string]: ForcedMarch } = {
  871: 'forward', // Forward March
  872: 'backward', // About Face
  873: 'left', // Left Face
  874: 'right', // Right Face
};

// For Yehehe's directional debuffs and attacks, use 0-3 for relative direction
// e.g. 0=front, 1=right, 2=back, 3=left
// Then use that array index to map to the safe dir for that cleave:
const yeheheCleaveToSafe = ['back', 'left', 'front', 'right'] as const;
type YeheheDir = typeof yeheheCleaveToSafe[number] | 'unknown';

const yeheheOutputStrings = {
  front: Outputs.front,
  back: Outputs.back,
  right: Outputs.right,
  left: Outputs.left,
  unknown: Outputs.unknown,
  next: Outputs.next,
} as const;

//     SOUTH
// -------------
// OFL OF- OFR |Outer
// IFL IF- IFR |Inner
// IBL IB- IBR |Inner
// OBL OB- OBR |Outer
//   OF  IF  IB  OB
//   L-R L-R L-R L-R
// 0b000_000_000_000
enum TtokSafeSpots {
  None = 0,
  Left = 0b100_100_100_100,
  Right = 0b001_001_001_001,
  // ------------------
  In = 0b000_111_111_000,
  Out = 0b111_000_000_111,
  Front = 0b111_111_000_000,
  Back = 0b00_000_111_111,
  FR_BL = 0b001_001_100_100,
  FL_BR = 0b100_100_001_001,
  InRight = TtokSafeSpots.In & TtokSafeSpots.Right,
  InLeft = TtokSafeSpots.In & TtokSafeSpots.Left,
}

const ttokrroneTempestSandspoutOutputStrings = {
  unknown: Outputs.unknown,
  in: Outputs.getUnder,
  out: Outputs.outOfMelee,
  outOfHitbox: {
    en: 'out of hitbox',
  },
  right: Outputs.right,
  left: Outputs.left,
  back: Outputs.back,
  front: Outputs.front,
  rear: {
    en: 'rear',
  },
  rightFlank: {
    en: 'right flank',
  },
  leftFlank: {
    en: 'left flank',
  },
  triple: {
    en: '${inOut} and ${dir2} ${dir3}',
  },
  double: {
    en: '${inOut} and ${dir2}',
  },
  awayFrom: {
    en: '${out} + avoid ${dir}',
  },
} as const;

type Point = { x: number; y: number };
type TtokrroneDodge = 'in' | 'out' | 'right' | 'left' | 'front' | 'back' | 'unknown';
const ttokrroneDesertTempest: { [id: string]: TtokSafeSpots } = {
  '91D3': TtokSafeSpots.Out,
  '91D4': TtokSafeSpots.In,
  '91D5': TtokSafeSpots.InRight,
  '91D6': TtokSafeSpots.InLeft,
};
const ttokrroneDesertTempestIds = Object.keys(ttokrroneDesertTempest);

const ttokrroneDustdevilOutputStrings = {
  outOfHitbox: {
    en: 'Out of hitbox + stay out',
  },
  rotateFront: {
    en: 'Rotating frontal cleave', // ${dir}'
  },
  rotateRear: {
    en: 'Rotating rear cleave', // ${dir}'
  },
} as const;

const identifyOrbSafeSpots = (pattern: Point[]) => {
  // Each time Ttokrrone summons sand orbs either 7 or 8 are spawned in 4 patterns.
  // (these are relative to where the boss faces, which is south)
  // 7 covering all rel. north
  // 7 covering all rel. south
  // 8 covering the rel. NE and SW quadrants with some overlap in the middle
  // 8 covering the rel. NW and SE quadrants with some overlap in the middle
  // since each pattern is composed of a quadrant of AOEs we can check for any orbs in each quadrant
  // (centered around the arena center) and then check the final result to determine the pattern.
  const detected: boolean[] = [false, false, false, false]; // TL, TR, BL, BR
  for (const point of pattern) {
    const xGt = point.x > 53.0;
    const yGt = point.y > -825.0;
    detected[0] = !detected[0] ? !xGt && !yGt : detected[0];
    detected[1] = !detected[1] ? xGt && !yGt : detected[1];
    detected[2] = !detected[2] ? !xGt && yGt : detected[2];
    detected[3] = !detected[3] ? xGt && yGt : detected[3];
  }
  // Returns the SAFE SPOTS so opposite of what is detected
  if (detected[0] && detected[1]) {
    // AOEs all bottom
    return TtokSafeSpots.Front;
  }
  if (detected[2] && detected[3]) {
    // AOEs all top
    return TtokSafeSpots.Back;
  }
  if (detected[0] && detected[3]) {
    // AOEs are front left, back right
    return TtokSafeSpots.FR_BL;
  }
  if (detected[1] && detected[2]) {
    // AOEs are front right, back left
    return TtokSafeSpots.FL_BR;
  }
  console.error('sand sphere pattern not recognized');
  return TtokSafeSpots.None;
};

export interface Data extends RaidbossData {
  yeheheTurnBuffs: number[];
  yeheheSecondSafeDir?: YeheheDir;
  ttokSandOrbs: Point[];
  ttokSandOrbPatterns: TtokSafeSpots[];
  ttokSandOrbsLastSeenTimestamp: number;
  ttokSandOrbSets: number;
  ttokSandOrbOnSet: number;
  ttokRotated: number;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Shaaloani',
  zoneId: ZoneId.Shaaloani,
  initData: () => ({
    yeheheTurnBuffs: [],
    ttokSandOrbs: [],
    ttokSandOrbPatterns: [],
    ttokSandOrbsLastSeenTimestamp: -1,
    ttokSandOrbSets: 0,
    ttokSandOrbOnSet: 0,
    ttokRotated: 0,
  }),
  triggers: [
    // ****** A-RANK: Keheniheyamewi ****** //
    {
      id: 'Hunt Keheni Scatterscourge',
      type: 'StartsUsing',
      netRegex: { id: '9B7F', source: 'Keheniheyamewi', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Hunt Keheni Body Press',
      type: 'StartsUsing',
      // Unclear why there are two ids for this, but both are used.
      netRegex: { id: ['9C7F', '96FB'], source: 'Keheniheyamewi', capture: false },
      response: Responses.outOfMelee('alert'),
    },
    {
      id: 'Hunt Keheni Slippery Scatterscourge',
      type: 'StartsUsing',
      netRegex: { id: '96F8', source: 'Keheniheyamewi', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow dash (in after)',
          de: 'Folge dem Ansturm (danach Rein)',
          fr: 'Suivez la ruée (intérieur ensuite)',
          cn: '跟随冲锋',
          ko: '돌진 따라가기 (그리고 안으로)',
        },
      },
    },
    // Note: Because Forced March overlaps with two abilities that already have triggers,
    // and because it applies right before the second resolves, it gets messy to combine
    // the callouts. This would really benefit from a countdown on the Forced March info trigger.
    {
      id: 'Hunt Keheni Forced March Early',
      type: 'GainsEffect',
      netRegex: { effectId: Object.keys(effectIdToForcedMarchDir), source: 'Keheniheyamewi' },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        const dir = effectIdToForcedMarchDir[matches.effectId];
        if (dir !== undefined)
          return output[dir]!();
      },
      outputStrings: {
        forward: {
          en: 'Forced March: Forward (later)',
          de: 'Geistlenkung: vorwärts (später)',
          fr: 'Marche forcée : Avant (après)',
          cn: '(稍后 强制移动: 前)',
          ko: '강제이동: 앞 (나중에)',
        },
        backward: {
          en: 'Forced March: Backward (later)',
          de: 'Geistlenkung: rückwärts (später)',
          fr: 'Marche forcée : Arrière (après)',
          cn: '(稍后 强制移动: 后)',
          ko: '강제이동: 뒤 (나중에)',
        },
        left: {
          en: 'Forced March: Left (later)',
          de: 'Geistlenkung: links (später)',
          fr: 'Marche forcée : Gauche (après)',
          cn: '(稍后 强制移动: 左)',
          ko: '강제이동: 왼쪽 (나중에)',
        },
        right: {
          en: 'Forced March: Right (later)',
          de: 'Geistlenkung: rechts (später)',
          fr: 'Marche forcée : Droite (après)',
          cn: '(稍后 强制移动: 右)',
          ko: '강제이동: 오른쪽 (나중에)',
        },
      },
    },
    {
      id: 'Hunt Keheni Forced March Now',
      type: 'GainsEffect',
      netRegex: { effectId: Object.keys(effectIdToForcedMarchDir), source: 'Keheniheyamewi' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 4,
      infoText: (_data, matches, output) => {
        const dir = effectIdToForcedMarchDir[matches.effectId];
        if (dir !== undefined)
          return output[dir]!();
      },
      outputStrings: {
        forward: {
          en: 'Forced March: Forward',
          de: 'Geistlenkung: vorwärts',
          fr: 'Marche forcée : Avant',
          cn: '强制移动: 前',
          ko: '강제이동: 앞',
        },
        backward: {
          en: 'Forced March: Backward',
          de: 'Geistlenkung: rückwärts',
          fr: 'Marche forcée : Arrière',
          cn: '强制移动: 后',
          ko: '강제이동: 뒤',
        },
        left: {
          en: 'Forced March: Left',
          de: 'Geistlenkung: links',
          fr: 'Marche forcée : Gauche',
          cn: '强制移动: 左',
          ko: '강제이동: 왼쪽',
        },
        right: {
          en: 'Forced March: Right',
          de: 'Geistlenkung: rechts',
          fr: 'Marche forcée : Droite',
          cn: '强制移动: 右',
          ko: '강제이동: 오른쪽',
        },
      },
    },
    {
      id: 'Hunt Keheni Malignant Mucus',
      type: 'StartsUsing',
      netRegex: { id: '96FD', source: 'Keheniheyamewi' },
      condition: (data) => data.CanSilence(),
      response: Responses.interrupt(),
    },

    // ****** A-RANK: Yehehetoaua'pyo ****** //

    // There are a bunch of ability ids that correspond to Whirling Omen.
    // Most just apply Left/Right Windup buffs, but there is one that doesn't apply buffs
    // and instead does a raidwide.
    {
      id: 'Hunt Yehehe Whirling Omen',
      type: 'StartsUsing',
      netRegex: { id: '9BC6', source: 'Yehehetoaua\'pyo', capture: false },
      response: Responses.aoe(),
    },
    // Collect and push the Left/Right Windup buffs, and let each trigger that consumes one
    // shift the array.  We have to do it this way because Whirling Omen can apply multiple
    // Windup buffs, and each of Yehehe's casts only consume one.
    {
      id: 'Hunt Yehehe Left Windup Collect',
      type: 'GainsEffect',
      netRegex: { effectId: ['FBD', 'FBF'], target: 'Yehehetoaua\'pyo', capture: false },
      run: (data) => data.yeheheTurnBuffs.push(3), // 3 = left turn
    },
    {
      id: 'Hunt Yehehe Right Windup Collect',
      type: 'GainsEffect',
      netRegex: { effectId: ['FBE', 'FC0'], target: 'Yehehetoaua\'pyo', capture: false },
      run: (data) => data.yeheheTurnBuffs.push(1), // 1 = right turn
    },
    {
      id: 'Hunt Yehehe Pteraspit to Turntail',
      type: 'StartsUsing',
      netRegex: { id: '96E8', source: 'Yehehetoaua\'pyo', capture: false },
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        const safeDirs: YeheheDir[] = [];

        const firstDir = yeheheCleaveToSafe[0]; // front cleave
        if (firstDir === undefined)
          return output.unknown!();
        safeDirs.push(firstDir);

        let secondDir: YeheheDir = 'unknown';
        const turn = data.yeheheTurnBuffs.shift();
        if (turn !== undefined) {
          const calcDir = (turn + 2) % 4; // 2 = back cleave
          secondDir = yeheheCleaveToSafe[calcDir] ?? 'unknown';
          data.yeheheSecondSafeDir = secondDir;
        }
        safeDirs.push(secondDir);

        return safeDirs.map((dir) => output[dir]!()).join(output.next!());
      },
      outputStrings: yeheheOutputStrings,
    },
    {
      id: 'Hunt Yehehe Turntail to Pteraspit',
      type: 'StartsUsing',
      netRegex: { id: '96EB', source: 'Yehehetoaua\'pyo', capture: false },
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        const turn = data.yeheheTurnBuffs.shift();
        if (turn === undefined)
          return output.unknown!();

        const safeDirs: YeheheDir[] = [];

        const calcDir = (turn + 2) % 4; // 2 = back cleave
        const firstDir = yeheheCleaveToSafe[calcDir] ?? 'unknown';
        safeDirs.push(firstDir);

        const secondCalcDir = (calcDir + 2) % 4; // 2 = front cleave relative to prior back cleave
        const secondDir = yeheheCleaveToSafe[secondCalcDir] ?? 'unknown';
        data.yeheheSecondSafeDir = secondDir;
        safeDirs.push(secondDir);

        return safeDirs.map((dir) => output[dir]!()).join(output.next!());
      },
      outputStrings: yeheheOutputStrings,
    },
    {
      id: 'Hunt Yehehe Dactail to Turnspit',
      type: 'StartsUsing',
      netRegex: { id: '96E9', source: 'Yehehetoaua\'pyo', capture: false },
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        const safeDirs: YeheheDir[] = [];

        const firstDir = yeheheCleaveToSafe[2]; // back cleave
        if (firstDir === undefined)
          return output.unknown!();
        safeDirs.push(firstDir);

        let secondDir: YeheheDir = 'unknown';
        const turn = data.yeheheTurnBuffs.shift();
        if (turn !== undefined) {
          secondDir = yeheheCleaveToSafe[turn] ?? 'unknown'; // turn = direction of spit cleave
          data.yeheheSecondSafeDir = secondDir;
        }
        safeDirs.push(secondDir);

        return safeDirs.map((dir) => output[dir]!()).join(output.next!());
      },
      outputStrings: yeheheOutputStrings,
    },
    {
      id: 'Hunt Yehehe Turnspit to Dactail',
      type: 'StartsUsing',
      netRegex: { id: '96EA', source: 'Yehehetoaua\'pyo', capture: false },
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        const turn = data.yeheheTurnBuffs.shift();
        if (turn === undefined)
          return output.unknown!();

        const safeDirs: YeheheDir[] = [];

        const firstDir = yeheheCleaveToSafe[turn] ?? 'unknown';
        safeDirs.push(firstDir);

        const secondCalcDir = (turn + 2) % 4; // 2 = back cleave relative to prior front cleave
        const secondDir = yeheheCleaveToSafe[secondCalcDir] ?? 'unknown';
        data.yeheheSecondSafeDir = secondDir;
        safeDirs.push(secondDir);

        return safeDirs.map((dir) => output[dir]!()).join(output.next!());
      },
      outputStrings: yeheheOutputStrings,
    },
    {
      id: 'Hunt Yehehe Spit-Tail Followup',
      type: 'Ability',
      netRegex: {
        id: ['96E8', '96E9', '96EA', '96EB'],
        source: 'Yehehetoaua\'pyo',
        capture: false,
      },
      delaySeconds: 1,
      alertText: (data, _matches, output) => {
        const safeDir = data.yeheheSecondSafeDir;
        if (safeDir !== undefined && safeDir !== 'unknown')
          return output[safeDir]!();
      },
      outputStrings: yeheheOutputStrings,
    },

    // ****** S-RANK: Sansheya ****** //
    {
      id: 'Hunt Sansheya Veil of Heat',
      type: 'StartsUsing',
      netRegex: { id: '9973', source: 'Sansheya', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Sansheya Halo of Heat',
      type: 'StartsUsing',
      netRegex: { id: '9974', source: 'Sansheya', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Hunt Sansheya Fire\'s Domain',
      type: 'StartsUsing',
      netRegex: { id: '9975', source: 'Sansheya', capture: false },
      infoText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid Tethered Cleave',
          de: 'Vermeide Verbundene-Kegelangriff',
          fr: 'Évitez le cleave du lien',
          cn: '躲避连线冲锋',
          ko: '직선 장판 피하기',
        },
      },
    },
    {
      id: 'Hunt Sansheya Twinscorch Left',
      type: 'StartsUsing',
      netRegex: { id: '9AB1', source: 'Sansheya', capture: false },
      durationSeconds: 6.7,
      response: Responses.goRightThenLeft('alert'),
    },
    {
      id: 'Hunt Sansheya Twinscorch Right',
      type: 'StartsUsing',
      netRegex: { id: '9AB2', source: 'Sansheya', capture: false },
      durationSeconds: 6.7,
      response: Responses.goLeftThenRight('alert'),
    },
    {
      id: 'Hunt Sansheya Captive Bolt',
      type: 'StartsUsing',
      netRegex: { id: '9980', source: 'Sansheya' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Hunt Sansheya Culling Blade',
      type: 'StartsUsing',
      netRegex: { id: '997F', source: 'Sansheya', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Sansheya Pyre of Rebirth',
      type: 'GainsEffect',
      // 102C: Boiling (18s) - applies 3s Pyretic debuff on expiration
      netRegex: { effectId: '102C', source: 'Sansheya' },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 3,
      durationSeconds: 6,
      response: Responses.stopMoving(),
    },
    {
      id: 'Hunt Sansheya Twinscorched Halo Left',
      type: 'StartsUsing',
      netRegex: { id: '9979', source: 'Sansheya', capture: false },
      durationSeconds: 7.3,
      alertText: (_data, _matches, output) => output.haloLeft!(),
      outputStrings: {
        haloLeft: {
          en: 'Right => Left + In',
          de: 'Rechts => Links + Rein',
          fr: 'Droite => Gauche + Intérieur',
          cn: '右 => 左 + 内',
          ko: '오른쪽 => 왼쪽 + 안',
        },
      },
    },
    {
      id: 'Hunt Sansheya Twinscorched Halo Right',
      type: 'StartsUsing',
      netRegex: { id: '997B', source: 'Sansheya', capture: false },
      durationSeconds: 7.3,
      alertText: (_data, _matches, output) => output.haloRight!(),
      outputStrings: {
        haloRight: {
          en: 'Left => Right + In',
          de: 'Links => Rechts + Rein',
          fr: 'Gauche => Droite + Intérieur',
          cn: '左 => 右 + 内',
          ko: '왼쪽 => 오른쪽 + 안',
        },
      },
    },
    {
      id: 'Hunt Sansheya Twinscorched Veil Left',
      type: 'StartsUsing',
      netRegex: { id: '997A', source: 'Sansheya', capture: false },
      durationSeconds: 7.3,
      alertText: (_data, _matches, output) => output.veilLeft!(),
      outputStrings: {
        veilLeft: {
          en: 'Right => Left + Out',
          de: 'Rechts => Links + Raus',
          fr: 'Droite => Gauche + Extérieur',
          cn: '右 => 左 + 外',
          ko: '오른쪽 => 왼쪽 + 바깥',
        },
      },
    },
    {
      id: 'Hunt Sansheya Twinscorched Veil Right',
      type: 'StartsUsing',
      netRegex: { id: '997C', source: 'Sansheya', capture: false },
      durationSeconds: 7.3,
      alertText: (_data, _matches, output) => output.veilRight!(),
      outputStrings: {
        veilRight: {
          en: 'Left => Right + Out',
          de: 'Links => Rechts + Raus',
          fr: 'Gauche => Droite + Extérieur',
          cn: '左 => 右 + 外',
          ko: '왼쪽 => 오른쪽 + 바깥',
        },
      },
    },
    // ****** Boss Fate: Ttokrrone ****** //
    // Casts fang/right/left/tail-ward sandspout then turns that way to cleave.
    // This unfortunately rotates the boss if there happens to be a Tempest after...
    {
      id: 'Hunt Ttokrrone Sandspout',
      type: 'StartsUsing',
      netRegex: { id: ['91C1', '91C2', '91C3', '91C4'], source: 'Ttokrrone', capture: true },
      durationSeconds: 4.9,
      response: (data, matches, output) => {
        const pattern = data.ttokSandOrbPatterns[data.ttokSandOrbOnSet];
        let sandspoutPattern = TtokSafeSpots.Out;
        let awaySide = 'front';
        let rotation = 0;
        let dir1: TtokrroneDodge = 'unknown';
        let dir2: TtokrroneDodge = 'unknown';
        // cactbot-builtin-response
        output.responseOutputStrings = ttokrroneTempestSandspoutOutputStrings;

        if (matches.id === '91C1') { // front cleave
          sandspoutPattern = 0b101_000_000_111; // except in front
          awaySide = output.front!();
          rotation = 0;
        } else if (matches.id === '91C2') { // back cleave
          sandspoutPattern = 0b111_000_000_101; // except behind
          awaySide = output.rear!();
          rotation = 2;
        } else if (matches.id === '91C3') { // right cleave
          awaySide = output.rightFlank!();
          rotation = 1;
        } else if (matches.id === '91C4') { // left cleave
          awaySide = output.leftFlank!();
          rotation = 3;
        }

        if (pattern) {
          const safeSpot = sandspoutPattern & pattern;
          let backFrontSpot: TtokSafeSpots = 0b111_111_111_111;
          if (safeSpot & TtokSafeSpots.Back) {
            backFrontSpot = TtokSafeSpots.Back;
            dir1 = 'back';
          } else if (safeSpot & TtokSafeSpots.Front) {
            backFrontSpot = TtokSafeSpots.Front;
            dir1 = 'front';
          }

          if (safeSpot & backFrontSpot & TtokSafeSpots.Right) {
            dir2 = 'right';
          } else if (safeSpot & backFrontSpot & TtokSafeSpots.Left) {
            dir2 = 'left';
          }
          data.ttokSandOrbOnSet++;
          data.ttokRotated = rotation;
          return {
            alertText: output.triple!({
              inOut: output.outOfHitbox!(),
              dir2: output[dir1]!(),
              dir3: output[dir2]!(),
            }),
          };
        }
        return {
          infoText: output.awayFrom!({ out: output.outOfHitbox!(), dir: awaySide }),
        };
      },
    },
    // The boss does either in; out; in-right + out-left; or out-right + in-left
    // can be combined with sand orbs explosions.
    {
      id: 'Hunt Ttokrrone Desert Tempest',
      type: 'StartsUsing',
      netRegex: { id: ttokrroneDesertTempestIds, source: 'Ttokrrone', capture: true },
      durationSeconds: 7,
      alertText: (data, matches, output) => {
        const tempest = ttokrroneDesertTempest[matches.id]!;
        const pattern = data.ttokSandOrbPatterns[data.ttokSandOrbOnSet];
        let inOut: TtokrroneDodge = 'unknown';
        let dir2: TtokrroneDodge | null = null;
        let dir3: TtokrroneDodge | null = null;
        let backFrontSpot: TtokSafeSpots = 0b111_111_111_111;

        if (tempest & TtokSafeSpots.In) {
          inOut = 'in';
        } else if (tempest & TtokSafeSpots.Out) {
          inOut = 'out';
        }
        if (tempest === TtokSafeSpots.InRight) {
          dir2 = 'right';
        } else if (tempest === TtokSafeSpots.InLeft) {
          dir2 = 'left';
        }

        if (pattern && data.ttokRotated === 0) {
          const safeSpot = tempest & pattern;

          if (safeSpot & TtokSafeSpots.Back) {
            backFrontSpot = TtokSafeSpots.Back;
            dir3 = 'back';
          } else if (safeSpot & TtokSafeSpots.Front) {
            backFrontSpot = TtokSafeSpots.Front;
            dir3 = 'front';
          }
          // if the tempest was only in or out, but the sand pattern needs right or left
          if (!dir2 && !(safeSpot & 0b010_010_010_010)) {
            // we also need to check the other selected direction (front/back)
            if (safeSpot & backFrontSpot & TtokSafeSpots.Right) {
              dir2 = 'right';
            } else if (safeSpot & backFrontSpot & TtokSafeSpots.Left) {
              dir2 = 'left';
            }
          }
          // swap in case dir2 is null, and its more natural phrasing
          [dir2, dir3] = [dir3, dir2];
          data.ttokSandOrbOnSet++;
        }
        if (dir2 && dir3) {
          return output.triple!({
            inOut: output[inOut]!(),
            dir2: output[dir2]!(), // front or back
            dir3: output[dir3]!(), // right or left
          });
        }
        if (dir2) {
          return output.double!({ inOut: output[inOut]!(), dir2: output[dir2]!() });
        }
        return output[inOut]!();
      },
      outputStrings: ttokrroneTempestSandspoutOutputStrings,
    },
    // Aoe
    {
      id: 'Hunt Ttokrrone Touchdown',
      type: 'StartsUsing',
      netRegex: { id: '91DB', source: 'Ttokrrone', capture: false },
      durationSeconds: 4,
      response: Responses.aoe(),
      run: (data) => {
        // Reset everything as orb sequences start with a touchdown.
        data.ttokSandOrbSets = 0;
        data.ttokSandOrbOnSet = 0;
        data.ttokSandOrbs = [];
        data.ttokSandOrbPatterns = [];
        data.ttokRotated = 0;
      },
    },
    // Front cleave, rotates C or CCW and cleaves 4 or 7 times (maybe health dependent?)
    {
      id: 'Hunt Ttokrrone Fangward Dustdevil',
      type: 'StartsUsing',
      netRegex: { id: ['91C9', '91C5'], source: 'Ttokrrone', capture: false },
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.outOfHitbox!(),
      infoText: (_data, _matches, output) => {
        return output.rotateFront!();
      },
      outputStrings: ttokrroneDustdevilOutputStrings,
    },
    // Rear cleave (boss turns to do front cleaves) then rotates C or CCW and cleaves 4 or 7 times (?)
    {
      id: 'Hunt Ttokrrone Tailward Dustdevil',
      type: 'StartsUsing',
      netRegex: { id: ['91CA', '91C6'], source: 'Ttokrrone', capture: false },
      durationSeconds: 6,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.outOfHitbox!(),
      infoText: (_data, _matches, output) => {
        return output.rotateRear!();
      },
      outputStrings: ttokrroneDustdevilOutputStrings,
    },
    // Dashes around 6 times
    {
      id: 'Hunt Ttokrrone Landswallow',
      type: 'StartsUsing',
      netRegex: { id: '96F2', source: 'Ttokrrone', capture: false },
      durationSeconds: 15,
      infoText: (_data, _matches, output) => output.dodgeToRight!(),
      outputStrings: {
        dodgeToRight: {
          en: 'Go to safe side of first dash => move in after',
        },
      },
    },
    // The sand spheres cast "Sandburst" to explode. 994E is 2 seconds shorter cast (5.7s)
    {
      id: 'Hunt Ttokrrone Sand Spheres Sandburst',
      type: 'StartsUsing',
      netRegex: { id: ['994D', '994E'], source: 'Sand Sphere', capture: true },
      delaySeconds: (_data, matches) => matches.id === '994E' ? 0 : 2,
      durationSeconds: 5,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.avoidSpheres!(),
      outputStrings: {
        avoidSpheres: {
          en: 'Avoid exploding sand spheres',
        },
      },
    },
    // Orbs summon themselves with "Summoning Sands", is also a smallish ground AOE
    {
      id: 'Hunt Ttokrrone Sand Spheres Summon Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: '96F7', capture: true },
      run: (data, matches) => {
        const tsNow = Date.parse(matches.timestamp);
        const enoughOrbs = data.ttokSandOrbs.length >= 6;

        if (enoughOrbs && Math.abs(tsNow - data.ttokSandOrbsLastSeenTimestamp) >= 1000) {
          // orb sets all spawn at once, if time is not within a second this is the next set.
          data.ttokSandOrbSets++;
          data.ttokSandOrbs = [{ x: parseFloat(matches.x), y: parseFloat(matches.y) }];
        } else {
          if (
            enoughOrbs &&
            data.ttokSandOrbPatterns[data.ttokSandOrbSets] === undefined
          ) {
            data.ttokSandOrbPatterns[data.ttokSandOrbSets] = identifyOrbSafeSpots(
              data.ttokSandOrbs,
            );
          } else if (!enoughOrbs) {
            data.ttokSandOrbs.push({ x: parseFloat(matches.x), y: parseFloat(matches.y) });
          }
        }

        data.ttokSandOrbsLastSeenTimestamp = tsNow;
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Keheniheyamewi': 'Keheniheyamewi',
        'Yehehetoaua\'pyo': 'Yehehetoaua\'pyo',
        'Sansheya': 'Sansheya',
        'Ttokrrone': 'Ttokrrone',
        'Sand Sphere': 'Sandwirbel',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Keheniheyamewi': 'Keheniheyamewi',
        'Yehehetoaua\'pyo': 'Yehehetoaua\'pyo',
        'Sansheya': 'Sansheya',
        'Ttokrrone': 'Ttokrrone',
        'Sand Sphere': 'Sphère de Sable',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Keheniheyamewi': 'ケヘニヘヤメウィ',
        'Yehehetoaua\'pyo': 'エヘヘトーワポ',
        'Sansheya': 'サンシェヤ',
        'Ttokrrone': 'トクローネ',
        'Sand Sphere': '砂球',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Keheniheyamewi': '凯海尼海亚麦尤伊',
        'Yehehetoaua\'pyo': '艾海海陶瓦泡',
        'Sansheya': '山谢亚',
      },
    },
  ],
};

export default triggerSet;
