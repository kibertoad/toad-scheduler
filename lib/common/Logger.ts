export function defaultErrorHandler(id: string) {
  return (err: Error): void => {
    console.error(`Error while handling task ${id}: ${err.message}`)
  }
}

export function loggingErrorHandler(originalError: Error) {
  return (err: Error): void => {
    console.error(`Error while trying to log an error: ${err.message}`)
    console.error(`Original error: ${originalError.message}`)
  }
}
