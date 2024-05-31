import { mergeConfig, type UserConfig } from 'vite';

import baseOptions from './vite.config.base';

export default mergeConfig<UserConfig, UserConfig>(baseOptions, {
  build: {
    sourcemap: true,
  },
  server: {
    port: 8080,
  },
});
