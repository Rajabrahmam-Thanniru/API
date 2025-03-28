const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is unique
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  apiKey: { type: String, unique: true, sparse: true }, // Ensure API key is unique but allows null
});

const User = mongoose.model("User", userSchema);

module.exports = User;
