// src/components/TakeAttendance.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function TakeAttendance() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courseDetails, setCourseDetails] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [classPhotos, setClassPhotos] = useState([]);
  const [sheetPhoto, setSheetPhoto] = useState(null);
  const [manualAttendance, setManualAttendance] = useState([]);
  const [students, setStudents] = useState([]);

  // Fetch course details and students
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const courseData = await courseRes.json();
        setCourseDetails(courseData);

        // Fetch students for this course
        const studentsRes = await fetch(`/api/courses/${courseId}/students`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
        setManualAttendance(studentsData.map(student => ({
          student_id: student.student_id,
          student_name: student.student_name,
          present: false
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load course data');
      }
    };

    fetchData();
  }, [courseId]);

  const handleClassPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    setClassPhotos(files);
  };

  const handleSheetPhotoUpload = (e) => {
    if (e.target.files[0]) {
      setSheetPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      const formData = new FormData();
      formData.append('date', selectedDate);

      if (selectedOption === 'photos') {
        endpoint = `/api/attendance/${courseId}/photos`;
        classPhotos.forEach(photo => {
          formData.append('images', photo);
        });
      } else if (selectedOption === 'sheet') {
        endpoint = `/api/attendance/${courseId}/sheet`;
        formData.append('sheet', sheetPhoto);
      } else if (selectedOption === 'manual') {
        endpoint = `/api/attendance/${courseId}/manual`;
        formData.append('attendance', JSON.stringify(manualAttendance));
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Attendance recorded successfully');
        setTimeout(() => {
          navigate(`/dashboard/view-attendance/${courseId}`);
        }, 2000);
      } else {
        setError(data.message || 'Failed to record attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError('Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  if (!courseDetails) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Take Attendance - {courseDetails.course_name}</h2>
      
      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
        />
      </div>

      {/* Attendance Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Option 1: Class Photos */}
        <div 
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'photos' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => setSelectedOption('photos')}
        >
          <h3 className="font-semibold mb-2">Take 5 Class Photos</h3>
          {selectedOption === 'photos' && (
            <div className="mt-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleClassPhotoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="text-xs text-gray-500 mt-2">Maximum 5 photos allowed</p>
            </div>
          )}
        </div>

        {/* Option 2: Attendance Sheet Photo */}
        <div 
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'sheet' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => setSelectedOption('sheet')}
        >
          <h3 className="font-semibold mb-2">Upload Attendance Sheet</h3>
          {selectedOption === 'sheet' && (
            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleSheetPhotoUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          )}
        </div>

        {/* Option 3: Manual Attendance */}
        <div 
          className={`p-6 border rounded-lg cursor-pointer transition-all ${
            selectedOption === 'manual' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
          }`}
          onClick={() => setSelectedOption('manual')}
        >
          <h3 className="font-semibold mb-2">Mark Manual Attendance</h3>
        </div>
      </div>

      {/* Manual Attendance List */}
      {selectedOption === 'manual' && (
        <div className="mt-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {manualAttendance.map((student, index) => (
                <li key={student.student_id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.student_name}</p>
                      <p className="text-sm text-gray-500">{student.student_id}</p>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newAttendance = [...manualAttendance];
                          newAttendance[index].present = true;
                          setManualAttendance(newAttendance);
                        }}
                        className={`mr-2 px-3 py-1 rounded ${
                          student.present
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newAttendance = [...manualAttendance];
                          newAttendance[index].present = false;
                          setManualAttendance(newAttendance);
                        }}
                        className={`px-3 py-1 rounded ${
                          !student.present
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-red-600 hover:text-white'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Submit Button */}
      {selectedOption && (
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Recording Attendance...' : 'Submit Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TakeAttendance;
