import { io } from 'socket.io-client';

const api = import.meta.env.VITE_API_URL.replace(/\/api$/, '');

export const socket = io(api, {
  path        : '/socket.io',
  transports  : ['websocket', 'polling'],
  autoConnect : false,
  withCredentials : true,
});

export const connectSocket = () => {
  socket.auth = { token: localStorage.getItem('token') };
  if (!socket.connected) socket.connect();
};
