import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color }) {
  // Mock random trend for visual
  const isUp = Math.random() > 0.5;
  const trendPercent = (Math.random() * 15 + 1).toFixed(1);

  return (
    <div className="neu-raised fade-in" style={{ padding: 32, borderRadius: 'var(--radius-lg)', position: 'relative' }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="neu-inset flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Icon size={20} style={{ color: 'var(--text-muted)' }} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              {title}
            </p>
            <p className="font-extrabold tracking-tight" style={{ color: 'var(--text)', fontSize: 36, lineHeight: 1 }}>
              {value}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1 font-bold" style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontSize: 12 }}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trendPercent}%</span>
        </div>
        
        <div style={{ width: 60, height: 24, opacity: 0.8 }}>
          {/* Mock sparkline curve */}
          <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path 
              d={isUp ? "M0 20 C15 20 20 5 30 10 C40 15 45 2 60 5" : "M0 5 C15 5 20 20 30 15 C40 10 45 22 60 20"} 
              stroke={isUp ? "var(--success)" : "var(--danger)"} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
