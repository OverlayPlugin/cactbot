import { ESLintUtils } from '@typescript-eslint/utils';

import { Docs, generateValidList, generateValidObject, getUnknownLocales } from './tslint-utils';

const defaultOrderList = [
  'en',
  'de',
  'fr',
  'ja',
  'cn',
  'ko',
  'tc',
];

type Options = [
  string[],
];

type MessageIds = 'sortKeys' | 'unknownLocale';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const createRule = ESLintUtils.RuleCreator<Docs>(
  (_) =>
    `https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties`,
);
const ruleModule = createRule<Options, MessageIds>({
  name: 'cactbot-locale-order',
  meta: {
    type: 'suggestion',

    docs: {
      description: 'suggest the locale object key order',
      category: 'Stylistic Issues',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [
      {
        type: 'array',
        items: {
          type: 'string',
          enum: defaultOrderList,
        },
      },
    ],
    messages: {
      sortKeys:
        'Expected locale object keys ordered like {{expectedOrder}} (\'{{beforeKey}}\' should be before \'{{nextKey}}\')',
      unknownLocale: 'Unknown locale code \'{{locale}}\'. Valid locales are: {{validLocales}}',
    },
  },
  create: function(context) {
    // fill orderList with option,
    // otherwise use the default one.
    const orderList = context.options[0] ?? defaultOrderList;

    return {
      ObjectExpression(node) {
        const properties = node.properties;

        const unknownLocales = getUnknownLocales(orderList, properties);
        if (unknownLocales.length > 0) {
          unknownLocales.forEach((unknown) => {
            context.report({
              node: unknown.node,
              messageId: 'unknownLocale',
              data: {
                locale: unknown.locale,
                validLocales: orderList.join(', '),
              },
            });
          });
        }

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
