const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

// ─── Configuration ───────────────────────────────────────────────
// Set these in your .env file:
//   AWS_REGION=us-east-1
//   AWS_ACCESS_KEY_ID=your-access-key
//   AWS_SECRET_ACCESS_KEY=your-secret-key
//   DYNAMODB_TABLE_PREFIX=zerra_        (optional)

const rawClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
});

const db = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true, convertEmptyValues: true },
  translateConfig: { marshallOptions: { removeUndefinedValues: true } },
});

const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'zerra_';

// ─── Helper: Resolve table name with prefix ──────────────────────

function tableName(name) {
  return `${TABLE_PREFIX}${name}`;
}

// ─── CRUD Operations ─────────────────────────────────────────────

/**
 * Put (create/overwrite) an item into a table.
 * Auto-generates an 'id' if not provided.
 *
 * @param {string} table - Table name (prefix is added automatically)
 * @param {Object} item - The item to insert
 * @returns {Promise<Object>} The inserted item (with generated id)
 */
async function put(table, item) {
  const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...item };
  await db.send(new PutCommand({
    TableName: tableName(table),
    Item: record,
  }));
  return record;
}

/**
 * Get a single item by primary key.
 *
 * @param {string} table - Table name
 * @param {Object} key - Primary key, e.g. { id: '...' }
 * @returns {Promise<Object|null>}
 */
async function get(table, key) {
  const result = await db.send(new GetCommand({
    TableName: tableName(table),
    Key: key,
  }));
  return result.Item || null;
}

/**
 * Query items using a key condition expression.
 *
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @param {string} options.keyCondition - Key condition expression, e.g. 'userId = :uid'
 * @param {Object} options.values - Expression attribute values, e.g. { ':uid': '123' }
 * @param {string} [options.index] - GSI name (optional)
 * @param {number} [options.limit] - Max items to return
 * @param {boolean} [options.scanForward=true] - Sort ascending (true) or descending (false)
 * @returns {Promise<Object[]>}
 */
async function query(table, { keyCondition, values, index, limit, scanForward = true }) {
  const params = {
    TableName: tableName(table),
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: values,
    ScanIndexForward: scanForward,
  };
  if (index) params.IndexName = index;
  if (limit) params.Limit = limit;

  const result = await db.send(new QueryCommand(params));
  return result.Items || [];
}

/**
 * Scan all items in a table (use sparingly, prefer query).
 *
 * @param {string} table - Table name
 * @param {Object} [options] - Optional filter
 * @param {string} [options.filter] - Filter expression
 * @param {Object} [options.values] - Expression attribute values
 * @param {number} [options.limit] - Max items
 * @returns {Promise<Object[]>}
 */
async function scan(table, options = {}) {
  const params = { TableName: tableName(table) };
  if (options.filter) {
    params.FilterExpression = options.filter;
    params.ExpressionAttributeValues = options.values;
  }
  if (options.limit) params.Limit = options.limit;

  const result = await db.send(new ScanCommand(params));
  return result.Items || [];
}

/**
 * Update specific fields on an item.
 *
 * @param {string} table - Table name
 * @param {Object} key - Primary key, e.g. { id: '...' }
 * @param {Object} updates - Fields to update, e.g. { name: 'New Name', age: 25 }
 * @returns {Promise<Object>} The updated item
 */
async function update(table, key, updates) {
  const entries = Object.entries(updates);
  if (entries.length === 0) return get(table, key);

  // Add updatedAt timestamp
  updates.updatedAt = new Date().toISOString();
  const allEntries = Object.entries(updates);

  const expression = 'SET ' + allEntries.map(([k], i) => `#f${i} = :v${i}`).join(', ');
  const names = {};
  const values = {};
  allEntries.forEach(([k, v], i) => {
    names[`#f${i}`] = k;
    values[`:v${i}`] = v;
  });

  const result = await db.send(new UpdateCommand({
    TableName: tableName(table),
    Key: key,
    UpdateExpression: expression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW',
  }));

  return result.Attributes;
}

/**
 * Delete an item by primary key.
 *
 * @param {string} table - Table name
 * @param {Object} key - Primary key, e.g. { id: '...' }
 */
async function remove(table, key) {
  await db.send(new DeleteCommand({
    TableName: tableName(table),
    Key: key,
  }));
}

module.exports = {
  put,
  get,
  query,
  scan,
  update,
  remove,
  tableName,
  db,           // Raw DynamoDB Document Client for advanced use
  rawClient,    // Raw DynamoDB Client
  TABLE_PREFIX,
};
