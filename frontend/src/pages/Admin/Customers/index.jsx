import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import Modal from '../../../components/ui/Modal'
import { adminAPI } from '../../../services/adminApi'
import { ordersAPI } from '../../../services/api'
import { formatPrice } from '../../../utils/format'
import toast from 'react-hot-toast'

const AdminCustomers = () => {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [showOrdersModal, setShowOrdersModal] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.users.getUsers({
        search: searchTerm || undefined,
        limit: 100
      })
      setCustomers(response.users || response || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerOrders = async (userId) => {
    try {
      const response = await ordersAPI.getOrders({ user_id: userId })
      setCustomerOrders(response.orders || response || [])
      setShowOrdersModal(true)
    } catch (error) {
      console.error('Failed to fetch customer orders:', error)
      toast.error('Failed to load customer orders')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success-100 text-success-700',
      inactive: 'bg-gray-100 text-gray-700',
      verified: 'bg-primary-100 text-primary-700',
      unverified: 'bg-warning-100 text-warning-700',
    }
    return colors[status] || colors.inactive
  }

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-warning-100 text-warning-700',
      processing: 'bg-primary-100 text-primary-700',
      shipped: 'bg-info-100 text-info-700',
      delivered: 'bg-success-100 text-success-700',
      cancelled: 'bg-error-100 text-error-700',
      refunded: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || colors.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
          <p className="text-gray-600 mt-1">Manage and view customer information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.resource_id || customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={customer.avatar}
                          name={customer.first_name || customer.username || 'Customer'}
                          size="sm"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name && customer.last_name
                              ? `${customer.first_name} ${customer.last_name}`
                              : customer.username || 'Customer'}
                          </div>
                          <div className="text-sm text-gray-500">@{customer.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(customer.is_active ? 'active' : 'inactive')}>
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {customer.is_verified && (
                          <Badge className={getStatusColor('verified')}>Verified</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer)
                          fetchCustomerOrders(customer.id || customer.resource_id)
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View Orders
                      </button>
                      <button
                        onClick={() => navigate(`/admin/users/${customer.resource_id || customer.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Orders Modal */}
      <Modal
        isOpen={showOrdersModal}
        onClose={() => {
          setShowOrdersModal(false)
          setSelectedCustomer(null)
          setCustomerOrders([])
        }}
        title={`Orders for ${selectedCustomer?.first_name || selectedCustomer?.username || 'Customer'}`}
      >
        <div className="max-h-96 overflow-y-auto">
          {customerOrders.length > 0 ? (
            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div key={order.resource_id || order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.order_number || order.resource_id}</p>
                      <p className="text-sm text-gray-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Items: {order.items?.length || 0}</p>
                      {order.items?.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-500">
                          {item.product_name || item.name} x{item.quantity}
                        </p>
                      ))}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(order.total_amount || order.total || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No orders found for this customer</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default AdminCustomers

