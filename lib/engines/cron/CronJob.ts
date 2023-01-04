import { Job, JobStatus } from '../../common/Job'
import { Task } from '../../common/Task'
import { AsyncTask } from '../../common/AsyncTask'
import { JobOptions } from '../simple-interval/SimpleIntervalJob'
import { Cron } from 'croner'

export const CRON_EVERY_SECOND = '* * * * * *'

export const CRON_EVERY_30_SECONDS = '*/30 * * * * *'

export const CRON_EVERY_MINUTE = '* * * * *'

export const CRON_EVERY_30_MINUTES = '*/30 * * * *'

export const CRON_EVERY_HOUR = '0 * * * *'

export type CronSchedule = {
  cronExpression: string
  timezone?: string
}

export class CronJob extends Job {
  private readonly schedule: CronSchedule
  private readonly task: Task | AsyncTask
  private readonly preventOverrun: boolean

  private cronInstance: Cron | undefined

  constructor(schedule: CronSchedule, task: Task | AsyncTask, options: JobOptions = {}) {
    super(options.id)
    this.preventOverrun = options.preventOverrun ?? true
    this.schedule = schedule
    this.task = task
  }

  getStatus(): JobStatus {
    return this.cronInstance?.running() ? JobStatus.RUNNING : JobStatus.STOPPED
  }

  start(): void {
    this.cronInstance = Cron(
      this.schedule.cronExpression,
      {
        timezone: this.schedule.timezone,
      },
      () => {
        if (!this.task.isExecuting || !this.preventOverrun) {
          this.task.execute()
        }
      }
    )
  }

  stop(): void {
    this.cronInstance?.stop()
  }
}
