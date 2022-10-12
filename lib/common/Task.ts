import { defaultErrorHandler, loggingErrorHandler } from './Logger'
import { isPromise } from './Utils'

export class Task {
  public isExecuting: boolean
  private readonly id: string
  private readonly handler: () => void
  private readonly errorHandler: (err: Error) => void | Promise<void>

  constructor(id: string, handler: () => void, errorHandler?: (err: Error) => void) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
    this.isExecuting = false
  }

  execute(): void {
    this.isExecuting = true
    try {
      this.handler()
    } catch (err: any) {
      const errorHandleResult = this.errorHandler(err)
      if (isPromise(errorHandleResult)) {
        // If we fail while handling an error, oh well
        errorHandleResult.catch(loggingErrorHandler(err))
      }
    }
    this.isExecuting = false
  }
}
