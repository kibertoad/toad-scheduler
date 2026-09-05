import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const include = ['test/**/*.spec.ts']

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include,
          // Several cron tests assert on real wall-clock behaviour at ~1s
          // boundaries, so the projects get their own group order and run one
          // after another rather than competing for CPU. Still a single run,
          // so coverage from both merges into one report.
          sequence: { groupOrder: 0 },
        },
      },
      {
        test: {
          name: 'browser',
          include,
          sequence: { groupOrder: 1 },
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // This is a logic-only library with no DOM surface, so a failing
            // assertion is never something a screenshot would explain.
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      // Istanbul instruments at transform time, so the same provider works
      // for the node and browser projects and their reports merge cleanly.
      // The v8 provider only covers Chromium in browser mode.
      provider: 'istanbul',
      include: ['lib/**/*.ts'],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
