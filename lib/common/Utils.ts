export function isPromise(value: any): value is Promise<any> {
  return value && value.then !== undefined ? true : false
}
