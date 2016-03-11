'use strict'

const Policy = require('trails-policy')

/**
 * @module PassportPolicy
 * @description Passport policy
 */
module.exports = class PassportPolicy extends Policy {
  init(req, res, next) {
    next()
    /*
    this.app.services.PassportService.passport.initialize()(req, res, () => {
      // Use the built-in sessions
      this.app.services.PassportService.passport.session()(req, res, () => {
        // Make the user available throughout the frontend
        res.locals.user = req.user
        next()
      })
    })*/
  }

  jwt(req, res, next) {
    this.init(req, res, () => {
      this.app.services.PassportService.passport.authenticate('jwt', (error, user, info) => {
        if (error) {
          return res.serverError(error)
        }

        if (! user) {
          return res.status(403).send(info.message)
        }

        req.user = user
        next()
      })(req, res)
    })
  }

  sessionAuth(req, res, next) {
    this.init(req, res, () => {
      // User is allowed, proceed to the next policy,
      // or if this is the last policy, the controller
      if (req.session && req.session.authenticated) {
        return next()
      }

      // User is not allowed
      // (default res.forbidden() behavior can be overridden in `config/403.js`)
      if (req.wantsJSON) {
        return res.status(403).json()
      }

      res.redirect(this.app.config.session.redirect.logout)
    })
  }
}
