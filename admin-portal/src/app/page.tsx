'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { packagesService } from '@/services/packages';
import { WellnessPackage } from '@/types/package';

export default function HomePage() {
  const [packages, setPackages] = useState<WellnessPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPackages = async () => {
    try {
      const data = await packagesService.getAll();
      setPackages(data);
    } catch {
      setError('Failed to load packages.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    await packagesService.delete(id);
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => { fetchPackages(); }, []);

  if (loading) return <p className="p-8 text-gray-500">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wellness Packages</h1>
        <Link
          href="/packages/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Package
        </Link>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3">Price</th>
            <th className="p-3">Duration</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id} className="border-t hover:bg-gray-50">
              <td className="p-3 font-medium">{pkg.name}</td>
              <td className="p-3">{pkg.category}</td>
              <td className="p-3">${Number(pkg.price).toFixed(2)}</td>
              <td className="p-3">{pkg.duration_minutes} min</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  pkg.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {pkg.status}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <Link
                  href={`/packages/${pkg.id}/edit`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {packages.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-400">
                No packages yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}