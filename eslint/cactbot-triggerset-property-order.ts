import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { Docs, generateValidList, generateValidObject } from './tslint-utils';

type Options = [
  {
    module: 'oopsyraidsy' | 'raidboss';
  }?,
];

type MessageIds = 'sortKeys';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const createRule = ESLintUtils.RuleCreator<Docs>(
  (_) =>
    `https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties`,
);
const ruleModule = createRule<Options, MessageIds>({
  name: 'cactbot-triggerset-property-order',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'suggest the triggerSet property order',
      category: 'Stylistic Issues',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        module: {
          type: 'string',
          enum: ['oopsyraidsy', 'raidboss'],
        },
      },
    }],
    messages: {
      sortKeys:
        'Expected triggerSet properties ordered like {{expectedOrder}} (\'{{beforeKey}}\' should be before \'{{nextKey}}\')',
    },
  },
  create: (context) => {
    const raidbossOrderList = [
      'id',
      'zoneId',
      'config',
      'overrideTimelineFile',
      'timelineFile',
      'timeline',
      'resetWhenOutOfCombat',
      'initData',
      'timelineStyles',
      'timelineTriggers',
      'triggers',
      'timelineReplace',
    ];
    const oopsyraidsyOrderList = [
      'zoneId',
      'damageWarn',
      'damageFail',
      'gainsEffectWarn',
      'gainsEffectFail',
      'shareWarn',
      'shareFail',
      'soloWarn',
      'soloFail',
      'triggers',
    ];
    const optionModule = context.options[0] ? context.options[0].module : undefined;
    if (!optionModule || optionModule !== 'oopsyraidsy' && optionModule !== 'raidboss')
      return {};
    const orderList = optionModule === 'oopsyraidsy' ? oopsyraidsyOrderList : raidbossOrderList;
    return {
      'VariableDeclarator[id.name=\'triggerSet\'] > ObjectExpression': (
        node: TSESTree.ObjectExpression,
      ) => {
        const properties = node.properties;

        const validList = generateValidList(orderList, properties);

        if (validList.length >= 1) {
          const sourceCode = context.sourceCode;
          validList.forEach((valid) => {
            context.report({
              node: node,
              loc: node.loc,
              messageId: 'sortKeys',
              data: {
                expectedOrder: `[${orderList.join(',')}]`,
                beforeKey: valid.beforeKey,
                nextKey: valid.nextKey,
              },
              fix: (fixer) => {
                const replacementText = generateValidObject(orderList, properties, sourceCode);
                if (replacementText !== undefined)
                  return fixer.replaceTextRange(node.range, replacementText);
                return null;
              },
            });
          });
        }
      },
    };
  },
});

export default ruleModule;
