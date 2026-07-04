import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { triggerToast } from '../utils/helpers';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await API.post('/auth/login', data);
      login(res.data);
      triggerToast('Welcome back! Authentication successful.');
      navigate('/');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-slate-100">
        <h2 className="text-2xl font-bold mb-1 text-slate-800">Account Access</h2>
        <p className="text-slate-500 text-sm mb-6">Enter your credentials to manage your eBooks</p>
        
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
          <input 
            type="email" 
            {...register('email', { required: 'Email address is required' })}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition" 
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
          <input 
            type="password" 
            {...register('password', { required: 'Password validation is required' })}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-indigo-500 transition" 
          />
          {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button 
          disabled={submitting} 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2.5 rounded-lg transition disabled:opacity-50"
        >
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>
        <p className="text-sm text-center mt-4 text-slate-600">New around here? <Link to="/register" className="text-indigo-600 hover:underline">Create account</Link></p>
      </form>
    </div>
  );
}