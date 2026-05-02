import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import SkeletonLoader from '../components/SkeletonLoader';
import { Plus, ArrowLeft, Filter, Inbox, Wand2 } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'Todo', color: 'var(--text-muted)' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'var(--warning)' },
  { id: 'DONE', title: 'Done', color: 'var(--success)' },
];

export default function TaskBoard() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      let tasksUrl = `/api/tasks`;
      if (projectId && projectId !== 'all') {
        tasksUrl += `?projectId=${projectId}`;
      }
      
      const membersRes = await api.get(projectId && projectId !== 'all' ? `/api/users/project/${projectId}` : `/api/users`);
      const tasksRes = await api.get(tasksUrl);
      console.log('Tasks Response:', tasksRes.data);
      
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch (err) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/api/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      setTasks(previousTasks); // revert on failure
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/api/tasks', { ...newTask, projectId: projectId === 'all' ? undefined : projectId });
      setTasks([res.data, ...tasks]);
      setShowAddTask(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const generateDescription = async () => {
    if (!newTask.title) {
      alert('Enter title first');
      return;
    }
    
    setGeneratingDesc(true);
    setError('');
    
    try {
      const res = await api.post('/api/ai/generate-description', { title: newTask.title });
      if (res.data && res.data.description) {
        setNewTask(prev => ({
          ...prev,
          description: res.data.description
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate description.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  const getColumnTasks = (status) => filteredTasks.filter((t) => t.status === status);

  return (
    <div className="flex">
      <Sidebar />
      <main className="main-content flex flex-col h-screen">
        <Topbar />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="neu-raised flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: '50%' }}
              aria-label="Go back"
            >
              <ArrowLeft size={18} strokeWidth={2.5} style={{ color: 'var(--text)' }} />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                Task Board
              </h1>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
                {tasks.length} task{tasks.length !== 1 && 's'} total
              </p>
            </div>
          </div>
          <button
            onClick={() => { setShowAddTask(true); setError(''); }}
            className="neu-btn neu-btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <Plus size={18} strokeWidth={2.5} /> Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 fade-in flex-wrap shrink-0">
          <div className="flex items-center gap-2">
            <Filter size={18} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />
            <select
              className="neu-select text-sm font-bold"
              style={{ width: 'auto', padding: '12px 40px 12px 16px', background: 'transparent', boxShadow: 'none', border: '2px solid var(--shadow-dark)' }}
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <select
            className="neu-select text-sm font-bold"
            style={{ width: 'auto', padding: '12px 40px 12px 16px', background: 'transparent', boxShadow: 'none', border: '2px solid var(--shadow-dark)' }}
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">All Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Board Area */}
        <div className="flex-1 overflow-hidden pb-8">
          {loading ? (
            <SkeletonLoader type="kanban" />
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', height: '100%' }}>
                {COLUMNS.map((col) => (
                  <div key={col.id} className="neu-raised flex flex-col" style={{ flex: 1, minWidth: 300, minHeight: 600, padding: 20, borderRadius: 16 }}>
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: col.color }} />
                      <h3 className="text-sm font-bold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text)' }}>
                        {col.title}
                      </h3>
                      <span
                        className="ml-auto text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: 'var(--shadow-dark)', color: 'var(--surface)' }}
                      >
                        {getColumnTasks(col.id).length}
                      </span>
                    </div>

                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 overflow-y-auto"
                        >
                          {getColumnTasks(col.id).length === 0 && !snapshot.isDraggingOver && (
                            <div
                              className="flex flex-col items-center justify-center"
                              style={{
                                color: 'var(--text-muted)',
                                border: '2px dashed var(--shadow-dark)',
                                borderRadius: 12,
                                height: 120
                              }}
                            >
                              <Inbox size={24} strokeWidth={2} className="mb-2 opacity-50" />
                              <p className="text-sm font-bold" style={{ }}>No tasks yet</p>
                            </div>
                          )}
                          {getColumnTasks(col.id).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                >
                                  <TaskCard task={task} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          )}
        </div>

        {/* Add Task Modal */}
        <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Add Task">
          <form onSubmit={handleAddTask} className="flex flex-col gap-6">
            <div>
              <label className="form-label">Task Title</label>
              <input
                className="neu-input"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            
            <div className="relative">
              <label className="form-label">Description</label>
              <textarea
                className="neu-input mb-3"
                rows={4}
                placeholder="Add more details or use AI..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
              <button 
                type="button" 
                onClick={generateDescription}
                disabled={generatingDesc}
                className="flex items-center justify-center gap-2 font-bold text-sm w-full"
                style={{ background: '#6c63ff', color: '#fff', borderRadius: 8, padding: '10px 16px', border: 'none', cursor: generatingDesc ? 'not-allowed' : 'pointer', opacity: generatingDesc ? 0.8 : 1 }}
              >
                <Wand2 size={16} className={generatingDesc ? 'pulse' : ''} />
                {generatingDesc ? '✨ Generating...' : '✨ Generate with AI'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="form-label">Priority</label>
                <select
                  className="neu-select"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input
                  className="neu-input"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Assign To</label>
              <select
                className="neu-select"
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="error-text mt-2">{error}</p>}

            <div className="flex gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'rgba(196, 194, 192, 0.3)' }}>
              <button type="button" onClick={() => setShowAddTask(false)} className="neu-btn flex-1 py-4">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="neu-btn neu-btn-primary flex-1 py-4">
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
