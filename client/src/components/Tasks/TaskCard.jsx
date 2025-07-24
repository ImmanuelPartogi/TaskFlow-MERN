import React, { useState, useContext } from 'react';
import { deleteTask } from '../../services/taskService';
import { NotificationContext } from '../../contexts/NotificationContext';
import TaskForm from './TaskForm';
import UserAvatar from '../common/UserAvatar';

const TaskCard = ({ task, refreshTasks, currentUserId }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { sendDeleteTaskNotification } = useContext(NotificationContext);

  // Cek apakah user yang login adalah pembuat task atau yang ditugaskan
  const isTaskOwner = task.createdBy && task.createdBy._id === currentUserId;
  const isAssignee = task.assignedTo && task.assignedTo._id === currentUserId;
  
  // Hanya owner task atau assignee yang bisa edit/hapus
  const canEditDelete = isTaskOwner || isAssignee;

  const handleDelete = async () => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTaskUpdated = () => {
    refreshTasks();
    setIsEditModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-md font-medium text-gray-800 mb-2">{task.title}</h3>
        
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
          
          {task.dueDate && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 mb-3">
          {task.assignedTo && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Ditugaskan ke:</span>
              <UserAvatar user={task.assignedTo} size="sm" />
            </div>
          )}
          
          {task.createdBy && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500 mr-2">Dibuat oleh:</span>
              <UserAvatar user={task.createdBy} size="sm" />
            </div>
          )}
        </div>
        
        {canEditDelete && (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-900"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

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