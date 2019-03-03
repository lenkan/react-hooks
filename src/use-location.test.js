/* eslint-env jest */
import React from 'react'
import { render } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { useLocation } from './use-location'

/**
 * @type {HTMLDivElement}
 */
let container

let location

function DummyComponent (props) {
  location = useLocation()
  return (null)
}

function Link ({ href }) {
  const location = useLocation()
  return <a href={href} onClick={location.handleClick} />
}

function mount (Component) {
  render(Component, container)
}

const pushStateSpy = jest.spyOn(window.history, 'pushState')
const replaceStateSpy = jest.spyOn(window.history, 'replaceState')

function push (url) {
  window.history.pushState(null, null, url)
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  jest.clearAllMocks()
})

afterEach(() => {
  document.body.removeChild(container)
  container = null
})

test('returns current location', () => {
  push('/path?foo=bar')

  act(() => { mount(<DummyComponent />) })

  expect(location.pathname).toEqual('/path')
  expect(location.search).toEqual('?foo=bar')
})

test('updates location on push', () => {
  push('/path?foo=bar')

  act(() => { mount(<DummyComponent />) })

  act(() => { location.push('/foo') })

  expect(location.pathname).toEqual('/foo')
  expect(location.search).toEqual('')
})

test('pushes state onto history on push', () => {
  act(() => { mount(<DummyComponent />) })

  act(() => { location.push('/foo') })

  expect(pushStateSpy.mock.calls[0][2]).toEqual('/foo')
})

test('replaces state on history on replace', () => {
  act(() => { mount(<DummyComponent />) })

  act(() => { location.replace('/foo') })

  expect(replaceStateSpy.mock.calls[0][2]).toEqual('/foo')
})

test('click on link goes to pathname', () => {
  act(() => { mount(<Link href='/foo' />) })

  container.getElementsByTagName('a')[0].click()

  expect(pushStateSpy.mock.calls[0][2]).toEqual('/foo')
})

test('click on link goes to pathname with search', () => {
  act(() => { mount(<Link href='/foo?foo=bar' />) })

  container.getElementsByTagName('a')[0].click()

  expect(pushStateSpy.mock.calls[0][2]).toEqual('/foo?foo=bar')
})

test('click on link with just query', () => {
  push('/foo')
  jest.clearAllMocks()

  act(() => { mount(<Link href='?foo=bar' />) })

  container.getElementsByTagName('a')[0].click()

  expect(pushStateSpy.mock.calls[0][2]).toEqual('/foo?foo=bar')
})
