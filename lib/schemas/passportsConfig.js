const joi = require('joi')

module.exports = joi.object().keys({
  prefix: joi.string(),
  redirect: joi.object().keys({
    logout: joi.string().required(),
    login: joi.string().required()
  }).required(),
  onUserLogged: joi.func(),
  mergeThirdPartyProfile: joi.func(),
  bcrypt: joi.any(),
  strategies: joi.object().keys({
    jwt: joi.object().keys({
      strategy: joi.func().required(),
      tokenOptions: joi.object().keys({
        expiresInSeconds: joi.number().positive().optional(),
        secret: joi.string().required(),
        algorithm: joi.string().required(),
        issuer: joi.string().required(),
        audience: joi.string().required()
      }).required(),
      options: joi.object().keys({
        secretOrKey: joi.string().required(),
        issuer: joi.string().required(),
        audience: joi.string().required(),
        jwtFromRequest: joi.func().required()
      }).required()
    }).optional()
  }).unknown().required()
})
