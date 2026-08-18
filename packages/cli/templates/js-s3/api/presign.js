const storage = require('../services/storage');

// POST /presign — Get a presigned URL for direct browser-to-S3 uploads
// Body: { filename: "photo.jpg", contentType: "image/jpeg" }
//
// This allows your frontend to upload directly to S3 without
// passing the file through your server — much faster for large files.
module.exports.POST = async (ctx) => {
  const { filename, contentType } = ctx.body || {};

  if (!filename || !contentType) {
    ctx.res.status(400).json({
      error: 'Missing required fields.',
      expected: { filename: 'string', contentType: 'string (e.g. image/jpeg)' },
    });
    return;
  }

  const result = await storage.getPresignedUploadUrl(filename, contentType);

  ctx.res.json({
    uploadUrl: result.uploadUrl,
    key: result.key,
    method: 'PUT',
    instructions: 'PUT the file body to uploadUrl with Content-Type header set to ' + contentType,
  });
};
