import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bell, Check, Info, AlertTriangle, XCircle } from 'lucide-react';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll every minute (simple real-time alt)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to fetch notifications');
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            await api.put(`/notifications/${notification.id}/read`);
            setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            // Navigate based on notification title/type
            if (notification.title && notification.title.toLowerCase().includes('leave')) {
                // If it's a "Leave Request" notification, manager goes to approvals
                // If it's "Leave Request Approved/Rejected", employee goes to their leaves page
                if (notification.title.toLowerCase().includes('request approved') ||
                    notification.title.toLowerCase().includes('request rejected')) {
                    navigate('/leaves');
                } else {
                    navigate('/admin/approvals');
                }
                setIsOpen(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReadAll = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <Check className="w-4 h-4 text-green-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleReadAll} className="text-xs text-primary hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(note => (
                                <div
                                    key={note.id}
                                    className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!note.is_read ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => handleNotificationClick(note)}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(note.type)}
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!note.is_read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                {note.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {note.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(note.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
