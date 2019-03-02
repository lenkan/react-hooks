// @ts-check
import { useState, useEffect } from 'react'

function getCurrentLocation () {
  return {
    pathname: window.location.pathname,
    search: window.location.search
  }
}

/**
 * @type {Array<() => void>}
 */
const listeners = []

/**
 * Notifies all location listeners. Can be used if the history state has been manipulated
 * in by another module. Effectifely, all components using the 'useLocation' hook will
 * update.
 */
export function notify () {
  listeners.forEach(listener => listener())
}

export function useLocation () {
  const [{ pathname, search }, setLocation] = useState(getCurrentLocation())

  useEffect(() => {
    window.addEventListener('popstate', handleChange)
    return () => window.removeEventListener('popstate', handleChange)
  }, [])

  useEffect(() => {
    listeners.push(handleChange)
    return () => listeners.splice(listeners.indexOf(handleChange), 1)
  }, [])

  function handleChange () {
    setLocation(getCurrentLocation())
  }

  /**
   * Push a new url onto the history without reloading the page.
   * @param {string} url
   */
  function push (url) {
    window.history.pushState(null, null, url)
    notify()
  }

  /**
   * Replace the current url with the specified one.
   * @param {string} url
   */
  function replace (url) {
    window.history.replaceState(null, null, url)
    notify()
  }

  /**
   * Helper to interrupt the default behavior when clicking on an
   * anchor element. This will push the href-attribute as the new url on
   * the history, without reloading the page.
   * @param {React.MouseEvent<HTMLAnchorElement, MouseEvent>} event
   */
  function handleClick (event) {
    const { href, target } = event.currentTarget
    if (!target) {
      event.preventDefault()
      push(href)
    }
  }

  return {
    push,
    replace,
    pathname,
    search,
    handleClick
  }
}
