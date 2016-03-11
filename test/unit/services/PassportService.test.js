'use strict'
/* global describe, it */

const assert = require('assert')
const supertest = require('supertest')

describe('PassportService', () => {
  let request
  before((done) => {
    request = supertest('http://localhost:3000')
    request
      .post('/auth/local/register')
      .set('Accept', 'application/json;') //set header for this test
      .send({username: 'jaumard', password: 'adminadmin'})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.equal(res.body.user.id, 1)
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
      .set('Accept', 'application/json;') //set header for this test
      .send({username: 'jim', password: 'adminadmin'})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.equal(res.body.user.id, 2)
        done(err)
      })
  })


  it.skip('should log a user on /auth/local', (done) => {
    request
      .post('/auth/local')
      .set('Accept', 'application/json;') //set header for this test
      .send({username: 'jaumard', password: 'adminadmin'})
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.redirect, '/')
        assert.equal(res.body.user.id, 1)
        done(err)
      })
  })
})
