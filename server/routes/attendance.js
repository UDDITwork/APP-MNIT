const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  takeAttendanceWithPhotos,
  takeAttendanceWithSheet,
  takeAttendanceManually,
  viewAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// All routes are protected
router.use(auth);

// Take attendance with class photos (Option 1)
router.post(
  '/:courseId/photos',
  upload.array('images', 5),
  takeAttendanceWithPhotos
);

// Take attendance with sheet photo (Option 2)
router.post(
  '/:courseId/sheet',
  upload.single('sheet'),
  takeAttendanceWithSheet
);

// Take attendance manually (Option 3)
router.post('/:courseId/manual', takeAttendanceManually);

// View attendance for a course
router.get('/:courseId', viewAttendance);

// Get attendance statistics
router.get('/:courseId/stats', getAttendanceStats);

module.exports = router; 