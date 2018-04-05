'use strict'

const hashPassword = require('../hashPassword')


module.exports = {
  config: (app, Mongoose) => {
    return {
      schema: {
        timestamps: true,
        versionKey: false,
        usePushEach: true
      },
      onSchema: (app, schema) => {
        schema.pre('save', function(next) {
          // performing actions
          hashPassword(app.config.passport.bcrypt, this, next)
        })
      }
    }
  },
  schema: (app, Mongoose) => {
    return {
      protocol: {
        type: String,
        match: /^[a-zA-Z0-9]+$/,
        required: true
      },
      password: {
        type: String,
        required: false,
        minlength: 8
      },

      provider: {
        type: String,
      },
      identifier: {
        type: String,
      },
      tokens: {
        type: String,
      },

      user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }
  }
}
