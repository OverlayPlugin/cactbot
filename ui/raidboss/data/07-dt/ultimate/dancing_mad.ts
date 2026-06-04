import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

type Phase = 'p1' | 'p2';
const phases: { [id: string]: Phase } = {
  'C24C': 'p2', // Ultimate Embrace, God Kefka
};

// const centerX = 100;
// const centerY = 100;

export interface Data extends RaidbossData {
  // General
  phase: Phase | 'unknown';
  // Phase 1
  fireMarker?: string;
  isFireTrue?: boolean;
  isIceTrue?: boolean;
  isThunderTrue?: boolean;
  doubleTroubleTrapTargets: string[];
}

const headMarkerData = {
  // Phase 1 Boss
  'fakeFire': '02A1',
  'trueFire': '02A2',
  'fakeIce': '02A3',
  'trueIce': '02A4',
  'fakeThunder': '02A5',
  'trueThunder': '02A6',
  // Phase 1 Players
  'tankbuster': '00DA', // Revolting Ruin III tankbuster
  'dorito': '007F', // spread (real) or stack (fake)
  'stack': '0080', // spread (fake) or stack (real)
} as const;

const mysteryMagicOutputStrings: OutputStrings = {
  spread: Outputs.spread,
  stack: {
    en: 'Stack',
    de: 'Stacken',
    fr: 'Packez-vous',
    ja: 'スタック',
    cn: '集合',
    ko: '집합',
    tc: '集合',
  },
  trueThunder: {
    en: 'True Thunder',
    de: 'Wahrer Blitz',
    fr: 'Vraie foudre',
    ja: '真サンダガ',
    cn: '真雷',
    ko: '진실 선더가',
    tc: '真雷',
  },
  fakeThunder: {
    en: 'Fake Thunder',
    de: 'Falscher Blitz',
    fr: 'Fausse foudre',
    ja: 'にせサンダガ',
    cn: '假雷',
    ko: '거짓 선더가',
    tc: '假雷',
  },
  trueIce: {
    en: 'True Ice',
    de: 'Wahres Eis',
    fr: 'Vraie glace',
    ja: '真ブリザガ',
    cn: '真冰',
    ko: '진실 블리자가',
    tc: '真冰',
  },
  fakeIce: {
    en: 'Fake Ice',
    de: 'Falsches Eis',
    fr: 'Fausse glace',
    ja: 'にせブリザガ',
    cn: '假冰',
    ko: '거짓 블리자가',
    tc: '假冰',
  },
  stackTrueIce: {
    en: '${mech} + ${ice}',
  },
  stackFakeIce: {
    en: '${mech} + ${ice}',
  },
  spreadTrueIce: {
    en: '${mech} + ${ice}',
  },
  spreadFakeIce: {
    en: '${mech} + ${ice}',
  },
  trueIceTrueThunder: {
    en: '${ice} + ${thunder}',
  },
  fakeIceTrueThunder: {
    en: '${ice} + ${thunder}',
  },
  trueIceFakeThunder: {
    en: '${ice} + ${thunder}',
  },
  fakeIceFakeThunder: {
    en: '${ice} + ${thunder}',
  },
  stackTrueThunder: {
    en: '${mech} + ${thunder}',
  },
  stackFakeThunder: {
    en: '${mech} + ${thunder}',
  },
  spreadTrueThunder: {
    en: '${mech} + ${thunder}',
  },
  spreadFakeThunder: {
    en: '${mech} + ${thunder}',
  },
};

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  timelineFile: 'dancing_mad.txt',
  initData: () => {
    return {
      phase: 'p1',
      doubleTroubleTrapTargets: [],
    };
  },
  triggers: [
    {
      id: 'DMU Phase Tracker',
      type: 'StartsUsing',
      netRegex: { id: Object.keys(phases) },
      run: (data, matches) => data.phase = phases[matches.id] ?? 'unknown',
    },
    {
      id: 'DMU P1 Revolting Ruin III',
      // Tankbuster targets highest enmity then the nearest player that is not the highest enmity
      // Offtank can provoke to cause the main tank to take both hits so long as main tank is closest
      type: 'HeadMarker',
      netRegex: { id: headMarkerData['tankbuster'], capture: true },
      response: Responses.tankBuster(),
    },
    {
      id: 'DMU P1 Mystery Magic Collect',
      type: 'HeadMarker',
      netRegex: {
        id: [
          headMarkerData['trueFire'],
          headMarkerData['trueIce'],
          headMarkerData['trueThunder'],
          headMarkerData['fakeFire'],
          headMarkerData['fakeIce'],
          headMarkerData['fakeThunder'],
        ],
        capture: true,
      },
      run: (data, matches) => {
        switch (matches.id) {
          case headMarkerData['trueFire']:
            data.isFireTrue = true;
            return;
          case headMarkerData['fakeFire']:
            data.isFireTrue = false;
            return;
          case headMarkerData['trueIce']:
            data.isIceTrue = true;
            return;
          case headMarkerData['fakeIce']:
            data.isIceTrue = false;
            return;
          case headMarkerData['trueThunder']:
            data.isThunderTrue = true;
            return;
          case headMarkerData['fakeThunder']:
            data.isThunderTrue = false;
            return;
        }
      },
    },
    {
      id: 'DMU P1 Fire Head Marker Collect',
      type: 'HeadMarker',
      netRegex: { id: [headMarkerData['dorito'], headMarkerData['stack']], capture: true },
      suppressSeconds: 2,
      run: (data, matches) => data.fireMarker = matches.id,
    },
    {
      id: 'DMU P1 Mystery Magic Ice and Fire',
      // Set 1: Only Ice and Fire should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isFireTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isIceTrue
            ? output.spreadTrueIce!({ mech: output.spread!(), ice: output.trueIce!() })
            : output.spreadFakeIce!({ mech: output.spread!(), ice: output.fakeIce!() });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isIceTrue
            ? output.stackTrueIce!({ mech: output.stack!(), ice: output.trueIce!() })
            : output.stackFakeIce!({ mech: output.stack!(), ice: output.fakeIce!() });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Ice and Thunder',
      // Set 2: Only Ice and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isIceTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        if (data.isThunderTrue) {
          return data.isIceTrue
            ? output.trueIceTrueThunder!({
              ice: output.trueIce!(),
              thunder: output.trueThunder!(),
            })
            : output.fakeIceTrueThunder!({
              ice: output.fakeIce!(),
              thunder: output.trueThunder!(),
            });
        }
        return data.isIceTrue
          ? output.trueIceTrueThunder!({
            ice: output.trueIce!(),
            thunder: output.fakeThunder!(),
          })
          : output.fakeIceFakeThunder!({
            ice: output.fakeIce!(),
            thunder: output.fakeThunder!(),
          });
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Fire and Thunder',
      // Set 2: Only Ice and Thunder should be set
      type: 'StartsUsing',
      netRegex: { id: 'BA94', source: 'Kefka', capture: false },
      condition: (data) => {
        return data.isFireTrue !== undefined && data.isThunderTrue !== undefined;
      },
      infoText: (data, _matches, output) => {
        const fireMarker = data.fireMarker;
        if (
          (fireMarker === headMarkerData['dorito'] && data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && !data.isFireTrue)
        )
          return data.isThunderTrue
            ? output.spreadTrueThunder!({
              mech: output.spread!(),
              thunder: output.trueThunder!(),
            })
            : output.spreadFakeThunder!({
              mech: output.spread!(),
              thunder: output.fakeThunder!(),
            });

        if (
          (fireMarker === headMarkerData['dorito'] && !data.isFireTrue) ||
          (fireMarker === headMarkerData['stack'] && data.isFireTrue)
        ) {
          return data.isThunderTrue
            ? output.stackTrueThunder!({
              mech: output.stack!(),
              thunder: output.trueThunder!(),
            })
            : output.stackFakeThunder!({
              mech: output.stack!(),
              thunder: output.fakeThunder!(),
            });
        }
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Cleanup',
      // C622 Light of Judgment to reset for the Graven Image 2
      type: 'StartsUsing',
      netRegex: { id: ['BA94', 'C622'], source: 'Kefka', capture: false },
      run: (data) => {
        delete data.isFireTrue;
        delete data.isIceTrue;
        delete data.isThunderTrue;
        delete data.fireMarker;
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap Collect',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => data.doubleTroubleTrapTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Double-trouble Trap Early',
      // Times are 5s, 68s, and 49s
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set
        if (parseFloat(matches.duration) < 6)
          return;
        const target1 = data.doubleTroubleTrapTargets[0];
        if (data.doubleTroubleTrapTargets.length === 2) {
          const target2 = data.doubleTroubleTrapTargets[1];

          if (target1 === data.me)
            return output.trapOnYouPlayer!({
              player: data.party.member(target1),
            });

          if (target2 === data.me)
            return output.trapOnYouPlayer!({
              player: data.party.member(target2),
            });

          return output.trapOnPlayers!({
            player1: data.party.member(target1),
            player2: data.party.member(target2),
          });
        }

        if (target1 === data.me)
          return output.trapOnYou!();
        return output.trapOnPlayer!({
          player: data.party.member(target1),
        });
      },
      outputStrings: {
        trapOnYou: {
          en: 'Trap on YOU (later)',
        },
        trapOnYouPlayer: {
          en: 'Traps on YOU, ${player} (later)',
        },
        trapOnPlayer: {
          en: 'Trap on ${player} (later)',
        },
        trapOnPlayers: {
          en: 'Traps on ${player1}, ${player2} (later)',
        },
      },
    },
    {
      id: 'DMU P1 Double-trouble Trap',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: (_data, matches) => {
        const duration = parseFloat(matches.duration);
        // Giving a 5s warning
        // Second Set
        if (duration > 67)
          return 63;

        // Last set
        if (duration > 48)
          return 44;

        // First set
        return 0.1;
      },
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          trapOnYou: {
            en: 'Trap on YOU',
          },
          trapOnYouPlayer: {
            en: 'Traps on YOU, ${player}',
          },
          trapOnPlayer: {
            en: 'Trap on ${player}',
          },
          trapOnPlayers: {
            en: 'Traps on ${player1}, ${player2}',
          },
        };

        const target1 = data.doubleTroubleTrapTargets[0];
        if (data.doubleTroubleTrapTargets.length === 2) {
          const target2 = data.doubleTroubleTrapTargets[1];

          if (target1 === data.me)
            return {
              alertText: output.trapOnYouPlayer!({
                player: data.party.member(target1),
              }),
            };

          if (target2 === data.me)
            return {
              alertText: output.trapOnYouPlayer!({
                player: data.party.member(target2),
              }),
            };

          return {
            infoText: output.trapOnPlayers!({
              player1: data.party.member(target1),
              player2: data.party.member(target2),
            }),
          };
        }

        if (target1 === data.me)
          return { alertText: output.trapOnYou!() };
        return {
          infoText: output.trapOnPlayer!({
            player: data.party.member(target1),
          }),
        };
      },
    },
    {
      // Debuffs should expire before the new ones come out
      id: 'DMU P1 Double-trouble Trap Cleanup',
      type: 'LosesEffect',
      netRegex: { effectId: '13D6', capture: false },
      suppressSeconds: 1,
      run: (data) => data.doubleTroubleTrapTargets = [],
    },
    {
      id: 'DMU P1 Light of Judgment',
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: false },
      response: Responses.bigAoe(),
    },
    {
      id: 'DMU P1 Hyperdrive',
      // This hits three times
      // Occurs 3.1s after C622 Light of Judgment, which is a 5s cast
      type: 'StartsUsing',
      netRegex: { id: 'C622', source: 'Kefka', capture: true },
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 2, // Result in ~5.1s warning
      response: Responses.tankBuster(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Future\'s End/Past\'s End': 'Future/Past\'s End',
      },
    },
  ],
};

export default triggerSet;
