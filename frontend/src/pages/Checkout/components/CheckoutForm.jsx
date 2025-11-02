import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Building,
  Plus,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useCart } from '../../../contexts/CartContext'
import { authAPI, ordersAPI } from '../../../services/api'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import PaymentModal from '../../../components/payment/PaymentModal'
import toast from '../../../utils/toast'

const CheckoutForm = () => {
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const navigate = useNavigate()
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null)
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [preparedOrderData, setPreparedOrderData] = useState(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      paymentMethod: 'card',
      notes: '',
    }
  })

  const paymentMethod = watch('paymentMethod')

  // Fetch user addresses
  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () => authAPI.getAddresses(),
    enabled: !!user,
  })

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0]
      setSelectedShippingAddress(defaultAddress?.resource_id || null)
      if (useShippingAsBilling) {
        setSelectedBillingAddress(defaultAddress?.resource_id || null)
      }
    }
  }, [addresses, useShippingAsBilling])

  // Create order mutation (without payment - order is created first, then payment is processed)
  const createOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.createOrder(orderData),
    onSuccess: (data) => {
      // Order created successfully, now store order data for payment
      setPreparedOrderData(prev => ({ ...prev, ...data }))
      setShowPaymentModal(true)
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create order'
      toast.error(message)
      setShowPaymentModal(false)
    }
  })

  // Handle payment success
  const handlePaymentSuccess = () => {
    toast.success('Payment processed successfully!')
    clearCart()
    if (preparedOrderData?.resource_id) {
      navigate(`/orders/${preparedOrderData.resource_id}`)
    }
  }

  const onSubmit = async (data) => {
    if (!selectedShippingAddress) {
      toast.error('Please select a shipping address')
      return
    }

    if (!selectedBillingAddress && !useShippingAsBilling) {
      toast.error('Please select a billing address')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Calculate totals from cart
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shippingCost = subtotal > 100 ? 0 : 10
    const taxAmount = subtotal * 0.08
    const total = subtotal + shippingCost + taxAmount

    // Prepare order items
    const orderItems = items.map(item => {
      // Get product resource_id from item.product.resource_id (from cart API)
      const productResourceId = item.product?.resource_id
      
      if (!productResourceId) {
        toast.error(`Product resource ID missing for item: ${item.product?.name || 'Unknown'}`)
        throw new Error('Product resource ID missing')
      }

      return {
        product_resource_id: productResourceId,
        variant_resource_id: item.variant?.resource_id || null,
        quantity: item.quantity,
        price: item.price,
      }
    })

    const orderData = {
      subtotal,
      tax_amount: taxAmount,
      shipping_cost: shippingCost,
      discount_amount: 0,
      total,
      currency: 'USD',
      notes: data.notes || '',
      items: orderItems,
      shipping_address_resource_id: selectedShippingAddress,
      billing_address_resource_id: useShippingAsBilling ? selectedShippingAddress : selectedBillingAddress,
    }

    // Create order first, then open payment modal
    createOrderMutation.mutate(orderData)
  }

  if (isLoadingAddresses) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  const selectedShippingAddr = addresses?.find(addr => addr.resource_id === selectedShippingAddress)
  const selectedBillingAddr = addresses?.find(addr => addr.resource_id === selectedBillingAddress)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shipping Address Section */}
        <Card className="p-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Shipping Address</h3>
          </div>

          {addresses && addresses.length > 0 ? (
            <div className="space-y-3 mb-4">
              {addresses.map((address) => (
                <label
                  key={address.resource_id}
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedShippingAddress === address.resource_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingAddress"
                    value={address.resource_id}
                    checked={selectedShippingAddress === address.resource_id}
                    onChange={() => setSelectedShippingAddress(address.resource_id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {address.first_name} {address.last_name}
                        </p>
                        {address.is_default && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {address.phone}
                    </p>
                  </div>
                  {selectedShippingAddress === address.resource_id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 ml-2" />
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">No addresses found. Please add an address first.</p>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profile')}
            className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {addresses && addresses.length > 0 ? 'Manage Addresses' : 'Add Address'}
          </Button>
        </Card>

        {/* Billing Address Section */}
        <Card className="p-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <Building className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Billing Address</h3>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={useShippingAsBilling}
                onChange={(e) => {
                  setUseShippingAsBilling(e.target.checked)
                  if (e.target.checked) {
                    setSelectedBillingAddress(selectedShippingAddress)
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                Same as shipping address
              </span>
            </label>
          </div>

          {!useShippingAsBilling && addresses && addresses.length > 0 && (
            <div className="space-y-3">
              {addresses.map((address) => (
                <label
                  key={address.resource_id}
                  className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedBillingAddress === address.resource_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="billingAddress"
                    value={address.resource_id}
                    checked={selectedBillingAddress === address.resource_id}
                    onChange={() => setSelectedBillingAddress(address.resource_id)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        {address.first_name} {address.last_name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                  </div>
                  {selectedBillingAddress === address.resource_id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 ml-2" />
                  )}
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Payment Method Section */}
        <Card className="p-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Payment Method</h3>
          </div>
          
          <div className="space-y-3">
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                {...register('paymentMethod')}
                type="radio"
                value="card"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                <p className="text-sm text-gray-600">Pay securely with your card</p>
              </div>
              {paymentMethod === 'card' && (
                <CheckCircle2 className="w-5 h-5 text-blue-600 ml-2" />
              )}
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              paymentMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                {...register('paymentMethod')}
                type="radio"
                value="paypal"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="ml-3 flex-1">
                <p className="font-semibold text-gray-900">PayPal</p>
                <p className="text-sm text-gray-600">Pay with your PayPal account</p>
              </div>
              {paymentMethod === 'paypal' && (
                <CheckCircle2 className="w-5 h-5 text-blue-600 ml-2" />
              )}
            </label>
          </div>
        </Card>

        {/* Order Notes Section */}
        <Card className="p-6 bg-white shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Order Notes (Optional)</h3>
          </div>
          <textarea
            {...register('notes')}
            placeholder="Add any special instructions or notes for your order..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </Card>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
            disabled={createOrderMutation.isPending || !selectedShippingAddress || items.length === 0}
          >
            {createOrderMutation.isPending ? (
              <span className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                </motion.div>
                Processing Order...
              </span>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Complete Order
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          if (!createOrderMutation.isPending) {
            setShowPaymentModal(false)
          }
        }}
        orderData={preparedOrderData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </motion.div>
  )
}

export default CheckoutForm
