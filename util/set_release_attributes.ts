import fs from 'fs';
import path from 'path';

import { ArgumentParser, Namespace } from 'argparse';

// This script should be run prior to 'npm version' to set the release attributes.

type ReleaseNamespaceInterface = {
  'summary': string | null;
  'draft': boolean | null;
};

class ReleaseNamespace extends Namespace implements ReleaseNamespaceInterface {
  'summary': string | null;
  'draft': boolean | null;
}

const parser = new ArgumentParser({
  addHelp: true,
});
parser.addArgument(['-s', '--summary'], {
  nargs: '?',
  help: 'Set release summary (appended to release name in GitHub)',
});
parser.addArgument(['-d', '--draft'], {
  nargs: '?',
  constant: true,
  help: 'Create as a draft release (release must be manually published)',
});

const normalizePath = (file: string): string => {
  return path.relative(process.cwd(), file);
};

const assemblyInfoFiles = [
  'plugin/CactbotEventSource/Properties/AssemblyInfo.cs',
  'plugin/CactbotOverlay/Properties/AssemblyInfo.cs',
] as const;

const releaseHeadingRegex = /(?<=\("AssemblyReleaseSummary", ").*(?="\))/gm;
const releaseAsDraftRegex = /(?<=\("AssemblyReleaseAsDraft", ").*(?="\))/gm;

const writeReleaseAttributes = () => {
  const args: ReleaseNamespaceInterface = new ReleaseNamespace({});
  parser.parseArgs(undefined, args);
  const summary = (args.summary === null || args.summary === undefined) ? '' : args.summary.trim();
  const draft = (args.draft === null || args.draft === undefined) ? false : true;

  console.log(`Release summary: ${summary}`);
  console.log(`Release as draft: ${draft.toString()}`);

  for (const file of assemblyInfoFiles) {
    const contents = fs.readFileSync(normalizePath(file), 'utf8');
    let newData = contents.replace(releaseHeadingRegex, summary);
    newData = newData.replace(releaseAsDraftRegex, draft.toString());
    fs.writeFileSync(file, newData, 'utf8');
  }
  console.log('Assembly files updated with release attributes.');
};

void writeReleaseAttributes();
