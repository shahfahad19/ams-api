const express = require('express');
const subjectController = require('../controllers/subjectController');
const auth = require('../controllers/authController');

const router = express.Router();

// Subjects in a semester
// url = /subjects?semester=123456789
router
    .route('/')
    .get(
        auth.protect,
        auth.restrictTo('admin', 'teacher', 'student'),
        auth.checkSemesterPermission,
        subjectController.getAllSubjects
    )
    .post(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, subjectController.createSubject);

// Get teacher subjects
router
    .route('/get/teacher-subjects')
    .get(auth.protect, auth.restrictTo('teacher'), subjectController.getTeacherSubjects);

// Subject CRUD functions
router
    .route('/:id')
    .get(auth.protect, subjectController.getSubject)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.updateSubject)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.deleteSubject);

module.exports = router;
