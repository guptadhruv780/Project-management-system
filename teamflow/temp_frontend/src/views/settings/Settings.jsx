import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CFormCheck,
  CAlert
} from '@coreui/react'
import { useAuth } from '../../context/AuthContext'

const Settings = () => {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [success, setSuccess] = useState(false)

  const handleUpdate = (e) => {
    e.preventDefault()
    // Mock update logic
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <>
      <h2 className="mb-4">Settings</h2>
      {success && <CAlert color="success">Settings updated successfully!</CAlert>}
      
      <CRow>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>Profile Information</CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleUpdate}>
                <div className="mb-3">
                  <CFormInput
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <CFormInput
                    label="Email Address"
                    type="email"
                    value={email}
                    disabled
                  />
                  <small className="text-muted">Email cannot be changed.</small>
                </div>
                <CButton color="primary" type="submit">Update Profile</CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>Preferences</CCardHeader>
            <CCardBody>
              <div className="mb-3">
                <CFormCheck label="Email notifications for new tasks" defaultChecked />
              </div>
              <div className="mb-3">
                <CFormCheck label="Desktop notifications" />
              </div>
              <div className="mb-3">
                <CFormCheck label="Weekly summary report" defaultChecked />
              </div>
              <CButton color="secondary">Save Preferences</CButton>
            </CCardBody>
          </CCard>
          
          <CCard className="mb-4 border-danger">
            <CCardHeader className="bg-danger text-white">Danger Zone</CCardHeader>
            <CCardBody>
              <p className="small text-muted">Once you delete your account, there is no going back. Please be certain.</p>
              <CButton color="danger" variant="outline">Delete Account</CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Settings
