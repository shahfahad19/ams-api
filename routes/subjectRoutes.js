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
        auth.restrictTo('admin', 'student'),
        auth.checkSemesterPermission,
        subjectController.getAllSubjects
    )
    .post(auth.protect, auth.restrictTo('admin'), auth.checkSemesterPermission, subjectController.createSubject);

// Subject CRUD functions
router
    .route('/:id')
    .get(auth.protect, auth.restrictTo('admin', 'student'), auth.checkSubjectPermission, subjectController.getSubject)
    .patch(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.updateSubject)
    .delete(auth.protect, auth.restrictTo('admin'), auth.checkSubjectPermission, subjectController.deleteSubject);

module.exports = router;
