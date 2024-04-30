import { assert } from 'chai';

import NetRegexes, { buildRegex } from '../../resources/netregexes';
import examples, { ExampleLineName } from '../../util/example_log_lines';
import { RegexTestUtil, RegexUtilParams } from '../helper/regex_util';

const logDefsToTest = Object.keys(examples) as ExampleLineName[];

describe('netregex tests', () => {
  // Most logdefs can now be tested by calling `buildRegex` directly without needing to call
  // a method on `NetRegexes`. However, certain methods should continue to be tested with
  // specific unit tests to preserve backwards compatibility.

  it('addedCombatant and addedCombatantFull use the same regex', () => {
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(buildRegex('AddedCombatant').source, NetRegexes.addedCombatantFull().source);
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(NetRegexes.addedCombatant().source, NetRegexes.addedCombatantFull().source);
  });

  it('ability and abilityFull use the same regex', () => {
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(NetRegexes.ability().source, NetRegexes.abilityFull().source);
  });

  it('statusEffectExplicit and StatusEffect use the same regex', () => {
    assert.equal(buildRegex('StatusEffect').source, NetRegexes.statusEffectExplicit().source);
  });

  it('NetworkAOEAbility', () => {
    // example_log_lines doesn't have specific examples of 0x16 lines, but they should be matched
    // by NetRegexes.ability(), so handle this test separately.
    const type = 'NetworkAOEAbility';
    const testLine =
      '22|2020-02-25T01:48:08.2910000-08:00|10FF0001|Tiny Poutini|3F40|Double Standard Finish|10FF0001|Tiny Poutini|50E|71D0000|E|7370000|0|0|0|0|0|0|0|0|0|0|0|0|111584|111584|6400|0|0|1000|99.59558|93.36987|0|0.005704641|111584|111584|6400|0|0|1000|99.59558|93.36987|0|0.005704641|000107FF|1|2|008aa08c35da1e426c6a06b366f40eb6';
    const fields = {
      type: '22',
      sourceId: '10FF0001',
      source: 'Tiny Poutini',
      id: '3F40',
      ability: 'Double Standard Finish',
      targetId: '10FF0001',
      target: 'Tiny Poutini',
      flags: '50E',
      x: '99.59558',
      y: '93.36987',
      z: '0',
      heading: '0.005704641',
    };

    const matches = testLine.match(NetRegexes.ability())?.groups;
    if (matches === undefined)
      assert.fail('actual', 'expected', `Could not capture fields via regex for '${type}'`);

    for (const field in fields) {
      assert.equal(matches[field], fields[field as keyof typeof fields]);
    }
  });

  logDefsToTest.forEach((type) => {
    it(type, () => {
      const baseFunc = (params?: RegexUtilParams) => buildRegex(type, params);
      const Helper = new RegexTestUtil(type, examples[type], baseFunc, false);
      Helper.run();
    });
  });
});
