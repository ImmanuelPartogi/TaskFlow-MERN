import React, { useState, useContext } from 'react';
import { deleteTask } from '../../services/taskService';
import { NotificationContext } from '../../contexts/NotificationContext';
import TaskForm from './TaskForm';
import UserAvatar from '../common/UserAvatar';
import TaskDetailModal from './TaskDetailModal';

// Komponen TaskCard dengan aturan izin yang benar
const TaskCard = ({ task, refreshTasks, userId, projectData }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { sendDeleteTaskNotification } = useContext(NotificationContext);

  // Pastikan userId tersedia dengan menggunakan fallback ke user dari localStorage jika perlu
  const currentUserId = userId || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : null);

  // Cek apakah user adalah pembuat task atau yang ditugaskan
  const isTaskCreator = task.createdBy && 
    (typeof task.createdBy === 'object' 
      ? task.createdBy._id === currentUserId 
      : task.createdBy === currentUserId);
  
  const isTaskAssignee = task.assignedTo && 
    (typeof task.assignedTo === 'object' 
      ? task.assignedTo._id === currentUserId 
      : task.assignedTo === currentUserId);
  
  // Cek apakah user adalah owner project
  const isProjectOwner = projectData && projectData.owner && 
    (typeof projectData.owner === 'object' 
      ? projectData.owner._id === currentUserId 
      : projectData.owner === currentUserId);

  // Cek apakah user adalah anggota project
  const isProjectMember = projectData && projectData.members && 
    projectData.members.some(member => 
      typeof member === 'object' 
        ? member._id === currentUserId 
        : member === currentUserId
    );

  // Log untuk debugging
  console.log('TaskCard Permissions:', {
    providedUserId: userId,
    currentUserId,
    taskCreatorId: task.createdBy ? (typeof task.createdBy === 'object' ? task.createdBy._id : task.createdBy) : null,
    isTaskCreator,
    assigneeId: task.assignedTo ? (typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo) : null,
    isTaskAssignee,
    projectOwnerId: projectData?.owner ? (typeof projectData.owner === 'object' ? projectData.owner._id : projectData.owner) : null,
    isProjectOwner,
    isProjectMember
  });

  // Aturan izin yang diperbaiki:
  // 1. Pemilik project bisa edit/hapus task
  // 2. Pembuat task bisa edit/hapus task
  const canEditDelete = isProjectOwner || isTaskCreator;

  const handleDelete = async () => {
    if (!canEditDelete) {
      alert('Anda tidak memiliki izin untuk menghapus tugas ini.');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        await deleteTask(task._id);
        // Pastikan task.project adalah ID, bukan objek
        const projectId = typeof task.project === 'object' ? task.project._id : task.project;
        sendDeleteTaskNotification(task._id, projectId);
        refreshTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Gagal menghapus tugas: ' + (err.msg || 'Terjadi kesalahan'));
      }
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          label: 'Tinggi',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: <span className="mr-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>
        };
      case 'medium':
        return {
          label: 'Sedang',
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: <span className="mr-1 w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
        };
      case 'low':
        return {
          label: 'Rendah',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: <span className="mr-1 w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        };
      default:
        return {
          label: 'Normal',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null
        };
    }
  };

  const handleTaskUpdated = () => {
    refreshTasks();
    setIsEditModalOpen(false);
  };

  const priorityConfig = getPriorityConfig(task.priority);

  // Format due date with additional logic
  const formatDueDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format based on time difference
    if (date.toDateString() === today.toDateString()) {
      return {
        label: 'Hari ini',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <span className="mr-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>
      };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return {
        label: 'Besok',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: <span className="mr-1 w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
      };
    } else if (date < today) {
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        label: `Terlambat ${diffDays}h`,
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: <span className="mr-1 w-2 h-2 rounded-full bg-red-500 inline-block"></span>
      };
    } else {
      // Format date simply as DD/MM
      return {
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <span className="mr-1 w-2 h-2 rounded-full bg-slate-500 inline-block"></span>
      };
    }
  };

  const dueDate = task.dueDate ? formatDueDate(task.dueDate) : null;

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'todo':
        return null; // No badge for default status
      case 'in-progress':
        return {
          label: 'In Progress',
          color: 'bg-blue-100 text-blue-700',
          dot: 'bg-blue-500 animate-pulse'
        };
      case 'review':
        return {
          label: 'Review',
          color: 'bg-violet-100 text-violet-700',
          dot: 'bg-violet-500'
        };
      case 'done':
        return {
          label: 'Done',
          color: 'bg-emerald-100 text-emerald-700',
          dot: 'bg-emerald-500'
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig(task.status);

  // Shorten long names
  const shortenName = (name) => {
    if (!name) return '';

    const parts = name.split(' ');
    if (parts.length === 1) return name;

    // Return first name and initial of last name
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  };

  return (
    <>
      <div
        className="bg-white rounded-md shadow-sm border-l-4 border border-r border-t border-b border-slate-200 hover:shadow transition-all duration-200 ease-in-out relative group cursor-pointer"
        style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }}
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="p-3">
          {/* Title and Actions Row */}
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-slate-800 truncate max-w-[85%]">{task.title}</h3>

            {canEditDelete && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-slate-200 z-10 overflow-hidden">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1 text-xs text-slate-700 hover:bg-slate-100 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-2 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1 text-xs text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description - Only if not too long */}
          {task.description && task.description.length < 100 && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
          )}

          {/* Tags - Compact Row */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${priorityConfig.color}`}>
              {priorityConfig.icon}
              {priorityConfig.label}
            </span>

            {dueDate && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${dueDate.color}`}>
                {dueDate.icon}
                {dueDate.label}
              </span>
            )}

            {statusConfig && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${statusConfig.color} ml-auto`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1`}></span>
                {statusConfig.label}
              </span>
            )}
          </div>

          {/* Assignee - Compact */}
          {task.assignedTo && (
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center">
              <UserAvatar user={task.assignedTo} size="xs" />
              <span className="ml-1.5 text-xs text-slate-600 truncate max-w-[calc(100%-24px)]">
                {shortenName(task.assignedTo.name)}
              </span>
              {isTaskAssignee && (
                <span className="ml-1 text-xs text-blue-600 font-medium">(Anda)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Task */}
      {isDetailModalOpen && (
        <TaskDetailModal
          task={task}
          onClose={() => setIsDetailModalOpen(false)}
          refreshTasks={refreshTasks}
          userId={currentUserId}
          projectData={projectData}
        />
      )}

      {/* Modal Edit Task */}
      {isEditModalOpen && (
        <TaskForm
          projectId={typeof task.project === 'object' ? task.project._id : task.project}
          task={task}
          isEditing={true}
          onClose={() => setIsEditModalOpen(false)}
          onTaskAdded={handleTaskUpdated}
        />
      )}
    </>
  );
};

export default TaskCard;