import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getRecordsApi, getMyRecordsApi, deleteRecordApi } from '../../api/records.api.js';
import { formatCurrency, formatDate, getTypeColor } from '../../utils/formatters.js';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';
import RecordForm from './RecordForm.jsx';

const Records = () => {
  const { isAdmin, isAnalyst, user } = useAuth();

  const [records,    setRecords]    = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [page,       setPage]       = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState({
    search: '', type: '', category: '',
    startDate: '', endDate: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = { page, limit, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

      // ADMIN and ANALYST see all records
      // VIEWER sees only their own
      const fn = (isAdmin || isAnalyst) ? getRecordsApi : getMyRecordsApi;
      const res = await fn(params);

      setRecords(res.data);
      setTotal(res.pagination.total);
    } catch (error) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await deleteRecordApi(id);
      toast.success('Record deleted');
      fetchRecords();
    } catch (error) {
      // Backend returns 403 if trying to delete someone else's record
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  // Check if logged in user owns this record
  const isOwner = (record) => Number(record.user_id) === Number(user?.id);

  // Can edit/delete if owner OR admin
  const canModify = (record) => isOwner(record) || isAdmin;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Records</h2>
          <p className="text-sm text-gray-400">{total} total records</p>
        </div>

        {/* ✅ All users can create their own records */}
        <Button onClick={() => { setEditRecord(null); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <input
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="Category..."
            className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-emerald-500"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-emerald-500"
          />

        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No records found. Click "Add Record" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50 border-b border-gray-700">
                <tr>
                  {['Type', 'Category', 'Amount', 'Date', 'Description',
                    // Show "Added By" column only to ADMIN and ANALYST
                    (isAdmin || isAnalyst) ? 'Added By' : '',
                    'Actions'
                  ].filter(Boolean).map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {records.map(record => (
                  <tr key={record.id} className="hover:bg-gray-700/30 transition-colors">

                    {/* Type */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {record.type === 'INCOME'
                          ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          : <ArrowDownRight className="w-4 h-4 text-red-400" />
                        }
                        <span className={`text-xs font-medium ${getTypeColor(record.type)}`}>
                          {record.type}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-300">{record.category}</td>

                    {/* Amount */}
                    <td className={`px-4 py-3 font-semibold ${getTypeColor(record.type)}`}>
                      {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-400">{formatDate(record.date)}</td>

                    {/* Description */}
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                      {record.description || '—'}
                    </td>

                    {/* Added By — ADMIN and ANALYST only */}
                    {(isAdmin || isAnalyst) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
                            {record.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-300 text-xs">{record.user_name}</span>
                        </div>
                      </td>
                    )}

                    {/* Actions — show only if user owns record or is admin */}
                    <td className="px-4 py-3">
                      {canModify(record) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditRecord(record); setShowForm(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
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
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages} — {total} records
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Record Form Modal */}
      {showForm && (
        <RecordForm
          record={editRecord}
          onClose={() => { setShowForm(false); setEditRecord(null); }}
          onSuccess={() => { setShowForm(false); setEditRecord(null); fetchRecords(); }}
        />
      )}

    </div>
  );
};

export default Records;