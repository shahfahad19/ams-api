const express = require('express');
const attendanceController = require('./../controllers/attendanceController');

const router = express.Router();

router.route('/').get(attendanceController.getAllAttendances).post(attendanceController.createAttendance);

router.route('/student-attendance/:studentid').get(attendanceController.getStudentAttendance);

router.route('/subject-attendance/:subject').get(attendanceController.getSubjectAttendance);

router
    .route('/:id')
    .get(attendanceController.getAttendance)
    .patch(attendanceController.updateAttendance)
    .delete(attendanceController.deleteAttendance);

module.exports = router;
