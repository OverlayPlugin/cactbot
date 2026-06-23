import { assert } from 'chai';

import Outputs from '../../resources/outputs';
import {
  builtInResponseStr,
  combineLocaleText,
  compose,
  Responses,
  severityList,
  severityMap,
  triggerFunctions,
} from '../../resources/responses';
import { RaidbossData } from '../../types/data';
import { Matches } from '../../types/net_matches';
import {
  LocaleText,
  Output,
  OutputStrings,
  ResponseFunc,
  ResponseOutput,
} from '../../types/trigger';

// test_trigger.js will validate the field names, so no need to do that here.

const outputStringSetterStr = 'output.responseOutputStrings = ';

type ResponseFuncOutput =
  | ResponseOutput<RaidbossData, Matches>
  | ResponseFunc<RaidbossData, Matches>;

const runResponseFunc = (
  func: (data: RaidbossData, matches: Matches, output: Output) => ResponseFuncOutput,
): ResponseFuncOutput => {
  // Built-in responses must be callable with empty parameters.
  const empty = {};
  return func(empty as RaidbossData, empty as Matches, empty as Output);
};

const runResponseFuncWithOutputStrings = (
  func: ResponseFunc<RaidbossData, Matches>,
): [ResponseFuncOutput, OutputStrings] => {
  const empty = {};
  const output: { responseOutputStrings: OutputStrings } = {
    responseOutputStrings: {},
  };
  return [
    func(empty as RaidbossData, empty as Matches, output as Output),
    output.responseOutputStrings,
  ];
};

describe('response tests', () => {
  it('responses with default severity are valid', () => {
    for (const responseFunc of Object.values(Responses)) {
      let result: ResponseFuncOutput = responseFunc();
      if (typeof result === 'function') {
        assert.include(result.toString(), outputStringSetterStr);
        assert.include(result.toString(), builtInResponseStr);
        result = runResponseFunc(result);
      }

      assert.isObject(result);
      if (typeof result !== 'object')
        return;

      // Must only include valid keys.
      assert.includeMembers(triggerFunctions, Object.keys(result));
      // Must have at least one valid field.
      assert.isNotEmpty(result);
    }
  });
  it('responses with a single explicit severity are valid', () => {
    for (const responseFunc of Object.values(Responses)) {
      // Every function accepts as a single arg one of the keys from severityMap.
      // If passed, it then that text must appear.  e.g. 'info' must create 'infoText'.
      for (const sev of severityList) {
        let result: ResponseFuncOutput = responseFunc(sev);
        if (typeof result === 'function') {
          assert.include(result.toString(), outputStringSetterStr);
          assert.include(result.toString(), builtInResponseStr);
          result = runResponseFunc(result);
        }
        assert.isObject(result);
        if (typeof result !== 'object')
          return;

        const keys = Object.keys(result);
        // Must only include valid keys.
        assert.includeMembers(triggerFunctions, keys);

        // Must include the request severity text.
        // TODO: If we ever have something that is like tts only,
        // then this will need some sort of allow/deny list.
        assert.property(result, severityMap[sev]);
      }
    }
  });
  it('responses with a double explicit severities are valid', () => {
    // TODO: we could figure out which has multiple parameters programmatically.
    const doubleFuncs: (keyof typeof Responses)[] = [
      'sharedTankBuster',
      'tankBuster',
      'tankBusterSwap',
      'knockbackOn',
      'preyOn',
    ];

    for (const doubleFunc of doubleFuncs) {
      for (const sev1 of severityList) {
        for (const sev2 of severityList) {
          let result: ResponseFuncOutput = Responses[doubleFunc](sev1, sev2);
          if (typeof result === 'function') {
            assert.include(result.toString(), outputStringSetterStr);
            assert.include(result.toString(), builtInResponseStr);
            result = runResponseFunc(result);
          }
          assert.isObject(result);
          if (typeof result !== 'object')
            return;

          // Must only include valid keys.
          assert.includeMembers(triggerFunctions, Object.keys(result));

          // Must include the requested severity texts.
          assert.property(result, severityMap[sev1]);
          assert.property(result, severityMap[sev2]);
        }
      }
    }
  });
  it('combineLocaleText combines localized text with fallbacks', () => {
    const fallbackText: LocaleText = {
      en: 'Fallback',
      ja: 'Japanese Fallback',
    };

    assert.deepEqual(
      combineLocaleText(
        Outputs.in,
        [' => ', Outputs.out],
        [' + ', fallbackText],
      ),
      {
        en: 'In => Out + Fallback',
        de: 'Rein => Raus + Fallback',
        fr: 'Intérieur => Extérieur + Fallback',
        ja: '中へ => 外へ + Japanese Fallback',
        cn: '靠近 => 远离 + Fallback',
        ko: '안으로 => 밖으로 + Fallback',
        tc: '靠近 => 遠離 + Fallback',
      },
    );
  });
  it('compose returns a built-in static response', () => {
    const responseFunc = compose(Outputs.in, [' => ', Outputs.out])();
    assert.include(responseFunc.toString(), outputStringSetterStr);
    assert.include(responseFunc.toString(), builtInResponseStr);

    const [result, outputStrings] = runResponseFuncWithOutputStrings(responseFunc);
    assert.isObject(result);
    assert.property(result, 'infoText');
    assert.deepEqual(outputStrings.text, {
      en: 'In => Out',
      de: 'Rein => Raus',
      fr: 'Intérieur => Extérieur',
      ja: '中へ => 外へ',
      cn: '靠近 => 远离',
      ko: '안으로 => 밖으로',
      tc: '靠近 => 遠離',
    });
  });
  it('compose respects explicit severity and locale fallbacks', () => {
    const fallbackText: LocaleText = {
      en: 'Fallback',
      ja: 'Japanese Fallback',
    };
    const responseFunc = compose(Outputs.spread, [' 😗 ', fallbackText])('alarm');

    const [result, outputStrings] = runResponseFuncWithOutputStrings(responseFunc);
    assert.isObject(result);
    assert.property(result, 'alarmText');
    assert.deepEqual(outputStrings.text, {
      en: 'Spread 😗 Fallback',
      de: 'Verteilen 😗 Fallback',
      fr: 'Dispersez-vous 😗 Fallback',
      ja: 'さんかい 😗 Japanese Fallback',
      cn: '分散 😗 Fallback',
      ko: '산개 😗 Fallback',
      tc: '分散 😗 Fallback',
    });
  });
  it('compose combines multiple pieces', () => {
    const responseFunc = compose(
      Outputs.in,
      [' => ', Outputs.out],
      [' + ', Outputs.spread],
    )('alert');

    const [result, outputStrings] = runResponseFuncWithOutputStrings(responseFunc);
    assert.isObject(result);
    assert.property(result, 'alertText');
    assert.deepEqual(outputStrings.text, {
      en: 'In => Out + Spread',
      de: 'Rein => Raus + Verteilen',
      fr: 'Intérieur => Extérieur + Dispersez-vous',
      ja: '中へ => 外へ + さんかい',
      cn: '靠近 => 远离 + 分散',
      ko: '안으로 => 밖으로 + 산개',
      tc: '靠近 => 遠離 + 分散',
    });
  });
});
