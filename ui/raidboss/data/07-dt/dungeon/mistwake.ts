import Conditions from '../../../../../resources/conditions';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
}

const triggerSet: TriggerSet<Data> = {
  id: 'mistwake',
  zoneId: ZoneId.Mistwake,
  timelineFile: 'mistwake.txt',
  initData: () => {
    return {};
  },
  triggers: [
    // ----------------------- Treno Catoblepas -----------------------
    {
      id: 'Mistwake Treno Catoblepas Earthquake',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A93F', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Catoblepas Thunder II',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A943', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread (away from rocks)',
          de: 'Verteilen (weg von den Steinen)',
          fr: 'Dispersez-vous (loin des rochers)',
          cn: '分散 (避开石头)',
          ko: '산개 (바위 근처에서 떨어지기)',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Bedeviling Light',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A942', capture: false },
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Hide behind rock',
          de: 'Hinter einem Stein verstecken',
          fr: 'Derrière un rocher',
          cn: '躲在石头后',
          ko: '바위 뒤에 숨기',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Thunder III',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A941' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Mistwake Treno Catoblepas Ray of Lightning On You',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'AF19' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Point laser away from rocks',
          de: 'Zeige Laser weg von Steinen',
          fr: 'Pointez le laser loin des rochers',
          cn: '将激光指向避开石头',
          ko: '레이저가 바위를 향하지 않게 하기',
        },
      },
    },
    {
      id: 'Mistwake Treno Catoblepas Ray of Lightning',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'AF19' },
      condition: Conditions.targetIsNotYou(),
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Mistwake Treno Catoblepas Petribreath',
      type: 'StartsUsing',
      netRegex: { source: 'Treno Catoblepas', id: 'A947', capture: false },
      response: Responses.awayFromFront(),
    },
    // -------------------------- Amdusias --------------------------
    {
      id: 'Mistwake Treno Amdusias Thunderclap Concerto Behind',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B118', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunderclap Concerto Front',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B11D', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunder IV',
      type: 'StartsUsing',
      netRegex: { source: 'Amdusias', id: 'B126', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Amdusias Bio II',
      type: 'StartsUsing',
      // Paired with B121, which is the actual damage hit, but no cast bar
      netRegex: { source: 'Amdusias', id: 'B120', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Treno Amdusias Shockbolt',
      type: 'StartsUsing',
      // Paired with B12B, which happens first, but does not target
      netRegex: { source: 'Amdusias', id: 'B12C' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Mistwake Treno Amdusias Thunder III',
      type: 'StartsUsing',
      // Paired with B128, which happens first, but does not target
      netRegex: { source: 'Amdusias', id: 'B129' },
      response: Responses.stackMarkerOn(),
    },
    // ---------------------- Thundergust Griffin ----------------------
    {
      id: 'Mistwake Thundergust Griffin Thunderspark',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0EB', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Mistwake Thundergust Griffin High Volts',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0EC', capture: false },
      response: Responses.spread(),
    },
    {
      id: 'Mistwake Thundergust Griffin Golden Talons',
      type: 'StartsUsing',
      netRegex: { source: 'Thundergust Griffin', id: 'B0F9' },
      response: Responses.tankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Amdusias': 'Amdusias',
        'Shock Storm': 'Elektrobö',
        'Thundergust Griffin': 'Donnergreif',
        'Treno Catoblepas': 'Treno-Catblepus',
      },
      'replaceText': {
        'Bedeviling Light': 'Dämonenlicht',
        'Bio II': 'Biora',
        'Earthquake': 'Erdbeben',
        'Electrifying Flight': 'Elektrobö',
        'Electrogenetic Force': 'Blitzschlag',
        'Fulgurous Fall': 'Blitzsturz',
        'Galloping Thunder': 'Donnergalopp',
        'Golden Talons': 'Goldene Klauen',
        'High Volts': 'Hochvolt',
        'Lightning Bolt': 'Blitzschlag',
        'Petribreath': 'Petri-Atem',
        'Ray of Lightning': 'Blitzstrahl',
        'Rush': 'Stürmen',
        'Shockbolt': 'Blitzbogen',
        'Storm Surge': 'Voltsturm',
        '(?<! )Thunder(?! |clap|ing|spark)': 'Blitz',
        'Thunder II(?!I)': 'Blitzra',
        'Thunder III': 'Blitzga',
        'Thunder IV': 'Blitzka',
        'Thunderclap Concerto': 'Donnerschlag-Konzert',
        'Thundering Roar': 'Donnerndes Brüllen',
        'Thunderspark': 'Donnerfunke',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Amdusias': 'Amdusias',
        'Shock Storm': 'vent orageux',
        'Thundergust Griffin': 'griffon de foudre',
        'Treno Catoblepas': 'catoblépas de Tréno',
      },
      'replaceText': {
        'Bedeviling Light': 'Lumière du diable',
        'Bio II': 'Extra Bactérie',
        'Earthquake': 'Tremblement de terre',
        'Electrifying Flight': 'Vent électrifiant',
        'Electrogenetic Force': 'Frappe de foudre',
        'Fulgurous Fall': 'Chute fulgurante',
        'Galloping Thunder': 'Galop tonnant',
        'Golden Talons': 'Serres dorées',
        'High Volts': 'Haut voltage',
        'Lightning Bolt': 'Éclair de foudre',
        'Petribreath': 'Pétrihaleine',
        'Ray of Lightning': 'Rayon d\'éclair',
        'Rush': 'Ruée',
        'Shockbolt': 'Arc d\'éclair',
        'Storm Surge': 'Tempête voltaïque',
        '(?<! )Thunder(?! |clap|ing|spark)': 'Foudre',
        'Thunder II(?!I)': 'Extra Foudre',
        'Thunder III': 'Méga Foudre',
        'Thunder IV': 'Giga Foudre',
        'Thunderclap Concerto': 'Concerto fracassant',
        'Thundering Roar': 'Rugissement foudroyant',
        'Thunderspark': 'Étincelle de foudre',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Amdusias': 'アムドゥシアス',
        'Shock Storm': '雷風',
        'Thundergust Griffin': 'サンダーグリフォン',
        'Treno Catoblepas': 'トレノ・カトブレパス',
      },
      'replaceText': {
        'Bedeviling Light': '悪魔の光',
        'Bio II': 'バイオラ',
        'Earthquake': '地震',
        'Electrifying Flight': '雷風',
        'Electrogenetic Force': '雷撃',
        'Fulgurous Fall': 'ライトニングフォール',
        'Galloping Thunder': 'サンダーギャロップ',
        'Golden Talons': 'ゴールデンタロン',
        'High Volts': 'ハイボルト',
        'Lightning Bolt': '落雷',
        'Petribreath': 'ペトロブレス',
        'Ray of Lightning': 'ライトニングレイ',
        'Rush': '突進',
        'Shockbolt': 'ショックボルト',
        'Storm Surge': 'ボルトストーム',
        '(?<! )Thunder(?! |clap|ing|spark)': 'サンダー',
        'Thunder II(?!I)': 'サンダラ',
        'Thunder III': 'サンダガ',
        'Thunder IV': 'サンダジャ',
        'Thunderclap Concerto': 'サンダークラップコンチェルト',
        'Thundering Roar': 'サンダリングロア',
        'Thunderspark': 'サンダースパーク',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Amdusias': '安度西亚斯',
        'Shock Storm': '雷风',
        'Thundergust Griffin': '雷狮鹫',
        'Treno Catoblepas': '特雷诺卡托布莱帕斯',
      },
      'replaceText': {
        'Bedeviling Light': '恶魔之光',
        'Bio II': '猛毒菌',
        'Earthquake': '地震',
        'Electrifying Flight': '雷风',
        'Electrogenetic Force': '雷击',
        'Fulgurous Fall': '雷光坠击',
        'Galloping Thunder': '雷电飞驰',
        'Golden Talons': '黄金爪',
        'High Volts': '高压电',
        'Lightning Bolt': '落雷',
        'Petribreath': '石化吐息',
        'Ray of Lightning': '雷光射线',
        'Rush': '突进',
        'Shockbolt': '雷电震击',
        'Storm Surge': '电暴',
        '(?<! )Thunder(?! |clap|ing|spark)': '闪雷',
        'Thunder II(?!I)': '震雷',
        'Thunder III': '暴雷',
        'Thunder IV': '霹雷',
        'Thunderclap Concerto': '惊雷协奏曲',
        'Thundering Roar': '雷霆咆哮',
        'Thunderspark': '电光',
      },
    },
  ],
};

export default triggerSet;
