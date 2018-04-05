'use strict'

const Model = require('trails/lib/Model')

/**
 * @module User
 * @description User model for basic auth
 */
module.exports = class User extends Model {

  static config(app, orm) {
    if (app) {
      return require('./' + app.config.get('stores.orm')).User.config(app, orm)
    }
  }

  static schema(app, orm) {
    if (app) {
      return require('./' + app.config.get('stores.orm')).User.schema(app, orm)
    }
  }

}
