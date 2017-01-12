'use strict'

/**
 * @module User for waterline ORM
 * @description User model for waterline ORM, for basic auth
 */
module.exports = {
  config: app => {
    return undefined
  },
  schema: app => {
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
