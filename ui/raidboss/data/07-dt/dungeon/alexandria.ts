import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Improve the Purge sequence calls to be actively timed.
// TODO: Handle overlaps between Purge and Immune Response

// TODO: Determine which direction the SuperCell Matrix triangle is facing.
// TODO: Math out the positions of the Supercell Matrix lasers and directly call safe lanes.

// TODO: Better handle overlap between Terminate and other AoEs.

export interface Data extends RaidbossData {
  interferonCalls: string[];
  disinfectTarget?: string;
}

const triggerSet: TriggerSet<Data> = {
  id: 'Alexandria',
  zoneId: ZoneId.Alexandria,
  timelineFile: 'alexandria.txt',
  initData: () => {
    return {
      interferonCalls: [],
    };
  },
  triggers: [
    {
      id: 'Alexandria AntivirusX Immune Response Front',
      type: 'StartsUsing',
      netRegex: { id: '8E1A', source: 'Antivirus X', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Alexandria AntivirusX Immune Response Back',
      type: 'StartsUsing',
      netRegex: { id: '8E1C', source: 'Antivirus X', capture: false },
      response: Responses.goFront(),
    },
    {
      id: 'Alexandria AntivirusX Interferon Collect',
      type: 'AddedCombatant',
      netRegex: { name: ['Interferon C', 'Interferon R'] },
      run: (data, matches, output) => {
        const call = matches.name === 'Interferon C' ? output.avoid!() : output.in!();
        data.interferonCalls.push(call);
      },
      outputStrings: {
        avoid: {
          en: 'Avoid',
          ko: '피하기',
        },
        in: Outputs.in,
      },
    },
    {
      id: 'Alexandria AntivirusX Interferon Call',
      type: 'AddedCombatant',
      netRegex: { name: ['Interferon C', 'Interferon R'], capture: false },
      delaySeconds: 0.5,
      durationSeconds: 15,
      infoText: (data, _matches, output) => {
        if (data.interferonCalls.length !== 5)
          return;
        return output.combo!({ calls: data.interferonCalls.join(output.separator!()) });
      },
      run: (data) => {
        if (data.interferonCalls.length === 5) {
          data.interferonCalls = [];
        }
      },
      outputStrings: {
        combo: {
          en: '${calls}',
          ko: '${calls}',
        },
        separator: {
          en: ' => ',
          ko: ' => ',
        },
      },
    },
    {
      id: 'Alexandria AntivirusX Disinfection',
      type: 'HeadMarker',
      netRegex: { id: '0158' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.spreadDontStack!(),
      run: (data, matches) => data.disinfectTarget = matches.target,
      outputStrings: {
        spreadDontStack: {
          en: 'Cleave -- Don\'t stack!',
          ko: '광역 탱버 -- 쉐어 맞지 말기',
        },
      },
    },
    {
      id: 'Alexandria AntivirusX Quarantine',
      type: 'HeadMarker',
      netRegex: { id: '003E' },
      condition: (data) => data.me !== data.disinfectTarget,
      delaySeconds: 0.5,
      response: Responses.stackMarkerOn(),
      run: (data) => delete data.disinfectTarget,
    },
    {
      id: 'Alexandria AntivirusX Cytolysis',
      type: 'StartsUsing',
      netRegex: { id: '8E23', source: 'Antivirus X', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Electrowave',
      type: 'StartsUsing',
      netRegex: { id: '8DF1', source: 'Amalgam', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Disassembly',
      type: 'StartsUsing',
      netRegex: { id: '8DE3', source: 'Amalgam', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Amalgam Supercell Matrix Triangle',
      type: 'StartsUsing',
      netRegex: { id: '98E0', source: 'Amalgam', capture: false },
      alertText: (_data, _matches, output) => output.avoidLightning!(),
      outputStrings: {
        avoidLightning: {
          en: 'Out of lightning triangle',
          ko: '삼각형 밖으로',
        },
      },
    },
    {
      id: 'Alexandria Amalgam Supercell Matrix Lasers',
      type: 'StartsUsing',
      netRegex: { id: '98E2', source: 'Amalgam', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.avoidLasers!(),
      outputStrings: {
        avoidLasers: {
          en: 'Avoid Wall Lasers',
          ko: '벽 레이저 피하기',
        },
      },
    },
    {
      id: 'Alexandria Amalgam Centralized Current',
      type: 'StartsUsing',
      netRegex: { id: '8DE7', source: 'Amalgam', capture: false },
      response: Responses.goSides(),
    },
    {
      id: 'Alexandria Amalgam Split Current',
      type: 'StartsUsing',
      netRegex: { id: '8DEB', source: 'Amalgam', capture: false },
      response: Responses.goMiddle(),
    },
    {
      id: 'Alexandria Amalgam Static Spark',
      type: 'HeadMarker',
      netRegex: { id: '008B' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Alexandria Amalgam Amalgamight',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Alexandria Amalgam Superbolt',
      type: 'HeadMarker',
      netRegex: { id: '00A1' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Amalgam Ternary Charge',
      type: 'StartsUsing',
      netRegex: { id: '9955', source: 'Amalgam', capture: false },
      response: Responses.getOutThenIn(),
    },
    {
      id: 'Alexandria Eliminator Disruption',
      type: 'StartsUsing',
      netRegex: { id: '8F9D', source: 'Eliminator', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Eliminator Partition Left',
      type: 'StartsUsing',
      netRegex: { id: '9951', source: 'Eliminator', capture: false },
      response: Responses.goRight(),
    },
    {
      // It's not clear why, but there's a specific Partition 985F that's used for the
      // initial Partition cast and then never again.
      // All subsequent right-cleave Partitions use 9946.
      id: 'Alexandria Eliminator Partition Right',
      type: 'StartsUsing',
      netRegex: { id: ['985F', '9946'], source: 'Eliminator', capture: false },
      response: Responses.goLeft(),
    },
    {
      id: 'Alexandria Eliminator Terminate',
      type: 'StartsUsing',
      netRegex: { id: '9ABF', source: 'Eliminator', capture: false },
      alertText: (_data, _matches, output) => output.avoidHand!(),
      outputStrings: {
        avoidHand: {
          en: 'Avoid hand laser',
          ko: '손이 쏘는 레이저 피하기',
        },
      },
    },
    {
      id: 'Alexandria Eliminator Halo of Destruction',
      type: 'StartsUsing',
      netRegex: { id: '9AC0', source: 'Eliminator', capture: false },
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.underElimbit!(),
      outputStrings: {
        underElimbit: {
          en: 'Get under Elimbit',
          ko: '비트 밑으로',
        },
      },
    },
    {
      id: 'Alexandria Eliminator Electray',
      type: 'HeadMarker',
      netRegex: { id: '00DA' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      // This is a stack laser visual, but there is no associated 27 line,
      // and this 21 line on a single target seems to stand in for it.
      id: 'Alexandria Eliminator Overexposure',
      type: 'Ability',
      netRegex: { id: '8FAA', source: 'Eliminator' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Eliminator Holo Ark',
      type: 'Ability',
      netRegex: { id: '8FB5', source: 'Eliminator', capture: false },
      delaySeconds: 5, // This is a wind-up, actual damage is 10s later on 8FB6.
      response: Responses.aoe(),
    },
    {
      id: 'Alexandria Eliminator Impact',
      type: 'StartsUsing',
      netRegex: { id: '8FBA', source: 'Eliminator', capture: false },
      response: Responses.knockback(),
    },
    {
      id: 'Alexandria Eliminator Light Of Salvation',
      type: 'HeadMarker',
      netRegex: { id: '0216' },
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      // This is a stack laser visual, but there is no associated 27 line,
      // and this 21 line on a single target seems to stand in for it.
      id: 'Alexandria Eliminator Light Of Devotion',
      type: 'Ability',
      netRegex: { id: '8FB2', source: 'Eliminator' },
      response: Responses.stackMarkerOn(),
    },
    {
      id: 'Alexandria Eliminator Elimination',
      type: 'StartsUsing',
      netRegex: { id: '8FBB', source: 'Eliminator', capture: false },
      alertText: (_data, _matches, output) => output.dodgeLasers!(),
      outputStrings: {
        dodgeLasers: {
          en: 'Dodge Multiple Lasers',
          ko: '다중 레이저 피하기',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Centralized Current/Split Current': 'Centralized/Split Current',
        'Pathocircuit Purge/Pathocross Purge': 'Purge',
      },
    },
  ],
};

export default triggerSet;
