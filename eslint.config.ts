import js from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import preferArrowFunctionsPlugin from 'eslint-plugin-prefer-arrow-functions';
import unicornPlugin from 'eslint-plugin-unicorn';
import { type Config, defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import cactbotLocaleOrder from './eslint/cactbot-locale-order.js';
import cactbotOutputStrings from './eslint/cactbot-output-strings.js';
import cactbotPartyMemberPropertyAccess from './eslint/cactbot-party-member-property-access.js';
import cactbotResponseDefaultSeverities from './eslint/cactbot-response-default-severities.js';
import cactbotTimelineTriggers from './eslint/cactbot-timeline-triggers.js';
import cactbotTriggerPropertyOrder from './eslint/cactbot-trigger-property-order.js';
import cactbotTriggersetPropertyOrder from './eslint/cactbot-triggerset-property-order.js';

// some jank here to work around a bug, ref https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/pull/70
type PluginType = NonNullable<Config['plugins']>[string];
const preferArrowFunctionsPluginTyped = preferArrowFunctionsPlugin as PluginType;

// @TODO: TEMPORARY, REPLACE OR DELETE LATER (maybe use `gts` package?)
type RulesConfig = NonNullable<(NonNullable<Config['rules']>)[string]>;
const depNumToStr = (v: number | unknown[]): 'off' | 'warn' | 'error' | RulesConfig => {
  switch (v) {
    case 0:
      return 'off';
    case 1:
      return 'warn';
    case 2:
      return 'error';
    default:
      if (Array.isArray(v)) {
        const v2 = v[0];
        if (typeof v2 === 'number')
          return [depNumToStr(v2), ...v.slice(1)] as RulesConfig;
      }
      return 'error';
  }
};

const fixedGoogleConfig: Config = {
  'rules': {
    'no-cond-assign': 'off',
    'no-irregular-whitespace': 'error',
    'no-unexpected-multiline': 'error',
    'valid-jsdoc': ['error', {
      'requireParamDescription': false,
      'requireReturnDescription': false,
      'requireReturn': false,
      'prefer': { 'returns': 'return' },
    }],
    'curly': ['error', 'multi-line'],
    'guard-for-in': 'error',
    'no-caller': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-invalid-this': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-with': 'error',
    'prefer-promise-reject-errors': 'error',
    'no-unused-vars': ['error', { 'args': 'none' }],
    'array-bracket-newline': 'off',
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': 'off',
    'block-spacing': ['error', 'never'],
    'brace-style': 'error',
    'camelcase': ['error', { 'properties': 'never' }],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'indent': ['error', 2, {
      'CallExpression': { 'arguments': 2 },
      'FunctionDeclaration': { 'body': 1, 'parameters': 2 },
      'FunctionExpression': { 'body': 1, 'parameters': 2 },
      'MemberExpression': 2,
      'ObjectExpression': 1,
      'SwitchCase': 1,
      'ignoredNodes': ['ConditionalExpression'],
    }],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'max-len': ['error', {
      'code': 80,
      'tabWidth': 2,
      'ignoreUrls': true,
      'ignorePattern': 'goog.(module|require)',
    }],
    'new-cap': 'error',
    'no-array-constructor': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2 }],
    'no-new-object': 'error',
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'object-curly-spacing': 'error',
    'one-var': ['error', { 'var': 'never', 'let': 'never', 'const': 'never' }],
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    'quote-props': ['error', 'consistent'],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'require-jsdoc': ['error', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
      },
    }],
    'semi': 'error',
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      'asyncArrow': 'always',
      'anonymous': 'never',
      'named': 'never',
    }],
    'spaced-comment': ['error', 'always'],
    'switch-colon-spacing': 'error',
    'arrow-parens': ['error', 'always'],
    'constructor-super': 'error',
    'generator-star-spacing': ['error', 'after'],
    'no-new-symbol': 'error',
    'no-this-before-super': 'error',
    'no-var': 'error',
    'prefer-const': ['error', { 'destructuring': 'all' }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'rest-spread-spacing': 'error',
    'yield-star-spacing': ['error', 'after'],
  },
};

// @TODO: Move this to a separate file in eslint folder, convert all these rules to typescript
type RuleModule = typeof cactbotLocaleOrder;
const cactbotLintPlugin = {
  rules: {
    'locale-order': cactbotLocaleOrder,
    'output-strings': cactbotOutputStrings,
    'response-default-severities': cactbotResponseDefaultSeverities as RuleModule,
    'timeline-triggers': cactbotTimelineTriggers as RuleModule,
    'party-member-property-access': cactbotPartyMemberPropertyAccess as RuleModule,
    'trigger-property-order': cactbotTriggerPropertyOrder as RuleModule,
    'triggerset-property-order': cactbotTriggersetPropertyOrder as RuleModule,
  },
};

// General rules for all files.
const rules: Config['rules'] = {
  'arrow-spacing': [
    'warn',
    {
      'after': true,
      'before': true,
    },
  ],
  'camelcase': [
    'error',
    {
      'properties': 'always',
    },
  ],
  // Handled by dprint.
  'comma-dangle': 'off',
  'curly': [
    'off',
    // 'multi-or-nest',
    // 'consistent',
  ],
  'eqeqeq': 'error',
  'guard-for-in': 'off',
  'import/export': 'error',
  'import/no-duplicates': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-named-as-default': 'error',
  'import/no-named-as-default-member': 'error',
  'import/no-unresolved': [
    'error',
    {
      'caseSensitive': true,
    },
  ],
  'import/no-useless-path-segments': 'error',
  'import/no-webpack-loader-syntax': 'error',
  // Handled by dprint.
  'indent': 'off',
  'linebreak-style': [
    'error',
    'windows',
  ],
  'max-len': [
    'warn',
    {
      'code': 100,
      // @TODO: Investigate why comment length wasn't being properly enforced before eslint upgrade
      // Until then, ignore comment length
      'ignoreComments': true,
      'ignoreRegExpLiterals': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
      'ignoreUrls': true,
      'tabWidth': 2,
    },
  ],
  'new-cap': [
    'error',
    {
      'capIsNew': false,
      'newIsCap': false,
      'properties': false,
    },
  ],
  'no-cond-assign': [
    'error',
    'always',
  ],
  'no-console': 'off',
  'no-duplicate-imports': 'warn',
  'no-else-return': 'warn',
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-sequences': 'error',
  'no-undef': 'off',
  'no-unused-vars': 'off',
  'no-useless-escape': 'off',
  'nonblock-statement-body-position': ['error', 'below'],
  'object-curly-newline': [
    'error',
    {
      'consistent': true,
      'multiline': true,
    },
  ],
  'object-curly-spacing': [
    'warn',
    'always',
  ],
  'object-property-newline': [
    'error',
    {
      'allowAllPropertiesOnSameLine': true,
    },
  ],
  'operator-linebreak': [
    'error',
    'after',
    {
      'overrides': {
        ':': 'before',
        '?': 'before',
      },
    },
  ],
  'prefer-arrow-callback': 'error',
  'prefer-const': 'error',
  'prefer-regex-literals': 'error',
  'prefer-rest-params': 'off',
  'prefer-template': 'error',
  'quotes': [
    'error',
    'single',
    {
      'allowTemplateLiterals': true,
    },
  ],
  'require-jsdoc': 'off',
  'cactbot/locale-order': [
    'warn',
    ['en', 'de', 'fr', 'ja', 'cn', 'ko', 'tc'],
  ],
  'space-in-parens': [
    'warn',
    'never',
  ],
  'space-infix-ops': 'warn',
  'space-unary-ops': [
    'warn',
    {
      'nonwords': false,
      'words': true,
    },
  ],
  'strict': [
    'error',
    'global',
  ],
  'template-curly-spacing': 'error',
  'unicode-bom': [
    'error',
    'never',
  ],
  'unicorn/prefer-string-slice': 'error',
  'valid-jsdoc': 'off',
};

const cactbotGlobalIgnores = [
  // Do not ignore dot files.  /o\
  '!.*',
  '.git/',
  '.venv/',
  'bin/',
  'dist/',
  'docs/',
  'node_modules/',
  'plugin/',
  'publish/',
  'resources/lib/',
];

export default defineConfig(
  // Early ignore our ignores list
  {
    ignores: cactbotGlobalIgnores,
  },
  // ESLint default
  js.configs.recommended,
  // Google configs for eslint, deprecated
  fixedGoogleConfig,
  // import plugin default
  importPlugin.flatConfigs.recommended,
  // cactbot default
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2015,
      },
      parser: tseslint.parser,
      'ecmaVersion': 2022,
      parserOptions: {
        'project': ['./tsconfig.eslint.json'],
      },
      'sourceType': 'module',
    },
    'ignores': cactbotGlobalIgnores,
    'plugins': {
      '@typescript-eslint': tseslint.plugin,
      cactbot: cactbotLintPlugin,
    },
    'settings': {
      'import/resolver': {
        'node': {
          'extensions': ['.d.ts', '.ts', '.js'],
        },
        'typescript': {
          'alwaysTryTypes': true,
          'project': './tsconfig.json',
        },
      },
    },
  },
  // TypeScript rule overrides.
  {
    'extends': [
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
    ],
    'files': ['*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        'project': ['./tsconfig.eslint.json'],
      },
    },
    'plugins': {
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylisticPlugin,
    },
    'rules': {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [
        'error',
        { 'allowHigherOrderFunctions': false },
      ],
      '@stylistic/member-delimiter-style': ['error', {
        'multiline': {
          'delimiter': 'semi',
          'requireLast': true,
        },
        'singleline': {
          'delimiter': 'semi',
          'requireLast': false,
        },
      }],
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'args': 'all',
        'argsIgnorePattern': '^_\\w?',
      }],
      '@stylistic/object-curly-spacing': ['warn', 'always'],
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        // @TODO: Remove these keys over time, setting them back to default
        'allowNullableBoolean': true,
        'allowNullableNumber': true,
      }],
      'func-style': ['error', 'expression', { 'allowArrowFunctions': true }],
      'import/order': [
        'error',
        {
          'alphabetize': { 'caseInsensitive': true, 'order': 'asc' },
          'newlines-between': 'always',
        },
      ],
      'no-invalid-this': 'off',
      'object-shorthand': ['error', 'consistent'],
    },
  },
  // Misc other overrides
  {
    'files': ['*.cjs'],
    languageOptions: {
      'ecmaVersion': 2022,
      parserOptions: {
        'project': ['./tsconfig.eslint.json'],
      },
      'sourceType': 'script',
    },
  },
  {
    'files': ['eslint.config.ts'],
    'rules': {
      'sort-keys': ['warn', 'asc', { caseSensitive: false, natural: true }],
    },
  },
  {
    'files': ['**/oopsyraidsy/data/**/*.ts', '**/raidboss/data/**/*.ts'],
    'plugins': {
      'prefer-arrow': preferArrowFunctionsPluginTyped,
    },
    'rules': {
      // Raidboss data files always export a trigger set, and explicit types are noisy.
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // Only meant to be used for `output` parameters!
      '@typescript-eslint/no-non-null-assertion': 'off',
      'max-len': [
        'warn',
        {
          'code': 300,
        },
      ],
      'prefer-arrow/prefer-arrow-functions': 'warn',
      'cactbot/output-strings': 'error',
      'cactbot/response-default-severities': 'error',
      'cactbot/timeline-triggers': 'error',
    },
  },
  {
    'files': ['**/raidboss/data/**/*'],
    'rules': {
      'cactbot/party-member-property-access': 'error',
      'cactbot/trigger-property-order': ['warn', { 'module': 'raidboss' }],
      'cactbot/triggerset-property-order': ['warn', { 'module': 'raidboss' }],
    },
  },
  {
    'files': ['**/oopsyraidsy/data/**/*'],
    'rules': {
      'cactbot/trigger-property-order': ['warn', { 'module': 'oopsyraidsy' }],
      'cactbot/triggerset-property-order': ['warn', { 'module': 'oopsyraidsy' }],
    },
  },
  // cactbot rule overrides
  {
    'plugins': {
      'unicorn': unicornPlugin,
    },
    ignores: cactbotGlobalIgnores,
    rules: rules,
  },
);
