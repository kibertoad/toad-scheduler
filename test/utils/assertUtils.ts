export const isJest = process.env.JEST_WORKER_ID !== undefined

export function expectAssertions(count: number) {
  if (isJest) {
    expect.assertions(count)
  }
}

export function expectToMatchObject(actual: unknown[], expected: any[]) {
  if (isJest) {
    expect(actual).toMatchObject(expected)
  } else {
    for (const element of expected) {
      expect(actual.length).toBe(expected.length)
      expect(actual).toContain(jasmine.objectContaining(element))
    }
  }
}
