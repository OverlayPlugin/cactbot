import { exec } from '@actions/exec';
import { ArgumentParser, Namespace } from 'argparse';
import inquirer from 'inquirer';

// only support 'minor' and 'patch' for now
type VersionType = 'minor' | 'patch';
const versionTypes: VersionType[] = ['minor', 'patch'];
const defaultVersionType: VersionType = 'patch';

type ReleaseNamespaceInterface = {
  'type': VersionType | null;
  'summary': string | null;
  'draft': boolean | null;
};

class ReleaseNamespace extends Namespace implements ReleaseNamespaceInterface {
  'type': VersionType | null;
  'summary': string | null;
  'draft': boolean | null;
}

const configureParser = (): ArgumentParser => {
  const parser = new ArgumentParser({
    addHelp: true,
  });
  parser.addArgument(['-t', '--type'], {
    nargs: '1',
    type: 'string',
    choices: versionTypes,
    help: 'Type of version bump (e.g. 0.<minor>.<patch>)',
  });
  parser.addArgument(['-s', '--summary'], {
    nargs: '1',
    help: 'Set release summary (appended to release name in GitHub)',
  });
  parser.addArgument(['-d', '--draft'], {
    nargs: '?',
    constant: true,
    help: 'Create as a draft release (release must be manually published)',
  });
  return parser;
};

const run = async (): Promise<unknown> => {
  const parser = configureParser();
  const args = new ReleaseNamespace({});
  parser.parseArgs(undefined, args);

  const questions = [
    {
      type: 'list',
      name: 'type',
      message: 'Type of version bump?',
      choices: versionTypes,
      default: defaultVersionType,
      when: () => args.type === null || args.type === undefined,
    },
    {
      type: 'input',
      name: 'summary',
      message: 'Short summary of the version changes (for release notes):',
      when: () => args.summary === null || args.summary === undefined,
    },
    {
      type: 'confirm',
      name: 'draft',
      message: 'Create as a draft release?',
      default: false,
      when: () => args.draft === null || args.draft === undefined,
    },
  ] as const;
  return inquirer.prompt<ReleaseNamespaceInterface>(questions)
    .then(async (answers) => {
      const type = args.type ?? answers.type ?? defaultVersionType;
      const summary = args.summary ?? answers.summary ?? '';
      if (summary === '') {
        console.error('Error: You must provide a valid release summary.');
        process.exit(-1);
      }
      const draft = args.draft ?? answers.draft ?? false;
      const npmSet =
        `npm pkg set "releaseSummary"="${summary}" "releaseInDraft"="${draft.toString()}"`;
      await exec(npmSet);
      await exec(`npm version ${type}`);
    }).catch(console.error);
};

void run();
