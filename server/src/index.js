import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  // Bind the port immediately so Render/Vercel health checks and the /api/health
  // endpoint respond even when MongoDB is unreachable (requests needing the DB
  // fail fast via the connectDB middleware instead of the whole process hanging).
  app.listen(env.PORT, () => {
    console.log(`🚀 API server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`   CORS origin:  ${env.CLIENT_URL}`);
  });

  try {
    await connectDB();
  } catch (error) {
    console.error('❌ MongoDB connection failed at startup:', error.message);
    console.error('   API routes will retry the connection per request.');
  }
}

start();

export default app;
