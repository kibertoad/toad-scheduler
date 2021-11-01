# toad-scheduler

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status](https://github.com/kibertoad/toad-scheduler/workflows/ci/badge.svg)](https://github.com/kibertoad/toad-scheduler/actions)
[![Coverage Status](https://coveralls.io/repos/kibertoad/toad-scheduler/badge.svg?branch=main)](https://coveralls.io/r/kibertoad/toad-scheduler?branch=main)

In-memory Node.js job scheduler that repeatedly executes given tasks within specified intervals of time (e. g. "each 20 seconds").

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
	'id_1'
);

const job2 = new SimpleIntervalJob(
	{ seconds: 15, runImmediately: true },
	task,
	'id_2'
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
* `stopById(id: string): void` - stops the job with a given id.
* `removeById(id: string): Job | undefined` - stops the job with a given id and removes it from the scheduler. If no such job exists, returns `undefined`, otherwise returns the job.
* `startById(id: string): void` - starts, or restarts (if it's already running) the job with a given id.

[npm-image]: https://img.shields.io/npm/v/toad-scheduler.svg
[npm-url]: https://npmjs.org/package/toad-scheduler
[downloads-image]: https://img.shields.io/npm/dm/toad-scheduler.svg
[downloads-url]: https://npmjs.org/package/toad-scheduler
