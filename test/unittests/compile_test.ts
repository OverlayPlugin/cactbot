import assert from 'assert';
import fs from 'fs';
import path from 'path';

import { exec } from '@actions/exec';

const projectRoot = path.resolve('.');

describe('compile test', () => {
  afterEach(() => {
    process.chdir(projectRoot);
    fs.rmSync('dist', { recursive: true, force: true });
  });

  it('npm package should compile successfully', async function() {
    // eslint-disable-next-line @typescript-eslint/no-invalid-this
    this.timeout(30000); // allow a 30s timeout
    let output = '';
    let exitCode = -1;
    try {
      process.chdir(projectRoot);
      fs.rmSync('dist', { recursive: true, force: true });
      exitCode = await exec('npx tsc --declaration', [], {
        listeners: {
          stdout: (data) => output += data.toString(),
          stderr: (data) => output += data.toString(),
        },
      });
    } catch (err) {
      console.error(err);
    }
    assert(exitCode === 0, output);
  });
});
