'use strict'
const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const EXPIRES_IN_SECONDS = 60 * 24
const ALGORITHM = 'HS256'
const ISSUER = 'localhost'
const AUDIENCE = 'localhost'
const SECRET = 'mysupersecuretokentest'

const packs = [
  smokesignals.Trailpack,
  require('trailpack-core'),
  require('trailpack-router'),
  require('trailpack-express'),
  require('../') // trailpack-passport
]

const ORM = process.env.ORM || 'sequelize'

const stores = {
  sqlitedev: {
    adapter: require('sails-disk')
  }
}

if (ORM === 'waterline') {
  packs.push(require('trailpack-waterline'))
}
else if (ORM === 'js-data') {
  packs.push(require('trailpack-js-data'))
  stores.sqlitedev = {
    database: 'dev',
    storage: './.tmp/jsdata.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
  }
}
else if (ORM === 'sequelize') {
  packs.push(require('trailpack-sequelize'))
  stores.sqlitedev = {
    database: 'dev',
    storage: './.tmp/sequelize.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
  }
}

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
      stores: stores,
      models: {
        defaultStore: 'sqlitedev',
        migrate: 'drop'
      }
    },
    passport: {
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
          strategy: require('passport-local').Strategy
        }/*,
         twitter: {
         name: 'Twitter',
         protocol: 'oauth',
         strategy: require('passport-twitter').Strategy,
         options: {
         consumerKey: 'your-consumer-key',
         consumerSecret: 'your-consumer-secret'
         }
         },
         github: {
         strategy: require('passport-github').Strategy,
         name: 'Github',
         protocol: 'oauth2',
         options: {
         clientID: 'your-client-id',
         clientSecret: 'your-client-secret'
         }
         }*/
      }
    },
    main: {
      packs: packs
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
          'bodyParser',
          'passportInit',
          'passportSession',
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
