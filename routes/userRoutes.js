const express = require('express');
const teacherController = require('./../controllers/teacherController');
const studentController = require('./../controllers/studentController');
const auth = require('../controllers/authController');

const router = express.Router();
router.get('/teachers', auth.protect, auth.restrictTo('admin'), teacherController.getAllTeachers);

router.get(
    '/students',
    auth.protect,
    auth.restrictTo('admin', 'teacher'),
    auth.checkBatchPermission,
    studentController.getAllStudents
);

module.exports = router;
