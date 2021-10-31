import { SimpleIntervalEngine } from './engines/simple-interval/SimpleIntervalEngine'
import { SimpleIntervalJob } from './engines/simple-interval/SimpleIntervalJob'
import { Job } from './common/Job'
import { LongIntervalJob } from './engines/simple-interval/LongIntervalJob'

type EngineRegistry = {
  simpleIntervalEngine?: SimpleIntervalEngine
}

export class ToadScheduler {
  private readonly engines: EngineRegistry
  private readonly jobRegistry: Record<string, Job>

  constructor() {
    this.engines = {}
    this.jobRegistry = {}
  }

  addLongIntervalJob(job: LongIntervalJob): void {
    return this.addSimpleIntervalJob(job)
  }

  addSimpleIntervalJob(job: SimpleIntervalJob | LongIntervalJob): void {
    if (!this.engines.simpleIntervalEngine) {
      this.engines.simpleIntervalEngine = new SimpleIntervalEngine()
    }

    if (job.id) {
      if (this.jobRegistry[job.id]) {
        throw new Error(`Job with an id ${job.id} is already registered.`)
      }
      this.jobRegistry[job.id] = job
    }

    this.engines.simpleIntervalEngine.add(job)
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
}
