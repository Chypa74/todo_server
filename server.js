'use strict';
const Server = require('logux-server').Server;
const isFirstOlder = require('logux-core/is-first-older');
const db = require('./db');

const app = new Server(
  Server.loadOptions(process, {
    subprotocol: '1.0.0',
    supports: '1.x',
    root: __dirname
  })
);

db.connect(
  'mongodb://localhost:27017/',
  function(err) {
    if (err) {
      return console.log(err);
    }
    app.listen();
  }
);

app.auth((userId, token) => {
  // console.log(app.log);
  return Promise.resolve(true);
});

app.log.on('preadd', (action, meta) => {
  if (action.type === 'ADD_TODO') meta.reasons.push('newTodo');

  if (action.type === 'DELETE_TODO') meta.reasons.push('deleteTodo');
});

app.type('ADD_TODO', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    let todo = {
      title: action.title,
      text: '',
      completed: false,
      todoId: action.todoId
    };
    db.get()
      .collection('todos')
      .insertOne(todo, function(err, result) {
        if (err) {
          return console.log(err);
        }
        console.log(result.ops);
      });
  }
});

app.type('DELETE_TODO', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    db.get()
      .collection('todos')
      .deleteOne({ todoId: action.todoId }, function(err, result) {
        if (err) {
          return console.log(err);
        }
        console.log(result.ops);
      });
  }
});

app.log.on('add', (action, meta) => {});

// app.log.on('clean', (action, meta) => {
//   console.log('Action was cleaned: ', action, meta.id);
//   console.log(app.log);
// });
