process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Starts an in-memory MongoDB instance and connects mongoose to it.
 * Should be called once per test file inside beforeAll().
 */
const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

/**
 * Drops all collections. Call inside afterEach() to isolate tests.
 */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};

/**
 * Disconnects mongoose and stops the in-memory server.
 * Should be called once per test file inside afterAll().
 */
const closeTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { connectTestDB, clearTestDB, closeTestDB };
