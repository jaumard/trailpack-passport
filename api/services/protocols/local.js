'use strict'
const _ = require('lodash')

module.exports = (app) => {
  return (req, identifier, password, next) => {
    const criteria = {}
    const id = _.get(app, 'config.session.strategies.local.options.usernameField')
    criteria[id || 'username'] = identifier

    app.services.Passport.login(identifier, password)
      .then(user => next(null, user))
      .catch(next)
  }
}
