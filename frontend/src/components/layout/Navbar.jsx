import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';
import Badge from '../ui/Badge.jsx';
import { getRoleColor } from '../../utils/formatters.js';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/records':   'Financial Records',
  '/users':     'User Management',
  '/profile':   'My Profile',
};

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Finance App';

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        <Badge className={getRoleColor(user?.role)}>
          {user?.role}
        </Badge>
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <span className="text-emerald-400 text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;