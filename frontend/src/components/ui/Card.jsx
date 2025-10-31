import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  ...props
}) => {
  const baseClasses = 'bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const hoverClasses = hover ? 'transition-all duration-200 hover:shadow-medium hover:-translate-y-1' : ''
  
  const classes = clsx(
    baseClasses,
    paddingClasses[padding],
    hoverClasses,
    className
  )
  
  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('px-6 py-4 border-b border-gray-200', className)} {...props}>
    {children}
  </div>
)

const CardBody = ({ children, className = '', ...props }) => (
  <div className={clsx('px-6 py-4', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '', ...props }) => (
  <div className={clsx('px-6 py-4 border-t border-gray-200 bg-gray-50', className)} {...props}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
