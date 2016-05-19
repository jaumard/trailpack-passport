const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')

const App = {
  pkg: {
    name: 'passport-trailpack-test',
    version: '1.0.0'
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
      strategies: {
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
    routes: [],
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
const dbPath = __dirname+'/../.tmp/sqlitedev.db'
if(fs.existsSync(dbPath))
  fs.unlinkSync(dbPath)

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
