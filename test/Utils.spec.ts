import { isPromise } from '../lib/common/Utils'

describe('Utils', () => {
  describe('isPromise', () => {
    it('Correctly identifies promise', () => {
      const promise = Promise.resolve().then(() => {
        return true
      })
      const promise2 = Promise.resolve()
      expect(isPromise(promise)).toEqual(true)
      expect(isPromise(promise2)).toEqual(true)
    })

    it('Correctly identifies not promise', () => {
      expect(isPromise(null)).toEqual(false)
      expect(isPromise(undefined)).toEqual(false)
      expect(isPromise(0)).toEqual(false)
      expect(isPromise(1)).toEqual(false)
      expect(isPromise({})).toEqual(false)
      expect(isPromise(() => {})).toEqual(false)
      expect(isPromise('text')).toEqual(false)
    })
  })
})
