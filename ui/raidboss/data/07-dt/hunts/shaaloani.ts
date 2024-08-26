import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Sansheya (S-Rank)

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

export interface Data extends RaidbossData {
  yeheheTurnBuffs: number[];
  yeheheSecondSafeDir?: YeheheDir;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Shaaloani',
  zoneId: ZoneId.Shaaloani,
  initData: () => ({
    yeheheTurnBuffs: [],
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
        },
        backward: {
          en: 'Forced March: Backward (later)',
        },
        left: {
          en: 'Forced March: Left (later)',
        },
        right: {
          en: 'Forced March: Right (later)',
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
        },
        backward: {
          en: 'Forced March: Backward',
        },
        left: {
          en: 'Forced March: Left',
        },
        right: {
          en: 'Forced March: Right',
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
  ],
  timelineReplace: [],
};

export default triggerSet;
