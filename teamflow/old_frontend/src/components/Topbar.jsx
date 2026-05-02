import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.includes('/tasks')) return 'Task Board';
    if (path === '/settings') return 'Settings';
    return '';
  };

  const colors = ['#006666', '#00A63D', '#FE9900', '#FF2157', '#4299e1'];
  const avatarColor = colors[(user?.name?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className="flex items-center justify-between mb-8 pb-0" style={{ height: 64 }}>
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ }}>
        <span style={{ color: 'var(--text-muted)' }}>Home</span>
        <span style={{ color: 'var(--text-muted)' }}>›</span>
        <span className="font-bold" style={{ color: 'var(--text)' }}>{getPageTitle()}</span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center px-8">
        <div className="relative neu-raised" style={{ width: '100%', maxWidth: 400, borderRadius: 'var(--radius-xl)' }}>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" style={{ color: 'var(--text)' }} />
          <input
            type="text"
            placeholder="Search anything..."
            style={{ 
              width: '100%', padding: '12px 16px 12px 44px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)'
            }}
          />
        </div>
      </div>

      {/* Right: Bell + Avatar */}
      <div className="flex items-center gap-5">
        <button className="neu-raised-sm flex items-center justify-center relative" style={{ width: 44, height: 44, borderRadius: '50%' }}>
          <Bell size={20} style={{ color: 'var(--text)' }} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ background: 'var(--danger)' }}></div>
        </button>

        <div className="neu-raised-sm flex items-center justify-center font-bold" style={{ width: 44, height: 44, borderRadius: '50%', background: avatarColor, color: '#fff', cursor: 'pointer' }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
