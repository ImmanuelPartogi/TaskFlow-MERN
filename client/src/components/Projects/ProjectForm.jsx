import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, getProjectById, updateProject } from '../../services/projectService';
import { AuthContext } from '../../contexts/AuthContext';
import Alert from '../common/Alert';
import MemberSelector from './MemberSelector';

const ProjectForm = ({ isEditing }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Jika mode edit, ambil data project
    if (isEditing && projectId) {
      const fetchProject = async () => {
        try {
          setLoading(true);
          const project = await getProjectById(projectId);
          
          // Format data untuk form
          setFormData({
            name: project.name,
            description: project.description || '',
            members: project.members.map(member => member._id)
          });
          
          // Set owner project
          setOwner(project.owner);
          
          setLoading(false);
        } catch (err) {
          setError(err.msg || 'Gagal memuat data project');
          setLoading(false);
        }
      };
      
      fetchProject();
    } else {
      // Jika mode create, set user yang login sebagai owner
      setOwner(user);
    }
  }, [isEditing, projectId, user]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMembersChange = (members) => {
    setFormData({ ...formData, members });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      if (isEditing) {
        // Update project
        await updateProject(projectId, formData);
        setSuccessMessage('Project berhasil diperbarui');
        setTimeout(() => {
          navigate(`/projects/${projectId}`);
        }, 1500);
      } else {
        // Buat project baru
        const newProject = await createProject(formData);
        setSuccessMessage('Project berhasil dibuat');
        setTimeout(() => {
          navigate(`/projects/${newProject._id}`);
        }, 1500);
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.msg || 'Gagal menyimpan project');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Project' : 'Buat Project Baru'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditing 
            ? 'Perbarui informasi project Anda' 
            : 'Mulai kelola tugas Anda dengan membuat project baru'}
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        </div>
      )}

      {successMessage && (
        <div className="mb-6">
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-700">
            {isEditing ? 'Informasi Project' : 'Detail Project Baru'}
          </h2>
        </div>
        
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                Nama Project <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={onChange}
                required
                placeholder="Masukkan nama project"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Deskripsi Project
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                id="description"
                name="description"
                value={formData.description}
                onChange={onChange}
                rows="4"
                placeholder="Masukkan deskripsi project (opsional)"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Deskripsi yang baik membantu anggota tim memahami tujuan project.
              </p>
            </div>
            
            {owner && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anggota Tim
                </label>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <MemberSelector 
                    selectedMembers={formData.members}
                    onChange={handleMembersChange}
                    currentOwner={owner}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              onClick={() => navigate(-1)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Memperbarui...' : 'Menyimpan...'}
                </span>
              ) : (
                isEditing ? 'Perbarui Project' : 'Buat Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;