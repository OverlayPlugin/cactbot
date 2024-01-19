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
    let execError;
    try {
      process.chdir(projectRoot);
      fs.rmSync('dist', { recursive: true, force: true });
      let stdout = '';
      let stderr = '';
      await exec('npx ttsc --declaration', [], {
        listeners: {
          stdout: (data) => stdout += data.toString(), // suppress
          stderr: (data) => stderr += data.toString(),
        },
      });
      if (stderr.length > 0)
        throw stderr;
    } catch (err) {
      console.error(err);
      execError = err;
    }
    assert.ifError(execError);
  });
});
