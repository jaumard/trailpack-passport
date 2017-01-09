'use strict'

module.exports = {
  redirect: {
    login: '/',//Login successful
    logout: '/'//Logout successful
  },
  bcrypt: require('bcryptjs'),
  onUserLogged: (app, user) => {
    user = user.toJSON()
    if (user.passports) {
      delete user.passports
    }
    return Promise.resolve(user)
  },
  mergeThirdPartyProfile: (user, profile) => {
    return Promise.resolve(user)
  }
}
