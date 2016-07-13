'use strict';

const assert = require('assert');
const app    = require('../../../src/app');
var request  = require('supertest');
var should   = require('should');

var messages = require( '../../../src/services/messages/messages-model');
var messagesModel = messages(app.get('sequelize'));

describe('messages service', function() {

  var msgId = null;

  before(function(done) { // runs before all tests in this block

    // prepare a record we will use in one of the test cases
    var msg = messagesModel.build({ 'text': 'hello world'});
    msg.save().then(function(msg){
      msgId = msg.id;
      done();
    });

  });

  after(function(done) { // runs after all tests in this block

    // cleanup table
    messagesModel.findAll().then(function(msgs){
      for(var i in msgs) {
        var msg = msgs[i];
        msg.destroy();
      }
      done();
    });

  });

  beforeEach(function(done) {
    // runs before each test in this block
    done();
  });

  afterEach(function(done) {
    // runs after each test in this block
    done();
  });


  it('registered the messages service', () => {
    assert.ok(app.service('messages'));
  });

  it('should create a message on POST /messages', (done) => {
    var sampleMsg = {
        'text': 'hello world'
    };
    request(app)
      .post('/messages')
      .send(sampleMsg)
      .expect('Content-Type', /json/)
      .expect(201)
      .end(function(err, res) {
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('id');
        res.body.should.have.property('text');
        res.body.should.have.property('createdAt');
        res.body.should.have.property('updatedAt');
        res.body.text.should.equal('hello world');
        done();
      });
  });

  it('should list all messages on GET /messages', (done) => {
    request(app)
      .get('/messages')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        res.body.should.be.an.instanceOf(Object);
        res.body.data.should.be.an.instanceOf(Array);
        res.body.data[0].should.have.property('id');
        res.body.data[0].should.have.property('text');
        done();
      });
  });

  it('should retrieve a SINGLE message on GET /messages/<id>', function(done) {
    request(app)
      .get('/messages/'  + msgId)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('id');
        res.body.should.have.property('text');
        res.body.should.have.property('createdAt');
        res.body.should.have.property('updatedAt');
        done();
      });
  });

  it('should update a SINGLE message on PUT /messages/<id>', function(done) {
    request(app)
      .put('/messages/' + msgId)
      .send({'text': 'hello world 11'})
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('id');
        res.body.should.have.property('text');
        res.body.text.should.equal('hello world 11');
        done();
      });
  });

  it('should delete a SINGLE message on DELETE /messages/<id>', function(done) {
    request(app)
      .del('/messages/' + msgId)
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('id');
        done();
      });
  });


});
