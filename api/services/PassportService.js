'use strict'

const Service = require('trails-service')

const bcrypt = require('bcrypt')
const crypto = require('crypto')
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
   * @param user infos to serialize
   */
  createToken(user) {
    return jwt.sign({
        user: user.toJSON()
      },
      this.app.config.session.strategies.jwt.tokenOptions.secret,
      {
        algorithm: this.app.config.session.strategies.jwt.tokenOptions.algorithm,
        expiresIn: this.app.config.session.strategies.jwt.tokenOptions.expiresInSeconds,
        issuer: this.app.config.session.strategies.jwt.tokenOptions.issuer,
        audience: this.app.config.session.strategies.jwt.tokenOptions.audience
      }
    )
  }

  /**
   * Redirect to the right provider URL for login
   * @param req request object
   * @param res response object
   * @param provider to go to
   */
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
    this.passport.authenticate(provider, options)(req, res, req.next)
  }

  /**
   * Provider callback to log or register the user
   * @param req request object
   * @param res response object
   * @param next callback
   */
  callback(req, res, next) {
    const provider = req.params.provider || 'local'
    const action = req.params.action

    if (provider === 'local') {
      if (action === 'register' && !req.user) {
        this.register(req.body)
          .then(user => next(null, user))
          .catch(next)
      }
      else if (action === 'connect' && req.user) {
        this.connect(req.user, req.body.password)
          .then(user => next(null, req.user))
          .catch(next)
      }
      else if (action === 'disconnect' && req.user) {
        this.disconnect(req, next)
      }
      else {
        const id = _.get(this.app, 'config.session.strategies.local.options.usernameField')
        this.login(req.body.identifier || req.body[id], req.body.password)
          .then(user => next(null, user))
          .catch(next)
      }
    }
    else {
      if (action === 'disconnect' && req.user) {
        this.disconnect(req, next)
      }
      else {
        this.passport.authenticate(provider, next)(req, res, req.next)
      }
    }
  }

  /**
   * Register the user
   * @param userInfos to save
   * @returns {Promise}
   */
  register(userInfos) {
    const password = userInfos.password
    delete userInfos.password

    // Generating accessToken for API authentication
    const token = crypto.randomBytes(48).toString('base64');

    return this.app.orm.User.create(userInfos).then(user => {
      return this.app.orm.Passport.create({
        protocol: 'local',
        password: password,
        user: user.id,
        accessToken: token
      }).then(passport => Promise.resolve(user))
    })
  }

  /**
   * Assign local Passport to user
   *
   * This function can be used to assign a local Passport to a user who doens't
   * have one already. This would be the case if the user registered using a
   * third-party service and therefore never set a password.
   *
   * @param {Object}   user
   * @param {Object}   password
   * @returns Promise to chain calls
   */
  connect(user, password) {
    return this.app.orm.Passport.findOne({
      protocol: 'local',
      user: user.id
    }).then(passport => {
      if (!passport) {
        return this.app.orm.Passport.create({
          protocol: 'local',
          password: password,
          user: user.id
        })
      }
    })
  }

  /**
   * Disconnect a provider from the current user by removing the Passport object
   * @param req request object
   * @param next callback to call after
   */
  disconnect(req, next) {
    const user = req.user
    const provider = req.params.provider || 'local'
    const query = {}

    query.user = user.id
    query[provider === 'local' ? 'protocol' : 'provider'] = provider

    this.app.orm.Passport.findOne(query).then(passport => {
      if (passport) {
        return this.app.orm.Passport.destroy(passport.id)
          .then(passport => next(null, user))
      }
      else {
        throw new Error('E_USER_NO_PASSWORD')
      }
    }).catch(next)
  }

  /**
   * Log a user and check password
   * @param identifier of the user
   * @param password of the user
   * @returns {Promise} promise for next calls
   */
  login(identifier, password) {
    const criteria = {}
    criteria[_.get(this.app, 'config.session.strategies.local.options.usernameField') || 'username'] = identifier

    return this.app.orm.User.findOne(criteria).populate('passports')
      .then(user => {
      if (!user) {
        throw new Error('E_USER_NOT_FOUND')
      }

      const passport = user.passports.find(passportObj => passportObj.protocol === 'local')
      if (!passport) {
        throw new Error('E_USER_NO_PASSWORD')
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, passport.password, (err, valid) => {
          if (err) {
            return reject(err)
          }

          return valid
            ? resolve(user)
            : reject(new Error('E_WRONG_PASSWORD'))
        })
      })
    })
  }
}
