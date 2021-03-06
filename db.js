'use strict';
const MongoClient = require('mongodb').MongoClient;

let state = {
  db: null
};

exports.connect = function(url, done) {
  if (state.db) {
    return done();
  }

  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        return done(err);
      }
      const dbName = 'TodoApp';

      state.db = client.db(dbName);
      done();
    }
  );
};

exports.get = function() {
  return state.db;
};
