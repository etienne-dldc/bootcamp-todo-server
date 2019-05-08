const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const MONGOURL = process.env.MONGODB_URI || 'mongodb://localhost/todo';

mongoose.connect(MONGOURL, { useNewUrlParser: true });

const Todo = mongoose.model('Todo', {
  name: String,
  done: Boolean,
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    return res.json(
      todos.map(todo => {
        return {
          id: todo._id,
          done: todo.done,
          name: todo.name,
        };
      })
    );
  } catch (error) {
    res.status(500).json({
      message: 'Internal error',
      error: error.message,
    });
  }
});

app.post('/create', async (req, res) => {
  try {
    const { name, done } = req.body;
    const todo = new Todo({
      name: name,
      done: done,
    });
    await todo.save();
    res.json({
      id: todo._id,
      done: todo.done,
      name: todo.name,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal error',
      error: error.message,
    });
  }
});

app.post('/update', async (req, res) => {
  try {
    const { id, done, name } = req.body;
    const todo = await Todo.findById(id);
    if (!todo) {
      res.status(404).json({
        message: `Cannot found todo with id ${id}`,
      });
    }
    if (done !== undefined) {
      todo.done = done;
    }
    if (name !== undefined) {
      todo.name = name;
    }
    await todo.save();
    return res.json({
      id: todo._id,
      done: todo.done,
      name: todo.name,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal error',
      error: error.message,
    });
  }
});

app.post('/delete', async (req, res) => {
  const { id } = req.body;
  try {
    const todo = await Todo.findById(id);
    if (!todo) {
      res.status(404).json({
        message: `Cannot found todo with id ${id}`,
      });
    }
    await todo.remove();
    return res.status(200).end();
  } catch (error) {
    res.status(500).json({
      message: 'Internal error',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
