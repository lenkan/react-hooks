// @ts-check
import { useState, useEffect } from 'react'

/**
 * @param {() => AsyncIterableIterator<T>} iterator
 * @param {T} [defaultValue]
 * @returns {T}
 * @template T
 */
export function useIterator (iterator, defaultValue) {
  const [state, setState] = useState(defaultValue)

  async function start () {
    for await (const next of iterator()) {
      setState(s => ({ ...s, ...next }))
    }
  }

  useEffect(() => { start() }, [])

  return state
}
