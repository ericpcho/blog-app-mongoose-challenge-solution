'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const faker = require('faker');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, PORT } = require('../config');

mongoose.Promise = global.Promise;

chai.use(chaiHttp);


// seed data, user FAKER!
function seedData() {

 // get variable of total posts added
}

describe('Blog Post API', function() {
  before(function () { // mocha's describe.before function expects to return promises. We do not end the promises with .then() because that is built into Mocha.
    return runServer(); // runServer() returns a promise (though hard to see)
  });

  beforeEach(function () {
    db.blogPosts.drop(); 
    return seedData(); // similar to above, but nested. seedData() must return a promise as well.
  });

  afterEach(function () {
    console.log('after each');
  });

  after(function () {
    return closeServer(); // closeServer() returns a promise (and easy to see)
  });

  describe('Start Test Suite', function() {

    it('should return all blog posts', function() {
      return chai.request(app)
        .get('/posts')
        .then(function(res){
          res.should.be.json; 
          res.should.have.status(200); 
          // header Content-Type →application/json
          res.should.be.an('array'); // type array
          //res.body.should.have.length // test length of array (match seed data length)
          res.body.forEach(function(post) {
            post.should.be.an('object'); // each item in array type is object
            post.should.include.keys(['id', 'content', 'author','title', 'created']); // each object in array keys id, author, content, title, created
          });
        });
    });

    it.skip('should something', function() {
      return chai.request(app)
        .get('/posts/:id')
        .then(function(res){
          res.should
        });
    })

    it.skip('should something', function() {
      return chai.request(app)
        .post('/posts') 
        .then(function(res){
          res.should
        });
    })

    it.skip('should something', function() {
      return chai.request(app)
        .delete('/posts/:id')
        .then(function(res){
          res.should
        });
    })

    it.skip('should something', function() {
      return chai.request(app)
        .put('/posts/:id') 
        .then(function(res){
          res.should
        });
    })

  });

});