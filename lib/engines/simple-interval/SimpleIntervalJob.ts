import Timeout = NodeJS.Timeout
import { AsyncTask } from '../../common/AsyncTask'
import { Job, JobStatus } from '../../common/Job'
import { Task } from '../../common/Task'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'

export class SimpleIntervalJob extends Job {
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask

  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, id?: string) {
    super(id)
    this.schedule = schedule
    this.task = task
  }

  start(): void {
    const time = toMsecs(this.schedule)
    // See https://github.com/kibertoad/toad-scheduler/issues/24
    if (time >= 2147483647) {
      throw new Error(
        'Due to setInterval limitations, no intervals longer than 24.85 days can be scheduled correctly. Please create LongIntervalJob instead.'
      )
    }

    // Avoid starting duplicates and leaking previous timers
    if (this.timer) {
      this.stop()
    }

    if (this.schedule.runImmediately) {
      this.task.execute()
    }

    this.timer = setInterval(() => {
      this.task.execute()
    }, time)
  }

  stop(): void {
    if (!this.timer) {
      return
    }
    clearInterval(this.timer)
    this.timer = undefined
  }

  getStatus(): JobStatus {
    if (this.timer) {
      return JobStatus.RUNNING
    }
    return JobStatus.STOPPED
  }
}
