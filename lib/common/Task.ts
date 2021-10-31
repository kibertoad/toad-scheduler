function defaultErrorHandler(id: string) {
  return (err: Error): void => {
    console.error(`Error while handling task ${id}: ${err.message}`)
  }
}

export class Task {
  private readonly id: string
  private readonly handler: () => void
  private readonly errorHandler: (err: Error) => void

  constructor(id: string, handler: () => void, errorHandler?: (err: Error) => void) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
  }

  execute(): void {
    try {
      this.handler()
    } catch (err: any) {
      this.errorHandler(err)
    }
  }
}
