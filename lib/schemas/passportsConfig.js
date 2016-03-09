const joi = require('joi')

module.exports = joi.object().keys({
  redirect: joi.object().keys({
    logout: joi.string().required(),
    login: joi.string().required()
  }).required(),
  onUserCreated: joi.func().optional(),
  onUserLogged: joi.func().optional(),
  strategies: joi.object().optional()
})
