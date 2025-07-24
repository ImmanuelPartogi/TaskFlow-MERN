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

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Project tidak ditemukan</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}
              <div className="text-sm text-gray-500">
                Dibuat pada: {new Date(project.date).toLocaleDateString()}
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/projects/${projectId}/edit`}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
              >
                Edit Project
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                Hapus Project
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Progress Project</h2>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {getCompletionPercentage()}% selesai
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-medium text-gray-700 mb-2">To Do</div>
              <div className="text-2xl font-bold text-gray-800">{getTaskStatusCount('todo')}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-medium text-gray-700 mb-2">In Progress</div>
              <div className="text-2xl font-bold text-gray-800">{getTaskStatusCount('in-progress')}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-medium text-gray-700 mb-2">Review</div>
              <div className="text-2xl font-bold text-gray-800">{getTaskStatusCount('review')}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-medium text-gray-700 mb-2">Done</div>
              <div className="text-2xl font-bold text-gray-800">{getTaskStatusCount('done')}</div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Tim Project</h2>
            {project.members && project.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {project.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{project.owner.name}</div>
                    <div className="text-sm text-gray-500">{project.owner.email}</div>
                    <div className="text-xs text-gray-400">Owner</div>
                  </div>
                </div>

                {project.members.map((member) => (
                  <div key={member._id} className="bg-gray-50 p-4 rounded-lg flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                      <div className="text-xs text-gray-400">Member</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Belum ada anggota dalam project ini.</p>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to={`/projects/${projectId}/tasks`}
              className="px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-md hover:bg-indigo-700"
            >
              Lihat Papan Tugas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;