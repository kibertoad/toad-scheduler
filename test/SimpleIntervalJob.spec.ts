import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'
import { advanceTimersByTime, mockTimers, unMockTimers } from './utils/timerUtils'
import { AsyncTask } from '../lib/common/AsyncTask'

describe('ToadScheduler', () => {
  beforeEach(() => {
    mockTimers()
  })

  afterEach(() => {
    unMockTimers()
  })

  describe('SimpleIntervalJob', () => {
    it('correctly returns status for started job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
      )
      scheduler.addSimpleIntervalJob(job)
      expect(job.getStatus()).toBe('running')
    })

    it('correctly returns status for stopped job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
      )
      scheduler.addSimpleIntervalJob(job)
      scheduler.stop()
      expect(job.getStatus()).toBe('stopped')
    })

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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(19999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)
      advanceTimersByTime(19999)
      expect(counter).toBe(1)
      advanceTimersByTime(1)
      expect(counter).toBe(2)

      scheduler.stop()
    })

    it('allows preventing SimpleIntervalJob execution overrun', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
        advanceTimersByTime(5000)
      })
      const job = new SimpleIntervalJob(
        {
          seconds: 2,
        },
        task,
        {
          preventOverrun: true,
        },
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(1999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)
      advanceTimersByTime(999)
      expect(counter).toBe(1)
      advanceTimersByTime(1)
      expect(counter).toBe(2)
      scheduler.stop()
    })

    it('allows preventing SimpleIntervalJob execution overrun with async tasks', async () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', () => {
        counter++
        advanceTimersByTime(5000)
        return Promise.resolve(undefined)
      })
      const job = new SimpleIntervalJob(
        {
          seconds: 2,
        },
        task,
        {
          preventOverrun: true,
        },
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(1999)
      await Promise.resolve() // this allows promises to play nice with mocked timers
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      await Promise.resolve()
      expect(counter).toBe(1)
      await Promise.resolve()
      advanceTimersByTime(999)
      expect(counter).toBe(1)
      advanceTimersByTime(1)
      expect(counter).toBe(2)
      scheduler.stop()
    })

    it('allows preventing SimpleIntervalJob execution overrun with async task and Promise.all', async () => {
      let counter = 0
      let result1 = 0
      let result2 = 0
      let result3 = 0

      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', () => {
        counter++
        advanceTimersByTime(5000)
        const promise1 = Promise.resolve().then(() => {
          result1++
          return true
        })
        const promise2 = Promise.resolve().then(() => {
          result2++
          return undefined
        })
        const promise3 = Promise.resolve().then(() => {
          result3++
          return true
        })
        //return Promise.resolve(undefined)
        return Promise.all([promise1, promise2, promise3])
      })
      const job = new SimpleIntervalJob(
        {
          seconds: 2,
        },
        task,
        {
          preventOverrun: true,
        },
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(1999)
      await Promise.resolve() // this allows promises to play nice with mocked timers
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      await Promise.resolve()
      expect(result1).toBe(1)
      expect(result2).toBe(1)
      expect(result3).toBe(1)
      expect(counter).toBe(1)
      await Promise.resolve()
      advanceTimersByTime(999)
      expect(counter).toBe(1)
      await Promise.resolve()
      await Promise.resolve()
      advanceTimersByTime(1)
      await Promise.resolve()
      expect(counter).toBe(2)
      scheduler.stop()
      expect(result1).toBe(2)
      expect(result2).toBe(2)
      expect(result3).toBe(2)
    })

    it('allows executing job immediately', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          hours: 33,
          runImmediately: true,
        },
        task,
      )

      expect(counter).toBe(0)
      scheduler.addSimpleIntervalJob(job)
      expect(counter).toBe(1)
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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(32)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles adding job twice', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task,
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(20)
      expect(counter).toBe(2)

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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(20)
      expect(counter).toBe(2)

      scheduler.stop()
      scheduler.stop()

      advanceTimersByTime(20)
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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(299999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(3599999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(86399999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles very large intervals', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new SimpleIntervalJob(
        {
          days: 25,
        },
        task,
      )

      expect(() => scheduler.addSimpleIntervalJob(job)).toThrowError(/can be scheduled correctly/)
      expect(counter).toEqual(0)
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
        task,
      )

      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(86_400_000)
      advanceTimersByTime(3_600_000 * 2)
      advanceTimersByTime(60_000 * 3)
      advanceTimersByTime(1_000 * 4)
      advanceTimersByTime(4)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })
  })
})
