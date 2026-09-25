import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚌 AI BusMate Backend Server Running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📡 Client URL: ${config.clientUrl}`);
  console.log(`===============================================`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
});
