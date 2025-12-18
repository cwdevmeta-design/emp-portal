import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Users, CheckCircle, AlertTriangle, Clock, Calendar, UserCheck, Download } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const Reports = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        presentToday: 0,
        onLeave: 0,
        pendingRequests: 0,
        pendingLeaveRequests: 0
    });
    const [matrixData, setMatrixData] = useState({ matrix: [], daysInMonth: 30 });
    const [loading, setLoading] = useState(true);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // Get user role
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

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchMatrix();
    }, [month, year]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/reports/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMatrix = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/monthly?month=${month}&year=${year}`);
            setMatrixData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const daysArray = Array.from({ length: matrixData?.daysInMonth || 30 }, (_, i) => i + 1);

    const getStatusColor = (status) => {
        switch (status) {
            case 'WFO': return 'bg-green-500 text-white';
            case 'WFH': return 'bg-blue-400 text-white';
            case 'Leave': return 'bg-red-400 text-white';
            default: return 'bg-gray-100';
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return '';
        if (status === 'WFO') return 'O';
        if (status === 'WFH') return 'H';
        if (status === 'Leave') return 'L';
        return '';
    };

    const StatCard = ({ label, value, icon: Icon, color, link }) => {
        const content = (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-dark mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-full ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
        );

        return link ? <Link to={link}>{content}</Link> : content;
    };

    const [tab, setTab] = useState('attendance');
    const [leaveData, setLeaveData] = useState([]);
    const [projectData, setProjectData] = useState([]);
    const [complianceData, setComplianceData] = useState([]);

    useEffect(() => {
        if (tab === 'leaves') fetchLeaveUtilization();
        if (tab === 'compliance') fetchCompliance();
        if (tab === 'projects') fetchProjectPerformance();
    }, [tab, month, year]);

    const fetchLeaveUtilization = async () => {
        try { const res = await api.get('/reports/leave-utilization'); setLeaveData(res.data); } catch (e) { }
    };
    const fetchCompliance = async () => {
        try { const res = await api.get(`/reports/eod-compliance?month=${month}&year=${year}`); setComplianceData(res.data); } catch (e) { }
    };
    const fetchProjectPerformance = async () => {
        try { const res = await api.get('/reports/project-performance'); setProjectData(res.data); } catch (e) { }
    };

    // Export functions
    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                return typeof value === 'string' && value.includes(',')
                    ? `"${value.replace(/"/g, '""')}"`
                    : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportAttendanceMatrix = () => {
        if (!matrixData.matrix || matrixData.matrix.length === 0) {
            alert('No attendance data to export');
            return;
        }

        const exportData = matrixData.matrix.map(item => {
            const row = { Employee: item.user?.name || item.name || 'Unknown' };

            // Backend returns days as an object: { '2025-12-01': 'WFO', ... }
            if (item.days && typeof item.days === 'object') {
                // Convert object to array format for CSV
                for (let i = 1; i <= matrixData.daysInMonth; i++) {
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    row[`Day_${i}`] = item.days[dateStr] || '-';
                }
            }
            return row;
        });
        exportToCSV(exportData, `attendance_matrix_${month}_${year}`);
    };

    const exportLeaveUtilization = () => {
        if (!leaveData || leaveData.length === 0) {
            alert('No leave data to export');
            return;
        }
        const exportData = leaveData.map(item => ({
            Employee: item.user?.name || 'Unknown',
            'Leave Type': item.leave_type,
            Count: item.count,
            'Total Days': item.total_days
        }));
        exportToCSV(exportData, `leave_utilization`);
    };

    const exportEODCompliance = () => {
        if (!complianceData || complianceData.length === 0) {
            alert('No EOD compliance data to export');
            return;
        }
        const exportData = complianceData.map(item => ({
            Employee: item.name || 'Unknown',
            'Expected Days': item.expectedDays,
            'Submitted': item.submitted,
            'Missing': item.missing
        }));
        exportToCSV(exportData, `eod_compliance_${month}_${year}`);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-dark mb-6">Analytics & Reports</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Employees" value={stats.totalUsers} icon={Users} color="bg-purple-100 text-purple-600" />
                <StatCard label="Present Today" value={stats.presentToday} icon={CheckCircle} color="bg-green-100 text-green-600" />
                <StatCard label="On Leave" value={stats.onLeave} icon={AlertTriangle} color="bg-red-100 text-red-600" />
                {userRole === 'Admin' && (
                    <StatCard label="Pending User Approvals" value={stats.pendingRequests} icon={UserCheck} color="bg-blue-100 text-blue-600" link="/admin/users" />
                )}
                {userRole === 'Manager' && (
                    <StatCard label="Pending Leave Requests" value={stats.pendingRequests} icon={Clock} color="bg-yellow-100 text-yellow-600" link="/admin/approvals" />
                )}
            </div>

            {/* Additional stat for leave requests (Admin only) */}
            {userRole === 'Admin' && stats.pendingLeaveRequests !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="col-span-1"></div>
                    <div className="col-span-1"></div>
                    <div className="col-span-1"></div>
                    <StatCard label="Pending Leave Requests" value={stats.pendingLeaveRequests} icon={Clock} color="bg-yellow-100 text-yellow-600" link="/admin/approvals" />
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['attendance', 'leaves', 'compliance', 'projects'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`pb-2 px-1 capitalize font-medium ${tab === t ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t === 'projects' ? 'Project Performance' : t === 'leaves' ? 'Leave Utilization' : t === 'compliance' ? 'EOD Compliance' : 'Attendance Matrix'}
                    </button>
                ))}
            </div>

            {/* Controls */}
            {(tab === 'attendance' || tab === 'compliance') && (
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4">
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border border-gray-300 rounded px-3 py-1 text-sm">
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select value={year} onChange={(e) => setYear(e.target.value)} className="border border-gray-300 rounded px-3 py-1 text-sm">
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <button
                        onClick={tab === 'attendance' ? exportAttendanceMatrix : exportEODCompliance}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            )}

            {tab === 'leaves' && (
                <div className="flex justify-end mb-4">
                    <button
                        onClick={exportLeaveUtilization}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                {loading && tab === 'attendance' && <div className="p-8 text-center">Loading...</div>}

                {tab === 'attendance' && !loading && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-3 text-left font-semibold text-gray-600 border-b w-48 sticky left-0 bg-gray-50">Employee</th>
                                    {daysArray.map(day => <th key={day} className="p-1 border-b text-center text-xs w-8 text-gray-500 font-normal">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {matrixData.matrix.map(row => (
                                    <tr key={row.user.id} className="hover:bg-gray-50">
                                        <td className="p-3 border-r font-medium text-gray-700 sticky left-0 bg-white">{row.user.name}</td>
                                        {daysArray.map(day => {
                                            const k = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                                            return (
                                                <td key={day} className="p-1 border-b text-center">
                                                    <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-[10px] font-bold ${getStatusColor(row.days[k])}`}>
                                                        {getStatusLabel(row.days[k])}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'leaves' && (
                    <div className="p-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Leave Type</th>
                                    <th className="p-3">Times Taken</th>
                                    <th className="p-3">Total Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leaveData.map((l, i) => (
                                    <tr key={i}>
                                        <td className="p-3 font-medium">{l.user?.name}</td>
                                        <td className="p-3">{l.leave_type}</td>
                                        <td className="p-3">{l.count}</td>
                                        <td className="p-3">{l.total_days}</td>
                                    </tr>
                                ))}
                                {leaveData.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-500">No leave data found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'compliance' && (
                    <div className="p-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Employee</th>
                                    <th className="p-3">Submitted</th>
                                    <th className="p-3">Expected (Mon-Fri)</th>
                                    <th className="p-3">Missing Entries</th>
                                    <th className="p-3">Compliance Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {complianceData.map((c, i) => (
                                    <tr key={i}>
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3">{c.submitted}</td>
                                        <td className="p-3">{c.expected}</td>
                                        <td className="p-3 text-red-600 font-bold">{c.missing > 0 ? c.missing : 0}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${c.rate >= 90 ? 'bg-green-500' : c.rate >= 70 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${c.rate}%` }}></div>
                                                </div>
                                                <span className="text-sm">{c.rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'projects' && (
                    <div className="p-6">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                <tr>
                                    <th className="p-3">Project Name</th>
                                    <th className="p-3">Total Hours Logged</th>
                                    <th className="p-3">Contributors</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {projectData.map((p, i) => (
                                    <tr key={i}>
                                        <td className="p-3 font-medium">{p.project_name}</td>
                                        <td className="p-3">{p.total_hours} hrs</td>
                                        <td className="p-3">{p.contributor_count} users</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
