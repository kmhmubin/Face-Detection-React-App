const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "password",
    database: "Face-Detect-React-App",
  },
});

const app = express();

app.use(cors());

app.use(bodyParser.json());

const database = {
  users: [
    {
      id: "123",
      name: "jhon",
      email: "jhon@gmail.com",
      password: "cookies",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "124",
      name: "sally",
      email: "sally@gmail.com",
      password: "bananas",
      entries: 0,
      joined: new Date(),
    },
  ],
};

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (request, respond) => {
  if (
    request.body.email === database.users[0].email &&
    request.body.password === database.users[0].password
  ) {
    respond.json("success");
  } else {
    respond.status(400).json("error logging in");
  }
});

app.post("/register", (request, respond) => {
  const { name, email, password } = request.body;
  db("users")
    .returning("*")
    .insert({
      email: email,
      name: name,
      joined: new Date(),
    })
    .then((user) => {
      respond.json(user[0]);
    })
    .catch((error) => respond.status(400).json("unable to register"));
});

app.get("/profile/:id", (request, respond) => {
  const { id } = request.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        respond.json(user[0]);
      } else {
        respond.status(400).json("Not Found");
      }
    })
    .catch((error) => respond.status(400).json("Error getting user"));
});

// image entry count

app.put("/image", (request, respond) => {
  const { id } = request.body;

  db("user")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      respond.json(entries[0]);
    })
    .catch((error) => respond.status(400).json("Eror getting entries"));
});

app.listen(3000, () => {
  console.log("App is running on port 3000");
});
