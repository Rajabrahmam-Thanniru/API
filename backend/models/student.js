const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  hallTicket: String,
  gpa: Number,
  email: String,
  year : String,
});

module.exports = mongoose.model("Student", studentSchema);
