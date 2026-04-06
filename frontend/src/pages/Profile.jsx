import { useState, useEffect } from 'react';
import { getMeApi } from '../api/users.api.js';
import { formatDate, getRoleColor } from '../utils/formatters.js';
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then(res => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-xl">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-400">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <Badge className={getRoleColor(profile?.role)}>{profile?.role}</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { icon: User,     label: 'Full Name', value: profile?.name },
            { icon: Mail,     label: 'Email',     value: profile?.email },
            { icon: Shield,   label: 'Role',      value: profile?.role },
            { icon: Calendar, label: 'Joined',    value: formatDate(profile?.created_at) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-700/40 rounded-lg">
              <Icon className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm text-white font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Profile;