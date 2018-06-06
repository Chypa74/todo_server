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

  if (action.type === 'EDIT_TODO_TITLE') meta.reasons.push('editTodoTitle');

  if (action.type === 'EDIT_TODO_TEXT') meta.reasons.push('editTodoText');

  if (action.type === 'DELETE_TODO') meta.reasons.push('deleteTodo');

  if (action.type === 'COMPLETE_TODO') meta.reasons.push('completeTodo');

  if (action.type === 'COMPLETE_ALL_TODOS')
    meta.reasons.push('completeAllTodos');
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

app.type('EDIT_TODO_TITLE', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    db.get()
      .collection('todos')
      .updateOne({ todoId: action.todoId }, { $set: { title: action.title } });
  }
});

app.type('EDIT_TODO_TEXT', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    db.get()
      .collection('todos')
      .updateOne({ todoId: action.todoId }, { $set: { text: action.text } });
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

app.type('COMPLETE_TODO', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    db.get()
      .collection('todos')
      .updateOne(
        { todoId: action.todoId },
        { $set: { completed: action.completed } },
        function(err, result) {
          if (err) {
            return console.log(err);
          }
          console.log(result.ops);
        }
      );
  }
});

app.type('COMPLETE_ALL_TODOS', {
  access(action, meta, creator) {
    console.log(action);
    return true;
  },
  process(action) {
    let areAllMarked;
    console.log(areAllMarked);
    db.get()
      .collection('todos')
      .find()
      .toArray(function(err, docs) {
        if (err) {
          return console.log(err);
        }
        areAllMarked = docs.every(todo => todo.completed);

        db.get()
          .collection('todos')
          .updateMany({}, { $set: { completed: !areAllMarked } }, function(
            err,
            result
          ) {
            if (err) {
              return console.log(err);
            }
          });
      });
  }
});
