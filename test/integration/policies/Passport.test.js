'use strict'
/* global describe, it */

const assert = require('assert')

describe('PassportPolicy', () => {
  it('should exist', () => {
    assert(global.app.api.policies['Passport'])
  })
})
