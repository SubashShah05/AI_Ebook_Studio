import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { triggerToast } from '../utils/helpers';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { darkMode, toggleDarkMode } = React.useContext(ThemeContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      setIsSuccess(true);
      triggerToast('Registration complete. Welcome!');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error occurred during registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#060813] transition-colors duration-200">
        <div className="bg-white dark:bg-[#0B1020] p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200 dark:border-[#252B45] text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">Account created successfully</h2>
          <p className="text-slate-500 dark:text-[#CBD5E1] text-sm mb-8">
            Your workspace is ready. Continue to login to start creating amazing AI-driven eBooks.
          </p>
          <Link 
            to="/login"
            className="block w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium p-3 rounded-lg transition text-center shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
          >
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#060813] transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white dark:bg-[#0f1523] text-slate-500 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#252B45] hover:bg-slate-100 dark:hover:bg-[#1a2136] transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#0B1020] p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200 dark:border-[#252B45]">
        <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white">Create Account</h2>
        <p className="text-slate-500 dark:text-[#CBD5E1] text-sm mb-6">Join AI Ebook Studio today</p>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1] mb-1">Full Name</label>
          <input 
            type="text" 
            disabled={loading}
            {...register('name', { required: 'Name is required' })}
            className={`w-full bg-slate-50 dark:bg-[#0f1523] border ${errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-[#252B45]'} dark:text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition`} 
            placeholder="John Doe"
          />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1] mb-1">Email</label>
          <input 
            type="email" 
            disabled={loading}
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            className={`w-full bg-slate-50 dark:bg-[#0f1523] border ${errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-[#252B45]'} dark:text-white p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition`} 
            placeholder="name@company.com"
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-4 relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1] mb-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              disabled={loading}
              {...register('password', { 
                required: 'Password is required', 
                minLength: { value: 6, message: 'Minimum 6 characters required' } 
              })}
              className={`w-full bg-slate-50 dark:bg-[#0f1523] border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-[#252B45]'} dark:text-white p-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition`} 
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#CBD5E1] transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="mb-6 relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1] mb-1">Confirm Password</label>
          <div className="relative">
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              disabled={loading}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === passwordValue || 'Passwords do not match'
              })}
              className={`w-full bg-slate-50 dark:bg-[#0f1523] border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-200 dark:border-[#252B45]'} dark:text-white p-2.5 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 transition`} 
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-[#CBD5E1] transition"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium p-3 rounded-lg transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] flex justify-center items-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
        <p className="text-sm text-center mt-6 text-slate-600 dark:text-[#CBD5E1]">
          Already have an active registration? <Link to="/login" className="text-[#8B5CF6] hover:text-[#7C3AED] hover:underline font-medium">Sign In</Link>
        </p>
      </form>
    </div>
  );
}