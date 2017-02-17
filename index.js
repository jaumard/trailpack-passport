'use strict'
const Trailpack = require('trailpack')
const lib = require('./lib')
const _ = require('lodash')

module.exports = class PassportTrailpack extends Trailpack {

  /**
   * Check express4 is used and verify session configuration
   */
  validate() {
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack work only for express !'))
    }

    if (!_.includes(_.keys(this.app.packs), 'waterline') && !_.includes(_.keys(this.app.packs), 'sequelize') && !_.includes(_.keys(this.app.packs), 'mongoose')) {  //eslint-disable-line
      return Promise.reject(new Error('This Trailpack work only with waterline, sequelize or mongoose!')) //eslint-disable-line
    }

    if (!this.app.config.passport) {
      return Promise.reject(new Error('No configuration found at config.passport !'))
    }

    const strategies = this.app.config.passport.strategies
    if (!strategies || (strategies && Object.keys(strategies).length == 0)) {
      return Promise.reject(new Error('No strategies found at config.passport.strategies !'))
    }

    if (strategies.jwt && _.get(this.app, 'config.passport.jwt.tokenOptions.secret') === 'mysupersecuretoken') {  //eslint-disable-line
      return Promise.reject(new Error('You need to change the default token !'))
    }

    return Promise.all([
      lib.Validator.validatePassportsConfig(this.app.config.passport)
    ])
  }

  /**
   * Initialise passport functions and load strategies
   */
  configure() {
    lib.Passports.init(this.app)
    lib.Passports.loadStrategies(this.app)
    lib.Passports.addRoutes(this.app)
  }

  constructor(app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

