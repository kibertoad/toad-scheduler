export enum JobStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
}

export abstract class Job {
  public readonly id: string | undefined

  protected constructor(id?: string) {
    this.id = id
  }

  abstract getStatus(): JobStatus
  abstract start(): void
  abstract stop(): void

  /**
   * Applies a scheduler-wide `unref` default to this job. Only takes effect
   * when the job was constructed without an explicit `unref` option — a
   * per-job setting always wins over the scheduler default.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  applyUnrefDefault(unref: boolean): void {
    // no-op by default so that custom Job subclasses keep working
  }
}
