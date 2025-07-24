import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';

// Definisikan context di dalam file yang sama
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

  // PERBAIKAN: Menggunakan URL dan konfigurasi yang benar untuk socket.io
  useEffect(() => {
    let newSocket = null;
    
    const connectSocket = () => {
      if (isAuthenticated) {
        try {
          // Gunakan URL server yang sesuai
          // Pastikan ini sesuai dengan URL dimana server socket.io Anda berjalan
          const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          
          console.log('Attempting to connect to socket at:', socketUrl);
          
          // Tambahkan opsi konfigurasi untuk mengatasi masalah CORS
          newSocket = io(socketUrl, {
            withCredentials: false,
            transports: ['polling', 'websocket'], // Polling terlebih dahulu, lalu websocket
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000
          });
          
          // Tambahkan listener untuk event connect dan error
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
            
            // Gunakan notifikasi lokal saja
            console.warn('Using local notifications only due to connection error');
          });
          
          setSocket(newSocket);
        } catch (error) {
          console.error('Error setting up socket connection:', error);
          setSocketConnected(false);
        }
      }
    };
    
    connectSocket();
    
    return () => {
      if (newSocket) {
        console.log('Disconnecting socket');
        newSocket.disconnect();
        setSocketConnected(false);
      }
    };
  }, [isAuthenticated]);

  // Tangani notifikasi
  useEffect(() => {
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
        task
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
        task
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
        taskId
      };

      setNotifications((prev) => [notification, ...prev]);
    });
  }, [socket]);

  // Gabung room project - dengan penanganan error
  const joinProjectRoom = (projectId) => {
    if (socket && socketConnected) {
      console.log('Joining project room:', projectId);
      socket.emit('join project', projectId);
    } else {
      console.warn('Socket not connected, cannot join room:', projectId);
    }
  };

  // Kirim notifikasi task baru - dengan penanganan error
  const sendNewTaskNotification = (task) => {
    if (socket && socketConnected) {
      console.log('Sending new task notification:', task);
      socket.emit('new task', task);
    } else {
      console.warn('Socket not connected, using local notification for new task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_added',
        message: `Task baru telah ditambahkan: ${task.title || 'Untitled'}`,
        task
      };
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  // Kirim notifikasi update task - dengan penanganan error
  const sendUpdateTaskNotification = (task) => {
    if (socket && socketConnected) {
      console.log('Sending update task notification:', task);
      socket.emit('update task', task);
    } else {
      console.warn('Socket not connected, using local notification for updated task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_updated',
        message: `Task telah diperbarui: ${task.title || 'Untitled'}`,
        task
      };
      setNotifications((prev) => [notification, ...prev]);
    }
  };

  // Kirim notifikasi hapus task - dengan penanganan error
  const sendDeleteTaskNotification = (taskId, projectId) => {
    if (socket && socketConnected) {
      // Memastikan projectId adalah string
      const project = typeof projectId === 'object' ? projectId._id : projectId;
      console.log('Sending delete task notification:', taskId, 'for project:', project);
      socket.emit('delete task', taskId, project);
    } else {
      console.warn('Socket not connected, using local notification for deleted task');
      // Tambahkan notifikasi lokal
      const notification = {
        id: Date.now(),
        type: 'task_deleted',
        message: 'Task telah dihapus',
        taskId
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