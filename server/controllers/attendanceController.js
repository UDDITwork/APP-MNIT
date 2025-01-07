const pool = require('../config/db');
const { processAttendanceImage } = require('../utils/imageProcessor');

// Take attendance using class photos
const takeAttendanceWithPhotos = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.body;
    const images = req.files; // Array of uploaded images

    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // Process images and get student attendance data
    const attendanceData = await processAttendanceImage(images);

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert attendance records
      for (const record of attendanceData) {
        await client.query(
          'INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (course_id, student_id, date) DO UPDATE SET status = EXCLUDED.status',
          [courseId, record.student_id, date, record.present]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Take attendance using attendance sheet photo
const takeAttendanceWithSheet = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.body;
    const sheetImage = req.file;

    if (!sheetImage) {
      return res.status(400).json({ message: 'No attendance sheet image provided' });
    }

    // Process attendance sheet image
    const attendanceData = await processAttendanceImage(sheetImage);

    // Record attendance in database
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const record of attendanceData) {
        await client.query(
          'INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (course_id, student_id, date) DO UPDATE SET status = EXCLUDED.status',
          [courseId, record.student_id, date, record.present]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Take attendance manually
const takeAttendanceManually = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, attendance } = req.body; // attendance: [{student_id, present}]

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const record of attendance) {
        await client.query(
          'INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT (course_id, student_id, date) DO UPDATE SET status = EXCLUDED.status',
          [courseId, record.student_id, date, record.present]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Attendance recorded successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View attendance for a course
const viewAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { startDate, endDate } = req.query;

    const attendance = await pool.query(
      `SELECT a.date, a.status, s.student_id, s.student_name 
       FROM attendance a 
       JOIN students s ON a.student_id = s.id 
       WHERE a.course_id = $1 
       AND a.date BETWEEN $2 AND $3 
       ORDER BY a.date DESC, s.student_name`,
      [courseId, startDate, endDate]
    );

    res.json(attendance.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const stats = await pool.query(
      `SELECT 
        s.student_id,
        s.student_name,
        COUNT(CASE WHEN a.status = true THEN 1 END) as present_count,
        COUNT(a.id) as total_classes,
        ROUND(COUNT(CASE WHEN a.status = true THEN 1 END)::numeric / COUNT(a.id) * 100, 2) as attendance_percentage
       FROM students s
       JOIN course_students cs ON s.id = cs.student_id
       LEFT JOIN attendance a ON s.id = a.student_id AND a.course_id = cs.course_id
       WHERE cs.course_id = $1
       GROUP BY s.student_id, s.student_name
       ORDER BY s.student_name`,
      [courseId]
    );

    res.json(stats.rows);
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  takeAttendanceWithPhotos,
  takeAttendanceWithSheet,
  takeAttendanceManually,
  viewAttendance,
  getAttendanceStats
}; 