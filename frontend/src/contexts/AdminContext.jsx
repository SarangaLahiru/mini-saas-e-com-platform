import React, { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AdminContext.Provider value={{ sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

