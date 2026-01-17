import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type Phase = 'one' | 'arenaSplit' | 'ecliptic';

export interface Data extends RaidbossData {
  phase: Phase;
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  weapons: {
    id: string;
    type: 'stack' | 'healerGroups' | 'protean';
    dir: number;
    actor: { x: number; y: number; heading: number };
  }[];
  weaponMechCount: number;
  domDirectionCount: {
    vertCount: number;
    horizCount: number;
    outerSafe: DirectionOutputCardinal[];
  };
  hasMeteor: boolean;
  fireballCount: number;
  hasAtomic: boolean;
  meteowrathTetherDirNum?: number;
  heartbreakerCount: number;
}

const center = {
  x: 100,
  y: 100,
};

const phaseMap: { [id: string]: Phase } = {
  'B43F': 'arenaSplit', // Flatliner
  'B452': 'ecliptic', // Ecliptic Stampede
};

const headMarkerData = {
  // Vfx Path: target_ae_s5f
  'cometSpread': '008B',
  // Vfx Path: com_share4a1
  'partnerStack': '00A1',
  // Vfx Path: com_share3t
  'fiveHitStack': '0131',
  // Vfx Path: lockon8_t0w
  'meteor': '00F4',
  'fireBreath': '00F4',
  // Vfx Path: share_laser_5sec_0t, targets The Tyrant
  'lineStack': '020D',
  // Vfx Path: m0017trg_a0c
  'atomicImpact': '001E',
  'meteorTether': '0164',
  'closeTether': '0039',
  'farTether': '00F9',
} as const;
console.assert(headMarkerData);

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM3Savage',
  zoneId: ZoneId.AacHeavyweightM3Savage,
  timelineFile: 'r11s.txt',
  initData: () => ({
    phase: 'one',
    actorPositions: {},
    weapons: [],
    weaponMechCount: 0,
    domDirectionCount: {
      horizCount: 0,
      vertCount: 0,
      outerSafe: ['dirN', 'dirE', 'dirS', 'dirW'],
    },
    hasMeteor: false,
    fireballCount: 0,
    hasAtomic: false,
    heartbreakerCount: 0,
  }),
  timelineTriggers: [
    {
      id: 'R11S Powerful Gust',
      regex: /Powerful Gust/,
      beforeSeconds: 6.3,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Gust',
        },
      },
    },
  ],
  triggers: [
    {
      id: 'R11S Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phaseMap), source: 'The Tyrant' },
      suppressSeconds: 1,
      run: (data, matches) => {
        const phase = phaseMap[matches.id];
        if (phase === undefined)
          throw new UnreachableCode();

        data.phase = phase;
      },
    },
    {
      id: 'R11S ActorSetPos Tracker',
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
      id: 'R11S Crown of Arcadia',
      type: 'StartsUsing',
      netRegex: { id: 'B406', source: 'The Tyrant', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'R11S Raw Steel Trophy Axe',
      type: 'StartsUsing',
      netRegex: { id: 'B422', capture: false },
      infoText: (_data, _matches, output) => {
        return output.text!({
          party: output.partySpread!(),
          tank: output.sharedTankStack!(),
        });
      },
      outputStrings: {
        partySpread: {
          en: 'Party Spread',
        },
        sharedTankStack: {
          en: 'Tank Stack',
          de: 'Tanks Sammeln',
          fr: 'Package Tanks',
          ja: 'タンク頭割り',
          cn: '坦克分摊',
          ko: '탱끼리 모이기',
          tc: '坦克分攤',
        },
        text: {
          en: '${party}/${tank}',
        },
      },
    },
    {
      id: 'R11S Raw Steel Trophy Scythe',
      type: 'StartsUsing',
      netRegex: { id: 'B423', capture: false },
      infoText: (_data, _matches, output) => {
        return output.text!({
          party: output.partyStack!(),
          tank: output.tankCleaves!(),
        });
      },
      outputStrings: {
        partyStack: {
          en: 'Party Stack',
          de: 'In der Gruppe sammeln',
          fr: 'Package en groupe',
          ja: 'あたまわり',
          cn: '分摊',
          ko: '쉐어',
          tc: '分攤',
        },
        tankCleaves: {
          en: 'Tank Cleaves',
          de: 'Tank Cleaves',
          fr: 'Tank Cleaves',
          ja: 'タンク前方攻撃',
          cn: '坦克顺劈',
          ko: '광역 탱버',
          tc: '坦克順劈',
        },
        text: {
          en: '${party}/${tank}',
        },
      },
    },
    // For logic reasons Ultimate has to be before normal Trophy Weapons
    {
      id: 'R11S Ultimate Trophy Weapons',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: ['11D1', '11D2', '11D3'], capture: true },
      condition: (data) => data.weaponMechCount > 1,
      delaySeconds: (data) => {
        if (data.weaponMechCount > 2)
          return 3.7;
        return 0;
      },
      durationSeconds: (data) => {
        if (data.weaponMechCount < 3)
          return 8.7;
        return 5;
      },
      countdownSeconds: (data) => {
        if (data.weaponMechCount < 3)
          return 8.7;
        return 5;
      },
      infoText: (_data, matches, output) => {
        const mechanic = matches.param1 === '11D1'
          ? 'healerGroups'
          : (matches.param1 === '11D2' ? 'stack' : 'protean');

        return output[mechanic]!();
      },
      run: (data) => data.weaponMechCount++,
      outputStrings: {
        healerGroups: Outputs.healerGroups,
        stack: Outputs.stackMiddle,
        protean: Outputs.protean,
      },
    },
    {
      id: 'R11S Trophy Weapons',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: ['11D1', '11D2', '11D3'], capture: true },
      condition: (data) => data.weaponMechCount < 2,
      delaySeconds: (data) => {
        if (data.weaponMechCount === 0)
          return 0.1;
        if (data.weaponMechCount === 1)
          return 10.6;
        return 0.1;
      },
      durationSeconds: (data) => {
        if (data.weaponMechCount < 2)
          return 20.9;
        return 0;
      },
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.id];

        if (actor === undefined)
          return;

        data.weapons.push({
          id: matches.id,
          type: matches.param1 === '11D1'
            ? 'healerGroups'
            : (matches.param1 === '11D2' ? 'stack' : 'protean'),
          dir: Math.atan2(actor.x - center.x, actor.y - center.y),
          actor: actor,
        });
        // Have info for 1st or 2nd mech
        if (data.weaponMechCount < 2 && data.weapons.length > 2) {
          data.weaponMechCount++;
          let candidates = data.weapons;
          data.weapons = [];

          // First weapon is the one facing towards middle
          const weapon1 = candidates.find((c) =>
            (Math.abs(c.dir - c.actor.heading) % Math.PI) < 0.1
          );
          if (weapon1 === undefined)
            return;
          candidates = candidates.filter((c) => c !== weapon1);
          // remap dir to weapon1
          candidates.forEach((c) => {
            c.dir = Math.atan2(c.actor.x - weapon1.actor.x, c.actor.y - weapon1.actor.y);
          });
          // second weapon is facing first weapon
          const weapon2 = candidates.find((c) =>
            (Math.abs(c.dir - c.actor.heading) % Math.PI) < 0.1
          );
          // third weapon is the last remaining one
          const weapon3 = candidates.find((c) => c !== weapon2);
          if (weapon2 === undefined || weapon3 === undefined)
            return;
          return output.text!({
            weapon1: output[weapon1.type]!(),
            weapon2: output[weapon2.type]!(),
            weapon3: output[weapon3.type]!(),
          });
        }
      },
      outputStrings: {
        text: {
          en: '${weapon1} => ${weapon2} => ${weapon3}',
        },
        healerGroups: Outputs.healerGroups,
        stack: Outputs.stackMiddle,
        protean: Outputs.protean,
      },
    },
    {
      id: 'R11S Comet Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['cometSpread'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'R11S Crushing Comet',
      type: 'StartsUsing',
      netRegex: { id: 'B415', source: 'The Tyrant', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R11S Dance Of Domination Trophy',
      // 2s cast, but B41F damage cast (0.5s) starts ~6s later.
      type: 'StartsUsing',
      netRegex: { id: 'B7BB', source: 'The Tyrant', capture: false },
      delaySeconds: 3.7, // 5s before AoEs start
      durationSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE x6 => Big AoE',
        },
      },
    },
    {
      id: 'R11S Dance Of Domination Trophy Big AoE',
      // There are 12.9s from B7BB startsUsing to bigAoe B7EA Ability
      type: 'StartsUsing',
      netRegex: { id: 'B7BB', source: 'The Tyrant', capture: false },
      delaySeconds: 8.7, // Around the first hit (B41F)
      durationSeconds: 4.2,
      response: Responses.bigAoe('alert'),
    },
    {
      // Adapted from normal mode
      id: 'R11S Dance Of Domination Trophy Safe Spots',
      // B7BC Explosion
      type: 'StartsUsingExtra',
      netRegex: { id: 'B7BC', capture: true },
      preRun: (data, matches) => {
        // Determine whether the AoE is orthogonal or diagonal
        // Discard diagonal headings, then count orthogonals.
        const headingDirNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        if (headingDirNum % 2 === 0) {
          const isVert = headingDirNum % 4 === 0;
          const isHoriz = headingDirNum % 4 === 2;
          if (isVert) {
            data.domDirectionCount.vertCount += 1;
            if (parseFloat(matches.x) < center.x - 5)
              data.domDirectionCount.outerSafe = data.domDirectionCount.outerSafe.filter((dir) =>
                dir !== 'dirW'
              );
            else if (parseFloat(matches.x) > center.x + 5)
              data.domDirectionCount.outerSafe = data.domDirectionCount.outerSafe.filter((dir) =>
                dir !== 'dirE'
              );
          } else if (isHoriz) {
            data.domDirectionCount.horizCount += 1;
            if (parseFloat(matches.y) < center.y - 5)
              data.domDirectionCount.outerSafe = data.domDirectionCount.outerSafe.filter((dir) =>
                dir !== 'dirN'
              );
            else if (parseFloat(matches.y) > center.y + 5)
              data.domDirectionCount.outerSafe = data.domDirectionCount.outerSafe.filter((dir) =>
                dir !== 'dirS'
              );
          } else {
            console.error(`Bad Domination heading data: ${matches.heading}`);
          }
        }
      },
      infoText: (data, _matches, output) => {
        if (data.domDirectionCount.outerSafe.length !== 1)
          return;

        const outerSafeDir = data.domDirectionCount.outerSafe[0];

        if (outerSafeDir === undefined)
          return;

        if (data.domDirectionCount.vertCount === 1)
          return output.northSouth!({ dir: output[outerSafeDir]!() });
        else if (data.domDirectionCount.horizCount === 1)
          return output.eastWest!({ dir: output[outerSafeDir]!() });
      },
      // clear the safe dirs array to prevent further outputs
      run: (data) => {
        if (data.domDirectionCount.outerSafe.length === 1)
          data.domDirectionCount.outerSafe = [];
      },
      outputStrings: {
        northSouth: {
          en: 'N/S Mid / ${dir} Outer + Partner Stacks',
        },
        eastWest: {
          en: 'E/W Mid / ${dir} Outer + Partner Stacks',
        },
        ...Directions.outputStringsCardinalDir,
      },
    },
    {
      id: 'R11S Charybdistopia',
      type: 'StartsUsing',
      netRegex: { id: 'B425', source: 'The Tyrant', capture: false },
      response: Responses.hpTo1Aoe(),
    },
    {
      id: 'R11S One and Only',
      type: 'StartsUsing',
      netRegex: { id: 'B429', source: 'The Tyrant', capture: false },
      durationSeconds: 6,
      response: Responses.bigAoe(),
    },
    {
      id: 'R11S Great Wall of Fire',
      // Target is boss, Line AOE that will later explode
      type: 'StartsUsing',
      netRegex: { id: 'B42B', source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.sharedTankbuster!(),
      outputStrings: {
        sharedTankbuster: Outputs.sharedTankbuster,
      },
    },
    {
      id: 'R11S Fire and Fury',
      type: 'StartsUsing',
      netRegex: { id: 'B42F', source: 'The Tyrant', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'R11S Meteor',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['meteor'], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target && data.phase === 'one')
          return true;
        return false;
      },
      response: Responses.meteorOnYou(),
      run: (data) => data.hasMeteor = true,
    },
    {
      id: 'R11S Fearsome Fireball',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['lineStack'], capture: false },
      condition: (data) => {
        data.fireballCount = data.fireballCount + 1;
        return !data.hasMeteor;
      },
      delaySeconds: 0.1, // Delay for meteor headmarkers
      alertText: (data, _matches, output) => {
        if (data.fireballCount === 1) {
          if (data.role === 'tank')
            return output.wildChargeTank!();
          return output.wildCharge!();
        }
        if (data.role === 'tank')
          return output.tetherBusters!();
        return output.wildChargeMeteor!();
      },
      run: (data) => data.hasMeteor = false,
      outputStrings: {
        wildCharge: {
          en: 'Wild Charge (behind tank)',
        },
        wildChargeMeteor: {
          en: 'Wild Charge (behind meteor)',
        },
        wildChargeTank: {
          en: 'Wild Charge (be in front)',
        },
        tetherBusters: Outputs.tetherBusters,
      },
    },
    {
      id: 'R11S Meteor Cleanup',
      // Player hit by Cosmic Kiss
      type: 'Ability',
      netRegex: { id: 'B435', source: 'Comet', capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hasMeteor = false,
    },
    {
      id: 'R11S Triple Tyrannhilation',
      type: 'StartsUsing',
      netRegex: { id: 'B43C', source: 'The Tyrant', capture: false },
      alertText: (_data, _matches, output) => output.losMeteor!(),
      outputStrings: {
        losMeteor: {
          en: 'LoS behind 3x meteor',
        },
      },
    },
    {
      id: 'R11S Flatliner',
      type: 'StartsUsing',
      netRegex: { id: 'B43F', source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.flatliner!(),
      outputStrings: {
        flatliner: {
          en: 'Short knockback to sides',
          fr: 'Légère poussée vers les côtés',
          cn: '向两侧短距离击退',
          ko: '양 옆으로 짧은 넉백',
        },
      },
    },
    {
      id: 'R11S Explosion Towers', // Knockback towers
      type: 'StartsUsing',
      netRegex: { id: 'B444', source: 'The Tyrant', capture: false },
      durationSeconds: 10,
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.knockbackTowers!(),
      outputStrings: {
        knockbackTowers: {
          en: 'Get Knockback Towers',
          fr: 'Prenez une tour (poussée)',
          cn: '踩击退塔',
          ko: '넉백탑 들어가기',
        },
      },
    },
    {
      id: 'R11S Fire Breath',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['fireBreath'], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target && data.phase === 'arenaSplit')
          return true;
        return false;
      },
      infoText: (_data, _matches, output) => output.fireBreath!(),
      outputStrings: {
        fireBreath: {
          en: 'Fire Breath on YOU',
        },
      },
    },
    {
      id: 'R11S Massive Meteor',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['fiveHitStack'], capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.stackFivex!(),
      outputStrings: {
        stackFivex: {
          en: 'Stack 5x',
          de: '5x Sammeln',
          fr: '5x Packages',
          ja: '頭割り５回',
          cn: '5连分摊',
          ko: '쉐어 5번',
          tc: '5連分攤',
        },
      },
    },
    {
      id: 'R11S Arcadion Avalanche West Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B44E', 'B450'], source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.westSafe!(),
      outputStrings: {
        westSafe: {
          en: 'Tower Knockback to West',
          fr: 'Prenez une tour (poussée vers l\'Ouest)',
          cn: '被塔击飞到左侧平台',
          ko: '탑 넉백 서쪽으로',
        },
      },
    },
    {
      id: 'R11S Arcadion Avalanche East Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B44A', 'B44C'], source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.eastSafe!(),
      outputStrings: {
        eastSafe: {
          en: 'Tower Knockback to East',
          fr: 'Prenez une tour (poussée vers l\'Est)',
          cn: '被塔击飞到右侧平台',
          ko: '탑 넉백 동쪽으로',
        },
      },
    },
    {
      id: 'R11S Arcadion Avalanche Follow Up North Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B44B', 'B451'], source: 'The Tyrant', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      infoText: (_data, _matches, output) => output.goNorth!(),
      outputStrings: {
        goNorth: Outputs.north,
      },
    },
    {
      id: 'R11S Arcadion Avalanche Follow Up South Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B44D', 'B44F'], source: 'The Tyrant', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      infoText: (_data, _matches, output) => output.goSouth!(),
      outputStrings: {
        goSouth: Outputs.south,
      },
    },
    {
      id: 'R11S Atomic Impact Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['atomicImpact'], capture: true },
      condition: Conditions.targetIsYou(),
      run: (data) => data.hasAtomic = true,
    },
    {
      id: 'R11S Mammoth Meteor',
      // Occurs same time as Atomic Impact headmarkers
      type: 'StartsUsingExtra',
      netRegex: { id: 'B453', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Mammoth Meteor is always at two opposite intercardinals.
        // Once we see one, we know where the safespots are
        // without waiting on the second.
        const meteorX = parseFloat(matches.x);
        const meteorY = parseFloat(matches.y);
        const meteorQuad = Directions.xyToIntercardDirOutput(meteorX, meteorY, center.x, center.y);
        if (data.hasAtomic) {
          if (meteorQuad === 'dirNE' || meteorQuad === 'dirSW')
            return output.comboDir!({ dir1: output.nw!(), dir2: output.se!() });
          return output.comboDir!({ dir1: output.ne!(), dir2: output.sw!() });
        }
        return output.getMiddle!();
      },
      outputStrings: {
        nw: Outputs.dirNW,
        ne: Outputs.dirNE,
        sw: Outputs.dirSW,
        se: Outputs.dirSE,
        comboDir: {
          en: 'Go ${dir1}/${dir2} => Bait Impacts, Avoid Corners',
        },
        getMiddle: {
          en: 'Proximity AoE; Get Middle => Bait Puddles',
        },
      },
    },
    {
      id: 'R11S Cosmic Kiss', // Meteor towers
      type: 'StartsUsing',
      netRegex: { id: 'B456', source: 'The Tyrant', capture: false },
      condition: (data) => {
        if (data.hasAtomic)
          return false;
        return true;
      },
      suppressSeconds: 1,
      response: Responses.getTowers(),
    },
    {
      id: 'R11S Majestic Meteowrath Tethers',
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: true },
      condition: (data, matches) => {
        if (
          data.me === matches.target &&
          data.phase === 'ecliptic' &&
          data.meteowrathTetherDirNum === undefined
        )
          return true;
        return false;
      },
      suppressSeconds: 99,
      promise: async (data, matches) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
          ids: [parseInt(matches.sourceId, 16)],
        })).combatants;
        const actor = actors[0];
        if (actors.length !== 1 || actor === undefined) {
          console.error(
            `R11S Majestic Meteowrath Tethers: Wrong actor count ${actors.length}`,
          );
          return;
        }

        const dirNum = Directions.xyTo8DirNum(actor.PosX, actor.PosY, center.x, center.y);
        data.meteowrathTetherDirNum = dirNum;
      },
      infoText: (data, _matches, output) => {
        if (data.meteowrathTetherDirNum === undefined)
          return;
        type dirNumStretchMap = {
          [key: number]: string;
        };
        // TODO: Make config for options?
        const stretchCW: dirNumStretchMap = {
          0: 'dirSW',
          2: 'dirNW',
          4: 'dirNE',
          6: 'dirSE',
        };
        const stretchDir = stretchCW[data.meteowrathTetherDirNum];
        return output.stretchTetherDir!({ dir: output[stretchDir ?? '???']!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        stretchTetherDir: {
          en: 'Stretch Tether ${dir}',
        },
      },
    },
    {
      id: 'R11S Two-way Fireball',
      type: 'StartsUsing',
      netRegex: { id: 'B7BD', source: 'The Tyrant', capture: false },
      alertText: (data, _matches, output) => {
        if (data.hasAtomic)
          return output.twoWayAtomic!();
        return output.twoWay!();
      },
      outputStrings: {
        twoWay: {
          en: 'East/West Line Stack',
        },
        twoWayAtomic: {
          en: 'Move; East/West Line Stack',
        },
      },
    },
    {
      id: 'R11S Four-way Fireball',
      type: 'StartsUsing',
      netRegex: { id: 'B45A', source: 'The Tyrant', capture: false },
      alertText: (data, _matches, output) => {
        if (data.hasAtomic)
          return output.fourWayAtomic!();
        return output.fourWay!();
      },
      outputStrings: {
        fourWay: {
          en: 'Intercardinal Line Stack',
        },
        fourWayAtomic: {
          en: 'Stay Corner, Intercardinal Line Stack',
        },
      },
    },
    {
      id: 'R11S Heartbreaker (Enrage Sequence)',
      type: 'StartsUsing',
      netRegex: { id: 'B45D', source: 'The Tyrant', capture: false },
      preRun: (data) => data.heartbreakerCount = data.heartbreakerCount + 1,
      infoText: (data, _matches, output) => {
        switch (data.heartbreakerCount) {
          case 1:
            return output.heartbreaker1!({
              tower: output.getTower!(),
              stack: output.stack5x!(),
            });
          case 2:
            return output.heartbreaker2!({
              tower: output.getTower!(),
              stack: output.stack6x!(),
            });
          case 3:
            return output.heartbreaker3!({
              tower: output.getTower!(),
              stack: output.stack7x!(),
            });
        }
      },
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
        stack5x: {
          en: 'Stack 5x',
          de: '5x Sammeln',
          fr: '5x Packages',
          ja: '頭割り５回',
          cn: '5连分摊',
          ko: '쉐어 5번',
          tc: '5連分攤',
        },
        stack6x: {
          en: 'Stack 6x',
        },
        stack7x: {
          en: 'Stack 7x',
        },
        heartbreaker1: {
          en: '${tower} => ${stack}',
        },
        heartbreaker2: {
          en: '${tower} => ${stack}',
        },
        heartbreaker3: {
          en: '${tower} => ${stack}',
        },
      },
    },
  ],
};

export default triggerSet;
