import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download } from 'lucide-react';

const EODAdmin = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);

    // Default to today
    const today = new Date().toISOString().split('T')[0];
    const [filters, setFilters] = useState({
        startDate: today,
        endDate: today,
        project: '',
        employee: ''
    });

    // Fetch filters options (Employees)
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/users?role=Employee'); // Fetch only employees
                setEmployees(res.data);
            } catch (err) { console.error(err); }
        };
        fetchEmployees();
    }, []);

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.project) params.append('project', filters.project);
            if (filters.employee) params.append('user_id', filters.employee);

            const res = await api.get(`/eod/team?${params.toString()}`);
            setUpdates(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUpdates();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [filters]);

    // Group updates by User
    const groupedUpdates = updates.reduce((acc, curr) => {
        const userId = curr.user_id;
        if (!acc[userId]) {
            acc[userId] = {
                user: curr.user,
                tasks: [],
                totalHours: 0
            };
        }
        acc[userId].tasks.push(curr);
        acc[userId].totalHours += parseFloat(curr.hours_spent);
        return acc;
    }, {});

    const exportCSV = async () => {
        try {
            const response = await api.get('/eod/export', {
                params: {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    project: filters.project,
                    user_id: filters.employee
                },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `eod_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to download CSV");
        }
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-dark">EOD Reports</h1>
                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={filters.employee}
                        onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
                        className="border border-gray-200 rounded px-3 py-2 text-sm w-40"
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Search Project..."
                        value={filters.project}
                        onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                        className="border border-gray-200 rounded px-3 py-2 text-sm w-40"
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="border border-gray-200 rounded px-3 py-2 text-sm"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="border border-gray-200 rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {Object.values(groupedUpdates).length === 0 && <div className="text-gray-500 text-center py-8">No reports found for this date.</div>}

                {Object.values(groupedUpdates).map((group) => (
                    <div key={group.user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
                                    {group.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-dark text-sm">{group.user.name}</div>
                                    <div className="text-xs text-gray-500">{group.user.designation}</div>
                                </div>
                            </div>
                            <div className="font-bold text-dark-grey text-sm">Total: {group.totalHours.toFixed(1)} hrs</div>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-white text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left font-medium py-2 px-4 w-1/4">Project</th>
                                        <th className="text-left font-medium py-2 px-4 w-1/2">Task</th>
                                        <th className="text-left font-medium py-2 px-4">Status</th>
                                        <th className="text-right font-medium py-2 px-4">Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.tasks.map(task => (
                                        <tr key={task.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                            <td className="py-2 px-4 text-gray-700 font-medium">{task.project_name}</td>
                                            <td className="py-2 px-4 text-gray-600">{task.task_description}</td>
                                            <td className="py-2 px-4">
                                                <span className={`px-2 py-0.5 rounded text-xs ${task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>{task.status}</span>
                                            </td>
                                            <td className="py-2 px-4 text-right text-gray-600">{task.hours_spent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EODAdmin;
