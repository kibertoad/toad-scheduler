const isJest = process.env.JEST_WORKER_ID !== undefined
const isJasmine = !isJest

export function mockTimers() {
  if (isJest) {
    jest.useFakeTimers()
  }
  if (isJasmine) {
    jasmine.clock().install()
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
