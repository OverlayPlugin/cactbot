import { mergeConfig, type UserConfig } from 'vite';

import baseOptions from './vite.config.base';

export default mergeConfig<UserConfig, UserConfig>(baseOptions, {
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        timerbarTest: 'ui/test/timerbar_test.html',
      },
    },
  },
  server: {
    port: 8080,
  },
});
