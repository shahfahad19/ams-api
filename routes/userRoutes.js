const express = require('express');
const teacherController = require('./../controllers/teacherController');
const studentController = require('./../controllers/studentController');
const departmentController = require('./../controllers/departmentController');

const auth = require('../controllers/authController');

const router = express.Router();

router.route('/department/:id').get(auth.protect, auth.restrictTo('super-admin'), departmentController.getDepartment);

router
    .route('/departments')
    .get(auth.protect, auth.restrictTo('super-admin'), departmentController.getAllDepartments)
    .post(auth.protect, auth.restrictTo('super-admin'), departmentController.createDepartment);

router
    .route('/teachers')
    .get(auth.protect, teacherController.getDepartmentTeachers)
    .post(auth.protect, auth.restrictTo('admin'), teacherController.addTeacher);

router.get('/teachersByDepartments', teacherController.getTeachersByDepartments);

router.get('/students', auth.protect, auth.restrictTo('admin', 'teacher'), studentController.getAllStudents);

module.exports = router;
