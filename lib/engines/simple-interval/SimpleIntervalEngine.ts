import { SchedulerEngine } from '../../common/SchedulerEngine'
import { SimpleIntervalJob } from './SimpleIntervalJob'
import { LongIntervalJob } from './LongIntervalJob'
import { Job } from '../../common/Job'

export class SimpleIntervalEngine extends SchedulerEngine<SimpleIntervalJob | LongIntervalJob> {
  private readonly jobs: Job[]

  constructor() {
    super()
    this.jobs = []
  }

  add(job: Job): void {
    this.jobs.push(job)
    job.start()
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop()
    }
  }
}
