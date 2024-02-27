const mongoose = require("mongoose");

const { Schema } = mongoose;

const noteSchema = new Schema({
  content: { type: String },
});

/* model in code = collection in db */
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;
