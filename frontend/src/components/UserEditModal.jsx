import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserEditModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        role: '',
        designation: '',
        department: '',
        manager_id: '',
        status: ''
    });
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                role: user.role,
                designation: user.designation || '',
                department: user.department || '',
                manager_id: user.manager_id || '',
                status: user.status
            });
        }

        // Fetch managers for dropdown
        const fetchManagers = async () => {
            try {
                const res = await api.get('/users/managers');
                setManagers(res.data);
            } catch (err) {
                console.error("Failed to fetch managers", err);
            }
        };
        fetchManagers();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${user.id}`, formData);
            onUpdate();
            onClose();
        } catch (err) {
            alert('Failed to update user: ' + err.response?.data?.message || err.message);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit User: {user.name}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-grey">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="Employee">Employee</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-grey">Designation</label>
                        <input
                            type="text"
                            list="designations"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="e.g. Senior Developer"
                        />
                        <datalist id="designations">
                            <option value="Senior Developer" />
                            <option value="Developer" />
                            <option value="Designer" />
                            <option value="Product Manager" />
                            <option value="Marketer" />
                            <option value="HR Manager" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-grey">Department</label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">Select Department</option>
                            <option value="Developer">Developer</option>
                            <option value="Designer">Designer</option>
                            <option value="Marketer">Marketer</option>
                            <option value="PM">PM</option>
                            <option value="HR">HR</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-grey">Reporting Manager</label>
                        <select
                            value={formData.manager_id}
                            onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">None</option>
                            {managers.map(mgr => (
                                <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark-grey">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditModal;
