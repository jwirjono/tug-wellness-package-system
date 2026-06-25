import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WellnessPackage } from './package.entity';
import { PackagesService } from './packages.service';
import { AdminPackagesController } from './packages.controller';
import { MobilePackagesController } from './packages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WellnessPackage])],
  providers: [PackagesService],
  controllers: [AdminPackagesController, MobilePackagesController],
})
export class PackagesModule {}