import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download } from 'lucide-react';
import CalendarWidget from '../components/CalendarWidget';
import { jwtDecode } from 'jwt-decode';

const AttendanceAdmin = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterRole, setFilterRole] = useState('');
    const [filterDept, setFilterDept] = useState('');

    // Get user role from token
    let userRole = '';
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            userRole = decoded.user?.role || decoded.role;
        }
    } catch (e) {
        console.error('Token decode error:', e);
    }

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ date });
            if (filterRole) params.append('role', filterRole);
            if (filterDept) params.append('department', filterDept);

            const res = await api.get(`/attendance/dashboard?${params.toString()}`);
            setData(res.data);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date, filterRole, filterDept]);

    const exportCSV = async () => {
        try {
            const response = await api.get('/attendance/export', {
                params: { startDate: date, endDate: date },
                responseType: 'blob', // Important
            });

            // Create Blob URL
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to download CSV");
        }
    };

    // Stats
    const stats = {
        wfo: data.filter(d => d.attendance === 'WFO').length,
        wfh: data.filter(d => d.attendance === 'WFH').length,
        leave: data.filter(d => d.attendance === 'Leave').length,
        absent: data.filter(d => d.attendance === 'Not Marked').length
    };

    // Prepare highlights for calendar (optional future enhancement: fetch monthly stats)
    const calendarHighlights = {};
    // Example: const calendarHighlights = { [date]: 'bg-primary text-white' }; 
    // For now, we rely on selection state in widget.

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar: Calendar & Filters */}
                <div className="w-full md:w-80 flex-shrink-0 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-dark mb-4">Select Date</h2>
                        <CalendarWidget
                            selectedDate={date}
                            onDateChange={setDate}
                        />
                    </div>

                    {/* Filters - Only show for Admin */}
                    {userRole === 'Admin' && (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase">Filters</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                                    <select
                                        value={filterRole}
                                        onChange={(e) => setFilterRole(e.target.value)}
                                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Employee">Employee</option>
                                        <option value="Intern">Intern</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                                    <select
                                        value={filterDept}
                                        onChange={(e) => setFilterDept(e.target.value)}
                                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                                    >
                                        <option value="">All Departments</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Designer">Designer</option>
                                        <option value="Marketer">Marketer</option>
                                        <option value="PM">PM</option>
                                        <option value="HR">HR</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content: Stats & List */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-dark">
                            Attendance for {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h1>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm font-medium shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-lg border-l-4 border-attendance-wfo shadow-sm">
                            <div className="text-xs font-bold uppercase text-gray-400">WFO</div>
                            <div className="text-2xl font-bold text-dark">{stats.wfo}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-attendance-wfh shadow-sm">
                            <div className="text-xs font-bold uppercase text-gray-400">WFH</div>
                            <div className="text-2xl font-bold text-dark">{stats.wfh}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-attendance-leave shadow-sm">
                            <div className="text-xs font-bold uppercase text-gray-400">On Leave</div>
                            <div className="text-2xl font-bold text-dark">{stats.leave}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border-l-4 border-gray-300 shadow-sm">
                            <div className="text-xs font-bold uppercase text-gray-400">Not Marked</div>
                            <div className="text-2xl font-bold text-dark">{stats.absent}</div>
                        </div>
                    </div>

                    {/* Grid View */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : data.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No records found for this date.</td></tr>
                                    ) : (
                                        data.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-sm text-dark">{user.name}</div>
                                                            <div className="text-xs text-gray-500">{user.designation || user.role}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${user.attendance === 'WFO' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            user.attendance === 'WFH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                user.attendance === 'Leave' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'}
                                            `}>
                                                        {user.attendance}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                                                    {user.check_in_time ? new Date(user.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">{user.department || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAdmin;
