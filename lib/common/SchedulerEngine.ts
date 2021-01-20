export abstract class SchedulerEngine<JobType> {
  abstract add(job: JobType): void
  abstract stop(): void
}
