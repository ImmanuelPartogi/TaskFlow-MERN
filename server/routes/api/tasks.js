const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../../middleware/auth');
const taskController = require('../../controllers/taskController');

// @route   GET api/tasks/project/:projectId
// @desc    Dapatkan semua task dari project
// @access  Private
router.get('/project/:projectId', auth, taskController.getTasksByProject);

// @route   GET api/tasks/:id
// @desc    Dapatkan task berdasarkan ID
// @access  Private
router.get('/:id', auth, taskController.getTaskById);

// @route   POST api/tasks
// @desc    Buat task baru
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Judul diperlukan').not().isEmpty(),
      check('projectId', 'Project ID diperlukan').not().isEmpty()
    ]
  ],
  taskController.createTask
);

// @route   PUT api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, taskController.updateTask);

// @route   DELETE api/tasks/:id
// @desc    Hapus task
// @access  Private
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;