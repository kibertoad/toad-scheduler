import { expect } from 'vitest'

export function expectTimerRefState(timer: any, expectedHasRef: boolean) {
  if (timer && typeof timer.hasRef === 'function') {
    expect(timer.hasRef()).toBe(expectedHasRef)
  } else {
    // Browser timers are plain numbers without ref semantics, so the only
    // thing to assert there is that the timer was created at all
    expect(timer).toBeDefined()
  }
}
