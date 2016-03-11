const joi = require('joi')

module.exports = joi.object().keys({
  secret: joi.string().optional(),
  redirect: joi.object().keys({
    logout: joi.string().required(),
    login: joi.string().required()
  }).required(),
  strategies: joi.object().keys({
    jwt: joi.object().keys({
      strategy: joi.func().required(),
      tokenOptions: joi.object().keys({
        expiresInSeconds: joi.number().positive().optional(),
        secret: joi.string().required(),
        algorithm: joi.string().optional(),
        issuer: joi.string().optional(),
        audience: joi.string().optional()
      }).required(),
      options: joi.object().keys({
        secretOrKey: joi.string().required(),
        issuer: joi.string().optional(),
        audience: joi.string().optional(),
        jwtFromRequest: joi.func().required()
      }).required()
    }).optional()
  }).unknown().required()
})
