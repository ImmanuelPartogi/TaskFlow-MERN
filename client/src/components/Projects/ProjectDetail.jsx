import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProjectById, deleteProject } from '../../services/projectService';
import { getTasksByProject } from '../../services/taskService';
import Alert from '../common/Alert';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        const projectData = await getProjectById(projectId);
        setProject(projectData);

        const tasksData = await getTasksByProject(projectId);
        setTasks(tasksData);

        setLoading(false);
      } catch (err) {
        setError(err.msg || 'Gagal memuat data');
        setLoading(false);
      }
    };

    fetchProjectAndTasks();
  }, [projectId]);

  const handleDelete = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus project "${project.name}"?`)) {
      try {
        await deleteProject(projectId);
        navigate('/projects');
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.msg || 'Gagal menghapus project'
        });

        // Tampilkan pesan spesifik jika gagal karena masih ada task
        if (err.msg && err.msg.includes('masih memiliki task')) {
          setAlert({
            type: 'warning',
            message: 'Project tidak dapat dihapus karena masih memiliki task aktif. Hapus semua task terlebih dahulu.'
          });
        }
      }
    }
  };

  const getTaskStatusCount = (status) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Project tidak ditemukan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">{project.name}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {new Date(project.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/projects/${projectId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Project
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
              >
                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Hapus Project
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Project</h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress Keseluruhan</span>
                <span className="text-sm font-medium text-gray-800">{getCompletionPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-right">
                {tasks.filter(task => task.status === 'done').length} dari {tasks.length} tugas selesai
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-medium text-gray-800">To Do</div>
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">{getTaskStatusCount('todo')}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gray-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(getTaskStatusCount('todo') / tasks.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-medium text-gray-800">In Progress</div>
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">{getTaskStatusCount('in-progress')}</span>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(getTaskStatusCount('in-progress') / tasks.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-medium text-gray-800">Review</div>
                <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-yellow-700">{getTaskStatusCount('review')}</span>
                </div>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(getTaskStatusCount('review') / tasks.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-200 transform transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-medium text-gray-800">Done</div>
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-green-700">{getTaskStatusCount('done')}</span>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(getTaskStatusCount('done') / tasks.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Tim Project</h2>
            {project.members && project.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mr-4 shadow-md">
                    <span className="text-white text-base font-medium">
                      {project.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{project.owner.name}</div>
                    <div className="text-sm text-gray-600">{project.owner.email}</div>
                    <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
                      Owner
                    </div>
                  </div>
                </div>

                {project.members.map((member) => (
                  <div key={member._id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center transform transition-all duration-300 hover:shadow-md">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center mr-4 shadow-md">
                      <span className="text-white text-base font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">{member.email}</div>
                      <div className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 font-medium">
                        Member
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-600">Belum ada anggota dalam project ini.</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to={`/projects/${projectId}/tasks`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Lihat Papan Tugas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;