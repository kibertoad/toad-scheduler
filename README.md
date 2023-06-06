# toad-scheduler

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status](https://github.com/kibertoad/toad-scheduler/workflows/ci/badge.svg)](https://github.com/kibertoad/toad-scheduler/actions)
[![Coverage Status](https://coveralls.io/repos/kibertoad/toad-scheduler/badge.svg?branch=main)](https://coveralls.io/r/kibertoad/toad-scheduler?branch=main)

In-memory TypeScript job scheduler that repeatedly executes given tasks within specified intervals of time (e. g. "each 20 seconds"). Cron syntax is also supported in case you need it.

Node.js 12+ and modern browsers are supported

## Getting started

First install the package:

```bash
npm i toad-scheduler
```

Next, set up your jobs:

```js
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')

const scheduler = new ToadScheduler()

const task = new Task('simple task', () => { counter++ })
const job = new SimpleIntervalJob({ seconds: 20, }, task)

scheduler.addSimpleIntervalJob(job)

// when stopping your app
scheduler.stop()
```


## Usage with async tasks

In order to avoid unhandled rejections, make sure to use AsyncTask if your task is asynchronous:

```js
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler')

const scheduler = new ToadScheduler()

const task = new AsyncTask(
    'simple task', 
    () => { return db.pollForSomeData().then((result) => { /* continue the promise chain */ }) },
    (err: Error) => { /* handle error here */ }
)
const job = new SimpleIntervalJob({ seconds: 20, }, task)

scheduler.addSimpleIntervalJob(job)

// when stopping your app
scheduler.stop()
```

Note that in order to avoid memory leaks, it is recommended to use promise chains instead of async/await inside task definition. See [talk on common Promise mistakes](https://www.youtube.com/watch?v=XV-u_Ow47s0) for more details.

## Asynchronous error handling

Note that your error handlers can be asynchronous and return a promise. In such case an additional catch block will be attached to them, and should
there be an error while trying to resolve that promise, and logging error will be logged using the default error handler (`console.error`).

## Preventing task run overruns

In case you want to prevent second instance of a task from being fired up while first one is still executing, you can use `preventOverrun` options:
```js
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';

const scheduler = new ToadScheduler();

const task = new Task('simple task', () => {
    // if this task runs long, second one won't be started until this one concludes
	console.log('Task triggered');
});

const job = new SimpleIntervalJob(
	{ seconds: 20, runImmediately: true },
	task,
    { 
        id: 'id_1',
        preventOverrun: true,
    }
);

//create and start jobs
scheduler.addSimpleIntervalJob(job);
```

## Using IDs and ES6-style imports

You can attach IDs to tasks to identify them later. This is helpful in projects that run a lot of tasks and especially if you want to target some of the tasks specifically (e. g. in order to stop or restart them, or to check their status).

```js
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';

const scheduler = new ToadScheduler();

const task = new Task('simple task', () => {
	console.log('Task triggered');
});

const job1 = new SimpleIntervalJob(
	{ seconds: 20, runImmediately: true },
	task,
    { id: 'id_1' }
);

const job2 = new SimpleIntervalJob(
	{ seconds: 15, runImmediately: true },
	task,
    { id: 'id_2' }
);

//create and start jobs
scheduler.addSimpleIntervalJob(job1);
scheduler.addSimpleIntervalJob(job2);

// stop job with ID: id_2
scheduler.stopById('id_2');

// remove job with ID: id_1
scheduler.removeById('id_1');

// check status of jobs
console.log(scheduler.getById('id_1').getStatus()); // returns Error (job not found)

console.log(scheduler.getById('id_2').getStatus()); // returns "stopped" and can be started again

```

## Cron support

You can use CronJob instances for handling Cron-style scheduling:
```ts
      const task = new AsyncTask('simple task', () => {
        // Execute your asynchronous logic here
      })
      const job = new CronJob(
        {
          cronExpression: '*/2 * * * * *',
        },
        task,
        {
          preventOverrun: true,
        }
      )
      scheduler.addCronJob(job)
```

Note that you need to install "croner" library for this to work. Run `npm i croner` in order to install this dependency.

## Usage in clustered environments

`toad-scheduler` does not persist its state by design, and has no out-of-the-box concurrency management features. In case it is necessary
to prevent parallel execution of jobs in clustered environment, it is highly recommended to use [redis-semaphore](https://github.com/swarthy/redis-semaphore) in your tasks.

Here is an example:

```ts
import { randomUUID } from 'node:crypto'

import type { Redis } from 'ioredis'
import type { LockOptions } from 'redis-semaphore'
import { Mutex } from 'redis-semaphore'
import { AsyncTask } from 'toad-scheduler';

export type BackgroundJobConfiguration = {
    jobId: string
}

export type LockConfiguration = {
    lockName?: string
    refreshInterval?: number
    lockTimeout: number
}

// Abstract Job
export abstract class AbstractBackgroundJob {
    public readonly jobId: string
    protected readonly redis: Redis

    protected constructor(
        options: BackgroundJobConfiguration,
        redis: Redis,
    ) {
        this.jobId = options.jobId
        this.redis = redis
    }

    protected abstract processInternal(executionUuid: string): Promise<void>

    async process() {
        const uuid = randomUUID()

        try {
            await this.processInternal(uuid)
        } catch (err) {
            console.error(logObject)
        }
    }

    protected getJobMutex(key: string, options: LockOptions) {
        return new Mutex(this.redis, this.getJobLockName(key), options)
    }

    protected async tryAcquireExclusiveLock(lockConfiguration: LockConfiguration) {
        const mutex = this.getJobMutex(lockConfiguration.lockName ?? 'exclusive', {
            acquireAttemptsLimit: 1,
            refreshInterval: lockConfiguration.refreshInterval,
            lockTimeout: lockConfiguration.lockTimeout,
        })

        const lock = await mutex.tryAcquire()
        // If someone else already has this lock, skip
        if (!lock) {
            return
        }

        return mutex
    }

    protected getJobLockName(key: string) {
        return `${this.jobId}:locks:${key}`
    }
}

// Job example

const LOCK_TIMEOUT_IN_MSECS = 60 * 1000
const LOCK_REFRESH_IN_MSECS = 10 * 1000

export class SampleJob extends AbstractBackgroundJob {
  constructor(redis: Redis) {
    super(
      {
        jobId: 'SampleJob',
      },
      redis,
    )
  }

  protected async processInternal(executionUuid: string): Promise<void> {
    // We only want a single instance of this job running in entire cluster, let's see if someone else is already processing it
    const lock = await this.tryAcquireExclusiveLock({
      lockTimeout: LOCK_TIMEOUT_IN_MSECS,
      refreshInterval: LOCK_REFRESH_IN_MSECS,
    })

    // Job is already running, skip
    if (!lock) {
      this.logger.debug(`Job already running in another node, skipping (${executionUuid})`)
      return
    }

    try {
      // Process job logic here
      await this.sampleJobLogic()
    } finally {
      await lock.release()
    }
  }

  private async sampleJobLogic() {
    // dummy processing logic
    return Promise.resolve()
  }


// Job registration
function createTask(job: AbstractBackgroundJob): AsyncTask {
    return new AsyncTask(
        job.jobId,
        () => {
            return job.process()
        },
    )
}
```

## API for schedule

* `days?: number` - how many days to wait before executing the job for the next time;
* `hours?: number` - how many hours to wait before executing the job for the next time;
* `minutes?: number` - how many minutes to wait before executing the job for the next time;
* `seconds?: number` - how many seconds to wait before executing the job for the next time;
* `milliseconds?: number` - how many milliseconds to wait before executing the job for the next time;
* `runImmediately?: boolean` - if set to true, in addition to being executed on a given interval, job will also be executed immediately when added or restarted. 

## API for jobs

* `start(): void` - starts, or restarts (if it's already running) the job;
* `stop(): void` - stops the job. Can be restarted again with `start` command;
* `getStatus(): JobStatus` - returns the status of the job, which is one of: `running`, `stopped`.

## API for scheduler

* `addSimpleIntervalJob(job: SimpleIntervalJob): void` - registers and starts a new job;
* `addLongIntervalJob(job: SimpleIntervalJob): void` - registers and starts a new job with support for intervals longer than 24.85 days;
* `addIntervalJob(job: SimpleIntervalJob | LongIntervalJob): void` - registers and starts new interval-based job;
* `stop(): void` - stops all jobs, registered in the scheduler;
* `getById(id: string): Job` - returns the job with a given id.
* `existsById(id: string): boolean` - returns true if job with given id exists, false otherwise.
* `getAllJobs(): Job[]` - returns all registered jobs.
* `getAllJobsByStatus(status: JobStatus): Job[]` - returns all registered jobs with a given status.
* `stopById(id: string): void` - stops the job with a given id.
* `removeById(id: string): Job | undefined` - stops the job with a given id and removes it from the scheduler. If no such job exists, returns `undefined`, otherwise returns the job.
* `startById(id: string): void` - starts, or restarts (if it's already running) the job with a given id.

[npm-image]: https://img.shields.io/npm/v/toad-scheduler.svg
[npm-url]: https://npmjs.org/package/toad-scheduler
[downloads-image]: https://img.shields.io/npm/dm/toad-scheduler.svg
[downloads-url]: https://npmjs.org/package/toad-scheduler
