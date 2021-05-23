import { Task } from '../../lib/common/Task'

export class NoopTask extends Task {
  constructor() {
    super('dummy', () => {})
  }
}
