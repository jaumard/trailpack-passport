'use strict'

const Controller = require('trails/controller')


module.exports = class AuthController extends Controller {

  provider(req, res) {
    this.app.services.PassportService.endpoint(req, res, req.params.provider).catch(e => {
      if (e.code === 'E_NOT_FOUND') {
        req.err = e
        res.notFound(req, res)
      }
      else {
        res.serverError(e)
      }
    })
  }

  register(req, res) {
    req.params.action = 'register'
    this.callback(req, res)
  }

  login(req, res) {
    this.callback(req, res)
  }

  connect(req, res) {
    this.callback(req, res)
  }

  disconnect(req, res) {
    this.callback(req, res)
  }

  callback(req, res) {
    this.app.services.PassportService.callback(req, res, (err, user, challenges, statuses) => {
      if (err) {
        if (err.code === 'E_USER_NOT_FOUND') {
          req.err = err
          res.notFound(req, res)
        }
        else if (err.code === 'E_VALIDATION' || err.message === 'passport.initialize() middleware not in use') {
          res.status(400).json({error: err.message || err})
        }
        else if (err === 'Not a valid BCrypt hash.' ||
          err.code === 'E_WRONG_PASSWORD' ||
          err.code === 'E_USER_NO_PASSWORD') {
          res.status(401).json({error: err.message || err})
        }
        else {
          this.app.log.error(err)
          res.serverError(err, req, res)
        }
      }
      else {
        req.login(user, err => {
          if (err) {
            this.app.log.error(err)
            res.serverError(err, req, res)
          }
          else {
            // Mark the session as authenticated to work with default Sails sessionAuth.js policy
            req.session.authenticated = true

            // Upon successful login, send the user to the homepage were req.user
            // will be available.
            if (req.wantsJSON) {
              const result = {
                redirect: this._getRedirectTo(req) || this.app.config.passport.redirect.login,
                user: user
              }

              if (this.app.config.passport.strategies.jwt) {
                result.token = this.app.services.PassportService.createToken(user)
              }
              res.json(result)
            }
            else {
              res.redirect(this._getRedirectTo(req) || this.app.config.passport.redirect.login)
            }
          }
        })
      }
    })
  }

  _getRedirectTo(req) {
    return this.app.services.PassportService.getRedirectTo(req)
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
      res.json({redirect: this.app.config.passport.redirect.logout})
    }
    else {
      res.redirect(this.app.config.passport.redirect.logout)
    }
  }
}
