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
        console.log(`[API Call] updateTask - ID: ${id}, Data:`, formData);

        // Pastikan data yang dikirim valid
        if (!id) {
            throw new Error('Task ID tidak valid');
        }

        // Buat objek payload untuk request API
        const payload = {};

        // Salin properti yang ada di formData
        if (formData.title) payload.title = formData.title;
        if (formData.description !== undefined) payload.description = formData.description;
        if (formData.status) payload.status = formData.status;
        if (formData.priority) payload.priority = formData.priority;
        if (formData.dueDate) payload.dueDate = formData.dueDate;
        if (formData.assignedTo !== undefined) payload.assignedTo = formData.assignedTo;

        // Pastikan projectId ada jika diberikan
        if (formData.projectId) payload.projectId = formData.projectId;

        // Debugging
        console.log(`[API Request] PUT /tasks/${id}:`, payload);

        const res = await api.put(`/tasks/${id}`, payload);

        // Debugging
        console.log(`[API Response] Status: ${res.status}, Data:`, res.data);

        return res.data;
    } catch (err) {
        console.error('[API Error] updateTask:', err);

        // Tampilkan informasi error yang lebih detail
        const errorMsg = err.response?.data?.msg || err.message || 'Terjadi kesalahan saat memperbarui tugas';
        const errorData = {
            message: errorMsg,
            statusCode: err.response?.status,
            details: err.response?.data
        };

        throw errorData;
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