export enum Bucket {
  CREATOR_PUBLIC_MEDIA = 'CREATOR_PUBLIC_MEDIA',
  CREATOR_PRIVATE_MEDIA = 'CREATOR_PRIVATE_MEDIA',
}

export const bucketPaths = {
  [Bucket.CREATOR_PUBLIC_MEDIA]: 'creator_public',
  [Bucket.CREATOR_PRIVATE_MEDIA]: 'creator_private',
};
