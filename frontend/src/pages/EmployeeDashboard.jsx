import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, MapPin, Home, Coffee } from 'lucide-react';

import EODForm from '../components/EODForm';

const EmployeeDashboard = () => {
    const [todayStatus, setTodayStatus] = useState(null); // 'WFO', 'WFH', 'Leave', or null
    const [checkInTime, setCheckInTime] = useState(null); // Store check-in time
    const [loading, setLoading] = useState(true);
    const [cutoffPassed, setCutoffPassed] = useState(false);

    useEffect(() => {
        fetchTodaysAttendance();
        checkCutoff();
    }, []);

    const checkCutoff = () => {
        const now = new Date();
        if (now.getHours() >= 11) {
            setCutoffPassed(true);
        }
    };

    const fetchTodaysAttendance = async () => {
        try {
            const res = await api.get('/attendance/my');
            // Find today's record (Backend returns list, we sort DESC)
            const todayStr = new Date().toISOString().split('T')[0];
            const todayRecord = res.data.find(r => r.date === todayStr);

            if (todayRecord) {
                setTodayStatus(todayRecord.status);
                setCheckInTime(todayRecord.check_in_time);
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async (status) => {
        try {
            await api.post('/attendance', { status });
            setTodayStatus(status);
            alert(`Successfully marked as ${status}`);
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const StatusButton = ({ status, icon: Icon, label, colorClass, activeClass }) => {
        const isActive = todayStatus === status;
        return (
            <button
                onClick={() => markAttendance(status)}
                disabled={cutoffPassed}
                className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all w-full
                ${isActive ? activeClass : 'border-gray-100 bg-white hover:border-gray-200'}
                ${cutoffPassed ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            >
                <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-white' : colorClass}`} />
                <span className={`font-semibold ${isActive ? 'text-white' : 'text-dark-grey'}`}>{label}</span>
            </button>
        )
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark mb-2">Good Morning!</h1>
                <p className="text-dark-grey">Mark your attendance for today ({new Date().toLocaleDateString()})</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="text-primary w-5 h-5" />
                            Today's Status
                        </h2>
                        {checkInTime && (
                            <p className="text-sm text-gray-500 mt-1 ml-7">
                                Checked in at {new Date(checkInTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </p>
                        )}
                    </div>
                    {cutoffPassed && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Marking Closed (11 AM)</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusButton
                        status="WFO"
                        label="Work From Office"
                        icon={MapPin}
                        colorClass="text-attendance-wfo"
                        activeClass="bg-attendance-wfo border-attendance-wfo"
                    />
                    <StatusButton
                        status="WFH"
                        label="Work From Home"
                        icon={Home}
                        colorClass="text-attendance-wfh"
                        activeClass="bg-attendance-wfh border-attendance-wfh"
                    />
                    <StatusButton
                        status="Leave"
                        label="On Leave"
                        icon={Coffee}
                        colorClass="text-attendance-leave"
                        activeClass="bg-attendance-leave border-attendance-leave"
                    />
                </div>
                <div className="mt-4 text-center">
                    <a href="/leaves" className="text-primary text-sm font-medium hover:underline">Apply for Leave / WFH</a>
                </div>
            </div>

            <EODForm />
        </div>
    );
};

export default EmployeeDashboard;
