const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/user");
const cors = require("cors");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const Student = require("./models/student")
const authMiddleware = require("./authMiddleware"); 
const crypto = require("crypto");

const generateApiKey = () => {
  return crypto.randomBytes(32).toString("hex"); // Generates a random API key
};

const app = express();
dotenv.config();

// Enable CORS for frontend requests
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,PATCH", 
    allowedHeaders: "Content-Type,Authorization,x-api-key",
  })
);

// Parse JSON request body
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.mongodb_uri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.log("MongoDB connection error:", error));

  app.post("/register", async (req, res) => {
    try {
      const { fName, lName, email, dob, password } = req.body;
  
      // Trim input values to prevent leading/trailing spaces
      if (!fName?.trim() || !lName?.trim() || !email?.trim() || !dob?.trim() || !password?.trim()) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email: email.trim() });
      if (existingUser) {
        return res.status(409).json({ message: "Email is already registered" }); // 409 Conflict status
      }
  
      // Hash password securely
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Save new user to the database
      const newUser = new User({
        fName: fName.trim(),
        lName: lName.trim(),
        email: email.trim(),
        dob: dob.trim(),
        password: hashedPassword
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error, please try again later" });
    }
  });
  

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({ message: "Error occurred in fetching users" });
  }
});



const getStudentModel = (collectionName) => {
  return mongoose.models[collectionName] || mongoose.model(collectionName, Student.schema, collectionName);
};

// Fetch all students
app.get("/:apiKey/allstudents", async (req, res) => {
  try {
    const { apiKey } = req.params;
    const user = await User.findOne({ apiKey }).exec();
    if (!user) return res.status(401).json({ message: "Invalid API key" });

    let allStudents = [];
    for (let year = 1; year <= 4; year++) {
      const collectionName = `students_year${year}`;
      const StudentModel = getStudentModel(collectionName);
      const students = await StudentModel.find();
      allStudents = [...allStudents, ...students];
    }
    res.json({ students: allStudents });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
});

// Fetch students by year
const getStudentsByYear = (year) => {
  return async (req, res) => {
    try {
      const { apiKey } = req.params;
      const user = await User.findOne({ apiKey }).exec();
      if (!user) return res.status(401).json({ message: "Invalid API key" });

      const collectionName = `students_year${year}`;
      const StudentModel = getStudentModel(collectionName);
      const students = await StudentModel.find();
      res.json({ students });
    } catch (error) {
      console.error(`Error fetching year ${year} students:`, error);
      res.status(500).json({ message: `Error fetching year ${year} students` });
    }
  };
};

// Routes for each year
app.get("/:apiKey/students/first-year", getStudentsByYear(1));
app.get("/:apiKey/students/second-year", getStudentsByYear(2));
app.get("/:apiKey/students/third-year", getStudentsByYear(3));
app.get("/:apiKey/students/fourth-year", getStudentsByYear(4));


const postStudentData = (year) => {
  return async (req, res) => {
    try {
      const { apiKey } = req.params; // Get API key from URL

      // Validate API Key
      const user = await User.findOne({ apiKey });
      if (!user) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const collectionName = `students_year${year}`;
      const StudentModel = mongoose.model(collectionName, Student.schema, collectionName);

      // Check for duplicate hall ticket or email
      const existingStudent = await StudentModel.findOne({
        $or: [
          { hallTicket: req.body.hallTicket },
          { email: req.body.email }
        ]
      });

      if (existingStudent) {
        let duplicateField = '';
        if (existingStudent.hallTicket === req.body.hallTicket) {
          duplicateField = 'hall ticket';
        } else {
          duplicateField = 'email';
        }
        return res.status(409).json({ 
          message: `Duplicate entry found`,
          details: `${duplicateField} already exists in the database`
        });
      }

      const newStudent = new StudentModel(req.body);
      await newStudent.save();

      res.status(201).json({ 
        message: `Student added to year ${year} successfully`, 
        student: newStudent 
      });
    } catch (error) {
      console.error(`Error adding student to year ${year}:`, error);
      res.status(500).json({ 
        message: `Error occurred while adding student to year ${year}` 
      });
    }
  };
};

// Keep your existing route definitions exactly as they are
app.post("/:apiKey/students/postfirst-year", postStudentData(1));
app.post("/:apiKey/students/postsecond-year", postStudentData(2));
app.post("/:apiKey/students/postthird-year", postStudentData(3));
app.post("/:apiKey/students/postfourth-year", postStudentData(4));

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

      const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Use env variable
      { expiresIn: "1h" }
    );
    res.json({ success: true, message: "Login successful!", token, name:user.fName });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/get-api-key", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Use correct ID
    if (!user || !user.apiKey) return res.json({ apiKey: null });

    res.json({ apiKey: user.apiKey });
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ message: "Error fetching API key" });
  }
});

app.post("/generate-api-key", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Use correct ID

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.apiKey) return res.json({ apiKey: user.apiKey });

    const newApiKey = generateApiKey();
    user.apiKey = newApiKey;
    await user.save();

    res.json({ apiKey: newApiKey });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ message: "Error generating API key" });
  }
});

const updateStudentField = (year) => {
  return async (req, res) => {
    try {
      const apiKey = req.header("x-api-key");
      if (!apiKey) return res.status(401).json({ message: "API key required" });

      // ✅ Remove bcrypt.compare (since API keys are plaintext)
      const user = await User.findOne({ apiKey }); // Direct comparison
      if (!user) return res.status(401).json({ message: "Invalid API key" });

      const { studentId } = req.params;
      const updates = req.body;

      const collectionName = `students_year${year}`;
      const StudentModel = mongoose.model(collectionName, Student.schema, collectionName);

      const updatedStudent = await StudentModel.findByIdAndUpdate(
        studentId,
        updates,
        { new: true }
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ 
        message: `Student updated in year ${year}`,
        student: updatedStudent,
      });
    } catch (error) {
      console.error(`Error updating student (year ${year}):`, error);
      res.status(500).json({ message: "Server error during update" });
    }
  };
};

// Routes for updating a specific student field
app.patch("/students/:studentId/first-year", updateStudentField(1));
app.patch("/students/:studentId/second-year", updateStudentField(2));
app.patch("/students/:studentId/third-year", updateStudentField(3));
app.patch("/students/:studentId/fourth-year", updateStudentField(4));


const deleteStudent = (year) => {
  console.log(`Deleting student from year ${year}`);

  return async (req, res) => {
    try {
      const apiKey = req.header("x-api-key"); // ✅ API key from headers
      if (!apiKey) return res.status(401).json({ message: "API key required" });

      // Validate API Key
      const user = await User.findOne({ apiKey });
      if (!user) {
        return res.status(401).json({ message: "Invalid API key" });
      }

      const { hallTicket } = req.params; // Get hall ticket from URL

      const collectionName = `students_year${year}`;
      const StudentModel = mongoose.model(collectionName, Student.schema, collectionName);

      // Find and delete student
      const deletedStudent = await StudentModel.findOneAndDelete({ hallTicket });

      if (!deletedStudent) return res.status(404).json({ message: "Student not found" });

      res.json({ message: `Student with Hall Ticket ${hallTicket} deleted successfully from year ${year}` });
    } catch (error) {
      console.error(`Error deleting student from year ${year}:`, error);
      res.status(500).json({ message: `Error deleting student from year ${year}` });
    }
  };
};


app.delete("/students/:hallTicket/first-year", deleteStudent(1));
app.delete("/students/:hallTicket/second-year", deleteStudent(2));
app.delete("/students/:hallTicket/third-year", deleteStudent(3));
app.delete("/students/:hallTicket/fourth-year", deleteStudent(4));



const searchStudent = (year) => {
  return async (req, res) => {
    try {
      const apiKey = req.header('x-api-key');
      if (!apiKey) return res.status(401).json({ message: "API key required" });

      // Validate API key
      const user = await User.findOne({ apiKey });
      if (!user) return res.status(401).json({ message: "Invalid API key" });

      const { hallticket, email } = req.query;

      const collectionName = `students_year${year}`;
      const StudentModel = mongoose.model(collectionName, Student.schema, collectionName);

      let query = {};
      if (hallticket) query.hallTicket = hallticket;
      else if (email) query.email = email;
      else return res.status(400).json({ message: "Provide hallticket or email" });

      const student = await StudentModel.findOne(query);
      if (!student) return res.status(404).json({ message: "Student not found" });

      res.json(student);
    } catch (error) {
      console.error(`Error searching year ${year}:`, error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

// Define search routes
app.get('/search/first-year', searchStudent(1));
app.get('/search/second-year', searchStudent(2));
app.get('/search/third-year', searchStudent(3));
app.get('/search/fourth-year', searchStudent(4));





const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
