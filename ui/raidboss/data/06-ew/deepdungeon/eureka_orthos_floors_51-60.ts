import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import { Directions } from '../../../../../resources/util';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// Eureka Orthos Floors 51-60

export interface Data extends RaidbossData {
  octupleSwipes?: number[];
  calledOctupleSwipes?: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'EurekaOrthosFloors51_60',
  zoneId: ZoneId.EurekaOrthosFloors51_60,

  triggers: [
    // ---------------- Floor 51-59 Mobs ----------------
    {
      id: 'EO 51-60 Orthos Ice Sprite Hypothermal Combustion',
      // explodes in a letal PBAoE after death
      type: 'StartsUsing',
      netRegex: { id: '7EF0', source: 'Orthos Ice Sprite', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'EO 51-60 Orthos Ymir Gelid Charge',
      // gains Ice Spikes (C6), lethal counterattack when hit with physical damage
      type: 'StartsUsing',
      netRegex: { id: '819C', source: 'Orthos Ymir' },
      response: Responses.stunIfPossible(),
    },
    {
      id: 'EO 51-60 Orthos Ymir Ice Spikes Gain',
      // C6 = Ice Spikes, lethal counterattack damage when hit with physical damage
      type: 'GainsEffect',
      netRegex: { effectId: 'C6', target: 'Orthos Ymir' },
      alertText: (_data, matches, output) => output.text!({ target: matches.target }),
      outputStrings: {
        text: {
          en: 'Stop attacking ${target}',
          de: 'Stoppe Angriffe auf ${target}',
          fr: 'Arrêtez d\'attaquer ${target}',
          ja: '攻撃禁止: ${target}',
          cn: '停止攻击 ${target}',
          tc: '停止攻擊 ${target}',
          ko: '${target} 공격 중지',
        },
      },
    },
    {
      id: 'EO 51-60 Orthos Rockfin Aqua Spear',
      // lethal line charge AoE; can break line-of-sight to avoid
      type: 'StartsUsing',
      netRegex: { id: '7EF4', source: 'Orthos Rockfin' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, matches, output) => output.text!({ name: matches.source }),
      outputStrings: {
        text: {
          en: 'Break line-of-sight to ${name}',
          de: 'Unterbreche Sichtlinie zu ${name}',
          fr: 'Masquez le champ de vision vers ${name}',
          ja: '${name}の視線から隠れる',
          cn: '利用掩体卡 ${name} 的视线',
          tc: '利用掩體卡 ${name} 的視線',
          ko: '${name}의 시야 밖으로 숨기',
        },
      },
    },
    {
      id: 'EO 51-60 Orthos Big Claw Crab Dribble',
      type: 'StartsUsing',
      netRegex: { id: '7EE5', source: 'Orthos Big Claw', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'EO 51-60 Orthos Zaratan Sewer Water Back First',
      type: 'StartsUsing',
      netRegex: { id: '7EEB', source: 'Orthos Zaratan', capture: false },
      response: Responses.getBackThenFront('alert'),
    },
    {
      id: 'EO 51-60 Orthos Zaratan Sewer Water Front First',
      type: 'StartsUsing',
      netRegex: { id: '7EEC', source: 'Orthos Zaratan', capture: false },
      response: Responses.getFrontThenBack('alert'),
    },
    {
      id: 'EO 51-60 Orthos Stingray Expulsion',
      type: 'StartsUsing',
      netRegex: { id: '81A1', source: 'Orthos Stingray', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'EO 51-60 Orthos Stingray Electric Whorl',
      type: 'StartsUsing',
      netRegex: { id: '81A2', source: 'Orthos Stingray', capture: false },
      response: Responses.getUnder('alert'),
    },
    // ---------------- Floor 60 Boss: Servomechanical Minotaur 16 ----------------
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Bullish Swipe',
      type: 'StartsUsing',
      netRegex: { id: '801B', source: 'Servomechanical Minotaur 16', capture: false },
      response: Responses.awayFromFront(),
    },
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Bullish Swing',
      type: 'StartsUsing',
      netRegex: { id: '7C83', source: 'Servomechanical Minotaur 16', capture: false },
      response: Responses.getOut(),
    },
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Disorienting Groan',
      // knockback, will push all the way into damage wall if not under boss
      type: 'StartsUsing',
      netRegex: { id: '7C84', source: 'Servomechanical Minotaur 16', capture: false },
      response: Responses.getUnder('alert'),
    },
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Octuple Swipe Cleanup',
      type: 'Ability',
      netRegex: { id: '7C80', source: 'Servomechanical Minotaur 16', capture: false },
      run: (data) => {
        delete data.octupleSwipes;
        delete data.calledOctupleSwipes;
      },
    },
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Octuple Swipe',
      type: 'StartsUsingExtra',
      netRegex: { id: '7C7B', capture: true },
      condition: (data) => !data.calledOctupleSwipes,
      durationSeconds: 18,
      alertText: (data, matches, output) => {
        const heading = Directions.hdgTo4DirNum(parseFloat(matches.heading));
        data.octupleSwipes ??= [];
        data.octupleSwipes.push(heading);

        if (data.octupleSwipes.length < 5)
          return;

        data.calledOctupleSwipes = true;

        if (data.octupleSwipes[0] === data.octupleSwipes[4])
          // swipe order is Front > Back > Right > Left > Front > Back > Right > Left
          // dodge order is Left > Front > Front > Front > Left > Front > Front > Front
          return output.repeat!({ left: output.left!(), front: output.front!() });

        if (data.octupleSwipes[3] === data.octupleSwipes[4])
          // swipe order is Front > Back > Right > Left > Left > Right > Back > Front
          // dodge order is Left > Front > Front > Front > Front > Front > Front > Left
          return output.rewind!({ left: output.left!(), front: output.front!() });

        // something went wrong
        data.calledOctupleSwipes = false;
        return output.avoid!();
      },
      outputStrings: {
        repeat: {
          en: '${left} => ${front} x3 => ${left} => ${front} x3',
          de: '${left} => ${front} x3 => ${left} => ${front} x3',
          cn: '${left} => ${front} x3 => ${left} => ${front} x3',
          tc: '${left} => ${front} x3 => ${left} => ${front} x3',
          ko: '${left} => ${front} x3 => ${left} => ${front} x3',
        },
        rewind: {
          en: '${left} => ${front} x6 => ${left}',
          de: '${left} => ${front} x6 => ${left}',
          cn: '${left} => ${front} x6 => ${left}',
          tc: '${left} => ${front} x6 => ${left}',
          ko: '${left} => ${front} x6 => ${left}',
        },
        avoid: {
          en: 'Avoid swipes x8',
          de: 'Vermeide Schwung x8',
          cn: '避开顺劈 x8',
          tc: '避開順劈 x8',
          ko: '후려치기 피하기 x8',
        },
        left: Outputs.left,
        front: Outputs.front,
      },
    },
    {
      id: 'EO 51-60 Servomechanical Minotaur 16 Thundercall',
      type: 'StartsUsing',
      netRegex: { id: '7C81', source: 'Servomechanical Minotaur 16', capture: false },
      response: Responses.aoe(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Orthos Big Claw': 'Orthos-Mörderkrabbe',
        'Orthos Ice Sprite': 'Orthos-Eis-Exergon',
        'Orthos Rockfin': 'Orthos-Felsenflosse',
        'Orthos Stingray': 'Orthos-Manta',
        'Orthos Ymir': 'Orthos-Ymir',
        'Orthos Zaratan': 'Orthos-Zaratan',
        'Servomechanical Minotaur 16': 'servomechanisch(?:e|er|es|en) Minotaurus 16',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Orthos Big Claw': 'grosse pince Orthos',
        'Orthos Ice Sprite': 'élémentaire de glace Orthos',
        'Orthos Rockfin': 'rocquin Orthos',
        'Orthos Stingray': 'raie Orthos',
        'Orthos Ymir': 'bulot Orthos',
        'Orthos Zaratan': 'zaratan Orthos',
        'Servomechanical Minotaur 16': 'minotaure servomécanique 16',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Orthos Big Claw': 'オルト・ビッグクロウ',
        'Orthos Ice Sprite': 'オルト・アイススプライト',
        'Orthos Rockfin': 'オルト・ロックフィン',
        'Orthos Stingray': 'オルト・スティングレイ',
        'Orthos Ymir': 'オルト・ユミール',
        'Orthos Zaratan': 'オルト・ザラタン',
        'Servomechanical Minotaur 16': 'サーヴォ・ミノタウロス16',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Orthos Big Claw': '正统大螯陆蟹',
        'Orthos Ice Sprite': '正统冰元精',
        'Orthos Rockfin': '正统石鳍鲨',
        'Orthos Stingray': '正统刺魟',
        'Orthos Ymir': '正统尤弥尔',
        'Orthos Zaratan': '正统扎拉坦',
        'Servomechanical Minotaur 16': '自控化弥诺陶洛斯16',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Orthos Big Claw': '오르토스 왕집게',
        'Orthos Ice Sprite': '오르토스 얼음 정령',
        'Orthos Rockfin': '오르토스 바위지느러미',
        'Orthos Stingray': '오르토스 창가오리',
        'Orthos Ymir': '오르토스 위미르',
        'Orthos Zaratan': '오르토스 자라탄',
        'Servomechanical Minotaur 16': '자동제어 미노타우로스 16',
      },
    },
  ],
};

export default triggerSet;
