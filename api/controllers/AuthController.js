'use strict'

const Controller = require('trails-controller')


module.exports = class AuthController extends Controller {

  provider(req, res) {
    this.app.services.PassportService.endpoint(req, res, req.params.provider)
  }

  callback(req, res) {
    this.app.services.PassportService.callback(req, res, (err, user, challenges, statuses) => {
      if (err) {
        if (err.message === 'E_USER_NOT_FOUND') {
          return res.notFound(req, res)
        }

        if (err === 'Not a valid BCrypt hash.' ||
            err.message === 'E_WRONG_PASSWORD' ||
            err.message === 'E_USER_NO_PASSWORD'
        ) {
          return res.status(401).json({error: err.message || err})
        }

        this.app.log.error(err)
        return res.serverError(err, req, res)
      }

      req.login(user, err => {
        if (err) {
          this.app.log.error(err)
          return res.serverError(err, req, res)
        }

        // Mark the session as authenticated to work with default Sails sessionAuth.js policy
        req.session.authenticated = true

        // Upon successful login, send the user to the homepage were req.user
        // will be available.
        if (req.wantsJSON) {
          const result = {
            redirect: this.app.config.session.redirect.login,
            user: user
          }

          if (this.app.config.session.strategies.jwt) {
            result.token = this.app.services.PassportService.createToken(user)
          }
          return res.json(result)
        }

        return res.redirect(this.app.config.session.redirect.login)
      })
    })
  }

  /**
   * Log out a user and return them to the homepage
   *
   * Passport exposes a logout() function on req (also aliased as logOut()) that
   * can be called from any route handler which needs to terminate a login
   * session. Invoking logout() will remove the req.user property and clear the
   * login session (if any).
   *
   * For more information on logging out users in Passport.js, check out:
   * http://passportjs.org/guide/logout/
   *
   * @param {Object} req
   * @param {Object} res
   */
  logout(req, res) {
    req.logout()

    // mark the user as logged out for auth purposes
    if (req.session)
      req.session.authenticated = false

    if (req.wantsJSON) {
      return res.json({redirect: this.app.config.session.redirect.logout})
    }

    return res.redirect(this.app.config.session.redirect.logout)
  }
}
