import React, { useState, useContext } from 'react';
import { deleteTask, updateTask } from '../../services/taskService';
import { NotificationContext } from '../../contexts/NotificationContext';
import TaskForm from './TaskForm';
import UserAvatar from '../common/UserAvatar';

const TaskDetailModal = ({ task, onClose, refreshTasks, userId, projectData }) => {
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { sendUpdateTaskNotification, sendDeleteTaskNotification } = useContext(NotificationContext);

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

  // Aturan izin:
  // 1. Pemilik project atau pembuat task bisa edit/hapus task
  const canEditDelete = isProjectOwner || isTaskCreator;
  
  // 2. Pemilik project, pembuat task, yang ditugaskan, atau anggota project bisa ubah status
  const canChangeStatus = isProjectOwner || isTaskCreator || isTaskAssignee || isProjectMember;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedTask = await updateTask(task._id, { status: newStatus });
      setStatus(newStatus);

      if (sendUpdateTaskNotification) {
        sendUpdateTaskNotification(updatedTask);
      }

      setSuccessMessage(`Status berhasil diubah menjadi ${getStatusLabel(newStatus)}`);
      refreshTasks();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      setLoading(false);
    } catch (err) {
      console.error("Error updating task status:", err);
      setError(err.message || 'Gagal mengubah status tugas');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canEditDelete) {
      setError('Anda tidak memiliki izin untuk menghapus tugas ini');
      return;
    }

    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try {
        await deleteTask(task._id);
        // Pastikan task.project adalah ID, bukan objek
        const projectId = typeof task.project === 'object' ? task.project._id : task.project;
        sendDeleteTaskNotification(task._id, projectId);
        refreshTasks();
        onClose(); // Tutup modal setelah berhasil menghapus
      } catch (err) {
        setError(err.message || 'Gagal menghapus tugas');
      }
    }
  };

  const getStatusLabel = (statusValue) => {
    switch (statusValue) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'review': return 'Review';
      case 'done': return 'Done';
      default: return statusValue;
    }
  };

  const getStatusConfig = (statusValue) => {
    switch (statusValue) {
      case 'todo':
        return {
          label: 'To Do',
          color: '#F8FAFC',
          textColor: '#334155',
          borderColor: '#E2E8F0',
          bgColor: 'bg-slate-100',
          iconColor: 'text-slate-600',
          progressBar: 0,
          icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z'
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          color: '#EFF6FF',
          textColor: '#1D4ED8',
          borderColor: '#BFDBFE',
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          progressBar: 33,
          icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
        };
      case 'review':
        return {
          label: 'Review',
          color: '#F5F3FF',
          textColor: '#6D28D9',
          borderColor: '#DDD6FE',
          bgColor: 'bg-violet-100',
          iconColor: 'text-violet-600',
          progressBar: 66,
          icon: 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        };
      case 'done':
        return {
          label: 'Done',
          color: '#ECFDF5',
          textColor: '#047857',
          borderColor: '#A7F3D0',
          bgColor: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          progressBar: 100,
          icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        };
      default:
        return {
          label: 'To Do',
          color: '#F8FAFC',
          textColor: '#334155',
          borderColor: '#E2E8F0',
          bgColor: 'bg-slate-100',
          iconColor: 'text-slate-600',
          progressBar: 0,
          icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z'
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          label: 'Tinggi',
          color: '#FEF2F2',
          textColor: '#B91C1C',
          dotColor: '#EF4444',
          badgeClass: 'bg-red-600 text-white'
        };
      case 'medium':
        return {
          label: 'Sedang',
          color: '#FFFBEB',
          textColor: '#B45309',
          dotColor: '#F59E0B',
          badgeClass: 'bg-amber-600 text-white'
        };
      case 'low':
        return {
          label: 'Rendah',
          color: '#ECFDF5',
          textColor: '#047857',
          dotColor: '#10B981',
          badgeClass: 'bg-emerald-600 text-white'
        };
      default:
        return {
          label: 'Normal',
          color: '#F8FAFC',
          textColor: '#334155',
          dotColor: '#64748B',
          badgeClass: 'bg-slate-600 text-white'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada tenggat';

    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const statusConfig = getStatusConfig(status);
  const priorityConfig = getPriorityConfig(task.priority);

  // Hitung remaining time
  const calculateRemainingTime = (dateString) => {
    if (!dateString) return null;

    const dueDate = new Date(dateString);
    const today = new Date();

    // Reset waktu ke 00:00:00 untuk perbandingan tanggal saja
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `Terlambat ${Math.abs(diffDays)} hari`,
        class: 'text-red-700 bg-red-50 border border-red-200'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Hari ini',
        class: 'text-amber-700 bg-amber-50 border border-amber-200'
      };
    } else if (diffDays === 1) {
      return {
        text: 'Besok',
        class: 'text-amber-700 bg-amber-50 border border-amber-200'
      };
    } else if (diffDays <= 3) {
      return {
        text: `${diffDays} hari lagi`,
        class: 'text-amber-700 bg-amber-50 border border-amber-200'
      };
    } else {
      return {
        text: `${diffDays} hari lagi`,
        class: 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      };
    }
  };

  const remainingTime = task.dueDate ? calculateRemainingTime(task.dueDate) : null;

  const handleTaskUpdated = () => {
    refreshTasks();
    setIsEditModalOpen(false);
  };

  // Fungsi untuk menampilkan informasi izin akses
  const renderPermissionInfo = () => {
    if (canChangeStatus) {
      if (isProjectOwner) return "sebagai pemilik project";
      if (isTaskCreator) return "sebagai pembuat tugas";
      if (isTaskAssignee) return "sebagai pelaksana tugas";
      if (isProjectMember) return "sebagai anggota project";
      return "";
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center backdrop-blur-sm overflow-auto p-3">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl mx-auto my-auto animate-fade-in-up transition-all">
        {/* Header dengan judul dan tombol tutup */}
        <div className="relative border-b border-slate-200">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bgColor} shadow-sm`}
              >
                <svg
                  className={`w-4 h-4 ${statusConfig.iconColor}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d={statusConfig.icon} />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-semibold text-slate-800">Detail Tugas</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: statusConfig.color,
                      color: statusConfig.textColor
                    }}
                  >
                    {statusConfig.label}
                  </span>

                  {remainingTime && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${remainingTime.class}`}>
                      {remainingTime.text}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Tutup"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="h-1 w-full bg-slate-100">
            <div
              className="h-full transition-all duration-500 ease-in-out"
              style={{
                width: `${statusConfig.progressBar}%`,
                backgroundColor: statusConfig.textColor
              }}
            ></div>
          </div>
        </div>

        <div className="px-4 py-3">
          {/* Status Bar for notifications */}
          {(successMessage || error || loading) && (
            <div className={`rounded-md mb-3 p-2.5 ${error ? 'bg-red-50 border border-red-200' :
                successMessage ? 'bg-emerald-50 border border-emerald-200' :
                  'bg-blue-50 border border-blue-200'
              } transition-all duration-300 animate-fade-in`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {error && (
                    <svg className="h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {successMessage && (
                    <svg className="h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {loading && !error && !successMessage && (
                    <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </div>
                <div className="ml-2 flex-1">
                  <p className={`text-xs font-medium ${error ? 'text-red-800' :
                      successMessage ? 'text-emerald-800' :
                        'text-blue-800'
                    }`}>
                    {error || successMessage || 'Memperbarui status...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Title & Badges */}
          <div className="mb-4">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
              <h2 className="text-lg font-bold text-slate-800">{task.title}</h2>
              
              {/* Tombol Aksi (Edit & Hapus) - hanya untuk pemilik project atau pembuat task */}
              {canEditDelete && (
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center px-2 py-1 border border-slate-300 shadow-sm text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
                  >
                    <svg className="mr-1 h-3.5 w-3.5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-all duration-200"
                  >
                    <svg className="mr-1 h-3.5 w-3.5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.badgeClass}`}>
                <span className="w-1 h-1 rounded-full bg-white mr-1 opacity-80"></span>
                Prioritas {priorityConfig.label}
              </span>

              <span
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: statusConfig.color,
                  color: statusConfig.textColor
                }}
              >
                <span
                  className="w-1 h-1 rounded-full mr-1"
                  style={{ backgroundColor: statusConfig.textColor }}
                ></span>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left Column - Task Details */}
            <div className="md:col-span-2 space-y-4">
              {/* Description */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Deskripsi</h4>
                <div className="prose prose-sm max-w-none text-slate-600">
                  {task.description ? (
                    <p className="text-sm leading-relaxed">{task.description}</p>
                  ) : (
                    <p className="text-slate-400 italic text-sm">Tidak ada deskripsi</p>
                  )}
                </div>
              </div>

              {/* Update Status Section - untuk pembuat task, assigned to, pemilik project, anggota project */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-800">Status Tugas</h4>
                  {canChangeStatus && (
                    <button
                      onClick={() => setIsChangingStatus(!isChangingStatus)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium transition-colors duration-200"
                    >
                      {isChangingStatus ? 'Tutup' : 'Ubah Status'}
                      <svg
                        className={`ml-1 w-3.5 h-3.5 transition-transform duration-300 ${isChangingStatus ? 'transform rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Menampilkan status saat ini jika tidak dalam mode mengubah */}
                {!isChangingStatus && (
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
                      <svg
                        className={`w-3.5 h-3.5 ${statusConfig.iconColor}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d={statusConfig.icon} />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-slate-800">{statusConfig.label}</p>
                      <p className="text-xs text-slate-500">
                        {status === 'todo' && 'Tugas belum dimulai'}
                        {status === 'in-progress' && 'Tugas sedang dikerjakan'}
                        {status === 'review' && 'Tugas sedang dalam review'}
                        {status === 'done' && 'Tugas telah selesai'}
                      </p>
                    </div>
                    {canChangeStatus && (
                      <button
                        onClick={() => setIsChangingStatus(true)}
                        className="ml-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-200"
                      >
                        Ubah
                      </button>
                    )}
                  </div>
                )}

                {/* Opsi untuk mengubah status - untuk yang memiliki izin */}
                {isChangingStatus && canChangeStatus && (
                  <div className="animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['todo', 'in-progress', 'review', 'done'].map(statusKey => {
                        const config = getStatusConfig(statusKey);
                        const isActive = status === statusKey;

                        return (
                          <button
                            key={statusKey}
                            onClick={() => handleStatusChange(statusKey)}
                            disabled={loading || isActive}
                            className={`flex items-center p-2 rounded-md border transition-all duration-200 ${isActive
                                ? 'border-2 cursor-default'
                                : 'hover:-translate-y-0.5 hover:shadow-sm'
                              }`}
                            style={{
                              backgroundColor: config.color,
                              borderColor: isActive ? config.textColor : config.borderColor,
                              color: config.textColor,
                              opacity: isActive ? 1 : 0.85
                            }}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${config.bgColor}`}>
                              <svg
                                className={`w-3.5 h-3.5 ${config.iconColor}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d={config.icon} />
                              </svg>
                            </div>
                            <div className="ml-2 text-left">
                              <p className="text-xs font-medium">{config.label}</p>
                              <p className="text-xs opacity-80">
                                {statusKey === 'todo' && 'Belum dimulai'}
                                {statusKey === 'in-progress' && 'Sedang dikerjakan'}
                                {statusKey === 'review' && 'Menunggu review'}
                                {statusKey === 'done' && 'Tugas selesai'}
                              </p>
                            </div>
                            {isActive && (
                              <svg className="ml-auto h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Tampilkan info peran */}
                    {renderPermissionInfo() && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-200">
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Anda dapat mengubah status tugas ini {renderPermissionInfo()}.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Pesan bantuan jika tidak memiliki izin mengubah status */}
                {!canChangeStatus && (
                  <div className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded-md border border-slate-200">
                    <div className="flex items-center text-blue-600">
                      <svg className="w-3.5 h-3.5 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Hanya pembuat tugas, pelaksana tugas, pemilik project, atau anggota project yang dapat mengubah status tugas.</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Penugasan - dipindahkan ke bawah Status Tugas */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Penugasan</h4>

                <div className="space-y-2">
                  <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Dibuat Oleh</p>
                    <div className="flex items-center">
                      {task.createdBy ? (
                        <>
                          <UserAvatar user={task.createdBy} size="sm" />
                          {isTaskCreator && (
                            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              Anda
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">-</span>
                      )}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Ditugaskan Kepada</p>
                    <div className="flex items-center">
                      {task.assignedTo ? (
                        <>
                          <UserAvatar user={task.assignedTo} size="sm" />
                          {isTaskAssignee && (
                            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              Anda
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Belum ditugaskan</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-4">
              {/* Detail section */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Detail</h4>

                <div className="space-y-2">
                  <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Tenggat Waktu</p>
                    <div className="flex items-center text-sm text-slate-800">
                      <svg className="flex-shrink-0 w-3.5 h-3.5 text-slate-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-xs">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1 font-medium">Tanggal Dibuat</p>
                    <div className="flex items-center text-sm text-slate-800">
                      <svg className="flex-shrink-0 w-3.5 h-3.5 text-slate-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-xs">
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Project Info - tambahan baru */}
                  {projectData && (
                    <div className="p-2 bg-slate-50 rounded-md border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1 font-medium">Project</p>
                      <div className="flex items-center text-sm text-slate-800">
                        <svg className="flex-shrink-0 w-3.5 h-3.5 text-slate-500 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-xs">{projectData.name || 'Project'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permission Info - tambahan baru */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Izin Akses</h4>
                
                <div className="space-y-2">
                  <div className={`p-2 rounded-md flex items-center ${canEditDelete ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'}`}>
                    <svg className={`w-3.5 h-3.5 mr-1.5 ${canEditDelete ? 'text-emerald-500' : 'text-slate-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <div>
                      <span className="text-xs font-medium">Edit & Hapus</span>
                      {canEditDelete ? 
                        <p className="text-xs mt-0.5">Anda dapat mengedit dan menghapus tugas ini</p> :
                        <p className="text-xs mt-0.5">Anda tidak memiliki izin</p>
                      }
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-md flex items-center ${canChangeStatus ? 'bg-blue-50 text-blue-800' : 'bg-slate-50 text-slate-600'}`}>
                    <svg className={`w-3.5 h-3.5 mr-1.5 ${canChangeStatus ? 'text-blue-500' : 'text-slate-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="text-xs font-medium">Ubah Status</span>
                      {canChangeStatus ? 
                        <p className="text-xs mt-0.5">Anda dapat mengubah status tugas ini</p> :
                        <p className="text-xs mt-0.5">Anda tidak memiliki izin</p>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-3 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="inline-flex justify-center items-center px-3 py-1.5 border border-slate-300 rounded-md shadow-sm text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Modal Edit Task - hanya untuk yang memiliki izin edit/delete */}
      {isEditModalOpen && (
        <TaskForm
          projectId={typeof task.project === 'object' ? task.project._id : task.project}
          task={task}
          isEditing={true}
          onClose={() => setIsEditModalOpen(false)}
          onTaskAdded={handleTaskUpdated}
        />
      )}
    </div>
  );
};

export default TaskDetailModal;