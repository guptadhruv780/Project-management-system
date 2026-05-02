import { Users, ArrowRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project, isAdmin, onAddMember }) {
  const navigate = useNavigate();
  const progress = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  return (
    <div className="neu-raised fade-in flex flex-col" style={{ padding: 32, borderRadius: 'var(--radius-lg)', height: '100%' }}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold leading-snug" style={{ color: 'var(--text)', fontSize: 20 }}>
          {project.name}
        </h3>
      </div>

      {/* Description */}
      <p className="flex-1 mb-8 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        {project.description || 'No description'}
      </p>

      {/* Members */}
      <div className="flex items-center gap-4 mb-8">
        <div className="avatar-stack flex">
          {(project.members || []).slice(0, 4).map((m, i) => (
            <div
              key={m.id || i}
              className="avatar"
              title={m.name}
              style={{
                width: 32, height: 32, fontSize: 13, fontWeight: 700,
                marginLeft: i > 0 ? -8 : 0,
                border: '2px solid var(--surface)',
                borderRadius: '50%',
                background: '#006666',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
        <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          <Users size={16} />
          {project.memberCount}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between font-bold mb-3" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          <span>Progress</span>
          <span>{project.completedTasks}/{project.totalTasks} tasks</span>
        </div>
        <div className="progress-track" style={{ background: '#d1d9e0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--primary)', height: 8, borderRadius: 4 }} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/projects/${project.id}/tasks`)}
          className="neu-btn neu-btn-primary flex-1 text-sm font-bold flex items-center justify-center gap-2"
          style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
        >
          View Tasks <ArrowRight size={18} />
        </button>
        {isAdmin && onAddMember && (
          <button
            onClick={() => onAddMember(project.id)}
            className="neu-raised flex items-center justify-center"
            title="Add member"
            aria-label="Add member to project"
            style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', color: 'var(--primary)', flexShrink: 0 }}
          >
            <UserPlus size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
