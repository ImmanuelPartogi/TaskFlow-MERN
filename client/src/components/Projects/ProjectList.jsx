import React, { useState, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject } from '../../services/projectService';
import Alert from '../common/Alert';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // Default to grid for better mobile experience
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobile, setIsMobile] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Set projects per page based on screen size
  const projectsPerPage = isMobile ? 6 : 10;

  // Detect mobile screen size
  useLayoutEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Force grid view on mobile
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };

    checkIsMobile(); // Check on initial load
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await getProjects();

        // Simulasi status project untuk demo UI
        const projectsWithStatus = projectsData.map((project, index) => {
          const statusOptions = ['active', 'completed', 'on-hold'];
          const randomStatus = statusOptions[index % statusOptions.length];
          return {
            ...project,
            status: randomStatus
          };
        });

        setProjects(projectsWithStatus);
        setLoading(false);
      } catch (err) {
        setError(err.msg || 'Gagal memuat project');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Memastikan fungsi confirmDelete menggunakan parameter dengan benar
  // Perbaikan - Dibuat menjadi useCallback untuk menghindari masalah closure
  const confirmDelete = useCallback((id, name) => {
    console.log(`Konfirmasi hapus project dengan ID: ${id}, Nama: ${name}`);
    if (!id) {
      console.error("ID project tidak valid");
      setAlert({
        type: 'error',
        message: 'ID project tidak valid'
      });
      return;
    }

    // Set data project yang akan dihapus
    setProjectToDelete({ id, name });

    // Tampilkan modal konfirmasi
    setIsDeleteModalOpen(true);
  }, []);

  // Perbaikan fungsi handleDelete untuk single delete
  const handleDelete = async () => {
    if (!projectToDelete || !projectToDelete.id) {
      console.error("Tidak ada project yang dipilih untuk dihapus");
      return;
    }

    try {
      setIsProcessing(true); // Mencegah multiple klik
      console.log(`Menghapus project: ${projectToDelete.name} (${projectToDelete.id})`);

      // Panggil API delete
      const result = await deleteProject(projectToDelete.id);
      console.log("Hasil penghapusan:", result);

      // Update state setelah penghapusan berhasil
      setProjects(projects.filter(project => project._id !== projectToDelete.id));
      setSelectedProjects(selectedProjects.filter(id => id !== projectToDelete.id));

      // Tampilkan notifikasi sukses
      setAlert({
        type: 'success',
        message: `Project "${projectToDelete.name}" berhasil dihapus`
      });
    } catch (err) {
      console.error("Error saat menghapus project:", err);
      setAlert({
        type: 'error',
        message: err.msg || 'Gagal menghapus project. Silakan coba lagi.'
      });
    } finally {
      setIsProcessing(false);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = (
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'members':
          comparison = (a.members?.length || 0) - (b.members?.length || 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'date':
        default:
          const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          comparison = dateA - dateB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredProjects, sortBy, sortDirection]);

  const projectStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on-hold').length;

    return { total, active, completed, onHold };
  }, [projects]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProjects(currentProjects.map(project => project._id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (id) => {
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(projectId => projectId !== id));
    } else {
      setSelectedProjects([...selectedProjects, id]);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedProjects.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  const executeBulkDelete = async () => {
    if (selectedProjects.length === 0) return;

    try {
      setIsProcessing(true);
      console.log(`Menghapus ${selectedProjects.length} project terpilih`);

      // Hapus project satu per satu
      const results = [];
      for (const id of selectedProjects) {
        try {
          const result = await deleteProject(id);
          results.push({ id, success: true, result });
        } catch (error) {
          console.error(`Gagal menghapus project ${id}:`, error);
          results.push({ id, success: false, error });
        }
      }

      // Hitung hasil
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      // Update state setelah bulk delete
      if (successCount > 0) {
        const successIds = results.filter(r => r.success).map(r => r.id);
        setProjects(projects.filter(project => !successIds.includes(project._id)));
      }

      // Tampilkan pesan yang sesuai
      if (successCount > 0 && failCount === 0) {
        setAlert({
          type: 'success',
          message: `${successCount} project berhasil dihapus`
        });
      } else if (successCount > 0 && failCount > 0) {
        setAlert({
          type: 'warning',
          message: `${successCount} project berhasil dihapus, ${failCount} project gagal dihapus`
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Gagal menghapus project. Silakan coba lagi.'
        });
      }

      setSelectedProjects([]);
    } catch (err) {
      console.error("Error saat bulk delete:", err);
      setAlert({
        type: 'error',
        message: err.msg || 'Gagal menghapus beberapa project'
      });
    } finally {
      setIsProcessing(false);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(sortedProjects.length / projectsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badge renderer
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-green-500"></span>
            Aktif
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
            Selesai
          </span>
        );
      case 'on-hold':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
            Ditunda
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-indigo-600 font-medium">Memuat daftar project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Project Management</h1>
            <p className="mt-1 text-sm text-gray-500">Kelola semua project dalam satu tempat</p>
          </div>
          <div className="mt-4 md:mt-0 flex">
            <Link
              to="/dashboard"
              className="mr-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Project
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-5">
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-md bg-indigo-500 flex items-center justify-center">
                <svg className="h-4 w-4 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <dl>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="mt-1 text-lg md:text-2xl font-semibold text-gray-900">{projectStats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-md bg-green-500 flex items-center justify-center">
                <svg className="h-4 w-4 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <dl>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Aktif</dt>
                  <dd className="mt-1 text-lg md:text-2xl font-semibold text-gray-900">{projectStats.active}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-md bg-blue-500 flex items-center justify-center">
                <svg className="h-4 w-4 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <dl>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Selesai</dt>
                  <dd className="mt-1 text-lg md:text-2xl font-semibold text-gray-900">{projectStats.completed}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 md:p-5 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-md bg-amber-500 flex items-center justify-center">
                <svg className="h-4 w-4 md:h-6 md:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <dl>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 truncate">Ditunda</dt>
                  <dd className="mt-1 text-lg md:text-2xl font-semibold text-gray-900">{projectStats.onHold}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {alert && (
          <div className="mb-5 animate-fade-in-down">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-5 animate-fade-in-down" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Terjadi kesalahan</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                  Muat ulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Action Bar */}
          <div className="border-b border-gray-200">
            <div className="p-4">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex-auto mb-4 sm:mb-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari project..."
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
                  {/* Status filter - scrollable on mobile */}
                  <div className="flex overflow-x-auto pb-1 hide-scrollbar">
                    <div className="inline-flex rounded-md shadow-sm">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-l-md border ${statusFilter === 'all'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium border-t border-b ${statusFilter === 'active'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        Aktif
                      </button>
                      <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium border-t border-b ${statusFilter === 'completed'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        Selesai
                      </button>
                      <button
                        onClick={() => setStatusFilter('on-hold')}
                        className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-r-md border ${statusFilter === 'on-hold'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        Ditunda
                      </button>
                    </div>
                  </div>

                  {/* View mode toggle - only show on desktop */}
                  {!isMobile && (
                    <div className="inline-flex rounded-md shadow-sm">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-2 text-sm font-medium rounded-l-md border ${viewMode === 'table'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-2 text-sm font-medium rounded-r-md border ${viewMode === 'grid'
                          ? 'text-white bg-indigo-600 border-indigo-600'
                          : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center">
              <img
                src="https://cdn.jsdelivr.net/npm/@tabler/icons@1.68.0/icons/folder-plus.svg"
                alt="Create Project"
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
              />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada project</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Buat project baru untuk mulai mengelola pekerjaan dan berkolaborasi dengan tim Anda</p>
              <Link
                to="/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Buat Project Baru
              </Link>
            </div>
          ) : (
            <>
              {/* No Results */}
              {sortedProjects.length === 0 && (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada project yang ditemukan</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Coba gunakan filter atau kata kunci pencarian yang berbeda
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Reset Filter
                    </button>
                  </div>
                </div>
              )}

              {sortedProjects.length > 0 && !isMobile && viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 py-3 text-left">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectedProjects.length === currentProjects.length && currentProjects.length > 0}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                          <div className="flex items-center">
                            <span>Nama Project</span>
                            {sortBy === 'name' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                          <div className="flex items-center">
                            <span>Status</span>
                            {sortBy === 'status' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('members')}>
                          <div className="flex items-center">
                            <span>Anggota</span>
                            {sortBy === 'members' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('date')}>
                          <div className="flex items-center">
                            <span>Tanggal</span>
                            {sortBy === 'date' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                              </svg>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="relative px-3 py-3">
                          <span className="sr-only">Aksi</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentProjects.map((project) => (
                        <tr key={project._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-2 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={selectedProjects.includes(project._id)}
                                onChange={() => handleSelectProject(project._id)}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-700 font-medium text-lg">
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                                  <Link to={`/projects/${project._id}`}>
                                    {project.name}
                                  </Link>
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {project._id.substring(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {project.description ? (
                                project.description.length > 60
                                  ? `${project.description.substring(0, 60)}...`
                                  : project.description
                              ) : (
                                <span className="text-gray-400 italic">Tidak ada deskripsi</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            {getStatusBadge(project.status)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {project.members && project.members.length > 0 ? (
                                <div className="flex -space-x-2">
                                  {project.members.slice(0, 3).map((member, index) => (
                                    <div key={index} className="h-6 w-6 rounded-full bg-indigo-100 ring-2 ring-white flex items-center justify-center">
                                      <span className="text-xs font-medium text-indigo-600">
                                        {typeof member === 'object' && member.name
                                          ? member.name.charAt(0).toUpperCase()
                                          : 'M'}
                                      </span>
                                    </div>
                                  ))}
                                  {project.members.length > 3 && (
                                    <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">+{project.members.length - 3}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Belum ada anggota</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {project.date ? (
                                new Date(project.date).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              ) : (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                to={`/projects/${project._id}`}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                title="Lihat Detail"
                              >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              </Link>
                              <Link
                                to={`/projects/${project._id}/edit`}
                                className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                title="Edit Project"
                              >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => {
                                  console.log("Delete button table clicked for project:", project._id, project.name);
                                  confirmDelete(project._id, project.name);
                                }}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Hapus Project"
                              >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {sortedProjects.length > 0 && (isMobile || viewMode === 'grid') && (
                <div className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {currentProjects.map((project) => (
                      <div key={project._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow transition-all duration-300 flex flex-col">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 mr-2 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                checked={selectedProjects.includes(project._id)}
                                onChange={() => handleSelectProject(project._id)}
                              />
                              <div className="h-7 w-7 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-700 font-medium">
                                {project.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              {getStatusBadge(project.status)}
                            </div>
                          </div>

                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                              <Link to={`/projects/${project._id}`}>{project.name}</Link>
                            </h3>
                          </div>

                          <div className="mb-3 min-h-[40px]">
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {project.description || (
                                <span className="text-gray-400 italic">Tidak ada deskripsi</span>
                              )}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-500">
                                {project.date ? (
                                  new Date(project.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                ) : "-"}
                              </span>
                            </div>

                            <div className="flex -space-x-1">
                              {project.members && project.members.length > 0 ? (
                                <>
                                  {project.members.slice(0, 2).map((member, index) => (
                                    <div key={index} className="h-5 w-5 rounded-full bg-indigo-100 ring-1 ring-white flex items-center justify-center">
                                      <span className="text-xs font-medium text-indigo-600">
                                        {typeof member === 'object' && member.name
                                          ? member.name.charAt(0).toUpperCase()
                                          : 'M'}
                                      </span>
                                    </div>
                                  ))}
                                  {project.members.length > 2 && (
                                    <div className="h-5 w-5 rounded-full bg-gray-200 ring-1 ring-white flex items-center justify-center">
                                      <span className="text-xs font-medium text-gray-600">+{project.members.length - 2}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Belum ada anggota</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 mt-auto flex justify-between items-center">
                          <Link
                            to={`/projects/${project._id}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                          >
                            Lihat Detail
                          </Link>

                          <div className="flex space-x-2">
                            <Link
                              to={`/projects/${project._id}/edit`}
                              className="text-gray-400 hover:text-yellow-600 transition-colors"
                              title="Edit Project"
                            >
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => {
                                console.log("Delete button card clicked for project:", project._id, project.name);
                                confirmDelete(project._id, project.name);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Hapus Project"
                              aria-label={`Hapus Project ${project.name}`}
                            >
                              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {sortedProjects.length > projectsPerPage && (
                <div className="border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{indexOfFirstProject + 1}</span> sampai <span className="font-medium">{Math.min(indexOfLastProject, sortedProjects.length)}</span> dari <span className="font-medium">{sortedProjects.length}</span> project
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Pertama</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            if (totalPages <= 5) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                          })
                          .map((page, index, array) => {
                            const prevPage = array[index - 1];

                            // Add ellipsis
                            if (prevPage && page - prevPage > 1) {
                              return (
                                <span key={`ellipsis-${page}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                {page}
                              </button>
                            );
                          })}

                        <button
                          onClick={() => paginate(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                          <span className="sr-only">Terakhir</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedProjects.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-30">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
              <div className="flex items-center justify-between flex-wrap">
                <div className="flex-1 flex items-center">
                  <span className="flex p-2 rounded-lg bg-indigo-800">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </span>
                  <p className="ml-3 font-medium text-white truncate">
                    <span className="md:inline">
                      {selectedProjects.length} project terpilih
                    </span>
                  </p>
                </div>
                <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                  <button
                    onClick={confirmBulkDelete}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                    disabled={isProcessing}
                  >
                    <svg className="mr-1.5 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {isProcessing ? 'Menghapus...' : 'Hapus Project'}
                  </button>
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
                  <button
                    onClick={() => setSelectedProjects([])}
                    type="button"
                    className="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-[1000] inset-0 overflow-y-auto overflow-x-hidden flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={() => !isProcessing && setIsDeleteModalOpen(false)}
          ></div>

          {/* Modal panel - perbaikan styling */}
          <div className="relative z-[1001] bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 w-full max-w-lg mx-4 sm:mx-auto sm:p-6 animate-fadeIn">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Konfirmasi Hapus
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus project <span className="font-semibold">{projectToDelete?.name}</span>? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Menghapus...' : 'Hapus'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed z-[1000] inset-0 overflow-y-auto overflow-x-hidden flex items-center justify-center" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={() => !isProcessing && setIsBulkDeleteModalOpen(false)}
          ></div>

          {/* Modal panel - perbaikan styling */}
          <div className="relative z-[1001] bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 w-full max-w-lg mx-4 sm:mx-auto sm:p-6 animate-fadeIn">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Konfirmasi Hapus Multiple Project
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus <span className="font-semibold">{selectedProjects.length} project</span> yang dipilih? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={executeBulkDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Menghapus...' : `Hapus ${selectedProjects.length} Project`}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                disabled={isProcessing}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;