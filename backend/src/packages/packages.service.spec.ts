import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackageCategory, PackageStatus, WellnessPackage } from './package.entity';

const mockPackage: WellnessPackage = {
  id: 'uuid-1',
  name: 'Deep Tissue Massage',
  description: 'A relaxing full-body massage targeting deep muscle layers',
  price: 120,
  duration_minutes: 60,
  category: PackageCategory.SERVICES,
  status: PackageStatus.ACTIVE,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockInactivePackage: WellnessPackage = {
  ...mockPackage,
  id: 'uuid-2',
  name: 'Archived Package',
  status: PackageStatus.INACTIVE,
};

describe('PackagesService', () => {
  let service: PackagesService;
  let repo: jest.Mocked<Repository<WellnessPackage>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackagesService,
        {
          provide: getRepositoryToken(WellnessPackage),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PackagesService>(PackagesService);
    repo = module.get(getRepositoryToken(WellnessPackage));
  });

  afterEach(() => jest.clearAllMocks());

  // ─── findAll ───────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all packages including inactive', async () => {
      repo.find.mockResolvedValue([mockPackage, mockInactivePackage]);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith();
      expect(result).toHaveLength(2);
    });
  });

  // ─── findAllActive ─────────────────────────────────────────
  describe('findAllActive', () => {
    it('should return only active packages', async () => {
      repo.find.mockResolvedValue([mockPackage]);

      const result = await service.findAllActive();

      expect(repo.find).toHaveBeenCalledWith({
        where: { status: PackageStatus.ACTIVE },
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(PackageStatus.ACTIVE);
    });
  });

  // ─── findOne ───────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a package when found', async () => {
      repo.findOne.mockResolvedValue(mockPackage);

      const result = await service.findOne('uuid-1');

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(mockPackage);
    });

    it('should throw NotFoundException when package does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Package non-existent not found'),
      );
    });
  });

  // ─── create ────────────────────────────────────────────────
  describe('create', () => {
    it('should create and return a new package', async () => {
      const dto = {
        name: 'New Package',
        description: 'A brand new wellness package',
        price: 80,
        duration_minutes: 45,
        category: PackageCategory.PRODUCT,
      };

      repo.create.mockReturnValue({ ...mockPackage, ...dto });
      repo.save.mockResolvedValue({ ...mockPackage, ...dto });

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.name).toBe('New Package');
    });
  });

  // ─── update ────────────────────────────────────────────────
  describe('update', () => {
    it('should update and return the package', async () => {
      const dto = { price: 150 };
      const updated = { ...mockPackage, price: 150 };

      repo.findOne.mockResolvedValue(mockPackage);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-1', dto);

      expect(result.price).toBe(150);
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when updating a non-existent package', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { price: 150 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────
  describe('remove', () => {
    it('should remove and return the deleted package', async () => {
      repo.findOne.mockResolvedValue(mockPackage);
      repo.remove.mockResolvedValue(mockPackage);

      const result = await service.remove('uuid-1');

      expect(repo.remove).toHaveBeenCalledWith(mockPackage);
      expect(result).toEqual(mockPackage);
    });

    it('should throw NotFoundException when deleting a non-existent package', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});