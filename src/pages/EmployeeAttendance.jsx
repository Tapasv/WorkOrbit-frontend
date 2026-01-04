import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  FileText,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import useCheckoutTimer from '../hooks/useCheckoutTimer';


const EmployeeAttendance = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const { canCheckout, formattedRemaining } =
    useCheckoutTimer(todayAttendance);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: '' });

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceHistory();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/my-attendance');
      setAttendanceHistory(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await api.post('/attendance/checkin');
      toast.success('Checked in successfully!');
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await api.post('/attendance/checkout');
      toast.success('Checked out successfully!');
      fetchTodayAttendance();
      fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check-out');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/leave', leaveForm);
      toast.success('Leave marked successfully!');
      setShowLeaveModal(false);
      setLeaveForm({ date: '', reason: '' });
      fetchAttendanceHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark leave');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Present: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Present' },
      Late: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle, label: 'Late' },
      'Half-Day': { color: 'bg-yellow-100 text-yellow-700', icon: TrendingUp, label: 'Half-Day' },
      Leave: { color: 'bg-purple-100 text-purple-700', icon: FileText, label: 'Leave' },
      Absent: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Absent' },
    };
    return configs[status] || configs.Present;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    present: attendanceHistory.filter((a) => a.status === 'Present').length,
    late: attendanceHistory.filter((a) => a.status === 'Late').length,
    leaves: attendanceHistory.filter((a) => a.status === 'Leave').length,
    totalDays: attendanceHistory.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Attendance</h1>
          <p className="text-gray-600">Track your daily attendance and work hours</p>
        </div>

        {/* Today's Attendance Card */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Attendance</h2>

          {!todayAttendance ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-700 mb-6">You haven't checked in today</p>
              <button
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <LogIn className="w-5 h-5" />
                {actionLoading ? 'Checking In...' : 'Check In Now'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`badge ${getStatusConfig(todayAttendance.status).color} flex items-center gap-2 text-base px-4 py-2`}>
                    {React.createElement(getStatusConfig(todayAttendance.status).icon, { className: 'w-5 h-5' })}
                    <span>{getStatusConfig(todayAttendance.status).label}</span>
                  </div>
                  <span className="text-gray-600">
                    {formatDate(todayAttendance.date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <LogIn className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Check-In Time</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatTime(todayAttendance.checkIn)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <LogOut className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Check-Out Time</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {todayAttendance.checkOut ? formatTime(todayAttendance.checkOut) : 'Not yet'}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Work Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {todayAttendance.workHours > 0 ? `${todayAttendance.workHours} hrs` : 'In progress'}
                  </p>
                </div>
              </div>

              {!todayAttendance.checkOut && (
                <div className="space-y-3">
                  {!canCheckout && (
                    <p className="text-center text-sm text-gray-600">
                      You can check out after{" "}
                      <span className="font-semibold text-gray-800">
                        {formattedRemaining}
                      </span>
                    </p>
                  )}

                  <button
                    onClick={handleCheckOut}
                    disabled={!canCheckout || actionLoading}
                    className={`w-full flex items-center justify-center gap-2
                     ${canCheckout ? "btn-primary" : "btn-disabled"}
                    `}
                  >
                    <LogOut className="w-5 h-5" />
                    {actionLoading ? "Checking Out..." : "Check Out"}
                  </button>
                </div>
              )}


              {todayAttendance.checkOut && (
                <div className="text-center py-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">
                    You have completed your attendance for today!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDays}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.late}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leaves</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.leaves}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mark Leave Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="btn-secondary"
          >
            Mark Leave
          </button>
        </div>

        {/* Attendance History */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Attendance History</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : attendanceHistory.length > 0 ? (
            <div className="space-y-3">
              {attendanceHistory.map((attendance) => {
                const statusConfig = getStatusConfig(attendance.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={attendance._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`badge ${statusConfig.color} flex items-center gap-2`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusConfig.label}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatDate(attendance.date)}</p>
                        {attendance.status === 'Leave' && attendance.leaveReason && (
                          <p className="text-sm text-gray-600">Reason: {attendance.leaveReason}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {attendance.checkIn && `In: ${formatTime(attendance.checkIn)}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {attendance.checkOut && `Out: ${formatTime(attendance.checkOut)}`}
                      </p>
                      {attendance.workHours > 0 && (
                        <p className="text-sm font-medium text-gray-900">
                          {attendance.workHours} hrs
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Mark Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Leave</h2>

            <form onSubmit={handleMarkLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={leaveForm.date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Enter leave reason..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Mark Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;