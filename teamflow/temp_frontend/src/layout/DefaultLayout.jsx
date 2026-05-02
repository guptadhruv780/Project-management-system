/**
 * DefaultLayout Component
 *
 * Main application layout wrapper that composes the primary UI structure
 * for authenticated/protected routes.
 *
 * Layout structure:
 * - AppSidebar: Collapsible navigation sidebar
 * - AppHeader: Top navigation bar with user menu and theme switcher
 * - AppContent: Main content area with route rendering
 * - AppFooter: Footer with links and copyright
 *
 * This layout is used for all routes defined in routes.js, providing
 * a consistent structure across the application.
 *
 * @component
 * @example
 * // Used in App.js for protected routes
 * <Route path="*" element={<DefaultLayout />} />
 */

import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DefaultLayout = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) return <div className="text-center py-5">Loading...</div>
  if (!user) return null

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
