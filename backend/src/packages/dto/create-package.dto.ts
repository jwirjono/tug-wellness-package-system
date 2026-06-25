import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { PackageCategory, PackageStatus } from '../package.entity';

export class CreatePackageDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  duration_minutes: number;

  @IsEnum(PackageCategory)
  category: PackageCategory;

  @IsOptional()
  @IsEnum(PackageStatus)
  status?: PackageStatus;
}