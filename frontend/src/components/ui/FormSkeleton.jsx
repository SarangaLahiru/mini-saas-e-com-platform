import React from 'react'
import { motion } from 'framer-motion'

const block = (classes = '') => (
  <div className={`bg-gray-200 rounded-lg ${classes} relative overflow-hidden`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
  </div>
)

const FormSkeleton = ({ 
  type = 'login',
  className = '',
  showHeader = true,
  showFooter = true 
}) => {
  const Card = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-xl p-8 border border-gray-100 ${className}`}
    >
      {children}
    </motion.div>
  )

  const Header = () => (
    showHeader && (
      <div className="text-center mb-8">
        {block('w-16 h-16 mx-auto mb-4 rounded-full')}
        {block('h-8 w-3/4 mx-auto mb-2')}
        {block('h-4 w-1/2 mx-auto')}
      </div>
    )
  )

  const Footer = () => (
    showFooter && (
      <div className="text-center">
        {block('h-4 w-48 mx-auto')}
      </div>
    )
  )

  const renderLoginSkeleton = () => (
    <Card>
      <Header />
      <div className="space-y-6">
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {block('w-4 h-4 rounded')}
            {block('h-4 w-24')}
          </div>
          {block('h-4 w-32')}
        </div>
        {block('h-12')}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            {block('h-4 w-16')}
          </div>
        </div>
        {block('h-12')}
        <Footer />
      </div>
    </Card>
  )

  const renderRegisterSkeleton = () => (
    <Card>
      <Header />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            {block('h-4 w-1/3 mb-2')}
            {block('h-12')}
          </div>
          <div>
            {block('h-4 w-1/3 mb-2')}
            {block('h-12')}
          </div>
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/3 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div className="flex items-start space-x-3">
          {block('w-5 h-5 rounded mt-0.5')}
          <div className="flex-1">
            {block('h-4 w-full mb-1')}
            {block('h-4 w-3/4')}
          </div>
        </div>
        {block('h-12')}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            {block('h-4 w-16')}
          </div>
        </div>
        {block('h-12')}
        <Footer />
      </div>
    </Card>
  )

  const renderForgotSkeleton = () => (
    <Card>
      <div className="text-center mb-6">
        {block('w-14 h-14 mx-auto mb-3 rounded-full')}
        {block('h-7 w-2/3 mx-auto mb-2')}
        {block('h-4 w-1/2 mx-auto')}
      </div>
      <div className="space-y-6">
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        {block('h-12')}
        <Footer />
      </div>
    </Card>
  )

  const renderResetSkeleton = () => (
    <Card>
      <div className="text-center mb-6">
        {block('w-12 h-12 mx-auto mb-3 rounded-full')}
        {block('h-7 w-2/3 mx-auto mb-2')}
        {block('h-4 w-3/5 mx-auto')}
      </div>
      <div className="space-y-6">
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/4 mb-2')}
          {block('h-12')}
        </div>
        <div>
          {block('h-4 w-1/3 mb-2')}
          {block('h-12')}
        </div>
        {block('h-12')}
        <Footer />
      </div>
    </Card>
  )

  switch (type) {
    case 'login':
      return renderLoginSkeleton()
    case 'register':
      return renderRegisterSkeleton()
    case 'forgot':
      return renderForgotSkeleton()
    case 'reset':
      return renderResetSkeleton()
    default:
      return renderLoginSkeleton()
  }
}

export default FormSkeleton

