// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create separate folders for different types of uploads
    let folder = 'uploads/';
    
    if (file.fieldname === 'images') {
      folder += 'attendance-photos/';
    } else if (file.fieldname === 'sheet') {
      folder += 'attendance-sheets/';
    } else if (file.fieldname === 'file') {
      folder += 'excel/';
    }

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images' || file.fieldname === 'sheet') {
    // Allow only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload only image files.'), false);
    }
  } else if (file.fieldname === 'file') {
    // Allow only Excel files
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/csv',
      'text/csv'
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Please upload only Excel/CSV files.'), false);
    }
  }
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 5 // Maximum 5 files at once
  }
});

module.exports = upload;  // Direct export of multer instance