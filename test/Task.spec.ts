import { describe, expect, it } from 'vitest'
import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { isSyncTask, Task } from '../lib/common/Task'
import { unMockTimers } from './utils/timerUtils'
import { AsyncTask } from '../lib/common/AsyncTask'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  describe('Task', () => {
    it('safeguard works', () => {
      expect(isSyncTask(new Task('id', () => {}))).toBe(true)
      expect(isSyncTask(new AsyncTask('id', () => Promise.resolve()))).toBe(false)
    })

    it('correctly handles errors', async () => {
      unMockTimers()
      expect.assertions(1)
      let error: string
      const scheduler = new ToadScheduler()
      const task = new Task(
        'task',
        () => {
          throw new Error('kaboomSync')
        },
        (err: Error) => {
          error = err.message
        },
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(5)
      expect(error).toBe('kaboomSync')
      scheduler.stop()
    })

    it('correctly handles errors with async error handler', async () => {
      unMockTimers()
      expect.assertions(1)
      let error: string
      const scheduler = new ToadScheduler()
      const task = new Task(
        'task',
        () => {
          throw new Error('kaboomSync')
        },
        (err: Error) => {
          return Promise.resolve()
            .then(() => {
              return 'dummy'
            })
            .then(() => {
              error = err.message
              throw new Error('Error while handling an error')
            })
        },
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(5)
      expect(error).toBe('kaboomSync')
      scheduler.stop()
    })

    it('correctly provide taskid', async () => {
      unMockTimers()
      expect.assertions(1)

      const scheduler = new ToadScheduler()
      const task = new Task(
        'task',
        (taskId) => {
          expect(taskId).toBe('task')
        },
        () => {
          return Promise.resolve()
            .then(() => {
              return 'dummy'
            })
            .then(() => {
              throw new Error('Error while handling an error')
            })
        },
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(5)
      scheduler.stop()
    })
  })
})
