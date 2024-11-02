import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO:
//  - Better directional callout for Deceiver's Synchroshot + Bionic Thrash?
//  - Directional callout for Ambrose's Psychokinesis + Overwhelming Charge (based on facing dir)?

type HerpeDir = 'cleaveRight' | 'cleaveLeft' | 'cleaveRear';
type HerpeSweepId = typeof herpeSweepIds[number];

const herpeSweepIds = ['8E71', '8E72', '8E73'] as const;
const herpeSweepIdToDir: Record<HerpeSweepId, HerpeDir> = {
  '8E71': 'cleaveRight',
  '8E72': 'cleaveLeft',
  '8E73': 'cleaveRear',
};
const isHerpeSweepId = (id: string): id is HerpeSweepId =>
  herpeSweepIds.includes(id as HerpeSweepId);

type DeceiverTurret = 'farNorth' | 'middleNorth' | 'middleSouth' | 'farSouth';
type TurretSafeTracker = {
  east: DeceiverTurret[];
  west: DeceiverTurret[];
};

const psychoKinesisSafeDirs = ['north', 'middle', 'south'] as const;
type PsychoKinesisDir = typeof psychoKinesisSafeDirs[number];

export interface Data extends RaidbossData {
  herpeSweeps: HerpeDir[];
  seenFirstDroids: boolean;
  nextTurretSide?: 'east' | 'west';
  turretSafe: TurretSafeTracker;
  psychokinesisSafe: PsychoKinesisDir[];
  seenFirstCages: boolean;
  seenFirstPsychokineticCharge: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Origenics',
  zoneId: ZoneId.Origenics,
  timelineFile: 'origenics.txt',
  initData: () => ({
    herpeSweeps: [],
    seenFirstDroids: false,
    turretSafe: { east: [], west: [] },
    psychokinesisSafe: [...psychoKinesisSafeDirs],
    seenFirstCages: false,
    seenFirstPsychokineticCharge: false,
  }),
  triggers: [
    // ** Herpekaris ** //
    {
      id: 'Origenics Herpekaris Strident Shriek',
      type: 'StartsUsing',
      netRegex: { id: '8EA7', source: 'Herpekaris', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Origenics Herpekaris Collective Agony',
      type: 'StartsUsing',
      netRegex: { id: '8E79', source: 'Herpekaris' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Origenics Herpekaris Convulsive Crush',
      type: 'StartsUsing',
      netRegex: { id: '8EA6', source: 'Herpekaris' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Origenics Herpekaris Poison Heart Spread',
      type: 'StartsUsing',
      netRegex: { id: '9421', source: 'Herpekaris' },
      condition: Conditions.targetIsYou(),
      delaySeconds: 3, // castTime is 7.7s
      response: Responses.spread(),
    },
    {
      id: 'Origenics Herpekaris Venomspill Right',
      type: 'StartsUsing',
      // 924B = initial cast (4.7s)
      // 8E66 = follow-up cast (3.7s)
      netRegex: { id: ['924B', '8E66'], source: 'Herpekaris', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'Origenics Herpekaris Venomspill Left',
      type: 'StartsUsing',
      // 8E64 - initial cast (4.7s)
      // 8E65 - follow-up cast (3.7s)
      netRegex: { id: ['8E64', '8E65'], source: 'Herpekaris', capture: false },
      response: Responses.goRight(),
    },
    {
      id: 'Origenics Herpekaris Sweeps Early',
      type: 'Ability',
      netRegex: { id: herpeSweepIds, source: 'Herpekaris' },
      durationSeconds: 7,
      suppressSeconds: 10,
      alertText: (_data, matches, output) => {
        const id = matches.id;
        if (!isHerpeSweepId(id))
          throw new UnreachableCode();

        const cleaveDir = herpeSweepIdToDir[id];

        // Since this is a longer duration and it happens at the beginning of the
        // telegraph sequence, we can be a little more prescriptive and remind the player
        // to avoid the front if it's a left/right cleave.
        if (cleaveDir === 'cleaveRear')
          return output.cleaveRear!();
        return output.avoidFront!({ dir: output[cleaveDir]!() });
      },
      outputStrings: {
        avoidFront: {
          en: '${dir} (Avoid Front)',
          fr: '${dir} (Évitez l\'avant)',
          cn: '${dir} (避开正面)',
          ko: '${dir} (앞 피하기)',
        },
        cleaveRight: Outputs.left,
        cleaveLeft: Outputs.right,
        cleaveRear: Outputs.goFrontOrSides,
      },
    },
    {
      id: 'Origenics Herpekaris Sweeps Followup',
      type: 'Ability',
      netRegex: { id: herpeSweepIds, source: 'Herpekaris', capture: false },
      delaySeconds: 7.1, // time this to replace 'First', as the first cleave snapshots
      durationSeconds: 4.5,
      suppressSeconds: 10,
      alertText: (data, _matches, output) => {
        const second = data.herpeSweeps[1];
        const third = data.herpeSweeps[2];
        if (!second || !third)
          return 'BAD DATA';

        // If `second` or `third` is a rear cleave, display an alert with the next L/R safe dir
        // and a reminder to avoid the rear, since natural player movement will be L->R or R->L anyway.
        // It would be spammy to do a 2sec. duration call to 'avoid rear' followed by the L/R direction.

        if (second === 'cleaveRear')
          return output.avoidRear!({ dir: output[third]!() });
        else if (third === 'cleaveRear')
          return output.avoidRear!({ dir: output[second]!() });
        else if (second === 'cleaveLeft')
          return output.avoidRear!({ dir: output.rightToLeft!() });
        return output.avoidRear!({ dir: output.leftToRight!() });
      },
      outputStrings: {
        avoidRear: {
          en: '${dir} (Avoid Rear)',
          fr: '${dir} (Évitez l\'arrière)',
          cn: '${dir} (避开后方)',
          ko: '${dir} (뒤 피하기)',
        },
        cleaveRight: Outputs.left,
        cleaveLeft: Outputs.right,
        leftToRight: Outputs.leftThenRight,
        rightToLeft: Outputs.rightThenLeft,
      },
    },
    {
      id: 'Origenics Herpekaris Sweeps Sequence',
      type: 'StartsUsing',
      netRegex: { id: herpeSweepIds, source: 'Herpekaris' },
      durationSeconds: 8,
      infoText: (data, matches, output) => {
        const id = matches.id;
        if (!isHerpeSweepId(id))
          throw new UnreachableCode();

        data.herpeSweeps.push(herpeSweepIdToDir[id]);

        if (data.herpeSweeps.length !== 3)
          return;

        const comboStr = data.herpeSweeps.map((d) => output[d]!()).join(output.next!());
        return comboStr;
      },
      outputStrings: {
        cleaveRight: Outputs.left,
        cleaveLeft: Outputs.right,
        cleaveRear: {
          en: 'Avoid Rear',
          fr: 'Évitez l\'arrière',
          cn: '避开后方',
          ko: '뒤 피하기',
        },
        next: Outputs.next,
      },
    },
    // do a separate cleanup trigger to avoid timing issues
    {
      id: 'Origenics Herpekaris Sweeps Cleanup',
      type: 'StartsUsing',
      // 8EA7 = Strident Shriek (happens after Sweeps are finished)
      netRegex: { id: '8EA7', source: 'Herpekaris', capture: false },
      run: (data) => data.herpeSweeps = [],
    },

    // ** Deceiver ** //
    {
      id: 'Origenics Deceiver Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '8E13', source: 'Deceiver', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Origenics Deceiver Bionic Thrash',
      type: 'StartsUsing',
      netRegex: { id: ['8E10', '8E11'], source: 'Deceiver' },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        // 8E10 cleaves front left + back right
        // 8E11 cleaves front right + back left
        const safeDir = matches.id === '8E10' ? 'frontRight' : 'frontLeft';
        const safeStr = output[safeDir]!();

        if (!data.seenFirstDroids)
          return safeStr;
        return output.combo!({ dir: safeStr });
      },
      outputStrings: {
        combo: {
          en: '${dir} + Avoid Droid Cleaves',
          fr: '${dir} + Évitez les cleaves des droids',
          cn: '${dir} + 躲避机器人激光',
          ko: '${dir} + 로봇 레이저 피하기',
        },
        frontLeft: {
          en: 'Back Right / Front Left',
          fr: 'Arrière droite / Avant gauche',
          cn: '右后 / 左前',
          ko: '오른쪽 뒤 / 왼쪽 앞',
        },
        frontRight: {
          en: 'Back Left / Front Right',
          fr: 'Arrière gauche / Avant droit',
          cn: '左后 / 右前',
          ko: '왼쪽 뒤 / 오른쪽 앞',
        },
      },
    },
    {
      id: 'Origenics Deceiver Synchroshot Initial',
      type: 'StartsUsing',
      // Androids use 8E14 (bad) and 8E15 (fake) line cleaves
      netRegex: { id: '8E15', source: 'Origenics Sentry G9', capture: false },
      condition: (data) => !data.seenFirstDroids, // combined with Bionic Thrash in future uses
      suppressSeconds: 2,
      infoText: (_data, _matches, output) => output.avoid!(),
      run: (data) => data.seenFirstDroids = true,
      outputStrings: {
        avoid: {
          en: 'Stand in line with flickering droid',
          fr: 'Restez sur la ligne du droide clignotant',
          cn: '站在闪烁机器人列',
          ko: '빛나는 로봇이 있는 줄에 서기',
        },
      },
    },

    {
      id: 'Origenics Deceiver Fake Turret Collect',
      type: 'StartsUsingExtra', // 0x14 lines may have stale position data
      // Turrents use 830D (no animation - real) or 8E4A (flickering)
      netRegex: { id: '8E4A' },
      run: (data, matches) => {
        // center is [x: -172, y: -142]
        data.nextTurretSide = parseFloat(matches.x) < -172 ? 'west' : 'east';

        // y values are -157 (N), -147, -137, -127 (S)
        const y = Math.round(parseFloat(matches.y));
        let turretPos: DeceiverTurret;
        if (y < -155)
          turretPos = 'farNorth';
        else if (y < -145)
          turretPos = 'middleNorth';
        else if (y < -135)
          turretPos = 'middleSouth';
        else
          turretPos = 'farSouth';
        data.turretSafe[data.nextTurretSide].push(turretPos);
      },
    },
    {
      id: 'Origenics Deceiver Laser Lash',
      type: 'Ability',
      netRegex: { id: '8E4A', source: 'Deceiver', capture: false },
      suppressSeconds: 2,
      alertText: (data, _matches, output) => {
        const side = data.nextTurretSide;
        if (!side)
          return output.avoid!();

        const [safe0, safe1] = data.turretSafe[side];
        if (data.turretSafe[side].length !== 2 || !safe0 || !safe1)
          return output.avoid!();

        const middleLanes = ['middleNorth', 'middleSouth'];

        // prioritize middle lanes for callouts as boss is center
        if (middleLanes.includes(safe0)) {
          if (middleLanes.includes(safe1)) // both middle lanes safe
            return output.middleLanes!({ side: output[side]!() });
          return output[safe0]!({ side: output[side]!() });
        } else if (middleLanes.includes(safe1))
          return output[safe1]!({ side: output[side]!() });
        return output.farLanes!({ side: output[side]!() });
      },
      outputStrings: {
        middleLanes: {
          en: 'Middle lanes (${side} turrets)',
          fr: 'Lignes centrales (tourelles ${side})',
          cn: '第二/三行 (${side} 炮台)',
          ko: '2/3번째 줄 (${side} 포탑)',
        },
        farLanes: {
          en: 'Far N/S lanes (${side} turrets)',
          fr: 'Lignes N/S éloignées (tourelles ${side})',
          cn: '第一/四行 (${side} 炮台)',
          ko: '1/4번째 줄 (${side} 포탑)',
        },
        middleNorth: {
          en: 'Middle North lane (${side} turrets)',
          fr: 'Ligne centrale nord (tourelles ${side})',
          cn: '第二行 (${side} 炮台)',
          ko: '2번째 줄 (${side} 포탑)',
        },
        middleSouth: {
          en: 'Middle South lane (${side} turrets)',
          fr: 'Ligne centrale sud (tourelles ${side})',
          cn: '第三行 (${side} 炮台)',
          ko: '3번째 줄 (${side} 포탑)',
        },
        east: Outputs.east,
        west: Outputs.west,
        avoid: {
          en: 'Stand in line with flickering turrets',
          fr: 'Restez sur la ligne de la tourelle clignotante',
          cn: '站在闪烁炮台行',
          ko: '빛나는 포탑이 있는 줄에 서기',
        },
      },
    },
    {
      id: 'Origenics Deceiver Turret Cleanup',
      type: 'Ability',
      // do this on the Surge cast to not interfere with Far North callout
      netRegex: { id: '8E0F', source: 'Deceiver', capture: false },
      run: (data) => {
        data.turretSafe = { east: [], west: [] };
        delete data.nextTurretSide;
      },
    },
    {
      id: 'Origenics Deceiver Surge',
      type: 'StartsUsing',
      netRegex: { id: '8E0F', source: 'Deceiver', capture: false },
      durationSeconds: 10,
      alertText: (_data, _matches, output) => output.safeTurret!(),
      outputStrings: {
        safeTurret: {
          en: 'Knockback into real turret => Spread',
          fr: 'Poussée sur la vraie tourelle => Dispersion',
          cn: '击退到实体炮台 => 分散',
          ko: '진짜 포탑이 있는 곳으로 넉백 => 산개',
        },
      },
    },
    // Since the boss is on the north wall, and one of the farNorth turrets is always real,
    // we can do an infoText with just the farNorth safe side.
    {
      id: 'Origenics Deceiver Surge Far North',
      type: 'StartsUsing',
      netRegex: { id: '8E0F', source: 'Deceiver', capture: false },
      delaySeconds: 2.5, // cast time is ~8s; use short delay to avoid conflict with primary call
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        // this is inverted from safeTurret, which contains the flickering turrets;
        // here, we want the real turret that's far north.

        // boss is N, facing S, so it makes sense to use left/right.
        if (!(data.turretSafe.east.includes('farNorth')))
          return output.right!();
        else if (!(data.turretSafe.west.includes('farNorth')))
          return output.left!();
        return;
      },
      outputStrings: {
        right: {
          en: '(Far North lane: Knockback Right) ==>',
          fr: '(Ligne nord éloignée : Poussée droite) ==>',
          cn: '(第一行: 向右击退) ==>',
          ko: '(1번째 줄: 오른쪽 넉백) ==>',
        },
        left: {
          en: '<== (Far North lane: Knockback Left)',
          fr: '<== (Ligne sur éloignée : Poussée gauche)',
          cn: '<== (第一行: 向左击退)',
          ko: '<== (1번째 줄: 왼쪽 넉백)',
        },
      },
    },

    // ** Ambrose the Undeparted ** //
    {
      id: 'Origenics Ambrose Psychic Wave',
      type: 'StartsUsing',
      netRegex: { id: '8E54', source: 'Ambrose The Undeparted', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Origenics Ambrose Overwhelming Charge',
      type: 'StartsUsing',
      // Subsequent cleaves paired with Psychokinetic Charge use different ids
      netRegex: { id: '9941', source: 'Ambrose The Undeparted', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Origenics Ambrose Voltaic Slash',
      type: 'StartsUsing',
      netRegex: { id: '8E55', source: 'Ambrose The Undeparted' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Origenics Ambrose Psychokinesis Cages',
      type: 'StartsUsing',
      netRegex: { id: '8E4C', source: 'Ambrose The Undeparted' },
      durationSeconds: 9,
      alertText: (data, matches, output) => {
        // hidden actors use 8E4C for the line cleaves - there is always a pair
        // we only care about y-position (x-pos/side is irrelevant)
        // y values are -13 (N), 0, 13 (S)
        const y = Math.round(parseFloat(matches.y));
        const cleaveLane = y < 0 ? 'north' : (y > 0 ? 'south' : 'middle');
        data.psychokinesisSafe = data.psychokinesisSafe.filter((dir) => dir !== cleaveLane);

        if (data.psychokinesisSafe.length === 1) {
          const safeDir = data.psychokinesisSafe[0];
          if (!safeDir)
            throw new UnreachableCode();

          return data.seenFirstCages
            ? output.spread!({ dir: output[safeDir]!() })
            : output[safeDir]!();
        }
      },
      run: (data) => {
        if (data.psychokinesisSafe.length === 1) {
          data.seenFirstCages = true;
          data.psychokinesisSafe = [...psychoKinesisSafeDirs];
        }
      },
      outputStrings: {
        spread: {
          en: '${dir} => Spread',
          fr: '${dir} => Dispersion',
          cn: '${dir} => 分散',
          ko: '${dir} => 산개',
        },
        north: Outputs.north,
        middle: Outputs.middle,
        south: Outputs.south,
      },
    },
    {
      id: 'Origenics Ambrose Extrasensory Field',
      type: 'StartsUsing',
      netRegex: { id: '8E50', source: 'Ambrose The Undeparted', capture: false },
      infoText: (_data, _matches, output) => output.kb!(),
      outputStrings: {
        kb: {
          en: 'Knockback N/S',
          fr: 'Poussée N/S',
          cn: '向 上/下 击退',
          ko: '남/북쪽으로 넉백',
        },
      },
    },
    {
      id: 'Origenics Ambrose Psychokinetic Charge',
      type: 'StartsUsing',
      netRegex: { id: '988F', source: 'Ambrose The Undeparted', capture: false },
      infoText: (data, _matches, output) =>
        data.seenFirstPsychokineticCharge ? output.kbSpread!() : output.kb!(),
      run: (data) => data.seenFirstPsychokineticCharge = true,
      outputStrings: {
        kbSpread: {
          en: 'Knockback to behind boss => Spread',
          fr: 'Poussée vers l\'arrière du boss => Dispersion',
          cn: '击退到 BOSS 背后 => 分散',
          ko: '보스 뒤로 넉백 => 산개',
        },
        kb: {
          en: 'Knockback to behind boss',
          fr: 'Poussée vers l\'arrière du boss',
          cn: '击退到 BOSS 背后',
          ko: '보스 뒤로 넉백',
        },
      },
    },
    {
      id: 'Origenics Ambrose Electrolance',
      type: 'Ability',
      netRegex: { id: '8E4D', source: 'Ambrose The Undeparted', capture: false },
      delaySeconds: 5,
      durationSeconds: 8,
      infoText: (_data, _matches, output) => output.avoid!(),
      outputStrings: {
        avoid: {
          en: 'Avoid lance zig-zag',
          fr: 'Évitez la lance en zig-zag',
          cn: '躲避长枪折线 AOE',
          ko: '지그재그 장판 피하기',
        },
      },
    },
    {
      id: 'Origenics Ambrose Electrolance Asssimilation',
      type: 'Ability',
      // use the first lance charge (982A = Rush) for timing
      netRegex: { id: '982A', source: 'Electrolance', capture: false },
      delaySeconds: 4.5,
      suppressSeconds: 10,
      response: Responses.goSides(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Right Sweep/Left Sweep/Rear Sweep': 'Right/Left/Rear Sweep',
      },
    },
  ],
};

export default triggerSet;
