'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const faker = require('Faker');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, PORT } = require('../config');
const { BlogPost } = require('../models');

mongoose.Promise = global.Promise;

chai.use(chaiHttp);

function seedPost() {
  return {
    author: {
      firstName: faker.Name.firstName(),
      lastName: faker.Name.lastName()
    },
    title: faker.Lorem.sentence(5),
    content: faker.Lorem.paragraph()
  };
}

function seedData() {
  console.log('seeding data');
  const seedDataArray = [];
  for (let i = 0; i < 10 ; i++) {
    seedDataArray.push(seedPost());
  }
  return BlogPost.insertMany(seedDataArray);
}

describe('Blog Post API', function() {
  before(function () { // mocha's describe.before function expects to return promises. We do not end the promises with .then() because that is built into Mocha.
    return runServer(TEST_DATABASE_URL); // runServer() returns a promise (though hard to see)
  });

  beforeEach(function () {
    if ( mongoose.connection.collections['blogposts']) {
      mongoose.connection.collections['blogposts'].drop(      function(err) {
        console.log('collection dropped');
      });
    } else {
      console.log('nothing to drop');      
    }
    return seedData();    
  });

  afterEach(function () {
    console.log('after each');
  });

  after(function () {
    return closeServer(); // closeServer() returns a promise (and easy to see)
  });

  describe('Start Test Suite', function() {

    let testId;
    
    it('should return all blog posts', function() {
      return chai.request(app)
        .get('/posts')
        .then(function(res){
          res.should.be.json; 
          res.should.have.status(200); 
          // header Content-Type →application/json
          res.body.should.be.an('array'); 
          res.body.length.should.equal(10);
          res.body.forEach(function(post) {
            post.should.be.an('object'); // each item in array type is object
            post.should.include.keys(['id', 'content', 'author','title', 'created']); // each object in array keys id, author, content, title, created
          });
          testId = res.body[0].id;          
        });
    });

    it('should return the 1st item in db', function() {
      return chai.request(app)
        .get(`/posts/${testId}`)
        .then(function(res){
          res.should.be.json; 
          res.should.have.status(200); 
          res.body.should.be.an('array'); 
          res.body.should.have.length.equal(1);
          res.body.forEach(function(post) {
            post.should.be.an('object'); 
            post.should.include.keys(['id', 'content', 'author','title', 'created']); 
            post.body.id.should.equal(testId);
          });
        });
    });

    it.skip('should something', function() {
      return chai.request(app)
        .post('/posts') 
        .then(function(res){
          res.should
        });
    });

    it.skip('should something', function() {
      return chai.request(app)
        .delete('/posts/:id')
        .then(function(res){
          res.should
        });
    });

    it.skip('should something', function() {
      return chai.request(app)
        .put('/posts/:id') 
        .then(function(res){
          res.should
        });
    });

  });

});