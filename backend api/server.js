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

app.get("/", (request, respond) => {
  respond.send(database.users);
});

// sign in
app.post("/signin", (request, respond) => {
  db.select("email", "hash")
    .from("login")
    .where("email", "=", request.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(request.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", request.body.email)
          .then((user) => {
            respond.json(user[0]);
          })
          .catch((error) => respond.status(400).json("Unable to get user"));
      } else {
        respond.status(400).json("Wrong Credentials");
      }
    })
    .catch((error) => respond.status(400).json("Wrong Credentials"));
});

//  register user to database
app.post("/register", (request, respond) => {
  const { name, email, password } = request.body;
  const hash = bcrypt.hashSync(password);

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            respond.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((error) => respond.status(400).json("unable to register"));
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

  db("users")
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
