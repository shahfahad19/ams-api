const express = require('express');
const batchController = require('./../controllers/batchController');
const studentController = require('./../controllers/studentController');
const teacherController = require('./../controllers/teacherController');
const subjectController = require('./../controllers/subjectController');
const attendanceController = require('./../controllers/attendanceController');
const adminAuth = require('./../controllers/authControllers/adminAuth');

/*
-------------FUNCTIONS IN batchController
List of all batches              /batches                    getAllBatches
Update, Delete Batch             /batch/id                   updateBatch, deleteBatch

-------------FUNCTIONS IN semesterController
Semesters in a batch             /semesters?batchId=?        getSemesters

-------------FUNCTIONS IN semesterController
Semster Update, Delete           /semester/:id               getSemester

-------------FUNCTIONS IN subjectsController
Subjects in semester             /subjects/?semId=?          getSubjects

-------------FUNCTIONS IN attendanceController
All Attendances of A Subject     /attendances?subjectId=?    getSubejctAttendances
View attendance of a Date        /attendance?attId=?         getAttendance
Attendance of a Student          /attendance?studentId=?     getAttendanceOfStudent
Attendance of a Subject          /attendance?subjectId=?     getAttendanceOfSubject
Delete Attendance                /attenance/:id              deleteAttendance

-------------FUCTIONS IN studentController
Student List in Batch           /students?batchId=?          getStudentsInBatch


*/

const router = express.Router();

// Account Controls
router.post('/signup', adminAuth.signup);
router.post('/login', adminAuth.login);
router.post('/forgotPassword', adminAuth.forgotPassword);
router.patch('/resetPassword/:token', adminAuth.resetPassword);
router.get('/confirmAccount/:token', adminAuth.protect, adminAuth.confrimAccount);

// router.patch('/updateMyPassword', adminAuth.protect, adminAuth.updatePassword);

// router.patch('/updateMe', adminAuth.protect, adminController.updateMe);
// router.delete('/deleteMe', adminAuth.protect, adminController.deleteMe);

router
    .route('/batches')
    .get(adminAuth.protect, batchController.getAllBatches)
    .post(adminAuth.protect, batchController.createBatch);

router
    .route('/batch/:id')
    .get(adminAuth.protect, batchController.getBatch)
    .patch(adminAuth.protect, batchController.updateBatch)
    .delete(adminAuth.protect, batchController.deleteBatch);

module.exports = router;
