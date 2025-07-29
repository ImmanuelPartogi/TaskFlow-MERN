const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @route   GET api/tasks/project/:projectId
// @desc    Dapatkan semua task dari project
// @access  Private
exports.getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // PERBAIKAN: Cek apakah user adalah owner atau member dari project
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', ['name', 'avatar'])
      .populate('createdBy', ['name', 'avatar'])
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   GET api/tasks/:id
// @desc    Dapatkan task berdasarkan ID
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', ['name', 'avatar'])
      .populate('createdBy', ['name', 'avatar'])
      .populate('project', ['name']);

    if (!task) {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }

    // Cek apakah user memiliki akses ke project
    const project = await Project.findById(task.project);

    // PERBAIKAN: Cek apakah user adalah owner atau member
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   POST api/tasks
// @desc    Buat task baru
// @access  Private
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

    // Cek apakah project ada
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // PERBAIKAN: Cek apakah user memiliki akses ke project
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      project: projectId,
      assignedTo,
      createdBy: req.user.id
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT api/tasks/:id
// @desc    Update task
// @access  Private
exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }

    // Cek apakah user memiliki akses ke project
    const project = await Project.findById(task.project);

    // PERBAIKAN: Cek apakah user adalah owner atau member
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    task.updatedAt = Date.now();

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/tasks/:id
// @desc    Hapus task
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }

    // Cek apakah user memiliki akses ke project
    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // PERBAIKAN: Cek apakah user adalah owner atau member
    const isOwner = project.owner.toString() === req.user.id;
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    await Task.deleteOne({ _id: task._id });

    res.json({ msg: 'Task dihapus' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};