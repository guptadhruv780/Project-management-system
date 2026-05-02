import React, { useState, useEffect } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CSpinner,
  CFormCheck,
  CBadge
} from '@coreui/react'
import { CIcon } from '@coreui/icons-react'
import { cilTrash, cilPencil, cilUserPlus } from '@coreui/icons'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()
  
  const isAdminUser = currentUser?.role === 'ADMIN'

  // Create Modal State
  const [createModal, setCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', memberIds: [] })
  
  // Edit/Members Modal State
  const [editModal, setEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  
  const [processing, setProcessing] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects')
      setProjects(res.data)
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    }
  }

  useEffect(() => {
    fetchProjects()
    if (isAdminUser) fetchUsers()
  }, [isAdminUser])

  const handleCreate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await api.post('/api/projects', newProject)
      setCreateModal(false)
      setNewProject({ name: '', description: '', memberIds: [] })
      fetchProjects()
    } catch (err) {
      console.error('Create failed', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await api.put(`/api/projects/${editingProject.id}`, {
        name: editingProject.name,
        description: editingProject.description
      })
      await api.post(`/api/projects/${editingProject.id}/sync-members`, {
        memberIds: editingProject.memberIds
      })
      setEditModal(false)
      fetchProjects()
    } catch (err) {
      console.error('Update failed', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will be removed.')) return
    try {
      await api.delete(`/api/projects/${id}`)
      fetchProjects()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const openEditModal = (project) => {
    setEditingProject({
      id: project.id,
      name: project.name,
      description: project.description,
      memberIds: project.members.map(m => m.id)
    })
    setEditModal(true)
  }

  const toggleMember = (userId, isEdit = false) => {
    if (isEdit) {
      const current = [...editingProject.memberIds]
      if (current.includes(userId)) {
        setEditingProject({ ...editingProject, memberIds: current.filter(id => id !== userId) })
      } else {
        setEditingProject({ ...editingProject, memberIds: [...current, userId] })
      }
    } else {
      const current = [...newProject.memberIds]
      if (current.includes(userId)) {
        setNewProject({ ...newProject, memberIds: current.filter(id => id !== userId) })
      } else {
        setNewProject({ ...newProject, memberIds: [...current, userId] })
      }
    }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /></div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projects</h2>
        {isAdminUser && (
          <CButton color="primary" onClick={() => setCreateModal(true)}>+ New Project</CButton>
        )}
      </div>

      <CRow>
        {projects.map((project) => (
          <CCol sm={6} md={4} lg={3} key={project.id} className="mb-4">
            <CCard className="h-100 shadow-sm border-top-primary border-top-3">
              <CCardHeader className="fw-bold d-flex justify-content-between align-items-center">
                <span className="text-truncate" style={{ maxWidth: '150px' }}>{project.name}</span>
                {isAdminUser && (
                  <div className="d-flex gap-1">
                    <CButton color="link" className="p-0 text-info" onClick={() => openEditModal(project)}>
                      <CIcon icon={cilUserPlus} />
                    </CButton>
                    <CButton color="link" className="p-0 text-danger" onClick={() => handleDeleteProject(project.id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                )}
              </CCardHeader>
              <CCardBody className="d-flex flex-column">
                <p className="small text-muted mb-3 flex-grow-1">{project.description || 'No description'}</p>
                <div className="mt-3">
                   <div className="mb-2">
                     <small className="text-muted d-block mb-1">Members:</small>
                     <div className="d-flex flex-wrap gap-1">
                       {project.members.slice(0, 3).map(m => (
                         <CBadge key={m.id} color="light" shape="rounded-pill" className="text-dark border">
                           {m.name.split(' ')[0]}
                         </CBadge>
                       ))}
                       {project.members.length > 3 && <CBadge color="light" shape="rounded-pill">+{project.members.length - 3}</CBadge>}
                     </div>
                   </div>
                  <CButton 
                    className="w-100 mt-2" 
                    color="outline-primary" 
                    size="sm" 
                    onClick={() => window.location.hash = `#/tasks?projectId=${project.id}`}
                  >
                    View Tasks Board
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
        {projects.length === 0 && (
          <CCol xs={12}>
            <div className="text-center py-5 text-muted">
              <h4>No projects assigned to you.</h4>
            </div>
          </CCol>
        )}
      </CRow>

      {/* Create Modal */}
      <CModal visible={createModal} onClose={() => setCreateModal(false)} scrollable>
        <CForm onSubmit={handleCreate}>
          <CModalHeader><CModalTitle>Create New Project</CModalTitle></CModalHeader>
          <CModalBody>
            <CFormInput label="Project Name" className="mb-3" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} required />
            <CFormTextarea label="Description" className="mb-3" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} />
            <label className="form-label">Assign Team Members</label>
            <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {users.map(u => (
                <div key={u.id} className="mb-1">
                  <CFormCheck id={`create-user-${u.id}`} label={u.name} checked={newProject.memberIds.includes(u.id)} onChange={() => toggleMember(u.id)} />
                </div>
              ))}
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setCreateModal(false)}>Cancel</CButton>
            <CButton color="primary" type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create'}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>

      {/* Edit Members Modal */}
      <CModal visible={editModal} onClose={() => setEditModal(false)} scrollable>
        {editingProject && (
          <CForm onSubmit={handleUpdate}>
            <CModalHeader><CModalTitle>Manage Project Members</CModalTitle></CModalHeader>
            <CModalBody>
              <CFormInput label="Project Name" className="mb-3" value={editingProject.name} onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })} required />
              <CFormTextarea label="Description" className="mb-3" value={editingProject.description} onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} />
              <label className="form-label">Project Team</label>
              <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {users.map(u => (
                  <div key={u.id} className="mb-1 d-flex justify-content-between align-items-center">
                    <CFormCheck id={`edit-user-${u.id}`} label={u.name} checked={editingProject.memberIds.includes(u.id)} onChange={() => toggleMember(u.id, true)} />
                    <small className="text-muted">{u.email}</small>
                  </div>
                ))}
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setEditModal(false)}>Cancel</CButton>
              <CButton color="primary" type="submit" disabled={processing}>{processing ? 'Saving...' : 'Save Changes'}</CButton>
            </CModalFooter>
          </CForm>
        )}
      </CModal>
    </>
  )
}

export default Projects
