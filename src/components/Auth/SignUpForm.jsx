import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../contexts/AuthContext';

function SignUpForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      await Swal.fire({
        title: 'Error',
        text: 'Passwords do not match',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    if (formData.password.length < 6) {
      await Swal.fire({
        title: 'Error',
        text: 'Password must be at least 6 characters',
        icon: 'error',
        confirmButtonColor: '#6f4e35'
      });
      return;
    }

    setLoading(true);

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      username: formData.username
    });

    setLoading(false);

    if (result.success) {
      await Swal.fire({
        title: 'Success!',
        text: 'Account created successfully. You can now log in.',
        icon: 'success',
        confirmButtonColor: '#6f4e35'
      });
      navigate('/login');
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
            <UserPlus className="w-6 h-6 text-heritage-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Sign Up</h1>
            <p className="text-neutral-600">Create your Echoes account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-heritage-500 focus:border-heritage-500 transition-colors"
              placeholder="you@example.com"
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

          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-heritage-700 font-semibold hover:text-heritage-800"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
