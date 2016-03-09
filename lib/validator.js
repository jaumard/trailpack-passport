const joi = require('joi')

const schemas = require('./schemas')

module.exports = {
  validatePassportsConfig (config) {
    return new Promise((resolve, reject) => {
      joi.validate(config, schemas.passportsConfig, (err, value) => {
        if (err) return reject(new TypeError('config.session: ' + err))

        return resolve(value)
      })
    })
  }
}
