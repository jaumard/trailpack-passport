const _ = require('lodash')
const smokesignals = require('smokesignals')

const App = {
  pkg: {
    name: 'passport-trailpack-test',
    version: '1.0.0'
  },
  config: {
    database: {
      stores: {
        sqlitedev: {
          adapter: require('waterline-sqlite3')
        }
      },
      models: {
        defaultStore: 'sqlitedev',
        migrate: 'drop'
      }
    },
    session: {
      strategies: {}
    },
    main: {
      packs: [
        smokesignals.Trailpack,
        require('trailpack-core'),
        require('trailpack-waterline'),
        require('trailpack-router'),
        require('trailpack-express4'),
        require('../') // trailpack-passport
      ]
    },
    routes: [],
    policies: {}
  }
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
