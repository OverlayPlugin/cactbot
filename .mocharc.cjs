'use strict';

module.exports = {
  'recursive': true,
  'colors': true,
  'reporter': 'progress',
  'exclude': [
    // Run via test_data_files.js.
    'test/helper/*',
  ],
  'node-option': [
    'experimental-specifier-resolution=node',
    'loader=ts-node/esm',
  ],
  'extension': [
    '.js',
    '.cjs',
    '.mjs',
    '.ts',
    '.d.ts',
  ],
  // The default 2000ms timeout for mocha sometimes doesn't work for larger trigger files.
  // TODO: probably we should make tests faster??
  'timeout': 5000,
};
