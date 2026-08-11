import { assert } from 'chai';

import Util, {
  allJobs,
  AnyDirection,
  casterDpsJobs,
  craftingJobs,
  gatheringJobs,
  getSortDirectionsClockwiseFunction,
  getSortPointsClockwiseFunction,
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

  it('sorts directions clockwise from a reference direction and undefined reference', () => {
    const dirs: AnyDirection[] = [
      'dirNE',
      'dirSW',
      'dirN',
      'dirNW',
      'dirS',
      'dirW',
      'dirSE',
      'dirE',
    ];

    let expected = ['dirNW', 'dirN', 'dirNE', 'dirE', 'dirSE', 'dirS', 'dirSW', 'dirW'];
    let sorted = dirs.sort(getSortDirectionsClockwiseFunction('dirNW'));
    assert.deepEqual(sorted, expected);

    expected = ['dirN', 'dirNE', 'dirE', 'dirSE', 'dirS', 'dirSW', 'dirW', 'dirNW'];
    sorted = dirs.sort(getSortDirectionsClockwiseFunction());
    assert.deepEqual(sorted, expected);
  });

  it('sorts directions and unknowns, putting unknowns at the end', () => {
    const dirs1: AnyDirection[] = [
      'dirNE',
      'unknown',
      'dirN',
      'unknown',
      'dirNW',
      'dirS',
    ];

    const expected1 = ['dirN', 'dirNE', 'dirS', 'dirNW', 'unknown', 'unknown'];
    assert.deepEqual(dirs1.sort(getSortDirectionsClockwiseFunction()), expected1);

    const dirs2: AnyDirection[] = ['dirNE', 'unknown', 'dirN', 'dirNW'];
    const expected2 = ['dirNW', 'dirN', 'dirNE', 'unknown'];
    assert.deepEqual(
      dirs2.sort(getSortDirectionsClockwiseFunction('dirNW')),
      expected2,
    );
  });

  it('sorts points clockwise from a reference point', () => {
    const getPoints = () => [
      { id: 'NE', x: 1, y: -1 },
      { id: 'SW', x: -1, y: 1 },
      { id: 'N', x: 0, y: -1 },
      { id: 'NW', x: -1, y: -1 },
      { id: 'S', x: 0, y: 1 },
      { id: 'W', x: -1, y: 0 },
      { id: 'SE', x: 3, y: 3 },
      { id: 'E', x: 2, y: 0 },
    ];

    const expected = ['NW', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W'];

    let [refX, refY] = [-1, -1]; // same as NW
    let sorted = getPoints().sort(
      getSortPointsClockwiseFunction({ x: 0, y: 0 }, { x: refX, y: refY }),
    );
    assert.deepEqual(sorted.map((point) => point.id), expected);

    [refX, refY] = [-1.2, -0.8];
    sorted = getPoints().sort(getSortPointsClockwiseFunction({ x: 0, y: 0 }, { x: refX, y: refY }));
    assert.deepEqual(sorted.map((point) => point.id), expected);
  });

  it('sorts points clockwise with numeric reference', () => {
    const points = [
      { id: 'NE', x: 1, y: -1 },
      { id: 'NW', x: -1, y: -1 },
      { id: 'N', x: 0, y: -1 },
    ];

    const sorted = points.sort(
      getSortPointsClockwiseFunction({ x: 0, y: 0 }, 0), // reference is south
    );

    assert.deepEqual(sorted.map((point) => point.id), ['NW', 'N', 'NE']);
  });

  it('keeps points in input order when all angles are equal', () => {
    const points = [
      { id: '1', x: 0, y: -3 },
      { id: '2', x: 0, y: -4 },
      { id: '3', x: 0, y: -1 },
      { id: '4', x: 0, y: -2 },
    ];

    const sorted = points.sort(getSortPointsClockwiseFunction({ x: 0, y: 0 }));
    assert.deepEqual(sorted.map((point) => point.id), ['1', '2', '3', '4']);
  });
});
