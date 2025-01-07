const validateFacultyData = (data) => {
    const errors = {};
    
    if (!data.faculty_id || data.faculty_id.trim().length < 3) {
        errors.faculty_id = 'Faculty ID must be at least 3 characters';
    }
    
    if (!data.faculty_name || data.faculty_name.trim().length < 2) {
        errors.faculty_name = 'Faculty name must be at least 2 characters';
    }
    
    if (!data.password || data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    
    if (!data.department) {
        errors.department = 'Department is required';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

const validateAttendanceData = (data) => {
    const errors = {};
    
    if (!data.course_id) {
        errors.course_id = 'Course ID is required';
    }
    
    if (!data.date) {
        errors.date = 'Date is required';
    }
    
    if (!data.student_id) {
        errors.student_id = 'Student ID is required';
    }
    
    if (!['present', 'absent'].includes(data.status)) {
        errors.status = 'Status must be present or absent';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

module.exports = {
    validateFacultyData,
    validateAttendanceData
};