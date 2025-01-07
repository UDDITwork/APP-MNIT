import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AddCourse from './AddCourse';

function CourseList({ courses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coursesList, setCoursesList] = useState(courses);

  const handleCourseAdded = (newCourse) => {
    setCoursesList([newCourse, ...coursesList]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesList.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {course.course_name}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Code: {course.course_code}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Batch: {course.batch}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Semester: {course.semester}
            </p>
            <div className="flex space-x-4">
              <Link
                to={`/dashboard/take-attendance/${course.id}`}
                className="flex-1 text-center bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
              >
                Take Attendance
              </Link>
              <Link
                to={`/dashboard/view-attendance/${course.id}`}
                className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
              >
                View Attendance
              </Link>
            </div>
          </div>
        ))}
      </div>

      {coursesList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No courses added yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Add your first course
          </button>
        </div>
      )}

      <AddCourse
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseAdded={handleCourseAdded}
      />
    </div>
  );
}

export default CourseList;