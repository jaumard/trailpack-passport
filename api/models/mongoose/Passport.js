'use strict'

module.exports = {
  config:   (app, Mongoose) => {
    return {
      schema: {
        timestamps: true,
        versionKey: false
      }
    }
  },
  schema:   (app, Mongoose) => {
    return {
      protocol: {
        type:     String,
        match:    /^[a-zA-Z0-9]+$/,
        required: false
      },
      password: {
        type:      String,
        required:  true,
        minlength: 8,
        maxlength: 30
      },

      provider:   {
        type:     String,
      },
      identifier: {
        type:     String,
      },
      tokens:     {
        type:     String,
      },

      user: {
        type: [Mongoose.Schema.Types.ObjectId],
        ref:  "User"
      }
    }
  },
  onSchema: (schema) => {
    schema.pre('save', function (next) {
      // performing actions
      console.log("saving user")
      next()
    })
  }
}
