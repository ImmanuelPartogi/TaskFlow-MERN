import React, { useEffect, useState } from 'react';
import { getTasksByProject } from '../../services/taskService';

const ProjectProgress = ({ projects }) => {
  const [projectProgress, setProjectProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProjectsProgress = async () => {
      try {
        if (!projects || projects.length === 0) {
          setLoading(false);
          return;
        }
        
        // Hanya ambil maksimal 3 proyek
        const projectsToFetch = projects.slice(0, 3);
        const progressData = [];
        
        for (const project of projectsToFetch) {
          try {
            const tasks = await getTasksByProject(project._id);
            
            const total = tasks.length;
            const completed = tasks.filter(task => task.status === 'done').length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            progressData.push({
              id: project._id,
              name: project.name,
              percentage,
              total,
              completed
            });
          } catch (err) {
            console.error(`Error fetching tasks for project ${project._id}:`, err);
            setErrors(prev => ({
              ...prev,
              [project._id]: err.msg || 'Gagal memuat tugas'
            }));
          }
        }
        
        setProjectProgress(progressData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project progress:', error);
        setLoading(false);
      }
    };

    if (projects.length > 0) {
      fetchProjectsProgress();
    } else {
      setLoading(false);
    }
  }, [projects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (projects.length === 0 || projectProgress.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
        <p className="text-gray-600">Belum ada data progress project.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {projectProgress.map((project) => (
        <div key={project.id} className="mb-4 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition duration-300 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-800">{project.name}</span>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium py-1 px-2 rounded-full">{project.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${project.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-gray-500">
              {project.completed} dari {project.total} tugas selesai
            </div>
            {errors[project.id] && (
              <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">
                {errors[project.id]}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectProgress;