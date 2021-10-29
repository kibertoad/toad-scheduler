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
    const futureDate = Date.now() + toMsecs(schedule) //find when in the future we want to execute.
    let scheduleMs = toMsecs(schedule) //find the tptal of the schedule time and the limit.
    const overTime = scheduleMs - 2147483647 //find out how much we're over by
    const timeEater = new Task('time eating task', () => {
      const scheduler = new ToadScheduler()
      scheduleMs = scheduleMs - overTime
      console.log('doing some time wasting...')
      if (Date.now() >= futureDate) {
        //if our current date matches the time when we wanted to execute
        // fire the real payload
        const job = new SimpleIntervalJob(
          {
            runImmediately: true,
          },
          task
        )
        scheduler.addSimpleIntervalJob(job)
      } else {
        const timeJob = new SimpleIntervalJob(
          {
            milliseconds: overTime,
            //runImmediately: true,
          },
          timeEater
        )
        scheduler.addSimpleIntervalJob(timeJob)
      }
    })
    this.task = timeEater

    this.schedule = schedule
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
