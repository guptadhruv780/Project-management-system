import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Projects = React.lazy(() => import('./views/projects/Projects'))
const Tasks = React.lazy(() => import('./views/tasks/Tasks'))
const Settings = React.lazy(() => import('./views/settings/Settings'))
const Team = React.lazy(() => import('./views/team/Team'))

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/projects', name: 'Projects', element: Projects },
  { path: '/tasks', name: 'Task Board', element: Tasks },
  { path: '/settings', name: 'Settings', element: Settings },
  { path: '/team', name: 'Team', element: Team },
]
