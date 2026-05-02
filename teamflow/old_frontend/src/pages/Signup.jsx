import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="neu-raised p-10 w-full max-w-md fade-in" style={{ padding: 40, borderRadius: 'var(--radius-lg)' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="rounded-md flex items-center justify-center mb-6"
            style={{
              width: 56, height: 56,
              background: 'var(--primary)',
              boxShadow: '4px 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-white font-extrabold text-3xl" style={{ }}>T</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Create Account
          </h1>
          <p className="text-sm mt-2 font-bold" style={{ color: 'var(--text-muted)' }}>
            Join TeamFlow and manage tasks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="signup-name" className="form-label">Full Name</label>
            <input
              id="signup-name"
              type="text"
              className="neu-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="form-label">Email Address</label>
            <input
              id="signup-email"
              type="email"
              className="neu-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="form-label">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="neu-input"
                style={{ paddingRight: 48 }}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="error-text" style={{ color: 'var(--danger)', fontSize: 13, marginTop: -8 }}>{error}</p>}

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="neu-btn neu-btn-primary w-full py-4 text-base mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />
                Creating account…
              </span>
            ) : (
              <><UserPlus size={18} /> Sign Up</>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-8 font-bold" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
