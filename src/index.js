const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userNameExist = users.find((user) => user.username === username);
  if (!userNameExist) {
    return response.status(404).json({ error: "Usuario nao cadastrado" });
  }
  request.userNameExist = userNameExist;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userNameVerify = users.some((user) => user.username === username);
  if(userNameVerify){
    return response.status(400).json({ error:"Username já existe!"})
  }

  users.push ({ 
    name,
    username,
    todos: []
  });
  return response.status(201).send()
}); 

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { userNameExist } = request;
  return response.json(userNameExist.todos)
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { userNameExist } = request;
  const createtodos = {
    id:uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    create_at:new Date()
  }
  userNameExist.todos.push(createtodos);

  return response.status(201).send();
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { userNameExist } = request;

  const todo = userNameExist.todos.find((todoid) => todoid.id === id);
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).send()
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { done } = request.body;
  const { userNameExist } = request;

  const tododone = userNameExist.todos.find((donetodos) => donetodos.id === id);
  tododone.done = done;

  return response.status(200).send()
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userNameExist } = request;
  const todosExist = userNameExist.todos.findIndex((existtodos) => existtodos.id === id)
  if(todosExist === -1) {
    return response.status(404).json({error: "Essa tarefa nao existe!"})
  }
    userNameExist.todos.splice(todosExist, 1);

    return response.status(204).send()
});

module.exports = app;
