import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupProfileService } from './setup-profile.service';
import { SetupProfileResolver } from './setup-profile.resolver';
import { S3Module } from '../s3/s3.module';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User]), S3Module],
  providers: [SetupProfileService, SetupProfileResolver],
  exports: [SetupProfileService],
})
export class SetupProfileModule {}
