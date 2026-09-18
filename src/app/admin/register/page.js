'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Admin successfully registered in MongoDB! Redirecting...');
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Register New Admin</h2>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/40 p-3 rounded border border-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-green-400 bg-green-900/40 p-3 rounded border border-green-500">
            {success}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Admin ID</label>
          <input
            type="text"
            name="adminId"
            required
            value={formData.adminId}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder="e.g. 100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder="Kamran Admin"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder="admin@kamransports.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? 'Saving to Database...' : 'Register Admin'}
        </button>
      </form>
    </div>
  );
}