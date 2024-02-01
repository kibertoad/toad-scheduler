import Timeout = NodeJS.Timeout
import { AsyncTask } from '../../common/AsyncTask'
import { Job, JobStatus } from '../../common/Job'
import { Task } from '../../common/Task'
import { JobOptions, SimpleIntervalJob } from './SimpleIntervalJob'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'

const MAX_TIMEOUT_DURATION_MS = 2147483647

export class LongIntervalJob extends Job {
  private childJob?: SimpleIntervalJob
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask
  private readonly preventOverrun: boolean
  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, options: JobOptions = {}) {
    super(options.id)
    this.preventOverrun = options.preventOverrun ?? true
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
    const mainTaskExecutionDate = new Date()
    mainTaskExecutionDate.setTime(Date.now() + taskPeriod)
    const mainTaskExecutionTime = mainTaskExecutionDate.getTime()
    const startingRemainingMs = mainTaskExecutionTime - Date.now()

    const timeEater = new Task('time eating task', () => {
      const remainingMs = mainTaskExecutionTime - Date.now()
      if (remainingMs >= MAX_TIMEOUT_DURATION_MS) {
        /* istanbul ignore next */
        this.childJob?.stop()
        this.childJob = new SimpleIntervalJob(
          {
            milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS - 1, remainingMs),
          },
          timeEater,
        )
        this.childJob.start()
      } else {
        /* istanbul ignore next */
        this.childJob?.stop()
        this.childJob = new SimpleIntervalJob(
          {
            milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS - 1, remainingMs),
          },
          new Task('Final mile task', () => {
            this.setTimeEatingJob(toMsecs(this.schedule))
            return this.task.execute(this.id)
          }),
        )
        this.childJob.start()
      }
    })

    this.childJob?.stop()
    this.childJob = new SimpleIntervalJob(
      {
        milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS - 1, startingRemainingMs),
      },
      timeEater,
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
      this.task.execute(this.id)
    }

    this.timer = setInterval(() => {
      if (!this.task.isExecuting || !this.preventOverrun) {
        this.task.execute(this.id)
      }
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
