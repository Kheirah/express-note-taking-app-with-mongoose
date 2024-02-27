require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const connect = require("./lib/connect");
const Note = require("./model/Note");

app.get("/", async (req, res) => {
  await connect();
  const notes = await Note.find();

  if (!notes.length) {
    return res.json({ message: "Notes not found" });
  }

  res.json(notes);
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
