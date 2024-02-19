'use strict';
const fs = require('fs');
const path = require('path');

// This linter script checks the format of a given GitHub workflow file
// to ensure it conforms to the format below (esp. newlines and spacing).
// --- WORKFLOW FILE FORMAT: ---
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

    // Check first three lines, which should be in a fixed format for every workflow file
    if (loopState === 'start') {
      if (lineNum === 1) {
        if (!line.match(/^name: [\w\s-]+$/))
          logError(lineNum, 1, 'Workflow name is missing or malformed.');
      } else if (lineNum === 2) {
        if (line !== '')
          logError(lineNum, 1, `Must have empty line following workflow name.`);
        if (line.match(/^on:$/))
          loopState = 'on';
      } else if (lineNum === 3) {
        if (!line.match(/^on:$/))
          logError(lineNum, 1, 'on: heading is missing or malformed.');
        loopState = 'on';
      } else {
        logError(lineNum, 1, 'Did not find on: block in expected place, and cannot continue.');
        fatalError = false;
      }
      return;
    }

    // The on: block can have varying levels of indentation and hyphens, so we can't
    // apply the same logic that we do to checking spacing and flow in the jobs: block.
    // We're going to let yamllint and actionlint handle this block, and just look for
    // a blank line before the beginning of the jobs: block.
    if (loopState === 'on') {
      if (line.match(/^ {2}/)) // ignore any indented lines
        return;
      else if (line === '') {
        loopState = 'jobs';
        return;
      } else if (line.match(/^jobs:/)) {
        logError(lineNum, 1, 'Must have empty line following on: block.');
        loopState = 'jobs'; // don't return; we want to process the jobs: header below
      } else {
        logError(
          lineNum,
          1,
          'Could not find jobs: heading immediately after on: block.  Cannot continue.',
        );
        fatalError = false;
        return;
      }
    }

    // We're first going to handle end-of-step, which was triggered by a newline
    // after a step in a job block. Depending on what this line is, we'll set the
    // loop state and proceed with normal processing below, or throw an error.
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

    // Fallback for job-name to keep flow control, even if we got here unexpectedly.
    // But don't return, just process as job-name below.
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

    // Fallback for steps to keep flow control, even if we got here unexpectedly.
    // But don't return, just process as job-detail below.
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
