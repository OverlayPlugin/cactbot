/**
 * This script will automatically check all PRs in the repository, and for any that have
 *  the 'needs-review' label *and* a review from a contributor posted after
 * the date of the most recent commit, it will remove the 'needs-review' label.
 *
 * This can be tested locally with the Github CLI installed, with:
 * set GH_TOKEN=**** GH_REPO=OverlayPlugin/cactbot
 * node ./.github/scripts/pr-review.cjs
 */
'use strict';

const github = require('@actions/github');
const { execSync } = require('child_process');

/**
 * @typedef {ReturnType<typeof import("@actions/github").getOctokit>} GitHub
 */

/**
 * @param {GitHub} github
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<void>}
 */
const checkAllPRs = async (github, owner, repo) => {
  // Start by grabbing all PRs (including closed), as the workflow that fires this script
  // will have latency and otherwise wouldn't pick up PRs that are approved and merged
  // before the script has time to complete.
  const iterator = github.paginate.iterator(github.rest.pulls.list, {
    owner: owner,
    repo: repo,
    per_page: 100, // eslint-disable-line camelcase
    state: 'all',
  });

  // iterate through each response
  console.log('Fetching PRs...');
  for await (const { data: prs } of iterator) {
    for (const pr of prs) {
      const prNumber = pr.number;

      // check if the PR has a `needs-review` label; if not, skip for efficiency
      const prLabels = pr.labels;
      const hasNeedsReviewLabel = prLabels
        .map((label) => label.name)
        .includes('needs-review');
      if (!hasNeedsReviewLabel)
        continue;

      console.log(`PR #${pr.number} has 'needs-review' label.  Checking...`);

      // use the PR created date as the starting point, in case all commits
      // are from before the PR was opened.
      console.log(`PR created on: ${pr.created_at}`);
      let latestCommitDate = new Date(pr.created_at).valueOf();
      let latestReviewDate = 0;

      const { data: prCommits } = await github.rest.pulls.listCommits({
        owner: owner,
        repo: repo,
        pull_number: prNumber, // eslint-disable-line camelcase
      });

      if (prCommits)
        prCommits.forEach((commit) => {
          console.log(`Found commit ${commit.sha} (date: ${commit.commit.author.date})`);
          const commitDate = new Date(commit.commit.author.date).valueOf();
          latestCommitDate = Math.max(latestCommitDate, commitDate);
        });
      console.log(`Using latest commit date: ${new Date(latestCommitDate).toISOString()}`);

      const { data: prReviews } = await github.rest.pulls.listReviews({
        owner: owner,
        repo: repo,
        pull_number: prNumber, // eslint-disable-line camelcase
      });
      if (prReviews)
        prReviews.forEach((review) => {
          const reviewDate = new Date(review.submitted_at).valueOf();
          const reviewerRole = review.author_association;
          if (reviewerRole === 'COLLABORATOR' || reviewerRole === 'OWNER') {
            console.log(`Found valid review ${review.id} (date: ${review.submitted_at})`);
            latestReviewDate = Math.max(latestReviewDate, reviewDate);
          }
        });

      if (latestReviewDate > 0) {
        console.log(`Using latest review date: ${new Date(latestReviewDate).toISOString()}`);
        if (latestReviewDate > latestCommitDate) {
          console.log(`PR #${prNumber} has a post-commit review; removing 'needs-review' label.`);
          execSync(`gh pr edit ${prNumber} --remove-label "needs-review"`);
        } else {
          console.log(`PR #${prNumber} has no review after the latest commit; skipping.`);
        }
      } else {
        console.log(`PR #${prNumber} has no reviews; skipping.`);
      }
    }
  }
  console.log('Update complete.');
};

const run = async () => {
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const octokit = github.getOctokit(process.env.GH_TOKEN);

  await checkAllPRs(octokit, owner, repo);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
