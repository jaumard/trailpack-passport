'use strict'

module.exports = (req, payload, next) => {
  const user = payload.user
  return next(null, user, {})
}
