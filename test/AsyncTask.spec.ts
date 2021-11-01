import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { AsyncTask } from '../lib/common/AsyncTask'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  describe('AsyncTask', () => {
    it('correctly handles async errors', (done) => {
      jest.useRealTimers()
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

    it('correctly handles errors asynchronously', (done) => {
      jest.useRealTimers()
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
      jest.useRealTimers()
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
  })
})
