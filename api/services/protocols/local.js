'use strict'

module.exports = (app) => {
  return (req, identifier, password, next) => {
    const criteria = {}
    criteria[app.config.session.strategies.local.options.usernameField || 'username'] = identifier

    app.services.Passport.login(identifier, password).then(user => next(null, user)).catch(error => next(error))
  }
}
