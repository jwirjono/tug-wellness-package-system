'use client';

import PackageForm from '@/components/PackageForm';
import { packagesService } from '@/services/packages';
import { CreatePackagePayload } from '@/types/package';

export default function NewPackagePage() {
  const handleSubmit = async (data: CreatePackagePayload) => {
    await packagesService.create(data);
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Package</h1>
      <PackageForm onSubmit={handleSubmit} />
    </main>
  );
}