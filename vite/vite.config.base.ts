import isCI from 'is-ci';
import type { UserConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import manifestLoader from './manifest-loader';

const config: UserConfig = {
  build: {
    rollupOptions: {
      input: {
        config: 'ui/config/config.html',
        coverage: 'util/coverage/coverage.html',
        rdmty: 'ui/dps/rdmty/dps.html',
        xephero: 'ui/dps/xephero/xephero-cactbot.html',
        eureka: 'ui/eureka/eureka.html',
        jobs: 'ui/jobs/jobs.html',
        oopsyraidsyLive: 'ui/oopsyraidsy/oopsyraidsy.html',
        oopsyraidsySummary: 'ui/oopsyraidsy/oopsy_summary.html',
        oopsyraidsyViewer: 'ui/oopsyraidsy/oopsy_viewer.html',
        pullcounter: 'ui/pullcounter/pullcounter.html',
        radar: 'ui/radar/radar.html',
        raidboss: 'ui/raidboss/raidboss.html',
        raidbossAlertsOnly: 'ui/raidboss/raidboss_alerts_only.html',
        raidbossTimelineOnly: 'ui/raidboss/raidboss_timeline_only.html',
        raidbossSilent: 'ui/raidboss/raidboss_silent.html',
        raidemulator: 'ui/raidboss/raidemulator.html',
        splitter: 'util/logtools/splitter.html',
        test: 'ui/test/test.html',
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
          src: 'ui/*/skins/**/*',
          dest: '',
        },
        {
          src: 'util/coverage/missing_translations*.html',
          dest: '',
        },
      ],
    }),
    ...manifestLoader([
      { dir: 'ui/raidboss/data', filename: 'raidboss_manifest.txt' },
      { dir: 'ui/oopsyraidsy/data', filename: 'oopsy_manifest.txt' },
    ]),
    ...(isCI ? [] : [checker({ typescript: true })]),
  ],
};

export default config;
