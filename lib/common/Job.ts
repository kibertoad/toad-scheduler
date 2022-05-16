export enum JobStatus {
  RUNNING = 'running',
  STOPPED = 'stopped'
}

export abstract class Job {
  public readonly id: string | undefined

  protected constructor(id?: string) {
    this.id = id
  }

  abstract getStatus(): JobStatus
  abstract start(): void
  abstract stop(): void
}
