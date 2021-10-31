import { defaultErrorHandler, loggingErrorHandler } from './Logger'
import { types } from 'util'

export class AsyncTask {
  private readonly id: string
  private readonly handler: () => Promise<void>
  private readonly errorHandler: (err: Error) => void | Promise<void>

  constructor(id: string, handler: () => Promise<void>, errorHandler?: (err: Error) => void) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
  }

  execute(): void {
    this.handler().catch((err: Error) => {
      const errorHandleResult = this.errorHandler(err)
      if (types.isPromise(errorHandleResult)) {
        // If we fail while handling an error, oh well
        errorHandleResult.catch(loggingErrorHandler(err))
      }
    })
  }
}
