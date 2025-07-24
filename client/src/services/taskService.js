import api from './api';

// Get tasks by project ID
export const getTasksByProject = async (projectId) => {
    try {
        const res = await api.get(`/tasks/project/${projectId}`);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Get task by ID
export const getTaskById = async (id) => {
    try {
        const res = await api.get(`/tasks/${id}`);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Create task
export const createTask = async (formData) => {
    try {
        const res = await api.post('/tasks', formData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Update task
export const updateTask = async (id, formData) => {
    try {
        const res = await api.put(`/tasks/${id}`, formData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Delete task
export const deleteTask = async (id) => {
    try {
        const res = await api.delete(`/tasks/${id}`);
        return res.data;
    } catch (err) {
        console.error('Error deleting task:', err);
        throw err.response?.data || { msg: 'Terjadi kesalahan saat menghapus tugas' };
    }
};