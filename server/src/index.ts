import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database';
import userRoutes from './routes/userRoutes';
import groupRoutes from './routes/groupRoutes';
import eventRoutes from './routes/eventRoutes';
import friendshipRoutes from './routes/friendshipRoutes';
import applicationRoutes from './routes/applicationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PeerSync API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      groups: '/api/groups',
      events: '/api/events',
      friendships: '/api/friendships',
      applications: '/api/applications'
    },
    documentation: 'See DATABASE_SETUP.md for full API documentation'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/friendships', friendshipRoutes);
app.use('/api/applications', applicationRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('Server error:', error);
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
