import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Add triggers for Atticus the Primogenitor (S-Rank)

export interface Data extends RaidbossData {
  magnetronDebuff?: 'positive' | 'negative';
  storedShockSafe?: 'intercards' | 'cardinals';
}

const triggerSet: TriggerSet<Data> = {
  id: 'HeritageFound',
  zoneId: ZoneId.HeritageFound,
  triggers: [
    // ****** A-RANK: Heshuala ****** //
    {
      id: 'Hunt Heshuala Electrical Overload',
      type: 'StartsUsing',
      netRegex: { id: '98C1', source: 'Heshuala', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Heshuala Stored Shock Early',
      type: 'GainsEffect',
      // F89: Shocking Cross (+ cleave, intercards safe)
      // F8A: X Marks the Shock (x cleave, cardinals safe)
      netRegex: { effectId: ['F89', 'F8A'], target: 'Heshuala' },
      infoText: (data, matches, output) => {
        const safe = matches.effectId === 'F89' ? 'intercards' : 'cardinals';
        data.storedShockSafe = safe;
        return output[safe]!();
      },
      outputStrings: {
        cardinals: {
          en: '(cardinals later)',
          de: '(später Kardinal)',
          cn: '(稍后去正点)',
          ko: '(나중에 십자방향)',
        },
        intercards: {
          en: '(intercards later)',
          de: '(später Interkardinal)',
          cn: '(稍后去斜角)',
          ko: '(나중에 대각선)',
        },
      },
    },
    {
      id: 'Hunt Heshuala Stored Shock Now',
      type: 'LosesEffect',
      // F8B: Electrical Charge (LosesEffect happens right before the Stored Shock resolves)
      netRegex: { effectId: 'F8B', target: 'Heshuala', capture: false },
      alertText: (data, _matches, output) => {
        const safe = data.storedShockSafe;
        if (safe !== undefined)
          return output[safe]!();
      },
      run: (data) => delete data.storedShockSafe,
      outputStrings: {
        cardinals: Outputs.cardinals,
        intercards: Outputs.intercards,
      },
    },

    // ****** A-RANK: Urna Variabilis ****** //
    {
      id: 'Hunt Urna Proximity Plasma',
      type: 'StartsUsing',
      netRegex: { id: '98C2', source: 'Urna Variabilis', capture: false },
      response: Responses.getOut('info'),
    },
    {
      id: 'Hunt Urna Ring Lightning',
      type: 'StartsUsing',
      netRegex: { id: '98C3', source: 'Urna Variabilis', capture: false },
      response: Responses.getIn('info'),
    },
    {
      id: 'Hunt Urna Magnetron',
      type: 'StartsUsing',
      netRegex: { id: '98C4', source: 'Urna Variabilis', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Urna Thunderous Shower',
      type: 'StartsUsing',
      netRegex: { id: '98CB', source: 'Urna Variabilis' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Hunt Urna Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '98CC', source: 'Urna Variabilis', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Urna Magnetron Debuff',
      type: 'GainsEffect',
      // FE7: Positive Charge, FE8: Negative Charge
      netRegex: { effectId: ['FE7', 'FE8'], source: 'Urna Variabilis' },
      condition: Conditions.targetIsYou(),
      run: (data, matches) =>
        data.magnetronDebuff = matches.effectId === 'FE7' ? 'positive' : 'negative',
    },
    {
      id: 'Hunt Urna Magnetoplasma',
      type: 'StartsUsing',
      // 98C5: Boss Positive, 98C7: Boss Negative
      netRegex: { id: ['98C5', '98C7'], source: 'Urna Variabilis' },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const bossMagnet = matches.id === '98C5' ? 'positive' : 'negative';
        const myMagnet = data.magnetronDebuff;
        if (myMagnet === undefined)
          return output.out!();

        if (bossMagnet === myMagnet)
          return output.combo!({ magnet: output.repel!(), dir: output.out!() });
        return output.combo!({ magnet: output.attract!(), dir: output.out!() });
      },
      run: (data) => delete data.magnetronDebuff,
      outputStrings: {
        out: Outputs.out,
        repel: {
          en: 'Forced knockback',
          de: 'Erzwungener Rückstoß',
          cn: '强制击退',
          ko: '강제 넉백',
        },
        attract: {
          en: 'Forced draw-in',
          de: 'Erzwungenes Rein-Ziehen',
          cn: '强制吸引',
          ko: '강제 끌어당김',
        },
        combo: {
          en: '${magnet} => ${dir}',
          de: '${magnet} => ${dir}',
          cn: '${magnet} => ${dir}',
          ko: '${magnet} => ${dir}',
        },
      },
    },
    {
      id: 'Hunt Urna Magnetoring',
      type: 'StartsUsing',
      // 98C6: Boss Positive, 98C8: Boss Negative
      netRegex: { id: ['98C6', '98C8'], source: 'Urna Variabilis' },
      durationSeconds: 8,
      alertText: (data, matches, output) => {
        const bossMagnet = matches.id === '98C6' ? 'positive' : 'negative';
        const myMagnet = data.magnetronDebuff;
        if (myMagnet === undefined)
          return output.in!();

        if (bossMagnet === myMagnet)
          return output.combo!({ magnet: output.repel!(), dir: output.in!() });
        return output.combo!({ magnet: output.attract!(), dir: output.in!() });
      },
      run: (data) => delete data.magnetronDebuff,
      outputStrings: {
        in: Outputs.in,
        repel: {
          en: 'Forced knockback',
          de: 'Erzwungener Rückstoß',
          cn: '强制击退',
          ko: '강제 넉백',
        },
        attract: {
          en: 'Forced draw-in',
          de: 'Erzwungenes Rein-Ziehen',
          cn: '强制吸引',
          ko: '강제 끌어당김',
        },
        combo: {
          en: '${magnet} => ${dir}',
          de: '${magnet} => ${dir}',
          cn: '${magnet} => ${dir}',
          ko: '${magnet} => ${dir}',
        },
      },
    },
    // ****** S-RANK: Atticus the Primogenitor ****** //
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Heshuala': 'Heshuala',
        'Urna Variabilis': 'Urna Variabilis',
        'Atticus the Primogenitor': 'Atticus (?:der|die|das) Primogenitor',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Heshuala': 'Heshuala',
        'Urna Variabilis': 'pod variant',
        'Atticus the Primogenitor': 'Atticus le primogéniteur',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Heshuala': 'ヘシュワラ',
        'Urna Variabilis': 'ヴァリアポッド',
        'Atticus the Primogenitor': '先駆けのアティカス',
      },
    },
  ],
};

export default triggerSet;
