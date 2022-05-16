import { JobStatus, SimpleIntervalJob, Task, ToadScheduler } from '../index'

describe('import', () => {
  it('JobStatus', () => {
    const scheduler = new ToadScheduler()

    const task = new Task('Sample task', () => {
      console.log('I Ran!')
    })

    const job = new SimpleIntervalJob({ seconds: 5 }, task)

    scheduler.addSimpleIntervalJob(job)

    if (job.getStatus() === JobStatus.RUNNING) {
      console.log('Job is running!')
    }
  })
})
