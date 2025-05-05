import { defaultErrorHandler, loggingErrorHandler } from './Logger'
import { isPromise } from './Utils'
import { AsyncTask } from './AsyncTask'

export function isSyncTask(task: Task | AsyncTask): task is Task {
  return (task as Task).isAsync === false
}

export class Task {
  public isAsync = false
  public isExecuting: boolean
  private readonly id: string
  private readonly handler: (taskId?: string, jobId?: string) => void
  private readonly errorHandler: (err: Error) => void | Promise<void>

  constructor(
    id: string,
    handler: (taskId?: string, jobId?: string) => void,
    errorHandler?: (err: Error) => void,
  ) {
    this.id = id
    this.handler = handler
    this.errorHandler = errorHandler || defaultErrorHandler(this.id)
    this.isExecuting = false
  }

  execute(jobId?: string): void {
    this.isExecuting = true
    try {
      this.handler(this.id, jobId)
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
