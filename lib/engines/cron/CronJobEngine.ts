import { SchedulerEngine } from '../../common/SchedulerEngine'
import { CronJob } from './CronJob'

export class CronJobEngine extends SchedulerEngine<CronJob> {
  private readonly jobs: CronJob[]

  constructor() {
    super()
    this.jobs = []
  }

  add(job: CronJob): void {
    this.jobs.push(job)
    job.start()
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop()
    }
  }
}
