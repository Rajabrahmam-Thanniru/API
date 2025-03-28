require("dotenv").config();
const mongoose = require("mongoose");


mongoose
  .connect(process.env.mongodb_uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));


const Student = require("./models/student");


const toRoman = (num) => {
  const romanNumerals = ["I", "II", "III", "IV"];
  return romanNumerals[num - 1]; 
};


const generateHallTicket = (year) => {
  const uniqueNumber = Math.floor(10000 + Math.random() * 90000); 
  return `2103A${year}${uniqueNumber}`;
};


const generateStudents = (year) => {
  const students = [];
  for (let i = 0; i < 20; i++) {
    const hallTicket = generateHallTicket(year);
    const student = {
      hallTicket,
      gpa: (Math.random() * 10).toFixed(2), 
      email: `${hallTicket}@school.edu.in`,
      year: toRoman(year), 
    };
    students.push(student);
  }
  return students;
};


const insertStudents = async () => {
  for (let year = 1; year <= 4; year++) {
    const StudentModel = mongoose.model(`students_year${year}`, Student.schema);
    const students = generateStudents(year);
    await StudentModel.insertMany(students);
    console.log(`Inserted 20 students into students_year${year} collection`);
  }
  mongoose.connection.close();
};


insertStudents();
