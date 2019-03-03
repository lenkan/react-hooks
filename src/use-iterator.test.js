/* eslint-env jest */
import '@babel/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { useIterator } from './use-iterator'

global.Promise = require('promise')

/**
 * @type {HTMLDivElement}
 */
let container

const resolvers = []
function request () {
  return new Promise(resolve => {
    resolvers.push(resolve)
  })
}

function mount (Component) {
  render(Component, container)
}

jest.useFakeTimers()

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  resolvers.splice(0, resolvers.length)
  jest.clearAllMocks()
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

test('returns current state', async () => {
  let state

  function Component (props) {
    state = useIterator(async function * () {
      const m = await request()
      yield { message: m }
    }, { message: 'default' })

    return (null)
  }

  act(() => { mount(<Component />) })

  expect(state).toEqual({ message: 'default' })

  act(() => {
    resolvers[0]('p1')
    jest.runAllTimers()
  })

  expect(state).toEqual({ message: 'p1' })
})

test('merges state at top-level', async () => {
  let state

  function Component (_) {
    state = useIterator(async function * () {
      const m1 = await request()
      yield { m1 }
      const m2 = await request()
      yield { m2 }
    }, { message: 'default' })

    return (null)
  }

  act(() => { mount(<Component />) })

  expect(state).toEqual({ message: 'default' })

  act(() => {
    resolvers[0]('p1')
    jest.runAllTimers()
  })

  expect(state).toEqual({ message: 'default', m1: 'p1' })

  act(() => {
    resolvers[1]('p2')
    jest.runAllTimers()
  })

  expect(state).toEqual({ message: 'default', m1: 'p1', m2: 'p2' })
})
