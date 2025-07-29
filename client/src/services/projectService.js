import api from './api';

// Get all projects
export const getProjects = async () => {
    try {
        console.log("Memanggil API untuk mengambil project...");
        const res = await api.get('/projects');

        // Log data untuk debugging
        console.log(`Menerima ${res.data.length} project dari server`);

        // Filter tambahan di client side jika diperlukan (double check)
        // Hapus jika tidak perlu setelah backend berfungsi dengan benar
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? user.id : null;

        if (userId) {
            const filteredProjects = res.data.filter(project =>
                (project.owner && (typeof project.owner === 'object' ? project.owner._id === userId : project.owner === userId)) ||
                (project.members && project.members.some(member =>
                    typeof member === 'object' ? member._id === userId : member === userId
                ))
            );

            console.log(`Filter client-side: ${filteredProjects.length} project setelah filtering`);
            return filteredProjects;
        }

        return res.data;
    } catch (err) {
        console.error("Error dalam getProjects service:", err);
        if (err.response) {
            console.error("Response error:", err.response.data);
        }
        throw err.response ? err.response.data : { msg: 'Network error' };
    }
};

// Get project by ID
export const getProjectById = async (id) => {
    try {
        const res = await api.get(`/projects/${id}`);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Create project
export const createProject = async (formData) => {
    try {
        const res = await api.post('/projects', formData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Update project
export const updateProject = async (id, formData) => {
    try {
        const res = await api.put(`/projects/${id}`, formData);
        return res.data;
    } catch (err) {
        throw err.response.data;
    }
};

// Delete project
export const deleteProject = async (id) => {
    try {
        console.log(`Mengirim request delete untuk project ID: ${id}`);
        const res = await api.delete(`/projects/${id}`);
        console.log("Response dari server:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error delete project di service:", err);

        // Perbaikan penanganan error
        if (err.response) {
            throw err.response.data;
        } else if (err.request) {
            throw { msg: 'Tidak ada respons dari server' };
        } else {
            throw { msg: 'Terjadi kesalahan saat menghapus project' };
        }
    }
};

// Update project members
export const updateProjectMembers = async (id, members) => {
    try {
        const res = await api.put(`/projects/${id}/members`, { members });
        return res.data;
    } catch (err) {
        throw err.response?.data || { msg: 'Gagal memperbarui anggota project' };
    }
};