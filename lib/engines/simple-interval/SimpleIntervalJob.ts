import Timeout = NodeJS.Timeout
import { Job, JobStatus } from '../../common/Job'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'
import { Task } from '../../common/Task'
import { AsyncTask } from '../../common/AsyncTask'
import { ToadScheduler } from '../../../lib/toadScheduler'
export class SimpleIntervalJob extends Job {
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask
  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask, id?: string) {
    super(id)
    // Create a future date for this task and get the number of ms
    const future = new Date()
    future.setTime(Date.now() + toMsecs(schedule))
    const futureMs = future.getTime()
    const timeEater = new Task('time eating task', () => {
      const remainingMs = futureMs - Date.now()
      const scheduler = new ToadScheduler()
      const MAX_TIMEOUT_DURATION_MS = 2147483647
      if (remainingMs > MAX_TIMEOUT_DURATION_MS) {
        scheduler.addSimpleIntervalJob(
          new SimpleIntervalJob(
            {
              milliseconds: Math.min(MAX_TIMEOUT_DURATION_MS, remainingMs),
            },
            timeEater
          )
        )
      } else {
        scheduler.addSimpleIntervalJob(
          new SimpleIntervalJob(
            {
              runImmediately: true,
            },
            task
          )
        )
      }
    })
    this.schedule = schedule
    this.task = timeEater
  }

  start(): void {
    const time = toMsecs(this.schedule)
    // See https://github.com/kibertoad/toad-scheduler/issues/24
    /*if (time >= 2147483647) {
      throw new Error(
        'Due to setInterval limitations, no intervals longer than 24.85 days can be scheduled correctly. toad-scheduler will eventually include a workaround for this, but for now your schedule is likely to break.'
      )
    }
    */
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
