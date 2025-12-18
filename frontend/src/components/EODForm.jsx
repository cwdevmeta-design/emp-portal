import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

const EODForm = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/eod/my');
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTask = () => {
        setTasks([...tasks, {
            project_name: '',
            task_description: '',
            hours_spent: '',
            status: 'In Progress'
        }]);
    };

    const handleRemoveTask = (index) => {
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
    };

    const checkChange = (index, field, value) => {
        const newTasks = [...tasks];
        newTasks[index][field] = value;
        setTasks(newTasks);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Submit all tasks for the SELECTED date
            await Promise.all(tasks.map(task => api.post('/eod', { ...task, date: selectedDate })));
            alert('EOD Update Submitted Successfully!');
            setTasks([]);
            fetchHistory();
        } catch (err) {
            alert('Failed to submit: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const generateCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const hasUpdateOnDate = (day) => {
        if (!day) return false;
        const today = new Date();
        const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0];
        return history.some(h => h.date === dateStr);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-dark">EOD Updates</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === 'calendar' ? 'bg-white shadow text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="mb-6">
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-gray-500">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {generateCalendar().map((day, index) => {
                            const today = new Date();
                            const isToday = day === today.getDate();
                            const dateStr = day ? new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0] : '';
                            const isSelected = dateStr === selectedDate;

                            return (
                                <div
                                    key={index}
                                    onClick={() => day && setSelectedDate(dateStr)}
                                    className={`
                                        h-10 rounded flex items-center justify-center text-sm font-medium relative cursor-pointer transition-colors
                                        ${!day ? 'invisible' : ''}
                                        ${isSelected ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
                                        ${isToday && !isSelected ? 'border border-primary text-primary' : ''}
                                    `}
                                >
                                    {day}
                                    {hasUpdateOnDate(day) && (
                                        <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                        Selected Date: <strong>{new Date(selectedDate).toDateString()}</strong>
                    </div>
                </div>
            ) : null}

            {/* Input Form */}
            <div className="space-y-4 mb-6">
                {tasks.map((task, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                placeholder="Project Name"
                                value={task.project_name}
                                onChange={(e) => checkChange(index, 'project_name', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                            <div className="border border-gray-300 rounded overflow-hidden">
                                <MDEditor
                                    value={task.task_description}
                                    onChange={(value) => checkChange(index, 'task_description', value || '')}
                                    preview="edit"
                                    height={150}
                                    hideToolbar={false}
                                    visibleDragbar={false}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-32 space-y-2">
                            <input
                                type="number"
                                placeholder="Hours"
                                value={task.hours_spent}
                                onChange={(e) => checkChange(index, 'hours_spent', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                            <select
                                value={task.status}
                                onChange={(e) => checkChange(index, 'status', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            >
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>Blocked</option>
                            </select>
                        </div>
                        <div className="w-full md:w-auto flex justify-end">
                            <button
                                onClick={() => handleRemoveTask(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex gap-4">
                    <button
                        onClick={handleAddTask}
                        className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded hover:bg-red-50"
                    >
                        <Plus className="w-4 h-4" /> Add Task
                    </button>
                    {tasks.length > 0 && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Updates'}
                        </button>
                    )}
                </div>
            </div>

            {/* History List - Filtered by Date if in Calendar Mode */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    {viewMode === 'calendar' ? `Updates for ${new Date(selectedDate).toLocaleDateString()}` : 'Recent Updates'}
                </h3>
                <div className="space-y-3">
                    {history
                        .filter(h => viewMode === 'list' || h.date === selectedDate)
                        .length === 0 && <div className="text-gray-400 text-sm">No updates found.</div>}

                    {history
                        .filter(h => viewMode === 'list' || h.date === selectedDate)
                        .slice(0, viewMode === 'list' ? 5 : 50)
                        .map(item => (
                            <div key={item.id} className="p-3 border-l-4 border-gray-300 bg-gray-50 text-sm rounded-r">
                                <div className="flex justify-between font-medium">
                                    <span>{item.project_name}</span>
                                    <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                                </div>
                                <div className="text-gray-600 mt-1 prose prose-sm max-w-none">
                                    <MDEditor.Markdown source={item.task_description} />
                                </div>
                                <div className="flex gap-2 mt-2 text-xs">
                                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">{item.hours_spent} hrs</span>
                                    <span className={`px-2 py-0.5 rounded ${item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        item.status === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                        }`}>{item.status}</span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};
export default EODForm;
