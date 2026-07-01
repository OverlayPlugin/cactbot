import path from 'node:path';

import { merge } from 'webpack-merge';

import prodConfig from './webpack.prod';

export default merge(prodConfig, {
  devtool: 'inline-source-map',
  cache: {
    cacheDirectory: `${path.dirname(__dirname)}/node_modules/.cache/webpack.ghpages`,
  },
});
