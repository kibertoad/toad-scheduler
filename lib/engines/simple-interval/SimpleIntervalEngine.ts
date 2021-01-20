import { SchedulerEngine } from '../../common/SchedulerEngine'
import { SimpleIntervalJob } from './SimpleIntervalJob'

export class SimpleIntervalEngine extends SchedulerEngine<SimpleIntervalJob> {
  private readonly jobs: SimpleIntervalJob[]

  constructor() {
    super()
    this.jobs = []
  }

  add(job: SimpleIntervalJob): void {
    this.jobs.push(job)
    job.start()
  }

  stop(): void {
    for (const job of this.jobs) {
      job.stop()
    }
  }
}
