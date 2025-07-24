const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const projectController = require('../../controllers/projectController');

// @route   GET api/projects
// @desc    Dapatkan semua project milik user
// @access  Private
router.get('/', auth, projectController.getProjects);

// @route   GET api/projects/:id
// @desc    Dapatkan project berdasarkan ID
// @access  Private
router.get('/:id', auth, projectController.getProjectById);

// @route   POST api/projects
// @desc    Buat project baru
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('name', 'Nama diperlukan').not().isEmpty()
    ]
  ],
  projectController.createProject
);

// @route   PUT api/projects/:id
// @desc    Update project
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('name', 'Nama diperlukan').not().isEmpty()
    ]
  ],
  projectController.updateProject
);

// @route   DELETE api/projects/:id
// @desc    Hapus project
// @access  Private
router.delete('/:id', auth, projectController.deleteProject);

// @route   PUT api/projects/:id/members
// @desc    Update anggota project
// @access  Private
router.put(
  '/:id/members',
  auth,
  projectController.updateProjectMembers
);

module.exports = router;