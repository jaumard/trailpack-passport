'use strict'

const Model = require('trails-model')

/**
 * @module User
 * @description User model for basic auth
 */
module.exports = class User extends Model {

  static config(app) {
    let config = {}

    if (app && app.config.database.orm === 'sequelize') {
      config = {
        //More informations about supported models options here : http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        options: {
          classMethods: {
            //If you need associations, put them here
            associate: (models) => {
              //More information about associations here : http://docs.sequelizejs.com/en/latest/docs/associations/
              models.User.hasMany(models.Passport, {
                as: 'passports',
                onDelete: 'CASCADE',
                foreignKey: {
                  allowNull: false
                }
              })
            }
          }
        }
      }
    }
    return config
  }

  static schema(app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'waterline' || app.config.database.orm === 'js-data') {
      schema = {
        username: {
          type: 'string',
          unique: true
        },
        email: {
          type: 'email',
          unique: true
        },
        passports: {
          collection: 'Passport',
          via: 'user'
        }
      }
    }
    else if (app.config.database.orm === 'sequelize') {
      schema = {
        username: {
          type: Sequelize.STRING,
          unique: true
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
          validate: {
            isEmail: true
          }
        }
      }
    }
    return schema
  }
}
