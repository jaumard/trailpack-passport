'use strict'
const Schema = require('mongoose').Schema

module.exports = {
  config:   (app, Mongoose) => {
    return {
      schema: {
        timestamps: true,
        versionKey: false
      },
      methods: {
        toJSON: function () {
          const user = this.toObject()
          user.id = user._id
          delete user.password

          return user
        }
      }
    }
  },
  schema:   (app, Mongoose) => {
    return {
      username:  {
        type:   String,
        unique: true
      },
      email:     {
        type:   String,
        unique: true,

        // Check email against RFC 5322 definition (http://emailregex.com/)
        // match:/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        // not totally sure about this... for now better use a simple validator
        match:  /.+@.+/
      },
      passport:  {
        type: Mongoose.Schema.Types.ObjectId,
        ref:  "Passport"
      },
      passports: {
        type: [Mongoose.Schema.Types.ObjectId],
        ref:  "Passport"
      }
    }
  },
  onSchema: () => {
    return {
      test: true
    }
  }
}
