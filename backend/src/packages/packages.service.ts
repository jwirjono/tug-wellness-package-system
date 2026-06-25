import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageStatus, WellnessPackage } from './package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(WellnessPackage)
    private readonly repo: Repository<WellnessPackage>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findAllActive() {
    return this.repo.find({ where: { status: PackageStatus.ACTIVE } });
  }

  async findOne(id: string) {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return pkg;
  }

  create(dto: CreatePackageDto) {
    const pkg = this.repo.create(dto);
    return this.repo.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.findOne(id);
    Object.assign(pkg, dto);
    return this.repo.save(pkg);
  }

  async remove(id: string) {
    const pkg = await this.findOne(id);
    return this.repo.remove(pkg);
  }
}