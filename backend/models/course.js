// models/course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  courseCategory: String,
  courseDescription: String,
  courseCredit: Number,
  maxStudents: Number,
  // studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('Course', courseSchema);

