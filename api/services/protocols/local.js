'use strict'
const _ = require('lodash')

module.exports = (app) => {
  return (req, identifier, password, next) => {
    const criteria = {}
    const id = _.get(app, 'config.passport.strategies.local.options.usernameField')
    criteria[id || 'username'] = identifier

    app.services.PassportService.login(identifier, password)
      .then(user => next(null, user))
      .catch(next)
  }
}
