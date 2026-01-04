import { useState, useEffect, useMemo } from 'react';
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

const ManagerAttendance = () => {
    const { user } = useAuth();

    /* ================= EXISTING STATES (UNCHANGED) ================= */
    const [todayAttendance, setTodayAttendance] = useState(null);
    const { canCheckout, formattedRemaining } =
        useCheckoutTimer(todayAttendance);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ date: '', reason: '' });

    /* ================= NEW STATES (TEAM VIEW) ================= */
    const [teamAttendance, setTeamAttendance] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchTodayAttendance();
        fetchAttendanceHistory();
        fetchTeamAttendance();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchTeamAttendance();
        }, 30000); // every 30 seconds

        return () => clearInterval(interval);
    }, []);


    /* ================= FETCH FUNCTIONS ================= */

    // Manager's own today attendance
    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get('/attendance/today');
            setTodayAttendance(response.data.attendance);
        } catch (error) {
            console.error('Failed to fetch today attendance:', error);
        }
    };

    // Manager's own history
    const fetchAttendanceHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/attendance/my-attendance');
            setAttendanceHistory(response.data.attendance || []);
        } catch (error) {
            toast.error('Failed to load attendance history');
        } finally {
            setLoading(false);
        }
    };

    // Team attendance (NEW)
    const fetchTeamAttendance = async () => {
        try {
            const response = await api.get('/attendance/all-employees');
            setTeamAttendance(response.data.attendance || []);
        } catch (error) {
            toast.error('Failed to load team attendance');
        }
    };

    /* ================= ACTIONS (UNCHANGED) ================= */

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            await api.post('/attendance/checkin');
            toast.success('Checked in successfully!');

            // 🔥 REFRESH ALL RELEVANT DATA
            fetchTodayAttendance();
            fetchAttendanceHistory();
            fetchTeamAttendance(); // ✅ ADD THIS
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

            // 🔥 REFRESH ALL RELEVANT DATA
            fetchTodayAttendance();
            fetchAttendanceHistory();
            fetchTeamAttendance(); // ✅ ADD THIS
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to check-out');
        } finally {
            setActionLoading(false);
        }
    };

    /* ================= HELPERS ================= */

    const getStatusConfig = (status) => {
        const configs = {
            Present: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            Late: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
            'Half-Day': { color: 'bg-yellow-100 text-yellow-700', icon: TrendingUp },
            Leave: { color: 'bg-purple-100 text-purple-700', icon: FileText },
            Absent: { color: 'bg-red-100 text-red-700', icon: XCircle },
        };
        return configs[status] || configs.Present;
    };

    const formatTime = (dateString) =>
        dateString
            ? new Date(dateString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            })
            : '-';

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    /* ================= TEAM FILTERING ================= */

    const filteredTeamAttendance = useMemo(() => {
        return teamAttendance.filter((a) => {
            const matchEmployee =
                selectedEmployee === 'all' ||
                a.employee?._id === selectedEmployee;

            const d = new Date(a.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;

            return (
                matchEmployee &&
                (!from || d >= from) &&
                (!to || d <= to)
            );
        });
    }, [teamAttendance, selectedEmployee, dateFrom, dateTo]);

    /* ================= TEAM TODAY STATS ================= */

    const today = new Date().toDateString();
    const teamTodayStats = useMemo(() => {
        const todayRecords = teamAttendance.filter(
            (a) => new Date(a.date).toDateString() === today
        );

        return {
            // Half-Day counts as Present
            present: todayRecords.filter((a) =>
                a.status === 'Present' || a.status === 'Half-Day'
            ).length,

            late: todayRecords.filter((a) => a.status === 'Late').length,

            absent: todayRecords.filter((a) => a.status === 'Absent').length,
        };
    }, [teamAttendance]);


    /* ================= MANAGER PERSONAL STATS ================= */

    const stats = {
        present: attendanceHistory.filter((a) => a.status === 'Present').length,
        late: attendanceHistory.filter((a) => a.status === 'Late').length,
        leaves: attendanceHistory.filter((a) => a.status === 'Leave').length,
        totalDays: attendanceHistory.length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* ================= MANAGER SELF ATTENDANCE (UNCHANGED UI) ================= */}
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Attendance
                    </h1>
                    <p className="text-gray-600">
                        Track your daily attendance and work hours
                    </p>
                </div>

                {/* TODAY CARD */}
                <div className="card p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Today's Attendance
                    </h2>

                    {!todayAttendance ? (
                        <div className="text-center py-8">
                            <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <p className="text-lg text-gray-700 mb-6">
                                You haven't checked in today
                            </p>
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
                                    <div
                                        className={`badge ${getStatusConfig(todayAttendance.status).color} flex items-center gap-2 text-base px-4 py-2`}
                                    >
                                        {React.createElement(
                                            getStatusConfig(todayAttendance.status).icon,
                                            { className: 'w-5 h-5' }
                                        )}
                                        <span>{todayAttendance.status}</span>
                                    </div>
                                    <span className="text-gray-600">
                                        {formatDate(todayAttendance.date)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">Check-In</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {formatTime(todayAttendance.checkIn)}
                                    </p>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">Check-Out</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {todayAttendance.checkOut
                                            ? formatTime(todayAttendance.checkOut)
                                            : 'Not yet'}
                                    </p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">Work Hours</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {todayAttendance.workHours > 0
                                            ? `${todayAttendance.workHours} hrs`
                                            : 'In progress'}
                                    </p>
                                </div>
                            </div>

                            {!todayAttendance.checkOut && (
                                <div className="space-y-3">
                                    {!canCheckout && (
                                        <p className="text-center text-sm text-gray-600">
                                            Checkout unlocks in{" "}
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

                        </div>
                    )}
                </div>


                {/* ================= TEAM ATTENDANCE SECTION (NEW) ================= */}

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Team Attendance
                    </h2>
                </div>

                {/* TEAM STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="card p-6">
                        <p className="text-sm text-gray-600">Present Today</p>
                        <p className="text-3xl font-bold text-green-600">
                            {teamTodayStats.present}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-sm text-gray-600">Late Today</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {teamTodayStats.late}
                        </p>
                    </div>
                    <div className="card p-6">
                        <p className="text-sm text-gray-600">Absent Today</p>
                        <p className="text-3xl font-bold text-red-600">
                            {teamTodayStats.absent}
                        </p>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="card p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        className="input-field"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="all">All Employees</option>
                        {[...new Map(teamAttendance.map(a => [a.employee?._id, a.employee])).values()]
                            .filter(Boolean)
                            .map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.name}
                                </option>
                            ))}
                    </select>

                    <input
                        type="date"
                        className="input-field"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />

                    <input
                        type="date"
                        className="input-field"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />

                    <button
                        className="btn-secondary"
                        onClick={() => {
                            setSelectedEmployee('all');
                            setDateFrom('');
                            setDateTo('');
                        }}
                    >
                        Reset
                    </button>
                </div>

                {/* TEAM TABLE */}
                <div className="card p-6 overflow-x-auto">
                    {filteredTeamAttendance.length ? (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-gray-600 text-left">
                                    <th className="py-3">Employee</th>
                                    <th>Date</th>
                                    <th>In</th>
                                    <th>Out</th>
                                    <th>Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeamAttendance.map((a) => (
                                    <tr key={a._id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 font-medium">
                                            {a.employee.username}
                                        </td>
                                        <td>{formatDate(a.date)}</td>
                                        <td>{formatTime(a.checkIn)}</td>
                                        <td>{formatTime(a.checkOut)}</td>
                                        <td>{a.workHours || '-'}</td>
                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusConfig(a.status).color}`}
                                            >
                                                {a.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-12">
                            No records found
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ManagerAttendance;
