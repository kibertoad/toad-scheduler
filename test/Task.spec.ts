import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { unMockTimers } from './utils/timerUtils'
import { expectAssertions } from './utils/assertUtils'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  describe('Task', () => {
    it('correctly handles errors', (done) => {
      unMockTimers()
      expectAssertions(1)
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

      sleep(5).then(() => {
        expect(error).toBe('kaboomSync')
        scheduler.stop()
        done()
      })
    })

    it('correctly handles errors with async error handler', (done) => {
      unMockTimers()
      expectAssertions(1)
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

      sleep(5).then(() => {
        expect(error).toBe('kaboomSync')
        scheduler.stop()
        done()
      })
    })

    it('correctly provide taskid', (done) => {
      unMockTimers()
      expectAssertions(1)

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

      sleep(5).then(() => {
        scheduler.stop()
        done()
      })
    })
  })
})
