import js from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import { defineConfig } from 'eslint/config';
import { flatConfigs as importPluginConfig } from 'eslint-plugin-import-x';
import preferArrowFunctionsPlugin from 'eslint-plugin-prefer-arrow-functions';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import cactbotLintPlugin from './eslint/plugin';

type Config = ReturnType<typeof defineConfig>[number];

// some jank here to work around a bug, ref https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/pull/70
type PluginType = NonNullable<Config['plugins']>[string];
const preferArrowFunctionsPluginTyped = preferArrowFunctionsPlugin as PluginType;

// @TODO: TEMPORARY, REPLACE OR DELETE LATER (maybe use `gts` package?)
const fixedGoogleConfig: Config = {
  'rules': {
    'array-bracket-newline': 'off',
    'array-bracket-spacing': ['error', 'never'],
    'array-element-newline': 'off',
    'arrow-parens': ['error', 'always'],
    'block-spacing': ['error', 'never'],
    'brace-style': 'error',
    'camelcase': ['error', { 'properties': 'never' }],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'constructor-super': 'error',
    'curly': ['error', 'multi-line'],
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'generator-star-spacing': ['error', 'after'],
    'guard-for-in': 'error',
    'indent': ['error', 2, {
      'CallExpression': { 'arguments': 2 },
      'FunctionDeclaration': { 'body': 1, 'parameters': 2 },
      'FunctionExpression': { 'body': 1, 'parameters': 2 },
      'ignoredNodes': ['ConditionalExpression'],
      'MemberExpression': 2,
      'ObjectExpression': 1,
      'SwitchCase': 1,
    }],
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'linebreak-style': 'error',
    'max-len': ['error', {
      'code': 80,
      'ignorePattern': 'goog.(module|require)',
      'ignoreUrls': true,
      'tabWidth': 2,
    }],
    'new-cap': 'error',
    'no-array-constructor': 'error',
    'no-caller': 'error',
    'no-cond-assign': 'off',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-invalid-this': 'error',
    'no-irregular-whitespace': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-multiple-empty-lines': ['error', { 'max': 2 }],
    'no-new-object': 'error',
    'no-new-symbol': 'error',
    'no-new-wrappers': 'error',
    'no-tabs': 'error',
    'no-this-before-super': 'error',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-unexpected-multiline': 'error',
    'no-unused-vars': ['error', { 'args': 'none' }],
    'no-var': 'error',
    'no-with': 'error',
    'object-curly-spacing': 'error',
    'one-var': ['error', { 'const': 'never', 'let': 'never', 'var': 'never' }],
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    'prefer-const': ['error', { 'destructuring': 'all' }],
    'prefer-promise-reject-errors': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'quote-props': ['error', 'consistent'],
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'require-jsdoc': ['error', {
      'require': {
        'ClassDeclaration': true,
        'FunctionDeclaration': true,
        'MethodDefinition': true,
      },
    }],
    'rest-spread-spacing': 'error',
    'semi': 'error',
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'asyncArrow': 'always',
      'named': 'never',
    }],
    'spaced-comment': ['error', 'always'],
    'switch-colon-spacing': 'error',
    'valid-jsdoc': ['error', {
      'prefer': { 'returns': 'return' },
      'requireParamDescription': false,
      'requireReturn': false,
      'requireReturnDescription': false,
    }],
    'yield-star-spacing': ['error', 'after'],
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
  'cactbot/locale-order': [
    'warn',
    ['en', 'de', 'fr', 'ja', 'cn', 'ko', 'tc'],
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
  'import-x/export': 'error',
  'import-x/no-duplicates': 'error',
  'import-x/no-mutable-exports': 'error',
  'import-x/no-named-as-default': 'error',
  'import-x/no-named-as-default-member': 'error',
  'import-x/no-unresolved': [
    'error',
    {
      'caseSensitive': true,
    },
  ],
  'import-x/no-useless-path-segments': 'error',
  'import-x/no-webpack-loader-syntax': 'error',
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
  importPluginConfig.recommended,
  // cactbot default
  {
    'ignores': cactbotGlobalIgnores,
    'languageOptions': {
      'ecmaVersion': 2022,
      'globals': {
        ...globals.browser,
        ...globals.es2015,
      },
      'parser': tseslint.parser,
      'parserOptions': {
        'project': ['./tsconfig.eslint.json'],
      },
      'sourceType': 'module',
    },
    'linterOptions': {
      // @TODO: Remove this later
      'reportUnusedDisableDirectives': 'off',
    },
    'plugins': {
      '@typescript-eslint': tseslint.plugin,
      'cactbot': cactbotLintPlugin,
    },
    'settings': {
      'import-x/resolver': {
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
    'files': ['*.ts', '**/*.ts'],
    'languageOptions': {
      parser: tseslint.parser,
      parserOptions: {
        'project': ['./tsconfig.eslint.json'],
      },
    },
    'plugins': {
      '@stylistic': stylisticPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    'rules': {
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
      '@stylistic/object-curly-spacing': ['warn', 'always'],
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
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      // @TODO: We use this for removing indexes a lot, maybe revisit with a helper method of sorts instead?
      '@typescript-eslint/no-array-delete': 'off',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-invalid-this': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-restricted-types': ['error', {
        'types': {
          'object': true,
        },
      }],
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'args': 'all',
        'argsIgnorePattern': '^_',
      }],
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/strict-boolean-expressions': ['error', {
        // @TODO: Remove these keys over time, setting them back to default
        'allowNullableBoolean': true,
        'allowNullableNumber': true,
      }],
      'func-style': ['error', 'expression', { 'allowArrowFunctions': true }],
      'import-x/order': [
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
    'languageOptions': {
      'ecmaVersion': 2022,
      'parserOptions': {
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
      'cactbot/output-strings': 'error',
      'cactbot/response-default-severities': 'error',
      'cactbot/timeline-triggers': 'error',
      'max-len': [
        'warn',
        {
          'code': 300,
        },
      ],
      'prefer-arrow/prefer-arrow-functions': 'warn',
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
    'ignores': cactbotGlobalIgnores,
    'plugins': {
      'unicorn': unicornPlugin,
    },
    'rules': rules,
  },
);
