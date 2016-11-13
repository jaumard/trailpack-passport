'use strict'

module.exports = {
  redirect: {
    login: '/',//Login successful
    logout: '/'//Logout successful
  },

  onUserLogged: (app, user) => {
    user = user.toJSON()
    if (user.passports) {
      delete user.passports
    }
    return Promise.resolve(user)
  }
}
