import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { Plus, Inbox } from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/api/projects', newProject);
      setProjects([res.data, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/api/projects/${selectedProjectId}/members`, { email: memberEmail });
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const openMemberModal = (projectId) => {
    setSelectedProjectId(projectId);
    setMemberEmail('');
    setError('');
    setShowMemberModal(true);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in gap-4">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Projects
          </h1>
          {isAdmin && (
            <button
              onClick={() => { setShowCreateModal(true); setError(''); }}
              className="neu-btn neu-btn-primary"
            >
              <Plus size={18} strokeWidth={2.5} /> New Project
            </button>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <SkeletonLoader type="project" count={3} />
        ) : projects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`fade-in-d${(index % 3) + 1}`}
              >
                <ProjectCard
                  project={project}
                  isAdmin={isAdmin}
                  onAddMember={openMemberModal}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="neu-flat p-12 flex flex-col items-center justify-center fade-in text-center" style={{ color: 'var(--text-muted)' }}>
            <Inbox size={64} strokeWidth={1.5} className="mb-4 opacity-30" />
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>No projects yet</p>
            <p className="text-sm font-bold" style={{ }}>
              {isAdmin ? 'Create your first project to get started.' : 'Ask an admin to add you to a project.'}
            </p>
          </div>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Project">
          <form onSubmit={handleCreateProject} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Project Name</label>
              <input
                className="neu-input"
                placeholder="e.g. Website Redesign"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="neu-input"
                rows={3}
                placeholder="Brief project description..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={submitting} className="neu-btn neu-btn-primary w-full py-4 mt-2">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </Modal>

        {/* Add Member Modal */}
        <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
          <form onSubmit={handleAddMember} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Member Email</label>
              <input
                className="neu-input"
                type="email"
                placeholder="member@teamflow.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" disabled={submitting} className="neu-btn neu-btn-primary w-full py-4 mt-2">
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
