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
    github.rest.issues.listForRepo,
    {
      owner: owner,
      repo: repo,
      state: 'all',
      labels: `${label}`,
      per_page: 100, // eslint-disable-line camelcase
    },
  );
  for await (const page of iterator) {
    const issues = page.data;
    if (issues.length === 0)
      break;
    for (const issue of issues) {
      if (issue.pull_request)
        matchingPRs.push(issue.number);
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
    console.log(`Evaluating PR #${prNumber} (state: ${pr.state}) (created: ${pr.created_at})...`);

    const createdTimestamp = new Date(pr.created_at).valueOf();
    let latestCommitTimestamp = 0;
    let latestCommitSha = '';
    const { data: prCommits } = await github.rest.pulls.listCommits(prIdentifier);
    if (prCommits)
      prCommits.forEach((commit) => {
        console.log(`Found commit ${commit.sha} (date: ${commit.commit.author.date})`);
        const commitTimestamp = new Date(commit.commit.author.date).valueOf();
        if (commitTimestamp > latestCommitTimestamp) {
          latestCommitTimestamp = commitTimestamp;
          latestCommitSha = commit.sha;
        }
      });

    // if all commits happened before the PR was opened, use the PR created date
    latestCommitTimestamp = Math.max(latestCommitTimestamp, createdTimestamp);
    console.log(
      `Latest commit/create date: ${
        new Date(latestCommitTimestamp).toISOString()
      } (sha: ${latestCommitSha}).`,
    );
    console.log(`Checking for valid contributor reviews...`);

    // Don't consider review timestamps, because a new comment/reply to an old review results
    // in a new "review" event and entry on the 'reviews' endpoint. Instead, check whether
    // there is a valid review corresponding to the latest commit.
    const { data: prReviews } = await github.rest.pulls.listReviews(prIdentifier);
    if (prReviews) {
      let foundReviewofLatestCommitSha = false;
      prReviews.forEach((review) => {
        if (validReviewerRoles.includes(review.author_association)) {
          console.log(
            `Found valid review ${review.id} (date: ${review.submitted_at}) (sha: ${review.commit_id})`,
          );
          if (review.commit_id === latestCommitSha) {
            foundReviewofLatestCommitSha = true;
            console.log(`Review corresponds to most recent commit.`);
          }
        }
      });

      if (foundReviewofLatestCommitSha) {
        console.log(`PR #${prNumber} has a valid post-commit review; removing '${label}' label.`);
        execSync(`gh pr edit ${prNumber} --remove-label "${label}"`);
      } else {
        console.log(`PR #${prNumber} has no valid review of the latest commit; skipping.`);
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
