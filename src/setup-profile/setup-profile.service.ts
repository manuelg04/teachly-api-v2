import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SetupProfileInput } from './dtos/setup-profile-input';
import { S3Service } from '../s3/s3.service';
import { v4 as uuidv4 } from 'uuid';
import { Bucket } from 'src/s3/buckets';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class SetupProfileService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private s3Service: S3Service,
  ) {}

  async setupProfile(input: SetupProfileInput): Promise<User> {
    let avatarUrl: string | undefined;

    if (input.photo) {
      const fileExtension = this.getFileExtensionFromBase64(input.photo);
      const fileName = `${uuidv4()}.${fileExtension}`;
      const buffer = Buffer.from(input.photo.split(',')[1], 'base64');

      await this.s3Service.uploadFile(
        buffer,
        fileName,
        Bucket.CREATOR_PUBLIC_MEDIA,
      );
      avatarUrl = this.s3Service.getObjectUrl(
        fileName,
        Bucket.CREATOR_PUBLIC_MEDIA,
      );
    }

    const user = this.userRepository.create({
      name: input.name,
      email: input.email, // Asumiendo que el email viene del input o de la autenticación
      avatarUrl: avatarUrl,
      // Otros campos pueden ser establecidos aquí si es necesario
    });

    return await this.userRepository.save(user);
  }

  private getFileExtensionFromBase64(base64String: string): string {
    const match = base64String.match(/^data:image\/(\w+);base64,/);
    return match ? match[1] : 'jpg';
  }
}
