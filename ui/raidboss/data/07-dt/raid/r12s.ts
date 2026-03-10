import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputIntercard, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Safe spots for Curtain Call's Unbreakable flesh
// TODO: Safe spots for Slaughtershed Stack/Spreads

export type Phase =
  | 'doorboss'
  | 'curtainCall'
  | 'slaughtershed'
  | 'replication1'
  | 'replication2'
  | 'reenactment1'
  | 'idyllic'
  | 'reenactment2';

export interface Data extends RaidbossData {
  readonly triggerSetConfig: {
    uptimeKnockbackStrat: true | false;
  };
  phase: Phase;
  // Phase 1
  mortalSlayerGreenLeft: number;
  mortalSlayerGreenRight: number;
  mortalSlayerPurpleIsLeft?: boolean;
  grotesquerieCleave?:
    | 'rightCleave'
    | 'leftCleave'
    | 'frontCleave'
    | 'rearCleave';
  myFleshBonds?: 'alpha' | 'beta';
  inLine: { [name: string]: number };
  blobTowerDirs: DirectionOutputIntercard[];
  cursedCoilDirNum?: number;
  skinsplitterCount: number;
  cellChainCount: number;
  myMitoticPhase?: string;
  hasRot: boolean;
  // Phase 2
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
        ko: `cactbot이 맹수의 주먹 이중 넉백 알람을 불러주게 하려면 이 옵션을 활성화하세요.
             첫 번째 애니메이션 중/후에 알림이 발생하며,
             북서쪽과 북동쪽 넉백을 모두 피하려면 1.8초 미만의 반응 시간이 필요합니다.
             참고: 각 세트마다 호출됩니다.`,
      },
      type: 'checkbox',
      default: false,
    },
  ],
  timelineFile: 'r12s.txt',
  initData: () => ({
    phase: 'doorboss',
    // Phase 1
    mortalSlayerGreenLeft: 0,
    mortalSlayerGreenRight: 0,
    inLine: {},
    blobTowerDirs: [],
    skinsplitterCount: 0,
    cellChainCount: 0,
    hasRot: false,
    // Phase 2
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
      id: 'R12S The Fixer',
      type: 'StartsUsing',
      netRegex: { id: 'B4D7', source: 'Lindwurm', capture: false },
      durationSeconds: 4.7,
      response: Responses.bigAoe('alert'),
    },
    {
      id: 'R12S Mortal Slayer Collect',
      // 19200 Purple Orb
      // 19201 Green Orb
      type: 'AddedCombatant',
      netRegex: { name: 'Lindwurm', npcBaseId: ['19200', '19201'], capture: true },
      run: (data, matches) => {
        const npcBaseId = matches.npcBaseId;
        const x = parseFloat(matches.x);

        // 4 Green Orbs on one side = we know where purple will be
        if (npcBaseId === '19201') {
          if (x < 100) {
            data.mortalSlayerGreenLeft = data.mortalSlayerGreenLeft + 1;
            if (
              data.mortalSlayerGreenLeft === 4 &&
              data.mortalSlayerPurpleIsLeft === undefined
            )
              data.mortalSlayerPurpleIsLeft = false;
          } else if (x > 100) {
            data.mortalSlayerGreenRight = data.mortalSlayerGreenRight + 1;
            if (
              data.mortalSlayerGreenRight === 4 &&
              data.mortalSlayerPurpleIsLeft === undefined
            )
              data.mortalSlayerPurpleIsLeft = true;
          }
        } else if (
          npcBaseId === '19200' &&
          data.mortalSlayerPurpleIsLeft === undefined
        )
          data.mortalSlayerPurpleIsLeft = x < 100 ? true : false;
      },
    },
    {
      id: 'R12S Mortal Slayer Tank Side',
      type: 'AddedCombatant',
      netRegex: { name: 'Lindwurm', npcBaseId: ['19200', '19201'], capture: false },
      condition: (data) => {
        if (data.mortalSlayerPurpleIsLeft !== undefined)
          return true;
        return false;
      },
      suppressSeconds: 12, // castTime of Mortal Slayer B495
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tanksLeft: {
            en: 'Tanks Left',
            ko: '탱커 왼쪽',
          },
          tanksRight: {
            en: 'Tanks Right',
            ko: '탱커 오른쪽',
          },
        };
        const severity = data.role === 'tank' ? 'alertText' : 'infoText';
        return {
          [severity]: data.mortalSlayerPurpleIsLeft
            ? output.tanksLeft!()
            : output.tanksRight!(),
        };
      },
    },
    {
      id: 'R12S Mortal Slayer Cleanup',
      // Reset trackers for second Mortal Slayer
      type: 'Ability',
      netRegex: { id: 'B495', capture: false },
      suppressSeconds: 9999,
      run: (data) => {
        data.mortalSlayerGreenLeft = 0;
        data.mortalSlayerGreenRight = 0;
        delete data.mortalSlayerPurpleIsLeft;
      },
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
          ko: '전방 부채꼴',
          tc: '前方扇形',
        },
        rearCleave: {
          en: 'Rear Cleave',
          de: 'Kegel Aoe nach Hinten',
          fr: 'Cleave Arrière',
          ja: '尻からおなら',
          cn: '背后扇形',
          ko: '후방 부채꼴',
          tc: '背後扇形',
        },
        leftCleave: {
          en: 'Left Cleave',
          de: 'Linker Cleave',
          fr: 'Cleave gauche',
          ja: '左半面へ攻撃',
          cn: '左刀',
          ko: '왼쪽 부채꼴',
          tc: '左刀',
        },
        rightCleave: {
          en: 'Right Cleave',
          de: 'Rechter Cleave',
          fr: 'Cleave droit',
          ja: '右半面へ攻撃',
          cn: '右刀',
          ko: '오른쪽 부채꼴',
          tc: '右刀',
        },
        baitThenStack: {
          en: 'Bait 4x Puddles => ${stack}',
          ko: '장판 유도 4x => ${stack}',
        },
        baitThenStackCleave: {
          en: 'Bait 4x Puddles => ${stack} + ${cleave}',
          ko: '장판 유도 4x => ${stack} + ${cleave}',
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
          ko: '전방 부채꼴',
          tc: '前方扇形',
        },
        rearCleave: {
          en: 'Rear Cleave',
          de: 'Kegel Aoe nach Hinten',
          fr: 'Cleave Arrière',
          ja: '尻からおなら',
          cn: '背后扇形',
          ko: '후방 부채꼴',
          tc: '背後扇形',
        },
        leftCleave: {
          en: 'Left Cleave',
          de: 'Linker Cleave',
          fr: 'Cleave gauche',
          ja: '左半面へ攻撃',
          cn: '左刀',
          ko: '왼쪽 부채꼴',
          tc: '左刀',
        },
        rightCleave: {
          en: 'Right Cleave',
          de: 'Rechter Cleave',
          fr: 'Cleave droit',
          ja: '右半面へ攻撃',
          cn: '右刀',
          ko: '오른쪽 부채꼴',
          tc: '右刀',
        },
        baitThenSpread: {
          en: 'Bait 4x Puddles => Spread',
          ko: '장판 유도 4x => 산개',
        },
        baitThenSpreadCleave: {
          en: 'Bait 4x Puddles => Spread + ${cleave}',
          ko: '장판 유도 4x => 산개 + ${cleave}',
        },
        spreadCurtain: {
          en: 'Spread Debuff on YOU',
          ko: '산개징 대상자',
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
      tts: (data, _matches, output) => {
        // Greek characters may be the best TTS
        const myNum = data.inLine[data.me];
        if (myNum === undefined)
          return;
        const flesh = data.myFleshBonds;
        if (flesh === undefined)
          return output.order!({ num: myNum });
        if (flesh === 'alpha') {
          switch (myNum) {
            case 1:
              return output.alpha1Tts!();
            case 2:
              return output.alpha2Tts!();
            case 3:
              return output.alpha3Tts!();
            case 4:
              return output.alpha4Tts!();
          }
        }
        switch (myNum) {
          case 1:
            return output.beta1Tts!();
          case 2:
            return output.beta2Tts!();
          case 3:
            return output.beta3Tts!();
          case 4:
            return output.beta4Tts!();
        }
      },
      outputStrings: {
        alpha1: {
          en: '1α: Wait for Tether 1',
          ko: '1α: 선 1 기다리기',
        },
        alpha2: {
          en: '2α: Wait for Tether 2',
          ko: '2α: 선 2 기다리기',
        },
        alpha3: {
          en: '3α: Blob Tower 1',
          ko: '3α: 살점 탑 1',
        },
        alpha4: {
          en: '4α: Blob Tower 2',
          ko: '4α: 살점 탑 2',
        },
        beta1: {
          en: '1β: Wait for Tether 1',
          ko: '1β: 선 1 기다리기',
        },
        beta2: {
          en: '2β: Wait for Tether 2',
          ko: '2β: 선 2 기다리기',
        },
        beta3: {
          en: '3β: Chain Tower 1',
          ko: '3β: 설치한 탑 1',
        },
        beta4: {
          en: '4β: Chain Tower 2',
          ko: '4β: 설치한 탑 2',
        },
        alpha1Tts: {
          en: '1α: Wait for Tether 1',
          ko: '알파 1: 선 1 기다리기',
        },
        alpha2Tts: {
          en: '2α: Wait for Tether 2',
          ko: '알파 2: 선 2 기다리기',
        },
        alpha3Tts: {
          en: '3α: Blob Tower 1',
          ko: '알파 3: 살점 탑 1',
        },
        alpha4Tts: {
          en: '4α: Blob Tower 2',
          ko: '알파 4: 살점 탑 2',
        },
        beta1Tts: {
          en: '1β: Wait for Tether 1',
          ko: '베타 1: 선 1 기다리기',
        },
        beta2Tts: {
          en: '2β: Wait for Tether 2',
          ko: '베타 2: 선 2 기다리기',
        },
        beta3Tts: {
          en: '3β: Chain Tower 1',
          ko: '베타 3: 설치한 탑 1',
        },
        beta4Tts: {
          en: '4β: Chain Tower 2',
          ko: '베타 4: 설치한 탑 2',
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
      // StartsUsing can have bad data
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
      type: 'StartsUsingExtra',
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
      type: 'StartsUsingExtra',
      netRegex: { id: 'B4B6', capture: false },
      condition: (data) => data.myFleshBonds === 'alpha',
      delaySeconds: 0.1,
      durationSeconds: (data) => {
        const myNum = data.inLine[data.me];
        // Timings based on next trigger
        switch (myNum) {
          case 1:
            return 20;
          case 2:
            return 25;
          case 3:
            return 21;
          case 4:
            return 21;
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
          ko: '살점 탑 ${num} 안쪽 ${dir} (나중에)',
        },
        outerBlobTower: {
          en: 'Blob Tower ${num} Outer ${dir} (later)',
          ko: '살점 탑 ${num} 바깥쪽 ${dir} (나중에)',
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
      id: 'R12S Cursed Coil Initial Direction Collect',
      // B4B8 Cruel Coil: Starts east, turns counterclock
      // B4B9 Cruel Coil: Starts west, turns counterclock
      // B4BA Cruel Coil: Starts north, turns counterclock
      // B4BB Cruel Coil: Starts south, turns counterclock
      type: 'StartsUsing',
      netRegex: { id: ['B4B8', 'B4B9', 'B4BA', 'B4BB'], source: 'Lindwurm', capture: true },
      run: (data, matches) => {
        switch (matches.id) {
          case 'B4B8':
            data.cursedCoilDirNum = 1;
            return;
          case 'B4B9':
            data.cursedCoilDirNum = 3;
            return;
          case 'B4BA':
            data.cursedCoilDirNum = 0;
            return;
          case 'B4BB':
            data.cursedCoilDirNum = 2;
        }
      },
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
          ko: '${tether} => 설치한 탑 3',
        },
        beta2Tower: {
          en: '${tether} => Chain Tower 4',
          ko: '${tether} => 설치한 탑 4',
        },
        beta3Tower: {
          en: '${tether} => Chain Tower 1',
          ko: '${tether} => 설치한 탑 1',
        },
        beta4Tower: {
          en: '${tether} => Chain Tower 2',
          ko: '${tether} => 설치한 탑 2',
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
          ko: '설치한 탑 ${num} 밟기',
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
          ko: '살점 탑 1 밟기',
        },
        alpha4: {
          en: 'Get Blob Tower 2',
          ko: '살점 탑 2 밟기',
        },
        alpha3Dir: {
          en: 'Get Blob Tower 1 (Inner ${dir})',
          ko: '살점 탑 1 (안쪽 ${dir}) 밟기',
        },
        alpha4Dir: {
          en: 'Get Blob Tower 2 (Inner ${dir})',
          ko: '살점 탑 2 (안쪽 ${dir}) 밟기',
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
        // As the coil is moving in reverse, the modulo will have negative values
        // 8 has to be used as that is the next number after 7 (number of spins) that divides evenly by 4
        const coilDirNum = data.cursedCoilDirNum !== undefined
          ? ((data.cursedCoilDirNum - data.skinsplitterCount) + 8) % 4
          : undefined;

        if (flesh === 'alpha') {
          const exit = Directions.outputCardinalDir[coilDirNum ?? 4] ?? 'unknown'; // Return 'unknown' if undefined
          if (myNum === 1) {
            const dir = data.blobTowerDirs[2];
            if (dir !== undefined)
              return output.alpha1Dir!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
                dir: output[dir]!(),
              });
          }
          if (myNum === 2) {
            const dir = data.blobTowerDirs[3];
            if (dir !== undefined)
              return output.alpha2Dir!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
                dir: output[dir]!(),
              });
          }

          // dir undefined or 3rd/4rth in line
          switch (myNum) {
            case 1:
              return output.alpha1!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
              });
            case 2:
              return output.alpha2!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
              });
            case 3:
              return output.alpha3!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
              });
            case 4:
              return output.alpha4!({
                chains: output.breakChains!(),
                exit: output[exit]!(),
              });
          }
        }

        const dir = coilDirNum !== undefined
          ? Directions.outputCardinalDir[(coilDirNum + 2) % 4] ?? 'unknown'
          : 'unknown';

        switch (myNum) {
          case 1:
            return output.beta1!({
              chains: output.breakChains!(),
              dir: output[dir]!(),
            });
          case 2:
            return output.beta2!({
              chains: output.breakChains!(),
              dir: output[dir]!(),
            });
          case 3:
            return output.beta3!({
              chains: output.breakChains!(),
              dir: output[dir]!(),
            });
          case 4:
            return output.beta4!({
              chains: output.breakChains!(),
              dir: output[dir]!(),
            });
        }
        return output.getTowers!();
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        breakChains: Outputs.breakChains,
        getTowers: Outputs.getTowers,
        alpha1: {
          en: '${chains} 1 (${exit}) + Blob Tower 3 (Outer)',
          ko: '${chains} 1 (${exit}) + 살점 탑 3 (바깥쪽)',
        },
        alpha1Dir: {
          en: '${chains} 1 (${exit}) + Blob Tower 3 (Outer ${dir})',
          ko: '${chains} 1 (${exit}) + 살점 탑 3 (바깥쪽 ${dir})',
        },
        alpha1ExitDir: {
          en: '${chains} 1 (${exit}) + Blob Tower 3 (Outer ${dir})',
          ko: '${chains} 1 (${exit}) + 살점 탑 3 (바깥쪽 ${dir})',
        },
        alpha2: {
          en: '${chains} 2 (${exit}) + Blob Tower 4 (Outer)',
          ko: '${chains} 2 (${exit}) + 살점 탑 4 (바깥쪽)',
        },
        alpha2Dir: {
          en: '${chains} 2 (${exit}) + Blob Tower 4 (Outer ${dir})',
          ko: '${chains} 2 (${exit}) + 살점 탑 4 (바깥쪽 ${dir})',
        },
        alpha3: {
          en: '${chains} 3 (${exit}) + Get Out',
          ko: '${chains} 3 (${exit}) + 밖으로',
        },
        alpha4: {
          en: '${chains} 4 (${exit}) + Get Out',
          ko: '${chains} 4 (${exit}) + 밖으로',
        },
        beta1: {
          en: '${chains} 1 (${dir}) => Get Middle',
          ko: '${chains} 1 (${dir}) => 중앙으로',
        },
        beta2: {
          en: '${chains} 2 (${dir}) => Get Middle',
          ko: '${chains} 2 (${dir}) => 중앙으로',
        },
        beta3: {
          en: '${chains} 3 (${dir}) => Wait for last pair',
          ko: '${chains} 3 (${dir}) => 마지막 쌍 기다리기',
        },
        beta4: {
          en: '${chains} 4 (${dir}) => Get Out',
          ko: '${chains} 4 (${dir}) => 밖으로',
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
      id: 'R12S Skinsplitter Out of Coil Reminder',
      type: 'Ability',
      netRegex: { id: 'B4BC', capture: false },
      condition: (data) => data.skinsplitterCount === 7,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.outOfCoil!(),
      outputStrings: {
        outOfCoil: {
          en: 'Out of Coil',
          ko: '몸통 밖으로',
        },
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
          ko: '탑 (남/남서)',
        },
        rearTower: {
          en: 'Tower (N/NE)',
          ko: '탑 (북/북동)',
        },
        leftTower: {
          en: 'Tower (E/SE)',
          ko: '탑 (동/남동)',
        },
        rightTower: {
          en: 'Tower (W/NW)',
          ko: '탑 (서/북서)',
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
          ko: '치사세포 대상자',
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
          ko: '서쪽 부채꼴에서 산개',
        },
        getHitEast: {
          en: 'Spread in East Cleave',
          ko: '동쪽 부채꼴에서 산개',
        },
        safeEast: {
          en: 'Spread East + Avoid Cleave',
          ko: '동쪽에서 산개 + 부채꼴 피하기',
        },
        safeWest: {
          en: 'Spread West + Avoid Cleave',
          ko: '서쪽에서 산개 + 부채꼴 피하기',
        },
      },
    },
    {
      id: 'R12S Split Scourge and Venomous Scourge',
      // B4AB Split Scourge and B4A8 Venomous Scourge are instant casts
      // Split Scourge happens first:
      // Each head will target the nearest player with a tankbuster line AoE
      //
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
          en: 'Bait Line AoE from Heads => Get Middle (Avoid Far AoEs)',
          ko: '머리의 직선 장판 유도 => 중앙으로 (원거리 장판 피하기)',
        },
        party: {
          en: 'Away from Heads (Avoid Tank Lines) => Spread near Heads',
          ko: '머리에서 멀어지기 (탱커 직선장판 피하기) => 머리 근처에서 산개',
        },
      },
    },
    {
      id: 'R12S Venomous Scourge',
      // 2.4s after Split Scourge, Venomous Scourge AoEs happen on 3 furthest players from each head
      type: 'Ability',
      netRegex: { id: 'B4AB', capture: false },
      durationSeconds: 2.4,
      suppressSeconds: 9999,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.tank!();
        return output.party!();
      },
      outputStrings: {
        tank: {
          en: 'Get Middle (Avoid Far AoEs)',
          ko: '중앙으로 (원거리 장판 피하기)',
        },
        party: {
          en: 'Spread near Heads',
          ko: '머리 근처에서 산개',
        },
      },
    },
    {
      id: 'R12S Grotesquerie: Curtain Call Spreads',
      type: 'StartsUsing',
      netRegex: { id: 'BEC0', source: 'Lindwurm', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait 5x Puddles',
          ko: '장판 유도 5x',
        },
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
          ko: '살점 피하기',
        },
        alphaChains: {
          en: '${chains} => ${safe}',
          ko: '${chains} => ${safe}',
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
          ko: '북서에서 넉백 => 북동에서 넉백',
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
          ko: '북동에서 넉백 => 북서에서 넉백',
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
      // B538 has a 10s castTime that could end with enrage or raidwide
      // Raidwide cast, B539, happens .2s after but it's not until 5.4s~5.8s later that the damage is applied
      // Mits applied after "cast" still count towards the damage application
      type: 'Ability',
      netRegex: { id: 'B539', source: 'Lindwurm', capture: false },
      durationSeconds: 5,
      suppressSeconds: 9999,
      response: Responses.bigAoe('alert'),
    },
    // Phase 2
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Netherwrath Near/Netherwrath Far': 'Netherwrath Near/Far',
        'Netherworld Near/Netherwworld Far': 'Netherworld Near/Far',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Blood Vessel': '연환세포',
        'Lindschrat': '인간형 분열체',
        'Lindwurm': '린드블룸',
        'Mana Sphere': '마나 구체',
        'Understudy': '모방세포',
      },
      'replaceText': {
        '--bind--': '--속박--',
        '--knockback--': '--넉백--',
        '--untargetable\\?--': '--타겟 불가능?--',
        '--clones move': '--분신 이동',
        '--clones x': '--분신 x',
        '--locked tethers--': '--선 고정--',
        '--boss clones': '--보스 분신',
        '--tether (\\d)--': '--선 $1--',
        '--tethers--': '--선--',
        '--black holes--': '--블랙홀--',
        '--shapes--': '--도형--',
        '--close shapes eaten--': '--가까운 도형 흡수--',
        '--far shapes eaten--': '--먼 도형 흡수--',
        '--soaked shapes eaten--': '--밟은 도형 흡수--',
        '--Hot-blooded': '--열기',
        '--Doom': '--죽음의 선고',
        '--clone takes portal--': '--분신이 포탈로--',
        '--clones on platform--': '--분신이 플랫폼에--',
        '\\(boss': '(보스',
        '\\(clones': '(분신',
        '\\(cast\\)': '(시전)',
        '\\(castbar\\)': '(시전바)',
        'Arcadia Aflame': '아르카디아의 화염',
        'Arcadian Arcanum': '아르카디아의 신비',
        'Arcadian Hell': '아르카디아의 지옥',
        'Black Hole(?!s)': '블랙홀',
        'Blood Mana': '마나 구체',
        'Blood Wakening': '마나 구체 각성',
        'Bloody Burst': '마력 발산',
        'Bring Down the House': '장내를 흔드는 갈채',
        '(?<! )Burst': '대폭발',
        'Cell Shedding': '세포 소실',
        'Clone( \\d)? Heavy Slam': '분신$1 묵직한 내려찍기',
        'Clone( \\d)? Mana Burst': '분신$1 마나 폭발',
        'Constrictor': '옥죄기',
        'Cosmic Kiss': '착탄',
        'Cruel Coil': '잔혹한 똬리',
        'Double Sobat': '연속 후려차기',
        'Down for the Count': '행동 불가',
        'Downfall': '운석 추락',
        'Dramatic Lysis': '세포 폭발',
        'Esoteric Finisher': '마나 연격',
        'Feral Fission': '야성적인 분열',
        'Firefall Splash': '불꽃 하강',
        'Fourth-wall Fusion': '세포 겹폭발',
        'Grand Entrance': '화려한 등장',
        'Grotesquerie(?!:)': '세포 부착',
        'Grotesquerie: Act 1': '세포 부착: 초기',
        'Grotesquerie: Act 2': '세포 부착: 중기',
        'Grotesquerie: Act 3': '세포 부착: 후기',
        'Grotesquerie: Curtain Call': '세포 부착: 말기',
        '(?<! )Heavy Slam': '묵직한 내려찍기',
        'Hemorrhagic Projection': '방향성 충격파',
        'Idyllic Dream': '아르카디아의 꿈',
        'Left': '왼쪽',
        'Lindwurm\'s Dark II': '린드블룸 다라',
        'Lindwurm\'s Glare': '린드블룸 글레어',
        'Lindwurm\'s Meteor': '린드블룸 메테오',
        'Lindwurm\'s Stone III': '린드블룸 스톤가',
        'Lindwurm\'s Thunder II': '린드블룸 선더라',
        '(?<! )Mana Burst': '마나 폭발',
        'Metamitosis': '세포 살포',
        'Mighty Magic': '만능 마법',
        'Mortal Slayer': '죽음의 재앙',
        'Mutating Cells': '변이세포',
        'Netherworld Near/Netherworld Far': '지하세계: 근거리/원거리',
        'Netherwrath Near/Netherwrath Far': '지하의 분노: 근거리/원거리',
        'Northeast': '북동쪽',
        'Northwest': '북서쪽',
        'Phagocyte Spotlight': '세포 낙하',
        'Power Gusher': '강력 분출',
        'Raptor Knuckles': '맹수의 주먹',
        'Ravenous Reach': '탐욕스러운 손길',
        'Reenactment': '재현',
        'Refreshing Overkill': '과잉치료, 과잉치사',
        'Replication': '자가 복제',
        'Right': '오른쪽',
        'Roiling Mass': '세포 변이',
        'Scalding Waves': '화염 파도',
        'Serpentine Scourge': '재앙의 숨결',
        'Skinsplitter': '뱀껍질 균열',
        'Slaughtershed': '살육의 허물',
        'Snaking Kick': '뱀발 후려차기',
        'Splattershed': '유혈의 허물',
        'Split Scourge': '분열된 재앙',
        'Staging': '모방세포',
        'Temporal Curtain': '공간 절단',
        'The Fixer': '아르카디아의 배후자',
        'Timeless Spite': '지하의 분노: 파동',
        'Top-tier Slam': '정상급 내려찍기',
        'Twisted Vision': '심상 투영',
        'Venomous Scourge': '재앙 투하',
        'Visceral Burst': '내장 파열',
        'Wailing Wave': '지하세계: 파동',
        'Winged Scourge': '날개 돋친 재앙',
      },
    },
  ],
};

export default triggerSet;
