'use strict'

const Service = require('trails/lib/Service')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const ProviderError = require('../../lib').ProviderError

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
    const config = this.app.config.passport.strategies.jwt
    return jwt.sign(
      {
        user: user.toJSON ? user.toJSON() : user
      },
      config.tokenOptions.secret,
      {
        algorithm: config.tokenOptions.algorithm,
        expiresIn: config.tokenOptions.expiresInSeconds,
        issuer: config.tokenOptions.issuer,
        audience: config.tokenOptions.audience
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
    const strategies = this.app.config.passport.strategies, options = {}

    if (!strategies[provider]) {
      return Promise.reject(new ProviderError('E_NOT_FOUND', provider + ' can\'t be found'))
    }

    // If a provider doesn't exist for this endpoint, send the user back to the
    // login page
    if (!strategies.hasOwnProperty(provider)) {
      return Promise.reject(this.app.config.passport.redirect.login)
    }

    // Attach scope if it has been set in the config
    if (strategies[provider].hasOwnProperty('scope')) {
      options.scope = strategies[provider].scope
    }

    // Redirect the user to the provider for authentication. When complete,
    // the provider will redirect the user back to the application at
    //     /auth/:provider/callback
    this.passport.authenticate(provider, options)(req, res, req.next)
    return Promise.resolve()
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
        let id = _.get(this.app, 'config.passport.strategies.local.options.usernameField')
        if (!id) {
          if (req.body['username']) {
            id = 'username'
          }
          else if (req.body['email']) {
            id = 'email'
          }
          else {
            return next(new ProviderError('E_VALIDATION', 'No username or email field'))
          }
        }

        this.login(id, req.body.identifier || req.body[id], req.body.password)
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

    if (!password) {
      const err = new ProviderError('E_VALIDATION')
      err.statusCode = 400
      return Promise.reject(err)
    }

    return this.app.services.FootprintService.create('user', userInfos).then(user => {
      return this.app.services.FootprintService.createAssociation('user', user.id, 'passports', {
        protocol: 'local',
        password: password
      }).then(passport => Promise.resolve(user)).catch(err => {
        return this.app.services.FootprintService.destroy('user', user.id)
          .then(() => Promise.reject(err))
          .catch(() => Promise.reject(err))
      })
    })
  }

  /**
   * Update the local passport password of an user
   * @param user
   * @param password
   * @returns {Promise}
   */
  updateLocalPassword(user, password) {
    const criteria = (user._id) ? {_id: user.id} : {id: user.id} //eslint-disable-line

    return this.app.services.FootprintService.find('user', criteria, {populate: 'passports'})
      .then(user => {
        if (user && user.length > 0) {
          user = user[0]
          if (user.passports) {
            const localPassport = user.passports.find(passportObj => passportObj.protocol === 'local')
            if (localPassport) {
              localPassport.password = password
              return localPassport.save()
            }
            else {
              throw new ProviderError('E_NO_AVAILABLE_LOCAL_PASSPORT')
            }
          }
          else {
            throw new ProviderError('E_NO_AVAILABLE_PASSPORTS')
          }
        }
        else {
          throw new ProviderError('E_USER_NOT_FOUND')
        }
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
    return this.app.services.FootprintService.find('passport', {
      protocol: 'local',
      user: user.id
    }, {findOne: true}).then(passport => {
      if (!passport) {
        return this.app.services.FootprintService.createAssociation('user', user.id, 'passport', {
          protocol: 'local',
          password: password
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

    return this.app.services.FootprintService.find('passport', query).then(passport => {
      if (passport) {
        return this.app.services.FootprintService.destroy('passport', passport.id)
          .then(passport => next(null, user))
      }
      else {
        throw new ProviderError('E_USER_NO_PASSWORD')
      }
    }).catch(next)
  }

  /**
   * Log a user and check password
   * @param fieldName
   * @param identifier of the user
   * @param password of the user
   * @returns {Promise} promise for next calls
   */
  login(fieldName, identifier, password) {
    const criteria = {}

    criteria[fieldName] = identifier

    return this.app.services.FootprintService.find('User', criteria, {populate: 'passports'})
      .then(user => {
        if (!user || !user[0]) {
          throw new ProviderError('E_USER_NOT_FOUND')
        }
        user = user[0]

        const passport = user.passports.find(passportObj => passportObj.protocol === 'local')
        if (!passport) {
          throw new ProviderError('E_USER_NO_PASSWORD')
        }

        const onUserLogged = _.get(this.app, 'config.passport.onUserLogged')

        return new Promise((resolve, reject) => {
          this.app.config.passport.bcrypt.compare(password, passport.password, (err, valid) => {
            if (err) {
              return reject(err)
            }

            return valid
              ? resolve(onUserLogged(this.app, user))
              : reject(new ProviderError('E_WRONG_PASSWORD'))
          })
        })
      })
  }
}
