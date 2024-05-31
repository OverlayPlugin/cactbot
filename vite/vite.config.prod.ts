import { mergeConfig, type UserConfig } from 'vite';

import baseOptions from './vite.config.base';

export default mergeConfig<UserConfig, UserConfig>(baseOptions, {
  build: {
    cssMinify: true,
    target: ['es2020', 'chrome95', 'edge95', 'firefox94', 'safari14'],
  },
});
