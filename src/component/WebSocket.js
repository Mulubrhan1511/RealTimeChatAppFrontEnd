import React, { useContext, useEffect, useState } from 'react';
import { WebsocketContext } from '../contexts/WebsocketContext';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router for navigation

export const WebSocket = () => {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState([]);
  const socket = useContext(WebsocketContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null); // State for logged-in user ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      return socket.emit('getMessages');
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://172.20.30.10:5000/user'); // Include 'http://'
        const fetchedUsers = await response.json();
        console.log('Fetched users:', fetchedUsers);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchMessages();
    fetchUsers();

    socket.on('connect', () => {
      console.log('Connected to the server');
    });

    // Listen for the authenticated event to get the user ID
    socket.on('authenticated', (data) => {
      console.log('Authenticated User ID:', data.userId);
      setLoggedInUserId(data.userId); // Set the logged-in user ID
    });

    socket.on('onMessages', (allMessages) => {
      console.log('All messages received from the server:', allMessages);
      setMessages(allMessages);
    });

    socket.on('onMessage', (newMessage) => {
      console.log('New message received:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    
      // Show browser notification
      if (Notification.permission === 'granted') {
        const senderName = newMessage.sender?.username || 'Unknown User';
        const notification = new Notification('New Message', {
          body: `Message from ${senderName}: ${newMessage.content}`,
        });
    
        // On click, navigate to the message details for the sender
        notification.onclick = () => {
          const sender = users.find((user) => user.id === newMessage.sender.id);
          if (sender) {
            setSelectedUser(sender);
            navigate(`/messages/${sender.id}`); // Assuming a route like /messages/:id
    
            // Bring the browser to the front
            if (document.visibilityState === 'hidden') {
              window.focus();
            }
          }
        };
      }
    });
    

    return () => {
      socket.off('connect');
      socket.off('authenticated'); // Clean up the listener
      socket.off('onMessages');
      socket.off('onMessage');
    };
  }, [socket, users, navigate]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const onSubmit = () => {
    if (!selectedUser) {
      alert('Please select a user to send a message to.');
      return;
    }

    const receiverId = selectedUser.id; // Send message to the selected user
    socket.emit('newMessage', { receiverId, content: value });
    setValue('');
  };

  const filteredMessages = selectedUser
    ? messages.filter(
        (message) =>
          (message.sender && message.sender.id === loggedInUserId && message.receiver && message.receiver.id === selectedUser.id) ||
          (message.sender && message.sender.id === selectedUser.id && message.receiver && message.receiver.id === loggedInUserId)
      )
    : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Users Section */}
      <div className="w-1/3 bg-white shadow-lg p-4">
        <h2 className="text-2xl font-bold text-blue-500 mb-4">Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">No users available</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded-lg mb-2 cursor-pointer ${
                selectedUser?.id === user.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <p className="text-lg font-semibold text-gray-800">{user.username}</p>
              <p className="text-sm text-gray-600">ID: {user.id}</p>
            </div>
          ))
        )}
      </div>

      {/* Messages Section */}
      <div className="w-2/3 flex flex-col bg-gray-50">
        <div className="p-4 flex-grow overflow-y-auto">
          <h2 className="text-2xl font-bold text-blue-500 mb-4">Messages</h2>
          {selectedUser ? (
            filteredMessages.length === 0 ? (
              <p className="text-gray-500">No messages with {selectedUser.username}</p>
            ) : (
              filteredMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg mb-2 ${
                    message.sender?.id === loggedInUserId ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                >
                  <p className="text-gray-800">{message.content}</p>
                  <p className="text-sm text-gray-600">
                    <strong>From:</strong> {message.sender?.firstName || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>To:</strong> {message.receiver?.firstName || 'Unknown'}
                  </p>
                </div>
              ))
            )
          ) : (
            <p className="text-gray-500">Select a user to view messages</p>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <h2 className="text-xl font-semibold text-blue-500 mb-2">Send a Message</h2>
          <div className="flex items-center">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter your message"
              className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={onSubmit}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
