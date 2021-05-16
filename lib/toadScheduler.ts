import { SimpleIntervalEngine } from './engines/simple-interval/SimpleIntervalEngine'
import { SimpleIntervalJob } from './engines/simple-interval/SimpleIntervalJob'
import { Job } from './common/Job'

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

  addSimpleIntervalJob(job: SimpleIntervalJob): void {
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

  stopByID(id: string): void {
    const job = this.jobRegistry[id]
    if (!job) {
      throw new Error(`Job with an id ${id} is not registered.`)
    }
    job.stop()
  }
}
