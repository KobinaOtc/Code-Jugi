import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';

export const initSocket = async (httpServer: HttpServer) => {
  // 1. Initialize Socket.io with CORS
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // We will restrict this to your Next.js URL in production
      methods: ['GET', 'POST']
    }
  });

  // 2. Setup Redis Pub/Sub Clients
  const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
  subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

  // 3. Connect to Redis
  await Promise.all([pubClient.connect(), subClient.connect()]);

  // 4. Attach the Redis Adapter to Socket.io
  io.adapter(createAdapter(pubClient, subClient));

  // 5. Handle Client Connections
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // The client will emit this event when they submit code
    socket.on('subscribe_submission', (submissionId: string) => {
      socket.join(submissionId);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${submissionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  console.log('WebSocket & Redis Adapter initialized');
  return io;
};