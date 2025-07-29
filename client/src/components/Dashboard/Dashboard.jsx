import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '../../services/projectService';
import { getTasksByProject } from '../../services/taskService';
import { AuthContext } from '../../contexts/AuthContext';
import UserAvatar from '../common/UserAvatar';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) {
      console.log("User data not available yet, skipping data fetch");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Ambil semua project milik user (sebagai owner atau member)
        const projectsData = await getProjects();
        setProjects(projectsData);
        
        // Ambil statistik untuk setiap project
        const stats = {};
        
        for (const project of projectsData) {
          try {
            const tasks = await getTasksByProject(project._id);
            
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
            const reviewTasks = tasks.filter(task => task.status === 'review').length;
            const pendingTasks = totalTasks - completedTasks;
            const progressPercentage = totalTasks > 0 
              ? Math.round((completedTasks / totalTasks) * 100) 
              : 0;
            
            // Pastikan user.id ada sebelum melakukan filter
            const tasksAssignedToMe = user && user.id ? tasks.filter(
              task => task.assignedTo && 
                (typeof task.assignedTo === 'object' 
                  ? task.assignedTo._id === user.id 
                  : task.assignedTo === user.id)
            ) : [];
            
            stats[project._id] = {
              totalTasks,
              completedTasks,
              inProgressTasks,
              reviewTasks,
              pendingTasks,
              progressPercentage,
              tasksAssignedToMe: tasksAssignedToMe.length,
              overdueTasks: tasksAssignedToMe.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                return dueDate < today && task.status !== 'done';
              }).length
            };
          } catch (err) {
            console.error(`Error fetching tasks for project ${project._id}:`, err);
          }
        }
        
        setProjectStats(stats);
        setLoading(false);
      } catch (err) {
        setError(err.msg || 'Gagal memuat data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const getFilteredProjects = () => {
    if (activeTab === 'all') return projects;
    
    if (activeTab === 'owner') {
      return projects.filter(project => {
        return project.owner && 
          (typeof project.owner === 'object' 
            ? project.owner._id === user.id 
            : project.owner === user.id);
      });
    }
    
    if (activeTab === 'member') {
      return projects.filter(project => {
        const isOwner = project.owner && 
          (typeof project.owner === 'object' 
            ? project.owner._id === user.id 
            : project.owner === user.id);
        
        return !isOwner;
      });
    }
    
    return projects;
  };

  const totalTasksAssigned = Object.values(projectStats).reduce((sum, stat) => sum + stat.tasksAssignedToMe, 0);
  const totalOverdueTasks = Object.values(projectStats).reduce((sum, stat) => sum + (stat.overdueTasks || 0), 0);
  const completedTasksPercentage = totalTasksAssigned > 0 
    ? Math.round((totalTasksAssigned - totalOverdueTasks) / totalTasksAssigned * 100) 
    : 0;

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-indigo-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
      </div>
    );
  }

  const filteredProjects = getFilteredProjects();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Selamat datang, <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user ? user.name : 'User'}</span>!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Project Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Project */}
        <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg group-hover:scale-110 transition-all duration-300">
                <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="flex items-end">
                  <div className="text-3xl font-bold text-gray-800">{projects.length}</div>
                  <div className="ml-1 mb-1 text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                    Active
                  </div>
                </div>
                <div className="text-sm text-gray-600">Total Project</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="flex items-center text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
                    Owner
                  </span>
                  <span className="flex items-center text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
                    Member
                  </span>
                </div>
                <Link to="/projects" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                  Lihat semua
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Task */}
        <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg group-hover:scale-110 transition-all duration-300">
                <svg className="h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="flex items-end">
                  <div className="text-3xl font-bold text-gray-800">
                    {Object.values(projectStats).reduce((sum, stat) => sum + stat.totalTasks, 0)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Total Task</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-semibold text-gray-800">
                    {Object.values(projectStats).reduce((sum, stat) => sum + (stat.totalTasks - stat.pendingTasks), 0)}
                  </div>
                  <div className="text-xs text-gray-500">Selesai</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-semibold text-gray-800">
                    {Object.values(projectStats).reduce((sum, stat) => sum + stat.inProgressTasks, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Proses</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-semibold text-gray-800">
                    {Object.values(projectStats).reduce((sum, stat) => sum + stat.reviewTasks, 0)}
                  </div>
                  <div className="text-xs text-gray-500">Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Task Ditugaskan */}
        <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="p-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg group-hover:scale-110 transition-all duration-300">
                <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-5">
                <div className="flex items-end">
                  <div className="text-3xl font-bold text-gray-800">
                    {totalTasksAssigned}
                  </div>
                  {totalOverdueTasks > 0 && (
                    <div className="ml-1 mb-1 text-xs font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
                      {totalOverdueTasks} terlambat
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">Task Ditugaskan ke Saya</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="relative">
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-gray-200">
                  <div style={{ width: `${completedTasksPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{completedTasksPercentage}% selesai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Section */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Project Saya</h2> 
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white shadow-md rounded-xl p-10 text-center border border-dashed border-gray-300">
            <img 
              src="https://cdn.jsdelivr.net/npm/@tabler/icons@1.68.0/icons/folder-plus.svg" 
              alt="Create Project" 
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
            />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum ada project</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Buat project baru untuk mulai mengelola pekerjaan dan berkolaborasi dengan tim Anda</p>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Buat Project Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const stats = projectStats[project._id] || {
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                progressPercentage: 0,
                tasksAssignedToMe: 0
              };
              
              const isOwner = project.owner && 
                (typeof project.owner === 'object' 
                  ? project.owner._id === user.id 
                  : project.owner === user.id);
              
              return (
                <div key={project._id} className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors duration-200">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isOwner ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isOwner ? 'Owner' : 'Member'}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{project.description}</p>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{stats.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${stats.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="bg-gray-50 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm">
                        <div className="text-lg font-medium text-gray-800">{stats.totalTasks}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                          </svg>
                          Total Task
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg transition-all duration-200 hover:bg-indigo-50 hover:shadow-sm">
                        <div className="text-lg font-medium text-gray-800">{stats.tasksAssignedToMe}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                          Tugas Saya
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.owner && (
                          <UserAvatar 
                            user={typeof project.owner === 'object' ? project.owner : { name: 'Owner' }} 
                            size="sm" 
                            showName={false} 
                          />
                        )}
                        
                        {project.members && project.members.length > 0 ? (
                          <>
                            {project.members.slice(0, 3).map((member, idx) => (
                              <UserAvatar 
                                key={typeof member === 'object' ? member._id : `member-${idx}`} 
                                user={typeof member === 'object' ? member : { name: 'Member' }} 
                                size="sm" 
                                showName={false} 
                              />
                            ))}
                            
                            {project.members.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700 border-2 border-white">
                                +{project.members.length - 3}
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {project.date ? new Date(project.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : ''}
                      </div>
                    </div>
                    
                    <Link
                      to={`/projects/${project._id}`}
                      className="block w-full text-center py-2.5 px-4 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;