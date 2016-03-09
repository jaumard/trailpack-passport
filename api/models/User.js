'use strict'

const Model = require('trails-model')

/**
 * @module User
 * @description User model for basic auth
 */
module.exports = class User extends Model {

  static config() {

  }

  static schema() {
    return {
      username: {
        type: 'string',
        unique: true
      },
      email: {
        type: 'email',
        unique: true
      },
      passports: {
        collection: 'Passport',
        via: 'user'
      }
    }
  }
}
