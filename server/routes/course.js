const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getFacultyCourses,
  addCourse,
  getCourseById,
  importStudents
} = require('../controllers/courseController');

// All routes are protected
router.use(auth);

// Get all courses for logged in faculty
router.get('/', getFacultyCourses);

// Add a new course
router.post('/', addCourse);

// Get specific course details
router.get('/:courseId', getCourseById);

// Import students from Excel file
router.post('/:courseId/import-students', upload.single('file'), importStudents);

module.exports = router; 