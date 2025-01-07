const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const processExcelFile = async (file) => {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Validate data structure
    const validatedData = validateStudentData(data);

    return validatedData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file');
  } finally {
    // Clean up: Delete the uploaded file
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }
  }
};

const validateStudentData = (data) => {
  // Validate each row has required fields
  const validatedData = data.map((row, index) => {
    // Check required fields
    if (!row.student_id || !row.student_name) {
      throw new Error(`Row ${index + 1}: Missing required fields (student_id or student_name)`);
    }

    // Clean and format data
    return {
      student_id: row.student_id.toString().trim(),
      student_name: row.student_name.toString().trim(),
      batch: row.batch ? row.batch.toString().trim() : null,
      department: row.department ? row.department.toString().trim() : null
    };
  });

  return validatedData;
};

// Function to generate Excel template
const generateExcelTemplate = () => {
  // Create workbook and worksheet
  const workbook = xlsx.utils.book_new();
  const wsData = [
    ['student_id', 'student_name', 'batch', 'department'],
    ['1234', 'John Doe', '2021-2025', 'Computer Science'], // Example row
  ];
  
  const worksheet = xlsx.utils.aoa_to_sheet(wsData);
  
  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  // Generate buffer
  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  
  return buffer;
};

module.exports = {
  processExcelFile,
  generateExcelTemplate
};