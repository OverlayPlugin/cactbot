import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type Phase = 'one' | 'snaking' | 'arenaSplit' | 'xtremeSnaking';

type SnakingFlagsType = {
  [flags: string]: {
    elem: 'water' | 'fire';
    mech: 'protean' | 'stack' | 'buster';
  };
};

export interface Data extends RaidbossData {
  phase: Phase;
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  dareCount: number;
  waveDir: DirectionOutputCardinal;
  snakings: SnakingFlagsType[string][];
  snakingCount: number;
  snakingDebuff?: 'fire' | 'water';
}

const phaseMap: { [id: string]: Phase } = {
  'B381': 'snaking', // Firesnaking
  'B5D4': 'arenaSplit', // Flame Floater
  'B5AE': 'xtremeSnaking', // Xtreme Firesnaking
};

const headMarkerData = {
  // Vfx Path: m0676trg_tw_d0t1p
  'sharedBusterRed': '0103',
  // Vfx Path: target_ae_5m_s5_fire0c
  'spreadFirePuddleRed': '0294',
  // Vfx Path: m0982trg_g0c
  'partyStackFire': '029A',
  // Vfs Path: m0982trg_c0c,
  'blueTether': '027B',
  // Vfs Path: m0982trg_c1c,
  'redTether': '027C',
  // Vfx Path: com_share_fire01s5_0c
  'partnerStack': '0293',
  // Tethers used in Flame Floater
  'closeTether': '017B',
  'farTether': '017A',
  'sickSwellTether': '0174',
} as const;

const center = {
  x: 100,
  y: 100,
};
console.assert(center);

const snakingSlots = {
  'NW': '16',
  'N': '0F',
  'NE': '10',
  'W': '15',
  'C': '0E',
  'E': '11',
  'SW': '14',
  'S': '13',
  'SE': '12',
} as const;

const snakingFlags: SnakingFlagsType = {
  '00020001': {
    elem: 'water',
    mech: 'protean',
  },
  '00200010': {
    elem: 'water',
    mech: 'stack',
  },
  '00800040': {
    elem: 'water',
    mech: 'buster',
  },
  '02000100': {
    elem: 'fire',
    mech: 'protean',
  },
  '08000400': {
    elem: 'fire',
    mech: 'stack',
  },
  '20001000': {
    elem: 'fire',
    mech: 'buster',
  },
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM2Savage',
  zoneId: ZoneId.AacHeavyweightM2Savage,
  timelineFile: 'r10s.txt',
  initData: () => ({
    phase: 'one',
    actorPositions: {},
    dareCount: 0,
    waveDir: 'unknown',
    snakings: [],
    snakingCount: 0,
  }),
  triggers: [
    {
      id: 'R10S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'Red Hot' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
      },
    },
    {
      id: 'R10S ActorSetPos Tracker',
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
      id: 'R10S AddedCombatant Tracker',
      type: 'AddedCombatant',
      netRegex: { id: '4[0-9A-Fa-f]{7}', capture: true },
      run: (data, matches) =>
        data.actorPositions[matches.id] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
          heading: parseFloat(matches.heading),
        },
    },
    {
      id: 'R10S Divers\' Dare Collect',
      type: 'StartsUsing',
      netRegex: { id: ['B5B8', 'B5B9'], source: ['Red Hot', 'Deep Blue'], capture: false },
      run: (data) => data.dareCount = data.dareCount + 1,
    },
    {
      id: 'R10S Divers\' Dare',
      type: 'StartsUsing',
      netRegex: { id: ['B5B8', 'B5B9'], source: ['Red Hot', 'Deep Blue'], capture: false },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          aoe: Outputs.aoe,
          bigAoe: Outputs.bigAoe,
        };
        if (data.dareCount === 1)
          return { infoText: output.aoe!() };
        return { alertText: output.bigAoe!() };
      },
      run: (data) => data.dareCount = 0,
    },
    {
      id: 'R10S Hot Impact Buster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['sharedBusterRed'], capture: true },
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R10S Flame Floater Order',
      type: 'GainsEffect',
      netRegex: { effectId: ['BBC', 'BBD', 'BBE', 'D7B'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        switch (matches.effectId) {
          case 'BBC':
            return output.bait!({ order: output.first!() });
          case 'BBD':
            return output.bait!({ order: output.second!() });
          case 'BBE':
            return output.bait!({ order: output.third!() });
          case 'D7B':
            return output.bait!({ order: output.fourth!() });
        }
      },
      outputStrings: {
        bait: {
          en: '${order} bait',
          de: '${order} ködern',
          fr: 'Déposez en ${order}',
          cn: '${order} 引导',
          ko: '${order} 유도',
        },
        first: {
          en: 'First',
          de: 'Erstes',
          fr: 'Premier',
          ja: '最初',
          cn: '第1组',
          ko: '첫번째',
          tc: '第1組',
        },
        second: {
          en: 'Second',
          de: 'Zweites',
          fr: 'Deuxième',
          ja: '2番目',
          cn: '第2组',
          ko: '두번째',
          tc: '第2組',
        },
        third: {
          en: 'Third',
          de: 'Drittes',
          fr: 'Troisième',
          ja: '3番目',
          cn: '第3组',
          ko: '세번째',
          tc: '第3組',
        },
        fourth: {
          en: 'Fourth',
          de: 'Viertes',
          fr: 'Quatrième',
          ja: '4番目',
          cn: '第4组',
          ko: '네번째',
          tc: '第4組',
        },
      },
    },
    {
      id: 'R10S Flame Floater and Hot Aerial Move',
      // Fire Resistance Down II
      type: 'GainsEffect',
      netRegex: { effectId: 'B79', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.moveAway(),
    },
    {
      id: 'R10S Alley-oop Inferno Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['spreadFirePuddleRed'], capture: true },
      condition: Conditions.targetIsYou(),
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          spread: Outputs.spread,
          spreadFinal: {
            en: 'Out + Spread => Stack Near Blue',
            de: 'Raus + verteilen => Nahe Blau sammeln',
            fr: 'Extérieur + Dispersion => Package près de Blue',
            cn: '远离 + 分散 => 靠近深蓝集合',
            ko: '밖으로 + 산개 => 블루 가까이 모이기',
          },
          spreadFinalBait: {
            en: 'Out + Spread => Bait Blue Knockback Buster',
            de: 'Raus + verteilen => Köder blauen Rückstoß-Tankbuster',
            fr: 'Extérieur + Dispersion => Déposez le tankbuster de Blue',
            cn: '远离 + 分散 => 引导深蓝坦克击退死刑',
            ko: '밖으로 + 산개 => 블루 넉백 탱버 유도',
          },
        };
        if (data.phase === 'xtremeSnaking') {
          if (data.role === 'tank')
            return { infoText: output.spreadFinalBait!() };
          return { alertText: output.spreadFinal!() };
        }
        return { infoText: output.spread!() };
      },
    },
    {
      id: 'R10S Cutback Blaze',
      // Targets furthers player from Red Hot with 315? degree cleave from boss
      type: 'StartsUsing',
      netRegex: { id: 'B5C9', source: 'Red Hot', capture: false },
      condition: (data) => {
        // Second cutback targets furthest with firesnaking debuff or without a debuff
        return data.snakingDebuff !== 'water';
      },
      infoText: (_data, _matches, output) => output.cleaveTowardsFire!(),
      outputStrings: {
        cleaveTowardsFire: {
          en: 'Bait cleave towards Fire',
          de: 'Köder Kegel-AoE Richtung Feuer',
          fr: 'Déposez le cleave vers le Feu',
          cn: '向火区引导扇形伤害',
          ko: '화염 구역 쪽으로 부채꼴 유도',
        },
      },
    },
    {
      id: 'R10S Pyrotation Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['partyStackFire'], capture: true },
      condition: (data) => {
        // Let Deep Impact trigger output instead for final Pyrotation
        if (data.role === 'tank' && data.phase === 'xtremeSnaking')
          return false;
        return true;
      },
      alertText: (data, matches, output) => {
        const target = matches.target;

        if (target === data.me) {
          const stack = 'stackOnYou';
          return data.phase === 'xtremeSnaking'
            ? output.stackFinal!({ stack: output[stack]!() })
            : output[stack]!();
        }

        if (target === undefined) {
          const stack = 'stackOnMarker';
          return data.phase === 'xtremeSnaking'
            ? output.stackFinal!({ stack: output[stack]!() })
            : output[stack]!();
        }

        if (data.phase === 'xtremeSnaking') {
          return output.stackFinal!({
            stack: output.stackOnTarget!({
              player: data.party.member(target),
            }),
          });
        }
        return output.stackOnTarget!({ player: data.party.member(target) });
      },
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
        stackOnTarget: Outputs.stackOnPlayer,
        stackMarker: Outputs.stackMarker,
        stackFinal: {
          en: '${stack} Near Blue',
          de: '${stack} Nahe Blau',
          fr: '${stack} près de Blue',
          cn: '${stack} 靠近深蓝',
          ko: '${stack}: 블루 가까이',
        },
      },
    },
    {
      id: 'R10S Sickest Take-off Debuff',
      type: 'GainsEffect',
      netRegex: {
        effectId: '808',
        count: ['3ED', '3EE', '3EF', '3F0'],
        capture: true,
      },
      durationSeconds: 9,
      infoText: (data, matches, output) => {
        let mech:
          | 'healerGroups'
          | 'spread'
          | 'waterStack'
          | 'waterSpread'
          | 'waterStackFireDebuff'
          | 'waterSpreadFireDebuff';
        switch (matches.count) {
          case '3ED': // Healer Stacks during first takeoff and last takeoff (2 orbs)
            mech = 'healerGroups';
            break;
          case '3EE': // Spread during first takeoff (8 orbs)
            mech = 'spread';
            break;
          case '3EF': // Stack during Insane Air 1 during KB mech (1 orb)
            mech = data.snakingDebuff === 'fire'
              ? 'waterStackFireDebuff' // Can be soaked by fire player
              : 'waterStack';
            break;
          case '3F0': // Spread during Insane Air 1 during KB mech (4 orbs)
            mech = data.snakingDebuff === 'fire'
              ? 'waterSpreadFireDebuff'
              : 'waterSpread';
            break;
          default:
            return;
        }
        return output[mech]!();
      },
      outputStrings: {
        healerGroups: Outputs.healerGroups,
        spread: Outputs.spread,
        waterStack: {
          en: 'Water Stack',
          de: 'Wasser sammeln',
          fr: 'Package Eau',
          cn: '水分摊',
          ko: '물 쉐어',
        },
        waterStackFireDebuff: {
          en: 'Water Stack',
          de: 'Wasser sammeln',
          fr: 'Package Eau',
          cn: '水分摊',
          ko: '물 쉐어',
        },
        waterSpread: Outputs.spread,
        waterSpreadFireDebuff: {
          en: 'Avoid Water Players',
          de: 'Vermeide Wasser-Spieler',
          fr: 'Évitez les joueurs Eau',
          cn: '远离水组玩家',
          ko: '물 플레이어 피하기',
        },
      },
    },
    {
      id: 'R10S Sick Swell Wave Collector',
      type: 'Tether',
      netRegex: { source: 'Deep Blue', id: headMarkerData['sickSwellTether'], capture: true },
      // Slight delay as this line/packet arrives at the same time as ActorSetPos
      delaySeconds: 0.1,
      run: (data, matches) => {
        const actor = data.actorPositions[matches.targetId];
        if (actor === undefined)
          return;

        data.waveDir = Directions.xyToCardinalDirOutput(actor.x, actor.y, center.x, center.y);
      },
    },
    {
      id: 'R10S Sick Swell',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B5CE', capture: true },
      delaySeconds: 1, // Delay to align with 7s castTime - 6
      alertText: (data, matches, output) => {
        const castX = parseFloat(matches.x);
        const castY = parseFloat(matches.y);

        const kbDir = data.waveDir;

        if (kbDir === 'dirE' || kbDir === 'dirW') {
          if (castY < 95)
            return output.text!({ dir1: output[kbDir]!(), dir2: output['dirN']!() });
          else if (castY > 105)
            return output.text!({ dir1: output[kbDir]!(), dir2: output['dirS']!() });
          return output.text!({ dir1: output[kbDir]!(), dir2: output.middle!() });
        }

        if (castX < 95)
          return output.text!({ dir1: output[kbDir]!(), dir2: output['dirW']!() });
        else if (castX > 105)
          return output.text!({ dir1: output[kbDir]!(), dir2: output['dirE']!() });
        return output.text!({ dir1: output[kbDir]!(), dir2: output.middle!() });
      },
      outputStrings: {
        middle: Outputs.middle,
        text: {
          en: 'KB from ${dir1} + away from ${dir2}',
          de: 'Rückstoß von ${dir1} + weg von ${dir2}',
          fr: 'Poussée depuis ${dir1} + loin de ${dir2}',
          cn: '从${dir1}击退 + 远离${dir2}',
          ko: '${dir1}에서 넉백 + ${dir2}쪽 피하기',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    {
      id: 'R10S Sick Swell Wave Collector (Snaking)',
      type: 'Tether',
      netRegex: { source: 'Deep Blue', id: headMarkerData['sickSwellTether'], capture: true },
      condition: (data) => data.phase === 'snaking',
      // Slight delay as this line/packet arrives at the same time as ActorSetPos
      delaySeconds: 0.1,
      // Only run once
      durationSeconds: 10.2,
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.targetId];
        if (actor === undefined)
          return;

        const waveDir = Directions.xyTo4DirNum(actor.x, actor.y, center.x, center.y);
        const waveDirOutput = Directions.outputCardinalDir[waveDir];
        const coneDir = (Directions.xyTo4DirNum(actor.x, actor.y, center.x, center.y) + 2) % 4;
        const coneDirOutput = Directions.outputCardinalDir[coneDir];

        return output.text!({
          waveDir: output[waveDirOutput ?? 'unknown']!(),
          coneDir: output[coneDirOutput ?? 'unknown']!(),
        });
      },
      outputStrings: {
        text: {
          en: 'Wave ${waveDir}/Cone ${coneDir}',
          de: 'Welle ${waveDir}/Kegel ${coneDir}',
          fr: 'Vague ${waveDir} / Cône ${coneDir}',
          cn: '${waveDir} 击退/${coneDir} 两侧',
          ko: '파도 ${waveDir}/부채꼴 ${coneDir}',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    {
      id: 'R10S Reverse Alley-oop/Alley-oop Double-dip',
      // TODO: Handle Arena Split with boss/postion checking?
      type: 'StartsUsing',
      netRegex: { id: ['B5E0', 'B5DD'], source: 'Deep Blue', capture: true },
      condition: (data) => {
        return data.snakingDebuff !== 'fire';
      },
      durationSeconds: (data) => data.phase === 'arenaSplit' ? 8 : 3,
      infoText: (data, matches, output) => {
        // During snaking it is always move since the baits are too close
        if (data.phase === 'snaking')
          return output.watersnaking!({
            protean: output.protean!(),
            action: output.move!(),
          });
        if (data.phase === 'arenaSplit') {
          return matches.id === 'B5E0'
            ? output.arenaSplitReverse!()
            : output.arenaSplitDoubleDip!();
        }
        const action = matches.id === 'B5E0' ? output.stay!() : output.move!();
        return output.text!({ protean: output.protean!(), action: action });
      },
      outputStrings: {
        protean: Outputs.protean,
        move: Outputs.moveAway,
        stay: {
          en: 'Stay',
          de: 'Bleib stehen',
          fr: 'Restez',
          cn: '停',
          ko: '대기',
          tc: '停',
        },
        text: {
          en: '${protean} => ${action}',
          de: '${protean} => ${action}',
          fr: '${protean} => ${action}',
          cn: '${protean} => ${action}',
          ko: '${protean} => ${action}',
        },
        watersnaking: {
          en: '${protean} => ${action}',
          de: '${protean} => ${action}',
          fr: '${protean} => ${action}',
          cn: '${protean} => ${action}',
          ko: '${protean} => ${action}',
        },
        arenaSplitReverse: {
          en: 'Reverse Alley-oop',
          de: 'Umgekehrter Alley-Oop',
          fr: 'Alley-oop inversé',
          cn: '要停',
          ko: '대기',
        },
        arenaSplitDoubleDip: {
          en: 'Double-Dip Protean',
          de: 'Doppel-Alley-Oop',
          fr: 'Double Alley-oop',
          cn: '要动',
          ko: '이동',
        },
      },
    },
    {
      id: 'R10S Reverse Alley-oop/Alley-oop Double-dip 2nd Hit',
      // TODO: Handle Arena Split with boss/postion checking?
      type: 'Ability',
      netRegex: { id: ['B5E0', 'B5DD'], source: 'Deep Blue', capture: true },
      condition: (data) => {
        return data.snakingDebuff !== 'fire' && data.phase !== 'arenaSplit';
      },
      infoText: (data, matches, output) => {
        // During saking it is always move since the baits are too close.
        if (data.phase === 'snaking')
          return output.move!();
        return matches.id === 'B5E0' ? output.stay!() : output.move!();
      },
      outputStrings: {
        move: Outputs.moveAway,
        stay: {
          en: 'Stay',
          de: 'Bleib stehen',
          fr: 'Restez',
          cn: '停',
          ko: '대기',
          tc: '停',
        },
      },
    },
    {
      id: 'R10S Xtreme Spectacular',
      type: 'StartsUsing',
      netRegex: { id: 'B5D9', source: 'Red Hot', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go N/S + Big AoE',
          de: 'Geh N/S + Große AoE',
          fr: 'Allez N/S + Grosse AoE',
          cn: '去上/下 + 高伤害 AOE',
          ko: '남/북쪽으로 + 강한 전체 공격',
        },
      },
    },
    {
      id: 'R10S Snaking Flags Collector',
      type: 'MapEffect',
      netRegex: {
        location: Object.values(snakingSlots),
        flags: Object.keys(snakingFlags),
        capture: true,
      },
      preRun: (data, matches) => {
        const slot = matches.location;
        const flags = matches.flags;
        const snaking = snakingFlags[flags];

        if (snaking === undefined) {
          console.log(`Could not find snaking mapping for slot ${slot}, flags ${flags}`);
          return;
        }

        if (snaking.elem === 'water')
          data.snakings = [snaking, ...data.snakings];
        else
          data.snakings.push(snaking);

        if (snaking.elem === 'fire' && (snaking.mech !== 'buster' || data.snakingCount < 4))
          data.snakingCount++;
      },
      durationSeconds: 6,
      infoText: (data, _matches, output) => {
        const [snaking1, snaking2] = data.snakings;

        if (snaking1 === undefined || snaking2 === undefined)
          return;

        if (data.snakingCount < 5) {
          return output.text1!({
            water: output[snaking1.elem]!(),
            waterMech: output[snaking1.mech]!(),
            fire: output[snaking2.elem]!(),
            fireMech: output[snaking2.mech]!(),
          });
        }

        let swap: 'tank' | 'healer' | 'melee' | 'ranged';
        if (snaking1.mech === 'buster')
          swap = 'tank';
        else if (data.snakingCount === 5)
          swap = 'healer';
        else if (data.snakingCount === 6)
          swap = 'melee';
        else
          swap = 'ranged';

        return output.text2!({
          mech: output[snaking1.mech]!(),
          swap: output.swapText!({
            role: output[swap]!(),
          }),
        });
      },
      run: (data) => {
        if (data.snakings.length > 1)
          data.snakings = [];
      },
      outputStrings: {
        text1: {
          en: '${water}: ${waterMech}/${fire}: ${fireMech}',
          de: '${water}: ${waterMech}/${fire}: ${fireMech}',
          fr: '${water}: ${waterMech} / ${fire}: ${fireMech}',
          cn: '${water}: ${waterMech}/${fire}: ${fireMech}',
          ko: '${water}: ${waterMech}/${fire}: ${fireMech}',
        },
        text2: {
          en: '${mech} (${swap})',
          de: '${mech} (${swap})',
          fr: '${mech} (${swap})',
          cn: '${mech} (${swap})',
          ko: '${mech} (${swap})',
        },
        fire: {
          en: 'Fire',
          de: 'Feuer',
          fr: 'Feu',
          cn: '火',
          ko: '불',
        },
        water: {
          en: 'Water',
          de: 'Wasser',
          fr: 'Eau',
          cn: '水',
          ko: '물',
        },
        stack: Outputs.getTogether,
        protean: Outputs.protean,
        // Not using Outputs.tankBuster for brevity
        buster: {
          en: 'Buster',
          de: 'Tankbuster',
          fr: 'Buster',
          cn: '死刑',
          ko: '탱버',
        },
        swapText: {
          en: '${role} Swap',
          de: '${role} wechsel',
          fr: 'Échange ${role}',
          cn: '${role} 交换',
          ko: '${role} 교대',
        },
        tank: Outputs.tank,
        healer: Outputs.healer,
        melee: {
          en: 'Melee',
          de: 'Nahkämpfer',
          fr: 'Mêlée',
          cn: '近战',
          ko: '근딜',
        },
        ranged: {
          en: 'Ranged',
          de: 'Fernkämpfer',
          fr: 'Distant',
          cn: '远程',
          ko: '원딜',
        },
      },
    },
    {
      id: 'R10S Deep Impact Buster',
      type: 'StartsUsing',
      netRegex: { id: 'B5B7', source: 'Deep Blue', capture: false },
      condition: (data) => {
        // Let Pyrotation trigger for non tanks in final phase
        if (data.role !== 'tank' && data.phase === 'xtremeSnaking')
          return false;
        return data.snakingDebuff !== 'fire';
      },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.baitBlueBuster!();
        return output.beNearBlue!();
      },
      outputStrings: {
        beNearBlue: {
          en: 'Be Near Blue',
          de: 'Sei nahe Blau',
          fr: 'Près de Blue',
          cn: '靠近深蓝',
          ko: '블루 가까이 있기',
        },
        baitBlueBuster: {
          en: 'Bait Blue Knockback Buster',
          de: 'Ködere blauen Rückstoß-Tankbuster',
          fr: 'Déposez le tankbuster de Blue (poussée)',
          cn: '引导深蓝坦克击退死刑',
          ko: '블루 넉백 탱버 유도',
        },
      },
    },
    {
      id: 'R10S Firesnaking/WaterSnaking',
      type: 'StartsUsing',
      netRegex: { id: 'B381', source: 'Red Hot', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R10S Snaking Debuff Collect',
      // 136E Firesnaking
      // 136F Watersnaking
      type: 'GainsEffect',
      netRegex: { effectId: ['136E', '136F'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        data.snakingDebuff = matches.effectId === '136E' ? 'fire' : 'water';
      },
    },
    {
      id: 'R10S Snaking Debuff Cleanup',
      type: 'LosesEffect',
      netRegex: { effectId: ['136E', '136F'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.snakingDebuff = undefined,
    },
    {
      id: 'R10S Snaking Debuff Target',
      type: 'GainsEffect',
      netRegex: { effectId: ['136E', '136F'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        if (matches.effectId === '136E')
          return output.firesnaking!();
        return output.watersnaking!();
      },
      outputStrings: {
        firesnaking: {
          en: 'Red\'s Target',
          de: 'Rotes Ziel',
          fr: 'Ciblé par Red',
          cn: '火组',
          ko: '레드',
        },
        watersnaking: {
          en: 'Blue\'s Target',
          de: 'Blaues Ziel',
          fr: 'Ciblé par Blue',
          cn: '水组',
          ko: '블루',
        },
      },
    },
    {
      id: 'R10S Deep Varial',
      type: 'MapEffect',
      netRegex: {
        location: ['02', '04'],
        flags: ['00800040', '08000400'],
        capture: true,
      },
      infoText: (_data, matches, output) => {
        const dir = matches.location === '02' ? 'north' : 'south';
        const mech = matches.flags === '00800040' ? 'stack' : 'spread';
        return output.text!({
          dir: output[dir]!(),
          mech: output[mech]!(),
        });
      },
      outputStrings: {
        north: Outputs.north,
        south: Outputs.south,
        stack: {
          en: 'Water Stack',
          de: 'Wasser sammeln',
          fr: 'Package Eau',
          cn: '水分摊',
          ko: '물 쉐어',
        },
        spread: {
          en: 'Water Spread',
          de: 'Wasser verteilen',
          fr: 'Dispersion Eau',
          cn: '水分散',
          ko: '물 산개',
        },
        text: {
          en: '${dir} + ${mech} + Fire Spread',
          de: '${dir} + ${mech} + Feuer verteilen',
          fr: '${dir} + ${mech} + Dispersion Feu',
          cn: '${dir} + ${mech} + 火分散',
          ko: '${dir} + ${mech} + 불 산개',
        },
      },
    },
    {
      id: 'R10S Hot Aerial',
      type: 'StartsUsing',
      netRegex: { id: 'B5C4', source: 'Red Hot', capture: false },
      condition: (data) => {
        return data.snakingDebuff === 'fire';
      },
      infoText: (_data, _matches, output) => output.baitHotAerial!(),
      outputStrings: {
        baitHotAerial: {
          en: 'Bait Hot Aerial',
          de: 'Köder Flammensprung',
          fr: 'Déposez Flamme aérienne',
          cn: '引导四连跳',
          ko: '불꽃 공중회전 유도',
        },
      },
    },
    {
      id: 'R10S Deep Aerial Tower',
      type: 'StartsUsing',
      netRegex: { id: 'B5E3', source: 'Deep Blue', capture: false },
      infoText: (_data, _matches, output) => output.getTower!(),
      outputStrings: {
        getTower: {
          en: 'Get Tower',
          de: 'Turm nehmen',
          fr: 'Prenez la tour',
          ja: '塔を踏む',
          cn: '踩塔',
          ko: '탑 밟기',
          tc: '踩塔',
        },
      },
    },
    {
      id: 'R10S Xtreme Wave Tethers',
      type: 'HeadMarker',
      netRegex: {
        id: [headMarkerData['redTether'], headMarkerData['blueTether']],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        if (matches.id === headMarkerData['redTether'])
          return output.redTether!();
        return output.blueTether!();
      },
      outputStrings: {
        redTether: {
          en: 'Red Tether on YOU',
          de: 'Rote Verbindung auf DIR',
          fr: 'Lien Rouge sur VOUS',
          cn: '火线点名',
          ko: '레드 선 대상자',
        },
        blueTether: {
          en: 'Blue Tether on YOU',
          de: 'Blaue Verbindung auf DIR',
          fr: 'Lien Bleu sur VOUS',
          cn: '水线点名',
          ko: '블루 선 대상자',
        },
      },
    },
    {
      id: 'R10S Flame Floater Split',
      type: 'StartsUsing',
      netRegex: { id: 'B5D4', source: 'Red Hot', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'E/W Groups, Out of Middle',
          de: 'O/W Grußßen, Raus aus der Mitte',
          fr: 'Groupes E/O, Sortez du milieu',
          cn: '左右分组，远离中间',
          ko: '동/서 그룹, 중앙 피하기',
        },
      },
    },
    {
      id: 'R10S Xtreme Firesnaking/WaterSnaking',
      type: 'StartsUsing',
      netRegex: { id: 'B5AE', source: 'Red Hot', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R10S Xtreme Firesnaking/WaterSnaking Debuffs',
      type: 'GainsEffect',
      netRegex: { effectId: ['12DB', '12DC'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, matches, output) => {
        if (matches.effectId === '12DB')
          return output.xtremeFiresnaking!();
        return output.xtremeWatersnaking!();
      },
      outputStrings: {
        xtremeFiresnaking: {
          en: 'Red Debuff (Fire)',
          de: 'Roter Debuff (Feuer)',
          fr: 'Debuff Rouge (Feu)',
          cn: '火 Debuff',
          ko: '레드 디버프 (불)',
        },
        xtremeWatersnaking: {
          en: 'Blue Debuff (Water)',
          de: 'Blauer Debuff (Wasser)',
          fr: 'Debuff Bleu (Eau)',
          cn: '水 Debuff',
          ko: '블루 디버프 (물)',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Reverse Alley-oop/Alley-oop Double-dip': 'Reverse Alley-oop/Double-dip',
        'Awesome Splash/Awesome Slab': 'Awesome Splash/Slab',
        'Blasting Snap/Plunging Snap/Re-entry Blast': 'Blasting/Plunging/Re-entry',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Deep Blue': 'Indigowelle',
        'Red Hot': 'Scharlachflamme',
        'The Xtremes': 'Team Extrem',
        'Watery Grave': 'Wasserkerker',
      },
      'replaceText': {
        '--add-targetable--': '--add anvisierbar--',
        '--add-untargetable--': '--add nicht anvisierbar--',
        '--blue east/west--': '--blau osten/westen--',
        '--blue targetable--': '--blau anvisierbar--',
        '--blue untargetable--': '--blau nicht anvisierbar--',
        '--hot jump--': '--Flammensprung--',
        '--intercardinal--': '--interkardinal--',
        '--red north--': '--rot norden--',
        '\\(bait\\)': '(Ködern)',
        '\\(big\\)': '(Groß)',
        '\\(cone\\)': '(Kegel)',
        '\\(damage': '(Schaden',
        '\\(enrage\\)': '(Finalangriff)',
        '\\(line\\)': '(Linie)',
        '\\(tower\\)': '(Turm)',
        'Alley-oop Double-dip': 'Doppel-Alley-Oop',
        'Alley-oop Inferno': 'Flammen-Alley-Oop',
        'Awesome Slab': 'Heftiger Hydroplatscher',
        'Awesome Splash': 'Hydroplatscher',
        'Bailout': 'Abstieg',
        'Blasting Snap': 'Flammenruck',
        'Cutback Blaze': 'Flammen-Rückschnitt',
        'Deep Varial': 'Hydro-Halbdreher',
        'Divers\' Dare': 'Brodelnder Kampfgeist',
        'Epic Brotherhood': 'Brüderbund',
        '(?<! )Firesnaking': 'Flammen-Schlängeln',
        'Flame Floater': 'Flammenschweber',
        'Freaky Pyrotation': 'Abgefahrener Pyro-Dreher',
        'Hot Aerial': 'Flammensprung',
        'Hot Impact': 'Flammenklopper',
        'Insane Air': 'Wahnsinnsritt',
        'Plunging Snap': 'Hydroruck',
        '(?<! )Pyrotation': 'Pyrodreher',
        'Reverse Alley-oop': 'Umgekehrter Alley-Oop',
        'Scathing Steam': 'Mischexplosion',
        'Sick Swell': 'Fette Welle',
        'Sickest Take-off': 'Fetter Absprung',
        'stun\\)': 'Betäuben)',
        '(?<! )Watersnaking': 'Hydro-Schlängeln',
        'Xtreme Firesnaking': 'Extremes Flammen-Schlängeln',
        'Xtreme Spectacular': 'Ultimatives Extremmanöver',
        'Xtreme Watersnaking': 'Extremes Hydro-Schlängeln',
        'Xtreme Wave': 'Extremwelle',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Deep Blue': 'Deep Blue',
        'Red Hot': 'Red Hot',
        'The Xtremes': 'Les Xtrêmes',
        'Watery Grave': 'prison aquatique',
      },
      'replaceText': {
        'Alley-oop Inferno': 'Alley-oop enflammé',
        'Awesome Slab': 'Éclaboussement hydrique puissant',
        'Awesome Splash': 'Éclaboussement hydrique',
        'Blasting Snap': 'Claquement enflammé',
        'Cutback Blaze': 'Riposte enflammée',
        'Deep Aerial': 'Flot aérien',
        'Deep Impact': 'Impact puissant',
        'Deep Varial': 'Barrière hydrique',
        'Divers\' Dare': 'Esprit combatif',
        'Epic Brotherhood': 'Fraternité',
        '(?<! )Firesnaking': 'Ondulation enflammée',
        'Flame Floater': 'Surfeur enflammé',
        'Freaky Pyrotation': 'Rotation incandescente chaotique',
        'Hot Aerial': 'Flamme aérienne',
        'Hot Impact': 'Impact brûlant',
        'Impact Zone': 'Rupture énorme',
        'Insane Air': 'Figure démentielle',
        'Over the Falls': 'Traversée cataclysmique',
        'Plunging Snap': 'Claquement hydrique',
        '(?<! )Pyrotation': 'Rotation incandescente',
        'Scathing Steam': 'Explosion mélangée',
        'Sick Swell': 'Vague déchaînée',
        'Sickest Take-off': 'Ascension déchaînée',
        '(?<! )Watersnaking': 'Ondulation hydrique',
        'Xtreme Spectacular': 'Spectacle Xtrême',
        'Xtreme Wave': 'Vague Xtrême',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Deep Blue': 'ディープブルー',
        'Red Hot': 'レッドホット',
        'The Xtremes': 'エクストリームズ',
        'Watery Grave': '水牢',
      },
      'replaceText': {
        'Alley-oop Inferno': 'フレイムアリウープ',
        'Awesome Slab': 'ヘビー・ハイドロスプラッシュ',
        'Awesome Splash': 'ハイドロスプラッシュ',
        'Blasting Snap': 'フレイムスナップ',
        'Cutback Blaze': 'フレイムカットバック',
        'Deep Aerial': 'ハイドロエアリアル',
        'Deep Impact': 'ディープインパクト',
        'Deep Varial': 'ハイドロバリエル',
        'Divers\' Dare': 'ファイティングスピリット',
        'Epic Brotherhood': 'ブラザーフッド',
        '(?<! )Firesnaking': 'フレイムスネーキング',
        'Flame Floater': 'フレイムフローター',
        'Freaky Pyrotation': 'フリーキー・パイロローテーション',
        'Hot Aerial': 'フレイムエアリアル',
        'Hot Impact': 'ホットインパクト',
        'Impact Zone': '大破裂',
        'Insane Air': 'インセインエアー',
        'Over the Falls': 'オーバー・ザ・フォール',
        'Plunging Snap': 'ハイドロスナップ',
        '(?<! )Pyrotation': 'パイロローテーション',
        'Scathing Steam': 'ミックスエクスプロージョン',
        'Sick Swell': 'シック・スウェル',
        'Sickest Take-off': 'シック・テイクオフ',
        '(?<! )Watersnaking': 'ハイドロスネーキング',
        'Xtreme Spectacular': 'エクストリーム・スペクタクル',
        'Xtreme Wave': 'エクストリームウェーブ',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Deep Blue': '深蓝',
        'Red Hot': '炽红',
        'The Xtremes': '极限兄弟',
        'Watery Grave': '水牢',
      },
      'replaceText': {
        '--add-targetable--': '--小怪可选中--',
        '--add-untargetable--': '--小怪不可选中--',
        '--blue east/west--': '--深蓝 东/西--',
        '--blue targetable--': '--深蓝可选中--',
        '--blue untargetable--': '--深蓝不可选中--',
        '--hot jump--': '--炽红 跳--',
        '--intercardinal--': '--四边中点--',
        '--red north--': '--炽红 北--',
        '\\(bait\\)': '(引导)',
        '\\(big\\)': '(大)',
        '\\(cone\\)': '(扇形)',
        '\\(damage': '(伤害',
        '\\(enrage\\)': '(狂暴)',
        '\\(line\\)': '(直线)',
        'stun\\)': '眩晕)',
        '\\(tower\\)': '(塔)',
        'Alley-oop Double-dip': '双重旋水',
        'Alley-oop Inferno': '空中旋火',
        'Awesome Slab': '浪涛翻涌',
        'Awesome Splash': '浪花飞溅',
        'Bailout': '救生',
        'Blasting Snap': '火浪急转',
        'Cutback Blaze': '火浪回切',
        'Deep Aerial': '腾水踏浪',
        'Deep Impact': '深海冲击',
        'Deep Varial': '浪尖转体',
        'Divers\' Dare': '斗志昂扬',
        'Epic Brotherhood': '兄弟同心',
        '(?<! )Firesnaking': '火蛇夺浪',
        'Flame Floater': '浪顶炽火',
        'Freaky Pyrotation': '异常旋绕巨火',
        'Hot Aerial': '腾火踏浪',
        'Hot Impact': '炽焰冲击',
        'Impact Zone': '浪崩',
        'Insane Air': '狂浪腾空',
        'Over the Falls': '无归浪卷',
        'Plunging Snap': '水浪急转',
        '(?<! )Pyrotation': '旋绕巨火',
        'Re-entry Blast': '炽红返场',
        'Reverse Alley-oop': '交错旋水',
        'Scathing Steam': '混合爆破',
        'Sick Swell': '惊涛骇浪',
        'Sickest Take-off': '破势乘浪',
        '(?<! )Watersnaking': '水蛇夺浪',
        'Xtreme Firesnaking': '极限火蛇夺浪',
        'Xtreme Spectacular': '极限炫技',
        'Xtreme Watersnaking': '极限水蛇夺浪',
        'Xtreme Wave': '极限浪波',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Deep Blue': '딥 블루',
        'Red Hot': '레드 핫',
        'The Xtremes': '익스트림즈',
        'Watery Grave': '수중 감옥',
      },
      'replaceText': {
        '--add-targetable--': '--쫄 타겟가능--',
        '--add-untargetable--': '--쫄 타겟불가--',
        '--blue east/west--': '--블루 동/서--',
        '--blue targetable--': '--블루 타겟가능--',
        '--blue untargetable--': '--블루 타겟불가능--',
        '--hot jump--': '--레드 점프--',
        '--intercardinal--': '--대각선--',
        '--red north--': '--레드 북쪽--',
        '\\(bait\\)': '(유도)',
        '\\(big\\)': '(강력)',
        '\\(cone\\)': '(부채꼴)',
        '\\(damage': '(피해',
        '\\(enrage\\)': '(전멸기)',
        '\\(line\\)': '(직선)',
        'stun\\)': '기절)',
        '\\(tower\\)': '(탑)',
        // 'Alley-oop Double-dip': 'Alley-oop Double-dip',
        'Alley-oop Inferno': '불꽃 뛰어돌기',
        'Awesome Slab': '물결 뒤덮기',
        'Awesome Splash': '물결 덮기',
        // 'Bailout': 'Bailout',
        'Blasting Snap': '불꽃 급선회',
        'Cutback Blaze': '불꽃 되돌기',
        'Deep Aerial': '물결 공중회전',
        'Deep Impact': '딥 임팩트',
        'Deep Varial': '물결 보드 꺾기',
        'Divers\' Dare': '끓어오르는 투지',
        'Epic Brotherhood': '형제애',
        '(?<! )Firesnaking': '불꽃 선점',
        'Flame Floater': '불꽃 올라타기',
        'Freaky Pyrotation': '기묘한 화염 회전',
        'Hot Aerial': '불꽃 공중회전',
        'Hot Impact': '핫 임팩트',
        'Impact Zone': '대파열',
        'Insane Air': '광란의 공중 기술',
        'Over the Falls': '집어삼키는 파도',
        'Plunging Snap': '물결 급선회',
        '(?<! )Pyrotation': '화염 회전',
        // 'Re-entry Blast': 'Re-entry Blast',
        // 'Reverse Alley-oop': 'Reverse Alley-oop',
        'Scathing Steam': '물불 작렬',
        'Sick Swell': '끝내주는 파도',
        'Sickest Take-off': '끝내주는 파도오름',
        '(?<! )Watersnaking': '물결 선점',
        // 'Xtreme Firesnaking': 'Xtreme Firesnaking',
        'Xtreme Spectacular': '익스트림 스펙터클',
        // 'Xtreme Watersnaking': 'Xtreme Watersnaking',
        'Xtreme Wave': '익스트림 웨이브',
      },
    },
  ],
};

export default triggerSet;
