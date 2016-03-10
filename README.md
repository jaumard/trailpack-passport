# trailpack-passport
[![Gitter][gitter-image]][gitter-url]
[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

:package: Trailpack to allow passport authentification to Trails application

WARNING : This Trailpack work only with `trailpack-express4` 

## Intallation
With yo : 

```
npm install -g yo generator-trails
yo trails:trailpack trailpack-passport
```

With npm (you will have to create config file manually) :
 
`npm install --save trailpack-passport`

## Configuration
```js
// config/session.js
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
        jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token')
      }
    },

    local: {
      strategy: require('passport-local').Strategy,
      options: {
        usernameField: 'username'
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

### Log/Register users
You can register or log users with third party strategies by redirect the user to : 
```
http://localhost:3000/auth/{provider}
example github 
http://localhost:3000/auth/github
```

For local authentification you have to POST credentials to `/auth/local` in order to log the user.

### Logout
Just make a GET to `auth/logout`

## License
[MIT](https://github.com/jaumard/trailpack-passport/blob/master/LICENSE)


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
