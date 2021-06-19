function defaultErrorHandler(id: string) {
  return (err: Error): void => {
    console.error(`Error while handling task ${id}: ${err.message}`)
  }
}

export class AsyncTask {
  private readonly id: string
  private readonly handler: () => Promise<void>
  private readonly errorHandler: (err: Error) => void

  constructor(id: string, handler: () => Promise<void>, errorHandler?: (err: Error) => void) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
  }

  execute(): void {
    this.handler().catch(this.errorHandler)
  }
}
