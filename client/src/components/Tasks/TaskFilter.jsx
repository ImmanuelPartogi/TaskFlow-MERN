import React from 'react';

const TaskFilter = ({ activeFilter, onFilterChange, onSearch, searchTerm }) => {
  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeFilter === 'all' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => onFilterChange('assigned')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeFilter === 'assigned' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ditugaskan ke Saya
          </button>
          <button
            onClick={() => onFilterChange('created')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeFilter === 'created' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Dibuat Oleh Saya
          </button>
        </div>

        {/* Priority Filter */}
        <div>
          <select 
            className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            onChange={(e) => onFilterChange(activeFilter, e.target.value)}
          >
            <option value="all">Semua Prioritas</option>
            <option value="high">Prioritas Tinggi</option>
            <option value="medium">Prioritas Sedang</option>
            <option value="low">Prioritas Rendah</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Cari tugas..."
            className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2 top-1.5 text-gray-500"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilter;