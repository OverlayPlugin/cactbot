import Conditions from '../../../../../resources/conditions';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TO DO:
// * Sync (swords & knockaround phases) - call safe tile(s)
// * Forged Track + Fiery/Stormy Edge - call knockback dir/safe lanes
// * Yellow (Titan) spread markers - maybe better call than 'spread', possibly based on phase?
// * Knockaround phase - call out whether to jump or stay for Forward Edge/Backward Edge?
// * Knockaround phase - call whether to jump or stay to break chains?

type Phase = 'arena' | 'swords' | 'lines' | 'knockaround';
export interface Data extends RaidbossData {
  phase: Phase;
  drumTargets: string[];
  halfCircuitSafeSide?: 'left' | 'right';
  seenHalfCircuit: boolean;
}

const triggerSet: TriggerSet<Data> = {
  id: 'EverkeepExtreme',
  zoneId: ZoneId.EverkeepExtreme,
  timelineFile: 'zoraal-ja-ex.txt',
  initData: () => {
    return {
      phase: 'arena',
      drumTargets: [],
      seenHalfCircuit: false,
    };
  },
  triggers: [
    {
      id: 'Zoraal Ja Ex Phase Tracker',
      type: 'StartsUsing',
      // 9397 - Dawn of an Age
      // 938F - Drum of Vollok
      // 938A - Projection of Triumph
      // 93A2 - Multidirectional Divide (needed to reset to arena phase before enrage)
      netRegex: { id: ['9397', '938F', '938A', '93A2'], source: 'Zoraal Ja' },
      run: (data, matches) => {
        // Knockaround is preceded by a 'Dawn of an Age' cast, but catching 'Drum of Vollok'
        // allows us to detect phase correctly.
        if (matches.id === '9397')
          data.phase = 'swords';
        else if (matches.id === '938F')
          data.phase = 'knockaround';
        else if (matches.id === '938A')
          data.phase = 'lines';
        else
          data.phase = 'arena';
      },
    },
    {
      id: 'Zoraal Ja Ex Actualize',
      type: 'StartsUsing',
      netRegex: { id: '9398', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      // Right sword glowing (right safe)
      id: 'Zoraal Ja Ex Forward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937B', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.frontRight!(),
      outputStrings: {
        frontRight: {
          en: 'Front + Boss\'s Right',
        },
      },
    },
    {
      // Left sword glowing (left safe)
      id: 'Zoraal Ja Ex Forward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937C', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.frontLeft!(),
      outputStrings: {
        frontLeft: {
          en: 'Front + Boss\'s Left',
        },
      },
    },
    {
      // Right sword glowing (left safe)
      id: 'Zoraal Ja Ex Backward Half Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '937D', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.backRight!(),
      outputStrings: {
        backRight: {
          en: 'Behind + Boss\'s Left',
        },
      },
    },
    {
      // Left sword glowing (right safe)
      id: 'Zoraal Ja Ex Backward Half Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '937E', source: 'Zoraal Ja', capture: false },
      alertText: (_data, _matches, output) => output.backLeft!(),
      outputStrings: {
        backLeft: {
          en: 'Behind + Boss\'s Right',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Regicidal Rage',
      type: 'StartsUsing',
      netRegex: { id: '993B', source: 'Zoraal Ja', capture: false },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tetherBuster: {
            en: 'Tank Tethers',
            de: 'Tank-Verbindungen',
            fr: 'Liens Tank',
            ja: 'タンク線取り',
            cn: '坦克截线',
            ko: '탱커가 선 가로채기',
          },
          busterAvoid: {
            en: 'Avoid Tank Tethers',
          },
        };

        if (data.role === 'tank')
          return { alertText: output.tetherBuster!() };
        return { infoText: output.busterAvoid!() };
      },
    },
    {
      id: 'Zoraal Ja Ex Dawn of an Age',
      type: 'StartsUsing',
      netRegex: { id: '9397', source: 'Zoraal Ja', capture: false },
      response: Responses.aoe(),
    },
    {
      id: 'Zoraal Ja Ex Sync',
      type: 'Ability',
      netRegex: { id: '9359', source: 'Zoraal Ja', capture: false },
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Avoid Swords',
        },
      },
    },
    // Use explicit output rather than Outputs.left/Outputs.right for these triggers
    // Boss likes to jump & rotate, so pure 'left'/'right' can be misleading
    // Only use these two triggers during swords1 and Might of Vollok in lines2
    // All other phases/uses use other triggers.
    {
      id: 'Zoraal Ja Ex Half Full Right Sword',
      type: 'StartsUsing',
      netRegex: { id: '9368', source: 'Zoraal Ja', capture: false },
      condition: (data) => data.phase === 'swords' || data.seenHalfCircuit,
      alertText: (_data, _matches, output) => output.rightSword!(),
      outputStrings: {
        rightSword: {
          en: 'Boss\'s Left',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Half Full Left Sword',
      type: 'StartsUsing',
      netRegex: { id: '9369', source: 'Zoraal Ja', capture: false },
      condition: (data) => data.phase === 'swords' || data.seenHalfCircuit,
      alertText: (_data, _matches, output) => output.leftSword!(),
      outputStrings: {
        leftSword: {
          en: 'Boss\'s Right',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Bitter Whirlwind',
      type: 'StartsUsing',
      netRegex: { id: '993E', source: 'Zoraal Ja' },
      response: Responses.tankBuster(),
    },
    {
      id: 'Zoraal Ja Ex Drum of Vollok Collect',
      type: 'StartsUsing',
      netRegex: { id: '938F', source: 'Zoraal Ja' },
      run: (data, matches) => data.drumTargets.push(matches.target),
    },
    {
      id: 'Zoraal Ja Ex Drum of Vollok',
      type: 'StartsUsing',
      netRegex: { id: '938F', source: 'Zoraal Ja', capture: false },
      delaySeconds: 1,
      suppressSeconds: 1,
      alertText: (data, _matches, output) => {
        if (data.drumTargets.includes(data.me))
          return output.enumOnYou!();
        return output.enumKnockback!();
      },
      run: (data) => data.drumTargets = [],
      outputStrings: {
        enumOnYou: {
          en: 'Partner stack (on you)',
        },
        enumKnockback: {
          en: 'Partner stack (knockback)',
        },
      },
    },
    {
      id: 'Zoraal Ja Ex Spread Markers',
      type: 'HeadMarker',
      netRegex: { id: '00B9' },
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.safeSpread!(),
      outputStrings: {
        safeSpread: Outputs.spread,
      },
    },
    {
      id: 'Zoraal Ja Ex Duty\'s Edge',
      type: 'StartsUsing',
      netRegex: { id: '9374', source: 'Zoraal Ja', capture: false },
      response: Responses.stackMarker(),
    },
    {
      id: 'Zoraal Ja Ex Burning Chains',
      type: 'Ability',
      netRegex: { id: '9395', source: 'Zoraal Ja', capture: false },
      response: Responses.breakChains(),
    },
    {
      id: 'Zoraal Ja Ex Half Circuit Left/Right Collect',
      type: 'StartsUsing',
      // 936B - Right Sword (left safe)
      // 936C - Left Sword (right safe)
      netRegex: { id: ['936B', '936C'], source: 'Zoraal Ja' },
      run: (data, matches) => data.halfCircuitSafeSide = matches.id === '936B' ? 'left' : 'right',
    },
    {
      id: 'Zoraal Ja Ex Half Circuit',
      type: 'StartsUsing',
      // 93A0 - Swords Out (in safe)
      // 93A1 - Swords In (out safe)
      netRegex: { id: ['93A0', '93A1'], source: 'Zoraal Ja' },
      delaySeconds: 0.3, // let Left/Right Collect run first
      alertText: (data, matches, output) => {
        const inOut = matches.id === '93A0' ? output.in!() : output.out!();
        if (data.halfCircuitSafeSide === undefined)
          return inOut;
        return output.combo!({ inOut: inOut, side: output[data.halfCircuitSafeSide]!() });
      },
      run: (data) => data.seenHalfCircuit = true,
      outputStrings: {
        left: {
          en: 'Boss\'s Left',
        },
        right: {
          en: 'Boss\'s Right',
        },
        in: Outputs.in,
        out: Outputs.out,
        combo: {
          en: '${inOut} + ${side}',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Forward Edge/Backward Edge': 'Forward/Backward Edge',
        'Fiery Edge/Stormy Edge': 'Fiery/Stormy Edge',
        'Siege of Vollok/Walls of Vollok': 'Siege/Walls of Vollok',
      },
    },
  ],
};

export default triggerSet;
