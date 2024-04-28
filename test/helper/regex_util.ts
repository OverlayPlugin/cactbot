import { assert } from 'chai';

import {
  ExampleLineDef,
  ExampleLineName,
  ExampleLineNameWithRepeating,
  TestFields,
  UnitTest,
} from '../../resources/example_log_lines';
import logDefinitions from '../../resources/netlog_defs';
import { UnreachableCode } from '../../resources/not_reached';
import LogRepository from '../../ui/raidboss/emulator/data/network_log_converter/LogRepository';
import ParseLine from '../../ui/raidboss/emulator/data/network_log_converter/ParseLine';

// Quite bogus.
const bogusLine = 'using act is cheating';

export type RegexUtilParams = { [key: string]: string | boolean };

// An automated way to test standard regex functions that take a dictionary of fields.
// TODO: Move this `RegexTestUtil` when reworking the regex tests.
const regexCaptureTest = (
  func: (params?: RegexUtilParams) => RegExp,
  lines: readonly string[],
): void => {
  // regex should not match the bogus line.
  assert.isNull(func({}).exec(bogusLine));

  for (const line of lines) {
    // Undefined params (default capture).
    const undefinedParamsMatch = func().exec(line);
    assert.isNotNull(undefinedParamsMatch, `${func().toString()} did not match ${line}`);
    assert.notPropertyVal(undefinedParamsMatch, 'groups', undefined, func().source);

    // Empty params (default capture).
    const emptyParamsMatch = func({}).exec(line);
    assert.isNotNull(emptyParamsMatch, `${func({}).toString()} did not match ${line}`);
    assert.notPropertyVal(emptyParamsMatch, 'groups', undefined);

    // No capture match.
    const noCaptureMatch = func({ capture: false }).exec(line);
    assert.isNotNull(noCaptureMatch);
    assert.propertyVal(noCaptureMatch, 'groups', undefined);

    // Capture match.
    const captureMatch = func({ capture: true }).exec(line);
    assert.isNotNull(captureMatch);
    assert.notPropertyVal(captureMatch, 'groups', undefined);
    const captureGroups = captureMatch?.groups;
    assert.isObject(captureGroups);

    if (typeof captureGroups !== 'object')
      throw new UnreachableCode();

    // Capture always needs at least one thing.
    const keys = Object.keys(captureGroups);
    assert.isAbove(keys.length, 0);

    const explicitFields: RegexUtilParams = { capture: true };
    for (const key of keys) {
      // Because matched values may have special regex
      // characters in it, escape these when specifying.
      const value = captureGroups[key];
      let escaped = value;
      if (escaped !== undefined) {
        escaped = escaped.replace(/[.*+?^${}()]/g, '\\$&');
        explicitFields[key] = escaped;
      }
    }

    // Specifying all the fields explicitly and capturing should
    // both match, and return the same thing.
    // This verifies that input parameters to the regex fields and
    // named matching groups are equivalent.
    const explicitCaptureMatch = func(explicitFields).exec(line);
    assert.isNotNull(explicitCaptureMatch);
    assert.notPropertyVal(explicitCaptureMatch, 'groups', undefined);
    assert.isObject(explicitCaptureMatch?.groups);
    assert.deepEqual(explicitCaptureMatch?.groups, captureMatch?.groups);

    // Not capturing with explicit fields should also work.
    explicitFields.capture = false;
    const explicitNoCaptureMatch = func(explicitFields).exec(line);
    assert.isNotNull(explicitNoCaptureMatch);
    assert.propertyVal(explicitNoCaptureMatch, 'groups', undefined);
  }
};
export default regexCaptureTest;

type MatchFields = { [key: string]: string };

// Helper class used for both regex and netregex tests.
export class RegexTestUtil {
  private type: ExampleLineName;
  private lines: string[];
  private testData: ExampleLineDef<typeof this.type>;
  private baseFunc: (params?: RegexUtilParams) => RegExp;

  constructor(
    type: ExampleLineName,
    testData: ExampleLineDef<typeof type>,
    baseFunc: (params?: RegexUtilParams) => RegExp,
    logLineMode: boolean,
  ) {
    this.type = type;
    this.testData = testData;
    this.lines = [...testData.examples.en];
    this.baseFunc = baseFunc;
    if (logLineMode)
      this.convertToLogLines();
  }

  // Because TypeScript can't narrow `this` across methods, this helper also
  // functions as a typeguard for the calling method if needed.
  private hasRepeatingFields(type?: ExampleLineName): type is ExampleLineNameWithRepeating {
    return 'repeatingFields' in logDefinitions[type ?? this.type];
  }

  private convertToLogLines(): void {
    // Convert unitTest `type` field to hex
    let oldUnitTests = this.testData.unitTests;
    if (oldUnitTests === undefined)
      return;
    oldUnitTests = Array.isArray(oldUnitTests) ? oldUnitTests : [oldUnitTests];

    this.testData.unitTests = oldUnitTests.map((test) => {
      const type = parseInt(test.expectedValues.type ?? '');
      if (!isNaN(type)) {
        const newExpValues = {
          ...test.expectedValues,
          type: type.toString(16).padStart(2, '0').toUpperCase(),
        };
        return { ...test, expectedValues: newExpValues };
      }
      return test;
    });

    // Reformat example lines to match log line format
    const repo = new LogRepository();
    const newLines = this.lines.map((ll) => {
      const line = ParseLine.parse(repo, ll);
      if (!line)
        throw new UnreachableCode();
      return line.convertedLine;
    });
    this.lines = newLines;
  }


  // TODO: Temporary - replace with full func when reworking regex tests.
  private captureTest(func: (params?: RegexUtilParams) => RegExp, lines?: readonly string[]): void {
    // TODO: `regexCaptureTest` doesn't handle the repeating keys well,
    // so don't run it for those log lines
    if (!this.hasRepeatingFields())
      regexCaptureTest(func, lines ?? this.lines);
  }

  private extractFields(fields: TestFields<typeof this.type>): MatchFields {
    const extractedFields: MatchFields = {};

    // This approach works fine for extracting repeating keys from CombatantMemory
    // or other future logdef types where there is a key/value pair.
    // But if there are ever repeating fields that have more than a key/value pair,
    // this will need to be reworked.
    if (this.hasRepeatingFields(this.type)) {
      const fieldDefs = logDefinitions[this.type].repeatingFields;
      const label = fieldDefs.label;

      // if repeating fields are not defined in the unit test, that's weird but ok
      if (label in fields) {
        const keyName = logDefinitions[this.type].repeatingFields.primaryKey;
        const repFieldNames = logDefinitions[this.type].repeatingFields.names;

        type ValueName = Exclude<typeof repFieldNames[number], typeof keyName>;
        const remainingFields = repFieldNames.filter((f) => f !== keyName);
        if (remainingFields.length !== 1)
          assert.fail('actual', 'expected', `Invalid key/value names: too many repeating fields.`);
        const valueName = remainingFields[0] as ValueName;

        const pairs = fields[label] ?? [];
        pairs.forEach((pair) => {
          const fieldName = pair[keyName];
          const fieldValue = pair[valueName];
          if (Array.isArray(fieldName) || Array.isArray(fieldValue))
            assert.fail('actual', 'expected', `Invalid array for key/value pairs in unit tests.`);
          const matchField = `${label}${fieldName}`;
          extractedFields[matchField] = fieldValue;
        });
        delete fields[label]; // so we don't re-process it next
      }
    }

    for (const field in fields) {
      const value = fields[field as keyof typeof fields];
      if (value === undefined)
        assert.fail('actual', 'expected', `Invalid value for field '${field}'`);
      extractedFields[field] = value;
    }

    return extractedFields;
  }

  private doUnitTest(
    unitTest: UnitTest<typeof this.type>,
  ): void {
    // this.allFields = {};

    const idx = unitTest.indexToTest;
    const testLine = this.lines[idx];
    if (testLine === undefined)
      assert.fail('actual', 'expected', `Invalid index '${idx}' for unit testing`);

    // If an override is specified for a particular unit test, do a capture test
    // for that override first
    let unitTestRegex = this.baseFunc();
    const override = unitTest.regexOverride;
    if (override !== undefined && !this.hasRepeatingFields()) {
      this.captureTest(override, [testLine]);
      unitTestRegex = override();
    }

    const matches = testLine.match(unitTestRegex)?.groups;
    if (matches === undefined)
      assert.fail('actual', 'expected', `Could not capture fields for '${this.type}'`);

    const fields = this.extractFields(unitTest.expectedValues);

    let errStr = '';
    for (const field in fields) {
      const test = fields[field as keyof typeof fields];
      const match = matches[field];

      if (test === undefined)
        throw new UnreachableCode();
      else if (match === undefined)
        errStr += `\nMatch error: No field '${field}' was captured`;
      else if (test !== match)
        errStr += `\nMatch error: '${field}' expected '${test}' but got '${match}'`;
    }
    if (errStr !== '') {
      assert.isEmpty(errStr, `${errStr}\n`);
    }
  }

  public run(): void {
    this.captureTest(this.baseFunc, this.lines);

    let unitTests = this.testData.unitTests;
    if (unitTests === undefined)
      assert.fail('actual', 'expected', 'No unit tests defined in example_log_lines');

    unitTests = Array.isArray(unitTests) ? unitTests : [unitTests];

    unitTests.forEach((unitTest) => {
      this.doUnitTest(unitTest);
    });
  }
}
