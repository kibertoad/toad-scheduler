export const isJest = process.env.JEST_WORKER_ID !== undefined

export function expectAssertions(count: number) {
  if (isJest) {
    expect.assertions(count)
  }
}

export function expectTimerRefState(timer: any, expectedHasRef: boolean) {
  if (timer && typeof timer.hasRef === 'function') {
    expect(timer.hasRef()).toBe(expectedHasRef)
  } else {
    // Browser timers are plain numbers without ref semantics, so the only
    // thing to assert there is that the timer was created at all
    expect(timer).toBeDefined()
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
