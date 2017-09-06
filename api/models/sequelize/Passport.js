'use strict'

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
          beforeCreate: (values, options) => {
            if (values.password) {
              return app.config.passport.bcrypt.hash(values.password, 10).then(hash => {
                values.password = hash
              })
            }
          },
          beforeUpdate: (values, options) => {
            options.validate = false // skip re-validation of password hash
            if (values.password) {
              return app.config.passport.bcrypt.hash(values.password, 10).then(hash => {
                values.password = hash
              })
            }
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
      tokens: {type: Sequelize.STRING, allowNull: true}

    }
  }
}
