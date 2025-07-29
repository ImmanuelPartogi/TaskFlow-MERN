const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @route   GET api/projects
// @desc    Dapatkan semua project milik user
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    // Dapatkan ID user dari request
    const userId = req.user.id;

    console.log("Mencari project untuk user ID:", userId);

    // Query untuk mencari project dimana user adalah owner atau member
    // Pastikan membandingkan string dengan string untuk konsistensi
    const projects = await Project.find({
      $or: [
        { owner: userId.toString() },
        { members: { $in: [userId.toString()] } }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ date: -1 });

    console.log(`Ditemukan ${projects.length} project untuk user ID: ${userId}`);

    res.json(projects);
  } catch (err) {
    console.error("Error dalam getProjects:", err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/projects/:id
// @desc    Dapatkan project berdasarkan ID
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', ['name', 'email', 'avatar'])
      .populate('members', ['name', 'email', 'avatar']);

    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // PERBAIKAN: Cara yang benar membandingkan ID owner dan members
    const isOwner = project.owner._id.toString() === req.user.id;
    const isMember = project.members.some(member => member._id.toString() === req.user.id);

    if (!isOwner && !isMember) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   POST api/projects
// @desc    Buat project baru
// @access  Private
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, members } = req.body;

    const newProject = new Project({
      name,
      description,
      owner: req.user.id,
      members: members || []
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT api/projects/:id
// @desc    Update project
// @access  Private
exports.updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // PERBAIKAN: Cek apakah user adalah owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    const { name, description, members } = req.body;

    // Update fields
    project.name = name || project.name;
    project.description = description || project.description;
    if (members) project.members = members;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   PUT api/projects/:id/members
// @desc    Update anggota project
// @access  Private
exports.updateProjectMembers = async (req, res) => {
  try {
    const { members } = req.body;

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    // Cek apakah user adalah owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User tidak diizinkan' });
    }

    project.members = members;
    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/projects/:id
// @desc    Hapus project beserta semua task
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    console.log(`Mencoba menghapus project dengan ID: ${req.params.id}`);

    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log(`Project tidak ditemukan dengan ID: ${req.params.id}`);
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }

    console.log(`Project ditemukan: ${project.name}, owner: ${project.owner}`);
    console.log(`User yang melakukan request: ${req.user.id}`);

    // Cek apakah user adalah owner
    if (project.owner.toString() !== req.user.id) {
      console.log('Otorisasi gagal: User bukan owner project');
      return res.status(401).json({ msg: 'User tidak diizinkan menghapus project ini' });
    }

    // Hapus semua task terkait project
    const deleteTaskResult = await Task.deleteMany({ project: project._id });
    console.log(`Menghapus task terkait project: ${deleteTaskResult.deletedCount} task dihapus`);

    // Hapus project
    await Project.findByIdAndDelete(project._id);
    console.log(`Project berhasil dihapus: ${project.name}`);

    res.json({ msg: 'Project dan semua task terkait berhasil dihapus' });
  } catch (err) {
    console.error(`Error saat menghapus project: ${err.message}`);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project tidak ditemukan' });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};