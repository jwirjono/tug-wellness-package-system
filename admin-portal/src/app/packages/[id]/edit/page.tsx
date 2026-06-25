'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PackageForm from '@/components/PackageForm';
import { packagesService } from '@/services/packages';
import { CreatePackagePayload, WellnessPackage } from '@/types/package';

export default function EditPackagePage() {
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<WellnessPackage | null>(null);

  useEffect(() => {
    packagesService.getOne(id).then(setPkg);
  }, [id]);

  const handleSubmit = async (data: CreatePackagePayload) => {
    await packagesService.update(id, data);
  };

  if (!pkg) return <p className="p-8 text-gray-500">Loading...</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Package</h1>
      <PackageForm initial={pkg} onSubmit={handleSubmit} />
    </main>
  );
}