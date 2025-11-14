import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine if input is email or username
    const isEmail = formData.emailOrUsername.includes('@');
    
    const result = await signIn({
      email: isEmail ? formData.emailOrUsername : undefined,
      username: !isEmail ? formData.emailOrUsername : undefined,
      password: formData.password
    });

    setLoading(false);

    if (result.success) {
      await Swal.fire({
        title: 'Welcome!',
        text: 'You have successfully logged in.',
        icon: 'success',
        confirmButtonColor: '#6f4e35',
        timer: 1500
      });
      navigate('/map');
    } else {
      await Swal.fire({
        title: 'Error',
        text: result.error,
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-50 via-heritage-100 to-amber-50 pt-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-heritage-200 rounded-xl flex items-center justify-center">
            <LogIn className="w-6 h-6 text-heritage-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Log In</h1>
            <p className="text-neutral-600">Welcome back to Echoes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
              placeholder="Username or Email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-heritage-700 hover:bg-heritage-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-heritage-700 font-semibold hover:text-heritage-800"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
