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

app.get("/search/:str", async (request, response) => {
  await connect();
  const { str } = request.params;
  const regex = new RegExp(str, "i");
  const notes = await Note.find({ content: regex });
  response.json(notes);
});

app.post("/:user", async (request, response) => {
  await connect();
  const { content } = request.body;

  if (content) {
    const { _id } = await Note.create({ content });
    response.json({ id: _id, message: "Successfully created note." });
  } else {
    response.json({
      error: "Note NOT created. Content is missing.",
    });
  }
});

app.put("/:id", async (req, res) => {
  await connect();
  const id = req.params.id;
  const { content } = req.body;

  const { _id } = await Note.findByIdAndUpdate(id, { content });

  if (!_id) {
    return res.json({ error: "Note not found" });
  }

  return res.json("Successfully edited the note.");
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
