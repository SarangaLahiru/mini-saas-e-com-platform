import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitResetPassword } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordRequirements from '../../components/ui/PasswordRequirements';
import { extractErrorMessage } from '../../utils/errorUtils';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || '',
    otp_code: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const emailRef = useRef(null);
  const otpRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email is invalid';
    if (!form.otp_code.trim()) e.otp_code = 'OTP code is required';
    if (!form.new_password) e.new_password = 'Password is required';
    if (!form.confirm_password) e.confirm_password = 'Confirm password is required';
    if (form.new_password && form.confirm_password && form.new_password !== form.confirm_password) e.confirm_password = 'Passwords must match';
    setErrors(e);
    
    // Focus on first field with error
    if (e.email && emailRef.current) {
      emailRef.current.focus();
    } else if (e.otp_code && otpRef.current) {
      otpRef.current.focus();
    } else if (e.new_password && newPasswordRef.current) {
      newPasswordRef.current.focus();
    } else if (e.confirm_password && confirmPasswordRef.current) {
      confirmPasswordRef.current.focus();
    }
    
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(errs => ({ ...errs, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await submitResetPassword(form);
      setResetSuccess(true);
      toast.success('Password reset! Please log in.');
      setTimeout(() => { navigate('/auth/login'); }, 1500);
    } catch (err) {
      setLoading(false);
      
      // Extract error message from backend
      const errorMessage = extractErrorMessage(err, {
        defaultMessage: 'Password reset failed. Please try again.'
      });
      
      setErrors({ submit: errorMessage });
      
      // Focus on email field if reset fails
      if (emailRef.current) {
        emailRef.current.focus();
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[480px] flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        <AnimatePresence>
          {resetSuccess ? (
            <motion.div
              key="reset-ok"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-2 min-h-[330px]"
            >
              <ShieldCheck size={72} className="text-green-500 mb-5 drop-shadow" />
              <div className="text-xl font-semibold text-green-800 mb-1">Password reset!</div>
              <p className="text-gray-600 mb-4 text-center">Your password was updated.<br/>You can now log in with your new password.</p>
              <button
                onClick={() => navigate('/auth/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center mb-4"
              >
                Go to Login
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="reset-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.34 }}
              className="space-y-7"
            >
              <div className="flex flex-col items-center mb-2">
                <Lock size={40} className="text-blue-600 mb-1" />
                <h2 className="text-2xl font-bold text-gray-800 text-center">Reset your password</h2>
                <span className="text-gray-500 text-center text-sm mt-1 max-w-xs">Enter the 6-digit code sent to your email and set a strong new password.</span>
              </div>
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{errors.submit}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
                <input
                  ref={otpRef}
                  type="text"
                  name="otp_code"
                  value={form.otp_code}
                  onChange={handleChange}
                  maxLength={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.otp_code ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Enter the 6-digit OTP"
                  disabled={loading}
                />
                {errors.otp_code && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.otp_code}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  ref={newPasswordRef}
                  type="password"
                  name="new_password"
                  autoComplete="new-password"
                  value={form.new_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="New password"
                  disabled={loading}
                />
                <PasswordRequirements value={form.new_password} />
                {errors.new_password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.new_password}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Confirm password"
                  disabled={loading}
                />
                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirm_password}
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
                    Resetting Password...
                  </div>
                ) : (
                  'Reset Password'
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

export default ResetPassword;
