'use strict'

const Model = require('trails/model')

/**
 * @module Passport
 * @description Passport model
 */
module.exports = class Passport extends Model {

  static config(app, orm) {
    if (app) {
      return require('./' + app.config.database.orm).Passport.config(app, orm)
    }
  }

  static schema(app, orm) {
    if (app) {
      return require('./' + app.config.database.orm).Passport.schema(app, orm)
    }
  }

}
