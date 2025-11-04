import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 11-20

type FootDirId = keyof typeof footDirs;

const footDirs = {
  '395': 'dirNE',
  '396': 'dirNW',
  '397': 'dirSE',
  '398': 'dirSW',
} as const;

const isFootDirId = (id: string): id is FootDirId => {
  return id in footDirs;
};

export interface Data extends RaidbossData {
  footOrder?: string[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones11_20',
  zoneId: ZoneId.PilgrimsTraverseStones11_20,

  triggers: [
    // ---------------- Stone 11-19 Mobs ----------------
    // intentionally blank
    // ---------------- Stone 20 Boss: Forgiven Emulation ----------------
    {
      id: 'PT 11-20 Forgiven Emulation Touchdown',
      // boss always faces north during this mechanic
      // 395 = front left foot
      // 396 = front right foot
      // 397 = back left foot
      // 398 = back right foot
      type: 'GainsEffect',
      netRegex: { effectId: '808', target: 'Forgiven Emulation', capture: true },
      infoText: (data, matches, output) => {
        const count = matches.count;
        (data.footOrder ??= []).push(count);

        if (data.footOrder.length < 4)
          return;

        const foot1 = data.footOrder[0];
        const foot4 = data.footOrder[3];

        if (foot1 === undefined || foot4 === undefined)
          return output.text!({
            knockback: output.knockback!(),
            dir1: output.unknown!(),
            dir4: output.unknown!(),
          });

        if (!isFootDirId(foot1) || !isFootDirId(foot4))
          throw new UnreachableCode();

        return output.text!({
          knockback: output.knockback!(),
          dir1: output[footDirs[foot1]]!(),
          dir4: output[footDirs[foot4]]!(),
        });
      },
      outputStrings: {
        text: {
          en: '${knockback} ${dir4} => ${dir1}',
          cn: '${knockback} ${dir4} => ${dir1}',
        },
        knockback: Outputs.knockback,
        unknown: Outputs.unknown,
        ...Directions.outputStrings8Dir,
      },
    },
    {
      id: 'PT 11-20 Forgiven Emulation Touchdown Cleanup',
      type: 'Ability',
      netRegex: { id: 'A9BF', source: 'Forgiven Emulation', capture: false },
      run: (data) => {
        delete data.footOrder;
      },
    },
    {
      id: 'PT 11-20 Forgiven Emulation Bare Root Planting',
      type: 'HeadMarker',
      netRegex: { id: '0017', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Seed on YOU',
          cn: '种子点名',
        },
      },
    },
  ],
};

export default triggerSet;
