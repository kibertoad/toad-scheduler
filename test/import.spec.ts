import { isJest } from './utils/assertUtils'

describe('import', () => {
  it('JobStatus', async () => {
    if (!isJest) {
      return
    }
    const { JobStatus, SimpleIntervalJob, Task, ToadScheduler } = await import('../index')

    const scheduler = new ToadScheduler()
    let hasRun = false
    let isRunning = false

    const task = new Task('Sample task', () => {
      hasRun = true
    })

    const job = new SimpleIntervalJob({ seconds: 5 }, task)

    scheduler.addSimpleIntervalJob(job)

    if (job.getStatus() === JobStatus.RUNNING) {
      isRunning = true
    }
    expect(isRunning).toEqual(true)
    expect(hasRun).toEqual(false)

    scheduler.stop()
  })
})
