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
  name: 'cactbot-party-member-property-access',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'no use of data.party.member() properties',
      category: 'Best Practices',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [],
    messages: {
      dataPartyMember:
        `"{{line}}": Use data.party.member(); do not directly access its properties in triggers.`,
    },
  },
  create: function(context) {
    return {
      'Property[key.name=/(timelineTriggers|triggers)/] > ArrayExpression > ObjectExpression': (
        node,
      ) => {
        // Look for any use of data.party.member().[property],
        const matchRegex = /data\.party\.member\(([^)]+)\)\.\w+/;

        const trigger = context.sourceCode.getText(node);
        const lines = trigger.split('\n').map((l) => l.trim());
        lines.forEach((line) => {
          const match = matchRegex.exec(line);
          if (match) {
            context.report({
              node: node,
              messageId: 'dataPartyMember',
              data: {
                line: line,
              },
            });
          }
        });
      },
    };
  },
});

export default ruleModule;
