export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PackageCategory {
  PRODUCT = 'PRODUCT',
  SERVICES = 'SERVICES',
  PACKAGE = 'PACKAGE',
}

export interface WellnessPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  status: PackageStatus;
  category: PackageCategory;
  created_at: string;
  updated_at: string;
}

export type CreatePackagePayload = Omit<WellnessPackage, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePackagePayload = Partial<CreatePackagePayload>;