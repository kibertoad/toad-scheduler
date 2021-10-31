import { ToadScheduler } from '../lib/toadScheduler'
import { LongIntervalJob } from '../lib/engines/simple-interval/LongIntervalJob'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'

describe('ToadScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('LongIntervalJob', () => {
    it('correctly returns status for started job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new LongIntervalJob(
        {
          seconds: 20,
        },
        task
      )
      scheduler.addLongIntervalJob(job)
      expect(job.getStatus()).toBe('running')
    })

    it('correctly returns status for stopped job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new LongIntervalJob(
        {
          seconds: 20,
        },
        task
      )
      scheduler.addLongIntervalJob(job)
      scheduler.stop()
      expect(job.getStatus()).toBe('stopped')
    })

    it('correctly processes LongIntervalJob', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          seconds: 20,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          hours: 33,
          runImmediately: true,
        },
        task
      )

      expect(counter).toBe(0)
      scheduler.addIntervalJob(job)
      expect(counter).toBe(1)
      scheduler.stop()
    })

    it('correctly handles milliseconds', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          milliseconds: 33,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          milliseconds: 10,
        },
        task
      )

      scheduler.addLongIntervalJob(job)
      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          milliseconds: 10,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          minutes: 5,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          hours: 1,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          days: 1,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)
      jest.advanceTimersByTime(86399999)
      expect(counter).toBe(0)
      jest.advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles large intervals', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 25,
        },
        task
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 24; x++) {
        jest.advanceTimersByTime(86_400_000)
      }
      jest.advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      jest.advanceTimersByTime(1000)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles status for large intervals', () => {
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {})
      const job = new LongIntervalJob(
        {
          days: 25,
        },
        task
      )
      scheduler.addLongIntervalJob(job)
      expect(job.getStatus()).toEqual('running')
      job.stop()
      expect(job.getStatus()).toEqual('stopped')
      scheduler.stop()
    })

    it('correctly handles large intervals repeatedly', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 25,
        },
        task
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 24; x++) {
        jest.advanceTimersByTime(86_400_000)
      }
      jest.advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      jest.advanceTimersByTime(1000)
      expect(counter).toBe(1)

      for (let x = 0; x < 25; x++) {
        jest.advanceTimersByTime(86_400_000)
      }
      expect(counter).toBe(2)
      scheduler.stop()
    })

    it('correctly handles very large intervals', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 55,
        },
        task
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 54; x++) {
        jest.advanceTimersByTime(86_400_000)
      }
      jest.advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      jest.advanceTimersByTime(1000)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles a combination of time units', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 1,
          hours: 2,
          minutes: 3,
          seconds: 4,
          milliseconds: 5,
        },
        task
      )

      scheduler.addLongIntervalJob(job)

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
