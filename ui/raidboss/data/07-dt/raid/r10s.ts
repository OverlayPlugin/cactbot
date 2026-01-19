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
          fr: 'Déposez en ${order}',
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
            fr: 'Extérieur + Dispersion => Package près de Blue',
          },
          spreadFinalBait: {
            en: 'Out + Spread => Bait Blue Knockback Buster',
            fr: 'Extérieur + Dispersion => Déposez le tankbuster de Blue',
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
          fr: 'Déposez le cleave vers le Feu',
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
          fr: '${stack} près de Blue',
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
          fr: 'Package Eau',
        },
        waterStackFireDebuff: {
          en: 'Water Stack',
          fr: 'Package Eau',
        },
        waterSpread: Outputs.spread,
        waterSpreadFireDebuff: {
          en: 'Avoid Water Players',
          fr: 'Évitez les joueurs Eau',
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
          fr: 'Poussée depuis ${dir1} + loin de ${dir2}',
          cn: '从${dir1}击退 + 远离${dir2}',
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
          fr: 'Vague ${waveDir}/Cône ${coneDir}',
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
          fr: '${protean} => ${action}',
        },
        watersnaking: {
          en: '${protean} => ${action}',
          fr: '${protean} => ${action}',
        },
        arenaSplitReverse: {
          en: 'Reverse Alley-oop',
          fr: 'Alley-oop inversé',
        },
        arenaSplitDoubleDip: {
          en: 'Double-Dip Protean',
          fr: 'Double Alley-oop',
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
          fr: 'Allez N/S + Grosse AoE',
          cn: '去上/下 + 高伤害 AOE',
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
          fr: '${water}: ${waterMech}/${fire}: ${fireMech}',
        },
        text2: {
          en: '${mech} (${swap})',
          fr: '${mech} (${swap})',
        },
        fire: {
          en: 'Fire',
          fr: 'Feu',
        },
        water: {
          en: 'Water',
          fr: 'Eau',
        },
        stack: Outputs.getTogether,
        protean: Outputs.protean,
        // Not using Outputs.tankBuster for brevity
        buster: {
          en: 'Buster',
          fr: 'Buster',
        },
        swapText: {
          en: '${role} Swap',
          fr: 'Échange ${role}',
        },
        tank: Outputs.tank,
        healer: Outputs.healer,
        melee: {
          en: 'Melee',
          fr: 'Mêlée',
        },
        ranged: {
          en: 'Ranged',
          fr: 'Distant',
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
          fr: 'Près de Blue',
        },
        baitBlueBuster: {
          en: 'Bait Blue Knockback Buster',
          fr: 'Déposez le tankbuster de Blue (poussée)',
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
          fr: 'Ciblé par Red',
        },
        watersnaking: {
          en: 'Blue\'s Target',
          fr: 'Ciblé par Blue',
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
          fr: 'Package Eau',
        },
        spread: {
          en: 'Water Spread',
          fr: 'Dispersion Eau',
        },
        text: {
          en: '${dir} + ${mech} + Fire Spread',
          fr: '${dir} + ${mech} + Dispersion Feu',
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
          fr: 'Déposez Flamme aérienne',
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
          ko: '장판 들어가기',
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
          fr: 'Lien Rouge sur VOUS',
        },
        blueTether: {
          en: 'Blue Tether on YOU',
          fr: 'Lien Bleu sur VOUS',
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
          fr: 'Groupes E/O, Sortez du milieu',
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
          fr: 'Debuff Rouge (Feu)',
        },
        xtremeWatersnaking: {
          en: 'Blue Debuff (Water)',
          fr: 'Debuff Bleu (Eau)',
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
  ],
};

export default triggerSet;
