import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CourseList from './CourseList';
import TakeAttendance from './TakeAttendance';
import ViewAttendance from './ViewAttendance';

function Dashboard() {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch courses
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/faculty/courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Faculty Portal</h1>
              </div>
            </div>
            <div className="ml-6 flex items-center">
              <span className="text-gray-700 mr-4">{user?.faculty_name}</span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<CourseList courses={courses} />} />
          <Route path="/take-attendance/:courseId" element={<TakeAttendance />} />
          <Route path="/view-attendance/:courseId" element={<ViewAttendance />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
