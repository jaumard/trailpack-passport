'use strict'
/* global describe, it */

const assert = require('assert')

describe('AuthController', () => {
  it('should exist', () => {
    assert(global.app.api.controllers['AuthController'])
  })
})
