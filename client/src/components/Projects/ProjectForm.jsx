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
      } else {
        // Buat project baru
        const newProject = await createProject(formData);
        navigate(`/projects/${newProject._id}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Project' : 'Buat Project Baru'}
        </h1>
      </div>

      {error && (
        <div className="mb-4">
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
              Nama Project
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
              Deskripsi
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="4"
            ></textarea>
          </div>
          
          {/* Implementasi fitur untuk menambahkan anggota */}
          {owner && (
            <div className="mb-6">
              <MemberSelector 
                selectedMembers={formData.members}
                onChange={handleMembersChange}
                currentOwner={owner}
              />
            </div>
          )}
          
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              onClick={() => navigate(-1)}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;