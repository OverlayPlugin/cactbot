import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 91-100

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones91_100',
  zoneId: ZoneId.PilgrimsTraverseStones91_100,

  triggers: [
    // ---------------- Stone 91-98 Mobs ----------------
    {
      id: 'PT 91-100 Invoked Dreamer Dark Vision',
      // goes through walls
      type: 'StartsUsing',
      netRegex: { id: 'AD3D', source: 'Invoked Dreamer', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Invoked Dreamer Endless Nightmare',
      type: 'StartsUsing',
      netRegex: { id: 'AD3E', source: 'Invoked Dreamer', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 91-100 Traverse Ya-te-veo Rotten Stench',
      // goes through walls
      type: 'StartsUsing',
      netRegex: { id: 'ADD4', source: 'Traverse Ya-te-veo', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Traverse Triffid Creeping Ivy',
      type: 'StartsUsing',
      netRegex: { id: 'ADD3', source: 'Traverse Triffid', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'PT 91-100 Invoked Poppet Whinge',
      type: 'StartsUsing',
      netRegex: { id: 'ADE0', source: 'Invoked Poppet', capture: false },
      response: Responses.outOfMelee(),
    },
    {
      id: 'PT 91-100 Invoked Sawtooth Honeyed Front',
      type: 'StartsUsing',
      netRegex: { id: 'AD44', source: 'Invoked Sawtooth', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Invoked Sawtooth Honeyed Left',
      type: 'StartsUsing',
      netRegex: { id: 'AD45', source: 'Invoked Sawtooth', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go Front + Right',
          de: 'Geh nach Vorne + Rechts',
          cn: '去前面 + 右侧',
          ko: '앞으로 + 오른쪽',
        },
      },
    },
    {
      id: 'PT 91-100 Invoked Sawtooth Honeyed Right',
      type: 'StartsUsing',
      netRegex: { id: 'AD46', source: 'Invoked Sawtooth', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Go Front + Left',
          de: 'Geh nach Vorne + Links',
          cn: '去前面 + 左侧',
          ko: '앞으로 + 왼쪽',
        },
      },
    },
    {
      id: 'PT 91-100 Invoked Bachelor Arachne Web',
      type: 'StartsUsing',
      netRegex: { id: 'AD41', source: 'Invoked Bachelor', capture: true },
      condition: Conditions.targetIsYou(),
      alertText: (_data, matches, output) => output.breakLOS!({ name: matches.source }),
      outputStrings: {
        breakLOS: {
          en: 'Break line-of-sight to ${name}',
          de: 'Unterbreche Sichtlinie zu ${name}',
          fr: 'Masquez le champ de vision vers ${name}',
          ja: '${name}の視線から隠れる',
          cn: '利用掩体卡 ${name} 的视线',
          ko: '${name}의 시야 밖으로 숨기',
        },
      },
    },
    {
      id: 'PT 91-100 Traverse Warg Triple/Quadruple Skull Dasher',
      type: 'StartsUsing',
      netRegex: { id: ['AD33', 'AD34'], source: 'Traverse Warg', capture: true },
      infoText: (_data, matches, output) => {
        const blows = matches.id === 'AD33' ? 3 : 4;
        return output.text!({ count: blows });
      },
      outputStrings: {
        text: {
          en: '${count}x attacks => Out of Melee',
          de: '${count}x Attacken => Raus aus Nahkampf',
          cn: '${count}次攻击 => 离开近战范围',
          ko: '${count}번 공격 => 근접 범위 밖으로',
        },
      },
    },
    {
      id: 'PT 91-100 Traverse Warg Heavy Smash',
      type: 'StartsUsing',
      netRegex: { id: 'AD36', source: 'Traverse Warg', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Invoked Dahak Tail Drive',
      type: 'StartsUsing',
      netRegex: { id: 'ADDB', source: 'Invoked Dahak', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'PT 91-100 Invoked Dahak Lithic Breath',
      // might bait Tail Drive if you dodge behind
      type: 'StartsUsing',
      netRegex: { id: 'ADDC', source: 'Invoked Dahak', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'PT 91-100 Invoked Archaeodemon Unholy Darkness',
      // ground-targeted medium AoE with late telegraph
      type: 'StartsUsing',
      netRegex: { id: 'ADE2', source: 'Invoked Archaeodemon', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid AoE',
          de: 'Vermeide AoE',
          cn: '避开AoE',
          ko: '장판 피하기',
        },
      },
    },
    {
      id: 'PT 91-100 Invoked Archaeodemon Karma',
      type: 'StartsUsing',
      netRegex: { id: 'ADE3', source: 'Invoked Archaeodemon', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Traverse Malevolence Smashing Blow',
      type: 'StartsUsing',
      netRegex: { id: 'ADE1', source: 'Traverse Malevolence', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Invoked Gusion Right Smite',
      type: 'StartsUsing',
      netRegex: { id: 'AD39', source: 'Invoked Gusion', capture: false },
      response: Responses.goLeftThenRight(),
    },
    {
      id: 'PT 91-100 Invoked Gusion Left Smite',
      type: 'StartsUsing',
      netRegex: { id: 'AD3B', source: 'Invoked Gusion', capture: false },
      response: Responses.goRightThenLeft(),
    },
    {
      id: 'PT 91-100 Invoked Acheron Authority\'s Edge Right',
      type: 'StartsUsing',
      netRegex: { id: 'ADDD', source: 'Invoked Acheron', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'PT 91-100 Invoked Acheron Authority\'s Edge Left',
      type: 'StartsUsing',
      netRegex: { id: 'ADDE', source: 'Invoked Acheron', capture: false },
      response: Responses.goRight(),
    },
    {
      id: 'PT 91-100 Invoked Destrudo Stare',
      // goes through walls
      type: 'StartsUsing',
      netRegex: { id: 'AD42', source: 'Invoked Destrudo', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 91-100 Invoked Destrudo Mortal Gaze',
      type: 'StartsUsing',
      netRegex: { id: 'AD43', source: 'Invoked Destrudo', capture: true },
      response: Responses.lookAwayFromSource(),
    },
    // ---------------- Stone 99 Boss: Eminent Grief/Devoured Eater ----------------
    // triggers in The Final Verse: pilgrims_traverse_the_final_verse.ts
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Invoked Acheron': 'gerufen(?:e|er|es|en) Acheron',
        'Invoked Archaeodemon': 'gerufen(?:e|er|es|en) Archaeodämon',
        'Invoked Bachelor': 'gerufen(?:e|er|es|en) Spinnrich',
        'Invoked Dahak': 'gerufen(?:e|er|es|en) Dahak',
        'Invoked Destrudo': 'gerufen(?:e|er|es|en) Destrudo',
        'Invoked Dreamer': 'gerufen(?:e|er|es|en) bös(?:e|er|es|en) Träumer',
        'Invoked Gusion': 'gerufen(?:e|er|es|en) Gusion',
        'Invoked Poppet': 'gerufen(?:e|er|es|en) Puppe',
        'Invoked Sawtooth': 'gerufen(?:e|er|es|en) Sägezahn',
        'Traverse Malevolence': 'Wallfahrt-Böswilligkeit',
        'Traverse Triffid': 'Wallfahrt-Triffid',
        'Traverse Warg': 'Wallfahrt-Warg',
        'Traverse Ya-te-veo': 'Wallfahrt-Yateveo',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Invoked Acheron': 'achéron invoqué',
        'Invoked Archaeodemon': 'archéodémon invoqué',
        'Invoked Bachelor': 'aranéide invoqué',
        'Invoked Dahak': 'dahaka invoqué',
        'Invoked Destrudo': 'destrudo invoqué',
        'Invoked Dreamer': 'rêveur maudit invoqué',
        'Invoked Gusion': 'gusion invoqué',
        'Invoked Poppet': 'poupée invoquée',
        'Invoked Sawtooth': 'dentata invoqué',
        'Traverse Malevolence': 'malveillance du pèlerinage',
        'Traverse Triffid': 'triffide du pèlerinage',
        'Traverse Warg': 'warg du pèlerinage',
        'Traverse Ya-te-veo': 'yateveo du pèlerinage',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Invoked Acheron': 'インヴォークド・アケローン',
        'Invoked Archaeodemon': 'インヴォークド・アルケオデーモン',
        'Invoked Bachelor': 'インヴォークド・バチェラー',
        'Invoked Dahak': 'インヴォークド・ダハーカ',
        'Invoked Destrudo': 'インヴォークド・デストルドー',
        'Invoked Dreamer': 'インヴォークド・ドリームエビル',
        'Invoked Gusion': 'インヴォークド・グシオン',
        'Invoked Poppet': 'インヴォークド・パペット',
        'Invoked Sawtooth': 'インヴォークド・ソウトゥース',
        'Traverse Malevolence': 'トラバース・マレヴォレンス',
        'Traverse Triffid': 'トラバース・トリフィド',
        'Traverse Warg': 'トラバース・ワーグ',
        'Traverse Ya-te-veo': 'トラバース・ヤテベオ',
      },
    },
  ],
};

export default triggerSet;
