import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const CheckoutForm = () => {
  const schema = yup.object({
    email: yup.string().email().required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    address: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    zipCode: yup.string().required(),
    country: yup.string().required(),
    paymentMethod: yup.string().required(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = (data) => {
    // Handle checkout submission
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
        
        <Input
          {...register('email')}
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('firstName')}
            label="First Name"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
          />
          <Input
            {...register('lastName')}
            label="Last Name"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
        
        <Input
          {...register('address')}
          label="Address"
          placeholder="Enter your address"
          error={errors.address?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('city')}
            label="City"
            placeholder="Enter your city"
            error={errors.city?.message}
          />
          <Input
            {...register('state')}
            label="State"
            placeholder="Enter your state"
            error={errors.state?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register('zipCode')}
            label="ZIP Code"
            placeholder="Enter your ZIP code"
            error={errors.zipCode?.message}
          />
          <Input
            {...register('country')}
            label="Country"
            placeholder="Enter your country"
            error={errors.country?.message}
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
        
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('paymentMethod')}
              type="radio"
              value="card"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">Credit Card</span>
          </label>
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('paymentMethod')}
              type="radio"
              value="paypal"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className="ml-3 text-sm font-medium text-gray-900">PayPal</span>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg">
          Complete Order
        </Button>
      </form>
    </Card>
  )
}

export default CheckoutForm
