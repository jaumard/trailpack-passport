'use strict'

module.exports = {
  config: (app, Mongoose) => {
    return {
      schema: {
        timestamps: true,
        versionKey: false,
        usePushEach: true
      },
      methods: {
        toJSON: function() {
          const user = this.toObject()
          user.id    = user._id //eslint-disable-line
          delete user.password

          return user
        }
      }
    }
  },
  schema: (app, Mongoose) => {
    return {
      username: {
        type: String,
        unique: true
      },
      email: {
        type: String,
        index: {unique: true, sparse: true},
        default: undefined,

        match: /.+@.+/
      },
      passport: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Passport'
      },
      passports: {
        type: [Mongoose.Schema.Types.ObjectId],
        ref: 'Passport'
      }
    }
  }
}
