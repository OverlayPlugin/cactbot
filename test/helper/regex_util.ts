import { assert } from 'chai';

import logDefinitions from '../../resources/netlog_defs';
import { UnreachableCode } from '../../resources/not_reached';
import LogRepository from '../../ui/raidboss/emulator/data/network_log_converter/LogRepository';
import ParseLine from '../../ui/raidboss/emulator/data/network_log_converter/ParseLine';
import { ExampleLineDef, ExampleLineName } from '../../util/example_log_lines';

import lineTests, {
  ExampleLineNameWithRepeating,
  TestFields,
  UnitTest,
} from './example_log_lines_test_data';

export type RegexUtilParams = { [key: string]: string | boolean };

type MatchFields = { [key: string]: string };

// Helper class used for both regex and netregex tests.
export class RegexTestUtil {
  private type: ExampleLineName;
  private lines: string[];
  private unitTests: UnitTest<typeof this.type>[];
  private baseFunc: (params?: RegexUtilParams) => RegExp;
  private logLineMode: boolean;
  private repo?: LogRepository;

  constructor(
    type: ExampleLineName,
    exampleData: ExampleLineDef,
    baseFunc: (params?: RegexUtilParams) => RegExp,
    logLineMode: boolean,
  ) {
    this.type = type;
    this.lines = [...exampleData.examples.en];
    this.baseFunc = baseFunc;
    this.logLineMode = logLineMode;
    this.unitTests = this.getUnitTests(type);

    if (logLineMode) {
      this.repo = new LogRepository();
      this.convertLinesToLogLineFormat();
    }
  }

  // Because TypeScript can't narrow `this` across methods, this helper also
  // functions as a typeguard for the calling method if needed.
  private hasRepeatingFields(type?: ExampleLineName): type is ExampleLineNameWithRepeating {
    return 'repeatingFields' in logDefinitions[type ?? this.type];
  }

  // Import unit test data
  private getUnitTests(type: ExampleLineName): UnitTest<typeof type>[] {
    const importUnitTests = lineTests[type];

    // Should never happen, since TypeScript should generate a compile-time error.
    if (importUnitTests === undefined)
      assert.fail('actual', 'expected', `No unit tests specified for '${type}'`);

    let unitTests = Array.isArray(importUnitTests) ? importUnitTests : [importUnitTests];
    if (!this.logLineMode)
      return unitTests;

    // If running in logLineMode, convert the `type` field to hex
    unitTests = unitTests.map((test) => {
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
    return unitTests;
  }

  // Reformat example lines to match log line format
  // If the (optional) string param is passed, it will return a string with the reformatted line
  // Otherwise, it will convert all log lines in this.lines
  private convertLinesToLogLineFormat(testline?: string): string | undefined {
    if (this.repo === undefined)
      return;

    // If the optional string param is passed, convert and return only that line
    if (testline !== undefined)
      return ParseLine.parse(this.repo, testline)?.convertedLine;

    // Otherwise, convert all lines in `this.lines`.
    this.lines = this.lines.map((ll) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const line = ParseLine.parse(this.repo!, ll);
      if (!line)
        throw new UnreachableCode();
      return line.convertedLine;
    });
  }

  // An automated way to test standard regex functions that take a dictionary of fields.
  public captureTest(func: (params?: RegexUtilParams) => RegExp, lines?: readonly string[]): void {
    // TODO: `regexCaptureTest` doesn't handle the repeating keys well,
    // so don't run it for those log lines
    if (this.hasRepeatingFields())
      return;

    // Quite bogus.
    const bogusLine = 'using act is cheating';

    // regex should not match the bogus line.
    assert.isNull(func({}).exec(bogusLine));

    for (const line of lines ?? this.lines) {
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
  }

  // For log def types that have repeating fields, we need a little special handling
  // to convert the repeating field keys to the regex capture-group names.
  private extractFields(fields: TestFields<typeof this.type>): MatchFields {
    const extractedFields: MatchFields = {};

    // This approach works fine for extracting repeating keys from CombatantMemory
    // or other future logdef types where there is a key/value pair.
    // But if there are ever repeating fields that have more than a key/value pair,
    // this will need to be reworked.
    if (this.hasRepeatingFields(this.type)) {
      const fieldDefs = logDefinitions[this.type].repeatingFields;
      const label = fieldDefs.label;

      // if repeating fields are not used in a particular unit test, that's weird but ok
      if (label in fields) {
        const keyFieldName = logDefinitions[this.type].repeatingFields.primaryKey;
        const repFieldNames = logDefinitions[this.type].repeatingFields.names;

        type ValueName = Exclude<typeof repFieldNames[number], typeof keyFieldName>;
        const remainingFields = repFieldNames.filter((f) => f !== keyFieldName);
        if (remainingFields.length !== 1)
          assert.fail('actual', 'expected', `Invalid key/value names: too many repeating fields.`);
        const valueFieldName = remainingFields[0] as ValueName;

        const pairs = fields[label] ?? [];
        pairs.forEach((pair) => {
          const fieldName = pair[keyFieldName];
          const fieldValue = pair[valueFieldName];
          if (Array.isArray(fieldName) || Array.isArray(fieldValue))
            assert.fail(
              'actual',
              'expected',
              `Cannot use array for key/value pairs in unit tests.`,
            );
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
    const testLine = this.logLineMode
      ? this.convertLinesToLogLineFormat(unitTest.lineToTest)
      : unitTest.lineToTest;

    if (testLine === undefined)
      assert.fail('actual', 'expected', `Invalid example line, or cannot be converted.`);

    // If an override is specified for a particular unit test, do a capture test
    // for that override first
    let unitTestRegex = this.baseFunc();
    const override = this.logLineMode
      ? unitTest.regexOverride?.logLine
      : unitTest.regexOverride?.network;
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
      const testValue = fields[field as keyof typeof fields];
      const matchValue = matches[field];

      if (testValue === undefined)
        throw new UnreachableCode();
      else if (matchValue === undefined)
        errStr += `\nMatch error: No field '${field}' was captured`;
      else if (testValue !== matchValue)
        errStr += `\nMatch error: '${field}' expected '${testValue}' but got '${matchValue}'`;
    }
    if (errStr !== '') {
      assert.isEmpty(errStr, `${errStr}\n`);
    }
  }

  public run(): void {
    this.captureTest(this.baseFunc, this.lines);

    this.unitTests.forEach((unitTest) => {
      this.doUnitTest(unitTest);
    });
  }
}
