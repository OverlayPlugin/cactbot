/**
 * This script will automatically check all PRs in the repository with the 'needs-review' label,
 * and will remove the label for any that have a contributor review after the most recent commit.
 *
 * This can be tested locally with the Github CLI installed, with:
 * set GH_TOKEN=**** GITHUB_REPOSITORY=OverlayPlugin/cactbot
 * node ./.github/scripts/pr-review.cjs
 */
'use strict';

const github = require('@actions/github');
const { execSync } = require('child_process');

const label = 'needs-review';
const validReviewerRoles = ['COLLABORATOR', 'OWNER'];

/**
 * @typedef {ReturnType<typeof import("@actions/github").getOctokit>} GitHub
 * @typedef {{ owner: string, repo: string, pull_number: number }} identifier
 */

/**
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<number[]>}
 */
const getPRsByLabel = async (github, owner, repo) => {
  // Get all PRs (including closed) that have the requisite label, as the triggering workflow
  // has some latency for setup tasks, and otherwise wouldn't pick up approved PRs that are merged
  // before this script has time to complete.

  /**
   * @type {number[]}
   */
  const matchingPRs = [];
  const iterator = github.paginate.iterator(
    github.rest.search.issuesAndPullRequests,
    {
      q: `type:pr+repo:${owner}/${repo}+label:${label}`,
      per_page: 100, // eslint-disable-line camelcase
    },
  );
  for await (const page of iterator) {
    const prs = page.data;
    if (prs.length === 0)
      break;
    for (const pr of prs) {
      matchingPRs.push(pr.number);
    }
  }
  return matchingPRs;
};

/**
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @param {number[]} prs
 * @returns {Promise<void>}
 */
const checkAndRelabelPRs = async (github, owner, repo, prs) => {
  for (const prNumber of prs) {
    /**
     * @type identifier
     */
    const prIdentifier = { 'owner': owner, 'repo': repo, 'pull_number': prNumber };
    const { data: pr } = await github.rest.pulls.get(prIdentifier);
    console.log(`Evaluating PR #${prNumber} (state: ${pr.state})...`);

    // use the PR create-date as the starting point, in case all commits
    // are from before the PR was opened.
    console.log(`PR #${prNumber} created on: ${pr.created_at}`);
    let latestCommitTimestamp = new Date(pr.created_at).valueOf();

    const { data: prCommits } = await github.rest.pulls.listCommits(prIdentifier);
    if (prCommits)
      prCommits.forEach((commit) => {
        console.log(`Found commit ${commit.sha} (date: ${commit.commit.author.date})`);
        const commitTimestamp = new Date(commit.commit.author.date).valueOf();
        latestCommitTimestamp = Math.max(latestCommitTimestamp, commitTimestamp);
      });
    console.log(`Using ${new Date(latestCommitTimestamp).toISOString()} as last commit date.`);

    console.log(`Checking for valid contributor reviews...`);
    let latestReviewTimestamp = 0;
    const { data: prReviews } = await github.rest.pulls.listReviews(prIdentifier);
    if (prReviews)
      prReviews.forEach((review) => {
        const reviewTimestamp = new Date(review.submitted_at).valueOf();
        if (validReviewerRoles.includes(review.author_association)) {
          console.log(`Found valid review ${review.id} (date: ${review.submitted_at})`);
          latestReviewTimestamp = Math.max(latestReviewTimestamp, reviewTimestamp);
        }
      });

    if (latestReviewTimestamp > 0) {
      console.log(`Using ${new Date(latestReviewTimestamp).toISOString()} as last review date.`);
      if (latestReviewTimestamp > latestCommitTimestamp) {
        console.log(`PR #${prNumber} has a post-commit review; removing 'needs-review' label.`);
        execSync(`gh pr edit ${prNumber} --remove-label "needs-review"`);
      } else {
        console.log(`PR #${prNumber} has no review after the latest commit; skipping.`);
      }
    } else {
      console.log(`PR #${prNumber} has no reviews; skipping.`);
    }
    console.log(`Evaluation of PR #${prNumber} complete.`);
  }
};

const run = async () => {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const octokit = github.getOctokit(process.env.GH_TOKEN);
  const prs = await getPRsByLabel(octokit, owner, repo);

  if (prs.length === 0) {
    console.log(`No PRs found with the required label. Job complete.`);
    return;
  }
  console.log(`Found ${prs.length} PRs with the required label. Checking each...`);

  await checkAndRelabelPRs(octokit, owner, repo, prs);
  console.log(`Labeling update complete.`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
