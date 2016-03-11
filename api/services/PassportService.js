'use strict'

const Service = require('trails-service')

const bcrypt = require('bcrypt-nodejs')
const jwt = require('jsonwebtoken')
const _ = require('lodash')

/**
 * @module PassportService
 * @description Main passport service
 */
module.exports = class PassportService extends Service {
  constructor(app) {
    super(app)
    this.protocols = require('./protocols')
    this.passport = require('passport')
  }

  /**
   * Create a token based on the passed user
   * @param user
   */
  createToken(user) {
    return jwt.sign({
        user: user.toJSON()
      },
      this.app.config.session.strategies.jwt.tokenOptions.secret,
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
    this.passport.authenticate(provider, options)(req, res, req.next);
  }

  callback(req, res, next) {
    const provider = req.params.provider || 'local'

    if (provider == 'local') {
      const id = _.get(this.app, 'config.session.strategies.local.options.usernameField')
      this.login(req.body.identifier || req.body[id], req.body.password)
        .then(user => next(null, user)).catch(e => next(e))
    }
    else {
      this.passport.authenticate(provider, next)(req, res, req.next);
    }
  }

  login(identifier, password) {
    const criteria = {}
    criteria[this.app.config.session.strategies.local.options.usernameField] = identifier

    return this.app.orm.User.findOne(criteria).populate('passports').then(user => {
      let result
      if (user) {
        const passport = user.passports.find(passportObj => passportObj.protocol == 'local')
        if (passport) {
          if (bcrypt.compareSync(password, passport.password)) {
            result = Promise.resolve(user)
          }
          else {
            result = Promise.reject(new Error('E_WRONG_PASSWORD'))
          }
        }
        else {
          result = Promise.reject(new Error('E_USER_NO_PASSWORD'))
        }
      }
      else {
        result = Promise.reject(new Error('E_USER_NOT_FOUND'))

      }
      return result
    }).catch(e => this.app.log.error(e))
  }
}

