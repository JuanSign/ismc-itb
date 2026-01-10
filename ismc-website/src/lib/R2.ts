import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.R2_ACCOUNT_ID ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET_NAME
) {
  throw new Error("Cloudflare R2 environment variables are not set.");
}

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const R2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function getSignedUrlForR2(key: string | null) {
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(R2, command, { expiresIn: 3600 });
}

export const getPresignedUploadUrl = async (
  folder: string,
  fileName: string,
  fileType: string,
  account_id: string
) => {
  const extension = fileName.split(".").pop();
  const uniqueKey = `${folder}/${account_id}-${Date.now()}.${extension}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: uniqueKey,
    ContentType: fileType,
  });
  
  const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });
  
  return { signedUrl, key: uniqueKey };
};

// LEGACY CODE
export const uploadFileToR2 = async (file: File, folder: string, account_id: string) => {
  if (!file || file.size === 0) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop();
  const filename = `${folder}/${account_id}.${extension}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );
  return filename;
};