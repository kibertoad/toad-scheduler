export abstract class Job {
  public readonly id: string | undefined

  protected constructor(id?: string) {
    this.id = id
  }

  abstract start(): void
  abstract stop(): void
}
