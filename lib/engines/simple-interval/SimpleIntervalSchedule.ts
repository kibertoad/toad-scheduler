export type SimpleIntervalSchedule = {
  days?: number
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
  runImmediately?: boolean
}

export function toMsecs(schedule: SimpleIntervalSchedule): number {
  const days = schedule.days ?? 0
  const hours = schedule.hours ?? 0
  const minutes = schedule.minutes ?? 0
  const seconds = schedule.seconds ?? 0
  const milliseconds = schedule.milliseconds ?? 0

  return (
    milliseconds +
    seconds * 1000 +
    minutes * 60 * 1000 +
    hours * 60 * 60 * 1000 +
    days * 24 * 60 * 60 * 1000
  )
}
