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

## API for jobs

* `start(): void` - starts, or restarts (if it's already running) the job;
* `stop(): void` - stops the job. Can be restarted again with `start` command.
* `getStatus(): JobStatus` - returns the status of the job, which is one of: `running`, `stopped`.

## API for scheduler

* `addSimpleIntervalJob(job: SimpleIntervalJob): void` - registers and starts a new job;
* `stop(): void` - stops all jobs, registered in the scheduler;
* `getById(id: string): Job` - returns the job with a given id.
* `stopById(id: string): void` - stops the job with a given id.
* `startById(id: string): void` - starts, or restarts (if it's already running) the job with a given id.

[npm-image]: https://img.shields.io/npm/v/toad-scheduler.svg
[npm-url]: https://npmjs.org/package/toad-scheduler
[downloads-image]: https://img.shields.io/npm/dm/toad-scheduler.svg
[downloads-url]: https://npmjs.org/package/toad-scheduler
