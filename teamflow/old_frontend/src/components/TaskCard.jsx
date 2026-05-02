import { Clock } from 'lucide-react';

export default function TaskCard({ task, isDragging }) {
  const priorityMap = {
    LOW: 'badge-todo',
    MEDIUM: 'badge-warning',
    HIGH: 'badge-danger',
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div
      className="neu-inset"
      style={{
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        transition: 'all 0.2s ease',
        transform: isDragging ? 'rotate(2deg) scale(1.03)' : 'none',
        zIndex: isDragging ? 100 : 1,
      }}
    >
      {/* Title + Priority */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-bold leading-snug flex-1" style={{ color: 'var(--text)', fontSize: 15 }}>
          {task.title}
        </h4>
        <span className={`neu-badge`} style={{ 
          background: 'var(--surface)', 
          color: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--text-muted)'
        }}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="mb-4 leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t" style={{ borderColor: 'rgba(196, 194, 192, 0.3)' }}>
        <div className="flex items-center gap-2 font-bold" style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)' }}>
          <Clock size={14} />
          <span className="text-xs">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
          </span>
        </div>
        
        {task.assignee ? (
          <div
            className="avatar flex items-center justify-center text-[11px] font-bold shadow-sm"
            style={{ width: 26, height: 26, background: 'var(--primary)', color: '#fff' }}
            title={task.assignee.name}
          >
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="rounded-full" style={{ width: 26, height: 26, background: 'var(--shadow-dark)', opacity: 0.2 }} />
        )}
      </div>
    </div>
  );
}
