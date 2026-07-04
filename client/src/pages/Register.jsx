import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { triggerToast } from '../utils/helpers';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', data);
      login(res.data);
      triggerToast('Registration complete. Welcome onboarding!');
      navigate('/');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error occurred during registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-slate-100">
        <h2 className="text-2xl font-bold mb-1 text-slate-800">Get Started</h2>
        <p className="text-slate-500 text-sm mb-6">Build your personal AI-driven author profile</p>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
          <input 
            type="text" 
            {...register('name', { required: 'Name input needed' })}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none" 
          />
          {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email</label>
          <input 
            type="email" 
            {...register('email', { required: 'Valid email configuration needed' })}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none" 
          />
          {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label>
          <input 
            type="password" 
            {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Minimum 6 chars' } })}
            className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none" 
          />
          {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-2.5 rounded-lg transition disabled:opacity-50">
          {loading ? 'Creating workspace profile...' : 'Register'}
        </button>
        <p className="text-sm text-center mt-4 text-slate-600">Already have an active registration? <Link to="/login" className="text-indigo-600 hover:underline">Login here</Link></p>
      </form>
    </div>
  );
}