const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const register = async (req, res) => {
  try {
    const { faculty_id, faculty_name, department, password } = req.body;
    
    // Check if faculty already exists
    const facultyExists = await pool.query(
      'SELECT * FROM faculty WHERE faculty_id = $1',
      [faculty_id]
    );

    if (facultyExists.rows.length > 0) {
      return res.status(400).json({ message: 'Faculty ID already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create faculty
    const result = await pool.query(
      'INSERT INTO faculty (faculty_id, faculty_name, department, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [faculty_id, faculty_name, department, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      faculty: {
        id: result.rows[0].id,
        faculty_id: result.rows[0].faculty_id,
        faculty_name: result.rows[0].faculty_name,
        department: result.rows[0].department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { faculty_id, password } = req.body;

    // Check if faculty exists
    const result = await pool.query(
      'SELECT * FROM faculty WHERE faculty_id = $1',
      [faculty_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const faculty = result.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: faculty.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      faculty: {
        id: faculty.id,
        faculty_id: faculty.faculty_id,
        faculty_name: faculty.faculty_name,
        department: faculty.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register,
  login
}; 