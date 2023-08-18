const express = require('express');
const teacherController = require('./../controllers/teacherController');
const studentController = require('./../controllers/studentController');
const departmentController = require('./../controllers/departmentController');
const userController = require('./../controllers/userController');

const auth = require('../controllers/authController');

const router = express.Router();

router.get('/search', auth.protect, auth.restrictTo('super-admin', 'admin'), userController.getUsers);

router
    .route('/department/:id')
    .get(auth.protect, auth.restrictTo('super-admin'), departmentController.getDepartment)
    .delete(auth.protect, auth.restrictTo('super-admin'), departmentController.deleteDepartment);

router
    .route('/department/:id/updateEmail')
    .patch(auth.protect, auth.restrictTo('super-admin'), departmentController.updateEmail);

router
    .route('/departments')
    .get(auth.protect, auth.restrictTo('super-admin'), departmentController.getAllDepartments)
    .post(auth.protect, auth.restrictTo('super-admin'), departmentController.createDepartment);

router
    .route('/teachers')
    .get(auth.protect, teacherController.getDepartmentTeachers)
    .post(auth.protect, auth.restrictTo('admin'), teacherController.addTeacher);

router.get('/teachersByDepartments', teacherController.getTeachersByDepartments);

router.get(
    '/students',
    auth.protect,
    auth.restrictTo('admin', 'teacher', 'super-admin'),
    studentController.getAllStudents
);

router
    .route('/students/:id')
    .get(auth.protect, auth.restrictTo('admin', 'super-admin'), studentController.getStudent)
    .patch(auth.protect, auth.restrictTo('admin', 'super-admin'), studentController.updateStudent)
    .delete(auth.protect, auth.restrictTo('admin', 'super-admin'), studentController.deleteStudent);

router.get(
    '/teachers/:id',
    auth.protect,
    auth.restrictTo('admin', 'super-admin', 'student'),
    teacherController.getTeacher
);

router.delete('/teachers/:id', auth.protect, auth.restrictTo('admin', 'super-admin'), teacherController.deleteTeacher);
router.patch(
    '/teachers/:id',
    auth.protect,
    auth.restrictTo('admin', 'super-admin'),
    teacherController.updateTeacherDesignation
);

module.exports = router;
