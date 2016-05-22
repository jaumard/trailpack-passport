'use strict'
const _ = require('lodash')
const fs = require('fs')
const smokesignals = require('smokesignals')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const EXPIRES_IN_SECONDS = 60 * 60 * 24
const SECRET = 'test'
const ALGORITHM = 'HS256'
const ISSUER = 'localhost'
const AUDIENCE = 'localhost'

const App = {
  pkg: {
    name: 'passport-trailpack-test',
    version: '1.0.0'
  },
  api: {
    controllers: {
      DefaultController: class DefaultController extends require('trails-controller') {
        info(req, res){
          res.send('ok')
        }
      }
    }
  },
  config: {
    database: {
      stores: {
        sqlitedev: {
          adapter: require('sails-disk')
        }
      },
      models: {
        defaultStore: 'sqlitedev',
        migrate: 'drop'
      }
    },
    session: {
      onUserLogged: (app, user) => {
        user.onUserLogged = true
        return Promise.resolve(user)
      },
      strategies: {
        jwt: {
          strategy: JwtStrategy,
          tokenOptions: {
            expiresInSeconds: EXPIRES_IN_SECONDS,
            secret: SECRET,
            algorithm: ALGORITHM,
            issuer: ISSUER,
            audience: AUDIENCE
          },
          options: {
            secretOrKey: SECRET,
            issuer: ISSUER,
            audience: AUDIENCE,
            jwtFromRequest: ExtractJwt.fromAuthHeader() //Authorization: JWT JSON_WEB_TOKEN_STRING
          }
        },
        local: {
          strategy: require('passport-local').Strategy,
          options: {
            usernameField: 'username'
          }
        }
      }
    },
    main: {
      packs: [
        smokesignals.Trailpack,
        require('trailpack-core'),
        require('trailpack-waterline'),
        require('trailpack-router'),
        require('trailpack-express'),
        require('../') // trailpack-passport
      ]
    },
    routes: [{
      path: '/',
      method: ['GET'],
      handler: 'DefaultController.info'
    }],
    policies: {
      DefaultController: ['Passport.jwt']
    },
    web: {
      express: require('express'),
      middlewares: {
        order: [
          'addMethods',
          'cookieParser',
          'session',
          'passportInit',
          'passportSession',
          'bodyParser',
          'methodOverride',
          'router',
          'www',
          '404',
          '500'
        ]
      }
    }
  }
}
const dbPath = __dirname + '/../.tmp/sqlitedev.db'
if (fs.existsSync(dbPath))
  fs.unlinkSync(dbPath)

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
