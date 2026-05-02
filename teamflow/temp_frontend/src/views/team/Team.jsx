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
  CBadge,
  CAvatar,
  CSpinner,
  CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const Team = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser } = useAuth()

  const isAdmin = currentUser?.role === 'ADMIN'

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This will remove them from all projects.')) return
    try {
      await api.delete(`/api/users/${id}`)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  if (loading) return <div className="text-center py-5"><CSpinner color="primary" /></div>

  return (
    <>
      <h2 className="mb-4">Team Members</h2>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4 shadow-sm">
            <CCardHeader>Registered Users</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Avatar</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Name</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Email</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">Role</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Joined Date</CTableHeaderCell>
                    {isAdmin && <CTableHeaderCell className="bg-body-tertiary text-center">Actions</CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user, index) => (
                    <CTableRow key={user.id}>
                      <CTableDataCell className="text-center">
                        <CAvatar color="primary" textColor="white">
                          {user.name.charAt(0).toUpperCase()}
                        </CAvatar>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-bold">{user.name}</div>
                      </CTableDataCell>
                      <CTableDataCell>{user.email}</CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CBadge color={user.role === 'ADMIN' ? 'danger' : 'info'}>
                          {user.role}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </CTableDataCell>
                      {isAdmin && (
                        <CTableDataCell className="text-center">
                          <CButton 
                            color="link" 
                            className="text-danger p-0" 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Team
