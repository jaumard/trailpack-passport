'use strict'

const Model = require('trails-model')
const bcrypt = require('bcrypt')

/**
 * Hash a passport password.
 *
 * @param {Object}   passport
 * @param {Function} next
 */
const hashPassword = (passport, next) => {
  if (passport.password) {
    bcrypt.hash(passport.password, 10, (err, hash) => {
      passport.password = hash
      next(err, passport)
    })
  }
  else {
    next(null, passport)
  }
}


/**
 * @module Passport
 * @description Passport model
 */
module.exports = class Passport extends Model {

  static config() {
    return {
      /**
       * Callback to be run before creating a Passport.
       *
       * @param {Object}   passport The soon-to-be-created Passport
       * @param {Function} next
       */
      beforeCreate: (passport, next) => {
        hashPassword(passport, next)
      },

      /**
       * Callback to be run before updating a Passport.
       *
       * @param {Object}   passport Values to be updated
       * @param {Function} next
       */
      beforeUpdate: (passport, next) => {
        hashPassword(passport, next)
      }
    }
  }

  static schema() {
    return {
      // Required field: Protocol
      //
      // Defines the protocol to use for the passport. When employing the local
      // strategy, the protocol will be set to 'local'. When using a third-party
      // strategy, the protocol will be set to the standard used by the third-
      // party service (e.g. 'oauth', 'oauth2', 'openid').
      protocol: {
        type: 'alphanumeric',
        required: true
      },

      // Local fields: Password, Access Token
      //
      // When the local strategy is employed, a password will be used as the
      // means of authentication along with either a username or an email.
      //
      // accessToken is used to authenticate API requests. it is generated when a
      // passport (with protocol 'local') is created for a user.
      password: {
        type: 'string',
        minLength: 8
      },
      accessToken: {type: 'string'},

      // Provider fields: Provider, identifer and tokens
      //
      // "provider" is the name of the third-party auth service in all lowercase
      // (e.g. 'github', 'facebook') whereas "identifier" is a provider-specific
      // key, typically an ID. These two fields are used as the main means of
      // identifying a passport and tying it to a local user.
      //
      // The "tokens" field is a JSON object used in the case of the OAuth stan-
      // dards. When using OAuth 1.0, a `token` as well as a `tokenSecret` will
      // be issued by the provider. In the case of OAuth 2.0, an `accessToken`
      // and a `refreshToken` will be issued.
      provider: {type: 'alphanumericdashed'},
      identifier: {type: 'string'},
      tokens: {type: 'json'},

      // Associations
      //
      // Associate every passport with one, and only one, user. This requires an
      // adapter compatible with associations.
      //
      // For more information on associations in Waterline, check out:
      // https://github.com/balderdashy/waterline
      user: {
        model: 'User',
        required: true
      }
    }
  }
}
