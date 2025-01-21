import { createContext } from 'react';
import { io } from 'socket.io-client';

// Function to get the token from local storage (or wherever you store it)
const getToken = () => {
    console.log(localStorage.getItem('token'));
    const token = localStorage.getItem('token');
  return token; // Adjust this based on your implementation

};

// Create WebSocket connection with authentication
export const socket = io('172.20.30.10:5000', {

  auth: {
    token: getToken(), // Pass the token in the auth object
  },
});

export const WebsocketContext = createContext(socket);
export const WebsocketProvider = WebsocketContext.Provider;