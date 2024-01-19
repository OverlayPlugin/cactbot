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
    let execError = false;
    let output = '';
    try {
      process.chdir(projectRoot);
      fs.rmSync('dist', { recursive: true, force: true });
      await exec('npx ttsc --declaration', [], {
        listeners: {
          stdout: (data) => output += data.toString(),
          stderr: (data) => {
            execError = true;
            output += data.toString();
          },
        },
      });
      if (execError)
        throw output;
    } catch (err) {
      console.error(err);
      execError = true;
    }
    assert(execError === false, output);
  });
});
