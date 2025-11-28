import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Pilgrim's Traverse Stones 51-60
// TODO: Ancestral Maliktender Branch Out safespots
// TODO: Ancestral Maliktender One/Two-stone March rotation direction + safespots

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  id: 'PilgrimsTraverseStones51_60',
  zoneId: ZoneId.PilgrimsTraverseStones51_60,

  triggers: [
    // ---------------- Stone 51-59 Mobs ----------------
    {
      id: 'PT 51-60 Traverse Phorusrhacos Painful Gust',
      type: 'StartsUsing',
      netRegex: { id: 'AEB7', source: 'Traverse Phorusrhacos', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 51-60 Traverse Phorusrhacos Pain Storm',
      type: 'StartsUsing',
      netRegex: { id: 'AEB8', source: 'Traverse Phorusrhacos', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 51-60 Traverse Phorusrhacos Whorl of Hurt',
      type: 'StartsUsing',
      netRegex: { id: 'AEB9', source: 'Traverse Phorusrhacos', capture: false },
      response: Responses.getIn(),
    },
    {
      id: 'PT 51-60 Traverse Monitor Smoldering Scales',
      // Gains 11E3 Blaze Spikes for 6s, high counterattack damage when hit
      type: 'StartsUsing',
      netRegex: { id: 'A4E4', source: 'Traverse Monitor', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 1,
      durationSeconds: 7,
      countdownSeconds: 7,
      alertText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Stop attacking ${target}',
          de: 'Stoppe Angriffe auf ${target}',
          fr: 'Arrêtez d\'attaquer ${target}',
          ja: '攻撃禁止: ${target}',
          cn: '停止攻击 ${target}',
          ko: '${target} 공격 중지',
        },
      },
    },
    {
      id: 'PT 51-60 Traverse Sand Serpent Earthen Auger',
      type: 'StartsUsing',
      netRegex: { id: 'A46B', source: 'Traverse Sand Serpent', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 51-60 Traverse Gigant Heavy Scrapline',
      type: 'StartsUsing',
      netRegex: { id: 'AEC1', source: 'Traverse Gigant', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 51-60 Traverse Saichania Bafflement Bulb',
      type: 'StartsUsing',
      netRegex: { id: 'A4A0', source: 'Traverse Saichania', capture: true },
      response: Responses.stunOrInterruptIfPossible(),
    },
    {
      id: 'PT 51-60 Traverse Saichania Trounce',
      type: 'StartsUsing',
      netRegex: { id: 'A4A3', source: 'Traverse Saichania', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'PT 51-60 Traverse Saichania Mighty Spin',
      type: 'StartsUsing',
      netRegex: { id: 'A4A4', source: 'Traverse Saichania', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 51-60 Traverse Howler Scythe Tail',
      type: 'StartsUsing',
      netRegex: { id: 'AEBB', source: 'Traverse Howler', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'PT 51-60 Traverse Howler Master of Levin',
      type: 'StartsUsing',
      netRegex: { id: 'AEBC', source: 'Traverse Howler', capture: false },
      response: Responses.getIn(),
    },
    // ---------------- Stone 60 Boss: Ancestral Maliktender ----------------
    {
      id: 'PT 51-60 Ancestral Maliktender Spineshot',
      type: 'StartsUsing',
      netRegex: { id: 'AF42', source: 'Ancestral Maliktender', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'PT 51-60 Ancestral Maliktender Spinning Needles',
      type: 'StartsUsing',
      netRegex: { id: ['AF43', 'AF44'], source: 'Ancestral Maliktender', capture: true },
      durationSeconds: 16,
      alertText: (_data, matches, output) => {
        const rotation = matches.id === 'AF43' ? output.counterclockwise!() : output.clockwise!();
        return output.text!({ rotation: rotation });
      },
      outputStrings: {
        text: {
          en: 'Sides + Rotate ${rotation}',
          de: 'Seiten + Im ${rotation} rotieren',
          cn: '两侧 + ${rotation}旋转',
        },
        clockwise: Outputs.clockwise,
        counterclockwise: Outputs.counterclockwise,
      },
    },
    {
      id: 'PT 51-60 Ancestral Maliktender One/Two-stone March',
      type: 'StartsUsing',
      netRegex: { id: ['AF3E', 'AF3F'], source: 'Ancestral Maliktender', capture: true },
      infoText: (_data, matches, output) => {
        const id = matches.id;
        if (id === 'AF3E')
          return output.text!({ count: output.once!() });
        return output.text!({ count: output.twice!() });
      },
      outputStrings: {
        text: {
          en: 'Cactuar move ${count}',
          de: 'Kaktor Bewegung - ${count}',
          cn: '仙人掌移动 ${count}',
        },
        once: {
          en: 'Once',
          de: 'Einmal',
          cn: '一次',
        },
        twice: {
          en: 'Twice',
          de: 'Zweimal',
          cn: '两次',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Ancestral Maliktender': 'Malikkaktor-Ahn',
        'Traverse Gigant': 'Wallfahrt-Gigant',
        'Traverse Howler': 'Wallfahrt-Heuler',
        'Traverse Monitor': 'Wallfahrt-Waran',
        'Traverse Phorusrhacos': 'Wallfahrt-Phorusrhacos',
        'Traverse Saichania': 'Wallfahrt-Saichania',
        'Traverse Sand Serpent': 'Wallfahrt-Sandschlange',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Ancestral Maliktender': 'Malikpampa l\'ancien',
        'Traverse Gigant': 'géant du pèlerinage',
        'Traverse Howler': 'hurleur du pèlerinage',
        'Traverse Monitor': 'varan du pèlerinage',
        'Traverse Phorusrhacos': 'phorusrhacos du pèlerinage',
        'Traverse Saichania': 'saichania du pèlerinage',
        'Traverse Sand Serpent': 'serpent des sables du pèlerinage',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Ancestral Maliktender': '元祖マリクテンダー',
        'Traverse Gigant': 'トラバース・ギガント',
        'Traverse Howler': 'トラバース・ハウラー',
        'Traverse Monitor': 'トラバース・モニター',
        'Traverse Phorusrhacos': 'トラバース・フォルスラコス',
        'Traverse Saichania': 'トラバース・サイカニア',
        'Traverse Sand Serpent': 'トラバース・サンドサーペント',
      },
    },
  ],
};

export default triggerSet;
