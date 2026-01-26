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
  myMutation?: 'alpha' | 'beta';
  replication3CloneOrder: number[];
  hasLightResistanceDown: boolean;
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
    replication3CloneOrder: [],
    hasLightResistanceDown: false,
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
        if (data.phase === 'replication1') {
          data.phase = 'reenactment1';
          return;
        }
        data.phase = 'reenactment2';
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
          en: 'Spread East',
        },
        safeWest: {
          en: 'Spread West',
        },
      },
    },
    {
      id: 'R12S Split Scourge and Venomous Scourge',
      // B4AB Split Scourge and B4A8 Venomous Scourge are instant casts
      // This actor control happens along with boss becoming targetable
      type: 'ActorControl',
      netRegex: { command: '8000000D', data0: '1E01', capture: false },
      durationSeconds: 9,
      suppressSeconds: 1,
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
      id: 'R12S Curtain Call: Unbreakable Flesh α/β Chains',
      // TODO: Find safe spots
      type: 'GainsEffect',
      netRegex: { effectId: ['1291', '1293'], capture: true },
      condition: (data, matches) => {
        if (matches.target === data.me && data.phase === 'curtainCall')
          return true;
        return false;
      },
      infoText: (_data, matches, output) => {
        const flesh = matches.effectId === '1291' ? 'alpha' : 'beta';
        if (flesh === 'alpha')
          return output.alphaChains!({
            chains: output.breakChains!(),
            safe: output.safeSpots!(),
          });
        if (flesh === 'beta')
          return output.betaChains!({
            chains: output.breakChains!(),
            safe: output.breakChains!(),
          });
        return output.unknownChains!({
          chains: output.breakChains!(),
          safe: output.breakChains!(),
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
        betaChains: {
          en: '${chains} => ${safe}',
        },
        unknownChains: {
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
          en: 'Northwest: Knockback to Northeast',
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
          en: 'Northeast: Knockback to Northwest',
        },
      },
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
      //  - No turn
      //  - 90 degree turn
      //  - 180 degree turn
      //  - 270 degree turn
      type: 'StartsUsing',
      netRegex: { id: 'B525', source: 'Lindwurm', capture: true },
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
      id: 'R12S Replication 2 Ability Tethers Collect',
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
      condition: (data) => data.phase === 'replication2',
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return;
        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        data.replication2TetherMap[dirNum] = matches.id;
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
        stackGroups: {
          en: 'Stack Groups',
          de: 'Gruppen-Sammeln',
          fr: 'Package en groupes',
          ja: '組み分け頭割り',
          cn: '分组分摊',
          ko: '그룹별 쉐어',
          tc: '分組分攤',
        },
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
      id: 'R12S Blood Mana',
      // Black Holes and shapes
      // TODO: Tell what shape to pop + which Black Hole mechanics and side?
      type: 'Ability',
      netRegex: { id: 'B4FB', source: 'Lindwurm', capture: false },
      infoText: (data, _matches, output) => {
        if (data.myMutation === 'alpha')
          return output.alpha!();
        return output.beta!();
      },
      outputStrings: {
        alpha: {
          en: 'Avoid Shape AoEs, Wait by Black Hole',
        },
        beta: {
          en: 'Shared Shape Soak => Get by Black Hole',
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
      // TODO: Tell which Black Hole and its mechanics?
      type: 'StartsUsing',
      netRegex: { id: ['B501', 'B502', 'B503', 'B504'], source: 'Lindwurm', capture: false },
      suppressSeconds: 9999,
      alertText: (_data, _matches, output) => output.move!(),
      outputStrings: {
        move: {
          en: 'Move to other Black Hole',
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
      id: 'R12S Idyllic Dream Replication Tethered Clone',
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
      id: 'R12S Lindwurm\'s Meteor',
      type: 'StartsUsing',
      netRegex: { id: 'B4F2', source: 'Lindwurm', capture: false },
      infoText: (_data, _matches, output) => output.healerGroups!(),
      outputStrings: {
        healerGroups: Outputs.healerGroups,
      },
    },
    {
      id: 'R12S Light Resistance Down II Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '1044', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hasLightResistanceDown = true,
    },
    {
      id: 'R12S Light Resistance Down II',
      type: 'GainsEffect',
      netRegex: { effectId: '1044', capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Soak Fire/Earth Meteor',
        },
      },
    },
    {
      id: 'R12S No Light Resistance Down II',
      type: 'GainsEffect',
      netRegex: { effectId: '1044', capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 9999,
      infoText: (data, _matches, output) => {
        if (!data.hasLightResistanceDown)
          return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Soak a White/Star Meteor',
        },
      },
    },
    {
      id: 'R12S Doom Collect',
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
      id: 'R12S Doom Cleanup',
      type: 'LosesEffect',
      netRegex: { effectId: 'D24', capture: true },
      run: (data, matches) => {
        data.doomPlayers = data.doomPlayers.filter(
          (player) => player === matches.target,
        );
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
      id: 'R12S Idyllic Dream Replication Clone Cardinal/Intercardinal Reminder',
      // Using Temporal Curtain
      type: 'StartsUsing',
      netRegex: { id: 'B51C', source: 'Lindwurm', capture: false },
      infoText: (data, _matches, output) => {
        const firstClone = data.replication3CloneOrder[0];
        if (firstClone === undefined)
          return;
        const actor = data.actorPositions[firstClone];
        if (actor === undefined)
          return;

        const dirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        const dir = Directions.output8Dir[dirNum] ?? 'unknown';

        if (isCardinalDir(dir))
          return output.cardinals!();
        if (isIntercardDir(dir))
          return output.intercards!();
      },
      outputStrings: {
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Netherwrath Near/Netherwrath Far': 'Netherwrath Near/Far',
      },
    },
  ],
};

export default triggerSet;
