'use strict';
const fs = require('fs');
const path = require('path');

// This linter script checks the format of a given GitHub workflow file
// to ensure it conforms to the format below (esp. newlines and spacing).
// --- WORKFLOW FILE FORMAT: ---
// # [optional - comment line(s)]]
// name: <workflow name>
//
// on:
//   ...
//     ...
//
// jobs:
//   job1_name:
//     ...
//     steps:
//       - step1: ...
//
//       - [step2, etc.]
//
//   [job2_name:]
//     ...
//

const workflowDir = path.join(__dirname, '..', 'workflows');
const fileExts = ['.yml', '.yaml'];

let ghErrOutput = '';
let currFile = '';
let foundError = false;
let fileErrors = [];

const logError = (line, col, msg) => {
  // Format error message for GitHub Actions output
  // https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-error-message
  const errStr =
    `::error file=.\\github\\workflows\\${currFile},line=${line},col=${col}::${line}:${col} ${msg}`;
  fileErrors.push(errStr);
};

const processFileErrors = () => {
  if (fileErrors.length > 0) {
    foundError = true;

    ghErrOutput += `::group::.\\.github\\workflows\\${currFile}\n`;
    fileErrors.forEach((err) => {
      ghErrOutput += `${err}\n`;
    });
    ghErrOutput += '::endgroup::\n';

    console.log(`Found ${fileErrors.length} errors in ${currFile}.`);
  }
  fileErrors = [];
};

const parseFile = (file) => {
  // loopState is used to track the next expected line in the workflow file.
  // Unless something is super-wonky with the workflow file, it should progress as follows:
  // 'start' -> 'pre-on' (empty line) -> 'on' -> 'on-block' -> 'jobs' ->
  // > 'job-name' -> 'job-detail' ->
  // >>>  'step-name' -> 'step-detail' -> 'end-of-step' -> (back to job-name or step-name)
  let lineNum = 0;
  let loopState = 'start';
  let fatalError = false;
  fs.readFileSync(file, 'utf8').split('\r\n').forEach((line) => {
    ++lineNum;

    // If we've hit a really bad error, don't process further lines; just finish the loop.
    if (fatalError)
      return;

    // If we have a line that consists only of whitespace, throw an error, but then treat it
    // like an empty line and continue processing.
    if (line.length > 0 && line.trim().length === 0) {
      logError(lineNum, 1, 'Line consists only of whitespace characters and should be trimmed.');
      line = '';
    }

    // Ignore comment lines.
    if (line.trim().match(/^#/))
      return;

    // Check first three lines (after opening comment lines), which should be in a fixed format
    // for every workflow file.
    if (loopState === 'start') {
      if (line === '') {
        logError(lineNum, 1, 'Remove empty line between opening comments and name: header.');
        return;
      }
      if (!line.match(/^name: [\w\s-]+$/))
        logError(lineNum, 1, 'Workflow name is missing or malformed.');
      loopState = 'pre-on';
      return;
    }
    if (loopState === 'pre-on') {
      if (line !== '')
        logError(lineNum, 1, `Must have empty line following workflow name.`);
      loopState = 'on';
      if (!line.match(/^on:/)) // if this is the on: block, continue processing; otherwise return
        return;
    }
    if (loopState === 'on') {
      if (!line.match(/^on:$/))
        logError(lineNum, 1, 'on: heading is missing or malformed.');
      loopState = 'on-block';
      return;
    }

    // The on: block can have varying levels of indentation and hyphens, so we can't
    // apply the same logic that we do to checking spacing and flow in the jobs: block.
    // We're going to let yamllint and actionlint handle this block, and just look for
    // a blank line before the beginning of the jobs: block.
    if (loopState === 'on-block') {
      if (line.match(/^ {2}/)) // ignore any indented lines
        return;
      else if (line === '') {
        loopState = 'jobs';
        return;
      } else if (line.match(/^jobs:/)) {
        logError(lineNum, 1, 'Must have empty line following on: block.');
        loopState = 'jobs'; // don't return; we want to process the jobs: header below
      } else {
        logError(lineNum, 1, 'Expected jobs: header after on: block.  Cannot continue.');
        fatalError = true;
        return;
      }
    }

    // Out of order, but needed here:
    // We need to handle end-of-step, which was triggered by a newline after a step in a job block.
    // Depending on the line, we'll set loopState and proceed with processing below, or error out.
    if (loopState === 'end-of-step') {
      if (line.match(/^ {2}[\w]/))
        loopState = 'job-name';
      else if (line.match(/^ {6}- [\w]/))
        loopState = 'step-name';
      else if (line === '') {
        logError(lineNum, 1, 'Too many sequential blank lines.');
        return;
      } else {
        logError(lineNum, 1, 'Unexpected line found after step details block.  Cannot continue.');
        fatalError = true;
        return;
      }
    }

    // Now that we're in the jobs: block, we can apply some logic to check for spacing and flow.
    if (line.match(/^jobs:/) || loopState === 'jobs') {
      if (loopState !== 'jobs') // we got here, but not right after an on: block
        logError(lineNum, 1, 'jobs: section is not in expected location after on: section.');
      if (!line.match(/^jobs:$/))
        logError(lineNum, 6, 'Found trailing characters or whitespace after jobs:');
      loopState = 'job-name';
      return;
    }

    // Early fallback for job-name to keep flow control, even if we got here unexpectedly.
    // But don't return, just keep processing as job-name below.
    if (line.match(/^ {2}[\w]/) && loopState !== 'job-name') {
      if (loopState === 'step-detail')
        logError(lineNum, 3, 'Must have empty line between job definitions.');
      else
        logError(lineNum, 3, 'Unexpected job definition found.');
      loopState = 'job-name';
    }

    // In job-name, we're only looking for a properly formatted job name.
    // Anything else, we'll throw an error.
    if (loopState === 'job-name') {
      if (line === '')
        logError(lineNum, 1, 'Empty line found; job name expected.');
      if (line.match(/^ {2}[\w]/)) {
        if (!line.match(/^ {2}[\w-]+:$/))
          logError(lineNum, 3, 'Improperly formatted job name, or whitespace found.');
        loopState = 'job-detail';
      } else {
        logError(lineNum, 1, 'Did not find expected job name.  Cannot continue.');
        fatalError = true;
      }
      return;
    }

    // Early fallback for steps to keep flow control, even if we got here unexpectedly.
    // But don't return, just keep processing as job-detail below.
    if (line.match(/^ {4}steps:/) && loopState !== 'job-detail') {
      logError(lineNum, 5, 'Unexpected steps: header found; not within a job: block.');
      loopState = 'job-detail';
    }

    // In job-detail, we'll allow any level of indentation (yamllint and actionlint will complain
    // if something isn't right). We'll keep looking until we find 'steps:', and if we find an
    // empty line first, we'll throw an error.
    if (loopState === 'job-detail') {
      if (line === '')
        logError(lineNum, 1, 'Empty line found before job steps: block.');
      else if (line.match(/^ {4}steps:/)) {
        if (!line.match(/^ {4}steps:$/))
          logError(lineNum, 5, 'Improperly formatted steps: header, or trailing whitespace found.');
        loopState = 'step-name';
      } else if (line.match(/^ {4}[\w\s-]/)) {
        return; // ignore job details
      } else {
        logError(lineNum, 1, 'Unexpected line found in job details block.  Cannot continue.');
        fatalError = true;
      }
      return;
    }

    // In step-name, we're only looking for a properly formatted step name/action.
    // Anything else, we'll throw an error.
    if (loopState === 'step-name') {
      if (line === '')
        logError(lineNum, 1, 'Empty line found; step expected.');
      if (line.match(/^ {6}- [\w]/)) {
        if (!line.match(/^ {6}- [\w-]+: /))
          logError(lineNum, 7, 'Improperly formatted step.');
        loopState = 'step-detail';
      } else {
        logError(lineNum, 1, 'Did not find expected step.  Cannot continue.');
        fatalError = true;
      }
      return;
    }

    // In step-detail, we'll accept 2+ indentation from the step, or a newline.
    // Anything else, we'll throw an error.
    if (loopState === 'step-detail') {
      if (line === '')
        loopState = 'end-of-step';
      else if (line.match(/^ {8}[\w\s]/)) {
        if (!line.match(/^ {8}[\w\s-]+/))
          logError(lineNum, 9, 'Improperly formatted step details.');
      } else if (line.match(/^ {6}- [\w]/)) {
        // process this like a new step, but don't change loopState
        // just continue the loop as if we're now in step-detail
        logError(lineNum, 7, 'New step must be preceded by an empty line.');
        if (!line.match(/^ {6}- [\w-]+: /))
          logError(lineNum, 7, 'Improperly formatted step.');
      } else {
        logError(lineNum, 1, 'Unexpected line found in step details block.  Cannot continue.');
        fatalError = true;
      }
      return;
    }

    // Should never reach this point, but if we do, throw an error and set fatalError.
    logError(lineNum, 1, 'Reached end of parsing steps unexpectedly.  Something went wrong.');
    fatalError = true;
  });
};

const main = () => {
  console.log('Starting lint-workflow...');
  fs.readdirSync(workflowDir).forEach((file) => {
    currFile = file;
    if (fileExts.includes(path.extname(file).toLowerCase())) {
      console.log(`Processing ${file}...`);
      parseFile(path.join(workflowDir, file));
      processFileErrors();
      console.log(`Finished processing ${file}.`);
    } else
      console.log(`Skipping ${file}...`);
  });

  if (foundError) {
    console.log(ghErrOutput);
    console.log('Errors found in workflow files.');
    process.exit(-1);
  } else {
    console.log('No errors found in workflow files.');
  }
};

void main();
