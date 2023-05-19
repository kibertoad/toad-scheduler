import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { AsyncTask } from '../lib/common/AsyncTask'
import { unMockTimers } from './utils/timerUtils'
import { expectAssertions } from './utils/assertUtils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  describe('AsyncTask', () => {
    it('correctly handles async errors', (done) => {
      unMockTimers()
      expectAssertions(1)
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
        }
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(10).then(() => {
        expect(error).toBe('kaboom')
        scheduler.stop()
        done()
      })
    })

    it('correctly handles async errors with Promise.all', (done) => {
      unMockTimers()
      expectAssertions(3)
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
        }
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(10).then(() => {
        expect(error).toBe('kaboom')
        expect(result1).toBe(true)
        expect(result3).toBe(true)
        scheduler.stop()
        done()
      })
    })

    it('correctly handles errors asynchronously', (done) => {
      unMockTimers()
      expectAssertions(1)
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
        }
      )
      const job = new SimpleIntervalJob(
        {
          seconds: 1,
          runImmediately: true,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(10).then(() => {
        expect(error).toBe('kaboom')
        scheduler.stop()
        done()
      })
    })

    it('correctly handles async rejections', (done) => {
      unMockTimers()
      expectAssertions(1)
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
        }
      )
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(10).then(() => {
        expect(error).toBe('kaboom2')
        scheduler.stop()
        done()
      })
    })

    it('correctly provide taskid', (done) => {
      unMockTimers()
      expectAssertions(1)

      const scheduler = new ToadScheduler()
      const task = new AsyncTask(
        'async task',
        (taskId) => {
          expect(taskId).toBe('async task')
          return Promise.resolve().then(() => {
            return Promise.reject(new Error('kaboom2'))
          })
        },
        () => {}
      )
      const job = new SimpleIntervalJob(
        {
          milliseconds: 5,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(10).then(() => {
        scheduler.stop()
        done()
      })
    })
  })
})
