import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { User, Lock, Check } from 'lucide-react';

export default function Settings() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      const res = await api.put('/api/users/profile', { name, currentPassword, newPassword });
      setMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      // If token changed (optional depending on your backend), update context
      if (res.data.token) {
        login(res.data.user, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        
        <div className="max-w-2xl fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-8" style={{ color: 'var(--text)' }}>
            Settings
          </h1>

          <div className="neu-raised" style={{ padding: 40, borderRadius: 'var(--radius-lg)' }}>
            <div className="flex items-center gap-6 mb-10 pb-8 border-b" style={{ borderColor: 'rgba(196, 194, 192, 0.3)' }}>
              <div 
                className="flex items-center justify-center font-bold text-2xl shadow-sm"
                style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: '#fff' }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{user?.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
                <div className="mt-2 inline-flex">
                  <span className="neu-badge" style={{ background: 'var(--surface)' }}>{user?.role}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
              <div>
                <label className="form-label flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  className="neu-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Lock size={14} /> Current Password
                </label>
                <input
                  type="password"
                  className="neu-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Lock size={14} /> New Password
                </label>
                <input
                  type="password"
                  className="neu-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {error && <p className="error-text" style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
              {message && (
                <p className="flex items-center gap-2 font-bold" style={{ color: 'var(--success)', fontSize: 13 }}>
                  <Check size={16} /> {message}
                </p>
              )}

              <div className="mt-4 pt-6 border-t" style={{ borderColor: 'rgba(196, 194, 192, 0.3)' }}>
                <button type="submit" disabled={submitting} className="neu-btn neu-btn-primary" style={{ padding: '14px 32px' }}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
