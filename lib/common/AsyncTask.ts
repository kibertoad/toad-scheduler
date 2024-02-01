import { defaultErrorHandler, loggingErrorHandler } from './Logger'
import { isPromise } from './Utils'

export class AsyncTask {
  public isExecuting: boolean
  private readonly id: string
  private readonly handler: (taskId?: string, jobId?: string) => Promise<unknown>
  private readonly errorHandler: (err: Error) => void | Promise<void>

  constructor(
    id: string,
    handler: (taskId?: string, jobId?: string) => Promise<unknown>,
    errorHandler?: (err: Error) => void,
  ) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
    this.isExecuting = false
  }

  execute(jobId?: string): void {
    this.isExecuting = true
    this.handler(this.id, jobId)
      .catch((err: Error) => {
        const errorHandleResult = this.errorHandler(err)
        if (isPromise(errorHandleResult)) {
          // If we fail while handling an error, oh well
          errorHandleResult.catch(loggingErrorHandler(err))
        }
      })
      .finally(() => {
        this.isExecuting = false
      })
  }
}
