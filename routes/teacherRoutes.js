const express = require('express');
const teacherController = require('./../controllers/teacherController');
const subjectController = require('./../controllers/subjectController');
const attendanceController = require('./../controllers/attendanceController');
const teacherAuth = require('./../controllers/authControllers/teacherAuth');

const router = express.Router();

// Account Controls
router.get('/', teacherAuth.protect, teacherController.getTeacher);
router.post('/signup', teacherAuth.signup);
router.post('/login', teacherAuth.login);
router.post('/forgotPassword', teacherAuth.forgotPassword);
router.patch('/resetPassword/:token', teacherAuth.resetPassword);
router.get(
    '/getConfirmationToken',
    teacherAuth.ignoreConfirmation,
    teacherAuth.protect,
    teacherController.getConfirmationToken
);
router.get('/confirmAccount/:token', teacherController.confirmAccount);

router.patch('/updatePassword', teacherAuth.protect, teacherAuth.updatePassword);

router.patch('/updateProfile', teacherAuth.protect, teacherController.updateMe);

router.route('/subject/:id').get(teacherAuth.protect, teacherAuth.checkSubjectPermission, subjectController.getSubject);

router
    .route('/subject/:id/attendance')
    .get(teacherAuth.protect, teacherAuth.checkSubjectPermission, attendanceController.getSubjectAttendance)
    .post(teacherAuth.protect, attendanceController.createAttendance);

module.exports = router;
