# trailpack-passport
[![Gitter][gitter-image]][gitter-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Beerpay](https://beerpay.io/jaumard/trailpack-passport/badge.svg?style=flat)](https://beerpay.io/jaumard/trailpack-passport)
[![Beerpay](https://beerpay.io/jaumard/trailpack-passport/make-wish.svg?style=flat)](https://beerpay.io/jaumard/trailpack-passport)

:package: Trailpack to allow passport authentification to Trails application

### WARNING : 

This Trailpack work only with [trailpack-express](https://github.com/trailsjs/trailpack-express) as webserver 

This Trailpack work only with [trailpack-sequelize](https://github.com/trailsjs/trailpack-sequelize) or [trailpack-waterline](https://github.com/trailsjs/trailpack-waterline) as ORM

## Intallation
With yo : 

```
npm install -g yo generator-trails
yo trails:trailpack trailpack-passport
```

With npm (you will have to create config file manually) :
 
`npm install --save trailpack-passport`

## Configuration

First you need to add this trailpack to your __main__ configuration : 
```js
// config/main.js

module.exports = {
   ...

   packs: [
      ...
      require('trailpack-passport'),
      ...
   ]
   ...
}
```

You need to add `passportInit` and optionally `passportSession` : 
```js
// config/web.js
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
```
And to configure passport: 

```js
// config/passport.js
'use strict'

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const EXPIRES_IN_SECONDS = 60 * 60 * 24
const SECRET = process.env.tokenSecret || 'mysupersecuretoken';
const ALGORITHM = 'HS256'
const ISSUER = 'localhost'
const AUDIENCE = 'localhost'

module.exports = {
  redirect: {
    login: '/',//Login successful
    logout: '/'//Logout successful
  },
  bcrypt: require('bcryptjs'), // custom bcrypt version if you prefer the native one instead of full js
  //Called when user is logged, before returning the json response
  onUserLogged: (app, user) => {
      return Promise.resolve(user)
  },
  //Optional: can be used to merge data from all third party profiles and the default user properties.
  mergeThirdPartyProfile: (user, profile) => {
    var mergedProfile = {
      email: user.email,
      gender: profile.gender
    }
    return Promise.resolve(mergedProfile)
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
        jwtFromRequest: ExtractJwt.fromAuthHeader()
      }
    },

    local: {
      strategy: require('passport-local').Strategy,
      options: {
        usernameField: 'username' // If you want to enable both username and email just remove this field
      }
    }

    /*
     twitter : {
     name     : 'Twitter',
     protocol : 'oauth',
     strategy : require('passport-twitter').Strategy,
     options  : {
     consumerKey    : 'your-consumer-key',
     consumerSecret : 'your-consumer-secret'
     }
     },

     facebook : {
     name     : 'Facebook',
     protocol : 'oauth2',
     strategy : require('passport-facebook').Strategy,
     options  : {
     clientID     : 'your-client-id',
     clientSecret : 'your-client-secret',
     scope        : ['email'] // email is necessary for login behavior
     }
     },

     google : {
     name     : 'Google',
     protocol : 'oauth2',
     strategy : require('passport-google-oauth').OAuth2Strategy,
     options  : {
     clientID     : 'your-client-id',
     clientSecret : 'your-client-secret'
     }
     }

     github: {
     strategy: require('passport-github').Strategy,
     name: 'Github',
     protocol: 'oauth2',
     options: {
     clientID     : 'your-client-id',
     clientSecret : 'your-client-secret'
     }
     }*/
  }
}
```

Then make sure to include the new file in **config/index.js**

```
//config/index.js
...
exports.passport = require('./passport')
```

### WARNING : be sure you configure sessions correctly if your strategies need them

Further documentation on passport-jwt config can be found at [themikenicholson/passport-jwt](https://github.com/themikenicholson/passport-jwt)

## Usage

### Policies 
Now you can apply some policies to control sessions under `config/policies.js` 
```
  ViewController: {
    helloWorld: [ 'Passport.sessionAuth' ]
  }
  or 
  ViewController: {
      helloWorld: [ 'Passport.jwt' ]
    }
```

### Routes prefix
By default auth routes doesn't have prefix, but if you use `trailpack-footprints` it automatically use footprints prefix to match your API. You can change this prefix by setting `config.passport.prefix`.

### Log/Register users with third party providers
You can register or log users with third party strategies by redirect the user to : 
```
http://localhost:3000/auth/{provider}
example github 
http://localhost:3000/auth/github
```

### Log/Register users with credentials
For adding a new user you can make a POST to `auth/local/register`  with at least this fields : `username` (or `email`) and `password`. 
For local authentification you have to POST credentials to `/auth/local` in order to log the user.

### Disconnect
If you want to disconnect a user from a provider you can call : 
```
http://localhost:3000/auth/{provider}/disconnect
example if a user don't want to connect with github anymore
http://localhost:3000/auth/github/disconnect
```

### Logout
Just make a GET to `auth/logout`

## Full example
If you have some trouble, you can view a full example with JWT and local strategies here : https://github.com/jaumard/trails-example-express
Clone the repo and play a little with it to see how it works :)

## License
[MIT](https://github.com/jaumard/trailpack-passport/blob/master/LICENSE)

[snyk-image]: https://snyk.io/test/github/jaumard/trailpack-passport/badge.svg
[snyk-url]: https://snyk.io/test/github/jaumard/trailpack-passport/
[npm-image]: https://img.shields.io/npm/v/trailpack-passport.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-passport
[npm-download]: https://img.shields.io/npm/dt/trailpack-passport.svg
[ci-image]: https://travis-ci.org/jaumard/trailpack-passport.svg?branch=master
[ci-url]: https://travis-ci.org/jaumard/trailpack-passport
[daviddm-image]: http://img.shields.io/david/jaumard/trailpack-passport.svg?style=flat-square
[daviddm-url]: https://david-dm.org/jaumard/trailpack-passport
[codeclimate-image]: https://img.shields.io/codeclimate/github/jaumard/trailpack-passport.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/jaumard/trailpack-passport
[gitter-image]: http://img.shields.io/badge/+%20GITTER-JOIN%20CHAT%20%E2%86%92-1DCE73.svg?style=flat-square
[gitter-url]: https://gitter.im/trailsjs/trails

## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/jaumard/trailpack-passport/badge.svg?style=beer-square)](https://beerpay.io/jaumard/trailpack-passport)  [![Beerpay](https://beerpay.io/jaumard/trailpack-passport/make-wish.svg?style=flat-square)](https://beerpay.io/jaumard/trailpack-passport?focus=wish)
