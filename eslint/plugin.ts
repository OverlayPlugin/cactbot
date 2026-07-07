import { RuleDefinition } from '@eslint/core';
import { ESLint } from 'eslint';

import cactbotLocaleOrder from './cactbot-locale-order';
import cactbotOutputStrings from './cactbot-output-strings';
import cactbotPartyMemberPropertyAccess from './cactbot-party-member-property-access';
import cactbotResponseDefaultSeverities from './cactbot-response-default-severities';
import cactbotTimelineTriggers from './cactbot-timeline-triggers';
import cactbotTriggerPropertyOrder from './cactbot-trigger-property-order';
import cactbotTriggersetPropertyOrder from './cactbot-triggerset-property-order';

const lintRules: Record<string, RuleDefinition> = {
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'locale-order': cactbotLocaleOrder,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'output-strings': cactbotOutputStrings,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'party-member-property-access': cactbotPartyMemberPropertyAccess,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'response-default-severities': cactbotResponseDefaultSeverities,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'timeline-triggers': cactbotTimelineTriggers,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'trigger-property-order': cactbotTriggerPropertyOrder,
  // @ts-expect-error TSESLint and ESLint rule types are structurally incompatible
  'triggerset-property-order': cactbotTriggersetPropertyOrder,
};

const plugin: ESLint.Plugin = {
  rules: lintRules,
};

export default plugin;
