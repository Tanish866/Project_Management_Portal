require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    });

    process.on('unhandledRejection', (err) => {
      // eslint-disable-next-line no-console
      console.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();
