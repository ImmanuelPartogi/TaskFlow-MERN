const socketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log('Klien terhubung');

    // Join room berdasarkan project ID
    socket.on('join project', (projectId) => {
      socket.join(projectId);
      console.log(`User bergabung dengan project: ${projectId}`);
    });

    // Kirim notifikasi ketika ada task baru
    socket.on('new task', (task) => {
      socket.to(task.project).emit('task added', task);
    });

    // Kirim notifikasi ketika ada update task
    socket.on('update task', (task) => {
      socket.to(task.project).emit('task updated', task);
    });

    // Kirim notifikasi ketika ada task yang dihapus
    socket.on('delete task', (taskId, projectId) => {
      socket.to(projectId).emit('task deleted', taskId);
    });

    socket.on('disconnect', () => {
      console.log('Klien terputus');
    });
  });
};

module.exports = socketEvents;