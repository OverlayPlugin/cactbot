import { assert } from 'chai';

import Util, {
  allJobs,
  casterDpsJobs,
  craftingJobs,
  gatheringJobs,
  healerJobs,
  limitedJobs,
  meleeDpsJobs,
  rangedDpsJobs,
  tankJobs,
} from '../../resources/util';
import { Job, Role } from '../../types/job';

class JobInfo {
  constructor(public name: Job, public role: Role, public actions: string[] = []) {}
}

// Expect to update these as patches and expansions change job capabilities
const jobs: JobInfo[] = ((): JobInfo[] => {
  const jobs: JobInfo[] = [];

  // Initialize all the jobs with standardized role action values
  tankJobs.forEach((job: Job) => jobs.push(new JobInfo(job, 'tank', ['Silence', 'Stun'])));
  healerJobs.forEach((job) => jobs.push(new JobInfo(job, 'healer', ['Cleanse', 'Sleep'])));
  meleeDpsJobs.forEach((job) => jobs.push(new JobInfo(job, 'dps', ['Feint', 'Stun'])));
  rangedDpsJobs.forEach((job) => jobs.push(new JobInfo(job, 'dps', ['Silence'])));
  casterDpsJobs.forEach((job) => jobs.push(new JobInfo(job, 'dps', ['Addle', 'Sleep'])));
  craftingJobs.forEach((job) => jobs.push(new JobInfo(job, 'crafter')));
  gatheringJobs.forEach((job) => jobs.push(new JobInfo(job, 'gatherer')));

  // Special classes
  jobs.find((job: JobInfo) => job.name === 'BRD')?.actions.push('Cleanse');
  jobs.find((job: JobInfo) => job.name === 'BLU')?.actions.push(
    'Cleanse',
    'Silence',
    'Stun',
  );

  return jobs;
})();

describe('util tests', () => {
  // Check test job values match actual values from util.js and return their expected values
  it('jobs should support Util.canX if it can', () => {
    const arr: [string, (job: Job) => boolean][] = [
      ['Addle', Util.canAddle],
      ['Cleanse', Util.canCleanse],
      ['Feint', Util.canFeint],
      ['Silence', Util.canSilence],
      ['Sleep', Util.canSleep],
      ['Stun', Util.canStun],
    ];
    arr.forEach(([action, functionCall]) => {
      // If job can do X, assert canX returns true
      jobs.filter((job) => job.actions.includes(action))
        .forEach((job) => assert(functionCall(job.name)));
      // If job can't do X, assert canX returns false
      jobs.filter((job) => !job.actions.includes(action))
        .forEach((job) => assert(!functionCall(job.name)));
    });
  });
  it('jobs should have the correct roles', () => {
    const arr: [Role, (job: Job) => boolean][] = [
      ['crafter', Util.isCraftingJob],
      ['dps', Util.isDpsJob],
      ['gatherer', Util.isGatheringJob],
      ['healer', Util.isHealerJob],
      ['tank', Util.isTankJob],
    ];
    arr.forEach(([role, functionCall]) => {
      // If job is a role, assert isRole returns true
      jobs.filter((job) => job.role === role).forEach((job) => assert(functionCall(job.name)));
      // If job is not a role, assert isRole returns false
      jobs.filter((job) => job.role !== role).forEach((job) => assert(!functionCall(job.name)));
    });
  });
  it('jobs should be in the role map correctly', () => {
    jobs.forEach((job) => assert.deepEqual(job.role, Util.jobToRole(job.name)));
  });
  it('jobs should be set as combat roles correctly', () => {
    jobs.filter((job) => ['tank', 'healer', 'dps'].includes(job.role)).forEach((job) =>
      assert(Util.isCombatJob(job.name))
    );
    jobs.filter((job) => ['crafter', 'gatherer'].includes(job.role)).forEach((job) =>
      assert(!Util.isCombatJob(job.name))
    );
  });
  it('jobs should be set as limited jobs correctly', () => {
    limitedJobs.forEach((job) => assert(Util.isLimitedJob(job)));
    allJobs.filter((job) => !limitedJobs.includes(job)).forEach((job) =>
      assert(!Util.isLimitedJob(job))
    );
  });
});
