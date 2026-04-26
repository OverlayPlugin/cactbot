import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const effectB9AMap = {
  '3AC': 'fire',
  '3AD': 'earth',
  '3AE': 'water',
  '3AF': 'ice',
  '3B0': 'thunder',
  '3B1': 'wind',
} as const;

type B9AMapKeys = keyof typeof effectB9AMap;
type B9AMapValues = typeof effectB9AMap[B9AMapKeys] | 'unknown';

const isEffectB9AKey = (key: string | undefined): key is B9AMapKeys => {
  if (key === undefined)
    return false;
  return Object.keys(effectB9AMap).includes(key);
};

const b9aValueToElement = (
  id: string | undefined,
): B9AMapValues | 'unknown' => {
  if (isEffectB9AKey(id))
    return effectB9AMap[id];
  return 'unknown';
};

const elementOutputStrings = {
  fire: {
    en: 'Fire',
  },
  earth: {
    en: 'Earth',
  },
  water: {
    en: 'Water',
  },
  ice: {
    en: 'Ice',
  },
  thunder: {
    en: 'Thunder',
  },
  wind: {
    en: 'Wind',
  },
  separator: {
    en: '/',
  },
  combo: {
    en: 'Away from ${elements}',
  },
};

export interface Data extends RaidbossData {
  expectedElements: 0 | 2 | 3;
  storedElements: B9AMapValues[];
  tankbusters: string[];
}

// TODO:
// Kirin
// Shijin mechanics
// Wrought Arms
// Synchronized Strike??
//
// Ultima & Omega
// ???
//
// Kam'lanaut
// Princely Blow Tank Buster + knockback
// Sublime Elements full solve
// Illumed Facet solve
// Illumed Facet + Shield Bash solve?
//
// Eald'narche
// Spread markers for Empyeal Vortex
// Spread + Follow ups from Omega Javelin
// duplicate/visions of paradise solve?
// Ancient Triad mechanics?
// Finish Cronos Sling

const triggerSet: TriggerSet<Data> = {
  id: 'San d\'Oria: The Second Walk',
  zoneId: ZoneId.SanDoriaTheSecondWalk,
  timelineFile: 'san-doria-second-walk.txt',
  initData: () => ({
    expectedElements: 0,
    storedElements: [],
    tankbusters: [],
  }),
  triggers: [
    {
      id: 'Sandoria Second Walk Kirin Stonega IV',
      type: 'StartsUsing',
      netRegex: { id: 'AD2B', source: 'Faithbound Kirin', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Sandoria Second Walk Kirin Crimson Riddle Breath',
      type: 'StartsUsing',
      netRegex: { id: 'AFF4', source: 'Faithbound Kirin', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Sandoria Second Walk Kirin Crimson Riddle Tail',
      type: 'StartsUsing',
      netRegex: { id: 'AFF5', source: 'Faithbound Kirin', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'Sandoria Second Walk Kirin Chiseled Arm Shockwave',
      type: 'StartsUsing',
      netRegex: { id: 'ADC0', source: 'Chiseled Arm', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Sandoria Second Walk Kirin Deadly Hold',
      type: 'StartsUsing',
      netRegex: { id: 'ADB2', source: 'Faithbound Kirin', capture: false },
      condition: (data) => data.role === 'tank',
      response: Responses.getTowers(),
    },
    {
      id: 'Sandoria Second Walk Omega Ion Efflux',
      type: 'StartsUsing',
      netRegex: { id: 'AD2B', source: 'Omega, the One', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Sandoria Second Walk Ultima Antimatter Collector',
      type: 'StartsUsing',
      netRegex: { id: 'AD11', source: 'Ultima, the Feared', capture: true },
      run: (data, matches) => data.tankbusters.push(matches.target),
    },
    {
      id: 'Sandoria Second Walk Ultima Antimatter',
      type: 'StartsUsing',
      netRegex: { id: 'AD11', source: 'Ultima, the Feared', capture: false },
      delaySeconds: 0.3,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaves: Outputs.avoidTankCleaves,
        };

        if (data.tankbusters.includes(data.me))
          return { alertText: output.tankCleaveOnYou!() };
        return { infoText: output.tankCleaves!() };
      },
      run: (data) => data.tankbusters = [],
    },
    {
      id: 'Sandoria Second Walk Omega Fore-to-aft Fire',
      type: 'StartsUsing',
      netRegex: { id: 'AD25', source: 'Omega, the One', capture: false },
      durationSeconds: 8,
      response: Responses.getBackThenFront(),
    },
    {
      id: 'Sandoria Second Walk Omega Aft-to-fore Fire',
      type: 'StartsUsing',
      netRegex: { id: 'AD27', source: 'Omega, the One', capture: false },
      durationSeconds: 8,
      response: Responses.getFrontThenBack(),
    },
    {
      id: 'Sandoria Second Walk Ultima Tractor Beam',
      type: 'StartsUsing',
      netRegex: { id: 'AD06', source: 'Ultima, the Feared', capture: false },
      response: Responses.drawIn(),
    },
    {
      id: 'Sandoria Second Walk Ultima Citadel Buster',
      type: 'StartsUsing',
      netRegex: { id: 'AD1B', source: 'Ultima, the Feared', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Enspirited Swordplay',
      type: 'StartsUsing',
      netRegex: { id: 'ACBD', source: 'Kam\'lanaut', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Elemental Blade x2',
      type: 'StartsUsing',
      netRegex: { id: 'AC91', source: 'Kam\'lanaut', capture: false },
      run: (data) => {
        data.storedElements = [];
        data.expectedElements = 2;
      },
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Elemental Blade x3',
      type: 'StartsUsing',
      netRegex: { id: 'AC92', source: 'Kam\'lanaut', capture: false },
      run: (data) => {
        data.storedElements = [];
        data.expectedElements = 3;
      },
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Elemental Blade Collector',
      type: 'GainsEffect',
      netRegex: { effectId: 'B9A', count: Object.keys(effectB9AMap), capture: true },
      condition: (data, matches) => {
        if (data.expectedElements === 0)
          return false;

        const element = b9aValueToElement(matches.count);
        data.storedElements.push(element);

        return true;
      },
      durationSeconds: 3,
      infoText: (_data, matches, output) => {
        const element = b9aValueToElement(matches.count);
        return output[element]!();
      },
      outputStrings: elementOutputStrings,
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Elemental Blade',
      type: 'Ability',
      netRegex: { id: 'AC91', source: 'Kam\'lanaut', capture: false },
      condition: (data) => data.expectedElements > 0,
      durationSeconds: 10,
      alertText: (data, _matches, output) => {
        const elements = data.storedElements.join(output.separator!());
        return output.combo!({ elements: elements });
      },
      outputStrings: elementOutputStrings,
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Great Wheel',
      type: 'StartsUsing',
      netRegex: { id: ['ACAD', 'ACAE', 'ACAF', 'ACB0'], source: 'Kam\'lanaut', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out of Melee => Get Behind',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Transcendent Union',
      type: 'StartsUsing',
      netRegex: { id: 'ACB4', source: 'Kam\'lanaut', capture: false },
      durationSeconds: 11.1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE x5 => Big AoE',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Shield Bash',
      type: 'StartsUsing',
      netRegex: { id: 'ACBE', source: 'Kam\'lanaut', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Sandoria Second Walk Kamlanaut Empyreal Banish IV',
      type: 'StartsUsing',
      netRegex: { id: 'ACC0', source: 'Kam\'lanaut', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Uranos Cascade Collector',
      type: 'StartsUsing',
      netRegex: { id: 'AD52', source: 'Eald\'narche', capture: true },
      run: (data, matches) => data.tankbusters.push(matches.target),
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Uranos Cascade',
      type: 'StartsUsing',
      netRegex: { id: 'AD52', source: 'Eald\'narche', capture: false },
      delaySeconds: 0.3,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaves: Outputs.avoidTankCleaves,
        };

        if (data.tankbusters.includes(data.me))
          return { alertText: output.tankCleaveOnYou!() };
        return { infoText: output.tankCleaves!() };
      },
      run: (data) => data.tankbusters = [],
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Cronos Sling Out + Right',
      type: 'StartsUsing',
      netRegex: { id: 'AD49', source: 'Eald\'narche', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => Right',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Cronos Sling Out + Left',
      type: 'StartsUsing',
      netRegex: { id: 'AD4A', source: 'Eald\'narche', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => Left',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Cronos Sling In + Right',
      type: 'StartsUsing',
      netRegex: { id: 'AD4B', source: 'Eald\'narche', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In => Right',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Cronos Sling In + Left',
      type: 'StartsUsing',
      netRegex: { id: 'AD4C', source: 'Eald\'narche', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'In => Left',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Warp',
      type: 'StartsUsing',
      netRegex: { id: 'AD56', source: 'Eald\'narche', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow Warp => Get Behind',
        },
      },
    },
    {
      id: 'Sandoria Second Walk Ealdnarche Empyreal Vortex',
      type: 'StartsUsing',
      netRegex: { id: 'AD6D', source: 'Eald\'narche', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE x5',
        },
      },
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
