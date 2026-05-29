import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import { DirectionOutput8, Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { PluginCombatantState } from '../../../../../types/event';
import { Matches } from '../../../../../types/net_matches';
import type { LocaleText, Output, TriggerSet } from '../../../../../types/trigger';

type KirinSequenceStep =
  | 'out'
  | 'under'
  | 'sides'
  | 'awayBossArms'
  | 'awayBoss'
  | 'awayArms'
  | 'awayTethered'
  | 'flank'; // | 'dodge'

type KamSixDirection = 'dirN' | 'dirNE' | 'dirSE' | 'dirS' | 'dirSW' | 'dirNW';

type KamElement = 'fire' | 'earth' | 'water' | 'ice' | 'lightning' | 'wind';

type KamBlade = {
  x: number;
  y: number;
  // heading: number;
};
const kirinCenter = [-850.00, 780.00];

const kirinSequenceOutputStrings = {
  out: Outputs.out,
  under: Outputs.getUnder,
  sides: Outputs.sides,
  awayBossArms: {
    en: 'Away from boss & arms',
  },
  awayBoss: {
    en: 'Away from boss',
  },
  awayArms: {
    en: 'Away from Arms (on boss hitbox)',
  },
  awayTethered: {
    en: '${dir} away from tethered arm',
  },
  flank: {
    en: 'Max melee on flank',
  },
  maxMelee: {
    en: 'Max melee $dir',
  },
  // dodge: {
  //   en: 'Dodge'
  // },
  next: Outputs.next,
  east: Outputs.east,
  west: Outputs.west,
  north: Outputs.north,
};

const kamlanautElementalOutputStrings: { [key in KamElement]: LocaleText } = {
  fire: {
    en: 'Fire',
  },
  water: {
    en: 'Water',
  },
  wind: {
    en: 'Wind',
  },
  earth: {
    en: 'Earth',
  },
  lightning: {
    en: 'Lightning',
  },
  ice: {
    en: 'Ice',
  },
};

const kamSixDirections = [
  'dirSE',
  'dirS',
  'dirSW',
  'dirNW',
  'dirN',
  'dirNE',
];

const kamlanautElementBuffIds: { [key: string]: KamElement } = {
  '3AC': 'fire',
  '3AD': 'earth',
  '3AE': 'water',
  '3AF': 'ice',
  '3B0': 'lightning',
  '3B1': 'wind',
};

const kamlanautSublimeConeCasts: { [key: string]: KamElement } = {
  'AC93': 'fire',
  'AC94': 'earth',
  'AC95': 'water',
  'AC96': 'ice',
  'AC97': 'lightning',
  'AC98': 'wind',
  // ## aoes that expand
  'AC99': 'fire',
  'AC9A': 'earth',
  'AC9B': 'water',
  'AC9C': 'ice',
  'AC9D': 'lightning',
  'AC9E': 'wind',
};
const kamlanautSublimeBladeCasts: { [key: string]: KamElement } = {
  'AC9F': 'fire',
  'ACA0': 'earth',
  'ACA1': 'water',
  'ACA2': 'ice',
  'ACA3': 'lightning',
  'ACA4': 'wind',
  // ## aoes that expand
  'ACA5': 'fire',
  'ACA6': 'earth',
  'ACA7': 'water',
  'ACA8': 'ice',
  'ACA9': 'lightning',
  'ACAA': 'wind',
};

const kamlanautCrystalNpcIds: { [key: string]: KamElement } = {
  '1EBE84': 'fire',
  '1EBE85': 'water',
  '1EBE86': 'wind',
  '1EBE87': 'earth',
  '1EBE88': 'ice',
  '1EBE89': 'lightning',
};

const kirinSequenceInfoOutput = (
  sequence: KirinSequenceStep[],
  ability: string[],
  direction?: 'east' | 'west' | 'north',
) => {
  return (data: Data, _matches: Matches, output: Output) => {
    data.kirinSequencedSafeCallouts = {};
    const items: string[] = [];
    sequence.forEach((step, index) => {
      const key = ability[index];
      if (key !== undefined) {
        const call = step === 'awayTethered'
          ? output[step]!({ dir: output[direction!]!() })
          : output[step]!();
        data.kirinSequencedSafeCallouts[key] = call;
        items.push(call);
        // console.info(`${index} - ${key} => ${call}`);
      }
    });
    data.kirinSequenceCalls = items.length - 1;
    const result = items.join(output.next!());
    console.log(result);
    return result;
    // return { infoText: result };
  };
};

const floatNear = (n1: number, n2: number, epsilon = 0.1) => {
  return Math.abs(n1 - n2) < epsilon;
};

const isValidSiXDir = (dir: DirectionOutput8 | undefined): dir is KamSixDirection => {
  return kamSixDirections.includes(dir!);
};

const emptySixDirections = () => {
  return {
    dirSE: undefined,
    dirS: undefined,
    dirSW: undefined,
    dirNW: undefined,
    dirN: undefined,
    dirNE: undefined,
  };
};

type OrbLocation = 'north' | 'middle' | 'south';

const sublimeElementsBladeSafespot = (
  blades: { [p: string]: KamBlade },
  elements: KamElement[],
) => {
  const cols: Record<number, string | null> = { [-220]: null, [-200]: null, [-180]: null };
  const rows: Record<number, string | null> = { 130: null, 150: null, 170: null };

  for (const [ele, pos] of Object.entries(blades)) {
    const x = Number(pos.x);
    const y = Number(pos.y);
    const val = elements.includes(ele as KamElement) ? 'BAD' : ele;
    if (floatNear(y, 110, 0.5)) {
      cols[x] = val;
    } else {
      rows[y] = val;
    }
  }

  const validCols = Object.values(cols).filter((v) => (v !== null) && v !== 'BAD') as string[];
  const validRows = Object.values(rows).filter((v) => (v !== null) && v !== 'BAD') as string[];

  if (!(validCols.length >= 1 || validRows.length >= 1)) {
    throw new Error('Invalid blade configuration');
  }

  const result: string[] = [];
  if (validCols.length === 1) {
    result.push(validCols[0]!);
    if (validRows.length < 3)
      result.push(validRows[0]!);
  } else if (validRows.length === 1) {
    result.push(validRows[0]!);
    if (validCols.length < 3)
      result.push(validCols[0]!);
  }

  return result;
};

const OmegaManaScreenPatterns: { [key: string]: { [key in OrbLocation]?: string } } = {
  'ceB,nwC,seB': { middle: 'frontRight' },
  'ceC,nwB,seC': { south: 'backLeft' },
  'ceC,nwB,swC': { south: 'frontMiddle' },
  'cwC,neB,seB': { north: 'backMiddle' },
  'cwC,nwB,seB': { north: 'frontRight', middle: 'frontRight' },
};

export interface Data extends RaidbossData {
  tankbusterTargets: string[];
  combatantData: PluginCombatantState[];
  kirinInSynchronizedSeq: boolean;
  kirinSequencedSafeCallouts: { [key: string]: string };
  kirinSequenceCalls: number;
  omegaOrbs: OrbLocation[];
  omegaManaScreens: string[];
  kamElements: KamElement[];
  kamElementalCones: Record<KamSixDirection, KamElement | undefined>;
  kamElementalBlades: { [key: string]: KamBlade };
  kamEstocHeadings: number[];
  kamCrystalLocations: { [key: string]: KamElement };
  kamCrystalCasts: KamSixDirection[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'San d\'Oria: The Second Walk',
  zoneId: ZoneId.SanDoriaTheSecondWalk,
  timelineFile: 'san-doria-second-walk.txt',
  initData: () => {
    return {
      tankbusterTargets: [],
      combatantData: [],
      kirinInSynchronizedSeq: false,
      kirinSequencedSafeCallouts: {},
      kirinSequenceCalls: 0,
      omegaOrbs: [],
      omegaManaScreens: [],
      kamElements: [],
      kamElementalCones: emptySixDirections(),
      kamElementalBlades: {},
      kamEstocHeadings: [],
      kamCrystalLocations: {},
      kamCrystalCasts: [],
    };
  },
  triggers: [
    // ----------------------
    // Faithbound Kirin
    {
      id: 'San dOria Second Walk Faithbound Kirin Stonega IV',
      type: 'StartsUsing',
      netRegex: { id: 'ADCA', source: 'Faithbound Kirin', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Crimson Riddle Front',
      type: 'StartsUsing',
      netRegex: { id: ['AFF4'], source: 'Faithbound Kirin', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Crimson Riddle Rear',
      type: 'StartsUsing',
      netRegex: { id: ['AFF5'], source: 'Faithbound Kirin', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Punishment',
      type: 'StartsUsing',
      netRegex: { id: 'ADCB', source: 'Faithbound Kirin' },
      response: Responses.tankBuster(),
    },
    {
      // every tower must be taken, or it is a wipe
      // arms also cast AF80, ADB6 (slightly different timings for some reason)
      // ADBF - damage from tower (Bury)
      id: 'San dOria Second Walk Faithbound Kirin Deadly Hold',
      type: 'StartsUsing',
      netRegex: { id: 'ADB2', source: 'Faithbound Kirin', capture: false },
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank' || data.job === 'BLU')
          return output.tankTower!();
      },
      outputStrings: {
        tankTower: {
          en: 'Soak Tank Tower',
        },
      },
    },
    {
      id: 'San dOria Second Walk Chiseled Arm Shockwave',
      type: 'StartsUsing',
      netRegex: { id: 'ADC0', source: 'Chiseled Arm', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Striking Right',
      type: 'StartsUsing',
      netRegex: { id: 'AD93', source: 'Faithbound Kirin', capture: false },
      infoText: (_data, _matches, output) => {
        return output.awayTethered!({ dir: output.east!() });
      },
      outputStrings: kirinSequenceOutputStrings,
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Striking Left',
      type: 'StartsUsing',
      netRegex: { id: 'ADAF', source: 'Faithbound Kirin', capture: false },
      infoText: (_data, _matches, output) => {
        return output.awayTethered!({ dir: output.west!() });
      },
      outputStrings: kirinSequenceOutputStrings,
    },
    {
      // AD95 - mechanic cast
      // AD96 - from boss x2
      // AD9C, AD9B - from Sculpted Arms
      id: 'San dOria Second Walk Faithbound Kirin Synchronized Strike',
      type: 'StartsUsing',
      netRegex: { id: 'AD95', source: 'Faithbound Kirin', capture: false },
      infoText: kirinSequenceInfoOutput(['sides', 'awayArms'], ['_', 'AD95']),
      outputStrings: kirinSequenceOutputStrings,
      //     en: 'dodge => away from Arms (on boss hitbox)',
    },
    {
      // Sides -> north on hitbox (away from arms) -> west max melee (away from tethered arm)
      // -- (I don't think it can use ADAF?)
      // 0.00s StartsCasting ADA0 Synchronized Sequence (9.100s)
      // 0.00s StartsCasting ADA1 Synchronized Sequence (9.700s)
      // 0.00s StartsCasting ADA1 Synchronized Sequence (9.700s)
      // 1.07s StartsCasting ADB0 Synchronized Strike (2.700s)
      // 1.07s StartsCasting ADB0 Synchronized Strike (2.700s)
      // 5.08s StartsCasting ADAE Striking Right (2.700s)
      // 9.45s StartsCasting AD9C Synchronized Smite (4.700s)
      // 9.45s StartsCasting AD9B Synchronized Smite (4.700s)
      // 12.48s StartsCasting ADA3 Striking Right (1.700s)
      // 17.56s StartsCasting ADA9 Smiting Right (1.700s)
      // ------------------------
      // sides -> away from boss and arms -> under boss
      //  0.00s StartsCasting ADA0 Synchronized Sequence (9.100s)
      //  0.00s StartsCasting ADA1 Synchronized Sequence (9.700s)
      //  0.00s StartsCasting ADA1 Synchronized Sequence (9.700s)
      //  1.02s StartsCasting ADB0 Synchronized Strike (2.700s)
      //  1.02s StartsCasting ADB0 Synchronized Strike (2.700s)
      //  5.03s StartsCasting ADAD Wringer (2.700s)
      //  9.49s StartsCasting AD9C Synchronized Smite (4.700s)
      //  9.49s StartsCasting AD9B Synchronized Smite (4.700s)
      // 12.52s StartsCasting ADA2 Wringer (1.700s)
      // ------------------------
      //
      id: 'San dOria Second Walk Faithbound Kirin Synchronized Sequence',
      type: 'StartsUsing',
      netRegex: { id: 'ADA0', source: 'Faithbound Kirin', capture: false },
      run: (data) => {
        console.info('SEQUENCE START');
        data.kirinInSynchronizedSeq = true;
      },
      // infoText: kirinSequenceInfoOutput(['sides', 'awayBossArms', 'under'], ['_', 'ADA1', 'ADA2']),
      // outputStrings: kirinSequenceOutputStrings,
      //     en: 'Sides => Away from boss & arms => Under boss',
    },
    {
      // Wringer or Striking Right preview mechanic
      id: 'San dOria Second Walk Faithbound Kirin Synchronized Sequence Part2',
      type: 'StartsUsing',
      netRegex: { id: ['ADAE', 'ADAD'], capture: true },
      condition: (data) => {
        return data.kirinInSynchronizedSeq;
      },
      durationSeconds: 8,
      infoText: (data, matches, output) => {
        if (matches.id === 'ADAE') {
          // striking right
          data.kirinSequencedSafeCallouts['ADA1'] = output.maxMelee!({ dir: output.north!() });
          data.kirinSequencedSafeCallouts['ADA3'] = output.awayTethered!({ dir: output.west!() });
          data.kirinSequenceCalls = 2;
          return [
            output.sides!(),
            output.maxMelee!({ dir: output.north!() }),
            output.awayTethered!({ dir: output.west!() }),
          ].join(output.next!());
        }
        // wringer
        data.kirinSequencedSafeCallouts['ADA1'] = output.awayBossArms!();
        data.kirinSequencedSafeCallouts['ADA2'] = output.under!();
        data.kirinSequenceCalls = 2;
        return [
          output.sides!(),
          output.awayBossArms!(),
          output.under!(),
        ].join(output.next!());
      },
      outputStrings: kirinSequenceOutputStrings,
    },
    {
      // AD9D - mech cast
      // ADAD - preview out aoe
      // ADB0 - preview line aoes from boss
      // AD9D - out aoe (Double Wringer)
      // ADA6 - line aoes from boss (ADA5 selfcast)
      // AD97 - under (Dead Wringer)
      // ADAB,ADAC - line aoes from arms
      id: 'San dOria Second Walk Faithbound Kirin Double Wringer',
      type: 'StartsUsing',
      netRegex: { id: 'AD9D', source: 'Faithbound Kirin', capture: false },
      condition: (data) => {
        return !data.kirinInSynchronizedSeq;
      },
      durationSeconds: 10,
      infoText: kirinSequenceInfoOutput(['out', 'flank', 'under'], ['_', 'AD9D', 'ADA6']),
      outputStrings: kirinSequenceOutputStrings,
      //     en: 'Out => Max melee on flank => Under boss',
    },
    {
      id: 'San dOria Second Walk Faithbound Kirin Smiting Right Sequence',
      type: 'StartsUsing',
      netRegex: { id: 'AD9E', source: 'Faithbound Kirin', capture: false },
      durationSeconds: 12,
      infoText: kirinSequenceInfoOutput(['awayTethered', 'awayBoss', 'under'], [
        '_',
        'AD9E',
        'ADA2',
      ], 'east'),
      outputStrings: kirinSequenceOutputStrings,
      //     en: 'Away from tethered arm (East) => away from boss => under',
    },
    {
      // AD9F - cast
      // ADAF - left punch preview
      // ADAD - out preview
      // AD9F - left punch damage
      // ADA2 - Wringer damage
      // AD9A - arm punch (Smiting Left)
      // ADA7 - under (Dead Wringer)
      id: 'San dOria Second Walk Faithbound Kirin Smiting Left Sequence',
      type: 'StartsUsing',
      netRegex: { id: 'AD9F', source: 'Faithbound Kirin', capture: false },
      condition: (data) => {
        return !data.kirinInSynchronizedSeq;
      },
      durationSeconds: 12,
      infoText: kirinSequenceInfoOutput(['awayTethered', 'awayBoss', 'under'], [
        '_',
        'AD9F',
        'ADA2',
      ], 'west'),
      outputStrings: kirinSequenceOutputStrings,
      //     en: 'Away from tethered arm (West) => away from boss => under',
    },
    {
      // AD92 - cast
      // AD97, AD98 - from Sculpted Arms
      id: 'San dOria Second Walk Faithbound Kirin Wringer',
      type: 'StartsUsing',
      netRegex: { id: 'AD92', source: 'Faithbound Kirin', capture: false },
      infoText: kirinSequenceInfoOutput(['out', 'under'], ['_', 'AD92']),
      outputStrings: kirinSequenceOutputStrings,
    },
    // Calls the next part of the current multi-part mechanic (triggers on the one proceeding action)
    {
      id: 'San dOria Second Walk Faithbound Kirin Sequenced Mechanics',
      type: 'Ability',
      netRegex: {
        id: ['AD9D', 'ADA6', 'AD96', 'AD97', 'ADA1', 'AD9C', 'ADA2', 'ADA3', 'AD9E', 'AD9F'],
        source: 'Faithbound Kirin',
        capture: true,
      },
      condition: (data) => data.kirinSequenceCalls > 0,
      suppressSeconds: 1,
      alertText: (data, matches, _output) => {
        if (!Object.keys(data.kirinSequencedSafeCallouts).includes(matches.id)) {
          return;
        }
        const call = data.kirinSequencedSafeCallouts[matches.id];
        if (call === undefined) {
          throw new UnreachableCode();
        }
        data.kirinSequenceCalls--;
        if (data.kirinSequenceCalls === 0 && data.kirinInSynchronizedSeq) {
          console.info('SEQUENCE OVER!');
          data.kirinInSynchronizedSeq = false;
        }
        console.info(`SEQMECH - ${matches.ability} ${matches.id} => ${call}`);
        return call;
      },
      outputStrings: {},
    },
    // SUMMON: Seiryu
    {
      // AD80 - orange/CW
      // AD81 - blue/CCW
      id: 'San dOria Second Walk Faithbound Kirin Eastwind Wheel',
      type: 'StartsUsing',
      netRegex: { id: ['AD80', 'AD81'], source: 'Dawnbound Seiryu' },
      infoText: (_data, matches, output) => {
        const x = parseFloat(matches.x);
        const y = parseFloat(matches.y);
        const rotation = matches.id === 'AD81' ? -1 : 1;
        // N = 0, E = 1, S = 2, W = 3
        const card = Directions.xyTo4DirNum(x, y, kirinCenter[0]!, kirinCenter[1]!);
        const safeHalf = ['north', 'east', 'south', 'west'][(card + rotation) % 4];
        if (safeHalf !== undefined)
          return output.dodgeDir!({ dir: output[safeHalf]!() });
        return output.dodge!();
      },
      outputStrings: {
        dodge: {
          en: 'Avoid rotating AoE',
        },
        dodgeDir: {
          en: '${dir} half safe',
        },
        north: Outputs.north,
        east: Outputs.east,
        west: Outputs.west,
        south: Outputs.south,
      },
    },
    {
      // Stonega III is used in both Seiryu (A917) and Suzaku (B07A)
      id: 'San dOria Second Walk Faithbound Kirin Stonega III',
      type: 'StartsUsing',
      netRegex: { id: ['A917', 'B07A'], source: 'Faithbound Kirin' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    // SUMMON Genbu
    {
      // large AOE (dash destination) followed by get under
      id: 'San dOria Second Walk Faithbound Kirin Midwinter March',
      type: 'StartsUsing',
      netRegex: { id: 'AD87', source: 'Moonbound Genbu', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow Moonbound Genbu => Get under',
        },
      },
    },
    // {
    //   id: 'San dOria Second Walk Faithbound Kirin Northern Current',
    //   type: 'StartsUsing',
    //   netRegex: { id: 'AD88', source: 'Moonbound Genbu' },
    //   infoText: (_data, matches, output) => {
    //     return output.under!({ name: matches.source });
    //   },
    //   outputStrings: {
    //     under: {
    //       en: 'Get under ${name}',
    //     },
    //   },
    // },
    {
      id: 'San dOria Second Walk Faithbound Kirin Shattering Stomp',
      type: 'StartsUsing',
      netRegex: { id: 'AD84', source: 'Moonbound Genbu', capture: false },
      response: Responses.aoe(),
    },
    {
      // floor explosions
      id: 'San dOria Second Walk Faithbound Kirin Moontide Font',
      type: 'StartsUsing',
      netRegex: { id: ['AD85', 'AD86'], source: 'Moonbound Genbu', capture: false },
      suppressSeconds: 10,
      infoText: (_data, _matches, output) => {
        return output.avoid!();
      },
      outputStrings: {
        avoid: {
          en: 'Avoid geyser explosions',
        },
      },
    },
    // SUMMON Byakko
    {
      // dashes to the panel opposite and uses Razor Fang (AD90)
      id: 'San dOria Second Walk Faithbound Kirin Gloaming Gleam',
      type: 'StartsUsing',
      netRegex: { id: 'AD8F', source: 'Duskbound Byakko' },
      infoText: (_data, matches, output) => {
        return output.sides!({ name: matches.source });
      },
      outputStrings: {
        sides: {
          en: 'Go to sides of ${name} (not in front)',
        },
      },
    },
    // SUMMON Suzaku
    {
      // self-target AD8A
      id: 'San dOria Second Walk Faithbound Kirin Vermilion Flight',
      type: 'StartsUsing',
      netRegex: { id: 'AEFB', source: 'Sunbound Suzaku' },
      durationSeconds: 7,
      alertText: (_data, matches, output) => {
        return output.sides!({ name: matches.source });
      },
      outputStrings: {
        sides: {
          en: 'Avoid ${name} dash + dodge ground AoEs',
        },
      },
    },

    // ----------------------
    // Ultima & Omega

    {
      id: 'San dOria Second Walk Omega, the One Ion Efflux',
      type: 'StartsUsing',
      netRegex: { id: 'AD2B', source: 'Omega, the One', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'San dOria Second Walk Omega, the One Citadel Buster',
      type: 'StartsUsing',
      netRegex: { id: 'AD1B', source: 'Ultima, the Feared', capture: false },
      response: Responses.aoe(),
    },
    {
      // B087 is the cast, but happens way in advance
      id: 'San dOria Second Walk Omega, the One Anti-personnel Missile',
      type: 'StartsUsing',
      netRegex: { id: 'B088', source: 'Omega, the One' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'San dOria Second Walk Omega, the One Antimatter',
      type: 'StartsUsing',
      netRegex: { id: 'AD11', source: 'Ultima, the Feared' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => {
        return output.tankBusterOnYou!();
      },
      outputStrings: {
        tankBusterOnYou: Outputs.tankBusterOnYou,
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Mana Screen Collect',
      type: 'CombatantMemory',
      netRegex: { change: 'Add', pair: [{ key: 'BNpcID', value: ['1EBE8B', '1EBE8C'] }] },
      run: (data, matches) => {
        const x = parseFloat(matches.pairPosX ?? '0');
        const y = parseFloat(matches.pairPosY ?? '0');
        // both platforms are in line with each other, so for X we need to check 2 values
        const col1 = floatNear(x, 725) || floatNear(x, 790);
        // const col2 = floatNear(x, 745) || floatNear(x, 810);
        const row1 = floatNear(y, 784);
        const row2 = floatNear(y, 800);
        // const row3 = floatNear(y, 816);
        const direction = matches.pairBNpcID === '1EBE8B' ? 'B' : 'C';
        const key = `${row1 ? 'n' : (row2 ? 'c' : 's')}${col1 ? 'w' : 'e'}${direction}`;
        data.omegaManaScreens.push(key);
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Energy Orb (cast)',
      type: 'Ability',
      netRegex: { id: 'AD08', source: 'Ultima, the Feared', capture: false },
      delaySeconds: 2,
      durationSeconds: 7,
      promise: async (data) => {
        const actors = (await callOverlayHandler({
          call: 'getCombatants',
        })).combatants;
        const orbs = actors.filter((actor) => actor.BNpcID === 18714 && actor.ModelStatus === 0);
        orbs.forEach((orb) => {
          const y = Number(orb.PosY);
          if (floatNear(y, 784))
            data.omegaOrbs.push('north');
          else if (floatNear(y, 800))
            data.omegaOrbs.push('middle');
          else if (floatNear(y, 816))
            data.omegaOrbs.push('south');
        });
      },
      infoText: (data, _matches, output) => {
        if (data.omegaOrbs.length === 1 && data.omegaManaScreens.length === 0 && data.omegaOrbs[0])
          // just one energy orb going off
          return output.avoidLaserDir!({ dir: output[data.omegaOrbs[0]]!() });
        else if (data.omegaOrbs.length === 2 && data.omegaManaScreens.length === 0)
          // 2 orbs is always middle
          return output.middle!();
        else if (data.omegaOrbs.length === 1 && data.omegaManaScreens.length === 1) {
          // simple 1 orb/1 screen pattern, just opposite corner really
          const loc = data.omegaManaScreens[0]!;
          if (data.omegaOrbs[0] === 'north' && loc === 'neB') {
            return output.getLocation!({ dir: output.backRight!() });
          } else if (data.omegaOrbs[0] === 'south' && loc === 'seC') {
            return output.getLocation!({ dir: output.backLeft!() });
          }
        } else if (data.omegaOrbs.length === 1 && data.omegaManaScreens.length === 3) {
          // 3 screen pattern
          const key = data.omegaManaScreens.sort().join(',');
          const patterns = OmegaManaScreenPatterns[key];
          if (patterns !== undefined) {
            const call = patterns[data.omegaOrbs[0]!];
            if (call !== undefined)
              return output.getLocation!({ dir: output[call]!() });
          }
        }
        console.error(`Second Walk Omega, the One Energy Orb: unknown pattern:`);
        console.error(`${data.omegaOrbs.join(', ')} ${data.omegaManaScreens.join(', ')}`);
        return output.avoid!();
      },
      outputStrings: {
        avoid: {
          en: 'Avoid lasers',
        },
        avoidLaserDir: {
          en: 'Avoid ${dir} laser',
        },
        getLocation: {
          en: '${dir}',
        },
        getMiddle: {
          en: 'Get Middle',
        },
        frontLeft: {
          en: 'Front Left',
          de: 'Vorne Links',
          fr: 'Avant Gauche',
          ja: '前左',
          cn: '左前',
          ko: '앞 왼쪽',
        },
        frontMiddle: {
          en: 'Front Middle',
        },
        frontRight: {
          en: 'Front Right',
          de: 'Vorne Rechts',
          fr: 'Avant Droit',
          ja: '前右',
          cn: '右前',
          ko: '앞 오른쪽',
        },
        backLeft: {
          en: 'Back Left',
          de: 'Hinten Links',
          fr: 'Arrière Gauche',
          ja: '後左',
          cn: '左后',
          ko: '뒤 왼쪽',
        },
        backMiddle: {
          en: 'Back Middle',
        },
        backRight: {
          en: 'Back Right',
          de: 'Hinten Rechts',
          fr: 'Arrière Droit',
          ja: '後ろ右',
          cn: '右后',
          ko: '뒤 오른쪽',
        },
        north: Outputs.left,
        middle: Outputs.middle,
        south: Outputs.right,
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Orb/Screen Cleanup',
      type: 'Ability',
      netRegex: { id: 'AD32', source: 'Energy Orb', capture: false },
      run: (data) => {
        data.omegaOrbs = [];
        data.omegaManaScreens = [];
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Hyper Pulse',
      type: 'StartsUsing',
      netRegex: { id: 'AD2F', source: 'Omega, the One', capture: false },
      infoText: (_data, _matches, output) => {
        return output.outOfMiddle!();
      },
      outputStrings: {
        outOfMiddle: {
          en: 'Out of Middle',
        },
      },
    },
    {
      // targeted aoe drops in the direction it is moving
      id: 'San dOria Second Walk Omega, the One Trajectory Projection',
      type: 'HeadMarker',
      netRegex: { id: ['0269', '026A', '026B', '026C'], capture: true },
      condition: Conditions.targetIsYou(),
      countdownSeconds: 8.9,
      infoText: (_data, matches, output) => {
        switch (matches.id) {
          case '0269':
            return output.droppingAoeDir!({ dir: output.east!() });
          case '026A':
            return output.droppingAoeDir!({ dir: output.west!() });
          case '026B':
            return output.droppingAoeDir!({ dir: output.south!() });
          case '026C':
            return output.droppingAoeDir!({ dir: output.north!() });
        }
        return Outputs.unknown;
      },
      outputStrings: {
        droppingAoeDir: {
          en: 'Dropping aoe to your ${dir}, move opposite in',
        },
        north: Outputs.north,
        east: Outputs.east,
        west: Outputs.west,
        south: Outputs.south,
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Chemical Bomb',
      type: 'StartsUsing',
      netRegex: { id: 'AD0E', source: 'Ultima, the Feared', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Rotate away from proximity markers',
          de: 'Weg rotieren von den Distanzmarkierungen',
          fr: 'Tournez loin des marqueurs de proximité',
          ja: '距離減衰マーカー 3発目から1発目に避ける',
          cn: '远离距离衰减 AoE 落点',
          ko: '회전하면서 거리감쇠 징 피하기',
        },
      },
    },
    {
      id: 'San dOria Second Walk Omega, the One Aft-to-fore Fire',
      type: 'StartsUsing',
      netRegex: { id: 'AD27', source: 'Omega, the One', capture: false },
      response: Responses.getFrontThenBack(),
    },
    {
      id: 'San dOria Second Walk Omega, the One Fore-to-aft Fire',
      type: 'StartsUsing',
      netRegex: { id: 'AD25', source: 'Omega, the One', capture: false },
      response: Responses.getBackThenFront(),
    },
    {
      id: 'San dOria Second Walk Omega, the One Tractor Beam',
      type: 'StartsUsing',
      netRegex: { id: 'AD06', source: 'Ultima, the Feared', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go to west edge, avoid ship',
        },
      },
    },
    {
      // this might be too much, could be good though?
      id: 'San dOria Second Walk Omega, the One Multi-missile',
      type: 'StartsUsing',
      netRegex: { id: 'AFEC', source: 'Omega, the One', capture: false },
      suppressSeconds: 1,
      countdownSeconds: 3.9,
      soundVolume: 0,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'ground AoEs go off',
        },
      },
    },
    // ----------------------
    // Kam'lanaut
    {
      id: 'San dOria Second Walk Kam\'lanaut Enspirited Swordplay',
      type: 'StartsUsing',
      netRegex: { id: 'ACBD', source: 'Kam\'lanaut', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Shockwave',
      type: 'StartsUsing',
      netRegex: { id: 'ACB3', source: 'Kam\'lanaut', capture: false },
      response: Responses.aoe('alert'),
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Empyreal Banish III',
      type: 'HeadMarker',
      netRegex: { id: '0178' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Princely Blow',
      type: 'HeadMarker',
      netRegex: { id: '0265', capture: true },
      alertText: (data, matches, output) => {
        // targets the boss itself unfortunately, so need to use data0
        const target = data.party?.idToName_?.[matches.data0];
        data.tankbusterTargets.push(target ?? '');
        if (data.me === target)
          return output.tankBusterKnockBack!();
      },
      outputStrings: {
        tankBusterKnockBack: {
          en: 'Tank Buster + Knockback',
        },
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Princely Blow Not You',
      type: 'HeadMarker',
      netRegex: { id: '0265', capture: false },
      delaySeconds: 0.3,
      suppressSeconds: 5,
      infoText: (data, _matches, output) => {
        if (data.tankbusterTargets.length === 0 || data.tankbusterTargets.includes(data.me))
          return;

        if (data.role === 'healer')
          return output.tankBuster!();

        return output.avoidTankCleaves!();
      },
      run: (data, _matches) => data.tankbusterTargets = [],
      outputStrings: {
        tankBuster: Outputs.tankBuster,
        avoidTankCleaves: Outputs.avoidTankCleaves,
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Light Blade',
      type: 'Ability',
      netRegex: { id: 'ACAB', source: 'Kam\'lanaut', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Behind a sword',
        },
      },
    },
    {
      // ACAF - aoe under boss -> cleave
      // ACAE - aoe under boss => cleave + stack
      // ACB1 - cleave
      // ACC0 - stack Empyreal Banish IV
      // TODO: Revist
      id: 'San dOria Second Walk Kam\'lanaut Great Wheel',
      type: 'Ability',
      netRegex: { id: 'ACAF', source: 'Kam\'lanaut', capture: false },
      suppressSeconds: 1,
      response: Responses.getBehind(),
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Great Wheel Stack',
      type: 'Ability',
      netRegex: { id: 'ACAE', source: 'Kam\'lanaut', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.behindStack!(),
      outputStrings: {
        behindStack: {
          en: 'Get behind and Stack',
        },
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Empyreal Banish IV',
      type: 'StartsUsing',
      netRegex: { id: 'ACC0', source: 'Kam\'lanaut' },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.stackOnYou!(),
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
      },
    },
    {
      // AD01 Elemental Edge x6 aoe
      // ACB5 big damage at end
      id: 'San dOria Second Walk Kam\'lanaut Transcendent Union',
      type: 'StartsUsing',
      netRegex: { id: 'ACB4', source: 'Kam\'lanaut', capture: false },
      delaySeconds: 2,
      durationSeconds: 9,
      response: Responses.bigAoe('alarm'),
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Illumed Estoc',
      type: 'StartsUsing',
      netRegex: { id: 'ACBA', source: 'Kam\'lanaut' },
      infoText: (data, matches, output) => {
        data.kamEstocHeadings.push(Number(matches.heading));
        if (data.kamEstocHeadings.length === 3) {
          data.kamEstocHeadings = [];
          return output.text!();
        }
      },
      outputStrings: {
        text: {
          en: 'Dodge clone line AoEs on edge', // FEEDBACK: better wording?
        },
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Shield Bash',
      type: 'StartsUsing',
      netRegex: { id: 'ACBE', source: 'Kam\'lanaut', capture: false },
      alertText: (data, _matches, output) => {
        if (data.kamEstocHeadings.length === 0) {
          return output.knockbackAny!();
        } else if (data.kamEstocHeadings.length === 2) {
          const allDirections: DirectionOutput8[] = ['dirN', 'dirSW', 'dirSE'];
          const headingsAsDir = data.kamEstocHeadings.map((h) =>
            Directions.output8Dir[Directions.hdgTo8DirNum(h)]
          );
          const call = allDirections.filter((x) => !headingsAsDir.includes(x))[0]!;
          data.kamEstocHeadings = [];
          return output.knockbackDir!({ dir: output[call]!() });
        }
      },
      outputStrings: {
        knockbackAny: {
          en: 'Get knocked down long platform',
        },
        knockbackDir: {
          en: 'Get knocked down ${dir} platform',
        },
        dirN: Outputs.north,
        dirSW: Outputs.southwest,
        dirSE: Outputs.southeast,
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Elemental Blade Buff Collect',
      type: 'GainsEffect',
      netRegex: { effectId: 'B9A' },
      durationSeconds: 1.5,
      soundVolume: 0,
      infoText: (data, matches, output) => {
        const element = kamlanautElementBuffIds[matches.count];
        if (element === undefined)
          throw new UnreachableCode();
        data.kamElements.push(element);
        return output[element]!();
      },
      outputStrings: kamlanautElementalOutputStrings,
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Elemental Blade Blade Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: Object.keys(kamlanautSublimeBladeCasts) },
      run: (data, matches, _output) => {
        const element = kamlanautSublimeBladeCasts[matches.id];
        if (element === undefined)
          throw new UnreachableCode();
        data.kamElementalBlades[element] = {
          x: parseFloat(matches.x),
          y: parseFloat(matches.y),
        };
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Elemental Blade Cone Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: Object.keys(kamlanautSublimeConeCasts) },
      run: (data, matches, _output) => {
        const element = kamlanautSublimeConeCasts[matches.id];
        if (!element)
          throw new UnreachableCode();

        const dir =
          Directions.output8Dir[Directions.hdgTo8DirNum(Number.parseFloat(matches.heading))];

        if (isValidSiXDir(dir))
          data.kamElementalCones[dir] = element;
      },
    },
    {
      // for both pizza slice and cross line aoe elemental mechanics
      id: 'San dOria Second Walk Kam\'lanaut Sublime Elements',
      type: 'StartsUsing',
      netRegex: { id: 'B00A', source: 'Kam\'lanaut', capture: false },
      delaySeconds: 0.5,
      durationSeconds: 7,
      alertText: (data, _matches, output) => {
        // crossing line aoes, of which 2 or 3 expand
        if (data.kamElementalBlades['fire'] !== undefined) {
          const result = sublimeElementsBladeSafespot(data.kamElementalBlades, data.kamElements);
          console.info(result);
          if (result.length === 2) {
            return output.nextToCross!({
              ele1: output[result[0]!]!(),
              ele2: output[result[1]!]!(),
            });
          } else if (result.length === 1) {
            return output.nextToBlade!({ ele: output[result[0]!]!() });
          }
          console.error('Sublime Blades: unknown pattern');
          return 'Error';
        }
        // cone aoes from the boss, of which 2 or 3 expand
        const dirs = Object.keys(data.kamElementalCones) as KamSixDirection[];
        for (let i = 0; i < dirs.length; i++) {
          const d1 = dirs[i]!;
          const d2 = dirs[(i + 1) % dirs.length]!;

          const e1 = data.kamElementalCones[d1]!;
          const e2 = data.kamElementalCones[d2]!;

          if (
            !data.kamElements.includes(e1) && e1 !== null && !data.kamElements.includes(e2) &&
            e2 !== null
          ) {
            return output.betweenSlice!({ ele1: output[e1]!(), ele2: output[e2]!() });
          }
        }
      },
      outputStrings: {
        betweenSlice: {
          en: 'Between ${ele1} and ${ele2}',
        },
        nextToBlade: {
          en: 'Next to ${ele}',
        },
        nextToCross: {
          en: 'go to ${ele1} and ${ele2} intersection', // FEEDBACK: wording?
        },
        ...kamlanautElementalOutputStrings,
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Sublime Elements Cleanup',
      type: 'Ability',
      netRegex: { id: 'B00A', source: 'Kam\'lanaut', capture: false },
      run: (data) => {
        data.kamElements = [];
        data.kamElementalCones = emptySixDirections();
        data.kamElementalBlades = {};
      },
    },
    {
      id: 'San dOria Second Walk Kam\'lanaut Crystal Spawn Collect',
      type: 'CombatantMemory',
      netRegex: {
        change: 'Add',
        pair: [{ key: 'BNpcID', value: Object.keys(kamlanautCrystalNpcIds) }],
      },
      run: (data, matches, _output) => {
        const element = kamlanautCrystalNpcIds[matches.pairBNpcID ?? ''];
        const x = Number.parseFloat(matches.pairPosX ?? '0');
        const y = Number.parseFloat(matches.pairPosY ?? '0');
        if (!element)
          throw new UnreachableCode();
        const dir = Directions.output8Dir[Directions.xyTo8DirNum(x, y, -200.00, 150.0)];
        if (isValidSiXDir(dir))
          data.kamCrystalLocations[dir] = element;
      },
    },
    {
      // ACB7 - initial, shorter cast
      id: 'San dOria Second Walk Kam\'lanaut Elemental Resonance (crystals)',
      type: 'StartsUsingExtra',
      netRegex: { id: ['ACB7', 'ACB8'] },
      preRun: (data, matches) => {
        const x = Number.parseFloat(matches.x);
        const y = Number.parseFloat(matches.y);
        const dir = Directions.output8Dir[Directions.xyTo8DirNum(x, y, -200.00, 150.0)];
        if (isValidSiXDir(dir)) {
          data.kamCrystalCasts.push(dir);
        }
      },
      alertText: (data, _matches, output) => {
        const crystalCount = Object.keys(data.kamCrystalLocations).length;
        if (crystalCount === 3 && data.kamCrystalCasts.length === 1) {
          // SIMPLE 3 CRYSTALS - only call which to avoid
          const explodingCrystal = data.kamCrystalCasts[0]!;
          const explodingEle = data.kamCrystalLocations[explodingCrystal];
          data.kamCrystalCasts = []; // reset for the next pattern
          if (explodingEle) {
            return output.avoid!({ ele: output[explodingEle]!() });
          }
        } else if (crystalCount === 6 && data.kamCrystalCasts.length === 2) {
          // SIX CRYSTAL PATTERN
          // get the index of two crystals exploding
          // const temp = Array(100).fill('O');
          const explodingIndex1 = kamSixDirections.indexOf(data.kamCrystalCasts[0]!);
          const explodingIndex2 = kamSixDirections.indexOf(data.kamCrystalCasts[1]!);
          if (explodingIndex1 === -1 || explodingIndex2 === -1) {
            console.error('Kam\'lanaut Elemental Resonance (crystals) - invalid crystals');
            return;
          }
          const directDist = Math.abs(explodingIndex1 - explodingIndex2);

          if (Math.min(directDist, 6 - directDist) === 3) {
            // TWO SAFE SPOTS - crystals far apart
            // crystals are farther apart, leaving 2 safe spots farthest from each crystal.
            // safe spot = area between the crystals 1 and 2 away
            const lastCrystal = Math.max(explodingIndex1, explodingIndex2);
            const safe1 = data.kamCrystalLocations[kamSixDirections[(lastCrystal + 1) % 6]!];
            const safe2 = data.kamCrystalLocations[kamSixDirections[(lastCrystal + 2) % 6]!];

            data.kamCrystalCasts = []; // reset
            if (safe1 && safe2)
              return output.betweenCrystals!({ ele1: output[safe1]!(), ele2: output[safe2]!() });
          }
          // ONE SAFE SPOT - crystal AoEs overlapping
          // crystals overlap, there is one large safe spot centered on a crystal
          // safe spot = crystal 2 away
          let safeIndex = (explodingIndex1 + 2) % 6;
          if (safeIndex === explodingIndex1 || safeIndex === explodingIndex2)
            safeIndex = (safeIndex + 2) % 6;

          const safe = data.kamCrystalLocations[kamSixDirections[safeIndex]!];
          data.kamCrystalCasts = []; // reset
          if (safe)
            return output.safeCrystal!({ ele: output[safe]!() });
        }
      },
      outputStrings: {
        betweenCrystals: {
          en: 'Between ${ele1} and ${ele2} crystals',
        },
        safeCrystal: {
          en: 'Go to ${ele} crystal',
        },
        avoid: {
          en: 'Away from ${ele} crystal',
        },
        ...kamlanautElementalOutputStrings,
      },
    },
    {
      // cleanup of crystals
      id: 'San dOria Second Walk Kam\'lanaut Illumed Facet',
      type: 'Ability',
      netRegex: { id: 'ACB9', source: 'Kam\'lanaut', capture: false },
      delaySeconds: 3,
      run: (data) => {
        data.kamCrystalLocations = {};
        data.kamCrystalCasts = [];
      },
    },
    // ----------------------
    // Eald'narche
    {
      id: 'San dOria Second Walk Eald\'narche Uranos Cascade',
      type: 'StartsUsing',
      netRegex: { id: 'AD52', source: 'Eald\'narche' },
      alertText: (data, matches, output) => {
        if (matches.target === data.me)
          return output.tankBusterOnYou!();
      },
      run: (data, matches) => data.tankbusterTargets.push(matches.target),
      outputStrings: {
        tankBusterOnYou: Outputs.tankBusterOnYou,
      },
    },
    {
      id: 'San dOria Second Walk Eald\'narche Uranos Cascade Not You',
      type: 'StartsUsing',
      netRegex: { id: 'AD52', source: 'Eald\'narche', capture: false },
      delaySeconds: 0.3,
      suppressSeconds: 5,
      infoText: (data, _matches, output) => {
        if (data.tankbusterTargets.includes(data.me))
          return;
        return output.tankBusters!();
      },
      run: (data) => data.tankbusterTargets = [],
      outputStrings: {
        tankBusters: Outputs.tankBusters,
      },
    },
    {
      id: 'San dOriea Second Walk Eald\'narche Cronos Sling Out + Right',
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
      id: 'San dOria Second Walk Eald\'narche Cronos Sling Out + Left',
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
      id: 'San dOria Second Walk Eald\'narche Cronos Sling In + Right',
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
      id: 'San dOria Second Walk Eald\'narche Cronos Sling In + Left',
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
      id: 'San dOria Second Walk Eald\'narche Warp',
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
      id: 'San dOria Second Walk Eald\'narche Empyreal Vortex',
      type: 'StartsUsing',
      netRegex: { id: 'AD6D', source: 'Eald\'narche', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'AoE x5',
        },
      },
    },

    // ----------------------
    // Adds
    {
      id: 'San dOria Second Walk Detector Electroswipe',
      type: 'StartsUsing',
      netRegex: { id: 'AA27', source: 'Detector' },
      suppressSeconds: 2,
      response: Responses.interruptIfPossible('info'),
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
