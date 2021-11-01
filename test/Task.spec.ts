import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  describe('Task', () => {
    it('correctly handles errors', (done) => {
      jest.useRealTimers()
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

      sleep(5).then(() => {
        expect(error).toBe('kaboomSync')
        scheduler.stop()
        done()
      })
    })

    it('correctly handles errors with async error handler', (done) => {
      jest.useRealTimers()
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

      sleep(5).then(() => {
        expect(error).toBe('kaboomSync')
        scheduler.stop()
        done()
      })
    })
  })
})
