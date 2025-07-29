import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTasksByProject } from '../../services/taskService';
import { getProjectById } from '../../services/projectService';
import { NotificationContext } from '../../contexts/NotificationContext';
import { AuthContext } from '../../contexts/AuthContext';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

// Komponen TaskColumn yang ditingkatkan dengan animasi dan responsivitas
const TaskColumn = ({ columnId, tasks, refreshTasks, userId, projectData }) => {
  const columnRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getColumnConfig = () => {
    switch (columnId) {
      case 'todo':
        return {
          title: 'To Do',
          icon: (
            <svg className="w-5 h-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
          ),
          headerClass: 'bg-slate-50 border-b border-slate-200',
          bodyClass: 'bg-slate-50',
          color: 'border-slate-300',
          bgGradient: 'from-slate-50 to-white',
          countBg: 'bg-slate-100 text-slate-700 border-slate-200'
        };
      case 'in-progress':
        return {
          title: 'In Progress',
          icon: (
            <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          ),
          headerClass: 'bg-blue-50 border-b border-blue-200',
          bodyClass: 'bg-blue-50',
          color: 'border-blue-300',
          bgGradient: 'from-blue-50 to-white',
          countBg: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'review':
        return {
          title: 'Review',
          icon: (
            <svg className="w-5 h-5 text-violet-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          headerClass: 'bg-violet-50 border-b border-violet-200',
          bodyClass: 'bg-violet-50',
          color: 'border-violet-300',
          bgGradient: 'from-violet-50 to-white',
          countBg: 'bg-violet-100 text-violet-700 border-violet-200'
        };
      case 'done':
        return {
          title: 'Done',
          icon: (
            <svg className="w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          headerClass: 'bg-emerald-50 border-b border-emerald-200',
          bodyClass: 'bg-emerald-50',
          color: 'border-emerald-300',
          bgGradient: 'from-emerald-50 to-white',
          countBg: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      default:
        return {
          title: columnId,
          icon: null,
          headerClass: 'bg-slate-50 border-b border-slate-200',
          bodyClass: 'bg-slate-50',
          color: 'border-slate-300',
          bgGradient: 'from-slate-50 to-white',
          countBg: 'bg-white text-slate-700 border-slate-200'
        };
    }
  };

  const config = getColumnConfig();

  // Toggle kolom pada tampilan mobile
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      ref={columnRef}
      className={`rounded-lg overflow-hidden border ${config.color} bg-gradient-to-b ${config.bgGradient} shadow-sm flex flex-col transition-all duration-300 ease-in-out
                 md:h-[calc(100vh-240px)] h-auto ${isExpanded ? 'max-h-[80vh]' : 'max-h-[56px] md:max-h-none'}`}
    >
      <div 
        onClick={() => {
          if (window.innerWidth < 768) toggleExpand();
        }}
        className={`px-4 py-3 ${config.headerClass} flex items-center justify-between sticky top-0 z-10 cursor-pointer md:cursor-default`}
      >
        <div className="flex items-center">
          {config.icon}
          <h2 className="ml-2 font-medium text-slate-800">{config.title}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full text-xs font-medium ${config.countBg}`}>
            {tasks.length}
          </span>
          <button className="md:hidden text-slate-500" onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className={`${config.bodyClass} p-3 flex-grow overflow-y-auto custom-scrollbar transition-opacity duration-300 ${isExpanded || window.innerWidth >= 768 ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 md:h-full py-8 text-center">
            <div className="w-16 h-16 mb-3 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-7 h-7 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 font-medium">Belum ada tugas</p>
            <p className="text-xs text-slate-400 mt-1">Klik tambah tugas untuk membuat tugas baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                refreshTasks={refreshTasks}
                userId={userId}
                projectData={projectData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState({
    todo: [],
    'in-progress': [],
    review: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
  const { joinProjectRoom } = useContext(NotificationContext);
  const [projectData, setProjectData] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' atau 'list'
  const [activeTab, setActiveTab] = useState('todo'); // Untuk mobile view
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log('TaskBoard - Current user:', user);

    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);

        // Ambil data project terlebih dahulu
        const project = await getProjectById(projectId);
        console.log('Project data:', project);
        setProjectData(project);

        // Kemudian ambil tugas
        const tasksData = await getTasksByProject(projectId);
        console.log('Tasks data:', tasksData);

        // Kelompokkan tugas berdasarkan status tanpa filter
        const groupedTasks = {
          todo: tasksData.filter(task => task.status === 'todo'),
          'in-progress': tasksData.filter(task => task.status === 'in-progress'),
          review: tasksData.filter(task => task.status === 'review'),
          done: tasksData.filter(task => task.status === 'done')
        };

        setAllTasks(tasksData);
        setTasks(groupedTasks);

        // Hitung statistik
        calculateStatistics(tasksData);

        setLoading(false);

        // Gabung socket room untuk project
        joinProjectRoom(projectId);
      } catch (err) {
        console.error("Error dalam fetchProjectAndTasks:", err);
        setError(err.msg || 'Gagal memuat data');
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId, joinProjectRoom, user]);

  const calculateStatistics = (tasksData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: tasksData.length,
      completed: tasksData.filter(task => task.status === 'done').length,
      inProgress: tasksData.filter(task => task.status === 'in-progress').length,
      overdue: tasksData.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && task.status !== 'done';
      }).length
    };

    setStatistics(stats);
  };

  const refreshTasks = async () => {
    try {
      setIsRefreshing(true);
      const tasksData = await getTasksByProject(projectId);

      // Kelompokkan tugas berdasarkan status tanpa filter
      const groupedTasks = {
        todo: tasksData.filter(task => task.status === 'todo'),
        'in-progress': tasksData.filter(task => task.status === 'in-progress'),
        review: tasksData.filter(task => task.status === 'review'),
        done: tasksData.filter(task => task.status === 'done')
      };

      setAllTasks(tasksData);
      setTasks(groupedTasks);
      calculateStatistics(tasksData);
      setIsRefreshing(false);
    } catch (err) {
      console.error("Error dalam refreshTasks:", err);
      setError(err.msg || 'Gagal memuat tugas');
      setIsRefreshing(false);
    }
  };

  const handleTaskAdded = () => {
    refreshTasks();
    setIsModalOpen(false);
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 p-4">
        <div className="w-full max-w-lg mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white shadow-sm rounded-lg border border-slate-200 p-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="flex justify-end">
                    <div className="h-6 w-6 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-white shadow-sm rounded-lg border border-slate-200 p-3">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-10 bg-slate-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Terjadi kesalahan</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                className="mt-3 bg-red-100 text-red-800 text-sm px-4 py-1.5 rounded-md hover:bg-red-200 transition-colors duration-200"
                onClick={refreshTasks}
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main content
  return (
    <div className="max-w-full mx-auto px-2 sm:px-4 py-4 sm:py-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col space-y-4 sm:space-y-6">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Papan Tugas</h1>
              {isRefreshing && (
                <svg className="ml-2 w-5 h-5 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Kelola dan pantau perkembangan tugas</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View mode switcher - hanya tampil di mobile */}
            <div className="sm:hidden flex p-1 bg-slate-200 rounded-lg">
              <button 
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </button>
              <button 
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
            
            <button
              onClick={() => refreshTasks()}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Refresh"
            >
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden xs:inline">Tambah Tugas</span>
              <span className="xs:hidden">Tambah</span>
            </button>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-slate-500">Total</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{statistics.total}</h3>
              </div>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-slate-500">Dikerjakan</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{statistics.inProgress}</h3>
              </div>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-slate-500">Selesai</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{statistics.completed}</h3>
              </div>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-medium text-slate-500">Terlambat</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{statistics.overdue}</h3>
              </div>
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation untuk List View */}
        {viewMode === 'list' && (
          <div className="sm:hidden bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex divide-x divide-slate-200">
              {Object.keys(tasks).map((columnId) => {
                const config = {
                  todo: { text: 'text-slate-600', bg: 'bg-slate-100' },
                  'in-progress': { text: 'text-blue-600', bg: 'bg-blue-100' },
                  review: { text: 'text-violet-600', bg: 'bg-violet-100' },
                  done: { text: 'text-emerald-600', bg: 'bg-emerald-100' }
                }[columnId] || { text: 'text-slate-600', bg: 'bg-slate-100' };
                
                return (
                  <button 
                    key={columnId}
                    className={`flex-1 py-3 text-xs font-medium relative ${activeTab === columnId ? `${config.text}` : 'text-slate-500'}`}
                    onClick={() => setActiveTab(columnId)}
                  >
                    {columnId === 'todo' ? 'To Do' : 
                      columnId === 'in-progress' ? 'Dikerjakan' : 
                      columnId === 'review' ? 'Review' : 'Selesai'}
                    <span className={`ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-xs ${activeTab === columnId ? config.bg : 'bg-slate-100'}`}>
                      {tasks[columnId].length}
                    </span>
                    {activeTab === columnId && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.bg}`}></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 max-h-[calc(100vh-320px)] overflow-y-auto">
              {tasks[activeTab].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 mb-3 rounded-full bg-slate-50 flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Belum ada tugas</p>
                  <p className="text-xs text-slate-400 mt-1">Klik tambah tugas untuk membuat tugas baru</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks[activeTab].map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      refreshTasks={refreshTasks}
                      userId={user?.id}
                      projectData={projectData}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {(viewMode === 'kanban' || window.innerWidth >= 640) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Object.keys(tasks).map((columnId) => (
              <TaskColumn
                key={columnId}
                columnId={columnId}
                tasks={tasks[columnId]}
                refreshTasks={refreshTasks}
                userId={user?.id}
                projectData={projectData}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskForm
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
          onTaskAdded={handleTaskAdded}
        />
      )}
    </div>
  );
};

export default TaskBoard;