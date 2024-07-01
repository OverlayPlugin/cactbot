import { assert } from 'chai';

import Regexes, { buildRegex } from '../../resources/regexes';
import examples, { ExampleLineName } from '../../util/example_log_lines';
import { RegexTestUtil, RegexUtilParams } from '../helper/regex_util';

const logDefsToTest = Object.keys(examples) as ExampleLineName[];

describe('regex tests', () => {
  // Most logdefs can now be tested by calling `buildRegex` directly without needing to call
  // a method on `Regexes`. However, certain methods should continue to be tested with
  // specific unit tests to preserve backwards compatibility.

  it('addedCombatant and addedCombatantFull use the same regex', () => {
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(buildRegex('AddedCombatant').source, Regexes.addedCombatantFull().source);
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(Regexes.addedCombatant().source, Regexes.addedCombatantFull().source);
  });

  it('ability and abilityFull use the same regex', () => {
    /* eslint-disable-next-line deprecation/deprecation */
    assert.equal(Regexes.ability().source, Regexes.abilityFull().source);
  });

  it('statusEffectExplicit and StatusEffect use the same regex', () => {
    assert.equal(buildRegex('StatusEffect').source, Regexes.statusEffectExplicit().source);
  });

  logDefsToTest.forEach((type) => {
    it(type, () => {
      const baseFunc = (params?: RegexUtilParams) => buildRegex(type, params);
      const Helper = new RegexTestUtil(type, examples[type], baseFunc, true);
      Helper.run();

      if (type === 'Ability')
        it('Ability regex does not overmatch', () => {
          // Tests a bug where a :1E: later in the line would be caught by overzealous
          // matchers on source names.
          // TODO: Preserved for historical reasons - maybe remove?
          const testLine =
            '[20:29:39.392] ActionEffect 15:107B9AC8:Tako Yaki:07:Attack:40017D58:Daxio:710003:DC0000:1E:50000:1C:1B60000:550003:2CA000:0:0:0:0:0:0:0:0:8207:24837:7230:7230:0:1000:527.5806:-362.7833:-19.61513:2.898741:8998:8998:10000:10000:0:1000:528.6487:-365.8656:-22.08109:-0.3377206:000AD7BF:0:1';
          Helper.captureTest((params?: RegexUtilParams) => Regexes.ability(params), [testLine]);
          const abilityHallowed = Regexes.ability({ id: '1E' });
          assert.isNull(testLine.match(abilityHallowed));
        });
    });
  });
});
