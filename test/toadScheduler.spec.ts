import { ToadScheduler } from '../lib/toadScheduler'
import { SimpleIntervalJob } from '../lib/engines/simple-interval/SimpleIntervalJob'
import { Task } from '../lib/common/Task'
import { NoopTask } from './utils/testTasks'
import { advanceTimersByTime, mockTimers, unMockTimers } from './utils/timerUtils'
import { JobStatus } from '../lib/common/Job'
import { expectToMatchObject } from './utils/assertUtils'

describe('ToadScheduler', () => {
  beforeEach(() => {
    mockTimers()
  })

  afterEach(() => {
    unMockTimers()
  })

  describe('getById', () => {
    it('returns job correctly', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id' },
      )
      scheduler.addSimpleIntervalJob(job)
      const retrievedJob = scheduler.getById('id')
      expect(retrievedJob.getStatus()).toBe('running')
      expect(retrievedJob).toBe(job)
    })
  })

  describe('existsById', () => {
    it('returns true for existing job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id' },
      )
      scheduler.addSimpleIntervalJob(job)
      const result = scheduler.existsById('id')
      expect(result).toBe(true)
    })

    it('returns false for non-existing job', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id' },
      )
      scheduler.addSimpleIntervalJob(job)
      const result = scheduler.existsById('id2')
      expect(result).toBe(false)
    })
  })

  describe('removeById', () => {
    it('correctly removes job by id', () => {
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
        { id: 'job1' },
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2,
        { id: 'job2' },
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)

      const deletedJob = scheduler.removeById('job2')
      expect(deletedJob?.id).toMatch('job2')
      expect(() => {
        scheduler.getById('job2')
      }).toThrowError(/not registered/)
      const nonExistingJob = scheduler.removeById('job2')
      expect(nonExistingJob).toBeUndefined()

      advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(0)

      scheduler.stop()
    })
  })

  describe('stopById', () => {
    it('throws an error when non-existent id is stopped', () => {
      const scheduler = new ToadScheduler()
      expect(() => {
        scheduler.stopById('dummy')
      }).toThrowError(/Job with an id dummy is not registered./)
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
        { id: 'job1' },
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2,
        { id: 'job2' },
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)

      scheduler.stopById('job2')

      advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(0)

      scheduler.stop()
    })
  })

  describe('startById', () => {
    it('throws an error when non-existent id is started', () => {
      const scheduler = new ToadScheduler()
      expect(() => {
        scheduler.startById('dummy')
      }).toThrowError(/Job with an id dummy is not registered./)
    })

    it('correctly starts job by id', () => {
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
        { id: 'job1' },
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2,
        { id: 'job2' },
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)

      scheduler.stopById('job2')
      scheduler.startById('job2')

      advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(1)

      scheduler.stop()
    })
  })

  describe('listJobs', () => {
    it('returns all jobs', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id' },
      )
      const job2 = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id2' },
      )
      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)
      job.stop()

      const retrievedJobs = scheduler.getAllJobs()
      expectToMatchObject(retrievedJobs, [
        {
          id: 'id',
        },
        {
          id: 'id2',
        },
      ])
    })
  })

  describe('listJobs', () => {
    it('returns jobs filtered by status', () => {
      const scheduler = new ToadScheduler()
      const task = new NoopTask()
      const job = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id' },
      )
      const job2 = new SimpleIntervalJob(
        {
          seconds: 20,
        },
        task,
        { id: 'id2' },
      )
      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)
      job.stop()

      const retrievedJobs = scheduler.getAllJobsByStatus(JobStatus.STOPPED)
      expectToMatchObject(retrievedJobs, [
        {
          id: 'id',
        },
      ])
    })
  })

  describe('common', () => {
    it('throws an error when duplicate id is registered', () => {
      const scheduler = new ToadScheduler()
      const job = new SimpleIntervalJob(
        {
          milliseconds: 1,
        },
        new NoopTask(),
        { id: 'job1' },
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        new NoopTask(),
        { id: 'job1' },
      )

      scheduler.addSimpleIntervalJob(job)
      expect(() => {
        scheduler.addSimpleIntervalJob(job2)
      }).toThrowError(/Job with an id job1 is already registered/)
    })

    it('correctly stops without any jobs', () => {
      const scheduler = new ToadScheduler()
      scheduler.stop()
    })

    it('correctly stops even when some engines are not initialized', () => {
      const scheduler = new ToadScheduler()

      scheduler['engines'].simpleIntervalEngine = undefined
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
        task,
      )
      const job2 = new SimpleIntervalJob(
        {
          milliseconds: 10,
        },
        task2,
      )

      scheduler.addSimpleIntervalJob(job)
      scheduler.addSimpleIntervalJob(job2)

      expect(counter).toBe(0)
      expect(counter2).toBe(0)
      advanceTimersByTime(2)
      expect(counter).toBe(2)
      expect(counter2).toBe(0)
      advanceTimersByTime(10)
      expect(counter).toBe(12)
      expect(counter2).toBe(1)

      scheduler.stop()
    })
  })
})
