import React, { useState, useEffect } from 'react';
import { searchUserByEmail, checkApiConnection } from '../../services/userService';
import UserAvatar from '../common/UserAvatar';
import Alert from '../common/Alert';

const MemberSelector = ({ selectedMembers, onChange, currentOwner }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedMemberUsers, setSelectedMemberUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkApiConnection();
      setConnectionStatus(status);
      
      if (!status.connected) {
        setError('Tidak dapat terhubung ke server. Fitur pencarian anggota mungkin tidak berfungsi.');
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (searchEmail === '') {
      setFoundUser(null);
    }
  }, [searchEmail]);

  useEffect(() => {
    setSelectedMemberUsers(selectedMembers.map(id => ({
      _id: id,
      name: `Member ${id.substring(0, 5)}...`,
      email: "Loading..."
    })));
  }, [selectedMembers]);

  const handleSearchUser = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchEmail) {
      setError('Masukkan email untuk mencari pengguna');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail)) {
      setError('Format email tidak valid');
      return;
    }
    
    if (currentOwner && currentOwner.email === searchEmail) {
      setError('Pengguna sudah menjadi owner project');
      return;
    }
    
    const isAlreadyMember = selectedMemberUsers.some(
      member => member?.email === searchEmail
    );
    
    if (isAlreadyMember) {
      setError('Pengguna sudah menjadi anggota project');
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      console.log('Searching for user with email:', searchEmail);
      const user = await searchUserByEmail(searchEmail);
      
      console.log('Found user:', user);
      setFoundUser(user);
      setIsSearching(false);
    } catch (err) {
      console.error('Error during user search:', err);
      setError(err.msg || 'Pengguna tidak ditemukan');
      setFoundUser(null);
      setIsSearching(false);
    }
  };

  const handleAddMember = () => {
    if (foundUser && !selectedMembers.includes(foundUser._id)) {
      const newMembers = [...selectedMembers, foundUser._id];
      onChange(newMembers);
      
      setSelectedMemberUsers([...selectedMemberUsers, foundUser]);
      
      setSearchEmail('');
      setFoundUser(null);
    }
  };

  const handleRemoveMember = (userId) => {
    const newMembers = selectedMembers.filter(id => id !== userId);
    onChange(newMembers);
    setSelectedMemberUsers(selectedMemberUsers.filter(user => user._id !== userId));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchUser();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Anggota Project</h3>
        
        {connectionStatus && !connectionStatus.connected && (
          <div className="mb-4">
            <Alert
              type="warning"
              message="Koneksi ke server bermasalah. Fitur pencarian anggota mungkin tidak berfungsi dengan baik."
              onClose={() => setConnectionStatus(null)}
            />
          </div>
        )}
        
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Owner</h4>
          {currentOwner ? (
            <UserAvatar user={currentOwner} />
          ) : (
            <div className="text-gray-500 flex items-center">
              <div className="animate-pulse h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
              <div>Loading owner...</div>
            </div>
          )}
        </div>

        {selectedMemberUsers.length > 0 && (
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Anggota Terpilih ({selectedMemberUsers.length})
            </h4>
            <div className="space-y-3">
              {selectedMemberUsers.map(member => (
                <div key={member._id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition duration-300">
                  <UserAvatar user={member} />
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-500 hover:text-red-700 transition duration-300 bg-red-50 hover:bg-red-100 p-2 rounded-lg"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Tambah Anggota</h4>
        
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}
        
        <div className="mb-5">
          <div className="flex shadow-md rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Cari berdasarkan email..."
              className="flex-1 border-0 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 font-medium transition duration-300 flex items-center"
              onClick={handleSearchUser}
              disabled={isSearching}
            >
              {isSearching ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              )}
              {isSearching ? 'Mencari...' : 'Cari'}
            </button>
          </div>
        </div>

        {foundUser && (
          <div className="mt-5 bg-white p-4 border border-gray-200 rounded-xl shadow-md transform transition duration-300 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <UserAvatar user={foundUser} />
              <button
                type="button" 
                onClick={handleAddMember}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Tambahkan
              </button>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-indigo-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>Tambahkan anggota dengan mencari email pengguna yang sudah terdaftar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSelector;