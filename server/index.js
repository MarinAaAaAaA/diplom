import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs/promises';
import cron from 'node-cron';

import sequelize from './db.js';
import router from './router/index.js';
import sslService from './services/sslCertificateService.js';
import tokenService from './services/tokenService.js';
import ChatService from './services/chatService.js';

const PORT = process.env.PORT || 4444;
const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const __dirname = path.resolve();
await fs.mkdir(path.join(__dirname, 'uploads', 'issued'), { recursive: true });
await fs.mkdir(path.join(__dirname, 'uploads', 'stock'), { recursive: true });
await fs.mkdir(path.join(__dirname, 'uploads', 'variants'), { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', router);
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: { origin: CLIENT, credentials: true },
});

io.use((socket, next) => {
  try {
    const { token } = socket.handshake.auth;
    const user = tokenService.validateAccessToken(token);
    if (!user) return next(new Error('Unauthorized'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const { id: userId, role } = socket.user;
  if (role === 'operator') socket.join('operators');
  socket.on('joinRoom', ({ room }) => socket.join(room));
  socket.on('joinChat', async ({ chatId }) => {
    socket.join(`chat_${chatId}`);
    if (role === 'operator') {
      try {
        const messages = await ChatService.openOperatorChat(chatId);

        io.to('operators').emit('chatUpdated', {
          chatId,
          status: 'process',
          lastMessage: messages.at(-1) ?? null,
        });
      } catch (err) {
        console.error('joinChat error:', err);
      }
    }
  });

  socket.on('userMessage', async ({ content }) => {
    const { chat } = await ChatService.ensureChat(userId, true);
    socket.join(`chat_${chat.id}`);

    const userMsg = await ChatService.addMessage(
      chat.id,
      'user',
      userId,
      content
    );
    io.to(`chat_${chat.id}`).emit('message', userMsg);

    const plainChat = {
      id: chat.id,
      userId: chat.userId,
      status: 'register',
      Messages: [userMsg],
    };

    if (chat.status === 'register') {
      const ack = await ChatService.addMessage(
        chat.id,
        'operator',
        null,
        ChatService.autoAck()
      );
      io.to(`chat_${chat.id}`).emit('message', ack);

      plainChat.Messages = [ack];
      io.to('operators').emit('newChat', plainChat);
    } else {
      io.to('operators').emit('chatUpdated', {
        chatId: chat.id,
        status: 'register',
        lastMessage: userMsg,
      });
    }
  });

  socket.on('operatorMessage', async ({ chatId, content }) => {
    const opMsg = await ChatService.operatorSend(chatId, userId, content);
    io.to(`chat_${chatId}`).emit('message', opMsg);

    io.to('operators').emit('chatUpdated', {
      chatId,
      status: 'process',
      lastMessage: opMsg,
    });
  });

  socket.on('closeChat', async ({ chatId }) => {
    await ChatService.closeChat(chatId);
    io.to(`chat_${chatId}`).emit('chatClosed', { chatId });

    io.to('operators').emit('chatUpdated', {
      chatId,
      status: 'closed',
      lastMessage: null,
    });
  });
});

cron.schedule('0 0 0 * * *', async () => {
  await sslService.markThreshold();
  await sslService.revokeExpired();
});

await sequelize.authenticate();
await sequelize.sync();
server.listen(PORT, () =>
  console.log(`🚀  HTTP + Socket.IO listening on ${PORT}`)
);
