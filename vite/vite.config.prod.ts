import path from 'node:path/posix';

import { mergeConfig, type UserConfig } from 'vite';
import { ViteMinifyPlugin as htmlMinify } from 'vite-plugin-minify';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import baseOptions from './vite.config.base';

export default mergeConfig<UserConfig, UserConfig>(baseOptions, {
  build: {
    cssMinify: true,
    rollupOptions: {
      output: {
        format: 'system',
      },
    },
  },
  plugins: [
    htmlMinify(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/systemjs/dist/s.min.js',
          dest: 'ui/common',
          rename: 'systemjs-hook.bundle.js',
        },
      ],
    }),
    (function() {
      return {
        name: 'vite:fix-offline',
        transformIndexHtml: function(html, ctx) {
          return {
            html: html.replace(/\scrossorigin\s/g, ' ').replace(/<script\s*type="module" src=/g, '<script data-systemjs-hook data-src='),
            tags: [
              {
                tag: 'script',
                id: 'vite-systemjs-hook',
                attrs: {
                  src: path.relative(path.dirname(path.normalize(ctx.path)), '/ui/common/systemjs-hook.bundle.js'),
                },
                injectTo: 'head',
              },
              {
                tag: 'script',
                id: 'vite-systemjs-load',
                children: `
                  document.addEventListener('DOMContentLoaded', function() {
                    document.querySelectorAll('script[data-systemjs-hook]').forEach(function(script) {
                      System.import(script.getAttribute('data-src'));
                    });
                  });
                `,
              },
            ],
          };
        },
      };
    })(),
  ],
});
