import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useForm } from 'react-hook-form';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
        const response = await authService.login(data.email, data.password);
      
      // Check if user needs subscription
      if (response.needsSubscription) {
        navigate(`/subscription/${response.clientId}`);
      } else {
        navigate('/admin/dashboard'); 
      }
    } catch (err) {
      // Check if error is about subscription
      if (err.needsSubscription) {
        navigate(`/subscription/${err.clientId}`);
      } else {
        setError(err.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center ring-1 ring-slate-100">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Admin Login</h1>
        <p className="text-slate-500 mb-6">Enter your credentials to access the dashboard</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm font-semibold rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="text-left flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
            <input
              type="email"
              {...register("email", { 
                required: "Email is required", 
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" } 
              })}
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium`}
              placeholder="admin@example.com"
            />
            {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase mt-1">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required" })}
              className={`w-full px-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200'} rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-lg font-bold rounded-xl bg-primary text-white shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
