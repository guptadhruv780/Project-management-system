export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      
      {/* Modal Content */}
      <div className="neu-raised relative fade-in" style={{ padding: 32, borderRadius: 20, width: 480, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', background: 'var(--surface)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="neu-raised flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: '50%', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
