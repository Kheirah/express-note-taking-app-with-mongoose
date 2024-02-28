require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const connect = require("./lib/connect");
const Note = require("./models/Note");
const User = require("./models/User");

app.use(express.json());

app.get("/", async (req, res) => {
  await connect();
  const notes = await Note.find().populate("user", "name");

  if (!notes.length) {
    return res.json({ message: "Notes not found" });
  }

  res.json(notes);
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

/* app.get("/:user/:id", async (request, response) => {
  await connect();

  const { id } = request.params;
  const notes = await Note.find({ _id: id });

  if (!notes.length) {
    return response.json({ error: "Note not found." });
  }

  return response.json(notes[0]);
});

 */
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

/*
 * goal:
 * - create user if it doesn't exist
 * - create note with the id of the user
 */
app.post("/:user", async (request, response) => {
  await connect();
  const { user } = request.params;
  console.log(user);
  //check is user exists
  if (user) {
    let { _id: userId } = (await User.findOne({ name: user })) || {
      _id: null,
    }; //short-circuit
    console.log("userId", userId);
    //create new user if it doesn't already exist
    if (!userId) {
      const { _id: newUserId } = (await User.create({ name: user })) || {
        _id: null,
      };
      userId = newUserId;
      console.log("newUserId", newUserId);
    }

    const { content } = request.body;

    if (content) {
      const { _id } = await Note.create({ content, user: userId });
      return response.json({ id: _id, message: "Successfully created note." });
    } else {
      return response.json({
        error: "Note NOT created. Content is missing.",
      });
    }
  }

  response.json({ message: "Couldn't create new note. User is missing." });
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
