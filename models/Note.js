const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
  content: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User" },
});

/* model in code = collection in db */
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;
