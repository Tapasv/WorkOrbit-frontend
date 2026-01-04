import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import {
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

const AdminAttendance = () => {
    /* ================= STATE ================= */
    const [managersAttendance, setManagersAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedManager, setSelectedManager] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        fetchManagersAttendance();
    }, []);

    /* ================= FETCH ================= */

    const fetchManagersAttendance = async () => {
        try {
            setLoading(true);
            const response = await api.get('/attendance/all-managers');
            setManagersAttendance(response.data.attendance || []);
        } catch (error) {
            toast.error('Failed to load managers attendance');
        } finally {
            setLoading(false);
        }
    };

    /* ================= HELPERS ================= */

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

    const getStatusColor = (status) => {
        const map = {
            Present: 'bg-green-100 text-green-700',
            Late: 'bg-orange-100 text-orange-700',
            Leave: 'bg-purple-100 text-purple-700',
            Absent: 'bg-red-100 text-red-700',
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    /* ================= FILTERING ================= */

    const filteredAttendance = useMemo(() => {
        return managersAttendance.filter((a) => {
            const matchManager =
                selectedManager === 'all' ||
                a.employee?._id === selectedManager;

            const d = new Date(a.date);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;

            return (
                matchManager &&
                (!from || d >= from) &&
                (!to || d <= to)
            );
        });
    }, [managersAttendance, selectedManager, dateFrom, dateTo]);

    /* ================= TODAY STATS ================= */

    const today = new Date().toDateString();
    const todayStats = useMemo(() => {
        const todayRecords = managersAttendance.filter(
            (a) => new Date(a.date).toDateString() === today
        );

        return {
            present: todayRecords.filter((a) =>
                a.status === 'Present' || a.status === 'Half-Day'
            ).length,
            late: todayRecords.filter((a) => a.status === 'Late').length,
            absent: todayRecords.filter((a) => a.status === 'Absent').length,
        };
    }, [managersAttendance]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* HEADER */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Managers Attendance
                    </h1>
                    <p className="text-gray-600">
                        Monitor attendance of all managers
                    </p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Present Today</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {todayStats.present}
                                </p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Late Today</p>
                                <p className="text-3xl font-bold text-orange-600">
                                    {todayStats.late}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-orange-600" />
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Absent Today</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {todayStats.absent}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="card p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        className="input-field"
                        value={selectedManager}
                        onChange={(e) => setSelectedManager(e.target.value)}
                    >
                        <option value="all">All Managers</option>
                        {[...new Map(managersAttendance.map(a => [a.employee?._id, a.employee])).values()]
                            .filter(Boolean)
                            .map(manager => (
                                <option key={manager._id} value={manager._id}>
                                    {manager.name}
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
                            setSelectedManager('all');
                            setDateFrom('');
                            setDateTo('');
                        }}
                    >
                        Reset
                    </button>
                </div>

                {/* TABLE */}
                <div className="card p-6 overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : filteredAttendance.length ? (
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-gray-600">
                                    <th className="py-3">Manager</th>
                                    <th>Date</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Work Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendance.map((a) => (
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
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}
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
                            No attendance records found
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminAttendance;
