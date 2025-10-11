/*
 * Entry point for the call center backend service.
 *
 * This file sets up an Express application with a Socket.IO server for
 * real‑time communication. It loads environment variables, configures
 * middleware, and mounts route handlers for authentication, calls,
 * campaigns, supervisor actions, and Telnyx webhook processing.
 */

const http = require('http');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');


// Load environment variables from .env file
dotenv.config();

// Initialize Prisma client (database ORM)
const prisma = new PrismaClient();


// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Helmet secures headers
app.use(helmet());

// Morgan logs requests (method, URL, status, response time)
app.use(morgan('dev'));  // or 'dev' for colored concise logs


// Configure Socket.IO for real‑time updates
const io = new socketIO.Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Helper function to broadcast events to all connected clients
function broadcast(event, payload) {
  io.emit(event, payload);
}

// Middleware configuration
app.use(cors());
app.use(express.json());

// Attach Socket.IO to request for access in routes if needed
app.use((req, res, next) => {
  req.io = io;
  req.broadcast = broadcast;
  next();
});

// Import route modules
const authRouter = require('./routes/auth');
const callRouter = require('./routes/calls');
const campaignRouter = require('./routes/campaign');
const supervisorRouter = require('./routes/supervisor');
const telnyxWebhookRouter = require('./routes/telnyxWebhook');
const numbersRouter = require('./routes/numbers');

// Mount routes
app.use('/api/auth', authRouter(prisma));
app.use('/api/calls', callRouter(prisma));
app.use('/api/campaign', campaignRouter(prisma));
app.use('/api/supervisor', supervisorRouter(prisma));
app.use('/api/telnyx/webhook', telnyxWebhookRouter(prisma));
app.use('/api/numbers', numbersRouter(prisma));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'server is running on 4000' });
});

// Handle errors centrally
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Call center backend listening on port ${PORT}`);
});