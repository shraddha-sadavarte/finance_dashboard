import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  LogOut,
  User,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

const Sidebar = () => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build nav items based on role
  const navItems = [
    {
      to:    '/dashboard',
      icon:  LayoutDashboard,
      label: 'Dashboard',
      show:  true, // all roles
    },
    {
      to:    '/records',
      icon:  FileText,
      label: 'Records',
      show:  true, // all roles
    },
    {
      to:    '/users',
      icon:  Users,
      label: 'Users',
      show:  isAdmin, // admin only
    },
    {
      to:    '/profile',
      icon:  User,
      label: 'Profile',
      show:  true,
    },
  ];

  return (
    <aside className="w-64 min-h-screen bg-gray-800 border-r border-gray-700 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">FinanceApp</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems
          .filter(item => item.show)
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-700'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
      </nav>

      {/* User Info + Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-emerald-400 text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;