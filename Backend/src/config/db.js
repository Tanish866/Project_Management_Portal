const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI provided in the environment variables.
 * Exits the process if the connection fails (except in test env, where the
 * test runner manages the connection lifecycle itself).
 */
const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(mongoUri);

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  return conn;
};

module.exports = connectDB;
