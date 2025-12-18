import React, { useState, useEffect } from 'react';
import api from '../services/api';
import UserEditModal from '../components/UserEditModal';
import UserAddModal from '../components/UserAddModal';
import { Search, Loader, Plus, Trash2, Edit2, Check } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: '',
        department: '',
        designation: '',
        search: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            // Default filter to show everything except Admin if no role selected, 
            // BUT for approval workflow we want to see Pending users clearly.
            if (filters.role) params.append('role', filters.role);
            if (filters.department) params.append('department', filters.department);
            if (filters.search) params.append('search', filters.search);
            if (filters.designation) params.append('designation', filters.designation);

            const res = await api.get(`/users?${params.toString()}`);
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (user) => {
        if (window.confirm(`Approve ${user.name} and activate their account?`)) {
            try {
                await api.put(`/users/${user.id}`, { status: 'Active' });
                alert('User approved successfully');
                fetchUsers();
            } catch (err) {
                alert('Failed to approve user');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filters.role, filters.department, filters.designation]); // Auto-refresh on dropdown changes

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                alert('User deleted successfully');
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark">User Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Name or Email"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-8 pr-4 py-2 border border-gray-200 rounded text-sm w-48 focus:border-primary outline-none"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded text-sm w-32 focus:border-primary outline-none"
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Department</label>
                    <select
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded text-sm w-32 focus:border-primary outline-none"
                    >
                        <option value="">All Depts</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="Marketer">Marketer</option>
                        <option value="PM">PM</option>
                        <option value="HR">HR</option>
                    </select>
                </div>

                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-secondary text-white rounded text-sm hover:bg-secondary-dark transition-colors"
                >
                    Apply Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Role & Designation</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Department</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Manager</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8"><Loader className="animate-spin inline text-primary" /></td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ?
                                            <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" /> :
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                                        }
                                        <div>
                                            <div className="font-medium text-dark text-sm">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2
                        ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {user.role}
                                    </span>
                                    <div className="text-xs text-gray-500 mt-1">{user.designation || '—'}</div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{user.department || '—'}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{user.manager ? user.manager.name : '—'}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                        ${user.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.status === 'Pending' && (
                                            <button
                                                onClick={() => handleApprove(user)}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                title="Approve User"
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="p-1 text-secondary hover:bg-blue-50 rounded"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <UserEditModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onUpdate={fetchUsers}
                />
            )}

            {showAddModal && (
                <UserAddModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={fetchUsers}
                />
            )}
        </div>
    );
};

export default UserManagement;
