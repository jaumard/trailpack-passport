'use strict'

/**
 * @module User for sequelize ORM
 * @description User model for sequelize ORM
 */
module.exports = {
  config: (app, Sequelize) => {
    return {
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
  },
  schema: (app, Sequelize) => {
    return {
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
}
