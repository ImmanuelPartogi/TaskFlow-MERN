import React, { useContext, useState, useEffect, useRef } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { notifications, removeNotification, clearNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleClearAll = () => {
    clearNotifications();
    setIsOpen(false);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'task_added':
        return `Task baru: "${notification.task?.title || 'Untitled'}" telah ditambahkan`;
      case 'task_updated':
        return `Task "${notification.task?.title || 'Untitled'}" telah diperbarui`;
      case 'task_deleted':
        return 'Task telah dihapus';
      default:
        return 'Notifikasi baru';
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.task && notification.task.project) {
      const projectId = typeof notification.task.project === 'object' 
        ? notification.task.project._id 
        : notification.task.project;
      return `/projects/${projectId}/tasks`;
    }
    return '#';
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'task_added':
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'task_updated':
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        );
      case 'task_deleted':
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Format time string
  const getTimeString = (timestamp) => {
    if (!timestamp) return 'Baru saja';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-500 hover:text-indigo-600 focus:outline-none rounded-full hover:bg-indigo-50 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none transform translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white min-w-[18px] min-h-[18px]">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-100 transform transition-all duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition duration-150 ease-in-out"
              >
                Hapus Semua
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <div className="flex">
                    {getNotificationIcon(notification)}
                    <div className="ml-3 flex-1">
                      <Link
                        to={getNotificationLink(notification)}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition duration-150 ease-in-out"
                        onClick={() => {
                          removeNotification(notification.id);
                          setIsOpen(false);
                        }}
                      >
                        {getNotificationMessage(notification)}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeString(notification.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition duration-150 ease-in-out"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="mt-4 text-gray-500 text-sm">Tidak ada notifikasi</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;