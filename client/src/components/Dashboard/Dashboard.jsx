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

  useEffect(() => {
    // Tambahkan guard clause untuk mencegah fetch data jika user belum tersedia
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
            ).length : 0;
            
            stats[project._id] = {
              totalTasks,
              completedTasks,
              pendingTasks,
              progressPercentage,
              tasksAssignedToMe
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
  }, [user]); // Tambahkan user sebagai dependency

  // Render loading state jika loading atau jika user belum ada
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Selamat datang, {user ? user.name : 'User'}!</p>
      </div>

      {/* Sisa kode sama, tapi tambahkan pengecekan user di mana-mana */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-xl font-bold text-gray-800 mb-2">{projects.length}</div>
          <div className="text-gray-600">Total Project</div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-xl font-bold text-gray-800 mb-2">
            {Object.values(projectStats).reduce((sum, stat) => sum + stat.totalTasks, 0)}
          </div>
          <div className="text-gray-600">Total Task</div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-xl font-bold text-gray-800 mb-2">
            {Object.values(projectStats).reduce((sum, stat) => sum + stat.tasksAssignedToMe, 0)}
          </div>
          <div className="text-gray-600">Task Ditugaskan ke Saya</div>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Project Saya</h2>
        <Link
          to="/projects/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Buat Project Baru
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-600">Belum ada project. Buat project baru sekarang!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const stats = projectStats[project._id] || {
              totalTasks: 0,
              completedTasks: 0,
              pendingTasks: 0,
              progressPercentage: 0
            };
            
            // PERBAIKAN: Memastikan project.owner ada dan membandingkan ID dengan benar
            const isOwner = project.owner && 
              (typeof project.owner === 'object' 
                ? project.owner._id === user.id 
                : project.owner === user.id);
            
            return (
              <div key={project._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOwner ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isOwner ? 'Owner' : 'Member'}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{stats.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${stats.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-medium text-gray-800">{stats.totalTasks}</div>
                      <div className="text-xs text-gray-500">Total Task</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-medium text-gray-800">{stats.pendingTasks}</div>
                      <div className="text-xs text-gray-500">Task Pending</div>
                    </div>
                  </div>
                  
                  <div className="flex -space-x-2 mb-4">
                    {project.members && project.members.length > 0 ? (
                      <>
                        {/* PERBAIKAN: Memastikan owner ada sebelum menampilkan avatar */}
                        {project.owner && (
                          <UserAvatar 
                            user={typeof project.owner === 'object' ? project.owner : { name: 'Owner' }} 
                            size="sm" 
                            showName={false} 
                          />
                        )}
                        
                        {/* PERBAIKAN: Memastikan members diproses dengan benar */}
                        {project.members.slice(0, 3).map(member => (
                          <UserAvatar 
                            key={typeof member === 'object' ? member._id : member} 
                            user={typeof member === 'object' ? member : { name: 'Member' }} 
                            size="sm" 
                            showName={false} 
                          />
                        ))}
                        
                        {project.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </>
                    ) : (
                      project.owner && (
                        <UserAvatar 
                          user={typeof project.owner === 'object' ? project.owner : { name: 'Owner' }} 
                          size="sm" 
                          showName={false} 
                        />
                      )
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <Link
                      to={`/projects/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;