import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from '../../../utils/toast'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'

const Newsletter = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = yup.object({
    email: yup
      .string()
      .email('Please enter a valid email address')
      .required('Email is required'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Successfully subscribed to newsletter!')
      reset()
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get the latest updates on new products, exclusive deals, and tech news delivered to your inbox.
          </p>
          
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <Input
                {...register('email')}
                type="email"
                placeholder="Enter your email address"
                error={errors.email?.message}
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="lg"
              loading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Subscribe
            </Button>
          </form>
          
          <p className="text-sm text-primary-200 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Newsletter
