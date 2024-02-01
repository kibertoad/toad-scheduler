import { ToadScheduler } from '../lib/toadScheduler'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'
import { advanceTimersByTime, mockTimers, setSystemTime, unMockTimers } from './utils/timerUtils'
import { AsyncTask } from '../lib/common/AsyncTask'
import { CRON_EVERY_MINUTE, CRON_EVERY_SECOND, CronJob } from '../lib/engines/cron/CronJob'

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function resetTime() {
  setSystemTime({ hours: 1, minutes: 0, seconds: 0 })
}

describe('ToadScheduler', () => {
  beforeEach(() => {
    mockTimers()
    resetTime()
  })

  afterEach(() => {
    unMockTimers()
  })

  describe('CronJob', () => {
    it('correctly returns status for started job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new CronJob(
        {
          cronExpression: CRON_EVERY_SECOND,
        },
        task,
      )
      scheduler.addCronJob(job)
      expect(job.getStatus()).toBe('running')
    })

    it('correctly returns status for stopped job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new CronJob(
        {
          cronExpression: CRON_EVERY_MINUTE,
        },
        task,
      )
      scheduler.addCronJob(job)
      scheduler.stop()
      expect(job.getStatus()).toBe('stopped')
    })

    it('correctly processes CronJob', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new CronJob(
        {
          cronExpression: '*/20 * * * * *',
        },
        task,
      )
      scheduler.addCronJob(job)

      resetTime()
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

    it('allows preventing CronJob execution overrun for async tasks', async () => {
      unMockTimers()

      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', async () => {
        counter++
        await wait(2000)
      })

      const job = new CronJob(
        {
          cronExpression: '*/1 * * * * *',
        },
        task,
        {
          preventOverrun: true,
        },
      )
      scheduler.addCronJob(job)

      expect(counter).toBe(0)
      await Promise.resolve()
      await wait(1400)
      await Promise.resolve()
      expect(counter).toBe(1)
      await Promise.resolve()
      await wait(2800)
      await Promise.resolve()
      expect(counter).toBe(2)
      await Promise.resolve()
      await wait(2800)
      await Promise.resolve()
      expect(counter).toBe(3)
      scheduler.stop()
    }, 20000)

    it('allows enabling CronJob execution overrun', async () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', () => {
        counter++
        advanceTimersByTime(6000)
        return Promise.resolve(undefined)
      })
      const job = new CronJob(
        {
          cronExpression: '*/2 * * * * *', // every two seconds
        },
        task,
        {
          preventOverrun: false,
        },
      )
      scheduler.addCronJob(job)

      resetTime()
      expect(counter).toBe(0)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      expect(counter).toBe(2)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      expect(counter).toBe(5)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      advanceTimersByTime(1000)
      expect(counter).toBe(7)
      scheduler.stop()
    })

    it('allows preventing CronJob execution overrun with async tasks', async () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', () => {
        counter++
        advanceTimersByTime(6000)
        return Promise.resolve(undefined)
      })
      const job = new CronJob(
        {
          cronExpression: '*/2 * * * * *',
        },
        task,
        {
          preventOverrun: true,
        },
      )
      scheduler.addCronJob(job)

      resetTime()
      expect(counter).toBe(0)
      advanceTimersByTime(1999)
      await Promise.resolve() // this allows promises to play nice with mocked timers
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      await Promise.resolve()
      expect(counter).toBe(1)
      await Promise.resolve()
      advanceTimersByTime(1999)
      expect(counter).toBe(1)
      advanceTimersByTime(1)
      expect(counter).toBe(2)
      scheduler.stop()
    })

    it('allows preventing CronJob execution overrun with async task and Promise.all', async () => {
      let counter = 0
      let result1 = 0
      let result2 = 0
      let result3 = 0

      const scheduler = new ToadScheduler()
      const task = new AsyncTask('simple task', () => {
        counter++
        advanceTimersByTime(6000)
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
      const job = new CronJob(
        {
          cronExpression: '*/2 * * * * *',
        },
        task,
        {
          preventOverrun: true,
        },
      )
      scheduler.addCronJob(job)

      resetTime()
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
      advanceTimersByTime(1999)
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

    it('correctly handles adding job twice', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new CronJob(
        {
          cronExpression: '*/20 * * * * *',
        },
        task,
      )
      scheduler.addCronJob(job)
      scheduler.addCronJob(job)

      resetTime()
      expect(counter).toBe(0)
      advanceTimersByTime(19999)
      expect(counter).toBe(0)
      advanceTimersByTime(1)
      expect(counter).toBe(2)
      advanceTimersByTime(19999)
      expect(counter).toBe(2)
      advanceTimersByTime(1)
      expect(counter).toBe(4)

      scheduler.stop()
    })

    it('correctly stops jobs', () => {
      let counter = 0
      const scheduler = new ToadScheduler()
      const task = new Task('simple task', () => {
        counter++
      })
      const job = new CronJob(
        {
          cronExpression: '*/20 * * * * *',
        },
        task,
      )

      scheduler.addCronJob(job)

      resetTime()
      expect(counter).toBe(0)
      advanceTimersByTime(20000)
      expect(counter).toBe(1)

      scheduler.stop()
      scheduler.stop()

      advanceTimersByTime(40000)
      expect(counter).toBe(1)
    })
  })
})
