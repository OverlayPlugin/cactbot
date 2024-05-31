import { defineConfig } from 'vite';

import baseConfig from './vite/vite.config.base';
import devConfig from './vite/vite.config.dev';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return devConfig;
  }
  return baseConfig;
});
