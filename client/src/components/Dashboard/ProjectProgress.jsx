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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (projects.length === 0 || projectProgress.length === 0) {
    return <p className="text-gray-600">Belum ada data progress project.</p>;
  }

  return (
    <div className="space-y-4">
      {projectProgress.map((project) => (
        <div key={project.id} className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{project.name}</span>
            <span className="text-sm font-medium text-gray-700">{project.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${project.percentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {project.completed} dari {project.total} tugas selesai
          </div>
          {errors[project.id] && (
            <div className="text-xs text-red-500 mt-1">
              {errors[project.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectProgress;