import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// See wall of text below for explanation of Atticus's Breath Sequence mechanic.
type CleaveDir = 'front' | 'right' | 'left';
const atticusNpcYellMap: { [id: string]: CleaveDir } = {
  '41EA': 'front', // "Sssavage might..." (1st cleave)
  '41EB': 'right', // "Triple..."
  '41EC': 'left', // "Breath?"
  '41ED': 'left', // "Triple..."
  '41EE': 'right', // "Breath?"
  '41EF': 'right', // "Dessstroy..." (1st cleave)
  '41F0': 'left', // "Combination..."
  '41F1': 'front', // "Breath?"
  '41F2': 'front', // "Combination..."
  '41F3': 'left', // "Breath?"
  '41F4': 'left', // "Great ssstrength..." (1st cleave)
  '41F5': 'front', // "Sssuperlative..."
  '41F6': 'right', // "Breath?"
  '41F7': 'right', // "Sssuperlative..."
  '41F8': 'front', // "Breath?"
  '41F9': 'front', // "Intenssse heat..." (4th cleave)
  '41FA': 'right', // "Sssearing..."
  '41FB': 'left', // "Breath?"
  '41FC': 'left', // "Sssearing..."
  '41FD': 'right', // "Breath?"
  '41FE': 'right', // "To sssmithereens..." (4th cleave)
  '41FF': 'left', // "Burssst..."
  '4200': 'front', // "Breath?"
  '4201': 'front', // "Burssst..."
  '4202': 'left', // "Breath?"
  '4203': 'left', // "Ssscorching heat..." (4th cleave)
  '4204': 'front', // "Lassst..."
  '4205': 'right', // "Breath?"
  '4206': 'right', // "Lassst..."
  '4207': 'front', // "Breath?"
} as const;
const atticusNpcYellIds = Object.keys(atticusNpcYellMap);
const atticusBreathSeqAbilityIds = ['985B', '985C', '985D'];

export interface Data extends RaidbossData {
  magnetronDebuff?: 'positive' | 'negative';
  storedShockSafe?: 'intercards' | 'cardinals';
  atticusCleaves: CleaveDir[];
}

const triggerSet: TriggerSet<Data> = {
  id: 'HeritageFound',
  zoneId: ZoneId.HeritageFound,
  initData: () => ({
    atticusCleaves: [],
  }),
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
    {
      id: 'Hunt Atticus Intimidation',
      type: 'StartsUsing',
      netRegex: { id: '9866', source: 'Atticus the Primogenitor', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Hunt Atticus Pyric Blast',
      type: 'StartsUsing',
      netRegex: { id: '9865', source: 'Atticus the Primogenitor' },
      response: Responses.stackMarkerOn(),
    },

    // Atticus's main mechanic, Breath Sequence, will do either 3 or 6 directional cleaves
    // that are telegraphed solely by the order of `NpcYell` lines from one of its three heads.
    // There are no 0x14/0x15 lines (or any other lines) that indicate the sequence of cleaves.
    // Atticus will emit an 0x14 line at the start of Breath Sequence, which is one of three ids
    // indicating the direction of the first cleave (985B: front, 985C: right, 985D: left).
    // The cast id does not otherwise indicate the sequence or even the # of cleaves (3 or 6).

    // When performing 3 cleaves, cleaves are never repeated (e.g., Atticus will always cleave
    // left, right, and front, in any order). A 6-cleave combo is essentially 2 sets of 3 cleaves.
    // The first set will cleave all three directions, as will the second set.
    // The sequence of cleaves in the second set has no correlation to the first set.

    // At the start of the encoounter, Atticus will perform 3 cleaves. It will then use Brutality
    // (giving itself the Twisted Tongue buff that speeds up all future NpcYell lines), followed
    // by 3 more cleaves. Next, it will perform a 6-cleave combo. From that point on, Atticus can
    // perform either 3- or 6-cleave sets, with no dialog or abilities (other than the number of
    // `NpcYell` lines) to telegraph whether it will use 3 or 6 cleaves.

    // The `NpcYell` ids range from `41EA`-`4207` (`4208`-`420A` are each used once as boss dialog,
    // but are not reused). Many of these rows have duplicative text, but the `Unknown2` property
    // on each row corresponds to which head will say the line: 18 = left, 25 = middle, 19 = right.
    // See, e.g., https://beta.xivapi.com/api/1/sheet/NpcYell/16874.
    {
      id: 'Hunt Atticus Breath Sequence Collect',
      type: 'NpcYell',
      netRegex: { npcNameId: '3364', npcYellId: atticusNpcYellIds },
      run: (data, matches) => {
        const cleaveDir = atticusNpcYellMap[matches.npcYellId];
        if (cleaveDir === undefined)
          return;
        data.atticusCleaves.push(cleaveDir);
      },
    },
    // For a 3-cleave sequence, we can just tell the player to go 3->1.
    {
      id: 'Hunt Atticus Breath Sequence 3-Cleave',
      type: 'StartsUsing',
      netRegex: { id: atticusBreathSeqAbilityIds, capture: false },
      condition: (data) => data.atticusCleaves.length === 3,
      delaySeconds: 0.2, // tight timing between 0x14 line and final NpcYell, so add safety margin
      durationSeconds: 9.8, // time from 0x14 to final cleave's 0x15/0x16
      alertText: (data, _matches, output) => {
        const [cleave1, , cleave3] = data.atticusCleaves;
        if (cleave1 === undefined || cleave3 === undefined)
          return;
        return output.combo!({ dir1: output[cleave3]!(), dir2: output[cleave1]!() });
      },
      outputStrings: {
        combo: {
          en: 'Start ${dir1} => ${dir2}',
          de: 'Start ${dir1} => ${dir2}',
        },
        front: Outputs.front,
        right: Outputs.right,
        left: Outputs.left,
      },
    },
    // For a 6-cleave sequence, it's more complicated. Because the second set of cleaves can be in
    // any order, agnostic of the first set, we can't rely solely on "3->1" movement, and timing
    // is very tight to move out of a safe spot before the next cleave hits that spot.
    // However, there are only six possible sequences for the second set of cleaves relative to the
    // first set, so we can provide a consistent call for each possibility that will minimize
    // damage/deaths for slow-reacting players. The possibilities (and safe-spot movements) are:
    //
    // Cleave Pattern  ==>  Safe Spot Movement              OutputString
    // --------------       ------------------------------  ------------
    // 1 2 3 -> 1 2 3  ==>  Start 3 -> 1 -> 2 -> 3 -> 1     [rotate]
    // 1 2 3 -> 1 3 2  ==>  Start 3 -> 1 -> 2 (for 2) -> 1  [lateDelay1]
    // 1 2 3 -> 2 1 3  ==>  Start 3 -> 1 (for 2) -> 3 -> 2  [earlyDelay]
    // 1 2 3 -> 2 3 1  ==>  Start 3 -> 1 (for 3) -> 2       [bigDelay2]
    // 1 2 3 -> 3 1 2  ==>  Start 3 -> 1 -> 2 (for 2) -> 3  [lateDelay3]
    // 1 2 3 -> 3 2 1  ==>  Start 3 -> 1 (for 3) -> 3       [bigDelay3]
    {
      id: 'Hunt Atticus Breath Sequence 6-Cleave',
      type: 'StartsUsing',
      netRegex: { id: atticusBreathSeqAbilityIds, capture: false },
      condition: (data) => data.atticusCleaves.length === 6,
      delaySeconds: 0.2, // tight timing between 0x14 line and final NpcYell, so add safety margin
      durationSeconds: 16.8, // time from 0x14 to final cleave's 0x15/0x16
      alertText: (data, _matches, output) => {
        const [cleave1, cleave2, cleave3, cleave4, cleave5, cleave6] = data.atticusCleaves;
        if (
          cleave1 === undefined || cleave2 === undefined || cleave3 === undefined ||
          cleave4 === undefined || cleave5 === undefined || cleave6 === undefined
        )
          return;

        const dir1 = output[cleave1]!();
        const dir2 = output[cleave2]!();
        const dir3 = output[cleave3]!();

        if (cleave1 === cleave4) {
          if (cleave2 === cleave5)
            return output.rotate!({ dir1: dir1, dir2: dir2, dir3: dir3 }); // 1 2 3 -> 1 2 3
          return output.lateDelay1!({ dir1: dir1, dir2: dir2, dir3: dir3 }); // 1 2 3 -> 1 3 2
        } else if (cleave2 === cleave4) {
          if (cleave1 === cleave5)
            return output.earlyDelay!({ dir1: dir1, dir2: dir2, dir3: dir3 }); // 1 2 3 -> 2 1 3
          return output.bigDelay2!({ dir1: dir1, dir2: dir2, dir3: dir3 }); // 1 2 3 -> 2 3 1
        }

        if (cleave1 === cleave5)
          return output.lateDelay3!({ dir1: dir1, dir2: dir2, dir3: dir3 }); // 1 2 3 -> 3 1 2
        return output.bigDelay3!({ dir1: dir1, dir3: dir3 }); // 1 2 3 -> 3 2 1
      },
      // For simplicity, rather than translating each cleave to a safe spot and the outputting
      // that spot, the cleave sequence is simply mapped to dir1-dir3, and the outputStrings
      // take care of calling the correct order per the table above (e.g. dir3->dir1 etc.).
      outputStrings: {
        rotate: {
          en: 'Start ${dir3} => ${dir1} => ${dir2} (Keep Rotating)',
          de: 'Start ${dir3} => ${dir1} => ${dir2} (Weiter Rotieren)',
        },
        earlyDelay: {
          en: 'Start ${dir3} => ${dir1} (für 2) => ${dir3} => ${dir2}',
          de: 'Start ${dir3} => ${dir1} (für 2) => ${dir3} => ${dir2}',
        },
        lateDelay1: {
          en: 'Start ${dir3} => ${dir1} => ${dir2} (für 2) => ${dir1}',
          de: 'Start ${dir3} => ${dir1} => ${dir2} (für 2) => ${dir1}',
        },
        lateDelay3: {
          en: 'Start ${dir3} => ${dir1} => ${dir2} (für 2) => ${dir3}',
          de: 'Start ${dir3} => ${dir1} => ${dir2} (für 2) => ${dir3}',
        },
        bigDelay2: {
          en: 'Start ${dir3} => ${dir1} (für 3) => ${dir2}',
          de: 'Start ${dir3} => ${dir1} (für 3) => ${dir2}',
        },
        bigDelay3: {
          en: 'Start ${dir3} => ${dir1} (für 3) => ${dir3}',
          de: 'Start ${dir3} => ${dir1} (für 3) => ${dir3}',
        },
        front: Outputs.front,
        right: Outputs.right,
        left: Outputs.left,
        unknown: Outputs.unknown,
      },
    },
    // Because we only fire the output triggers if 3 or 6 cleaves are collected,
    // use a separate cleanup trigger (in case the player arrived mid-sequence or
    // if not all NpcYell lines were collected).
    {
      id: 'Hunt Atticus Breath Sequence Cleanup',
      type: 'Ability',
      netRegex: { id: atticusBreathSeqAbilityIds, capture: false },
      run: (data) => data.atticusCleaves = [],
    },
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
