export function isPromise(value: any): value is Promise<any> {
  return typeof value?.then === 'function'
}
