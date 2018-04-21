'use strict'
const hashPassword = require('../hashPassword')

/**
 * @module Passport for sequelize ORM
 * @description Passport model for sequelize ORM
 */
module.exports = {
  config: (app, Sequelize) => {
    return {
      //More informations about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
      options: {
        hooks: {
          beforeCreate: (values, options, fn) => {
            return hashPassword(app.config.passport.bcrypt, values, fn)
          },
          beforeUpdate: (values, options, fn) => {
            options.validate = false // skip re-validation of password hash
            return hashPassword(app.config.passport.bcrypt, values, fn)
          }
        },
        classMethods: {
          //If you need associations, put them here
          associate: (models) => {
            //More information about associations here : http://docs.sequelizejs.com/en/latest/docs/associations/
            models.Passport.belongsTo(models.User)
          }
        }
      }
    }
  },
  schema: (app, Sequelize) => {
    return {
      protocol: {
        type: Sequelize.STRING,
        validate: {
          isAlphanumeric: true
        },
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [8, undefined],
            msg: 'Password must be long at least 8 characters'
          }
        }
      },

      provider: {type: Sequelize.STRING, allowNull: true},
      identifier: {type: Sequelize.STRING, allowNull: true},
      tokens: { type: Sequelize.TEXT, allowNull: true }

    }
  }
}
