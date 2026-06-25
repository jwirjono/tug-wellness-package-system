import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PackageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PackageCategory {
  PRODUCT = 'PRODUCT',
  SERVICES = 'SERVICES',
  PACKAGE = 'PACKAGE',
}

@Entity('wellness_packages')
export class WellnessPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  duration_minutes: number;

  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.ACTIVE })
  status: PackageStatus;

  @Column({ type: 'enum', enum: PackageCategory })
  category: PackageCategory;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}