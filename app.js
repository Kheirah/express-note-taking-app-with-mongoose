require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const connect = require("./lib/connect");
const Note = require("./models/Note");
const User = require("./models/User");

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  await connect();
  const notes = await Note.find().populate("user", "name");

  if (!notes.length) {
    return res.json({ message: "Notes not found" });
  }

  res.json(notes.map((note) => ({ ...note._doc, id: note._id })));
});

app.get("/:user", async (request, response) => {
  await connect();
  const { user } = request.params;

  const { _id: userId } = (await User.findOne({ name: user })) || {
    _id: null,
  }; //short-circuit

  if (!userId) {
    return response.json({ message: "Can't show notes. User does not exist." });
  }

  //get all notes that belong to userId
  const notes = await Note.find({ user: userId }).populate("user");

  if (!notes.length) {
    return response.json({ message: "No notes found." });
  }

  response.json(notes);
});

app.get("/:user/:id", async (request, response) => {
  await connect();

  const { user, id } = request.params;

  const { _id: userId } = (await User.findOne({ name: user })) || { _id: null };

  if (!userId) {
    return res.json({ message: "That user doesn't exist." });
  }

  const {
    _id: noteId,
    user: userOfNote,
    content,
  } = (await Note.findOne({
    _id: id,
  }).populate("user", "name")) || { _id: null, user: null };

  if (!noteId || userOfNote.name != user) {
    return response.json({
      message: "That note either does not exist or belong to that user.",
    });
  }

  return response.json({ _id: noteId, content, user: userOfNote });
});

//code for vegan DELETE
app.delete("/:user/:tofu", async (request, response) => {
  await connect();
  const { user, tofu } = request.params;

  const { _id: userId } = (await User.findOne({ name: user })) || { _id: null };

  if (!userId) {
    return response.json({ message: "Could not find user." });
  }

  const { _id: noteId, user: userOfNote } = (await Note.findOne({
    _id: tofu,
  }).populate("user", "name")) || { _id: null, user: null }; // replacement object

  if (!noteId || userOfNote.name != user) {
    return response.json({
      message: "That note either does not exist or belong to that user.",
    });
  }

  await Note.deleteOne({ _id: tofu });

  response.json({ message: "Note was deleted successfully." });
});

app.get("/search/:str", async (request, response) => {
  await connect();
  const { str } = request.params;
  const regex = new RegExp(str, "i");
  const notes = await Note.find({ content: regex });
  response.json(notes);
});

/*
 * goal:
 * - create user if it doesn't exist
 * - create note with the id of the user
 */
app.post("/:user", async (request, response) => {
  await connect();
  const { user } = request.params;

  //check is user exists
  if (user) {
    let { _id: userId } = (await User.findOne({ name: user })) || {
      _id: null,
    }; //short-circuit

    //create new user if it doesn't already exist
    if (!userId) {
      const { _id: newUserId } = (await User.create({ name: user })) || {
        _id: null,
      };
      userId = newUserId;
    }

    const { content } = request.body;

    if (content) {
      const { _id } = await Note.create({ content, user: userId });
      return response.json({ id: _id, message: "Successfully created note." });
    } else {
      return response.json({
        message: "Note NOT created. Content is missing.",
      });
    }
  }

  response.json({ message: "Couldn't create new note. User is missing." });
});

app.put("/:user/:id", async (req, res) => {
  await connect();
  const { user, id } = req.params;
  const { content } = req.body;

  const { _id: userId } = (await User.findOne({ name: user })) || { _id: null };

  if (!userId) {
    return res.json({ message: "That user does not exist." });
  }

  const { _id: noteId, user: userOfNote } = (await Note.findOne({
    _id: id,
  }).populate("user", "name")) || { _id: null, user: null };

  if (!noteId || userOfNote.name != user) {
    return response.json({
      message: "That note either does not exist or belong to that user.",
    });
  }

  const { _id } = await Note.findByIdAndUpdate(id, { content });

  if (!_id) {
    return res.json({ message: "Note not found" });
  }

  return res.json({ message: "Successfully edited the note." });
});

const server = app.listen(port, () =>
  console.log(`Express app listening on port ${port}!`)
);

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
