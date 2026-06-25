import { CreatePackagePayload, UpdatePackagePayload, WellnessPackage } from '@/types/package';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const packagesService = {
  getAll: () => request<WellnessPackage[]>('/admin/packages'),

  getOne: (id: string) => request<WellnessPackage>(`/admin/packages/${id}`),

  create: (data: CreatePackagePayload) =>
    request<WellnessPackage>('/admin/packages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdatePackagePayload) =>
    request<WellnessPackage>(`/admin/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/admin/packages/${id}`, { method: 'DELETE' }),
};