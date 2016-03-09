'use strict'

const Service = require('trails-service')

const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const passport = require('passport')

/**
 * @module PassportService
 * @description Main passport service
 */
module.exports = class PassportService extends Service {
  constructor(app) {
    super(app)
    this.protocols = require('./protocols')
    this.passport = passport
  }

  /**
   * Create a token based on the passed user
   * @param user
   */
  createToken(user) {
    return jwt.sign({
        user: user.toJSON()
      },
      this.app.config.session.jwt.tokenOptions.secret,
      {
        algorithm: this.app.config.jwt.tokenOptions.algorithm,
        expiresIn: this.app.config.jwt.tokenOptions.expiresInSeconds,
        issuer: this.app.config.jwt.tokenOptions.issuer,
        audience: this.app.config.jwt.tokenOptions.audience
      }
    )
  }

  endpoint(req, res, provider) {
    const strategies = this.app.config.session.strategies, options = {}

    // If a provider doesn't exist for this endpoint, send the user back to the
    // login page
    if (!strategies.hasOwnProperty(provider)) {
      return Promise.reject('/login')
    }

    // Attach scope if it has been set in the config
    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope
    }

    // Redirect the user to the provider for authentication. When complete,
    // the provider will redirect the user back to the application at
    //     /auth/:provider/callback
    passport.authenticate(provider, options)(req, res, req.next);
  }

  callback(req, res, next) {
    const provider = req.params.provider

    if (provider == 'local') {
      this.login(req.body.identifier, req.body.password).then(user => next(user))
        .catch(e => next(e))
    }
    else {
      passport.authenticate(provider, next)(req, res, req.next);
    }
  }

  login(identifier, password) {
    const criteria = {}
    criteria[this.app.config.session.strategies.local.options.usernameField] = identifier

    return this.app.orm.User.find(criteria).then((user) => {
      return new Promise((resolve, reject) => {
        if (user.length == 0) {
          reject({
            code: 'E_USER_NOT_FOUND',
            message: identifier + ' is not found'
          })
        }
        else if (bcrypt.compareSync(password, user[0].password)) {
          resolve(user[0])
        }
        else {
          reject({
            code: 'E_WRONG_PASSWORD',
            message: 'Password is wrong'
          })
        }
      })
    })
  }
}

