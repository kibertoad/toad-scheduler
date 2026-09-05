import { beforeAll, describe, expect, it } from 'vitest'
import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { AsyncTask } from '../lib/common/AsyncTask'
import { unMockTimers } from './utils/timerUtils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  beforeAll(() => {
    unMockTimers()
  })

  describe('AsyncTask', () => {
    it('correctly handles async errors', async () => {
      expect.assertions(1)
      let error: string
      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        () => {
          return Promise.resolve().then(() => {
            throw new Error('kaboom')
          })
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

      await sleep(10)
      expect(error).toBe('kaboom')
      scheduler.stop()
    })

    it('correctly handles async errors with Promise.all', async () => {
      expect.assertions(3)
      let error: string
      let result1: boolean
      let result3: boolean
      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        () => {
          const promise1 = Promise.resolve().then(() => {
            result1 = true
          })
          const promise2 = Promise.resolve().then(() => {
            throw new Error('kaboom')
          })
          const promise3 = Promise.resolve().then(() => {
            result3 = true
          })
          return Promise.all([promise1, promise2, promise3])
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

      await sleep(10)
      expect(error).toBe('kaboom')
      expect(result1).toBe(true)
      expect(result3).toBe(true)
      scheduler.stop()
    })

    it('correctly handles errors asynchronously', async () => {
      expect.assertions(1)
      let error: string
      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        () => {
          return Promise.resolve().then(() => {
            throw new Error('kaboom')
          })
        },
        (err: Error) => {
          return Promise.resolve(() => {
            return 'dummy'
          }).then(() => {
            error = err.message
            throw new Error('error while handling error')
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

      await sleep(10)
      expect(error).toBe('kaboom')
      scheduler.stop()
    })

    it('correctly handles async rejections', async () => {
      expect.assertions(1)
      let error: string
      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        () => {
          return Promise.resolve().then(() => {
            return Promise.reject(new Error('kaboom2'))
          })
        },
        (err: Error) => {
          error = err.message
        },
      )
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(10)
      expect(error).toBe('kaboom2')
      scheduler.stop()
    })

    it('correctly provide taskid', async () => {
      // The interval may fire more than once before the sleep below resolves,
      // so capture what the task was handed and assert on it afterwards
      // instead of counting assertions inside the callback.
      let observedTaskId: string | undefined

      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        (taskId) => {
          observedTaskId = taskId
          return Promise.resolve().then(() => {
            return Promise.reject(new Error('kaboom2'))
          })
        },
        () => {},
      )
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(7)
      scheduler.stop()
      expect(observedTaskId).toBe('async task')
    })

    it('correctly provide taskid and jobid', async () => {
      let observedTaskId: string | undefined
      let observedJobId: string | undefined

      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        (taskId, jobId) => {
          observedTaskId = taskId
          observedJobId = jobId
          return Promise.reject(new Error('kaboom2'))
        },
        () => {},
      )
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
        {
          id: 'jobId',
        },
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(10)
      scheduler.stop()
      expect(observedTaskId).toBe('async task')
      expect(observedJobId).toBe('jobId')
    })
  })
})
