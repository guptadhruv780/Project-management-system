import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilFolder,
  cilList,
  cilSettings,
  cilPeople,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Team',
    to: '/team',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Management',
  },
  {
    component: CNavItem,
    name: 'Projects',
    to: '/projects',
    icon: <CIcon icon={cilFolder} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Task Board',
    to: '/tasks',
    icon: <CIcon icon={cilList} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'System',
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
