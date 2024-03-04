const { Router } = require("express");
const connect = require("../lib/connect");
const Note = require("../models/Note");
const userRoute = require("./users.route");

const r = Router();

r.use("/:user", userRoute);

r.get("/", async (req, res) => {
  await connect();
  const notes = await Note.find().populate("user", "name");

  if (!notes.length) {
    return res.json({ message: "Notes not found" });
  }

  res.json(notes.map((note) => ({ ...note._doc, id: note._id })));
});

module.exports = r;
