import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span className="fw-bold">TeamFlow</span>
        <span className="ms-1">&copy; 2026</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">All rights reserved.</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
