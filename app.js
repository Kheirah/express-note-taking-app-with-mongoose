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

app.get("/:id", async (request, response) => {
  await connect();

  const { id } = request.params;
  const notes = await Note.find({ _id: id });

  if (!notes.length) {
    return response.json({ error: "Note not found." });
  }

  return response.json(notes[0]);
});

//code for vegan DELETE
app.delete("/:tofu", async (request, response) => {
  await connect();
  const { tofu } = request.params;

  const { acknowledged, deletedCount } = await Note.deleteOne({ _id: tofu });

  if (!acknowledged || !deletedCount) {
    response.json("Note not deleted.");
  }

  response.json({ acknowledged, deletedCount });
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
