import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  domDirectionCount: {
    vertCount: number;
    horizCount: number;
  };
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

const tetherData = {
  'assaultTether': '00F9',
  'foregoneTether': '0164',
} as const;

const triggerSet: TriggerSet<Data> = {
  id: 'AacHeavyweightM3',
  zoneId: ZoneId.AacHeavyweightM3,
  timelineFile: 'r11n.txt',
  initData: () => ({
    domDirectionCount: { vertCount: 0, horizCount: 0 },
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
          cn: '分散 => 诱导3次圈圈',
          ko: '산개 => 장판 유도 3x',
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
      // Category 0197 = PlayActionTimeline
      id: 'R11N Assault Evolved Weapon Model Collect',
      type: 'ActorControlExtra',
      netRegex: { category: '0197', param1: Object.keys(weaponModelIDMap), capture: true },
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
        id: tetherData['assaultTether'],
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
      // The Sword Quiver follow-up to Dance of Domination
      // is made up of six wide line AoEs arranged in a pattern like this:
      //
      //  _______
      //  |\ | /|
      //  | \|/ |
      //  | /|\ |
      //  |/ | \|
      //
      // This pattern can be rotated 90/180/270 degrees.

      // There are two safespots in the east/west sections in this depiction,
      // as well as two ranged safespots in the south section,
      // either side of the central vertical line.

      // Find the single orthogonal line, then call the melee safespots
      // 90 degrees each side of it.

      id: 'R11N Dance Of Domination Explosion Collect',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B7B9', capture: true },
      run: (data, matches) => {
        // Determine whether the AoE is orthogonal or diagonal
        // Discard diagonal headings, then count orthogonals.
        const headingDirNum = Directions.hdgTo8DirNum(parseFloat(matches.heading));
        if (headingDirNum % 2 === 0) {
          const isVert = headingDirNum % 4 === 0;
          const isHoriz = headingDirNum % 4 === 2;
          if (isVert)
            data.domDirectionCount.vertCount += 1;
          else if (isHoriz)
            data.domDirectionCount.horizCount += 1;
          else {
            console.error(`Bad Domination heading data: ${matches.heading}`);
          }
        }
      },
    },
    {
      id: 'R11N Dance Of Domination Explosion Call',
      type: 'StartsUsing',
      netRegex: { id: 'B7B9', source: 'The Tyrant', capture: false },
      delaySeconds: 0.5,
      suppressSeconds: 1,
      infoText: (data, _matches, output) => {
        if (data.domDirectionCount.vertCount === 1)
          return output.northSouth!();
        else if (data.domDirectionCount.horizCount === 1)
          return output.eastWest!();
        return output.unknownAvoid!();
      },
      outputStrings: {
        northSouth: {
          en: 'Go N/S Mid',
          cn: '去上/下中间',
          ko: '남/북 중간으로',
        },
        eastWest: {
          en: 'Go E/W Mid',
          cn: '去左/右中间',
          ko: '동/서 중간으로',
        },
        unknownAvoid: {
          en: 'Avoid Exploding Lines',
          cn: '躲避爆炸直线',
          ko: '폭발하는 선 피하기',
        },
      },
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
      netRegex: { category: '0197', param1: Object.keys(weaponModelIDMap), capture: true },
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
          cn: '下一波钢铁',
          ko: '다음 밖으로',
        },
        scythe: {
          en: 'In next',
          cn: '下一波月环',
          ko: '다음 안으로',
        },
        sword: {
          en: 'Intercards next',
          cn: '下一波X型',
          ko: '다음 대각선으로',
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
      id: 'R11N Foregone Fatality',
      type: 'Tether',
      netRegex: { id: tetherData['foregoneTether'], capture: false },
      suppressSeconds: 9, // Avoid repeated calls if tether passes multiple times
      // Avoid severity collisions with the Massive Meteor call.
      alertText: (data, _matches, output) => {
        if (data.role !== 'tank')
          return;
        return output.tetherBusters!();
      },
      infoText: (data, _matches, output) => {
        if (data.role === 'tank')
          return;
        return output.tetherBusters!();
      },
      outputStrings: {
        tetherBusters: Outputs.tetherBusters,
      },
    },
    {
      id: 'R11N Massive Meteor',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['massiveMeteor'], capture: true },
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.stackOnYou!();
        if (data.role !== 'tank')
          return output.stackMarkerOn!({ player: matches.target });
      },
      infoText: (data, matches, output) => {
        if (data.me === matches.target || data.role !== 'tank')
          return;
        return output.stackMarkerOn!({ player: matches.target });
      },
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
        stackMarkerOn: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'R11N Double Tyrannhilation',
      type: 'StartsUsing',
      netRegex: { id: 'B3E5', source: 'The Tyrant', capture: false },
      alertText: (_data, _matches, output) => output.losMeteor!(),
      outputStrings: {
        losMeteor: {
          en: 'LoS behind 2x meteor',
          cn: '2颗陨石后方躲避',
          ko: '뒤에 숨기 2x',
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
          cn: '向两侧短距离击退',
          ko: '양 옆으로 짧은 넉백',
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
          cn: '诱导3次圈圈',
          ko: '장판 유도 3x',
        },
      },
    },
    {
      id: 'R11N Mammoth Meteor',
      type: 'StartsUsingExtra',
      netRegex: { id: 'B3EC', capture: true },
      suppressSeconds: 1,
      infoText: (_data, matches, output) => {
        // Mammoth Meteor is always at two opposite intercardinals.
        // Once we see one, we know where the safespots are
        // without waiting on the second.
        const meteorX = parseFloat(matches.x);
        const meteorY = parseFloat(matches.y);
        const meteorQuad = Directions.xyToIntercardDirOutput(meteorX, meteorY, 100, 100);
        if (meteorQuad === 'dirNE' || meteorQuad === 'dirSW')
          return output.comboDir!({ dir1: output.nw!(), dir2: output.se!() });
        return output.comboDir!({ dir1: output.ne!(), dir2: output.sw!() });
      },
      outputStrings: {
        nw: Outputs.northwest,
        ne: Outputs.northeast,
        sw: Outputs.southwest,
        se: Outputs.southeast,
        comboDir: {
          en: 'Proximity AoE; Go ${dir1}/${dir2}',
          cn: '距离衰减 AOE; 去${dir1}/${dir2}',
          ko: '거리감쇠 장판; ${dir1}/${dir2}으로',
        },
      },
    },
    {
      id: 'R11N Explosion Towers', // Knockback towers
      type: 'StartsUsing',
      netRegex: { id: 'B3ED', source: 'The Tyrant', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.knockbackTowers!(),
      outputStrings: {
        knockbackTowers: {
          en: 'Get Knockback Towers',
          cn: '踩击退塔',
          ko: '넉백탑 들어가기',
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
          cn: '被塔击飞到左侧平台',
          ko: '탑 넉백 서쪽으로',
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
          cn: '被塔击飞到右侧平台',
          ko: '탑 넉백 동쪽으로',
        },
      },
    },
    {
      id: 'R11N Arcadion Avalanche Follow Up North Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B3F0', 'B3F6'], source: 'The Tyrant', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      infoText: (_data, _matches, output) => output.goNorth!(),
      outputStrings: {
        goNorth: Outputs.north,
      },
    },
    {
      id: 'R11N Arcadion Avalanche Follow Up South Safe',
      type: 'StartsUsing',
      netRegex: { id: ['B3F2', 'B3F4'], source: 'The Tyrant', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      infoText: (_data, _matches, output) => output.goSouth!(),
      outputStrings: {
        goSouth: Outputs.south,
      },
    },
    {
      id: 'R11N Heartbreak Kick',
      type: 'StartsUsing',
      netRegex: { id: 'B3FF', source: 'The Tyrant', capture: false },
      durationSeconds: 9,
      response: Responses.stackInTower(),
    },
    {
      id: 'R11N Great Wall Of Fire',
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['greatWallOfFire'], capture: true },
      response: Responses.sharedTankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'cn',
      'replaceSync': {
        'Comet': '彗星',
        'The Tyrant': '霸王',
      },
      'replaceText': {
        '\\(axe/scythe\\)': '(斧头/镰刀)',
        '\\(castbar\\)': '(咏唱栏)',
        '\\(damage\\)': '(伤害)',
        '\\(in/out\\)': '(内/外)',
        '\\(intercards\\)': '(X型)',
        '\\(out/in\\)': '(外/内)',
        '\\(platform fall\\)': '(平台坠落)',
        '\\(platform toss\\)': '(平台投掷)',
        '\\(scythe/axe\\)': '(镰刀/斧头)',
        '\\(split\\)': '(分裂)',
        '\\(sword\\)': '(大剑)',
        'Arcadion Avalanche': '登天碎地',
        'Assault Apex': '铸兵崩落',
        'Assault Evolved': '铸兵突袭',
        'Charybdistopia': '霸王大漩涡',
        'Comet(?!ite)': '彗星',
        'Cometite': '彗星风暴',
        'Cosmic Kiss': '轰击',
        'Crown of Arcadia': '天顶的主宰',
        'Dance of Domination(?! Trophy)': '统治的战舞',
        'Dance of Domination Trophy': '铸兵之令：统治',
        'Double Tyrannhilation': '双重霸王坠击',
        'Draw Steel': '铸兵之令',
        'Explosion': '爆炸',
        'Fire and Fury': '兽焰连尾击',
        'Flatliner': '绝命分断击',
        'Foregone Fatality': '夺命链',
        'Great Wall of Fire': '火焰流',
        'Heartbreak Kick': '碎心踢',
        'Immortal Reign': '万劫不朽的统治',
        'Impact': '冲击',
        'Majestic Meteor(?!ain)': '王者陨石',
        'Majestic Meteorain': '王者陨石雨',
        'Mammoth Meteor': '遮天陨石',
        'Massive Meteor': '重陨石',
        '(?<! )Meteorain': '流星雨',
        'One and Only': '举世无双的霸王',
        'Powerful Gust': '强风',
        'Raw Steel(?! )': '拔刀突击',
        'Raw Steel Trophy': '铸兵之令：轰击',
        'Shockwave': '冲击波',
        'Smashdown': '铸兵猛攻',
        '(?<! )Trophy Weapons': '历战之兵武',
        'Ultimate Trophy Weapons': '历战之极武',
        'Void Stardust': '彗星雨',
      },
    },
  ],
};

export default triggerSet;
