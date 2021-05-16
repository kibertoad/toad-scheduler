import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'

class NoopTask extends Task {
  constructor() {
    super('dummy', () => {})
  }
}

describe('ToadScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('common', () => {
    it('correctly stops without any jobs', () => {
      const scheduler = new ToadScheduler()
      scheduler.stop()
    })

    it('correctly stops even when some engines are not initialized', () => {
      const scheduler = new ToadScheduler()

      scheduler['engines'].simpleIntervalEngine = undefined
      scheduler.stop()
    })

    it('throws an error when duplicate id is registered', () => {
      const scheduler = new ToadScheduler()
      const job = new SimpleIntervalJob(
        {
          milliseconds: 1,
        },
        new NoopTask(),
        'job1'
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        new NoopTask(),
        'job1'
      )

      scheduler.addSimpleIntervalJob(job)
      expect(() => {
        scheduler.addSimpleIntervalJob(job2)
      }).toThrow(/Job with an id job1 is already registered/)
    })

    it('throws an error when non-existent id is stopped', () => {
      const scheduler = new ToadScheduler()
      expect(() => {
        scheduler.stopByID('dummy')
      }).toThrow(/Job with an id dummy is not registered./)
    })

    it('correctly stops job by id', () => {
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
        task,
        'job1'
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2,
        'job2'
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)

      scheduler.stopByID('job2')

      jest.advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      jest.advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(0)

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
