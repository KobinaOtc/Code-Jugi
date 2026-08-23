import express, { Application } from 'express';
import http from 'http'; // <-- Import the native http module
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import problemRoutes from './routes/problem.routes';
import { initSocket } from './services/socket.service'; // <-- Import our new service
import submissionRoutes from './routes/submission.routes';

// Load environment variables
dotenv.config();

// Initialize Express
const app: Application = express();
// Wrap Express in an HTTP server for Socket.io
const server = http.createServer(app); 

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/submissions', submissionRoutes);

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

const PORT = process.env.PORT || 5000;

// Initialize WebSockets first, THEN start listening for HTTP traffic
initSocket(server).then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize WebSockets:', err);
  process.exit(1);
});