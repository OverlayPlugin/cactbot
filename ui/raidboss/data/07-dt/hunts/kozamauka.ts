import Conditions from '../../../../../resources/conditions';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

type DoReMiseryAbility = 'out' | 'in' | 'behind';
const doReMiseryNpcYellMap: { [id: string]: DoReMiseryAbility[] } = {
  '4538': ['in', 'out', 'behind'], // 17720: Ribbit! Chiiirp! Croak!
  '4539': ['out', 'in', 'behind'], // 17721: Chirp! Ribbit! Croooak!
  '453A': ['behind', 'in', 'out'], // 17722: Croak! Ribbit! Chirp!
  '453B': ['in', 'behind', 'out'], // 17723: Ribbit! Croooak! Chirp!
  '453C': ['behind', 'out', 'in'], // 17724: Croak! Chirp! Ribiiit!
  '453D': ['out', 'behind', 'in'], // 17725: Chirp! Croak! Ribbit!
  '4546': ['out', 'behind', 'out'], // 17734: Chirp! Croak! Chiiirp!
  '4581': ['in', 'in', 'out'], // 17793: Ribbit! Ribbiiit! Chirp!
};

const doReMiseryOutputs = {
  out: Outputs.out,
  in: Outputs.in,
  behind: Outputs.getBehind,
  unknown: Outputs.unknown,
  next: Outputs.next,
} as const;

export interface Data extends RaidbossData {
  nextDoReMisery: DoReMiseryAbility[];
  nextAetherstock?: 'out' | 'in';
  leftRightFace?: 'left' | 'right';
}

const triggerSet: TriggerSet<Data> = {
  id: 'Kozamauka',
  zoneId: ZoneId.Kozamauka,
  comments: {
    en: 'A Rank Hunts',
    de: 'A Rang Hohe Jagd',
    fr: 'Chasse de rang A',
    cn: 'A级狩猎怪',
    ko: 'A급 마물',
    tc: 'A級狩獵怪',
  },
  initData: () => ({
    nextDoReMisery: [],
  }),
  triggers: [
    // ****** A-RANK: Pkuucha ****** //
    {
      id: 'Hunt Pkuucha Mesmerizing March',
      type: 'StartsUsing',
      netRegex: { id: '9BB7', source: 'Pkuucha', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out (then behind)',
          de: 'Raus (danach Hinten)',
          fr: 'Extérieur (puis derrière)',
          cn: '远离 (然后去背后)',
          ko: '밖으로 (그리고 뒤로)',
          tc: '遠離 (然後去背後)',
        },
      },
    },
    {
      id: 'Hunt Pkuucha Stirring Samba',
      type: 'StartsUsing',
      netRegex: { id: '9BB8', source: 'Pkuucha', capture: false },
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Pkuucha Gliding Swoop',
      type: 'StartsUsing',
      netRegex: { id: '9B4D', source: 'Pkuucha', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Follow jump (then out => behind)',
          de: 'Sprung folgen (dann Raus => Hinten)',
          fr: 'Suivez le saut (puis extérieur => derrière)',
          cn: '跟随跳跃 (然后远离 => 背后)',
          ko: '돌진 따라가기 (그리고 밖 => 뒤로)',
          tc: '跟隨跳躍 (然後遠離 => 背後)',
        },
      },
    },
    {
      id: 'Hunt Pkuucha Marching Samba',
      type: 'StartsUsing',
      netRegex: { id: '9B75', source: 'Pkuucha', capture: false },
      durationSeconds: 6,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => Behind',
          de: 'Raus => Hinten',
          fr: 'Extérieur => Derrière',
          cn: '远离 => 背后',
          ko: '밖 => 뒤로',
          tc: '遠離 => 背後',
        },
      },
    },
    {
      id: 'Hunt Pkuucha Marching Samba Followup',
      type: 'Ability',
      netRegex: { id: '9B75', source: 'Pkuucha', capture: false },
      delaySeconds: 1.2,
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Pkuucha Pecking Flurry',
      type: 'StartsUsing',
      netRegex: { id: '9B50', source: 'Pkuucha', capture: false },
      durationSeconds: 10,
      response: Responses.aoe(),
    },

    // ****** A-RANK: The Raintriller ****** //
    {
      id: 'Hunt Raintriller Drop of Venom',
      type: 'StartsUsing',
      netRegex: { id: '9B4A', source: 'The Raintriller' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Hunt Raintriller Do-Re-Misery Npc Yell Collect',
      type: 'NpcYell',
      // npcNameId 3482: The Raintriller
      netRegex: { npcNameId: '3482', npcYellId: Object.keys(doReMiseryNpcYellMap) },
      run: (data, matches) => {
        const yellId = matches.npcYellId;
        const abilityList = doReMiseryNpcYellMap[yellId];
        if (abilityList === undefined)
          throw new UnreachableCode();
        data.nextDoReMisery = abilityList;
      },
    },
    {
      id: 'Hunt Raintriller Do-Re-Misery First',
      type: 'StartsUsing',
      netRegex: { id: '9B4E', source: 'The Raintriller', capture: false },
      durationSeconds: 7,
      // This ability always corresponds to npcYellId 4597 (Chirp!)
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Raintriller Do-Re-Misery Second',
      type: 'StartsUsing',
      netRegex: { id: '9B47', source: 'The Raintriller', capture: false },
      durationSeconds: 11,
      // This ability always correspond to npcYellId 4537 (Chirp! Ribbit!)
      response: Responses.getOutThenIn('alert'),
    },
    {
      id: 'Hunt Raintriller Do-Re-Misery Combo',
      type: 'StartsUsing',
      netRegex: { id: '9B45', source: 'The Raintriller', capture: false },
      delaySeconds: 0.5, // let NpcYell collect run first
      durationSeconds: 14.5,
      alertText: (data, _matches, output) => {
        const seq = data.nextDoReMisery;
        if (seq.length !== 3)
          return output.unknown!();
        const outputStr = seq.map((safe) => output[safe]!()).join(output.next!());
        return outputStr;
      },
      run: (data) => data.nextDoReMisery = [],
      outputStrings: doReMiseryOutputs,
    },

    // ****** S-RANK: Ihnuxokiy ****** //
    {
      id: 'Hunt Ihnuxokiy Abyssal Smog Initial',
      type: 'StartsUsing',
      netRegex: { id: '9B5D', source: 'Ihnuxokiy', capture: false },
      durationSeconds: 8,
      response: Responses.getBehind(),
    },
    {
      id: 'Hunt Ihnuxokiy Aetherstock Out Collect',
      type: 'Ability',
      netRegex: { id: '9B62', source: 'Ihnuxokiy', capture: false },
      run: (data) => data.nextAetherstock = 'out',
    },
    {
      id: 'Hunt Ihnuxokiy Aetherstock In Collect',
      type: 'Ability',
      netRegex: { id: '9B63', source: 'Ihnuxokiy', capture: false },
      run: (data) => data.nextAetherstock = 'in',
    },
    // Ihnuxokiy applies an 8s Forward March/About Face debuff & 12s Left/Right Face debuff.
    // On expiration, each then converts to a 3s Forced March.
    // The Abyssal Smog frontal cleave snapshots 1 second after the first Forced March has expired,
    // just as the Left/Right Face debuff is converting to a Forced March.
    // The stored Aethersock snapshots as the Left/Right Face Forced March debuff expires.
    //
    // Because there is a 1s gap between the end of the Forward/Backward Forced March
    // and the start of the Left/Right Forced March, players may change their position/facing
    // during that time.
    //
    // The safest way to handle this is probably to call the initial Forward/Backward debuff
    // with a "(then x)" to indicate that the Left/Right debuff will follow.  As soon as the
    // Forward/Backward Forced March begins, we can then fire the Left/Right Forced March reminder.
    //
    // TODO: Countdowns here would be really useful...
    {
      id: 'Hunt Ihnuxokiy Left/Right Face Collect',
      type: 'GainsEffect',
      // 873: Left Face, 874: Right Face
      netRegex: { effectId: ['873', '874'] },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => data.leftRightFace = matches.effectId === '873' ? 'left' : 'right',
    },
    {
      id: 'Hunt Ihnuxokiy Forced March Forward/Backward',
      type: 'GainsEffect',
      // 871: Forward March, 872: About Face
      netRegex: { effectId: ['871', '872'] },
      condition: Conditions.targetIsYou(),
      delaySeconds: 0.2, // let Left/Right Face Collect run first
      durationSeconds: (_data, matches) => parseInt(matches.duration) - 0.2,
      infoText: (data, matches, output) => {
        const foreBack = matches.effectId === '871' ? output.forward!() : output.backward!();
        const leftRight = output[data.leftRightFace ?? 'unknown']!();
        return output.combo!({ foreBack: foreBack, leftRight: leftRight });
      },
      outputStrings: {
        combo: {
          en: 'Forced March: ${foreBack} => ${leftRight}',
          de: 'Geistlenkung: ${foreBack} => ${leftRight}',
          fr: 'Marche forcée : ${foreBack} => ${leftRight}',
          cn: '强制移动: ${foreBack} => ${leftRight}',
          ko: '강제이동: ${foreBack} => ${leftRight}',
          tc: '強制移動: ${foreBack} => ${leftRight}',
        },
        forward: {
          en: 'Forward',
          de: 'vorwärts',
          fr: 'Avant',
          cn: '前',
          ko: '앞',
          tc: '前',
        },
        backward: {
          en: 'Backward',
          de: 'rückwärts',
          fr: 'Arrière',
          cn: '后',
          ko: '뒤',
          tc: '後',
        },
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Hunt Ihnuxokiy Forced March Left/Right',
      type: 'GainsEffect',
      // 873: Left Face, 874: Right Face
      netRegex: { effectId: ['873', '874'] },
      condition: Conditions.targetIsYou(),
      delaySeconds: (_data, matches) => parseInt(matches.duration) - 4,
      durationSeconds: 4,
      infoText: (data, _matches, output) => {
        const leftRight = output[data.leftRightFace ?? 'unknown']!();
        return output.combo!({ leftRight: leftRight });
      },
      run: (data) => delete data.leftRightFace,
      outputStrings: {
        combo: {
          en: 'Forced March: ${leftRight}',
          de: 'Geistlenkung: ${leftRight}',
          fr: 'Marche forcée : ${leftRight}',
          cn: '强制移动: ${leftRight}',
          ko: '강제이동: ${leftRight}',
          tc: '強制移動: ${leftRight}',
        },
        left: Outputs.left,
        right: Outputs.right,
        unknown: Outputs.unknown,
      },
    },
    {
      id: 'Hunt Ihnuxokiy Abyssal Smog Combo',
      type: 'StartsUsing',
      netRegex: { id: '9B94', source: 'Ihnuxokiy', capture: false },
      delaySeconds: 2, // avoid collision with first Forced March call
      durationSeconds: 10.5,
      alertText: (data, _matches, output) => {
        const inOut = output[data.nextAetherstock ?? 'unknown']!();
        return output.combo!({ behind: output.behind!(), inOut: inOut });
      },
      run: (data) => delete data.nextAetherstock,
      outputStrings: {
        combo: {
          en: '${behind} => ${inOut}',
          de: '${behind} => ${inOut}',
          fr: '${behind} => ${inOut}',
          cn: '${behind} => ${inOut}',
          ko: '${behind} => ${inOut}',
          tc: '${behind} => ${inOut}',
        },
        behind: Outputs.getBehind,
        out: Outputs.out,
        in: Outputs.in,
        unknown: Outputs.unknown,
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Pkuucha': 'Pkuucha',
        'The Raintriller': 'Regentriller',
        'Ihnuxokiy': 'Ihnuxokiy',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Pkuucha': 'Pkuucha',
        'The Raintriller': 'Trilleur de pluie',
        'Ihnuxokiy': 'Ihnuxokiy',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Pkuucha': 'プクーチャ',
        'The Raintriller': 'レイントリラー',
        'Ihnuxokiy': 'イヌショキー',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Pkuucha': '普库恰',
        'The Raintriller': '惊雨蟾蜍',
        'Ihnuxokiy': '伊努索奇',
      },
    },
    {
      'locale': 'tc',
      'replaceSync': {
        'Pkuucha': '普庫恰',
        'The Raintriller': '驚雨蟾蜍',
        'Ihnuxokiy': '伊努索奇',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Pkuucha': '프쿠차',
        'The Raintriller': '빗물흥얼이',
        'Ihnuxokiy': '이누쇼키',
      },
    },
  ],
};

export default triggerSet;
