import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

const cenoteJaJaOutputStrings = {
  spawn: {
    en: '${name} spawned!',
    de: '${name} erscheint!',
    fr: '${name} apparait !',
    ja: '${name} 現れる！',
    cn: '已生成 ${name}!',
    ko: '${name} 등장!',
  },
} as const;

const tuligoraTroupesIds = [
  '13242', // Turali Onion
  '13243', // Turali Eggplant
  '13244', // Turali Garlic
  '13245', // Turali Tomato
  '13246', // Tuligora Queen
] as const;

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'CenoteJaJaGural',
  zoneId: ZoneId.CenoteJaJaGural,

  triggers: [
    // ---------------- random treasure mobs ----------------
    {
      id: 'Cenote Ja Ja Alpaca of Fortune Spawn',
      // 13240 = Alpaca of Fortune
      type: 'AddedCombatant',
      netRegex: { npcNameId: '13240' },
      suppressSeconds: 1,
      infoText: (_data, matches, output) => output.spawn!({ name: matches.name }),
      outputStrings: cenoteJaJaOutputStrings,
    },
    {
      id: 'Cenote Ja Ja Uolon of Fortune Spawn',
      // 13241 = Uolon of Fortune
      type: 'AddedCombatant',
      netRegex: { npcNameId: '13241' },
      suppressSeconds: 1,
      infoText: (_data, matches, output) => output.spawn!({ name: matches.name }),
      outputStrings: cenoteJaJaOutputStrings,
    },
    {
      id: 'Cenote Ja Ja Tuligora Troupes Spawn',
      type: 'AddedCombatant',
      netRegex: { npcNameId: tuligoraTroupesIds, capture: false },
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tuligora Troupes spawned, kill in order!',
          de: 'Turalische Truppen sind erschienen, besiege sie in der Reihenfolge!',
          fr: 'Les troupes de Tuligora sont apparues, tuez-les dans l\'ordre !',
          cn: '图拉尔蔓德拉战队 已生成，按顺序击杀！',
        },
      },
    },
    // ---------------- final chamber boss: Bull Apollyon ----------------
    {
      id: 'Cenote Ja Ja Pyreburst',
      type: 'StartsUsing',
      netRegex: { id: '9576', source: 'Bull Apollyon', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Cenote Ja Ja Blade',
      type: 'StartsUsing',
      netRegex: { id: '9575', source: 'Bull Apollyon' },
      response: Responses.tankBuster(),
    },
    // ---------------- alternate final chamber boss: Golden Molter ----------------
    {
      id: 'Cenote Ja Ja Golden Gall',
      type: 'StartsUsing',
      netRegex: { id: '957B', source: 'Golden Molter', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Cenote Ja Ja Blinding Light',
      type: 'StartsUsing',
      netRegex: { id: '96B4', source: 'Golden Molter' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Cenote Ja Ja Lightburst',
      // cast id = 9583, damage id = 9584
      type: 'StartsUsing',
      netRegex: { id: '9583', source: 'Golden Molter', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Cenote Ja Ja Lap',
      type: 'StartsUsing',
      netRegex: { id: '9582', source: 'Golden Molter' },
      response: Responses.tankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Bull Apollyon': 'Bullen-Apollyon',
        'Golden Molter': 'Golden(?:e|er|es|en) Wandler',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Bull Apollyon': 'apollyon buffle',
        'Golden Molter': 'transmueur doré',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Bull Apollyon': 'ブルアポリオン',
        'Golden Molter': 'ゴールデン・モルター',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Bull Apollyon': '莽撞亚波伦',
        'Golden Molter': '黄金蜕皮蜥',
      },
    },
  ],
};

export default triggerSet;
