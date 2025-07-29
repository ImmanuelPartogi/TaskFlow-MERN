import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext({
  notifications: [],
  joinProjectRoom: () => {},
  sendNewTaskNotification: () => {},
  sendUpdateTaskNotification: () => {},
  sendDeleteTaskNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {}
});

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Perbaikan koneksi Socket.io
  useEffect(() => {
    // Batalkan timer reconnect jika ada
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    
    // Fungsi untuk terhubung ke socket
    const connectSocket = () => {
      if (isAuthenticated) {
        try {
          // Gunakan URL yang benar dari env variable
          const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          console.log('Attempting to connect to socket at:', socketUrl);
          
          // Prioritaskan polling terlebih dahulu (lebih stabil), lalu coba WebSocket
          const newSocket = io(socketUrl, {
            withCredentials: false,
            transports: ['polling', 'websocket'], // Ubah urutan - polling lebih dulu
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            timeout: 10000,
            autoConnect: true
          });
          
          // Simpan referensi socket
          socketRef.current = newSocket;
          setSocket(newSocket);
          
          // Event handlers
          newSocket.on('connect', () => {
            console.log('Socket connected successfully with ID:', newSocket.id);
            setSocketConnected(true);
          });
          
          newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setSocketConnected(false);
          });
          
          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setSocketConnected(false);
            
            // Coba reconnect dengan polling saja jika gagal
            if (newSocket.io._opts.transports.includes('websocket')) {
              console.log('Retrying with polling transport only');
              newSocket.io.opts.transports = ['polling'];
            }
          });
          
          // Setup event listeners untuk notifikasi
          setupNotificationListeners(newSocket);
          
        } catch (error) {
          console.error('Error setting up socket connection:', error);
          setSocketConnected(false);
          
          // Coba reconnect setelah delay
          reconnectTimerRef.current = setTimeout(() => {
            console.log('Attempting to reconnect socket...');
            connectSocket();
          }, 5000);
        }
      }
    };
    
    // Mulai koneksi jika authenticated
    if (isAuthenticated) {
      connectSocket();
    }
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        socketRef.current.off('task added');
        socketRef.current.off('task updated');
        socketRef.current.off('task deleted');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [isAuthenticated]);
  
  // Setup listeners untuk notifikasi
  const setupNotificationListeners = (socket) => {
    if (!socket) return;
    
    // Hapus listener lama untuk menghindari duplikasi
    socket.off('task added');
    socket.off('task updated');
    socket.off('task deleted');
    
    // Tangani notifikasi task baru
    socket.on('task added', (task) => {
      console.log('Received task added notification:', task);
      const notification = {
        id: Date.now(),
        type: 'task_added',
        message: `Task baru telah ditambahkan: ${task.title || 'Untitled'}`,
        task,
        timestamp: new Date()
      };

      setNotifications((prev) => [notification, ...prev]);
    });

    // Tangani notifikasi update task
    socket.on('task updated', (task) => {
      console.log('Received task updated notification:', task);
      const notification = {
        id: Date.now(),
        type: 'task_updated',
        message: `Task telah diperbarui: ${task.title || 'Untitled'}`,
        task,
        timestamp: new Date()
      };

      setNotifications((prev) => [notification, ...prev]);
    });

    // Tangani notifikasi task yang dihapus
    socket.on('task deleted', (taskId) => {
      console.log('Received task deleted notification:', taskId);
      const notification = {
        id: Date.now(),
        type: 'task_deleted',
        message: 'Task telah dihapus',
        taskId,
        timestamp: new Date()
      };

      setNotifications((prev) => [notification, ...prev]);
    });
  };

  // Gabung room project - dengan penanganan error
  const joinProjectRoom = (projectId) => {
    if (socketRef.current && socketConnected) {
      console.log('Joining project room:', projectId);
      socketRef.current.emit('join project', projectId);
    } else {
      console.warn('Socket not connected, cannot join room:', projectId);
      // Coba reconnect dan join nanti
      if (isAuthenticated && !socketRef.current) {
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const newSocket = io(socketUrl, {
          withCredentials: false,
          transports: ['polling', 'websocket'],
        });
        
        socketRef.current = newSocket;
        setSocket(newSocket);
        
        newSocket.on('connect', () => {
          console.log('Socket reconnected successfully, joining room:', projectId);
          newSocket.emit('join project', projectId);
          setSocketConnected(true);
          setupNotificationListeners(newSocket);
        });
      }
    }
  };

  // Kirim notifikasi task baru - dengan penanganan error
  const sendNewTaskNotification = (task) => {
    if (socketRef.current && socketConnected) {
      console.log('Sending new task notification:', task);
      socketRef.current.emit('new task', task);
    } else {
      console.warn('Socket not connected, using local notification for new task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_added',
        message: `Task baru telah ditambahkan: ${task.title || 'Untitled'}`,
        task,
        timestamp: new Date()
      };
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  // Kirim notifikasi update task - dengan penanganan error
  const sendUpdateTaskNotification = (task) => {
    if (socketRef.current && socketConnected) {
      console.log('Sending update task notification:', task);
      socketRef.current.emit('update task', task);
    } else {
      console.warn('Socket not connected, using local notification for updated task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_updated',
        message: `Task telah diperbarui: ${task.title || 'Untitled'}`,
        task,
        timestamp: new Date()
      };
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  // Kirim notifikasi hapus task - dengan penanganan error
  const sendDeleteTaskNotification = (taskId, projectId) => {
    if (socketRef.current && socketConnected) {
      // Memastikan projectId adalah string
      const project = typeof projectId === 'object' ? projectId._id : projectId;
      console.log('Sending delete task notification:', taskId, 'for project:', project);
      socketRef.current.emit('delete task', taskId, project);
    } else {
      console.warn('Socket not connected, using local notification for deleted task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_deleted',
        message: 'Task telah dihapus',
        taskId,
        timestamp: new Date()
      };
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  // Hapus notifikasi
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Hapus semua notifikasi
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        joinProjectRoom,
        sendNewTaskNotification,
        sendUpdateTaskNotification,
        sendDeleteTaskNotification,
        removeNotification,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};