import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { AsyncTask } from '../lib/common/AsyncTask'
import { unMockTimers } from './utils/timerUtils'
import { expectAssertions } from './utils/assertUtils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('Rejection handling', () => {
  let rejectionCount: number
  beforeEach(() => {
    rejectionCount = 0
    process.on('unhandledRejection', () => {
      rejectionCount++
    })
  })

  afterEach(() => {
    unMockTimers()
  })

  describe('Task', () => {
    it('default error handler does not leak unhandled rejections', (done) => {
      unMockTimers()
      expectAssertions(2)
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

      sleep(10).then(() => {
        expect(thrownError).toBe(true)
        expect(rejectionCount).toBe(0)
        scheduler.stop()
        done()
      })
    })
  })

  describe('AsyncTask', () => {
    it('default error handler does not leak unhandled rejections on errors', (done) => {
      unMockTimers()
      expectAssertions(2)
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

      sleep(10).then(() => {
        expect(thrownError).toBe(true)
        expect(rejectionCount).toBe(0)
        scheduler.stop()
        done()
      })
    })

    it('default error handler does not leak unhandled rejections on rejected promises', (done) => {
      unMockTimers()
      expectAssertions(2)
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

      sleep(10).then(() => {
        expect(thrownError).toBe(true)
        expect(rejectionCount).toBe(0)
        scheduler.stop()
        done()
      })
    })
  })
})
