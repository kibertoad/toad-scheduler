export function isPromise(value: any): value is Promise<any> {
  return Boolean(value && value.then);
}