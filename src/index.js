const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find((users) => users.username === username);

  if (!user) {
    return res.status(400).json({ error: "usuario não cadastrado." });
  }

  req.user = user;

  return next();
}

app.post("/users", (req, res) => {
  const { name, username } = req.body;

  //chekif exists
  const checkUserExist = users.some((user) => user.username === username);

  if (checkUserExist) {
    return res.status(400).json({ error: "Usuario já existente." });
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: [],
  });

  res.status(201).send("Usuario criado com sucesso.");
});

app.get("/users", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user);
});

app.get("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;

  return res.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return res.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;

  const checkTodo = user.todos.find((todo) => todo.id === id);

  if (!checkTodo) {
    return res
      .status(400)
      .json({ error: "todo não encontrado pela id especificada." });
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline);

  return res.status(200).json(checkTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const checkTodo = user.todos.find((todo) => todo.id === id);

  if (!checkTodo) {
    return res
      .status(400)
      .json({ error: "Nenhum todo encontrado com a ID especificada." });
  }

  checkTodo.done = true;

  return res.status(201).json(checkTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res
      .status(400)
      .json({ error: "Nenhum todo encontrado com a ID especificada." });
  }

  user.todos.splice(todoIndex, 1);

  return res.status(204).json();
});

module.exports = app;
