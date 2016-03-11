const joi = require('joi')

const schemas = require('./schemas')

module.exports = {
  validatePassportsConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, schemas.passportsConfig, (err, value) => {
        return err
          ? reject(new TypeError('config.session: ' + err))
          : resolve(value)
      })
    })
  }
}
