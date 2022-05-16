import { JobStatus, SimpleIntervalJob, Task, ToadScheduler } from '../index'

describe('import', () => {
  it('JobStatus', () => {
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
