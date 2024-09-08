require("dotenv").config({ path: "./.env" });
const express = require("express");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const http = require("http");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
// const studentProfile = require('./sampleProfile');
const uri = process.env.ENV_URI;
const nodemailer = require("nodemailer");

const Student = require("./models/student");
const courseSchema = require("./models/course");

// just a sample
// const studentProfile = {
//   _id: "668b1fb6ae08c03994df4bb9",
//   username: "anujkhadka",
//   studentId: "445623",
//   password: "$2b$10$GPT0szc.kRvm22pCHzXDL.K2/kpFk9YwaIugCRw32/z8XrOCHhmTu",
//   authToken:
//     "c132572ce0675459ec133307d39c858ff12a40139101dbceabd751dcc581a0c42e4790…",
//   major: "Computer Science",
//   gradYear: "2027",
//   advisor: "Lee Ho",
//   firstName: "Anuj",
//   lastName: "Khadka",
//   classification: "Sophomore",
//   phoneNo: "9876543209",
// };

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const store = new MongoDBStore({
  uri: uri,
  collection: "sessions",
});

const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

app.use(
  session({
    secret: "your_secret_key", // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

console.log("AUTH_EMAIL:", process.env.AUTH_EMAIL);
console.log("AUTH_PASSWORD:", process.env.AUTH_PASSWORD);

function sendEmail({ recipient_email, OTP }) {
  console.log("Using OTP:", OTP); // Log OTP
  console.log("Sending email to:", recipient_email); // Log email

  return new Promise((resolve, reject) => {
    console.log("workig till here auth key");
    let transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      logger: true,
      debug: true,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });

    console.log("workig till here");
    const mail_configs = {
      from: process.env.AUTH_EMAIL,
      to: recipient_email,
      subject: "KODING 101 PASSWORD RECOVERY",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  

</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Koding 101</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Koding 101. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Koding 101</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Koding 101 Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("student-management");
    const usersCollection = database.collection("users");
    const catalogCollection = database.collection("catalog");

    // Middleware to check if user is authenticated
    const isAuthenticated = (req, res, next) => {
      const authToken = req.headers.authToken;
      const user = usersCollection.findOne({ authToken });
      if (user && user.authToken === authToken) {
        return next();
      }
      res.status(401).send("Unauthorized");
    };

    // Total no of students for home page
    app.get("/totalStudents", async (req, res) => {
      try {
        const totalStudents = await usersCollection.countDocuments();
        res.send({ totalStudents });
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // User registration
    app.post("/register", async (req, res) => {
      try {
        const { email, id, password, role, firstName, lastName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const authToken = crypto.randomBytes(64).toString("hex");

        const result = await usersCollection.insertOne({
          username: email,
          studentId: id,
          password: hashedPassword,
          authToken,
          role,
          firstName,
          lastName,
        });
        if (result.insertedCount === 0) {
          return res.status(400).send({ message: "User registration failed" });
        } else {
          // filtering out the password from the user object
          usertobesent = await usersCollection.findOne({ username: email });
          delete usertobesent.password;
          return res.status(201).send({
            message: "User registered successfully",
            user: usertobesent,
          });
        }
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // User login
    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await usersCollection.findOne({
          username: email,
        });
        if (!user) return res.status(404).send({ message: "User not found" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
          return res.status(403).send({ message: "Invalid password" });

        const authToken = crypto.randomBytes(64).toString("hex");
        await usersCollection.updateOne(
          { username: email },
          { $set: { authToken } }
        );

        // filtering out the password from the user object
        usertobesent = user;
        usertobesent.authToken = authToken;
        delete usertobesent.password;

        res.send({ message: "Logged in successfully", user: usertobesent });
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    // User logout
    app.post("/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) return res.status(500).send("Could not log out.");
        res.send("Logged out successfully");
      });
    });

    // CRUD operations for students, protected by authentication
    app.post("/students", isAuthenticated, async (req, res) => {
      try {
        const student = req.body;
        const result = await usersCollection.insertOne(student);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.get("/students", isAuthenticated, async (req, res) => {
      try {
        const students = await usersCollection.find().toArray();
        res.send(students);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.get("/catalog", isAuthenticated, async (req, res) => {
      try {
        const catalog = await catalogCollection.find().toArray();
        res.send(catalog[0]);
      } catch (error) {
        console.log("error", error);
        res.status(500).send(error.message);
      }
    });

    app.get("/students/:id", isAuthenticated, async (req, res) => {
      try {
        const student = await usersCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        if (!student) return res.status(404).send("Student not found");
        res.send(student);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.put("/students/:studentId", isAuthenticated, async (req, res) => {
      try {
        const updatedStudent = req.body;
        const result = await usersCollection.updateOne(
          { studentId: req.params.studentId },
          { $set: updatedStudent }
        );
        if (result.matchedCount === 0)
          return res.status(404).send("Student not found");
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.delete("/students/:id", isAuthenticated, async (req, res) => {
      try {
        const result = await usersCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        if (result.deletedCount === 0)
          return res.status(404).send("Student not found");
        res.send(result);
      } catch (error) {
        res.status(500).send(error.message);
      }
    });

    app.get("/username", (req, res) => {
      const username = req.session.username || null;
      res.json({ username });
    });

    // for real time student profile
    app.post("/updateProfile", async (req, res) => {
      try {
        const {
          studentId,
          firstName,
          lastName,
          username,
          advisor,
          gradYear,
          major,
          phoneNo,
        } = req.body;

        console.log(studentId);

        const user = await usersCollection.findOne({ studentId: studentId });

        if (user) {
          await usersCollection.updateOne(
            { studentId: studentId },
            {
              $set: {
                firstName: firstName,
                lastName: lastName,
                username: username,
                advisor: advisor,
                gradYear: gradYear,
                major: major,
                phoneNo: phoneNo,
              },
            }
          );
          const newUser = await usersCollection.findOne({
            studentId: studentId,
          });

          res.status(200).json({
            message: "profile updated successfully",
            newUser: newUser,
          });
          // sessionStorage.setItem("user", JSON.stringify(user));
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "error updating profile" });
      }
    });

    io.on("connection", (socket) => {
      console.log("user connected");
      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });

    app.post("/addstudent", async (req, res) => {
      try {
        const {
          id,
          firstName,
          username,
          lastName,
          email,
          advisor,
          gradYear,
          major,
          phoneNo,
        } = req.body;
        const newStudent = new Student({
          firstName,
          lastName,
          studentId: id,
          email,
          phoneNo,
          major,
          advisor,
          gradYear,
          username,
        });
        console.log(newStudent);

        await usersCollection.insertOne(newStudent);
        res.json({ message: "Added successfully" });
        console.log("added");
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "error during adding" });
      }
    });

    app.post("/addstudenttocourse", async (req, res) => {
      const { courseCode, semester, section, studentId } = req.body;

      try {
        const updateResult = await catalogCollection.updateOne(
          {
            [`classes.$[].${courseCode}.semesters.${semester}.${section}`]: {
              $exists: true,
            },
          },
          {
            $addToSet: {
              [`classes.$[].${courseCode}.semesters.${semester}.${section}.students`]:
                studentId,
            },
          }
        );

        if (updateResult.nModified === 0) {
          return res
            .status(404)
            .json({ message: "Course, semester, or section not found" });
        }

        res
          .status(200)
          .json({ message: "Student added to course successfully" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/addcourse", async (req, res) => {
      try {
        const { courseCode, courseType, courseCategory, courseInstructor } =
          req.body;
        const newCourse = new courseSchema({
          courseCode,
          courseType,
          courseCategory,
          courseInstructor,
        });
        console.log(newCourse);

        await usersCollection.insertOne(newCourse);
        res.json({ message: "Course Added successfully" });
        console.log("added");
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error during adding course" });
      }
    });
    

    app.post("/send_recovery_email", (req, res) => {
      const { recipient_email, OTP } = req.body;

      if (!recipient_email || !OTP) {
        return res.status(400).send("Missing recipient email or OTP.");
      }

      sendEmail({ recipient_email, OTP })
        .then((response) => res.send(response.message))
        .catch((error) => {
          console.error("Email sending error:", error);
          res
            .status(500)
            .send("An error has occurred while sending the email.");
        });
    });

    app.post("/reset-password", async (req, res) => {
      const { email, resetPassword } = req.body;
      console.log(email, resetPassword);
      if (!email || !resetPassword) {
        // return res.status(400).send("Missing email or password.");
        return res.status(400).json({ message: "Missing email or password." });

      }

      try {
        const hashedPassword = await bcrypt.hash(resetPassword, 10);
        const result = await usersCollection.updateOne(
          { username: email },
          { $set: { password: hashedPassword } }
        );

        if (result.matchedCount === 0) {
          // return res.status(404).send("User not found");
          return res.status(404).send({message: "User not found"});

        }

        // res.send("Password reset successfully");
        res.send({ message: "Password reset successfully" });
      } catch (error) {
        console.error("Error resetting password:", error);
        // res.status(500).send("An error occurred while resetting the password.");
        res.status(500).send({ message: "An error occurred while resetting the password." });
        res.status(500).send(error.message);

      }
    }
  );

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

run().catch(console.dir);
