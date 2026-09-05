import { vi } from 'vitest'

// Vitest uses @sinonjs/fake-timers in both the node and browser projects, so
// these wrappers no longer need to branch per runner. They stay as a single
// place to tweak fake timer setup for a library that is all about timers.
export function mockTimers() {
  vi.useFakeTimers()
}

export type TimeParam = {
  hours: number
  minutes: number
  seconds: number
}

export function setSystemTime(time: TimeParam) {
  vi.setSystemTime(new Date(2020, 3, 1, time.hours, time.minutes, time.seconds))
}

export function unMockTimers() {
  vi.useRealTimers()
}

export function advanceTimersByTime(time: number) {
  vi.advanceTimersByTime(time)
}
