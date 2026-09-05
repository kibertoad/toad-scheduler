import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { AsyncTask } from '../lib/common/AsyncTask'
import { unMockTimers } from './utils/timerUtils'
import { onUnhandledRejection } from './utils/rejectionUtils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Rejection handling', () => {
  let rejectionCount: number
  let disposeRejectionListener: () => void

  beforeEach(() => {
    rejectionCount = 0
    disposeRejectionListener = onUnhandledRejection(() => {
      rejectionCount++
    })
  })

  afterEach(() => {
    disposeRejectionListener()
    unMockTimers()
  })

  describe('Task', () => {
    it('default error handler does not leak unhandled rejections', async () => {
      unMockTimers()
      expect.assertions(2)
      let thrownError: boolean
      const scheduler = new ToadScheduler()
      const task = new Task('task', () => {
        thrownError = true
        throw new Error('kaboomSync')
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(10)
      expect(thrownError).toBe(true)
      expect(rejectionCount).toBe(0)
      scheduler.stop()
    })
  })

  describe('AsyncTask', () => {
    it('default error handler does not leak unhandled rejections on errors', async () => {
      unMockTimers()
      expect.assertions(2)
      let thrownError: boolean
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('async task', () => {
        return Promise.resolve().then(() => {
          thrownError = true
          throw new Error('kaboom')
        })
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(10)
      expect(thrownError).toBe(true)
      expect(rejectionCount).toBe(0)
      scheduler.stop()
    })

    it('default error handler does not leak unhandled rejections on rejected promises', async () => {
      unMockTimers()
      expect.assertions(2)
      let thrownError: boolean
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('async task', () => {
        return Promise.resolve().then(() => {
          thrownError = true
          return Promise.reject(new Error('kaboom2'))
        })
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      await sleep(10)
      expect(thrownError).toBe(true)
      expect(rejectionCount).toBe(0)
      scheduler.stop()
    })
  })
})
