import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Check, X, AlertCircle } from 'lucide-react';

const LeaveApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leaves/pending');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const remarks = prompt(`Enter remarks for ${status} (Optional):`);
        if (remarks === null) return; // Cancelled

        try {
            await api.put(`/leaves/${id}/action`, { status, manager_remarks: remarks });
            setRequests(requests.filter(r => r.id !== id)); // Remove from list
            alert(`Request ${status} successfully.`);
        } catch (err) {
            alert('Failed: ' + err.message);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-dark mb-6">Pending Leave Approvals</h1>

            {loading ? (
                <div>Loading...</div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-100 text-gray-500">
                    <Check className="w-12 h-12 mb-4 text-green-400" />
                    <p>No pending requests from your team!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                                    {req.user.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-dark">{req.user.name}</div>
                                    <div className="text-xs text-gray-500">{req.user.designation}</div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <span className="text-sm font-semibold">{req.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Dates</span>
                                    <span className="text-sm font-semibold text-right">
                                        {new Date(req.start_date).toLocaleDateString()} <br />
                                        to {new Date(req.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-xs text-gray-500 block mb-1">Reason</span>
                                    <p className="text-sm bg-gray-50 p-2 rounded">{req.reason}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleAction(req.id, 'Approved')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium text-sm"
                                >
                                    <Check className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'Rejected')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm"
                                >
                                    <X className="w-4 h-4" /> Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeaveApprovals;
