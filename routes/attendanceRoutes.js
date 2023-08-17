const express = require('express');
const attendanceController = require('./../controllers/attendanceController');
const auth = require('../controllers/authController');

const router = express.Router();

// Getting attendance of a subject
// Create option is only for teacher
// Delete option is only for admin
router
    .route('/')
    .get(auth.protect, auth.checkSubjectPermission, attendanceController.getSubjectAttendance)
    .post(auth.protect, auth.restrictTo('teacher'), auth.checkSubjectTeacher, attendanceController.createAttendance);

router
    .route('/:id')
    .get(auth.protect, auth.checkAttendancePermission, attendanceController.getAttendance)
    .delete(
        auth.protect,
        auth.restrictTo('admin', 'super-admin'),
        auth.checkAttendancePermission,
        attendanceController.deleteAttendance
    );

// Getting attendance of a student
router.get('/student/:id', auth.protect, attendanceController.getStudentAttendance);

router.get('/student/:id/subject/:subjectId', auth.protect, attendanceController.getStudentAttendanceForSubject);

module.exports = router;
