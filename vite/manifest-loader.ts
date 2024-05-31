import fs from 'fs';
import path from 'path';

import virtual from '@rollup/plugin-virtual';
import type { Plugin } from 'vite';

const recurseDir = (dir: string): string[] => {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((file) => {
    const relPath = path.join(dir, file.name);
    if (file.isDirectory())
return recurseDir(relPath);
    return relPath;
  });
};

const ignorePathRegexes = [/(?:^|\/)\w*_manifest\.txt$/, /(?:^|\/)readme\.\w*$/i];

const findManifestFiles = (dir: string): string[] => {
  const actualDir = fs.lstatSync(dir).isFile() ? path.dirname(dir) : dir;
  return (
    recurseDir(actualDir)
      .map((file) => path.relative(actualDir, file))
      // Exclude specific paths
      .filter((file) => !ignorePathRegexes.some((regex) => regex.test(file)))
  );
};

export default function manifestLoader(
  manifestFiles: { dir: string; filename: string }[],
): Plugin[] {
  const cwd = process.cwd();
  return manifestFiles.map(({ dir, filename }) =>
    virtual({
      [`${cwd}/${dir}/${filename}`]: (() => {
        const lines = findManifestFiles(dir);

        let importStr = '';
        let outputStr = 'export default {';

        lines.forEach((rawName, fileIdx) => {
          // normalize filepaths between windows / unix
          const name = rawName.replace(/\\/g, '/').replace(/^\//, '');
          const suffix = name.endsWith('.txt') ? '?raw' : '';

          // Use static imports instead of dynamic ones to put files in the bundle.
          const fileVar = `file${fileIdx}`;
          importStr += `import ${fileVar} from '${cwd}/${dir}/${name}${suffix}';\n`;
          outputStr += `'${name}': ${fileVar},`;
        });

        outputStr += '};';

        return `${importStr}\n${outputStr}`;
      })(),
    }),
  );
}
