export const isJest = process.env.JEST_WORKER_ID !== undefined

export function expectAssertions(count: number) {
  if (isJest) {
    expect.assertions(count)
  }
}
