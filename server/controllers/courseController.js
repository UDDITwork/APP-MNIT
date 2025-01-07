const pool = require('../config/db');

// Get all courses for a faculty
const getFacultyCourses = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const courses = await pool.query(
      'SELECT * FROM courses WHERE faculty_id = $1 ORDER BY created_at DESC',
      [facultyId]
    );
    res.json(courses.rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new course
const addCourse = async (req, res) => {
  try {
    const { course_code, course_name, department, batch, semester } = req.body;
    const facultyId = req.user.id;

    // Check if course already exists
    const courseExists = await pool.query(
      'SELECT * FROM courses WHERE course_code = $1',
      [course_code]
    );

    if (courseExists.rows.length > 0) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const result = await pool.query(
      'INSERT INTO courses (course_code, course_name, department, batch, semester, faculty_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [course_code, course_name, department, batch, semester, facultyId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get course details by ID
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const facultyId = req.user.id;

    const course = await pool.query(
      'SELECT * FROM courses WHERE id = $1 AND faculty_id = $2',
      [courseId, facultyId]
    );

    if (course.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course.rows[0]);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Import students for a course from Excel
const importStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { students } = req.body; // Array of {student_id, student_name}

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const student of students) {
        // Check if student exists, if not create
        const studentResult = await client.query(
          'INSERT INTO students (student_id, student_name, batch, department) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id) DO UPDATE SET student_name = EXCLUDED.student_name RETURNING id',
          [student.student_id, student.student_name, student.batch, student.department]
        );

        // Link student to course
        await client.query(
          'INSERT INTO course_students (course_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [courseId, studentResult.rows[0].id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Students imported successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFacultyCourses,
  addCourse,
  getCourseById,
  importStudents
}; 