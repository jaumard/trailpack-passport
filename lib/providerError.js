'use strict'
module.exports = class ProviderError extends Error {
  constructor(code, message, errors) {
    super(message)
    this.code = code
    this.name = 'Provider error'
    this.errors = errors

    Object.defineProperty(ProviderError.prototype, 'message', {
      configurable: true,
      enumerable: true
    })
  }
}
