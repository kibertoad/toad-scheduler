import Timeout = NodeJS.Timeout
import { Job } from '../../common/Job'
import { SimpleIntervalSchedule, toMsecs } from './SimpleIntervalSchedule'
import { Task } from '../../common/Task'
import { AsyncTask } from '../../common/AsyncTask'

export class SimpleIntervalJob extends Job {
  private timer?: Timeout
  private readonly schedule: SimpleIntervalSchedule
  private readonly task: Task | AsyncTask

  constructor(schedule: SimpleIntervalSchedule, task: Task | AsyncTask) {
    super()
    this.schedule = schedule
    this.task = task
  }

  start(): void {
    const time = toMsecs(this.schedule)

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
}
