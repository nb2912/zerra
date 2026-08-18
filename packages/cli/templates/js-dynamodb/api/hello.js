const db = require('../services/database');

// GET /hello — Test DynamoDB connection
module.exports.GET = async (ctx) => {
  // Example: Scan all items from "items" table
  const items = await db.scan('items');
  ctx.res.json({
    message: 'Hello from Zerra(^-^) DynamoDB is ready.',
    items,
    table: db.tableName('items'),
  });
};

// POST /hello — Create a test item
module.exports.POST = async (ctx) => {
  const { name, value } = ctx.body || {};
  const item = await db.put('items', { name: name || 'test', value: value || 'hello' });
  ctx.res.status(201).json({
    message: 'Item created!',
    item,
  });
};
