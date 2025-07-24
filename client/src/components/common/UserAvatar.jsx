import React from 'react';

const UserAvatar = ({ user, size = 'md', showName = true }) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return 'h-6 w-6 text-xs';
      case 'lg': return 'h-12 w-12 text-base';
      default: return 'h-10 w-10 text-sm';
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="flex items-center">
      <div className={`${getSize()} rounded-full bg-indigo-600 flex items-center justify-center mr-2`}>
        <span className="text-white font-medium">
          {getInitial(user?.name)}
        </span>
      </div>
      {showName && (
        <div>
          <div className="font-medium">{user?.name || 'Tidak diketahui'}</div>
          {user?.email && <div className="text-sm text-gray-500">{user.email}</div>}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;