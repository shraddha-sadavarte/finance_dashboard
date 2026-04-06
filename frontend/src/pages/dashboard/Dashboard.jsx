import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Wallet,
  Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import {
  getSummaryApi,
  getMonthlyTrendsApi,
  getRecentActivityApi,
  getCategoriesApi,
  getUsersSummaryApi,
} from '../../api/dashboard.api.js';
import { formatCurrency, formatDate, getTypeColor, getRoleColor } from '../../utils/formatters.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import useAuth from '../../hooks/useAuth.js';

// ─── Summary Card ─────────────────────────────────────────────────
const SummaryCard = ({ title, value, icon: Icon, color, sub }) => (
  <Card className="flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
      ${color === 'text-emerald-400' ? 'bg-emerald-500/20' :
        color === 'text-red-400'     ? 'bg-red-500/20'     : 'bg-blue-500/20'}`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  </Card>
);

// ─── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs">
        <p className="text-gray-400 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { isAdmin, isAnalyst } = useAuth();

  const [summary,      setSummary]      = useState(null);
  const [trends,       setTrends]       = useState([]);
  const [recent,       setRecent]       = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [usersSummary, setUsersSummary] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Every role fetches summary and recent activity
        const promises = [
          getSummaryApi(),
          getRecentActivityApi(8),
        ];

        // ANALYST + ADMIN fetch charts
        if (isAdmin || isAnalyst) {
          promises.push(getMonthlyTrendsApi());
          promises.push(getCategoriesApi('EXPENSE'));
        }

        // ADMIN also fetches per-user summary
        if (isAdmin) {
          promises.push(getUsersSummaryApi());
        }

        const results = await Promise.all(promises);

        // results[0] and results[1] always exist
        setSummary(results[0].data);
        setRecent(results[1].data);

        // results[2] and results[3] only if analyst/admin
        if (isAdmin || isAnalyst) {
          setTrends(results[2].data);
          setCategories(results[3].data.slice(0, 5));
        }

        // results[4] only if admin
        if (isAdmin) {
          // If analyst: results[4] is users summary
          // Index depends on how many promises were pushed
          const usersIndex = 4;
          setUsersSummary(results[usersIndex].data);
        }

      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, isAnalyst]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={formatCurrency(summary?.total_income || 0)}
          icon={TrendingUp}
          color="text-emerald-400"
          sub={`${summary?.income_count || 0} transactions`}
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(summary?.total_expenses || 0)}
          icon={TrendingDown}
          color="text-red-400"
          sub={`${summary?.expense_count || 0} transactions`}
        />
        <SummaryCard
          title="Net Balance"
          value={formatCurrency(summary?.net_balance || 0)}
          icon={Wallet}
          color={summary?.net_balance >= 0 ? 'text-emerald-400' : 'text-red-400'}
        />
        <SummaryCard
          title="Total Records"
          value={summary?.total_records || 0}
          icon={Activity}
          color="text-blue-400"
          sub="All time"
        />
      </div>

      {/* ── Charts — ANALYST + ADMIN only ── */}
      {(isAdmin || isAnalyst) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card>
            <h2 className="text-base font-semibold text-white mb-4">Monthly Trends</h2>
            {trends.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month_label" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="income"   name="Income"   stroke="#10b981" fill="url(#income)"  strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#expense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-white mb-4">Top Expense Categories</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_amount" name="Total" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

        </div>
      )}

      {/* ── Recent Activity ── */}
      <Card>
        <h2 className="text-base font-semibold text-white mb-4">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-700">
            {recent.map(record => (
              <div key={record.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${record.type === 'INCOME' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {record.type === 'INCOME'
                      ? <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      : <ArrowDownRight className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{record.category}</p>
                    <p className="text-xs text-gray-400">{formatDate(record.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${getTypeColor(record.type)}`}>
                  {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Users Summary Table — ADMIN only ── */}
      {isAdmin && usersSummary.length > 0 && (
        <Card>
          <h2 className="text-base font-semibold text-white mb-4">
            All Users Financial Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  {['User', 'Role', 'Records', 'Income', 'Expenses', 'Net Balance'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {usersSummary.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700/30 transition-colors">

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold text-white">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge className={getRoleColor(u.role)}>{u.role}</Badge>
                    </td>

                    {/* Records count */}
                    <td className="px-4 py-3 text-gray-300">
                      {u.total_records}
                    </td>

                    {/* Income */}
                    <td className="px-4 py-3 text-emerald-400 font-medium">
                      {formatCurrency(u.total_income)}
                    </td>

                    {/* Expenses */}
                    <td className="px-4 py-3 text-red-400 font-medium">
                      {formatCurrency(u.total_expenses)}
                    </td>

                    {/* Net Balance */}
                    <td className={`px-4 py-3 font-semibold
                      ${u.net_balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(u.net_balance)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
};

export default Dashboard;