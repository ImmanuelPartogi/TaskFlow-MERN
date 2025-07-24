import React, { useContext, useState } from 'react';
import { NotificationContext } from '../../contexts/NotificationContext';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { notifications, removeNotification, clearNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const handleClearAll = () => {
    clearNotifications();
    setIsOpen(false);
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'task_added':
        return `Task baru: "${notification.task.title}" telah ditambahkan`;
      case 'task_updated':
        return `Task "${notification.task.title}" telah diperbarui`;
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

  return (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-indigo-600 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Notifikasi</h3>
            <button
              onClick={handleClearAll}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Hapus Semua
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-3 border-b hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <Link
                      to={getNotificationLink(notification)}
                      className="text-sm text-gray-700 hover:text-indigo-600"
                      onClick={() => {
                        removeNotification(notification.id);
                        setIsOpen(false);
                      }}
                    >
                      {getNotificationMessage(notification)}
                    </Link>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">
                Tidak ada notifikasi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;