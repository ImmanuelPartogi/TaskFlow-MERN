import React, { useState, useEffect, useContext, Fragment, useRef } from 'react';
import { createTask, updateTask } from '../../services/taskService';
import { getProjectById } from '../../services/projectService';
import { NotificationContext } from '../../contexts/NotificationContext';
import UserAvatar from '../common/UserAvatar';

const TaskForm = ({ projectId, task, isEditing, onClose, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: ''
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const memberDropdownRef = useRef(null);
  const titleInputRef = useRef(null);
  const { sendNewTaskNotification, sendUpdateTaskNotification } = useContext(NotificationContext);

  // Handle click outside of member dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus the title input when form opens
  useEffect(() => {
    if (titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, []);

  useEffect(() => {
    // Isi form dengan data task jika mode edit
    if (isEditing && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo ? task.assignedTo._id : ''
      });
    }

    // Ambil data anggota project
    const fetchProjectMembers = async () => {
      try {
        const project = await getProjectById(projectId);
        setProjectMembers([project.owner, ...project.members]);
      } catch (err) {
        console.error('Error fetching project members:', err);
        setError('Gagal memuat anggota tim. Silakan coba lagi.');
      }
    };

    fetchProjectMembers();
  }, [projectId, isEditing, task]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Modified submitForm function that doesn't depend on event object
  const submitForm = async () => {
    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        // Update task
        const updatedTask = await updateTask(task._id, {
          ...formData,
          projectId
        });
        sendUpdateTaskNotification(updatedTask);
      } else {
        // Buat task baru
        const newTask = await createTask({
          ...formData,
          projectId
        });
        sendNewTaskNotification(newTask);
      }
      
      setLoading(false);
      onTaskAdded();
    } catch (err) {
      setError(err.msg || 'Gagal menyimpan tugas');
      setLoading(false);
    }
  };
  
  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'high':
        return {
          label: 'Tinggi',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          ringColor: 'ring-red-500',
          iconColor: 'text-red-500',
          hoverBg: 'hover:bg-red-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2"></span>
        };
      case 'medium':
        return {
          label: 'Sedang',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          ringColor: 'ring-amber-500',
          iconColor: 'text-amber-500',
          hoverBg: 'hover:bg-amber-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2"></span>
        };
      case 'low':
        return {
          label: 'Rendah',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          ringColor: 'ring-emerald-500',
          iconColor: 'text-emerald-500',
          hoverBg: 'hover:bg-emerald-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
        };
      default:
        return {
          label: 'Normal',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          ringColor: 'ring-slate-500',
          iconColor: 'text-slate-500',
          hoverBg: 'hover:bg-slate-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2"></span>
        };
    }
  };
  
  const getStatusConfig = (status) => {
    switch(status) {
      case 'todo':
        return {
          label: 'To Do',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          ringColor: 'ring-slate-500',
          iconColor: 'text-slate-500',
          hoverBg: 'hover:bg-slate-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2"></span>
        };
      case 'in-progress':
        return {
          label: 'In Progress',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          ringColor: 'ring-blue-500',
          iconColor: 'text-blue-500',
          hoverBg: 'hover:bg-blue-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></span>
        };
      case 'review':
        return {
          label: 'Review',
          bgColor: 'bg-violet-50',
          borderColor: 'border-violet-200',
          textColor: 'text-violet-700',
          ringColor: 'ring-violet-500',
          iconColor: 'text-violet-500',
          hoverBg: 'hover:bg-violet-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-violet-500 mr-2"></span>
        };
      case 'done':
        return {
          label: 'Done',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-700',
          ringColor: 'ring-emerald-500',
          iconColor: 'text-emerald-500',
          hoverBg: 'hover:bg-emerald-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>
        };
      default:
        return {
          label: 'To Do',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-700',
          ringColor: 'ring-slate-500',
          iconColor: 'text-slate-500',
          hoverBg: 'hover:bg-slate-100',
          dot: <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-2"></span>
        };
    }
  };
  
  const selectedPriority = getPriorityConfig(formData.priority);
  const selectedStatus = getStatusConfig(formData.status);
  
  const handleAssignedToChange = (memberId) => {
    setFormData({ ...formData, assignedTo: memberId });
    setIsSearchOpen(false);
    setSearchTerm('');
  };
  
  const getSelectedMember = () => {
    if (!formData.assignedTo) return null;
    return projectMembers.find(member => member._id === formData.assignedTo);
  };
  
  const filteredMembers = searchTerm 
    ? projectMembers.filter(member => 
        member.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : projectMembers;
  
  const selectedMember = getSelectedMember();
  
  // Fixed nextStep function
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      submitForm(); // Now calls submitForm instead of onSubmit
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onClose();
    }
  };

  // Define keyboard shortcuts for navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      if (currentStep === 2 && formData.title) {
        submitForm();
      } else if (currentStep === 1 && formData.title) {
        setCurrentStep(2);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/75 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200 transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isEditing ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              {isEditing ? (
                <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <h3 className="ml-3 text-lg font-semibold text-slate-800">
              {isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center mb-4">
            <div className="w-full flex items-center">
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors duration-300 ${currentStep >= 1 ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-slate-300'}`}>
                <span className="text-xs font-medium">1</span>
                {currentStep > 1 && (
                  <svg className="absolute -right-1 -top-1 w-4 h-4 text-white bg-green-500 rounded-full p-0.5 border-2 border-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className={`flex-1 h-1 mx-2 rounded transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-slate-300'}`}>
                <span className="text-xs font-medium">2</span>
              </div>
            </div>
          </div>
          
          <div className="mb-3 text-center">
            <p className="text-sm font-medium text-slate-700">
              {currentStep === 1 ? 'Informasi Dasar' : 'Detail Tambahan'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentStep === 1 
                ? 'Masukkan judul dan informasi penting tugas'
                : 'Atur status, tenggat waktu, dan penugasan'
              }
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mx-6 mt-1 bg-red-50 border-l-4 border-red-500 p-3 rounded-md animate-pulse" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="px-6 py-5">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="title">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  required
                  placeholder="Masukkan judul tugas"
                  ref={titleInputRef}
                />
                <p className="mt-1 text-xs text-slate-500">Masukkan judul yang jelas dan ringkas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="description">
                  Deskripsi
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  rows="4"
                  placeholder="Jelaskan detail tugas ini secara spesifik..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2.5">Prioritas</label>
                <div className="grid grid-cols-3 gap-3">
                  {['low', 'medium', 'high'].map((priority) => {
                    const config = getPriorityConfig(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`flex items-center justify-center px-3 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          formData.priority === priority 
                            ? `${config.bgColor} border-${config.borderColor} ${config.textColor} ring-2 ${config.ringColor} ring-opacity-50 shadow-sm` 
                            : `border-slate-300 ${config.hoverBg} text-slate-700`
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${config.iconColor} mr-2`}>
                          <svg className={`w-3 h-3 ${formData.priority === priority ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="8" r="8" />
                          </svg>
                        </span>
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Additional Details */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2.5">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {['todo', 'in-progress', 'review', 'done'].map((status) => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFormData({ ...formData, status })}
                        className={`flex items-center justify-center px-3 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                          formData.status === status 
                            ? `${config.bgColor} border-${config.borderColor} ${config.textColor} ring-2 ${config.ringColor} ring-opacity-50 shadow-sm` 
                            : `border-slate-300 ${config.hoverBg} text-slate-700`
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${config.iconColor} mr-2`}>
                          <svg className={`w-3 h-3 ${formData.status === status ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="8" cy="8" r="8" />
                          </svg>
                        </span>
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="dueDate">
                  Tenggat Waktu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                    id="dueDate"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={onChange}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">Opsional: Biarkan kosong jika tidak memiliki tenggat waktu</p>
              </div>
              
              <div ref={memberDropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ditugaskan Kepada</label>
                <div className="relative">
                  {selectedMember ? (
                    <div className="flex items-center justify-between border border-slate-300 rounded-lg p-3 bg-white shadow-sm hover:bg-slate-50 transition-colors duration-200">
                      <div className="flex items-center">
                        <UserAvatar user={selectedMember} size="sm" />
                        <span className="ml-3 text-sm font-medium text-slate-700">{selectedMember.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assignedTo: '' })}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full p-1 transition-colors duration-200"
                        aria-label="Remove assigned user"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <Fragment>
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-slate-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-slate-500">Pilih anggota tim</span>
                        </div>
                        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isSearchOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {isSearchOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden transition-all duration-200 animate-slideDown relative">
                          <div className="px-3 py-2 border-b border-slate-200">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-0 focus:ring-0 focus:outline-none text-sm"
                                placeholder="Cari anggota..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {filteredMembers.length > 0 ? (
                              <ul className="py-1">
                                {filteredMembers.map((member) => (
                                  <li key={member._id}>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2.5 text-sm text-left text-slate-700 hover:bg-blue-50 flex items-center transition-colors duration-150"
                                      onClick={() => handleAssignedToChange(member._id)}
                                    >
                                      <UserAvatar user={member} size="sm" />
                                      <span className="ml-3 font-medium">{member.name}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="px-3 py-6 text-center">
                                <svg className="mx-auto h-8 w-8 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="mt-2 text-sm text-slate-500">Tidak ada anggota yang sesuai</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Fragment>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">Opsional: Biarkan kosong jika tidak ditugaskan ke siapapun</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with Buttons */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
          >
            {currentStep === 1 ? 'Batal' : 'Kembali'}
          </button>
          
          <div className="flex items-center space-x-3">
            {/* {currentStep === 2 && (
              <div className="flex items-center space-x-1 mr-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded">Ctrl</kbd>+
                <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-300 rounded">Enter</kbd>
              </div>
            )} */}
            
            <button
              type="button"
              onClick={nextStep}
              disabled={!formData.title || loading}
              className={`px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-600 transition-all duration-200 ${
                !formData.title || loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : currentStep < 2 ? (
                'Selanjutnya'
              ) : (
                isEditing ? 'Perbarui' : 'Simpan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;