import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { OutputStrings, TriggerSet } from '../../../../../types/trigger';

// TODO: P1 Tethers
// TODO: P1 Halfroom Cleaves
// TODO: P1 Replace Mystery Magic Ice Only with tether combination
// TODO: P1 Tele-Portent configuration options

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
  myTelePortent1?: 'up' | 'down' | 'right' | 'left';
  myTelePortent2?: 'up' | 'down' | 'right' | 'left';
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

const trapEarlyOutputStrings: OutputStrings = {
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
};

const trapOutputStrings: OutputStrings = {
  trapOnYou: {
    en: 'Trap on YOU ',
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

const triggerSet: TriggerSet<Data> = {
  id: 'DancingMadUltimate',
  zoneId: ZoneId.DancingMadUltimate,
  timelineFile: 'dancing_mad.txt',
  initData: () => {
    return {
      phase: 'p1',
      // Phase 1
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
      id: 'DMU P1 Mystery Magic Ice Only',
      // Occurs between Set 2 and Set 3
      // BA95 Blizzard Blowout III cast
      type: 'StartsUsing',
      netRegex: { id: 'BA95', source: 'Kefka', capture: false },
      condition: (data) => {
        if (
          data.isIceTrue !== undefined &&
          data.isThunderTrue === undefined &&
          data.isFireTrue === undefined
        )
        return true;
      },
      infoText: (data, _matches, output) => {
        return data.isIceTrue
          ? output.trueIce!()
          : output.fakeIce!();
      },
      outputStrings: mysteryMagicOutputStrings,
    },
    {
      id: 'DMU P1 Mystery Magic Fire and Thunder',
      // Set 3: Only Fire and Thunder should be set
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
      // Times are 5s, 68s, and 49s
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      run: (data, matches) => data.doubleTroubleTrapTargets.push(matches.target),
    },
    {
      id: 'DMU P1 Double-trouble Trap 2 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        // Ignore first set and third set
        if (parseFloat(matches.duration) < 67)
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
      outputStrings: trapEarlyOutputStrings,
    },
    {
      id: 'DMU P1 Double-trouble Trap 3 Early',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      delaySeconds: 0.1,
      suppressSeconds: 1,
      infoText: (data, matches, output) => {
        const duration = parseFloat(matches.duration);
        // Only capture 3rd set
        if (duration < 48 || duration > 50)
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
      outputStrings: trapEarlyOutputStrings,
    },
    {
      id: 'DMU P1 Double-trouble Trap 1',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) < 6,
      delaySeconds: 0.1,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

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
      id: 'DMU P1 Double-trouble Trap 2',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => parseFloat(matches.duration) > 67,
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

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
      id: 'DMU P1 Double-trouble Trap 3',
      type: 'GainsEffect',
      netRegex: { effectId: '13D6', capture: true },
      condition: (_data, matches) => {
        const duration = parseFloat(matches.duration);
        return duration > 48 && duration < 50;
      },
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 5,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = trapOutputStrings;

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
    {
      id: 'DMU P1 Tele-Portent Collect',
      // Debuffs distributed to 8 players:
      // Players with 2 of the same are always:
      // 130F Left  (7s) + 130F Left  (10s)
      // 130E Right (7s) + 130E Right (10s)
      // 130D Down  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 130C Up    (10s)
      //
      // The remaining players may have differing patterns:
      // Pattern 1:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 13D8 Down  (7s) + 130E Right (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 2:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 13D7 Up    (7s) + 130F Left  (10s)
      //
      // Pattern 3:
      // 130D Down  (7s) + 13DA Left  (10s)
      // 13D9 Right (7s) + 130C Up    (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Pattern 4:
      // 13DA Left  (7s) + 130D Down  (10s)
      // 130C Up    (7s) + 13D9 Right (10s)
      // 130E Right (7s) + 13D8 Down  (10s)
      // 130F Left  (7s) + 13D7 Up    (10s)
      //
      // Possibly More?
      // Varying strategies to resolve
      // Players with the same arrows will get a 6s 503 Confused which causes them to target nearest players
      // Players with different arrows will cause a 6s 131E Sleep aoe
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      run: (data, matches) => {
        const effectMap: { [effectId: string]: typeof data.myTelePortent1 } = {
          '130C': 'up',
          '130D': 'down',
          '130E': 'right',
          '130F': 'left',
          '13D7': 'up',
          '13D8': 'down',
          '13D9': 'right',
          '13DA': 'left',
        };
        const duration = parseFloat(matches.duration);
        if (duration < 8) {
          data.myTelePortent1 = effectMap[matches.effectId];
          return;
        }
        data.myTelePortent2 = effectMap[matches.effectId];
      },
    },
    {
      id: 'DMU P1 Tele-Portents',
      type: 'GainsEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      durationSeconds: 7,
      infoText: (data, _matches, output) => {
        if (data.myTelePortent1 === undefined || data.myTelePortent2 === undefined)
          return;
        const portents = data.myTelePortent1 + data.myTelePortent2;
        return output[portents]!();
      },
      outputStrings: {
        upup: {
          en: 'Up Portents',
        },
        downdown: {
          en: 'Down Portents',
        },
        rightright: {
          en: 'Right Portents',
        },
        leftleft: {
          en: 'Left Portents',
        },
        downleft: {
          en: 'Down => Left Portent',
        },
        downright: {
          en: 'Down => Right Portent',
        },
        rightup: {
          en: 'Right => Up Portent',
        },
        rightdown: {
          en: 'Right => Down Portent',
        },
        leftup: {
          en: 'Left => Up Portent',
        },
        leftdown: {
          en: 'Left => Down Portent',
        },
        upright: {
          en: 'Up => Right Portent',
        },
        upleft: {
          en: 'Up => Left Portent',
        },
      },
    },
    {
      id: 'DMU P1 Tele-Portent 2',
      // Not enough time to have lengthy TTS, but could configure this to give direction instead of move
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: (data, matches) => {
        if (data.me === matches.target)
          if (data.myTelePortent1 !== undefined)
            return true;
        return false;
      },
      durationSeconds: 3,
      response: Responses.moveAway('alert'),
    },
    {
      id: 'DMU P1 Tele-Portent Cleanup',
      type: 'LosesEffect',
      netRegex: {
        effectId: [
          '130C', // Up
          '130D', // Down
          '130E', // Right
          '130F', // Left
          '13D7', // Up
          '13D8', // Down
          '13D9', // Right
          '13DA', // Left
        ],
        capture: true,
      },
      condition: Conditions.targetIsYou(),
      suppressSeconds: 1,
      run: (data) => {
        delete data.myTelePortent1;
        delete data.myTelePortent2;
      },
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
