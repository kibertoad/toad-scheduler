import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { AsyncTask } from '../lib/common/AsyncTask'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('ToadScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('SimpleIntervalJob', () => {
    it('correctly processes SimpleIntervalJob', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(19999)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)
      jest.advanceTimersByTime(19999)
      expect(counter).toBe(1)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(2)

      scheduler.stop()
    })

    it('correctly handles milliseconds', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 33,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(32)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly stops jobs', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(20)
      expect(counter).toBe(2)

      scheduler.stop()
      scheduler.stop()

      jest.advanceTimersByTime(20)
      expect(counter).toBe(2)
    })

    it('correctly handles minutes', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          minutes: 5,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(299999)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles hours', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          hours: 1,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(3599999)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles days', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          days: 1,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(86399999)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles a combination of time units', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          days: 1,
          hours: 2,
          minutes: 3,
          seconds: 4,
          milliseconds: 5,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(86_400_000)
      jest.advanceTimersByTime(3_600_000 * 2)
      jest.advanceTimersByTime(60_000 * 3)
      jest.advanceTimersByTime(1_000 * 4)
      jest.advanceTimersByTime(4)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })
  })

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
          milliseconds: 5,
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
          milliseconds: 5,
        },
        task
      )

      scheduler.addSimpleIntervalJob(job)

      sleep(5).then(() => {
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

      sleep(5).then(() => {
        expect(error).toBe('kaboom2')
        scheduler.stop()
        done()
      })
    })
  })

  describe('common', () => {
    it('correctly stops without any jobs', () => {
      const scheduler = new ToadScheduler()
      scheduler.stop()
    })

    it('correctly handles multiple jobs', () => {
      let counter = 0
      let counter2 = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const task2 = new Task('simple task2', () => {
        counter2++
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 1,
        },
        task
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)
      jest.advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      jest.advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(1)

      scheduler.stop()
    })
  })
})
