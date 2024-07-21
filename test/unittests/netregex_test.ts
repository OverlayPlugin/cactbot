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

  logDefsToTest.forEach((type) => {
    it(type, () => {
      const baseFunc = (params?: RegexUtilParams) => buildRegex(type, params);
      const Helper = new RegexTestUtil(type, examples[type], baseFunc, false);
      Helper.run();
    });
  });
});
