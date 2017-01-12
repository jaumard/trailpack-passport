/**
 * Hash a passport password.
 *
 * @param bcrypt implementation
 * @param {Object}   passport
 * @param {Function} next
 */
module.exports = (bcrypt, passport, next) => {
  if (passport.password) {
    bcrypt.hash(passport.password, 10, (err, hash) => {
      passport.password = hash
      next(err, passport)
    })
  }
  else {
    next(null, passport)
  }
}
