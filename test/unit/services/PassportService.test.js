'use strict'
/* global describe, it */

const assert = require('assert')

describe('PassportService', () => {
  it('should exist', () => {
    assert(global.app.api.services['PassportService'])
    assert(global.app.services['PassportService'])
  })
})
