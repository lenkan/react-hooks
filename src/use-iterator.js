// @ts-check
import { useState, useEffect, useRef } from 'react'

/**
 * @param {() => AsyncIterableIterator<T>} iterator
 * @param {T} [defaultValue]
 * @returns {T}
 * @template T
 */
export function useIterator (iterator, defaultValue) {
  const [state, setState] = useState(defaultValue)
  const abort = useRef(false)

  async function start () {
    for await (const next of iterator()) {
      if (abort.current) {
        break
      }

      setState(s => ({ ...s, ...next }))
    }
  }

  useEffect(() => {
    start()
    return () => { abort.current = true }
  }, [])

  return state
}
