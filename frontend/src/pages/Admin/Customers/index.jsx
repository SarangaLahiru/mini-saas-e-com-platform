import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import Input from '../../../components/ui/Input'
import Badge from '../../../components/ui/Badge'
import Avatar from '../../../components/ui/Avatar'
import Modal from '../../../components/ui/Modal'
import { adminAPI } from '../../../services/adminApi'
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
      // Use admin orders API to get orders with items for a specific user
      // Note: user_id should be the numeric ID, not resource_id
      const response = await adminAPI.orders.getOrders({ user_id: userId, limit: 100 })
      setCustomerOrders(response.orders || [])
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
                          // Use numeric ID for filtering orders by user_id
                          fetchCustomerOrders(customer.id)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Orders
                      </button>
                      <Link
                        to={`/admin/customers/${customer.resource_id || customer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Details
                      </Link>
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
        size="2xl"
      >
        <div className="w-full">
          {customerOrders.length > 0 ? (
            <div className="space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto pr-2">
              {customerOrders.map((order) => (
                <div key={order.resource_id || order.id} className="border border-gray-200 rounded-xl p-5 sm:p-6 hover:border-blue-200 hover:shadow-md transition-all bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900">
                          {order.order_number || `#${order.resource_id || order.id}`}
                        </h4>
                        <Badge className={getOrderStatusColor(order.status || 'pending')}>
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                        </Badge>
                        {order.payment_status && (
                          <Badge className={order.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {order.payment_status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-left lg:text-right flex-shrink-0">
                      <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {formatPrice(order.total || order.total_amount || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Two-column layout for wider modal */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Items Column */}
                    <div className="lg:pr-4">
                      {order.items && order.items.length > 0 ? (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Order Items ({order.items.length})</h5>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={item.resource_id || idx}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex-1 min-w-0 mr-3">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.product?.name || item.product_name || 'Product'}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {item.product?.sku && (
                                      <span className="text-xs text-gray-500">SKU: {item.product.sku}</span>
                                    )}
                                    <span className="text-xs text-gray-500">Qty: {item.quantity || 0}</span>
                                    <span className="text-xs text-gray-500">
                                      @ {formatPrice(item.price || 0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                    {formatPrice(item.total || (item.price || 0) * (item.quantity || 0))}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-gray-500">No items found for this order</p>
                        </div>
                      )}
                    </div>

                    {/* Order Summary Column */}
                    <div className="lg:pl-4 border-l-0 lg:border-l border-gray-200 lg:pl-6">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(order.subtotal || 0)}
                          </p>
                        </div>
                        {order.tax_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Tax</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(order.tax_amount || 0)}
                            </p>
                          </div>
                        )}
                        {order.shipping_cost > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Shipping</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(order.shipping_cost || 0)}
                            </p>
                          </div>
                        )}
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Discount</p>
                            <p className="text-sm font-semibold text-green-600">
                              -{formatPrice(order.discount_amount || 0)}
                            </p>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                          <p className="text-base font-semibold text-gray-900">Total</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.total || order.total_amount || 0)}
                          </p>
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Notes</p>
                          <p className="text-sm text-gray-700 break-words">{order.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">This customer hasn't placed any orders yet</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default AdminCustomers

