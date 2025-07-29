import React from 'react';

const UserAvatar = ({ user, size = 'md', showName = true }) => {
  const getSize = () => {
    switch (size) {
      case 'xs': return 'h-5 w-5 text-xs';
      case 'sm': return 'h-7 w-7 text-xs';
      case 'lg': return 'h-12 w-12 text-base';
      case 'xl': return 'h-16 w-16 text-xl';
      default: return 'h-10 w-10 text-sm';
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // Generate a consistent color based on the user name
  const getRandomColor = (name) => {
    if (!name) return 'bg-gray-500';
    
    // Simple hash function
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    
    // List of gradient classes
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-blue-500 to-indigo-600',
      'from-green-500 to-teal-600',
      'from-yellow-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-purple-500 to-indigo-600',
      'from-red-500 to-pink-600',
      'from-teal-500 to-green-600'
    ];
    
    return `bg-gradient-to-br ${gradients[hash % gradients.length]}`;
  };

  return (
    <div className="flex items-center">
      <div className={`${getSize()} rounded-full ${getRandomColor(user?.name)} flex items-center justify-center mr-2 shadow-md flex-shrink-0`}>
        <span className="text-white font-medium">
          {getInitial(user?.name)}
        </span>
      </div>
      {showName && (
        <div className="overflow-hidden">
          <div className="font-medium text-gray-800 truncate">{user?.name || 'Tidak diketahui'}</div>
          {user?.email && <div className="text-sm text-gray-500 truncate">{user.email}</div>}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;