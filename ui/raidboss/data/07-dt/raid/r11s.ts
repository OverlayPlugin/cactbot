import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutputCardinal, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Include Meteorain lines for Arena split

type Phase = 'one' | 'arenaSplit' | 'avalanche' | 'ecliptic';

type WeaponInfo = {
  delay: number;
  duration: number;
};

export interface Data extends RaidbossData {
  phase: Phase;
  actorPositions: { [id: string]: { x: number; y: number; heading: number } };
  weapons: {
    id: string;
    type: 'stack' | 'healerGroups' | 'protean';
    dir: number;
    actor: { x: number; y: number; heading: number };
  }[];
  voidStardust?: 'spread' | 'stack';
  assaultEvolvedCount: number;
  weaponMechCount: number;
  domDirectionCount: {
    vertCount: number;
    horizCount: number;
    outerSafe: DirectionOutputCardinal[];
  };
  maelstromCount: number;
  hasMeteor: boolean;
  myPlatform?: 'east' | 'west';
  arenaSplitMeteorain?: 'westIn' | 'westOut';
  arenaSplitStretchDirNum?: number;
  arenaSplitTethers: string[];
  arenaSplitCalledTether: boolean;
  arenaSplitCalledBait: boolean;
  fireballCount: number;
  hasAtomic: boolean;
  hadEclipticTether: boolean;
  heartbreakerCount: number;
}

const center = {
  x: 100,
  y: 100,
};

const phaseMap: { [id: string]: Phase } = {
  'B43F': 'arenaSplit', // Flatliner
  'B448': 'avalanche', // Massive Meteor stacks near end of arena split
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

const ultimateTrophyWeaponsMap: (WeaponInfo | undefined)[] = [
  undefined,
  undefined,
  {
    delay: 0,
    duration: 8.7,
  },
  {
    delay: 4.7,
    duration: 5.1,
  },
  {
    delay: 5.8,
    duration: 5.1,
  },
  {
    delay: 6.9,
    duration: 5.1,
  },
  {
    delay: 8,
    duration: 5.1,
  },
  {
    delay: 9.1,
    duration: 5.1,
  },
];

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
    assaultEvolvedCount: 0,
    maelstromCount: 0,
    hasMeteor: false,
    arenaSplitTethers: [],
    arenaSplitCalledTether: false,
    arenaSplitCalledBait: false,
    fireballCount: 0,
    hasAtomic: false,
    hadEclipticTether: false,
    heartbreakerCount: 0,
  }),
  timelineTriggers: [],
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
          de: 'Party verteilen',
          cn: '人群分散',
          ko: '본대 산개',
        },
        sharedTankStack: {
          en: 'Tanks Stack',
          de: 'Tanks Sammeln',
          fr: 'Package Tanks',
          ja: 'タンク頭割り',
          cn: '坦克分摊',
          ko: '탱커 쉐어',
          tc: '坦克分攤',
        },
        text: {
          en: '${party}/${tank}',
          de: '${party}/${tank}',
          cn: '${party}/${tank}',
          ko: '${party}/${tank}',
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
          cn: '人群分摊',
          ko: '본대 쉐어',
          tc: '分攤',
        },
        tankCleaves: {
          en: 'Tank Cleaves',
          de: 'Tank Cleaves',
          fr: 'Tank Cleaves',
          ja: 'タンク前方攻撃',
          cn: '坦克扇形',
          ko: '광역 탱버',
          tc: '坦克順劈',
        },
        text: {
          en: '${party}/${tank}',
          de: '${party}/${tank}',
          cn: '${party}/${tank}',
          ko: '${party}/${tank}',
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
        return ultimateTrophyWeaponsMap[data.weaponMechCount]?.delay ?? 0;
      },
      durationSeconds: (data) => {
        return ultimateTrophyWeaponsMap[data.weaponMechCount]?.duration ?? 0;
      },
      countdownSeconds: (data) => {
        return ultimateTrophyWeaponsMap[data.weaponMechCount]?.duration ?? 0;
      },
      infoText: (data, matches, output) => {
        const mechanic = matches.param1 === '11D1'
          ? 'healerGroups'
          : (matches.param1 === '11D2' ? 'stack' : 'protean');
        if (data.weaponMechCount === 7)
          return output.mechanicThenBait!({ mech: output[mechanic]!(), bait: output.bait!() });
        if (data.weaponMechCount > 3 && mechanic !== 'stack')
          return output.mechanicThenMove!({ mech: output[mechanic]!(), move: output.move!() });
        return output[mechanic]!();
      },
      run: (data) => data.weaponMechCount++,
      outputStrings: {
        healerGroups: Outputs.healerGroups,
        stack: Outputs.stackMiddle,
        protean: Outputs.protean,
        move: Outputs.moveAway,
        bait: {
          en: 'Bait Gust',
          de: 'Böe ködern',
          cn: '诱导强风',
          ko: '강풍 유도',
        },
        mechanicThenMove: {
          en: '${mech} => ${move}',
          de: '${mech} => ${move}',
          cn: '${mech} => ${move}',
          ko: '${mech} => ${move}',
        },
        mechanicThenBait: {
          en: '${mech} => ${bait}',
          de: '${mech} => ${bait}',
          cn: '${mech} => ${bait}',
          ko: '${mech} => ${bait}',
        },
      },
    },
    {
      id: 'R11S Trophy Weapons 2 Early Calls',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: ['11D1', '11D2', '11D3'], capture: true },
      condition: (data, matches) => {
        if (data.weaponMechCount !== 1)
          return false;

        const actor = data.actorPositions[matches.id];

        if (actor === undefined)
          return false;

        const actorDir = Math.atan2(actor.x - center.x, actor.y - center.y);

        if ((Math.abs(actorDir - actor.heading) % Math.PI) < 0.1)
          return true;
        return false;
      },
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.id];

        if (actor === undefined)
          return;

        const mechanic = matches.param1 === '11D1'
          ? 'healerGroups'
          : (matches.param1 === '11D2' ? 'stack' : 'protean');

        const dir = Directions.xyTo8DirOutput(actor.x, actor.y, center.x, center.y);

        return output.text!({
          dir: output[dir]!(),
          weapon: output[mechanic]!(),
        });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        healerGroups: Outputs.healerGroups,
        stack: Outputs.stackMiddle,
        protean: Outputs.protean,
        text: {
          en: '${dir}: ${weapon} (1st later)',
          de: '${dir}: ${weapon} (erste später)',
          cn: '${dir}: ${weapon} (稍后第一波)',
          ko: '${dir}: ${weapon} (곧 1번째)',
        },
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
          de: '${weapon1} => ${weapon2} => ${weapon3}',
          cn: '${weapon1} => ${weapon2} => ${weapon3}',
          ko: '${weapon1} => ${weapon2} => ${weapon3}',
        },
        healerGroups: Outputs.healerGroups,
        stack: Outputs.stackMiddle,
        protean: Outputs.protean,
      },
    },
    {
      id: 'R11S Void Stardust',
      type: 'StartsUsing',
      netRegex: { id: 'B412', source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.baitPuddles!(),
      outputStrings: {
        baitPuddles: {
          en: 'Bait 3x puddles',
          de: 'Ködere Flächen x3',
          fr: 'Déposez les flaques 3x',
          cn: '诱导3次圈圈',
          ko: '장판 유도 3x',
        },
      },
    },
    {
      id: 'R11S Comet Spread Collect',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['cometSpread'], capture: false },
      suppressSeconds: 1,
      run: (data) => {
        // Only setting this once
        if (data.voidStardust === undefined)
          data.voidStardust = 'spread';
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
      id: 'R11S Crushing Comet Collect',
      type: 'StartsUsing',
      netRegex: { id: 'B415', source: 'The Tyrant', capture: false },
      run: (data) => {
        // Only setting this once
        if (data.voidStardust === undefined)
          data.voidStardust = 'stack';
      },
    },
    {
      id: 'R11S Crushing Comet',
      type: 'StartsUsing',
      netRegex: { id: 'B415', source: 'The Tyrant', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R11S Void Stardust End',
      // The second set of comets does not have a startsUsing cast
      // Timing is on the last Assault Evolved
      type: 'StartsUsing',
      netRegex: { id: ['B418', 'B419', 'B41A'], source: 'The Tyrant', capture: true },
      condition: (data) => {
        if (data.voidStardust === undefined)
          return false;
        data.assaultEvolvedCount++;
        if (data.assaultEvolvedCount === 3)
          return true;
        return false;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime),
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.voidStardust === 'spread')
          return output.baitPuddlesThenStack!();
        if (data.voidStardust === 'stack')
          return output.baitPuddlesThenSpread!();
      },
      outputStrings: {
        baitPuddlesThenStack: {
          en: 'Bait 3x Puddles => Stack',
          de: 'Ködere Fläche x3 => Sammeln',
          cn: '诱导3次圈圈 => 分摊',
          ko: '장판 유도 3x => 쉐어',
        },
        baitPuddlesThenSpread: {
          en: 'Bait 3x Puddles => Spread',
          de: 'Ködere Fläche x3 => Verteilen',
          cn: '诱导3次圈圈 => 分散',
          ko: '장판 유도 3x => 산개',
        },
      },
    },
    {
      id: 'R11S Dance Of Domination Trophy',
      // 2s cast, but B41F damage cast (0.5s) starts ~6s later.
      // There are 12.9s from B7BB startsUsing to bigAoe B7EA Ability
      type: 'StartsUsing',
      netRegex: { id: 'B7BB', source: 'The Tyrant', capture: false },
      delaySeconds: 3.7, // 5s before AoEs start
      durationSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE x6 => Big AoE',
          de: 'AoE x6 => Große AoE',
          cn: '6 次 AOE => 大 AOE',
          ko: '전체 공격 x6 => 강한 전체 공격',
        },
      },
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
        if (headingDirNum % 2 !== 0)
          return;
        const isVert = headingDirNum % 4 === 0;
        let dangerDir: DirectionOutputCardinal | undefined = undefined;
        if (isVert) {
          data.domDirectionCount.vertCount += 1;
          if (parseFloat(matches.x) < center.x - 5)
            dangerDir = 'dirW';
          else if (parseFloat(matches.x) > center.x + 5)
            dangerDir = 'dirE';
        } else {
          data.domDirectionCount.horizCount += 1;
          if (parseFloat(matches.y) < center.y - 5)
            dangerDir = 'dirN';
          else if (parseFloat(matches.y) > center.y + 5)
            dangerDir = 'dirS';
        }
        if (dangerDir !== undefined)
          data.domDirectionCount.outerSafe = data.domDirectionCount.outerSafe.filter((dir) =>
            dir !== dangerDir
          );
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
          de: 'N/S Mitte / ${dir} Außen + mit Partner sammeln',
          cn: '上/下中间 / ${dir} 外侧 + 队友分摊',
          ko: '북/남 중간 / ${dir} 바깥 + 파트너 쉐어',
        },
        eastWest: {
          en: 'E/W Mid / ${dir} Outer + Partner Stacks',
          de: 'O/W Mitte / ${dir} Außen + mit Partner sammeln',
          cn: '左/右中间 / ${dir} 外侧 + 队友分摊',
          ko: '동/서 중간 / ${dir} 바깥 + 파트너 쉐어',
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
      id: 'R11S Maelstrom Count',
      type: 'AddedCombatant',
      netRegex: { name: 'Maelstrom', capture: false },
      run: (data) => data.maelstromCount = data.maelstromCount + 1,
    },
    {
      id: 'R11S Powerful Gust Reminder',
      type: 'AddedCombatant',
      netRegex: { name: 'Maelstrom', capture: false },
      condition: (data) => data.maelstromCount === 4,
      infoText: (_data, _matches, output) => output.bait!(),
      outputStrings: {
        bait: {
          en: 'Bait Gust',
          de: 'Böe ködern',
          cn: '诱导强风',
          ko: '강풍 유도',
        },
      },
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
          de: 'Wilde Rage (hinter einen Tank)',
          cn: '挡枪分摊 (坦克后)',
          ko: '직선 쉐어 (탱커 뒤로)',
        },
        wildChargeMeteor: {
          en: 'Wild Charge (behind meteor)',
          de: 'Wilde Rage (hinter einen Meteor)',
          cn: '挡枪分摊 (陨石后)',
          ko: '직선 쉐어 (돌 뒤로)',
        },
        wildChargeTank: {
          en: 'Wild Charge (be in front)',
          de: 'Wilde Rage (sei Vorne)',
          cn: '挡枪分摊 (人群前)',
          ko: '직선 쉐어 (앞에 있기)',
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
          de: 'LoS hinter Meteor x3',
          cn: '躲在三连陨石后',
          ko: '돌 뒤에 숨기 3x',
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
          de: 'Kurzer Rückstoß zu den Seiten',
          fr: 'Légère poussée vers les côtés',
          cn: '向两侧短距离击飞',
          ko: '양 옆으로 짧은 넉백',
        },
      },
    },
    {
      id: 'R11S Arena Split Majestic Meteorain Collect',
      // Two MapEffects happen simultaneously with tethers
      // Coincides with light tethers connecting the Meteorain portals
      // NOTE: Unsure location is which, but they are paired so only collect one
      // Location Pattern 1:
      // 17 => West Out?
      // 19 => East In?
      // Location Pattern 2:
      // 16 => East Out?
      // 18 => West In?
      type: 'MapEffect',
      netRegex: { flags: '00200010', location: ['16', '17'], capture: true },
      condition: (data) => data.phase === 'arenaSplit',
      run: (data, matches) => {
        // The second set of these can also be known from the first set as it will be oppposite
        data.arenaSplitMeteorain = matches.location === '16'
          ? 'westIn'
          : 'westOut';
      },
    },
    {
      id: 'R11S Arena Split Majestic Meteowrath Tether Collect',
      // Tethers have 2 patterns
      // Pattern 1
      // (69, 85)
      //                  (131, 95)
      //                  (131, 105)
      // (69, 115)
      // Pattern 2:
      //                  (131, 85)
      // (69, 95)
      // (69, 105)
      //                  (131, 115)
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: true },
      condition: (data) => {
        // Assuming log line of same player doesn't happen before 4 players collected
        if (data.phase === 'arenaSplit' && data.arenaSplitTethers.length < 4)
          return true;
        return false;
      },
      preRun: (data, matches) => data.arenaSplitTethers.push(matches.target),
      delaySeconds: 0.1, // Race condition with Tether lines and actor positions
      run: (data, matches) => {
        const actor = data.actorPositions[matches.sourceId];
        const hasTether = (data.me === matches.target);
        if (actor === undefined) {
          if (hasTether)
            data.arenaSplitStretchDirNum = -1; // Return -1 so that we know we at least don't bait fire breath
          return;
        }

        if (hasTether) {
          const portalDirNum = Directions.xyTo4DirIntercardNum(
            actor.x,
            actor.y,
            center.x,
            center.y,
          );
          // While two could be inter inter cards, furthest stretches will be an intercard
          const stretchDirNum = (portalDirNum + 2) % 4;
          data.arenaSplitStretchDirNum = stretchDirNum;
        }
      },
    },
    {
      id: 'R11S Arena Split Fire Breath Bait Later',
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: false },
      condition: (data) => {
        if (
          data.phase === 'arenaSplit' &&
          data.arenaSplitTethers.length === 4 &&
          !data.arenaSplitCalledBait
        ) {
          if (!data.arenaSplitTethers.includes(data.me))
            return data.arenaSplitCalledBait = true;
        }
        return false;
      },
      delaySeconds: 0.1,
      infoText: (_data, _matches, output) => output.fireBreathLater!(),
      outputStrings: {
        fireBreathLater: {
          en: 'Bait Fire Breath (later)',
          de: 'Köder Feueratem (später)',
          cn: '诱导火焰吐息 (稍后)',
          ko: '화염 숨결 유도 (나중에)',
        },
      },
    },
    {
      id: 'R11S Arena Split Majestic Meteowrath Tether Stretch Later',
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: true },
      condition: (data, matches) => {
        if (
          data.phase === 'arenaSplit' &&
          data.me === matches.target
        ) {
          // Prevent spamming tethers
          if (!data.arenaSplitCalledTether)
            return data.arenaSplitCalledTether = true;
        }
        return false;
      },
      delaySeconds: 0.1, // Race condition with Tether lines and actor positions
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return output.stretchTetherLater!();

        const portalDirNum = Directions.xyTo4DirIntercardNum(
          actor.x,
          actor.y,
          center.y,
          center.x,
        );
        // While these are inter inter cards, furthest stretch will be an intercard
        const stretchDirNum = (portalDirNum + 2) % 4;
        const dir = Directions.outputIntercardDir[stretchDirNum];
        return output.stretchTetherDirLater!({ dir: output[dir ?? 'unknown']!() });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        stretchTetherDirLater: {
          en: 'Tether on YOU: Stretch ${dir} (later)',
          de: 'Verbindung auf DIR: Langziehen ${dir} (später)',
          cn: '连线点名: 向${dir}拉远 (稍后)',
          ko: '선 대상자: ${dir}쪽으로 늘이기 (나중에)',
        },
        stretchTetherLater: {
          en: 'Tether on YOU: Stretch (later)',
          de: 'Verbindung auf DIR: Langziehen (später)',
          cn: '连线点名: 拉远 (稍后)',
          ko: '선 대상자: 늘이기 (나중에)',
        },
      },
    },
    {
      id: 'R11S Explosion Towers', // Knockback towers
      // 10s castTime
      type: 'StartsUsing',
      netRegex: { id: 'B444', source: 'The Tyrant', capture: true },
      condition: (data) => data.phase === 'arenaSplit',
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      durationSeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      suppressSeconds: 1,
      promise: async (data) => {
        // Get player location for output
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R11S Explosion Towers: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatform = me.PosX < 100 ? 'west' : 'east';
      },
      alertText: (data, _matches, output) => {
        const myPlatform = data.myPlatform;
        const dirNum = data.arenaSplitStretchDirNum;
        if (dirNum === 0 || dirNum === 1) {
          if (myPlatform === 'east') {
            return output.tetherTowers!({
              mech1: output.northSouthSafe!(),
              mech2: output.avoidFireBreath!(),
            });
          }
          return output.tetherTowers!({
            mech1: output.eastSafe!(),
            mech2: output.avoidFireBreath!(),
          });
        }
        if (dirNum === 2 || dirNum === 3) {
          if (myPlatform === 'west') {
            return output.tetherTowers!({
              mech1: output.northSouthSafe!(),
              mech2: output.avoidFireBreath!(),
            });
          }
          return output.tetherTowers!({
            mech1: output.westSafe!(),
            mech2: output.avoidFireBreath!(),
          });
        }
        if (!data.arenaSplitTethers.includes(data.me))
          return output.fireBreathTowers!({
            mech1: output.northSouthSafe!(),
            mech2: output.baitFireBreath!(),
          });
        return output.knockbackTowers!();
      },
      outputStrings: {
        knockbackTowers: {
          en: 'Get Knockback Towers',
          de: 'Nimm Rückstoß-Türme',
          fr: 'Prenez une tour (poussée)',
          cn: '踩击飞塔',
          ko: '넉백탑 들어가기',
        },
        fireBreathTowers: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
        tetherTowers: {
          en: '${mech1} => ${mech2}',
          de: '${mech1} => ${mech2}',
          cn: '${mech1} => ${mech2}',
          ko: '${mech1} => ${mech2}',
        },
        baitFireBreath: {
          en: 'Bait Near',
          de: 'Nahe ködern',
          cn: '靠近引导',
          ko: '가까이 유도',
        },
        avoidFireBreath: Outputs.outOfHitbox,
        northSouthSafe: {
          en: 'Tower Knockback to Same Platform',
          de: 'Turm-Rückstoß auf die gleiche Plattform',
          cn: '被塔击飞到同一平台',
          ko: '같은 플랫폼으로 넉백',
        },
        eastSafe: {
          en: 'Tower Knockback Across to East',
          de: 'Turm-Rückstoß Richtung Osten',
          cn: '被塔击飞到右侧平台',
          ko: '동쪽 플랫폼으로 넉백',
        },
        westSafe: {
          en: 'Tower Knockback Across to West',
          de: 'Turm-Rückstoß Richtung Westen',
          cn: '被塔击飞到左侧平台',
          ko: '서쪽 플랫폼으로 넉백',
        },
      },
    },
    {
      id: 'R11S Fire Breath and Bait Puddles',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['fireBreath'], capture: true },
      condition: (data, matches) => {
        if (data.me === matches.target && data.phase === 'arenaSplit')
          return true;
        return false;
      },
      durationSeconds: 6,
      promise: async (data) => {
        // Get player location for output
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R11S Fire Breath and Bait Puddles: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatform = me.PosX < 100 ? 'west' : 'east';
      },
      alertText: (data, _matches, output) => {
        const meteorain = data.arenaSplitMeteorain;
        const isWestIn = meteorain === 'westIn';
        const myPlatform = data.myPlatform;
        if (meteorain !== undefined && myPlatform !== undefined) {
          if (myPlatform === 'west') {
            const dir = isWestIn ? 'front' : 'back';
            return output.fireBreathMechsPlayerWest!({
              mech1: output.fireBreathOnYou!(),
              mech2: output.bait3Puddles!(),
              dir: output[dir]!(),
            });
          }
          const dir = isWestIn ? 'back' : 'front';
          return output.fireBreathMechsPlayerEast!({
            mech1: output.fireBreathOnYou!(),
            mech2: output.bait3Puddles!(),
            dir: output[dir]!(),
          });
        }
        return output.fireBreathMechs!({
          mech1: output.fireBreathOnYou!(),
          mech2: output.bait3Puddles!(),
          mech3: output.lines!(),
        });
      },
      outputStrings: {
        bait3Puddles: {
          en: 'Bait Puddles x3',
          de: 'Flächen ködern x3',
          fr: 'Déposez les flaques x3',
          cn: '引导圈圈 x3',
          ko: '장판 유도 x3',
        },
        back: {
          en: 'Inner Back',
          de: 'Innen Hinten',
          cn: '内侧后',
          ko: '안쪽 뒤',
        },
        front: {
          en: 'Inner Front',
          de: 'Innen Vorne',
          cn: '内侧前',
          ko: '안쪽 앞',
        },
        lines: {
          en: 'Avoid Lines',
          de: 'Vermeide Linien',
          fr: 'Évitez les lignes',
          ja: '直線攻撃を避ける',
          cn: '躲避直线 AoE',
          ko: '직선장판 피하기',
          tc: '躲避直線 AoE',
        },
        fireBreathOnYou: {
          en: 'Fire Breath on YOU',
          de: 'Feueratem auf DIR',
          cn: '火焰吐息点名',
          ko: '화염 숨결 대상자',
        },
        fireBreathMechsPlayerWest: {
          en: '${mech1} + ${mech2} => ${dir}',
          de: '${mech1} + ${mech2} => ${dir}',
          cn: '${mech1} + ${mech2} => ${dir}',
          ko: '${mech1} + ${mech2} => ${dir}',
        },
        fireBreathMechsPlayerEast: {
          en: '${mech1} + ${mech2} => ${dir}',
          de: '${mech1} + ${mech2} => ${dir}',
          cn: '${mech1} + ${mech2} => ${dir}',
          ko: '${mech1} + ${mech2} => ${dir}',
        },
        fireBreathMechs: {
          en: '${mech1} + ${mech2} => ${mech3}',
          de: '${mech1} + ${mech2} => ${mech3}',
          cn: '${mech1} + ${mech2} => ${mech3}',
          ko: '${mech1} + ${mech2} => ${mech3}',
        },
      },
    },
    {
      id: 'R11S Arena Split Majestic Meteowrath Tether Bait Puddles',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['fireBreath'], capture: false },
      condition: (data) => {
        if (data.phase === 'arenaSplit' && data.arenaSplitTethers.includes(data.me))
          return true;
        return false;
      },
      durationSeconds: 6,
      suppressSeconds: 1,
      promise: async (data) => {
        // Get player location for output
        const combatants = (await callOverlayHandler({
          call: 'getCombatants',
          names: [data.me],
        })).combatants;
        const me = combatants[0];
        if (combatants.length !== 1 || me === undefined) {
          console.error(
            `R11S Arena Split Majestic Meteowrath Tether Bait Puddles: Wrong combatants count ${combatants.length}`,
          );
          return;
        }

        data.myPlatform = me.PosX < 100 ? 'west' : 'east';
      },
      alertText: (data, _matches, output) => {
        const meteorain = data.arenaSplitMeteorain;
        const isWestIn = meteorain === 'westIn';
        const dirNum = data.arenaSplitStretchDirNum;
        const myPlatform = data.myPlatform;
        if (dirNum !== undefined && myPlatform !== undefined) {
          const dir1 = Directions.outputIntercardDir[dirNum] ?? 'unknown';
          if (myPlatform === 'west') {
            const dir2 = isWestIn ? 'front' : 'back';
            return output.tetherMechsPlayerWest!({
              mech1: output.bait3Puddles!(),
              mech2: output.stretchTetherDir!({ dir: output[dir1]!() }),
              dir: output[dir2]!(),
            });
          }
          const dir2 = isWestIn ? 'back' : 'front';
          return output.tetherMechsPlayerEast!({
            mech1: output.bait3Puddles!(),
            mech2: output.stretchTetherDir!({ dir: output[dir1]!() }),
            dir: output[dir2]!(),
          });
        }
        return output.baitThenStretchMechs!({
          mech1: output.bait3Puddles!(),
          mech2: output.stretchTether!(),
          mech3: output.lines!(),
        });
      },
      outputStrings: {
        ...Directions.outputStringsIntercardDir,
        bait3Puddles: {
          en: 'Bait Puddles x3',
          de: 'Flächen ködern x3',
          fr: 'Déposez les flaques x3',
          cn: '引导圈圈 x3',
          ko: '장판 유도 x3',
        },
        back: {
          en: 'Outer Back',
          de: 'Außen Hinten',
          cn: '外侧后',
          ko: '바깥쪽 뒤',
        },
        front: {
          en: 'Outer Front',
          de: 'Außen Vorne',
          cn: '外侧前',
          ko: '바깥쪽 앞',
        },
        lines: {
          en: 'Avoid Lines',
          de: 'Vermeide Linien',
          fr: 'Évitez les lignes',
          ja: '直線攻撃を避ける',
          cn: '躲避直线 AoE',
          ko: '직선장판 피하기',
          tc: '躲避直線 AoE',
        },
        baitThenStretchMechs: {
          en: '${mech1} => ${mech2}  + ${mech3}',
          de: '${mech1} => ${mech2}  + ${mech3}',
          cn: '${mech1} => ${mech2}  + ${mech3}',
          ko: '${mech1} => ${mech2}  + ${mech3}',
        },
        stretchTether: {
          en: 'Stretch Tether',
          de: 'Verbindung langziehen',
          fr: 'Étirez les liens',
          cn: '拉远连线',
          ko: '선 늘이기',
          tc: '拉遠連線',
        },
        stretchTetherDir: {
          en: 'Stretch ${dir}',
          de: 'Langiehen ${dir}',
          cn: '向${dir}拉远',
          ko: '${dir}쪽으로 늘이기',
        },
        tetherMechsPlayerEast: {
          en: '${mech1} => ${mech2} + ${dir}',
          de: '${mech1} => ${mech2} + ${dir}',
          cn: '${mech1} => ${mech2} + ${dir}',
          ko: '${mech1} => ${mech2} + ${dir}',
        },
        tetherMechsPlayerWest: {
          en: '${mech1} => ${mech2} + ${dir}',
          de: '${mech1} => ${mech2} + ${dir}',
          cn: '${mech1} => ${mech2} + ${dir}',
          ko: '${mech1} => ${mech2} + ${dir}',
        },
      },
    },
    {
      id: 'R11S Majestic Meteowrath Tether and Fire Breath Reset',
      // Reset tracker on B442 Majestic Meteowrath for next set of tethers
      type: 'Ability',
      netRegex: { id: 'B442', source: 'The Tyrant', capture: false },
      condition: (data) => data.phase === 'arenaSplit',
      suppressSeconds: 9999,
      run: (data) => {
        delete data.arenaSplitMeteorain;
        delete data.arenaSplitStretchDirNum;
        data.arenaSplitTethers = [];
        data.arenaSplitCalledTether = false;
        data.arenaSplitCalledBait = false;
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
          de: 'Turm-Rückstoß zum Westen',
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
          de: 'Turm-Rückstoß zum Osten',
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
          de: 'Geh ${dir1}/${dir2} => Köder Impakts, Ecken vermeiden',
          cn: '去${dir1}/${dir2} => 引导火圈, 躲避角落',
          ko: '${dir1}/${dir2} 이동 => 장판 유도, 구석 피하기',
        },
        getMiddle: {
          en: 'Proximity AoE; Get Middle => Bait Puddles',
          de: 'Distanz-AoE; Geh in die Mitte => Flächen ködern',
          cn: '靠近AoE; 去中间 => 引导圈圈',
          ko: '거리감쇠 징; 중앙으로 => 장판 유도',
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
      id: 'R11S Ecliptic Stampede Majestic Meteowrath Tether Collect',
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: true },
      condition: (data, matches) => {
        if (
          data.me === matches.target &&
          data.phase === 'ecliptic'
        )
          return true;
        return false;
      },
      suppressSeconds: 9999,
      run: (data) => data.hadEclipticTether = true,
    },
    {
      id: 'R11S Ecliptic Stampede Majestic Meteowrath Tethers',
      type: 'Tether',
      netRegex: { id: [headMarkerData.closeTether, headMarkerData.farTether], capture: true },
      condition: (data, matches) => {
        if (
          data.me === matches.target &&
          data.phase === 'ecliptic'
        )
          return true;
        return false;
      },
      suppressSeconds: 9999,
      infoText: (data, matches, output) => {
        const actor = data.actorPositions[matches.sourceId];
        if (actor === undefined)
          return;

        const portalDirNum = Directions.xyTo8DirNum(actor.x, actor.y, center.x, center.y);
        // TODO: Make config for options?
        const stretchDirNum = (portalDirNum + 5) % 8;
        const stretchDir = Directions.output8Dir[stretchDirNum] ?? 'unknown';
        return output.stretchTetherDir!({ dir: output[stretchDir]!() });
      },
      outputStrings: {
        ...Directions.outputStrings8Dir,
        stretchTetherDir: {
          en: 'Stretch Tether ${dir}',
          de: 'Verbindungen langziehen ${dir}',
          cn: '向${dir}拉线',
          ko: '${dir}쪽으로 선 늘이기',
        },
      },
    },
    {
      id: 'R11S Two-way Fireball',
      type: 'StartsUsing',
      netRegex: { id: 'B7BD', source: 'The Tyrant', capture: false },
      alertText: (data, _matches, output) => {
        if (data.hadEclipticTether)
          return output.twoWayBehind!();
        return output.twoWayFront!();
      },
      outputStrings: {
        twoWayFront: {
          en: 'East/West Line Stack, Be in Front',
          de: 'Osten/West in einer Linie Sammeln, sei vorne',
          cn: '左/右向直线分摊，站前方',
          ko: '동/서 직선 쉐어, 앞에 있기',
        },
        twoWayBehind: {
          en: 'Move; East/West Line Stack, Get behind',
          de: 'Geh Osten/West, in einer Linie Sammeln, sei hinten',
          cn: '移动; 左/右向直线分摊，站后方',
          ko: '이동; 동/서 직선 쉐어, 뒤로 가기',
        },
      },
    },
    {
      id: 'R11S Four-way Fireball',
      type: 'StartsUsing',
      netRegex: { id: 'B45A', source: 'The Tyrant', capture: false },
      alertText: (data, _matches, output) => {
        if (data.hadEclipticTether)
          return output.fourWayBehind!();
        return output.fourWayFront!();
      },
      outputStrings: {
        fourWayFront: {
          en: 'Intercardinal Line Stack, Be in Front',
          de: 'Interkardinal in einer Linie sammeln, sei vorne',
          cn: '四角分摊, 站前方',
          ko: '대각선 쉐어, 앞에 있기',
        },
        fourWayBehind: {
          en: 'Intercardinal Line Stack, Get behind',
          de: 'Interkardinal in einer Linie sammeln, sei hinten',
          cn: '四角分摊, 站后方',
          ko: '대각선 쉐어, 뒤로 가기',
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
          ko: '탑 밟기',
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
          de: 'Sammeln 6x',
          cn: '6连分摊',
          ko: '쉐어 6번',
        },
        stack7x: {
          en: 'Stack 7x',
          de: 'Sammeln 7x',
          cn: '7连分摊',
          ko: '쉐어 7번',
        },
        heartbreaker1: {
          en: '${tower} => ${stack}',
          de: '${tower} => ${stack}',
          cn: '${tower} => ${stack}',
          ko: '${tower} => ${stack}',
        },
        heartbreaker2: {
          en: '${tower} => ${stack}',
          de: '${tower} => ${stack}',
          cn: '${tower} => ${stack}',
          ko: '${tower} => ${stack}',
        },
        heartbreaker3: {
          en: '${tower} => ${stack}',
          de: '${tower} => ${stack}',
          cn: '${tower} => ${stack}',
          ko: '${tower} => ${stack}',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Majestic Meteowrath/Majestic Meteorain/Fire Breath': 'Fire Breath + Meteor Lines',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Comet': 'Komet',
        'Maelstrom': 'Mahlstrom',
        'The Tyrant': '(?:der|die|das) Tyrann',
      },
      'replaceText': {
        '\\(Axe\\)': '(Axt)',
        '\\(Scythe\\)': '(Sense)',
        '\\(Scythe/Axe\\)': '(Sense/Axt)',
        '\\(castbar\\)': '(wirken)',
        '\\(split\\)': '(teilen)',
        '--Fire Breath Markers--': '--Feueratem Markierungen--',
        '--Meteor Markers': '--Meteor Markierungen',
        '--Meteor(?! Markers)': '--Meteor',
        '--jump ': '--Sprung',
        'scythe--': 'Sense--',
        '--tethers--': '--Verbindungen--',
        'Arcadion Avalanche': 'Arkadionbruch',
        'Assault Apex': 'Waffenlawine',
        'Assault Evolved': 'Waffensturm',
        'Atomic Impact': 'Fusionseinschlag',
        'Charybdistopia': 'Charybdis des Herrschers',
        '(?<! )Comet(?!ite)': 'Komet',
        'Cometite': 'Mini-Komet',
        'Cosmic Kiss': 'Einschlag',
        'Crown of Arcadia': 'Wort des Herrschers',
        'Crushing Comet': 'Super-Komet',
        'Dance of Domination(?! Trophy)': 'Unangefochtene Überlegenheit',
        'Dance of Domination Trophy': 'Überlegene Waffenkunst',
        'Ecliptic Stampede': 'Meteo-Stampede',
        'Explosion': 'Explosion',
        'Eye of the Hurricane': 'Hurrikan des Herrschers',
        'Fearsome Fireball': 'Fürstliches Feuer',
        '(?<!--)Fire Breath': 'Feueratem',
        'Fire and Fury': 'Feueratem & Flammenschweif',
        'Flatliner': 'Herzstopper',
        'Foregone Fatality': 'Strahl der Verdammnis',
        'Four-way Fireball': 'Vierfaches Drehfeuer',
        'Great Wall of Fire': 'Feuerstrom',
        'Heartbreak Kick': 'Herzensbrecher-Kick',
        'Heartbreaker': 'Herzensbrecher',
        'Heavy Hitter': 'Zerteilen',
        'Immortal Reign': 'Unsterblichkeit des Herrschers',
        '(?<! )Impact': 'Impakt',
        'Majestic Meteor(?!ain)': 'Herrscher-Meteo',
        'Majestic Meteorain': 'Herrscher-Meteorregen',
        'Majestic Meteowrath': 'Herrscher-Meteo des Zorns',
        'Mammoth Meteor': 'Giga-Meteo',
        'Massive Meteor': 'Super-Meteo',
        '(?<! )Meteorain': 'Meteorregen',
        'One and Only': 'Alles für einen',
        'Orbital Omen': 'Orbitalachse',
        'Powerful Gust': 'Starke Bö',
        'Raw Steel(?! )': 'Waffenspalter',
        'Raw Steel Trophy': 'Spaltende Waffenkunst',
        'Shockwave': 'Schockwelle',
        'Triple Tyrannhilation': 'Drillingsstern-Tyrannensturz',
        '(?<! )Trophy Weapons': 'Waffentrophäen',
        'Two-way Fireball': 'Zweifaches Drehfeuer',
        'Ultimate Trophy Weapons': 'Unantastbare Waffentrophäen',
        'Void Stardust': 'Kometenschauer',
        '(?<! )Weapon(?!s)': 'Waffe',
        'Weighty Impact': 'Mega-Einschlag',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Comet': 'comète',
        'The Tyrant': 'The Tyrant',
      },
      'replaceText': {
        'Arcadion Avalanche': 'Écrasement de l\'Arcadion',
        'Assault Apex': 'Avalanche d\'armes',
        'Assault Evolved': 'Arsenal d\'assaut',
        'Atomic Impact': 'Impact de canon dissolvant',
        'Charybdistopia': 'Maelström',
        '(?<! )Comet(?!ite)': 'comète',
        'Cometite': 'Petite comète',
        'Cosmic Kiss': 'Impact',
        'Crown of Arcadia': 'Souverain de l\'Arcadion',
        'Dance of Domination(?! Trophy)': 'Danse de la domination',
        'Dance of Domination Trophy': 'Génération d\'arme : domination',
        'Ecliptic Stampede': 'Ruée de météores',
        'Explosion': 'Explosion',
        'Eye of the Hurricane': 'Ouragan',
        'Fearsome Fireball': 'Rayon incandescent',
        'Fire Breath': 'Souffle enflammé',
        'Fire and Fury': 'Queue enflammée',
        'Flatliner': 'Dernière ligne',
        'Foregone Fatality': 'Pluie fatale',
        'Great Wall of Fire': 'Courants de feu',
        'Heartbreak Kick': 'Talon déchirant',
        'Heartbreaker': 'Ruine-cœur',
        'Heavy Hitter': 'Lacération lourde',
        'Immortal Reign': 'Règne immortel',
        '(?<! )Impact': 'Impact',
        'Majestic Meteor(?!ain)': 'Météore du champion',
        'Majestic Meteorain': 'Pluie de météores du champion',
        'Majestic Meteowrath': 'Fureur météorique du champion',
        'Mammoth Meteor': 'Météore gigantesque',
        'Massive Meteor': 'Météore imposant',
        '(?<! )Meteorain': 'Pluie de météorites',
        'One and Only': 'Seul et unique',
        'Orbital Omen': 'Pluie orbitale',
        'Powerful Gust': 'Ouragan violent',
        'Raw Steel(?! )': 'Écrasement du tyran',
        'Raw Steel Trophy': 'Génération d\'arme : écrasement',
        'Shockwave': 'Onde de choc',
        '(?<! )Trophy Weapons': 'Armes trophées',
        'Ultimate Trophy Weapons': 'Armes trophées ultimes',
        'Void Stardust': 'Pluie de comètes',
        'Weighty Impact': 'Impact de canon massif',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Comet': 'コメット',
        'The Tyrant': 'ザ・タイラント',
      },
      'replaceText': {
        'Arcadion Avalanche': 'アルカディア・クラッシュ',
        'Assault Apex': 'ウェポンアバランチ',
        'Assault Evolved': 'ウェポンアサルト',
        'Atomic Impact': '融解着弾',
        'Charybdistopia': 'ザ・ミールストーム',
        '(?<! )Comet(?!ite)': 'コメット',
        'Cometite': 'プチコメット',
        'Cosmic Kiss': '着弾',
        'Crown of Arcadia': 'キング・オブ・アルカディア',
        'Dance of Domination(?! Trophy)': 'ダンス・オブ・ドミネーション',
        'Dance of Domination Trophy': 'ウェポンジェネレート：ドミネーション',
        'Ecliptic Stampede': 'メテオスタンピード',
        'Explosion': '爆発',
        'Eye of the Hurricane': 'ザ・ハリケーン',
        'Fearsome Fireball': 'ビッグファイア',
        'Fire Breath': 'ファイアブレス',
        'Fire and Fury': 'ファイア・アンド・テイル',
        'Flatliner': 'フラットライナー',
        'Foregone Fatality': 'フェイタルライン',
        'Great Wall of Fire': 'ファイアストリーム',
        'Heartbreak Kick': 'ハートブレイクキック',
        'Heartbreaker': 'ハートブレイカー',
        'Heavy Hitter': '重斬撃',
        'Immortal Reign': 'イモータルレイン',
        '(?<! )Impact': '衝撃',
        'Majestic Meteor(?!ain)': 'チャンピオンズ・メテオ',
        'Majestic Meteorain': 'チャンピオンズ・メテオライン',
        'Majestic Meteowrath': 'チャンピオンズ・メテオラース',
        'Mammoth Meteor': 'ヒュージメテオ',
        'Massive Meteor': 'ヘビーメテオ',
        '(?<! )Meteorain': 'メテオレイン',
        'One and Only': 'ワン・アンド・オンリー',
        'Orbital Omen': 'オービタルライン',
        'Powerful Gust': '強風',
        'Raw Steel(?! )': 'ウェポンバスター',
        'Raw Steel Trophy': 'ウェポンジェネレート：バスター',
        'Shockwave': 'ショックウェーブ',
        '(?<! )Trophy Weapons': 'トロフィーウェポンズ',
        'Ultimate Trophy Weapons': 'アルティメット・トロフィーウェポンズ',
        'Void Stardust': 'コメットレイン',
        'Weighty Impact': '重着弾',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Comet': '彗星',
        'Maelstrom': '大漩涡',
        'The Tyrant': '霸王',
      },
      'replaceText': {
        '--jump ': '--跳',
        ' Markers--': '点名--',
        '--meteor(?! Markers)': '--陨石',
        '--Meteor Markers': '--陨石标记',
        'scythe--': '镰刀--',
        '--tethers--': '--连线--',
        'Axe\\)': '斧头)',
        '\\(castbar\\)': '(咏唱栏)',
        '\\(damage\\)': '(伤害)',
        '\\(Enrage\\)': '(狂暴)',
        '\\(Scythe': '(镰刀',
        '\\(split\\)': '(分散)',
        'Arcadion Avalanche': '登天碎地',
        'Assault Apex': '铸兵崩落',
        'Assault Evolved': '铸兵突袭',
        'Atomic Impact': '融解轰击',
        'Charybdistopia': '霸王大漩涡',
        '(?<! )Comet(?!ite)': '彗星',
        'Cometite': '彗星风暴',
        'Cosmic Kiss': '轰击',
        'Crown of Arcadia': '天顶的主宰',
        'Crushing Comet': '重彗星',
        'Dance of Domination(?! Trophy)': '统治的战舞',
        'Dance of Domination Trophy': '铸兵之令：统治',
        'Ecliptic Stampede': '陨石狂奔',
        'Explosion': '爆炸',
        'Eye of the Hurricane': '霸王飓风',
        'Fearsome Fireball': '大火',
        'Fire and Fury': '兽焰连尾击',
        'Fire Breath': '火焰吐息',
        'Flatliner': '绝命分断击',
        'Foregone Fatality': '夺命链',
        'Four-way Fireball': '四向回旋火',
        'Great Wall of Fire': '火焰流',
        'Heartbreak Kick': '碎心踢',
        'Heartbreaker': '碎心击',
        'Heavy Hitter': '重斩击',
        'Immortal Reign': '万劫不朽的统治',
        '(?<! )Impact': '冲击',
        'Majestic Meteor(?!ain)': '王者陨石',
        'Majestic Meteorain': '王者陨石雨',
        'Majestic Meteowrath': '王者陨石震',
        'Mammoth Meteor': '遮天陨石',
        'Massive Meteor': '重陨石',
        '(?<! )Meteorain': '流星雨',
        'One and Only': '举世无双的霸王',
        'Orbital Omen': '星轨链',
        'Powerful Gust': '强风',
        'Raw Steel(?! Trophy)': '铸兵轰击',
        'Raw Steel Trophy(?! Axe| Scythe)': '铸兵之令：轰击',
        'Raw Steel Trophy Axe': '铸兵之令：轰击 斧',
        'Raw Steel Trophy Scythe': '铸兵之令：轰击 镰',
        'Shockwave': '冲击波',
        'Triple Tyrannhilation': '三重霸王坠击',
        '(?<! )Trophy Weapons': '历战之兵武',
        'Two-way Fireball': '双向回旋火',
        'Ultimate Trophy Weapons': '历战之极武',
        'Void Stardust': '彗星雨',
        '(?<! )Weapon(?!s)': '武器',
        'Weighty Impact': '重轰击',
      },
    },
    {
      'locale': 'ko',
      'missingTranslations': true,
      'replaceSync': {
        'Comet': '혜성',
        'Maelstrom': '대격동',
        'The Tyrant': '더 타이런트',
      },
      'replaceText': {
        '--jump ': '--점프 ',
        ' Markers--': ' 징--',
        '--meteor(?! Markers)': '--메테오',
        '--Meteor Markers': '--메테오 징',
        'scythe--': '낫--',
        '--tethers--': '--선--',
        'Axe\\)': '도끼)',
        '\\(castbar\\)': '(시전바)',
        '\\(damage\\)': '(피해)',
        '\\(Enrage\\)': '(전멸기)',
        '\\(Scythe': '(낫',
        '\\(split\\)': '(분단)',
        'Arcadion Avalanche': '아르카디아 파괴',
        'Assault Apex': '무기 맹공습',
        'Assault Evolved': '무기 공습',
        'Atomic Impact': '융해 착탄',
        'Charybdistopia': '폭군의 대소용돌이',
        '(?<! )Comet(?!ite)': '혜성',
        'Cometite': '소혜성',
        'Cosmic Kiss': '착탄',
        'Crown of Arcadia': '아르카디아의 제왕',
        'Crushing Comet': '대혜성',
        'Dance of Domination(?! Trophy)': '지배의 검무',
        'Dance of Domination Trophy': '무기 생성: 지배의 검',
        'Ecliptic Stampede': '메테오 쇄도',
        'Explosion': '폭발',
        'Eye of the Hurricane': '폭군의 허리케인',
        'Fearsome Fireball': '거대한 화염',
        'Fire and Fury': '화염과 꼬리',
        'Fire Breath': '화염 숨결',
        'Flatliner': '절명격',
        'Foregone Fatality': '필멸선',
        // 'Four-way Fireball': 'Four-way Fireball',
        'Great Wall of Fire': '화염 기류',
        'Heartbreak Kick': '심장파열격',
        'Heartbreaker': '심장파괴자',
        'Heavy Hitter': '집중 참격',
        'Immortal Reign': '불멸의 지배자',
        '(?<! )Impact': '충격',
        'Majestic Meteor(?!ain)': '챔피언 메테오',
        'Majestic Meteorain': '챔피언 메테오선',
        'Majestic Meteowrath': '분노의 챔피언 메테오',
        'Mammoth Meteor': '초거대 메테오',
        'Massive Meteor': '거대 메테오',
        '(?<! )Meteorain': '메테오 레인',
        'One and Only': '유일무이',
        'Orbital Omen': '궤도선',
        'Powerful Gust': '강풍',
        'Raw Steel(?! Trophy)': '무기 맹격',
        'Raw Steel Trophy(?! Axe| Scythe)': '무기 생성: 맹격',
        'Raw Steel Trophy Axe': '무기 생성: 맹격 도끼',
        'Raw Steel Trophy Scythe': '무기 생성: 맹격 낫',
        'Shockwave': '충격파',
        // 'Triple Tyrannhilation': 'Triple Tyrannhilation',
        '(?<! )Trophy Weapons': '무기 트로피',
        // 'Two-way Fireball': 'Two-way Fireball',
        'Ultimate Trophy Weapons': '궁극의 무기 트로피',
        'Void Stardust': '혜성우',
        '(?<! )Weapon(?!s)': '무기',
        'Weighty Impact': '겹착탄',
      },
    },
  ],
};

export default triggerSet;
