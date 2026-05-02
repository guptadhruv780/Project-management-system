import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CRow,
  CFormSelect,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CAlert
} from '@coreui/react'
import { cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'

const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [projectMembers, setProjectMembers] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(true)
  const [taskModal, setTaskModal] = useState(false)
  const [error, setError] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: ''
  })
  const [creating, setCreating] = useState(false)
  
  const location = useLocation()

  const fetchProjectMembers = async (projectId) => {
    try {
      const res = await api.get(`/api/users/project/${projectId}`)
      setProjectMembers(res.data)
    } catch (err) {
      console.error('Failed to fetch members', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const projRes = await api.get('/api/projects')
        setProjects(projRes.data)
        
        const params = new URLSearchParams(location.search)
        const pid = params.get('projectId')
        if (pid) {
          setSelectedProject(pid)
          fetchTasks(pid)
          fetchProjectMembers(pid)
        } else if (projRes.data.length > 0) {
          setSelectedProject(projRes.data[0].id)
          fetchTasks(projRes.data[0].id)
          fetchProjectMembers(projRes.data[0].id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        console.error('Init failed', err)
        setLoading(false)
      }
    }
    init()
  }, [location])

  const fetchTasks = async (projectId) => {
    setLoading(true)
    try {
      const res = await api.get(`/api/tasks?projectId=${projectId}`)
      setTasks(res.data)
    } catch (err) {
      console.error('Failed to fetch tasks', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      const payload = { ...newTask, projectId: selectedProject }
      await api.post('/api/tasks', payload)
      setTaskModal(false)
      setNewTask({ title: '', description: '', assigneeId: '', priority: 'MEDIUM', dueDate: '' })
      fetchTasks(selectedProject)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
      fetchTasks(selectedProject)
    } catch (err) {
      console.error('Failed to delete task', err)
    }
  }

  const handleProjectChange = (e) => {
    const pid = e.target.value
    setSelectedProject(pid)
    fetchTasks(pid)
    fetchProjectMembers(pid)
  }

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status)

  const StatusColumn = ({ title, status, color }) => (
    <CCol md={4} className="mb-4">
      <h5 className={`border-bottom border-3 border-${color} pb-2 mb-3 d-flex justify-content-between`}>
        {title}
        <CBadge color={color} shape="rounded-pill">{getTasksByStatus(status).length}</CBadge>
      </h5>
      <div className="task-list">
        {getTasksByStatus(status).map(task => (
          <CCard key={task.id} className="mb-3 shadow-sm border-0">
            <CCardBody className="p-3">
              <div className="d-flex justify-content-between mb-2">
                 <CBadge color={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'} size="sm">
                   {task.priority}
                 </CBadge>
                 <CButton color="link" className="p-0 text-danger" onClick={() => handleDeleteTask(task.id)}>
                   <CIcon icon={cilTrash} />
                 </CButton>
              </div>
              <h6 className="fw-bold mb-1">{task.title}</h6>
              <p className="small text-muted mb-2">{task.description || 'No description'}</p>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                </span>
                <div className="small fw-bold text-primary">{task.assignee?.name || 'Unassigned'}</div>
              </div>
            </CCardBody>
          </CCard>
        ))}
        {getTasksByStatus(status).length === 0 && (
          <div className="text-center py-4 text-muted border rounded bg-light small">No tasks</div>
        )}
      </div>
    </CCol>
  )

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <h2 className="mb-0">Task Board</h2>
          {projects.length > 0 ? (
            <CFormSelect 
              style={{ width: '200px' }} 
              value={selectedProject} 
              onChange={handleProjectChange}
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </CFormSelect>
          ) : (
            <CBadge color="warning" className="p-2 ms-2">No Projects Found</CBadge>
          )}
        </div>
        <CButton color="primary" onClick={() => setTaskModal(true)} disabled={projects.length === 0}>
          + New Task
        </CButton>
      </div>

      {!selectedProject && projects.length === 0 && !loading && (
        <CCard className="text-center py-5 border-dashed">
          <CCardBody>
            <h4>Please create a project first</h4>
            <p className="text-muted">You need at least one project to manage tasks.</p>
            <CButton color="primary" onClick={() => window.location.hash = '#/projects'}>Go to Projects</CButton>
          </CCardBody>
        </CCard>
      )}

      {loading ? (
        <div className="text-center py-5"><CSpinner color="primary" /></div>
      ) : (
        <CRow>
          <StatusColumn title="To Do" status="TODO" color="secondary" />
          <StatusColumn title="In Progress" status="IN_PROGRESS" color="warning" />
          <StatusColumn title="Done" status="DONE" color="success" />
        </CRow>
      )}

      <CModal visible={taskModal} onClose={() => setTaskModal(false)}>
        <CForm onSubmit={handleCreateTask}>
          <CModalHeader>
            <CModalTitle>Create New Task</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            <div className="mb-3">
              <CFormInput
                label="Task Title"
                placeholder="What needs to be done?"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <CFormTextarea
                label="Description"
                placeholder="Add more details..."
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={3}
              />
            </div>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormSelect
                    label="Assign To"
                    value={newTask.assigneeId}
                    onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                  >
                    <option value="">Select Member</option>
                    {projectMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </CFormSelect>
                  <small className="text-muted">Only project members are shown.</small>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormSelect
                    label="Priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>
            <div className="mb-3">
              <CFormInput
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setTaskModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Task'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default Tasks
