const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')

let counter = 0

const scheduler = new ToadScheduler()

const task = new Task('simple task', () => {
  global.console.log(counter)
  counter++
})

const job = new SimpleIntervalJob({ days: 30 }, task)

scheduler.addSimpleIntervalJob(job)
