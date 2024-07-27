import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bucket, bucketPaths } from './buckets';
import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private cloudfrontPrivateKey: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: configService.get('S3_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.cloudfrontPrivateKey = configService.get('CDN_PRIVATE_KEY');
  }

  async getPresignedUploadUrl(
    key: string,
    bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA,
    expiresIn: number = 1800,
  ) {
    const bucketPath = bucketPaths[bucket];
    const command = new PutObjectCommand({
      Bucket: this.configService.get(bucket),
      Key: `${bucketPath}/${key}`,
    });
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return signedUrl;
  }

  async getPresignedDeleteUrl(
    key: string,
    bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA,
    expiresIn: number = 1800,
  ) {
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get(bucket),
      Key: key,
    });
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return signedUrl;
  }

  async getPresignedDownloadUrl(
    key: string,
    bucket: Bucket,
    expiresIn: number = 1800,
  ) {
    const cdnDomain = this.configService.get('CDN_DOMAIN');
    const bucketPath = bucketPaths[bucket];
    const url = `${cdnDomain}/${bucketPath}/${key}`;
    const keyPairId = this.configService.get('CDN_KEY_ID');

    const policy = {
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: {
              'AWS:EpochTime':
                Math.trunc(new Date().getTime() / 1000) + expiresIn, // time in seconds
            },
          },
        },
      ],
    };

    const signedUrl = getCloudFrontSignedUrl({
      url,
      policy: JSON.stringify(policy),
      keyPairId,
      privateKey: this.cloudfrontPrivateKey,
    });

    return signedUrl;
  }

  async deleteObject(
    key: string,
    bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA,
  ) {
    const bucketPath = bucketPaths[bucket];
    const command = new DeleteObjectCommand({
      Bucket: this.configService.get(bucket),
      Key: `${bucketPath}/${key}`,
    });
    const response = await this.s3Client.send(command);
    return response;
  }

  async deleteObjects(
    keys: string[],
    bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA,
  ) {
    if (keys.length === 0) {
      return null;
    }
    const command = new DeleteObjectsCommand({
      Bucket: this.configService.get(bucket),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });
    const response = await this.s3Client.send(command);
    return response;
  }

  getObjectUrl(key: string, bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA) {
    const cdnDomain = this.configService.get('CDN_DOMAIN');
    const bucketPath = bucketPaths[bucket];
    const url = `${cdnDomain}/${bucketPath}/${key}`;
    return encodeURI(url);
  }

  async uploadFile(
    fileBuffer: Buffer,
    key: string,
    bucket: Bucket = Bucket.CREATOR_PUBLIC_MEDIA,
  ) {
    const bucketPath = bucketPaths[bucket];
    const command = new PutObjectCommand({
      Bucket: this.configService.get(bucket),
      Key: `${bucketPath}/${key}`,
      Body: fileBuffer,
    });
    return await this.s3Client.send(command);
  }
}
