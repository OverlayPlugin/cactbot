import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'YuweyawataFieldStation',
  zoneId: ZoneId.YuweyawataFieldStation,
  timelineFile: 'yuweyawata.txt',
  triggers: [
    // ---------------- Lindblum Zaghnal ---------------- //
    {
      id: 'Yuweyawata Lindblum Zaghnal Electrical Overload',
      type: 'StartsUsing',
      netRegex: { id: '9EBB', source: 'Lindblum Zaghnal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Caber Toss',
      type: 'StartsUsing',
      netRegex: { id: '9EB0', source: 'Lindblum Zaghnal', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      durationSeconds: 5,
      infoText: (_data, _matches, output) => {
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Away from falling pillar',
          cn: '远离柱子落点',
          ko: '기둥 추락지점에서 멀리 떨어지기',
        },
      },
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Lightning Storm',
      type: 'StartsUsing',
      netRegex: { id: '9EBD', source: 'Lindblum Zaghnal', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Sparking Fissure (small)',
      type: 'StartsUsing',
      netRegex: { id: ['9EB7', 'A133'], source: 'Lindblum Zaghnal', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Raw Electrope Spawn',
      type: 'AddedCombatant',
      // 13622 = Raw Electrope
      netRegex: { npcNameId: '13622', capture: false },
      suppressSeconds: 1,
      response: Responses.killAdds(),
    },
    {
      id: 'Yuweyawata Lindblum Zaghnal Sparking Fissure (big)',
      type: 'StartsUsing',
      netRegex: { id: 'A12A', source: 'Lindblum Zaghnal', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      durationSeconds: 5,
      response: Responses.bigAoe('alert'),
    },

    // ---------------- Overseer Kanilokka ---------------- //
    {
      id: 'Yuweyawata Overseer Kanilokka Dark Souls',
      type: 'StartsUsing',
      netRegex: { id: '9ED2', source: 'Overseer Kanilokka', capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Free Spirits',
      type: 'StartsUsing',
      netRegex: { id: '9EC0', source: 'Overseer Kanilokka', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Phantom Flood',
      type: 'StartsUsing',
      netRegex: { id: '9EC4', source: 'Overseer Kanilokka', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Telltale Tears',
      type: 'StartsUsing',
      netRegex: { id: '9EC9', source: 'Overseer Kanilokka', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Lost Hope',
      type: 'Ability',
      netRegex: { id: '9EC5', source: 'Overseer Kanilokka', capture: false },
      durationSeconds: 17,
      suppressSeconds: 1,
      response: Responses.getOut(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Necrohazard',
      type: 'StartsUsing',
      netRegex: { id: '9EC6', source: 'Overseer Kanilokka', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      response: Responses.bigAoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Bloodburst',
      type: 'StartsUsing',
      netRegex: { id: '9EC7', source: 'Overseer Kanilokka', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Overseer Kanilokka Soul Douse',
      type: 'StartsUsing',
      netRegex: { id: '9ECB', source: 'Overseer Kanilokka', capture: true },
      response: Responses.stackMarkerOn(),
    },

    // ---------------- Lunipyati ---------------- //
    {
      id: 'Yuweyawata Lunipyati Raging Claw',
      type: 'StartsUsing',
      netRegex: { id: '9EA4', source: 'Lunipyati', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Yuweyawata Lunipyati Leporine Loaf',
      type: 'StartsUsing',
      netRegex: { id: '9E9B', source: 'Lunipyati', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lunipyati Jagged Edge',
      type: 'StartsUsing',
      netRegex: { id: '9EA7', source: 'Lunipyati', capture: true },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Yuweyawata Lunipyati Crater Carve',
      type: 'StartsUsing',
      netRegex: { id: '9E9D', source: 'Lunipyati', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 4,
      response: Responses.getOut(),
    },
    {
      id: 'Yuweyawata Lunipyati Beastly Roar',
      type: 'StartsUsing',
      netRegex: { id: '9EA2', source: 'Lunipyati', capture: false },
      alertText: (_data, _matches, output) => {
        return output.text!();
      },
      outputStrings: {
        text: {
          en: 'Away from boss',
          cn: '远离 BOSS',
          ko: '보스에게서 멀어지기',
        },
      },
    },
    {
      id: 'Yuweyawata Lunipyati Turali Stone IV',
      type: 'StartsUsing',
      netRegex: { id: '9EA8', source: 'Lunipyati', capture: true },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Yuweyawata Lunipyati Sonic Howl',
      type: 'StartsUsing',
      netRegex: { id: '9EAA', source: 'Lunipyati', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Yuweyawata Lunipyati Slabber',
      type: 'StartsUsing',
      netRegex: { id: '9EAB', source: 'Lunipyati', capture: true },
      response: Responses.tankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'cn',
      'replaceSync': {
        'Lindblum Zaghnal': '林德布鲁姆扎戈斧龙',
        'Overseer Kanilokka': '卡尼洛喀站长',
        'Lunipyati': '鲁尼皮亚提',
      },
      'replaceText': {
        '\\(arcs\\)': '(弧线)',
        '\\(big\\)': '(大)',
        '\\(multiple\\)': '(多重)',
        '\\(spiral\\)': '(螺旋)',
        '--adds': '--小怪',
        '(?<!un)targetable--': '可选中--',
        'Beastly Roar': '残虐咆哮',
        'Bloodburst': '血爆',
        'Boulder Dance': '舞动的岩石',
        'Caber Toss': '投掷',
        'Cell Shock': '放电',
        'Crater Carve': '刨坑',
        'Dark II': '昏暗',
        'Dark Souls': '黑暗之魂',
        'Electrical Overload': '广域奔雷',
        'Free Spirits': '灵魂释放',
        'Gore': '刺牙',
        'Jagged Edge': '岩石突击',
        'Leaping Earth': '跃动的大地',
        'Leporine Loaf': '稳如兔山',
        'Lost Hope': '恍惚的叫声',
        'Lightning Bolt': '落雷',
        'Lightning Storm': '百雷',
        'Line Voltage': '线状放电',
        'Necrohazard': '死灵危机',
        'Phantom Flood': '幽魂泛滥',
        'Raging Claw': '暴怒连爪',
        'Rock Blast': '岩石冲击',
        'Slabber': '唾液飞溅',
        'Sparking Fissure': '对地放电',
        'Sonic Howl': '音嚎',
        'Soul Douse': '失魂',
        'Soulweave': '灵魂飞掠',
        'Telltale Tears': '幽魂之泪',
        'Turali Stone IV': '图拉尔崩石',
      },
    },
  ],
};

export default triggerSet;
