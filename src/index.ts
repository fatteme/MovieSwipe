import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import config from './config/environment';
import routes from './routes';
import { connectDB } from './config/database';

const app = express();
const PORT = config.PORT;

app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

app.get('/health', (_, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'MovieSwipe Backend is running',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 MovieSwipe Backend running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
