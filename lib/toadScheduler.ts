import { SimpleIntervalEngine } from './engines/simple-interval/SimpleIntervalEngine'
import { SimpleIntervalJob } from './engines/simple-interval/SimpleIntervalJob'

type EngineRegistry = {
  simpleIntervalEngine?: SimpleIntervalEngine
}

export class ToadScheduler {
  private readonly engines: EngineRegistry

  constructor() {
    this.engines = {}
  }

  addSimpleIntervalJob(job: SimpleIntervalJob): void {
    if (!this.engines.simpleIntervalEngine) {
      this.engines.simpleIntervalEngine = new SimpleIntervalEngine()
    }

    this.engines.simpleIntervalEngine.add(job)
  }

  stop(): void {
    for (const engine of Object.values(this.engines)) {
      engine?.stop()
    }
  }
}
