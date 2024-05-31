import { defineConfig } from 'vite';

import manifestLoader from './manifest-loader';

export default defineConfig({
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
    minify: false,
  },
  plugins: [
    ...manifestLoader([
      { dir: 'ui/raidboss/data', filename: 'raidboss_manifest.txt' },
      { dir: 'ui/oopsyraidsy/data', filename: 'oopsy_manifest.txt' },
    ]),
  ],
});
