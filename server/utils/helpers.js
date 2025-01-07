const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const generateRandomId = (prefix) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateAttendancePercentage = (present, total) => {
    return ((present / total) * 100).toFixed(2);
};

const validateFileType = (filename) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.xlsx', '.xls'];
    const ext = filename.toLowerCase().slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    return allowedTypes.includes(`.${ext}`);
};

module.exports = {
    formatDate,
    generateRandomId,
    calculateAttendancePercentage,
    validateFileType
};