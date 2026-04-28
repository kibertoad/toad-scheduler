const isJest = process.env.JEST_WORKER_ID !== undefined
const isJasmine = !isJest

export function mockTimers() {
  if (isJest) {
    jest.useFakeTimers()
  }
  if (isJasmine) {
    jasmine.clock().install()
    // jest.useFakeTimers() mocks Date by default; jasmine.clock().install()
    // only mocks setTimeout/setInterval. Without mockDate(), Date.now() stays
    // on the real wall clock and time-eating logic in LongIntervalJob loops
    // forever because (mainTaskExecutionTime - Date.now()) never decreases.
    jasmine.clock().mockDate(new Date())
  }
}

export type TimeParam = {
  hours: number
  minutes: number
  seconds: number
}

export function setSystemTime(time: TimeParam) {
  const date = new Date(2020, 3, 1, time.hours, time.minutes, time.seconds)

  if (isJest) {
    jest.setSystemTime(date)
  }
  if (isJasmine) {
    jasmine.clock().mockDate(date)
  }
}

export function unMockTimers() {
  if (isJest) {
    jest.useRealTimers()
  }
  if (isJasmine) {
    jasmine.clock().uninstall()
  }
}

export function advanceTimersByTime(time: number) {
  if (isJest) {
    jest.advanceTimersByTime(time)
  }
  if (isJasmine) {
    jasmine.clock().tick(time)
  }
}
