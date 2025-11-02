import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from '../../utils/toast';
import { sendForgotPasswordOTP } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { extractErrorMessage } from '../../utils/errorUtils';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');
  const emailRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Email is invalid';
    }
    setErrors(errs);
    
    // Focus on email field if there's an error
    if (errs.email && emailRef.current) {
      emailRef.current.focus();
    }
    
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setErrors({});
    if (!validate()) return;
    setLoading(true);
    try {
      await sendForgotPasswordOTP(email);
      setSent(true);
      toast.success('OTP sent! Please check your email.');
      setTimeout(() => {
        navigate('/auth/reset-password', { state: { email } });
      }, 1300);
    } catch (err) {
      setLoading(false);
      
      // Extract error message from backend
      const errorMessage = extractErrorMessage(err, {
        defaultMessage: 'Unable to send OTP. Please try again or contact support.'
      });
      
      setFormError(errorMessage);
      
      // Focus on email field if submission fails
      if (emailRef.current) {
        emailRef.current.focus();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[460px] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <AnimatePresence>
          {sent ? (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-2 min-h-[325px]"
            >
              <CheckCircle2 size={72} className="text-green-500 mb-4 drop-shadow" />
              <div className="text-lg font-semibold text-green-700 mb-1">OTP sent!</div>
              <p className="text-gray-600 mb-4 text-center">A verification code has been sent to <span className="text-blue-500 font-semibold">{email}</span>.<br/>Please check your inbox and follow the next step.</p>
              <button
                onClick={() => navigate('/auth/reset-password', { state: { email } })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center mb-4"
              >
                Continue
              </button>
              <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline">Back to Login</Link>
            </motion.div>
          ) : (
            <motion.form
              key="forgot-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center mb-4">
                <Mail size={44} className="text-blue-600 mb-2" />
                <h2 className="text-2xl font-bold text-gray-800 text-center">Forgot your password?</h2>
                <span className="text-gray-500 text-center text-sm mt-1 max-w-xs">Enter your email and you’ll get a 6-digit code to reset your password.</span>
              </div>
              {formError && (
                <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 rounded-lg px-3 py-2 mb-1 text-sm">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={emailRef}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending OTP...
                  </div>
                ) : (
                  'Send OTP'
                )}
              </button>
              <div className="mt-2 text-center">
                <Link to="/auth/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 hover:underline">
                  Back to login
                </Link>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
