import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import {
  SimpleIntervalSchedule,
  toMsecs,
} from '../lib/engines/simple-interval/SimpleIntervalSchedule'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'

describe('ToadScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('SimpleIntervalJob', () => {
    it('correctly returns status for started job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task
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
        task
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
        task
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
        task
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(20)
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
        task
      )
      scheduler.addSimpleIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(2159999999)
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
})
