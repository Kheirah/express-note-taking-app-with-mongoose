const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String },
});

/* model in code = collection in db */
const User = mongoose.models.User || mongoose.model("User", userSchema);

//the code from above does the following explicitly
/* let userModel;
if (mongoose.models.User === undefined) {
  userModel = mongoose.model("User", userSchema);
} else {
  userModel = mongoose.models.User;
} */

module.exports = User;
