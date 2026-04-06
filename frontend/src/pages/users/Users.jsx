import { useState, useEffect } from 'react';
import { Search, Shield, UserCheck, UserX, Trash2 } from 'lucide-react';
import { getUsersApi, updateUserRoleApi, updateUserStatusApi, deleteUserApi } from '../../api/users.api.js';
import { formatDate, getRoleColor } from '../../utils/formatters.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';

const ROLES = ['VIEWER', 'ANALYST', 'ADMIN'];

const Users = () => {
  const { user: currentUser } = useAuth();

  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({ search: '', role: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await getUsersApi(params);
      setUsers(res.data);
      setTotal(res.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, filters]);

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRoleApi(id, role);
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await updateUserStatusApi(id, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUserApi(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-sm text-gray-400">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={e => { setFilters(p => ({ ...p, search: e.target.value })); setPage(1); }}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={filters.role}
            onChange={e => { setFilters(p => ({ ...p, role: e.target.value })); setPage(1); }}
            className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 border-b border-gray-700">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold text-white">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}
                            {u.id === currentUser.id && (
                              <span className="ml-2 text-xs text-emerald-400">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      {u.id === currentUser.id ? (
                        <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 focus:outline-none focus:border-emerald-500"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge className={u.is_active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-500/20 text-gray-400'
                      }>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(u.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {u.id !== currentUser.id && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(u.id, u.is_active)}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-all
                              ${u.is_active
                                ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                                : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                          >
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

export default Users;