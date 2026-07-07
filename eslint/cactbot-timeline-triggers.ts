import { ESLintUtils } from '@typescript-eslint/utils';

import { Docs } from './tslint-utils';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const createRule = ESLintUtils.RuleCreator<Docs>(
  (_) =>
    `https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties`,
);
const ruleModule = createRule({
  name: 'cactbot-timeline-triggers',
  meta: {
    type: 'problem',
    docs: {
      description: 'prevent syntax issues within timelineTriggers',
      category: 'Syntax Issues',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    schema: [],
    messages: {
      regexLiteral:
        'timelineTrigger regex has to be a regular expression literal, such as /^Ability Name$/',
      onlyRegex: 'timelineTriggers only support "regex"',
    },
  },

  create: (context) => {
    return {
      'Property[key.name=\'timelineTriggers\'] > ArrayExpression > ObjectExpression > Property[key.name=\'regex\'] > :not(Identifier, Literal)':
        (node) =>
          context.report({
            node: node,
            messageId: 'regexLiteral',
          }),
      'Property[key.name=\'timelineTriggers\'] > ArrayExpression > ObjectExpression > Property[key.name=/(?:netRegex.{0,2}|regex.{2})/]':
        (node) =>
          context.report({
            node: node,
            messageId: 'onlyRegex',
          }),
    };
  },
});

export default ruleModule;
