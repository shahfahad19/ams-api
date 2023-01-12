const express = require('express');
const studentController = require('./../controllers/studentController');
const subjectController = require('./../controllers/subjectController');
const attendanceController = require('./../controllers/attendanceController');
const studentAuth = require('./../controllers/authControllers/studentAuth');

const router = express.Router();

// Account Controls
router.get('/', studentAuth.protect, studentController.getStudent);
router.post('/signup', studentAuth.signup);
router.post('/login', studentAuth.login);
router.post('/forgotPassword', studentAuth.forgotPassword);
router.patch('/resetPassword/:token', studentAuth.resetPassword);
router.get(
    '/getConfirmationToken',
    studentAuth.ignoreConfirmation,
    studentAuth.protect,
    studentController.getConfirmationToken
);
router.get('/confirmAccount/:token', studentController.confirmAccount);

router.patch('/updatePassword', studentAuth.protect, studentAuth.updatePassword);

router.patch('/updateProfile', studentAuth.protect, studentController.updateMe);

router.route('/subject/:id').get(studentAuth.protect, subjectController.getSubject);

router.route('/attendance').get(studentAuth.protect, attendanceController.getStudentAttendance);

module.exports = router;
