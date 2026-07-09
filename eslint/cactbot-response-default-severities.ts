import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { Docs } from './tslint-utils';

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------
const createRule = ESLintUtils.RuleCreator<Docs>(
  (_) =>
    `https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties`,
);
const ruleModule = createRule({
  name: 'cactbot-response-default-severities',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'prevent explicit overrides where the response default is being used',
      category: 'Stylistic Issues',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [],
    messages: {
      defaultSeverity:
        'Use default severity in cases where the severity override matches the response default',
    },
  },

  create: (context) => {
    const defaultSeverityResponseMap: { [key: string]: string[] } = {
      'info': [
        'tankCleave',
        'miniBuster',
        'aoe',
        'bigAoe',
        'spread',
        'stackMiddle',
        'knockbackOn',
        'lookTowards',
        'lookAway',
        'getUnder',
        'outOfMelee',
        'getInThenOut',
        'getOutThenIn',
        'getBackThenFront',
        'getFrontThenBack',
        'killAdds',
        'killExtraAdd',
        'moveAway',
        'moveAround',
        'breakChains',
        'moveChainsTogether',
      ],
      'alert': [
        'tankBuster',
        'stackMarker',
        'getTogether',
        'stackMarkerOn',
        'doritoStack',
        'spreadThenStack',
        'stackThenSpread',
        'knockback',
        'lookAwayFromTarget',
        'lookAwayFromSource',
        'getBehind',
        'goFrontOrSides',
        'getIn',
        'getOut',
        'goMiddle',
        'goRight',
        'goLeft',
        'goWest',
        'goEast',
        'goFrontBack',
        'goSides',
        'awayFromFront',
        'sleep',
        'stun',
        'interrupt',
        'preyOn',
        'awayFrom',
        'earthshaker',
      ],
      'alarm': [
        'tankBusterSwap',
        'meteorOnYou',
        'stopMoving',
        'stopEverything',
        'wakeUp',
      ],
      'info, info': [
        'knockbackOn',
      ],
      'alert, info': [
        'tankBuster',
        'preyOn',
      ],
      'alarm, alert': [
        'tankBusterSwap',
      ],
    };
    return {
      'Property[key.name=\'response\'] > CallExpression[callee.object.name=\'Responses\'][arguments.length!=0]':
        (node: TSESTree.CallExpression) => {
          const args = node.arguments.filter((arg) => 'value' in arg);
          const responseSeverity = args.map((arg) => arg.value).join(', ');
          const defaultSeverity = defaultSeverityResponseMap[responseSeverity];
          const callee = node.callee;
          if (!('property' in callee))
            return;
          const calleeProperty = callee.property;
          if (!('name' in calleeProperty))
            return;
          if (defaultSeverity && defaultSeverity.includes(calleeProperty.name)) {
            context.report({
              node: node,
              messageId: 'defaultSeverity',

              fix: (fixer) => {
                const arg0Start = node.arguments[0]?.range[0];
                const argNEnd = node.arguments[node.arguments.length - 1]?.range[1];
                if (arg0Start !== undefined && argNEnd !== undefined) {
                  return fixer.replaceTextRange(
                    [
                      arg0Start,
                      argNEnd,
                    ],
                    '',
                  );
                }
                return null;
              },
            });
          }
        },
    };
  },
});

export default ruleModule;
