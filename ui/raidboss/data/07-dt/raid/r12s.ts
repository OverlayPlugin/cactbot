import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import {
  DirectionOutput8,
  DirectionOutputCardinal,
  DirectionOutputIntercard,
  Directions,
} from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Phase =
  | 'doorboss'
  | 'curtainCall'
  | 'slaughtershed'
  | 'replication1'
  | 'replication2'
  | 'reenactment1'
  | 'idyllic'
  | 'reenactment2';

type DirectionCardinal = Exclude<DirectionOutputCardinal, 'unknown'>;
type DirectionIntercard = Exclude<DirectionOutputIntercard, 'unknown'>;

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    uptimeKnockbackStrat: true | false;
  };
  phase: Phase;
  // Phase 1
  grotesquerieCleave?:
    | 'rightCleave'
    | 'leftCleave'
    | 'frontCleave'
    | 'rearCleave';
  myFleshBonds?: 'alpha' | 'beta';
  inLine: { [name: string]: number };
  blobTowerDirs: string[];
  fleshBondsCount: number;
  skinsplitterCount: number;
  cellChainCount: number;
  myMitoticPhase?: string;
  hasRot: boolean;
  // Phase 2
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  replicationCounter: number;
  replication1Debuff?: 'fire' | 'dark';
  replication1FireActor?: string;
  replication1FollowUp: boolean;
  replication2TetherMap: { [dirNum: string]: string };
  replication2BossId?: string;
  myReplication2Tether?: string;
  netherwrathFollowup: boolean;
  myMutation?: 'alpha' | 'beta';
  manaSpheres: {
    [id: string]: 'lightning' | 'fire' | 'water' | 'wind' | 'blackHole';
  };
  westManaSpheres: { [id: string]: { x: number; y: number } };
  eastManaSpheres: { [id: string]: { x: number; y: number } };
  closeManaSphereIds: string[];
  firstBlackHole?: 'east' | 'west';
  manaSpherePopSide?: 'east' | 'west';
  twistedVisionCounter: number;
  replication3CloneOrder: number[];
  replication3CloneDirNumPlayers: { [dirNum: number]: string };
  idyllicVision2NorthSouthCleaveSpot?: 'north' | 'south';
  replication4DirNumAbility: { [dirNum: number]: string };
  replication4PlayerAbilities: { [player: string]: string };
  replication4PlayerOrder: string[];
  replication4AbilityOrder: string[];
  myReplication4Tether?: string;
  hasLightResistanceDown: boolean;
  twistedVision4MechCounter: number;
  doomPlayers: string[];
}

const headMarkerData = {
  // Phase 1
  // VFX: com_share3t
  'stack': '00A1',
  // VFX: tank_lockonae_6m_5s_01t
  'tankbuster': '0158',
  // VFX: VFX: x6rc_cellchain_01x
  'cellChain': '0291',
  // VFX: com_share3_7s0p
  'slaughterStack': '013D',
  // VFX: target_ae_s7k1
  'slaughterSpread': '0177',
  'cellChainTether': '016E',
  // Phase 2
  // VFX: sharelaser2tank5sec_c0k1, used by Double Sobat (B520)
  'sharedTankbuster': '0256',
  // Replication 2 Tethers
  'lockedTether': '0175', // Clone tethers
  'projectionTether': '016F', // Comes from Lindschrat, B4EA Grotesquerie + B4EB Hemorrhagic Projection cleave based on player facing
  'manaBurstTether': '0170', // Comes from Lindschrat, B4E7 Mana Burst defamation
  'heavySlamTether': '0171', // Comes from Lindschrat, B4E8 Heavy Slam stack with projection followup
  'fireballSplashTether': '0176', // Comes from the boss, B4E4 Fireball Splash baited jump
} as const;

const center = {
  x: 100,
  y: 100,
} as const;

const phaseMap: { [id: string]: Phase } = {
  'BEC0': 'curtainCall',
  'B4C6': 'slaughtershed',
  'B509': 'idyllic',
};

const isCardinalDir = (dir: DirectionOutput8): dir is DirectionCardinal => {
  return (Directions.outputCardinalDir as string[]).includes(dir);
};

const isIntercardDir = (dir: DirectionOutput8): dir is DirectionIntercard => {
  return (Directions.outputIntercardDir as string[]).includes(dir);
};

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM4Savage',
  zoneId: ZoneId.AacHeavyweightM4Savage,
  config: [
    {
      id: 'uptimeKnockbackStrat',
      name: {
        en: 'Enable uptime knockback strat',
        de: 'Aktiviere Uptime Rückstoß Strategie',
        fr: 'Activer la strat Poussée-Uptime',
        ja: 'エデン零式共鳴編４層：cactbot「ヘヴンリーストライク (ノックバック)」ギミック', // FIXME
        cn: '启用击退镜 uptime 策略',
        ko: '정확한 타이밍 넉백방지 공략 사용',
        tc: '啟用擊退鏡 uptime 策略',
      },
      comment: {
        en: `If you want cactbot to callout Raptor Knuckles double knockback, enable this option.
             Callout happens during/after first animation and requires <1.8s reaction time
             to avoid both Northwest and Northeast knockbacks.
             NOTE: This will call for each set.`,
      },
      type: 'checkbox',
      default: false,
    },
  ],
  timelineFile: 'r12s.txt',
  initData: () => ({
    phase: 'doorboss',
    // Phase 1
    inLine: {},
    blobTowerDirs: [],
    skinsplitterCount: 0,
    fleshBondsCount: 0,
    cellChainCount: 0,
    hasRot: false,
    // Phase 2
    actorPositions: {},
    replicationCounter: 0,
    replication1FollowUp: false,
    replication2TetherMap: {},
    netherwrathFollowup: false,
    manaSpheres: {},
    westManaSpheres: {},
    eastManaSpheres: {},
    closeManaSphereIds: [],
    twistedVisionCounter: 0,
    replication3CloneOrder: [],
    replication3CloneDirNumPlayers: {},
    replication4DirNumAbility: {},
    replication4PlayerAbilities: {},
    replication4PlayerOrder: [],
    replication4AbilityOrder: [],
    hasLightResistanceDown: false,
    twistedVision4MechCounter: 0,
    doomPlayers: [],
  }),
  triggers: [
    {
      id: 'R12S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'Lindwurm' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
      },
    },
    {
      id: 'R12S Phase Two Staging Tracker',
      // Due to the way the combatants are added in prior to the cast of Staging, this is used to set the phase
      type: 'AddedCombatant',
      netRegex: { name: 'Understudy', capture: false },
      condition: (data) => data.phase === 'replication1',
      run: (data) => data.phase = 'replication2',
    },
    {
      id: 'R12S Phase Two Replication Tracker',
      type: 'StartsUsing',
      netRegex: { id: 'B4D8', source: 'Lindwurm', capture: false },
      run: (data) => {
        if (data.replicationCounter === 0)
          data.phase = 'replication1';
        data.replicationCounter = data.replicationCounter + 1;
      },
    },
    {
      id: 'R12S Phase Two Boss ID Collect',
      // Store the boss' id later for checking against tether
      // Using first B4E1 Staging
      type: 'StartsUsing',
      netRegex: { id: 'B4E1', source: 'Lindwurm', capture: true },
      condition: (data) => data.phase === 'replication2',
      suppressSeconds: 9999,
      run: (data, matches) => data.replication2BossId = matches.sourceId,
    },
    {
      id: 'R12S Phase Two Reenactment Tracker',
      type: 'StartsUsing',
      netRegex: { id: 'B4EC', source: 'Lindwurm', capture: false },
      run: (data) => {
        if (data.phase === 'replication2') {
          data.phase = 'reenactment1';
          return;
        }
        data.phase = 'reenactment2';
      },
    },
    {
      id: 'R12S Phase Two Twisted Vision Tracker',
      // Used for keeping track of phases in idyllic
      type: 'StartsUsing',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: false },
      run: (data) => {
        data.twistedVisionCounter = data.twistedVisionCounter + 1;
      },
    },
    {
      id: 'R12S Phase Two ActorSetPos Tracker',
      type: 'ActorSetPos',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      condition: (data) => {
        if (
          data.phase === 'replication1' ||
          data.phase === 'replication2' ||
          data.phase === 'idyllic'
        )
          return true;
        return false;
      },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R12S Phase Two ActorMove Tracker',
      type: 'ActorMove',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      condition: (data) => {
        if (
          data.phase === 'replication1' ||
          data.phase === 'replication2' ||
          data.phase === 'idyllic'
        )
          return true;
        return false;
      },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R12S Phase Two AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      condition: (data) => {
        if (
          data.phase === 'replication1' ||
          data.phase === 'replication2' ||
          data.phase === 'idyllic'
        )
          return true;
        return false;
      },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R12S The Fixer',
      type: 'StartsUsing',
      netRegex: { id: 'B4D7', source: 'Lindwurm', capture: false },
      durationSeconds: 4.7,
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'R12S Directed Grotesquerie Direction Collect',
      // Unknown_DE6 spell contains data in its count:
      // 40C, Front Cone
      // 40D, Right Cone
      // 40E, Rear Cone
      // 40F, Left Cone
      type: 'GainsEffect',
      netRegex: { effectId: 'DE6', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        switch (matches.count) {
          case '40C':
            data.grotesquerieCleave = 'frontCleave';
            return;
          case '40D':
            data.grotesquerieCleave = 'rightCleave';
            return;
          case '40E':
            data.grotesquerieCleave = 'rearCleave';
            return;
          case '40F':
            data.grotesquerieCleave = 'leftCleave';
            return;
        }
      },
    },
    {
      id: 'R12S Shared Grotesquerie',
      type: 'GainsEffect',
      netRegex: { effectId: '129A', capture: true },
      delaySeconds: 0.2,
      durationSeconds: 17,
      infoText: (data, matches, output) => {
        const cleave = data.grotesquerieCleave;
        const target = matches.target;
        if (target === data.me) {
          if (cleave === undefined)
            return output.baitThenStack!({ stack: output.stackOnYou!() });
          return output.baitThenStackCleave!({
            stack: output.stackOnYou!(),
            cleave: output[cleave]!(),
          });
        }

        const player = data.party.member(target);
        const isDPS = data.party.isDPS(target);
        if (isDPS && data.role === 'dps') {
          if (cleave === undefined)
            return output.baitThenStack!({
              stack: output.stackOnPlayer!({ player: player }),
            });
          return output.baitThenStackCleave!({
            stack: output.stackOnPlayer!({ player: player }),
            cleave: output[cleave]!(),
          });
        }
        if (!isDPS && data.role !== 'dps') {
          if (cleave === undefined)
            return output.baitThenStack!({
              stack: output.stackOnPlayer!({ player: player }),
            });
          return output.baitThenStackCleave!({
            stack: output.stackOnPlayer!({ player: player }),
            cleave: output[cleave]!(),
          });
        }
      },
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
        stackOnPlayer: Outputs.stackOnPlayer,
        frontCleave: {
          en: 'Front Cleave',
          de: 'Kegel Aoe nach Vorne',
          fr: 'Cleave Avant',
          ja: '口からおくび',
          cn: '前方扇形',
          ko: '전방 부채꼴 장판',
          tc: '前方扇形',
        },
        rearCleave: {
          en: 'Rear Cleave',
          de: 'Kegel Aoe nach Hinten',
          fr: 'Cleave Arrière',
          ja: '尻からおなら',
          cn: '背后扇形',
          ko: '후방 부채꼴 장판',
          tc: '背後扇形',
        },
        leftCleave: {
          en: 'Left Cleave',
          de: 'Linker Cleave',
          fr: 'Cleave gauche',
          ja: '左半面へ攻撃',
          cn: '左刀',
          ko: '왼쪽 공격',
          tc: '左刀',
        },
        rightCleave: {
          en: 'Right Cleave',
          de: 'Rechter Cleave',
          fr: 'Cleave droit',
          ja: '右半面へ攻撃',
          cn: '右刀',
          ko: '오른쪽 공격',
          tc: '右刀',
        },
        baitThenStack: {
          en: 'Bait 4x Puddles => ${stack}',
        },
        baitThenStackCleave: {
          en: 'Bait 4x Puddles => ${stack} + ${cleave}',
        },
      },
    },
    {
      id: 'R12S Bursting Grotesquerie',
      type: 'GainsEffect',
      netRegex: { effectId: '1299', capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.2,
      durationSeconds: 17,
      infoText: (data, _matches, output) => {
        const cleave = data.grotesquerieCleave;
        if (cleave === undefined)
          return data.phase === 'doorboss'
            ? output.baitThenSpread!()
            : output.spreadCurtain!();
        return data.phase === 'doorboss'
          ? output.baitThenSpreadCleave!({ cleave: output[cleave]!() })
          : output.spreadCurtain!();
      },
      outputStrings: {
        frontCleave: {
          en: 'Front Cleave',
          de: 'Kegel Aoe nach Vorne',
          fr: 'Cleave Avant',
          ja: '口からおくび',
          cn: '前方扇形',
          ko: '전방 부채꼴 장판',
          tc: '前方扇形',
        },
        rearCleave: {
          en: 'Rear Cleave',
          de: 'Kegel Aoe nach Hinten',
          fr: 'Cleave Arrière',
          ja: '尻からおなら',
          cn: '背后扇形',
          ko: '후방 부채꼴 장판',
          tc: '背後扇形',
        },
        leftCleave: {
          en: 'Left Cleave',
          de: 'Linker Cleave',
          fr: 'Cleave gauche',
          ja: '左半面へ攻撃',
          cn: '左刀',
          ko: '왼쪽 공격',
          tc: '左刀',
        },
        rightCleave: {
          en: 'Right Cleave',
          de: 'Rechter Cleave',
          fr: 'Cleave droit',
          ja: '右半面へ攻撃',
          cn: '右刀',
          ko: '오른쪽 공격',
          tc: '右刀',
        },
        baitThenSpread: {
          en: 'Bait 4x Puddles => Spread',
        },
        baitThenSpreadCleave: {
          en: 'Bait 4x Puddles => Spread + ${cleave}',
        },
        spreadCurtain: {
          en: 'Spread Debuff on YOU',
        },
      },
    },
    {
      id: 'R12S Ravenous Reach 1 Safe Side',
      // These two syncs indicate the animation of where the head will go to cleave
      // B49A => West Safe
      // B49B => East Safe
      type: 'Ability',
      netRegex: { id: ['B49A', 'B49B'], source: 'Lindwurm', capture: true },
      condition: (data) => data.phase === 'doorboss',
      infoText: (_data, matches, output) => {
        if (matches.id === 'B49A')
          return output.goWest!();
        return output.goEast!();
      },
      outputStrings: {
        goEast: Outputs.east,
        goWest: Outputs.west,
      },
    },
    {
      id: 'R12S Fourth-wall Fusion Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['stack'], capture: true },
      condition: (data) => {
        if (data.role === 'tank')
          return false;
        return true;
      },
      durationSeconds: 5.1,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R12S Tankbuster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 5.1,
      response: Responses.tankBuster(),
    },
    {
      id: 'R12S In Line Debuff Collector',
      type: 'GainsEffect',
      netRegex: { effectId: ['BBC', 'BBD', 'BBE', 'D7B'] },
      run: (data, matches) => {
        const effectToNum: { [effectId: string]: number } = {
          BBC: 1,
          BBD: 2,
          BBE: 3,
          D7B: 4,
        } as const;
        const num = effectToNum[matches.effectId];
        if (num === undefined)
          return;
        data.inLine[matches.target] = num;
      },
    },
    {
      id: 'R12S Bonds of Flesh Flesh α/β Collect',
      // Bonds of Flesh has the following timings:
      // 1st -  26s
      // 2nd - 31s
      // 3rd - 36s
      // 4rth - 41s
      type: 'GainsEffect',
      netRegex: { effectId: ['1290', '1292'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.myFleshBonds = matches.effectId === '1290' ? 'alpha' : 'beta';
      },
    },
    {
      id: 'R12S In Line Debuff',
      type: 'GainsEffect',
      netRegex: { effectId: ['BBC', 'BBD', 'BBE', 'D7B'], capture: false },
      delaySeconds: 0.5,
      durationSeconds: 10,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const myNum = data.inLine[data.me];
        if (myNum === undefined)
          return;
        const flesh = data.myFleshBonds;
        if (flesh === undefined)
          return output.order!({ num: myNum });
        if (flesh === 'alpha') {
          switch (myNum) {
            case 1:
              return output.alpha1!();
            case 2:
              return output.alpha2!();
            case 3:
              return output.alpha3!();
            case 4:
              return output.alpha4!();
          }
        }
        switch (myNum) {
          case 1:
            return output.beta1!();
          case 2:
            return output.beta2!();
          case 3:
            return output.beta3!();
          case 4:
            return output.beta4!();
        }
      },
      outputStrings: {
        alpha1: {
          en: '1α: Wait for Tether 1',
        },
        alpha2: {
          en: '2α: Wait for Tether 2',
        },
        alpha3: {
          en: '3α: Blob Tower 1',
        },
        alpha4: {
          en: '4α: Blob Tower 2',
        },
        beta1: {
          en: '1β: Wait for Tether 1',
        },
        beta2: {
          en: '2β: Wait for Tether 2',
        },
        beta3: {
          en: '3β: Chain Tower 1',
        },
        beta4: {
          en: '4β: Chain Tower 2',
        },
        order: {
          en: '${num}',
          de: '${num}',
          fr: '${num}',
          ja: '${num}',
          cn: '${num}',
          ko: '${num}',
          tc: '${num}',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R12S Phagocyte Spotlight Blob Tower Location Collect',
      // StartsUsing and StartsUsingExtra can have bad data, there is enough time that Ability is sufficient
      // Pattern 1
      // Blob 1: (104, 104) SE Inner
      // Blob 2: (96, 96) NW Inner
      // Blob 3: (85, 110) SW Outer
      // Blob 4: (115, 90) NE Outer
      // Pattern 2
      // Blob 1: (104, 96) NE Inner
      // Blob 2: (96, 104) SW Inner
      // Blob 3: (85, 90) NW Outer
      // Blob 4: (115, 110) SE Outer
      // Pattern 3
      // Blob 1: (96, 96) NW Inner
      // Blob 2: (104, 104) SE Inner
      // Blob 3: (115, 90) NE Outer
      // Blob 4: (85, 110) SW Outer
      // Pattern 4
      // Blob 1: (96, 104) SW Inner
      // Blob 2: (104, 96) NE Inner
      // Blob 3: (115, 110) SE Outer
      // Blob 4: (86, 90) NW Outer
      type: 'Ability',
      netRegex: { id: 'B4B6', capture: true },
      suppressSeconds: 10,
      run: (data, matches) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const dir = Directions.xyToIntercardDirOutput(x, y, center.x, center.y);
        data.blobTowerDirs.push(dir);

        if (dir === 'dirSE') {
          data.blobTowerDirs.push('dirNW');
          data.blobTowerDirs.push('dirSW');
          data.blobTowerDirs.push('dirNE');
        } else if (dir === 'dirNE') {
          data.blobTowerDirs.push('dirSW');
          data.blobTowerDirs.push('dirNW');
          data.blobTowerDirs.push('dirSE');
        } else if (dir === 'dirNW') {
          data.blobTowerDirs.push('dirSE');
          data.blobTowerDirs.push('dirNE');
          data.blobTowerDirs.push('dirSW');
        } else if (dir === 'dirSW') {
          data.blobTowerDirs.push('dirNE');
          data.blobTowerDirs.push('dirSE');
          data.blobTowerDirs.push('dirNW');
        }
      },
    },
    {
      id: 'R12S Phagocyte Spotlight Blob Tower Location (Early)',
      // 23.8s until B4B7 Rolling Mass Blob Tower Hit
      // Only need to know first blob location
      type: 'Ability',
      netRegex: { id: 'B4B6', capture: false },
      condition: (data) => data.myFleshBonds === 'alpha',
      delaySeconds: 0.1,
      durationSeconds: (data) => {
        const myNum = data.inLine[data.me];
        // Timings based on next trigger
        switch (myNum) {
          case 1:
            return 17;
          case 2:
            return 22;
          case 3:
            return 18;
          case 4:
            return 18;
        }
      },
      suppressSeconds: 10,
      infoText: (data, _matches, output) => {
        const myNum = data.inLine[data.me];
        if (myNum === undefined)
          return;

        type index = {
          [key: number]: number;
        };
        const myNumToDirIndex: index = {
          1: 2,
          2: 3,
          3: 0,
          4: 1,
        };
        const dirIndex = myNumToDirIndex[myNum];
        if (dirIndex === undefined)
          return;
        const towerNum = dirIndex + 1;

        const dir = data.blobTowerDirs[dirIndex];
        if (dir === undefined)
          return;

        if (myNum > 2)
          return output.innerBlobTower!({
            num: towerNum,
            dir: output[dir]!(),
          });
        return output.outerBlobTower!({ num: towerNum, dir: output[dir]!() });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        innerBlobTower: {
          en: 'Blob Tower ${num} Inner ${dir} (later)',
        },
        outerBlobTower: {
          en: 'Blob Tower ${num} Outer ${dir} (later)',
        },
      },
    },
    {
      id: 'R12S Cursed Coil Bind Draw-in',
      // Using Phagocyte Spotlight, 1st one happens 7s before bind
      // Delayed additionally to reduce overlap with alpha tower location calls
      type: 'Ability',
      netRegex: { id: 'B4B6', capture: false },
      delaySeconds: 3, // 5s warning
      suppressSeconds: 10,
      response: Responses.drawIn(),
    },
    {
      id: 'R12S Skinsplitter Counter',
      // These occur every 5s
      // Useful for blob tower tracking that happen 2s after
      // 2: Tether 1
      // 3: Tether 2 + Blob Tower 1
      // 4: Tether 3 + Blob Tower 2
      // 5: Tether 4 + Blob Tower 3
      // 6: Blob Tower 4
      // 7: Last time to exit
      type: 'Ability',
      netRegex: { id: 'B4BC', capture: false },
      suppressSeconds: 1,
      run: (data) => data.skinsplitterCount = data.skinsplitterCount + 1,
    },
    {
      id: 'R12S Cell Chain Counter',
      type: 'Tether',
      netRegex: { id: headMarkerData['cellChainTether'], capture: false },
      condition: (data) => data.phase === 'doorboss',
      run: (data) => data.cellChainCount = data.cellChainCount + 1,
    },
    {
      id: 'R12S Cell Chain Tether Number',
      // Helpful for players to keep track of which chain tower is next
      // Does not output when it is their turn to break the tether
      type: 'Tether',
      netRegex: { id: headMarkerData['cellChainTether'], capture: false },
      condition: (data) => {
        if (data.phase === 'doorboss' && data.myFleshBonds === 'beta')
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const myNum = data.inLine[data.me];
        const num = data.cellChainCount;
        if (myNum !== num) {
          if (myNum === 1 && num === 3)
            return output.beta1Tower!({
              tether: output.tether!({ num: num }),
            });
          if (myNum === 2 && num === 4)
            return output.beta2Tower!({
              tether: output.tether!({ num: num }),
            });
          if (myNum === 3 && num === 1)
            return output.beta3Tower!({
              tether: output.tether!({ num: num }),
            });
          if (myNum === 4 && num === 2)
            return output.beta4Tower!({
              tether: output.tether!({ num: num }),
            });

          return output.tether!({ num: num });
        }

        if (myNum === undefined)
          return output.tether!({ num: num });
      },
      outputStrings: {
        tether: {
          en: 'Tether ${num}',
          de: 'Verbindung ${num}',
          fr: 'Lien ${num}',
          ja: '線 ${num}',
          cn: '线 ${num}',
          ko: '선 ${num}',
          tc: '線 ${num}',
        },
        beta1Tower: {
          en: '${tether} => Chain Tower 3',
        },
        beta2Tower: {
          en: '${tether} => Chain Tower 4',
        },
        beta3Tower: {
          en: '${tether} => Chain Tower 1',
        },
        beta4Tower: {
          en: '${tether} => Chain Tower 2',
        },
      },
    },
    {
      id: 'R12S Chain Tower Number',
      // Using B4B4 Dramatic Lysis to detect chain broken
      type: 'Ability',
      netRegex: { id: 'B4B4', capture: false },
      condition: (data) => {
        if (data.phase === 'doorboss' && data.myFleshBonds === 'beta')
          return true;
        return false;
      },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const mechanicNum = data.cellChainCount;
        const myNum = data.inLine[data.me];
        if (myNum === undefined)
          return;

        type index = {
          [key: number]: number;
        };
        const myNumToOrder: index = {
          1: 3,
          2: 4,
          3: 1,
          4: 2,
        };

        const myOrder = myNumToOrder[myNum];
        if (myOrder === undefined)
          return;

        if (myOrder === mechanicNum)
          return output.tower!({ num: mechanicNum });
      },
      outputStrings: {
        tower: {
          en: 'Get Chain Tower ${num}',
        },
      },
    },
    {
      id: 'R12S Bonds of Flesh Flesh α First Two Towers',
      // These are not dependent on player timings and so can be hard coded by duration
      type: 'GainsEffect',
      netRegex: { effectId: '1290', capture: true },
      condition: (data, matches) => {
        if (matches.target === data.me) {
          const duration = parseFloat(matches.duration);
          if (duration < 35)
            return false;
          return true;
        }
        return false;
      },
      delaySeconds: (_data, matches) => {
        const duration = parseFloat(matches.duration);
        // The following gives 5s warning to take tower
        if (duration > 37)
          return 31; // Alpha4 Time
        return 26; // Alpha3 Time
      },
      alertText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        const dir = data.blobTowerDirs[duration > 40 ? 1 : 0];
        if (duration > 40) {
          if (dir !== undefined)
            return output.alpha4Dir!({ dir: output[dir]!() });
          return output.alpha4!();
        }
        if (dir !== undefined)
          return output.alpha3Dir!({ dir: output[dir]!() });
        return output.alpha3!();
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        alpha3: {
          en: 'Get Blob Tower 1',
        },
        alpha4: {
          en: 'Get Blob Tower 2',
        },
        alpha3Dir: {
          en: 'Get Blob Tower 1 (Inner ${dir})',
        },
        alpha4Dir: {
          en: 'Get Blob Tower 2 (Inner ${dir})',
        },
      },
    },
    {
      id: 'R12S Unbreakable Flesh α/β Chains and Last Two Towers',
      type: 'GainsEffect',
      netRegex: { effectId: ['1291', '1293'], capture: true },
      condition: (data, matches) => {
        if (matches.target === data.me && data.phase === 'doorboss')
          return true;
        return false;
      },
      alertText: (data, matches, output) => {
        const myNum = data.inLine[data.me];
        const flesh = matches.effectId === '1291' ? 'alpha' : 'beta';
        if (flesh === 'alpha') {
          if (myNum === 1) {
            const dir = data.blobTowerDirs[2];
            if (dir !== undefined)
              return output.alpha1Dir!({
                chains: output.breakChains!(),
                dir: output[dir]!(),
              });
          }
          if (myNum === 2) {
            const dir = data.blobTowerDirs[3];
            if (dir !== undefined)
              return output.alpha2Dir!({
                chains: output.breakChains!(),
                dir: output[dir]!(),
              });
          }

          // dir undefined or 3rd/4rth in line
          switch (myNum) {
            case 1:
              return output.alpha1!({ chains: output.breakChains!() });
            case 2:
              return output.alpha2!({ chains: output.breakChains!() });
            case 3:
              return output.alpha3!({ chains: output.breakChains!() });
            case 4:
              return output.alpha4!({ chains: output.breakChains!() });
          }
        }
        switch (myNum) {
          case 1:
            return output.beta1!({ chains: output.breakChains!() });
          case 2:
            return output.beta2!({ chains: output.breakChains!() });
          case 3:
            return output.beta3!({ chains: output.breakChains!() });
          case 4:
            return output.beta4!({ chains: output.breakChains!() });
        }
        return output.getTowers!();
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        breakChains: Outputs.breakChains,
        getTowers: Outputs.getTowers,
        alpha1: {
          en: '${chains} 1 + Blob Tower 3 (Outer)',
        },
        alpha1Dir: {
          en: '${chains} 1 + Blob Tower 3 (Outer ${dir})',
        },
        alpha2: {
          en: '${chains} 2 + Blob Tower 4 (Outer)',
        },
        alpha2Dir: {
          en: '${chains} 2 + Blob Tower 4 (Outer ${dir})',
        },
        alpha3: {
          en: '${chains} 3 + Get Out',
        },
        alpha4: {
          en: '${chains} 4 + Get Out',
        },
        beta1: {
          en: '${chains} 1 => Get Middle',
        },
        beta2: {
          en: '${chains} 2 => Get Middle',
        },
        beta3: {
          en: '${chains} 3 => Wait for last pair',
        },
        beta4: {
          en: '${chains} 4 => Get Out',
        },
      },
    },
    {
      id: 'R12S Chain Tower Followup',
      // Using B4B3 Roiling Mass to detect chain tower soak
      // Beta player leaving early may get hit by alpha's chain break aoe
      type: 'Ability',
      netRegex: { id: 'B4B3', capture: true },
      condition: (data, matches) => {
        if (data.myFleshBonds === 'beta' && data.me === matches.target)
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        // Possibly the count could be off if break late (giving damage and damage down)
        // Ideal towers are soaked:
        // Beta 1 at 5th Skinsplitter
        // Beta 2 at 6th Skinsplitter
        // Beta 3 at 3rd Skinsplitter
        // Beta 4 at 4rth Skinsplitter
        const mechanicNum = data.skinsplitterCount;
        const myNum = data.inLine[data.me];
        if (myNum === undefined) {
          // This can be corrected by the player later
          if (mechanicNum < 5)
            return output.goIntoMiddle!();
          return output.getOut!();
        }

        if (mechanicNum < 5) {
          if (myNum === 1)
            return output.beta1Middle!();
          if (myNum === 2)
            return output.beta2Middle!();
          if (myNum === 3)
            return output.beta3Middle!();
          if (myNum === 4)
            return output.beta4Middle!();
        }
        if (myNum === 1)
          return output.beta1Out!();
        if (myNum === 2)
          return output.beta2Out!();
        if (myNum === 3)
          return output.beta3Out!();
        if (myNum === 4)
          return output.beta4Out!();
      },
      outputStrings: {
        getOut: {
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '밖으로',
          tc: '遠離',
        },
        goIntoMiddle: Outputs.goIntoMiddle,
        beta1Middle: Outputs.goIntoMiddle,
        beta2Middle: Outputs.goIntoMiddle, // Should not happen under ideal situation
        beta3Middle: Outputs.goIntoMiddle,
        beta4Middle: Outputs.goIntoMiddle,
        beta1Out: { // Should not happen under ideal situation
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '밖으로',
          tc: '遠離',
        },
        beta2Out: {
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '밖으로',
          tc: '遠離',
        },
        beta3Out: { // Should not happen under ideal situation
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '밖으로',
          tc: '遠離',
        },
        beta4Out: { // Should not happen under ideal situation
          en: 'Get Out',
          de: 'Raus da',
          fr: 'Sortez',
          ja: '外へ',
          cn: '远离',
          ko: '밖으로',
          tc: '遠離',
        },
      },
    },
    {
      id: 'R12S Blob Tower Followup',
      // Using B4B7 Roiling Mass to detect chain tower soak
      // Alpha 3 and Alpha 4 get the inner towers before their chains
      type: 'Ability',
      netRegex: { id: 'B4B7', capture: true },
      condition: (data, matches) => {
        if (data.myFleshBonds === 'alpha' && data.me === matches.target)
          return true;
        return false;
      },
      infoText: (data, _matches, output) => {
        const mechanicNum = data.skinsplitterCount;
        const myNum = data.inLine[data.me];
        if (myNum === undefined)
          return;

        if (myNum === mechanicNum)
          return output.goIntoMiddle!();
      },
      outputStrings: {
        goIntoMiddle: Outputs.goIntoMiddle,
      },
    },
    {
      id: 'R12S Splattershed',
      type: 'StartsUsing',
      netRegex: { id: ['B9C3', 'B9C4'], source: 'Lindwurm', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R12S Mitotic Phase Direction Collect',
      // Unknown_DE6 spell contains data in its count
      type: 'GainsEffect',
      netRegex: { effectId: 'DE6', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 10,
      infoText: (data, matches, output) => {
        data.myMitoticPhase = matches.count;
        switch (matches.count) {
          case '436':
            return output.frontTower!();
          case '437':
            return output.rightTower!();
          case '438':
            return output.rearTower!();
          case '439':
            return output.leftTower!();
        }
      },
      outputStrings: {
        frontTower: {
          en: 'Tower (S/SW)',
        },
        rearTower: {
          en: 'Tower (N/NE)',
        },
        leftTower: {
          en: 'Tower (E/SE)',
        },
        rightTower: {
          en: 'Tower (W/NW)',
        },
      },
    },
    {
      id: 'R12S Grand Entrance Intercards/Cardinals',
      // B4A1 is only cast when cardinals are safe
      // B4A2 is only cast when intercardinals are safe
      // These casts more than once, so just capture first event
      type: 'StartsUsing',
      netRegex: { id: ['B4A1', 'B4A2'], capture: true },
      suppressSeconds: 5,
      infoText: (data, matches, output) => {
        const count = data.myMitoticPhase;
        if (count === undefined)
          return;
        if (matches.id === 'B4A1') {
          switch (count) {
            case '436':
              return output.frontCardinals!();
            case '437':
              return output.rightCardinals!();
            case '438':
              return output.rearCardinals!();
            case '439':
              return output.leftCardinals!();
          }
        }
        switch (count) {
          case '436':
            return output.frontIntercards!();
          case '437':
            return output.rightIntercards!();
          case '438':
            return output.rearIntercards!();
          case '439':
            return output.leftIntercards!();
        }
      },
      outputStrings: {
        frontIntercards: Outputs.southwest,
        rearIntercards: Outputs.northeast,
        leftIntercards: Outputs.southeast,
        rightIntercards: Outputs.northwest,
        frontCardinals: Outputs.south,
        rearCardinals: Outputs.north,
        leftCardinals: Outputs.east,
        rightCardinals: Outputs.west,
      },
    },
    {
      id: 'R12S Rotting Flesh',
      type: 'GainsEffect',
      netRegex: { effectId: '129B', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 10,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotting Flesh on YOU',
        },
      },
    },
    {
      id: 'R12S Rotting Flesh Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '129B', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hasRot = true,
    },
    {
      id: 'R12S Ravenous Reach 2',
      // These two syncs indicate the animation of where the head will go to cleave
      // B49A => West Safe
      // B49B => East Safe
      type: 'Ability',
      netRegex: { id: ['B49A', 'B49B'], source: 'Lindwurm', capture: true },
      condition: (data) => data.phase === 'curtainCall',
      alertText: (data, matches, output) => {
        if (matches.id === 'B49A') {
          return data.hasRot ? output.getHitEast!() : output.safeWest!();
        }
        return data.hasRot ? output.getHitWest!() : output.safeEast!();
      },
      outputStrings: {
        getHitWest: {
          en: 'Spread in West Cleave',
        },
        getHitEast: {
          en: 'Spread in East Cleave',
        },
        safeEast: {
          en: 'Spread East + Avoid Cleave',
        },
        safeWest: {
          en: 'Spread West + Avoid Cleave',
        },
      },
    },
    {
      id: 'R12S Split Scourge and Venomous Scourge',
      // B4AB Split Scourge and B4A8 Venomous Scourge are instant casts
      // This actor control happens along with boss becoming targetable
      // Seems there are two different data0 values possible:
      // 1E01: Coming back from Cardinal platforms
      // 1E001: Coming back from Intercardinal platforms
      type: 'ActorControl',
      netRegex: { command: '8000000D', data0: ['1E01', '1E001'], capture: false },
      durationSeconds: 9,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.tank!();
        return output.party!();
      },
      outputStrings: {
        tank: {
          en: 'Bait Line AoE from heads',
        },
        party: {
          en: 'Spread, Away from heads',
        },
      },
    },
    {
      id: 'R12S Grotesquerie: Curtain Call Spreads',
      type: 'StartsUsing',
      netRegex: { id: 'BEC0', source: 'Lindwurm', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: 'Bait 5x Puddles',
      },
    },
    {
      id: 'R12S Curtain Call: Unbreakable Flesh α Chains',
      // All players, including dead, receive α debuffs
      // TODO: Find safe spots
      type: 'GainsEffect',
      netRegex: { effectId: '1291', capture: true },
      condition: (data, matches) => {
        if (matches.target === data.me && data.phase === 'curtainCall')
          return true;
        return false;
      },
      infoText: (_data, _matches, output) => {
        return output.alphaChains!({
          chains: output.breakChains!(),
          safe: output.safeSpots!(),
        });
      },
      outputStrings: {
        breakChains: Outputs.breakChains,
        safeSpots: {
          en: 'Avoid Blobs',
        },
        alphaChains: {
          en: '${chains} => ${safe}',
        },
      },
    },
    {
      id: 'R12S Slaughtershed',
      type: 'StartsUsing',
      netRegex: { id: ['B4C6', 'B4C3'], source: 'Lindwurm', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'R12S Slaughtershed Stack',
      // TODO: Get Safe spot
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['slaughterStack'], capture: true },
      condition: (data, matches) => {
        const isDPS = data.party.isDPS(matches.target);
        if (isDPS && data.role === 'dps')
          return true;
        if (!isDPS && data.role !== 'dps')
          return true;
        return false;
      },
      durationSeconds: 5.1,
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R12S Slaughtershed Spread',
      // TODO: Get Safe spot
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['slaughterSpread'], capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: 5.1,
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'R12S Serpintine Scourge Right Hand First',
      // Left Hand first, then Right Hand
      type: 'Ability',
      netRegex: { id: 'B4CB', source: 'Lindwurm', capture: false },
      condition: (data) => data.phase === 'slaughtershed',
      durationSeconds: 12,
      infoText: (_data, _matches, output) => output.rightThenLeft!(),
      outputStrings: {
        rightThenLeft: Outputs.rightThenLeft,
      },
    },
    {
      id: 'R12S Serpintine Scourge Left Hand First',
      // Right Hand first, then Left Hand
      type: 'Ability',
      netRegex: { id: 'B4CD', source: 'Lindwurm', capture: false },
      condition: (data) => data.phase === 'slaughtershed',
      durationSeconds: 12,
      infoText: (_data, _matches, output) => output.leftThenRight!(),
      outputStrings: {
        leftThenRight: Outputs.leftThenRight,
      },
    },
    {
      id: 'R12S Raptor Knuckles Right Hand First',
      // Right Hand first, then Left Hand
      type: 'Ability',
      netRegex: { id: 'B4CC', source: 'Lindwurm', capture: false },
      condition: (data) => data.phase === 'slaughtershed',
      durationSeconds: 15,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Knockback from Northwest => Knockback from Northeast',
        },
      },
    },
    {
      id: 'R12S Raptor Knuckles Left Hand First',
      // Left Hand first, then Right Hand
      type: 'Ability',
      netRegex: { id: 'B4CE', source: 'Lindwurm', capture: false },
      condition: (data) => data.phase === 'slaughtershed',
      durationSeconds: 15,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Knockback from Northeast => Knockback from Northwest',
        },
      },
    },
    {
      id: 'R12S Raptor Knuckles Uptime Knockback',
      // First knockback is at ~13.374s
      // Second knockback is at ~17.964s
      // Use knockback at ~11.5s to hit both with ~1.8s leniency
      // ~11.457s before is too late as it comes off the same time as hit
      // ~11.554s before works (surecast ends ~0.134 after hit)
      type: 'Ability',
      netRegex: { id: ['B4CC', 'B4CE'], source: 'Lindwurm', capture: false },
      condition: (data) => {
        if (data.phase === 'slaughtershed' && data.triggerSetConfig.uptimeKnockbackStrat)
          return true;
        return false;
      },
      delaySeconds: 11.5,
      durationSeconds: 1.8,
      response: Responses.knockback(),
    },
    {
      id: 'R12S Refreshing Overkill',
      // 10s castTime that could end with enrage or raidwide
      type: 'StartsUsing',
      netRegex: { id: 'B538', source: 'Lindwurm', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      durationSeconds: 4.7,
      response: Responses.bigAoe('alert'),
    },
    // Phase 2
    {
      id: 'R12S Arcadia Aflame',
      type: 'StartsUsing',
      netRegex: { id: 'B528', source: 'Lindwurm', capture: false },
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'R12S Winged Scourge',
      // B4DA E/W clones Facing S, Cleaving Front/Back (North/South)
      // B4DB N/S clones Facing W, Cleaving Front/Back (East/West)
      type: 'StartsUsing',
      netRegex: { id: ['B4DA', 'B4DB'], source: 'Lindschrat', capture: true },
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        if (matches.id === 'B4DA') {
          if (data.replication1FollowUp)
            return output.northSouthCleaves2!();
          return output.northSouthCleaves!();
        }
        if (data.replication1FollowUp)
          return output.eastWestCleaves2!();
        return output.eastWestCleaves!();
      },
      outputStrings: {
        northSouthCleaves: {
          en: 'North/South Cleaves',
        },
        eastWestCleaves: {
          en: 'East/West Cleaves',
        },
        northSouthCleaves2: {
          en: 'North/South Cleaves',
        },
        eastWestCleaves2: {
          en: 'East/West Cleaves',
        },
      },
    },
    {
      id: 'R12S Fire and Dark Resistance Down II Collector',
      // CFB Dark Resistance Down II
      // B79 Fire Resistance Down II
      type: 'GainsEffect',
      netRegex: { effectId: ['CFB', 'B79'], capture: true },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 9999,
      run: (data, matches) => {
        data.replication1Debuff = matches.effectId === 'CFB' ? 'dark' : 'fire';
      },
    },
    {
      id: 'R12S Fire and Dark Resistance Down II',
      // CFB Dark Resistance Down II
      // B79 Fire Resistance Down II
      type: 'GainsEffect',
      netRegex: { effectId: ['CFB', 'B79'], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target)
          return !data.replication1FollowUp;
        return false;
      },
      suppressSeconds: 9999,
      infoText: (_data, matches, output) => {
        return matches.effectId === 'CFB' ? output.dark!() : output.fire!();
      },
      outputStrings: {
        fire: {
          en: 'Fire Debuff: Spread near Dark (later)',
        },
        dark: {
          en: 'Dark Debuff: Stack near Fire (later)',
        },
      },
    },
    {
      id: 'R12S Fake Fire Resistance Down II',
      // Two players will not receive a debuff, they will need to act as if they had
      // Mechanics happen across 1.1s
      type: 'GainsEffect',
      netRegex: { effectId: ['CFB', 'B79'], capture: false },
      condition: (data) => !data.replication1FollowUp,
      delaySeconds: 1.2, // +0.1s Delay for debuff/damage propagation
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        if (data.replication1Debuff === undefined)
          return output.noDebuff!();
      },
      outputStrings: {
        noDebuff: {
          en: 'No Debuff: Spread near Dark (later)',
        },
      },
    },
    {
      id: 'R12S Snaking Kick',
      // Targets random player
      type: 'StartsUsing',
      netRegex: { id: 'B527', source: 'Lindwurm', capture: true },
      condition: (data) => {
        // Use Grotesquerie trigger for projection tethered players
        const ability = data.myReplication2Tether;
        if (ability === headMarkerData['projectionTether'])
          return false;
        return true;
      },
      delaySeconds: 0.1, // Need to delay for actor position update
      alertText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.getBehind!();

        const dirNum = (Directions.hdgTo16DirNum(actor.heading) + 8) % 16;
        const dir = Directions.output16Dir[dirNum] ?? 'unknown';
        return output.getBehindDir!({
          dir: output[dir]!(),
          mech: output.getBehind!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        getBehind: Outputs.getBehind,
        getBehindDir: {
          en: '${dir}: ${mech}',
        },
      },
    },
    {
      id: 'R12S Replication 1 Follow-up Tracker',
      // Tracking from B527 Snaking Kick
      type: 'Ability',
      netRegex: { id: 'B527', source: 'Lindwurm', capture: false },
      suppressSeconds: 9999,
      run: (data) => data.replication1FollowUp = true,
    },
    {
      id: 'R12S Top-Tier Slam Actor Collect',
      // Fire NPCs always move in the first Set
      // Locations are static
      // Fire => Dark => Fire => Dark
      // Dark => Fire => Dark => Fire
      // The other 4 cleave in a line
      // (90, 90)           (110, 90)
      //      (95, 95)  (105, 95)
      //             Boss
      //      (95, 100) (105, 105)
      // (90, 110)          (110, 110)
      // ActorMove ~0.3s later will have the data
      // ActorSet from the clones splitting we can infer the fire entities since their positions and headings are not perfect
      type: 'Ability',
      netRegex: { id: 'B4D9', source: 'Lindschrat', capture: true },
      condition: (data, matches) => {
        if (data.replication1FollowUp) {
          const pos = data.actorPositions[matches.sourceId];
          if (pos === undefined)
            return false;
          // These values should be 0 if coords are x.0000
          const xFilter = pos.x % 1;
          const yFilter = pos.y % 1;
          if (xFilter === 0 && yFilter === 0 && pos.heading === -0.0001)
            return false;
          return true;
        }
        return false;
      },
      suppressSeconds: 9999, // Only need one of the two
      run: (data, matches) => data.replication1FireActor = matches.sourceId,
    },
    {
      id: 'R12S Top-Tier Slam/Mighty Magic Locations',
      type: 'Ability',
      netRegex: { id: 'B4D9', source: 'Lindschrat', capture: false },
      condition: (data) => {
        if (data.replication1FollowUp && data.replication1FireActor !== undefined)
          return true;
        return false;
      },
      delaySeconds: 1, // Data is sometimes not available right away
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        const fireId = data.replication1FireActor;
        if (fireId === undefined)
          return;

        const actor = data.actorPositions[fireId];
        if (actor === undefined)
          return;

        const x = actor.x;
        const dirNum = Directions.xyTo8DirNum(x, actor.y, center.x, center.y);
        const dir1 = Directions.output8Dir[dirNum] ?? 'unknown';
        const dirNum2 = (dirNum + 4) % 8;
        const dir2 = Directions.output8Dir[dirNum2] ?? 'unknown';

        // Check if combatant moved to inner or outer
        const isIn = (x > 94 && x < 106);
        const fireIn = isIn ? dir1 : dir2;
        const fireOut = isIn ? dir2 : dir1;

        if (data.replication1Debuff === 'dark')
          return output.fire!({
            dir1: output[fireIn]!(),
            dir2: output[fireOut]!(),
          });

        // Dark will be opposite pattern of Fire
        const darkIn = isIn ? dir2 : dir1;
        const darkOut = isIn ? dir1 : dir2;

        // Fire debuff players and unmarked bait Dark
        return output.dark!({
          dir1: output[darkIn]!(),
          dir2: output[darkOut]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir, // Cardinals should result in '???'
        fire: {
          en: 'Bait Fire In ${dir1}/Out ${dir2} (Partners)',
        },
        dark: {
          en: 'Bait Dark In ${dir1}/Out ${dir2} (Solo)',
        },
      },
    },
    {
      id: 'R12S Double Sobat',
      // Shared half-room cleave on tank => random turn half-room cleave =>
      // Esoteric Finisher big circle aoes that hits two highest emnity targets
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['sharedTankbuster'], capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R12S Double Sobat 2',
      // Followup half-room cleave:
      // B521 Double Sobat: 0 degree left turn then B525
      // B522 Double Sobat: 90 degree left turn then B525
      // B523 Double Sobat: 180 degree left turn then B525
      // B524 Double Sobat: 270 degree left turn (this ends up 90 degrees to the right)
      type: 'Ability',
      netRegex: { id: ['B521', 'B522', 'B523', 'B524'], source: 'Lindwurm', capture: true },
      suppressSeconds: 1,
      alertText: (_data, matches, output) => {
        const hdg = parseFloat(matches.heading);
        const dirNum = Directions.hdgTo16DirNum(hdg);
        const getNewDirNum = (
          dirNum: number,
          id: string,
        ): number => {
          switch (id) {
            case 'B521':
              return dirNum;
            case 'B522':
              return dirNum - 4;
            case 'B523':
              return dirNum - 8;
            case 'B524':
              return dirNum - 12;
          }
          throw new UnreachableCode();
        };

        // Adding 16 incase of negative values
        const newDirNum = (getNewDirNum(dirNum, matches.id) + 16 + 8) % 16;

        const dir = Directions.output16Dir[newDirNum] ?? 'unknown';
        return output.getBehindDir!({
          dir: output[dir]!(),
          mech: output.getBehind!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        getBehind: Outputs.getBehind,
        getBehindDir: {
          en: '${dir}: ${mech}',
        },
      },
    },
    {
      id: 'R12S Esoteric Finisher',
      // After Double Sobat 2, boss hits targets highest emnity target, second targets second highest
      type: 'StartsUsing',
      netRegex: { id: 'B525', source: 'Lindwurm', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankBusterCleaves: Outputs.tankBusterCleaves,
          avoidTankCleaves: Outputs.avoidTankCleaves,
        };

        if (data.role === 'tank' || data.role === 'healer') {
          if (data.role === 'healer')
            return { infoText: output.tankBusterCleaves!() };
          return { alertText: output.tankBusterCleaves!() };
        }
        return { infoText: output.avoidTankCleaves!() };
      },
    },
    {
      id: 'R12S Replication 2 Tethered Clone',
      // Combatants are added ~4s before Staging starts casting
      // Same tether ID is used for "locked" ability tethers
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.cloneTether!();

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';
        return output.cloneTetherDir!({ dir: output[dir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cloneTether: {
          en: 'Tethered to Clone',
        },
        cloneTetherDir: {
          en: 'Tethered to ${dir} Clone',
        },
      },
    },
    {
      id: 'R12S Replication 2 and Replication 4 Ability Tethers Collect',
      // Record and store a map of where the tethers come from and what they do for later
      // Boss tether handled separately since boss can move around
      type: 'Tether',
      netRegex: {
        id: [
          headMarkerData['projectionTether'],
          headMarkerData['manaBurstTether'],
          headMarkerData['heavySlamTether'],
        ],
        capture: true,
      },
      condition: (data) => {
        if (data.phase === 'replication2' || data.phase === 'idyllic')
          return true;
        return false;
      },
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return;
        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        if (data.phase === 'replication2')
          data.replication2TetherMap[dirNum] = matches.id;
        if (data.phase === 'idyllic')
          data.replication4DirNumAbility[dirNum] = matches.id;
      },
    },
    {
      id: 'R12S Replication 2 Ability Tethers Initial Call',
      // Occur ~8s after end of Replication 2 cast
      type: 'Tether',
      netRegex: {
        id: [
          headMarkerData['projectionTether'],
          headMarkerData['manaBurstTether'],
          headMarkerData['heavySlamTether'],
          headMarkerData['fireballSplashTether'],
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 9999, // Can get spammy if players have more than 1 tether or swap a lot
      infoText: (data, matches, output) => {
        if (matches.id === headMarkerData['fireballSplashTether'])
          return output.fireballSplashTether!();

        // Get direction of the tether
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          switch (matches.id) {
            case headMarkerData['projectionTether']:
              return output.projectionTether!();
            case headMarkerData['manaBurstTether']:
              return output.manaBurstTether!();
            case headMarkerData['heavySlamTether']:
              return output.heavySlamTether!();
          }
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        switch (matches.id) {
          case headMarkerData['projectionTether']:
            return output.projectionTetherDir!({ dir: output[dir]!() });
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTetherDir!({ dir: output[dir]!() });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTetherDir!({ dir: output[dir]!() });
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        projectionTether: {
          en: 'Cone Tether on YOU',
        },
        projectionTetherDir: {
          en: '${dir} Cone Tether on YOU',
        },
        manaBurstTether: {
          en: 'Defamation Tether on YOU',
        },
        manaBurstTetherDir: {
          en: '${dir} Defamation Tether on YOU',
        },
        heavySlamTether: {
          en: 'Stack Tether on YOU',
        },
        heavySlamTetherDir: {
          en: '${dir} Stack Tether on YOU',
        },
        fireballSplashTether: {
          en: 'Boss Tether on YOU',
        },
      },
    },
    {
      id: 'R12S Replication 2 Locked Tether 2 Collect',
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data, matches) => {
        if (
          data.phase === 'replication2' &&
          data.replicationCounter === 2 &&
          data.me === matches.target
        )
          return true;
        return false;
      },
      run: (data, matches) => {
        // Check if boss tether
        if (data.replication2BossId === matches.sourceId) {
          data.myReplication2Tether = headMarkerData['fireballSplashTether'];
          return;
        }

        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          // Setting to use that we know we have a tether but couldn't determine what ability it is
          data.myReplication2Tether = 'unknown';
          return;
        }

        const dirNum = Directions.xyTo8DirNum(
          actor.x,
          actor.y,
          center.x,
          center.y,
        );

        // Lookup what the tether was at the same location
        const ability = data.replication2TetherMap[dirNum];
        if (ability === undefined) {
          // Setting to use that we know we have a tether but couldn't determine what ability it is
          data.myReplication2Tether = 'unknown';
          return;
        }
        data.myReplication2Tether = ability;
      },
    },
    {
      id: 'R12S Replication 2 Locked Tether 2',
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data, matches) => {
        if (
          data.phase === 'replication2' &&
          data.replicationCounter === 2 &&
          data.me === matches.target
        )
          return true;
        return false;
      },
      delaySeconds: 0.1,
      infoText: (data, matches, output) => {
        // Check if it's the boss
        if (data.replication2BossId === matches.sourceId)
          return output.fireballSplashTether!({
            mech1: output.baitJump!(),
          });

        // Get direction of the tether
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          switch (data.myReplication2Tether) {
            case headMarkerData['projectionTether']:
              return output.projectionTether!({
                mech1: output.baitProtean!(),
              });
            case headMarkerData['manaBurstTether']:
              return output.manaBurstTether!({
                mech1: output.defamationOnYou!(),
              });
            case headMarkerData['heavySlamTether']:
              return output.heavySlamTether!({
                mech1: output.baitProtean!(),
              });
          }
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        switch (data.myReplication2Tether) {
          case headMarkerData['projectionTether']:
            return output.projectionTetherDir!({
              dir: output[dir]!(),
              mech1: output.baitProtean!(),
            });
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTetherDir!({
              dir: output[dir]!(),
              mech1: output.defamationOnYou!(),
            });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTetherDir!({
              dir: output[dir]!(),
              mech1: output.baitProtean!(),
            });
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        defamationOnYou: Outputs.defamationOnYou,
        baitProtean: {
          en: 'Bait Protean from Boss',
        },
        baitJump: {
          en: 'Bait Jump',
        },
        projectionTetherDir: {
          en: '${dir} Cone Tether: ${mech1}',
        },
        projectionTether: {
          en: 'Cone Tether: ${mech1}',
        },
        manaBurstTetherDir: {
          en: '${dir} Defamation Tether: ${mech1}',
        },
        manaBurstTether: {
          en: 'Defamation Tether: ${mech1}',
        },
        heavySlamTetherDir: {
          en: '${dir} Stack Tether: ${mech1}',
        },
        heavySlamTether: {
          en: 'Stack Tether: ${mech1}',
        },
        fireballSplashTether: {
          en: 'Boss Tether: ${mech1}',
        },
      },
    },
    {
      id: 'R12S Replication 2 Mana Burst Target',
      // A player without a tether will be target for defamation
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: false },
      condition: (data) => {
        if (data.phase === 'replication2' && data.replicationCounter === 2)
          return true;
        return false;
      },
      delaySeconds: 0.2,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.myReplication2Tether !== undefined)
          return;
        return output.noTether!({
          mech1: output.defamationOnYou!(),
          mech2: output.stackGroups!(),
        });
      },
      outputStrings: {
        defamationOnYou: Outputs.defamationOnYou,
        stackGroups: {
          en: 'Stack Groups',
          de: 'Gruppen-Sammeln',
          fr: 'Package en groupes',
          ja: '組み分け頭割り',
          cn: '分组分摊',
          ko: '그룹별 쉐어',
          tc: '分組分攤',
        },
        noTether: {
          en: 'No Tether: ${mech1} => ${mech2}',
        },
      },
    },
    {
      id: 'R12S Heavy Slam',
      // After B4E7 Mana Burst, Groups must stack up on the heavy slam targetted players
      type: 'Ability',
      netRegex: { id: 'B4E7', source: 'Lindwurm', capture: false },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        const ability = data.myReplication2Tether;
        switch (ability) {
          case headMarkerData['projectionTether']:
            return output.projectionTether!({
              mech1: output.stackGroups!(),
              mech2: output.lookAway!(),
              mech3: output.getBehind!(),
            });
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTether!({
              mech1: output.stackGroups!(),
              mech2: output.getBehind!(),
            });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTether!({
              mech1: output.stackGroups!(),
              mech2: output.getBehind!(),
            });
          case headMarkerData['fireballSplashTether']:
            return output.fireballSplashTether!({
              mech1: output.stackGroups!(),
              mech2: output.getBehind!(),
            });
        }
        return output.noTether!({
          mech1: output.stackGroups!(),
          mech2: output.getBehind!(),
        });
      },
      outputStrings: {
        getBehind: Outputs.getBehind,
        lookAway: Outputs.lookAway,
        stackGroups: {
          en: 'Stack Groups',
          de: 'Gruppen-Sammeln',
          fr: 'Package en groupes',
          ja: '組み分け頭割り',
          cn: '分组分摊',
          ko: '그룹별 쉐어',
          tc: '分組分攤',
        },
        stackOnYou: Outputs.stackOnYou,
        projectionTether: {
          en: '${mech1} + ${mech2} => ${mech3}',
        },
        manaBurstTether: {
          en: '${mech1} => ${mech2}',
        },
        heavySlamTether: {
          en: '${mech1} => ${mech2}',
        },
        fireballSplashTether: {
          en: '${mech1} => ${mech2}',
        },
        noTether: {
          en: '${mech1} => ${mech2}',
        },
      },
    },
    {
      id: 'R12S Grotesquerie',
      // This seems to be the point at which the look for the Snaking Kick is snapshot
      // The VFX B4E9 happens ~0.6s before Snaking Kick
      // B4EA has the targetted player in it
      // B4EB Hemorrhagic Projection conal aoe goes off ~0.5s after in the direction the player was facing
      type: 'Ability',
      netRegex: { id: 'B4EA', source: 'Lindwurm', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (data, _matches, output) => {
        // Get Boss facing
        const bossId = data.replication2BossId;
        if (bossId === undefined)
          return output.getBehind!();

        const actor = data.actorPositions[bossId];
        if (actor === undefined)
          return output.getBehind!();

        const dirNum = (Directions.hdgTo16DirNum(actor.heading) + 8) % 16;
        const dir = Directions.output16Dir[dirNum] ?? 'unknown';
        return output.getBehindDir!({
          dir: output[dir]!(),
          mech: output.getBehind!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings16Dir,
        getBehind: Outputs.getBehind,
        getBehindDir: {
          en: '${dir}: ${mech}',
        },
      },
    },
    {
      id: 'R12S Netherwrath Near/Far',
      // Boss jumps onto clone of player that took Firefall Splash, there is an aoe around the clone + proteans
      type: 'StartsUsing',
      netRegex: { id: ['B52E', 'B52F'], source: 'Lindwurm', capture: true },
      infoText: (data, matches, output) => {
        const ability = data.myReplication2Tether;
        const isNear = matches.id === 'B52E';

        if (isNear) {
          switch (ability) {
            case headMarkerData['projectionTether']:
              return output.projectionTetherNear!({
                proteanBaits: output.beFar!(),
                mech1: output.scaldingWave!(),
                mech2: output.stacks!(),
                spiteBaits: output.near!(),
              });
            case headMarkerData['manaBurstTether']:
              return output.manaBurstTetherNear!({
                spiteBaits: output.beNear!(),
                mech1: output.timelessSpite!(),
                mech2: output.proteans!(),
                proteanBaits: output.far!(),
              });
            case headMarkerData['heavySlamTether']:
              return output.heavySlamTetherNear!({
                proteanBaits: output.beFar!(),
                mech1: output.scaldingWave!(),
                mech2: output.stacks!(),
                spiteBaits: output.near!(),
              });
            case headMarkerData['fireballSplashTether']:
              return output.fireballSplashTetherNear!({
                spiteBaits: output.beNear!(),
                mech1: output.timelessSpite!(),
                mech2: output.proteans!(),
                proteanBaits: output.far!(),
              });
          }
          return output.noTetherNear!({
            spiteBaits: output.beNear!(),
            mech1: output.timelessSpite!(),
            mech2: output.proteans!(),
            proteanBaits: output.far!(),
          });
        }

        // Netherwrath Far
        switch (ability) {
          case headMarkerData['projectionTether']:
            return output.projectionTetherFar!({
              proteanBaits: output.beNear!(),
              mech1: output.scaldingWave!(),
              mech2: output.stacks!(),
              spiteBaits: output.far!(),
            });
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTetherFar!({
              spiteBaits: output.beFar!(),
              mech1: output.timelessSpite!(),
              mech2: output.proteans!(),
              proteanBaits: output.near!(),
            });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTetherFar!({
              proteanBaits: output.beNear!(),
              mech1: output.scaldingWave!(),
              mech2: output.stacks!(),
              spiteBaits: output.far!(),
            });
          case headMarkerData['fireballSplashTether']:
            return output.fireballSplashTetherFar!({
              spiteBaits: output.beFar!(),
              mech1: output.timelessSpite!(),
              mech2: output.proteans!(),
              proteanBaits: output.near!(),
            });
        }
        return output.noTetherFar!({
          spiteBaits: output.beFar!(),
          mech1: output.timelessSpite!(),
          mech2: output.proteans!(),
          proteanBaits: output.near!(),
        });
      },
      outputStrings: {
        scaldingWave: Outputs.protean,
        timelessSpite: Outputs.stackPartner,
        stacks: Outputs.stacks,
        proteans: {
          en: 'Proteans',
        },
        beNear: {
          en: 'Be Near',
        },
        beFar: {
          en: 'Be Far',
        },
        near: {
          en: 'Near',
          de: 'Nah',
          fr: 'Proche',
          cn: '近',
          ko: '가까이',
        },
        far: {
          en: 'Far',
          de: 'Fern',
          fr: 'Loin',
          cn: '远',
          ko: '멀리',
        },
        projectionTetherFar: {
          en: '${proteanBaits} + ${mech1} (${mech2} ${spiteBaits})',
        },
        manaBurstTetherFar: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
        heavySlamTetherFar: {
          en: '${proteanBaits} + ${mech1} (${mech2} ${spiteBaits})',
        },
        fireballSplashTetherFar: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
        noTetherFar: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
        projectionTetherNear: {
          en: '${proteanBaits} + ${mech1} (${mech2} ${spiteBaits})',
        },
        manaBurstTetherNear: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
        heavySlamTetherNear: {
          en: '${proteanBaits} + ${mech1} (${mech2} ${spiteBaits})',
        },
        fireballSplashTetherNear: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
        noTetherNear: {
          en: '${spiteBaits} + ${mech1} (${mech2} ${proteanBaits})',
        },
      },
    },
    {
      id: 'R12S Reenactment 1 Scalding Waves Collect',
      // Players need to wait for BBE3 Mana Burst Defamations on the clones to complete before next mechanic
      // NOTE: This is used with DN Strategy
      type: 'Ability',
      netRegex: { id: 'B8E1', source: 'Lindwurm', capture: false },
      condition: (data) => data.phase === 'reenactment1',
      suppressSeconds: 9999,
      run: (data) => data.netherwrathFollowup = true,
    },
    {
      id: 'R12S Reenactment 1 Clone Stacks',
      // Players need to wait for BBE3 Mana Burst defamations on clones to complete
      // This happens three times during reenactment and the third one (which is after the proteans) is the trigger
      // NOTE: This is used with DN Strategy
      type: 'Ability',
      netRegex: { id: 'BBE3', source: 'Lindwurm', capture: false },
      condition: (data) => data.netherwrathFollowup,
      suppressSeconds: 9999,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'East/West Clone Stacks',
        },
      },
    },
    {
      id: 'R12S Reenactment 1 Final Defamation Dodge Reminder',
      // Players need to run back to north after clone stacks (BE5D Heavy Slam)
      // The clone stacks become a defamation and the other a cleave going East or West through the room
      // NOTE: This is used with DN Strategy
      type: 'Ability',
      netRegex: { id: 'BE5D', source: 'Lindwurm', capture: false },
      condition: (data) => data.netherwrathFollowup,
      suppressSeconds: 9999,
      alertText: (_data, _matches, output) => output.north!(),
      outputStrings: {
        north: Outputs.north,
      },
    },
    {
      id: 'R12S Mana Sphere Collect and Label',
      // Combatants Spawn ~3s before B505 Mutating Cells startsUsing
      // Their positions are available at B4FD in the 264 AbilityExtra lines and updated periodically after with 270 lines
      // 19208 => Lightning Bowtie (N/S Cleave)
      // 19209 => Fire Bowtie (E/W Cleave)
      // 19205 => Black Hole
      // 19206 => Water Sphere/Chariot
      // 19207 => Wind Donut
      // Position at add is center, so not useful here yet
      type: 'AddedCombatant',
      netRegex: { name: 'Mana Sphere', capture: true },
      run: (data, matches) => {
        const id = matches.id;
        const npcBaseId = parseInt(matches.npcBaseId);
        switch (npcBaseId) {
          case 19205:
            data.manaSpheres[id] = 'blackHole';
            return;
          case 19206:
            data.manaSpheres[id] = 'water';
            return;
          case 19207:
            data.manaSpheres[id] = 'wind';
            return;
          case 19208:
            data.manaSpheres[id] = 'lightning';
            return;
          case 19209:
            data.manaSpheres[id] = 'fire';
            return;
        }
      },
    },
    {
      id: 'R12S Mutation α/β Collect',
      // Used in Blood Mana / Blood Awakening Mechanics
      // 12A1 Mutation α: Don't get hit
      // 12A3 Mutation β: Get Hit
      // Players will get opposite debuff after Blood Mana
      type: 'GainsEffect',
      netRegex: { effectId: ['12A1', '12A3'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.myMutation = matches.effectId === '12A1' ? 'alpha' : 'beta';
      },
    },
    {
      id: 'R12S Mutation α/β',
      type: 'GainsEffect',
      netRegex: { effectId: ['12A1', '12A3'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        if (matches.effectId === '12A1')
          return output.alpha!();
        return output.beta!();
      },
      outputStrings: {
        alpha: {
          en: 'Mutation α on YOU',
        },
        beta: {
          en: 'Mutation β on YOU',
        },
      },
    },
    {
      id: 'R12S Mana Sphere Position Collect',
      // BCB0 Black Holes:
      // These are (90, 100) and (110, 100)
      // B4FD Shapes
      // Side that needs to be exploded will have pairs with 2 of the same x or y coords
      // Side to get the shapes to explode will be closest distance to black hole
      type: 'AbilityExtra',
      netRegex: { id: 'B4FD', capture: true },
      run: (data, matches) => {
        // Calculate Distance to Black Hole
        const getDistance = (
          x: number,
          y: number,
        ): number => {
          const blackHoleX = x < 100 ? 90 : 110;
          const dx = x - blackHoleX;
          const dy = y - 100;
          return Math.round(Math.sqrt(dx * dx + dy * dy));
        };
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const d = getDistance(x, y);
        const id = matches.sourceId;

        // Put into different objects for easier lookup
        if (x < 100) {
          data.westManaSpheres[id] = { x: x, y: y };
        }
        data.eastManaSpheres[id] = { x: x, y: y };

        // Shapes with 6 distance are close, Shapes with 12 are far
        if (d < 7) {
          data.closeManaSphereIds.push(id);

          // Have enough data to solve at this point
          if (data.closeManaSphereIds.length === 2) {
            const popSide = x < 100 ? 'east' : 'west';
            data.manaSpherePopSide = popSide;

            const sphereId1 = data.closeManaSphereIds[0];
            const sphereId2 = id;
            if (sphereId1 === undefined)
              return;

            const sphereType1 = data.manaSpheres[sphereId1];
            const sphereType2 = data.manaSpheres[sphereId2];
            if (sphereType1 === undefined || sphereType2 === undefined)
              return;

            // If you see Water, pop side first
            // If you see Wind, non-pop side
            // Can't be Lightning + Wind because Fire hits the donut
            // Fire + Lightning would hit whole room
            // Water + Wind would hit whole room
            const nonPopSide = popSide === 'east' ? 'west' : 'east';
            const first = [sphereType1, sphereType2];
            const dir2 = first.includes('water') ? popSide : nonPopSide;
            data.firstBlackHole = dir2;
          }
        }
      },
    },
    {
      id: 'R12S Black Hole and Shapes',
      // Black Holes and shapes
      type: 'Ability',
      netRegex: { id: 'B4FD', source: 'Mana Sphere', capture: false },
      delaySeconds: 0.1,
      durationSeconds: 8.3,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        const popSide = data.manaSpherePopSide;
        const blackHole = data.firstBlackHole;
        const sphereId1 = data.closeManaSphereIds[0];
        const sphereId2 = data.closeManaSphereIds[1];
        if (
          popSide === undefined ||
          blackHole === undefined ||
          sphereId1 === undefined ||
          sphereId2 === undefined
        )
          return data.myMutation === 'alpha' ? output.alpha!() : output.beta!();

        const sphereType1 = data.manaSpheres[sphereId1];
        const sphereType2 = data.manaSpheres[sphereId2];
        if (sphereType1 === undefined || sphereType2 === undefined)
          return data.myMutation === 'alpha' ? output.alpha!() : output.beta!();

        if (data.myMutation === 'alpha')
          return output.alphaDir!({
            dir1: output[popSide]!(),
            northSouth: output.northSouth!(),
            dir2: output[blackHole]!(),
          });
        return output.betaDir!({
          dir1: output[popSide]!(),
          shape1: output[sphereType1]!(),
          shape2: output[sphereType2]!(),
          northSouth: output.northSouth!(),
          dir2: output[blackHole]!(),
        });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        northSouth: {
          en: 'N/S',
          de: 'N/S',
          fr: 'N/S',
          ja: '南/北',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        water: {
          en: 'Orb',
        },
        lightning: {
          en: 'Lightning',
        },
        fire: {
          en: 'Fire',
        },
        wind: {
          en: 'Donut',
        },
        alpha: {
          en: 'Avoid Shape AoEs, Wait by Black Hole',
        },
        beta: {
          en: 'Shared Shape Soak => Get by Black Hole',
        },
        alphaDir: {
          en: 'Avoid ${dir1} Shape AoEs => ${dir2} Black Hole + ${northSouth}',
        },
        betaDir: {
          en: 'Share ${dir1} ${shape1}/${shape2} => ${dir2} Black Hole + ${northSouth}',
        },
      },
    },
    {
      id: 'R12S Dramatic Lysis Black Hole 1 Reminder',
      // This may not happen if all shapes are failed
      type: 'Ability',
      netRegex: { id: ['B507'], source: 'Lindwurm', capture: false },
      suppressSeconds: 9999,
      alertText: (data, _matches, output) => {
        const blackHole = data.firstBlackHole;
        if (blackHole === undefined)
          return data.myMutation === 'alpha' ? output.alpha!() : output.beta!();
        return data.myMutation === 'alpha'
          ? output.alphaDir!({
            northSouth: output.northSouth!(),
            dir2: output[blackHole]!(),
          })
          : output.betaDir!({
            northSouth: output.northSouth!(),
            dir2: output[blackHole]!(),
          });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        northSouth: {
          en: 'N/S',
          de: 'N/S',
          fr: 'N/S',
          ja: '南/北',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        alpha: {
          en: 'Get by Black Hole',
        },
        beta: {
          en: 'Get by Black Hole',
        },
        alphaDir: {
          en: '${dir2} Black Hole + ${northSouth}',
        },
        betaDir: {
          en: '${dir2} Black Hole + ${northSouth}',
        },
      },
    },
    {
      id: 'R12S Blood Wakening Followup',
      // Run to the other Black Hole after abilities go off
      // B501 Lindwurm's Water III
      // B502 Lindwurm's Aero III
      // B503 Straightforward Thunder II
      // B504 Sideways Fire II
      type: 'Ability',
      netRegex: { id: ['B501', 'B502', 'B503', 'B504'], source: 'Lindwurm', capture: false },
      suppressSeconds: 9999,
      alertText: (data, _matches, output) => {
        const blackHole = data.firstBlackHole;
        if (blackHole === undefined)
          return output.move!();
        const next = blackHole === 'east' ? 'west' : 'east';
        return output.moveDir!({
          northSouth: output.northSouth!(),
          dir: output[next]!(),
        });
      },
      outputStrings: {
        east: Outputs.east,
        west: Outputs.west,
        northSouth: {
          en: 'N/S',
          de: 'N/S',
          fr: 'N/S',
          ja: '南/北',
          cn: '上/下',
          ko: '남/북',
          tc: '上/下',
        },
        move: {
          en: 'Move to other Black Hole',
        },
        moveDir: {
          en: '${dir} Black Hole + ${northSouth}',
        },
      },
    },
    {
      id: 'R12S Netherworld Near/Far',
      type: 'StartsUsing',
      netRegex: { id: ['B52B', 'B52C'], source: 'Lindwurm', capture: true },
      alertText: (data, matches, output) => {
        if (matches.id === 'B52B')
          return data.myMutation === 'beta'
            ? output.betaNear!({ mech: output.getUnder!() })
            : output.alphaNear!({ mech: output.maxMelee!() });
        return data.myMutation === 'beta'
          ? output.betaFar!({ mech: output.maxMelee!() })
          : output.alphaFar!({ mech: output.getUnder!() });
      },
      outputStrings: {
        getUnder: Outputs.getUnder,
        maxMelee: {
          en: 'Max Melee',
        },
        alphaNear: {
          en: '${mech} (Avoid Near Stack)',
        },
        alphaFar: {
          en: '${mech} (Avoid Far Stack)',
        },
        betaNear: {
          en: 'Near β Stack: ${mech}',
        },
        betaFar: {
          en: 'Far β Stack: ${mech}',
        },
      },
    },
    {
      id: 'R12S Idyllic Dream',
      type: 'StartsUsing',
      netRegex: { id: 'B509', source: 'Lindwurm', capture: false },
      durationSeconds: 4.7,
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'R12S Idyllic Dream Replication Clone Order Collect',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: '11D2', capture: true },
      condition: (data) => {
        if (data.phase === 'idyllic' && data.replicationCounter === 2)
          return true;
        return false;
      },
      run: (data, matches) => {
        const actor = data.actorPositions[matches.id];
        if (actor === undefined)
          return;
        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        data.replication3CloneOrder.push(dirNum);
      },
    },
    {
      id: 'R12S Idyllic Dream Replication First Clone Cardinal/Intercardinal',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: '11D2', capture: true },
      condition: (data) => {
        if (data.phase === 'idyllic' && data.replicationCounter === 2)
          return true;
        return false;
      },
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.id];
        if (actor === undefined)
          return;

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        if (isCardinalDir(dir))
          return output.firstClone!({ cards: output.cardinals!() });
        if (isIntercardDir(dir))
          return output.firstClone!({ cards: output.intercards!() });
        return output.firstClone!({ cards: output.unknown!() });
      },
      outputStrings: {
        unknown: Outputs.unknown,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        firstClone: {
          en: 'First Clone: ${cards}',
        },
      },
    },
    {
      id: 'R12S Idyllic Dream Staging 2 Tethered Clone Collect',
      // Map the locations to a player name
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data) => {
        if (
          data.phase === 'idyllic' &&
          data.replicationCounter === 2
        )
          return true;
        return false;
      },
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return;

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        data.replication3CloneDirNumPlayers[dirNum] = matches.target;
      },
    },
    {
      id: 'R12S Idyllic Dream Staging 2 Tethered Clone',
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data, matches) => {
        if (
          data.phase === 'idyllic' &&
          data.replicationCounter === 2 &&
          data.me === matches.target
        )
          return true;
        return false;
      },
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.cloneTether!();

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';
        return output.cloneTetherDir!({ dir: output[dir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cloneTether: {
          en: 'Tethered to Clone',
        },
        cloneTetherDir: {
          en: 'Tethered to ${dir} Clone',
        },
      },
    },
    {
      id: 'R12S Idyllic Dream Power Gusher Collect',
      // Need to know this for later
      // B511 Snaking Kick
      // B512 from boss is the VFX and has headings that show directions for B50F and B510
      // B50F Power Gusher is the East/West caster
      // B510 Power Gusher is the North/South caster
      // Right now just the B510 caster is needed to resolve
      type: 'StartsUsing',
      netRegex: { id: 'B510', source: 'Lindschrat', capture: true },
      run: (data, matches) => {
        const y = parseFloat(matches.y);
        data.idyllicVision2NorthSouthCleaveSpot = y < center.y ? 'north' : 'south';
      },
    },
    {
      id: 'R12S Idyllic Dream Power Gusher Vision',
      // Call where the E/W safe spots will be later
      type: 'StartsUsing',
      netRegex: { id: 'B510', source: 'Lindschrat', capture: true },
      infoText: (_data, matches, output) => {
        const y = parseFloat(matches.y);
        const dir = y < center.y ? 'north' : 'south';
        return output.text!({ dir: output[dir]!(), sides: output.sides!() });
      },
      outputStrings: {
        north: Outputs.north,
        south: Outputs.south,
        sides: Outputs.sides,
        text: {
          en: '${dir} + ${sides} (later)',
        },
      },
    },
    {
      id: 'R12S Replication 4 Ability Tethers Initial Call',
      type: 'Tether',
      netRegex: {
        id: [
          headMarkerData['manaBurstTether'],
          headMarkerData['heavySlamTether'],
        ],
        capture: true,
      },
      condition: (data, matches) => {
        if (data.me === matches.target && data.phase === 'idyllic')
          return true;
        return false;
      },
      suppressSeconds: 9999, // Can get spammy if players have more than 1 tether or swap a lot
      infoText: (data, matches, output) => {
        // Get direction of the tether
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined) {
          switch (matches.id) {
            case headMarkerData['manaBurstTether']:
              return output.manaBurstTether!();
            case headMarkerData['heavySlamTether']:
              return output.heavySlamTether!();
          }
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        switch (matches.id) {
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTetherDir!({ dir: output[dir]!() });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTetherDir!({ dir: output[dir]!() });
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        manaBurstTether: {
          en: 'Defamation Tether on YOU',
        },
        manaBurstTetherDir: {
          en: '${dir} Defamation Tether on YOU',
        },
        heavySlamTether: {
          en: 'Stack Tether on YOU',
        },
        heavySlamTetherDir: {
          en: '${dir} Stack Tether on YOU',
        },
      },
    },
    {
      id: 'R12S Replication 4 Locked Tether 2 Collect',
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data) => {
        if (
          data.phase === 'idyllic' &&
          data.replicationCounter === 4
        )
          return true;
        return false;
      },
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        const target = matches.target;
        if (actor === undefined) {
          // Setting to use that we know we have a tether but couldn't determine what ability it is
          if (data.me === target)
            data.replication4PlayerAbilities[target] = 'unknown';
          return;
        }

        const dirNum = Directions.xyTo8DirNum(
          actor.x,
          actor.y,
          center.x,
          center.y,
        );

        // Lookup what the tether was at the same location
        const ability = data.replication4DirNumAbility[dirNum];
        if (ability === undefined) {
          // Setting to use that we know we have a tether but couldn't determine what ability it is
          data.replication4PlayerAbilities[target] = 'unknown';
          return;
        }
        data.replication4PlayerAbilities[target] = ability;

        // Create ability order once we have all 8 players
        // If players had more than one tether previously, the extra tethers are randomly assigned
        if (Object.keys(data.replication4PlayerAbilities).length === 8) {
          const abilities = data.replication4PlayerAbilities;
          const order = data.replication3CloneOrder; // Order in which clones spawned
          const players = data.replication3CloneDirNumPlayers; // Direction of player's clone

          // Mechanics are resolved clockwise, get create order based on cards/inters
          const first = order[0];
          if (first === undefined)
            return;
          const dirNumOrder = first % 2 === 0 ? [0, 2, 4, 6, 1, 3, 5, 7] : [1, 3, 5, 7, 0, 2, 4, 6];
          for (const dirNum of dirNumOrder) {
            const player = players[dirNum] ?? 'unknown';
            const ability = abilities[player] ?? 'unknown';
            data.replication4PlayerOrder.push(player);
            data.replication4AbilityOrder.push(ability);
          }
        }
      },
    },
    {
      id: 'R12S Replication 4 Locked Tether 2',
      // At this point the player needs to dodge the north/south cleaves + chariot
      // Simultaneously there will be a B4F2 Lindwurm's Meteor bigAoe that ends with room split
      type: 'Tether',
      netRegex: { id: headMarkerData['lockedTether'], capture: true },
      condition: (data, matches) => {
        if (
          data.phase === 'idyllic' &&
          data.twistedVisionCounter === 3 &&
          data.me === matches.target
        )
          return true;
        return false;
      },
      delaySeconds: 0.1,
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const meteorAoe = output.meteorAoe!({
          bigAoe: output.bigAoe!(),
          groups: output.healerGroups!(),
        });
        const cleaveOrigin = data.idyllicVision2NorthSouthCleaveSpot;
        const myAbility = data.replication4PlayerAbilities[data.me];
        // Get direction of the tether
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined || cleaveOrigin === undefined) {
          switch (myAbility) {
            case headMarkerData['manaBurstTether']:
              return output.manaBurstTether!({ meteorAoe: meteorAoe });
            case headMarkerData['heavySlamTether']:
              return output.heavySlamTether!({ meteorAoe: meteorAoe });
          }
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        const dodge = output.dodgeCleaves!({
          dir: output[cleaveOrigin]!(),
          sides: output.sides!(),
        });

        switch (myAbility) {
          case headMarkerData['manaBurstTether']:
            return output.manaBurstTetherDir!({
              dir: output[dir]!(),
              dodgeCleaves: dodge,
              meteorAoe: meteorAoe,
            });
          case headMarkerData['heavySlamTether']:
            return output.heavySlamTetherDir!({
              dir: output[dir]!(),
              dodgeCleaves: dodge,
              meteorAoe: meteorAoe,
            });
        }
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        north: Outputs.north,
        south: Outputs.south,
        sides: Outputs.sides,
        bigAoe: Outputs.bigAoe,
        healerGroups: Outputs.healerGroups,
        meteorAoe: {
          en: '${bigAoe} + ${groups}',
        },
        dodgeCleaves: {
          en: '${dir} + ${sides}',
        },
        manaBurstTetherDir: {
          en: '${dodgeCleaves} (${dir} Defamation Tether)  => ${meteorAoe}',
        },
        manaBurstTether: {
          en: ' N/S Clone (Defamation Tether) => ${meteorAoe}',
        },
        heavySlamTetherDir: {
          en: '${dodgeCleaves} (${dir} Stack Tether)  => ${meteorAoe}',
        },
        heavySlamTether: {
          en: ' N/S Clone (Stack Tether) => ${meteorAoe}',
        },
      },
    },
    {
      id: 'R12S Arcadian Arcanum',
      // Players hit will receive 1044 Light Resistance Down II debuff
      type: 'StartsUsing',
      netRegex: { id: 'B529', source: 'Lindwurm', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'R12S Light Resistance Down II',
      type: 'GainsEffect',
      netRegex: { effectId: '1044', capture: true },
      condition: (data, matches) => {
        if (data.twistedVisionCounter === 3 && data.me === matches.target)
          return true;
        return false;
      },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Soak Fire/Earth Meteor (later)',
        },
      },
    },
    {
      id: 'R12S No Light Resistance Down II',
      type: 'GainsEffect',
      netRegex: { effectId: '1044', capture: false },
      condition: (data) => data.twistedVisionCounter === 3,
      delaySeconds: 0.1,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        if (!data.hasLightResistanceDown)
          return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Soak a White/Star Meteor (later)',
        },
      },
    },
    {
      id: 'R12S Twisted Vision 4 Stack/Defamation 1',
      type: 'StartsUsing',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: false },
      condition: (data) => data.twistedVisionCounter === 4,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          ...Directions.outputStrings8Dir,
          stacks: Outputs.stacks,
          avoidDefamation: {
            en: 'Avoid Defamation',
          },
          avoidStack: {
            en: 'Avoid Stack',
            de: 'Vermeide Sammeln',
            fr: 'Évitez le package',
            cn: '远离分摊',
            ko: '쉐어징 피하기',
            tc: '遠離分攤',
          },
          defamationOnYou: Outputs.defamationOnYou,
          stackOnYou: Outputs.stackOnYou,
          stackOnPlayer: Outputs.stackOnPlayer,
          defamations: {
            en: 'Defamations',
            de: 'Große AoE auf dir',
            fr: 'Grosse AoE sur vous',
            ja: '自分に巨大な爆発',
            cn: '大圈点名',
            ko: '광역 대상자',
            tc: '大圈點名',
          },
          oneMechThenOne: {
            en: '${mech1} => ${mech2}',
          },
          oneMechThenTwo: {
            en: '${mech1} => ${mech2} + ${mech3}',
          },
          twoMechsThenOne: {
            en: '${mech1} + ${mech2} => ${mech3}',
          },
          twoMechsThenTwo: {
            en: '${mech1} + ${mech2} => ${mech3} + ${mech4}',
          },
        };
        const abilityOrder = data.replication4AbilityOrder;
        const playerOrder = data.replication4PlayerOrder;
        if (
          abilityOrder === undefined ||
          playerOrder === undefined
        )
          return;

        const ability1 = abilityOrder[0];
        const ability2 = abilityOrder[1];
        const player1 = playerOrder[0];
        const player2 = playerOrder[1];

        // Get Stack/Defamation #2 details
        const ability3 = abilityOrder[2];
        const ability4 = abilityOrder[3];
        const player3 = playerOrder[2];
        const player4 = playerOrder[3];

        // Handle some obscure strategies or mistakes
        const isThisSame = ability1 === ability2;
        const isNextSame = ability3 === ability4;
        const defamation = headMarkerData['manaBurstTether'];
        let this1;
        let this2;
        let next1;
        let next2;
        // Handle This Set
        if (player1 === data.me) {
          this1 = ability1 === defamation ? 'defamationOnYou' : 'stackOnYou';
          if (!isThisSame)
            this2 = ability2 === defamation ? 'avoidDefamation' : 'avoidStack';
        } else if (player2 === data.me) {
          if (!isThisSame) {
            this1 = ability1 === defamation ? 'avoidDefamation' : 'avoidStack';
            this2 = ability2 === defamation ? 'defamationOnYou' : 'stackOnYou';
          } else {
            this1 = ability1 === defamation ? 'defamationOnYou' : 'stackOnYou';
          }
        } else if (isThisSame) {
          this1 = ability1 === defamation ? 'defamations' : 'stacks';
        } else if (!isThisSame) {
          this1 = ability1 === defamation ? 'avoidDefamation' : 'stack';
          this2 = ability2 === defamation ? 'avoidDefamation' : 'stack';
        }

        // Handle Next Set
        if (player3 === data.me) {
          next1 = ability3 === defamation ? 'defamationOnYou' : 'stackOnYou';
          if (!isThisSame)
            next2 = ability4 === defamation ? 'avoidDefamation' : 'avoidStack';
        } else if (player4 === data.me) {
          if (!isThisSame) {
            next1 = ability4 === defamation ? 'avoidDefamation' : 'avoidStack';
            next2 = ability4 === defamation ? 'defamationOnYou' : 'stackOnYou';
          } else {
            next1 = ability4 === defamation ? 'defamationOnYou' : 'stackOnYou';
          }
        } else if (isNextSame) {
          next1 = ability3 === defamation ? 'defamations' : 'stacks';
        } else if (!isNextSame) {
          next1 = ability3 === defamation ? 'avoidDefamation' : 'stack';
          next2 = ability4 === defamation ? 'avoidDefamation' : 'stack';
        }

        // Build output
        if (this1 === undefined || next1 === undefined)
          return;
        const text = (player1 === data.me || player2 === data.me) ? 'alertText' : 'infoText';
        if (isThisSame && isNextSame) {
          return {
            [text]: output.oneMechThenOne!({
              mech1: output[this1]!(),
              mech2: output[next1]!(),
            }),
          };
        }

        const shortPlayer3 = data.party.member(player3);
        const shortPlayer4 = data.party.member(player4);
        if (isThisSame && !isNextSame) {
          if (next2 === undefined)
            return;
          return {
            [text]: output.oneMechThenTwo!({
              mech1: output[this1]!(),
              mech2: next1 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer3 })
                : output[next1]!(),
              mech3: next2 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer4 })
                : output[next2]!(),
            }),
          };
        }

        const shortPlayer1 = data.party.member(player1);
        const shortPlayer2 = data.party.member(player2);
        if (!isThisSame && isNextSame) {
          if (this2 === undefined)
            return;
          return {
            [text]: output.twoMechsThenOne!({
              mech1: this1 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer1 })
                : output[this1]!(),
              mech2: this2 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer2 })
                : output[this2]!(),
              mech3: output[next1]!(),
            }),
          };
        }

        if (this2 === undefined || next2 === undefined)
          return;
        return {
          [text]: output.twoMechsThenTwo!({
            mech1: this1 === 'stack'
              ? output.stackOnPlayer!({ player: shortPlayer1 })
              : output[this1]!(),
            mech2: this2 === 'stack'
              ? output.stackOnPlayer!({ player: shortPlayer2 })
              : output[this2]!(),
            mech3: next1 === 'stack'
              ? output.stackOnPlayer!({ player: shortPlayer3 })
              : output[next1]!(),
            mech4: next2 === 'stack'
              ? output.stackOnPlayer!({ player: shortPlayer4 })
              : output[next2]!(),
          }),
        };
      },
    },
    {
      id: 'R12S Twisted Vision 4 Stack/Defamation 2-4',
      // Used for keeping of which Twisted Vision 4 mechanic we are on
      // Note: B519 Heavy Slam and B517 Mana Burst cast regardless of players alive
      //       A B4F0 Unmitigated Impact will occur should the stack be missed
      // Note2: B518 Mana Burst seems to not cast if the target is dead, and there doesn't seem to be repercussions
      type: 'Ability',
      netRegex: { id: ['B519', 'B517'], source: 'Lindschrat', capture: false },
      condition: (data) => data.twistedVisionCounter === 4 && data.twistedVision4MechCounter < 6,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          ...Directions.outputStrings8Dir,
          stacks: Outputs.stacks,
          towers: {
            en: 'Tower Positions',
            de: 'Turm Positionen',
            fr: 'Position tour',
            ja: '塔の位置へ',
            cn: '八人塔站位',
            ko: '기둥 자리잡기',
            tc: '八人塔站位',
          },
          avoidDefamation: {
            en: 'Avoid Defamation',
          },
          avoidStack: {
            en: 'Avoid Stack',
            de: 'Vermeide Sammeln',
            fr: 'Évitez le package',
            cn: '远离分摊',
            ko: '쉐어징 피하기',
            tc: '遠離分攤',
          },
          defamationOnYou: Outputs.defamationOnYou,
          stackOnYou: Outputs.stackOnYou,
          stackOnPlayer: Outputs.stackOnPlayer,
          defamations: {
            en: 'Defamations',
            de: 'Große AoE auf dir',
            fr: 'Grosse AoE sur vous',
            ja: '自分に巨大な爆発',
            cn: '大圈点名',
            ko: '광역 대상자',
            tc: '大圈點名',
          },
          oneMechThenOne: {
            en: '${mech1} => ${mech2}',
          },
          oneMechThenTwo: {
            en: '${mech1} => ${mech2} + ${mech3}',
          },
          twoMechsThenOne: {
            en: '${mech1} + ${mech2} => ${mech3}',
          },
          twoMechsThenTwo: {
            en: '${mech1} + ${mech2} => ${mech3} + ${mech4}',
          },
          oneMechThenTowers: {
            en: '${mech1} => ${towers}',
          },
          twoMechsThenTowers: {
            en: '${mech1} + ${mech2} => ${towers}',
          },
        };
        data.twistedVision4MechCounter = data.twistedVision4MechCounter + 2; // Mechanic is done in pairs
        // Don't output for first one as it was called 1s prior to this trigger
        if (data.twistedVision4MechCounter < 2)
          return;
        const count = data.twistedVision4MechCounter;
        const abilityOrder = data.replication4AbilityOrder;
        const playerOrder = data.replication4PlayerOrder;
        if (
          abilityOrder === undefined ||
          playerOrder === undefined
        )
          return;

        const ability1 = abilityOrder[0 + count];
        const ability2 = abilityOrder[1 + count];
        const player1 = playerOrder[0 + count];
        const player2 = playerOrder[1 + count];
        let this1;
        let this2;
        const defamation = headMarkerData['manaBurstTether'];
        const isThisSame = ability1 === ability2;
        const shortPlayer1 = data.party.member(player1);
        const shortPlayer2 = data.party.member(player2);
        const text = (player1 === data.me || player2 === data.me) ? 'alertText' : 'infoText';

        // Handle This Set
        if (player1 === data.me) {
          this1 = ability1 === defamation ? 'defamationOnYou' : 'stackOnYou';
          if (!isThisSame)
            this2 = ability2 === defamation ? 'avoidDefamation' : 'avoidStack';
        } else if (player2 === data.me) {
          if (!isThisSame) {
            this1 = ability1 === defamation ? 'avoidDefamation' : 'avoidStack';
            this2 = ability2 === defamation ? 'defamationOnYou' : 'stackOnYou';
          } else {
            this1 = ability1 === defamation ? 'defamationOnYou' : 'stackOnYou';
          }
        } else if (isThisSame) {
          this1 = ability1 === defamation ? 'defamations' : 'stacks';
        } else if (!isThisSame) {
          this1 = ability1 === defamation ? 'avoidDefamation' : 'stack';
          this2 = ability2 === defamation ? 'avoidDefamation' : 'stack';
        }

        if (count < 6) {
          // Handle next set
          // Get Stack/Defamation #2 details
          const ability3 = abilityOrder[2 + count];
          const ability4 = abilityOrder[3 + count];
          const player3 = playerOrder[2 + count];
          const player4 = playerOrder[3 + count];

          // Handle some obscure strategies or mistakes
          const isNextSame = ability3 === ability4;
          let next1;
          let next2;

          if (player3 === data.me) {
            next1 = ability3 === defamation ? 'defamationOnYou' : 'stackOnYou';
            if (!isThisSame)
              next2 = ability4 === defamation ? 'avoidDefamation' : 'avoidStack';
          } else if (player4 === data.me) {
            if (!isThisSame) {
              next1 = ability4 === defamation ? 'avoidDefamation' : 'avoidStack';
              next2 = ability4 === defamation ? 'defamationOnYou' : 'stackOnYou';
            } else {
              next1 = ability4 === defamation ? 'defamationOnYou' : 'stackOnYou';
            }
          } else if (isNextSame) {
            next1 = ability3 === defamation ? 'defamations' : 'stacks';
          } else if (!isNextSame) {
            next1 = ability3 === defamation ? 'avoidDefamation' : 'stack';
            next2 = ability4 === defamation ? 'avoidDefamation' : 'stack';
          }

          // Build output
          if (this1 === undefined || next1 === undefined)
            return;
          if (isThisSame && isNextSame) {
            return {
              [text]: output.oneMechThenOne!({
                mech1: output[this1]!(),
                mech2: output[next1]!(),
              }),
            };
          }

          const shortPlayer3 = data.party.member(player3);
          const shortPlayer4 = data.party.member(player4);
          if (isThisSame && !isNextSame) {
            if (next2 === undefined)
              return;
            return {
              [text]: output.oneMechThenTwo!({
                mech1: output[this1]!(),
                mech2: next1 === 'stack'
                  ? output.stackOnPlayer!({ player: shortPlayer3 })
                  : output[next1]!(),
                mech3: next2 === 'stack'
                  ? output.stackOnPlayer!({ player: shortPlayer4 })
                  : output[next2]!(),
              }),
            };
          }

          if (!isThisSame && isNextSame) {
            if (this2 === undefined)
              return;
            return {
              [text]: output.twoMechsThenOne!({
                mech1: this1 === 'stack'
                  ? output.stackOnPlayer!({ player: shortPlayer1 })
                  : output[this1]!(),
                mech2: this2 === 'stack'
                  ? output.stackOnPlayer!({ player: shortPlayer2 })
                  : output[this2]!(),
                mech3: output[next1]!(),
              }),
            };
          }

          if (this2 === undefined || next2 === undefined)
            return;
          return {
            [text]: output.twoMechsThenTwo!({
              mech1: this1 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer1 })
                : output[this1]!(),
              mech2: this2 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer2 })
                : output[this2]!(),
              mech3: next1 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer3 })
                : output[next1]!(),
              mech4: next2 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer4 })
                : output[next2]!(),
            }),
          };
        }
        // Build output for last mechanic set to warn of towers
        if (this1 === undefined)
          return;
        if (isThisSame) {
          return {
            [text]: output.oneMechThenTowers!({
              mech1: output[this1]!(),
              towers: output.towers!(),
            }),
          };
        }
        if (!isThisSame) {
          if (this2 === undefined)
            return;
          return {
            [text]: output.twoMechsThenTowers!({
              mech1: this1 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer1 })
                : output[this1]!(),
              mech2: this2 === 'stack'
                ? output.stackOnPlayer!({ player: shortPlayer2 })
                : output[this2]!(),
              towers: output.towers!(),
            }),
          };
        }
      },
    },
    {
      id: 'R12S Twisted Vision 5 Towers',
      // TODO: Get Position of the towers and player side and state the front/left back/right
      // Towers aren't visible until after cast, but you would have 4.4s to adjust if the trigger was delayed
      // 4s castTime
      type: 'StartsUsing',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: true },
      condition: (data) => data.twistedVisionCounter === 5,
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 4.1,
      alertText: (data, _matches, output) => {
        if (data.hasLightResistanceDown)
          return output.fireEarthTower!();
        return output.holyTower!();
      },
      outputStrings: {
        fireEarthTower: {
          en: 'Soak Fire/Earth Meteor',
        },
        holyTower: {
          en: 'Soak a White/Star Meteor',
        },
      },
    },
    {
      id: 'R12S Hot-blooded',
      // Player can still cast, but shouldn't move for 5s duration
      type: 'GainsEffect',
      netRegex: { effectId: '12A0', capture: true },
      condition: Conditions.targetIsYou(),
      durationSeconds: (_data, matches) => parseFloat(matches.duration),
      response: Responses.stopMoving(),
    },
    {
      id: 'R12S Idyllic Dream Lindwurm\'s Stone III',
      // TODO: Get their target locations and output avoid
      // 5s castTime
      type: 'StartsUsing',
      netRegex: { id: 'B4F7', source: 'Lindwurm', capture: true },
      durationSeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.avoidEarthTower!(),
      outputStrings: {
        avoidEarthTower: {
          en: 'Avoid Earth Tower',
        },
      },
    },
    {
      id: 'R12S Doom Collect',
      // Happens about 1.3s after Dark Tower when it casts B4F6 Lindwurm's Dark II
      type: 'GainsEffect',
      netRegex: { effectId: 'D24', capture: true },
      run: (data, matches) => data.doomPlayers.push(matches.target),
    },
    {
      id: 'R12S Doom Cleanse',
      type: 'GainsEffect',
      netRegex: { effectId: 'D24', capture: false },
      condition: (data) => data.CanCleanse(),
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        const players = data.doomPlayers;
        if (players.length === 2) {
          const target1 = data.party.member(data.doomPlayers[0]);
          const target2 = data.party.member(data.doomPlayers[1]);
          return output.cleanseDoom2!({ target1: target1, target2: target2 });
        }
        if (players.length === 1) {
          const target1 = data.party.member(data.doomPlayers[0]);
          return output.cleanseDoom!({ target: target1 });
        }
      },
      outputStrings: {
        cleanseDoom: {
          en: 'Cleanse ${target}',
          de: 'Reinige ${target}',
          fr: 'Guérison sur ${target}',
          cn: '康复 ${target}',
          ko: '${target} 에스나',
          tc: '康復 ${target}',
        },
        cleanseDoom2: {
          en: 'Cleanse ${target1}/${target2}',
        },
      },
    },
    {
      id: 'R12S Nearby and Faraway Portent',
      // 129D Lindwurm's Portent prevents stacking the portents
      // 129E Farwaway Portent
      // 129F Nearby Portent
      // 10s duration, need to delay to avoid earth + doom trigger overlap
      // TODO: Configure for element tower they soaked
      type: 'GainsEffect',
      netRegex: { effectId: ['129E', '129F'], capture: true },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5.3,
      infoText: (_data, matches, output) => {
        if (matches.id === '129E')
          return output.farOnYou!();
        return output.nearOnYou!();
      },
      outputStrings: {
        nearOnYou: {
          en: 'Near on YOU: Be on Middle Hitbox',
        },
        farOnYou: {
          en: 'Far on YOU: Be on N/S Hitbox', // Most parties probably put this North?
        },
      },
    },
    {
      id: 'R12S Nearby and Faraway Portent Baits',
      // TODO: Configure for element tower they soaked
      type: 'GainsEffect',
      netRegex: { effectId: ['129E', '129F'], capture: true },
      condition: (data) => data.hasLightResistanceDown,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5.3,
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait Cone',
          de: 'Köder Kegel-AoE',
          cn: '诱导扇形',
          ko: '부채꼴 유도',
          tc: '誘導扇形',
        },
      },
    },
    {
      id: 'R12S Twisted Vision 6 Light Party Stacks',
      // At end of cast it's cardinal or intercard
      type: 'Ability',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: false },
      condition: (data) => data.twistedVisionCounter === 6,
      infoText: (data, _matches, output) => {
        const first = data.replication3CloneOrder[0];
        if (first === undefined)
          return;
        const dirNumOrder = first % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

        // Need to lookup what ability is at each dir, only need cards or intercard dirs
        const abilities = data.replication4AbilityOrder.splice(0, 4);
        const stackDirs = [];
        let i = 0;

        // Find first all stacks in cards or intercards
        // Incorrect amount means players made an unsolvable? run
        for (const dirNum of dirNumOrder) {
          if (abilities[i++] === headMarkerData['heavySlamTether'])
            stackDirs.push(dirNum);
        }
        // Only grabbing first two
        const dirNum1 = stackDirs[0];
        const dirNum2 = stackDirs[1];

        // If we failed to get two stacks, just output generic cards/intercards reminder
        if (dirNum1 === undefined || dirNum2 === undefined) {
          return first % 2 === 0 ? output.cardinals!() : output.intercards!();
        }
        const dir1 = Directions.output8Dir[dirNum1];
        const dir2 = Directions.output8Dir[dirNum2];
        return output.stack!({ dir1: dir1, dir2: dir2 });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        stack: {
          en: 'Stack ${dir1}/${dir2} + Lean Middle Out',
        },
      },
    },
    {
      id: 'R12S Twisted Vision 7 Safe Platform',
      // TODO: Get direction of the safe platform + N/S or E/W?
      type: 'StartsUsing',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: true },
      condition: (data) => data.twistedVisionCounter === 7,
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) + 3,
      infoText: (data, _matches, output) => {
        const first = data.replication3CloneOrder[0];
        if (first === undefined)
          return;
        const dirNumOrder = first % 2 !== 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

        // Need to lookup what ability is at each dir, only need cards or intercard dirs
        const abilities = data.replication4AbilityOrder.slice(4, 8);
        const stackDirs = [];
        let i = 0;

        // Find first all stacks in cards or intercards
        // Incorrect amount means players made an unsolvable? run
        for (const dirNum of dirNumOrder) {
          if (abilities[i++] === headMarkerData['heavySlamTether'])
            stackDirs.push(dirNum);
        }
        // Only grabbing first two
        const dirNum1 = stackDirs[0];
        const dirNum2 = stackDirs[1];

        // If we failed to get two stacks, just output generic cards/intercards reminder
        if (dirNum1 === undefined || dirNum2 === undefined) {
          const card = first % 2 !== 0 ? 'cardinals' : 'intercards';
          return output.platformThenStack!({
            platform: output.safePlatform!(),
            stack: output[card]!(),
          });
        }
        const dir1 = Directions.output8Dir[dirNum1];
        const dir2 = Directions.output8Dir[dirNum2];
        return output.platformThenStack!({
          platform: output.safePlatform!(),
          stack: output.stack!({ dir1: dir1, dir2: dir2 }),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        safePlatform: {
          en: 'Safe Platform',
        },
        stack: {
          en: 'Stack ${dir1}/${dir2}',
        },
        platformThenStack: {
          en: '${platform} => ${stack}',
        },
      },
    },
    {
      id: 'R12S Twisted Vision 8 Light Party Stacks',
      // At end of cast it's cardinal or intercard
      type: 'StartsUsing',
      netRegex: { id: 'BBE2', source: 'Lindwurm', capture: false },
      condition: (data) => data.twistedVisionCounter === 8,
      alertText: (data, _matches, output) => {
        const first = data.replication3CloneOrder[0];
        if (first === undefined)
          return;
        const dirNumOrder = first % 2 !== 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

        // Need to lookup what ability is at each dir, only need cards or intercard dirs
        const abilities = data.replication4AbilityOrder.slice(4, 8);
        const stackDirs = [];
        let i = 0;

        // Find first all stacks in cards or intercards
        // Incorrect amount means players made an unsolvable? run
        for (const dirNum of dirNumOrder) {
          if (abilities[i++] === headMarkerData['heavySlamTether'])
            stackDirs.push(dirNum);
        }
        // Only grabbing first two
        const dirNum1 = stackDirs[0];
        const dirNum2 = stackDirs[1];

        // If we failed to get two stacks, just output generic cards/intercards reminder
        if (dirNum1 === undefined || dirNum2 === undefined) {
          return first % 2 !== 0 ? output.cardinals!() : output.intercards!();
        }
        const dir1 = Directions.output8Dir[dirNum1];
        const dir2 = Directions.output8Dir[dirNum2];
        return output.stack!({ dir1: dir1, dir2: dir2 });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
        stack: {
          en: 'Stack ${dir1}/${dir2} + Lean Middle Out',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Netherwrath Near/Netherwrath Far': 'Netherwrath Near/Far',
        'Netherworld Near/Netherwworld Far': 'Netherworld Near/Far',
      },
    },
  ],
};

export default triggerSet;
