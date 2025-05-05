import Timeout = NodeJS.Timeout
import { AsyncTask, isAsyncTask } from '../../common/AsyncTask'
import { Job, JobStatus } from '../../common/Job'
import { Task } from '../../common/Task'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'

export type JobOptions = {
  preventOverrun?: boolean
  id?: string
}

export class SimpleIntervalJob extends Job {
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask
  private readonly preventOverrun: boolean

  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, options: JobOptions = {}) {
    super(options.id)
    this.preventOverrun = options.preventOverrun ?? true
    this.schedule = schedule
    this.task = task
  }

  start(): void {
    const time = toMsecs(this.schedule)
    // See https://github.com/kibertoad/toad-scheduler/issues/24
    if (time >= 2147483647) {
      throw new Error(
        'Due to setInterval limitations, no intervals longer than 24.85 days can be scheduled correctly. Please create LongIntervalJob instead.',
      )
    }

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
    if (!this.timer) {
      return
    }
    clearInterval(this.timer)
    this.timer = undefined
  }

  getStatus(): JobStatus {
    if (this.timer) {
      return JobStatus.RUNNING
    }
    return JobStatus.STOPPED
  }

  async executeAsync(): Promise<void> {
    if (!this.task.isExecuting || !this.preventOverrun) {
      if (isAsyncTask(this.task)) {
        await this.task.executeAsync(this.id)
      } else {
        this.task.execute(this.id)
      }
    }
  }

  static async createAndExecute(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, options: JobOptions = {}): Promise<SimpleIntervalJob> {
    const job = new SimpleIntervalJob({
      ...schedule,
      runImmediately: false,
    }, task, options)

    await job.executeAsync()
    return job
  }
}
