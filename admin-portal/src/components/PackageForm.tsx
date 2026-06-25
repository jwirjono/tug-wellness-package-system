'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePackagePayload, PackageCategory, PackageStatus, WellnessPackage } from '@/types/package';

interface Props {
  initial?: WellnessPackage;
  onSubmit: (data: CreatePackagePayload) => Promise<void>;
}

export default function PackageForm({ initial, onSubmit }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreatePackagePayload>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: Number(initial?.price ?? 0),
    duration_minutes: Number(initial?.duration_minutes ?? 30),
    category: initial?.category ?? PackageCategory.SERVICES,
    status: initial?.status ?? PackageStatus.ACTIVE,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'duration_minutes' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      router.push('/');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const label = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className={label}>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required minLength={2} className={field} />
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={field} />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className={label}>Price ($)</label>
          <input name="price" type="number" min={0} step={0.01} value={form.price} onChange={handleChange} required className={field} />
        </div>
        <div className="flex-1">
          <label className={label}>Duration (minutes)</label>
          <input name="duration_minutes" type="number" min={0} value={form.duration_minutes} onChange={handleChange} required className={field} />
        </div>
      </div>

      <div>
        <label className={label}>Category</label>
        <select name="category" value={form.category} onChange={handleChange} className={field}>
          {Object.values(PackageCategory).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Status</label>
        <select name="status" value={form.status} onChange={handleChange} className={field}>
          <option value={PackageStatus.ACTIVE}>Active</option>
          <option value={PackageStatus.INACTIVE}>Inactive</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={() => router.push('/')} className="px-5 py-2 rounded border hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}