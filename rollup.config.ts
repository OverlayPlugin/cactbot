import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import image from '@rollup/plugin-image';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import { defineConfig } from 'rollup';
import cleaner from 'rollup-plugin-cleaner'
import css from 'rollup-plugin-css-only';

export default defineConfig({
  plugins: [
    typescript(),
    nodeResolve(),
    commonjs(),
    cleaner({ targets: ['dist'] }),
    image(),
    css(),
    html({
      input: [
        'ui/config/config.html',
        // 'util/coverage/coverage.html',
        // 'ui/dps/rdmty/dps.html',
        // 'ui/dps/xephero/xephero-cactbot.html',
        'ui/eureka/eureka.html',
        'ui/jobs/jobs.html',
        'ui/oopsyraidsy/oopsyraidsy.html',
        'ui/oopsyraidsy/oopsy_summary.html',
        'ui/oopsyraidsy/oopsy_viewer.html',
        'ui/pullcounter/pullcounter.html',
        'ui/radar/radar.html',
        'ui/raidboss/raidboss.html',
        'ui/raidboss/raidboss_alerts_only.html',
        'ui/raidboss/raidboss_timeline_only.html',
        'ui/raidboss/raidboss_silent.html',
        'ui/raidboss/raidemulator.html',
        'util/logtools/splitter.html',
        'ui/test/test.html',
      ],
      extractAssets: false,
      rootDir: '.',
      flattenOutput: false,
    }),
  ],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: 'inline',
    chunkFileNames: '[name].bundle.js',
    assetFileNames: '[name][extname]',
    manualChunks: (id) => {
      if (/ui\/raidboss\/data\/.*(?:ts|js|txt\?raw)$/.test(id) || /^\0?timeline:/.test(id)) {
        return 'ui/common/raidboss_data';
      }
      if (/ui\/oopsyraidsy\/data\/.*(?:ts|js)$/.test(id)) {
        return 'ui/common/oopsyraidsy_data';
      }
      if (/ui\/raidboss\/(?:raidemulator.ts$|emulator\/.*(?:ts|js)$)/.test(id)) {
        return 'ui/raidboss/raidemulator';
      }
      if (/resources\/.*\.(?:ts|js)$/.test(id) || id.includes('node_modules')) {
        return 'ui/common/vendor';
      }
      if (!/\.(?:ts|js)$/.test(id)) {
        return;
      }

      const modules = {
        'ui/config/': 'ui/config/config',
        'util/coverage/': 'util/coverage/coverage',
        'ui/dps/rdmty/': 'ui/dps/rdmty/dps',
        'ui/dps/xephero/': 'ui/dps/xephero/xephero',
        'ui/eureka/': 'ui/eureka/eureka',
        'ui/jobs/': 'ui/jobs/jobs',
        'ui/oopsyraidsy/': 'ui/oopsyraidsy/oopsyraidsy',
        'ui/pullcounter/': 'ui/pullcounter/pullcounter',
        'ui/radar/': 'ui/radar/radar',
        'ui/raidboss/': 'ui/raidboss/raidboss',
        'util/logtools/': 'util/logtools/web_splitter',
        'ui/test/': 'ui/test/test',
      };

      for (const [match, module] of Object.entries(modules)) {
        if (id.includes(match)) {
          console.log(id, module);
          return module;
        }
      }
    },
  }
});
