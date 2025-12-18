import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, AlertCircle, Filter } from 'lucide-react';

const LeaveApplication = () => {
    const [formData, setFormData] = useState({
        type: 'Sick Leave',
        start_date: '',
        end_date: '',
        reason: ''
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchHistory();
    }, [filterMonth, filterYear]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/leaves/my?month=${filterMonth}&year=${filterYear}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/leaves/apply', formData);
            alert('Leave Request Submitted!');
            setFormData({ type: 'Sick Leave', start_date: '', end_date: '', reason: '' });
            fetchHistory();
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-dark mb-8">Leave & Permission Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Application Form */}
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" /> Apply for Leave
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                                <option>Sick Leave</option>
                                <option>Casual Leave</option>
                                <option>Half-day Leave</option>
                                <option>WFH</option>
                                <option>Permission</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    min={formData.start_date || new Date().toISOString().split('T')[0]} // Ensure end date is not before start date
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded text-sm h-24"
                                placeholder="Details..."
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-secondary" /> My History
                        </h2>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                                <option value="1">January</option>
                                <option value="2">February</option>
                                <option value="3">March</option>
                                <option value="4">April</option>
                                <option value="5">May</option>
                                <option value="6">June</option>
                                <option value="7">July</option>
                                <option value="8">August</option>
                                <option value="9">September</option>
                                <option value="10">October</option>
                                <option value="11">November</option>
                                <option value="12">December</option>
                            </select>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                                {[...Array(5)].map((_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                        </div>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-gray-500 italic">No leave history found.</div>
                    ) : (
                        <div className="space-y-3">
                            {history.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-dark">{req.type}</span>
                                            <span className="text-xs text-gray-500">
                                                ({new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()})
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{req.reason}</p>
                                        {req.manager_remarks && (
                                            <p className="text-xs text-red-500 mt-1">Manager: {req.manager_remarks}</p>
                                        )}
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                            req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LeaveApplication;
