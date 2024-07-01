import { defineConfig } from 'vite';

import devConfig from './vite/vite.config.dev';
import prodConfig from './vite/vite.config.prod';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return devConfig;
  }
  return prodConfig;
});
