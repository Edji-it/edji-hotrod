import 'jest-preset-angular'

Object.defineProperty(window, 'CSS', { value: null })
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>',
})
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance'],
    }
  },
})
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    }
  },
})

/**
 * Provide Range properties
 * - Used in New Reading tests
 */
Object.defineProperty(window, 'scrollY', {
  value: () => {
    return 0
  },
})
global['Range'] = function Range() {}

let createContextualFragment = (html): any => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.children[0]
}

Range.prototype.createContextualFragment = html => createContextualFragment(html)

document['createRange'] = (): any => {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return { right: 0 }
    },
    getClientRects: () => [
      {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      },
    ],
    selectNodeContents: () => {},
    createContextualFragment,
  }
}
