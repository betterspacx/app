import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_BUCKET = process.env.R2_BUCKET_NAME || '';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return s3Client;
}

export function createR2Client() {
  const client = getS3Client();

  async function uploadFile(key: string, body: Uint8Array | string, contentType?: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
    });
    await client.send(command);
  }

  async function downloadFile(key: string): Promise<Uint8Array | null> {
    try {
      const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
      const response = await client.send(command);
      if (!response.Body) return null;
      return new Uint8Array(await response.Body.transformToByteArray());
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NoSuchKey') return null;
      throw err;
    }
  }

  async function downloadFileAsText(key: string): Promise<string | null> {
    const data = await downloadFile(key);
    if (!data) return null;
    return new TextDecoder().decode(data);
  }

  async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key });
    await client.send(command);
  }

  async function listFiles(prefix: string): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;
    do {
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });
      const response = await client.send(command);
      if (response.Contents) {
        for (const obj of response.Contents) {
          if (obj.Key) keys.push(obj.Key);
        }
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return keys;
  }

  async function fileExists(key: string): Promise<boolean> {
    const data = await downloadFile(key);
    return data !== null;
  }

  return { uploadFile, downloadFile, downloadFileAsText, deleteFile, listFiles, fileExists };
}

export type R2Client = ReturnType<typeof createR2Client>;

// Profile operations
export interface UserProfile {
  uid: string;
  username: string;
  provider: 'github' | 'email';
  createdAt: string;
  cloudStorageEnabled: true;
}

export function createProfile(uid: string, username: string, provider: 'github' | 'email'): UserProfile {
  return {
    uid,
    username,
    provider,
    createdAt: new Date().toISOString(),
    cloudStorageEnabled: true,
  };
}

export const STORAGE = {
  profileKey: (uid: string) => `users/${uid}/profile.json`,
  settingsKey: (uid: string) => `users/${uid}/settings.json`,
  projectKey: (uid: string, projectId: string) => `users/${uid}/projects/${projectId}.json`,
  assetKey: (uid: string, filename: string) => `users/${uid}/assets/${filename}`,
  exportKey: (uid: string, filename: string) => `users/${uid}/exports/${filename}`,
};
