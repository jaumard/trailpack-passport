/**
 * Hash a passport password.
 *
 * @param bcrypt implementation
 * @param {Object}   passport
 * @param {Function} next
 */
module.exports = (bcrypt, passport, next) => {
  if (passport.password) {
    if (next) {
      bcrypt.hash(passport.password, 10, (err, hash) => {
        passport.password = hash
        next(err, passport)
      })
    }
    else {
      return bcrypt.hash(passport.password, 10).then(hash =>
        passport.password = hash
      )
    }
  }
  else {
    if (next) {
      next(null, passport)
    }
    else {
      return Promise.resolve(passport)
    }
  }
}
