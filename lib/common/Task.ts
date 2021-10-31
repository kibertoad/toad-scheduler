import { isPromise } from 'util/types'
import { defaultErrorHandler, loggingErrorHandler } from './Logger'

export class Task {
  private readonly id: string
  private readonly handler: () => void
  private readonly errorHandler: (err: Error) => void | Promise<void>

  constructor(id: string, handler: () => void, errorHandler?: (err: Error) => void) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
  }

  execute(): void {
    try {
      this.handler()
    } catch (err: any) {
      const errorHandleResult = this.errorHandler(err)
      if (isPromise(errorHandleResult)) {
        // If we fail while handling an error, oh well
        errorHandleResult.catch(loggingErrorHandler(err))
      }
    }
  }
}
