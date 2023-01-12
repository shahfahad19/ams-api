const express = require('express');
const batchController = require('./../controllers/batchController');
const adminController = require('./../controllers/adminController');
const semesterController = require('./../controllers/semesterController');
const studentController = require('./../controllers/studentController');
const teacherController = require('./../controllers/teacherController');
const subjectController = require('./../controllers/subjectController');
const attendanceController = require('./../controllers/attendanceController');
const adminAuth = require('./../controllers/authControllers/adminAuth');

/*
-------------FUNCTIONS IN batchController
List of all batches              /batches                    getAllBatches
CRUD Batch                       /batch/:id                  createBatch, getBatch, updateBatch, deleteBatch

-------------FUNCTIONS IN semesterController
Semesters in a batch             /semesters?batchId=?        getSemesters
CRUD Semester                    /semester/:id               createSemester, getSemester, updateSemester, deleteSemester

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
router.get('/', adminAuth.protect, adminController.getAdmin);
router.post('/signup', adminAuth.signup);
router.post('/login', adminAuth.login);
router.post('/forgotPassword', adminAuth.forgotPassword);
router.patch('/resetPassword/:token', adminAuth.resetPassword);
router.get(
    '/getConfirmationToken',
    adminAuth.ignoreConfirmation,
    adminAuth.protect,
    adminController.getConfirmationToken
);
router.get('/confirmAccount/:token', adminAuth.confrimAccount);

// router.patch('/updateMyPassword', adminAuth.protect, adminAuth.updatePassword);

// router.patch('/updateMe', adminAuth.protect, adminController.updateMe);
// router.delete('/deleteMe', adminAuth.protect, adminController.deleteMe);

// Getting list of batches and creating a batch
router
    .route('/batches')
    .get(adminAuth.protect, batchController.getAllBatches)
    .post(adminAuth.protect, batchController.createBatch);

router
    .route('/batch/:id')
    .get(adminAuth.protect, adminAuth.checkBatchPermission, batchController.getBatch)
    .patch(adminAuth.protect, adminAuth.checkBatchPermission, batchController.updateBatch)
    .delete(adminAuth.protect, adminAuth.checkBatchPermission, batchController.deleteBatch);

// SEMESTERS
router
    .route('/batch/:id/semesters')
    .get(adminAuth.protect, adminAuth.checkBatchPermission, semesterController.getAllSemesters)
    .post(adminAuth.protect, adminAuth.checkBatchPermission, semesterController.createSemester);

router
    .route('/semester/:id')
    .get(adminAuth.protect, adminAuth.checkSemesterPermission, semesterController.getSemester)
    .patch(adminAuth.protect, adminAuth.checkSemesterPermission, semesterController.updateSemester)
    .delete(adminAuth.protect, adminAuth.checkSemesterPermission, semesterController.deleteSemester);

router
    .route('/semester/:id/subjects')
    .get(adminAuth.protect, adminAuth.checkSemesterPermission, subjectController.getAllSubjects)
    .post(adminAuth.protect, adminAuth.checkSemesterPermission, subjectController.createSubject);

router
    .route('/subject/:id')
    .get(adminAuth.protect, adminAuth.checkSubjectPermission, subjectController.getSubject)
    .patch(adminAuth.protect, adminAuth.checkSubjectPermission, subjectController.updateSubject)
    .delete(adminAuth.protect, adminAuth.checkSubjectPermission, subjectController.deleteSubject);

module.exports = router;
