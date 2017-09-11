'use strict'
const url = require('url')
const _ = require('lodash')
const routes = require('./routes')

module.exports = {
  init: (app) => {
    const passport = app.services.PassportService.passport
    app.config.web.middlewares.passportInit = passport.initialize()
    app.config.web.middlewares.passportSession = passport.session()

    /**
     * Connect a third-party profile to a local user
     *
     * This is where most of the magic happens when a user is authenticating with a
     * third-party provider. What it does, is the following:
     *
     *   1. Given a provider and an identifier, find a matching Passport.
     *   2. From here, the logic branches into two paths.
     *
     *     - A user is not currently logged in:
     *       1. If a Passport wasn't found, create a new user as well as a new
     *          Passport that will be assigned to the user.
     *       2. If a Passport was found, get the user associated with the passport.
     *
     *     - A user is currently logged in:
     *       1. If a Passport wasn't found, create a new Passport and associate it
     *          with the already logged in user (ie. "Connect")
     *       2. If a Passport was found, nothing needs to happen.
     *
     * As you can see, this function handles both "authentication" and "authori-
     * zation" at the same time. This is due to the fact that we pass in
     * `passReqToCallback: true` when loading the strategies, allowing us to look
     * for an existing session in the request and taking action based on that.
     *
     * For more information on auth(entication|rization) in Passport.js, check out:
     * http://passportjs.org/guide/authenticate/
     * http://passportjs.org/guide/authorize/
     *
     * @param {Object}   req
     * @param {Object}   query
     * @param {Object}   profile
     * @param {Function} next
     */
    passport.connect = function (req, query, profile, next) {
      const user = {}

      // Get the authentication provider from the query.
      query.provider = req.params.provider

      // Use profile.provider or fallback to the query.provider if it is undefined
      // as is the case for OpenID, for example
      const provider = profile.provider || query.provider

      // If the provider cannot be identified we cannot match it to a passport so
      // throw an error and let whoever's next in line take care of it.
      if (!provider) {
        return next(new Error('No authentication provider was identified.'))
      }

      // If the profile object contains a list of emails, grab the first one and
      // add it to the user.
      if (profile.hasOwnProperty('emails')) {
        user.email = profile.emails[0].value
      }
      // If the profile object contains a username, add it to the user.
      if (profile.hasOwnProperty('username')) {
        user.username = profile.username
      }

      // If neither an email or a username was available in the profile, we don't
      // have a way of identifying the user in the future. Throw an error and let
      // whoever's next in the line take care of it.
      if (!user.username && !user.email) {
        return next(new Error('Neither a username nor email was available'))
      }

      app.services.FootprintService.find('passport', {
        provider: provider,
        identifier: query.identifier.toString()
      }).then(passport => {
        if (!req.user) {
          // Scenario: A new user is attempting to sign up using a third-party
          //           authentication provider.
          // Action:   Create a new user and assign them a passport.
          if (passport.length == 0) {
            // Merge the profile received from the third-party authentication
            // provider with the user.
            app.config.passport.mergeThirdPartyProfile(user, profile).then(mergedProfile =>
              app.services.FootprintService.create('user', mergedProfile).then(user => {
                query.tokens = JSON.stringify(query.tokens)
                query.user = user.id
                app.services.FootprintService.createAssociation('user', user.id, 'passports', query)
                  .then(passport => next(null, user))
                  .catch(next)
              }).catch(next)
            ).catch(next)
          }
          // Scenario: An existing user is trying to log in using an already
          //           connected passport.
          // Action:   Get the user associated with the passport.
          else {
            passport = passport[0]
            // If the tokens have changed since the last session, update them
            if (query.hasOwnProperty('tokens') && query.tokens !== passport.tokens) {
              passport.tokens = JSON.stringify(query.tokens)
            }

            // Save any update to the Passport and read the associated user instance
            return Promise.all([
              app.services.FootprintService.findAssociation('Passport', passport.id, 'user'),
              app.services.FootprintService.update('Passport', passport.id, passport.toJSON())
            ])
              .then(results => {
                const userInstance = results[0][0] // Not so usefull, just for keeping namings clear
                next(null, userInstance)
              })
              .catch(next)
          }
        }
        else {
          // Scenario: A user is currently logged in and trying to connect a new
          //           passport.
          // Action:   Create and assign a new passport to the user.
          if (passport.length == 0) {
            if (query.hasOwnProperty('tokens') && typeof(query.tokens) === 'object') {
              query.tokens = JSON.stringify(query.tokens)
            }

            app.services.FootprintService.createAssociation('user', req.user.id, 'passports', query)
              .then(passport => next(null, req.user))
              .catch(next)
          }
          // Scenario: The user is a nutjob or spammed the back-button.
          // Action:   Simply pass along the already established session.
          else {
            passport = passport[0]
            // If the user currently logged in is different than the user associated
            // with the third-party authentication provider, throw an error.
            if (passport.user != req.user.id) {
              return next(new Error('Third party account already linked to another user'))
            }
            else {
              next(null, req.user)
            }
          }
        }
      }).catch(next)
    }

    passport.serializeUser((user, next) => {
      next(null, user.id)
    })

    passport.deserializeUser((id, next) => {
      app.services.FootprintService.find('user', id, {}).then(user => {
        next(null, user)
      }).catch(err => {
        next(err)
      })
    })

  },
  loadStrategies: (app) => {
    const passport = app.services.PassportService.passport
    _.each(app.config.passport.strategies, (strategiesOptions, name) => {
        const Strategy = strategiesOptions.strategy
        const options = _.extend({ passReqToCallback: true }, strategiesOptions.options || {})
        if (name === 'local') {
          passport.use(new Strategy(options, app.services.PassportService.protocols.local(app)))
        }
        else if (name === 'jwt') {
          passport.use(new Strategy(options, app.services.PassportService.protocols[name]))
        }
        else {
          const protocol = strategiesOptions.protocol
          let callback = strategiesOptions.callback

          if (!callback) {
            const prefix = _.get(app.config, 'passport.prefix') || _.get(app.config, 'footprints.prefix')
            callback = prefix + '/auth/' + name + '/callback'
          }
          const serverProtocol = app.config.web.ssl ? 'https' : 'http'
          let baseUrl = serverProtocol + '://' + (app.config.web.host || 'localhost')
          const serverPort = app.config.web.port

          if (serverPort != 80 && serverPort != 443) {
            baseUrl = baseUrl + ':' + serverPort
          }

          switch (protocol) {
            case 'oauth':
            case 'oauth2':
              options.callbackURL = url.resolve(baseUrl, callback)
              break
            case 'openid':
              options.returnURL = url.resolve(baseUrl, callback)
              options.realm = baseUrl
              options.profile = true
              break
          }

          // Merge the default options with any options defined in the config. All
          // defaults can be overriden, but I don't see a reason why you'd want to
          // do that.
          _.extend(options, strategiesOptions.options)

          passport.use(new Strategy(options, app.services.PassportService.protocols[protocol](app)))
        }
      }
    )
  },
  addRoutes: app => {
    const prefix = _.get(app.config, 'passport.prefix') || _.get(app.config, 'footprints.prefix')

    if (prefix) {
      routes.forEach(route => {
        route.path = prefix + route.path
      })
    }
    app.config.routes = app.config.routes.concat(routes)
  }

}
