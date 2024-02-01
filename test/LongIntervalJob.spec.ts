import { ToadScheduler } from '../lib/toadScheduler'
import { LongIntervalJob } from '../lib/engines/simple-interval/LongIntervalJob'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'
import { advanceTimersByTime, mockTimers, unMockTimers } from './utils/timerUtils'

const isJest = process.env.JEST_WORKER_ID !== undefined
const isJasmine = !isJest

describe('ToadScheduler', () => {
  beforeEach(() => {
    mockTimers()
  })

  afterEach(() => {
    unMockTimers()
  })

  describe('LongIntervalJob', () => {
    it('correctly returns status for started job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new LongIntervalJob(
        {
          seconds: 20,
        },
        task,
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
        task,
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
        task,
      )

      scheduler.addLongIntervalJob(job)

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

    it('allows preventing LongIntervalJob execution overrun', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
        advanceTimersByTime(5000)
      })
      const job = new LongIntervalJob(
        {
          seconds: 2,
        },
        task,
        {
          preventOverrun: true,
        },
      )

      scheduler.addLongIntervalJob(job)

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
        task,
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
        task,
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          milliseconds: 10,
        },
        task,
      )

      scheduler.addLongIntervalJob(job)
      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          milliseconds: 10,
        },
        task,
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          minutes: 5,
        },
        task,
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          hours: 1,
        },
        task,
      )

      scheduler.addLongIntervalJob(job)

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
      const job = new LongIntervalJob(
        {
          days: 1,
        },
        task,
      )

      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)
      advanceTimersByTime(86399999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(1)

      scheduler.stop()
    })

    it('correctly handles large intervals', () => {
      // ToDo investigate why this fails in Jasmine
      if (isJasmine) {
        return
      }

      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 25,
        },
        task,
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 24; x++) {
        advanceTimersByTime(86_400_000)
      }
      advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      advanceTimersByTime(1000)
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
        task,
      )
      scheduler.addLongIntervalJob(job)
      expect(job.getStatus()).toEqual('running')
      job.stop()
      expect(job.getStatus()).toEqual('stopped')
      scheduler.stop()
    })

    it('correctly handles large intervals repeatedly', () => {
      // ToDo investigate why this fails in Jasmine
      if (isJasmine) {
        return
      }

      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 25,
        },
        task,
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 24; x++) {
        advanceTimersByTime(86_400_000)
      }
      advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      advanceTimersByTime(1000)
      expect(counter).toBe(1)

      for (let x = 0; x < 25; x++) {
        advanceTimersByTime(86_400_000)
      }
      expect(counter).toBe(2)
      scheduler.stop()
    })

    it('correctly handles very large intervals', () => {
      // ToDo investigate why this fails in Jasmine
      if (isJasmine) {
        return
      }

      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new LongIntervalJob(
        {
          days: 55,
        },
        task,
      )
      scheduler.addLongIntervalJob(job)

      expect(counter).toBe(0)

      for (let x = 0; x < 54; x++) {
        advanceTimersByTime(86_400_000)
      }
      advanceTimersByTime(86_400_000 - 1000)
      expect(counter).toBe(0)

      advanceTimersByTime(1000)
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
        task,
      )

      scheduler.addLongIntervalJob(job)

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
