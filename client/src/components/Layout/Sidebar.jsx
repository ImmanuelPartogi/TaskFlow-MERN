import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onToggle, initialCollapsed }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(initialCollapsed || false);
  
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Panggil prop onToggle jika tersedia
    if (typeof onToggle === 'function') {
      onToggle(newCollapsedState);
    }
  };

  // Sinkronkan state sidebar dengan prop initialCollapsed
  useEffect(() => {
    if (initialCollapsed !== undefined && initialCollapsed !== collapsed) {
      setCollapsed(initialCollapsed);
    }
  }, [initialCollapsed]);

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    {
      path: '/projects',
      name: 'Projects',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>
      )
    },
    // {
    //   path: '/tasks',
    //   name: 'Tugas Saya',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
    //     </svg>
    //   )
    // },
    // {
    //   path: '/calendar',
    //   name: 'Kalender',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    //     </svg>
    //   )
    // },
    // {
    //   path: '/team',
    //   name: 'Tim',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
    //     </svg>
    //   )
    // }
  ];

  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out transform ${collapsed ? 'w-20' : 'w-64'} pt-16 bg-white border-r border-gray-200 hidden md:block`}>
      <div className="h-full px-3 py-6 overflow-y-auto">
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white text-gray-500 hover:text-indigo-600 rounded-full p-1.5 shadow-md border border-gray-200 focus:outline-none"
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <ul className="space-y-2 mt-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} p-2.5 text-base font-medium rounded-lg ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } transition duration-300`}
              >
                <div className={`${collapsed ? '' : 'mr-3'}`}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* {!collapsed && (
          <div className="mt-10 pt-6 border-t border-gray-200">
            <div className="px-3 py-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Tingkatkan ke Pro</h3>
              <p className="text-xs text-gray-600 mb-3">Akses fitur premium untuk meningkatkan produktivitas tim Anda</p>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition duration-300">
                Upgrade Sekarang
              </button>
            </div>
          </div>
        )} */}
      </div>
    </aside>
  );
};

export default Sidebar;