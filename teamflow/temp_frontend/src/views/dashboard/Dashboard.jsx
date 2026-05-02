import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CProgress,
  CSpinner,
  CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList, cilCheckCircle, cilClock, cilWarning } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'
import api from '../../api/axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard/stats')
        setStats(res.data)
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleSeed = async () => {
    setLoading(true)
    try {
      await api.post('/api/test/seed')
      const res = await api.get('/api/dashboard/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Seed failed', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-5"><CSpinner color="primary" /></div>
  }

  const noData = !stats || stats.totalTasks === 0

  return (
    <>
      {noData && (
        <CCard className="mb-4 border-top-info border-top-3">
          <CCardBody className="p-4">
            <h3>Welcome to TeamFlow! 🚀</h3>
            <p className="text-muted">
              It looks like your account is empty. To see how the dashboard works, you can either create your first project 
              manually or use our "Quick Start" to seed some dummy data.
            </p>
            <div className="d-flex gap-2">
              <CButton color="info" className="text-white" onClick={handleSeed}>
                Seed Dummy Data
              </CButton>
              <CButton color="outline-primary" onClick={() => window.location.hash = '#/projects'}>
                Go to Projects
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      )}

      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 border-start-primary border-start-4">
            <CCardBody>
              <div className="text-medium-emphasis small text-uppercase fw-semibold">Total Tasks</div>
              <div className="fs-4 fw-semibold">{stats?.totalTasks || 0}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 border-start-success border-start-4">
            <CCardBody>
              <div className="text-medium-emphasis small text-uppercase fw-semibold">Completed</div>
              <div className="fs-4 fw-semibold text-success">{stats?.completedTasks || 0}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 border-start-warning border-start-4">
            <CCardBody>
              <div className="text-medium-emphasis small text-uppercase fw-semibold">In Progress</div>
              <div className="fs-4 fw-semibold text-warning">{stats?.inProgressTasks || 0}</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="mb-4 border-start-danger border-start-4">
            <CCardBody>
              <div className="text-medium-emphasis small text-uppercase fw-semibold">Overdue</div>
              <div className="fs-4 fw-semibold text-danger">{stats?.overdueTasks || 0}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={8}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>Tasks by Project</h4>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary">Project Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Progress</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Total</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {stats?.tasksByProject?.map((project, index) => {
                    const total = project.total || 0
                    const completed = project.completed || 0
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
                    return (
                      <CTableRow key={index}>
                        <CTableDataCell>
                          <strong>{project.name}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex justify-content-between">
                            <div className="fw-semibold">{percent}%</div>
                            <div className="ms-3">
                              <small className="text-body-secondary">{completed}/{total} done</small>
                            </div>
                          </div>
                          <CProgress thin color={percent === 100 ? 'success' : 'info'} value={percent} />
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {total}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
          
          <CCard className="mb-4">
            <CCardBody>
              <h4>Task Distribution</h4>
              <div style={{ height: '300px' }}>
                <CChart
                  type="bar"
                  data={{
                    labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
                    datasets: [
                      {
                        label: 'Tasks',
                        backgroundColor: ['#6c757d', '#ffc107', '#198754', '#dc3545'],
                        data: [
                          stats?.todoTasks || 0,
                          stats?.inProgressTasks || 0,
                          stats?.completedTasks || 0,
                          stats?.overdueTasks || 0,
                        ],
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      }
                    }
                  }}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        
        <CCol md={4}>
          <CCard className="mb-4">
            <CCardBody>
              <h4>Upcoming Deadlines</h4>
              <div className="mt-4">
                {stats?.recentTasks?.map((task, index) => (
                  <div key={index} className="mb-3 border-bottom pb-2">
                    <div className="fw-bold text-truncate">{task.title}</div>
                    <div className="small text-body-secondary">
                      {task.projectName} • {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                ))}
                {(!stats?.recentTasks || stats.recentTasks.length === 0) && (
                  <div className="text-center py-4 text-muted">No upcoming tasks</div>
                )}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
