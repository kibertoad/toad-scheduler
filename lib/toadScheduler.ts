import { SimpleIntervalEngine } from './engines/simple-interval/SimpleIntervalEngine'
import { SimpleIntervalJob } from './engines/simple-interval/SimpleIntervalJob'
import { Job, JobStatus } from './common/Job'
import { LongIntervalJob } from './engines/simple-interval/LongIntervalJob'
import { CronJob } from './engines/cron/CronJob'
import { CronJobEngine } from './engines/cron/CronJobEngine'

type EngineRegistry = {
  simpleIntervalEngine?: SimpleIntervalEngine
  cronJobEngine?: CronJobEngine
}

export class ToadScheduler {
  private readonly engines: EngineRegistry
  private readonly jobRegistry: Record<string, Job>

  constructor() {
    this.engines = {}
    this.jobRegistry = {}
  }

  addIntervalJob(job: SimpleIntervalJob | LongIntervalJob) {
    if (!this.engines.simpleIntervalEngine) {
      this.engines.simpleIntervalEngine = new SimpleIntervalEngine()
    }

    this.registerJob(job)
    this.engines.simpleIntervalEngine.add(job)
  }

  addLongIntervalJob(job: LongIntervalJob): void {
    return this.addIntervalJob(job)
  }

  addSimpleIntervalJob(job: SimpleIntervalJob): void {
    return this.addIntervalJob(job)
  }

  private registerJob(job: Job): void {
    if (job.id) {
      if (this.jobRegistry[job.id]) {
        throw new Error(`Job with an id ${job.id} is already registered.`)
      }
      this.jobRegistry[job.id] = job
    }
  }

  addCronJob(job: CronJob): void {
    if (!this.engines.cronJobEngine) {
      this.engines.cronJobEngine = new CronJobEngine()
    }

    this.registerJob(job)
    this.engines.cronJobEngine.add(job)
  }

  stop(): void {
    for (const engine of Object.values(this.engines)) {
      engine?.stop()
    }
  }

  getById(id: string): Job {
    const job = this.jobRegistry[id]
    if (!job) {
      throw new Error(`Job with an id ${id} is not registered.`)
    }
    return job
  }

  existsById(id: string): boolean {
    const job = this.jobRegistry[id]
    if (!job) {
      return false
    }
    return true
  }

  removeById(id: string): Job | undefined {
    const job = this.jobRegistry[id]
    if (!job) {
      return
    }
    job.stop()
    delete this.jobRegistry[id]

    return job
  }

  stopById(id: string): void {
    const job = this.getById(id)
    job.stop()
  }

  startById(id: string): void {
    const job = this.getById(id)
    job.start()
  }

  getAllJobs(): Job[] {
    return Object.values(this.jobRegistry)
  }

  getAllJobsByStatus(status: JobStatus): Job[] {
    return Object.values(this.jobRegistry).filter((value) => {
      return value.getStatus() === status
    })
  }
}
