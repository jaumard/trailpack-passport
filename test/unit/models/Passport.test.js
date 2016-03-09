'use strict'
/* global describe, it */

const assert = require('assert')

describe('PassportModel', () => {
  it('should exist', () => {
    assert(global.app.api.models['Passport'])
  })
})
