import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import { AdminProvider, useAdmin } from '../../contexts/AdminContext'

const AdminLayout = () => {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex pt-16">
          <AdminSidebar />
          <AdminMainContent />
        </div>
      </div>
    </AdminProvider>
  )
}

const AdminMainContent = () => {
  const { sidebarCollapsed } = useAdmin()
  
  return (
    <main 
      className="flex-1 transition-all duration-300 ease-in-out"
      style={{ 
        marginLeft: sidebarCollapsed ? '5rem' : '16rem' // 80px when collapsed, 256px when expanded
      }}
    >
      <div className="p-6">
        <Outlet />
      </div>
    </main>
  )
}

export default AdminLayout

