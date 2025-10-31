import React from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const RULES = [
  { key: 'len', label: 'At least 8 characters', test: v => (v || '').length >= 8 },
  { key: 'upper', label: 'One uppercase letter', test: v => /[A-Z]/.test(v || '') },
  { key: 'lower', label: 'One lowercase letter', test: v => /[a-z]/.test(v || '') },
  { key: 'digit', label: 'One number', test: v => /\d/.test(v || '') },
  { key: 'special', label: 'One special character', test: v => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v || '') },
]

const PasswordRequirements = ({ value, className = '' }) => {
  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      {RULES.map(rule => {
        const ok = rule.test(value)
        return (
          <div key={rule.key} className={`flex items-center text-sm ${ok ? 'text-green-600' : 'text-gray-500'}`}>
            {ok ? (
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 mr-2 text-gray-300" />
            )}
            <span>{rule.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default PasswordRequirements
