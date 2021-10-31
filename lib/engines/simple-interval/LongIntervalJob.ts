import Timeout = NodeJS.Timeout
import { Job, JobStatus } from '../../common/Job'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'
import { Task } from '../../common/Task'
import { AsyncTask } from '../../common/AsyncTask'
import { ToadScheduler } from '../../../lib/toadScheduler'
import { SimpleIntervalJob } from './SimpleIntervalJob'

const MAX_TIMEOUT_DURATION_MS = 2147483647

export class LongIntervalJob extends Job {
  private childJob?: SimpleIntervalJob
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask
  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, id?: string) {
    super(id)
    this.schedule = schedule
    this.task = task

    // Create a future date for this task and get the number of ms
    const taskPeriod = toMsecs(schedule)
    // Initiate time-eating logic
    if (taskPeriod >= MAX_TIMEOUT_DURATION_MS) {
      this.setTimeEatingJob(taskPeriod)
    }
  }

  private setTimeEatingJob(taskPeriod: number): void {
    const future = new Date()
    future.setTime(Date.now() + taskPeriod)
    const futureMs = future.getTime()
    const remainingMs = futureMs - Date.now()

    const timeEater = new Task('time eating task', () => {
      const remainingMs = futureMs - Date.now()
      if (remainingMs >= MAX_TIMEOUT_DURATION_MS) {
        this.childJob?.stop()
        this.childJob = new SimpleIntervalJob(
          {
            milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS - 1, remainingMs),
          },
          timeEater
        )
        this.childJob.start()
      } else {
        this.childJob?.stop()
        this.childJob = new SimpleIntervalJob(
          {
            milliseconds: remainingMs,
          },
          new Task('Final mile task', () => {
            this.setTimeEatingJob(toMsecs(this.schedule))
            return this.task.execute()
          })
        )
        this.childJob.start()
      }
    })

    this.childJob?.stop()
    this.childJob = new SimpleIntervalJob(
      {
        milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS - 1, remainingMs),
      },
      timeEater
    )
    this.childJob.start()
  }

  start(): void {
    if (this.childJob) {
      return this.childJob.start()
    }

    const time = toMsecs(this.schedule)
    // Avoid starting duplicates and leaking previous timers
    if (this.timer) {
      this.stop()
    }

    if (this.schedule.runImmediately) {
      this.task.execute()
    }

    this.timer = setInterval(() => {
      this.task.execute()
    }, time)
  }

  stop(): void {
    if (this.childJob) {
      return this.childJob.stop()
    }
    if (!this.timer) {
      return
    }
    clearInterval(this.timer)
    this.timer = undefined
  }

  getStatus(): JobStatus {
    if (this.childJob) {
      return this.childJob.getStatus()
    }
    if (this.timer) {
      return JobStatus.RUNNING
    }
    return JobStatus.STOPPED
  }
}
