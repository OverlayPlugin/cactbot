import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type SnakingFlagsType = {
  [flags: string]: {
    elem: 'water' | 'fire';
    mech: 'protean' | 'stack' | 'buster';
  };
};

export interface Data extends RaidbossData {
  dareCount: number;
  snakings: SnakingFlagsType[string][];
  snakingCount: number;
  snakingDebuff?: 'fire' | 'water';
}

const headMarkerData = {
  // Vfx Path: m0676trg_tw_d0t1p
  'sharedBusterRed': '0103',
  // Vfx Path: target_ae_5m_s5_fire0c
  'spreadFirePuddleRed': '0294',
  // Vfx Path: m0982trg_g0c
  'partyStackFire': '029A',
  // Tethers used in Flame Floater
  'closeTether': '017B',
  'farTether': '017A',
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
    dareCount: 0,
    snakings: [],
    snakingCount: 0,
  }),
  triggers: [
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
            return output.bait!({ order: output.third!() });
          case 'BBD':
            return output.bait!({ order: output.first!() });
          case 'BBE':
            return output.bait!({ order: output.second!() });
          case 'D7B':
            return output.bait!({ order: output.fourth!() });
        }
      },
      outputStrings: {
        bait: {
          en: '${order} bait',
        },
        first: {
          en: 'First',
          de: 'Erstes',
          fr: 'Première',
          ja: '最初',
          cn: '第1组',
          ko: '첫번째',
          tc: '第1組',
        },
        second: {
          en: 'Second',
          de: 'Zweites',
          fr: 'Seconde',
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
      response: Responses.spread(),
    },
    {
      id: 'R10S Cutback Blaze',
      // Random targetted player is center for a 315? degree cleave from boss
      type: 'StartsUsing',
      netRegex: { id: 'B5C9', source: 'Red Hot', capture: false },
      condition: (data) => {
        // Second cutback randomly targets only those with the debuff
        return data.snakingDebuff !== 'water';
      },
      infoText: (_data, _matches, output) => output.stackTowardsFire!(),
      outputStrings: {
        stackTowardsFire: {
          en: 'Stack towards Fire',
        },
      },
    },
    {
      id: 'R10S Pyrotation Stack',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['partyStackFire'], capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R10S Sickest Take-off Debuff',
      type: 'GainsEffect',
      netRegex: {
        effectId: '808',
        count: ['3ED', '3EE', '3EF', '3F0', '435'],
        capture: true,
      },
      infoText: (_data, matches, output) => {
        let mech: 'healerGroups' | 'spread' | 'waterStack' | 'waterSpread';
        switch (matches.count) {
          case '3ED': // Healer Stacks during first takeoff and last takeoff (2 orbs)
            mech = 'healerGroups';
            break;
          case '3EE': // Spread during first takeoff (8 orbs)
            mech = 'spread';
            break;
          case '3EF': // Stack during Insane Air 1 during KB mech (1 orb)
            mech = 'waterStack';
            break;
          case '3F0': // Spread during Insane Air 1 during KB mech (4 orbs)
            mech = 'waterSpread';
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
        },
        waterSpread: {
          en: 'Water Spread',
        },
      },
    },
    {
      id: 'R10S Sickest Take-off Knockback',
      // 7s Cast Time
      type: 'StartsUsing',
      netRegex: { id: 'B5CE', source: 'Deep Blue', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      response: Responses.knockback(),
    },
    {
      id: 'R10S Reverse Alley-oop/Alley-oop Double-dip',
      type: 'StartsUsing',
      netRegex: { id: ['B5E0', 'B5DD'], source: 'Deep Blue', capture: true },
      condition: (data) => {
        return data.snakingDebuff !== 'fire';
      },
      infoText: (_data, matches, output) => {
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
        },
        text2: {
          en: '${mech} (${swap})',
        },
        fire: {
          en: 'Fire',
        },
        water: {
          en: 'Water',
        },
        stack: {
          en: 'Stack',
        },
        protean: Outputs.protean,
        // Not using Outputs.tankBuster for brevity
        buster: {
          en: 'Buster',
        },
        swapText: {
          en: '${role} Swap',
        },
        tank: Outputs.tank,
        healer: Outputs.healer,
        melee: {
          en: 'Melee',
        },
        ranged: {
          en: 'Ranged',
        },
      },
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
        },
        watersnaking: {
          en: 'Blue\'s Target',
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
        },
        spread: {
          en: 'Water Spread',
        },
        text: {
          en: '${dir} + ${mech} + Fire Spread',
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
      },
    },
  ],
};

export default triggerSet;
