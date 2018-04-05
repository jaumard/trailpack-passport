'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('PassportService', () => {
  let request, token, user
  before((done) => {
    request = supertest('http://localhost:3000')
    request
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({ username: 'jaumard', password: 'adminadmin', email: 'test@test.te' })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.notEqual(res.body.user.id, null)
        user = res.body.user
        token = res.body.token
        done(err)
      })
  })
  it('should exist', () => {
    assert(global.app.api.services['PassportService'])
    assert(global.app.services['PassportService'])
  })

  it('should insert a user on /auth/local/register', (done) => {
    request
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({ username: 'jim', password: 'adminadmin' })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.notEqual(res.body.user.id, null)
        assert.equal(res.body.user.username, 'jim')
        done(err)
      })
  })

  it('should return an error on missing passport for registration on /auth/local/register', (done) => {
    request
      .post('/auth/local/register')
      .set('Accept', 'application/json') //set header for this test
      .send({ username: 'yoyo' })
      .expect(400)
      .end((err, res) => {
        done(err)
      })
  })

  it('should insert a user on /auth/local/register with form submit', (done) => {
    request
      .post('/auth/local/register')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('username=jim2&password=adminadmin2')
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.notEqual(res.body.user.id, null)
        assert.equal(res.body.user.username, 'jim2')
        done(err)
      })
  })


  it('should log a user on /auth/local', (done) => {
    request
      .post('/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({ email: 'test@test.te', password: 'adminadmin' })
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.notEqual(res.body.user.id, null)
        assert.equal(res.body.user.username, 'jaumard')
        assert(res.body.token)//JWT token
        done(err)
      })
  })

  it('should log a user on /auth/local with form submit', (done) => {
    request
      .post('/auth/local')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('username=jim2&password=adminadmin2')
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.notEqual(res.body.user.id, null)
        assert.equal(res.body.user.username, 'jim2')
        assert(res.body.token)//JWT token
        done(err)
      })
  })

  it('should retreive data on / with JWT token', (done) => {
    request
      .get('/')
      .set('Authorization', `JWT ${token}`)
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        assert.equal('ok', res.text)
        done(err)
      })
  })

  it('should be able to update password', (done) => {
    // Hackfix for trailpack-mongoose, we should update trailpack-mongoose FootprintService.find for avoiding this
    const criteria = (user._id) ? { _id: user.id } : { id: user.id } //eslint-disable-line

    global.app.services.FootprintService.find('user', criteria, { populate: 'passports' })
      .then(user => {
        global.app.services.PassportService.updateLocalPassword(user[0], 'testtest')
          .then(() => {
            done()
          })
          .catch(done)
      })
      .catch(done)
  })

  describe('Third party connect', () => {
    let user
    it('should connect third party', (done) => {
      global.app.services.PassportService.passport.connect({
        params: { provider: 'thirdparty' }
      }, {
        identifier: 'identifier',
        protocol: 'test'
      }, {
        emails: ['teste@test.te']
      }, (err, data) => {
        user = data
        done(err)
      })
    })

    it('should not connect third party if already connected', (done) => {
      global.app.services.PassportService.passport.connect({
        user: user,
        params: { provider: 'thirdparty' }
      }, {
        identifier: 'identifier',
        protocol: 'test'
      }, {
        emails: ['teste@test.te']
      }, (err, data) => {
        done(err)
      })
    })

    it('should connect third party even if passport already exist', (done) => {
      global.app.services.PassportService.passport.connect({
        params: { provider: 'thirdparty' }
      }, {
        identifier: 'identifier',
        protocol: 'test'
      }, {
        emails: ['teste@test.te']
      }, (err, data) => {
        done(err)
      })
    })

    it('should connect another third party when user still connected', (done) => {
      global.app.services.PassportService.passport.connect({
        user: user,
        params: { provider: 'thirdpartybis' }
      }, {
        identifier: 'identifier',
        protocol: 'test'
      }, {
        emails: ['teste@test.te']
      }, (err, data) => {
        done(err)
      })
    })
  })
})
