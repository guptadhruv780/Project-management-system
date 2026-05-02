import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Inbox } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/dashboard/stats');
        setStats(res.data);
      } catch (err) { /* empty */ }
      finally { setLoading(false); }
    })();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div className="neu-raised-sm" style={{ padding: '12px 16px', background: 'var(--surface)', fontSize: 12 }}>
        <p className="font-bold mb-2" style={{ color: 'var(--text)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content">
        <Topbar />

        {loading ? (
          <SkeletonLoader type="stat" count={4} />
        ) : (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
              <div className="fade-in-d1"><StatCard title="Total Tasks" value={stats?.totalTasks || 0} icon={ListTodo} color="var(--text)" /></div>
              <div className="fade-in-d2"><StatCard title="Completed" value={stats?.completedTasks || 0} icon={CheckCircle2} color="var(--success)" /></div>
              <div className="fade-in-d3"><StatCard title="In Progress" value={stats?.inProgressTasks || 0} icon={Clock} color="var(--warning)" /></div>
              <div className="fade-in-d4"><StatCard title="Overdue" value={stats?.overdueTasks || 0} icon={AlertTriangle} color="var(--danger)" /></div>
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
              
              {/* Left: Tasks by Project Area Chart */}
              <div className="neu-raised fade-in" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-bold" style={{ color: 'var(--text)', fontSize: 18 }}>
                    Tasks by Project
                  </h2>
                </div>
                {stats?.tasksByProject?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={stats.tasksByProject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--text-muted)" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="var(--text-muted)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--shadow-dark)" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        dy={10}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                        axisLine={false}
                        tickLine={false}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="completed" name="Completed" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                      <Area type="monotone" dataKey="inProgress" name="In Progress" stroke="var(--text-muted)" strokeWidth={3} fillOpacity={1} fill="url(#colorInProgress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={Inbox} message="No project data yet" />
                )}
              </div>

              {/* Right: Upcoming Deadlines */}
              <div className="flex flex-col gap-6">
                <div className="neu-raised fade-in flex-1" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
                  <h2 className="font-bold mb-6" style={{ color: 'var(--text)', fontSize: 18 }}>
                    Upcoming Deadlines
                  </h2>
                  {stats?.recentTasks?.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {stats.recentTasks.map((task, index) => (
                        <div key={task.id} className="flex items-start gap-4" style={{ paddingBottom: 16, borderBottom: index < stats.recentTasks.length - 1 ? '1px solid rgba(196, 194, 192, 0.3)' : 'none' }}>
                          <div className="w-2 h-2 mt-2 rounded-full" style={{ background: task.priority === 'HIGH' ? 'var(--danger)' : task.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }} />
                          <div className="flex-1">
                            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>{task.title}</h4>
                            <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'No date'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Inbox} message="No upcoming tasks." />
                  )}
                </div>
              </div>
            </div>

            {/* Overall Completion Rate */}
            {stats && stats.totalTasks > 0 && (
              <div className="neu-raised p-6 fade-in" style={{ padding: 32, borderRadius: 'var(--radius-lg)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Overall Completion</h2>
                  <span className="font-bold text-xl" style={{ color: 'var(--primary)' }}>
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="progress-track" style={{ height: 12, borderRadius: 6 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${stats.completionRate}%`, height: 12, borderRadius: 6 }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--text-muted)' }}>
      <Icon size={48} strokeWidth={1.5} className="mb-3 opacity-30" />
      <p className="text-sm font-bold" style={{ }}>{message}</p>
    </div>
  );
}
