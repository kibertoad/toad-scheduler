// Node reports unhandled rejections on `process`, browsers on the global
// `unhandledrejection` event. Returns a disposer so tests can unregister
// instead of leaking a listener per run.
export function onUnhandledRejection(handler: () => void): () => void {
  if (typeof process !== 'undefined' && typeof process.on === 'function') {
    process.on('unhandledRejection', handler)
    return () => {
      process.off('unhandledRejection', handler)
    }
  }

  const listener = () => handler()
  globalThis.addEventListener('unhandledrejection', listener)
  return () => {
    globalThis.removeEventListener('unhandledrejection', listener)
  }
}
