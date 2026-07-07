import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils';
import { SourceCode } from '@typescript-eslint/utils/ts-eslint';

export const getPropName = (
  prop: TSESTree.ObjectLiteralElement | TSESTree.RestElement | undefined,
): string | undefined => {
  if (prop === undefined)
    return undefined;
  if (!('key' in prop))
    return undefined;
  const key = prop.key;
  if (!('name' in key))
    return undefined;
  return key.name;
};

export const getPropNameOrValue = (
  prop: TSESTree.ObjectLiteralElement | TSESTree.RestElement | undefined,
): string | undefined => {
  const name = getPropName(prop);
  if (name !== undefined)
    return name;

  if (prop === undefined)
    return undefined;
  if (!('key' in prop))
    return undefined;
  const key = prop.key;
  if (!('value' in key))
    return undefined;
  return key.value?.toString();
};

export const compareOrder = (orderList: string[], a: string, b: string): number =>
  orderList.indexOf(a) - orderList.indexOf(b);
export const comparePropertyOrder = (
  orderList: string[],
  a: TSESTree.ObjectLiteralElement,
  b: TSESTree.ObjectLiteralElement,
): number => {
  const aName = getPropName(a) ?? '';
  const bName = getPropName(b) ?? '';
  return compareOrder(orderList, aName, bName);
};

export const generateValidList = (
  orderList: string[],
  properties: TSESTree.ObjectLiteralElement[],
): {
  nextKey: string;
  beforeKey: string;
}[] => {
  const validList: ReturnType<typeof generateValidList> = [];

  const allPropertiesValid = properties.every((prop) => {
    return orderList.includes(getPropName(prop) ?? '');
  });

  if (!allPropertiesValid)
    return validList;

  for (let i = 1; i < properties.length; i++) {
    const prevKey = getPropName(properties[i - 1]) ?? '';
    const key = getPropName(properties[i]) ?? '';
    if (compareOrder(orderList, prevKey, key) > 0) {
      validList.push({
        nextKey: prevKey,
        beforeKey: key,
      });
    }
  }

  return validList;
};

export const generateValidObject = (
  orderList: string[],
  properties: TSESTree.ObjectLiteralElement[],
  sourceCode: SourceCode,
): string | undefined => {
  const sortedPropertiesText = [...properties]
    .filter((property) => 'key' in property)
    .sort((a, b) => comparePropertyOrder(orderList, a, b))
    .map((property) => {
      const whitespace = ' '.repeat(property.loc.start.column);
      let str = '';
      sourceCode.getCommentsBefore(property).forEach((comment) => {
        if (comment.type === AST_TOKEN_TYPES.Line)
          str += `${whitespace}//${comment.value}\n`;
        else if (comment.type === AST_TOKEN_TYPES.Block)
          str += `${whitespace}/*${comment.value}*/\n`;
      });
      str += `${whitespace}${sourceCode.getText(property)}`;
      return str;
    })
    .join(',\n');

  // Check after the last property for any additional comments
  const preEndProp = properties[properties.length - 1];
  if (preEndProp !== undefined) {
    const possibleComma = sourceCode.getTokenAfter(preEndProp);
    if (possibleComma !== null && possibleComma.value === ',') {
      const nextNode = sourceCode.getTokenAfter(possibleComma, { includeComments: true });
      if (
        nextNode !== null &&
        (nextNode.type === AST_TOKEN_TYPES.Line || nextNode.type === AST_TOKEN_TYPES.Block)
      )
        return undefined;
    }
  }

  const firstProp = properties[0];
  if (firstProp === undefined)
    return undefined;
  return `{\n${sortedPropertiesText},\n${' '.repeat(firstProp.loc.start.column - 2)}}`;
};

export const getUnknownLocales = (
  orderList: string[],
  properties: TSESTree.ObjectLiteralElement[],
): {
  locale: string;
  node: TSESTree.PropertyNameComputed;
}[] => {
  const unknownLocales: ReturnType<typeof getUnknownLocales> = [];

  const hasValidLocale = properties.some((prop) => {
    return orderList.includes(getPropName(prop) ?? '');
  });

  if (!hasValidLocale) {
    return unknownLocales;
  }

  properties.forEach((prop) => {
    if ('key' in prop && 'name' in prop.key && !orderList.includes(prop.key.name)) {
      unknownLocales.push({
        locale: prop.key.name,
        node: prop.key,
      });
    }
  });

  return unknownLocales;
};

export type Docs = {
  category: string;
  recommended: boolean;
};
