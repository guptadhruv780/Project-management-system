import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Columns3, Settings, Plus } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/projects/all/tasks', icon: Columns3, label: 'Task Board' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2" style={{ height: 64, marginBottom: 32 }}>
        <div
          className="rounded-md flex items-center justify-center"
          style={{ width: 32, height: 32, background: 'var(--primary)', boxShadow: '4px 4px 8px rgba(0,0,0,0.1)' }}
        >
          <span className="text-white font-extrabold text-lg" style={{ }}>T</span>
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            TeamFlow
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Create Project Button */}
      <div className="mt-auto pt-6 border-t border-transparent">
        <button
          onClick={() => navigate('/projects')}
          className="neu-btn neu-btn-primary w-full"
          style={{ borderRadius: 8, padding: '14px 20px', gap: 8 }}
        >
          <Plus size={20} />
          <span>Create Project</span>
        </button>
      </div>
    </aside>
  );
}
