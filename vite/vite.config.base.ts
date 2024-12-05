import { resolve } from 'node:path';

import isCI from 'is-ci';
import type { UserConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import manifestLoader from './manifest-loader';

const config: UserConfig = {
  build: {
    // Do not emit assets, as they are copied by viteStaticCopy
    assetsInlineLimit: 0,
    emitAssets: false,

    rollupOptions: {
      input: {
        config: resolve(__dirname, '..', 'ui/config/config.html'),
        coverage: resolve(__dirname, '..', 'util/coverage/coverage.html'),
        rdmty: resolve(__dirname, '..', 'ui/dps/rdmty/dps.html'),
        xephero: resolve(__dirname, '..', 'ui/dps/xephero/xephero-cactbot.html'),
        eureka: resolve(__dirname, '..', 'ui/eureka/eureka.html'),
        jobs: resolve(__dirname, '..', 'ui/jobs/jobs.html'),
        oopsyraidsyLive: resolve(__dirname, '..', 'ui/oopsyraidsy/oopsyraidsy.html'),
        oopsyraidsySummary: resolve(__dirname, '..', 'ui/oopsyraidsy/oopsy_summary.html'),
        oopsyraidsyViewer: resolve(__dirname, '..', 'ui/oopsyraidsy/oopsy_viewer.html'),
        pullcounter: resolve(__dirname, '..', 'ui/pullcounter/pullcounter.html'),
        radar: resolve(__dirname, '..', 'ui/radar/radar.html'),
        raidboss: resolve(__dirname, '..', 'ui/raidboss/raidboss.html'),
        raidbossAlertsOnly: resolve(__dirname, '..', 'ui/raidboss/raidboss_alerts_only.html'),
        raidbossTimelineOnly: resolve(__dirname, '..', 'ui/raidboss/raidboss_timeline_only.html'),
        raidbossSilent: resolve(__dirname, '..', 'ui/raidboss/raidboss_silent.html'),
        raidemulator: resolve(__dirname, '..', 'ui/raidboss/raidemulator.html'),
        splitter: resolve(__dirname, '..', 'util/logtools/splitter.html'),
        test: resolve(__dirname, '..', 'ui/test/test.html'),
      },
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].bundle.js',
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
          if (/resources\/.*\.(?:ts|js)$/.test(id)) {
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
              return module;
            }
          }
        },
      },
    },
  },
  plugins: [
    viteStaticCopy({
      structured: true,
      targets: [
        {
          src: 'resources/{ffxiv,sounds,images}/**/*',
          dest: '',
        },
        {
          src: 'ui/**/*.css',
          dest: '',
        },
        {
          src: 'ui/*/skins/**/*',
          dest: '',
        },
        {
          src: 'ui/eureka/*.png',
          dest: '',
        },
        {
          src: 'util/coverage/missing_translations*.html',
          dest: '',
        },
        {
          src: 'user',
          dest: '',
        },
      ],
    }),
    ...manifestLoader([
      { dir: 'ui/raidboss/data', filename: 'raidboss.manifest' },
      { dir: 'ui/oopsyraidsy/data', filename: 'oopsy.manifest' },
    ]),
    ...(isCI ? [] : [checker({ typescript: true })]),
  ],
};

export default config;
