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

let randomId;

function seedData() {
  console.log('seeding data');
  const seedDataArray = [];
  for (let i = 0; i < 10 ; i++) {
    seedDataArray.push(seedPost());
  }
  return BlogPost.insertMany(seedDataArray)
  .then(function(res){randomId = res[0].id, console.log(res[0].id)})
}

describe('Blog Post API', function() {
  before(function () { // mocha's describe.before function expects to return promises. We do not end the promises with .then() because that is built into Mocha.
    return runServer(TEST_DATABASE_URL); // runServer() returns a promise (though hard to see)
  });

  beforeEach(function () {
    if (mongoose.connection.collections['blogposts']) {
      new Promise ((resolve, reject) => {mongoose.connection.collections['blogposts'].drop(function(err) {
        console.log('collection dropped');
      })})
      .then(); 
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
        });
    });

    it('should return the 1st item in db', function() {
      return chai.request(app)
        .get(`/posts/${randomId}`)
        .then(function(res){
          res.should.be.json; 
          res.should.have.status(200); 
          res.body.should.be.an('object'); 
          res.body.should.include.keys(['id', 'content', 'author','title', 'created']); 
          res.body.id.should.equal(randomId);
        });
    });

    it('should post an item to the db', function() {
      const testPostData = {
        author: {
          firstName: faker.Name.firstName(),
          lastName: faker.Name.lastName()
        },
        title: faker.Lorem.sentence(5),
        content: faker.Lorem.paragraph()
      }

      return chai.request(app)
        .post('/posts') 
        .send(testPostData)
        .then(function(res){
          res.should.be.json;
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.include.keys(['id', 'content', 'author','title', 'created']);
          res.body.id.should.not.be.null;
          res.body.author.should.equal(
            `${testPostData.author.firstName} ${testPostData.author.lastName}`);
            return BlogPost.findById(res.body.id);
          })
          .then(function(post) {
            post.title.should.equal(testPostData.title);
            post.content.should.equal(testPostData.content);
            post.author.firstName.should.equal(testPostData.author.firstName);
            post.author.lastName.should.equal(testPostData.author.lastName);
          });
    });

    it('should delete a post with a specific id', function() {
      return chai.request(app)
        .delete(`/posts/${randomId}`)
        .then(function(res){
          res.should.have.status(204);
          return BlogPost.findById(`${randomId}`)
        })
        .then(post => {
          should.not.exist(post)
        })
    });

    it('should udpate a post with a specific id', function() {

      const testUpdateData = {
        author: {
          firstName: faker.Name.firstName(),
          lastName: faker.Name.lastName()
        },
        title: faker.Lorem.sentence(5),
        content: faker.Lorem.paragraph()
      }

      return BlogPost.findOne()
      .then(post => {
        testUpdateData.id = post.id

      return chai.request(app)
        .put(`/posts/${randomId}`) 
        .send(testUpdateData)
      })
        .then(function(res){
          res.should.have.status(204);
          return BlogPost.findById(testUpdateData.id)
        })
        .then( post => {
          post.title.should.equal(testUpdateData.title);
          post.content.should.equal(testUpdateData.content);
          post.author.firstName.should.equal(testUpdateData.author.firstName);
          post.author.lastName.should.equal(testUpdateData.author.lastName);
        })
    });

  });

});