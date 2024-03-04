const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const User = require("../models/User");
const r = Router({ mergeParams: true });

r.get("/", async (request, response) => {
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

/*
 * goal:
 * - create user if it doesn't exist
 * - create note with the id of the user
 */
r.post("/", async (request, response) => {
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

module.exports = r;
