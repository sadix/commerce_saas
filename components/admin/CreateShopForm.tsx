'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateShopForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate subdomain from name
    if (name === 'name') {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData({
        name: value,
        subdomain,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const shop = await response.json();
        router.push(`/dashboard/shop/${shop.id}/pages`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create store');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Store Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="My Awesome Store"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
          Subdomain
        </label>
        <div className="flex items-center">
          <input
            id="subdomain"
            name="subdomain"
            type="text"
            value={formData.subdomain}
            onChange={handleChange}
            required
            pattern="[a-z0-9-]+"
            placeholder="my-awesome-store"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
            .baobuy.site
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Only lowercase letters, numbers, and hyphens allowed
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !formData.name || !formData.subdomain}
        className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Creating Store...' : 'Create Store'}
      </button>
    </form>
  );
}