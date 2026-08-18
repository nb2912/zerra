const storage = require('../services/storage');

// POST /upload — Upload a file to S3
// Requires 'multipart: true' in zerra.config.json features
module.exports.POST = async (ctx) => {
  const files = ctx.files || [];

  if (files.length === 0) {
    ctx.res.status(400).json({ error: 'No file uploaded. Send a multipart/form-data request with a file field.' });
    return;
  }

  const results = [];
  for (const file of files) {
    const result = await storage.upload(file);
    results.push({
      filename: file.filename,
      key: result.key,
      url: result.url,
      size: result.size,
      contentType: result.contentType,
    });
  }

  ctx.res.status(201).json({
    message: `${results.length} file(s) uploaded successfully`,
    files: results,
  });
};

// GET /upload?key=uploads/2026/08/17/abc-file.jpg — Get a presigned download URL
module.exports.GET = async (ctx) => {
  const { key } = ctx.query;

  if (!key) {
    ctx.res.status(400).json({ error: 'Missing "key" query parameter.' });
    return;
  }

  const info = await storage.exists(key);
  if (!info.exists) {
    ctx.res.status(404).json({ error: 'File not found.' });
    return;
  }

  const url = await storage.getPresignedUrl(key);
  ctx.res.json({ key, url, size: info.size, contentType: info.contentType });
};

// DELETE /upload?key=uploads/2026/08/17/abc-file.jpg — Delete a file
module.exports.DELETE = async (ctx) => {
  const { key } = ctx.query;

  if (!key) {
    ctx.res.status(400).json({ error: 'Missing "key" query parameter.' });
    return;
  }

  await storage.remove(key);
  ctx.res.json({ message: 'File deleted successfully', key });
};
