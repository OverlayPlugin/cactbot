import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  weaponModels: { [string: string]: 'axe' | 'scythe' | 'sword' | 'unknown' };
  weaponTethers: { [string: string]: string };
  trophyActive: boolean;
}

const weaponModelIDMap: { [string: string]: 'axe' | 'scythe' | 'sword' | 'unknown' } = {
  '11D1': 'sword',
  '11D2': 'axe',
  '11D3': 'scythe',
} as const;

const headMarkerData = {
  'rawSteelSpread': '0137',
  'massiveMeteor': '013E',
  'greatWallOfFire': '0256',
  'rawSteelBuster': '0258',
  'voidStardust': '0276',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM3',
  zoneId: ZoneId.AacHeavyweightM3,
  timelineFile: 'r11n.txt',
  initData: () => ({
    weaponModels: {},
    weaponTethers: {},
    trophyActive: false,
  }),
  triggers: [
    {
      id: 'R11N Ultimate Trophy Weapons Phase',
      type: 'StartsUsing',
      netRegex: { id: 'B7EB', source: 'The Tyrant', capture: false },
      run: (data) => data.trophyActive = true,
    },
    {
      id: 'R11N Crown Of Arcadia',
      type: 'StartsUsing',
      netRegex: { id: 'B3B6', source: 'The Tyrant', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R11N Smashdown Axe',
      type: 'StartsUsing',
      netRegex: { id: 'B3BA', source: 'The Tyrant', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'R11N Smashdown Scythe',
      type: 'StartsUsing',
      netRegex: { id: 'B3BC', source: 'The Tyrant', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'R11N Smashdown Sword',
      type: 'StartsUsing',
      netRegex: { id: 'B3BE', source: 'The Tyrant', capture: false },
      response: Responses.getIntercards(),
    },
    {
      id: 'R11N Void Stardust',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['voidStardust'], capture: true },
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.spreadPuddles!(),
      outputStrings: {
        spreadPuddles: {
          en: 'Spread => Bait 3x Puddles',
        },
      },
    },
    {
      // Ensure we have clean data before each round of multi-weapon mechanics.
      // B3CC: Trophy Weapons
      // B7EB: Ultimate Trophy Weapons
      id: 'R11N Trophy Weapons Initialize',
      type: 'StartsUsing',
      netRegex: { id: ['B3CC', 'B7EB'], source: 'The Tyrant', capture: false },
      run: (data) => {
        data.weaponModels = {};
        data.weaponTethers = {};
      },
    },
    {
      id: 'R11N Assault Evolved Weapon Model Collect',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: ['11D1', '11D2', '11D3'], capture: true },
      condition: (data) => !data.trophyActive,
      run: (data, matches) => {
        data.weaponModels[matches.id] = weaponModelIDMap[matches.param1] ?? 'unknown';
      },
    },
    {
      // Across multiple logs, tethers appear exactly in execution order.
      // It's likely that this is safe,
      // but just to be careful we instead use tether links
      // to generate the call order.
      id: 'R11N Assault Evolved Weapon Tether Collect',
      type: 'Tether',
      netRegex: {
        id: '00F9',
        sourceId: '4[0-9A-Fa-f]{7}',
        targetId: '4[0-9A-Fa-f]{7}',
        capture: true,
      },
      condition: (data) => !data.trophyActive,
      run: (data, matches) => data.weaponTethers[matches.sourceId] = matches.targetId,
    },
    {
      id: 'R11N Assault Evolved Call',
      type: 'StartsUsing',
      netRegex: { id: 'B3CD', source: 'The Tyrant', capture: true },
      condition: (data) => !data.trophyActive,
      durationSeconds: 15,
      alertText: (data, matches, output) => {
        if (Object.keys(data.weaponTethers).length < 3)
          return output.unknown!();
        const firstTargetID = data.weaponTethers[matches.sourceId] ?? 'unknown';
        const secondTargetID = data.weaponTethers[firstTargetID] ?? 'unknown';
        const thirdTargetID = data.weaponTethers[secondTargetID] ?? 'unknown';

        const first = data.weaponModels[firstTargetID] ?? 'unknown';
        const second = data.weaponModels[secondTargetID] ?? 'unknown';
        const third = data.weaponModels[thirdTargetID] ?? 'unknown';

        return output.comboWeapons!({
          first: output[first]!(),
          second: output[second]!(),
          third: output[third]!(),
        });
      },
      outputStrings: {
        axe: Outputs.out,
        scythe: Outputs.in,
        sword: Outputs.intercards,
        comboWeapons: '${first} => ${second} => ${third}',
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R11N Dance Of Domination',
      type: 'StartsUsing',
      netRegex: { id: 'B3D1', source: 'The Tyrant', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R11N Raw Steel Buster',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['rawSteelBuster'], capture: true },
      condition: (data, matches) => data.role === 'tank' || data.me === matches.target,
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'R11N Raw Steel Spread',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['rawSteelSpread'], capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'R11N Charybdistopia',
      type: 'StartsUsing',
      netRegex: { id: 'B3D7', source: 'The Tyrant', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'R11N Ultimate Trophy Weapons Call',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: ['11D1', '11D2', '11D3'], capture: true },
      condition: (data) => data.trophyActive,
      delaySeconds: 2.4, // Allow for executing previous call.
      alertText: (_data, matches, output) => {
        const nextWeapon = weaponModelIDMap[matches.param1];
        if (nextWeapon === 'axe')
          return output.axe!();
        if (nextWeapon === 'scythe')
          return output.scythe!();
        if (nextWeapon === 'sword')
          return output.sword!();
        return output.unknown!();
      },
      outputStrings: {
        axe: {
          en: 'Out next',
        },
        scythe: {
          en: 'In next',
        },
        sword: {
          en: 'Intercards next',
        },
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'R11N One And Only',
      type: 'StartsUsing',
      netRegex: { id: 'B3DC', source: 'The Tyrant', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.aoe(),
    },
    {
      id: 'R11N Cosmic Kiss', // Meteor towers
      type: 'StartsUsing',
      netRegex: { id: 'B3DE', source: 'Comet', capture: false },
      suppressSeconds: 1,
      response: Responses.getTowers(),
    },
    {
      id: 'R11N Massive Meteor',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['massiveMeteor'], capture: true },
      condition: (data) => data.role !== 'tank',
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'R11N Double Tyrannhilation',
      type: 'StartsUsing',
      netRegex: { id: 'B3E5', source: 'The Tyrant', capture: false },
      alertText: (_data, _matches, output) => output.losMeteor!(),
      outputStrings: {
        losMeteor: {
          en: 'LoS behind 2x meteor',
        },
      },
    },
    {
      id: 'R11N Flatliner',
      type: 'StartsUsing',
      netRegex: { id: 'B3E8', source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.flatliner!(),
      outputStrings: {
        flatliner: {
          en: 'Short knockback to sides',
        },
      },
    },
    {
      id: 'R11N Majestic Meteor',
      type: 'StartsUsing',
      netRegex: { id: 'B3E9', source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.baitPuddles!(),
      outputStrings: {
        baitPuddles: {
          en: 'Bait 3x puddles',
        },
      },
    },
    {
      id: 'R11N Mammoth Meteor',
      type: 'StartsUsing',
      netRegex: { id: 'B3EC', source: 'The Tyrant', capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.proxAOE!(),
      outputStrings: {
        proxAOE: {
          en: 'Proximity AoE',
        },
      },
    },
    {
      id: 'R11N Arcadion Avalanche West Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B3EF', 'B3F3'], source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.westSafe!(),
      outputStrings: {
        westSafe: {
          en: 'Tower Knockback to West',
        },
      },
    },
    {
      id: 'R11N Arcadion Avalanche East Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B3F1', 'B3F5'], source: 'The Tyrant', capture: false },
      infoText: (_data, _matches, output) => output.eastSafe!(),
      outputStrings: {
        eastSafe: {
          en: 'Tower Knockback to East',
        },
      },
    },
    {
      id: 'R11N Heartbreak Kick',
      type: 'StartsUsing',
      netRegex: { id: 'B3FF', source: 'The Tyrant', capture: false },
      response: Responses.stackMarker(),
    },
    {
      id: 'R11N Great Wall Of Fire',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['greatWallOfFire'], capture: true },
      response: Responses.sharedTankBuster(),
    },
  ],
  timelineReplace: [],
};

export default triggerSet;
