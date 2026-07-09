import {
  AST_NODE_TYPES,
  ASTUtils,
  ASTUtils as t,
  ESLintUtils,
  ParserServicesWithTypeInformation,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/utils';
import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import { SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { OutputStrings } from '../types/trigger';

import { Docs, getPropNameOrValue } from './tslint-utils';

const textProps = ['alarmText', 'alertText', 'infoText', 'tts'];

const isType = (type: AST_NODE_TYPES, node: unknown): boolean => {
  if (node === undefined || node === null || typeof node !== 'object')
    return false;
  return 'type' in node && node.type === type;
};

const isSpreadElement = (node: unknown): node is TSESTree.SpreadElement => {
  return isType(AST_NODE_TYPES.SpreadElement, node);
};

const isMemberExpression = (node: unknown): node is TSESTree.MemberExpression => {
  return isType(AST_NODE_TYPES.MemberExpression, node);
};

const isObjectExpression = (node: unknown): node is TSESTree.ObjectExpression => {
  return isType(AST_NODE_TYPES.ObjectExpression, node);
};

const isIdentifier = (node: unknown): node is TSESTree.Identifier => {
  return isType(AST_NODE_TYPES.Identifier, node);
};

const isLiteral = (node: unknown): node is TSESTree.Literal => {
  return isType(AST_NODE_TYPES.Literal, node);
};

const isBinaryExpression = (node: unknown): node is TSESTree.BinaryExpression => {
  return isType(AST_NODE_TYPES.BinaryExpression, node);
};

const isCallExpression = (node: unknown): node is TSESTree.CallExpression => {
  return isType(AST_NODE_TYPES.CallExpression, node);
};

const isProperty = (node: unknown): node is TSESTree.Property => {
  return isType(AST_NODE_TYPES.Property, node);
};

/**
 * get all keys name from object literal expression
 * @param props
 * @return {string[]}
 */
const getAllKeys = (
  globalVars: Map<string, string[]>,
  props: (TSESTree.ObjectLiteralElement | TSESTree.RestElement)[],
): string[] => {
  const propKeys: string[] = [];

  props.forEach((prop) => {
    if (isProperty(prop)) {
      if (t.isIdentifier(prop.key)) {
        propKeys.push(prop.key.name);
      } else if (isLiteral(prop.key)) {
        propKeys.push(prop.key.value?.toString() ?? '');
      }
    } else if (isSpreadElement(prop)) {
      if (t.isIdentifier(prop.argument)) {
        (globalVars.get(prop.argument.name) || [])
          .forEach((name) => propKeys.push(name));
      }
    }
  });

  return propKeys;
};

type Template = {
  [key: string]: string[] | undefined;
};

type Stack = {
  triggerID?: string;
  outputParam?: string;
  outputProperties: string[];
  inTriggerFunc: boolean;
  outputTemplates?: Template;
};

const isOutputStrings = (obj: unknown): obj is OutputStrings => {
  if (typeof obj !== 'object' || obj === null)
    return false;
  return Object.values(obj).every((v) => typeof v === 'object' && v !== null && 'en' in v);
};

const extractTemplateKeys = (template: string): string[] => {
  const matches = Array.from(template.matchAll(/\${\s*([^}\s]+)\s*}/g));
  const mapped = matches.map((v) => v[1]).filter((v) => v !== undefined);
  return mapped;
};

const extractTemplateFromObject = (obj: OutputStrings): Template | undefined => {
  const outputTemplateKey: Template = {};
  Object.entries(obj).forEach((entry) => {
    const [key, value] = entry;
    if (typeof value === 'string') {
      outputTemplateKey[key] = extractTemplateKeys(value);
    } else {
      const localeKeys: string[][] = [];
      Object.values(value).forEach((locale) => {
        localeKeys.push(extractTemplateKeys(locale).sort());
      });

      const keys = localeKeys[0];
      if (keys !== undefined && arrayContainSameElement(localeKeys) && keys.length > 0)
        outputTemplateKey[key] = keys;
    }
  });
  return outputTemplateKey;
};

const extractTemplateFromMemberExpression = (
  service: ParserServicesWithTypeInformation,
  keyName: string | undefined,
  value: TSESTree.MemberExpression,
) => {
  const outputTemplateKey: Template = {};

  const tsNode = service.esTreeNodeToTSNodeMap.get(value.property);
  const type = service.program.getTypeChecker().getTypeAtLocation(tsNode);
  const symbol = type.getSymbol();
  const members = symbol?.members;
  const templateIds: string[][] = [];
  members?.forEach((value) => {
    const valDec = value.valueDeclaration;
    if (valDec === undefined)
      return;

    // `text` here contains both the key and value assignment. Example:
    // en: 'Stack on ${player}'
    const text = valDec.getText();
    const mapped = extractTemplateKeys(text);
    templateIds.push(mapped.sort());
  });
  const keys = templateIds[0];
  if (
    keyName !== undefined && arrayContainSameElement(templateIds) &&
    keys !== undefined && keys.length > 0
  )
    outputTemplateKey[keyName] = keys;

  return outputTemplateKey;
};

const extractTemplate = (
  service: ParserServicesWithTypeInformation,
  sourceCode: SourceCode,
  node: TSESTree.ObjectExpression,
) => {
  const evaluated = ASTUtils.getStaticValue(node, sourceCode.getScope(node));
  if (isOutputStrings(evaluated?.value)) {
    return extractTemplateFromObject(evaluated.value);
  }
  if (node.properties === undefined)
    return;
  const outputTemplateKey: Template = {};
  for (const spreadElem of node.properties.filter((s) => isSpreadElement(s))) {
    const spreadElemArg = spreadElem.argument;
    if (spreadElemArg.type === AST_NODE_TYPES.Identifier) {
      const variableReference = ASTUtils.findVariable(
        sourceCode.getScope(node),
        spreadElemArg.name,
      );
      if (variableReference === null)
        continue;
      const tmpTemplate = extractTemplateFromVariable(service, sourceCode, variableReference);
      if (tmpTemplate !== undefined)
        Object.assign(outputTemplateKey, tmpTemplate);
    } else if (spreadElemArg.type === AST_NODE_TYPES.MemberExpression) {
      const n2 = service.getSymbolAtLocation(spreadElemArg);
      const valDec = n2?.valueDeclaration;
      if (n2 === undefined || valDec === undefined)
        continue;

      // `text` here contains both the key and value assignment. Example:
      // en: 'Stack on ${player}'
      const text = valDec.getText();
      const mapped = extractTemplateKeys(text);
      if (mapped.length > 0)
        outputTemplateKey[n2.name] = mapped;
    } else {
      const spreadEvaluated = ASTUtils.getStaticValue(
        spreadElemArg,
        sourceCode.getScope(spreadElemArg),
      );
      console.log(spreadEvaluated);
    }
  }

  for (
    const outputString of node.properties
      .filter((s) => !isSpreadElement(s))
      .filter((s) => isMemberExpression(s.value))
  ) {
    const value = outputString.value;
    if (!isMemberExpression(value))
      continue;

    const tmpTemplate = extractTemplateFromMemberExpression(
      service,
      getPropNameOrValue(outputString),
      value,
    );

    if (tmpTemplate !== undefined)
      Object.assign(outputTemplateKey, tmpTemplate);
  }
  for (
    const outputString of node.properties
      .filter((s) => !isSpreadElement(s))
      .filter((s) => !isMemberExpression(s.value))
  ) {
    const keyName = getPropNameOrValue(outputString);
    if (keyName === undefined)
      continue;
    const value = outputString.value;
    // This could just be a literal, e.g. `outputStrings: { text: 'string' }`.
    if (value.type === AST_NODE_TYPES.Literal) {
      const keys = extractTemplateKeys(value.value?.toString() ?? '');
      if (keys.length > 0)
        outputTemplateKey[keyName] = keys;
      continue;
    }
    if (!('properties' in value))
      continue;
    // For each outputString...
    const properties = value.properties;

    const values = properties
      .filter((x) => 'value' in x)
      .map((x) => x.value)
      .filter((x) => x !== undefined)
      .map((x) => {
        if (isLiteral(x)) {
          return x.value?.toString() ?? '';
        }

        if (isBinaryExpression(x)) {
          /*
              outputStrings: {
                  text: {
                    en: Outputs.killAdds.en + '(back first)',
                    de: Outputs.killAdds.de + '(hinten zuerst)',
                    fr: Outputs.killAdds.fr + '(derrière en premier)',
                    ja: Outputs.killAdds.ja + '(下の雑魚から)',
                    cn: Outputs.killAdds.cn + '(先打后方的)',
                    tc: Outputs.killAdds.tc + '(先打後方的)',
                    ko: Outputs.killAdds.ko + '(아래쪽 먼저)',
                  },
                },
            */
          let ret: string | undefined;
          const left = x.left;
          if ('value' in left)
            ret = left.value?.toString() ?? '';
          const right = x.right;
          if ('value' in right)
            ret = (ret ?? '') + (right.value?.toString() ?? '');
          if (ret !== undefined)
            return ret;
        }

        throw new Error(`unexpected outputStrings format at ${JSON.stringify(x.loc)}`);
      });

    const templateIds = values
      .map((x) => extractTemplateKeys(x).sort());

    const keys = templateIds[0] ?? [];

    if (keyName !== undefined && arrayContainSameElement(templateIds) && keys.length > 0)
      outputTemplateKey[keyName] = keys;
  }
  return outputTemplateKey;
};

const extractTemplateFromVariable = (
  service: ParserServicesWithTypeInformation,
  sourceCode: SourceCode,
  idVar: TSESLint.Scope.Variable,
) => {
  const idVarNode = idVar.defs[0]?.node;
  if (idVarNode === undefined || idVarNode.type !== AST_NODE_TYPES.VariableDeclarator)
    return;
  const init = idVarNode.init;
  if (init === null)
    return;
  if (init.type === AST_NODE_TYPES.ObjectExpression) {
    return extractTemplate(service, sourceCode, init);
  }
  if (!('expression' in init))
    return;
  const expr = init.expression;
  if (typeof expr !== 'object' || expr.type !== AST_NODE_TYPES.ObjectExpression)
    return;
  return extractTemplate(service, sourceCode, expr);
};

const extractTemplateFromIdentifier = (
  service: ParserServicesWithTypeInformation,
  sourceCode: SourceCode,
  node: TSESTree.Identifier,
) => {
  const parentParent = node.parent.parent;
  if (parentParent === undefined)
    return;
  const idVar = ASTUtils.findVariable(sourceCode.getScope(node), node.name);
  if (idVar === null)
    return;
  return extractTemplateFromVariable(service, sourceCode, idVar);
};

const arrayContainSameElement = (arr: string[][]) => {
  return arr.every((v) => JSON.stringify(v) === JSON.stringify(arr[0]));
};

const createRule = ESLintUtils.RuleCreator<Docs>(
  (_) =>
    `https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties`,
);
const ruleModule = createRule({
  name: 'cactbot-locale-order',
  meta: {
    type: 'problem',
    docs: {
      description: 'suggest outputStrings in cactbot',
      category: 'Stylistic Issues',
      recommended: true,
      url:
        'https://github.com/OverlayPlugin/cactbot/blob/main/docs/RaidbossGuide.md#trigger-properties',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noOutputStrings: 'no outputStrings in trigger',
      notFoundProperty: 'no \'{{prop}}\' in \'{{outputParam}}\'',
      notFoundTemplate: '`output.{{prop}}(...)` doesn\'t have template \'{{template}}\'.',
      missingTemplateValue: 'template \'{{prop}}\' is missing in function call',
      incorrectObjectKey: 'template \'{{prop}}\' specifies an object key with too many parts',
    },
  },
  create: function(context) {
    const service = getParserServices(context);
    const sourceCode = context.sourceCode;
    const globalVars = new Map<string, string[]>();
    const stack: Stack = {
      outputProperties: [],
      inTriggerFunc: false,
    };
    return {
      'Program > VariableDeclaration > VariableDeclarator > ObjectExpression'(
        node: TSESTree.ObjectExpression,
      ) {
        if (node.parent.type !== AST_NODE_TYPES.VariableDeclarator)
          return;
        const id = node.parent.id;
        if (!('name' in id))
          return;
        globalVars.set(id.name, getAllKeys(globalVars, node.properties));
      },
      'Program > VariableDeclaration > VariableDeclarator > TSAsExpression > ObjectExpression'(
        node: TSESTree.ObjectExpression,
      ) {
        /**
         * const eclipseOutputStrings = { ... } as const;
         */
        if (node.parent.type !== AST_NODE_TYPES.TSAsExpression)
          return;
        const parent = node.parent;
        if (parent.parent.type !== AST_NODE_TYPES.VariableDeclarator)
          return;
        const id = parent.parent.id;
        if (!('name' in id))
          return;
        globalVars.set(id.name, getAllKeys(globalVars, node.properties));
      },
      [`Property[key.name=/${textProps.join('|')}/] > :function`](node: TSESTree.FunctionLike) {
        const parent = node.parent;
        const parentParent = parent.parent;
        if (parentParent === undefined || !('properties' in parentParent))
          return;
        const parentParentProps = parentParent.properties;
        const props = getAllKeys(globalVars, parentParentProps);
        if (props.find((prop) => prop === 'outputStrings')) {
          stack.inTriggerFunc = true;
          const param = node.params[2];
          if (param === undefined || !('name' in param))
            return;
          stack.outputParam = param.name;
          const outputValue = parentParentProps
            .filter((prop) => 'value' in prop)
            .find((prop) =>
              'key' in prop && 'name' in prop.key && prop.key.name === 'outputStrings'
            )?.value;
          if (outputValue === undefined)
            return;
          let triggerID;
          parentParentProps.forEach((prop) => {
            if (
              'key' in prop && 'name' in prop.key && prop.key.name === 'id' && 'value' in prop.value
            ) {
              triggerID = prop.value.value?.toString();
            }
          });
          if (isIdentifier(outputValue)) {
            const template = extractTemplateFromIdentifier(service, sourceCode, outputValue);
            if (template !== undefined) {
              stack.outputTemplates = { ...(stack.outputTemplates ?? {}), ...template };
            }
            stack.outputProperties = globalVars.get(outputValue.name) ?? [];
          } else if (isObjectExpression(outputValue)) {
            const template = extractTemplate(service, sourceCode, outputValue);
            if (template !== undefined) {
              stack.outputTemplates = { ...(stack.outputTemplates ?? {}), ...template };
              stack.outputProperties = getAllKeys(globalVars, outputValue.properties);
            }
          } else {
            return;
          }
          if (triggerID !== undefined)
            stack.triggerID = triggerID;
          return;
        }
        context.report({
          node: 'key' in parent ? parent.key : node.parent,
          messageId: 'noOutputStrings',
        });
      },
      [`Property[key.name=/${textProps.join('|')}/] > :function:exit`]() {
        if (stack.inTriggerFunc) {
          stack.inTriggerFunc = false;
          delete stack.outputParam;
          stack.outputProperties = [];
          delete stack.triggerID;
          delete stack.outputTemplates;
        }
      },

      [
        `Property[key.name=/alarmText|alertTex|infoText|tts/] > :function[params.length=3] CallExpression > ChainExpression > MemberExpression`
      ](_node) {
        // TODO: raise a error about using `?.` to call output
      },

      [
        `Property[key.name=/alarmText|alertTex|infoText|tts/] > :function[params.length=3] CallExpression > TSNonNullExpression > MemberExpression`
      ](node: TSESTree.MemberExpression) {
        const nodeObject = node.object;
        if (
          'name' in nodeObject &&
          nodeObject.name === stack.outputParam &&
          node.computed === false &&
          t.isIdentifier(node.property) &&
          !stack.outputProperties.includes(node.property.name)
        ) {
          context.report({
            node: node,
            messageId: 'notFoundProperty',
            data: {
              prop: node.property.name,
              outputParam: stack.outputParam,
            },
          });
        }
        const nodeParentParent = node.parent.parent;
        if (nodeParentParent === undefined || !isCallExpression(nodeParentParent))
          return;
        if (t.isIdentifier(node.property) && stack.outputProperties.includes(node.property.name)) {
          const calleeParent = nodeParentParent.callee.parent;
          if (!('arguments' in calleeParent))
            return;
          const args = calleeParent.arguments;
          const outputOfTriggerId = stack.outputTemplates ?? {};
          const outputTemplate = outputOfTriggerId?.[node.property.name];

          if (args.length === 0) {
            if (node.property.name in outputOfTriggerId) {
              if (outputOfTriggerId[node.property.name] !== undefined) {
                context.report({
                  node: node,
                  messageId: 'missingTemplateValue',
                  data: {
                    prop: outputTemplate,
                  },
                });
              }
            }
          } else if (args.length === 1) {
            const args0 = args[0];
            if (isObjectExpression(args0)) {
              const passedKeys = getAllKeys(globalVars, args0.properties);
              if (outputTemplate === undefined && passedKeys.length !== 0) {
                context.report({
                  node: node,
                  messageId: 'notFoundTemplate',
                  data: {
                    template: passedKeys.join(', '),
                    prop: node.property.name,
                  },
                });
              }
            }

            if (args0 === undefined || !('properties' in args0))
              return;

            const keysInParams = getAllKeys(globalVars, args0.properties);
            if (outputTemplate !== undefined && outputTemplate !== undefined) {
              for (const key of outputTemplate) {
                const keyParts = key.split('.');
                if (keyParts.length > 2) {
                  context.report({
                    node: node,
                    messageId: 'incorrectObjectKey',
                    data: {
                      prop: key,
                    },
                  });
                }
                const trimmedKey = keyParts[0] ?? '';
                if (!t.isIdentifier(args[0]) && !keysInParams.includes(trimmedKey)) {
                  context.report({
                    node: node,
                    messageId: 'missingTemplateValue',
                    data: {
                      prop: trimmedKey,
                    },
                  });
                }
              }

              for (const key of keysInParams) {
                if (!outputTemplate.includes(key)) {
                  context.report({
                    node: node,
                    messageId: 'notFoundTemplate',
                    data: {
                      prop: node.property.name,
                      template: key,
                    },
                  });
                }
              }
            }
          }
        }
      },
    };
  },
});

export default ruleModule;
