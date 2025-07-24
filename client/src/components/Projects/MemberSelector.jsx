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

  // Cek status koneksi API saat komponen dimuat
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

  // Reset hasil pencarian saat email kosong
  useEffect(() => {
    if (searchEmail === '') {
      setFoundUser(null);
    }
  }, [searchEmail]);

  // Load data anggota yang sudah ada
  useEffect(() => {
    // Ini bisa diimplementasikan sesuai kebutuhan
    // Jika data anggota sudah ada di props, kita bisa langsung menggunakannya
    setSelectedMemberUsers(selectedMembers.map(id => ({
      _id: id,
      name: `Member ${id.substring(0, 5)}...`, // Placeholder
      email: "Loading..."
    })));
    
    // Di sini bisa menambahkan kode untuk memuat detail anggota
    // dari API jika diperlukan
  }, [selectedMembers]);

  const handleSearchUser = async (e) => {
    if (e) e.preventDefault();
    
    // Validasi input
    if (!searchEmail) {
      setError('Masukkan email untuk mencari pengguna');
      return;
    }
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(searchEmail)) {
      setError('Format email tidak valid');
      return;
    }
    
    // Cek apakah email sama dengan owner
    if (currentOwner && currentOwner.email === searchEmail) {
      setError('Pengguna sudah menjadi owner project');
      return;
    }
    
    // Cek apakah email sudah ada di anggota
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
      
      // Tambahkan user ke daftar member yang ditampilkan
      setSelectedMemberUsers([...selectedMemberUsers, foundUser]);
      
      // Reset form
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
    // Jalankan pencarian saat pengguna menekan Enter
    if (e.key === 'Enter') {
      e.preventDefault(); // Mencegah submit form parent
      handleSearchUser();
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Anggota Project</h3>
        
        {connectionStatus && !connectionStatus.connected && (
          <div className="mb-4">
            <Alert
              type="warning"
              message="Koneksi ke server bermasalah. Fitur pencarian anggota mungkin tidak berfungsi dengan baik."
              onClose={() => setConnectionStatus(null)}
            />
          </div>
        )}
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Owner</h4>
          {currentOwner ? (
            <UserAvatar user={currentOwner} />
          ) : (
            <div className="text-gray-500">Loading owner...</div>
          )}
        </div>

        {selectedMemberUsers.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Anggota Terpilih ({selectedMemberUsers.length})
            </h4>
            <div className="space-y-2">
              {selectedMemberUsers.map(member => (
                <div key={member._id} className="flex justify-between items-center">
                  <UserAvatar user={member} />
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Tambah Anggota</h4>
        
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Cari berdasarkan email..."
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r focus:outline-none"
              onClick={handleSearchUser}
              disabled={isSearching}
            >
              {isSearching ? 'Mencari...' : 'Cari'}
            </button>
          </div>
        </div>

        {foundUser && (
          <div className="mt-4 bg-white p-4 border rounded-md">
            <div className="flex justify-between items-center">
              <UserAvatar user={foundUser} />
              <button
                type="button" 
                onClick={handleAddMember}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Tambahkan
              </button>
            </div>
          </div>
        )}
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Catatan: Tambahkan anggota dengan mencari email pengguna yang sudah terdaftar.</p>
        </div>
      </div>
    </div>
  );
};

export default MemberSelector;