import fs from 'fs';
import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';

import virtual from '@rollup/plugin-virtual';
import dedent from 'dedent';
import type { Plugin } from 'vite';

const recurseDir = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((file) => {
    const relPath = path.join(dir, file.name);
    if (file.isDirectory())
      return recurseDir(relPath);
    return relPath;
  });
};

const ignorePathRegexes = [/(?:^|\/)\w*\.manifest$/, /(?:^|\/)readme\.\w*$/i];

const findManifestFiles = (dir: string): string[] => {
  const actualDir = fs.lstatSync(dir).isFile() ? path.dirname(dir) : dir;
  return (
    recurseDir(actualDir)
      .map((file) => path.relative(actualDir, file))
      // Exclude specific paths
      .filter((file) => !ignorePathRegexes.some((regex) => regex.test(file)))
  );
};

const normalizePath = (path: string): string => {
  if (os.platform() !== 'win32')
    return path;
  return path.replace(/\\/g, '/');
};

export default function manifestLoader(
  manifestFiles: { dir: string; filename: string }[],
): Plugin[] {
  const cwd = process.cwd();
  return [
    ...manifestFiles.map(({ dir, filename }) =>
      virtual({
        [filename]: (() => {
          const lines = findManifestFiles(dir);

          let importStr = '';
          let outputStr = 'export default {';
          const hmrMap: Record<string, string> = {};

          lines.forEach((rawName, fileIdx) => {
            // normalize filepaths between windows / unix
            const name = normalizePath(rawName).replace(/^\/+/, '');
            const _importSource = `${name.endsWith('.txt') ? 'timeline:' : ''}${
              path.join(cwd, dir, name)
            }`;
            const importSource = normalizePath(_importSource).replace(/\\/g, '\\\\');

            // Use static imports instead of dynamic ones to put files in the bundle.
            const fileVar = `file${fileIdx}`;
            importStr += `import ${fileVar} from '${importSource}';\n`;
            if (importSource.startsWith('timeline:')) {
              hmrMap[importSource] = name;
            }
            outputStr += `'${normalizePath(name).replace(/\\/g, '\\\\')}': ${fileVar},`;
          });

          outputStr += '};';

          return dedent(`${importStr}
          if (import.meta.hot) {
            // Mark the files for HMR.
            // Since Vite would automatically reload the module when the file changes,
            // we don't need to do anything here.
            import.meta.hot.accept();
          }
          ${outputStr}`);
        })(),
      })
    ),
    (function timelineLoader() {
      const PREFIX = '\0timeline:';
      // eslint-disable-next-line object-shorthand
      return {
        name: 'timeline-loader',
        resolveId(id) {
          if (id.startsWith('timeline:') && id.endsWith('.txt')) {
            return `\0${id}`;
          }
          return null;
        },
        async load(id) {
          if (id.startsWith(PREFIX) && id.endsWith('.txt')) {
            const fsPath = id.slice(PREFIX.length);
            const content = await readFile(fsPath, 'utf-8');
            // watch the file for HMR
            this.addWatchFile(fsPath);
            return dedent(`
              const content = ${JSON.stringify(dedent(content.replace(/\r?\n/g, '\n')))};
              export default content;
            `);
          }
        },
      };
    })(),
  ];
}
