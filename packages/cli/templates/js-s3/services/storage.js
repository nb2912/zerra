const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────────
// Set these in your .env file:
//   AWS_REGION=us-east-1
//   AWS_ACCESS_KEY_ID=your-access-key
//   AWS_SECRET_ACCESS_KEY=your-secret-key
//   S3_BUCKET=your-bucket-name
//   S3_PREFIX=uploads/          (optional, default: 'uploads/')

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const BUCKET = process.env.S3_BUCKET || '';
const PREFIX = process.env.S3_PREFIX || 'uploads/';

if (!BUCKET) {
  console.warn('⚠️  S3_BUCKET is not set. File uploads will fail until configured.');
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Generate a unique, collision-free S3 key for a file.
 * Format: uploads/2026/08/17/a1b2c3d4-originalname.jpg
 */
function generateKey(originalFilename) {
  const now = new Date();
  const datePrefix = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
  const id = crypto.randomUUID().slice(0, 8);
  const sanitized = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${PREFIX}${datePrefix}/${id}-${sanitized}`;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Upload a file to S3.
 * @param {Object} file - A Zerra file object from req.files (has tmpPath, filename, mimetype)
 * @param {Object} [options] - Optional overrides
 * @param {string} [options.key] - Custom S3 key (auto-generated if omitted)
 * @param {string} [options.contentType] - MIME type override
 * @param {Object} [options.metadata] - Custom metadata to attach
 * @returns {Promise<{key: string, url: string, bucket: string, size: number}>}
 */
async function upload(file, options = {}) {
  const key = options.key || generateKey(file.filename || 'file');
  const contentType = options.contentType || file.mimetype || 'application/octet-stream';

  // Read file from the tmp path that Zerra's multipart parser created
  const body = fs.readFileSync(file.tmpPath);

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: options.metadata || {},
  }));

  // Clean up the temp file
  try { fs.unlinkSync(file.tmpPath); } catch (e) {}

  return {
    key,
    bucket: BUCKET,
    url: `https://${BUCKET}.s3.amazonaws.com/${key}`,
    size: body.length,
    contentType,
  };
}

/**
 * Upload a raw buffer or string to S3.
 * @param {Buffer|string} body - The content to upload
 * @param {string} filename - Original filename (for key generation)
 * @param {Object} [options] - Optional overrides
 * @returns {Promise<{key: string, url: string, bucket: string, size: number}>}
 */
async function uploadBuffer(body, filename, options = {}) {
  const key = options.key || generateKey(filename);
  const contentType = options.contentType || 'application/octet-stream';
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: options.metadata || {},
  }));

  return {
    key,
    bucket: BUCKET,
    url: `https://${BUCKET}.s3.amazonaws.com/${key}`,
    size: buffer.length,
    contentType,
  };
}

/**
 * Get a presigned URL for downloading a file (time-limited access).
 * @param {string} key - The S3 object key
 * @param {number} [expiresIn=3600] - URL validity in seconds (default: 1 hour)
 * @returns {Promise<string>} The presigned URL
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }), { expiresIn });
}

/**
 * Get a presigned URL for uploading directly from the client (browser).
 * @param {string} filename - The desired filename
 * @param {string} contentType - Expected MIME type
 * @param {number} [expiresIn=600] - URL validity in seconds (default: 10 min)
 * @returns {Promise<{uploadUrl: string, key: string}>}
 */
async function getPresignedUploadUrl(filename, contentType, expiresIn = 600) {
  const key = generateKey(filename);
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  }), { expiresIn });

  return { uploadUrl, key };
}

/**
 * Delete a file from S3.
 * @param {string} key - The S3 object key
 */
async function remove(key) {
  await client.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}

/**
 * Check if a file exists in S3.
 * @param {string} key - The S3 object key
 * @returns {Promise<{exists: boolean, size?: number, contentType?: string}>}
 */
async function exists(key) {
  try {
    const head = await client.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
    return {
      exists: true,
      size: head.ContentLength,
      contentType: head.ContentType,
      lastModified: head.LastModified,
    };
  } catch (e) {
    if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    throw e;
  }
}

module.exports = {
  upload,
  uploadBuffer,
  getPresignedUrl,
  getPresignedUploadUrl,
  remove,
  exists,
  client,    // Expose the raw S3Client for advanced use
  BUCKET,
  PREFIX,
};
